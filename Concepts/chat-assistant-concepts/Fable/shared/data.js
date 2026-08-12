// Fable — data layer: packet fixture adapter + authored extensions.
// The supplied fixture (15 threads / 400 messages) is a floor: it is loaded verbatim
// and extended, never thinned. Authored additions cover offline/replay, crew,
// branch/redirect, archived rows, goal-terminal states, and the provider catalog.

export async function loadFixture() {
  const res = await fetch(new URL("./fixture-demo-data.json", import.meta.url), { cache: "no-store" });
  if (!res.ok) throw new Error("fixture load failed: " + res.status);
  return res.json();
}

// ---------------------------------------------------------------------------
// Route catalog: Provider family → Account/Profile → Connection → Models.
// Same model under two accounts is two routes. Free Models is a grouping over
// real underlying routes, never a fake account.
// ---------------------------------------------------------------------------
export const PROVIDERS = [
  {
    id: "anthropic", name: "Anthropic",
    accounts: [
      {
        id: "anthropic-max", name: "jared — Max plan", connection: "Claude CLI",
        models: [
          { id: "fable-5", name: "Fable 5", available: true, effort: ["Low", "Medium", "High"], fast: true },
          { id: "opus-5", name: "Opus 5", available: true, effort: ["Low", "Medium", "High"], fast: true },
          { id: "sonnet-5", name: "Sonnet 5", available: true, effort: ["Low", "Medium"], fast: false },
        ],
      },
      {
        id: "anthropic-api", name: "Platyr — API key", connection: "Direct API",
        models: [
          { id: "fable-5", name: "Fable 5", available: true, effort: ["Low", "Medium", "High"], fast: false },
          { id: "opus-5", name: "Opus 5", available: true, effort: ["Low", "Medium", "High"], fast: false },
        ],
      },
    ],
  },
  {
    id: "openai", name: "OpenAI",
    accounts: [
      {
        id: "openai-team", name: "jared — Team", connection: "Codex CLI",
        models: [
          { id: "gpt-56-pro", name: "GPT-5.6 Pro", available: true, effort: ["Medium", "High"], fast: false },
          { id: "gpt-56-mini", name: "GPT-5.6 Mini", available: true, effort: [], fast: true },
        ],
      },
    ],
  },
  {
    id: "alibaba", name: "Alibaba",
    accounts: [
      {
        id: "alibaba-intl", name: "platyr-dev", connection: "Qwen CLI",
        models: [
          { id: "qwen-38", name: "Qwen 3.8", available: true, effort: ["Medium"], fast: true },
        ],
      },
    ],
  },
  {
    id: "google", name: "Google",
    accounts: [
      {
        id: "google-personal", name: "jared@platyr.com", connection: "Antigravity CLI",
        setupState: "Sign-in needed",
        models: [
          { id: "gemini-3-pro", name: "Gemini 3 Pro", available: false, reason: "Sign-in needed", effort: ["Medium", "High"], fast: false },
        ],
      },
    ],
  },
  {
    id: "moonshot", name: "Moonshot",
    accounts: [
      {
        id: "moonshot-free", name: "Free tier", connection: "Direct API",
        models: [
          { id: "kimi-k3", name: "Kimi K3", available: true, effort: [], fast: false },
        ],
      },
    ],
  },
  {
    id: "xai", name: "xAI",
    accounts: [
      {
        id: "xai-team", name: "platyr", connection: "Grok CLI",
        models: [
          { id: "grok-45", name: "Grok 4.5", available: false, reason: "Update or repair required", effort: ["Medium", "High"], fast: true },
        ],
      },
    ],
  },
];

// Free Models grouping: source-driven views over real routes above.
export const FREE_MODELS = [
  { provider: "moonshot", account: "moonshot-free", model: "kimi-k3", state: "Cooling down", resetsInMinutes: 41 },
  { provider: "alibaba", account: "alibaba-intl", model: "qwen-38", state: "Ready" },
  { provider: "google", account: "google-personal", model: "gemini-3-pro", state: "Setup needed" },
];

export const FAVORITE_ROUTES = [
  { provider: "anthropic", account: "anthropic-max", model: "fable-5" },
  { provider: "anthropic", account: "anthropic-max", model: "opus-5" },
  { provider: "openai", account: "openai-team", model: "gpt-56-pro" },
];

export const RECENT_ROUTES = [
  { provider: "anthropic", account: "anthropic-max", model: "fable-5" },
  { provider: "alibaba", account: "alibaba-intl", model: "qwen-38" },
  { provider: "anthropic", account: "anthropic-api", model: "fable-5" },
];

export const PERSONAS = ["default-persona", "product-manager", "release-captain"];

export function findRoute(ref) {
  const p = PROVIDERS.find((x) => x.id === ref.provider);
  const a = p && p.accounts.find((x) => x.id === ref.account);
  const m = a && a.models.find((x) => x.id === ref.model);
  return p && a && m ? { provider: p, account: a, model: m } : null;
}

export function routeLabel(ref) {
  const r = findRoute(ref);
  if (!r) return "Unknown route";
  return `${r.model.name} · ${r.account.name}`;
}

// ---------------------------------------------------------------------------
// Operational awareness fixtures — compact actionable summaries, never raw registries.
// ---------------------------------------------------------------------------
export const OPERATIONAL = {
  worktrees: [
    { id: "wt-main", branch: "main", owner: "You", state: "Clean", path: "puppet-master" },
    { id: "wt-media", branch: "feature/media-pipeline", owner: "Goal — Import hardening", state: "3 edits pending", path: "worktrees/media-pipeline" },
    { id: "wt-crew-b", branch: "crew/refactor-lane-b", owner: "Crew wave 2", state: "Awaiting integration", path: "worktrees/refactor-lane-b" },
  ],
  ports: [
    { port: 5173, owner: "Dev server — web", state: "Serving" },
    { port: 4318, owner: "Trace collector", state: "Serving" },
    { port: 8080, owner: "Preview — recipe API", state: "Conflict", detail: "Requested by test runner; held by Preview" },
  ],
  processes: [
    { id: "proc-cargo", name: "cargo build --workspace", state: "Running", cpu: "62%" },
    { id: "proc-vite", name: "vite dev", state: "Idle", cpu: "1%" },
  ],
  tests: {
    lastRun: "2026-08-12T02:41:00Z", passed: 128, failed: 2, skipped: 4,
    failing: ["import::exif_strip_survives_resize", "import::zip_bomb_guard"],
  },
  debug: { session: "media-worker attach", state: "Paused at breakpoint", location: "importer.rs:214" },
  logs: [
    { id: "log-agent", name: "Agent log", lines: 4210, updated: "2026-08-12T03:02:00Z" },
    { id: "log-build", name: "Build log", lines: 1180, updated: "2026-08-12T02:58:00Z" },
  ],
  backups: [
    { id: "bk-nightly", name: "Nightly project backup", when: "2026-08-12T01:00:00Z", size: "412 MB" },
  ],
  snapshots: [
    { id: "snap-pre-goal", name: "Before Goal — Import hardening", when: "2026-08-11T22:14:00Z" },
    { id: "snap-migration", name: "Pre-migration 0002", when: "2026-08-10T18:40:00Z" },
  ],
  forecast: {
    provider: "Anthropic — Max plan",
    windowResetMinutes: 74,
    usedPercent: 63,
    sustainable: "Two concurrent specialists for the next hour",
    waves: "Six specialists fit in three waves with testing reserve",
    note: "Heaviest lane: research retrieval",
  },
  resources: { cpu: "41%", memory: "9.2 / 32 GB", disk: "118 GB free", gpu: "Idle" },
};

// ---------------------------------------------------------------------------
// Artifact bodies for the four demonstrated kinds. The test capture is drawn
// SVG — no external images anywhere.
// ---------------------------------------------------------------------------
export const ARTIFACT_BODIES = {
  "art-code": {
    kind: "code",
    title: "importer.rs",
    path: "src/services/importer.rs",
    language: "rust",
    lines: [
      "//! Media import pipeline — resize ladder + EXIF strip.",
      "use crate::media::{Ladder, StripPolicy};",
      "",
      "pub struct Importer {",
      "    ladder: Ladder,",
      "    strip: StripPolicy,",
      "    retries: u8,",
      "}",
      "",
      "impl Importer {",
      "    pub fn new(ladder: Ladder) -> Self {",
      "        Self { ladder, strip: StripPolicy::All, retries: 3 }",
      "    }",
      "",
      "    pub async fn ingest(&self, blob: Blob) -> Result<Asset, ImportError> {",
      "        let cleaned = self.strip.apply(&blob)?;",
      "        let sized = self.ladder.fit(cleaned).await?;",
      "        Asset::store(sized).await",
      "    }",
      "}",
    ],
  },
  "art-diff": {
    kind: "diff",
    title: "Import hardening — three files",
    files: [
      {
        path: "src/services/importer.rs", added: 42, removed: 11,
        hunks: [
          { header: "@@ -12,6 +12,14 @@", lines: [
            [" ", "pub struct Importer {"],
            ["-", "    ladder: Ladder,"],
            ["+", "    ladder: Ladder,"],
            ["+", "    strip: StripPolicy,"],
            ["+", "    retries: u8,"],
            [" ", "}"],
          ]},
        ],
      },
      {
        path: "src/media/strip.rs", added: 66, removed: 0,
        hunks: [
          { header: "@@ -0,0 +1,18 @@", lines: [
            ["+", "pub enum StripPolicy { All, KeepColorProfile }"],
            ["+", "impl StripPolicy {"],
            ["+", "    pub fn apply(&self, blob: &Blob) -> Result<Blob, ImportError> {"],
            ["+", "        exif::strip(blob, matches!(self, Self::KeepColorProfile))"],
            ["+", "    }"],
            ["+", "}"],
          ]},
        ],
      },
      {
        path: "web/src/routes/recipe/upload.svelte", added: 9, removed: 3,
        hunks: [
          { header: "@@ -41,9 +41,15 @@", lines: [
            [" ", "  const upload = async (file) => {"],
            ["-", "    await api.post('/import', file)"],
            ["+", "    const receipt = await api.post('/import', file, { retries: 3 })"],
            ["+", "    toastFromReceipt(receipt)"],
            [" ", "  }"],
          ]},
        ],
      },
    ],
  },
  "art-capture": {
    kind: "capture",
    title: "Upload flow — test capture",
    note: "BrowserWorkspace capture from the import test pass",
    // Drawn representation of a browser test capture (SVG markup, no raster).
    svg: `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Drawn browser capture of the upload flow test">
      <rect x="0" y="0" width="480" height="300" rx="8" fill="var(--bg-inset)"/>
      <rect x="0" y="0" width="480" height="34" rx="8" fill="var(--bg-raised)"/>
      <circle cx="20" cy="17" r="5" fill="var(--edge-strong)"/><circle cx="38" cy="17" r="5" fill="var(--edge-strong)"/><circle cx="56" cy="17" r="5" fill="var(--edge-strong)"/>
      <rect x="80" y="8" width="240" height="18" rx="9" fill="var(--bg-inset)"/>
      <rect x="30" y="60" width="420" height="52" rx="6" fill="var(--bg-surface)" stroke="var(--edge)"/>
      <rect x="48" y="76" width="140" height="20" rx="4" fill="var(--accent-soft)"/>
      <rect x="30" y="130" width="200" height="120" rx="6" fill="var(--bg-surface)" stroke="var(--edge)"/>
      <rect x="250" y="130" width="200" height="120" rx="6" fill="var(--bg-surface)" stroke="var(--edge)"/>
      <rect x="48" y="148" width="164" height="10" rx="5" fill="var(--edge)"/>
      <rect x="48" y="168" width="120" height="10" rx="5" fill="var(--edge-faint)"/>
      <rect x="268" y="148" width="164" height="10" rx="5" fill="var(--edge)"/>
      <rect x="268" y="168" width="100" height="10" rx="5" fill="var(--edge-faint)"/>
      <rect x="48" y="210" width="90" height="24" rx="12" fill="var(--ok-soft)"/>
      <text x="60" y="226" font-size="12" fill="var(--ok)" font-family="var(--font-ui)">Passed</text>
    </svg>`,
  },
  "art-report": {
    kind: "report",
    title: "Import hardening — verification report",
    sections: [
      { heading: "Summary", body: "Resize ladder and EXIF strip verified against 240 fixture images. Two regressions remain in the ZIP guard path." },
      { heading: "What changed", body: "Importer gained a strip policy and bounded retries. Upload route surfaces the import receipt." },
      { heading: "Evidence", body: "128 tests passed, 2 failed, 4 skipped. Failing cases are quarantined behind the zip-bomb guard flag." },
      { heading: "Next", body: "Fix guard threshold, re-run quarantine lane, then close the Goal." },
    ],
  },
};

// ---------------------------------------------------------------------------
// Authored thread extensions (16–18) — bring shells to 18 and cover the gaps.
// Message ids continue the fixture convention: tNN-mNNNN.
// ---------------------------------------------------------------------------
function msg(id, role, body, sentAt, extra = {}) {
  return {
    id, role, body, sentAt,
    runtime: {
      provider: "Anthropic", model: "Fable 5", persona: "default-persona",
      mode: "Agent", effort: "Medium", workedSeconds: extra.worked ?? 8,
      totalElapsedSeconds: extra.elapsed ?? extra.worked ?? 8,
      tokenCount: extra.tokens ?? 420, contextUsed: extra.ctx ?? 41200, contextLimit: 200000,
      estimatedCost: extra.cost ?? null,
      ...(extra.runtime || {}),
    },
    eligibleForEdit: role === "user" && !!extra.editable,
    collapsedByDefault: !!extra.collapsed,
    ...(extra.fields || {}),
  };
}

export const EXTRA_THREADS = [
  {
    id: "thread-16",
    title: "Release notes draft",
    project: "Puppet Master",
    pinned: false,
    archived: true,
    threadState: "idle",
    updatedAt: "2026-08-03T17:20:00Z",
    initialVisibleMessageCount: 10,
    tags: ["archived", "ordinary conversation"],
    messages: [
      msg("t16-m0001", "user", "Draft release notes for the 0.4 milestone. Focus on the import pipeline and the new backup scheduler.", "2026-08-03T16:52:00Z", { editable: true }),
      msg("t16-m0002", "assistant", "Here is a first pass. Headliners: hardened media imports with automatic retries, EXIF stripping on by default, nightly backups with a seven-day ladder, and quieter notifications. I kept breaking changes in their own section since the importer API signature changed.", "2026-08-03T16:53:00Z", { worked: 22 }),
      msg("t16-m0003", "user", "Good shape. Move the breaking changes above the features and add the migration one-liner.", "2026-08-03T17:05:00Z"),
      msg("t16-m0004", "assistant", "Reordered — breaking changes now lead, with the one-line migration: run `pm migrate 0002` before first launch. The importer signature note links to the upgrade guide section.", "2026-08-03T17:06:00Z", { worked: 14 }),
    ],
    activeGoal: null, todo: null, subagentGroups: [], diffGroups: [],
    questionnaires: [], artifacts: [], browserSessions: [],
    draftState: { currentText: "", revisionHistory: [] },
    scriptedReplyCursor: 0, scriptedReplyIds: [],
  },
  {
    id: "thread-17",
    title: "Crew refactor — provider routing",
    project: "Puppet Master",
    pinned: true,
    archived: false,
    threadState: "running",
    updatedAt: "2026-08-12T03:05:00Z",
    initialVisibleMessageCount: 24,
    tags: ["crew", "capacity", "primary showcase", "provider redesign"],
    messages: [
      msg("t17-m0001", "user", "We need the provider routing layer refactored before the chat redesign lands. Requested and effective routes are tangled together in one struct, account switching re-resolves the whole catalog, and the retry path can silently change accounts. I want this split into requested route, resolution, and settlement, with the fallback chain explicit and logged. Keep the public API stable for the chat layer, and stage the work so tests stay green after every wave — we cannot afford a broken main while the bakeoff is running.", "2026-08-12T02:10:00Z", { editable: true, collapsed: true }),
      msg("t17-m0002", "assistant", "That splits cleanly into six work packages: route model split, resolution engine, settlement records, fallback chain, API shim, and the test harness update. I recommend a Crew with two concurrent specialists in three waves — capacity forecasting says that is sustainable inside the current Anthropic window, and it preserves an integration and repair reserve at the end.", "2026-08-12T02:12:00Z", { worked: 46, elapsed: 58 }),
      msg("t17-m0003", "user", "Run it as a Goal with that crew plan. Ask before anything touches the public API surface.", "2026-08-12T02:15:00Z"),
      msg("t17-m0004", "assistant", "Goal started: Provider routing refactor. Wave one is running — the route-model specialist on Fable 5 and the resolution specialist on GPT-5.6 Pro, each in its own worktree. The settlement specialist on Qwen 3.8 is queued behind the capacity window. I will raise a questionnaire before the API shim wave.", "2026-08-12T02:16:00Z", { worked: 12 }),
    ],
    activeGoal: {
      id: "goal-provider-refactor", title: "Provider routing refactor",
      objective: "Split requested route, resolution, and settlement; make fallback explicit; keep the chat-facing API stable.",
      status: "running", workedSeconds: 2900, totalElapsedSeconds: 3480,
      canEdit: true, canPause: true, canResume: false, canStop: true, canClear: false, expanded: false,
    },
    todo: {
      id: "todo-t17",
      items: [
        { id: "td-17-1", label: "Split route model into requested and effective", state: "complete" },
        { id: "td-17-2", label: "Extract resolution engine", state: "running" },
        { id: "td-17-3", label: "Settlement records with receipts", state: "running" },
        { id: "td-17-4", label: "Explicit fallback chain with logging", state: "pending" },
        { id: "td-17-5", label: "API shim for chat layer", state: "pending" },
        { id: "td-17-6", label: "Test harness against new model", state: "pending" },
        { id: "td-17-7", label: "Integration pass across waves", state: "pending" },
        { id: "td-17-8", label: "Verification and receipt", state: "pending" },
      ],
    },
    subagentGroups: [
      {
        id: "sub-t17", label: "Crew — wave 1 of 3", state: "running",
        counts: { working: 2, complete: 0, blocked: 0, waiting: 1 },
        agents: [
          { name: "Route model", task: "Split requested/effective route structs", currentActivity: "Editing route.rs — 3 files", status: "working", workedSeconds: 840, route: "Fable 5 · jared — Max plan" },
          { name: "Resolution", task: "Extract resolution engine", currentActivity: "Reading resolver call sites", status: "working", workedSeconds: 780, route: "GPT-5.6 Pro · jared — Team" },
          { name: "Settlement", task: "Settlement records with receipts", currentActivity: "Queued — capacity window", status: "waiting", workedSeconds: 0, route: "Qwen 3.8 · platyr-dev" },
        ],
      },
    ],
    diffGroups: [
      {
        id: "diff-t17", label: "Wave 1 — route model split",
        files: [
          { path: "src/routing/route.rs", added: 88, removed: 34, status: "modified" },
          { path: "src/routing/resolve.rs", added: 120, removed: 0, status: "created" },
          { path: "src/chat/api_shim.rs", added: 12, removed: 4, status: "modified" },
        ],
      },
    ],
    questionnaires: [
      {
        id: "q-t17-api", status: "queued", createdAt: "2026-08-12T03:02:00Z", currentQuestionIndex: 0,
        title: "API shim decisions",
        questions: [
          { id: "q-t17-1", prompt: "The chat layer calls resolve_route in four places. Keep the synchronous signature with an internal cache, or move callers to the async engine?", kind: "single select", required: true, options: ["Keep synchronous with cache", "Move callers to async", "Shim now, migrate callers next milestone"], selected: [] },
          { id: "q-t17-2", prompt: "Settlement receipts can embed the fallback chain or reference it by id. Which should the public API expose?", kind: "single select", required: true, options: ["Embed the chain", "Reference by id", "Both behind a flag"], selected: [] },
          { id: "q-t17-3", prompt: "Anything else the API shim must preserve?", kind: "freeform", required: false, options: [], selected: [] },
        ],
      },
    ],
    artifacts: [
      { id: "art-code", title: "importer.rs", kind: "code file", projectPath: "src/services/importer.rs", openTarget: "editor tab" },
      { id: "art-diff", title: "Wave 1 diff", kind: "multi-file diff", projectPath: "worktrees/refactor-lane-a", openTarget: "editor tab" },
      { id: "art-capture", title: "Upload flow capture", kind: "test capture", projectPath: "evidence/upload-flow.svg", openTarget: "editor tab" },
      { id: "art-report", title: "Verification report", kind: "report document", projectPath: "docs/verification/import-hardening.md", openTarget: "editor tab" },
    ],
    browserSessions: [],
    draftState: { currentText: "", revisionHistory: [] },
    scriptedReplyCursor: 0, scriptedReplyIds: ["reply-16", "reply-17"],
  },
  {
    id: "thread-18",
    title: "Field notes — train wifi",
    project: "Personal project",
    pinned: false,
    archived: false,
    threadState: "idle",
    updatedAt: "2026-08-11T08:44:00Z",
    initialVisibleMessageCount: 10,
    tags: ["offline", "outbox", "reconnect"],
    messages: [
      msg("t18-m0001", "user", "Summarize yesterday's decisions on the shelf lighting so I can post them to the build log.", "2026-08-11T08:31:00Z", { editable: true }),
      msg("t18-m0002", "assistant", "Three decisions from yesterday: warm-white strips under each shelf lip, a single dimmer channel per column rather than per shelf, and the power feed hidden in the back-left chase. Open question: whether the top display shelf gets an accent spot — you wanted to see the strips first.", "2026-08-11T08:32:00Z", { worked: 9 }),
      msg("t18-m0003", "user", "Perfect. Keep this thread for the trip — connection is going to be rough.", "2026-08-11T08:40:00Z"),
      msg("t18-m0004", "assistant", "Understood. Anything you send while offline is queued locally and delivered exactly once when the connection returns; approved work on the home server keeps running either way.", "2026-08-11T08:41:00Z", { worked: 6 }),
    ],
    activeGoal: null, todo: null, subagentGroups: [], diffGroups: [],
    questionnaires: [], artifacts: [], browserSessions: [],
    draftState: { currentText: "Also ask about the glass door hinges", revisionHistory: [ { savedAt: "2026-08-11T08:43:00Z", text: "Also ask about hinges" } ] },
    scriptedReplyCursor: 0, scriptedReplyIds: ["reply-18"],
  },
];

// Scripted replies for authored threads (same shape as fixture scriptedReplies).
export const EXTRA_SCRIPTED_REPLIES = [
  {
    id: "reply-16",
    workingSummarySequence: ["Reading wave state", "Checking capacity window", "Composing status"],
    stepDurationsMs: [900, 1100, 800],
    body: "Wave one is still healthy: the route-model specialist is finishing its third file and the resolution specialist is mapping the last call sites. The settlement lane stays queued until the capacity window opens — forecast says about forty minutes. Nothing has touched the public API yet.",
    runtime: { provider: "Anthropic", model: "Fable 5", persona: "default-persona", mode: "Agent", effort: "Medium", workedSeconds: 11, totalElapsedSeconds: 12, tokenCount: 380, contextUsed: 52100, contextLimit: 200000, estimatedCost: null },
    activitySummary: "Checked crew state and capacity",
    stopResultBody: "Stopped while checking wave state. The crew keeps its current assignments; nothing was changed.",
  },
  {
    id: "reply-17",
    workingSummarySequence: ["Collecting wave receipts", "Verifying integration lane"],
    stepDurationsMs: [1000, 1200],
    body: "Wave receipts collected. Route model and resolution both landed with green tests; settlement starts its lane next. I will surface the API questionnaire before the shim wave begins.",
    runtime: { provider: "Anthropic", model: "Fable 5", persona: "default-persona", mode: "Agent", effort: "Medium", workedSeconds: 9, totalElapsedSeconds: 10, tokenCount: 340, contextUsed: 53400, contextLimit: 200000, estimatedCost: null },
    activitySummary: "Collected receipts",
    stopResultBody: "Stopped during receipt collection. Completed receipts are kept; the integration check will resume with the next turn.",
  },
  {
    id: "reply-18",
    workingSummarySequence: ["Reading thread notes", "Writing summary"],
    stepDurationsMs: [800, 900],
    body: "Posted format for the build log: decisions first, open questions last, one photo slot per shelf column. Ready to fill in when you are back online — everything you queued arrived exactly once.",
    runtime: { provider: "Anthropic", model: "Fable 5", persona: "default-persona", mode: "Agent", effort: "Low", workedSeconds: 7, totalElapsedSeconds: 8, tokenCount: 260, contextUsed: 18800, contextLimit: 200000, estimatedCost: null },
    activitySummary: "Wrote build-log summary",
    stopResultBody: "Stopped before the summary finished. Your queued messages are safe and will not send twice.",
  },
];

// Cross-thread request fixture (thread request/await/spawn demonstrations).
export const CROSS_THREAD = {
  request: {
    id: "xreq-001",
    source: "thread-17", target: "thread-06", sender: "Provider routing refactor",
    task: "Confirm which importer tests were quarantined and why",
    scope: "Read only — test results and quarantine notes",
    budget: "One response",
    status: "answered",
    createdAt: "2026-08-12T02:48:00Z",
    answeredAt: "2026-08-12T02:52:00Z",
    resultSummary: "Two quarantined: exif_strip_survives_resize and zip_bomb_guard, both behind the guard flag pending threshold fix.",
    idempotencyKey: "xreq-001-a",
  },
};

// Attachment fixtures for the four resolution classes.
export const ATTACHMENTS = [
  { id: "att-native", name: "routing-notes.md", size: "18 KB", cls: "Native", detail: "Markdown passes to the model directly." },
  { id: "att-transformed", name: "usage-report.xlsx", size: "2.1 MB", cls: "PM transformed", detail: "Spreadsheet sampled to 40 rows per sheet; derived artifact retains lineage." },
  { id: "att-alternate", name: "walkthrough.mp4", size: "184 MB", cls: "Alternate model", detail: "Video transcription routes to GPT-5.6 Pro — requires consent (different provider boundary)." },
  { id: "att-unsupported", name: "firmware.bin", size: "9.4 MB", cls: "Unsupported", detail: "Binary firmware has no safe transformation." },
];

// Provider setup deep-link fixture states.
export const PROVIDER_SETUP = {
  google: { state: "Sign-in needed", detail: "Antigravity CLI owns this sign-in. PM opens the official page; the profile stays with the Execution Host.", action: "Open Provider Settings" },
  xai: { state: "Update or repair required", detail: "Grok CLI 3.2 has a known routing defect. Repair reinstalls from the official source.", action: "Open Provider Settings" },
};
