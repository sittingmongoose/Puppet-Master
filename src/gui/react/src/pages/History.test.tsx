import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HistoryPage from './History.js';
import * as lib from '@/lib';

vi.mock('@/lib', () => ({
  api: {
    getHistory: vi.fn(),
  },
  getErrorMessage: vi.fn().mockImplementation((_error: unknown, fallback: string) => fallback),
}));

const mockApi = lib.api as unknown as {
  getHistory: ReturnType<typeof vi.fn>;
};

function renderHistory() {
  return render(
    <BrowserRouter>
      <HistoryPage />
    </BrowserRouter>
  );
}

describe('HistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.getHistory.mockResolvedValue({
      sessions: [
        {
          sessionId: 'PM-2026-01-25-10-30-00-001',
          startTime: '2026-01-25T10:30:00.000Z',
          endTime: '2026-01-25T12:45:00.000Z',
          status: 'completed',
          outcome: 'success',
          iterationsRun: 12,
          projectPath: '/tmp/rwm',
          projectName: 'RWM Puppet Master',
          phasesCompleted: 1,
          tasksCompleted: 4,
          subtasksCompleted: 12,
        },
        {
          sessionId: 'PM-2026-01-24-09-00-00-001',
          startTime: '2026-01-24T09:00:00.000Z',
          status: 'failed',
          outcome: 'failed',
          iterationsRun: 3,
          projectPath: '/tmp/other',
          projectName: 'Other Project',
          phasesCompleted: 0,
          tasksCompleted: 1,
          subtasksCompleted: 2,
        },
      ],
      total: 2,
      limit: 50,
      offset: 0,
    });
  });

  it('renders page title', async () => {
    renderHistory();
    
    await waitFor(() => {
      expect(screen.getByText('History')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    renderHistory();
    
    expect(screen.getByText('Loading history...')).toBeInTheDocument();
  });

  it('renders filters panel', async () => {
    renderHistory();
    
    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
  });

  it('renders search input', async () => {
    renderHistory();
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search sessions...')).toBeInTheDocument();
    });
  });

  it('renders status filter dropdown', async () => {
    renderHistory();
    
    await waitFor(() => {
      expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
    });
  });

  it('renders project filter dropdown', async () => {
    renderHistory();
    
    await waitFor(() => {
      expect(screen.getByLabelText('Filter by project')).toBeInTheDocument();
    });
  });

  it('shows sessions after loading', async () => {
    renderHistory();
    
    await waitFor(() => {
      expect(screen.getByText('PM-2026-01-25-10-30-00-001')).toBeInTheDocument();
      expect(screen.getByText('PM-2026-01-24-09-00-00-001')).toBeInTheDocument();
    });
  });

  it('shows session count in panel title', async () => {
    renderHistory();
    
    await waitFor(() => {
      expect(screen.getByText(/Sessions \(/)).toBeInTheDocument();
    });
  });

  it('filters sessions by search query', async () => {
    renderHistory();
    
    await waitFor(() => {
      expect(screen.getByText('PM-2026-01-25-10-30-00-001')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search sessions...');
    fireEvent.change(searchInput, { target: { value: 'Other Project' } });
    
    await waitFor(() => {
      expect(screen.queryByText('PM-2026-01-25-10-30-00-001')).not.toBeInTheDocument();
      expect(screen.getByText('PM-2026-01-24-09-00-00-001')).toBeInTheDocument();
    });
  });

  it('filters sessions by status', async () => {
    renderHistory();
    
    await waitFor(() => {
      expect(screen.getByText('PM-2026-01-25-10-30-00-001')).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText('Filter by status');
    fireEvent.change(statusSelect, { target: { value: 'error' } });
    
    await waitFor(() => {
      expect(screen.queryByText('PM-2026-01-25-10-30-00-001')).not.toBeInTheDocument();
      expect(screen.getByText('PM-2026-01-24-09-00-00-001')).toBeInTheDocument();
    });
  });

  it('clears filters when button clicked', async () => {
    renderHistory();
    
    await waitFor(() => {
      expect(screen.getByText('PM-2026-01-25-10-30-00-001')).toBeInTheDocument();
    });

    // Apply a filter
    const searchInput = screen.getByPlaceholderText('Search sessions...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    // Clear filters
    fireEvent.click(screen.getByRole('button', { name: /CLEAR FILTERS/i }));
    
    await waitFor(() => {
      expect(screen.getByText('PM-2026-01-25-10-30-00-001')).toBeInTheDocument();
    });
  });

  it('shows status badge for each session', async () => {
    renderHistory();
    
    await waitFor(() => {
      const badges = screen.getAllByRole('status');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it('shows VIEW button for sessions', async () => {
    renderHistory();
    
    await waitFor(() => {
      const viewButtons = screen.getAllByRole('button', { name: /VIEW/i });
      expect(viewButtons.length).toBeGreaterThan(0);
    });
  });

  it('shows RESUME button for paused sessions', async () => {
    renderHistory();
    
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /RESUME/i }).length).toBeGreaterThan(0);
    });
  });
});
