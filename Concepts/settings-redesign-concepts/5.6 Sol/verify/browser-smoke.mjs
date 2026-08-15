#!/usr/bin/env node

/*
 * Deterministic browser-prototype verification for the 5.6 Sol Settings bakeoff.
 *
 * This file intentionally uses only Node built-ins plus the W3C WebDriver HTTP
 * protocol. It creates no product dependency and writes only below one mkdtemp
 * root, which is removed in the finalizer.
 */

import { spawn } from "node:child_process";
import { access, mkdtemp, mkdir, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const modelDir = resolve(here, "..");
const repoRoot = resolve(modelDir, "../../..");
const hubServer = join(repoRoot, "Concepts", "ConceptHub", "server.py");
const driverBinary = process.env.PM_SETTINGS_GECKODRIVER_BINARY || "/snap/firefox/current/usr/lib/firefox/geckodriver";
const browserBinary = process.env.PM_SETTINGS_FIREFOX_BINARY || "/snap/firefox/current/usr/lib/firefox/firefox";
const focused = process.argv.includes("--focused");
const startedAt = new Date().toISOString();
const temporaryRoot = await mkdtemp(join(tmpdir(), "pm-settings-firefox-"));
const profileRoot = join(temporaryRoot, "profiles");
const outputRoot = join(temporaryRoot, "output");
await mkdir(profileRoot, { recursive: true });
await mkdir(outputRoot, { recursive: true });

const concepts = [
  { id: "index-house", file: "concept-01-index-house.html", assigned: "context" },
  { id: "switchboard", file: "concept-02-switchboard.html", assigned: "notifications-sounds" },
  { id: "wayfinder", file: "concept-03-wayfinder.html", assigned: "file-manager" },
  { id: "ledger", file: "concept-04-ledger.html", assigned: "storage-retention" }
];
const themes = ["friendly-dark", "friendly-light", "glass-dark", "glass-light", "retro-dark", "retro-light", "basic-dark", "basic-light"];
const widths = [520, 760, 900, 1280, 1700, 2200, 2500];
const representativeWidths = [520, 1280, 2500];
const managerStates = ["loading", "empty", "error", "offline", "unavailable", "managed_inherited", "requested_effective", "degraded"];
const semanticMotionKinds = ["navigate", "category", "search", "jump", "scrollspy", "disclosure", "refresh", "save", "reorder", "drawer", "transaction", "preview"];
const performanceProfiles = ["low-memory", "offline", "slow-network", "metered", "thermal", "legacy"];
const forbiddenLayoutAnimationProperties = new Set(["width", "height", "top", "right", "bottom", "left", "margin", "padding", "grid-template-rows", "grid-template-columns"]);

const sections = Object.fromEntries([
  "harness", "startup", "renderMatrix", "managerRoutes", "managerStates", "providerPolicy", "runtimePerformance", "motion", "accessibility"
].map((name) => [name, { attempted: 0, passed: 0, failed: 0 }]));
const failures = [];
let omittedFailureDetails = 0;
let hubProcess = null;
let driverProcess = null;
let driver = null;
let hubPort = null;
let driverPort = null;
let hubBindingMethod = "server-requested-os-assigned-port";
let driverBindingMethod = null;
let driverOutput = null;
let environment = {
  node: process.version,
  platform: process.platform,
  architecture: process.arch,
  browser: null,
  browserBinary,
  driverBinary,
  binarySelection: "Environment-overridable direct Firefox snap payloads; exact resolved paths are reported above.",
  headless: true
};

function safeError(error) {
  return String(error?.stack || error?.message || error).replaceAll(temporaryRoot, "<temporary-root>").slice(0, 5000);
}

function rememberFailure(detail) {
  if (failures.length < 500) failures.push(detail);
  else omittedFailureDetails += 1;
}

async function runCase(section, label, task) {
  const counts = sections[section];
  counts.attempted += 1;
  try {
    const result = await task();
    const issues = result === true || result === undefined ? [] : Array.isArray(result) ? result.filter(Boolean) : [String(result)];
    if (issues.length) {
      counts.failed += 1;
      rememberFailure({ section, label, issues });
      return false;
    }
    counts.passed += 1;
    return true;
  } catch (error) {
    counts.failed += 1;
    rememberFailure({ section, label, issues: [safeError(error)] });
    return false;
  }
}

function stopProcess(child) {
  if (!child) return Promise.resolve();
  const signal = (name) => {
    try {
      if (child._pmOwnProcessGroup && child.pid && process.platform !== "win32") process.kill(-child.pid, name);
      else child.kill(name);
    } catch { /* already stopped */ }
  };
  if (child.exitCode !== null) {
    signal("SIGTERM");
    return new Promise((done) => setTimeout(() => { signal("SIGKILL"); done(); }, 250));
  }
  return new Promise((done) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      done();
    };
    const timer = setTimeout(() => {
      signal("SIGKILL");
      finish();
    }, 1800);
    child.once("exit", () => {
      clearTimeout(timer);
      finish();
    });
    signal("SIGTERM");
  });
}

function waitForListen(child, pattern, label, timeoutMs = 20000) {
  return new Promise((resolvePromise, rejectPromise) => {
    let output = "";
    let settled = false;
    const inspect = (chunk) => {
      output = (output + chunk.toString()).slice(-24000);
      const match = output.match(pattern);
      if (!settled && match) {
        settled = true;
        clearTimeout(timer);
        resolvePromise({ port: Number(match[1]), output: () => output });
      }
    };
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      rejectPromise(new Error(`${label} did not report a listening port within ${timeoutMs}ms.\n${output}`));
    }, timeoutMs);
    child.stdout?.on("data", inspect);
    child.stderr?.on("data", inspect);
    child.once("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      rejectPromise(error);
    });
    child.once("exit", (code, signal) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      rejectPromise(new Error(`${label} exited before listening (code=${code}, signal=${signal}).\n${output}`));
    });
  });
}

async function reserveLoopbackPort() {
  const server = createServer();
  await new Promise((resolvePromise, rejectPromise) => {
    server.once("error", rejectPromise);
    server.listen(0, "127.0.0.1", resolvePromise);
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : null;
  await new Promise((resolvePromise) => server.close(resolvePromise));
  if (!port) throw new Error("The kernel did not return a loopback port reservation.");
  return port;
}

async function startHub() {
  const child = spawn("python3", [hubServer, "--host", "127.0.0.1", "--port", "0", "--no-browser", "--no-runtime-state"], {
    cwd: repoRoot,
    env: { ...process.env, PYTHONUNBUFFERED: "1", PYTHONDONTWRITEBYTECODE: "1" },
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"]
  });
  child._pmOwnProcessGroup = process.platform !== "win32";
  const listening = await waitForListen(child, /http:\/\/127\.0\.0\.1:(\d+)\//, "ConceptHub", 15000);
  return { child, port: listening.port };
}

async function startDriver() {
  const spawnDriver = (port) => {
    const child = spawn(driverBinary, [
      "--host", "127.0.0.1",
      "--port", String(port),
      "--binary", browserBinary,
      "--profile-root", profileRoot,
      "--log", "info"
    ], { cwd: temporaryRoot, env: { ...process.env }, detached: process.platform !== "win32", stdio: ["ignore", "pipe", "pipe"] });
    child._pmOwnProcessGroup = process.platform !== "win32";
    return child;
  };

  let child = spawnDriver(0);
  try {
    const listening = await waitForListen(child, /Listening on 127\.0\.0\.1:(\d+)/, "Firefox driver", 30000);
    driverBindingMethod = "driver-port-zero-parsed-listen-line";
    return { child, port: listening.port, output: listening.output };
  } catch (zeroError) {
    await stopProcess(child);
    const reserved = await reserveLoopbackPort();
    child = spawnDriver(reserved);
    try {
      const listening = await waitForListen(child, /Listening on 127\.0\.0\.1:(\d+)/, "Firefox driver fallback", 30000);
      if (listening.port !== reserved) throw new Error(`Firefox driver listened on ${listening.port}, expected reserved port ${reserved}.`);
      driverBindingMethod = "kernel-reserve-close-then-explicit-bind";
      return { child, port: listening.port, output: listening.output };
    } catch (fallbackError) {
      await stopProcess(child);
      throw new Error(`Driver port-zero start failed: ${safeError(zeroError)}\nFallback start failed: ${safeError(fallbackError)}`);
    }
  }
}

function requestJson(port, method, path, body = undefined, timeoutMs = 30000) {
  return new Promise((resolvePromise, rejectPromise) => {
    const payload = body === undefined ? null : JSON.stringify(body);
    const request = globalThis.fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: payload === null ? {} : { "content-type": "application/json; charset=utf-8" },
      body: payload,
      signal: AbortSignal.timeout(timeoutMs)
    });
    request.then(async (response) => {
      const text = await response.text();
      let parsed;
      try { parsed = text ? JSON.parse(text) : {}; }
      catch { throw new Error(`${method} ${path} returned non-JSON (${response.status}): ${text.slice(0, 1200)}`); }
      if (!response.ok || parsed?.value?.error) {
        const value = parsed?.value || parsed;
        throw new Error(`${method} ${path} failed (${response.status}): ${value?.error || "webdriver error"}: ${value?.message || text}`);
      }
      resolvePromise(parsed?.value);
    }).catch((error) => rejectPromise(new Error(`${method} ${path} transport failed: ${error?.message || error}`, { cause: error })));
  });
}

class W3CDriver {
  constructor(port) {
    this.port = port;
    this.sessionId = null;
  }

  async create() {
    const value = await requestJson(this.port, "POST", "/session", {
      capabilities: {
        alwaysMatch: {
          browserName: "firefox",
          acceptInsecureCerts: false,
          pageLoadStrategy: "normal",
          "moz:firefoxOptions": {
            binary: browserBinary,
            args: ["-headless"],
            prefs: {
              "browser.shell.checkDefaultBrowser": false,
              "browser.tabs.warnOnClose": false,
              "datareporting.policy.dataSubmissionEnabled": false,
              "toolkit.telemetry.reportingpolicy.firstRun": false
            },
            log: { level: "error" }
          }
        }
      }
    }, 60000);
    this.sessionId = value.sessionId;
    environment.browser = value.capabilities?.browserVersion || null;
    environment.browserName = value.capabilities?.browserName || "firefox";
    environment.browserPlatform = value.capabilities?.platformName || null;
    return value;
  }

  endpoint(path = "") {
    if (!this.sessionId) throw new Error("No active browser session.");
    return `/session/${this.sessionId}${path}`;
  }

  navigate(url) { return requestJson(this.port, "POST", this.endpoint("/url"), { url }, 45000); }
  rect(width, height = 900) { return requestJson(this.port, "POST", this.endpoint("/window/rect"), { x: 0, y: 0, width, height }); }

  execute(fn, args = []) {
    return requestJson(this.port, "POST", this.endpoint("/execute/sync"), {
      script: `return (${fn.toString()}).apply(null, arguments);`,
      args
    });
  }

  async executeAsync(fn, args = [], timeoutMs = 30000) {
    await requestJson(this.port, "POST", this.endpoint("/timeouts"), { script: timeoutMs });
    const wrapped = await requestJson(this.port, "POST", this.endpoint("/execute/async"), {
      script: `const done = arguments[arguments.length - 1]; const values = Array.prototype.slice.call(arguments, 0, -1); Promise.resolve((${fn.toString()}).apply(null, values)).then((value) => done({ok:true,value}), (error) => done({ok:false,error:String(error && (error.stack || error.message) || error)}));`,
      args
    }, timeoutMs + 5000);
    if (!wrapped?.ok) throw new Error(wrapped?.error || "Asynchronous page script failed.");
    return wrapped.value;
  }

  async find(css) {
    const value = await requestJson(this.port, "POST", this.endpoint("/element"), { using: "css selector", value: css });
    return value["element-6066-11e4-a52e-4f735466cecf"];
  }

  async keys(keys) {
    const actions = keys.map((value) => ({ type: "keyDown", value })).concat([...keys].reverse().map((value) => ({ type: "keyUp", value })));
    return requestJson(this.port, "POST", this.endpoint("/actions"), { actions: [{ type: "key", id: "keyboard", actions }] });
  }

  screenshot() { return requestJson(this.port, "GET", this.endpoint("/screenshot")); }

  async close() {
    if (!this.sessionId) return;
    const id = this.sessionId;
    this.sessionId = null;
    await requestJson(this.port, "DELETE", `/session/${id}`).catch(() => {});
  }
}

async function ready() {
  return driver.executeAsync(async () => {
    const started = performance.now();
    while (!window.PMSettingsDemo?.whenIdle) {
      if (performance.now() - started > 15000) throw new Error("PMSettingsDemo did not become available.");
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 25));
    }
    await window.PMSettingsDemo.whenIdle();
    return { model: window.PMSettingsDemo.model, concept: window.PMSettingsDemo.concept, title: document.title };
  }, [], 20000);
}

async function review(values) {
  return driver.executeAsync(async (state) => {
    await window.PMSettingsDemo.applyReviewState(state);
    await window.PMSettingsDemo.settleForReview();
    return window.PMSettingsDemo.snapshot().state;
  }, [values], 20000);
}

async function openSurface(surface, assignedManager) {
  return driver.executeAsync(async (surfaceName, managerId) => {
    if (surfaceName === "home") await window.PMSettingsDemo.openHome();
    else if (surfaceName === "workspace") await window.PMSettingsDemo.openCategory("experience");
    else if (surfaceName === "providers") await window.PMSettingsDemo.openManager("providers", "installations", { resourceId: "openai" });
    else await window.PMSettingsDemo.openManager(managerId, "overview");
    await window.PMSettingsDemo.whenIdle();
    await window.PMSettingsDemo.settleForReview();
    return window.PMSettingsDemo.snapshot().state;
  }, [surface, assignedManager], 25000);
}

function pageAuditFunction(expected = {}) {
  const visible = (element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0 && !element.closest("[hidden],[inert],[aria-hidden='true']");
  };
  const contentRoot = document.querySelector(".concept-scroll");
  const walker = contentRoot ? document.createTreeWalker(contentRoot, NodeFilter.SHOW_TEXT) : null;
  const visibleFragments = [];
  while (walker?.nextNode()) {
    const parent = walker.currentNode.parentElement;
    if (parent && !parent.closest(".technical-identity") && visible(parent)) visibleFragments.push(walker.currentNode.nodeValue || "");
  }
  const visibleText = visibleFragments.join(" ").replace(/\s+/g, " ").trim();
  const rawPatterns = [
    /\b(?:provider|installation|host|environment|operation|account|project|plan|manager)_id\b/i,
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
    /(?:^|\s)(?:\/[A-Za-z0-9._-]+){3,}(?:\s|$)/,
    /[A-Za-z]:\\(?:[^\s\\]+\\){2,}/,
    /\b(?:sha256|hash)\s*[:=]\s*[0-9a-f]{16,}\b/i,
    /\b(?:npm|pnpm|brew|winget|apt|dnf|snap)\s+(?:install|add)\b/i,
    /settings:\/\/[a-z0-9/_-]+/i
  ];
  const root = document.documentElement;
  const body = document.body;
  const scroller = document.querySelector(".concept-scroll");
  const view = scroller?.querySelector(":scope > .view");
  const heading = view?.querySelector("h1");
  const activeNav = document.querySelector("[data-shell-nav][aria-current='page']");
  const snapshot = window.PMSettingsDemo.snapshot();
  const animations = document.getAnimations().filter((animation) => animation.playState === "running");
  const managerInventory = expected.managerId ? snapshot.genericManagers?.[expected.managerId] : null;
  const candidateInternalIds = [
    snapshot.state.selectedInstallationId,
    snapshot.state.selectedAccountId,
    snapshot.state.selectedMemoryId,
    snapshot.state.selectedTerminalId,
    snapshot.state.selectedManagerResource?.[expected.managerId],
    ...(managerInventory?.items || []).map((item) => item.id)
  ].filter((value) => typeof value === "string" && value.length >= 5 && /[-_.]/.test(value));
  const listWindows = [...document.querySelectorAll(".concept-scroll [data-list-total]")].map((element) => ({
    label: element.getAttribute("aria-label") || element.className || element.tagName,
    total: Number(element.dataset.listTotal),
    mounted: Number(element.dataset.listMounted),
    start: Number(element.dataset.listStart)
  }));
  return {
    state: snapshot.state,
    surface: view?.dataset.qaSurface || null,
    manager: view?.dataset.qaManager || null,
    heading: heading?.innerText.trim() || null,
    headingCount: view ? [...view.querySelectorAll("h1")].filter(visible).length : 0,
    rootOverflow: root.scrollWidth > root.clientWidth + 2,
    bodyOverflow: body.scrollWidth > body.clientWidth + 2,
    canvasOverflow: scroller ? scroller.scrollWidth > scroller.clientWidth + 2 : true,
    shellHeightDelta: Math.abs((document.querySelector(".pm-shell")?.getBoundingClientRect().height || 0) - innerHeight),
    activeNav: activeNav?.dataset.shellNav || null,
    runningAnimations: animations.length,
    rawIdentityMatches: rawPatterns.map((pattern) => visibleText.match(pattern)?.[0] || null).filter(Boolean),
    rawInternalIds: [...new Set(candidateInternalIds.filter((id) => visibleText.includes(id)))],
    fatalText: /uncaught|fatal error|cannot read properties|module failed/i.test(visibleText),
    listWindows,
    managerHydration: expected.managerId ? snapshot.state.managerHydration?.[expected.managerId] || null : null,
    visibleText: visibleText.slice(0, 4000)
  };
}

function auditIssues(audit, expected) {
  const issues = [];
  if (audit.surface !== expected.surface) issues.push(`surface=${audit.surface}, expected ${expected.surface}`);
  if (expected.manager && audit.manager !== expected.manager) issues.push(`manager=${audit.manager}, expected ${expected.manager}`);
  if (audit.headingCount !== 1 || !audit.heading) issues.push(`visible h1 count=${audit.headingCount}`);
  if (audit.rootOverflow || audit.bodyOverflow || audit.canvasOverflow) issues.push(`fatal horizontal overflow root=${audit.rootOverflow} body=${audit.bodyOverflow} canvas=${audit.canvasOverflow}`);
  if (audit.shellHeightDelta > 2) issues.push(`shell height differs from viewport by ${audit.shellHeightDelta}px`);
  if (audit.runningAnimations) issues.push(`${audit.runningAnimations} animation(s) still running after settlement`);
  if (audit.fatalText) issues.push("visible fatal-error text detected");
  if (audit.rawIdentityMatches.length) issues.push(`normally visible raw identity: ${audit.rawIdentityMatches.join(", ")}`);
  if (audit.rawInternalIds?.length) issues.push(`normally visible internal IDs: ${audit.rawInternalIds.join(", ")}`);
  for (const list of audit.listWindows || []) {
    if (![list.total, list.mounted, list.start].every(Number.isFinite) || list.total < 0 || list.mounted < 0 || list.start < 0 || list.mounted > list.total || list.start + list.mounted > list.total || list.mounted > 40) issues.push(`invalid bounded list ${list.label}: total=${list.total} mounted=${list.mounted} start=${list.start}`);
  }
  if (expected.nav && audit.activeNav !== expected.nav) issues.push(`active nav=${audit.activeNav}, expected ${expected.nav}`);
  return issues;
}

async function runStartup(concept) {
  await runCase("startup", `${concept.id}: compact Home and search`, async () => {
    const telemetry = await driver.executeAsync(async () => {
      const demo = window.PMSettingsDemo;
      const store = demo.store;
      if (typeof store.performanceTelemetry !== "function" || typeof store.installLargeCatalogSearchFixture !== "function" || typeof store.searchLatest !== "function" || typeof store.persistenceStats !== "function") return { missing: "startup search/performance APIs" };
      const before = store.performanceTelemetry();
      const writesBefore = store.persistenceStats().writes;
      const installed = store.installLargeCatalogSearchFixture(825);
      let lastSearch = null;
      for (let index = 0; index < 25; index += 1) lastSearch = await store.searchLatest(`scale ${index + 1}`, { limit: 12, surface: "home" });
      await demo.whenIdle();
      const after = store.performanceTelemetry();
      return { before, after, installed, resultCount: lastSearch?.results?.length, committed: lastSearch?.committed, writes: store.persistenceStats().writes - writesBefore, screen: demo.snapshot().state.screen };
    }, [], 30000);
    const issues = [];
    if (telemetry.missing) return [telemetry.missing];
    if (telemetry.screen !== "home") issues.push(`startup screen=${telemetry.screen}`);
    for (const [phase, stats] of [["initial Home", telemetry.before], ["25-key search", telemetry.after]]) {
      if (stats?.startup?.detailModuleLoaded !== false || stats?.startup?.detailModuleLoads !== 0) issues.push(`${phase} imported the detail module (${stats?.startup?.detailModuleLoads})`);
      if (stats?.startup?.moduleLoadFixtureBytesMeasured !== true) issues.push(`${phase} lacks measured module-load fixture telemetry`);
      if (stats?.startup?.liveProjectionLoadedManagerCount !== 0) issues.push(`${phase} loaded ${stats?.startup?.liveProjectionLoadedManagerCount} manager projection(s)`);
      if (stats?.startup?.liveProjectionLoadedBytes !== 0) issues.push(`${phase} loaded ${stats?.startup?.liveProjectionLoadedBytes} manager-projection bytes`);
      if (stats?.startup?.providerProbes !== 0) issues.push(`${phase} ran ${stats?.startup?.providerProbes} provider probes`);
      if (stats?.startup?.speculativePrewarm !== false) issues.push(`${phase} speculative prewarm was not false`);
    }
    if (telemetry.installed?.rows < 825 || telemetry.installed?.attachedManagerRecords !== 0 || telemetry.installed?.attachedProviderRecords !== 0 || telemetry.installed?.rawPaths !== 0) issues.push(`compact metadata fixture invalid: ${JSON.stringify(telemetry.installed)}`);
    if (telemetry.resultCount > 12 || !telemetry.committed) issues.push(`search result count=${telemetry.resultCount}, committed=${telemetry.committed}`);
    if (telemetry.writes !== 0) issues.push(`25 search keys caused ${telemetry.writes} persistence writes`);
    return issues;
  });

  await runCase("startup", `${concept.id}: first selected manager is the only detail import`, async () => {
    const telemetry = await driver.executeAsync(async (managerId) => {
      const demo = window.PMSettingsDemo;
      await demo.openManager(managerId, "overview");
      await demo.whenIdle();
      return demo.store.performanceTelemetry();
    }, [concept.assigned], 30000);
    const issues = [];
    if (telemetry?.startup?.detailModuleLoaded !== true || telemetry?.startup?.detailModuleLoads !== 1) issues.push(`first manager detail imports=${telemetry?.startup?.detailModuleLoads}, loaded=${telemetry?.startup?.detailModuleLoaded}`);
    if (telemetry?.startup?.liveProjectionLoadedManagerCount !== 1) issues.push(`first selection loaded ${telemetry?.startup?.liveProjectionLoadedManagerCount} manager projections`);
    if (telemetry?.subscriptions?.heavy_key_count !== 1) issues.push(`first selection retained ${telemetry?.subscriptions?.heavy_key_count} heavy subscriptions`);
    return issues;
  });
}

async function runRenderMatrix(concept) {
  const matrixThemes = focused ? ["friendly-dark"] : themes;
  const matrixWidths = focused ? [520, 1280] : widths;
  const motionValues = focused ? [true] : [false, true];
  const surfaces = ["home", "workspace", "providers", "assigned"];
  for (const surface of surfaces) {
    for (const theme of matrixThemes) {
      for (const width of matrixWidths) {
        for (const reducedMotion of motionValues) {
          const label = `${concept.id}:${surface}:${theme}:${width}:reduced=${reducedMotion}`;
          await runCase("renderMatrix", label, async () => {
            await driver.rect(width, 900);
            await review({ theme, scenario: "normal", railOpen: false, chatOpen: false, reducedMotion, direction: "ltr", textScale: 1, resetScenario: false });
            const state = await openSurface(surface, concept.assigned);
            const audit = await driver.execute(pageAuditFunction, [{ managerId: surface === "assigned" ? concept.assigned : surface === "providers" ? "providers" : null }]);
            const expectedSurface = surface === "assigned" || surface === "providers" ? "manager" : surface;
            const expectedManager = surface === "assigned" ? concept.assigned : surface === "providers" ? "providers" : null;
            const expectedNav = surface === "home" ? "home" : surface === "providers" ? "providers" : "settings";
            const issues = auditIssues(audit, { surface: expectedSurface, manager: expectedManager, nav: expectedNav });
            if (state.theme !== theme) issues.push(`effective theme=${state.theme}`);
            if (state.reducedMotion !== reducedMotion) issues.push(`effective reducedMotion=${state.reducedMotion}`);
            return issues;
          });
        }
      }
    }
  }
}

async function runManagerRoutes(concept) {
  const assignments = await driver.execute(() => window.PMSettingsDemo.store.assignedManagers(window.PMSettingsDemo.concept));
  const routeWidths = focused ? [520, 1280] : representativeWidths;
  const routeThemes = focused ? ["friendly-light"] : ["friendly-light", "friendly-dark"];
  for (const managerId of assignments) {
    for (const width of routeWidths) {
      for (const theme of routeThemes) {
        await runCase("managerRoutes", `${concept.id}:${managerId}:${theme}:${width}`, async () => {
          await driver.rect(width, 900);
          await review({ theme, reducedMotion: true, railOpen: false, chatOpen: false, resetScenario: false });
          await openSurface("assigned", managerId);
          const audit = await driver.execute(pageAuditFunction, [{ managerId }]);
          const expectedNav = ["providers", "memory", "terminal"].includes(managerId) ? managerId : "settings";
          const issues = auditIssues(audit, { surface: "manager", manager: managerId, nav: expectedNav });
          if (!locationHashMatches(audit.state, managerId)) issues.push(`route state does not name ${managerId}`);
          const hydration = audit.managerHydration?.state;
          if (hydration && !/hydrated|ready/.test(hydration)) issues.push(`manager hydration did not settle (${hydration})`);
          if (audit.state?.performance?.startup?.detailModuleLoads !== 1) issues.push(`detail module loaded ${audit.state?.performance?.startup?.detailModuleLoads} times`);
          return issues;
        });
      }
    }
  }
}

function locationHashMatches(state, managerId) {
  return state?.screen === "manager" && state?.managerId === managerId;
}

async function runManagerStateCases(concept) {
  for (const stateId of managerStates) {
    const fixtureId = `manager-state.${concept.assigned}.${stateId}`;
    await runCase("managerStates", `${concept.id}:${fixtureId}`, async () => {
      await driver.rect(1280, 900);
      await review({ theme: "friendly-dark", reducedMotion: true, resetScenario: false });
      const evidence = await driver.executeAsync(async (managerId, fixtureState) => {
        const demo = window.PMSettingsDemo;
        if (typeof demo.store.applyManagerStateFixture !== "function" || typeof demo.store.managerStateFixtures !== "function") return { missing: true };
        await demo.openManager(managerId, "overview");
        await demo.whenIdle();
        const fixtures = demo.store.managerStateFixtures(managerId);
        const applied = await demo.store.applyManagerStateFixture(fixtureState);
        await demo.whenIdle();
        await demo.settleForReview();
        const text = document.querySelector(".concept-scroll")?.innerText || "";
        const snap = demo.snapshot();
        return {
          fixtures,
          applied,
          activeFixture: snap.state.activeFixture,
          hydration: snap.state.managerHydration?.[managerId],
          state: snap.state.managerStates?.[managerId],
          itemCount: snap.genericManagers?.[managerId]?.items?.length ?? null,
          text,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2 || document.querySelector(".concept-scroll").scrollWidth > document.querySelector(".concept-scroll").clientWidth + 2
        };
      }, [concept.assigned, fixtureId], 25000);
      const issues = [];
      if (evidence.missing) return ["missing deterministic manager-state APIs"];
      if (!evidence.fixtures.some((entry) => entry.id === fixtureId)) issues.push("fixture ID is not registered");
      if (!evidence.applied || evidence.applied.id !== fixtureId || evidence.activeFixture !== fixtureId) issues.push("fixture was not applied by exact ID");
      const expectations = {
        loading: /loading|queued|not loaded/i,
        empty: /no (?:matching )?resources|no .* configured|empty/i,
        error: /error|failed/i,
        offline: /offline.*cached|cached.*offline|cached values remain/i,
        unavailable: /unavailable|required capability/i,
        managed_inherited: /managed|inherited/i,
        requested_effective: /requested.*effective|effective.*requested/i,
        degraded: /degraded|cached values remain|named deterministic limitation/i
      };
      if (!expectations[stateId].test(evidence.text)) issues.push(`visible UI does not project ${stateId}`);
      if (stateId === "empty" && evidence.itemCount !== 0) issues.push(`empty fixture retained ${evidence.itemCount} items`);
      if (["offline", "degraded"].includes(stateId) && evidence.itemCount === 0) issues.push(`${stateId} fixture lost cached values`);
      if (evidence.overflow) issues.push("manager state caused horizontal overflow");
      return issues;
    });
  }
}

async function runProviderPolicy(concept) {
  await runCase("providerPolicy", `${concept.id}: policy and explicit setup`, async () => {
    await openSurface("providers", concept.assigned);
    const result = await driver.executeAsync(async () => {
      const demo = window.PMSettingsDemo;
      const store = demo.store;
      const policyModule = await import("./_shared/manager-data.mjs");
      const policy = policyModule.PROVIDER_CLI_ACQUISITION_POLICY;
      const continuation = policyModule.PROVIDER_SETUP_CONTINUATION_FIXTURE;
      const initiators = ["Project", "Goal", "Plan", "model", "provider", "agent", "Auto", "On"];
      const demand = initiators.map((initiator, index) => {
        const projection = store.providerSetupFromDemand("openai", {
          hostRef: "host-fixture",
          hostLabel: "Build workstation",
          environmentRef: "environment-native",
          environmentLabel: "Native environment",
          officialSource: "Official OpenAI source",
          continuationToken: `continuation-${index}`,
          continuationRevision: 1,
          initiator
        });
        return { initiator, projection };
      });
      const setup = store.requireProviderSetup("openai", {
        hostRef: "host-fixture",
        hostLabel: "Build workstation",
        environmentRef: "environment-native",
        environmentLabel: "Native environment",
        officialSource: "Official OpenAI source",
        continuationToken: continuation.continuation.token,
        continuationRevision: continuation.continuation.revision
      });
      const beforeConsentInstall = store.advanceProviderSetup("install");
      const consent = store.advanceProviderSetup("consent");
      const installing = store.advanceProviderSetup("install");
      const installed = store.advanceProviderSetup("install-complete", { ok: true, result_refs: ["verified-installation"], receipt_refs: ["install-receipt"] });
      const authenticating = store.advanceProviderSetup("authenticate");
      const readyState = store.advanceProviderSetup("authentication-complete", { ok: true });
      const stale = store.advanceProviderSetup("resume", { continuationToken: continuation.staleRejectionFixture.presentedToken, continuationRevision: continuation.staleRejectionFixture.presentedRevision });
      const resumed = store.advanceProviderSetup("resume", { continuationToken: continuation.continuation.token, continuationRevision: continuation.continuation.revision });
      await demo.whenIdle();
      const normal = document.querySelector(".installation-board")?.cloneNode(true);
      normal?.querySelectorAll("details:not([open]) > :not(summary), .technical-identity").forEach((node) => node.remove());
      const normalText = normal?.innerText || normal?.textContent || "";
      const advanced = document.querySelector(".installation-board details.technical-identity, .installation-board details[data-advanced-details]");
      const setupAdvanced = document.querySelector(".provider-setup-required details.technical-identity");
      return { policy, continuation, demand, setup, beforeConsentInstall, consent, installing, installed, authenticating, readyState, stale, resumed, normalText, advancedSummary: advanced?.querySelector("summary")?.innerText || null, advancedOpen: advanced?.open ?? null, advancedText: advanced?.innerText || advanced?.textContent || "", setupAdvancedSummary: setupAdvanced?.querySelector("summary")?.innerText || null, setupAdvancedOpen: setupAdvanced?.open ?? null, setupAdvancedText: setupAdvanced?.innerText || setupAdvanced?.textContent || "" };
    }, [], 30000);
    const issues = [];
    const policyText = JSON.stringify(result.policy || {});
    for (const phrase of ["no Puppet Master core bundle", "no preseed", "explicit initial Setup/Install only", "exact selected Host/Environment", "official source", "install and auth separate", "maintenance_of_previously_approved_installation_only"]) {
      if (!policyText.includes(phrase)) issues.push(`policy fixture missing “${phrase}”`);
    }
    for (const entry of result.demand || []) {
      if (entry.projection?.demand_result !== "Setup Required" || entry.projection?.acquisition_started !== false || entry.projection?.initial_consent_recorded) issues.push(`${entry.initiator} demand did not stop at Setup Required`);
    }
    if (!/Build workstation.*Native environment/.test(result.setup?.target || "")) issues.push("setup does not show human Host/Environment");
    if (result.setup?.official_source !== "Official OpenAI source") issues.push("setup does not retain the official source");
    if (result.setup?.setup_deep_link !== "settings://providers/openai/installations/host-fixture/environment-native") issues.push(`Setup Required deep link=${result.setup?.setup_deep_link || "missing"}`);
    if (!result.normalText.includes("Providers → OpenAI → Installations")) issues.push("human Setup Required destination is not visible");
    if (result.normalText.includes("settings://providers/openai/installations/host-fixture/environment-native")) issues.push("normal Setup Required card exposes its internal route");
    if (!/Advanced Details/i.test(result.setupAdvancedSummary || "") || result.setupAdvancedOpen !== false || !result.setupAdvancedText.includes("settings://providers/openai/installations/host-fixture/environment-native")) issues.push("internal Setup Required route is not gated by closed Advanced Details");
    if (result.beforeConsentInstall !== false) issues.push("installation started without explicit consent");
    if (!result.consent?.initial_consent_recorded || result.installing?.installation !== "installing") issues.push("explicit consent gate did not unlock installation");
    if (result.installed?.installation !== "ready" || result.installed?.authentication !== "not_started") issues.push("installation completion incorrectly implied authentication");
    if (!result.installed?.post_consent_maintenance_allowed) issues.push("post-consent maintenance was not enabled for a verified install");
    if (result.authenticating?.authentication !== "in_progress" || result.readyState?.authentication !== "ready") issues.push("separate authentication flow did not settle");
    if (result.stale !== false) issues.push("stale continuation was accepted");
    if (!result.resumed?.resumed || !result.resumed?.current) issues.push("current continuation did not resume");
    if (!/No provider CLI is bundled.*default execution baseline.*pre-seeded/is.test(result.normalText)) issues.push("normal provider UI omits the no-bundle/no-baseline/no-preseed rule");
    if (!/Project, Goal, Plan, WorkNode, model, provider, agent, or Auto\/On policy cannot silently acquire/i.test(result.normalText)) issues.push("normal provider UI omits the negative silent-acquisition initiators");
    if (!/Auto\/On may only maintain an installation that was already approved/i.test(result.normalText)) issues.push("normal provider UI omits the post-consent maintenance boundary");
    if (/\/(?:Users|home|tmp|mnt|usr|var)\/|[A-Za-z]:\\|\b(?:npm|pnpm|brew|winget|apt|dnf|snap)\s+(?:install|add)\b|\b(?:sha256|hash)\s*[:=]/i.test(result.normalText)) issues.push("normal provider UI exposes raw path, command, package, or hash evidence");
    if (!/Advanced Details/i.test(result.advancedSummary || "")) issues.push("technical provider identity is not gated by Advanced Details");
    if (result.advancedOpen !== false) issues.push("Advanced Details was not closed by default");
    if (!/Configured path or alias|Resolved launcher|Actual executable|Package alias|Hash evidence|Installation identity/i.test(result.advancedText)) issues.push("Advanced Details lacks technical identity evidence");
    return issues;
  });

  await runCase("providerPolicy", `${concept.id}: 100-installation bounded mount`, async () => {
    const result = await driver.executeAsync(async () => {
      const demo = window.PMSettingsDemo;
      await demo.openManager("providers", "installations", { resourceId: "openai" });
      await demo.whenIdle();
      const fixtures = await import("./_shared/manager-data.mjs");
      const scale = fixtures.buildProviderInstallationScaleFixture(100);
      const provider = demo.store.provider("openai");
      provider.installations = scale.summaryRows;
      demo.store.state.selectedInstallationId = scale.summaryRows[0].id;
      demo.store.emit({ action: "provider-select", scopes: ["provider", "manager", "view"], motionKey: "none" });
      await demo.whenIdle();
      const list = document.querySelector(".installation-list[data-list-total]");
      return { fixtureId: scale.fixtureId, total: Number(list?.dataset.listTotal), mounted: Number(list?.dataset.listMounted), domRows: list?.querySelectorAll(".installation-row").length || 0 };
    }, [], 25000);
    const issues = [];
    if (result.fixtureId !== "provider-installation-scale-100") issues.push(`wrong deterministic fixture ID ${result.fixtureId}`);
    if (result.total !== 100) issues.push(`list total=${result.total}`);
    if (result.mounted > 40 || result.domRows > 40) issues.push(`mounted=${result.mounted}, DOM rows=${result.domRows}`);
    return issues;
  });
}

async function runRuntimePerformance(concept) {
  await runCase("runtimePerformance", `${concept.id}: durable persistence debounce`, async () => {
    const result = await driver.executeAsync(async () => {
      const demo = window.PMSettingsDemo;
      const store = demo.store;
      if (typeof store.persistenceStats !== "function") return { missing: true };
      const editable = [...store.settings.values()].find((entry) => entry.id === "experience.startup.recovery") || [...store.settings.values()].find((entry) => entry.type === "toggle" && entry.available !== false && !entry.managedReason);
      if (!editable) return { missingEditable: true };
      const writesBeforeEdits = store.persistenceStats().writes;
      for (let index = 0; index < 25; index += 1) {
        const value = editable.type === "toggle" ? Boolean(index % 2) : index % 2 ? "Ask first" : "Automatic";
        store.updateSetting(editable.id, value);
      }
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 1200));
      const writesAfterEdits = store.persistenceStats().writes;
      return { writesEdits: writesAfterEdits - writesBeforeEdits };
    }, [], 30000);
    const issues = [];
    if (result.missing) return ["missing persistence performance API"];
    if (result.missingEditable) return ["no durable editable setting is available"];
    if (result.writesEdits > 2) issues.push(`25 durable edits caused ${result.writesEdits} writes`);
    return issues;
  });

  await runCase("runtimePerformance", `${concept.id}: lazy manager, generations and release`, async () => {
    const result = await driver.executeAsync(async (first, second) => {
      const demo = window.PMSettingsDemo;
      const store = demo.store;
      await demo.openHome();
      await demo.whenIdle();
      const homeBefore = store.performanceTelemetry();
      if (typeof store.applyManagerStateFixture !== "function") return { missing: true };
      await store.applyManagerStateFixture(`manager-state.${first}.loading`);
      await store.applyManagerStateFixture(`manager-state.${second}.loading`);
      void demo.openManager(first, "overview");
      void demo.openManager(second, "overview");
      await demo.whenIdle();
      const afterSwitch = store.performanceTelemetry();
      const stateAfterSwitch = demo.snapshot().state;
      const loadWork = store.observableWork.list((entry) => entry.owner_domain === "settings-manager-projection");
      await demo.openHome();
      await demo.whenIdle();
      const afterHome = store.performanceTelemetry();
      return { homeBefore, afterSwitch, stateAfterSwitch, afterHome, loadWork };
    }, [concept.assigned, "providers"], 30000);
    const issues = [];
    if (result.missing) return ["missing deterministic manager-state API for cold switching"];
    if (result.homeBefore?.subscriptions?.heavy_key_count !== 0) issues.push("Home began with a heavy subscription");
    if (result.afterSwitch?.subscriptions?.heavy_key_count > 1) issues.push("more than one selected-manager heavy subscription remained");
    if (result.stateAfterSwitch?.managerId !== "providers") issues.push(`rapid switch settled on ${result.stateAfterSwitch?.managerId}`);
    if (!/hydrated|ready/.test(result.stateAfterSwitch?.managerHydration?.providers?.state || "")) issues.push(`latest manager generation settled as ${result.stateAfterSwitch?.managerHydration?.providers?.state || "missing"}`);
    const firstLoads = (result.loadWork || []).filter((entry) => entry.object_refs?.includes(`manager:${concept.assigned}`));
    const secondLoads = (result.loadWork || []).filter((entry) => entry.object_refs?.includes("manager:providers"));
    if (!firstLoads.some((entry) => entry.state === "cancelled")) issues.push("superseded manager generation was not recorded as cancelled");
    if (!secondLoads.some((entry) => entry.state === "completed")) issues.push("latest manager generation was not recorded as completed");
    if (result.afterSwitch?.startup?.detailModuleLoads !== 1) issues.push(`rapid switching re-imported detail module (${result.afterSwitch?.startup?.detailModuleLoads})`);
    if (result.afterHome?.subscriptions?.heavy_key_count !== 0) issues.push("leaving manager for Home did not release heavy subscription");
    return issues;
  });

  for (const profile of performanceProfiles) {
    await runCase("runtimePerformance", `${concept.id}: projection ${profile}`, async () => {
      const result = await driver.executeAsync(async (profileId, managerId) => {
        const demo = window.PMSettingsDemo;
        const store = demo.store;
        await store.applyManagerStateFixture(`manager-state.${managerId}.managed_inherited`);
        await demo.openManager(managerId, "overview");
        await demo.whenIdle();
        const retainedTitle = store.managerInventory(managerId)?.items?.[0]?.title || null;
        const controlsBefore = [...document.querySelectorAll(".concept-scroll button, .concept-scroll input, .concept-scroll select")].filter((entry) => !entry.disabled).length;
        const settingsBefore = store.settings.size;
        const projection = store.applyPerformanceProfile(profileId);
        await demo.whenIdle();
        const controlsAfter = [...document.querySelectorAll(".concept-scroll button, .concept-scroll input, .concept-scroll select")].filter((entry) => !entry.disabled).length;
        const visibleText = document.querySelector(".concept-scroll")?.innerText || "";
        return { projection, settingsBefore, settingsAfter: store.settings.size, controlsBefore, controlsAfter, retainedTitle, retainedVisible: retainedTitle ? visibleText.includes(retainedTitle) : false };
      }, [profile, concept.assigned], 20000);
      const issues = [];
      if (result.projection?.profile !== profile || result.projection?.hardwareCertified !== false || result.projection?.simulated !== true) issues.push("profile is not an honest deterministic projection");
      if (!result.projection?.policy || result.projection.policy.speculativePrewarm !== false) issues.push("profile lacks bounded policy projection");
      if (["low-memory", "offline", "slow-network", "metered", "thermal", "legacy"].includes(profile) && result.projection.policy.retainCachedContent === false) issues.push("profile discarded cached content");
      if (result.settingsAfter !== result.settingsBefore || result.controlsAfter === 0) issues.push("profile removed settings or controls");
      if (!result.retainedTitle || !result.retainedVisible) issues.push("profile failed to preserve the selected manager's cached value projection");
      return issues;
    });
  }

  await runCase("runtimePerformance", `${concept.id}: ObservableWork truth`, async () => {
    const result = await driver.execute(() => {
      const store = window.PMSettingsDemo.store;
      const named = ["queued", "waiting_network", "waiting_resource", "degraded", "stalled", "cancelled"].map((id) => store.observableWorkFixture(id));
      const completed = store.observableWork.create({ operation_id: `fixture-completed-${store.conceptId}`, title: "Completed fixture", human_phase: "Completed", state: "completed", progress_kind: "none", progress_source: "unknown", can_cancel: false, generation: 1 });
      const records = [...named, completed];
      return records.map((entry) => ({ state: entry?.state, percentageLeak: (entry?.progress_kind !== "determinate" || !Number.isFinite(entry?.total) || entry.total <= 0) && (Object.hasOwn(entry || {}, "percentage") || Object.hasOwn(entry || {}, "percent")), completed: entry?.completed, total: entry?.total }));
    });
    const states = new Set(result.map((entry) => entry.state));
    const issues = [];
    for (const state of ["queued", "waiting_network", "waiting_resource", "degraded", "stalled", "cancelled", "completed"]) if (!states.has(state)) issues.push(`missing ${state}`);
    if (result.some((entry) => entry.percentageLeak)) issues.push("percentage exposed without a trustworthy denominator");
    return issues;
  });

  await runCase("runtimePerformance", `${concept.id}: narrow render instrumentation`, async () => {
    await driver.rect(520, 900);
    const result = await driver.executeAsync(async () => {
      const demo = window.PMSettingsDemo;
      if (typeof demo.renderStats !== "function" || typeof demo.resetRenderStats !== "function") return { missing: true };
      demo.resetRenderStats();
      await demo.openHome();
      await demo.openCategory("experience");
      await demo.whenIdle();
      return demo.renderStats();
    }, [], 20000);
    const issues = [];
    if (result.missing) return ["PMSettingsDemo renderStats/resetRenderStats API is absent"];
    if (result.kind !== "concept-only-render-instrumentation") issues.push(`render stats kind=${result.kind}`);
    if (result.full_scene_commits > 2) issues.push(`narrow navigation caused ${result.full_scene_commits} full-scene commits`);
    if (!String(result.disclaimer || "").includes("not native Slint")) issues.push("render stats boundary is missing");
    return issues;
  });
}

async function installMotionWitness() {
  return driver.execute(() => {
    window.__pmFirefoxMotionWitness = [];
    window.__pmFirefoxMotionCancelled = 0;
    if (Element.prototype.__pmFirefoxMotionWrapped) return true;
    const nativeAnimate = Element.prototype.animate;
    if (!nativeAnimate) return false;
    Object.defineProperty(Element.prototype, "__pmFirefoxMotionWrapped", { value: true });
    Element.prototype.animate = function wrappedAnimation(keyframes, options = {}) {
      const frames = Array.isArray(keyframes) ? keyframes : [keyframes || {}];
      const properties = [...new Set(frames.flatMap((frame) => Object.keys(frame).filter((key) => !["offset", "easing", "composite"].includes(key))))];
      const normalized = typeof options === "number" ? { duration: options } : options || {};
      const record = { roles: String(this.dataset?.motionRole || "").split(/\s+/).filter(Boolean), properties, duration: Number(normalized.duration || 0), iterations: Number(normalized.iterations || 1), cancelled: false };
      window.__pmFirefoxMotionWitness.push(record);
      const animation = nativeAnimate.call(this, keyframes, options);
      animation.addEventListener("cancel", () => {
        record.cancelled = true;
        window.__pmFirefoxMotionCancelled += 1;
      }, { once: true });
      return animation;
    };
    return true;
  });
}

async function runMotion(concept) {
  await runCase("motion", `${concept.id}: semantic motion kinds`, async () => {
    const wrapped = await installMotionWitness();
    if (!wrapped) return ["Element.animate is unavailable"];
    const result = await driver.executeAsync(async (kinds) => {
      const demo = window.PMSettingsDemo;
      const store = demo.store;
      await demo.applyReviewState({ theme: "friendly-dark", reducedMotion: false, resetScenario: false });
      await demo.openHome();
      await demo.whenIdle();
      const out = [];
      for (const kind of kinds) {
        window.__pmFirefoxMotionWitness = [];
        if (kind === "navigate") await demo.openCategory("experience");
        if (kind === "category") { await demo.openCategory("experience"); await demo.openCategory("intelligence"); }
        if (kind === "search") store.setSearch("theme", true, store.state.search.surface);
        if (kind === "jump" || kind === "scrollspy") {
          await demo.openCategory("experience");
          const ids = [...document.querySelectorAll("[data-subcategory]")].map((entry) => entry.dataset.subcategory);
          store.setSubcategory(ids[1] || ids[0], kind);
        }
        if (kind === "disclosure") { await demo.openCategory("experience"); store.setAdvancedSection("experience:appearance-input", true); }
        if (kind === "refresh") { await demo.openManager("providers", "models", { resourceId: "openai" }); await demo.whenIdle(); await store.refreshProvider("openai"); }
        if (kind === "save") store.updateSetting("experience.startup.recovery", "Ask first");
        if (kind === "reorder") {
          await demo.openManager("providers", "models", { resourceId: "openai" }); await demo.whenIdle();
          const model = store.providers.flatMap((provider) => provider.models || []).find((entry) => store.canMoveModel(entry.id, 1) || store.canMoveModel(entry.id, -1));
          if (model) store.moveModel(model.id, store.canMoveModel(model.id, 1) ? 1 : -1);
        }
        if (kind === "drawer") { await demo.openCategory("experience"); store.setNavigationOpen(true); }
        if (kind === "transaction") store.startFlow("generic", { managerId: store.state.managerId || "providers" });
        if (kind === "preview") { store.previewTheme("basic-light"); store.revertThemePreview(); }
        await demo.whenIdle();
        await demo.settleForReview();
        const calls = [...window.__pmFirefoxMotionWitness];
        out.push({ kind, snapshot: demo.motionSnapshot(), calls, running: document.getAnimations().filter((entry) => entry.playState === "running").length });
      }
      return out;
    }, [semanticMotionKinds], 60000);
    const issues = [];
    for (const item of result) {
      if (item.snapshot?.kind !== item.kind) issues.push(`${item.kind} reported ${item.snapshot?.kind || "no kind"}`);
      if (!item.calls.length) issues.push(`${item.kind} produced no witnessed animation`);
      if (item.running) issues.push(`${item.kind} left ${item.running} running animation(s)`);
      for (const call of item.calls) {
        if (!Number.isFinite(call.duration) || call.duration <= 0 || call.duration > 1000 || call.iterations !== 1) issues.push(`${item.kind} has non-finite/unbounded timing`);
        if (call.properties.some((property) => forbiddenLayoutAnimationProperties.has(property))) issues.push(`${item.kind} animates a layout property: ${call.properties.join(",")}`);
      }
    }
    return issues;
  });

  await runCase("motion", `${concept.id}: reversal and reduced parity`, async () => {
    await installMotionWitness();
    const result = await driver.executeAsync(async () => {
      const demo = window.PMSettingsDemo;
      await demo.applyReviewState({ reducedMotion: false, resetScenario: false });
      window.__pmFirefoxMotionWitness = [];
      window.__pmFirefoxMotionCancelled = 0;
      void demo.openCategory("experience");
      await new Promise((resolvePromise) => requestAnimationFrame(() => requestAnimationFrame(resolvePromise)));
      void demo.openCategory("intelligence");
      await new Promise((resolvePromise) => requestAnimationFrame(resolvePromise));
      void demo.openCategory("safety");
      await demo.whenIdle();
      await demo.settleForReview();
      const full = demo.snapshot().state;
      const fullRunning = document.getAnimations().filter((entry) => entry.playState === "running").length;
      const cancelled = window.__pmFirefoxMotionCancelled;
      await demo.applyReviewState({ reducedMotion: true, resetScenario: false });
      await demo.openCategory("safety");
      await demo.whenIdle();
      await demo.settleForReview();
      const reduced = demo.snapshot().state;
      return { full, reduced, cancelled, fullRunning, reducedRunning: document.getAnimations().filter((entry) => entry.playState === "running").length };
    }, [], 30000);
    const issues = [];
    if (result.full.categoryId !== "safety") issues.push(`rapid switch settled on ${result.full.categoryId}`);
    if (result.cancelled < 1) issues.push("rapid reversal did not cancel a superseded animation");
    if (result.fullRunning || result.reducedRunning) issues.push(`residual animations full=${result.fullRunning} reduced=${result.reducedRunning}`);
    if (result.full.categoryId !== result.reduced.categoryId || result.reduced.reducedMotion !== true) issues.push("reduced motion changed semantic final state");
    return issues;
  });

  if (concept.id === "switchboard") {
    await runCase("motion", `${concept.id}: sound-wave clocks stop`, async () => {
      const result = await driver.executeAsync(async () => {
        const demo = window.PMSettingsDemo;
        await demo.openManager("notifications-sounds", "overview");
        await demo.whenIdle();
        const inventory = demo.store.managerInventory("notifications-sounds");
        const sound = inventory?.items?.find((entry) => (entry.actions || []).some((action) => /preview locally/i.test(action)));
        if (sound) demo.store.previewSound(sound.id);
        await demo.whenIdle();
        demo.store.stopSoundPreview();
        await demo.openHome();
        await demo.whenIdle();
        await demo.settleForReview();
        const waves = [...document.querySelectorAll(".sound-wave")];
        return { found: Boolean(sound), state: demo.snapshot().state.soundPreview?.state || null, running: waves.flatMap((node) => node.getAnimations({ subtree: true })).filter((entry) => entry.playState === "running").length };
      }, [], 25000);
      const issues = [];
      if (!result.found) issues.push("no deterministic sound-preview resource found");
      if (result.state === "playing" || result.running) issues.push(`hidden/stopped sound wave still running (${result.running})`);
      return issues;
    });
  }
}

async function runAccessibility(concept) {
  await runCase("accessibility", `${concept.id}: semantics, labels and focus`, async () => {
    await driver.rect(760, 900);
    await review({ theme: "basic-light", reducedMotion: true, direction: "ltr", textScale: 1, resetScenario: false });
    await openSurface("home", concept.assigned);
    const before = await driver.execute(() => {
      const visible = (element) => { const rect = element.getBoundingClientRect(); const style = getComputedStyle(element); return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden" && !element.closest("[hidden],[inert]"); };
      const controls = [...document.querySelectorAll("button,input,select,summary,a[href]")].filter(visible);
      const unlabeled = controls.filter((element) => {
        const text = (element.getAttribute("aria-label") || element.labels?.[0]?.innerText || element.innerText || element.getAttribute("title") || "").trim();
        return !text;
      }).map((element) => element.outerHTML.slice(0, 180));
      return { unlabeled, duplicateIds: [...document.querySelectorAll("[id]")].map((entry) => entry.id).filter((id, index, all) => all.indexOf(id) !== index), landmarks: { main: document.querySelectorAll("main").length, nav: document.querySelectorAll("nav").length }, focus: document.activeElement?.tagName };
    });
    await driver.keys(["\uE004"]);
    const afterTab = await driver.execute(() => ({ tag: document.activeElement?.tagName, inside: Boolean(document.activeElement?.closest(".pm-shell")), visible: Boolean(document.activeElement && document.activeElement !== document.body) }));
    await driver.executeAsync(async () => {
      await window.PMSettingsDemo.openCategory("experience");
      await window.PMSettingsDemo.whenIdle();
      window.PMSettingsDemo.store.setNavigationOpen(true);
      await window.PMSettingsDemo.whenIdle();
    });
    await driver.keys(["\uE00C"]);
    const afterEscape = await driver.execute(() => window.PMSettingsDemo.snapshot().state.navigationOpen);
    const issues = [];
    if (before.unlabeled.length) issues.push(`unlabelled controls: ${before.unlabeled.slice(0, 5).join(" | ")}`);
    if (before.duplicateIds.length) issues.push(`duplicate IDs: ${before.duplicateIds.slice(0, 8).join(", ")}`);
    if (before.landmarks.main !== 1 || before.landmarks.nav < 1) issues.push(`landmarks main=${before.landmarks.main} nav=${before.landmarks.nav}`);
    if (!afterTab.inside || !afterTab.visible) issues.push("native Tab did not move focus into the shell");
    if (afterEscape) issues.push("native Escape did not close the navigator");
    return issues;
  });

  await runCase("accessibility", `${concept.id}: RTL`, async () => {
    await review({ direction: "rtl", reducedMotion: true, resetScenario: false });
    const result = await driver.execute(() => ({ dir: document.documentElement.dir, direction: getComputedStyle(document.documentElement).direction, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2 || document.querySelector(".concept-scroll").scrollWidth > document.querySelector(".concept-scroll").clientWidth + 2 }));
    return [result.dir !== "rtl" && "document dir is not rtl", result.direction !== "rtl" && "computed direction is not rtl", result.overflow && "RTL caused overflow"];
  });
}

let fatalHarnessError = null;
sections.harness.attempted = 1;
try {
  const hub = await startHub();
  hubProcess = hub.child;
  hubPort = hub.port;
  const browserService = await startDriver();
  driverProcess = browserService.child;
  driverPort = browserService.port;
  driverOutput = browserService.output;
  driver = new W3CDriver(driverPort);
  await driver.create();
  const origin = `http://127.0.0.1:${hubPort}`;

  for (const concept of concepts) {
    await driver.navigate(`${origin}/concepts/settings-redesign-concepts/5.6%20Sol/${concept.file}`);
    const page = await ready();
    if (page.model !== "5.6 Sol" || page.concept !== concept.id) {
      rememberFailure({ section: "startup", label: `${concept.id}: identity`, issues: [`loaded model=${page.model}, concept=${page.concept}`] });
      sections.startup.attempted += 1;
      sections.startup.failed += 1;
      continue;
    }
    await runStartup(concept);
    await runRenderMatrix(concept);
    await runManagerRoutes(concept);
    await runManagerStateCases(concept);
    await runProviderPolicy(concept);
    await runRuntimePerformance(concept);
    await runMotion(concept);
    await runAccessibility(concept);
  }
} catch (error) {
  const diagnostic = driverOutput?.().trim();
  fatalHarnessError = safeError(new Error(`${error?.message || error}${diagnostic ? `\nFirefox driver output:\n${diagnostic.slice(-12000)}` : ""}`, { cause: error }));
  rememberFailure({ section: "harness", label: "browser harness", issues: [fatalHarnessError] });
} finally {
  await driver?.close().catch(() => {});
  await stopProcess(driverProcess);
  await stopProcess(hubProcess);
  let cleaned = false;
  try {
    await rm(temporaryRoot, { recursive: true, force: true });
    try { await access(temporaryRoot); }
    catch (error) { if (error?.code === "ENOENT") cleaned = true; else throw error; }
  } catch (error) {
    rememberFailure({ section: "harness", label: "temporary isolation cleanup", issues: [safeError(error)] });
  }
  if (fatalHarnessError || !cleaned) sections.harness.failed = 1;
  else sections.harness.passed = 1;

  const totals = Object.values(sections).reduce((sum, entry) => ({ attempted: sum.attempted + entry.attempted, passed: sum.passed + entry.passed, failed: sum.failed + entry.failed }), { attempted: 0, passed: 0, failed: 0 });
  const summary = {
    schema: "pm.settings.browser-verification.v2",
    generatedAt: new Date().toISOString(),
    startedAt,
    status: totals.failed === 0 ? "pass" : "fail",
    runMode: focused ? "focused-smoke" : "full-authoritative-matrix",
    environment,
    portBinding: {
      conceptHub: { host: "127.0.0.1", port: hubPort, method: hubBindingMethod },
      webdriver: { host: "127.0.0.1", port: driverPort, method: driverBindingMethod }
    },
    isolation: {
      uniqueTemporaryRoot: true,
      uniqueProfileRoot: true,
      outputInsideTemporaryRoot: true,
      cleaned,
      fixedPorts: false,
      externalPackages: false,
      productDependencyCreated: false
    },
    axes: {
      concepts: concepts.map((entry) => entry.id),
      themes,
      widths,
      reducedMotion: [false, true],
      requiredSurfaces: ["home", "workspace", "provider-installations", "assigned-manager-detail"],
      managerRepresentativeWidths: representativeWidths,
      managerThemes: ["friendly-light", "friendly-dark"],
      managerStates,
      semanticMotionKinds,
      simulatedPerformanceProfiles: performanceProfiles,
      accurateBrowserAxes: ["headless Firefox", "viewport width", "native keyboard actions", "focus", "RTL DOM direction"],
      unsupportedBrowserAxes: [
        { axis: "forced-colors OS mode", reason: "This minimal Firefox WebDriver session has no standards-based command for changing OS forced-colors state; no pass is claimed." },
        { axis: "coarse pointer hardware", reason: "This minimal Firefox WebDriver session cannot truthfully emulate physical coarse-pointer hardware; no pass is claimed." },
        { axis: "native Slint", reason: "A served browser prototype cannot certify native Slint rendering, accessibility, performance, or input behavior." }
      ]
    },
    counts: { sections, totals },
    failureDetails: failures,
    omittedFailureDetails,
    boundaries: [
      "Results are direct evidence for the served Settings browser prototypes only.",
      "Deterministic resource, network, pressure, thermal, legacy-hardware, and provider fixtures are projections, not physical-hardware or live-provider certification.",
      "Startup manager counts, bytes, and dynamic-detail import counts describe the deterministic browser fixture only; they do not measure native Slint module loading.",
      "The harness does not certify native Slint layout, rendering, motion, accessibility, startup, storage, or runtime behavior.",
      focused ? "Focused smoke mode intentionally does not execute the full declared matrix; run without --focused for authoritative counts." : "The declared full browser matrix was attempted."
    ]
  };
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  if (summary.status !== "pass") process.exitCode = 1;
}
