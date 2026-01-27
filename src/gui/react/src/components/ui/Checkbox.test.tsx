import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox.js';

describe('Checkbox', () => {
  it('renders unchecked checkbox', () => {
    const handleChange = vi.fn();
    render(<Checkbox checked={false} onChange={handleChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('renders checked checkbox', () => {
    const handleChange = vi.fn();
    render(<Checkbox checked={true} onChange={handleChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('renders with label', () => {
    const handleChange = vi.fn();
    render(<Checkbox checked={false} onChange={handleChange} label="Test Label" />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('calls onChange when clicked', () => {
    const handleChange = vi.fn();
    render(<Checkbox checked={false} onChange={handleChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('handles disabled state', () => {
    const handleChange = vi.fn();
    render(<Checkbox checked={false} onChange={handleChange} disabled />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
    
    fireEvent.click(checkbox);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('displays error message', () => {
    const handleChange = vi.fn();
    render(
      <Checkbox
        checked={false}
        onChange={handleChange}
        error="This field is required"
      />
    );
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays hint text', () => {
    const handleChange = vi.fn();
    render(
      <Checkbox
        checked={false}
        onChange={handleChange}
        hint="This is a helpful hint"
      />
    );
    
    expect(screen.getByText('This is a helpful hint')).toBeInTheDocument();
  });

  it('supports indeterminate state', () => {
    const handleChange = vi.fn();
    render(
      <Checkbox
        checked={false}
        onChange={handleChange}
        indeterminate
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    // Indeterminate state is visual only, not reflected in checked property
  });

  it('has proper accessibility attributes', () => {
    const handleChange = vi.fn();
    render(
      <Checkbox
        checked={false}
        onChange={handleChange}
        id="test-checkbox"
        name="test"
        value="test-value"
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('id', 'test-checkbox');
    expect(checkbox).toHaveAttribute('name', 'test');
    expect(checkbox).toHaveAttribute('value', 'test-value');
  });
});
