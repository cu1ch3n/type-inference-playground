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
      return leftColumnCollapsed ? 'w-1' : 'w-[30%]';
    }
    if (position === 'middle') {
      return middleColumnCollapsed ? 'w-1' : 'w-[20%]';
    }
    // Right column takes remaining space (50% when both open, more when others collapsed)
    const leftSpace = leftColumnCollapsed ? 0 : 30;
    const middleSpace = middleColumnCollapsed ? 0 : 20;
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
        
        {/* Toggle Handle - Cuts through separator */}
        <div
          className="absolute -right-2 top-4 w-4 h-12 bg-background border border-border rounded-md shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 hover:w-5 z-20 flex items-center justify-center group"
          onClick={() => setLeftColumnCollapsed(!leftColumnCollapsed)}
        >
          <div className="w-0.5 h-6 bg-border rounded-full group-hover:bg-primary/50 transition-colors duration-200" />
        </div>
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
        
        {/* Toggle Handle - Cuts through separator */}
        <div
          className="absolute -right-2 top-16 w-4 h-12 bg-background border border-border rounded-md shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 hover:w-5 z-10 flex items-center justify-center group"
          onClick={() => setMiddleColumnCollapsed(!middleColumnCollapsed)}
        >
          <div className="w-0.5 h-6 bg-border rounded-full group-hover:bg-primary/50 transition-colors duration-200" />
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