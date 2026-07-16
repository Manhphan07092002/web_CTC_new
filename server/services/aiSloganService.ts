/**
 * AI Slogan Generator Service
 * Sử dụng OpenAI API hoặc local AI để tạo slogans cho công ty
 * Hỗ trợ đa ngôn ngữ: vi, en, ko, ja, zh, de
 */

type Language = 'vi' | 'en' | 'ko' | 'ja' | 'zh' | 'de';

// Predefined high-quality slogans (AI-generated offline) - Đa ngôn ngữ
const AI_GENERATED_SLOGANS: Record<Language, Array<{title: string, subtitle: string, category: string}>> = {
  // 🇻🇳 Vietnamese
  vi: [
    // Energy & Savings
    { title: 'Năng lượng sạch', subtitle: 'Đầu tư bền vững', category: 'energy' },
    { title: 'Tiết kiệm 90%', subtitle: 'Chi phí điện năng', category: 'savings' },
    { title: 'Hoàn vốn 3 năm', subtitle: 'Lợi nhuận 22 năm', category: 'roi' },
    { title: 'Điện mặt trời', subtitle: 'Giải pháp thông minh', category: 'solar' },
    // Quality & Trust
    { title: 'Công nghệ Tier 1', subtitle: 'Chuẩn quốc tế', category: 'quality' },
    { title: 'Bảo hành 25 năm', subtitle: 'An tâm tuyệt đối', category: 'warranty' },
    { title: 'Chất lượng Đức', subtitle: 'Giá Việt Nam', category: 'quality' },
    { title: 'Top 5 thế giới', subtitle: 'Thiết bị chính hãng', category: 'brand' },
    // Service
    { title: 'Miễn phí lắp đặt', subtitle: 'Tư vấn tận nơi', category: 'service' },
    { title: 'Hỗ trợ 24/7', subtitle: 'Đội ngũ chuyên nghiệp', category: 'support' },
    { title: 'Khảo sát miễn phí', subtitle: 'Báo giá trong 24h', category: 'service' },
    { title: 'Thi công nhanh', subtitle: 'Hoàn thành đúng hẹn', category: 'service' },
    // Environment
    { title: 'Xanh cho hôm nay', subtitle: 'Bền cho tương lai', category: 'eco' },
    { title: 'Bảo vệ môi trường', subtitle: 'Tiết kiệm chi phí', category: 'eco' },
    { title: 'Giảm CO2', subtitle: 'Tăng lợi nhuận', category: 'eco' },
    { title: 'Net Zero 2050', subtitle: 'Bắt đầu từ hôm nay', category: 'eco' },
    // Business
    { title: '500+ dự án', subtitle: 'Khách hàng tin tưởng', category: 'trust' },
    { title: 'Đối tác tin cậy', subtitle: 'Của mọi gia đình', category: 'trust' },
    { title: 'Số 1 Miền Trung', subtitle: 'Về điện mặt trời', category: 'brand' },
    { title: '10+ năm kinh nghiệm', subtitle: 'Hàng nghìn dự án', category: 'experience' },
    // Innovation
    { title: 'AI Monitoring', subtitle: 'Giám sát thông minh', category: 'tech' },
    { title: 'App điều khiển', subtitle: 'Mọi lúc mọi nơi', category: 'tech' },
    { title: 'Inverter thông minh', subtitle: 'Hiệu suất tối đa', category: 'tech' },
    { title: 'Hybrid System', subtitle: 'Lưu trữ linh hoạt', category: 'tech' },
  ],

  // 🇺🇸 English
  en: [
    { title: 'Clean Energy', subtitle: 'Sustainable Investment', category: 'energy' },
    { title: 'Save 90%', subtitle: 'On Electricity Bills', category: 'savings' },
    { title: '3 Year Payback', subtitle: '22 Years of Profit', category: 'roi' },
    { title: 'Solar Power', subtitle: 'Smart Solutions', category: 'solar' },
    { title: 'Tier 1 Technology', subtitle: 'International Standards', category: 'quality' },
    { title: '25 Year Warranty', subtitle: 'Total Peace of Mind', category: 'warranty' },
    { title: 'German Quality', subtitle: 'Vietnamese Price', category: 'quality' },
    { title: 'Top 5 Worldwide', subtitle: 'Genuine Equipment', category: 'brand' },
    { title: 'Free Installation', subtitle: 'On-site Consultation', category: 'service' },
    { title: '24/7 Support', subtitle: 'Professional Team', category: 'support' },
    { title: 'Free Survey', subtitle: 'Quote in 24 Hours', category: 'service' },
    { title: 'Fast Construction', subtitle: 'On-time Delivery', category: 'service' },
    { title: 'Green Today', subtitle: 'Sustainable Tomorrow', category: 'eco' },
    { title: 'Save the Planet', subtitle: 'Save Your Money', category: 'eco' },
    { title: 'Reduce CO2', subtitle: 'Increase Profits', category: 'eco' },
    { title: 'Net Zero 2050', subtitle: 'Start Today', category: 'eco' },
    { title: '500+ Projects', subtitle: 'Trusted by Customers', category: 'trust' },
    { title: 'Reliable Partner', subtitle: 'For Every Family', category: 'trust' },
    { title: '#1 in Central VN', subtitle: 'Solar Excellence', category: 'brand' },
    { title: '5 Years Experience', subtitle: 'Thousands of Projects', category: 'experience' },
    { title: 'AI Monitoring', subtitle: 'Smart Surveillance', category: 'tech' },
    { title: 'Control App', subtitle: 'Anytime, Anywhere', category: 'tech' },
    { title: 'Smart Inverter', subtitle: 'Maximum Efficiency', category: 'tech' },
    { title: 'Hybrid System', subtitle: 'Flexible Storage', category: 'tech' },
  ],

  // 🇰🇷 Korean
  ko: [
    { title: '청정 에너지', subtitle: '지속 가능한 투자', category: 'energy' },
    { title: '90% 절약', subtitle: '전기 요금 절감', category: 'savings' },
    { title: '3년 투자 회수', subtitle: '22년 수익', category: 'roi' },
    { title: '태양광 발전', subtitle: '스마트 솔루션', category: 'solar' },
    { title: 'Tier 1 기술', subtitle: '국제 표준', category: 'quality' },
    { title: '25년 보증', subtitle: '완벽한 안심', category: 'warranty' },
    { title: '독일 품질', subtitle: '베트남 가격', category: 'quality' },
    { title: '세계 Top 5', subtitle: '정품 장비', category: 'brand' },
    { title: '무료 설치', subtitle: '현장 상담', category: 'service' },
    { title: '24/7 지원', subtitle: '전문 팀', category: 'support' },
    { title: '무료 조사', subtitle: '24시간 견적', category: 'service' },
    { title: '빠른 시공', subtitle: '정시 완료', category: 'service' },
    { title: '오늘의 녹색', subtitle: '내일의 지속', category: 'eco' },
    { title: '환경 보호', subtitle: '비용 절감', category: 'eco' },
    { title: 'CO2 감소', subtitle: '수익 증가', category: 'eco' },
    { title: 'Net Zero 2050', subtitle: '오늘 시작', category: 'eco' },
    { title: '500+ 프로젝트', subtitle: '고객 신뢰', category: 'trust' },
    { title: '신뢰할 수 있는', subtitle: '파트너', category: 'trust' },
    { title: '중부 1위', subtitle: '태양광 전문', category: 'brand' },
    { title: '5년 경험', subtitle: '수천 개 프로젝트', category: 'experience' },
    { title: 'AI 모니터링', subtitle: '스마트 감시', category: 'tech' },
    { title: '제어 앱', subtitle: '언제 어디서나', category: 'tech' },
    { title: '스마트 인버터', subtitle: '최대 효율', category: 'tech' },
    { title: '하이브리드 시스템', subtitle: '유연한 저장', category: 'tech' },
  ],

  // 🇯🇵 Japanese
  ja: [
    { title: 'クリーンエネルギー', subtitle: '持続可能な投資', category: 'energy' },
    { title: '90%節約', subtitle: '電気代削減', category: 'savings' },
    { title: '3年で回収', subtitle: '22年の利益', category: 'roi' },
    { title: '太陽光発電', subtitle: 'スマートソリューション', category: 'solar' },
    { title: 'Tier 1技術', subtitle: '国際基準', category: 'quality' },
    { title: '25年保証', subtitle: '完全な安心', category: 'warranty' },
    { title: 'ドイツ品質', subtitle: 'ベトナム価格', category: 'quality' },
    { title: '世界Top 5', subtitle: '正規品機器', category: 'brand' },
    { title: '無料設置', subtitle: '現地相談', category: 'service' },
    { title: '24/7サポート', subtitle: 'プロチーム', category: 'support' },
    { title: '無料調査', subtitle: '24時間見積', category: 'service' },
    { title: '迅速施工', subtitle: '期日通り', category: 'service' },
    { title: '今日のグリーン', subtitle: '明日の持続', category: 'eco' },
    { title: '環境保護', subtitle: 'コスト削減', category: 'eco' },
    { title: 'CO2削減', subtitle: '利益増加', category: 'eco' },
    { title: 'Net Zero 2050', subtitle: '今日から', category: 'eco' },
    { title: '500+プロジェクト', subtitle: 'お客様の信頼', category: 'trust' },
    { title: '信頼できる', subtitle: 'パートナー', category: 'trust' },
    { title: '中部No.1', subtitle: '太陽光専門', category: 'brand' },
    { title: '5年の経験', subtitle: '数千のプロジェクト', category: 'experience' },
    { title: 'AIモニタリング', subtitle: 'スマート監視', category: 'tech' },
    { title: '制御アプリ', subtitle: 'いつでもどこでも', category: 'tech' },
    { title: 'スマートインバーター', subtitle: '最大効率', category: 'tech' },
    { title: 'ハイブリッドシステム', subtitle: '柔軟な蓄電', category: 'tech' },
  ],

  // 🇨🇳 Chinese
  zh: [
    { title: '清洁能源', subtitle: '可持续投资', category: 'energy' },
    { title: '节省90%', subtitle: '电费支出', category: 'savings' },
    { title: '3年回本', subtitle: '22年收益', category: 'roi' },
    { title: '太阳能发电', subtitle: '智能解决方案', category: 'solar' },
    { title: 'Tier 1技术', subtitle: '国际标准', category: 'quality' },
    { title: '25年质保', subtitle: '完全放心', category: 'warranty' },
    { title: '德国品质', subtitle: '越南价格', category: 'quality' },
    { title: '全球Top 5', subtitle: '正品设备', category: 'brand' },
    { title: '免费安装', subtitle: '上门咨询', category: 'service' },
    { title: '24/7支持', subtitle: '专业团队', category: 'support' },
    { title: '免费勘察', subtitle: '24小时报价', category: 'service' },
    { title: '快速施工', subtitle: '按时完成', category: 'service' },
    { title: '今日绿色', subtitle: '明日持续', category: 'eco' },
    { title: '保护环境', subtitle: '节省成本', category: 'eco' },
    { title: '减少CO2', subtitle: '增加利润', category: 'eco' },
    { title: 'Net Zero 2050', subtitle: '从今天开始', category: 'eco' },
    { title: '500+项目', subtitle: '客户信赖', category: 'trust' },
    { title: '可靠伙伴', subtitle: '服务每个家庭', category: 'trust' },
    { title: '中部第一', subtitle: '太阳能专家', category: 'brand' },
    { title: '5年经验', subtitle: '数千项目', category: 'experience' },
    { title: 'AI监控', subtitle: '智能监视', category: 'tech' },
    { title: '控制APP', subtitle: '随时随地', category: 'tech' },
    { title: '智能逆变器', subtitle: '最大效率', category: 'tech' },
    { title: '混合系统', subtitle: '灵活储能', category: 'tech' },
  ],

  // 🇩🇪 German
  de: [
    { title: 'Saubere Energie', subtitle: 'Nachhaltige Investition', category: 'energy' },
    { title: '90% Sparen', subtitle: 'Bei Stromkosten', category: 'savings' },
    { title: '3 Jahre Amortisation', subtitle: '22 Jahre Gewinn', category: 'roi' },
    { title: 'Solarenergie', subtitle: 'Smarte Lösungen', category: 'solar' },
    { title: 'Tier 1 Technologie', subtitle: 'Internationale Standards', category: 'quality' },
    { title: '25 Jahre Garantie', subtitle: 'Völlige Sicherheit', category: 'warranty' },
    { title: 'Deutsche Qualität', subtitle: 'Vietnamesischer Preis', category: 'quality' },
    { title: 'Top 5 Weltweit', subtitle: 'Originalausrüstung', category: 'brand' },
    { title: 'Kostenlose Installation', subtitle: 'Vor-Ort-Beratung', category: 'service' },
    { title: '24/7 Support', subtitle: 'Professionelles Team', category: 'support' },
    { title: 'Kostenlose Prüfung', subtitle: 'Angebot in 24 Std.', category: 'service' },
    { title: 'Schneller Bau', subtitle: 'Pünktliche Lieferung', category: 'service' },
    { title: 'Grün für Heute', subtitle: 'Nachhaltig für Morgen', category: 'eco' },
    { title: 'Umwelt schützen', subtitle: 'Kosten sparen', category: 'eco' },
    { title: 'CO2 reduzieren', subtitle: 'Gewinn steigern', category: 'eco' },
    { title: 'Net Zero 2050', subtitle: 'Heute starten', category: 'eco' },
    { title: '500+ Projekte', subtitle: 'Kundenvertrauen', category: 'trust' },
    { title: 'Zuverlässiger Partner', subtitle: 'Für jede Familie', category: 'trust' },
    { title: 'Nr.1 in Zentralvietnam', subtitle: 'Solar-Experte', category: 'brand' },
    { title: '5 Jahre Erfahrung', subtitle: 'Tausende Projekte', category: 'experience' },
    { title: 'KI-Überwachung', subtitle: 'Smarte Kontrolle', category: 'tech' },
    { title: 'Steuerungs-App', subtitle: 'Jederzeit, überall', category: 'tech' },
    { title: 'Smart Inverter', subtitle: 'Maximale Effizienz', category: 'tech' },
    { title: 'Hybrid-System', subtitle: 'Flexible Speicherung', category: 'tech' },
  ],
};

// Slogan templates for dynamic generation
const SLOGAN_TEMPLATES = {
  savings: [
    { title: 'Tiết kiệm {percent}%', subtitle: '{benefit}' },
    { title: 'Giảm {percent}%', subtitle: 'Hóa đơn điện' },
  ],
  roi: [
    { title: 'Hoàn vốn {years} năm', subtitle: 'Lợi nhuận {profit} năm' },
    { title: 'ROI {percent}%', subtitle: 'Đầu tư thông minh' },
  ],
  eco: [
    { title: 'Giảm {tons} tấn CO2', subtitle: 'Mỗi năm' },
    { title: '{trees} cây xanh', subtitle: 'Tương đương trồng' },
  ],
};

interface Slogan {
  title: string;
  subtitle: string;
  category?: string;
}

interface SloganGeneratorOptions {
  count?: number;
  categories?: string[];
  shuffle?: boolean;
  language?: Language;
}

// Dynamic slogan templates per language
const DYNAMIC_TEMPLATES: Record<Language, { projects: string[], savings: string[], experience: string[], eco: string[] }> = {
  vi: {
    projects: ['{count}+ dự án', 'Khách hàng tin tưởng'],
    savings: ['Tiết kiệm {percent}%', 'Chi phí điện năng'],
    experience: ['{years} năm kinh nghiệm', 'Chất lượng đảm bảo'],
    eco: ['Giảm {tons} tấn CO2', 'Bảo vệ môi trường'],
  },
  en: {
    projects: ['{count}+ Projects', 'Trusted by Customers'],
    savings: ['Save {percent}%', 'On Electricity Bills'],
    experience: ['{years} Years Experience', 'Quality Guaranteed'],
    eco: ['Reduce {tons} Tons CO2', 'Protect Environment'],
  },
  ko: {
    projects: ['{count}+ 프로젝트', '고객 신뢰'],
    savings: ['{percent}% 절약', '전기 요금 절감'],
    experience: ['{years}년 경험', '품질 보장'],
    eco: ['CO2 {tons}톤 감소', '환경 보호'],
  },
  ja: {
    projects: ['{count}+プロジェクト', 'お客様の信頼'],
    savings: ['{percent}%節約', '電気代削減'],
    experience: ['{years}年の経験', '品質保証'],
    eco: ['CO2 {tons}トン削減', '環境保護'],
  },
  zh: {
    projects: ['{count}+项目', '客户信赖'],
    savings: ['节省{percent}%', '电费支出'],
    experience: ['{years}年经验', '质量保证'],
    eco: ['减少{tons}吨CO2', '保护环境'],
  },
  de: {
    projects: ['{count}+ Projekte', 'Kundenvertrauen'],
    savings: ['{percent}% Sparen', 'Bei Stromkosten'],
    experience: ['{years} Jahre Erfahrung', 'Qualität garantiert'],
    eco: ['{tons} Tonnen CO2 reduzieren', 'Umwelt schützen'],
  },
};

class AISloganService {
  private lastShuffleTime: Record<Language, number> = { vi: 0, en: 0, ko: 0, ja: 0, zh: 0, de: 0 };
  private shuffledSlogans: Record<Language, Slogan[]> = { vi: [], en: [], ko: [], ja: [], zh: [], de: [] };

  /**
   * Get slogans with options - supports multi-language
   */
  getSlogans(options: SloganGeneratorOptions = {}): Slogan[] {
    const { count = 8, categories, shuffle = true, language = 'vi' } = options;
    const lang = this.validateLanguage(language);

    let result = [...AI_GENERATED_SLOGANS[lang]];

    // Filter by categories if specified
    if (categories && categories.length > 0) {
      result = result.filter(s => s.category && categories.includes(s.category));
    }

    // Shuffle if needed (cache for 1 hour per language)
    if (shuffle) {
      const now = Date.now();
      if (now - this.lastShuffleTime[lang] > 3600000 || this.shuffledSlogans[lang].length === 0) {
        this.shuffledSlogans[lang] = this.shuffleArray(result) as Slogan[];
        this.lastShuffleTime[lang] = now;
      }
      result = this.shuffledSlogans[lang] as typeof result;
    }

    return result.slice(0, count);
  }

  /**
   * Get random slogans that won't repeat - supports multi-language
   */
  getRandomSlogans(count: number = 8, language: Language = 'vi'): Slogan[] {
    const lang = this.validateLanguage(language);
    const shuffled = this.shuffleArray([...AI_GENERATED_SLOGANS[lang]]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Generate dynamic slogan based on real data - supports multi-language
   */
  generateDynamicSlogan(data: {
    projectCount?: number;
    savingsPercent?: number;
    yearsExperience?: number;
    co2Reduced?: number;
    language?: Language;
  }): Slogan {
    const { projectCount = 500, savingsPercent = 90, yearsExperience = 5, co2Reduced = 100, language = 'vi' } = data;
    const lang = this.validateLanguage(language);
    const templates = DYNAMIC_TEMPLATES[lang];

    const dynamicSlogans: Slogan[] = [
      { title: templates.projects[0].replace('{count}', String(projectCount)), subtitle: templates.projects[1] },
      { title: templates.savings[0].replace('{percent}', String(savingsPercent)), subtitle: templates.savings[1] },
      { title: templates.experience[0].replace('{years}', String(yearsExperience)), subtitle: templates.experience[1] },
      { title: templates.eco[0].replace('{tons}', String(co2Reduced)), subtitle: templates.eco[1] },
    ];

    return dynamicSlogans[Math.floor(Math.random() * dynamicSlogans.length)];
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    const categories = new Set(AI_GENERATED_SLOGANS.vi.map(s => s.category).filter(Boolean));
    return Array.from(categories) as string[];
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): Language[] {
    return ['vi', 'en', 'ko', 'ja', 'zh', 'de'];
  }

  /**
   * Validate and return valid language
   */
  private validateLanguage(lang: string): Language {
    const validLanguages: Language[] = ['vi', 'en', 'ko', 'ja', 'zh', 'de'];
    return validLanguages.includes(lang as Language) ? (lang as Language) : 'vi';
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generate slogans using OpenAI (if API key available)
   * This is a placeholder for real AI integration
   */
  async generateWithAI(prompt?: string): Promise<Slogan[]> {
    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.log('[AI Slogan] No OpenAI API key, using pre-generated slogans');
      return this.getRandomSlogans(8);
    }

    try {
      // OpenAI integration would go here
      // For now, return pre-generated slogans
      console.log('[AI Slogan] AI generation requested, using cached slogans');
      return this.getRandomSlogans(8);
    } catch (error) {
      console.error('[AI Slogan] Error generating slogans:', error);
      return this.getRandomSlogans(8);
    }
  }
}

// Export singleton instance
export const aiSloganService = new AISloganService();
export type { Slogan, SloganGeneratorOptions };
