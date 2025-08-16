import { InferenceResult, DerivationStep } from '@/types/inference';

// Mock type inference for frontend-only demonstration
// This will be replaced with Haskell WASM integration later

export const mockAlgorithmW = (expression: string): InferenceResult => {
  // Simple pattern matching for demo purposes
  const expr = expression.trim();
  
  if (expr === 'λx.x') {
    return {
      success: true,
      finalType: '\\forall \\alpha. \\alpha \\rightarrow \\alpha',
      derivation: [
        {
          id: 'step-1',
          ruleId: 'abs',
          expression: '\\lambda x.x',
          type: '\\alpha \\rightarrow \\alpha',
          explanation: 'Apply abstraction rule',
          children: [
            {
              id: 'step-2',
              ruleId: 'var',
              expression: 'x',
              type: '\\alpha',
              explanation: 'Variable lookup in context {x : α}'
            }
          ]
        }
      ]
    };
  }
  
  if (expr === 'λx.λy.x') {
    return {
      success: true,
      finalType: '\\forall \\alpha \\beta. \\alpha \\rightarrow \\beta \\rightarrow \\alpha',
      derivation: [
        {
          id: 'step-1',
          ruleId: 'abs',
          expression: '\\lambda x.\\lambda y.x',
          type: '\\alpha \\rightarrow \\beta \\rightarrow \\alpha',
          explanation: 'Apply abstraction rule for x',
          children: [
            {
              id: 'step-2',
              ruleId: 'abs',
              expression: '\\lambda y.x',
              type: '\\beta \\rightarrow \\alpha',
              explanation: 'Apply abstraction rule for y',
              children: [
                {
                  id: 'step-3',
                  ruleId: 'var',
                  expression: 'x',
                  type: '\\alpha',
                  explanation: 'Variable lookup in context {x : α, y : β}'
                }
              ]
            }
          ]
        }
      ]
    };
  }
  
  if (expr === 'λf.λg.λx.f (g x)') {
    return {
      success: true,
      finalType: '\\forall \\alpha \\beta \\gamma. (\\beta \\rightarrow \\gamma) \\rightarrow (\\alpha \\rightarrow \\beta) \\rightarrow \\alpha \\rightarrow \\gamma',
      derivation: [
        {
          id: 'step-1',
          ruleId: 'abs',
          expression: '\\lambda f.\\lambda g.\\lambda x.f \\; (g \\; x)',
          type: '(\\beta \\rightarrow \\gamma) \\rightarrow (\\alpha \\rightarrow \\beta) \\rightarrow \\alpha \\rightarrow \\gamma',
          explanation: 'Function composition type',
          children: [
            {
              id: 'step-2',
              ruleId: 'app',
              expression: 'f \\; (g \\; x)',
              type: '\\gamma',
              explanation: 'Apply f to the result of (g x)',
              children: [
                {
                  id: 'step-3',
                  ruleId: 'var',
                  expression: 'f',
                  type: '\\beta \\rightarrow \\gamma',
                  explanation: 'Function f'
                },
                {
                  id: 'step-4',
                  ruleId: 'app',
                  expression: 'g \\; x',
                  type: '\\beta',
                  explanation: 'Apply g to x',
                  children: [
                    {
                      id: 'step-5',
                      ruleId: 'var',
                      expression: 'g',
                      type: '\\alpha \\rightarrow \\beta',
                      explanation: 'Function g'
                    },
                    {
                      id: 'step-6',
                      ruleId: 'var',
                      expression: 'x',
                      type: '\\alpha',
                      explanation: 'Variable x'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
  }
  
  if (expr === 'λx.x x') {
    return {
      success: false,
      error: 'Cannot unify type α with α → β. This expression applies a variable to itself, creating an infinite type.',
      derivation: []
    };
  }
  
  if (expr === 'λf.λx.f (f x)') {
    return {
      success: true,
      finalType: '\\forall \\alpha. (\\alpha \\rightarrow \\alpha) \\rightarrow \\alpha \\rightarrow \\alpha',
      derivation: [
        {
          id: 'step-1',
          ruleId: 'abs',
          expression: '\\lambda f.\\lambda x.f \\; (f \\; x)',
          type: '(\\alpha \\rightarrow \\alpha) \\rightarrow \\alpha \\rightarrow \\alpha',
          explanation: 'Church numeral 2',
          children: [
            {
              id: 'step-2',
              ruleId: 'app',
              expression: 'f \\; (f \\; x)',
              type: '\\alpha',
              explanation: 'Apply f twice',
              children: [
                {
                  id: 'step-3',
                  ruleId: 'var',
                  expression: 'f',
                  type: '\\alpha \\rightarrow \\alpha',
                  explanation: 'Function f with same input/output type'
                },
                {
                  id: 'step-4',
                  ruleId: 'app',
                  expression: 'f \\; x',
                  type: '\\alpha',
                  explanation: 'First application of f'
                }
              ]
            }
          ]
        }
      ]
    };
  }
  
  // Default case
  return {
    success: false,
    error: 'Expression not recognized in mock implementation. Try one of the examples.',
    derivation: []
  };
};

export const mockBidirectional = (expression: string): InferenceResult => {
  const expr = expression.trim();
  
  if (expr === 'λx.x') {
    return {
      success: true,
      finalType: '\\alpha \\rightarrow \\alpha',
      derivation: [
        {
          id: 'step-1',
          ruleId: 'abs-check',
          expression: '\\lambda x.x \\Leftarrow \\alpha \\rightarrow \\alpha',
          explanation: 'Check lambda against function type',
          children: [
            {
              id: 'step-2',
              ruleId: 'var-synth',
              expression: 'x \\Rightarrow \\alpha',
              explanation: 'Synthesize variable type from extended context'
            }
          ]
        }
      ]
    };
  }
  
  return mockAlgorithmW(expression);
};

export const runInference = (algorithmId: string, expression: string): Promise<InferenceResult> => {
  return new Promise((resolve) => {
    // Simulate async computation
    setTimeout(() => {
      switch (algorithmId) {
        case 'algorithm-w':
          resolve(mockAlgorithmW(expression));
          break;
        case 'bidirectional':
          resolve(mockBidirectional(expression));
          break;
        default:
          resolve({
            success: false,
            error: 'Unknown algorithm',
            derivation: []
          });
      }
    }, 500 + Math.random() * 1000); // Random delay for realism
  });
};