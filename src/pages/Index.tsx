import { TypeInferencePlayground } from '@/components/TypeInferencePlayground';
import Compare from './Compare';
import { useLocation } from 'react-router-dom';

const Index = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isCompareMode = params.get('compare') === 'true';

  return isCompareMode ? <Compare /> : <TypeInferencePlayground />;
};

export default Index;
