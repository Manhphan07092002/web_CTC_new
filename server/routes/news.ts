import { Router } from 'express';
import { db } from '../../services/db-mongodb';
import { applyTranslationsToArray, applyTranslations, TRANSLATION_FIELDS, SupportedLanguage, SUPPORTED_LANGUAGES } from '../../models';
import { translateNews } from '../services/translate';
import { triggerInstantIndexing } from '../services/indexing';

const router = Router();

// Helper to get language from request
const getLanguage = (req: any): SupportedLanguage => {
  const lang = (req.query.lang as string) || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'vi';
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage) ? lang as SupportedLanguage : 'vi';
};

router.get('/', async (req, res) => {
  try {
    const lang = getLanguage(req);
    let items = await db.news.getAll();
    
    if (lang !== 'vi') {
      items = applyTranslationsToArray(items, [...TRANSLATION_FIELDS.news], lang);
    }
    
    res.json(items);
  } catch (error) {
    console.error('Error getting news', error);
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
    console.error('Error getting latest news', error);
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
    console.error('Error getting news by id', error);
    res.status(404).json({ message: 'News not found' });
  }
});

router.post('/', async (req, res) => {
  try {
    // Auto-translate news
    const translatedData = await translateNews(req.body);
    const created = await db.news.add(translatedData);
    console.log('News created with translations:', created.id);
    
    // Auto Instant Indexing (IndexNow + Google/Bing Ping)
    const newsId = created._id || created.id;
    triggerInstantIndexing(`/news/${newsId}`).catch(() => {});

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating news', error);
    res.status(500).json({ message: 'Failed to create news' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // Auto-translate updated content
    const translatedData = await translateNews(req.body);
    const updated = await db.news.update(req.params.id, translatedData);
    if (!updated) return res.status(404).json({ message: 'News not found' });
    console.log('News updated with translations:', req.params.id);

    // Auto Instant Indexing (IndexNow + Google/Bing Ping)
    const newsId = updated._id || updated.id;
    triggerInstantIndexing(`/news/${newsId}`).catch(() => {});

    res.json(updated);
  } catch (error) {
    console.error('Error updating news', error);
    res.status(500).json({ message: 'Failed to update news' });
  }
});

router.post('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined') return res.status(400).json({ message: 'Invalid ID' });
    await db.news.incrementViewCount(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    res.status(500).json({ message: 'Failed to increment view count' });
  }
});

// Comments routes
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await db.comments.getByNewsId(id);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

router.post('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, content } = req.body;
    if (!name || !content) {
      return res.status(400).json({ message: 'Name and content are required' });
    }
    const newComment = await db.comments.add({
      newsId: id,
      name: name.trim(),
      email: email ? email.trim() : '',
      content: content.trim()
    });
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ message: 'Failed to post comment' });
  }
});

router.post('/comments/:commentId/like', async (req, res) => {
  try {
    const { commentId } = req.params;
    await db.comments.likeComment(commentId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ message: 'Failed to like comment' });
  }
});

// Admin Comments Moderation routes
router.get('/comments/admin/all', async (req, res) => {
  try {
    const comments = await db.comments.getAllForAdmin();
    res.json(comments);
  } catch (error) {
    console.error('Error fetching admin comments:', error);
    res.status(500).json({ message: 'Failed to fetch admin comments' });
  }
});

router.post('/comments/:commentId/reply', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { reply } = req.body;
    if (!reply) return res.status(400).json({ message: 'Reply content required' });
    const updated = await db.comments.replyComment(commentId, reply.trim());
    res.json(updated);
  } catch (error) {
    console.error('Error replying comment:', error);
    res.status(500).json({ message: 'Failed to reply comment' });
  }
});

router.delete('/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const ok = await db.comments.delete(commentId);
    if (!ok) return res.status(404).json({ message: 'Comment not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

export default router;
