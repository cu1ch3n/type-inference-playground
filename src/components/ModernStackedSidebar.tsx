import { useState } from 'react';
import { AlgorithmSelector } from './AlgorithmSelector';
import { ExpressionInput } from './ExpressionInput';
import { AlgorithmResult } from '@/types/inference';
import { cn } from '@/lib/utils';

interface ModernStackedSidebarProps {
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

export const ModernStackedSidebar = ({
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
}: ModernStackedSidebarProps) => {
  const [topSectionCollapsed, setTopSectionCollapsed] = useState(false);
  const [bottomSectionCollapsed, setBottomSectionCollapsed] = useState(false);

  return (
    <div className="w-80 h-full bg-background border-r border-border flex flex-col">
      {/* Top Section - Algorithm Selector */}
      <div className={cn(
        "transition-all duration-300 border-b border-border",
        topSectionCollapsed ? "h-12" : "flex-1"
      )}>
        <div 
          className="h-12 px-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setTopSectionCollapsed(!topSectionCollapsed)}
        >
          <h3 className="text-sm font-medium">Algorithms</h3>
          <div className={cn(
            "w-4 h-4 border-r-2 border-b-2 border-muted-foreground transition-transform duration-200",
            topSectionCollapsed ? "rotate-45" : "-rotate-45"
          )} />
        </div>
        
        {!topSectionCollapsed && (
          <div className="p-4 h-full overflow-y-auto">
            <AlgorithmSelector
              algorithms={algorithms}
              selectedAlgorithm={selectedAlgorithm}
              selectedVariant={selectedVariant}
              onAlgorithmChange={onAlgorithmChange}
              onVariantChange={onVariantChange}
            />
          </div>
        )}
      </div>

      {/* Bottom Section - Expression Input & History */}
      <div className={cn(
        "transition-all duration-300",
        bottomSectionCollapsed ? "h-12" : "flex-1"
      )}>
        <div 
          className="h-12 px-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setBottomSectionCollapsed(!bottomSectionCollapsed)}
        >
          <h3 className="text-sm font-medium">Expression & History</h3>
          <div className={cn(
            "w-4 h-4 border-r-2 border-b-2 border-muted-foreground transition-transform duration-200",
            bottomSectionCollapsed ? "rotate-45" : "-rotate-45"
          )} />
        </div>
        
        {!bottomSectionCollapsed && (
          <div className="p-4 h-full overflow-y-auto flex flex-col space-y-4">
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
            
            {/* History Section */}
            <div className="flex-1 bg-card border border-border rounded-lg p-3 min-h-32">
              <h4 className="text-sm font-medium mb-2">Expression History</h4>
              <div className="space-y-1 text-xs">
                <div className="text-muted-foreground">Recent expressions will appear here</div>
              </div>
            </div>

            {/* Program Card */}
            <div className="bg-card border border-border rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2">Program Information</h4>
              <div className="space-y-1 text-xs">
                <div className="text-muted-foreground">Program details and metadata will appear here</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};