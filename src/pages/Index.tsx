import { TypeInferencePlayground } from '@/components/TypeInferencePlayground';
import Compare from './Compare';
import { useEffect, useState } from 'react';

const Index = () => {
  const [isCompareMode, setIsCompareMode] = useState(false);

  useEffect(() => {
    const updateCompareMode = () => {
      const params = new URLSearchParams(window.location.search);
      setIsCompareMode(params.get('compare') === 'true');
    };

    updateCompareMode();

    // Listen for URL changes (back/forward buttons, manual URL changes)
    window.addEventListener('popstate', updateCompareMode);
    
    return () => {
      window.removeEventListener('popstate', updateCompareMode);
    };
  }, []);

  return isCompareMode ? <Compare /> : <TypeInferencePlayground />;
};

export default Index;
