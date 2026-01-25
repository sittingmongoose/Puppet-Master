import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HistoryPage from './History.js';

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
      expect(screen.getByText('Phase 1 Implementation')).toBeInTheDocument();
      expect(screen.getByText('Phase 0 Setup')).toBeInTheDocument();
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
      expect(screen.getByText('Phase 1 Implementation')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search sessions...');
    fireEvent.change(searchInput, { target: { value: 'Phase 0' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Phase 1 Implementation')).not.toBeInTheDocument();
      expect(screen.getByText('Phase 0 Setup')).toBeInTheDocument();
    });
  });

  it('filters sessions by status', async () => {
    renderHistory();
    
    await waitFor(() => {
      expect(screen.getByText('Phase 1 Implementation')).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText('Filter by status');
    fireEvent.change(statusSelect, { target: { value: 'error' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Phase 1 Implementation')).not.toBeInTheDocument();
      expect(screen.getByText('Initial Planning')).toBeInTheDocument();
    });
  });

  it('clears filters when button clicked', async () => {
    renderHistory();
    
    await waitFor(() => {
      expect(screen.getByText('Phase 1 Implementation')).toBeInTheDocument();
    });

    // Apply a filter
    const searchInput = screen.getByPlaceholderText('Search sessions...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    // Clear filters
    fireEvent.click(screen.getByRole('button', { name: /CLEAR FILTERS/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Phase 1 Implementation')).toBeInTheDocument();
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
