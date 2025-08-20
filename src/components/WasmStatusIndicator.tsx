import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="flex items-center gap-2 cursor-help">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span className="text-xs">{getStatusText()}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">WASM Module</span>
            <span className="text-xs text-muted-foreground font-mono break-all">
              {wasmInference.getWasmUrl()}
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};