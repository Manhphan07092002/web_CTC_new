
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

const executeGeminiCallStream = async (
  apiKey: string, 
  modelName: string, 
  temperature: number, 
  systemInstruction: string, 
  text: string, 
  onChunk: (chunk: string) => void
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  const chat = ai.chats.create({
    model: modelName,
    config: {
      systemInstruction: systemInstruction,
      temperature: temperature,
    }
  });
  let fullText = "";
  try {
    const responseStream = await chat.sendMessageStream({ message: text });
    for await (const chunk of responseStream) {
      const textChunk = chunk.text || "";
      if (textChunk) {
        fullText += textChunk;
        onChunk(textChunk);
      }
    }
    return fullText;
  } catch (err) {
    if (!fullText) {
      const result = await chat.sendMessage({ message: text });
      const textResult = result.text || "";
      if (textResult) {
        onChunk(textResult);
      }
      return textResult;
    }
    return fullText;
  }
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

const executeOpenAICallStream = async (
  endpoint: string,
  apiKey: string,
  modelName: string,
  temperature: number,
  systemInstruction: string,
  text: string,
  onChunk: (chunk: string) => void
): Promise<string> => {
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
      temperature: temperature,
      stream: true
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    const err: any = new Error(message);
    err.status = response.status;
    throw err;
  }

  if (!response.body) {
    throw new Error("Response body is not readable for streaming");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data: ")) {
        const dataStr = trimmed.slice(6);
        if (dataStr === "[DONE]") break;
        try {
          const parsed = JSON.parse(dataStr);
          const chunkText = parsed.choices?.[0]?.delta?.content || "";
          if (chunkText) {
            fullText += chunkText;
            onChunk(chunkText);
          }
        } catch {
          // ignore chunk parse error
        }
      }
    }
  }

  return fullText;
};

export const chatService = {
  sendMessage: async (text: string): Promise<string> => {
    return chatService.sendMessageStream(text, () => {});
  },

  sendMessageStream: async (text: string, onChunk: (chunk: string) => void): Promise<string> => {
    try {
      let siteSettings: any = null;
      try {
        siteSettings = await api.settings.get();
      } catch (e) {
        console.warn("Could not fetch settings for AI Chat, using environment fallback");
      }

      if (siteSettings && siteSettings.aiEnabled === false) {
        const msg = "Trợ lý AI hiện đang tạm bảo trì. Quý khách vui lòng liên hệ Hotline/Zalo: 0915 059 666 để được hỗ trợ trực tiếp ạ.";
        onChunk(msg);
        return msg;
      }

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

      const provider = siteSettings?.aiProvider || 'gemini';
      const envFallback = getEnvVar('VITE_GEMINI_API_KEY') || getEnvVar('GEMINI_API_KEY');
      const rawApiKeyString = siteSettings?.aiApiKey || envFallback || "";
      
      const keys = rawApiKeyString
        .split(/[\n,;]+/)
        .map((k: string) => k.trim())
        .filter((k: string) => k.length > 0);

      if (keys.length === 0) {
        const msg = `Rất tiếc, API Key cho nhà cung cấp AI (${provider.toUpperCase()}) chưa được cấu hình. Quý khách vui lòng truy cập Cài đặt hệ thống để bổ sung ạ.`;
        onChunk(msg);
        return msg;
      }

      const defaultModels: Record<string, string> = {
        gemini: 'gemini-2.5-flash',
        groq: 'llama-3.3-70b-versatile',
        openai: 'gpt-4o-mini',
        deepseek: 'deepseek-chat',
        custom: 'llama-3.3-70b-versatile'
      };

      const modelName = siteSettings?.aiModel || defaultModels[provider] || 'gemini-2.5-flash';
      const temperature = siteSettings?.aiTemperature ?? 0.6;
      let baseSystemInstruction = siteSettings?.aiSystemInstruction?.trim() || DEFAULT_SYSTEM_INSTRUCTION;

      // ============================================================
      // RAG CONTEXT RETRIEVAL (Real-Time Database Augmentation)
      // ============================================================
      try {
        const products = await api.products.getAll();
        if (products && Array.isArray(products) && products.length > 0) {
          const queryLower = text.toLowerCase();
          const matchedProducts = products.filter(p => {
            const nameStr = (p.name || p.title || '').toLowerCase();
            const catStr = (p.category || '').toLowerCase();
            const descStr = (p.description || '').toLowerCase();
            const brandStr = (p.brand || '').toLowerCase();
            return queryLower.split(/\s+/).some(word => 
              word.length >= 3 && (nameStr.includes(word) || catStr.includes(word) || descStr.includes(word) || brandStr.includes(word))
            );
          }).slice(0, 5);

          const targetList = matchedProducts.length > 0 ? matchedProducts : products.slice(0, 4);

          const ragContext = `\n\n### DỮ LIỆU SẢN PHẨM THỰC TẾ TỪ CƠ SỞ DỮ LIỆU CTC (RAG CONTEXT):\n` +
            targetList.map(p => 
              `- **${p.name || p.title}** | Giá: ${p.price ? p.price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ báo giá'} | Danh mục: ${p.category || 'Điện mặt trời'} | Mô tả: ${(p.description || 'Sản phẩm chính hãng CTC, bảo hành dài hạn').slice(0, 150)}`
            ).join('\n');

          baseSystemInstruction += ragContext;
        }
      } catch (ragErr) {
        console.warn('[RAG Engine] Product context retrieval fallback:', ragErr);
      }

      const systemInstruction = baseSystemInstruction;

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

      const startIndex = activeKeyIndexes[provider] || 0;
      let lastError: any = null;

      for (let attempt = 0; attempt < keys.length; attempt++) {
        const keyIndex = (startIndex + attempt) % keys.length;
        const currentKey = keys[keyIndex];

        try {
          let responseText = "";

          if (provider === 'gemini') {
            responseText = await executeGeminiCallStream(currentKey, modelName, temperature, systemInstruction, text, onChunk);
          } else {
            responseText = await executeOpenAICallStream(endpoint, currentKey, modelName, temperature, systemInstruction, text, onChunk);
          }

          activeKeyIndexes[provider] = keyIndex;
          if (attempt > 0) {
            console.log(`[AI Key Rotation] Successfully failed over to key #${keyIndex + 1}/${keys.length}`);
          }

          if (!responseText) {
            const fallback = "Xin lỗi, hệ thống chưa nhận được phản hồi. Vui lòng thử lại sau.";
            onChunk(fallback);
            return fallback;
          }

          return responseText;
        } catch (err: any) {
          lastError = err;
          const errMsg = err?.message || '';
          const errStatus = err?.status;

          if (keys.length > 1) {
            console.warn(`[AI Key Pool Warning] Key #${keyIndex + 1}/${keys.length} hit error (${errMsg}). Auto-rotating to key #${((keyIndex + 1) % keys.length) + 1}...`);
            if (isQuotaOrAuthError(errMsg, errStatus)) {
              continue;
            }
            continue;
          } else {
            throw err;
          }
        }
      }

      throw lastError || new Error("Tất cả API Key trong danh sách đều hết Quota hoặc không khả dụng.");

    } catch (error: any) {
      console.error("AI Chat Final Error:", error);
      const errMsg = `Hiện tại kết nối AI gián đoạn (${error?.message || 'Hết Quota'}). Quý khách vui lòng gọi Hotline/Zalo: 0915 059 666 để được hỗ trợ ngay ạ.`;
      onChunk(errMsg);
      return errMsg;
    }
  },

  resetSession: () => {
    chatSession = null;
    currentConfigKey = "";
  }
};
