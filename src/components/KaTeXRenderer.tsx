import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface KaTeXRendererProps {
  expression: string;
  displayMode?: boolean;
  className?: string;
  onClick?: () => void;
  isClickable?: boolean;
}

export const KaTeXRenderer = ({ 
  expression, 
  displayMode = false, 
  className = '',
  onClick,
  isClickable = false
}: KaTeXRendererProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(expression, ref.current, {
          displayMode,
          throwOnError: false,
          trust: true,
          strict: false
        });
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        ref.current.textContent = expression;
      }
    }
  }, [expression, displayMode]);

  return (
    <div 
      ref={ref} 
      className={`
        math-text select-text
        ${isClickable ? 'cursor-pointer hover:bg-highlight/20 rounded p-1 transition-colors' : ''}
        ${className}
      `}
      onClick={onClick}
    />
  );
};