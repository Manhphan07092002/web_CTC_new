/**
 * Input Validation Middleware
 * Validate và sanitize input data
 */

import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import validator from 'validator';

// ============================================
// VALIDATION ERROR HANDLER
// ============================================
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? (error as any).path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? (error as any).value : undefined,
      })),
    });
  }
  
  next();
};

// ============================================
// COMMON VALIDATORS
// ============================================

// MongoDB ObjectId validation
export const validateObjectId = (field: string) => {
  return param(field)
    .isMongoId()
    .withMessage(`${field} phải là MongoDB ObjectId hợp lệ`);
};

// Email validation
export const validateEmail = (field: string = 'email') => {
  return body(field)
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ');
};

// Password validation
export const validatePassword = (field: string = 'password') => {
  return body(field)
    .isLength({ min: 8 })
    .withMessage('Mật khẩu phải có ít nhất 8 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Mật khẩu phải có ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt');
};

// Name validation
export const validateName = (field: string = 'name') => {
  return body(field)
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage(`${field} phải có từ 2-100 ký tự`)
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
    .withMessage(`${field} chỉ được chứa chữ cái và khoảng trắng`);
};

// Phone validation (Vietnam format)
export const validatePhone = (field: string = 'phone') => {
  return body(field)
    .optional()
    .matches(/^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/)
    .withMessage('Số điện thoại không hợp lệ (định dạng Việt Nam)');
};

// URL validation
export const validateUrl = (field: string) => {
  return body(field)
    .optional()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage(`${field} phải là URL hợp lệ`);
};

// Text content validation (chống XSS)
export const validateText = (field: string, maxLength: number = 1000) => {
  return body(field)
    .trim()
    .isLength({ max: maxLength })
    .withMessage(`${field} không được vượt quá ${maxLength} ký tự`)
    .custom((value) => {
      // Check for potential XSS
      if (/<script|javascript:|on\w+=/i.test(value)) {
        throw new Error(`${field} chứa nội dung không an toàn`);
      }
      return true;
    });
};

// HTML content validation (cho rich text editor)
export const validateHtml = (field: string, maxLength: number = 10000) => {
  return body(field)
    .optional()
    .isLength({ max: maxLength })
    .withMessage(`${field} không được vượt quá ${maxLength} ký tự`)
    .custom((value) => {
      // Allow only safe HTML tags
      const allowedTags = /<\/?(?:p|br|strong|em|u|ol|ul|li|h[1-6]|blockquote|a|img)\b[^>]*>/gi;
      const cleanValue = value.replace(allowedTags, '');
      
      if (/<[^>]+>/g.test(cleanValue)) {
        throw new Error(`${field} chứa HTML tags không được phép`);
      }
      
      return true;
    });
};

// Number validation
export const validateNumber = (field: string, min?: number, max?: number) => {
  let validator_chain = body(field).isNumeric().withMessage(`${field} phải là số`);
  
  if (min !== undefined) {
    validator_chain = validator_chain.isFloat({ min }).withMessage(`${field} phải >= ${min}`);
  }
  
  if (max !== undefined) {
    validator_chain = validator_chain.isFloat({ max }).withMessage(`${field} phải <= ${max}`);
  }
  
  return validator_chain;
};

// File validation (for multer uploads)
export const validateFile = (allowedTypes: string[], maxSize: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next();
    }
    
    // Check file type
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        status: 400,
        message: `Loại file không được phép. Chỉ chấp nhận: ${allowedTypes.join(', ')}`,
      });
    }
    
    // Check file size
    if (req.file.size > maxSize) {
      return res.status(400).json({
        status: 400,
        message: `File quá lớn. Kích thước tối đa: ${Math.round(maxSize / 1024 / 1024)}MB`,
      });
    }
    
    // Check file name for security
    const fileName = req.file.originalname;
    if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) {
      return res.status(400).json({
        status: 400,
        message: 'Tên file chỉ được chứa chữ cái, số, dấu chấm, gạch ngang và gạch dưới',
      });
    }
    
    next();
  };
};

// ============================================
// ROUTE-SPECIFIC VALIDATORS
// ============================================

// User validation
export const validateUser = [
  validateName('name'),
  validateEmail('email'),
  body('role')
    .isIn(['admin', 'editor', 'viewer'])
    .withMessage('Role phải là admin, editor hoặc viewer'),
  validatePhone('phone'),
  validateUrl('avatar'),
  handleValidationErrors,
];

export const validateUserUpdate = [
  validateName('name').optional(),
  validateEmail('email').optional(),
  body('role')
    .optional()
    .isIn(['admin', 'editor', 'viewer'])
    .withMessage('Role phải là admin, editor hoặc viewer'),
  validatePhone('phone'),
  validateUrl('avatar'),
  handleValidationErrors,
];

// Login validation
export const validateLogin = [
  validateEmail('email'),
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu không được để trống'),
  handleValidationErrors,
];

// Product validation
export const validateProduct = [
  validateText('name', 200),
  validateText('description', 2000),
  validateHtml('content', 20000),
  validateNumber('price', 0),
  validateNumber('originalPrice', 0).optional(),
  validateText('category', 100).optional(),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured phải là true/false'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags phải là mảng'),
  body('tags.*')
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage('Mỗi tag không được vượt quá 50 ký tự'),
  handleValidationErrors,
];

// News validation
export const validateNews = [
  validateText('title', 200),
  validateText('summary', 500),
  validateHtml('content', 50000),
  validateText('category', 100).optional(),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured phải là true/false'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags phải là mảng'),
  handleValidationErrors,
];

// Project validation
export const validateProject = [
  validateText('name', 200),
  validateText('description', 2000),
  validateHtml('content', 20000),
  validateText('location', 200).optional(),
  validateText('client', 200).optional(),
  validateNumber('capacity', 0).optional(),
  body('completedAt')
    .optional()
    .isISO8601()
    .withMessage('completedAt phải là ngày hợp lệ'),
  handleValidationErrors,
];

// Category validation
export const validateCategory = [
  validateText('name', 100),
  validateText('description', 500).optional(),
  validateText('slug', 100).optional(),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order phải là số nguyên >= 0'),
  handleValidationErrors,
];

// Contact validation
export const validateContact = [
  validateName('name'),
  validateEmail('email'),
  validatePhone('phone'),
  validateText('subject', 200),
  validateText('message', 2000),
  handleValidationErrors,
];

// Query parameter validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page phải là số nguyên >= 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit phải là số nguyên từ 1-100'),
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'name', '-name', 'price', '-price'])
    .withMessage('Sort không hợp lệ'),
  handleValidationErrors,
];

// Search validation
export const validateSearch = [
  query('q')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Từ khóa tìm kiếm phải có từ 1-100 ký tự')
    .custom((value) => {
      // Prevent potential injection
      if (/[<>'"\\${}]/.test(value)) {
        throw new Error('Từ khóa tìm kiếm chứa ký tự không hợp lệ');
      }
      return true;
    }),
  handleValidationErrors,
];

// IP validation (for admin security routes)
export const validateIP = [
  body('ip')
    .isIP()
    .withMessage('Địa chỉ IP không hợp lệ'),
  body('reason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Lý do không được vượt quá 200 ký tự'),
  handleValidationErrors,
];
