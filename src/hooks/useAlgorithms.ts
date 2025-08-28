import { useState, useEffect } from 'react';
import { TypeInferenceAlgorithm } from '@/types/inference';
import { wasmInference } from '@/lib/wasmInterface';

export const useAlgorithms = () => {
  const [algorithms, setAlgorithms] = useState<TypeInferenceAlgorithm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlgorithms = async () => {
      try {
        setLoading(true);
        setError(null);
        const metadata = await wasmInference.getMetadata();
        setAlgorithms(metadata);
      } catch (err) {
        console.error('Failed to fetch algorithms:', err);
        setError('Failed to load algorithms from WASM');
        // Fallback to empty array
        setAlgorithms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlgorithms();
  }, []);

  const refreshAlgorithms = async () => {
    try {
      setLoading(true);
      setError(null);
      const metadata = await wasmInference.getMetadata();
      setAlgorithms(metadata);
    } catch (err) {
      console.error('Failed to refresh algorithms:', err);
      setError('Failed to refresh algorithms');
    } finally {
      setLoading(false);
    }
  };

  return {
    algorithms,
    loading,
    error,
    refreshAlgorithms
  };
};