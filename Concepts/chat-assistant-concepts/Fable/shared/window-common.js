// Fable — window-concept common logic. Behavior is canonical (history state
// machine, yield physics, artifact lifecycle, chat header duties); each window
// concept composes these into its own visible geometry and motion.

import { store } from "./store.js";
import { icon } from "./icons.js";
import { openPopup, closePopup, popupRow, popupTitle, popupSep, popupNote, escapeHtml } from "./popup.js";
import { createSearchBar } from "./components.js";
import { fmtRelative, JUMP_TO_LATEST } from "./strings.js";

export const CHAT_FLOOR = 520;   // declared readable Chat floor (px)

// ---------------------------------------------------------------------------
// History data + commands (window concepts render their own row visuals).
// Rows are lightweight thread shells — title, state, relative time, badges.
// ---------------------------------------------------------------------------
export function historyRows({ includeArchived = false } = {}) {
  return store.threadList({ includeArchived }).map((t) => ({
    id: t.id,
    title: t.title,
    project: t.project,
    pinned: t.pinned,
    archived: t.archived,
    state: t.threadState,
    updated: fmtRelative(t.updatedAt),
    active: t.id === store.state.currentThreadId,
    hasQuestion: (t.questionnaires || []).some((q) => q.status === "incomplete" || q.status === "queued"),
    goalStatus: t.activeGoal ? t.activeGoal.status : null,
    branchOf: t.branchOf || null,
  }));
}

export function threadRowMenu(anchor, row) {
  openPopup(anchor, (api) => {
    const wrap = document.createElement("div");
    wrap.appendChild(popupTitle(row.title));
    const t = store.state.threads[row.id];
    wrap.appendChild(popupRow({ icon: icon("pin", 13), label: t.pinned ? "Unpin" : "Pin", onClick: () => { t.pinned = !t.pinned; store.emit("thread"); closePopup(); } }));
    wrap.appendChild(popupRow({ icon: icon("edit", 13), label: "Rename", onClick: () => {
      // Rename stays inside the popup family — in-place stage, no native dialog.
      const stage = document.createElement("div");
      stage.appendChild(popupTitle("Rename thread"));
      const field = document.createElement("input");
      field.type = "text";
      field.value = t.title;
      field.className = "fwc-rename-input";
      field.setAttribute("aria-label", "Thread name");
      const save = document.createElement("button");
      save.className = "pm-btn";
      save.dataset.variant = "primary";
      save.textContent = "Save";
      const commit = () => {
        const name = field.value.trim();
        if (name) { t.title = name; store.emit("thread"); }
        closePopup();
      };
      save.addEventListener("click", commit);
      field.addEventListener("keydown", (e) => { if (e.key === "Enter") commit(); });
      const rowEl = document.createElement("div");
      rowEl.className = "fwc-rename-row";
      rowEl.append(field, save);
      stage.appendChild(rowEl);
      api.replace(stage);
      field.focus();
      field.select();
    } }));
    wrap.appendChild(popupRow({ icon: icon("drawer", 13), label: t.archived ? "Unarchive" : "Archive", onClick: () => { t.archived = !t.archived; store.emit("thread"); closePopup(); } }));
    wrap.appendChild(popupRow({ icon: icon("file", 13), label: "Export", sub: "Writes a Project-backed export", onClick: () => { store.addReceipt({ kind: "thread", title: `Exported ${t.title}`, detail: "Export saved to the Project's exports folder." }); closePopup(); } }));
    wrap.appendChild(popupSep());
    wrap.appendChild(popupRow({ icon: icon("branch", 13), label: "Branch from latest", onClick: () => { const m = t.messages[t.messages.length - 1]; if (m) { store.selectThread(t.id); store.branchFrom(m.id); } closePopup(); } }));
    if (!t.archived) wrap.appendChild(popupRow({ icon: icon("close", 13), label: "Delete", sub: "Archives first — restore from Archive", onClick: () => { t.archived = true; store.emit("thread"); closePopup(); } }));
    return wrap;
  });
}

// ---------------------------------------------------------------------------
// History geometry controller — enforces the canonical state machine and the
// spare-space-first / compact-fallback / floor rules via an observed width.
// Window concepts supply DOM callbacks; controller decides the effective state.
// ---------------------------------------------------------------------------
export function createHistoryController({ container, fullWidth = 248, compactWidth = 68, apply }) {
  let observed = 0;
  const ro = new ResizeObserver((entries) => {
    for (const e of entries) observed = e.contentRect.width;
    evaluate();
  });
  ro.observe(container);

  function evaluate() {
    const requested = store.state.historyRequested;
    let effective = store.state.historyState;
    if (requested === "pinned-full") {
      // Fit full history + chat floor + (artifact if open)? Artifact pressure is
      // decided by the window concept via extraPressure().
      const needs = CHAT_FLOOR + fullWidth + (typeof apply.extraPressure === "function" ? apply.extraPressure() : 0);
      const fits = observed >= needs;
      effective = fits ? "pinned-full" : "pinned-compact";
      if (effective !== store.state.historyState) {
        store.state.historyState = effective;
        store.emit("history");
        return; // re-render comes through the history event
      }
    }
    apply.render(effective, observed);
  }

  const un = [
    store.on("history", evaluate),
    store.on("thread", evaluate),
    store.on("question", evaluate),
    store.on("artifact", evaluate),
    store.on("chat-width", evaluate),
  ];

  return {
    evaluate,
    destroy() { ro.disconnect(); un.forEach((u) => u()); },
  };
}

// ---------------------------------------------------------------------------
// Chat header duties — thread identity, search, history toggle, artifact
// presence, pop-out, kebab. Window concepts arrange/skin the parts.
// ---------------------------------------------------------------------------
export function buildHeaderParts(ctx) {
  const parts = {};

  parts.title = document.createElement("button");
  parts.title.className = "fwc-thread-title";
  parts.title.setAttribute("aria-label", "Thread");
  syncTitle();
  function syncTitle() {
    const t = store.thread;
    parts.title.innerHTML = `${icon("thread", 14)}<span>${escapeHtml(t ? t.title : "")}</span>${t && t.branchOf ? `<span class="fwc-branch-flag">branch</span>` : ""}`;
  }

  parts.search = document.createElement("div");
  createSearchBar(parts.search, { compact: true });

  parts.historyToggle = document.createElement("button");
  parts.historyToggle.className = "fwc-head-btn";
  parts.historyToggle.setAttribute("aria-label", "Thread history");
  parts.historyToggle.innerHTML = icon("history", 15);
  parts.historyToggle.addEventListener("click", () => {
    const cur = store.state.historyState;
    store.setHistory(cur === "closed" ? "peek" : cur === "peek" ? "pinned-full" : "closed");
  });
  parts.historyToggle.addEventListener("mouseenter", () => {
    if (store.state.historyState === "closed") {
      parts._peekTimer = setTimeout(() => { if (store.state.historyState === "closed") store.setHistory("peek", { requested: false }); }, 350);
    }
  });
  parts.historyToggle.addEventListener("mouseleave", () => clearTimeout(parts._peekTimer));

  parts.mountToggle = document.createElement("button");
  parts.mountToggle.className = "fwc-head-btn";
  syncMount();
  parts.mountToggle.addEventListener("click", () => ctx.requestMountChange(ctx.mount === "docked" ? "popout" : "docked"));
  function syncMount() {
    const docked = ctx.mount === "docked";
    parts.mountToggle.setAttribute("aria-label", docked ? "Pop out chat" : "Dock chat");
    parts.mountToggle.innerHTML = icon(docked ? "popout" : "dockin", 15);
  }

  parts.kebab = document.createElement("button");
  parts.kebab.className = "fwc-head-btn";
  parts.kebab.setAttribute("aria-label", "Thread menu");
  parts.kebab.innerHTML = icon("more", 15);
  parts.kebab.addEventListener("click", () => openThreadKebab(parts.kebab));

  const un = [store.on("thread", syncTitle)];
  parts.destroy = () => un.forEach((u) => u());
  return parts;
}

function openThreadKebab(anchor) {
  openPopup(anchor, () => {
    const wrap = document.createElement("div");
    const t = store.thread;
    wrap.appendChild(popupTitle("This thread"));
    wrap.appendChild(popupRow({ icon: icon("snapshot", 13), label: "Create restore point", onClick: () => { store.createRestorePoint(); closePopup(); } }));
    wrap.appendChild(popupRow({ icon: icon("branch", 13), label: "Branch from latest", onClick: () => { const m = t.messages[t.messages.length - 1]; if (m) store.branchFrom(m.id); closePopup(); } }));
    wrap.appendChild(popupRow({ icon: icon("swap", 13), label: "Request from another thread", sub: "Typed, bounded, idempotent", onClick: () => { import("./triggers.js").then(({ fireTrigger }) => { fireTrigger("thread.request"); fireTrigger("thread.await"); }); closePopup(); } }));
    wrap.appendChild(popupRow({ icon: icon("subagent", 13), label: "Spawn child thread", onClick: () => { import("./triggers.js").then(({ fireTrigger }) => fireTrigger("thread.spawn")); closePopup(); } }));
    if (t.restorePoints && t.restorePoints.length) {
      wrap.appendChild(popupSep());
      wrap.appendChild(popupTitle("Restore points — immutable"));
      for (const rp of t.restorePoints.slice(-3)) {
        wrap.appendChild(popupRow({ icon: icon("clock", 13), label: rp.label, sub: `Branch from here to use it`, onClick: () => { store.addReceipt({ kind: "restore", title: `Branched from ${rp.label}`, detail: "Restore points are immutable; using one creates a branch." }); closePopup(); } }));
      }
    }
    wrap.appendChild(popupSep());
    wrap.appendChild(popupNote("Operational state"));
    wrap.appendChild(popupRow({ icon: icon("worktree", 13), label: "Worktrees, ports, tests", sub: "Compact summaries and details", onClick: () => { openOpsDetails(anchor); } }));
    wrap.appendChild(popupRow({ icon: icon("gauge", 13), label: "Provider capacity forecast", sub: "Sustainable pace, not just the hard max", onClick: () => { openCapacity(anchor); } }));
    wrap.appendChild(popupRow({ icon: icon("log", 13), label: "Receipts", sub: "Compaction, approvals, grants, completions", onClick: () => { openReceipts(anchor); } }));
    return wrap;
  });
}

function openOpsDetails(anchor) {
  import("./data.js").then(({ OPERATIONAL }) => {
    openPopup(anchor, () => {
      const wrap = document.createElement("div");
      wrap.appendChild(popupTitle("Operational state — compact view"));
      for (const w of OPERATIONAL.worktrees) {
        wrap.appendChild(popupRow({ icon: icon("worktree", 13), label: `${w.branch}`, sub: `${w.owner} · ${w.state}`, onClick: () => {} }));
      }
      for (const p of OPERATIONAL.ports) {
        wrap.appendChild(popupRow({ icon: icon("port", 13), label: `Port ${p.port} — ${p.owner}`, sub: p.state + (p.detail ? ` · ${p.detail}` : ""), onClick: () => {} }));
      }
      wrap.appendChild(popupRow({ icon: icon("test", 13), label: `Tests: ${OPERATIONAL.tests.passed} passed · ${OPERATIONAL.tests.failed} failed`, sub: OPERATIONAL.tests.failing.join(", "), onClick: () => {} }));
      wrap.appendChild(popupRow({ icon: icon("debug", 13), label: OPERATIONAL.debug.session, sub: `${OPERATIONAL.debug.state} · ${OPERATIONAL.debug.location}`, onClick: () => {} }));
      wrap.appendChild(popupRow({ icon: icon("backup", 13), label: OPERATIONAL.backups[0].name, sub: `${OPERATIONAL.backups[0].size}`, onClick: () => {} }));
      for (const sn of OPERATIONAL.snapshots) {
        wrap.appendChild(popupRow({ icon: icon("snapshot", 13), label: sn.name, sub: "Restore points are immutable", onClick: () => {} }));
      }
      wrap.appendChild(popupNote(`Host: CPU ${OPERATIONAL.resources.cpu} · Memory ${OPERATIONAL.resources.memory} · ${OPERATIONAL.resources.disk}`));
      return wrap;
    }, { width: 330, forceReopen: true });
  });
}

function openCapacity(anchor) {
  import("./data.js").then(({ OPERATIONAL }) => {
    const f = OPERATIONAL.forecast;
    openPopup(anchor, () => {
      const wrap = document.createElement("div");
      wrap.appendChild(popupTitle(`Capacity — ${f.provider}`));
      wrap.appendChild(popupNote(`${f.usedPercent}% of the window used · resets in ${f.windowResetMinutes} minutes`));
      wrap.appendChild(popupRow({ icon: icon("crew", 13), label: f.sustainable, sub: f.waves, onClick: () => {} }));
      wrap.appendChild(popupNote(`${f.note}. Low usage queues or reduces waves — it never silently downgrades the planner.`));
      return wrap;
    }, { width: 300, forceReopen: true });
  });
}

function openReceipts(anchor) {
  openPopup(anchor, () => {
    const wrap = document.createElement("div");
    wrap.appendChild(popupTitle("Receipts"));
    const receipts = store.state.receipts.slice(-10).reverse();
    if (!receipts.length) wrap.appendChild(popupNote("No receipts yet in this session."));
    for (const r of receipts) {
      wrap.appendChild(popupRow({ icon: icon("check", 13), label: r.title, sub: r.detail || "", onClick: () => {} }));
    }
    return wrap;
  }, { width: 330, forceReopen: true });
}

// ---------------------------------------------------------------------------
// Artifact host duties — lifecycle chrome data. Window concepts render frames.
// ---------------------------------------------------------------------------
export function artifactInfo() {
  const s = store.state;
  const t = store.thread;
  const open = s.artifact.openId ? (t.artifacts || []).find((a) => a.id === s.artifact.openId) : null;
  return {
    openId: s.artifact.openId,
    status: s.artifact.status,
    meta: open || null,
    list: t.artifacts || [],
  };
}

export function artifactMenu(anchor) {
  openPopup(anchor, () => {
    const wrap = document.createElement("div");
    const t = store.thread;
    wrap.appendChild(popupTitle("Artifacts in this thread"));
    if (!(t.artifacts || []).length) wrap.appendChild(popupNote("No artifacts yet."));
    for (const a of t.artifacts || []) {
      wrap.appendChild(popupRow({
        icon: icon(a.kind === "multi-file diff" ? "diff" : a.kind === "report document" ? "report" : a.kind === "test capture" ? "image" : "file", 13),
        label: a.title, sub: `${a.kind} · ${a.projectPath}`,
        selected: store.state.artifact.openId === a.id,
        onClick: () => { store.openArtifact(a.id); closePopup(); },
      }));
    }
    wrap.appendChild(popupSep());
    wrap.appendChild(popupNote("Artifacts are Project-backed. Opening one does not admit it into model context."));
    return wrap;
  });
}
