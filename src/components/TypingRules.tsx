import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KaTeXRenderer } from './KaTeXRenderer';
import { TypingRule } from '@/types/inference';

interface TypingRulesProps {
  rules: TypingRule[];
  activeRuleId?: string;
  onRuleClick?: (ruleId: string) => void;
}

export const TypingRules = ({ rules, activeRuleId, onRuleClick }: TypingRulesProps) => {
  return (
    <Card className="academic-panel">
      <CardHeader>
        <CardTitle>Typing Rules</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`
                ${rule.reduction 
                  ? 'flex items-center justify-between p-2 rounded border transition-all duration-200' 
                  : 'p-3 rounded border transition-all duration-200'
                }
                ${activeRuleId === rule.id 
                  ? 'bg-highlight/30 border-primary shadow-sm' 
                  : 'bg-rule border-border hover:bg-rule/80'
                }
                ${onRuleClick ? 'cursor-pointer' : ''}
              `}
              onClick={() => onRuleClick?.(rule.id)}
            >
              {rule.reduction ? (
                /* Worklist-style reduction rule - single line */
                <>
                  <div className="flex-1">
                    <KaTeXRenderer 
                      expression={rule.reduction} 
                      displayMode={false}
                      className="text-sm"
                    />
                  </div>
                  <Badge 
                    variant={activeRuleId === rule.id ? "default" : "outline"}
                    className="ml-3 text-xs"
                  >
                    {rule.name}
                  </Badge>
                </>
              ) : (
                /* Traditional premise/conclusion rule */
                <>
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
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};