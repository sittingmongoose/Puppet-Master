import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from './Toast';

// Test component that exposes toast functions
function TestComponent() {
  const { addToast, toasts } = useToast();
  return (
    <div>
      <button onClick={() => addToast('success', 'Success message')}>Add Success</button>
      <button onClick={() => addToast('error', 'Error message')}>Add Error</button>
      <button onClick={() => addToast('warning', 'Warning message')}>Add Warning</button>
      <button onClick={() => addToast('info', 'Info message')}>Add Info</button>
      <button onClick={() => addToast('success', 'No auto dismiss', 0)}>Add Persistent</button>
      <span data-testid="count">{toasts.length}</span>
    </div>
  );
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders toast when added', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Add Success'));
    });
    
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders multiple toasts', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Add Success'));
      fireEvent.click(screen.getByText('Add Error'));
    });
    
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });

  it('auto-dismisses after duration', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Add Success'));
    });
    expect(screen.getByText('Success message')).toBeInTheDocument();

    // Advance past the default 5000ms duration
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  it('does not auto-dismiss when duration is 0', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Add Persistent'));
    });
    
    // Advance way past default duration
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText('No auto dismiss')).toBeInTheDocument();
  });

  it('dismisses on click', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Add Success'));
    });
    expect(screen.getByText('Success message')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByLabelText('Dismiss notification'));
    });
    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  it('applies success styling', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Add Success'));
    });
    expect(screen.getByRole('alert')).toHaveClass('bg-acid-lime', 'text-ink-black');
  });

  it('applies error styling', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Add Error'));
    });
    expect(screen.getByRole('alert')).toHaveClass('bg-hot-magenta', 'text-paper-cream');
  });

  it('applies warning styling', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Add Warning'));
    });
    expect(screen.getByRole('alert')).toHaveClass('bg-safety-orange', 'text-ink-black');
  });

  it('applies info styling', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Add Info'));
    });
    expect(screen.getByRole('alert')).toHaveClass('bg-electric-blue', 'text-paper-cream');
  });

  it('throws error when useToast is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');
    
    consoleError.mockRestore();
  });

  it('renders in a portal at document.body', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Add Success'));
    });
    
    const region = screen.getByRole('region', { name: 'Notifications' });
    expect(region.parentElement).toBe(document.body);
  });
});
