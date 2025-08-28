import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { KaTeXRenderer } from './KaTeXRenderer';
import { TypingRule } from '@/types/inference';

interface RuleTooltipProps {
  ruleId: string;
  rules: TypingRule[];
  variant?: "default" | "secondary" | "outline";
  className?: string;
  isActive?: boolean;
}

export const RuleTooltip = ({ ruleId, rules, variant = "secondary", className = "", isActive = false }: RuleTooltipProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const rule = rules.find(r => r.Id === ruleId);

  if (!rule) {
    return (
      <Badge variant={variant} className={className}>
        {ruleId}
      </Badge>
    );
  }

  return (
    <div className="relative">
      <Badge 
        variant={isActive ? "default" : variant}
        className={`${className} transition-smooth hover:scale-105`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {ruleId}
      </Badge>
      
      {isHovered && (
        <Card className="absolute right-full bottom-full mr-2 mb-2 p-3 bg-background/95 backdrop-blur-sm border shadow-lg z-50 animate-scale-in min-w-[200px] max-w-[80vw] w-max">
          {/* Reduction rule format - wider to prevent wrapping */}
          {rule.Reduction ? (
            <div className="text-center">
              <KaTeXRenderer 
                expression={rule.Reduction} 
                displayMode={false}
                className="text-sm whitespace-nowrap"
              />
            </div>
          ) : (
            /* Traditional premise/conclusion format - try inline first, fallback to stacked */
            <div className="space-y-3">
              {rule.Premises && rule.Premises.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {rule.Premises.map((premise, idx) => (
                    <div key={idx} className="text-center">
                      <KaTeXRenderer 
                        expression={premise} 
                        displayMode={false}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {rule.Premises && rule.Premises.length > 0 && (
                <div className="border-t border-foreground/20 mx-2"></div>
              )}
              
              {rule.Conclusion && (
                <div className="text-center">
                  <KaTeXRenderer 
                    expression={rule.Conclusion} 
                    displayMode={false}
                    className="text-sm font-medium"
                  />
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};