/**
 * Projects JavaScript - Vibrant Technical Design
 * 
 * Handles project listing, creation, and opening functionality
 */

import { createSkeletonCards, createSkeletonTableRow, removeSkeletons } from './skeletons.js';

// ============================================
// State Management
// ============================================
const state = {
  projects: [],
  loading: false,
};

// ============================================
// API Calls
// ============================================
async function loadProjects() {
  state.loading = true;
  const loadingIndicator = document.getElementById('loading-indicator');
  const grid = document.getElementById('project-cards-grid');
  const tableBody = document.getElementById('projects-table-body');

  // Hide loading indicator and show skeletons
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }

  // Show skeleton cards in grid
  if (grid) {
    grid.innerHTML = '';
    grid.setAttribute('aria-busy', 'true');
    const skeletonCards = createSkeletonCards(3);
    grid.appendChild(skeletonCards);
  }

  // Show skeleton rows in table
  if (tableBody) {
    tableBody.innerHTML = '';
    tableBody.setAttribute('aria-busy', 'true');
    // Projects table has 5 columns: Name, Path, Status, Last Updated, Actions
    const widths = ['long', 'long', 'short', 'medium', 'short'];
    for (let i = 0; i < 5; i++) {
      const skeletonRow = createSkeletonTableRow(5, widths);
      tableBody.appendChild(skeletonRow);
    }
  }

  try {
    // Add timeout to prevent indefinite loading
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    console.log('[Projects] Fetching projects from /api/projects...');
    const response = await fetch('/api/projects', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    console.log('[Projects] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Projects] Error response:', errorText);
      throw new Error(`Failed to load projects: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[Projects] Received data:', data);
    state.projects = data.projects || [];
    console.log('[Projects] Loaded', state.projects.length, 'projects');

    renderProjectCards(state.projects);
    renderProjectsTable(state.projects);

    // Remove aria-busy attributes
    if (grid) grid.removeAttribute('aria-busy');
    if (tableBody) tableBody.removeAttribute('aria-busy');
  } catch (error) {
    console.error('[Projects] Error loading projects:', error);

    // Better error display
    const errorMessage = error.name === 'AbortError'
      ? 'Request timed out. The server is not responding. Please check your connection and try again.'
      : `Failed to load projects: ${error.message}`;

    if (grid) {
      removeSkeletons(grid);
      grid.innerHTML = `
        <div class="error-message" style="padding: var(--spacing-xl); text-align: center;">
          <p style="color: var(--hot-magenta); font-weight: 700; margin-bottom: var(--spacing-md);">[ERROR]</p>
          <p style="margin-bottom: var(--spacing-lg);">${errorMessage}</p>
          <button class="control-btn retry-btn" onclick="location.reload()" style="margin: 0 auto;">RETRY</button>
        </div>
      `;
      grid.removeAttribute('aria-busy');
    }
    if (tableBody) {
      removeSkeletons(tableBody);
      tableBody.innerHTML = `<tr><td colspan="5" class="table-error" style="text-align: center; padding: var(--spacing-xl);">${errorMessage}</td></tr>`;
      tableBody.removeAttribute('aria-busy');
    }
  } finally {
    state.loading = false;
  }
}

async function createProject(name, path) {
  const createBtn = document.getElementById('create-project-btn');
  const errorDiv = document.getElementById('create-project-error');

  if (createBtn) {
    createBtn.disabled = true;
    createBtn.textContent = 'CREATING...';
  }

  if (errorDiv) {
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
  }

  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, path }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create project');
    }

    // Reset form
    const form = document.getElementById('create-project-form');
    if (form) {
      form.reset();
    }

    // Reload projects
    await loadProjects();

    // Optionally auto-open the new project
    if (data.project) {
      // Auto-open if desired
      // await openProject(data.project.path);
    }
  } catch (error) {
    console.error('[Projects] Error creating project:', error);
    if (errorDiv) {
      errorDiv.style.display = 'block';
      errorDiv.textContent = `[ERROR] ${error.message}`;
    }
  } finally {
    if (createBtn) {
      createBtn.disabled = false;
      createBtn.textContent = 'CREATE PROJECT';
    }
  }
}

async function openProject(path) {
  try {
    const response = await fetch('/api/projects/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to open project');
    }

    // Navigate to dashboard
    window.location.href = '/';
  } catch (error) {
    console.error('[Projects] Error opening project:', error);
    alert(`[ERROR] Failed to open project: ${error.message}`);
  }
}

// ============================================
// Rendering Functions
// ============================================
function renderProjectCards(projects) {
  const grid = document.getElementById('project-cards-grid');
  if (!grid) return;

  // Remove any skeletons before rendering
  removeSkeletons(grid);

  grid.innerHTML = '';

  if (projects.length === 0) {
    grid.innerHTML = '<div class="empty-state">No projects found. Create a new project to get started.</div>';
    return;
  }

  // Create cards for each project
  projects.forEach(project => {
    const card = createProjectCard(project);
    grid.appendChild(card);
  });
}

function createProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Open project ${project.name}`);

  // Card header
  const header = document.createElement('div');
  header.className = 'project-card-header';

  const name = document.createElement('div');
  name.className = 'project-card-name';
  name.textContent = project.name;

  const statusDot = document.createElement('span');
  statusDot.className = `status-dot ${project.status}`;
  statusDot.setAttribute('aria-label', `Status: ${project.status}`);

  header.appendChild(statusDot);
  header.appendChild(name);

  // Card body
  const body = document.createElement('div');
  body.className = 'project-card-body';

  const lastModified = document.createElement('div');
  lastModified.className = 'project-card-meta';
  lastModified.textContent = `Last: ${formatRelativeTime(project.lastModified)}`;

  const progress = document.createElement('div');
  progress.className = 'project-card-meta';
  if (project.phaseProgress) {
    progress.textContent = project.phaseProgress;
  } else {
    progress.textContent = project.status === 'complete' ? 'Complete' : 'Not started';
  }

  body.appendChild(lastModified);
  body.appendChild(progress);

  // Card footer
  const footer = document.createElement('div');
  footer.className = 'project-card-footer';

  const path = document.createElement('div');
  path.className = 'project-card-path monospace';
  path.textContent = project.path;
  path.title = project.path;

  footer.appendChild(path);

  card.appendChild(header);
  card.appendChild(body);
  card.appendChild(footer);

  // Click handler
  card.addEventListener('click', () => {
    openProject(project.path);
  });

  card.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProject(project.path);
    }
  });

  return card;
}

function renderProjectsTable(projects) {
  const tableBody = document.getElementById('projects-table-body');
  if (!tableBody) return;

  // Remove any skeletons before rendering
  removeSkeletons(tableBody);

  tableBody.innerHTML = '';

  if (projects.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="5" class="table-empty">No projects found</td>';
    tableBody.appendChild(row);
    return;
  }

  projects.forEach(project => {
    const row = createProjectsTableRow(project);
    tableBody.appendChild(row);
  });
}

function createProjectsTableRow(project) {
  const row = document.createElement('tr');
  row.className = 'projects-table-row';

  // Name cell
  const nameCell = document.createElement('td');
  nameCell.textContent = project.name;
  row.appendChild(nameCell);

  // Path cell
  const pathCell = document.createElement('td');
  pathCell.className = 'monospace';
  pathCell.textContent = project.path;
  pathCell.title = project.path;
  row.appendChild(pathCell);

  // Status cell
  const statusCell = document.createElement('td');
  const statusDot = document.createElement('span');
  statusDot.className = `status-dot ${project.status}`;
  statusDot.setAttribute('aria-label', `Status: ${project.status}`);
  const statusText = document.createElement('span');
  statusText.className = 'status-text';
  statusText.textContent = project.status.charAt(0).toUpperCase() + project.status.slice(1);
  statusCell.appendChild(statusDot);
  statusCell.appendChild(document.createTextNode(' '));
  statusCell.appendChild(statusText);
  row.appendChild(statusCell);

  // Last Updated cell
  const updatedCell = document.createElement('td');
  updatedCell.textContent = formatRelativeTime(project.lastModified);
  row.appendChild(updatedCell);

  // Actions cell
  const actionsCell = document.createElement('td');
  const openBtn = document.createElement('button');
  openBtn.className = 'icon-btn';
  openBtn.textContent = 'OPEN';
  openBtn.setAttribute('aria-label', `Open project ${project.name}`);
  openBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openProject(project.path);
  });
  actionsCell.appendChild(openBtn);
  row.appendChild(actionsCell);

  // Click handler for row
  row.addEventListener('click', () => {
    openProject(project.path);
  });
  row.setAttribute('role', 'button');
  row.setAttribute('tabindex', '0');
  row.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProject(project.path);
    }
  });

  return row;
}

// ============================================
// Utility Functions
// ============================================
function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks}w ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// ============================================
// Validation Functions
// ============================================
function validateProjectName(nameInput, errorDiv) {
  const name = nameInput.value.trim();

  // Check if empty
  if (!name) {
    showValidationError(errorDiv, 'Project name is required');
    nameInput.setCustomValidity('Project name is required');
    return false;
  }

  // Check for invalid characters (OS-specific restrictions)
  const invalidChars = /[<>:"|?*\/\\]/;
  if (invalidChars.test(name)) {
    showValidationError(errorDiv, 'Project name contains invalid characters (< > : " | ? * / \\)');
    nameInput.setCustomValidity('Invalid characters in project name');
    return false;
  }

  // Check length (reasonable limits)
  if (name.length < 2) {
    showValidationError(errorDiv, 'Project name must be at least 2 characters long');
    nameInput.setCustomValidity('Project name too short');
    return false;
  }

  if (name.length > 100) {
    showValidationError(errorDiv, 'Project name must be less than 100 characters');
    nameInput.setCustomValidity('Project name too long');
    return false;
  }

  // Clear validation
  nameInput.setCustomValidity('');
  if (errorDiv && errorDiv.textContent.includes('name')) {
    errorDiv.style.display = 'none';
  }
  return true;
}

function validateProjectPath(pathInput, errorDiv) {
  const path = pathInput.value.trim();

  // Check if empty
  if (!path) {
    showValidationError(errorDiv, 'Project path is required');
    pathInput.setCustomValidity('Project path is required');
    return false;
  }

  // Check for basic path structure (Unix or Windows)
  // Unix: starts with / or ~
  // Windows: starts with drive letter (C:) or UNC path (\\)
  const validPathPattern = /^(\/|~\/|[A-Za-z]:\\|\\\\)/;
  if (!validPathPattern.test(path)) {
    showValidationError(errorDiv, 'Project path must be an absolute path (e.g., /home/user/project or C:\\Users\\project)');
    pathInput.setCustomValidity('Invalid path format');
    return false;
  }

  // Check for invalid characters in path
  const invalidChars = /[<>:"|?*]/;
  if (invalidChars.test(path.replace(/^[A-Za-z]:/, ''))) { // Allow colon in drive letter
    showValidationError(errorDiv, 'Project path contains invalid characters (< > : " | ? *)');
    pathInput.setCustomValidity('Invalid characters in path');
    return false;
  }

  // Clear validation
  pathInput.setCustomValidity('');
  if (errorDiv && errorDiv.textContent.includes('path')) {
    errorDiv.style.display = 'none';
  }
  return true;
}

function showValidationError(errorDiv, message) {
  if (errorDiv) {
    errorDiv.textContent = `[VALIDATION ERROR] ${message}`;
    errorDiv.style.display = 'block';
    errorDiv.style.borderColor = 'var(--hot-magenta)';
    errorDiv.style.color = 'var(--hot-magenta)';
  }
}

// ============================================
// Event Listeners
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Create project form
  const form = document.getElementById('create-project-form');
  if (form) {
    // Add input validation listeners
    const nameInput = document.getElementById('project-name-input');
    const pathInput = document.getElementById('project-path-input');
    const errorDiv = document.getElementById('create-project-error');

    // Validate project name on input
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        validateProjectName(nameInput, errorDiv);
      });
    }

    // Validate project path on input
    if (pathInput) {
      pathInput.addEventListener('input', () => {
        validateProjectPath(pathInput, errorDiv);
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (nameInput && pathInput) {
        const name = nameInput.value.trim();
        const path = pathInput.value.trim();

        // Validate both fields
        const nameValid = validateProjectName(nameInput, errorDiv);
        const pathValid = validateProjectPath(pathInput, errorDiv);

        if (nameValid && pathValid && name && path) {
          await createProject(name, path);
        }
      }
    });
  }

  // Browse path button - directory picker
  const browseBtn = document.getElementById('browse-path-btn');
  const dirInput = document.getElementById('directory-input');
  const pathInput = document.getElementById('project-path-input');
  
  if (browseBtn && pathInput) {
    // Try File System Access API first (modern browsers)
    browseBtn.addEventListener('click', async () => {
      if (window.showDirectoryPicker) {
        try {
          const directoryHandle = await window.showDirectoryPicker();
          const dirName = directoryHandle.name;
          
          // Browser security prevents getting full path
          // Show directory name and let user verify/adjust
          pathInput.value = dirName;
          showDirectoryMessage(`Selected: ${dirName}. Please verify or enter the full path.`);
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('[Projects] Error with directory picker:', err);
            // Fallback to webkitdirectory
            if (dirInput) {
              dirInput.click();
            }
          }
        }
      } else {
        // Fallback: Use webkitdirectory (Chrome, Edge, Safari)
        if (dirInput) {
          dirInput.click();
        } else {
          // Last resort: prompt
          const dirPath = prompt('Enter the full path to the project directory:');
          if (dirPath) {
            pathInput.value = dirPath;
          }
        }
      }
    });
    
    // Handle webkitdirectory selection (fallback)
    if (dirInput) {
      dirInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          const firstFile = files[0];
          if (firstFile.webkitRelativePath) {
            const relativePath = firstFile.webkitRelativePath;
            const dirName = relativePath.split('/')[0];
            pathInput.value = dirName;
            showDirectoryMessage(`Selected: ${dirName}. Please verify or enter the full path.`);
          }
        }
        // Reset to allow selecting same directory again
        dirInput.value = '';
      });
    }
  }
  
  // Helper function to show directory selection messages
  function showDirectoryMessage(message) {
    const errorDiv = document.getElementById('create-project-error');
    if (errorDiv) {
      errorDiv.style.display = 'block';
      errorDiv.textContent = message;
      errorDiv.style.borderColor = 'var(--electric-blue)';
      errorDiv.style.color = 'var(--ink-black)';
      
      // Clear after 5 seconds
      setTimeout(() => {
        if (errorDiv.textContent === message) {
          errorDiv.style.display = 'none';
          errorDiv.textContent = '';
        }
      }, 5000);
    }
  }

  // Refresh button
  const refreshBtn = document.getElementById('refresh-projects-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadProjects();
    });
  }

  // Initialize projects (dark mode is handled by navigation.js)
  loadProjects();
});
