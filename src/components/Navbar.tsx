import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Navbar = () => {
  return (
    <nav className="border-b border-border/50 bg-gradient-to-r from-background to-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-material-2 transition-transform hover:scale-110">
              <span className="text-primary-foreground font-bold text-lg">λ</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                <a 
                  href="https://zoo.cuichen.cc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors duration-300 hover:drop-shadow-sm"
                >
                  Type Inference Zoo
                </a>
              </h1>
              <p className="text-xs text-muted-foreground">Interactive type inference playground</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:shadow-material-1"
            onClick={() => window.open('https://github.com/cu1ch3n/type-inference-zoo', '_blank')}
          >
            <Github className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">View Source</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};