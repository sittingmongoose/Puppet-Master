#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const [outputPath, ...inputPaths] = process.argv.slice(2);
if (!outputPath || inputPaths.length < 2) {
  throw new Error("Usage: node merge-browser-receipts.mjs <output.json> <base.json> <supplemental.json> [...]");
}

const THEMES = ["friendly-dark", "friendly-light", "retro-dark", "retro-light", "basic-dark", "basic-light", "glass-dark", "glass-light"];
const WIDTHS = [520, 750, 975, 1200];
const RESIZE_WIDTHS = [...Array.from({ length: 53 }, (_, index) => 520 + index * 13), 1200];
const WINDOWS = Array.from({ length: 8 }, (_, index) => `window-${String(index + 1).padStart(2, "0")}`);
const THREADS = Array.from({ length: 8 }, (_, index) => `thread-${String(index + 1).padStart(2, "0")}`);
const FEATURES = [
  "baseline conversation", "long assistant message collapsed", "long assistant message expanded", "long user message collapsed", "long user message expanded",
  "active activity summary", "completed activity history collapsed", "completed activity history expanded", "questionnaire active", "questionnaire historical record",
  "goal only", "todo only", "subagents only", "diff only", "goal plus todo", "goal plus todo plus subagents plus diff",
  "search current thread", "search all threads", "Context Lens selection", "Context Lens applied state", "active thought collapsed", "active thought expanded by setting",
  "composer working and empty", "composer working with typed draft", "draft recovery", "artifact shortcut and editor-tab handoff", "long-thread older-history jump", "popout state restoration"
];
const HISTORY_MODES = ["closed", "peek", "pinned compact", "pinned full"];
const ARTIFACT_STATES = ["closed", "loading", "ready", "updated", "error"];
const TRIGGER_FAMILIES = {
  history: ["peek", "pin_compact", "pin_full", "unpin", "switch_thread"],
  question: ["prepare", "open", "select", "next", "validation_error", "skip", "cancel", "submit"],
  goal: ["start", "progress", "pause", "resume", "update", "replan", "blocked", "complete"],
  todo: ["add", "complete", "reopen", "block"],
  subagent: ["spawn", "queue", "progress", "complete", "fail", "retry"],
  activity: ["thinking_summary", "search", "read", "fetch", "browser", "test", "edit", "generate"],
  diff: ["create", "update", "open"],
  artifact: ["loading", "ready", "switch", "error", "close"],
  decision: ["approval_open", "details", "approve", "deny", "branch"],
  thread: ["send_request", "receive_response", "spawn_related", "branch"],
  system: ["port_collision", "worktree_collision", "reset"]
};
const TRIGGERS = Object.entries(TRIGGER_FAMILIES).flatMap(([family, events]) => events.map((event) => `${family}.${event}`));
const SUPPLEMENTAL_TRIGGERS = [
  "provider.setup_required", "provider.existing_found", "provider.use_existing", "provider.install_intent", "provider.install_approved", "provider.install_verified", "provider.install_failed",
  "provider.auth_required", "provider.authenticated", "provider.readiness_verified", "provider.continuation_resumed", "provider.continuation_stale_rejected",
  "provider.continuation_expired_rejected", "provider.continuation_topology_mismatch_rejected",
  "attachment.native", "attachment.transformed", "attachment.alternate", "attachment.unsupported",
  "context.lens", "context.compact_now", "bsd.off", "bsd.auto_idle", "bsd.auto_active", "bsd.on", "bsd.advice", "bsd.timeout", "bsd.unavailable",
  "network.offline", "network.domain_failure", "network.reconnect", "network.replay", "network.snapshot", "notification.inline_outcome", "scenario.reset"
];
const FOCUSED_FRAMES = [
  ...THREADS.flatMap((thread) => {
    const suffix = thread.slice(-2);
    return [`question-thread-${suffix}.png`, `work-thread-${suffix}.png`];
  }),
  "state-artifact-error.png", "state-decisions-offline.png", "state-deterministic-controller.png", "state-durable-composer-520.png",
  "state-popout-context.png", "state-route-picker-520.png", "state-search-all-520.png"
];
const EXPECTED_SCREENSHOTS = [
  ...THEMES.flatMap((theme) => WIDTHS.map((width) => `${theme}-${width}.png`)),
  ...TRIGGERS.map((trigger) => `trigger-${trigger.replace(".", "-")}.png`),
  "trigger-scenario-reset.png",
  ...FOCUSED_FRAMES
];

const EXPECTED_CHECKS = [
  "all entry pages boot with exact model label",
  "interface standards reject emoji, colored left accents, dead controls, and raw states",
  "semantic type floors, metadata contrast, and dense work headers remain resolved",
  "all 64 window-thread pairings render independently",
  "all eight questionnaire grammars preserve one durable lifecycle",
  "questionnaire queue validates, skips, revisits, submits, restores focus, and isolates threads",
  "eight themes across four chat widths",
  "512 baseline configurations cover every default pairing and rail state",
  "896 feature-state configurations cover the required audit host",
  "continuous 520-1200 resize under pressure covers eight representative pairings",
  "history and artifact state cross-product remains recoverable",
  "history closes and reopens through a complete pin, switch, and remount workflow",
  "artifact shortcut preserves identity through loading, error, retry, switch, diff, close, and reopen",
  "dock, pop-out, rail, and surrounding panel preserve semantic state",
  "reduced motion removes authored animation without losing state cues",
  "every authored motion family has a complete reduced-motion counterpart",
  "long message expansion preserves canonical content and scroll anchor",
  "one-bar search jumps to an unloaded exact message and returns focus",
  "Goal, Todo, child, Crew, activity, and diff lifecycles create and progress real rows",
  "thread request, response, related spawn, branch, rewind, restore, and redirect preserve lineage",
  "all three corrected warnings have distinct visible consequences",
  "dense, artifact error, approval, warning, and offline states are distinct",
  "draft persistence is thread-local and survives reload",
  "popup focus trap, escape return, modal isolation, and 520px combined collision bounds",
  "offline outbox survives reload, separates domain sync, snapshots, and replays exactly once",
  "corrected 59-trigger controller is exact and remains outside production Chat",
  "all corrected triggers mutate semantic state, render outcomes, emit receipts, and capture evidence",
  "all supplemental fixture triggers mutate exact semantic outcomes",
  "system and scenario reset return one deterministic canonical state",
  "selectors, Review access, BSD, provider acquisition, warnings, and attachments mutate visibly",
  "provider acquisition requires explicit consent, separate authentication, readiness, and a current continuation",
  "focused visual state gallery",
  "no browser console or runtime errors"
];
const MATRIX_FOR_CHECK = {
  "eight themes across four chat widths": "theme_width",
  "512 baseline configurations cover every default pairing and rail state": "baseline_configurations",
  "896 feature-state configurations cover the required audit host": "core_feature_states",
  "continuous 520-1200 resize under pressure covers eight representative pairings": "continuous_resize",
  "history and artifact state cross-product remains recoverable": "history_artifact"
};
const SHARDABLE_CHECKS = new Set(Object.keys(MATRIX_FOR_CHECK));

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const readReceipt = (path) => {
  const bytes = readFileSync(path);
  return { path: resolve(path), sha256: sha256(bytes), value: JSON.parse(bytes) };
};
const receipts = inputPaths.map(readReceipt);
if (new Set(receipts.map((receipt) => receipt.path)).size !== receipts.length) throw new Error("Duplicate receipt paths are not allowed");
if (new Set(receipts.map((receipt) => receipt.sha256)).size !== receipts.length) throw new Error("Duplicate receipt content is not allowed");

const base = structuredClone(receipts[0].value);
const identityFor = (candidate) => JSON.stringify({
  schema_id: candidate.schema_id,
  model: candidate.model_label,
  product: candidate.environment?.product,
  engine: candidate.environment?.engine,
  automation: candidate.environment?.automation,
  viewport: candidate.environment?.viewport,
  user_agent: candidate.environment?.user_agent,
  base_url: candidate.base_url,
  source_fingerprint: candidate.source_fingerprint?.aggregate_sha256
});
const identity = identityFor(base);
for (const receipt of receipts) {
  const candidate = receipt.value;
  if (identityFor(candidate) !== identity) throw new Error(`Receipt identity mismatch: ${receipt.path}`);
  if (candidate.schema_id !== "pm.chat.5_6_sol.browser_acceptance.v3") throw new Error(`Unsupported receipt schema: ${receipt.path}`);
  if (candidate.failed !== 0 || candidate.checks?.some((check) => check.status !== "pass")) throw new Error(`Cannot merge a failing receipt: ${receipt.path}`);
  if ((candidate.console_errors ?? []).length || (candidate.runtime_exceptions ?? []).length) throw new Error(`Receipt contains browser errors: ${receipt.path}`);
  if (!candidate.checks?.length) throw new Error(`Receipt contains zero checks: ${receipt.path}`);
}

const checksByName = new Map();
const matrices = {};
const observations = [];
const screenshotManifest = [];
for (const receipt of receipts) {
  for (const check of receipt.value.checks ?? []) {
    if (!EXPECTED_CHECKS.includes(check.name)) throw new Error(`Unexpected check name ${check.name} in ${receipt.path}`);
    const prior = checksByName.get(check.name) ?? [];
    if (prior.length && !SHARDABLE_CHECKS.has(check.name)) throw new Error(`Non-shardable check appears more than once: ${check.name}`);
    prior.push({ ...check, receipt: receipt.path });
    checksByName.set(check.name, prior);
  }
  for (const [name, rows] of Object.entries(receipt.value.matrices ?? {})) {
    if (!Array.isArray(rows)) throw new Error(`Matrix ${name} is not an array in ${receipt.path}`);
    matrices[name] ??= [];
    matrices[name].push(...rows);
  }
  for (const item of receipt.value.screenshot_manifest ?? []) {
    const bytes = readFileSync(resolve(receipt.value.screenshot_root, item.file));
    if (bytes.length !== item.bytes || sha256(bytes) !== item.sha256) throw new Error(`Screenshot custody mismatch for ${item.file} in ${receipt.path}`);
    screenshotManifest.push({ ...item, root: resolve(receipt.value.screenshot_root), receipt: receipt.path });
  }
  observations.push(...(receipt.value.observations ?? []));
}

const actualCheckNames = [...checksByName.keys()];
const missingChecks = EXPECTED_CHECKS.filter((name) => !checksByName.has(name));
const extraChecks = actualCheckNames.filter((name) => !EXPECTED_CHECKS.includes(name));
if (missingChecks.length || extraChecks.length) throw new Error(`Check-set mismatch; missing=${missingChecks.join(" | ") || "none"}; extra=${extraChecks.join(" | ") || "none"}`);

const exactKeys = (name, actualRows, keyFor, expectedKeys) => {
  if (!Array.isArray(actualRows)) throw new Error(`${name} is missing`);
  const actual = actualRows.map(keyFor);
  const duplicate = actual.find((key, index) => actual.indexOf(key) !== index);
  if (duplicate !== undefined) throw new Error(`${name} contains duplicate key ${duplicate}`);
  const expected = new Set(expectedKeys);
  const actualSet = new Set(actual);
  const missing = [...expected].filter((key) => !actualSet.has(key));
  const extra = [...actualSet].filter((key) => !expected.has(key));
  if (missing.length || extra.length || actual.length !== expected.size) throw new Error(`${name} coverage mismatch: actual=${actual.length} expected=${expected.size} missing=${missing.slice(0, 5).join(",") || "none"} extra=${extra.slice(0, 5).join(",") || "none"}`);
};

exactKeys("legibility", matrices.legibility, (row) => `${row.theme}|${row.thread}`, THEMES.flatMap((theme) => THREADS.map((thread) => `${theme}|${thread}`)));
exactKeys("pairings", matrices.pairings, (row) => `${row.window}|${row.thread}`, WINDOWS.flatMap((window) => THREADS.map((thread) => `${window}|${thread}`)));
exactKeys("questionnaire_grammars", matrices.questionnaire_grammars, (row) => row.thread, THREADS);
exactKeys("theme_width", matrices.theme_width, (row) => `${row.theme}|${row.width}`, THEMES.flatMap((theme) => WIDTHS.map((width) => `${theme}|${width}`)));
exactKeys("baseline_configurations", matrices.baseline_configurations, (row) => `${row.theme}|${row.width}|${row.window}|${row.rail}`, THEMES.flatMap((theme) => WIDTHS.flatMap((width) => WINDOWS.flatMap((window) => ["open", "closed"].map((rail) => `${theme}|${width}|${window}|${rail}`)))));
exactKeys("core_feature_states", matrices.core_feature_states, (row) => `${row.theme}|${row.width}|${row.feature}|${row.host_window}|${row.host_thread}`, THEMES.flatMap((theme) => WIDTHS.flatMap((width) => FEATURES.map((feature) => `${theme}|${width}|${feature}|window-05|thread-02`))));
exactKeys("continuous_resize", matrices.continuous_resize, (row) => `${row.window}|${row.thread}|${row.requested}`, WINDOWS.flatMap((window, index) => RESIZE_WIDTHS.map((width) => `${window}|${THREADS[index]}|${width}`)));
exactKeys("history_artifact", matrices.history_artifact, (row) => `${row.window}|${row.history}|${row.artifact}`, WINDOWS.flatMap((window) => HISTORY_MODES.flatMap((history) => ARTIFACT_STATES.map((artifact) => `${window}|${history}|${artifact}`))));
exactKeys("motion_reduction", matrices.motion_reduction, (row) => row.family, [
  ...WINDOWS,
  ...THREADS.flatMap((thread) => ["send", "redirect", "question", "work"].map((layer) => `${thread} ${layer}`)),
  "popup", "artifact progress"
]);
exactKeys("corrected_triggers", matrices.corrected_triggers, (row) => row.trigger, TRIGGERS);
exactKeys("supplemental_triggers", matrices.supplemental_triggers, (row) => row.trigger, SUPPLEMENTAL_TRIGGERS);
exactKeys("reset_determinism", matrices.reset_determinism, (row) => row.trigger, ["system.reset", "scenario.reset"]);
exactKeys("focused_frames", matrices.focused_frames, (row) => row, FOCUSED_FRAMES);
exactKeys("screenshot_manifest", screenshotManifest, (row) => row.file, EXPECTED_SCREENSHOTS);

const checks = EXPECTED_CHECKS.map((name) => {
  const shards = checksByName.get(name);
  if (shards.length === 1) {
    const { receipt: _receipt, ...check } = shards[0];
    return check;
  }
  const matrix = MATRIX_FOR_CHECK[name];
  return {
    name,
    status: "pass",
    duration_ms: shards.reduce((sum, check) => sum + check.duration_ms, 0),
    evidence: { aggregate_shards: shards.length, matrix, rows: matrices[matrix].length, source_receipts: shards.map((check) => check.receipt) }
  };
});

const merged = {
  ...base,
  generated_at: new Date().toISOString(),
  passed: checks.length,
  failed: 0,
  checks,
  matrices,
  console_errors: [],
  runtime_exceptions: [],
  observations,
  screenshot_root: null,
  screenshot_manifest: screenshotManifest,
  merge_custody: {
    merger_path: fileURLToPath(import.meta.url),
    merger_sha256: sha256(readFileSync(fileURLToPath(import.meta.url))),
    expected_check_count: EXPECTED_CHECKS.length,
    exact_matrix_key_validation: true,
    exact_screenshot_manifest_validation: true
  },
  aggregate_receipts: receipts.map(({ path, sha256: digest, value }) => ({
    path,
    sha256: digest,
    generated_at: value.generated_at,
    passed: value.passed,
    failed: value.failed,
    source_fingerprint: value.source_fingerprint.aggregate_sha256,
    execution_scope: value.execution_scope,
    check_names: value.checks.map((check) => check.name)
  }))
};

writeFileSync(outputPath, `${JSON.stringify(merged, null, 2)}\n`);
console.log(JSON.stringify({ output: resolve(outputPath), checks: merged.passed, matrices: Object.fromEntries(Object.entries(matrices).map(([name, rows]) => [name, rows.length])), screenshots: screenshotManifest.length }, null, 2));
