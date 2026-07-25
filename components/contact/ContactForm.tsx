import React, { useState } from 'react';
import { Send, CheckCircle2, ShieldCheck, Sparkles, User, Phone, Mail, FileText, MapPin, Briefcase, Zap, Award } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';
import { useToast } from '../../contexts/ToastContext';
import analyticsTracking from '../../services/analytics-tracking';
import companyProfile from '../../constants/company_profile.json';

const getApiBase = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  if (!port || port === '80' || port === '443') {
    return '/api';
  }
  return `${protocol}//${hostname}:4000/api`;
};
const API_BASE = getApiBase();

const ContactForm: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    address: '',
    message: '',
    website_hp: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');

    try {
      const response = await fetch(`${API_BASE}/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          service: formData.service || 'Điện mặt trời mái nhà xưởng'
        })
      });

      const result = await response.json();

      if (response.ok) {
        setFormStatus('success');
        showToast('✅ ' + (result.message || getLangText(language, { vi: 'Gửi yêu cầu tư vấn thành công!', en: 'Consultation request sent successfully!', ko: '상담 요청이 성공적으로 전송되었습니다!', ja: '相談リクエストが正常に送信されました！', zh: '咨询请求发送成功！', de: 'Beratungsanfrage erfolgreich gesendet!' })), 'success');

        analyticsTracking.trackContactRequest(formData.service || 'Điện mặt trời mái nhà', {
          name: formData.name,
          email: formData.email
        });

        setFormData({
          name: '',
          phone: '',
          email: '',
          service: '',
          address: '',
          message: '',
          website_hp: ''
        });

        setTimeout(() => setFormStatus('idle'), 6000);
      } else {
        throw new Error(result.error || 'Gửi yêu cầu không thành công');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      showToast('❌ ' + getLangText(language, { vi: 'Có lỗi xảy ra. Vui lòng liên hệ Hotline 0915 059 666!', en: 'An error occurred. Please call Hotline 0915 059 666!', ko: '오류가 발생했습니다. 핫라인 0915 059 666으로 연락해주세요!', ja: 'エラーが発生しました。ホットライン0915 059 666までお電話ください！', zh: '发生错误，请拨打热线 0915 059 666！', de: 'Ein Fehler ist aufgetreten. Bitte rufen Sie Hotline 0915 059 666 an!' }), 'error');
      setFormStatus('idle');
    }
  };

  return (
    <div id="form-sec" className="mb-20">
      
      {/* Unified Single Seamless Block Container */}
      <div className="bg-white/85 dark:bg-gray-800/85 backdrop-blur-2xl rounded-3xl shadow-[0_12px_40px_0_rgba(0,0,0,0.1)] border border-white/80 dark:border-gray-700/80 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* Left Side Accent Banner (Unified inside container) */}
          <div className="lg:col-span-4 bg-gradient-to-br from-corporate via-[#0b192c] to-[#071426] text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-amber-300 border border-white/20 mb-6 shadow-sm">
                <Sparkles size={13} /> {getLangText(language, { vi: 'TẠI SAO CHỌN CTC?', en: 'WHY CHOOSE CTC?', ko: '왜 CTC를 선택해야 할까요?', ja: 'CTCが選ばれる理由', zh: '为什么选择CTC？', de: 'WARUM CTC WÄHLEN?' })}
              </div>

              <h3 className="text-2xl font-black mb-3 leading-tight drop-shadow-sm">
                {getLangText(language, { vi: 'Đồng Hành Cùng Doanh Nghiệp Năng Lượng Xanh', en: 'Partnering for Green Energy Solutions', ko: '친환경 에너지 솔루션 파트너', ja: 'グリーンエネルギーのパートナー', zh: '携手构建绿色能源解决方案', de: 'Partner für grüne Energielösungen' })}
              </h3>

              <p className="text-xs text-gray-300 leading-relaxed mb-6 font-light">
                {companyProfile.company_name.short} - {getLangText(language, { vi: 'Nhà thầu EPC uy tín hàng đầu trong lĩnh vực xây lắp, điện mặt trời & hạ tầng kỹ thuật.', en: 'Leading trusted EPC contractor in construction, solar power & technical infrastructure.', ko: '건설, 태양광 및 기술 인프라 분야의 선도적인 EPC 계약자.', ja: '建設、太陽光、技術インフラ分野における信頼のリーディングEPC事業者。', zh: '工程建设、太阳能光伏及技术基础设施领域领先的信誉EPC总承包商。', de: 'Führender Generalunternehmer für Bau, Solar & technische Infrastruktur.' })}
              </p>

              {/* Seamless Value Bullet Points */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl flex-shrink-0 border border-amber-500/30">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{getLangText(language, { vi: 'Khảo Sát & Thiết Kế 3D Miễn Phí', en: 'Free 3D Design & Survey', ko: '무료 3D 설계 및 현장 조사', ja: '無料3D設計・現地調査', zh: '免费3D设计与现场勘察', de: 'Kostenlose 3D-Planung & Vermessung' })}</h4>
                    <p className="text-[11px] text-gray-300 leading-relaxed mt-0.5 font-light">
                      {getLangText(language, { vi: 'Kỹ sư đến tận nơi trong 24h & tính toán sản lượng điện năng chuẩn PV*SOL.', en: 'Engineers on-site within 24h & precise PV*SOL energy output simulation.', ko: '24시간 내 엔지니어 현장 방문 및 정밀한 PV*SOL 발전량 시뮬레이션.', ja: '24時間以内にエンジニアが訪問し、PV*SOLによる高精度発電量シミュレーションを実施。', zh: '工程师24小时内到场勘察，采用PV*SOL软件精准计算发电量。', de: 'Ingenieure innerhalb von 24 Std. vor Ort & präzise PV*SOL Simulation.' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-blue-500/20 text-blue-300 rounded-xl flex-shrink-0 border border-blue-500/30">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{getLangText(language, { vi: 'Bảo Hành Hiệu Suất 25 Năm', en: '25-Year Performance Warranty', ko: '25년 성능 보증', ja: '25年出力保証', zh: '25年线性功率质保', de: '25 Jahre Leistungsgarantie' })}</h4>
                    <p className="text-[11px] text-gray-300 leading-relaxed mt-0.5 font-light">
                      {getLangText(language, { vi: 'Thiết bị pin & Inverter chính hãng có chứng chỉ CO/CQ & bảo hiểm quốc tế.', en: 'Genuine Solar Panels & Inverters with CO/CQ & international insurance.', ko: '정품 태양광 패널 및 인버터 (CO/CQ 인증 및 국제 보험 적용).', ja: 'CO/CQ証明書および国際保険付きの純正ソーラーパネル＆パワーコンディショナ。', zh: '组件及逆变器均为正品，随附CO/CQ原产地质量认证及国际保险。', de: 'Echte Solarmodule & Inverter mit CO/CQ & internationaler Versicherung.' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl flex-shrink-0 border border-emerald-500/30">
                    <Award size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{getLangText(language, { vi: 'Pháp Lý & EVN Trọn Gói', en: 'Full Legal & EVN Support', ko: '법률 및 EVN 원스톱 지원', ja: '法的手続き・EVN一括サポート', zh: '合规与EVN电力并网一站式办理', de: 'Rechtliches & EVN Komplett-Support' })}</h4>
                    <p className="text-[11px] text-gray-300 leading-relaxed mt-0.5 font-light">
                      {getLangText(language, { vi: 'Hoàn tất thỏa thuận đấu nối EVN & thẩm duyệt PCCC không lo phát sinh.', en: 'Complete EVN grid-connection agreements & Fire Safety approvals.', ko: 'EVN 전력망 연계 협의 및 소방 안전 승인 완비.', ja: 'EVN系統連系協議および消防安全承認を完全サポート。', zh: '完成EVN电力并网协议及消防审核，无后续隐形费用。', de: 'Vollständige EVN-Netzanschlussvereinbarungen & Brandschutzprüfungen.' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Direct Call Box */}
            <div className="mt-8 pt-5 border-t border-white/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">{getLangText(language, { vi: 'Tư vấn khẩn cấp 24/7', en: '24/7 Emergency Line', ko: '24/7 긴급 상담', ja: '24/7緊急相談窓口', zh: '24/7紧急咨询热线', de: '24/7 Notfall-Hotline' })}</span>
                <a href={`tel:${companyProfile.contact.hotline}`} className="text-base font-black text-amber-300 hover:underline">
                  {companyProfile.contact.hotline}
                </a>
              </div>
              <a
                href={`tel:${companyProfile.contact.hotline}`}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-gray-950 font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-1"
              >
                <Phone size={13} /> {getLangText(language, { vi: 'Gọi ngay', en: 'Call Now', ko: '지금 전화하기', ja: '今すぐ電話', zh: '立即致电', de: 'Jetzt anrufen' })}
              </a>
            </div>
          </div>

          {/* Right Side Form (Unified Seamless Panel) */}
          <div className="lg:col-span-8 p-8 md:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">{getLangText(language, { vi: 'Đăng ký báo giá EPC', en: 'Request EPC Quote', ko: 'EPC 견적 요청', ja: 'EPC見積もりリクエスト', zh: '获取EPC报价', de: 'EPC-Angebot anfordern' })}</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2">
                {getLangText(language, { vi: 'Yêu Cầu Tư Vấn & Thiết Kế Dự Án', en: 'Project Design & Consultation Request', ko: '프로젝트 설계 및 상담 요청', ja: 'プロジェクト設計・相談リクエスト', zh: '项目设计与咨询请求', de: 'Projektplanung & Beratungsanfrage' })}
              </h3>

              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {getLangText(language, { vi: 'Nhập thông tin của bạn vào biểu mẫu bên dưới. Chuyên viên dự án CTC sẽ chủ động liên hệ tư vấn trong 15 phút.', en: 'Fill out the form below. CTC project specialists will reach out within 15 minutes.', ko: '양식을 작성해 주세요. CTC 프로젝트 전문가가 15분 이내에 연락해 드립니다.', ja: '以下のフォームにご入力ください。CTCのプロジェクト専門担当が15分以内にご連絡いたします。', zh: '请填写下方表单。CTC项目专家将在15分钟内与您联系。', de: 'Füllen Sie das Formular aus. Unsere Experten melden sich innerhalb von 15 Minuten.' })}
              </p>

              {formStatus === 'success' ? (
                <div className="bg-emerald-50/80 dark:bg-emerald-950/60 backdrop-blur-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-8 rounded-2xl text-center animate-fade-in my-6 space-y-4 shadow-lg">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="font-extrabold text-xl">{getLangText(language, { vi: 'Gửi Yêu Cầu Tư Vấn Thành Công!', en: 'Request Sent Successfully!', ko: '요청이 성공적으로 전송되었습니다!', ja: 'リクエストが正常に送信されました！', zh: '咨询请求发送成功！', de: 'Anfrage erfolgreich gesendet!' })}</h4>
                  <p className="text-sm max-w-md mx-auto leading-relaxed">
                    {getLangText(language, { vi: 'Cảm ơn quý khách hàng. Đội ngũ kỹ sư CTC sẽ liên hệ qua số điện thoại để trao đổi chi tiết phương án thi công.', en: 'Thank you! CTC engineering team will call you shortly to discuss project details.', ko: '감사합니다. CTC 엔지니어 팀이 조만간 연락하여 세부 사항을 논의해 드립니다.', ja: 'ありがとうございます。CTCのエンジニアチームより折り返しご連絡いたします。', zh: '感谢您的支持。CTC工程师团队将尽快与您联系讨论详细施工方案。', de: 'Vielen Dank! Unser Team wird Sie in Kürze anrufen.' })}
                  </p>
                  <button
                    onClick={() => setFormStatus('idle')}
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-all"
                  >
                    {getLangText(language, { vi: 'Gửi thêm yêu cầu tư vấn khác', en: 'Submit another request', ko: '다른 요청 제출', ja: '別のリクエストを送信', zh: '发送其他请求', de: 'Weitere Anfrage senden' })}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Honeypot field for anti-spam bots */}
                  <input
                    type="text"
                    name="website_hp"
                    value={formData.website_hp}
                    onChange={(e) => setFormData({ ...formData, website_hp: e.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hidden absolute left-[-9999px] opacity-0 pointer-events-none"
                  />
                  
                  {/* Inputs: Name & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                        {getLangText(language, { vi: 'Họ và tên *', en: 'Full Name *', ko: '성명 *', ja: 'お名前 *', zh: '姓名 *', de: 'Vollständiger Name *' })}
                      </label>
                      <div className="relative">
                        <input
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={getLangText(language, { vi: 'Ví dụ: Nguyễn Văn A', en: 'e.g. John Smith', ko: '예: 홍길동', ja: '例: 山田太郎', zh: '例如: 张三', de: 'z.B. Max Mustermann' })}
                          className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-gray-700/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-600/80 rounded-xl text-sm text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                        />
                        <User size={17} className="absolute left-3.5 top-3 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                        {getLangText(language, { vi: 'Số điện thoại *', en: 'Phone Number *', ko: '전화번호 *', ja: '電話番号 *', zh: '电话号码 *', de: 'Telefonnummer *' })}
                      </label>
                      <div className="relative">
                        <input
                          required
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="0915 059 666"
                          className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-gray-700/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-600/80 rounded-xl text-sm text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                        />
                        <Phone size={17} className="absolute left-3.5 top-3 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Inputs: Email & Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                        {getLangText(language, { vi: 'Địa chỉ Email', en: 'Email Address', ko: '이메일 주소', ja: 'メールアドレス', zh: '电子邮箱', de: 'E-Mail-Adresse' })}
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="company@domain.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-gray-700/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-600/80 rounded-xl text-sm text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                        />
                        <Mail size={17} className="absolute left-3.5 top-3 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                        {getLangText(language, { vi: 'Địa điểm dự án / Tỉnh thành', en: 'Project Location / Province', ko: '프로젝트 위치 / 성', ja: 'プロジェクト所在地 / 省', zh: '项目地点 / 省份', de: 'Projektstandort / Provinz' })}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder={getLangText(language, { vi: 'Ví dụ: KCN Hòa Khánh, Đà Nẵng', en: 'e.g. Hoa Khanh IP, Da Nang', ko: '예: 다낭 화칸 산업단지', ja: '例: ダナン ホアカン工業団地', zh: '例如: 岘港和庆工业区', de: 'z.B. Industriegebiet Hoa Khanh, Da Nang' })}
                          className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-gray-700/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-600/80 rounded-xl text-sm text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                        />
                        <MapPin size={17} className="absolute left-3.5 top-3 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Single Manual Input for Hạng mục giải pháp quan tâm */}
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      {getLangText(language, { vi: 'Hạng mục giải pháp quan tâm (Nhập tự do)', en: 'Solution / Service Category', ko: '관심 솔루션 / 서비스 분야', ja: 'ご関心のあるソリューション', zh: '感兴趣的解决方案项目', de: 'Gewünschte Lösung / Kategori' })}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        placeholder={getLangText(language, { vi: 'Ví dụ: Điện mặt trời mái nhà xưởng 500kWp, BESS lưu trữ, Trạm biến áp...', en: 'e.g. Factory Rooftop Solar 500kWp, BESS storage, 110kV Substation...', ko: '예: 공장 옥상 태양광 500kWp, BESS 저장장치, 110kV 변전소...', ja: '例: 工場屋根太陽光500kWp、BESS蓄電池、110kV変電所...', zh: '例如: 工厂屋顶光伏500kWp, BESS储能系统, 110kV变电站...', de: 'z.B. Fabrik-Dachsolar 500kWp, BESS Speicher, 110kV Umspannwerk...' })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-gray-700/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-600/80 rounded-xl text-sm text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                      />
                      <Briefcase size={17} className="absolute left-3.5 top-3 text-gray-400" />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      {getLangText(language, { vi: 'Ghi chú chi tiết / Yêu cầu công suất', en: 'Detailed Requirements / Capacity Notes', ko: '상세 요구사항 / 용량 메모', ja: '詳細要件・容量メモ', zh: '详细需求 / 容量说明', de: 'Detaillierte Anforderungen / Kapazität' })}
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={getLangText(language, { vi: 'Mô tả chi tiết diện tích mái nhà xưởng, mức tiêu thụ điện năng hàng tháng...', en: 'Describe roof area, monthly electricity consumption...', ko: '공장 옥상 면적, 월간 전력 소비량 등 상세 설명...', ja: '屋根面積や月間電力使用量などの詳細をご入力ください...', zh: '请描述厂房屋顶面积、每月用电量等详细需求...', de: 'Beschreiben Sie Dachfläche, monatlichen Stromverbrauch...' })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-gray-700/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-600/80 rounded-xl text-sm text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                      />
                      <FileText size={17} className="absolute left-3.5 top-3 text-gray-400" />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={formStatus === 'submitting'}
                    className={`w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-base rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 ${
                      formStatus === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {formStatus === 'submitting' ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {getLangText(language, { vi: 'Đang xử lý thông tin...', en: 'Processing...', ko: '정보 처리 중...', ja: '処理中...', zh: '正在处理...', de: 'Wird verarbeitet...' })}
                      </span>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>{getLangText(language, { vi: 'GỬI YÊU CẦU TƯ VẤN NGAY', en: 'SUBMIT CONSULTATION REQUEST NOW', ko: '지금 상담 요청 제출', ja: '相談リクエストを今すぐ送信', zh: '立即提交咨询请求', de: 'JETZT BERATUNGSANFRAGE SENDEN' })}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ContactForm;
