import { InferenceResult } from '@/types/inference';
import { wasmInference } from './wasmInterface';

export const runInference = async (algorithm: string, expression: string): Promise<InferenceResult> => {
  // Try WASM service first, fallback to mock if unavailable
  try {
    const wasmResult = await wasmInference.runInference({
      algorithm: algorithm.toLowerCase(),
      expression,
      options: { showSteps: true, maxDepth: 100 }
    });
    
    if (wasmResult.success && wasmResult.result) {
      return {
        success: true,
        finalType: wasmResult.result.type as string || 'unknown',
        derivation: wasmResult.steps?.map((step, index) => ({
          id: (index + 1).toString(),
          ruleId: (step as any).rule || 'Unknown',
          expression: (step as any).conclusion || `Step ${index + 1}`,
          children: (step as any).children
        })) || []
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
  if (algorithm === 'AlgW') {
    return generateAlgorithmWDerivation(cleanExpression);
  } else if (algorithm === 'WorklistDK') {
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
          ruleId: 'Abs',
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

  // Self application - should fail
  if (expression.match(/^\\x\.\s*x\s+x$/)) {
    return {
      success: false,
      error: 'Cannot unify a with a \\to b (occurs check)',
      derivation: []
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


const generateWorklistDerivation = (expression: string): InferenceResult => {
  // Identity function applied to 1: (\x. x) 1
  if (expression.match(/^\(\\x\.\s*x\)\s*1$/) || expression.match(/^\\x\.\s*x$/)) {
    return {
      success: true,
      finalType: '\\text{Int}',
      derivation: [
        {
          id: '1',
          ruleId: 'InfAnn',
          expression: "\\cdot \\vdash (\\lambda x.~x)~1 : \\text{Int} \\Rightarrow_a \\text{Out}(a)"
        },
        {
          id: '2',
          ruleId: 'ChkSub',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}) \\vdash (\\lambda x.~x)~1 \\Leftarrow \\text{Int}"
        },
        {
          id: '3',
          ruleId: 'InfApp',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}) \\vdash (\\lambda x.~x)~1 \\Rightarrow_a a \\le \\text{Int}"
        },
        {
          id: '4',
          ruleId: 'InfAbs',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}) \\vdash (\\lambda x.~x) \\Rightarrow_b (b \\bullet 1 \\mathrel{\\mathrlap{\\Rightarrow}\\phantom{~}\\Rightarrow}_a a \\le \\text{Int})"
        },
        {
          id: '5',
          ruleId: 'ChkSub',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}), \\hat{\\alpha}, \\hat{\\beta} \\vdash \\hat{\\alpha} \\to \\hat{\\beta} \\bullet 1 \\mathrel{\\mathrlap{\\Rightarrow}\\phantom{~}\\Rightarrow}_a a \\le \\text{Int}, x:\\hat{\\alpha} \\vdash x \\Leftarrow \\hat{\\beta}"
        },
        {
          id: '6',
          ruleId: 'InfVar',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}), \\hat{\\alpha}, \\hat{\\beta} \\vdash \\hat{\\alpha} \\to \\hat{\\beta} \\bullet 1 \\mathrel{\\mathrlap{\\Rightarrow}\\phantom{~}\\Rightarrow}_a a \\le \\text{Int}, x:\\hat{\\alpha} \\vdash x \\Rightarrow_b b \\le \\hat{\\beta}"
        },
        {
          id: '7',
          ruleId: 'InstLSolve ',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}), \\hat{\\alpha}, \\hat{\\beta} \\vdash \\hat{\\alpha} \\to \\hat{\\beta} \\bullet 1 \\mathrel{\\mathrlap{\\Rightarrow}\\phantom{~}\\Rightarrow}_a a \\le \\text{Int}, x:\\hat{\\alpha} \\vdash \\hat{\\alpha} \\le \\hat{\\beta}"
        },
        {
          id: '8',
          ruleId: 'GCVar',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}), \\hat{\\alpha} \\vdash \\hat{\\alpha} \\to \\hat{\\alpha} \\bullet 1 \\mathrel{\\mathrlap{\\Rightarrow}\\phantom{~}\\Rightarrow}_a a \\le \\text{Int}, x:\\hat{\\alpha}"
        },
        {
          id: '9',
          ruleId: 'InfAppArr',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}), \\hat{\\alpha} \\vdash \\hat{\\alpha} \\to \\hat{\\alpha} \\bullet 1 \\mathrel{\\mathrlap{\\Rightarrow}\\phantom{~}\\Rightarrow}_a a \\le \\text{Int}"
        },
        {
          id: '10',
          ruleId: 'ChkSub',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}), \\hat{\\alpha} \\vdash \\hat{\\alpha} \\le \\text{Int} \\vdash 1 \\Leftarrow \\hat{\\alpha}"
        },
        {
          id: '11',
          ruleId: 'InfUnit',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}), \\hat{\\alpha} \\vdash \\hat{\\alpha} \\le \\text{Int} \\vdash 1 \\Rightarrow_a a \\le \\hat{\\alpha}"
        },
        {
          id: '12',
          ruleId: 'InstLUnit',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}), \\hat{\\alpha} \\vdash \\hat{\\alpha} \\le \\text{Int} \\vdash \\text{Int} \\le \\hat{\\alpha}"
        },
        {
          id: '13',
          ruleId: 'SUnit',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int}) \\vdash \\text{Int} \\le \\text{Int}"
        },
        {
          id: '14',
          ruleId: 'Out',
          expression: "\\cdot \\vdash \\text{Out}(\\text{Int})"
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
          ruleId: 'InfVar',
          expression: `Process: ${expression} : a`
        }
    ]
  };
};