import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'payroll360-enterprise-secure-jwt-secret-key-2026';

export interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'HR' | 'EMPLOYEE';
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
  name: string;
  employeeId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required. Missing or malformed token.' },
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    
    // Check status integrity
    if (decoded.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: {
          code: `ACCOUNT_${decoded.status}`,
          message: decoded.status === 'PENDING_APPROVAL'
            ? 'Your account is awaiting HR review and approval.'
            : decoded.status === 'REJECTED'
            ? 'Your registration was not approved. Please contact HR.'
            : 'Your account has been suspended. Please contact HR.',
        },
      });
    }

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Session expired or token invalid. Please log in again.' },
    });
  }
}

export const authenticateToken = authMiddleware;

export function requireRole(...permittedRoles: ('ADMIN' | 'HR' | 'EMPLOYEE')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    if (!permittedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires one of the following roles: ${permittedRoles.join(', ')}`,
        },
      });
    }

    next();
  };
}

export function validateEmployeeOwnership(paramName = 'id') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    // HR and ADMIN have administrative oversight
    if (req.user.role === 'ADMIN' || req.user.role === 'HR') {
      return next();
    }

    // Employees can only access resources matching their own employeeId or userId
    const targetId = req.params[paramName];
    if (req.user.employeeId === targetId || req.user.id === targetId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: 'You are not authorized to view or modify resources belonging to another employee.',
      },
    });
  };
}
