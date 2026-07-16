import { Router } from 'express';
import { db } from '../../services/db-mongodb';
import { applyTranslationsToArray, applyTranslations, TRANSLATION_FIELDS, SupportedLanguage, SUPPORTED_LANGUAGES } from '../../models';
import { translateNews } from '../services/translate';

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
    const lang = getLanguage(req);
    let newsItem = await db.news.getById(req.params.id);
    if (!newsItem) return res.status(404).json({ message: 'News not found' });
    
    if (lang !== 'vi') {
      newsItem = applyTranslations(newsItem, [...TRANSLATION_FIELDS.news], lang);
    }
    
    res.json(newsItem);
  } catch (error) {
    console.error('Error getting news by id', error);
    res.status(500).json({ message: 'Failed to get news' });
  }
});

router.post('/', async (req, res) => {
  try {
    // Auto-translate news
    const translatedData = await translateNews(req.body);
    const created = await db.news.add(translatedData);
    console.log('News created with translations:', created.id);
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
    res.json(updated);
  } catch (error) {
    console.error('Error updating news', error);
    res.status(500).json({ message: 'Failed to update news' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await db.news.delete(req.params.id);
    if (!ok) return res.status(404).json({ message: 'News not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting news', error);
    res.status(500).json({ message: 'Failed to delete news' });
  }
});

export default router;
