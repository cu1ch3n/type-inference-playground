import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, ChevronDown, TreePine, List } from 'lucide-react';
import { KaTeXRenderer } from './KaTeXRenderer';
import { DerivationStep, InferenceResult } from '@/types/inference';

interface DerivationViewerProps {
  result?: InferenceResult;
  onStepClick?: (stepId: string) => void;
  activeStepId?: string;
}

export const DerivationViewer = ({ result, onStepClick, activeStepId }: DerivationViewerProps) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'tree' | 'linear'>('tree');

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
      <div key={step.id} className="space-y-2">
        <div
          className={`
            derivation-step
            ${isActive ? 'active' : ''}
            ${onStepClick ? 'cursor-pointer' : ''}
          `}
          style={{ marginLeft: `${depth * 1.5}rem` }}
          onClick={() => onStepClick?.(step.id)}
        >
          <div className="flex items-center gap-2">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
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
            
            <Badge variant="outline" className="text-xs">
              {step.ruleId}
            </Badge>
            
            <div className="flex-1">
              <KaTeXRenderer 
                expression={`${step.expression}${step.type ? ` : ${step.type}` : ''}`} 
                displayMode={false}
                className="text-sm"
              />
            </div>
          </div>
          
          {step.explanation && (
            <p className="text-xs text-muted-foreground mt-1 ml-6">
              {step.explanation}
            </p>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-2">
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
          derivation-step
          ${isActive ? 'active' : ''}
          ${onStepClick ? 'cursor-pointer' : ''}
        `}
        onClick={() => onStepClick?.(step.id)}
      >
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs min-w-0">
            {index + 1}
          </Badge>
          
          <Badge variant="secondary" className="text-xs">
            {step.ruleId}
          </Badge>
          
          <div className="flex-1">
            <KaTeXRenderer 
              expression={`${step.expression}${step.type ? ` : ${step.type}` : ''}`} 
              displayMode={false}
              className="text-sm"
            />
          </div>
        </div>
        
        {step.explanation && (
          <p className="text-xs text-muted-foreground mt-2">
            {step.explanation}
          </p>
        )}
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
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'tree' | 'linear')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="tree" className="flex items-center gap-2">
              <TreePine className="w-4 h-4" />
              Tree View
            </TabsTrigger>
            <TabsTrigger value="linear" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Linear View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tree" className="space-y-3">
            {result.derivation.map(step => renderTreeStep(step))}
          </TabsContent>

          <TabsContent value="linear" className="space-y-3">
            {linearSteps.map((step, index) => renderLinearStep(step, index))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};