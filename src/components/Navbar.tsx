import { Github, Sun, Moon, Table2, HelpCircle, Keyboard, Settings, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WasmStatusIndicator } from './WasmStatusIndicator';
import { HelpModal } from './HelpModal';
import { SettingsModal } from './SettingsModal';
import { wasmInference } from '@/lib/wasmInterface';
import { useIsMobile } from '@/hooks/use-mobile';

export const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [helpModalOpen, setHelpModalOpen] = useState(false);
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
    <nav className="border-b border-border bg-background sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-xs sm:text-sm">λ</span>
            </div>
            <h1 className="text-xs sm:text-lg font-semibold min-w-0">
              <button
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.search = '';
                  window.history.pushState({}, '', url.toString());
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="hover:text-primary transition-colors block text-left"
              >
                <span className="sm:hidden leading-tight">Type Inference<br />Playground</span>
                <span className="hidden sm:inline">Type Inference Playground</span>
              </button>
            </h1>
          </div>
          
          {/* Navigation Items */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Compare Mode - Always visible with text on desktop */}
            <Button
              variant="outline"
              onClick={toggleCompareMode}
              className="btn-interactive"
              size={isMobile ? "sm" : "default"}
            >
              <Table2 className="w-4 h-4 sm:mr-2" />
              {!isMobile && <span>Compare</span>}
            </Button>

            {/* Help & Shortcuts Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="btn-interactive"
                  size={isMobile ? "sm" : "default"}
                >
                  <HelpCircle className="w-4 h-4 sm:mr-2" />
                  {!isMobile && <span>Help</span>}
                  <ChevronDown className="w-3 h-3 ml-1 sm:ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setHelpModalOpen(true)}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Quick Reference
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    // Trigger keyboard shortcuts help - we'll need to create a function for this
                    const event = new KeyboardEvent('keydown', { key: '?' });
                    document.dispatchEvent(event);
                  }}
                >
                  <Keyboard className="w-4 h-4 mr-2" />
                  Keyboard Shortcuts
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="btn-interactive relative"
              size={isMobile ? "sm" : "default"}
            >
              <Sun className="h-4 w-4 sm:mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 sm:mr-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              {!isMobile && <span className="dark:pl-6 pl-0">Theme</span>}
            </Button>

            {/* More Options Dropdown (GitHub + Settings) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="btn-interactive"
                  size={isMobile ? "sm" : "default"}
                >
                  <Settings className="w-4 h-4 sm:mr-2" />
                  {!isMobile && <span>More</span>}
                  <ChevronDown className="w-3 h-3 ml-1 sm:ml-2" />
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
      
      <HelpModal open={helpModalOpen} onOpenChange={setHelpModalOpen} />
      <SettingsModal 
        open={settingsModalOpen} 
        onOpenChange={setSettingsModalOpen}
        onWasmUrlChange={handleWasmUrlChange} 
      />
    </nav>
  );
};