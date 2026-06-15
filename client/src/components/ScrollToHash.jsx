import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToHash component listens to route/hash changes and automatically
 * handles smooth scrolling to anchor targets or scrolls to top on navigation.
 */
const ScrollToHash = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = hash.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        // Small timeout to allow content/component to fully mount and paint
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
        return () => clearTimeout(timer);
      }
    } else {
      // Smooth scroll to top when changing views without a hash
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hash, pathname]);

  return null;
};

export default ScrollToHash;
