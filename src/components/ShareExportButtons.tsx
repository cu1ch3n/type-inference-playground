import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Download, Check, AlertCircle } from 'lucide-react';
import { shareCurrentState } from '@/lib/shareUtils';
import { exportToPDF } from '@/lib/pdfExport';
import { useToast } from '@/hooks/use-toast';
import { InferenceResult, TypeInferenceAlgorithm } from '@/types/inference';

interface ShareExportButtonsProps {
  algorithm: TypeInferenceAlgorithm;
  expression: string;
  result: InferenceResult | undefined;
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
  const [isExporting, setIsExporting] = React.useState(false);

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

  const handleExportPDF = async () => {
    if (!result || !expression.trim()) {
      toast({
        title: "Cannot export",
        description: "Please run an inference first to export results.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    try {
      await exportToPDF(algorithm, expression, result);
      toast({
        title: "PDF exported!",
        description: "The derivation has been saved as a PDF file.",
        duration: 3000
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Could not export PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
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

      <Button
        onClick={handleExportPDF}
        variant="outline"
        size="sm"
        disabled={disabled || isExporting || !result}
        className="transition-all duration-200 hover:scale-105"
      >
        {isExporting ? (
          <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        {isExporting ? 'Exporting...' : 'Export PDF'}
      </Button>
    </div>
  );
};