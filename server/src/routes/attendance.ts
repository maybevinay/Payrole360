import { Router, Response } from 'express';
import { db } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Helper to format 12-hour time string
function getCurrentTimeString(): string {
  const d = new Date();
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = hours < 10 ? '0' + hours : hours;
  const strMinutes = minutes < 10 ? '0' + minutes : minutes;
  return `${strHours}:${strMinutes} ${ampm}`;
}

// GET attendance list (HR/Admin sees all, Employee sees own)
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  let rows: any[];

  if (req.user?.role === 'EMPLOYEE') {
    const empId = req.user.employeeId || 'EMP-1001';
    rows = db.prepare('SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC').all(empId) as any[];
  } else {
    rows = db.prepare('SELECT * FROM attendance ORDER BY date DESC').all() as any[];
  }

  const attendance = rows.map((r) => ({
    id: r.id,
    employeeId: r.employee_id,
    date: r.date,
    checkIn: r.check_in,
    checkOut: r.check_out,
    workedHours: r.worked_hours,
    overtimeHours: r.overtime_hours,
    status: r.status,
    notes: r.notes,
  }));

  return res.json(attendance);
});

// GET personal attendance records
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const empId = req.user?.employeeId || 'EMP-1001';
  const rows = db.prepare('SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC').all(empId) as any[];

  const records = rows.map((r) => ({
    id: r.id,
    employeeId: r.employee_id,
    date: r.date,
    checkIn: r.check_in,
    checkOut: r.check_out,
    workedHours: r.worked_hours,
    overtimeHours: r.overtime_hours,
    status: r.status,
    notes: r.notes,
  }));

  return res.json({
    success: true,
    data: records,
  });
});

// POST Check-In
router.post('/check-in', authMiddleware, (req: AuthRequest, res: Response) => {
  const empId = req.body.employeeId || req.user?.employeeId || 'EMP-1001';
  const today = req.body.date || new Date().toISOString().split('T')[0];
  const timeNow = req.body.checkIn || getCurrentTimeString();

  // Check if late (e.g., after 09:30 AM)
  const isLate = timeNow.includes('AM') && parseInt(timeNow.split(':')[0], 10) === 9 && parseInt(timeNow.split(':')[1], 10) > 30;
  const status = req.body.status || (isLate ? 'Late' : 'Present');

  const existing = db.prepare('SELECT id FROM attendance WHERE employee_id = ? AND date = ?').get(empId, today) as any;

  if (existing) {
    db.prepare(`
      UPDATE attendance
      SET check_in = ?, status = ?
      WHERE id = ?
    `).run(timeNow, status, existing.id);
  } else {
    const id = `att-${Date.now()}`;
    db.prepare(`
      INSERT INTO attendance (id, employee_id, date, check_in, check_out, worked_hours, overtime_hours, status)
      VALUES (?, ?, ?, ?, '--:--', 0, 0, ?)
    `).run(id, empId, today, timeNow, status);
  }

  return res.json({
    success: true,
    message: `Checked in successfully at ${timeNow}`,
    data: { employeeId: empId, date: today, checkIn: timeNow, status },
  });
});

// POST Check-Out
router.post('/check-out', authMiddleware, (req: AuthRequest, res: Response) => {
  const empId = req.body.employeeId || req.user?.employeeId || 'EMP-1001';
  const today = req.body.date || new Date().toISOString().split('T')[0];
  const timeNow = req.body.checkOut || getCurrentTimeString();

  const record = db.prepare('SELECT * FROM attendance WHERE employee_id = ? AND date = ?').get(empId, today) as any;

  const workedHours = 8.5; // Standard daily shift
  const overtimeHours = 0.5;

  if (record) {
    db.prepare(`
      UPDATE attendance
      SET check_out = ?, worked_hours = ?, overtime_hours = ?
      WHERE id = ?
    `).run(timeNow, workedHours, overtimeHours, record.id);
  } else {
    const id = `att-${Date.now()}`;
    db.prepare(`
      INSERT INTO attendance (id, employee_id, date, check_in, check_out, worked_hours, overtime_hours, status)
      VALUES (?, ?, ?, '09:00 AM', ?, ?, ?, 'Present')
    `).run(id, empId, today, timeNow, workedHours, overtimeHours);
  }

  return res.json({
    success: true,
    message: `Checked out successfully at ${timeNow}. Worked: ${workedHours} hrs.`,
    data: { employeeId: empId, date: today, checkOut: timeNow, workedHours, overtimeHours },
  });
});

// PATCH Reconcile (HR adjustment)
router.patch('/:id/reconcile', authMiddleware, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, checkIn, checkOut, workedHours = 8.0 } = req.body;

  db.prepare(`
    UPDATE attendance
    SET status = ?, check_in = ?, check_out = ?, worked_hours = ?
    WHERE id = ?
  `).run(status, checkIn, checkOut, workedHours, id);

  return res.json({ success: true, id, status, workedHours });
});

export default router;
