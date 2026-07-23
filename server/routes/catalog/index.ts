import { Router } from 'express';
import productsRouter from '../products';
import productCategoriesRouter from '../product-categories';
import projectsRouter from '../projects';
import projectCategoriesRouter from '../project-categories';
import newsRouter from '../news';
import newsCategoriesRouter from '../news-categories';
import resourcesRouter from '../resources';
import documentCategoriesRouter from '../document-categories';
import categoriesRouter from '../categories';

const router = Router();

router.use('/products', productsRouter);
router.use('/product-categories', productCategoriesRouter);
router.use('/projects', projectsRouter);
router.use('/project-categories', projectCategoriesRouter);
router.use('/news', newsRouter);
router.use('/news-categories', newsCategoriesRouter);
router.use('/resources', resourcesRouter);
router.use('/document-categories', documentCategoriesRouter);
router.use('/categories', categoriesRouter);

export default router;
