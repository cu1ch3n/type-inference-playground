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
  } else if (algorithm === 'worklist') {
    return generateWorklistDerivation(cleanExpression);
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
      finalType: 'a \\to a',
      derivation: [
        {
          id: '1',
          ruleId: 'Lam',
          expression: '\\vdash \\lambda x.~x : a \\to a',
          children: [
            {
              id: '2',
              ruleId: 'Var',
              expression: 'x: a \\vdash x : a'
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
      finalType: 'a \\to b \\to a',
      derivation: [
        {
          id: '1',
          ruleId: 'Lam',
          expression: '\\vdash \\lambda x.~\\lambda y.~x : a \\to b \\to a',
          children: [
            {
              id: '2',
              ruleId: 'Lam',
              expression: 'x: a \\vdash \\lambda y.~x : b \\to a',
              children: [
                {
                  id: '3',
                  ruleId: 'Var',
                  expression: 'x: a, y: b \\vdash x : a'
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
      error: 'Cannot unify a with a \\to b (occurs check)',
      derivation: []
    };
  }

  // Function composition
  if (expression.match(/^\\f\.\s*\\g\.\s*\\x\.\s*f\s*\(\s*g\s+x\s*\)$/)) {
    return {
      success: true,
      finalType: '(b \\to c) \\to (a \\to b) \\to a \\to c',
      derivation: [
        {
          id: '1',
          ruleId: 'Lam',
          expression: '\\vdash \\lambda f.~\\lambda g.~\\lambda x.~f~(g~x) : (b \\to c) \\to (a \\to b) \\to a \\to c',
          children: [
            {
              id: '2',
              ruleId: 'Lam',
              expression: 'f: b \\to c \\vdash \\lambda g.~\\lambda x.~f~(g~x) : (a \\to b) \\to a \\to c',
              children: [
                {
                  id: '3',
                  ruleId: 'Lam',
                  expression: 'f: b \\to c, g: a \\to b \\vdash \\lambda x.~f~(g~x) : a \\to c',
                  children: [
                    {
                      id: '4',
                      ruleId: 'App',
                      expression: 'f: b \\to c, g: a \\to b, x: a \\vdash f~(g~x) : c',
                      children: [
                        {
                          id: '5',
                          ruleId: 'Var',
                          expression: 'f: b \\to c, g: a \\to b, x: a \\vdash f : b \\to c'
                        },
                        {
                          id: '6',
                          ruleId: 'App',
                          expression: 'f: b \\to c, g: a \\to b, x: a \\vdash g~x : b',
                          children: [
                            {
                              id: '7',
                              ruleId: 'Var',
                              expression: 'f: b \\to c, g: a \\to b, x: a \\vdash g : a \\to b'
                            },
                            {
                              id: '8',
                              ruleId: 'Var',
                              expression: 'f: b \\to c, g: a \\to b, x: a \\vdash x : a'
                            }
                          ]
                        }
                      ]
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
    finalType: 'a',
    derivation: [
      {
        id: '1',
        ruleId: 'Var',
        expression: `\\vdash ${expression} : a`
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
          ruleId: 'LamC',
          expression: '\\vdash \\lambda x.~x \\Leftarrow A \\rightarrow A',
          children: [
            {
              id: '2',
              ruleId: 'VarS',
              expression: 'x: A \\vdash x \\Rightarrow A'
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
        ruleId: 'VarS',
        expression: `\\vdash ${expression} \\Rightarrow A`
      }
    ]
  };
};

const generateWorklistDerivation = (expression: string): InferenceResult => {
  // Simple identity function
  if (expression.match(/^\\x\.\s*x$/)) {
    return {
      success: true,
      finalType: 'a \\to a',
      derivation: [
        {
          id: '1',
          ruleId: 'WLam',
          expression: 'Generate constraint: \\lambda x.~x : a \\to a'
        },
        {
          id: '2',
          ruleId: 'WVar',
          expression: 'Lookup variable: x : a'
        },
        {
          id: '3',
          ruleId: 'WUnify',
          expression: 'Unify constraints: a = a'
        }
      ]
    };
  }

  // Simple variable
  if (expression.match(/^[a-z]$/)) {
    return {
      success: true,
      finalType: 'a',
      derivation: [
        {
          id: '1',
          ruleId: 'WVar',
          expression: `Lookup variable: ${expression} : a`
        }
      ]
    };
  }

  // Function application
  if (expression.match(/^[a-z]\s+[a-z]$/)) {
    return {
      success: true,
      finalType: 'b',
      derivation: [
        {
          id: '1',
          ruleId: 'WApp',
          expression: `Generate constraint: ${expression} : b`
        },
        {
          id: '2',
          ruleId: 'WVar',
          expression: 'Lookup first variable: a \\to b'
        },
        {
          id: '3',
          ruleId: 'WVar',
          expression: 'Lookup second variable: a'
        },
        {
          id: '4',
          ruleId: 'WUnify',
          expression: 'Unify: (a \\to b) ~ (a \\to b)'
        }
      ]
    };
  }

  // Default case
  return {
    success: true,
    finalType: 'a',
    derivation: [
      {
        id: '1',
        ruleId: 'WVar',
        expression: `Process: ${expression} : a`
      }
    ]
  };
};