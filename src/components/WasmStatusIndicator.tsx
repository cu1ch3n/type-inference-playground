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
      case 'connected': return 'WASM Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'WASM Unavailable';
      default: return 'WASM Disconnected';
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={`inline-flex transition-colors ${
            onClick ? 'hover:bg-accent/50 cursor-pointer rounded-md p-1' : 'cursor-default'
          }`}
        >
          <Badge variant="outline" className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span className="text-xs">{getStatusText()}</span>
          </Badge>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-mono text-xs">{wasmInference.getWasmUrl()}</p>
      </TooltipContent>
    </Tooltip>
  );
};