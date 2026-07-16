import express from 'express';

const router = express.Router();

// Test route for basic greeting
router.get('/hello', (req: any, res) => {
  const t = req.t;
  res.json({
    message: t('greeting.hello'),
    welcome: t('greeting.welcome'),
    language: req.language,
    languages: req.languages
  });
});

// Test route with parameters and pluralization
router.get('/order/:count', (req: any, res) => {
  const t = req.t;
  const count = Number(req.params.count);
  
  res.json({
    message: t('order.items', { count }),
    count: count,
    language: req.language
  });
});

// Test route for authentication namespace
router.get('/auth/login', (req: any, res) => {
  const t = req.t;
  
  res.json({
    title: t('auth:login.title'),
    email: t('auth:login.email'),
    password: t('auth:login.password'),
    submit: t('auth:login.submit'),
    language: req.language
  });
});

// Test route for products namespace
router.get('/products/info', (req: any, res) => {
  const t = req.t;
  
  res.json({
    title: t('products:title'),
    categories: {
      solar_panels: t('products:categories.solar_panels'),
      inverters: t('products:categories.inverters'),
      batteries: t('products:categories.batteries')
    },
    actions: {
      add_to_cart: t('products:actions.add_to_cart'),
      request_quote: t('products:actions.request_quote')
    },
    language: req.language
  });
});

// Test route for validation messages
router.post('/validate', (req: any, res) => {
  const t = req.t;
  
  const errors = {
    required: t('validation.required'),
    email_invalid: t('validation.email_invalid'),
    password_min: t('validation.password_min', { min: 8 })
  };
  
  res.json({
    errors,
    language: req.language
  });
});

// Test route to get all available languages
router.get('/languages', (req: any, res) => {
  const t = req.t;
  
  res.json({
    current_language: req.language,
    available_languages: ['vi', 'en', 'ko', 'ja', 'zh', 'de'],
    greeting_in_current: t('greeting.hello'),
    status: t('status.success')
  });
});

export default router;
