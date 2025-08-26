import { useState, useEffect, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, RotateCcw, Code, Lightbulb, Loader2, HelpCircle, ArrowRight } from 'lucide-react';
import { algorithmExamples, subtypingExamples, translateExamples, allAlgorithms } from '@/data/algorithms';
import { HelpModal } from './HelpModal';

interface ExpressionInputProps {
  expression: string;
  onExpressionChange: (expression: string) => void;
  onInfer: () => void;
  isInferring: boolean;
  selectedAlgorithm: string;
  selectedVariant?: string;
}

export const ExpressionInput = forwardRef<HTMLTextAreaElement, ExpressionInputProps>(({ 
  expression,
  onExpressionChange,
  onInfer,
  isInferring,
  selectedAlgorithm,
  selectedVariant
}, ref) => {
  const [selectedExample, setSelectedExample] = useState<string>('');
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [leftType, setLeftType] = useState<string>('');
  const [rightType, setRightType] = useState<string>('');
  
  const selectedAlgorithmData = allAlgorithms.find(a => a.id === selectedAlgorithm);
  const isSubtypingMode = selectedAlgorithmData?.mode === 'subtyping';
  const isTranslateMode = selectedAlgorithmData?.mode === 'translate';
  
  // Use appropriate examples based on mode
  const currentExamples = isSubtypingMode 
    ? (subtypingExamples[selectedAlgorithm as keyof typeof subtypingExamples] || [])
    : isTranslateMode
      ? (translateExamples[selectedAlgorithm as keyof typeof translateExamples] || [])
      : (algorithmExamples[selectedAlgorithm as keyof typeof algorithmExamples] || []);

  const handleExampleSelect = (exampleName: string) => {
    const example = currentExamples.find(e => e.name === exampleName);
    if (example) {
      if (isSubtypingMode) {
        const parts = example.expression.split(' <: ');
        if (parts.length === 2) {
          setLeftType(parts[0].trim());
          setRightType(parts[1].trim());
          onExpressionChange(`${parts[0].trim()} <: ${parts[1].trim()}`);
        } else {
          setLeftType(example.expression);
          setRightType('');
          onExpressionChange(example.expression);
        }
      } else {
        onExpressionChange(example.expression);
      }
      setSelectedExample(exampleName);
    }
  };

  const handleClear = () => {
    onExpressionChange('');
    setSelectedExample('');
    if (isSubtypingMode) {
      setLeftType('');
      setRightType('');
    }
  };

  useEffect(() => {
    if (selectedExample) {
      const currentExample = currentExamples.find(e => e.name === selectedExample);
      if (currentExample && currentExample.expression !== expression) {
        setSelectedExample('');
      }
    }
  }, [expression, selectedExample, currentExamples]);

  // Update expression when left/right types change in subtyping mode
  useEffect(() => {
    if (isSubtypingMode && (leftType || rightType)) {
      const newExpression = leftType && rightType ? `${leftType} <: ${rightType}` : leftType || rightType;
      onExpressionChange(newExpression);
    }
  }, [leftType, rightType, isSubtypingMode, onExpressionChange]);

  // Parse existing expression into left/right types for subtyping
  useEffect(() => {
    if (isSubtypingMode && expression && expression.includes(' <: ')) {
      const parts = expression.split(' <: ');
      if (parts.length === 2) {
        setLeftType(parts[0].trim());
        setRightType(parts[1].trim());
      }
    }
  }, [expression, isSubtypingMode]);

  if (isSubtypingMode) {
    return (
      <Card className="academic-panel hover-scale-sm transition-smooth">
        <CardHeader className="pb-2 sm:pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Code className="w-4 h-4 text-primary" />
            Subtyping Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <Select value={selectedExample} onValueChange={handleExampleSelect}>
              <SelectTrigger className="w-full bg-card transition-smooth hover:border-primary/50">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Choose an example..." />
                </div>
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
            <div className="space-y-3">
              {/* Left Type Input */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setHelpModalOpen(true)}
                  className="absolute bottom-2 left-2 h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-smooth z-10"
                >
                  <HelpCircle className="w-3 h-3" />
                </Button>
                <Textarea 
                  value={leftType} 
                  onChange={e => setLeftType(e.target.value)} 
                  placeholder="Left type (e.g., Int, Top -> Int, mu a. a -> Int)" 
                  className="font-code text-xs sm:text-sm bg-code min-h-[80px] resize-none pr-20 pl-8 border-muted-foreground/20 focus:border-primary transition-smooth focus:shadow-lg focus:shadow-primary/10 touch-manipulation" 
                  spellCheck={false} 
                />
                <div className="absolute top-2 right-2 text-xs text-muted-foreground font-medium">
                  Left Type
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ArrowRight className="w-4 h-4" />
                  <span className="text-sm font-medium">subtype of</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Right Type Input */}
              <div className="relative">
                <Textarea 
                  value={rightType} 
                  onChange={e => setRightType(e.target.value)} 
                  placeholder="Right type (e.g., Top, a -> Int, mu a. a -> Int)" 
                  className="font-code text-xs sm:text-sm bg-code min-h-[80px] resize-none pr-20 pl-8 border-muted-foreground/20 focus:border-primary transition-smooth focus:shadow-lg focus:shadow-primary/10 touch-manipulation" 
                  spellCheck={false} 
                />
                <div className="absolute top-2 right-2 text-xs text-muted-foreground font-medium">
                  Right Type
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button 
                  onClick={handleClear} 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-60 hover:opacity-100 transition-smooth"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Clear
                </Button>
                <Button 
                  onClick={onInfer} 
                  disabled={!leftType.trim() || !rightType.trim() || isInferring} 
                  size="sm" 
                  className={`
                    btn-interactive transition-smooth touch-manipulation
                    ${isInferring ? 'animate-pulse glow-primary' : 'hover:glow-primary'}
                    ${!leftType.trim() || !rightType.trim() ? 'opacity-50' : ''}
                  `}
                >
                  {isInferring ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Play className="w-3 h-3 mr-1 transition-transform duration-200 hover:scale-110" />
                  )}
                  Check Subtyping
                </Button>
              </div>
            </div>
          </div>

          {selectedExample && (
            <div className="p-3 bg-algorithm rounded-lg border border-primary/20 transition-smooth hover:border-primary/40 hover-scale-sm animate-fade-in-up">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {currentExamples.find(e => e.name === selectedExample)?.description}
              </p>
            </div>
          )}
        </CardContent>
        
        <HelpModal open={helpModalOpen} onOpenChange={setHelpModalOpen} />
      </Card>
    );
  }

  // Single input UI for inference and translate
  return (
    <Card className="academic-panel hover-scale-sm transition-smooth">
      <CardHeader className="pb-2 sm:pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Code className="w-4 h-4 text-primary" />
          {isTranslateMode ? 'Translate Type' : 'Input Program'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Select value={selectedExample} onValueChange={handleExampleSelect}>
            <SelectTrigger className="w-full bg-card transition-smooth hover:border-primary/50">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-muted-foreground" />
                <SelectValue placeholder="Choose an example..." />
              </div>
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
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setHelpModalOpen(true)}
              className="absolute bottom-2 left-2 h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-smooth z-10"
            >
              <HelpCircle className="w-3 h-3" />
            </Button>
            <Textarea 
              ref={ref}
              value={expression} 
              onChange={e => onExpressionChange(e.target.value)} 
              placeholder={isTranslateMode ? 'Please enter a type. For example, mu a. a -> Int' : 'Please enter an expression. For example, (\\x. x) 1'} 
              className="font-code text-xs sm:text-sm bg-code min-h-[90px] sm:min-h-[100px] resize-none pr-20 pl-8 border-muted-foreground/20 focus:border-primary transition-smooth focus:shadow-lg focus:shadow-primary/10 touch-manipulation" 
              spellCheck={false} 
            />
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
          <div className="p-3 bg-algorithm rounded-lg border border-primary/20 transition-smooth hover:border-primary/40 hover-scale-sm animate-fade-in-up">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {currentExamples.find(e => e.name === selectedExample)?.description}
            </p>
          </div>
        )}
      </CardContent>
      
      <HelpModal open={helpModalOpen} onOpenChange={setHelpModalOpen} />
    </Card>
  );
});