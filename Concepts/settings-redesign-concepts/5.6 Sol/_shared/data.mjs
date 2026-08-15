// Startup-safe Settings metadata. Detailed provider, account, model, installation,
// manager-resource, memory, and terminal fixtures live in data-details.mjs and
// are imported only after the user opens a concrete destination.
import { CORE_DATA } from "./data-core-values.mjs";

export const MODEL_NAME = "5.6 Sol";

export const THEMES = Object.freeze([
  ["friendly-dark", "Friendly Dark"],
  ["friendly-light", "Friendly Light"],
  ["glass-dark", "Glass Dark"],
  ["glass-light", "Glass Light"],
  ["retro-dark", "Retro Dark"],
  ["retro-light", "Retro Light"],
  ["basic-dark", "Basic Dark"],
  ["basic-light", "Basic Light"]
]);

export const CONCEPTS = Object.freeze({
  "index-house": Object.freeze({ number: "01", name: "Index House", title: "5.6 Sol — Index House", thesis: "A stable directory where every setting has an address.", homePrompt: "Find a setting, action, or manager" }),
  switchboard: Object.freeze({ number: "02", name: "Switchboard", title: "5.6 Sol — Switchboard", thesis: "An operational board organized around readiness and action.", homePrompt: "Route a change or inspect system readiness" }),
  wayfinder: Object.freeze({ number: "03", name: "Wayfinder", title: "5.6 Sol — Wayfinder", thesis: "Human goals become routes through the Settings system.", homePrompt: "Where do you want Puppet Master to take you?" }),
  ledger: Object.freeze({ number: "04", name: "Ledger", title: "5.6 Sol — Ledger", thesis: "A dense reference for comparing requested, inherited, and effective state.", homePrompt: "Search the Settings ledger" })
});

export const VALUE_STATES = Object.freeze(["Default", "Inherited", "Auto", "Not configured", "Managed", "Custom", "Unavailable", "Effective value differs"]);
export const EXPOSURE_LEVELS = Object.freeze(["Standard", "Advanced", "Expert or risky", "Managed/read-only", "Diagnostic", "Unavailable"]);

export let CATEGORIES = CORE_DATA.CATEGORY_SUMMARIES;
export const MANAGERS = CORE_DATA.MANAGERS;
export let PROVIDERS = CORE_DATA.PROVIDERS;
export let ROLE_ASSIGNMENTS = [];
export let MEMORY_GISTS = [];
export let TERMINAL_PROFILES = [];
export let MANAGER_INVENTORIES = Object.create(null);
export let GENERIC_MANAGER_STATES = Object.create(null);
export let FLOW_TEMPLATES = Object.create(null);
export let DETERMINISTIC_TRIGGERS = [];
export let MANAGER_COVERAGE_LABELS = Object.create(null);

export const SPELLING_FIXTURE = CORE_DATA.SPELLING_FIXTURE;
export const SETUP_SESSIONS = CORE_DATA.SETUP_SESSIONS;
export const RECENT_CHANGES = CORE_DATA.RECENT_CHANGES;
export const RECEIPT_HISTORY = CORE_DATA.RECEIPT_HISTORY;
export const SCENARIOS = CORE_DATA.SCENARIOS;
export const CONCEPT_MANAGER_ASSIGNMENTS = CORE_DATA.CONCEPT_MANAGER_ASSIGNMENTS;
export const GENERIC_MANAGER_STATE_DEFINITIONS = CORE_DATA.GENERIC_MANAGER_STATE_DEFINITIONS;
export const SIMULATED_REVIEW_PROFILES = CORE_DATA.SIMULATED_REVIEW_PROFILES;
export const SIMULATED_REVIEW_PROFILE_NOTICE = CORE_DATA.SIMULATED_REVIEW_PROFILE_NOTICE;
export const RESOURCE_ADMISSION_PROJECTION_CONTRACT = CORE_DATA.RESOURCE_ADMISSION_PROJECTION_CONTRACT;

export const MANAGER_STATE_FIXTURE_IDS = Object.freeze(Object.fromEntries(
  MANAGERS.map((manager) => [manager.id, Object.keys(GENERIC_MANAGER_STATE_DEFINITIONS).map((state) => `manager-state.${manager.id}.${state}`)])
));

let detailedModule = null;

export function installDetailedData(details) {
  if (!details || detailedModule === details) return detailedModule;
  detailedModule = details;
  CATEGORIES = details.CATEGORIES;
  PROVIDERS = details.PROVIDERS;
  ROLE_ASSIGNMENTS = details.ROLE_ASSIGNMENTS;
  MEMORY_GISTS = details.MEMORY_GISTS;
  TERMINAL_PROFILES = details.TERMINAL_PROFILES;
  MANAGER_INVENTORIES = details.MANAGER_INVENTORIES;
  GENERIC_MANAGER_STATES = details.GENERIC_MANAGER_STATES;
  FLOW_TEMPLATES = details.FLOW_TEMPLATES;
  DETERMINISTIC_TRIGGERS = details.DETERMINISTIC_TRIGGERS;
  MANAGER_COVERAGE_LABELS = details.MANAGER_COVERAGE_LABELS;
  return detailedModule;
}

export function detailedDataInstalled() {
  return Boolean(detailedModule);
}

export function categoryById(id) {
  return CATEGORIES.find((category) => category.id === id) || CATEGORIES[0] || null;
}

export function managerById(id) {
  return MANAGERS.find((manager) => manager.id === id) || MANAGERS[0] || null;
}

export function providerById(id) {
  return PROVIDERS.find((provider) => provider.id === id) || PROVIDERS[0] || null;
}

export function inventoryByManagerId(id) {
  return MANAGER_INVENTORIES[id] || null;
}

export function scenarioById(id) {
  return SCENARIOS[id] || SCENARIOS.normal;
}

export function allSettings() {
  return CATEGORIES.flatMap((category) => (category.subcategories || []).flatMap((subcategory) => (subcategory.settings || []).map((entry) => ({
    ...entry,
    categoryId: category.id,
    categoryTitle: category.title,
    subcategoryId: subcategory.id,
    subcategoryTitle: subcategory.title,
    destination: { type: "setting", categoryId: category.id, subcategoryId: subcategory.id, settingId: entry.id }
  }))));
}

export function buildManagerStateFixture(managerId, state) {
  const definition = GENERIC_MANAGER_STATE_DEFINITIONS[state];
  if (!MANAGER_STATE_FIXTURE_IDS[managerId] || !definition) return null;
  return { id: `manager-state.${managerId}.${state}`, managerId, state, ...definition };
}

export const SEARCH_METADATA_REGISTRY = Object.freeze(CORE_DATA.SEARCH_METADATA);

export function buildCompactSearchMetadata({ scaleFixtureCount = 0 } = {}) {
  const baseline = SEARCH_METADATA_REGISTRY.map((entry) => ({ ...entry, keywords: [...entry.keywords], destination: { ...entry.destination } }));
  if (!Number.isInteger(scaleFixtureCount) || scaleFixtureCount <= baseline.length) return baseline;
  const rows = [...baseline];
  for (let index = baseline.length; index < scaleFixtureCount; index += 1) {
    const source = baseline[index % baseline.length];
    const repeat = Math.floor(index / baseline.length);
    rows.push({ id: `scale.${repeat}.${source.id}`, title: `${source.title} ${repeat}`, keywords: [...source.keywords, "deterministic scale fixture"], destination: { ...source.destination } });
  }
  return rows;
}

export function buildSearchIndex(options = {}) {
  return buildCompactSearchMetadata(options).map((entry) => {
    const destination = entry.destination;
    const targetType = destination.settingId ? "setting" : destination.managerId ? "manager" : destination.categoryId ? "category" : "action";
    const targetId = destination.settingId || destination.managerId || destination.categoryId || entry.id;
    return {
      kind: targetType === "setting" ? "Setting" : targetType === "manager" ? "Manager" : targetType === "category" ? "Destination" : "Action",
      id: entry.id,
      title: entry.title,
      subtitle: entry.keywords.slice(0, 2).join(" · "),
      targetType,
      targetId,
      categoryId: destination.categoryId,
      subcategoryId: destination.subcategoryId,
      destination,
      keywords: entry.keywords,
      haystack: [entry.title, ...entry.keywords].join(" ").toLowerCase()
    };
  });
}
