import type { ReactNode, HTMLAttributes } from 'react';

export interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Panel content */
  children: ReactNode;
  /** Panel title */
  title?: ReactNode;
  /** Whether to show the dashed inner border */
  showInnerBorder?: boolean;
  /** Additional header actions */
  headerActions?: ReactNode;
}

/**
 * Panel component matching styles from src/gui/public/css/styles.css
 * 
 * Base styles from .panel (lines 162-268)
 * Uses the "Vibrant Technical" paper texture and drop shadow
 */
export function Panel({
  children,
  title,
  showInnerBorder = true,
  headerActions,
  className = '',
  ...props
}: PanelProps) {
  return (
    <div
      className={`
        panel
        relative
        bg-paper-cream dark:bg-paper-dark
        border-thick border-ink-black dark:border-ink-light
        shadow-panel dark:shadow-panel-dark
        ${className}
      `}
      style={{
        // Paper grain texture from CSS
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.02) 2px,
            rgba(0, 0, 0, 0.02) 4px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 1px,
            rgba(0, 0, 0, 0.01) 1px,
            rgba(0, 0, 0, 0.01) 2px
          )
        `,
      }}
      {...props}
    >
      {/* Dashed inner border - matching .panel::after */}
      {showInnerBorder && (
        <div
          className="absolute inset-[6px] border-thin border-dashed border-ink-black dark:border-ink-light pointer-events-none z-0"
          aria-hidden="true"
        />
      )}

      {/* Panel header */}
      {(title || headerActions) && (
        <div className="flex justify-between items-center mb-md gap-md flex-wrap min-w-0 relative z-10 p-md pb-0">
          {title && (
            <h2
              className="
                font-display font-bold
                text-lg uppercase tracking-wider
                text-ink-black dark:text-ink-light
                m-0 flex-1 min-w-0
                pb-xs border-b-medium border-ink-black dark:border-ink-light
              "
            >
              {title}
            </h2>
          )}
          {headerActions && (
            <div className="flex items-center gap-sm">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Panel content */}
      <div className="relative z-10 p-md min-w-0 overflow-x-auto">
        {children}
      </div>
    </div>
  );
}
