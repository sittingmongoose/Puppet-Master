import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Panel } from './Panel';

describe('Panel', () => {
  it('renders children', () => {
    render(
      <Panel>
        <p>Panel content</p>
      </Panel>
    );
    expect(screen.getByText('Panel content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <Panel title="Test Panel">
        Content
      </Panel>
    );
    expect(screen.getByRole('heading', { name: 'Test Panel' })).toBeInTheDocument();
  });

  it('renders header actions when provided', () => {
    render(
      <Panel headerActions={<button>Action</button>}>
        Content
      </Panel>
    );
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('has panel styling', () => {
    const { container } = render(
      <Panel>Content</Panel>
    );
    const panel = container.firstChild;
    expect(panel).toHaveClass('bg-paper-cream', 'border-thick', 'border-ink-black');
  });

  it('renders inner border by default', () => {
    const { container } = render(
      <Panel>Content</Panel>
    );
    const innerBorder = container.querySelector('.border-dashed');
    expect(innerBorder).toBeInTheDocument();
  });

  it('hides inner border when showInnerBorder is false', () => {
    const { container } = render(
      <Panel showInnerBorder={false}>Content</Panel>
    );
    const innerBorder = container.querySelector('.border-dashed');
    expect(innerBorder).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Panel className="custom-class">Content</Panel>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('passes through additional props', () => {
    render(
      <Panel data-testid="test-panel">Content</Panel>
    );
    expect(screen.getByTestId('test-panel')).toBeInTheDocument();
  });

  it('renders title and actions together', () => {
    render(
      <Panel title="Dashboard" headerActions={<button>Refresh</button>}>
        Content
      </Panel>
    );
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('has paper texture background', () => {
    const { container } = render(
      <Panel>Content</Panel>
    );
    const panel = container.firstChild as HTMLElement;
    expect(panel.style.backgroundImage).toContain('repeating-linear-gradient');
  });
});
