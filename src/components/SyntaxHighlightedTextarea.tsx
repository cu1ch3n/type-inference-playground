import { useRef, useEffect, useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SyntaxHighlightedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  [key: string]: any;
}

const SyntaxHighlightedTextarea = forwardRef<HTMLTextAreaElement, SyntaxHighlightedTextareaProps>(
  ({ value, onChange, placeholder, className, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Syntax highlighting tokens
    const highlightSyntax = (text: string): string => {
      if (!text) return '';
      
      let highlighted = text;
      
      // Keywords and operators (order matters for overlapping patterns)
      const tokens = [
        // Type keywords
        { pattern: /\b(Int|Bool|Top|Bot)\b/g, className: 'text-blue-400' },
        // Forall quantification
        { pattern: /\b(forall)\b/g, className: 'text-purple-400' },
        // Let binding
        { pattern: /\b(let|in)\b/g, className: 'text-purple-400' },
        // Type operators
        { pattern: /(<:|->|&|\|)/g, className: 'text-orange-400' },
        // Lambda
        { pattern: /(\\|λ)/g, className: 'text-green-400' },
        // Type application/abstraction
        { pattern: /(@|\/\\)/g, className: 'text-cyan-400' },
        // Boolean literals
        { pattern: /\b(True|False)\b/g, className: 'text-blue-300' },
        // Numbers
        { pattern: /\b\d+\b/g, className: 'text-yellow-400' },
        // Type annotation colon
        { pattern: /:/g, className: 'text-red-400' },
        // Parentheses and brackets
        { pattern: /[()[\]{}]/g, className: 'text-gray-300' },
        // Variables (single letters, optionally followed by numbers/underscores)
        { pattern: /\b[a-z][a-zA-Z0-9_]*\b/g, className: 'text-cyan-200' },
      ];

      // Apply highlighting
      tokens.forEach(({ pattern, className }) => {
        highlighted = highlighted.replace(pattern, (match) => 
          `<span class="${className}">${match}</span>`
        );
      });

      return highlighted;
    };

    // Sync textarea and highlight overlay
    useEffect(() => {
      if (highlightRef.current && textareaRef.current) {
        const highlighted = highlightSyntax(value);
        highlightRef.current.innerHTML = highlighted || '<br>';
        
        // Sync scroll
        const textarea = textareaRef.current;
        const highlight = highlightRef.current;
        
        const syncScroll = () => {
          highlight.scrollTop = textarea.scrollTop;
          highlight.scrollLeft = textarea.scrollLeft;
        };
        
        textarea.addEventListener('scroll', syncScroll);
        return () => textarea.removeEventListener('scroll', syncScroll);
      }
    }, [value]);

    // Forward ref
    useEffect(() => {
      if (ref && textareaRef.current) {
        if (typeof ref === 'function') {
          ref(textareaRef.current);
        } else {
          ref.current = textareaRef.current;
        }
      }
    }, [ref]);

    return (
      <div className="relative">
        {/* Syntax highlighting overlay */}
        <div
          ref={highlightRef}
          className={cn(
            "absolute inset-0 font-code text-xs sm:text-sm pointer-events-none overflow-hidden whitespace-pre-wrap break-words",
            "px-3 py-2 leading-[1.4] z-10",
            className?.includes('bg-code') ? 'bg-transparent' : ''
          )}
          style={{
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            letterSpacing: 'inherit',
            tabSize: 2,
          }}
          aria-hidden="true"
        />
        
        {/* Actual textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            "relative z-20 resize-none bg-transparent text-transparent caret-white selection:bg-primary/30",
            "focus:text-transparent", // Keep text transparent when focused
            className
          )}
          style={{
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            letterSpacing: 'inherit',
            tabSize: 2,
          }}
          spellCheck={false}
          {...props}
        />
        
        {/* Placeholder when empty and not focused */}
        {!value && !isFocused && placeholder && (
          <div className="absolute inset-0 px-3 py-2 text-muted-foreground pointer-events-none font-code text-xs sm:text-sm z-15">
            {placeholder}
          </div>
        )}
      </div>
    );
  }
);

SyntaxHighlightedTextarea.displayName = 'SyntaxHighlightedTextarea';

export { SyntaxHighlightedTextarea };