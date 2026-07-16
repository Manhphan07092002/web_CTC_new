import { Router } from 'express';
import { db } from '../../services/db-mongodb';
import { SupportedLanguage, SUPPORTED_LANGUAGES, applyTranslations, TRANSLATION_FIELDS } from '../../models';
import { translateTestimonial } from '../services/translate';

const router = Router();

// Helper to get language from request
const getLanguage = (req: any): SupportedLanguage => {
  const lang = (req.query.lang as string) || 'vi';
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage) ? lang as SupportedLanguage : 'vi';
};

// Remove Vietnamese diacritics
const removeVietnameseDiacritics = (str: string): string => {
  if (!str) return str;
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

router.get('/', async (req, res) => {
  try {
    const lang = getLanguage(req);
    const items = await db.testimonials.getAll();
    
    // Apply translations if not Vietnamese
    const result = lang !== 'vi' 
      ? items.map((item: any) => {
          const translated = applyTranslations(item, [...TRANSLATION_FIELDS.testimonial], lang);
          return {
            ...translated,
            name: removeVietnameseDiacritics(translated.name)
          };
        })
      : items;
    
    res.json(result);
  } catch (error) {
    console.error('Error getting testimonials', error);
    res.status(500).json({ message: 'Failed to get testimonials' });
  }
});

router.post('/', async (req, res) => {
  try {
    // Auto-translate testimonial
    const translatedData = await translateTestimonial(req.body);
    const created = await db.testimonials.add(translatedData);
    console.log('Testimonial created with translations:', created.id);
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating testimonial', error);
    res.status(500).json({ message: 'Failed to create testimonial' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // Auto-translate updated content
    const translatedData = await translateTestimonial(req.body);
    const updated = await db.testimonials.update(req.params.id, translatedData);
    if (!updated) return res.status(404).json({ message: 'Testimonial not found' });
    console.log('Testimonial updated with translations:', req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating testimonial', error);
    res.status(500).json({ message: 'Failed to update testimonial' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await db.testimonials.delete(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Testimonial not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting testimonial', error);
    res.status(500).json({ message: 'Failed to delete testimonial' });
  }
});

export default router;
