import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WasmStatusIndicator } from './WasmStatusIndicator';

export const Navbar = () => {
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
              onClick={() => window.open('https://github.com/cu1ch3n/type-inference-zoo', '_blank')}
            >
              <Github className="w-4 h-4" />
            </Button>
            <WasmStatusIndicator />
          </div>
        </div>
      </div>
    </nav>
  );
};