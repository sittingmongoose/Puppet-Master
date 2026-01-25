import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import MetricsPage from './Metrics.js';

function renderMetrics() {
  return render(<MetricsPage />);
}

describe('MetricsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', async () => {
    renderMetrics();
    
    await waitFor(() => {
      expect(screen.getByText('Metrics')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    renderMetrics();
    
    expect(screen.getByText('Loading metrics...')).toBeInTheDocument();
  });

  it('renders refresh button', async () => {
    renderMetrics();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /REFRESH/i })).toBeInTheDocument();
    });
  });

  it('renders session overview cards', async () => {
    renderMetrics();
    
    await waitFor(() => {
      expect(screen.getByText('Total Sessions')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Avg Duration')).toBeInTheDocument();
      expect(screen.getByText('Avg Items/Session')).toBeInTheDocument();
    });
  });

  it('renders platform usage panel', async () => {
    renderMetrics();
    
    await waitFor(() => {
      expect(screen.getByText('Platform Usage')).toBeInTheDocument();
    });
  });

  it('shows platform metrics table', async () => {
    renderMetrics();
    
    await waitFor(() => {
      expect(screen.getByText('cursor')).toBeInTheDocument();
      expect(screen.getByText('codex')).toBeInTheDocument();
      expect(screen.getByText('claude')).toBeInTheDocument();
    });
  });

  it('renders daily statistics panel', async () => {
    renderMetrics();
    
    await waitFor(() => {
      expect(screen.getByText('Daily Statistics')).toBeInTheDocument();
    });
  });

  it('shows daily stats table', async () => {
    renderMetrics();
    
    await waitFor(() => {
      expect(screen.getByText('2026-01-25')).toBeInTheDocument();
      expect(screen.getByText('2026-01-24')).toBeInTheDocument();
    });
  });

  it('renders performance summary panel', async () => {
    renderMetrics();
    
    await waitFor(() => {
      expect(screen.getByText('Performance Summary')).toBeInTheDocument();
    });
  });

  it('shows total calls this week', async () => {
    renderMetrics();
    
    await waitFor(() => {
      expect(screen.getByText('Total Calls This Week')).toBeInTheDocument();
    });
  });

  it('shows average success rate', async () => {
    renderMetrics();
    
    await waitFor(() => {
      expect(screen.getByText('Average Success Rate')).toBeInTheDocument();
    });
  });

  it('shows average latency', async () => {
    renderMetrics();
    
    await waitFor(() => {
      expect(screen.getByText('Average Latency')).toBeInTheDocument();
    });
  });

  it('displays success rates with color coding', async () => {
    renderMetrics();
    
    await waitFor(() => {
      // Should have some success rate values colored
      const successElements = screen.getAllByText(/%/);
      expect(successElements.length).toBeGreaterThan(0);
    });
  });
});
