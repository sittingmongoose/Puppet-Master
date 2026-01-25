import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useProjectStore } from './projectStore';

describe('projectStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useProjectStore.setState({
      currentProject: null,
      recentProjects: [],
      loading: false,
      error: null,
    });
  });

  it('has initial null current project', () => {
    const { currentProject } = useProjectStore.getState();
    expect(currentProject).toBeNull();
  });

  it('setCurrentProject updates current project', () => {
    const { setCurrentProject } = useProjectStore.getState();
    const project = {
      id: 'proj-1',
      name: 'Test Project',
      path: '/path/to/project',
      lastAccessed: new Date(),
    };
    
    act(() => {
      setCurrentProject(project);
    });
    
    expect(useProjectStore.getState().currentProject).toEqual(project);
  });

  it('setCurrentProject adds to recent projects', () => {
    const { setCurrentProject } = useProjectStore.getState();
    const project = {
      id: 'proj-1',
      name: 'Test Project',
      path: '/path/to/project',
      lastAccessed: new Date(),
    };
    
    act(() => {
      setCurrentProject(project);
    });
    
    const { recentProjects } = useProjectStore.getState();
    expect(recentProjects).toHaveLength(1);
    expect(recentProjects[0]?.id).toBe('proj-1');
  });

  it('addRecentProject moves existing to front', () => {
    const { addRecentProject } = useProjectStore.getState();
    const project1 = { id: 'proj-1', name: 'Project 1', path: '/p1', lastAccessed: new Date() };
    const project2 = { id: 'proj-2', name: 'Project 2', path: '/p2', lastAccessed: new Date() };
    
    act(() => {
      addRecentProject(project1);
      addRecentProject(project2);
      addRecentProject(project1); // Add first project again
    });
    
    const { recentProjects } = useProjectStore.getState();
    expect(recentProjects).toHaveLength(2);
    expect(recentProjects[0]?.id).toBe('proj-1'); // First again
    expect(recentProjects[1]?.id).toBe('proj-2');
  });

  it('addRecentProject limits to 10 projects', () => {
    const { addRecentProject } = useProjectStore.getState();
    
    act(() => {
      for (let i = 0; i < 15; i++) {
        addRecentProject({
          id: `proj-${i}`,
          name: `Project ${i}`,
          path: `/p${i}`,
          lastAccessed: new Date(),
        });
      }
    });
    
    const { recentProjects } = useProjectStore.getState();
    expect(recentProjects).toHaveLength(10);
    expect(recentProjects[0]?.id).toBe('proj-14'); // Most recent
  });

  it('removeRecentProject removes project by id', () => {
    const { addRecentProject, removeRecentProject } = useProjectStore.getState();
    
    act(() => {
      addRecentProject({ id: 'proj-1', name: 'P1', path: '/p1', lastAccessed: new Date() });
      addRecentProject({ id: 'proj-2', name: 'P2', path: '/p2', lastAccessed: new Date() });
    });
    
    act(() => {
      removeRecentProject('proj-1');
    });
    
    const { recentProjects } = useProjectStore.getState();
    expect(recentProjects).toHaveLength(1);
    expect(recentProjects[0]?.id).toBe('proj-2');
  });

  it('setLoading updates loading state', () => {
    const { setLoading } = useProjectStore.getState();
    
    act(() => {
      setLoading(true);
    });
    
    expect(useProjectStore.getState().loading).toBe(true);
  });

  it('setError updates error state', () => {
    const { setError } = useProjectStore.getState();
    
    act(() => {
      setError('Failed to load project');
    });
    
    expect(useProjectStore.getState().error).toBe('Failed to load project');
  });

  it('clearRecent removes all recent projects', () => {
    const { addRecentProject, clearRecent } = useProjectStore.getState();
    
    act(() => {
      addRecentProject({ id: 'proj-1', name: 'P1', path: '/p1', lastAccessed: new Date() });
      addRecentProject({ id: 'proj-2', name: 'P2', path: '/p2', lastAccessed: new Date() });
    });
    
    act(() => {
      clearRecent();
    });
    
    expect(useProjectStore.getState().recentProjects).toHaveLength(0);
  });
});
