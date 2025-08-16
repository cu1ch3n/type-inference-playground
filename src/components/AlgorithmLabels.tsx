import { Badge } from '@/components/ui/badge';

interface AlgorithmLabelsProps {
  labels: string[];
}

export const AlgorithmLabels = ({ labels }: AlgorithmLabelsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
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