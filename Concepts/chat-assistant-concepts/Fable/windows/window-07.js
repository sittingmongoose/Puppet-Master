// Fable — Window 07 "Mosaic".
// Design thesis: the workspace is a board of dockable tiles. History, artifact,
// and chat are tiles with visible handles and a shared gap rhythm; pinning
// history IS docking its tile, closing a tile files it into the tray at the
// bottom edge, and the board visibly reflows around every change.
// Motion thesis: reflow choreography — tiles grow and shrink along their flex
// tracks with a stagger, and the tray chip is the tile's continuation, not a
// separate control. Completion condenses: a closed tile becomes its chip.

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
  ensureCss("windows/window-07.css");

  const el = document.createElement("div");
  el.className = "fw7-root";
  el.innerHTML = `
    <div class="fw7-board">
      <section class="fw7-tile fw7-tile-history" aria-label="Thread history tile"></section>
      <section class="fw7-tile fw7-tile-artifact" aria-label="Artifact tile"></section>
      <section class="fw7-tile fw7-tile-chat" aria-label="Chat tile">
        <div class="fw7-tile-head fw7-chat-head"></div>
        <div class="fw7-thread-slot"></div>
      </section>
    </div>
    <footer class="fw7-tray" aria-label="Tile tray"></footer>`;

  const historyTile = el.querySelector(".fw7-tile-history");
  const artifactTile = el.querySelector(".fw7-tile-artifact");
  const chatHead = el.querySelector(".fw7-chat-head");
  const tray = el.querySelector(".fw7-tray");

  // ---------- chat tile head ----------
  const parts = buildHeaderParts(ctx);
  const handle = document.createElement("span");
  handle.className = "fw7-handle";
  handle.setAttribute("aria-hidden", "true");
  handle.innerHTML = icon("more", 12);
  const left = document.createElement("div");
  left.className = "fw7-head-left";
  left.append(handle, parts.title);
  const right = document.createElement("div");
  right.className = "fw7-head-right";
  right.append(parts.search, parts.mountToggle, parts.kebab);
  chatHead.append(left, right);

  ctx.threadFactory(el.querySelector(".fw7-thread-slot"));

  // ---------- history tile ----------
  function renderHistory(state) {
    el.dataset.history = state;
    parts.historyToggle && parts.historyToggle.setAttribute("aria-pressed", String(state !== "closed"));
    historyTile.replaceChildren();
    if (state === "closed") { renderTray(); return; }
    const compact = state === "pinned-compact";
    historyTile.innerHTML = `
      <div class="fw7-tile-head">
        <span class="fw7-handle" aria-hidden="true">${icon("more", 12)}</span>
        ${compact ? "" : `<span class="fw7-tile-name">Threads</span>`}
        ${state === "peek" ? `<button class="fwc-head-btn" data-act="pin" aria-label="Dock tile">${icon("pin", 12)}</button>` : ""}
        <button class="fwc-head-btn" data-act="close" aria-label="File tile to tray">${icon("chevronDown", 12)}</button>
      </div>
      <div class="fw7-tile-body pm-scroll"></div>`;
    historyTile.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => {
      store.setHistory(b.dataset.act === "pin" ? "pinned-full" : "closed");
    }));
    const body = historyTile.querySelector(".fw7-tile-body");
    for (const r of historyRows()) {
      const b = document.createElement("button");
      b.className = "fw7-cell";
      b.dataset.active = String(r.active);
      b.title = `${r.title} — ${r.state}`;
      if (compact) {
        b.innerHTML = `<span class="fw7-cell-glyph">${icon(r.hasQuestion ? "question" : r.goalStatus ? "goal" : "thread", 13)}</span>`;
      } else {
        b.innerHTML = `
          <span class="fw7-cell-glyph">${icon(r.hasQuestion ? "question" : r.goalStatus ? "goal" : "thread", 13)}</span>
          <span class="fw7-cell-main">
            <span class="fw7-cell-title">${escapeHtml(r.title)}</span>
            <span class="fw7-cell-meta">${escapeHtml(r.state)} · ${escapeHtml(r.updated)}</span>
          </span>`;
      }
      b.addEventListener("click", () => store.selectThread(r.id));
      b.addEventListener("contextmenu", (e) => { e.preventDefault(); threadRowMenu(b, r); });
      body.appendChild(b);
    }
    renderTray();
  }

  historyTile.addEventListener("mouseleave", () => {
    if (store.state.historyState === "peek" && store.state.historyRequested !== "peek") {
      store.setHistory("closed", { requested: false });
    }
  });

  const historyCtl = createHistoryController({
    container: el,
    fullWidth: 240,
    compactWidth: 58,
    apply: {
      render: renderHistory,
      extraPressure: () => (store.state.artifact.status !== "closed" ? 450 : 0),
    },
  });

  // ---------- artifact tile ----------
  function renderArtifact() {
    const info = artifactInfo();
    const open = info.status !== "closed";
    el.dataset.artifact = String(open);
    artifactTile.replaceChildren();
    if (open) {
      artifactTile.innerHTML = `
        <div class="fw7-tile-head">
          <span class="fw7-handle" aria-hidden="true">${icon("more", 12)}</span>
          <span class="fw7-tile-name">${escapeHtml(info.meta ? info.meta.title : "Artifact")}</span>
          <span class="fw7-tile-status" data-status="${info.status}"></span>
          <button class="fwc-head-btn" data-act="editor" aria-label="Open in editor">${icon("popout", 12)}</button>
          <button class="fwc-head-btn" data-act="close" aria-label="File tile to tray">${icon("chevronDown", 12)}</button>
        </div>
        <div class="fw7-tile-body-flat"></div>
        <div class="fw7-tile-foot"></div>`;
      artifactTile.querySelector('[data-act="close"]').addEventListener("click", () => store.closeArtifact());
      artifactTile.querySelector('[data-act="editor"]').addEventListener("click", () => {
        store.addReceipt({ kind: "artifact", title: `Opened in editor — ${info.meta ? info.meta.title : "artifact"}`, detail: "Project-backed; the editor owns the file." });
      });
      renderArtifactContent(artifactTile.querySelector(".fw7-tile-body-flat"), info.openId, info.status);
      const foot = artifactTile.querySelector(".fw7-tile-foot");
      for (const a of info.list) {
        const b = document.createElement("button");
        b.className = "fw7-foot-chip";
        b.dataset.active = String(a.id === info.openId);
        b.textContent = a.title;
        b.addEventListener("click", () => store.openArtifact(a.id));
        foot.appendChild(b);
      }
    }
    renderTray();
    historyCtl.evaluate();
  }

  // ---------- tray (filed tiles) ----------
  function renderTray() {
    tray.replaceChildren();
    const chips = [];
    if (store.state.historyState === "closed") {
      chips.push({ icon: "history", label: "Threads", act: () => store.setHistory("pinned-full") });
    }
    if (store.state.artifact.status === "closed") {
      const list = (store.thread.artifacts || []);
      chips.push({
        icon: "artifact",
        label: list.length ? `Artifacts · ${list.length}` : "Artifacts",
        act: (btn) => { if (list.length) store.openArtifact(list[0].id); else artifactMenu(btn); },
      });
    }
    tray.dataset.empty = String(!chips.length);
    for (const c of chips) {
      const b = document.createElement("button");
      b.className = "fw7-tray-chip";
      b.innerHTML = `${icon(c.icon, 12)}<span>${escapeHtml(c.label)}</span>${icon("chevronUp", 10)}`;
      b.addEventListener("click", () => c.act(b));
      tray.appendChild(b);
    }
  }

  const un = [
    store.on("artifact", renderArtifact),
    store.on("thread", renderArtifact),
    store.on("history", renderTray),
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
