import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Zap, Layers, Mail, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

const NotFound: React.FC = () => {
  const location = useLocation();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Log 404 attempts for security monitoring
  useEffect(() => {
    const logData = {
      timestamp: new Date().toISOString(),
      path: location.pathname,
      search: location.search,
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct',
    };
    console.warn('404 Access Attempt:', logData);

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    const apiUrl = (!port || port === '80' || port === '443')
      ? '/api/security/404'
      : `${protocol}//${hostname}:4000/api/security/404`;

    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    }).catch(() => {});
  }, [location]);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 30,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 30,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const quickLinks = [
    { to: '/', label: 'Trang Chủ', icon: Home, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20' },
    { to: '/products', label: 'Sản Phẩm', icon: Layers, color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20' },
    { to: '/projects', label: 'Dự Án', icon: Zap, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20' },
    { to: '/contact', label: 'Liên Hệ', icon: Mail, color: 'from-orange-500 to-amber-500', bg: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20' },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#060914]"
      style={{ paddingTop: '0', marginTop: '0' }}
    >
      <SEO title="404 — Không tìm thấy trang" description="Trang bạn tìm kiếm không tồn tại" noindex={true} />

      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Glowing orbs */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] pointer-events-none transition-transform duration-700"
        style={{
          background: 'radial-gradient(circle, #6366f1, #8b5cf6)',
          top: '10%', left: '5%',
          transform: `translate(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px)`
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[100px] pointer-events-none transition-transform duration-700"
        style={{
          background: 'radial-gradient(circle, #0ea5e9, #06b6d4)',
          bottom: '5%', right: '5%',
          transform: `translate(${-mousePos.x * 0.4}px, ${-mousePos.y * 0.4}px)`
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full opacity-10 blur-[80px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #f43f5e, #ec4899)',
          top: '60%', left: '60%',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 py-20 max-w-4xl mx-auto w-full">

        {/* 404 Huge Number */}
        <div
          className="relative select-none mb-2"
          style={{ transform: `translate(${mousePos.x * 0.1}px, ${mousePos.y * 0.1}px)`, transition: 'transform 0.3s ease-out' }}
        >
          {/* Shadow/ghost layer */}
          <div
            className="absolute inset-0 text-[220px] md:text-[320px] font-black leading-none text-center pointer-events-none"
            style={{
              WebkitTextStroke: '2px rgba(99,102,241,0.15)',
              color: 'transparent',
              filter: 'blur(1px)',
              transform: 'translate(6px, 6px)',
              fontFamily: '"Inter", system-ui, sans-serif',
              letterSpacing: '-0.05em',
            }}
          >
            404
          </div>
          {/* Main text */}
          <h1
            className="text-[220px] md:text-[320px] font-black leading-none"
            style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              letterSpacing: '-0.05em',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 30%, #0ea5e9 65%, #6366f1 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradientShift 4s ease infinite',
            }}
          >
            404
          </h1>
        </div>

        {/* Glowing divider line */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-indigo-500/50" />
          <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/50 animate-pulse" />
          <div className="w-3 h-3 rounded-full bg-violet-400 shadow-lg shadow-violet-400/50" />
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-pulse" />
          <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-cyan-500/50" />
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Trang không{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            tồn tại
          </span>
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-2 leading-relaxed">
          Trang bạn đang tìm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
        </p>
        <p className="text-gray-600 text-sm mb-10 font-mono">
          <span className="text-indigo-400/70">→</span>{' '}
          <span className="text-gray-500">{location.pathname}</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white text-base transition-all duration-300 relative overflow-hidden shadow-xl"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Home size={20} className="group-hover:scale-110 transition-transform" />
            Về Trang Chủ
            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/contact"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white text-base transition-all duration-300 border border-white/10 hover:border-indigo-500/50 bg-white/5 hover:bg-white/10 backdrop-blur-sm"
          >
            <Mail size={20} className="group-hover:scale-110 transition-transform text-indigo-400" />
            Liên Hệ Hỗ Trợ
          </Link>
        </div>

        {/* Quick Links Grid */}
        <div className="border border-white/5 rounded-3xl p-6 md:p-8 bg-white/[0.02] backdrop-blur-sm max-w-2xl mx-auto">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-5">Có thể bạn đang tìm</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickLinks.map(({ to, label, icon: Icon, color, bg }) => (
              <Link
                key={to}
                to={to}
                className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${bg}`}
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon size={20} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Gradient animation keyframe */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
