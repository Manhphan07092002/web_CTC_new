import { describe, it, expect } from 'vitest';
import { generateToken, verifyToken } from '../../server/middleware/auth';

describe('Auth Utils', () => {
  describe('generateToken', () => {
    it('should generate a valid token', () => {
      const payload = {
        id: '123',
        email: 'test@example.com',
        role: 'admin' as const,
        name: 'Test User'
      };
      
      const token = generateToken(payload);
      
      expect(token).toBeDefined();
      expect(token.split('.')).toHaveLength(3);
    });

    it('should generate token with custom expiry', () => {
      const payload = {
        id: '123',
        email: 'test@example.com',
        role: 'admin' as const
      };
      
      const token = generateToken(payload, 48);
      
      expect(token).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const payload = {
        id: '123',
        email: 'test@example.com',
        role: 'admin' as const,
        name: 'Test User'
      };
      
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded?.id).toBe(payload.id);
      expect(decoded?.email).toBe(payload.email);
      expect(decoded?.role).toBe(payload.role);
    });

    it('should return null for invalid token', () => {
      const decoded = verifyToken('invalid.token.here');
      expect(decoded).toBeNull();
    });

    it('should return null for expired token', () => {
      const payload = {
        id: '123',
        email: 'test@example.com',
        role: 'admin' as const
      };
      
      // Generate token that expires in -1 hour (already expired)
      const token = generateToken(payload, -1);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeNull();
    });
  });
});
