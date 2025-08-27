import { useState, useEffect } from 'react';
import { Settings, RotateCcw, Upload, FileCode } from 'lucide-react';
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWasmUrlChange: (url: string) => void;
}

const DEFAULT_WASM_URL = 'https://files.cuichen.cc/bin.wasm';
const STORAGE_KEY = 'wasm-settings';

export const SettingsModal = ({ open, onOpenChange, onWasmUrlChange }: SettingsModalProps) => {
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
      onOpenChange(false);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const resetToDefault = () => {
    setTempUrl(DEFAULT_WASM_URL);
  };

  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.name.endsWith('.wasm')) {
      const url = URL.createObjectURL(file);
      setTempUrl(url);
      toast.success('Local WASM file loaded');
    } else {
      toast.error('Please select a valid .wasm file');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Clear the input so the same file can be selected again
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const isUrlChanged = tempUrl !== wasmUrl;
  const isValidUrl = tempUrl.trim() !== '' && (tempUrl.startsWith('http') || tempUrl.startsWith('blob:'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>WASM Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wasm-url">WASM Module URL</Label>
              <div className="relative">
                <Input
                  id="wasm-url"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://example.com/module.wasm"
                  className="font-mono text-sm pr-8"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetToDefault}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-muted"
                  title="Reset to default"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                URL of the WebAssembly module for type inference
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Load Local WASM File</Label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                isDragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('wasm-file-input')?.click()}
            >
              <input
                type="file"
                accept=".wasm"
                onChange={handleFileUpload}
                className="hidden"
                id="wasm-file-input"
              />
              <div className="space-y-2">
                <div className="flex justify-center">
                  {isDragOver ? (
                    <Upload className="w-8 h-8 text-primary" />
                  ) : (
                    <FileCode className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {isDragOver ? 'Drop WASM file here' : 'Drop WASM file or click to browse'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports .wasm files only
                  </p>
                </div>
              </div>
            </div>
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
            onClick={() => onOpenChange(false)}
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