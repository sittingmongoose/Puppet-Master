import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Platform, Theme } from '@/types';

/**
 * Budget information per platform
 */
export interface BudgetInfo {
  platform: Platform;
  used: number;
  limit: number;
  period: 'hourly' | 'daily' | 'run';
  warning: boolean;
  exceeded: boolean;
}

/**
 * Budget state
 */
interface BudgetState {
  platforms: Record<Platform, BudgetInfo>;
  
  // Actions
  updatePlatformBudget: (platform: Platform, info: Partial<BudgetInfo>) => void;
  resetBudgets: () => void;
}

const defaultBudget = (platform: Platform): BudgetInfo => ({
  platform,
  used: 0,
  limit: 100,
  period: 'daily',
  warning: false,
  exceeded: false,
});

/**
 * Budget store - tracks platform usage limits
 */
export const useBudgetStore = create<BudgetState>((set) => ({
  platforms: {
    cursor: defaultBudget('cursor'),
    codex: defaultBudget('codex'),
    claude: defaultBudget('claude'),
    gemini: defaultBudget('gemini'),
    copilot: defaultBudget('copilot'),
  },
  
  updatePlatformBudget: (platform, info) => set((state) => ({
    platforms: {
      ...state.platforms,
      [platform]: { ...state.platforms[platform], ...info },
    },
  })),
  
  resetBudgets: () => set({
    platforms: {
      cursor: defaultBudget('cursor'),
      codex: defaultBudget('codex'),
      claude: defaultBudget('claude'),
      gemini: defaultBudget('gemini'),
      copilot: defaultBudget('copilot'),
    },
  }),
}));

/**
 * UI state
 */
interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  activeModal: string | null;
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

/**
 * UI store - manages theme and layout state
 * Persists theme to localStorage
 */
export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebarOpen: true,
      activeModal: null,
      
      setTheme: (theme) => {
        set({ theme });
        // Apply to DOM
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },
      
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
      
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      openModal: (activeModal) => set({ activeModal }),
      
      closeModal: () => set({ activeModal: null }),
    }),
    {
      name: 'rwm-ui',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        // Apply theme on rehydration
        if (state?.theme && typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      },
    }
  )
);
