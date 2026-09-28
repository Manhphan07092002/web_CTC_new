import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword, validatePasswordStrength } from '../../server/utils/password';

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'Test@123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should produce different hashes for same password', async () => {
      const password = 'Test@123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'Test@123';
      const hash = await hashPassword(password);
      const isValid = await comparePassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'Test@123';
      const wrongPassword = 'Wrong@123';
      const hash = await hashPassword(password);
      const isValid = await comparePassword(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should accept strong password', () => {
      const result = validatePasswordStrength('Test@123');
      expect(result.isValid).toBe(true);
    });

    it('should reject short password', () => {
      const result = validatePasswordStrength('Test1');
      expect(result.isValid).toBe(false);
    });

    it('should reject password without uppercase', () => {
      const result = validatePasswordStrength('test@123');
      expect(result.isValid).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const result = validatePasswordStrength('TEST@123');
      expect(result.isValid).toBe(false);
    });

    it('should reject password without number', () => {
      const result = validatePasswordStrength('Test@abc');
      expect(result.isValid).toBe(false);
    });

    it('should reject password without special character', () => {
      const result = validatePasswordStrength('Test1234');
      expect(result.isValid).toBe(false);
    });
  });
});
