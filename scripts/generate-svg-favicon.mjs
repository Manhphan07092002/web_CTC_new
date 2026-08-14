import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateSvgFavicon() {
  const sourceImage = 'uploads/images/logo/ctc-logo-new081120212030231682-jpg_1146dc73.jpg';
  
  // Trim and center on white square
  const trimmed = await sharp(sourceImage)
    .trim()
    .toBuffer();

  const trimmedMeta = await sharp(trimmed).metadata();
  const maxDim = Math.max(trimmedMeta.width, trimmedMeta.height);
  const padding = Math.round(maxDim * 0.08);

  const squarePng = await sharp(trimmed)
    .resize({
      fit: 'contain',
      width: maxDim,
      height: maxDim,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png({ quality: 100 })
    .toBuffer();

  const base64Png = squarePng.toString('base64');

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <clipPath id="circleClip">
      <rect width="512" height="512" rx="64" />
    </clipPath>
  </defs>
  <rect width="512" height="512" rx="64" fill="#ffffff" />
  <image href="data:image/png;base64,${base64Png}" x="16" y="16" width="480" height="480" />
</svg>`;

  fs.writeFileSync(path.resolve('public/favicon.svg'), svgContent);
  if (fs.existsSync(path.resolve('dist'))) {
    fs.writeFileSync(path.resolve('dist/favicon.svg'), svgContent);
  }
  console.log('Successfully updated public/favicon.svg and dist/favicon.svg with real CTC logo!');
}

generateSvgFavicon().catch(console.error);
