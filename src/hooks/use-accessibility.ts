import { useEffect, useState, useCallback } from 'react';

export function useKeyboardNavigation() {
  const [isTabbing, setIsTabbing] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsTabbing(true);
      }
    };

    const handleMouseDown = () => {
      setIsTabbing(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return { isTabbing };
}

export function useScreenReader() {
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);

  useEffect(() => {
    // Detect if screen reader is likely active
    const checkScreenReader = () => {
      // Check for common screen reader indicators
      const hasScreenReaderClass = document.body.classList.contains('screen-reader-active');
      const hasAriaLive = document.querySelector('[aria-live]') !== null;
      const hasScreenReaderText = document.querySelector('.sr-only') !== null;
      
      setIsScreenReaderActive(hasScreenReaderClass || hasAriaLive || hasScreenReaderText);
    };

    checkScreenReader();
    
    // Listen for changes that might indicate screen reader usage
    const observer = new MutationObserver(checkScreenReader);
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);

  return { isScreenReaderActive };
}

export function useFocusManagement() {
  const trapFocus = useCallback((element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
      
      if (event.key === 'Escape') {
        element.blur();
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    
    // Focus the first element
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const restoreFocus = useCallback((previousElement?: HTMLElement) => {
    if (previousElement && document.contains(previousElement)) {
      previousElement.focus();
    }
  }, []);

  return { trapFocus, restoreFocus };
}

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { prefersReducedMotion };
}

export function useAnnouncement() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return { announce };
}