import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from './Dashboard.js';
import * as stores from '@/stores';
import * as lib from '@/lib';

// Mock the stores
vi.mock('@/stores', () => ({
  useOrchestratorStore: vi.fn(),
  useProjectStore: vi.fn(),
  useBudgetStore: vi.fn(),
}));

// Mock the lib
vi.mock('@/lib', () => ({
  useSSEStatus: vi.fn(),
  useSSEStoreIntegration: vi.fn(),
  api: {
    getState: vi.fn(),
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
    retry: vi.fn(),
  },
}));

const mockUseOrchestratorStore = stores.useOrchestratorStore as unknown as ReturnType<typeof vi.fn>;
const mockUseProjectStore = stores.useProjectStore as unknown as ReturnType<typeof vi.fn>;
const mockUseBudgetStore = stores.useBudgetStore as unknown as ReturnType<typeof vi.fn>;
const mockUseSSEStatus = lib.useSSEStatus as unknown as ReturnType<typeof vi.fn>;
const mockApi = lib.api as unknown as {
  getState: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  resume: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  retry: ReturnType<typeof vi.fn>;
};

function renderDashboard() {
  return render(
    <BrowserRouter>
      <DashboardPage />
    </BrowserRouter>
  );
}

describe('DashboardPage', () => {
  const setStatus = vi.fn();
  const setCurrentItem = vi.fn();
  const updateProgress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default orchestrator state
    mockUseOrchestratorStore.mockImplementation((selector: (s: unknown) => unknown) => {
      const state = {
        status: 'idle',
        currentItem: null,
        progress: {
          phase: { current: 0, total: 5 },
          task: { current: 0, total: 10 },
          subtask: { current: 0, total: 20 },
          iteration: { current: 0, total: 3 },
          overall: 0,
        },
        output: [],
        setStatus,
        setCurrentItem,
        updateProgress,
      };
      return selector(state);
    });

    // Default project state
    mockUseProjectStore.mockImplementation((selector: (s: unknown) => unknown) => {
      const state = {
        currentProject: null,
        recentProjects: [],
      };
      return selector(state);
    });

    // Default budget state
    mockUseBudgetStore.mockImplementation((selector: (s: unknown) => unknown) => {
      const state = {
        platforms: {
          claude: { used: 10, limit: 100 },
          codex: { used: 5, limit: 50 },
          cursor: { used: 2, limit: 20 },
        },
      };
      return selector(state);
    });

    // Default SSE status
    mockUseSSEStatus.mockReturnValue({ connected: true });

    // Default API responses
    mockApi.getState.mockResolvedValue({
      orchestratorState: 'idle',
      currentItem: null,
      progress: null,
    });
  });

  it('renders all main panels', () => {
    renderDashboard();
    
    expect(screen.getByText('Project Management')).toBeInTheDocument();
    expect(screen.getByText('Current Item')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('Run Controls')).toBeInTheDocument();
    expect(screen.getByText('Live Output')).toBeInTheDocument();
  });

  it('shows no project message when no project loaded', () => {
    renderDashboard();
    
    expect(screen.getByText(/No project loaded/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /START NEW PROJECT/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SELECT EXISTING PROJECT/i })).toBeInTheDocument();
  });

  it('shows project info when project is loaded', () => {
    mockUseProjectStore.mockImplementation((selector: (s: unknown) => unknown) => {
      const state = {
        currentProject: { name: 'My Project', path: '/path/to/project' },
        recentProjects: [],
      };
      return selector(state);
    });

    renderDashboard();
    
    expect(screen.getByText('My Project')).toBeInTheDocument();
    expect(screen.getByText('/path/to/project')).toBeInTheDocument();
  });

  it('shows status badge with correct status', () => {
    mockUseOrchestratorStore.mockImplementation((selector: (s: unknown) => unknown) => {
      const state = {
        status: 'running',
        currentItem: null,
        progress: {
          phase: { current: 1, total: 5 },
          task: { current: 2, total: 10 },
          subtask: { current: 5, total: 20 },
          iteration: { current: 1, total: 3 },
          overall: 25,
        },
        output: [],
        setStatus,
        setCurrentItem,
        updateProgress,
      };
      return selector(state);
    });

    renderDashboard();
    
    expect(screen.getByText('RUNNING')).toBeInTheDocument();
  });

  it('shows progress values in status bar', () => {
    mockUseOrchestratorStore.mockImplementation((selector: (s: unknown) => unknown) => {
      const state = {
        status: 'running',
        currentItem: null,
        progress: {
          phase: { current: 2, total: 5 },
          task: { current: 3, total: 10 },
          subtask: { current: 7, total: 20 },
          iteration: { current: 1, total: 3 },
          overall: 35,
        },
        output: [],
        setStatus,
        setCurrentItem,
        updateProgress,
      };
      return selector(state);
    });

    renderDashboard();
    
    expect(screen.getByText('Phase 2/5')).toBeInTheDocument();
    expect(screen.getByText('Task 3/10')).toBeInTheDocument();
    expect(screen.getByText('Subtask 7/20')).toBeInTheDocument();
    expect(screen.getByText('Iter 1/3')).toBeInTheDocument();
  });

  it('shows current item when available', () => {
    mockUseOrchestratorStore.mockImplementation((selector: (s: unknown) => unknown) => {
      const state = {
        status: 'running',
        currentItem: {
          id: 'T01-S01',
          type: 'subtask',
          title: 'Implement feature X',
          status: 'running',
        },
        progress: {
          phase: { current: 1, total: 5 },
          task: { current: 1, total: 10 },
          subtask: { current: 1, total: 20 },
          iteration: { current: 1, total: 3 },
          overall: 5,
        },
        output: [],
        setStatus,
        setCurrentItem,
        updateProgress,
      };
      return selector(state);
    });

    renderDashboard();
    
    expect(screen.getByText('T01-S01')).toBeInTheDocument();
    expect(screen.getByText('Implement feature X')).toBeInTheDocument();
  });

  it('shows no active item message when no current item', () => {
    renderDashboard();
    
    expect(screen.getByText('No active item')).toBeInTheDocument();
  });

  it('shows output lines in live output panel', () => {
    mockUseOrchestratorStore.mockImplementation((selector: (s: unknown) => unknown) => {
      const state = {
        status: 'running',
        currentItem: null,
        progress: {
          phase: { current: 0, total: 5 },
          task: { current: 0, total: 10 },
          subtask: { current: 0, total: 20 },
          iteration: { current: 0, total: 3 },
          overall: 0,
        },
        output: [
          { id: '1', timestamp: new Date(), type: 'stdout', content: 'Building project...' },
          { id: '2', timestamp: new Date(), type: 'stderr', content: 'Warning: deprecated API' },
        ],
        setStatus,
        setCurrentItem,
        updateProgress,
      };
      return selector(state);
    });

    renderDashboard();
    
    expect(screen.getByText('Building project...')).toBeInTheDocument();
    expect(screen.getByText('Warning: deprecated API')).toBeInTheDocument();
  });

  it('shows waiting message when no output', () => {
    renderDashboard();
    
    expect(screen.getByText('Waiting for output...')).toBeInTheDocument();
  });

  it('disables start button when no project', () => {
    renderDashboard();
    
    const startButton = screen.getByRole('button', { name: 'START' });
    expect(startButton).toBeDisabled();
  });

  it('enables start button when project loaded and status is idle', () => {
    mockUseProjectStore.mockImplementation((selector: (s: unknown) => unknown) => {
      const state = {
        currentProject: { name: 'My Project', path: '/path/to/project' },
        recentProjects: [],
      };
      return selector(state);
    });

    renderDashboard();
    
    const startButton = screen.getByRole('button', { name: 'START' });
    expect(startButton).not.toBeDisabled();
  });

  it('calls api.start when start button clicked', async () => {
    mockUseProjectStore.mockImplementation((selector: (s: unknown) => unknown) => {
      const state = {
        currentProject: { name: 'My Project', path: '/path/to/project' },
        recentProjects: [],
      };
      return selector(state);
    });
    mockApi.start.mockResolvedValue({});

    renderDashboard();
    
    const startButton = screen.getByRole('button', { name: 'START' });
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(mockApi.start).toHaveBeenCalled();
    });
  });

  it('enables pause button when running', () => {
    mockUseOrchestratorStore.mockImplementation((selector: (s: unknown) => unknown) => {
      const state = {
        status: 'running',
        currentItem: null,
        progress: {
          phase: { current: 0, total: 5 },
          task: { current: 0, total: 10 },
          subtask: { current: 0, total: 20 },
          iteration: { current: 0, total: 3 },
          overall: 0,
        },
        output: [],
        setStatus,
        setCurrentItem,
        updateProgress,
      };
      return selector(state);
    });

    renderDashboard();
    
    const pauseButton = screen.getByRole('button', { name: 'PAUSE' });
    expect(pauseButton).not.toBeDisabled();
  });

  it('shows resume button enabled when paused', () => {
    mockUseOrchestratorStore.mockImplementation((selector: (s: unknown) => unknown) => {
      const state = {
        status: 'paused',
        currentItem: null,
        progress: {
          phase: { current: 0, total: 5 },
          task: { current: 0, total: 10 },
          subtask: { current: 0, total: 20 },
          iteration: { current: 0, total: 3 },
          overall: 0,
        },
        output: [],
        setStatus,
        setCurrentItem,
        updateProgress,
      };
      return selector(state);
    });

    renderDashboard();
    
    const resumeButton = screen.getByRole('button', { name: 'RESUME' });
    expect(resumeButton).not.toBeDisabled();
  });

  it('shows retry button when in error state', () => {
    mockUseOrchestratorStore.mockImplementation((selector: (s: unknown) => unknown) => {
      const state = {
        status: 'error',
        currentItem: null,
        progress: {
          phase: { current: 0, total: 5 },
          task: { current: 0, total: 10 },
          subtask: { current: 0, total: 20 },
          iteration: { current: 0, total: 3 },
          overall: 0,
        },
        output: [],
        setStatus,
        setCurrentItem,
        updateProgress,
      };
      return selector(state);
    });

    renderDashboard();
    
    const retryButton = screen.getByRole('button', { name: 'RETRY' });
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).not.toBeDisabled();
  });

  it('shows connection status as connected', () => {
    renderDashboard();
    
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('shows connection status as disconnected', () => {
    mockUseSSEStatus.mockReturnValue({ connected: false });
    
    renderDashboard();
    
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('shows budget info in status bar', () => {
    renderDashboard();
    
    expect(screen.getByText(/claude 10\/100/i)).toBeInTheDocument();
    expect(screen.getByText(/codex 5\/50/i)).toBeInTheDocument();
    expect(screen.getByText(/cursor 2\/20/i)).toBeInTheDocument();
  });

  it('fetches initial state on mount', async () => {
    renderDashboard();
    
    await waitFor(() => {
      expect(mockApi.getState).toHaveBeenCalled();
    });
  });

  it('updates store with fetched state', async () => {
    mockApi.getState.mockResolvedValue({
      orchestratorState: 'running',
      currentItem: { id: 'T01', title: 'Test' },
      progress: { phase: { current: 1, total: 5 } },
    });

    renderDashboard();
    
    await waitFor(() => {
      expect(setStatus).toHaveBeenCalledWith('running');
      expect(setCurrentItem).toHaveBeenCalledWith({ id: 'T01', title: 'Test' });
      expect(updateProgress).toHaveBeenCalledWith({ phase: { current: 1, total: 5 } });
    });
  });
});
