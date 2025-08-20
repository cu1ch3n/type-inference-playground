import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Trash2, RotateCcw } from 'lucide-react';

interface ExpressionHistoryProps {
  onExpressionSelect: (expression: string) => void;
  currentExpression: string;
}

const HISTORY_KEY = 'expression-history';
const MAX_HISTORY = 20;

export const ExpressionHistory = ({ onExpressionSelect, currentExpression }: ExpressionHistoryProps) => {
  const [history, setHistory] = useState<string[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to parse history:', error);
      }
    }
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const clearHistory = () => {
    setHistory([]);
  };

  const handleExpressionClick = (expression: string) => {
    onExpressionSelect(expression);
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="academic-panel">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5 text-primary" />
            Recent Programs
          </CardTitle>
          <Button
            onClick={clearHistory}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-32">
          <div className="space-y-2">
            {history.map((expression, index) => (
              <button
                key={index}
                onClick={() => handleExpressionClick(expression)}
                className={`
                  w-full text-left p-3 rounded-md border transition-colors duration-200
                  hover:bg-accent hover:border-primary/30
                  ${expression === currentExpression 
                    ? 'bg-accent border-primary/30 text-accent-foreground' 
                    : 'bg-card border-muted-foreground/20'
                  }
                `}
              >
                <code className="text-sm font-code text-foreground">
                  {expression}
                </code>
              </button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// Export a hook to manage history
export const useExpressionHistory = () => {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to parse history:', error);
      }
    }
  }, []);

  const addToHistory = (expression: string) => {
    if (!expression.trim()) return;

    const newHistory = [expression, ...history.filter(item => item !== expression)].slice(0, MAX_HISTORY);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
  };

  return { history, addToHistory, clearHistory };
};