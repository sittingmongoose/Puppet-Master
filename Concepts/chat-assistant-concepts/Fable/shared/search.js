// Fable — search over complete stored history, including unloaded/virtualized
// content. Human search always uses canonical stored text (full bodies, even when
// a message is visually collapsed or outside the rendered slice), and never
// changes Context Lens state.

import { store } from "./store.js";

function snippet(body, query, radius = 46) {
  const i = body.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return body.slice(0, radius * 2);
  const start = Math.max(0, i - radius);
  const end = Math.min(body.length, i + query.length + radius);
  return (start > 0 ? "…" : "") + body.slice(start, end) + (end < body.length ? "…" : "");
}

export function runSearch(query, scope) {
  const q = (query || "").trim();
  if (q.length < 2) return [];
  const s = store.state;
  const results = [];
  const threadIds = scope === "all" ? s.threadOrder : [s.currentThreadId];
  for (const tid of threadIds) {
    const t = s.threads[tid];
    for (let i = 0; i < t.messages.length; i++) {
      const m = t.messages[i];
      if (m.body && m.body.toLowerCase().includes(q.toLowerCase())) {
        results.push({
          threadId: tid, threadTitle: t.title, messageId: m.id, index: i,
          role: m.role, snippet: snippet(m.body, q),
          unloaded: i < t.messages.length - (t.initialVisibleMessageCount || 50),
        });
        if (results.length >= 80) return group(results, scope);
      }
    }
  }
  return group(results, scope);
}

function group(results, scope) {
  if (scope !== "all") return results;
  const byThread = new Map();
  for (const r of results) {
    if (!byThread.has(r.threadId)) byThread.set(r.threadId, { threadId: r.threadId, threadTitle: r.threadTitle, hits: [] });
    byThread.get(r.threadId).hits.push(r);
  }
  return [...byThread.values()];
}

// Jump: switches thread when needed, loads the required slice (extends the
// rendered window), and marks the exact message for highlight + anchor.
export function jumpToResult(result) {
  const s = store.state;
  if (result.threadId !== s.currentThreadId) store.selectThread(result.threadId);
  const t = s.threads[result.threadId];
  const visible = t.initialVisibleMessageCount || 50;
  const fromEnd = t.messages.length - result.index;
  if (fromEnd > visible) {
    // load the needed older slice — widen the window to include the hit plus context
    t.initialVisibleMessageCount = fromEnd + 10;
  }
  // Search inside hidden text reveals the matching region: a hit inside a
  // collapsed long message expands it before the jump.
  const view = s.view[result.threadId];
  if (view) view.expandedMessages[result.messageId] = true;
  s.search.activeResult = { threadId: result.threadId, messageId: result.messageId, at: Date.now() };
  store.emit("transcript", { jumpTo: result.messageId });
  store.emit("search");
}
