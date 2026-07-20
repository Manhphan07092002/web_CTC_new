import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowRight, Award, Building2, CheckCircle2, Database, HardHat,
  Network, Radio, Server, ShieldCheck, Sun, Wind, Wrench, Zap,
} from 'lucide-react';
import SEO from '../components/SEO';

type Solution = {
  name: string;
  eyebrow: string;
  headline: string;
  intro: string;
  image: string;
  accent: string;
  icon: React.ReactNode;
  metrics: { value: string; label: string }[];
  services: { title: string; description: string; icon: React.ReactNode }[];
  strengths: string[];
  applications: string[];
  seoDescription: string;
};

const solutions: Record<string, Solution> = {
  telecom: {
    name: 'Hạ tầng Viễn thông', eyebrow: 'VIỄN THÔNG & TRUYỀN DẪN',
    headline: 'Kết nối ổn định cho mọi hạ tầng trọng yếu',
    intro: 'CTC khảo sát, thiết kế và thi công đồng bộ hạ tầng truyền dẫn, mạng cáp quang ngoại vi và trạm phát sóng. Giải pháp được triển khai theo quy trình khép kín, phù hợp cho nhà mạng, cơ quan nhà nước và hệ thống chuyên dụng.',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=85&w=1920&auto=format&fit=crop', accent: '#0ea5e9', icon: <Radio size={26} />,
    metrics: [{ value: '32+', label: 'Năm kinh nghiệm' }, { value: '100+', label: 'Công trình viễn thông' }, { value: '53+', label: 'Cán bộ kỹ thuật chủ chốt' }],
    services: [
      { title: 'Mạng cáp quang OSP', description: 'Khảo sát tuyến, thiết kế, kéo cáp, hàn nối, đo kiểm và hoàn công mạng ngoại vi.', icon: <Network /> },
      { title: 'Trạm BTS/NodeB', description: 'Xây lắp hạ tầng trạm, cột anten, nguồn điện, tiếp địa và tích hợp thiết bị.', icon: <Radio /> },
      { title: 'Mạng truyền dẫn Metro', description: 'Triển khai hạ tầng truyền dẫn dung lượng cao, bảo đảm khả năng mở rộng và dự phòng.', icon: <Database /> },
    ],
    strengths: ['Kinh nghiệm thực tế với mạng Metro Mobifone và VNPT Net', 'Năng lực thi công tuyến cáp quang chuyên dụng cho Bộ Công an', 'Đội ngũ kỹ sư viễn thông, điện và xây dựng phối hợp đồng bộ', 'Dịch vụ từ khảo sát, thiết kế đến vận hành và bảo trì'],
    applications: ['Nhà mạng viễn thông', 'Cơ quan nhà nước', 'Khu công nghiệp', 'Mạng chuyên dụng'],
    seoDescription: 'Giải pháp hạ tầng viễn thông CTC: cáp quang OSP, trạm BTS/NodeB, mạng Metro, nguồn và tiếp địa cho nhà mạng và cơ quan nhà nước.',
  },
  solar: {
    name: 'Điện Mặt Trời Solar', eyebrow: 'NĂNG LƯỢNG TÁI TẠO',
    headline: 'Biến mái nhà và quỹ đất thành nguồn năng lượng sạch',
    intro: 'CTC cung cấp giải pháp EPC điện mặt trời cho hộ gia đình, thương mại và công nghiệp. Mỗi hệ thống được tính toán theo mặt bằng, phụ tải và mục tiêu đầu tư để tối ưu sản lượng, độ bền và hiệu quả vận hành dài hạn.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=85&w=1920&auto=format&fit=crop', accent: '#f97316', icon: <Sun size={26} />,
    metrics: [{ value: '500+', label: 'Công trình toàn lĩnh vực' }, { value: 'EPC', label: 'Triển khai trọn gói' }, { value: '24/7', label: 'Theo dõi vận hành' }],
    services: [
      { title: 'Solar áp mái', description: 'Giải pháp cho hộ gia đình, văn phòng và công trình thương mại.', icon: <Building2 /> },
      { title: 'Solar C&I', description: 'Hệ thống cho nhà máy và khu công nghiệp, ưu tiên tự dùng và tối ưu chi phí điện.', icon: <Zap /> },
      { title: 'Vận hành & bảo trì', description: 'Giám sát sản lượng, kiểm tra an toàn, vệ sinh và bảo trì phòng ngừa.', icon: <Wrench /> },
    ],
    strengths: ['Quy trình EPC khép kín từ khảo sát đến bàn giao', 'Thiết kế theo phụ tải thực tế và điều kiện công trình', 'Tích hợp hệ thống điện, chống sét và giám sát', 'Đồng hành vận hành và bảo trì sau đầu tư'],
    applications: ['Hộ gia đình', 'Nhà máy sản xuất', 'Kho vận', 'Tòa nhà thương mại'],
    seoDescription: 'Giải pháp EPC điện mặt trời CTC cho hộ gia đình, nhà máy và khu công nghiệp; tư vấn, thiết kế, thi công, vận hành và bảo trì.',
  },
  wind: {
    name: 'Điện Gió Wind Power', eyebrow: 'NĂNG LƯỢNG TÁI TẠO',
    headline: 'Hạ tầng đồng bộ cho dự án điện gió quy mô lớn',
    intro: 'CTC tham gia xây dựng hạ tầng điện gió từ nền móng, đường nội bộ, hệ thống cáp đến trạm biến áp và đấu nối. Năng lực thực tế được tích lũy qua các dự án tại khu vực miền Trung, đặc biệt ở Quảng Trị.',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=85&w=1920&auto=format&fit=crop', accent: '#14b8a6', icon: <Wind size={26} />,
    metrics: [{ value: '3', label: 'Dự án điện gió tiêu biểu' }, { value: '110kV', label: 'Năng lực đấu nối' }, { value: 'EPC', label: 'Phối hợp đa hạng mục' }],
    services: [
      { title: 'Hạ tầng công trường', description: 'Đường công vụ, bãi lắp ráp và các hạng mục phụ trợ phục vụ thi công.', icon: <HardHat /> },
      { title: 'Móng trụ & cáp nội bộ', description: 'Thi công kết cấu móng, hệ thống cáp thu gom và tiếp địa an toàn.', icon: <Wind /> },
      { title: 'Đấu nối hệ thống điện', description: 'Trạm biến áp, đường dây và phối hợp hệ thống điều khiển giám sát.', icon: <Zap /> },
    ],
    strengths: ['Kinh nghiệm tại Hướng Hiệp, Hướng Linh và Hướng Linh 4', 'Khả năng phối hợp xây dựng, điện và viễn thông', 'Kiểm soát an toàn trong điều kiện địa hình phức tạp', 'Tổ chức thi công theo tiến độ tổng thể của dự án'],
    applications: ['Trang trại điện gió trên bờ', 'Trạm thu gom', 'Trạm biến áp 110kV', 'Hệ thống SCADA'],
    seoDescription: 'Giải pháp xây dựng hạ tầng điện gió CTC: móng trụ, đường công vụ, cáp nội bộ, trạm biến áp 110kV và đấu nối lưới.',
  },
  electrical: {
    name: 'Đường Dây & Trạm Biến Áp', eyebrow: 'ĐIỆN LỰC & KỸ THUẬT',
    headline: 'Hạ tầng truyền tải an toàn, tin cậy và sẵn sàng vận hành',
    intro: 'CTC cung cấp giải pháp xây lắp đường dây trung – cao thế, trạm biến áp và các hệ thống điện phụ trợ. Phạm vi công việc được quản lý đồng bộ từ khảo sát hiện trường, tổ chức thi công đến thí nghiệm và bàn giao.',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=85&w=1920&auto=format&fit=crop', accent: '#eab308', icon: <Zap size={26} />,
    metrics: [{ value: '110kV', label: 'Cấp điện áp tiêu biểu' }, { value: '02', label: 'Chứng chỉ năng lực' }, { value: '32+', label: 'Năm kinh nghiệm' }],
    services: [
      { title: 'Đường dây tải điện', description: 'Xây lắp tuyến trung và cao thế, móng cột, kéo dây và hoàn thiện hành lang tuyến.', icon: <Zap /> },
      { title: 'Trạm biến áp', description: 'Thi công phần xây dựng, lắp đặt thiết bị, cáp lực và hệ thống điều khiển.', icon: <Building2 /> },
      { title: 'Nguồn & an toàn điện', description: 'Nguồn dự phòng UPS, tiếp địa, chống sét và kiểm tra an toàn hệ thống.', icon: <ShieldCheck /> },
    ],
    strengths: ['Năng lực triển khai trạm biến áp 110kV', 'Đội ngũ kỹ sư điện và xây dựng giàu kinh nghiệm', 'Kiểm soát chất lượng và an toàn theo từng hạng mục', 'Tích hợp nguồn, tiếp địa, chống sét và giám sát'],
    applications: ['Nhà máy điện', 'Khu công nghiệp', 'Hạ tầng đô thị', 'Công trình trọng yếu'],
    seoDescription: 'CTC xây lắp đường dây tải điện, trạm biến áp 110kV, nguồn dự phòng, tiếp địa và chống sét cho dự án công nghiệp và năng lượng.',
  },
  datacenter: {
    name: 'Data Center & CNTT', eyebrow: 'HẠ TẦNG SỐ',
    headline: 'Nền tảng số bền vững cho hoạt động liên tục',
    intro: 'CTC thiết kế và tích hợp hạ tầng Data Center, mạng doanh nghiệp, camera và hệ thống thông minh. Giải pháp cân bằng giữa tính sẵn sàng, an toàn, khả năng mở rộng và hiệu quả vận hành.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=85&w=1920&auto=format&fit=crop', accent: '#8b5cf6', icon: <Server size={26} />,
    metrics: [{ value: 'Tier III', label: 'Định hướng tiêu chuẩn' }, { value: '24/7', label: 'Giám sát hệ thống' }, { value: '53+', label: 'Nhân sự kỹ thuật chủ chốt' }],
    services: [
      { title: 'Hạ tầng Data Center', description: 'Không gian máy chủ, nguồn, làm mát chính xác, giám sát và phòng cháy chữa cháy.', icon: <Server /> },
      { title: 'Mạng & bảo mật', description: 'Mạng LAN/WAN, cáp cấu trúc, phân vùng và giải pháp bảo vệ hạ tầng.', icon: <Network /> },
      { title: 'Hệ thống thông minh', description: 'Camera, kiểm soát ra vào và nền tảng giám sát tập trung.', icon: <Database /> },
    ],
    strengths: ['Thiết kế hạ tầng theo định hướng Tier III', 'Tích hợp điện, làm mát, mạng và an ninh', 'Kiến trúc có dự phòng và khả năng mở rộng', 'Dịch vụ vận hành, giám sát và bảo trì'],
    applications: ['Trung tâm dữ liệu', 'Doanh nghiệp', 'Cơ quan nhà nước', 'Trung tâm điều hành'],
    seoDescription: 'Giải pháp Data Center và CNTT CTC: nguồn, làm mát, mạng, bảo mật, camera và hệ thống giám sát tích hợp.',
  },
  construction: {
    name: 'Xây Dựng Dân Dụng & Công Nghiệp', eyebrow: 'XÂY DỰNG KỸ THUẬT',
    headline: 'Kiến tạo công trình bền vững từ thiết kế đến bàn giao',
    intro: 'CTC thi công công trình dân dụng, nhà xưởng công nghiệp và hạ tầng kỹ thuật đi kèm các dự án viễn thông, điện và năng lượng. Mô hình Design-Build/EPC giúp thống nhất trách nhiệm, chất lượng và tiến độ.',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?q=85&w=1920&auto=format&fit=crop', accent: '#64748b', icon: <Building2 size={26} />,
    metrics: [{ value: '500+', label: 'Công trình toàn lĩnh vực' }, { value: 'EPC', label: 'Tổng thầu trọn gói' }, { value: '02', label: 'Chứng chỉ năng lực' }],
    services: [
      { title: 'Công trình công nghiệp', description: 'Nhà xưởng, kho, nền móng thiết bị và hạ tầng phục vụ sản xuất.', icon: <Building2 /> },
      { title: 'Công trình dân dụng', description: 'Thi công kết cấu, hoàn thiện và hệ thống kỹ thuật đồng bộ.', icon: <HardHat /> },
      { title: 'M&E và hạ tầng kỹ thuật', description: 'Hệ thống điện, cấp thoát nước, phòng cháy và hạ tầng ngoài nhà.', icon: <Wrench /> },
    ],
    strengths: ['Quản lý một đầu mối theo mô hình EPC/Design-Build', 'Phối hợp đa chuyên ngành tại công trường', 'Năng lực thi công công trình quốc phòng và hạ tầng trọng yếu', 'Cam kết chất lượng, an toàn và tiến độ'],
    applications: ['Nhà xưởng & kho', 'Công trình dân dụng', 'Hạ tầng năng lượng', 'Công trình quốc phòng'],
    seoDescription: 'Giải pháp xây dựng dân dụng và công nghiệp CTC: nhà xưởng, hạ tầng kỹ thuật, M&E và tổng thầu EPC/Design-Build.',
  },
};

const SolutionDetail: React.FC = () => {
  const { slug = '' } = useParams();
  const solution = solutions[slug];
  if (!solution) return <Navigate to="/solutions" replace />;

  return <div className="bg-white dark:bg-[#060d1d] text-slate-700 dark:text-slate-200">
    <SEO title={solution.name} description={solution.seoDescription} schema={{ '@context': 'https://schema.org', '@type': 'Service', name: solution.name, description: solution.seoDescription, provider: { '@type': 'Organization', name: 'Công ty Cổ phần Xây lắp Bưu điện Miền Trung', telephone: '+84-915-059-666' }, areaServed: 'Vietnam' }} />
    <section className="relative min-h-[620px] flex items-center overflow-hidden bg-slate-950 pt-28">
      <img src={solution.image} alt={solution.name} className="absolute inset-0 h-full w-full object-cover opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/25" />
      <div className="container mx-auto px-6 relative z-10 py-20">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-bold tracking-[.18em] text-white backdrop-blur-md" style={{ color: solution.accent }}>{solution.icon}{solution.eyebrow}</div>
          <h1 className="mt-7 text-4xl md:text-6xl font-black leading-tight text-white">{solution.name}<span className="block mt-2" style={{ color: solution.accent }}>{solution.headline}</span></h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-200">{solution.intro}</p>
          <div className="mt-9 flex flex-wrap gap-4"><Link to="/contact" className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-bold text-white" style={{ backgroundColor: solution.accent }}>Trao đổi với kỹ sư <ArrowRight size={18} /></Link><a href="tel:0915059666" className="rounded-xl border border-white/30 px-6 py-3.5 font-bold text-white hover:bg-white/10">0915 059 666</a></div>
        </div>
      </div>
    </section>

    <section className="container mx-auto px-6 py-16">
      <div className="grid md:grid-cols-3 gap-5">{solution.metrics.map(item => <div key={item.label} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-7"><div className="text-3xl font-black" style={{ color: solution.accent }}>{item.value}</div><div className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.label}</div></div>)}</div>
    </section>

    <section className="container mx-auto px-6 pb-20">
      <div className="text-center max-w-2xl mx-auto"><div className="text-xs font-bold tracking-[.2em]" style={{ color: solution.accent }}>PHẠM VI GIẢI PHÁP</div><h2 className="mt-3 text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Năng lực triển khai đồng bộ</h2></div>
      <div className="mt-10 grid md:grid-cols-3 gap-6">{solution.services.map(service => <article key={service.title} className="rounded-3xl border border-slate-200 dark:border-white/10 p-7 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all"><div className="flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ backgroundColor: solution.accent }}>{service.icon}</div><h3 className="mt-5 text-lg font-extrabold text-slate-900 dark:text-white">{service.title}</h3><p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{service.description}</p></article>)}</div>
    </section>

    <section className="bg-slate-50 dark:bg-slate-950/60 py-20"><div className="container mx-auto px-6 grid lg:grid-cols-2 gap-8">
      <div className="rounded-3xl bg-slate-900 p-8 md:p-10 text-white"><Award style={{ color: solution.accent }} /><h2 className="mt-5 text-2xl font-black">Vì sao chọn CTC?</h2><div className="mt-7 space-y-4">{solution.strengths.map(text => <div key={text} className="flex gap-3 text-sm leading-6 text-slate-200"><CheckCircle2 size={19} className="shrink-0 mt-0.5" style={{ color: solution.accent }} />{text}</div>)}</div></div>
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 md:p-10"><h2 className="text-2xl font-black text-slate-900 dark:text-white">Ứng dụng tiêu biểu</h2><div className="mt-7 grid sm:grid-cols-2 gap-4">{solution.applications.map(text => <div key={text} className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-900 p-4 font-bold text-sm"><CheckCircle2 size={18} style={{ color: solution.accent }} />{text}</div>)}</div><p className="mt-7 text-sm leading-6 text-slate-500 dark:text-slate-400">Mỗi dự án được khảo sát và thiết kế theo điều kiện thực tế. CTC cung cấp hồ sơ kỹ thuật, kế hoạch triển khai và phương án vận hành phù hợp trước khi thi công.</p></div>
    </div></section>

    <section className="container mx-auto px-6 py-20"><div className="rounded-3xl px-8 py-12 md:p-14 text-center text-white" style={{ background: `linear-gradient(135deg, ${solution.accent}, #0f172a)` }}><h2 className="text-3xl font-black">Bạn đang chuẩn bị một dự án?</h2><p className="mx-auto mt-4 max-w-2xl text-white/80">Gửi yêu cầu để đội ngũ CTC khảo sát nhu cầu, tư vấn phạm vi công việc và đề xuất phương án phù hợp.</p><Link to="/contact" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-bold text-slate-900">Nhận tư vấn giải pháp <ArrowRight size={18} /></Link></div></section>
  </div>;
};

export default SolutionDetail;
