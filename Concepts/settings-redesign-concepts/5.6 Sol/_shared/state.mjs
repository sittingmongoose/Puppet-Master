import * as DATA from "./data.mjs";
import {
  BoundedSubscriptionRegistry,
  GOVERNOR_PROJECTION_FIXTURES,
  OBSERVABLE_WORK_FIXTURES,
  ObservableWorkRegistry,
  PERFORMANCE_PROFILES,
  ProviderSetupProjectionRegistry,
  RuntimeResourceGovernorProjection
} from "./runtime-contracts.mjs";

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
  managerById = () => null,
  CONCEPT_MANAGER_ASSIGNMENTS = {},
  FLOW_TEMPLATES = {},
  DETERMINISTIC_TRIGGERS = [],
  MANAGER_COVERAGE_LABELS = {}
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
  "workspace-load": { scopes: ["view", "data", "focus"], motionKey: "none" },
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
  "focus-consumed": { scopes: ["focus"], motionKey: "none" },
  "manager-resource": { scopes: ["manager", "detail", "receipts"], motionKey: "setting-save" },
  "manager-flow": { scopes: ["manager", "flow", "receipts", "focus"], motionKey: "transaction" },
  "provider-installation": { scopes: ["provider", "manager", "flow", "receipts"], motionKey: "transaction" },
  "theme-preview": { scopes: ["presentation", "manager", "preview"], motionKey: "preview" },
  "fixture": { scopes: ["view", "manager", "data", "focus"], motionKey: "transaction" },
  "persistence": { scopes: ["view", "data", "receipts"], motionKey: "none" }
};

const THEME_BY_ID = new Map(THEMES);
const THEME_BY_LABEL = new Map(THEMES.map(([id, label]) => [String(label).toLowerCase(), id]));
const TERMINAL_EDITABLE = new Set([
  "shell", "fallbackShell", "shellSource", "font", "fontFallback", "fontSize", "lineHeight", "foreground", "background", "palette", "ansiPalette",
  "opacity", "material", "backgroundImage", "cursor", "cursorBlink", "selection", "copyPaste", "copyBehavior", "pasteBehavior", "links", "linkBehavior",
  "cwd", "environment", "transcript", "historyLimit", "rendering", "renderer", "performance", "startup"
]);
const TECHNICAL_CONTEXTS = new Set(["code", "code-block", "inline-code", "url", "path", "command", "hash", "identifier", "structured-data", "literal", "model", "provider", "persona", "tool"]);
const PERSISTENCE_SCHEMA = 3;
const DEFAULT_MANAGER_CACHE_BYTES = 1024 * 1024;
const DEFAULT_INACTIVE_MANAGER_LIMIT = 2;
const PERSISTENCE_DEBOUNCE_MS = 250;
const PERSISTENCE_MAX_WAIT_MS = 1000;
const MAX_PERSISTED_BYTES = 64 * 1024;
const TRANSIENT_PERSISTENCE_ACTIONS = new Set([
  "search", "scrollspy", "jump", "focus-consumed", "navigation", "inspector",
  "provider-refresh-start", "provider-refresh-end", "manager-load", "manager-flow-progress",
  "theme-preview", "memory-search", "terminal-preview", "fixture"
]);
const DURABLE_PERSISTENCE_ACTIONS = new Set([
  "setting", "provider-account", "model", "role", "memory", "terminal", "spelling",
  "manager-resource", "provider-installation", "external-change",
  "presentation", "review.apply", "shell"
]);
export const MANAGER_STATE_FIXTURE_IDS = DATA.MANAGER_STATE_FIXTURE_IDS || Object.freeze({});

function safeStorage() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const key = "pm-sol-storage-probe";
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return window.localStorage;
  } catch { return null; }
}


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
  constructor(conceptId, options = {}) {
    this.conceptId = conceptId;
    this.listeners = new Set();
    this._now = options.now || null;
    this._detailModule = null;
    this._detailModulePromise = null;
    this._detailModuleLoadsAtConstruction = Number(globalThis.__pmSettingsDetailModuleLoads || 0);
    this.searchIndex = buildSearchIndex().map((document) => this._compactSearchDocument(document));
    this.settings = new Map(allSettings().map((entry) => [entry.id, normalizeSetting(entry)]));
    this._coldDomainTemplates = {
      providers: PROVIDERS,
      roles: ROLE_ASSIGNMENTS,
      memory: MEMORY_GISTS,
      terminal: TERMINAL_PROFILES
    };
    this.providers = PROVIDERS.map((provider) => ({
      id: provider.id,
      name: provider.name,
      group: provider.group,
      state: provider.state,
      stateLabel: provider.stateLabel,
      summary: provider.summary,
      activeAccountId: null,
      inFlightAccountId: null,
      accounts: [],
      connections: [],
      products: [],
      models: [],
      installations: [],
      runtimeAdapters: [],
      catalogue: { version: provider.catalogue?.version || provider.catalogue?.sourceVersion || "Cached summary", lastKnownGood: [], quarantine: [], removalHistory: [] },
      compactSummary: true
    }));
    this.roles = [];
    this.memories = [];
    this.terminals = [];
    this.spelling = normalizeSpelling(SPELLING_FIXTURE);
    this.setupSessions = clone(SETUP_SESSIONS);
    this.recentChanges = clone(RECENT_CHANGES);
    // Imported inventories are cold deterministic templates. They are never
    // cloned into live state until an explicit manager access requests one.
    this._coldManagerTemplates = DATA.MANAGER_INVENTORIES || {};
    this.genericManagers = Object.create(null);
    this.managerSummaries = Object.fromEntries((DATA.MANAGERS || []).map((manager) => {
      const cold = this._coldManagerTemplates[manager.id] || {};
      return [manager.id, {
        id: manager.id,
        title: cold.title || manager.title,
        purpose: manager.purpose,
        state: cold.state || "Not loaded",
        summary: cold.summary || manager.purpose,
        itemCount: Array.isArray(cold.items) ? cold.items.length : null
      }];
    }));
    this.managerAssignments = clone(CONCEPT_MANAGER_ASSIGNMENTS);
    this.flowTemplates = clone(FLOW_TEMPLATES);
    this.fixtureTriggers = clone(DETERMINISTIC_TRIGGERS);
    this.managerCoverageLabels = clone(MANAGER_COVERAGE_LABELS);
    this.managerOperations = [];
    this.providerOperations = [];
    this.observableWork = new ObservableWorkRegistry({ now: this._now });
    this.resourceGovernor = new RuntimeResourceGovernorProjection({ now: this._now });
    this.providerSetup = new ProviderSetupProjectionRegistry({ workRegistry: this.observableWork, now: this._now });
    this.subscriptions = new BoundedSubscriptionRegistry({ maxHeavySubscriptions: 1 });
    this._activeManagerSubscription = null;
    this._managerCacheMeta = new Map();
    this._managerLoadJobs = new Map();
    this._managerGeneration = new Map();
    this._pendingManagerSelection = new Map();
    this._managerAccessSequence = 0;
    this._managerCacheBudgetBytes = DEFAULT_MANAGER_CACHE_BYTES;
    this._inactiveManagerLimit = DEFAULT_INACTIVE_MANAGER_LIMIT;
    this._storage = Object.prototype.hasOwnProperty.call(options, "storage") ? options.storage : safeStorage();
    this._persistenceKey = `pm.settings.sol.final.${conceptId}`;
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
    this._providerRefreshGeneration = new Map();
    this._pending = new Set();
    this._focusSequence = 0;
    this._receiptSequence = 0;
    this._operationSequence = 0;
    this._searchGeneration = 0;
    this._persistenceDirty = false;
    this._persistenceDebounceTimer = null;
    this._persistenceMaxTimer = null;
    this._persistenceStats = {
      scheduled: 0,
      writes: 0,
      skippedTransient: 0,
      rejectedOversize: 0,
      flushes: 0,
      lastPayloadBytes: 0,
      maxPayloadBytes: 0
    };

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
      selectedAccountId: null,
      selectedInstallationId: null,
      selectedMemoryId: firstMemory,
      memoryQuery: "",
      memoryFilters: { query: "", kind: "all", scope: "all", state: "all", pinned: "all" },
      memoryUndo: null,
      selectedTerminalId: firstTerminal,
      pendingTerminalSwitch: null,
      managerQuery: "",
      listWindows: {},
      selectedManagerResource: {},
      managerStates: {},
      managerHydration: {},
      workspaceHydration: { state: "dormant", detailModuleLoaded: false },
      activeFlow: null,
      observableWork: [],
      providerSetup: null,
      governorProjection: null,
      performance: {
        profile: "normal",
        simulated: true,
        deterministic: true,
        hardwareCertified: false,
        startup: { liveProjectionLoadedManagerCount: 0, liveProjectionLoadedBytes: 0, providerProbes: 0, speculativePrewarm: false, detailModuleLoaded: false, detailModuleLoads: 0, moduleLoadFixtureBytesMeasured: true },
        render: { commits: 0, lastReason: null },
        cache: { budgetBytes: DEFAULT_MANAGER_CACHE_BYTES, currentBytes: 0, inactiveReadyCount: 0, evictions: 0 }
      },
      flowHistory: [],
      previewTheme: null,
      themeBeforePreview: null,
      customThemeDraft: 'accent = "system"\nsurface = "quiet"',
      customThemeStatus: { state: "idle", errors: [], fallback: null },
      soundPreview: null,
      externalChange: null,
      activeFixture: null,
      persistence: { available: Boolean(this._storage), restored: false, lastSavedAt: null, schema: PERSISTENCE_SCHEMA, stats: clone(this._persistenceStats) },
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
      setupSessions: this.setupSessions,
      recentChanges: this.recentChanges
    }));
    this.state.scenarioOverlay = clone(SCENARIOS[this.state.scenario]?.entityOverlay || SCENARIOS[this.state.scenario]?.overlay || {});
    this._applyScenarioOverlay(this.state.scenarioOverlay);
    this._initialState = deepFreeze(clone(this.state));

    this.applyPerformanceProfile(options.performanceProfile || "normal", { emit: false });

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
    this._restorePersistentState();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  destroy() {
    this.flushPersistence({ explicit: true });
    this._activeManagerSubscription?.release?.();
    this._activeManagerSubscription = null;
    this.subscriptions.clear();
    this.observableWork.clear();
    this._motionMedia?.removeEventListener?.("change", this._onMotionPreference);
    this.listeners.clear();
  }

  _compactSearchDocument(document = {}) {
    const haystack = String(document.haystack || [document.title, document.subtitle].filter(Boolean).join(" "))
      .replace(/(?:[a-zA-Z]:\\|\/)[^\s]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 640);
    return deepFreeze({
      kind: String(document.kind || "Destination"),
      id: String(document.id || document.targetId || "search-document"),
      title: String(document.title || "Settings result").slice(0, 160),
      subtitle: String(document.subtitle || "").slice(0, 240),
      targetType: document.targetType || null,
      targetId: document.targetId || null,
      categoryId: document.categoryId || null,
      subcategoryId: document.subcategoryId || null,
      managerTab: document.managerTab || document.destination?.tab || document.destination?.managerTab || null,
      resourceId: document.resourceId || document.destination?.resourceId || null,
      destination: destinationFor(document),
      haystack
    });
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
    this.state.performance.render.commits += 1;
    this.state.performance.render.lastReason = event.action;
    for (const listener of this.listeners) listener(this.state, event);
    this._schedulePersistence(event.action);
    return event;
  }

  patch(values, reason = "state", details = {}) {
    Object.assign(this.state, values);
    if (values.search) this._syncSearchAliases();
    return this.emit(reason, details);
  }

  _persistentPayload() {
    return {
      schema: PERSISTENCE_SCHEMA,
      conceptId: this.conceptId,
      savedAt: nowISO(),
      state: {
        screen: this.state.screen,
        categoryId: this.state.categoryId,
        subcategoryId: this.state.subcategoryId,
        managerId: this.state.managerId,
        managerTab: this.state.managerTab,
        selectedProviderId: this.state.selectedProviderId,
        selectedAccountId: this.state.selectedAccountId,
        selectedInstallationId: this.state.selectedInstallationId,
        selectedMemoryId: this.state.selectedMemoryId,
        selectedTerminalId: this.state.selectedTerminalId,
        selectedManagerResource: this.state.selectedManagerResource,
        theme: this.state.theme,
        density: this.state.density,
        reducedMotionOverride: this.state.reducedMotionOverride,
        customThemeDraft: this.state.customThemeDraft,
        customThemeStatus: this.state.customThemeStatus,
        externalChange: this.state.externalChange,
        providerSetup: this.state.providerSetup,
        flowHistory: this.state.flowHistory.slice(-10)
      },
      settings: [...this.settings.values()].map((entry) => ({ id: entry.id, value: entry.value, status: entry.status })),
      providerPreferences: this.providers.map((provider) => ({
        providerId: provider.id,
        activeAccountId: provider.activeAccountId,
        models: provider.models.map((model) => ({ id: model.id, favorite: model.favorite, priority: model.priority, alias: model.alias, speed: model.speed, selectedEffort: model.selectedEffort, visible: model.visible }))
      })),
      rolePreferences: this.roles.map((role) => ({ id: role.id, route: role.route })),
      managerChanges: this.managerOperations.slice(-25).map(({ managerId, resourceId, changes }) => ({ managerId, resourceId, changes }))
    };
  }

  _syncPersistenceStats() {
    if (this.state?.persistence) this.state.persistence.stats = clone(this._persistenceStats);
  }

  _schedulePersistence(action) {
    if (!this._storage || !this.state?.persistence) return false;
    const durableFlowTerminal = action === "manager-flow" && ["complete", "rolled-back"].includes(this.state.activeFlow?.status);
    const durableThemeApply = action === "theme-preview" && !this.state.previewTheme && !this.state.themeBeforePreview;
    if (!durableFlowTerminal && !durableThemeApply && (TRANSIENT_PERSISTENCE_ACTIONS.has(action) || !DURABLE_PERSISTENCE_ACTIONS.has(action))) {
      this._persistenceStats.skippedTransient += 1;
      this._syncPersistenceStats();
      return false;
    }
    this._persistenceDirty = true;
    this._persistenceStats.scheduled += 1;
    if (this._persistenceDebounceTimer) clearTimeout(this._persistenceDebounceTimer);
    this._persistenceDebounceTimer = setTimeout(() => this.flushPersistence(), PERSISTENCE_DEBOUNCE_MS);
    this._persistenceDebounceTimer?.unref?.();
    if (!this._persistenceMaxTimer) {
      this._persistenceMaxTimer = setTimeout(() => this.flushPersistence(), PERSISTENCE_MAX_WAIT_MS);
      this._persistenceMaxTimer?.unref?.();
    }
    this._syncPersistenceStats();
    return true;
  }

  _clearPersistenceTimers() {
    if (this._persistenceDebounceTimer) clearTimeout(this._persistenceDebounceTimer);
    if (this._persistenceMaxTimer) clearTimeout(this._persistenceMaxTimer);
    this._persistenceDebounceTimer = null;
    this._persistenceMaxTimer = null;
  }

  flushPersistence(options = {}) {
    this._clearPersistenceTimers();
    if (options.explicit) this._persistenceStats.flushes += 1;
    if (!this._storage || !this.state?.persistence || !this._persistenceDirty) {
      this._syncPersistenceStats();
      return false;
    }
    try {
      const payload = this._persistentPayload();
      const serialized = JSON.stringify(payload);
      const bytes = typeof TextEncoder === "function" ? new TextEncoder().encode(serialized).byteLength : serialized.length;
      this._persistenceStats.lastPayloadBytes = bytes;
      this._persistenceStats.maxPayloadBytes = Math.max(this._persistenceStats.maxPayloadBytes, bytes);
      if (bytes > MAX_PERSISTED_BYTES) {
        this._persistenceStats.rejectedOversize += 1;
        this._syncPersistenceStats();
        return false;
      }
      this._storage.setItem(this._persistenceKey, serialized);
      this._persistenceDirty = false;
      this._persistenceStats.writes += 1;
      this.state.persistence.lastSavedAt = payload.savedAt;
      this._syncPersistenceStats();
      return true;
    } catch {
      this.state.persistence.available = false;
      this._syncPersistenceStats();
      return false;
    }
  }

  _persistState() {
    this._persistenceDirty = true;
    return this.flushPersistence();
  }

  persistenceStats() {
    return deepFreeze({ ...clone(this._persistenceStats), dirty: this._persistenceDirty, debounceMs: PERSISTENCE_DEBOUNCE_MS, maxWaitMs: PERSISTENCE_MAX_WAIT_MS, payloadLimitBytes: MAX_PERSISTED_BYTES });
  }

  _restorePersistentState() {
    if (!this._storage) return false;
    try {
      const payload = JSON.parse(this._storage.getItem(this._persistenceKey) || "null");
      if (!payload || payload.schema !== PERSISTENCE_SCHEMA || payload.conceptId !== this.conceptId) return false;
      Object.assign(this.state, clone(payload.state || {}));
      for (const saved of payload.settings || []) {
        const setting = this.settings.get(saved.id);
        if (setting) Object.assign(setting, { value: clone(saved.value), status: saved.status, valueState: saved.status, stateLabel: STATUS_LABELS[saved.status] || titleCase(saved.status) });
      }
      for (const preference of payload.providerPreferences || []) {
        const provider = this.providers.find((entry) => entry.id === preference.providerId);
        if (!provider) continue;
        if (provider.accounts.some((entry) => entry.id === preference.activeAccountId)) provider.activeAccountId = preference.activeAccountId;
        for (const savedModel of preference.models || []) {
          const model = provider.models.find((entry) => entry.id === savedModel.id);
          if (model) Object.assign(model, clone(savedModel));
        }
      }
      for (const preference of payload.rolePreferences || []) {
        const role = this.roles.find((entry) => entry.id === preference.id);
        if (role) role.route = preference.route;
      }
      this.managerOperations = clone(payload.managerChanges || []);
      this.state.persistence = { available: true, restored: true, lastSavedAt: payload.savedAt || null, schema: PERSISTENCE_SCHEMA, stats: clone(this._persistenceStats) };
      this._refreshEffectiveMotion();
      this._applyPresentationToDocument();
      return true;
    } catch {
      this._storage.removeItem(this._persistenceKey);
      return false;
    }
  }

  resetPersistentDemo() {
    try { this._storage?.removeItem(this._persistenceKey); } catch { /* local concept only */ }
    const revision = this.state.revision;
    this._restoreBaseline();
    this.state = clone(this._initialState);
    this.state.revision = revision;
    this.state.lastEvent = null;
    this._persistenceDirty = false;
    this._clearPersistenceTimers();
    this.state.persistence = { available: Boolean(this._storage), restored: false, lastSavedAt: null, schema: PERSISTENCE_SCHEMA, stats: clone(this._persistenceStats) };
    this._applyScenarioOverlay(this.state.scenarioOverlay);
    this._refreshEffectiveMotion();
    this._syncPresentationSettings();
    this._applyPresentationToDocument();
    this.openHome();
    this.receipt("Demo state reset", "The deterministic concept state returned to its authored baseline.", "success");
    return true;
  }

  assignedManagers(conceptId = this.conceptId) {
    return [...(this.managerAssignments?.[conceptId] || [])];
  }

  windowedItems(key, items, options = {}) {
    const source = Array.isArray(items) ? items : [];
    const size = Math.max(1, Math.min(40, Number(options.size) || 24));
    const existing = this.state.listWindows[key] || { start: 0, size };
    let start = Math.max(0, Math.min(Number(options.start ?? existing.start) || 0, Math.max(0, source.length - size)));
    if (options.selectedId) {
      const selectedIndex = source.findIndex((entry) => entry?.id === options.selectedId);
      if (selectedIndex >= 0 && (selectedIndex < start || selectedIndex >= start + size)) {
        start = Math.max(0, Math.min(selectedIndex - Math.floor(size / 2), Math.max(0, source.length - size)));
      }
    }
    const end = Math.min(source.length, start + size);
    this.state.listWindows = { ...this.state.listWindows, [key]: { start, size, total: source.length } };
    return deepFreeze({ items: clone(source.slice(start, end)), total: source.length, start, end, mounted: end - start });
  }

  shiftListWindow(key, direction = 1) {
    const current = this.state.listWindows[key] || { start: 0, size: 24 };
    const delta = typeof direction === "string" ? (/prev|back|up/i.test(direction) ? -current.size : current.size) : Number(direction) * current.size;
    const start = Math.max(0, Math.min(current.start + delta, Math.max(0, Number(current.total || 0) - current.size)));
    this.state.listWindows = { ...this.state.listWindows, [key]: { ...current, start } };
    this.emit({ action: "list-window", scopes: ["view"], motionKey: "none" });
    return clone(this.state.listWindows[key]);
  }

  providerSetupSnapshot() {
    return clone(this.state.providerSetup);
  }

  managerInventory(managerId) {
    let inventory = this.genericManagers?.[managerId] || null;
    if (!inventory && this._managerCacheMeta.has(managerId)) {
      if (managerId === "providers") inventory = { id: "providers", title: "Providers, agents & models", state: "Ready", summary: `${this.providers.length} provider summaries`, items: this.providers };
      if (managerId === "memory") inventory = { id: "memory", title: "Assistant memory", state: "Ready", summary: `${this.memories.length} evidence-backed memories`, items: this.memories };
      if (managerId === "terminal") inventory = { id: "terminal", title: "Terminal profiles", state: "Ready", summary: `${this.terminals.length} terminal profiles`, items: this.terminals };
    }
    if (inventory) this._touchManagerCache(managerId);
    return inventory;
  }

  managerSummary(managerId) {
    return clone(this.managerSummaries[managerId] || null);
  }

  managerStateFixtures(managerId = null) {
    const managers = managerId ? [managerId] : Object.keys(MANAGER_STATE_FIXTURE_IDS);
    return deepFreeze(managers.flatMap((id) => (MANAGER_STATE_FIXTURE_IDS[id] || []).map((fixtureId) => {
      const state = fixtureId.split(".").at(-1);
      return { ...clone(DATA.buildManagerStateFixture?.(id, state) || { id: fixtureId, managerId: id, state }), simulated: true, deterministic: true };
    })));
  }

  async applyManagerStateFixture(stateOrFixtureId, managerId = this.state.managerId) {
    let stateId = String(stateOrFixtureId || "");
    if (stateId.startsWith("manager-state.")) {
      const parts = stateId.split(".");
      managerId = parts[1];
      stateId = parts[2];
    }
    const aliases = { "offline-cached": "offline", "managed-inherited": "managed_inherited", "requested-effective": "requested_effective" };
    stateId = aliases[stateId] || stateId;
    const fixture = DATA.buildManagerStateFixture?.(managerId, stateId);
    if (!managerId || !fixture || !(MANAGER_STATE_FIXTURE_IDS[managerId] || []).includes(fixture.id)) return false;
    if (stateId === "loading") {
      this.invalidateManagerLoad(managerId);
      this._evictManagerPayload(managerId);
      this._managerCacheMeta.delete(managerId);
      this.state.managerHydration = { ...this.state.managerHydration, [managerId]: { state: "loading", generation: this._managerGeneration.get(managerId) || 1, simulated: true, deterministic: true } };
      this.observableWorkFixture("waiting_resource");
    } else {
      const cleanPayload = await this._coldPayloadForManager(managerId);
      if (!cleanPayload) return false;
      this._commitManagerPayload(managerId, cleanPayload);
      const bytes = this._estimateBytes(cleanPayload);
      this._managerCacheMeta.set(managerId, { state: "ready", bytes, lastAccess: ++this._managerAccessSequence, generation: this._managerGeneration.get(managerId) || 1 });
      const inventory = this.managerInventory(managerId);
      if (inventory) {
        const items = inventory.items || [];
        if (stateId === "empty") {
          if (managerId === "providers") this.providers = [];
          else if (managerId === "memory") this.memories = [];
          else if (managerId === "terminal") this.terminals = [];
          else inventory.items = [];
        }
        if (stateId === "error") Object.assign(inventory, { state: "Error", fixtureMessage: "Deterministic manager-load failure" });
        if (stateId === "offline") Object.assign(inventory, { state: "Offline", fixtureMessage: "Cached values remain visible while the deterministic network fixture is offline", retainedCachedValues: true });
        if (stateId === "unavailable") Object.assign(inventory, { state: "Unavailable", fixtureMessage: "Required capability is unavailable in this deterministic fixture" });
        if (stateId === "managed_inherited" && items[0]) Object.assign(items[0], { status: "Managed", state: "managed", requested: "Inherited", effective: "Organization managed" });
        if (stateId === "requested_effective" && items[0]) Object.assign(items[0], { status: "Effective value differs", state: "effective-difference", requested: "Requested fixture value", effective: "Governor-supplied effective fixture value" });
        if (stateId === "degraded") Object.assign(inventory, { state: "Degraded", fixtureMessage: "Cached values remain available with a named deterministic limitation", retainedCachedValues: true });
      }
      this.state.managerStates = { ...this.state.managerStates, [managerId]: stateId };
      this.state.managerHydration = { ...this.state.managerHydration, [managerId]: { state: stateId, generation: this._managerGeneration.get(managerId) || 1, retainedCachedValues: ["offline", "error", "degraded"].includes(stateId), simulated: true, deterministic: true } };
      if (stateId === "offline") this.observableWorkFixture("waiting_network");
      if (stateId === "error") this.observableWorkFixture("stalled");
      if (stateId === "unavailable") this.observableWorkFixture("cancelled");
      if (stateId === "degraded") this.observableWorkFixture("degraded");
    }
    this.state.activeFixture = fixture.id;
    this.emit({ action: "fixture", scopes: ["view", "manager", "data"], motionKey: "none", announcement: `${this.managerSummaries[managerId]?.title || managerId}: ${stateId} deterministic fixture.` });
    return deepFreeze({ ...clone(fixture), simulated: true, deterministic: true });
  }

  _estimateBytes(value) {
    try { return typeof TextEncoder === "function" ? new TextEncoder().encode(JSON.stringify(value)).byteLength : JSON.stringify(value).length; }
    catch { return Number.MAX_SAFE_INTEGER; }
  }

  async _ensureDetailModule() {
    if (this._detailModule) return this._detailModule;
    if (this._detailModulePromise) return this._detailModulePromise;
    this.state.workspaceHydration = { state: "loading", detailModuleLoaded: false, requestedAt: nowISO() };
    const operation = this.observableWork.create({
      operation_id: "settings-detail-module",
      owner_domain: "settings-manager-projection",
      scope_refs: ["settings:detail-fixtures"],
      object_refs: ["settings:detail-module"],
      title: "Load selected Settings details",
      human_phase: "Loading only the selected Settings destination",
      state: "running",
      progress_kind: "indeterminate",
      progress_source: "unknown",
      can_cancel: false,
      can_background: false,
      can_retry: true,
      blocking_scope: "selected Settings destination",
      generation: 1
    });
    this.state.observableWork = this.observableWork.list();
    const job = import("./data-details.mjs").then((details) => {
      DATA.installDetailedData?.(details);
      this._detailModule = details;
      this._coldDomainTemplates = {
        providers: details.PROVIDERS,
        roles: details.ROLE_ASSIGNMENTS,
        memory: details.MEMORY_GISTS,
        terminal: details.TERMINAL_PROFILES
      };
      this._coldManagerTemplates = details.MANAGER_INVENTORIES || {};
      this.managerAssignments = clone(details.CONCEPT_MANAGER_ASSIGNMENTS || this.managerAssignments);
      this.flowTemplates = clone(details.FLOW_TEMPLATES || {});
      this.fixtureTriggers = clone(details.DETERMINISTIC_TRIGGERS || []);
      this.managerCoverageLabels = clone(details.MANAGER_COVERAGE_LABELS || {});
      this.settings = new Map(details.allSettings().map((entry) => [entry.id, normalizeSetting(entry)]));
      for (const manager of details.MANAGERS || []) {
        const cold = this._coldManagerTemplates[manager.id] || {};
        this.managerSummaries[manager.id] = {
          id: manager.id,
          title: cold.title || manager.title,
          purpose: manager.purpose,
          state: cold.state || "Not loaded",
          summary: cold.summary || manager.purpose,
          itemCount: Array.isArray(cold.items) ? cold.items.length : null
        };
      }
      this._restoreDetailedPersistentPreferences();
      this._applyScenarioOverlay(this.state.scenarioOverlay);
      const detailModuleLoads = Number(globalThis.__pmSettingsDetailModuleLoads || 0) - this._detailModuleLoadsAtConstruction;
      this.state.workspaceHydration = { state: "ready", detailModuleLoaded: true, loadedAt: nowISO() };
      this.state.performance.startup = { ...this.state.performance.startup, detailModuleLoaded: true, detailModuleLoads };
      this.observableWork.update(operation.operation_id, { state: "completed", human_phase: "Selected Settings details ready", can_retry: false, result_refs: ["settings:detail-module:generation-1"] }, 1);
      this.state.observableWork = this.observableWork.list();
      return details;
    }).catch((error) => {
      this._detailModulePromise = null;
      this.state.workspaceHydration = { state: "failed", detailModuleLoaded: false, reason: String(error?.message || error) };
      this.observableWork.update(operation.operation_id, { state: "failed", human_phase: "Selected Settings details could not load", can_retry: true, result_refs: [] }, 1);
      this.state.observableWork = this.observableWork.list();
      throw error;
    });
    this._detailModulePromise = job;
    this._pending.add(job);
    void job.then(() => this._pending.delete(job), () => this._pending.delete(job));
    return job;
  }

  _restoreDetailedPersistentPreferences() {
    if (!this._storage) return false;
    try {
      const payload = JSON.parse(this._storage.getItem(this._persistenceKey) || "null");
      if (!payload || payload.schema !== PERSISTENCE_SCHEMA || payload.conceptId !== this.conceptId) return false;
      for (const saved of payload.settings || []) {
        const setting = this.settings.get(saved.id);
        if (setting) Object.assign(setting, { value: clone(saved.value), status: saved.status, valueState: saved.status, stateLabel: STATUS_LABELS[saved.status] || titleCase(saved.status) });
      }
      for (const preference of payload.providerPreferences || []) {
        const provider = this.providers.find((entry) => entry.id === preference.providerId);
        if (!provider) continue;
        if (provider.accounts?.some((entry) => entry.id === preference.activeAccountId)) provider.activeAccountId = preference.activeAccountId;
        for (const savedModel of preference.models || []) {
          const model = provider.models?.find((entry) => entry.id === savedModel.id);
          if (model) Object.assign(model, clone(savedModel));
        }
      }
      for (const preference of payload.rolePreferences || []) {
        const role = this.roles.find((entry) => entry.id === preference.id);
        if (role) role.route = preference.route;
      }
      return true;
    } catch { return false; }
  }

  async _coldPayloadForManager(managerId) {
    await this._ensureDetailModule();
    if (managerId === "providers") return {
      providers: this._coldDomainTemplates.providers.map(normalizeProvider),
      roles: normalizeRoles(this._coldDomainTemplates.roles)
    };
    if (managerId === "memory") return { memories: this._coldDomainTemplates.memory.map(normalizeMemory) };
    if (managerId === "terminal") return { terminals: this._coldDomainTemplates.terminal.map(normalizeTerminal) };
    return this._coldManagerTemplates[managerId] ? { inventory: clone(this._coldManagerTemplates[managerId]) } : null;
  }

  _commitManagerPayload(managerId, payload) {
    if (payload.inventory) this.genericManagers[managerId] = payload.inventory;
    if (payload.providers) {
      this.providers = payload.providers;
      this.roles = payload.roles;
      this._restoreDetailedPersistentPreferences();
      const provider = this.providers.find((entry) => entry.id === this.state.selectedProviderId) || this.providers[0] || null;
      const pending = this._pendingManagerSelection.get("providers") || {};
      this.state.selectedProviderId = provider?.id || null;
      this.state.selectedAccountId = provider?.accounts?.find((entry) => entry.id === pending.childResourceId)?.id || provider?.activeAccountId || provider?.accounts?.[0]?.id || null;
      this.state.selectedInstallationId = provider?.installations?.find((entry) => entry.id === pending.childResourceId)?.id || provider?.installations?.find((entry) => entry.selected)?.id || provider?.installations?.[0]?.id || null;
    }
    if (payload.memories) {
      this.memories = payload.memories;
      const pendingId = this._pendingManagerSelection.get("memory")?.resourceId;
      this.state.selectedMemoryId = this.memories.some((entry) => entry.id === pendingId) ? pendingId : this.memories.some((entry) => entry.id === this.state.selectedMemoryId) ? this.state.selectedMemoryId : this.memories[0]?.id || null;
    }
    if (payload.terminals) {
      this.terminals = payload.terminals;
      const pendingId = this._pendingManagerSelection.get("terminal")?.resourceId;
      this.state.selectedTerminalId = this.terminals.some((entry) => entry.id === pendingId) ? pendingId : this.terminals.some((entry) => entry.id === this.state.selectedTerminalId) ? this.state.selectedTerminalId : this.terminals[0]?.id || null;
    }
  }

  _evictManagerPayload(managerId) {
    delete this.genericManagers[managerId];
    if (managerId === "providers") {
      this.providers = this._coldDomainTemplates.providers.map((provider) => ({ id: provider.id, name: provider.name, group: provider.group, state: provider.state, stateLabel: provider.stateLabel, summary: provider.summary, activeAccountId: null, inFlightAccountId: null, accounts: [], connections: [], products: [], models: [], installations: [], runtimeAdapters: [], catalogue: { version: provider.catalogue?.version || provider.catalogue?.sourceVersion || "Cached summary", lastKnownGood: [], quarantine: [], removalHistory: [] }, compactSummary: true }));
      this.roles = [];
      this.state.selectedAccountId = null;
      this.state.selectedInstallationId = null;
    }
    if (managerId === "memory") {
      this.memories = [];
      this.state.selectedMemoryId = null;
    }
    if (managerId === "terminal") {
      this.terminals = [];
      this.state.selectedTerminalId = null;
    }
  }

  _touchManagerCache(managerId) {
    const meta = this._managerCacheMeta.get(managerId);
    if (!meta) return;
    meta.lastAccess = ++this._managerAccessSequence;
  }

  _managerCacheStats() {
    const active = this.state?.managerId;
    const entries = [...this._managerCacheMeta.entries()];
    return {
      budgetBytes: this._managerCacheBudgetBytes,
      currentBytes: entries.reduce((sum, [, meta]) => sum + meta.bytes, 0),
      inactiveReadyCount: entries.filter(([id, meta]) => id !== active && meta.state === "ready").length,
      evictions: this.state?.performance?.cache?.evictions || 0
    };
  }

  _syncManagerTelemetry() {
    const cache = this._managerCacheStats();
    this.state.performance.cache = cache;
    this.state.performance.startup.liveProjectionLoadedManagerCount = this._managerCacheMeta.size;
    this.state.performance.startup.liveProjectionLoadedBytes = cache.currentBytes;
  }

  _evictManagerCache() {
    const active = this.state.managerId;
    const candidates = () => [...this._managerCacheMeta.entries()]
      .filter(([id, meta]) => id !== active && meta.state === "ready")
      .sort((a, b) => a[1].lastAccess - b[1].lastAccess);
    let cache = this._managerCacheStats();
    while ((cache.inactiveReadyCount > this._inactiveManagerLimit || cache.currentBytes > this._managerCacheBudgetBytes) && candidates().length) {
      const [managerId] = candidates()[0];
      this._evictManagerPayload(managerId);
      this._managerCacheMeta.delete(managerId);
      this.state.managerHydration = { ...this.state.managerHydration, [managerId]: { state: "evicted", evictedAt: nowISO() } };
      this.state.performance.cache.evictions += 1;
      cache = this._managerCacheStats();
    }
    this._syncManagerTelemetry();
  }

  _setActiveManagerSubscription(managerId) {
    if (this._activeManagerSubscription?.key === `manager:${managerId}`) return true;
    this._activeManagerSubscription?.release?.();
    this._activeManagerSubscription = null;
    if (!managerId) return true;
    const acquired = this.subscriptions.acquire(`manager:${managerId}`, { heavy: true, owner: "visible-settings-manager" });
    if (!acquired) return false;
    this._activeManagerSubscription = acquired;
    return true;
  }

  async loadManagerInventory(managerId, options = {}) {
    const isDomain = ["providers", "memory", "terminal"].includes(managerId);
    if (!isDomain && !DATA.MANAGERS?.some((entry) => entry.id === managerId)) return null;
    if (this._managerCacheMeta.has(managerId)) {
      this._touchManagerCache(managerId);
      return clone(this.genericManagers[managerId] || { domain: managerId });
    }
    if (this._managerLoadJobs.has(managerId)) return this._managerLoadJobs.get(managerId);
    const generation = (this._managerGeneration.get(managerId) || 0) + 1;
    this._managerGeneration.set(managerId, generation);
    this.state.managerHydration = { ...this.state.managerHydration, [managerId]: { state: "queued", generation, requestedAt: nowISO() } };
    const operation = this.observableWork.create({
      owner_domain: "settings-manager-projection",
      scope_refs: [`settings-manager:${managerId}`],
      object_refs: [`manager:${managerId}`],
      title: `Open ${this.managerSummaries[managerId]?.title || managerId}`,
      human_phase: "Waiting to load the selected manager",
      state: "queued",
      progress_kind: "indeterminate",
      progress_source: "unknown",
      queue_reason: "Selected manager inventory loads on demand",
      can_cancel: true,
      can_background: false,
      blocking_scope: "selected manager",
      generation
    });
    this.state.observableWork = this.observableWork.list();
    const job = (async () => {
      await Promise.resolve();
      if (options.deferFrame !== false) await waitFrame();
      if (this._managerGeneration.get(managerId) !== generation || !options.allowInactive && this.state.managerId !== managerId) {
        this.observableWork.update(operation.operation_id, { state: "cancelled", human_phase: "Superseded by a newer manager route", can_retry: true }, generation);
        return null;
      }
      this.state.managerHydration = { ...this.state.managerHydration, [managerId]: { state: "loading", generation, startedAt: nowISO(), operationId: operation.operation_id } };
      this.observableWork.update(operation.operation_id, { state: "running", human_phase: "Cloning the selected cold template" }, generation);
      const payload = await this._coldPayloadForManager(managerId);
      if (!payload) {
        this.observableWork.update(operation.operation_id, { state: "failed", human_phase: "No detailed fixture exists for this manager", can_retry: false }, generation);
        this.state.managerHydration = { ...this.state.managerHydration, [managerId]: { state: "failed", generation, reason: "missing_detail_fixture" } };
        return null;
      }
      const bytes = this._estimateBytes(payload);
      if (bytes > this._managerCacheBudgetBytes) {
        this.observableWork.update(operation.operation_id, { state: "failed", human_phase: "Selected manager exceeds the concept cache budget", can_retry: true }, generation);
        this.state.managerHydration = { ...this.state.managerHydration, [managerId]: { state: "failed", generation, reason: "cache_budget" } };
        return null;
      }
      if (this._managerGeneration.get(managerId) !== generation || !options.allowInactive && this.state.managerId !== managerId) return null;
      this._commitManagerPayload(managerId, payload);
      this._applyScenarioOverlay(this.state.scenarioOverlay);
      this._managerCacheMeta.set(managerId, { state: "ready", bytes, lastAccess: ++this._managerAccessSequence, generation });
      this.state.managerHydration = { ...this.state.managerHydration, [managerId]: { state: "hydrated", generation, hydratedAt: nowISO(), bytes, operationId: operation.operation_id } };
      this.observableWork.update(operation.operation_id, { state: "completed", human_phase: "Selected manager ready", can_cancel: false, result_refs: [`manager-cache:${managerId}:${generation}`] }, generation);
      this.state.observableWork = this.observableWork.list();
      this._evictManagerCache();
      this.emit({ action: "manager-load", scopes: ["manager", "data", "view"], motionKey: "none", announcement: `${this.managerSummaries[managerId]?.title || managerId} is ready.` });
      return clone(payload.inventory || { domain: managerId });
    })();
    this._managerLoadJobs.set(managerId, job);
    this._pending.add(job);
    try { return await job; }
    finally {
      this._pending.delete(job);
      this._managerLoadJobs.delete(managerId);
      this.state.observableWork = this.observableWork.list();
    }
  }

  invalidateManagerLoad(managerId) {
    this._managerGeneration.set(managerId, (this._managerGeneration.get(managerId) || 0) + 1);
  }

  managerResource(managerId, resourceId) {
    return this.managerInventory(managerId)?.items?.find((entry) => entry.id === resourceId) || null;
  }

  selectManagerResource(managerId, resourceId) {
    if (!this.managerResource(managerId, resourceId)) return false;
    this.state.selectedManagerResource = { ...this.state.selectedManagerResource, [managerId]: resourceId };
    const focusRequest = this._newFocus("resource", resourceId, { selector: `[data-manager-resource^="${managerId}:${resourceId}"]`, preventScroll: true });
    this.emit({ action: "manager-resource", scopes: ["manager", "detail", "focus"], focusRequest, motionKey: `${this.conceptId}:manager-resource` });
    return true;
  }

  updateManagerResource(managerId, resourceId, changes = {}) {
    const resource = this.managerResource(managerId, resourceId);
    if (!resource) return false;
    Object.assign(resource, clone(changes));
    this.managerOperations = [...this.managerOperations, { id: `manager-op-${++this._operationSequence}`, managerId, resourceId, changes: clone(changes), at: nowISO(), simulation: true }].slice(-100);
    this.receipt("Manager fixture updated", `${resource.title} recorded a deterministic local state change.`, "success");
    this.emit({ action: "manager-resource", scopes: ["manager", "detail", "receipts"], motionKey: `${this.conceptId}:manager-resource-update` });
    return true;
  }

  _flowKind(managerId, resourceId, action = "") {
    const text = `${managerId} ${resourceId || ""} ${action}`.toLowerCase();
    if (/provider/.test(text) && /install/.test(text)) return "provider-install";
    if (/provider/.test(text) && /update/.test(text)) return "provider-update";
    if (/sound|pack/.test(text)) return "sound-pack";
    if (/settings-import|import settings/.test(text)) return "settings-import";
    if (/settings-copy|copy settings/.test(text)) return "settings-copy";
    if (/settings-reset|reset settings/.test(text)) return "settings-reset";
    if (/backup|restore/.test(text)) return "backup-restore";
    if (/cleanup/.test(text)) return "cleanup";
    if (/test|debug/.test(text)) return "test";
    if (/theme|appearance/.test(text)) return "theme";
    return "generic";
  }

  startFlow(kind = "generic", options = {}) {
    const template = this.flowTemplates[kind] || this.flowTemplates.generic;
    if (!template) return false;
    const managerId = options.managerId || this.state.managerId;
    const resourceId = options.resourceId || null;
    const operation = this.observableWork.create({
      operation_id: `flow-${++this._operationSequence}`,
      owner_domain: kind.startsWith("provider-") ? "provider-lifecycle-projection" : "settings-concept-transaction",
      scope_refs: [`settings-manager:${managerId || "unknown"}`],
      object_refs: [resourceId && `resource:${resourceId}`, options.providerId && `provider:${options.providerId}`, options.installationId && `installation:${options.installationId}`].filter(Boolean),
      title: template.label,
      human_phase: template.stages?.[Number(options.stageIndex || 0)] || "Accepted",
      state: options.status === "queued" ? "queued" : "accepted",
      progress_kind: "indeterminate",
      progress_source: "unknown",
      queue_reason: options.queueReason || null,
      wait_reason: options.waitReason || null,
      can_cancel: true,
      can_background: true,
      can_retry: false,
      blocking_scope: managerId ? "selected manager" : "operation",
      generation: 1
    });
    this.state.activeFlow = {
      ...operation,
      id: operation.operation_id,
      kind,
      label: template.label,
      managerId,
      resourceId,
      providerId: options.providerId || null,
      installationId: options.installationId || null,
      stages: clone(template.stages),
      stageIndex: Number(options.stageIndex || 0),
      status: options.status || "active",
      choiceStage: template.choiceStage ?? null,
      choices: clone(template.choices || []),
      choice: options.choice || null,
      rollbackAvailable: Boolean(options.rollbackAvailable),
      failureReason: options.failureReason || null,
      startedAt: nowISO(),
      simulation: true
    };
    this.state.observableWork = this.observableWork.list();
    this.emit({ action: "manager-flow", scopes: ["manager", "flow", "focus"], motionKey: `${this.conceptId}:flow-start` });
    return clone(this.state.activeFlow);
  }

  chooseFlow(choice) {
    const flow = this.state.activeFlow;
    if (!flow || !flow.choices.includes(choice)) return false;
    flow.choice = choice;
    this.observableWork.update(flow.operation_id, { state: "accepted", human_phase: flow.stages[flow.stageIndex] || flow.human_phase, wait_reason: null }, flow.generation);
    Object.assign(flow, this.observableWork.get(flow.operation_id));
    this.state.observableWork = this.observableWork.list();
    this.emit({ action: "manager-flow", scopes: ["manager", "flow"], motionKey: `${this.conceptId}:flow-choice` });
    return true;
  }

  advanceFlow(options = {}) {
    const flow = this.state.activeFlow;
    if (!flow || !["active", "choice-required"].includes(flow.status)) return false;
    if (flow.choiceStage === flow.stageIndex && !flow.choice) {
      flow.status = "choice-required";
      this.observableWork.update(flow.operation_id, { state: "waiting_user", human_phase: flow.stages[flow.stageIndex] || "Waiting for a choice", wait_reason: "A user choice is required before this deterministic transaction can continue" }, flow.generation);
      Object.assign(flow, this.observableWork.get(flow.operation_id));
      this.state.observableWork = this.observableWork.list();
      this.receipt("Choice required", "Choose Merge or Replace before the settings import can continue.", "warning");
      this.emit({ action: "manager-flow", scopes: ["manager", "flow", "receipts"], motionKey: `${this.conceptId}:flow-gate` });
      return false;
    }
    const outcome = typeof options === "string" ? options : options.outcome;
    if (outcome === "fail") {
      flow.status = "failed";
      flow.failureReason = typeof options === "object" ? options.reason || "Deterministic verification fixture failed." : "Deterministic verification fixture failed.";
      flow.rollbackAvailable = true;
      this.observableWork.update(flow.operation_id, { state: "failed", human_phase: "Verification failed", can_retry: true, receipt_refs: [`receipt:verification-failed:${flow.operation_id}`] }, flow.generation);
      Object.assign(flow, this.observableWork.get(flow.operation_id));
      this.state.observableWork = this.observableWork.list();
      this.receipt("Verification failed", `${flow.label} stopped before activation. Rollback is available.`, "warning", { persistent: true });
      this.emit({ action: "manager-flow", scopes: ["manager", "flow", "receipts"], motionKey: `${this.conceptId}:flow-failed` });
      return clone(flow);
    }
    flow.status = "active";
    if (flow.stageIndex < flow.stages.length - 1) {
      flow.stageIndex += 1;
      this.observableWork.update(flow.operation_id, { state: flow.stageIndex === flow.stages.length - 1 ? "verifying" : "running", human_phase: flow.stages[flow.stageIndex], wait_reason: null, queue_reason: null }, flow.generation);
      Object.assign(flow, this.observableWork.get(flow.operation_id));
    }
    else {
      flow.status = "complete";
      this.observableWork.update(flow.operation_id, { state: "completed", human_phase: "Verified", can_cancel: false, can_background: false, result_refs: [`concept-result:${flow.operation_id}`], receipt_refs: [`receipt:complete:${flow.operation_id}`] }, flow.generation);
      Object.assign(flow, this.observableWork.get(flow.operation_id));
      this.state.flowHistory = [...this.state.flowHistory, clone(flow)].slice(-25);
      this.receipt("Operation verified", `${flow.label} completed as a deterministic concept transaction.`, "success", { persistent: true });
    }
    this.state.observableWork = this.observableWork.list();
    this.emit({ action: "manager-flow", scopes: ["manager", "flow", "receipts"], motionKey: `${this.conceptId}:flow-advance` });
    return clone(flow);
  }

  rollbackFlow() {
    const flow = this.state.activeFlow;
    if (!flow || !flow.rollbackAvailable) return false;
    flow.status = "rolled-back";
    flow.rollbackAvailable = false;
    flow.rolledBackAt = nowISO();
    this.observableWork.update(flow.operation_id, { state: "completed", human_phase: "Prior deterministic state restored", can_cancel: false, can_background: false, result_refs: [`rollback-result:${flow.operation_id}`], receipt_refs: [`receipt:rollback:${flow.operation_id}`] }, flow.generation);
    Object.assign(flow, this.observableWork.get(flow.operation_id));
    this.state.observableWork = this.observableWork.list();
    this.state.flowHistory = [...this.state.flowHistory, clone(flow)].slice(-25);
    this.receipt("Rollback complete", `${flow.label} restored its prior deterministic state.`, "success", { persistent: true });
    this.emit({ action: "manager-flow", scopes: ["manager", "flow", "receipts"], motionKey: `${this.conceptId}:flow-rollback` });
    return clone(flow);
  }

  closeFlow() {
    if (!this.state.activeFlow) return false;
    this.state.activeFlow = null;
    this.emit({ action: "manager-flow", scopes: ["manager", "flow"], motionKey: `${this.conceptId}:flow-close` });
    return true;
  }

  runManagerAction(managerId, resourceId, action) {
    const resource = resourceId ? this.managerResource(managerId, resourceId) : null;
    const kind = this._flowKind(managerId, resourceId, action);
    if (/preview locally/i.test(action || "")) return this.previewSound(resourceId);
    if (/start|import|restore|reset|cleanup|test|update|install/i.test(action || "")) return this.startFlow(kind, { managerId, resourceId });
    this.receipt("Local manager action recorded", `${resource?.title || managerId} recorded ${action || "an inspect action"}; no external side effect occurred.`, "managed", { simulation: true });
    this.emit({ action: "manager-resource", scopes: ["manager", "receipts"], motionKey: `${this.conceptId}:manager-action` });
    return true;
  }

  previewSound(resourceId) {
    const resource = this.managerResource("notifications-sounds", resourceId);
    if (!resource) return false;
    this.state.soundPreview = { resourceId, state: "playing", localOnly: true, startedAt: nowISO() };
    this.emit({ action: "manager-resource", scopes: ["manager", "preview"], motionKey: `${this.conceptId}:sound-preview` });
    return clone(this.state.soundPreview);
  }

  stopSoundPreview() {
    if (!this.state.soundPreview || this.state.soundPreview.state !== "playing") return false;
    this.state.soundPreview = { ...this.state.soundPreview, state: "stopped" };
    this.emit({ action: "manager-resource", scopes: ["manager", "preview"], motionKey: `${this.conceptId}:sound-stop` });
    return true;
  }

  previewTheme(theme) {
    if (!THEME_BY_ID.has(theme)) return false;
    if (!this.state.themeBeforePreview) this.state.themeBeforePreview = this.state.theme;
    this.state.previewTheme = theme;
    this.state.theme = theme;
    this.state.presentation.theme = theme;
    this._applyPresentationToDocument();
    this.emit({ action: "theme-preview", scopes: ["presentation", "manager", "preview"], motionKey: `${this.conceptId}:theme-preview` });
    return true;
  }

  applyThemePreview() {
    if (!this.state.previewTheme) return false;
    const applied = this.state.previewTheme;
    this.state.previewTheme = null;
    this.state.themeBeforePreview = null;
    this.receipt("Theme applied", `${applied} is now the saved deterministic theme for this concept.`, "success");
    this.emit({ action: "theme-preview", scopes: ["presentation", "manager", "receipts"], motionKey: `${this.conceptId}:theme-apply` });
    return true;
  }

  revertThemePreview() {
    if (!this.state.themeBeforePreview) return false;
    this.state.theme = this.state.themeBeforePreview;
    this.state.presentation.theme = this.state.themeBeforePreview;
    this.state.previewTheme = null;
    this.state.themeBeforePreview = null;
    this._applyPresentationToDocument();
    this.emit({ action: "theme-preview", scopes: ["presentation", "manager"], motionKey: `${this.conceptId}:theme-revert` });
    return true;
  }

  validateCustomTheme(draft = this.state.customThemeDraft) {
    this.state.customThemeDraft = String(draft || "");
    const errors = [];
    if (/unsupported_|left_border|emoji/i.test(this.state.customThemeDraft)) errors.push("Unsupported or prohibited token");
    if (!/accent\s*=|surface\s*=|text\s*=/i.test(this.state.customThemeDraft)) errors.push("At least one semantic theme token is required");
    this.state.customThemeStatus = errors.length ? { state: "invalid", errors, fallback: "friendly-dark" } : { state: "valid", errors: [], fallback: null };
    this.emit({ action: "theme-preview", scopes: ["manager", "preview"], motionKey: `${this.conceptId}:theme-validate` });
    return clone(this.state.customThemeStatus);
  }

  markExternalChange(managerId, resourceId, effectiveValue = "Changed on another client") {
    this.state.externalChange = { managerId, resourceId, effectiveValue, detectedAt: nowISO(), status: "unresolved" };
    this.emit({ action: "manager-resource", scopes: ["manager", "detail"], motionKey: `${this.conceptId}:external-change` });
    return clone(this.state.externalChange);
  }

  reconcileExternalChange(choice = "review") {
    if (!this.state.externalChange) return false;
    this.state.externalChange.status = choice === "accept" ? "accepted" : choice === "keep" ? "kept-local" : "reviewed";
    this.receipt("External change reconciled", `The changed-elsewhere fixture was ${this.state.externalChange.status}.`, "success");
    this.emit({ action: "manager-resource", scopes: ["manager", "detail", "receipts"], motionKey: `${this.conceptId}:external-reconcile` });
    return true;
  }

  selectProviderInstallation(providerId, installationId) {
    const provider = this.providers.find((entry) => entry.id === providerId);
    const installation = provider?.installations?.find((entry) => entry.id === installationId);
    if (!provider || !installation) return false;
    this.state.selectedProviderId = providerId;
    this.state.selectedInstallationId = installationId;
    this.emit({ action: "provider-installation", scopes: ["provider", "manager", "focus"], motionKey: `${this.conceptId}:installation-select` });
    return true;
  }

  selectExistingProviderInstallation(installationId, providerId = this.state.selectedProviderId) {
    const provider = this.providers.find((entry) => entry.id === providerId);
    const installation = provider?.installations?.find((entry) => entry.id === installationId);
    if (!provider || !installation || installation.state === "not-installed" || installation.ownership?.confidence === "unknown") return false;
    provider.installations.forEach((entry) => { entry.selected = entry.id === installation.id; });
    provider.bindingRevision = Number(provider.bindingRevision || 0) + 1;
    this.state.selectedProviderId = provider.id;
    this.state.selectedInstallationId = installation.id;
    this.receipt("Existing installation selected", `${provider.name} will use ${installation.display?.name || installation.name} on ${installation.host?.displayName || "the selected host"} in ${installation.environment?.displayName || "the selected environment"}. No software was acquired and authentication remains separate.`, "success", { persistent: true });
    this.emit({ action: "provider-installation", scopes: ["provider", "manager", "receipts"], motionKey: `${this.conceptId}:installation-binding` });
    return clone({ outcome: "selected_existing", installationId: installation.id, bindingRevision: provider.bindingRevision, authentication: installation.authentication?.status || "separate" });
  }

  runProviderInstallationAction(providerId, installationId, installationAction) {
    if (!this.selectProviderInstallation(providerId, installationId)) return false;
    const action = String(installationAction || "Inspect installation");
    if (/sign.?in|authenticate|login/i.test(action)) return this.authenticateProvider(providerId);
    if (/select|use this/i.test(action)) return this.selectExistingProviderInstallation(installationId, providerId);
    if (/review official|source|inspect|evidence|verify selected/i.test(action)) {
      this.receipt("Installation evidence opened", `${action} is an inspect-only action. It did not install, update, authenticate, or change the selected binding.`, "managed", { simulation: true });
      this.emit({ action: "provider-installation", scopes: ["provider", "manager", "receipts"], motionKey: "none" });
      return true;
    }
    if (/rollback/i.test(action)) return this.startFlow("provider-update", { managerId: "providers", providerId, installationId, status: "active", rollbackAvailable: true });
    if (/repair|update/i.test(action)) return this.startFlow("provider-update", { managerId: "providers", providerId, installationId });
    if (/install/i.test(action)) return this.confirmFirstProviderInstall(providerId, installationId);
    this.receipt("Installation action inspected", `${action} produced no mutation because it has no typed lifecycle route.`, "managed", { simulation: true });
    return true;
  }

  requireProviderSetup(providerId, options = {}) {
    const provider = this.provider(providerId);
    if (!provider) return false;
    const setup = this.providerSetup.setupRequired({
      provider_ref: provider.id,
      provider_label: provider.name,
      host_ref: options.hostRef || "this-host",
      host_label: options.hostLabel || "This host",
      environment_ref: options.environmentRef || "native",
      environment_label: options.environmentLabel || "Native environment",
      official_source: options.officialSource || `Official ${provider.name} source`,
      originating_operation_ref: options.originatingOperationRef,
      originating_operation_label: options.originatingOperationLabel,
      compatible_existing: provider.installations?.find((entry) => entry.state !== "not-installed" && entry.ownership?.confidence !== "unknown") ? {
        installation_ref: provider.installations.find((entry) => entry.state !== "not-installed" && entry.ownership?.confidence !== "unknown").id,
        display_name: provider.installations.find((entry) => entry.state !== "not-installed" && entry.ownership?.confidence !== "unknown").display?.name || "Compatible existing installation"
      } : null,
      continuation_token: options.continuationToken,
      continuation_revision: options.continuationRevision,
      maintenance_policy: options.maintenancePolicy || "ask_first"
    });
    this.state.providerSetup = setup;
    this.emit({ action: "provider-installation", scopes: ["provider", "manager", "flow"], motionKey: "none", announcement: `${provider.name} Setup Required for ${setup.target}.` });
    return clone(setup);
  }

  providerSetupFromDemand(providerId, options = {}) {
    const provider = this.provider(providerId);
    if (!provider) return false;
    const setup = this.providerSetup.fromDemand({
      provider_ref: provider.id,
      provider_label: provider.name,
      host_ref: options.hostRef || "this-host",
      host_label: options.hostLabel || "This host",
      environment_ref: options.environmentRef || "native",
      environment_label: options.environmentLabel || "Native environment",
      official_source: options.officialSource || `Official ${provider.name} source`,
      originating_operation_ref: options.originatingOperationRef,
      originating_operation_label: options.originatingOperationLabel,
      compatible_existing: provider.installations?.find((entry) => entry.state !== "not-installed" && entry.ownership?.confidence !== "unknown") ? {
        installation_ref: provider.installations.find((entry) => entry.state !== "not-installed" && entry.ownership?.confidence !== "unknown").id,
        display_name: provider.installations.find((entry) => entry.state !== "not-installed" && entry.ownership?.confidence !== "unknown").display?.name || "Compatible existing installation"
      } : null,
      continuation_token: options.continuationToken,
      continuation_revision: options.continuationRevision
    });
    this.state.providerSetup = setup;
    this.emit({ action: "provider-installation", scopes: ["provider", "manager", "flow"], motionKey: "none", announcement: `${provider.name} Setup Required. Initial acquisition did not start.` });
    return clone(setup);
  }

  advanceProviderSetup(action, options = {}) {
    const current = this.state.providerSetup;
    if (!current) return false;
    let next = false;
    if (action === "review-source") next = this.providerSetup.reviewOfficialSource(current.session_ref, options.expectedRevision ?? current.revision);
    if (action === "consent") next = this.providerSetup.consent(current.session_ref, options.expectedRevision ?? current.revision);
    if (action === "install") next = this.providerSetup.startInstall(current.session_ref, options.expectedRevision ?? current.revision);
    if (action === "install-complete") next = this.providerSetup.finishInstall(current.session_ref, options.expectedRevision ?? current.revision, options);
    if (action === "authenticate") next = this.providerSetup.startAuthentication(current.session_ref, options.expectedRevision ?? current.revision);
    if (action === "authentication-complete") next = this.providerSetup.finishAuthentication(current.session_ref, options.expectedRevision ?? current.revision, options);
    if (action === "maintenance-policy") next = this.providerSetup.setMaintenancePolicy(current.session_ref, options.expectedRevision ?? current.revision, options.policy);
    if (action === "resume") next = this.providerSetup.resume(current.session_ref, options.continuationToken || current.continuation_token, options.continuationRevision ?? current.continuation_revision);
    if (!next) return false;
    this.state.providerSetup = next.setup || next;
    this.state.observableWork = this.observableWork.list();
    this.emit({ action: "provider-installation", scopes: ["provider", "manager", "flow"], motionKey: "none" });
    return clone(next);
  }

  reviewProviderSource(providerId = this.state.selectedProviderId) {
    if (!this.state.providerSetup || ![providerId, this.provider(providerId)?.name].includes(this.state.providerSetup.provider_ref || this.state.providerSetup.provider)) {
      this.requireProviderSetup(providerId);
    }
    const reviewed = this.advanceProviderSetup("review-source");
    if (reviewed) this.receipt("Official source reviewed", `${this.provider(providerId)?.name || "Provider"} remains uninstalled until a separate explicit first-install confirmation.`, "managed", { persistent: true });
    return reviewed;
  }

  confirmFirstProviderInstall(providerId = this.state.selectedProviderId, installationId = null) {
    if (!this.state.providerSetup || ![providerId, this.provider(providerId)?.name].includes(this.state.providerSetup.provider_ref || this.state.providerSetup.provider)) {
      this.requireProviderSetup(providerId, { originatingOperationRef: `provider-install:${providerId}:${installationId || "new"}`, originatingOperationLabel: `Install ${this.provider(providerId)?.name || providerId}` });
    }
    const setup = this.state.providerSetup;
    if (!setup.official_source_reviewed) {
      this.receipt("Review official source first", "Initial provider CLI acquisition is blocked until the official source and exact Host and Environment have been reviewed.", "warning", { persistent: true });
      return false;
    }
    if (!setup.initial_consent_recorded) {
      const consent = this.advanceProviderSetup("consent", { expectedRevision: setup.revision });
      if (!consent) return false;
    }
    return this.advanceProviderSetup("install", { expectedRevision: this.state.providerSetup.revision });
  }

  authenticateProvider(providerId = this.state.selectedProviderId) {
    const setup = this.state.providerSetup;
    if (!setup || ![providerId, this.provider(providerId)?.name].includes(setup.provider_ref || setup.provider) || setup.installation !== "ready") {
      this.receipt("Authentication remains separate", "Sign-in cannot start until the exact provider installation has completed verification.", "warning", { persistent: true });
      return false;
    }
    return this.advanceProviderSetup("authenticate", { expectedRevision: setup.revision });
  }

  cancelObservableWork(operationId) {
    const current = this.observableWork.get(operationId);
    if (!current || !current.can_cancel) return false;
    const managerRef = current.object_refs?.find((ref) => ref.startsWith("manager:"));
    if (managerRef) {
      const managerId = managerRef.slice("manager:".length);
      this.invalidateManagerLoad(managerId);
      this.state.managerHydration = { ...this.state.managerHydration, [managerId]: { state: "cancelled", generation: this._managerGeneration.get(managerId), operationId } };
    }
    const providerRef = current.object_refs?.find((ref) => ref.startsWith("catalogue:"));
    if (providerRef) {
      const providerId = providerRef.slice("catalogue:".length);
      this._providerRefreshGeneration.set(providerId, (this._providerRefreshGeneration.get(providerId) || 0) + 1);
      this._setProviderRefreshing(providerId, false);
    }
    const next = this.observableWork.update(operationId, { state: "cancelled", human_phase: "Cancelled by the user", can_cancel: false, can_background: false, can_retry: true }, current.generation);
    if (this.state.activeFlow?.operation_id === operationId) {
      Object.assign(this.state.activeFlow, next, { status: "cancelled", rollbackAvailable: false });
    }
    this.state.observableWork = this.observableWork.list();
    this.emit({ action: "manager-flow-progress", scopes: ["manager", "flow"], motionKey: "none" });
    return next;
  }

  retryObservableWork(operationId) {
    const current = this.observableWork.get(operationId);
    if (!current || !current.can_retry) return false;
    const managerRef = current.object_refs?.find((ref) => ref.startsWith("manager:"));
    const providerRef = current.object_refs?.find((ref) => ref.startsWith("catalogue:"));
    const hasBackingRetry = Boolean(managerRef || providerRef || this.state.activeFlow?.operation_id === operationId);
    const next = this.observableWork.supersede(operationId, {
      state: hasBackingRetry ? "accepted" : "queued",
      human_phase: hasBackingRetry ? "Retry accepted" : "Retry queued from the supplied fixture",
      queue_reason: hasBackingRetry ? null : "Waiting for the supplied runtime projection",
      wait_reason: null,
      can_cancel: true,
      can_background: true,
      can_retry: false
    });
    if (this.state.activeFlow?.operation_id === operationId) {
      Object.assign(this.state.activeFlow, next, { status: "active", generation: next.generation, rollbackAvailable: false, failureReason: null });
    } else if (managerRef) {
      const managerId = managerRef.slice("manager:".length);
      this.invalidateManagerLoad(managerId);
      this.state.managerHydration = { ...this.state.managerHydration, [managerId]: { state: "queued", generation: this._managerGeneration.get(managerId), retriedFromOperationId: operationId } };
      void this.loadManagerInventory(managerId, { deferFrame: true, allowInactive: false });
    } else if (providerRef) {
      const providerId = providerRef.slice("catalogue:".length);
      void this.refreshProvider(providerId);
    }
    this.state.observableWork = this.observableWork.list();
    this.emit({ action: "manager-flow-progress", scopes: ["manager", "flow"], motionKey: "none" });
    return next;
  }

  backgroundObservableWork(operationId) {
    const current = this.observableWork.get(operationId);
    if (!current || !current.can_background) return false;
    const next = this.observableWork.update(operationId, { state: "backgrounded", human_phase: "Continuing in the background", can_background: false, blocking_scope: "none" }, current.generation);
    if (this.state.activeFlow?.operation_id === operationId) Object.assign(this.state.activeFlow, next, { status: "backgrounded" });
    this.state.observableWork = this.observableWork.list();
    this.emit({ action: "manager-flow-progress", scopes: ["manager", "flow"], motionKey: "none" });
    return next;
  }

  triggerFixture(fixtureId) {
    const fixture = this.fixtureTriggers.find((entry) => entry.id === fixtureId);
    if (!fixture) return false;
    this.state.activeFixture = fixtureId;
    if (fixture.kind === "search") {
      this.openHome();
      this.setSearch(fixture.query, true, "home");
    } else if (fixture.managerId) {
      this.openManager(fixture.managerId, fixture.managerId === "providers" ? "installations" : "overview", { resourceId: fixture.target });
    }
    if (fixture.kind === "manager-resource") this.updateManagerResource(fixture.managerId, fixture.target, { status: fixture.status, fixtureMessage: fixture.message });
    if (fixture.kind === "provider-state") { const provider = this.provider(fixture.target); if (provider) { provider.state = fixture.status; provider.stateLabel = titleCase(fixture.status); } }
    if (fixture.kind === "provider-catalog") { const provider = this.provider(fixture.target); if (provider?.catalogue) provider.catalogue.state = fixture.status; }
    if (fixture.kind === "provider-route") { const provider = this.provider(fixture.target); if (provider?.routing) provider.routing.fixtureState = fixture.status; }
    if (fixture.kind === "provider-installation") this.selectProviderInstallation(fixture.target, fixture.installationId);
    if (fixture.kind === "flow-state") {
      this.startFlow(fixture.flow, { managerId: fixture.managerId });
      if (fixture.status === "choice-required") { this.state.activeFlow.stageIndex = this.state.activeFlow.choiceStage; this.state.activeFlow.status = "choice-required"; }
      if (fixture.status === "rolled-back") { this.state.activeFlow.status = "rolled-back"; this.state.activeFlow.rollbackAvailable = false; }
    }
    if (fixture.kind === "external-change") this.markExternalChange(fixture.managerId, fixture.target);
    if (fixture.kind === "manager-state") this.state.managerStates = { ...this.state.managerStates, [fixture.target]: fixture.status };
    if (fixture.kind === "long-copy") {
      const resource = this.managerResource(fixture.managerId, fixture.target);
      if (resource) resource.detail = `${fixture.message} This expanded review fixture deliberately carries multiple clauses, explicit provenance language, and a nontrivial technical label so wrapping, localization pressure, and squeezed-window behavior can be inspected without ellipsis.`;
    }
    if (fixture.kind === "hydration") this.state.managerHydration = { ...this.state.managerHydration, [fixture.target]: { state: "loading", startedAt: nowISO() } };
    this.receipt("Review fixture applied", `${fixture.label}: ${fixture.message}`, "managed", { simulation: true });
    this.emit({ action: "fixture", scopes: ["view", "manager", "data", "receipts"], motionKey: `${this.conceptId}:fixture` });
    return clone(fixture);
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

  applyPerformanceProfile(profileId = "normal", options = {}) {
    const profile = PERFORMANCE_PROFILES[profileId] || PERFORMANCE_PROFILES.normal;
    const request = this.resourceGovernor.request({
      owner_domain: "settings-concept",
      resource_family: "settings-projection-cache",
      scope_refs: [`settings-concept:${this.conceptId}`],
      requested: { selected_manager_cache: true, inactive_manager_limit: DEFAULT_INACTIVE_MANAGER_LIMIT, byte_budget: DEFAULT_MANAGER_CACHE_BYTES }
    });
    const projection = this.resourceGovernor.applyProjection({ request_id: request.request_id, ...clone(profile.governor), generation: 1 });
    this._managerCacheBudgetBytes = profile.cache_budget_bytes;
    this._inactiveManagerLimit = profile.inactive_manager_limit;
    this.state.governorProjection = projection;
    this.state.performance = {
      ...this.state.performance,
      profile: profile.id,
      simulated: true,
      deterministic: true,
      hardwareCertified: false,
      policy: {
        smallerCaches: profile.cache_budget_bytes < DEFAULT_MANAGER_CACHE_BYTES,
        speculativePrewarm: false,
        helperWaveLimit: profile.helper_wave_limit,
        decorativeMotion: profile.decorative_motion,
        retainCachedContent: profile.retain_cached_content,
        scheduling: profile.scheduling
      }
    };
    this._evictManagerCache();
    if (options.emit !== false) this.emit({ action: "performance-profile", scopes: ["performance", "data"], motionKey: "none", announcement: `${profile.label} deterministic profile applied. This is not hardware certification.` });
    return clone(this.state.performance);
  }

  performanceTelemetry() {
    this._syncManagerTelemetry();
    this.state.performance.startup = {
      ...this.state.performance.startup,
      detailModuleLoaded: Boolean(this._detailModule),
      detailModuleLoads: Number(globalThis.__pmSettingsDetailModuleLoads || 0) - this._detailModuleLoadsAtConstruction
    };
    return deepFreeze({
      ...clone(this.state.performance),
      subscriptions: this.subscriptions.stats(),
      persistence: this.persistenceStats(),
      observableWorkCount: this.observableWork.list().length,
      note: "Simulated deterministic concept telemetry; no native Slint or physical-hardware certification claim."
    });
  }

  performanceStats() {
    return this.performanceTelemetry();
  }

  runtimeStats() {
    const telemetry = this.performanceTelemetry();
    return deepFreeze({
      startup: telemetry.startup,
      cache: telemetry.cache,
      subscriptions: telemetry.subscriptions,
      persistence: telemetry.persistence,
      detailModuleLoaded: Boolean(this._detailModule),
      detailModuleLoads: Number(globalThis.__pmSettingsDetailModuleLoads || 0) - this._detailModuleLoadsAtConstruction,
      policyOwner: "RuntimeResourceGovernor",
      progressOwner: "ObservableWork",
      simulated: true,
      nativeRuntimeCertified: false
    });
  }

  applyPerformanceFixture(profileId = "normal") {
    return this.applyPerformanceProfile(profileId);
  }

  setPerformanceProfile(profileId = "normal") {
    return this.applyPerformanceProfile(profileId);
  }

  observableWorkFixture(name) {
    const fixture = OBSERVABLE_WORK_FIXTURES[name];
    if (!fixture) return false;
    const current = this.observableWork.get(fixture.operation_id);
    const work = current ? this.observableWork.supersede(fixture.operation_id, fixture) : this.observableWork.create(fixture);
    this.state.observableWork = this.observableWork.list();
    this.emit({ action: "manager-flow-progress", scopes: ["manager", "flow"], motionKey: "none" });
    return work;
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
    return clone(this.managerInventory(managerId)?.items || []);
  }

  providerOperation(providerId = this.state.selectedProviderId) {
    const operation = [...this.providerOperations].reverse().find((entry) => entry.providerId === providerId);
    if (!operation) return null;
    const work = operation.detail?.operationId ? this.observableWork.get(operation.detail.operationId) : null;
    return { ...clone(operation), ...(work || {}), status: work?.state || operation.outcome, message: operation.detail?.message || operation.detail?.reason || work?.human_phase || null };
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
    this.providers = clone(baseline.providers);
    this.roles = clone(baseline.roles);
    this.memories = clone(baseline.memories);
    this.terminals = clone(baseline.terminals);
    this.spelling = normalizeSpelling(baseline.spelling);
    this.setupSessions = baseline.setupSessions;
    this.recentChanges = baseline.recentChanges;
    this.genericManagers = Object.create(null);
    this._managerCacheMeta.clear();
    for (const managerId of this._managerGeneration.keys()) this.invalidateManagerLoad(managerId);
    this._activeManagerSubscription?.release?.();
    this._activeManagerSubscription = null;
    this.subscriptions.clear();
    this.observableWork.clear();
    this.state.observableWork = [];
    this.providerOperations = [];
    this._refreshJobs.clear();
    this.state.refreshingProviderId = null;
    this.state.refreshingProviderIds = [];
    this.state.selectedProviderId = this.providers.some((entry) => entry.id === this.state.selectedProviderId) ? this.state.selectedProviderId : this.providers[0]?.id || null;
    const provider = this.provider();
    this.state.selectedAccountId = provider?.activeAccountId || null;
    this.state.selectedInstallationId = null;
    this.state.selectedMemoryId = this.memories.some((entry) => entry.id === this.state.selectedMemoryId) ? this.state.selectedMemoryId : this.memories[0]?.id || null;
    this.state.selectedTerminalId = this.terminals.some((entry) => entry.id === this.state.selectedTerminalId) ? this.state.selectedTerminalId : this.terminals[0]?.id || null;
    this.state.memoryUndo = null;
    this.state.pendingTerminalSwitch = null;
    this.state.receipts = [];
    this._syncManagerTelemetry();
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
    if (this.state.managerId) this.invalidateManagerLoad(this.state.managerId);
    this._setActiveManagerSubscription(null);
    this._setSearch({ surface: "home", query: "", open: false, activeIndex: 0, optionCount: 0 });
    this.state.screen = "home";
    this.state.managerId = null;
    this.state.navigationOpen = false;
    this.state.inspectorOpen = false;
    const focusRequest = this._newFocus("heading", "settings-home", { selector: "[data-view-heading]" });
    this.emit({ action: "navigate", scopes: ["route", "view", "search", "focus"], focusRequest, motionKey: `${this.conceptId}:home` });
  }

  openCategory(categoryId, subcategoryId = null, focusSettingId = null) {
    if (this.state.managerId) this.invalidateManagerLoad(this.state.managerId);
    this._setActiveManagerSubscription(null);
    const replacingCategory = this.state.screen === "workspace";
    const exact = DATA.CATEGORIES.find((entry) => entry.id === categoryId);
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
    if (!this._detailModule) {
      void this._ensureDetailModule().then(() => {
        const loadedCategory = DATA.CATEGORIES.find((entry) => entry.id === category.id);
        if (!loadedCategory || this.state.screen !== "workspace" || this.state.categoryId !== category.id) return;
        if (!loadedCategory.subcategories.some((entry) => entry.id === this.state.subcategoryId)) {
          this.state.subcategoryId = loadedCategory.subcategories[0]?.id || null;
        }
        const loadedFocus = focusSettingId
          ? this._newFocus("setting", focusSettingId, { selector: `[id="setting-${focusSettingId}"]`, reveal: [this.state.subcategoryId] })
          : null;
        this.emit({ action: "workspace-load", scopes: ["view", "data", "focus"], focusRequest: loadedFocus, motionKey: "none", announcement: `${loadedCategory.title} settings are ready.` });
      }).catch(() => {
        if (this.state.screen === "workspace" && this.state.categoryId === category.id) {
          this.emit({ action: "workspace-load", scopes: ["view", "data"], motionKey: "none", announcement: `${category.title} details could not load.` });
        }
      });
    }
    return true;
  }

  openSetting(settingId) {
    const entry = this.settings.get(settingId);
    if (!entry) {
      const known = this.searchIndex.some((document) => document.destination?.settingId === settingId);
      if (!known) return false;
      void this._ensureDetailModule().then(() => this.openSetting(settingId));
      return true;
    }
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
    this._pendingManagerSelection.set(manager.id, { resourceId: options.resourceId || null, childResourceId: options.childResourceId || null });
    this._setActiveManagerSubscription(manager.id);
    this._setSearch({ surface: `manager:${manager.id}`, query: "", open: false, activeIndex: 0, optionCount: 0 });
    if (manager.id === "providers" && options.resourceId) {
      const provider = this.providers.find((entry) => entry.id === options.resourceId);
      if (provider) {
        this.state.selectedProviderId = provider.id;
        this.state.selectedAccountId = provider.accounts.find((entry) => entry.id === options.childResourceId)?.id || provider.activeAccountId || provider.accounts[0]?.id || null;
        this.state.selectedInstallationId = provider.installations?.find((entry) => entry.id === options.childResourceId)?.id || provider.installations?.find((entry) => entry.selected)?.id || provider.installations?.[0]?.id || null;
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
    void this.loadManagerInventory(manager.id, { deferFrame: options.deferFrame !== false });
    return true;
  }

  navigate(destination) {
    if (typeof destination === "string") {
      if (this.settings.has(destination)) return this.openSetting(destination);
      if (DATA.MANAGERS?.some((entry) => entry.id === destination)) return this.openManager(destination);
      if (DATA.CATEGORIES.some((entry) => entry.id === destination)) return this.openCategory(destination);
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
    this._searchGeneration += 1;
    const documents = this.search(query);
    this._setSearch({ query: String(query || ""), open: Boolean(open && String(query || "").trim()), activeIndex: 0, optionCount: documents.length, surface, generation: this._searchGeneration });
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
      .slice(0, Math.max(0, Math.min(12, Number(limit) || 12)))
      .map((entry) => ({ ...entry.document, destination: destinationFor(entry.document) }));
  }

  async searchLatest(query, options = {}) {
    const generation = ++this._searchGeneration;
    await Promise.resolve();
    const results = this.search(query, options.limit);
    if (generation !== this._searchGeneration) return deepFreeze({ committed: false, generation, results: [] });
    this._setSearch({ query: String(query || ""), open: Boolean(String(query || "").trim()), activeIndex: 0, optionCount: results.length, surface: options.surface || this.state.search.surface, generation });
    this.emit({ action: "search", scopes: ["search"], motionKey: "search", announcement: results.length ? `${results.length} Settings results.` : "No Settings results." });
    return deepFreeze({ committed: true, generation, results: clone(results) });
  }

  installLargeCatalogSearchFixture(rowCount = 825) {
    const count = Math.max(825, Number(rowCount) || 825);
    const docs = Array.from({ length: count }, (_, index) => this._compactSearchDocument({
      kind: "Setting",
      id: `scale-setting-${index + 1}`,
      title: `Scale setting ${index + 1}`,
      subtitle: `Deterministic compact search row ${index + 1}`,
      targetType: "category",
      targetId: CATEGORIES[index % Math.max(1, CATEGORIES.length)]?.id || "experience",
      haystack: `scale fixture setting ${index + 1} deterministic compact metadata`
    }));
    this.searchIndex = docs;
    return deepFreeze({ rows: docs.length, attachedManagerRecords: 0, attachedProviderRecords: 0, rawPaths: 0, simulated: true, deterministic: true });
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
    if (!this._managerCacheMeta.has("providers")) await this.loadManagerInventory("providers", { deferFrame: false, allowInactive: true });
    const provider = this.provider(providerId);
    if (!provider || provider.compactSummary) return false;
    const generation = (this._providerRefreshGeneration.get(providerId) || 0) + 1;
    this._providerRefreshGeneration.set(providerId, generation);
    const capturedScenario = this.state.scenario;
    const lastKnownGood = deepFreeze(clone(provider.models));
    const version = provider.catalogue.version;
    const request = this.resourceGovernor.request({ owner_domain: "provider-catalogue", resource_family: "provider-network-refresh", scope_refs: [`provider:${provider.id}`], requested: { network: true, retained_cache: true } });
    const profileId = /offline|unavailable/.test(capturedScenario) ? "offline" : /degraded|error/.test(capturedScenario) ? "slow-network" : this.state.performance.profile;
    const governorProjection = this.resourceGovernor.applyProjection({ request_id: request.request_id, ...(GOVERNOR_PROJECTION_FIXTURES[profileId] || GOVERNOR_PROJECTION_FIXTURES.normal), generation });
    const permitOutcome = governorProjection?.effective?.outcome || "queued";
    const initialState = permitOutcome === "queued" ? "waiting_resource" : permitOutcome === "blocked_permission" ? "waiting_permission" : permitOutcome === "blocked_resource" ? "waiting_network" : permitOutcome === "admitted_degraded" ? "degraded" : "running";
    const work = this.observableWork.create({
      owner_domain: "provider-catalogue",
      scope_refs: [`provider:${provider.id}`],
      object_refs: [`catalogue:${provider.id}`],
      title: `Refresh ${provider.name} catalogue`,
      human_phase: initialState === "waiting_network" ? "Waiting for the network" : initialState === "waiting_resource" ? "Waiting for a runtime permit" : "Checking the provider catalogue",
      state: initialState,
      progress_kind: "indeterminate",
      progress_source: "unknown",
      wait_reason: governorProjection?.effective?.wait_reason,
      queue_reason: governorProjection?.effective?.queue_reason,
      can_cancel: true,
      can_background: true,
      can_retry: true,
      blocking_scope: "provider refresh",
      generation
    });
    this.state.observableWork = this.observableWork.list();
    this._setProviderRefreshing(provider.id, true);
    this.emit({ action: "provider-refresh-start", scopes: ["provider", "refresh"], motionKey: `${this.conceptId}:refresh-start`, announcement: `Refreshing ${provider.name}.` });

    const job = (async () => {
      await Promise.resolve();
      await waitFrame();
      if (this._providerRefreshGeneration.get(providerId) !== generation) return false;
      const failure = /degraded|error|offline|unavailable/.test(capturedScenario) || ["blocked_permission", "blocked_resource", "cancelled"].includes(permitOutcome);
      if (failure) {
        provider.models = clone(lastKnownGood);
        provider.catalogue.lastKnownGood = lastKnownGood;
        const quarantine = deepFreeze({ id: `quarantine-${Date.now()}`, candidateVersion: `${version}-candidate`, reason: "Fixture validation failed", capturedAt: nowISO() });
        provider.catalogue.quarantine = [...provider.catalogue.quarantine, quarantine];
        this.observableWork.update(work.operation_id, { state: permitOutcome === "blocked_resource" ? "waiting_network" : "degraded", human_phase: "Last-known-good catalogue retained", wait_reason: governorProjection?.effective?.wait_reason || "Deterministic validation fixture failed", can_retry: true, result_refs: [`catalogue-last-known-good:${provider.id}:${version}`] }, generation);
        this._recordProviderOperation(provider, "refresh", "quarantined", { scenario: capturedScenario, preservedRows: lastKnownGood.length, quarantineId: quarantine.id, operationId: work.operation_id, generation, permitOutcome });
        this.receipt("Update quarantined", `Validation failed. ${lastKnownGood.length} last-known-good model rows remain active.`, "warning", { persistent: true });
        return false;
      }
      provider.models.forEach((model) => {
        model.evidence = String(model.evidence || "Evidence checked").replace(/today|minutes ago/i, "just checked");
        model.evidenceFreshness = "Just checked";
      });
      provider.catalogue.version = `${version.split("+")[0]}+generation-${generation}`;
      provider.catalogue.refreshedAt = "Just now";
      provider.catalogue.lastKnownGood = deepFreeze(clone(provider.models));
      this.observableWork.update(work.operation_id, { state: "completed", human_phase: "Catalogue validated", can_cancel: false, can_background: false, result_refs: [`catalogue:${provider.id}:${provider.catalogue.version}`], receipt_refs: [`receipt:provider-refresh:${provider.id}:${generation}`] }, generation);
      this._recordProviderOperation(provider, "refresh", "accepted", { scenario: capturedScenario, preservedRows: provider.models.length, operationId: work.operation_id, generation, permitOutcome });
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
      this.state.observableWork = this.observableWork.list();
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
    if (["install", "setup"].includes(action)) return this.requireProviderSetup(providerId);
    const message = messages[action] || `The ${action} action returned an honest concept receipt.`;
    this._recordProviderOperation(provider, action, "simulated", { message });
    this.receipt("Simulated provider action", message, "managed", { persistent: true });
    return true;
  }

  modelPromptProjection() {
    const selectedProvider = this.provider();
    const selectedAccount = selectedProvider?.accounts?.find((entry) => entry.id === selectedProvider.activeAccountId);
    return deepFreeze({
      settings_summary: [...this.settings.values()]
        .filter((entry) => ["effective-difference", "managed", "unavailable"].includes(entry.status))
        .slice(0, 8)
        .map((entry) => `${entry.label}: ${entry.stateLabel}`),
      provider_summary: selectedProvider ? `${selectedProvider.name}: ${selectedProvider.stateLabel || titleCase(selectedProvider.state)}${selectedAccount ? `; future route ${selectedAccount.name}` : ""}` : "No provider selected",
      operations: this.observableWork.list((entry) => !["completed", "cancelled"].includes(entry.state)).slice(0, 4).map((entry) => `${entry.title}: ${entry.human_phase}`),
      policy_free: true,
      omitted: ["raw resource state", "provider catalogue", "binary paths", "credentials", "runtime pool policy", "permit tables"]
    });
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
    const original = this._coldDomainTemplates.terminal.find((entry) => entry.id === profileId);
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
      case "list.window.shift": return this.shiftListWindow(input.key, input.direction);
      case "search.set": return this.setSearch(input.query, input.open ?? true, input.surface);
      case "search.latest": return this.searchLatest(input.query, input);
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
      case "manager.resource.select": return this.selectManagerResource(input.managerId, input.resourceId || input.id);
      case "manager.resource.update": return this.updateManagerResource(input.managerId, input.resourceId || input.id, input.changes || {});
      case "manager.fixture": return this.applyManagerStateFixture(input.state || input.fixture || input.id, input.managerId || this.state.managerId);
      case "manager.action": return this.runManagerAction(input.managerId || this.state.managerId, input.resourceId, input.name || input.managerAction || input.operation);
      case "flow.start": return this.startFlow(input.kind || "generic", input);
      case "flow.choose": return this.chooseFlow(input.choice);
      case "flow.advance": return this.advanceFlow(input);
      case "flow.rollback": return this.rollbackFlow();
      case "flow.close": return this.closeFlow();
      case "provider.installation.select": return this.selectProviderInstallation(input.providerId, input.installationId || input.id);
      case "provider.installation.action": return this.runProviderInstallationAction(input.providerId, input.installationId, input.installationAction || input.name || input.operation);
      case "provider.setup.required": return this.requireProviderSetup(input.providerId || input.id, input);
      case "provider.setup.demand": return this.providerSetupFromDemand(input.providerId || input.id, input);
      case "provider.setup.advance": return this.advanceProviderSetup(input.name || input.operation || input.setupAction, input);
      case "performance.profile": return this.applyPerformanceProfile(input.profile || input.id || input.value);
      case "observable.fixture": return this.observableWorkFixture(input.fixture || input.id);
      case "sound.preview": return this.previewSound(input.resourceId || input.id);
      case "sound.stop": return this.stopSoundPreview();
      case "theme.preview": return this.previewTheme(input.theme || input.value);
      case "theme.apply": return this.applyThemePreview();
      case "theme.revert": return this.revertThemePreview();
      case "theme.validate": return this.validateCustomTheme(input.draft || input.value);
      case "external.change": return this.markExternalChange(input.managerId, input.resourceId, input.effectiveValue);
      case "external.reconcile": return this.reconcileExternalChange(input.choice);
      case "fixture.trigger": return this.triggerFixture(input.fixtureId || input.id);
      case "persistence.reset": return this.resetPersistentDemo();
      case "persistence.flush": return this.flushPersistence({ explicit: true });
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
      managerOperations: this.managerOperations,
      managerAssignments: this.managerAssignments,
      managerCoverageLabels: this.managerCoverageLabels,
      flowTemplates: this.flowTemplates,
      fixtureTriggers: this.fixtureTriggers,
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
