import { createContext, useContext, useCallback, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckmarkIcon,
  CrossIcon,
  WarningIcon,
  InfoIcon,
} from '@/components/icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Hook to access toast functionality
 * Note: Exported alongside ToastProvider as they must be used together.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Toast provider that manages toast state
 * Fixes Issue #16: No Toast Container
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const toast: Toast = { id, type, message, duration };
    
    setToasts(prev => [...prev, toast]);

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

/**
 * Toast container that renders toasts in a portal
 * Positioned at bottom-right matching common UI patterns
 */
function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed bottom-lg right-lg z-50 flex flex-col gap-sm max-w-[400px]"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  );
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

/**
 * Individual toast component matching existing design system
 */
function ToastItem({ toast, onDismiss }: ToastItemProps) {
  // Colors matching design system
  const typeClasses: Record<ToastType, string> = {
    success: 'bg-acid-lime text-ink-black border-acid-lime',
    error: 'bg-hot-magenta text-paper-cream border-hot-magenta',
    warning: 'bg-safety-orange text-ink-black border-safety-orange',
    info: 'bg-electric-blue text-paper-cream border-electric-blue',
  };

  // Icons for each type
  const icons: Record<ToastType, ReactNode> = {
    success: <CheckmarkIcon size="1em" />,
    error: <CrossIcon size="1em" />,
    warning: <WarningIcon size="1em" />,
    info: <InfoIcon size="1em" />,
  };

  return (
    <div
      className={`
        flex items-start gap-sm
        px-md py-sm
        border-thick border-ink-black
        font-ui font-bold
        shadow-panel
        animate-in slide-in-from-right-5 fade-in duration-200
        ${typeClasses[toast.type]}
      `}
      role="alert"
      aria-live="polite"
    >
      <span className="flex items-center" aria-hidden="true">
        {icons[toast.type]}
      </span>
      <p className="flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="hover:opacity-70 transition-opacity flex items-center"
        aria-label="Dismiss notification"
      >
        <CrossIcon size="1em" />
      </button>
    </div>
  );
}

export { ToastContainer, ToastItem };
