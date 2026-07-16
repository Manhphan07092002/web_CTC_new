/**
 * File Upload Security Middleware
 * Bảo vệ khỏi các cuộc tấn công qua file upload
 */

import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// ============================================
// SECURITY CONFIGURATIONS
// ============================================

// Allowed file types with their MIME types
const ALLOWED_FILE_TYPES = {
  images: {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  },
  documents: {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  },
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  default: 2 * 1024 * 1024, // 2MB
};

// Dangerous file extensions to block
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.php', '.asp', '.aspx', '.jsp', '.sh', '.py', '.pl', '.rb', '.ps1',
];

// Magic number signatures for file type validation
const FILE_SIGNATURES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
};

// ============================================
// SECURITY FUNCTIONS
// ============================================

// Validate file signature (magic numbers)
const validateFileSignature = (buffer: Buffer, mimeType: string): boolean => {
  const signature = FILE_SIGNATURES[mimeType as keyof typeof FILE_SIGNATURES];
  if (!signature) return true; // Skip validation if no signature defined
  
  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) {
      return false;
    }
  }
  return true;
};

// Generate secure filename
const generateSecureFilename = (originalName: string, mimeType: string): string => {
  const ext = ALLOWED_FILE_TYPES.images[mimeType as keyof typeof ALLOWED_FILE_TYPES.images] ||
              ALLOWED_FILE_TYPES.documents[mimeType as keyof typeof ALLOWED_FILE_TYPES.documents] ||
              path.extname(originalName);
  
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(8).toString('hex');
  
  return `${timestamp}_${randomBytes}${ext}`;
};

// Scan file for malicious content (basic)
const scanFileContent = (buffer: Buffer, filename: string): boolean => {
  const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1024));
  
  // Check for script tags, PHP tags, etc.
  const maliciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<\?php/gi,
    /<%[\s\S]*?%>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
  ];
  
  return !maliciousPatterns.some(pattern => pattern.test(content));
};

// ============================================
// MULTER CONFIGURATION
// ============================================

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const secureFilename = generateSecureFilename(file.originalname, file.mimetype);
    cb(null, secureFilename);
  },
});

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      return cb(new Error(`Loại file ${ext} không được phép vì lý do bảo mật`));
    }
    
    // Check MIME type
    const allowedMimeTypes = [
      ...Object.keys(ALLOWED_FILE_TYPES.images),
      ...Object.keys(ALLOWED_FILE_TYPES.documents),
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error(`Loại file ${file.mimetype} không được hỗ trợ`));
    }
    
    // Check filename for suspicious characters
    if (!/^[a-zA-Z0-9._-]+$/.test(file.originalname)) {
      return cb(new Error('Tên file chỉ được chứa chữ cái, số, dấu chấm, gạch ngang và gạch dưới'));
    }
    
    cb(null, true);
  } catch (error) {
    cb(new Error('Lỗi kiểm tra file'));
  }
};

// ============================================
// MULTER INSTANCES
// ============================================

// For image uploads
export const imageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMITS.image,
    files: 5, // Max 5 files per request
    fieldSize: 1024 * 1024, // 1MB field size
  },
});

// For document uploads
export const documentUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMITS.document,
    files: 3, // Max 3 files per request
  },
});

// General upload (smaller size limit)
export const generalUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMITS.default,
    files: 1,
  },
});

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Post-upload security validation
export const validateUploadedFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file && !req.files) {
    return next();
  }
  
  const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file!];
  
  for (const file of files) {
    try {
      // Read file buffer for validation
      const buffer = fs.readFileSync(file.path);
      
      // Validate file signature
      if (!validateFileSignature(buffer, file.mimetype)) {
        fs.unlinkSync(file.path); // Delete invalid file
        return res.status(400).json({
          status: 400,
          message: `File ${file.originalname} không đúng định dạng được khai báo`,
        });
      }
      
      // Scan for malicious content
      if (!scanFileContent(buffer, file.filename)) {
        fs.unlinkSync(file.path); // Delete malicious file
        return res.status(400).json({
          status: 400,
          message: `File ${file.originalname} chứa nội dung không an toàn`,
        });
      }
      
      // Additional checks for images
      if (file.mimetype.startsWith('image/')) {
        // Check image dimensions (prevent zip bombs)
        // This is a basic check - in production, use a proper image library
        if (buffer.length > FILE_SIZE_LIMITS.image) {
          fs.unlinkSync(file.path);
          return res.status(400).json({
            status: 400,
            message: `Hình ảnh ${file.originalname} quá lớn`,
          });
        }
      }
      
    } catch (error) {
      console.error('[UPLOAD SECURITY] File validation error:', error);
      
      // Delete file on error
      try {
        fs.unlinkSync(file.path);
      } catch (deleteError) {
        console.error('[UPLOAD SECURITY] Failed to delete invalid file:', deleteError);
      }
      
      return res.status(500).json({
        status: 500,
        message: 'Lỗi kiểm tra file upload',
      });
    }
  }
  
  next();
};

// Quarantine suspicious files
export const quarantineFile = (filePath: string, reason: string) => {
  const quarantineDir = path.join(process.cwd(), 'quarantine');
  
  if (!fs.existsSync(quarantineDir)) {
    fs.mkdirSync(quarantineDir, { recursive: true });
  }
  
  const filename = path.basename(filePath);
  const quarantinePath = path.join(quarantineDir, `${Date.now()}_${filename}`);
  
  try {
    fs.renameSync(filePath, quarantinePath);
    console.warn(`[SECURITY] File quarantined: ${filename} -> ${quarantinePath}. Reason: ${reason}`);
    
    // Log to audit system
    // addAuditLog({ ... }) - implement if needed
    
  } catch (error) {
    console.error('[SECURITY] Failed to quarantine file:', error);
    // Try to delete instead
    try {
      fs.unlinkSync(filePath);
    } catch (deleteError) {
      console.error('[SECURITY] Failed to delete suspicious file:', deleteError);
    }
  }
};

// ============================================
// ERROR HANDLER
// ============================================

export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          status: 400,
          message: 'File quá lớn. Vui lòng chọn file nhỏ hơn.',
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          status: 400,
          message: 'Quá nhiều file. Vui lòng chọn ít file hơn.',
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          status: 400,
          message: 'Field upload không hợp lệ.',
        });
      default:
        return res.status(400).json({
          status: 400,
          message: 'Lỗi upload file.',
        });
    }
  }
  
  if (error.message) {
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
  
  next(error);
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Clean up old files (call periodically)
export const cleanupOldFiles = (maxAgeHours: number = 24) => {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const quarantineDir = path.join(process.cwd(), 'quarantine');
  
  const cleanDirectory = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    const cutoff = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime.getTime() < cutoff) {
        try {
          fs.unlinkSync(filePath);
          console.log(`[CLEANUP] Deleted old file: ${file}`);
        } catch (error) {
          console.error(`[CLEANUP] Failed to delete ${file}:`, error);
        }
      }
    });
  };
  
  cleanDirectory(quarantineDir);
  // Don't auto-delete uploads - they might be referenced in DB
};

// Get file info safely
export const getFileInfo = (filename: string) => {
  const filePath = path.join(process.cwd(), 'uploads', filename);
  
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const stats = fs.statSync(filePath);
    return {
      filename,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      path: filePath,
    };
  } catch (error) {
    console.error('[FILE INFO] Error getting file info:', error);
    return null;
  }
};
