/**
 * Configuration JavaScript - Vibrant Technical Design
 * 
 * Handles configuration loading, editing, validation, and saving
 */

// ============================================
// State Management
// ============================================
const state = {
  config: null,
  originalConfig: null,
  hasUnsavedChanges: false,
  currentTab: 'tiers',
};

// ============================================
// API Calls
// ============================================
async function loadConfig() {
  try {
    const response = await fetch('/api/config');
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.statusText}`);
    }

    const data = await response.json();
    state.config = data.config;
    state.originalConfig = JSON.parse(JSON.stringify(data.config)); // Deep copy
    state.hasUnsavedChanges = false;

    populateForm(state.config);
    updateUnsavedChangesIndicator();
  } catch (error) {
    console.error('[Config] Error loading config:', error);
    showError(`[ERROR] Failed to load configuration: ${error.message}`);
  }
}

async function saveConfig() {
  const config = collectFormData();
  if (!config) {
    return;
  }

  const saveBtn = document.getElementById('save-btn');
  const errorDiv = document.getElementById('config-error');
  const successDiv = document.getElementById('config-success');

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'SAVING...';
  }

  if (errorDiv) {
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
  }
  if (successDiv) {
    successDiv.style.display = 'none';
    successDiv.textContent = '';
  }

  try {
    const response = await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.errors?.join(', ') || 'Failed to save configuration');
    }

    // Update state
    state.config = config;
    state.originalConfig = JSON.parse(JSON.stringify(config));
    state.hasUnsavedChanges = false;
    updateUnsavedChangesIndicator();

    if (successDiv) {
      successDiv.style.display = 'block';
      successDiv.textContent = '[SUCCESS] Configuration saved successfully';
      setTimeout(() => {
        if (successDiv) {
          successDiv.style.display = 'none';
        }
      }, 3000);
    }
  } catch (error) {
    console.error('[Config] Error saving config:', error);
    showError(`[ERROR] ${error.message}`);
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'SAVE';
    }
  }
}

async function validateConfig() {
  const config = collectFormData();
  if (!config) {
    return;
  }

  const validateBtn = document.getElementById('validate-btn');
  const errorDiv = document.getElementById('config-error');
  const successDiv = document.getElementById('config-success');

  if (validateBtn) {
    validateBtn.disabled = true;
    validateBtn.textContent = 'VALIDATING...';
  }

  if (errorDiv) {
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
  }
  if (successDiv) {
    successDiv.style.display = 'none';
    successDiv.textContent = '';
  }

  try {
    const response = await fetch('/api/config/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config }),
    });

    const data = await response.json();

    if (data.valid) {
      if (successDiv) {
        successDiv.style.display = 'block';
        successDiv.textContent = '[VALID] Configuration is valid';
        setTimeout(() => {
          if (successDiv) {
            successDiv.style.display = 'none';
          }
        }, 3000);
      }
    } else {
      showError(`[INVALID] ${data.errors?.join(', ') || 'Validation failed'}`);
    }
  } catch (error) {
    console.error('[Config] Error validating config:', error);
    showError(`[ERROR] Validation failed: ${error.message}`);
  } finally {
    if (validateBtn) {
      validateBtn.disabled = false;
      validateBtn.textContent = 'VALIDATE';
    }
  }
}

// ============================================
// Form Data Collection
// ============================================
function collectFormData() {
  const form = document.getElementById('config-form');
  if (!form) return null;

  const formData = new FormData(form);
  const config = {};

  // Helper to set nested value
  function setNestedValue(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }

  // Process all form fields
  for (const [name, value] of formData.entries()) {
    if (name.includes('.')) {
      // Handle nested fields
      let processedValue = value;
      
      // Convert string numbers to numbers
      if (value && !isNaN(value) && value.trim() !== '') {
        processedValue = Number(value);
      }
      
      // Handle "unlimited" strings for budget fields
      if (value === 'unlimited' || value === '') {
        processedValue = 'unlimited';
      }
      
      // Handle null/empty strings for optional fields
      if (value === '' && name.includes('escalation') || name.includes('fallbackPlatform')) {
        processedValue = null;
      } else if (value === '' && name.includes('cooldownHours')) {
        processedValue = undefined;
      }
      
      setNestedValue(config, name, processedValue);
    } else {
      config[name] = value;
    }
  }

  // Handle checkboxes (they don't appear in FormData if unchecked)
  const checkboxes = form.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    const name = checkbox.name;
    if (name.includes('.')) {
      setNestedValue(config, name, checkbox.checked);
    } else {
      config[name] = checkbox.checked;
    }
  });

  // Ensure all required nested structures exist
  if (!config.tiers) config.tiers = {};
  if (!config.tiers.phase) config.tiers.phase = {};
  if (!config.tiers.task) config.tiers.task = {};
  if (!config.tiers.subtask) config.tiers.subtask = {};
  if (!config.tiers.iteration) config.tiers.iteration = {};
  if (!config.budgets) config.budgets = {};
  if (!config.budgets.claude) config.budgets.claude = {};
  if (!config.budgets.codex) config.budgets.codex = {};
  if (!config.budgets.cursor) config.budgets.cursor = {};
  if (!config.memory) config.memory = {};
  if (!config.memory.agentsEnforcement) config.memory.agentsEnforcement = {};
  if (!config.execution) config.execution = {};

  // Convert escalation empty strings to null
  if (config.tiers?.phase?.escalation === '') config.tiers.phase.escalation = null;
  if (config.tiers?.task?.escalation === '') config.tiers.task.escalation = null;
  if (config.tiers?.subtask?.escalation === '') config.tiers.subtask.escalation = null;
  if (config.tiers?.iteration?.escalation === '') config.tiers.iteration.escalation = null;

  // P1-G14: Convert fallback platform empty strings to null for all platforms
  const allPlatforms = ['claude', 'codex', 'cursor', 'gemini', 'copilot'];
  allPlatforms.forEach(platform => {
    if (config.budgets?.[platform]?.fallbackPlatform === '') {
      config.budgets[platform].fallbackPlatform = null;
    }
  });

  // P1-G14: Handle budget unlimited values for all platforms (including Gemini/Copilot)
  allPlatforms.forEach(platform => {
    if (!config.budgets?.[platform]) return;
    ['maxCallsPerRun', 'maxCallsPerHour', 'maxCallsPerDay'].forEach(field => {
      const value = config.budgets[platform][field];
      if (value === 'unlimited' || value === '') {
        config.budgets[platform][field] = 'unlimited';
      } else if (value && !isNaN(value)) {
        config.budgets[platform][field] = Number(value);
      }
    });
  });

  return config;
}

// ============================================
// Form Population
// ============================================
function populateForm(config) {
  if (!config) return;

  // Helper to get nested value
  function getNestedValue(obj, path) {
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current === null || current === undefined) {
        return null;
      }
      current = current[part];
    }
    return current;
  }

  // Populate all form fields
  const form = document.getElementById('config-form');
  if (!form) return;

  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const name = input.name;
    if (!name) return;

    const value = getNestedValue(config, name);
    
    if (input.type === 'checkbox') {
      input.checked = value === true;
    } else if (input.type === 'number') {
      input.value = value !== null && value !== undefined ? value : '';
    } else {
      // Handle select elements
      if (input.tagName === 'SELECT') {
        // For select with null/empty option
        if (value === null || value === '') {
          input.value = '';
        } else {
          input.value = value;
        }
      } else {
        // For text inputs
        if (value === 'unlimited') {
          input.value = 'unlimited';
        } else if (value === null || value === undefined) {
          input.value = '';
        } else {
          input.value = value;
        }
      }
    }
  });
}

// ============================================
// Tab Navigation
// ============================================
function initTabs() {
  const tabs = document.querySelectorAll('.config-tab');
  const tabContents = document.querySelectorAll('.config-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update active content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${targetTab}-tab`) {
          content.classList.add('active');
        }
      });

      state.currentTab = targetTab;
    });
  });
}

// ============================================
// Change Tracking
// ============================================
function initChangeTracking() {
  const form = document.getElementById('config-form');
  if (!form) return;

  form.addEventListener('input', () => {
    checkForChanges();
  });

  form.addEventListener('change', () => {
    checkForChanges();
  });
}

function checkForChanges() {
  const currentConfig = collectFormData();
  if (!currentConfig || !state.originalConfig) {
    state.hasUnsavedChanges = false;
    updateUnsavedChangesIndicator();
    return;
  }

  const currentJson = JSON.stringify(currentConfig);
  const originalJson = JSON.stringify(state.originalConfig);
  state.hasUnsavedChanges = currentJson !== originalJson;
  updateUnsavedChangesIndicator();
}

function updateUnsavedChangesIndicator() {
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    if (state.hasUnsavedChanges) {
      saveBtn.classList.add('has-changes');
      saveBtn.textContent = 'SAVE (UNSAVED CHANGES)';
    } else {
      saveBtn.classList.remove('has-changes');
      saveBtn.textContent = 'SAVE';
    }
  }
}

// ============================================
// Error/Success Display
// ============================================
function showError(message) {
  const errorDiv = document.getElementById('config-error');
  if (errorDiv) {
    errorDiv.style.display = 'block';
    errorDiv.textContent = message;
  }
}

// ============================================
// Event Listeners
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize tabs
  initTabs();

  // Initialize change tracking
  initChangeTracking();

  // Dark mode is handled by navigation.js

  // Form submission
  const form = document.getElementById('config-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveConfig();
    });
  }

  // Validate button
  const validateBtn = document.getElementById('validate-btn');
  if (validateBtn) {
    validateBtn.addEventListener('click', async () => {
      await validateConfig();
    });
  }

  // Load config on page load
  loadConfig();
});
