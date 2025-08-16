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
        <div className="p-4 bg-algorithm rounded-lg">
          <div className="mb-3">
            <h3 className="font-medium text-sm mb-2">{selected.name}</h3>
            <AlgorithmLabels labels={selected.labels} />
          </div>
          {selected.paper && (
            <div className="text-xs">
              <div className="text-muted-foreground mb-1">
                {selected.paper.authors.join(', ')} ({selected.paper.year})
              </div>
              <a 
                href={selected.paper.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {selected.paper.title}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};