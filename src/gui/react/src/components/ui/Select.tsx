import { forwardRef, useId, type SelectHTMLAttributes } from 'react';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text shown below select */
  hint?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Options array */
  options: Array<{ value: string; label: string }>;
  /** Placeholder option text */
  placeholder?: string;
}

/**
 * Select dropdown component matching styles from src/gui/public/css/styles.css
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      size = 'md',
      required,
      id: providedId,
      className = '',
      options,
      placeholder,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    // Size classes
    const sizeClasses: Record<typeof size, string> = {
      sm: 'px-sm py-xs text-sm',
      md: 'px-md py-sm text-mono',
      lg: 'px-md py-md text-base',
    };

    return (
      <div className="flex flex-col gap-xs">
        {label && (
          <label
            htmlFor={id}
            className="font-ui font-bold text-ink-black dark:text-ink-light uppercase tracking-wide text-sm"
          >
            {label}
            {required && <span className="text-hot-magenta ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`
            flex-1
            ${sizeClasses[size]}
            border-medium border-ink-black
            bg-paper-cream text-ink-black
            font-mono
            focus:outline-none focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-hot-magenta focus:border-hot-magenta focus:ring-hot-magenta/20' : ''}
            ${className}
          `}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error ? errorId : (hint ? hintId : undefined)
          }
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {hint && !error && (
          <p id={hintId} className="text-sm text-ink-faded dark:text-ink-faded-dark font-ui">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-sm text-hot-magenta font-ui font-bold" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
