import { forwardRef, useId } from 'react';
import { CheckIcon } from '../icons/index.js';

export interface CheckboxProps {
  /** Checkbox ID (auto-generated if not provided) */
  id?: string;
  /** Checked state */
  checked: boolean;
  /** Change handler */
  onChange: (checked: boolean) => void;
  /** Label text */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Indeterminate state */
  indeterminate?: boolean;
  /** Error message */
  error?: string;
  /** Helper text shown below checkbox */
  hint?: string;
  /** Additional CSS classes */
  className?: string;
  /** HTML name attribute */
  name?: string;
  /** HTML value attribute */
  value?: string;
}

/**
 * Checkbox component matching the platform's bold, technical design language
 * 
 * Features:
 * - Bold borders and box shadows matching Button component
 * - Electric blue accent when checked
 * - Proper accessibility support
 * - Dark mode compatible
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id: providedId,
      checked,
      onChange,
      label,
      disabled = false,
      indeterminate = false,
      error,
      hint,
      className = '',
      name,
      value,
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
      disabled:opacity-50 disabled:cursor-not-allowed
      peer-focus:ring-2 peer-focus:ring-electric-blue peer-focus:ring-offset-2
    `;

    // Checked state classes - ensure background is electric-blue when checked
    const checkedClasses = checked
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
          {/* Hidden native checkbox for form submission and accessibility */}
          <input
            ref={ref}
            type="checkbox"
            id={id}
            name={name}
            value={value}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={
              error ? errorId : (hint ? hintId : undefined)
            }
            className="sr-only peer"
            {...props}
          />
          
          {/* Custom styled checkbox */}
          <span
            className={`
              ${baseClasses}
              ${checkedClasses}
              ${hoverClasses}
              ${shadowClasses}
              ${error ? 'border-hot-magenta dark:border-hot-magenta' : ''}
              flex-shrink-0
            `.trim()}
            style={checked ? { backgroundColor: '#0047AB', borderColor: '#0047AB' } : undefined}
          >
            {/* Checkmark icon - only show when checked */}
            {checked && (
              <CheckIcon
                size="0.75em"
                className="text-white"
                aria-hidden="true"
              />
            )}
            {/* Indeterminate state - horizontal line */}
            {indeterminate && !checked && (
              <div
                className="w-3 h-0.5 bg-ink-black dark:bg-ink-light"
                aria-hidden="true"
              />
            )}
          </span>

          {/* Label text */}
          {label && (
            <span
              className={`
                font-ui text-sm break-words min-w-0 flex-1
                ${error ? 'text-hot-magenta' : 'text-ink-black dark:text-ink-light'}
              `.trim()}
            >
              {label}
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

Checkbox.displayName = 'Checkbox';
