import { useState, useEffect, useRef } from 'react';

export function useUnsavedChanges<T>(formData: T, isSubmitting: boolean = false) {
  const [initialData, setInitialData] = useState<string>('');
  const [showUnsavedModal, setShowUnsavedModal] = useState<boolean>(false);
  const isDirtyRef = useRef(false);

  // Set or reset the baseline clean state
  const setBaseline = (data: T) => {
    const json = JSON.stringify(data);
    setInitialData(json);
    isDirtyRef.current = false;
  };

  const isDirty = Boolean(initialData && JSON.stringify(formData) !== initialData);
  isDirtyRef.current = isDirty;

  // Warn user when closing browser tab or refreshing page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current && !isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSubmitting]);

  return {
    isDirty,
    showUnsavedModal,
    setShowUnsavedModal,
    setBaseline,
    confirmNavigation: (onNavigate: () => void) => {
      if (isDirty && !isSubmitting) {
        setShowUnsavedModal(true);
        return false;
      }
      onNavigate();
      return true;
    }
  };
}
