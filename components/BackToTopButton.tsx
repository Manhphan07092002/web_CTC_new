
import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-3 z-40 rounded-full border border-gray-200 bg-white/80 p-2.5 text-corporate shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-primary hover:text-white group sm:bottom-24 sm:right-6 sm:p-3"
          title="Lên đầu trang"
        >
          <ArrowUp size={18} className="group-hover:animate-bounce sm:h-5 sm:w-5" />
        </button>
      )}
    </>
  );
};

export default BackToTopButton;
