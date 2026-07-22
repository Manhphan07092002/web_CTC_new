import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'ctc-solar-secure-jwt-secret-key-2026';

export interface UserPayload {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  name?: string;
}

/**
 * Tạo token xác thực an toàn bằng Crypto HMAC-SHA256
 */
export function generateToken(payload: UserPayload, expiresInHours = 24): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const fullPayload = { ...payload, exp };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Xác minh tính hợp lệ và thời hạn của Token
 */
export function verifyToken(token: string): UserPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));

    // Kiểm tra hết hạn (exp)
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Middleware yêu cầu đăng nhập (đã xác thực)
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || req.headers['x-auth-token'];
  let token = '';

  if (typeof authHeader === 'string') {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else {
      token = authHeader.trim();
    }
  }

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: 'Unauthorized: Vui lòng đăng nhập để thực hiện thao tác này.',
    });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({
      status: 401,
      message: 'Unauthorized: Token không hợp lệ hoặc đã hết hạn.',
    });
  }

  req.user = user;
  next();
}

/**
 * Middleware yêu cầu quyền Admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, (err?: any) => {
    if (err) return next(err);

    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        status: 403,
        message: 'Forbidden: Thao tác này yêu cầu quyền Admin.',
      });
    }

    next();
  });
}
