/**
 * Tier Views JavaScript - Vibrant Technical Design
 * 
 * Handles tree rendering, node interactions, details panel, and WebSocket integration
 */

import { createSkeletonTree, removeSkeletons } from './skeletons.js';

// ============================================
// State Management
// ============================================
const state = {
  ws: null,
  connected: false,
  rootNode: null,
  expandedNodes: new Set(),
  currentNodeId: null,
  nodeMap: new Map(), // id -> node element mapping
  searchQuery: '', // Current search query
};

// State color mapping
const STATE_COLORS = {
  pending: 'var(--status-idle)',
  planning: 'var(--electric-blue)',
  running: 'var(--safety-orange)',
  gating: 'var(--safety-orange)',
  passed: 'var(--status-complete)',
  failed: 'var(--status-error)',
  escalated: '#9B59B6', // purple
  retrying: 'var(--electric-blue)'
};

// State labels (no emojis)
const STATE_LABELS = {
  pending: '[PENDING]',
  planning: '[PLANNING]',
  running: '[RUNNING]',
  gating: '[GATING]',
  passed: '[PASS]',
  failed: '[FAIL]',
  escalated: '[ESCALATED]',
  retrying: '[RETRYING]'
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
      console.log('[Tiers] WebSocket connected');
      state.connected = true;
    };
    
    state.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('[Tiers] Error parsing WebSocket message:', error);
      }
    };
    
    state.ws.onerror = (error) => {
      console.error('[Tiers] WebSocket error:', error);
    };
    
    state.ws.onclose = () => {
      console.log('[Tiers] WebSocket disconnected');
      state.connected = false;
      // Attempt to reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };
  } catch (error) {
    console.error('[Tiers] Error creating WebSocket:', error);
  }
}

function handleWebSocketMessage(message) {
  // Handle state_change events for tier nodes
  if (message.type === 'state_change' && message.itemId) {
    updateNodeState(message.itemId, message.state);
  }
  
  // Handle progress events to highlight currently executing node
  if (message.type === 'progress') {
    if (message.subtaskId) {
      highlightCurrentNode(message.subtaskId);
    } else if (message.taskId) {
      highlightCurrentNode(message.taskId);
    } else if (message.phaseId) {
      highlightCurrentNode(message.phaseId);
    }
  }
  
  // Handle iteration_start to highlight current node
  if (message.type === 'iteration_start' && message.itemId) {
    highlightCurrentNode(message.itemId);
  }
}

// ============================================
// Tree Rendering
// ============================================
async function loadTree() {
  const container = document.getElementById('tree-container');
  if (!container) return;
  
  // Show skeleton tree during loading
  container.innerHTML = '';
  const skeletonTree = createSkeletonTree(7);
  container.appendChild(skeletonTree);
  container.setAttribute('aria-busy', 'true');
  
  try {
    const response = await fetch('/api/tiers');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.root) {
      container.innerHTML = '<div class="empty-message">No tier hierarchy available. Start a project to see tiers.</div>';
      container.removeAttribute('aria-busy');
      return;
    }
    
    state.rootNode = data.root;
    renderTree(data.root);
    container.removeAttribute('aria-busy');
  } catch (error) {
    console.error('[Tiers] Error loading tree:', error);
    container.innerHTML = `<div class="error-message">Error loading tier hierarchy: ${error.message}</div>`;
    container.removeAttribute('aria-busy');
  }
}

function renderTree(rootNode) {
  const container = document.getElementById('tree-container');
  if (!container) return;
  
  // Remove any skeletons before rendering
  removeSkeletons(container);
  
  container.innerHTML = '';
  const treeRoot = document.createElement('div');
  treeRoot.className = 'tree-root';
  
  renderNode(rootNode, treeRoot, 0);
  container.appendChild(treeRoot);
  
  // Apply current search filter if active
  if (state.searchQuery) {
    filterTree(state.searchQuery);
  }
}

function renderNode(node, container, level) {
  const nodeElement = document.createElement('div');
  nodeElement.className = 'tree-node';
  nodeElement.dataset.nodeId = node.id;
  nodeElement.dataset.level = level;
  nodeElement.style.paddingLeft = `${level * 24}px`;
  
  // Track node element
  state.nodeMap.set(node.id, nodeElement);
  
  // Check if node has children
  const hasChildren = node.childIds && node.childIds.length > 0;
  const isExpanded = state.expandedNodes.has(node.id);
  
  // Node header (clickable for details)
  const nodeHeader = document.createElement('div');
  nodeHeader.className = 'tree-node-header';
  nodeHeader.addEventListener('click', () => showDetails(node.id));
  
  // Expand/collapse button
  if (hasChildren) {
    const expandBtn = document.createElement('button');
    expandBtn.className = 'tree-expand-btn';
    expandBtn.innerHTML = isExpanded ? '[-]' : '[+]';
    expandBtn.setAttribute('aria-label', isExpanded ? 'Collapse' : 'Expand');
    expandBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNode(node.id);
    });
    nodeHeader.appendChild(expandBtn);
  } else {
    // Spacer for alignment
    const spacer = document.createElement('span');
    spacer.className = 'tree-expand-spacer';
    spacer.innerHTML = '  ';
    nodeHeader.appendChild(spacer);
  }
  
  // State indicator (colored dot)
  const stateDot = document.createElement('span');
  stateDot.className = `tree-state-dot tree-state-${node.state}`;
  stateDot.style.backgroundColor = STATE_COLORS[node.state] || STATE_COLORS.pending;
  if (node.state === 'running') {
    stateDot.classList.add('pulsing');
  }
  stateDot.setAttribute('aria-label', `State: ${node.state}`);
  nodeHeader.appendChild(stateDot);
  
  // Node title and ID
  const nodeInfo = document.createElement('div');
  nodeInfo.className = 'tree-node-info';
  
  const nodeTitle = document.createElement('span');
  nodeTitle.className = 'tree-node-title';
  nodeTitle.textContent = node.plan?.title || node.title || node.id;
  nodeInfo.appendChild(nodeTitle);
  
  const nodeId = document.createElement('span');
  nodeId.className = 'tree-node-id monospace';
  nodeId.textContent = node.id;
  nodeInfo.appendChild(nodeId);
  
  // State label
  const stateLabel = document.createElement('span');
  stateLabel.className = 'tree-state-label';
  stateLabel.textContent = STATE_LABELS[node.state] || '[UNKNOWN]';
  nodeInfo.appendChild(stateLabel);
  
  // Iteration count (if applicable)
  if (node.iterations !== undefined && node.maxIterations !== undefined) {
    const iterCount = document.createElement('span');
    iterCount.className = 'tree-iter-count';
    iterCount.textContent = `Iter: ${node.iterations}/${node.maxIterations}`;
    nodeInfo.appendChild(iterCount);
  }
  
  nodeHeader.appendChild(nodeInfo);
  nodeElement.appendChild(nodeHeader);
  
  // Children container (if has children and expanded)
  if (hasChildren) {
    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'tree-children';
    childrenContainer.style.display = isExpanded ? 'block' : 'none';
    childrenContainer.dataset.parentId = node.id;
    
    // Render children if expanded
    if (isExpanded) {
      // Check if we have pre-loaded children (from expandAll)
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(child => {
          renderNode(child, childrenContainer, level + 1);
        });
      } else {
        // Fetch children on expand
        childrenContainer.innerHTML = '<div class="loading-indicator" style="font-size: 0.8em;">Loading children...</div>';
        Promise.all(
          node.childIds.map(childId => fetchNodeDetails(childId))
        ).then(results => {
          childrenContainer.innerHTML = '';
          results.forEach(result => {
            if (result && result.tier) {
              renderNode(result.tier, childrenContainer, level + 1);
            }
          });
        }).catch(err => {
          console.error(`[Tiers] Error fetching children for ${node.id}:`, err);
          childrenContainer.innerHTML = '<div class="error-message" style="font-size: 0.8em;">Error loading children</div>';
        });
      }
    }
    
    nodeElement.appendChild(childrenContainer);
  }
  
  container.appendChild(nodeElement);
}

async function fetchNodeDetails(nodeId) {
  try {
    const response = await fetch(`/api/tiers/${nodeId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`[Tiers] Error fetching node ${nodeId}:`, error);
    return null;
  }
}

function toggleNode(nodeId) {
  const nodeElement = state.nodeMap.get(nodeId);
  if (!nodeElement) return;
  
  const childrenContainer = nodeElement.querySelector('.tree-children');
  if (!childrenContainer) return;
  
  if (state.expandedNodes.has(nodeId)) {
    state.expandedNodes.delete(nodeId);
    childrenContainer.style.display = 'none';
    // Update expand button
    const expandBtn = nodeElement.querySelector('.tree-expand-btn');
    if (expandBtn) {
      expandBtn.innerHTML = '[+]';
      expandBtn.setAttribute('aria-label', 'Expand');
    }
  } else {
    state.expandedNodes.add(nodeId);
    childrenContainer.style.display = 'block';
    // Update expand button
    const expandBtn = nodeElement.querySelector('.tree-expand-btn');
    if (expandBtn) {
      expandBtn.innerHTML = '[-]';
      expandBtn.setAttribute('aria-label', 'Collapse');
    }
    
    // Fetch and render children if not already loaded
    if (childrenContainer.children.length === 0 || 
        (childrenContainer.children.length === 1 && childrenContainer.querySelector('.loading-indicator'))) {
      // Find the node data from rootNode
      const node = findNodeInTree(state.rootNode, nodeId);
      if (node && node.childIds && node.childIds.length > 0) {
        childrenContainer.innerHTML = '<div class="loading-indicator" style="font-size: 0.8em;">Loading children...</div>';
        Promise.all(
          node.childIds.map(childId => fetchNodeDetails(childId))
        ).then(results => {
          childrenContainer.innerHTML = '';
          const level = parseInt(nodeElement.dataset.level) || 0;
          results.forEach(result => {
            if (result && result.tier) {
              renderNode(result.tier, childrenContainer, level + 1);
            }
          });
        }).catch(err => {
          console.error(`[Tiers] Error fetching children for ${nodeId}:`, err);
          childrenContainer.innerHTML = '<div class="error-message" style="font-size: 0.8em;">Error loading children</div>';
        });
      }
    }
  }
}

function findNodeInTree(node, nodeId) {
  if (!node) return null;
  if (node.id === nodeId) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeInTree(child, nodeId);
      if (found) return found;
    }
  }
  return null;
}

async function expandAll() {
  if (!state.rootNode) return;
  
  // Recursively expand all nodes
  async function expandNode(node) {
    if (node.childIds && node.childIds.length > 0) {
      state.expandedNodes.add(node.id);
      
      // Load children if not already loaded
      if (!node.children || node.children.length === 0) {
        try {
          const childData = await Promise.all(
            node.childIds.map(childId => fetchNodeDetails(childId))
          );
          node.children = childData
            .filter(result => result && result.tier)
            .map(result => result.tier);
        } catch (err) {
          console.error(`[Tiers] Error loading children for ${node.id}:`, err);
        }
      }
      
      // Recursively expand children
      if (node.children) {
        for (const child of node.children) {
          await expandNode(child);
        }
      }
    }
  }
  
  // Show loading indicator
  const container = document.getElementById('tree-container');
  if (container) {
    container.innerHTML = '<div class="loading-indicator">Expanding all nodes...</div>';
  }
  
  // Load all children recursively
  await expandNode(state.rootNode);
  
  // Re-render tree with all nodes expanded
  renderTree(state.rootNode);
}

function collapseAll() {
  state.expandedNodes.clear();
  if (state.rootNode) {
    renderTree(state.rootNode);
  }
}

async function loadAllChildren(node) {
  if (!node.childIds || node.childIds.length === 0) {
    return;
  }
  
  node.children = [];
  for (const childId of node.childIds) {
    const childData = await fetchNodeDetails(childId);
    if (childData && childData.tier) {
      node.children.push(childData.tier);
      await loadAllChildren(childData.tier);
    }
  }
}

// ============================================
// Node State Updates
// ============================================
function updateNodeState(nodeId, newState) {
  const nodeElement = state.nodeMap.get(nodeId);
  if (!nodeElement) return;
  
  const stateDot = nodeElement.querySelector('.tree-state-dot');
  const stateLabel = nodeElement.querySelector('.tree-state-label');
  
  if (stateDot) {
    stateDot.className = `tree-state-dot tree-state-${newState}`;
    stateDot.style.backgroundColor = STATE_COLORS[newState] || STATE_COLORS.pending;
    
    if (newState === 'running') {
      stateDot.classList.add('pulsing');
    } else {
      stateDot.classList.remove('pulsing');
    }
  }
  
  if (stateLabel) {
    stateLabel.textContent = STATE_LABELS[newState] || '[UNKNOWN]';
  }
}

function highlightCurrentNode(nodeId) {
  // Remove highlight from previous node
  if (state.currentNodeId) {
    const prevNode = state.nodeMap.get(state.currentNodeId);
    if (prevNode) {
      prevNode.classList.remove('current-executing');
    }
  }
  
  // Add highlight to current node
  const currentNode = state.nodeMap.get(nodeId);
  if (currentNode) {
    currentNode.classList.add('current-executing');
    state.currentNodeId = nodeId;
    
    // Auto-expand to show current node
    const nodeElement = currentNode;
    let parent = nodeElement.parentElement;
    while (parent && parent.classList.contains('tree-node')) {
      const parentId = parent.dataset.nodeId;
      if (parentId) {
        state.expandedNodes.add(parentId);
      }
      parent = parent.parentElement;
    }
    
    // Scroll into view
    currentNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ============================================
// Details Panel
// ============================================
async function showDetails(nodeId) {
  const panel = document.getElementById('details-panel');
  const content = document.getElementById('details-content');
  const title = document.getElementById('details-title');
  
  if (!panel || !content || !title) return;
  
  // Show loading state
  content.innerHTML = '<div class="loading-indicator">Loading details...</div>';
  panel.classList.add('open');
  
  try {
    const data = await fetchNodeDetails(nodeId);
    if (!data || !data.tier) {
      content.innerHTML = '<div class="error-message">Failed to load tier details.</div>';
      return;
    }
    
    const node = data.tier;
    
    // Populate details
    title.textContent = `${node.id}: ${node.plan?.title || node.title || 'Untitled'}`;
    
    let html = '';
    
    // Basic info
    html += '<div class="detail-section">';
    html += `<h3 class="section-title">Basic Information</h3>`;
    html += `<div class="detail-row"><span class="detail-label">ID:</span><span class="monospace">${node.id}</span></div>`;
    html += `<div class="detail-row"><span class="detail-label">Type:</span><span>${node.type.toUpperCase()}</span></div>`;
    html += `<div class="detail-row"><span class="detail-label">State:</span><span class="tree-state-label">${STATE_LABELS[node.state] || '[UNKNOWN]'}</span></div>`;
    if (node.iterations !== undefined && node.maxIterations !== undefined) {
      html += `<div class="detail-row"><span class="detail-label">Iterations:</span><span>${node.iterations}/${node.maxIterations}</span></div>`;
    }
    html += '</div>';
    
    // Description
    if (node.plan?.description || node.description) {
      html += '<div class="detail-section">';
      html += `<h3 class="section-title">Description</h3>`;
      html += `<p>${node.plan?.description || node.description || 'No description'}</p>`;
      html += '</div>';
    }
    
    // Acceptance Criteria
    if (node.acceptanceCriteria && node.acceptanceCriteria.length > 0) {
      html += '<div class="detail-section">';
      html += '<h3 class="section-title">Acceptance Criteria</h3>';
      html += '<ul class="criteria-list">';
      node.acceptanceCriteria.forEach(criterion => {
        const status = criterion.passed ? 'complete' : 'pending';
        html += `<li class="criteria-item ${status}">`;
        html += criterion.passed ? '[PASS]' : '[PENDING]';
        html += ` ${criterion.description || criterion.target || 'No description'}`;
        html += '</li>';
      });
      html += '</ul>';
      html += '</div>';
    }
    
    // Test Plan
    if (node.testPlan && node.testPlan.commands && node.testPlan.commands.length > 0) {
      html += '<div class="detail-section">';
      html += '<h3 class="section-title">Test Plan</h3>';
      html += '<ul class="test-plan-list">';
      node.testPlan.commands.forEach((cmd, idx) => {
        html += `<li class="test-plan-item">`;
        html += `<span class="monospace">${cmd.command}${cmd.args ? ' ' + cmd.args.join(' ') : ''}</span>`;
        if (cmd.workingDirectory) {
          html += ` <span class="test-plan-wd">(in ${cmd.workingDirectory})</span>`;
        }
        html += '</li>';
      });
      html += '</ul>';
      html += '</div>';
    }
    
    // Evidence
    if (node.evidence && node.evidence.length > 0) {
      html += '<div class="detail-section">';
      html += '<h3 class="section-title">Evidence</h3>';
      html += '<ul class="evidence-list">';
      node.evidence.forEach(evidence => {
        html += `<li class="evidence-item">`;
        html += `<span class="evidence-type">[${evidence.type.toUpperCase()}]</span>`;
        html += ` ${evidence.summary || evidence.path}`;
        if (evidence.timestamp) {
          html += ` <span class="evidence-time">(${new Date(evidence.timestamp).toLocaleString()})</span>`;
        }
        html += '</li>';
      });
      html += '</ul>';
      html += '</div>';
    }
    
    // Timestamps
    html += '<div class="detail-section">';
    html += '<h3 class="section-title">Timestamps</h3>';
    html += `<div class="detail-row"><span class="detail-label">Created:</span><span>${new Date(node.createdAt).toLocaleString()}</span></div>`;
    html += `<div class="detail-row"><span class="detail-label">Updated:</span><span>${new Date(node.updatedAt).toLocaleString()}</span></div>`;
    html += '</div>';
    
    content.innerHTML = html;
  } catch (error) {
    console.error('[Tiers] Error loading details:', error);
    content.innerHTML = `<div class="error-message">Error loading details: ${error.message}</div>`;
  }
}

function hideDetails() {
  const panel = document.getElementById('details-panel');
  if (panel) {
    panel.classList.remove('open');
  }
}

// ============================================
// Search/Filter Functionality
// ============================================
function filterTree(query) {
  state.searchQuery = query;
  const queryLower = query.toLowerCase().trim();
  
  if (!queryLower) {
    // Clear search - show all nodes
    document.querySelectorAll('.tree-node').forEach(node => {
      node.style.display = 'block';
    });
    // Remove no results message if present
    const container = document.getElementById('tree-container');
    const existingMessage = container?.querySelector('.no-search-results');
    if (existingMessage) {
      existingMessage.remove();
    }
    return;
  }
  
  // Helper function to check if a node or any of its descendants match
  function nodeOrDescendantsMatch(nodeElement) {
    const nodeId = nodeElement.dataset.nodeId || '';
    const nodeTitle = nodeElement.querySelector('.tree-node-title')?.textContent || '';
    const nodeIdLower = nodeId.toLowerCase();
    const nodeTitleLower = nodeTitle.toLowerCase();
    
    if (nodeIdLower.includes(queryLower) || nodeTitleLower.includes(queryLower)) {
      return true;
    }
    
    // Check descendants
    const childrenContainer = nodeElement.querySelector('.tree-children');
    if (childrenContainer) {
      const childNodes = childrenContainer.querySelectorAll('.tree-node');
      for (const childNode of childNodes) {
        if (nodeOrDescendantsMatch(childNode)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  // Filter nodes
  let hasMatches = false;
  document.querySelectorAll('.tree-node').forEach(node => {
    if (nodeOrDescendantsMatch(node)) {
      node.style.display = 'block';
      hasMatches = true;
      // Expand parents to ensure visibility
      expandParents(node);
      
      // Also expand this node if it has children (so matching children are visible)
      const nodeId = node.dataset.nodeId;
      const childrenContainer = node.querySelector('.tree-children');
      if (nodeId && childrenContainer) {
        state.expandedNodes.add(nodeId);
        childrenContainer.style.display = 'block';
        const expandBtn = node.querySelector('.tree-expand-btn');
        if (expandBtn) {
          expandBtn.innerHTML = '[-]';
          expandBtn.setAttribute('aria-label', 'Collapse');
        }
      }
    } else {
      node.style.display = 'none';
    }
  });
  
  // If no matches, show a message
  const container = document.getElementById('tree-container');
  if (container && !hasMatches && queryLower) {
    const existingMessage = container.querySelector('.no-search-results');
    if (!existingMessage) {
      const message = document.createElement('div');
      message.className = 'no-search-results empty-message';
      message.textContent = `No tiers found matching "${query}"`;
      container.appendChild(message);
    }
  } else {
    const existingMessage = container?.querySelector('.no-search-results');
    if (existingMessage) {
      existingMessage.remove();
    }
  }
}

function expandParents(nodeElement) {
  let parent = nodeElement.parentElement;
  while (parent) {
    if (parent.classList.contains('tree-node')) {
      const parentId = parent.dataset.nodeId;
      if (parentId) {
        // Add to expanded nodes
        state.expandedNodes.add(parentId);
        
        // Update UI to show expanded state
        const childrenContainer = parent.querySelector('.tree-children');
        if (childrenContainer) {
          childrenContainer.style.display = 'block';
        }
        
        const expandBtn = parent.querySelector('.tree-expand-btn');
        if (expandBtn) {
          expandBtn.innerHTML = '[-]';
          expandBtn.setAttribute('aria-label', 'Collapse');
        }
      }
    }
    parent = parent.parentElement;
  }
}

// ============================================
// Event Listeners
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize (dark mode is handled by navigation.js)
  loadTree();
  connectWebSocket();
  
  // Refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      // Clear search when refreshing
      const searchInput = document.getElementById('tier-search');
      if (searchInput) {
        searchInput.value = '';
        state.searchQuery = '';
      }
      loadTree();
    });
  }
  
  // Expand/Collapse all buttons
  const expandAllBtn = document.getElementById('expand-all-btn');
  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', expandAll);
  }
  
  const collapseAllBtn = document.getElementById('collapse-all-btn');
  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', collapseAll);
  }
  
  // Close details panel button
  const closeDetailsBtn = document.getElementById('close-details-btn');
  if (closeDetailsBtn) {
    closeDetailsBtn.addEventListener('click', hideDetails);
  }
  
  // Close details panel on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideDetails();
    }
  });
  
  // Search input
  const searchInput = document.getElementById('tier-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterTree(e.target.value);
    });
    
    // Clear search on Escape (if not in details panel)
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && e.target.value) {
        e.target.value = '';
        filterTree('');
        e.target.blur();
      }
    });
  }
});
