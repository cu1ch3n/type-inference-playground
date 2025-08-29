import { Github, Table2, Settings, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WasmStatusIndicator } from './WasmStatusIndicator';

import { SettingsModal } from './SettingsModal';
import { wasmInference } from '@/lib/wasmInterface';
import { useIsMobile } from '@/hooks/use-mobile';

export const Navbar = () => {

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleWasmUrlChange = (url: string) => {
    // Update WASM URL and reset module - using type assertion for now
    (wasmInference as any).updateWasmUrl(url);
  };

  const toggleCompareMode = () => {
    const url = new URL(window.location.href);
    const isCurrentlyCompare = url.searchParams.get('compare') === 'true';
    
    if (isCurrentlyCompare) {
      url.searchParams.delete('compare');
    } else {
      url.searchParams.set('compare', 'true');
    }
    
    window.history.pushState({}, '', url.toString());
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur-sm flex-shrink-0">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo and Title - Left aligned */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-xs">λ</span>
            </div>
            <h1 className="text-base font-semibold min-w-0">
              <button
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.search = '';
                  window.history.pushState({}, '', url.toString());
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="hover:text-primary transition-colors block text-left"
              >
                Type Inference Playground
              </button>
            </h1>
          </div>
          
          {/* Navigation Items - Right aligned */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Compare Mode */}
            <Button
              variant="outline"
              onClick={toggleCompareMode}
              className="btn-interactive"
              size="sm"
            >
              <Table2 className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline text-xs">Compare</span>
            </Button>



            {/* Theme Toggle */}
            <ThemeToggle />

            {/* More Options Dropdown (GitHub + Settings) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="btn-interactive"
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline text-xs">More</span>
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setSettingsModalOpen(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  WASM Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => window.open('https://github.com/cu1ch3n/type-inference-zoo-frontend', '_blank')}
                >
                  <Github className="w-4 h-4 mr-2" />
                  Frontend Repository
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => window.open('https://github.com/cu1ch3n/type-inference-zoo-wasm', '_blank')}
                >
                  <Github className="w-4 h-4 mr-2" />
                  Core Repository
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* WASM Status - Always visible */}
            <WasmStatusIndicator onClick={() => setSettingsModalOpen(true)} />
          </div>
        </div>
      </div>

      <SettingsModal 
        open={settingsModalOpen} 
        onOpenChange={setSettingsModalOpen}
        onWasmUrlChange={handleWasmUrlChange} 
      />
    </nav>
  );
};