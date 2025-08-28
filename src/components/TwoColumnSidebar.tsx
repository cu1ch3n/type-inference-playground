import { forwardRef } from 'react';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
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
  return (
    <Sidebar 
      ref={ref}
      className="border-r border-border/40"
      collapsible="offcanvas"
    >
      <SidebarContent className="p-3 lg:p-4">
        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4 h-full">
          {/* Left Column - Algorithm Selector */}
          <div className="flex flex-col space-y-3">
            <div className="animate-stagger-1 hover-scale-sm h-full">
              <AlgorithmSelector
                algorithms={algorithms}
                selectedAlgorithm={selectedAlgorithm}
                selectedVariant={selectedVariant}
                onAlgorithmChange={onAlgorithmChange}
                onVariantChange={onVariantChange}
              />
            </div>
          </div>
          
          {/* Right Column - Expression Input */}
          <div className="flex flex-col space-y-3">
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
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
});

TwoColumnSidebar.displayName = 'TwoColumnSidebar';