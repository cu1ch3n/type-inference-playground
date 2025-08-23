import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ExternalLink, Zap, Search, ChevronDown, Check } from 'lucide-react';
import { TypeInferenceAlgorithm, AlgorithmVariant } from '@/types/inference';
import { AlgorithmLabels } from './AlgorithmLabels';
import { useState, useMemo } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import * as LucideIcons from 'lucide-react';

interface AlgorithmSelectorProps {
  algorithms: TypeInferenceAlgorithm[];
  selectedAlgorithm?: string;
  selectedVariant?: string;
  onAlgorithmChange: (algorithmId: string) => void;
  onVariantChange?: (variantId: string) => void;
}

export const AlgorithmSelector = ({ 
  algorithms, 
  selectedAlgorithm, 
  selectedVariant,
  onAlgorithmChange,
  onVariantChange
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
      <CardContent className="space-y-3 pt-3 sm:pt-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
          <Input
            placeholder="Search algorithms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-sm bg-card transition-smooth hover:border-primary/50"
          />
        </div>
        
        <div className="relative">
          <div className="max-h-72 overflow-y-auto space-y-1.5 pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" 
               onScroll={(e) => {
                 const target = e.target as HTMLElement;
                 const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 5;
                 const fadeElement = target.parentElement?.querySelector('.scroll-fade');
                 if (fadeElement) {
                   (fadeElement as HTMLElement).style.opacity = isAtBottom ? '0' : '1';
                 }
               }}>
            {filteredAlgorithms.map((algorithm, index) => (
              <div
                key={algorithm.id}
                onClick={() => onAlgorithmChange(algorithm.id)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                  selectedAlgorithm === algorithm.id 
                    ? 'bg-algorithm border-primary/40 shadow-sm' 
                    : 'bg-card border-border/50 hover:bg-accent/30'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-sm text-foreground leading-tight flex-1">{algorithm.name}</h3>
                    {algorithm.variants && algorithm.variants.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-auto p-1 text-xs bg-background/50 border border-border/30 hover:bg-accent/50 transition-colors duration-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ChevronDown className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate max-w-16">
                              {algorithm.variants.find(v => v.id === (selectedVariant || algorithm.defaultVariant))?.name || 'Base'}
                            </span>
                            <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[180px] bg-background border border-border/50 shadow-lg">
                          {algorithm.variants.map((variant) => {
                            const isSelected = variant.id === (selectedVariant || algorithm.defaultVariant);
                            return (
                              <DropdownMenuItem
                                key={variant.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onVariantChange?.(variant.id);
                                }}
                                className="cursor-pointer hover:bg-accent/50 transition-colors duration-200 relative pl-8"
                              >
                                {isSelected && (
                                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                    <Check className="h-4 w-4 text-primary" />
                                  </span>
                                )}
                                <div className="flex items-start gap-2 w-full">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm">{variant.name}</div>
                                    <div className="text-xs text-muted-foreground leading-tight">{variant.description}</div>
                                  </div>
                                </div>
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 items-center">
                    {algorithm.labels.map((label) => (
                      <span key={label} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-secondary/50 text-secondary-foreground border border-secondary/20">
                        {label}
                      </span>
                    ))}
                  </div>
                  
                  {algorithm.paper && (
                    <div className="pt-1.5 border-t border-border/30">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs text-muted-foreground leading-tight flex-1 min-w-0">
                          <div className="font-medium truncate text-xs">{algorithm.paper.title} ({algorithm.paper.year})</div>
                          <div className="truncate text-xs">{algorithm.paper.authors.join(', ')}</div>
                        </div>
                        {algorithm.paper.url && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-auto p-0.5 btn-interactive hover:text-primary flex-shrink-0" 
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
              <div className="text-center py-4 text-sm text-muted-foreground">
                No algorithms found matching "{searchTerm}"
              </div>
            )}
          </div>
          
          {/* Subtle scroll indicators */}
          {filteredAlgorithms.length > 2 && (
            <div className="scroll-fade absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none transition-opacity duration-300" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};