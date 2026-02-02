export interface ProgressBarProps {
  /** Progress value (0-100) */
  value: number;
  /** Maximum value (defaults to 100) */
  max?: number;
  /** Show percentage label */
  showLabel?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'error';
  /** Custom label (overrides percentage) */
  label?: string;
  /** Accessible label for screen readers */
  ariaLabel?: string;
}

/**
 * ProgressBar component matching styles from src/gui/public/css/styles.css
 * 
 * Base styles from .progress-bar-container, .progress-bar, .progress-fill (lines 891-948)
 */
export function ProgressBar({
  value,
  max = 100,
  showLabel = true,
  size = 'md',
  variant = 'default',
  label,
  ariaLabel = 'Progress',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const roundedPercentage = Math.round(percentage);

  // Size classes - height from .progress-bar (32px for md)
  const sizeClasses: Record<typeof size, { bar: string; text: string }> = {
    sm: { bar: 'h-4', text: 'text-sm min-w-[40px]' },
    md: { bar: 'h-8', text: 'text-[1.1em] min-w-[50px] font-bold' },  // 32px = 2rem = h-8
    lg: { bar: 'h-10', text: 'text-lg min-w-[60px] font-bold' },
  };

  // Variant colors for the fill
  const variantColors: Record<typeof variant, string> = {
    default: 'bg-neon-blue',
    success: 'bg-acid-lime',
    warning: 'bg-safety-orange',
    error: 'bg-hot-magenta',
  };

  // Glow effect matching CSS box-shadow
  const glowStyle = percentage > 0 ? {
    boxShadow: `
      0 0 10px currentColor,
      0 0 20px currentColor,
      inset 0 0 10px rgba(0, 240, 255, 0.5)
    `.trim(),
  } : {};

  return (
    <div className="flex items-center gap-md">
      <div
        className={`
          flex-1
          ${sizeClasses[size].bar}
          border-thick border-ink-black
          dark:border-ink-light
          bg-paper-cream
          relative overflow-hidden
        `}
        style={{
          // Cross-hatching pattern for empty space
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 4px,
            #1A1A1A 4px,
            #1A1A1A 5px
          )`,
        }}
        role="progressbar"
        aria-valuenow={roundedPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
      >
        <div
          className={`
            h-full
            ${variantColors[variant]}
            border-r-thick border-ink-black
            dark:border-ink-light
            transition-all duration-300 ease-out
            relative z-10
          `}
          style={{
            width: `${percentage}%`,
            ...glowStyle,
          }}
        />
      </div>
      {showLabel && (
        <span className={`text-right ${sizeClasses[size].text}`}>
          {label ?? `${roundedPercentage}%`}
        </span>
      )}
    </div>
  );
}
