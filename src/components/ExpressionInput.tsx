import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, RotateCcw, Code, Lightbulb, Loader2, BookOpen } from 'lucide-react';
import { algorithmExamples } from '@/data/algorithms';
import { HelpModal } from './HelpModal';

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
  const [helpModalOpen, setHelpModalOpen] = useState(false);
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

  // Reset selected example when expression changes and doesn't match current example
  useEffect(() => {
    if (selectedExample) {
      const currentExample = currentExamples.find(e => e.name === selectedExample);
      if (currentExample && currentExample.expression !== expression) {
        setSelectedExample('');
      }
    }
  }, [expression, selectedExample, currentExamples]);

  return (
    <Card className="academic-panel hover-scale-sm transition-smooth">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Code className="w-5 h-5 text-primary transition-transform duration-200 hover:scale-110" />
          Input Program
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <label className="text-sm font-medium text-foreground mb-3 block flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-accent transition-transform duration-200 hover:scale-110" />
            Examples
          </label>
          <Select value={selectedExample} onValueChange={handleExampleSelect}>
            <SelectTrigger className="w-full bg-card transition-smooth hover:border-primary/50">
              <SelectValue placeholder="Choose an example..." />
            </SelectTrigger>
            <SelectContent className="animate-fade-in-scale">
              {currentExamples.map((example, index) => (
                <SelectItem 
                  key={example.name} 
                  value={example.name}
                  className="transition-fast hover:bg-accent/50"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
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

        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <label className="text-sm font-medium text-foreground mb-3 flex items-center justify-between">
            <span>Expression</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setHelpModalOpen(true)}
              className="h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-smooth"
            >
              <BookOpen className="w-3 h-3" />
            </Button>
          </label>
          <div className="relative">
            <Textarea 
              value={expression} 
              onChange={e => onExpressionChange(e.target.value)} 
              placeholder="Please enter an expression. For example, (\x. x) 1" 
              className="font-code text-sm sm:text-base bg-code min-h-[140px] sm:min-h-[120px] resize-none pr-20 border-muted-foreground/20 focus:border-primary transition-smooth focus:shadow-lg focus:shadow-primary/10 touch-manipulation" 
              spellCheck={false} 
            />
            {/* Clear button - top right */}
            {expression.trim() && (
              <Button 
                onClick={handleClear} 
                variant="ghost" 
                size="sm" 
                className="absolute top-2 right-2 h-7 w-7 sm:h-8 sm:w-8 p-0 opacity-60 hover:opacity-100 transition-smooth"
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 hover:rotate-180" />
              </Button>
            )}
            {/* Play button - bottom right */}
            <Button 
              onClick={onInfer} 
              disabled={!expression.trim() || isInferring} 
              size="sm" 
              className={`
                absolute bottom-2 right-2 h-7 w-7 sm:h-8 sm:w-8 p-0 
                btn-interactive transition-smooth touch-manipulation
                ${isInferring ? 'animate-pulse glow-primary' : 'hover:glow-primary'}
                ${!expression.trim() ? 'opacity-50' : ''}
              `}
            >
              {isInferring ? (
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <Play className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 hover:scale-110" />
              )}
            </Button>
          </div>
        </div>

        {selectedExample && (
          <div className="p-4 bg-algorithm rounded-lg border border-primary/20 transition-smooth hover:border-primary/40 hover-scale-sm animate-fade-in-up">
            <p className="text-sm font-medium mb-2 text-foreground">
              {currentExamples.find(e => e.name === selectedExample)?.name}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {currentExamples.find(e => e.name === selectedExample)?.description}
            </p>
          </div>
        )}
      </CardContent>
      
      <HelpModal open={helpModalOpen} onOpenChange={setHelpModalOpen} />
    </Card>
  );
};