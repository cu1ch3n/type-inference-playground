import { useState, useEffect } from 'react';
import { Settings, RotateCcw, Download, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface SettingsModalProps {
  onWasmUrlChange: (url: string) => void;
}

const DEFAULT_WASM_URL = 'https://files.cuichen.cc/bin.wasm';
const STORAGE_KEY = 'wasm-settings';

export const SettingsModal = ({ onWasmUrlChange }: SettingsModalProps) => {
  const [open, setOpen] = useState(false);
  const [wasmUrl, setWasmUrl] = useState(DEFAULT_WASM_URL);
  const [tempUrl, setTempUrl] = useState('');

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      try {
        const { wasmUrl: savedUrl } = JSON.parse(savedSettings);
        if (savedUrl && typeof savedUrl === 'string') {
          setWasmUrl(savedUrl);
          setTempUrl(savedUrl);
          onWasmUrlChange(savedUrl);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, [onWasmUrlChange]);

  // Update tempUrl when dialog opens
  useEffect(() => {
    if (open) {
      setTempUrl(wasmUrl);
    }
  }, [open, wasmUrl]);

  const saveSettings = () => {
    try {
      const settings = { wasmUrl: tempUrl };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setWasmUrl(tempUrl);
      onWasmUrlChange(tempUrl);
      setOpen(false);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const resetToDefault = () => {
    setTempUrl(DEFAULT_WASM_URL);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.wasm')) {
      const url = URL.createObjectURL(file);
      setTempUrl(url);
      toast.success('Local WASM file loaded');
    } else {
      toast.error('Please select a valid .wasm file');
    }
    // Clear the input so the same file can be selected again
    event.target.value = '';
  };

  const isUrlChanged = tempUrl !== wasmUrl;
  const isValidUrl = tempUrl.trim() !== '' && (tempUrl.startsWith('http') || tempUrl.startsWith('blob:'));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="btn-interactive h-7 w-7 sm:h-9 sm:w-9"
        >
          <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wasm-url">WASM Module URL</Label>
              <Input
                id="wasm-url"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="https://example.com/module.wasm"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                URL of the WebAssembly module for type inference
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefault}
                className="flex-1"
              >
                <RotateCcw className="w-3 h-3 mr-2" />
                Reset to Default
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(tempUrl, '_blank')}
                disabled={!isValidUrl}
                className="px-3"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Load Local WASM File</Label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".wasm"
                onChange={handleFileUpload}
                className="hidden"
                id="wasm-file-input"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('wasm-file-input')?.click()}
                className="flex-1"
              >
                <Download className="w-3 h-3 mr-2" />
                Select Local File
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a local .wasm file to use instead of the remote URL
            </p>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Current:</strong> {wasmUrl === DEFAULT_WASM_URL ? 'Default' : 'Custom'}
            </p>
            <p className="text-xs font-mono text-muted-foreground mt-1 break-all">
              {wasmUrl}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={saveSettings}
            disabled={!isValidUrl || !isUrlChanged}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};