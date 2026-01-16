/**
 * Doctor JavaScript - Vibrant Technical Design
 * 
 * Handles doctor check loading, running, result display, and fix functionality
 */

// ============================================
// State Management
// ============================================
const state = {
  checks: [],
  results: [],
  filteredResults: [],
  currentCategory: '',
  lastRunTime: null,
  running: false,
};

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  setupEventListeners();
  loadChecks();
});

// ============================================
// Dark Mode
// ============================================
function initDarkMode() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
  
  const toggleBtn = document.getElementById('dark-mode-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    });
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const toggleBtn = document.getElementById('dark-mode-toggle');
  if (toggleBtn) {
    toggleBtn.textContent = theme === 'light' ? 'DARK MODE' : 'LIGHT MODE';
  }
}

// ============================================
// Event Listeners
// ============================================
function setupEventListeners() {
  // Run All button
  const runAllBtn = document.getElementById('run-all-btn');
  if (runAllBtn) {
    runAllBtn.addEventListener('click', () => {
      runChecks();
    });
  }

  // Category filter buttons
  const categoryBtns = document.querySelectorAll('.category-filter-btn');
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category') || '';
      setCategoryFilter(category);
    });
  });
}

// ============================================
// API Calls
// ============================================
async function loadChecks() {
  try {
    const response = await fetch('/api/doctor/checks');
    if (!response.ok) {
      throw new Error(`Failed to load checks: ${response.statusText}`);
    }

    const data = await response.json();
    state.checks = data.checks || [];
  } catch (error) {
    console.error('[Doctor] Error loading checks:', error);
    showError(`[ERROR] Failed to load checks: ${error.message}`);
  }
}

async function runChecks(filter) {
  if (state.running) {
    return; // Prevent multiple simultaneous runs
  }

  state.running = true;
  const runAllBtn = document.getElementById('run-all-btn');
  if (runAllBtn) {
    runAllBtn.disabled = true;
    runAllBtn.textContent = 'RUNNING...';
  }

  const tbody = document.getElementById('doctor-table-body');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading-message">Running checks...</td></tr>';
  }

  try {
    const body = filter || {};
    const response = await fetch('/api/doctor/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to run checks: ${response.statusText}`);
    }

    const data = await response.json();
    state.results = data.results || [];
    state.lastRunTime = new Date();

    // Apply current category filter
    applyCategoryFilter();

    renderResults();
    updateSummary();
    updateLastRun();
  } catch (error) {
    console.error('[Doctor] Error running checks:', error);
    showError(`[ERROR] Failed to run checks: ${error.message}`);
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="error-message">[ERROR] ${error.message}</td></tr>`;
    }
  } finally {
    state.running = false;
    if (runAllBtn) {
      runAllBtn.disabled = false;
      runAllBtn.textContent = 'RUN ALL CHECKS';
    }
  }
}

async function attemptFix(checkName) {
  const fixBtn = document.getElementById(`fix-btn-${escapeHtml(checkName)}`);
  if (fixBtn) {
    fixBtn.disabled = true;
    fixBtn.textContent = 'FIXING...';
  }

  try {
    const response = await fetch('/api/doctor/fix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ checkName }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fix: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success) {
      showMessage(`[OK] ${data.output || 'Fix completed successfully'}`);
      // Re-run the specific check to verify fix
      await runChecks({ checks: [checkName] });
    } else {
      showError(`[ERROR] ${data.output || 'Fix failed'}`);
    }
  } catch (error) {
    console.error('[Doctor] Error fixing check:', error);
    showError(`[ERROR] Failed to fix: ${error.message}`);
  } finally {
    if (fixBtn) {
      fixBtn.disabled = false;
      fixBtn.textContent = 'FIX';
    }
  }
}

// ============================================
// Category Filtering
// ============================================
function setCategoryFilter(category) {
  state.currentCategory = category;

  // Update active button
  const categoryBtns = document.querySelectorAll('.category-filter-btn');
  categoryBtns.forEach(btn => {
    const btnCategory = btn.getAttribute('data-category') || '';
    if (btnCategory === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  applyCategoryFilter();
  renderResults();
  updateSummary();
}

function applyCategoryFilter() {
  if (!state.currentCategory) {
    state.filteredResults = [...state.results];
  } else {
    state.filteredResults = state.results.filter(
      (result) => result.category === state.currentCategory
    );
  }
}

// ============================================
// Result Rendering
// ============================================
function renderResults() {
  const tbody = document.getElementById('doctor-table-body');
  if (!tbody) return;

  if (state.filteredResults.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No results to display. Click "RUN ALL CHECKS" to start.</td></tr>';
    return;
  }

  tbody.innerHTML = state.filteredResults.map((result, index) => {
    const statusIcon = result.passed ? '✓' : '✗';
    const statusClass = result.passed ? 'status-pass' : 'status-fail';
    const duration = formatDuration(result.durationMs);
    const hasFix = result.fixSuggestion ? true : false;
    const fixBtnId = `fix-btn-${index}`;
    const checkNameEscaped = escapeHtml(result.name);

    return `
      <tr class="result-row" data-check-name="${checkNameEscaped}">
        <td class="status-cell ${statusClass}">${statusIcon}</td>
        <td>${checkNameEscaped}</td>
        <td class="category-cell">${escapeHtml(result.category.toUpperCase())}</td>
        <td>${escapeHtml(result.message)}</td>
        <td class="duration-cell">${duration}</td>
        <td class="actions-cell">
          ${hasFix && !result.passed ? `<button class="icon-btn fix-btn" id="${fixBtnId}" data-check-name="${checkNameEscaped}" aria-label="Fix ${checkNameEscaped}">FIX</button>` : '-'}
        </td>
      </tr>
      ${result.details || result.fixSuggestion ? `
      <tr class="detail-row" data-check-name="${checkNameEscaped}">
        <td colspan="6" class="detail-cell">
          ${result.details ? `<div class="detail-section"><strong>Details:</strong> ${escapeHtml(result.details)}</div>` : ''}
          ${result.fixSuggestion ? `<div class="fix-suggestion"><strong>Fix:</strong> ${escapeHtml(result.fixSuggestion)}</div>` : ''}
        </td>
      </tr>
      ` : ''}
    `;
  }).join('');

  // Attach event listeners to fix buttons
  tbody.querySelectorAll('.fix-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const checkName = btn.getAttribute('data-check-name');
      if (checkName) {
        attemptFix(checkName);
      }
    });
  });

  // Make detail rows toggleable
  const resultRows = tbody.querySelectorAll('.result-row');
  resultRows.forEach(row => {
    row.addEventListener('click', (e) => {
      // Don't toggle if clicking on action button
      if (e.target.closest('.actions-cell')) {
        return;
      }
      const checkName = row.getAttribute('data-check-name');
      if (checkName) {
        // Find detail row by matching data-check-name attribute
        const detailRows = tbody.querySelectorAll('.detail-row');
        detailRows.forEach(detailRow => {
          if (detailRow.getAttribute('data-check-name') === checkName) {
            detailRow.style.display = detailRow.style.display === 'none' ? '' : 'none';
          }
        });
      }
    });
    row.style.cursor = 'pointer';
  });

  // Hide detail rows by default
  const detailRows = tbody.querySelectorAll('.detail-row');
  detailRows.forEach(row => {
    row.style.display = 'none';
  });
}

function updateSummary() {
  const summaryBar = document.getElementById('summary-bar');
  if (!summaryBar) return;

  const passed = state.filteredResults.filter((r) => r.passed).length;
  const total = state.filteredResults.length;

  const summaryText = document.getElementById('summary-text');
  if (summaryText) {
    summaryText.textContent = `${passed}/${total} passed`;
  }

  // Update results count
  const resultsCount = document.getElementById('results-count');
  if (resultsCount) {
    resultsCount.textContent = `${total} check${total !== 1 ? 's' : ''}`;
  }
}

function updateLastRun() {
  const lastRunEl = document.getElementById('last-run');
  if (!lastRunEl || !state.lastRunTime) return;

  const now = new Date();
  const diffMs = now.getTime() - state.lastRunTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffSecs = Math.floor((diffMs % 60000) / 1000);

  let timeStr;
  if (diffMins < 1) {
    timeStr = diffSecs < 1 ? 'just now' : `${diffSecs} second${diffSecs !== 1 ? 's' : ''} ago`;
  } else if (diffMins < 60) {
    timeStr = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else {
    const diffHours = Math.floor(diffMins / 60);
    timeStr = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }

  lastRunEl.textContent = `Last run: ${timeStr}`;
}

// ============================================
// Utility Functions
// ============================================
function formatDuration(ms) {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showError(message) {
  console.error('[Doctor]', message);
  // Could show a toast notification here
}

function showMessage(message) {
  console.log('[Doctor]', message);
  // Could show a toast notification here
}

// attemptFix is called via event listeners, no need for global
