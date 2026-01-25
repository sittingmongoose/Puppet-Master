import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  describe('dot variant', () => {
    it('renders a status dot by default', () => {
      render(<StatusBadge status="running" />);
      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', 'Status: RUNNING');
    });

    it('applies running status color and glow', () => {
      render(<StatusBadge status="running" />);
      const dot = screen.getByRole('status').querySelector('span');
      expect(dot).toHaveClass('bg-status-running');
      expect(dot).toHaveClass('animate-pulse-status');
    });

    it('applies paused status color', () => {
      render(<StatusBadge status="paused" />);
      const dot = screen.getByRole('status').querySelector('span');
      expect(dot).toHaveClass('bg-status-paused');
    });

    it('applies error status color', () => {
      render(<StatusBadge status="error" />);
      const dot = screen.getByRole('status').querySelector('span');
      expect(dot).toHaveClass('bg-status-error');
    });

    it('applies complete status color', () => {
      render(<StatusBadge status="complete" />);
      const dot = screen.getByRole('status').querySelector('span');
      expect(dot).toHaveClass('bg-status-complete');
    });

    it('applies pending/idle status color', () => {
      render(<StatusBadge status="pending" />);
      const dot = screen.getByRole('status').querySelector('span');
      expect(dot).toHaveClass('bg-status-idle');
    });

    it('applies size classes correctly', () => {
      const { rerender } = render(<StatusBadge status="running" size="sm" />);
      let dot = screen.getByRole('status').querySelector('span');
      expect(dot).toHaveClass('w-2', 'h-2');

      rerender(<StatusBadge status="running" size="md" />);
      dot = screen.getByRole('status').querySelector('span');
      expect(dot).toHaveClass('w-3', 'h-3');

      rerender(<StatusBadge status="running" size="lg" />);
      dot = screen.getByRole('status').querySelector('span');
      expect(dot).toHaveClass('w-4', 'h-4');
    });

    it('shows label when showLabel is true', () => {
      render(<StatusBadge status="running" showLabel />);
      expect(screen.getByText('RUNNING')).toBeInTheDocument();
    });

    it('uses custom label when provided', () => {
      render(<StatusBadge status="running" showLabel label="In Progress" />);
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: In Progress');
    });

    it('has border classes matching CSS', () => {
      render(<StatusBadge status="running" />);
      const dot = screen.getByRole('status').querySelector('span');
      expect(dot).toHaveClass('border-medium', 'border-ink-black');
    });
  });

  describe('badge variant', () => {
    it('renders as a badge when variant is badge', () => {
      render(<StatusBadge status="running" variant="badge" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('RUNNING');
    });

    it('applies badge styling', () => {
      render(<StatusBadge status="running" variant="badge" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('border-medium', 'border-ink-black');
      expect(badge).toHaveClass('uppercase', 'font-bold');
    });

    it('applies correct colors for each status', () => {
      const { rerender } = render(<StatusBadge status="running" variant="badge" />);
      expect(screen.getByRole('status')).toHaveClass('bg-status-running', 'text-paper-cream');

      rerender(<StatusBadge status="complete" variant="badge" />);
      expect(screen.getByRole('status')).toHaveClass('bg-status-complete', 'text-ink-black');

      rerender(<StatusBadge status="error" variant="badge" />);
      expect(screen.getByRole('status')).toHaveClass('bg-status-error', 'text-paper-cream');
    });
  });
});
