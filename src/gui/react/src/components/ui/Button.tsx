import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

/**
 * Button variants matching the existing CSS classes:
 * - primary: .start-btn (acid-lime background, black text)
 * - secondary: .control-btn base (paper-cream background)
 * - danger: .stop-btn (hot-magenta background, cream text)
 * - warning: .pause-btn (safety-orange background, black text)
 * - info: .retry-btn / .reset-btn (electric-blue background, cream text)
 * - ghost: .replan-btn / .reopen-btn (paper-cream, inverts on hover)
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'warning' | 'info' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * Button component matching styles from src/gui/public/css/styles.css
 * 
 * Base styles from .control-btn (lines 1026-1042)
 * Variant styles from .start-btn, .pause-btn, .stop-btn, etc. (lines 1057-1105)
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Base classes matching .control-btn
    const baseClasses = `
      inline-flex items-center justify-center gap-2
      font-geometric font-bold uppercase tracking-wider
      border-thick border-ink-black
      cursor-pointer select-none
      transition-all duration-200
      relative
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    // Size classes
    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'px-sm py-xs text-sm',
      md: 'px-lg py-md text-base',        // Default: padding: var(--spacing-md) var(--spacing-lg)
      lg: 'px-xl py-md text-lg',          // .controls-primary .control-btn
    };

    // Variant classes matching exact CSS
    const variantClasses: Record<ButtonVariant, string> = {
      // .start-btn - acid-lime background, forced black text
      primary: 'bg-acid-lime !text-black hover:enabled:translate-x-0.5 hover:enabled:translate-y-0.5',
      
      // .control-btn base - paper-cream background
      secondary: 'bg-paper-cream text-ink-black dark:bg-paper-dark dark:text-ink-light dark:border-ink-light hover:enabled:translate-x-0.5 hover:enabled:translate-y-0.5',
      
      // .stop-btn - hot-magenta background
      danger: 'bg-hot-magenta text-paper-cream hover:enabled:translate-x-0.5 hover:enabled:translate-y-0.5',
      
      // .pause-btn - safety-orange background, forced black text
      warning: 'bg-safety-orange !text-black hover:enabled:translate-x-0.5 hover:enabled:translate-y-0.5',
      
      // .retry-btn, .reset-btn - electric-blue background
      info: 'bg-electric-blue text-paper-cream hover:enabled:translate-x-0.5 hover:enabled:translate-y-0.5',
      
      // .replan-btn, .reopen-btn - inverts on hover
      ghost: 'bg-paper-cream text-ink-black dark:bg-paper-dark dark:text-ink-light hover:enabled:bg-ink-black hover:enabled:text-paper-cream dark:hover:enabled:bg-ink-light dark:hover:enabled:text-paper-dark',
    };

    // Box shadow matching .control-btn (3px 3px 0 0 var(--ink-black), 2px 2px 0 0 var(--ink-black))
    // Reduces on hover to (1px 1px 0 0)
    const shadowStyle = {
      boxShadow: isDisabled 
        ? 'none'
        : '3px 3px 0 0 #1A1A1A, 2px 2px 0 0 #1A1A1A',
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`.trim()}
        style={shadowStyle}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
