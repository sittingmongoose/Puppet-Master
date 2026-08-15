#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createServer } from "node:net";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const WebSocket = require("ws");

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const EVIDENCE = join(ROOT, "evidence");
const SCREENSHOTS = process.env.SOL_SCREENSHOT_DIR ?? join(EVIDENCE, "frames");
const BASE_URL = process.argv[2] ?? "http://127.0.0.1:4173/Concepts/chat-assistant-concepts/5-6-sol/";
const CHECK_NAME = process.env.SOL_CHECK_NAME?.trim() ?? "";
const CHECK_FILTER = process.env.SOL_CHECK_FILTER?.trim().toLowerCase() ?? "";
const CHECK_SKIP_FILTERS = (process.env.SOL_SKIP_FILTER ?? "").split("|").map((item) => item.trim().toLowerCase()).filter(Boolean);
const REPORT_PATH = process.env.SOL_REPORT_PATH ?? join(EVIDENCE, "browser-acceptance.json");
const BROWSER_KIND = process.env.SOL_BROWSER?.trim().toLowerCase() === "chromium" ? "chromium" : "firefox";
const CDP_COMMAND_TIMEOUT_MS = Number(process.env.SOL_CDP_TIMEOUT_MS ?? 60000);
const NAVIGATION_READY_TIMEOUT_MS = Number(process.env.SOL_NAVIGATION_TIMEOUT_MS ?? 30000);
const BROWSER_START_TIMEOUT_MS = Number(process.env.SOL_BROWSER_START_TIMEOUT_MS ?? 60000);
const THEMES = ["friendly-dark", "friendly-light", "retro-dark", "retro-light", "basic-dark", "basic-light", "glass-dark", "glass-light"];
const WIDTHS = [520, 750, 975, 1200];
const RESIZE_WIDTHS = [...Array.from({ length: 53 }, (_, index) => 520 + index * 13), 1200];
const WINDOWS = Array.from({ length: 8 }, (_, index) => `window-${String(index + 1).padStart(2, "0")}`);
const THREADS = Array.from({ length: 8 }, (_, index) => `thread-${String(index + 1).padStart(2, "0")}`);
const selectValues = (raw, allowed, label, coerce = (value) => value) => {
  if (!raw?.trim()) return [...allowed];
  const requested = raw.split(",").map((item) => coerce(item.trim()));
  const invalid = requested.filter((item) => !allowed.includes(item));
  if (!requested.length || invalid.length) throw new Error(`${label} contains invalid values: ${invalid.join(", ") || "empty"}`);
  if (new Set(requested).size !== requested.length) throw new Error(`${label} contains duplicate values`);
  return requested;
};
const selectStrings = (raw, allowed, label) => selectValues(raw, allowed, label);
const selectNumbers = (raw, allowed, label) => selectValues(raw, allowed, label, Number);
const MATRIX_THEMES = selectStrings(process.env.SOL_MATRIX_THEMES, THEMES, "SOL_MATRIX_THEMES");
const MATRIX_WIDTHS = selectNumbers(process.env.SOL_MATRIX_WIDTHS, WIDTHS, "SOL_MATRIX_WIDTHS");
const MATRIX_WINDOWS = selectStrings(process.env.SOL_MATRIX_WINDOWS, WINDOWS, "SOL_MATRIX_WINDOWS");
const PAGES = ["index.html", ...WINDOWS.map((id) => `${id}.html`), ...THREADS.map((id) => `${id}.html`)];
const BOOT_PAGES = selectStrings(process.env.SOL_BOOT_PAGES, PAGES, "SOL_BOOT_PAGES");
const FEATURE_STATES = [
  "baseline conversation",
  "long assistant message collapsed",
  "long assistant message expanded",
  "long user message collapsed",
  "long user message expanded",
  "active activity summary",
  "completed activity history collapsed",
  "completed activity history expanded",
  "questionnaire active",
  "questionnaire historical record",
  "goal only",
  "todo only",
  "subagents only",
  "diff only",
  "goal plus todo",
  "goal plus todo plus subagents plus diff",
  "search current thread",
  "search all threads",
  "Context Lens selection",
  "Context Lens applied state",
  "active thought collapsed",
  "active thought expanded by setting",
  "composer working and empty",
  "composer working with typed draft",
  "draft recovery",
  "artifact shortcut and editor-tab handoff",
  "long-thread older-history jump",
  "popout state restoration"
];

// This is intentionally duplicated from the correction packet rather than inferred
// from the demo fixture. A stale fixture must not silently weaken the acceptance
// contract. These controls are test/demo affordances, never production Chat tools.
const CORRECTED_TRIGGER_FAMILIES = {
  history: ["peek", "pin_compact", "pin_full", "unpin", "switch_thread"],
  question: ["prepare", "open", "select", "next", "validation_error", "skip", "cancel", "submit"],
  goal: ["start", "progress", "pause", "resume", "update", "replan", "blocked", "complete"],
  todo: ["add", "complete", "reopen", "block"],
  subagent: ["spawn", "queue", "progress", "complete", "fail", "retry"],
  activity: ["thinking_summary", "search", "read", "fetch", "browser", "test", "edit", "generate"],
  diff: ["create", "update", "open"],
  artifact: ["loading", "ready", "switch", "error", "close"],
  decision: ["approval_open", "details", "approve", "deny", "branch"],
  thread: ["send_request", "receive_response", "spawn_related", "branch"],
  system: ["port_collision", "worktree_collision", "reset"]
};
const CORRECTED_TRIGGERS = Object.entries(CORRECTED_TRIGGER_FAMILIES)
  .flatMap(([family, events]) => events.map((event) => `${family}.${event}`));
const SUPPLEMENTAL_TRIGGERS = [
  "provider.setup_required", "provider.existing_found", "provider.use_existing", "provider.install_intent", "provider.install_approved", "provider.install_verified", "provider.install_failed",
  "provider.auth_required", "provider.authenticated", "provider.readiness_verified", "provider.continuation_resumed", "provider.continuation_stale_rejected",
  "provider.continuation_expired_rejected", "provider.continuation_topology_mismatch_rejected",
  "attachment.native", "attachment.transformed", "attachment.alternate", "attachment.unsupported",
  "context.lens", "context.compact_now", "bsd.off", "bsd.auto_idle", "bsd.auto_active", "bsd.on", "bsd.advice", "bsd.timeout", "bsd.unavailable",
  "network.offline", "network.domain_failure", "network.reconnect", "network.replay", "network.snapshot", "notification.inline_outcome", "scenario.reset"
];
const CORRECTED_WARNINGS = [
  "Switching provider will replay the conversation without the current provider cache.",
  "The selected model cannot inspect video natively; PM can extract frames or use the configured vision route.",
  "Remaining included usage is unlikely to finish eight specialists; run two at a time and reserve capacity for synthesis."
];
const IDEMPOTENT_TRIGGERS = new Set([
  "history.peek", "history.pin_compact", "history.pin_full", "history.unpin",
  "question.prepare", "question.open", "question.cancel", "goal.start", "goal.pause",
  "goal.resume", "goal.blocked", "goal.complete", "todo.block",
  "subagent.complete", "subagent.fail", "artifact.loading", "artifact.ready",
  "artifact.error", "artifact.close", "decision.approve", "decision.deny",
  "thread.receive_response", "system.port_collision", "system.worktree_collision"
]);

assert(CORRECTED_TRIGGERS.length === 59, `corrected trigger inventory has ${CORRECTED_TRIGGERS.length} entries, expected 59`);
assert(SUPPLEMENTAL_TRIGGERS.length === 34, `supplemental trigger inventory has ${SUPPLEMENTAL_TRIGGERS.length} entries, expected 34`);

mkdirSync(SCREENSHOTS, { recursive: true });

const SOURCE_FILES = [
  ...PAGES,
  "shared/app.js", "shared/base.css", "shared/concept-hub-bridge.js", "shared/definitions.js", "shared/icons.js", "shared/primitives.js", "shared/selectors.js", "shared/state.js",
  "windows/windows.js", "threads/threads.js",
  "data/original_demoData.json", "data/sol-extensions.json", "data/extended_demo_scenario.json", "data/original_testMatrix.json", "data/demo-scenario-manifest.json", "data/demo-trigger-contract.json",
  "tests/browser-acceptance.mjs"
];

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const sourceFiles = SOURCE_FILES.map((file) => {
  const bytes = readFileSync(join(ROOT, file));
  return { file, sha256: sha256(bytes), bytes: bytes.length };
});
const sourceAggregateSha256 = sha256(Buffer.from(sourceFiles.map(({ file, sha256: digest }) => `${file}\0${digest}`).join("\n")));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

async function waitForVisualSettle(page, timeout = NAVIGATION_READY_TIMEOUT_MS) {
  await page.poll(`(()=>{const nodes=[...document.querySelectorAll('.chat-mount,.thread-concept,.artifact-region,.history-region,[data-message-id],.question-preparing,.question-surface,.question-submitting,.question-receipt,.work-composition,.popup-card')];return nodes.every(node=>Number(getComputedStyle(node).opacity)>=.99)})()`, timeout);
  // Opacity alone can reach its final value before an authored transform and the
  // transcript anchor restoration have completed. Wait beyond the longest
  // finite choreography (380 ms), then verify the settled visibility once more.
  // The loading progress sweep is intentionally infinite and is not a blocker.
  await delay(430);
  await page.poll(`(()=>{const nodes=[...document.querySelectorAll('.chat-mount,.thread-concept,.artifact-region,.history-region,[data-message-id],.question-preparing,.question-surface,.question-submitting,.question-receipt,.work-composition,.popup-card')];return nodes.every(node=>Number(getComputedStyle(node).opacity)>=.99)})()`, timeout);
}

async function captureStableScreenshot(page, path) {
  // Gecko can acknowledge settled layout before every scroll-container tile has
  // been composited after a dense matrix run. A first capture forces that paint;
  // the retained second capture is the evidence frame used by both engines.
  await page.screenshot(path);
  await delay(120);
  await page.screenshot(path);
}

async function freePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolvePort(port));
    });
  });
}

class WebDriverPage {
  constructor(origin, sessionId, capabilities) {
    this.origin = origin;
    this.sessionId = sessionId;
    this.capabilities = capabilities;
    this.consoleErrors = [];
    this.runtimeErrors = [];
  }

  async request(path, method = "GET", body = undefined) {
    const response = await fetch(`${this.origin}/session/${this.sessionId}${path}`, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const payload = await response.json();
    const protocolError = typeof payload.value?.error === "string" && typeof payload.value?.message === "string";
    if (!response.ok || protocolError) {
      const detail = payload.value?.message ?? payload.value?.error ?? payload.message ?? JSON.stringify(payload);
      throw new Error(`${detail || `WebDriver ${method} ${path} failed`} [${method} ${path}]`);
    }
    return payload.value;
  }

  async evaluate(expression) {
    return this.request("/execute/sync", "POST", { script: "return eval(arguments[0]);", args: [expression] });
  }

  async poll(expression, timeout = 8000) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      try {
        if (await this.evaluate(`Boolean(${expression})`)) return;
      } catch (_error) {
        // A navigation can transiently destroy the JavaScript execution context.
      }
      await delay(35);
    }
    throw new Error(`Timed out waiting for: ${expression}`);
  }

  async navigate(url) {
    await this.collectErrors();
    try {
      if (await this.evaluate(`location.href===${JSON.stringify(url)}&&document.readyState==='complete'&&Boolean(window.__SOL_STORE__)&&Boolean(document.querySelector('.window-concept'))`)) return;
    } catch (_error) {
      // about:blank or a prior failed navigation is not a reusable document.
    }
    await this.request("/url", "POST", { url });
    await this.poll("document.readyState === 'complete' && window.__SOL_STORE__ && document.querySelector('.window-concept')", NAVIGATION_READY_TIMEOUT_MS);
    await this.evaluate(`(()=>{window.__SOL_BROWSER_ERRORS__={console:[],runtime:[]};const prior=console.error.bind(console);console.error=(...parts)=>{window.__SOL_BROWSER_ERRORS__.console.push(parts.map(String).join(' '));prior(...parts)};addEventListener('error',event=>window.__SOL_BROWSER_ERRORS__.runtime.push(event.error?.stack??event.message));addEventListener('unhandledrejection',event=>window.__SOL_BROWSER_ERRORS__.runtime.push(String(event.reason?.stack??event.reason)));return true})()`);
  }

  async dispatch(action) {
    const encoded = JSON.stringify(action);
    return this.evaluate(`(()=>{window.__SOL_STORE__.dispatch(${encoded});return true})()`);
  }

  async click(selector, index = 0) {
    return this.evaluate(`(()=>{const node=document.querySelectorAll(${JSON.stringify(selector)})[${index}];if(!node)throw new Error('Missing click target: '+${JSON.stringify(selector)});node.click();return true})()`);
  }

  async input(selector, value) {
    return this.evaluate(`(()=>{const node=document.querySelector(${JSON.stringify(selector)});if(!node)throw new Error('Missing input: '+${JSON.stringify(selector)});node.focus();node.value=${JSON.stringify(value)};node.setSelectionRange?.(node.value.length,node.value.length);node.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);
  }

  async select(selector, value) {
    return this.evaluate(`(()=>{const node=document.querySelector(${JSON.stringify(selector)});if(!node)throw new Error('Missing select: '+${JSON.stringify(selector)});node.value=${JSON.stringify(value)};node.dispatchEvent(new Event('change',{bubbles:true}));return node.value})()`);
  }

  async screenshot(path) {
    const encoded = await this.request("/screenshot");
    writeFileSync(path, Buffer.from(encoded, "base64"));
  }

  async setWindowRect(width, height) {
    return this.request("/window/rect", "POST", { x: 0, y: 0, width, height });
  }

  async reload() {
    await this.request("/refresh", "POST", {});
    await this.poll("document.readyState === 'complete' && window.__SOL_STORE__ && document.querySelector('.window-concept')", NAVIGATION_READY_TIMEOUT_MS);
    await this.evaluate(`(()=>{window.__SOL_BROWSER_ERRORS__={console:[],runtime:[]};const prior=console.error.bind(console);console.error=(...parts)=>{window.__SOL_BROWSER_ERRORS__.console.push(parts.map(String).join(' '));prior(...parts)};addEventListener('error',event=>window.__SOL_BROWSER_ERRORS__.runtime.push(event.error?.stack??event.message));addEventListener('unhandledrejection',event=>window.__SOL_BROWSER_ERRORS__.runtime.push(String(event.reason?.stack??event.reason)));return true})()`);
  }

  async collectErrors() {
    try {
      const errors = await this.evaluate("window.__SOL_BROWSER_ERRORS__ ?? {console:[],runtime:[]}", 3000);
      this.consoleErrors.push(...(errors?.console ?? []));
      this.runtimeErrors.push(...(errors?.runtime ?? []));
    } catch (_error) {
      // about:blank and a navigating document may not expose the capture object.
    }
  }

  async close() {
    await this.collectErrors();
    await fetch(`${this.origin}/session/${this.sessionId}`, { method: "DELETE" });
  }
}

class CdpConnection {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    socket.on("message", (raw) => {
      const message = JSON.parse(String(raw));
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      clearTimeout(pending.timer);
      if (message.error) pending.reject(new Error(`${message.error.message} (${message.error.code})`));
      else pending.resolve(message.result ?? {});
    });
    socket.on("error", (error) => {
      for (const pending of this.pending.values()) pending.reject(error);
      this.pending.clear();
    });
  }

  static async connect(url) {
    const socket = new WebSocket(url);
    await new Promise((resolveOpen, rejectOpen) => {
      socket.once("open", resolveOpen);
      socket.once("error", rejectOpen);
    });
    return new CdpConnection(socket);
  }

  async send(method, params = {}, timeout = CDP_COMMAND_TIMEOUT_MS) {
    const id = this.nextId++;
    const response = new Promise((resolveResponse, rejectResponse) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        rejectResponse(new Error(`Chromium CDP command timed out: ${method}`));
      }, timeout);
      this.pending.set(id, { resolve: resolveResponse, reject: rejectResponse, timer });
    });
    this.socket.send(JSON.stringify({ id, method, params }));
    return response;
  }

  async sendWithoutReply(method, params = {}) {
    this.socket.send(JSON.stringify({ id: this.nextId++, method, params }));
  }

  async close() {
    if (this.socket.readyState >= WebSocket.CLOSING) return;
    await new Promise((resolveClose) => {
      this.socket.once("close", resolveClose);
      this.socket.close();
      setTimeout(resolveClose, 400);
    });
  }
}

class CdpPage extends WebDriverPage {
  constructor(connection, capabilities) {
    super("cdp://local", "chromium", capabilities);
    this.connection = connection;
  }

  async evaluate(expression, timeout = CDP_COMMAND_TIMEOUT_MS) {
    const response = await this.connection.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true }, timeout);
    if (response.exceptionDetails) {
      const detail = response.exceptionDetails.exception?.description ?? response.exceptionDetails.text ?? "Chromium evaluation failed";
      throw new Error(detail);
    }
    return response.result?.value;
  }

  async poll(expression, timeout = 8000) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      const remaining = timeout - (Date.now() - started);
      try {
        if (await this.evaluate(`Boolean(${expression})`, Math.min(3000, Math.max(250, remaining)))) return;
      } catch (_error) {
        // Navigation can temporarily make the renderer unresponsive.
      }
      await delay(35);
    }
    throw new Error(`Timed out waiting for: ${expression}`);
  }

  async navigate(url) {
    await this.collectErrors();
    try {
      if (await this.evaluate(`location.href===${JSON.stringify(url)}&&document.readyState==='complete'&&Boolean(window.__SOL_STORE__)&&Boolean(document.querySelector('.window-concept'))`)) return;
    } catch (_error) {
      // about:blank or a prior failed navigation is not a reusable document.
    }
    // Under host pressure Chromium can commit and finish navigation while the
    // Page.navigate reply itself is delayed behind renderer IPC. Readiness is
    // the authoritative gate; do not let a delayed acknowledgement hide a
    // successfully loaded document or strand an orphaned pending promise.
    await this.connection.sendWithoutReply("Page.navigate", { url });
    await this.poll("document.readyState === 'complete' && window.__SOL_STORE__ && document.querySelector('.window-concept')", NAVIGATION_READY_TIMEOUT_MS);
    await this.evaluate(`(()=>{window.__SOL_BROWSER_ERRORS__={console:[],runtime:[]};const prior=console.error.bind(console);console.error=(...parts)=>{window.__SOL_BROWSER_ERRORS__.console.push(parts.map(String).join(' '));prior(...parts)};addEventListener('error',event=>window.__SOL_BROWSER_ERRORS__.runtime.push(event.error?.stack??event.message));addEventListener('unhandledrejection',event=>window.__SOL_BROWSER_ERRORS__.runtime.push(String(event.reason?.stack??event.reason)));return true})()`);
  }

  async screenshot(path) {
    const response = await this.connection.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
    writeFileSync(path, Buffer.from(response.data, "base64"));
  }

  async setWindowRect(width, height) {
    return this.connection.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false, screenWidth: width, screenHeight: height });
  }

  async reload() {
    await this.connection.send("Page.reload", { ignoreCache: true });
    await this.poll("document.readyState === 'complete' && window.__SOL_STORE__ && document.querySelector('.window-concept')", NAVIGATION_READY_TIMEOUT_MS);
    await this.evaluate(`(()=>{window.__SOL_BROWSER_ERRORS__={console:[],runtime:[]};const prior=console.error.bind(console);console.error=(...parts)=>{window.__SOL_BROWSER_ERRORS__.console.push(parts.map(String).join(' '));prior(...parts)};addEventListener('error',event=>window.__SOL_BROWSER_ERRORS__.runtime.push(event.error?.stack??event.message));addEventListener('unhandledrejection',event=>window.__SOL_BROWSER_ERRORS__.runtime.push(String(event.reason?.stack??event.reason)));return true})()`);
  }

  async close() {
    try { await this.collectErrors(); } catch (_error) { /* Browser may already be closing. */ }
    await this.connection.close();
  }
}

async function waitForEndpoint(origin, timeout = 10000, endpoint = "/status") {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      const response = await fetch(`${origin}${endpoint}`);
      if (response.ok) return response.json();
    } catch (_error) {
      // The browser or driver endpoint is still starting.
    }
    await delay(70);
  }
  throw new Error(`${BROWSER_KIND} automation endpoint did not start`);
}

async function startFirefoxBrowser() {
  const port = await freePort();
  const origin = `http://127.0.0.1:${port}`;
  const browser = spawn(process.env.PM_SOL_GECKODRIVER ?? "geckodriver", ["--host", "127.0.0.1", "--port", String(port)], { stdio: ["ignore", "pipe", "pipe"] });
  let browserStderr = "";
  browser.stdout.on("data", (chunk) => { browserStderr += String(chunk); });
  browser.stderr.on("data", (chunk) => { browserStderr += String(chunk); });
  await waitForEndpoint(origin, BROWSER_START_TIMEOUT_MS);
  const response = await fetch(`${origin}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ capabilities: { alwaysMatch: { browserName: "firefox", "moz:firefoxOptions": { args: ["-headless"], prefs: { "ui.prefersReducedMotion": 0 } } } } })
  });
  const payload = await response.json();
  if (!response.ok || payload.value?.error) throw new Error(payload.value?.message ?? "Could not start Firefox WebDriver session");
  const page = new WebDriverPage(origin, payload.value.sessionId, payload.value.capabilities);
  await page.setWindowRect(2400, 1200);
  return { browser, browserStderr: () => browserStderr, cleanup: () => {}, page };
}

async function startChromiumBrowser() {
  const port = await freePort();
  const origin = `http://127.0.0.1:${port}`;
  const profile = mkdtempSync(join(tmpdir(), "pm-sol-chromium-"));
  const binary = process.env.PM_SOL_CHROMIUM ?? "/home/sittingmongoose/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell";
  const args = [
    "--headless", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--no-proxy-server",
    "--disable-background-networking", "--disable-component-update", "--disable-default-apps", "--disable-extensions", "--disable-features=HttpsUpgrades,PaintHolding",
    "--allow-file-access-from-files", "--disable-web-security",
    "--disable-sync", "--metrics-recording-only", "--no-first-run", `--user-data-dir=${profile}`,
    "--remote-debugging-address=127.0.0.1", `--remote-debugging-port=${port}`, "about:blank"
  ];
  const browser = spawn(binary, args, { stdio: ["ignore", "pipe", "pipe"] });
  let browserStderr = "";
  browser.stdout.on("data", (chunk) => { browserStderr += String(chunk); });
  browser.stderr.on("data", (chunk) => { browserStderr += String(chunk); });
  const version = await waitForEndpoint(origin, BROWSER_START_TIMEOUT_MS, "/json/version");
  const targetResponse = await fetch(`${origin}/json/list`);
  const targets = await targetResponse.json();
  const target = targets.find((candidate) => candidate.type === "page");
  if (!targetResponse.ok || !target?.webSocketDebuggerUrl) throw new Error("Could not locate Chromium DevTools target");
  const connection = await CdpConnection.connect(target.webSocketDebuggerUrl);
  await connection.send("Page.enable");
  await connection.send("Runtime.enable");
  const page = new CdpPage(connection, {
    browserName: "chromium",
    browserVersion: String(version.Browser ?? "HeadlessChrome/unknown").split("/").at(-1),
    userAgent: version["User-Agent"],
    cdpVersion: version["Protocol-Version"]
  });
  await page.setWindowRect(2400, 1200);
  return {
    browser,
    browserStderr: () => browserStderr,
    cleanup: () => rmSync(profile, { recursive: true, force: true }),
    page
  };
}

async function startBrowser() {
  return BROWSER_KIND === "chromium" ? startChromiumBrowser() : startFirefoxBrowser();
}

const report = {
  schema_id: "pm.chat.5_6_sol.browser_acceptance.v3",
  model_label: "5.6 Sol",
  generated_at: new Date().toISOString(),
  base_url: BASE_URL,
  screenshot_root: resolve(SCREENSHOTS),
  source_fingerprint: {
    algorithm: "sha256",
    aggregate_sha256: sourceAggregateSha256,
    files: sourceFiles
  },
  execution_scope: {
    exact_check_name: CHECK_NAME || null,
    check_filter: CHECK_FILTER || null,
    skip_filters: CHECK_SKIP_FILTERS,
    matrix_themes: MATRIX_THEMES,
    matrix_widths: MATRIX_WIDTHS,
    matrix_windows: MATRIX_WINDOWS,
    boot_pages: BOOT_PAGES
  },
  environment: {},
  passed: 0,
  failed: 0,
  checks: [],
  matrices: {},
  console_errors: [],
  runtime_exceptions: [],
  observations: []
};

async function runCheck(name, fn) {
  const normalizedName = name.toLowerCase();
  if (CHECK_NAME && name !== CHECK_NAME) return;
  if (CHECK_FILTER && !normalizedName.includes(CHECK_FILTER)) return;
  if (CHECK_SKIP_FILTERS.some((filter) => normalizedName.includes(filter))) return;
  const started = Date.now();
  process.stdout.write(`RUN  ${name}\n`);
  try {
    const evidence = await fn();
    report.passed += 1;
    report.checks.push({ name, status: "pass", duration_ms: Date.now() - started, evidence: evidence ?? null });
    process.stdout.write(`PASS ${name} (${Date.now() - started}ms)\n`);
  } catch (error) {
    report.failed += 1;
    report.checks.push({ name, status: "fail", duration_ms: Date.now() - started, error: error.message });
    process.stdout.write(`FAIL ${name}: ${error.message}\n`);
  }
}

function featureSetupExpression(feature, theme, width) {
  return `(()=>{
    const store=window.__SOL_STORE__;
    store.reset({notify:false});
    const ui=store.getState().ui;
    ui.selectedWindow='window-05';
    ui.selectedThreadConcept='thread-02';
    ui.activeThreadId='thread-11';
    ui.theme=${JSON.stringify(theme)};
    ui.chatWidth=${Number(width)};
    ui.reducedMotion=true;
    ui.railOpen=true;
    ui.sidePanelOpen=false;
    ui.historyMode='closed';
    ui.artifact.state='closed';
    ui.mount='docked';
    ui.popup=null;
    ui.search={scope:'Current Thread',query:'',selectedResult:null};
    ui.context.selectedMessages=[];
    ui.context.mode='Off';
    ui.context.compactReceipt=null;
    ui.thoughts.keepActiveOpen=false;
    ui.question.phase='cancelled';
    ui.question.receipt='Questionnaire inactive for this feature inspection';
    ui.agentActive=false;
    const feature=${JSON.stringify(feature)};
    const selectRange=(threadId,messageId,expanded=false)=>{
      ui.activeThreadId=threadId;
      ui.search.selectedResult=messageId;
      ui.threadViews[threadId].longExpanded[messageId]=expanded;
    };
    switch(feature){
      case 'long assistant message collapsed': selectRange('thread-01','t01-m0014',false); break;
      case 'long assistant message expanded': selectRange('thread-01','t01-m0014',true); break;
      case 'long user message collapsed': selectRange('thread-03','t03-m0005',false); break;
      case 'long user message expanded': selectRange('thread-03','t03-m0005',true); break;
      case 'active activity summary': ui.agentActive=true; ui.workingSummary='Active work summary under inspection'; break;
      case 'completed activity history collapsed': selectRange('thread-01','t01-m0014',false); ui.threadViews['thread-01'].workExpanded['message-activity-activity-tastebook-01']=false; break;
      case 'completed activity history expanded': selectRange('thread-01','t01-m0014',false); ui.threadViews['thread-01'].workExpanded['message-activity-activity-tastebook-01']=true; break;
      case 'questionnaire active': ui.question.phase='open'; ui.question.queue.find(item=>item.id===ui.question.activeId).activeIndex=0; break;
      case 'questionnaire historical record': ui.question.phase='submitted'; ui.question.receipt='Submitted answers retained as a historical record'; break;
      case 'goal only': ui.workingSummary='Goal state inspection'; break;
      case 'todo only': ui.workingSummary='Todo state inspection'; break;
      case 'subagents only': ui.workingSummary='Subagent state inspection'; break;
      case 'diff only': ui.workingSummary='Diff state inspection'; break;
      case 'goal plus todo': ui.workingSummary='Goal and Todo composition inspection'; break;
      case 'goal plus todo plus subagents plus diff': ui.workingSummary='Full work composition inspection'; break;
      case 'search current thread': ui.activeThreadId='thread-04'; ui.popup='search'; ui.search.scope='Current Thread'; ui.search.query='provider'; break;
      case 'search all threads': ui.activeThreadId='thread-04'; ui.popup='search'; ui.search.scope='All Threads'; ui.search.query='provider'; break;
      case 'Context Lens selection': ui.context.selectedMessages=['t11-m0018']; ui.context.mode='Focus'; ui.popup='context'; break;
      case 'Context Lens applied state': ui.context.selectedMessages=['t11-m0018']; ui.context.mode='Subcompact'; ui.context.compactReceipt='Subcompacted 1 selected message region; rehydration handles retained'; ui.popup='context'; break;
      case 'active thought collapsed': selectRange('thread-05','t05-m0018',false); ui.thoughts.keepActiveOpen=false; break;
      case 'active thought expanded by setting': selectRange('thread-05','t05-m0018',false); ui.thoughts.keepActiveOpen=true; break;
      case 'composer working and empty': ui.agentActive=true; ui.threadViews['thread-11'].draft=''; break;
      case 'composer working with typed draft': ui.agentActive=true; ui.threadViews['thread-11'].draft='Redirect the active turn with this retained draft.'; break;
      case 'draft recovery': ui.threadViews['thread-11'].draft='Recovered local draft'; ui.threadViews['thread-11'].draftHistory=[{id:'audit-draft-1',text:'Earlier durable revision',savedAt:'2026-08-10T14:31:00.000Z'}]; ui.popup='draft-history'; break;
      case 'artifact shortcut and editor-tab handoff': ui.artifact.state='ready'; ui.artifact.selectedId='artifact-code'; break;
      case 'long-thread older-history jump': selectRange('thread-09','t09-m0025',true); break;
      case 'popout state restoration': ui.mount='popout'; ui.historyMode='pinned compact'; ui.artifact.state='ready'; ui.artifact.selectedId='artifact-report'; break;
    }
    store.dispatch({type:'set-status',value:'Feature matrix: '+feature,trigger:'test.feature_matrix'});
    return true;
  })()`;
}

const featureEvidenceExpression = `(()=>{
  const ui=window.__SOL_STORE__.getState().ui;
  const target=ui.search.selectedResult ? document.getElementById('message-'+ui.search.selectedResult) : null;
  const targetCopy=target?.querySelector('.message-copy');
  const primary=document.querySelector('.composer-primary span');
  const shell=document.querySelector('.pm-shell');
  const chat=document.querySelector('.chat-mount');
  const transcript=document.querySelector('[data-role="transcript"]');
  return {
    chat_width:chat?.offsetWidth??0, transcript_height:transcript?.clientHeight??0,
    root_scroll_width:document.documentElement.scrollWidth, viewport:innerWidth,
    messages:document.querySelectorAll('[data-message-id]').length,
    target_present:Boolean(target), target_collapsed:Boolean(targetCopy?.classList.contains('is-collapsed')),
    target_text_length:targetCopy?.querySelector('p')?.textContent.length??0,
    target_canonical_length:Number(targetCopy?.dataset.canonicalLength??0),
    target_focus_key:target?.dataset.focusKey??null,
    activity:document.querySelectorAll('.message-activity').length,
    activity_stages:document.querySelectorAll('.message-activity-stages article').length,
    work:document.querySelectorAll('.work-composition').length,
    question_active:document.querySelectorAll('.question-surface').length,
    question_historical:document.querySelectorAll('.question-receipt').length,
    goal:document.querySelectorAll('.goal-stave').length,
    todos:document.querySelectorAll('.todo-stave .todo-row').length,
    subagents:document.querySelectorAll('.agent-stave .agent-row').length,
    diff_text:document.querySelector('.score-work>footer>span')?.textContent??'',
    search_popup:document.querySelectorAll('.search-popup').length,
    search_results:document.querySelectorAll('[data-action="search-result"]').length,
    search_scope:ui.search.scope,
    context_popup:document.querySelectorAll('.context-popup').length,
    context_selected:ui.context.selectedMessages.length,
    context_selected_buttons:document.querySelectorAll('[data-action="context-toggle-message"][aria-pressed="true"]').length,
    context_receipt:ui.context.compactReceipt,
    thoughts:document.querySelectorAll('.thought-disclosure').length,
    thought_expanded:document.querySelectorAll('.thought-segment.is-expanded').length,
    composer_label:primary?.textContent??'', draft:document.querySelector('[data-role="composer-input"]')?.value??'',
    draft_popup:document.querySelectorAll('.draft-list .draft-revision').length,
    artifact:document.querySelectorAll('.artifact-region').length,
    editor_handoff_disabled:Boolean(document.querySelector('.artifact-region button[disabled]')),
    active_thread:ui.activeThreadId, full_thread_count:window.__SOL_DATA__.threadMap[ui.activeThreadId]?.messages?.length??0,
    mount:ui.mount, dom_mount:document.querySelector('.pm-stage')?.dataset.mount,
    history:document.querySelectorAll('.history-region').length,
    model_labels:[...document.querySelectorAll('[data-concept-model]')].map(node=>node.textContent.trim())
  };
})()`;

function assertFeatureState(feature, evidence) {
  assert(evidence.chat_width > 0 && (feature === "popout state restoration" || evidence.transcript_height >= 250), `${feature} lost the chat geometry: ${JSON.stringify(evidence)}`);
  assert(evidence.root_scroll_width <= evidence.viewport + 1, `${feature} leaked page-root overflow`);
  assert(evidence.model_labels.length >= 2 && evidence.model_labels.every((label) => label === "5.6 Sol"), `${feature} lost the exact model label`);
  if (feature === "baseline conversation") assert(evidence.messages >= 8, "baseline conversation lost its message history");
  if (feature.includes("long assistant") || feature.includes("long user")) {
    assert(evidence.target_present && evidence.target_canonical_length > 520, `${feature} did not load its long message`);
    const expanded = feature.endsWith("expanded");
    assert(evidence.target_collapsed !== expanded, `${feature} has the wrong collapse state`);
    assert(expanded ? evidence.target_text_length === evidence.target_canonical_length : evidence.target_text_length < evidence.target_canonical_length, `${feature} has the wrong visible content length`);
  }
  if (feature === "active activity summary") assert(evidence.work > 0 && evidence.composer_label === "Stop", "active activity summary lost active-turn state");
  if (feature.startsWith("completed activity history")) assert(evidence.activity === 1 && evidence.activity_stages === (feature.endsWith("expanded") ? 6 : 0), `${feature} has the wrong activity disclosure`);
  if (feature === "questionnaire active") assert(evidence.question_active === 1, "active questionnaire is missing");
  if (feature === "questionnaire historical record") assert(evidence.question_historical === 1, "historical questionnaire is missing");
  if (feature.includes("goal")) assert(evidence.goal === 1, `${feature} lost Goal`);
  if (feature.includes("todo")) assert(evidence.todos >= 8, `${feature} lost Todo rows`);
  if (feature.includes("subagents")) assert(evidence.subagents >= 3, `${feature} lost subagents`);
  if (feature.includes("diff")) assert(evidence.diff_text.includes("Diff"), `${feature} lost diff state`);
  if (feature.startsWith("search ")) assert(evidence.search_popup === 1 && evidence.search_results > 0 && evidence.search_scope === (feature.endsWith("all threads") ? "All Threads" : "Current Thread"), `${feature} search is incomplete`);
  if (feature === "Context Lens selection") assert(evidence.context_popup === 1 && evidence.context_selected === 1 && evidence.context_selected_buttons === 1, "Context Lens selection is not reflected in transcript and popup state");
  if (feature === "Context Lens applied state") assert(evidence.context_popup === 1 && evidence.context_selected === 1 && evidence.context_receipt?.includes("Subcompacted"), "Context Lens applied receipt is missing");
  if (feature.startsWith("active thought")) assert(evidence.thoughts === 1 && evidence.thought_expanded === (feature.endsWith("setting") ? 1 : 0), `${feature} violates its provider-summary disclosure state`);
  if (feature === "composer working and empty") assert(evidence.composer_label === "Stop" && evidence.draft === "", "empty active composer did not expose Stop");
  if (feature === "composer working with typed draft") assert(evidence.composer_label === "Send" && evidence.draft.length > 0, "typed active composer did not expose Send/redirect semantics");
  if (feature === "draft recovery") assert(evidence.draft_popup === 1 && evidence.draft === "Recovered local draft", "draft recovery state is incomplete");
  if (feature === "artifact shortcut and editor-tab handoff") assert(evidence.artifact === 1 && evidence.editor_handoff_disabled, "artifact handoff was not shown or truthfully disabled");
  if (feature === "long-thread older-history jump") assert(evidence.active_thread === "thread-09" && evidence.full_thread_count === 120 && evidence.target_present && evidence.target_focus_key === "message-t09-m0025", "older-history jump did not load the exact stored range");
  if (feature === "popout state restoration") assert(evidence.mount === "popout" && evidence.dom_mount === "popout" && evidence.history === 1 && evidence.artifact === 1, "pop-out restoration lost semantic state");
}

const semanticSnapshotExpression = `(()=>{
  const {ui}=window.__SOL_STORE__.getState();
  const activeQuestionnaire=ui.question?.queue?.find(item=>item.id===ui.question.activeId)??ui.question?.queue?.[0]??null;
  const visible=node=>Boolean(node&&node.getClientRects().length&&getComputedStyle(node).visibility!=='hidden');
  const bodyText=document.body.innerText;
  return {
    revision:ui.revision,
    activeThreadId:ui.activeThreadId,
    selectedWindow:ui.selectedWindow,
    selectedThreadConcept:ui.selectedThreadConcept,
    historyMode:ui.historyMode,
    mount:ui.mount,
    artifact:ui.artifact,
    question:{
      activeId:ui.question?.activeId??null,
      phase:ui.question?.phase??null,
      activeIndex:activeQuestionnaire?.activeIndex??null,
      answers:ui.question?.answers??{},
      skips:ui.question?.skips??{},
      validation:ui.question?.validation??'',
      receipt:ui.question?.receipt??null,
      queueLength:ui.question?.queue?.length??0
    },
    goal:ui.operational?.goal??null,
    todos:ui.operational?.todos??[],
    subagents:ui.operational?.subagents??[],
    crew:ui.operational?.crew??null,
    activity:ui.operational?.activity??[],
    activityPhase:ui.activityPhase??null,
    diff:ui.operational?.diff??null,
    approval:ui.approval??null,
    routeWarning:ui.routeWarning??null,
    communication:ui.communication??null,
    branch:ui.branch??null,
    spawnedThreads:ui.spawnedThreads??[],
    resourceSelection:ui.resourceSelection??null,
    route:ui.route??null,
    providerSetup:ui.providerSetup??null,
    access:ui.access??null,
    bsd:ui.bsd??null,
    context:ui.context??null,
    attachmentResolution:ui.attachmentResolution??null,
    network:ui.network??null,
    outbox:ui.outbox??[],
    replayedOperationIds:ui.replayedOperationIds??[],
    notification:ui.notification??null,
    statusLine:ui.statusLine??'',
    receipt:ui.triggerReceipts?.[0]??null,
    deterministicCounter:ui.deterministicCounter,
    deterministicTime:ui.deterministicTime,
    render:{
      history:document.querySelectorAll('.history-region').length,
      artifact:document.querySelectorAll('.artifact-region').length,
      question:document.querySelectorAll('.question-surface').length,
      questionReceipt:document.querySelectorAll('.question-receipt').length,
      validation:document.querySelectorAll('.validation-message').length,
      approval:document.querySelectorAll('.approval-card').length,
      warning:document.querySelectorAll('.route-warning-card').length,
      todoRows:document.querySelectorAll('.todo-row').length,
      agentRows:document.querySelectorAll('.agent-row').length,
      activityRows:document.querySelectorAll('.activity-row').length,
      providerSetup:document.querySelectorAll('.provider-setup-projection').length,
      notificationInbox:document.querySelectorAll('.titlebar-notification-inbox').length,
      artifactShortcut:document.querySelectorAll('[data-action="artifact-shortcut"],[data-action="artifact-open"]').length,
      composer:visible(document.querySelector('[data-role="composer-input"]')),
      bodyText
    }
  };
})()`;

function semanticCore(snapshot) {
  const copy = JSON.parse(JSON.stringify(snapshot));
  delete copy.revision;
  delete copy.receipt;
  delete copy.statusLine;
  delete copy.deterministicCounter;
  delete copy.deterministicTime;
  delete copy.render;
  return copy;
}

function semanticFingerprint(snapshot) {
  return JSON.stringify(semanticCore(snapshot));
}

async function prepareCorrectedTrigger(pageInstance, trigger) {
  await pageInstance.evaluate(`(()=>{
    const trigger=${JSON.stringify(trigger)};
    const store=window.__SOL_STORE__;
    store.reset();
    const ui=store.getState().ui;
    const firstTodo=ui.operational?.todos?.[0];
    const targetAgent=ui.operational?.subagents?.at(-1);
    if(trigger==='history.pin_compact')ui.historyMode='closed';
    if(trigger==='history.pin_full'){ui.chatWidth=1200;ui.historyMode='closed'}
    if(trigger==='history.unpin'){ui.chatWidth=1200;ui.historyMode='pinned full'}
    if(trigger==='history.switch_thread')ui.activeThreadId=window.__SOL_DATA__.threads?.[0]?.id??ui.activeThreadId;
    if(trigger==='question.open')ui.question.phase='cancelled';
    if(trigger==='question.cancel')ui.question.phase='open';
    if(trigger==='question.prepare')ui.question.phase='open';
    if(trigger==='question.submit')ui.question.phase='open';
    if(trigger==='goal.start'||trigger==='goal.resume')ui.operational.goal.state='paused';
    if(trigger==='goal.pause'||trigger==='goal.blocked'||trigger==='goal.complete')ui.operational.goal.state='running';
    if(trigger==='todo.complete'&&firstTodo)firstTodo.state='running';
    if(trigger==='todo.reopen'&&firstTodo)firstTodo.state='complete';
    if(trigger==='todo.block'&&firstTodo)firstTodo.state='running';
    if(trigger==='subagent.queue'&&targetAgent)targetAgent.state='requested';
    if(trigger==='subagent.progress'&&targetAgent)targetAgent.state='queued';
    if(trigger==='subagent.complete'&&targetAgent)targetAgent.state='running';
    if(trigger==='subagent.fail'&&targetAgent)targetAgent.state='running';
    if(trigger==='subagent.retry'&&targetAgent)targetAgent.state='failed';
    if(trigger==='artifact.loading')ui.artifact.state='ready';
    if(trigger==='artifact.ready')ui.artifact.state='loading';
    if(trigger==='artifact.error')ui.artifact.state='ready';
    if(trigger==='artifact.close')ui.artifact.state='ready';
    if(trigger==='decision.details'||trigger==='decision.approve'||trigger==='decision.deny')ui.approval={state:'pending',title:'Acceptance precondition',summary:'Prepared decision',evidenceOpen:false};
    if(trigger==='decision.branch')ui.routeWarning={state:'pending',title:'Acceptance precondition',detail:'Prepared route decision'};
    if(trigger==='thread.receive_response')ui.communication={state:'requested',message:'Prepared bounded request',source:ui.activeThreadId,target:'thread-03',requestId:'acceptance-request'};
    if(trigger==='system.reset'){
      ui.historyMode='closed';
      ui.artifact.state='error';
      ui.operational.goal.state='complete';
      ui.threadViews[ui.activeThreadId].draft='reset determinism sentinel';
    }
    store.dispatch({type:'set-status',value:'Prepared '+trigger,trigger:'test.prepare'});
    return true;
  })()`);
}

async function prepareSupplementalTrigger(pageInstance, trigger) {
  await pageInstance.evaluate(`(()=>{
    const trigger=${JSON.stringify(trigger)};
    const store=window.__SOL_STORE__;
    store.reset();
    const run=(value)=>store.dispatch({type:'run-trigger',value});
    if(trigger.startsWith('provider.')&&trigger!=='provider.setup_required')run('provider.setup_required');
    if(trigger==='provider.use_existing')run('provider.existing_found');
    if(['provider.install_approved','provider.install_verified','provider.install_failed','provider.auth_required','provider.authenticated','provider.readiness_verified','provider.continuation_resumed'].includes(trigger))run('provider.install_intent');
    if(['provider.install_verified','provider.install_failed','provider.auth_required','provider.authenticated','provider.readiness_verified','provider.continuation_resumed'].includes(trigger))run('provider.install_approved');
    if(['provider.auth_required','provider.authenticated','provider.readiness_verified','provider.continuation_resumed'].includes(trigger))run('provider.install_verified');
    if(['provider.readiness_verified','provider.continuation_resumed'].includes(trigger))run('provider.authenticated');
    if(trigger==='provider.continuation_resumed')run('provider.readiness_verified');
    if(trigger.startsWith('bsd.'))store.dispatch({type:'open-popup',value:'bsd'});
    if(trigger.startsWith('context.'))store.dispatch({type:'open-popup',value:'context'});
    if(trigger==='network.replay'){
      run('network.offline');
      store.dispatch({type:'set-draft',value:'Queued once for supplemental replay evidence'});
      store.dispatch({type:'queue-user-message',value:'Queued once for supplemental replay evidence'});
    }
    if(trigger==='scenario.reset'){
      store.dispatch({type:'history-set',value:'closed'});
      store.dispatch({type:'artifact-state',value:'error',message:'Supplemental reset sentinel'});
      run('network.offline');
    }
    const current=store.getState().ui;
    current.triggerReceipts=[];
    current.statusLine='Supplemental fixture prepared';
    return true;
  })()`);
}

function assertExactProviderProof(proof, setup, context) {
  const requiredValues = ["proof_id", "operation_id", "attempt_id", "installation_id", "provider_id", "provider_cli_product", "host_environment_ref", "execution_host_id", "execution_environment_id", "topology_generation", "official_source_kind", "official_source_ref", "publisher_identity", "package_or_artifact_identity", "manager_or_installer_identity", "version", "channel", "target_os", "target_architecture", "artifact_sha256", "license_ref", "redistribution_disposition", "compatibility_manifest_ref", "known_bad_check_ref", "download_receipt_ref", "observed_at"];
  for (const field of requiredValues) assert(proof?.[field] !== null && proof?.[field] !== undefined && proof?.[field] !== "", `${context} lacks canonical ProviderCliSupplyChainProof.${field}`);
  for (const field of ["installation_generation", "signature_or_attestation_ref", "trust_root_ref", "notarization_ref", "sbom_ref", "verification_receipt_ref", "rollback_artifact_proof_ref"]) assert(Object.prototype.hasOwnProperty.call(proof ?? {}, field), `${context} omits canonical ProviderCliSupplyChainProof.${field}`);
  assert(proof.fixture_only === true && proof.schema_id === "pm.provider_cli_supply_chain_proof.fixture.v1", `${context} is not explicitly fixture-only typed proof`);
  assert(proof.official_source_ref === setup.officialSourceRef && proof.execution_host_id === setup.hostId && proof.execution_environment_id === setup.environmentId && proof.topology_generation === setup.topologyGeneration, `${context} proof does not bind the exact official source, Host, Environment, and topology generation`);
  assert(proof.signature_or_attestation_ref && proof.trust_root_ref && !Object.prototype.hasOwnProperty.call(proof, "signature_or_trust_ref") && !Object.prototype.hasOwnProperty.call(proof, "rollback_receipt_ref"), `${context} uses non-canonical signature, trust, or rollback proof vocabulary`);
  assert(/^[a-f0-9]{64}$/.test(proof.artifact_sha256) && Number.isFinite(Date.parse(proof.observed_at)), `${context} has an invalid artifact digest or observation time`);
}

function assertSupplementalTriggerOutcome(trigger, before, after) {
  assert(semanticFingerprint(after) !== semanticFingerprint(before), `${trigger} changed only receipt bookkeeping`);
  if (trigger === "scenario.reset") {
    assert(after.receipt == null, "scenario.reset retained a trigger receipt");
    assert(after.historyMode === "pinned compact" && after.artifact?.state === "ready" && after.network?.transport === "Live", "scenario.reset did not restore canonical state");
    return;
  }
  assert(after.receipt?.trigger === trigger, `${trigger} did not produce its exact receipt`);
  assert(!String(after.receipt?.result ?? "").includes("truthfully unavailable"), `${trigger} is unavailable`);
  const [family, event] = trigger.split(".");
  if (family === "provider") {
    const setup = after.providerSetup;
    const plan = setup?.supplyChainPlan;
    const proof = setup?.supplyChainProof;
    assert(setup && plan?.fixture_only === true && plan.official_source_kind === setup.officialSourceKind && plan.official_source_ref === setup.officialSourceRef && plan.execution_host_id === setup.hostId && plan.execution_environment_id === setup.environmentId && plan.topology_generation === setup.expectedTopologyGeneration, `${trigger} lacks an exact pre-acquisition source-and-target contract`);
    if (proof) assertExactProviderProof(proof, setup, trigger);
    if (event === "setup_required") assert(setup.setupState === "required" && proof == null && after.render.providerSetup === 1, `${trigger} did not render the blocked pre-acquisition handoff`);
    if (event === "existing_found") assert(setup.installState === "existing installation found" && setup.discoveredInstallationRef && proof == null, `${trigger} did not expose discovery without falsely producing adoption proof`);
    if (event === "use_existing") assert(setup.installState === "selected existing" && setup.authState === "required" && proof?.proof_status === "existing_installation_selected_and_validated", `${trigger} conflated existing-install selection, adoption proof, or authentication`);
    if (event === "install_intent") assert(setup.installState === "consent required" && !setup.acquisitionConsentReceipt && proof == null, `${trigger} skipped consent or falsely produced proof before acquisition`);
    if (event === "install_approved") assert(setup.installState === "installing" && setup.acquisitionConsentReceipt, `${trigger} lacks explicit approval`);
    if (event === "install_verified") assert(setup.installState === "verified" && proof.proof_status === "verified_fixture_receipt" && proof.verification_receipt_ref, `${trigger} lacks a verified fixture receipt`);
    if (event === "install_failed") assert(setup.installState === "failed" && setup.authState !== "authenticated", `${trigger} did not preserve the auth boundary`);
    if (event === "auth_required") assert(["verified", "selected existing"].includes(setup.installState) && setup.authState === "required" && setup.readinessState === "blocked on authentication", `${trigger} advanced authentication without verified installation`);
    if (event === "authenticated") assert(setup.setupState === "readiness verification required" && setup.authState === "authenticated" && setup.readinessState === "verification required", `${trigger} conflated auth and readiness`);
    if (event === "readiness_verified") assert(setup.setupState === "ready" && setup.readinessState === "model ready", `${trigger} did not verify model readiness`);
    if (event === "continuation_resumed") assert(setup.result === "resumed once" && setup.resumeCount === 1 && setup.current === false && setup.currentnessReasons.includes("continuation already consumed"), `${trigger} did not consume the continuation exactly once`);
    if (event === "continuation_stale_rejected") assert(setup.result === "stale rejected" && setup.current === false && setup.currentnessReasons.includes("operation revision changed"), `${trigger} did not derive superseded-operation staleness`);
    if (event === "continuation_expired_rejected") assert(setup.result === "expired rejected" && setup.current === false && setup.currentnessReasons.includes("continuation expired"), `${trigger} did not derive expiry staleness`);
    if (event === "continuation_topology_mismatch_rejected") assert(setup.result === "topology mismatch rejected" && setup.current === false && setup.currentnessReasons.includes("topology generation changed"), `${trigger} did not derive topology staleness`);
  }
  if (family === "attachment") assert(after.attachmentResolution?.state === event && after.render.bodyText.includes(after.attachmentResolution.detail), `${trigger} has no visible attachment outcome`);
  if (family === "context") {
    if (event === "lens") assert(after.context?.lensOpen === true && after.context?.mode === "Focus", `${trigger} did not open the Lens`);
    if (event === "compact_now") assert(Boolean(after.context?.compactReceipt) && after.render.bodyText.includes(after.context.compactReceipt), `${trigger} lacks a visible compaction receipt`);
  }
  if (family === "bsd") {
    const expectedState = { off: "off", auto_idle: "idle", auto_active: "evaluating", on: "on", advice: "advice", timeout: "timeout", unavailable: "unavailable" }[event];
    assert(after.bsd?.state === expectedState && after.bsd?.message && after.render.bodyText.includes(after.bsd.message), `${trigger} lacks its visible BSD outcome`);
  }
  if (family === "network") {
    if (event === "offline") assert(after.network?.transport === "Offline", `${trigger} did not separate transport state`);
    if (event === "domain_failure") assert(after.network?.transport !== "Offline" && after.network?.domain === "Error" && /continuing/i.test(after.network?.serverWork), `${trigger} did not separate domain failure from server continuation`);
    if (event === "reconnect") assert(after.network?.transport === "Synchronizing" && after.network?.domain === "Replay pending", `${trigger} did not enter reconnect`);
    if (event === "replay") assert(after.replayedOperationIds.length === 1 && after.outbox.filter((item) => item.state === "delivered").length === 1, `${trigger} did not replay one stable operation exactly once`);
    if (event === "snapshot") assert(after.network?.snapshotCursor > before.network?.snapshotCursor, `${trigger} did not advance the snapshot cursor`);
  }
  if (trigger === "notification.inline_outcome") assert(after.notification?.state === "open" && after.notification?.unread === 0 && after.notification?.items?.[0]?.id === "fixture-notification-task-outcome" && after.render.notificationInbox === 1 && after.render.bodyText.includes(after.notification.items[0].detail), `${trigger} did not render the title-bar inbox outcome`);
}

function assertCorrectedTriggerOutcome(trigger, before, after) {
  const [family, event] = trigger.split(".");
  assert(after.receipt?.trigger === trigger, `${trigger} did not produce its exact receipt`);
  assert(!String(after.receipt?.result ?? "").includes("truthfully unavailable"), `${trigger} is unavailable`);
  assert(semanticFingerprint(after) !== semanticFingerprint(before), `${trigger} changed only receipt bookkeeping`);

  if (family === "history") {
    if (event === "peek") assert(after.historyMode === "peek" && after.render.history === 1, `${trigger} did not render peek history`);
    if (event === "pin_compact") assert(after.historyMode === "pinned compact" && after.render.history === 1, `${trigger} did not pin compact history`);
    if (event === "pin_full") assert(after.historyMode === "pinned full" && after.render.history === 1, `${trigger} did not pin full history`);
    if (event === "unpin") assert(["peek", "closed", "unpinned"].includes(after.historyMode), `${trigger} left history pinned as ${after.historyMode}`);
    if (event === "switch_thread") assert(after.activeThreadId !== before.activeThreadId, `${trigger} did not switch threads`);
  }
  if (family === "question") {
    if (event === "prepare") assert(after.question.phase === "preparing", `${trigger} phase is ${after.question.phase}`);
    if (event === "open") assert(after.question.phase === "open" && after.render.question === 1, `${trigger} did not render an open questionnaire`);
    if (event === "select") assert(Object.keys(after.question.answers).length > Object.keys(before.question.answers).length, `${trigger} did not select an answer`);
    if (event === "next") assert(after.question.activeIndex !== before.question.activeIndex || after.question.activeId !== before.question.activeId, `${trigger} did not advance the queue`);
    if (event === "validation_error") assert(Boolean(after.question.validation) && after.render.validation === 1, `${trigger} did not render validation`);
    if (event === "skip") assert(Object.values(after.question.skips).filter(Boolean).length > Object.values(before.question.skips).filter(Boolean).length, `${trigger} did not record a reversible skip`);
    if (event === "cancel") assert(after.question.phase === "cancelled" && after.render.composer, `${trigger} did not restore the ordinary composer`);
    if (event === "submit") assert(["submitting", "submitted"].includes(after.question.phase) && after.render.question + after.render.questionReceipt === 1, `${trigger} did not enter a submitted lifecycle`);
  }
  if (family === "goal") {
    if (event === "start" || event === "resume") assert(after.goal?.state === "running", `${trigger} state is ${after.goal?.state}`);
    if (event === "progress") assert(Number(after.goal?.progress) > Number(before.goal?.progress), `${trigger} did not increase progress`);
    if (event === "pause") assert(after.goal?.state === "paused", `${trigger} state is ${after.goal?.state}`);
    if (event === "update") assert(after.goal?.objective !== before.goal?.objective || after.goal?.phase !== before.goal?.phase, `${trigger} did not update the visible Goal`);
    if (event === "replan") assert(String(after.goal?.state).includes("replan") || String(after.goal?.phase).toLowerCase().includes("replan"), `${trigger} did not enter replan state`);
    if (event === "blocked") assert(after.goal?.state === "blocked" && Boolean(after.goal?.blockedReason), `${trigger} lacks blocked evidence`);
    if (event === "complete") assert(after.goal?.state === "complete" && Number(after.goal?.progress) === 100, `${trigger} did not complete Goal`);
  }
  if (family === "todo") {
    if (event === "add") assert(after.todos.length === before.todos.length + 1, `${trigger} did not create a Todo`);
    if (event === "complete") assert(after.todos.some((item, index) => item.state === "complete" && before.todos[index]?.state !== "complete"), `${trigger} did not complete a Todo`);
    if (event === "reopen") assert(after.todos.some((item, index) => ["pending", "running", "reopened"].includes(item.state) && before.todos[index]?.state === "complete"), `${trigger} did not reopen a Todo`);
    if (event === "block") assert(after.todos.some((item, index) => item.state === "blocked" && before.todos[index]?.state !== "blocked"), `${trigger} did not block a Todo`);
  }
  if (family === "subagent") {
    if (event === "spawn") assert(after.subagents.length === before.subagents.length + 1, `${trigger} did not create a child/subagent`);
    const expected = { queue: "queued", progress: "running", complete: "complete", fail: "failed", retry: "retrying" }[event];
    if (expected) assert(after.subagents.some((item, index) => item.state === expected && before.subagents[index]?.state !== expected), `${trigger} did not reach ${expected}`);
  }
  if (family === "activity") assert(JSON.stringify(after.activity) !== JSON.stringify(before.activity) || after.activityPhase !== before.activityPhase, `${trigger} did not mutate activity history`);
  if (family === "diff") {
    if (event === "create") assert(after.diff?.state === "created", `${trigger} state is ${after.diff?.state}`);
    if (event === "update") assert(after.diff?.state === "updated" && (after.diff?.additions !== before.diff?.additions || after.diff?.deletions !== before.diff?.deletions), `${trigger} did not change diff totals`);
    if (event === "open") assert(after.artifact?.state !== "closed" && String(after.artifact?.selectedId).includes("diff") && after.render.artifact === 1, `${trigger} did not open the linked diff artifact`);
  }
  if (family === "artifact") {
    if (["loading", "ready", "error"].includes(event)) assert(after.artifact?.state === event, `${trigger} state is ${after.artifact?.state}`);
    if (event === "switch") assert(after.artifact?.selectedId !== before.artifact?.selectedId && after.artifact?.state !== "closed", `${trigger} did not retain a changed artifact identity`);
    if (event === "close") assert(after.artifact?.state === "closed" && after.render.artifact === 0, `${trigger} did not close the artifact`);
  }
  if (family === "decision") {
    if (event === "approval_open") assert(after.approval?.state === "pending" && after.render.approval === 1, `${trigger} did not render approval`);
    if (event === "details") assert(after.approval?.evidenceOpen === true, `${trigger} did not expose decision details`);
    if (event === "approve") assert(["approved", "approved once"].includes(after.approval?.state), `${trigger} decision state is ${after.approval?.state}`);
    if (event === "deny") assert(["denied", "declined"].includes(after.approval?.state), `${trigger} decision state is ${after.approval?.state}`);
    if (event === "branch") assert(after.branch?.state === "branched", `${trigger} did not create a branch outcome`);
  }
  if (family === "thread") {
    if (event === "send_request") assert(after.communication?.state === "requested" && Boolean(after.communication?.requestId), `${trigger} did not create a bounded request`);
    if (event === "receive_response") assert(["received", "complete", "responded"].includes(after.communication?.state), `${trigger} state is ${after.communication?.state}`);
    if (event === "spawn_related") assert(after.spawnedThreads.length === before.spawnedThreads.length + 1 || after.communication?.state === "spawned", `${trigger} did not spawn a related thread`);
    if (event === "branch") assert(after.branch?.state === "branched", `${trigger} did not branch`);
  }
  if (family === "system") {
    if (event === "port_collision") assert(String(after.resourceSelection).toLowerCase().includes("port"), `${trigger} did not select a safe port outcome`);
    if (event === "worktree_collision") assert(String(after.resourceSelection).toLowerCase().includes("worktree"), `${trigger} did not select an isolated worktree outcome`);
  }
}

const { browser, browserStderr, cleanup, page } = await startBrowser();

try {
  report.environment = BROWSER_KIND === "chromium"
    ? { product: `Chromium ${page.capabilities.browserVersion}`, engine: "Blink", user_agent: page.capabilities.userAgent, viewport: "2400x1200", automation: `Chrome DevTools Protocol ${page.capabilities.cdpVersion}` }
    : { product: `Firefox ${page.capabilities.browserVersion}`, engine: "Gecko", user_agent: page.capabilities.userAgent, viewport: "2400x1200", automation: `geckodriver ${page.capabilities.mozGeckodriverVersion ?? page.capabilities["moz:geckodriverVersion"]}` };

  await runCheck("all entry pages boot with exact model label", async () => {
    assert(BOOT_PAGES.length === PAGES.length && PAGES.every((file) => BOOT_PAGES.includes(file)), `boot gate requires all ${PAGES.length} entry pages; received ${BOOT_PAGES.length}`);
    const entries = [];
    for (const file of BOOT_PAGES) {
      await page.navigate(new URL(file, BASE_URL).href);
      const evidence = await page.evaluate(`(()=>({
        file:${JSON.stringify("__FILE__")},
        fatal:Boolean(document.querySelector('.fatal-state')),
        labels:[...document.querySelectorAll('[data-concept-model]')].map(node=>node.textContent.trim()),
        window:document.querySelector('.window-concept')?.dataset.windowConcept,
        thread:document.querySelector('.thread-concept')?.dataset.threadConcept,
        messages:document.querySelectorAll('[data-message-id]').length
      }))()`.replace('"__FILE__"', JSON.stringify(file)));
      assert(!evidence.fatal, `${file} rendered fatal state`);
      assert(evidence.labels.length >= 2 && evidence.labels.every((label) => label === "5.6 Sol"), `${file} has an inexact model label`);
      assert(evidence.messages >= 8, `${file} did not render the deep conversation fixture`);
      if (file.startsWith("window-")) assert(evidence.window === file.replace(".html", ""), `${file} mounted ${evidence.window}`);
      if (file.startsWith("thread-")) assert(evidence.thread === file.replace(".html", ""), `${file} mounted ${evidence.thread}`);
      entries.push(evidence);
    }
    return { page_count: entries.length, entries };
  });

  await runCheck("interface standards reject emoji, colored left accents, dead controls, and raw states", async () => {
    const sourceFiles = [
      ...PAGES,
      "shared/app.js", "shared/base.css", "shared/definitions.js", "shared/icons.js", "shared/primitives.js", "shared/selectors.js", "shared/state.js",
      "windows/windows.js", "threads/threads.js", "data/original_demoData.json", "data/sol-extensions.json"
    ];
    const sources = sourceFiles.map((file) => ({ file, text: readFileSync(join(ROOT, file), "utf8") }));
    const emoji = sources.flatMap(({ file, text }) => [...text.matchAll(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu)].map((match) => ({ file, value: match[0], index: match.index })));
    const css = sources.find((source) => source.file === "shared/base.css")?.text ?? "";
    const coloredLeft = [...css.matchAll(/border-(?:inline-start|left)(?:-color)?\s*:[^;\n}]*(?:accent|positive|negative|warning|info)/gi)].map((match) => match[0]);
    assert(emoji.length === 0, `emoji found: ${JSON.stringify(emoji.slice(0, 5))}`);
    assert(coloredLeft.length === 0, `colored left-edge accents found: ${coloredLeft.join(" | ")}`);
    assert(css.includes("::-webkit-scrollbar") && css.includes("scrollbar-color"), "custom scrollbar coverage is absent");
    await page.navigate(new URL("index.html", BASE_URL).href);
    await page.evaluate("window.__SOL_STORE__.reset(); true");
    const dom = await page.evaluate(`(()=>({dead:[...document.querySelectorAll('button:not([disabled]):not([data-action])')].map(node=>node.textContent.trim()).filter(Boolean),disabledWithoutReason:[...document.querySelectorAll('button[disabled]')].filter(node=>!node.title).map(node=>node.textContent.trim()),rawStates:[...document.querySelectorAll('.state-word')].map(node=>node.textContent.trim()).filter(value=>value.includes('_'))}))()`);
    assert(dom.dead.length === 0, `enabled buttons without actions: ${dom.dead.join(" | ")}`);
    assert(dom.disabledWithoutReason.length === 0, `disabled controls without reasons: ${dom.disabledWithoutReason.join(" | ")}`);
    assert(dom.rawStates.length === 0, `raw underscored states: ${dom.rawStates.join(" | ")}`);
    return { source_files: sourceFiles.length, emoji: 0, colored_left_accents: 0, custom_scrollbars: true, dead_enabled_buttons: 0, disabled_without_reason: 0, raw_underscored_states: 0 };
  });

  await runCheck("semantic type floors, metadata contrast, and dense work headers remain resolved", async () => {
    await page.navigate(new URL("index.html", BASE_URL).href);
    const rows = [];
    for (const theme of THEMES) {
      for (const threadId of THREADS) {
        await page.evaluate(`(()=>{const store=window.__SOL_STORE__;const ui=store.getState().ui;ui.theme=${JSON.stringify(theme)};ui.selectedThreadConcept=${JSON.stringify(threadId)};ui.chatWidth=750;ui.historyMode='closed';ui.artifact.state='closed';ui.question.phase='open';ui.reducedMotion=true;store.dispatch({type:'set-status',value:'Legibility probe',trigger:'test.legibility'});return true})()`);
        const evidence = await page.evaluate(`(()=>{
          const minSize=(selector)=>{const sizes=[...document.querySelectorAll(selector)].filter(node=>{const rect=node.getBoundingClientRect();const style=getComputedStyle(node);return rect.width>0&&rect.height>0&&style.display!=='none'&&style.visibility!=='hidden'}).map(node=>parseFloat(getComputedStyle(node).fontSize));return sizes.length?Math.min(...sizes):null};
          const parseOklch=(value)=>{const match=String(value).trim().match(/oklch\\(\\s*([\\d.]+)%\\s+([\\d.]+)\\s+([\\d.-]+)/i);if(!match)throw new Error('Could not parse '+value);return [Number(match[1])/100,Number(match[2]),Number(match[3])];};
          const luminance=(value)=>{const [L,C,H]=parseOklch(value);const angle=H*Math.PI/180;const a=C*Math.cos(angle);const b=C*Math.sin(angle);const l=Math.pow(L+.3963377774*a+.2158037573*b,3);const m=Math.pow(L-.1055613458*a-.0638541728*b,3);const s=Math.pow(L-.0894841775*a-1.291485548*b,3);const clamp=value=>Math.max(0,Math.min(1,value));const r=clamp(4.0767416621*l-3.3077115913*m+.2309699292*s);const g=clamp(-1.2684380046*l+2.6097574011*m-.3413193965*s);const blue=clamp(-.0041960863*l-.7034186147*m+1.707614701*s);return .2126*r+.7152*g+.0722*blue;};
          const contrast=(a,b)=>{const first=luminance(a);const second=luminance(b);return (Math.max(first,second)+.05)/(Math.min(first,second)+.05);};
          const root=getComputedStyle(document.documentElement);const token=name=>root.getPropertyValue(name).trim();
          const scoreLabel=document.querySelector('.score-work>header>div:nth-child(2)>span');const scoreSummary=document.querySelector('.score-work>header>div:nth-child(2)>strong');
          const benchLabel=document.querySelector('.workshop-work>header>div>span');const benchSummary=document.querySelector('.workshop-work>header>div>strong');
          const overlap=(a,b)=>{if(!a||!b)return false;const ar=a.getBoundingClientRect();const br=b.getBoundingClientRect();return Math.min(ar.right,br.right)-Math.max(ar.left,br.left)>.5&&Math.min(ar.bottom,br.bottom)-Math.max(ar.top,br.top)>.5};
          const headerText=[scoreSummary,benchSummary].filter(Boolean);return {
            copy_px:minSize('.message-copy'),
            action_px:minSize('.message-actions,.message-actions .button'),
            context_meta_px:minSize('.chat-kicker,.thread-location,.thread-sync-line'),
            work_meta_px:minSize('.work-composition>header>span,.score-work>header>div:nth-child(2)>span,.workshop-work>header>div>span,.quiet-runline>span,.quiet-register-columns>section>span'),
            work_row_px:minSize('.work-composition .todo-row strong,.work-composition .agent-row strong,.work-composition .activity-row strong,.work-composition .resource-row strong'),
            metadata_surface_contrast:contrast(token('--ink-3'),token('--surface')),
            metadata_raised_contrast:contrast(token('--ink-3'),token('--surface-2')),
            score_header_overlap:overlap(scoreLabel,scoreSummary),bench_header_overlap:overlap(benchLabel,benchSummary),
            clipped_dense_headers:headerText.filter(node=>node.scrollWidth>node.clientWidth+1).length
          };
        })()`);
        assert(evidence.copy_px >= 15.9, `${theme} ${threadId} message copy fell to ${evidence.copy_px}px`);
        assert(evidence.action_px >= 10.9 && evidence.context_meta_px >= 10.9 && evidence.work_meta_px >= 10.9, `${theme} ${threadId} metadata fell below 11px: ${JSON.stringify(evidence)}`);
        assert(evidence.work_row_px >= 11.9, `${theme} ${threadId} work-row text fell to ${evidence.work_row_px}px`);
        assert(evidence.metadata_surface_contrast >= 6 && evidence.metadata_raised_contrast >= 6, `${theme} metadata contrast was ${evidence.metadata_surface_contrast.toFixed(2)} / ${evidence.metadata_raised_contrast.toFixed(2)}`);
        assert(!evidence.score_header_overlap && !evidence.bench_header_overlap && evidence.clipped_dense_headers === 0, `${theme} ${threadId} retained a dense-header collision`);
        rows.push({ theme, thread: threadId, status: "pass", ...evidence });
      }
    }
    report.matrices.legibility = rows;
    return { passing_cells: rows.length, body_floor_px: 16, metadata_floor_px: 11, work_row_floor_px: 12, metadata_contrast_floor: 6 };
  });

  await page.navigate(new URL("index.html", BASE_URL).href);
  await page.evaluate("localStorage.clear(); window.__SOL_STORE__.reset(); true");

  await runCheck("all 64 window-thread pairings render independently", async () => {
    const pairings = [];
    await page.dispatch({ type: "toggle-reduced-motion", value: true });
    await page.dispatch({ type: "history-set", value: "closed" });
    await page.dispatch({ type: "artifact-state", value: "closed" });
    for (const windowId of WINDOWS) {
      for (const threadId of THREADS) {
        await page.evaluate(`(()=>{const s=window.__SOL_STORE__;const live=s.getState().ui;live.selectedWindow=${JSON.stringify(windowId)};live.selectedThreadConcept=${JSON.stringify(threadId)};s.dispatch({type:'set-status',value:'Pairing probe',trigger:'test.pairing'});return true})()`);
        const evidence = await page.evaluate(`(()=>{const w=document.querySelector('.window-concept');const t=document.querySelector('.thread-concept');const tr=document.querySelector('[data-role="transcript"]');const chat=document.querySelector('.chat-mount');const composer=document.querySelector('[data-role="composer-input"]');const composerRect=composer?.getBoundingClientRect();const visibleActions=[...document.querySelectorAll('button:not([disabled]),select:not([disabled]),input:not([disabled]),textarea:not([disabled])')].filter(node=>node.getClientRects().length&&getComputedStyle(node).visibility!=='hidden');return {
          window:w?.dataset.windowConcept,thread:t?.dataset.threadConcept,window_count:document.querySelectorAll('.window-concept').length,thread_count:document.querySelectorAll('.thread-concept').length,
          question_count:document.querySelectorAll('.question-surface').length,work_count:document.querySelectorAll('.work-composition').length,message_count:document.querySelectorAll('[data-message-id]').length,
          transcript_height:tr?.clientHeight ?? 0,fatal:Boolean(document.querySelector('.fatal-state')),
          root_scroll_width:document.documentElement.scrollWidth,viewport_width:innerWidth,chat_scroll_width:chat?.scrollWidth??0,chat_width:chat?.clientWidth??0,
          composer:Boolean(composer),composer_visible:Boolean(composerRect&&composerRect.width>0&&composerRect.height>0&&composerRect.left>=0&&composerRect.right<=innerWidth+1&&composerRect.bottom<=innerHeight+1),thread_height:t?.clientHeight??0,header_height:document.querySelector('.chat-header')?.clientHeight??0,sync_height:document.querySelector('.thread-sync-line')?.clientHeight??0,composer_zone_height:document.querySelector('.composer-zone')?.clientHeight??0,composer_held_height:document.querySelector('.composer-held')?.clientHeight??0,
          visible_controls:visibleActions.length,unbound_buttons:visibleActions.filter(node=>node.tagName==='BUTTON'&&!node.dataset.action).map(node=>node.textContent.trim()).filter(Boolean)
        }})()`);
        assert(evidence.window === windowId && evidence.thread === threadId, `${windowId} x ${threadId} mounted incorrectly`);
        assert(evidence.window_count === 1 && evidence.thread_count === 1, `${windowId} x ${threadId} duplicated a root`);
        assert(evidence.question_count === 1 && evidence.work_count === 1, `${windowId} x ${threadId} lost its distinct question/work grammar`);
        assert(evidence.message_count >= 8 && evidence.transcript_height >= 250 && !evidence.fatal, `${windowId} x ${threadId} is incomplete: ${JSON.stringify(evidence)}`);
        assert(evidence.root_scroll_width <= evidence.viewport_width + 1 && evidence.chat_scroll_width <= evidence.chat_width + 1, `${windowId} x ${threadId} leaked horizontal overflow`);
        assert(evidence.composer && evidence.composer_visible, `${windowId} x ${threadId} lost the reachable composer`);
        assert(evidence.visible_controls >= 12 && evidence.unbound_buttons.length === 0, `${windowId} x ${threadId} has incomplete or unbound controls: ${evidence.unbound_buttons.join(" | ")}`);
        pairings.push({ window: windowId, thread: threadId, status: "pass", visible_controls: evidence.visible_controls });
      }
    }
    report.matrices.pairings = pairings;
    return { passing_pairings: pairings.length };
  });

  await runCheck("all eight questionnaire grammars preserve one durable lifecycle", async () => {
    const expectedQuestionClasses = ["edition-question", "score-question", "time-question", "branch-question", "workshop-question", "braid-question", "relay-question", "quiet-question"];
    const expectedWorkClasses = ["edition-work", "score-work", "time-work", "branch-work", "workshop-work", "braided-work", "relay-work", "quiet-work"];
    const grammars = [];
    for (let index = 0; index < THREADS.length; index += 1) {
      await page.evaluate("window.__SOL_STORE__.reset(); true");
      await page.dispatch({ type: "select-thread-concept", value: THREADS[index] });
      await page.dispatch({ type: "history-set", value: "closed" });
      await page.dispatch({ type: "artifact-state", value: "closed" });
      await page.dispatch({ type: "run-trigger", value: "question.open" });
      const initial = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;const surface=document.querySelector('.question-surface');return {className:surface?.className,index:ui.question.queue.find(item=>item.id===ui.question.activeId)?.activeIndex,prompt:document.querySelector('#question-prompt')?.textContent,workClass:document.querySelector('.work-composition')?.className}})()`);
      assert(initial.className?.includes(expectedQuestionClasses[index]), `${THREADS[index]} used ${initial.className}`);
      assert(initial.workClass?.includes(expectedWorkClasses[index]), `${THREADS[index]} work grammar used ${initial.workClass}`);
      await page.dispatch({ type: "run-trigger", value: "question.answer" });
      const answerCount = await page.evaluate("Object.keys(window.__SOL_STORE__.getState().ui.question.answers).length");
      await page.dispatch({ type: "question-next" });
      const nextIndex = await page.evaluate("window.__SOL_STORE__.getState().ui.question.queue.find(item=>item.id===window.__SOL_STORE__.getState().ui.question.activeId).activeIndex");
      await page.dispatch({ type: "question-back" });
      await page.dispatch({ type: "question-cancel" });
      const cancelled = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {phase:ui.question.phase,composer:Boolean(document.querySelector('[data-role="composer-input"]')),answers:Object.keys(ui.question.answers).length}})()`);
      await page.dispatch({ type: "run-trigger", value: "question.open" });
      const restoredAnswers = await page.evaluate("Object.keys(window.__SOL_STORE__.getState().ui.question.answers).length");
      assert(answerCount === 1 && nextIndex === 1, `${THREADS[index]} did not navigate after a durable answer`);
      assert(cancelled.phase === "cancelled" && cancelled.composer && restoredAnswers === 1, `${THREADS[index]} lost lifecycle state or the ordinary composer`);
      grammars.push({ thread: THREADS[index], question_class: expectedQuestionClasses[index], work_class: expectedWorkClasses[index], answer_persisted_after_cancel: true });
    }
    report.matrices.questionnaire_grammars = grammars;
    return { passing_grammars: grammars.length };
  });

  await runCheck("questionnaire queue validates, skips, revisits, submits, restores focus, and isolates threads", async () => {
    await page.evaluate("window.__SOL_STORE__.reset(); true");
    await page.dispatch({ type: "toggle-reduced-motion", value: true });
    await page.dispatch({ type: "set-width", value: 520 });
    await page.dispatch({ type: "run-trigger", value: "question.prepare" });
    assert(await page.evaluate("window.__SOL_STORE__.getState().ui.question.phase === 'preparing'"), "question preparation state was skipped");
    await page.dispatch({ type: "run-trigger", value: "question.open" });
    const sourceThread = await page.evaluate("window.__SOL_STORE__.getState().ui.activeThreadId");
    const firstId = await page.evaluate("window.__SOL_STORE__.getState().ui.question.activeId");
    await page.click('[data-action="question-answer"]', 0);
    await page.click('[data-action="question-next"]');
    await delay(50);
    const focusAfterNext = await page.evaluate("document.activeElement?.dataset.focusKey ?? null");
    assert(focusAfterNext === "question-prompt", `question Next returned focus to ${focusAfterNext}`);
    await page.click('[data-action="question-next"]');
    const validation = await page.evaluate(`(()=>({message:window.__SOL_STORE__.getState().ui.question.validation,visible:Boolean(document.querySelector('.validation-message'))}))()`);
    assert(validation.message && validation.visible, "required question did not render a validation error");
    await page.click('[data-action="question-skip"]');
    const skippedQuestion = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;const q=ui.question.queue.find(item=>item.id===ui.question.activeId);return q.questions[q.activeIndex].id})()`);
    await page.click('[data-action="question-next"]');
    await page.click('[data-action="question-back"]');
    const revisited = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {skipped:Boolean(ui.question.skips[${JSON.stringify(skippedQuestion)}]),undo:[...document.querySelectorAll('[data-action="question-skip"]')].some(node=>node.textContent.includes('Undo'))}})()`);
    assert(revisited.skipped && revisited.undo, "skipped answer was not reversible on revisit");
    await page.click('[data-action="question-next"]');
    let guard = 0;
    while (await page.evaluate("Boolean(document.querySelector('[data-action=\"question-next\"]'))")) {
      await page.click('[data-action="question-skip"]');
      await page.click('[data-action="question-next"]');
      guard += 1;
      assert(guard < 12, "questionnaire did not reach its submit boundary");
    }
    const submitControl = await page.evaluate("Boolean(document.querySelector('[data-action=\"question-submit\"]'))");
    assert(submitControl, "questionnaire did not expose Submit at its final question");
    await page.click('[data-action="question-submit"]');
    const submitting = await page.evaluate("window.__SOL_STORE__.getState().ui.question.phase");
    assert(submitting === "submitting", `question submission phase was ${submitting}`);
    await page.click('[data-action="question-submitted"]');
    await delay(50);
    const completed = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {activeId:ui.question.activeId,phase:ui.question.phase,receipt:ui.question.receipt,queue:ui.question.queue.map(item=>({id:item.id,state:item.state})),historical:Boolean(document.querySelector('.question-receipt'))}})()`);
    assert(Boolean(completed.receipt) && completed.historical, "submitted questionnaire has no historical receipt");
    assert(completed.queue.length >= 2 && completed.activeId !== firstId, "completed questionnaire did not advance the queued questionnaire");

    await page.dispatch({ type: "run-trigger", value: "question.open" });
    await page.click('[data-action="question-answer"]', 0);
    const sourceAnswers = await page.evaluate("JSON.stringify(window.__SOL_STORE__.getState().ui.question.answers)");
    const destinationThread = await page.evaluate(`window.__SOL_DATA__.threads.find(item=>item.id!==${JSON.stringify(sourceThread)}).id`);
    await page.dispatch({ type: "select-thread", value: destinationThread });
    const destinationAnswers = await page.evaluate("JSON.stringify(window.__SOL_STORE__.getState().ui.question.answers)");
    assert(destinationAnswers !== sourceAnswers, "questionnaire answers leaked into another thread");
    await page.dispatch({ type: "select-thread", value: sourceThread });
    const restoredAnswers = await page.evaluate("JSON.stringify(window.__SOL_STORE__.getState().ui.question.answers)");
    assert(restoredAnswers === sourceAnswers, "source-thread questionnaire answers were not restored");
    return { source_thread: sourceThread, destination_thread: destinationThread, first_questionnaire: firstId, queued_questionnaire: completed.activeId, validation, skipped_question: skippedQuestion, focus_after_next: focusAfterNext };
  });

  await runCheck("eight themes across four chat widths", async () => {
    const cells = [];
    for (const theme of MATRIX_THEMES) {
      const themeIndex = THEMES.indexOf(theme);
      for (const width of MATRIX_WIDTHS) {
        const windowId = WINDOWS[themeIndex];
        const threadId = THREADS[themeIndex];
        // Each retained visual cell starts from a fresh document. Reusing the
        // same deeply rerendered Gecko document can leave stale compositor
        // tiles in WebDriver PNGs even when DOM geometry and opacity are final.
        await page.reload();
        await page.evaluate(`(()=>{const s=window.__SOL_STORE__;if(document.activeElement instanceof HTMLElement)document.activeElement.blur();s.reset({notify:false});document.querySelectorAll('[data-scroll-key]').forEach(node=>{node.scrollTop=0;node.scrollLeft=0});const ui=s.getState().ui;ui.activeThreadId='thread-11';ui.selectedWindow=${JSON.stringify(windowId)};ui.selectedThreadConcept=${JSON.stringify(threadId)};ui.theme=${JSON.stringify(theme)};ui.chatWidth=${width};ui.reducedMotion=false;ui.historyMode='pinned compact';ui.artifact.state='ready';s.dispatch({type:'set-status',value:'Theme and width matrix probe',trigger:'test.theme_width'});return true})()`);
        await waitForVisualSettle(page);
        await page.evaluate(`(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();const transcript=document.querySelector('[data-role="transcript"]');transcript.style.scrollBehavior='auto';transcript.scrollTop=0;transcript.scrollLeft=0;return true})()`);
        await page.poll(`(()=>{const transcript=document.querySelector('[data-role="transcript"]');return transcript&&Math.abs(transcript.scrollTop)<.5&&Math.abs(transcript.scrollLeft)<.5})()`, 1200);
        await delay(120);
        const geometry = await page.evaluate(`(()=>{const frame=document.querySelector('.concept-frame');const chat=document.querySelector('.chat-mount');const tr=document.querySelector('[data-role="transcript"]');const trRect=tr.getBoundingClientRect();const visibleMessageText=[...tr.querySelectorAll('.message-copy p')].filter(node=>{const rect=node.getBoundingClientRect();return Math.min(rect.bottom,trRect.bottom)-Math.max(rect.top,trRect.top)>=16&&Number(getComputedStyle(node).opacity)>=.99}).length;const style=getComputedStyle(document.documentElement);const animated=[...document.querySelectorAll('.chat-mount,.thread-concept,.artifact-region,.history-region,[data-message-id],.question-surface,.work-composition')];return {theme:document.documentElement.dataset.theme,width:window.__SOL_STORE__.getState().ui.chatWidth,frame_width:frame.offsetWidth,chat_width:chat.offsetWidth,transcript_height:tr.clientHeight,visible_message_text:visibleMessageText,accent:style.getPropertyValue('--accent').trim(),root_scroll_width:document.documentElement.scrollWidth,viewport:innerWidth,min_settled_opacity:Math.min(...animated.map(node=>Number(getComputedStyle(node).opacity)))}})()`);
        assert(geometry.theme === theme && geometry.width === width, `${theme} ${width} state did not apply`);
        assert(geometry.chat_width >= width - 2 && geometry.chat_width <= width + 2, `${theme} ${width} chat measured ${geometry.chat_width}`);
        assert(geometry.transcript_height >= 250 && geometry.accent, `${theme} ${width} lost layout or theme tokens: ${JSON.stringify(geometry)}`);
        assert(geometry.visible_message_text >= 1, `${theme} ${width} transcript anchor left no readable message text in the evidence frame: ${JSON.stringify(geometry)}`);
        assert(geometry.min_settled_opacity >= .99, `${theme} ${width} evidence capture remained mid-motion at opacity ${geometry.min_settled_opacity}`);
        assert(geometry.root_scroll_width <= geometry.viewport + 1, `${theme} ${width} leaked horizontal overflow to the page root`);
        const screenshot = `${theme}-${width}.png`;
        await captureStableScreenshot(page, join(SCREENSHOTS, screenshot));
        cells.push({ theme, width, window: windowId, thread: threadId, screenshot, ...geometry });
      }
    }
    report.matrices.theme_width = cells;
    return { passing_cells: cells.length, screenshots: cells.length };
  });

  await runCheck("512 baseline configurations cover every default pairing and rail state", async () => {
    const cells = [];
    const expectedCells = MATRIX_THEMES.length * MATRIX_WIDTHS.length * MATRIX_WINDOWS.length * 2;
    for (const theme of MATRIX_THEMES) {
      for (const width of MATRIX_WIDTHS) {
        const probes = MATRIX_WINDOWS.flatMap((windowId) => {
          const threadId = THREADS[WINDOWS.indexOf(windowId)];
          return [true, false].map((railOpen) => ({ windowId, threadId, railOpen }));
        });
        const evidences = await page.evaluate(`(()=>{const rows=[];const s=window.__SOL_STORE__;for(const probe of ${JSON.stringify(probes)}){const ui=s.getState().ui;ui.selectedWindow=probe.windowId;ui.selectedThreadConcept=probe.threadId;ui.activeThreadId='thread-11';ui.theme=${JSON.stringify(theme)};ui.chatWidth=${width};ui.reducedMotion=true;ui.railOpen=probe.railOpen;ui.sidePanelOpen=true;ui.historyMode='pinned compact';ui.artifact.state='ready';ui.mount='docked';ui.popup=null;ui.search.selectedResult=null;s.dispatch({type:'set-status',value:'Baseline matrix probe',trigger:'test.baseline_matrix'});const shell=document.querySelector('.pm-shell');const chat=document.querySelector('.chat-mount');const transcript=document.querySelector('[data-role="transcript"]');const rail=document.querySelector('.pm-activity-bar');const clipped=[...document.querySelectorAll('.message-copy p,.chat-identity strong,.history-title')].filter(node=>getComputedStyle(node).overflow==='hidden'&&node.scrollWidth>node.clientWidth+1).length;const clippedHistory=[...document.querySelectorAll('.history-track .history-title,.history-perimeter-compact .history-title,.history-mezzanine-compact .history-title')].filter(node=>{const region=node.closest('.history-rows');const nodeRect=node.getBoundingClientRect();const regionRect=region?.getBoundingClientRect();if(!regionRect)return false;const intersects=nodeRect.right>regionRect.left&&nodeRect.left<regionRect.right&&nodeRect.bottom>regionRect.top&&nodeRect.top<regionRect.bottom;return intersects&&(nodeRect.top<regionRect.top-1||nodeRect.bottom>regionRect.bottom+1)}).length;rows.push({expectedWindow:probe.windowId,expectedThread:probe.threadId,expectedRail:probe.railOpen?'open':'closed',window:document.querySelector('.window-concept')?.dataset.windowConcept,thread:document.querySelector('.thread-concept')?.dataset.threadConcept,theme:document.documentElement.dataset.theme,width:chat?.offsetWidth??0,rail:shell?.dataset.rail,rail_width:rail?.offsetWidth??0,transcript:transcript?.clientHeight??0,clipped_prose:clipped,clipped_compact_history_titles:clippedHistory,root_scroll_width:document.documentElement.scrollWidth,viewport:innerWidth})}return rows})()`);
        for (const evidence of evidences) {
            const windowId = evidence.expectedWindow;
            const threadId = evidence.expectedThread;
            assert(evidence.window === windowId && evidence.thread === threadId, `${theme} ${width} ${windowId}/${threadId} mounted incorrectly`);
            assert(evidence.theme === theme && evidence.width === width, `${theme} ${width} ${windowId} geometry or theme mismatch`);
            assert(evidence.rail === evidence.expectedRail && Math.abs(evidence.rail_width - (evidence.expectedRail === "open" ? 48 : 24)) <= 1, `${theme} ${width} ${windowId} rail geometry mismatch`);
            assert(evidence.transcript >= 250 && evidence.clipped_prose === 0 && evidence.clipped_compact_history_titles === 0, `${theme} ${width} ${windowId} lost readable prose: ${JSON.stringify(evidence)}`);
            assert(evidence.root_scroll_width <= evidence.viewport + 1, `${theme} ${width} ${windowId} leaked page-root overflow`);
            cells.push({ theme, width, window: windowId, thread: threadId, rail: evidence.expectedRail, status: "pass" });
        }
        process.stdout.write(`MATRIX baseline ${theme} ${width}: ${cells.length}/${expectedCells}\n`);
      }
    }
    report.matrices.baseline_configurations = cells;
    return { passing_cells: cells.length, expected_cells: expectedCells, core_configurations: MATRIX_THEMES.length * MATRIX_WIDTHS.length, concepts: MATRIX_WINDOWS.length, rail_states: 2 };
  });

  await runCheck("896 feature-state configurations cover the required audit host", async () => {
    const cells = [];
    const expectedCells = MATRIX_THEMES.length * MATRIX_WIDTHS.length * FEATURE_STATES.length;
    for (const theme of MATRIX_THEMES) {
      for (const width of MATRIX_WIDTHS) {
        // A fresh document at each 28-state slice bounds Firefox retained-layout
        // memory without weakening any matrix cell or sharing state across cells.
        await page.reload();
        const batchExpression = `(()=>[${FEATURE_STATES.map((feature) => `(()=>{eval(${JSON.stringify(featureSetupExpression(feature, theme, width))});return {feature:${JSON.stringify(feature)},evidence:eval(${JSON.stringify(featureEvidenceExpression)})}})()`).join(",")}])()`;
        const batch = await page.evaluate(batchExpression);
        for (const { feature, evidence } of batch) {
          assert(evidence.chat_width === width, `${theme} ${width} ${feature} measured ${evidence.chat_width}`);
          assertFeatureState(feature, evidence);
          cells.push({ theme, width, host_window: "window-05", host_thread: "thread-02", feature, status: "pass" });
        }
        process.stdout.write(`MATRIX features ${theme} ${width}: ${cells.length}/${expectedCells}\n`);
      }
    }
    report.matrices.core_feature_states = cells;
    return { passing_cells: cells.length, expected_cells: expectedCells, feature_states: FEATURE_STATES.length, core_configurations: MATRIX_THEMES.length * MATRIX_WIDTHS.length, host: "window-05 x thread-02", selection_role: "coverage fixture only; no ranking" };
  });

  await runCheck("continuous 520-1200 resize under pressure covers eight representative pairings", async () => {
    const samples = [];
    await page.evaluate("window.__SOL_STORE__.reset(); true");
    await page.dispatch({ type: "run-trigger", value: "question.cancel" });
    await page.dispatch({ type: "set-mount", value: "docked" });
    for (const windowId of MATRIX_WINDOWS) {
      const index = WINDOWS.indexOf(windowId);
      const threadId = THREADS[index];
      await page.dispatch({ type: "select-window", value: windowId });
      await page.dispatch({ type: "select-thread-concept", value: threadId });
      await page.dispatch({ type: "toggle-side-panel", value: true });
      await page.dispatch({ type: "toggle-rail", value: true });
      await page.dispatch({ type: "artifact-state", value: "ready" });
      // Keep the entire sweep in one browser task. Each offset/rect read forces
      // layout after the synchronous width dispatch, while avoiding hundreds of
      // protocol round trips that can dominate a heavily contended test host.
      const windowSamples = await page.evaluate(`(()=>{const rows=[];const store=window.__SOL_STORE__;for(const width of ${JSON.stringify(RESIZE_WIDTHS)}){store.getState().ui.historyMode='pinned full';store.dispatch({type:'set-width',value:width});const ui=store.getState().ui;const chat=document.querySelector('.chat-mount');const transcript=document.querySelector('[data-role="transcript"]');const composer=document.querySelector('[data-role="composer-input"]');const rect=composer?.getBoundingClientRect();const clipped=[...document.querySelectorAll('.message-copy p,.chat-identity strong,.history-title,.artifact-title')].filter(node=>getComputedStyle(node).overflow==='hidden'&&node.scrollWidth>node.clientWidth+1).length;rows.push({requested:ui.chatWidth,chat:chat?.offsetWidth??0,chat_scroll:chat?.scrollWidth??0,transcript:transcript?.clientHeight??0,history:ui.historyMode,artifact:ui.artifact.state,composer:Boolean(rect&&rect.width>0&&rect.height>0&&rect.left>=0&&rect.right<=innerWidth+1&&rect.bottom<=innerHeight+1),root_scroll:document.documentElement.scrollWidth,viewport:innerWidth,clipped})}return rows})()`);
      assert(windowSamples.length === RESIZE_WIDTHS.length && windowSamples.at(-1)?.requested === 1200, `${windowId}/${threadId} resize sweep did not include the exact 1200 px endpoint`);
      for (const geometry of windowSamples) {
        const width = geometry.requested;
        assert(Math.abs(geometry.requested - geometry.chat) <= 2, `${windowId}/${threadId} resize ${width} measured ${geometry.chat}`);
        assert(geometry.transcript >= 250 && geometry.composer, `${windowId}/${threadId} resize ${width} collapsed transcript or composer: ${JSON.stringify(geometry)}`);
        assert(geometry.root_scroll <= geometry.viewport + 1 && geometry.chat_scroll <= geometry.chat + 1, `${windowId}/${threadId} resize ${width} leaked horizontal overflow`);
        assert(geometry.clipped === 0, `${windowId}/${threadId} resize ${width} clipped ${geometry.clipped} prose labels`);
        assert(geometry.artifact !== "closed", `${windowId}/${threadId} resize ${width} dropped the artifact pressure state`);
        if (width <= 620) assert(geometry.history === "pinned compact", `${windowId}/${threadId} resize ${width} did not compact pinned history under pressure: ${JSON.stringify(geometry)}`);
        samples.push({ window: windowId, thread: threadId, ...geometry });
      }
    }
    report.matrices.continuous_resize = samples;
    return { sample_count: samples.length, representative_pairings: MATRIX_WINDOWS.length, samples_per_pairing: samples.length / MATRIX_WINDOWS.length, minimum: samples[0], maximum: samples.at(-1) };
  });

  await runCheck("history and artifact state cross-product remains recoverable", async () => {
    const historyModes = ["closed", "peek", "pinned compact", "pinned full"];
    const artifactStates = ["closed", "loading", "ready", "updated", "error"];
    const cells = [];
    await page.dispatch({ type: "set-width", value: 1200 });
    for (const windowId of MATRIX_WINDOWS) {
      try {
        await page.dispatch({ type: "select-window", value: windowId });
      } catch (error) {
        throw new Error(`${windowId} selection failed: ${error.message}`);
      }
      for (const history of historyModes) {
        for (const artifact of artifactStates) {
          let state;
          try {
            await page.dispatch({ type: "history-set", value: history });
            await page.dispatch({ type: "artifact-state", value: artifact });
            state = await page.evaluate(`(()=>({effectiveHistory:window.__SOL_STORE__.getState().ui.historyMode,history:document.querySelectorAll('.history-region').length,artifact:document.querySelectorAll('.artifact-region').length,error:document.querySelectorAll('.artifact-error').length,loading:document.querySelectorAll('.artifact-loading').length,chat_height:document.querySelector('.chat-mount')?.getBoundingClientRect().height ?? 0}))()`);
          } catch (error) {
            throw new Error(`${windowId} ${history}/${artifact} browser probe failed: ${error.message}`);
          }
          assert(state.history === (history === "closed" ? 0 : 1), `${windowId} ${history} history mismatch`);
          assert(state.effectiveHistory === history, `${windowId} requested ${history} but retained ${state.effectiveHistory}`);
          assert(state.artifact === (artifact === "closed" ? 0 : 1), `${windowId} ${artifact} artifact mismatch`);
          assert(state.error === (artifact === "error" ? 1 : 0), `${windowId} ${artifact} error recovery mismatch`);
          assert(state.loading === (artifact === "loading" ? 1 : 0), `${windowId} ${artifact} loading mismatch`);
          assert(state.chat_height >= 500, `${windowId} ${history}/${artifact} collapsed chat`);
          cells.push({ window: windowId, history, artifact, status: "pass" });
        }
      }
    }
    report.matrices.history_artifact = cells;
    return { passing_cells: cells.length };
  });

  await runCheck("history closes and reopens through a complete pin, switch, and remount workflow", async () => {
    await page.evaluate("window.__SOL_STORE__.reset(); true");
    await page.dispatch({ type: "run-trigger", value: "question.cancel" });
    await page.dispatch({ type: "set-width", value: 1200 });
    const sourceThread = await page.evaluate("window.__SOL_STORE__.getState().ui.activeThreadId");
    await page.dispatch({ type: "set-draft", value: "history workflow draft sentinel" });
    await page.evaluate("document.querySelector('[data-role=\"transcript\"]')?.scrollTo({top:73}); true");
    await page.dispatch({ type: "history-set", value: "closed" });
    const reopen = await page.evaluate(`(()=>{const candidates=[...document.querySelectorAll('[data-action="history-set"][data-value="peek"],[data-action="history-open"]')];const control=candidates.find(node=>node.getClientRects().length&&!node.disabled);if(control)control.click();return Boolean(control)})()`);
    assert(reopen, "closed history has no visible non-demo reopen control");
    await page.poll("window.__SOL_STORE__.getState().ui.historyMode !== 'closed'", 1200);
    await page.dispatch({ type: "run-trigger", value: "history.pin_full" });
    assert(await page.evaluate("window.__SOL_STORE__.getState().ui.historyMode === 'pinned full'"), "history did not pin full");
    await page.dispatch({ type: "run-trigger", value: "history.pin_compact" });
    assert(await page.evaluate("window.__SOL_STORE__.getState().ui.historyMode === 'pinned compact'"), "history did not pin compact");
    await page.dispatch({ type: "run-trigger", value: "history.unpin" });
    assert(await page.evaluate("['peek','closed','unpinned'].includes(window.__SOL_STORE__.getState().ui.historyMode)"), "history remained pinned after unpin");
    await page.dispatch({ type: "run-trigger", value: "history.switch_thread" });
    const switched = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {thread:ui.activeThreadId,sourceDraft:ui.threadViews[${JSON.stringify(sourceThread)}]?.draft,mount:ui.mount}})()`);
    assert(switched.thread !== sourceThread && switched.sourceDraft === "history workflow draft sentinel", "history switch lost thread-local state or did not switch");
    await page.dispatch({ type: "set-mount", value: "popout" });
    await page.dispatch({ type: "set-mount", value: "docked" });
    const remounted = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {thread:ui.activeThreadId,sourceDraft:ui.threadViews[${JSON.stringify(sourceThread)}]?.draft,mount:ui.mount,dom:document.querySelector('.pm-stage')?.dataset.mount}})()`);
    assert(remounted.thread === switched.thread && remounted.sourceDraft === "history workflow draft sentinel" && remounted.mount === "docked" && remounted.dom === "docked", "dock/pop-out remount lost history workflow state");
    return { source_thread: sourceThread, switched_thread: switched.thread, final_history: await page.evaluate("window.__SOL_STORE__.getState().ui.historyMode"), remounted };
  });

  await runCheck("artifact shortcut preserves identity through loading, error, retry, switch, diff, close, and reopen", async () => {
    await page.evaluate("window.__SOL_STORE__.reset(); true");
    await page.dispatch({ type: "artifact-state", value: "closed" });
    const opened = await page.evaluate(`(()=>{const controls=[...document.querySelectorAll('[data-action="artifact-shortcut"],[data-action="artifact-open"],[data-action="artifact-state"][data-value="ready"]')];const control=controls.find(node=>node.getClientRects().length&&!node.closest('.demo-controller')&&!node.disabled);if(control)control.click();return Boolean(control)})()`);
    assert(opened, "closed artifact has no visible transcript/workspace shortcut");
    await page.poll("window.__SOL_STORE__.getState().ui.artifact.state !== 'closed'", 1200);
    const initialId = await page.evaluate("window.__SOL_STORE__.getState().ui.artifact.selectedId");
    await page.dispatch({ type: "run-trigger", value: "artifact.loading" });
    assert(await page.evaluate("Boolean(document.querySelector('.artifact-loading'))"), "artifact loading state is not rendered");
    await page.dispatch({ type: "run-trigger", value: "artifact.ready" });
    await page.dispatch({ type: "run-trigger", value: "artifact.error" });
    assert(await page.evaluate("Boolean(document.querySelector('.artifact-error [data-action=\"artifact-retry\"]'))"), "artifact error has no retry action");
    await page.click('[data-action="artifact-retry"]');
    await page.poll("window.__SOL_STORE__.getState().ui.artifact.state === 'ready'", 1600);
    await page.dispatch({ type: "run-trigger", value: "artifact.switch" });
    const switchedId = await page.evaluate("window.__SOL_STORE__.getState().ui.artifact.selectedId");
    assert(switchedId !== initialId, "artifact switch did not change stable identity");
    await page.dispatch({ type: "run-trigger", value: "diff.open" });
    const diff = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {id:ui.artifact.selectedId,state:ui.artifact.state,preview:Boolean(document.querySelector('.artifact-diff'))}})()`);
    assert(String(diff.id).includes("diff") && diff.state !== "closed" && diff.preview, "diff did not link to its artifact preview");
    await page.dispatch({ type: "run-trigger", value: "artifact.close" });
    assert(await page.evaluate("window.__SOL_STORE__.getState().ui.artifact.state === 'closed' && !document.querySelector('.artifact-region')"), "artifact close did not retain a closed semantic state");
    await page.evaluate(`(()=>{const control=[...document.querySelectorAll('[data-action="artifact-shortcut"],[data-action="artifact-open"],[data-action="artifact-state"][data-value="ready"]')].find(node=>node.getClientRects().length&&!node.closest('.demo-controller')&&!node.disabled);if(!control)throw new Error('No artifact reopen control');control.click();return true})()`);
    await page.poll("window.__SOL_STORE__.getState().ui.artifact.state !== 'closed'", 1200);
    const reopenedId = await page.evaluate("window.__SOL_STORE__.getState().ui.artifact.selectedId");
    assert(reopenedId === diff.id, "artifact reopen lost the last selected diff identity");
    return { initial_id: initialId, switched_id: switchedId, diff, reopened_id: reopenedId };
  });

  await runCheck("dock, pop-out, rail, and surrounding panel preserve semantic state", async () => {
    await page.dispatch({ type: "set-mount", value: "docked" });
    await page.dispatch({ type: "toggle-side-panel", value: true });
    await page.dispatch({ type: "toggle-rail", value: true });
    await page.dispatch({ type: "artifact-state", value: "ready" });
    await page.dispatch({ type: "history-set", value: "pinned compact" });
    const before = await page.evaluate("window.__SOL_STORE__.getState().ui.artifact.selectedId");
    await page.click('[data-action="set-mount"]');
    await page.click('[data-action="toggle-side-panel"]');
    await page.dispatch({ type: "toggle-rail", value: false });
    const after = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {mount:ui.mount,side:ui.sidePanelOpen,rail:ui.railOpen,artifact:ui.artifact.selectedId,domMount:document.querySelector('.pm-stage').dataset.mount}})()`);
    assert(after.mount === "popout" && after.domMount === "popout", "pop-out mount did not apply");
    assert(after.side === false && after.rail === false, "rail/panel state did not apply");
    assert(after.artifact === before, "remount lost artifact identity");
    await page.click('[data-action="set-mount"]');
    return { before_artifact: before, after };
  });

  await runCheck("reduced motion removes authored animation without losing state cues", async () => {
    await page.dispatch({ type: "toggle-reduced-motion", value: false });
    const full = await page.evaluate(`(()=>{const candidates=[...document.querySelectorAll('.chat-mount,.thread-concept,.artifact-region,.history-region')];const node=candidates.find(candidate=>getComputedStyle(candidate).animationName!=='none');return node?{duration:getComputedStyle(node).animationDuration,name:getComputedStyle(node).animationName,className:node.className}:{duration:'0s',name:'none',className:''}})()`);
    await page.click('[data-action="toggle-reduced-motion"]');
    const reduced = await page.evaluate(`(()=>{const candidates=[...document.querySelectorAll('.chat-mount,.thread-concept,.artifact-region,.history-region')];const node=candidates.find(candidate=>getComputedStyle(candidate).animationName!=='none')??candidates[0];return {duration:getComputedStyle(node).animationDuration,name:getComputedStyle(node).animationName,className:node.className,flag:document.documentElement.dataset.reducedMotion,progress:getComputedStyle(document.querySelector('.progress-line') ?? document.body).animationDuration}})()`);
    assert(full.duration !== "0s", `full-motion duration was ${full.duration} on ${full.className}`);
    assert(reduced.flag === "1" && ["0s", "1e-05s", "0.00001s"].includes(reduced.duration), `reduced duration was ${reduced.duration}`);
    return { full_duration: full.duration, full_animation: full.name, target: full.className, reduced_duration: reduced.duration, state_cues_retained: Boolean(await page.evaluate("document.querySelector('.state-shape')")) };
  });

  await runCheck("every authored motion family has a complete reduced-motion counterpart", async () => {
    const rows = [];
    const motionProbe = async (selector, pseudo = null) => page.evaluate(`(()=>{const nodes=[...document.querySelectorAll(${JSON.stringify(selector)})];const toSeconds=value=>{const part=String(value).split(',')[0].trim();return part.endsWith('ms')?parseFloat(part)/1000:parseFloat(part)||0};const samples=nodes.map(node=>{const style=getComputedStyle(node,${pseudo ? JSON.stringify(pseudo) : "null"});return {className:node.className,duration:style.animationDuration,name:style.animationName,seconds:toSeconds(style.animationDuration),display:style.display}});return samples.sort((a,b)=>b.seconds-a.seconds)[0]??{className:'',duration:'0s',name:'none',seconds:0,display:'none'}})()`);
    const expectedThreadMotion = [
      { send: "edition-send", redirect: "edition-redirect", question: "edition-question-open", work: "edition-phase", questionSelector: ".edition-question", workSelector: ".edition-work .activity-row.is-current" },
      { send: "score-send", redirect: "score-redirect", question: "score-question-open", work: "score-phase", questionSelector: ".score-question", workSelector: ".score-work .activity-row.is-current" },
      { send: "time-send", redirect: "time-redirect", question: "time-question-open", work: "time-phase", questionSelector: ".time-question", workSelector: ".time-work .activity-band.is-current" },
      { send: "branch-send", redirect: "branch-handoff", question: "branch-question-open", work: "branch-phase", questionSelector: ".branch-question", workSelector: ".branch-work .activity-row.is-current" },
      { send: "workshop-send", redirect: "workshop-redirect", question: "workshop-question-open", work: "workshop-phase", questionSelector: ".workshop-question", workSelector: ".workshop-work .activity-row.is-current" },
      { send: "braided-send", redirect: "braid-redirect", question: "braided-question-open", work: "braid-phase", questionSelector: ".braid-question", workSelector: ".braided-work .activity-row.is-current" },
      { send: "relay-send", redirect: "relay-handoff", question: "relay-question-open", work: "relay-phase", questionSelector: ".relay-question", workSelector: ".relay-work .activity-row.is-current" },
      { send: "quiet-send", redirect: "quiet-redirect", question: "quiet-question-open", work: "quiet-phase", questionSelector: ".quiet-question", workSelector: ".quiet-work .activity-row.is-current" }
    ];
    for (const windowId of WINDOWS) {
      await page.evaluate("window.__SOL_STORE__.reset(); true");
      await page.dispatch({ type: "select-window", value: windowId });
      await page.dispatch({ type: "toggle-reduced-motion", value: false });
      const full = await motionProbe(".chat-mount,.thread-concept,.artifact-region,.history-region");
      await page.dispatch({ type: "toggle-reduced-motion", value: true });
      const reduced = await motionProbe(".chat-mount,.thread-concept,.artifact-region,.history-region");
      assert(full.seconds >= 0.2 && full.name !== "none", `${windowId} has no authored entrance motion`);
      assert(reduced.seconds <= 0.00002, `${windowId} reduced motion remained ${reduced.duration}`);
      rows.push({ family: windowId, full: full.duration, reduced: reduced.duration, animation: full.name });
    }
    const threadMotionNames = { send: [], redirect: [], question: [], work: [] };
    for (let index = 0; index < THREADS.length; index += 1) {
      const threadId = THREADS[index];
      const expected = expectedThreadMotion[index];

      // Queued sends are deliberately driven while offline. The cue belongs only
      // to the newly committed message and must disappear on an unrelated render.
      await page.evaluate("window.__SOL_STORE__.reset(); true");
      await page.dispatch({ type: "select-thread-concept", value: threadId });
      await page.dispatch({ type: "toggle-reduced-motion", value: false });
      await page.dispatch({ type: "run-trigger", value: "network.offline" });
      await page.dispatch({ type: "queue-user-message", value: `${threadId} queued motion probe` });
      const queuedId = await page.evaluate("window.__SOL_STORE__.getState().ui.motionCue?.messageId");
      const fullSend = await motionProbe('[data-motion-state="queued"]');
      await page.dispatch({ type: "set-status", value: "Unrelated rerender must not replay message motion", trigger: "test.motion_causality" });
      const settledSend = await motionProbe(`[data-message-id="${queuedId}"]`);

      // A live send during an active turn is a redirect/handoff, not the same
      // settle animation as an ordinary commit or offline queue.
      await page.evaluate("window.__SOL_STORE__.reset(); true");
      await page.dispatch({ type: "select-thread-concept", value: threadId });
      await page.dispatch({ type: "toggle-reduced-motion", value: false });
      await page.dispatch({ type: "queue-user-message", value: `${threadId} redirect motion probe` });
      const redirectId = await page.evaluate("window.__SOL_STORE__.getState().ui.motionCue?.messageId");
      const fullRedirect = await motionProbe('[data-motion-state="redirect"]');
      await page.dispatch({ type: "set-status", value: "Redirect cue consumed", trigger: "test.motion_causality" });
      const settledRedirect = await motionProbe(`[data-message-id="${redirectId}"]`);

      await page.evaluate("window.__SOL_STORE__.reset(); true");
      await page.dispatch({ type: "select-thread-concept", value: threadId });
      await page.dispatch({ type: "toggle-reduced-motion", value: false });
      await page.dispatch({ type: "run-trigger", value: "question.open" });
      const fullQuestion = await motionProbe(expected.questionSelector);
      await page.dispatch({ type: "set-status", value: "Question cue consumed", trigger: "test.motion_causality" });
      const settledQuestion = await motionProbe(expected.questionSelector);

      await page.evaluate("window.__SOL_STORE__.reset(); true");
      await page.dispatch({ type: "select-thread-concept", value: threadId });
      await page.dispatch({ type: "toggle-reduced-motion", value: false });
      await page.dispatch({ type: "activity-advance" });
      const fullWork = await motionProbe(expected.workSelector);
      await page.dispatch({ type: "set-status", value: "Work cue consumed", trigger: "test.motion_causality" });
      const settledWork = await motionProbe(expected.workSelector);

      // Re-drive every causal layer after reduced motion is enabled. Toggling the
      // preference itself clears transient cues, so probing the old DOM would be
      // a false positive rather than a reduced-motion test.
      await page.evaluate("window.__SOL_STORE__.reset(); true");
      await page.dispatch({ type: "select-thread-concept", value: threadId });
      await page.dispatch({ type: "toggle-reduced-motion", value: true });
      await page.dispatch({ type: "run-trigger", value: "network.offline" });
      await page.dispatch({ type: "queue-user-message", value: `${threadId} reduced queued probe` });
      const reducedSend = await motionProbe('[data-motion-state="queued"]');

      await page.evaluate("window.__SOL_STORE__.reset(); true");
      await page.dispatch({ type: "select-thread-concept", value: threadId });
      await page.dispatch({ type: "toggle-reduced-motion", value: true });
      await page.dispatch({ type: "queue-user-message", value: `${threadId} reduced redirect probe` });
      const reducedRedirect = await motionProbe('[data-motion-state="redirect"]');

      await page.evaluate("window.__SOL_STORE__.reset(); true");
      await page.dispatch({ type: "select-thread-concept", value: threadId });
      await page.dispatch({ type: "toggle-reduced-motion", value: true });
      await page.dispatch({ type: "run-trigger", value: "question.open" });
      const reducedQuestion = await motionProbe(expected.questionSelector);

      await page.evaluate("window.__SOL_STORE__.reset(); true");
      await page.dispatch({ type: "select-thread-concept", value: threadId });
      await page.dispatch({ type: "toggle-reduced-motion", value: true });
      await page.dispatch({ type: "activity-advance" });
      const reducedWork = await motionProbe(expected.workSelector);

      const probes = [
        { layer: "send", full: fullSend, settled: settledSend, reduced: reducedSend, expectedName: expected.send, minimumSeconds: 0.2 },
        { layer: "redirect", full: fullRedirect, settled: settledRedirect, reduced: reducedRedirect, expectedName: expected.redirect, minimumSeconds: 0.18 },
        { layer: "question", full: fullQuestion, settled: settledQuestion, reduced: reducedQuestion, expectedName: expected.question, minimumSeconds: 0.18 },
        { layer: "work", full: fullWork, settled: settledWork, reduced: reducedWork, expectedName: expected.work, minimumSeconds: 0.18 }
      ];
      for (const probe of probes) {
        assert(probe.full.seconds >= probe.minimumSeconds && probe.full.name === probe.expectedName, `${threadId} ${probe.layer} used ${probe.full.name || "no motion"}; expected ${probe.expectedName}`);
        assert(probe.settled.seconds <= 0.00002 && probe.settled.name === "none", `${threadId} ${probe.layer} replayed after an unrelated rerender as ${probe.settled.name}`);
        assert(probe.reduced.seconds <= 0.00002, `${threadId} ${probe.layer} reduced motion remained ${probe.reduced.duration}`);
        threadMotionNames[probe.layer].push(probe.full.name);
        rows.push({ family: `${threadId} ${probe.layer}`, full: probe.full.duration, settled: probe.settled.duration, reduced: probe.reduced.duration, animation: probe.full.name, causal_replay: false });
      }
    }
    for (const [layer, names] of Object.entries(threadMotionNames)) {
      assert(new Set(names).size === THREADS.length, `${layer} motion names are not unique across all eight thread concepts`);
    }
    await page.evaluate("window.__SOL_STORE__.reset(); true");
    await page.dispatch({ type: "toggle-reduced-motion", value: false });
    await page.dispatch({ type: "open-popup", value: "route" });
    const popupFull = await motionProbe(".popup-card");
    await page.dispatch({ type: "toggle-reduced-motion", value: true });
    const popupReduced = await motionProbe(".popup-card");
    assert(popupFull.seconds >= 0.2 && popupReduced.seconds <= 0.00002, "popup motion lacks a reduced counterpart");
    rows.push({ family: "popup", full: popupFull.duration, reduced: popupReduced.duration, animation: popupFull.name });
    await page.dispatch({ type: "close-popup" });
    await page.dispatch({ type: "artifact-state", value: "loading" });
    await page.dispatch({ type: "toggle-reduced-motion", value: false });
    const progressFull = await motionProbe(".progress-line", "::after");
    await page.dispatch({ type: "toggle-reduced-motion", value: true });
    const progressReduced = await motionProbe(".progress-line", "::after");
    assert(progressFull.seconds >= 1 && progressFull.name === "progress-pass", "artifact progress lacks authored continuous motion");
    assert(progressReduced.display === "none" || progressReduced.seconds <= 0.00002, "artifact progress remains animated under reduced motion");
    rows.push({ family: "artifact progress", full: progressFull.duration, reduced: progressReduced.duration, reduced_display: progressReduced.display, animation: progressFull.name });
    report.matrices.motion_reduction = rows;
    return { motion_families: rows.length, all_reduced: true, unique_thread_layers: threadMotionNames, rows };
  });

  await runCheck("long message expansion preserves canonical content and scroll anchor", async () => {
    await page.dispatch({ type: "run-trigger", value: "question.submit" });
    await page.dispatch({ type: "select-thread", value: "thread-01" });
    const selector = '[data-action="toggle-long-message"]';
    await page.poll(`document.querySelector(${JSON.stringify(selector)})`);
    await page.evaluate(`(()=>{const button=document.querySelector(${JSON.stringify(selector)});const message=button.closest('[data-message-id]');const transcript=button.closest('[data-role="transcript"]');transcript.style.scrollBehavior='auto';transcript.scrollTop=Math.max(0,message.offsetTop-120);return true})()`);
    await delay(60);
    const before = await page.evaluate(`(()=>{const button=document.querySelector(${JSON.stringify(selector)});const message=button.closest('[data-message-id]');return {id:message.dataset.messageId,length:Number(message.querySelector('.message-copy').dataset.canonicalLength),text:message.querySelector('.message-copy p').textContent.length,top:message.getBoundingClientRect().top}})()`);
    await page.click(selector);
    await page.poll(`document.querySelector('#message-'+CSS.escape(${JSON.stringify(before.id)}))?.querySelector('[data-action="toggle-long-message"] span')?.textContent === 'Show less'`, 1200);
    await delay(150);
    const after = await page.evaluate(`(()=>{const message=document.querySelector('#message-'+CSS.escape(${JSON.stringify("__ID__")}));return {text:message.querySelector('.message-copy p').textContent.length,top:message.getBoundingClientRect().top,label:message.querySelector('[data-action="toggle-long-message"] span').textContent}})()`.replace('"__ID__"', JSON.stringify(before.id)));
    assert(after.text === before.length && after.text > before.text, "long message did not reveal full canonical content");
    assert(Math.abs(after.top - before.top) <= 2, `scroll anchor shifted ${Math.abs(after.top - before.top)}px`);
    assert(after.label === "Show less", "long message control did not become reversible");
    return { canonical_length: before.length, preview_length: before.text, anchor_shift_px: Math.abs(after.top - before.top) };
  });

  await runCheck("one-bar search jumps to an unloaded exact message and returns focus", async () => {
    await page.evaluate("window.__SOL_STORE__.reset(); true");
    await page.dispatch({ type: "run-trigger", value: "question.cancel" });
    await page.dispatch({ type: "select-thread", value: "thread-09" });
    await page.dispatch({ type: "open-popup", value: "search" });
    await page.dispatch({ type: "search-scope", value: "Current Thread" });
    await page.dispatch({ type: "search-query", value: "Decision review 3:" });
    const resultCount = await page.evaluate("document.querySelectorAll('[data-action=\"search-result\"][data-message-id=\"t09-m0025\"]').length");
    assert(resultCount === 1, `unloaded exact message produced ${resultCount} matching result controls`);
    await page.click('[data-action="search-result"][data-message-id="t09-m0025"]');
    await page.poll("document.getElementById('message-t09-m0025')", 1200);
    await delay(80);
    const evidence = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;const target=document.getElementById('message-t09-m0025');return {thread:ui.activeThreadId,selected:ui.search.selectedResult,rendered:document.querySelectorAll('[data-message-id]').length,total:window.__SOL_DATA__.threadMap['thread-09'].messages.length,target:Boolean(target),focus:document.activeElement?.dataset.focusKey??null,popup:ui.popup,status:ui.statusLine}})()`);
    assert(evidence.thread === "thread-09" && evidence.selected === "t09-m0025" && evidence.target, "exact search jump did not load the selected stored range");
    assert(evidence.rendered < evidence.total && evidence.total === 120, "exact search jump instantiated the entire long thread");
    assert(evidence.focus === "message-t09-m0025" && evidence.popup === null, `exact search jump returned focus to ${evidence.focus}`);
    return evidence;
  });

  await runCheck("Goal, Todo, child, Crew, activity, and diff lifecycles create and progress real rows", async () => {
    await page.evaluate("window.__SOL_STORE__.reset(); true");
    const initial = await page.evaluate(semanticSnapshotExpression);
    const sequence = [
      "goal.start", "goal.progress", "goal.pause", "goal.resume", "goal.update", "goal.replan", "goal.blocked", "goal.resume", "goal.complete",
      "todo.add", "todo.complete", "todo.reopen", "todo.block",
      "subagent.spawn", "subagent.queue", "subagent.progress", "subagent.fail", "subagent.retry", "subagent.complete",
      ...CORRECTED_TRIGGER_FAMILIES.activity.map((event) => `activity.${event}`),
      "diff.create", "diff.update", "diff.open"
    ];
    const steps = [];
    for (const trigger of sequence) {
      const before = await page.evaluate(semanticSnapshotExpression);
      await page.dispatch({ type: "run-trigger", value: trigger });
      const after = await page.evaluate(semanticSnapshotExpression);
      assert(after.receipt?.trigger === trigger && semanticFingerprint(after) !== semanticFingerprint(before), `${trigger} did not progress its lifecycle`);
      steps.push({ trigger, goal: after.goal?.state, todos: after.todos.length, subagents: after.subagents.length, activity_phase: after.activityPhase, diff: after.diff?.state });
    }
    const crewBefore = await page.evaluate("window.__SOL_STORE__.getState().ui.operational.crew.state");
    await page.dispatch({ type: "crew-advance" });
    const final = await page.evaluate(semanticSnapshotExpression);
    assert(final.goal?.state === "complete" && Number(final.goal?.progress) === 100, "Goal lifecycle did not complete");
    assert(final.todos.length === initial.todos.length + 1 && final.render.todoRows === final.todos.length, "Todo add/lifecycle is not rendered one-for-one");
    assert(final.subagents.length === initial.subagents.length + 1 && final.render.agentRows === final.subagents.length, "child/subagent spawn lifecycle is not rendered one-for-one");
    assert(final.crew?.state !== crewBefore && final.render.bodyText.includes(String(final.crew?.state)), "Crew wave progression is not visible");
    assert(final.activity.length >= initial.activity.length && final.render.activityRows >= final.activity.length, "activity lifecycle is not rendered");
    assert(String(final.artifact?.selectedId).includes("diff") && final.render.artifact === 1, "work diff did not open the linked artifact");
    return { steps, initial_todos: initial.todos.length, final_todos: final.todos.length, initial_subagents: initial.subagents.length, final_subagents: final.subagents.length, crew_before: crewBefore, crew_after: final.crew?.state };
  });

  await runCheck("thread request, response, related spawn, branch, rewind, restore, and redirect preserve lineage", async () => {
    await page.evaluate("window.__SOL_STORE__.reset(); true");
    const source = await page.evaluate("window.__SOL_STORE__.getState().ui.activeThreadId");
    await page.dispatch({ type: "set-draft", value: "lineage workflow draft sentinel" });
    const steps = [];
    for (const trigger of ["thread.send_request", "thread.receive_response", "thread.spawn_related", "thread.branch", "thread.rewind", "thread.restore", "turn.redirect"]) {
      const before = await page.evaluate(semanticSnapshotExpression);
      await page.dispatch({ type: "run-trigger", value: trigger });
      const after = await page.evaluate(semanticSnapshotExpression);
      assert(after.receipt?.trigger === trigger, `${trigger} did not emit an exact receipt`);
      assert(!String(after.receipt?.result).includes("truthfully unavailable"), `${trigger} is unavailable`);
      assert(semanticFingerprint(after) !== semanticFingerprint(before), `${trigger} did not mutate lineage state`);
      steps.push({ trigger, communication: after.communication?.state, branch: after.branch?.state, spawned: after.spawnedThreads.length });
    }
    const final = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {communication:ui.communication,branch:ui.branch,spawned:ui.spawnedThreads,sourceDraft:ui.threadViews[${JSON.stringify(source)}]?.draft,body:document.body.innerText}})()`);
    assert(final.communication?.requestId && ["received", "complete", "responded", "spawned"].includes(final.communication?.state), "request/response lifecycle lost its request identity");
    assert(final.spawned.length >= 1 && final.body.includes(final.spawned.at(-1).title ?? final.spawned.at(-1).id), "related thread spawn is not present in history");
    assert(final.branch?.state === "redirected" && final.branch?.restorePointId, "branch/rewind/restore/redirect lost restore lineage");
    assert(final.sourceDraft === "lineage workflow draft sentinel", "lineage operations destroyed the source draft");
    return { source_thread: source, steps, final_communication: final.communication, final_branch: final.branch, spawned_threads: final.spawned.length };
  });

  await runCheck("all three corrected warnings have distinct visible consequences", async () => {
    await page.evaluate("window.__SOL_STORE__.reset(); true");
    const fixtureWarnings = await page.evaluate("window.__SOL_DATA__.correctedScenario?.warnings ?? window.__SOL_DATA__.scenario.corrected?.warnings ?? window.__SOL_DATA__.scenario.warnings");
    assert(JSON.stringify(fixtureWarnings) === JSON.stringify(CORRECTED_WARNINGS), `scenario warning inventory drifted: ${JSON.stringify(fixtureWarnings)}`);
    const triggers = ["route.warning", "attachment.alternate", "subagent.spawn"];
    const outcomes = [];
    for (let index = 0; index < triggers.length; index += 1) {
      const trigger = triggers[index];
      await page.dispatch({ type: "run-trigger", value: trigger });
      const outcome = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {receipt:ui.triggerReceipts[0],body:document.body.innerText,warnings:ui.warnings??[]}})()`);
      assert(outcome.receipt?.trigger === trigger && !String(outcome.receipt?.result).includes("truthfully unavailable"), `${trigger} is unavailable`);
      assert(outcome.body.includes(CORRECTED_WARNINGS[index]), `${trigger} did not render its exact corrected warning`);
      outcomes.push({ trigger, warning: CORRECTED_WARNINGS[index] });
    }
    assert(new Set(outcomes.map(({ warning }) => warning)).size === 3, "warning consequences collapsed into one generic message");
    return { warning_count: outcomes.length, outcomes };
  });

  await runCheck("dense, artifact error, approval, warning, and offline states are distinct", async () => {
    for (const trigger of ["todo.all_states", "subagent.all_states", "approval.request", "route.warning", "artifact.error", "network.offline"]) await page.dispatch({ type: "run-trigger", value: trigger });
    const evidence = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {todoStates:[...new Set(ui.operational.todos.map(x=>x.state))],agentStates:[...new Set(ui.operational.subagents.map(x=>x.state))],approval:Boolean(document.querySelector('.approval-card')),warning:Boolean(document.querySelector('.route-warning-card')),artifactError:Boolean(document.querySelector('.artifact-error')),network:Boolean(document.querySelector('.network-card')),transport:ui.network.transport}})()`);
    assert(evidence.todoStates.length >= 6, `todo density only showed ${evidence.todoStates.length} states`);
    assert(evidence.agentStates.length >= 3, `agent density only showed ${evidence.agentStates.length} states`);
    assert(evidence.approval && evidence.warning && evidence.artifactError && evidence.network && evidence.transport === "Offline", "dense/error/offline surfaces collapsed together");
    return evidence;
  });

  await runCheck("draft persistence is thread-local and survives reload", async () => {
    await page.evaluate("window.__SOL_STORE__.reset(); true");
    await page.dispatch({ type: "run-trigger", value: "question.cancel" });
    const activeThread = await page.evaluate("window.__SOL_STORE__.getState().ui.activeThreadId");
    const draft = "Persistent 5.6 Sol draft with recieve typo and /code/path retained.";
    await page.input('[data-role="composer-input"]', draft);
    const focusAfterInput = await page.evaluate("document.activeElement?.dataset.focusKey");
    await page.dispatch({ type: "save-draft-revision" });
    const alternate = await page.evaluate("window.__SOL_DATA__.threads.find(thread=>thread.id!==window.__SOL_STORE__.getState().ui.activeThreadId).id");
    await page.dispatch({ type: "select-thread", value: alternate });
    const alternateDraft = await page.evaluate("document.querySelector('[data-role=\"composer-input\"]')?.value ?? ''");
    await page.dispatch({ type: "select-thread", value: activeThread });
    await page.reload();
    await page.poll("document.readyState === 'complete' && window.__SOL_STORE__ && document.querySelector('[data-role=\"composer-input\"]')", 12000);
    const restored = await page.evaluate(`(()=>({value:document.querySelector('[data-role="composer-input"]').value,revisions:window.__SOL_STORE__.getState().ui.threadViews[${JSON.stringify(activeThread)}].draftHistory.length,popup:window.__SOL_STORE__.getState().ui.popup,spellcheck:document.querySelector('[data-role="composer-input"]').spellcheck}))()`);
    assert(focusAfterInput === "composer", `composer focus was ${focusAfterInput}`);
    assert(restored.value === draft && restored.revisions >= 1, "draft or revision did not survive reload");
    assert(alternateDraft !== draft, "draft leaked into another thread");
    assert(restored.popup === null && restored.spellcheck === true, "ephemeral popup or passive spellcheck contract failed");
    return { active_thread: activeThread, alternate_thread: alternate, focus_after_input: focusAfterInput, revisions: restored.revisions, spellcheck: restored.spellcheck };
  });

  await runCheck("popup focus trap, escape return, modal isolation, and 520px combined collision bounds", async () => {
    await page.setWindowRect(1280, 900);
    await page.dispatch({ type: "set-width", value: 520 });
    await page.dispatch({ type: "history-set", value: "pinned full" });
    assert(await page.evaluate("window.__SOL_STORE__.getState().ui.historyMode === 'pinned compact'"), "full pinned history did not adapt to compact geometry at 520 px");
    await page.dispatch({ type: "artifact-state", value: "ready" });
    await page.dispatch({ type: "run-trigger", value: "decision.approval_open" });
    const popups = ["search", "route", "context", "access", "bsd", "draft-history", "thread-more"];
    const bounds = [];
    for (const popup of popups) {
      await page.dispatch({ type: "open-popup", value: popup });
      await delay(50);
      const rect = await page.evaluate(`(()=>{const node=document.querySelector('.popup-card');const r=node.getBoundingClientRect();const focusables=[...node.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(item=>item.getClientRects().length);const protectedBackground=[...document.querySelectorAll('.comparison-controls,.shell-wrap')].every(item=>item.inert||item.getAttribute('aria-hidden')==='true');return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,viewportWidth:innerWidth,viewportHeight:innerHeight,rootScroll:document.documentElement.scrollWidth,active:document.activeElement?.dataset.focusKey ?? document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.tagName,activeInside:node.contains(document.activeElement),role:node.getAttribute('role'),modal:node.getAttribute('aria-modal'),focusables:focusables.length,protectedBackground}})()`);
      assert(rect.left >= 0 && rect.top >= 0 && rect.right <= rect.viewportWidth && rect.bottom <= rect.viewportHeight, `${popup} collided with viewport: ${JSON.stringify(rect)}`);
      assert(rect.rootScroll <= rect.viewportWidth + 1, `${popup} combined state leaked page-root overflow`);
      assert(rect.role === "dialog" && rect.modal === "true" && rect.activeInside && rect.focusables >= 1, `${popup} did not establish modal focus`);
      assert(rect.protectedBackground, `${popup} left background controls exposed to focus`);
      const trap = await page.evaluate(`(()=>{const node=document.querySelector('.popup-card');const controls=[...node.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(item=>item.getClientRects().length);controls.at(-1).focus();document.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));const forward=controls.indexOf(document.activeElement);controls[0].focus();document.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));const backward=controls.indexOf(document.activeElement);return {forward,backward,count:controls.length}})()`);
      assert(trap.forward === 0 && trap.backward === trap.count - 1, `${popup} focus trap failed: ${JSON.stringify(trap)}`);
      bounds.push({ popup, ...rect });
      await page.evaluate("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); true");
      await delay(25);
      assert(await page.evaluate("window.__SOL_STORE__.getState().ui.popup === null"), `${popup} did not close on Escape`);
      assert(!(await page.evaluate("Boolean(document.querySelector('.popup-card'))")), `${popup} remained in the accessibility tree after Escape`);
    }
    await page.poll("document.activeElement?.dataset.focusKey === 'thread-more-trigger'", 1200);
    const returnFocus = await page.evaluate("document.activeElement?.dataset.focusKey ?? null");
    assert(returnFocus === "thread-more-trigger", `Escape returned focus to ${returnFocus}`);
    await page.setWindowRect(2400, 1200);
    return { popups: bounds, final_return_focus: returnFocus, modal_isolation: true, focus_traps: popups.length };
  });

  await runCheck("offline outbox survives reload, separates domain sync, snapshots, and replays exactly once", async () => {
    await page.evaluate("window.__SOL_STORE__.reset(); true");
    await page.dispatch({ type: "run-trigger", value: "question.cancel" });
    await page.dispatch({ type: "run-trigger", value: "network.offline" });
    const exact = "Queue this exact message once while offline.";
    await page.input('[data-role="composer-input"]', exact);
    await page.click('[data-action="composer-primary"]');
    const queued = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {outbox:ui.outbox.length,operation:ui.outbox[0]?.operationId,state:ui.outbox[0]?.state,matches:window.__SOL_STORE__.getMessages().filter(message=>message.body===${JSON.stringify(exact)}).length,transport:ui.network.transport,domain:ui.network.domain,cursor:ui.network.snapshotCursor,serverWork:ui.network.serverWork}})()`);
    await page.reload();
    await page.poll("document.readyState === 'complete' && window.__SOL_STORE__", 12000);
    const restored = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {outbox:ui.outbox.length,operation:ui.outbox[0]?.operationId,state:ui.outbox[0]?.state,matches:window.__SOL_STORE__.getMessages().filter(message=>message.body===${JSON.stringify(exact)}).length,transport:ui.network.transport,domain:ui.network.domain}})()`);
    assert(restored.outbox === 1 && restored.operation === queued.operation && restored.state === "queued" && restored.matches === 1, "offline outbox identity did not survive reload");
    await page.dispatch({ type: "network-action", value: "reconnect" });
    await page.dispatch({ type: "run-trigger", value: "network.domain_failure" });
    const domainFailure = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {transport:ui.network.transport,domain:ui.network.domain,serverWork:ui.network.serverWork,receipt:ui.triggerReceipts[0]}})()`);
    assert(domainFailure.receipt?.trigger === "network.domain_failure" && !String(domainFailure.receipt?.result).includes("truthfully unavailable"), "domain-only synchronization failure is not implemented");
    assert(domainFailure.transport !== "Offline" && /fail|error|stale|unavailable/i.test(domainFailure.domain), "domain failure was conflated with transport failure");
    assert(/continu/i.test(domainFailure.serverWork), "domain sync failure hid server-side continuation");
    await page.dispatch({ type: "network-action", value: "replay" });
    const first = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {replayed:ui.replayedOperationIds.length,operation:ui.replayedOperationIds[0],state:ui.outbox[0]?.state,status:ui.statusLine,matches:window.__SOL_STORE__.getMessages().filter(message=>message.body===${JSON.stringify(exact)}).length}})()`);
    await page.dispatch({ type: "network-action", value: "replay" });
    const second = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {replayed:ui.replayedOperationIds.length,state:ui.outbox[0]?.state,status:ui.statusLine,matches:window.__SOL_STORE__.getMessages().filter(message=>message.body===${JSON.stringify(exact)}).length}})()`);
    await page.dispatch({ type: "network-action", value: "snapshot" });
    const snapshot = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {transport:ui.network.transport,domain:ui.network.domain,cursor:ui.network.snapshotCursor,lastCursor:ui.network.lastCursor,outbox:ui.outbox.length,replayed:ui.replayedOperationIds.length}})()`);
    await page.reload();
    await page.poll("document.readyState === 'complete' && window.__SOL_STORE__", 12000);
    const durable = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {operation:ui.outbox[0]?.operationId,state:ui.outbox[0]?.state,cursor:ui.network.snapshotCursor,replayed:ui.replayedOperationIds.length,matches:window.__SOL_STORE__.getMessages().filter(message=>message.body===${JSON.stringify(exact)}).length}})()`);
    assert(queued.outbox === 1 && queued.matches === 1 && queued.state === "queued", "offline send did not create one stable queue item");
    assert(first.replayed === 1 && first.operation === queued.operation && first.state === "delivered" && first.matches === 1, "first replay did not deliver the stable operation exactly once");
    assert(second.replayed === 1 && second.matches === 1 && second.status.startsWith("0 queued"), "second replay was not idempotent");
    assert(snapshot.transport === "Live" && snapshot.domain === "Live" && snapshot.cursor > queued.cursor, "snapshot catch-up did not restore both domains at a newer cursor");
    assert(durable.operation === queued.operation && durable.state === "delivered" && durable.cursor === snapshot.cursor && durable.replayed === 1 && durable.matches === 1, "snapshot/replay outcome did not survive reload exactly once");
    return { queued, restored, domain_failure: domainFailure, first_replay: first, second_replay: second, snapshot, durable };
  });

  await runCheck("corrected 59-trigger controller is exact and remains outside production Chat", async () => {
    await page.evaluate("window.__SOL_STORE__.reset(); true");
    const fixtureTriggers = await page.evaluate(`(()=>{const data=window.__SOL_DATA__;const contract=data.triggerContract??data.trigger_contract??null;if(contract?.families)return Object.entries(contract.families).flatMap(([family,events])=>events.map(event=>family+'.'+event));return data.scenario.deterministic_triggers})()`);
    assert(Array.isArray(fixtureTriggers), "scenario has no deterministic trigger inventory");
    assert(JSON.stringify(fixtureTriggers) === JSON.stringify(CORRECTED_TRIGGERS), `scenario trigger contract drifted: ${JSON.stringify(fixtureTriggers)}`);
    await page.dispatch({ type: "toggle-controller" });
    const controller = await page.evaluate(`(()=>{const root=document.querySelector('.demo-controller');const controls=[...document.querySelectorAll('[data-action="run-trigger"]')];return {present:Boolean(root),label:root?.getAttribute('aria-label'),copy:root?.innerText??'',values:controls.map(node=>node.dataset.value),outside:controls.filter(node=>!node.closest('.demo-controller')).map(node=>node.dataset.value),productionAncestors:controls.filter(node=>node.closest('.chat-header,.composer-shell,.work-composition')).map(node=>node.dataset.value)}})()`);
    assert(controller.present && /demo|deterministic/i.test(`${controller.label} ${controller.copy}`), "corrected triggers are not identified as non-production demo controls");
    assert(JSON.stringify(controller.values.slice(0, CORRECTED_TRIGGERS.length)) === JSON.stringify(CORRECTED_TRIGGERS), "controller does not expose the corrected contract in canonical order");
    assert(JSON.stringify(controller.values.slice(CORRECTED_TRIGGERS.length)) === JSON.stringify(SUPPLEMENTAL_TRIGGERS), "controller supplemental trigger inventory or order drifted");
    assert(CORRECTED_TRIGGERS.every((trigger) => controller.values.filter((value) => value === trigger).length === 1), "controller duplicates or omits a corrected trigger");
    assert(SUPPLEMENTAL_TRIGGERS.every((trigger) => controller.values.filter((value) => value === trigger).length === 1), "controller duplicates or omits a supplemental trigger");
    assert(controller.values.length === CORRECTED_TRIGGERS.length + SUPPLEMENTAL_TRIGGERS.length, `controller exposed ${controller.values.length} triggers instead of the exact 93-trigger inventory`);
    assert(controller.values.includes("scenario.reset"), "controller omits the canonical reset affordance");
    assert(controller.outside.length === 0 && controller.productionAncestors.length === 0, `demo triggers leaked into production Chat: ${controller.outside.join(", ")}`);
    await page.dispatch({ type: "toggle-controller" });
    return { corrected_trigger_count: CORRECTED_TRIGGERS.length, supplemental_trigger_count: SUPPLEMENTAL_TRIGGERS.length, controller_trigger_count: controller.values.length, reset: "scenario.reset", families: Object.keys(CORRECTED_TRIGGER_FAMILIES), production_leaks: 0 };
  });

  await runCheck("all corrected triggers mutate semantic state, render outcomes, emit receipts, and capture evidence", async () => {
    const outcomes = [];
    for (const trigger of CORRECTED_TRIGGERS) {
      await prepareCorrectedTrigger(page, trigger);
      const before = await page.evaluate(semanticSnapshotExpression);
      await page.dispatch({ type: "run-trigger", value: trigger });
      await waitForVisualSettle(page);
      const after = await page.evaluate(semanticSnapshotExpression);
      assertCorrectedTriggerOutcome(trigger, before, after);
      const screenshot = `trigger-${trigger.replaceAll(".", "-")}.png`;
      await captureStableScreenshot(page, join(SCREENSHOTS, screenshot));
      if (IDEMPOTENT_TRIGGERS.has(trigger)) {
        await page.dispatch({ type: "run-trigger", value: trigger });
        const repeated = await page.evaluate(semanticSnapshotExpression);
        assert(semanticFingerprint(repeated) === semanticFingerprint(after), `${trigger} is not idempotent when repeated`);
      }
      outcomes.push({
        trigger,
        receipt: after.receipt,
        screenshot,
        before_fingerprint: semanticFingerprint(before),
        after_fingerprint: semanticFingerprint(after)
      });
    }
    report.matrices.corrected_triggers = outcomes;
    return { implemented_triggers: outcomes.length, semantic_assertions: outcomes.length, state_aware_captures: outcomes.length, idempotency_checks: outcomes.filter(({ trigger }) => IDEMPOTENT_TRIGGERS.has(trigger)).length };
  });

  await runCheck("all supplemental fixture triggers mutate exact semantic outcomes", async () => {
    const outcomes = [];
    for (const trigger of SUPPLEMENTAL_TRIGGERS) {
      await prepareSupplementalTrigger(page, trigger);
      const before = await page.evaluate(semanticSnapshotExpression);
      await page.dispatch({ type: "run-trigger", value: trigger });
      await waitForVisualSettle(page);
      const after = await page.evaluate(semanticSnapshotExpression);
      assertSupplementalTriggerOutcome(trigger, before, after);
      if (["provider.continuation_stale_rejected", "provider.continuation_expired_rejected", "provider.continuation_topology_mismatch_rejected"].includes(trigger)) {
        await page.dispatch({ type: "run-trigger", value: "provider.continuation_resumed" });
        const rejectedResume = await page.evaluate("window.__SOL_STORE__.getState().ui.providerSetup");
        assert(rejectedResume.result === "not resumed" && rejectedResume.current === false && rejectedResume.resumeCount === 0, `${trigger} did not block a later resume attempt`);
      }
      if (trigger === "network.replay") {
        await page.dispatch({ type: "run-trigger", value: "network.replay" });
        const replayed = await page.evaluate("(()=>{const ui=window.__SOL_STORE__.getState().ui;return {ids:ui.replayedOperationIds,outbox:ui.outbox,receipt:ui.triggerReceipts[0]}})()");
        assert(replayed.ids.length === 1 && replayed.outbox.filter((item) => item.state === "delivered").length === 1 && /^0 queued commands replayed/.test(replayed.receipt.result), "network.replay was not idempotent on a repeated fixture event");
      }
      if (trigger === "notification.inline_outcome") {
        await page.click('[data-action="notification-close"]');
        assert(await page.evaluate("window.__SOL_STORE__.getState().ui.notification.state === 'closed' && !document.querySelector('.titlebar-notification-inbox')"), "title-bar notification inbox could not be truthfully closed");
      }
      outcomes.push({
        trigger,
        receipt: after.receipt,
        before_fingerprint: semanticFingerprint(before),
        after_fingerprint: semanticFingerprint(after),
        status: "pass"
      });
    }
    report.matrices.supplemental_triggers = outcomes;
    return { implemented_triggers: outcomes.length, semantic_assertions: outcomes.length, exact_inventory: true };
  });

  await runCheck("system and scenario reset return one deterministic canonical state", async () => {
    await page.evaluate("localStorage.clear(); window.__SOL_STORE__.reset(); true");
    const canonical = await page.evaluate(semanticSnapshotExpression);
    await prepareCorrectedTrigger(page, "system.reset");
    const dirty = await page.evaluate(semanticSnapshotExpression);
    await page.dispatch({ type: "run-trigger", value: "system.reset" });
    const systemReset = await page.evaluate(semanticSnapshotExpression);
    assert(systemReset.receipt?.trigger === "system.reset", "system.reset did not emit its exact receipt");
    assert(semanticFingerprint(systemReset) !== semanticFingerprint(dirty), "system.reset did not clear the prepared state");
    await page.dispatch({ type: "run-trigger", value: "scenario.reset" });
    const first = await page.evaluate(semanticSnapshotExpression);
    const screenshot = "trigger-scenario-reset.png";
    await captureStableScreenshot(page, join(SCREENSHOTS, screenshot));
    await page.dispatch({ type: "run-trigger", value: "scenario.reset" });
    const second = await page.evaluate(semanticSnapshotExpression);
    assert(semanticFingerprint(first) === semanticFingerprint(canonical), "scenario.reset did not restore the canonical initial state");
    assert(semanticFingerprint(second) === semanticFingerprint(canonical), "repeated scenario.reset was not deterministic");
    assert(first.receipt == null && second.receipt == null, "scenario.reset retained stale trigger receipts");
    report.matrices.reset_determinism = [{ trigger: "system.reset", receipt: systemReset.receipt, status: "pass" }, { trigger: "scenario.reset", screenshot, status: "pass", repeated: true }];
    return { system_reset_receipt: systemReset.receipt, scenario_reset: "canonical and repeatable", screenshot };
  });

  await runCheck("selectors, Review access, BSD, provider acquisition, warnings, and attachments mutate visibly", async () => {
    await page.evaluate("window.__SOL_STORE__.reset(); true");
    await page.dispatch({ type: "run-trigger", value: "question.cancel" });
    await page.select('[data-role="window-select"]', "window-03");
    await page.select('[data-role="thread-concept-select"]', "thread-06");
    await page.select('[data-role="theme-select"]', "retro-light");

    await page.dispatch({ type: "open-popup", value: "route" });
    assert(await page.evaluate("Boolean(document.querySelector('[data-role=\"route-search\"]'))"), "route search has no stateful data-role contract");
    await page.input('[data-role="route-search"]', "Anthropic");
    const filtered = await page.evaluate(`(()=>({query:window.__SOL_STORE__.getState().ui.routeSearch,visible:[...document.querySelectorAll('.route-row,.provider-choice')].filter(node=>node.getClientRects().length).map(node=>node.textContent.trim())}))()`);
    assert(filtered.query === "Anthropic" && filtered.visible.length > 0 && filtered.visible.every((label) => /anthropic|claude|opus|sonnet/i.test(label)), "route search did not filter provider/account/model rows");
    await page.click('[data-action="route-provider"][data-value="Anthropic"]');
    await page.click('[data-action="route-account"][data-provider="Anthropic"]');
    await page.click('[data-action="route-model"][data-model-id="opus-5"]');
    await page.click('[data-action="route-effort"]', 0);
    await page.click('[data-action="route-speed"]', 0);
    const route = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {provider:ui.route.provider,account:ui.route.accountId,model:ui.route.modelId,effort:ui.route.effort,speed:ui.route.speed,requested:ui.route.requested,effective:ui.route.effective,popup:ui.popup}})()`);
    assert(route.provider === "Anthropic" && route.account === "anthropic-cli" && route.model === "opus-5" && route.popup === "route", "route selection lost provider/account/model identity or closed prematurely");
    assert(route.requested && route.effective, "route does not expose requested and effective values");

    const accessStates = [];
    await page.dispatch({ type: "open-popup", value: "access" });
    for (const access of ["Ask for approval", "Auto accept edits", "Auto", "Full Access"]) {
      await page.click(`[data-action="set-access"][data-value=${JSON.stringify(access)}]`);
      accessStates.push(await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {requested:ui.access.requested,effective:ui.access.effective,limitation:ui.access.limitation}})()`));
    }
    assert(accessStates.map((item) => item.requested).join("|") === "Ask for approval|Auto accept edits|Auto|Full Access", "four access profiles are not independently selectable");
    await page.dispatch({ type: "close-popup" });
    const reviewControl = await page.evaluate("Boolean(document.querySelector('[data-action=\"set-mode\"][data-value=\"Review\"]'))");
    assert(reviewControl, "Review mode has no visible selector");
    await page.click('[data-action="set-mode"][data-value="Review"]');
    await page.dispatch({ type: "open-popup", value: "access" });
    await page.click('[data-action="set-access"][data-value="Full Access"]');
    const reviewAccess = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {mode:ui.conversationMode,requested:ui.access.requested,effective:ui.access.effective,limitation:ui.access.limitation,visible:document.body.innerText.includes(ui.access.effective)&&document.body.innerText.includes(ui.access.limitation)}})()`);
    assert(reviewAccess.mode === "Review" && reviewAccess.requested === "Full Access" && reviewAccess.effective === "Ask for approval" && reviewAccess.limitation && reviewAccess.visible, "Review mode did not visibly constrain effective access");

    const bsdStates = [];
    await page.dispatch({ type: "open-popup", value: "bsd" });
    for (const mode of ["Off", "Auto", "On"]) {
      await page.click(`[data-action="set-bsd"][data-value=${JSON.stringify(mode)}]`);
      bsdStates.push(await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {mode:ui.bsd.mode,state:ui.bsd.state,message:ui.bsd.message}})()`));
    }
    for (const trigger of ["bsd.auto_idle", "bsd.auto_active", "bsd.advice", "bsd.timeout", "bsd.unavailable"]) {
      await page.dispatch({ type: "run-trigger", value: trigger });
      const bsd = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {receipt:ui.triggerReceipts[0],state:ui.bsd.state,message:ui.bsd.message,visible:document.body.innerText.includes(ui.bsd.message)}})()`);
      assert(bsd.receipt?.trigger === trigger && !String(bsd.receipt?.result).includes("truthfully unavailable") && bsd.message && bsd.visible, `${trigger} has no visible BSD consequence`);
    }

    await page.dispatch({ type: "run-trigger", value: "provider.setup" });
    const acquisition = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;const value=ui.providerAcquisition??ui.route.providerAcquisition??ui.providerSetup??null;return {value,receipt:ui.triggerReceipts[0],visible:value?document.body.innerText.includes(value.message??value.status??value.source??''):false}})()`);
    assert(acquisition.receipt?.trigger === "provider.setup" && !String(acquisition.receipt?.result).includes("truthfully unavailable"), "provider acquisition is not explicitly user-triggered");
    assert(acquisition.value && acquisition.value.installedByDefault === false && acquisition.value.requiresUserAction === true && acquisition.value.officialSourceRef && acquisition.value.officialSourceKind && acquisition.value.host && acquisition.value.environment && acquisition.value.topologyGeneration && acquisition.value.authSeparate === true && acquisition.value.continuationToken, "provider acquisition lacks exact official-source, host/environment/topology, auth, or continuation semantics");

    await page.dispatch({ type: "close-popup" });
    const attachments = [];
    for (const expected of ["native", "transformed", "alternate", "unsupported"]) {
      await page.click('[data-action="attachment-menu"]');
      const attachment = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {...ui.attachmentResolution,visible:Boolean(document.querySelector('.attachment-card'))&&document.body.innerText.includes(ui.attachmentResolution.detail)}})()`);
      assert(attachment.state === expected && attachment.detail && attachment.visible, `attachment ${expected} has no visible consequence`);
      if (expected === "alternate") assert(/consent|provider|privacy/i.test(attachment.detail), "alternate attachment route omits consent/provider impact");
      if (expected === "unsupported") assert(/no truthful route|unsupported/i.test(`${attachment.label} ${attachment.detail}`), "unsupported attachment is not truthful");
      attachments.push(attachment);
    }

    await page.dispatch({ type: "run-trigger", value: "decision.approval_open" });
    await page.dispatch({ type: "run-trigger", value: "decision.details" });
    const warningDetails = await page.evaluate("Boolean(document.querySelector('.approval-card .decision-evidence'))");
    await page.dispatch({ type: "run-trigger", value: "decision.approve" });
    const approved = await page.evaluate("window.__SOL_STORE__.getState().ui.approval.state");
    assert(warningDetails && approved === "approved", "warning details/approval consequence is incomplete");

    await page.dispatch({ type: "open-popup", value: "context" });
    await page.click('[data-action="context-compact-now"]');
    await page.dispatch({ type: "open-popup", value: "search" });
    await page.click('[data-action="search-scope"][data-value="All Threads"]');
    await page.input('[data-role="search-input"]', "provider");
    const results = await page.evaluate("document.querySelectorAll('[data-action=\"search-result\"]').length");
    const ui = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {window:ui.selectedWindow,thread:ui.selectedThreadConcept,theme:ui.theme,attachment:ui.attachmentResolution.state,access:ui.access.requested,effective:ui.access.effective,bsd:ui.bsd.mode,context:ui.context.compactReceipt,scope:ui.search.scope,query:ui.search.query}})()`);
    assert(ui.window === "window-03" && ui.thread === "thread-06" && ui.theme === "retro-light", "comparison selectors did not remain independent");
    assert(ui.attachment === "unsupported" && ui.access === "Full Access" && ui.effective === "Ask for approval", "route/access/attachment controls failed");
    assert(Boolean(ui.context) && ui.scope === "All Threads" && ui.query === "provider" && results > 0, "context or one-bar search failed");
    return { ...ui, route, access_states: accessStates, review_access: reviewAccess, bsd_states: bsdStates, provider_acquisition: acquisition.value, attachments, warning_details: warningDetails, warning_outcome: approved, search_results: results };
  });

  await runCheck("provider acquisition requires explicit consent, separate authentication, readiness, and a current continuation", async () => {
    await page.evaluate("window.__SOL_STORE__.reset(); true");
    await page.dispatch({ type: "run-trigger", value: "provider.setup_required" });
    const required = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {setup:ui.providerSetup,receipt:ui.triggerReceipts[0],visible:document.body.innerText.includes('Provider Setup Required')}})()`);
    assert(required.receipt?.trigger === "provider.setup_required" && !String(required.receipt?.result).includes("truthfully unavailable"), "provider setup-required trigger is unavailable");
    assert(required.setup?.installedByDefault === false && required.setup?.requiresUserAction === true && required.setup?.autoInitialAcquisitionAllowed === false, "provider CLI is bundled, preseeded, or silently acquirable");
    assert(required.setup?.officialSourceKind === "provider_documented_package_manager_route" && required.setup?.officialSourceRef && required.setup?.host && required.setup?.environment && required.setup?.topologyGeneration && required.setup?.exactRow && required.visible, "provider setup omits exact official source or Host / Environment / topology projection");
    assert(required.setup?.authSeparate === true && required.setup?.continuationToken && required.setup?.originatingOperationRef, "provider setup conflates authentication or loses continuation identity");
    const initialPlan = required.setup?.supplyChainPlan;
    assert(initialPlan?.fixture_only === true && initialPlan?.official_source_ref === required.setup.officialSourceRef && initialPlan?.execution_host_id === required.setup.hostId && initialPlan?.execution_environment_id === required.setup.environmentId && initialPlan?.topology_generation === required.setup.topologyGeneration, "provider setup lacks an exact fixture-only source-and-target contract");
    assert(initialPlan?.signature_or_attestation_ref && initialPlan?.trust_root_ref && required.setup?.supplyChainProof == null, "provider setup falsely presents pre-acquisition planning as completed ProviderCliSupplyChainProof evidence");

    await page.dispatch({ type: "run-trigger", value: "provider.auth_required" });
    const prematureAuth = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {setup:ui.providerSetup,receipt:ui.triggerReceipts[0],body:document.body.innerText}})()`);
    assert(prematureAuth.receipt?.trigger === "provider.auth_required" && prematureAuth.setup.installState === "missing" && prematureAuth.setup.authState === "blocked until installation" && prematureAuth.setup.readinessState === "blocked on installation", "authentication advanced before installation verification");
    assert(prematureAuth.setup.setupState === "installation required" && prematureAuth.body.includes(prematureAuth.setup.message), "premature authentication rejection is not visibly aggregated");

    await page.evaluate("window.__SOL_STORE__.reset(); true");
    await page.dispatch({ type: "run-trigger", value: "provider.setup_required" });

    await page.dispatch({ type: "set-bsd", value: "On" });
    const beforeNoConsent = await page.evaluate("JSON.stringify(window.__SOL_STORE__.getState().ui.providerSetup)");
    await page.dispatch({ type: "run-trigger", value: "provider.install_verified" });
    const blocked = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {setup:ui.providerSetup,receipt:ui.triggerReceipts[0]}})()`);
    assert(blocked.receipt?.trigger === "provider.install_verified" && /blocked|did not start|no explicit consent/i.test(`${blocked.setup.installState} ${blocked.setup.message} ${blocked.receipt.result}`), "provider installation advanced without explicit consent");
    assert(blocked.setup.authState !== "authenticated", "installation silently authenticated the provider");
    assert(beforeNoConsent !== JSON.stringify(blocked.setup), "blocked no-consent attempt produced no inspectable outcome");

    const steps = [];
    for (const trigger of ["provider.install_intent", "provider.install_approved", "provider.install_verified", "provider.auth_required", "provider.authenticated", "provider.readiness_verified"]) {
      await page.dispatch({ type: "run-trigger", value: trigger });
      const state = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {setup:ui.providerSetup,receipt:ui.triggerReceipts[0],body:document.body.innerText}})()`);
      assert(state.receipt?.trigger === trigger && !String(state.receipt?.result).includes("truthfully unavailable"), `${trigger} is unavailable`);
      assert(state.body.includes(state.setup.message), `${trigger} has no visible setup consequence`);
      steps.push({ trigger, setup_state: state.setup.setupState, install_state: state.setup.installState, auth_state: state.setup.authState, readiness_state: state.setup.readinessState });
    }
    const readySnapshot = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {setup:ui.providerSetup,badge:document.querySelector('.provider-setup-projection header .state-word')?.textContent?.trim()??''}})()`);
    const ready = readySnapshot.setup;
    assert(ready.acquisitionConsentReceipt && ready.installState === "verified", "verified install lacks an explicit acquisition consent receipt");
    assert(ready.supplyChainProof?.proof_status === "verified_fixture_receipt" && ready.supplyChainProof?.verification_receipt_ref && ready.supplyChainProof?.installation_generation === "installation-generation-1", "verified installation lacks its typed fixture proof receipt");
    assertExactProviderProof(ready.supplyChainProof, ready, "verified provider lifecycle");
    assert(ready.setupState === "ready" && ready.authState === "authenticated" && ready.readinessState === "model ready" && readySnapshot.badge === "Ready", "authentication/readiness lifecycle or aggregate setup badge did not complete separately");
    const token = ready.continuationToken;
    await page.dispatch({ type: "run-trigger", value: "provider.continuation_resumed" });
    const resumed = await page.evaluate("window.__SOL_STORE__.getState().ui.providerSetup");
    assert(resumed.continuationToken === token && resumed.result === "resumed once" && resumed.current === false, "current continuation did not resume exactly once");
    await page.dispatch({ type: "run-trigger", value: "provider.continuation_resumed" });
    const replay = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {setup:ui.providerSetup,receipt:ui.triggerReceipts[0]}})()`);
    assert(replay.setup.result !== "resumed twice" && /not resumed|stale|incomplete/i.test(replay.receipt.result), "provider continuation replayed more than once");
    const derivedRejections = [];
    for (const [trigger, reason, result] of [
      ["provider.continuation_stale_rejected", "operation revision changed", "stale rejected"],
      ["provider.continuation_expired_rejected", "continuation expired", "expired rejected"],
      ["provider.continuation_topology_mismatch_rejected", "topology generation changed", "topology mismatch rejected"]
    ]) {
      await page.evaluate("window.__SOL_STORE__.reset(); true");
      await page.dispatch({ type: "run-trigger", value: "provider.setup_required" });
      await page.dispatch({ type: "run-trigger", value: trigger });
      const rejected = await page.evaluate("window.__SOL_STORE__.getState().ui.providerSetup");
      assert(rejected.result === result && rejected.current === false && rejected.currentnessReasons.includes(reason), `${trigger} did not derive ${reason}`);
      await page.dispatch({ type: "run-trigger", value: "provider.continuation_resumed" });
      const refused = await page.evaluate("window.__SOL_STORE__.getState().ui.providerSetup");
      assert(refused.result === "not resumed" && refused.resumeCount === 0, `${trigger} allowed a stale continuation to resume`);
      derivedRejections.push({ trigger, reason, result: rejected.result });
    }
    await page.evaluate("window.__SOL_STORE__.reset(); true");
    await page.dispatch({ type: "run-trigger", value: "provider.setup_required" });
    await page.dispatch({ type: "route-model", provider: "OpenAI", accountId: "openai-team", modelId: "5.6-sol" });
    const supersededByRoute = await page.evaluate("window.__SOL_STORE__.getState().ui.providerSetup");
    assert(supersededByRoute.intentState === "superseded" && supersededByRoute.current === false && supersededByRoute.currentnessReasons.includes("originating intent is superseded"), "a later route selection did not invalidate the originating continuation");
    await page.dispatch({ type: "run-trigger", value: "provider.continuation_resumed" });
    const supersededResume = await page.evaluate("window.__SOL_STORE__.getState().ui.providerSetup");
    assert(supersededResume.result === "not resumed" && supersededResume.resumeCount === 0, "a superseded route operation resumed");
    await page.evaluate("window.__SOL_STORE__.reset(); true");
    await page.dispatch({ type: "run-trigger", value: "provider.setup_required" });
    await page.dispatch({ type: "run-trigger", value: "provider.existing_found" });
    const existing = await page.evaluate("window.__SOL_STORE__.getState().ui.providerSetup");
    assert(existing.installState === "existing installation found" && existing.discoveredInstallationRef && !existing.acquisitionConsentReceipt && existing.supplyChainProof == null, "existing provider discovery was conflated with initial acquisition or validated adoption");
    await page.dispatch({ type: "run-trigger", value: "provider.use_existing" });
    const selectedExisting = await page.evaluate("window.__SOL_STORE__.getState().ui.providerSetup");
    assert(selectedExisting.installState === "selected existing" && selectedExisting.authState === "required", "existing-installation selection did not remain separate from authentication");
    assertExactProviderProof(selectedExisting.supplyChainProof, selectedExisting, "selected existing installation");
    return { required: required.setup, premature_authentication: prematureAuth.setup, blocked_without_consent: blocked.setup, steps, continuation_token: token, resumed: resumed.result, replay: replay.receipt.result, derived_rejections: derivedRejections, superseded_by_route: supersededByRoute.currentnessReasons, existing_installation: existing.discoveredInstallationRef, existing_adoption_proof: selectedExisting.supplyChainProof.proof_id };
  });

  await runCheck("focused visual state gallery", async () => {
    const captured = [];
    const reveal = async (selector) => {
      await page.poll(`document.querySelector(${JSON.stringify(selector)})`, 1200);
      await delay(40);
      const align = async () => page.evaluate(`(()=>{const node=document.querySelector(${JSON.stringify(selector)});const transcript=node.closest('[data-role="transcript"]');if(transcript){transcript.style.scrollBehavior='auto';const nodeRect=node.getBoundingClientRect();const transcriptRect=transcript.getBoundingClientRect();transcript.scrollTop+=nodeRect.top-transcriptRect.top-24}return true})()`);
      await align();
      await delay(80);
      let visibility = await page.evaluate(`(()=>{const node=document.querySelector(${JSON.stringify(selector)});const transcript=node.closest('[data-role="transcript"]');const nodeRect=node.getBoundingClientRect();const transcriptRect=transcript.getBoundingClientRect();return {top:nodeRect.top,bottom:nodeRect.bottom,transcript_top:transcriptRect.top,transcript_bottom:transcriptRect.bottom,visible:nodeRect.bottom>transcriptRect.top&&nodeRect.top<transcriptRect.bottom}})()`);
      if (!visibility.visible) {
        await align();
        await delay(60);
        visibility = await page.evaluate(`(()=>{const node=document.querySelector(${JSON.stringify(selector)});const transcript=node.closest('[data-role="transcript"]');const nodeRect=node.getBoundingClientRect();const transcriptRect=transcript.getBoundingClientRect();return {top:nodeRect.top,bottom:nodeRect.bottom,transcript_top:transcriptRect.top,transcript_bottom:transcriptRect.bottom,visible:nodeRect.bottom>transcriptRect.top&&nodeRect.top<transcriptRect.bottom}})()`);
      }
      assert(visibility.visible, `${selector} was not visible for its evidence frame`);
    };
    const capture = async (name, requiredSelector = null) => {
      const reducedMotion = await page.evaluate("window.__SOL_STORE__.getState().ui.reducedMotion");
      if (reducedMotion) await delay(30);
      else await waitForVisualSettle(page);
      if (requiredSelector) {
        const visibility = await page.evaluate(`(()=>{const node=document.querySelector(${JSON.stringify(requiredSelector)});if(!node)return {present:false};const rect=node.getBoundingClientRect();const style=getComputedStyle(node);return {present:true,left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom,opacity:Number(style.opacity),visible:rect.right>0&&rect.bottom>0&&rect.left<innerWidth&&rect.top<innerHeight&&Number(style.opacity)>.95}})()`);
        assert(visibility.visible, `${requiredSelector} was not visibly settled for ${name}: ${JSON.stringify(visibility)}`);
      }
      await captureStableScreenshot(page, join(SCREENSHOTS, name));
      captured.push(name);
    };

    await page.setWindowRect(2400, 1200);
    for (let index = 0; index < THREADS.length; index += 1) {
      await page.evaluate("window.__SOL_STORE__.reset(); true");
      await page.dispatch({ type: "select-window", value: WINDOWS[index] });
      await page.dispatch({ type: "select-thread-concept", value: THREADS[index] });
      await page.dispatch({ type: "select-theme", value: THEMES[index] });
      await page.dispatch({ type: "set-width", value: 750 });
      await page.dispatch({ type: "history-set", value: "closed" });
      await page.dispatch({ type: "artifact-state", value: "closed" });
      await page.dispatch({ type: "run-trigger", value: "question.open" });
      await reveal(".question-surface");
      await capture(`question-${THREADS[index]}.png`);
      await page.dispatch({ type: "run-trigger", value: "question.submit" });
      await reveal(".work-composition");
      await capture(`work-${THREADS[index]}.png`);
    }

    await page.evaluate("window.__SOL_STORE__.reset(); true");
    await page.dispatch({ type: "select-window", value: "window-06" });
    await page.dispatch({ type: "select-thread-concept", value: "thread-07" });
    await page.dispatch({ type: "select-theme", value: "friendly-dark" });
    await page.dispatch({ type: "set-width", value: 750 });
    for (const trigger of ["question.submit", "approval.request", "route.warning", "network.offline"]) await page.dispatch({ type: "run-trigger", value: trigger });
    await page.evaluate("document.querySelector('[data-role=\"transcript\"]').scrollTop=0; true");
    await capture("state-decisions-offline.png");

    await page.dispatch({ type: "select-window", value: "window-04" });
    await page.dispatch({ type: "select-thread-concept", value: "thread-04" });
    await page.dispatch({ type: "history-set", value: "pinned compact" });
    await page.dispatch({ type: "artifact-state", value: "error" });
    await capture("state-artifact-error.png");

    await page.dispatch({ type: "set-width", value: 520 });
    await page.dispatch({ type: "open-popup", value: "route" });
    await capture("state-route-picker-520.png", ".route-popup");
    await page.dispatch({ type: "close-popup" });
    await page.dispatch({ type: "open-popup", value: "search" });
    await page.dispatch({ type: "search-scope", value: "All Threads" });
    await page.dispatch({ type: "search-query", value: "provider" });
    await capture("state-search-all-520.png", ".search-popup");
    await page.dispatch({ type: "close-popup" });

    await page.dispatch({ type: "run-trigger", value: "question.cancel" });
    await page.dispatch({ type: "set-draft", value: "Retained local draft with passive spellcheck and thread-local revision history." });
    await capture("state-durable-composer-520.png");
    await page.dispatch({ type: "set-mount", value: "popout" });
    await page.dispatch({ type: "open-popup", value: "context" });
    await capture("state-popout-context.png", ".context-popup");
    await page.dispatch({ type: "close-popup" });
    await page.dispatch({ type: "toggle-controller" });
    await capture("state-deterministic-controller.png", ".demo-controller");

    assert(captured.length === 23 && captured.every((name) => name.endsWith(".png")), `captured ${captured.length} focused frames`);
    report.matrices.focused_frames = captured;
    return { frame_count: captured.length, frames: captured };
  });

  await runCheck("no browser console or runtime errors", async () => {
    await page.collectErrors();
    report.console_errors = [...new Set(page.consoleErrors.filter((entry) => !entry.includes("favicon.ico")))];
    report.runtime_exceptions = [...new Set(page.runtimeErrors)];
    assert(report.console_errors.length === 0, report.console_errors.join(" | "));
    assert(report.runtime_exceptions.length === 0, report.runtime_exceptions.join(" | "));
    return { console_errors: report.console_errors.length, runtime_exceptions: report.runtime_exceptions.length };
  });
} finally {
  try {
    await page.collectErrors();
    report.console_errors = [...new Set(page.consoleErrors.filter((entry) => !entry.includes("favicon.ico")))];
    report.runtime_exceptions = [...new Set(page.runtimeErrors)];
  } catch (error) {
    report.observations.push(`Post-run browser error collection failed: ${error.message}`);
    report.failed += 1;
    report.checks.push({ name: "post-run browser error sentinel", status: "fail", duration_ms: 0, error: error.message });
  }
  if (!report.checks.length) {
    report.failed += 1;
    report.checks.push({ name: "execution scope sentinel", status: "fail", duration_ms: 0, error: "The selected filter executed zero checks" });
  }
  if ((report.console_errors.length || report.runtime_exceptions.length) && !report.checks.some((check) => check.status === "fail" && check.name.includes("browser error"))) {
    report.failed += 1;
    report.checks.push({ name: "post-run browser error sentinel", status: "fail", duration_ms: 0, error: [...report.console_errors, ...report.runtime_exceptions].join(" | ") });
  }
  try {
    const screenshotReferences = [
      ...(report.matrices.theme_width ?? []).map((row) => row.screenshot),
      ...(report.matrices.corrected_triggers ?? []).map((row) => row.screenshot),
      ...(report.matrices.reset_determinism ?? []).map((row) => row.screenshot),
      ...(report.matrices.focused_frames ?? [])
    ].filter(Boolean);
    if (new Set(screenshotReferences).size !== screenshotReferences.length) throw new Error("Duplicate screenshot references were emitted by the selected checks");
    report.screenshot_manifest = screenshotReferences.sort().map((file) => {
      const bytes = readFileSync(join(SCREENSHOTS, file));
      return { file, bytes: bytes.length, sha256: sha256(bytes) };
    });
  } catch (error) {
    report.failed += 1;
    report.checks.push({ name: "screenshot evidence sentinel", status: "fail", duration_ms: 0, error: error.message });
  }
  try { await page.close(); } catch (error) { report.observations.push(`Automation close warning: ${error.message}`); }
  if (browser.exitCode === null) {
    browser.kill("SIGTERM");
    await Promise.race([new Promise((resolveExit) => browser.once("exit", resolveExit)), delay(800)]);
  }
  cleanup();
  report.browser_stderr_tail = browserStderr().split("\n").filter(Boolean).slice(-12);
  mkdirSync(dirname(REPORT_PATH), { recursive: true });
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
}

console.log(JSON.stringify({ status: report.failed === 0 ? "pass" : "fail", passed: report.passed, failed: report.failed, report: REPORT_PATH }, null, 2));
process.exitCode = report.failed === 0 ? 0 : 1;
