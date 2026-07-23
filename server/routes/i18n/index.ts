import { Router } from 'express';
import i18nRouter from '../i18n';
import translationsRouter from '../translations';
import i18nCacheRouter from '../i18n-cache';
import translationAdminRouter from '../translation';

const router = Router();

router.use('/', i18nRouter);
router.use('/translations', translationsRouter);
router.use('/cache', i18nCacheRouter);
router.use('/admin', translationAdminRouter);

export default router;
