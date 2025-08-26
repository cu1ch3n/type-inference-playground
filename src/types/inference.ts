// Type definitions for the type inference playground

export interface AlgorithmVariant {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface TypeInferenceAlgorithm {
  id: string;
  name: string;
  labels: string[];
  viewMode: 'tree' | 'linear';
  mode: 'inference' | 'subtyping' | 'translate'; // Add translate mode
  variants?: AlgorithmVariant[];
  defaultVariant?: string;
  paper?: {
    title: string;
    authors: string[];
    year: number;
    url?: string;
  };
  rules: TypingRule[] | RuleSection[];
  variantRules?: Record<string, TypingRule[] | RuleSection[]>;
}

export interface TypingRule {
  id: string;
  name: string;
  premises: string[]; // KaTeX expressions
  conclusion: string; // KaTeX expression
  reduction?: string; // For worklist-style rules: "A → B"
}

export interface RuleSection {
  id: string;
  name: string;
  description?: string;
  formula?: string; // LaTeX formula showing the form (usually boxed)
  rules: TypingRule[];
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

// Add new interface for subtyping results
export interface SubtypingResult {
  success: boolean;
  finalType?: string; // The subtyping relationship
  derivation: DerivationStep[];
  error?: string;
  errorLatex?: boolean;
}

// Add new interface for translation results
export interface TranslationResult {
  success: boolean;
  finalType?: string; // The translated type
  derivation: DerivationStep[];
  error?: string;
  errorLatex?: boolean;
}

// Union type for all possible results
export type AlgorithmResult = InferenceResult | SubtypingResult | TranslationResult;

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