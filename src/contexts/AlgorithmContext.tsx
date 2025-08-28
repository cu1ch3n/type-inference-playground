import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TypeInferenceAlgorithm } from '@/types/inference';
import { wasmInference } from '@/lib/wasmInterface';

interface AlgorithmContextType {
  algorithms: TypeInferenceAlgorithm[];
  loading: boolean;
  error: string | null;
  refreshAlgorithms: () => Promise<void>;
}

const AlgorithmContext = createContext<AlgorithmContextType | null>(null);

export const useAlgorithms = () => {
  const context = useContext(AlgorithmContext);
  if (!context) {
    throw new Error('useAlgorithms must be used within an AlgorithmProvider');
  }
  return context;
};

interface AlgorithmProviderProps {
  children: ReactNode;
}

export const AlgorithmProvider = ({ children }: AlgorithmProviderProps) => {
  const [algorithms, setAlgorithms] = useState<TypeInferenceAlgorithm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlgorithms = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('AlgorithmContext: Starting to fetch algorithms...');
      
      // Add small delay to ensure WASM is ready in iframe environment
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const metadata = await wasmInference.getMetadata();
      console.log('AlgorithmContext: Fetched algorithms:', metadata);
      setAlgorithms(metadata || []);
    } catch (err) {
      console.error('AlgorithmContext: Failed to fetch algorithms:', err);
      setError(err instanceof Error ? err.message : 'Failed to load algorithms from WASM');
      setAlgorithms([]);
    } finally {
      setLoading(false);
      console.log('AlgorithmContext: Fetch complete');
    }
  };

  useEffect(() => {
    fetchAlgorithms();
  }, []);

  const refreshAlgorithms = async () => {
    await fetchAlgorithms();
  };

  const value: AlgorithmContextType = {
    algorithms,
    loading,
    error,
    refreshAlgorithms
  };

  return (
    <AlgorithmContext.Provider value={value}>
      {children}
    </AlgorithmContext.Provider>
  );
};