import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = Router();

const uploadRoot = path.join(process.cwd(), 'uploads');

// Ensure root upload folder exists
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/bmp',
  'image/tiff',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  // Video & Audio
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
  'audio/x-m4a',
  // Archives & General
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip',
  'application/octet-stream',
]);

const ALLOWED_EXTENSIONS = new Set([
  // Images
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.ico', '.bmp', '.tiff',
  // Documents
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv',
  // Video & Audio
  '.mp4', '.webm', '.mov', '.avi', '.mkv', '.mp3', '.wav', '.ogg', '.m4a',
  // Archives
  '.zip', '.rar', '.7z', '.tar', '.gz'
]);

import crypto from 'crypto';

/**
 * Generates a secure yet human-readable filename:
 * Preserves sanitized original filename base + appends a 8-char crypto hash token
 * Example: "Báo giá điện 2024.pdf" -> "bao-gia-dien-2024_a8f3b2c9.pdf"
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
    const rawSubPath = String(req.query.path || req.body.path || '').trim();
    const sanitizedSubPath = rawSubPath.replace(/^(\.\.(\/|\\|$))+/, '').replace(/^\/+|\/+$/g, '');
    const targetDir = sanitizedSubPath ? path.join(uploadRoot, sanitizedSubPath) : uploadRoot;
    
    // Security check: prevent directory traversal
    const resolvedTarget = path.resolve(targetDir);
    const resolvedUploadRoot = path.resolve(uploadRoot);
    if (!resolvedTarget.startsWith(resolvedUploadRoot)) {
      return cb(new Error('Access denied: Invalid upload directory path'), uploadRoot);
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
    fileSize: 50 * 1024 * 1024, // 50MB max per file (supports PDFs, docs, videos)
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.has(ext) || ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Định dạng tệp không được hỗ trợ (${file.mimetype} / ${ext}).`));
    }
  }
});

import { optimizeUploadedImage } from '../utils/image-optimizer';

const handleUpload = (req: any, res: any, next: any) => {
  upload.any()(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Lỗi tải lên tệp tin' });
    }
    next();
  });
};

// Upload single or multiple files (supports POST /, POST /images, POST /files)
router.post(['/', '/images', '/files'], handleUpload, async (req, res) => {
  const files = (req as any).files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'Không có tệp tin nào được tải lên' });
  }

  // Get the path from query params or form data
  const rawSubPath = String(req.query.path || req.body.path || '').trim();
  const subPath = rawSubPath.replace(/^\/+|\/+$/g, '');
  
  const results = await Promise.all(
    files.map(async file => {
      const optResult = await optimizeUploadedImage(file.path, subPath);
      const relativeUrl = subPath ? `/uploads/${subPath}/${file.filename}` : `/uploads/${file.filename}`;
      
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
    message: `Đã tải lên thành công ${files.length} tệp tin`,
    files: results,
    url: results[0]?.url,
    webpUrl: results[0]?.webpUrl,
  });
});

// List all files and folders with optional path parameter
router.get(['/', '/images', '/files'], (req, res) => {
  const rawSubPath = String(req.query.path || '').trim();
  const subPath = rawSubPath.replace(/^\/+|\/+$/g, '');
  const targetDir = subPath ? path.join(uploadRoot, subPath) : uploadRoot;

  // Security check: prevent directory traversal
  const resolvedPath = path.resolve(targetDir);
  const resolvedUploadRoot = path.resolve(uploadRoot);
  if (!resolvedPath.startsWith(resolvedUploadRoot)) {
    return res.status(403).json({ message: 'Truy cập bị từ chối' });
  }

  // Check if directory exists
  if (!fs.existsSync(targetDir)) {
    return res.status(404).json({ message: 'Thư mục không tồn tại' });
  }

  fs.readdir(targetDir, { withFileTypes: true }, (err, dirents) => {
    if (err) {
      console.error('Error reading directory', err);
      return res.status(500).json({ message: 'Không thể đọc thư mục' });
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
        url: `/uploads/${relativePath.replace(/\\/g, '/')}`,
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
router.post(['/create-folder', '/images/create-folder', '/files/create-folder'], (req, res) => {
  const { path: folderPath } = req.body;

  if (!folderPath) {
    return res.status(400).json({ message: 'Đường dẫn thư mục là bắt buộc' });
  }

  const cleanFolderPath = String(folderPath).replace(/^\/+|\/+$/g, '');
  const fullPath = path.join(uploadRoot, cleanFolderPath);

  // Security check: prevent directory traversal
  const resolvedPath = path.resolve(fullPath);
  const resolvedUploadRoot = path.resolve(uploadRoot);
  if (!resolvedPath.startsWith(resolvedUploadRoot)) {
    return res.status(403).json({ message: 'Truy cập bị từ chối' });
  }

  // Check if folder already exists
  if (fs.existsSync(fullPath)) {
    return res.status(409).json({ message: 'Thư mục đã tồn tại' });
  }

  try {
    fs.mkdirSync(fullPath, { recursive: true });
    res.status(201).json({ message: 'Tạo thư mục thành công', path: cleanFolderPath });
  } catch (err) {
    console.error('Error creating folder', err);
    res.status(500).json({ message: 'Không thể tạo thư mục' });
  }
});

// Rename a file or folder
router.post(['/rename', '/images/rename', '/files/rename'], (req, res) => {
  const { oldPath, newName } = req.body;

  if (!oldPath || !newName) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đường dẫn cũ và tên mới' });
  }

  // Sanitize newName: disallow slashes, backslashes, colons, or traversal tokens
  const sanitizedNewName = String(newName).trim().replace(/[/\\:*?"<>|]/g, '');
  if (!sanitizedNewName || sanitizedNewName === '.' || sanitizedNewName === '..') {
    return res.status(400).json({ message: 'Tên mới không hợp lệ' });
  }

  const cleanOldPath = String(oldPath).replace(/^\/+|\/+$/g, '');
  const fullOldPath = path.join(uploadRoot, cleanOldPath);
  const resolvedOldPath = path.resolve(fullOldPath);
  const resolvedUploadRoot = path.resolve(uploadRoot);

  // Security check: prevent directory traversal
  if (!resolvedOldPath.startsWith(resolvedUploadRoot) || resolvedOldPath === resolvedUploadRoot) {
    return res.status(403).json({ message: 'Truy cập bị từ chối' });
  }

  if (!fs.existsSync(resolvedOldPath)) {
    return res.status(404).json({ message: 'Tệp hoặc thư mục không tồn tại' });
  }

  const parentDir = path.dirname(resolvedOldPath);
  const fullNewPath = path.join(parentDir, sanitizedNewName);
  const resolvedNewPath = path.resolve(fullNewPath);

  // Security check: ensure target stays inside uploadRoot and inside same parent directory
  if (!resolvedNewPath.startsWith(resolvedUploadRoot) || path.dirname(resolvedNewPath) !== parentDir) {
    return res.status(403).json({ message: 'Truy cập bị từ chối' });
  }

  // Check if destination already exists
  if (fs.existsSync(resolvedNewPath)) {
    return res.status(409).json({ message: 'Tên này đã tồn tại trong thư mục. Vui lòng chọn tên khác.' });
  }

  try {
    fs.renameSync(resolvedOldPath, resolvedNewPath);
    
    // Calculate new relative path
    const relativeNewPath = path.relative(uploadRoot, resolvedNewPath).replace(/\\/g, '/');
    res.json({
      success: true,
      message: 'Đổi tên thành công',
      newName: sanitizedNewName,
      newPath: relativeNewPath,
      newUrl: `/uploads/${relativeNewPath}`
    });
  } catch (err: any) {
    console.error('Error renaming file or folder:', err);
    res.status(500).json({ message: 'Đổi tên thất bại: ' + (err.message || 'Lỗi server') });
  }
});

// Delete a file or folder by path
router.delete(['/:filepath(*)', '/images/:filepath(*)', '/files/:filepath(*)'], (req, res) => {
  const filepath = req.params.filepath;
  if (!filepath) {
    return res.status(400).json({ message: 'Đường dẫn tệp tin là bắt buộc' });
  }
  const cleanPath = String(filepath).replace(/^\/+|\/+$/g, '');
  const fullPath = path.join(uploadRoot, cleanPath);

  // Security check: prevent directory traversal & deleting root
  const resolvedPath = path.resolve(fullPath);
  const resolvedUploadRoot = path.resolve(uploadRoot);
  if (!resolvedPath.startsWith(resolvedUploadRoot) || resolvedPath === resolvedUploadRoot) {
    return res.status(403).json({ message: 'Truy cập bị từ chối: Không thể xóa thư mục gốc' });
  }

  // Check if it's a file or directory
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ message: 'Không tìm thấy tệp hoặc thư mục' });
  }

  const stats = fs.statSync(fullPath);

  if (stats.isDirectory()) {
    // Delete directory recursively
    fs.rm(fullPath, { recursive: true, force: true }, (err) => {
      if (err) {
        console.error('Error deleting directory', err);
        return res.status(500).json({ message: 'Lỗi khi xóa thư mục' });
      }
      res.status(204).send();
    });
  } else {
    // Delete file
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error('Error deleting file', err);
        return res.status(500).json({ message: 'Lỗi khi xóa tệp tin' });
      }
      res.status(204).send();
    });
  }
});

// Bulk delete files and folders
router.post(['/bulk-delete', '/images/bulk-delete', '/files/bulk-delete'], (req, res) => {
  const { paths } = req.body;
  if (!Array.isArray(paths) || paths.length === 0) {
    return res.status(400).json({ message: 'Danh sách tệp tin cần xóa không hợp lệ' });
  }

  const resolvedUploadRoot = path.resolve(uploadRoot);
  let deletedCount = 0;
  const errors: string[] = [];

  for (const itemPath of paths) {
    try {
      const cleanItemPath = String(itemPath).replace(/^\/+|\/+$/g, '');
      const fullPath = path.join(uploadRoot, cleanItemPath);
      const resolvedPath = path.resolve(fullPath);

      if (!resolvedPath.startsWith(resolvedUploadRoot) || resolvedPath === resolvedUploadRoot) {
        errors.push(`Từ chối truy cập: ${itemPath}`);
        continue;
      }

      if (!fs.existsSync(resolvedPath)) {
        continue;
      }

      const stats = fs.statSync(resolvedPath);
      if (stats.isDirectory()) {
        fs.rmSync(resolvedPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(resolvedPath);
      }
      deletedCount++;
    } catch (e: any) {
      errors.push(`Lỗi xóa ${itemPath}: ${e.message}`);
    }
  }

  res.json({
    success: true,
    deletedCount,
    errors: errors.length > 0 ? errors : undefined,
    message: `Đã xóa thành công ${deletedCount} mục`
  });
});

export default router;
