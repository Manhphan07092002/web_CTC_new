import path from 'path';
import fs from 'fs';

/**
 * Interface for processed image result
 */
export interface ProcessedImageResult {
  originalPath: string;
  webpPath?: string;
  webpUrl?: string;
  savings?: string;
}

/**
 * Optimizes an uploaded image file:
 * 1. Resizes if width > 1920px (preserving aspect ratio)
 * 2. Compresses JPEG/PNG (quality 80%)
 * 3. Generates a .webp format counterpart
 */
export async function optimizeUploadedImage(filePath: string, publicSubPath: string = ''): Promise<ProcessedImageResult> {
  const ext = path.extname(filePath).toLowerCase();
  const imageExts = ['.jpg', '.jpeg', '.png', '.webp'];

  if (!imageExts.includes(ext) || !fs.existsSync(filePath)) {
    return { originalPath: filePath };
  }

  try {
    // Dynamic import sharp to handle environment where sharp might not be natively loaded yet
    const sharp = (await import('sharp')).default;
    const statsBefore = fs.statSync(filePath);
    const parsedPath = path.parse(filePath);
    const webpPath = path.join(parsedPath.dir, `${parsedPath.name}.webp`);

    let image = sharp(filePath);
    const metadata = await image.metadata();

    // Max width 1920px
    if (metadata.width && metadata.width > 1920) {
      image = image.resize({ width: 1920, fit: 'inside', withoutEnlargement: true });
    }

    // Convert & Save WebP version
    await image
      .clone()
      .webp({ quality: 80, effort: 4 })
      .toFile(webpPath);

    // If original is JPG/PNG and size > 300KB, compress original file in-place as well
    if (['.jpg', '.jpeg', '.png'].includes(ext) && statsBefore.size > 300 * 1024) {
      const tempPath = path.join(parsedPath.dir, `temp_${parsedPath.base}`);
      if (ext === '.png') {
        await sharp(filePath).png({ quality: 80, compressionLevel: 8 }).toFile(tempPath);
      } else {
        await sharp(filePath).jpeg({ quality: 80, mozjpeg: true }).toFile(tempPath);
      }

      if (fs.existsSync(tempPath)) {
        const statsAfter = fs.statSync(tempPath);
        if (statsAfter.size < statsBefore.size) {
          fs.renameSync(tempPath, filePath);
        } else {
          fs.unlinkSync(tempPath);
        }
      }
    }

    const relativeWebpPath = publicSubPath
      ? `/uploads/images/${publicSubPath}/${parsedPath.name}.webp`
      : `/uploads/images/${parsedPath.name}.webp`;

    return {
      originalPath: filePath,
      webpPath: webpPath,
      webpUrl: relativeWebpPath.replace(/\\/g, '/')
    };
  } catch (error) {
    console.warn(`[ImageOptimizer] Sharp optimization fallback for ${filePath}:`, error);
    return { originalPath: filePath };
  }
}
