// Type definitions for the type inference playground

export interface TypeInferenceAlgorithm {
  id: string;
  name: string;
  description: string;
  labels: string[];
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
}

export interface DerivationStep {
  id: string;
  ruleId: string;
  expression: string;
  type?: string;
  children?: DerivationStep[];
  explanation?: string;
}

export interface InferenceResult {
  success: boolean;
  finalType?: string;
  derivation: DerivationStep[];
  error?: string;
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