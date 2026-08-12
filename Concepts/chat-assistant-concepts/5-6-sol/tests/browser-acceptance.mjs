#!/usr/bin/env node

import { spawn } from "node:child_process";
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
const CHECK_FILTER = process.env.SOL_CHECK_FILTER?.trim().toLowerCase() ?? "";
const REPORT_PATH = process.env.SOL_REPORT_PATH ?? join(EVIDENCE, "browser-acceptance.json");
const BROWSER_KIND = process.env.SOL_BROWSER?.trim().toLowerCase() === "chromium" ? "chromium" : "firefox";
const MOTION_SETTLE_MS = 700;
const THEMES = ["friendly-dark", "friendly-light", "retro-dark", "retro-light", "basic-dark", "basic-light", "glass-dark", "glass-light"];
const WIDTHS = [520, 750, 975, 1200];
const WINDOWS = Array.from({ length: 8 }, (_, index) => `window-${String(index + 1).padStart(2, "0")}`);
const THREADS = Array.from({ length: 8 }, (_, index) => `thread-${String(index + 1).padStart(2, "0")}`);
const PAGES = ["index.html", ...WINDOWS.map((id) => `${id}.html`), ...THREADS.map((id) => `${id}.html`)];
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

mkdirSync(SCREENSHOTS, { recursive: true });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
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
    await this.request("/url", "POST", { url });
    await this.poll("document.readyState === 'complete' && window.__SOL_STORE__ && document.querySelector('.window-concept')", 12000);
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
  }

  async collectErrors() {
    try {
      const errors = await this.evaluate("window.__SOL_BROWSER_ERRORS__ ?? {console:[],runtime:[]}");
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

  async send(method, params = {}) {
    const id = this.nextId++;
    const response = new Promise((resolveResponse, rejectResponse) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        rejectResponse(new Error(`Chromium CDP command timed out: ${method}`));
      }, 15000);
      this.pending.set(id, { resolve: resolveResponse, reject: rejectResponse, timer });
    });
    this.socket.send(JSON.stringify({ id, method, params }));
    return response;
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

  async evaluate(expression) {
    const response = await this.connection.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true });
    if (response.exceptionDetails) {
      const detail = response.exceptionDetails.exception?.description ?? response.exceptionDetails.text ?? "Chromium evaluation failed";
      throw new Error(detail);
    }
    return response.result?.value;
  }

  async navigate(url) {
    await this.collectErrors();
    await this.connection.send("Page.navigate", { url });
    await this.poll("document.readyState === 'complete' && window.__SOL_STORE__ && document.querySelector('.window-concept')", 12000);
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
    await this.poll("document.readyState === 'complete' && window.__SOL_STORE__", 12000);
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
  await waitForEndpoint(origin);
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
  const version = await waitForEndpoint(origin, 10000, "/json/version");
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
  schema_id: "pm.chat.5_6_sol.browser_acceptance.v1",
  model_label: "5.6 Sol",
  generated_at: new Date().toISOString(),
  base_url: BASE_URL,
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
  if (CHECK_FILTER && !name.toLowerCase().includes(CHECK_FILTER)) return;
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
    store.reset();
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
  assert(evidence.chat_width > 0 && (feature === "popout state restoration" || evidence.transcript_height >= 250), `${feature} lost the chat geometry`);
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

const { browser, browserStderr, cleanup, page } = await startBrowser();

try {
  report.environment = BROWSER_KIND === "chromium"
    ? { product: `Chromium ${page.capabilities.browserVersion}`, engine: "Blink", user_agent: page.capabilities.userAgent, viewport: "2400x1200", automation: `Chrome DevTools Protocol ${page.capabilities.cdpVersion}` }
    : { product: `Firefox ${page.capabilities.browserVersion}`, engine: "Gecko", user_agent: page.capabilities.userAgent, viewport: "2400x1200", automation: `geckodriver ${page.capabilities.mozGeckodriverVersion ?? page.capabilities["moz:geckodriverVersion"]}` };

  await runCheck("all entry pages boot with exact model label", async () => {
    const entries = [];
    for (const file of PAGES) {
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
        const evidence = await page.evaluate(`(()=>{const w=document.querySelector('.window-concept');const t=document.querySelector('.thread-concept');const tr=document.querySelector('[data-role="transcript"]');return {
          window:w?.dataset.windowConcept,thread:t?.dataset.threadConcept,window_count:document.querySelectorAll('.window-concept').length,thread_count:document.querySelectorAll('.thread-concept').length,
          question_count:document.querySelectorAll('.question-surface').length,work_count:document.querySelectorAll('.work-composition').length,message_count:document.querySelectorAll('[data-message-id]').length,
          transcript_height:tr?.clientHeight ?? 0,fatal:Boolean(document.querySelector('.fatal-state'))
        }})()`);
        assert(evidence.window === windowId && evidence.thread === threadId, `${windowId} x ${threadId} mounted incorrectly`);
        assert(evidence.window_count === 1 && evidence.thread_count === 1, `${windowId} x ${threadId} duplicated a root`);
        assert(evidence.question_count === 1 && evidence.work_count === 1, `${windowId} x ${threadId} lost its distinct question/work grammar`);
        assert(evidence.message_count >= 8 && evidence.transcript_height >= 250 && !evidence.fatal, `${windowId} x ${threadId} is incomplete`);
        pairings.push({ window: windowId, thread: threadId, status: "pass" });
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

  await runCheck("eight themes across four chat widths", async () => {
    const cells = [];
    for (let themeIndex = 0; themeIndex < THEMES.length; themeIndex += 1) {
      const theme = THEMES[themeIndex];
      for (const width of WIDTHS) {
        const windowId = WINDOWS[themeIndex];
        const threadId = THREADS[themeIndex];
        await page.evaluate(`(()=>{const s=window.__SOL_STORE__;s.dispatch({type:'select-window',value:${JSON.stringify(windowId)}});s.dispatch({type:'select-thread-concept',value:${JSON.stringify(threadId)}});s.dispatch({type:'select-theme',value:${JSON.stringify(theme)}});s.dispatch({type:'set-width',value:${width}});s.dispatch({type:'history-set',value:'pinned compact'});s.dispatch({type:'artifact-state',value:'ready'});return true})()`);
        await delay(MOTION_SETTLE_MS);
        const geometry = await page.evaluate(`(()=>{const frame=document.querySelector('.concept-frame');const chat=document.querySelector('.chat-mount');const tr=document.querySelector('[data-role="transcript"]');const style=getComputedStyle(document.documentElement);const animated=[...document.querySelectorAll('.chat-mount,.thread-concept,.artifact-region,.history-region,[data-message-id],.question-surface,.work-composition')];return {theme:document.documentElement.dataset.theme,width:window.__SOL_STORE__.getState().ui.chatWidth,frame_width:frame.offsetWidth,chat_width:chat.offsetWidth,transcript_height:tr.clientHeight,accent:style.getPropertyValue('--accent').trim(),root_scroll_width:document.documentElement.scrollWidth,viewport:innerWidth,min_settled_opacity:Math.min(...animated.map(node=>Number(getComputedStyle(node).opacity)))}})()`);
        assert(geometry.theme === theme && geometry.width === width, `${theme} ${width} state did not apply`);
        assert(geometry.chat_width >= width - 2 && geometry.chat_width <= width + 2, `${theme} ${width} chat measured ${geometry.chat_width}`);
        assert(geometry.transcript_height >= 250 && geometry.accent, `${theme} ${width} lost layout or theme tokens`);
        assert(geometry.min_settled_opacity >= .99, `${theme} ${width} evidence capture remained mid-motion at opacity ${geometry.min_settled_opacity}`);
        assert(geometry.root_scroll_width <= geometry.viewport + 1, `${theme} ${width} leaked horizontal overflow to the page root`);
        const screenshot = `${theme}-${width}.png`;
        await page.screenshot(join(SCREENSHOTS, screenshot));
        cells.push({ theme, width, window: windowId, thread: threadId, screenshot, ...geometry });
      }
    }
    report.matrices.theme_width = cells;
    return { passing_cells: cells.length, screenshots: cells.length };
  });

  await runCheck("512 baseline configurations cover every default pairing and rail state", async () => {
    const cells = [];
    for (const theme of THEMES) {
      for (const width of WIDTHS) {
        for (let index = 0; index < WINDOWS.length; index += 1) {
          for (const railOpen of [true, false]) {
            const windowId = WINDOWS[index];
            const threadId = THREADS[index];
            await page.evaluate(`(()=>{const s=window.__SOL_STORE__;const ui=s.getState().ui;ui.selectedWindow=${JSON.stringify(windowId)};ui.selectedThreadConcept=${JSON.stringify(threadId)};ui.activeThreadId='thread-11';ui.theme=${JSON.stringify(theme)};ui.chatWidth=${width};ui.reducedMotion=true;ui.railOpen=${railOpen};ui.sidePanelOpen=true;ui.historyMode='pinned compact';ui.artifact.state='ready';ui.mount='docked';ui.popup=null;ui.search.selectedResult=null;s.dispatch({type:'set-status',value:'Baseline matrix probe',trigger:'test.baseline_matrix'});return true})()`);
            const evidence = await page.evaluate(`(()=>{const shell=document.querySelector('.pm-shell');const chat=document.querySelector('.chat-mount');const transcript=document.querySelector('[data-role="transcript"]');const rail=document.querySelector('.pm-activity-bar');const clipped=[...document.querySelectorAll('.message-copy p,.chat-identity strong,.history-title')].filter(node=>getComputedStyle(node).overflow==='hidden'&&node.scrollWidth>node.clientWidth+1).length;return {window:document.querySelector('.window-concept')?.dataset.windowConcept,thread:document.querySelector('.thread-concept')?.dataset.threadConcept,theme:document.documentElement.dataset.theme,width:chat?.offsetWidth??0,rail:shell?.dataset.rail,rail_width:rail?.offsetWidth??0,transcript:transcript?.clientHeight??0,clipped_prose:clipped,root_scroll_width:document.documentElement.scrollWidth,viewport:innerWidth}})()`);
            assert(evidence.window === windowId && evidence.thread === threadId, `${theme} ${width} ${windowId}/${threadId} mounted incorrectly`);
            assert(evidence.theme === theme && evidence.width === width, `${theme} ${width} ${windowId} geometry or theme mismatch`);
            assert(evidence.rail === (railOpen ? "open" : "closed") && Math.abs(evidence.rail_width - (railOpen ? 48 : 24)) <= 1, `${theme} ${width} ${windowId} rail geometry mismatch`);
            assert(evidence.transcript >= 250 && evidence.clipped_prose === 0, `${theme} ${width} ${windowId} lost readable prose`);
            assert(evidence.root_scroll_width <= evidence.viewport + 1, `${theme} ${width} ${windowId} leaked page-root overflow`);
            cells.push({ theme, width, window: windowId, thread: threadId, rail: railOpen ? "open" : "closed", status: "pass" });
          }
        }
        process.stdout.write(`MATRIX baseline ${theme} ${width}: ${cells.length}/512\n`);
      }
    }
    report.matrices.baseline_configurations = cells;
    return { passing_cells: cells.length, core_configurations: THEMES.length * WIDTHS.length, concepts: WINDOWS.length, rail_states: 2 };
  });

  await runCheck("896 feature-state configurations cover the required audit host", async () => {
    const cells = [];
    for (const theme of THEMES) {
      for (const width of WIDTHS) {
        for (const feature of FEATURE_STATES) {
          await page.evaluate(featureSetupExpression(feature, theme, width));
          const evidence = await page.evaluate(featureEvidenceExpression);
          assert(evidence.chat_width === width, `${theme} ${width} ${feature} measured ${evidence.chat_width}`);
          assertFeatureState(feature, evidence);
          cells.push({ theme, width, host_window: "window-05", host_thread: "thread-02", feature, status: "pass" });
        }
        process.stdout.write(`MATRIX features ${theme} ${width}: ${cells.length}/896\n`);
      }
    }
    report.matrices.core_feature_states = cells;
    return { passing_cells: cells.length, feature_states: FEATURE_STATES.length, core_configurations: THEMES.length * WIDTHS.length, host: "window-05 x thread-02", selection_role: "coverage fixture only; no ranking" };
  });

  await runCheck("continuous 520-1200 resize preserves a usable transcript", async () => {
    const samples = [];
    await page.evaluate("window.__SOL_STORE__.reset(); true");
    await page.dispatch({ type: "run-trigger", value: "question.cancel" });
    await page.dispatch({ type: "select-window", value: "window-05" });
    await page.dispatch({ type: "select-thread-concept", value: "thread-02" });
    await page.dispatch({ type: "history-set", value: "closed" });
    await page.dispatch({ type: "artifact-state", value: "closed" });
    await page.dispatch({ type: "set-mount", value: "docked" });
    for (let width = 520; width <= 1200; width += 13) {
      await page.dispatch({ type: "set-width", value: width });
      const geometry = await page.evaluate(`(()=>{const chat=document.querySelector('.chat-mount');const transcript=document.querySelector('[data-role="transcript"]');return {requested:window.__SOL_STORE__.getState().ui.chatWidth,chat:chat.offsetWidth,transcript:transcript.clientHeight}})()`);
      assert(Math.abs(geometry.requested - geometry.chat) <= 2, `resize ${width} measured ${geometry.chat}`);
      assert(geometry.transcript >= 250, `resize ${width} collapsed transcript`);
      samples.push(geometry);
    }
    await page.dispatch({ type: "set-width", value: 1200 });
    return { sample_count: samples.length, minimum: samples[0], maximum: samples.at(-1) };
  });

  await runCheck("history and artifact state cross-product remains recoverable", async () => {
    const historyModes = ["closed", "peek", "pinned compact", "pinned full"];
    const artifactStates = ["closed", "loading", "ready", "updated", "error"];
    const cells = [];
    for (const windowId of WINDOWS) {
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
            state = await page.evaluate(`(()=>({history:document.querySelectorAll('.history-region').length,artifact:document.querySelectorAll('.artifact-region').length,error:document.querySelectorAll('.artifact-error').length,loading:document.querySelectorAll('.artifact-loading').length,chat_height:document.querySelector('.chat-mount')?.getBoundingClientRect().height ?? 0}))()`);
          } catch (error) {
            throw new Error(`${windowId} ${history}/${artifact} browser probe failed: ${error.message}`);
          }
          assert(state.history === (history === "closed" ? 0 : 1), `${windowId} ${history} history mismatch`);
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
      { message: "edition-impose", question: "edition-question-turn", work: "edition-work-compose", questionSelector: ".edition-question", workSelector: ".edition-work" },
      { message: "score-cue", question: "score-question-count-in", work: "score-work-raise", questionSelector: ".score-question", workSelector: ".score-work" },
      { message: "timefield-descend", question: "timefield-question-mark", work: "timefield-work-band", questionSelector: ".time-question", workSelector: ".time-work" },
      { message: "branchbook-unfold", question: "branchbook-question-sprout", work: "branchbook-work-reveal", questionSelector: ".branch-question", workSelector: ".branch-work" },
      { message: "workshop-place", question: "workshop-question-pin", work: "workshop-work-place", questionSelector: ".workshop-question", workSelector: ".workshop-work" },
      { message: "braided-weave", question: "braided-question-knot", work: "braided-work-converge", questionSelector: ".braid-question", workSelector: ".braided-work" },
      { message: "relay-handoff", question: "relay-question-checkpoint", work: "relay-work-stage", questionSelector: ".relay-question", workSelector: ".relay-work" },
      { message: "quiet-current-settle", question: "quiet-question-focus", work: "quiet-work-register", questionSelector: ".quiet-question", workSelector: ".quiet-work" }
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
    const threadMotionNames = { message: [], question: [], work: [] };
    for (let index = 0; index < THREADS.length; index += 1) {
      const threadId = THREADS[index];
      const expected = expectedThreadMotion[index];
      await page.evaluate("window.__SOL_STORE__.reset(); true");
      await page.dispatch({ type: "select-thread-concept", value: threadId });
      await page.dispatch({ type: "toggle-reduced-motion", value: false });
      const fullMessage = await motionProbe("[data-message-id]");
      const fullQuestion = await motionProbe(expected.questionSelector);
      const fullWork = await motionProbe(expected.workSelector);
      await page.dispatch({ type: "toggle-reduced-motion", value: true });
      const reducedMessage = await motionProbe("[data-message-id]");
      const reducedQuestion = await motionProbe(expected.questionSelector);
      const reducedWork = await motionProbe(expected.workSelector);
      const probes = [
        { layer: "message", full: fullMessage, reduced: reducedMessage, expectedName: expected.message },
        { layer: "question", full: fullQuestion, reduced: reducedQuestion, expectedName: expected.question },
        { layer: "work", full: fullWork, reduced: reducedWork, expectedName: expected.work }
      ];
      for (const probe of probes) {
        assert(probe.full.seconds >= 0.2 && probe.full.name === probe.expectedName, `${threadId} ${probe.layer} used ${probe.full.name || "no motion"}; expected ${probe.expectedName}`);
        assert(probe.reduced.seconds <= 0.00002, `${threadId} ${probe.layer} reduced motion remained ${probe.reduced.duration}`);
        threadMotionNames[probe.layer].push(probe.full.name);
        rows.push({ family: `${threadId} ${probe.layer}`, full: probe.full.duration, reduced: probe.reduced.duration, animation: probe.full.name });
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

  await runCheck("popup focus, escape return, and 520px collision bounds", async () => {
    await page.setWindowRect(1280, 900);
    await page.dispatch({ type: "set-width", value: 520 });
    const popups = ["search", "route", "context", "access", "bsd", "draft-history", "thread-more"];
    const bounds = [];
    for (const popup of popups) {
      await page.dispatch({ type: "open-popup", value: popup });
      await delay(25);
      const rect = await page.evaluate(`(()=>{const node=document.querySelector('.popup-card');const r=node.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,viewportWidth:innerWidth,viewportHeight:innerHeight,active:document.activeElement?.dataset.focusKey ?? document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.tagName}})()`);
      assert(rect.left >= 0 && rect.top >= 0 && rect.right <= rect.viewportWidth && rect.bottom <= rect.viewportHeight, `${popup} collided with viewport: ${JSON.stringify(rect)}`);
      bounds.push({ popup, ...rect });
      await page.evaluate("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); true");
      await delay(25);
      assert(await page.evaluate("window.__SOL_STORE__.getState().ui.popup === null"), `${popup} did not close on Escape`);
    }
    await page.poll("document.activeElement?.dataset.focusKey === 'thread-more-trigger'", 1200);
    const returnFocus = await page.evaluate("document.activeElement?.dataset.focusKey ?? null");
    assert(returnFocus === "thread-more-trigger", `Escape returned focus to ${returnFocus}`);
    await page.setWindowRect(2400, 1200);
    return { popups: bounds, final_return_focus: returnFocus };
  });

  await runCheck("offline outbox reconnect replay is idempotent", async () => {
    await page.evaluate("window.__SOL_STORE__.reset(); true");
    await page.dispatch({ type: "run-trigger", value: "question.cancel" });
    await page.dispatch({ type: "run-trigger", value: "network.offline" });
    const exact = "Queue this exact message once while offline.";
    await page.input('[data-role="composer-input"]', exact);
    await page.click('[data-action="composer-primary"]');
    const queued = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {outbox:ui.outbox.length,operation:ui.outbox[0]?.operationId,state:ui.outbox[0]?.state,matches:window.__SOL_STORE__.getMessages().filter(message=>message.body===${JSON.stringify(exact)}).length}})()`);
    await page.dispatch({ type: "network-action", value: "reconnect" });
    await page.dispatch({ type: "network-action", value: "replay" });
    const first = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {replayed:ui.replayedOperationIds.length,state:ui.outbox[0]?.state,status:ui.statusLine,matches:window.__SOL_STORE__.getMessages().filter(message=>message.body===${JSON.stringify(exact)}).length}})()`);
    await page.dispatch({ type: "network-action", value: "replay" });
    const second = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {replayed:ui.replayedOperationIds.length,state:ui.outbox[0]?.state,status:ui.statusLine,matches:window.__SOL_STORE__.getMessages().filter(message=>message.body===${JSON.stringify(exact)}).length}})()`);
    assert(queued.outbox === 1 && queued.matches === 1 && queued.state === "queued", "offline send did not create one stable queue item");
    assert(first.replayed === 1 && first.state === "delivered" && first.matches === 1, "first replay did not deliver exactly once");
    assert(second.replayed === 1 && second.matches === 1 && second.status.startsWith("0 queued"), "second replay was not idempotent");
    return { queued, first_replay: first, second_replay: second };
  });

  await runCheck("deterministic controller triggers all have implemented outcomes", async () => {
    await page.evaluate("window.__SOL_STORE__.reset(); true");
    const triggers = await page.evaluate("window.__SOL_DATA__.scenario.deterministic_triggers");
    const outcomes = [];
    for (const trigger of triggers) {
      if (trigger === "scenario.reset") continue;
      await page.dispatch({ type: "run-trigger", value: trigger });
      const receipt = await page.evaluate("window.__SOL_STORE__.getState().ui.triggerReceipts[0]");
      assert(receipt?.trigger === trigger, `${trigger} did not produce its own receipt`);
      assert(!receipt.result.includes("truthfully unavailable"), `${trigger} is showcased but unavailable`);
      outcomes.push({ trigger, result: receipt.result });
    }
    await page.dispatch({ type: "run-trigger", value: "scenario.reset" });
    assert((await page.evaluate("window.__SOL_STORE__.getState().ui.triggerReceipts.length")) === 0, "scenario.reset did not reset receipts");
    report.matrices.deterministic_triggers = outcomes;
    return { implemented_triggers: outcomes.length, reset: "pass" };
  });

  await runCheck("selects, route, search, access, BSD, context, and attachment controls mutate visibly", async () => {
    await page.dispatch({ type: "run-trigger", value: "question.cancel" });
    await page.select('[data-role="window-select"]', "window-03");
    await page.select('[data-role="thread-concept-select"]', "thread-06");
    await page.select('[data-role="theme-select"]', "retro-light");
    await page.click('[data-action="attachment-menu"]');
    await page.dispatch({ type: "open-popup", value: "access" });
    await page.click('[data-action="set-access"][data-value="Full Access"]');
    await page.dispatch({ type: "open-popup", value: "bsd" });
    await page.click('[data-action="set-bsd"][data-value="On"]');
    await page.dispatch({ type: "open-popup", value: "context" });
    await page.click('[data-action="context-compact-now"]');
    await page.dispatch({ type: "open-popup", value: "search" });
    await page.click('[data-action="search-scope"][data-value="All Threads"]');
    await page.input('[data-role="search-input"]', "provider");
    const results = await page.evaluate("document.querySelectorAll('[data-action=\"search-result\"]').length");
    const ui = await page.evaluate(`(()=>{const ui=window.__SOL_STORE__.getState().ui;return {window:ui.selectedWindow,thread:ui.selectedThreadConcept,theme:ui.theme,attachment:ui.attachmentResolution.state,access:ui.access.requested,bsd:ui.bsd.mode,context:ui.context.compactReceipt,scope:ui.search.scope,query:ui.search.query}})()`);
    assert(ui.window === "window-03" && ui.thread === "thread-06" && ui.theme === "retro-light", "comparison selectors did not remain independent");
    assert(ui.attachment === "native" && ui.access === "Full Access" && ui.bsd === "On", "route/access/BSD controls failed");
    assert(Boolean(ui.context) && ui.scope === "All Threads" && ui.query === "provider" && results > 0, "context or one-bar search failed");
    return { ...ui, search_results: results };
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
      await delay(reducedMotion ? 30 : MOTION_SETTLE_MS);
      if (requiredSelector) {
        const visibility = await page.evaluate(`(()=>{const node=document.querySelector(${JSON.stringify(requiredSelector)});if(!node)return {present:false};const rect=node.getBoundingClientRect();const style=getComputedStyle(node);return {present:true,left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom,opacity:Number(style.opacity),visible:rect.right>0&&rect.bottom>0&&rect.left<innerWidth&&rect.top<innerHeight&&Number(style.opacity)>.95}})()`);
        assert(visibility.visible, `${requiredSelector} was not visibly settled for ${name}: ${JSON.stringify(visibility)}`);
      }
      await page.screenshot(join(SCREENSHOTS, name));
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
    report.console_errors = [...page.consoleErrors];
    report.runtime_exceptions = [...page.runtimeErrors];
    const filteredConsole = report.console_errors.filter((entry) => !entry.includes("favicon.ico"));
    assert(filteredConsole.length === 0, filteredConsole.join(" | "));
    assert(report.runtime_exceptions.length === 0, report.runtime_exceptions.join(" | "));
    return { console_errors: filteredConsole.length, runtime_exceptions: report.runtime_exceptions.length };
  });
} finally {
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
