/**
 * Input Validation Utilities
 * Provides validation functions for forms and API inputs
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate phone number (Vietnamese format)
 */
export function validatePhone(phone: string): ValidationResult {
  const errors: string[] = [];
  
  if (!phone) {
    errors.push('Phone number is required');
  } else if (!/^(0|\+84)[0-9]{9,10}$/.test(phone.replace(/\s/g, ''))) {
    errors.push('Invalid phone number format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate required field
 */
export function validateRequired(value: any, fieldName: string): ValidationResult {
  const errors: string[] = [];
  
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    errors.push(`${fieldName} is required`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  const errors: string[] = [];
  
  if (value.length < min) {
    errors.push(`${fieldName} must be at least ${min} characters`);
  }
  if (value.length > max) {
    errors.push(`${fieldName} must be at most ${max} characters`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate number range
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  const errors: string[] = [];
  
  if (isNaN(value)) {
    errors.push(`${fieldName} must be a number`);
  } else {
    if (value < min) {
      errors.push(`${fieldName} must be at least ${min}`);
    }
    if (value > max) {
      errors.push(`${fieldName} must be at most ${max}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate URL format
 */
export function validateURL(url: string): ValidationResult {
  const errors: string[] = [];
  
  if (!url) {
    errors.push('URL is required');
  } else {
    try {
      new URL(url);
    } catch {
      errors.push('Invalid URL format');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate product data
 */
export function validateProduct(data: any): ValidationResult {
  const errors: string[] = [];
  
  // Name
  const nameResult = validateRequired(data.name, 'Product name');
  errors.push(...nameResult.errors);
  
  if (data.name) {
    const lengthResult = validateLength(data.name, 3, 200, 'Product name');
    errors.push(...lengthResult.errors);
  }
  
  // Price
  if (data.price !== undefined) {
    const priceResult = validateNumberRange(data.price, 0, 1000000000, 'Price');
    errors.push(...priceResult.errors);
  }
  
  // Description
  if (data.description) {
    const descResult = validateLength(data.description, 10, 5000, 'Description');
    errors.push(...descResult.errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate contact form data
 */
export function validateContactForm(data: any): ValidationResult {
  const errors: string[] = [];
  
  // Name
  const nameResult = validateRequired(data.name, 'Name');
  errors.push(...nameResult.errors);
  
  // Email
  const emailResult = validateEmail(data.email);
  errors.push(...emailResult.errors);
  
  // Phone
  if (data.phone) {
    const phoneResult = validatePhone(data.phone);
    errors.push(...phoneResult.errors);
  }
  
  // Message
  const messageResult = validateRequired(data.message, 'Message');
  errors.push(...messageResult.errors);
  
  if (data.message) {
    const lengthResult = validateLength(data.message, 10, 1000, 'Message');
    errors.push(...lengthResult.errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate user registration data
 */
export function validateUserRegistration(data: any): ValidationResult {
  const errors: string[] = [];
  
  // Email
  const emailResult = validateEmail(data.email);
  errors.push(...emailResult.errors);
  
  // Password
  const passwordResult = validatePassword(data.password);
  errors.push(...passwordResult.errors);
  
  // Confirm password
  if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  // Name
  const nameResult = validateRequired(data.name, 'Name');
  errors.push(...nameResult.errors);
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Sanitize input string
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}
