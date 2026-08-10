import {
  MODEL_NAME,
  CATEGORIES,
  MANAGERS,
  GENERIC_MANAGER_STATES,
  SPELLING_FIXTURE,
  categoryById,
  managerById
} from "./data.mjs";

export const escapeHTML = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
})[character]);

export const icon = (name, label = "") => `<svg class="icon" aria-hidden="true"><use href="_shared/icons.svg#${escapeHTML(name)}"></use></svg>${label ? `<span class="sr-only">${escapeHTML(label)}</span>` : ""}`;

const HUMAN_LABELS = {
  default: "Default",
  recommended: "Recommended",
  inherited: "Inherited",
  auto: "Auto",
  "not-configured": "Not configured",
  managed: "Managed",
  custom: "Custom",
  unavailable: "Unavailable",
  "effective-difference": "Effective value differs",
  ready: "Ready",
  healthy: "Healthy",
  degraded: "Degraded",
  failed: "Readiness failed",
  "signed-out": "Signed out",
  "not-installed": "Not installed",
  setup: "Setup required",
  "awaiting-review": "Awaiting review",
  verified: "Verified",
  progressive: "Progressive exposure",
  scoped: "Scoped",
  running: "In progress",
  succeeded: "Complete",
  quarantined: "Update quarantined",
  error: "Error"
};

export function humanize(value) {
  const key = String(value ?? "").trim();
  if (!key) return "Not configured";
  return HUMAN_LABELS[key.toLowerCase()] || key.replace(/[_-]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export function toneFor(value) {
  const text = String(value || "").toLowerCase();
  if (/fail|error|unavailable|exhaust|attention|danger|not installed|quarantin/.test(text)) return "danger";
  if (/setup|signed.out|review|warning|await|degraded|remaining|adjusted|not configured/.test(text)) return "warning";
  if (/managed|inherited|progressive|scoped|effective/.test(text)) return "managed";
  return "success";
}

export function status(value, tone = toneFor(value), attributes = "") {
  return `<span class="status-label ${escapeHTML(tone)}" ${attributes}>${escapeHTML(humanize(value))}</span>`;
}

function getValueState(entry) {
  if (entry.valueState) return entry.valueState;
  if (entry.available === false) return "unavailable";
  if (entry.requestedValue !== undefined && entry.effectiveValue !== undefined && entry.requestedValue !== entry.effectiveValue) return "effective-difference";
  const legacy = String(entry.status || "custom").toLowerCase();
  return ["default", "inherited", "auto", "managed", "custom", "not-configured", "unavailable"].includes(legacy) ? legacy : legacy === "recommended" ? "default" : "custom";
}

function exposureLabel(entry) {
  const exposure = String(entry.exposure || "Standard").toLowerCase();
  if (exposure.includes("expert") || exposure.includes("risky")) return "Expert or risky";
  if (exposure.includes("diagnostic")) return "Diagnostic";
  if (exposure.includes("advanced")) return "Advanced";
  if (entry.available === false) return "Unavailable";
  if (getValueState(entry) === "managed") return "Managed and read-only";
  return "Standard";
}

function effectsFor(entry) {
  if (Array.isArray(entry.effects)) return entry.effects.map((effect) => typeof effect === "string" ? { kind: "Effect", text: effect } : effect);
  if (entry.effect) return [{ kind: "Effect", text: entry.effect }];
  return [];
}

function settingControl(entry) {
  const value = entry.invalidDraft ?? entry.value;
  const disabled = entry.available === false || getValueState(entry) === "managed" ? " disabled" : "";
  const key = escapeHTML(entry.id);
  const validation = entry.validationError ? ` aria-invalid="true" aria-describedby="error-${key}"` : "";
  if (entry.requestedValue !== undefined || entry.effectiveValue !== undefined) {
    return `<div class="value-comparison" aria-label="Requested and effective values">
      <span class="value-cell"><small>Requested</small><strong>${escapeHTML(entry.requestedValue ?? value)}</strong></span>
      ${icon("arrow")}
      <span class="value-cell"><small>Effective</small><strong>${escapeHTML(entry.effectiveValue ?? value)}</strong></span>
    </div>`;
  }
  if (entry.type === "toggle") return `<button class="switch-control" type="button" role="switch" aria-label="${escapeHTML(entry.label)}" aria-checked="${Boolean(value)}" data-setting-toggle="${key}" data-focus-key="setting:${key}:control"${validation}${disabled}></button>`;
  if (entry.type === "select") return `<select aria-label="${escapeHTML(entry.label)}" data-setting-select="${key}" data-focus-key="setting:${key}:control"${validation}${disabled}>${(entry.choices || []).map((choice) => `<option${String(choice) === String(value) ? " selected" : ""}>${escapeHTML(choice)}</option>`).join("")}</select>`;
  if (entry.type === "range") return `<label class="range-control"><span class="sr-only">${escapeHTML(entry.label)}</span><input type="range" aria-label="${escapeHTML(entry.label)}" data-setting-range="${key}" data-focus-key="setting:${key}:control" value="${escapeHTML(value)}" min="${entry.min}" max="${entry.max}" step="${entry.step || 1}"${validation}${disabled}><strong class="tabular">${escapeHTML(value)}${escapeHTML(entry.unit)}</strong></label>`;
  if (entry.type === "number") return `<input type="number" aria-label="${escapeHTML(entry.label)}" data-setting-number="${key}" data-focus-key="setting:${key}:control" value="${escapeHTML(value)}" min="${entry.min ?? ""}" max="${entry.max ?? ""}" step="${entry.step || 1}"${validation}${disabled}>`;
  if (entry.type === "action") return `<button class="text-button" type="button" data-setting-action="${key}" data-focus-key="setting:${key}:control">${escapeHTML(value || "Open details")}</button>`;
  return `<input type="text" aria-label="${escapeHTML(entry.label)}" data-setting-text="${key}" data-focus-key="setting:${key}:control" value="${escapeHTML(value)}"${validation}${disabled}>`;
}

export function createViewRenderer({ store, conceptId, concept }) {
  const routeClass = { "index-house": "ih", switchboard: "sb", wayfinder: "wf", ledger: "lg" }[conceptId] || "ih";

  function search(surface, extraClass = "") {
    const searchState = store.state.search || { query: store.state.searchQuery || "", open: false, activeIndex: 0, surface };
    const query = searchState.surface === surface ? searchState.query : "";
    const results = query ? store.search(query) : [];
    const open = Boolean(query && searchState.open && searchState.surface === surface);
    const listId = `search-results-${surface.replace(/[^a-z0-9-]/gi, "-")}`;
    const activeIndex = Math.max(0, Math.min(results.length - 1, searchState.activeIndex || 0));
    const activeId = open && results[activeIndex] ? `${listId}-option-${activeIndex}` : "";
    return `<div class="search-shell global-search ${extraClass}" data-search-shell data-search-surface="${escapeHTML(surface)}" data-motion-role="search">
      <label class="search-box">
        ${icon("search")}
        <span class="sr-only">Search all Settings</span>
        <input type="search" dir="auto" role="combobox" aria-autocomplete="list" aria-haspopup="listbox" aria-controls="${listId}" aria-expanded="${open}"${activeId ? ` aria-activedescendant="${activeId}"` : ""} data-search-input data-search-surface="${escapeHTML(surface)}" data-focus-key="search:${escapeHTML(surface)}" autocomplete="off" spellcheck="false" placeholder="${escapeHTML(concept.homePrompt)}" value="${escapeHTML(query)}">
        <span class="search-shortcut" aria-hidden="true">⌘ K</span>
      </label>
      <div class="search-results" id="${listId}" role="listbox" data-search-results ${open ? "" : "hidden"}>${results.length ? results.map((document, index) => `<div id="${listId}-option-${index}" class="search-result${index === activeIndex ? " active" : ""}" role="option" aria-selected="${index === activeIndex}" data-search-result="${index}" data-search-surface="${escapeHTML(surface)}">
        <span class="result-kind">${escapeHTML(document.kind)}</span>
        <span><strong>${escapeHTML(document.title)}</strong><small>${escapeHTML(document.subtitle || document.route || "Open destination")}</small></span>${icon("arrow")}
      </div>`).join("") : `<div class="search-empty">No address found. Try a task, manager, setting, or familiar product term.</div>`}</div>
    </div>`;
  }

  function noticeRows() {
    const scenario = store.scenario();
    const notices = scenario.notices || [];
    if (!notices.length) return `<div class="calm-state" data-qa-scenario="${escapeHTML(store.state.scenario)}"><span class="calm-mark">${icon("check")}</span><div><strong>Nothing needs attention</strong><span>Required routes and services are ready. Optional providers may remain unconfigured without becoming alerts.</span></div></div>`;
    return `<div class="notice-list" data-qa-scenario="${escapeHTML(store.state.scenario)}">${notices.map((notice) => `<article class="notice-row">
      <div class="notice-copy"><div class="notice-meta">${status(notice.kind, notice.tone)}</div><strong>${escapeHTML(notice.title)}</strong><p>${escapeHTML(notice.reason)}</p></div>
      <div class="button-row"><button class="text-button" type="button" data-destination="${escapeHTML(JSON.stringify(notice.destination || notice.target || "home"))}" data-outcome="navigation">${escapeHTML(notice.action)} ${icon("arrow")}</button></div>
    </article>`).join("")}</div>`;
  }

  function setupAndRecent() {
    const setups = store.setupSessions || [];
    const recent = store.recentChanges || [];
    return `<div class="home-history">
      <section class="setup-list"><div class="section-heading"><h2>Resume setup</h2><span>${setups.length} resumable paths</span></div>${setups.slice(0, 3).map((item) => `<button type="button" class="history-row" data-destination="${escapeHTML(JSON.stringify(item.destination || item.target || "home"))}"><span><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.detail || item.progress || "Ready to continue")}</small></span>${status(item.state || item.progress || "Continue", "warning")}${icon("arrow")}</button>`).join("")}</section>
      <section class="recent-list"><div class="section-heading"><h2>Recent changes</h2><span>Local demo history</span></div>${recent.slice(0, 6).map((item) => `<button type="button" class="history-row" data-destination="${escapeHTML(JSON.stringify(item.destination || item.target || "home"))}"><span><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.detail || item.when || "Recent")}</small></span><span class="history-time">${escapeHTML(item.when || "Today")}</span>${icon("arrow")}</button>`).join("")}</section>
    </div>`;
  }

  function managerDirectory() {
    return `<section class="manager-directory"><div class="section-heading"><h2>Dedicated managers</h2><span>Inventory, evidence, history and diagnostics</span></div><div class="manager-directory-list">${MANAGERS.map((manager) => `<button type="button" data-manager="${escapeHTML(manager.id)}" data-outcome="navigation"><span class="manager-icon">${icon(manager.icon)}</span><span><strong>${escapeHTML(manager.title)}</strong><small>${escapeHTML(manager.purpose)}</small></span>${icon("arrow")}</button>`).join("")}</div></section>`;
  }

  function destinations(kind = conceptId) {
    if (kind === "switchboard") return `<div class="sb-bays">${CATEGORIES.map((category, index) => `<button class="sb-bay" type="button" data-category="${escapeHTML(category.id)}" data-motion-key="category:${escapeHTML(category.id)}"><span class="sb-bay-index">${String(index + 1).padStart(2, "0")}</span>${icon(category.icon)}<strong>${escapeHTML(category.title)}</strong><small>${escapeHTML(category.purpose)}</small><span class="sb-bay-state">${escapeHTML(store.categoryStatus?.(category.id) || category.status)}</span></button>`).join("")}</div>`;
    if (kind === "wayfinder") return `<div class="wf-routes"><div class="wf-origin" data-motion-role="route"><span class="wf-origin-dot" aria-hidden="true"></span><div><span>Search begins every route</span><strong>Map origin</strong></div></div>${CATEGORIES.map((category, index) => `<button class="wf-route" type="button" data-category="${escapeHTML(category.id)}" data-motion-key="category:${escapeHTML(category.id)}"><span class="wf-waypoint">${index + 1}</span><span><strong>${escapeHTML(category.route)}</strong><small>${escapeHTML(category.title)} · ${escapeHTML(category.purpose)}</small></span><span class="wf-distance">${escapeHTML(store.categoryStatus?.(category.id) || category.status)}</span>${icon("arrow")}</button>`).join("")}</div>`;
    if (kind === "ledger") return `<div class="lg-table destination-register" aria-label="Settings destination register"><div class="lg-table-head" aria-hidden="true"><span>Ref</span><span>Area</span><span>Purpose</span><span>State</span><span></span></div>${CATEGORIES.map((category, index) => `<button class="lg-table-row" type="button" data-category="${escapeHTML(category.id)}" data-motion-key="category:${escapeHTML(category.id)}"><span data-label="Reference">${String(index + 1).padStart(2, "0")}</span><span data-label="Area"><strong>${escapeHTML(category.title)}</strong><small>${escapeHTML(category.route)}</small></span><span data-label="Purpose">${escapeHTML(category.purpose)}</span><span data-label="State">${escapeHTML(store.categoryStatus?.(category.id) || category.status)}</span>${icon("arrow")}</button>`).join("")}</div>`;
    return `<div class="ih-destinations">${CATEGORIES.map((category, index) => `<button class="ih-destination" type="button" data-category="${escapeHTML(category.id)}" data-motion-key="category:${escapeHTML(category.id)}"><span class="ih-number">${String(index + 1).padStart(2, "0")}</span><span class="ih-destination-copy"><strong>${escapeHTML(category.title)}</strong><small>${escapeHTML(category.purpose)}</small></span><span class="ih-destination-status">${escapeHTML(store.categoryStatus?.(category.id) || category.status)}</span>${icon("arrow")}</button>`).join("")}</div>`;
  }

  function homeView() {
    const label = store.scenario().label || humanize(store.state.scenario);
    const commonTail = `<section class="home-attention"><div class="section-heading"><h2>Attention desk</h2><span>${escapeHTML(label)}</span></div>${noticeRows()}</section>${setupAndRecent()}${managerDirectory()}`;
    if (conceptId === "switchboard") return `<div class="view sb-home" data-qa-surface="home" data-motion-stage="home"><header class="home-head"><div><span class="view-kicker">Operational Settings · ${MODEL_NAME}</span><h1 class="view-title" tabindex="-1" data-view-heading>${escapeHTML(concept.title)}</h1><p class="view-lead">${escapeHTML(concept.thesis)}</p></div>${status(label)}</header><div class="sb-console"><span class="sb-console-label">Command console</span>${search("home", "sb-search")}</div><div class="sb-readout"><span>Routes<strong>${CATEGORIES.length}</strong></span><span>Managers<strong>${MANAGERS.length}</strong></span><span>Scenario<strong>${escapeHTML(label)}</strong></span><span>State<strong>Fixture-local</strong></span></div>${destinations("switchboard")}<section class="sb-alerts">${commonTail}</section></div>`;
    if (conceptId === "wayfinder") return `<div class="view wf-home" data-qa-surface="home" data-motion-stage="home"><header class="wf-home-head"><span class="view-kicker">Goal-oriented Settings · ${MODEL_NAME}</span><h1 class="view-title" tabindex="-1" data-view-heading>${escapeHTML(concept.title)}</h1><p class="view-lead">${escapeHTML(concept.thesis)}</p>${search("home", "wf-search")}</header>${destinations("wayfinder")}${commonTail}</div>`;
    if (conceptId === "ledger") return `<div class="view lg-home" data-qa-surface="home" data-motion-stage="home"><header class="lg-masthead"><div><span class="view-kicker">Settings reference · ${MODEL_NAME}</span><h1 class="view-title" tabindex="-1" data-view-heading>${escapeHTML(concept.title)}</h1><p class="view-lead">${escapeHTML(concept.thesis)}</p></div>${search("home", "lg-search")}</header><div class="lg-home-grid"><section><div class="section-heading"><h2>Destination register</h2><span>Requested and effective state inside</span></div>${destinations("ledger")}</section><aside>${commonTail}</aside></div></div>`;
    return `<div class="view ih-home" data-qa-surface="home" data-motion-stage="home"><header class="ih-home-head"><span class="view-kicker">Settings directory · ${MODEL_NAME}</span><h1 class="view-title" tabindex="-1" data-view-heading>${escapeHTML(concept.title)}</h1><p class="view-lead">${escapeHTML(concept.thesis)}</p>${search("home", "ih-search")}</header><section><div class="section-heading"><h2>Open a room</h2><span>${CATEGORIES.length} stable destinations</span></div>${destinations("index-house")}</section>${commonTail}</div>`;
  }

  function categoryNav(className = "category-nav") {
    return `<nav id="categoryNavigator" class="${className}${store.state.navigationOpen ? " open" : ""}" aria-label="Settings categories"${store.state.navigationOpen ? "" : ""}>${CATEGORIES.map((category, index) => `<div class="category-nav-group${category.id === store.state.categoryId ? " active" : ""}"><button type="button" data-category="${escapeHTML(category.id)}" data-focus-key="category:${escapeHTML(category.id)}"${category.id === store.state.categoryId ? ` aria-current="page"` : ""}><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHTML(category.title)}</strong></button>${category.id === store.state.categoryId ? `<div class="subcategory-links">${category.subcategories.map((subcategory) => `<button type="button" data-subcategory="${escapeHTML(subcategory.id)}" data-focus-key="subcategory:${escapeHTML(subcategory.id)}" class="${subcategory.id === store.state.subcategoryId ? "active" : ""}"${subcategory.id === store.state.subcategoryId ? ` aria-current="location"` : ""}>${escapeHTML(subcategory.title)}</button>`).join("")}</div>` : ""}</div>`).join("")}</nav>`;
  }

  function settingRow(entry) {
    const valueState = getValueState(entry);
    const effects = effectsFor(entry);
    const recommended = entry.recommendedValue !== undefined;
    const settingId = escapeHTML(entry.id);
    const stateReason = entry.valueReason || entry.managedReason || entry.unavailableReason || entry.effectiveReason || "";
    return `<article class="setting-row${store.state.focusRequest?.id === entry.id ? " focused" : ""}" id="setting-${settingId}" data-setting-id="${settingId}" data-qa-setting-state="${escapeHTML(valueState)}" data-motion-key="setting:${settingId}" tabindex="-1" aria-labelledby="setting-title-${settingId}" aria-describedby="setting-description-${settingId}">
      <div class="setting-copy"><div class="setting-title-line"><span class="setting-title" id="setting-title-${settingId}">${escapeHTML(entry.label)}</span><span class="setting-state-stack">${status(valueState, toneFor(valueState))}${recommended ? status(entry.value === entry.recommendedValue ? "Recommended" : `Recommended: ${entry.recommendedValue}`, "success") : ""}${exposureLabel(entry) !== "Standard" ? status(exposureLabel(entry), exposureLabel(entry).includes("Expert") ? "warning" : "managed") : ""}</span></div>
        <p class="setting-description" id="setting-description-${settingId}">${escapeHTML(entry.description)}</p>
        <dl class="setting-meta-list"><div><dt>Scope</dt><dd>${escapeHTML(entry.scope || "Global")}</dd></div><div><dt>Source</dt><dd>${escapeHTML(entry.source || "Global default")}</dd></div>${entry.defaultValue !== undefined ? `<div><dt>Default</dt><dd>${escapeHTML(entry.defaultValue)}</dd></div>` : ""}</dl>
        ${stateReason ? `<p class="state-reason">${escapeHTML(stateReason)}</p>` : ""}
        ${(entry.requires || entry.requirements?.length) ? `<p class="requirement-note">${icon("notice")}<strong>${escapeHTML(entry.requires || entry.requirements.map((item) => typeof item === "string" ? item : item.label || item.text).join(" · "))}</strong></p>` : ""}
        ${effects.length ? `<ul class="effect-list">${effects.map((effect) => `<li><strong>${escapeHTML(humanize(effect.kind || "Effect"))}</strong><span>${escapeHTML(effect.text || effect.label || effect)}</span></li>`).join("")}</ul>` : ""}
        ${entry.validationError ? `<p class="field-error" id="error-${settingId}" role="alert">${escapeHTML(entry.validationError)}</p>` : ""}
      </div>
      <div class="setting-control">${settingControl(entry)}${entry.available !== false && entry.type !== "action" && valueState !== "managed" ? `<div class="setting-actions"><button class="quiet-button" type="button" data-setting-reset="${settingId}" data-focus-key="setting:${settingId}:reset" aria-label="Restore ${escapeHTML(entry.label)} to default">Restore default</button>${entry.inheritedValue !== undefined ? `<button class="quiet-button" type="button" data-setting-inherit="${settingId}" aria-label="Use inherited value for ${escapeHTML(entry.label)}">Use inherited value</button>` : ""}</div>` : ""}</div>
    </article>`;
  }

  function settingSections(category) {
    return category.subcategories.map((subcategory) => {
      const entries = subcategory.settings.map((entry) => store.settings.get(entry.id)).filter(Boolean);
      const standard = entries.filter((entry) => !/advanced|expert|risky|diagnostic/i.test(entry.exposure || ""));
      const groups = [
        ["Advanced", entries.filter((entry) => /advanced/i.test(entry.exposure || ""))],
        ["Expert or risky", entries.filter((entry) => /expert|risky/i.test(entry.exposure || ""))],
        ["Diagnostic", entries.filter((entry) => /diagnostic/i.test(entry.exposure || ""))]
      ].filter(([, rows]) => rows.length);
      return `<section class="setting-section" id="section-${escapeHTML(subcategory.id)}" data-spy-section="${escapeHTML(subcategory.id)}" data-motion-role="content" data-motion-key="subcategory:${escapeHTML(subcategory.id)}"><header class="setting-section-head"><span class="view-kicker">${escapeHTML(category.title)}</span><h2>${escapeHTML(subcategory.title)}</h2><p>${escapeHTML(subcategory.description)}</p></header><div class="setting-list">${standard.map(settingRow).join("")}</div>${groups.map(([label, rows]) => {
        const disclosureId = `${category.id}:${subcategory.id}:${label.toLowerCase().replace(/\W+/g, "-")}`;
        const baseDisclosureId = `${category.id}:${subcategory.id}`;
        const isOpen = store.state.advancedSections?.includes(disclosureId) || store.state.advancedSections?.includes(baseDisclosureId);
        return `<details class="advanced-group disclosure" data-disclosure-id="${escapeHTML(disclosureId)}"${isOpen ? " open" : ""}><summary data-advanced-summary="${escapeHTML(disclosureId)}" aria-controls="disclosure-${escapeHTML(disclosureId)}"><span>${escapeHTML(label)}</span><small>${rows.length} ${rows.length === 1 ? "setting" : "settings"}</small></summary><div class="disclosure-body setting-list" id="disclosure-${escapeHTML(disclosureId)}" data-disclosure-panel="${escapeHTML(disclosureId)}">${rows.map(settingRow).join("")}</div></details>`;
      }).join("")}</section>`;
    }).join("") + (category.id === "experience" ? spellDemo() : "");
  }

  function workspaceHeader(category, kicker) {
    const inspectorToggle = conceptId === "index-house" ? `<button class="quiet-button inspector-toggle" type="button" data-inspector-toggle aria-expanded="${Boolean(store.state.inspectorOpen)}" aria-controls="workspaceInspector">${icon("notice")} Evidence</button>` : "";
    return `<header class="workspace-head" data-motion-role="masthead"><div><span class="view-kicker">${escapeHTML(kicker)} · ${MODEL_NAME}</span><h1 tabindex="-1" data-focus-key="screen-heading" data-view-heading>${escapeHTML(category.title)}</h1><p>${escapeHTML(category.purpose)}</p></div><div class="button-row"><button class="quiet-button nav-toggle" type="button" data-nav-toggle aria-expanded="${Boolean(store.state.navigationOpen)}" aria-controls="categoryNavigator">${icon("menu")} Navigator</button>${inspectorToggle}<button class="quiet-button" type="button" data-reset-category="${escapeHTML(category.id)}">Restore category defaults</button></div>${search("workspace", `${routeClass}-workspace-search`)}</header>`;
  }

  function inspector(category) {
    const active = category.subcategories.find((entry) => entry.id === store.state.subcategoryId) || category.subcategories[0];
    const first = active.settings.map((entry) => store.settings.get(entry.id)).find(Boolean);
    const effects = first ? effectsFor(first).map((effect) => typeof effect === "string" ? effect : effect.text || effect.label).filter(Boolean) : [];
    const requirements = first ? (Array.isArray(first.requirements) ? first.requirements : first.requires ? [first.requires] : []).map((requirement) => typeof requirement === "string" ? requirement : requirement.text || requirement.label).filter(Boolean) : [];
    return `<aside id="workspaceInspector" class="workspace-inspector${store.state.inspectorOpen ? " open" : ""}" data-drawer-open="${Boolean(store.state.inspectorOpen)}" data-motion-role="inspector"><div class="ih-inspector-head"><div><span class="view-kicker">Current address</span><h2 tabindex="-1" data-focus-key="inspector-heading">${escapeHTML(active.title)}</h2></div><button class="icon-action ih-inspector-close" type="button" data-inspector-dismiss aria-label="Close evidence inspector">${icon("close")}</button></div><p>${escapeHTML(active.description)}</p>${first ? `<dl class="inspector-facts"><div><dt>First setting</dt><dd>${escapeHTML(first.label)}</dd></div><div><dt>Source</dt><dd>${escapeHTML(first.source)}</dd></div><div><dt>Scope</dt><dd>${escapeHTML(first.scope)}</dd></div><div><dt>Exposure</dt><dd>${escapeHTML(exposureLabel(first))}</dd></div><div><dt>Effects</dt><dd>${escapeHTML(effects.join("; ") || "No material cost, privacy, safety, or performance effect recorded")}</dd></div><div><dt>Requirements</dt><dd>${escapeHTML(requirements.join("; ") || "No restart or reconnect required")}</dd></div></dl>` : ""}</aside>`;
  }

  function navigatorBackdrop() {
    return `<button class="drawer-backdrop${store.state.navigationOpen ? " open" : ""}" type="button" data-nav-dismiss data-open="${Boolean(store.state.navigationOpen)}" aria-hidden="${String(!store.state.navigationOpen)}" tabindex="-1"${store.state.navigationOpen ? "" : " inert"} aria-label="Close Settings navigator"></button>`;
  }

  function inspectorBackdrop() {
    return `<button class="drawer-backdrop ih-inspector-backdrop${store.state.inspectorOpen ? " open" : ""}" type="button" data-inspector-dismiss data-open="${Boolean(store.state.inspectorOpen)}" aria-hidden="${String(!store.state.inspectorOpen)}" tabindex="-1"${store.state.inspectorOpen ? "" : " inert"} aria-label="Close evidence inspector"></button>`;
  }

  function workspaceView() {
    const category = categoryById(store.state.categoryId);
    if (conceptId === "switchboard") return `<div class="view sb-workspace-view" data-qa-surface="workspace" data-motion-stage="workspace">${workspaceHeader(category, "Operating station")}${navigatorBackdrop()}<nav id="categoryNavigator" class="sb-station-bar settings-navigator${store.state.navigationOpen ? " open" : ""}" aria-label="Major Settings stations">${CATEGORIES.map((entry) => `<button type="button" data-category="${escapeHTML(entry.id)}" class="${entry.id === category.id ? "active" : ""}"${entry.id === category.id ? ` aria-current="page"` : ""}>${icon(entry.icon)}<span>${escapeHTML(entry.title)}</span></button>`).join("")}</nav><div class="sb-workspace"><nav class="sb-signal-track" aria-label="Station chapters" data-motion-role="signal">${category.subcategories.map((entry, index) => `<button type="button" data-subcategory="${escapeHTML(entry.id)}" class="${entry.id === store.state.subcategoryId ? "active" : ""}"${entry.id === store.state.subcategoryId ? ` aria-current="location"` : ""}><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHTML(entry.title)}</strong></button>`).join("")}</nav><article class="settings-document" data-motion-role="document">${settingSections(category)}</article><aside class="sb-state-tray"><span class="view-kicker">Effective state</span><strong>${category.subcategories.length} signal groups</strong><p>Future work receives new values. In-flight work keeps its captured route and permission state.</p>${status(store.state.scenario === "degraded" ? "Last-known-good active" : "Ready")}</aside></div></div>`;
    if (conceptId === "wayfinder") return `<div class="view wf-workspace-view" data-qa-surface="workspace" data-motion-stage="workspace">${workspaceHeader(category, "Guided route")}${navigatorBackdrop()}<div class="wf-journey"><nav id="categoryNavigator" class="wf-journey-map settings-navigator${store.state.navigationOpen ? " open" : ""}" aria-label="Journey map" data-motion-role="route"><button type="button" data-home>${icon("home")} Map origin</button>${CATEGORIES.map((entry) => `<button type="button" data-category="${escapeHTML(entry.id)}" class="${entry.id === category.id ? "active" : ""}"${entry.id === category.id ? ` aria-current="page"` : ""}><span class="wf-map-dot"></span><span><strong>${escapeHTML(entry.route)}</strong><small>${escapeHTML(entry.title)}</small></span></button>`).join("")}</nav><article class="wf-checkpoints settings-document" data-motion-role="document"><header class="wf-route-banner"><span>Current route</span><strong>${escapeHTML(category.route)}</strong><small>${escapeHTML(category.title)}</small></header>${settingSections(category)}</article><nav class="wf-checkpoint-nav" aria-label="Checkpoints" data-motion-role="marker">${category.subcategories.map((entry) => `<button type="button" data-subcategory="${escapeHTML(entry.id)}" class="${entry.id === store.state.subcategoryId ? "active" : ""}"${entry.id === store.state.subcategoryId ? ` aria-current="location"` : ""}>${escapeHTML(entry.title)}</button>`).join("")}</nav></div></div>`;
    if (conceptId === "ledger") return `<div class="view lg-workspace-view" data-qa-surface="workspace" data-motion-stage="workspace">${workspaceHeader(category, "Reference folio")}${navigatorBackdrop()}<div class="lg-workspace">${categoryNav("lg-directory category-nav settings-navigator")}<article class="settings-document lg-document" data-motion-role="document"><div class="lg-column-head"><span>Entry</span><span>Requested and effective value</span></div>${settingSections(category)}</article><nav class="lg-minimap" aria-label="Chapter minimap" data-motion-role="rule"><span class="view-kicker">In this folio</span>${category.subcategories.map((entry, index) => `<button type="button" data-subcategory="${escapeHTML(entry.id)}" class="${entry.id === store.state.subcategoryId ? "active" : ""}"${entry.id === store.state.subcategoryId ? ` aria-current="location"` : ""}><span>${String(index + 1).padStart(2, "0")}</span>${escapeHTML(entry.title)}</button>`).join("")}</nav></div></div>`;
    return `<div class="view ih-workspace-view" data-qa-surface="workspace" data-motion-stage="workspace">${workspaceHeader(category, "Directory room")}${navigatorBackdrop()}${inspectorBackdrop()}<div class="ih-workspace">${categoryNav("ih-directory category-nav settings-navigator")}<article class="settings-document" data-motion-role="document">${settingSections(category)}</article>${inspector(category)}</div></div>`;
  }

  function managerHeader(manager) {
    return `<header class="manager-head" data-motion-role="masthead"><div><span class="view-kicker">${escapeHTML(concept.name)} manager · ${MODEL_NAME}</span><h1 tabindex="-1" data-focus-key="screen-heading" data-view-heading>${escapeHTML(manager.title)}</h1><p>${escapeHTML(manager.purpose)}</p></div><div class="button-row"><button class="quiet-button" type="button" data-home>${icon("home")} Settings Home</button>${manager.id !== "providers" ? `<button class="text-button" type="button" data-manager="providers">Provider manager</button>` : ""}</div>${search(`manager:${manager.id}`, `${routeClass}-manager-search`)}</header>`;
  }

  const providerTabs = [
    ["overview", "Overview"], ["accounts", "Accounts & Connections"], ["models", "Models"], ["usage", "Usage"], ["routing", "Routing & Priority"], ["roles", "Roles"], ["support", "Support"]
  ];

  function tabs() {
    return `<div class="manager-tabs provider-tabs" role="tablist" aria-label="Provider manager sections">${providerTabs.map(([id, label], index) => `<button type="button" role="tab" id="provider-tab-${id}" aria-controls="provider-panel" aria-selected="${store.state.managerTab === id}" tabindex="${store.state.managerTab === id ? 0 : -1}" class="manager-tab${store.state.managerTab === id ? " active" : ""}" data-manager-tab="${id}" data-focus-key="provider-tab:${id}">${escapeHTML(label)}</button>`).join("")}</div>`;
  }

  function providerList(provider) {
    return `<div class="provider-list resource-list manager-master" aria-label="Provider families">${store.providers.map((entry) => `<button type="button" class="resource-row${entry.id === provider.id ? " selected" : ""}" data-provider="${escapeHTML(entry.id)}" data-focus-key="provider:${escapeHTML(entry.id)}"${entry.id === provider.id ? ` aria-current="true"` : ""}><span class="resource-copy"><strong>${escapeHTML(entry.name)}</strong><p>${escapeHTML(entry.summary)}</p></span>${status(entry.stateLabel || entry.state)}</button>`).join("")}</div>`;
  }

  function activeAccount(provider) {
    return provider.accounts?.find((entry) => entry.id === store.state.selectedAccountId) || provider.accounts?.find((entry) => entry.id === provider.activeAccountId) || provider.accounts?.[0] || null;
  }

  function providerFacts(provider, account) {
    const connection = account?.connectionRecord || provider.connections?.find((entry) => entry.accountId === account?.id);
    const product = account?.productRecord || provider.products?.find((entry) => entry.accountId === account?.id);
    return `<div class="detail-grid hierarchy-facts"><div class="detail-fact"><small>Current future route</small><strong>${escapeHTML(provider.accounts?.find((entry) => entry.id === provider.activeAccountId)?.name || "No route selected")}</strong></div><div class="detail-fact"><small>Captured in-flight route</small><strong>${escapeHTML(provider.accounts?.find((entry) => entry.id === provider.inFlightAccountId)?.name || "No in-flight route")}</strong></div><div class="detail-fact"><small>Connection</small><strong>${escapeHTML(connection?.name || account?.connection || "Not configured")}</strong></div><div class="detail-fact"><small>Product or plan</small><strong>${escapeHTML(product?.name || product?.label || account?.product || "Not discovered")}</strong></div><div class="detail-fact"><small>Usage snapshot</small><strong>${escapeHTML(product?.usage?.summary || account?.usage || "Unavailable")}</strong></div><div class="detail-fact"><small>What happens next</small><strong>${escapeHTML(product?.nextAction || account?.next || "Stop and wait")}</strong></div></div>`;
  }

  function providerIsRefreshing(provider) {
    return provider?.state === "refreshing"
      || store.state.refreshingProviderIds?.includes(provider?.id)
      || store.state.managerStates?.providers === "refreshing";
  }

  function providerRefreshButton(provider, className = "text-button", label = "Refresh catalogue") {
    const refreshing = providerIsRefreshing(provider);
    return `<button class="${escapeHTML(className)}" type="button" data-provider-refresh="${escapeHTML(provider.id)}"${refreshing ? ` disabled aria-describedby="provider-refresh-${escapeHTML(provider.id)}"` : ""}>${icon("refresh")} ${refreshing ? "Refreshing catalogue…" : escapeHTML(label)}</button>`;
  }

  function providerRefreshProgress(provider, area = "catalogue") {
    if (!providerIsRefreshing(provider)) return "";
    const rows = provider.models?.length || 0;
    return `<div class="inline-operation provider-refresh-progress" id="provider-refresh-${escapeHTML(provider.id)}" role="status" aria-live="polite" data-qa-provider-refresh="active" data-refresh-area="${escapeHTML(area)}">
      <strong>Checking ${escapeHTML(provider.name)} ${escapeHTML(area)}</strong>
      <span>${rows} last-known-good ${rows === 1 ? "row remains" : "rows remain"} active while source, catalogue, and readiness evidence are validated.</span>
      <ol class="refresh-stage-list" aria-label="Refresh stages"><li data-refresh-stage="connection">Connection checked</li><li data-refresh-stage="catalogue">Catalogue validating</li><li data-refresh-stage="readiness">Readiness pending</li></ol>
    </div>`;
  }

  function providerOverview(provider) {
    const account = activeAccount(provider);
    const refreshing = providerIsRefreshing(provider);
    const detail = `<section class="detail-panel manager-detail provider-overview"${refreshing ? ` aria-busy="true" data-refresh-state="refreshing"` : ` data-refresh-state="idle"`}><div class="section-heading"><div><h2 tabindex="-1" data-focus-key="provider-heading">${escapeHTML(provider.name)}</h2><p class="surface-note">${escapeHTML(provider.group || "Provider family")}</p></div>${status(provider.stateLabel || provider.state)}</div><p class="view-lead">${escapeHTML(provider.summary)}</p>${providerRefreshProgress(provider, "connection and catalogue evidence")}${providerFacts(provider, account)}<section class="evidence-card"><span class="view-kicker">Latest qualification evidence</span><strong>${escapeHTML(account?.lastUse || provider.catalogue?.lastActivated || "No readiness evidence")}</strong><p>${escapeHTML(account?.readinessReason || provider.catalogue?.validation || "Authentication, catalogue discovery and safe invocation are tracked separately.")}</p></section><div class="button-row">${providerRefreshButton(provider, "action-button")}<button class="text-button" type="button" data-manager-tab="accounts">Inspect accounts</button><button class="text-button" type="button" data-manager-tab="models">Review models</button></div></section>`;
    if (conceptId === "switchboard") return `<div class="provider-layout sb-topology"><section class="sb-topology-map" aria-label="Current provider topology" data-motion-role="signal" data-allow-horizontal-scroll><div class="topology-node source"><span>Provider family</span><strong>${escapeHTML(provider.name)}</strong></div><span class="topology-link" aria-hidden="true"></span><div class="topology-node"><span>Active connection</span><strong>${escapeHTML(account?.connection || "Not configured")}</strong></div><span class="topology-link" aria-hidden="true"></span><div class="topology-node"><span>Readiness</span><strong>${escapeHTML(humanize(provider.state))}</strong></div></section>${providerList(provider)}${detail}</div>`;
    if (conceptId === "wayfinder") return `<div class="provider-layout wf-setup-journey"><ol class="journey-steps"><li class="complete"><span>1</span><strong>Choose provider</strong></li><li class="${account ? "complete" : ""}"><span>2</span><strong>Connect identity</strong></li><li class="${provider.models?.length ? "complete" : ""}"><span>3</span><strong>Verify models</strong></li><li><span>4</span><strong>Assign future routes</strong></li></ol>${providerList(provider)}${detail}</div>`;
    if (conceptId === "ledger") return `<div class="provider-layout lg-hierarchy-ledger"><section class="ledger-master provider-ledger manager-master" aria-label="Provider hierarchy"><div class="ledger-heading" aria-hidden="true"><span>Provider family</span><span>Connection state</span><span>Models</span><span>Action</span></div>${store.providers.map((entry) => `<button type="button" class="ledger-resource-row${entry.id === provider.id ? " selected" : ""}" data-provider="${escapeHTML(entry.id)}" data-focus-key="provider:${escapeHTML(entry.id)}"><strong data-label="Provider family">${escapeHTML(entry.name)}</strong><span data-label="Connection state">${escapeHTML(humanize(entry.state))}</span><span data-label="Models">${entry.models?.length || 0}</span><span data-label="Action">Inspect ${icon("arrow")}</span></button>`).join("")}</section>${detail}</div>`;
    return `<div class="provider-layout ih-catalogue">${providerList(provider)}${detail}<aside class="catalogue-inspector" data-motion-role="inspector"><span class="view-kicker">Catalogue address</span><strong>${escapeHTML(provider.name)} / ${escapeHTML(account?.name || "No account")}</strong><p>${escapeHTML(account?.isolation || "No isolation model discovered")}</p><dl><div><dt>Credential owner</dt><dd>${escapeHTML(account?.authOwner || "Not configured")}</dd></div><div><dt>Runtime adapter</dt><dd>${escapeHTML(account?.runtimeAdapter || provider.runtimeAdapters?.[0]?.name || "Provider adapter")}</dd></div></dl></aside></div>`;
  }

  function providerAccounts(provider) {
    const account = activeAccount(provider);
    const rows = provider.accounts || [];
    return `<div class="account-board ${routeClass}-account-board"><section class="manager-master resource-list"><header><h2>${escapeHTML(provider.name)} accounts and connections</h2><p>Selection opens evidence. “Use for future requests” is the only action that changes routing preference.</p></header>${rows.length ? rows.map((entry) => `<button type="button" class="resource-row${entry.id === account?.id ? " selected" : ""}" data-account-select="${escapeHTML(entry.id)}" data-focus-key="account:${escapeHTML(entry.id)}"><span class="resource-copy"><strong>${escapeHTML(entry.name)}</strong><p>${escapeHTML(entry.identity)} · ${escapeHTML(entry.connection)}</p></span><span class="resource-meta">${entry.id === provider.inFlightAccountId ? status("In flight", "managed") : ""}${status(entry.state)}</span></button>`).join("") : `<div class="empty-manager"><strong>No account exists yet</strong><span>Open provider-owned setup to create or connect one.</span></div>`}</section>${account ? `<section class="detail-panel manager-detail"><div class="section-heading"><div><h2 tabindex="-1" data-focus-key="account-heading">${escapeHTML(account.name)}</h2><p>${escapeHTML(account.identity)}</p></div>${status(account.state)}</div>${providerFacts(provider, account)}<dl class="detail-list"><div><dt>Credential owner</dt><dd>${escapeHTML(account.authOwner)}</dd></div><div><dt>Isolation</dt><dd>${escapeHTML(account.isolation)}</dd></div><div><dt>Latest use</dt><dd>${escapeHTML(account.lastUse)}</dd></div><div><dt>Sticky-session preference</dt><dd>${escapeHTML(account.stickySession || "Keep the captured route for the request")}</dd></div></dl><div class="button-row"><button class="action-button" type="button" data-account-use="${escapeHTML(account.id)}"${account.id === provider.activeAccountId ? " disabled" : ""}>${account.id === provider.activeAccountId ? "Current future route" : "Use for future requests"}</button><button class="text-button" type="button" data-provider-action="logs">Open redacted history</button></div></section>` : ""}</div>`;
  }

  function modelCapabilities(model) {
    const records = Array.isArray(model.capabilityEvidence) ? model.capabilityEvidence : [];
    if (records.length) return `<ul class="capability-list">${records.map((record) => `<li><span>${escapeHTML(record.capability || record.name)}</span>${status(record.status)}<small>${escapeHTML(record.source || record.evidence)} · ${escapeHTML(record.checked || record.freshness)}</small></li>`).join("")}</ul>`;
    return `<p class="fineprint">${escapeHTML(model.capabilities || "Capabilities remain unverified")}</p>`;
  }

  function providerModels(provider) {
    const models = provider.models || [];
    const refreshing = providerIsRefreshing(provider);
    return `<div class="model-board ${routeClass}-model-board"${refreshing ? ` aria-busy="true" data-refresh-state="refreshing"` : ` data-refresh-state="idle"`}><div class="section-heading"><div><h2>${escapeHTML(provider.name)} model catalogue</h2><p>Controls appear only when current evidence supports them. Unavailable routes remain inspectable and read-only.</p></div>${providerRefreshButton(provider, "text-button", "Refresh")}</div>${providerRefreshProgress(provider, "catalogue")}${models.length ? models.map((model, index) => {
      const unavailable = model.state === "unavailable" || model.available === false;
      return `<article class="model-row" data-model-id="${escapeHTML(model.id)}" data-motion-key="model:${escapeHTML(model.id)}"><button class="icon-action star-button${model.favorite ? " active" : ""}" type="button" data-model-favorite="${escapeHTML(model.id)}" aria-pressed="${Boolean(model.favorite)}" aria-label="${model.favorite ? "Remove favorite from" : "Favorite"} ${escapeHTML(model.name)}"${unavailable ? " disabled" : ""}>${icon("star")}</button><div class="model-name"><strong>${escapeHTML(model.name)}</strong><small>${escapeHTML(model.evidence || "No evidence")} · ${escapeHTML(model.contextLimit || "Context limit unverified")}${model.reason ? ` · ${escapeHTML(model.reason)}` : ""}</small>${modelCapabilities(model)}<div class="model-controls"><label>Alias<input type="text" data-model-alias="${escapeHTML(model.id)}" value="${escapeHTML(model.alias || model.name)}" aria-label="Alias for ${escapeHTML(model.name)}"${unavailable ? " disabled" : ""}></label><label>Visibility<select data-model-visible="${escapeHTML(model.id)}"${unavailable ? " disabled" : ""}><option${model.hidden ? "" : " selected"}>Shown</option><option${model.hidden ? " selected" : ""}>Hidden</option></select></label><label>Mode<select data-model-speed="${escapeHTML(model.id)}"${unavailable ? " disabled" : ""}><option>Normal</option>${model.fastSupported ? `<option${model.speed === "Fast" ? " selected" : ""}>Fast</option>` : ""}</select></label>${model.effort?.length ? `<label>Effort<select data-model-effort="${escapeHTML(model.id)}"${unavailable ? " disabled" : ""}>${model.effort.map((effort) => `<option${effort === model.selectedEffort ? " selected" : ""}>${escapeHTML(effort)}</option>`).join("")}</select></label>` : `<span class="fineprint">Effort not supported</span>`}</div></div><div class="resource-meta">${status(model.state)}<span class="status-label">Priority ${model.priority || index + 1}</span><button class="icon-action" type="button" data-model-move="${escapeHTML(model.id)}" data-direction="-1" aria-label="Move ${escapeHTML(model.name)} earlier"${index === 0 || unavailable ? " disabled" : ""}><span class="move-up">${icon("arrow")}</span></button><button class="icon-action" type="button" data-model-move="${escapeHTML(model.id)}" data-direction="1" aria-label="Move ${escapeHTML(model.name)} later"${index === models.length - 1 || unavailable ? " disabled" : ""}><span class="move-down">${icon("arrow")}</span></button></div></article>`;
    }).join("") : `<div class="empty-manager"><strong>No model rows are active</strong><span>Setup and readiness evidence are required before controls appear.</span></div>`}</div>`;
  }

  function providerUsage(provider) {
    const rows = provider.accounts || [];
    return `<section class="usage-board"><div class="section-heading"><div><h2 tabindex="-1" data-focus-key="provider-usage-heading">Usage and extra usage</h2><p>Read-only, source-labelled snapshots from Usage. Settings never calculates balances, resets, projections, or forecasts.</p></div><button class="text-button" type="button" data-provider-usage-handoff>Open measured Usage detail</button></div><p class="surface-note">The production action hands off to the Usage owner and preserves this provider/account context. This standalone concept records an explicit simulation receipt instead.</p>${rows.length ? rows.map((account) => `<article class="usage-row"><div><span class="view-kicker">${escapeHTML(account.product || "Product not discovered")}</span><h3>${escapeHTML(account.name)}</h3><p>${escapeHTML(account.usage)}</p></div><div><small>Provider report</small><strong>${escapeHTML(account.usageFreshness || "Checked 9 minutes ago")}</strong></div><div><small>What happens next</small><strong>${escapeHTML(account.next || "Stop and wait")}</strong></div>${status(account.state)}</article>`).join("") : `<div class="empty-manager">Usage becomes available after a product or plan is discovered.</div>`}</section>`;
  }

  function providerRouting(provider) {
    const account = activeAccount(provider);
    return `<section class="routing-board detail-panel"><div class="section-heading"><div><h2>Routing and priority</h2><p>Requested and captured routes remain separate. Changes affect future requests only.</p></div>${status(account?.id === provider.inFlightAccountId ? "Requested equals effective" : "Effective value differs", "managed")}</div><div class="route-comparison"><div><small>Requested for future work</small><strong>${escapeHTML(provider.accounts?.find((entry) => entry.id === provider.activeAccountId)?.name || "No route")}</strong></div>${icon("arrow")}<div><small>Effective for in-flight work</small><strong>${escapeHTML(provider.accounts?.find((entry) => entry.id === provider.inFlightAccountId)?.name || "No in-flight route")}</strong></div></div><p class="state-reason">The in-flight request keeps its captured account, model, permission, and product route. New work uses the selected future preference.</p><h3>Connection priority</h3><ol class="priority-list">${(provider.accounts || []).map((entry, index) => `<li><span>${index + 1}</span><strong>${escapeHTML(entry.name)}</strong><small>${escapeHTML(entry.connection)}</small></li>`).join("")}</ol></section>`;
  }

  function providerRoles() {
    const routes = ["5.6 Sol — Personal Codex", "Claude Sonnet — Personal profile", "Use Main Assistant", "Qualified route pool", "Ask each time", "Bounded Research"];
    return `<section class="detail-panel role-board"><h2>Role assignments</h2><p>Assignments select qualified future routes; they cannot widen permission ceilings or silently downgrade planning conversation quality.</p>${store.roles.map((role) => `<div class="role-row"><label for="role-${escapeHTML(role.id)}">${escapeHTML(role.label)}<span class="fineprint">${escapeHTML(role.quality)}</span></label><select id="role-${escapeHTML(role.id)}" data-role="${escapeHTML(role.id)}">${routes.map((route) => `<option${route === role.route ? " selected" : ""}>${escapeHTML(route)}</option>`).join("")}</select></div>`).join("")}</section>`;
  }

  function providerSupport(provider) {
    const action = provider.state === "not-installed" ? "install" : /setup|signed-out/.test(provider.state) ? "setup" : provider.state === "degraded" ? "repair" : "reconnect";
    const operation = store.providerOperation?.(provider.id) || store.state.providerOperations?.[provider.id];
    const refreshing = providerIsRefreshing(provider);
    return `<section class="detail-panel support-board"${refreshing || operation?.status === "running" ? ` aria-busy="true" data-refresh-state="refreshing"` : ` data-refresh-state="idle"`}><h2>Readiness, receipts and diagnostics</h2><p class="view-lead">Every external operation is an explicit simulation. No login, installation, billing, provider call, or credential access occurs.</p>${providerRefreshProgress(provider, "support evidence")}<div class="detail-grid"><div class="detail-fact"><small>Provider</small><strong>${escapeHTML(provider.name)}</strong></div><div class="detail-fact"><small>Last-known-good</small><strong>${provider.models?.length || 0} active catalogue rows retained</strong></div><div class="detail-fact"><small>Catalogue source</small><strong>${escapeHTML(provider.catalogue?.sourceVersion || "Fixture catalogue v2026.08")}</strong></div><div class="detail-fact"><small>Validation</small><strong>${escapeHTML(provider.catalogue?.validation || humanize(operation?.status || "Ready"))}</strong></div></div><div class="button-row">${providerRefreshButton(provider, "text-button")}<button class="action-button" type="button" data-provider-action="${action}">${action === "install" ? "Open installation guidance" : action === "setup" ? "Open provider-owned setup" : "Record simulated repair"}</button><button class="text-button" type="button" data-provider-action="logs">Open redacted history</button></div>${operation ? `<div class="inline-operation" role="status"><strong>${escapeHTML(humanize(operation.status))}</strong><span>${escapeHTML(operation.message || "Last-known-good data remains visible.")}</span></div>` : ""}</section>`;
  }

  function providerManager() {
    const provider = store.provider();
    let content = providerOverview(provider);
    if (store.state.managerTab === "accounts") content = providerAccounts(provider);
    if (store.state.managerTab === "models") content = providerModels(provider);
    if (store.state.managerTab === "usage") content = providerUsage(provider);
    if (store.state.managerTab === "routing") content = providerRouting(provider);
    if (store.state.managerTab === "roles") content = providerRoles();
    if (store.state.managerTab === "support") content = providerSupport(provider);
    return `${tabs()}<div class="manager-content" id="provider-panel" role="tabpanel" tabindex="-1" aria-labelledby="provider-tab-${escapeHTML(store.state.managerTab)}" data-manager-content>${content}</div>`;
  }

  function memoryDetail(selected) {
    if (!selected) return `<section class="detail-panel empty-manager"><strong>No Gist selected</strong><span>Change the filter or choose another evidence record.</span></section>`;
    const versions = selected.versions || [{ version: selected.version || 1, summary: selected.summary, state: selected.state, created: selected.lastAccess }];
    return `<section class="detail-panel memory-evidence manager-detail" data-memory-detail="${escapeHTML(selected.id)}"><div class="section-heading"><div><h2 tabindex="-1" data-focus-key="memory-heading">${escapeHTML(selected.title)}</h2><p>Version ${escapeHTML(selected.currentVersion || selected.version || versions.length)} · ${escapeHTML(selected.lastAccess || "Today")}</p></div>${selected.pinned ? status("Pinned", "managed") : status(selected.state)}</div><textarea class="memory-editor" data-memory-draft="${escapeHTML(selected.id)}" aria-label="Correct ${escapeHTML(selected.title)}">${escapeHTML(selected.summary)}</textarea><div class="detail-grid"><div class="detail-fact"><small>Evidence source</small><strong>${escapeHTML(selected.source)}</strong></div><div class="detail-fact"><small>Recall behavior</small><strong>${escapeHTML(selected.halfLife)}</strong></div><div class="detail-fact"><small>Scope</small><strong>${escapeHTML(selected.scope)}</strong></div><div class="detail-fact"><small>Retention and redaction</small><strong>${escapeHTML(selected.retention || "Retain evidence; redact secrets")}</strong></div></div><details class="disclosure"><summary>Context capsule preview</summary><p>${escapeHTML(selected.capsulePreview || selected.capsule || selected.summary)}</p></details><div class="button-row"><button class="action-button" type="button" data-memory-save="${escapeHTML(selected.id)}">Save correction as new version</button><button class="text-button" type="button" data-memory-verify="${escapeHTML(selected.id)}"${selected.state === "verified" ? " disabled" : ""}>Verify evidence</button><button class="text-button" type="button" data-memory-pin="${escapeHTML(selected.id)}">${selected.pinned ? "Remove protection" : "Protect with pin"}</button><button class="text-button danger-text" type="button" data-memory-discard="${escapeHTML(selected.id)}">Discard with Undo</button></div><section class="memory-version-list"><h3>Version history</h3>${versions.slice().reverse().map((version) => `<button type="button" data-memory-restore="${escapeHTML(selected.id)}" data-version="${escapeHTML(version.version)}"${Number(version.version) === Number(selected.currentVersion || selected.version) ? " disabled" : ""}><span><strong>Version ${escapeHTML(version.version)}</strong><small>${escapeHTML(version.createdAt || version.created || version.when || "Earlier evidence")}</small></span><span>${escapeHTML(version.summary)}</span></button>`).join("")}</section></section>`;
  }

  function memoryDetailComplete(selected) {
    if (!selected) return `<section class="detail-panel empty-manager"><strong>No Gist selected</strong><span>Change the filters or choose another evidence record.</span></section>`;
    const versions = selected.versions || [];
    const evidence = selected.evidence || [];
    const access = selected.accessHistory || [];
    return `<section class="detail-panel memory-evidence manager-detail" data-memory-detail="${escapeHTML(selected.id)}">
      <div class="section-heading"><div><h2 tabindex="-1" data-focus-key="memory-heading">${escapeHTML(selected.title)}</h2><p>Immutable version ${escapeHTML(selected.version || versions.length)} · ${escapeHTML(selected.lastAccess || "Today")}</p></div>${selected.pinned ? status("Pinned", "managed") : status(selected.state)}</div>
      <textarea class="memory-editor" data-memory-draft="${escapeHTML(selected.id)}" aria-label="Correct ${escapeHTML(selected.title)}">${escapeHTML(selected.summary)}</textarea>
      <dl class="detail-list"><div><dt>Provenance</dt><dd>${escapeHTML(selected.source)}</dd></div><div><dt>Scope</dt><dd>${escapeHTML(selected.scope)}</dd></div><div><dt>Recall half-life</dt><dd>${escapeHTML(selected.halfLife)} — this changes recall frequency, never truth.</dd></div><div><dt>Retention and redaction</dt><dd>${escapeHTML(selected.retention || "Retain evidence")} · ${escapeHTML(selected.redaction || "Secrets redacted")}</dd></div></dl>
      <section class="evidence-list"><h3>Supporting evidence</h3>${evidence.length ? evidence.map((item) => `<article><div>${status(item.state || item.status || "Evidence", toneFor(item.state || item.status))}<strong>${escapeHTML(item.title || item.kind || "Evidence record")}</strong></div><p>${escapeHTML(item.summary || item.detail || item.source || item)}</p><small>${escapeHTML(item.source || "Recorded source")} · ${escapeHTML(item.capturedAt || item.when || "Fixture history")}</small></article>`).join("") : `<p class="fineprint">The source and version record are the available evidence for this fixture.</p>`}</section>
      <details class="disclosure"><summary>Context capsule preview</summary><div class="capsule-preview"><h3>${escapeHTML(selected.title)}</h3><p>${escapeHTML(selected.capsulePreview || selected.capsule || selected.summary)}</p><small>Scope: ${escapeHTML(selected.scope)} · Version ${escapeHTML(selected.version)}</small></div></details>
      <div class="button-row"><button class="action-button" type="button" data-memory-save="${escapeHTML(selected.id)}">Save correction as new version</button><button class="text-button" type="button" data-memory-verify="${escapeHTML(selected.id)}"${selected.state === "verified" ? " disabled" : ""}>Verify evidence</button><button class="text-button" type="button" data-memory-pin="${escapeHTML(selected.id)}">${selected.pinned ? "Remove protection" : "Protect with pin"}</button><button class="text-button danger-text" type="button" data-memory-discard="${escapeHTML(selected.id)}">Discard with Undo</button></div>
      <section class="memory-version-list"><h3>Immutable version history</h3>${versions.slice().reverse().map((version) => `<button type="button" data-memory-restore="${escapeHTML(selected.id)}" data-version="${escapeHTML(version.version)}"${Number(version.version) === Number(selected.version) ? " disabled" : ""}><span><strong>Version ${escapeHTML(version.version)}</strong><small>${escapeHTML(version.createdAt || version.when || "Earlier evidence")}</small></span><span>${escapeHTML(version.summary)}</span></button>`).join("")}</section>
      <section class="access-history"><h3>Access history</h3>${access.slice(-5).map((item) => `<div><strong>${escapeHTML(item.reason || item.action || "Used by Assistant")}</strong><span>${escapeHTML(item.at || item.when || "Earlier")} · ${escapeHTML(item.surface || item.scope || "Conversation")}</span></div>`).join("")}</section>
    </section>`;
  }

  function memoryManager() {
    const items = store.filteredMemories();
    const selected = store.memories.find((entry) => entry.id === store.state.selectedMemoryId) || items[0];
    const filters = store.state.memoryFilters || {};
    const selectOptions = (values, current) => values.map(([value, label]) => `<option value="${escapeHTML(value)}"${value === current ? " selected" : ""}>${escapeHTML(label)}</option>`).join("");
    const toolbar = `<div class="memory-toolbar"><label class="search-box">${icon("search")}<span class="sr-only">Filter Memory Gists</span><input type="search" data-memory-search value="${escapeHTML(store.state.memoryQuery || "")}" placeholder="Filter Gists, scope, kind or evidence"></label><label>Review state<select data-memory-filter="state">${selectOptions([["all","All states"],["verified","Verified"],["awaiting-review","Awaiting review"],["potential-conflict","Potential conflict"]], filters.state || "all")}</select></label><label>Kind<select data-memory-filter="kind">${selectOptions([["all","All kinds"],["Preference","Preference"],["Project fact","Project fact"],["Correction","Correction"],["Procedure","Procedure"]], filters.kind || "all")}</select></label><label>Scope<select data-memory-filter="scope">${selectOptions([["all","All scopes"],["Global","Global"],["Project","Project"],["Thread","Thread"]], filters.scope || "all")}</select></label><label>Protection<select data-memory-filter="pinned">${selectOptions([["all","Pinned and unpinned"],["pinned","Pinned"],["unpinned","Unpinned"]], filters.pinned || "all")}</select></label><button class="quiet-button" type="button" data-memory-rebuild>${icon("refresh")} Rebuild and deduplicate</button></div>`;
    const list = `<section class="memory-index manager-master resource-list">${items.length ? items.map((memory) => `<button class="resource-row${memory.id === selected?.id ? " selected" : ""}" type="button" data-memory="${escapeHTML(memory.id)}" data-focus-key="memory:${escapeHTML(memory.id)}"><span class="resource-copy"><strong>${escapeHTML(memory.title)}</strong><p>${escapeHTML(memory.kind)} · ${escapeHTML(memory.scope)}</p></span>${status(memory.state)}</button>`).join("") : `<div class="empty-manager"><strong>No Gists match</strong><span>Clear filters to return to the evidence archive.</span></div>`}</section>`;
    const detail = memoryDetailComplete(selected);
    if (conceptId === "switchboard") return `${toolbar}<div class="memory-layout sb-memory-queue"><aside class="queue-summary"><span>Awaiting review</span><strong>${store.memories.filter((entry) => /review|conflict/.test(entry.state)).length}</strong><small>Evidence records requiring a decision</small></aside>${list}${detail}</div>`;
    if (conceptId === "wayfinder") return `${toolbar}<div class="memory-layout wf-memory-journey"><ol class="journey-steps"><li class="complete"><span>1</span><strong>Find the Gist</strong></li><li><span>2</span><strong>Inspect evidence</strong></li><li><span>3</span><strong>Correct or verify</strong></li><li><span>4</span><strong>Control recall</strong></li></ol>${list}${detail}</div>`;
    if (conceptId === "ledger") return `${toolbar}<div class="memory-layout lg-memory-ledger"><div class="ledger-heading"><span>Gist</span><span>Scope</span><span>Version</span><span>State</span></div>${items.map((memory) => `<button class="ledger-resource-row${memory.id === selected?.id ? " selected" : ""}" type="button" data-memory="${escapeHTML(memory.id)}"><strong>${escapeHTML(memory.title)}</strong><span>${escapeHTML(memory.scope)}</span><span>${escapeHTML(memory.currentVersion || memory.version)}</span><span>${escapeHTML(humanize(memory.state))}</span></button>`).join("")}${detail}</div>`;
    return `${toolbar}<div class="memory-layout ih-memory-archive">${list}${detail}<aside class="catalogue-inspector"><span class="view-kicker">Archive evidence</span><strong>${escapeHTML(selected?.source || "No source")}</strong><p>Half-life controls recall frequency; it never makes stored evidence false or deletes it.</p></aside></div>`;
  }

  function memoryManagerComplete() {
    const items = store.filteredMemories();
    const selected = store.memories.find((entry) => entry.id === store.state.selectedMemoryId) || items[0];
    const filters = store.state.memoryFilters || {};
    const optionList = (allLabel, values, current) => [["all", allLabel], ...[...new Set(values)].sort().map((value) => [value, value])].map(([value, label]) => `<option value="${escapeHTML(value)}"${value === current ? " selected" : ""}>${escapeHTML(label)}</option>`).join("");
    const toolbar = `<div class="memory-toolbar"><label class="search-box">${icon("search")}<span class="sr-only">Filter Memory Gists</span><input type="search" data-memory-search value="${escapeHTML(store.state.memoryQuery || "")}" placeholder="Filter Gists, scope, kind or evidence"></label><label>Review state<select data-memory-filter="state">${optionList("All states", store.memories.map((item) => item.state), filters.state || "all")}</select></label><label>Kind<select data-memory-filter="kind">${optionList("All kinds", store.memories.map((item) => item.kind), filters.kind || "all")}</select></label><label>Scope<select data-memory-filter="scope">${optionList("All scopes", store.memories.map((item) => item.scope), filters.scope || "all")}</select></label><label>Protection<select data-memory-filter="pinned"><option value="all"${filters.pinned === "all" ? " selected" : ""}>Pinned and unpinned</option><option value="pinned"${filters.pinned === "pinned" ? " selected" : ""}>Pinned</option><option value="unpinned"${filters.pinned === "unpinned" ? " selected" : ""}>Unpinned</option></select></label><button class="quiet-button" type="button" data-memory-rebuild>${icon("refresh")} Rebuild and deduplicate</button></div>`;
    const list = `<section class="memory-index manager-master resource-list">${items.length ? items.map((memory) => `<button class="resource-row${memory.id === selected?.id ? " selected" : ""}" type="button" data-memory="${escapeHTML(memory.id)}" data-focus-key="memory:${escapeHTML(memory.id)}"><span class="resource-copy"><strong>${escapeHTML(memory.title)}</strong><p>${escapeHTML(memory.kind)} · ${escapeHTML(memory.scope)} · Version ${escapeHTML(memory.version)}</p></span>${memory.pinned ? status("Pinned", "managed") : status(memory.state)}</button>`).join("") : `<div class="empty-manager"><strong>No Gists match</strong><span>Clear one or more filters to return to the evidence archive.</span></div>`}</section>`;
    const detail = memoryDetailComplete(selected);
    if (conceptId === "switchboard") return `${toolbar}<div class="memory-layout sb-memory-queue"><aside class="queue-summary"><span>Awaiting review</span><strong>${store.memories.filter((entry) => /review|conflict/.test(entry.state)).length}</strong><small>Evidence records requiring a decision</small></aside>${list}${detail}</div>`;
    if (conceptId === "wayfinder") return `${toolbar}<div class="memory-layout wf-memory-journey"><ol class="journey-steps"><li class="complete"><span>1</span><strong>Find the Gist</strong></li><li><span>2</span><strong>Inspect evidence</strong></li><li><span>3</span><strong>Correct or verify</strong></li><li><span>4</span><strong>Control recall</strong></li></ol>${list}${detail}</div>`;
    if (conceptId === "ledger") return `${toolbar}<div class="memory-layout lg-memory-ledger"><section class="ledger-master memory-ledger manager-master" aria-label="Memory evidence ledger"><div class="ledger-heading" aria-hidden="true"><span>Gist</span><span>Scope</span><span>Version</span><span>State</span></div>${items.map((memory) => `<button class="ledger-resource-row${memory.id === selected?.id ? " selected" : ""}" type="button" data-memory="${escapeHTML(memory.id)}" data-focus-key="memory:${escapeHTML(memory.id)}"><strong data-label="Gist">${escapeHTML(memory.title)}</strong><span data-label="Scope">${escapeHTML(memory.scope)}</span><span data-label="Version">${escapeHTML(memory.version)}</span><span data-label="State">${escapeHTML(humanize(memory.state))}</span></button>`).join("")}</section>${detail}</div>`;
    return `${toolbar}<div class="memory-layout ih-memory-archive">${list}${detail}<aside class="catalogue-inspector"><span class="view-kicker">Archive evidence</span><strong>${escapeHTML(selected?.source || "No source")}</strong><p>Half-life controls recall frequency; it never makes stored evidence false or deletes it.</p></aside></div>`;
  }

  const terminalFields = [
    ["shell", "Shell", ["Auto-detected login shell", "/bin/zsh", "/bin/bash"]],
    ["fallbackShell", "Fallback shell", ["Use login shell", "/bin/zsh", "/bin/bash"]],
    ["font", "Font", ["SF Mono", "Berkeley Mono", "IBM Plex Mono"]],
    ["fallbackFont", "Fallback font", ["System monospace", "SF Mono", "IBM Plex Mono"]],
    ["cursor", "Cursor", ["Block", "Beam", "Underline"]],
    ["palette", "ANSI palette", ["Friendly Night", "Low Glare", "Amber Paper", "Theme palette"]],
    ["material", "Material", ["Theme surface", "Opaque", "Translucent when supported"]],
    ["cwd", "Working directory", ["Active project", "Active worktree", "Project root"]],
    ["environment", "Environment policy", ["Inherit safe project variables", "Clean environment", "Ask before additions"]],
    ["transcript", "Transcript", ["Do not keep", "Keep 7 days", "Keep 30 days"]],
    ["rendering", "Rendering", ["Automatic", "GPU preferred", "Software fallback"]],
    ["startup", "Startup", ["Open on first command", "Restore last session", "Manual"]]
  ];

  const terminalChoices = (choices, current) => [...new Set([current, ...choices].filter((value) => value !== undefined && value !== null && value !== ""))];

  function terminalDetail(profile) {
    if (!profile) return `<section class="detail-panel empty-manager">No Terminal profile selected.</section>`;
    const draft = profile.draft || profile;
    const dirty = Boolean(profile.dirty);
    const pending = store.state.pendingTerminalSwitch;
    return `<section class="detail-panel terminal-editor manager-detail" data-terminal-detail="${escapeHTML(profile.id)}"><div class="section-heading"><div><h2 tabindex="-1" data-focus-key="terminal-heading">${escapeHTML(profile.name)}</h2><p>Draft changes update this local preview before Apply.</p></div>${dirty ? status("Unsaved draft", "warning") : status(profile.managed ? "Managed" : "Saved")}</div>${pending ? `<div class="inline-operation warning"><strong>Unsaved draft</strong><span>Apply or discard the current draft before switching profiles.</span><div class="button-row"><button type="button" data-terminal-keep>Keep editing</button><button type="button" data-terminal-discard-switch>Discard and switch</button></div></div>` : ""}<div class="terminal-form">${terminalFields.map(([key, label, choices]) => `<label>${label}<select data-terminal-field="${key}" data-focus-key="terminal:${escapeHTML(profile.id)}:${key}"${profile.managed ? " disabled" : ""}>${choices.map((choice) => `<option${choice === draft[key] ? " selected" : ""}>${escapeHTML(choice)}</option>`).join("")}</select></label>`).join("")}<label>Font size<input type="number" min="10" max="22" data-terminal-field="fontSize" data-focus-key="terminal:${escapeHTML(profile.id)}:fontSize" value="${escapeHTML(draft.fontSize)}"${profile.managed ? " disabled" : ""}></label><label>Line height<input type="number" min="1.1" max="2" step="0.05" data-terminal-field="lineHeight" data-focus-key="terminal:${escapeHTML(profile.id)}:lineHeight" value="${escapeHTML(draft.lineHeight)}"${profile.managed ? " disabled" : ""}></label><label>Opacity<input type="range" min="20" max="100" data-terminal-field="opacity" data-focus-key="terminal:${escapeHTML(profile.id)}:opacity" value="${escapeHTML(Math.round(Number(draft.opacity ?? 1) * 100))}"${profile.managed ? " disabled" : ""}></label><label>Foreground<input type="text" data-terminal-field="foreground" data-focus-key="terminal:${escapeHTML(profile.id)}:foreground" value="${escapeHTML(draft.foreground || "Theme foreground")}"${profile.managed ? " disabled" : ""}></label><label>Background<input type="text" data-terminal-field="background" data-focus-key="terminal:${escapeHTML(profile.id)}:background" value="${escapeHTML(draft.background || "Theme background")}"${profile.managed ? " disabled" : ""}></label><label>Background image<input type="text" data-terminal-field="backgroundImage" data-focus-key="terminal:${escapeHTML(profile.id)}:backgroundImage" value="${escapeHTML(draft.backgroundImage || "No background image")}"${profile.managed ? " disabled" : ""}></label></div><div class="terminal-preview" dir="ltr" style="font-family:'${escapeHTML(draft.font)}',monospace;font-size:${Number(draft.fontSize)}px;line-height:${Number(draft.lineHeight)};opacity:${Number(draft.opacity ?? 1)}"><div><span>pm</span> settings inspect --effective</div><div class="terminal-output">profile  ${escapeHTML(profile.name)}<br>shell    ${escapeHTML(draft.shell)}<br>cwd      ${escapeHTML(draft.cwd)}<br>palette  ${escapeHTML(draft.palette)}<br>status   ready</div><div><span>pm</span> <i class="cursor-${escapeHTML(String(draft.cursor).toLowerCase())}"></i></div></div><div class="terminal-actions button-row"><button class="action-button" type="button" data-terminal-apply${dirty && !profile.managed ? "" : " disabled"}>Apply profile</button><button class="quiet-button" type="button" data-terminal-reset${profile.managed ? " disabled" : ""}>Reset draft</button><button class="text-button" type="button" data-terminal-diagnostics>${icon("refresh")} Run four simulated checks</button></div><p class="fineprint">Diagnostics evaluate fixture shell discovery, startup policy, palette contrast and renderer readiness. No command is executed.</p></section>`;
  }

  function terminalDetailComplete(profile) {
    if (!profile) return `<section class="detail-panel empty-manager">No Terminal profile selected.</section>`;
    const draft = profile.draft || profile;
    const dirty = Boolean(profile.dirty);
    const pending = store.state.pendingTerminalSwitch;
    const selectField = ([key, label, choices]) => `<label>${escapeHTML(label)}<select data-terminal-field="${escapeHTML(key)}" data-focus-key="terminal:${escapeHTML(profile.id)}:${escapeHTML(key)}"${profile.managed ? " disabled" : ""}>${terminalChoices(choices, draft[key]).map((choice) => `<option${choice === draft[key] ? " selected" : ""}>${escapeHTML(choice)}</option>`).join("")}</select></label>`;
    const diagnostics = Array.isArray(profile.diagnostics) ? profile.diagnostics : profile.diagnostics ? [profile.diagnostics] : [];
    return `<section class="detail-panel terminal-editor manager-detail" data-terminal-detail="${escapeHTML(profile.id)}">
      <div class="section-heading"><div><h2 tabindex="-1" data-focus-key="terminal-heading">${escapeHTML(profile.name)}</h2><p>${escapeHTML(profile.description || "Draft changes update this local preview before Apply.")}</p></div>${dirty ? status("Unsaved draft", "warning") : status(profile.managed ? "Managed" : "Saved")}</div>
      ${pending ? `<div class="inline-operation warning" role="alert"><strong>Unsaved draft</strong><span>Apply or discard the current draft before switching profiles.</span><div class="button-row"><button type="button" data-terminal-keep>Keep editing</button><button type="button" data-terminal-discard-switch>Discard and switch</button></div></div>` : ""}
      <div class="terminal-form">${terminalFields.map(selectField).join("")}
        <label>Font size<input type="number" min="10" max="22" data-terminal-field="fontSize" data-focus-key="terminal:${escapeHTML(profile.id)}:fontSize" value="${escapeHTML(draft.fontSize)}"${profile.managed ? " disabled" : ""}></label>
        <label>Line height<input type="number" min="1.1" max="2.2" step="0.05" data-terminal-field="lineHeight" data-focus-key="terminal:${escapeHTML(profile.id)}:lineHeight" value="${escapeHTML(draft.lineHeight)}"${profile.managed ? " disabled" : ""}></label>
        <label>Opacity<input type="range" min="20" max="100" data-terminal-field="opacity" data-focus-key="terminal:${escapeHTML(profile.id)}:opacity" value="${escapeHTML(Math.round(Number(draft.opacity ?? 1) * 100))}"${profile.managed ? " disabled" : ""}></label>
        <label>Foreground<input type="text" data-terminal-field="foreground" data-focus-key="terminal:${escapeHTML(profile.id)}:foreground" value="${escapeHTML(draft.foreground || "Theme foreground")}"${profile.managed ? " disabled" : ""}></label>
        <label>Background<input type="text" data-terminal-field="background" data-focus-key="terminal:${escapeHTML(profile.id)}:background" value="${escapeHTML(draft.background || "Theme background")}"${profile.managed ? " disabled" : ""}></label>
        <label>Background image<input type="text" data-terminal-field="backgroundImage" data-focus-key="terminal:${escapeHTML(profile.id)}:backgroundImage" value="${escapeHTML(draft.backgroundImage || "No background image")}"${profile.managed ? " disabled" : ""}></label>
      </div>
      <section class="palette-preview" aria-label="ANSI palette"><h3>ANSI palette</h3><div>${(draft.ansiPalette || profile.ansiPalette || []).map((color) => `<span title="${escapeHTML(color)}"></span>`).join("")}</div></section>
      <div class="terminal-preview" dir="ltr" style="font-family:'${escapeHTML(draft.font)}',monospace;font-size:${Number(draft.fontSize)}px;line-height:${Number(draft.lineHeight)};opacity:${Number(draft.opacity ?? 1)}"><div><span>pm</span> settings inspect --effective</div><div class="terminal-output">profile  ${escapeHTML(profile.name)}<br>shell    ${escapeHTML(draft.shell)}<br>cwd      ${escapeHTML(draft.cwd)}<br>palette  ${escapeHTML(draft.palette)}<br>status   ${escapeHTML(profile.state || "ready")}</div><div><span>pm</span> <i class="cursor-${escapeHTML(String(draft.cursor).toLowerCase())}"></i></div></div>
      <dl class="detail-list"><div><dt>Selection, copy and paste</dt><dd>${escapeHTML(draft.selection || profile.selection || "Theme selection")} · ${escapeHTML(draft.copyPaste || profile.copyPaste || "Explicit copy and guarded paste")}</dd></div><div><dt>Links</dt><dd>${escapeHTML(draft.links || profile.links || "Open verified links explicitly")}</dd></div><div><dt>Transcript and history</dt><dd>${escapeHTML(draft.transcript)} · ${escapeHTML(draft.historyLimit || profile.historyLimit || "Bounded history")}</dd></div></dl>
      <div class="terminal-actions button-row"><button class="action-button" type="button" data-terminal-apply${dirty && !profile.managed ? "" : " disabled"}>Apply profile</button><button class="quiet-button" type="button" data-terminal-reset${profile.managed ? " disabled" : ""}>Reset draft</button><button class="text-button" type="button" data-terminal-diagnostics>${icon("refresh")} Run four simulated checks</button></div>
      ${diagnostics.length ? `<section class="diagnostic-history"><h3>Diagnostic history</h3>${diagnostics.slice(-4).map((item) => `<div><strong>${escapeHTML(humanize(item.result || item.state || "Ready"))}</strong><span>${escapeHTML(item.at || item.lastRun || "Fixture baseline")} · No command executed</span></div>`).join("")}</section>` : ""}
      <p class="fineprint">Diagnostics evaluate fixture shell discovery, startup policy, palette contrast and renderer readiness. No command is executed, no file is changed, and no external host is contacted.</p>
    </section>`;
  }

  function terminalManager() {
    const profile = store.terminal();
    const shelf = `<section class="terminal-shelf manager-master resource-list">${store.terminals.map((entry) => `<button class="resource-row${entry.id === profile.id ? " selected" : ""}" type="button" data-terminal="${escapeHTML(entry.id)}" data-focus-key="terminal:${escapeHTML(entry.id)}"><span class="resource-copy"><strong>${escapeHTML(entry.name)}</strong><p>${escapeHTML(entry.shell)} · ${escapeHTML(entry.palette)}</p></span>${entry.default ? status("Default") : status(entry.managed ? "Managed" : "Profile", "managed")}</button>`).join("")}</section>`;
    const detail = terminalDetailComplete(profile);
    if (conceptId === "switchboard") return `<div class="terminal-layout sb-terminal-instrument"><aside class="instrument-readout"><span>Profile</span><strong>${escapeHTML(profile.name)}</strong><small>Preview is live; Apply is explicit.</small></aside>${shelf}${detail}</div>`;
    if (conceptId === "wayfinder") return `<div class="terminal-layout wf-terminal-journey"><ol class="journey-steps"><li class="complete"><span>1</span><strong>Choose profile</strong></li><li><span>2</span><strong>Tune appearance</strong></li><li><span>3</span><strong>Preview behavior</strong></li><li><span>4</span><strong>Apply and diagnose</strong></li></ol>${shelf}${detail}</div>`;
    if (conceptId === "ledger") return `<div class="terminal-layout lg-terminal-comparison"><section class="ledger-master terminal-ledger manager-master" aria-label="Terminal profile comparison"><div class="ledger-heading" aria-hidden="true"><span>Profile</span><span>Shell</span><span>Palette</span><span>State</span></div>${store.terminals.map((entry) => `<button class="ledger-resource-row${entry.id === profile.id ? " selected" : ""}" type="button" data-terminal="${escapeHTML(entry.id)}" data-focus-key="terminal:${escapeHTML(entry.id)}"><strong data-label="Profile">${escapeHTML(entry.name)}</strong><span data-label="Shell">${escapeHTML(entry.shell)}</span><span data-label="Palette">${escapeHTML(entry.palette)}</span><span data-label="State">${entry.default ? "Default" : entry.managed ? "Managed" : "Saved"}</span></button>`).join("")}</section>${detail}</div>`;
    return `<div class="terminal-layout ih-terminal-shelf">${shelf}${detail}<aside class="catalogue-inspector"><span class="view-kicker">Profile effect</span><strong>Local preview only</strong><p>Changes become saved fixture state only after Apply. External shells and files remain untouched.</p></aside></div>`;
  }

  function genericRows(managerId) {
    const source = store.managerItems?.(managerId) || store.genericManagers?.[managerId] || GENERIC_MANAGER_STATES[managerId] || [];
    const rows = Array.isArray(source) ? source : Array.isArray(source?.items) ? source.items : [];
    return rows.map((entry, index) => Array.isArray(entry) ? { id: `${managerId}-${index}`, title: entry[0], summary: entry[1], state: entry[2], details: entry[1] } : entry);
  }

  function factValue(value) {
    if (Array.isArray(value)) return value.length ? value.join(" · ") : "None discovered";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (value === null || value === undefined || value === "") return "Not configured";
    return String(value);
  }

  function managerPresentation(managerId, entry) {
    const displayStatus = entry.status || entry.state || "Ready";
    let listSummary = [entry.kind, entry.scope].filter(Boolean).join(" · ");
    let primaryFacts = [];
    let secondaryFacts = [];
    if (managerId === "context") {
      listSummary = [entry.kind, entry.scope, entry.effective].filter(Boolean).join(" · ");
      primaryFacts = [["Scope", entry.scope], ["Requested admission", entry.requested], ["Effective admission", entry.effective], ["Last activity", entry.history]];
      secondaryFacts = [["Evidence checks", entry.diagnostics?.length || 0]];
    } else if (managerId === "personas") {
      listSummary = [entry.eligibility, entry.scope].filter(Boolean).join(" · ");
      primaryFacts = [["Eligibility", entry.eligibility], ["Scope", entry.scope], ["Chat availability", entry.childOnly ? "Delegated child work only" : "Available in Chat and delegated work"], ["Permission ceiling", entry.permissionEffect]];
      secondaryFacts = [["Behavior capsule", entry.capsule]];
    } else if (managerId === "crew") {
      listSummary = [entry.purpose, entry.effective].filter(Boolean).join(" · ");
      primaryFacts = [["Route policy", entry.routePolicy], ["Members", entry.members], ["Personas", entry.personas], ["Usage and reserve guard", entry.guard]];
      secondaryFacts = [["Isolation", entry.isolation], ["Coordination", entry.coordination], ["Consensus", entry.consensus], ["Child depth", entry.childDepth], ["Failure policy", entry.failurePolicy]];
    } else if (managerId === "mcp") {
      listSummary = [entry.health, entry.scope].filter(Boolean).join(" · ");
      primaryFacts = [["Transport and protocol", [entry.transport, entry.protocol].filter(Boolean)], ["Authentication", entry.authentication], ["Discovered capability health", entry.health], ["Exposure and approval", [entry.exposure, entry.approval].filter(Boolean)]];
      secondaryFacts = [["Cache freshness", entry.cache], ["Scope", entry.scope]];
    } else if (managerId === "lsp") {
      listSummary = [factValue(entry.languages), entry.effective].filter(Boolean).join(" · ");
      primaryFacts = [["Languages", entry.languages], ["Executable and version", entry.executable], ["Startup", entry.startup], ["Formatting or conflict owner", entry.conflicts]];
      secondaryFacts = [["Capabilities", entry.capabilities], ["Scope", entry.scope]];
    } else if (managerId === "extensions") {
      listSummary = [entry.kind, entry.source, entry.effective].filter(Boolean).join(" · ");
      primaryFacts = /command/i.test(entry.kind || "")
        ? [["Source", entry.source], ["Shortcut", entry.shortcut], ["Conflict", entry.conflict], ["Effective state", entry.effective]]
        : [["Source and trust", [entry.source, entry.trust].filter(Boolean)], ["Permissions", entry.permissions], ["Scope", entry.scope], ["Recent activity", entry.history]];
      secondaryFacts = [["Requested state", entry.requested], ["Effective state", entry.effective], ["Kind", entry.kind]];
    } else if (managerId === "media") {
      listSummary = [entry.purpose, entry.provider, entry.model].filter(Boolean).join(" · ");
      primaryFacts = [["Provider route", [entry.provider, entry.account, entry.model].filter(Boolean)], ["Connection", entry.connection], ["Transformation and output", [entry.transformation, entry.output].filter(Boolean)], ["Policy and allowance", [entry.policy, entry.allowance].filter(Boolean)]];
      secondaryFacts = [["Capabilities", entry.capabilities], ["Fallback", entry.fallback], ["Purpose", entry.purpose], ["Recent activity", entry.history]];
    } else {
      listSummary = [entry.kind, entry.scope, entry.health].filter(Boolean).join(" · ");
      primaryFacts = [["Scope", entry.scope], ["Health", entry.health || displayStatus], ["Source", entry.source || "Deterministic review fixture"], ["Updated", entry.updated || entry.history]];
    }
    const searchable = [entry.title, entry.kind, displayStatus, entry.detail, entry.purpose, entry.capsule, entry.scope, entry.requested, entry.effective, entry.health, entry.eligibility, entry.permissionEffect, entry.routePolicy, entry.members, entry.personas, entry.guard, entry.isolation, entry.coordination, entry.consensus, entry.failurePolicy, entry.transport, entry.protocol, entry.authentication, entry.exposure, entry.approval, entry.cache, entry.languages, entry.executable, entry.startup, entry.capabilities, entry.conflicts, entry.source, entry.trust, entry.permissions, entry.shortcut, entry.provider, entry.account, entry.connection, entry.model, entry.transformation, entry.output, entry.policy, entry.allowance, entry.fallback, entry.actions]
      .flat(Infinity).filter((value) => value !== undefined && value !== null).join(" ").toLowerCase();
    return {
      displayStatus,
      listSummary: listSummary || entry.detail || entry.summary || displayStatus,
      primaryFacts: primaryFacts.slice(0, 4),
      secondaryFacts: secondaryFacts.filter(([, value]) => value !== undefined && value !== null && value !== ""),
      comparison: entry.comparisonAuthored ? { requested: entry.requested, effective: entry.effective } : null,
      actions: Array.isArray(entry.actions) ? entry.actions : [],
      searchable
    };
  }

  function factGrid(facts) {
    return `<div class="detail-grid">${facts.map(([label, value]) => `<div class="detail-fact"><small>${escapeHTML(label)}</small><strong>${escapeHTML(factValue(value))}</strong></div>`).join("")}</div>`;
  }

  function managerActionButtons(manager, selected, actions) {
    if (!actions.length) return `<button class="text-button" type="button" data-generic-inspect="${escapeHTML(manager.id)}">Inspect local evidence</button>`;
    const visible = actions.slice(0, 2).map((action, index) => `<button class="${index === 0 ? "action-button" : "text-button"}" type="button" data-manager-item-action="${escapeHTML(action)}" data-manager-id="${escapeHTML(manager.id)}" data-resource-id="${escapeHTML(selected.id)}">${escapeHTML(action)}</button>`).join("");
    const remaining = actions.slice(2);
    return `${visible}${remaining.length ? `<details class="disclosure more-actions"><summary>More actions</summary><div class="button-row">${remaining.map((action) => `<button class="text-button" type="button" data-manager-item-action="${escapeHTML(action)}" data-manager-id="${escapeHTML(manager.id)}" data-resource-id="${escapeHTML(selected.id)}">${escapeHTML(action)}</button>`).join("")}</div></details>` : ""}`;
  }

  function genericManager(manager) {
    const rows = genericRows(manager.id);
    const query = store.state.managerQuery || "";
    const filtered = rows.filter((entry) => !query || `${entry.title} ${entry.summary} ${entry.state}`.toLowerCase().includes(query.toLowerCase()));
    const selectedId = store.state.selectedManagerResource?.[manager.id] || filtered[0]?.id;
    const selected = rows.find((entry) => entry.id === selectedId) || filtered[0];
    const filter = `<div class="manager-filter"><label class="search-box">${icon("search")}<span class="sr-only">Filter ${escapeHTML(manager.title)}</span><input type="search" data-manager-filter="${escapeHTML(manager.id)}" value="${escapeHTML(query)}" placeholder="Filter inventory and evidence"></label><button class="quiet-button" type="button" data-generic-action="${escapeHTML(manager.id)}">Add or connect</button></div>`;
    const list = `<section class="resource-list manager-master">${filtered.length ? filtered.map((entry) => `<button type="button" class="resource-row${entry.id === selected?.id ? " selected" : ""}" data-manager-resource="${escapeHTML(manager.id)}:${escapeHTML(entry.id)}" data-focus-key="manager-resource:${escapeHTML(entry.id)}"><span class="resource-copy"><strong>${escapeHTML(entry.title)}</strong><p>${escapeHTML(entry.summary || entry.description)}</p></span>${status(entry.state || "Ready")}</button>`).join("") : `<div class="empty-manager"><strong>No matching resources</strong><span>Clear the filter or add a new connection.</span></div>`}</section>`;
    const detail = selected ? `<section class="detail-panel manager-detail"><div class="section-heading"><div><h2 tabindex="-1">${escapeHTML(selected.title)}</h2><p>${escapeHTML(selected.kind || manager.title)}</p></div>${status(selected.state || "Ready")}</div><p class="view-lead">${escapeHTML(selected.details || selected.summary || selected.description)}</p><div class="detail-grid">${Object.entries(selected.facts || { Scope: selected.scope || "Project", Health: selected.health || selected.state || "Ready", Requested: selected.requested || "Current preference", Effective: selected.effective || selected.requested || "Current preference" }).map(([label, value]) => `<div class="detail-fact"><small>${escapeHTML(label)}</small><strong>${escapeHTML(value)}</strong></div>`).join("")}</div><div class="button-row"><button class="action-button" type="button" data-generic-inspect="${escapeHTML(manager.id)}">Inspect evidence and diagnostics</button><button class="text-button" type="button" data-generic-action="${escapeHTML(manager.id)}">Record simulated action</button></div><p class="fineprint">Concept simulation only. No installation, authentication, command execution, or external mutation occurs.</p></section>` : "";
    if (conceptId === "switchboard") return `${filter}<div class="manager-stage sb-manager-stage"><aside class="instrument-readout"><span>Resources</span><strong>${rows.length}</strong><small>Health and effective state remain independently inspectable.</small></aside>${list}${detail}</div>`;
    if (conceptId === "wayfinder") return `${filter}<div class="manager-stage wf-manager-stage"><ol class="journey-steps"><li class="complete"><span>1</span><strong>Choose resource</strong></li><li><span>2</span><strong>Inspect health</strong></li><li><span>3</span><strong>Resolve or configure</strong></li></ol>${list}${detail}</div>`;
    if (conceptId === "ledger") return `${filter}<div class="manager-stage lg-manager-stage"><div class="ledger-heading"><span>Resource</span><span>Scope</span><span>State</span><span>Evidence</span></div>${filtered.map((entry) => `<button type="button" class="ledger-resource-row${entry.id === selected?.id ? " selected" : ""}" data-manager-resource="${escapeHTML(manager.id)}:${escapeHTML(entry.id)}"><strong>${escapeHTML(entry.title)}</strong><span>${escapeHTML(entry.scope || "Project")}</span><span>${escapeHTML(humanize(entry.state || "Ready"))}</span><span>Inspect ${icon("arrow")}</span></button>`).join("")}${detail}</div>`;
    return `${filter}<div class="manager-stage ih-manager-stage">${list}${detail}<aside class="catalogue-inspector"><span class="view-kicker">Manager address</span><strong>${escapeHTML(manager.title)} / ${escapeHTML(selected?.title || "No selection")}</strong><p>Requested and effective state are kept beside evidence, not hidden in a generic form.</p></aside></div>`;
  }

  function genericManagerComplete(manager) {
    const rows = genericRows(manager.id);
    const inventory = store.genericManagers?.[manager.id] || {};
    const query = store.state.managerQuery || "";
    const presentations = new Map(rows.map((entry) => [entry.id, managerPresentation(manager.id, entry)]));
    const filtered = rows.filter((entry) => !query || presentations.get(entry.id).searchable.includes(query.toLowerCase()));
    const selectedId = store.state.selectedManagerResource?.[manager.id] || filtered[0]?.id;
    const selected = filtered.find((entry) => entry.id === selectedId) || filtered[0];
    const selectedPresentation = selected ? presentations.get(selected.id) : null;
    const primaryAction = inventory.primaryAction || "Add or connect";
    const summary = `<section class="manager-summary" aria-label="${escapeHTML(manager.title)} inventory status"><div><span class="view-kicker">Inventory state</span><strong>${escapeHTML(inventory.title || manager.title)}</strong><p>${escapeHTML(inventory.summary || `${rows.length} deterministic resources are ready for review.`)}</p></div>${status(inventory.state || "Ready")}</section>`;
    const filter = `${summary}<div class="manager-filter"><label class="search-box">${icon("search")}<span class="sr-only">Filter ${escapeHTML(manager.title)}</span><input type="search" data-manager-filter="${escapeHTML(manager.id)}" data-focus-key="manager-filter:${escapeHTML(manager.id)}" value="${escapeHTML(query)}" placeholder="Filter inventory, health and evidence"></label><button class="quiet-button" type="button" data-generic-action="${escapeHTML(manager.id)}">${escapeHTML(primaryAction)}</button></div>`;
    const list = `<section class="resource-list manager-master">${filtered.length ? filtered.map((entry) => { const presentation = presentations.get(entry.id); return `<button type="button" class="resource-row${entry.id === selected?.id ? " selected" : ""}" data-manager-resource="${escapeHTML(manager.id)}:${escapeHTML(entry.id)}" data-focus-key="manager-resource:${escapeHTML(entry.id)}"><span class="resource-copy"><strong>${escapeHTML(entry.title)}</strong><p>${escapeHTML(presentation.listSummary)}</p></span>${status(presentation.displayStatus)}</button>`; }).join("") : `<div class="empty-manager"><strong>No matching resources</strong><span>Clear the filter or add a new local fixture.</span></div>`}</section>`;
    const history = Array.isArray(selected?.history) ? selected.history : selected?.history ? [{ title: selected.history, when: "Fixture history" }] : [];
    const diagnostics = (Array.isArray(selected?.diagnostics) ? selected.diagnostics : []).filter((item) => !/^Fixture reference:/i.test(String(item?.title || item?.check || item)));
    const comparison = selectedPresentation?.comparison ? `<div class="route-comparison"><div><small>Requested</small><strong>${escapeHTML(factValue(selectedPresentation.comparison.requested))}</strong></div>${icon("arrow")}<div><small>Effective</small><strong>${escapeHTML(factValue(selectedPresentation.comparison.effective))}</strong></div></div>` : "";
    const secondary = selectedPresentation?.secondaryFacts.length ? `<details class="disclosure domain-details"><summary>More domain details</summary>${factGrid(selectedPresentation.secondaryFacts)}</details>` : "";
    const evidence = history.length || diagnostics.length ? `<details class="disclosure manager-evidence-disclosure"><summary>Evidence, history and diagnostics</summary>${history.length ? `<section class="activity-history"><h3>History</h3>${history.slice(-4).map((item) => `<div><strong>${escapeHTML(item.title || item.action || item)}</strong><span>${escapeHTML(item.when || item.at || "Fixture history")}</span></div>`).join("")}</section>` : ""}${diagnostics.length ? `<section class="diagnostic-history"><h3>Diagnostics</h3>${diagnostics.slice(-4).map((item) => `<div><strong>${escapeHTML(item.title || item.check || item)}</strong><span>${escapeHTML(item.result || item.state || "Ready")}</span></div>`).join("")}</section>` : ""}</details>` : "";
    const detail = selected ? `<section class="detail-panel manager-detail" data-resource-id="${escapeHTML(selected.id)}"><div class="section-heading"><div><h2 tabindex="-1" data-focus-key="manager-heading">${escapeHTML(selected.title)}</h2><p>${escapeHTML(selected.kind || manager.title)}</p></div>${status(selectedPresentation.displayStatus)}</div><p class="view-lead">${escapeHTML(selected.details || selected.detail || selected.summary || selected.description || selected.purpose)}</p>${comparison}${factGrid(selectedPresentation.primaryFacts)}${secondary}${evidence}<div class="button-row manager-item-actions">${managerActionButtons(manager, selected, selectedPresentation.actions)}</div><p class="fineprint">Concept simulation only. External actions do not install, authenticate, execute commands, write files, or call providers. Local inspect and preview actions use deterministic review evidence.</p></section>` : "";
    if (conceptId === "switchboard") return `${filter}<div class="manager-stage sb-manager-stage"><aside class="instrument-readout"><span>Resources</span><strong>${rows.length}</strong><small>Health and effective state remain independently inspectable.</small></aside>${list}${detail}</div>`;
    if (conceptId === "wayfinder") return `${filter}<div class="manager-stage wf-manager-stage"><ol class="journey-steps"><li class="complete"><span>1</span><strong>Choose resource</strong></li><li><span>2</span><strong>Inspect health</strong></li><li><span>3</span><strong>Resolve or configure</strong></li></ol>${list}${detail}</div>`;
    if (conceptId === "ledger") return `${filter}<div class="manager-stage lg-manager-stage"><section class="ledger-master generic-ledger manager-master" aria-label="${escapeHTML(manager.title)} inventory"><div class="ledger-heading" aria-hidden="true"><span>Resource</span><span>Scope</span><span>State</span><span>Evidence</span></div>${filtered.map((entry) => { const presentation = presentations.get(entry.id); return `<button type="button" class="ledger-resource-row${entry.id === selected?.id ? " selected" : ""}" data-manager-resource="${escapeHTML(manager.id)}:${escapeHTML(entry.id)}" data-focus-key="manager-resource:${escapeHTML(entry.id)}"><strong data-label="Resource">${escapeHTML(entry.title)}</strong><span data-label="Scope">${escapeHTML(entry.scope || "Project")}</span><span data-label="State">${escapeHTML(humanize(presentation.displayStatus))}</span><span data-label="Evidence">Inspect ${icon("arrow")}</span></button>`; }).join("")}</section>${detail}</div>`;
    return `${filter}<div class="manager-stage ih-manager-stage">${list}${detail}<aside class="catalogue-inspector"><span class="view-kicker">Manager address</span><strong>${escapeHTML(manager.title)} / ${escapeHTML(selected?.title || "No selection")}</strong><p>Requested and effective state stay beside evidence, history and diagnostics.</p></aside></div>`;
  }

  function managerView() {
    const manager = managerById(store.state.managerId);
    let content = genericManagerComplete(manager);
    if (manager.id === "providers") content = providerManager();
    if (manager.id === "memory") content = memoryManagerComplete();
    if (manager.id === "terminal") content = terminalManager();
    return `<div class="view manager-shell ${conceptId}-manager" data-qa-surface="manager" data-qa-manager="${escapeHTML(manager.id)}" data-motion-stage="manager">${managerHeader(manager)}<div class="manager-stage-root">${content}</div></div>`;
  }

  function spellDemo() {
    const word = "repositry";
    const lastAction = store.spelling?.lastAction;
    const replaced = lastAction?.word === word && /replace/.test(lastAction.action);
    const ignored = store.spelling?.ignoredOnce?.some((entry) => entry.word === word) || store.spelling?.ignoredForDraft?.includes(word) || store.spelling?.personalDictionary?.includes(word) || store.spelling?.projectDictionary?.includes(word);
    const displayWord = replaced ? "repository" : word;
    const exclusions = SPELLING_FIXTURE?.draft?.excludedSegments || [];
    return `<section class="spell-demo"><div class="section-heading"><div><h2>Writing assistance preview</h2><p>Local spelling service · No provider call · No automatic replacement</p></div>${status("Local service", "managed")}</div><div class="spell-editor" role="textbox" aria-multiline="true" aria-label="Writing assistance demonstration" contenteditable="true" spellcheck="false">The project <span class="${ignored || replaced ? "" : "misspelled"}" tabindex="0" ${ignored || replaced ? "" : "data-misspelled"}>${escapeHTML(displayWord)}</span> is ready for review.</div><div class="spell-menu" role="menu" data-spell-menu ${store.state.spellMenuOpen ? "" : "hidden"}><button type="button" role="menuitem" data-spell="replace" tabindex="${store.state.spellMenuIndex === 0 ? 0 : -1}"><strong>repository</strong><span>Replace once</span></button><button type="button" role="menuitem" data-spell="ignore-once" tabindex="${store.state.spellMenuIndex === 1 ? 0 : -1}">Ignore once</button><button type="button" role="menuitem" data-spell="ignore-draft" tabindex="${store.state.spellMenuIndex === 2 ? 0 : -1}">Ignore for this draft</button><button type="button" role="menuitem" data-spell="personal" tabindex="${store.state.spellMenuIndex === 3 ? 0 : -1}">Add to Personal dictionary</button><button type="button" role="menuitem" data-spell="project" tabindex="${store.state.spellMenuIndex === 4 ? 0 : -1}">Add to Project dictionary</button></div><div class="spell-exclusion-sample"><strong>Excluded content stays literal</strong><p>These examples are recognized before suggestion generation and remain unchanged.</p><div class="spell-exclusion-grid">${exclusions.map((entry) => `<article><span>${escapeHTML(entry.kind)}</span><code dir="auto">${escapeHTML(entry.text)}</code><small>${escapeHTML(entry.reason)}</small></article>`).join("")}</div></div></section>`;
  }

  function view() {
    if (store.state.screen === "workspace") return workspaceView();
    if (store.state.screen === "manager") return managerView();
    return homeView();
  }

  return { view, homeView, workspaceView, managerView, settingRow, search, inspector, spellDemo };
}
