import { Router } from 'express';
import { db } from '../../services/db-mongodb';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { logger } from '../../utils/logger';
import { generateToken, requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// Rate limiting for login attempts
interface LoginAttempt {
  count: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

const loginAttempts = new Map<string, LoginAttempt>();
const ATTEMPT_RESET_MS = 15 * 60 * 1000; // Reset attempts after 15 minutes of no activity

// Progressive lock durations
const LOCK_THRESHOLDS = [
  { attempts: 5, duration: 30 * 1000, message: '30 giây' },      // 30 seconds
  { attempts: 7, duration: 60 * 1000, message: '1 phút' },       // 1 minute  
  { attempts: 10, duration: 15 * 60 * 1000, message: '15 phút' }  // 15 minutes
];

function getLockDuration(attemptCount: number): { duration: number; message: string } {
  // Find the highest threshold that applies
  for (let i = LOCK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (attemptCount >= LOCK_THRESHOLDS[i].attempts) {
      return {
        duration: LOCK_THRESHOLDS[i].duration,
        message: LOCK_THRESHOLDS[i].message
      };
    }
  }
  return { duration: 0, message: '' };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [email, attempt] of loginAttempts.entries()) {
    if (now - attempt.lastAttempt > ATTEMPT_RESET_MS) {
      loginAttempts.delete(email);
    }
  }
}, 60 * 1000); // Clean up every minute

function getLoginAttempt(email: string): LoginAttempt {
  const normalizedEmail = email.toLowerCase();
  if (!loginAttempts.has(normalizedEmail)) {
    loginAttempts.set(normalizedEmail, { count: 0, lockedUntil: null, lastAttempt: Date.now() });
  }
  return loginAttempts.get(normalizedEmail)!;
}

function recordFailedAttempt(email: string): { isLocked: boolean; remainingSeconds: number; lockMessage?: string } {
  const normalizedEmail = email.toLowerCase();
  const attempt = getLoginAttempt(normalizedEmail);
  const now = Date.now();
  
  attempt.count++;
  attempt.lastAttempt = now;
  
  const lockInfo = getLockDuration(attempt.count);
  if (lockInfo.duration > 0) {
    attempt.lockedUntil = now + lockInfo.duration;
    const remainingSeconds = Math.ceil(lockInfo.duration / 1000);
    logger.warn(`Account locked for ${lockInfo.message} (${attempt.count} failed attempts):`, normalizedEmail);
    return { 
      isLocked: true, 
      remainingSeconds,
      lockMessage: lockInfo.message
    };
  }
  
  return { isLocked: false, remainingSeconds: 0 };
}

function resetLoginAttempts(email: string): void {
  const normalizedEmail = email.toLowerCase();
  loginAttempts.delete(normalizedEmail);
}

function isAccountLocked(email: string): { locked: boolean; remainingSeconds: number } {
  const normalizedEmail = email.toLowerCase();
  const attempt = loginAttempts.get(normalizedEmail);
  
  if (!attempt || !attempt.lockedUntil) {
    return { locked: false, remainingSeconds: 0 };
  }
  
  const now = Date.now();
  if (now < attempt.lockedUntil) {
    const remainingSeconds = Math.ceil((attempt.lockedUntil - now) / 1000);
    return { locked: true, remainingSeconds };
  }
  
  // Lock expired, reset attempts
  attempt.count = 0;
  attempt.lockedUntil = null;
  return { locked: false, remainingSeconds: 0 };
}

router.get('/', requireAdmin, async (req, res) => {
  try {
    let items = await db.users.getAll();
    
    // If no users exist, create default admin
    if (items.length === 0) {
      logger.info('No users found, creating default admin...');
      const hashedPassword = await hashPassword('CTC@2024');
      const defaultAdmin = await db.users.add({
        name: 'Super Admin',
        email: 'admin@ctcdn.vn',
        password: hashedPassword,
        role: 'admin' as 'admin' | 'editor' | 'viewer',
        phone: '',
        avatar: ''
      } as any);
      items = [defaultAdmin];
    }
    
    // Don't send password to client
    const sanitized = items.map(u => {
      const { password, ...rest } = u as any;
      return rest;
    });
    res.json(sanitized);
  } catch (error) {
    logger.error('Error getting users', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
});

// Get user by email (two routes for compatibility) - case insensitive
router.get('/by-email/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email).toLowerCase().trim();
    // Find user by email
    
    const items = await db.users.getAll();
    const user = items.find((u: any) => u.email?.toLowerCase() === email);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't send password to client
    const { password, ...sanitized } = user as any;
    // User found successfully
    res.json(sanitized);
  } catch (error) {
    logger.error('Error getting user by email', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
});

// Alternative route for /email/:email - case insensitive
router.get('/email/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email).toLowerCase().trim();
    // Find user by email
    
    const items = await db.users.getAll();
    const user = items.find((u: any) => u.email?.toLowerCase() === email);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't send password to client
    const { password, ...sanitized } = user as any;
    // User found successfully
    res.json(sanitized);
  } catch (error) {
    logger.error('Error getting user by email', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
});

// Login endpoint - verify password with rate limiting
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.toLowerCase()?.trim();
    
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    logger.info('Login attempt for:', normalizedEmail);
    
    // Check if account is locked
    const lockStatus = isAccountLocked(normalizedEmail);
    if (lockStatus.locked) {
      const minutes = Math.floor(lockStatus.remainingSeconds / 60);
      const seconds = lockStatus.remainingSeconds % 60;
      const timeDisplay = minutes > 0 ? `${minutes} phút ${seconds} giây` : `${seconds} giây`;
      
      logger.warn(`Login blocked - account locked for ${lockStatus.remainingSeconds}s:`, normalizedEmail);
      return res.status(429).json({ 
        message: `Tài khoản tạm khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ${timeDisplay}.`,
        lockedUntil: lockStatus.remainingSeconds,
        code: 'ACCOUNT_LOCKED'
      });
    }
    
    const items = await db.users.getAll();
    // Case-insensitive email comparison
    const user = items.find((u: any) => u.email?.toLowerCase() === normalizedEmail);
    
    if (!user) {
      logger.warn('User not found:', normalizedEmail);
      const attempt = getLoginAttempt(normalizedEmail);
      const failResult = recordFailedAttempt(normalizedEmail);
      
      if (failResult.isLocked) {
        const minutes = Math.floor(failResult.remainingSeconds / 60);
        const seconds = failResult.remainingSeconds % 60;
        const timeDisplay = minutes > 0 ? `${minutes} phút ${seconds} giây` : `${seconds} giây`;
        
        return res.status(429).json({ 
          message: `Đăng nhập sai quá nhiều lần. Tài khoản tạm khóa ${timeDisplay}.`,
          lockedUntil: failResult.remainingSeconds,
          lockMessage: failResult.lockMessage,
          code: 'ACCOUNT_LOCKED'
        });
      }
      
      const nextThreshold = LOCK_THRESHOLDS.find(t => t.attempts > attempt.count);
      const remainingAttempts = nextThreshold ? nextThreshold.attempts - attempt.count : 0;
      return res.status(401).json({ 
        message: `Thông tin đăng nhập không đúng. Còn ${remainingAttempts} lần thử.`,
        remainingAttempts,
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Check password using bcrypt
    const userWithPassword = user as any;
    const isPasswordValid = await comparePassword(password, userWithPassword.password);
    
    if (!isPasswordValid) {
      logger.warn('Invalid password for user:', normalizedEmail);
      const attempt = getLoginAttempt(normalizedEmail);
      const failResult = recordFailedAttempt(normalizedEmail);
      
      if (failResult.isLocked) {
        const minutes = Math.floor(failResult.remainingSeconds / 60);
        const seconds = failResult.remainingSeconds % 60;
        const timeDisplay = minutes > 0 ? `${minutes} phút ${seconds} giây` : `${seconds} giây`;
        
        return res.status(429).json({ 
          message: `Đăng nhập sai quá nhiều lần. Tài khoản tạm khóa ${timeDisplay}.`,
          lockedUntil: failResult.remainingSeconds,
          lockMessage: failResult.lockMessage,
          code: 'ACCOUNT_LOCKED'
        });
      }
      
      const nextThreshold = LOCK_THRESHOLDS.find(t => t.attempts > attempt.count);
      const remainingAttempts = nextThreshold ? nextThreshold.attempts - attempt.count : 0;
      return res.status(401).json({ 
        message: `Mật khẩu không đúng. Còn ${remainingAttempts} lần thử.`,
        remainingAttempts,
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Login successful - reset failed attempts
    resetLoginAttempts(normalizedEmail);
    
    // Don't send password to client
    const { password: _, ...sanitized } = userWithPassword;
    
    // Check if user is using a default weak password
    const DEFAULT_PASSWORDS = ['CTC@2024', 'TranLe@2024', '123456', 'admin', 'admin123'];
    const mustChangePassword = DEFAULT_PASSWORDS.includes(password);

    // Generate auth token
    const token = generateToken({
      id: sanitized.id || sanitized._id,
      email: sanitized.email,
      role: sanitized.role || 'viewer',
      name: sanitized.name
    });

    logger.info('Login successful:', sanitized.id);
    res.json({ ...sanitized, token, mustChangePassword });
  } catch (error) {
    logger.error('Error during login', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const userData = { ...req.body };
    
    // Validate password strength
    if (userData.password) {
      const validation = validatePasswordStrength(userData.password);
      if (!validation.isValid) {
        return res.status(400).json({ 
          message: 'Password does not meet requirements',
          errors: validation.errors 
        });
      }
      
      // Hash password before storing
      userData.password = await hashPassword(userData.password);
    }
    
    logger.info('Creating user with data:', { ...userData, password: '***' });
    
    const created = await db.users.add(userData);
    
    // Don't send password back
    const { password, ...sanitized } = created as any;
    res.status(201).json(sanitized);
  } catch (error) {
    logger.error('Error creating user', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    // Only Admin or the user themselves can update their user record
    if (req.user?.role !== 'admin' && req.user?.id !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden: Bạn không có quyền sửa tài khoản này.' });
    }

    const userData = { ...req.body };
    
    // Non-admin cannot escalate their own role
    if (req.user?.role !== 'admin' && userData.role && userData.role !== req.user?.role) {
      delete userData.role;
    }

    // If password is provided, validate and hash it
    if (userData.password && userData.password.trim()) {
      const validation = validatePasswordStrength(userData.password);
      if (!validation.isValid) {
        return res.status(400).json({ 
          message: 'Password does not meet requirements',
          errors: validation.errors 
        });
      }
      userData.password = await hashPassword(userData.password);
    } else {
      // If password is empty, don't update it
      delete userData.password;
    }
    
    logger.info('Updating user ID:', req.params.id);
    logger.info('Update data:', { ...userData, password: userData.password ? '***' : undefined });
    
    const updated = await db.users.update(req.params.id, userData);
    
    if (!updated) {
      logger.warn('User not found with ID:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't send password back
    const { password, ...sanitized } = updated as any;
    logger.info('User updated successfully');
    res.json(sanitized);
  } catch (error) {
    logger.error('Error updating user:', error);
    logger.error('Error details:', (error as Error).message);
    res.status(500).json({ 
      message: 'Failed to update user',
      error: (error as Error).message 
    });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const ok = await db.users.delete(req.params.id);
    if (!ok) return res.status(404).json({ message: 'User not found' });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting user', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Change password endpoint
router.post('/:id/change-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới' 
      });
    }

    // Get user
    const user = await db.users.getById(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    // Validate new password
    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Mật khẩu mới không đạt yêu cầu',
        errors: validation.errors 
      });
    }

    // Hash and update password
    const hashedPassword = await hashPassword(newPassword);
    await db.users.update(id, { password: hashedPassword });

    logger.info(`Password changed for user ${user.email}`);
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    logger.error('Error changing password:', error);
    res.status(500).json({ message: 'Lỗi khi đổi mật khẩu' });
  }
});

export default router;
