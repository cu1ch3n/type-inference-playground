import { Badge } from '@/components/ui/badge';

interface AlgorithmLabelsProps {
  labels: string[];
}

export const AlgorithmLabels = ({ labels }: AlgorithmLabelsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label, index) => (
        <Badge 
          key={index}
          variant={index === labels.length - 1 ? "outline" : "secondary"}
          className="text-xs"
        >
          {label}
        </Badge>
      ))}
    </div>
  );
};