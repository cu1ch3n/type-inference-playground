import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, RotateCcw } from 'lucide-react';
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
        <CardTitle>Input Program</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Examples
          </label>
          <Select value={selectedExample} onValueChange={handleExampleSelect}>
            <SelectTrigger className="w-full bg-card">
              <SelectValue placeholder="Choose an example..." />
            </SelectTrigger>
            <SelectContent>
              {currentExamples.map((example) => (
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
              onChange={(e) => onExpressionChange(e.target.value)}
              placeholder="Enter a lambda expression (e.g., \x. x)"
              className="font-code text-base bg-code min-h-[100px] resize-none pr-12"
              spellCheck={false}
            />
            <Button 
              onClick={onInfer}
              disabled={!expression.trim() || isInferring}
              size="sm"
              className="absolute bottom-2 right-2 h-8 w-8 p-0"
            >
              <Play className="w-4 h-4" />
            </Button>
          </div>
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