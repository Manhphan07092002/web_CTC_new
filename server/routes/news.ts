import { Router } from 'express';
import { db } from '../../services/db-mongodb';
import { applyTranslationsToArray, applyTranslations, TRANSLATION_FIELDS, SupportedLanguage, SUPPORTED_LANGUAGES } from '../../models';
import { translateNews } from '../services/translate';
import { triggerInstantIndexing } from '../services/indexing';
import { logger } from "../../utils/logger";

const router = Router();

// Validate file đính kèm tin tức: tối đa 5 file, mỗi file ≤ 200MB
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_SIZE = 200 * 1024 * 1024;
const ALLOWED_ATTACHMENT_EXTS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.zip', '.rar'];

function validateAttachments(attachments: any): string | null {
  if (attachments === undefined) return null;
  if (!Array.isArray(attachments)) return 'File đính kèm không hợp lệ';
  if (attachments.length > MAX_ATTACHMENTS) return `Tối đa ${MAX_ATTACHMENTS} file đính kèm mỗi bài viết`;
  for (const a of attachments) {
    if (!a || typeof a.fileUrl !== 'string' || !a.fileUrl.trim()) return 'File đính kèm thiếu đường dẫn';
    const ext = a.fileUrl.toLowerCase().slice(a.fileUrl.toLowerCase().lastIndexOf('.'));
    if (!ALLOWED_ATTACHMENT_EXTS.includes(ext)) return `Định dạng file đính kèm không hỗ trợ (${ext})`;
    if (typeof a.fileSize === 'number' && a.fileSize > MAX_ATTACHMENT_SIZE) return `File "${a.fileName || a.fileUrl}" vượt quá 200MB`;
  }
  return null;
}

// Helper to get language from request
const getLanguage = (req: any): SupportedLanguage => {
  const lang = (req.query.lang as string) || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'vi';
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage) ? lang as SupportedLanguage : 'vi';
};

router.get('/', async (req, res) => {
  try {
    const lang = getLanguage(req);
    const includeAll = req.query.includeAll === 'true' || !!req.headers.authorization;
    let items = await db.news.getAll();
    
    // Đảm bảo các bài chờ duyệt (pending) hoặc nháp (draft) không hiển thị trên trang công khai
    if (!includeAll) {
      items = items.filter((item: any) => !item.status || item.status === 'published');
    }
    
    if (lang !== 'vi') {
      items = applyTranslationsToArray(items, [...TRANSLATION_FIELDS.news], lang);
    }
    
    res.json(items);
  } catch (error) {
    logger.error('Error getting news', error);
    res.status(500).json({ message: 'Failed to get news' });
  }
});

router.get('/latest', async (req, res) => {
  try {
    const lang = getLanguage(req);
    const limit = Number(req.query.limit) || 3;
    let items = await db.news.getLatest(limit);
    
    if (lang !== 'vi') {
      items = applyTranslationsToArray(items, [...TRANSLATION_FIELDS.news], lang);
    }
    
    res.json(items);
  } catch (error) {
    logger.error('Error getting latest news', error);
    res.status(500).json({ message: 'Failed to get latest news' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(404).json({ message: 'News not found' });
    }
    const lang = getLanguage(req);
    let newsItem = await db.news.getById(id);
    if (!newsItem) return res.status(404).json({ message: 'News not found' });
    
    if (lang !== 'vi') {
      newsItem = applyTranslations(newsItem, [...TRANSLATION_FIELDS.news], lang);
    }
    
    res.json(newsItem);
  } catch (error) {
    logger.error('Error getting news by id', error);
    res.status(404).json({ message: 'News not found' });
  }
});

router.post('/', async (req, res) => {
  try {
    const attachError = validateAttachments(req.body?.attachments);
    if (attachError) return res.status(400).json({ message: attachError });
    let translatedData = req.body;
    try {
      translatedData = await translateNews(req.body);
    } catch (e) {
      logger.warn('⚠️ Auto-translate skipped:', e);
    }
    const created = await db.news.add(translatedData);
    logger.log('News created:', created?._id || created?.id);
    
    // Helper tao Clean SEO URL cho Indexing
    const getCleanUrl = (item: any) => {
      const fullId = (item._id || item.id || '').toString();
      const shortHash = fullId.length >= 8 ? fullId.slice(-8) : fullId;
      const slugStr = item.slug || (item.title ? item.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-') : 'tin-tuc');
      return `/news/${slugStr}-${shortHash}`;
    };

    // Auto Instant Indexing (Chỉ ép index khi bài viết ĐÃ ĐƯỢC DUYỆT & XUẤT BẢN)
    if (created && (!created.status || created.status === 'published')) {
      try {
        triggerInstantIndexing(getCleanUrl(created)).catch(() => {});
      } catch (_) {}
    }

    res.status(201).json(created);
  } catch (error: any) {
    logger.error('Error creating news:', error?.stack || error?.message || error);
    res.status(500).json({ message: error?.message || 'Failed to create news', error: String(error?.stack || error) });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const attachError = validateAttachments(req.body?.attachments);
    if (attachError) return res.status(400).json({ message: attachError });
    let translatedData = req.body;
    try {
      translatedData = await translateNews(req.body);
    } catch (e) {
      logger.warn('⚠️ Auto-translate skipped:', e);
    }
    const updated = await db.news.update(req.params.id, translatedData);
    if (!updated) return res.status(404).json({ message: 'News not found' });
    logger.log('News updated with translations:', req.params.id);

    // Helper tao Clean SEO URL cho Indexing
    const getCleanUrl = (item: any) => {
      const fullId = (item._id || item.id || '').toString();
      const shortHash = fullId.length >= 8 ? fullId.slice(-8) : fullId;
      const slugStr = item.slug || (item.title ? item.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-') : 'tin-tuc');
      return `/news/${slugStr}-${shortHash}`;
    };

    // Auto Instant Indexing (Chỉ ép index khi bài viết ĐÃ ĐƯỢC DUYỆT & XUẤT BẢN)
    if (!updated.status || updated.status === 'published') {
      try {
        triggerInstantIndexing(getCleanUrl(updated)).catch(() => {});
      } catch (_) {}
    }

    res.json(updated);
  } catch (error: any) {
    logger.error('Error updating news:', error?.stack || error?.message || error);
    res.status(500).json({ message: error?.message || 'Failed to update news', error: String(error?.stack || error) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await db.news.delete(id);
    if (!ok) return res.status(404).json({ message: 'News not found' });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting news', error);
    res.status(500).json({ message: 'Failed to delete news' });
  }
});

router.post('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined') return res.status(400).json({ message: 'Invalid ID' });
    await db.news.incrementViewCount(id);
    res.json({ success: true });
  } catch (error) {
    logger.error('Error incrementing view count:', error);
    res.status(500).json({ message: 'Failed to increment view count' });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined') return res.status(400).json({ message: 'Invalid ID' });
    await db.news.incrementLikesCount(id);
    res.json({ success: true });
  } catch (error) {
    logger.error('Error incrementing likes count:', error);
    res.status(500).json({ message: 'Failed to increment likes count' });
  }
});

// Comments routes
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, userId } = req.query;
    const comments = await db.comments.getByNewsId(id, {
      email: typeof email === 'string' ? email : undefined,
      userId: typeof userId === 'string' ? userId : undefined,
    });
    res.json(comments);
  } catch (error) {
    logger.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

router.post('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, content, parentId, replyToName } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập họ và tên của bạn' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập email của bạn' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Email không hợp lệ. Vui lòng nhập đúng định dạng (ví dụ: name@example.com)' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập nội dung ý kiến thảo luận' });
    }

    const newComment = await db.comments.add({
      newsId: id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      content: content.trim(),
      parentId: parentId || null,
      replyToName: replyToName ? replyToName.trim() : undefined
    });
    res.status(201).json(newComment);
  } catch (error) {
    logger.error('Error posting comment:', error);
    res.status(500).json({ message: 'Failed to post comment' });
  }
});

router.post('/comments/:commentId/like', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { email, userId } = req.body;

    if (!email && !userId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email hoặc đăng nhập để thích bình luận' });
    }
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ message: 'Email không hợp lệ để ghi nhận lượt thích' });
      }
    }

    const result = await db.comments.toggleLike(commentId, { email, userId });
    res.json({ success: true, ...result });
  } catch (error: any) {
    logger.error('Error liking comment:', error);
    res.status(500).json({ message: error?.message || 'Failed to like comment' });
  }
});

// Admin Comments Moderation routes
router.get('/comments/admin/all', async (req, res) => {
  try {
    const comments = await db.comments.getAllForAdmin();
    res.json(comments);
  } catch (error) {
    logger.error('Error fetching admin comments:', error);
    res.status(500).json({ message: 'Failed to fetch admin comments' });
  }
});

router.post('/comments/:commentId/reply', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { reply, repliedBy } = req.body;
    const updated = await db.comments.replyComment(commentId, reply || '', repliedBy);
    res.json(updated);
  } catch (error) {
    logger.error('Error replying comment:', error);
    res.status(500).json({ message: 'Failed to reply comment' });
  }
});

router.delete('/comments/:commentId/reply', async (req, res) => {
  try {
    const { commentId } = req.params;
    const updated = await db.comments.deleteReply(commentId);
    res.json(updated);
  } catch (error) {
    logger.error('Error deleting reply:', error);
    res.status(500).json({ message: 'Failed to delete reply' });
  }
});

router.delete('/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const ok = await db.comments.delete(commentId);
    if (!ok) return res.status(404).json({ message: 'Comment not found' });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

export default router;
