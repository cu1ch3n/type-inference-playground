import { InferenceResult } from '@/types/inference';

export const runInference = async (algorithm: string, expression: string): Promise<InferenceResult> => {
  // Simulate async processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Clean and normalize the expression
  const cleanExpression = expression.trim().replace(/\s+/g, ' ');
  
  // Generate mock derivation based on expression pattern
  if (algorithm === 'algorithm-w') {
    return generateAlgorithmWDerivation(cleanExpression);
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


// \begin{aligned}
//            & \nil \Vdash (\lam x)~() \Lto 1\\
// \rrule{18} & \nil \Vdash (\lam x)~() \To_a a\le 1\\
// \rrule{26} & \nil \Vdash (\lam x) \To_b (\appInfAlg{b}{()}[a][a\le 1])\\
// \rrule{25} & \nil,\al,\bt \Vdash \appInfAlg{\al\to\bt}{()}[a][a\le 1], x:\al \Vdash x\Lto \bt\\
// \rrule{18} & \nil,\al,\bt \Vdash \appInfAlg{\al\to\bt}{()}[a][a\le 1], x:\al \Vdash x\To_b b\le \bt\\
// \rrule{22} & \nil,\al,\bt \Vdash \appInfAlg{\al\to\bt}{()}[a][a\le 1], x:\al \Vdash \al\le \bt\\
// \rrule{12} & \nil,\al \Vdash \appInfAlg{\al\to\al}{()}[a][a\le 1], x:\al\\
// \rrule{3}  & \nil,\al \Vdash \appInfAlg{\al\to\al}{()}[a][a\le 1]\\
// \rrule{28} & \nil,\al \Vdash \al\le 1 \Vdash () \Lto \al\\
// \rrule{18} & \nil,\al \Vdash \al\le 1 \Vdash () \To_a a\le \al\\
// \rrule{24} & \nil,\al \Vdash \al\le 1 \Vdash 1\le \al\\
// \rrule{16} & \nil \Vdash 1\le 1\\
// \rrule{4}  & \nil
// \end{aligned}

const generateWorklistDerivation = (expression: string): InferenceResult => {
  // Simple identity function
  if (expression.match(/^\\x\.\s*x$/)) {
    return {
      success: true,
      finalType: '\\text{Int}',
      derivation: [
        {
          id: '0',
          ruleId: 'Inf',
          expression: "\\cdot \\vdash (\\lambda x.~x)~1 : \\text{Int} \\Rightarrow_a \\text{Out}(a)"
        },
        {
          id: '1',
          ruleId: 'InfAnn',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}) \\vdash (\\lambda x.~x)~1 \\Leftarrow \\text{Int}"
        },
        {
          id: '2',
          ruleId: 'ChkSub',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}) \\vdash (\\lambda x.~x)~1 \\Rightarrow_a a \\le \\text{Int}"
        },
        {
          id: '3',
          ruleId: 'InfApp',
          expression: "\\cdot \\vdash (\\lambda x.~x) \\Rightarrow_b (b \\bullet 1 \\mathrel{\\mathrlap{\\Rightarrow}\\phantom{~}\\Rightarrow}_a a \\le \\text{Int})"
        },
        {
          id: '4',
          ruleId: 'InfAbs',
          expression: "\\cdot, \\hat{\\alpha}, \\hat{\\beta} \\vdash [\\hat{\\alpha} \\to \\hat{\\beta}/b](\\hat{\\alpha} \\to \\hat{\\beta} \\bullet 1 \\mathrel{\\mathrlap{\\Rightarrow}\\phantom{~}\\Rightarrow}_a a \\le \\text{Int}), x:\\hat{\\alpha} \\vdash x \\Leftarrow \\hat{\\beta}"
        },
        {
          id: '5',
          ruleId: 'InfAppArr',
          expression: "\\cdot, \\hat{\\alpha}, \\hat{\\beta} \\vdash [\\hat{\\beta}/a](a \\le \\text{Int}) \\vdash 1 \\Leftarrow \\hat{\\alpha}"
        },
        {
          id: '6',
          ruleId: 'SExVar',
          expression: "\\cdot, \\hat{\\alpha}, \\hat{\\beta} \\vdash \\hat{\\beta} \\le \\text{Int} \\vdash 1 \\Leftarrow \\hat{\\alpha}"
        },
        {
          id: '7',
          ruleId: 'ChkSub',
          expression: "\\cdot, \\hat{\\alpha}, \\hat{\\beta} \\vdash \\hat{\\beta} \\le \\text{Int} \\vdash 1 \\Rightarrow_c c \\le \\hat{\\alpha}"
        },
        {
          id: '8',
          ruleId: 'InfAnn',
          expression: "\\cdot, \\hat{\\alpha}, \\hat{\\beta} \\vdash \\hat{\\beta} \\le \\text{Int} \\vdash [\\text{Int}/c](c \\le \\hat{\\alpha}) \\vdash 1 \\Leftarrow \\text{Int}"
        },
        {
          id: '9',
          ruleId: 'InstRUnit',
          expression: "\\cdot, \\hat{\\alpha}, \\hat{\\beta} \\vdash \\hat{\\beta} \\le \\text{Int} \\vdash \\text{Int} \\le \\hat{\\alpha} \\vdash 1 \\Leftarrow \\text{Int}"
        },
        {
          id: '10',
          ruleId: 'InstRReach',
          expression: "\\cdot, \\hat{\\beta} \\vdash \\hat{\\beta} \\le \\text{Int} \\vdash 1 \\Leftarrow \\text{Int}"
        },
        {
          id: '11',
          ruleId: 'ChkSub',
          expression: "x:\\text{Int} \\vdash x \\Rightarrow_d d \\le \\text{Int}"
        },
        {
          id: '12',
          ruleId: 'InfVar',
          expression: "x:\\text{Int} \\vdash [\\text{Int}/d](d \\le \\text{Int})"
        },
        {
          id: '13',
          ruleId: 'SExVar',
          expression: "x:\\text{Int} \\vdash \\text{Int} \\le \\text{Int}"
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