/**
 * History JavaScript - Vibrant Technical Design
 * 
 * Handles execution history loading and display
 */

import { createSkeletonTableRow, removeSkeletons } from './skeletons.js';

// ============================================
// State Management
// ============================================
const state = {
  sessions: [],
  currentSort: { column: 'startTime', direction: 'desc' },
};

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Dark mode is handled by navigation.js
  setupEventListeners();
  loadHistory();
});

// ============================================
// Event Listeners
// ============================================
function setupEventListeners() {
  // Refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadHistory();
    });
  }

  // Table sorting
  const sortableHeaders = document.querySelectorAll('.sortable');
  sortableHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const column = header.getAttribute('data-sort');
      if (column) {
        sortTable(column);
      }
    });
  });
}

// ============================================
// API Calls
// ============================================
async function loadHistory() {
  try {
    showLoading();

    const response = await fetch('/api/history');
    if (!response.ok) {
      if (response.status === 503) {
        // SessionTracker not available - show empty state
        showEmptyState('Session tracking not available. Start an execution to enable history tracking.');
        return;
      }
      throw new Error(`Failed to load history: ${response.statusText}`);
    }

    const data = await response.json();
    state.sessions = data.sessions || [];

    if (state.sessions.length === 0) {
      showEmptyState();
    } else {
      // Apply current sort
      applySort();
      renderTable();
      updateCount();
    }
  } catch (error) {
    console.error('[History] Error loading history:', error);
    showError(`[ERROR] Failed to load history: ${error.message}`);
  }
}

// ============================================
// Rendering
// ============================================
function renderTable() {
  const tbody = document.getElementById('history-tbody');
  const table = document.getElementById('history-table');
  const loadingMessage = document.getElementById('loading-message');
  const emptyState = document.getElementById('empty-state');

  if (!tbody || !table) {
    return;
  }

  // Hide loading and empty state
  if (loadingMessage) loadingMessage.style.display = 'none';
  if (emptyState) emptyState.style.display = 'none';

  // Show table
  table.style.display = 'table';

  // Remove any skeletons before rendering
  removeSkeletons(tbody);
  tbody.removeAttribute('aria-busy');

  // Clear existing rows
  tbody.innerHTML = '';

  // Render sessions
  state.sessions.forEach(session => {
    const row = createSessionRow(session);
    tbody.appendChild(row);
  });

  // Update sort indicators
  updateSortIndicators();
}

function createSessionRow(session) {
  const row = document.createElement('tr');
  row.className = 'history-row';

  // Session ID
  const sessionIdCell = document.createElement('td');
  sessionIdCell.className = 'monospace';
  sessionIdCell.textContent = session.sessionId;
  row.appendChild(sessionIdCell);

  // Start Time
  const startTimeCell = document.createElement('td');
  startTimeCell.textContent = formatTimestamp(session.startTime);
  row.appendChild(startTimeCell);

  // End Time
  const endTimeCell = document.createElement('td');
  endTimeCell.textContent = session.endTime ? formatTimestamp(session.endTime) : '-';
  row.appendChild(endTimeCell);

  // Duration
  const durationCell = document.createElement('td');
  durationCell.textContent = calculateDuration(session.startTime, session.endTime);
  row.appendChild(durationCell);

  // Status
  const statusCell = document.createElement('td');
  statusCell.innerHTML = `<span class="status-badge status-${session.status}">${formatStatus(session.status)}</span>`;
  row.appendChild(statusCell);

  // Outcome
  const outcomeCell = document.createElement('td');
  if (session.outcome) {
    outcomeCell.innerHTML = `<span class="outcome-badge outcome-${session.outcome}">${formatOutcome(session.outcome)}</span>`;
  } else {
    outcomeCell.textContent = '-';
  }
  row.appendChild(outcomeCell);

  // Iterations
  const iterationsCell = document.createElement('td');
  iterationsCell.textContent = session.iterationsRun || 0;
  row.appendChild(iterationsCell);

  return row;
}

// ============================================
// Formatting
// ============================================
function formatTimestamp(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function calculateDuration(startTime, endTime) {
  if (!startTime) return '-';
  
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const diffMs = end.getTime() - start.getTime();
  
  if (diffMs < 0) return '-';
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function formatStatus(status) {
  const statusMap = {
    'running': 'RUNNING',
    'completed': 'COMPLETED',
    'stopped': 'STOPPED',
    'failed': 'FAILED',
  };
  return statusMap[status] || status.toUpperCase();
}

function formatOutcome(outcome) {
  const outcomeMap = {
    'success': 'SUCCESS',
    'partial': 'PARTIAL',
    'failed': 'FAILED',
    'stopped': 'STOPPED',
  };
  return outcomeMap[outcome] || outcome.toUpperCase();
}

// ============================================
// Sorting
// ============================================
function sortTable(column) {
  if (state.currentSort.column === column) {
    // Toggle direction
    state.currentSort.direction = state.currentSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    // New column, default to descending
    state.currentSort.column = column;
    state.currentSort.direction = 'desc';
  }

  applySort();
  renderTable();
}

function applySort() {
  const { column, direction } = state.currentSort;

  state.sessions.sort((a, b) => {
    let aVal, bVal;

    switch (column) {
      case 'sessionId':
        aVal = a.sessionId;
        bVal = b.sessionId;
        break;
      case 'startTime':
        aVal = new Date(a.startTime).getTime();
        bVal = new Date(b.startTime).getTime();
        break;
      case 'endTime':
        aVal = a.endTime ? new Date(a.endTime).getTime() : 0;
        bVal = b.endTime ? new Date(b.endTime).getTime() : 0;
        break;
      case 'duration':
        aVal = calculateDurationValue(a.startTime, a.endTime);
        bVal = calculateDurationValue(b.startTime, b.endTime);
        break;
      case 'status':
        aVal = a.status;
        bVal = b.status;
        break;
      case 'outcome':
        aVal = a.outcome || '';
        bVal = b.outcome || '';
        break;
      case 'iterations':
        aVal = a.iterationsRun || 0;
        bVal = b.iterationsRun || 0;
        break;
      default:
        return 0;
    }

    if (aVal < bVal) {
      return direction === 'asc' ? -1 : 1;
    } else if (aVal > bVal) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

function calculateDurationValue(startTime, endTime) {
  if (!startTime) return 0;
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  return end.getTime() - start.getTime();
}

function updateSortIndicators() {
  const headers = document.querySelectorAll('.sortable');
  headers.forEach(header => {
    const column = header.getAttribute('data-sort');
    const indicator = header.querySelector('.sort-indicator');
    
    if (column === state.currentSort.column && indicator) {
      indicator.textContent = state.currentSort.direction === 'asc' ? ' ↑' : ' ↓';
    } else if (indicator) {
      indicator.textContent = '';
    }
  });
}

// ============================================
// UI State Management
// ============================================
function showLoading() {
  const table = document.getElementById('history-table');
  const loadingMessage = document.getElementById('loading-message');
  const emptyState = document.getElementById('empty-state');
  const tbody = document.getElementById('history-tbody');

  // Hide loading message and show table with skeletons
  if (loadingMessage) loadingMessage.style.display = 'none';
  if (table) table.style.display = 'table';
  if (emptyState) emptyState.style.display = 'none';
  
  if (tbody) {
    tbody.innerHTML = '';
    tbody.setAttribute('aria-busy', 'true');
    
    // Create 6 skeleton rows (history table has 7 columns: Session ID, Start Time, End Time, Duration, Status, Outcome, Iterations)
    const widths = ['long', 'medium', 'medium', 'short', 'short', 'short', 'short'];
    for (let i = 0; i < 6; i++) {
      const skeletonRow = createSkeletonTableRow(7, widths);
      tbody.appendChild(skeletonRow);
    }
  }
}

function showEmptyState(message) {
  const table = document.getElementById('history-table');
  const loadingMessage = document.getElementById('loading-message');
  const emptyState = document.getElementById('empty-state');

  if (table) table.style.display = 'none';
  if (loadingMessage) loadingMessage.style.display = 'none';
  if (emptyState) {
    emptyState.style.display = 'block';
    if (message) {
      emptyState.querySelector('p').textContent = message;
    }
  }
}

function showError(message) {
  const tbody = document.getElementById('history-tbody');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="7" class="error-message">${message}</td></tr>`;
  }
}

function updateCount() {
  const countElement = document.getElementById('history-count');
  if (countElement) {
    const count = state.sessions.length;
    countElement.textContent = `${count} ${count === 1 ? 'session' : 'sessions'}`;
  }
}
