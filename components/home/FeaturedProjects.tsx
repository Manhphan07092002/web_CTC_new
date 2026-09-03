import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, MapPin, Calendar, ExternalLink, Sparkles, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';
import { useInView } from '../../hooks/useInView';
import { Project } from '../../types';
import OptimizedImage from '../OptimizedImage';

interface FeaturedProjectsProps {
  featuredProjects: Project[];
  isLoading?: boolean;
}

function getCleanProjectDescription(description?: string, excerpt?: string): string {
  if (excerpt && excerpt.trim()) return excerpt.trim();
  if (!description) return '';
  const withoutHeadings = description.replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, ' ');
  const withSpaces = withoutHeadings
    .replace(/<\/(p|div|li)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ');
  const cleanText = withSpaces.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (!cleanText) {
    return description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  return cleanText;
}

// Default top-tier projects fallback if database is empty
const DEFAULT_FEATURED_PROJECTS: Project[] = [
  {
    id: 'coco-viet-nam',
    title: 'Điện Mặt Trời Áp Mái Công Ty TNHH Dệt Quốc Tế Coco Việt Nam',
    location: 'KCN Bảo Minh, Nam Định',
    capacity: '2.531 kWp',
    completionDate: '2024',
    category: 'Điện mặt trời áp mái',
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&q=80',
    description: 'Hệ thống điện mặt trời áp mái công nghiệp quy mô 2.531 kWp sử dụng pin Tier 1 và biến tần trung tâm, giúp tiết kiệm hàng tỷ đồng tiền điện mỗi năm.'
  },
  {
    id: 'max-packaging',
    title: 'Điện Mặt Trời Áp Mái Nhà Máy Max Packaging',
    location: 'KCN VSIP, Quảng Ngãi',
    capacity: '600 kWp',
    completionDate: '2024',
    category: 'Điện mặt trời công nghiệp',
    image: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=800&q=80',
    description: 'Giải pháp tự dùng tối ưu cho nhà máy sản xuất bao bì, vận hành an toàn và đạt chứng nhận năng lượng xanh chuẩn quốc tế.'
  },
  {
    id: 'det-may-chau-giang',
    title: 'Điện Mặt Trời Áp Mái Nhà Máy Dệt May Châu Giang',
    location: 'Hà Nam',
    capacity: '3.0 MWp',
    completionDate: '2023',
    category: 'Điện mặt trời áp mái',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    description: 'Công trình tổng thầu EPC năng lượng mặt trời công nghiệp quy mô lớn, giảm phát thải hơn 3.200 tấn CO2 hàng năm.'
  },
  {
    id: 'farm-solar-gio-linh',
    title: 'Trang Trại Điện Mặt Trời Farm Solar Gio Linh',
    location: 'Gio Linh, Quảng Trị',
    capacity: '4.0 MWp',
    completionDate: '2023',
    category: 'Farm Solar Nông nghiệp',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
    description: 'Mô hình kết hợp nông nghiệp công nghệ cao và điện mặt trời hòa lưới EVN, mang lại hiệu quả kinh tế kép bền vững.'
  }
];

const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({ featuredProjects, isLoading = false }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { ref: projectsRef, isInView } = useInView(0.1);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Use provided featured projects or fallback
  const rawProjects = featuredProjects && featuredProjects.length > 0
    ? featuredProjects.slice(0, 4)
    : DEFAULT_FEATURED_PROJECTS;

  return (
    <section 
      ref={projectsRef} 
      className="py-24 sm:py-32 bg-slate-950 text-white relative overflow-hidden transition-colors duration-300"
    >
      {/* Dynamic Ambient Background Lights */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="container max-w-[1440px] mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 px-4 py-1.5 rounded-full mb-4 shadow-sm shadow-cyan-500/10 backdrop-blur-md">
              <Zap size={14} className="text-cyan-400 animate-pulse" />
              <span className="text-[11px] font-black text-cyan-300 uppercase tracking-widest">
                {getLangText(language, {
                  vi: 'Dự án tiêu biểu • Tổng thầu EPC',
                  en: 'Featured Projects • EPC Contractor',
                  ko: '주요 프로젝트 • EPC 총괄',
                  ja: '主要プロジェクト • EPC総括',
                  zh: '精选项目 • EPC总承包',
                  de: 'Ausgewählte Projekte • EPC-Generalunternehmer'
                })}
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              {getLangText(language, {
                vi: 'Dự án Năng lượng Tiêu biểu',
                en: 'Featured Energy Projects',
                ko: '주요 태양광 에너지 프로젝트',
                ja: '注目の太陽光エネルギープロジェクト',
                zh: '标杆光伏能源项目',
                de: 'Ausgewählte Energieprojekte'
              })}
            </h2>
            
            <div className="w-20 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400 rounded-full mb-5" />
            
            <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl font-normal leading-relaxed">
              {getLangText(language, {
                vi: 'Khẳng định uy tín và năng lực thi công qua hàng trăm công trình điện mặt trời áp mái công nghiệp & trang trại quy mô lớn trên toàn quốc.',
                en: 'Demonstrating excellence through hundreds of commercial rooftop and utility-scale solar farm projects across the country.',
                ko: '전국 수백 개의 산업용 옥상 및 대규모 태양광 발전소 시공 역량을 입증합니다.',
                ja: '全国の産業用屋根置きおよびメガソーラー発電所における確かな施工実績。',
                zh: '通过全国数百个工商业屋顶与大型地面光伏电站，彰显卓越EPC施工实力。',
                de: 'Nachgewiesene Kompetenz durch Hunderte von Industrie-Dachanlagen und Solarparks bundesweit.'
              })}
            </p>
          </div>

          <Link
            to="/projects"
            className="group flex-shrink-0 inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-2 border-cyan-400/40 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-400 font-black text-xs uppercase tracking-widest transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/25"
          >
            {getLangText(language, {
              vi: 'XEM TẤT CẢ DỰ ÁN',
              en: 'VIEW ALL PROJECTS',
              ko: '전체 프로젝트 보기',
              ja: 'すべてのプロジェクトを見る',
              zh: '查看所有项目',
              de: 'ALLE PROJEKTE ANSEHEN'
            })}
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

        {/* 4-Column Showcase Grid */}
        <div
          aria-busy={isLoading}
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 delay-150 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => (
              <div 
                key={`project-skeleton-${i}`} 
                className="h-[520px] rounded-3xl bg-slate-900/80 border border-slate-800 animate-pulse flex flex-col justify-end p-6 space-y-4"
              >
                <div className="h-6 w-1/3 bg-slate-800 rounded-full" />
                <div className="h-7 w-4/5 bg-slate-800 rounded-xl" />
                <div className="h-4 w-full bg-slate-800 rounded" />
                <div className="h-4 w-2/3 bg-slate-800 rounded" />
              </div>
            ))
            : rawProjects.map((project, index) => {
              const isHovered = hoveredIndex === index;
              const projectId = project._id || project.id;
              const cleanDesc = getCleanProjectDescription(project.description, project.excerpt);

              return (
                <div
                  key={`project-card-${index}-${projectId}`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => navigate(`/projects/${projectId}`)}
                  className="group relative h-[520px] rounded-3xl overflow-hidden border border-slate-800/80 hover:border-cyan-400/60 bg-slate-900 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/15 transition-all duration-500 cursor-pointer flex flex-col justify-between"
                >
                  {/* Background Image Container with Smooth Zoom */}
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <OptimizedImage
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    
                    {/* Layered Rich Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-black/30 z-10" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent z-10" />
                    <div className={`absolute inset-0 bg-cyan-950/20 mix-blend-color transition-opacity duration-500 z-10 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`} />
                  </div>

                  {/* Top Bar Badges */}
                  <div className="relative z-20 p-5 flex items-start justify-between gap-2">
                    {/* Full Category Pill (Never truncated!) */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/15 text-white text-[11px] font-bold shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      {project.category || 'Điện mặt trời'}
                    </span>

                    {/* Capacity Badge in Shiny Gold / Amber */}
                    {project.capacity && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 tracking-wide">
                        <Sparkles size={12} className="fill-slate-950" />
                        {project.capacity}
                      </span>
                    )}
                  </div>

                  {/* Bottom Info Glass Card */}
                  <div className="relative z-20 p-6 flex flex-col justify-end space-y-3 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pt-12">
                    
                    {/* Location and Date Pills */}
                    <div className="flex items-center flex-wrap gap-2 text-[11px] text-slate-300 font-semibold">
                      {project.location && (
                        <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-cyan-200">
                          <MapPin size={12} className="text-cyan-400" />
                          <span className="truncate max-w-[130px]">{project.location}</span>
                        </span>
                      )}
                      {project.completionDate && (
                        <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-slate-300">
                          <Calendar size={12} className="text-amber-400" />
                          <span>{project.completionDate}</span>
                        </span>
                      )}
                    </div>

                    {/* Project Title */}
                    <h3 className="text-lg sm:text-xl font-black text-white leading-snug line-clamp-2 group-hover:text-cyan-300 transition-colors duration-300">
                      {project.title}
                    </h3>

                    {/* Description excerpt (reveals more cleanly on hover) */}
                    {cleanDesc && (
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed opacity-85 group-hover:opacity-100 transition-opacity">
                        {cleanDesc}
                      </p>
                    )}

                    {/* Action button row */}
                    <div className="pt-2 flex items-center justify-between border-t border-white/10">
                      <span className="text-xs font-black text-cyan-400 group-hover:text-white uppercase tracking-wider flex items-center gap-1 transition-colors">
                        Khám phá công trình
                      </span>
                      <div className={`w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 transition-all duration-300 ${
                        isHovered ? 'bg-cyan-400 text-slate-950 scale-110' : ''
                      }`}>
                        <ArrowRight size={14} className={`transition-transform duration-300 ${
                          isHovered ? 'translate-x-0.5' : ''
                        }`} />
                      </div>
                    </div>
                  </div>

                  {/* Glowing border highlight on hover */}
                  <div className={`absolute inset-0 rounded-3xl pointer-events-none border-2 transition-opacity duration-500 z-30 ${
                    isHovered ? 'border-cyan-400/60 opacity-100' : 'border-transparent opacity-0'
                  }`} />
                </div>
              );
            })}
        </div>

        {/* Bottom Trust Indicators Bar */}
        <div className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md transition-all duration-700 delay-300 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Zap size={22} />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-white">50+ MWp</div>
              <div className="text-xs text-slate-400 font-medium">Tổng công suất đã lắp</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
              <Award size={22} />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-white">100+ Dự án</div>
              <div className="text-xs text-slate-400 font-medium">Nhà xưởng & trang trại</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-white">25 Năm</div>
              <div className="text-xs text-slate-400 font-medium">Bảo hành hiệu suất pin</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-white">100% EVN</div>
              <div className="text-xs text-slate-400 font-medium">Đấu nối & nghiệm thu</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FeaturedProjects;

