import { useState } from 'react';
import { AlgorithmSelector } from './AlgorithmSelector';
import { ExpressionInput } from './ExpressionInput';
import { AlgorithmResult } from '@/types/inference';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
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
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* Algorithm Selector Panel */}
      <ResizablePanel 
        defaultSize={25} 
        minSize={15} 
        maxSize={40}
        collapsible={true}
        collapsedSize={4}
        onCollapse={() => setLeftColumnCollapsed(true)}
        onExpand={() => setLeftColumnCollapsed(false)}
        className={cn(
          "bg-background border-r border-border transition-all duration-300",
          leftColumnCollapsed && "w-12"
        )}
      >
        {leftColumnCollapsed ? (
          <div 
            className="h-full w-full flex flex-col items-center justify-center hover:bg-muted/30 transition-colors cursor-pointer group"
            onClick={() => setLeftColumnCollapsed(false)}
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground mb-4" />
            <div 
              className="text-xs font-medium text-muted-foreground group-hover:text-foreground whitespace-nowrap select-none"
              style={{ 
                transform: 'rotate(270deg)',
                transformOrigin: 'center'
              }}
            >
              Algorithms
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-medium">Algorithms</h3>
              <button
                className="p-1 rounded hover:bg-muted transition-colors"
                onClick={() => setLeftColumnCollapsed(true)}
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto">
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
      </ResizablePanel>

      <ResizableHandle withHandle className="w-2 bg-border hover:bg-primary/20 transition-colors" />

      {/* Expression Input Panel */}
      <ResizablePanel 
        defaultSize={30} 
        minSize={20} 
        maxSize={50}
        collapsible={true}
        collapsedSize={4}
        onCollapse={() => setRightColumnCollapsed(true)}
        onExpand={() => setRightColumnCollapsed(false)}
        className={cn(
          "bg-background border-r border-border transition-all duration-300",
          rightColumnCollapsed && "w-12"
        )}
      >
        {rightColumnCollapsed ? (
          <div 
            className="h-full w-full flex flex-col items-center justify-center hover:bg-muted/30 transition-colors cursor-pointer group"
            onClick={() => setRightColumnCollapsed(false)}
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground mb-4" />
            <div 
              className="text-xs font-medium text-muted-foreground group-hover:text-foreground whitespace-nowrap select-none"
              style={{ 
                transform: 'rotate(270deg)',
                transformOrigin: 'center'
              }}
            >
              Expression
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-medium">Expression</h3>
              <button
                className="p-1 rounded hover:bg-muted transition-colors"
                onClick={() => setRightColumnCollapsed(true)}
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto space-y-4">
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
              
              <div className="border-t border-border pt-3">
                <h4 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">History</h4>
                <div className="text-xs text-muted-foreground">
                  Recent expressions will appear here
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <h4 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">Program Info</h4>
                <div className="text-xs text-muted-foreground">
                  Program details will appear here
                </div>
              </div>
            </div>
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};