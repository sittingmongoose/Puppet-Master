import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: ReactNode;
  /** Footer content (typically buttons) */
  footer?: ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'full';
  /** Whether clicking outside closes the modal */
  closeOnClickOutside?: boolean;
  /** Whether pressing Escape closes the modal */
  closeOnEscape?: boolean;
}

/**
 * Modal component following the design system
 * Uses panel styling with proper focus management and accessibility
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnClickOutside = true,
  closeOnEscape = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Size classes matching panel widths
  const sizeClasses: Record<typeof size, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    full: 'max-w-[90vw]',
  };

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      modalRef.current?.focus();
    } else if (previousActiveElement.current instanceof HTMLElement) {
      previousActiveElement.current.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnClickOutside && e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-ink-black/70 dark:bg-ink-black/80"
        aria-hidden="true"
      />
      
      {/* Modal panel */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        className={`
          relative
          w-full ${sizeClasses[size]}
          mx-md
          bg-paper-cream dark:bg-paper-dark
          border-thick border-ink-black dark:border-ink-light
          shadow-panel dark:shadow-panel-dark
          focus:outline-none
          animate-in fade-in zoom-in-95 duration-200
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-lg py-md border-b-medium border-ink-black dark:border-ink-light">
            <h2
              id="modal-title"
              className="font-display font-bold text-xl uppercase tracking-wider text-ink-black dark:text-ink-light"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-xs text-ink-black dark:text-ink-light hover:text-hot-magenta transition-colors"
              aria-label="Close modal"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4L16 16M16 4L4 16" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-lg py-md max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-sm px-lg py-md border-t-medium border-ink-black dark:border-ink-light">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
