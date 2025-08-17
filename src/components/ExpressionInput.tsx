import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, RotateCcw, Code, Lightbulb, Loader2 } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { algorithmExamples } from '@/data/algorithms';

interface ExpressionInputProps {
  expression: string;
  onExpressionChange: (expression: string) => void;
  onInfer: () => void;
  isInferring: boolean;
  selectedAlgorithm: string;
}

export const ExpressionInput = ({
  expression,
  onExpressionChange,
  onInfer,
  isInferring,
  selectedAlgorithm
}: ExpressionInputProps) => {
  const [selectedExample, setSelectedExample] = useState<string>('');
  const currentExamples = algorithmExamples[selectedAlgorithm] || [];

  const handleExampleSelect = (exampleName: string) => {
    const example = currentExamples.find(e => e.name === exampleName);
    if (example) {
      onExpressionChange(example.expression);
      setSelectedExample(exampleName);
    }
  };

  const handleClear = () => {
    onExpressionChange('');
    setSelectedExample('');
  };

  return (
    <Card className="academic-panel animate-fade-in hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Code className="w-4 h-4" />
          Input Program
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
        <div className="animate-slide-up">
          <label className="text-xs sm:text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
            <Lightbulb className="w-3 h-3" />
            Examples
          </label>
          <Select value={selectedExample} onValueChange={handleExampleSelect}>
            <SelectTrigger className="w-full bg-card focus-ring">
              <SelectValue placeholder="Choose an example..." />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {currentExamples.map(example => (
                <SelectItem key={example.name} value={example.name}>
                  <div className="flex flex-col items-start max-w-full">
                    <span className="font-medium text-xs sm:text-sm">{example.name}</span>
                    <span className="text-xs text-muted-foreground font-code truncate max-w-full">
                      {example.expression}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="animate-slide-up">
          <label className="text-xs sm:text-sm font-medium text-foreground mb-2 block">
            Expression
          </label>
          <div className="relative">
            <Textarea 
              value={expression} 
              onChange={e => onExpressionChange(e.target.value)} 
              placeholder="Please enter an expression. For example, (\x. x) 1" 
              className="font-code text-sm sm:text-base bg-code min-h-[80px] sm:min-h-[100px] resize-none pr-12 focus-ring" 
              spellCheck={false} 
            />
            <Button 
              onClick={onInfer} 
              disabled={!expression.trim() || isInferring} 
              size="sm" 
              className={`
                absolute bottom-2 right-2 h-7 w-7 sm:h-8 sm:w-8 p-0 
                transition-all duration-200 hover:scale-105 active:scale-95 focus-ring
                ${isInferring ? 'loading-pulse' : ''}
              `}
            >
              {isInferring ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Play className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-2 animate-slide-up">
          <Button 
            onClick={handleClear} 
            variant="outline" 
            size="sm" 
            className="text-xs focus-ring hover:scale-105 transition-all duration-200"
            disabled={!expression.trim()}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>

        {selectedExample && (
          <div className="p-2 sm:p-3 bg-algorithm rounded-lg animate-scale-in">
            <p className="text-xs sm:text-sm font-medium mb-1">
              {currentExamples.find(e => e.name === selectedExample)?.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentExamples.find(e => e.name === selectedExample)?.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};