import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Navbar } from './Navbar';
import { AlgorithmSelector } from './AlgorithmSelector';
import { ExpressionInput } from './ExpressionInput';
import { TypingRules } from './TypingRules';
import { WasmStatusIndicator } from './WasmStatusIndicator';
import { DerivationViewer } from './DerivationViewer';
import { algorithms } from '@/data/algorithms';
import { runInference } from '@/lib/mockInference';
import { InferenceResult } from '@/types/inference';

export const TypeInferencePlayground = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('W');
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<InferenceResult | undefined>();
  const [isInferring, setIsInferring] = useState(false);
  const [activeRuleId, setActiveRuleId] = useState<string | undefined>();
  const [activeStepPath, setActiveStepPath] = useState<number[] | undefined>();

  const selectedAlgorithmData = algorithms.find(a => a.id === selectedAlgorithm);

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
      // Find the first step that uses this rule and highlight it
      const findStepByRule = (steps: any[], basePath: number[] = []): number[] | undefined => {
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          const currentPath = [...basePath, i];
          console.log('Checking step at path:', currentPath, 'ruleId:', step.ruleId, 'target:', ruleId);
          if (step.ruleId === ruleId) {
            console.log('Found matching step at path:', currentPath);
            return currentPath;
          }
          if (step.children && step.children.length > 0) {
            const found = findStepByRule(step.children, currentPath);
            if (found) return found;
          }
        }
        return undefined;
      };
      
      if (result?.derivation) {
        const stepPath = findStepByRule(result.derivation);
        console.log('Final stepPath for rule', ruleId, ':', stepPath);
        if (stepPath) setActiveStepPath(stepPath);
      }
    } else {
      setActiveStepPath(undefined);
    }
  };

  const handleStepClick = (stepPath: number[]) => {
    console.log('Step clicked with path:', stepPath, 'Current activeStepPath:', activeStepPath);
    const isToggling = activeStepPath && activeStepPath.join('-') === stepPath.join('-');
    setActiveStepPath(isToggling ? undefined : stepPath);
    
    if (!isToggling) {
      // Find the step and highlight corresponding rule
      const findStepAtPath = (steps: any[], path: number[]): any | undefined => {
        console.log('findStepAtPath: steps length:', steps.length, 'path:', path);
        if (!path || path.length === 0) return undefined;
        
        let current = steps;
        for (let i = 0; i < path.length; i++) {
          const index = path[i];
          console.log('Looking for index', index, 'in current array of length', current.length);
          if (!current[index]) {
            console.log('Index not found:', index);
            return undefined;
          }
          
          if (i === path.length - 1) {
            console.log('Found step:', current[index]);
            return current[index];
          }
          
          current = current[index].children || [];
          console.log('Moving to children, new length:', current.length);
        }
        return undefined;
      };
      
      if (result?.derivation) {
        const step = findStepAtPath(result.derivation, stepPath);
        console.log('Found step at path:', stepPath, 'step:', step);
        if (step?.ruleId) {
          console.log('Setting activeRuleId to:', step.ruleId);
          setActiveRuleId(step.ruleId);
        }
      }
    } else {
      setActiveRuleId(undefined);
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Type Inference Playground</h1>
            <WasmStatusIndicator />
          </div>
          
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
            <div className="lg:col-span-4 space-y-6">
              {/* Derivation */}
              <DerivationViewer
                result={result}
                algorithm={selectedAlgorithmData}
                activeStepPath={activeStepPath}
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