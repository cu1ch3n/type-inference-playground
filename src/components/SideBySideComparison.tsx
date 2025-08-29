import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, BookOpen, Minus } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { DerivationViewer } from './DerivationViewer';
import { TypingRules } from './TypingRules';
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
  const [activeRuleId, setActiveRuleId] = useState<string | undefined>(undefined);
  const [activeStepPath, setActiveStepPath] = useState<number[] | undefined>(undefined);
  const [rulesCollapsed, setRulesCollapsed] = useState(false);
  const { algorithms } = useAlgorithms();

  const currentExpression = expressions[currentExpressionIndex];

  const handleRuleClick = (ruleId: string) => {
    if (activeRuleId === ruleId) {
      setActiveRuleId(undefined);
      setActiveStepPath(undefined);
    } else {
      setActiveRuleId(ruleId);
      setActiveStepPath(undefined);
    }
  };

  const handleStepClick = (stepPath: number[]) => {
    if (activeStepPath && activeStepPath.join('-') === stepPath.join('-')) {
      setActiveStepPath(undefined);
      setActiveRuleId(undefined);
    } else {
      setActiveStepPath(stepPath);
      setActiveRuleId(undefined);
    }
  };

  const handleExpandRules = () => {
    setRulesCollapsed(false);
  };

  const handleCollapseRules = () => {
    setRulesCollapsed(true);
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

        {/* Middle Section - Algorithm Comparisons */}
        <Panel id="comparisons" order={2} defaultSize={55} minSize={30}>
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
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {algorithm?.Id || algorithmId}
                          </Badge>
                        </div>
                        {/* Derivation Content */}
                        <div className="flex-1 p-3 overflow-y-auto">
                          <DerivationViewer
                            result={cell?.result}
                            algorithm={algorithm}
                            onStepClick={handleStepClick}
                            activeStepPath={activeStepPath}
                            activeRuleId={activeRuleId}
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

        <PanelResizeHandle className="h-px bg-border hover:bg-primary/20 transition-colors shadow-sm" />

        {/* Bottom Section - Typing Rules */}
        {selectedAlgorithms.length > 0 && (
          <Panel 
            id="rules"
            order={3}
            defaultSize={40} 
            minSize={20} 
            collapsible={true}
            collapsedSize={5}
            onCollapse={() => setRulesCollapsed(true)}
            onExpand={() => setRulesCollapsed(false)}
            className="bg-background"
          >
            {rulesCollapsed ? (
              <div 
                className="h-full w-full flex items-center justify-center bg-background border-t border-border hover:bg-muted/30 transition-colors cursor-pointer group gap-2"
                onClick={handleExpandRules}
              >
                <BookOpen className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                <span 
                  className="text-sm font-medium text-muted-foreground group-hover:text-foreground whitespace-nowrap select-none"
                >
                  Typing Rules
                </span>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="p-2 flex items-center justify-between h-10 border-b border-border">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Typing Rules
                  </h3>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCollapseRules}
                      className="h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-smooth"
                      title="Minimize panel"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <PanelGroup direction="horizontal" className="h-full">
                    {selectedAlgorithms.map((algorithmId, index) => {
                      const algorithm = algorithms.find(alg => alg.Id === algorithmId);
                      if (!algorithm) return null;

                      return (
                        <div key={algorithmId} className="contents">
                          <Panel 
                            id={`rules-${algorithmId}`} 
                            order={index + 1} 
                            defaultSize={100 / selectedAlgorithms.length} 
                            minSize={20}
                          >
                            <div className="h-full flex flex-col">
                              <div className="p-2 border-b border-border bg-muted/20">
                                <Badge variant="secondary" className="text-xs">
                                  {algorithm.Name}
                                </Badge>
                              </div>
                              <div className="flex-1 p-3 overflow-y-auto">
                                <TypingRules
                                  rules={algorithm.Rules}
                                  activeRuleId={activeRuleId}
                                  onRuleClick={handleRuleClick}
                                  showHeader={false}
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
              </div>
            )}
          </Panel>
        )}
      </PanelGroup>
    </div>
  );
};