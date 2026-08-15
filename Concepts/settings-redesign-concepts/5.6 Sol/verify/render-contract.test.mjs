import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  CONCEPTS,
  CONCEPT_MANAGER_ASSIGNMENTS,
  GENERIC_MANAGER_STATE_DEFINITIONS,
  MANAGERS,
  THEMES
} from "../_shared/data.mjs";
import { buildProviderInstallationScaleFixture } from "../_shared/manager-data.mjs";
import { normalizeObservableWork } from "../_shared/runtime-contracts.mjs";
import { SettingsStore } from "../_shared/state.mjs";
import { boundedRows, createViewRenderer, escapeHTML } from "../_shared/view.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const STATE_URL = new URL("../_shared/state.mjs", import.meta.url).href;
const VIEW_URL = new URL("../_shared/view.mjs", import.meta.url).href;
const DATA_URL = new URL("../_shared/data.mjs", import.meta.url).href;
const CONCEPT_IDS = Object.keys(CONCEPTS);
const MANAGER_STATES = Object.keys(GENERIC_MANAGER_STATE_DEFINITIONS);
const CSS_PATHS = [
  "_shared/themes.css",
  "_shared/shell.css",
  "_shared/components.css",
  "_shared/manager-systems.css",
  "styles/index-house.css",
  "styles/switchboard.css",
  "styles/wayfinder.css",
  "styles/ledger.css"
];
const CSS = Object.fromEntries(CSS_PATHS.map((path) => [path, readFileSync(`${ROOT}/${path}`, "utf8")]));
const ALL_CSS = Object.values(CSS).join("\n");
const GALLERY_HTML = readFileSync(`${ROOT}/index.html`, "utf8");

// Evidence boundary: these are pure state-to-string and stylesheet-source
// contracts. They do not render a viewport or prove Slint/native behavior,
// accessibility-tree output, performance, networking, or physical hardware.

function renderer(store, conceptId) {
  return createViewRenderer({ store, conceptId, concept: CONCEPTS[conceptId] });
}

function visibleText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:#39|quot);/g, "'")
    .replace(/&(?:amp);/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function countMatches(text, expression) {
  return [...text.matchAll(expression)].length;
}

async function readyManager(store, managerId, tab = "overview") {
  assert.equal(store.openManager(managerId, tab, { deferFrame: false }), true);
  await store.whenIdle();
  assert.equal(store.state.managerHydration[managerId]?.state, "hydrated");
}

test("all four compact Home strings load zero details and expose no raw technical identity as visible copy", () => {
  const script = `
    import { CONCEPTS } from ${JSON.stringify(DATA_URL)};
    import { SettingsStore } from ${JSON.stringify(STATE_URL)};
    import { createViewRenderer } from ${JSON.stringify(VIEW_URL)};
    const rows = [];
    for (const [conceptId, concept] of Object.entries(CONCEPTS)) {
      const store = new SettingsStore(conceptId, { storage: null });
      const html = createViewRenderer({ store, conceptId, concept }).homeView();
      rows.push({ conceptId, html, stats: store.runtimeStats(), loads: globalThis.__pmSettingsDetailModuleLoads || 0 });
      store.destroy();
    }
    process.stdout.write(JSON.stringify(rows));
  `;
  const child = spawnSync(process.execPath, ["--input-type=module", "--eval", script], { encoding: "utf8" });
  assert.equal(child.status, 0, child.stderr);
  const rows = JSON.parse(child.stdout);
  assert.deepEqual(rows.map((row) => row.conceptId), CONCEPT_IDS);
  for (const row of rows) {
    const text = visibleText(row.html);
    assert.match(row.html, /data-qa-surface="home"/);
    assert.equal(row.stats.detailModuleLoaded, false, row.conceptId);
    assert.equal(row.stats.startup.liveProjectionLoadedManagerCount, 0, row.conceptId);
    assert.equal(row.loads, 0, row.conceptId);
    assert.doesNotMatch(text, /settings:\/\/|provider-installation-scale-|manager-state\.|host-[a-z]|environment-[a-z]/i);
    assert.doesNotMatch(text, /Internal route|Installation identity|Provider identity|Host identity|Environment identity/i);
  }
});

test("workspace renders a compact loading gate before async detail data, then ready setting sections", () => {
  const script = `
    import { CONCEPTS } from ${JSON.stringify(DATA_URL)};
    import { SettingsStore } from ${JSON.stringify(STATE_URL)};
    import { createViewRenderer } from ${JSON.stringify(VIEW_URL)};
    const rows = [];
    for (const [conceptId, concept] of Object.entries(CONCEPTS)) {
      const store = new SettingsStore(conceptId, { storage: null });
      const before = store.runtimeStats();
      store.openCategory(store.state.categoryId, null, null, { deferFrame: false });
      const loading = createViewRenderer({ store, conceptId, concept }).workspaceView();
      const during = store.runtimeStats();
      await store.whenIdle();
      const ready = createViewRenderer({ store, conceptId, concept }).workspaceView();
      rows.push({ conceptId, before, during, after: store.runtimeStats(), loading, ready });
      store.destroy();
    }
    process.stdout.write(JSON.stringify(rows));
  `;
  const child = spawnSync(process.execPath, ["--input-type=module", "--eval", script], { encoding: "utf8" });
  assert.equal(child.status, 0, child.stderr);
  for (const row of JSON.parse(child.stdout)) {
    assert.equal(row.before.detailModuleLoaded, false, row.conceptId);
    assert.equal(row.during.detailModuleLoaded, false, row.conceptId);
    assert.match(row.loading, /data-workspace-load-state="loading"|Loading selected Settings details/);
    assert.doesNotMatch(row.loading, /class="setting-row/);
    assert.equal(row.after.detailModuleLoaded, true, row.conceptId);
    assert.match(row.ready, /class="setting-section/);
    assert.match(row.ready, /class="setting-row/);
    assert.doesNotMatch(row.ready, /data-workspace-load-state=/);
  }
});

test("every assigned manager renders loading before ready and each concept renders all eight state semantics", async () => {
  assert.deepEqual(MANAGER_STATES, ["loading", "empty", "error", "offline", "unavailable", "managed_inherited", "requested_effective", "degraded"]);
  for (const conceptId of CONCEPT_IDS) {
    const store = new SettingsStore(conceptId, { storage: null });
    const view = renderer(store, conceptId);
    for (const managerId of CONCEPT_MANAGER_ASSIGNMENTS[conceptId]) {
      assert.equal(store.openManager(managerId, managerId === "providers" ? "installations" : "overview", { deferFrame: false }), true);
      const loading = view.managerView();
      assert.match(loading, /data-manager-load-state="(?:queued|loading)"|Manager load is queued|Loading manager summary/, `${conceptId}/${managerId}`);
      assert.doesNotMatch(loading, /data-resource-id=/, `${conceptId}/${managerId}`);
      await store.whenIdle();
      const ready = view.managerView();
      assert.match(ready, new RegExp(`data-qa-manager="${managerId}"`));
      assert.doesNotMatch(ready, /data-manager-load-state="loading"/, `${conceptId}/${managerId}`);
      if (managerId === "future-server-shell") {
        assert.match(ready, /data-owner-status="unresolved"/);
        assert.match(visibleText(ready), /Missing owner/);
        assert.match(visibleText(ready), /Every mutation remains blocked/);
        assert.doesNotMatch(visibleText(ready), /Add or configure/);
      }
    }
    const representative = CONCEPT_MANAGER_ASSIGNMENTS[conceptId][0];
    for (const state of MANAGER_STATES) {
      await store.applyManagerStateFixture(state, representative);
      store.state.screen = "manager";
      store.state.managerId = representative;
      const html = view.managerView();
      assert.match(html, new RegExp(`data-manager-load-state="${state.replace("_", "-")}"|data-qa-setting-state="${state.replace("_", "-")}"|Requested[\\s\\S]*Effective|Managed`, "i"), `${conceptId}/${state}`);
      if (["offline", "degraded"].includes(state)) assert.match(html, /Retained cached values|cached summaries retained|Cached status/i);
      if (state === "empty") assert.match(html, /Nothing is configured yet|No .* exists yet|No .* available/i);
      if (state === "error") assert.match(html, /failed|Retry manager load/i);
      if (state === "unavailable") assert.match(html, /unavailable/i);
    }
    store.destroy();
  }
});

test("provider setup rendering follows source review, explicit consent, install verification, then separate authentication", async () => {
  const store = new SettingsStore("index-house", { storage: null });
  await readyManager(store, "providers", "installations");
  const view = renderer(store, "index-house");
  const provider = store.providers[0];
  store.requireProviderSetup(provider.id, {
    hostRef: "host-render-contract",
    hostLabel: "Review workstation",
    environmentRef: "environment-render-contract",
    environmentLabel: "Native review environment",
    officialSource: `Official ${provider.name} release source`
  });
  let html = view.managerView();
  assert.match(html, /Provider Setup Required/);
  assert.match(html, /Review official source/);
  const setupCard = html.match(/<article class="provider-setup-required"[\s\S]*?<\/article>/)?.[0] || "";
  const normalSetupCopy = setupCard.split("<details")[0];
  assert.match(visibleText(normalSetupCopy), new RegExp(`Providers → ${provider.name} → Installations`));
  assert.doesNotMatch(normalSetupCopy, /settings:\/\//i);
  assert.match(setupCard, /<summary>Advanced Details<\/summary>[\s\S]*Internal setup route[\s\S]*settings:\/\//i);
  assert.match(html, /data-provider-confirm-install[^>]* disabled/);
  assert.match(html, /data-provider-authenticate[^>]* disabled/);
  assert.equal(store.confirmFirstProviderInstall(provider.id), false);

  assert.ok(store.reviewProviderSource(provider.id));
  html = view.managerView();
  assert.match(html, /Official source reviewed/);
  assert.doesNotMatch(html, /data-provider-confirm-install[^>]* disabled/);
  const install = store.confirmFirstProviderInstall(provider.id);
  assert.equal(install.initial_consent_recorded, true);
  assert.equal(install.installation, "installing");
  assert.match(view.managerView(), /Install|waiting_permission/i);
  assert.equal(store.authenticateProvider(provider.id), false);

  const installed = store.advanceProviderSetup("install-complete", { expectedRevision: store.state.providerSetup.revision, ok: true, receipt_refs: ["receipt:installation-verified"] });
  assert.equal(installed.installation, "ready");
  html = view.managerView();
  assert.doesNotMatch(html, /data-provider-authenticate[^>]* disabled/);
  const auth = store.authenticateProvider(provider.id);
  assert.equal(auth.authentication, "in_progress");
  store.destroy();
});

test("provider installations render human summaries normally and isolate raw identity in Advanced Details", async () => {
  const store = new SettingsStore("switchboard", { storage: null });
  await readyManager(store, "providers", "installations");
  const provider = store.providers[0];
  const fixture = buildProviderInstallationScaleFixture(100);
  provider.installations = fixture.summaryRows;
  store.state.selectedInstallationId = fixture.summaryRows[95].id;
  const html = renderer(store, "switchboard").managerView();
  assert.match(html, /data-list-total="100"/);
  const mounted = Number(html.match(/installation-list[^>]*data-list-mounted="(\d+)"/)?.[1]);
  assert.ok(mounted > 0 && mounted <= 40, `mounted ${mounted}`);
  assert.match(html, new RegExp(`data-installation-id="${fixture.summaryRows[95].id}"`));
  assert.equal(countMatches(html, /class="installation-row/g), mounted);

  const installationBoardAt = html.indexOf("Provider installations");
  const advancedAt = html.indexOf("Advanced Details", installationBoardAt);
  const rawIdAt = html.indexOf(fixture.summaryRows[95].id, advancedAt);
  assert.ok(advancedAt >= 0 && rawIdAt > advancedAt, "technical identity escaped the Advanced Details disclosure");
  const ordinary = visibleText(html.slice(installationBoardAt, advancedAt));
  assert.match(ordinary, /Review workstation|Windows build host|Mac review host|Linux execution host/i);
  assert.doesNotMatch(ordinary, /provider-installation-scale-|host-scale-|environment-scale-/i);
  store.destroy();
});

test("bounded installation windows retain an off-window selected row", () => {
  const rows = buildProviderInstallationScaleFixture(100).summaryRows;
  const selectedId = rows[99].id;
  const window = boundedRows(rows, { start: 0, selectedId, limit: 40 });
  assert.equal(window.total, 100);
  assert.ok(window.mounted <= 40);
  assert.ok(window.items.some((row) => row.id === selectedId));
});

test("ObservableWork rendered strings preserve wait truth and show determinate progress only with a trustworthy total", async () => {
  const store = new SettingsStore("wayfinder", { storage: null });
  await readyManager(store, "providers", "installations");
  const view = renderer(store, "wayfinder");
  const unknown = normalizeObservableWork({
    operation_id: "render-unknown",
    owner_domain: "provider-catalogue",
    object_refs: ["provider:fixture"],
    title: "Refresh provider catalogue",
    human_phase: "Waiting for provider",
    state: "waiting_provider",
    progress_kind: "determinate",
    progress_source: "unknown",
    completed: 99,
    total: 100,
    wait_reason: "Provider has not supplied a trustworthy total"
  });
  store.state.observableWork = [unknown];
  store.state.managerHydration.providers = { state: "loading", operation_id: unknown.operation_id };
  let html = view.managerView();
  assert.match(html, /Provider has not supplied a trustworthy total/);
  assert.match(html, /Progress not measurable/);
  assert.doesNotMatch(html, /<progress\b/);

  const measured = normalizeObservableWork({ ...unknown, operation_id: "render-measured", progress_source: "measured", completed: 9, total: 10, unit: "models" });
  store.state.observableWork = [measured];
  store.state.managerHydration.providers = { state: "loading", operation_id: measured.operation_id };
  html = view.managerView();
  assert.match(html, /<progress value="9" max="10"/);
  assert.match(html, /9 of 10 models/);
  store.destroy();
});

test("offline and degraded manager strings retain cached values instead of replacing them with silence", async () => {
  const store = new SettingsStore("ledger", { storage: null });
  const view = renderer(store, "ledger");
  for (const state of ["offline", "degraded"]) {
    await store.applyManagerStateFixture(state, "providers");
    store.state.managerId = "providers";
    store.state.screen = "manager";
    const html = view.managerView();
    assert.match(html, /Retained cached values/);
    assert.match(html, /Read-only last-known values remain visible/);
    assert.match(html, /data-cached-resource-id=/);
  }
  store.destroy();
});

test("all eight named themes have authored token scopes", () => {
  assert.equal(THEMES.length, 8);
  assert.equal(new Set(THEMES.map(([id]) => id)).size, 8);
  for (const [id, label] of THEMES) {
    const scope = CSS["_shared/themes.css"].match(new RegExp(`\\[data-theme="${id}"\\]\\s*\\{([\\s\\S]*?)\\n\\}`, "m"));
    assert.ok(scope, `${label} has no CSS token scope`);
    if (id === "friendly-dark") {
      assert.match(scope[1], /color-scheme:\s*dark/);
      assert.match(CSS["_shared/themes.css"].match(/:root\s*\{([\s\S]*?)\n\}/m)?.[1] || "", /--(?:canvas|surface|ink|accent|font|radius|shadow|border)/, "Friendly Dark root defaults have no authored tokens");
    } else {
      assert.match(scope[1], /--(?:canvas|surface|ink|accent|font|radius|shadow|border)/, `${label} has no authored tokens`);
    }
  }
});

test("motion CSS contains static reduced-motion and hidden or document-paused sound-wave contracts", () => {
  assert.match(ALL_CSS, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?animation(?:-duration)?:\s*(?:none|1ms)\s*!important/);
  assert.match(ALL_CSS, /\[data-reduced-motion="1"\][\s\S]*?animation(?:-duration)?:\s*(?:none|1ms)\s*!important/);
  const soundCSS = CSS["_shared/manager-systems.css"];
  assert.match(soundCSS, /\[data-pm-decorative-state="paused"\][\s\S]*?\.sound-wave\[data-playing="true"\]\s+span/);
  assert.match(soundCSS, /\[data-pm-decorative-state="hidden"\][\s\S]*?\.sound-wave\[data-playing="true"\]\s+span/);
  assert.match(soundCSS, /\[hidden\]\s+\.sound-wave\[data-playing="true"\]\s+span[\s\S]*?animation:\s*none/);
  assert.match(soundCSS, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.sound-wave\[data-playing="true"\]\s+span\s*\{\s*animation:\s*none/);
});

test("stylesheet source declares every required responsive width regime; this is not viewport evidence", () => {
  assert.match(ALL_CSS, /@media\s*\([^)]*max-width\s*:\s*520px/i, "missing authored 520px compact regime");
  for (const width of [760, 900, 1280, 1700, 2200, 2500]) {
    assert.match(GALLERY_HTML, new RegExp(`<option value="${width}">`), `missing authored ${width}px review regime`);
  }
  assert.match(ALL_CSS, /@media\s*\([^)]*max-width\s*:\s*520px/i, "compact handset contract must be explicit");
  assert.match(ALL_CSS, /@container\s+concept-main\s*\([^)]*max-width\s*:\s*760px/i, "compact content contract must be explicit");
  assert.match(ALL_CSS, /width:\s*min\(100%,\s*var\(--hub-page-width,\s*1280px\)\)/i, "fluid review-width contract must be explicit");
  assert.match(ALL_CSS, /repeat\([^;{}]*auto-(?:fit|fill)[^;{}]*minmax\(/i, "wide regimes must retain a fluid content-grid contract");
});

test("string and CSS evidence covers text expansion, RTL direction, escaping, and key accessibility semantics", async () => {
  const longRtl = "إعدادات طويلة جدًا ".repeat(24) + "<script>unsafe()</script>";
  const escaped = escapeHTML(longRtl);
  assert.doesNotMatch(escaped, /<script>/);
  assert.match(escaped, /&lt;script&gt;/);
  assert.match(ALL_CSS, /:dir\(rtl\)|\[dir="rtl"\]/);
  assert.match(ALL_CSS, /unicode-bidi:\s*(?:plaintext|isolate)/);
  assert.match(ALL_CSS, /min-width:\s*0|overflow-wrap:\s*(?:anywhere|break-word)/);

  const store = new SettingsStore("index-house", { storage: null });
  const home = renderer(store, "index-house").homeView();
  assert.match(home, /role="combobox"/);
  assert.match(home, /aria-autocomplete="list"/);
  assert.match(home, /dir="auto"/);
  assert.match(home, /data-view-heading/);
  await readyManager(store, "providers", "installations");
  const manager = renderer(store, "index-house").managerView();
  assert.match(manager, /role="tablist"/);
  assert.match(manager, /role="tab"/);
  assert.match(manager, /aria-selected="true"/);
  assert.match(manager, /aria-label="Provider manager sections"/);
  assert.match(manager, /<details class="disclosure technical-identity/);
  store.destroy();
});
