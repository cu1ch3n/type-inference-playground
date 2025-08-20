import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Zap } from 'lucide-react';
import { TypeInferenceAlgorithm } from '@/types/inference';
import { AlgorithmLabels } from './AlgorithmLabels';

interface AlgorithmSelectorProps {
  algorithms: TypeInferenceAlgorithm[];
  selectedAlgorithm?: string;
  onAlgorithmChange: (algorithmId: string) => void;
}

export const AlgorithmSelector = ({ 
  algorithms, 
  selectedAlgorithm, 
  onAlgorithmChange 
}: AlgorithmSelectorProps) => {
  const selected = algorithms.find(a => a.id === selectedAlgorithm);

  return (
    <div className="space-y-4">
      <Card className="academic-panel hover-scale-sm transition-smooth">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary transition-transform duration-200 hover:scale-110" />
            Type Inference Algorithm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedAlgorithm} onValueChange={onAlgorithmChange}>
            <SelectTrigger className="w-full bg-card transition-smooth hover:border-primary/50">
              <SelectValue placeholder="Select an algorithm..." />
            </SelectTrigger>
            <SelectContent className="animate-fade-in-scale">
              {algorithms.map((algorithm, index) => (
                <SelectItem 
                  key={algorithm.id} 
                  value={algorithm.id}
                  className="transition-fast hover:bg-accent/50"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {algorithm.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selected && (
        <div className="p-5 bg-algorithm rounded-lg border border-primary/20 transition-smooth hover:border-primary/40 hover-scale-sm animate-fade-in-up">
          <div className="mb-4">
            <h3 className="font-medium text-base mb-3 text-foreground">{selected.name}</h3>
            <AlgorithmLabels labels={selected.labels} />
          </div>
          {selected.paper && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  <div className="font-medium">{selected.paper.title} ({selected.paper.year})</div>
                  <div>{selected.paper.authors.join(', ')}</div>
                </div>
                {selected.paper.url && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-1 btn-interactive hover:text-primary" 
                    onClick={() => window.open(selected.paper!.url, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 transition-transform duration-200 hover:scale-110" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};