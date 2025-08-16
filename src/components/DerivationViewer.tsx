import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { KaTeXRenderer } from './KaTeXRenderer';
import { DerivationStep, InferenceResult, TypeInferenceAlgorithm } from '@/types/inference';

interface DerivationViewerProps {
  result?: InferenceResult;
  algorithm?: TypeInferenceAlgorithm;
  onStepClick?: (stepId: string) => void;
  activeStepId?: string;
}

export const DerivationViewer = ({ result, algorithm, onStepClick, activeStepId }: DerivationViewerProps) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleExpanded = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const renderTreeStep = (step: DerivationStep, depth = 0) => {
    const isExpanded = expandedSteps.has(step.id);
    const hasChildren = step.children && step.children.length > 0;
    const isActive = activeStepId === step.id;

    return (
      <div key={step.id} className="space-y-1">
        <div
          className={`
            derivation-step font-mono text-sm
            ${isActive ? 'active' : ''}
            ${onStepClick ? 'cursor-pointer' : ''}
          `}
          style={{ marginLeft: `${depth * 1.2}rem` }}
          onClick={() => onStepClick?.(step.id)}
        >
          <div className="flex items-start gap-2">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto mt-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(step.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </Button>
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-primary">{step.ruleId}:</span>
                <KaTeXRenderer 
                  expression={step.expression} 
                  displayMode={false}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {step.children!.map(child => renderTreeStep(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

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
          <Badge variant="outline" className="text-xs min-w-0 shrink-0">
            {index + 1}
          </Badge>
          
          <Badge variant="secondary" className="text-xs font-medium">
            {step.ruleId}
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
          <CardTitle>Derivation</CardTitle>
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
          <CardTitle>Derivation</CardTitle>
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
          <CardTitle>Derivation</CardTitle>
          {result.finalType && (
            <Badge variant="default" className="font-math">
              <KaTeXRenderer expression={result.finalType} />
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'tree' ? (
          <div className="space-y-2">
            {result.derivation.map(step => renderTreeStep(step))}
          </div>
        ) : (
          <div className="space-y-3">
            {linearSteps.map((step, index) => renderLinearStep(step, index))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};