import { useState, useCallback } from 'react';

interface WasmSource {
  id: string;
  name: string;
  url: string;
  authType?: 'none' | 'bearer' | 'basic' | 'header' | 'presigned';
  authToken?: string;
  authHeader?: string;
  authUsername?: string;
  authPassword?: string;
  isLocal?: boolean;
  createdAt: number;
}

export const useWasmLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWasmWithAuth = useCallback(async (source: WasmSource): Promise<ArrayBuffer> => {
    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/wasm',
      };

      // Add authentication headers based on auth type
      switch (source.authType) {
        case 'bearer':
          if (source.authToken) {
            headers['Authorization'] = `Bearer ${source.authToken}`;
          }
          break;
        case 'basic':
          if (source.authUsername && source.authPassword) {
            const credentials = btoa(`${source.authUsername}:${source.authPassword}`);
            headers['Authorization'] = `Basic ${credentials}`;
          }
          break;
        case 'header':
          if (source.authHeader) {
            const [key, value] = source.authHeader.split(': ', 2);
            if (key && value) {
              headers[key.trim()] = value.trim();
            }
          }
          break;
        case 'presigned':
          // For pre-signed URLs, no additional headers needed
          break;
        default:
          // No authentication
          break;
      }

      console.log(`Loading WASM from: ${source.name} (${source.url})`);
      
      const response = await fetch(source.url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit', // Don't send cookies for CORS
        cache: 'default',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to load WASM: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log(`WASM loaded successfully: ${arrayBuffer.byteLength} bytes`);
      
      return arrayBuffer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error loading WASM';
      setError(errorMessage);
      console.error('WASM loading error:', errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    loadWasmWithAuth,
    isLoading,
    error,
  };
};