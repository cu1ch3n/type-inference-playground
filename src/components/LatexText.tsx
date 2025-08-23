import { KaTeXRenderer } from './KaTeXRenderer';

interface LatexTextProps {
  text: string;
  className?: string;
}

export const LatexText = ({ text, className = '' }: LatexTextProps) => {
  // Split text by $ delimiters for inline math or $$ for display math
  const parts = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          // Display math
          const mathContent = part.slice(2, -2);
          return (
            <KaTeXRenderer
              key={index}
              expression={mathContent}
              displayMode={true}
              className="inline-block"
            />
          );
        } else if (part.startsWith('$') && part.endsWith('$')) {
          // Inline math
          const mathContent = part.slice(1, -1);
          return (
            <KaTeXRenderer
              key={index}
              expression={mathContent}
              displayMode={false}
              className="inline"
            />
          );
        } else {
          // Regular text
          return <span key={index}>{part}</span>;
        }
      })}
    </span>
  );
};