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
    <nav className="border-b border-border bg-background">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">λ</span>
            </div>
            <h1 className="text-lg font-semibold">
              <a 
                href="https://zoo.cuichen.cc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Type Inference Zoo
              </a>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 p-0"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Github className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                <DropdownMenuItem 
                  onClick={() => window.open('https://github.com/cu1ch3n/type-inference-zoo-frontend', '_blank')}
                  className="flex items-center gap-3 p-3 cursor-pointer"
                >
                  <Github className="w-4 h-4 text-muted-foreground" />
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">Frontend</span>
                    <span className="text-sm text-muted-foreground font-mono">cu1ch3n/type-inference-zoo-frontend</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => window.open('https://github.com/cu1ch3n/type-inference-zoo-wasm', '_blank')}
                  className="flex items-center gap-3 p-3 cursor-pointer"
                >
                  <Github className="w-4 h-4 text-muted-foreground" />
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">Core</span>
                    <span className="text-sm text-muted-foreground font-mono">cu1ch3n/type-inference-zoo-wasm</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <WasmStatusIndicator />
          </div>
        </div>
      </div>
    </nav>
  );
};