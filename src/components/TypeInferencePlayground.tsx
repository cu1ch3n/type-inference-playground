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
import { analytics, performanceMonitor } from '@/lib/analytics';

export const TypeInferencePlayground = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('AlgW');
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<InferenceResult | undefined>();
  const [isInferring, setIsInferring] = useState(false);
  const [activeRuleId, setActiveRuleId] = useState<string | undefined>();
  const [activeStepId, setActiveStepId] = useState<string | undefined>();

  const selectedAlgorithmData = algorithms.find(a => a.id === selectedAlgorithm);

  const handleAlgorithmChange = (algorithm: string) => {
    setSelectedAlgorithm(algorithm);
    analytics.trackAlgorithmChange(algorithm);
  };

  const handleInference = async () => {
    if (!expression.trim() || !selectedAlgorithm) return;
    
    setIsInferring(true);
    setActiveRuleId(undefined);
    setActiveStepId(undefined);
    
    // Analytics tracking
    analytics.trackInferenceStart(selectedAlgorithm, expression.length);
    const endTiming = performanceMonitor.startTiming(`inference_${selectedAlgorithm}`);
    
    try {
      const inferenceResult = await runInference(selectedAlgorithm, expression);
      setResult(inferenceResult);
      
      if (inferenceResult.success) {
        analytics.trackInferenceSuccess(selectedAlgorithm, expression.length);
      } else {
        analytics.trackInferenceError(selectedAlgorithm, expression.length, inferenceResult.error || 'unknown');
      }
    } catch (error) {
      console.error('Inference error:', error);
      analytics.trackInferenceError(selectedAlgorithm, expression.length, 'exception');
      performanceMonitor.trackError(error as Error, 'inference');
      
      setResult({
        success: false,
        error: 'An unexpected error occurred during type inference.',
        derivation: []
      });
    } finally {
      endTiming();
      setIsInferring(false);
    }
  };

  const handleRuleClick = (ruleId: string) => {
    setActiveRuleId(activeRuleId === ruleId ? undefined : ruleId);
    analytics.trackRuleInteraction(ruleId);
  };

  const handleStepClick = (stepId: string) => {
    setActiveStepId(activeStepId === stepId ? undefined : stepId);
    analytics.trackStepInteraction(stepId);
    
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
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="grid grid-cols-1 xl:grid-cols-6 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {/* Left Column - Input & Algorithm */}
            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
              <AlgorithmSelector
                algorithms={algorithms}
                selectedAlgorithm={selectedAlgorithm}
                onAlgorithmChange={handleAlgorithmChange}
              />
              
              <ExpressionInput
                expression={expression}
                onExpressionChange={(expr) => {
                  setExpression(expr);
                  if (!expr.trim()) {
                    setResult(undefined);
                  }
                }}
                onInfer={handleInference}
                isInferring={isInferring}
                selectedAlgorithm={selectedAlgorithm}
              />
            </div>

            {/* Right Columns - Derivation and Rules */}
            <div className="xl:col-span-4 space-y-4 sm:space-y-6">
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