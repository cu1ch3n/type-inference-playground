import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check } from 'lucide-react';
import { shareCurrentState } from '@/lib/shareUtils';
import { useToast } from '@/hooks/use-toast';

interface ShareExportButtonsProps {
  algorithm: { id: string };
  expression: string;
  disabled?: boolean;
}

export const ShareExportButtons = ({
  algorithm,
  expression,
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

  return (
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
  );
};