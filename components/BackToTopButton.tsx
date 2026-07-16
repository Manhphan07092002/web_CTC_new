
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
          className="fixed bottom-24 right-6 z-40 p-3 bg-white/80 backdrop-blur text-corporate border border-gray-200 rounded-full shadow-lg hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 transform hover:-translate-y-1 group"
          title="Lên đầu trang"
        >
          <ArrowUp size={20} className="group-hover:animate-bounce" />
        </button>
      )}
    </>
  );
};

export default BackToTopButton;
