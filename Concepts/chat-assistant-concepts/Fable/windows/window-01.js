// Fable — Window 01 "Proscenium".
// Design thesis: Chat is a center stage. Thread history and the artifact workspace
// are wings that slide in on one continuous floor plane from stage left. Every
// entrance and exit happens on a single horizontal axis — objects arrive from
// where they live and leave the way they came, like stagecraft.
// Motion thesis: single-axis slides with settle; no fades for structure. The floor
// line is continuous; wings compress before the stage ever narrows past its floor.

import { store } from "../shared/store.js";
import { icon } from "../shared/icons.js";
import { ensureCss } from "../shared/contracts.js";
import { escapeHtml } from "../shared/popup.js";
import {
  historyRows, threadRowMenu, createHistoryController, buildHeaderParts,
  artifactInfo, artifactMenu, CHAT_FLOOR,
} from "../shared/window-common.js";
import { renderArtifactContent } from "../shared/components.js";
import { HISTORY_STATE_LABELS } from "../shared/strings.js";

export function createWindow(ctx) {
  ensureCss("windows/window-01.css");

  const el = document.createElement("div");
  el.className = "fw1-root";
  el.innerHTML = `
    <aside class="fw1-wing fw1-history" aria-label="Thread history wing"></aside>
    <aside class="fw1-wing fw1-artifact" aria-label="Artifact workspace wing"></aside>
    <section class="fw1-stage">
      <header class="fw1-lintel"></header>
      <div class="fw1-thread-slot"></div>
    </section>
    <div class="fw1-floor" aria-hidden="true"></div>`;

  const historyEl = el.querySelector(".fw1-history");
  const artifactEl = el.querySelector(".fw1-artifact");
  const stageEl = el.querySelector(".fw1-stage");
  const lintel = el.querySelector(".fw1-lintel");

  // ---------- header (stage lintel) ----------
  const parts = buildHeaderParts(ctx);
  const left = document.createElement("div");
  left.className = "fw1-lintel-left";
  left.append(parts.historyToggle, parts.title);
  const right = document.createElement("div");
  right.className = "fw1-lintel-right";
  const artBtn = document.createElement("button");
  artBtn.className = "fwc-head-btn";
  artBtn.setAttribute("aria-label", "Artifacts");
  artBtn.innerHTML = icon("artifact", 15);
  artBtn.addEventListener("click", () => artifactMenu(artBtn));
  right.append(parts.search, artBtn, parts.mountToggle, parts.kebab);
  lintel.append(left, right);

  // ---------- thread mount ----------
  ctx.threadFactory(el.querySelector(".fw1-thread-slot"));

  // ---------- history wing ----------
  function renderHistory(state) {
    historyEl.dataset.state = state;
    parts.historyToggle.setAttribute("aria-pressed", String(state !== "closed"));
    parts.historyToggle.title = `Thread history — ${HISTORY_STATE_LABELS[state]}`;
    if (state === "closed") { historyEl.replaceChildren(); return; }
    const rows = historyRows();
    const compact = state === "pinned-compact";
    historyEl.innerHTML = `
      <div class="fw1-wing-head">
        <span class="fw1-wing-title">${compact ? "" : "Threads"}</span>
        <button class="fwc-head-btn fw1-pin-btn" aria-label="${state === "peek" ? "Pin history" : "Close history"}">${icon(state === "peek" ? "pin" : "close", 13)}</button>
      </div>
      <div class="fw1-rows pm-scroll"></div>
      ${compact ? "" : `<button class="fw1-archive-toggle">${icon("drawer", 12)}<span>Archive</span></button>`}`;
    historyEl.querySelector(".fw1-pin-btn").addEventListener("click", () => {
      store.setHistory(state === "peek" ? "pinned-full" : "closed");
    });
    const rowsEl = historyEl.querySelector(".fw1-rows");
    for (const r of rows) {
      const b = document.createElement("button");
      b.className = "fw1-row";
      b.dataset.active = String(r.active);
      b.title = r.title;
      if (compact) {
        b.innerHTML = `<span class="fw1-row-glyph">${icon(r.hasQuestion ? "question" : r.goalStatus ? "goal" : "thread", 14)}</span><span class="fw1-row-mini">${escapeHtml(r.title.slice(0, 2))}</span>`;
      } else {
        b.innerHTML = `
          <span class="fw1-row-glyph">${icon(r.hasQuestion ? "question" : r.goalStatus ? "goal" : "thread", 14)}</span>
          <span class="fw1-row-main">
            <span class="fw1-row-title">${escapeHtml(r.title)}</span>
            <span class="fw1-row-sub">${escapeHtml(r.project)} · ${escapeHtml(r.state)}</span>
          </span>
          <span class="fw1-row-side">${r.pinned ? icon("pin", 11) : ""}<span>${escapeHtml(r.updated)}</span></span>`;
        b.addEventListener("contextmenu", (e) => { e.preventDefault(); threadRowMenu(b, r); });
      }
      b.addEventListener("click", () => store.selectThread(r.id));
      rowsEl.appendChild(b);
    }
    const at = historyEl.querySelector(".fw1-archive-toggle");
    if (at) at.addEventListener("click", () => {
      const archived = historyRows({ includeArchived: true }).filter((r) => r.archived);
      rowsEl.replaceChildren();
      for (const r of archived) {
        const b = document.createElement("button");
        b.className = "fw1-row";
        b.innerHTML = `<span class="fw1-row-glyph">${icon("drawer", 14)}</span><span class="fw1-row-main"><span class="fw1-row-title">${escapeHtml(r.title)}</span><span class="fw1-row-sub">Archived</span></span>`;
        b.addEventListener("click", () => store.selectThread(r.id));
        b.addEventListener("contextmenu", (e) => { e.preventDefault(); threadRowMenu(b, r); });
        rowsEl.appendChild(b);
      }
      if (!archived.length) rowsEl.innerHTML = `<div class="fw1-empty">Nothing archived.</div>`;
    });
  }

  // Peek closes when the pointer leaves the wing (transient by definition).
  historyEl.addEventListener("mouseleave", () => {
    if (store.state.historyState === "peek" && store.state.historyRequested !== "peek") {
      store.setHistory("closed", { requested: false });
    }
  });

  const historyCtl = createHistoryController({
    container: el,
    fullWidth: 248,
    compactWidth: 64,
    apply: {
      render: renderHistory,
      extraPressure: () => (store.state.artifact.status !== "closed" ? 440 : 0),
    },
  });

  // ---------- artifact wing ----------
  function renderArtifact() {
    const info = artifactInfo();
    const open = info.status !== "closed";
    artifactEl.dataset.open = String(open);
    if (!open) { artifactEl.replaceChildren(); return; }
    artifactEl.innerHTML = `
      <div class="fw1-wing-head fw1-art-head">
        <span class="fw1-art-arch">${icon(info.meta && info.meta.kind === "multi-file diff" ? "diff" : "artifact", 14)}</span>
        <span class="fw1-wing-title">${escapeHtml(info.meta ? info.meta.title : "Artifact")}</span>
        <span class="fw1-art-status" data-status="${info.status}">${info.status === "updated" ? "Updated" : info.status === "loading" ? "Loading" : info.status === "error" ? "Error" : "Ready"}</span>
        <button class="fwc-head-btn fw1-art-open" aria-label="Reveal in editor" title="Open in editor tab">${icon("popout", 13)}</button>
        <button class="fwc-head-btn fw1-art-close" aria-label="Close artifact">${icon("close", 13)}</button>
      </div>
      <div class="fw1-art-body"></div>
      <div class="fw1-art-switch"></div>`;
    artifactEl.querySelector(".fw1-art-close").addEventListener("click", () => store.closeArtifact());
    artifactEl.querySelector(".fw1-art-open").addEventListener("click", () => {
      store.addReceipt({ kind: "artifact", title: `Opened in editor — ${info.meta ? info.meta.title : "artifact"}`, detail: "Artifacts are Project-backed; the editor owns the file." });
    });
    renderArtifactContent(artifactEl.querySelector(".fw1-art-body"), info.openId, info.status);
    const sw = artifactEl.querySelector(".fw1-art-switch");
    for (const a of info.list) {
      const b = document.createElement("button");
      b.className = "fw1-art-tab";
      b.dataset.active = String(a.id === info.openId);
      b.textContent = a.title;
      b.title = `${a.kind} · ${a.projectPath}`;
      b.addEventListener("click", () => store.openArtifact(a.id));
      sw.appendChild(b);
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
