import type { StatusType } from '@/types';

export interface StatusBadgeProps {
  /** Status type determines color and animation */
  status: StatusType;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show text label next to dot */
  showLabel?: boolean;
  /** Custom label text (defaults to status) */
  label?: string;
  /** Use badge style instead of dot */
  variant?: 'dot' | 'badge';
}

/**
 * Status indicator matching styles from src/gui/public/css/styles.css
 * 
 * Dot variant: .status-dot (lines 556-598)
 * Badge variant: .status-badge (lines 2956-2987)
 */
export function StatusBadge({
  status,
  size = 'md',
  showLabel = false,
  label,
  variant = 'dot',
}: StatusBadgeProps) {
  // Size classes for dot variant
  const dotSizeClasses: Record<typeof size, string> = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',  // 12px default
    lg: 'w-4 h-4',
  };

  // Status to color mapping matching CSS variables
  const statusColors: Record<StatusType, { bg: string; glow?: string }> = {
    running: { bg: 'bg-status-running', glow: 'shadow-[0_0_8px_#0047AB]' },
    paused: { bg: 'bg-status-paused' },
    error: { bg: 'bg-status-error' },
    complete: { bg: 'bg-status-complete' },
    pending: { bg: 'bg-status-idle' },
    idle: { bg: 'bg-status-idle' },
  };

  // Badge variant colors (text color varies by status)
  const badgeColors: Record<StatusType, string> = {
    running: 'bg-status-running text-paper-cream shadow-[0_0_8px_#0047AB]',
    paused: 'bg-status-paused text-ink-black',
    error: 'bg-status-error text-paper-cream',
    complete: 'bg-status-complete text-ink-black',
    pending: 'bg-status-idle text-paper-cream',
    idle: 'bg-status-idle text-paper-cream',
  };

  const validStatuses: StatusType[] = ['running', 'paused', 'error', 'complete', 'pending', 'idle'];
  const resolvedStatus: StatusType =
    status && typeof status === 'string' && (validStatuses as string[]).includes(status)
      ? status
      : 'idle';
  const rawLabel = label ?? resolvedStatus ?? 'idle';
  const displayLabel =
    typeof rawLabel === 'string' && rawLabel.length > 0 ? rawLabel.toUpperCase() : 'IDLE';

  if (variant === 'badge') {
    // Badge style (.status-badge)
    return (
      <span
        className={`
          inline-block
          px-sm py-xs
          border-medium border-ink-black
          font-bold text-[0.85em] uppercase tracking-wide
          rounded-sm
          ${badgeColors[resolvedStatus]}
        `}
        role="status"
        aria-label={`Status: ${displayLabel}`}
      >
        {displayLabel}
      </span>
    );
  }

  // Dot style (.status-indicator + .status-dot)
  const { bg, glow } = statusColors[resolvedStatus];
  
  return (
    <span
      className="inline-flex items-center gap-xs font-bold text-[1.1em] whitespace-nowrap"
      role="status"
      aria-label={`Status: ${displayLabel}`}
    >
      <span
        className={`
          ${dotSizeClasses[size]}
          rounded-full
          border-medium border-ink-black
          dark:border-ink-light
          ${bg}
          ${glow ?? ''}
          ${resolvedStatus === 'running' ? 'animate-pulse-status' : ''}
        `}
      />
      {showLabel && <span>{displayLabel}</span>}
    </span>
  );
}
