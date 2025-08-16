// Enhanced expression parser with comprehensive error handling

import { ErrorType, InferenceErrorBuilder, TypeInferenceError, ErrorLocation } from '@/types/errors';

export interface ParsedExpression {
  type: 'variable' | 'lambda' | 'application' | 'annotation' | 'let';
  value: string;
  body?: ParsedExpression;
  argument?: ParsedExpression;
  function?: ParsedExpression;
  annotation?: string;
  location?: ErrorLocation;
}

export interface ParseResult {
  success: boolean;
  expression?: ParsedExpression;
  errors: TypeInferenceError[];
}

export class ExpressionParser {
  private input: string = '';
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;

  parse(input: string): ParseResult {
    this.input = input.trim();
    this.position = 0;
    this.line = 1;
    this.column = 1;

    if (!this.input) {
      return {
        success: false,
        errors: [InferenceErrorBuilder.syntaxError("Empty expression")]
      };
    }

    try {
      const expression = this.parseExpression();
      
      // Check for remaining input
      this.skipWhitespace();
      if (this.position < this.input.length) {
        return {
          success: false,
          errors: [InferenceErrorBuilder.syntaxError(
            `Unexpected token: ${this.input[this.position]}`,
            this.getCurrentLocation()
          )]
        };
      }

      return {
        success: true,
        expression,
        errors: []
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          errors: [InferenceErrorBuilder.parsingError(error.message, this.getCurrentLocation())]
        };
      }
      return {
        success: false,
        errors: [InferenceErrorBuilder.parsingError("Unknown parsing error")]
      };
    }
  }

  private getCurrentLocation(): ErrorLocation {
    return {
      line: this.line,
      column: this.column
    };
  }

  private parseExpression(): ParsedExpression {
    this.skipWhitespace();
    return this.parseApplication();
  }

  private parseApplication(): ParsedExpression {
    let expr = this.parseAtom();
    
    while (this.position < this.input.length) {
      this.skipWhitespace();
      if (this.position >= this.input.length || this.peek() === ')') {
        break;
      }
      
      const argument = this.parseAtom();
      expr = {
        type: 'application',
        value: '',
        function: expr,
        argument,
        location: this.getCurrentLocation()
      };
    }
    
    return expr;
  }

  private parseAtom(): ParsedExpression {
    this.skipWhitespace();
    
    if (this.position >= this.input.length) {
      throw new Error("Unexpected end of input");
    }

    const char = this.peek();
    
    if (char === '(') {
      return this.parseParenthesized();
    } else if (char === '\\' || char === 'λ') {
      return this.parseLambda();
    } else if (this.isIdentifierStart(char)) {
      return this.parseVariable();
    } else if (char === 'l' && this.input.substr(this.position, 3) === 'let') {
      return this.parseLet();
    } else {
      throw new Error(`Unexpected character: ${char}`);
    }
  }

  private parseParenthesized(): ParsedExpression {
    this.consume('(');
    this.skipWhitespace();
    
    if (this.peek() === ')') {
      throw new Error("Empty parentheses");
    }
    
    const expr = this.parseExpression();
    this.skipWhitespace();
    this.consume(')');
    
    return expr;
  }

  private parseLambda(): ParsedExpression {
    const startLocation = this.getCurrentLocation();
    
    // Consume lambda symbol
    if (this.peek() === '\\') {
      this.advance();
    } else if (this.peek() === 'λ') {
      this.advance();
    }
    
    this.skipWhitespace();
    
    // Parse parameter
    const parameter = this.parseIdentifier();
    this.skipWhitespace();
    
    // Consume dot
    if (this.peek() !== '.') {
      throw new Error("Expected '.' after lambda parameter");
    }
    this.advance();
    
    this.skipWhitespace();
    
    // Parse body
    const body = this.parseExpression();
    
    return {
      type: 'lambda',
      value: parameter,
      body,
      location: startLocation
    };
  }

  private parseVariable(): ParsedExpression {
    const startLocation = this.getCurrentLocation();
    const identifier = this.parseIdentifier();
    
    return {
      type: 'variable',
      value: identifier,
      location: startLocation
    };
  }

  private parseLet(): ParsedExpression {
    const startLocation = this.getCurrentLocation();
    
    // Consume 'let'
    this.advance(3);
    this.skipWhitespace();
    
    // Parse variable
    const variable = this.parseIdentifier();
    this.skipWhitespace();
    
    // Consume '='
    if (this.peek() !== '=') {
      throw new Error("Expected '=' in let expression");
    }
    this.advance();
    this.skipWhitespace();
    
    // Parse value expression
    const value = this.parseExpression();
    this.skipWhitespace();
    
    // Consume 'in'
    if (this.input.substr(this.position, 2) !== 'in') {
      throw new Error("Expected 'in' in let expression");
    }
    this.advance(2);
    this.skipWhitespace();
    
    // Parse body expression
    const body = this.parseExpression();
    
    return {
      type: 'let',
      value: variable,
      argument: value,
      body,
      location: startLocation
    };
  }

  private parseIdentifier(): string {
    let identifier = '';
    
    while (this.position < this.input.length && this.isIdentifierChar(this.peek())) {
      identifier += this.peek();
      this.advance();
    }
    
    if (!identifier) {
      throw new Error("Expected identifier");
    }
    
    return identifier;
  }

  private isIdentifierStart(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isIdentifierChar(char: string): boolean {
    return /[a-zA-Z0-9_']/.test(char);
  }

  private skipWhitespace(): void {
    while (this.position < this.input.length && /\s/.test(this.peek())) {
      if (this.peek() === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.position++;
    }
  }

  private peek(): string {
    return this.input[this.position] || '';
  }

  private advance(count: number = 1): void {
    for (let i = 0; i < count && this.position < this.input.length; i++) {
      if (this.input[this.position] === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.position++;
    }
  }

  private consume(expected: string): void {
    if (this.peek() !== expected) {
      throw new Error(`Expected '${expected}', got '${this.peek()}'`);
    }
    this.advance();
  }
}

// Validation utilities
export function validateExpression(input: string): import('@/types/errors').ValidationResult {
  const parser = new ExpressionParser();
  const result = parser.parse(input);
  
  return {
    isValid: result.success,
    errors: result.errors
  };
}

export function suggestCorrections(error: TypeInferenceError): string[] {
  const suggestions: string[] = [];
  
  switch (error.type) {
    case ErrorType.PARSING_ERROR:
      suggestions.push("Try: \\x. x (identity function)");
      suggestions.push("Try: (\\x. x) y (function application)");
      break;
    case ErrorType.SYNTAX_ERROR:
      suggestions.push("Check parentheses balance");
      suggestions.push("Use \\ or λ for lambda expressions");
      break;
    default:
      suggestions.push("Check the documentation for valid syntax");
  }
  
  return suggestions;
}