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
  fixableChecks: new Set(),
  results: [],
  filteredResults: [],
  currentCategory: '',
  lastRunTime: null,
  running: false,
};

// ============================================
// Toast Notifications (copied from controls.js)
// ============================================
function showToast(message, type = 'info', duration = 5000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background-color: var(--paper-cream);
    border: 2px solid var(--ink-black);
    box-shadow: 3px 3px 0 0 var(--ink-black), 2px 2px 0 0 var(--ink-black);
    z-index: 10000;
    font-family: var(--font-geometric, 'Orbitron', sans-serif);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    animation: slideIn 0.3s ease;
    max-width: 520px;
    white-space: pre-wrap;
  `;

  if (type === 'success') {
    toast.style.borderLeftColor = 'var(--acid-lime, #00FF41)';
    toast.style.borderLeftWidth = '4px';
  } else if (type === 'error') {
    toast.style.borderLeftColor = 'var(--hot-magenta, #FF1493)';
    toast.style.borderLeftWidth = '4px';
  } else if (type === 'warning') {
    toast.style.borderLeftColor = 'var(--safety-orange, #FF7F27)';
    toast.style.borderLeftWidth = '4px';
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

if (!document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Dark mode is handled by navigation.js
  setupEventListeners();
  loadChecks();
});

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
    state.fixableChecks = new Set(
      state.checks.filter((c) => c.fixAvailable).map((c) => c.name)
    );
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
  // Find the currently clicked button via DOM lookup by data-check-name.
  // Note: element IDs are not stable because we re-render the table frequently.
  const selector = `.fix-btn[data-check-name="${CSS.escape(checkName)}"]`;
  const fixBtn = document.querySelector(selector);
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
      const extra =
        errorData.output && typeof errorData.output === 'string'
          ? `\n\n${errorData.output}`
          : '';
      throw new Error(
        (errorData.error || `Failed to fix: ${response.statusText}`) + extra
      );
    }

    const data = await response.json();
    
    if (data.success) {
      const output = data.output || 'Fix completed successfully';
      showMessage(`[OK] ${output}`);
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

  tbody.innerHTML = state.filteredResults.map((result, _index) => {
    const statusIcon = result.passed ? '✓' : '✗';
    const statusClass = result.passed ? 'status-pass' : 'status-fail';
    const duration = formatDuration(result.durationMs);
    const hasFix = !!result.fixAvailable || state.fixableChecks.has(result.name);
    const checkNameEscaped = escapeHtml(result.name);

    return `
      <tr class="result-row" data-check-name="${checkNameEscaped}">
        <td class="status-cell ${statusClass}">${statusIcon}</td>
        <td>${checkNameEscaped}</td>
        <td class="category-cell">${escapeHtml(result.category.toUpperCase())}</td>
        <td>${escapeHtml(maskSecrets(result.message))}</td>
        <td class="duration-cell">${duration}</td>
        <td class="actions-cell">
          ${hasFix && !result.passed ? `<button class="icon-btn fix-btn" data-check-name="${checkNameEscaped}" aria-label="Fix ${checkNameEscaped}">FIX</button>` : '-'}
        </td>
      </tr>
      ${result.details || result.fixSuggestion ? `
      <tr class="detail-row" data-check-name="${checkNameEscaped}">
        <td colspan="6" class="detail-cell">
          ${result.details ? `<div class="detail-section"><strong>Details:</strong> ${escapeHtml(maskSecrets(result.details))}</div>` : ''}
          ${result.fixSuggestion ? `<div class="fix-suggestion"><strong>Fix:</strong> ${escapeHtml(maskSecrets(result.fixSuggestion))}</div>` : ''}
        </td>
      </tr>
      ` : ''}
    `;
  }).join('');

  // Attach event listeners to fix buttons
  tbody.querySelectorAll('.fix-btn').forEach(btn => {
    btn.addEventListener('click', () => {
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

function maskValue(value) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  if (trimmed.length <= 8) {
    return '***';
  }
  return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
}

/**
 * Best-effort masking for any secret-like strings that may appear in doctor output.
 * This runs before escapeHtml() and is intentionally conservative.
 */
function maskSecrets(text) {
  if (typeof text !== 'string') {
    return text;
  }

  let masked = text;

  // Context7 API keys
  masked = masked.replace(/\bctx7sk-[a-zA-Z0-9_-]{20,}\b/g, (m) => maskValue(m));
  // GitHub tokens
  masked = masked.replace(/\b(ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36}\b/g, (m) => maskValue(m));
  // OpenAI-style keys
  masked = masked.replace(/\bsk-[a-zA-Z0-9]{20,}\b/g, (m) => maskValue(m));
  // Bearer tokens
  masked = masked.replace(/\bBearer\s+([a-zA-Z0-9._-]{20,})\b/g, (_m, tok) => `Bearer ${maskValue(tok)}`);
  // Private key blocks (very defensive)
  masked = masked.replace(
    /-----BEGIN\s+[^-]*PRIVATE\s+KEY-----[\s\S]*?-----END\s+[^-]*PRIVATE\s+KEY-----/g,
    '-----BEGIN PRIVATE KEY-----\n***REDACTED***\n-----END PRIVATE KEY-----'
  );
  // Key/value assignments
  masked = masked.replace(
    /\b(ANTHROPIC_API_KEY|OPENAI_API_KEY|CONTEXT7_API_KEY|API_KEY|TOKEN|SECRET|PASSWORD)\b(\s*[:=]\s*)(['"]?)([^'"\s]+)(\3)/gi,
    (_m, key, sep, quote, value) => `${key}${sep}${quote}${maskValue(value)}${quote}`
  );

  return masked;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showError(message) {
  console.error('[Doctor]', message);
  showToast(message, 'error', 7000);
}

function showMessage(message) {
  console.log('[Doctor]', message);
  showToast(message, 'success', 5000);
}

// attemptFix is called via event listeners, no need for global
