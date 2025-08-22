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
  const rule = rules.find(r => r.id === ruleId);

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
        <Card className={`absolute right-full bottom-full mr-2 mb-2 p-3 bg-background/95 backdrop-blur-sm border shadow-lg z-50 animate-scale-in ${
          rule.reduction ? 'min-w-[450px] max-w-[650px]' : 'min-w-[350px] max-w-[450px]'
        }`}>
          {/* Reduction rule format - wider to prevent wrapping */}
          {rule.reduction ? (
            <div className="text-center">
              <KaTeXRenderer 
                expression={rule.reduction} 
                displayMode={false}
                className="text-sm whitespace-nowrap"
              />
            </div>
          ) : (
            /* Traditional premise/conclusion format - try inline first, fallback to stacked */
            <div className="space-y-2">
              {rule.premises && rule.premises.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {rule.premises.map((premise, idx) => (
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
              
              {rule.premises && rule.premises.length > 0 && (
                <div className="border-t border-foreground/20 mx-2"></div>
              )}
              
              {rule.conclusion && (
                <div className="text-center">
                  <KaTeXRenderer 
                    expression={rule.conclusion} 
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