/**
 * RWM Puppet Master - Dashboard JavaScript
 *
 * Handles WebSocket connection, real-time updates,
 * theme switching, and UI interactions.
 */

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
  theme: localStorage.getItem('theme') || 'dark',
  connected: false,
  orchestratorState: 'idle',
  currentItem: null,
  progress: {
    phases: { current: 0, total: 0 },
    tasks: { current: 0, total: 0 },
    subtasks: { current: 0, total: 0 },
  },
  startTime: null,
  elapsedSeconds: 0,
  outputLines: [],
  commits: [],
  errors: [],
  ws: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 10,
  reconnectDelay: 1000,
};

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
  // Theme
  themeToggle: document.getElementById('themeToggle'),

  // Connection
  connectionStatus: document.getElementById('connectionStatus'),

  // Status bar
  statusIndicator: document.getElementById('statusIndicator'),
  currentPhase: document.getElementById('currentPhase'),
  currentTask: document.getElementById('currentTask'),
  currentSubtask: document.getElementById('currentSubtask'),
  currentIteration: document.getElementById('currentIteration'),
  claudeBudget: document.getElementById('claudeBudget'),
  codexBudget: document.getElementById('codexBudget'),
  cursorBudget: document.getElementById('cursorBudget'),

  // Current item
  currentItemId: document.getElementById('currentItemId'),
  currentItemTitle: document.getElementById('currentItemTitle'),
  itemPlatform: document.getElementById('itemPlatform'),
  itemIteration: document.getElementById('itemIteration'),
  itemModel: document.getElementById('itemModel'),
  itemSession: document.getElementById('itemSession'),
  criteriaList: document.getElementById('criteriaList'),
  verifierList: document.getElementById('verifierList'),

  // Progress
  overallPercent: document.getElementById('overallPercent'),
  overallProgressBar: document.getElementById('overallProgressBar'),
  phasesCount: document.getElementById('phasesCount'),
  phasesBar: document.getElementById('phasesBar'),
  tasksCount: document.getElementById('tasksCount'),
  tasksBar: document.getElementById('tasksBar'),
  subtasksCount: document.getElementById('subtasksCount'),
  subtasksBar: document.getElementById('subtasksBar'),
  elapsedTime: document.getElementById('elapsedTime'),

  // Controls
  btnStart: document.getElementById('btnStart'),
  btnPause: document.getElementById('btnPause'),
  btnStop: document.getElementById('btnStop'),
  btnRetry: document.getElementById('btnRetry'),
  btnReplan: document.getElementById('btnReplan'),
  btnReopen: document.getElementById('btnReopen'),
  btnKill: document.getElementById('btnKill'),

  // Output
  outputTerminal: document.getElementById('outputTerminal'),
  btnCopyOutput: document.getElementById('btnCopyOutput'),
  btnExpandOutput: document.getElementById('btnExpandOutput'),

  // Lists
  commitsList: document.getElementById('commitsList'),
  errorsList: document.getElementById('errorsList'),

  // Modal
  modalOverlay: document.getElementById('modalOverlay'),
  modalContainer: document.getElementById('modalContainer'),
  modalTitle: document.getElementById('modalTitle'),
  modalContent: document.getElementById('modalContent'),
  modalActions: document.getElementById('modalActions'),
  modalClose: document.getElementById('modalClose'),

  // Toast
  toastContainer: document.getElementById('toastContainer'),

  // Connection lines
  connectionLines: document.getElementById('connectionLines'),
};

// ============================================
// THEME MANAGEMENT
// ============================================

function initTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  updateConnectionLines();
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', state.theme);
  document.documentElement.setAttribute('data-theme', state.theme);
  updateConnectionLines();
}

// ============================================
// CONNECTION LINES (Visual Connections Between Panels)
// ============================================

function updateConnectionLines() {
  const svg = elements.connectionLines;
  if (!svg) return;

  // Clear existing lines
  svg.innerHTML = '';

  // Get panel positions
  const panels = document.querySelectorAll('.glass-panel[data-panel]');
  const panelRects = {};

  panels.forEach((panel) => {
    const rect = panel.getBoundingClientRect();
    const panelId = panel.dataset.panel;
    panelRects[panelId] = {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height,
    };
  });

  // Define connections based on data flow
  const connections = [
    { from: 'status', to: 'current-item', color: 'pink' },
    { from: 'status', to: 'progress', color: 'cyan' },
    { from: 'current-item', to: 'output', color: 'green' },
    { from: 'controls', to: 'current-item', color: 'orange' },
    { from: 'progress', to: 'controls', color: 'purple' },
  ];

  // Create gradient definition
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

  // Create rainbow gradient
  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  gradient.setAttribute('id', 'line-gradient');
  gradient.setAttribute('gradientUnits', 'userSpaceOnUse');

  const colors = [
    { offset: '0%', color: '#FF6B9D' },
    { offset: '20%', color: '#FFB347' },
    { offset: '40%', color: '#FFFF7A' },
    { offset: '60%', color: '#7AFF7A' },
    { offset: '80%', color: '#7AE5FF' },
    { offset: '100%', color: '#B47AFF' },
  ];

  colors.forEach(({ offset, color }) => {
    const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop.setAttribute('offset', offset);
    stop.setAttribute('style', `stop-color:${color}`);
    gradient.appendChild(stop);
  });

  defs.appendChild(gradient);
  svg.appendChild(defs);

  // Draw connections with curved paths
  connections.forEach(({ from, to }) => {
    const fromRect = panelRects[from];
    const toRect = panelRects[to];

    if (!fromRect || !toRect) return;

    // Calculate connection points
    let startX, startY, endX, endY;

    // Determine best connection points
    if (fromRect.bottom < toRect.top) {
      // From is above To
      startX = fromRect.centerX;
      startY = fromRect.bottom;
      endX = toRect.centerX;
      endY = toRect.top;
    } else if (fromRect.top > toRect.bottom) {
      // From is below To
      startX = fromRect.centerX;
      startY = fromRect.top;
      endX = toRect.centerX;
      endY = toRect.bottom;
    } else if (fromRect.right < toRect.left) {
      // From is left of To
      startX = fromRect.right;
      startY = fromRect.centerY;
      endX = toRect.left;
      endY = toRect.centerY;
    } else if (fromRect.left > toRect.right) {
      // From is right of To
      startX = fromRect.left;
      startY = fromRect.centerY;
      endX = toRect.right;
      endY = toRect.centerY;
    } else {
      // Overlapping, skip
      return;
    }

    // Calculate control points for smooth curve
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    // Create curved path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // Use quadratic bezier for flowing curves
    const dx = endX - startX;
    const dy = endY - startY;

    let ctrlX, ctrlY;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal-ish connection
      ctrlX = midX;
      ctrlY = startY + (endY - startY) * 0.1 + (Math.random() - 0.5) * 20;
    } else {
      // Vertical-ish connection
      ctrlX = startX + (endX - startX) * 0.1 + (Math.random() - 0.5) * 20;
      ctrlY = midY;
    }

    const d = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${midX} ${midY} T ${endX} ${endY}`;
    path.setAttribute('d', d);
    path.setAttribute('stroke', 'url(#line-gradient)');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');

    svg.appendChild(path);
  });
}

// Debounced resize handler
let resizeTimeout;
function handleResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(updateConnectionLines, 100);
}

// ============================================
// WEBSOCKET CONNECTION
// ============================================

function connectWebSocket() {
  const wsUrl = `ws://${window.location.host}/events`;

  try {
    state.ws = new WebSocket(wsUrl);

    state.ws.onopen = () => {
      console.log('WebSocket connected');
      state.connected = true;
      state.reconnectAttempts = 0;
      state.reconnectDelay = 1000;
      updateConnectionStatus(true);

      // Subscribe to all events
      state.ws.send(
        JSON.stringify({
          action: 'subscribe',
          events: ['*'],
        })
      );

      // Fetch initial state
      fetchInitialState();
    };

    state.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketEvent(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    state.ws.onclose = () => {
      console.log('WebSocket disconnected');
      state.connected = false;
      updateConnectionStatus(false);
      scheduleReconnect();
    };

    state.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      state.connected = false;
      updateConnectionStatus(false);
    };
  } catch (error) {
    console.error('Failed to create WebSocket:', error);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (state.reconnectAttempts >= state.maxReconnectAttempts) {
    showToast('Connection failed. Please refresh the page.', 'error');
    return;
  }

  state.reconnectAttempts++;
  const delay = Math.min(state.reconnectDelay * Math.pow(2, state.reconnectAttempts - 1), 30000);

  console.log(`Reconnecting in ${delay}ms (attempt ${state.reconnectAttempts})`);

  setTimeout(connectWebSocket, delay);
}

function updateConnectionStatus(connected) {
  const statusEl = elements.connectionStatus;
  const textEl = statusEl.querySelector('.status-text');

  if (connected) {
    statusEl.classList.add('connected');
    statusEl.classList.remove('disconnected');
    textEl.textContent = 'Connected';
  } else {
    statusEl.classList.remove('connected');
    statusEl.classList.add('disconnected');
    textEl.textContent = 'Disconnected';
  }
}

// ============================================
// EVENT HANDLERS
// ============================================

function handleWebSocketEvent(event) {
  const { type, payload } = event;

  switch (type) {
    case 'state_changed':
      handleStateChange(payload);
      break;

    case 'iteration_started':
      handleIterationStart(payload);
      break;

    case 'iteration_completed':
      handleIterationComplete(payload);
      break;

    case 'output_chunk':
      handleOutputChunk(payload);
      break;

    case 'progress':
      handleProgressUpdate(payload);
      break;

    case 'gate_started':
      handleGateStart(payload);
      break;

    case 'gate_completed':
      handleGateComplete(payload);
      break;

    case 'error':
      handleError(payload);
      break;

    case 'commit':
      handleCommit(payload);
      break;

    case 'budget_warning':
      handleBudgetWarning(payload);
      break;

    case 'budget_fallback':
      handleBudgetFallback(payload);
      break;

    default:
      console.log('Unhandled event:', type, payload);
  }
}

function handleStateChange(payload) {
  state.orchestratorState = payload.state || payload.newState || 'idle';
  updateStatusIndicator();
  updateControlButtons();

  if (state.orchestratorState === 'executing' && !state.startTime) {
    state.startTime = Date.now();
    startElapsedTimer();
  } else if (['idle', 'complete', 'error'].includes(state.orchestratorState)) {
    state.startTime = null;
    stopElapsedTimer();
  }
}

function handleIterationStart(payload) {
  state.currentItem = payload;
  updateCurrentItemPanel();

  addOutputLine(`Starting iteration ${payload.attempt || 1} for ${payload.tierId}`, 'system');
}

function handleIterationComplete(payload) {
  addOutputLine(
    `Iteration ${payload.attempt || 1} ${payload.status}: ${payload.tierId}`,
    payload.status === 'passed' ? 'stdout' : 'stderr'
  );

  // Update criteria/verifier status if available
  if (payload.criteriaResults) {
    updateCriteriaList(payload.criteriaResults);
  }

  if (payload.verifierResults) {
    updateVerifierList(payload.verifierResults);
  }
}

function handleOutputChunk(payload) {
  const type = payload.stream === 'stderr' ? 'stderr' : 'stdout';
  addOutputLine(payload.content, type);
}

function handleProgressUpdate(payload) {
  if (payload.phases) {
    state.progress.phases = payload.phases;
  }
  if (payload.tasks) {
    state.progress.tasks = payload.tasks;
  }
  if (payload.subtasks) {
    state.progress.subtasks = payload.subtasks;
  }

  updateProgressPanel();
  updateStatusBreadcrumb(payload);
}

function handleGateStart(payload) {
  addOutputLine(`Gate review started: ${payload.type} for ${payload.tierId}`, 'system');
}

function handleGateComplete(payload) {
  const result = payload.passed ? 'PASSED' : 'FAILED';
  const type = payload.passed ? 'stdout' : 'stderr';
  addOutputLine(`Gate ${result}: ${payload.tierId} (${payload.decision || 'N/A'})`, type);
}

function handleError(payload) {
  const error = {
    timestamp: new Date(),
    message: payload.message,
    itemId: payload.itemId,
  };

  state.errors.unshift(error);
  if (state.errors.length > 10) {
    state.errors.pop();
  }

  updateErrorsList();
  showToast(payload.message, 'error');
  addOutputLine(`ERROR: ${payload.message}`, 'stderr');
}

function handleCommit(payload) {
  const commit = {
    sha: payload.sha?.substring(0, 7) || 'unknown',
    message: payload.message || 'No message',
    status: payload.success !== false ? 'success' : 'failed',
  };

  state.commits.unshift(commit);
  if (state.commits.length > 5) {
    state.commits.pop();
  }

  updateCommitsList();
  addOutputLine(`Commit: ${commit.sha} - ${commit.message}`, 'system');
}

function handleBudgetWarning(payload) {
  showToast(
    `Budget warning: ${payload.platform} at ${payload.percentage}% (${payload.current}/${payload.limit})`,
    'warning'
  );
}

function handleBudgetFallback(payload) {
  showToast(`Budget fallback: ${payload.from} -> ${payload.to} (${payload.reason})`, 'warning');
}

// ============================================
// UI UPDATES
// ============================================

function updateStatusIndicator() {
  const indicator = elements.statusIndicator;
  const label = indicator.querySelector('.status-label');

  indicator.className = 'status-indicator';

  switch (state.orchestratorState) {
    case 'executing':
      indicator.classList.add('running');
      label.textContent = 'RUNNING';
      break;
    case 'paused':
      indicator.classList.add('paused');
      label.textContent = 'PAUSED';
      break;
    case 'error':
      indicator.classList.add('error');
      label.textContent = 'ERROR';
      break;
    case 'complete':
      indicator.classList.add('complete');
      label.textContent = 'COMPLETE';
      break;
    default:
      label.textContent = 'IDLE';
  }
}

function updateControlButtons() {
  const s = state.orchestratorState;

  elements.btnStart.disabled = s === 'executing' || s === 'paused';
  elements.btnPause.disabled = s !== 'executing';
  elements.btnStop.disabled = s !== 'executing' && s !== 'paused';
  elements.btnRetry.disabled = s !== 'error' && s !== 'paused';
  elements.btnReplan.disabled = s !== 'error' && s !== 'paused';
  elements.btnReopen.disabled = s !== 'error' && s !== 'complete';
  elements.btnKill.disabled = s !== 'executing' && s !== 'paused';
}

function updateCurrentItemPanel() {
  const item = state.currentItem;

  if (!item) {
    elements.currentItemId.textContent = '-';
    elements.currentItemTitle.textContent = 'No active item';
    elements.itemPlatform.textContent = '-';
    elements.itemIteration.textContent = '-/-';
    elements.itemModel.textContent = '-';
    elements.itemSession.textContent = '-';
    return;
  }

  elements.currentItemId.textContent = item.tierId || item.id || '-';
  elements.currentItemTitle.textContent = item.title || item.description || 'Untitled';
  elements.itemPlatform.textContent = item.platform || '-';
  elements.itemIteration.textContent = `${item.attempt || 1}/${item.maxIterations || 5}`;
  elements.itemModel.textContent = item.model || '-';
  elements.itemSession.textContent = item.sessionId || item.threadId || '-';

  // Update criteria if available
  if (item.criteria) {
    updateCriteriaList(item.criteria);
  }

  // Update verifiers if available
  if (item.verifiers) {
    updateVerifierList(item.verifiers);
  }
}

function updateCriteriaList(criteria) {
  if (!Array.isArray(criteria) || criteria.length === 0) {
    elements.criteriaList.innerHTML = `
      <li class="criteria-item pending">
        <span class="criteria-icon">&#9633;</span>
        <span class="criteria-text">No criteria loaded</span>
      </li>
    `;
    return;
  }

  elements.criteriaList.innerHTML = criteria
    .map((c) => {
      const status = c.passed ? 'passed' : c.failed ? 'failed' : 'pending';
      const icon = c.passed ? '&#10003;' : c.failed ? '&#10007;' : '&#9633;';
      return `
        <li class="criteria-item ${status}">
          <span class="criteria-icon">${icon}</span>
          <span class="criteria-text">${c.text || c.description || c}</span>
        </li>
      `;
    })
    .join('');
}

function updateVerifierList(verifiers) {
  if (!Array.isArray(verifiers) || verifiers.length === 0) {
    elements.verifierList.innerHTML = `
      <li class="verifier-item pending">
        <span class="verifier-icon">&#8987;</span>
        <span class="verifier-text">No verifiers</span>
      </li>
    `;
    return;
  }

  elements.verifierList.innerHTML = verifiers
    .map((v) => {
      const status = v.passed ? 'passed' : v.failed ? 'failed' : 'pending';
      const icon = v.passed ? '&#10003;' : v.failed ? '&#10007;' : '&#8987;';
      return `
        <li class="verifier-item ${status}">
          <span class="verifier-icon">${icon}</span>
          <span class="verifier-text">${v.token || v.name || v}</span>
        </li>
      `;
    })
    .join('');
}

function updateProgressPanel() {
  const { phases, tasks, subtasks } = state.progress;

  // Calculate overall progress
  const totalItems = phases.total + tasks.total + subtasks.total;
  const completedItems = phases.current + tasks.current + subtasks.current;
  const overallPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  elements.overallPercent.textContent = `${overallPercent}%`;
  elements.overallProgressBar.style.width = `${overallPercent}%`;

  // Update tier progress
  elements.phasesCount.textContent = `${phases.current}/${phases.total}`;
  elements.phasesBar.style.width =
    phases.total > 0 ? `${(phases.current / phases.total) * 100}%` : '0%';

  elements.tasksCount.textContent = `${tasks.current}/${tasks.total}`;
  elements.tasksBar.style.width =
    tasks.total > 0 ? `${(tasks.current / tasks.total) * 100}%` : '0%';

  elements.subtasksCount.textContent = `${subtasks.current}/${subtasks.total}`;
  elements.subtasksBar.style.width =
    subtasks.total > 0 ? `${(subtasks.current / subtasks.total) * 100}%` : '0%';
}

function updateStatusBreadcrumb(payload) {
  if (payload.phase !== undefined) {
    elements.currentPhase.textContent = `Phase ${payload.phase.current || 0}/${payload.phase.total || 0}`;
  }
  if (payload.task !== undefined) {
    elements.currentTask.textContent = `Task ${payload.task.current || 0}/${payload.task.total || 0}`;
  }
  if (payload.subtask !== undefined) {
    elements.currentSubtask.textContent = `Subtask ${payload.subtask.current || 0}/${payload.subtask.total || 0}`;
  }
  if (payload.iteration !== undefined) {
    elements.currentIteration.textContent = `Iter ${payload.iteration.current || 0}/${payload.iteration.total || 0}`;
  }
}

function updateCommitsList() {
  if (state.commits.length === 0) {
    elements.commitsList.innerHTML = `
      <li class="commit-item">
        <span class="commit-status success">&#10003;</span>
        <span class="commit-hash">-</span>
        <span class="commit-message">No commits yet</span>
      </li>
    `;
    return;
  }

  elements.commitsList.innerHTML = state.commits
    .map(
      (c) => `
      <li class="commit-item">
        <span class="commit-status ${c.status}">&#10003;</span>
        <span class="commit-hash">${c.sha}</span>
        <span class="commit-message">${c.message}</span>
      </li>
    `
    )
    .join('');
}

function updateErrorsList() {
  if (state.errors.length === 0) {
    elements.errorsList.innerHTML = `
      <li class="error-item">
        <span class="error-icon">&#10003;</span>
        <span class="error-message">No errors</span>
      </li>
    `;
    return;
  }

  elements.errorsList.innerHTML = state.errors
    .map(
      (e) => `
      <li class="error-item error">
        <span class="error-icon">&#10007;</span>
        <span class="error-message">${e.message}</span>
      </li>
    `
    )
    .join('');
}

// ============================================
// OUTPUT TERMINAL
// ============================================

function addOutputLine(content, type = 'stdout') {
  const line = {
    content,
    type,
    timestamp: new Date(),
  };

  state.outputLines.push(line);

  // Keep last 500 lines
  if (state.outputLines.length > 500) {
    state.outputLines.shift();
  }

  // Add to terminal
  const terminal = elements.outputTerminal;
  const lineEl = document.createElement('div');
  lineEl.className = `output-line ${type}`;
  lineEl.innerHTML = `
    <span class="line-prefix">&gt;</span>
    <span class="line-content">${escapeHtml(content)}</span>
  `;

  terminal.appendChild(lineEl);

  // Auto-scroll to bottom
  terminal.scrollTop = terminal.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function copyOutputToClipboard() {
  const text = state.outputLines.map((l) => l.content).join('\n');
  navigator.clipboard.writeText(text).then(() => {
    showToast('Output copied to clipboard', 'success');
  });
}

// ============================================
// ELAPSED TIME
// ============================================

let elapsedInterval = null;

function startElapsedTimer() {
  if (elapsedInterval) return;

  elapsedInterval = setInterval(() => {
    if (state.startTime) {
      state.elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
      updateElapsedDisplay();
    }
  }, 1000);
}

function stopElapsedTimer() {
  if (elapsedInterval) {
    clearInterval(elapsedInterval);
    elapsedInterval = null;
  }
}

function updateElapsedDisplay() {
  const hours = Math.floor(state.elapsedSeconds / 3600);
  const minutes = Math.floor((state.elapsedSeconds % 3600) / 60);
  const seconds = state.elapsedSeconds % 60;

  elements.elapsedTime.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '&#10003;',
    warning: '&#9888;',
    error: '&#10007;',
    info: '&#8505;',
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
    <span class="toast-close">&times;</span>
  `;

  elements.toastContainer.appendChild(toast);

  // Close button handler
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  });

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

// ============================================
// MODAL
// ============================================

function showModal(title, content, actions = []) {
  elements.modalTitle.textContent = title;
  elements.modalContent.innerHTML = content;

  elements.modalActions.innerHTML = actions
    .map(
      (a) => `
      <button class="control-btn ${a.class || ''}" data-action="${a.action}">
        <span class="btn-text">${a.label}</span>
      </button>
    `
    )
    .join('');

  elements.modalOverlay.classList.add('active');
}

function hideModal() {
  elements.modalOverlay.classList.remove('active');
}

// ============================================
// API CALLS
// ============================================

async function fetchInitialState() {
  try {
    // Fetch status
    const statusRes = await fetch('/api/status');
    if (statusRes.ok) {
      const status = await statusRes.json();
      state.orchestratorState = status.state || 'idle';
      updateStatusIndicator();
      updateControlButtons();
    }

    // Try to fetch state if endpoint exists
    try {
      const stateRes = await fetch('/api/state');
      if (stateRes.ok) {
        const stateData = await stateRes.json();
        if (stateData.completionStats) {
          state.progress.phases = {
            current: stateData.completionStats.passed || 0,
            total: stateData.completionStats.total || 0,
          };
          updateProgressPanel();
        }
      }
    } catch (e) {
      // State endpoint may not be available yet
    }

    // Try to fetch progress
    try {
      const progressRes = await fetch('/api/progress');
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        // Update from progress entries if available
      }
    } catch (e) {
      // Progress endpoint may not be available yet
    }
  } catch (error) {
    console.error('Error fetching initial state:', error);
  }
}

async function sendControlCommand(command, body = {}) {
  try {
    const response = await fetch(`/api/controls/${command}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Command failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      showToast(`Command '${command}' executed successfully`, 'success');
    } else {
      showToast(`Command '${command}' failed: ${result.error || 'Unknown error'}`, 'error');
    }

    return result;
  } catch (error) {
    console.error(`Error sending command '${command}':`, error);
    showToast(`Failed to send command '${command}'`, 'error');
    return { success: false, error: error.message };
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

function initEventListeners() {
  // Theme toggle
  elements.themeToggle.addEventListener('click', toggleTheme);
  elements.themeToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTheme();
    }
  });

  // Control buttons
  elements.btnStart.addEventListener('click', () => sendControlCommand('start'));
  elements.btnPause.addEventListener('click', () => sendControlCommand('pause'));
  elements.btnStop.addEventListener('click', () => {
    showModal(
      'Stop Execution',
      '<p>Are you sure you want to stop execution? This will abort the current work.</p>',
      [
        { label: 'Cancel', action: 'cancel' },
        { label: 'Stop', action: 'stop', class: 'btn-stop' },
      ]
    );
  });
  elements.btnRetry.addEventListener('click', () => sendControlCommand('retry'));
  elements.btnReplan.addEventListener('click', () => {
    showModal(
      'Replan',
      '<p>Enter a reason for replanning:</p><textarea id="replanReason" rows="3" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--glass-border);background:var(--glass-bg);color:var(--text-primary);"></textarea>',
      [
        { label: 'Cancel', action: 'cancel' },
        { label: 'Replan', action: 'replan', class: 'btn-replan' },
      ]
    );
  });
  elements.btnReopen.addEventListener('click', () => sendControlCommand('reopen'));
  elements.btnKill.addEventListener('click', () => {
    showModal(
      'Kill & Spawn Fresh',
      '<p>This will kill the current process and start a fresh iteration. Continue?</p>',
      [
        { label: 'Cancel', action: 'cancel' },
        { label: 'Kill & Spawn', action: 'kill', class: 'btn-kill' },
      ]
    );
  });

  // Output actions
  elements.btnCopyOutput.addEventListener('click', copyOutputToClipboard);
  elements.btnExpandOutput.addEventListener('click', () => {
    const outputContent = state.outputLines.map((l) => `${l.content}`).join('<br>');
    showModal('Live Output', `<div class="output-terminal" style="max-height:60vh;overflow-y:auto;font-family:monospace;">${outputContent}</div>`, [
      { label: 'Close', action: 'cancel' },
      { label: 'Copy', action: 'copy' },
    ]);
  });

  // Modal
  elements.modalClose.addEventListener('click', hideModal);
  elements.modalOverlay.addEventListener('click', (e) => {
    if (e.target === elements.modalOverlay) {
      hideModal();
    }
  });
  elements.modalActions.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (!action) return;

    switch (action) {
      case 'cancel':
        hideModal();
        break;
      case 'stop':
        sendControlCommand('stop');
        hideModal();
        break;
      case 'kill':
        sendControlCommand('kill-spawn');
        hideModal();
        break;
      case 'replan':
        const reason = document.getElementById('replanReason')?.value || '';
        sendControlCommand('replan', { reason });
        hideModal();
        break;
      case 'copy':
        copyOutputToClipboard();
        break;
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    switch (e.key.toLowerCase()) {
      case ' ':
        e.preventDefault();
        if (state.orchestratorState === 'executing') {
          sendControlCommand('pause');
        } else if (state.orchestratorState === 'paused') {
          sendControlCommand('resume');
        } else if (state.orchestratorState === 'idle') {
          sendControlCommand('start');
        }
        break;
      case 'escape':
        if (elements.modalOverlay.classList.contains('active')) {
          hideModal();
        } else if (state.orchestratorState === 'executing') {
          sendControlCommand('pause');
        }
        break;
      case 'r':
        if (!elements.btnRetry.disabled) {
          sendControlCommand('retry');
        }
        break;
      case 'l':
        elements.outputTerminal.scrollTop = elements.outputTerminal.scrollHeight;
        break;
      case '?':
        showModal(
          'Keyboard Shortcuts',
          `
          <div style="display:grid;grid-template-columns:auto 1fr;gap:8px 16px;font-size:0.875rem;">
            <kbd>Space</kbd><span>Start/Pause toggle</span>
            <kbd>Escape</kbd><span>Stop/Close modal</span>
            <kbd>R</kbd><span>Retry current item</span>
            <kbd>L</kbd><span>Scroll to latest output</span>
            <kbd>?</kbd><span>Show this help</span>
          </div>
        `,
          [{ label: 'Close', action: 'cancel' }]
        );
        break;
    }
  });

  // Window resize for connection lines
  window.addEventListener('resize', handleResize);

  // Update connection lines after initial render
  setTimeout(updateConnectionLines, 100);
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
  console.log('RWM Puppet Master Dashboard initializing...');

  // Initialize theme
  initTheme();

  // Initialize event listeners
  initEventListeners();

  // Connect WebSocket
  connectWebSocket();

  // Initialize UI state
  updateStatusIndicator();
  updateControlButtons();
  updateProgressPanel();

  console.log('Dashboard initialized');
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
