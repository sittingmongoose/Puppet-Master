/**
 * Skeleton Loader Utilities - Vibrant Technical Design
 * 
 * Provides functions to generate skeleton HTML placeholders for loading states
 */

/**
 * Creates a skeleton table row with specified number of columns
 * @param {number} columns - Number of columns in the row
 * @param {Array<string>} widths - Optional array of width classes ('short', 'medium', 'long')
 * @returns {HTMLTableRowElement} Skeleton table row
 */
export function createSkeletonTableRow(columns, widths = []) {
  const row = document.createElement('tr');
  row.className = 'skeleton-table-row';
  row.setAttribute('aria-busy', 'true');
  row.setAttribute('aria-label', 'Loading content...');

  for (let i = 0; i < columns; i++) {
    const cell = document.createElement('td');
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton skeleton-text';
    
    // Apply width class if provided
    if (widths[i]) {
      skeleton.classList.add(widths[i]);
    } else {
      // Default to medium width
      skeleton.classList.add('medium');
    }
    
    cell.appendChild(skeleton);
    row.appendChild(cell);
  }

  return row;
}

/**
 * Creates a skeleton tree node with indentation
 * @param {number} level - Indentation level (1-4)
 * @param {string} width - Width class ('short', 'medium', 'long')
 * @returns {HTMLDivElement} Skeleton tree node
 */
export function createSkeletonTreeNode(level = 1, width = 'medium') {
  const node = document.createElement('div');
  node.className = 'skeleton-tree-node';
  node.setAttribute('data-level', level.toString());
  node.setAttribute('aria-busy', 'true');
  node.setAttribute('aria-label', 'Loading tier...');

  const skeleton = document.createElement('div');
  skeleton.className = `skeleton skeleton-text ${width}`;
  
  node.appendChild(skeleton);
  return node;
}

/**
 * Creates multiple skeleton tree nodes with varying levels
 * @param {number} count - Number of nodes to create
 * @returns {DocumentFragment} Fragment containing skeleton nodes
 */
export function createSkeletonTree(count = 5) {
  const fragment = document.createDocumentFragment();
  
  // Create nodes with varying levels and widths
  const patterns = [
    { level: 1, width: 'long' },   // Phase
    { level: 2, width: 'medium' }, // Task
    { level: 2, width: 'medium' }, // Task
    { level: 3, width: 'short' },   // Subtask
    { level: 3, width: 'short' },   // Subtask
    { level: 2, width: 'medium' },   // Task
    { level: 3, width: 'short' },   // Subtask
  ];

  for (let i = 0; i < count; i++) {
    const pattern = patterns[i % patterns.length];
    const node = createSkeletonTreeNode(pattern.level, pattern.width);
    fragment.appendChild(node);
  }

  return fragment;
}

/**
 * Creates a skeleton project card
 * @returns {HTMLDivElement} Skeleton card element
 */
export function createSkeletonCard() {
  const card = document.createElement('div');
  card.className = 'skeleton-card';
  card.setAttribute('aria-busy', 'true');
  card.setAttribute('aria-label', 'Loading project...');

  // Title skeleton
  const title = document.createElement('div');
  title.className = 'skeleton skeleton-text long';
  card.appendChild(title);

  // Path skeleton
  const path = document.createElement('div');
  path.className = 'skeleton skeleton-text medium';
  card.appendChild(path);

  // Metadata skeleton
  const metadata = document.createElement('div');
  metadata.className = 'skeleton skeleton-text short';
  card.appendChild(metadata);

  return card;
}

/**
 * Creates multiple skeleton cards
 * @param {number} count - Number of cards to create
 * @returns {DocumentFragment} Fragment containing skeleton cards
 */
export function createSkeletonCards(count = 3) {
  const fragment = document.createDocumentFragment();
  
  for (let i = 0; i < count; i++) {
    const card = createSkeletonCard();
    fragment.appendChild(card);
  }

  return fragment;
}

/**
 * Removes all skeleton elements from a container
 * @param {HTMLElement} container - Container element to clear
 */
export function removeSkeletons(container) {
  if (!container) return;
  
  const skeletons = container.querySelectorAll('.skeleton-table-row, .skeleton-tree-node, .skeleton-card');
  skeletons.forEach(skeleton => {
    skeleton.remove();
  });
  
  // Also remove any loading indicators
  const loadingIndicators = container.querySelectorAll('.loading-indicator, .loading-message');
  loadingIndicators.forEach(indicator => {
    indicator.style.display = 'none';
  });
}
