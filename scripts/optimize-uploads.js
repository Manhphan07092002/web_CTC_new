import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        const parsed = path.parse(fullPath);
        const webpPath = path.join(parsed.dir, `${parsed.name}.webp`);

        if (!fs.existsSync(webpPath)) {
          try {
            const statsBefore = fs.statSync(fullPath);
            let img = sharp(fullPath);
            const meta = await img.metadata();

            if (meta.width && meta.width > 1920) {
              img = img.resize({ width: 1920, fit: 'inside', withoutEnlargement: true });
            }

            await img.clone().webp({ quality: 80, effort: 4 }).toFile(webpPath);
            const statsWebp = fs.statSync(webpPath);
            console.log(`[WebP] Created ${parsed.base} -> ${parsed.name}.webp (${Math.round(statsBefore.size/1024)}KB -> ${Math.round(statsWebp.size/1024)}KB)`);

            if (statsBefore.size > 300 * 1024) {
              const tempPath = path.join(parsed.dir, `temp_${parsed.base}`);
              if (ext === '.png') {
                await sharp(fullPath).png({ quality: 80, compressionLevel: 8 }).toFile(tempPath);
              } else {
                await sharp(fullPath).jpeg({ quality: 80, mozjpeg: true }).toFile(tempPath);
              }
              if (fs.existsSync(tempPath)) {
                const statsAfter = fs.statSync(tempPath);
                if (statsAfter.size < statsBefore.size) {
                  fs.renameSync(tempPath, fullPath);
                  console.log(`[Compressed Original] ${parsed.base} (${Math.round(statsBefore.size/1024)}KB -> ${Math.round(statsAfter.size/1024)}KB)`);
                } else {
                  fs.unlinkSync(tempPath);
                }
              }
            }
          } catch (err) {
            console.error(`Error processing ${fullPath}:`, err);
          }
        }
      }
    }
  }
}

const uploadsDir = path.resolve('uploads');
if (fs.existsSync(uploadsDir)) {
  console.log(`Starting image optimization in ${uploadsDir}...`);
  processDirectory(uploadsDir).then(() => {
    console.log('Image optimization complete.');
  }).catch(err => {
    console.error('Failed:', err);
  });
}
