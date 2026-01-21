/**
 * Shared Navigation Module
 * 
 * Provides reusable navigation functionality for all pages:
 * - Active page highlighting
 * - Navigation initialization
 * - Programmatic navigation
 */

/**
 * Initialize navigation on page load
 * Sets active page based on current URL
 */
function initNavigation() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    // Match exact path or root
    if (linkPath === currentPath || (currentPath === '/' && linkPath === '/')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Set active page programmatically
 * @param {string} page - Page identifier (dashboard, projects, wizard, etc.)
 */
function setActivePage(page) {
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('data-page');
    if (linkPage === page) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Navigate to a page programmatically
 * @param {string} path - Path to navigate to (e.g., '/projects', '/config')
 */
function navigateTo(path) {
  window.location.href = path;
}

/**
 * Initialize dark mode functionality
 * Loads saved theme from localStorage and sets up toggle button
 */
function initDarkMode() {
  // Load saved theme or default to light
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);

  // Set up dark mode toggle button
  const toggleBtn = document.getElementById('dark-mode-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    });
  }
}

/**
 * Set theme and update localStorage
 * @param {string} theme - Theme to set ('light' or 'dark')
 */
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateDarkModeIcons(theme);
}

/**
 * Update dark mode toggle button icons
 * @param {string} theme - Current theme ('light' or 'dark')
 */
function updateDarkModeIcons(theme) {
  const toggleBtn = document.getElementById('dark-mode-toggle');
  if (!toggleBtn) return;

  const moonIcon = toggleBtn.querySelector('.moon-icon');
  const sunIcon = toggleBtn.querySelector('.sun-icon');

  if (moonIcon && sunIcon) {
    if (theme === 'light') {
      // Light mode: show moon icon (clicking switches to dark)
      moonIcon.style.display = 'inline-block';
      sunIcon.style.display = 'none';
    } else {
      // Dark mode: show sun icon (clicking switches to light)
      moonIcon.style.display = 'none';
      sunIcon.style.display = 'inline-block';
    }
  }
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initDarkMode();
  });
} else {
  initNavigation();
  initDarkMode();
}

// Export for use in other scripts
window.navigation = {
  init: initNavigation,
  setActivePage: setActivePage,
  navigateTo: navigateTo,
  setTheme: setTheme
};
