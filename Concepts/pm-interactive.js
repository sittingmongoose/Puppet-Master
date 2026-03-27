/* ================================================================
   Puppet Master – Interactive Controls
   Worktree dropdowns, modals, subagent cards, source control
   accordion, file manager controls.
   Expects: toast(msg) and switchToChatThread(threadId) already defined.
   ================================================================ */

// ── 1. Worktree Dropdown Toggle ──
window.toggleWorktreeDropdown = function(btn) {
  var dropdown = btn.parentElement.querySelector('.wt-bind-dropdown');
  if (!dropdown) dropdown = btn.nextElementSibling;
  var isActive = dropdown.classList.contains('active');
  // Close all worktree dropdowns first
  document.querySelectorAll('.wt-bind-dropdown').forEach(function(d) { d.classList.remove('active'); });
  if (!isActive) dropdown.classList.add('active');
};

// ── 2. Create Worktree Modal ──
window.showCreateWorktreeModal = function() {
  document.querySelectorAll('.wt-bind-dropdown').forEach(function(d) { d.classList.remove('active'); });
  document.getElementById('wtCreateModal').style.display = 'flex';
};
window.hideCreateWorktreeModal = function() {
  document.getElementById('wtCreateModal').style.display = 'none';
};
window.createWorktree = function(btn) {
  var nameInput = document.querySelector('#wtCreateModal input[type="text"]');
  var branchName = nameInput ? nameInput.value : 'assistant/new-branch';
  btn.textContent = 'Creating...';
  btn.classList.add('wt-creating');
  btn.disabled = true;
  setTimeout(function() {
    btn.classList.remove('wt-creating');
    btn.textContent = 'Create';
    btn.disabled = false;
    hideCreateWorktreeModal();
    if (window.toast) toast('Worktree created: ' + branchName);
    // Update worktree button to bound-clean state
    document.querySelectorAll('.wt-bind-btn').forEach(function(b) {
      b.classList.remove('wt-unbound');
      b.classList.add('wt-bound');
      b.title = branchName + ' (clean)';
      var dot = b.querySelector('.wt-dirty-dot');
      if (dot) dot.style.display = 'none';
    });
  }, 2000);
};
window.showCollisionWarning = function() {
  var warn = document.getElementById('wtCollisionWarn');
  if (warn) warn.style.display = 'block';
};

// ── 3. Merge Modal ──
window.showMergeModal = function() {
  document.querySelectorAll('.wt-bind-dropdown').forEach(function(d) { d.classList.remove('active'); });
  document.getElementById('wtMergeModal').style.display = 'flex';
};
window.hideMergeModal = function() {
  document.getElementById('wtMergeModal').style.display = 'none';
};
window.selectMergeStrategy = function(btn, strategy) {
  btn.closest('.wt-merge-strategy').querySelectorAll('.seg-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  // Show/hide commit message for rebase
  var commitLabel = btn.closest('.wt-merge-inner').querySelector('.wt-commit-msg-label');
  if (commitLabel) commitLabel.style.display = strategy === 'rebase' ? 'none' : 'block';
  // Update merge button label
  var mergeBtn = btn.closest('.wt-merge-inner').querySelector('.wizard-btn.primary');
  if (mergeBtn) {
    var labels = { squash: 'Squash Merge', merge: 'Merge Commit', rebase: 'Rebase' };
    mergeBtn.textContent = labels[strategy] || 'Merge';
  }
};
window.executeMerge = function(btn) {
  var origText = btn.textContent;
  btn.textContent = 'Merging...';
  btn.disabled = true;
  btn.classList.add('wt-creating');
  setTimeout(function() {
    btn.classList.remove('wt-creating');
    btn.textContent = origText;
    btn.disabled = false;
    hideMergeModal();
    if (window.toast) toast('Branch merged into main successfully');
  }, 2500);
};

// ── 4. Subagent Card Expand/Collapse (event delegation) ──
document.addEventListener('click', function(e) {
  var header = e.target.closest('.subagent-card-header');
  if (header) {
    e.preventDefault();
    header.closest('.subagent-card').classList.toggle('expanded');
  }
});

// ── 5. Batch Subgroup Expand/Collapse ──
document.addEventListener('click', function(e) {
  var groupHeader = e.target.closest('.sa-batch-group-header');
  if (groupHeader) {
    e.preventDefault();
    groupHeader.closest('.sa-batch-group').classList.toggle('expanded');
  }
});

// ── 6. Source Control Accordion Toggle ──
document.addEventListener('click', function(e) {
  var header = e.target.closest('.sc-accordion-header');
  if (header) {
    e.preventDefault();
    header.closest('.sc-accordion-section').classList.toggle('sc-open');
  }
});

// ── 7. Worktree Row Expand/Collapse in Source Control ──
document.addEventListener('click', function(e) {
  var row = e.target.closest('.sc-wt-row');
  if (row && !e.target.closest('button') && !e.target.closest('a')) {
    row.classList.toggle('sc-wt-expanded');
  }
});

// ── 8. Worktree Filter ──
window.filterWorktrees = function(btn, filter) {
  btn.closest('.sc-wt-filter-bar').querySelectorAll('.sc-wt-filter-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  var rows = btn.closest('.sc-accordion-body').querySelectorAll('.sc-wt-row');
  rows.forEach(function(row) {
    if (filter === 'all') { row.style.display = ''; }
    else { row.style.display = row.dataset.owner === filter ? '' : 'none'; }
  });
  if (window.toast) toast('Worktree filter: ' + filter);
};

// ── 9. File Manager Root Toggle ──
window.toggleFileManagerRoot = function(btn) {
  var bc = btn.closest('.fm-wt-breadcrumb');
  var isProject = bc.classList.toggle('fm-project-root');
  var branchSpan = bc.querySelector('.fm-wt-branch');
  if (branchSpan) branchSpan.textContent = isProject ? 'puppet-master (project root)' : 'feature/gui-update';
  var pill = bc.querySelector('.wt-status-pill');
  if (pill) pill.style.display = isProject ? 'none' : '';
  if (window.toast) toast(isProject ? 'Switched to project root' : 'Switched to worktree root');
};

// ── 10. Close dropdowns on outside click ──
document.addEventListener('click', function(e) {
  if (!e.target.closest('.wt-bind-btn') && !e.target.closest('.wt-bind-dropdown')) {
    document.querySelectorAll('.wt-bind-dropdown').forEach(function(d) { d.classList.remove('active'); });
  }
});

// ── 11. Worktree button state update per thread ──
window.updateWorktreeButtonForThread = function(threadId) {
  var wtData = {
    'thread0': { state: 'bound', dirty: true, conflict: false, branch: 'feature/gui-update', path: '.puppet-master/worktrees/wt-1', status: '3 uncommitted', statusClass: 'dirty' },
    'thread-subagents': { state: 'bound', dirty: false, conflict: false, branch: 'feature/oauth2-pkce', path: '.puppet-master/worktrees/wt-2', status: 'clean', statusClass: 'clean' },
    'thread-worktree-merge': { state: 'bound', dirty: false, conflict: true, branch: 'feature/multi-tenant', path: '.puppet-master/worktrees/wt-3', status: 'merge conflict', statusClass: 'conflict' },
    'thread-debug1': { state: 'bound', dirty: false, conflict: false, branch: 'hotfix/auth-bug', path: '.puppet-master/worktrees/wt-4', status: 'clean', statusClass: 'clean' }
  };
  var wt = wtData[threadId] || { state: 'unbound' };
  document.querySelectorAll('.wt-bind-btn').forEach(function(btn) {
    btn.classList.remove('wt-bound', 'wt-unbound');
    btn.classList.add(wt.state === 'bound' ? 'wt-bound' : 'wt-unbound');
    btn.title = wt.state === 'bound' ? wt.branch + ' (' + wt.status + ')' : 'No worktree — click to create';
    // Update dirty dot visibility
    var dot = btn.querySelector('.wt-dirty-dot');
    if (dot) dot.style.display = (wt.dirty) ? 'block' : 'none';
    // Update conflict triangle visibility
    var tri = btn.querySelector('.wt-conflict-triangle');
    if (tri) tri.style.display = (wt.conflict) ? 'block' : 'none';
    // Update dropdown content
    var dropdown = btn.parentElement.querySelector('.wt-bind-dropdown');
    if (dropdown) {
      var branchEl = dropdown.querySelector('.wt-branch-name');
      var pathEl = dropdown.querySelector('.wt-path');
      var pillEl = dropdown.querySelector('.wt-status-pill');
      if (wt.state === 'bound') {
        if (branchEl) branchEl.textContent = wt.branch;
        if (pathEl) pathEl.textContent = wt.path;
        if (pillEl) { pillEl.textContent = wt.status; pillEl.className = 'wt-status-pill ' + wt.statusClass; }
        // Show bound actions, hide create action
        dropdown.querySelectorAll('.wt-action-row').forEach(function(r) { r.style.display = ''; });
        dropdown.querySelectorAll('.wt-info-row').forEach(function(r) { r.style.display = ''; });
        dropdown.querySelectorAll('.wt-separator').forEach(function(r) { r.style.display = ''; });
        var createRow = dropdown.querySelector('.wt-create-row');
        if (createRow) createRow.style.display = 'none';
      } else {
        // Unbound: show only create option
        dropdown.querySelectorAll('.wt-action-row').forEach(function(r) { r.style.display = 'none'; });
        dropdown.querySelectorAll('.wt-info-row').forEach(function(r) { r.style.display = 'none'; });
        dropdown.querySelectorAll('.wt-separator').forEach(function(r) { r.style.display = 'none'; });
        var createRow = dropdown.querySelector('.wt-create-row');
        if (createRow) createRow.style.display = '';
      }
    }
  });
};
