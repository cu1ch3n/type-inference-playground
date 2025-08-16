import { InferenceResult } from '@/types/inference';

export const runInference = async (algorithm: string, expression: string): Promise<InferenceResult> => {
  // Simulate async processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Clean and normalize the expression
  const cleanExpression = expression.trim().replace(/\s+/g, ' ');
  
  // Generate mock derivation based on expression pattern
  if (algorithm === 'algorithm-w') {
    return generateAlgorithmWDerivation(cleanExpression);
  } else if (algorithm === 'bidirectional') {
    return generateBidirectionalDerivation(cleanExpression);
  }
  
  return {
    success: false,
    error: 'Unsupported algorithm',
    derivation: []
  };
};

const generateAlgorithmWDerivation = (expression: string): InferenceResult => {
  // Simple identity function
  if (expression.match(/^\\x\.\s*x$/)) {
    return {
      success: true,
      finalType: '\\alpha \\rightarrow \\alpha',
      derivation: [
        {
          id: '1',
          ruleId: 'var',
          expression: 'x',
          type: '\\alpha',
          explanation: 'Variable lookup'
        },
        {
          id: '2', 
          ruleId: 'abs',
          expression: '\\lambda x. x',
          type: '\\alpha \\rightarrow \\alpha',
          children: [
            {
              id: '1',
              ruleId: 'var',
              expression: 'x', 
              type: '\\alpha'
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
      finalType: '\\alpha \\rightarrow \\beta \\rightarrow \\alpha',
      derivation: [
        {
          id: '1',
          ruleId: 'abs',
          expression: '\\lambda x. \\lambda y. x',
          type: '\\alpha \\rightarrow \\beta \\rightarrow \\alpha',
          children: [
            {
              id: '2',
              ruleId: 'abs', 
              expression: '\\lambda y. x',
              type: '\\beta \\rightarrow \\alpha',
              children: [
                {
                  id: '3',
                  ruleId: 'var',
                  expression: 'x',
                  type: '\\alpha'
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
      error: 'Cannot unify \\alpha with \\alpha \\rightarrow \\beta (occurs check)',
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
    finalType: '\\alpha',
    derivation: [
      {
        id: '1',
        ruleId: 'var',
        expression: expression,
        type: '\\alpha',
        explanation: 'Default type assignment'
      }
    ]
  };
};

const generateBidirectionalDerivation = (expression: string): InferenceResult => {
  // Simple identity function  
  if (expression.match(/^\\x\.\s*x$/)) {
    return {
      success: true,
      finalType: 'A \\rightarrow A',
      derivation: [
        {
          id: '1',
          ruleId: 'var-synth',
          expression: 'x',
          type: 'A'
        },
        {
          id: '2',
          ruleId: 'abs-check',
          expression: '\\lambda x. x', 
          type: 'A \\rightarrow A',
          children: [
            {
              id: '1',
              ruleId: 'var-synth',
              expression: 'x',
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
    derivation: [
      {
        id: '1',
        ruleId: 'var-synth',
        expression: expression,
        type: 'A'
      }
    ]
  };
};