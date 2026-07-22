
import { GoogleGenAI, Chat } from "@google/genai";
import { api } from "./api";

export interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: number;
}

let chatSession: Chat | null = null;
let currentConfigKey = "";

const DEFAULT_SYSTEM_INSTRUCTION = `
BẠN LÀ TRỢ LÝ AI CAO CẤP CỦA CÔNG TY CỔ PHẦN XÂY LẮP BƯU ĐIỆN MIỀN TRUNG (CTC).
Nhiệm vụ của bạn là tư vấn bán hàng, giải đáp kỹ thuật và hỗ trợ khách hàng về Điện Năng Lượng Mặt Trời và Xây Lắp một cách chuyên nghiệp, thân thiện và chính xác.

### 1. THÔNG TIN CÔNG TY (CTC)
- **Tên đầy đủ:** Công ty Cổ phần Xây lắp Bưu điện Miền Trung.
- **Thương hiệu:** CTC.
- **Thành lập:** 2004.
- **Tổng Giám Đốc:** Ông Nguyễn Văn Duy.
- **Địa chỉ:** 50B Nguyễn Du, Phường Thạch Thang, Quận Hải Châu, TP Đà Nẵng.
- **Điện thoại bàn:** 0236 3745 555
- **Hotline/Zalo:** 0915 059 666 (Luôn nhắc đến số này khi cần chốt sale hoặc hỗ trợ khẩn cấp).
- **Email:** info@ctcdn.vn.
- **Lĩnh vực:** Tổng thầu EPC, Xây lắp viễn thông, Năng lượng tái tạo, Xây dựng dân dụng và công nghiệp.

### 2. SẢN PHẨM & DỊCH VỤ CHỦ LỰC
- **Điện mặt trời áp mái (Rooftop):** Cho hộ gia đình, nhà xưởng, văn phòng. Giảm nhiệt, tiết kiệm điện.
- **Trang trại điện mặt trời (Solar Farm):** Quy mô công nghiệp, hòa lưới quốc gia.
- **Điện mặt trời nổi (Floating Solar):** Lắp trên hồ thủy điện, hồ chứa nước.
- **Thiết bị phân phối (Tier 1):**
  - **Tấm pin:** Canadian Solar, Longi (Công suất 450W - 550W+). Bảo hành 12 năm vật lý, 25 năm hiệu suất.
  - **Inverter:** Huawei, SMA (Đức). Bảo hành 5-10 năm.

### 3. QUY TẮC ỨNG XỬ & TRẢ LỜI
- **Xưng hô:** Xưng "Em" hoặc "CTC", gọi khách là "Quý khách" hoặc "Anh/Chị".
- **Giọng điệu:** Nhiệt tình, lễ phép, chuyên gia, tin cậy.
- **Định dạng:** Sử dụng gạch đầu dòng (-) cho các danh sách để dễ đọc. Dùng in đậm (**) cho các thông tin quan trọng như số điện thoại, tên sản phẩm.
- **Độ dài:** Trả lời ngắn gọn, đi thẳng vào vấn đề (dưới 150 từ), tránh lan man.
`;

// Key Pool Index memory for active working key per provider
const activeKeyIndexes: Record<string, number> = {};

const isQuotaOrAuthError = (errMsg: string, statusCode?: number): boolean => {
  const lower = (errMsg || '').toLowerCase();
  return (
    statusCode === 429 ||
    statusCode === 401 ||
    statusCode === 403 ||
    lower.includes('quota') ||
    lower.includes('rate limit') ||
    lower.includes('resource_exhausted') ||
    lower.includes('exceeded') ||
    lower.includes('too many requests') ||
    lower.includes('invalid api key') ||
    lower.includes('unauthorized') ||
    lower.includes('capacity')
  );
};

const executeGeminiCall = async (apiKey: string, modelName: string, temperature: number, systemInstruction: string, text: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  const chat = ai.chats.create({
    model: modelName,
    config: {
      systemInstruction: systemInstruction,
      temperature: temperature,
    }
  });
  const result = await chat.sendMessage({ message: text });
  return result.text || "";
};

const executeOpenAICall = async (endpoint: string, apiKey: string, modelName: string, temperature: number, systemInstruction: string, text: string): Promise<string> => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: text }
      ],
      temperature: temperature
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    const err: any = new Error(message);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
};

export const chatService = {
  sendMessage: async (text: string): Promise<string> => {
    try {
      // 1. Fetch current settings from Admin DB
      let siteSettings: any = null;
      try {
        siteSettings = await api.settings.get();
      } catch (e) {
        console.warn("Could not fetch settings for AI Chat, using environment fallback");
      }

      // Check if AI is disabled in Admin Settings
      if (siteSettings && siteSettings.aiEnabled === false) {
        return "Trợ lý AI hiện đang tạm bảo trì. Quý khách vui lòng liên hệ Hotline/Zalo: 0915 059 666 để được hỗ trợ trực tiếp ạ.";
      }

      // Helper to safely get environment variables in browser without crashing on process.env
      const getEnvVar = (name: string): string => {
        try {
          const metaEnv = (import.meta as any).env;
          if (metaEnv && metaEnv[name]) return metaEnv[name];
        } catch {}
        try {
          if (typeof process !== 'undefined' && (process as any)?.env?.[name]) {
            return (process as any).env[name] || '';
          }
        } catch {}
        return '';
      };

      // Resolve AI Provider
      const provider = siteSettings?.aiProvider || 'gemini';
      const envFallback = getEnvVar('VITE_GEMINI_API_KEY') || getEnvVar('GEMINI_API_KEY');
      const rawApiKeyString = siteSettings?.aiApiKey || envFallback || "";
      
      // Parse Key Pool (support comma or newline separated keys)
      const keys = rawApiKeyString
        .split(/[\n,;]+/)
        .map((k: string) => k.trim())
        .filter((k: string) => k.length > 0);

      if (keys.length === 0) {
        return `Rất tiếc, API Key cho nhà cung cấp AI (${provider.toUpperCase()}) chưa được cấu hình. Quý khách vui lòng truy cập Cài đặt hệ thống để bổ sung ạ.`;
      }

      // Default model mapping per provider
      const defaultModels: Record<string, string> = {
        gemini: 'gemini-2.5-flash',
        groq: 'llama-3.3-70b-versatile',
        openai: 'gpt-4o-mini',
        deepseek: 'deepseek-chat',
        custom: 'llama-3.3-70b-versatile'
      };

      const modelName = siteSettings?.aiModel || defaultModels[provider] || 'gemini-2.5-flash';
      const temperature = siteSettings?.aiTemperature ?? 0.6;
      const systemInstruction = siteSettings?.aiSystemInstruction?.trim() || DEFAULT_SYSTEM_INSTRUCTION;

      // Base URL for OpenAI compatible providers
      let baseUrl = "";
      if (provider === 'groq') {
        baseUrl = "https://api.groq.com/openai/v1";
      } else if (provider === 'openai') {
        baseUrl = "https://api.openai.com/v1";
      } else if (provider === 'deepseek') {
        baseUrl = "https://api.deepseek.com/v1";
      } else if (provider === 'custom') {
        baseUrl = (siteSettings?.aiBaseUrl || '').replace(/\/$/, '') || "https://api.groq.com/openai/v1";
      }
      const endpoint = `${baseUrl}/chat/completions`;

      // Active key starting index for failover loop
      const startIndex = activeKeyIndexes[provider] || 0;
      let lastError: any = null;

      // Loop through key pool with automatic failover / rotation
      for (let attempt = 0; attempt < keys.length; attempt++) {
        const keyIndex = (startIndex + attempt) % keys.length;
        const currentKey = keys[keyIndex];

        try {
          let responseText = "";

          if (provider === 'gemini') {
            responseText = await executeGeminiCall(currentKey, modelName, temperature, systemInstruction, text);
          } else {
            responseText = await executeOpenAICall(endpoint, currentKey, modelName, temperature, systemInstruction, text);
          }

          // Save working key index for future calls
          activeKeyIndexes[provider] = keyIndex;
          if (attempt > 0) {
            console.log(`[AI Key Rotation] Successfully failed over to key #${keyIndex + 1}/${keys.length}`);
          }

          return responseText || "Xin lỗi, hệ thống chưa nhận được phản hồi. Vui lòng thử lại sau.";
        } catch (err: any) {
          lastError = err;
          const errMsg = err?.message || '';
          const errStatus = err?.status;

          if (keys.length > 1) {
            console.warn(`[AI Key Pool Warning] Key #${keyIndex + 1}/${keys.length} hit error (${errMsg}). Auto-rotating to key #${((keyIndex + 1) % keys.length) + 1}...`);
            if (isQuotaOrAuthError(errMsg, errStatus)) {
              continue; // Exceeded/quota error -> try next key immediately
            }
            continue; // General error -> also try next key
          } else {
            throw err;
          }
        }
      }

      throw lastError || new Error("Tất cả API Key trong danh sách đều hết Quota hoặc không khả dụng.");

    } catch (error: any) {
      console.error("AI Chat Final Error:", error);
      return `Hiện tại kết nối AI gián đoạn (${error?.message || 'Hết Quota'}). Quý khách vui lòng gọi Hotline/Zalo: 0915 059 666 để được hỗ trợ ngay ạ.`;
    }
  },

  resetSession: () => {
    chatSession = null;
    currentConfigKey = "";
  }
};
