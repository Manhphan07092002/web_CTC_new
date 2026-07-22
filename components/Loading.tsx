
import React from 'react';

interface LoadingProps {
  fullScreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  fullScreen = true,
  className = ''
}) => {
  const containerClasses = fullScreen
    ? "fixed inset-0 bg-[#090d16] z-[9999] flex flex-col items-center justify-center transition-all duration-300 overflow-hidden"
    : `w-full min-h-[400px] bg-transparent flex flex-col items-center justify-center p-8 ${className}`;

  return (
    <div className={containerClasses}>
      {/* Background radial glow */}
      <div className="absolute w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative flex flex-col items-center justify-center z-10 gap-6">
        {/* Glowing Spiral Energy Ring */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Ambient Glow behind SVG */}
          <div className="absolute inset-0 bg-sky-400/20 rounded-full blur-2xl animate-pulse" />

          {/* Layer 1: Fast Spinning Dashed Energy Outer Ring */}
          <svg className="absolute w-full h-full animate-[spin_3s_linear_infinite] drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="url(#cyan-glow-1)"
              strokeWidth="2.5"
              strokeDasharray="8 12 25 15"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="cyan-glow-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
                <stop offset="50%" stopColor="#0284c7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>

          {/* Layer 2: Counter-Spinning Spiral Arc */}
          <svg className="absolute w-32 h-32 animate-[spin_2s_linear_infinite_reverse] drop-shadow-[0_0_18px_rgba(14,165,233,0.9)]" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="url(#cyan-glow-2)"
              strokeWidth="3"
              strokeDasharray="15 30 45 10"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="cyan-glow-2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7dd3fc" stopOpacity="1" />
                <stop offset="70%" stopColor="#0369a1" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Layer 3: High-speed Inner Core Particle Ring */}
          <svg className="absolute w-28 h-28 animate-[spin_1.2s_linear_infinite] drop-shadow-[0_0_10px_rgba(125,211,252,0.9)]" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="34"
              fill="none"
              stroke="#bae6fd"
              strokeWidth="2"
              strokeDasharray="4 16 12 20"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Text and Progress Bar Container */}
        <div className="flex flex-col items-center gap-3 text-center">
          {/* Bold Glowing Loading Text */}
          <span className="text-lg font-extrabold tracking-[0.25em] text-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]">
            Đang tải dữ liệu...
          </span>

          {/* Glowing Progress Bar Line */}
          <div className="w-44 h-[3px] bg-sky-950/80 rounded-full overflow-hidden relative border border-sky-800/30">
            <div className="h-full w-2/3 bg-gradient-to-r from-sky-500 via-sky-300 to-cyan-400 rounded-full shadow-[0_0_12px_#38bdf8] animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;




