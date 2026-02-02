import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Username" />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    render(<Input label="Email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('shows error message', () => {
    render(<Input error="Invalid input" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid input');
  });

  it('shows hint text', () => {
    render(<Input hint="Enter your name" />);
    expect(screen.getByText('Enter your name')).toBeInTheDocument();
  });

  it('hides hint when error is present', () => {
    render(<Input hint="Enter your name" error="Name is required" />);
    expect(screen.queryByText('Enter your name')).not.toBeInTheDocument();
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('applies error styling', () => {
    render(<Input error="Invalid" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-hot-magenta');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('connects label to input via id', () => {
    render(<Input label="Test Label" id="custom-id" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'custom-id');
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<Input size="sm" />);
    expect(screen.getByRole('textbox')).toHaveClass('text-sm');

    rerender(<Input size="md" />);
    expect(screen.getByRole('textbox')).toHaveClass('text-mono');

    rerender(<Input size="lg" />);
    expect(screen.getByRole('textbox')).toHaveClass('text-base');
  });

  it('accepts typed input', async () => {
    const user = userEvent.setup();
    render(<Input />);
    
    await user.type(screen.getByRole('textbox'), 'hello');
    expect(screen.getByRole('textbox')).toHaveValue('hello');
  });

  it('can be disabled', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('passes through additional props', () => {
    render(<Input placeholder="Enter text" maxLength={10} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter text');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('has proper aria-describedby for error and hint', () => {
    render(<Input id="test" error="Error" hint="Hint" />);
    const input = screen.getByRole('textbox');
    // When error is present, hint is hidden, so only error id should be in describedby
    expect(input).toHaveAttribute('aria-describedby', 'test-error');
  });
});
