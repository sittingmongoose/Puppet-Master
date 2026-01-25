import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectsPage from './Projects.js';
import * as stores from '@/stores';
import * as lib from '@/lib';
import type { Project } from '@/types';

// Mock the stores
vi.mock('@/stores', () => ({
  useProjectStore: vi.fn(),
}));

// Mock the lib
vi.mock('@/lib', () => ({
  api: {
    listProjects: vi.fn(),
    openProject: vi.fn(),
  },
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

const mockUseProjectStore = stores.useProjectStore as unknown as ReturnType<typeof vi.fn>;
const mockApi = lib.api as unknown as {
  listProjects: ReturnType<typeof vi.fn>;
  openProject: ReturnType<typeof vi.fn>;
};

const sampleProject: Project = {
  id: 'proj-1',
  name: 'Test Project',
  path: '/path/to/test',
  lastAccessed: new Date('2026-01-20'),
};

function renderProjects() {
  return render(
    <BrowserRouter>
      <ProjectsPage />
    </BrowserRouter>
  );
}

describe('ProjectsPage', () => {
  const setCurrentProject = vi.fn();
  const addRecentProject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Default store state
    mockUseProjectStore.mockImplementation((selector: (s: unknown) => unknown) => {
      const state = {
        currentProject: null,
        recentProjects: [],
        setCurrentProject,
        addRecentProject,
      };
      return selector(state);
    });

    // Default API responses
    mockApi.listProjects.mockResolvedValue([]);
    mockApi.openProject.mockResolvedValue(sampleProject);
  });

  it('renders page title', () => {
    renderProjects();
    
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('renders start new project button', () => {
    renderProjects();
    
    expect(screen.getByRole('button', { name: /START NEW PROJECT/i })).toBeInTheDocument();
  });

  it('shows loading state while fetching projects', () => {
    // Make the API call hang
    mockApi.listProjects.mockImplementation(() => new Promise(() => {}));
    
    renderProjects();
    
    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
  });

  it('shows empty state when no projects', async () => {
    mockApi.listProjects.mockResolvedValue([]);
    
    renderProjects();
    
    await waitFor(() => {
      expect(screen.getByText('No projects found.')).toBeInTheDocument();
    });
  });

  it('shows projects table when projects exist', async () => {
    mockApi.listProjects.mockResolvedValue([sampleProject]);
    
    renderProjects();
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('/path/to/test')).toBeInTheDocument();
    });
  });

  it('shows error message when API fails', async () => {
    mockApi.listProjects.mockRejectedValue(new Error('Network error'));
    
    renderProjects();
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('shows current project when set', () => {
    mockUseProjectStore.mockImplementation((selector: (s: unknown) => unknown) => {
      const state = {
        currentProject: sampleProject,
        recentProjects: [],
        setCurrentProject,
        addRecentProject,
      };
      return selector(state);
    });
    
    renderProjects();
    
    expect(screen.getByText('Current Project')).toBeInTheDocument();
    expect(screen.getByText('CURRENT')).toBeInTheDocument();
  });

  it('shows recent projects section when there are recent projects', () => {
    mockUseProjectStore.mockImplementation((selector: (s: unknown) => unknown) => {
      const state = {
        currentProject: null,
        recentProjects: [sampleProject],
        setCurrentProject,
        addRecentProject,
      };
      return selector(state);
    });
    
    renderProjects();
    
    expect(screen.getByText('Recent Projects')).toBeInTheDocument();
  });

  it('toggles open project form', async () => {
    renderProjects();
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });
    
    // Click to show form
    fireEvent.click(screen.getByRole('button', { name: /OPEN EXISTING/i }));
    expect(screen.getByText('Open Project')).toBeInTheDocument();
    
    // Now there are two CANCEL buttons: one at top header, one in form
    const cancelButtons = screen.getAllByRole('button', { name: /^CANCEL$/i });
    expect(cancelButtons.length).toBe(2);
    
    // Click the header CANCEL button (first one) to close form
    const cancelButton = cancelButtons[0];
    if (cancelButton) {
      fireEvent.click(cancelButton);
    }
    expect(screen.queryByText('Open Project')).not.toBeInTheDocument();
  });

  it('shows browser limitation note in open form', () => {
    renderProjects();
    
    fireEvent.click(screen.getByRole('button', { name: /OPEN EXISTING/i }));
    
    expect(screen.getByText(/browser security restrictions/i)).toBeInTheDocument();
  });

  it('opens project when clicking OPEN button', async () => {
    mockApi.listProjects.mockResolvedValue([sampleProject]);
    
    renderProjects();
    
    // Wait for the table to appear with the project
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Wait for loading to complete (ensure not in loading state)
    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });

    // Click the OPEN button in the table row
    const openButtons = screen.getAllByRole('button', { name: /^OPEN$/i });
    const openButton = openButtons[0];
    if (openButton) {
      fireEvent.click(openButton);
    }
    
    await waitFor(() => {
      expect(mockApi.openProject).toHaveBeenCalledWith('/path/to/test');
      expect(setCurrentProject).toHaveBeenCalledWith(sampleProject);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('submits open project form with path', async () => {
    renderProjects();
    
    fireEvent.click(screen.getByRole('button', { name: /OPEN EXISTING/i }));
    
    const pathInput = screen.getByLabelText(/Project Path/i);
    fireEvent.change(pathInput, { target: { value: '/my/new/project' } });
    
    fireEvent.click(screen.getByRole('button', { name: /^OPEN PROJECT$/i }));
    
    await waitFor(() => {
      expect(mockApi.openProject).toHaveBeenCalledWith('/my/new/project');
    });
  });

  it('shows validation error when path is empty', async () => {
    renderProjects();
    
    fireEvent.click(screen.getByRole('button', { name: /OPEN EXISTING/i }));
    
    // Enter something then clear it (to bypass HTML5 validation)
    const pathInput = screen.getByLabelText(/Project Path/i);
    fireEvent.change(pathInput, { target: { value: 'a' } });
    fireEvent.change(pathInput, { target: { value: '   ' } });  // Just spaces
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /^OPEN PROJECT$/i }));
    
    expect(screen.getByText('Project path is required')).toBeInTheDocument();
    expect(mockApi.openProject).not.toHaveBeenCalled();
  });

  it('extracts project name from path when not provided', async () => {
    renderProjects();
    
    fireEvent.click(screen.getByRole('button', { name: /OPEN EXISTING/i }));
    
    const pathInput = screen.getByLabelText(/Project Path/i);
    fireEvent.change(pathInput, { target: { value: '/path/to/my-project' } });
    
    fireEvent.click(screen.getByRole('button', { name: /^OPEN PROJECT$/i }));
    
    await waitFor(() => {
      expect(setCurrentProject).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'my-project',
          path: '/path/to/my-project',
        })
      );
    });
  });

  it('uses custom project name when provided', async () => {
    renderProjects();
    
    fireEvent.click(screen.getByRole('button', { name: /OPEN EXISTING/i }));
    
    const pathInput = screen.getByLabelText(/Project Path/i);
    fireEvent.change(pathInput, { target: { value: '/path/to/project' } });
    
    const nameInput = screen.getByLabelText(/Project Name/i);
    fireEvent.change(nameInput, { target: { value: 'My Custom Name' } });
    
    fireEvent.click(screen.getByRole('button', { name: /^OPEN PROJECT$/i }));
    
    await waitFor(() => {
      expect(setCurrentProject).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My Custom Name',
          path: '/path/to/project',
        })
      );
    });
  });

  it('navigates to wizard when clicking start new project', () => {
    renderProjects();
    
    const link = screen.getByRole('link', { name: /START NEW PROJECT/i });
    expect(link).toHaveAttribute('href', '/wizard');
  });
});
