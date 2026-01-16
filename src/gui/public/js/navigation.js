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

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigation);
} else {
  initNavigation();
}

// Export for use in other scripts
window.navigation = {
  init: initNavigation,
  setActivePage: setActivePage,
  navigateTo: navigateTo
};
