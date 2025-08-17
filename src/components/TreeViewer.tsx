import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, Circle } from 'lucide-react';
import { KaTeXRenderer } from './KaTeXRenderer';
import { DerivationStep } from '@/types/inference';

interface TreeViewerProps {
  steps: DerivationStep[];
  onStepClick?: (stepPath: number[]) => void;
  activeStepPath?: number[];
  expandedByDefault?: boolean;
}

export const TreeViewer = ({ 
  steps, 
  onStepClick, 
  activeStepPath, 
  expandedByDefault = true 
}: TreeViewerProps) => {
  const initializeExpandedSteps = () => {
    if (!expandedByDefault) return new Set<string>();
    const expanded = new Set<string>();
    const addAllPaths = (steps: DerivationStep[], basePath: number[] = []) => {
      steps.forEach((step, index) => {
        const path = [...basePath, index];
        expanded.add(path.join('-'));
        if (step.children) addAllPaths(step.children, path);
      });
    };
    addAllPaths(steps);
    return expanded;
  };
  
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(initializeExpandedSteps());

  // Re-initialize expanded steps when steps change and expandedByDefault is true
  useEffect(() => {
    if (expandedByDefault && steps.length > 0) {
      setExpandedSteps(initializeExpandedSteps());
    }
  }, [steps, expandedByDefault]);

  const toggleExpanded = (stepPath: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepPath)) {
      newExpanded.delete(stepPath);
    } else {
      newExpanded.add(stepPath);
    }
    setExpandedSteps(newExpanded);
  };

  const renderTreeNode = (step: DerivationStep, path: number[], isLast = false) => {
    const pathKey = path.join('-');
    const isExpanded = expandedSteps.has(pathKey);
    const hasChildren = step.children && step.children.length > 0;
    const isActive = activeStepPath && activeStepPath.join('-') === pathKey;

    return (
      <li key={pathKey} className="relative">
        <div
          className={`
            flex items-center gap-2 py-1 pr-2 rounded transition-colors
            ${isActive ? 'bg-yellow-100 border-2 border-yellow-400' : 'hover:bg-muted/40'}
            ${onStepClick ? 'cursor-pointer' : ''}
          `}
          onClick={() => onStepClick?.(path)}
        >
          {/* Expand/collapse button */}
          <div className="flex items-center justify-center w-5 h-5 shrink-0">
            {hasChildren ? (
                <button
                className="w-4 h-4 flex items-center justify-center rounded hover:bg-muted-foreground/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(pathKey);
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
              renderTreeNode(child, [...path, index], index === step.children!.length - 1)
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
          renderTreeNode(step, [index], index === steps.length - 1)
        )}
      </ul>
    </div>
  );
};