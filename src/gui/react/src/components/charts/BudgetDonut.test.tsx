import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BudgetDonut } from './BudgetDonut.js';

describe('BudgetDonut', () => {
  it('renders with label', () => {
    render(<BudgetDonut used={50} limit={100} label="Cursor" />);
    
    expect(screen.getByText('Cursor')).toBeInTheDocument();
  });

  it('displays percentage', () => {
    render(<BudgetDonut used={50} limit={100} label="Cursor" />);
    
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('displays usage fraction', () => {
    render(<BudgetDonut used={50} limit={100} label="Cursor" />);
    
    expect(screen.getByText('50 / 100')).toBeInTheDocument();
  });

  it('has progressbar role', () => {
    render(<BudgetDonut used={75} limit={100} label="Cursor" />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('has correct aria attributes', () => {
    render(<BudgetDonut used={75} limit={100} label="Cursor" />);
    
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '75');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('caps percentage at 100', () => {
    render(<BudgetDonut used={150} limit={100} label="Over Budget" />);
    
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders small size', () => {
    const { container } = render(<BudgetDonut used={50} limit={100} label="Cursor" size="sm" />);
    
    expect(container.querySelector('.w-16.h-16')).toBeInTheDocument();
  });

  it('renders medium size (default)', () => {
    const { container } = render(<BudgetDonut used={50} limit={100} label="Cursor" />);
    
    expect(container.querySelector('.w-24.h-24')).toBeInTheDocument();
  });

  it('renders large size', () => {
    const { container } = render(<BudgetDonut used={50} limit={100} label="Cursor" size="lg" />);
    
    expect(container.querySelector('.w-32.h-32')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <BudgetDonut used={50} limit={100} label="Cursor" className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows warning color at 80%+', () => {
    render(<BudgetDonut used={85} limit={100} label="Warning" />);
    
    const percentage = screen.getByText('85%');
    expect(percentage).toHaveClass('text-safety-orange');
  });

  it('shows critical color at 95%+', () => {
    render(<BudgetDonut used={98} limit={100} label="Critical" />);
    
    const percentage = screen.getByText('98%');
    expect(percentage).toHaveClass('text-hot-magenta');
  });

  it('shows normal color below 80%', () => {
    render(<BudgetDonut used={50} limit={100} label="Normal" />);
    
    const percentage = screen.getByText('50%');
    expect(percentage).toHaveClass('text-ink-black');
  });
});
