import { forwardRef, useId } from 'react';

export interface RadioProps {
  /** Radio ID (auto-generated if not provided) */
  id?: string;
  /** Radio group name (required for radio buttons) */
  name: string;
  /** Radio value */
  value: string;
  /** Checked state */
  checked: boolean;
  /** Change handler */
  onChange: (value: string) => void;
  /** Label text */
  label?: string;
  /** Description text (shown below label) */
  description?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Helper text shown below radio */
  hint?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Radio component matching the platform's bold, technical design language
 * 
 * Features:
 * - Bold borders and box shadows matching Button component
 * - Electric blue accent when selected
 * - Proper accessibility support
 * - Dark mode compatible
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      id: providedId,
      name,
      value,
      checked,
      onChange,
      label,
      description,
      disabled = false,
      error,
      hint,
      className = '',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    // Base classes matching platform design
    const baseClasses = `
      relative
      w-5 h-5
      border-medium border-ink-black dark:border-ink-light
      bg-paper-cream dark:bg-paper-dark
      cursor-pointer select-none
      transition-all duration-200
      flex items-center justify-center
      rounded-full
      disabled:opacity-50 disabled:cursor-not-allowed
      peer-focus:ring-2 peer-focus:ring-electric-blue peer-focus:ring-offset-2
    `;

    // Selected state classes - ensure background is electric-blue when checked
    const selectedClasses = checked
      ? '!bg-electric-blue !border-electric-blue'
      : '';

    // Box shadow matching Button component (3px 3px 0 0)
    // Shadow handled via CSS classes for dark mode support
    const shadowClasses = !disabled && !checked
      ? 'shadow-[3px_3px_0_0_#1A1A1A] dark:shadow-[3px_3px_0_0_#e0e0e0]'
      : '';

    // Hover effect matching Button (slight translate)
    const hoverClasses = !disabled
      ? 'hover:translate-x-0.5 hover:translate-y-0.5'
      : '';

    return (
      <div className={`flex flex-col gap-xs ${className}`}>
        <label
          htmlFor={id}
          className={`
            flex items-start gap-sm cursor-pointer select-none
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            min-w-0
          `.trim()}
        >
          {/* Hidden native radio for form submission and accessibility */}
          <input
            ref={ref}
            type="radio"
            id={id}
            name={name}
            value={value}
            checked={checked}
            onChange={() => onChange(value)}
            disabled={disabled}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={
              error ? errorId : (hint ? hintId : undefined)
            }
            className="sr-only peer"
            {...props}
          />
          
          {/* Custom styled radio */}
          <span
            className={`
              ${baseClasses}
              ${selectedClasses}
              ${hoverClasses}
              ${shadowClasses}
              ${error ? 'border-hot-magenta dark:border-hot-magenta' : ''}
              flex-shrink-0
            `.trim()}
            style={checked ? { backgroundColor: '#0047AB', borderColor: '#0047AB' } : undefined}
          >
            {/* Selected indicator - white inner circle */}
            {checked && (
              <div
                className="w-2 h-2 rounded-full bg-white"
                style={{ backgroundColor: '#ffffff' }}
                aria-hidden="true"
              />
            )}
          </span>

          {/* Label and description */}
          {(label || description) && (
            <span
              className={`
                flex-1 min-w-0 break-words
                ${error ? 'text-hot-magenta' : 'text-ink-black dark:text-ink-light'}
              `.trim()}
            >
              {label && (
                <span className="font-semibold block break-words">{label}</span>
              )}
              {description && (
                <p className="text-sm text-ink-faded dark:text-ink-faded-dark mt-xs break-words">
                  {description}
                </p>
              )}
            </span>
          )}
        </label>

        {/* Hint text */}
        {hint && !error && (
          <p id={hintId} className="text-sm text-ink-faded dark:text-ink-faded-dark font-ui ml-7">
            {hint}
          </p>
        )}

        {/* Error message */}
        {error && (
          <p id={errorId} className="text-sm text-hot-magenta font-ui font-bold ml-7" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';
