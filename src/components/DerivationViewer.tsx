import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { KaTeXRenderer } from './KaTeXRenderer';
import { TreeViewer } from './TreeViewer';
import { DerivationStep, InferenceResult, TypeInferenceAlgorithm } from '@/types/inference';
import { GitBranch, Activity } from 'lucide-react';

interface DerivationViewerProps {
  result?: InferenceResult;
  algorithm?: TypeInferenceAlgorithm;
  onStepClick?: (stepId: string) => void;
  activeStepId?: string;
}

export const DerivationViewer = ({ result, algorithm, onStepClick, activeStepId }: DerivationViewerProps) => {

  const renderLinearStep = (step: DerivationStep, index: number) => {
    const isActive = activeStepId === step.id;

    return (
      <div
        key={step.id}
        className={`
          derivation-step p-3 border rounded-lg font-mono
          ${isActive ? 'active border-primary bg-primary/5' : 'border-border'}
          ${onStepClick ? 'cursor-pointer hover:border-primary/50' : ''}
        `}
        onClick={() => onStepClick?.(step.id)}
      >
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs min-w-[2rem] shrink-0 text-center font-mono">
            {(index + 1).toString().padStart(2, ' ')}
          </Badge>
          
          <div className="flex-1 min-w-0">
            <KaTeXRenderer 
              expression={step.expression} 
              displayMode={false}
              className="text-sm"
            />
            {step.type && (
              <div className="mt-1 text-xs text-muted-foreground">
                Type: <KaTeXRenderer expression={step.type} displayMode={false} className="text-xs" />
              </div>
            )}
          </div>
          
          <Badge variant="secondary" className="text-xs font-medium ml-auto">
            {step.ruleId}
          </Badge>
        </div>
      </div>
    );
  };

  const flattenSteps = (steps: DerivationStep[]): DerivationStep[] => {
    const result: DerivationStep[] = [];
    const visit = (step: DerivationStep) => {
      result.push(step);
      if (step.children) {
        step.children.forEach(visit);
      }
    };
    steps.forEach(visit);
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
        <CardContent className="flex items-center justify-center h-40 text-muted-foreground">
          Run type inference to see the derivation
        </CardContent>
      </Card>
    );
  }

  if (!result.success) {
    return (
      <Card className="academic-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Derivation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive font-medium">Type Error</p>
            <p className="text-sm text-destructive/80 mt-1">
              {result.error || 'Unknown type error'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const viewMode = algorithm?.viewMode || 'tree';
  const linearSteps = flattenSteps(result.derivation);

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
      <CardContent>
        {viewMode === 'tree' ? (
          <TreeViewer 
            steps={result.derivation}
            onStepClick={onStepClick}
            activeStepId={activeStepId}
            expandedByDefault={true}
          />
        ) : (
          <div className="space-y-1">
            {linearSteps.map((step, index) => renderLinearStep(step, index))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};