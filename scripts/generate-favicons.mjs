import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateFavicons() {
  const sourceImage = 'uploads/images/logo/ctc-logo-new081120212030231682-jpg_1146dc73.jpg';
  console.log('Reading source image:', sourceImage);

  if (!fs.existsSync(sourceImage)) {
    console.error('Source image not found!');
    return;
  }

  // First, read metadata
  const meta = await sharp(sourceImage).metadata();
  console.log('Source Metadata:', meta);

  // Trim any unnecessary edge whitespace, then extend to a perfect square with white background
  const trimmed = await sharp(sourceImage)
    .trim()
    .toBuffer();

  const trimmedMeta = await sharp(trimmed).metadata();
  console.log('Trimmed size:', trimmedMeta.width, 'x', trimmedMeta.height);

  const maxDim = Math.max(trimmedMeta.width, trimmedMeta.height);
  const padding = Math.round(maxDim * 0.08); // 8% padding for great visibility at 16px/48px
  const canvasSize = maxDim + padding * 2;

  // Composite on white background with clean square
  const baseMasterBuffer = await sharp(trimmed)
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
    .png()
    .toBuffer();

  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Generate PNG sizes recommended by Google & Apple
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 }, // Google Search Recommended Multiple of 48px
    { name: 'favicon-96x96.png', size: 96 }, // Google Search 2x
    { name: 'favicon-144x144.png', size: 144 }, // Google Search 3x
    { name: 'favicon-192x192.png', size: 192 }, // Android / Chrome PWA
    { name: 'apple-touch-icon.png', size: 180 }, // iOS
    { name: 'apple-touch-icon-precomposed.png', size: 180 }, // Legacy iOS
    { name: 'favicon-512x512.png', size: 512 }, // Android PWA Splash / Google rich snippet
  ];

  for (const { name, size } of sizes) {
    const outPath = path.join(publicDir, name);
    await sharp(baseMasterBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(outPath);
    console.log(`Generated ${name} (${size}x${size})`);
  }

  // Generate favicon.ico (48x48 and 32x32)
  const ico48Buffer = await sharp(baseMasterBuffer)
    .resize(48, 48, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico48Buffer);
  console.log('Generated favicon.ico');

  // Also sync to dist if dist exists
  const distDir = path.resolve('dist');
  if (fs.existsSync(distDir)) {
    for (const { name } of sizes) {
      fs.copyFileSync(path.join(publicDir, name), path.join(distDir, name));
    }
    fs.copyFileSync(path.join(publicDir, 'favicon.ico'), path.join(distDir, 'favicon.ico'));
    console.log('Copied all favicons to dist/');
  }
}

generateFavicons().catch(console.error);
