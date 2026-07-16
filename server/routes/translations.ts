import express from 'express';
import { Translation, ITranslation } from '../../models/Translation';
import { isLanguageSupported, getAvailableLanguages } from '../utils/i18n-helpers';

const router = express.Router();

// Get all translations with filtering and pagination
router.get('/', async (req: any, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      language,
      namespace,
      status,
      search,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (language && isLanguageSupported(language)) {
      filter.language = language;
    }
    
    if (namespace) {
      filter.namespace = namespace;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { key: { $regex: search, $options: 'i' } },
        { value: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute queries
    const [translations, total] = await Promise.all([
      Translation.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Translation.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        translations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: req.i18n.formatSuccess('success')
    });
  } catch (error) {
    console.error('Error fetching translations:', error);
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get translation by ID
router.get('/:id', async (req: any, res) => {
  try {
    const translation = await Translation.findById(req.params.id);
    
    if (!translation) {
      return res.status(404).json({
        success: false,
        message: req.i18n.formatError('not_found')
      });
    }

    res.json({
      success: true,
      data: translation,
      message: req.i18n.formatSuccess('success')
    });
  } catch (error) {
    console.error('Error fetching translation:', error);
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Create new translation
router.post('/', async (req: any, res) => {
  try {
    const {
      key,
      namespace,
      language,
      value,
      description,
      context,
      isPlural,
      pluralForms,
      tags,
      createdBy
    } = req.body;

    // Validate required fields
    if (!key || !namespace || !language || !value) {
      return res.status(400).json({
        success: false,
        message: req.i18n.getTranslation('validation.required')
      });
    }

    // Validate language support
    if (!isLanguageSupported(language)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language',
        data: { supported: getAvailableLanguages().map(l => l.code) }
      });
    }

    // Check for existing translation
    const existing = await Translation.findOne({ key, namespace, language });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Translation already exists for this key, namespace, and language'
      });
    }

    // Create translation
    const translation = new Translation({
      key,
      namespace,
      language,
      value,
      description,
      context,
      isPlural: isPlural || false,
      pluralForms: isPlural ? pluralForms : undefined,
      tags: tags || [],
      createdBy,
      status: 'draft'
    });

    await translation.save();

    res.status(201).json({
      success: true,
      data: translation,
      message: 'Translation created successfully'
    });
  } catch (error) {
    console.error('Error creating translation:', error);
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Update translation
router.put('/:id', async (req: any, res) => {
  try {
    const {
      value,
      description,
      context,
      isPlural,
      pluralForms,
      tags,
      updatedBy
    } = req.body;

    const translation = await Translation.findById(req.params.id);
    
    if (!translation) {
      return res.status(404).json({
        success: false,
        message: req.i18n.formatError('not_found')
      });
    }

    // Update fields
    if (value !== undefined) translation.value = value;
    if (description !== undefined) translation.description = description;
    if (context !== undefined) translation.context = context;
    if (isPlural !== undefined) translation.isPlural = isPlural;
    if (pluralForms !== undefined) translation.pluralForms = pluralForms;
    if (tags !== undefined) translation.tags = tags;
    if (updatedBy !== undefined) translation.updatedBy = updatedBy;

    // Reset status to draft if value changed
    if (value !== undefined && translation.status === 'published') {
      translation.status = 'draft';
    }

    await translation.save();

    res.json({
      success: true,
      data: translation,
      message: 'Translation updated successfully'
    });
  } catch (error) {
    console.error('Error updating translation:', error);
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Approve translation
router.patch('/:id/approve', async (req: any, res) => {
  try {
    const { approvedBy } = req.body;
    
    const translation = await Translation.findById(req.params.id);
    
    if (!translation) {
      return res.status(404).json({
        success: false,
        message: req.i18n.formatError('not_found')
      });
    }

    translation.status = 'approved';
    translation.approvedBy = approvedBy;
    translation.approvedAt = new Date();
    await translation.save();

    res.json({
      success: true,
      data: translation,
      message: 'Translation approved successfully'
    });
  } catch (error) {
    console.error('Error approving translation:', error);
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Publish translation
router.patch('/:id/publish', async (req: any, res) => {
  try {
    const translation = await Translation.findById(req.params.id);
    
    if (!translation) {
      return res.status(404).json({
        success: false,
        message: req.i18n.formatError('not_found')
      });
    }

    if (translation.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Translation must be approved before publishing'
      });
    }

    translation.status = 'published';
    await translation.save();

    res.json({
      success: true,
      data: translation,
      message: 'Translation published successfully'
    });
  } catch (error) {
    console.error('Error publishing translation:', error);
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Deprecate translation
router.patch('/:id/deprecate', async (req: any, res) => {
  try {
    const translation = await Translation.findById(req.params.id);
    
    if (!translation) {
      return res.status(404).json({
        success: false,
        message: req.i18n.formatError('not_found')
      });
    }

    translation.status = 'deprecated';
    await translation.save();

    res.json({
      success: true,
      data: translation,
      message: 'Translation deprecated successfully'
    });
  } catch (error) {
    console.error('Error deprecating translation:', error);
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Delete translation
router.delete('/:id', async (req: any, res) => {
  try {
    const translation = await Translation.findByIdAndDelete(req.params.id);
    
    if (!translation) {
      return res.status(404).json({
        success: false,
        message: req.i18n.formatError('not_found')
      });
    }

    res.json({
      success: true,
      message: 'Translation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting translation:', error);
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Bulk operations
router.post('/bulk', async (req: any, res) => {
  try {
    const { action, translationIds, data } = req.body;

    if (!action || !translationIds || !Array.isArray(translationIds)) {
      return res.status(400).json({
        success: false,
        message: req.i18n.getTranslation('validation.required')
      });
    }

    let result;

    switch (action) {
      case 'approve':
        result = await Translation.updateMany(
          { _id: { $in: translationIds } },
          { 
            status: 'approved',
            approvedBy: data?.approvedBy,
            approvedAt: new Date()
          }
        );
        break;

      case 'publish':
        result = await Translation.updateMany(
          { _id: { $in: translationIds }, status: 'approved' },
          { status: 'published' }
        );
        break;

      case 'deprecate':
        result = await Translation.updateMany(
          { _id: { $in: translationIds } },
          { status: 'deprecated' }
        );
        break;

      case 'delete':
        result = await Translation.deleteMany({ _id: { $in: translationIds } });
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid bulk action'
        });
    }

    res.json({
      success: true,
      data: {
        action,
        affected: result.modifiedCount || result.deletedCount,
        total: translationIds.length
      },
      message: `Bulk ${action} completed successfully`
    });
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get translation statistics
router.get('/stats/overview', async (req: any, res) => {
  try {
    const { language, namespace } = req.query;

    // Build match conditions
    const matchConditions: any = {};
    if (language && isLanguageSupported(language)) {
      matchConditions.language = language;
    }
    if (namespace) {
      matchConditions.namespace = namespace;
    }

    // Aggregate statistics
    const stats = await Translation.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byStatus: {
            $push: {
              status: '$status',
              count: 1
            }
          },
          byLanguage: {
            $push: {
              language: '$language',
              count: 1
            }
          },
          byNamespace: {
            $push: {
              namespace: '$namespace',
              count: 1
            }
          },
          totalUsage: { $sum: '$usageCount' },
          avgUsage: { $avg: '$usageCount' },
          lastUpdated: { $max: '$updatedAt' }
        }
      }
    ]);

    // Process status counts
    const statusCounts = stats[0]?.byStatus.reduce((acc: any, item: any) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {}) || {};

    // Process language counts
    const languageCounts = stats[0]?.byLanguage.reduce((acc: any, item: any) => {
      acc[item.language] = (acc[item.language] || 0) + 1;
      return acc;
    }, {}) || {};

    // Process namespace counts
    const namespaceCounts = stats[0]?.byNamespace.reduce((acc: any, item: any) => {
      acc[item.namespace] = (acc[item.namespace] || 0) + 1;
      return acc;
    }, {}) || {};

    res.json({
      success: true,
      data: {
        total: stats[0]?.total || 0,
        statusBreakdown: statusCounts,
        languageBreakdown: languageCounts,
        namespaceBreakdown: namespaceCounts,
        usage: {
          total: stats[0]?.totalUsage || 0,
          average: Math.round(stats[0]?.avgUsage || 0)
        },
        lastUpdated: stats[0]?.lastUpdated
      },
      message: req.i18n.formatSuccess('success')
    });
  } catch (error) {
    console.error('Error fetching translation statistics:', error);
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Export translations to JSON
router.get('/export/:language/:namespace?', async (req: any, res) => {
  try {
    const { language, namespace } = req.params;

    if (!isLanguageSupported(language)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language'
      });
    }

    const filter: any = { 
      language, 
      status: { $in: ['approved', 'published'] }
    };
    
    if (namespace) {
      filter.namespace = namespace;
    }

    const translations = await Translation.find(filter).lean();

    // Group by namespace
    const grouped = translations.reduce((acc: any, translation) => {
      if (!acc[translation.namespace]) {
        acc[translation.namespace] = {};
      }
      
      // Handle nested keys (e.g., "greeting.hello")
      const keys = translation.key.split('.');
      let current = acc[translation.namespace];
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = translation.value;
      return acc;
    }, {});

    res.json({
      success: true,
      data: namespace ? grouped[namespace] : grouped,
      meta: {
        language,
        namespace: namespace || 'all',
        exportedAt: new Date().toISOString(),
        totalTranslations: translations.length
      }
    });
  } catch (error) {
    console.error('Error exporting translations:', error);
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;
