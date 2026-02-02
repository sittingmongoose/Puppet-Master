import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EvidencePage from './Evidence.js';

// Mock react-router-dom's useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({}),
  };
});

function renderEvidence() {
  return render(
    <BrowserRouter>
      <EvidencePage />
    </BrowserRouter>
  );
}

describe('EvidencePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', async () => {
    renderEvidence();
    
    await waitFor(() => {
      expect(screen.getByText('Evidence')).toBeInTheDocument();
    });
  });

  it('renders refresh button', async () => {
    renderEvidence();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /REFRESH/i })).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    renderEvidence();
    
    expect(screen.getByText('Loading evidence...')).toBeInTheDocument();
  });

  it('renders categories panel', async () => {
    renderEvidence();
    
    await waitFor(() => {
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });
  });

  it('shows all category options', async () => {
    renderEvidence();
    
    await waitFor(() => {
      expect(screen.getByText(/All Files/)).toBeInTheDocument();
      expect(screen.getByText(/Screenshots/)).toBeInTheDocument();
      expect(screen.getByText(/Logs/)).toBeInTheDocument();
      expect(screen.getByText(/Gate Reports/)).toBeInTheDocument();
      expect(screen.getByText(/Browser Traces/)).toBeInTheDocument();
      expect(screen.getByText(/File Snapshots/)).toBeInTheDocument();
    });
  });

  it('renders files panel', async () => {
    renderEvidence();
    
    await waitFor(() => {
      expect(screen.getByText(/Files \(/)).toBeInTheDocument();
    });
  });

  it('renders preview panel', async () => {
    renderEvidence();
    
    await waitFor(() => {
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });
  });

  it('shows mock files after loading', async () => {
    renderEvidence();
    
    await waitFor(() => {
      expect(screen.getByText('dashboard-screenshot.png')).toBeInTheDocument();
      expect(screen.getByText('test-output.log')).toBeInTheDocument();
    });
  });

  it('filters files when category is selected', async () => {
    renderEvidence();
    
    await waitFor(() => {
      expect(screen.getByText('dashboard-screenshot.png')).toBeInTheDocument();
    });

    // Click on Logs category
    fireEvent.click(screen.getByText(/Logs/));
    
    // Only log files should be visible
    await waitFor(() => {
      expect(screen.queryByText('dashboard-screenshot.png')).not.toBeInTheDocument();
      expect(screen.getByText('test-output.log')).toBeInTheDocument();
    });
  });

  it('shows preview when file is selected', async () => {
    renderEvidence();
    
    await waitFor(() => {
      expect(screen.getByText('dashboard-screenshot.png')).toBeInTheDocument();
    });

    // Click on a file
    fireEvent.click(screen.getByText('dashboard-screenshot.png'));
    
    // Preview should show file details
    expect(screen.getByText('Name:')).toBeInTheDocument();
    expect(screen.getByText('Size:')).toBeInTheDocument();
    expect(screen.getByText('Created:')).toBeInTheDocument();
  });

  it('shows download button in preview', async () => {
    renderEvidence();
    
    await waitFor(() => {
      expect(screen.getByText('dashboard-screenshot.png')).toBeInTheDocument();
    });

    // Select a file
    fireEvent.click(screen.getByText('dashboard-screenshot.png'));
    
    expect(screen.getByRole('button', { name: /DOWNLOAD/i })).toBeInTheDocument();
  });

  it('shows status badge for files with status', async () => {
    renderEvidence();
    
    await waitFor(() => {
      expect(screen.getByText('dashboard-screenshot.png')).toBeInTheDocument();
    });

    // Files with status should have badges
    const badges = screen.getAllByRole('status');
    expect(badges.length).toBeGreaterThan(0);
  });
});
