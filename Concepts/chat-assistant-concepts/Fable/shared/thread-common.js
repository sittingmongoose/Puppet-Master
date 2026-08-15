// Fable — thread-concept common logic: transcript slices, virtualization, scroll
// anchoring, long-message collapse, work-cluster data, questionnaire access.
// Thread concepts consume this and render genuinely distinct compositions.

import { store } from "./store.js";
import { escapeHtml } from "./popup.js";

export const LONG_MESSAGE_CHARS = 620;   // collapse-eligible threshold for completed prose

// ---------------------------------------------------------------------------
// Transcript slice — respects virtualization (older history stays unloaded
// until search jump or explicit load). Search still covers everything.
// ---------------------------------------------------------------------------
export function transcriptSlice(threadId = store.state.currentThreadId) {
  const t = store.state.threads[threadId];
  const visible = Math.min(t.messages.length, t.initialVisibleMessageCount || 50);
  const start = t.messages.length - visible;
  return {
    messages: t.messages.slice(start),
    olderCount: start,
    loadOlder(count = 30) {
      t.initialVisibleMessageCount = Math.min(t.messages.length, visible + count);
      store.emit("transcript", { loadedOlder: true });
    },
  };
}

export function isLongMessage(m) {
  return (m.collapsedByDefault || (m.body || "").length > LONG_MESSAGE_CHARS);
}

export function isExpanded(m) {
  const v = store.view;
  if (v.expandedMessages[m.id] != null) return v.expandedMessages[m.id];
  return !isLongMessage(m);
}

export function previewText(m, chars = 340) {
  const body = m.body || "";
  if (body.length <= chars) return body;
  const cut = body.slice(0, chars);
  const at = cut.lastIndexOf(" ");
  return cut.slice(0, at > chars - 60 ? at : chars) + "…";
}

export function lensMark(m) {
  return store.lensState.selections[m.id] || null;
}

export function searchHit(m) {
  const a = store.state.search.activeResult;
  return a && a.messageId === m.id && Date.now() - a.at < 6000;
}

export function copyMessage(m) {
  // Copy always uses full canonical content, never the collapsed preview.
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(m.body).catch(() => {});
  store.addReceipt({ kind: "copy", title: "Copied message", detail: `${m.body.length} characters — full canonical text.` });
}

// ---------------------------------------------------------------------------
// Work cluster data for the current thread (Goal, Todo, subagents, diffs,
// live turn activity). Any subset may exist; concepts show only active parts.
// ---------------------------------------------------------------------------
export function workCluster(threadId = store.state.currentThreadId) {
  const t = store.state.threads[threadId];
  const turn = store.state.turns[threadId];
  return {
    goal: t.activeGoal || null,
    todo: t.todo || null,
    subagents: (t.subagentGroups || [])[0] || null,
    diffs: t.diffGroups || [],
    turn: turn && turn.active ? turn : null,
    crew: store.state.crew,
    isEmpty: !t.activeGoal && !t.todo && !(t.subagentGroups || []).length && !(t.diffGroups || []).length && !(turn && turn.active),
  };
}

// ---------------------------------------------------------------------------
// Live-phase contract (video 3): the active turn exposes a phase kind, a label,
// detail rows that accumulate within the phase, and the kind sequence so far.
// Concepts render these in their own voice; the data is shared.
// ---------------------------------------------------------------------------
export const PHASE_KIND_ICONS = {
  thinking_summary: "eye", search: "search", read: "file", fetch: "cloud",
  browser: "browser", test: "test", edit: "edit", generate: "spark",
  thought: "eye", exploration: "search", import: "cloud", asset: "image",
};

export function liveTurn(threadId = store.state.currentThreadId) {
  const turn = store.state.turns[threadId];
  if (!turn || !turn.active) return null;
  return {
    summary: turn.summary,
    phaseKind: turn.phaseKind || "generate",
    items: turn.liveItems || [],
    phaseKinds: turn.phaseKinds || [],
    workedSeconds: turn.workedSeconds,
    redirected: !!turn.redirected,
  };
}

// ---------------------------------------------------------------------------
// Scroll keeper — anchor preservation and truthful follow behavior.
// ---------------------------------------------------------------------------
export function createScrollKeeper(scrollEl) {
  let atBottom = true;
  let raf = null;

  scrollEl.addEventListener("scroll", () => {
    atBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 24;
  }, { passive: true });

  // Environment changes (theme, chat width) can reflow the whole transcript.
  // If the reader was at the bottom, keep them there; the anchor survives.
  let wasAtBottomForEnv = true;
  const unWill = store.on("env-will-change", () => {
    if (!scrollEl.isConnected) { unWill(); unDid(); return; }
    wasAtBottomForEnv = atBottom;
  });
  const unDid = store.on("env-change", () => {
    if (!scrollEl.isConnected) { unWill(); unDid(); return; }
    if (wasAtBottomForEnv) {
      requestAnimationFrame(() => {
        scrollEl.scrollTop = scrollEl.scrollHeight;
        atBottom = true;
        scrollEl.dispatchEvent(new Event("scroll"));
      });
    }
  });

  return {
    get atBottom() { return atBottom; },
    // Preserve the current anchor across a DOM mutation (expansion, insert above).
    preserve(fn) {
      const marker = topVisible();
      fn();
      if (marker) {
        const el = scrollEl.querySelector(`[data-mid="${marker.id}"]`);
        if (el) scrollEl.scrollTop = el.offsetTop - marker.offset;
      }
    },
    followIfAtBottom(smooth = false) {
      if (atBottom) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          // Smooth follow lets the surrounding thread visibly yield while a new
          // message arrives (video 1's shared-motion principle). Reduced motion
          // lands instantly.
          const rm = document.documentElement.getAttribute("data-reduced-motion") === "1";
          if (smooth && !rm && scrollEl.scrollTo) scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: "smooth" });
          else scrollEl.scrollTop = scrollEl.scrollHeight;
        });
      }
    },
    jumpToLatest() {
      scrollEl.scrollTop = scrollEl.scrollHeight;
      atBottom = true;
    },
    scrollToMessage(mid) {
      const el = scrollEl.querySelector(`[data-mid="${mid}"]`);
      if (el) {
        scrollEl.scrollTop = el.offsetTop - Math.max(20, scrollEl.clientHeight * 0.25);
        el.classList.add("fwt-search-hit");
        setTimeout(() => el.classList.remove("fwt-search-hit"), 3200);
      }
    },
  };

  function topVisible() {
    const rows = scrollEl.querySelectorAll("[data-mid]");
    const top = scrollEl.scrollTop;
    for (const r of rows) {
      if (r.offsetTop + r.offsetHeight > top) return { id: r.dataset.mid, offset: r.offsetTop - top };
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// Questionnaire helpers — canonical queue semantics; rendering is per concept.
// ---------------------------------------------------------------------------
export function questionnaireState(threadId = store.state.currentThreadId) {
  const t = store.state.threads[threadId];
  const active = (t.questionnaires || []).find((q) => q.status === "incomplete" || q.status === "preparing" || q.status === "submitting") || null;
  const queued = (t.questionnaires || []).filter((q) => q.status === "queued");
  const resolved = (t.questionnaires || []).filter((q) => q.status === "submitted" || q.status === "cancelled");
  return { active, queued, resolved };
}

export function questionProgress(q) {
  const answered = q.questions.filter((x) => (x.selected && x.selected.length) || q.skipped[x.id]).length;
  return { answered, total: q.questions.length, current: q.currentQuestionIndex };
}

export function validateSubmit(q) {
  return q.questions.filter((x) => x.required && !q.skipped[x.id] && (!x.selected || !x.selected.length)).map((x) => x.id);
}

// ---------------------------------------------------------------------------
// Activity history data — completed execution groups condensed but reopenable.
// ---------------------------------------------------------------------------
export function activityGroups(m) {
  const groups = [];
  if (m.activityGroup) groups.push({ kind: "activity", group: m.activityGroup });
  if (m.thoughtSegments) groups.push({ kind: "thoughts", segments: m.thoughtSegments });
  if (m.completedQuestionnaire) groups.push({ kind: "questionnaire", record: m.completedQuestionnaire });
  return groups;
}

export function bodyHtml(m) {
  // Prose rendering: escape, keep paragraphs, mark inline code spans.
  const safe = escapeHtml(m.body || "");
  return safe
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br>").replace(/`([^`]+)`/g, "<code>$1</code>")}</p>`)
    .join("");
}
