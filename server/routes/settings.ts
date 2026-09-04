import { Router } from 'express';
import { db } from '../../services/db-mongodb';
import { requireAdmin } from '../middleware/auth';
import { apiCache } from '../utils/api-cache';

const router = Router();

// Cache GET settings for 5 minutes
router.use(apiCache.middleware(300, '/api/settings'));

const cleanSettingsUrls = (settings: any) => {
  if (!settings) return settings;
  const cleaned = { ...settings };
  const urlFields = ['logo', 'logoHeader', 'logoFooter', 'favicon', 'appleTouchIcon'];
  for (const field of urlFields) {
    if (typeof cleaned[field] === 'string') {
      // Convert full URLs containing any host/port pointing to /uploads to relative paths
      cleaned[field] = cleaned[field].replace(/^https?:\/\/[^\/]+(\/uploads\/)/, '$1');
    }
  }
  return cleaned;
};

// GET /api/settings - Get site settings
router.get('/', async (req, res) => {
  try {
    const settings = await db.settings.get();
    res.json(cleanSettingsUrls(settings));
  } catch (error) {
    console.error('Error getting settings', error);
    res.status(500).json({ message: 'Failed to get settings' });
  }
});

// GET /api/settings/maintenance - Check maintenance status (for mobile app)
router.get('/maintenance', async (req, res) => {
  try {
    const settings = await db.settings.get();
    res.json({
      maintenance: settings.maintenance || false,
      message: settings.maintenance 
        ? 'Hệ thống đang bảo trì. Vui lòng quay lại sau.'
        : 'Hệ thống hoạt động bình thường',
      siteName: settings.siteName,
      email: settings.email,
      phone: settings.phone
    });
  } catch (error) {
    console.error('Error checking maintenance status', error);
    res.status(500).json({ message: 'Failed to check maintenance status' });
  }
});

// PUT /api/settings - Update site settings
router.put('/', requireAdmin, async (req, res) => {
  try {
    const cleanedBody = cleanSettingsUrls(req.body);
    const updated = await db.settings.update(cleanedBody);
    apiCache.delByPrefix('/api/settings');
    res.json(cleanSettingsUrls(updated));
  } catch (error) {
    console.error('Error updating settings', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

// Helper: Mask API key for security
function maskApiKey(key: string): string {
  if (!key || key.length <= 8) return '********';
  return key.slice(0, 7) + '••••••••••' + key.slice(-4);
}

// POST /api/settings/test-ai - Test one or multiple AI API keys
router.post('/test-ai', requireAdmin, async (req, res) => {
  try {
    const fetchFn: any = typeof globalThis.fetch === 'function'
      ? globalThis.fetch
      : (await import('node-fetch')).default;
    const body = req.body || {};
    
    // Get keys from body or DB settings
    let rawApiKey = (body.apiKey || '').trim();
    if (!rawApiKey) {
      const dbSettings = await db.settings.get();
      rawApiKey = (dbSettings?.aiApiKey || '').trim();
    }

    if (!rawApiKey) {
      return res.status(400).json({
        success: false,
        message: 'Chưa có API Key nào được cung cấp để kiểm tra. Vui lòng nhập ít nhất 1 API Key.',
        results: []
      });
    }

    const rawProvider = (body.provider || 'gemini').toLowerCase();
    const rawModel = (body.model || '').trim();
    const baseUrl = (body.baseUrl || '').trim();

    const keys = rawApiKey
      .split(/[\n,;]+/)
      .map((k: string) => k.trim())
      .filter((k: string) => k.length > 0);

    if (keys.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách API Key rỗng.',
        results: []
      });
    }

    const testPrompt = "Hãy trả lời đúng 1 câu ngắn gọn bằng tiếng Việt: 'Kết nối AI thành công!'";
    const results: Array<{
      keyIndex: number;
      keyMasked: string;
      provider: string;
      model: string;
      status: 'success' | 'error';
      latencyMs: number;
      responseSnippet?: string;
      errorMessage?: string;
      note?: string;
    }> = [];

    const PROVIDER_MODELS: Record<string, string[]> = {
      groq: [
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'deepseek-r1-distill-llama-70b',
        'openai/gpt-oss-120b'
      ],
      openai: [
        'gpt-4o-mini',
        'gpt-4o',
        'gpt-3.5-turbo'
      ],
      gemini: [
        'gemini-2.5-flash',
        'gemini-1.5-flash',
        'gemini-2.5-pro',
        'gemini-1.5-pro'
      ],
      deepseek: [
        'deepseek-chat',
        'deepseek-reasoner'
      ]
    };

    for (let i = 0; i < keys.length; i++) {
      const currentKey = keys[i];
      const keyMasked = maskApiKey(currentKey);

      // Auto detect provider
      let provider = rawProvider;
      if (currentKey.startsWith('gsk_')) {
        provider = 'groq';
      } else if (currentKey.startsWith('AIza')) {
        provider = 'gemini';
      } else if (currentKey.startsWith('sk-proj-') && provider === 'groq') {
        provider = 'openai';
      }

      // Candidate models
      const defaultModel = provider === 'gemini' ? 'gemini-2.5-flash' :
        provider === 'groq' ? 'llama-3.3-70b-versatile' :
        provider === 'openai' ? 'gpt-4o-mini' :
        provider === 'deepseek' ? 'deepseek-chat' : 'llama-3.3-70b-versatile';

      let initialModel = rawModel;
      if (!initialModel) initialModel = defaultModel;

      // Filter models according to provider
      if (provider === 'gemini' && !initialModel.toLowerCase().includes('gemini')) initialModel = 'gemini-2.5-flash';
      if (provider === 'groq' && initialModel.toLowerCase().startsWith('gemini-')) initialModel = 'llama-3.3-70b-versatile';

      const candidateModels = [initialModel];
      const fallbacks = PROVIDER_MODELS[provider] || [];
      for (const fb of fallbacks) {
        if (!candidateModels.includes(fb)) {
          candidateModels.push(fb);
        }
      }

      let keySuccess = false;
      let primaryModelError = '';
      let lastError = '';
      let successfulModel = initialModel;
      let responseText = '';
      let latencyMs = 0;

      const startTime = Date.now();

      for (const testModel of candidateModels) {
        try {
          if (provider === 'gemini') {
            // Direct REST test for Google Gemini
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${encodeURIComponent(currentKey)}`;
            const resp = await fetchFn(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: testPrompt }] }],
                generationConfig: { maxOutputTokens: 60 }
              }),
              timeout: 10000
            } as any);

            latencyMs = Date.now() - startTime;

            if (!resp.ok) {
              const errBody: any = await resp.json().catch(() => ({}));
              const errMsg = errBody.error?.message || `HTTP ${resp.status}: ${resp.statusText}`;
              if (testModel === initialModel) {
                primaryModelError = errMsg;
              }
              if (resp.status === 429 || resp.status === 404 || errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('does not exist') || errMsg.toLowerCase().includes('decommissioned') || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('rate limit')) {
                lastError = `Model ${testModel} chạm giới hạn hoặc không khả dụng (${errMsg})`;
                continue; // Try next model
              }
              throw new Error(errMsg);
            }

            const data: any = await resp.json();
            responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Kết nối thành công!';
            successfulModel = testModel;
            keySuccess = true;
            break;
          } else {
            // OpenAI-compatible endpoints (Groq, OpenAI, DeepSeek, Custom)
            let endpoint = 'https://api.groq.com/openai/v1/chat/completions';
            if (provider === 'openai') {
              endpoint = 'https://api.openai.com/v1/chat/completions';
            } else if (provider === 'deepseek') {
              endpoint = 'https://api.deepseek.com/chat/completions';
            } else if (provider === 'custom') {
              endpoint = baseUrl ? `${baseUrl.replace(/\/+$/, '')}/chat/completions` : 'https://api.groq.com/openai/v1/chat/completions';
            }

            const resp = await fetchFn(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentKey}`
              },
              body: JSON.stringify({
                model: testModel,
                messages: [{ role: 'user', content: testPrompt }],
                max_tokens: 60
              }),
              timeout: 10000
            } as any);

            latencyMs = Date.now() - startTime;

            if (!resp.ok) {
              const errBody: any = await resp.json().catch(() => ({}));
              const errMsg = errBody.error?.message || `HTTP ${resp.status}: ${resp.statusText}`;
              if (testModel === initialModel) {
                primaryModelError = errMsg;
              }
              if (resp.status === 429 || resp.status === 404 || errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('does not exist') || errMsg.toLowerCase().includes('decommissioned') || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('rate limit')) {
                lastError = `Model ${testModel} chạm giới hạn hoặc không hỗ trợ (${errMsg})`;
                continue; // Try next candidate model
              }
              throw new Error(errMsg);
            }

            const data: any = await resp.json();
            responseText = data.choices?.[0]?.message?.content || 'Kết nối thành công!';
            successfulModel = testModel;
            keySuccess = true;
            break;
          }
        } catch (callErr: any) {
          latencyMs = Date.now() - startTime;
          const errMsg = callErr.message || String(callErr);
          if (testModel === initialModel) {
            primaryModelError = errMsg;
          }
          lastError = errMsg;
          // If error is 401 (Unauthorized) or 403 (Forbidden), stop trying other models on this key
          if (lastError.includes('401') || lastError.toLowerCase().includes('unauthorized') || lastError.toLowerCase().includes('invalid api key')) {
            break;
          }
        }
      }

      if (keySuccess) {
        results.push({
          keyIndex: i + 1,
          keyMasked,
          provider,
          model: successfulModel,
          status: 'success',
          latencyMs,
          responseSnippet: responseText.trim().replace(/\n+/g, ' ').slice(0, 150),
          note: successfulModel !== initialModel ? `(Tự động chuyển từ ${initialModel} sang ${successfulModel})` : undefined
        });
      } else {
        // User-friendly error diagnosis
        const errToDiagnose = primaryModelError || lastError;
        let friendlyErr = errToDiagnose;
        if (errToDiagnose.includes('401') || errToDiagnose.toLowerCase().includes('unauthorized') || errToDiagnose.toLowerCase().includes('invalid api key')) {
          friendlyErr = `Mã lỗi HTTP 401 (Unauthorized): API Key không chính xác hoặc đã bị xóa. Vui lòng kiểm tra lại trên Dashboard của ${provider.toUpperCase()}.`;
        } else if (errToDiagnose.includes('429') || errToDiagnose.toLowerCase().includes('quota') || errToDiagnose.toLowerCase().includes('rate limit') || errToDiagnose.toLowerCase().includes('rate_limit_exceeded')) {
          friendlyErr = `Mã lỗi HTTP 429 (Quota/Rate Limit): Key này đã hết hạn mức sử dụng hoặc vượt quá số request/phút (TPM/RPM) của gói miễn phí Groq. ${errToDiagnose}`;
        } else if (errToDiagnose.toLowerCase().includes('decommissioned')) {
          friendlyErr = `Model ${initialModel} đã ngừng hỗ trợ trên ${provider.toUpperCase()}. Hệ thống khuyên dùng 'llama-3.3-70b-versatile' hoặc 'llama-3.1-8b-instant'. Chi tiết: ${errToDiagnose}`;
        } else if (errToDiagnose.toLowerCase().includes('timeout') || errToDiagnose.toLowerCase().includes('etimedout')) {
          friendlyErr = `Quá thời gian kết nối (Timeout > 10s): Máy chủ AI không phản hồi kịp.`;
        }

        results.push({
          keyIndex: i + 1,
          keyMasked,
          provider,
          model: initialModel,
          status: 'error',
          latencyMs,
          errorMessage: friendlyErr
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const totalCount = results.length;
    const allSuccess = successCount === totalCount;

    return res.json({
      success: successCount > 0,
      allSuccess,
      summary: `${successCount}/${totalCount} API Key hoạt động tốt`,
      results
    });
  } catch (error: any) {
    console.error('Error testing AI API keys:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi kiểm tra API Key',
      results: []
    });
  }
});

export default router;

