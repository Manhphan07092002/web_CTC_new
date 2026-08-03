import express from 'express';
import { generateAiArticle, scrapeArticleFromUrl } from '../services/aiWriter';

const router = express.Router();

/**
 * POST /api/ai/generate-article
 * Accepts { title: string, focusKeyword?: string, ... }
 * Returns Yoast 100/100 generated article
 */
router.post('/generate-article', async (req, res) => {
  try {
    const { title, focusKeyword, tone, targetLength, referenceContent, articleUrl, structure, selectedImages } = req.body;
    if (!title && !articleUrl) {
      return res.status(400).json({ message: 'Vui lòng nhập tiêu đề hoặc dán link bài viết' });
    }

    console.log(`[AI Writer] Generating article for topic: "${title}" (Tone: ${tone || 'journalistic'}, Length: ${targetLength || 'medium'}, Structure: ${structure || 'inverted_pyramid'}, Has URL: ${!!articleUrl}, Selected Images: ${selectedImages?.length || 0})`);
    const article = await generateAiArticle(title || '', focusKeyword, tone, targetLength, referenceContent, articleUrl, structure, selectedImages);

    res.json({
      success: true,
      data: article
    });
  } catch (error: any) {
    console.error('[AI Writer Error]:', error.message || error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Lỗi khi tạo bài viết AI' 
    });
  }
});

/**
 * POST /api/ai/scrape-url
 * Dedicated scraper endpoint — returns raw scraped data without generating article
 * Accepts { url: string }
 * Returns { title, paragraphs, images, videos }
 */
router.post('/scrape-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) {
      return res.status(400).json({ success: false, message: 'URL không hợp lệ' });
    }

    console.log(`[AI Scraper] Scraping URL: ${url}`);
    const { scrapedTitle, scrapedParagraphs, scrapedImages, scrapedVideos } = await scrapeArticleFromUrl(url.trim());

    res.json({
      success: true,
      data: {
        title: scrapedTitle,
        paragraphs: scrapedParagraphs,
        rawText: scrapedParagraphs.join('\n\n'),
        images: scrapedImages,
        videos: scrapedVideos
      }
    });
  } catch (error: any) {
    console.error('[AI Scraper Error]:', error.message || error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi cào dữ liệu từ URL' });
  }
});

export default router;

