/**
 * Coverage Report Viewer JavaScript - Vibrant Technical Design
 * 
 * Handles coverage report loading, visualization, and interaction
 */

import { removeSkeletons } from './skeletons.js';

// ============================================
// State Management
// ============================================
const state = {
  coverage: null,
  filteredSections: 'all', // 'all', 'covered', 'uncovered'
  expandedSections: new Set(),
  expandedTreeNodes: new Set(),
};

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadCoverage();
});

// ============================================
// Event Listeners
// ============================================
function setupEventListeners() {
  // Refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadCoverage();
    });
  }

  // Filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      if (filter) {
        setFilter(filter);
      }
    });
  });
}

// ============================================
// API Calls
// ============================================
async function loadCoverage() {
  try {
    const sectionsList = document.getElementById('sections-list');
    const mappingTree = document.getElementById('mapping-tree');
    
    // Show loading state
    if (sectionsList) {
      sectionsList.innerHTML = '<div class="loading-message">Loading coverage report...</div>';
    }
    if (mappingTree) {
      mappingTree.innerHTML = '<div class="loading-message">Loading mapping...</div>';
    }

    // Get project path from URL params if available
    const urlParams = new URLSearchParams(window.location.search);
    const projectPath = urlParams.get('projectPath');

    // Build API URL
    let apiUrl = '/api/coverage/data';
    if (projectPath) {
      apiUrl += `?projectPath=${encodeURIComponent(projectPath)}`;
    }

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      if (response.status === 404) {
        showError('Coverage report not found. Run Start Chain to generate a coverage report.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(errorData.error || 'Failed to load coverage report');
      }
      return;
    }

    const data = await response.json();
    state.coverage = data.coverage;

    if (!state.coverage) {
      showError('Invalid coverage report data');
      return;
    }

    // Render all components
    renderCoverageGauge();
    renderSectionsList();
    renderMappingTree();
    renderMissingRequirements();
    renderValidationStatus();
  } catch (error) {
    console.error('Error loading coverage:', error);
    showError(`Failed to load coverage report: ${error.message}`);
  }
}

// ============================================
// Rendering Functions
// ============================================
function renderCoverageGauge() {
  if (!state.coverage) return;

  const coverageRatio = state.coverage.coverageRatio || 0;
  const percentage = Math.round(coverageRatio * 100);
  
  // Update percentage text
  const percentageEl = document.getElementById('coverage-percentage');
  if (percentageEl) {
    percentageEl.textContent = `${percentage}%`;
  }

  // Update gauge progress
  const progressEl = document.querySelector('.coverage-gauge-progress');
  if (progressEl) {
    const circumference = 2 * Math.PI * 85; // radius = 85
    const offset = circumference - (coverageRatio * circumference);
    progressEl.style.strokeDashoffset = offset.toString();

    // Set color based on coverage
    progressEl.classList.remove('low', 'medium', 'high');
    if (percentage < 50) {
      progressEl.classList.add('low');
    } else if (percentage < 80) {
      progressEl.classList.add('medium');
    } else {
      progressEl.classList.add('high');
    }
  }

  // Update stats
  const sectionsCoveredEl = document.getElementById('sections-covered');
  const sectionsTotalEl = document.getElementById('sections-total');
  const missingCountEl = document.getElementById('missing-count');
  const phasesCountEl = document.getElementById('phases-count');

  if (sectionsCoveredEl) {
    sectionsCoveredEl.textContent = state.coverage.coveredRequirementSections || 0;
  }
  if (sectionsTotalEl) {
    sectionsTotalEl.textContent = `/ ${state.coverage.totalRequirementSections || 0}`;
  }
  if (missingCountEl) {
    missingCountEl.textContent = state.coverage.missingRequirements?.length || 0;
  }
  if (phasesCountEl) {
    phasesCountEl.textContent = state.coverage.phasesCount || 0;
  }
}

function renderSectionsList() {
  const sectionsList = document.getElementById('sections-list');
  if (!sectionsList || !state.coverage) return;

  removeSkeletons(sectionsList);

  // For now, we'll create a simplified sections list
  // In a full implementation, we'd need to load the parsed requirements to get section details
  const coveredSections = state.coverage.coveredRequirementSections || 0;

  // Create section items based on coverage data
  // Since we don't have individual section details in the coverage report,
  // we'll show a summary and the missing requirements as uncovered sections
  const sections = [];

  // Add covered sections (simplified - in real implementation would come from parsed requirements)
  for (let i = 0; i < coveredSections; i++) {
    sections.push({
      path: `Section ${i + 1}`,
      covered: true,
      prdItems: [], // Would be populated from traceability
    });
  }

  // Add uncovered sections from missing requirements
  if (state.coverage.missingRequirements) {
    state.coverage.missingRequirements.forEach((missing, idx) => {
      sections.push({
        path: missing.sectionPath || `Missing Section ${idx + 1}`,
        covered: false,
        excerpt: missing.excerpt,
        requirementId: missing.requirementId,
      });
    });
  }

  // Filter sections based on current filter
  const filteredSections = sections.filter(section => {
    if (state.filteredSections === 'all') return true;
    if (state.filteredSections === 'covered') return section.covered;
    if (state.filteredSections === 'uncovered') return !section.covered;
    return true;
  });

  if (filteredSections.length === 0) {
    sectionsList.innerHTML = '<div class="empty-message">No sections found</div>';
    return;
  }

  sectionsList.innerHTML = filteredSections.map((section, idx) => {
    const isExpanded = state.expandedSections.has(idx);
    const statusClass = section.covered ? 'covered' : 'uncovered';
    const statusText = section.covered ? 'COVERED' : 'UNCOVERED';

    return `
      <div class="section-item ${statusClass} ${isExpanded ? 'expanded' : ''}" data-section-index="${idx}">
        <div class="section-header">
          <span class="section-path">${escapeHtml(section.path)}</span>
          <span class="section-status ${statusClass}">${statusText}</span>
          <svg class="section-expand-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 5l6 5-6 5"/>
          </svg>
        </div>
        ${section.excerpt || section.prdItems?.length > 0 ? `
          <div class="section-details">
            ${section.excerpt ? `
              <div class="section-excerpt">
                <strong>Excerpt:</strong> ${escapeHtml(section.excerpt)}
              </div>
            ` : ''}
            ${section.prdItems && section.prdItems.length > 0 ? `
              <div class="section-prd-items">
                <strong>Covered by PRD items:</strong>
                ${section.prdItems.map(item => `
                  <div class="section-prd-item">${escapeHtml(item)}</div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  // Attach click handlers
  sectionsList.querySelectorAll('.section-item').forEach(item => {
    item.addEventListener('click', (e) => {
      // Don't toggle if clicking on status badge
      if (e.target.closest('.section-status')) return;
      
      const idx = parseInt(item.getAttribute('data-section-index') || '0');
      if (state.expandedSections.has(idx)) {
        state.expandedSections.delete(idx);
      } else {
        state.expandedSections.add(idx);
      }
      renderSectionsList();
    });
  });
}

function renderMappingTree() {
  const mappingTree = document.getElementById('mapping-tree');
  if (!mappingTree || !state.coverage) return;

  removeSkeletons(mappingTree);

  // For requirement → PRD mapping, we'd need to load the PRD
  // For now, show a simplified tree based on what we have in the coverage report
  // In a full implementation, this would load PRD and show traceability links

  const treeHTML = `
    <div class="tree-node expanded" data-node-id="requirements">
      <div class="tree-node-header">
        <svg class="tree-expand-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 4l4 4-4 4"/>
        </svg>
        <span class="tree-node-label">Requirements Sections</span>
      </div>
      <div class="tree-node-children">
        <div class="tree-child-node">
          Total Sections: ${state.coverage.totalRequirementSections || 0}
        </div>
        <div class="tree-child-node">
          Covered: ${state.coverage.coveredRequirementSections || 0}
        </div>
        <div class="tree-child-node">
          Uncovered: ${(state.coverage.totalRequirementSections || 0) - (state.coverage.coveredRequirementSections || 0)}
        </div>
        ${state.coverage.phasesCount ? `
          <div class="tree-child-node">
            PRD Phases: ${state.coverage.phasesCount}
          </div>
        ` : ''}
        <div class="tree-child-node" style="margin-top: var(--spacing-sm); padding-top: var(--spacing-sm); border-top: var(--border-thin) solid var(--ink-black);">
          <em>Full traceability mapping requires PRD data. Load PRD to see detailed requirement → PRD item mappings.</em>
        </div>
      </div>
    </div>
  `;

  mappingTree.innerHTML = treeHTML;

  // Attach click handlers for tree expansion
  mappingTree.querySelectorAll('.tree-node-header').forEach(header => {
    header.addEventListener('click', () => {
      const node = header.closest('.tree-node');
      if (node) {
        const nodeId = node.getAttribute('data-node-id');
        if (state.expandedTreeNodes.has(nodeId)) {
          state.expandedTreeNodes.delete(nodeId);
          node.classList.remove('expanded');
        } else {
          state.expandedTreeNodes.add(nodeId);
          node.classList.add('expanded');
        }
      }
    });
  });
}

function renderMissingRequirements() {
  const missingPanel = document.getElementById('missing-requirements-panel');
  const missingList = document.getElementById('missing-requirements-list');
  
  if (!missingPanel || !missingList || !state.coverage) return;

  const missing = state.coverage.missingRequirements || [];
  
  if (missing.length === 0) {
    missingPanel.style.display = 'none';
    return;
  }

  missingPanel.style.display = 'block';
  missingList.innerHTML = missing.map(req => {
    const severity = req.severity || 'medium';
    return `
      <div class="missing-requirement-item">
        <div class="missing-requirement-header">
          ${req.requirementId ? `
            <span class="missing-requirement-id">${escapeHtml(req.requirementId)}</span>
          ` : ''}
          <span class="missing-requirement-severity ${severity}">${severity.toUpperCase()}</span>
        </div>
        <div class="missing-requirement-path">${escapeHtml(req.sectionPath)}</div>
        ${req.excerpt ? `
          <div class="missing-requirement-excerpt">${escapeHtml(req.excerpt)}</div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function renderValidationStatus() {
  const validationPanel = document.getElementById('validation-panel');
  const validationContent = document.getElementById('validation-content');
  
  if (!validationPanel || !validationContent || !state.coverage) return;

  const errors = state.coverage.errors || [];
  const warnings = state.coverage.warnings || [];

  if (errors.length === 0 && warnings.length === 0) {
    validationPanel.style.display = 'none';
    return;
  }

  validationPanel.style.display = 'block';
  
  validationContent.innerHTML = `
    ${errors.length > 0 ? `
      <div class="validation-errors">
        <h3 style="color: var(--hot-magenta); margin-bottom: var(--spacing-sm);">Errors (${errors.length})</h3>
        ${errors.map(err => `
          <div class="validation-error-item">
            <div class="validation-item-code">${escapeHtml(err.code || 'ERROR')}</div>
            <div class="validation-item-message">${escapeHtml(err.message || '')}</div>
            ${err.suggestion ? `
              <div class="validation-item-suggestion">${escapeHtml(err.suggestion)}</div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}
    ${warnings.length > 0 ? `
      <div class="validation-warnings">
        <h3 style="color: var(--safety-orange); margin-bottom: var(--spacing-sm);">Warnings (${warnings.length})</h3>
        ${warnings.map(warn => `
          <div class="validation-warning-item">
            <div class="validation-item-code">${escapeHtml(warn.code || 'WARNING')}</div>
            <div class="validation-item-message">${escapeHtml(warn.message || '')}</div>
            ${warn.suggestion ? `
              <div class="validation-item-suggestion">${escapeHtml(warn.suggestion)}</div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;
}

// ============================================
// Filter Functions
// ============================================
function setFilter(filter) {
  state.filteredSections = filter;
  
  // Update button states
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') === filter) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  renderSectionsList();
}

// ============================================
// Utility Functions
// ============================================
function showError(message) {
  const sectionsList = document.getElementById('sections-list');
  const mappingTree = document.getElementById('mapping-tree');
  
  if (sectionsList) {
    sectionsList.innerHTML = `<div class="error-message" style="color: var(--hot-magenta); padding: var(--spacing-md);">${escapeHtml(message)}</div>`;
  }
  if (mappingTree) {
    mappingTree.innerHTML = `<div class="error-message" style="color: var(--hot-magenta); padding: var(--spacing-md);">${escapeHtml(message)}</div>`;
  }
}

function escapeHtml(text) {
  if (text == null) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
