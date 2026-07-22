import { Router } from 'express';
import { Product, Project, News, Testimonial, Partner, User, TeamMember } from '../models';
import {
  MOCK_PRODUCTS,
  MOCK_PROJECTS,
  MOCK_NEWS,
  MOCK_TESTIMONIALS,
  MOCK_PARTNERS,
  MOCK_USERS,
  MOCK_TEAM
} from '../../constants';

const router = Router();

router.post('/', async (req, res) => {
  // CRITICAL SECURITY CHECK: Block seed in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      status: 403,
      message: 'Database re-seeding is disabled in production environment for security reasons.'
    });
  }

  // Secret header verification for development
  const seedSecret = process.env.SEED_SECRET;
  if (seedSecret && req.headers['x-seed-secret'] !== seedSecret) {
    return res.status(401).json({
      status: 401,
      message: 'Invalid or missing seed secret header (x-seed-secret).'
    });
  }

  try {
    // Clear existing data
    await Promise.all([
      Product.deleteMany({}),
      Project.deleteMany({}),
      News.deleteMany({}),
      Testimonial.deleteMany({}),
      Partner.deleteMany({}),
      User.deleteMany({}),
      TeamMember.deleteMany({})
    ]);

    // Insert mock data
    const [products, projects, news, testimonials, partners, users, teamMembers] = await Promise.all([
      Product.insertMany(MOCK_PRODUCTS),
      Project.insertMany(MOCK_PROJECTS),
      News.insertMany(MOCK_NEWS),
      Testimonial.insertMany(MOCK_TESTIMONIALS),
      Partner.insertMany(MOCK_PARTNERS),
      User.insertMany(MOCK_USERS),
      TeamMember.insertMany(MOCK_TEAM)
    ]);

    res.json({
      status: 'ok',
      message: 'Database seeded successfully',
      counts: {
        products: products.length,
        projects: projects.length,
        news: news.length,
        testimonials: testimonials.length,
        partners: partners.length,
        users: users.length,
        teamMembers: teamMembers.length
      }
    });
  } catch (error) {
    console.error('Error seeding database', error);
    res.status(500).json({ message: 'Failed to seed database' });
  }
});

export default router;
