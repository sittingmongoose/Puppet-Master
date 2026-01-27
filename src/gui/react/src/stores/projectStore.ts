import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project } from '@/types';

// Re-export Project type for convenience
export type { Project } from '@/types';

/**
 * Project state
 */
interface ProjectState {
  currentProject: Project | null;
  recentProjects: Project[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setCurrentProject: (project: Project | null) => void;
  addRecentProject: (project: Project) => void;
  removeRecentProject: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearRecent: () => void;
}

/**
 * Validates and normalizes project data from localStorage
 */
function validateRecentProjects(data: unknown): Project[] {
  if (!Array.isArray(data)) {
    return [];
  }
  
  // Filter out invalid entries and ensure all have required fields
  return data
    .filter((item): item is Project => {
      return (
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Project).id === 'string' &&
        typeof (item as Project).name === 'string' &&
        typeof (item as Project).path === 'string'
      );
    })
    .map((item) => ({
      ...item,
      // Ensure lastAccessed is a Date or null
      lastAccessed: item.lastAccessed
        ? new Date(item.lastAccessed)
        : null,
    }));
}

/**
 * Project store - manages project selection and history
 * Persists recent projects to localStorage
 */
export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      currentProject: null,
      recentProjects: [],
      loading: false,
      error: null,
      
      setCurrentProject: (project) => {
        set({ currentProject: project });
        if (project) {
          get().addRecentProject(project);
        }
      },
      
      addRecentProject: (project) => set((state) => {
        // Ensure recentProjects is always an array
        const safeRecentProjects = Array.isArray(state.recentProjects)
          ? state.recentProjects
          : [];
        
        // Remove if already exists (will re-add at top)
        const filtered = safeRecentProjects.filter((p) => p.id !== project.id);
        // Add to front and limit to 10
        return {
          recentProjects: [
            { ...project, lastAccessed: new Date() },
            ...filtered,
          ].slice(0, 10),
        };
      }),
      
      removeRecentProject: (id) => set((state) => {
        const safeRecentProjects = Array.isArray(state.recentProjects)
          ? state.recentProjects
          : [];
        return {
          recentProjects: safeRecentProjects.filter((p) => p.id !== id),
        };
      }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearRecent: () => set({ recentProjects: [] }),
    }),
    {
      name: 'rwm-projects',
      partialize: (state) => ({ recentProjects: state.recentProjects }),
      // Validate and normalize data when loading from localStorage
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ProjectState> | null;
        if (persisted?.recentProjects !== undefined) {
          return {
            ...currentState,
            recentProjects: validateRecentProjects(persisted.recentProjects),
          };
        }
        return currentState;
      },
    }
  )
);
