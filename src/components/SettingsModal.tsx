import { useState, useEffect } from 'react';
import { Settings, RotateCcw, Upload, FileCode, Plus, X, Eye, EyeOff, Trash2 } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

interface WasmSource {
  id: string;
  name: string;
  url: string;
  authType?: 'none' | 'bearer' | 'header' | 'presigned';
  authToken?: string;
  authHeader?: string;
  isLocal?: boolean;
  createdAt: number;
}

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWasmUrlChange: (url: string) => void;
}

const DEFAULT_WASM_URL = 'https://files.cuichen.cc/bin.wasm';
const STORAGE_KEY = 'wasm-sources';

const createDefaultSource = (): WasmSource => ({
  id: 'default',
  name: 'Default WASM',
  url: DEFAULT_WASM_URL,
  authType: 'none',
  isLocal: false,
  createdAt: Date.now()
});

export const SettingsModal = ({ open, onOpenChange, onWasmUrlChange }: SettingsModalProps) => {
  const [sources, setSources] = useState<WasmSource[]>([createDefaultSource()]);
  const [selectedSourceId, setSelectedSourceId] = useState('default');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSource, setNewSource] = useState<Partial<WasmSource>>({
    name: '',
    url: '',
    authType: 'none'
  });
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});
  const [isDragOver, setIsDragOver] = useState(false);

  // Load sources from localStorage on mount
  useEffect(() => {
    const savedSources = localStorage.getItem(STORAGE_KEY);
    if (savedSources) {
      try {
        const parsed = JSON.parse(savedSources);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSources(parsed);
          // Find the current source or use the first one
          const currentSource = parsed.find(s => s.url === localStorage.getItem('current-wasm-url')) || parsed[0];
          setSelectedSourceId(currentSource.id);
          onWasmUrlChange(currentSource.url);
        }
      } catch (error) {
        console.error('Failed to load sources:', error);
      }
    }
  }, [onWasmUrlChange]);

  const saveSettings = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
      const selectedSource = sources.find(s => s.id === selectedSourceId);
      if (selectedSource) {
        localStorage.setItem('current-wasm-url', selectedSource.url);
        onWasmUrlChange(selectedSource.url);
        
        // Dispatch custom event to notify AlgorithmContext
        window.dispatchEvent(new CustomEvent('wasmUrlChanged', { 
          detail: { url: selectedSource.url } 
        }));
      }
      onOpenChange(false);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const addNewSource = () => {
    if (!newSource.name || !newSource.url) {
      toast.error('Please provide both name and URL');
      return;
    }
    
    const source: WasmSource = {
      id: Date.now().toString(),
      name: newSource.name,
      url: newSource.url,
      authType: newSource.authType || 'none',
      authToken: newSource.authToken,
      authHeader: newSource.authHeader,
      isLocal: false,
      createdAt: Date.now()
    };
    
    setSources(prev => [...prev, source]);
    setSelectedSourceId(source.id);
    setIsAddingNew(false);
    setNewSource({ name: '', url: '', authType: 'none' });
    toast.success('WASM source added');
  };

  const deleteSource = (id: string) => {
    if (id === 'default') {
      toast.error('Cannot delete default source');
      return;
    }
    
    setSources(prev => prev.filter(s => s.id !== id));
    if (selectedSourceId === id) {
      setSelectedSourceId('default');
    }
    toast.success('WASM source deleted');
  };

  const clearAllSources = () => {
    setSources([createDefaultSource()]);
    setSelectedSourceId('default');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('current-wasm-url');
    toast.success('All sources cleared');
  };

  const handleFile = (file: File) => {
    if (file && file.name.endsWith('.wasm')) {
      const url = URL.createObjectURL(file);
      const source: WasmSource = {
        id: Date.now().toString(),
        name: file.name,
        url,
        authType: 'none',
        isLocal: true,
        createdAt: Date.now()
      };
      setSources(prev => [...prev, source]);
      setSelectedSourceId(source.id);
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

  const selectedSource = sources.find(s => s.id === selectedSourceId);
  const hasChanges = selectedSourceId !== sources.find(s => s.url === localStorage.getItem('current-wasm-url'))?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>WASM Sources</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Current Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Select WASM Source</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingNew(!isAddingNew)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add New
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearAllSources}
                  disabled={sources.length <= 1}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
            
            <RadioGroup value={selectedSourceId} onValueChange={setSelectedSourceId}>
              {sources.map((source) => (
                <div key={source.id} className="flex items-start gap-3 p-3 border rounded-lg overflow-hidden">
                  <RadioGroupItem value={source.id} id={source.id} className="mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <Label htmlFor={source.id} className="font-medium cursor-pointer block">
                      {source.name} {source.isLocal && '(Local)'}
                    </Label>
                    <div className="text-xs text-muted-foreground font-mono mt-1 overflow-hidden">
                      <div className="break-all line-clamp-2 max-w-full">
                        {source.url}
                      </div>
                    </div>
                    {source.authType !== 'none' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Auth: {source.authType}
                      </p>
                    )}
                  </div>
                  {source.id !== 'default' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSource(source.id)}
                      className="text-destructive hover:text-destructive flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Add New Source Form */}
          {isAddingNew && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium">Add New WASM Source</h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-name">Name</Label>
                  <Input
                    id="new-name"
                    value={newSource.name || ''}
                    onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My WASM Module"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-auth">Authentication</Label>
                  <select
                    id="new-auth"
                    value={newSource.authType || 'none'}
                    onChange={(e) => setNewSource(prev => ({ ...prev, authType: e.target.value as any }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="none">None</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="header">Custom Header</option>
                    <option value="presigned">Pre-signed URL</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-url">URL</Label>
                <Input
                  id="new-url"
                  value={newSource.url || ''}
                  onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://your-domain.com/module.wasm"
                  className="font-mono"
                />
              </div>

              {newSource.authType === 'bearer' && (
                <div className="space-y-2">
                  <Label htmlFor="new-token">Bearer Token</Label>
                  <div className="relative">
                    <Input
                      id="new-token"
                      type={showTokens.new ? 'text' : 'password'}
                      value={newSource.authToken || ''}
                      onChange={(e) => setNewSource(prev => ({ ...prev, authToken: e.target.value }))}
                      placeholder="your-bearer-token"
                      className="font-mono pr-8"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTokens(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                    >
                      {showTokens.new ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              )}

              {newSource.authType === 'header' && (
                <div className="space-y-2">
                  <Label htmlFor="new-header">Authorization Header</Label>
                  <Input
                    id="new-header"
                    value={newSource.authHeader || ''}
                    onChange={(e) => setNewSource(prev => ({ ...prev, authHeader: e.target.value }))}
                    placeholder="X-API-Key: your-api-key"
                    className="font-mono"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={addNewSource} size="sm">
                  Add Source
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingNew(false)}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* File Upload */}
          <div className="space-y-3">
            <Label>Upload Local WASM File</Label>
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

          {/* Current Status */}
          {selectedSource && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Selected:</strong> {selectedSource.name}
              </p>
              <p className="text-xs font-mono text-muted-foreground mt-1 break-all">
                {selectedSource.url}
              </p>
              {selectedSource.authType !== 'none' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Authentication: {selectedSource.authType}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={saveSettings}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};