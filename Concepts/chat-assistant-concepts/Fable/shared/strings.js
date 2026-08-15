// Fable — mandated verbatim strings. Single source of truth; concepts never retype these.
// Sources: 02_FIXED_PRODUCT_BEHAVIOR.md, 03_CUMULATIVE_THREAD_DECISIONS.md, machine registers.

export const MODEL_LABEL = "Fable";

export const THEMES = [
  { id: "friendly-dark", label: "Friendly Dark" },
  { id: "friendly-light", label: "Friendly Light" },
  { id: "retro-dark", label: "Retro Dark" },
  { id: "retro-light", label: "Retro Light" },
  { id: "basic-dark", label: "Basic Dark" },
  { id: "basic-light", label: "Basic Light" },
  { id: "glass-dark", label: "Glass Dark" },
  { id: "glass-light", label: "Glass Light" },
];

export const WIDTH_PRESETS = [
  { px: 520, label: "Minimum" },
  { px: 750, label: "Normal" },
  { px: 975, label: "Wider" },
  { px: 1200, label: "Wide" },
];

// Message action rows — exact composition and order.
export const ASSISTANT_ACTION_ROW = ["Copy", "Provider", "Model", "Worked", "More Info"];
export const USER_ACTION_ROW = ["Copy", "Edit", "Provider", "Model", "Worked", "More Info"];

// More Info fields (14).
export const MORE_INFO_FIELDS = [
  "Timestamp", "Started", "Completed", "Worked for", "Total elapsed", "Mode",
  "Provider", "Model", "Effort", "Persona", "Tokens", "Context",
  "Estimated cost", "Turn identity",
];

export const SEARCH_SCOPES = [
  { id: "thread", label: "Current Thread" },
  { id: "all", label: "All Threads" },
];

export const LENS_MODES = ["Mute", "Focus", "Subcompact", "Turn Off"];
export const LENS_APPLY_MAX = 25;

export const RING_ACTIONS = { compact: "Compact Now", details: "More Details" };

export const GOAL_CONTROLS = ["View", "Edit", "Pause", "Resume", "Stop", "Clear"];
export const GOAL_SECTIONS = ["Tasks", "Subgoals", "Evidence", "Logs"];
export const GOAL_STATUSES = ["Running", "Paused", "Stopped", "Blocked", "Complete"];

export const TODO_STATES = [
  "pending", "running", "verifying", "complete", "blocked",
  "failed", "skipped", "cancelled", "stale", "replanned",
];
export const TODO_STATE_LABELS = {
  pending: "Pending", running: "Running", verifying: "Verifying", complete: "Complete",
  blocked: "Blocked", failed: "Failed", skipped: "Skipped", cancelled: "Cancelled",
  stale: "Stale", replanned: "Replanned",
};

export const HISTORY_STATES = ["closed", "peek", "pinned-compact", "pinned-full"];
export const HISTORY_STATE_LABELS = {
  closed: "Closed", peek: "Transient peek", "pinned-compact": "Pinned compact", "pinned-full": "Pinned full",
};

export const ACCESS_MODES = ["Ask for approval", "Auto accept edits", "Auto", "Full Access"];
export const EFFECTIVE_LIMIT_TEMPLATE = (mode, cause) => `${mode} · Limited by ${cause}`;

export const CONVERSATION_MODES = ["Agent", "Plan", "Review"];

export const BSD_VALUES = [
  { id: "off", label: "Off" },
  { id: "auto", label: "Auto", note: "default" },
  { id: "on", label: "On" },
];
export const BSD_STATES = [
  "idle", "evaluating", "silent result", "advice", "duplicate-suppressed",
  "timeout", "unavailable", "quota-limited",
];
export const BSD_STATE_LABELS = {
  idle: "Idle", evaluating: "Evaluating", "silent result": "Silent result", advice: "Advice",
  "duplicate-suppressed": "Duplicate suppressed", timeout: "Timed out",
  unavailable: "Unavailable", "quota-limited": "Quota limited",
};
export const BSD_SCOPES = ["This turn", "Current thread"];

export const WARNING_ACTIONS = ["Continue here", "Branch with new model", "Start new chat", "Cancel", "Details"];

export const CROSS_THREAD_RESULT_ACTIONS = ["Open conversation", "Add passage to context", "Branch from this point", "Copy link"];

export const GRANT_SCOPES = ["Once", "Thread", "Goal/PlanningRun", "Persistent project pair"];

export const BRANCH_OPS = [
  "Branch from here", "Branch with model", "Branch with Persona",
  "Create restore point", "Rewind", "Re-answer as sibling",
];

export const ATTACHMENT_CLASSES = ["Native", "PM transformed", "Alternate model", "Unsupported"];

export const SYNC_STATES = [
  "Cached", "Synchronizing", "Live", "Offline", "Queued to send",
  "Reconnect", "Replay", "Snapshot catch-up", "Server work continuing",
];

export const PROVIDER_SETUP_STATES = [
  "CLI not found", "Sign-in needed", "API key needed", "Usage unavailable",
  "Account model unavailable", "Update or repair required", "Scheduled update",
  "Verification", "Rollback", "Repair",
];

export const FREE_MODEL_STATES = ["Ready", "Setup needed", "Cooling down", "No longer free", "Unavailable"];

export const RECOVERY_CLASSES = [
  "Truncation spill", "Already applied", "No match", "Ambiguity locations",
  "Formatter change", "Deferred diagnostics", "Retry fallback", "Retained patch",
];

export const BROWSER_VOCABULARY = {
  workspace: "BrowserWorkspace",
  action: "Browser Action",
  program: "Browser Program",
  expert: "Expert Browser Program",
};

export const SPELL_ACTIONS = ["Replace once", "Ignore once", "Ignore for draft", "Add to personal dictionary", "Add to project dictionary"];
export const SPELL_SOURCES = ["Automatic (OS then PM local)", "System only", "PM local only"];

export const TOOL_LIFECYCLE = ["installed", "enabled", "available", "selected for this request", "actually invoked"];
export const TOOL_LIFECYCLE_LABELS = {
  installed: "Installed", enabled: "Enabled", available: "Available",
  "selected for this request": "Selected for this request", "actually invoked": "Actually invoked",
};

export const CAPABILITY_LABELS = ["Supported", "Unsupported", "Likely", "Unverified", "Temporarily unavailable", "PM transformed", "Alternate route"];

export const PICKER_SECTIONS = ["Favorites", "Recents"];

export const APPROVAL_PATTERN = "Compact decision; expandable evidence";

export const QUESTIONNAIRE_ACTIONS = {
  skip: "Skip", cancel: "Cancel questionnaire", submit: "Submit",
  back: "Back", next: "Next", answerLater: "Return to skipped",
};

export const COMPOSER = {
  placeholder: "Message the agent",
  send: "Send",
  stop: "Stop",
  queuedNote: "Will steer the active turn",
};

export const JUMP_TO_LATEST = "Jump to latest";

// Human labels for the deterministic trigger families (raw dotted ids stay in data attributes).
export const TRIGGER_LABELS = {
  "history.closed": "History closed", "history.peek": "History peek",
  "history.pinned_full": "History pinned full", "history.pinned_compact": "History pinned compact",
  "artifact.loading": "Artifact loading", "artifact.ready": "Artifact ready",
  "artifact.updated": "Artifact updated", "artifact.error": "Artifact error", "artifact.retry": "Artifact retry",
  "question.preparing": "Questions preparing", "question.open": "Question open",
  "question.answer": "Answer question", "question.skip": "Skip question",
  "question.cancel": "Cancel questionnaire", "question.submit": "Submit answers",
  "goal.start": "Goal starts", "goal.pause": "Goal pauses", "goal.resume": "Goal resumes",
  "goal.replan": "Goal replans", "goal.block": "Goal blocks", "goal.recover": "Goal recovers",
  "goal.stop": "Goal stops", "goal.complete": "Goal completes",
  "todo.all_states": "Todos in every state", "subagent.all_states": "Subagents in every state",
  "crew.waves": "Crew waves", "activity.advance": "Activity advances",
  "diff.create": "Diff created", "diff.update": "Diff updated",
  "approval.request": "Approval requested", "route.warning": "Route warning",
  "attachment.native": "Attachment native", "attachment.transformed": "Attachment transformed",
  "attachment.alternate": "Attachment alternate route", "attachment.unsupported": "Attachment unsupported",
  "context.lens": "Context Lens selection", "context.compact_now": "Compact Now",
  "thread.request": "Thread request", "thread.await": "Thread await",
  "thread.spawn": "Thread spawn", "thread.branch": "Thread branch",
  "thread.rewind": "Thread rewind", "thread.restore": "Thread restore point",
  "turn.redirect": "Redirect active turn", "cross_project.grant": "Cross-project grant",
  "resource.port_collision": "Port collision", "resource.worktree_collision": "Worktree collision",
  "resource.test_debug_state": "Test and debug detail",
  "bsd.off": "BSD off", "bsd.auto_idle": "BSD auto idle", "bsd.auto_active": "BSD auto evaluating",
  "bsd.on": "BSD on", "bsd.silent": "BSD silent result", "bsd.advice": "BSD advice",
  "bsd.timeout": "BSD timeout", "bsd.unavailable": "BSD unavailable",
  "provider.setup": "Provider setup", "provider.update": "Provider update", "provider.rollback": "Provider rollback",
  "network.offline": "Network offline", "network.reconnect": "Network reconnect",
  "network.replay": "Network replay", "network.snapshot": "Snapshot catch-up",
  "notification.inline_outcome": "Inline outcome", "scenario.reset": "Reset scenario",
  // v2 contract events (correction packet)
  "history.pin_compact": "History pinned compact", "history.pin_full": "History pinned full",
  "history.unpin": "History unpinned", "history.switch_thread": "Switch to next thread",
  "question.prepare": "Questions preparing", "question.select": "Select an answer",
  "question.next": "Next question", "question.validation_error": "Required-answer error",
  "goal.progress": "Goal phase advances", "goal.update": "Goal update proposed",
  "goal.blocked": "Goal blocks",
  "todo.add": "Add a task", "todo.complete": "Complete a task",
  "todo.reopen": "Reopen a task", "todo.block": "Block a task",
  "subagent.spawn": "Spawn a child", "subagent.queue": "Queue a child",
  "subagent.progress": "Child progresses", "subagent.complete": "Child completes",
  "subagent.fail": "Child fails", "subagent.retry": "Child retries",
  "activity.thinking_summary": "Thinking summary phase", "activity.search": "Search phase",
  "activity.read": "Read phase", "activity.fetch": "Web fetch phase",
  "activity.browser": "Browser check phase", "activity.test": "Test phase",
  "activity.edit": "Edit phase", "activity.generate": "Generate phase",
  "diff.open": "Open the diff",
  "artifact.switch": "Switch artifact", "artifact.close": "Close artifact",
  "decision.approval_open": "Approval opens", "decision.details": "Toggle decision details",
  "decision.approve": "Approve", "decision.deny": "Deny", "decision.branch": "Branch from warning",
  "thread.send_request": "Send thread request", "thread.receive_response": "Receive thread response",
  "thread.spawn_related": "Spawn related thread",
  "system.port_collision": "Port collision (4173)", "system.worktree_collision": "Worktree collision",
  "system.reset": "Reset to initial state",
  "warning.cache_replay": "Cache-replay warning", "warning.video_route": "Video vision-route warning",
  "warning.capacity": "Capacity warning",
};

// Format helpers — durations and timestamps (UTC stored, locale rendered).
export function fmtDuration(seconds) {
  if (seconds == null || isNaN(seconds)) return "";
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60), rs = s % 60;
  if (m < 60) return rs ? `${m}m ${rs}s` : `${m}m`;
  const h = Math.floor(m / 60), rm = m % 60;
  return rm ? `${h}h ${rm}m` : `${h}h`;
}

export function fmtTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function fmtDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function fmtRelative(iso, nowIso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const now = nowIso ? new Date(nowIso).getTime() : Date.now();
  const diff = Math.max(0, now - then);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function fmtTokens(n) {
  if (n == null) return "";
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

// Working/Worked verb per packet: "Working for" while active, "Worked for" terminal.
export function workedLabel(active, seconds) {
  return `${active ? "Working for" : "Worked for"} ${fmtDuration(seconds)}`;
}
