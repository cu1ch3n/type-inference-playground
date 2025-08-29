import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Clock, ArrowRight, X } from 'lucide-react';

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

  const clearHistory = () => {
    setHistory([]);
  };

  const removeEntry = (id: string) => {
    setHistory(prev => prev.filter(entry => entry.id !== id));
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="animate-fade-in bg-card/50 border-border/50">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <History className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Recent Expressions</span>
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              {history.length}
            </Badge>
          </div>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-24">
          <div className="space-y-1">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="group flex items-center justify-between p-2 rounded border border-border/50 hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer"
                onClick={() => onSelectExpression(entry.expression)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-foreground truncate flex-1">
                      {entry.expression}
                    </code>
                    <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeEntry(entry.id);
                  }}
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-60 hover:opacity-100 transition-all flex-shrink-0 ml-2"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
