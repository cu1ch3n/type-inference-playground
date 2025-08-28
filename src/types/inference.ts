// Type definitions for the type inference playground

export interface AlgorithmVariant {
  Id: string;
  Name: string;
  Description: string;
  Icon?: string;
}

export interface TypeInferenceAlgorithm {
  Id: string;
  Name: string;
  Labels: string[];
  ViewMode: 'tree' | 'linear';
  Mode: 'inference' | 'subtyping';
  Variants?: AlgorithmVariant[] | null;
  DefaultVariant?: string | null;
  Paper?: {
    Title: string;
    Authors: string[];
    Year: number;
    Url?: string;
  } | null;
  Rules: TypingRule[] | RuleSection[];
  RuleGroups?: RuleSection[] | null;
  VariantRules?: [string, (TypingRule[] | RuleSection[])][] | null;
}

export interface TypingRule {
  Id: string;
  Name: string;
  Premises: string[];
  Conclusion: string;
  Reduction?: string | null;
  Description?: string | null;
}

export interface RuleSection {
  Id: string;
  Name: string;
  Description?: string;
  Formula?: string;
  Rules: TypingRule[];
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

// Union type for all possible results
export type AlgorithmResult = InferenceResult | SubtypingResult;

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