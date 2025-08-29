import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { KaTeXRenderer } from './KaTeXRenderer';
import { LatexText } from './LatexText';
import { TypingRule, RuleSection } from '@/types/inference';
import { RuleTooltip } from './RuleTooltip';
import { BookOpen } from 'lucide-react';

interface TypingRulesProps {
  rules: TypingRule[] | RuleSection[];
  activeRuleId?: string;
  onRuleClick?: (ruleId: string) => void;
  showHeader?: boolean;
}

export const TypingRules = ({ rules, activeRuleId, onRuleClick, showHeader = true }: TypingRulesProps) => {
  // Helper function to check if rules are sectioned
  const isSectioned = (rules: TypingRule[] | RuleSection[]): rules is RuleSection[] => {
    return rules && rules.length > 0 && 'Rules' in rules[0];
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
        p-2 rounded border transition-all duration-200 hover:scale-[1.01] flex flex-col
        ${activeRuleId === rule.Id 
          ? 'bg-highlight/30 border-primary shadow-sm' 
          : 'bg-rule border-border hover:bg-rule/80 hover:shadow-sm'
        }
        ${onRuleClick ? 'cursor-pointer' : ''}
      `}
      onClick={() => onRuleClick?.(rule.Id)}
    >
      {/* Premises section - grows to fill available space and aligns to bottom */}
      <div className="flex-1 flex flex-col justify-end">
        <div className="flex flex-wrap items-end justify-center gap-1.5 min-h-[1.5rem]">
          {rule.Premises && rule.Premises.length > 0 && (
            rule.Premises.map((premise, index) => (
              <div key={index} className="text-center">
                <KaTeXRenderer 
                  expression={premise} 
                  displayMode={false}
                  className="text-xs"
                />
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Horizontal line with label positioned outside content area */}
      <div className="relative flex items-center mt-1">
        <div className="flex-1 border-t border-foreground/20 mr-2"></div>
        <RuleTooltip 
          ruleId={rule.Id}
          rules={[rule]}
          variant={activeRuleId === rule.Id ? "default" : "secondary"}
          className="text-xs font-medium shrink-0"
          isActive={activeRuleId === rule.Id}
        />
      </div>
      
      {/* Conclusion section */}
      <div className="text-center mt-1">
        <KaTeXRenderer 
          expression={rule.Conclusion} 
          displayMode={false}
          className="text-xs"
        />
      </div>
    </div>
  );

  // Render reduction rule line
  const renderReductionRule = (rule: TypingRule) => (
    <div
      key={rule.Id}
      className={`
        flex items-center justify-between p-1.5 rounded border transition-all duration-200
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
        className="font-medium text-xs ml-1.5 px-1.5 py-0.5"
      >
        {rule.Name}
      </Badge>
    </div>
  );

  const flatRules = getFlatRules(rules);

  return (
    <div className="space-y-3">
      {showHeader && (
        <div className="border-b border-border pb-1">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Algorithmic Rules
          </h3>
        </div>
      )}
      <div>
        {isSectioned(rules) ? (
          // Sectioned view
          <div className="space-y-4">
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
                {section.Rules?.some(rule => rule.Reduction) ? (
                  <div className={`${section.Name?.toLowerCase().includes('worklist') || section.Name?.toLowerCase().includes('work list') ? 'grid grid-cols-1 lg:grid-cols-2 gap-2' : 'space-y-1'}`}>
                    {section.Rules.filter(rule => rule.Reduction).map(renderReductionRule)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
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
            {flatRules?.some(rule => rule.Reduction) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-3">
                {flatRules.filter(rule => rule.Reduction).map(renderReductionRule)}
              </div>
            )}

            {/* Traditional premise/conclusion rules - dense grid layout */}
            {flatRules?.some(rule => !rule.Reduction) && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
                {flatRules.filter(rule => !rule.Reduction).map(renderRuleCard)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};