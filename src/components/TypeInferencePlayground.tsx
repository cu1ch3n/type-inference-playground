import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Navbar } from './Navbar';
import { AlgorithmSelector } from './AlgorithmSelector';
import { ExpressionInput } from './ExpressionInput';
import { TypingRules } from './TypingRules';
import { WasmStatusIndicator } from './WasmStatusIndicator';
import { DerivationViewer } from './DerivationViewer';
import { ShareExportButtons } from './ShareExportButtons';
import { algorithms } from '@/data/algorithms';
import { runInference } from '@/lib/mockInference';
import { InferenceResult } from '@/types/inference';
import { getParamsFromUrl, updateUrlWithParams } from '@/lib/shareUtils';

export const TypeInferencePlayground = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('W');
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<InferenceResult | undefined>();
  const [isInferring, setIsInferring] = useState(false);
  const [activeRuleId, setActiveRuleId] = useState<string | undefined>();
  const [activeStepPath, setActiveStepPath] = useState<number[] | undefined>();
  const [initialized, setInitialized] = useState(false);

  const selectedAlgorithmData = algorithms.find(a => a.id === selectedAlgorithm);

  // Initialize from URL parameters
  useEffect(() => {
    const { algorithm, expression: urlExpression } = getParamsFromUrl();
    
    if (algorithm && algorithms.find(a => a.id === algorithm)) {
      setSelectedAlgorithm(algorithm);
    }
    
    if (urlExpression) {
      setExpression(urlExpression);
    }
    
    setInitialized(true);
  }, []);

  // Update URL when algorithm or expression changes (but not during initialization)
  useEffect(() => {
    if (initialized) {
      updateUrlWithParams(selectedAlgorithm, expression);
    }
  }, [selectedAlgorithm, expression, initialized]);

  const handleInference = async () => {
    if (!expression.trim() || !selectedAlgorithm) return;
    
    setIsInferring(true);
    setActiveRuleId(undefined);
    setActiveStepPath(undefined);
    
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
    const isToggling = activeRuleId === ruleId;
    setActiveRuleId(isToggling ? undefined : ruleId);
    
    if (!isToggling) {
      // Always clear step selection when clicking a rule
      setActiveStepPath(undefined);
      
      // Check if this rule is actually used in the derivation
      const isRuleUsedInDerivation = (steps: any[]): boolean => {
        for (const step of steps) {
          if (step.ruleId === ruleId) return true;
          if (step.children && isRuleUsedInDerivation(step.children)) return true;
        }
        return false;
      };
      
      if (result?.derivation) {
        if (isRuleUsedInDerivation(result.derivation)) {
          // Rule is used in derivation - set it as active (this will highlight all matching steps)
          setActiveRuleId(ruleId);
        } else {
          // Rule is not used in derivation - clear everything
          setActiveRuleId(undefined);
        }
      } else {
        // No derivation - clear everything
        setActiveRuleId(undefined);
      }
    } else {
      // Toggling off - clear everything
      setActiveStepPath(undefined);
      setActiveRuleId(undefined);
    }
  };

  const handleStepClick = (stepPath: number[]) => {
    const isToggling = activeStepPath && activeStepPath.join('-') === stepPath.join('-');
    
    if (isToggling) {
      // Toggling off - clear everything
      setActiveStepPath(undefined);
      setActiveRuleId(undefined);
    } else {
      // Setting new step - always set the step path
      setActiveStepPath(stepPath);
      
      // Find the step and set corresponding rule
      const findStepAtPath = (steps: any[], path: number[]): any | undefined => {
        if (!path || path.length === 0) return undefined;
        
        let current = steps;
        for (let i = 0; i < path.length; i++) {
          const index = path[i];
          if (!current[index]) return undefined;
          
          if (i === path.length - 1) {
            return current[index];
          }
          
          current = current[index].children || [];
        }
        return undefined;
      };
      
      if (result?.derivation) {
        const step = findStepAtPath(result.derivation, stepPath);
        if (step?.ruleId) {
          setActiveRuleId(step.ruleId);
        }
      }
    }
  };

  // Auto-run inference when algorithm or expression changes (only after initialization)
  useEffect(() => {
    if (initialized && expression.trim() && selectedAlgorithm) {
      const timer = setTimeout(() => {
        handleInference();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedAlgorithm, expression, initialized]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 max-w-7xl mx-auto">
            {/* Left Column - Input & Algorithm */}
            <div className="lg:col-span-2 space-y-8">
              <AlgorithmSelector
                algorithms={algorithms}
                selectedAlgorithm={selectedAlgorithm}
                onAlgorithmChange={setSelectedAlgorithm}
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
              
              {/* Share Button */}
              {selectedAlgorithmData && (
                <ShareExportButtons
                  algorithm={selectedAlgorithmData}
                  expression={expression}
                  disabled={isInferring}
                />
              )}
            </div>

            {/* Right Columns - Derivation and Rules */}
            <div className="lg:col-span-4 space-y-8">
              {/* Derivation */}
              <DerivationViewer
                result={result}
                algorithm={selectedAlgorithmData}
                activeStepPath={activeStepPath}
                activeRuleId={activeRuleId}
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
          <div className="mt-20 pt-8 border-t border-muted-foreground/20">
            <div className="text-center text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-4">
                <span>
                  Released under the{' '}
                  <a 
                    href="https://github.com/cu1ch3n/type-inference-zoo-wasm/blob/main/LICENSE" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline transition-colors duration-200"
                  >
                    MIT License
                  </a>
                </span>
                <span className="text-muted-foreground/50">•</span>
                <span>
                  Copyright © 2025{' '}
                  <a 
                    href="https://cuichen.cc" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline transition-colors duration-200"
                  >
                    Chen Cui
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};