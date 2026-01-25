import type { ReactNode } from 'react';

export interface PageLayoutProps {
  /** Page content */
  children: ReactNode;
  /** Page title for header */
  title?: string;
  /** Whether page is in loading state */
  loading?: boolean;
  /** Header actions slot */
  actions?: ReactNode;
}

/**
 * PageLayout component for consistent page structure
 * Wraps content in the panel styling from the design system
 */
export function PageLayout({
  children,
  title,
  loading = false,
  actions,
}: PageLayoutProps) {
  return (
    <main className="flex-1 min-w-0 px-lg pb-lg">
      {/* Page header with title and actions */}
      {(title || actions) && (
        <div className="flex justify-between items-center flex-wrap gap-md mb-lg">
          {title && (
            <h1
              className="
                font-display font-bold
                text-xl uppercase tracking-wider
                text-ink-black dark:text-ink-light
                m-0
              "
            >
              {title}
            </h1>
          )}
          {actions && (
            <div className="flex items-center gap-sm">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div
          className="
            fixed inset-0 z-40
            bg-paper-cream/80 dark:bg-paper-dark/80
            flex items-center justify-center
          "
          role="status"
          aria-label="Loading"
        >
          <div className="flex flex-col items-center gap-md">
            <div
              className="
                w-16 h-16
                border-thick border-ink-black
                dark:border-ink-light
                border-t-electric-blue
                rounded-full
                animate-spin
              "
            />
            <span className="font-geometric font-bold uppercase tracking-wider">
              Loading...
            </span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
        {children}
      </div>
    </main>
  );
}
