import { Github, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WasmStatusIndicator } from './WasmStatusIndicator';

export const Navbar = () => {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-xs sm:text-sm">λ</span>
            </div>
            <h1 className="text-sm sm:text-lg font-semibold min-w-0">
              <a 
                href="https://zoo.cuichen.cc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors block truncate"
              >
                Type Inference Zoo
              </a>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative btn-interactive h-8 w-8 sm:h-9 sm:w-9 hidden sm:flex"
            >
              <Sun className="h-3 w-3 sm:h-4 sm:w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-3 w-3 sm:h-4 sm:w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="btn-interactive h-8 sm:h-9 px-2 sm:px-3">
                  <Github className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 sm:w-80 animate-fade-in-scale">
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
        
        {/* Mobile second row - Theme switcher and WASM status */}
        <div className="sm:hidden mt-2 flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative btn-interactive h-8 w-8"
          >
            <Sun className="h-3 w-3 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-3 w-3 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <WasmStatusIndicator />
        </div>
      </div>
    </nav>
  );
};