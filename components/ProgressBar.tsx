import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const ProgressBar: React.FC = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Start progress bar animation on location change
    setVisible(true);
    setProgress(30);

    const timer1 = setTimeout(() => {
      setProgress(75);
    }, 100);

    const timer2 = setTimeout(() => {
      setProgress(100);
    }, 250);

    const timer3 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname, location.search]);

  if (!visible && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-transparent overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-amber-400 transition-all duration-300 ease-out shadow-[0_0_10px_#38bdf8]"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0
        }}
      />
    </div>
  );
};

export default ProgressBar;
