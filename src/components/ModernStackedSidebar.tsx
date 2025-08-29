import { useState } from 'react';
import { AlgorithmSelector } from './AlgorithmSelector';
import { ExpressionInput } from './ExpressionInput';
import { AlgorithmResult } from '@/types/inference';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  return (
    <div className="h-full bg-background border-r border-border overflow-hidden">
      <PanelGroup direction="horizontal" className="h-full">
        {/* Left Column - Algorithm Selector */}
        <Panel 
          defaultSize={25} 
          minSize={15} 
          maxSize={40}
          collapsible={true}
          collapsedSize={3}
          onCollapse={() => setLeftColumnCollapsed(true)}
          onExpand={() => setLeftColumnCollapsed(false)}
          className="border-r border-border relative flex flex-col"
        >
          {leftColumnCollapsed ? (
            <button
              className="h-full w-full flex flex-col items-center justify-center hover:bg-muted/30 transition-colors group cursor-pointer relative min-w-12 max-w-12"
              onClick={() => setLeftColumnCollapsed(false)}
            >
              {/* Expand button in the middle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              {/* Rotated text */}
              <div 
                className="text-sm font-medium text-muted-foreground whitespace-nowrap select-none group-hover:text-foreground transition-colors mt-8"
                style={{ 
                  transform: 'rotate(270deg)',
                  transformOrigin: 'center'
                }}
              >
                Algorithms
              </div>
            </button>
          ) : (
            <div className="p-4 h-full overflow-y-auto relative">
              {/* Collapse button */}
              <button
                className="absolute top-2 right-2 z-10 p-1 rounded hover:bg-muted/50 transition-colors"
                onClick={() => setLeftColumnCollapsed(true)}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-base font-semibold mb-4 text-foreground">Algorithms</h3>
              <AlgorithmSelector
                algorithms={algorithms}
                selectedAlgorithm={selectedAlgorithm}
                selectedVariant={selectedVariant}
                onAlgorithmChange={onAlgorithmChange}
                onVariantChange={onVariantChange}
              />
            </div>
          )}
        </Panel>

        <PanelResizeHandle className="w-1 bg-border hover:bg-accent transition-colors" />

        {/* Right Column - Expression Input & History */}
        <Panel 
          defaultSize={30} 
          minSize={20} 
          maxSize={50}
          collapsible={true}
          collapsedSize={3}
          onCollapse={() => setRightColumnCollapsed(true)}
          onExpand={() => setRightColumnCollapsed(false)}
          className="relative flex flex-col"
        >
          {rightColumnCollapsed ? (
            <button
              className="h-full w-full flex flex-col items-center justify-center hover:bg-muted/30 transition-colors group cursor-pointer relative min-w-12 max-w-12"
              onClick={() => setRightColumnCollapsed(false)}
            >
              {/* Expand button in the middle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              {/* Rotated text */}
              <div 
                className="text-sm font-medium text-muted-foreground whitespace-nowrap select-none group-hover:text-foreground transition-colors mt-8"
                style={{ 
                  transform: 'rotate(270deg)',
                  transformOrigin: 'center'
                }}
              >
                Expression
              </div>
            </button>
          ) : (
            <div className="p-4 h-full overflow-y-auto flex flex-col space-y-4 relative">
              {/* Collapse button */}
              <button
                className="absolute top-2 right-2 z-10 p-1 rounded hover:bg-muted/50 transition-colors"
                onClick={() => setRightColumnCollapsed(true)}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div>
                <h3 className="text-base font-semibold mb-4 text-foreground">Expression & Input</h3>
                <div className="border-l-2 border-border pl-3">
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
              
              {/* History Section */}
              <div className={cn(
                "flex-1 min-h-32 p-3 border-l-2 border-border",
                isMobile && "bg-card border border-border rounded-lg p-4"
              )}>
                <h4 className="text-sm font-medium mb-3 text-foreground">Expression History</h4>
                <div className="space-y-2 text-sm">
                  <div className="text-muted-foreground">Recent expressions will appear here</div>
                </div>
              </div>

              {/* Program Information */}
              <div className={cn(
                "p-3 border-l-2 border-border",
                isMobile && "bg-card border border-border rounded-lg p-4"
              )}>
                <h4 className="text-sm font-medium mb-3 text-foreground">Program Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="text-muted-foreground">Program details and metadata will appear here</div>
                </div>
              </div>
            </div>
          )}
        </Panel>
      </PanelGroup>
    </div>
  );
};