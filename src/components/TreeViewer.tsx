import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, Circle } from 'lucide-react';
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
  expandedByDefault = true 
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

  const renderTreeNode = (step: DerivationStep, isLast = false) => {
    const isExpanded = expandedSteps.has(step.id);
    const hasChildren = step.children && step.children.length > 0;
    const isActive = activeStepId === step.id;

    return (
      <li key={step.id} className="relative">
        <div
          className={`
            flex items-center gap-2 py-1 pr-2 rounded transition-colors hover:bg-muted/40
            ${onStepClick ? 'cursor-pointer' : ''}
          `}
          onClick={() => onStepClick?.(step.id)}
        >
          {/* Expand/collapse button */}
          <div className="flex items-center justify-center w-5 h-5 shrink-0">
            {hasChildren ? (
              <button
                className="w-4 h-4 flex items-center justify-center rounded hover:bg-muted-foreground/20 transition-colors"
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
              </button>
            ) : (
              <div className="w-2 h-2" />
            )}
          </div>
          
          {/* Expression */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <KaTeXRenderer 
              expression={step.expression} 
              displayMode={false}
              className="text-sm"
            />
          </div>
          
          {/* Rule badge - aligned right */}
          <Badge 
            variant={isActive ? "default" : "secondary"}
            className="text-xs font-medium shrink-0 min-w-fit ml-auto"
          >
            {step.ruleId}
          </Badge>
        </div>

        {/* Children - nested list */}
        {hasChildren && isExpanded && step.children && (
          <ul className="ml-5 border-l border-muted-foreground/20 pl-3 mt-0.5 space-y-0.5">
            {step.children.map((child, index) => 
              renderTreeNode(child, index === step.children!.length - 1)
            )}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="tree-view">
      <ul className="space-y-0.5">
        {steps.map((step, index) => 
          renderTreeNode(step, index === steps.length - 1)
        )}
      </ul>
    </div>
  );
};