import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Share2, Check, Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InferenceResult, TypeInferenceAlgorithm } from '@/types/inference';
import { useAlgorithms } from '@/hooks/useAlgorithms';

interface ComparisonCell {
  algorithmId: string;
  expression: string;
  result?: InferenceResult;
  loading: boolean;
}

interface CompareShareExportButtonsProps {
  selectedAlgorithms: string[];
  expressions: string[];
  comparisonResults: Map<string, ComparisonCell>;
  disabled?: boolean;
}

export const CompareShareExportButtons = ({
  selectedAlgorithms,
  expressions,
  comparisonResults,
  disabled = false
}: CompareShareExportButtonsProps) => {
  const { toast } = useToast();
  const { algorithms } = useAlgorithms();
  const [isSharing, setIsSharing] = React.useState(false);

  const handleShare = async () => {
    if (selectedAlgorithms.length === 0 || expressions.length === 0) {
      toast({
        title: "Cannot share",
        description: "Please select at least one algorithm and add at least one expression.",
        variant: "destructive"
      });
      return;
    }

    setIsSharing(true);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('algorithms', selectedAlgorithms.join(','));
      url.searchParams.set('expressions', expressions.map(expr => encodeURIComponent(expr)).join(','));
      
      const shareUrl = url.toString();
      
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "The shareable comparison link has been copied to your clipboard.",
        duration: 3000
      });
    } catch (error) {
      // Fallback: show URL in toast
      const url = new URL(window.location.href);
      url.searchParams.set('algorithms', selectedAlgorithms.join(','));
      url.searchParams.set('expressions', expressions.map(expr => encodeURIComponent(expr)).join(','));
      
      toast({
        title: "Share link ready",
        description: "Please copy this URL manually: " + url.toString().substring(0, 50) + "...",
        duration: 5000
      });
    } finally {
      setIsSharing(false);
    }
  };

  const getCellKey = (algorithmId: string, expression: string) => `${algorithmId}:${expression}`;

  const handleExportMarkdown = (includeTypes: boolean = true) => {
    if (selectedAlgorithms.length === 0 || expressions.length === 0) {
      toast({
        title: "Cannot export",
        description: "No comparison data available to export.",
        variant: "destructive"
      });
      return;
    }

    // Create markdown table
    let markdown = '';
    
    // Table header
    const algorithmNames = selectedAlgorithms.map(id => {
      const algorithm = algorithms.find(a => a.Id === id);
      return algorithm?.Name || id;
    });
    
    markdown += '| Expression | ' + algorithmNames.join(' | ') + ' |\n';
    markdown += '|' + '---|'.repeat(algorithmNames.length + 1) + '\n';
    
    // Table rows
    expressions.forEach(expression => {
      let row = `| \`${expression}\` |`;
      
      selectedAlgorithms.forEach(algorithmId => {
        const key = getCellKey(algorithmId, expression);
        const cell = comparisonResults.get(key);
        
        if (!cell) {
          row += ' Pending |';
        } else if (cell.loading) {
          row += ' Loading... |';
        } else if (!cell.result) {
          row += ' No result |';
        } else if (!cell.result.success) {
          row += ' ❌ Error |';
        } else if (includeTypes && cell.result.finalType) {
          row += ` ✅ $$${cell.result.finalType}$$ |`;
        } else {
          row += ' ✅ Success |';
        }
      });
      
      markdown += row + '\n';
    });

    navigator.clipboard.writeText(markdown).then(() => {
      toast({
        title: "Exported to clipboard!",
        description: `Markdown comparison table ${includeTypes ? '(with types)' : '(status only)'} copied to clipboard.`,
        duration: 3000
      });
    }).catch(() => {
      // Fallback: create downloadable file
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `algorithm-comparison${includeTypes ? '-full' : '-status'}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "File downloaded!",
        description: `Markdown comparison table ${includeTypes ? '(with types)' : '(status only)'} downloaded as file.`,
        duration: 3000
      });
    });
  };

  const hasData = selectedAlgorithms.length > 0 && expressions.length > 0;

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleShare}
        variant="outline"
        size="sm"
        disabled={disabled || isSharing || !hasData}
        className="btn-interactive touch-manipulation h-8 w-8 sm:w-auto sm:h-9 p-0 sm:px-3"
      >
        {isSharing ? (
          <Check className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2 flex-shrink-0" />
        ) : (
          <Share2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2 flex-shrink-0" />
        )}
        <span className="hidden sm:inline text-sm">{isSharing ? 'Copied!' : 'Share'}</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || !hasData}
            className="btn-interactive touch-manipulation h-8 w-8 sm:w-auto sm:h-9 p-0 sm:px-3"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2 flex-shrink-0" />
            <span className="hidden sm:inline text-sm">Export</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover border-border w-44 sm:w-48 animate-fade-in-scale">
          <DropdownMenuItem 
            onClick={() => handleExportMarkdown(true)}
            className="cursor-pointer hover:bg-accent p-2 sm:p-3 touch-manipulation"
          >
            <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Markdown</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleExportMarkdown(false)}
            className="cursor-pointer hover:bg-accent p-2 sm:p-3 touch-manipulation"
          >
            <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Markdown (Status Only)</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};