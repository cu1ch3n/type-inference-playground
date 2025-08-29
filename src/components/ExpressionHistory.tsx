import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';

interface ExpressionHistoryProps {
  currentExpression: string;
  onSelectExpression: (expression: string) => void;
}

interface HistoryEntry {
  expression: string;
  timestamp: number;
  id: string;
}

export const ExpressionHistory = ({ currentExpression, onSelectExpression }: ExpressionHistoryProps) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('expression-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
      } catch (error) {
        console.error('Error loading expression history:', error);
      }
    }
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    localStorage.setItem('expression-history', JSON.stringify(history));
  }, [history]);

  // Add current expression to history when it changes (and is not empty)
  useEffect(() => {
    if (currentExpression.trim()) {
      const trimmedExpression = currentExpression.trim();
      
      // Don't add if it's the same as the last entry
      if (history.length > 0 && history[0].expression === trimmedExpression) {
        return;
      }

      const newEntry: HistoryEntry = {
        expression: trimmedExpression,
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9)
      };

      setHistory(prev => {
        // Remove duplicates and add to front
        const filtered = prev.filter(entry => entry.expression !== trimmedExpression);
        const newHistory = [newEntry, ...filtered];
        
        // Keep only last 10 entries
        return newHistory.slice(0, 10);
      });
    }
  }, [currentExpression, history]);

  const removeEntry = (id: string) => {
    setHistory(prev => prev.filter(entry => entry.id !== id));
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
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
  );
};
