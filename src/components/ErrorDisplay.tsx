import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Info, Lightbulb, X } from 'lucide-react';
import { TypeInferenceError, ErrorType } from '@/types/errors';

interface ErrorDisplayProps {
  errors: TypeInferenceError[];
  onDismiss?: (index: number) => void;
  className?: string;
}

const ErrorTypeConfig = {
  [ErrorType.PARSING_ERROR]: {
    icon: AlertTriangle,
    color: 'destructive',
    title: 'Parsing Error'
  },
  [ErrorType.TYPE_ERROR]: {
    icon: AlertTriangle,
    color: 'destructive',
    title: 'Type Error'
  },
  [ErrorType.SYNTAX_ERROR]: {
    icon: AlertTriangle,
    color: 'destructive',
    title: 'Syntax Error'
  },
  [ErrorType.UNIFICATION_ERROR]: {
    icon: AlertTriangle,
    color: 'destructive',
    title: 'Unification Error'
  },
  [ErrorType.SCOPE_ERROR]: {
    icon: AlertTriangle,
    color: 'destructive',
    title: 'Scope Error'
  },
  [ErrorType.UNSUPPORTED_FEATURE]: {
    icon: Info,
    color: 'secondary',
    title: 'Unsupported Feature'
  },
  [ErrorType.RUNTIME_ERROR]: {
    icon: AlertTriangle,
    color: 'destructive',
    title: 'Runtime Error'
  },
  [ErrorType.WASM_ERROR]: {
    icon: AlertTriangle,
    color: 'destructive',
    title: 'WASM Error'
  },
  [ErrorType.TIMEOUT_ERROR]: {
    icon: Info,
    color: 'secondary',
    title: 'Timeout Error'
  }
} as const;

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  errors,
  onDismiss,
  className = ''
}) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {errors.map((error, index) => {
        const config = ErrorTypeConfig[error.type] || ErrorTypeConfig[ErrorType.RUNTIME_ERROR];
        const Icon = config.icon;

        return (
          <Alert key={index} variant={config.color as any} className="relative">
            <Icon className="h-4 w-4" />
            
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0"
                onClick={() => onDismiss(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTitle className="text-sm font-medium">
                  {config.title}
                </AlertTitle>
                {error.code && (
                  <Badge variant="outline" className="text-xs">
                    {error.code}
                  </Badge>
                )}
              </div>

              <AlertDescription className="text-sm">
                {error.message}
              </AlertDescription>

              {error.location && (
                <div className="text-xs text-muted-foreground mt-1">
                  Line {error.location.line}, Column {error.location.column}
                  {error.location.length && ` (${error.location.length} characters)`}
                </div>
              )}

              {error.context && (
                <Card className="mt-2 bg-muted/50">
                  <CardHeader className="py-2">
                    <CardTitle className="text-xs">Context</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 text-xs space-y-1">
                    {error.context.expression && (
                      <div>
                        <span className="font-medium">Expression:</span> {error.context.expression}
                      </div>
                    )}
                    {error.context.expectedType && (
                      <div>
                        <span className="font-medium">Expected:</span> {error.context.expectedType}
                      </div>
                    )}
                    {error.context.actualType && (
                      <div>
                        <span className="font-medium">Actual:</span> {error.context.actualType}
                      </div>
                    )}
                    {error.context.conflictingTypes && (
                      <div>
                        <span className="font-medium">Conflicting types:</span>{' '}
                        {error.context.conflictingTypes[0]} and {error.context.conflictingTypes[1]}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {error.suggestions && error.suggestions.length > 0 && (
                <Card className="mt-2 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <CardHeader className="py-2">
                    <CardTitle className="text-xs flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" />
                      Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <ul className="text-xs space-y-1 list-disc list-inside text-blue-800 dark:text-blue-200">
                      {error.suggestions.map((suggestion, suggestionIndex) => (
                        <li key={suggestionIndex}>{suggestion}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </Alert>
        );
      })}
    </div>
  );
};

export default ErrorDisplay;