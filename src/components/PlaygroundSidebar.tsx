import { forwardRef } from 'react';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { AlgorithmSelector } from './AlgorithmSelector';
import { ExpressionInput } from './ExpressionInput';
import { AlgorithmResult } from '@/types/inference';

interface PlaygroundSidebarProps {
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

export const PlaygroundSidebar = forwardRef<HTMLDivElement, PlaygroundSidebarProps>(({
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
      <SidebarContent className="p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3 lg:space-y-4">
        <div className="animate-stagger-1 hover-scale-sm">
          <AlgorithmSelector
            algorithms={algorithms}
            selectedAlgorithm={selectedAlgorithm}
            selectedVariant={selectedVariant}
            onAlgorithmChange={onAlgorithmChange}
            onVariantChange={onVariantChange}
          />
        </div>
        
        <div className="animate-stagger-2 hover-scale-sm">
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
      </SidebarContent>
    </Sidebar>
  );
});

PlaygroundSidebar.displayName = 'PlaygroundSidebar';