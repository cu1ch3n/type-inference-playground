import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Share2, Check, Download, FileText } from 'lucide-react';
import { shareCurrentState } from '@/lib/shareUtils';
import { useToast } from '@/hooks/use-toast';
import { InferenceResult, TypeInferenceAlgorithm, DerivationStep } from '@/types/inference';

interface ShareExportButtonsProps {
  algorithm: TypeInferenceAlgorithm;
  expression: string;
  result?: InferenceResult;
  disabled?: boolean;
}

export const ShareExportButtons = ({
  algorithm,
  expression,
  result,
  disabled = false
}: ShareExportButtonsProps) => {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = React.useState(false);

  const handleShare = async () => {
    if (!expression.trim()) {
      toast({
        title: "Cannot share",
        description: "Please enter an expression first.",
        variant: "destructive"
      });
      return;
    }

    setIsSharing(true);
    try {
      const shareResult = await shareCurrentState(algorithm.id, expression);
      
      if (shareResult.success) {
        toast({
          title: "Link copied!",
          description: "The shareable link has been copied to your clipboard.",
          duration: 3000
        });
      } else {
        // Fallback: show the URL in a toast for manual copying
        toast({
          title: "Share link ready",
          description: "Please copy this URL manually: " + shareResult.url.substring(0, 50) + "...",
          duration: 5000
        });
      }
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Could not create shareable link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  const derivationToMarkdown = (steps: DerivationStep[], depth = 0): string => {
    if (!steps.length) return '';
    
    const indent = '  '.repeat(depth);
    return steps.map(step => {
      const bullet = depth === 0 ? '-' : '-';
      const line = `${indent}${bullet} [${step.ruleId}] $${step.expression}$`;
      const childrenMarkdown = step.children ? 
        derivationToMarkdown(step.children, depth + 1) : '';
      return childrenMarkdown ? `${line}\n${childrenMarkdown}` : line;
    }).join('\n');
  };

  const derivationToLinearMarkdown = (steps: DerivationStep[]): string => {
    const flattenSteps = (steps: DerivationStep[]): DerivationStep[] => {
      return steps.reduce<DerivationStep[]>((acc, step) => {
        acc.push(step);
        if (step.children) {
          acc.push(...flattenSteps(step.children));
        }
        return acc;
      }, []);
    };

    const flatSteps = flattenSteps(steps);
    return flatSteps.map((step, index) => 
      `${index + 1}. [${step.ruleId}] $${step.expression}$`
    ).join('\n');
  };

  const handleExportMarkdown = () => {
    if (!result?.success || !result.derivation.length) {
      toast({
        title: "Cannot export",
        description: "No derivation available to export.",
        variant: "destructive"
      });
      return;
    }

    const isLinear = algorithm.viewMode === 'linear';
    const markdown = isLinear ? 
      derivationToLinearMarkdown(result.derivation) :
      derivationToMarkdown(result.derivation);
    
    const fullMarkdown = `# ${algorithm.name} - Type Derivation

## Expression
\`${expression}\`

## Final Type
$${result.finalType || 'Unknown'}$

## Derivation Steps
${markdown}`;

    navigator.clipboard.writeText(fullMarkdown).then(() => {
      toast({
        title: "Exported to clipboard!",
        description: "Markdown derivation copied to clipboard.",
        duration: 3000
      });
    }).catch(() => {
      // Fallback: create downloadable file
      const blob = new Blob([fullMarkdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${algorithm.id}-derivation.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "File downloaded!",
        description: "Markdown derivation downloaded as file.",
        duration: 3000
      });
    });
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleShare}
        variant="outline"
        size="sm"
        disabled={disabled || isSharing || !expression.trim()}
        className="transition-all duration-200 hover:scale-105"
      >
        {isSharing ? (
          <Check className="w-4 h-4 mr-2" />
        ) : (
          <Share2 className="w-4 h-4 mr-2" />
        )}
        {isSharing ? 'Copied!' : 'Share'}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || !result?.success}
            className="transition-all duration-200 hover:scale-105"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover border-border">
          <DropdownMenuItem 
            onClick={handleExportMarkdown}
            className="cursor-pointer hover:bg-accent"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export as Markdown
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};