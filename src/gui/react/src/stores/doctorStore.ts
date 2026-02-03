import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DoctorCheck, PlatformStatusType } from '@/lib';
import type { Platform } from '@/types';

interface DoctorStoreState {
  checks: DoctorCheck[];
  platformStatus: Record<string, PlatformStatusType>;
  selectedPlatforms: Platform[];
  _hasHydrated: boolean;
  setChecks: (checks: DoctorCheck[]) => void;
  setPlatformStatus: (status: Record<string, PlatformStatusType>) => void;
  setSelectedPlatforms: (platforms: Platform[]) => void;
  setHasHydrated: (value: boolean) => void;
  reset: () => void;
}

/** In-memory fallback when sessionStorage is unavailable (e.g. private mode). */
const doctorMemoryFallback: Record<string, string> = {};
const memoryStorage = {
  getItem: (name: string): string | null => doctorMemoryFallback[name] ?? null,
  setItem: (name: string, value: string): void => {
    doctorMemoryFallback[name] = value;
  },
  removeItem: (name: string): void => {
    delete doctorMemoryFallback[name];
  },
};

const storage = (() => {
  try {
    if (typeof window === 'undefined') return createJSONStorage(() => memoryStorage);
    const ls = window.sessionStorage;
    if (ls && typeof ls.getItem === 'function' && typeof ls.setItem === 'function' && typeof ls.removeItem === 'function') {
      return createJSONStorage(() => ls);
    }
  } catch {
    // sessionStorage not available (e.g. private mode)
  }
  return createJSONStorage(() => memoryStorage);
})();

export const useDoctorStore = create<DoctorStoreState>()(
  persist(
    (set) => ({
      checks: [],
      platformStatus: {},
      selectedPlatforms: [],
      _hasHydrated: false,
      setChecks: (checks) => set({ checks }),
      setPlatformStatus: (platformStatus) => set({ platformStatus }),
      setSelectedPlatforms: (selectedPlatforms) => set({ selectedPlatforms }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      reset: () => set({ checks: [], platformStatus: {}, selectedPlatforms: [] }),
    }),
    {
      name: 'rwm-doctor',
      storage,
      partialize: (state) => ({
        checks: state.checks,
        platformStatus: state.platformStatus,
        selectedPlatforms: state.selectedPlatforms,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
