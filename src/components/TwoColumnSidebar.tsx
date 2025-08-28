import { forwardRef, useState } from 'react';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AlgorithmSelector } from './AlgorithmSelector';
import { ExpressionInput } from './ExpressionInput';
import { AlgorithmResult } from '@/types/inference';

interface TwoColumnSidebarProps {
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
}

export const TwoColumnSidebar = forwardRef<HTMLDivElement, TwoColumnSidebarProps>(({
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
  expressionInputRef
}, ref) => {
  const [leftColumnCollapsed, setLeftColumnCollapsed] = useState(false);
  const [rightColumnCollapsed, setRightColumnCollapsed] = useState(false);

  return (
    <Sidebar 
      ref={ref}
      className="border-r border-border/40 relative"
      collapsible="none"
    >
      <SidebarContent className="p-3 lg:p-4">
        {/* Two Column Layout with Independent Toggles */}
        <div className="flex h-full gap-3 lg:gap-4">
          {/* Left Column - Algorithm Selector */}
          <div className={`relative transition-all duration-300 ${leftColumnCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'flex-1'}`}>
            {!leftColumnCollapsed && (
              <div className="animate-stagger-1 hover-scale-sm h-full">
                <AlgorithmSelector
                  algorithms={algorithms}
                  selectedAlgorithm={selectedAlgorithm}
                  selectedVariant={selectedVariant}
                  onAlgorithmChange={onAlgorithmChange}
                  onVariantChange={onVariantChange}
                />
              </div>
            )}
            
            {/* Left Column Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute -right-6 top-1/2 -translate-y-1/2 z-10 bg-background border border-border shadow-sm hover:shadow-md"
              onClick={() => setLeftColumnCollapsed(!leftColumnCollapsed)}
            >
              {leftColumnCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Right Column - Expression Input */}
          <div className={`relative transition-all duration-300 ${rightColumnCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'flex-1'}`}>
            {!rightColumnCollapsed && (
              <div className="animate-stagger-2 hover-scale-sm h-full">
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
            
            {/* Right Column Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute -right-6 top-1/2 -translate-y-1/2 z-10 bg-background border border-border shadow-sm hover:shadow-md"
              onClick={() => setRightColumnCollapsed(!rightColumnCollapsed)}
            >
              {rightColumnCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
});

TwoColumnSidebar.displayName = 'TwoColumnSidebar';