import React, { useState } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | undefined | null;
  alt: string;
  /** Explicitly provide WebP URL. If omitted, auto-converts /uploads/ paths */
  webpSrc?: string;
  /** Fallback placeholder when src fails */
  fallback?: string;
}

const DEFAULT_PLACEHOLDER = '/uploads/images/default-product.png';

/**
 * Auto-converts /uploads/ image URLs to their .webp counterpart.
 * Server generates .webp alongside original on every upload (via sharp).
 */
function toWebP(url: string | undefined | null): string | null {
  if (!url) return null;
  if (!url.startsWith('/uploads/')) return null; // External URLs: no WebP
  if (url.endsWith('.webp')) return url;
  return url.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
}

/**
 * OptimizedImage — renders a <picture> element with WebP source + fallback.
 * Falls back gracefully if WebP doesn't exist (404 → browser uses original).
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  webpSrc,
  fallback = DEFAULT_PLACEHOLDER,
  loading = 'lazy',
  decoding = 'async',
  onError,
  ...props
}) => {
  const [imgError, setImgError] = useState(false);
  const originalSrc = src || fallback;
  const computedWebP = webpSrc || toWebP(src);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!imgError) {
      setImgError(true);
      (e.target as HTMLImageElement).src = fallback;
    }
    onError?.(e);
  };

  // No WebP variant → plain <img>
  if (!computedWebP || imgError) {
    return (
      <img
        src={imgError ? fallback : originalSrc}
        alt={alt}
        loading={loading}
        decoding={decoding}
        onError={handleError}
        {...props}
      />
    );
  }

  // WebP available → <picture> with WebP source + original fallback
  return (
    <picture>
      <source srcSet={computedWebP} type="image/webp" />
      <img
        src={originalSrc}
        alt={alt}
        loading={loading}
        decoding={decoding}
        onError={handleError}
        {...props}
      />
    </picture>
  );
};

export default OptimizedImage;
