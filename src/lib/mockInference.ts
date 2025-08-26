import { InferenceResult, SubtypingResult, AlgorithmResult } from '@/types/inference';
import { wasmInference } from './wasmInterface';

export const runInference = async (algorithm: string, expression: string): Promise<InferenceResult> => {
  // Try WASM service first, fallback to mock if unavailable
  try {
    const wasmResult = await wasmInference.runInference({
      algorithm: algorithm,
      expression,
      options: { showSteps: true, maxDepth: 100 }
    });
    
    if (wasmResult.result) {
      const result = wasmResult.result as any;
      return {
        success: result.success || false,
        finalType: result.finalType,
        derivation: result.derivation || [],
        error: result.error,
        errorLatex: result.errorLatex || false
      };
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('WASM service unavailable, using mock:', error);
  }
  
  // Fallback to mock inference
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Clean and normalize the expression
  const cleanExpression = expression.trim().replace(/\s+/g, ' ');
  
  // Generate mock derivation based on expression pattern
  if (algorithm === 'W') {
    return generateAlgorithmWDerivation(cleanExpression);
  } else if (algorithm === 'Worklist') {
    return generateWorklistDerivation(cleanExpression);
  }
  
  return {
    success: false,
    error: 'Unsupported algorithm',
    derivation: []
  };
};

export const runSubtyping = async (algorithm: string, variant: string, leftType: string, rightType: string): Promise<SubtypingResult> => {
  // Try WASM service first, fallback to mock if unavailable
  try {
    const wasmResult = await wasmInference.runSubtyping({
      algorithm,
      variant,
      leftType,
      rightType,
      options: { showSteps: true, maxDepth: 100 }
    });
    
    if (wasmResult.result) {
      const result = wasmResult.result as any;
      return {
        success: result.success || false,
        finalType: result.finalType,
        derivation: result.derivation || [],
        error: result.error,
        errorLatex: result.errorLatex || false
      };
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('WASM service unavailable, using mock:', error);
  }
  
  // Fallback to mock subtyping
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate mock subtyping derivation
  if (algorithm === 'Subtyping') {
    return generateSubtypingDerivation(leftType, rightType, variant);
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
          ruleId: 'Abs',
          expression: '\\vdash \\lambda x.~x : a \\to a',
          children: [
            {
              ruleId: 'Var',
              expression: 'x: a \\vdash x : a'
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
      error: 'a1 occurs in a_{1} \\to b_{2}',
      derivation: [
        {
          ruleId: 'Debug',
          expression: ' \\vdash \\lambda x.~x~x',
          children: []
        },
        {
          ruleId: 'Debug', 
          expression: 'x: a_{1} \\vdash x~x',
          children: []
        },
        {
          ruleId: 'Debug',
          expression: 'x: a_{1} \\vdash x',
          children: []
        },
        {
          ruleId: 'Debug',
          expression: 'x: a_{1} \\vdash x : a_{1}, \\emptyset',
          children: []
        },
        {
          ruleId: 'Debug',
          expression: 'x: a_{1} \\vdash x',
          children: []
        },
        {
          ruleId: 'Debug',
          expression: 'x: a_{1} \\vdash x : a_{1}, \\emptyset',
          children: []
        },
        {
          ruleId: 'Debug',
          expression: 'Unifying: a_{1} ~ a_{1} \\to b_{2}',
          children: []
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
        ruleId: 'Var',
        expression: `\\vdash ${expression} : a`
      }
    ]
  };
};


const generateWorklistDerivation = (expression: string): InferenceResult => {
  // Identity function applied to 1: (\x. x) 1
  if (expression.match(/^\(\\x\.\s*x\)\s*1$/) || expression.match(/^\\x\.\s*x$/)) {
    return {
      success: true,
      finalType: '\\text{Int}',
      derivation: [
        {
          ruleId: 'InfAnn',
          expression: "\\cdot \\vdash (\\lambda x.~x)~1 : \\text{Int} \\Rightarrow_a \\text{Out}(a)"
        },
        {
          ruleId: 'ChkSub',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}) \\vdash (\\lambda x.~x)~1 \\Leftarrow \\text{Int}"
        },
        {
          ruleId: 'InfApp',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}) \\vdash (\\lambda x.~x)~1 \\Rightarrow_a a \\le \\text{Int}"
        },
        {
          ruleId: 'InfAbs',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}) \\vdash (\\lambda x.~x) \\Rightarrow_b (b \\bullet 1 \\mathrel{\\mathrlap{\\Rightarrow}\\phantom{~}\\Rightarrow}_a a \\le \\text{Int})"
        },
        {
          ruleId: 'ChkSub',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}), \\hat{\\alpha}, \\hat{\\beta} \\vdash \\hat{\\alpha} \\to \\hat{\\beta} \\bullet 1 \\mathrel{\\mathrlap{\\Rightarrow}\\phantom{~}\\Rightarrow}_a a \\le \\text{Int}, x:\\hat{\\alpha} \\vdash x \\Leftarrow \\hat{\\beta}"
        },
        {
          ruleId: 'InfVar',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}), \\hat{\\alpha}, \\hat{\\beta} \\vdash \\hat{\\alpha} \\to \\hat{\\beta} \\bullet 1 \\mathrel{\\mathrlap{\\Rightarrow}\\phantom{~}\\Rightarrow}_a a \\le \\text{Int}, x:\\hat{\\alpha} \\vdash x \\Rightarrow_b b \\le \\hat{\\beta}"
        },
        {
          ruleId: 'InstLSolve',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}), \\hat{\\alpha}, \\hat{\\beta} \\vdash \\hat{\\alpha} \\to \\hat{\\beta} \\bullet 1 \\mathrel{\\mathrlap{\\Rightarrow}\\phantom{~}\\Rightarrow}_a a \\le \\text{Int}, x:\\hat{\\alpha} \\vdash \\hat{\\alpha} \\le \\hat{\\beta}"
        },
        {
          ruleId: 'GCVar',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}), \\hat{\\alpha} \\vdash \\hat{\\alpha} \\to \\hat{\\alpha} \\bullet 1 \\mathrel{\\mathrlap{\\Rightarrow}\\phantom{~}\\Rightarrow}_a a \\le \\text{Int}, x:\\hat{\\alpha}"
        },
        {
          ruleId: 'InfAppArr',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}), \\hat{\\alpha} \\vdash \\hat{\\alpha} \\to \\hat{\\alpha} \\bullet 1 \\mathrel{\\mathrlap{\\Rightarrow}\\phantom{~}\\Rightarrow}_a a \\le \\text{Int}"
        },
        {
          ruleId: 'ChkSub',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}), \\hat{\\alpha} \\vdash \\hat{\\alpha} \\le \\text{Int} \\vdash 1 \\Leftarrow \\hat{\\alpha}"
        },
        {
          ruleId: 'InfUnit',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}), \\hat{\\alpha} \\vdash \\hat{\\alpha} \\le \\text{Int} \\vdash 1 \\Rightarrow_a a \\le \\hat{\\alpha}"
        },
        {
          ruleId: 'InstLUnit',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}), \\hat{\\alpha} \\vdash \\hat{\\alpha} \\le \\text{Int} \\vdash \\text{Int} \\le \\hat{\\alpha}"
        },
        {
          ruleId: 'SUnit',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}) \\vdash \\text{Int} \\le \\text{Int}"
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
          ruleId: 'InfVar',
          expression: `Process: ${expression} : a`
        }
    ]
  };
};

const generateSubtypingDerivation = (leftType: string, rightType: string, variant: string): SubtypingResult => {
  // Check if it's a recursive subtyping example
  if (leftType.includes('mu a.') && rightType.includes('mu a.')) {
    return {
      success: true,
      finalType: `${leftType} <: ${rightType}`,
      derivation: [
        {
          ruleId: 'Info',
          expression: `\\text{Recursive Subtyping: } ${leftType} <: ${rightType}`,
          children: []
        },
        {
          ruleId: 'Info',
          expression: `\\text{Derive: } ${leftType} <: ${rightType}`,
          children: []
        },
        {
          ruleId: 'Info',
          expression: `\\text{Derive: } ${leftType.replace('mu a.', '')} <: ${rightType.replace('mu a.', '')}`,
          children: []
        },
        {
          ruleId: 'S-top',
          expression: `${leftType.replace('mu a.', '')} <: \\top`,
          children: []
        },
        {
          ruleId: 'S-int',
          expression: `\\texttt{Int} <: \\texttt{Int}`,
          children: []
        },
        {
          ruleId: 'S-arrow',
          expression: `${leftType.replace('mu a.', '')} <: ${rightType.replace('mu a.', '')}`,
          children: [
            {
              ruleId: 'S-top',
              expression: `${leftType.replace('mu a.', '')} <: \\top`,
              children: []
            },
            {
              ruleId: 'S-int',
              expression: `\\texttt{Int} <: \\texttt{Int}`,
              children: []
            }
          ]
        },
        {
          ruleId: 'S-mu',
          expression: `${leftType} <: ${rightType}`,
          children: [
            {
              ruleId: 'S-arrow',
              expression: `${leftType.replace('mu a.', '')} <: ${rightType.replace('mu a.', '')}`,
              children: [
                {
                  ruleId: 'S-top',
                  expression: `${leftType.replace('mu a.', '')} <: \\top`,
                  children: []
                },
                {
                  ruleId: 'S-int',
                  expression: `\\texttt{Int} <: \\texttt{Int}`,
                  children: []
                }
              ]
            }
          ]
        }
      ]
    };
  }
  
  // Basic subtyping examples
  if (leftType === 'Int' && rightType === 'Top') {
    return {
      success: true,
      finalType: 'Int <: Top',
      derivation: [
        {
          ruleId: 'S-top',
          expression: 'Int <: Top',
          children: []
        }
      ]
    };
  }
  
  // Default case
  return {
    success: true,
    finalType: `${leftType} <: ${rightType}`,
    derivation: [
      {
        ruleId: 'S-top',
        expression: `${leftType} <: ${rightType}`,
        children: []
      }
    ]
  };
};