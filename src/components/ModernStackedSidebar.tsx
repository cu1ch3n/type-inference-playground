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
  const [leftColumnCollapsed, setLeftColumnCollapsed] = useState(false);
  const [rightColumnCollapsed, setRightColumnCollapsed] = useState(false);

  return (
    <div className="flex h-full bg-background border-r border-border">
      {/* Left Column - Algorithm Selector */}
      <div className={cn(
        "transition-all duration-300 border-r border-border",
        leftColumnCollapsed ? "w-16" : "w-96"
      )}>
        {/* Header with toggle */}
        <div 
          className="h-12 px-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors border-b border-border"
          onClick={() => setLeftColumnCollapsed(!leftColumnCollapsed)}
        >
          {leftColumnCollapsed ? (
            <div className="w-full flex justify-center">
              <h3 className="text-sm font-medium writing-mode-vertical-rl text-orientation-mixed transform rotate-180">
                Algorithms
              </h3>
            </div>
          ) : (
            <h3 className="text-sm font-medium">
              Algorithms
            </h3>
          )}
          {!leftColumnCollapsed && (
            <div className={cn(
              "w-4 h-4 border-r-2 border-b-2 border-muted-foreground transition-transform duration-200",
              "rotate-[135deg]"
            )} />
          )}
        </div>
        
        {!leftColumnCollapsed && (
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

      {/* Right Column - Expression Input & History */}
      <div className={cn(
        "transition-all duration-300",
        rightColumnCollapsed ? "w-16" : "w-96"
      )}>
        {/* Header with toggle */}
        <div 
          className="h-12 px-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors border-b border-border"
          onClick={() => setRightColumnCollapsed(!rightColumnCollapsed)}
        >
          {rightColumnCollapsed ? (
            <div className="w-full flex justify-center">
              <h3 className="text-sm font-medium writing-mode-vertical-rl text-orientation-mixed transform rotate-180">
                Expression & History
              </h3>
            </div>
          ) : (
            <h3 className="text-sm font-medium">
              Expression & History
            </h3>
          )}
          {!rightColumnCollapsed && (
            <div className={cn(
              "w-4 h-4 border-r-2 border-b-2 border-muted-foreground transition-transform duration-200",
              "rotate-[135deg]"
            )} />
          )}
        </div>
        
        {!rightColumnCollapsed && (
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