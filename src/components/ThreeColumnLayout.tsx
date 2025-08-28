import { forwardRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AlgorithmSelector } from './AlgorithmSelector';
import { ExpressionInput } from './ExpressionInput';
import { AlgorithmResult } from '@/types/inference';
import { cn } from '@/lib/utils';

interface ThreeColumnLayoutProps {
  algorithms: any[];
  selectedAlgorithm: string;
  selectedVariant: string;
  onAlgorithmChange: (algorithmId: string) => void;
  onVariantChange: (variantId: string) => void;
  expression: string;
  onExpressionChange: (expr: string) => void;
  onInfer: () => void;
  isInferring: boolean;
  setResult: (result: AlgorithmResult | undefined) => void;
  expressionInputRef: React.RefObject<HTMLTextAreaElement>;
  children: React.ReactNode; // This will be the main content (derivation + rules)
}

export const ThreeColumnLayout = forwardRef<HTMLDivElement, ThreeColumnLayoutProps>(({
  algorithms,
  selectedAlgorithm,
  selectedVariant,
  onAlgorithmChange,
  onVariantChange,
  expression,
  onExpressionChange,
  onInfer,
  isInferring,
  setResult,
  expressionInputRef,
  children
}, ref) => {
  const [leftColumnCollapsed, setLeftColumnCollapsed] = useState(false);
  const [middleColumnCollapsed, setMiddleColumnCollapsed] = useState(false);

  const getColumnWidth = (position: 'left' | 'middle' | 'right') => {
    if (position === 'left') {
      return leftColumnCollapsed ? 'w-12' : 'w-[30%]';
    }
    if (position === 'middle') {
      return middleColumnCollapsed ? 'w-12' : 'w-[20%]';
    }
    // Right column takes remaining space
    const leftSpace = leftColumnCollapsed ? 3 : 30; // 3rem = w-12
    const middleSpace = middleColumnCollapsed ? 3 : 20;
    const rightSpace = 100 - leftSpace - middleSpace;
    return `w-[${rightSpace}%]`;
  };

  return (
    <div ref={ref} className="flex h-screen w-full bg-background">
      {/* Left Column - Algorithm Selector */}
      <div className={cn(
        "transition-all duration-300 flex-shrink-0 relative",
        getColumnWidth('left'),
        leftColumnCollapsed ? "bg-border/20" : "bg-muted/30"
      )}>
        {/* Separator line with gap for handle */}
        {!leftColumnCollapsed && (
          <div className="absolute right-0 top-0 bottom-0 w-px bg-border">
            {/* Gap in separator for handle */}
            <div className="absolute top-4 w-px h-12 bg-background" />
          </div>
        )}
        
        {!leftColumnCollapsed && (
          <div className="h-full p-4 overflow-y-auto">
            <div className="h-full">
              <AlgorithmSelector
                algorithms={algorithms}
                selectedAlgorithm={selectedAlgorithm}
                selectedVariant={selectedVariant}
                onAlgorithmChange={onAlgorithmChange}
                onVariantChange={onVariantChange}
              />
            </div>
          </div>
        )}
        
        {/* Toggle Handle - To the RIGHT of separator */}
        <div
          className="absolute left-0 top-4 w-3 h-12 bg-background border-t border-r border-b border-border rounded-r-md shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 hover:w-4 z-20"
          onClick={() => setLeftColumnCollapsed(!leftColumnCollapsed)}
        />
      </div>

      {/* Middle Column - Expression Input */}
      <div className={cn(
        "transition-all duration-300 flex-shrink-0 relative",
        getColumnWidth('middle'),
        middleColumnCollapsed ? "bg-border/20" : "bg-muted/20"
      )}>
        {/* Separator line with gap for handle */}
        {!middleColumnCollapsed && (
          <div className="absolute right-0 top-0 bottom-0 w-px bg-border">
            {/* Gap in separator for handle */}
            <div className="absolute top-16 w-px h-12 bg-background" />
          </div>
        )}
        
        {!middleColumnCollapsed && (
          <div className="h-full p-4 overflow-y-auto">
            <div className="space-y-4 h-full flex flex-col">
              <ExpressionInput
                ref={expressionInputRef}
                expression={expression}
                onExpressionChange={(expr) => {
                  onExpressionChange(expr);
                  if (!expr.trim()) {
                    setResult(undefined);
                  }
                }}
                onInfer={onInfer}
                isInferring={isInferring}
                selectedAlgorithm={selectedAlgorithm}
                algorithms={algorithms}
                selectedVariant={selectedVariant}
              />
              
              {/* History Input */}
              <div className="flex-1 bg-card border border-border rounded-lg p-3">
                <h3 className="text-sm font-medium mb-2">Expression History</h3>
                <div className="space-y-1 text-xs">
                  <div className="text-muted-foreground">Recent expressions will appear here</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Toggle Handle - To the RIGHT of separator */}
        <div
          className="absolute left-0 top-16 w-3 h-12 bg-background border-t border-r border-b border-border rounded-r-md shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 hover:w-4 z-10"
          onClick={() => setMiddleColumnCollapsed(!middleColumnCollapsed)}
        />
      </div>

      {/* Right Column - Main Content (Derivation + Rules) */}
      <div className={cn(
        "transition-all duration-300 bg-background overflow-y-auto",
        getColumnWidth('right')
      )}>
        <div className="h-full p-4">
          {children}
        </div>
      </div>
    </div>
  );
});

ThreeColumnLayout.displayName = 'ThreeColumnLayout';