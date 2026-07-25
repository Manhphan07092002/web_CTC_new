import React from 'react';
import { Check } from 'lucide-react';

const STEPS = ['Giỏ hàng', 'Thông tin', 'Xác nhận'];

interface ProgressStepperProps {
  step: number;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ step }) => (
  <div className="flex items-center justify-center mb-8 select-none">
    {STEPS.map((label, i) => {
      const done = i < step;
      const active = i === step;
      return (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
              done
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : active
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-110'
                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400'
            }`}>
              {done ? <Check size={16} strokeWidth={3} /> : i + 1}
            </div>
            <span className={`text-[11px] font-bold tracking-wide uppercase ${
              active ? 'text-primary' : done ? 'text-emerald-500' : 'text-gray-400'
            }`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all duration-500 ${
              done ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-slate-700'
            }`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);
