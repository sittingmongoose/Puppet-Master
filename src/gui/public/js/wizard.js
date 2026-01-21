/**
 * Wizard JavaScript - Start Chain Wizard
 * 
 * Handles state management, file uploads, API calls, and step navigation
 * for the start chain wizard workflow.
 */

// ============================================
// State Management
// ============================================
const wizardState = {
  currentStep: 1,
  uploadedFile: null,
  parsedRequirements: null,
  generatedPrd: null,
  architecture: null,
  tierPlan: null,
  validationResult: null,
  projectPath: null,
  errors: [],
  ws: null,
  startChainInProgress: false
};

// ============================================
// DOM Elements
// ============================================
// Initialize elements lazily to avoid accessing DOM before it's ready
let elements = null;

function initElements() {
  elements = {
    // Step indicators
    stepIndicators: {
      1: document.getElementById('step-1-indicator'),
      2: document.getElementById('step-2-indicator'),
      3: document.getElementById('step-3-indicator'),
      4: document.getElementById('step-4-indicator'),
    },
    // Step content
    stepContents: {
      1: document.getElementById('step-1'),
      2: document.getElementById('step-2'),
      3: document.getElementById('step-3'),
      4: document.getElementById('step-4'),
    },
    // Navigation
    backBtn: document.getElementById('back-btn'),
    nextBtn: document.getElementById('next-btn'),
    finishBtn: document.getElementById('finish-btn'),
    // Step 1: Upload
    uploadZone: document.getElementById('upload-zone'),
    fileInput: document.getElementById('file-input'),
    browseBtn: document.getElementById('browse-btn'),
    fileInfo: document.getElementById('file-info'),
    fileName: document.getElementById('file-name'),
    fileSize: document.getElementById('file-size'),
    textPaste: document.getElementById('text-paste'),
    formatSelect: document.getElementById('format-select'),
    pasteSubmitBtn: document.getElementById('paste-submit-btn'),
    uploadError: document.getElementById('upload-error'),
    // Step 2: Preview
    parsedPreview: document.getElementById('parsed-preview'),
    parsedStats: document.getElementById('parsed-stats'),
    statSections: document.getElementById('stat-sections'),
    statGoals: document.getElementById('stat-goals'),
    statConstraints: document.getElementById('stat-constraints'),
    // Step 3: Review
    prdPreview: document.getElementById('prd-preview'),
    prdStats: document.getElementById('prd-stats'),
    statPhases: document.getElementById('stat-phases'),
    statTasks: document.getElementById('stat-tasks'),
    statSubtasks: document.getElementById('stat-subtasks'),
    validationResults: document.getElementById('validation-results'),
    validationErrors: document.getElementById('validation-errors'),
    validationErrorsList: document.getElementById('validation-errors-list'),
    validationWarnings: document.getElementById('validation-warnings'),
    validationWarningsList: document.getElementById('validation-warnings-list'),
    // Step 4: Save
    saveSummary: document.getElementById('save-summary'),
    summaryProjectName: document.getElementById('summary-project-name'),
    summaryPhases: document.getElementById('summary-phases'),
    summaryTasks: document.getElementById('summary-tasks'),
    summarySubtasks: document.getElementById('summary-subtasks'),
    summaryPath: document.getElementById('summary-path'),
    confirmSave: document.getElementById('confirm-save'),
    saveError: document.getElementById('save-error'),
    saveSuccess: document.getElementById('save-success'),
  };
}

// ============================================
// WebSocket Connection for Start Chain Progress
// ============================================
function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/events`;
  
  try {
    wizardState.ws = new WebSocket(wsUrl);
    
    wizardState.ws.onopen = () => {
      console.log('[Wizard] WebSocket connected');
    };
    
    wizardState.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('[Wizard] Error parsing WebSocket message:', error);
      }
    };
    
    wizardState.ws.onerror = (error) => {
      console.error('[Wizard] WebSocket error:', error);
    };
    
    wizardState.ws.onclose = () => {
      console.log('[Wizard] WebSocket disconnected');
      // Attempt to reconnect if Start Chain is in progress
      if (wizardState.startChainInProgress) {
        setTimeout(connectWebSocket, 3000);
      }
    };
  } catch (error) {
    console.error('[Wizard] Error creating WebSocket:', error);
  }
}

function handleWebSocketMessage(message) {
  // Handle Start Chain step events
  if (message.type === 'start_chain_step') {
    showStartChainProgress(message.step, message.status);
  }
  
  // Handle Start Chain completion
  if (message.type === 'start_chain_complete') {
    handleStartChainComplete(message.projectPath);
  }
}

function showStartChainProgress(step, status) {
  const progressContainer = document.getElementById('start-chain-progress');
  const progressStep = document.querySelector(`.progress-step[data-step="${step}"]`);
  
  if (!progressContainer || !progressStep) return;
  
  // Show progress container
  if (progressContainer.style.display === 'none') {
    progressContainer.style.display = 'block';
  }
  
  // Update step status
  progressStep.classList.remove('running', 'complete');
  const statusElement = progressStep.querySelector('.progress-step-status');
  
  if (status === 'started') {
    progressStep.classList.add('running');
    if (statusElement) statusElement.textContent = 'RUNNING';
  } else if (status === 'completed') {
    progressStep.classList.add('complete');
    if (statusElement) statusElement.textContent = 'COMPLETE';
  } else if (status === 'failed') {
    progressStep.classList.add('failed');
    if (statusElement) {
      statusElement.textContent = 'FAILED';
      statusElement.style.color = 'var(--hot-magenta)';
    }
  }
}

function handleStartChainComplete(projectPath) {
  wizardState.startChainInProgress = false;
  
  // Clear fallback timeout if it exists
  if (fallbackTimeout) {
    clearTimeout(fallbackTimeout);
    fallbackTimeout = null;
  }
  
  const progressContainer = document.getElementById('start-chain-progress');
  if (progressContainer) {
    // Mark validation step as complete
    const validationStep = document.querySelector('.progress-step[data-step="validation"]');
    if (validationStep) {
      validationStep.classList.add('complete');
      const statusElement = validationStep.querySelector('.progress-step-status');
      if (statusElement) statusElement.textContent = 'COMPLETE';
    }
  }
  
  // Show success message
  const saveSuccess = document.getElementById('save-success');
  if (saveSuccess) {
    saveSuccess.style.display = 'block';
  }
  
  // Open project and redirect to dashboard
  openProjectAndRedirect(projectPath || wizardState.projectPath);
}

async function openProjectAndRedirect(projectPath) {
  try {
    // Open project via API
    const response = await fetch('/api/projects/open', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectPath: projectPath || wizardState.projectPath
      }),
    });
    
    if (response.ok) {
      // Redirect to dashboard
      window.location.href = '/';
    } else {
      // Still redirect even if open fails
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  } catch (error) {
    console.error('[Wizard] Error opening project:', error);
    // Still redirect on error
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  }
}

// ============================================
// Step Navigation
// ============================================
function updateStepIndicator(step, state) {
  if (!elements) return;
  const indicator = elements.stepIndicators[step];
  if (!indicator) return;
  
  indicator.classList.remove('active', 'complete');
  if (state === 'active') {
    indicator.classList.add('active');
  } else if (state === 'complete') {
    indicator.classList.add('complete');
  }
}

function showStep(step) {
  if (!elements) return;
  // Hide all steps
  Object.values(elements.stepContents).forEach(content => {
    if (content) {
      content.classList.remove('active');
    }
  });
  
  // Show current step
  const currentContent = elements.stepContents[step];
  if (currentContent) {
    currentContent.classList.add('active');
  }
  
  // Update step indicators
  for (let i = 1; i <= 4; i++) {
    if (i < step) {
      updateStepIndicator(i, 'complete');
    } else if (i === step) {
      updateStepIndicator(i, 'active');
    } else {
      updateStepIndicator(i, '');
    }
  }
  
  // Update navigation buttons
  if (elements.backBtn) elements.backBtn.disabled = step === 1;
  if (elements.nextBtn) elements.nextBtn.style.display = step === 4 ? 'none' : 'inline-block';
  if (elements.finishBtn) elements.finishBtn.style.display = step === 4 ? 'inline-block' : 'none';
  
  // Update button states based on step completion
  updateButtonStates();
}

function updateButtonStates() {
  if (!elements) return;
  const step = wizardState.currentStep;
  
  if (step === 1) {
    if (elements.nextBtn) elements.nextBtn.disabled = !wizardState.parsedRequirements;
  } else if (step === 2) {
    if (elements.nextBtn) elements.nextBtn.disabled = !wizardState.generatedPrd;
  } else if (step === 3) {
    // Can proceed even with validation errors (warnings are OK)
    if (elements.nextBtn) elements.nextBtn.disabled = false;
  } else if (step === 4) {
    if (elements.finishBtn && elements.confirmSave) {
      elements.finishBtn.disabled = !elements.confirmSave.checked;
    }
  }
}

function nextStep() {
  if (wizardState.currentStep < 4) {
    const currentStep = wizardState.currentStep;
    
    // Auto-advance logic
    if (currentStep === 1 && wizardState.parsedRequirements) {
      // Step 1 -> Step 2: Already have parsed requirements, just show preview
      wizardState.currentStep = 2;
      showStep(2);
      displayParsedRequirements();
    } else if (currentStep === 2 && !wizardState.generatedPrd) {
      // Step 2 -> Step 3: Need to generate PRD
      generatePrd();
    } else if (currentStep === 2 && wizardState.generatedPrd) {
      // Step 2 -> Step 3: Already have PRD, just show review
      wizardState.currentStep = 3;
      showStep(3);
      displayPrd();
      validatePrd();
    } else if (currentStep === 3) {
      // Step 3 -> Step 4: Show summary
      wizardState.currentStep = 4;
      showStep(4);
      displaySummary();
    }
  }
}

function prevStep() {
  if (wizardState.currentStep > 1) {
    wizardState.currentStep--;
    showStep(wizardState.currentStep);
  }
}

// ============================================
// File Upload Handling
// ============================================
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function handleFileSelect(file) {
  if (!file || !elements) return;
  
  wizardState.uploadedFile = file;
  if (elements.fileName) elements.fileName.textContent = file.name;
  if (elements.fileSize) elements.fileSize.textContent = formatFileSize(file.size);
  if (elements.fileInfo) elements.fileInfo.style.display = 'block';
  if (elements.uploadError) elements.uploadError.style.display = 'none';
  
  // Read file and upload
  const reader = new FileReader();
  reader.onload = (e) => {
    const arrayBuffer = e.target.result;
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    uploadFile(base64, file.name);
  };
  reader.onerror = () => {
    showError(elements.uploadError, 'Failed to read file');
  };
  reader.readAsArrayBuffer(file);
}

async function uploadFile(base64Content, filename) {
  if (!elements) return;
  if (elements.nextBtn) elements.nextBtn.disabled = true;
  if (elements.uploadError) elements.uploadError.style.display = 'none';

  const format = detectFormatFromFilename(filename);

  try {
    console.log('[Wizard] Uploading file:', filename, 'format:', format);
    const response = await fetch('/api/wizard/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: base64Content,
        filename: filename,
        format: format,
        projectPath: wizardState.projectPath,
      }),
    });

    console.log('[Wizard] Upload response status:', response.status, response.statusText);

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('[Wizard] Server returned non-JSON response:', text.substring(0, 200));
      throw new Error(`Server returned ${response.status} ${response.statusText}. Expected JSON response.`);
    }

    const data = await response.json();
    console.log('[Wizard] Upload response data:', data);

    if (!response.ok) {
      throw new Error(data.error || `Upload failed with status ${response.status}`);
    }

    if (data.error) {
      if (elements.uploadError) showError(elements.uploadError, data.error);
      if (elements.nextBtn) elements.nextBtn.disabled = true;
    } else {
      wizardState.parsedRequirements = data.parsed;
      updateButtonStates();
      // Auto-advance to step 2
      nextStep();
    }
  } catch (error) {
    console.error('[Wizard] Upload error:', error);
    if (elements.uploadError) showError(elements.uploadError, `Upload failed: ${error.message}`);
    if (elements.nextBtn) elements.nextBtn.disabled = true;
  }
}

function detectFormatFromFilename(filename) {
  const ext = filename.toLowerCase().split('.').pop();
  if (ext === 'md' || ext === 'markdown') return 'markdown';
  if (ext === 'txt') return 'text';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'docx' || ext === 'doc') return 'docx';
  return 'text';
}

async function handleTextPaste() {
  if (!elements || !elements.textPaste || !elements.formatSelect) return;
  const text = elements.textPaste.value.trim();
  if (!text) {
    if (elements.uploadError) showError(elements.uploadError, 'Please enter some text');
    return;
  }

  const format = elements.formatSelect.value;
  if (elements.nextBtn) elements.nextBtn.disabled = true;
  if (elements.uploadError) elements.uploadError.style.display = 'none';

  try {
    console.log('[Wizard] Submitting pasted text, format:', format, 'length:', text.length);
    const response = await fetch('/api/wizard/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        format: format,
        projectPath: wizardState.projectPath,
      }),
    });

    console.log('[Wizard] Text paste response status:', response.status, response.statusText);

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('[Wizard] Server returned non-JSON response:', text.substring(0, 200));
      throw new Error(`Server returned ${response.status} ${response.statusText}. Expected JSON response.`);
    }

    const data = await response.json();
    console.log('[Wizard] Text paste response data:', data);

    if (!response.ok) {
      throw new Error(data.error || `Parse failed with status ${response.status}`);
    }

    if (data.error) {
      if (elements.uploadError) showError(elements.uploadError, data.error);
      if (elements.nextBtn) elements.nextBtn.disabled = true;
    } else {
      wizardState.parsedRequirements = data.parsed;
      updateButtonStates();
      // Auto-advance to step 2
      nextStep();
    }
  } catch (error) {
    console.error('[Wizard] Text paste error:', error);
    if (elements.uploadError) showError(elements.uploadError, `Parse failed: ${error.message}`);
    if (elements.nextBtn) elements.nextBtn.disabled = true;
  }
}

// ============================================
// Display Functions
// ============================================
function displayParsedRequirements() {
  if (!wizardState.parsedRequirements || !elements) return;
  
  const parsed = wizardState.parsedRequirements;
  
  // Display parsed content
  let html = `<div class="preview-content">`;
  html += `<strong>Title:</strong> ${escapeHtml(parsed.title || 'Untitled')}\n\n`;
  html += `<strong>Sections:</strong>\n`;
  parsed.sections.forEach(section => {
    html += `\n${'#'.repeat(section.level)} ${escapeHtml(section.title)}\n`;
    html += `${escapeHtml(section.content)}\n`;
  });
  html += `</div>`;
  
  if (elements.parsedPreview) elements.parsedPreview.innerHTML = html;
  
  // Display stats
  if (elements.statSections) elements.statSections.textContent = parsed.sections.length;
  if (elements.statGoals) elements.statGoals.textContent = parsed.extractedGoals.length;
  if (elements.statConstraints) elements.statConstraints.textContent = parsed.extractedConstraints.length;
  if (elements.parsedStats) elements.parsedStats.style.display = 'grid';
}

function displayPrd() {
  if (!wizardState.generatedPrd || !elements) return;
  
  const prd = wizardState.generatedPrd;
  
  // Display PRD as formatted JSON
  if (elements.prdPreview) {
    elements.prdPreview.innerHTML = `<div class="preview-content">${escapeHtml(JSON.stringify(prd, null, 2))}</div>`;
  }
  
  // Display stats
  const totalTasks = prd.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
  const totalSubtasks = prd.phases.reduce((sum, phase) => 
    sum + phase.tasks.reduce((taskSum, task) => taskSum + task.subtasks.length, 0), 0);
  
  if (elements.statPhases) elements.statPhases.textContent = prd.phases.length;
  if (elements.statTasks) elements.statTasks.textContent = totalTasks;
  if (elements.statSubtasks) elements.statSubtasks.textContent = totalSubtasks;
  if (elements.prdStats) elements.prdStats.style.display = 'grid';
}

function displaySummary() {
  if (!wizardState.generatedPrd || !elements) return;
  
  const prd = wizardState.generatedPrd;
  const totalTasks = prd.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
  const totalSubtasks = prd.phases.reduce((sum, phase) => 
    sum + phase.tasks.reduce((taskSum, task) => taskSum + task.subtasks.length, 0), 0);
  
  if (elements.summaryProjectName) elements.summaryProjectName.textContent = prd.project || 'Untitled Project';
  if (elements.summaryPhases) elements.summaryPhases.textContent = prd.phases.length;
  if (elements.summaryTasks) elements.summaryTasks.textContent = totalTasks;
  if (elements.summarySubtasks) elements.summarySubtasks.textContent = totalSubtasks;
  if (elements.summaryPath) elements.summaryPath.textContent = wizardState.projectPath || '.puppet-master/';
}

// ============================================
// API Functions
// ============================================
function generatePrd() {
  if (!wizardState.parsedRequirements || !elements) return;
  
  if (elements.prdPreview) elements.prdPreview.innerHTML = '<div class="loading-indicator">Generating PRD...</div>';
  if (elements.nextBtn) elements.nextBtn.disabled = true;
  
  fetch('/api/wizard/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parsed: wizardState.parsedRequirements,
      projectPath: wizardState.projectPath,
      projectName: wizardState.parsedRequirements.title || 'Untitled Project',
    }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        if (elements.prdPreview) elements.prdPreview.innerHTML = `<div class="form-error">Error: ${escapeHtml(data.error)}</div>`;
        if (elements.nextBtn) elements.nextBtn.disabled = true;
      } else {
        wizardState.generatedPrd = data.prd;
        wizardState.architecture = data.architecture;
        wizardState.tierPlan = data.tierPlan;
        
        // Advance to step 3
        wizardState.currentStep = 3;
        showStep(3);
        displayPrd();
        validatePrd();
      }
    })
    .catch(error => {
      console.error('[Wizard] Generate error:', error);
      if (elements.prdPreview) elements.prdPreview.innerHTML = `<div class="form-error">Generation failed: ${escapeHtml(error.message)}</div>`;
      if (elements.nextBtn) elements.nextBtn.disabled = true;
    });
}

function validatePrd() {
  if (!wizardState.generatedPrd || !elements) return;
  
  fetch('/api/wizard/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prd: wizardState.generatedPrd,
      architecture: wizardState.architecture,
      tierPlan: wizardState.tierPlan,
      projectPath: wizardState.projectPath,
    }),
  })
    .then(response => response.json())
    .then(data => {
      wizardState.validationResult = data;
      
      // Display errors
      if (data.errors && data.errors.length > 0) {
        if (elements.validationErrorsList) {
          elements.validationErrorsList.innerHTML = data.errors.map(err => 
            `<li>${escapeHtml(err)}</li>`
          ).join('');
        }
        if (elements.validationErrors) elements.validationErrors.style.display = 'block';
      } else {
        if (elements.validationErrors) elements.validationErrors.style.display = 'none';
      }
      
      // Display warnings
      if (data.warnings && data.warnings.length > 0) {
        if (elements.validationWarningsList) {
          elements.validationWarningsList.innerHTML = data.warnings.map(warn => 
            `<li>${escapeHtml(warn)}</li>`
          ).join('');
        }
        if (elements.validationWarnings) elements.validationWarnings.style.display = 'block';
      } else {
        if (elements.validationWarnings) elements.validationWarnings.style.display = 'none';
      }
      
      // Show validation results if there are any
      if ((data.errors && data.errors.length > 0) || (data.warnings && data.warnings.length > 0)) {
        if (elements.validationResults) elements.validationResults.style.display = 'block';
      }
      
      updateButtonStates();
    })
    .catch(error => {
      console.error('[Wizard] Validate error:', error);
      // Don't block on validation errors
    });
}

let fallbackTimeout = null;

function savePrd() {
  if (!wizardState.generatedPrd || !elements) return;
  
  if (elements.finishBtn) elements.finishBtn.disabled = true;
  if (elements.saveError) elements.saveError.style.display = 'none';
  if (elements.saveSuccess) elements.saveSuccess.style.display = 'none';
  
  // Hide progress indicator initially
  const progressContainer = document.getElementById('start-chain-progress');
  if (progressContainer) {
    progressContainer.style.display = 'none';
  }
  
  // Connect to WebSocket for Start Chain progress events
  if (!wizardState.ws || wizardState.ws.readyState !== WebSocket.OPEN) {
    connectWebSocket();
  }
  
  wizardState.startChainInProgress = true;
  
  fetch('/api/wizard/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prd: wizardState.generatedPrd,
      architecture: wizardState.architecture,
      tierPlan: wizardState.tierPlan,
      projectPath: wizardState.projectPath,
    }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        wizardState.startChainInProgress = false;
        if (elements.saveError) showError(elements.saveError, data.error);
        if (elements.finishBtn) elements.finishBtn.disabled = false;
      } else {
        // Check WebSocket connection status
        const wsConnected = wizardState.ws && wizardState.ws.readyState === WebSocket.OPEN;

        if (!wsConnected) {
          console.warn('[Wizard] WebSocket not connected, using fallback mode');
          // Show fallback message to user
          const progressContainer = document.getElementById('start-chain-progress');
          if (progressContainer) {
            progressContainer.style.display = 'block';
            const fallbackMsg = document.createElement('div');
            fallbackMsg.className = 'fallback-message';
            fallbackMsg.style.cssText = 'padding: var(--spacing-sm); margin-top: var(--spacing-sm); border: var(--border-medium) solid var(--electric-blue); background: rgba(0, 71, 171, 0.05); text-align: center;';
            fallbackMsg.textContent = 'Progress updates unavailable. Start Chain is running in background...';
            progressContainer.appendChild(fallbackMsg);
          }
        }

        // Fallback timeout: wait for WebSocket updates, or complete after 30 seconds
        fallbackTimeout = setTimeout(() => {
          if (wizardState.startChainInProgress) {
            wizardState.startChainInProgress = false;
            console.log('[Wizard] Fallback timeout reached, assuming Start Chain completed');
            // Fallback: show success and redirect
            if (elements.saveSuccess) elements.saveSuccess.style.display = 'block';
            openProjectAndRedirect(data.projectPath || wizardState.projectPath);
          }
        }, 30000); // Extended to 30 seconds for more realistic completion time
      }
    })
    .catch(error => {
      wizardState.startChainInProgress = false;
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      console.error('[Wizard] Save error:', error);
      if (elements.saveError) showError(elements.saveError, `Save failed: ${error.message}`);
      if (elements.finishBtn) elements.finishBtn.disabled = false;
    });
}

// ============================================
// Utility Functions
// ============================================
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showError(element, message) {
  if (element) {
    element.textContent = message;
    element.style.display = 'block';
  }
}

// ============================================
// Event Listeners
// ============================================
function setupEventListeners() {
  // Navigation
  if (elements.backBtn) {
    elements.backBtn.addEventListener('click', prevStep);
  }
  if (elements.nextBtn) {
    elements.nextBtn.addEventListener('click', nextStep);
  }
  if (elements.finishBtn) {
    elements.finishBtn.addEventListener('click', savePrd);
  }
  
  // File upload
  if (elements.browseBtn && elements.fileInput) {
    elements.browseBtn.addEventListener('click', () => {
      elements.fileInput.click();
    });
  }
  
  if (elements.fileInput) {
    elements.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        handleFileSelect(file);
      }
    });
  }
  
  // Drag and drop
  if (elements.uploadZone) {
    elements.uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      elements.uploadZone.classList.add('drag-over');
    });
    
    elements.uploadZone.addEventListener('dragleave', () => {
      elements.uploadZone.classList.remove('drag-over');
    });
    
    elements.uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      elements.uploadZone.classList.remove('drag-over');
      
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    });
  }
  
  // Text paste
  if (elements.pasteSubmitBtn) {
    elements.pasteSubmitBtn.addEventListener('click', handleTextPaste);
  }
  
  // Confirm save checkbox
  if (elements.confirmSave) {
    elements.confirmSave.addEventListener('change', () => {
      updateButtonStates();
    });
  }
}

// ============================================
// Initialization
// ============================================
function init() {
  // Initialize elements first
  initElements();

  // Dark mode is handled by navigation.js
  setupEventListeners();
  showStep(1);
  
  // Get project path from URL params if available
  const urlParams = new URLSearchParams(window.location.search);
  const projectPath = urlParams.get('projectPath');
  if (projectPath) {
    wizardState.projectPath = projectPath;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
