import { useState } from 'react';
import { AlgorithmSelector } from './AlgorithmSelector';
import { ExpressionInput } from './ExpressionInput';
import { AlgorithmResult } from '@/types/inference';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
        "transition-all duration-300 border-r border-border relative flex flex-col",
        leftColumnCollapsed ? "w-12" : "w-[28rem]"
      )}>
        {/* Collapse button */}
        <button
          className="absolute top-4 right-2 z-10 p-1 rounded hover:bg-muted/50 transition-colors"
          onClick={() => setLeftColumnCollapsed(!leftColumnCollapsed)}
        >
          {leftColumnCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {leftColumnCollapsed ? (
          <div className="flex-1 flex items-center justify-center">
            <div 
              className="text-sm font-medium text-muted-foreground whitespace-nowrap"
              style={{ 
                transform: 'rotate(270deg)',
                transformOrigin: 'center'
              }}
            >
              Algorithms
            </div>
          </div>
        ) : (
          <div className="p-6 h-full overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Algorithms</h3>
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
        "transition-all duration-300 relative flex flex-col",
        rightColumnCollapsed ? "w-12" : "w-[28rem]"
      )}>
        {/* Collapse button */}
        <button
          className="absolute top-4 right-2 z-10 p-1 rounded hover:bg-muted/50 transition-colors"
          onClick={() => setRightColumnCollapsed(!rightColumnCollapsed)}
        >
          {rightColumnCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {rightColumnCollapsed ? (
          <div className="flex-1 flex items-center justify-center">
            <div 
              className="text-sm font-medium text-muted-foreground whitespace-nowrap"
              style={{ 
                transform: 'rotate(270deg)',
                transformOrigin: 'center'
              }}
            >
              Expression
            </div>
          </div>
        ) : (
          <div className="p-6 h-full overflow-y-auto flex flex-col space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Expression & Input</h3>
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
            
            {/* History Section */}
            <div className="flex-1 bg-card border border-border rounded-lg p-4 min-h-32">
              <h4 className="text-base font-medium mb-3">Expression History</h4>
              <div className="space-y-2 text-sm">
                <div className="text-muted-foreground">Recent expressions will appear here</div>
              </div>
            </div>

            {/* Program Card */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="text-base font-medium mb-3">Program Information</h4>
              <div className="space-y-2 text-sm">
                <div className="text-muted-foreground">Program details and metadata will appear here</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};