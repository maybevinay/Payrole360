import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { JWT_SECRET, AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

// Login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' },
    });
  }

  const rawInput = email.trim().toLowerCase();
  // Match exact email or username prefix (e.g., 'admin' -> 'admin@payroll360.internal')
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(rawInput) as any;
  if (!user && !rawInput.includes('@')) {
    user = db.prepare("SELECT * FROM users WHERE email LIKE ? || '@%' ORDER BY id ASC LIMIT 1").get(rawInput) as any;
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: `No account found for "${email}". Check your spelling or click one of the Quick Test Personas below.`,
      },
    });
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_PASSWORD',
        message: 'Invalid password. Please verify your credentials and try again.',
      },
    });
  }

  // Account Status Check
  if (user.status === 'PENDING_APPROVAL') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'ACCOUNT_PENDING_APPROVAL',
        message: 'Your account is awaiting HR approval. Access to the portal is restricted until reviewed by an HR administrator.',
      },
    });
  }

  if (user.status === 'REJECTED') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'ACCOUNT_REJECTED',
        message: user.rejection_reason
          ? `Your registration was not approved: ${user.rejection_reason}. Please contact HR.`
          : 'Your registration was not approved. Please contact HR.',
      },
    });
  }

  if (user.status === 'SUSPENDED') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'ACCOUNT_SUSPENDED',
        message: 'Your account has been suspended. Please contact HR administrator.',
      },
    });
  }

  // ACTIVE User - Generate JWT
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    name: user.name,
    employeeId: user.employee_id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  // Update audit log
  try {
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_name, action, resource_type, resource_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `log-${Date.now()}`,
      user.id,
      user.name,
      'USER_LOGIN',
      'User',
      user.id,
      JSON.stringify({ role: user.role, email: user.email })
    );
  } catch (err) {
    // Audit failure shouldn't block login
  }

  return res.json({
    success: true,
    message: 'Authentication successful',
    token,
    user: payload,
  });
});

// Register (Employee self-service registration - Creates PENDING_APPROVAL)
router.post('/register', (req: Request, res: Response) => {
  const {
    name,
    email,
    password,
    phone = '',
    department = 'Engineering',
    jobTitle = 'Associate',
    dateOfBirth = '',
    address = '',
  } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Name, email, and password are required fields.' },
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 6 characters long.' },
    });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({
      success: false,
      error: { code: 'EMAIL_EXISTS', message: 'An account with this email address already exists.' },
    });
  }

  const id = `usr-${Date.now()}`;
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  // New registration is strictly EMPLOYEE and PENDING_APPROVAL
  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, status, employee_id, phone, department, job_title, date_of_birth, address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    email.trim().toLowerCase(),
    passwordHash,
    name.trim(),
    'EMPLOYEE',
    'PENDING_APPROVAL',
    null,
    phone,
    department,
    jobTitle,
    dateOfBirth,
    address
  );

  // Create notification for HR team
  try {
    const hrUsers = db.prepare(`SELECT id FROM users WHERE role = 'HR'`).all() as { id: string }[];
    const notifStmt = db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, is_read, link)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const hr of hrUsers) {
      notifStmt.run(
        `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        hr.id,
        'New Candidate Registration',
        `${name} submitted registration for ${jobTitle} (${department}).`,
        'warning',
        0,
        '/hr/pending-approvals'
      );
    }
  } catch (err) {
    // Non-critical
  }

  return res.status(201).json({
    success: true,
    message: 'Registration submitted successfully. Your account is waiting for HR approval.',
    data: {
      id,
      email: email.trim().toLowerCase(),
      name,
      role: 'EMPLOYEE',
      status: 'PENDING_APPROVAL',
    },
  });
});

// Current User Session
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  const user = db.prepare('SELECT id, email, name, role, status, employee_id, phone, department, job_title FROM users WHERE id = ?').get(req.user.id) as any;
  if (!user) {
    return res.status(404).json({ success: false, error: { message: 'User not found' } });
  }

  return res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      employeeId: user.employee_id,
      phone: user.phone,
      department: user.department,
      jobTitle: user.job_title,
    },
    // Backwards compatibility for direct object consumption
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    employeeId: user.employee_id,
  });
});

export default router;
