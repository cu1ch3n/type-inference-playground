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
      <CardContent className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`
              p-4 rounded-lg border transition-all duration-200
              ${activeRuleId === rule.id 
                ? 'bg-highlight/30 border-primary shadow-md' 
                : 'bg-rule border-border hover:bg-rule/80'
              }
              ${onRuleClick ? 'cursor-pointer' : ''}
            `}
            onClick={() => onRuleClick?.(rule.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <Badge 
                variant={activeRuleId === rule.id ? "default" : "secondary"}
                className="font-medium"
              >
                {rule.name}
              </Badge>
            </div>

            {/* Rule Display */}
            <div className="space-y-2">
              {rule.premises.length > 0 && (
                <div className="space-y-1">
                  {rule.premises.map((premise, index) => (
                    <div key={index} className="text-center">
                      <KaTeXRenderer 
                        expression={premise} 
                        displayMode={false}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {rule.premises.length > 0 && (
                <div className="border-t border-foreground/20 mx-4"></div>
              )}
              
              <div className="text-center">
                <KaTeXRenderer 
                  expression={rule.conclusion} 
                  displayMode={false}
                  className="font-medium"
                />
              </div>
            </div>

            {rule.description && (
              <p className="text-xs text-muted-foreground mt-3 italic">
                {rule.description}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};