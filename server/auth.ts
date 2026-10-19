import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from './db.ts';

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.SESSION_SECRET ||
  'zero-craftlabb-session-secret-key-2026-x9094-stable';

interface AdminSession {
  token: string;
  adminId: string;
  email: string;
  createdAt: number;
  expiresAt: number;
}

// Memory cache for active sessions
const sessions = new Map<string, AdminSession>();

// Rate limiting for login attempts
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
  if (attempt.count >= 15) {
    return false;
  }
  attempt.count++;
  return true;
}

export function clearLoginAttempts(ip: string) {
  loginAttempts.delete(ip);
}

export function createAdminSession(adminId: string, email: string): string {
  const now = Date.now();
  const expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days validity

  const payload = {
    adminId,
    email: email.toLowerCase(),
    createdAt: now,
    expiresAt,
    salt: crypto.randomBytes(8).toString('hex'),
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  const token = `${payloadB64}.${signature}`;

  const session: AdminSession = {
    token,
    adminId,
    email: email.toLowerCase(),
    createdAt: now,
    expiresAt,
  };

  sessions.set(token, session);
  return token;
}

export function validateAdminSession(token: string): AdminSession | null {
  if (!token) return null;
  const cleanToken = token.trim();

  // 1. Check in-memory cache
  const cached = sessions.get(cleanToken);
  if (cached) {
    if (Date.now() > cached.expiresAt) {
      sessions.delete(cleanToken);
      return null;
    }
    return cached;
  }

  // 2. Cryptographic signature check (persists across server restarts & Vercel lambdas)
  try {
    const parts = cleanToken.split('.');
    if (parts.length === 2) {
      const [payloadB64, signature] = parts;
      const expectedSig = crypto
        .createHmac('sha256', SESSION_SECRET)
        .update(payloadB64)
        .digest('base64url');

      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expectedSig);

      if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
        if (Date.now() <= payload.expiresAt) {
          const admin = db.getAdminById(payload.adminId) || db.getAdminByEmail(payload.email);
          if (admin) {
            const session: AdminSession = {
              token: cleanToken,
              adminId: admin.id,
              email: admin.email,
              createdAt: payload.createdAt,
              expiresAt: payload.expiresAt,
            };
            sessions.set(cleanToken, session);
            return session;
          }
        }
      }
    }
  } catch (err) {
    // invalid token format
  }

  return null;
}

export function invalidateSession(token: string) {
  if (token) {
    sessions.delete(token.trim());
  }
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

