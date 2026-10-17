import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db, verifyPassword } from './db.ts';

interface AdminSession {
  token: string;
  adminId: string;
  email: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory sessions map
const sessions = new Map<string, AdminSession>();

// Rate limiting for login
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);
  if (!attempt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (now > attempt.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (attempt.count >= 10) {
    return false;
  }
  attempt.count++;
  return true;
}

export function clearLoginAttempts(ip: string) {
  loginAttempts.delete(ip);
}

export function createAdminSession(adminId: string, email: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

  sessions.set(token, {
    token,
    adminId,
    email,
    createdAt: now,
    expiresAt,
  });

  return token;
}

export function validateAdminSession(token: string): AdminSession | null {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function invalidateSession(token: string) {
  sessions.delete(token);
}

export interface AuthenticatedRequest extends Request {
  adminSession?: AdminSession;
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-admin-token']) {
    token = String(req.headers['x-admin-token']).trim();
  }

  const session = validateAdminSession(token);
  if (!session) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Admin authentication required to access this resource.',
    });
  }

  req.adminSession = session;
  next();
}
