/**
 * Dashboard JavaScript - Vibrant Technical Design
 * 
 * Handles WebSocket connection, state management, and UI updates
 */

// ============================================
// State Management
// ============================================
const state = {
  ws: null,
  connected: false,
  reconnectAttempts: 0,
  maxReconnectAttempts: 10,
  reconnectDelay: 1000,
  currentState: 'idle',
  currentItem: null,
  progress: {
    phases: { current: 0, total: 0 },
    tasks: { current: 0, total: 0 },
    subtasks: { current: 0, total: 0 },
    iterations: { current: 0, total: 0 },
    percentage: 0,
  },
  elapsedTime: 0,
  elapsedTimeStart: null,
  budgets: {
    claude: { current: 0, limit: 3 },
    codex: { current: 0, limit: 20 },
    cursor: { current: 0, limit: 'unlimited' },
  },
  outputLines: [],
  commits: [],
  errors: [],
};

// ============================================
// WebSocket Connection
// ============================================
function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/events`;
  
  try {
    state.ws = new WebSocket(wsUrl);
    
    state.ws.onopen = () => {
      console.log('[Dashboard] WebSocket connected');
      state.connected = true;
      state.reconnectAttempts = 0;
      updateConnectionStatus(true);
      
      // Fetch initial state
      fetchState();
    };
    
    state.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('[Dashboard] Error parsing WebSocket message:', error);
      }
    };
    
    state.ws.onerror = (error) => {
      console.error('[Dashboard] WebSocket error:', error);
      updateConnectionStatus(false);
    };
    
    state.ws.onclose = () => {
      console.log('[Dashboard] WebSocket disconnected');
      state.connected = false;
      updateConnectionStatus(false);
      
      // Attempt to reconnect with exponential backoff
      if (state.reconnectAttempts < state.maxReconnectAttempts) {
        state.reconnectAttempts++;
        const delay = Math.min(state.reconnectDelay * Math.pow(2, state.reconnectAttempts - 1), 30000);
        console.log(`[Dashboard] Reconnecting in ${delay}ms (attempt ${state.reconnectAttempts})...`);
        setTimeout(connectWebSocket, delay);
      } else {
        console.error('[Dashboard] Max reconnection attempts reached');
      }
    };
    
    // Heartbeat ping every 30 seconds
    setInterval(() => {
      if (state.ws && state.ws.readyState === WebSocket.OPEN) {
        state.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
    
  } catch (error) {
    console.error('[Dashboard] Error creating WebSocket:', error);
    updateConnectionStatus(false);
  }
}

// ============================================
// State Fetching
// ============================================
async function fetchState() {
  try {
    const response = await fetch('/api/state');
    if (response.ok) {
      const data = await response.json();
      updateState(data);
      
      // Update button states based on fetched state
      if (data.orchestratorState) {
        state.currentState = data.orchestratorState;
        if (window.controls && window.controls.updateButtonStates) {
          window.controls.updateButtonStates(data.orchestratorState);
        } else {
          updateControlButtons();
        }
      }
    } else {
      // If API returns error, assume idle state
      console.warn('[Dashboard] State API returned error, assuming idle state');
      if (window.controls && window.controls.updateButtonStates) {
        window.controls.updateButtonStates('idle');
      }
    }
  } catch (error) {
    console.error('[Dashboard] Error fetching state:', error);
    // On error, assume idle state and enable start button
    if (window.controls && window.controls.updateButtonStates) {
      window.controls.updateButtonStates('idle');
    }
  }
}

// ============================================
// WebSocket Message Handling
// ============================================
function handleWebSocketMessage(message) {
  switch (message.type) {
    case 'state_change':
      updateOrchestratorState(message.payload.state, message.payload.previousState);
      break;
    case 'progress':
      updateProgress(message.payload);
      // Also update position if provided
      if (message.payload.position) {
        updatePosition(message.payload.position);
      }
      break;
    case 'output':
      appendOutput(message.payload.line, message.payload.type || 'stdout');
      break;
    case 'iteration_start':
      updateCurrentItem(message.payload);
      if (!state.elapsedTimeStart) {
        state.elapsedTimeStart = Date.now();
      }
      // Update position if provided
      if (message.payload.position) {
        updatePosition(message.payload.position);
      }
      break;
    case 'iteration_complete':
      updateIterationComplete(message.payload);
      break;
    case 'gate_start':
      updateVerifierStatus(message.payload);
      break;
    case 'gate_complete':
      updateVerifierComplete(message.payload);
      break;
    case 'commit':
      addCommit(message.payload);
      break;
    case 'error':
      addError(message.payload);
      break;
    case 'budget_warning':
      showBudgetWarning(message.payload);
      // Also update budget display
      if (message.payload.budgets) {
        updateBudgets(message.payload.budgets);
      }
      break;
    case 'budget_update':
      // Explicit budget update event
      if (message.payload) {
        updateBudgets(message.payload);
      }
      break;
    case 'pong':
      // Heartbeat response
      break;
    default:
      console.log('[Dashboard] Unhandled message type:', message.type);
  }
}

// ============================================
// UI Update Functions
// ============================================
function updateConnectionStatus(connected) {
  const indicator = document.getElementById('connection-indicator');
  const text = document.getElementById('connection-text');
  
  if (indicator && text) {
    if (connected) {
      indicator.classList.add('connected');
      indicator.setAttribute('aria-label', 'WebSocket connected');
      text.textContent = 'Connected';
      text.setAttribute('aria-label', 'Connection status: Connected');
    } else {
      indicator.classList.remove('connected');
      indicator.setAttribute('aria-label', 'WebSocket disconnected');
      text.textContent = 'Disconnected';
      text.setAttribute('aria-label', 'Connection status: Disconnected');
    }
  } else {
    console.warn('[Dashboard] Connection status elements not found:', { indicator, text });
  }
}

// Initialize connection status on page load
function initConnectionStatus() {
  updateConnectionStatus(false); // Start as disconnected
}

function updateOrchestratorState(newState, previousState) {
  state.currentState = newState;
  
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  
  if (statusDot && statusText) {
    statusDot.className = 'status-dot';
    statusDot.classList.add(newState);
    const statusUpper = newState.toUpperCase();
    statusText.textContent = statusUpper;
    statusText.setAttribute('aria-label', `Current status: ${statusUpper}`);
  }
  
  // Update control button states using controls module
  if (window.controls && window.controls.updateButtonStates) {
    window.controls.updateButtonStates(newState);
  } else {
    // Fallback to local function if controls module not loaded
    updateControlButtons();
  }
}

function updateState(data) {
  if (data.orchestratorState) {
    updateOrchestratorState(data.orchestratorState, null);
  }
  
  if (data.currentPhaseId !== undefined || data.currentTaskId !== undefined || data.currentSubtaskId !== undefined) {
    updatePosition(data);
  }
  
  if (data.completionStats) {
    updateProgress({
      phases: { current: data.completionStats.passed || 0, total: data.completionStats.total || 0 },
      tasks: { current: data.completionStats.passed || 0, total: data.completionStats.total || 0 },
      subtasks: { current: data.completionStats.passed || 0, total: data.completionStats.total || 0 },
    });
  }
  
  // Update budgets if provided
  if (data.budgets) {
    updateBudgets(data.budgets);
  }
}

function updateBudgets(budgets) {
  const claudeEl = document.getElementById('budget-claude');
  const codexEl = document.getElementById('budget-codex');
  const cursorEl = document.getElementById('budget-cursor');
  
  if (claudeEl && budgets.claude) {
    const { current = 0, limit = 0 } = budgets.claude;
    const text = `Claude ${current}/${limit}`;
    claudeEl.textContent = text;
    claudeEl.setAttribute('aria-label', `Claude budget: ${text}`);
  }
  
  if (codexEl && budgets.codex) {
    const { current = 0, limit = 0 } = budgets.codex;
    const text = `Codex ${current}/${limit}`;
    codexEl.textContent = text;
    codexEl.setAttribute('aria-label', `Codex budget: ${text}`);
  }
  
  if (cursorEl && budgets.cursor) {
    const { current = 0, limit = 'unlimited' } = budgets.cursor;
    let text;
    if (limit === 'unlimited') {
      text = `Cursor ${current} (∞)`;
    } else {
      text = `Cursor ${current}/${limit}`;
    }
    cursorEl.textContent = text;
    cursorEl.setAttribute('aria-label', `Cursor budget: ${text}`);
  }
}

function updatePosition(data) {
  // Update phase position
  const phasePos = document.getElementById('phase-position');
  if (phasePos) {
    const current = data.currentPhaseId || 0;
    const total = data.totalPhases || 0;
    phasePos.textContent = `Phase ${current}/${total}`;
    phasePos.setAttribute('aria-label', `Phase progress: ${current} of ${total}`);
  }
  
  // Update task position
  const taskPos = document.getElementById('task-position');
  if (taskPos) {
    const current = data.currentTaskId || 0;
    const total = data.totalTasks || 0;
    taskPos.textContent = `Task ${current}/${total}`;
    taskPos.setAttribute('aria-label', `Task progress: ${current} of ${total}`);
  }
  
  // Update subtask position
  const subtaskPos = document.getElementById('subtask-position');
  if (subtaskPos) {
    const current = data.currentSubtaskId || 0;
    const total = data.totalSubtasks || 0;
    subtaskPos.textContent = `Subtask ${current}/${total}`;
    subtaskPos.setAttribute('aria-label', `Subtask progress: ${current} of ${total}`);
  }
  
  // Update iteration position
  const iterPos = document.getElementById('iteration-position');
  if (iterPos) {
    const current = data.currentIteration || 0;
    const max = data.maxIterations || 0;
    iterPos.textContent = `Iter ${current}/${max}`;
    iterPos.setAttribute('aria-label', `Iteration progress: ${current} of ${max}`);
  }
}

function updateProgress(progress) {
  if (progress.phases) {
    state.progress.phases = progress.phases;
    updateTierProgress('phases', progress.phases);
  }
  if (progress.tasks) {
    state.progress.tasks = progress.tasks;
    updateTierProgress('tasks', progress.tasks);
  }
  if (progress.subtasks) {
    state.progress.subtasks = progress.subtasks;
    updateTierProgress('subtasks', progress.subtasks);
  }
  if (progress.iterations) {
    state.progress.iterations = progress.iterations;
  }
  
  // Calculate overall percentage
  const total = state.progress.phases.total + state.progress.tasks.total + state.progress.subtasks.total;
  const current = state.progress.phases.current + state.progress.tasks.current + state.progress.subtasks.current;
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  state.progress.percentage = percentage;
  
  updateOverallProgress(percentage);
}

function updateOverallProgress(percentage) {
  const fill = document.getElementById('overall-progress-fill');
  const percentageEl = document.getElementById('overall-progress-percentage');
  
  if (fill) {
    fill.style.width = `${percentage}%`;
  }
  if (percentageEl) {
    percentageEl.textContent = `${percentage}%`;
  }
}

function updateTierProgress(tier, data) {
  const countEl = document.getElementById(`${tier}-complete`);
  const fillEl = document.getElementById(`${tier}-fill`);
  
  if (countEl) {
    countEl.textContent = `${data.current}/${data.total}`;
  }
  if (fillEl && data.total > 0) {
    const percentage = Math.round((data.current / data.total) * 100);
    fillEl.style.width = `${percentage}%`;
  }
}

function updateCurrentItem(item) {
  state.currentItem = item;
  
  const itemId = document.getElementById('current-item-id');
  const itemTitle = document.getElementById('current-item-title');
  const iteration = document.getElementById('current-iteration');
  const platform = document.getElementById('current-platform');
  const model = document.getElementById('current-model');
  const session = document.getElementById('current-session');
  
  if (itemId && item.id) itemId.textContent = item.id;
  if (itemTitle && item.title) itemTitle.textContent = item.title;
  if (iteration && item.iteration) {
    iteration.textContent = `${item.iteration.current || 0}/${item.iteration.max || 0}`;
  }
  if (platform && item.platform) platform.textContent = item.platform;
  if (model && item.model) model.textContent = item.model;
  if (session && item.sessionId) session.textContent = item.sessionId;
  
  if (item.acceptanceCriteria) {
    updateAcceptanceCriteria(item.acceptanceCriteria);
  }
  
  if (item.verifiers) {
    updateVerifiers(item.verifiers);
  }
}

function updateAcceptanceCriteria(criteria) {
  const list = document.getElementById('acceptance-criteria-list');
  if (!list) return;
  
  list.innerHTML = '';
  
  if (Array.isArray(criteria) && criteria.length > 0) {
    criteria.forEach(criterion => {
      const li = document.createElement('li');
      li.className = 'criteria-item';
      if (criterion.passed) {
        li.classList.add('complete');
        li.textContent = `[PASS] ${criterion.description}`;
      } else {
        li.classList.add('pending');
        li.textContent = `[PENDING] ${criterion.description}`;
      }
      list.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.className = 'criteria-item';
    li.textContent = 'No criteria defined';
    list.appendChild(li);
  }
}

function updateVerifiers(verifiers) {
  const list = document.getElementById('verifier-list');
  if (!list) return;
  
  list.innerHTML = '';
  
  if (Array.isArray(verifiers) && verifiers.length > 0) {
    verifiers.forEach(verifier => {
      const li = document.createElement('li');
      li.className = 'verifier-item';
      
      let status = 'pending';
      let prefix = '[PENDING]';
      
      if (verifier.status === 'running') {
        status = 'running';
        prefix = '[RUNNING]';
      } else if (verifier.status === 'passed') {
        status = 'passed';
        prefix = '[PASS]';
      } else if (verifier.status === 'failed') {
        status = 'failed';
        prefix = '[FAIL]';
      }
      
      li.classList.add(status);
      li.textContent = `${prefix} ${verifier.token || verifier.type || 'Unknown'}`;
      list.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.className = 'verifier-item';
    li.textContent = 'No verifiers active';
    list.appendChild(li);
  }
}

function updateVerifierStatus(payload) {
  // Update verifier to running state
  if (state.currentItem && state.currentItem.verifiers) {
    const verifier = state.currentItem.verifiers.find(v => v.token === payload.token);
    if (verifier) {
      verifier.status = 'running';
      updateVerifiers(state.currentItem.verifiers);
    }
  }
}

function updateVerifierComplete(payload) {
  // Update verifier to passed/failed state
  if (state.currentItem && state.currentItem.verifiers) {
    const verifier = state.currentItem.verifiers.find(v => v.token === payload.token);
    if (verifier) {
      verifier.status = payload.passed ? 'passed' : 'failed';
      updateVerifiers(state.currentItem.verifiers);
    }
  }
}

function updateIterationComplete(payload) {
  // Update iteration status
  if (payload.status === 'complete' || payload.status === 'failed') {
    state.elapsedTimeStart = null;
    updateElapsedTime(0);
  }
}

function appendOutput(line, type) {
  state.outputLines.push({ line, type, timestamp: Date.now() });
  
  // Keep only last 1000 lines
  if (state.outputLines.length > 1000) {
    state.outputLines = state.outputLines.slice(-1000);
  }
  
  const terminal = document.getElementById('output-terminal');
  if (terminal) {
    const outputLine = document.createElement('div');
    outputLine.className = 'output-line';
    outputLine.textContent = line;
    terminal.appendChild(outputLine);
    
    // Auto-scroll to bottom
    terminal.scrollTop = terminal.scrollHeight;
  }
}

function addCommit(commit) {
  state.commits.unshift(commit);
  if (state.commits.length > 5) {
    state.commits = state.commits.slice(0, 5);
  }
  
  const list = document.getElementById('commits-list');
  if (list) {
    list.innerHTML = '';
    if (state.commits.length === 0) {
      const li = document.createElement('li');
      li.className = 'activity-item';
      li.textContent = 'No commits yet';
      li.setAttribute('aria-label', 'No commits yet');
      list.appendChild(li);
    } else {
      state.commits.forEach(commit => {
        const li = document.createElement('li');
        li.className = 'activity-item success';
        const sha = commit.sha ? commit.sha.substring(0, 7) : 'unknown';
        li.textContent = `[OK] ${sha} ${commit.message || 'No message'}`;
        list.appendChild(li);
      });
    }
  }
}

function addError(error) {
  state.errors.unshift(error);
  if (state.errors.length > 5) {
    state.errors = state.errors.slice(0, 5);
  }
  
  const list = document.getElementById('errors-list');
  if (list) {
    list.innerHTML = '';
    if (state.errors.length === 0) {
      const li = document.createElement('li');
      li.className = 'activity-item';
      li.textContent = 'No errors';
      li.setAttribute('aria-label', 'No errors');
      list.appendChild(li);
    } else {
      state.errors.forEach(error => {
        const li = document.createElement('li');
        li.className = 'activity-item error';
        const time = new Date(error.timestamp || Date.now()).toLocaleTimeString();
        const prefix = error.severity === 'error' ? '[ERROR]' : '[WARN]';
        li.textContent = `${prefix} ${time} ${error.message || 'Unknown error'}`;
        list.appendChild(li);
      });
    }
  }
}

function showBudgetWarning(payload) {
  console.warn('[Dashboard] Budget warning:', payload);
  // Could show a toast notification here
}

function updateElapsedTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeElapsed = document.getElementById('time-elapsed');
  if (timeElapsed) {
    timeElapsed.textContent = `${minutes}m ${secs}s`;
  }
}

function updateControlButtons() {
  // Fallback function - controls module should handle this
  // This is kept for backwards compatibility
  if (window.controls && window.controls.updateButtonStates) {
    window.controls.updateButtonStates(state.currentState);
  } else {
    // Basic fallback implementation
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const stopBtn = document.getElementById('stop-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    if (startBtn) startBtn.disabled = state.currentState !== 'idle' && state.currentState !== 'planning';
    if (pauseBtn) pauseBtn.disabled = state.currentState !== 'executing';
    if (resumeBtn) resumeBtn.disabled = state.currentState !== 'paused';
    if (stopBtn) stopBtn.disabled = state.currentState !== 'executing' && state.currentState !== 'paused';
    if (resetBtn) resetBtn.disabled = state.currentState !== 'error' && state.currentState !== 'complete';
  }
}

// ============================================
// Control Actions
// ============================================
// Note: Control actions are now handled by controls.js module
// This function is kept for backwards compatibility with retry/replan/reopen/kill buttons
async function controlAction(action, confirmMessage = null) {
  if (confirmMessage && !confirm(confirmMessage)) {
    return;
  }
  
  try {
    const response = await fetch(`/api/controls/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`[Dashboard] ${action} action:`, data);
    } else {
      console.error(`[Dashboard] ${action} action failed:`, response.statusText);
    }
  } catch (error) {
    console.error(`[Dashboard] Error executing ${action}:`, error);
  }
}

// ============================================
// Navigation
// ============================================
// Navigation is now handled by navigation.js module
// This function is kept for backwards compatibility but will be overridden
function initNavigation() {
  // Use shared navigation module if available
  if (window.navigation && window.navigation.init) {
    window.navigation.init();
  }
}

// ============================================
// Project Management
// ============================================
async function checkProjectState() {
  try {
    // Try to fetch current project info from state API
    const stateResponse = await fetch('/api/state');
    if (stateResponse.ok) {
      const state = await stateResponse.json();
      // Check if state has project info
      if (state.projectName || state.projectPath) {
        updateProjectManagementPanel(true, {
          name: state.projectName || 'Unknown',
          path: state.projectPath || '-'
        });
        return;
      }
    }
    
    // Try to fetch from projects API (if endpoint exists)
    try {
      const response = await fetch('/api/projects/current');
      if (response.ok) {
        const project = await response.json();
        if (project && project.name) {
          updateProjectManagementPanel(true, project);
          return;
        }
      }
    } catch {
      // Endpoint doesn't exist, that's okay
    }
  } catch (error) {
    console.log('[Dashboard] No project loaded or API not available:', error);
  }
  
  // No project loaded
  updateProjectManagementPanel(false, null);
}

function updateProjectManagementPanel(hasProject, project) {
  const noProjectState = document.querySelector('.no-project-state');
  const projectLoadedState = document.querySelector('.project-loaded-state');
  
  if (hasProject && project) {
    // Show project loaded state
    if (noProjectState) noProjectState.style.display = 'none';
    if (projectLoadedState) {
      projectLoadedState.style.display = 'block';
      
      // Update project info
      const nameEl = document.getElementById('project-display-name');
      const pathEl = document.getElementById('project-display-path');
      if (nameEl) {
        nameEl.textContent = project.name || 'Unknown';
        nameEl.setAttribute('aria-label', `Project name: ${project.name || 'Unknown'}`);
      }
      if (pathEl) {
        const fullPath = project.path || '-';
        pathEl.textContent = fullPath;
        // Add title attribute with full path for tooltip (always, even if truncated)
        pathEl.setAttribute('title', fullPath);
        pathEl.setAttribute('aria-label', `Project path: ${fullPath}`);
      }
      
      // Update project name in header
      const headerNameEl = document.getElementById('project-name');
      if (headerNameEl) headerNameEl.textContent = project.name || 'Untangle';
    }
  } else {
    // Show no project state
    if (noProjectState) noProjectState.style.display = 'block';
    if (projectLoadedState) projectLoadedState.style.display = 'none';
    
    // Reset header project name
    const headerNameEl = document.getElementById('project-name');
    if (headerNameEl) headerNameEl.textContent = 'No Project';
  }
}

// ============================================
// Event Listeners
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize navigation
  initNavigation();
  
  // Initialize status bar with default values to ensure it's visible
  initConnectionStatus();
  updateOrchestratorState('idle', null);
  updatePosition({
    currentPhaseId: 0,
    totalPhases: 0,
    currentTaskId: 0,
    totalTasks: 0,
    currentSubtaskId: 0,
    totalSubtasks: 0,
    currentIteration: 0,
    maxIterations: 0
  });
  updateBudgets({
    claude: { current: 0, limit: 3 },
    codex: { current: 0, limit: 20 },
    cursor: { current: 0, limit: 'unlimited' }
  });
  
  // Control buttons (start, pause, resume, stop, reset) are handled by controls.js
  // Additional buttons (retry, replan, reopen, kill) also use controls.js module
  const retryBtn = document.getElementById('retry-btn');
  const replanBtn = document.getElementById('replan-btn');
  const reopenBtn = document.getElementById('reopen-btn');
  const killBtn = document.getElementById('kill-btn');
  
  if (retryBtn && window.controls && window.controls.retryExecution) {
    retryBtn.addEventListener('click', () => window.controls.retryExecution());
  }
  if (replanBtn && window.controls && window.controls.replanExecution) {
    replanBtn.addEventListener('click', () => window.controls.replanExecution());
  }
  if (reopenBtn && window.controls && window.controls.reopenItem) {
    reopenBtn.addEventListener('click', () => window.controls.reopenItem());
  }
  if (killBtn && window.controls && window.controls.killSpawnExecution) {
    killBtn.addEventListener('click', () => window.controls.killSpawnExecution());
  }
  
  // Copy output button
  const copyBtn = document.getElementById('copy-output-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const terminal = document.getElementById('output-terminal');
      if (terminal) {
        const text = Array.from(terminal.querySelectorAll('.output-line'))
          .map(el => el.textContent)
          .join('\n');
        navigator.clipboard.writeText(text).then(() => {
          console.log('[Dashboard] Output copied to clipboard');
          // Show brief feedback
          const originalText = copyBtn.textContent;
          copyBtn.textContent = 'COPIED';
          setTimeout(() => {
            copyBtn.textContent = originalText;
          }, 2000);
        }).catch(err => {
          console.error('[Dashboard] Failed to copy:', err);
        });
      }
    });
  }
  
  // View more commits button
  const commitsMoreBtn = document.getElementById('commits-more-btn');
  if (commitsMoreBtn) {
    commitsMoreBtn.addEventListener('click', () => {
      // Navigate to evidence page filtered by commits
      window.location.href = '/evidence?type=commit';
    });
  }
  
  // View more errors button
  const errorsMoreBtn = document.getElementById('errors-more-btn');
  if (errorsMoreBtn) {
    errorsMoreBtn.addEventListener('click', () => {
      // Navigate to evidence page filtered by errors
      window.location.href = '/evidence?type=error';
    });
  }
  
  // Initialize
  initDarkMode();
  initConnectionStatus(); // Initialize connection status display
  checkProjectState(); // Check if project is loaded
  
  // Initialize status bar with default values
  const statusText = document.getElementById('status-text');
  if (statusText && !statusText.textContent) {
    statusText.textContent = 'IDLE';
  }
  
  // Initialize position indicators if they're empty
  const phasePos = document.getElementById('phase-position');
  if (phasePos && !phasePos.textContent.trim()) {
    phasePos.textContent = 'Phase 0/0';
  }
  const taskPos = document.getElementById('task-position');
  if (taskPos && !taskPos.textContent.trim()) {
    taskPos.textContent = 'Task 0/0';
  }
  const subtaskPos = document.getElementById('subtask-position');
  if (subtaskPos && !subtaskPos.textContent.trim()) {
    subtaskPos.textContent = 'Subtask 0/0';
  }
  const iterPos = document.getElementById('iteration-position');
  if (iterPos && !iterPos.textContent.trim()) {
    iterPos.textContent = 'Iter 0/0';
  }
  
  // Initialize budgets with default values if needed
  updateBudgets({
    claude: { current: 0, limit: 3 },
    codex: { current: 0, limit: 20 },
    cursor: { current: 0, limit: 'unlimited' }
  });
  
  // Project selector click handler
  const projectSelector = document.getElementById('project-selector');
  if (projectSelector) {
    projectSelector.addEventListener('click', () => {
      window.location.href = '/projects';
    });
  }
  // Control buttons will be initialized by controls.js module
  // Update button states after controls module loads
  setTimeout(() => {
    if (window.controls && window.controls.updateButtonStates) {
      window.controls.updateButtonStates(state.currentState);
    } else {
      updateControlButtons();
    }
  }, 100);
  connectWebSocket();
  
  // Update elapsed time every second
  setInterval(() => {
    if (state.elapsedTimeStart) {
      const elapsed = Math.floor((Date.now() - state.elapsedTimeStart) / 1000);
      updateElapsedTime(elapsed);
    }
  }, 1000);
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
  updateToggleButton(theme);
}

function updateToggleButton(theme) {
  const toggleBtn = document.getElementById('dark-mode-toggle');
  if (toggleBtn) {
    toggleBtn.textContent = theme === 'light' ? 'DARK MODE' : 'LIGHT MODE';
  }
}
