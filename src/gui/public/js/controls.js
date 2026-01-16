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
// Toast Notifications
// ============================================
function showToast(message, type = 'info') {
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

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
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
// Control Functions
// ============================================
async function startExecution(fromCheckpoint) {
  const buttonId = 'start-btn';
  showSpinner(buttonId);

  try {
    const body = fromCheckpoint ? { fromCheckpoint } : {};
    const response = await fetch('/api/controls/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showToast('Execution started', 'success');
      if (data.sessionId) {
        console.log('[Controls] Session ID:', data.sessionId);
      }
    } else {
      showToast(data.error || 'Failed to start execution', 'error');
    }
  } catch (error) {
    console.error('[Controls] Error starting execution:', error);
    showToast('Error starting execution', 'error');
  } finally {
    hideSpinner(buttonId);
  }
}

async function pauseExecution() {
  const buttonId = 'pause-btn';
  showSpinner(buttonId);

  try {
    const response = await fetch('/api/controls/pause', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showToast('Execution paused', 'warning');
    } else {
      showToast(data.error || 'Failed to pause execution', 'error');
    }
  } catch (error) {
    console.error('[Controls] Error pausing execution:', error);
    showToast('Error pausing execution', 'error');
  } finally {
    hideSpinner(buttonId);
  }
}

async function resumeExecution() {
  const buttonId = 'resume-btn';
  showSpinner(buttonId);

  try {
    const response = await fetch('/api/controls/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showToast('Execution resumed', 'success');
    } else {
      showToast(data.error || 'Failed to resume execution', 'error');
    }
  } catch (error) {
    console.error('[Controls] Error resuming execution:', error);
    showToast('Error resuming execution', 'error');
  } finally {
    hideSpinner(buttonId);
  }
}

async function stopExecution(force = false) {
  const buttonId = 'stop-btn';
  showSpinner(buttonId);

  try {
    const response = await fetch('/api/controls/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ force }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showToast('Execution stopped', 'warning');
    } else {
      showToast(data.error || 'Failed to stop execution', 'error');
    }
  } catch (error) {
    console.error('[Controls] Error stopping execution:', error);
    showToast('Error stopping execution', 'error');
  } finally {
    hideSpinner(buttonId);
  }
}

async function resetExecution() {
  const buttonId = 'reset-btn';
  showSpinner(buttonId);

  try {
    const response = await fetch('/api/controls/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showToast('Execution reset', 'info');
    } else {
      showToast(data.error || 'Failed to reset execution', 'error');
    }
  } catch (error) {
    console.error('[Controls] Error resetting execution:', error);
    showToast('Error resetting execution', 'error');
  } finally {
    hideSpinner(buttonId);
  }
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
