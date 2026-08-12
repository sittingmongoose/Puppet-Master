export const MODEL_LABEL = "5.6 Sol";
export const STORAGE_KEY = "pm.assistant-chat.5-6-sol.state.v1";

export const THEMES = [
  { id: "friendly-dark", label: "Friendly Dark" },
  { id: "friendly-light", label: "Friendly Light" },
  { id: "retro-dark", label: "Retro Dark" },
  { id: "retro-light", label: "Retro Light" },
  { id: "basic-dark", label: "Basic Dark" },
  { id: "basic-light", label: "Basic Light" },
  { id: "glass-dark", label: "Glass Dark" },
  { id: "glass-light", label: "Glass Light" }
];

export const WIDTHS = [520, 750, 975, 1200];

export const WINDOW_CONCEPTS = [
  { id: "window-01", short: "W1", title: "Atlas Folio", thesis: "Bound reading leaf, folio history gutter, and left foldout artifact plates." },
  { id: "window-02", short: "W2", title: "Stage Bay", thesis: "Conversation as the performance, history as backstage cues, artifacts as scenes." },
  { id: "window-03", short: "W3", title: "Signal House", thesis: "Ruled dispatch lane, route-board history, and a separate instrument table." },
  { id: "window-04", short: "W4", title: "Lens Chamber", thesis: "Conversation aperture, perimeter history, and calibrated artifact plate." },
  { id: "window-05", short: "W5", title: "Field Desk", thesis: "Protected correspondence column, artifact work board, and index drawer." },
  { id: "window-06", short: "W6", title: "Tidal Shelf", thesis: "Steady conversation current, history reservoir, and left artifact bank." },
  { id: "window-07", short: "W7", title: "Concourse", thesis: "Main reading passage, history mezzanine, and left artifact hall." },
  { id: "window-08", short: "W8", title: "Quiet Frame", thesis: "Exact typographic frame with measurement-gutter history and borderless artifacts." }
];

export const THREAD_CONCEPTS = [
  { id: "thread-01", short: "T1", title: "Edition", thesis: "Long-form publication with work notes and facing-page questions." },
  { id: "thread-02", short: "T2", title: "Dialogue Score", thesis: "Speaker score with independent work staves and question measures." },
  { id: "thread-03", short: "T3", title: "Timefield", thesis: "Readable prose anchored to worked, waiting, and completion intervals." },
  { id: "thread-04", short: "T4", title: "Branchbook", thesis: "Continuous active narrative with explicit ancestry and revision layers." },
  { id: "thread-05", short: "T5", title: "Workshop", thesis: "Studio journal with object-specific tool drawers and pinned briefs." },
  { id: "thread-06", short: "T6", title: "Braided", thesis: "Conversation, delegated work, and evidence as accountable strands." },
  { id: "thread-07", short: "T7", title: "Relay", thesis: "Parent conversation course with truthful handoffs, queues, and synthesis." },
  { id: "thread-08", short: "T8", title: "Quiet Current", thesis: "Radically calm single-column reading with precise system runlines." }
];

export const ACCESS_OPTIONS = ["Ask for approval", "Auto accept edits", "Auto", "Full Access"];
export const BSD_OPTIONS = ["Off", "Auto", "On"];
export const SEARCH_SCOPES = ["Current Thread", "All Threads"];
export const HISTORY_MODES = ["closed", "peek", "pinned compact", "pinned full"];
export const ARTIFACT_STATES = ["closed", "loading", "ready", "updated", "error"];

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function humanize(value) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatLocalTime(value) {
  if (!value) return "Time unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}

export function formatDuration(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  if (safe < 60) return `${Math.round(safe)}s`;
  const minutes = Math.floor(safe / 60);
  const remainder = Math.round(safe % 60);
  return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

export function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, Number(value) || minimum));
}

export function byId(items, id, fallbackIndex = 0) {
  return items.find((item) => item.id === id) ?? items[fallbackIndex];
}

export function stableId(prefix, counter) {
  return `${prefix}-${String(counter).padStart(4, "0")}`;
}
