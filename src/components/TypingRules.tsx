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
    <Card className="academic-panel">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="w-5 h-5 text-primary" />
          Algorithmic Rules
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Reduction rules - single lines */}
        {rules.some(rule => rule.reduction) && (
          <div className="space-y-3 mb-6">
            {rules.filter(rule => rule.reduction).map((rule) => (
              <div
                key={rule.id}
                className={`
                  flex items-center justify-between p-3 rounded-lg border transition-all duration-300 hover:scale-[1.01]
                  ${activeRuleId === rule.id 
                    ? 'bg-highlight/30 border-primary shadow-md' 
                    : 'bg-rule border-border hover:bg-rule/80 hover:shadow-md'
                  }
                  ${onRuleClick ? 'cursor-pointer' : ''}
                `}
                onClick={() => onRuleClick?.(rule.id)}
              >
                <div className="flex-1">
                  <KaTeXRenderer 
                    expression={rule.reduction!} 
                    displayMode={false}
                    className="text-sm"
                  />
                </div>
                <Badge 
                  variant={activeRuleId === rule.id ? "default" : "secondary"}
                  className="font-medium text-xs"
                >
                  {rule.name}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Traditional premise/conclusion rules - content-adaptive grid layout */}
        {rules.some(rule => !rule.reduction) && (
          <div className="flex flex-wrap gap-4 justify-start">
            {rules.filter(rule => !rule.reduction).map((rule) => (
              <div
                key={rule.id}
                className={`
                  p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02]
                  ${activeRuleId === rule.id 
                    ? 'bg-highlight/30 border-primary shadow-md' 
                    : 'bg-rule border-border hover:bg-rule/80 hover:shadow-md'
                  }
                  ${onRuleClick ? 'cursor-pointer' : ''}
                `}
                onClick={() => onRuleClick?.(rule.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge 
                    variant={activeRuleId === rule.id ? "default" : "secondary"}
                    className="font-medium text-xs"
                  >
                    {rule.name}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {rule.premises.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-3">
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