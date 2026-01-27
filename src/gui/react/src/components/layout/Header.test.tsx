import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './Header';

// Wrapper to provide router context
function renderWithRouter(ui: React.ReactElement, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
}

describe('Header', () => {
  it('renders logo', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('RWM')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithRouter(<Header />);
    
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Wizard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Config' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Doctor' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tiers' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Evidence' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'History' })).toBeInTheDocument();
  });

  it('marks current page as active', () => {
    renderWithRouter(<Header />, { route: '/projects' });
    
    const projectsLink = screen.getByRole('link', { name: 'Projects' });
    expect(projectsLink).toHaveAttribute('aria-current', 'page');
    expect(projectsLink).toHaveClass('bg-ink-black', 'text-paper-cream');
  });

  it('renders project name when provided', () => {
    renderWithRouter(<Header projectName="My Project" />);
    expect(screen.getByText('My Project')).toBeInTheDocument();
  });

  it('calls onProjectClick when project button is clicked', async () => {
    const user = userEvent.setup();
    const onProjectClick = vi.fn();
    
    renderWithRouter(<Header projectName="Test Project" onProjectClick={onProjectClick} />);
    
    await user.click(screen.getByText('Test Project'));
    expect(onProjectClick).toHaveBeenCalledTimes(1);
  });

  it('renders theme toggle button', () => {
    renderWithRouter(<Header />);
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });

  it('shows light text when dark mode is active', () => {
    renderWithRouter(<Header isDark={true} />);
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toHaveTextContent('Light');
  });

  it('shows dark text when light mode is active', () => {
    renderWithRouter(<Header isDark={false} />);
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toHaveTextContent('Dark');
  });

  it('calls onThemeToggle when theme button is clicked', async () => {
    const user = userEvent.setup();
    const onThemeToggle = vi.fn();
    
    renderWithRouter(<Header onThemeToggle={onThemeToggle} />);
    
    await user.click(screen.getByRole('button', { name: /switch to dark mode/i }));
    expect(onThemeToggle).toHaveBeenCalledTimes(1);
  });

  it('has proper navigation landmark', () => {
    renderWithRouter(<Header />);
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });

  it('logo links to home', () => {
    renderWithRouter(<Header />);
    const logoLink = screen.getByRole('link', { name: 'RWM' });
    expect(logoLink).toHaveAttribute('href', '/');
  });
});
