import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { AuthRequest, authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// Protect all admin endpoints: requires valid JWT and ADMIN role
router.use(authMiddleware);
router.use(requireRole('ADMIN'));

// List all users
router.get('/users', (_req: AuthRequest, res: Response) => {
  const users = db.prepare(`
    SELECT id, email, name, role, status, employee_id, phone, department, job_title, created_at
    FROM users
    ORDER BY created_at DESC
  `).all();

  return res.json({
    success: true,
    data: users,
  });
});

// Update user account status (e.g., SUSPENDED, ACTIVE, REJECTED)
router.patch('/users/:id/status', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  const validStatuses = ['PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'SUSPENDED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_STATUS', message: `Status must be one of: ${validStatuses.join(', ')}` },
    });
  }

  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(id) as any;
  if (!user) {
    return res.status(404).json({ success: false, error: { message: 'User not found' } });
  }

  db.prepare(`
    UPDATE users
    SET status = ?, rejection_reason = ?
    WHERE id = ?
  `).run(status, reason || null, id);

  // Log audit event
  try {
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_name, action, resource_type, resource_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `log-${Date.now()}`,
      req.user!.id,
      req.user!.name,
      'USER_STATUS_CHANGE',
      'User',
      id,
      JSON.stringify({ targetUser: user.email, newStatus: status, reason })
    );
  } catch {
    // Non-blocking
  }

  return res.json({
    success: true,
    message: `User status successfully updated to ${status}.`,
    data: { id, status },
  });
});

// Create new HR user directly
router.post('/hr-users', (req: AuthRequest, res: Response) => {
  const { name, email, password, department = 'HR', jobTitle = 'HR Manager', phone = '' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Name, email, and password are required.' },
    });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({
      success: false,
      error: { code: 'EMAIL_EXISTS', message: 'User with this email already exists.' },
    });
  }

  const id = `usr-hr-${Date.now()}`;
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, status, employee_id, phone, department, job_title)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, email.trim().toLowerCase(), passwordHash, name.trim(), 'HR', 'ACTIVE', null, phone, department, jobTitle);

  return res.status(201).json({
    success: true,
    message: 'HR Account created successfully.',
    data: { id, email, name, role: 'HR', status: 'ACTIVE' },
  });
});

// Admin Analytics Overview
router.get('/analytics', (_req: AuthRequest, res: Response) => {
  const totalUsers = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
  const activeUsers = (db.prepare("SELECT COUNT(*) as c FROM users WHERE status = 'ACTIVE'").get() as any).c;
  const pendingUsers = (db.prepare("SELECT COUNT(*) as c FROM users WHERE status = 'PENDING_APPROVAL'").get() as any).c;
  const suspendedUsers = (db.prepare("SELECT COUNT(*) as c FROM users WHERE status = 'SUSPENDED'").get() as any).c;

  const totalEmployees = (db.prepare('SELECT COUNT(*) as c FROM employees').get() as any).c;
  const totalPayroll = (db.prepare("SELECT SUM(total_net) as s FROM pay_runs WHERE status = 'Paid'").get() as any).s || 0;

  const departmentCounts = db.prepare(`
    SELECT department, COUNT(*) as count
    FROM employees
    GROUP BY department
  `).all();

  const roleDistribution = db.prepare(`
    SELECT role, COUNT(*) as count
    FROM users
    GROUP BY role
  `).all();

  return res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      totalEmployees,
      totalPayroll,
      departmentCounts,
      roleDistribution,
      systemHealth: {
        database: 'Operational',
        uptime: process.uptime(),
        nodeVersion: process.version,
      },
    },
  });
});

// System Audit Logs
router.get('/logs', (_req: AuthRequest, res: Response) => {
  const logs = db.prepare(`
    SELECT id, actor_id, actor_name, action, resource_type, resource_id, details, ip_address, created_at
    FROM audit_logs
    ORDER BY created_at DESC
    LIMIT 100
  `).all();

  return res.json({
    success: true,
    data: logs,
  });
});

export default router;
