import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { KaTeXRenderer } from './KaTeXRenderer';
import { TreeViewer } from './TreeViewer';
import { DerivationStep, InferenceResult, TypeInferenceAlgorithm } from '@/types/inference';
import { GitBranch, Activity, TreePine, Zap } from 'lucide-react';
import { ShareExportButtons } from './ShareExportButtons';

interface DerivationViewerProps {
  result?: InferenceResult;
  algorithm?: TypeInferenceAlgorithm;
  onStepClick?: (stepPath: number[]) => void;
  activeStepPath?: number[];
  activeRuleId?: string;
  expression?: string;
  isInferring?: boolean;
}

export const DerivationViewer = ({ result, algorithm, onStepClick, activeStepPath, activeRuleId, expression, isInferring }: DerivationViewerProps) => {

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
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GitBranch className="w-5 h-5 text-primary" />
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
    <Card 
      key={`${algorithm?.id}-${expression}-${result?.success}-${result?.derivation?.length}`}
      className="academic-panel animate-fade-in" 
      data-derivation-viewer
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GitBranch className="w-5 h-5 text-primary" />
              Derivation
            </CardTitle>
            {result.finalType && (
              <div className="flex items-center gap-2 min-w-0 animate-scale-in" style={{ animationDelay: '200ms' }}>
                <Separator orientation="vertical" className="h-6 hidden sm:block" />
                <span className="text-sm text-muted-foreground hidden sm:inline">Type:</span>
                <div className="min-w-0 max-w-[50vw] sm:max-w-none">
                  <Badge variant="secondary" className="font-math truncate">
                    <KaTeXRenderer expression={result.finalType} />
                  </Badge>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
            {algorithm && expression && (
              <ShareExportButtons
                algorithm={algorithm}
                expression={expression}
                result={result}
                disabled={isInferring}
              />
            )}
          </div>
        </div>
        <Separator className="mt-4" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Show error if present */}
        {!result.success && result.error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg animate-slide-in-right" style={{ animationDelay: '100ms' }}>
            <p className="text-destructive font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Error
            </p>
            <div className="text-sm text-destructive/80 mt-2">
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
            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
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
                  {linearSteps.map(({step, path}, index) => (
                    <div key={path.join('-')} className="animate-fade-in" style={{ animationDelay: `${300 + index * 50}ms` }}>
                      {renderLinearStep(step, path)}
                    </div>
                  ))}
                </div>
              )}
            </div>
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