// Fable — comparison workspace application. Builds the gallery console, the quiet
// Puppet Master shell (title bar, left Activity Bar, side panel, status bar), and
// mounts the selected window×thread pairing. Docked and pop-out are two views of
// the same semantic state. Width control drives the Chat surface only.

import { store } from "./store.js";
import { icon } from "./icons.js";
import { WINDOW_CONCEPTS, THREAD_CONCEPTS, mountPairing, ensureCss } from "./contracts.js";
import { THEMES, WIDTH_PRESETS, MODEL_LABEL, TRIGGER_LABELS } from "./strings.js";
import { fireTrigger, TRIGGERS, runShowcase, stopShowcase, SHOWCASE_STORY } from "./triggers.js";
import { createSyncBadge } from "./components.js";

ensureCss("shared/components.css");

const params = new URLSearchParams(location.search);
const preset = window.FW_PRESET || {};     // entry pages configure via this global

export const workspace = {
  windowId: validId(preset.window || params.get("window"), WINDOW_CONCEPTS, "window-01"),
  threadId: validId(preset.thread || params.get("thread"), THREAD_CONCEPTS, "thread-c01"),
  theme: params.get("theme") || document.documentElement.getAttribute("data-theme") || "friendly-dark",
  chatWidth: clampWidth(+params.get("width") || 750),
  reducedMotion: params.get("rm") === "1" || document.documentElement.getAttribute("data-reduced-motion") === "1",
  locked: preset.locked || (params.get("locked") === "1" ? "both" : null),  // "window" | "thread" | "both" | null
  mountHandle: null,
};

function validId(v, list, fallback) { return list.some((x) => x.id === v) ? v : fallback; }
function clampWidth(w) { return Math.max(520, Math.min(1200, w || 750)); }

// ---------------------------------------------------------------------------
export async function bootWorkspace(rootEl) {
  await store.init();

  applyTheme(workspace.theme, { fromHost: false });
  applyReducedMotion(workspace.reducedMotion, { fromHost: false });
  applyChatWidth(workspace.chatWidth);

  rootEl.classList.add("fw-root");
  const console_ = buildConsole();
  rootEl.appendChild(console_);

  const stage = document.createElement("div");
  stage.className = "fw-stage";
  rootEl.appendChild(stage);

  const shell = buildShell();
  stage.appendChild(shell.el);

  buildTriggerDrawer(rootEl);

  await remount();

  // Hub integration: honor pm-concept-state messages and host-set attributes.
  window.addEventListener("message", (event) => {
    const m = event.data;
    if (!m || m.source !== "pm-concept-hub" || m.type !== "pm-concept-state") return;
    const s = m.state || {};
    if (s.theme) applyTheme(s.theme, { fromHost: true });
    if (typeof s.reducedMotion === "boolean") applyReducedMotion(s.reducedMotion, { fromHost: true });
    if (typeof s.testWidth === "number") applyChatWidth(clampWidth(s.testWidth));
  });
  new MutationObserver(() => {
    const t = document.documentElement.getAttribute("data-theme");
    if (t && t !== workspace.theme) applyTheme(t, { fromHost: true });
    const rm = document.documentElement.getAttribute("data-reduced-motion") === "1";
    if (rm !== workspace.reducedMotion) applyReducedMotion(rm, { fromHost: true });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-reduced-motion", "data-motion"] });

  // Host probing hook for chat width.
  window.__gal = { setChatWidth(px) { applyChatWidth(clampWidth(px)); } };

  // Test-harness reflection: semantic state (not DOM heuristics) for probes.
  window.__fable = {
    store,
    workspace,
    fireTrigger,
    async setPairing(windowId, threadId) {
      if (windowId) workspace.windowId = windowId;
      if (threadId) workspace.threadId = threadId;
      document.querySelectorAll(".fw-console select").forEach((sel) => {
        const values = [...sel.options].map((o) => o.value);
        if (windowId && values.includes(windowId)) sel.value = windowId;
        if (threadId && values.includes(threadId)) sel.value = threadId;
      });
      await remount();
      return true;
    },
    applyTheme: (t) => applyTheme(t, { fromHost: false }),
    applyChatWidth,
    applyReducedMotion: (on) => applyReducedMotion(on, { fromHost: false }),
    setMount,
  };

  // ---------- console ----------
  function buildConsole() {
    const bar = document.createElement("div");
    bar.className = "fw-console";
    bar.setAttribute("aria-label", "Concept gallery controls");

    bar.appendChild(group("Window", conceptSelect(WINDOW_CONCEPTS, () => workspace.windowId, async (v) => { workspace.windowId = v; await remount(); }, workspace.locked === "window" || workspace.locked === "both")));
    bar.appendChild(group("Thread", conceptSelect(THREAD_CONCEPTS, () => workspace.threadId, async (v) => { workspace.threadId = v; await remount(); }, workspace.locked === "thread" || workspace.locked === "both")));
    bar.appendChild(group("Theme", themeSelect()));
    bar.appendChild(group("Chat width", widthControl()));

    const rm = document.createElement("button");
    rm.className = "fw-toggle";
    rm.setAttribute("aria-pressed", String(workspace.reducedMotion));
    rm.innerHTML = `${icon("wave", 12)}<span>Reduced motion</span>`;
    rm.addEventListener("click", () => {
      applyReducedMotion(!workspace.reducedMotion, { fromHost: false });
      rm.setAttribute("aria-pressed", String(workspace.reducedMotion));
    });
    bar.appendChild(rm);

    const popout = document.createElement("button");
    popout.className = "fw-toggle";
    popout.id = "fwPopoutToggle";
    popout.setAttribute("aria-pressed", String(store.state.mount === "popout"));
    popout.innerHTML = `${icon("popout", 12)}<span>Pop out</span>`;
    popout.addEventListener("click", () => setMount(store.state.mount === "popout" ? "docked" : "popout"));
    bar.appendChild(popout);

    const triggers = document.createElement("button");
    triggers.className = "fw-toggle";
    triggers.innerHTML = `${icon("spark", 12)}<span>Demo triggers</span>`;
    triggers.addEventListener("click", () => {
      const d = document.querySelector(".fw-trigger-drawer");
      d.dataset.open = d.dataset.open === "true" ? "false" : "true";
    });
    bar.appendChild(triggers);

    const spacer = document.createElement("div");
    spacer.className = "fw-spacer";
    bar.appendChild(spacer);

    const badge = document.createElement("div");
    badge.className = "fw-model-badge";
    badge.setAttribute("data-concept-model", MODEL_LABEL);
    badge.textContent = MODEL_LABEL;
    bar.appendChild(badge);

    return bar;

    function group(label, control) {
      const g = document.createElement("div");
      g.className = "fw-console-group";
      const l = document.createElement("span");
      l.className = "fw-console-label";
      l.textContent = label;
      g.append(l, control);
      return g;
    }
  }

  function conceptSelect(list, get, set, locked) {
    const sel = document.createElement("select");
    for (const c of list) {
      const o = document.createElement("option");
      o.value = c.id;
      o.textContent = c.title;
      sel.appendChild(o);
    }
    sel.value = get();
    if (locked) {
      sel.disabled = true;
      sel.title = "This page showcases this concept — open the comparison workspace to change it.";
    }
    sel.addEventListener("change", () => set(sel.value));
    return sel;
  }

  function themeSelect() {
    const sel = document.createElement("select");
    for (const t of THEMES) {
      const o = document.createElement("option");
      o.value = t.id;
      o.textContent = t.label;
      sel.appendChild(o);
    }
    sel.value = workspace.theme;
    sel.addEventListener("change", () => applyTheme(sel.value, { fromHost: false }));
    workspace._themeSelect = sel;
    return sel;
  }

  function widthControl() {
    const wrap = document.createElement("div");
    wrap.className = "fw-width-slider";
    const range = document.createElement("input");
    range.type = "range";
    range.min = "520"; range.max = "1200"; range.step = "1";
    range.value = String(workspace.chatWidth);
    range.setAttribute("aria-label", "Chat width in pixels");
    const value = document.createElement("span");
    value.className = "fw-width-value";
    value.textContent = `${workspace.chatWidth}px`;
    range.addEventListener("input", () => applyChatWidth(+range.value));
    wrap.append(range, value);
    for (const p of WIDTH_PRESETS) {
      const b = document.createElement("button");
      b.className = "fw-preset";
      b.textContent = String(p.px);
      b.title = p.label;
      if (p.px === workspace.chatWidth) b.dataset.active = "true";
      b.addEventListener("click", () => applyChatWidth(p.px));
      wrap.appendChild(b);
    }
    workspace._widthControl = { range, value, wrap };
    return wrap;
  }

  // ---------- quiet PM shell ----------
  function buildShell() {
    const el = document.createElement("div");
    el.className = "pm-shell";
    el.innerHTML = `
      <header class="pm-titlebar">
        <span class="pm-brand">${icon("provider", 16)}<span>Puppet Master</span></span>
        <nav class="pm-nav" aria-label="Application navigation">
          <span data-active>Home</span><span>Projects</span><span>Planning Wizard</span><span>Orchestrator</span><span>Usage</span><span>Settings</span>
        </nav>
        <button class="fw-titlebar-bell" aria-label="Notifications — canonical title-bar stack" title="App-wide notifications live here, never inside Chat">${icon("bell", 14)}<span class="fw-bell-count">2</span></button>
        <span class="pm-model-flag" data-concept-model="${MODEL_LABEL}">${MODEL_LABEL}</span>
      </header>
      <div class="pm-shell-main">
        <nav class="pm-activitybar" aria-label="Activity Bar">
          <button aria-label="Files" title="Files">${icon("folder", 16)}</button>
          <button aria-label="Search" title="Search">${icon("search", 16)}</button>
          <button aria-label="Source control" title="Source control">${icon("branch", 16)}</button>
          <button aria-label="Chat" title="Chat" aria-pressed="true">${icon("thread", 16)}</button>
          <button aria-label="Toggle side panel" title="Toggle side panel" id="fwPanelToggle" aria-pressed="true">${icon("drawer", 16)}</button>
        </nav>
        <aside class="pm-sidepanel" id="fwSidePanel" aria-label="Side panel">
          <h2>Files</h2>
          <div class="pm-ghostline" style="width:82%"></div>
          <div class="pm-ghostline" style="width:64%"></div>
          <div class="pm-ghostline" style="width:74%"></div>
          <div class="pm-ghostline" style="width:52%"></div>
          <div class="pm-ghostline" style="width:68%"></div>
          <h2 style="margin-top:10px">Open editors</h2>
          <div class="pm-ghostline" style="width:70%"></div>
          <div class="pm-ghostline" style="width:58%"></div>
        </aside>
        <main class="pm-workarea" id="fwWorkarea"></main>
      </div>
      <footer class="pm-statusbar">
        <span id="fwSyncSlot"></span>
        <span>Index up to date</span>
        <span>main</span>
      </footer>`;

    el.querySelector("#fwPanelToggle").addEventListener("click", (e) => {
      const p = el.querySelector("#fwSidePanel");
      p.hidden = !p.hidden;
      e.currentTarget.setAttribute("aria-pressed", String(!p.hidden));
    });
    el.querySelector(".fw-titlebar-bell").addEventListener("click", () => {
      // Canonical notification boundary: the stack lives here, not in Chat.
    });

    createSyncBadge(el.querySelector("#fwSyncSlot"));
    return { el };
  }

  // ---------- mounting ----------
  async function remount() {
    const workarea = document.getElementById("fwWorkarea");
    if (workspace.mountHandle) { workspace.mountHandle.destroy(); workspace.mountHandle = null; }
    document.querySelectorAll(".fw-popout-scrim, .fw-popout-frame").forEach((n) => n.remove());

    const mount = store.state.mount;
    const popoutBtn = document.getElementById("fwPopoutToggle");
    if (popoutBtn) popoutBtn.setAttribute("aria-pressed", String(mount === "popout"));

    if (mount === "docked") {
      workspace.mountHandle = await mountPairing(workarea, workspace.windowId, workspace.threadId, {
        store, mount, onMountChange: setMount,
      });
    } else {
      workarea.innerHTML = `<div class="fw-dock-ghost"><span>Chat is popped out · <button type="button" id="fwPopIn">Dock it back</button></span></div>`;
      workarea.querySelector("#fwPopIn").addEventListener("click", () => setMount("docked"));
      const scrim = document.createElement("div");
      scrim.className = "fw-popout-scrim";
      const frame = document.createElement("div");
      frame.className = "fw-popout-frame";
      frame.innerHTML = `
        <div class="fw-popout-titlebar">
          ${icon("thread", 14)}
          <span class="fw-popout-title" id="fwPopoutTitle"></span>
          <button class="pm-btn" data-variant="quiet" id="fwDockBack" aria-label="Dock back">${icon("dockin", 14)}</button>
        </div>
        <div class="fw-popout-host" id="fwPopoutHost"></div>`;
      const stageEl = document.querySelector(".fw-stage");
      stageEl.append(scrim, frame);
      frame.querySelector("#fwPopoutTitle").textContent = store.thread ? store.thread.title : "Chat";
      frame.querySelector("#fwDockBack").addEventListener("click", () => setMount("docked"));
      workspace.mountHandle = await mountPairing(frame.querySelector("#fwPopoutHost"), workspace.windowId, workspace.threadId, {
        store, mount, onMountChange: setMount,
      });
    }
  }

  async function setMount(mount) {
    store.setMount(mount);
    await remount();
  }

  store.on("thread", () => {
    const t = document.getElementById("fwPopoutTitle");
    if (t && store.thread) t.textContent = store.thread.title;
  });

  // ---------- trigger drawer ----------
  function buildTriggerDrawer(root) {
    const drawer = document.createElement("aside");
    drawer.className = "fw-trigger-drawer";
    drawer.dataset.open = "false";
    drawer.setAttribute("aria-label", "Deterministic demo triggers");
    const head = document.createElement("div");
    head.className = "fw-trigger-head";
    head.innerHTML = `${icon("spark", 14)}<span>Demo triggers</span>`;
    const close = document.createElement("button");
    close.setAttribute("aria-label", "Close triggers");
    close.innerHTML = icon("close", 14);
    close.addEventListener("click", () => { drawer.dataset.open = "false"; });
    head.appendChild(close);
    drawer.appendChild(head);

    // The 25-beat showcase story (packet 05) — one button plays the whole
    // narrative in order on the primary showcase thread.
    const showcase = document.createElement("button");
    showcase.className = "fw-showcase-btn";
    let showcaseRunning = false;
    const showcaseIdle = `${icon("play", 13)}<span>Play the 25-beat showcase story</span>`;
    showcase.innerHTML = showcaseIdle;
    showcase.addEventListener("click", () => {
      if (showcaseRunning) {
        stopShowcase();
        showcaseRunning = false;
        showcase.innerHTML = showcaseIdle;
        return;
      }
      showcaseRunning = true;
      runShowcase((step) => {
        if (!step) {
          showcaseRunning = false;
          showcase.innerHTML = `${icon("check", 13)}<span>Showcase complete — play again</span>`;
          return;
        }
        showcase.innerHTML = `${icon("stop", 13)}<span>${step.index + 1} of ${step.total} — ${escapeShowcase(step.label)}</span>`;
      });
    });
    drawer.appendChild(showcase);

    const list = document.createElement("div");
    list.className = "fw-trigger-list pm-scroll";
    let lastFamily = "";
    for (const id of Object.keys(TRIGGERS)) {
      const family = id.split(".")[0];
      if (family !== lastFamily) {
        lastFamily = family;
        const f = document.createElement("div");
        f.className = "fw-trigger-family";
        f.textContent = familyLabel(family);
        list.appendChild(f);
      }
      const b = document.createElement("button");
      b.className = "fw-trigger-btn";
      b.dataset.trigger = id;                       // raw id lives in data attribute only
      b.textContent = TRIGGER_LABELS[id] || id;
      b.addEventListener("click", () => fireTrigger(id));
      list.appendChild(b);
    }
    drawer.appendChild(list);
    root.appendChild(drawer);
  }

  function escapeShowcase(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function familyLabel(f) {
    const map = {
      history: "Pinned history", artifact: "Artifacts", question: "Questionnaires",
      goal: "Goal", todo: "Todos", subagent: "Subagents", crew: "Crew", activity: "Activity",
      diff: "Diffs", approval: "Approvals", route: "Route", attachment: "Attachments",
      context: "Context", thread: "Threads", turn: "Turn", cross_project: "Cross-project",
      resource: "Resources", bsd: "Back Seat Driver", provider: "Providers",
      network: "Network", notification: "Notifications", scenario: "Scenario",
    };
    return map[f] || f;
  }
}

// ---------- applied state ----------
export function applyTheme(theme, { fromHost }) {
  store.emit && store.emit("env-will-change");
  workspace.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = /-dark$/.test(theme) ? "dark" : "light";
  if (workspace._themeSelect && workspace._themeSelect.value !== theme) workspace._themeSelect.value = theme;
  store.emit && store.emit("env-change");
}

export function applyReducedMotion(on, { fromHost }) {
  workspace.reducedMotion = on;
  document.documentElement.setAttribute("data-reduced-motion", on ? "1" : "0");
  document.documentElement.setAttribute("data-motion", on ? "reduced" : "full");
}

export function applyChatWidth(px) {
  store.emit && store.emit("env-will-change");
  workspace.chatWidth = px;
  document.documentElement.style.setProperty("--fw-chat-width", px + "px");
  document.documentElement.style.setProperty("--hub-chat-width", px + "px");
  store.emit && store.emit("env-change");
  if (workspace._widthControl) {
    const { range, value, wrap } = workspace._widthControl;
    if (+range.value !== px) range.value = String(px);
    value.textContent = `${px}px`;
    wrap.querySelectorAll(".fw-preset").forEach((b) => {
      b.dataset.active = String(+b.textContent === px);
    });
  }
  store.emit("chat-width", px);
}
