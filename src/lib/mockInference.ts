import { InferenceResult } from '@/types/inference';
import { algorithms } from '@/data/algorithms';

export const runInference = async (algorithmId: string, expression: string): Promise<InferenceResult> => {
  // Simulate async processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const algorithm = algorithms.find(a => a.id === algorithmId);
  const cleanExpression = expression.trim().replace(/\s+/g, ' ');
  
  // Generate mock derivation based on expression pattern
  if (algorithmId === 'algorithm-w') {
    return generateAlgorithmWDerivation(cleanExpression, algorithm);
  } else if (algorithmId === 'bidirectional') {
    return generateBidirectionalDerivation(cleanExpression, algorithm);
  } else if (algorithmId === 'worklist') {
    return generateWorklistDerivation(cleanExpression, algorithm);
  }
  
  return {
    success: false,
    error: 'Unsupported algorithm',
    derivation: [],
    algorithm
  };
};

const generateAlgorithmWDerivation = (expression: string, algorithm?: any): InferenceResult => {
  // Simple identity function - correct tree structure as requested
  if (expression.match(/^\\x\.\s*x$/)) {
    return {
      success: true,
      finalType: 'a1 -> a1',
      algorithm,
      derivation: [
        {
          id: '1',
          ruleId: 'lam',
          expression: '|- \\lambda x. x : a1 -> a1',
          type: 'a1 -> a1',
          children: [
            {
              id: '2',
              ruleId: 'var',
              expression: 'x: a1 |- x : a1',
              type: 'a1'
            }
          ]
        }
      ]
    };
  }

  // Constant function
  if (expression.match(/^\\x\.\s*\\y\.\s*x$/)) {
    return {
      success: true,
      finalType: 'a1 -> a2 -> a1',
      algorithm,
      derivation: [
        {
          id: '1',
          ruleId: 'lam',
          expression: '|- \\lambda x. \\lambda y. x : a1 -> a2 -> a1',
          type: 'a1 -> a2 -> a1',
          children: [
            {
              id: '2',
              ruleId: 'lam', 
              expression: 'x: a1 |- \\lambda y. x : a2 -> a1',
              type: 'a2 -> a1',
              children: [
                {
                  id: '3',
                  ruleId: 'var',
                  expression: 'x: a1, y: a2 |- x : a1',
                  type: 'a1'
                }
              ]
            }
          ]
        }
      ]
    };
  }

  // Self application - should fail
  if (expression.match(/^\\x\.\s*x\s+x$/)) {
    return {
      success: false,
      error: 'Cannot unify a1 with a1 -> a2 (occurs check)',
      algorithm,
      derivation: []
    };
  }

  // Function composition
  if (expression.match(/^\\f\.\s*\\g\.\s*\\x\.\s*f\s*\(\s*g\s+x\s*\)$/)) {
    return {
      success: true,
      finalType: '(\\beta \\rightarrow \\gamma) \\rightarrow (\\alpha \\rightarrow \\beta) \\rightarrow \\alpha \\rightarrow \\gamma',
      derivation: [
        {
          id: '1',
          ruleId: 'abs',
          expression: '\\lambda f. \\lambda g. \\lambda x. f (g x)',
          type: '(\\beta \\rightarrow \\gamma) \\rightarrow (\\alpha \\rightarrow \\beta) \\rightarrow \\alpha \\rightarrow \\gamma',
          children: [
            {
              id: '2',
              ruleId: 'app',
              expression: 'f (g x)',
              type: '\\gamma',
              children: [
                {
                  id: '3',
                  ruleId: 'var',
                  expression: 'f',
                  type: '\\beta \\rightarrow \\gamma'
                },
                {
                  id: '4',
                  ruleId: 'app',
                  expression: 'g x',
                  type: '\\beta',
                  children: [
                    {
                      id: '5',
                      ruleId: 'var',
                      expression: 'g',
                      type: '\\alpha \\rightarrow \\beta'
                    },
                    {
                      id: '6',
                      ruleId: 'var',
                      expression: 'x',
                      type: '\\alpha'
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

  // Default case - generate simple derivation
  return {
    success: true,
    finalType: 'a1',
    algorithm,
    derivation: [
      {
        id: '1',
        ruleId: 'var',
        expression: `|- ${expression} : a1`,
        type: 'a1'
      }
    ]
  };
};

const generateBidirectionalDerivation = (expression: string, algorithm?: any): InferenceResult => {
  // Simple identity function  
  if (expression.match(/^\\x\.\s*x$/)) {
    return {
      success: true,
      finalType: 'A -> A',
      algorithm,
      derivation: [
        {
          id: '1',
          ruleId: 'lam',
          expression: '|- \\lambda x. x <= A -> A',
          type: 'A -> A',
          children: [
            {
              id: '2',
              ruleId: 'var',
              expression: 'x: A |- x => A',
              type: 'A'
            }
          ]
        }
      ]
    };
  }

  // Default case
  return {
    success: true,
    finalType: 'A',
    algorithm,
    derivation: [
      {
        id: '1',
        ruleId: 'var',
        expression: `|- ${expression} => A`,
        type: 'A'
      }
    ]
  };
};

const generateWorklistDerivation = (expression: string, algorithm?: any): InferenceResult => {
  // Worklist algorithm returns linear derivation
  if (expression === 'x') {
    return {
      success: true,
      finalType: 'a1',
      algorithm,
      derivation: [
        {
          id: 'step1',
          ruleId: 'gen',
          expression: 'x',
          type: 'a1',
          explanation: 'Generate constraint: x : a1'
        },
        {
          id: 'step2',
          ruleId: 'solve',
          expression: 'x : a1',
          type: 'a1',
          explanation: 'Solve constraint: x : a1 → a1'
        }
      ]
    };
  } else if (expression === 'f x') {
    return {
      success: true,
      finalType: 'a3',
      algorithm,
      derivation: [
        {
          id: 'step1',
          ruleId: 'gen',
          expression: 'f',
          type: 'a1',
          explanation: 'Generate: f : a1'
        },
        {
          id: 'step2',
          ruleId: 'gen',
          expression: 'x',
          type: 'a2',
          explanation: 'Generate: x : a2'
        },
        {
          id: 'step3',
          ruleId: 'gen',
          expression: 'f x',
          type: 'a3',
          explanation: 'Generate: a1 ~ a2 -> a3'
        },
        {
          id: 'step4',
          ruleId: 'unify',
          expression: 'a1 ~ a2 -> a3',
          type: 'a2 -> a3',
          explanation: 'Unify: a1 = a2 -> a3'
        }
      ]
    };
  }

  // Default case
  return {
    success: true,
    finalType: 'a1',
    algorithm,
    derivation: [
      {
        id: 'step1',
        ruleId: 'gen',
        expression: expression,
        type: 'a1',
        explanation: `Generate: ${expression} : a1`
      }
    ]
  };
};