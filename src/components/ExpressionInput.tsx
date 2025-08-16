import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, RotateCcw, Code, Lightbulb, Loader2 } from 'lucide-react';
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
    <Card className="academic-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-4 h-4" />
          Input Program
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
            <Lightbulb className="w-3 h-3" />
            Examples
          </label>
          <Select value={selectedExample} onValueChange={handleExampleSelect}>
            <SelectTrigger className="w-full bg-card">
              <SelectValue placeholder="Choose an example..." />
            </SelectTrigger>
            <SelectContent>
              {currentExamples.map(example => (
                <SelectItem key={example.name} value={example.name}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{example.name}</span>
                    <span className="text-xs text-muted-foreground font-code">
                      {example.expression}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Expression
          </label>
          <div className="relative">
            <Textarea 
              value={expression} 
              onChange={e => onExpressionChange(e.target.value)} 
              placeholder="Please enter an expression. For example, (\x. x) 1" 
              className="font-code text-base bg-code min-h-[100px] resize-none pr-12" 
              spellCheck={false} 
            />
            <Button 
              onClick={onInfer} 
              disabled={!expression.trim() || isInferring} 
              size="sm" 
              className={`
                absolute bottom-2 right-2 h-8 w-8 p-0 
                transition-all duration-200 hover:scale-105 active:scale-95
                ${isInferring ? 'animate-pulse' : ''}
              `}
            >
              {isInferring ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleClear} 
            variant="outline" 
            size="sm" 
            className="text-xs"
            disabled={!expression.trim()}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>

        {selectedExample && (
          <div className="p-3 bg-algorithm rounded-lg">
            <p className="text-sm font-medium mb-1">
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