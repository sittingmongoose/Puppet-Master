/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useBudgetStore, useUIStore } from './uiStore';

describe('budgetStore', () => {
  beforeEach(() => {
    const { resetBudgets } = useBudgetStore.getState();
    resetBudgets();
  });

  it('has initial budget for all platforms', () => {
    const { platforms } = useBudgetStore.getState();
    expect(platforms.cursor).toBeDefined();
    expect(platforms.codex).toBeDefined();
    expect(platforms.claude).toBeDefined();
    expect(platforms.gemini).toBeDefined();
    expect(platforms.copilot).toBeDefined();
  });

  it('has default values for each platform', () => {
    const { platforms } = useBudgetStore.getState();
    expect(platforms.cursor.used).toBe(0);
    expect(platforms.cursor.limit).toBe(100);
    expect(platforms.cursor.warning).toBe(false);
  });

  it('updatePlatformBudget updates specific platform', () => {
    const { updatePlatformBudget } = useBudgetStore.getState();
    
    act(() => {
      updatePlatformBudget('cursor', { used: 50, warning: true });
    });
    
    const { platforms } = useBudgetStore.getState();
    expect(platforms.cursor.used).toBe(50);
    expect(platforms.cursor.warning).toBe(true);
    expect(platforms.cursor.limit).toBe(100); // unchanged
  });

  it('updatePlatformBudget does not affect other platforms', () => {
    const { updatePlatformBudget } = useBudgetStore.getState();
    
    act(() => {
      updatePlatformBudget('cursor', { used: 50 });
    });
    
    const { platforms } = useBudgetStore.getState();
    expect(platforms.codex.used).toBe(0);
    expect(platforms.claude.used).toBe(0);
  });

  it('resetBudgets resets all platforms', () => {
    const { updatePlatformBudget, resetBudgets } = useBudgetStore.getState();
    
    act(() => {
      updatePlatformBudget('cursor', { used: 50, exceeded: true });
      updatePlatformBudget('codex', { used: 75, warning: true });
    });
    
    act(() => {
      resetBudgets();
    });
    
    const { platforms } = useBudgetStore.getState();
    expect(platforms.cursor.used).toBe(0);
    expect(platforms.cursor.exceeded).toBe(false);
    expect(platforms.codex.used).toBe(0);
    expect(platforms.codex.warning).toBe(false);
  });
});

describe('uiStore', () => {
  const mockSetAttribute = vi.fn();
  
  beforeEach(() => {
    // Reset store
    useUIStore.setState({
      theme: 'light',
      sidebarOpen: true,
      activeModal: null,
    });
    
    // Mock document.documentElement.setAttribute
    vi.spyOn(document.documentElement, 'setAttribute').mockImplementation(mockSetAttribute);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('has initial light theme', () => {
    const { theme } = useUIStore.getState();
    expect(theme).toBe('light');
  });

  it('setTheme changes theme', () => {
    const { setTheme } = useUIStore.getState();
    
    act(() => {
      setTheme('dark');
    });
    
    expect(useUIStore.getState().theme).toBe('dark');
  });

  it('setTheme applies to DOM', () => {
    const { setTheme } = useUIStore.getState();
    
    act(() => {
      setTheme('dark');
    });
    
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });

  it('toggleTheme switches between light and dark', () => {
    const { toggleTheme } = useUIStore.getState();
    
    act(() => {
      toggleTheme();
    });
    
    expect(useUIStore.getState().theme).toBe('dark');
    
    act(() => {
      toggleTheme();
    });
    
    expect(useUIStore.getState().theme).toBe('light');
  });

  it('has initial open sidebar', () => {
    const { sidebarOpen } = useUIStore.getState();
    expect(sidebarOpen).toBe(true);
  });

  it('setSidebarOpen changes sidebar state', () => {
    const { setSidebarOpen } = useUIStore.getState();
    
    act(() => {
      setSidebarOpen(false);
    });
    
    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });

  it('toggleSidebar toggles sidebar state', () => {
    const { toggleSidebar } = useUIStore.getState();
    
    act(() => {
      toggleSidebar();
    });
    
    expect(useUIStore.getState().sidebarOpen).toBe(false);
    
    act(() => {
      toggleSidebar();
    });
    
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('openModal sets active modal', () => {
    const { openModal } = useUIStore.getState();
    
    act(() => {
      openModal('settings');
    });
    
    expect(useUIStore.getState().activeModal).toBe('settings');
  });

  it('closeModal clears active modal', () => {
    const { openModal, closeModal } = useUIStore.getState();
    
    act(() => {
      openModal('settings');
    });
    
    act(() => {
      closeModal();
    });
    
    expect(useUIStore.getState().activeModal).toBeNull();
  });
});
