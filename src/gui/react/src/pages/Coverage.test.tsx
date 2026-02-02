import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CoveragePage from './Coverage.js';

function renderCoverage() {
  return render(<CoveragePage />);
}

describe('CoveragePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', async () => {
    renderCoverage();
    
    await waitFor(() => {
      expect(screen.getByText('Coverage')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    renderCoverage();
    
    expect(screen.getByText('Loading coverage data...')).toBeInTheDocument();
  });

  it('renders refresh button', async () => {
    renderCoverage();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /REFRESH/i })).toBeInTheDocument();
    });
  });

  it('renders overall stats cards', async () => {
    renderCoverage();
    
    await waitFor(() => {
      expect(screen.getByText('Overall Coverage')).toBeInTheDocument();
      expect(screen.getByText('Features Tested')).toBeInTheDocument();
      expect(screen.getByText('Features Verified')).toBeInTheDocument();
    });
  });

  it('renders coverage by category panel', async () => {
    renderCoverage();
    
    await waitFor(() => {
      expect(screen.getByText('Coverage by Category')).toBeInTheDocument();
    });
  });

  it('shows category coverage bars', async () => {
    renderCoverage();
    
    await waitFor(() => {
      expect(screen.getByText('Unit Tests')).toBeInTheDocument();
      expect(screen.getByText('Integration Tests')).toBeInTheDocument();
    });
  });

  it('renders feature coverage panel', async () => {
    renderCoverage();
    
    await waitFor(() => {
      expect(screen.getByText('Feature Coverage')).toBeInTheDocument();
    });
  });

  it('shows feature coverage table', async () => {
    renderCoverage();
    
    await waitFor(() => {
      expect(screen.getByText('CLI Orchestration')).toBeInTheDocument();
      expect(screen.getByText('State Management')).toBeInTheDocument();
      expect(screen.getByText('Platform Detection')).toBeInTheDocument();
    });
  });

  it('filters features by phase', async () => {
    renderCoverage();
    
    await waitFor(() => {
      expect(screen.getByText('CLI Orchestration')).toBeInTheDocument();
    });

    const phaseSelect = screen.getByLabelText('Filter by phase');
    fireEvent.change(phaseSelect, { target: { value: 'Phase 1' } });
    
    await waitFor(() => {
      expect(screen.queryByText('CLI Orchestration')).not.toBeInTheDocument();
      expect(screen.getByText('Platform Detection')).toBeInTheDocument();
    });
  });

  it('renders legend panel', async () => {
    renderCoverage();
    
    await waitFor(() => {
      expect(screen.getByText('Legend')).toBeInTheDocument();
    });
  });

  it('shows coverage percentage thresholds in legend', async () => {
    renderCoverage();
    
    await waitFor(() => {
      expect(screen.getByText('90%+ Coverage')).toBeInTheDocument();
      expect(screen.getByText('70-89% Coverage')).toBeInTheDocument();
      expect(screen.getByText('<70% Coverage')).toBeInTheDocument();
    });
  });

  it('shows tested/verified checkmarks', async () => {
    renderCoverage();
    
    await waitFor(() => {
      // Should have checkmark icons for tested/verified features
      const checkmarks = screen.getAllByLabelText('Checkmark');
      expect(checkmarks.length).toBeGreaterThan(0);
    });
  });

  it('shows status badges for categories', async () => {
    renderCoverage();
    
    await waitFor(() => {
      const badges = screen.getAllByRole('status');
      expect(badges.length).toBeGreaterThan(0);
    });
  });
});
