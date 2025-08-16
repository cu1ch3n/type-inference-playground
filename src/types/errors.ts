// Comprehensive error type definitions for type inference

export enum ErrorType {
  PARSING_ERROR = 'parsing_error',
  TYPE_ERROR = 'type_error', 
  SYNTAX_ERROR = 'syntax_error',
  UNIFICATION_ERROR = 'unification_error',
  SCOPE_ERROR = 'scope_error',
  UNSUPPORTED_FEATURE = 'unsupported_feature',
  RUNTIME_ERROR = 'runtime_error',
  WASM_ERROR = 'wasm_error',
  TIMEOUT_ERROR = 'timeout_error'
}

export interface ErrorLocation {
  line: number;
  column: number;
  length?: number;
}

export interface TypeInferenceError {
  type: ErrorType;
  message: string;
  location?: ErrorLocation;
  suggestions?: string[];
  context?: {
    expression?: string;
    expectedType?: string;
    actualType?: string;
    conflictingTypes?: [string, string];
  };
  code?: string; // Error code for localization/documentation
}

export interface ValidationResult {
  isValid: boolean;
  errors: TypeInferenceError[];
  warnings?: TypeInferenceError[];
}

export class InferenceErrorBuilder {
  static parsingError(message: string, location?: ErrorLocation): TypeInferenceError {
    return {
      type: ErrorType.PARSING_ERROR,
      message,
      location,
      suggestions: [
        "Check for balanced parentheses",
        "Verify lambda syntax: \\x. body",
        "Ensure proper application syntax: f x"
      ],
      code: "PARSE_001"
    };
  }

  static typeError(message: string, expected?: string, actual?: string, location?: ErrorLocation): TypeInferenceError {
    return {
      type: ErrorType.TYPE_ERROR,
      message,
      location,
      context: {
        expectedType: expected,
        actualType: actual
      },
      suggestions: [
        "Check the types of all subexpressions",
        "Verify function applications match parameter types",
        "Consider adding type annotations"
      ],
      code: "TYPE_001"
    };
  }

  static unificationError(type1: string, type2: string, location?: ErrorLocation): TypeInferenceError {
    return {
      type: ErrorType.UNIFICATION_ERROR,
      message: `Cannot unify types: ${type1} and ${type2}`,
      location,
      context: {
        conflictingTypes: [type1, type2]
      },
      suggestions: [
        "Check for type mismatches in function applications",
        "Verify that all branches of conditionals have the same type",
        "Consider if polymorphic types are being used correctly"
      ],
      code: "UNIF_001"
    };
  }

  static scopeError(variable: string, location?: ErrorLocation): TypeInferenceError {
    return {
      type: ErrorType.SCOPE_ERROR,
      message: `Unbound variable: ${variable}`,
      location,
      context: {
        expression: variable
      },
      suggestions: [
        "Check variable spelling",
        "Ensure variable is defined in scope",
        "Consider adding a lambda binding"
      ],
      code: "SCOPE_001"
    };
  }

  static unsupportedFeature(feature: string, location?: ErrorLocation): TypeInferenceError {
    return {
      type: ErrorType.UNSUPPORTED_FEATURE,
      message: `Unsupported language feature: ${feature}`,
      location,
      suggestions: [
        "Use simpler lambda calculus constructs",
        "Check algorithm documentation for supported features",
        "Consider using a different algorithm"
      ],
      code: "UNSUP_001"
    };
  }

  static syntaxError(message: string, location?: ErrorLocation): TypeInferenceError {
    return {
      type: ErrorType.SYNTAX_ERROR,
      message,
      location,
      suggestions: [
        "Check syntax against lambda calculus grammar",
        "Verify parentheses are balanced",
        "Ensure proper operator precedence"
      ],
      code: "SYNTAX_001"
    };
  }

  static wasmError(message: string): TypeInferenceError {
    return {
      type: ErrorType.WASM_ERROR,
      message: `WASM module error: ${message}`,
      suggestions: [
        "Check WASM module initialization",
        "Verify WASM files are properly loaded",
        "Fall back to JavaScript implementation"
      ],
      code: "WASM_001"
    };
  }

  static timeoutError(algorithm: string): TypeInferenceError {
    return {
      type: ErrorType.TIMEOUT_ERROR,
      message: `Inference timeout for algorithm: ${algorithm}`,
      suggestions: [
        "Simplify the expression",
        "Try a different algorithm",
        "Check for infinite recursion in types"
      ],
      code: "TIMEOUT_001"
    };
  }
}