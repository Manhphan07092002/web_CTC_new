import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

// Placeholder image URL - you can replace with your own
export const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNMTc1IDE1MEMxNzUgMTM2LjE5MyAxODYuMTkzIDEyNSAyMDAgMTI1QzIxMy44MDcgMTI1IDIyNSAxMzYuMTkzIDIyNSAxNTBDMjI1IDE2My44MDcgMjEzLjgwNyAxNzUgMjAwIDE3NUMxODYuMTkzIDE3NSAxNzUgMTYzLjgwNyAxNzUgMTUwWiIgZmlsbD0iI0Q1RDlERSIvPjxwYXRoIGQ9Ik0xNDAgMjAwTDE3NSAxNjVMMjAwIDE5MEwyNDAgMTUwTDI2MCAyMDBIMTQwWiIgZmlsbD0iI0Q1RDlERSIvPjx0ZXh0IHg9IjIwMCIgeT0iMjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Q0EzQUYiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

interface ImageWithFallbackProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  showIcon?: boolean;
  loadingMode?: 'lazy' | 'eager';
}

const getWebpCandidate = (url?: string | null): string | null => {
  if (!url) return null;
  const match = url.match(/^(.+)\.(jpg|jpeg|png)$/i);
  if (match) {
    return `${match[1]}.webp`;
  }
  return null;
};

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  showIcon = true,
  loadingMode = 'lazy'
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const hasValidSrc = src && src.trim() !== '';
  const webpSrc = getWebpCandidate(src);

  if (!hasValidSrc || error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 dark:bg-slate-800 ${fallbackClassName || className}`}>
        {showIcon && <ImageOff size={48} className="text-gray-300 dark:text-slate-600 mb-2" />}
        <span className="text-gray-400 dark:text-slate-500 text-sm font-medium">No Image</span>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className={`flex items-center justify-center bg-gray-100 dark:bg-slate-800 animate-pulse ${className}`}>
          <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
      <picture className={loading ? 'hidden' : ''}>
        {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
        <img
          src={src}
          alt={alt}
          loading={loadingMode}
          decoding="async"
          className={className}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
        />
      </picture>
    </>
  );
};

export default ImageWithFallback;
