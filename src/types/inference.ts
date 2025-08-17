// Type definitions for the type inference playground

export interface TypeInferenceAlgorithm {
  id: string;
  name: string;
  labels: string[];
  viewMode: 'tree' | 'linear';
  paper?: {
    title: string;
    authors: string[];
    year: number;
    url?: string;
  };
  rules: TypingRule[];
}

export interface TypingRule {
  id: string;
  name: string;
  premises: string[]; // KaTeX expressions
  conclusion: string; // KaTeX expression
  reduction?: string; // For worklist-style rules: "A → B"
}

export interface DerivationStep {
  ruleId: string;
  expression: string;
  children?: DerivationStep[];
}

export interface InferenceResult {
  success: boolean;
  finalType?: string;
  derivation: DerivationStep[];
  error?: string;
  errorLatex?: boolean;
}

export interface LambdaExpression {
  raw: string;
  parsed?: {
    type: 'variable' | 'lambda' | 'application';
    value: string;
    body?: LambdaExpression;
    argument?: LambdaExpression;
    function?: LambdaExpression;
  };
}