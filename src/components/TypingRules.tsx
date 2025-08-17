import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KaTeXRenderer } from './KaTeXRenderer';
import { TypingRule } from '@/types/inference';
import { BookOpen } from 'lucide-react';

interface TypingRulesProps {
  rules: TypingRule[];
  activeRuleId?: string;
  onRuleClick?: (ruleId: string) => void;
}

export const TypingRules = ({ rules, activeRuleId, onRuleClick }: TypingRulesProps) => {
  return (
    <Card className="academic-panel animate-fade-in hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <BookOpen className="w-4 h-4" />
          Algorithmic Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {/* Reduction rules - single lines */}
        {rules.some(rule => rule.reduction) && (
          <div className="space-y-2 mb-4 animate-slide-up">
            {rules.filter(rule => rule.reduction).map((rule) => (
              <div
                key={rule.id}
                className={`
                  flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded border 
                  transition-all duration-200 focus-ring
                  ${activeRuleId === rule.id 
                    ? 'bg-highlight/30 border-primary shadow-sm animate-scale-in' 
                    : 'bg-rule border-border hover:bg-rule/80 hover:shadow-sm'
                  }
                  ${onRuleClick ? 'cursor-pointer hover:scale-[1.02]' : ''}
                `}
                onClick={() => onRuleClick?.(rule.id)}
                tabIndex={onRuleClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onRuleClick?.(rule.id);
                  }
                }}
              >
                <div className="flex-1 min-w-0">
                  <KaTeXRenderer 
                    expression={rule.reduction!} 
                    displayMode={false}
                    className="text-xs sm:text-sm break-all"
                  />
                </div>
                <Badge 
                  variant={activeRuleId === rule.id ? "default" : "secondary"}
                  className="font-medium text-xs self-start sm:self-center"
                >
                  {rule.name}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Traditional premise/conclusion rules - grid layout */}
        {rules.some(rule => !rule.reduction) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 animate-slide-up">
            {rules.filter(rule => !rule.reduction).map((rule) => (
              <div
                key={rule.id}
                className={`
                  p-2 sm:p-3 rounded border transition-all duration-200 focus-ring
                  ${activeRuleId === rule.id 
                    ? 'bg-highlight/30 border-primary shadow-sm animate-scale-in' 
                    : 'bg-rule border-border hover:bg-rule/80 hover:shadow-sm'
                  }
                  ${onRuleClick ? 'cursor-pointer hover:scale-[1.02] hover-lift' : ''}
                `}
                onClick={() => onRuleClick?.(rule.id)}
                tabIndex={onRuleClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onRuleClick?.(rule.id);
                  }
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge 
                    variant={activeRuleId === rule.id ? "default" : "secondary"}
                    className="font-medium text-xs"
                  >
                    {rule.name}
                  </Badge>
                </div>

                <div className="space-y-1">
                  {rule.premises.length > 0 && (
                    <div className="space-y-0.5">
                      {rule.premises.map((premise, index) => (
                        <div key={index} className="text-center">
                          <KaTeXRenderer 
                            expression={premise} 
                            displayMode={false}
                            className="text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {rule.premises.length > 0 && (
                    <div className="border-t border-foreground/20 mx-2"></div>
                  )}
                  
                  <div className="text-center">
                    <KaTeXRenderer 
                      expression={rule.conclusion} 
                      displayMode={false}
                      className="text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};