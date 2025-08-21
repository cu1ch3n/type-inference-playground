import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ExternalLink, Zap, Search } from 'lucide-react';
import { TypeInferenceAlgorithm } from '@/types/inference';
import { AlgorithmLabels } from './AlgorithmLabels';
import { useState, useMemo } from 'react';

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
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAlgorithms = useMemo(() => {
    if (!searchTerm) return algorithms;
    const term = searchTerm.toLowerCase();
    return algorithms.filter(algorithm => 
      algorithm.name.toLowerCase().includes(term) ||
      algorithm.labels.some(label => label.toLowerCase().includes(term))
    );
  }, [algorithms, searchTerm]);

  return (
    <Card className="academic-panel hover-scale-sm transition-smooth">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary transition-transform duration-200 hover:scale-110" />
          Type Inference Algorithm
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search algorithms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card transition-smooth hover:border-primary/50"
          />
        </div>
        
        <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
          {filteredAlgorithms.map((algorithm, index) => (
            <div
              key={algorithm.id}
              onClick={() => onAlgorithmChange(algorithm.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:border-primary/50 hover-scale-sm ${
                selectedAlgorithm === algorithm.id 
                  ? 'bg-algorithm border-primary/40 shadow-sm' 
                  : 'bg-card border-border/50'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="space-y-3">
                <h3 className="font-medium text-base text-foreground">{algorithm.name}</h3>
                <AlgorithmLabels labels={algorithm.labels} />
                
                {algorithm.paper && (
                  <div className="pt-2 border-t border-border/30">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        <div className="font-medium">{algorithm.paper.title} ({algorithm.paper.year})</div>
                        <div>{algorithm.paper.authors.join(', ')}</div>
                      </div>
                      {algorithm.paper.url && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-1 btn-interactive hover:text-primary" 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(algorithm.paper!.url, '_blank');
                          }}
                        >
                          <ExternalLink className="w-3 h-3 transition-transform duration-200 hover:scale-110" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {filteredAlgorithms.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No algorithms found matching "{searchTerm}"
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};