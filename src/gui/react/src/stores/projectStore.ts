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
        // Remove if already exists (will re-add at top)
        const filtered = state.recentProjects.filter((p) => p.id !== project.id);
        // Add to front and limit to 10
        return {
          recentProjects: [
            { ...project, lastAccessed: new Date() },
            ...filtered,
          ].slice(0, 10),
        };
      }),
      
      removeRecentProject: (id) => set((state) => ({
        recentProjects: state.recentProjects.filter((p) => p.id !== id),
      })),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearRecent: () => set({ recentProjects: [] }),
    }),
    {
      name: 'rwm-projects',
      partialize: (state) => ({ recentProjects: state.recentProjects }),
    }
  )
);
