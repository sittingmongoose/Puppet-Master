/**
 * BudgetDonut - Circular progress indicator for budget usage
 * 
 * Displays budget consumption as a donut/ring chart.
 */

interface BudgetDonutProps {
  used: number;
  limit: number;
  label: string;
  color?: 'blue' | 'orange' | 'purple' | 'green';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Donut chart for budget visualization
 * 
 * Uses CSS conic-gradient for the ring effect.
 * Maintains the "Vibrant Technical" aesthetic.
 */
export function BudgetDonut({
  used,
  limit,
  label,
  color = 'blue',
  size = 'md',
  className = '',
}: BudgetDonutProps) {
  const percentage = Math.min(Math.round((used / limit) * 100), 100);
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;

  // Size classes
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  // Color classes
  const colorMap = {
    blue: 'rgb(0, 71, 171)', // electric-blue
    orange: 'rgb(255, 107, 43)', // safety-orange
    purple: 'rgb(123, 45, 142)', // royal-purple
    green: 'rgb(57, 255, 20)', // neon-green
  };

  // Determine actual color based on percentage
  const actualColor = isCritical
    ? 'rgb(255, 20, 147)' // hot-magenta
    : isWarning
    ? 'rgb(255, 107, 43)' // safety-orange
    : colorMap[color];

  const backgroundGradient = `conic-gradient(${actualColor} ${percentage}%, transparent ${percentage}%)`;

  return (
    <div className={`flex flex-col items-center gap-xs ${className}`}>
      {/* Donut container */}
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full
          relative
          flex items-center justify-center
        `}
        style={{
          background: backgroundGradient,
        }}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${percentage}% used`}
      >
        {/* Inner circle (creates donut hole) */}
        <div
          className={`
            absolute
            bg-paper-white dark:bg-ink-black
            rounded-full
            flex items-center justify-center
            ${size === 'sm' ? 'w-10 h-10' : size === 'md' ? 'w-16 h-16' : 'w-24 h-24'}
          `}
        >
          <span
            className={`
              font-display font-bold
              ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-lg' : 'text-2xl'}
              ${isCritical ? 'text-hot-magenta' : isWarning ? 'text-safety-orange' : 'text-ink-black dark:text-ink-light'}
            `}
          >
            {percentage}%
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-ink-faded">
          {used} / {limit}
        </div>
      </div>
    </div>
  );
}
