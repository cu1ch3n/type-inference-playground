import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { KaTeXRenderer } from './KaTeXRenderer';
import { LatexText } from './LatexText';
import { TypingRule, RuleSection } from '@/types/inference';
import { BookOpen } from 'lucide-react';

interface TypingRulesProps {
  rules: TypingRule[] | RuleSection[];
  activeRuleId?: string;
  onRuleClick?: (ruleId: string) => void;
}

export const TypingRules = ({ rules, activeRuleId, onRuleClick }: TypingRulesProps) => {
  // Helper function to check if rules are sectioned
  const isSectioned = (rules: TypingRule[] | RuleSection[]): rules is RuleSection[] => {
    return rules.length > 0 && 'Rules' in rules[0];
  };

  // Helper function to get all flat rules for backward compatibility
  const getFlatRules = (rules: TypingRule[] | RuleSection[]): TypingRule[] => {
    if (isSectioned(rules)) {
      return rules.flatMap(section => section.Rules);
    }
    return rules;
  };

  // Render individual rule card
  const renderRuleCard = (rule: TypingRule) => (
    <div
      key={rule.Id}
      className={`
        p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02]
        ${activeRuleId === rule.Id 
          ? 'bg-highlight/30 border-primary shadow-md' 
          : 'bg-rule border-border hover:bg-rule/80 hover:shadow-md'
        }
        ${onRuleClick ? 'cursor-pointer' : ''}
      `}
      onClick={() => onRuleClick?.(rule.Id)}
    >
      <div className="flex items-center justify-between mb-2">
        <Badge 
          variant={activeRuleId === rule.Id ? "default" : "secondary"}
          className="font-medium text-xs"
        >
          {rule.Name}
        </Badge>
      </div>

      <div className="space-y-2">
        {rule.Premises.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {rule.Premises.map((premise, index) => (
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
        
        {rule.Premises.length > 0 && (
          <div className="border-t border-foreground/20 mx-2"></div>
        )}
        
        <div className="text-center">
          <KaTeXRenderer 
            expression={rule.Conclusion} 
            displayMode={false}
            className="text-xs font-medium"
          />
        </div>
      </div>
    </div>
  );

  // Render reduction rule line
  const renderReductionRule = (rule: TypingRule) => (
    <div
      key={rule.Id}
      className={`
        flex items-center justify-between p-2 rounded-md border transition-all duration-300 hover:scale-[1.005]
        ${activeRuleId === rule.Id 
          ? 'bg-highlight/30 border-primary shadow-sm' 
          : 'bg-rule border-border hover:bg-rule/80 hover:shadow-sm'
        }
        ${onRuleClick ? 'cursor-pointer' : ''}
      `}
      onClick={() => onRuleClick?.(rule.Id)}
    >
      <div className="flex-1">
        <KaTeXRenderer 
          expression={rule.Reduction!} 
          displayMode={false}
          className="text-xs"
        />
      </div>
      <Badge 
        variant={activeRuleId === rule.Id ? "default" : "secondary"}
        className="font-medium text-xs ml-2"
      >
        {rule.Name}
      </Badge>
    </div>
  );

  const flatRules = getFlatRules(rules);

  return (
    <Card className="academic-panel">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="w-5 h-5 text-primary" />
          Algorithmic Rules
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isSectioned(rules) ? (
          // Sectioned view
          <div className="space-y-6">
            {rules.map((section, sectionIndex) => (
              <div key={section.Id}>
                {/* Section header */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{section.Name}</h3>
                    {section.Formula && (
                      <div className="bg-secondary/50 border border-secondary/20 rounded-lg px-3 py-1">
                        <KaTeXRenderer 
                          expression={section.Formula} 
                          displayMode={false}
                          className="text-sm font-medium"
                        />
                      </div>
                    )}
                  </div>
                  {section.Description && (
                    <LatexText text={section.Description} className="text-sm text-muted-foreground" />
                  )}
                </div>

                {/* Section rules */}
                {section.Rules.some(rule => rule.Reduction) ? (
                  <div className="space-y-1.5">
                    {section.Rules.filter(rule => rule.Reduction).map(renderReductionRule)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {section.Rules.filter(rule => !rule.Reduction).map(renderRuleCard)}
                  </div>
                )}

                {/* Separator between sections */}
                {sectionIndex < rules.length - 1 && (
                  <Separator className="mt-6" />
                )}
              </div>
            ))}
          </div>
        ) : (
          // Legacy flat view (backward compatibility)
          <>
            {/* Reduction rules - single lines */}
            {flatRules.some(rule => rule.Reduction) && (
              <div className="space-y-1.5 mb-4">
                {flatRules.filter(rule => rule.Reduction).map(renderReductionRule)}
              </div>
            )}

            {/* Traditional premise/conclusion rules - adaptive grid layout */}
            {flatRules.some(rule => !rule.Reduction) && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {flatRules.filter(rule => !rule.Reduction).map(renderRuleCard)}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};