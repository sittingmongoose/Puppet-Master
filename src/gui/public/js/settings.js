/**
 * Settings JavaScript - Vibrant Technical Design
 * 
 * Handles settings loading, editing, validation, and saving
 * Reuses /api/config endpoints for persistence
 */

// ============================================
// State Management
// ============================================
const state = {
  config: null,
  originalConfig: null,
  hasUnsavedChanges: false,
  currentTab: 'execution',
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
    console.error('[Settings] Error loading config:', error);
    showError(`[ERROR] Failed to load configuration: ${error.message}`);
  }
}

async function saveConfig() {
  const config = collectFormData();
  if (!config) {
    return;
  }

  const saveBtn = document.getElementById('save-btn');
  const errorDiv = document.getElementById('settings-error');
  const successDiv = document.getElementById('settings-success');

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
      throw new Error(data.errors?.join(', ') || 'Failed to save settings');
    }

    // Update state
    state.config = config;
    state.originalConfig = JSON.parse(JSON.stringify(config));
    state.hasUnsavedChanges = false;
    updateUnsavedChangesIndicator();

    if (successDiv) {
      successDiv.style.display = 'block';
      successDiv.textContent = '[SUCCESS] Settings saved successfully';
      setTimeout(() => {
        if (successDiv) {
          successDiv.style.display = 'none';
        }
      }, 3000);
    }
  } catch (error) {
    console.error('[Settings] Error saving config:', error);
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
  const errorDiv = document.getElementById('settings-error');
  const successDiv = document.getElementById('settings-success');

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
        successDiv.textContent = '[VALID] Settings are valid';
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
    console.error('[Settings] Error validating config:', error);
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
  const form = document.getElementById('settings-form');
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
      
      // Handle empty strings for optional platform/model fields in startChain
      // Empty string means "use tier default", so we should omit the field (undefined)
      if (value === '' && (
        name.includes('startChain') && (
          name.includes('.platform') || name.includes('.model')
        )
      )) {
        // Skip this field - don't set it (will be undefined)
        continue;
      }
      
      // Handle empty strings for optional number fields - convert to undefined
      if (value === '' && name.includes('maxRepairPasses')) {
        processedValue = undefined;
      }
      if (value === '' && name.includes('minCoverageRatio')) {
        processedValue = undefined;
      }
      if (value === '' && name.includes('confidenceThreshold')) {
        processedValue = undefined;
      }
      if (value === '' && name.includes('maxReviewerIterations')) {
        processedValue = undefined;
      }
      if (value === '' && name.includes('callsPerMinute') || value === '' && name.includes('cooldownMs')) {
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

  // Clean up empty optional structures
  // Remove startChain fields that are empty strings (use tier default)
  if (config.startChain) {
    ['inventory', 'requirementsInterview', 'prd', 'architecture'].forEach(step => {
      if (config.startChain[step]) {
        if (config.startChain[step].platform === '') {
          delete config.startChain[step].platform;
        }
        if (config.startChain[step].model === '') {
          delete config.startChain[step].model;
        }
        // Remove step object if it's now empty
        if (Object.keys(config.startChain[step]).length === 0) {
          delete config.startChain[step];
        }
      }
    });
    
    // Clean up gapFill and multiPass
    if (config.startChain.gapFill && config.startChain.gapFill.maxRepairPasses === undefined) {
      delete config.startChain.gapFill.maxRepairPasses;
      if (Object.keys(config.startChain.gapFill).length === 0) {
        delete config.startChain.gapFill;
      }
    }
    if (config.startChain.multiPass && config.startChain.multiPass.maxRepairPasses === undefined) {
      delete config.startChain.multiPass.maxRepairPasses;
      if (Object.keys(config.startChain.multiPass).length === 0) {
        delete config.startChain.multiPass;
      }
    }
    
    // Clean up coverage
    if (config.startChain.coverage && config.startChain.coverage.minCoverageRatio === undefined) {
      delete config.startChain.coverage.minCoverageRatio;
      if (Object.keys(config.startChain.coverage).length === 0) {
        delete config.startChain.coverage;
      }
    }
    
    // Remove startChain if it's now empty
    if (Object.keys(config.startChain).length === 0) {
      delete config.startChain;
    }
  }

  // Clean up rateLimits - remove undefined values
  if (config.rateLimits) {
    ['cursor', 'codex', 'claude', 'gemini', 'copilot'].forEach(platform => {
      if (config.rateLimits[platform]) {
        if (config.rateLimits[platform].callsPerMinute === undefined) {
          delete config.rateLimits[platform].callsPerMinute;
        }
        if (config.rateLimits[platform].cooldownMs === undefined) {
          delete config.rateLimits[platform].cooldownMs;
        }
        // Remove platform object if it's now empty
        if (Object.keys(config.rateLimits[platform]).length === 0) {
          delete config.rateLimits[platform];
        }
      }
    });
    // Remove rateLimits if it's now empty
    if (Object.keys(config.rateLimits).length === 0) {
      delete config.rateLimits;
    }
  }

  // Clean up tiers.reviewer
  if (config.tiers && config.tiers.reviewer) {
    if (config.tiers.reviewer.confidenceThreshold === undefined) {
      delete config.tiers.reviewer.confidenceThreshold;
    }
    if (config.tiers.reviewer.maxReviewerIterations === undefined) {
      delete config.tiers.reviewer.maxReviewerIterations;
    }
    if (config.tiers.reviewer.platform === '') {
      delete config.tiers.reviewer.platform;
    }
    if (config.tiers.reviewer.model === '') {
      delete config.tiers.reviewer.model;
    }
    // Remove reviewer if it's now empty
    if (Object.keys(config.tiers.reviewer).length === 0) {
      delete config.tiers.reviewer;
    }
  }

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
  const form = document.getElementById('settings-form');
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
        if (value === null || value === undefined || value === '') {
          input.value = '';
        } else {
          input.value = value;
        }
      } else {
        // For text inputs
        if (value === null || value === undefined) {
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
  const form = document.getElementById('settings-form');
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
  const errorDiv = document.getElementById('settings-error');
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
  const form = document.getElementById('settings-form');
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
