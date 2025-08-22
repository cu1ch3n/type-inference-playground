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
        <Card className="absolute right-full bottom-full mr-2 mb-2 p-3 bg-background/95 backdrop-blur-sm border shadow-lg z-50 min-w-[300px] max-w-[400px] animate-scale-in">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-bold">
                {rule.name}
              </Badge>
            </div>
            
            {rule.premises && rule.premises.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground">Premises:</div>
                {rule.premises.map((premise, idx) => (
                  <div key={idx} className="text-sm pl-2 border-l-2 border-muted-foreground/20">
                    <KaTeXRenderer expression={premise} displayMode={false} />
                  </div>
                ))}
              </div>
            )}
            
            {rule.conclusion && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground">Conclusion:</div>
                <div className="text-sm pl-2 border-l-2 border-primary/40">
                  <KaTeXRenderer expression={rule.conclusion} displayMode={false} />
                </div>
              </div>
            )}
            
            {rule.reduction && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground">Reduction:</div>
                <div className="text-sm pl-2 border-l-2 border-primary/40">
                  <KaTeXRenderer expression={rule.reduction} displayMode={false} />
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};