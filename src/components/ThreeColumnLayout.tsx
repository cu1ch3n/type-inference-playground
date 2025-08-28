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
      return leftColumnCollapsed ? 'w-0' : 'w-80';
    }
    if (position === 'middle') {
      return middleColumnCollapsed ? 'w-0' : 'w-80';
    }
    // Right column takes remaining space
    return 'flex-1';
  };

  return (
    <div ref={ref} className="flex h-screen w-full bg-background">
      {/* Left Column - Algorithm Selector */}
      <div className={cn(
        "transition-all duration-300 flex-shrink-0 bg-muted/30 border-r border-border relative",
        getColumnWidth('left'),
        leftColumnCollapsed && "overflow-hidden"
      )}>
        {!leftColumnCollapsed && (
          <div className="h-full p-4 overflow-y-auto">
            <AlgorithmSelector
              algorithms={algorithms}
              selectedAlgorithm={selectedAlgorithm}
              selectedVariant={selectedVariant}
              onAlgorithmChange={onAlgorithmChange}
              onVariantChange={onVariantChange}
            />
          </div>
        )}
        
        {/* Left Column Separator/Toggle */}
        <div className="absolute right-0 top-0 h-full w-1 bg-border hover:bg-border/80 transition-colors cursor-col-resize group">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-8 p-0 bg-background border border-border shadow-sm hover:shadow-md group-hover:opacity-100 opacity-60 transition-opacity"
            onClick={() => setLeftColumnCollapsed(!leftColumnCollapsed)}
          >
            {leftColumnCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Middle Column - Expression Input */}
      <div className={cn(
        "transition-all duration-300 flex-shrink-0 bg-muted/20 border-r border-border relative",
        getColumnWidth('middle'),
        middleColumnCollapsed && "overflow-hidden"
      )}>
        {!middleColumnCollapsed && (
          <div className="h-full p-4 overflow-y-auto">
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
          </div>
        )}
        
        {/* Middle Column Separator/Toggle */}
        <div className="absolute right-0 top-0 h-full w-1 bg-border hover:bg-border/80 transition-colors cursor-col-resize group">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-8 p-0 bg-background border border-border shadow-sm hover:shadow-md group-hover:opacity-100 opacity-60 transition-opacity"
            onClick={() => setMiddleColumnCollapsed(!middleColumnCollapsed)}
          >
            {middleColumnCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>
        </div>
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