import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TiersPage from './Tiers.js';
import * as lib from '@/lib';

// Mock the lib
vi.mock('@/lib', () => ({
  api: {
    getTiers: vi.fn(),
  },
}));

const mockApi = lib.api as unknown as {
  getTiers: ReturnType<typeof vi.fn>;
};

const sampleTiers = [
  {
    id: 'PH1',
    type: 'phase' as const,
    title: 'Foundation',
    status: 'complete' as const,
    children: [
      {
        id: 'T1',
        type: 'task' as const,
        title: 'Setup Project',
        status: 'complete' as const,
        children: [
          {
            id: 'S1',
            type: 'subtask' as const,
            title: 'Initialize TypeScript',
            status: 'complete' as const,
            iterations: 3,
            currentIteration: 3,
          },
        ],
      },
    ],
  },
  {
    id: 'PH2',
    type: 'phase' as const,
    title: 'Implementation',
    status: 'running' as const,
    children: [],
  },
];

describe('TiersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.getTiers.mockResolvedValue(sampleTiers);
  });

  it('renders page title', async () => {
    render(<TiersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Tiers')).toBeInTheDocument();
    });
  });

  it('renders expand/collapse buttons', async () => {
    render(<TiersPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /EXPAND ALL/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /COLLAPSE ALL/i })).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    mockApi.getTiers.mockImplementation(() => new Promise(() => {}));
    
    render(<TiersPage />);
    
    expect(screen.getByText('Loading tiers...')).toBeInTheDocument();
  });

  it('renders tier hierarchy panel', async () => {
    render(<TiersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Tier Hierarchy')).toBeInTheDocument();
    });
  });

  it('renders details panel', async () => {
    render(<TiersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Details')).toBeInTheDocument();
    });
  });

  it('shows phase items', async () => {
    render(<TiersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Foundation')).toBeInTheDocument();
      expect(screen.getByText('Implementation')).toBeInTheDocument();
    });
  });

  it('shows item IDs', async () => {
    render(<TiersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('PH1')).toBeInTheDocument();
      expect(screen.getByText('PH2')).toBeInTheDocument();
    });
  });

  it('shows child items when expanded', async () => {
    render(<TiersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Foundation')).toBeInTheDocument();
    });

    // First level is auto-expanded, should show task
    expect(screen.getByText('Setup Project')).toBeInTheDocument();
  });

  it('shows details when item is selected', async () => {
    render(<TiersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Foundation')).toBeInTheDocument();
    });

    // Click on an item to select it
    fireEvent.click(screen.getByText('Foundation'));
    
    // Details panel should update
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('Type:')).toBeInTheDocument();
  });

  it('shows empty state message when no tiers', async () => {
    mockApi.getTiers.mockResolvedValue([]);
    
    render(<TiersPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/No tiers loaded/)).toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    mockApi.getTiers.mockRejectedValue(new Error('Network error'));
    
    render(<TiersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('expands all when clicking expand all', async () => {
    render(<TiersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Foundation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /EXPAND ALL/i }));
    
    // All nested items should be visible
    expect(screen.getByText('Setup Project')).toBeInTheDocument();
    expect(screen.getByText('Initialize TypeScript')).toBeInTheDocument();
  });

  it('collapses all when clicking collapse all', async () => {
    render(<TiersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Foundation')).toBeInTheDocument();
    });

    // First expand all
    fireEvent.click(screen.getByRole('button', { name: /EXPAND ALL/i }));
    // Then collapse all
    fireEvent.click(screen.getByRole('button', { name: /COLLAPSE ALL/i }));
    
    // Child items should not be visible
    expect(screen.queryByText('Setup Project')).not.toBeInTheDocument();
  });

  it('fetches tiers on mount', async () => {
    render(<TiersPage />);
    
    await waitFor(() => {
      expect(mockApi.getTiers).toHaveBeenCalled();
    });
  });
});
