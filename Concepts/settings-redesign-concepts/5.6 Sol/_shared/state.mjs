import * as DATA from "./data.mjs";

const {
  CATEGORIES = [],
  PROVIDERS = [],
  ROLE_ASSIGNMENTS = [],
  MEMORY_GISTS = [],
  TERMINAL_PROFILES = [],
  SCENARIOS = {},
  THEMES = [],
  allSettings = () => [],
  buildSearchIndex = () => [],
  categoryById = () => CATEGORIES[0],
  managerById = () => null
} = DATA;

const SPELLING_FIXTURE = DATA.SPELLING_FIXTURE || {
  draft: "Puppet Master should rember this project convention without changing code identifiers.",
  misspellings: [{ word: "rember", suggestions: ["remember", "member"] }],
  personalDictionary: ["Slint"],
  projectDictionary: ["PuppetMaster", "PlanUnit"],
  knownNames: ["Puppet Master", "PuppetMaster", "Slint", "Codex", "OpenAI", "Claude", "Antigravity", "Ollama"]
};

const SETUP_SESSIONS = DATA.SETUP_SESSIONS || [];
const RECENT_CHANGES = DATA.RECENT_CHANGES || [];
const RECEIPT_FIXTURES = DATA.RECEIPT_HISTORY || [];

const ROLE_DEFINITIONS = [
  ["assistant", "Main Assistant", "High-quality conversation"],
  ["planning", "PRD/Planning conversation", "High-quality conversation required"],
  ["goal", "Goal worker", "Adaptive within qualifications"],
  ["verifier", "Verifier/Auditor", "Independent provider preferred"],
  ["vision", "Vision/media analysis", "Current image evidence required"],
  ["compression", "Compression/context maintenance", "Context-safe route required"],
  ["web", "Web extraction", "Web extraction evidence required"],
  ["approval", "Approval review", "High-quality review route required"],
  ["mcp-tools", "MCP/tool routing", "Current tool evidence required"],
  ["skill-search", "Skill search", "Search and retrieval evidence required"],
  ["crew", "Subagents/Crew roles", "Child-role qualifications apply"]
];

const STATUS_LABELS = {
  default: "Default",
  inherited: "Inherited",
  auto: "Auto",
  "not-configured": "Not configured",
  managed: "Managed",
  custom: "Custom",
  unavailable: "Unavailable",
  "effective-difference": "Effective value differs",
  recommended: "Custom"
};

const EVENT_DEFAULTS = {
  state: { scopes: ["state"], motionKey: "state" },
  shell: { scopes: ["shell", "presentation"], motionKey: "shell" },
  scenario: { scopes: ["scenario", "view", "data"], motionKey: "scenario-change" },
  navigate: { scopes: ["route", "view", "search", "focus"], motionKey: "route-change" },
  navigation: { scopes: ["navigation"], motionKey: "drawer" },
  inspector: { scopes: ["inspector", "focus"], motionKey: "drawer" },
  scrollspy: { scopes: ["scrollspy", "navigation", "inspector"], motionKey: "scrollspy" },
  jump: { scopes: ["scrollspy", "navigation", "focus"], motionKey: "jump" },
  disclosure: { scopes: ["workspace", "focus"], motionKey: "disclosure" },
  search: { scopes: ["search"], motionKey: "search" },
  setting: { scopes: ["setting", "summary", "receipts"], motionKey: "setting-save" },
  "manager-tab": { scopes: ["manager", "navigation", "focus"], motionKey: "manager-tab" },
  "provider-select": { scopes: ["provider", "detail", "focus"], motionKey: "selection" },
  "provider-account": { scopes: ["provider", "account", "receipts"], motionKey: "setting-save" },
  "provider-refresh-start": { scopes: ["provider", "refresh"], motionKey: "refresh-start" },
  "provider-refresh-end": { scopes: ["provider", "refresh", "receipts"], motionKey: "refresh-end" },
  model: { scopes: ["provider", "models", "receipts"], motionKey: "model-change" },
  role: { scopes: ["provider", "roles", "receipts"], motionKey: "setting-save" },
  memory: { scopes: ["memory", "detail", "receipts"], motionKey: "memory-change" },
  "memory-select": { scopes: ["memory", "detail", "focus"], motionKey: "selection" },
  "memory-search": { scopes: ["memory", "search"], motionKey: "search" },
  terminal: { scopes: ["terminal", "preview"], motionKey: "terminal-preview" },
  "terminal-select": { scopes: ["terminal", "detail", "focus"], motionKey: "selection" },
  spelling: { scopes: ["spelling", "receipts", "focus"], motionKey: "spelling-action" },
  receipt: { scopes: ["receipts", "announcer"], motionKey: "receipt" },
  "receipt-clear": { scopes: ["receipts"], motionKey: "receipt-dismiss" },
  "focus-consumed": { scopes: ["focus"], motionKey: "none" }
};

const THEME_BY_ID = new Map(THEMES);
const THEME_BY_LABEL = new Map(THEMES.map(([id, label]) => [String(label).toLowerCase(), id]));
const TERMINAL_EDITABLE = new Set([
  "shell", "fallbackShell", "shellSource", "font", "fontFallback", "fontSize", "lineHeight", "foreground", "background", "palette", "ansiPalette",
  "opacity", "material", "backgroundImage", "cursor", "cursorBlink", "selection", "copyPaste", "copyBehavior", "pasteBehavior", "links", "linkBehavior",
  "cwd", "environment", "transcript", "historyLimit", "rendering", "renderer", "performance", "startup"
]);
const TECHNICAL_CONTEXTS = new Set(["code", "code-block", "inline-code", "url", "path", "command", "hash", "identifier", "structured-data", "literal", "model", "provider", "persona", "tool"]);

export function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function nowISO() {
  return new Date().toISOString();
}

function titleCase(value) {
  return String(value || "").replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function subsequenceScore(haystack, needle) {
  let position = -1;
  let gaps = 0;
  for (const character of needle) {
    const next = haystack.indexOf(character, position + 1);
    if (next < 0) return 0;
    if (position >= 0) gaps += next - position - 1;
    position = next;
  }
  return Math.max(8, 34 - gaps);
}

export function scoreQuery(document, query) {
  const normalized = String(query || "").trim().toLowerCase();
  if (!normalized) return 0;
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const title = String(document.title || "").toLowerCase();
  const haystack = String(document.haystack || "").toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (title === token) score += 150;
    else if (title.startsWith(token)) score += 110;
    else if (title.includes(token)) score += 82;
    else if (haystack.includes(token)) score += 54;
    else {
      const fuzzy = subsequenceScore(title, token);
      if (!fuzzy) return 0;
      score += fuzzy;
    }
  }
  if (document.kind === "Setting") score += 12;
  if (document.kind === "Manager") score += 8;
  return score;
}

function normalizeStatus(entry) {
  const raw = String(entry.status || "").toLowerCase().replace(/\s+/g, "-");
  if (raw === "recommended") return Object.is(entry.value, entry.defaultValue) ? "default" : "custom";
  if (raw === "effective-difference" || entry.requestedValue !== undefined && entry.effectiveValue !== undefined && !Object.is(entry.requestedValue, entry.effectiveValue)) return "effective-difference";
  if (raw === "managed" || entry.managedReason) return "managed";
  if (raw === "unavailable" || entry.unavailableReason) return "unavailable";
  if (raw === "inherited") return "inherited";
  if (raw === "not-configured" || String(entry.value).toLowerCase() === "not configured") return "not-configured";
  if (raw === "auto" || String(entry.value).toLowerCase() === "automatic") return "auto";
  if (raw === "default") return "default";
  return "custom";
}

function normalizeSetting(entry) {
  const normalized = clone(entry);
  normalized.status = normalizeStatus(normalized);
  normalized.valueState = normalized.status;
  normalized.stateLabel = STATUS_LABELS[normalized.status] || titleCase(normalized.status);
  normalized.recommended = entry.status === "recommended" || entry.recommended === true || entry.recommendedValue !== undefined;
  normalized.validationError = null;
  normalized.inheritedValue = entry.inheritedValue ?? entry.effectiveValue ?? entry.defaultValue;
  return normalized;
}

function normalizeRoles(input) {
  const byId = new Map(input.map((role) => [role.id, clone(role)]));
  return ROLE_DEFINITIONS.map(([id, label, quality]) => ({
    id,
    label,
    route: id === "planning" ? "Use Main Assistant" : id === "goal" || id === "crew" ? "Qualified route pool" : "5.6 Sol — Personal Codex",
    quality,
    ...(byId.get(id) || {})
  }));
}

function memorySnapshot(memory, version, overrides = {}) {
  return deepFreeze({
    id: `${memory.id}:v${version}`,
    version,
    title: overrides.title ?? memory.title,
    summary: overrides.summary ?? memory.summary,
    state: overrides.state ?? memory.state,
    scope: overrides.scope ?? memory.scope,
    kind: overrides.kind ?? memory.kind,
    source: overrides.source ?? memory.source,
    halfLife: overrides.halfLife ?? memory.halfLife,
    pinned: overrides.pinned ?? memory.pinned,
    createdAt: overrides.createdAt || nowISO(),
    reason: overrides.reason || "Fixture history",
    restoredFrom: overrides.restoredFrom || null
  });
}

function normalizeMemory(entry) {
  const memory = clone(entry);
  const currentVersion = Math.max(1, Number(memory.version) || 1);
  const supplied = Array.isArray(memory.versions) ? memory.versions : [];
  memory.versions = supplied.length
    ? supplied.map((version, index) => deepFreeze({
      id: version.id || `${memory.id}:v${Number(version.version || version.number) || index + 1}`,
      version: Number(version.version || version.number) || index + 1,
      title: version.title ?? memory.title,
      summary: version.summary ?? memory.summary,
      state: version.state ?? memory.state,
      scope: version.scope ?? memory.scope,
      kind: version.kind ?? memory.kind,
      source: version.source ?? memory.source,
      halfLife: version.halfLife ?? memory.halfLife,
      pinned: version.pinned ?? memory.pinned,
      createdAt: version.createdAt || nowISO(),
      reason: version.reason || "Preserved fixture history",
      restoredFrom: version.restoredFrom || null,
      ...clone(version)
    }))
    : Array.from({ length: currentVersion }, (_, index) => memorySnapshot(memory, index + 1, {
      reason: index + 1 === currentVersion ? "Current fixture evidence" : "Preserved fixture history"
    }));
  memory.version = Math.max(...memory.versions.map((version) => Number(version.version) || 1));
  memory.accessHistory = clone(memory.accessHistory || [{ at: "Today", reason: "Opened in Settings review", surface: "Assistant memory" }]);
  memory.discarded = false;
  return memory;
}

function terminalFields(profile) {
  return Object.fromEntries(Object.entries(profile).filter(([key]) => TERMINAL_EDITABLE.has(key)));
}

function normalizeTerminal(entry) {
  const base = clone(entry);
  base.fallbackShell = base.fallbackShell || "/bin/bash";
  base.fallbackFont = base.fallbackFont || "SF Mono";
  base.foreground = base.foreground || "Theme foreground";
  base.background = base.background || "Theme background";
  base.ansiPalette = clone(base.ansiPalette || ["Ink", "Danger", "Success", "Warning", "Accent", "Managed", "Info", "Paper"]);
  base.opacity = Number(base.opacity ?? 1);
  base.material = base.material || "Solid";
  base.backgroundImage = base.backgroundImage || "None";
  base.selection = base.selection || "Theme accent";
  base.copyBehavior = base.copyBehavior || "Copy on explicit command";
  base.pasteBehavior = base.pasteBehavior || "Confirm multiline paste";
  base.linkBehavior = base.linkBehavior || "Command-click opens link";
  base.environment = clone(base.environment || [{ name: "TERM", value: "xterm-256color", source: "Profile" }]);
  base.renderer = base.renderer || "Automatic";
  base.startup = base.startup || "Login shell";
  const fields = terminalFields(base);
  base.saved = deepFreeze(clone(fields));
  base.draft = clone(fields);
  base.dirty = false;
  base.diagnosticSummary = clone(base.diagnosticSummary || (!Array.isArray(base.diagnostics) ? base.diagnostics : null));
  base.diagnostics = Array.isArray(base.diagnostics) ? clone(base.diagnostics) : [];
  Object.assign(base, base.draft);
  return base;
}

function normalizeProvider(entry) {
  const provider = clone(entry);
  provider.accounts = provider.accounts || [];
  provider.models = provider.models || [];
  provider.connections = provider.connections || provider.accounts.map((account) => ({
    id: `${account.id}-connection`,
    accountId: account.id,
    name: account.connection,
    owner: account.authOwner,
    state: account.state,
    isolation: account.isolation
  }));
  provider.products = provider.products || provider.accounts.map((account) => ({
    id: `${account.id}-product`,
    accountId: account.id,
    name: account.product,
    usage: account.usage,
    nextAction: account.next
  }));
  provider.runtimeAdapters = provider.runtimeAdapters || [{ id: `${provider.id}-adapter`, name: `${provider.name} adapter`, state: provider.state === "ready" ? "ready" : "limited", source: "Deterministic review fixture" }];
  const suppliedCatalogue = clone(provider.catalogue || {});
  provider.catalogue = {
    ...suppliedCatalogue,
    version: suppliedCatalogue.version || suppliedCatalogue.sourceVersion || "fixture-1",
    refreshedAt: suppliedCatalogue.refreshedAt || suppliedCatalogue.checkedAt || "Fixture baseline",
    evidenceSource: suppliedCatalogue.evidenceSource || suppliedCatalogue.source || "Deterministic review fixture",
    lastKnownGood: deepFreeze(clone(provider.models)),
    quarantine: Array.isArray(suppliedCatalogue.quarantine) ? suppliedCatalogue.quarantine : suppliedCatalogue.quarantine ? [suppliedCatalogue.quarantine] : [],
    removalHistory: clone(suppliedCatalogue.removalHistory || [])
  };
  return provider;
}

function normalizeSpelling(input) {
  const draftFixture = typeof input.draft === "object" && input.draft ? input.draft : null;
  const dictionaries = input.dictionaries || {};
  const misspelling = draftFixture?.misspelling;
  return {
    enabled: input.enabled !== false,
    language: input.language || "Automatic",
    dictionarySource: input.dictionarySource || "Automatic",
    technicalProse: Boolean(input.technicalProse),
    underlineUnknownNames: Boolean(input.underlineUnknownNames),
    draft: typeof input.draft === "string" ? input.draft : draftFixture?.sentence || "Puppet Master should rember this project convention.",
    draftTitle: draftFixture?.title || "Writing-service behavior preview",
    excludedSegments: clone(draftFixture?.excludedSegments || input.excludedSegments || []),
    misspellings: clone(input.misspellings || (misspelling ? [{ word: misspelling.text, suggestions: misspelling.suggestions || [] }] : [{ word: "rember", suggestions: ["remember"] }])),
    personalDictionary: [...new Set(input.personalDictionary || dictionaries.personal || [])],
    projectDictionary: [...new Set(input.projectDictionary || dictionaries.project || [])],
    ignoredOnce: [],
    ignoredForDraft: [...new Set(input.ignoredForDraft || dictionaries.ignoredForDraft || [])],
    knownNames: [...new Set(input.knownNames || ["5.6 Sol", "OpenAI", "Assistant", "MCP", "Puppet Master", "PuppetMaster", "Slint", "Codex", "Claude", "Antigravity", "Ollama"])],
    service: clone(input.service || {}),
    settings: clone(input.settings || {}),
    actions: clone(input.actions || []),
    lastAction: null
  };
}

function destinationFor(document) {
  if (document?.destination) return clone(document.destination);
  if (document?.targetType === "setting") return { screen: "workspace", categoryId: document.categoryId, subcategoryId: document.subcategoryId, settingId: document.targetId };
  if (document?.targetType === "manager") return { screen: "manager", managerId: document.targetId, tab: document.managerTab || "overview", resourceId: document.resourceId || null };
  if (document?.targetType === "category") return { screen: "workspace", categoryId: document.targetId, subcategoryId: document.subcategoryId || null };
  return document?.targetId ? { screen: "workspace", categoryId: document.targetId } : null;
}

function normalizeScenarioKey(value) {
  return String(value || "normal").trim().toLowerCase().replace(/[\s_]+/g, "-");
}

function waitFrame() {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => resolve());
    else setTimeout(resolve, 0);
  });
}

export class SettingsStore {
  constructor(conceptId) {
    this.conceptId = conceptId;
    this.listeners = new Set();
    this.searchIndex = buildSearchIndex().map((document) => ({ ...document, destination: destinationFor(document) }));
    this.settings = new Map(allSettings().map((entry) => [entry.id, normalizeSetting(entry)]));
    this.providers = PROVIDERS.map(normalizeProvider);
    this.roles = normalizeRoles(ROLE_ASSIGNMENTS);
    this.memories = MEMORY_GISTS.map(normalizeMemory);
    this.terminals = TERMINAL_PROFILES.map(normalizeTerminal);
    this.spelling = normalizeSpelling(SPELLING_FIXTURE);
    this.setupSessions = clone(SETUP_SESSIONS);
    this.recentChanges = clone(RECENT_CHANGES);
    this.genericManagers = clone(DATA.MANAGER_INVENTORIES || {});
    this.providerOperations = [];
    this.receiptHistory = RECEIPT_FIXTURES.map((entry, index) => deepFreeze({
      id: entry.id || `fixture-receipt-${index + 1}`,
      title: entry.title,
      message: entry.message || entry.detail || "",
      tone: entry.tone || "managed",
      createdAt: entry.createdAt || entry.at || "Fixture history",
      dismissedAt: null,
      persistent: entry.persistent !== false,
      action: entry.action || null,
      simulation: entry.simulation ?? entry.simulated ?? true
    }));
    this._refreshJobs = new Map();
    this._pending = new Set();
    this._focusSequence = 0;
    this._receiptSequence = 0;
    this._operationSequence = 0;

    const root = typeof document !== "undefined" ? document.documentElement : null;
    const media = typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)") : null;
    const rootTheme = root?.getAttribute("data-theme") || "friendly-dark";
    const rootReduction = root?.getAttribute("data-reduced-motion");
    const osReducedMotion = Boolean(media?.matches);
    const reducedMotionOverride = rootReduction === "1" ? true : rootReduction === "0" ? false : null;
    const reducedMotion = reducedMotionOverride === true || osReducedMotion;
    const firstCategory = CATEGORIES[0] || { id: "experience", subcategories: [{ id: "startup-defaults" }] };
    const firstMemory = this.memories[0]?.id || null;
    const firstTerminal = this.terminals[0]?.id || null;

    this.state = {
      screen: "home",
      categoryId: firstCategory.id,
      subcategoryId: firstCategory.subcategories?.[0]?.id || null,
      focusSettingId: null,
      focusRequest: null,
      managerId: null,
      managerTab: "overview",
      scenario: SCENARIOS.normal ? "normal" : Object.keys(SCENARIOS)[0] || "normal",
      scenarioOverlay: {},
      search: { surface: "home", query: "", open: false, activeIndex: 0, optionCount: 0 },
      searchQuery: "",
      searchOpen: false,
      searchSelection: 0,
      railOpen: true,
      chatOpen: false,
      theme: THEME_BY_ID.has(rootTheme) ? rootTheme : "friendly-dark",
      density: root?.getAttribute("data-density") || "automatic",
      reducedMotionOverride,
      osReducedMotion,
      reducedMotion,
      presentation: {
        theme: THEME_BY_ID.has(rootTheme) ? rootTheme : "friendly-dark",
        density: root?.getAttribute("data-density") || "automatic",
        reducedMotionOverride,
        osReducedMotion,
        reducedMotion,
        direction: root?.dir || "ltr",
        textScale: 1,
        forcedColors: false,
        coarsePointer: false
      },
      advancedSections: [],
      navigationOpen: false,
      inspectorOpen: false,
      refreshingProviderId: null,
      refreshingProviderIds: [],
      selectedProviderId: this.providers[0]?.id || null,
      selectedAccountId: this.providers[0]?.activeAccountId || this.providers[0]?.accounts?.[0]?.id || null,
      selectedMemoryId: firstMemory,
      memoryQuery: "",
      memoryFilters: { query: "", kind: "all", scope: "all", state: "all", pinned: "all" },
      memoryUndo: null,
      selectedTerminalId: firstTerminal,
      pendingTerminalSwitch: null,
      managerQuery: "",
      selectedManagerResource: {},
      managerStates: {},
      spellingMenu: null,
      receipts: [],
      revision: 0,
      lastEvent: null
    };

    this._baseline = deepFreeze(clone({
      settings: [...this.settings.values()],
      providers: this.providers,
      roles: this.roles,
      memories: this.memories,
      terminals: this.terminals,
      spelling: this.spelling,
      genericManagers: this.genericManagers,
      setupSessions: this.setupSessions,
      recentChanges: this.recentChanges
    }));
    this.state.scenarioOverlay = clone(SCENARIOS[this.state.scenario]?.entityOverlay || SCENARIOS[this.state.scenario]?.overlay || {});
    this._applyScenarioOverlay(this.state.scenarioOverlay);

    this._motionMedia = media;
    this._onMotionPreference = (event) => {
      this.state.osReducedMotion = Boolean(event.matches);
      this.state.presentation.osReducedMotion = Boolean(event.matches);
      this._refreshEffectiveMotion();
      this._syncPresentationSettings();
      this.emit({ action: "presentation.os-motion", scopes: ["presentation", "motion"], motionKey: "none", announcement: this.state.reducedMotion ? "Reduced motion is active." : "Full motion is active." });
    };
    media?.addEventListener?.("change", this._onMotionPreference);
    this._applyPresentationToDocument();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  destroy() {
    this._motionMedia?.removeEventListener?.("change", this._onMotionPreference);
    this.listeners.clear();
  }

  _event(input = "state", details = {}) {
    const partial = typeof input === "string" ? { action: input } : { ...(input || {}) };
    const action = partial.action || "state";
    const defaults = EVENT_DEFAULTS[action] || EVENT_DEFAULTS.state;
    const revision = this.state.revision + 1;
    return deepFreeze({
      action,
      scopes: [...new Set(partial.scopes || details.scopes || defaults.scopes)],
      focusRequest: partial.focusRequest !== undefined ? clone(partial.focusRequest) : clone(this.state.focusRequest),
      announcement: partial.announcement ?? details.announcement ?? null,
      motionKey: partial.motionKey || details.motionKey || defaults.motionKey,
      revision,
      detail: clone(partial.detail || details.detail || null)
    });
  }

  emit(reason = "state", details = {}) {
    const event = this._event(reason, details);
    this.state.revision = event.revision;
    this.state.lastEvent = event;
    for (const listener of this.listeners) listener(this.state, event);
    return event;
  }

  patch(values, reason = "state", details = {}) {
    Object.assign(this.state, values);
    if (values.search) this._syncSearchAliases();
    return this.emit(reason, details);
  }

  _syncSearchAliases() {
    this.state.searchQuery = this.state.search.query;
    this.state.searchOpen = this.state.search.open;
    this.state.searchSelection = this.state.search.activeIndex;
  }

  _setSearch(next) {
    this.state.search = { ...this.state.search, ...next };
    this._syncSearchAliases();
  }

  _newFocus(kind, id, options = {}) {
    const request = {
      requestId: `focus-${++this._focusSequence}`,
      kind,
      id,
      selector: options.selector || null,
      reveal: clone(options.reveal || []),
      align: options.align || "center",
      preventScroll: Boolean(options.preventScroll),
      returnSelector: options.returnSelector || null
    };
    this.state.focusRequest = request;
    this.state.focusSettingId = kind === "setting" ? id : null;
    return request;
  }

  consumeFocusRequest(requestId = null) {
    const request = this.state.focusRequest;
    if (!request || requestId && request.requestId !== requestId) return null;
    this.state.focusRequest = null;
    this.state.focusSettingId = null;
    this.emit({ action: "focus-consumed", scopes: ["focus"], focusRequest: null, motionKey: "none" });
    return request;
  }

  scenario() {
    return SCENARIOS[this.state.scenario] || SCENARIOS.normal || { label: titleCase(this.state.scenario), notices: [] };
  }

  categoryStatus(categoryId) {
    if (this.state.scenario === "calm") return "Ready";
    const notices = this.scenario().notices || [];
    const managersByCategory = {
      intelligence: new Set(["providers", "personas", "media"]),
      code: new Set(["terminal", "lsp"]),
      context: new Set(["memory", "context"]),
      collaboration: new Set(["crew"]),
      tools: new Set(["mcp", "lsp", "extensions"]),
      media: new Set(["media"])
    };
    const relevant = notices.filter((notice) => notice.destination?.categoryId === categoryId || managersByCategory[categoryId]?.has(notice.destination?.managerId));
    if (relevant.some((notice) => notice.tone === "danger")) return `${relevant.length} need attention`;
    if (relevant.length) return `${relevant.length} to review`;
    return CATEGORIES.find((entry) => entry.id === categoryId)?.status || "Ready";
  }

  managerItems(managerId) {
    return clone(this.genericManagers?.[managerId] || []);
  }

  providerOperation(providerId = this.state.selectedProviderId) {
    const operation = [...this.providerOperations].reverse().find((entry) => entry.providerId === providerId);
    return operation ? { ...clone(operation), status: operation.outcome, message: operation.detail?.message || operation.detail?.reason || null } : null;
  }

  terminalDraft(profileId = this.state.selectedTerminalId) {
    return clone(this.terminal(profileId)?.draft || null);
  }

  _resolveScenario(value) {
    const requested = normalizeScenarioKey(value);
    if (SCENARIOS[requested]) return requested;
    const aliases = {
      "needs-attention": ["attention", "attention-heavy"],
      "attention-heavy": ["attention", "needs-attention"],
      "setup-in-progress": ["setup"],
      "degraded-with-last-known-good-data": ["degraded"],
      "managed-workspace": ["managed"],
      "unavailable-dependency": ["unavailable"],
      "usage-exhausted": ["usage"],
      "requested-effective-difference": ["effective-difference", "requested-effective"]
    };
    for (const candidate of aliases[requested] || []) if (SCENARIOS[candidate]) return candidate;
    return null;
  }

  _restoreBaseline() {
    const baseline = clone(this._baseline);
    this.settings = new Map(baseline.settings.map((entry) => [entry.id, normalizeSetting(entry)]));
    this.providers = baseline.providers.map(normalizeProvider);
    this.roles = normalizeRoles(baseline.roles);
    this.memories = baseline.memories.map(normalizeMemory);
    this.terminals = baseline.terminals.map(normalizeTerminal);
    this.spelling = normalizeSpelling(baseline.spelling);
    this.setupSessions = baseline.setupSessions;
    this.recentChanges = baseline.recentChanges;
    this.genericManagers = baseline.genericManagers || clone(DATA.MANAGER_INVENTORIES || {});
    this.providerOperations = [];
    this._refreshJobs.clear();
    this.state.refreshingProviderId = null;
    this.state.refreshingProviderIds = [];
    this.state.selectedProviderId = this.providers.some((entry) => entry.id === this.state.selectedProviderId) ? this.state.selectedProviderId : this.providers[0]?.id || null;
    const provider = this.provider();
    this.state.selectedAccountId = provider?.activeAccountId || provider?.accounts?.[0]?.id || null;
    this.state.selectedMemoryId = this.memories.some((entry) => entry.id === this.state.selectedMemoryId) ? this.state.selectedMemoryId : this.memories[0]?.id || null;
    this.state.selectedTerminalId = this.terminals.some((entry) => entry.id === this.state.selectedTerminalId) ? this.state.selectedTerminalId : this.terminals[0]?.id || null;
    this.state.memoryUndo = null;
    this.state.pendingTerminalSwitch = null;
    this.state.receipts = [];
    this._syncPresentationSettings();
  }

  _applyScenarioOverlay(overlay = {}) {
    const providerState = (value) => {
      const text = String(value || "ready");
      if (/^ready/.test(text)) return "ready";
      if (/not-installed|intentionally-not-installed/.test(text)) return "not-installed";
      if (/signed-out/.test(text)) return "signed-out";
      if (/setup/.test(text)) return "setup";
      if (/refreshing/.test(text)) return "refreshing";
      if (/usage-exhausted/.test(text)) return "usage-exhausted";
      if (/degraded|warning|failed/.test(text)) return "degraded";
      if (/disabled/.test(text)) return "unavailable";
      return "ready";
    };
    for (const [providerId, state] of Object.entries(overlay.providers || {})) {
      const provider = this.providers.find((entry) => entry.id === providerId);
      if (!provider) continue;
      provider.state = providerState(state);
      provider.stateLabel = titleCase(state);
      provider.scenarioState = state;
    }
    for (const [accountId, state] of Object.entries(overlay.providerAccounts || {})) {
      for (const provider of this.providers) {
        const account = provider.accounts.find((entry) => entry.id === accountId);
        if (!account) continue;
        account.state = providerState(state);
        account.stateLabel = titleCase(state);
        account.scenarioState = state;
      }
    }
    for (const [providerId, state] of Object.entries(overlay.catalogues || {})) {
      const provider = this.providers.find((entry) => entry.id === providerId);
      if (!provider) continue;
      provider.catalogue.validation = titleCase(state);
      if (state === "quarantined") provider.catalogue.quarantine = [{ id: `${providerId}-scenario-quarantine`, reason: "Scenario fixture validation failed", capturedAt: "Scenario fixture" }];
    }
    for (const [settingId, state] of Object.entries(overlay.settings || {})) {
      const setting = this.settings.get(settingId);
      if (!setting) continue;
      const normalized = normalizeScenarioKey(state);
      setting.status = normalized === "effective-value-differs" ? "effective-difference" : normalized;
      setting.valueState = setting.status;
      setting.stateLabel = STATUS_LABELS[setting.status] || titleCase(state);
      if (!['unavailable', 'managed'].includes(setting.status)) setting.available = true;
      if (setting.status === "managed") setting.managedReason ||= "Organization policy owns this effective value in the review scenario.";
      if (setting.status === "unavailable") {
        setting.available = false;
        setting.unavailableReason ||= "A required dependency is unavailable in this review scenario.";
      }
    }
    this.state.managerStates = clone(overlay.managers || {});
    for (const [resourceId, state] of Object.entries(overlay.resources || {})) {
      for (const inventory of Object.values(this.genericManagers)) {
        const rows = Array.isArray(inventory) ? inventory : inventory?.items || [];
        const resource = rows.find((entry) => entry.id === resourceId);
        if (resource) {
          resource.status = titleCase(state);
          resource.state = state;
          resource.health = state;
        }
      }
      const terminal = this.terminals.find((entry) => entry.id === resourceId);
      if (terminal) terminal.state = state;
    }
    if (Array.isArray(overlay.setups)) {
      const ids = new Set(overlay.setups);
      this.setupSessions = clone(SETUP_SESSIONS).filter((entry) => ids.has(entry.id));
    }
    if (/review-needed|degraded/.test(String(overlay.managers?.memory || "")) && this.memories[0]) this.memories[0].state = "awaiting-review";
  }

  setScenario(scenario, options = {}) {
    const resolved = this._resolveScenario(scenario);
    if (!resolved) return false;
    if (options.reset !== false) this._restoreBaseline();
    this.state.scenario = resolved;
    this.state.scenarioOverlay = clone(SCENARIOS[resolved]?.entityOverlay || SCENARIOS[resolved]?.overlay || {});
    this._applyScenarioOverlay(this.state.scenarioOverlay);
    this.emit({ action: "scenario", scopes: ["scenario", "view", "data", "summary", "notices"], motionKey: "scenario-change", announcement: `${SCENARIOS[resolved]?.label || titleCase(resolved)} review state loaded.` });
    return true;
  }

  resetScenario() {
    return this.setScenario(SCENARIOS.normal ? "normal" : Object.keys(SCENARIOS)[0] || "normal", { reset: true });
  }

  applyScenario(scenario, options = {}) {
    return this.setScenario(scenario, options);
  }

  _resolveTheme(value) {
    const normalized = String(value || "").trim();
    if (THEME_BY_ID.has(normalized)) return normalized;
    return THEME_BY_LABEL.get(normalized.toLowerCase()) || null;
  }

  _refreshEffectiveMotion() {
    const effective = this.state.reducedMotionOverride === true || this.state.osReducedMotion === true;
    this.state.reducedMotion = effective;
    this.state.presentation.reducedMotionOverride = this.state.reducedMotionOverride;
    this.state.presentation.osReducedMotion = this.state.osReducedMotion;
    this.state.presentation.reducedMotion = effective;
    this._applyPresentationToDocument();
  }

  _applyPresentationToDocument() {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.dataset.theme = this.state.theme;
    root.dataset.density = this.state.density;
    root.dataset.reducedMotion = this.state.reducedMotion ? "1" : "0";
    root.dir = this.state.presentation.direction || "ltr";
    root.style.setProperty("--review-text-scale", String(this.state.presentation.textScale || 1));
    root.style.fontSize = `${Math.round(Number(this.state.presentation.textScale || 1) * 100)}%`;
  }

  _setPresentation(values = {}) {
    const theme = values.theme !== undefined ? this._resolveTheme(values.theme) : this.state.theme;
    if (values.theme !== undefined && !theme) return false;
    if (theme) this.state.theme = theme;
    if (values.density !== undefined) this.state.density = String(values.density || "automatic").toLowerCase();
    if (values.reducedMotionOverride !== undefined) this.state.reducedMotionOverride = values.reducedMotionOverride === null ? null : Boolean(values.reducedMotionOverride);
    if (values.reducedMotion !== undefined) this.state.reducedMotionOverride = Boolean(values.reducedMotion);
    if (values.direction !== undefined) this.state.presentation.direction = values.direction === "rtl" ? "rtl" : "ltr";
    if (values.textScale !== undefined) this.state.presentation.textScale = Math.max(1, Math.min(1.35, Number(values.textScale) || 1));
    if (values.forcedColors !== undefined) this.state.presentation.forcedColors = Boolean(values.forcedColors);
    if (values.coarsePointer !== undefined) this.state.presentation.coarsePointer = Boolean(values.coarsePointer);
    this.state.presentation.theme = this.state.theme;
    this.state.presentation.density = this.state.density;
    this._refreshEffectiveMotion();
    this._syncPresentationSettings();
    return true;
  }

  _syncPresentationSettings() {
    const theme = this.settings.get("experience.appearance.theme");
    const density = this.settings.get("experience.appearance.density");
    const motion = this.settings.get("experience.appearance.motion");
    if (theme) {
      theme.value = THEME_BY_ID.get(this.state.theme) || this.state.theme;
      this._syncSettingState(theme);
    }
    if (density) {
      const wanted = this.state.density.replace(/\b\w/g, (letter) => letter.toUpperCase());
      density.value = density.choices?.find((choice) => String(choice).toLowerCase() === this.state.density) || wanted;
      this._syncSettingState(density);
    }
    if (motion) {
      motion.value = this.state.reducedMotionOverride === true;
      motion.effectiveValue = this.state.reducedMotion;
      this._syncSettingState(motion, this.state.reducedMotionOverride === null ? "inherited" : null);
    }
  }

  setPresentation(values = {}) {
    if (!this._setPresentation(values)) return false;
    this.emit({ action: "presentation", scopes: ["presentation", "shell", "settings"], motionKey: "theme-change", announcement: "Presentation settings updated." });
    return true;
  }

  setShell(values = {}) {
    if (typeof values.railOpen === "boolean") this.state.railOpen = values.railOpen;
    if (typeof values.chatOpen === "boolean") this.state.chatOpen = values.chatOpen;
    let scenarioChanged = false;
    if (values.scenario !== undefined) {
      const scenario = this._resolveScenario(values.scenario);
      if (scenario && scenario !== this.state.scenario) {
        this._restoreBaseline();
        this.state.scenario = scenario;
        this.state.scenarioOverlay = clone(SCENARIOS[scenario]?.entityOverlay || SCENARIOS[scenario]?.overlay || {});
        this._applyScenarioOverlay(this.state.scenarioOverlay);
        scenarioChanged = true;
      }
    }
    this._setPresentation(values);
    this.emit({
      action: "shell",
      scopes: scenarioChanged ? ["shell", "presentation", "scenario", "view", "data", "summary", "notices"] : ["shell", "presentation"],
      motionKey: scenarioChanged ? "scenario-change" : "shell",
      announcement: scenarioChanged ? `${this.scenario().label} review state loaded.` : null
    });
    return true;
  }

  applyReviewState(values = {}) {
    if (values.resetScenario !== false && values.scenario !== undefined) this._restoreBaseline();
    if (typeof values.railOpen === "boolean") this.state.railOpen = values.railOpen;
    if (typeof values.chatOpen === "boolean") this.state.chatOpen = values.chatOpen;
    if (values.scenario !== undefined) {
      const scenario = this._resolveScenario(values.scenario);
      if (scenario) {
        this.state.scenario = scenario;
        this.state.scenarioOverlay = clone(SCENARIOS[scenario]?.entityOverlay || SCENARIOS[scenario]?.overlay || {});
        this._applyScenarioOverlay(this.state.scenarioOverlay);
      }
    }
    this._setPresentation(values);
    this.emit({ action: "review.apply", scopes: ["shell", "presentation", "scenario", "view", "data", "summary", "notices"], motionKey: "review-state", announcement: "Review controls applied." });
    return this.snapshot();
  }

  openHome() {
    this._setSearch({ surface: "home", query: "", open: false, activeIndex: 0, optionCount: 0 });
    this.state.screen = "home";
    this.state.managerId = null;
    this.state.navigationOpen = false;
    this.state.inspectorOpen = false;
    const focusRequest = this._newFocus("heading", "settings-home", { selector: "[data-view-heading]" });
    this.emit({ action: "navigate", scopes: ["route", "view", "search", "focus"], focusRequest, motionKey: `${this.conceptId}:home` });
  }

  openCategory(categoryId, subcategoryId = null, focusSettingId = null) {
    const replacingCategory = this.state.screen === "workspace";
    const exact = CATEGORIES.find((entry) => entry.id === categoryId);
    const category = exact || categoryById(categoryId);
    if (!category) return false;
    const nextSubcategory = category.subcategories?.some((item) => item.id === subcategoryId)
      ? subcategoryId
      : category.subcategories?.[0]?.id || null;
    this.state.screen = "workspace";
    this.state.categoryId = category.id;
    this.state.subcategoryId = nextSubcategory;
    this.state.managerId = null;
    this.state.navigationOpen = false;
    this.state.inspectorOpen = false;
    this._setSearch({ surface: "workspace", query: "", open: false, activeIndex: 0, optionCount: 0 });
    const focusRequest = focusSettingId
      ? this._newFocus("setting", focusSettingId, { selector: `[id="setting-${focusSettingId}"]`, reveal: [nextSubcategory] })
      : this._newFocus("heading", category.id, { selector: "[data-view-heading]", align: "start" });
    this.emit({
      action: replacingCategory ? "category" : "navigate",
      scopes: ["route", "view", "search", "focus"],
      focusRequest,
      motionKey: `${this.conceptId}:${replacingCategory ? "category-replacement" : "destination-workspace"}`
    });
    return true;
  }

  openSetting(settingId) {
    const entry = this.settings.get(settingId);
    if (!entry) return false;
    const disclosureId = `${entry.categoryId}:${entry.subcategoryId}`;
    if (/Advanced|Expert|Diagnostic/i.test(entry.exposure || "") && !this.state.advancedSections.includes(disclosureId)) {
      this.state.advancedSections = [...this.state.advancedSections, disclosureId];
    }
    return this.openCategory(entry.categoryId, entry.subcategoryId, settingId);
  }

  openManager(managerId, tab = "overview", options = {}) {
    const manager = DATA.MANAGERS?.find((entry) => entry.id === managerId) || managerById(managerId);
    if (!manager) return false;
    this.state.screen = "manager";
    this.state.managerId = manager.id;
    this.state.managerTab = tab || "overview";
    this.state.navigationOpen = false;
    this.state.inspectorOpen = false;
    this.state.managerQuery = "";
    this._setSearch({ surface: `manager:${manager.id}`, query: "", open: false, activeIndex: 0, optionCount: 0 });
    if (manager.id === "providers" && options.resourceId) {
      const provider = this.providers.find((entry) => entry.id === options.resourceId);
      if (provider) {
        this.state.selectedProviderId = provider.id;
        this.state.selectedAccountId = provider.accounts.find((entry) => entry.id === options.childResourceId)?.id || provider.activeAccountId || provider.accounts[0]?.id || null;
      }
    } else if (manager.id === "memory" && options.resourceId && this.memories.some((entry) => entry.id === options.resourceId)) {
      this.state.selectedMemoryId = options.resourceId;
    } else if (manager.id === "terminal" && options.resourceId && this.terminals.some((entry) => entry.id === options.resourceId)) {
      this.state.selectedTerminalId = options.resourceId;
    } else if (options.resourceId) {
      this.state.selectedManagerResource = { ...this.state.selectedManagerResource, [manager.id]: options.resourceId };
    }
    const requestedSelector = options.selector || options.focusId && `#${options.focusId}` || (manager.id === "providers" && options.childResourceId ? `[data-account-select="${options.childResourceId}"]` : manager.id === "providers" && options.resourceId ? `[data-provider="${options.resourceId}"]` : options.resourceId ? `[data-manager-resource^="${manager.id}:${options.resourceId}"]` : "[data-view-heading]");
    const focusRequest = this._newFocus(options.resourceId ? "resource" : "heading", options.resourceId || manager.id, {
      selector: requestedSelector,
      returnSelector: options.returnSelector || null,
      align: "start"
    });
    this.emit({ action: "navigate", scopes: ["route", "view", "manager", "search", "focus"], focusRequest, motionKey: `${this.conceptId}:destination-manager` });
    return true;
  }

  navigate(destination) {
    if (typeof destination === "string") {
      if (this.settings.has(destination)) return this.openSetting(destination);
      if (DATA.MANAGERS?.some((entry) => entry.id === destination)) return this.openManager(destination);
      if (CATEGORIES.some((entry) => entry.id === destination)) return this.openCategory(destination);
      return false;
    }
    if (!destination) return false;
    if (destination.screen === "home" || destination.type === "home") return this.openHome();
    if (destination.type === "usage" || destination.screen === "usage") return this.openManager("providers", "usage", {
      ...destination,
      selector: destination.selector || "[data-focus-key=\"provider-usage-heading\"]"
    });
    if (destination.settingId) return this.openSetting(destination.settingId);
    if (destination.screen === "manager" || destination.type === "manager" || destination.managerId) return this.openManager(destination.managerId, destination.tab || destination.managerTab || "overview", destination);
    return this.openCategory(destination.categoryId, destination.subcategoryId || null, destination.settingId || null);
  }

  setSubcategory(subcategoryId, reason = "scrollspy") {
    const category = CATEGORIES.find((entry) => entry.id === this.state.categoryId);
    if (!category?.subcategories?.some((entry) => entry.id === subcategoryId)) return false;
    if (this.state.subcategoryId === subcategoryId) return true;
    this.state.subcategoryId = subcategoryId;
    this.emit({ action: reason === "scrollspy" ? "scrollspy" : "jump", scopes: ["scrollspy", "navigation", "inspector"], motionKey: reason === "scrollspy" ? `${this.conceptId}:scrollspy` : `${this.conceptId}:jump` });
    return true;
  }

  setAdvancedSection(sectionId, open) {
    const sections = new Set(this.state.advancedSections);
    if (open) sections.add(sectionId);
    else sections.delete(sectionId);
    this.state.advancedSections = [...sections];
    const focusRequest = open ? this._newFocus("disclosure", sectionId, { selector: `[data-disclosure-panel="${sectionId}"]`, preventScroll: true }) : null;
    this.emit({ action: "disclosure", scopes: ["workspace", "focus"], focusRequest, motionKey: `${this.conceptId}:disclosure` });
  }

  setNavigationOpen(open = !this.state.navigationOpen) {
    this.state.navigationOpen = Boolean(open);
    if (this.state.navigationOpen) this.state.inspectorOpen = false;
    const focusRequest = this.state.navigationOpen
      ? this._newFocus("drawer", "settings-navigator", { selector: "#categoryNavigator button", preventScroll: true, returnSelector: "[data-nav-toggle]" })
      : null;
    this.emit({ action: "navigation", scopes: ["navigation", "inspector", "focus"], focusRequest, motionKey: `${this.conceptId}:drawer` });
    return this.state.navigationOpen;
  }

  setInspectorOpen(open = !this.state.inspectorOpen) {
    this.state.inspectorOpen = Boolean(open);
    if (this.state.inspectorOpen) this.state.navigationOpen = false;
    const focusRequest = this.state.inspectorOpen
      ? this._newFocus("drawer", "workspace-inspector", { selector: "#workspaceInspector [data-focus-key=\"inspector-heading\"]", preventScroll: true, returnSelector: "[data-inspector-toggle]" })
      : null;
    this.emit({ action: "inspector", scopes: ["inspector", "navigation", "focus"], focusRequest, motionKey: `${this.conceptId}:drawer` });
    return this.state.inspectorOpen;
  }

  setManagerTab(managerTab, options = {}) {
    this.state.managerTab = managerTab;
    const focusRequest = this._newFocus("tab", managerTab, { selector: `[role="tab"][data-manager-tab="${managerTab}"]`, preventScroll: true, ...options });
    this.emit({ action: "manager-tab", scopes: ["manager", "navigation", "focus"], focusRequest, motionKey: `${this.conceptId}:manager-tab` });
  }

  setSearch(query, open = true, surface = this.state.search.surface) {
    const documents = this.search(query);
    this._setSearch({ query: String(query || ""), open: Boolean(open && String(query || "").trim()), activeIndex: 0, optionCount: documents.length, surface });
    this.emit({ action: "search", scopes: ["search"], motionKey: "search", announcement: documents.length ? `${documents.length} Settings results.` : String(query || "").trim() ? "No Settings results." : null });
    return documents;
  }

  closeSearch(options = {}) {
    this._setSearch({ open: false, activeIndex: 0 });
    if (options.clear) this._setSearch({ query: "", optionCount: 0 });
    this.emit({ action: "search", scopes: ["search", "focus"], motionKey: "search-dismiss" });
  }

  moveSearchSelection(direction) {
    const results = this.search();
    if (!results.length) {
      this._setSearch({ activeIndex: 0, optionCount: 0 });
      return 0;
    }
    let next = this.state.search.activeIndex;
    if (direction === "home") next = 0;
    else if (direction === "end") next = results.length - 1;
    else next = (next + Number(direction || 0) + results.length) % results.length;
    this._setSearch({ activeIndex: next, optionCount: results.length, open: true });
    this.emit({ action: "search", scopes: ["search"], motionKey: "selection", announcement: results[next]?.title || null });
    return next;
  }

  setSearchSelection(index) {
    const results = this.search();
    const next = Math.max(0, Math.min(results.length - 1, Number(index) || 0));
    this._setSearch({ activeIndex: next, optionCount: results.length });
    this.emit({ action: "search", scopes: ["search"], motionKey: "selection" });
    return next;
  }

  search(query = this.state.search.query, limit = 12) {
    const normalized = String(query || "").trim();
    if (!normalized) return [];
    return this.searchIndex
      .map((document) => ({ document, score: scoreQuery(document, normalized) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || String(a.document.title).localeCompare(String(b.document.title)))
      .slice(0, limit)
      .map((entry) => ({ ...entry.document, destination: destinationFor(entry.document) }));
  }

  activateSearchResult(document = null) {
    const selected = document || this.search()[this.state.search.activeIndex] || this.search()[0];
    if (!selected) return false;
    this.closeSearch({ clear: true });
    return this.navigate(destinationFor(selected));
  }

  _validateSetting(entry, value) {
    if (!entry) return "Setting not found.";
    if (!entry.available || entry.status === "managed" || entry.status === "unavailable" || entry.status === "effective-difference" || entry.type === "comparison") {
      return entry.managedReason || entry.unavailableReason || `${entry.label} is read-only in the current state.`;
    }
    if (entry.choices?.length && !entry.choices.includes(value)) return `${String(value)} is not an available choice.`;
    if (["number", "range"].includes(entry.type)) {
      if (!Number.isFinite(Number(value))) return "Enter a valid number.";
      if (entry.min !== undefined && Number(value) < Number(entry.min)) return `Enter ${entry.min} or greater.`;
      if (entry.max !== undefined && Number(value) > Number(entry.max)) return `Enter ${entry.max} or less.`;
    }
    return null;
  }

  _syncSettingState(entry, preferred = null) {
    entry.status = preferred || (Object.is(entry.value, entry.defaultValue) ? "default" : String(entry.value).toLowerCase() === "automatic" ? "auto" : "custom");
    entry.valueState = entry.status;
    entry.stateLabel = STATUS_LABELS[entry.status] || titleCase(entry.status);
  }

  updateSetting(settingId, value) {
    const entry = this.settings.get(settingId);
    const error = this._validateSetting(entry, value);
    if (error) {
      if (entry) {
        entry.validationError = error;
        entry.invalidDraft = value;
      }
      this.receipt("Setting not changed", error, "warning", { persistent: true });
      this.emit({ action: "setting", scopes: ["setting", "validation", "receipts"], motionKey: "validation", announcement: error });
      return false;
    }
    entry.value = value;
    entry.validationError = null;
    delete entry.invalidDraft;
    this._syncSettingState(entry);
    if (settingId === "experience.appearance.theme") this._setPresentation({ theme: value });
    if (settingId === "experience.appearance.motion") {
      this._setPresentation({ reducedMotionOverride: Boolean(value) });
      entry.effectiveValue = this.state.reducedMotion;
    }
    if (settingId === "experience.appearance.density") this._setPresentation({ density: value });
    this.receipt("Setting saved", `${entry.label} is now ${String(value)}.`, "success");
    this.emit({ action: "setting", scopes: ["setting", "summary", "presentation", "receipts"], motionKey: `${this.conceptId}:setting-save`, announcement: `${entry.label} saved.` });
    return true;
  }

  resetSetting(settingId) {
    const entry = this.settings.get(settingId);
    const error = this._validateSetting(entry, entry?.defaultValue);
    if (error) {
      this.receipt("Default unavailable", error, "warning", { persistent: true });
      return false;
    }
    entry.value = clone(entry.defaultValue);
    entry.validationError = null;
    delete entry.invalidDraft;
    this._syncSettingState(entry, "default");
    if (settingId === "experience.appearance.theme") this._setPresentation({ theme: entry.value });
    if (settingId === "experience.appearance.motion") this._setPresentation({ reducedMotionOverride: Boolean(entry.value) });
    if (settingId === "experience.appearance.density") this._setPresentation({ density: entry.value });
    this.receipt("Default restored", `${entry.label} returned to ${String(entry.defaultValue)}.`, "success");
    this.emit({ action: "setting", scopes: ["setting", "summary", "presentation", "receipts"], motionKey: `${this.conceptId}:setting-reset` });
    return true;
  }

  useInheritedSetting(settingId) {
    const entry = this.settings.get(settingId);
    const error = this._validateSetting(entry, entry?.inheritedValue);
    if (error) {
      this.receipt("Inherited value unavailable", error, "warning", { persistent: true });
      return false;
    }
    entry.value = clone(entry.inheritedValue);
    entry.validationError = null;
    delete entry.invalidDraft;
    this._syncSettingState(entry, "inherited");
    if (settingId === "experience.appearance.motion") this._setPresentation({ reducedMotionOverride: null });
    this.receipt("Inherited value active", `${entry.label} now follows ${entry.source || "its owning source"}.`, "success");
    this.emit({ action: "setting", scopes: ["setting", "summary", "presentation", "receipts"], motionKey: `${this.conceptId}:setting-inherit` });
    return true;
  }

  resetCategory(categoryId) {
    const entries = [...this.settings.values()].filter((entry) => entry.categoryId === categoryId && entry.available && entry.status !== "managed" && entry.type !== "comparison");
    entries.forEach((entry) => {
      entry.value = clone(entry.defaultValue);
      entry.validationError = null;
      delete entry.invalidDraft;
      this._syncSettingState(entry, "default");
    });
    const theme = this.settings.get("experience.appearance.theme");
    const motion = this.settings.get("experience.appearance.motion");
    const density = this.settings.get("experience.appearance.density");
    if (categoryId === "experience") this._setPresentation({ theme: theme?.value, reducedMotionOverride: Boolean(motion?.value), density: density?.value });
    this.receipt("Category defaults restored", `${entries.length} editable settings returned to their defaults.`, "success");
    this.emit({ action: "setting", scopes: ["workspace", "settings", "summary", "presentation", "receipts"], motionKey: `${this.conceptId}:category-reset` });
    return entries.length;
  }

  runSettingAction(settingId) {
    const entry = this.settings.get(settingId);
    if (!entry) return false;
    const descriptions = {
      "safety.filesafe.rules": "The effective FileSafe policy preview opened with recovery guidance; no policy changed.",
      "system.diagnostics.bundle": "A redacted support-bundle preview was prepared; no bundle was written.",
      "system.storage.rebuild": "Sources, estimated time, and rollback were previewed; no index was rebuilt."
    };
    this.receipt("Simulated concept receipt", descriptions[settingId] || `${entry.label} was represented without performing an external operation.`, "managed", { persistent: true });
    return true;
  }

  provider(providerId = this.state.selectedProviderId) {
    return this.providers.find((provider) => provider.id === providerId) || this.providers[0] || null;
  }

  selectProvider(providerId) {
    const provider = this.providers.find((entry) => entry.id === providerId);
    if (!provider) return false;
    this.state.selectedProviderId = provider.id;
    this.state.selectedAccountId = provider.activeAccountId || provider.accounts[0]?.id || null;
    const focusRequest = this._newFocus("provider", provider.id, { selector: `[data-provider="${provider.id}"]`, preventScroll: true });
    this.emit({ action: "provider-select", scopes: ["provider", "detail", "focus"], focusRequest, motionKey: `${this.conceptId}:provider-select` });
    return true;
  }

  selectProviderAccount(accountId, providerId = this.state.selectedProviderId) {
    const provider = this.provider(providerId);
    const account = provider?.accounts.find((entry) => entry.id === accountId);
    if (!account) return false;
    this.state.selectedProviderId = provider.id;
    this.state.selectedAccountId = account.id;
    const focusRequest = this._newFocus("account", account.id, { selector: `[data-account-select="${account.id}"]`, preventScroll: true });
    this.emit({ action: "provider-select", scopes: ["provider", "account", "detail", "focus"], focusRequest, motionKey: "selection" });
    return true;
  }

  useAccount(accountId, providerId = this.state.selectedProviderId) {
    const provider = this.provider(providerId);
    const account = provider?.accounts.find((entry) => entry.id === accountId);
    if (!account) return false;
    if (!["ready", "degraded"].includes(account.state)) {
      this.receipt("Account not selected", `${account.name} cannot receive new work until its ${account.state} state is resolved.`, "warning", { persistent: true });
      return false;
    }
    const capturedInFlight = provider.inFlightAccountId;
    provider.activeAccountId = account.id;
    this.state.selectedProviderId = provider.id;
    this.state.selectedAccountId = account.id;
    const inFlight = provider.accounts.find((entry) => entry.id === capturedInFlight);
    this.receipt("Future route updated", `${account.name} will be preferred for new requests. ${inFlight ? `${inFlight.name} remains assigned to the in-flight request.` : "No in-flight request changed."}`, "success", { persistent: true });
    this.emit({ action: "provider-account", scopes: ["provider", "account", "routing", "receipts"], motionKey: `${this.conceptId}:account-route`, announcement: `${account.name} will be used for future requests.` });
    return true;
  }

  // Compatibility: existing UI treated account selection as choosing the future route.
  selectAccount(accountId) {
    return this.useAccount(accountId);
  }

  _recordProviderOperation(provider, action, outcome, detail = {}) {
    const operation = deepFreeze({
      id: `provider-operation-${++this._operationSequence}`,
      providerId: provider.id,
      accountId: detail.accountId ?? provider.activeAccountId ?? null,
      action,
      outcome,
      scenario: detail.scenario ?? this.state.scenario,
      capturedAt: nowISO(),
      lastKnownGoodVersion: provider.catalogue.version,
      detail: clone(detail)
    });
    this.providerOperations = [...this.providerOperations, operation].slice(-100);
    return operation;
  }

  _setProviderRefreshing(providerId, active) {
    const ids = new Set(this.state.refreshingProviderIds);
    if (active) ids.add(providerId);
    else ids.delete(providerId);
    this.state.refreshingProviderIds = [...ids];
    this.state.refreshingProviderId = this.state.refreshingProviderIds[0] || null;
  }

  async refreshProvider(providerId = this.state.selectedProviderId) {
    if (this._refreshJobs.has(providerId)) return this._refreshJobs.get(providerId);
    const provider = this.provider(providerId);
    if (!provider) return false;
    const capturedScenario = this.state.scenario;
    const lastKnownGood = deepFreeze(clone(provider.models));
    const version = provider.catalogue.version;
    this._setProviderRefreshing(provider.id, true);
    this.emit({ action: "provider-refresh-start", scopes: ["provider", "refresh"], motionKey: `${this.conceptId}:refresh-start`, announcement: `Refreshing ${provider.name}.` });

    const job = (async () => {
      await new Promise((resolve) => setTimeout(resolve, this.state.reducedMotion ? 24 : 180));
      const failure = /degraded|error/.test(capturedScenario);
      if (failure) {
        provider.models = clone(lastKnownGood);
        provider.catalogue.lastKnownGood = lastKnownGood;
        const quarantine = deepFreeze({ id: `quarantine-${Date.now()}`, candidateVersion: `${version}-candidate`, reason: "Fixture validation failed", capturedAt: nowISO() });
        provider.catalogue.quarantine = [...provider.catalogue.quarantine, quarantine];
        this._recordProviderOperation(provider, "refresh", "quarantined", { scenario: capturedScenario, preservedRows: lastKnownGood.length, quarantineId: quarantine.id });
        this.receipt("Update quarantined", `Validation failed. ${lastKnownGood.length} last-known-good model rows remain active.`, "warning", { persistent: true });
        return false;
      }
      provider.models.forEach((model) => {
        model.evidence = String(model.evidence || "Evidence checked").replace(/today|minutes ago/i, "just checked");
        model.evidenceFreshness = "Just checked";
      });
      provider.catalogue.version = `${version.split("+")[0]}+${Date.now()}`;
      provider.catalogue.refreshedAt = "Just now";
      provider.catalogue.lastKnownGood = deepFreeze(clone(provider.models));
      this._recordProviderOperation(provider, "refresh", "accepted", { scenario: capturedScenario, preservedRows: provider.models.length });
      this.receipt("Catalogue refreshed", `${provider.name} kept ${provider.models.length} active model rows while checking updates.`, "success", { persistent: true });
      return true;
    })();

    this._refreshJobs.set(providerId, job);
    this._pending.add(job);
    try {
      return await job;
    } finally {
      this._pending.delete(job);
      this._refreshJobs.delete(providerId);
      this._setProviderRefreshing(provider.id, false);
      this.emit({ action: "provider-refresh-end", scopes: ["provider", "refresh", "receipts"], motionKey: `${this.conceptId}:refresh-end`, announcement: `${provider.name} refresh finished.` });
    }
  }

  runProviderAction(action, providerId = this.state.selectedProviderId) {
    const provider = this.provider(providerId);
    if (!provider) return false;
    const messages = {
      reconnect: `A simulated reconnect receipt was recorded for ${provider.name}; no real sign-in was started.`,
      repair: `A simulated readiness repair was recorded for ${provider.name}; credentials were not accessed.`,
      install: `Installation guidance opened for ${provider.name}; no software was installed.`,
      setup: `Provider-owned setup guidance opened for ${provider.name}; no purchase or login occurred.`,
      logs: `Redacted diagnostic history opened for ${provider.name}.`,
      support: `Provider-specific recovery guidance opened for ${provider.name}.`
    };
    const message = messages[action] || `The ${action} action returned an honest concept receipt.`;
    this._recordProviderOperation(provider, action, "simulated", { message });
    this.receipt("Simulated provider action", message, "managed", { persistent: true });
    return true;
  }

  model(modelId) {
    for (const provider of this.providers) {
      const model = provider.models.find((entry) => entry.id === modelId);
      if (model) return { provider, model };
    }
    return null;
  }

  _editableModel(modelId) {
    const found = this.model(modelId);
    if (!found) return { found: null, error: "Model not found." };
    if (found.model.state === "unavailable" || found.model.available === false) return { found, error: found.model.reason || `${found.model.name} is unavailable.` };
    return { found, error: null };
  }

  canMoveModel(modelId, direction) {
    const found = this.model(modelId);
    if (!found || found.model.state === "unavailable") return false;
    const index = found.provider.models.findIndex((entry) => entry.id === modelId);
    const target = index + Number(direction);
    return target >= 0 && target < found.provider.models.length;
  }

  toggleFavorite(modelId) {
    const { found, error } = this._editableModel(modelId);
    if (error) {
      this.receipt("Model unchanged", error, "warning", { persistent: true });
      return false;
    }
    found.model.favorite = !found.model.favorite;
    this.receipt(found.model.favorite ? "Model favorited" : "Favorite removed", `${found.model.name} remains in its current priority position.`, "success");
    this.emit({ action: "model", scopes: ["provider", "models", "receipts"], motionKey: `${this.conceptId}:model-favorite` });
    return true;
  }

  updateModelAlias(modelId, alias) {
    const { found, error } = this._editableModel(modelId);
    if (error) {
      this.receipt("Alias unchanged", error, "warning", { persistent: true });
      return false;
    }
    const next = String(alias || "").trim();
    if (!next) {
      this.receipt("Alias required", "Enter a visible alias or restore the model name.", "warning", { persistent: true });
      return false;
    }
    found.model.alias = next;
    this.receipt("Alias saved", `${found.model.name} is shown as ${found.model.alias}.`, "success");
    this.emit({ action: "model", scopes: ["provider", "models", "receipts"], motionKey: "setting-save" });
    return true;
  }

  moveModel(modelId, direction) {
    const { found, error } = this._editableModel(modelId);
    if (error || !this.canMoveModel(modelId, direction)) return false;
    const rows = found.provider.models;
    const index = rows.findIndex((entry) => entry.id === modelId);
    const target = index + Number(direction);
    const [entry] = rows.splice(index, 1);
    rows.splice(target, 0, entry);
    rows.forEach((model, position) => { model.priority = position + 1; });
    this.receipt("Priority updated", `${entry.name} is priority ${entry.priority} for ${found.provider.name}.`, "success");
    this.emit({ action: "model", scopes: ["provider", "models", "receipts"], motionKey: `${this.conceptId}:model-reorder` });
    return true;
  }

  setModelSpeed(modelId, speed) {
    const { found, error } = this._editableModel(modelId);
    if (error) {
      this.receipt("Model mode unchanged", error, "warning", { persistent: true });
      return false;
    }
    if (!['Normal', 'Fast'].includes(speed)) return false;
    if (speed === "Fast" && !found.model.fastSupported) {
      this.receipt("Fast mode unavailable", `${found.model.name} has no current provider evidence for Fast mode.`, "warning", { persistent: true });
      return false;
    }
    found.model.speed = speed;
    this.receipt("Model mode saved", `${found.model.name} will use ${speed} for future requests.`, "success");
    this.emit({ action: "model", scopes: ["provider", "models", "receipts"], motionKey: "setting-save" });
    return true;
  }

  setModelEffort(modelId, effort) {
    const { found, error } = this._editableModel(modelId);
    if (error || !found?.model.effort?.includes(effort)) {
      this.receipt("Effort unchanged", error || `${effort} is not supported by this model.`, "warning", { persistent: true });
      return false;
    }
    found.model.selectedEffort = effort;
    this.receipt("Effort saved", `${found.model.name} will request ${effort} effort when supported.`, "success");
    this.emit({ action: "model", scopes: ["provider", "models", "receipts"], motionKey: "setting-save" });
    return true;
  }

  setModelVisibility(modelId, visible) {
    const { found, error } = this._editableModel(modelId);
    if (error) return false;
    found.model.hidden = !visible;
    this.receipt(visible ? "Model shown" : "Model hidden", `${found.model.name} ${visible ? "is available in eligible pickers" : "remains configured but is hidden from ordinary pickers"}.`, "success");
    this.emit({ action: "model", scopes: ["provider", "models", "receipts"], motionKey: "setting-save" });
    return true;
  }

  qualifyRole(roleId, route) {
    const role = this.roles.find((entry) => entry.id === roleId);
    if (!role) return { qualified: false, reason: "Role not found." };
    const candidate = String(route || "").trim();
    if (!candidate) return { qualified: false, reason: "Choose a route." };
    if (role.eligibleRoutes?.length && !role.eligibleRoutes.includes(candidate)) return { qualified: false, reason: `${candidate} is not qualified for ${role.label}.` };
    if (["Use Main Assistant", "Qualified route pool", "Ask each time"].includes(candidate)) return { qualified: true, reason: "Delegated to a qualified policy route." };
    const found = this.providers.flatMap((provider) => provider.models.map((model) => ({ provider, model }))).find(({ model }) => candidate.toLowerCase().includes(String(model.name).toLowerCase()) || candidate.toLowerCase().includes(String(model.alias || "").toLowerCase()));
    if (found?.model.state === "unavailable") return { qualified: false, reason: found.model.reason || `${found.model.name} is unavailable.` };
    if (["assistant", "planning", "approval"].includes(role.id) && /mini|community|free bounded|local coder/i.test(candidate)) {
      return { qualified: false, reason: `${role.label} requires a high-quality conversational or review route.` };
    }
    if (role.id === "vision" && found && !/vision|image/i.test(found.model.capabilities || "")) return { qualified: false, reason: `${found.model.name} has no current image-input evidence.` };
    if (role.id === "mcp-tools" && found && !/tools/i.test(found.model.capabilities || "")) return { qualified: false, reason: `${found.model.name} has no current tool-use evidence.` };
    return { qualified: true, reason: found ? "Current model evidence satisfies the role." : "Explicit qualified route fixture." };
  }

  assignRole(roleId, route) {
    const role = this.roles.find((entry) => entry.id === roleId);
    const qualification = this.qualifyRole(roleId, route);
    if (!role || !qualification.qualified) {
      this.receipt("Role assignment rejected", qualification.reason, "warning", { persistent: true });
      return false;
    }
    role.route = route;
    role.qualification = qualification;
    this.receipt("Role assignment saved", `${role.label} will use ${route} for future work.`, "success", { persistent: true });
    this.emit({ action: "role", scopes: ["provider", "roles", "receipts"], motionKey: `${this.conceptId}:role-assignment` });
    return true;
  }

  filteredMemories() {
    const filters = this.state.memoryFilters;
    const query = String(filters.query || this.state.memoryQuery || "").trim().toLowerCase();
    return this.memories.filter((entry) => {
      if (query && ![entry.title, entry.summary, entry.kind, entry.scope, entry.source].join(" ").toLowerCase().includes(query)) return false;
      if (filters.kind !== "all" && entry.kind !== filters.kind) return false;
      if (filters.scope !== "all" && entry.scope !== filters.scope) return false;
      if (filters.state !== "all" && entry.state !== filters.state) return false;
      if (filters.pinned === "pinned" && !entry.pinned) return false;
      if (filters.pinned === "unpinned" && entry.pinned) return false;
      return !entry.discarded;
    });
  }

  selectMemory(memoryId) {
    if (!this.memories.some((entry) => entry.id === memoryId && !entry.discarded)) return false;
    this.state.selectedMemoryId = memoryId;
    const focusRequest = this._newFocus("memory", memoryId, { selector: `[data-memory-detail="${memoryId}"]`, preventScroll: true });
    this.emit({ action: "memory-select", scopes: ["memory", "detail", "focus"], focusRequest, motionKey: `${this.conceptId}:memory-select` });
    return true;
  }

  setMemoryQuery(memoryQuery) {
    return this.setMemoryFilter("query", memoryQuery);
  }

  setMemoryFilter(key, value) {
    if (!(key in this.state.memoryFilters)) return false;
    this.state.memoryFilters = { ...this.state.memoryFilters, [key]: value };
    this.state.memoryQuery = this.state.memoryFilters.query;
    const items = this.filteredMemories();
    if (!items.some((entry) => entry.id === this.state.selectedMemoryId)) this.state.selectedMemoryId = items[0]?.id || null;
    this.emit({ action: "memory-search", scopes: ["memory", "search", "detail"], motionKey: "search", announcement: `${items.length} Memory Gists shown.` });
    return true;
  }

  _appendMemoryVersion(memory, changes, reason) {
    const version = Math.max(0, ...memory.versions.map((entry) => Number(entry.version) || 0)) + 1;
    Object.assign(memory, changes);
    memory.version = version;
    memory.versions = [...memory.versions, memorySnapshot(memory, version, { ...changes, reason })];
    return version;
  }

  editMemory(memoryId, changes = {}) {
    const memory = this.memories.find((entry) => entry.id === memoryId && !entry.discarded);
    if (!memory) return false;
    const allowed = Object.fromEntries(Object.entries(changes).filter(([key]) => ["title", "summary", "scope", "kind", "source", "halfLife"].includes(key)));
    if (!Object.keys(allowed).length) return false;
    this._appendMemoryVersion(memory, { ...allowed, state: "awaiting-review" }, "User-authored correction");
    this.receipt("Memory correction saved", `${memory.title} has a new immutable version awaiting verification.`, "success", { persistent: true });
    this.emit({ action: "memory", scopes: ["memory", "detail", "history", "receipts"], motionKey: `${this.conceptId}:memory-version` });
    return true;
  }

  toggleMemoryPin(memoryId) {
    const memory = this.memories.find((entry) => entry.id === memoryId && !entry.discarded);
    if (!memory) return false;
    memory.pinned = !memory.pinned;
    this._appendMemoryVersion(memory, { pinned: memory.pinned }, memory.pinned ? "Protected with pin" : "Pin removed");
    this.receipt(memory.pinned ? "Memory protected" : "Pin removed", `${memory.title} ${memory.pinned ? "will resist ordinary recall fading" : "keeps its existing evidence and versions"}.`, "success");
    this.emit({ action: "memory", scopes: ["memory", "detail", "history", "receipts"], motionKey: `${this.conceptId}:memory-pin` });
    return true;
  }

  verifyMemory(memoryId) {
    const memory = this.memories.find((entry) => entry.id === memoryId && !entry.discarded);
    if (!memory) return false;
    this._appendMemoryVersion(memory, { state: "verified", source: `${memory.source}; evidence reviewed` }, "Evidence verified");
    this.receipt("Memory verified", `${memory.title} now has a new verified version.`, "success", { persistent: true });
    this.emit({ action: "memory", scopes: ["memory", "detail", "history", "receipts"], motionKey: `${this.conceptId}:memory-verify` });
    return true;
  }

  restoreMemory(memoryId, targetVersion = null) {
    const memory = this.memories.find((entry) => entry.id === memoryId && !entry.discarded);
    if (!memory || memory.versions.length <= 1) return false;
    const history = memory.versions;
    const target = targetVersion === null
      ? history[history.length - 2]
      : history.find((entry) => Number(entry.version) === Number(targetVersion));
    if (!target) return false;
    const restoredFrom = target.version;
    this._appendMemoryVersion(memory, {
      title: target.title,
      summary: target.summary,
      state: target.state,
      scope: target.scope,
      kind: target.kind,
      source: target.source,
      halfLife: target.halfLife,
      pinned: target.pinned
    }, `Restored from version ${restoredFrom}`);
    const latest = memory.versions[memory.versions.length - 1];
    memory.versions[memory.versions.length - 1] = deepFreeze({ ...clone(latest), restoredFrom });
    this.receipt("Prior version restored", `${memory.title} copied version ${restoredFrom} into new version ${memory.version}; all history remains immutable.`, "success", { persistent: true });
    this.emit({ action: "memory", scopes: ["memory", "detail", "history", "receipts"], motionKey: `${this.conceptId}:memory-restore` });
    return true;
  }

  discardMemory(memoryId) {
    const index = this.memories.findIndex((entry) => entry.id === memoryId && !entry.discarded);
    if (index < 0) return false;
    const [memory] = this.memories.splice(index, 1);
    this.state.memoryUndo = { memory, index, expiresAt: Date.now() + 12000 };
    if (this.state.selectedMemoryId === memoryId) this.state.selectedMemoryId = this.filteredMemories()[0]?.id || null;
    this.receipt("Memory discarded", `${memory.title} was removed from recall. Undo remains available in this review state.`, "warning", { persistent: true, action: "undo-memory-discard" });
    this.emit({ action: "memory", scopes: ["memory", "detail", "receipts"], motionKey: `${this.conceptId}:memory-discard` });
    return true;
  }

  undoDiscardMemory() {
    const undo = this.state.memoryUndo;
    if (!undo) return false;
    this.memories.splice(Math.min(undo.index, this.memories.length), 0, undo.memory);
    this.state.selectedMemoryId = undo.memory.id;
    this.state.memoryUndo = null;
    this.receipt("Memory restored", `${undo.memory.title} returned with every immutable version intact.`, "success");
    this.emit({ action: "memory", scopes: ["memory", "detail", "receipts", "focus"], motionKey: `${this.conceptId}:memory-undo` });
    return true;
  }

  memoryVersions(memoryId) {
    return clone(this.memories.find((entry) => entry.id === memoryId)?.versions || []);
  }

  memoryCapsule(memoryId = this.state.selectedMemoryId) {
    const memory = this.memories.find((entry) => entry.id === memoryId);
    if (!memory) return null;
    return clone({ title: memory.title, summary: memory.summary, provenance: memory.source, scope: memory.scope, version: memory.version, halfLife: memory.halfLife, pinned: memory.pinned });
  }

  terminal(profileId = this.state.selectedTerminalId) {
    return this.terminals.find((entry) => entry.id === profileId) || this.terminals[0] || null;
  }

  selectTerminal(profileId, options = {}) {
    const next = this.terminals.find((entry) => entry.id === profileId);
    if (!next) return false;
    const current = this.terminal();
    if (current?.dirty && current.id !== profileId && !options.discardDraft && !options.applyDraft) {
      this.state.pendingTerminalSwitch = { fromId: current.id, toId: profileId };
      this.receipt("Unsaved Terminal profile", `Apply or reset ${current.name} before opening ${next.name}.`, "warning", { persistent: true });
      return false;
    }
    if (current?.dirty && options.applyDraft) this.applyTerminal(current.id);
    if (current?.dirty && options.discardDraft) this.resetTerminal(current.id);
    this.state.selectedTerminalId = profileId;
    this.state.pendingTerminalSwitch = null;
    const focusRequest = this._newFocus("terminal", profileId, { selector: `[data-terminal-detail="${profileId}"]`, preventScroll: true });
    this.emit({ action: "terminal-select", scopes: ["terminal", "detail", "focus"], focusRequest, motionKey: `${this.conceptId}:terminal-select` });
    return true;
  }

  resolveTerminalSwitch(choice) {
    const pending = this.state.pendingTerminalSwitch;
    if (!pending) return false;
    if (choice === "cancel") {
      this.state.pendingTerminalSwitch = null;
      this.emit({ action: "terminal", scopes: ["terminal"], motionKey: "none" });
      return true;
    }
    if (choice === "apply") this.applyTerminal(pending.fromId);
    else if (choice === "discard") this.resetTerminal(pending.fromId);
    else return false;
    return this.selectTerminal(pending.toId, { discardDraft: false });
  }

  updateTerminal(key, value, profileId = this.state.selectedTerminalId) {
    const profile = this.terminal(profileId);
    if (!profile || !TERMINAL_EDITABLE.has(key) || !(key in profile.draft)) return false;
    let next = value;
    if (["fontSize", "lineHeight", "opacity"].includes(key)) {
      next = Number(value);
      const [min, max] = key === "fontSize" ? [10, 22] : key === "lineHeight" ? [1, 2.2] : [0.2, 1];
      if (!Number.isFinite(next) || next < min || next > max) {
        this.receipt("Profile value rejected", `${titleCase(key)} must be between ${min} and ${max}.`, "warning", { persistent: true });
        return false;
      }
    }
    profile.draft[key] = clone(next);
    profile[key] = clone(next);
    profile.dirty = JSON.stringify(profile.draft) !== JSON.stringify(profile.saved);
    this.emit({ action: "terminal", scopes: ["terminal", "preview", "dirty-state"], motionKey: `${this.conceptId}:terminal-preview`, announcement: `${profile.name} preview updated.` });
    return true;
  }

  applyTerminal(profileId = this.state.selectedTerminalId) {
    const profile = this.terminal(profileId);
    if (!profile) return false;
    profile.saved = deepFreeze(clone(profile.draft));
    profile.dirty = false;
    this.receipt("Terminal profile applied", `${profile.name} saved its current preview values. No shell command was executed.`, "success", { persistent: true });
    this.emit({ action: "terminal", scopes: ["terminal", "preview", "dirty-state", "receipts"], motionKey: `${this.conceptId}:terminal-apply` });
    return true;
  }

  resetTerminal(profileId = this.state.selectedTerminalId) {
    const profile = this.terminal(profileId);
    if (!profile) return false;
    profile.draft = clone(profile.saved);
    Object.assign(profile, profile.draft);
    profile.dirty = false;
    this.receipt("Terminal draft reset", `${profile.name} returned to its last saved values.`, "success");
    this.emit({ action: "terminal", scopes: ["terminal", "preview", "dirty-state", "receipts"], motionKey: `${this.conceptId}:terminal-reset` });
    return true;
  }

  restoreTerminalDefaults(profileId = this.state.selectedTerminalId) {
    const original = TERMINAL_PROFILES.find((entry) => entry.id === profileId);
    const profile = this.terminal(profileId);
    if (!original || !profile) return false;
    const normalized = normalizeTerminal(original);
    profile.saved = normalized.saved;
    profile.draft = clone(normalized.draft);
    Object.assign(profile, profile.draft);
    profile.dirty = false;
    this.receipt("Profile defaults restored", `${profile.name} returned to the deterministic fixture defaults.`, "success");
    this.emit({ action: "terminal", scopes: ["terminal", "preview", "dirty-state", "receipts"], motionKey: `${this.conceptId}:terminal-reset` });
    return true;
  }

  runTerminalDiagnostics(profileId = this.state.selectedTerminalId) {
    const profile = this.terminal(profileId);
    if (!profile) return false;
    const result = deepFreeze({ id: `terminal-diagnostic-${Date.now()}`, at: nowISO(), shell: profile.shell, renderer: profile.renderer, startup: profile.startup, result: "ready", simulation: true });
    profile.diagnostics = [...profile.diagnostics, result].slice(-12);
    this.receipt("Simulated diagnostics complete", `${profile.shell} was represented as detected; rendering and startup checks returned a concept-only receipt.`, "managed", { persistent: true });
    this.emit({ action: "terminal", scopes: ["terminal", "diagnostics", "receipts"], motionKey: `${this.conceptId}:terminal-diagnostics` });
    return result;
  }

  isSpellingExcluded(text, context = {}) {
    const value = String(text || "");
    const kind = String(context.kind || "prose").toLowerCase();
    if (context.literal || TECHNICAL_CONTEXTS.has(kind)) return true;
    if (this.spelling.knownNames.some((name) => value.toLowerCase() === String(name).toLowerCase())) return !this.spelling.underlineUnknownNames;
    if (/https?:\/\/|\bwww\./i.test(value)) return true;
    if (/(?:^|\s)(?:\.{0,2}\/|\/)[\w.@-]+(?:\/[\w.@-]+)+/.test(value) || /^(?:[A-Za-z]:)?[\w.@-]+(?:\/[\w.@-]+)+(?:\.\w+)?$/.test(value.trim())) return true;
    if (/^(?:[a-f\d]{7,}|sha(?:1|256):[a-f\d]+)$/i.test(value.trim())) return true;
    if (/^[\w.-]+@[\w.-]+$/.test(value.trim())) return true;
    if (/^[a-z]+(?:[A-Z][a-z\d]*)+$|^[a-z\d]+(?:[-_][a-z\d]+)+$/.test(value.trim())) return !this.spelling.technicalProse;
    if (/^\s*(?:\$|npm |pnpm |yarn |node |python\d* |cargo |git |rg )/.test(value)) return true;
    if (/^\s*[\[{].*[\]}]\s*$/s.test(value)) return true;
    return false;
  }

  spellingCandidates(text = this.spelling.draft, context = {}) {
    if (!this.spelling.enabled || this.isSpellingExcluded(text, context)) return [];
    const personal = new Set(this.spelling.personalDictionary.map((word) => word.toLowerCase()));
    const project = new Set(this.spelling.projectDictionary.map((word) => word.toLowerCase()));
    const ignored = new Set(this.spelling.ignoredForDraft.map((word) => word.toLowerCase()));
    const ignoredOnce = new Set(this.spelling.ignoredOnce.map((entry) => String(entry.word).toLowerCase()));
    return this.spelling.misspellings.filter((entry) => {
      const word = String(entry.word || "").toLowerCase();
      return word && new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text) && !personal.has(word) && !project.has(word) && !ignored.has(word) && !ignoredOnce.has(word);
    });
  }

  spellAction(action, payload = {}) {
    const type = String(action || "").toLowerCase();
    const word = String(payload.word || this.spelling.misspellings[0]?.word || "").trim();
    const replacement = String(payload.replacement || this.spelling.misspellings.find((entry) => entry.word === word)?.suggestions?.[0] || "").trim();
    if (!word) return false;
    if (type === "replace" || type === "replace-once") {
      if (!replacement) return false;
      this.spelling.draft = this.spelling.draft.replace(new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`), replacement);
    } else if (type === "ignore-once") {
      this.spelling.ignoredOnce = [...this.spelling.ignoredOnce, { word, occurrence: payload.occurrence || 0 }];
    } else if (type === "ignore" || type === "ignore-draft" || type === "ignore-for-draft") {
      this.spelling.ignoredForDraft = [...new Set([...this.spelling.ignoredForDraft, word])];
    } else if (type === "personal" || type === "add-personal" || type === "add-to-personal-dictionary") {
      this.spelling.personalDictionary = [...new Set([...this.spelling.personalDictionary, word])];
    } else if (type === "project" || type === "dictionary" || type === "add-project" || type === "add-to-project-dictionary") {
      this.spelling.projectDictionary = [...new Set([...this.spelling.projectDictionary, word])];
    } else return false;
    this.spelling.lastAction = deepFreeze({ action: type, word, replacement: replacement || null, at: nowISO(), automatic: false });
    const labels = {
      replace: "Suggestion applied once",
      "replace-once": "Suggestion applied once",
      "ignore-once": "Suggestion ignored once",
      ignore: "Suggestion ignored for draft",
      "ignore-draft": "Suggestion ignored for draft",
      "ignore-for-draft": "Suggestion ignored for draft",
      personal: "Personal dictionary updated",
      "add-personal": "Personal dictionary updated",
      "add-to-personal-dictionary": "Personal dictionary updated",
      project: "Project dictionary updated",
      dictionary: "Project dictionary updated",
      "add-project": "Project dictionary updated",
      "add-to-project-dictionary": "Project dictionary updated"
    };
    this.receipt(labels[type] || "Spelling action applied", "Only the local writing preview changed; no automatic replacement or provider call occurred.", "success", { persistent: true });
    this.emit({ action: "spelling", scopes: ["spelling", "receipts", "focus"], motionKey: `${this.conceptId}:spelling-action`, announcement: labels[type] });
    return true;
  }

  receipt(title, message, tone = "success", options = {}) {
    const entry = deepFreeze({
      id: `receipt-${++this._receiptSequence}`,
      title,
      message,
      tone,
      createdAt: nowISO(),
      dismissedAt: null,
      persistent: options.persistent !== false,
      action: options.action || null,
      simulation: tone === "managed" || Boolean(options.simulation)
    });
    this.receiptHistory = [...this.receiptHistory, entry].slice(-200);
    this.state.receipts = [...this.state.receipts, entry].slice(-50);
    this.emit({ action: "receipt", scopes: ["receipts", "announcer"], motionKey: "receipt", announcement: `${title}. ${message}` });
    return entry;
  }

  dismissReceipt(receiptId) {
    const visible = this.state.receipts.find((entry) => entry.id === receiptId);
    if (!visible) return false;
    this.state.receipts = this.state.receipts.filter((entry) => entry.id !== receiptId);
    this.receiptHistory = this.receiptHistory.map((entry) => entry.id === receiptId ? deepFreeze({ ...clone(entry), dismissedAt: nowISO() }) : entry);
    this.emit({ action: "receipt-clear", scopes: ["receipts"], motionKey: "receipt-dismiss" });
    return true;
  }

  clearReceipts() {
    for (const receipt of [...this.state.receipts]) this.dismissReceipt(receipt.id);
  }

  _dispatchValue(action) {
    const input = typeof action === "string" ? { type: action } : action || {};
    const type = input.type || input.action;
    switch (type) {
      case "review.apply": return this.applyReviewState(input.state || input);
      case "shell.set": return this.setShell(input.values || input);
      case "presentation.set": return this.setPresentation(input.values || input);
      case "scenario.set": return this.setScenario(input.scenario || input.value, input.options);
      case "scenario.apply": return this.applyScenario(input.scenario || input.value, input.options);
      case "scenario.reset": return this.resetScenario();
      case "navigate.home": return this.openHome();
      case "navigate.category": return this.openCategory(input.categoryId, input.subcategoryId, input.settingId);
      case "navigate.setting": return this.openSetting(input.settingId || input.id);
      case "navigate.manager": return this.openManager(input.managerId || input.id, input.tab, input);
      case "navigate.destination": return this.navigate(input.destination);
      case "navigation.toggle": return this.setNavigationOpen(input.open ?? !this.state.navigationOpen);
      case "inspector.toggle": return this.setInspectorOpen(input.open ?? !this.state.inspectorOpen);
      case "subcategory.set": return this.setSubcategory(input.subcategoryId || input.id, input.reason || "jump");
      case "disclosure.set": return this.setAdvancedSection(input.sectionId || input.id, input.open);
      case "manager.tab": return this.setManagerTab(input.tab || input.id);
      case "search.set": return this.setSearch(input.query, input.open ?? true, input.surface);
      case "search.move": return this.moveSearchSelection(input.direction ?? input.delta);
      case "search.select": return this.setSearchSelection(input.index);
      case "search.activate": return this.activateSearchResult(input.document);
      case "search.close": return this.closeSearch(input);
      case "focus.consume": return this.consumeFocusRequest(input.requestId);
      case "setting.update": return this.updateSetting(input.settingId || input.id, input.value);
      case "setting.reset": return this.resetSetting(input.settingId || input.id);
      case "setting.inherit": return this.useInheritedSetting(input.settingId || input.id);
      case "category.reset": return this.resetCategory(input.categoryId || input.id);
      case "setting.action": return this.runSettingAction(input.settingId || input.id);
      case "provider.select": return this.selectProvider(input.providerId || input.id);
      case "provider.account.inspect": return this.selectProviderAccount(input.accountId || input.id, input.providerId);
      case "provider.account.use": return this.useAccount(input.accountId || input.id, input.providerId);
      case "provider.refresh": return this.refreshProvider(input.providerId || input.id);
      case "provider.action": return this.runProviderAction(input.name || input.operation || input.providerAction, input.providerId);
      case "model.favorite": return this.toggleFavorite(input.modelId || input.id);
      case "model.alias": return this.updateModelAlias(input.modelId || input.id, input.alias);
      case "model.move": return this.moveModel(input.modelId || input.id, input.direction);
      case "model.speed": return this.setModelSpeed(input.modelId || input.id, input.speed);
      case "model.effort": return this.setModelEffort(input.modelId || input.id, input.effort);
      case "model.visibility": return this.setModelVisibility(input.modelId || input.id, input.visible);
      case "role.assign": return this.assignRole(input.roleId || input.id, input.route);
      case "memory.select": return this.selectMemory(input.memoryId || input.id);
      case "memory.filter": return this.setMemoryFilter(input.key, input.value);
      case "memory.edit": return this.editMemory(input.memoryId || input.id, input.changes);
      case "memory.pin": return this.toggleMemoryPin(input.memoryId || input.id);
      case "memory.verify": return this.verifyMemory(input.memoryId || input.id);
      case "memory.restore": return this.restoreMemory(input.memoryId || input.id, input.version);
      case "memory.discard": return this.discardMemory(input.memoryId || input.id);
      case "memory.undo": return this.undoDiscardMemory();
      case "terminal.select": return this.selectTerminal(input.profileId || input.id, input.options || input);
      case "terminal.update": return this.updateTerminal(input.key, input.value, input.profileId);
      case "terminal.apply": return this.applyTerminal(input.profileId || input.id);
      case "terminal.reset": return this.resetTerminal(input.profileId || input.id);
      case "terminal.defaults": return this.restoreTerminalDefaults(input.profileId || input.id);
      case "terminal.diagnostics": return this.runTerminalDiagnostics(input.profileId || input.id);
      case "terminal.switch.resolve": return this.resolveTerminalSwitch(input.choice);
      case "spelling.action": return this.spellAction(input.name || input.operation || input.spellingAction, input);
      case "receipt.dismiss": return this.dismissReceipt(input.receiptId || input.id);
      default: return false;
    }
  }

  dispatch(action) {
    const input = typeof action === "string" ? { type: action } : action || {};
    const type = input.type || input.action || "unknown";
    const beforeRevision = this.state.revision;
    const finish = (value) => {
      const emitted = this.state.revision > beforeRevision ? this.state.lastEvent : null;
      const base = emitted || {
        scopes: [],
        focusRequest: clone(this.state.focusRequest),
        announcement: value === false ? `The ${type} action was rejected.` : null,
        motionKey: "none",
        revision: this.state.revision,
        detail: null
      };
      const serializableValue = value === undefined ? null : typeof value === "boolean" || typeof value === "number" || typeof value === "string" ? value : clone(value);
      return deepFreeze({
        action: type,
        scopes: clone(base.scopes),
        focusRequest: clone(base.focusRequest),
        announcement: base.announcement,
        motionKey: base.motionKey,
        revision: base.revision,
        detail: clone(base.detail),
        ok: value !== false,
        value: serializableValue
      });
    };
    const value = this._dispatchValue(input);
    return value && typeof value.then === "function" ? value.then(finish) : finish(value);
  }

  async whenIdle() {
    if (this._pending.size) await Promise.allSettled([...this._pending]);
    await waitFrame();
    await waitFrame();
    return this.snapshot();
  }

  snapshot() {
    return clone({
      conceptId: this.conceptId,
      state: this.state,
      settings: [...this.settings.values()],
      providers: this.providers,
      providerOperations: this.providerOperations,
      roles: this.roles,
      memories: this.memories,
      terminals: this.terminals,
      spelling: this.spelling,
      genericManagers: this.genericManagers,
      setupSessions: this.setupSessions,
      recentChanges: this.recentChanges,
      receiptHistory: this.receiptHistory
    });
  }
}
