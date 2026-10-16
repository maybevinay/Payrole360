import { Router, Response } from 'express';
import { db } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// Number to Indian Words converter
function convertNumberToWords(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += Number(n[4]) !== 0 ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += Number(n[5]) !== 0 ? (str !== '' ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupees Only' : 'Rupees Only';
  return str.trim();
}

// GET all payslips (filtered for employee)
router.get('/', (req: AuthRequest, res: Response) => {
  const isEmployee = req.user?.role === 'EMPLOYEE';
  const empId = req.user?.employeeId || 'EMP-1001';

  let payrollQuery = `
    SELECT ep.*, pr.period, pr.pay_date, pr.status as payrun_status,
           e.name as employee_name, e.department, e.job_title
    FROM employee_payrolls ep
    JOIN pay_runs pr ON ep.pay_run_id = pr.id
    JOIN employees e ON ep.employee_id = e.id
  `;

  let rows: any[];
  if (isEmployee) {
    payrollQuery += ' WHERE ep.employee_id = ? ORDER BY pr.pay_date DESC';
    rows = db.prepare(payrollQuery).all(empId) as any[];
  } else {
    payrollQuery += ' ORDER BY pr.pay_date DESC';
    rows = db.prepare(payrollQuery).all() as any[];
  }

  const payslips = rows.map((r) => ({
    id: `PS-${r.period.replace(/\s+/g, '')}-${r.employee_id}`,
    payRunId: r.pay_run_id,
    employeeId: r.employee_id,
    employeeName: r.employee_name,
    department: r.department,
    jobTitle: r.job_title,
    period: r.period,
    payDate: r.pay_date,
    grossPay: r.gross,
    totalDeductions: r.total_deductions,
    netPay: r.net_pay,
    status: r.status,
  }));

  return res.json({
    success: true,
    data: payslips,
  });
});

// GET detailed individual payslip
router.get('/:id', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const isEmployee = req.user?.role === 'EMPLOYEE';
  const currentUserEmpId = req.user?.employeeId || 'EMP-1001';

  // ID may be payslip code or payroll ID
  let row = db.prepare(`
    SELECT ep.*, pr.period, pr.pay_date,
           e.name as employee_name, e.department, e.job_title, e.pan_number,
           e.pf_number, e.uan, e.bank_account, e.bank_ifsc, e.bank_name,
           e.joined_date, e.location
    FROM employee_payrolls ep
    JOIN pay_runs pr ON ep.pay_run_id = pr.id
    JOIN employees e ON ep.employee_id = e.id
    WHERE ep.id = ? OR ('PS-' || REPLACE(pr.period, ' ', '') || '-' || ep.employee_id) = ?
    LIMIT 1
  `).get(id, id) as any;

  if (!row) {
    // Fallback: search by employeeId in latest payroll
    row = db.prepare(`
      SELECT ep.*, pr.period, pr.pay_date,
             e.name as employee_name, e.department, e.job_title, e.pan_number,
             e.pf_number, e.uan, e.bank_account, e.bank_ifsc, e.bank_name,
             e.joined_date, e.location
      FROM employee_payrolls ep
      JOIN pay_runs pr ON ep.pay_run_id = pr.id
      JOIN employees e ON ep.employee_id = e.id
      WHERE ep.employee_id = ?
      ORDER BY pr.pay_date DESC
      LIMIT 1
    `).get(id) as any;
  }

  if (!row) {
    return res.status(404).json({ success: false, error: { message: 'Payslip not found.' } });
  }

  // Enforce Employee Isolation: cannot access other employee's payslip
  if (isEmployee && row.employee_id !== currentUserEmpId) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You are not authorized to view another employee’s payslip.' },
    });
  }

  const payslipDetail = {
    id: `PS-${row.period.replace(/\s+/g, '')}-${row.employee_id}`,
    payRunId: row.pay_run_id,
    employeeId: row.employee_id,
    period: row.period,
    payDate: row.pay_date,
    generationDate: row.pay_date,
    employeeSnapshot: {
      name: row.employee_name,
      employeeId: row.employee_id,
      jobTitle: row.job_title,
      department: row.department,
      joinedDate: row.joined_date,
      pan: row.pan_number || 'ABCPS1234D',
      pfNumber: row.pf_number || 'PF/0019283/001',
      uan: row.uan || '100918273645',
      bankName: row.bank_name || 'HDFC Bank Ltd',
      accountNumber: row.bank_account || '••••••••9283',
      ifscCode: row.bank_ifsc || 'HDFC0000456',
      location: row.location || 'Bengaluru',
    },
    attendanceSnapshot: {
      totalDays: row.total_working_days + row.lwp_days,
      workedDays: row.worked_days,
      paidLeaves: 0,
      unpaidLeaves: row.lwp_days,
    },
    earnings: [
      { name: 'Basic Salary', amount: row.basic },
      { name: 'House Rent Allowance (HRA)', amount: row.hra },
      { name: 'Transport Allowance', amount: row.transport },
      { name: 'Special Allowance', amount: row.special },
      ...(row.overtime > 0 ? [{ name: 'Overtime Pay', amount: row.overtime }] : []),
    ],
    deductions: [
      { name: 'Provident Fund (PF)', amount: row.pf },
      { name: 'Professional Tax (PT)', amount: row.pt },
      { name: 'Tax Deducted at Source (TDS)', amount: row.tds },
      ...(row.lwp_deduction > 0 ? [{ name: 'Loss of Pay (LWP)', amount: row.lwp_deduction }] : []),
    ],
    grossPay: row.gross,
    totalDeductions: row.total_deductions,
    netPay: row.net_pay,
    netPayInWords: convertNumberToWords(row.net_pay),
  };

  return res.json({
    success: true,
    data: payslipDetail,
  });
});

export default router;
