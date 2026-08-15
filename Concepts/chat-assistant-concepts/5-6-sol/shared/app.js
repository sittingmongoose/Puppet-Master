import { MODEL_LABEL, THEMES, THREAD_CONCEPTS, WIDTHS, WINDOW_CONCEPTS, escapeHtml } from "./definitions.js";
import { icon } from "./icons.js";
import { button, iconOnlyButton, renderDemoController, renderPopupLayer } from "./primitives.js";
import { loadPrototypeData, createPrototypeStore } from "./state.js";
import { threadMessages } from "./selectors.js";
import { renderThreadConcept } from "../threads/threads.js";
import { renderWindowConcept } from "../windows/windows.js";

const app = document.getElementById("sol-app");
const body = document.body;
const entryKind = body.dataset.entryKind ?? "workspace";
const defaultWindow = body.dataset.defaultWindow ?? "window-01";
const defaultThread = body.dataset.defaultThread ?? "thread-01";

function comparisonControls(ui) {
  const windowConcept = WINDOW_CONCEPTS.find((item) => item.id === ui.selectedWindow) ?? WINDOW_CONCEPTS[0];
  const threadConcept = THREAD_CONCEPTS.find((item) => item.id === ui.selectedThreadConcept) ?? THREAD_CONCEPTS[0];
  return `<header class="comparison-header comparison-controls" ${ui.popup ? "inert aria-hidden=\"true\"" : ""}>
    <div class="comparison-title">
      <span>Assistant Chat creative bakeoff</span>
      <strong>${escapeHtml(windowConcept.title)} × ${escapeHtml(threadConcept.title)}</strong>
      <p>${escapeHtml(windowConcept.thesis)} ${escapeHtml(threadConcept.thesis)}</p>
    </div>
    <div class="model-seal"><span>MODEL</span><strong data-concept-model="5.6 Sol">${MODEL_LABEL}</strong></div>
    <div class="comparison-primary-controls">
      <label><span>Chat window</span><select data-role="window-select" aria-label="Chat window concept">${WINDOW_CONCEPTS.map((concept) => `<option value="${concept.id}" ${concept.id === ui.selectedWindow ? "selected" : ""}>${concept.short} · ${escapeHtml(concept.title)}</option>`).join("")}</select></label>
      <label><span>Chat thread</span><select data-role="thread-concept-select" aria-label="Chat thread concept">${THREAD_CONCEPTS.map((concept) => `<option value="${concept.id}" ${concept.id === ui.selectedThreadConcept ? "selected" : ""}>${concept.short} · ${escapeHtml(concept.title)}</option>`).join("")}</select></label>
      <label><span>Theme</span><select data-role="theme-select" aria-label="Puppet Master theme">${THEMES.map((theme) => `<option value="${theme.id}" ${theme.id === ui.theme ? "selected" : ""}>${escapeHtml(theme.label)}</option>`).join("")}</select></label>
    </div>
    <div class="comparison-secondary-controls">
      <div class="width-control"><label for="chat-width-range">Chat width <output>${ui.chatWidth} px</output></label><input id="chat-width-range" data-role="width-range" type="range" min="520" max="1200" step="5" value="${ui.chatWidth}"><div class="width-presets">${WIDTHS.map((width) => `<button type="button" data-action="set-width" data-value="${width}" aria-pressed="${ui.chatWidth === width ? "true" : "false"}">${width}</button>`).join("")}</div></div>
      <div class="control-cluster" aria-label="Mount and accessibility">
        ${button({ label: ui.railOpen ? "Close app rail" : "Open app rail", action: "toggle-rail", iconName: "history", pressed: ui.railOpen, className: "comparison-button" })}
        ${button({ label: ui.mount === "docked" ? "Pop out" : "Dock", action: "set-mount", value: ui.mount === "docked" ? "popout" : "docked", iconName: ui.mount === "docked" ? "popout" : "dock", className: "comparison-button" })}
        ${button({ label: "Reduced motion", action: "toggle-reduced-motion", iconName: "eye", pressed: ui.reducedMotion, className: "comparison-button" })}
        ${button({ label: "Demo states", action: "toggle-controller", iconName: "play", pressed: ui.demoControllerOpen, className: "comparison-button", focusKey: "controller-trigger" })}
      </div>
    </div>
  </header>`;
}

function fakeActivityBar(ui) {
  if (!ui.railOpen) return `<nav class="pm-activity-bar is-collapsed" aria-label="Puppet Master activity bar, collapsed">
    <button type="button" data-action="toggle-rail" aria-pressed="false" aria-label="Open app rail">${icon("history")}</button>
  </nav>`;
  return `<nav class="pm-activity-bar" aria-label="Puppet Master activity bar">
    <button type="button" data-action="toggle-rail" aria-pressed="true" aria-label="Close app rail">${icon("close")}</button>
    <button type="button" disabled title="Project surface context only" aria-label="Projects">${icon("artifact")}</button>
    <button type="button" class="is-active" data-action="set-status" data-value="Assistant Chat is already open" aria-label="Assistant Chat">${icon("chat")}</button>
    <button type="button" data-action="toggle-side-panel" aria-pressed="${ui.sidePanelOpen ? "true" : "false"}" aria-label="Toggle adjacent side panel">${icon("history")}</button>
    <span class="activity-spacer"></span>
    <button type="button" data-action="toggle-controller" aria-pressed="${ui.demoControllerOpen ? "true" : "false"}" aria-label="Open prototype demo states">${icon("play")}</button>
  </nav>`;
}

function fakeSidePanel(ui) {
  if (!ui.sidePanelOpen) return "";
  return `<aside class="pm-side-panel" aria-label="Quiet surrounding project panel">
    <header><span>PROJECT</span><strong>Puppet Master</strong></header>
    <nav>
      <button type="button" class="is-current" data-action="set-status" data-value="Current editor context retained"><span>Current editor</span><strong>Assistant Chat contract</strong></button>
      <button type="button" disabled title="Surrounding shell context only"><span>Source Control</span><strong>Clean view</strong></button>
      <button type="button" disabled title="Surrounding shell context only"><span>Run and Debug</span><strong>1 paused session</strong></button>
    </nav>
    <div class="panel-context"><span>EXECUTION HOST</span><strong>Studio Workstation</strong><p>Native environment · live</p></div>
  </aside>`;
}

function renderNotificationInbox(ui) {
  if (ui.notification.state !== "open") return "";
  const items = ui.notification.items ?? [];
  return `<section id="titlebar-notification-inbox" class="titlebar-notification-inbox" role="region" aria-label="Title-bar notification inbox">
    <header><div><span>Canonical app-wide boundary</span><strong>Notifications</strong></div><button type="button" data-action="notification-close" aria-label="Close title-bar notification inbox">${icon("close")}</button></header>
    <p class="notification-boundary-note">Chat renders the task outcome inline; this title-bar projection retains the app-wide copy.</p>
    <div class="notification-items">${items.map((item) => `<article data-notification-id="${escapeHtml(item.id)}"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.detail)}</p><time>${escapeHtml(item.at)}</time></article>`).join("") || "<p>No app-wide outcomes are waiting.</p>"}</div>
  </section>`;
}

function fakeTopbar(ui) {
  const unread = Number(ui.notification.unread ?? 0);
  const inboxOpen = ui.notification.state === "open";
  return `<header class="pm-titlebar">
    <div class="pm-brand-mark">${icon("goal")}<span>PUPPET MASTER</span></div>
    <nav class="pm-page-tabs" aria-label="Open Puppet Master pages"><button type="button" disabled title="Surrounding shell context only">Editor</button><button type="button" class="is-current" data-action="set-status" data-value="Assistant Chat concept workspace is active">Assistant Chat</button></nav>
    <div class="titlebar-actions"><span class="server-health">${escapeHtml(ui.network.transport)}</span><button type="button" data-action="notification-toggle" aria-label="${inboxOpen ? "Close" : "Open"} title-bar notification inbox" aria-controls="titlebar-notification-inbox" aria-expanded="${inboxOpen ? "true" : "false"}">${icon("bell")}${unread > 0 ? `<span class="notification-count">${unread}</span>` : ""}</button><span class="titlebar-model" data-concept-model="5.6 Sol">${MODEL_LABEL}</span></div>
    ${renderNotificationInbox(ui)}
  </header>`;
}

function shellStatus(ui) {
  return `<footer class="pm-statusbar"><span>${escapeHtml(ui.statusLine)}</span><span>${escapeHtml(ui.route.connection)}</span><span>${escapeHtml(ui.network.serverWork)}</span><span>${escapeHtml(ui.mount)}</span><span>${ui.chatWidth} px</span></footer>`;
}

function shellStage(data, ui) {
  const thread = renderThreadConcept(data, ui);
  const window = renderWindowConcept(data, ui, thread);
  return `<main class="pm-stage" data-mount="${escapeHtml(ui.mount)}">
    <div class="editor-backdrop" aria-hidden="true"><div class="editor-tab">assistant-chat-design.md</div><div class="editor-lines"><i></i><i></i><i></i><i></i><i></i></div></div>
    <div class="concept-frame" style="--chat-width:${ui.chatWidth}px">${window}</div>
  </main>`;
}

function renderShell(data, ui) {
  return `<section class="pm-shell" data-window="${escapeHtml(ui.selectedWindow)}" data-thread="${escapeHtml(ui.selectedThreadConcept)}" data-history="${escapeHtml(ui.historyMode)}" data-artifact="${escapeHtml(ui.artifact.state)}" data-mount="${escapeHtml(ui.mount)}" data-rail="${ui.railOpen ? "open" : "closed"}" data-side="${ui.sidePanelOpen ? "open" : "closed"}">
    ${fakeTopbar(ui)}
    ${fakeActivityBar(ui)}
    ${fakeSidePanel(ui)}
    ${shellStage(data, ui)}
    ${shellStatus(ui)}
  </section>`;
}

function snapshotDom(action) {
  const scroll = {};
  document.querySelectorAll("[data-scroll-key]").forEach((element) => { scroll[element.dataset.scrollKey] = { top: element.scrollTop, left: element.scrollLeft }; });
  const active = document.activeElement;
  const focusKey = active?.dataset?.focusKey ?? null;
  const selection = active && "selectionStart" in active ? { start: active.selectionStart, end: active.selectionEnd } : null;
  let anchor = null;
  if (action?.type === "toggle-long-message") {
    const element = document.getElementById(`message-${CSS.escape(action.value)}`);
    const scroller = element?.closest("[data-role='transcript']");
    if (element && scroller) anchor = { id: action.value, top: element.getBoundingClientRect().top, scrollKey: scroller.dataset.scrollKey };
  }
  return { scroll, focusKey, selection, anchor };
}

function restoreAnchor(anchor) {
  if (!anchor) return;
  const element = document.getElementById(`message-${CSS.escape(anchor.id)}`);
  const scroller = document.querySelector(`[data-scroll-key="${CSS.escape(anchor.scrollKey)}"]`);
  if (!element || !scroller) return;
  const delta = element.getBoundingClientRect().top - anchor.top;
  if (Math.abs(delta) > 0.5) scroller.scrollTop += delta;
}

function restoreDom(snapshot, ui) {
  Object.entries(snapshot.scroll).forEach(([key, position]) => {
    const element = document.querySelector(`[data-scroll-key="${CSS.escape(key)}"]`);
    if (element) { element.scrollTop = position.top; element.scrollLeft = position.left; }
  });
  restoreAnchor(snapshot.anchor);
  const targetKey = ui.focusRequest ?? snapshot.focusKey;
  if (targetKey) {
    const target = document.querySelector(`[data-focus-key="${CSS.escape(targetKey)}"]`);
    if (target) {
      target.focus({ preventScroll: true });
      if (snapshot.selection && "setSelectionRange" in target) target.setSelectionRange(snapshot.selection.start, snapshot.selection.end);
    }
  }
}

function applyDocumentState(ui) {
  document.documentElement.dataset.theme = ui.theme;
  document.documentElement.dataset.reducedMotion = ui.reducedMotion ? "1" : "0";
  document.documentElement.style.colorScheme = ui.theme.endsWith("dark") ? "dark" : "light";
}

function render(data, ui, action = null) {
  const snapshot = snapshotDom(action);
  applyDocumentState(ui);
  app.innerHTML = `<div class="comparison-workspace" data-entry-kind="${escapeHtml(entryKind)}">${comparisonControls(ui)}<div class="shell-wrap" ${ui.popup ? "inert aria-hidden=\"true\"" : ""}>${renderShell(data, ui)}</div>${renderPopupLayer(data, ui)}${renderDemoController(data, ui)}</div>`;
  // Focus restoration must not depend on animation-frame scheduling. Headless and
  // backgrounded browser tabs may defer a frame even though the new target exists.
  restoreDom(snapshot, ui);
  requestAnimationFrame(() => {
    restoreDom(snapshot, ui);
    if (snapshot.anchor) {
      requestAnimationFrame(() => restoreAnchor(snapshot.anchor));
      window.setTimeout(() => restoreAnchor(snapshot.anchor), 120);
    }
  });
}

function renderWidthOnly(ui) {
  const shell = app.querySelector(".pm-shell");
  const frame = app.querySelector(".concept-frame");
  if (!shell || !frame || shell.dataset.history !== ui.historyMode) return false;
  frame.style.setProperty("--chat-width", `${ui.chatWidth}px`);
  const range = app.querySelector('[data-role="width-range"]');
  if (range) range.value = String(ui.chatWidth);
  const output = app.querySelector(".width-control output");
  if (output) output.textContent = `${ui.chatWidth} px`;
  app.querySelectorAll('.width-presets [data-action="set-width"]').forEach((control) => control.setAttribute("aria-pressed", String(Number(control.dataset.value) === Number(ui.chatWidth))));
  const statusWidth = app.querySelector(".pm-statusbar span:last-child");
  if (statusWidth) statusWidth.textContent = `${ui.chatWidth} px`;
  return true;
}

function closestAction(event) {
  return event.target.closest("[data-action]");
}

function getMessage(data, ui, messageId) {
  return threadMessages(data, ui).find((message) => message.id === messageId);
}

function installEvents(store, data) {
  app.addEventListener("click", async (event) => {
    const target = closestAction(event);
    if (!target || target.disabled) return;
    const action = target.dataset.action;
    const value = target.dataset.value;
    if (action === "popup-backdrop" && event.target === target) store.dispatch({ type: "close-popup" });
    else if (action === "set-width") store.dispatch({ type: "set-width", value });
    else if (action === "set-mount") store.dispatch({ type: "set-mount", value });
    else if (action === "toggle-reduced-motion") store.dispatch({ type: "toggle-reduced-motion" });
    else if (action === "toggle-controller") store.dispatch({ type: "toggle-controller" });
    else if (action === "toggle-rail") store.dispatch({ type: "toggle-rail" });
    else if (action === "toggle-side-panel") store.dispatch({ type: "toggle-side-panel" });
    else if (action === "set-status") store.dispatch({ type: "set-status", value, trigger: "shell.context" });
    else if (action === "history-set") store.dispatch({ type: "history-set", value });
    else if (action === "artifact-state") store.dispatch({ type: "artifact-state", value });
    else if (action === "artifact-close") store.dispatch({ type: "artifact-state", value: "closed", message: "Artifact workspace closed; selection retained" });
    else if (action === "artifact-select") { store.dispatch({ type: "artifact-select", value }); window.setTimeout(() => store.dispatch({ type: "artifact-ready" }), store.getState().ui.reducedMotion ? 30 : 320); }
    else if (action === "artifact-retry") { store.dispatch({ type: "artifact-state", value: "loading", message: "Retrying artifact load" }); window.setTimeout(() => store.dispatch({ type: "artifact-ready" }), store.getState().ui.reducedMotion ? 30 : 420); }
    else if (action === "select-thread") store.dispatch({ type: "select-thread", value });
    else if (action === "toggle-long-message") store.dispatch({ type: "toggle-long-message", value });
    else if (action === "toggle-work-group") store.dispatch({ type: "toggle-work-group", value });
    else if (action === "thought-setting") store.dispatch({ type: "thought-setting", value: target.getAttribute("aria-pressed") !== "true" });
    else if (action === "open-popup") store.dispatch({ type: "open-popup", value });
    else if (action === "close-popup") store.dispatch({ type: "close-popup", returnFocus: target.dataset.returnFocus });
    else if (action === "copy-message") {
      const message = getMessage(data, store.getState().ui, value);
      try { await navigator.clipboard.writeText(message?.body ?? ""); store.dispatch({ type: "set-status", value: "Full canonical message copied", trigger: "chat.copy" }); }
      catch (_error) { store.dispatch({ type: "set-status", value: "Clipboard permission was unavailable; no content changed", trigger: "chat.copy" }); }
    }
    else if (action === "edit-message") store.dispatch({ type: "edit-from-message", value });
    else if (action === "message-more-info") store.dispatch({ type: "toggle-work-group", value: `meta-${value}` });
    else if (action === "context-toggle-message") store.dispatch({ type: "context-toggle-message", value });
    else if (action === "composer-primary") store.sendDraft();
    else if (action === "attachment-menu") {
      const current = store.getState().ui.attachmentResolution.state;
      const cycle = ["none", "native", "transformed", "alternate", "unsupported"];
      const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
      const mapping = {
        none: { value: "none", label: "No route pending", detail: "Attachment demo reset." },
        native: { value: "native", label: "Native", detail: "The selected route accepts this file directly." },
        transformed: { value: "transformed", label: "PM transformed", detail: "A bounded derived artifact retains source lineage." },
        alternate: { value: "alternate", label: "Alternate model", detail: "Consent is required because provider and privacy boundary change." },
        unsupported: { value: "unsupported", label: "Unsupported", detail: "No truthful route is available." }
      };
      store.dispatch({ type: "attachment-resolve", ...mapping[next] });
    }
    else if (action === "save-draft-revision") store.dispatch({ type: "save-draft-revision" });
    else if (action === "restore-draft") store.dispatch({ type: "restore-draft", value });
    else if (action === "clear-draft") store.dispatch({ type: "clear-draft" });
    else if (action === "search-scope") store.dispatch({ type: "search-scope", value });
    else if (action === "search-result") store.dispatch({ type: "search-select", threadId: target.dataset.threadId, messageId: target.dataset.messageId });
    else if (action === "route-provider") store.dispatch({ type: "route-provider", value });
    else if (action === "route-account") store.dispatch({ type: "route-account", provider: target.dataset.provider, accountId: target.dataset.accountId });
    else if (action === "route-model") store.dispatch({ type: "route-model", provider: target.dataset.provider, accountId: target.dataset.accountId, modelId: target.dataset.modelId });
    else if (action === "route-effort") store.dispatch({ type: "route-effort", value });
    else if (action === "route-speed") store.dispatch({ type: "route-speed", value });
    else if (action === "route-favorite") store.dispatch({ type: "route-favorite" });
    else if (action === "set-mode") store.dispatch({ type: "set-mode", value });
    else if (action === "set-access") store.dispatch({ type: "set-access", value });
    else if (action === "set-bsd") store.dispatch({ type: "set-bsd", value });
    else if (action === "context-mode") store.dispatch({ type: "context-mode", value });
    else if (action === "context-apply-subcompact") store.dispatch({ type: "context-apply-subcompact" });
    else if (action === "context-compact-now") store.dispatch({ type: "context-compact-now" });
    else if (action === "context-more-details") store.dispatch({ type: "set-status", value: "Context details show admitted sources and receipts; raw system prompts remain unavailable", trigger: "context.details" });
    else if (action === "question-phase") store.dispatch({ type: "question-phase", value });
    else if (action === "question-answer") store.dispatch({ type: "question-answer", value });
    else if (action === "question-toggle-answer") store.dispatch({ type: "question-toggle-answer", value });
    else if (action === "question-next") store.dispatch({ type: "question-next" });
    else if (action === "question-back") store.dispatch({ type: "question-back" });
    else if (action === "question-skip") store.dispatch({ type: "question-skip" });
    else if (action === "question-cancel") store.dispatch({ type: "question-cancel" });
    else if (action === "question-submit") store.dispatch({ type: "question-submit" });
    else if (action === "question-submitted") store.dispatch({ type: "question-submitted" });
    else if (action === "question-next-queue") store.dispatch({ type: "question-next-queue" });
    else if (action === "goal-action") store.dispatch({ type: "goal-action", value });
    else if (action === "goal-save-edit") store.dispatch({ type: "goal-save-edit" });
    else if (action === "todo-add") store.dispatch({ type: "todo-add" });
    else if (action === "todo-cycle") store.dispatch({ type: "todo-cycle", value });
    else if (action === "subagent-spawn") store.dispatch({ type: "subagent-spawn" });
    else if (action === "subagent-cycle") store.dispatch({ type: "subagent-cycle", value });
    else if (action === "crew-advance") store.dispatch({ type: "crew-advance" });
    else if (action === "activity-advance") store.dispatch({ type: "activity-advance" });
    else if (action === "diff-update") store.dispatch({ type: "diff-update" });
    else if (action === "diff-open") store.dispatch({ type: "diff-open" });
    else if (action === "approval-decision") store.dispatch({ type: "approval-decision", value });
    else if (action === "approval-details") store.dispatch({ type: "approval-details" });
    else if (action === "route-warning-decision") store.dispatch({ type: "route-warning-decision", value });
    else if (action === "communication-action") store.dispatch({ type: "communication-action", value });
    else if (action === "branch-action") store.dispatch({ type: "branch-action", value });
    else if (action === "network-action") store.dispatch({ type: "network-action", value });
    else if (action === "provider-action") store.dispatch({ type: "provider-action", value });
    else if (action === "resource-select") store.dispatch({ type: "resource-select", value });
    else if (action === "notification-outcome") store.dispatch({ type: "notification-outcome" });
    else if (action === "notification-toggle") store.dispatch({ type: "notification-toggle" });
    else if (action === "notification-close") store.dispatch({ type: "notification-close" });
    else if (action === "run-trigger") store.dispatch({ type: "run-trigger", value });
    else if (action === "jump-latest") {
      const transcript = app.querySelector("[data-role='transcript']");
      if (transcript) transcript.scrollTo({ top: transcript.scrollHeight, behavior: store.getState().ui.reducedMotion ? "auto" : "smooth" });
      store.dispatch({ type: "set-status", value: "Following the latest message again", trigger: "transcript.follow" }, { notify: false });
    }
  });

  app.addEventListener("input", (event) => {
    const role = event.target.dataset.role;
    if (role === "composer-input") store.dispatch({ type: "set-draft", value: event.target.value }, { notify: false });
    if (role === "search-input") store.dispatch({ type: "search-query", value: event.target.value });
    if (role === "history-filter") store.dispatch({ type: "history-filter", value: event.target.value });
    if (role === "route-search") store.dispatch({ type: "route-search", value: event.target.value });
    if (role === "question-freeform") store.dispatch({ type: "question-answer", value: event.target.value }, { notify: false });
    if (role === "goal-objective-input") store.dispatch({ type: "goal-objective", value: event.target.value }, { notify: false });
    if (role === "width-range") store.dispatch({ type: "set-width", value: event.target.value });
  });

  app.addEventListener("change", (event) => {
    const role = event.target.dataset.role;
    if (role === "window-select") store.dispatch({ type: "select-window", value: event.target.value });
    if (role === "thread-concept-select") store.dispatch({ type: "select-thread-concept", value: event.target.value });
    if (role === "theme-select") store.dispatch({ type: "select-theme", value: event.target.value });
  });

  app.addEventListener("focusout", (event) => {
    if (event.target.dataset.role === "composer-input") store.dispatch({ type: "save-draft-revision" }, { notify: false });
  });

  document.addEventListener("keydown", (event) => {
    const popupOpen = Boolean(store.getState().ui.popup);
    if (event.key === "Escape" && popupOpen) store.dispatch({ type: "close-popup" });
    if (event.key === "Tab" && popupOpen) {
      const dialog = app.querySelector('[role="dialog"][aria-modal="true"]');
      const focusable = [...(dialog?.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? [])].filter((element) => !element.hidden && element.getClientRects().length > 0);
      if (focusable.length) {
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
      }
    }
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && event.target.dataset.role === "composer-input") { event.preventDefault(); store.sendDraft(); }
  });
}

async function start() {
  try {
    const data = await loadPrototypeData();
    const store = createPrototypeStore(data, { windowId: defaultWindow, threadId: defaultThread });
    if (entryKind === "window" && store.getState().ui.selectedWindow !== defaultWindow) store.dispatch({ type: "select-window", value: defaultWindow }, { notify: false });
    if (entryKind === "thread" && store.getState().ui.selectedThreadConcept !== defaultThread) store.dispatch({ type: "select-thread-concept", value: defaultThread }, { notify: false });
    window.__SOL_STORE__ = store;
    window.__SOL_DATA__ = data;
    installEvents(store, data);
    store.subscribe(({ ui, action }) => {
      if (action?.type === "set-width" && renderWidthOnly(ui)) return;
      render(data, ui, action);
    });
    render(data, store.getState().ui);
  } catch (error) {
    app.innerHTML = `<section class="fatal-state"><span data-concept-model="5.6 Sol">${MODEL_LABEL}</span><h1>The concept fixture could not start</h1><p>${escapeHtml(error.message)}</p><button type="button" onclick="location.reload()">Reload concept</button></section>`;
  }
}

start();
