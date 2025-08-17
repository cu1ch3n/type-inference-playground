import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { KaTeXRenderer } from './KaTeXRenderer';
import { TreeViewer } from './TreeViewer';
import { DerivationStep, InferenceResult, TypeInferenceAlgorithm } from '@/types/inference';
import { GitBranch, Activity, TreePine, Zap } from 'lucide-react';

interface DerivationViewerProps {
  result?: InferenceResult;
  algorithm?: TypeInferenceAlgorithm;
  onStepClick?: (stepPath: number[]) => void;
  activeStepPath?: number[];
  activeRuleId?: string;
}

export const DerivationViewer = ({ result, algorithm, onStepClick, activeStepPath, activeRuleId }: DerivationViewerProps) => {

  const renderLinearStep = (step: DerivationStep, stepPath: number[]) => {
    const isActiveByPath = activeStepPath && activeStepPath.join('-') === stepPath.join('-');
    const isActiveByRule = activeRuleId && step.ruleId === activeRuleId;
    const isActive = isActiveByPath || isActiveByRule;

    return (
      <div
        key={stepPath.join('-')}
        className={`
          derivation-step p-2 rounded-lg font-mono transition-all duration-200
          ${isActive ? 'bg-highlight/30 border-primary shadow-sm border' : 'hover:bg-muted/30'}
          ${onStepClick ? 'cursor-pointer' : ''}
        `}
        onClick={() => onStepClick?.(stepPath)}
      >
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs min-w-[2rem] shrink-0 text-center font-mono">
            {(stepPath[stepPath.length - 1] + 1).toString().padStart(2, ' ')}
          </Badge>
          
          <div className="flex-1 min-w-0">
            <KaTeXRenderer 
              expression={step.expression} 
              displayMode={false}
              className="text-sm"
            />
          </div>
          
          <Badge variant="secondary" className="text-xs font-medium ml-auto">
            {step.ruleId}
          </Badge>
        </div>
      </div>
    );
  };

  const flattenSteps = (steps: DerivationStep[]): Array<{step: DerivationStep, path: number[]}> => {
    const result: Array<{step: DerivationStep, path: number[]}> = [];
    const visit = (step: DerivationStep, path: number[]) => {
      result.push({step, path});
      if (step.children) {
        step.children.forEach((child, index) => visit(child, [...path, index]));
      }
    };
    steps.forEach((step, index) => visit(step, [index]));
    return result;
  };

  if (!result) {
    return (
      <Card className="academic-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Derivation
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
          <div className="text-center space-y-2">
            <p className="font-medium">No derivation yet</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
              <Zap className="w-3 h-3" />
              <span>Enter an expression to start type inference</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const viewMode = algorithm?.viewMode || 'tree';
  const linearSteps = flattenSteps(result.derivation);
  const hasDerivation = result.derivation && result.derivation.length > 0;

  return (
    <Card className="academic-panel">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Derivation
          </CardTitle>
          {result.finalType && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-1 flex items-center justify-end gap-1">
                <Activity className="w-3 h-3" />
                Result Type:
              </div>
              <Badge variant="default" className="font-math text-sm">
                <KaTeXRenderer expression={result.finalType} />
              </Badge>
            </div>
          )}
        </div>
        <Separator className="mt-4" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Show error if present */}
        {!result.success && result.error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive font-medium">Error</p>
            <div className="text-sm text-destructive/80 mt-1">
              {result.errorLatex ? (
                <KaTeXRenderer 
                  expression={result.error} 
                  displayMode={false}
                  className="text-destructive/80"
                />
              ) : (
                <pre className="font-mono whitespace-pre-wrap text-destructive/80">{result.error}</pre>
              )}
            </div>
          </div>
        )}
        
        {/* Show derivation if available */}
        {hasDerivation && (
          <>
            {!result.success && (
              <div className="text-sm text-muted-foreground mb-2">
                Partial derivation before error:
              </div>
            )}
            {viewMode === 'tree' ? (
              <TreeViewer 
                steps={result.derivation}
                onStepClick={onStepClick}
                activeStepPath={activeStepPath}
                activeRuleId={activeRuleId}
                expandedByDefault={true}
              />
            ) : (
              <div className="space-y-1">
                {linearSteps.map(({step, path}) => renderLinearStep(step, path))}
              </div>
            )}
          </>
        )}
        
        {/* Show message if no derivation available */}
        {!hasDerivation && result.success && (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">No derivation steps available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};