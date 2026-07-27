/**
 * Price formatting utilities with multi-language support
 */

export type SupportedCurrency = 'vi' | 'en' | 'ko' | 'ja' | 'zh' | 'de';

export interface PriceFormatOptions {
  showCurrency?: boolean;
  showDiscount?: boolean;
  compact?: boolean;
  language?: SupportedCurrency;
}

// Currency configurations per language
const CURRENCY_CONFIG: Record<SupportedCurrency, { locale: string; currency: string; symbol: string; contactText: string }> = {
  vi: { locale: 'vi-VN', currency: 'VND', symbol: 'đ', contactText: 'Liên hệ' },
  en: { locale: 'en-US', currency: 'USD', symbol: '$', contactText: 'Contact' },
  ko: { locale: 'ko-KR', currency: 'KRW', symbol: '₩', contactText: '문의' },
  ja: { locale: 'ja-JP', currency: 'JPY', symbol: '¥', contactText: 'お問い合わせ' },
  zh: { locale: 'zh-CN', currency: 'CNY', symbol: '¥', contactText: '联系我们' },
  de: { locale: 'de-DE', currency: 'EUR', symbol: '€', contactText: 'Kontakt' }
};

// Exchange rates (approximate, VND base)
const EXCHANGE_RATES: Record<SupportedCurrency, number> = {
  vi: 1,
  en: 24500,    // 1 USD = 24,500 VND
  ko: 18,       // 1 KRW = 18 VND
  ja: 165,      // 1 JPY = 165 VND
  zh: 3400,     // 1 CNY = 3,400 VND
  de: 26500     // 1 EUR = 26,500 VND
};

/**
 * Format price with language/currency support
 */
export function formatPrice(price: string | number, options: PriceFormatOptions = {}): string {
  const {
    showCurrency = true,
    compact = false,
    language = 'vi'
  } = options;

  const config = CURRENCY_CONFIG[language] || CURRENCY_CONFIG.vi;
  const rate = EXCHANGE_RATES[language] || 1;

  if (!price || price === '0') return config.contactText;
  
  const numPrice = typeof price === 'string' ? parseInt(price.replace(/\D/g, '')) : price;
  
  if (isNaN(numPrice) || numPrice === 0) return config.contactText;

  // Convert price if not Vietnamese
  const convertedPrice = language === 'vi' ? numPrice : Math.round(numPrice / rate);

  if (compact) {
    // Compact format: 15M, 2.5M, 500K
    if (convertedPrice >= 1000000) {
      const millions = convertedPrice / 1000000;
      return `${millions % 1 === 0 ? millions : millions.toFixed(1)}M${showCurrency ? config.symbol : ''}`;
    } else if (convertedPrice >= 1000) {
      const thousands = convertedPrice / 1000;
      return `${thousands % 1 === 0 ? thousands : thousands.toFixed(0)}K${showCurrency ? config.symbol : ''}`;
    }
  }

  // Full format with thousand separators
  const formatted = convertedPrice.toLocaleString(config.locale);
  
  // Position currency symbol based on locale
  if (!showCurrency) return formatted;
  
  if (language === 'vi') {
    return `${formatted}đ`;
  } else if (language === 'en' || language === 'zh' || language === 'ja') {
    return `${config.symbol}${formatted}`;
  } else {
    return `${formatted} ${config.symbol}`;
  }
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(originalPrice: string | number, currentPrice: string | number): number {
  const original = typeof originalPrice === 'string' ? parseInt(originalPrice.replace(/\D/g, '')) : originalPrice;
  const current = typeof currentPrice === 'string' ? parseInt(currentPrice.replace(/\D/g, '')) : currentPrice;
  
  if (!original || !current || original <= current) return 0;
  
  return Math.round(((original - current) / original) * 100);
}

/**
 * Check if product has discount
 */
export function hasDiscount(originalPrice: string | number, currentPrice: string | number): boolean {
  return calculateDiscount(originalPrice, currentPrice) > 0;
}

/**
 * Format price range
 */
export function formatPriceRange(minPrice: string | number, maxPrice: string | number): string {
  const min = formatPrice(minPrice, { compact: true });
  const max = formatPrice(maxPrice, { compact: true });
  
  if (min === 'Liên hệ' || max === 'Liên hệ') return 'Liên hệ';
  if (min === max) return min;
  
  return `${min} - ${max}`;
}

/**
 * Safely parse any price input (string, number, null, undefined) into integer number
 */
export function parseNumericPrice(val: string | number | null | undefined): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') {
    return isNaN(val) || val < 0 ? 0 : Math.round(val);
  }
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return 0;
  const parsed = parseInt(digits, 10);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

/**
 * Calculate price including VAT
 * Formula: PriceWithVat = PriceBeforeVat * (1 + vat / 100)
 */
export function calculatePriceWithVat(price: string | number | null | undefined, vat: string | number | null | undefined): number {
  const basePrice = parseNumericPrice(price);
  if (basePrice <= 0) return 0;

  const vatPercent = typeof vat === 'number' 
    ? (isNaN(vat) || vat < 0 ? 0 : Math.min(100, vat))
    : Math.max(0, Math.min(100, parseFloat(String(vat).replace(',', '.')) || 0));

  return Math.round(basePrice * (1 + vatPercent / 100));
}

/**
 * Format price for Vietnamese Dong currency (e.g. 19.690.000đ)
 */
export function formatVnCurrency(value: number | string | null | undefined): string {
  const num = typeof value === 'number' ? value : parseNumericPrice(value);
  if (isNaN(num) || num < 0) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
}
