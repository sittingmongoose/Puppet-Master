// Fable — Window 06 "Reading Room".
// Design thesis: typographic calm. Chrome recedes to hairline margins and small
// caps; the transcript is the room. Thread history is a margin-note column of
// annotations at the left edge; artifacts open as a reference desk — a quiet
// carrel to the left with an inset paper surface.
// Motion thesis: ink settling. Surfaces arrive with a barely-there rise and an
// opacity bloom, like ink taking to paper; nothing slides across the room, and
// the reading line is never disturbed.

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
  ensureCss("windows/window-06.css");

  const el = document.createElement("div");
  el.className = "fw6-root";
  el.innerHTML = `
    <aside class="fw6-margin" aria-label="Thread margin notes"></aside>
    <aside class="fw6-desk" aria-label="Reference desk"></aside>
    <section class="fw6-room">
      <header class="fw6-runner"></header>
      <div class="fw6-thread-slot"></div>
    </section>`;

  const marginEl = el.querySelector(".fw6-margin");
  const deskEl = el.querySelector(".fw6-desk");
  const runner = el.querySelector(".fw6-runner");

  // ---------- runner (hairline header) ----------
  const parts = buildHeaderParts(ctx);
  const left = document.createElement("div");
  left.className = "fw6-runner-side";
  left.append(parts.historyToggle, parts.title);
  const right = document.createElement("div");
  right.className = "fw6-runner-side fw6-runner-right";
  const artBtn = document.createElement("button");
  artBtn.className = "fwc-head-btn";
  artBtn.setAttribute("aria-label", "Reference desk");
  artBtn.innerHTML = icon("report", 15);
  artBtn.addEventListener("click", () => artifactMenu(artBtn));
  right.append(parts.search, artBtn, parts.mountToggle, parts.kebab);
  runner.append(left, right);

  ctx.threadFactory(el.querySelector(".fw6-thread-slot"));

  // ---------- margin notes ----------
  function renderHistory(state) {
    el.dataset.history = state;
    parts.historyToggle.setAttribute("aria-pressed", String(state !== "closed"));
    marginEl.replaceChildren();
    if (state === "closed") return;
    const compact = state === "pinned-compact";
    const rows = historyRows();
    const head = document.createElement("div");
    head.className = "fw6-margin-head";
    head.innerHTML = `
      ${compact ? "" : `<span class="fw6-margin-title">In this room</span>`}
      <button class="fwc-head-btn" data-act="${state === "peek" ? "pin" : "close"}" aria-label="${state === "peek" ? "Keep notes open" : "Put notes away"}">${icon(state === "peek" ? "pin" : "close", 12)}</button>`;
    head.querySelector("[data-act]").addEventListener("click", (e) => {
      store.setHistory(e.currentTarget.dataset.act === "pin" ? "pinned-full" : "closed");
    });
    marginEl.appendChild(head);
    const list = document.createElement("div");
    list.className = "fw6-notes pm-scroll";
    for (const r of rows) {
      const b = document.createElement("button");
      b.className = "fw6-note";
      b.dataset.active = String(r.active);
      b.title = `${r.title} — ${r.state}`;
      if (compact) {
        b.innerHTML = `<span class="fw6-note-mark">${r.hasQuestion ? "?" : r.goalStatus ? "◆" : "·"}</span>`;
      } else {
        b.innerHTML = `
          <span class="fw6-note-title">${escapeHtml(r.title)}</span>
          <span class="fw6-note-meta">${escapeHtml(r.state)}, ${escapeHtml(r.updated)} ago</span>`;
      }
      b.addEventListener("click", () => store.selectThread(r.id));
      b.addEventListener("contextmenu", (e) => { e.preventDefault(); threadRowMenu(b, r); });
      list.appendChild(b);
    }
    marginEl.appendChild(list);
  }

  marginEl.addEventListener("mouseleave", () => {
    if (store.state.historyState === "peek" && store.state.historyRequested !== "peek") {
      store.setHistory("closed", { requested: false });
    }
  });

  const historyCtl = createHistoryController({
    container: el,
    fullWidth: 210,
    compactWidth: 40,
    apply: {
      render: renderHistory,
      extraPressure: () => (store.state.artifact.status !== "closed" ? 450 : 0),
    },
  });

  // ---------- reference desk ----------
  function renderDesk() {
    const info = artifactInfo();
    const open = info.status !== "closed";
    el.dataset.artifact = String(open);
    deskEl.replaceChildren();
    if (!open) return;
    deskEl.innerHTML = `
      <div class="fw6-desk-head">
        <span class="fw6-desk-eyebrow">Reference</span>
        <span class="fw6-desk-title">${escapeHtml(info.meta ? info.meta.title : "Artifact")}</span>
        <span class="fw6-desk-status">${info.status === "updated" ? "updated" : info.status === "loading" ? "fetching" : info.status === "error" ? "unavailable" : ""}</span>
        <button class="fwc-head-btn" data-act="editor" aria-label="Open in editor">${icon("popout", 12)}</button>
        <button class="fwc-head-btn" data-act="close" aria-label="Return to shelf">${icon("close", 12)}</button>
      </div>
      <div class="fw6-desk-paper"></div>
      <div class="fw6-desk-shelf"></div>`;
    deskEl.querySelector('[data-act="close"]').addEventListener("click", () => store.closeArtifact());
    deskEl.querySelector('[data-act="editor"]').addEventListener("click", () => {
      store.addReceipt({ kind: "artifact", title: `Opened in editor — ${info.meta ? info.meta.title : "artifact"}`, detail: "Project-backed; the editor owns the file." });
    });
    renderArtifactContent(deskEl.querySelector(".fw6-desk-paper"), info.openId, info.status);
    const shelf = deskEl.querySelector(".fw6-desk-shelf");
    for (const a of info.list) {
      const b = document.createElement("button");
      b.className = "fw6-shelf-card";
      b.dataset.active = String(a.id === info.openId);
      b.textContent = a.title;
      b.title = `${a.kind} · ${a.projectPath}`;
      b.addEventListener("click", () => store.openArtifact(a.id));
      shelf.appendChild(b);
    }
    historyCtl.evaluate();
  }

  const un = [
    store.on("artifact", renderDesk),
    store.on("thread", renderDesk),
  ];

  renderHistory(store.state.historyState);
  renderDesk();

  return {
    el,
    destroy() {
      historyCtl.destroy();
      parts.destroy();
      un.forEach((u) => u());
    },
  };
}
