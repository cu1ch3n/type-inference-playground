import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Share2, Check, Download, FileText, Image, FileDown } from 'lucide-react';
import { shareCurrentState } from '@/lib/shareUtils';
import { useToast } from '@/hooks/use-toast';
import { InferenceResult, TypeInferenceAlgorithm, DerivationStep } from '@/types/inference';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { marked } from 'marked';

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

  const createRenderableContent = () => {
    if (!result?.success || !result.derivation.length) return null;

    const isLinear = algorithm.viewMode === 'linear';
    const markdown = isLinear ? 
      derivationToLinearMarkdown(result.derivation) :
      derivationToMarkdown(result.derivation);
    
    const fullMarkdown = `# ${algorithm.name} - Type Derivation

## Expression
\`${expression.trim()}\`

## Final Type
$${result.finalType?.trim() || 'Unknown'}$

## Derivation Steps
${markdown}`;

    return fullMarkdown;
  };

  const handleExportPNG = async () => {
    const markdown = createRenderableContent();
    if (!markdown) {
      toast({
        title: "Cannot export",
        description: "No derivation available to export.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a temporary div to render the content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '40px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.color = 'black';
      tempDiv.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      tempDiv.style.fontSize = '14px';
      tempDiv.style.lineHeight = '1.6';
      
      // Convert markdown to HTML and render it
      const html = await marked(markdown);
      tempDiv.innerHTML = html;
      
      // Style the HTML content
      const style = document.createElement('style');
      style.textContent = `
        h1 { font-size: 24px; margin-bottom: 20px; font-weight: bold; }
        h2 { font-size: 18px; margin: 20px 0 10px 0; font-weight: bold; }
        code { background: #f5f5f5; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
        pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; }
        ul, ol { margin: 10px 0; padding-left: 20px; }
        li { margin: 4px 0; }
      `;
      tempDiv.appendChild(style);
      
      document.body.appendChild(tempDiv);

      // Capture the content as canvas
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: 'white',
        scale: 2, // Higher resolution
        logging: false,
        useCORS: true
      });

      // Remove the temporary div
      document.body.removeChild(tempDiv);

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${algorithm.id}-derivation.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast({
            title: "PNG exported!",
            description: "Derivation exported as PNG image.",
            duration: 3000
          });
        }
      }, 'image/png');

    } catch (error) {
      console.error('PNG export failed:', error);
      toast({
        title: "Export failed",
        description: "Could not export as PNG. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExportPDF = async () => {
    const markdown = createRenderableContent();
    if (!markdown) {
      toast({
        title: "Cannot export",
        description: "No derivation available to export.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Convert markdown to HTML
      const html = await marked(markdown);
      
      // Create a temporary div to measure content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '800px'; // Fixed width for better rendering
      tempDiv.style.padding = '40px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.color = 'black';
      tempDiv.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      tempDiv.style.fontSize = '16px'; // Larger font for better PDF quality
      tempDiv.style.lineHeight = '1.6';
      
      const style = document.createElement('style');
      style.textContent = `
        h1 { font-size: 28px; margin-bottom: 20px; font-weight: bold; color: #1a1a1a; }
        h2 { font-size: 22px; margin: 24px 0 12px 0; font-weight: bold; color: #2a2a2a; }
        code { background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 14px; }
        pre { background: #f8f9fa; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 12px 0; font-family: 'Courier New', monospace; }
        ul, ol { margin: 12px 0; padding-left: 24px; }
        li { margin: 6px 0; font-size: 16px; }
        p { margin: 8px 0; font-size: 16px; }
        .katex { font-size: 18px !important; }
        .katex-display { margin: 16px 0 !important; }
      `;
      tempDiv.appendChild(style);
      tempDiv.innerHTML = html;
      
      document.body.appendChild(tempDiv);

      // Capture as high-resolution canvas
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: 'white',
        scale: 3, // Higher scale for better quality
        logging: false,
        useCORS: true,
        allowTaint: true,
        height: tempDiv.scrollHeight,
        width: tempDiv.scrollWidth
      });

      document.body.removeChild(tempDiv);

      // Create PDF with better dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - (margin * 2);
      const maxHeight = pageHeight - (margin * 2);

      // Calculate optimal dimensions
      const imgWidth = maxWidth;
      const imgHeight = (canvas.height * maxWidth) / canvas.width;

      if (imgHeight <= maxHeight) {
        // Single page
        const imgData = canvas.toDataURL('image/png', 1.0); // Full quality
        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
      } else {
        // Multiple pages
        const pageRatio = maxHeight / imgHeight;
        const scaledWidth = imgWidth * pageRatio;
        const scaledHeight = maxHeight;
        
        let currentY = 0;
        let pageNumber = 0;
        
        while (currentY < canvas.height) {
          if (pageNumber > 0) {
            pdf.addPage();
          }
          
          // Create a canvas for this page
          const pageCanvas = document.createElement('canvas');
          const pageCtx = pageCanvas.getContext('2d');
          
          pageCanvas.width = canvas.width;
          pageCanvas.height = Math.min(canvas.height - currentY, canvas.height * pageRatio);
          
          if (pageCtx) {
            pageCtx.fillStyle = 'white';
            pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            
            pageCtx.drawImage(
              canvas,
              0, currentY, canvas.width, pageCanvas.height,
              0, 0, pageCanvas.width, pageCanvas.height
            );
          }
          
          const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
          pdf.addImage(pageImgData, 'PNG', margin, margin, scaledWidth, scaledHeight);
          
          currentY += pageCanvas.height;
          pageNumber++;
        }
      }

      pdf.save(`${algorithm.id}-derivation.pdf`);

      toast({
        title: "PDF exported!",
        description: "High-quality derivation exported as PDF document.",
        duration: 3000
      });

    } catch (error) {
      console.error('PDF export failed:', error);
      toast({
        title: "Export failed",
        description: "Could not export as PDF. Please try again.",
        variant: "destructive"
      });
    }
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
          <DropdownMenuItem 
            onClick={handleExportPNG}
            className="cursor-pointer hover:bg-accent"
          >
            <Image className="w-4 h-4 mr-2" />
            Export as PNG
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleExportPDF}
            className="cursor-pointer hover:bg-accent"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};