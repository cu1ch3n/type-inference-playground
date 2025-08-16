import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { KaTeXRenderer } from './KaTeXRenderer';
import { DerivationStep } from '@/types/inference';

interface TreeViewerProps {
  steps: DerivationStep[];
  onStepClick?: (stepId: string) => void;
  activeStepId?: string;
  expandedByDefault?: boolean;
}

export const TreeViewer = ({ 
  steps, 
  onStepClick, 
  activeStepId, 
  expandedByDefault = false 
}: TreeViewerProps) => {
  const initializeExpandedSteps = () => {
    if (!expandedByDefault) return new Set<string>();
    const expanded = new Set<string>();
    const addAllIds = (steps: DerivationStep[]) => {
      steps.forEach(step => {
        expanded.add(step.id);
        if (step.children) addAllIds(step.children);
      });
    };
    addAllIds(steps);
    return expanded;
  };
  
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(initializeExpandedSteps());

  const toggleExpanded = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const renderTreeNode = (step: DerivationStep, depth = 0, isLast = false, prefix = '') => {
    const isExpanded = expandedSteps.has(step.id);
    const hasChildren = step.children && step.children.length > 0;
    const isActive = activeStepId === step.id;

    const connector = depth === 0 ? '' : isLast ? '└─ ' : '├─ ';
    const childPrefix = depth === 0 ? '' : prefix + (isLast ? '   ' : '│  ');

    return (
      <div key={step.id}>
        <div
          className={`
            flex items-center gap-2 py-1 px-2 rounded transition-colors font-mono text-sm
            ${isActive ? 'bg-primary/10 border border-primary/20' : ''}
            ${onStepClick ? 'cursor-pointer hover:bg-muted/50' : ''}
          `}
          onClick={() => onStepClick?.(step.id)}
        >
          {/* Tree structure */}
          <div className="text-muted-foreground font-mono text-xs whitespace-pre select-none">
            {prefix}{connector}
          </div>
          
          {/* Expand/collapse button */}
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-4 w-4 shrink-0"
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
          
          {/* Rule badge */}
          <Badge 
            variant={isActive ? "default" : "secondary"}
            className="text-xs font-medium shrink-0"
          >
            {step.ruleId}
          </Badge>
          
          {/* Expression */}
          <div className="flex-1 min-w-0">
            <KaTeXRenderer 
              expression={step.expression} 
              displayMode={false}
              className="text-sm"
            />
            {step.type && (
              <div className="text-xs text-muted-foreground mt-0.5">
                Type: <KaTeXRenderer expression={step.type} displayMode={false} className="text-xs" />
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && step.children && (
          <div>
            {step.children.map((child, index) => 
              renderTreeNode(
                child, 
                depth + 1, 
                index === step.children!.length - 1,
                childPrefix
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {steps.map((step, index) => 
        renderTreeNode(step, 0, index === steps.length - 1)
      )}
    </div>
  );
};