import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { DerivationViewer } from './DerivationViewer';
import { InferenceResult, TypeInferenceAlgorithm } from '@/types/inference';
import { useAlgorithms } from '@/contexts/AlgorithmContext';

interface ComparisonCell {
  algorithmId: string;
  expression: string;
  result?: InferenceResult;
  loading: boolean;
}

interface SideBySideComparisonProps {
  selectedAlgorithms: string[];
  expressions: string[];
  comparisonResults: Map<string, ComparisonCell>;
}

export const SideBySideComparison = ({ 
  selectedAlgorithms, 
  expressions, 
  comparisonResults 
}: SideBySideComparisonProps) => {
  const [currentExpressionIndex, setCurrentExpressionIndex] = useState(0);
  const [activeStepPath, setActiveStepPath] = useState<number[] | undefined>(undefined);
  const { algorithms } = useAlgorithms();

  const currentExpression = expressions[currentExpressionIndex];

  const handleStepClick = (stepPath: number[]) => {
    if (activeStepPath && activeStepPath.join('-') === stepPath.join('-')) {
      setActiveStepPath(undefined);
    } else {
      setActiveStepPath(stepPath);
    }
  };

  const getCellKey = (algorithmId: string, expression: string) => `${algorithmId}:${expression}`;

  const hasResults = selectedAlgorithms.length > 0 && expressions.length > 0;
  
  if (!hasResults) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Select algorithms and add expressions to start comparing side-by-side.
      </div>
    );
  }

  return (
    <div className="h-full">
      <PanelGroup direction="vertical" className="h-full">
        {/* Top Section - Expression Navigation */}
        <Panel id="expression-nav" order={1} defaultSize={5} minSize={4} maxSize={8}>
          <div className="h-full bg-background border-b border-border">
            <div className="px-3 py-1 h-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex-shrink-0">Expression:</span>
                <code className="font-mono bg-muted px-2 py-0.5 rounded text-xs flex-1 min-w-0 truncate">
                  {currentExpression}
                </code>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentExpressionIndex(Math.max(0, currentExpressionIndex - 1))}
                  disabled={currentExpressionIndex === 0}
                  className="h-6 w-6 p-0"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
                  {currentExpressionIndex + 1}/{expressions.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentExpressionIndex(Math.min(expressions.length - 1, currentExpressionIndex + 1))}
                  disabled={currentExpressionIndex === expressions.length - 1}
                  className="h-6 w-6 p-0"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="h-px bg-border hover:bg-primary/20 transition-colors shadow-sm" />

        {/* Main Section - Algorithm Comparisons */}
        <Panel id="comparisons" order={2} defaultSize={100} minSize={50}>
          <div className="h-full bg-background">
            <PanelGroup direction="horizontal" className="h-full">
              {selectedAlgorithms.map((algorithmId, index) => {
                const algorithm = algorithms.find(alg => alg.Id === algorithmId);
                const cellKey = getCellKey(algorithmId, currentExpression);
                const cell = comparisonResults.get(cellKey);

                return (
                  <div key={algorithmId} className="contents">
                    <Panel 
                      id={`algorithm-${algorithmId}`} 
                      order={index + 1} 
                      defaultSize={100 / selectedAlgorithms.length} 
                      minSize={20}
                    >
                      <div className="h-full flex flex-col bg-background">
                        {/* Algorithm Header */}
                        <div className="p-2 flex items-center justify-between h-10 border-b border-border bg-muted/30">
                          <h3 className="text-sm font-medium truncate">
                            {algorithm?.Name || algorithmId}
                          </h3>
                        </div>
                        {/* Derivation Content */}
                        <div className="flex-1 p-3 overflow-y-auto">
                          <DerivationViewer
                            result={cell?.result}
                            algorithm={algorithm}
                            onStepClick={handleStepClick}
                            activeStepPath={activeStepPath}
                            expression={currentExpression}
                            isInferring={cell?.loading || false}
                          />
                        </div>
                      </div>
                    </Panel>
                    {index < selectedAlgorithms.length - 1 && (
                      <PanelResizeHandle className="bg-border hover:bg-primary/20 transition-colors shadow-sm" style={{ width: '0.5px' }} />
                    )}
                  </div>
                );
              })}
            </PanelGroup>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};