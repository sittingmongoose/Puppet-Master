import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UsageChart } from './UsageChart.js';

const mockData = [
  { date: '2026-01-19', cursor: 30, codex: 20, claude: 10 },
  { date: '2026-01-20', cursor: 45, codex: 25, claude: 15 },
  { date: '2026-01-21', cursor: 35, codex: 30, claude: 20 },
  { date: '2026-01-22', cursor: 50, codex: 25, claude: 12 },
  { date: '2026-01-23', cursor: 40, codex: 35, claude: 18 },
  { date: '2026-01-24', cursor: 55, codex: 30, claude: 22 },
  { date: '2026-01-25', cursor: 60, codex: 40, claude: 25 },
];

describe('UsageChart', () => {
  it('renders without crashing', () => {
    render(<UsageChart data={mockData} />);
    
    // Should render the chart container
    expect(document.querySelector('.space-y-sm')).toBeInTheDocument();
  });

  it('renders bars for each day', () => {
    render(<UsageChart data={mockData} />);
    
    // Each day should have a column
    const bars = document.querySelectorAll('.flex-col.justify-end');
    expect(bars.length).toBe(7);
  });

  it('renders day labels', () => {
    render(<UsageChart data={mockData} />);
    
    // Should show day abbreviations
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('renders legend with platform names', () => {
    render(<UsageChart data={mockData} />);
    
    expect(screen.getByText('Cursor')).toBeInTheDocument();
    expect(screen.getByText('Codex')).toBeInTheDocument();
    expect(screen.getByText('Claude')).toBeInTheDocument();
  });

  it('renders legend with color indicators', () => {
    render(<UsageChart data={mockData} />);
    
    // Should have colored legend boxes
    const blueLegend = document.querySelector('.bg-electric-blue');
    const orangeLegend = document.querySelector('.bg-safety-orange');
    const purpleLegend = document.querySelector('.bg-royal-purple');
    
    expect(blueLegend).toBeInTheDocument();
    expect(orangeLegend).toBeInTheDocument();
    expect(purpleLegend).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<UsageChart data={mockData} className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles empty data', () => {
    render(<UsageChart data={[]} />);
    
    // Should not crash with empty data
    const bars = document.querySelectorAll('.flex-col.justify-end');
    expect(bars.length).toBe(0);
  });
});
