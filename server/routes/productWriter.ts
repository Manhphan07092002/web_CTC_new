import express from 'express';
import { generateAiProduct, scrapeProductFromUrl } from '../services/productWriter';

const router = express.Router();

/**
 * POST /api/ai/product/generate-product
 */
router.post('/generate-product', async (req, res) => {
  try {
    const { name, code, focusKeyword, style, targetLength, sampleText, productUrl, selectedImages } = req.body;

    if (!name && !productUrl && !sampleText) {
      return res.status(400).json({ message: 'Vui lòng nhập tên sản phẩm, dán link hoặc dán nội dung văn bản mẫu' });
    }

    console.log(`[Product AI Writer] Generating product: "${name}" (Style: ${style || 'technical'}, Has URL: ${!!productUrl}, Selected Imgs: ${selectedImages?.length || 0})`);
    const product = await generateAiProduct(
      name || '',
      code,
      focusKeyword,
      style,
      targetLength,
      sampleText,
      productUrl,
      selectedImages
    );

    res.json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error('[Product AI Writer Error]:', error.message || error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi tạo bài viết sản phẩm AI'
    });
  }
});

/**
 * POST /api/ai/product/scrape-product-url
 */
router.post('/scrape-product-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || !url.trim().startsWith('http')) {
      return res.status(400).json({ message: 'Vui lòng nhập đường link URL sản phẩm hợp lệ' });
    }

    console.log(`[Product AI Writer Scraper] Scraping URL: ${url}`);
    const data = await scrapeProductFromUrl(url.trim());

    res.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('[Product AI Scrape Error]:', error.message || error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi bóc tách URL sản phẩm'
    });
  }
});

export default router;
