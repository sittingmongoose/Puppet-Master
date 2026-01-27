import { useState, useId } from 'react';
import { WarningIcon } from '../icons/index.js';

export interface HelpTextProps {
  /** Short hint text (always visible) */
  hint?: string;
  /** Detailed explanation (expandable) */
  detailed?: string;
  /** Warning text to highlight important implications */
  warning?: string;
  /** Example text to show */
  example?: string;
  /** Link to external documentation */
  docLink?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
}

/**
 * HelpText component for progressive disclosure of help information
 * 
 * Shows a short hint by default, with expandable detailed explanation.
 * Follows UX best practices for contextual help.
 */
export function HelpText({
  hint,
  detailed,
  warning,
  example,
  docLink,
  size = 'md',
  className = '',
}: HelpTextProps) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const detailsId = `${id}-details`;
  const hintId = `${id}-hint`;

  // Size classes
  const sizeClasses: Record<typeof size, string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (!hint && !detailed) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-xs ${className}`}>
      {/* Short hint (always visible) */}
      {hint && (
        <p id={hintId} className={`${sizeClasses[size]} text-ink-faded dark:text-ink-faded-dark font-ui`}>
          {hint}
        </p>
      )}

      {/* Expandable detailed help */}
      {detailed && (
        <div className="flex flex-col gap-xs">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className={`
              self-start flex items-center gap-xs mt-xs
              ${sizeClasses[size]} text-electric-blue hover:text-electric-blue/80
              font-ui font-semibold
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-electric-blue/20 rounded
            `}
            aria-expanded={expanded}
            aria-controls={detailsId}
            aria-label={expanded ? 'Hide detailed help' : 'Show detailed help'}
          >
            <span>{expanded ? '▼' : '▶'}</span>
            <span>{expanded ? 'Hide details' : 'Learn more'}</span>
          </button>

          {expanded && (
            <div
              id={detailsId}
              className={`
                p-md border-medium border-ink-faded bg-paper-lined/30
                rounded space-y-sm
                ${sizeClasses[size]}
              `}
            >
              {/* Detailed explanation */}
              <div className="text-ink-black dark:text-ink-light">
                {detailed.split('\n').map((line, idx) => (
                  <p key={idx} className="mb-xs last:mb-0">
                    {line}
                  </p>
                ))}
              </div>

              {/* Warning */}
              {warning && (
                <div className="p-sm border-medium border-safety-orange bg-safety-orange/10 text-safety-orange rounded">
                  <div className="font-semibold mb-xs flex items-center gap-xs">
                    <WarningIcon size="1em" aria-hidden="true" />
                    <span>Warning</span>
                  </div>
                  <div className="text-sm">{warning}</div>
                </div>
              )}

              {/* Example */}
              {example && (
                <div className="p-sm border-medium border-ink-faded bg-paper-cream rounded">
                  <div className="font-semibold mb-xs text-ink-black dark:text-ink-light">Example:</div>
                  <pre className="text-xs font-mono text-ink-faded overflow-x-auto">
                    {example}
                  </pre>
                </div>
              )}

              {/* Documentation link */}
              {docLink && (
                <div className="pt-xs border-t border-ink-faded/30">
                  <a
                    href={docLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-electric-blue hover:underline text-sm font-semibold"
                  >
                    View documentation →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
