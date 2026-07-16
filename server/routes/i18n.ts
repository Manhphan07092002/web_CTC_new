import express from 'express';
import { 
  getAvailableLanguages, 
  getLanguageInfo, 
  isLanguageSupported,
  getTranslationStats,
  checkTranslationCompleteness
} from '../utils/i18n-helpers';

const router = express.Router();

// Get all available languages
router.get('/languages', (req: any, res) => {
  try {
    const languages = getAvailableLanguages();
    const currentLanguage = req.language || 'vi';
    
    res.json({
      success: true,
      data: {
        current: currentLanguage,
        available: languages,
        total: languages.length
      },
      message: req.i18n.formatSuccess('success')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get specific language info
router.get('/languages/:code', (req: any, res) => {
  try {
    const { code } = req.params;
    const languageInfo = getLanguageInfo(code);
    
    if (!languageInfo) {
      return res.status(404).json({
        success: false,
        message: req.i18n.formatError('not_found'),
        data: null
      });
    }
    
    res.json({
      success: true,
      data: languageInfo,
      message: req.i18n.formatSuccess('success')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Set user language preference (via cookie)
router.post('/language', (req: any, res) => {
  try {
    const { language } = req.body;
    
    if (!language) {
      return res.status(400).json({
        success: false,
        message: req.i18n.formatError('required'),
        data: null
      });
    }
    
    if (!isLanguageSupported(language)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language',
        data: { supported: getAvailableLanguages().map(l => l.code) }
      });
    }
    
    // Set cookie for language preference
    res.cookie('i18next', language, {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    res.json({
      success: true,
      data: {
        language,
        languageInfo: getLanguageInfo(language)
      },
      message: 'Language preference updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get translation for specific key(s)
router.post('/translate', (req: any, res) => {
  try {
    const { keys, language, options = {} } = req.body;
    
    if (!keys) {
      return res.status(400).json({
        success: false,
        message: req.i18n.formatError('required'),
        data: null
      });
    }
    
    const targetLanguage = language || req.language;
    
    if (!isLanguageSupported(targetLanguage)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language',
        data: { supported: getAvailableLanguages().map(l => l.code) }
      });
    }
    
    let translations: any;
    
    if (Array.isArray(keys)) {
      translations = req.i18n.getTranslations(keys, options);
    } else if (typeof keys === 'string') {
      translations = { [keys]: req.i18n.getTranslation(keys, options) };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Keys must be string or array of strings',
        data: null
      });
    }
    
    res.json({
      success: true,
      data: {
        language: targetLanguage,
        translations
      },
      message: req.i18n.formatSuccess('success')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get translation statistics
router.get('/stats', (req: any, res) => {
  try {
    const stats = getTranslationStats();
    
    // Group by language
    const statsByLanguage = stats.reduce((acc: any, stat) => {
      if (!acc[stat.language]) {
        acc[stat.language] = {
          language: stat.language,
          languageInfo: getLanguageInfo(stat.language),
          namespaces: [],
          totalKeys: 0,
          translatedKeys: 0,
          averageCompletion: 0
        };
      }
      
      acc[stat.language].namespaces.push({
        namespace: stat.namespace,
        totalKeys: stat.totalKeys,
        translatedKeys: stat.translatedKeys,
        completionPercentage: stat.completionPercentage,
        missingKeys: stat.missingKeys
      });
      
      acc[stat.language].totalKeys += stat.totalKeys;
      acc[stat.language].translatedKeys += stat.translatedKeys;
      
      return acc;
    }, {});
    
    // Calculate average completion for each language
    Object.keys(statsByLanguage).forEach(lang => {
      const langStats = statsByLanguage[lang];
      langStats.averageCompletion = langStats.totalKeys > 0 
        ? Math.round((langStats.translatedKeys / langStats.totalKeys) * 100)
        : 0;
    });
    
    res.json({
      success: true,
      data: {
        overview: Object.values(statsByLanguage),
        detailed: stats
      },
      message: req.i18n.formatSuccess('success')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get translation completeness for specific language and namespace
router.get('/stats/:language/:namespace', (req: any, res) => {
  try {
    const { language, namespace } = req.params;
    
    if (!isLanguageSupported(language)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language',
        data: { supported: getAvailableLanguages().map(l => l.code) }
      });
    }
    
    const stats = checkTranslationCompleteness(language, namespace);
    
    res.json({
      success: true,
      data: stats,
      message: req.i18n.formatSuccess('success')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get localized formats (date, number, currency)
router.get('/formats', (req: any, res) => {
  try {
    const now = new Date();
    const sampleNumber = 1234567.89;
    const sampleAmount = 1000000;
    
    res.json({
      success: true,
      data: {
        language: req.language,
        formats: {
          date: req.i18n.getLocalizedDate(now),
          number: req.i18n.getLocalizedNumber(sampleNumber),
          currency: {
            vnd: req.i18n.getLocalizedCurrency(sampleAmount, 'VND'),
            usd: req.i18n.getLocalizedCurrency(sampleAmount / 24000, 'USD'),
            eur: req.i18n.getLocalizedCurrency(sampleAmount / 26000, 'EUR')
          }
        }
      },
      message: req.i18n.formatSuccess('success')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;
