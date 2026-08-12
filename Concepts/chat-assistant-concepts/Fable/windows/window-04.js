// Fable — Window 04 "Depth Field".
// Design thesis: the workspace is a shallow depth field. Chat holds the front
// plane; thread history and artifacts rest on rear planes whose edges stay
// visible in a stack at the left rim. Pinning advances a plane until it docks
// flush; closing recedes it back into the stack. Depth is drawn with precomputed
// scale, elevation shadows, and plate sheens — Glass-native, opaque everywhere.
// Motion thesis: advance and recede along an implied z-axis; a surface never
// appears from nowhere — it comes forward out of the visible stack and returns.

import { store } from "../shared/store.js";
import { icon } from "../shared/icons.js";
import { ensureCss } from "../shared/contracts.js";
import { escapeHtml } from "../shared/popup.js";
import {
  historyRows, threadRowMenu, createHistoryController, buildHeaderParts,
  artifactInfo, artifactMenu,
} from "../shared/window-common.js";
import { renderArtifactContent } from "../shared/components.js";

export function createWindow(ctx) {
  ensureCss("windows/window-04.css");

  const el = document.createElement("div");
  el.className = "fw4-root";
  el.innerHTML = `
    <div class="fw4-rim" aria-label="Rear planes">
      <button class="fw4-rim-plane" data-plane="history" aria-label="Thread history plane">
        <span class="fw4-rim-edge"></span><span class="fw4-rim-edge"></span><span class="fw4-rim-edge"></span>
        ${icon("history", 13)}
      </button>
      <button class="fw4-rim-plane" data-plane="artifact" aria-label="Artifact plane">
        <span class="fw4-rim-edge"></span><span class="fw4-rim-edge"></span>
        ${icon("artifact", 13)}
      </button>
    </div>
    <aside class="fw4-plane fw4-history pm-panel-material" aria-label="Thread history"></aside>
    <aside class="fw4-plane fw4-artifact pm-panel-material" aria-label="Artifact workspace"></aside>
    <section class="fw4-front">
      <header class="fw4-head"></header>
      <div class="fw4-thread-slot"></div>
    </section>`;

  const rimHistory = el.querySelector('[data-plane="history"]');
  const rimArtifact = el.querySelector('[data-plane="artifact"]');
  const historyEl = el.querySelector(".fw4-history");
  const artifactEl = el.querySelector(".fw4-artifact");
  const head = el.querySelector(".fw4-head");

  rimHistory.addEventListener("click", () => {
    const cur = store.state.historyState;
    store.setHistory(cur === "closed" ? "peek" : "closed");
  });
  rimArtifact.addEventListener("click", () => {
    const t = store.thread;
    if (store.state.artifact.status !== "closed") store.closeArtifact();
    else if ((t.artifacts || []).length) store.openArtifact(t.artifacts[0].id);
    else artifactMenu(rimArtifact);
  });

  // ---------- head ----------
  const parts = buildHeaderParts(ctx);
  const left = document.createElement("div");
  left.className = "fw4-head-left";
  left.append(parts.title);
  const right = document.createElement("div");
  right.className = "fw4-head-right";
  right.append(parts.search, parts.historyToggle, parts.mountToggle, parts.kebab);
  head.append(left, right);

  ctx.threadFactory(el.querySelector(".fw4-thread-slot"));

  // ---------- history plane ----------
  function renderHistory(state) {
    el.dataset.history = state;
    parts.historyToggle.setAttribute("aria-pressed", String(state !== "closed"));
    rimHistory.dataset.raised = String(state !== "closed");
    historyEl.replaceChildren();
    if (state === "closed") return;
    const compact = state === "pinned-compact";
    historyEl.innerHTML = `
      <div class="fw4-plane-head">
        ${compact ? "" : `<span class="fw4-plane-title">Threads</span>`}
        <button class="fwc-head-btn" data-act="${state === "peek" ? "pin" : "close"}" aria-label="${state === "peek" ? "Pin plane" : "Recede plane"}">${icon(state === "peek" ? "pin" : "chevronLeft", 13)}</button>
      </div>
      <div class="fw4-plane-rows pm-scroll"></div>`;
    historyEl.querySelector("[data-act]").addEventListener("click", (e) => {
      store.setHistory(e.currentTarget.dataset.act === "pin" ? "pinned-full" : "closed");
    });
    const rowsEl = historyEl.querySelector(".fw4-plane-rows");
    for (const r of historyRows()) {
      const b = document.createElement("button");
      b.className = "fw4-card";
      b.dataset.active = String(r.active);
      b.title = r.title;
      if (compact) {
        b.innerHTML = `<span class="fw4-card-glyph">${icon(r.hasQuestion ? "question" : r.goalStatus ? "goal" : "thread", 13)}</span>`;
      } else {
        b.innerHTML = `
          <span class="fw4-card-title">${escapeHtml(r.title)}</span>
          <span class="fw4-card-meta">${escapeHtml(r.project)} · ${escapeHtml(r.state)} · ${escapeHtml(r.updated)}</span>`;
      }
      b.addEventListener("click", () => store.selectThread(r.id));
      b.addEventListener("contextmenu", (e) => { e.preventDefault(); threadRowMenu(b, r); });
      rowsEl.appendChild(b);
    }
  }

  historyEl.addEventListener("mouseleave", () => {
    if (store.state.historyState === "peek" && store.state.historyRequested !== "peek") {
      store.setHistory("closed", { requested: false });
    }
  });

  const historyCtl = createHistoryController({
    container: el,
    fullWidth: 246,
    compactWidth: 60,
    apply: {
      render: renderHistory,
      extraPressure: () => (store.state.artifact.status !== "closed" ? 440 : 0),
    },
  });

  // ---------- artifact plane ----------
  function renderArtifact() {
    const info = artifactInfo();
    const open = info.status !== "closed";
    el.dataset.artifact = String(open);
    rimArtifact.dataset.raised = String(open);
    artifactEl.replaceChildren();
    if (!open) return;
    artifactEl.innerHTML = `
      <div class="fw4-plane-head">
        <span class="fw4-plane-title">${escapeHtml(info.meta ? info.meta.title : "Artifact")}</span>
        <span class="fw4-depth-status" data-status="${info.status}">${info.status === "updated" ? "Updated" : info.status === "loading" ? "Loading" : info.status === "error" ? "Error" : "Ready"}</span>
        <button class="fwc-head-btn" data-act="editor" aria-label="Open in editor">${icon("popout", 13)}</button>
        <button class="fwc-head-btn" data-act="close" aria-label="Recede plane">${icon("chevronLeft", 13)}</button>
      </div>
      <div class="fw4-plane-body"></div>
      <div class="fw4-plane-stack"></div>`;
    artifactEl.querySelector('[data-act="close"]').addEventListener("click", () => store.closeArtifact());
    artifactEl.querySelector('[data-act="editor"]').addEventListener("click", () => {
      store.addReceipt({ kind: "artifact", title: `Opened in editor — ${info.meta ? info.meta.title : "artifact"}`, detail: "Project-backed; the editor owns the file." });
    });
    renderArtifactContent(artifactEl.querySelector(".fw4-plane-body"), info.openId, info.status);
    const stack = artifactEl.querySelector(".fw4-plane-stack");
    for (const a of info.list) {
      const b = document.createElement("button");
      b.className = "fw4-stack-item";
      b.dataset.active = String(a.id === info.openId);
      b.innerHTML = `${icon(a.kind === "multi-file diff" ? "diff" : a.kind === "report document" ? "report" : a.kind === "test capture" ? "image" : "file", 12)}<span>${escapeHtml(a.title)}</span>`;
      b.addEventListener("click", () => store.openArtifact(a.id));
      stack.appendChild(b);
    }
    historyCtl.evaluate();
  }

  const un = [
    store.on("artifact", renderArtifact),
    store.on("thread", renderArtifact),
  ];

  renderHistory(store.state.historyState);
  renderArtifact();

  return {
    el,
    destroy() {
      historyCtl.destroy();
      parts.destroy();
      un.forEach((u) => u());
    },
  };
}
