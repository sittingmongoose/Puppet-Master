import {
  MODEL_NAME,
  THEMES,
  CONCEPTS,
  CATEGORIES,
  SCENARIOS,
  categoryById,
  managerById
} from "./data.mjs";
import { SettingsStore } from "./state.mjs";
import { createViewRenderer, escapeHTML, icon, toneFor } from "./view.mjs";
import { createMotionCoordinator, captureMotionRects } from "./motion.mjs";

const conceptId = document.body.dataset.concept;
const concept = CONCEPTS[conceptId] || CONCEPTS["index-house"];
const app = document.querySelector("#app");
const store = new SettingsStore(conceptId);

const scenarioOptions = Object.entries(SCENARIOS).map(([id, scenario]) =>
  `<option value="${escapeHTML(id)}">${escapeHTML(scenario.label || id)}</option>`
).join("");
const themeOptions = THEMES.map(([id, label]) => `<option value="${escapeHTML(id)}">${escapeHTML(label)}</option>`).join("");

function activityButton(target, iconName, label) {
  return `<button class="activity-button" type="button" data-shell-nav="${target}" title="${escapeHTML(label)}" aria-label="${escapeHTML(label)}">${icon(iconName)}</button>`;
}

function shellMarkup() {
  return `
    <a class="skip-link" href="#conceptScroll">Skip to ${escapeHTML(concept.title)} content</a>
    <section class="pm-shell" data-rail-open="true" data-chat-open="false" aria-label="${escapeHTML(concept.title)} standalone concept">
      <header class="shell-topbar">
        <div class="brand-lockup"><span class="brand-mark">${icon("branch")}</span><span class="brand-name">PUPPET MASTER</span></div>
        <span class="shell-page-title">Settings bakeoff · ${escapeHTML(concept.title)}</span>
        <div class="shell-top-actions">
          <details class="review-popover">
            <summary class="shell-icon-button review-trigger" aria-label="Open review settings" title="Review settings">${icon("settings")}</summary>
            <div class="review-popover-panel" aria-label="Review settings">
              <strong>Review state</strong>
              <label>Scenario<select class="shell-select" data-review="scenario">${scenarioOptions}</select></label>
              <label>Theme<select class="shell-select" data-review="theme">${themeOptions}</select></label>
              <label>Density<select class="shell-select" data-review="density"><option value="automatic">Automatic</option><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select></label>
              <label>Direction<select class="shell-select" data-review="direction"><option value="ltr">Left to right</option><option value="rtl">Right to left</option></select></label>
              <label class="check-control"><input type="checkbox" data-review="reducedMotion"> Reduce motion</label>
              <label class="check-control"><input type="checkbox" data-review="textExpansion"> 35% text expansion</label>
            </div>
          </details>
          <button class="shell-icon-button" type="button" data-shell-toggle="rail" aria-expanded="true" aria-controls="projectRail" title="Toggle project rail">${icon("rail", "Toggle project rail")}</button>
          <button class="shell-icon-button" type="button" data-shell-toggle="chat" aria-expanded="false" aria-controls="assistantPanel" title="Toggle Assistant panel">${icon("chat", "Toggle Assistant panel")}</button>
        </div>
      </header>
      <nav class="activity-bar" aria-label="Puppet Master activity">
        ${activityButton("home", "home", "Settings Home")}
        ${activityButton("settings", "settings", "Settings workspace")}
        ${activityButton("providers", "provider", "Providers, agents and models")}
        ${activityButton("memory", "memory", "Assistant memory")}
        ${activityButton("terminal", "terminal", "Terminal profiles")}
      </nav>
      <aside class="project-rail" id="projectRail" aria-label="Project rail">
        <p class="rail-heading">Current project</p>
        <div class="rail-project current"><strong>Puppet Master</strong><span>Settings concept review</span></div>
        <div class="rail-project"><strong>Plan assurance</strong><span>Read-only evidence workspace</span></div>
        <div class="rail-project"><strong>Website refresh</strong><span>2 pending changes</span></div>
      </aside>
      <main class="concept-main" id="mainContent">
        <div class="concept-scroll" id="conceptScroll" tabindex="-1" data-motion-region="scene"></div>
        <div class="receipt-region" aria-live="polite" aria-atomic="false"></div>
        <div class="sr-only" role="status" aria-live="polite" aria-atomic="true" data-announcer></div>
      </main>
      <aside class="assistant-panel" id="assistantPanel" aria-label="Assistant panel">
        <div class="assistant-head">${icon("chat")} Assistant</div>
        <div class="assistant-message">I can explain source, scope, requested and effective values, or open the exact manager record. I will not change Settings without an explicit action.</div>
        <div class="assistant-context"><strong>Review context</strong><br>${escapeHTML(concept.title)}<br>${MODEL_NAME} · Deterministic fixtures</div>
      </aside>
      <footer class="status-bar">
        <span class="status-item"><strong>${MODEL_NAME}</strong> concept</span>
        <span class="status-item optional">Local fixtures · external actions are simulated</span>
        <span class="status-spacer"></span>
        <span class="status-item" data-render-status>Ready</span>
      </footer>
    </section>`;
}

app.innerHTML = shellMarkup();
const shell = app.querySelector(".pm-shell");
const scroller = app.querySelector("#conceptScroll");
const receiptRegion = app.querySelector(".receipt-region");
const announcer = app.querySelector("[data-announcer]");
const renderStatus = app.querySelector("[data-render-status]");
const projectRail = app.querySelector("#projectRail");
const assistantPanel = app.querySelector("#assistantPanel");
const reviewPopover = app.querySelector(".review-popover");
const reviewPanel = app.querySelector(".review-popover-panel");
const reviewTrigger = app.querySelector(".review-trigger");
const renderer = createViewRenderer({ store, conceptId, concept });
const motion = createMotionCoordinator({ root: app, getReducedMotion: () => store.state.reducedMotion });

let observer = null;
let renderRevision = 0;
let renderPromise = Promise.resolve();
const renderTasks = new Set();
let controlledScroll = null;
let pendingHint = null;
let spellOrigin = null;
let managerOrigin = null;
let managerDrillMode = "master";
let destroyed = false;
let lastMotionResult = null;
let applyingHistory = false;
let lastRouteHash = "";
let unsubscribeStore = null;
let responsiveFrame = 0;
let transientFrame = 0;
let transientBatchPromise = null;
let resolveTransientBatch = null;
let activeSurfaceKey = null;
const queuedFrames = new Set();
const pendingTransientEvents = new Map();

const RENDER_SCOPE_NAMES = ["search", "setting", "manager", "manager_status", "detail", "scrollspy", "shell", "receipts"];
const renderStats = {
  kind: "concept-only-render-instrumentation",
  event_count: 0,
  full_scene_commits: 0,
  scope_patches: Object.fromEntries(RENDER_SCOPE_NAMES.map((scope) => [scope, 0])),
  superseded_count: 0,
  last_scope: "initial",
  revision: 0
};

function renderStatsSnapshot() {
  return {
    ...renderStats,
    scope_patches: { ...renderStats.scope_patches },
    disclaimer: "Direct-browser concept render counters; not native Slint or production runtime metrics."
  };
}

function resetRenderStats() {
  renderStats.event_count = 0;
  renderStats.full_scene_commits = 0;
  renderStats.superseded_count = 0;
  renderStats.last_scope = "reset";
  renderStats.revision = Number(store.state.revision || 0);
  for (const scope of RENDER_SCOPE_NAMES) renderStats.scope_patches[scope] = 0;
  return renderStatsSnapshot();
}

// Concept harness only: exposing counters on the store makes isolated browser
// probes possible without implying that SettingsStore owns production telemetry.
store.renderStats = renderStatsSnapshot;
store.resetRenderStats = resetRenderStats;

function recordCommit(scope, event = null) {
  if (scope === "full_scene") renderStats.full_scene_commits += 1;
  else if (scope in renderStats.scope_patches) renderStats.scope_patches[scope] += 1;
  renderStats.last_scope = scope;
  renderStats.revision = Number(event?.revision ?? store.state.revision ?? renderStats.revision);
  app.dataset.lastRenderScope = scope;
}

function requestTrackedFrame(callback) {
  const id = requestAnimationFrame((time) => {
    queuedFrames.delete(id);
    callback(time);
  });
  queuedFrames.add(id);
  return id;
}

function cancelTrackedFrame(id) {
  if (!id) return;
  cancelAnimationFrame(id);
  queuedFrames.delete(id);
}

function syncReviewPopover() {
  const open = Boolean(reviewPopover?.open);
  if (reviewPanel) reviewPanel.inert = !open;
  reviewTrigger?.setAttribute("aria-expanded", String(open));
}
syncReviewPopover();
reviewPopover?.addEventListener("toggle", syncReviewPopover);

function nextFrame() {
  return new Promise((resolve) => requestTrackedFrame(resolve));
}

function cssEscape(value) {
  if (window.CSS?.escape) return window.CSS.escape(String(value));
  return String(value).replace(/[^a-zA-Z0-9_-]/g, (character) => `\\${character}`);
}

function focusSnapshot() {
  const active = document.activeElement;
  if (!active || !app.contains(active)) return null;
  const key = active.dataset.focusKey || null;
  const selection = typeof active.selectionStart === "number" ? [active.selectionStart, active.selectionEnd] : null;
  return {
    key,
    id: active.id || null,
    name: active.getAttribute("name"),
    searchSurface: active.dataset.searchSurface || null,
    setting: active.dataset.settingText || active.dataset.settingNumber || active.dataset.settingRange || active.dataset.settingSelect || active.dataset.settingToggle || null,
    terminal: active.dataset.terminalField || null,
    modelAlias: active.dataset.modelAlias || null,
    selection
  };
}

function restoreFocus(snapshot, fallback = null) {
  if (!snapshot && !fallback) return false;
  let target = null;
  if (snapshot?.key) target = app.querySelector(`[data-focus-key="${cssEscape(snapshot.key)}"]`);
  if (!target && snapshot?.id) target = document.getElementById(snapshot.id);
  if (!target && snapshot?.searchSurface) target = app.querySelector(`[data-search-input][data-search-surface="${cssEscape(snapshot.searchSurface)}"]`);
  if (!target && snapshot?.setting) target = app.querySelector(`[data-setting-text="${cssEscape(snapshot.setting)}"],[data-setting-number="${cssEscape(snapshot.setting)}"],[data-setting-range="${cssEscape(snapshot.setting)}"],[data-setting-select="${cssEscape(snapshot.setting)}"],[data-setting-toggle="${cssEscape(snapshot.setting)}"]`);
  if (!target && snapshot?.terminal) target = app.querySelector(`[data-terminal-field="${cssEscape(snapshot.terminal)}"]`);
  if (!target && snapshot?.modelAlias) target = app.querySelector(`[data-model-alias="${cssEscape(snapshot.modelAlias)}"]`);
  if (!target && fallback) target = app.querySelector(fallback);
  if (!target || target.hidden || target.closest("[inert]")) return false;
  try { target.focus({ preventScroll: true }); } catch { target.focus(); }
  if (snapshot?.selection && typeof target.setSelectionRange === "function") {
    try { target.setSelectionRange(snapshot.selection[0], snapshot.selection[1]); } catch { /* input type may not support selection */ }
  }
  return document.activeElement === target;
}

function parsedView() {
  const template = document.createElement("template");
  template.innerHTML = renderer.view().trim();
  return template.content;
}

function addRole(selector, role) {
  for (const element of scroller.querySelectorAll(selector)) {
    const roles = new Set(String(element.dataset.motionRole || "").split(/\s+/).filter(Boolean));
    roles.add(role);
    element.dataset.motionRole = [...roles].join(" ");
  }
}

function decorateMotionRoles() {
  addRole("[data-search-results] .search-result", "search-result");
  addRole(".setting-row", "setting");
  addRole(".setting-section", "section");
  addRole(".advanced-group,.domain-details,.manager-evidence-disclosure,.more-actions", "disclosure");
  addRole(".model-row,.resource-row,.ledger-resource-row,.installation-row", "reorder-item");
  addRole(".provider-list,.manager-master,.manager-tabs,.installation-list", "source");
  addRole(".model-board,.manager-content,.installation-board,.operation-flow", "catalogue");
  addRole(".operation-flow,.flow-stages,.flow-choice", "transaction");
  addRole(".theme-studio,.theme-gallery,.sound-studio,.sound-wave", "preview");
  addRole(".fixture-tray,.persistence-bar", "review-state");
  addRole(".detail-panel,.catalogue-inspector", "evidence");
  addRole(".drawer-backdrop", "drawer-backdrop");
  addRole("#categoryNavigator", "drawer");
  addRole("#workspaceInspector", "drawer");
  if (conceptId === "index-house") {
    addRole(".ih-home-head,.workspace-head,.manager-head", "address");
    addRole(".ih-destinations,.category-nav,.manager-master", "directory");
    addRole(".home-attention,.settings-document,.manager-stage-root", "document");
    addRole(".home-history,.workspace-inspector,.manager-detail,.catalogue-inspector", "inspector inspector-field");
    addRole("[aria-current='location']", "address-marker");
    addRole(".model-row,.capability-list,.provider-refresh-progress [data-refresh-stage='readiness']", "evidence");
    addRole(".provider-refresh-progress [data-refresh-stage='connection']", "source");
  } else if (conceptId === "switchboard") {
    addRole(".sb-console,.manager-tabs,.sb-signal-track,.sb-topology-map,.topology-link", "signal signal-marker");
    addRole(".sb-bays,.sb-station-bar,.manager-master,.sb-state-tray", "station instrument");
    addRole(".sb-alerts,.settings-document,.manager-content", "board");
    addRole(".manager-tabs,.model-board>.section-heading,.topology-node.source", "connection");
    addRole(".manager-content,.model-board", "catalogue");
    addRole(".provider-overview,.capability-list,.support-board,.model-board", "readiness");
    addRole(".setting-row", "instrument");
  } else if (conceptId === "wayfinder") {
    addRole(".wf-routes,.wf-journey-map,.wf-route-line,.journey-steps", "route-line route");
    addRole(".wf-route,.wf-route-banner,.manager-master,.model-row,[aria-current='location']", "waypoint waypoint-current");
    addRole(".home-attention,.setting-section,.setting-row,.manager-detail,.model-row", "checkpoint");
    addRole(".wf-checkpoint-nav [aria-current='location']", "route-marker");
    addRole(".advanced-group,.domain-details,.journey-branch", "route-branch");
    addRole(".journey-steps li:nth-child(3),.capability-list,.provider-refresh-progress", "verify");
    addRole(".journey-steps li:last-child,.model-board", "ready");
    addRole(".wf-journey-map>[data-home]", "route-map");
  } else {
    addRole(".lg-masthead,.workspace-head,.manager-head", "folio");
    addRole(".lg-directory,.ledger-heading", "register outline");
    addRole(".settings-document,.manager-detail", "text");
    addRole(".lg-table-head,.lg-column-head,.lg-minimap,.ledger-heading", "rule");
    addRole(".lg-table-row,.setting-row,.ledger-resource-row,.resource-row,.model-row", "ledger-row row");
    addRole(".lg-minimap [aria-current='location'],.catalogue-inspector", "margin-note");
    addRole(".disclosure-body,.manager-detail", "ledger-detail");
    addRole(".model-board>.section-heading,.manager-tabs", "source");
    addRole(".value-comparison,.route-comparison,.model-board,.detail-panel", "effective");
  }
}

function captureManagerOrigin(element) {
  managerOrigin = element?.dataset.focusKey || element?.dataset.provider && `provider:${element.dataset.provider}` || element?.dataset.memory && `memory:${element.dataset.memory}` || element?.dataset.terminal && `terminal:${element.dataset.terminal}` || element?.dataset.managerResource && `manager-resource:${element.dataset.managerResource.split(":").slice(1).join(":")}` || null;
}

function restoreManagerOrigin() {
  const target = managerOrigin ? scroller.querySelector(`[data-focus-key="${cssEscape(managerOrigin)}"]`) : null;
  target?.focus({ preventScroll: true });
}

function applyManagerDrill() {
  const root = scroller.querySelector(".manager-stage-root");
  if (!root) return;
  const narrow = matchMedia("(max-width: 980px)").matches;
  if (!narrow) {
    root.removeAttribute("data-drill-mode");
    root.querySelector("[data-drill-back]")?.remove();
    return;
  }
  root.dataset.drillMode = managerDrillMode;
  if (managerDrillMode === "detail" && !root.querySelector("[data-drill-back]")) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiet-button drill-back";
    button.dataset.drillBack = "";
    button.innerHTML = `${icon("arrow")} Back to ${escapeHTML(store.state.managerId === "providers" ? "providers" : store.state.managerId === "memory" ? "Gists" : store.state.managerId === "terminal" ? "profiles" : "inventory")}`;
    root.prepend(button);
  }
}

function replaceFromFresh(selector, focus = true) {
  const current = scroller.querySelector(selector);
  if (!current) return false;
  const snapshot = focus ? focusSnapshot() : null;
  const fresh = parsedView().querySelector(selector);
  if (!fresh) return false;
  current.replaceWith(fresh);
  if (snapshot) restoreFocus(snapshot);
  return true;
}

function renderScene({ preserveScroll = false, preserveFocus = false, event = null } = {}) {
  const scrollTop = scroller.scrollTop;
  const snapshot = preserveFocus ? focusSnapshot() : null;
  scroller.innerHTML = renderer.view();
  const view = scroller.firstElementChild;
  if (view) {
    view.dataset.motionRegion = "scene";
    if (!view.dataset.motionRole) view.dataset.motionRole = "content";
  }
  if (preserveScroll) scroller.scrollTop = scrollTop;
  if (snapshot) restoreFocus(snapshot);
  decorateMotionRoles();
  applyManagerDrill();
  if (store.state.screen === "workspace") patchNavigator();
  if (store.state.screen === "workspace") patchInspectorDrawer();
  recordCommit("full_scene", event);
}

function patchSetting(settingId, event = null) {
  const entry = store.settings.get(settingId);
  const current = scroller.querySelector(`[data-setting-id="${cssEscape(settingId)}"]`);
  if (!entry || !current) return false;
  const snapshot = focusSnapshot();
  const template = document.createElement("template");
  template.innerHTML = renderer.settingRow(entry).trim();
  current.replaceWith(template.content.firstElementChild);
  restoreFocus(snapshot, `[data-setting-id="${cssEscape(settingId)}"]`);
  decorateMotionRoles();
  recordCommit("setting", event);
  return true;
}

function patchSearch(event = null) {
  const surface = store.state.search.surface;
  const current = scroller.querySelector(`[data-search-shell][data-search-surface="${cssEscape(surface)}"]`);
  if (!current) return false;
  const snapshot = focusSnapshot();
  const template = document.createElement("template");
  template.innerHTML = renderer.search(surface).trim();
  const fresh = template.content.firstElementChild;
  for (const className of current.classList) fresh.classList.add(className);
  current.replaceWith(fresh);
  restoreFocus(snapshot, `[data-search-input][data-search-surface="${cssEscape(surface)}"]`);
  decorateMotionRoles();
  recordCommit("search", event);
  return true;
}

function patchScrollspy(event = null) {
  for (const button of scroller.querySelectorAll("[data-subcategory]")) {
    const active = button.dataset.subcategory === store.state.subcategoryId;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "location");
    else button.removeAttribute("aria-current");
  }
  if (conceptId === "index-house") {
    const current = scroller.querySelector(".workspace-inspector");
    if (current) {
      const snapshot = focusSnapshot();
      const template = document.createElement("template");
      template.innerHTML = renderer.inspector(categoryById(store.state.categoryId)).trim();
      current.replaceWith(template.content.firstElementChild);
      restoreFocus(snapshot, "[data-focus-key=\"inspector-heading\"]");
      patchInspectorDrawer();
    }
  }
  decorateMotionRoles();
  recordCommit("scrollspy", event);
}

function patchNavigator() {
  const nav = scroller.querySelector("#categoryNavigator");
  const narrow = app.querySelector(".concept-main")?.clientWidth <= 980;
  if (nav) {
    nav.classList.toggle("open", store.state.navigationOpen);
    nav.dataset.open = String(store.state.navigationOpen);
    if (!narrow || store.state.navigationOpen) nav.removeAttribute("inert");
    else nav.setAttribute("inert", "");
  }
  const backdrop = scroller.querySelector("[data-nav-dismiss]");
  if (backdrop) {
    backdrop.classList.toggle("open", store.state.navigationOpen && narrow);
    backdrop.dataset.open = String(store.state.navigationOpen && narrow);
    backdrop.setAttribute("aria-hidden", String(!(store.state.navigationOpen && narrow)));
    backdrop.inert = !(store.state.navigationOpen && narrow);
  }
  const toggle = scroller.querySelector("[data-nav-toggle]");
  toggle?.setAttribute("aria-expanded", String(store.state.navigationOpen));
  decorateMotionRoles();
}

function patchInspectorDrawer() {
  if (conceptId !== "index-house") return;
  const mainWidth = app.querySelector(".concept-main")?.clientWidth || 0;
  const medium = mainWidth > 760 && mainWidth <= 1100;
  const open = Boolean(store.state.inspectorOpen && medium);
  const inspector = scroller.querySelector("#workspaceInspector");
  if (inspector) {
    inspector.classList.toggle("open", open);
    inspector.dataset.drawerOpen = String(open);
    inspector.inert = Boolean(medium && !open);
    inspector.setAttribute("aria-hidden", String(medium && !open));
    if (medium && open) {
      inspector.setAttribute("role", "dialog");
      inspector.setAttribute("aria-modal", "true");
      inspector.setAttribute("aria-label", "Evidence inspector");
    } else {
      inspector.removeAttribute("role");
      inspector.removeAttribute("aria-modal");
      inspector.removeAttribute("aria-label");
    }
  }
  const backdrop = scroller.querySelector(".ih-inspector-backdrop");
  if (backdrop) {
    backdrop.classList.toggle("open", open);
    backdrop.dataset.open = String(open);
    backdrop.setAttribute("aria-hidden", String(!open));
    backdrop.inert = !open;
  }
  for (const element of scroller.querySelectorAll(".ih-workspace-view > .workspace-head, .ih-workspace > .settings-document")) {
    element.inert = open;
  }
  const navigator = scroller.querySelector(".ih-workspace > #categoryNavigator");
  if (navigator) navigator.inert = open || mainWidth <= 980 && !store.state.navigationOpen;
  const toggle = scroller.querySelector("[data-inspector-toggle]");
  toggle?.setAttribute("aria-expanded", String(open));
  decorateMotionRoles();
}

function patchFreshSelectors(selectors, scope, event = null) {
  const snapshot = focusSnapshot();
  const fresh = parsedView();
  let patched = false;
  for (const selector of selectors) {
    const currentItems = [...scroller.querySelectorAll(selector)];
    const replacementItems = [...fresh.querySelectorAll(selector)];
    const count = Math.min(currentItems.length, replacementItems.length);
    for (let index = 0; index < count; index += 1) {
      currentItems[index].replaceWith(replacementItems[index].cloneNode(true));
      patched = true;
    }
  }
  if (!patched) return false;
  restoreFocus(snapshot);
  decorateMotionRoles();
  applyManagerDrill();
  recordCommit(scope, event);
  return true;
}

function patchManager(event = null) {
  const snapshot = focusSnapshot();
  const fresh = parsedView();
  for (const selector of [".manager-tabs", ".manager-stage-root"]) {
    const current = scroller.querySelector(selector);
    const replacement = fresh.querySelector(selector);
    if (current && replacement) current.replaceWith(replacement.cloneNode(true));
  }
  restoreFocus(snapshot);
  decorateMotionRoles();
  applyManagerDrill();
  recordCommit("manager", event);
}

function patchManagerSearch(event = null) {
  return patchFreshSelectors([".manager-master"], "search", event);
}

function patchManagerStatus(event = null) {
  return patchFreshSelectors([
    ".manager-detail",
    ".provider-refresh-progress",
    ".inline-operation[role='status']",
    ".catalogue-inspector"
  ], "manager_status", event);
}

function patchManagerSelection(event = null) {
  const listPatched = patchFreshSelectors([".manager-master"], "manager", event);
  const detailPatched = patchFreshSelectors([".manager-detail", ".catalogue-inspector"], "detail", event);
  return listPatched || detailPatched;
}

function patchManagerDetail(event = null) {
  return patchFreshSelectors([".manager-detail", ".catalogue-inspector", ".installation-detail"], "detail", event);
}

function patchSpellDemo() {
  const current = scroller.querySelector(".spell-demo");
  if (!current) return false;
  const snapshot = focusSnapshot();
  const template = document.createElement("template");
  template.innerHTML = renderer.spellDemo().trim();
  current.replaceWith(template.content.firstElementChild);
  if (store.state.spellMenuOpen) {
    const item = scroller.querySelector(`[data-spell-menu] [role="menuitem"]:nth-child(${Number(store.state.spellMenuIndex || 0) + 1})`);
    item?.focus({ preventScroll: true });
  } else restoreFocus(snapshot);
  decorateMotionRoles();
  return true;
}

function renderReceipts(event = null) {
  const receipts = store.state.receipts.slice(-4);
  receiptRegion.innerHTML = receipts.map((receipt) => `<article class="receipt ${escapeHTML(toneFor(receipt.tone))}" data-receipt-id="${escapeHTML(receipt.id)}">
    <span aria-hidden="true">${icon(receipt.simulation ? "notice" : receipt.tone === "warning" ? "notice" : "check")}</span>
    <div><strong>${escapeHTML(receipt.title)}${receipt.simulation ? " · Simulation" : ""}</strong><p>${escapeHTML(receipt.message)}</p>${receipt.action === "undo-memory-discard" ? `<button type="button" class="text-button" data-memory-undo>Undo discard</button>` : ""}</div>
    <button type="button" class="icon-action" data-receipt-dismiss="${escapeHTML(receipt.id)}" aria-label="Dismiss ${escapeHTML(receipt.title)}">${icon("close")}</button>
  </article>`).join("");
  recordCommit("receipts", event);
}

function syncShell(event = null) {
  shell.dataset.railOpen = String(store.state.railOpen);
  shell.dataset.chatOpen = String(store.state.chatOpen);
  const railButton = app.querySelector('[data-shell-toggle="rail"]');
  const chatButton = app.querySelector('[data-shell-toggle="chat"]');
  railButton?.setAttribute("aria-expanded", String(store.state.railOpen));
  chatButton?.setAttribute("aria-expanded", String(store.state.chatOpen));
  projectRail.inert = !store.state.railOpen;
  assistantPanel.inert = !store.state.chatOpen;
  projectRail.setAttribute("aria-hidden", String(!store.state.railOpen));
  assistantPanel.setAttribute("aria-hidden", String(!store.state.chatOpen));
  const values = {
    scenario: store.state.scenario,
    theme: store.state.theme,
    density: store.state.density,
    direction: store.state.presentation.direction
  };
  for (const [name, value] of Object.entries(values)) {
    const control = app.querySelector(`[data-review="${name}"]`);
    if (control && control.value !== String(value)) control.value = String(value);
  }
  const reduced = app.querySelector('[data-review="reducedMotion"]');
  if (reduced) reduced.checked = store.state.reducedMotionOverride === true;
  const expanded = app.querySelector('[data-review="textExpansion"]');
  if (expanded) expanded.checked = Number(store.state.presentation.textScale) > 1;
  document.documentElement.style.colorScheme = /-dark$/.test(store.state.theme) ? "dark" : "light";
  updateActivity();
  recordCommit("shell", event);
}

function updateActivity() {
  const dedicatedManagerItems = new Set(["providers", "memory", "terminal"]);
  const active = store.state.screen === "home" ? "home" : store.state.screen === "workspace" ? "settings" : dedicatedManagerItems.has(store.state.managerId) ? store.state.managerId : "settings";
  for (const button of app.querySelectorAll("[data-shell-nav]")) {
    const isActive = button.dataset.shellNav === active;
    button.classList.toggle("active", isActive);
    if (isActive) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  }
}

function announce(message) {
  if (!message) return;
  announcer.textContent = "";
  requestTrackedFrame(() => { if (!destroyed) announcer.textContent = message; });
}

function notifyRendered(event) {
  renderRevision += 1;
  app.dataset.renderRevision = String(renderRevision);
  app.dataset.renderAction = event?.action || "initial";
  app.dataset.qaScenario = store.state.scenario;
  renderStatus.textContent = `Revision ${renderRevision} · ${event?.action || "ready"}`;
  window.dispatchEvent(new CustomEvent("pm-settings-rendered", { detail: { revision: renderRevision, action: event?.action || "initial", scopes: event?.scopes || [] } }));
}

function motionKind(event) {
  const action = event?.action || "state";
  if (action === "navigate") return "navigate";
  if (action === "category") return "category";
  if (action === "scrollspy") return "scrollspy";
  if (action === "jump") return "jump";
  if (action === "search") return "search";
  if (action === "navigation" || action === "inspector") return "drawer";
  if (action === "disclosure" || action === "manager-tab" || /select/.test(action)) return "disclosure";
  if (/refresh/.test(action)) return "refresh";
  if (["manager-flow", "provider-installation", "fixture"].includes(action)) return "transaction";
  if (action === "theme-preview" || event?.scopes?.includes("preview")) return "preview";
  if (event?.motionKey?.includes("move") || event?.motionKey?.includes("reorder")) return "reorder";
  if (action === "scenario" || action === "review.apply") return "category";
  return "save";
}

function motionTargetKey(event, hint) {
  if (hint?.settingId) return `setting:${hint.settingId}`;
  if (hint?.subcategoryId) return `subcategory:${hint.subcategoryId}`;
  if (hint?.modelId) return `model:${hint.modelId}`;
  return event?.motionKey;
}

function commitForEvent(event, hint) {
  const scopes = new Set(event?.scopes || []);
  if (event?.action === "focus-consumed") return () => {};
  if (event?.action === "list-window") return () => patchManager(event);
  if (scopes.has("route") || event?.action === "scenario" || event?.action === "review.apply" || scopes.has("view") && scopes.has("data")) {
    return () => renderScene({ event });
  }
  if (event?.action === "scrollspy" || event?.action === "jump") return () => patchScrollspy(event);
  if (event?.action === "navigation" || event?.action === "inspector") return () => { patchNavigator(); patchInspectorDrawer(); };
  if (scopes.has("search")) return () => {
    if (store.state.screen === "manager") patchManagerSearch(event);
    else patchSearch(event);
  };
  if (scopes.has("setting") && hint?.settingId) return () => { if (!patchSetting(hint.settingId, event)) renderScene({ preserveScroll: true, preserveFocus: true, event }); };
  if (scopes.has("presentation") && scopes.has("settings")) return () => {
    for (const id of ["experience.appearance.theme", "experience.appearance.motion", "experience.appearance.density"]) patchSetting(id, event);
  };
  if (scopes.has("spelling")) return () => { if (!patchSpellDemo()) patchManagerDetail(event); };
  if (scopes.has("refresh") || scopes.has("manager_status") || /observable|work-status/.test(event?.action || "")) return () => patchManagerStatus(event);
  if (/select/.test(event?.action || "") || scopes.has("detail") && !scopes.has("manager")) return () => patchManagerSelection(event);
  if (scopes.has("preview") || scopes.has("terminal") || scopes.has("memory")) return () => patchManagerDetail(event);
  if (scopes.has("models")) return () => {
    if (!patchFreshSelectors([".model-board"], "manager", event)) patchManagerDetail(event);
  };
  if (scopes.has("manager") || scopes.has("provider") || scopes.has("roles")) return () => patchManager(event);
  return () => {};
}

async function performControlledScroll(subcategoryId) {
  const target = scroller.querySelector(`#section-${cssEscape(subcategoryId)}`);
  if (!target) return;
  const token = Symbol("scroll");
  const previous = controlledScroll;
  if (previous) previous.cancelled = true;
  controlledScroll = { token, cancelled: false };
  const header = scroller.querySelector(".workspace-head");
  const offset = (header?.getBoundingClientRect().height || 0) + 18;
  const top = Math.max(0, scroller.scrollTop + target.getBoundingClientRect().top - scroller.getBoundingClientRect().top - offset);
  scroller.scrollTo({ top, behavior: store.state.reducedMotion ? "auto" : "smooth" });
  await new Promise((resolve) => {
    let timer = 0;
    const finish = () => {
      clearTimeout(timer);
      scroller.removeEventListener("scrollend", finish);
      resolve();
    };
    timer = window.setTimeout(finish, store.state.reducedMotion ? 40 : 720);
    scroller.addEventListener("scrollend", finish, { once: true });
  });
  if (controlledScroll?.token === token) controlledScroll = null;
}

async function applyFocusRequest(request) {
  if (!request || store.state.focusRequest?.requestId !== request.requestId) return;
  await nextFrame();
  await nextFrame();
  let target = request.selector ? scroller.querySelector(request.selector) : null;
  if (store.state.screen === "manager" && managerDrillMode === "detail" && matchMedia("(max-width: 980px)").matches) target = scroller.querySelector(".manager-detail h2, .manager-detail [tabindex='-1']") || target;
  if (!target && request.kind === "setting") target = scroller.querySelector(`#setting-${cssEscape(request.id)}`);
  if (!target && request.kind === "heading") target = scroller.querySelector("[data-view-heading], h1");
  if (!target) target = scroller.querySelector("[data-view-heading], h1");
  if (target) {
    if (!request.preventScroll) {
      const header = scroller.querySelector(".workspace-head");
      const offset = (header?.getBoundingClientRect().height || 0) + 18;
      const top = Math.max(0, scroller.scrollTop + target.getBoundingClientRect().top - scroller.getBoundingClientRect().top - offset);
      scroller.scrollTo({ top, behavior: store.state.reducedMotion ? "auto" : "smooth" });
      if (!store.state.reducedMotion) await new Promise((resolve) => setTimeout(resolve, 280));
    }
    try { target.focus({ preventScroll: true }); } catch { target.focus(); }
    target.classList.add("focus-arrival");
    window.setTimeout(() => target.classList.remove("focus-arrival"), store.state.reducedMotion ? 110 : 650);
  }
  store.consumeFocusRequest(request.requestId);
}

function performRenderEvent(event, hint = null) {
  if (event?.action === "navigate" && store.state.screen === "manager") managerDrillMode = event.focusRequest?.kind === "resource" ? "detail" : "master";
  if (event?.action === "navigate") motion.cancel("search");
  const task = (async () => {
    if (destroyed) return;
    const commit = commitForEvent(event, hint);
    const kind = motionKind(event);
    const beforeRects = kind === "reorder" ? captureMotionRects(scroller) : null;
    app.dataset.qaMotionStage = `${conceptId}:${kind}:start`;
    const motionResult = await motion.run({
      kind,
      region: event?.scopes?.includes("search") ? "search" : event?.scopes?.includes("manager") || store.state.screen === "manager" ? "manager" : "scene",
      key: motionTargetKey(event, hint),
      beforeRects,
      commit,
      waitFor: event?.action === "jump" && hint?.subcategoryId ? () => performControlledScroll(hint.subcategoryId) : null,
      viewTransition: event?.action === "navigate" && event?.motionKey?.includes("destination-workspace")
    });
    lastMotionResult = motionResult;
    app.dataset.qaMotionParticipants = String(motionResult.participants || 0);
    app.dataset.qaMotionRoles = Object.keys(motionResult.roles || {}).join(" ");
    app.dataset.qaMotionStage = `${conceptId}:${kind}:${motionResult.status}`;
    const scopes = new Set(event?.scopes || []);
    if (scopes.has("shell") || scopes.has("presentation") || scopes.has("route") || event?.action === "scenario" || event?.action === "review.apply") syncShell(event);
    if (scopes.has("receipts")) renderReceipts(event);
    setupScrollspy();
    await applyFocusRequest(event?.focusRequest);
    announce(event?.announcement);
    notifyRendered(event);
  })().catch((error) => {
    console.error("5.6 Sol render transaction failed", error);
    renderStatus.textContent = "Render error";
  });
  renderTasks.add(task);
  task.finally(() => renderTasks.delete(task));
  renderPromise = task;
  return task;
}

function transientKey(event, hint) {
  const scopes = new Set(event?.scopes || []);
  if (scopes.has("search")) return store.state.screen === "manager" ? "manager-search" : `search:${store.state.search?.surface || "current"}`;
  if (event?.action === "scrollspy") return "scrollspy";
  if (scopes.has("refresh") || scopes.has("manager_status") || /observable|work-status/.test(event?.action || "")) return "manager-status";
  if (/select/.test(event?.action || "") || scopes.has("detail")) return "manager-selection";
  if (scopes.has("setting") && hint?.settingId) return `setting:${hint.settingId}`;
  if (scopes.has("preview")) return "preview";
  return null;
}

function flushTransientEvents() {
  transientFrame = 0;
  const records = [...pendingTransientEvents.values()];
  pendingTransientEvents.clear();
  const batchResolve = resolveTransientBatch;
  resolveTransientBatch = null;
  transientBatchPromise = null;
  const batchTask = records.reduce((chain, record) => chain.then(() => performRenderEvent(record.event, record.hint)), Promise.resolve());
  batchTask.finally(() => batchResolve?.());
}

function enqueueEvent(event, hint = pendingHint) {
  renderStats.event_count += 1;
  renderStats.revision = Number(event?.revision ?? store.state.revision ?? renderStats.revision);
  if (event?.action === "focus-consumed") return Promise.resolve();
  const key = transientKey(event, hint);
  if (!key) {
    if (pendingTransientEvents.size) {
      renderStats.superseded_count += pendingTransientEvents.size;
      pendingTransientEvents.clear();
      cancelTrackedFrame(transientFrame);
      transientFrame = 0;
      resolveTransientBatch?.();
      resolveTransientBatch = null;
      transientBatchPromise = null;
    }
    return performRenderEvent(event, hint);
  }
  if (pendingTransientEvents.has(key)) renderStats.superseded_count += 1;
  pendingTransientEvents.set(key, { event, hint });
  if (!transientBatchPromise) transientBatchPromise = new Promise((resolve) => { resolveTransientBatch = resolve; });
  if (!transientFrame) transientFrame = requestTrackedFrame(flushTransientEvents);
  renderPromise = transientBatchPromise;
  return transientBatchPromise;
}

function selectedSurfaceKey() {
  if (document.hidden || store.state.screen !== "manager") return null;
  const managerId = store.state.managerId || "providers";
  const resourceId = managerId === "providers" ? store.state.selectedProviderId : managerId === "memory" ? store.state.selectedMemoryId : managerId === "terminal" ? store.state.selectedTerminalId : store.state.selectedManagerResource?.[managerId];
  return `${managerId}:${resourceId || "summary"}`;
}

function callStoreMethod(names, ...args) {
  for (const name of names) {
    if (typeof store[name] === "function") return store[name](...args);
  }
  return undefined;
}

function releaseSelectedSurfaces(reason = "inactive") {
  if (activeSurfaceKey) {
    callStoreMethod(["releaseSelectedDetailSubscription", "releaseDetailSubscription"], { key: activeSurfaceKey, reason });
    const released = callStoreMethod(["releaseSelectedManagerSubscription", "releaseManagerSubscription"], { key: activeSurfaceKey, reason });
    if (released === undefined) callStoreMethod(["_setActiveManagerSubscription"], null);
    activeSurfaceKey = null;
  }
  callStoreMethod(["stopDecorativeWork", "pauseDecorativeWork"], { reason });
  if (store.state.soundPreview?.state === "playing") callStoreMethod(["stopSoundPreview"], reason);
}

function reconcileSelectedSurfaces(reason = "state") {
  const nextKey = selectedSurfaceKey();
  if (nextKey === activeSurfaceKey) return;
  releaseSelectedSurfaces(reason);
  if (!nextKey) return;
  activeSurfaceKey = nextKey;
  const acquired = callStoreMethod(["acquireSelectedManagerSubscription", "acquireManagerSubscription"], { key: nextKey, shared: true, reason });
  if (acquired === undefined) callStoreMethod(["_setActiveManagerSubscription"], nextKey.split(":", 1)[0]);
  callStoreMethod(["acquireSelectedDetailSubscription", "acquireDetailSubscription"], { key: nextKey, shared: true, reason });
  callStoreMethod(["resumeDecorativeWork", "startDecorativeWork"], { reason });
}

unsubscribeStore = store.subscribe((_state, event) => {
  syncRouteHistory(event);
  reconcileSelectedSurfaces(event?.action || "state");
  enqueueEvent(event, pendingHint);
});

function setupScrollspy() {
  observer?.disconnect();
  observer = null;
  if (store.state.screen !== "workspace" || !window.IntersectionObserver) return;
  const sections = [...scroller.querySelectorAll("[data-spy-section]")];
  if (!sections.length) return;
  const ratios = new Map();
  observer = new IntersectionObserver((entries) => {
    if (controlledScroll) return;
    for (const entry of entries) ratios.set(entry.target.dataset.spySection, entry.isIntersecting ? entry.intersectionRatio : 0);
    const active = [...ratios].sort((a, b) => b[1] - a[1])[0];
    if (active?.[1] > 0.08 && active[0] !== store.state.subcategoryId) store.setSubcategory(active[0], "scrollspy");
  }, { root: scroller, rootMargin: "-18% 0px -62% 0px", threshold: [0.08, 0.25, 0.5, 0.75] });
  sections.forEach((section) => observer.observe(section));
}

function dispatch(action, hint = null) {
  pendingHint = hint;
  const result = store.dispatch(action);
  queueMicrotask(() => { if (pendingHint === hint) pendingHint = null; });
  if (result && typeof result.then === "function") return result;
  return Promise.resolve(result);
}

function encodeRouteSegment(value) {
  return encodeURIComponent(String(value || ""));
}

function routeHash(event = null) {
  if (store.state.screen === "home") return "#home";
  if (store.state.screen === "workspace") {
    if (event?.focusRequest?.kind === "setting" && event.focusRequest.id) return `#setting/${encodeRouteSegment(event.focusRequest.id)}`;
    return `#category/${encodeRouteSegment(store.state.categoryId)}/${encodeRouteSegment(store.state.subcategoryId || "")}`;
  }
  if (store.state.screen === "manager") {
    const managerId = store.state.managerId || "providers";
    const tab = store.state.managerTab || "overview";
    const params = new URLSearchParams();
    let resourceId = null;
    let childResourceId = null;
    if (managerId === "providers") {
      resourceId = store.state.selectedProviderId;
      childResourceId = tab === "installations" ? store.state.selectedInstallationId : tab === "accounts" ? store.state.selectedAccountId : null;
    } else if (managerId === "memory") resourceId = store.state.selectedMemoryId;
    else if (managerId === "terminal") resourceId = store.state.selectedTerminalId;
    else resourceId = store.state.selectedManagerResource?.[managerId] || null;
    if (resourceId) params.set("resource", resourceId);
    if (childResourceId) params.set("child", childResourceId);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return `#manager/${encodeRouteSegment(managerId)}/${encodeRouteSegment(tab)}${suffix}`;
  }
  return "#home";
}

function syncRouteHistory(event) {
  if (applyingHistory || !event) return;
  const routeActions = new Set(["navigate", "category", "manager-tab", "manager-resource", "manager-select", "provider-installation"]);
  if (!routeActions.has(event.action)) return;
  const nextHash = routeHash(event);
  if (!nextHash || nextHash === lastRouteHash && window.location.hash === nextHash) return;
  const replace = !lastRouteHash || event.action === "manager-resource" || event.action === "manager-select" || event.action === "provider-installation";
  window.history[replace ? "replaceState" : "pushState"]({ conceptId, route: nextHash }, "", nextHash);
  lastRouteHash = nextHash;
}

async function applyDeepLink(hash = window.location.hash || "#home") {
  const value = String(hash || "#home").replace(/^#/, "");
  const [path, query = ""] = value.split("?");
  const parts = path.split("/").map((part) => decodeURIComponent(part || ""));
  const params = new URLSearchParams(query);
  applyingHistory = true;
  try {
    if (parts[0] === "home" || !parts[0]) await dispatch({ type: "navigate.home" });
    else if (parts[0] === "setting" && parts[1]) await dispatch({ type: "navigate.setting", settingId: parts[1] });
    else if (parts[0] === "category" && parts[1]) await dispatch({ type: "navigate.category", categoryId: parts[1], subcategoryId: parts[2] || null });
    else if (parts[0] === "manager" && parts[1]) {
      managerDrillMode = params.get("resource") ? "detail" : "master";
      await dispatch({
        type: "navigate.manager",
        managerId: parts[1],
        tab: parts[2] || "overview",
        resourceId: params.get("resource") || null,
        childResourceId: params.get("child") || null
      });
    } else await dispatch({ type: "navigate.home" });
    lastRouteHash = routeHash();
    if (window.location.hash !== lastRouteHash) window.history.replaceState({ conceptId, route: lastRouteHash }, "", lastRouteHash);
  } finally {
    applyingHistory = false;
  }
  return store.snapshot();
}

function parseDestination(value) {
  try { return JSON.parse(value); } catch { return value; }
}

function openSpellMenu(origin) {
  spellOrigin = origin;
  store.patch({ spellMenuOpen: true, spellMenuIndex: 0 }, { action: "spelling", scopes: ["spelling", "focus"], motionKey: `${conceptId}:spelling-menu` });
}

function closeSpellMenu({ restore = true } = {}) {
  if (!store.state.spellMenuOpen) return;
  store.patch({ spellMenuOpen: false, spellMenuIndex: 0 }, { action: "spelling", scopes: ["spelling", "focus"], motionKey: "spelling-dismiss" });
  if (restore) whenIdle().then(() => scroller.querySelector("[data-misspelled]")?.focus({ preventScroll: true }));
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("button, [role='option'], [data-misspelled]");
  if (!target) return;

  if (target.dataset.shellToggle) {
    const key = target.dataset.shellToggle === "rail" ? "railOpen" : "chatOpen";
    dispatch({ type: "shell.set", values: { [key]: !store.state[key] } });
  } else if (target.dataset.shellNav) {
    const destination = target.dataset.shellNav;
    if (destination === "home") dispatch({ type: "navigate.home" });
    else if (destination === "settings") dispatch({ type: "navigate.category", categoryId: store.state.categoryId || CATEGORIES[0].id });
    else {
      managerDrillMode = "master";
      dispatch({ type: "navigate.manager", managerId: destination });
    }
  } else if (target.hasAttribute("data-home")) {
    dispatch({ type: "navigate.home" });
  } else if (target.dataset.category) {
    dispatch({ type: "navigate.category", categoryId: target.dataset.category });
  } else if (target.dataset.manager) {
    managerDrillMode = "master";
    dispatch({ type: "navigate.manager", managerId: target.dataset.manager });
  } else if (target.dataset.destination) {
    dispatch({ type: "navigate.destination", destination: parseDestination(target.dataset.destination) });
  } else if (target.dataset.subcategory) {
    dispatch({ type: "subcategory.set", subcategoryId: target.dataset.subcategory, reason: "jump" }, { subcategoryId: target.dataset.subcategory });
  } else if (target.hasAttribute("data-nav-toggle")) {
    dispatch({ type: "navigation.toggle" });
  } else if (target.hasAttribute("data-nav-dismiss")) {
    dispatch({ type: "navigation.toggle", open: false }).then(() => scroller.querySelector("[data-nav-toggle]")?.focus());
  } else if (target.hasAttribute("data-inspector-toggle")) {
    dispatch({ type: "inspector.toggle" });
  } else if (target.hasAttribute("data-inspector-dismiss")) {
    dispatch({ type: "inspector.toggle", open: false }).then(() => whenIdle()).then(() => scroller.querySelector("[data-inspector-toggle]")?.focus());
  } else if (target.dataset.settingToggle) {
    dispatch({ type: "setting.update", settingId: target.dataset.settingToggle, value: target.getAttribute("aria-checked") !== "true" }, { settingId: target.dataset.settingToggle });
  } else if (target.dataset.settingReset) {
    dispatch({ type: "setting.reset", settingId: target.dataset.settingReset }, { settingId: target.dataset.settingReset });
  } else if (target.dataset.settingInherit) {
    dispatch({ type: "setting.inherit", settingId: target.dataset.settingInherit }, { settingId: target.dataset.settingInherit });
  } else if (target.dataset.settingAction) {
    dispatch({ type: "setting.action", settingId: target.dataset.settingAction }, { settingId: target.dataset.settingAction });
  } else if (target.dataset.resetCategory) {
    dispatch({ type: "category.reset", categoryId: target.dataset.resetCategory });
  } else if (target.dataset.searchResult !== undefined) {
    store.setSearchSelection(Number(target.dataset.searchResult));
    dispatch({ type: "search.activate" });
  } else if (target.dataset.managerTab) {
    dispatch({ type: "manager.tab", tab: target.dataset.managerTab });
  } else if (target.dataset.provider) {
    captureManagerOrigin(target);
    managerDrillMode = "detail";
    dispatch({ type: "provider.select", providerId: target.dataset.provider });
  } else if (target.dataset.accountSelect) {
    captureManagerOrigin(target);
    managerDrillMode = "detail";
    dispatch({ type: "provider.account.inspect", accountId: target.dataset.accountSelect });
  } else if (target.dataset.accountUse) {
    dispatch({ type: "provider.account.use", accountId: target.dataset.accountUse });
  } else if (target.dataset.providerRefresh) {
    dispatch({ type: "provider.refresh", providerId: target.dataset.providerRefresh });
  } else if (target.dataset.providerReviewSource !== undefined) {
    const providerId = target.dataset.providerReviewSource || target.dataset.providerId || store.state.selectedProviderId;
    const result = callStoreMethod(["reviewProviderSource", "reviewProviderInstallSource"], providerId);
    if (result === undefined) callStoreMethod(["requireProviderSetup"], providerId);
  } else if (target.dataset.providerSelectExisting !== undefined) {
    const installationId = target.dataset.providerSelectExisting || target.dataset.installationId;
    const providerId = target.dataset.providerId || store.state.selectedProviderId;
    const result = callStoreMethod(["selectExistingProviderInstallation", "chooseExistingProviderInstallation"], installationId, providerId);
    if (result === undefined) callStoreMethod(["selectProviderInstallation"], providerId, installationId);
  } else if (target.dataset.providerConfirmInstall !== undefined) {
    const providerId = target.dataset.providerConfirmInstall || target.dataset.providerId || store.state.selectedProviderId;
    const result = callStoreMethod(["confirmFirstProviderInstall", "confirmProviderInstallation"], providerId, target.dataset.installationId || null);
    if (result === undefined) {
      callStoreMethod(["advanceProviderSetup"], "consent");
      callStoreMethod(["advanceProviderSetup"], "install");
    }
  } else if (target.dataset.providerAuthenticate !== undefined) {
    const result = callStoreMethod(["authenticateProvider", "startProviderAuthentication"], target.dataset.providerAuthenticate || target.dataset.providerId || store.state.selectedProviderId);
    if (result === undefined) callStoreMethod(["advanceProviderSetup"], "authenticate");
  } else if (target.dataset.providerSetupAction) {
    callStoreMethod(["advanceProviderSetup"], target.dataset.providerSetupAction, { expectedRevision: Number(target.dataset.expectedRevision) || undefined });
  } else if (target.dataset.observableWorkCancel !== undefined) {
    callStoreMethod(["cancelObservableWork", "cancelWork"], target.dataset.observableWorkCancel);
  } else if (target.dataset.observableWorkRetry !== undefined) {
    callStoreMethod(["retryObservableWork", "retryWork"], target.dataset.observableWorkRetry);
  } else if (target.dataset.observableWorkBackground !== undefined) {
    callStoreMethod(["backgroundObservableWork", "backgroundWork"], target.dataset.observableWorkBackground);
  } else if (target.dataset.workAction) {
    const method = target.dataset.workAction === "cancel" ? ["cancelObservableWork", "cancelWork"] : target.dataset.workAction === "retry" ? ["retryObservableWork", "retryWork"] : ["backgroundObservableWork", "backgroundWork"];
    callStoreMethod(method, target.dataset.workId);
  } else if (target.dataset.listPrevious !== undefined) {
    callStoreMethod(["shiftListWindow"], target.dataset.listPrevious, -1);
  } else if (target.dataset.listNext !== undefined) {
    callStoreMethod(["shiftListWindow"], target.dataset.listNext, 1);
  } else if (target.dataset.listWindow) {
    callStoreMethod(["shiftListWindow"], target.dataset.listWindow, target.dataset.listDirection || "next");
  } else if (target.dataset.managerLoad) {
    callStoreMethod(["loadManager", "hydrateManager", "retryManagerLoad"], target.dataset.managerLoad, { retry: target.dataset.managerRetry === "true" });
  } else if (target.dataset.performanceFixture) {
    callStoreMethod(["applyPerformanceFixture", "setPerformanceProfile"], target.dataset.performanceFixture);
  } else if (target.dataset.providerAction) {
    dispatch({ type: "provider.action", providerAction: target.dataset.providerAction });
  } else if (target.hasAttribute("data-provider-usage-handoff")) {
    store.receipt("Usage handoff simulated", "Production would open the Usage-owned measured balance, history, projection, and forecast for this provider context. This Settings concept performed no calculation or external navigation.", "managed", { persistent: true, simulation: true });
  } else if (target.dataset.modelFavorite) {
    dispatch({ type: "model.favorite", modelId: target.dataset.modelFavorite }, { modelId: target.dataset.modelFavorite });
  } else if (target.dataset.modelMove) {
    dispatch({ type: "model.move", modelId: target.dataset.modelMove, direction: Number(target.dataset.direction) }, { modelId: target.dataset.modelMove });
  } else if (target.dataset.memory) {
    captureManagerOrigin(target);
    managerDrillMode = "detail";
    dispatch({ type: "memory.select", memoryId: target.dataset.memory });
  } else if (target.dataset.memorySave) {
    const draft = scroller.querySelector(`[data-memory-draft="${cssEscape(target.dataset.memorySave)}"]`);
    dispatch({ type: "memory.edit", memoryId: target.dataset.memorySave, changes: { summary: draft?.value || "" } });
  } else if (target.dataset.memoryVerify) {
    dispatch({ type: "memory.verify", memoryId: target.dataset.memoryVerify });
  } else if (target.dataset.memoryPin) {
    dispatch({ type: "memory.pin", memoryId: target.dataset.memoryPin });
  } else if (target.dataset.memoryDiscard) {
    dispatch({ type: "memory.discard", memoryId: target.dataset.memoryDiscard });
  } else if (target.dataset.memoryRestore) {
    dispatch({ type: "memory.restore", memoryId: target.dataset.memoryRestore, version: Number(target.dataset.version) });
  } else if (target.hasAttribute("data-memory-undo")) {
    dispatch({ type: "memory.undo" });
  } else if (target.hasAttribute("data-memory-rebuild")) {
    store.receipt("Memory rebuild simulated", "Nine evidence-backed Gists were scanned; duplicate candidates remain reviewable and no durable Memory was written.", "managed", { persistent: true, simulation: true });
  } else if (target.dataset.terminal) {
    captureManagerOrigin(target);
    managerDrillMode = "detail";
    dispatch({ type: "terminal.select", profileId: target.dataset.terminal });
  } else if (target.hasAttribute("data-terminal-apply")) {
    dispatch({ type: "terminal.apply" });
  } else if (target.hasAttribute("data-terminal-reset")) {
    dispatch({ type: "terminal.reset" });
  } else if (target.hasAttribute("data-terminal-diagnostics")) {
    dispatch({ type: "terminal.diagnostics" });
  } else if (target.hasAttribute("data-terminal-keep")) {
    dispatch({ type: "terminal.switch.resolve", choice: "cancel" });
  } else if (target.hasAttribute("data-terminal-discard-switch")) {
    dispatch({ type: "terminal.switch.resolve", choice: "discard" });
  } else if (target.hasAttribute("data-misspelled")) {
    openSpellMenu(target);
  } else if (target.dataset.spell) {
    dispatch({ type: "spelling.action", spellingAction: target.dataset.spell, word: "repositry", replacement: "repository" });
    closeSpellMenu({ restore: false });
  } else if (target.dataset.receiptDismiss) {
    dispatch({ type: "receipt.dismiss", receiptId: target.dataset.receiptDismiss });
  } else if (target.dataset.installationAction) {
    dispatch({ type: "provider.installation.action", providerId: target.dataset.providerId, installationId: target.dataset.installationId, installationAction: target.dataset.installationAction });
  } else if (target.dataset.installationId) {
    captureManagerOrigin(target);
    managerDrillMode = "detail";
    dispatch({ type: "provider.installation.select", providerId: target.dataset.providerId, installationId: target.dataset.installationId });
  } else if (target.dataset.flowChoice) {
    dispatch({ type: "flow.choose", choice: target.dataset.flowChoice });
  } else if (target.hasAttribute("data-flow-advance")) {
    dispatch({ type: "flow.advance" });
  } else if (target.hasAttribute("data-flow-fail")) {
    dispatch({ type: "flow.advance", outcome: "fail", reason: "Deterministic verification fixture rejected the staged change." });
  } else if (target.hasAttribute("data-flow-rollback")) {
    dispatch({ type: "flow.rollback" });
  } else if (target.hasAttribute("data-flow-close")) {
    dispatch({ type: "flow.close" });
  } else if (target.dataset.startFlow) {
    dispatch({ type: "flow.start", kind: target.dataset.startFlow, managerId: store.state.managerId, resourceId: target.dataset.flowResource || null });
  } else if (target.dataset.themePreview) {
    dispatch({ type: "theme.preview", theme: target.dataset.themePreview });
  } else if (target.hasAttribute("data-theme-validate")) {
    const draft = scroller.querySelector("[data-custom-theme-draft]")?.value || store.state.customThemeDraft;
    dispatch({ type: "theme.validate", draft });
  } else if (target.hasAttribute("data-theme-apply")) {
    dispatch({ type: "theme.apply" });
  } else if (target.hasAttribute("data-theme-revert")) {
    dispatch({ type: "theme.revert" });
  } else if (target.dataset.soundPreview) {
    dispatch({ type: "sound.preview", resourceId: target.dataset.soundPreview });
  } else if (target.hasAttribute("data-sound-stop")) {
    dispatch({ type: "sound.stop" });
  } else if (target.dataset.externalChoice) {
    dispatch({ type: "external.reconcile", choice: target.dataset.externalChoice });
  } else if (target.dataset.fixtureId) {
    dispatch({ type: "fixture.trigger", fixtureId: target.dataset.fixtureId });
  } else if (target.hasAttribute("data-persistence-reset")) {
    dispatch({ type: "persistence.reset" });
  } else if (target.dataset.managerItemAction) {
    dispatch({ type: "manager.action", managerId: target.dataset.managerId, resourceId: target.dataset.resourceId, name: target.dataset.managerItemAction });
  } else if (target.dataset.genericAction) {
    dispatch({ type: "manager.action", managerId: target.dataset.genericAction, resourceId: store.state.selectedManagerResource?.[target.dataset.genericAction] || null, name: "Inspect evidence" });
  } else if (target.dataset.genericInspect) {
    store.receipt("Evidence opened", "Health history, requested and effective state, and redacted diagnostic evidence are visible in this fixture only.", "managed", { persistent: true, simulation: true });
  } else if (target.dataset.managerResource) {
    const [managerId, ...resourceParts] = target.dataset.managerResource.split(":");
    const resourceId = resourceParts.join(":");
    captureManagerOrigin(target);
    managerDrillMode = "detail";
    dispatch({ type: "manager.resource.select", managerId, resourceId });
  } else if (target.hasAttribute("data-drill-back")) {
    managerDrillMode = "master";
    applyManagerDrill();
    restoreManagerOrigin();
  }
});

app.addEventListener("input", (event) => {
  const target = event.target;
  if (target.matches("[data-search-input]")) {
    dispatch({ type: "search.set", query: target.value, surface: target.dataset.searchSurface });
  } else if (target.dataset.settingRange) {
    dispatch({ type: "setting.update", settingId: target.dataset.settingRange, value: Number(target.value) }, { settingId: target.dataset.settingRange });
  } else if (target.dataset.memorySearch !== undefined) {
    dispatch({ type: "memory.filter", key: "query", value: target.value });
  } else if (target.dataset.managerFilter) {
    store.state.managerQuery = target.value;
    store.emit({ action: "manager-search", scopes: ["manager", "search"], motionKey: "search" });
  } else if (target.dataset.terminalField === "opacity") {
    dispatch({ type: "terminal.update", key: "opacity", value: Number(target.value) / 100 });
  } else if (target.hasAttribute("data-custom-theme-draft")) {
    store.state.customThemeDraft = target.value;
  }
});

app.addEventListener("change", (event) => {
  const target = event.target;
  if (target.dataset.review) {
    const name = target.dataset.review;
    if (name === "scenario") dispatch({ type: "scenario.apply", scenario: target.value });
    else if (name === "reducedMotion") dispatch({ type: "presentation.set", values: { reducedMotionOverride: target.checked } });
    else if (name === "textExpansion") dispatch({ type: "presentation.set", values: { textScale: target.checked ? 1.35 : 1 } });
    else dispatch({ type: "presentation.set", values: { [name]: target.value } });
  } else if (target.dataset.settingSelect) {
    dispatch({ type: "setting.update", settingId: target.dataset.settingSelect, value: target.value }, { settingId: target.dataset.settingSelect });
  } else if (target.dataset.settingNumber) {
    dispatch({ type: "setting.update", settingId: target.dataset.settingNumber, value: target.value }, { settingId: target.dataset.settingNumber });
  } else if (target.dataset.settingText) {
    dispatch({ type: "setting.update", settingId: target.dataset.settingText, value: target.value }, { settingId: target.dataset.settingText });
  } else if (target.dataset.modelAlias) {
    dispatch({ type: "model.alias", modelId: target.dataset.modelAlias, alias: target.value });
  } else if (target.dataset.modelSpeed) {
    dispatch({ type: "model.speed", modelId: target.dataset.modelSpeed, speed: target.value });
  } else if (target.dataset.modelEffort) {
    dispatch({ type: "model.effort", modelId: target.dataset.modelEffort, effort: target.value });
  } else if (target.dataset.modelVisible) {
    dispatch({ type: "model.visibility", modelId: target.dataset.modelVisible, visible: target.value === "Shown" });
  } else if (target.dataset.role) {
    dispatch({ type: "role.assign", roleId: target.dataset.role, route: target.value });
  } else if (target.dataset.memoryFilter !== undefined) {
    dispatch({ type: "memory.filter", key: target.dataset.memoryFilter || "state", value: target.value });
  } else if (target.dataset.testingPolicy) {
    dispatch({ type: "manager.resource.update", managerId: "testing-debug", resourceId: target.dataset.testingPolicy, changes: { requested: target.value } });
  } else if (target.dataset.terminalField) {
    const numeric = ["fontSize", "lineHeight"].includes(target.dataset.terminalField);
    dispatch({ type: "terminal.update", key: target.dataset.terminalField, value: numeric ? Number(target.value) : target.value });
  }
});

app.addEventListener("toggle", (event) => {
  const details = event.target.closest?.("details[data-disclosure-id]");
  if (!details) return;
  store.setAdvancedSection(details.dataset.disclosureId, details.open);
}, true);

app.addEventListener("contextmenu", (event) => {
  const word = event.target.closest("[data-misspelled]");
  if (!word) return;
  event.preventDefault();
  openSpellMenu(word);
});

app.addEventListener("keydown", (event) => {
  const searchInput = event.target.closest?.("[data-search-input]");
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    const visibleSearch = scroller.querySelector("[data-search-input]");
    visibleSearch?.focus();
    if (visibleSearch?.value) store.setSearch(visibleSearch.value, true, visibleSearch.dataset.searchSurface);
    return;
  }
  if (searchInput) {
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : event.key.toLowerCase();
      dispatch({ type: "search.move", direction });
    } else if (event.key === "Enter" && store.state.search.open) {
      event.preventDefault();
      dispatch({ type: "search.activate" });
    } else if (event.key === "Escape") {
      event.preventDefault();
      dispatch({ type: "search.close" });
    }
    return;
  }
  const tab = event.target.closest?.('[role="tab"]');
  if (tab && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
    event.preventDefault();
    const tabs = [...scroller.querySelectorAll('[role="tab"]')];
    let index = tabs.indexOf(tab);
    if (event.key === "Home") index = 0;
    else if (event.key === "End") index = tabs.length - 1;
    else index = (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    tabs[index]?.focus();
    dispatch({ type: "manager.tab", tab: tabs[index]?.dataset.managerTab });
    return;
  }
  if (event.shiftKey && event.key === "F10" && event.target.closest?.("[data-misspelled]")) {
    event.preventDefault();
    openSpellMenu(event.target.closest("[data-misspelled]"));
    return;
  }
  const spellItem = event.target.closest?.('[data-spell-menu] [role="menuitem"]');
  if (spellItem) {
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      let index = Number(store.state.spellMenuIndex || 0);
      if (event.key === "Home") index = 0;
      else if (event.key === "End") index = 4;
      else index = (index + (event.key === "ArrowDown" ? 1 : -1) + 5) % 5;
      store.patch({ spellMenuIndex: index }, { action: "spelling", scopes: ["spelling", "focus"], motionKey: "selection" });
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeSpellMenu();
    }
    return;
  }
  const evidenceDrawer = scroller.querySelector("#workspaceInspector[role=\"dialog\"]");
  if (store.state.inspectorOpen && evidenceDrawer && event.key === "Tab") {
    const controls = [...evidenceDrawer.querySelectorAll("button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex=\"-1\"])")].filter((element) => !element.inert && element.getClientRects().length);
    if (controls.length) {
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first || !event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    }
  }
  if (event.key === "Escape") {
    if (reviewPopover?.open) {
      reviewPopover.open = false;
      reviewTrigger?.focus();
    } else if (store.state.inspectorOpen) {
      dispatch({ type: "inspector.toggle", open: false }).then(() => whenIdle()).then(() => scroller.querySelector("[data-inspector-toggle]")?.focus());
    } else if (store.state.pendingTerminalSwitch) {
      dispatch({ type: "terminal.switch.resolve", choice: "cancel" }).then(restoreManagerOrigin);
    } else if (store.state.screen === "manager" && managerDrillMode === "detail" && matchMedia("(max-width: 980px)").matches) {
      managerDrillMode = "master";
      applyManagerDrill();
      restoreManagerOrigin();
    } else if (store.state.navigationOpen) {
      dispatch({ type: "navigation.toggle", open: false }).then(() => scroller.querySelector("[data-nav-toggle]")?.focus());
    } else if (store.state.chatOpen) {
      dispatch({ type: "shell.set", values: { chatOpen: false } }).then(() => app.querySelector('[data-shell-toggle="chat"]')?.focus());
    } else if (store.state.railOpen && matchMedia("(max-width: 980px)").matches) {
      dispatch({ type: "shell.set", values: { railOpen: false } }).then(() => app.querySelector('[data-shell-toggle="rail"]')?.focus());
    }
  }
});

function onDocumentPointerDown(event) {
  if (!event.target.closest("[data-search-shell]") && store.state.search.open) dispatch({ type: "search.close" });
  if (!event.target.closest(".spell-demo") && store.state.spellMenuOpen) closeSpellMenu({ restore: false });
}
document.addEventListener("pointerdown", onDocumentPointerDown);

const onScrollerInterrupt = () => {
  if (!controlledScroll) return;
  controlledScroll.cancelled = true;
  controlledScroll = null;
  scroller.scrollTo({ top: scroller.scrollTop, behavior: "auto" });
};
for (const type of ["wheel", "touchstart", "pointerdown"]) {
  scroller.addEventListener(type, onScrollerInterrupt, { passive: true });
}

function onReviewState(event) {
  const state = event.detail || {};
  dispatch({ type: "review.apply", state: {
    scenario: state.scenario,
    theme: state.theme,
    density: state.density,
    reducedMotion: state.reducedMotion,
    railOpen: state.railOpen,
    chatOpen: state.chatOpen,
    direction: state.direction,
    textScale: state.textScale
  }});
}
window.addEventListener("pm-settings-review-state", onReviewState);

function syncResponsiveState() {
  cancelTrackedFrame(responsiveFrame);
  responsiveFrame = requestTrackedFrame(() => {
    responsiveFrame = 0;
    if (store.state.screen === "workspace") {
      patchNavigator();
      patchInspectorDrawer();
    }
    if (store.state.screen === "manager") applyManagerDrill();
  });
}
window.addEventListener("resize", syncResponsiveState);

function onVisibilityChange() {
  const hidden = document.hidden;
  document.documentElement.dataset.pmDecorativeState = hidden ? "paused" : "active";
  document.body.dataset.pmDecorativeState = hidden ? "paused" : "active";
  if (hidden) releaseSelectedSurfaces("document-hidden");
  else reconcileSelectedSurfaces("document-visible");
}
document.addEventListener("visibilitychange", onVisibilityChange);

function onPopState() {
  applyDeepLink(window.location.hash);
}

function destroyApp() {
  if (destroyed) return;
  destroyed = true;
  releaseSelectedSurfaces("destroy");
  unsubscribeStore?.();
  unsubscribeStore = null;
  document.removeEventListener("pointerdown", onDocumentPointerDown);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  window.removeEventListener("pm-settings-review-state", onReviewState);
  window.removeEventListener("popstate", onPopState);
  window.removeEventListener("resize", syncResponsiveState);
  window.removeEventListener("beforeunload", destroyApp);
  reviewPopover?.removeEventListener("toggle", syncReviewPopover);
  for (const type of ["wheel", "touchstart", "pointerdown"]) scroller.removeEventListener(type, onScrollerInterrupt);
  cancelTrackedFrame(responsiveFrame);
  cancelTrackedFrame(transientFrame);
  responsiveFrame = 0;
  transientFrame = 0;
  pendingTransientEvents.clear();
  resolveTransientBatch?.();
  resolveTransientBatch = null;
  transientBatchPromise = null;
  for (const frame of [...queuedFrames]) cancelTrackedFrame(frame);
  observer?.disconnect();
  observer = null;
  motion.destroy();
  store.destroy();
}
window.addEventListener("beforeunload", destroyApp);

renderScene();
syncShell();
renderReceipts();
setupScrollspy();
notifyRendered({ action: "initial", scopes: ["view"] });
lastRouteHash = routeHash();
if (window.location.hash && window.location.hash !== "#home") applyDeepLink(window.location.hash);
else window.history.replaceState({ conceptId, route: lastRouteHash }, "", lastRouteHash);
window.addEventListener("popstate", onPopState);
onVisibilityChange();

async function whenIdle() {
  await store.whenIdle();
  if (transientBatchPromise) await transientBatchPromise;
  while (renderTasks.size) await Promise.allSettled([...renderTasks]);
  await motion.whenIdle();
  await nextFrame();
  await nextFrame();
  return store.snapshot();
}

async function settleForReview() {
  await Promise.resolve();
  await Promise.resolve();
  await motion.settle();
  if (transientBatchPromise) await transientBatchPromise;
  while (renderTasks.size) await Promise.allSettled([...renderTasks]);
  const animations = document.getAnimations();
  for (const animation of animations) {
    try { animation.finish(); } catch { animation.cancel(); }
  }
  await Promise.allSettled(animations.map((animation) => animation.finished));
  await nextFrame();
  return store.snapshot();
}

window.PMSettingsDemo = {
  model: MODEL_NAME,
  concept: conceptId,
  store,
  dispatch,
  applyReviewState: (state) => dispatch({ type: "review.apply", state }),
  whenIdle,
  settleForReview,
  snapshot: () => store.snapshot(),
  motionSnapshot: () => lastMotionResult ? { ...lastMotionResult, roles: { ...(lastMotionResult.roles || {}) } } : null,
  openHome: () => dispatch({ type: "navigate.home" }),
  openCategory: (categoryId, subcategoryId) => dispatch({ type: "navigate.category", categoryId, subcategoryId }),
  openManager: (managerId, tab, options = {}) => dispatch({ type: "navigate.manager", managerId, tab, ...options }),
  openSetting: (settingId) => dispatch({ type: "navigate.setting", settingId }),
  deepLink: () => routeHash(),
  renderStats: renderStatsSnapshot,
  resetRenderStats,
  destroy: destroyApp,
  applyDeepLink,
  fixtures: () => store.fixtureTriggers.map((entry) => ({ ...entry })),
  triggerFixture: (fixtureId) => dispatch({ type: "fixture.trigger", fixtureId }),
  startFlow: (kind, options = {}) => dispatch({ type: "flow.start", kind, ...options }),
  advanceFlow: (options = {}) => dispatch({ type: "flow.advance", ...options }),
  chooseFlow: (choice) => dispatch({ type: "flow.choose", choice }),
  rollbackFlow: () => dispatch({ type: "flow.rollback" }),
  reset: () => dispatch({ type: "persistence.reset" })
};
