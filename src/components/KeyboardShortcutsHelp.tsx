import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Keyboard, Zap } from 'lucide-react';
import { useKeyboardShortcutsHelp } from '@/hooks/useKeyboardShortcuts';

export const KeyboardShortcutsHelp = () => {
  const [open, setOpen] = useState(false);
  const shortcuts = useKeyboardShortcutsHelp();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-smooth"
          title="Keyboard shortcuts"
        >
          <Keyboard className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 animate-fade-in-scale" align="end">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <h4 className="font-medium text-sm">Keyboard Shortcuts</h4>
          </div>
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div 
                key={shortcut.key} 
                className="flex items-center justify-between text-sm animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="text-muted-foreground">{shortcut.description}</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {shortcut.key}
                </Badge>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t text-xs text-muted-foreground">
            Press these shortcuts from anywhere on the page
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};