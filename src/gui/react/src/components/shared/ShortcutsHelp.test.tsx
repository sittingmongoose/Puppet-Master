import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShortcutsHelp } from './ShortcutsHelp.js';

describe('ShortcutsHelp', () => {
  it('renders when open', () => {
    render(<ShortcutsHelp isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ShortcutsHelp isOpen={false} onClose={vi.fn()} />);
    
    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
  });

  it('shows all shortcut categories', () => {
    render(<ShortcutsHelp isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText('Execution')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Tier Views')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('shows execution shortcuts', () => {
    render(<ShortcutsHelp isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText('Start/Pause toggle')).toBeInTheDocument();
    expect(screen.getByText('Stop execution')).toBeInTheDocument();
    expect(screen.getByText('Retry current item')).toBeInTheDocument();
  });

  it('shows navigation shortcuts', () => {
    render(<ShortcutsHelp isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText('Go to current item')).toBeInTheDocument();
    expect(screen.getByText('Open logs/history')).toBeInTheDocument();
    expect(screen.getByText('Open doctor')).toBeInTheDocument();
  });

  it('shows keyboard key indicators', () => {
    render(<ShortcutsHelp isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText('Space')).toBeInTheDocument();
    // "Esc" appears multiple times - once in shortcuts, once in instructions
    expect(screen.getAllByText('Esc').length).toBeGreaterThan(0);
    expect(screen.getByText('G')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('shows tier view number shortcuts', () => {
    render(<ShortcutsHelp isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('shows help and command palette shortcuts', () => {
    render(<ShortcutsHelp isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText('Show this help')).toBeInTheDocument();
    expect(screen.getByText('Command palette')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('shows close instruction', () => {
    render(<ShortcutsHelp isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText(/or click outside to close/)).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<ShortcutsHelp isOpen={true} onClose={onClose} />);
    
    // Modal has a close button
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });
});
