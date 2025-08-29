import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { wasmInference } from '@/lib/wasmInterface';

type WasmStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface WasmStatusIndicatorProps {
  onClick?: () => void;
}

export const WasmStatusIndicator = ({ onClick }: WasmStatusIndicatorProps) => {
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
      case 'connected': return 'WASM';
      case 'connecting': return 'WASM';
      case 'error': return 'WASM';
      default: return 'WASM';
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={`inline-flex items-center gap-2 px-3 h-7 sm:h-9 rounded-md text-xs font-medium border transition-colors ${
            onClick 
              ? 'hover:bg-accent hover:border-primary/50 cursor-pointer' 
              : 'cursor-default border-border'
          } ${
            status === 'connected' ? 'border-green-500/50 bg-green-500/5 text-green-700 dark:text-green-400' :
            status === 'connecting' ? 'border-yellow-500/50 bg-yellow-500/5 text-yellow-700 dark:text-yellow-400' :
            status === 'error' ? 'border-red-500/50 bg-red-500/5 text-red-700 dark:text-red-400' :
            'border-gray-500/50 bg-gray-500/5 text-gray-700 dark:text-gray-400'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          <span>{getStatusText()}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent className="z-50">
        <div className="space-y-1">
          <p className="font-medium">{
            status === 'connected' ? 'WASM Connected' :
            status === 'connecting' ? 'Connecting...' :
            status === 'error' ? 'WASM Unavailable' :
            'WASM Disconnected'
          }</p>
          <p className="font-mono text-xs opacity-75">{wasmInference.getWasmUrl()}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};