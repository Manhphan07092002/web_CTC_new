import express from 'express';
import { generateAiArticle } from '../services/aiWriter';

const router = express.Router();

/**
 * POST /api/ai/generate-article
 * Accepts { title: string, focusKeyword?: string }
 * Returns Yoast 100/100 generated article
 */
router.post('/generate-article', async (req, res) => {
  try {
    const { title, focusKeyword, tone, targetLength, referenceContent } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập tiêu đề bài viết' });
    }

    console.log(`[AI Writer] Generating article for topic: "${title}" (Tone: ${tone || 'journalistic'}, Length: ${targetLength || 'medium'}, Has Reference Content: ${!!referenceContent})`);
    const article = await generateAiArticle(title, focusKeyword, tone, targetLength, referenceContent);

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

export default router;
