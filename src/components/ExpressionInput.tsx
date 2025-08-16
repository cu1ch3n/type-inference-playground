import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, RotateCcw } from 'lucide-react';
import { exampleExpressions } from '@/data/algorithms';

interface ExpressionInputProps {
  expression: string;
  onExpressionChange: (expression: string) => void;
  onInfer: () => void;
  isInferring: boolean;
}

export const ExpressionInput = ({ 
  expression, 
  onExpressionChange, 
  onInfer,
  isInferring 
}: ExpressionInputProps) => {
  const [selectedExample, setSelectedExample] = useState<string>('');

  const handleExampleSelect = (exampleName: string) => {
    const example = exampleExpressions.find(e => e.name === exampleName);
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
        <CardTitle>Lambda Expression</CardTitle>
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
              {exampleExpressions.map((example) => (
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
          <Textarea
            value={expression}
            onChange={(e) => onExpressionChange(e.target.value)}
            placeholder="Enter a lambda expression (e.g., λx.x)"
            className="font-code text-base bg-code min-h-[100px] resize-none"
            spellCheck={false}
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={onInfer}
            disabled={!expression.trim() || isInferring}
            className="flex-1"
            variant="default"
          >
            <Play className="w-4 h-4 mr-2" />
            {isInferring ? 'Inferring...' : 'Infer Type'}
          </Button>
          
          <Button 
            onClick={handleClear}
            variant="outline"
            size="icon"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {selectedExample && (
          <div className="p-3 bg-algorithm rounded-lg">
            <p className="text-sm font-medium mb-1">
              {exampleExpressions.find(e => e.name === selectedExample)?.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {exampleExpressions.find(e => e.name === selectedExample)?.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};