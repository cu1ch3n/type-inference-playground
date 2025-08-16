import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Navbar } from './Navbar';
import { AlgorithmSelector } from './AlgorithmSelector';
import { ExpressionInput } from './ExpressionInput';
import { TypingRules } from './TypingRules';
import { DerivationViewer } from './DerivationViewer';
import { algorithms } from '@/data/algorithms';
import { runInference } from '@/lib/mockInference';
import { InferenceResult } from '@/types/inference';

export const TypeInferencePlayground = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('algorithm-w');
  const [expression, setExpression] = useState<string>('\\x. x');
  const [result, setResult] = useState<InferenceResult | undefined>();
  const [isInferring, setIsInferring] = useState(false);
  const [activeRuleId, setActiveRuleId] = useState<string | undefined>();
  const [activeStepId, setActiveStepId] = useState<string | undefined>();

  const selectedAlgorithmData = algorithms.find(a => a.id === selectedAlgorithm);

  const handleInference = async () => {
    if (!expression.trim() || !selectedAlgorithm) return;
    
    setIsInferring(true);
    setActiveRuleId(undefined);
    setActiveStepId(undefined);
    
    try {
      const inferenceResult = await runInference(selectedAlgorithm, expression);
      setResult(inferenceResult);
    } catch (error) {
      console.error('Inference error:', error);
      setResult({
        success: false,
        error: 'An unexpected error occurred during type inference.',
        derivation: []
      });
    } finally {
      setIsInferring(false);
    }
  };

  const handleRuleClick = (ruleId: string) => {
    setActiveRuleId(activeRuleId === ruleId ? undefined : ruleId);
  };

  const handleStepClick = (stepId: string) => {
    setActiveStepId(activeStepId === stepId ? undefined : stepId);
    
    // Find the step and highlight corresponding rule
    const findStepRule = (steps: any[]): string | undefined => {
      for (const step of steps) {
        if (step.id === stepId) return step.ruleId;
        if (step.children) {
          const found = findStepRule(step.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    
    if (result?.derivation) {
      const ruleId = findStepRule(result.derivation);
      if (ruleId) setActiveRuleId(ruleId);
    }
  };

  // Auto-run inference when algorithm or expression changes
  useEffect(() => {
    if (expression.trim() && selectedAlgorithm) {
      const timer = setTimeout(() => {
        handleInference();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedAlgorithm, expression]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        {/* Main Content */}
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 max-w-7xl mx-auto">
            {/* Left Column - Input & Algorithm */}
            <div className="lg:col-span-2 space-y-6">
              <AlgorithmSelector
                algorithms={algorithms}
                selectedAlgorithm={selectedAlgorithm}
                onAlgorithmChange={setSelectedAlgorithm}
              />
              
              <ExpressionInput
                expression={expression}
                onExpressionChange={setExpression}
                onInfer={handleInference}
                isInferring={isInferring}
                selectedAlgorithm={selectedAlgorithm}
              />
            </div>

            {/* Right Columns - Derivation and Rules */}
            <div className="lg:col-span-4 space-y-6">
              {/* Derivation */}
              <DerivationViewer
                result={result}
                algorithm={selectedAlgorithmData}
                activeStepId={activeStepId}
                onStepClick={handleStepClick}
              />
              
              {/* Typing Rules */}
              {selectedAlgorithmData && (
                <TypingRules
                  rules={selectedAlgorithmData.rules}
                  activeRuleId={activeRuleId}
                  onRuleClick={handleRuleClick}
                />
              )}
            </div>
          </div>
          
          {/* Footnote */}
          <div className="mt-16 pt-8 border-t border-muted-foreground/20">
            <div className="text-center text-sm text-muted-foreground">
              Released under the{' '}
              <a 
                href="https://opensource.org/licenses/MIT" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                MIT License
              </a>
              .{' '}
              Copyright © 2025{' '}
              <a 
                href="https://cuichen.cc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Chen Cui
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};