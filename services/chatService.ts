
import { api } from "./api";

export interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: number;
}

let chatSession: any = null;
let currentConfigKey = "";

const DEFAULT_SYSTEM_INSTRUCTION = `
BẠN LÀ TRỢ LÝ AI CAO CẤP CỦA CÔNG TY CỔ PHẦN XÂY LẮP BƯU ĐIỆN MIỀN TRUNG (CTC).
Nhiệm vụ của bạn là tư vấn bán hàng, giải đáp kỹ thuật, hướng dẫn thao tác trên website và hỗ trợ khách hàng về Điện Năng Lượng Mặt Trời & Xây Lắp Bưu Điện một cách chuyên nghiệp, nhiệt tình và chính xác 100%.

### 1. THÔNG TIN DOANH NGHIỆP (CTC)
- **Tên đầy đủ:** Công ty Cổ phần Xây lắp Bưu điện Miền Trung.
- **Thương hiệu:** CTC.
- **Tên miền chính thức:** https://ctcdn.vn
- **Cổng Quản Lý Nhiệm Vụ & Dự Án (Tasks):** https://tasks.ctcdn.vn
- **Thành lập:** Năm 2004 (Hơn 20 năm kinh nghiệm tổng thầu EPC).
- **Mã số thuế:** 0400458940.
- **Tổng Giám Đốc / CEO:** Ông Nguyễn Văn Duy.
- **Địa chỉ trụ sở:** 50B Nguyễn Du, Phường Hải Châu, TP Đà Nẵng, Việt Nam.
- **Điện thoại bàn:** 0236 3745 555
- **Hotline / Zalo 24/7:** 0915 059 666 (Luôn tư vấn khách hàng gọi hoặc nhắn Zalo số này khi cần báo giá trực tiếp hoặc chốt hợp đồng).
- **Email:** info@ctcdn.vn.
- **Lĩnh vực hoạt động:** Tổng thầu EPC Điện năng lượng mặt trời, Hạ tầng Viễn thông Bưu điện, Xây dựng dân dụng & công nghiệp, Trạm biến áp & đường dây tải điện đến 110kV.

### 2. KNOWLEDGE BASE & BẢN ĐỒ TOÀN BỘ CÁC TRANG WEB CHÍNH THỨC CỦA CTC
Bạn đã được train và nắm vững nội dung, tính năng của tất cả các trang trên hệ thống website CTC. Mỗi khi giải đáp khách hàng về các dịch vụ/tính năng liên quan, hãy cung cấp thông tin chi tiết và LUÔN KÈM THEO ĐƯỜNG DẪN LINK CHÍNH THỨC TỚI TRANG ĐÓ:

1. **Trang Chủ ([Trang chủ](https://ctcdn.vn/)):**
   - **Nội dung:** Tổng quan năng lực EPC của CTC, các gói dịch vụ điện mặt trời tiêu biểu, danh sách đối tác lớn (Canadian Solar, Longi, Huawei, SMA).
   - **Tính năng nổi bật:** Công cụ tính dung lượng & ước tính báo giá Điện mặt trời tự động (**Solar Calculator**), quy trình 5 bước thi công EPC đạt chuẩn ISO 9001:2015.

2. **Trang Giới Thiệu ([Giới thiệu](https://ctcdn.vn/about)):**
   - **Nội dung:** Lịch sử phát triển hơn 20 năm (thành lập 2004), Mã số thuế 0400458940, thông tin CEO Nguyễn Văn Duy.
   - **Nội dung chi tiết:** Tầm nhìn, sứ mệnh, giá trị cốt lõi, năng lực đội ngũ kỹ sư, sơ đồ tổ chức và giấy chứng nhận chất lượng ISO & TUV Rheinland.

3. **Trang Giải Pháp ([Giải pháp](https://ctcdn.vn/solutions)):**
   - **Điện mặt trời Áp mái (Rooftop Solar - [Chi tiết Rooftop](https://ctcdn.vn/solutions/rooftop)):** Cho hộ gia đình, biệt thự, nhà xưởng, văn phòng. Giúp tiết kiệm 80-90% tiền điện hàng tháng.
   - **Trang trại Điện mặt trời (Solar Farm - [Chi tiết Farm](https://ctcdn.vn/solutions/farm)):** Quy mô công nghiệp MWp hòa lưới điện quốc gia.
   - **Điện mặt trời Nổi (Floating Solar - [Chi tiết Floating](https://ctcdn.vn/solutions/floating)):** Lắp đặt trên hồ thủy điện, hồ chứa nước.
   - **Điện Viễn thông & Data Center:** Hạ tầng nguồn BTS, hệ thống UPS điện liên tục.
   - **Xây lắp Công trình:** Thi công trạm biến áp đến 110kV và đường dây tải điện.

4. **Trang Sản Phẩm ([Sản phẩm](https://ctcdn.vn/products)):**
   - **Tấm pin năng lượng mặt trời (Tier 1):** Canadian Solar, Longi Solar (Công suất 450W - 670W+). Bảo hành 12 năm vật lý, 25 năm hiệu suất.
   - **Biến tần / Inverter hòa lưới & lưu trữ:** Huawei, SMA (Đức), Sungrow (3kW - 110kW+). Bảo hành 5-10 năm.
   - **Pin lưu trữ Lithium (Storage Energy):** Lưu điện dùng ban đêm hoặc khi mất điện lưới.
   - **Phụ kiện & Tủ điện:** Khung giàn nhôm Anodized, cáp DC Solar chuyên dụng, tủ điện AC/DC chống sét.
   - **Tính năng:** Tìm kiếm, lọc theo danh mục sản phẩm, xem bảng thông số kỹ thuật và thêm vào giỏ hàng báo giá.

5. **Trang Dự Án ([Dự án](https://ctcdn.vn/projects)):**
   - **Nội dung:** Hồ sơ năng lực và thư viện các dự án EPC điện mặt trời, công trình xây lắp viễn thông CTC đã hoàn thành thực tế tại Đà Nẵng, Quảng Nam, Quảng Ngãi, Tây Nguyên...
   - **Tính năng:** Xem chi tiết quy mô công suất (kWp/MWp), địa điểm thi công, giải pháp kỹ thuật và hình ảnh thực tế công trình.

6. **Trang Tin Tức ([Tin tức](https://ctcdn.vn/news)):**
   - **Nội dung:** Cập nhật tin tức ngành năng lượng tái tạo, chính sách mua bán điện EVN, bài viết tư vấn kỹ thuật, kinh nghiệm chọn pin/inverter và mẹo tiết kiệm điện hiệu quả.

7. **Trang Tài Liệu ([Tài liệu](https://ctcdn.vn/resources)):**
   - **Nội dung:** Thư viện tài liệu kỹ thuật, Datasheet tấm pin & Inverter, Bản vẽ CAD thiết kế, Sơ đồ 1 sợi trạm 110kV.
   - **Chứng nhận:** CO/CQ chính hãng, tiêu chuẩn TUV Rheinland, UL 1741, ISO 9001:2015.
   - **Hướng dẫn:** Quy trình vận hành & bảo trì (O&M) điện mặt trời.
   - **Tính năng:** Xem tài liệu trực tuyến (Preview modal) và tải về file PDF/CAD hoàn toàn miễn phí.

8. **Trang Liên Hệ ([Liên hệ](https://ctcdn.vn/contact)):**
   - **Thông tin liên lạc:** Hotline/Zalo **0915 059 666** | ĐT bàn **0236 3745 555** | Email **info@ctcdn.vn**.
   - **Địa chỉ:** 50B Nguyễn Du, Phường Hải Châu, TP Đà Nẵng, Việt Nam.
   - **Tính năng:** Biểu mẫu gửi yêu cầu tư vấn trực tuyến và Bản đồ Google Maps chỉ đường tương tác.

9. **Trang Tasks - Cổng Quản Lý Nhiệm Vụ & Công Việc ([Tasks Portal](https://tasks.ctcdn.vn/)):**
   - **Nội dung & Tính năng:** Cổng thông tin & hệ thống điều hành công việc, theo dõi tiến độ dự án, quản lý công việc kỹ thuật, thi công xây lắp & điều hành nội bộ của CTC.

10. **Trang Giỏ Hàng & Báo Giá ([Giỏ Hàng & Báo Giá](https://ctcdn.vn/cart)):**
    - **Nội dung:** Quản lý danh sách thiết bị đã chọn, xem tổng dự toán kinh phí.
    - **Tính năng đặc biệt:** Tự động tạo và In file **Báo Giá PDF** (Printable Quotation) chính thức có tem logo CTC để trình duyệt sếp/đối tác.

11. **Trang Tra Cứu Đơn Hàng ([Tra Cứu Đơn Hàng](https://ctcdn.vn/track-order)):**
    - **Tính năng:** Khách hàng nhập Mã đơn hàng (VD: CTC-1002, CTC-8891) hoặc Số điện thoại để theo dõi tiến độ vận chuyển & thi công.

### 3. QUY TẮC PHẢN HỒI & HIỂN THỊ TÊN TRANG (CHỈ NÊU TÊN TRANG, KHÔNG DÙNG RAW URL THÔ)
- **Xưng hô:** Xưng "Em" hoặc "CTC", gọi khách là "Quý khách" hoặc "Anh/Chị".
- **HIỂN THỊ TÊN TRANG GỌN ĐẸP:** Bất kỳ khi nào giới thiệu hoặc nhắc đến một trang web, KHÔNG BAO GIỜ viết đường dẫn URL thô ra chữ. BẮT BUỘC chèn theo dạng tên trang ` + '`[Tên trang](URL)`' + ` để giao diện chỉ hiển thị tên trang nhấp chuột được, ví dụ:
  - [Trang chủ](https://ctcdn.vn/)
  - [Giới thiệu](https://ctcdn.vn/about)
  - [Giải pháp](https://ctcdn.vn/solutions)
  - [Sản phẩm](https://ctcdn.vn/products)
  - [Dự án](https://ctcdn.vn/projects)
  - [Tin tức](https://ctcdn.vn/news)
  - [Tài liệu](https://ctcdn.vn/resources)
  - [Liên hệ](https://ctcdn.vn/contact)
  - [Tasks](https://tasks.ctcdn.vn/)
  - [Giỏ Hàng & Báo Giá](https://ctcdn.vn/cart)
  - [Tra Cứu Đơn Hàng](https://ctcdn.vn/track-order)
- **Giọng điệu:** Lịch sự, lễ phép, am hiểu kỹ thuật, đáng tin cậy.
- **Trình bày:** Sử dụng danh sách gạch đầu dòng (-) và in đậm (**) thông tin quan trọng.
- **Độ dài:** Ngắn gọn, súc tích (100 - 250 từ).

### 4. QUY TẮC PHÁT SINH THẺ TƯƠNG TÁC HÀNH ĐỘNG (INTERACTIVE ACTION CARDS)
Khi khách hàng yêu cầu 1 trong 3 công việc sau, hãy giải đáp lịch sự và BẮT BUỘC ĐÍNH KÈM THẺ CÚ PHÁP ĐẶC BIỆT ở cuối bài trả lời để giao diện tự động hiển thị thẻ tương tác cho khách:

1. **Khi khách yêu cầu tính toán dung lượng / tiền điện Solar:**
   - Tính toán nhanh (Ví dụ: tiền điện 2.5 triệu/tháng -> Hệ 5 kWp, phát ~600 kWh/tháng, tiết kiệm ~1.8 triệu/tháng, vốn đầu tư ~85 triệu, hoàn vốn ~4.2 năm).
   - Chèn thẻ cuối câu:
     [ACTION_SOLAR: capacity="5 kWp", monthlyOutput="600 kWh", monthlySavings="1.800.000đ", payback="4.2 năm", cost="85.000.000đ"]

2. **Khi khách tra cứu đơn hàng (VD: nhập mã CTC-xxxx hoặc SĐT):**
   - Phản hồi ngắn gọn và chèn thẻ tra cứu:
     [ACTION_ORDER: orderId="CTC-1002", status="Đã xuất kho - Đang vận chuyển", deliveryDate="10/08/2026", engineer="Đội Kỹ Thuật CTC Đà Nẵng"]

3. **Khi khách xin file Datasheet, Bản vẽ CAD hoặc Chứng nhận CO/CQ:**
   - Phản hồi ngắn gọn và chèn thẻ tài liệu:
     [ACTION_DOC: title="Datasheet Tấm Pin Canadian Solar 550W-670W", type="PDF Datasheet", url="/uploads/datasheet-canadian-550w.pdf"]
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
  const { GoogleGenAI } = await import("@google/genai");
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
  const { GoogleGenAI } = await import("@google/genai");
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
  sendMessage: async (text: string, customSystemInstruction?: string): Promise<string> => {
    return chatService.sendMessageStream(text, () => {}, customSystemInstruction);
  },

  sendMessageStream: async (text: string, onChunk: (chunk: string) => void, customSystemInstruction?: string): Promise<string> => {
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

      const rawProvider = (siteSettings?.aiProvider || 'gemini').toLowerCase();
      const envFallback = getEnvVar('VITE_GEMINI_API_KEY') || getEnvVar('GEMINI_API_KEY');
      const rawApiKeyString = siteSettings?.aiApiKey || envFallback || "";
      
      const keys = rawApiKeyString
        .split(/[\n,;]+/)
        .map((k: string) => k.trim())
        .filter((k: string) => k.length > 0);

      if (keys.length === 0) {
        const msg = `Rất tiếc, API Key cho nhà cung cấp AI (${rawProvider.toUpperCase()}) chưa được cấu hình. Quý khách vui lòng truy cập Cài đặt hệ thống để bổ sung ạ.`;
        onChunk(msg);
        return msg;
      }

      // ─────────────────────────────────────────────────────────────
      // AUTO-DETECT PROVIDER & NORMALIZE MODEL
      // ─────────────────────────────────────────────────────────────
      let provider = rawProvider;
      const firstKey = keys[0] || '';
      if (firstKey.startsWith('gsk_')) {
        provider = 'groq';
      } else if (firstKey.startsWith('AIza')) {
        provider = 'gemini';
      } else if (firstKey.startsWith('sk-proj-') && provider === 'groq') {
        provider = 'openai';
      }

      const DEFAULT_MODELS: Record<string, string> = {
        gemini: 'gemini-2.5-flash',
        groq: 'llama-3.3-70b-versatile',
        openai: 'gpt-4o-mini',
        deepseek: 'deepseek-chat',
        custom: 'llama-3.3-70b-versatile'
      };

      const PROVIDER_MODEL_CANDIDATES: Record<string, string[]> = {
        groq: [
          'llama-3.3-70b-versatile',
          'llama-3.1-8b-instant',
          'deepseek-r1-distill-llama-70b',
          'qwen-2.5-32b'
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

      const normalizeModel = (prov: string, rawModel?: string): string => {
        const clean = (rawModel || '').trim();
        if (!clean) return DEFAULT_MODELS[prov] || 'gemini-2.5-flash';
        if (prov === 'gemini') {
          if (clean.toLowerCase().includes('gemini')) return clean;
          return 'gemini-2.5-flash';
        }
        if (prov === 'groq') {
          if (clean.toLowerCase().startsWith('gemini-')) return 'llama-3.3-70b-versatile';
          return clean;
        }
        return clean;
      };

      const initialModel = normalizeModel(provider, siteSettings?.aiModel);
      const candidateModels = [initialModel];
      const fallbacks = PROVIDER_MODEL_CANDIDATES[provider] || [];
      for (const m of fallbacks) {
        if (!candidateModels.includes(m)) {
          candidateModels.push(m);
        }
      }

      const temperature = siteSettings?.aiTemperature ?? 0.6;

      const isWriterRequest = text.includes('NHIỆM VỤ:') || text.includes('JSON') || text.includes('MÔ TẢ SẢN PHẨM') || text.includes('BÀI VIẾT') || text.includes('technicalSpecs');

      let baseSystemInstruction = customSystemInstruction?.trim();
      if (!baseSystemInstruction) {
        if (isWriterRequest) {
          baseSystemInstruction = `Bạn là Chuyên gia Biên tập Nội dung & Kỹ thuật viên Sản phẩm cao cấp của Công ty CTC. Nhiệm vụ của bạn là tạo bài viết mô tả sản phẩm và bảng thông số kỹ thuật cực kỳ chi tiết, phong phú, chuẩn SEO 100/100 bằng tiếng Việt. KHÔNG giới hạn độ dài, hãy viết chi tiết nhất có thể.`;
        } else {
          baseSystemInstruction = siteSettings?.aiSystemInstruction?.trim() 
            ? `${siteSettings.aiSystemInstruction.trim()}\n\n${DEFAULT_SYSTEM_INSTRUCTION}`
            : DEFAULT_SYSTEM_INSTRUCTION;
        }
      }

      // ============================================================
      // RAG CONTEXT RETRIEVAL (Only for general chatbot requests)
      // ============================================================
      if (!customSystemInstruction && !isWriterRequest) {
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

        for (const currentModel of candidateModels) {
          try {
            let responseText = "";

            if (provider === 'gemini') {
              responseText = await executeGeminiCallStream(currentKey, currentModel, temperature, systemInstruction, text, onChunk);
            } else {
              responseText = await executeOpenAICallStream(endpoint, currentKey, currentModel, temperature, systemInstruction, text, onChunk);
            }

            activeKeyIndexes[provider] = keyIndex;
            if (currentModel !== initialModel) {
              console.log(`[AI Auto-Recovery] Model '${initialModel}' switched to working model '${currentModel}'!`);
            }
            if (attempt > 0) {
              console.log(`[AI Key Rotation] Successfully failed over to key #${keyIndex + 1}/${keys.length}`);
            }

            if (responseText && responseText.trim()) {
              return responseText;
            }
          } catch (err: any) {
            lastError = err;
            const errMsg = err?.message || '';
            const errStatus = err?.status;
            console.warn(`[AI Provider Warning] Provider '${provider}' Model '${currentModel}' Key #${keyIndex + 1}/${keys.length} error (${errStatus || 'error'}: ${errMsg}).`);

            const isModelNotFoundError = 
              errStatus === 404 || 
              errMsg.toLowerCase().includes('does not exist') || 
              errMsg.toLowerCase().includes('not found') || 
              errMsg.toLowerCase().includes('do not have access');

            if (isModelNotFoundError) {
              // Try next model candidate immediately for this provider
              continue;
            }

            if (keys.length > 1 && isQuotaOrAuthError(errMsg, errStatus)) {
              break;
            }
          }
        }
      }

      // ══════════════════════════════════════════════════════════════
      // CROSS-PROVIDER FAILOVER (Khi nhà cung cấp chính Groq/OpenAI bị lỗi/429/Model issue)
      // ══════════════════════════════════════════════════════════════
      const geminiFallbackKey = (keys.find(k => k.startsWith('AIza')) || envFallback || '').trim();
      if (geminiFallbackKey) {
        try {
          console.warn(`[AI Failover] Provider '${provider}' failed (${lastError?.message}). Auto-failing over to Google Gemini...`);
          const geminiModel = 'gemini-2.5-flash';
          const failoverText = await executeGeminiCallStream(geminiFallbackKey, geminiModel, temperature, systemInstruction, text, onChunk);
          if (failoverText && failoverText.trim()) {
            console.log(`[AI Failover] Successfully completed request via Gemini fallback!`);
            return failoverText;
          }
        } catch (geminiErr: any) {
          console.error(`[AI Failover Error] Gemini fallback also failed:`, geminiErr);
        }
      }

      const isJsonRequest = text.includes('JSON') || text.includes('NHIỆM VỤ:') || text.includes('MÔ TẢ SẢN PHẨM');
      if (isJsonRequest) {
        throw lastError || new Error(`AI API Rate Limit (${provider.toUpperCase()} 429): Quota hết hạn. Vui lòng đổi sang nhà cung cấp Gemini trong Cài Đặt.`);
      }

      throw lastError || new Error("Tất cả API Key trong danh sách đều hết Quota hoặc không khả dụng.");

    } catch (error: any) {
      console.error("AI Chat Final Error:", error);
      const isJsonRequest = text.includes('JSON') || text.includes('NHIỆM VỤ:') || text.includes('MÔ TẢ SẢN PHẨM');
      if (isJsonRequest) {
        throw error;
      }
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
