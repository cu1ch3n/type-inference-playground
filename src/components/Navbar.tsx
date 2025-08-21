import { Github, Sun, Moon, GitCompare, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { WasmStatusIndicator } from './WasmStatusIndicator';
import { HelpModal } from './HelpModal';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';

export const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-xs sm:text-sm">λ</span>
            </div>
            <h1 className="text-sm sm:text-lg font-semibold min-w-0">
              <button
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.search = '';
                  window.history.pushState({}, '', url.toString());
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="hover:text-primary transition-colors block truncate text-left"
              >
                Type Inference Zoo
              </button>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const url = new URL(window.location.href);
                    const isCurrentlyCompare = url.searchParams.get('compare') === 'true';
                    
                    if (isCurrentlyCompare) {
                      url.searchParams.delete('compare');
                    } else {
                      url.searchParams.set('compare', 'true');
                    }
                    
                    window.history.pushState({}, '', url.toString());
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="btn-interactive h-8 w-8 sm:h-9 sm:w-9"
                >
                  <GitCompare className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Compare algorithms</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setHelpModalOpen(true)}
                  className="btn-interactive h-8 w-8 sm:h-9 sm:w-9"
                >
                  <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Help & quick reference</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <KeyboardShortcutsHelp />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Keyboard shortcuts</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="relative btn-interactive h-8 w-8 sm:h-9 sm:w-9"
                >
                  <Sun className="h-3 w-3 sm:h-4 sm:w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-3 w-3 sm:h-4 sm:w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle theme</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="btn-interactive h-8 sm:h-9 px-2 sm:px-3">
                  <Github className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 sm:w-96 animate-fade-in-scale">
                <DropdownMenuItem 
                  onClick={() => window.open('https://github.com/cu1ch3n/type-inference-zoo-frontend', '_blank')}
                  className="flex items-center gap-3 p-3 cursor-pointer transition-fast hover:bg-accent/80"
                >
                  <Github className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-medium">Frontend</span>
                    <span className="text-xs sm:text-sm text-muted-foreground font-mono truncate">cu1ch3n/type-inference-zoo-frontend</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => window.open('https://github.com/cu1ch3n/type-inference-zoo-wasm', '_blank')}
                  className="flex items-center gap-3 p-3 cursor-pointer transition-fast hover:bg-accent/80"
                >
                  <Github className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-medium">Core</span>
                    <span className="text-xs sm:text-sm text-muted-foreground font-mono truncate">cu1ch3n/type-inference-zoo-wasm</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="hidden sm:block">
              <WasmStatusIndicator />
            </div>
          </div>
        </div>
        
        {/* Mobile Row 2: WASM indicator (right-aligned) */}
        <div className="sm:hidden mt-2 flex justify-end">
          <WasmStatusIndicator />
        </div>
      </div>
      
      <HelpModal open={helpModalOpen} onOpenChange={setHelpModalOpen} />
    </nav>
  );
};