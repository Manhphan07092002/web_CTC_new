import { useCallback, useEffect, useState } from 'react';

export const useInView = (threshold = 0.1, triggerOnce = true) => {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  // A callback ref also runs when an element appears after the first render.
  // This matters for async sections that initially return null while loading.
  const ref = useCallback((node: HTMLElement | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
      } else if (!triggerOnce) {
        setIsInView(false);
      }
    }, { threshold });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element, threshold, triggerOnce]);

  return { ref, isInView };
};
