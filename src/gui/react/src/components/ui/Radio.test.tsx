import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Radio } from './Radio.js';

describe('Radio', () => {
  it('renders unselected radio', () => {
    const handleChange = vi.fn();
    render(
      <Radio
        name="test-group"
        value="option1"
        checked={false}
        onChange={handleChange}
      />
    );
    
    const radio = screen.getByRole('radio');
    expect(radio).not.toBeChecked();
  });

  it('renders selected radio', () => {
    const handleChange = vi.fn();
    render(
      <Radio
        name="test-group"
        value="option1"
        checked={true}
        onChange={handleChange}
      />
    );
    
    const radio = screen.getByRole('radio');
    expect(radio).toBeChecked();
  });

  it('renders with label', () => {
    const handleChange = vi.fn();
    render(
      <Radio
        name="test-group"
        value="option1"
        checked={false}
        onChange={handleChange}
        label="Test Label"
      />
    );
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with description', () => {
    const handleChange = vi.fn();
    render(
      <Radio
        name="test-group"
        value="option1"
        checked={false}
        onChange={handleChange}
        label="Test Label"
        description="Test description"
      />
    );
    
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('calls onChange when clicked', () => {
    const handleChange = vi.fn();
    render(
      <Radio
        name="test-group"
        value="option1"
        checked={false}
        onChange={handleChange}
      />
    );
    
    const radio = screen.getByRole('radio');
    fireEvent.click(radio);
    
    expect(handleChange).toHaveBeenCalledWith('option1');
  });

  it('handles disabled state', () => {
    const handleChange = vi.fn();
    render(
      <Radio
        name="test-group"
        value="option1"
        checked={false}
        onChange={handleChange}
        disabled
      />
    );
    
    const radio = screen.getByRole('radio');
    expect(radio).toBeDisabled();
    
    fireEvent.click(radio);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('displays error message', () => {
    const handleChange = vi.fn();
    render(
      <Radio
        name="test-group"
        value="option1"
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
      <Radio
        name="test-group"
        value="option1"
        checked={false}
        onChange={handleChange}
        hint="This is a helpful hint"
      />
    );
    
    expect(screen.getByText('This is a helpful hint')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    const handleChange = vi.fn();
    render(
      <Radio
        name="test-group"
        value="option1"
        checked={false}
        onChange={handleChange}
        id="test-radio"
      />
    );
    
    const radio = screen.getByRole('radio');
    expect(radio).toHaveAttribute('id', 'test-radio');
    expect(radio).toHaveAttribute('name', 'test-group');
    expect(radio).toHaveAttribute('value', 'option1');
  });

  it('works in radio group', () => {
    const handleChange = vi.fn();
    render(
      <div>
        <Radio
          name="group"
          value="option1"
          checked={false}
          onChange={handleChange}
        />
        <Radio
          name="group"
          value="option2"
          checked={true}
          onChange={handleChange}
        />
      </div>
    );
    
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(radios[0]).not.toBeChecked();
    expect(radios[1]).toBeChecked();
  });
});
