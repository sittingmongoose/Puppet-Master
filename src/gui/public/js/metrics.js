/**
 * Metrics Dashboard JavaScript
 *
 * Loads metrics from /api/metrics and renders summary + per-platform table.
 * Supports optional `?projectPath=` query param (matching coverage.js pattern).
 */

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadMetrics();
});

function setupEventListeners() {
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadMetrics();
    });
  }
}

async function loadMetrics() {
  const loadingEl = document.getElementById('loading-message');
  const tableEl = document.getElementById('platform-table');
  const errorEl = document.getElementById('error-message');
  const notesEl = document.getElementById('metrics-notes');

  if (loadingEl) loadingEl.style.display = 'block';
  if (tableEl) tableEl.style.display = 'none';
  if (errorEl) errorEl.style.display = 'none';
  if (notesEl) notesEl.innerHTML = '<div class="loading-message">Loading notes...</div>';

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const projectPath = urlParams.get('projectPath');

    let apiUrl = '/api/metrics';
    if (projectPath) {
      apiUrl += `?projectPath=${encodeURIComponent(projectPath)}`;
    }

    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      showError(errorData.error || `Failed to load metrics (${response.status})`);
      return;
    }

    const report = await response.json();
    renderSummary(report);
    renderPlatformTable(report);
    renderNotes(report);
  } catch (error) {
    showError(`Failed to load metrics: ${error?.message || String(error)}`);
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

function renderSummary(report) {
  const totalIterationsEl = document.getElementById('metric-total-iterations');
  const firstPassEl = document.getElementById('metric-first-pass');
  const escalationEl = document.getElementById('metric-escalation-rate');

  const totalIterations = report?.summary?.totalIterations ?? 0;
  const firstPass = report?.summary?.firstPassSuccessRate ?? 0;
  const escalationRate = report?.summary?.escalationRate ?? 0;

  if (totalIterationsEl) totalIterationsEl.textContent = String(totalIterations);
  if (firstPassEl) firstPassEl.textContent = `${Math.round(firstPass * 100)}%`;
  if (escalationEl) escalationEl.textContent = `${Math.round(escalationRate * 100)}%`;
}

function renderPlatformTable(report) {
  const tableEl = document.getElementById('platform-table');
  const tbody = document.getElementById('platform-table-body');
  const countEl = document.getElementById('platform-count');

  const platforms = report?.summary?.platformMetrics ?? [];

  if (countEl) {
    countEl.textContent = `${platforms.length} platform${platforms.length === 1 ? '' : 's'}`;
  }

  if (!tbody) return;
  tbody.innerHTML = '';

  for (const p of platforms) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="monospace">${escapeHtml(p.platform)}</td>
      <td>${escapeHtml(String(p.calls ?? 0))}</td>
      <td>${escapeHtml(String(p.tokensUsed ?? 0))}</td>
      <td>${escapeHtml(String(p.estimatedCostUSD ?? 0))}</td>
      <td>${escapeHtml(String(p.averageLatencyMs ?? 0))}</td>
      <td>${escapeHtml(`${Math.round((p.errorRate ?? 0) * 100)}%`)}</td>
    `;
    tbody.appendChild(tr);
  }

  if (tableEl) tableEl.style.display = 'table';
}

function renderNotes(report) {
  const notesEl = document.getElementById('metrics-notes');
  if (!notesEl) return;

  const notes = Array.isArray(report?.notes) ? report.notes : [];
  if (notes.length === 0) {
    notesEl.innerHTML = '<div class="info-text">No notes.</div>';
    return;
  }

  const items = notes.map((n) => `<li>${escapeHtml(n)}</li>`).join('');
  notesEl.innerHTML = `<ul class="missing-requirements-list">${items}</ul>`;
}

function showError(message) {
  const errorEl = document.getElementById('error-message');
  if (errorEl) {
    errorEl.style.display = 'block';
    errorEl.textContent = message;
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

