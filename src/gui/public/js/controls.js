/**
 * Controls JavaScript - Run Controls for RWM Puppet Master GUI
 * 
 * Handles execution control actions (start, pause, resume, stop, reset)
 * and button state management based on orchestrator state.
 */

// ============================================
// State Management
// ============================================
const controlsState = {
  currentState: 'idle',
  loadingButtons: new Set(),
};

// ============================================
// Error Code Mapping
// ============================================
const ERROR_MESSAGES = {
  'ORCHESTRATOR_NOT_AVAILABLE': 'Orchestrator not available. Please restart the application.',
  'NO_PROJECT_LOADED': 'No project loaded. Please open or create a project first.',
  'PRD_INVALID': 'PRD validation failed. Please review your project configuration.',
  'CONFIG_INVALID': 'Configuration validation failed. Please check your config.yaml file.',
  'CLI_TOOLS_MISSING': 'Required CLI tools not available. Run Doctor to install missing tools.',
  'GIT_NOT_INITIALIZED': 'Git repository not initialized. Run "git init" in project directory.',
  'INVALID_STATE': 'Invalid state for this action.',
  'NOT_IMPLEMENTED': 'This feature is not yet implemented.',
  'NO_CURRENT_ITEM': 'No current item to retry.',
  'ITEM_NOT_FAILED': 'Current item has not failed.',
  'TIER_ID_REQUIRED': 'Tier ID is required.',
  'INVALID_SCOPE': 'Invalid scope. Must be one of: phase, task, subtask.',
  'REASON_REQUIRED': 'Reason is required.',
  'NO_PROCESS_RUNNING': 'No CLI process currently running.',
  'START_FAILED': 'Failed to start execution.',
  'PAUSE_FAILED': 'Failed to pause execution.',
  'RESUME_FAILED': 'Failed to resume execution.',
  'STOP_FAILED': 'Failed to stop execution.',
  'RESET_FAILED': 'Failed to reset execution.',
  'RETRY_FAILED': 'Failed to retry execution.',
  'REPLAN_FAILED': 'Failed to replan.',
  'REOPEN_FAILED': 'Failed to reopen item.',
  'KILL_SPAWN_FAILED': 'Failed to kill and spawn fresh iteration.',
};

// ============================================
// Toast Notifications
// ============================================
function showToast(message, type = 'info', duration = 5000) {
  // Create toast element
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
  `;

  // Add color based on type
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

  // Remove after specified duration (default 5 seconds)
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

// Add CSS animations if not already present
if (!document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// ============================================
// Loading Spinners
// ============================================
function showSpinner(buttonId) {
  const button = document.getElementById(buttonId);
  if (!button) return;

  controlsState.loadingButtons.add(buttonId);
  button.disabled = true;
  button.style.position = 'relative';
  button.style.opacity = '0.7';

  // Create spinner element
  const spinner = document.createElement('span');
  spinner.className = 'button-spinner';
  spinner.style.cssText = `
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid var(--ink-black);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    margin-left: 8px;
    vertical-align: middle;
  `;

  // Add spinner animation if not already present
  if (!document.getElementById('spinner-styles')) {
    const style = document.createElement('style');
    style.id = 'spinner-styles';
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  button.appendChild(spinner);
}

function hideSpinner(buttonId) {
  const button = document.getElementById(buttonId);
  if (!button) return;

  controlsState.loadingButtons.delete(buttonId);
  button.disabled = false;
  button.style.opacity = '1';

  const spinner = button.querySelector('.button-spinner');
  if (spinner) {
    spinner.remove();
  }
}

// ============================================
// Helper Functions
// ============================================
async function handleControlAction(endpoint, options = {}) {
  const { method = 'POST', body = {}, buttonId = null, successMessage = null, toastType = 'success' } = options;
  
  if (buttonId) {
    showSpinner(buttonId);
  }
  
  try {
    const response = await fetch(`/api/controls/${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      if (successMessage) {
        showToast(successMessage, toastType);
      }
      // Log session ID if present
      if (data.sessionId) {
        console.log('[Controls] Session ID:', data.sessionId);
      }
      return { success: true, data };
    } else {
      // Map error code to user-friendly message
      const errorCode = data.code || 'UNKNOWN_ERROR';
      let errorMessage = ERROR_MESSAGES[errorCode] || data.error || `Failed to ${endpoint}`;
      
      // Add details if available
      if (data.details && Array.isArray(data.details) && data.details.length > 0) {
        const detailsText = data.details.length === 1 
          ? data.details[0] 
          : data.details.slice(0, 3).join(', ') + (data.details.length > 3 ? '...' : '');
        errorMessage += ` (${detailsText})`;
      }
      
      // Add hint if available
      if (data.hint) {
        errorMessage += ` ${data.hint}`;
      }
      
      showToast(errorMessage, 'error');
      return { success: false, error: data };
    }
  } catch (error) {
    const errorMessage = `Failed to ${endpoint}: ${error.message}`;
    console.error(`[Controls] Error ${endpoint}:`, error);
    showToast(errorMessage, 'error');
    return { success: false, error };
  } finally {
    if (buttonId) {
      hideSpinner(buttonId);
    }
  }
}

// ============================================
// Control Functions
// ============================================
async function startExecution(fromCheckpoint) {
  return handleControlAction('start', {
    body: fromCheckpoint ? { fromCheckpoint } : {},
    buttonId: 'start-btn',
    successMessage: 'Execution started',
  });
}

async function pauseExecution() {
  return handleControlAction('pause', {
    buttonId: 'pause-btn',
    successMessage: 'Execution paused',
    toastType: 'warning',
  });
}

async function resumeExecution() {
  return handleControlAction('resume', {
    buttonId: 'resume-btn',
    successMessage: 'Execution resumed',
  });
}

async function stopExecution(force = false) {
  return handleControlAction('stop', {
    body: { force },
    buttonId: 'stop-btn',
    successMessage: 'Execution stopped',
    toastType: 'warning',
  });
}

async function resetExecution() {
  return handleControlAction('reset', {
    buttonId: 'reset-btn',
    successMessage: 'Execution reset',
    toastType: 'info',
  });
}

async function retryExecution() {
  return handleControlAction('retry', {
    buttonId: 'retry-btn',
    successMessage: 'Retry initiated',
  });
}

async function replanExecution(tierId, scope) {
  if (!tierId) {
    const tierIdInput = prompt('Tier ID to replan:');
    if (!tierIdInput) return;
    tierId = tierIdInput;
  }
  
  if (!scope) {
    scope = prompt('Scope (phase/task/subtask):');
    if (!scope || !['phase', 'task', 'subtask'].includes(scope)) {
      showToast('Invalid scope. Must be phase, task, or subtask.', 'error');
      return;
    }
  }
  
  return handleControlAction('replan', {
    buttonId: 'replan-btn',
    body: { tierId, scope },
    successMessage: 'Replan initiated',
  });
}

async function reopenItem(tierId, reason) {
  if (!tierId) {
    const tierIdInput = prompt('Item ID to reopen:');
    if (!tierIdInput) return;
    tierId = tierIdInput;
  }
  
  if (!reason) {
    const reasonInput = prompt('Reason for reopening:');
    if (!reasonInput) return;
    reason = reasonInput;
  }
  
  return handleControlAction('reopen', {
    buttonId: 'reopen-btn',
    body: { tierId, reason },
    successMessage: 'Item reopened',
  });
}

async function killSpawnExecution() {
  if (!confirm('Kill current process and spawn fresh? This will abort the current iteration.')) {
    return;
  }
  
  return handleControlAction('kill-spawn', {
    buttonId: 'kill-btn',
    successMessage: 'Process killed, fresh iteration spawned',
  });
}

// ============================================
// Button State Management
// ============================================
function updateButtonStates(state) {
  controlsState.currentState = state;

  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const resumeBtn = document.getElementById('resume-btn');
  const stopBtn = document.getElementById('stop-btn');
  const retryBtn = document.getElementById('retry-btn');
  const replanBtn = document.getElementById('replan-btn');
  const reopenBtn = document.getElementById('reopen-btn');
  const killBtn = document.getElementById('kill-btn');
  const resetBtn = document.getElementById('reset-btn');

  // Reset all buttons
  [startBtn, pauseBtn, resumeBtn, stopBtn, retryBtn, replanBtn, reopenBtn, killBtn, resetBtn].forEach(btn => {
    if (btn) {
      btn.disabled = true;
    }
  });

  // Enable buttons based on state
  switch (state) {
    case 'idle':
    case 'planning':
      if (startBtn) startBtn.disabled = false;
      break;

    case 'executing':
      if (pauseBtn) pauseBtn.disabled = false;
      if (stopBtn) stopBtn.disabled = false;
      if (killBtn) killBtn.disabled = false;
      break;

    case 'paused':
      if (resumeBtn) resumeBtn.disabled = false;
      if (stopBtn) stopBtn.disabled = false;
      break;

    case 'error':
    case 'complete':
      if (resetBtn) resetBtn.disabled = false;
      break;
  }
}

// ============================================
// Event Listeners Setup
// ============================================
function initializeControls() {
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const resumeBtn = document.getElementById('resume-btn');
  const stopBtn = document.getElementById('stop-btn');
  const resetBtn = document.getElementById('reset-btn');

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      startExecution();
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      pauseExecution();
    });
  }

  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      resumeExecution();
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      if (confirm('Are you sure? This will abort current work.')) {
        stopExecution();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('This will clear all progress. Continue?')) {
        resetExecution();
      }
    });
  }

  // Initialize button states
  updateButtonStates('idle');
}

// Export functions for use in dashboard.js
if (typeof window !== 'undefined') {
  window.controls = {
    startExecution,
    pauseExecution,
    resumeExecution,
    stopExecution,
    resetExecution,
    retryExecution,
    replanExecution,
    reopenItem,
    killSpawnExecution,
    updateButtonStates,
    initializeControls,
  };
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeControls);
} else {
  initializeControls();
}
