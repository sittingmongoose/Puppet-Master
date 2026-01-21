/**
 * Evidence Viewer JavaScript - Vibrant Technical Design
 * 
 * Handles evidence loading, filtering, preview, and download functionality
 */

import { createSkeletonTableRow, removeSkeletons } from './skeletons.js';

// ============================================
// State Management
// ============================================
const state = {
  artifacts: [],
  filteredArtifacts: [],
  currentSort: { column: 'createdAt', direction: 'desc' },
  selectedArtifact: null,
};

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Dark mode is handled by navigation.js
  setupEventListeners();
  loadTierSelector();
  loadEvidence({});
});

// ============================================
// Event Listeners
// ============================================
function setupEventListeners() {
  // Filter controls
  const applyBtn = document.getElementById('apply-filters-btn');
  if (applyBtn) {
    applyBtn.addEventListener('click', applyFilters);
  }

  const clearBtn = document.getElementById('clear-filters-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearFilters);
  }

  // Refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadEvidence({});
    });
  }

  // Close preview button
  const closePreviewBtn = document.getElementById('close-preview-btn');
  if (closePreviewBtn) {
    closePreviewBtn.addEventListener('click', () => {
      closePreview();
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

  // Enter key on filter inputs (date inputs only - tier is now a dropdown)
  const filterInputs = document.querySelectorAll('#filter-date-from, #filter-date-to');
  filterInputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        applyFilters();
      }
    });
  });

  // Auto-apply filter when tier selector changes
  const tierIdSelect = document.getElementById('filter-tier-id');
  if (tierIdSelect) {
    tierIdSelect.addEventListener('change', applyFilters);
  }
}

// ============================================
// API Calls
// ============================================
async function loadEvidence(filters) {
  try {
    const tbody = document.getElementById('evidence-table-body');
    if (tbody) {
      // Show skeleton rows during loading
      tbody.innerHTML = '';
      tbody.setAttribute('aria-busy', 'true');
      
      // Create 6 skeleton rows (evidence table has 6 columns: Name, Type, Tier ID, Created, Size, Actions)
      const widths = ['long', 'short', 'medium', 'medium', 'short', 'short'];
      for (let i = 0; i < 6; i++) {
        const skeletonRow = createSkeletonTableRow(6, widths);
        tbody.appendChild(skeletonRow);
      }
    }

    // Build query string
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.tierId) params.append('tierId', filters.tierId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    const queryString = params.toString();
    const url = `/api/evidence${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load evidence: ${response.statusText}`);
    }

    const data = await response.json();
    state.artifacts = data.artifacts || [];
    state.filteredArtifacts = [...state.artifacts];

    // Apply current sort
    applySort();

    renderTable();
    updateCount();
    
    if (tbody) {
      tbody.removeAttribute('aria-busy');
    }
  } catch (error) {
    console.error('[Evidence] Error loading evidence:', error);
    showError(`[ERROR] Failed to load evidence: ${error.message}`);
    const tbody = document.getElementById('evidence-table-body');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="error-message">[ERROR] ${error.message}</td></tr>`;
      tbody.removeAttribute('aria-busy');
    }
  }
}

// ============================================
// Tier Selector
// ============================================
/**
 * Load tiers from API and populate dropdown selector.
 */
async function loadTierSelector() {
  try {
    const response = await fetch('/api/tiers');
    if (!response.ok) {
      // If tiers not available (no project loaded), leave dropdown with just "All Tiers"
      return;
    }

    const data = await response.json();
    if (data.tiers && data.tiers.length > 0) {
      populateTierSelector(data.tiers);
    }
  } catch (error) {
    console.error('[Evidence] Error loading tier selector:', error);
    // Silently fail - dropdown will just have "All Tiers" option
  }
}

/**
 * Recursively populate tier selector dropdown with indented hierarchy.
 * @param {Array} tiers - Array of tier objects with id, title, type, children
 * @param {number} indent - Current indentation level (0 = phase, 1 = task, 2 = subtask)
 */
function populateTierSelector(tiers, indent = 0) {
  const select = document.getElementById('filter-tier-id');
  if (!select) return;

  tiers.forEach(tier => {
    // Create option element
    const option = document.createElement('option');
    option.value = tier.id;
    
    // Build indented text: 2 spaces per level
    const indentSpaces = '  '.repeat(indent);
    option.textContent = `${indentSpaces}${tier.id} - ${tier.title || ''}`;
    
    select.appendChild(option);

    // Recursively add children
    if (tier.children && tier.children.length > 0) {
      populateTierSelector(tier.children, indent + 1);
    }
  });
}

// ============================================
// Filtering
// ============================================
function applyFilters() {
  const typeEl = document.getElementById('filter-type');
  const tierIdEl = document.getElementById('filter-tier-id');
  const dateFromEl = document.getElementById('filter-date-from');
  const dateToEl = document.getElementById('filter-date-to');
  
  const filters = {
    type: typeEl?.value || '',
    tierId: tierIdEl?.value || '', // Select dropdown doesn't need trim()
    dateFrom: dateFromEl?.value || '',
    dateTo: dateToEl?.value || '',
  };

  loadEvidence(filters);
}

function clearFilters() {
    const typeSelect = document.getElementById('filter-type');
    const tierIdSelect = document.getElementById('filter-tier-id');
    const dateFromInput = document.getElementById('filter-date-from');
    const dateToInput = document.getElementById('filter-date-to');

  if (typeSelect) typeSelect.value = '';
  if (tierIdSelect) tierIdSelect.value = ''; // Reset to "All Tiers"
  if (dateFromInput) dateFromInput.value = '';
  if (dateToInput) dateToInput.value = '';

  loadEvidence({});
}

// ============================================
// Table Rendering
// ============================================
function renderTable() {
  const tbody = document.getElementById('evidence-table-body');
  if (!tbody) return;

  // Remove any skeletons before rendering
  removeSkeletons(tbody);

  if (state.filteredArtifacts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No evidence found</td></tr>';
    return;
  }

  tbody.innerHTML = state.filteredArtifacts.map(artifact => {
    const size = formatFileSize(artifact.size);
    const date = formatDate(artifact.createdAt);
    const typeLabel = formatTypeLabel(artifact.type);

    return `
      <tr data-artifact-name="${escapeHtml(artifact.name)}" data-artifact-type="${escapeHtml(artifact.type)}">
        <td>${escapeHtml(artifact.name)}</td>
        <td>${typeLabel}</td>
        <td class="monospace">${escapeHtml(artifact.tierId)}</td>
        <td>${size}</td>
        <td>${date}</td>
        <td class="actions-cell">
          <button class="icon-btn preview-btn" data-name="${escapeHtml(artifact.name)}" data-type="${escapeHtml(artifact.type)}" aria-label="Preview ${escapeHtml(artifact.name)}">PREVIEW</button>
          <button class="icon-btn download-btn" data-name="${escapeHtml(artifact.name)}" data-type="${escapeHtml(artifact.type)}" aria-label="Download ${escapeHtml(artifact.name)}">DOWNLOAD</button>
        </td>
      </tr>
    `;
  }).join('');

  // Attach event listeners to action buttons
  tbody.querySelectorAll('.preview-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target;
      const name = target.getAttribute('data-name');
      const type = target.getAttribute('data-type');
      if (name && type) {
        previewFile({ name, type });
      }
    });
  });

  tbody.querySelectorAll('.download-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target;
      const name = target.getAttribute('data-name');
      const type = target.getAttribute('data-type');
      if (name && type) {
        downloadFile({ name, type });
      }
    });
  });
}

function updateCount() {
  const countEl = document.getElementById('evidence-count');
  if (countEl) {
    const count = state.filteredArtifacts.length;
    countEl.textContent = `${count} artifact${count !== 1 ? 's' : ''}`;
  }
}

// ============================================
// Sorting
// ============================================
function sortTable(column) {
  if (state.currentSort.column === column) {
    // Toggle direction
    state.currentSort.direction = state.currentSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    state.currentSort.column = column;
    state.currentSort.direction = 'asc';
  }

  applySort();
  updateSortIndicators();
  renderTable();
}

function applySort() {
  state.filteredArtifacts.sort((a, b) => {
    let aVal = a[state.currentSort.column];
    let bVal = b[state.currentSort.column];

    // Handle special cases
    if (state.currentSort.column === 'size') {
      aVal = a.size;
      bVal = b.size;
    } else if (state.currentSort.column === 'createdAt') {
      aVal = new Date(a.createdAt).getTime();
      bVal = new Date(b.createdAt).getTime();
    }

    // Compare
    if (aVal < bVal) return state.currentSort.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return state.currentSort.direction === 'asc' ? 1 : -1;
    return 0;
  });
}

function updateSortIndicators() {
  const headers = document.querySelectorAll('.sortable');
  headers.forEach(header => {
    const indicator = header.querySelector('.sort-indicator');
    const column = header.getAttribute('data-sort');
    
    if (indicator) {
      if (column === state.currentSort.column) {
        indicator.textContent = state.currentSort.direction === 'asc' ? ' ↑' : ' ↓';
      } else {
        indicator.textContent = '';
      }
    }
  });
}

// ============================================
// Preview
// ============================================
async function previewFile(artifact) {
  try {
    const previewContent = document.getElementById('preview-content');
    const previewPanel = document.getElementById('preview-panel');
    
    if (!previewContent || !previewPanel) return;

    // Show loading
    previewContent.innerHTML = '<p class="loading-message">Loading preview...</p>';
    previewPanel.style.display = 'block';

    // Fetch file
    const url = `/api/evidence/${encodeURIComponent(artifact.type)}/${encodeURIComponent(artifact.name)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to load file: ${response.statusText}`);
    }

    const ext = artifact.name.split('.').pop()?.toLowerCase() || '';
    const contentType = response.headers.get('content-type') || '';

    // Render based on file type
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext) || contentType.startsWith('image/')) {
      // Image preview
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      previewContent.innerHTML = `
        <div class="preview-image-container">
          <img src="${imageUrl}" alt="${escapeHtml(artifact.name)}" class="preview-image" />
          <p class="preview-filename">${escapeHtml(artifact.name)}</p>
        </div>
      `;
    } else if (ext === 'json' || contentType.includes('json')) {
      // JSON preview
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        const prettyJson = JSON.stringify(json, null, 2);
        previewContent.innerHTML = `
          <div class="preview-header">
            <h3>${escapeHtml(artifact.name)}</h3>
            <button class="icon-btn" onclick="copyToClipboard(\`${escapeHtml(prettyJson.replace(/`/g, '\\`'))}\`)">COPY</button>
          </div>
          <pre class="preview-code"><code>${escapeHtml(prettyJson)}</code></pre>
        `;
      } catch {
        // Not valid JSON, show as text
        previewContent.innerHTML = `
          <div class="preview-header">
            <h3>${escapeHtml(artifact.name)}</h3>
          </div>
          <pre class="preview-code"><code>${escapeHtml(text)}</code></pre>
        `;
      }
    } else if (['log', 'txt', 'snapshot'].includes(ext) || contentType.includes('text/plain')) {
      // Text preview
      const text = await response.text();
      previewContent.innerHTML = `
        <div class="preview-header">
          <h3>${escapeHtml(artifact.name)}</h3>
          <button class="icon-btn" onclick="copyToClipboard(\`${escapeHtml(text.replace(/`/g, '\\`'))}\`)">COPY</button>
        </div>
        <pre class="preview-code"><code>${escapeHtml(text)}</code></pre>
      `;
    } else {
      // Unsupported type
      previewContent.innerHTML = `
        <div class="preview-unsupported">
          <p>[INFO] Preview not available for this file type.</p>
          <p>Use the download button to save the file.</p>
          <button class="control-btn" onclick="downloadFile({ name: '${escapeHtml(artifact.name)}', type: '${escapeHtml(artifact.type)}' })">DOWNLOAD</button>
        </div>
      `;
    }

    state.selectedArtifact = artifact;
  } catch (error) {
    console.error('[Evidence] Error previewing file:', error);
    const previewContent = document.getElementById('preview-content');
    if (previewContent) {
      previewContent.innerHTML = `<p class="error-message">[ERROR] Failed to preview file: ${error.message}</p>`;
    }
  }
}

function closePreview() {
  const previewPanel = document.getElementById('preview-panel');
  if (previewPanel) {
    previewPanel.style.display = 'none';
  }
  state.selectedArtifact = null;
}

// ============================================
// Download
// ============================================
function downloadFile(artifact) {
  const url = `/api/evidence/${encodeURIComponent(artifact.type)}/${encodeURIComponent(artifact.name)}`;
  const link = document.createElement('a');
  link.href = url;
  link.download = artifact.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================
// Utility Functions
// ============================================
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString();
}

function formatTypeLabel(type) {
  const labels = {
    'log': 'Log',
    'screenshot': 'Screenshot',
    'trace': 'Trace',
    'snapshot': 'Snapshot',
    'metric': 'Metric',
    'gate-report': 'Gate Report',
  };
  return labels[type] || type;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showError(message) {
  console.error('[Evidence]', message);
  // Could show a toast notification here
}

// Copy to clipboard helper (global for onclick handlers)
window.copyToClipboard = async function(text) {
  try {
    await navigator.clipboard.writeText(text);
    // Could show a success message here
  } catch (error) {
    console.error('[Evidence] Failed to copy to clipboard:', error);
  }
};
