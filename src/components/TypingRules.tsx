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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`
                p-3 rounded border transition-all duration-200
                ${activeRuleId === rule.id 
                  ? 'bg-highlight/30 border-primary shadow-sm' 
                  : 'bg-rule border-border hover:bg-rule/80'
                }
                ${onRuleClick ? 'cursor-pointer' : ''}
              `}
              onClick={() => onRuleClick?.(rule.id)}
            >
              {!rule.reduction && (
                <div className="flex items-center justify-between mb-2">
                  <Badge 
                    variant={activeRuleId === rule.id ? "default" : "secondary"}
                    className="font-medium text-xs"
                  >
                    {rule.name}
                  </Badge>
                </div>
              )}

              {/* Rule Display */}
              <div className="space-y-1">
                {rule.reduction ? (
                  /* Worklist-style reduction rule */
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <KaTeXRenderer 
                        expression={rule.reduction} 
                        displayMode={false}
                        className="text-xs"
                      />
                    </div>
                    <div className="ml-2 text-right">
                      <Badge 
                        variant="outline"
                        className="text-[10px] px-1 py-0"
                      >
                        {rule.name}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  /* Traditional premise/conclusion rule */
                  <>
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
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};