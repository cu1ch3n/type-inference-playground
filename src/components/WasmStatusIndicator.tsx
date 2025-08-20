import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { wasmInference } from '@/lib/wasmInterface';

type WasmStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export const WasmStatusIndicator = () => {
  const [status, setStatus] = useState<WasmStatus>('disconnected');

  useEffect(() => {
    const checkWasmStatus = async () => {
      setStatus('connecting');
      try {
        const isConnected = await wasmInference.initialize();
        setStatus(isConnected ? 'connected' : 'error');
      } catch (error) {
        setStatus('error');
      }
    };

    checkWasmStatus();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'WASM Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'WASM Unavailable';
      default: return 'WASM Disconnected';
    }
  };

  return (
    <Badge variant="outline" className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-xs">{getStatusText()}</span>
    </Badge>
  );
};