// Fable — Window 03 "Instrument Deck".
// Design thesis: a slim instrument band above a calm transcript. Route, access,
// BSD, Context Ring, and sync are instruments in labeled cells — the workspace
// reads like a cockpit: glance up for state, look down for conversation.
// History docks as a vertical film-strip of thread frames; artifacts open in an
// auxiliary monitor to the left of Chat.
// Motion thesis: mechanical precision — indexed movements, short distances,
// square easing; instrument values change like split-flap readouts.

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
  ensureCss("windows/window-03.css");

  const el = document.createElement("div");
  el.className = "fw3-root";
  el.innerHTML = `
    <header class="fw3-deck">
      <div class="fw3-deck-left"></div>
      <div class="fw3-instruments"></div>
    </header>
    <div class="fw3-bay">
      <aside class="fw3-strip" aria-label="Thread film-strip"></aside>
      <aside class="fw3-monitor" aria-label="Artifact monitor"></aside>
      <section class="fw3-chatcol"><div class="fw3-thread-slot"></div></section>
    </div>`;

  const deckLeft = el.querySelector(".fw3-deck-left");
  const instruments = el.querySelector(".fw3-instruments");
  const stripEl = el.querySelector(".fw3-strip");
  const monitorEl = el.querySelector(".fw3-monitor");

  // ---------- deck ----------
  const parts = buildHeaderParts(ctx);
  deckLeft.append(parts.historyToggle, parts.title, parts.search);

  // The deck hosts the selector row as instruments.
  const selCell = document.createElement("div");
  selCell.className = "fw3-cell fw3-cell-selectors";
  selCell.innerHTML = `<span class="fw3-cell-label">Route · Mode · Access · BSD</span>`;
  const selSlot = document.createElement("div");
  selSlot.className = "fw3-cell-value";
  selCell.appendChild(selSlot);
  ctx.selectorSlot = selSlot;

  const artCell = document.createElement("button");
  artCell.className = "fw3-cell fw3-cell-button";
  artCell.innerHTML = `<span class="fw3-cell-label">Artifacts</span><span class="fw3-cell-value fw3-art-count">0</span>`;
  artCell.addEventListener("click", () => artifactMenu(artCell));

  const mountCell = document.createElement("div");
  mountCell.className = "fw3-cell fw3-cell-tools";
  mountCell.append(parts.mountToggle, parts.kebab);

  instruments.append(selCell, artCell, mountCell);

  ctx.threadFactory(el.querySelector(".fw3-thread-slot"));

  // ---------- film-strip history ----------
  function renderHistory(state) {
    el.dataset.history = state;
    parts.historyToggle.setAttribute("aria-pressed", String(state !== "closed"));
    stripEl.replaceChildren();
    if (state === "closed") return;
    const compact = state === "pinned-compact";
    const rows = historyRows();
    const head = document.createElement("div");
    head.className = "fw3-strip-head";
    head.innerHTML = compact
      ? `<button class="fwc-head-btn" data-act="close" aria-label="Close history">${icon("close", 12)}</button>`
      : `<span>Threads</span><button class="fwc-head-btn" data-act="${state === "peek" ? "pin" : "close"}" aria-label="${state === "peek" ? "Pin history" : "Close history"}">${icon(state === "peek" ? "pin" : "close", 12)}</button>`;
    head.querySelector("[data-act]").addEventListener("click", (e) => {
      store.setHistory(e.currentTarget.dataset.act === "pin" ? "pinned-full" : "closed");
    });
    stripEl.appendChild(head);
    const list = document.createElement("div");
    list.className = "fw3-frames pm-scroll";
    for (const r of rows) {
      const f = document.createElement("button");
      f.className = "fw3-frame";
      f.dataset.active = String(r.active);
      f.dataset.state = r.state;
      f.title = `${r.title} — ${r.state}`;
      if (compact) {
        f.innerHTML = `<span class="fw3-frame-glyph">${icon(r.hasQuestion ? "question" : r.goalStatus ? "goal" : "thread", 13)}</span>`;
      } else {
        f.innerHTML = `
          <span class="fw3-frame-title">${escapeHtml(r.title)}</span>
          <span class="fw3-frame-meta">${escapeHtml(r.state)} · ${escapeHtml(r.updated)}</span>`;
      }
      f.addEventListener("click", () => store.selectThread(r.id));
      f.addEventListener("contextmenu", (e) => { e.preventDefault(); threadRowMenu(f, r); });
      list.appendChild(f);
    }
    stripEl.appendChild(list);
  }

  stripEl.addEventListener("mouseleave", () => {
    if (store.state.historyState === "peek" && store.state.historyRequested !== "peek") {
      store.setHistory("closed", { requested: false });
    }
  });

  const historyCtl = createHistoryController({
    container: el,
    fullWidth: 224,
    compactWidth: 52,
    apply: {
      render: renderHistory,
      extraPressure: () => (store.state.artifact.status !== "closed" ? 440 : 0),
    },
  });

  // ---------- artifact monitor ----------
  function renderArtifact() {
    const info = artifactInfo();
    const open = info.status !== "closed";
    el.dataset.artifact = String(open);
    el.querySelector(".fw3-art-count").textContent = String(info.list.length);
    monitorEl.replaceChildren();
    if (!open) return;
    monitorEl.innerHTML = `
      <div class="fw3-monitor-bezel">
        <span class="fw3-monitor-id">AUX</span>
        <span class="fw3-monitor-title">${escapeHtml(info.meta ? info.meta.title : "Artifact")}</span>
        <span class="fw3-monitor-status" data-status="${info.status}"></span>
        <button class="fwc-head-btn" data-act="editor" aria-label="Open in editor">${icon("popout", 12)}</button>
        <button class="fwc-head-btn" data-act="close" aria-label="Close monitor">${icon("close", 12)}</button>
      </div>
      <div class="fw3-monitor-screen"></div>
      <div class="fw3-monitor-channels"></div>`;
    monitorEl.querySelector('[data-act="close"]').addEventListener("click", () => store.closeArtifact());
    monitorEl.querySelector('[data-act="editor"]').addEventListener("click", () => {
      store.addReceipt({ kind: "artifact", title: `Opened in editor — ${info.meta ? info.meta.title : "artifact"}`, detail: "Project-backed; the editor owns the file." });
    });
    renderArtifactContent(monitorEl.querySelector(".fw3-monitor-screen"), info.openId, info.status);
    const ch = monitorEl.querySelector(".fw3-monitor-channels");
    info.list.forEach((a, i) => {
      const b = document.createElement("button");
      b.className = "fw3-channel";
      b.dataset.active = String(a.id === info.openId);
      b.textContent = String(i + 1);
      b.title = `${a.title} · ${a.kind}`;
      b.addEventListener("click", () => store.openArtifact(a.id));
      ch.appendChild(b);
    });
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
