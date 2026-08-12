// Fable — Window 02 "Bindery".
// Design thesis: the workspace is a bound working document. Chat is the recto
// page under a running head; artifacts open as the facing verso page across a
// center gutter; thread history is a spine of thumb-tabs on the binding edge,
// opening into a table-of-contents leaf.
// Motion thesis: fold-and-settle. Leaves lay flat from a slight horizontal
// compression, as paper settles; nothing slides in from off-screen. The gutter
// is a fixed landmark that never moves.

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
  ensureCss("windows/window-02.css");

  const el = document.createElement("div");
  el.className = "fw2-root";
  el.innerHTML = `
    <aside class="fw2-spine" aria-label="Thread spine"></aside>
    <aside class="fw2-toc" aria-label="Table of contents"></aside>
    <section class="fw2-verso" aria-label="Artifact page"></section>
    <div class="fw2-gutter" aria-hidden="true"></div>
    <section class="fw2-recto">
      <header class="fw2-runninghead"></header>
      <div class="fw2-thread-slot"></div>
    </section>`;

  const spineEl = el.querySelector(".fw2-spine");
  const tocEl = el.querySelector(".fw2-toc");
  const versoEl = el.querySelector(".fw2-verso");
  const gutterEl = el.querySelector(".fw2-gutter");
  const head = el.querySelector(".fw2-runninghead");

  // ---------- running head ----------
  const parts = buildHeaderParts(ctx);
  const left = document.createElement("div");
  left.className = "fw2-head-side";
  left.append(parts.historyToggle);
  const center = document.createElement("div");
  center.className = "fw2-head-center";
  center.append(parts.title);
  const right = document.createElement("div");
  right.className = "fw2-head-side fw2-head-right";
  const artBtn = document.createElement("button");
  artBtn.className = "fwc-head-btn";
  artBtn.setAttribute("aria-label", "Artifacts");
  artBtn.innerHTML = icon("artifact", 15);
  artBtn.addEventListener("click", () => artifactMenu(artBtn));
  right.append(parts.search, artBtn, parts.mountToggle, parts.kebab);
  head.append(left, center, right);

  ctx.threadFactory(el.querySelector(".fw2-thread-slot"));

  // ---------- spine + toc ----------
  function renderHistory(state) {
    el.dataset.history = state;
    parts.historyToggle.setAttribute("aria-pressed", String(state !== "closed"));

    // Spine tabs are visible in every non-closed state; compact keeps only them.
    spineEl.replaceChildren();
    if (state !== "closed") {
      const rows = historyRows();
      for (const r of rows.slice(0, 14)) {
        const tab = document.createElement("button");
        tab.className = "fw2-tab";
        tab.dataset.active = String(r.active);
        tab.title = `${r.title} — ${r.state}`;
        tab.innerHTML = `<span class="fw2-tab-text">${escapeHtml(shortTab(r.title))}</span>${r.hasQuestion ? `<span class="fw2-tab-dot" aria-hidden="true"></span>` : ""}`;
        tab.addEventListener("click", () => store.selectThread(r.id));
        tab.addEventListener("contextmenu", (e) => { e.preventDefault(); threadRowMenu(tab, r); });
        spineEl.appendChild(tab);
      }
    }

    // TOC leaf for peek and pinned-full.
    tocEl.replaceChildren();
    const showToc = state === "peek" || state === "pinned-full";
    tocEl.dataset.open = String(showToc);
    if (showToc) {
      const rows = historyRows();
      tocEl.innerHTML = `
        <div class="fw2-toc-head">
          <span class="fw2-toc-title">Contents</span>
          <button class="fwc-head-btn" data-act="${state === "peek" ? "pin" : "close"}" aria-label="${state === "peek" ? "Pin contents" : "Close contents"}">${icon(state === "peek" ? "pin" : "close", 13)}</button>
        </div>
        <div class="fw2-toc-rows pm-scroll"></div>`;
      tocEl.querySelector("[data-act]").addEventListener("click", (e) => {
        store.setHistory(e.currentTarget.dataset.act === "pin" ? "pinned-full" : "closed");
      });
      const rowsEl = tocEl.querySelector(".fw2-toc-rows");
      rows.forEach((r, i) => {
        const b = document.createElement("button");
        b.className = "fw2-toc-row";
        b.dataset.active = String(r.active);
        b.innerHTML = `
          <span class="fw2-toc-num">${String(i + 1).padStart(2, "0")}</span>
          <span class="fw2-toc-main">
            <span class="fw2-toc-name">${escapeHtml(r.title)}</span>
            <span class="fw2-toc-leader" aria-hidden="true"></span>
          </span>
          <span class="fw2-toc-state">${escapeHtml(r.state)}</span>`;
        b.addEventListener("click", () => store.selectThread(r.id));
        b.addEventListener("contextmenu", (e) => { e.preventDefault(); threadRowMenu(b, r); });
        rowsEl.appendChild(b);
      });
    }
  }

  tocEl.addEventListener("mouseleave", () => {
    if (store.state.historyState === "peek" && store.state.historyRequested !== "peek") {
      store.setHistory("closed", { requested: false });
    }
  });

  const historyCtl = createHistoryController({
    container: el,
    fullWidth: 264,
    compactWidth: 46,
    apply: {
      render: renderHistory,
      extraPressure: () => (store.state.artifact.status !== "closed" ? 450 : 0),
    },
  });

  // ---------- verso (artifact page) ----------
  function renderArtifact() {
    const info = artifactInfo();
    const open = info.status !== "closed";
    el.dataset.artifact = String(open);
    versoEl.replaceChildren();
    gutterEl.dataset.open = String(open);
    if (!open) return;
    versoEl.innerHTML = `
      <div class="fw2-verso-head">
        <span class="fw2-folio">${escapeHtml(info.meta ? info.meta.kind : "artifact")}</span>
        <span class="fw2-verso-title">${escapeHtml(info.meta ? info.meta.title : "Artifact")}</span>
        <span class="fw2-verso-status" data-status="${info.status}">${info.status === "updated" ? "Updated" : info.status === "loading" ? "Loading" : info.status === "error" ? "Error" : "Ready"}</span>
        <button class="fwc-head-btn" data-act="editor" aria-label="Open in editor">${icon("popout", 13)}</button>
        <button class="fwc-head-btn" data-act="close" aria-label="Close artifact page">${icon("close", 13)}</button>
      </div>
      <div class="fw2-verso-body"></div>
      <div class="fw2-verso-foot"></div>`;
    versoEl.querySelector('[data-act="close"]').addEventListener("click", () => store.closeArtifact());
    versoEl.querySelector('[data-act="editor"]').addEventListener("click", () => {
      store.addReceipt({ kind: "artifact", title: `Opened in editor — ${info.meta ? info.meta.title : "artifact"}`, detail: "Project-backed; the editor owns the file." });
    });
    renderArtifactContent(versoEl.querySelector(".fw2-verso-body"), info.openId, info.status);
    const foot = versoEl.querySelector(".fw2-verso-foot");
    info.list.forEach((a, i) => {
      const b = document.createElement("button");
      b.className = "fw2-plate-mark";
      b.dataset.active = String(a.id === info.openId);
      b.textContent = `Plate ${["I", "II", "III", "IV", "V", "VI"][i] || i + 1}`;
      b.title = `${a.title} · ${a.kind}`;
      b.addEventListener("click", () => store.openArtifact(a.id));
      foot.appendChild(b);
    });
    historyCtl.evaluate();
  }

  function shortTab(title) {
    const words = title.split(/[\s—-]+/).filter(Boolean);
    return (words[0] || "").slice(0, 6);
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
