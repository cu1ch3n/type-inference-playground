import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="space-y-4">
      {/* Expression Navigation */}
      <Card className="academic-panel">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Expression Navigation</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentExpressionIndex(Math.max(0, currentExpressionIndex - 1))}
                disabled={currentExpressionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentExpressionIndex + 1} of {expressions.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentExpressionIndex(Math.min(expressions.length - 1, currentExpressionIndex + 1))}
                disabled={currentExpressionIndex === expressions.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <code className="font-mono bg-muted px-3 py-2 rounded text-base">
              {currentExpression}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Side-by-Side Algorithm Comparison */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedAlgorithms.length}, 1fr)` }}>
        {selectedAlgorithms.map(algorithmId => {
          const algorithm = algorithms.find(alg => alg.Id === algorithmId);
          const cellKey = getCellKey(algorithmId, currentExpression);
          const cell = comparisonResults.get(cellKey);

          return (
            <Card key={algorithmId} className="academic-panel">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    {algorithm?.Name || algorithmId}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {algorithm?.Id || algorithmId}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <DerivationViewer
                  result={cell?.result}
                  algorithm={algorithm}
                  onStepClick={handleStepClick}
                  activeStepPath={activeStepPath}
                  activeRuleId={activeRuleId}
                  expression={currentExpression}
                  isInferring={cell?.loading || false}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Shared Typing Rules */}
      {selectedAlgorithms.length > 0 && (
        <Card className="academic-panel">
          <CardHeader>
            <CardTitle className="text-base">Typing Rules</CardTitle>
            <p className="text-sm text-muted-foreground">
              Rules from all selected algorithms
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {selectedAlgorithms.map(algorithmId => {
                const algorithm = algorithms.find(alg => alg.Id === algorithmId);
                if (!algorithm) return null;

                return (
                  <div key={algorithmId}>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{algorithm.Name}</Badge>
                    </div>
                    <TypingRules
                      rules={algorithm.Rules}
                      activeRuleId={activeRuleId}
                      onRuleClick={handleRuleClick}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};