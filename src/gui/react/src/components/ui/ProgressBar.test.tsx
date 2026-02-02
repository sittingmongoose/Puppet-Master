import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders a progressbar', () => {
    render(<ProgressBar value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays correct aria attributes', () => {
    render(<ProgressBar value={75} ariaLabel="Upload progress" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '75');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-label', 'Upload progress');
  });

  it('shows percentage label by default', () => {
    render(<ProgressBar value={42} />);
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    render(<ProgressBar value={50} showLabel={false} />);
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });

  it('uses custom label when provided', () => {
    render(<ProgressBar value={30} label="Step 3 of 10" />);
    expect(screen.getByText('Step 3 of 10')).toBeInTheDocument();
    expect(screen.queryByText('30%')).not.toBeInTheDocument();
  });

  it('clamps value between 0 and 100', () => {
    const { rerender } = render(<ProgressBar value={-10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');

    rerender(<ProgressBar value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('calculates percentage based on max value', () => {
    render(<ProgressBar value={5} max={10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { rerender, container } = render(<ProgressBar value={50} size="sm" />);
    let barContainer = container.querySelector('[role="progressbar"]');
    expect(barContainer).toHaveClass('h-4');

    rerender(<ProgressBar value={50} size="md" />);
    barContainer = container.querySelector('[role="progressbar"]');
    expect(barContainer).toHaveClass('h-8');

    rerender(<ProgressBar value={50} size="lg" />);
    barContainer = container.querySelector('[role="progressbar"]');
    expect(barContainer).toHaveClass('h-10');
  });

  it('applies variant colors', () => {
    const { container, rerender } = render(<ProgressBar value={50} variant="default" />);
    let fill = container.querySelector('[role="progressbar"] > div');
    expect(fill).toHaveClass('bg-neon-blue');

    rerender(<ProgressBar value={50} variant="success" />);
    fill = container.querySelector('[role="progressbar"] > div');
    expect(fill).toHaveClass('bg-acid-lime');

    rerender(<ProgressBar value={50} variant="warning" />);
    fill = container.querySelector('[role="progressbar"] > div');
    expect(fill).toHaveClass('bg-safety-orange');

    rerender(<ProgressBar value={50} variant="error" />);
    fill = container.querySelector('[role="progressbar"] > div');
    expect(fill).toHaveClass('bg-hot-magenta');
  });

  it('sets correct width style on fill', () => {
    const { container } = render(<ProgressBar value={75} />);
    const fill = container.querySelector('[role="progressbar"] > div');
    expect(fill).toHaveStyle({ width: '75%' });
  });

  it('has cross-hatching background pattern', () => {
    const { container } = render(<ProgressBar value={50} />);
    const bar = container.querySelector('[role="progressbar"]');
    expect(bar).toHaveStyle({
      backgroundImage: expect.stringContaining('repeating-linear-gradient'),
    });
  });
});
