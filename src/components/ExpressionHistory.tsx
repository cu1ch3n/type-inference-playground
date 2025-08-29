import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Trash2, X } from 'lucide-react';

interface ExpressionHistoryProps {
  onSelectExpression: (expression: string) => void;
  onAddToHistory?: (addFunction: (expression: string) => void) => void;
}

interface HistoryEntry {
  expression: string;
  timestamp: number;
  id: string;
}

export const ExpressionHistory = ({ onSelectExpression, onAddToHistory }: ExpressionHistoryProps) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  console.log('ExpressionHistory component initialized, onAddToHistory:', !!onAddToHistory);

  // Load history from localStorage on mount
  useEffect(() => {
    console.log('Loading history from localStorage...');
    const savedHistory = localStorage.getItem('expression-history');
    console.log('Saved history raw:', savedHistory);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        console.log('Parsed history:', parsed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
        }
      } catch (error) {
        console.error('Error loading expression history:', error);
      }
    }
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    if (history.length > 0) {
      console.log('Saving history to localStorage:', history);
      localStorage.setItem('expression-history', JSON.stringify(history));
    }
  }, [history]);

  // Provide addToHistory function to parent
  useEffect(() => {
    const addToHistory = (expression: string) => {
      console.log('addToHistory called with:', expression);
      if (expression && expression.trim()) {
        const trimmedExpression = expression.trim();
        
        // Don't add if it's the same as the last entry
        if (history.length > 0 && history[0].expression === trimmedExpression) {
          console.log('Skipping duplicate entry');
          return;
        }

        const newEntry: HistoryEntry = {
          expression: trimmedExpression,
          timestamp: Date.now(),
          id: Math.random().toString(36).substr(2, 9)
        };

        console.log('Adding new entry:', newEntry);
        setHistory(prev => {
          // Remove duplicates and add to front
          const filtered = prev.filter(entry => entry.expression !== trimmedExpression);
          const newHistory = [newEntry, ...filtered];
          
          // Keep only last 10 entries
          return newHistory.slice(0, 10);
        });
      }
    };

    if (onAddToHistory) {
      console.log('Setting addToHistory function');
      onAddToHistory(addToHistory);
    }
  }, [onAddToHistory, history]);

  const clearHistory = () => {
    console.log('Clearing history');
    setHistory([]);
    localStorage.removeItem('expression-history');
  };

  const removeEntry = (id: string) => {
    console.log('Removing entry:', id);
    setHistory(prev => prev.filter(entry => entry.id !== id));
  };

  console.log('ExpressionHistory render - history length:', history.length);

  // Always render the component so useEffect can run, but conditionally show content
  return (
    <div style={{ display: history.length === 0 ? 'none' : 'block' }}>
      <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Recent</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          className="h-5 w-5 p-0 opacity-60 hover:opacity-100"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      
      <ScrollArea className="h-20">
        <div className="space-y-1 pr-2">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="group flex items-center justify-between px-2 py-1 rounded border border-border/30 hover:border-primary/50 hover:bg-accent/20 transition-all cursor-pointer text-xs"
              onClick={() => onSelectExpression(entry.expression)}
            >
              <code className="font-mono text-foreground truncate flex-1 pr-2">
                {entry.expression}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeEntry(entry.id);
                }}
                className="h-4 w-4 p-0 opacity-0 group-hover:opacity-60 hover:opacity-100 transition-all flex-shrink-0"
              >
                <X className="w-2.5 h-2.5" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
      </div>
    </div>
  );
};
