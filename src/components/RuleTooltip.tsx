import { useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [badgeRect, setBadgeRect] = useState<DOMRect | null>(null);
  const rule = rules.find(r => r.Id === ruleId);

  if (!rule) {
    return (
      <Badge variant={variant} className={className}>
        {ruleId}
      </Badge>
    );
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setBadgeRect(rect);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setBadgeRect(null);
  };

  const tooltipContent = isHovered && badgeRect && (
    <Card 
      className="fixed p-3 bg-background/95 backdrop-blur-sm border shadow-lg z-[9999] animate-scale-in min-w-[200px] max-w-[80vw] w-max"
      style={{
        left: badgeRect.left - 8, // Position to the left of the badge with some margin
        top: badgeRect.top - 8, // Position above the badge with some margin
        transform: 'translate(-100%, -100%)', // Move fully to the left and above
      }}
    >
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
          
          {/* Horizontal line separator */}
          <div className="border-t border-foreground/40 w-full"></div>
          
          {/* Conclusion */}
          <div className="text-center">
            <KaTeXRenderer 
              expression={rule.Conclusion} 
              displayMode={false}
              className="text-sm"
            />
          </div>
        </div>
      )}
    </Card>
  );

  return (
    <div className="relative">
      <Badge 
        variant={isActive ? "default" : variant}
        className={`${className} transition-smooth hover:scale-105`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {ruleId}
      </Badge>
      
      {tooltipContent && createPortal(tooltipContent, document.body)}
    </div>
  );
};