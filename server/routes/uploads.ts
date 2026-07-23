import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = Router();

const uploadRoot = path.join(process.cwd(), 'uploads');
const imagesDir = path.join(uploadRoot, 'images');

// Ensure folders exist
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot);
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.pdf'
]);

import crypto from 'crypto';

/**
 * Generates a secure yet human-readable filename:
 * Preserves sanitized original filename base + appends a 8-char crypto hash token
 * Example: "Báo giá điện 2024.jpg" -> "bao-gia-dien-2024_a8f3b2c9.jpg"
 */
function generateSecureFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || '';
  const baseName = path.basename(originalName, ext);
  
  // Sanitize base name (remove accents, dangerous chars, spaces to dashes)
  const cleanBase = baseName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'file';

  // Limit max base length to 60 chars for clean URLs
  const safeBase = cleanBase.slice(0, 60);

  // Cryptographic random token for uniqueness and security
  const hashToken = crypto.randomBytes(4).toString('hex');

  return `${safeBase}_${hashToken}${ext}`;
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    // Get path from query params or form data
    const subPath = String(req.query.path || req.body.path || '');
    const targetDir = subPath ? path.join(imagesDir, subPath) : imagesDir;
    
    // Security check: prevent directory traversal
    const resolvedTarget = path.resolve(targetDir);
    const resolvedImagesDir = path.resolve(imagesDir);
    if (!resolvedTarget.startsWith(resolvedImagesDir)) {
      return cb(new Error('Access denied: Invalid upload directory path'), imagesDir);
    }

    // Ensure target directory exists
    if (!fs.existsSync(resolvedTarget)) {
      fs.mkdirSync(resolvedTarget, { recursive: true });
    }
    
    cb(null, resolvedTarget);
  },
  filename: (_req, file, cb) => {
    const secureName = generateSecureFilename(file.originalname);
    cb(null, secureName);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_MIME_TYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type (${file.mimetype} / ${ext}). Allowed formats: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}`));
    }
  }
});

import { optimizeUploadedImage } from '../utils/image-optimizer';

// Upload single or multiple files (max 5)
router.post('/images', upload.array('files', 5), async (req, res) => {
  const files = (req as any).files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  // Get the path from query params or form data
  const subPath = String(req.query.path || req.body.path || '');
  
  const results = await Promise.all(
    files.map(async file => {
      const optResult = await optimizeUploadedImage(file.path, subPath);
      const relativeUrl = subPath ? `/uploads/images/${subPath}/${file.filename}` : `/uploads/images/${file.filename}`;
      
      return {
        filename: file.filename,
        url: relativeUrl.replace(/\\/g, '/'),
        webpUrl: optResult.webpUrl,
        size: file.size,
        mimetype: file.mimetype,
        originalName: file.originalname,
      };
    })
  );

  res.json({
    message: `Uploaded ${files.length} file(s) successfully`,
    files: results,
  });
});

// List all images (files and folders) with optional path parameter
router.get('/images', (req, res) => {
  const subPath = (req.query.path as string) || '';
  const targetDir = subPath ? path.join(imagesDir, subPath) : imagesDir;

  // Security check: prevent directory traversal
  const resolvedPath = path.resolve(targetDir);
  const resolvedImagesDir = path.resolve(imagesDir);
  if (!resolvedPath.startsWith(resolvedImagesDir)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Check if directory exists
  if (!fs.existsSync(targetDir)) {
    return res.status(404).json({ message: 'Directory not found' });
  }

  fs.readdir(targetDir, { withFileTypes: true }, (err, dirents) => {
    if (err) {
      console.error('Error reading directory', err);
      return res.status(500).json({ message: 'Failed to read directory' });
    }

    const list = dirents.map((dirent) => {
      const relativePath = subPath ? `${subPath}/${dirent.name}` : dirent.name;
      const fullPath = path.join(targetDir, dirent.name);
      
      let size;
      try {
        const stats = fs.statSync(fullPath);
        size = stats.isFile() ? stats.size : undefined;
      } catch (e) {
        console.error('Error getting file stats:', e);
        size = undefined;
      }
      
      return {
        filename: dirent.name,
        url: `/uploads/images/${relativePath.replace(/\\/g, '/')}`,
        type: dirent.isDirectory() ? 'folder' : 'file',
        isDirectory: dirent.isDirectory(),
        size: size,
        path: relativePath.replace(/\\/g, '/'),
      };
    });

    res.json(list);
  });
});

// Create a new folder
router.post('/images/create-folder', (req, res) => {
  const { path: folderPath } = req.body;

  if (!folderPath) {
    return res.status(400).json({ message: 'Folder path is required' });
  }

  const fullPath = path.join(imagesDir, folderPath);

  // Security check: prevent directory traversal
  const resolvedPath = path.resolve(fullPath);
  const resolvedImagesDir = path.resolve(imagesDir);
  if (!resolvedPath.startsWith(resolvedImagesDir)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Check if folder already exists
  if (fs.existsSync(fullPath)) {
    return res.status(409).json({ message: 'Folder already exists' });
  }

  try {
    fs.mkdirSync(fullPath, { recursive: true });
    res.status(201).json({ message: 'Folder created successfully', path: folderPath });
  } catch (err) {
    console.error('Error creating folder', err);
    res.status(500).json({ message: 'Failed to create folder' });
  }
});

// Delete an image by filename (supports paths like folder/file.jpg)
router.delete('/images/:filepath(*)', (req, res) => {
  const filepath = req.params.filepath;
  const fullPath = path.join(imagesDir, filepath);

  // Security check: prevent directory traversal
  const resolvedPath = path.resolve(fullPath);
  const resolvedImagesDir = path.resolve(imagesDir);
  if (!resolvedPath.startsWith(resolvedImagesDir)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Check if it's a file or directory
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ message: 'File or folder not found' });
  }

  const stats = fs.statSync(fullPath);

  if (stats.isDirectory()) {
    // Delete directory recursively
    fs.rm(fullPath, { recursive: true, force: true }, (err) => {
      if (err) {
        console.error('Error deleting directory', err);
        return res.status(500).json({ message: 'Failed to delete directory' });
      }
      res.status(204).send();
    });
  } else {
    // Delete file
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error('Error deleting file', err);
        return res.status(500).json({ message: 'Failed to delete file' });
      }
      res.status(204).send();
    });
  }
});

export default router;
