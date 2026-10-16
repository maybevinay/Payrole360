import { Router, Response } from 'express';
import { db } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET all time off requests & balances
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  let requestRows: any[];

  if (req.user?.role === 'EMPLOYEE') {
    const empId = req.user.employeeId || 'EMP-1001';
    requestRows = db.prepare('SELECT * FROM time_off_requests WHERE employee_id = ? ORDER BY applied_on DESC').all(empId) as any[];
  } else {
    requestRows = db.prepare('SELECT * FROM time_off_requests ORDER BY applied_on DESC').all() as any[];
  }

  const balanceRows = db.prepare('SELECT * FROM leave_balances').all() as any[];

  const requests = requestRows.map((r) => ({
    id: r.id,
    employeeId: r.employee_id,
    leaveType: r.leave_type,
    startDate: r.start_date,
    endDate: r.end_date,
    days: r.days,
    reason: r.reason,
    status: r.status,
    approver: r.approver,
    rejectionNote: r.rejection_note,
    appliedOn: r.applied_on,
  }));

  const balances: Record<string, any> = {};
  for (const b of balanceRows) {
    balances[b.employee_id] = {
      casual: { total: b.casual_total, used: b.casual_used },
      sick: { total: b.sick_total, used: b.sick_used },
      earned: { total: b.earned_total, used: b.earned_used },
      unpaidLwpDays: b.unpaid_lwp_days,
    };
  }

  return res.json({ requests, balances, success: true, data: { requests, balances } });
});

// GET balances for current user or specific employee
router.get('/balances', authMiddleware, (req: AuthRequest, res: Response) => {
  const empId = (req.query.employeeId as string) || req.user?.employeeId || 'EMP-1001';
  const row = db.prepare('SELECT * FROM leave_balances WHERE employee_id = ?').get(empId) as any;

  const data = row
    ? {
        casual: { total: row.casual_total, used: row.casual_used },
        sick: { total: row.sick_total, used: row.sick_used },
        earned: { total: row.earned_total, used: row.earned_used },
        unpaidLwpDays: row.unpaid_lwp_days,
      }
    : {
        casual: { total: 12, used: 0 },
        sick: { total: 10, used: 0 },
        earned: { total: 18, used: 0 },
        unpaidLwpDays: 0,
      };

  return res.json({ success: true, data });
});

function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateLeaveDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);
  const start = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;

  let workingDays = 0;
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  if (workingDays === 0) {
    const diffTime = end.getTime() - start.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  return workingDays;
}

// Handler for submitting leave request
function handleCreateLeaveRequest(req: AuthRequest, res: Response) {
  const employeeId = req.body.employeeId || req.user?.employeeId || 'EMP-1001';
  const { leaveType, startDate, endDate, days, reason, approver } = req.body;

  if (!leaveType || !startDate || !endDate) {
    return res.status(400).json({ success: false, error: { message: 'Missing required leave fields' } });
  }

  // Prevent applying on previous dates
  const today = getTodayDateString();
  if (startDate < today) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'PAST_DATE_NOT_ALLOWED',
        message: 'Leave cannot be applied for past dates. Please select today or a future date.',
      },
    });
  }

  // Validate end date not before start date
  if (endDate < startDate) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_DATE_RANGE',
        message: 'End date cannot be prior to start date.',
      },
    });
  }

  // Calculate working days accurately
  const computedDays = calculateLeaveDays(startDate, endDate);
  const finalDays = Number(days) > 0 ? Number(days) : computedDays;

  // Validate quota balance
  const balanceRow = db.prepare('SELECT * FROM leave_balances WHERE employee_id = ?').get(employeeId) as any;
  if (balanceRow) {
    let availableQuota = 0;
    if (leaveType === 'Casual Leave') availableQuota = balanceRow.casual_total - balanceRow.casual_used;
    else if (leaveType === 'Sick Leave') availableQuota = balanceRow.sick_total - balanceRow.sick_used;
    else if (leaveType === 'Earned Leave') availableQuota = balanceRow.earned_total - balanceRow.earned_used;
    else if (leaveType === 'Unpaid Leave (LWP)') availableQuota = 999;

    if (leaveType !== 'Unpaid Leave (LWP)' && finalDays > availableQuota) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_LEAVE_BALANCE',
          message: `Insufficient ${leaveType} balance. You have ${availableQuota} day(s) remaining, but requested ${finalDays} day(s). You may apply for Unpaid Leave (LWP) instead.`,
        },
      });
    }
  }

  const id = `LEAVE-REQ-${Date.now().toString().slice(-4)}`;
  const appliedOn = today;

  db.prepare(`
    INSERT INTO time_off_requests (
      id, employee_id, leave_type, start_date, end_date,
      days, reason, status, approver, applied_on
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?)
  `).run(id, employeeId, leaveType, startDate, endDate, finalDays, reason || '', approver || 'Management', appliedOn);

  return res.status(201).json({
    success: true,
    message: 'Leave request submitted successfully.',
    id,
    employeeId,
    leaveType,
    startDate,
    endDate,
    days: finalDays,
    status: 'Pending',
    data: { id, status: 'Pending', days: finalDays },
  });
}

router.post('/', authMiddleware, handleCreateLeaveRequest);
router.post('/request', authMiddleware, handleCreateLeaveRequest);

// Handler for status update
function handleStatusUpdate(req: AuthRequest, res: Response, targetStatus: string, reason?: string) {
  const { id } = req.params;
  const status = targetStatus;

  const request = db.prepare('SELECT * FROM time_off_requests WHERE id = ?').get(id) as any;
  if (!request) {
    return res.status(404).json({ success: false, error: { message: 'Request not found' } });
  }

  db.prepare('UPDATE time_off_requests SET status = ?, rejection_note = ? WHERE id = ?').run(status, reason || null, id);

  if (status === 'Approved') {
    const empId = request.employee_id;
    const days = request.days;

    if (request.leave_type === 'Casual Leave') {
      db.prepare('UPDATE leave_balances SET casual_used = casual_used + ? WHERE employee_id = ?').run(days, empId);
    } else if (request.leave_type === 'Sick Leave') {
      db.prepare('UPDATE leave_balances SET sick_used = sick_used + ? WHERE employee_id = ?').run(days, empId);
    } else if (request.leave_type === 'Earned Leave') {
      db.prepare('UPDATE leave_balances SET earned_used = earned_used + ? WHERE employee_id = ?').run(days, empId);
    } else if (request.leave_type === 'Unpaid Leave (LWP)') {
      db.prepare('UPDATE leave_balances SET unpaid_lwp_days = unpaid_lwp_days + ? WHERE employee_id = ?').run(days, empId);

      // Recalculate in active Draft pay run
      const draftRun = db.prepare("SELECT id FROM pay_runs WHERE status IN ('Draft', 'Computed') ORDER BY start_date DESC LIMIT 1").get() as any;
      if (draftRun) {
        const payroll = db.prepare('SELECT * FROM employee_payrolls WHERE pay_run_id = ? AND employee_id = ?').get(draftRun.id, empId) as any;
        if (payroll) {
          const newLwp = payroll.lwp_days + days;
          const newWorked = Math.max(0, payroll.total_working_days - newLwp);
          const lwpDeduction = Math.round((payroll.gross / payroll.total_working_days) * newLwp);
          const totalDeductions = payroll.pf + payroll.pt + payroll.tds + lwpDeduction;
          const netPay = payroll.gross - totalDeductions;

          db.prepare(`
            UPDATE employee_payrolls
            SET lwp_days = ?, worked_days = ?, lwp_deduction = ?, total_deductions = ?, net_pay = ?
            WHERE id = ?
          `).run(newLwp, newWorked, lwpDeduction, totalDeductions, netPay, payroll.id);

          const totals = db.prepare(`
            SELECT SUM(net_pay) as total_net, SUM(total_deductions) as total_deductions
            FROM employee_payrolls WHERE pay_run_id = ?
          `).get(draftRun.id) as any;

          db.prepare(`
            UPDATE pay_runs
            SET total_net = ?, total_deductions = ?
            WHERE id = ?
          `).run(totals.total_net, totals.total_deductions, draftRun.id);
        }
      }
    }
  }

  return res.json({ success: true, id, status });
}

router.patch('/:id/status', authMiddleware, (req: AuthRequest, res: Response) => {
  handleStatusUpdate(req, res, req.body.status, req.body.reason);
});

router.patch('/:id/approve', authMiddleware, (req: AuthRequest, res: Response) => {
  handleStatusUpdate(req, res, 'Approved');
});

router.patch('/:id/reject', authMiddleware, (req: AuthRequest, res: Response) => {
  handleStatusUpdate(req, res, 'Refused', req.body.reason);
});

export default router;
