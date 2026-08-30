import { Router } from 'express';
import { db } from '../../services/db-mongodb';
import { applyTranslationsToArray, applyTranslations, TRANSLATION_FIELDS, SupportedLanguage, SUPPORTED_LANGUAGES } from '../../models';
import { translateProject } from '../services/translate';

const router = Router();

// Helper to get language from request
const getLanguage = (req: any): SupportedLanguage => {
  const lang = (req.query.lang as string) || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'vi';
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage) ? lang as SupportedLanguage : 'vi';
};

router.get('/', async (req, res) => {
  try {
    const lang = getLanguage(req);
    let projects = await db.projects.getAll();
    
    if (lang !== 'vi') {
      projects = applyTranslationsToArray(projects, [...TRANSLATION_FIELDS.project], lang);
    }
    
    res.json(projects);
  } catch (error) {
    console.error('Error getting projects', error);
    res.status(500).json({ message: 'Failed to get projects' });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const lang = getLanguage(req);
    const limit = Number(req.query.limit) || 4;
    let projects = await db.projects.getFeatured(limit);
    
    if (lang !== 'vi') {
      projects = applyTranslationsToArray(projects, [...TRANSLATION_FIELDS.project], lang);
    }
    
    res.json(projects);
  } catch (error) {
    console.error('Error getting featured projects', error);
    res.status(500).json({ message: 'Failed to get featured projects' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const lang = getLanguage(req);
    let project = await db.projects.getById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (lang !== 'vi') {
      project = applyTranslations(project, [...TRANSLATION_FIELDS.project], lang);
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error getting project by id', error);
    res.status(500).json({ message: 'Failed to get project' });
  }
});

const generateSlug = (text: string): string => {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.slug && data.title) {
      data.slug = `${generateSlug(data.title)}-${Date.now().toString(36)}`;
    }
    if (!data.capacity) {
      data.capacity = 'Tiêu chuẩn';
    }
    if (!data.completionDate) {
      data.completionDate = data.completedYear ? String(data.completedYear) : new Date().getFullYear().toString();
    }
    if (!data.image) {
      data.image = '/assets/images/default-project.jpg';
    }
    if (!data.description) {
      data.description = data.title || 'Dự án';
    }
    if (!data.location) {
      data.location = 'Việt Nam';
    }

    // Auto-translate project safely
    let translatedData = data;
    try {
      translatedData = await translateProject(data);
    } catch (e) {
      console.warn('Project translation skipped:', e);
    }
    const created = await db.projects.add(translatedData);
    console.log('Project created:', created.id);
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating project', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // Auto-translate updated content safely
    let translatedData = req.body;
    try {
      translatedData = await translateProject(req.body);
    } catch (e) {
      console.warn('Project translation skipped on update:', e);
    }
    const updated = await db.projects.update(req.params.id, translatedData);
    if (!updated) return res.status(404).json({ message: 'Project not found' });
    console.log('Project updated with translations:', req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating project', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await db.projects.delete(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Project not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

export default router;
