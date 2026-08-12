// Fable — Window 08 "Periscope".
// Design thesis: overlay-first adaptive shell. A left edge dock holds circular
// lenses (history, artifact). At narrow widths a lens raises its surface as an
// overlay scaling out of the lens itself; as the workspace widens past its
// crystallization threshold, the same surface docks into real side geometry.
// One continuous system — the lens is always the surface's origin and home.
// Motion thesis: lens morphs — scale from the control's corner origin, collapse
// back into it. Docked surfaces keep a visible "stem" tying them to their lens.

import { store } from "../shared/store.js";
import { icon } from "../shared/icons.js";
import { ensureCss } from "../shared/contracts.js";
import { escapeHtml } from "../shared/popup.js";
import {
  historyRows, threadRowMenu, createHistoryController, buildHeaderParts,
  artifactInfo, artifactMenu,
} from "../shared/window-common.js";
import { renderArtifactContent } from "../shared/components.js";

const CRYSTALLIZE_AT = 980;   // observed width where lenses dock (px)

export function createWindow(ctx) {
  ensureCss("windows/window-08.css");

  const el = document.createElement("div");
  el.className = "fw8-root";
  el.innerHTML = `
    <nav class="fw8-dock" aria-label="Lens dock">
      <button class="fw8-lens" data-lens="history" aria-label="Thread history lens">${icon("history", 16)}<span class="fw8-lens-stem" aria-hidden="true"></span></button>
      <button class="fw8-lens" data-lens="artifact" aria-label="Artifact lens">${icon("artifact", 16)}<span class="fw8-lens-stem" aria-hidden="true"></span></button>
    </nav>
    <aside class="fw8-surface fw8-history" aria-label="Thread history"></aside>
    <aside class="fw8-surface fw8-artifact" aria-label="Artifact workspace"></aside>
    <section class="fw8-main">
      <header class="fw8-head"></header>
      <div class="fw8-thread-slot"></div>
    </section>`;

  const dockHistory = el.querySelector('[data-lens="history"]');
  const dockArtifact = el.querySelector('[data-lens="artifact"]');
  const historyEl = el.querySelector(".fw8-history");
  const artifactEl = el.querySelector(".fw8-artifact");
  const head = el.querySelector(".fw8-head");

  dockHistory.addEventListener("click", () => {
    const cur = store.state.historyState;
    if (cur === "closed") store.setHistory(el.dataset.form === "docked" ? "pinned-full" : "peek");
    else store.setHistory("closed");
  });
  dockArtifact.addEventListener("click", () => {
    if (store.state.artifact.status !== "closed") store.closeArtifact();
    else {
      const list = store.thread.artifacts || [];
      if (list.length) store.openArtifact(list[0].id);
      else artifactMenu(dockArtifact);
    }
  });

  // ---------- head ----------
  const parts = buildHeaderParts(ctx);
  const left = document.createElement("div");
  left.className = "fw8-head-left";
  left.append(parts.title);
  const right = document.createElement("div");
  right.className = "fw8-head-right";
  right.append(parts.search, parts.mountToggle, parts.kebab);
  head.append(left, right);

  ctx.threadFactory(el.querySelector(".fw8-thread-slot"));

  // ---------- adaptive form (observed width property, not DOM-measurement state) ----------
  let observedWidth = 0;
  const ro = new ResizeObserver((entries) => {
    for (const e of entries) observedWidth = e.contentRect.width;
    const form = observedWidth >= CRYSTALLIZE_AT ? "docked" : "overlay";
    if (el.dataset.form !== form) {
      el.dataset.form = form;
      renderHistory(store.state.historyState);
      renderArtifact();
    }
  });
  ro.observe(el);

  // ---------- history surface ----------
  function renderHistory(state) {
    el.dataset.history = state;
    dockHistory.dataset.raised = String(state !== "closed");
    historyEl.replaceChildren();
    if (state === "closed") return;
    const compact = state === "pinned-compact";
    historyEl.innerHTML = `
      <div class="fw8-surface-head">
        ${compact ? "" : `<span class="fw8-surface-title">Threads</span>`}
        ${state === "peek" ? `<button class="fwc-head-btn" data-act="pin" aria-label="Pin surface">${icon("pin", 12)}</button>` : ""}
        <button class="fwc-head-btn" data-act="close" aria-label="Collapse into lens">${icon("close", 12)}</button>
      </div>
      <div class="fw8-surface-rows pm-scroll"></div>`;
    historyEl.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => {
      store.setHistory(b.dataset.act === "pin" ? "pinned-full" : "closed");
    }));
    const rows = historyEl.querySelector(".fw8-surface-rows");
    for (const r of historyRows()) {
      const b = document.createElement("button");
      b.className = "fw8-row";
      b.dataset.active = String(r.active);
      b.title = `${r.title} — ${r.state}`;
      if (compact) {
        b.innerHTML = `<span class="fw8-row-glyph">${icon(r.hasQuestion ? "question" : r.goalStatus ? "goal" : "thread", 13)}</span>`;
      } else {
        b.innerHTML = `
          <span class="fw8-row-glyph">${icon(r.hasQuestion ? "question" : r.goalStatus ? "goal" : "thread", 13)}</span>
          <span class="fw8-row-main">
            <span class="fw8-row-title">${escapeHtml(r.title)}</span>
            <span class="fw8-row-meta">${escapeHtml(r.state)} · ${escapeHtml(r.updated)}</span>
          </span>`;
      }
      b.addEventListener("click", () => store.selectThread(r.id));
      b.addEventListener("contextmenu", (e) => { e.preventDefault(); threadRowMenu(b, r); });
      rows.appendChild(b);
    }
  }

  historyEl.addEventListener("mouseleave", () => {
    if (store.state.historyState === "peek" && store.state.historyRequested !== "peek") {
      store.setHistory("closed", { requested: false });
    }
  });

  const historyCtl = createHistoryController({
    container: el,
    fullWidth: 238,
    compactWidth: 56,
    apply: {
      render: renderHistory,
      // In overlay form the surface floats, so it exerts no docked pressure.
      extraPressure: () => (el.dataset.form === "docked" && store.state.artifact.status !== "closed" ? 450 : 0),
    },
  });

  // ---------- artifact surface ----------
  function renderArtifact() {
    const info = artifactInfo();
    const open = info.status !== "closed";
    el.dataset.artifact = String(open);
    dockArtifact.dataset.raised = String(open);
    artifactEl.replaceChildren();
    if (!open) return;
    artifactEl.innerHTML = `
      <div class="fw8-surface-head">
        <span class="fw8-surface-title">${escapeHtml(info.meta ? info.meta.title : "Artifact")}</span>
        <span class="fw8-surface-status" data-status="${info.status}">${info.status === "updated" ? "Updated" : info.status === "loading" ? "Loading" : info.status === "error" ? "Error" : "Ready"}</span>
        <button class="fwc-head-btn" data-act="editor" aria-label="Open in editor">${icon("popout", 12)}</button>
        <button class="fwc-head-btn" data-act="close" aria-label="Collapse into lens">${icon("close", 12)}</button>
      </div>
      <div class="fw8-surface-body"></div>
      <div class="fw8-surface-foot"></div>`;
    artifactEl.querySelector('[data-act="close"]').addEventListener("click", () => store.closeArtifact());
    artifactEl.querySelector('[data-act="editor"]').addEventListener("click", () => {
      store.addReceipt({ kind: "artifact", title: `Opened in editor — ${info.meta ? info.meta.title : "artifact"}`, detail: "Project-backed; the editor owns the file." });
    });
    renderArtifactContent(artifactEl.querySelector(".fw8-surface-body"), info.openId, info.status);
    const foot = artifactEl.querySelector(".fw8-surface-foot");
    for (const a of info.list) {
      const b = document.createElement("button");
      b.className = "fw8-foot-lens";
      b.dataset.active = String(a.id === info.openId);
      b.title = `${a.title} · ${a.kind}`;
      b.innerHTML = icon(a.kind === "multi-file diff" ? "diff" : a.kind === "report document" ? "report" : a.kind === "test capture" ? "image" : "file", 13);
      b.addEventListener("click", () => store.openArtifact(a.id));
      foot.appendChild(b);
    }
    historyCtl.evaluate();
  }

  const un = [
    store.on("artifact", renderArtifact),
    store.on("thread", renderArtifact),
  ];

  el.dataset.form = "docked";
  renderHistory(store.state.historyState);
  renderArtifact();

  return {
    el,
    destroy() {
      ro.disconnect();
      historyCtl.destroy();
      parts.destroy();
      un.forEach((u) => u());
    },
  };
}
