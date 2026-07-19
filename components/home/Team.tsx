import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Briefcase, ArrowRight, Mail, Target } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';
import { useMouseParallax } from '../../hooks/useMouseParallax';

interface TeamProps {
  teamMembers: any[];
  isLoading?: boolean;
}

const Team: React.FC<TeamProps> = ({ teamMembers, isLoading = false }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const parallax = useMouseParallax();
  const { ref: teamRef, isInView } = useInView(0.1);
  const isEn = language === 'en';

  return (
    <section ref={teamRef} className="py-24 bg-slate-50 dark:bg-[#060d1d] relative overflow-hidden transition-colors duration-300">
      <style dangerouslySetInnerHTML={{ __html: `
        .team-blueprint-lines {
            position: absolute;
            inset: 0;
            background-image: 
                linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
            background-size: 80px 80px;
            z-index: 1;
            opacity: 0.5;
            pointer-events: none;
        }
        .dark .team-blueprint-lines {
            background-image: 
                linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        }

        .team-aura-glow {
            position: absolute;
            width: 700px;
            height: 700px;
            background: radial-gradient(circle, rgba(14, 165, 233, 0.16) 0%, transparent 70%);
            filter: blur(90px);
            z-index: 1;
            pointer-events: none;
        }
        .dark .team-aura-glow {
            background: radial-gradient(circle, rgba(14, 165, 233, 0.04) 0%, transparent 70%);
        }
        .t-aura-1 { top: -15%; right: -5%; }
        .t-aura-2 { bottom: -15%; left: -5%; }

        .team-glass-badge {
            background: rgba(255, 255, 255, 0.45);
            border: 1px solid rgba(255, 255, 255, 0.7);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
        }
        .dark .team-glass-badge {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .team-glass-card {
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.65);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.02), inset 0 1px 2px rgba(255, 255, 255, 0.5);
            z-index: 10;
        }
        .dark .team-glass-card {
            background: rgba(255, 255, 255, 0.015);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.05);
        }
        .team-glass-card:hover {
            transform: translateY(-8px);
            background: rgba(255, 255, 255, 0.45);
            border-color: rgba(14, 165, 233, 0.4);
            box-shadow: 0 20px 40px -10px rgba(14, 165, 233, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.6);
        }
        .dark .team-glass-card:hover {
            background: rgba(255, 255, 255, 0.03);
            border-color: rgba(56, 189, 248, 0.3);
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }

        @keyframes floatNormal {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .animate-float-normal {
            animation: floatNormal 6s ease-in-out infinite;
        }

        @keyframes floatCenter {
            0%, 100% { transform: translate(-50%, -50%) translateY(0); }
            50% { transform: translate(-50%, -50%) translateY(-10px); }
        }
        .animate-float-center {
            animation: floatCenter 6s ease-in-out infinite;
        }
      `}} />

      <div className="team-blueprint-lines"></div>
      <div className="team-aura-glow t-aura-1"></div>
      <div className="team-aura-glow t-aura-2"></div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className={`text-center mb-20 max-w-4xl mx-auto transition-all duration-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="team-glass-badge inline-flex items-center gap-2 px-6 py-2 rounded-full mb-6">
            <Users size={20} className="text-sky-500" />
            <span className="text-sm font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">{t('home.team_badge')}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
            {t('home.team_title')}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">{t('home.team_desc')}</p>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 transition-all duration-500 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} aria-busy={isLoading}>
          {isLoading ? [1, 2, 3, 4].map((item) => (
            <div key={item} className="team-glass-card p-4 rounded-[2.5rem] animate-pulse" aria-hidden="true">
              <div className="h-72 rounded-[1.8rem] bg-slate-200 dark:bg-slate-800 mb-5" />
              <div className="h-5 w-2/3 mx-auto rounded bg-slate-200 dark:bg-slate-800 mb-3" />
              <div className="h-3 w-1/2 mx-auto rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          )) : teamMembers.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-4 py-10 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              {isEn ? 'Our technical team profile is being updated.' : 'Thông tin đội ngũ kỹ thuật đang được cập nhật.'}
            </div>
          ) : teamMembers.map((member, index) => {
            return (
              <div
                key={`team-${index}-${member._id || member.id}`}
                className="team-glass-card group relative p-4 rounded-[2.5rem] flex flex-col justify-between"
              >
                <div className="relative h-72 rounded-[1.8rem] overflow-hidden mb-5">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                  <img
                    src={member.image}
                    alt={member.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute bottom-6 left-6 right-6 text-white z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-xs font-medium mb-2">{member.bio || (isEn ? 'Solar Energy Expert' : 'Chuyên gia năng lượng mặt trời')}</p>
                    <div className="flex gap-2">
                      <a href={`mailto:${member.email || 'info@ctcdn.vn'}`} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-sky-500 transition-colors">
                        <Mail size={14} className="text-white" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="text-center pb-3">
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-sky-500 transition-colors">{member.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{member.role}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Join Team CTA - Glassmorphic Redesign */}
        <div className={`team-glass-card p-10 sm:p-12 md:p-16 rounded-[3rem] relative max-w-5xl mx-auto mt-24 transition-all duration-500 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Left Content */}
            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="team-glass-badge inline-flex items-center gap-2 px-5 py-2 rounded-full">
                <Briefcase size={18} className="text-sky-500" />
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">{t('home.join_team')}</span>
              </div>
              
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-[1.3] py-2">
                {t('home.join_team_title')} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">{t('home.join_team_highlight')}</span>
              </h3>
              
              <p className="text-slate-500 dark:text-slate-300 text-base max-w-md mx-auto md:mx-0 leading-relaxed font-normal">
                {t('home.join_team_desc')}
              </p>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-sky-500/10 hover:shadow-sky-500/25 transition-all duration-300 hover:-translate-y-1"
                >
                  {t('home.apply_now')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="mailto:hr@ctcdn.vn"
                  className="inline-flex items-center gap-3 bg-white/40 dark:bg-white/5 text-slate-900 dark:text-white border border-white/60 dark:border-white/10 px-8 py-4 rounded-full font-bold hover:border-sky-500 hover:text-sky-500 dark:hover:text-sky-400 transition-all duration-300 hover:-translate-y-1"
                >
                  <Mail size={20} /> hr@ctcdn.vn
                </a>
              </div>
            </div>

            {/* Right Decorative/Visual */}
            <div className="relative w-full md:w-1/2 lg:w-5/12 aspect-square md:aspect-auto md:h-80">
              {/* Decorative Circles */}
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
              
              {/* Floating Cards Composition */}
              <div className="relative h-full w-full flex items-center justify-center">
                <div className="absolute top-0 right-10 w-24 h-24 team-glass-card rounded-2xl shadow-xl flex items-center justify-center animate-float-normal" style={{ animationDelay: '0s' }}>
                  <Users size={32} className="text-sky-500" />
                </div>
                <div className="absolute bottom-10 left-10 w-20 h-20 team-glass-card rounded-2xl shadow-xl flex items-center justify-center animate-float-normal" style={{ animationDelay: '1.5s' }}>
                  <Target size={28} className="text-orange-500" />
                </div>
                <div className="absolute top-1/2 left-1/2 w-40 h-40 team-glass-card rounded-3xl shadow-2xl flex flex-col items-center justify-center z-10 animate-float-center" style={{ animationDelay: '0.3s' }}>
                  <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">53+</div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest">{language === 'en' ? 'TECHNICAL OFFICERS' : 'CÁN BỘ KỸ THUẬT'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
