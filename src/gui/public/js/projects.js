/**
 * Projects JavaScript - Vibrant Technical Design
 * 
 * Handles project listing, creation, and opening functionality
 */

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
  if (loadingIndicator) {
    loadingIndicator.style.display = 'block';
  }

  try {
    const response = await fetch('/api/projects');
    if (!response.ok) {
      throw new Error(`Failed to load projects: ${response.statusText}`);
    }

    const data = await response.json();
    state.projects = data.projects || [];

    renderProjectCards(state.projects);
    renderProjectsTable(state.projects);
  } catch (error) {
    console.error('[Projects] Error loading projects:', error);
    const grid = document.getElementById('project-cards-grid');
    if (grid) {
      grid.innerHTML = `<div class="error-message">[ERROR] Failed to load projects: ${error.message}</div>`;
    }
    const tableBody = document.getElementById('projects-table-body');
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="5" class="table-error">[ERROR] Failed to load projects</td></tr>`;
    }
  } finally {
    state.loading = false;
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
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

  // Clear loading indicator
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
// Event Listeners
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Create project form
  const form = document.getElementById('create-project-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('project-name-input');
      const pathInput = document.getElementById('project-path-input');
      
      if (nameInput && pathInput) {
        const name = nameInput.value.trim();
        const path = pathInput.value.trim();
        
        if (name && path) {
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

  // Initialize
  initDarkMode();
  loadProjects();
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
