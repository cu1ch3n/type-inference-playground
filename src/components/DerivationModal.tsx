import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DerivationViewer } from './DerivationViewer';
import { TypingRules } from './TypingRules';
import { InferenceResult, TypeInferenceAlgorithm } from '@/types/inference';
import { useAlgorithms } from '@/hooks/useAlgorithms';
import { KaTeXRenderer } from './KaTeXRenderer';

interface DerivationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  algorithmId: string;
  expression: string;
  result?: InferenceResult;
}

export const DerivationModal = ({ 
  open, 
  onOpenChange, 
  algorithmId, 
  expression, 
  result 
}: DerivationModalProps) => {
  const [activeRuleId, setActiveRuleId] = useState<string | undefined>(undefined);
  const [activeStepPath, setActiveStepPath] = useState<number[] | undefined>(undefined);
  const { algorithms } = useAlgorithms();

  const algorithm = algorithms.find(alg => alg.Id === algorithmId);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Derivation Details</span>
            {algorithm && (
              <Badge variant="outline" className="font-medium">
                {algorithm.Name}
              </Badge>
            )}
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Expression:</span>
            <code className="font-mono bg-muted px-2 py-1 rounded text-xs">
              {expression}
            </code>
          </div>
        </DialogHeader>
        
        <Separator className="my-4" />
        
        <div className="space-y-6">
          {/* Derivation Viewer */}
          <DerivationViewer
            result={result}
            algorithm={algorithm}
            onStepClick={handleStepClick}
            activeStepPath={activeStepPath}
            activeRuleId={activeRuleId}
            expression={expression}
            isInferring={false}
          />

          {/* Typing Rules */}
          {algorithm && (
            <TypingRules
              rules={algorithm.Rules}
              activeRuleId={activeRuleId}
              onRuleClick={handleRuleClick}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};