import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Briefcase, ArrowRight, Mail, Target } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';
import { useMouseParallax } from '../../hooks/useMouseParallax';

interface TeamProps {
  teamMembers: any[];
}

const Team: React.FC<TeamProps> = ({ teamMembers }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const parallax = useMouseParallax();
  const { ref: teamRef, isInView } = useInView(0.1);

  return (
    <section ref={teamRef} className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" style={{ transform: `translate(${parallax.x * 0.5}px, ${parallax.y * 0.5}px)` }}></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-50/50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" style={{ transform: `translate(${parallax.x * -0.5}px, ${parallax.y * -0.5}px)` }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center mb-20 max-w-3xl mx-auto transition-all duration-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 bg-white px-6 py-2 rounded-full mb-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <Users size={20} className="text-primary animate-bounce-once" />
            <span className="text-sm font-bold text-primary uppercase tracking-widest">{t('home.team_badge')}</span>
          </div>
          <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            {t('home.team_title')}
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed">{t('home.team_desc')}</p>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 transition-all duration-300 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {teamMembers.map((member, index) => {
            const colors = [
              { gradient: 'from-orange-500 to-red-500', text: 'text-orange-600', bg: 'bg-orange-50' },
              { gradient: 'from-blue-500 to-cyan-500', text: 'text-blue-600', bg: 'bg-blue-50' },
              { gradient: 'from-green-500 to-emerald-500', text: 'text-green-600', bg: 'bg-green-50' },
              { gradient: 'from-purple-500 to-pink-500', text: 'text-purple-600', bg: 'bg-purple-50' }
            ];
            const colorScheme = colors[index % colors.length];

            return (
              <div
                key={`team-${index}-${member._id || member.id}`}
                className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-200 hover:-translate-y-2 perspective-1000"
              >
                <div className="relative h-80 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`}></div>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute bottom-6 left-6 right-6 text-white z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-sm font-medium mb-1">{member.bio || 'Chuyên gia năng lượng mặt trời'}</p>
                    <div className="flex gap-2">
                      <a href={`mailto:${member.email || 'info@ctcdn.vn'}`} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-primary transition-colors">
                        <Mail size={14} className="text-white" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <h4 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-primary transition-colors">{member.name}</h4>
                  <p className="text-sm text-gray-500 font-semibold">{member.role}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Join Team CTA - Boundless Minimalist Design */}
        <div className={`relative max-w-5xl mx-auto mt-24 transition-all duration-300 delay-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Left Content */}
            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full">
                <Briefcase size={18} className="text-primary animate-bounce-once" />
                <span className="text-sm font-bold text-primary uppercase tracking-wider">{t('home.join_team')}</span>
              </div>
              
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.4] py-2">
                {t('home.join_team_title')} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600">{t('home.join_team_highlight')}</span>
              </h3>
              
              <p className="text-gray-500 text-lg max-w-md mx-auto md:mx-0 leading-relaxed">
                {t('home.join_team_desc')}
              </p>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {t('home.apply_now')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="mailto:hr@ctcdn.vn"
                  className="inline-flex items-center gap-3 bg-white text-gray-900 border-2 border-gray-100 px-8 py-4 rounded-full font-bold hover:border-primary hover:text-primary transition-all duration-300 hover:-translate-y-1"
                >
                  <Mail size={20} /> hr@ctcdn.vn
                </a>
              </div>
            </div>

            {/* Right Decorative/Visual */}
            <div className="relative w-full md:w-1/2 lg:w-5/12 aspect-square md:aspect-auto md:h-80">
              {/* Decorative Circles */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
              
              {/* Floating Cards Composition */}
              <div className="relative h-full w-full flex items-center justify-center">
                <div className="absolute top-0 right-10 w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-float" style={{ animationDelay: '0s' }}>
                  <Users size={32} className="text-blue-500" />
                </div>
                <div className="absolute bottom-10 left-10 w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-float" style={{ animationDelay: '1.5s' }}>
                  <Target size={28} className="text-orange-500" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center border border-gray-50 z-10 animate-float" style={{ animationDelay: '0.3s' }}>
                  <div className="text-5xl font-black text-gray-900 mb-1">100%</div>
                  <div className="text-xs font-bold text-gray-400 uppercase">{t('home.opportunity')}</div>
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
