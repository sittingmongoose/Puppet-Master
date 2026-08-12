// Fable — Window 05 "Workbench".
// Design thesis: the artifact workspace is a co-equal bench to the left of Chat
// with its own tab rail and status shelf — a place where work sits out on the
// table. Chat defends a declared reading floor on the right. Thread history is a
// tool drawer: peek slides it over the bench, pinning gives it a fixed slat.
// Motion thesis: sturdy and utilitarian — short quick snaps, square corners of
// timing; a drawer thunks open, a tab seats itself. No drift, no float.

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
  ensureCss("windows/window-05.css");

  const el = document.createElement("div");
  el.className = "fw5-root";
  el.innerHTML = `
    <aside class="fw5-drawer" aria-label="Thread drawer"></aside>
    <section class="fw5-bench" aria-label="Artifact bench">
      <div class="fw5-bench-tabs"></div>
      <div class="fw5-bench-top"></div>
      <div class="fw5-bench-shelf"></div>
    </section>
    <section class="fw5-chat">
      <header class="fw5-chat-head"></header>
      <div class="fw5-thread-slot"></div>
    </section>`;

  const drawerEl = el.querySelector(".fw5-drawer");
  const benchEl = el.querySelector(".fw5-bench");
  const tabsEl = el.querySelector(".fw5-bench-tabs");
  const topEl = el.querySelector(".fw5-bench-top");
  const shelfEl = el.querySelector(".fw5-bench-shelf");
  const head = el.querySelector(".fw5-chat-head");

  // ---------- chat head ----------
  const parts = buildHeaderParts(ctx);
  const left = document.createElement("div");
  left.className = "fw5-head-left";
  left.append(parts.historyToggle, parts.title);
  const right = document.createElement("div");
  right.className = "fw5-head-right";
  right.append(parts.search, parts.mountToggle, parts.kebab);
  head.append(left, right);

  ctx.threadFactory(el.querySelector(".fw5-thread-slot"));

  // ---------- drawer history ----------
  function renderHistory(state) {
    el.dataset.history = state;
    parts.historyToggle.setAttribute("aria-pressed", String(state !== "closed"));
    drawerEl.replaceChildren();
    if (state === "closed") return;
    const compact = state === "pinned-compact";
    drawerEl.innerHTML = `
      <div class="fw5-drawer-head">
        <span class="fw5-drawer-handle" aria-hidden="true"></span>
        ${compact ? "" : `<span class="fw5-drawer-title">Threads</span>`}
        <button class="fwc-head-btn" data-act="${state === "peek" ? "pin" : "close"}" aria-label="${state === "peek" ? "Pin drawer" : "Close drawer"}">${icon(state === "peek" ? "pin" : "close", 12)}</button>
      </div>
      <div class="fw5-drawer-rows pm-scroll"></div>`;
    drawerEl.querySelector("[data-act]").addEventListener("click", (e) => {
      store.setHistory(e.currentTarget.dataset.act === "pin" ? "pinned-full" : "closed");
    });
    const rowsEl = drawerEl.querySelector(".fw5-drawer-rows");
    for (const r of historyRows()) {
      const b = document.createElement("button");
      b.className = "fw5-slot";
      b.dataset.active = String(r.active);
      b.title = `${r.title} — ${r.state}`;
      if (compact) {
        b.innerHTML = `<span class="fw5-slot-glyph">${icon(r.hasQuestion ? "question" : r.goalStatus ? "goal" : "thread", 14)}</span>`;
      } else {
        b.innerHTML = `
          <span class="fw5-slot-glyph">${icon(r.hasQuestion ? "question" : r.goalStatus ? "goal" : "thread", 14)}</span>
          <span class="fw5-slot-main">
            <span class="fw5-slot-title">${escapeHtml(r.title)}</span>
            <span class="fw5-slot-meta">${escapeHtml(r.state)} · ${escapeHtml(r.updated)}</span>
          </span>`;
      }
      b.addEventListener("click", () => store.selectThread(r.id));
      b.addEventListener("contextmenu", (e) => { e.preventDefault(); threadRowMenu(b, r); });
      rowsEl.appendChild(b);
    }
  }

  drawerEl.addEventListener("mouseleave", () => {
    if (store.state.historyState === "peek" && store.state.historyRequested !== "peek") {
      store.setHistory("closed", { requested: false });
    }
  });

  const historyCtl = createHistoryController({
    container: el,
    fullWidth: 236,
    compactWidth: 56,
    apply: {
      render: renderHistory,
      extraPressure: () => (store.state.artifact.status !== "closed" ? 480 : 0),
    },
  });

  // ---------- bench ----------
  function renderBench() {
    const info = artifactInfo();
    const open = info.status !== "closed";
    el.dataset.artifact = String(open);
    tabsEl.replaceChildren();
    topEl.replaceChildren();
    shelfEl.replaceChildren();
    if (!open) return;

    for (const a of info.list) {
      const t = document.createElement("button");
      t.className = "fw5-tab";
      t.dataset.active = String(a.id === info.openId);
      t.innerHTML = `${icon(a.kind === "multi-file diff" ? "diff" : a.kind === "report document" ? "report" : a.kind === "test capture" ? "image" : "file", 12)}<span>${escapeHtml(a.title)}</span>`;
      t.addEventListener("click", () => store.openArtifact(a.id));
      tabsEl.appendChild(t);
    }
    const close = document.createElement("button");
    close.className = "fwc-head-btn fw5-tab-close";
    close.setAttribute("aria-label", "Close bench");
    close.innerHTML = icon("close", 13);
    close.addEventListener("click", () => store.closeArtifact());
    tabsEl.appendChild(close);

    renderArtifactContent(topEl, info.openId, info.status);

    shelfEl.innerHTML = `
      <span class="fw5-shelf-item">${escapeHtml(info.meta ? info.meta.projectPath : "")}</span>
      <span class="fw5-shelf-item" data-status="${info.status}">${info.status === "updated" ? "Updated just now" : info.status === "loading" ? "Loading" : info.status === "error" ? "Load failed" : "Ready"}</span>
      <button class="fw5-shelf-btn" data-act="editor">${icon("popout", 11)}<span>Open in editor</span></button>`;
    shelfEl.querySelector('[data-act="editor"]').addEventListener("click", () => {
      store.addReceipt({ kind: "artifact", title: `Opened in editor — ${info.meta ? info.meta.title : "artifact"}`, detail: "Project-backed; the editor owns the file." });
    });
    historyCtl.evaluate();
  }

  const un = [
    store.on("artifact", renderBench),
    store.on("thread", renderBench),
  ];

  renderHistory(store.state.historyState);
  renderBench();

  return {
    el,
    destroy() {
      historyCtl.destroy();
      parts.destroy();
      un.forEach((u) => u());
    },
  };
}
