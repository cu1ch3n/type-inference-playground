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
  variant?: string;
  disabled?: boolean;
}

export const ShareExportButtons = ({
  algorithm,
  expression,
  result,
  variant,
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
      const shareResult = await shareCurrentState(algorithm.Id, expression, variant);
      
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
      const line = `${indent}${bullet} [${step.ruleId}] $${step.expression.trim()}$`;
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
      `${index + 1}. [${step.ruleId}] $${step.expression.trim()}$`
    ).join('\n');
  };


  const handleExportMarkdown = () => {
    if (!result?.derivation || result.derivation.length === 0) {
      toast({
        title: "Cannot export",
        description: "No derivation available to export.",
        variant: "destructive"
      });
      return;
    }

    const isLinear = algorithm.ViewMode === 'linear';
    const markdown = isLinear ? 
      derivationToLinearMarkdown(result.derivation) :
      derivationToMarkdown(result.derivation);
    
    const fullMarkdown = `# ${algorithm.Name} - Type Derivation

## Expression
\`${expression.trim()}\`

## Final Type
$${result.finalType?.trim() || 'Unknown'}$

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
      a.download = `${algorithm.Id}-derivation.md`;
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
        className="btn-interactive touch-manipulation h-7 w-7 sm:w-auto sm:h-7 p-0 sm:px-2"
      >
        {isSharing ? (
          <Check className="w-3 h-3 sm:w-3 sm:h-3 sm:mr-1 flex-shrink-0" />
        ) : (
          <Share2 className="w-3 h-3 sm:w-3 sm:h-3 sm:mr-1 flex-shrink-0" />
        )}
        <span className="hidden sm:inline text-sm">{isSharing ? 'Copied!' : 'Share'}</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || (!result?.success && (!result?.derivation || result.derivation.length === 0))}
            className="btn-interactive touch-manipulation h-7 w-7 sm:w-auto sm:h-7 p-0 sm:px-2"
          >
            <Download className="w-3 h-3 sm:w-3 sm:h-3 sm:mr-1 flex-shrink-0" />
            <span className="hidden sm:inline text-sm">Export</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover border-border w-44 sm:w-48 animate-fade-in-scale">
          <DropdownMenuItem 
            onClick={handleExportMarkdown}
            className="cursor-pointer hover:bg-accent p-2 sm:p-3 touch-manipulation"
          >
            <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Export as Markdown</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};