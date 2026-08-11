import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { homedir, tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const modelDir = resolve(here, "..");
const repoRoot = resolve(modelDir, "../../..");
const serverPath = join(repoRoot, "Concepts", "ConceptHub", "server.py");
const temporaryRoot = await mkdtemp(join(tmpdir(), "pm-settings-5-6-sol-"));
const profileDir = join(temporaryRoot, "browser-profile");
const outputDir = join(temporaryRoot, "output");
await mkdir(profileDir, { recursive: true });
await mkdir(outputDir, { recursive: true });

function loadPlaywright() {
  const candidates = [
    process.env.PM_PLAYWRIGHT_MODULE,
    ...String(process.env.NODE_PATH || "").split(":").filter(Boolean).map((directory) => join(directory, "playwright")),
    resolve(dirname(process.execPath), "..", "node_modules", "playwright"),
    join(homedir(), ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "node", "node_modules", "playwright")
  ].filter(Boolean);
  for (const candidate of candidates) {
    try { return require(candidate); } catch { /* Try the next bundled runtime. */ }
  }
  throw new Error("Playwright is unavailable. Set PM_PLAYWRIGHT_MODULE to its package directory.");
}

function startHub() {
  return new Promise((resolvePromise, reject) => {
    const child = spawn("python3", [serverPath, "--host", "127.0.0.1", "--port", "0", "--no-browser", "--no-runtime-state"], {
      cwd: repoRoot,
      env: { ...process.env, PYTHONUNBUFFERED: "1", PYTHONDONTWRITEBYTECODE: "1" },
      stdio: ["ignore", "pipe", "pipe"]
    });
    let combined = "";
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGTERM");
      reject(new Error(`ConceptHub did not report an OS-assigned port.\n${combined}`));
    }, 12000);
    const inspect = (chunk) => {
      combined += chunk.toString();
      const match = combined.match(/http:\/\/127\.0\.0\.1:(\d+)\//);
      if (!settled && match) {
        settled = true;
        clearTimeout(timer);
        resolvePromise({ child, port: Number(match[1]), output: () => combined });
      }
    };
    child.stdout.on("data", inspect);
    child.stderr.on("data", inspect);
    child.once("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    });
    child.once("exit", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new Error(`ConceptHub exited early with ${code}.\n${combined}`));
    });
  });
}

const concepts = [
  { id: "index-house", file: "concept-01-index-house.html", title: "5.6 Sol — Index House", home: ".ih-home", destination: ".ih-destination", signature: "address" },
  { id: "switchboard", file: "concept-02-switchboard.html", title: "5.6 Sol — Switchboard", home: ".sb-home", destination: ".sb-bay", signature: "signal" },
  { id: "wayfinder", file: "concept-03-wayfinder.html", title: "5.6 Sol — Wayfinder", home: ".wf-home", destination: ".wf-route", signature: "route-line" },
  { id: "ledger", file: "concept-04-ledger.html", title: "5.6 Sol — Ledger", home: ".lg-home", destination: ".lg-table-row", signature: "folio" }
];
const expectedMotionRoles = {
  "index-house": {
    navigate: ["address", "directory", "document", "inspector"], category: ["address", "document", "inspector"], search: ["search-result"], jump: ["address-marker", "section"], scrollspy: ["address-marker", "inspector-field"], disclosure: ["disclosure"], refresh: ["source", "catalogue", "evidence"], save: ["setting"], reorder: ["reorder-item"], drawer: ["drawer-backdrop", "drawer"]
  },
  switchboard: {
    navigate: ["signal", "station", "board"], category: ["signal", "station", "board"], search: ["search-result"], jump: ["signal-marker", "station"], scrollspy: ["signal-marker", "instrument"], disclosure: ["signal", "disclosure"], refresh: ["connection", "catalogue", "readiness"], save: ["instrument"], reorder: ["reorder-item"], drawer: ["drawer-backdrop", "drawer"]
  },
  wayfinder: {
    navigate: ["route-line", "waypoint", "checkpoint"], category: ["route-line", "waypoint", "checkpoint"], search: ["search-result"], jump: ["route-line", "waypoint-current", "checkpoint"], scrollspy: ["route-marker", "waypoint-current"], disclosure: ["route-branch", "disclosure"], refresh: ["checkpoint", "verify", "ready"], save: ["checkpoint"], reorder: ["waypoint"], drawer: ["route-map", "drawer"]
  },
  ledger: {
    navigate: ["folio", "rule", "ledger-row"], category: ["folio", "rule", "ledger-row"], search: ["search-result"], jump: ["rule", "ledger-row"], scrollspy: ["rule", "margin-note"], disclosure: ["ledger-detail"], refresh: ["source", "ledger-row", "effective"], save: ["ledger-row"], reorder: ["ledger-row"], drawer: ["drawer-backdrop", "outline"]
  }
};
const themes = ["friendly-dark", "friendly-light", "glass-dark", "glass-light", "retro-dark", "retro-light", "basic-dark", "basic-light"];
const widths = [760, 900, 1280, 1700, 2200, 2500];
const shellStates = [
  { railOpen: false, chatOpen: false },
  { railOpen: true, chatOpen: false },
  { railOpen: false, chatOpen: true },
  { railOpen: true, chatOpen: true }
];
const shellExtremes = [
  { railOpen: false, chatOpen: false },
  { railOpen: true, chatOpen: true }
];
const scenarioIds = [
  "normal",
  "attention",
  "calm",
  "setup",
  "loading",
  "refreshing",
  "degraded",
  "managed",
  "unavailable",
  "error",
  "usage-exhausted",
  "effective-difference"
];
const scenarioLabels = {
  normal: "Normal home",
  attention: "Needs attention",
  calm: "Calm state",
  setup: "Setup in progress",
  loading: "Loading state",
  refreshing: "Refreshing catalogues",
  degraded: "Degraded with last-known-good data",
  managed: "Managed workspace",
  unavailable: "Unavailable dependency",
  error: "Error state",
  "usage-exhausted": "Included usage exhausted",
  "effective-difference": "Requested and effective values differ"
};
const coreSurfaces = [
  { id: "home", qa: "home", open: ["openHome"] },
  { id: "workspace", qa: "workspace", open: ["openCategory", "experience"] },
  { id: "provider-models", qa: "manager", manager: "providers", open: ["openManager", "providers", "models"] },
  { id: "memory", qa: "manager", manager: "memory", open: ["openManager", "memory"] },
  { id: "terminal", qa: "manager", manager: "terminal", open: ["openManager", "terminal"] }
];
const failures = [];
let failureCount = 0;
const consoleErrors = [];
const coverage = {
  concepts: 0,
  themeStates: 0,
  responsiveStates: 0,
  coreRenderedStates: 0,
  scenarioStates: 0,
  specializedStates: 0,
  functionalFlows: 0,
  motionFlows: 0,
  motionMoments: 0,
  comparisonFrames: 0,
  coarsePointerStates: 0
};
let hubProcess;
let context;
let touchContext;

function check(condition, message) {
  if (!condition) {
    failureCount += 1;
    if (failures.length < 300) failures.push(message);
  }
}

function watchPage(page) {
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(`${page.url()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => consoleErrors.push(`${page.url()}: ${error.message}`));
}

async function waitForDemo(page) {
  await page.waitForFunction(() => Boolean(window.PMSettingsDemo?.whenIdle), null, { timeout: 15000 });
  await page.evaluate(() => window.PMSettingsDemo.whenIdle());
}

async function applyReview(page, values) {
  await page.evaluate(async (state) => {
    await window.PMSettingsDemo.applyReviewState(state);
    await window.PMSettingsDemo.whenIdle();
  }, values);
}

async function applyMatrixReview(page, values) {
  await page.evaluate(async (state) => {
    window.PMSettingsDemo.applyReviewState(state);
    await window.PMSettingsDemo.settleForReview();
  }, values);
}

async function openMatrixSurface(page, surface) {
  await page.evaluate(async ({ method, values }) => {
    window.PMSettingsDemo[method](...values);
    await window.PMSettingsDemo.settleForReview();
  }, { method: surface.open[0], values: surface.open.slice(1) });
}

async function demo(page, method, ...args) {
  return page.evaluate(async ({ methodName, values }) => {
    const result = await window.PMSettingsDemo[methodName](...values);
    await window.PMSettingsDemo.whenIdle();
    return { result, snapshot: window.PMSettingsDemo.snapshot() };
  }, { methodName: method, values: args });
}

async function idle(page) {
  await page.evaluate(() => window.PMSettingsDemo.whenIdle());
}

async function clearMotionWitness(page) {
  await page.evaluate(() => { window.__pmMotionWitness = []; });
}

async function motionEvidence(page) {
  return page.evaluate(() => ({
    snapshot: window.PMSettingsDemo.motionSnapshot(),
    calls: (window.__pmMotionWitness || []).map((entry) => ({ ...entry }))
  }));
}

function assertMotionEvidence(evidence, concept, kind) {
  const expected = expectedMotionRoles[concept.id][kind];
  check(evidence.snapshot?.kind === kind, `${concept.title}: expected ${kind} motion, found ${evidence.snapshot?.kind || "none"}.`);
  for (const role of expected) {
    check(Number(evidence.snapshot?.roles?.[role] || 0) > 0, `${concept.title}: ${kind} did not select ${role}.`);
    check(evidence.calls.some((entry) => entry.roles.includes(role)), `${concept.title}: ${kind} selected ${role} but did not execute WAAPI on it.`);
  }
  check(evidence.calls.length > 0, `${concept.title}: ${kind} produced no witnessed WAAPI call.`);
  check(evidence.calls.every((entry) => entry.duration >= 70 && entry.duration <= 500 && entry.iterations === 1 && entry.properties.every((property) => ["opacity", "transform"].includes(property))), `${concept.title}: ${kind} exceeded finite transform/opacity motion bounds.`);
  coverage.motionMoments += 1;
}

async function layoutAudit(page) {
  return page.evaluate(() => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (element.closest("[inert], [aria-hidden='true']")) return false;
      const closedDetails = element.closest("details:not([open])");
      if (closedDetails && element !== closedDetails.querySelector(":scope > summary") && !element.closest(":scope > summary")) return false;
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const colorCanvas = document.createElement("canvas");
    colorCanvas.width = colorCanvas.height = 1;
    const colorContext = colorCanvas.getContext("2d", { willReadFrequently: true });
    const colorCache = new Map();
    const parse = (value) => {
      const key = String(value || "transparent");
      if (colorCache.has(key)) return colorCache.get(key);
      colorContext.clearRect(0, 0, 1, 1);
      colorContext.fillStyle = "rgba(0, 0, 0, 0)";
      colorContext.fillStyle = key;
      colorContext.fillRect(0, 0, 1, 1);
      const pixel = colorContext.getImageData(0, 0, 1, 1).data;
      const result = [pixel[0], pixel[1], pixel[2], pixel[3] / 255];
      colorCache.set(key, result);
      return result;
    };
    const composite = (foreground, background) => {
      const alpha = foreground[3] + background[3] * (1 - foreground[3]);
      if (!alpha) return [0, 0, 0, 0];
      return [
        (foreground[0] * foreground[3] + background[0] * background[3] * (1 - foreground[3])) / alpha,
        (foreground[1] * foreground[3] + background[1] * background[3] * (1 - foreground[3])) / alpha,
        (foreground[2] * foreground[3] + background[2] * background[3] * (1 - foreground[3])) / alpha,
        alpha
      ];
    };
    const luminance = (rgb) => {
      const channels = rgb.map((part) => {
        const value = part / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    };
    const contrast = (a, b) => {
      const first = luminance(a);
      const second = luminance(b);
      return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
    };
    const effectiveBackground = (element) => {
      let current = element;
      let result = [0, 0, 0, 0];
      while (current) {
        result = composite(result, parse(getComputedStyle(current).backgroundColor));
        if (result[3] > 0.995) return result;
        current = current.parentElement;
      }
      return composite(result, [255, 255, 255, 1]);
    };
    const keyText = [...document.querySelectorAll("h1, h2, h3, p, label, button, input, select, .status-label")]
      .filter(visible)
      .slice(0, 180);
    const lowContrast = keyText.filter((element) => {
      const style = getComputedStyle(element);
      const size = parseFloat(style.fontSize);
      const weight = parseInt(style.fontWeight, 10) || 400;
      const large = size >= 24 || size >= 18.66 && weight >= 700;
      const copy = element.cloneNode(true);
      copy.querySelectorAll?.("svg, .sr-only").forEach((node) => node.remove());
      const iconOnly = !copy.textContent.trim();
      const background = effectiveBackground(element);
      const foreground = composite(parse(style.color), background);
      return contrast(foreground, background) < (large || iconOnly ? 2.95 : 4.4);
    }).map((element) => `${element.tagName}:${element.textContent.trim().slice(0, 32)}`);
    const essential = [...document.querySelectorAll(".view p, .view label, .view button, .view input, .view select, .setting-title, .setting-description")].filter(visible);
    const smallText = essential.filter((element) => {
      const size = parseFloat(getComputedStyle(element).fontSize);
      if (element.matches(".setting-title, .setting-description")) return size < 13.8;
      return size < 11.8;
    }).map((element) => `${element.tagName}:${getComputedStyle(element).fontSize}:${element.textContent.trim().slice(0, 28)}`);
    const invalidGeometry = [...document.querySelectorAll("h1, h2, button, input, select, [role='tab'], [role='option']")].filter(visible).filter((element) => {
      const rect = element.getBoundingClientRect();
      return ![rect.x, rect.y, rect.width, rect.height].every(Number.isFinite) || rect.width < 1 || rect.height < 1;
    }).length;
    const splitWords = essential.filter((element) => ["break-all", "break-word"].includes(getComputedStyle(element).wordBreak)).map((element) => element.textContent.trim().slice(0, 28));
    const shell = document.querySelector(".pm-shell");
    const scroller = document.querySelector(".concept-scroll");
    const rail = document.querySelector(".project-rail");
    const chat = document.querySelector(".assistant-panel");
    const snapshot = window.PMSettingsDemo.snapshot();
    const unwired = [...document.querySelectorAll(".concept-scroll button:not(:disabled)")].filter((button) => {
      const dataset = button.dataset;
      return !Object.keys(dataset).some((key) => [
        "home", "category", "manager", "destination", "subcategory", "navToggle", "navDismiss", "inspectorToggle", "inspectorDismiss", "settingToggle", "settingReset", "settingInherit", "settingAction", "resetCategory", "searchResult", "managerTab", "provider", "accountSelect", "accountUse", "providerRefresh", "providerAction", "providerUsageHandoff", "modelFavorite", "modelMove", "memory", "memorySave", "memoryVerify", "memoryPin", "memoryDiscard", "memoryRestore", "memoryUndo", "memoryRebuild", "terminal", "terminalApply", "terminalReset", "terminalDiagnostics", "terminalKeep", "terminalDiscardSwitch", "spell", "receiptDismiss", "genericAction", "genericInspect", "managerItemAction", "managerResource", "drillBack"
      ].includes(key));
    }).map((button) => button.textContent.trim().slice(0, 44));
    return {
      rootOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      bodyOverflow: document.body.scrollWidth > document.body.clientWidth + 2,
      bodyCompetingScroll: document.body.scrollHeight > document.body.clientHeight + 3,
      canvasOverflow: scroller.scrollWidth > scroller.clientWidth + 2,
      shellOverflowX: getComputedStyle(shell).overflowX,
      shellHeight: shell.getBoundingClientRect().height,
      viewportHeight: innerHeight,
      bodyFontSize: parseFloat(getComputedStyle(document.body).fontSize),
      mainWidth: document.querySelector(".concept-main").getBoundingClientRect().width,
      invalidGeometry,
      lowContrast,
      smallText,
      splitWords,
      unwired,
      railInert: rail.inert,
      chatInert: chat.inert,
      railOpen: snapshot.state.railOpen,
      chatOpen: snapshot.state.chatOpen,
      runningAnimations: document.getAnimations().filter((animation) => animation.playState === "running").length,
      rawInternalLabel: [...document.querySelectorAll("h1,h2,h3,button,label")].filter(visible).some((element) => /\b[a-z]+_[a-z_]+\b/.test(element.textContent)),
      emoji: /\p{Extended_Pictographic}/u.test(document.body.innerText)
    };
  });
}

function assertLayout(audit, label) {
  check(!audit.rootOverflow, `${label}: root horizontal overflow`);
  check(!audit.bodyOverflow, `${label}: body horizontal overflow`);
  check(!audit.bodyCompetingScroll, `${label}: body competes with the bounded Settings scroller`);
  check(!audit.canvasOverflow, `${label}: Settings canvas horizontal overflow`);
  check(["hidden", "clip"].includes(audit.shellOverflowX), `${label}: shell does not contain overlay geometry (${audit.shellOverflowX})`);
  check(Math.abs(audit.shellHeight - audit.viewportHeight) <= 2, `${label}: shell is not 100dvh (${audit.shellHeight}/${audit.viewportHeight})`);
  check(audit.bodyFontSize >= 15.8, `${label}: body type floor is ${audit.bodyFontSize}px`);
  check(audit.mainWidth > 220, `${label}: main workspace collapsed (${audit.mainWidth}px)`);
  check(audit.invalidGeometry === 0, `${label}: ${audit.invalidGeometry} essential controls have invalid geometry`);
  check(audit.lowContrast.length === 0, `${label}: key text contrast failures: ${audit.lowContrast.slice(0, 5).join(", ")}`);
  check(audit.smallText.length === 0, `${label}: essential text below floor: ${audit.smallText.slice(0, 5).join(", ")}`);
  check(audit.splitWords.length === 0, `${label}: split-word styling on ${audit.splitWords.slice(0, 5).join(", ")}`);
  check(audit.unwired.length === 0, `${label}: enabled buttons without an observable handler: ${audit.unwired.slice(0, 8).join(", ")}`);
  check(audit.railInert === !audit.railOpen, `${label}: project rail inert state diverged`);
  check(audit.chatInert === !audit.chatOpen, `${label}: Assistant panel inert state diverged`);
  check(!audit.rawInternalLabel, `${label}: raw underscored internal label is visible`);
  check(!audit.emoji, `${label}: emoji is visible instead of SVG/iconography`);
}

async function stopProcess(child) {
  if (!child || child.exitCode !== null) return;
  child.kill("SIGTERM");
  await new Promise((resolvePromise) => {
    const timer = setTimeout(() => {
      if (child.exitCode === null) child.kill("SIGKILL");
      resolvePromise();
    }, 1600);
    child.once("exit", () => {
      clearTimeout(timer);
      resolvePromise();
    });
  });
}

try {
  const { chromium } = loadPlaywright();
  const hub = await startHub();
  hubProcess = hub.child;
  const origin = `http://127.0.0.1:${hub.port}`;
  context = await chromium.launchPersistentContext(profileDir, {
    headless: true,
    viewport: { width: 1280, height: 900 },
    reducedMotion: "no-preference",
    locale: "en-US"
  });
  await context.addInitScript(() => {
    window.__pmMotionWitness = [];
    const nativeAnimate = Element.prototype.animate;
    if (!nativeAnimate || Element.prototype.__pmMotionWrapped) return;
    Object.defineProperty(Element.prototype, "__pmMotionWrapped", { value: true });
    Element.prototype.animate = function patchedAnimate(keyframes, options = {}) {
      const frames = Array.isArray(keyframes) ? keyframes : Object.entries(keyframes || {}).map(([property, value]) => ({ [property]: value }));
      const properties = [...new Set(frames.flatMap((frame) => Object.keys(frame).filter((key) => !["offset", "easing", "composite"].includes(key))))];
      const normalized = typeof options === "number" ? { duration: options } : options || {};
      window.__pmMotionWitness.push({
        roles: String(this.dataset?.motionRole || "").split(/\s+/).filter(Boolean),
        stage: document.querySelector("#app")?.dataset.qaMotionStage || "",
        duration: Number(normalized.duration || 0),
        iterations: Number(normalized.iterations || 1),
        properties
      });
      return nativeAnimate.call(this, keyframes, options);
    };
  });
  const page = context.pages()[0] || await context.newPage();
  watchPage(page);

  await page.goto(`${origin}/`, { waitUntil: "domcontentloaded" });
  check((await page.title()).length > 0, "ConceptHub root did not render a document title.");

  await page.goto(`${origin}/concepts/settings-redesign-concepts/5.6%20Sol/index.html`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.PMSettingsBakeoff?.whenIdle) && [...document.querySelectorAll("iframe")].every((frame) => frame.contentWindow?.PMSettingsDemo), null, { timeout: 20000 });
  await page.locator('input[name="width"]').fill("2500");
  await page.locator('select[name="theme"]').selectOption("basic-light");
  await page.locator('select[name="scenario"]').selectOption("effective-difference");
  await page.locator('input[name="rail"]').uncheck();
  await page.locator('input[name="chat"]').check();
  await page.locator('input[name="reduced"]').check();
  const comparison = await page.evaluate(async () => {
    await window.PMSettingsBakeoff.whenIdle();
    return [...document.querySelectorAll("iframe")].map((frame) => ({
      width: frame.style.width,
      model: frame.contentWindow.PMSettingsDemo.model,
      concept: frame.contentWindow.PMSettingsDemo.concept,
      state: frame.contentWindow.PMSettingsDemo.snapshot().state
    }));
  });
  coverage.comparisonFrames = comparison.length;
  check(comparison.length === 4, "Comparison surface does not contain four live previews.");
  check(new Set(comparison.map((entry) => entry.concept)).size === 4, "Comparison previews are not four distinct concept runtimes.");
  check(comparison.every((entry) => entry.width === "2500px" && entry.model === "5.6 Sol" && entry.state.theme === "basic-light" && entry.state.scenario === "effective-difference" && entry.state.reducedMotion && !entry.state.railOpen && entry.state.chatOpen), "Comparison controls did not broadcast the same width/theme/scenario/shell/motion state to all previews.");

  for (const concept of concepts) {
    const url = `${origin}/concepts/settings-redesign-concepts/5.6%20Sol/${concept.file}`;
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await waitForDemo(page);
    coverage.concepts += 1;
    check(await page.title() === `${concept.title} — Puppet Master Settings`, `${concept.title}: document title is not exact.`);
    check(await page.locator('[data-concept-model="5.6 Sol"]').count() >= 1, `${concept.title}: exact data-concept-model marker missing.`);
    check(await page.locator(concept.home).count() === 1, `${concept.title}: its concept-specific Home composition is missing.`);
    check(await page.locator(concept.destination).count() === 10, `${concept.title}: Home does not expose ten non-pill destinations.`);
    check(await page.locator("[data-search-input]").isVisible(), `${concept.title}: global search is not visible on Home.`);

    for (const theme of themes) {
      await applyReview(page, { theme, scenario: "normal", railOpen: true, chatOpen: false, reducedMotion: true });
      await page.waitForTimeout(140);
      const audit = await layoutAudit(page);
      assertLayout(audit, `${concept.title} · ${theme} · 1280`);
      coverage.themeStates += 1;
    }

    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      for (const shellState of shellStates) {
        await applyReview(page, { theme: width === 760 ? "friendly-light" : "friendly-dark", scenario: "normal", ...shellState, reducedMotion: true });
        const audit = await layoutAudit(page);
        assertLayout(audit, `${concept.title} · ${width} · rail=${shellState.railOpen} · assistant=${shellState.chatOpen}`);
        coverage.responsiveStates += 1;
      }
    }

    await page.setViewportSize({ width: 760, height: 900 });
    await applyReview(page, { theme: "basic-light", scenario: "attention", railOpen: false, chatOpen: false, reducedMotion: true, direction: "rtl", textScale: 1.35 });
    check(await page.locator("html").getAttribute("dir") === "rtl", `${concept.title}: RTL review state was not applied.`);
    check(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--review-text-scale").trim()) === "1.35", `${concept.title}: 35% text expansion was not applied.`);
    assertLayout(await layoutAudit(page), `${concept.title} · RTL · 35% text expansion · 760`);
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    assertLayout(await layoutAudit(page), `${concept.title} · forced colors · 760`);
    await page.emulateMedia({ forcedColors: "none", reducedMotion: "no-preference" });

    await page.setViewportSize({ width: 380, height: 450 });
    await applyReview(page, { theme: "glass-dark", scenario: "normal", railOpen: false, chatOpen: false, reducedMotion: true, direction: "ltr", textScale: 1 });
    assertLayout(await layoutAudit(page), `${concept.title} · 200% zoom-equivalent reflow · nominal 760`);
    coverage.responsiveStates += 1;

    await page.setViewportSize({ width: 1280, height: 900 });
    await applyReview(page, { theme: "friendly-dark", scenario: "normal", railOpen: true, chatOpen: false, reducedMotion: false, direction: "ltr", textScale: 1 });
    const search = page.locator("[data-search-input]");
    await search.fill("Crash recovery");
    await idle(page);
    check(await search.getAttribute("role") === "combobox", `${concept.title}: search is not a combobox.`);
    check(await search.getAttribute("aria-expanded") === "true", `${concept.title}: search did not expose its listbox.`);
    const activeDescendant = await search.getAttribute("aria-activedescendant");
    check(Boolean(activeDescendant) && await page.locator(`#${activeDescendant}`).count() === 1, `${concept.title}: search active descendant is invalid.`);
    await search.press("End");
    await idle(page);
    await search.press("Home");
    await idle(page);
    await search.press("Enter");
    await idle(page);
    const deepLink = await page.evaluate(() => ({
      screen: window.PMSettingsDemo.snapshot().state.screen,
      category: window.PMSettingsDemo.snapshot().state.categoryId,
      focusRequest: window.PMSettingsDemo.snapshot().state.focusRequest,
      activeSetting: document.activeElement?.dataset.settingId || document.activeElement?.closest?.("[data-setting-id]")?.dataset.settingId || null
    }));
    check(deepLink.screen === "workspace" && deepLink.category === "experience", `${concept.title}: search did not navigate to the exact Settings workspace.`);
    check(deepLink.focusRequest === null, `${concept.title}: deep-link focus request was not consumed.`);
    check(deepLink.activeSetting === "experience.startup.recovery", `${concept.title}: deep link did not focus the labelled setting region.`);

    const recoverySelect = page.locator('[data-setting-select="experience.startup.recovery"]');
    await recoverySelect.focus();
    await recoverySelect.selectOption({ label: "Ask first" });
    await idle(page);
    check(await page.evaluate(() => document.activeElement?.dataset.settingSelect) === "experience.startup.recovery", `${concept.title}: local setting patch destroyed focus.`);
    check((await page.evaluate(() => window.PMSettingsDemo.snapshot().settings.find((entry) => entry.id === "experience.startup.recovery").value)) === "Ask first", `${concept.title}: setting control did not mutate semantic state.`);

    const subcategories = page.locator("[data-subcategory]");
    if (await subcategories.count() > 1) {
      const second = subcategories.nth(1);
      const wanted = await second.getAttribute("data-subcategory");
      await second.click();
      await idle(page);
      const samples = [];
      for (let index = 0; index < 4; index += 1) {
        samples.push(await page.evaluate(() => window.PMSettingsDemo.snapshot().state.subcategoryId));
        await page.waitForTimeout(55);
      }
      check(samples.every((entry) => entry === wanted), `${concept.title}: controlled jump/scrollspy oscillated (${samples.join(", ")}).`);
    }

    await demo(page, "openSetting", "experience.input.project-dictionary-manage");
    check(await page.locator("details[data-disclosure-id^='experience:appearance-input:advanced']").getAttribute("open") !== null, `${concept.title}: advanced deep link did not reveal its disclosure.`);
    const misspelled = page.locator("[data-misspelled]");
    check(await misspelled.innerText() === "repositry", `${concept.title}: spelling preview was automatically changed.`);
    await misspelled.press("Shift+F10");
    await idle(page);
    check(await page.locator("[data-spell-menu]").getAttribute("hidden") === null, `${concept.title}: keyboard spelling menu did not open.`);
    check(await page.locator('[data-spell-menu] [role="menuitem"]').count() === 5, `${concept.title}: spelling menu does not expose all five actions.`);
    await page.locator('[data-spell="replace"]').click();
    await idle(page);
    check(await page.getByText("repository", { exact: true }).count() >= 1, `${concept.title}: Replace once did not visibly change the selected occurrence.`);

    const usageSearch = page.locator("[data-search-input]");
    await usageSearch.fill("measured balance");
    await idle(page);
    const usageResult = page.locator(".search-result", { hasText: "Open provider usage detail" });
    check(await usageResult.count() === 1, `${concept.title}: Usage handoff is missing from global search.`);
    await usageResult.click();
    await idle(page);
    const usageState = await page.evaluate(() => ({
      screen: window.PMSettingsDemo.snapshot().state.screen,
      manager: window.PMSettingsDemo.snapshot().state.managerId,
      tab: window.PMSettingsDemo.snapshot().state.managerTab,
      activeFocus: document.activeElement?.dataset.focusKey || null
    }));
    check(usageState.screen === "manager" && usageState.manager === "providers" && usageState.tab === "usage", `${concept.title}: Usage search fell through instead of opening Provider → Usage.`);
    check(usageState.activeFocus === "provider-usage-heading", `${concept.title}: Usage handoff did not focus its labelled destination heading.`);
    await page.locator("[data-provider-usage-handoff]").click();
    await idle(page);
    check((await page.locator(".receipt-region").innerText()).includes("Usage handoff simulated"), `${concept.title}: Usage boundary action lacks an honest inline simulation result.`);

    await demo(page, "openManager", "providers", "overview");
    check(await page.locator('[role="tablist"] [role="tab"]').count() === 7, `${concept.title}: Provider manager does not expose seven areas.`);
    check(await page.locator('[role="tab"][aria-selected="true"]').count() === 1, `${concept.title}: Provider tablist has invalid selected state.`);
    await page.locator('[role="tab"][data-manager-tab="models"]').click();
    await idle(page);
    check(await page.evaluate(() => document.activeElement?.dataset.managerTab) === "models", `${concept.title}: activating Models did not retain focus on the selected tab.`);
    await page.locator('[role="tab"][aria-selected="true"]').press("ArrowRight");
    await idle(page);
    check(await page.evaluate(() => document.activeElement?.dataset.managerTab) === "usage", `${concept.title}: ArrowRight did not move and activate the next provider tab.`);
    await page.locator('[role="tab"][aria-selected="true"]').press("End");
    await idle(page);
    check(await page.evaluate(() => document.activeElement?.dataset.managerTab) === "support", `${concept.title}: End did not activate the last provider tab.`);
    await page.locator('[role="tab"][aria-selected="true"]').press("Home");
    await idle(page);
    check(await page.evaluate(() => document.activeElement?.dataset.managerTab) === "overview", `${concept.title}: Home did not activate the first provider tab.`);
    await page.locator('[role="tab"][data-manager-tab="models"]').click();
    await idle(page);
    const modelRows = await page.locator(".model-row").count();
    check(modelRows >= 3, `${concept.title}: Provider model catalogue is shallow.`);
    check(await page.locator('[data-model-speed="sol-56-mini"] option').count() === 1, `${concept.title}: unsupported Fast mode is exposed.`);
    check(await page.locator('[data-model-speed="sol-56"] option').count() === 2, `${concept.title}: supported Fast mode is missing.`);
    await page.evaluate(() => { window.__pmPendingRefresh = window.PMSettingsDemo.dispatch({ type: "provider.refresh", providerId: "openai" }); });
    await page.waitForSelector('[data-qa-provider-refresh="active"]', { state: "visible", timeout: 2500 });
    check(await page.locator(".model-board").getAttribute("aria-busy") === "true", `${concept.title}: live Provider refresh did not expose aria-busy.`);
    check(await page.locator('[data-provider-refresh="openai"]').isDisabled(), `${concept.title}: live Provider refresh left its duplicate action enabled.`);
    check((await page.locator('[data-qa-provider-refresh="active"]').innerText()).includes("last-known-good"), `${concept.title}: live refresh did not explain mounted last-known-good rows.`);
    check(await page.locator(".model-row").count() === modelRows, `${concept.title}: refresh unmounted last-known-good model rows at start.`);
    await page.evaluate(async () => { await window.__pmPendingRefresh; await window.PMSettingsDemo.whenIdle(); });
    check(await page.locator(".model-row").count() === modelRows, `${concept.title}: refresh changed active catalogue row count.`);
    check((await page.locator(".receipt-region").innerText()).includes("Catalogue refreshed"), `${concept.title}: refresh did not return a durable outcome.`);
    await applyReview(page, { scenario: "refreshing", reducedMotion: true });
    await demo(page, "openManager", "providers", "models", { resourceId: "openai" });
    check(await page.locator('[data-qa-provider-refresh="active"]').isVisible(), `${concept.title}: persistent Refreshing scenario has no visible progress state.`);
    check(await page.locator('[data-provider-refresh="openai"]').isDisabled(), `${concept.title}: persistent Refreshing scenario exposes a duplicate refresh action.`);
    check(await page.locator(".model-row").count() === modelRows, `${concept.title}: persistent Refreshing scenario hid last-known-good rows.`);
    await applyReview(page, { scenario: "normal", reducedMotion: false });
    await demo(page, "openManager", "providers", "models");

    await page.locator('[role="tab"][data-manager-tab="accounts"]').click();
    await idle(page);
    await page.locator('[data-account-select="openai-work"]').click();
    await idle(page);
    const futureButton = page.locator('[data-account-use="openai-work"]');
    if (await futureButton.isEnabled()) {
      await futureButton.click();
      await idle(page);
    }
    const accountState = await page.evaluate(() => {
      const provider = window.PMSettingsDemo.snapshot().providers.find((entry) => entry.id === "openai");
      return { active: provider.activeAccountId, inFlight: provider.inFlightAccountId };
    });
    check(accountState.active === "openai-work" && accountState.inFlight === "openai-personal", `${concept.title}: account preference was not future-only.`);

    await demo(page, "openManager", "memory");
    const memoryBefore = await page.evaluate(() => window.PMSettingsDemo.snapshot().memories.find((entry) => entry.id === "gist-provider-route").version);
    await page.locator('[data-memory="gist-provider-route"]').click();
    await idle(page);
    const verify = page.locator('[data-memory-verify="gist-provider-route"]');
    if (await verify.isEnabled()) {
      await verify.click();
      await idle(page);
    }
    const memoryAfter = await page.evaluate(() => window.PMSettingsDemo.snapshot().memories.find((entry) => entry.id === "gist-provider-route").version);
    check(memoryAfter === memoryBefore + 1, `${concept.title}: Memory verification did not append an immutable version.`);
    check((await page.locator(".receipt-region").innerText()).includes("Memory verified"), `${concept.title}: Memory verification did not return a receipt.`);

    await demo(page, "openManager", "terminal");
    const size = page.locator('[data-terminal-field="fontSize"]');
    await size.fill("16");
    await size.press("Tab");
    await idle(page);
    check(await page.evaluate(() => window.PMSettingsDemo.snapshot().terminals.find((entry) => entry.id === window.PMSettingsDemo.snapshot().state.selectedTerminalId).dirty), `${concept.title}: Terminal draft did not become dirty.`);
    await page.locator("[data-terminal-apply]").click();
    await idle(page);
    await page.locator("[data-terminal-diagnostics]").click();
    await idle(page);
    check((await page.locator(".receipt-region").innerText()).includes("Simulated diagnostics complete"), `${concept.title}: Terminal diagnostics lack an honest simulation receipt.`);

    const managerEvidence = [
      ["context", "project-instructions", "Requested admission"],
      ["personas", "explorer-persona", "Delegated child work only"],
      ["crew", "release-review", "Usage and reserve guard"],
      ["mcp", "github-server", "HTTPS streaming"],
      ["lsp", "python-language-support", "No compatible installation detected"],
      ["extensions", "terminal-command", "Control + grave accent"],
      ["media", "openai-image-route", "Work API"]
    ];
    for (const [managerId, resourceId, expectedText] of managerEvidence) {
      await demo(page, "openManager", managerId);
      await page.locator(`[data-manager-resource="${managerId}:${resourceId}"]`).click();
      await idle(page);
      check((await page.locator(".manager-detail").innerText()).toLowerCase().includes(expectedText.toLowerCase()), `${concept.title}: ${managerId} hides required domain evidence “${expectedText}”.`);
    }
    await demo(page, "openManager", "mcp");
    const managerFilter = page.locator('[data-manager-filter="mcp"]');
    await managerFilter.fill("HTTPS streaming");
    await idle(page);
    check(await page.locator('[data-manager-resource="mcp:github-server"]').count() === 1, `${concept.title}: manager search ignores domain-specific fields.`);
    await page.locator('[data-manager-resource="mcp:github-server"]').click();
    await idle(page);
    await page.locator("[data-manager-item-action]").first().click();
    await idle(page);
    check((await page.locator(".receipt-region").innerText()).includes("opened"), `${concept.title}: supporting-manager item action returned no specific local result.`);
    coverage.functionalFlows += 1;

    await page.setViewportSize({ width: 760, height: 900 });
    await applyReview(page, { theme: "friendly-dark", scenario: "normal", railOpen: false, chatOpen: false, reducedMotion: true, direction: "ltr", textScale: 1 });
    await demo(page, "openManager", "providers");
    const originRow = page.locator('[data-provider="claude"]');
    await originRow.click();
    await idle(page);
    check(await page.locator(".manager-stage-root").getAttribute("data-drill-mode") === "detail", `${concept.title}: narrow manager did not enter explicit detail drill-in.`);
    check(await page.locator("[data-drill-back]").isVisible(), `${concept.title}: narrow detail lacks a Back control.`);
    check((await page.evaluate(() => document.activeElement?.closest(".manager-detail") !== null)), `${concept.title}: narrow detail did not focus its heading/detail.`);
    await page.locator("[data-drill-back]").click();
    check(await page.locator(".manager-stage-root").getAttribute("data-drill-mode") === "master", `${concept.title}: Back did not restore the narrow master list.`);
    check(await page.evaluate(() => document.activeElement?.dataset.provider === "claude"), `${concept.title}: Back did not restore originating-row focus.`);

    if (concept.id === "index-house") {
      await page.setViewportSize({ width: 900, height: 900 });
      await applyReview(page, { theme: "friendly-dark", scenario: "normal", railOpen: false, chatOpen: false, reducedMotion: true, direction: "ltr", textScale: 1 });
      await demo(page, "openCategory", "experience");
      const evidenceToggle = page.locator("[data-inspector-toggle]");
      const evidenceInspector = page.locator("#workspaceInspector");
      check(await evidenceToggle.isVisible(), `${concept.title}: middle-width workspace lacks an evidence-drawer opener.`);
      check(!(await evidenceInspector.isVisible()), `${concept.title}: closed middle-width inspector remained visibly overlaid.`);
      await evidenceToggle.click();
      await idle(page);
      check(await evidenceInspector.isVisible(), `${concept.title}: evidence drawer did not open at the middle width.`);
      check(await evidenceInspector.getAttribute("role") === "dialog" && await evidenceInspector.getAttribute("aria-modal") === "true", `${concept.title}: evidence drawer lacks dialog semantics.`);
      check(await page.locator(".ih-inspector-backdrop").isVisible(), `${concept.title}: open evidence drawer lacks a real backdrop.`);
      const evidenceText = (await evidenceInspector.innerText()).toLowerCase();
      check(evidenceText.includes("effects") && evidenceText.includes("requirements"), `${concept.title}: evidence drawer omits effects or requirements.`);
      check(await page.evaluate(() => document.activeElement?.dataset.focusKey === "inspector-heading"), `${concept.title}: opening evidence did not focus the inspector heading.`);
      await page.keyboard.press("Escape");
      await idle(page);
      check(!(await evidenceInspector.isVisible()), `${concept.title}: Escape did not close the evidence drawer.`);
      check(await page.evaluate(() => document.activeElement?.hasAttribute("data-inspector-toggle")), `${concept.title}: closing evidence did not restore opener focus.`);

      await page.setViewportSize({ width: 760, height: 900 });
      await demo(page, "openCategory", "experience");
      check(!(await evidenceToggle.isVisible()), `${concept.title}: squeezed inline evidence retained a redundant drawer opener.`);
      check(await evidenceInspector.isVisible(), `${concept.title}: squeezed workspace lost its inline evidence inspector.`);
      check(await evidenceInspector.getAttribute("inert") === null && await evidenceInspector.getAttribute("role") !== "dialog", `${concept.title}: squeezed inline inspector retained closed-drawer semantics.`);
    }

    await page.setViewportSize({ width: 1280, height: 900 });
    await applyReview(page, { theme: "friendly-dark", scenario: "normal", railOpen: false, chatOpen: false, reducedMotion: false, direction: "ltr", textScale: 1 });
    await demo(page, "openHome");

    await clearMotionWitness(page);
    await demo(page, "openCategory", "experience");
    assertMotionEvidence(await motionEvidence(page), concept, "navigate");

    await clearMotionWitness(page);
    await demo(page, "openCategory", "intelligence");
    assertMotionEvidence(await motionEvidence(page), concept, "category");

    await clearMotionWitness(page);
    const motionSearch = page.locator("[data-search-input]");
    await motionSearch.fill("Theme");
    await idle(page);
    assertMotionEvidence(await motionEvidence(page), concept, "search");
    await motionSearch.press("Escape");
    await idle(page);

    const jumpTarget = page.locator("[data-subcategory]:not([aria-current='location'])").first();
    const jumpId = await jumpTarget.getAttribute("data-subcategory");
    await clearMotionWitness(page);
    await jumpTarget.click();
    await idle(page);
    assertMotionEvidence(await motionEvidence(page), concept, "jump");

    const spyId = await page.evaluate((current) => [...document.querySelectorAll("[data-subcategory]")].map((element) => element.dataset.subcategory).find((id) => id && id !== current), jumpId);
    await clearMotionWitness(page);
    await page.evaluate((id) => window.PMSettingsDemo.store.setSubcategory(id, "scrollspy"), spyId);
    await idle(page);
    assertMotionEvidence(await motionEvidence(page), concept, "scrollspy");

    await demo(page, "openCategory", "experience");
    const disclosureSummary = page.locator("details[data-disclosure-id] > summary").first();
    await clearMotionWitness(page);
    await disclosureSummary.click();
    await idle(page);
    assertMotionEvidence(await motionEvidence(page), concept, "disclosure");

    await demo(page, "openSetting", "experience.startup.recovery");
    const saveControl = page.locator('[data-setting-select="experience.startup.recovery"]');
    await clearMotionWitness(page);
    await saveControl.selectOption({ label: "Off" });
    await idle(page);
    assertMotionEvidence(await motionEvidence(page), concept, "save");

    await demo(page, "openManager", "providers", "models", { resourceId: "openai" });
    await clearMotionWitness(page);
    await page.evaluate(async () => { await window.PMSettingsDemo.dispatch({ type: "provider.refresh", providerId: "openai" }); await window.PMSettingsDemo.whenIdle(); });
    assertMotionEvidence(await motionEvidence(page), concept, "refresh");

    const movableModel = page.locator('[data-model-move="sol-56-mini"][data-direction="-1"]');
    await clearMotionWitness(page);
    await movableModel.click();
    await idle(page);
    assertMotionEvidence(await motionEvidence(page), concept, "reorder");

    await page.setViewportSize({ width: 760, height: 900 });
    await demo(page, "openCategory", "experience");
    await clearMotionWitness(page);
    await page.locator("[data-nav-toggle]").click();
    await idle(page);
    assertMotionEvidence(await motionEvidence(page), concept, "drawer");
    check(await page.locator("#categoryNavigator").getAttribute("inert") === null, `${concept.title}: open navigator remained inert.`);
    await clearMotionWitness(page);
    const backdropBox = await page.locator("[data-nav-dismiss]").boundingBox();
    await page.locator("[data-nav-dismiss]").click({ position: { x: Math.max(1, backdropBox.width - 8), y: Math.min(80, backdropBox.height - 8) } });
    await idle(page);
    const closeEvidence = await motionEvidence(page);
    check(closeEvidence.snapshot?.kind === "drawer" && closeEvidence.calls.length > 0, `${concept.title}: closing the navigator produced no witnessed drawer motion.`);
    check(await page.locator("#categoryNavigator").getAttribute("inert") !== null, `${concept.title}: closed narrow navigator remains interactive.`);

    await page.setViewportSize({ width: 1280, height: 900 });
    await demo(page, "openCategory", "experience");
    await page.evaluate(() => {
      void window.PMSettingsDemo.openCategory("intelligence");
      void window.PMSettingsDemo.openCategory("safety");
    });
    await idle(page);
    const rapid = await page.evaluate(() => ({
      category: window.PMSettingsDemo.snapshot().state.categoryId,
      stage: document.querySelector("#app").dataset.qaMotionStage,
      running: document.getAnimations().filter((animation) => animation.playState === "running").length
    }));
    check(rapid.category === "safety", `${concept.title}: rapid navigation did not settle on the newest state.`);
    check(/completed|settled|superseded/.test(rapid.stage), `${concept.title}: rapid navigation motion did not settle (${rapid.stage}).`);
    check(rapid.running === 0, `${concept.title}: rapid reversal left animations running.`);
    check(await page.locator(`[data-motion-role~="${concept.signature}"]`).count() >= 1, `${concept.title}: signature motion landmark ${concept.signature} is missing after navigation settled.`);

    await applyReview(page, { reducedMotion: true });
    await clearMotionWitness(page);
    await demo(page, "openCategory", "safety");
    const reduced = await page.evaluate(() => ({
      category: window.PMSettingsDemo.snapshot().state.categoryId,
      reduced: document.documentElement.dataset.reducedMotion,
      stage: document.querySelector("#app").dataset.qaMotionStage,
      running: document.getAnimations().filter((animation) => animation.playState === "running").length,
      motion: window.PMSettingsDemo.motionSnapshot(),
      calls: window.__pmMotionWitness || []
    }));
    check(reduced.category === rapid.category, `${concept.title}: reduced motion changed final semantic state.`);
    check(reduced.reduced === "1" && reduced.running === 0, `${concept.title}: reduced motion did not install final geometry without residual motion.`);
    check(reduced.motion?.reducedMotion === true && reduced.calls.length === 1, `${concept.title}: reduced motion did not collapse choreography to one cue.`);
    check(reduced.calls.every((entry) => entry.duration >= 80 && entry.duration <= 120 && entry.properties.length === 1 && entry.properties[0] === "opacity"), `${concept.title}: reduced cue used spatial travel or an out-of-range duration.`);
    coverage.motionFlows += 1;
  }
  check(coverage.motionMoments === 40, `Witnessed motion moment count is ${coverage.motionMoments}, expected 40.`);

  async function runRenderedMatrix(concept) {
    const matrixPage = await context.newPage();
    watchPage(matrixPage);
    try {
      const url = `${origin}/concepts/settings-redesign-concepts/5.6%20Sol/${concept.file}`;
      await matrixPage.setViewportSize({ width: 1280, height: 900 });
      await matrixPage.goto(url, { waitUntil: "domcontentloaded" });
      await waitForDemo(matrixPage);

      for (const surface of coreSurfaces) {
        await applyMatrixReview(matrixPage, {
          theme: "friendly-dark",
          scenario: "normal",
          railOpen: false,
          chatOpen: false,
          reducedMotion: true,
          direction: "ltr",
          textScale: 1
        });
        await openMatrixSurface(matrixPage, surface);
        for (const width of widths) {
          await matrixPage.setViewportSize({ width, height: 900 });
          for (const theme of themes) {
            for (const shellState of shellStates) {
              for (const reducedMotion of [false, true]) {
                await applyMatrixReview(matrixPage, {
                  theme,
                  scenario: "normal",
                  resetScenario: false,
                  ...shellState,
                  reducedMotion,
                  direction: "ltr",
                  textScale: 1
                });
                const state = await matrixPage.evaluate(({ qa, manager }) => {
                  const snapshot = window.PMSettingsDemo.snapshot();
                  const view = document.querySelector(".concept-scroll > .view");
                  return {
                    theme: snapshot.state.theme,
                    scenario: snapshot.state.scenario,
                    railOpen: snapshot.state.railOpen,
                    chatOpen: snapshot.state.chatOpen,
                    reducedMotion: snapshot.state.reducedMotion,
                    qa: view?.dataset.qaSurface || null,
                    manager: view?.dataset.qaManager || null,
                    running: document.getAnimations().filter((animation) => animation.playState === "running").length,
                    expectedQa: qa,
                    expectedManager: manager || null
                  };
                }, surface);
                const label = `${concept.title} · core ${surface.id} · ${theme} · ${width} · rail=${shellState.railOpen} · assistant=${shellState.chatOpen} · reduced=${reducedMotion}`;
                check(state.theme === theme && state.scenario === "normal", `${label}: presentation/scenario state diverged.`);
                check(state.railOpen === shellState.railOpen && state.chatOpen === shellState.chatOpen, `${label}: shell state diverged.`);
                check(state.reducedMotion === reducedMotion, `${label}: effective reduced-motion state diverged.`);
                check(state.qa === state.expectedQa, `${label}: expected ${state.expectedQa} surface, found ${state.qa}.`);
                if (surface.manager) check(state.manager === surface.manager, `${label}: expected ${surface.manager} manager, found ${state.manager}.`);
                check(state.running === 0, `${label}: matrix settlement left ${state.running} animation(s) running.`);
                assertLayout(await layoutAudit(matrixPage), label);
                coverage.coreRenderedStates += 1;
              }
            }
          }
        }
      }

      await applyMatrixReview(matrixPage, {
        theme: "friendly-dark",
        scenario: "normal",
        railOpen: false,
        chatOpen: false,
        reducedMotion: true,
        direction: "ltr",
        textScale: 1
      });
      await openMatrixSurface(matrixPage, coreSurfaces[0]);
      for (const width of [760, 1280, 2500]) {
        await matrixPage.setViewportSize({ width, height: 900 });
        for (const shellState of shellExtremes) {
          for (const theme of themes) {
            for (const scenario of scenarioIds) {
              await applyMatrixReview(matrixPage, {
                theme,
                scenario,
                ...shellState,
                reducedMotion: true,
                direction: "ltr",
                textScale: 1
              });
              const state = await matrixPage.evaluate(() => {
                const snapshot = window.PMSettingsDemo.snapshot();
                return {
                  scenario: snapshot.state.scenario,
                  marker: document.querySelector("#app")?.dataset.qaScenario,
                  text: document.querySelector('[data-qa-surface="home"]')?.innerText || ""
                };
              });
              const label = `${concept.title} · scenario ${scenario} · ${theme} · ${width} · shell=${shellState.railOpen ? "open" : "closed"}`;
              check(state.scenario === scenario && state.marker === scenario, `${label}: semantic/render scenario markers diverged.`);
              check(state.text.includes(scenarioLabels[scenario]), `${label}: visible scenario signature is missing.`);
              assertLayout(await layoutAudit(matrixPage), label);
              coverage.scenarioStates += 1;
            }
          }
        }
      }
    } finally {
      await matrixPage.close().catch(() => {});
    }
  }

  await Promise.all(concepts.map((concept) => runRenderedMatrix(concept)));
  check(coverage.coreRenderedStates === 7680, `Core rendered matrix count is ${coverage.coreRenderedStates}, expected 7680.`);
  check(coverage.scenarioStates === 2304, `Scenario matrix count is ${coverage.scenarioStates}, expected 2304.`);

  const touchProfile = join(temporaryRoot, "touch-browser-profile");
  await mkdir(touchProfile, { recursive: true });
  touchContext = await chromium.launchPersistentContext(touchProfile, {
    headless: true,
    viewport: { width: 760, height: 900 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce"
  });
  const touchPage = touchContext.pages()[0] || await touchContext.newPage();
  watchPage(touchPage);
  for (const concept of concepts) {
    await touchPage.goto(`${origin}/concepts/settings-redesign-concepts/5.6%20Sol/${concept.file}`, { waitUntil: "domcontentloaded" });
    await waitForDemo(touchPage);
    const touchAudit = await touchPage.evaluate(() => {
      const visible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      };
      const controls = [...document.querySelectorAll("button, input, select, summary")].filter(visible);
      const undersized = controls.filter((element) => {
        const hitTarget = element.matches("input[type='checkbox'], input[type='radio'], input[type='range']") ? element.closest("label") || element : element;
        const rect = hitTarget.getBoundingClientRect();
        return rect.width < 43.5 || rect.height < 43.5;
      }).map((element) => {
        const hitTarget = element.matches("input[type='checkbox'], input[type='radio'], input[type='range']") ? element.closest("label") || element : element;
        const rect = hitTarget.getBoundingClientRect();
        return `${element.tagName}:${rect.width.toFixed(0)}x${rect.height.toFixed(0)}:${hitTarget.textContent.trim().slice(0, 24)}`;
      });
      return { coarse: matchMedia("(any-pointer: coarse)").matches || matchMedia("(hover: none)").matches, undersized };
    });
    coverage.coarsePointerStates += 1;
    check(touchAudit.coarse, `${concept.title}: touch fixture did not activate coarse/no-hover media rules.`);
    check(touchAudit.undersized.length === 0, `${concept.title}: coarse-pointer controls below 44×44: ${touchAudit.undersized.slice(0, 8).join(", ")}`);
  }

  assert.equal(consoleErrors.length, 0, `Browser console errors (${consoleErrors.length}):\n${consoleErrors.join("\n")}`);
  assert.equal(failureCount, 0, `Browser smoke failures (${failureCount}; first ${failures.length} shown):\n${failures.join("\n")}`);
  console.log(`PASS 5.6 Sol served browser smoke on OS-assigned ConceptHub port ${hub.port}.`);
  console.log(`PASS coverage: ${coverage.concepts} concepts, ${coverage.coreRenderedStates} core rendered states, ${coverage.scenarioStates} scenario states, ${coverage.themeStates} focused theme states, ${coverage.responsiveStates} focused responsive/shell states, ${coverage.functionalFlows} functional flows, ${coverage.motionFlows} motion/reduction flows, ${coverage.motionMoments} witnessed semantic motion moments, ${coverage.comparisonFrames} synchronized comparison frames, ${coverage.coarsePointerStates} coarse-pointer states.`);
  console.log(`PASS outcomes: search/deep-link/focus, exact Usage handoff, stable jump/scrollspy, setting focus retention, all five spelling actions present, seven provider areas, visible last-known-good refresh, future-only accounts, model gates, immutable Memory verification, Terminal draft/apply/diagnostics, domain-complete supporting managers, narrow drill-in/back focus, witnessed concept-specific motion, rapid reversal, reduced-motion parity, forced colors, 200% zoom-equivalent reflow, RTL, and 35% text expansion.`);
} finally {
  if (touchContext) await touchContext.close().catch(() => {});
  if (context) await context.close().catch(() => {});
  await stopProcess(hubProcess);
  await rm(temporaryRoot, { recursive: true, force: true });
}
