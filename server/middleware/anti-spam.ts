import { Request, Response, NextFunction } from 'express';

// Store IP rate limit records in memory
const contactLimitStore = new Map<string, { count: number; resetTime: number }>();
const orderLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Honeypot anti-spam protection middleware.
 * Spam bots fill all visible & hidden form fields automatically.
 * If honeypot fields (website_hp, fax_number_hp, honeypot) contain content,
 * return a fake HTTP 200 success response without saving or sending emails.
 */
export const honeypotCheck = (req: Request, res: Response, next: NextFunction) => {
  const { website_hp, fax_number_hp, honeypot } = req.body || {};

  if (website_hp || fax_number_hp || honeypot) {
    console.warn(`[ANTI-SPAM] Honeypot triggered from IP: ${req.ip}`);
    // Return fake 200 OK so bots think submission succeeded and don't retry
    return res.status(200).json({
      success: true,
      message: 'Cảm ơn bạn! Yêu cầu của bạn đã được ghi nhận.'
    });
  }

  next();
};

/**
 * Rate Limiter for Contact Form Submissions (Max 5 submissions per 10 minutes per IP)
 */
export const contactRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxSubmissions = 5;

  const record = contactLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    contactLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (record.count >= maxSubmissions) {
    return res.status(429).json({
      success: false,
      error: 'Quá nhiều yêu cầu gửi từ thiết bị của bạn. Vui lòng thử lại sau 10 phút.'
    });
  }

  record.count++;
  next();
};

/**
 * Rate Limiter for Order Creation & Tracking (Max 5 orders per 10 minutes per IP)
 */
export const orderRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxOrders = 5;

  const record = orderLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    orderLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (record.count >= maxOrders) {
    return res.status(429).json({
      success: false,
      error: 'Quá nhiều yêu cầu đặt hàng/tra cứu từ IP của bạn. Vui lòng thử lại sau vài phút.'
    });
  }

  record.count++;
  next();
};

/**
 * Input format validation for Contact Form (Phone & Email)
 */
export const validateContactInput = (req: Request, res: Response, next: NextFunction) => {
  const { phone, email } = req.body || {};

  // Email format regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(String(email).trim())) {
    return res.status(400).json({
      success: false,
      error: 'Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại.'
    });
  }

  // Vietnam Phone format regex (03x, 05x, 07x, 08x, 09x or +84...)
  const phoneClean = String(phone || '').replace(/\s+/g, '');
  const vnPhoneRegex = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
  
  if (phoneClean && !vnPhoneRegex.test(phoneClean)) {
    return res.status(400).json({
      success: false,
      error: 'Số điện thoại không hợp lệ (ví dụ: 0915059666).'
    });
  }

  next();
};
