import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
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
      <Card className="academic-panel">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Type Inference Algorithm</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedAlgorithm} onValueChange={onAlgorithmChange}>
            <SelectTrigger className="w-full bg-card">
              <SelectValue placeholder="Select an algorithm..." />
            </SelectTrigger>
            <SelectContent>
              {algorithms.map((algorithm) => (
                <SelectItem key={algorithm.id} value={algorithm.id}>
                  {algorithm.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selected && (
        <div className="p-4 bg-algorithm rounded-lg border">
          <div className="mb-3">
            <h3 className="font-medium text-sm mb-2">{selected.name}</h3>
            <AlgorithmLabels labels={selected.labels} />
          </div>
          {selected.paper && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  <div className="font-medium">{selected.paper.title}</div>
                  <div>{selected.paper.authors.join(', ')} ({selected.paper.year})</div>
                </div>
                {selected.paper.url && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-1" 
                    onClick={() => window.open(selected.paper!.url, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
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