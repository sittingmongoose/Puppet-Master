import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logoutGuiSession } from '@/lib/api.js';

interface NavItem {
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Wizard', path: '/wizard' },
  { label: 'Config', path: '/config' },
  { label: 'Doctor', path: '/doctor' },
  { label: 'Tiers', path: '/tiers' },
  { label: 'Evidence', path: '/evidence' },
  { label: 'History', path: '/history' },
  { label: 'Ledger', path: '/ledger' },
  { label: 'Login', path: '/login' },
];

export interface HeaderProps {
  /** Current project name to display */
  projectName?: string;
  /** Callback when project selector is clicked */
  onProjectClick?: () => void;
  /** Dark mode state */
  isDark?: boolean;
  /** Callback to toggle dark mode */
  onThemeToggle?: () => void;
}

/**
 * Header component matching styles from src/gui/public/css/styles.css
 * 
 * Base styles from .header (lines 271-328)
 * Navigation from .main-navigation, .nav-link (lines 339-388)
 */
export function Header({
  projectName,
  onProjectClick,
  isDark = false,
  onThemeToggle,
}: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutGuiSession();
    navigate('/login', { replace: true });
    window.location.reload();
  };

  return (
    <header
      className="
        sticky top-0 z-[100]
        bg-paper-cream dark:bg-paper-dark
        border-b-thick border-ink-black
        dark:border-ink-light
        shadow-[0_2px_0_0_#1A1A1A]
        dark:shadow-[0_2px_0_0_#e0e0e0]
        px-lg py-md mb-lg
        transition-colors duration-300
      "
    >
      <div className="flex justify-between items-center flex-wrap gap-md">
        {/* Left side: Logo + Navigation */}
        <div className="flex items-start gap-lg flex-1 min-w-0 flex-wrap">
          <Link to="/" className="no-underline flex-shrink-0 self-center">
            <h1
              className="
                font-display font-black
                text-[2.5em] md:text-[2em] sm:text-[1.5em]
                text-ink-black dark:text-ink-light
                uppercase tracking-[4px]
                m-0 whitespace-nowrap
              "
              style={{
                textShadow: '2px 2px 0 currentColor, 1px 1px 0 currentColor',
              }}
            >
              RWM
            </h1>
          </Link>

          <nav className="flex gap-sm items-center flex-wrap self-center" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    px-sm py-xs
                    border-medium
                    font-geometric font-semibold
                    text-[0.9em] uppercase tracking-wide
                    no-underline whitespace-nowrap
                    transition-all duration-200
                    ${isActive
                      ? 'border-ink-black bg-ink-black text-paper-cream font-bold'
                      : 'border-transparent bg-transparent text-ink-black dark:text-ink-light hover:border-ink-black dark:hover:border-ink-light hover:bg-paper-cream dark:hover:bg-paper-dark hover:-translate-y-px'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side: Project selector + Theme toggle */}
        <div className="flex items-center gap-md">
              {projectName && (
            <button
              type="button"
              onClick={onProjectClick}
              className="
                font-semibold
                px-sm py-xs
                border-medium border-ink-black
                dark:border-ink-light
                bg-paper-cream dark:bg-paper-dark
                text-ink-black dark:text-ink-light
                cursor-pointer whitespace-nowrap
                transition-all duration-200
                select-none
                hover:bg-ink-black hover:text-paper-cream
                dark:hover:bg-ink-light dark:hover:text-paper-dark
                hover:-translate-y-px hover:shadow-[2px_2px_0_0_#1A1A1A]
              "
            >
              {projectName}
            </button>
          )}

          <div className="flex gap-sm items-center">
            <button
              type="button"
              onClick={handleLogout}
              className="
                font-semibold text-[0.85em] uppercase tracking-wide
                px-sm py-xs border-medium
                border-ink-black dark:border-ink-light
                bg-paper-cream dark:bg-paper-dark
                text-ink-black dark:text-ink-light
                cursor-pointer transition-all duration-200
                hover:bg-ink-black hover:text-paper-cream
                dark:hover:bg-ink-light dark:hover:text-paper-dark
              "
            >
              Log out
            </button>
            <button
              type="button"
              onClick={onThemeToggle}
              className="
                bg-paper-cream dark:bg-paper-dark
                border-medium border-ink-black dark:border-ink-light
                px-sm py-xs
                cursor-pointer text-[1.2em]
                transition-all duration-200
                inline-flex items-center justify-center
                hover:bg-ink-black hover:text-paper-cream
                dark:hover:bg-ink-light dark:hover:text-paper-dark
                hover:scale-110
              "
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
