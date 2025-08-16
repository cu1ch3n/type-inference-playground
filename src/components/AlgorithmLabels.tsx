import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

interface AlgorithmLabelsProps {
  labels: string[];
}

export const AlgorithmLabels = ({ labels }: AlgorithmLabelsProps) => {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Tag className="w-3 h-3 text-muted-foreground" />
      {labels.slice(0, -1).map((label, index) => (
        <Badge 
          key={index}
          variant="secondary"
          className="text-xs"
        >
          {label}
        </Badge>
      ))}
    </div>
  );
};