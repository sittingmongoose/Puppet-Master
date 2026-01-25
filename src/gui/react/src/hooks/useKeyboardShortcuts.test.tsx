import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useKeyboardShortcuts, SHORTCUTS_DATA } from './useKeyboardShortcuts';

// Mock the orchestrator store
const mockSetStatus = vi.fn();
const mockStatus = { current: 'idle' };

vi.mock('@/stores/orchestratorStore', () => ({
  useOrchestratorStore: () => ({
    status: mockStatus.current,
    setStatus: mockSetStatus,
  }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function wrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStatus.current = 'idle';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns shortcuts array', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    expect(result.current.shortcuts).toBeDefined();
    expect(Array.isArray(result.current.shortcuts)).toBe(true);
    expect(result.current.shortcuts.length).toBeGreaterThan(0);
  });

  it('responds to space key when idle', () => {
    mockStatus.current = 'idle';
    renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    });
    
    expect(mockSetStatus).toHaveBeenCalledWith('running');
  });

  it('responds to space key when running (pause)', () => {
    mockStatus.current = 'running';
    renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    });
    
    expect(mockSetStatus).toHaveBeenCalledWith('paused');
  });

  it('responds to escape key', () => {
    mockStatus.current = 'running';
    renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    
    expect(mockSetStatus).toHaveBeenCalledWith('idle');
  });

  it('navigates to tiers on g key', () => {
    renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g' }));
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/tiers');
  });

  it('navigates to doctor on d key', () => {
    renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/doctor');
  });

  it('navigates to history on l key', () => {
    renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'l' }));
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/history');
  });

  it('navigates to budgets on b key', () => {
    renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }));
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/config?tab=budgets');
  });

  it('navigates to memory on m key', () => {
    renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' }));
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/config?tab=memory');
  });

  it('calls onShowHelp on ? key', () => {
    const onShowHelp = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onShowHelp }), { wrapper });
    
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
    });
    
    expect(onShowHelp).toHaveBeenCalled();
  });

  it('calls onCommandPalette on / key', () => {
    const onCommandPalette = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onCommandPalette }), { wrapper });
    
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
    });
    
    expect(onCommandPalette).toHaveBeenCalled();
  });

  it('navigates to tier views on number keys', () => {
    renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    });
    expect(mockNavigate).toHaveBeenCalledWith('/tiers?level=phase');
    
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '2' }));
    });
    expect(mockNavigate).toHaveBeenCalledWith('/tiers?level=task');
    
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '3' }));
    });
    expect(mockNavigate).toHaveBeenCalledWith('/tiers?level=subtask');
    
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '4' }));
    });
    expect(mockNavigate).toHaveBeenCalledWith('/tiers?level=iteration');
  });

  it('does not respond when disabled', () => {
    renderHook(() => useKeyboardShortcuts({ enabled: false }), { wrapper });
    
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
    });
    
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('cleans up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});

describe('SHORTCUTS_DATA', () => {
  it('has all categories', () => {
    const categories = SHORTCUTS_DATA.map((g) => g.category);
    
    expect(categories).toContain('Execution');
    expect(categories).toContain('Navigation');
    expect(categories).toContain('Tier Views');
    expect(categories).toContain('General');
  });

  it('has execution shortcuts', () => {
    const execution = SHORTCUTS_DATA.find((g) => g.category === 'Execution');
    
    expect(execution).toBeDefined();
    expect(execution?.shortcuts.find((s) => s.key === 'Space')).toBeDefined();
    expect(execution?.shortcuts.find((s) => s.key === 'Esc')).toBeDefined();
    expect(execution?.shortcuts.find((s) => s.key === 'R')).toBeDefined();
  });

  it('has navigation shortcuts', () => {
    const navigation = SHORTCUTS_DATA.find((g) => g.category === 'Navigation');
    
    expect(navigation).toBeDefined();
    expect(navigation?.shortcuts.find((s) => s.key === 'G')).toBeDefined();
    expect(navigation?.shortcuts.find((s) => s.key === 'D')).toBeDefined();
    expect(navigation?.shortcuts.find((s) => s.key === 'L')).toBeDefined();
    expect(navigation?.shortcuts.find((s) => s.key === 'B')).toBeDefined();
    expect(navigation?.shortcuts.find((s) => s.key === 'M')).toBeDefined();
  });

  it('has tier view shortcuts 1-4', () => {
    const tierViews = SHORTCUTS_DATA.find((g) => g.category === 'Tier Views');
    
    expect(tierViews).toBeDefined();
    expect(tierViews?.shortcuts.find((s) => s.key === '1')).toBeDefined();
    expect(tierViews?.shortcuts.find((s) => s.key === '2')).toBeDefined();
    expect(tierViews?.shortcuts.find((s) => s.key === '3')).toBeDefined();
    expect(tierViews?.shortcuts.find((s) => s.key === '4')).toBeDefined();
  });

  it('has general shortcuts', () => {
    const general = SHORTCUTS_DATA.find((g) => g.category === 'General');
    
    expect(general).toBeDefined();
    expect(general?.shortcuts.find((s) => s.key === '?')).toBeDefined();
    expect(general?.shortcuts.find((s) => s.key === '/')).toBeDefined();
  });
});
