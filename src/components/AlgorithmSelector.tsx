import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { TypeInferenceAlgorithm } from '@/types/inference';

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
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Type Inference Algorithm
        </label>
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
      </div>

      {selected && (
        <Card className="academic-panel">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {selected.name}
              {selected.paper && (
                <Badge variant="secondary" className="text-xs">
                  {selected.paper.year}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {selected.description}
            </CardDescription>
          </CardHeader>
          
          {selected.paper && (
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Reference Paper</h4>
                <div className="p-3 bg-rule rounded-lg">
                  <p className="font-medium text-sm">{selected.paper.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {selected.paper.authors.join(', ')} ({selected.paper.year})
                  </p>
                  {selected.paper.url && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 h-auto p-0 text-primary hover:text-primary-glow"
                      onClick={() => window.open(selected.paper?.url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Paper
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};