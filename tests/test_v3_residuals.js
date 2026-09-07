/**
 * Regression Test Suite: Assistant/Settings v3 Residual Repairs (V3-R01..V3-R09)
 * Baseline: 6717b5246aa00b6f1da63814c32319c630e9beee
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");

console.log("=== RUNNING V3 RESIDUALS REGRESSION TEST SUITE ===\n");

// ---------------------------------------------------------------------------
// TEST 1: V3-R01 - Review Normalization, Strategy Transitions, & Roster Backup
// ---------------------------------------------------------------------------
console.log("--- TEST 1: V3-R01 Review Normalization & Strategy Transitions ---");

// Mock browser / PM runtime environment
const windowMock = {
  PM56_DATA: {
    models: [
      { id: "sonnet46", name: "Claude Sonnet 4.6", provider: "anthropic", accountId: "acc-1" },
      { id: "gpt5", name: "GPT-5", provider: "openai", accountId: "acc-2" },
      { id: "opus46", name: "Claude Opus 4.6", provider: "anthropic", accountId: "acc-1" },
      { id: "haiku45", name: "Claude Haiku 4.5", provider: "anthropic", accountId: "acc-1" }
    ],
    personas: [
      { id: "Reviewer", name: "Reviewer" },
      { id: "Critical Advisor", name: "Critical Advisor" }
    ]
  },
  PM56_EXT: {
    _slots: {},
    _actions: {},
    slot: function(name, fn) { (this._slots[name] = this._slots[name] || []).push(fn); return this; },
    action: function(name, fn) { this._actions[name] = fn; return this; },
    chainAction: function(name, fn) { this._actions[name] = fn; return this; }
  },
  PM56_RUNTIME: {},
  PM56_PICKERS: {
    openChoice: function(btn, label, current, choices, cb) {}
  }
};

global.window = windowMock;
global.document = {
  addEventListener: function() {}
};

const collabPath = path.resolve(rootDir, "Concepts/chat-assistant-concepts/5.6 Pro/collaboration.js");
const collabCode = fs.readFileSync(collabPath, "utf8");
eval(collabCode);

const collabStore = window.PM56_COLLAB;
const ext = window.PM56_EXT;

const mockCtx = {
  renderOverlays: function() {},
  closeDialog: function() {},
  renderApp: function() {},
  toast: function() {},
  icon: function() { return ""; },
  clone: function(o) { return JSON.parse(JSON.stringify(o)); },
  state: { selectedThread: "th-1", threads: [{ id: "th-1", messages: [] }] }
};

// 1a. Open review draft: starts multi_pass with 3 reviewers
collabStore.openConfigure("review");
let draft = collabStore.draft();
assert.strictEqual(draft.kind, "review", "Draft kind should be review");
assert.strictEqual(draft.config.strategy, "multi_pass", "Initial strategy should be multi_pass");
assert.strictEqual(draft.rows.length, 3, "Initial multi_pass rows length must be 3");

// Record initial row IDs (e.g. draftp-90, draftp-91, draftp-92)
const id0 = draft.rows[0].rowId;
const id1 = draft.rows[1].rowId;
const id2 = draft.rows[2].rowId;

// 1b. Remove row 2 -> 3 -> 2
ext._actions["collab-modal-remove-participant"](mockCtx, { dataset: { row: id2 } });
assert.strictEqual(draft.rows.length, 2, "After removing row 2, count must be 2");
assert.strictEqual(draft.config.reviewerCount, 2, "reviewerCount must be 2");
assert.deepStrictEqual(draft.rows.map(r => r.rowId), [id0, id1], "Remaining row IDs must be [id0, id1]");

// 1c. Remove row 1 -> 2 -> 1
ext._actions["collab-modal-remove-participant"](mockCtx, { dataset: { row: id1 } });
assert.strictEqual(draft.rows.length, 1, "After removing row 1, count must be 1 (NOT recreated default roster!)");
assert.strictEqual(draft.config.reviewerCount, 1, "reviewerCount must be 1");
assert.strictEqual(draft.rows[0].rowId, id0, "Remaining row must be id0 (the first reviewer)");

// 1d. Reselect already-active Multi-Pass -> strict NO-OP
const rowsBeforeReselect = draft.rows;
window.PM56_PICKERS.openChoice = function(btn, label, current, choices, cb) { cb("multi_pass"); };
ext._actions["collab-pick-choice"](mockCtx, { dataset: { field: "strategy" }, closest: () => ({ childNodes: [{ textContent: "Strategy" }] }) });
assert.strictEqual(draft.config.strategy, "multi_pass", "Strategy remains multi_pass");
assert.strictEqual(draft.rows.length, 1, "Reselecting multi_pass must NOT change roster count (must remain 1)");
assert.strictEqual(draft.rows[0].rowId, id0, "Row ID remains id0");
assert.strictEqual(draft.rows, rowsBeforeReselect, "Reselecting same strategy must be a strict no-op");

// 1e. Switch to Single Agent -> count is exactly 1
window.PM56_PICKERS.openChoice = function(btn, label, current, choices, cb) { cb("single_agent"); };
ext._actions["collab-pick-choice"](mockCtx, { dataset: { field: "strategy" }, closest: () => ({ childNodes: [{ textContent: "Strategy" }] }) });
assert.strictEqual(draft.config.strategy, "single_agent", "Strategy switched to single_agent");
assert.strictEqual(draft.rows.length, 1, "Single Agent must have exactly 1 reviewer");
assert.strictEqual(draft.rows[0].rowId, id0, "Single Agent reviewer rowId matches id0");

// 1f. Switch BACK to Multi-Pass -> count MUST remain 1 and deleted rows must NOT be resurrected!
window.PM56_PICKERS.openChoice = function(btn, label, current, choices, cb) { cb("multi_pass"); };
ext._actions["collab-pick-choice"](mockCtx, { dataset: { field: "strategy" }, closest: () => ({ childNodes: [{ textContent: "Strategy" }] }) });
assert.strictEqual(draft.config.strategy, "multi_pass", "Strategy switched back to multi_pass");
assert.strictEqual(draft.rows.length, 1, "Switching back to Multi-Pass must preserve 1-reviewer roster (NOT resurrect 2 or 3!)");
assert.strictEqual(draft.rows[0].rowId, id0, "Reviewer must still be id0");
assert.ok(!draft.rows.some(r => r.rowId === id1 || r.rowId === id2), "Deleted reviewers (id1, id2) must NOT be resurrected");

// 1g. Edit Single Agent reviewer and verify propagation on toggle back
window.PM56_PICKERS.openChoice = function(btn, label, current, choices, cb) { cb("single_agent"); };
ext._actions["collab-pick-choice"](mockCtx, { dataset: { field: "strategy" }, closest: () => ({ childNodes: [{ textContent: "Strategy" }] }) });
// Edit model of single agent
draft.rows[0].requestedModelId = "gpt5";
// Switch back to multi_pass
window.PM56_PICKERS.openChoice = function(btn, label, current, choices, cb) { cb("multi_pass"); };
ext._actions["collab-pick-choice"](mockCtx, { dataset: { field: "strategy" }, closest: () => ({ childNodes: [{ textContent: "Strategy" }] }) });
assert.strictEqual(draft.rows.length, 1, "Roster count remains 1");
assert.strictEqual(draft.rows[0].requestedModelId, "gpt5", "Edited model propagates to restored multi-pass row 0");

// 1h. Pass count independence: pass count can be configured independently of reviewer count
draft.config.passCount = 3;
collabStore.normalizeReview(draft);
assert.strictEqual(draft.rows.length, 1, "1 reviewer retained");
assert.strictEqual(draft.config.passCount, 3, "3 passes retained with 1 reviewer");

console.log("PASS: TEST 1 (V3-R01 review normalization, transitions, and roster backup) passed.\n");


// ---------------------------------------------------------------------------
// TEST 2: V3-R02 - Internal Work Note Projection Segregation & Real Handler Coverage
// ---------------------------------------------------------------------------
console.log("--- TEST 2: V3-R02 Internal Work Note Segregation (Real Handlers) ---");

// Load the authoritative transcript-records module to provide real PM56_RECORDS
const recordsPath = path.resolve(rootDir, "Concepts/chat-assistant-concepts/5.6 Pro/transcript-records.js");
eval(fs.readFileSync(recordsPath, "utf8"));
assert.strictEqual(typeof window.PM56_RECORDS.reference, "function", "PM56_RECORDS.reference must be loaded from transcript-records.js");

// Load the real threadops module
const threadopsPath = path.resolve(rootDir, "Concepts/chat-assistant-concepts/5.6 Pro/threadops.js");
eval(fs.readFileSync(threadopsPath, "utf8"));

const threadops = window.PM56_THREADOPS;
assert.ok(threadops, "PM56_THREADOPS must be published");
assert.strictEqual(typeof ext._actions["create-restore-point"], "function", "create-restore-point action registered");
assert.strictEqual(typeof ext._actions["branch-from-restore"], "function", "branch-from-restore action registered");
assert.strictEqual(typeof ext._actions["rewind-to-message"], "function", "rewind-to-message action registered");
assert.strictEqual(typeof ext._actions["export-thread"], "function", "export-thread action registered");

// Setup DOM interceptors for registered export-thread handler
let interceptedExports = [];
global.Blob = class MockBlob {
  constructor(parts, opts) { this.parts = parts; this.opts = opts; }
};
global.URL = global.URL || {};
global.URL.createObjectURL = function(blob) {
  if (blob && blob.parts) interceptedExports.push(blob.parts.join(""));
  return "blob:mock-export-url";
};
global.URL.revokeObjectURL = function() {};

// Fixture factory containing:
// - Positive records: route-04 (typed File change via transcript-records REFERENCES, with perturbed title)
//                     change-harvest (typed File change via explicit outputRef, with shared phrase title)
// - Negative notes:   subagents-07 (internalOnly: true note with perturbed title)
//                     note-harvest (untyped agent-work note with shared phrase title)
// - Ordinary user & assistant turns
function createFixtureThread() {
  return {
    id: "th-ops",
    title: "Subagent Harvest & Routing",
    status: "idle",
    messages: [
      { id: "m-1", role: "user", text: "Investigate routing and harvest" },
      { id: "m-2", role: "assistant", text: "Analyzing provider routing" },
      { id: "route-04", role: "system", type: "agent-work", title: "Orphan Gate failed — corrected provider routing", detail: "Provider routing repaired at provider-selector.js:65" },
      { id: "subagents-07", role: "system", type: "agent-work", internalOnly: true, title: "Orphan Gate failed", text: "Orphan Gate failed: race condition in worker classes", detail: "Classes read before harvest" },
      { id: "m-3", role: "user", text: "Check harvest worker status" },
      { id: "note-harvest", role: "system", type: "agent-work", title: "Harvest sweep stalled", detail: "Worker timed out waiting for queue" },
      { id: "change-harvest", role: "system", type: "agent-work", title: "Harvest sweep stalled — fixed timeout handler", outputRef: { kind: "change", path: "src/harvest.rs", line: 42 }, detail: "Patched worker timeout" },
      { id: "m-4", role: "assistant", text: "All systems verified and operational." }
    ]
  };
}

let activeTestThread = createFixtureThread();
const threadopsCtx = {
  state: {
    selectedThread: "th-ops",
    threads: [activeTestThread],
    menu: null,
    dialog: null
  },
  activeThread: function() {
    return this.state.threads.find(t => t.id === this.state.selectedThread) || null;
  },
  switchThread: function(id) {
    this.state.selectedThread = id;
  },
  clone: function(o) {
    return JSON.parse(JSON.stringify(o));
  },
  closeMenu: function() {
    this.state.menu = null;
  },
  closeDialog: function() {
    this.state.dialog = null;
  },
  appendMessage: function(msg, thread) {
    var t = thread || this.activeThread();
    if (t && t.messages) t.messages.push(msg);
  },
  renderApp: function() {},
  renderOverlays: function() {},
  toast: function() {},
  icon: function(name, size) {
    return `<svg class="icon" data-icon="${name}" width="${size || 12}"></svg>`;
  },
  esc: function(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
};
ext.ctx = function() { return threadopsCtx; };

// -------------------------------------------------------------------------
// 2a. Real Registered Handler: export-thread (Perturbed vs Neutral Title Control)
// -------------------------------------------------------------------------
// Perturbed title test: route-04 carries "Orphan Gate failed — corrected provider routing"
interceptedExports = [];
ext._actions["export-thread"](threadopsCtx, { dataset: { id: "th-ops" } });
assert.strictEqual(interceptedExports.length, 1, "Registered export-thread must create download blob");
const exportedPerturbed = JSON.parse(interceptedExports[0]);
assert.strictEqual(exportedPerturbed.format, "pm56-thread-export/1", "Export must adhere to format pm56-thread-export/1");
assert.strictEqual(exportedPerturbed.thread.id, "th-ops", "Export thread ID matches");

// Assert positive typed records are PRESERVED in export despite perturbed titles
assert.ok(exportedPerturbed.messages.some(m => m.id === "route-04"), "Positive record route-04 MUST be preserved in export");
assert.ok(exportedPerturbed.messages.some(m => m.id === "change-harvest"), "Positive record change-harvest MUST be preserved in export");

// Assert internal notes are EXCLUDED from export
assert.ok(!exportedPerturbed.messages.some(m => m.id === "subagents-07"), "Internal note subagents-07 MUST be excluded from export");
assert.ok(!exportedPerturbed.messages.some(m => m.id === "note-harvest"), "Untyped internal note note-harvest MUST be excluded from export");
assert.strictEqual(exportedPerturbed.messages.length, 6, "Export must contain exactly 6 ordinary messages (8 total - 2 notes)");

// Neutral title control: change route-04 title to neutral phrase and verify identity-preserving export
activeTestThread = createFixtureThread();
const route04Ref = activeTestThread.messages.find(m => m.id === "route-04");
route04Ref.title = "Provider routing repaired";
threadopsCtx.state.threads = [activeTestThread];
interceptedExports = [];
ext._actions["export-thread"](threadopsCtx, { dataset: { id: "th-ops" } });
assert.strictEqual(interceptedExports.length, 1, "Neutral title control export created");
const exportedNeutral = JSON.parse(interceptedExports[0]);
assert.strictEqual(exportedNeutral.messages.length, 6, "Neutral title control also exports exactly 6 ordinary messages");
assert.ok(exportedNeutral.messages.some(m => m.id === "route-04"), "Positive record route-04 preserved under neutral title");
assert.strictEqual(
  exportedNeutral.messages.find(m => m.id === "route-04").type,
  exportedPerturbed.messages.find(m => m.id === "route-04").type,
  "Identity and type of route-04 preserved identically regardless of title"
);

// Reset active thread with perturbed title for complete lifecycle operations
activeTestThread = createFixtureThread();
threadopsCtx.state.threads = [activeTestThread];

// -------------------------------------------------------------------------
// 2b. Real Registered Handler: create-restore-point
// -------------------------------------------------------------------------
ext._actions["create-restore-point"](threadopsCtx, { dataset: { id: "th-ops" } });
const restorePoints = threadops.restorePoints("th-ops");
assert.strictEqual(restorePoints.length, 1, "Registered create-restore-point creates 1 restore point");
const rp = restorePoints[0];
assert.strictEqual(rp.threadId, "th-ops", "Restore point belongs to th-ops");
assert.strictEqual(rp.snapshot.length, 6, "Restore point snapshot contains exactly 6 ordinary messages");
assert.ok(rp.snapshot.some(m => m.id === "route-04"), "Restore point snapshot MUST include positive record route-04");
assert.ok(rp.snapshot.some(m => m.id === "change-harvest"), "Restore point snapshot MUST include positive record change-harvest");
assert.ok(!rp.snapshot.some(m => m.id === "subagents-07"), "Restore point snapshot MUST exclude subagents-07");
assert.ok(!rp.snapshot.some(m => m.id === "note-harvest"), "Restore point snapshot MUST exclude note-harvest");
assert.strictEqual(rp.rawSnapshot.length, 8, "rawSnapshot preserves complete diagnostic transcript (8 messages)");

// -------------------------------------------------------------------------
// 2c. Real Registered Handler: branch-from-restore
// -------------------------------------------------------------------------
ext._actions["branch-from-restore"](threadopsCtx, { dataset: { value: rp.id } });
const branchThread = threadopsCtx.state.threads[0];
assert.strictEqual(branchThread.lineage.kind, "branch-from-restore", "Branched thread lineage records branch-from-restore");
assert.strictEqual(branchThread.lineage.restorePointId, rp.id, "Branch lineage points to restore point ID");
assert.strictEqual(branchThread.messages.length, 6, "Branched thread contains exactly 6 messages from immutable snapshot");
assert.ok(branchThread.messages.some(m => m.id === "route-04"), "Branched thread MUST include positive record route-04");
assert.ok(branchThread.messages.some(m => m.id === "change-harvest"), "Branched thread MUST include positive record change-harvest");
assert.ok(!branchThread.messages.some(m => m.id === "subagents-07"), "Branched thread MUST exclude subagents-07");
assert.ok(!branchThread.messages.some(m => m.id === "note-harvest"), "Branched thread MUST exclude note-harvest");
assert.strictEqual(branchThread.rawMessages.length, 8, "rawMessages on branched thread retains full diagnostic messages");

// -------------------------------------------------------------------------
// 2d. Real Registered Handler: rewind-to-message & Registered Card Renderer
// -------------------------------------------------------------------------
threadopsCtx.switchThread("th-ops");
// Rewind to m-2 (anchor before route-04, subagents-07, m-3, note-harvest, change-harvest, m-4)
ext._actions["rewind-to-message"](threadopsCtx, { dataset: { value: "m-2" } });
const rewinds = threadops.rewinds("th-ops");
assert.strictEqual(rewinds.length, 1, "Registered rewind-to-message creates 1 rewind record");
const rw = rewinds[0];
assert.strictEqual(rw.restored, false, "Rewind initially active and unrestored");

// Find the threadops-rewind receipt message appended to active thread
const rewindReceipt = activeTestThread.messages.find(m => m.type === "threadops-rewind");
assert.ok(rewindReceipt, "Thread has threadops-rewind receipt message");

// Execute real registered systemCardActions renderer slot
const cardRenderers = ext._slots["systemCardActions"];
assert.ok(Array.isArray(cardRenderers) && cardRenderers.length > 0, "systemCardActions slot registered");
const foldHtml = cardRenderers.map(fn => fn({ ...threadopsCtx, message: rewindReceipt })).join("");

// Validate renderer output
assert.ok(foldHtml.includes('class="pm-tops-fold"'), "Renderer output must contain pm-tops-fold");
assert.ok(foldHtml.includes("Orphan Gate failed — corrected provider routing"), "Renderer fold must show positive record route-04");
assert.ok(foldHtml.includes("Harvest sweep stalled — fixed timeout handler"), "Renderer fold must show positive record change-harvest");
assert.ok(!foldHtml.includes("Classes read before harvest"), "Renderer fold MUST NOT show subagents-07 detail");
assert.ok(!foldHtml.includes("Worker timed out waiting for queue"), "Renderer fold MUST NOT show note-harvest detail");
assert.ok(foldHtml.includes('data-action="restore-rewind"'), "Renderer fold provides restore-rewind action");

// Execute real registered restore-rewind action
ext._actions["restore-rewind"](threadopsCtx, { dataset: { value: rw.id } });
assert.strictEqual(rw.restored, true, "restore-rewind restores all folded turns");
const restoredCardHtml = cardRenderers.map(fn => fn({ ...threadopsCtx, message: rewindReceipt })).join("");
assert.ok(restoredCardHtml.includes("Restored · every folded turn is back in place"), "Restored fold card renders clean confirmation");

// -------------------------------------------------------------------------
// 2e. Real Registered Slot: threadSearchMenu Projection
// -------------------------------------------------------------------------
const searchMenuSlots = ext._slots["threadSearchMenu"];
assert.ok(Array.isArray(searchMenuSlots) && searchMenuSlots.length > 0, "threadSearchMenu slot registered");

// Search for 'Orphan Gate failed'
threadopsCtx.state.menu = { query: "Orphan Gate failed", scope: "current" };
const searchResults1 = searchMenuSlots.map(fn => fn(threadopsCtx)).join("");
assert.ok(searchResults1.includes("route-04"), "Search for Orphan Gate failed matches positive record route-04 (title-independent)");
assert.ok(!searchResults1.includes("subagents-07"), "Search for Orphan Gate failed excludes internal note subagents-07");

// Search for 'Harvest sweep stalled'
threadopsCtx.state.menu = { query: "Harvest sweep stalled", scope: "current" };
const searchResults2 = searchMenuSlots.map(fn => fn(threadopsCtx)).join("");
assert.ok(searchResults2.includes("change-harvest"), "Search for Harvest sweep stalled matches positive record change-harvest");
assert.ok(!searchResults2.includes("note-harvest"), "Search for Harvest sweep stalled excludes internal note note-harvest");

console.log("PASS: TEST 2 (V3-R02 internal work note segregation & real handler coverage) passed.\n");


// ---------------------------------------------------------------------------
// TEST 3: V3-R03 - SETTINGS_MIGRATION.json Canonical Mapping & dry-method
// ---------------------------------------------------------------------------
console.log("--- TEST 3: V3-R03 SETTINGS_MIGRATION.json Canonical Mapping ---");

const setMigrationPath = path.resolve(rootDir, "Plans/.audits/assistant-settings-v3/SETTINGS_MIGRATION.json");
const setMigration = JSON.parse(fs.readFileSync(setMigrationPath, "utf8"));

// 3a. Verify dry-method mapping in canonical_to_workspace_mapping
const mappingList = setMigration.manager_scope_enumeration.canonical_to_workspace_mapping;
assert.ok(Array.isArray(mappingList), "canonical_to_workspace_mapping must be an array");
const dryMapping = mappingList.find(m => m.canonical_manager_id === "dry-method");
assert.ok(dryMapping, "dry-method must exist in canonical_to_workspace_mapping");
assert.strictEqual(dryMapping.workspace_id, "context-memory", "dry-method workspace_id must be 'context-memory'");
assert.strictEqual(dryMapping.subpanel, "agent_rules", "dry-method subpanel must be 'agent_rules'");
assert.deepStrictEqual(dryMapping.controls, ["default_guard_toggle", "disclosure_state_view"], "dry-method controls must match canonical controls");

// 3b. Verify dry-method projection in named_visible_state_projections
const dryProj = setMigration.named_visible_state_projections["dry-method"];
assert.ok(dryProj, "named_visible_state_projections must include 'dry-method'");
assert.deepStrictEqual(dryProj.source_keys, ["app.agent_rules.dry_method_default_guard"], "dry-method source_keys must match");
assert.strictEqual(dryProj.workspace_id, "context-memory", "dry-method projection workspace_id must match");
assert.strictEqual(dryProj.subpanel, "agent_rules", "dry-method projection subpanel must match");
assert.deepStrictEqual(dryProj.owner_refs, ["Plans/DRY_Rules.md", "Plans/FinalGUISpec.md"], "dry-method projection owner refs must match");

// 3c. Verify 38 canonical managers and 21 workspace IDs
assert.strictEqual(setMigration.manager_scope_enumeration.canonical_specification_managers_count, 38, "Canonical manager count must be 38");
assert.strictEqual(setMigration.manager_scope_enumeration.standalone_testpm_workspace_tabs_count, 21, "Workspace tab count must be 21");
assert.strictEqual(mappingList.length, 38, "canonical_to_workspace_mapping must have 38 rows");

// 3d. Verify BSD defaults & negative rejection fixtures
const bsdAdmissions = setMigration.canonical_admissions_and_updates;
const bsdPersona = bsdAdmissions.find(k => (k.setting_id || k.canonical_key || k.key) === "safety.approvals.bsd-persona");
assert.strictEqual(bsdPersona.default, "Critical Advisor", "BSD Persona default must be 'Critical Advisor'");

const bsdSens = bsdAdmissions.find(k => (k.setting_id || k.canonical_key || k.key) === "safety.approvals.bsd-trigger-sensitivity");
assert.strictEqual(bsdSens.default, "Balanced", "BSD Sensitivity default must be 'Balanced'");

const bsdComp = bsdAdmissions.find(k => (k.setting_id || k.canonical_key || k.key) === "safety.approvals.bsd-self-compact-threshold");
assert.strictEqual(bsdComp.default, 0.8, "BSD Compaction default must be 0.8");

assert.ok(Array.isArray(setMigration.semantic_negative_fixtures) && setMigration.semantic_negative_fixtures.length >= 4, "Must have >= 4 semantic negative fixtures");

console.log("PASS: TEST 3 (V3-R03 SETTINGS_MIGRATION.json canonical mapping & dry-method) passed.\n");


// ---------------------------------------------------------------------------
// TEST 4: V3-R05 - COMMAND_DISPOSITIONS.csv Canonical Schemas
// ---------------------------------------------------------------------------
console.log("--- TEST 4: V3-R05 COMMAND_DISPOSITIONS.csv Schemas ---");

const cmdDispPath = path.resolve(rootDir, "Plans/.audits/assistant-settings-v3/COMMAND_DISPOSITIONS.csv");
const cmdDispContent = fs.readFileSync(cmdDispPath, "utf8");
const cmdLines = cmdDispContent.trim().split("\n").slice(1);

assert.strictEqual(cmdLines.length, 24, "COMMAND_DISPOSITIONS.csv must contain 24 rows");

// Row: cmd.bsd.configure
const bsdRow = cmdLines.find(l => l.includes("cmd.bsd.configure"));
assert.ok(bsdRow, "cmd.bsd.configure row must exist");
assert.ok(bsdRow.includes("trigger_sensitivity"), "cmd.bsd.configure must use trigger_sensitivity");
assert.ok(bsdRow.includes("conservative") && bsdRow.includes("balanced") && bsdRow.includes("frequent"), "cmd.bsd.configure must use conservative|balanced|frequent");
assert.ok(!bsdRow.includes("sensitivity: \"\"Aggressive\"\""), "cmd.bsd.configure must NOT specify Aggressive in payload schema");

// Row: cmd.runtime.quota_resume.set
const quotaRow = cmdLines.find(l => l.includes("cmd.runtime.quota_resume.set"));
assert.ok(quotaRow, "cmd.runtime.quota_resume.set row must exist");
assert.ok(quotaRow.includes("QuotaResumeConsentRequest") && quotaRow.includes("QuotaResumeConsentResult"), "cmd.runtime.quota_resume.set must use QuotaResumeConsentRequest -> QuotaResumeConsentResult");
assert.ok(!quotaRow.includes("QuotaResumeConsentSetRequest"), "cmd.runtime.quota_resume.set must NOT use QuotaResumeConsentSetRequest");

console.log("PASS: TEST 4 (V3-R05 COMMAND_DISPOSITIONS.csv payload schemas & types) passed.\n");


// ---------------------------------------------------------------------------
// TEST 5: V3-R09 - Manifest Hashes, Exact Bytes, and Rebuild Verification
// ---------------------------------------------------------------------------
console.log("--- TEST 5: V3-R09 Exact Bytes & Hashes Verification ---");

const deliveryManifestPath = path.resolve(rootDir, "Concepts/chat-assistant-concepts/5.6 Pro/DELIVERY_MANIFEST.json");
const replacementManifestPath = path.resolve(rootDir, "REPLACEMENT_MANIFEST.json");

const deliveryManifest = JSON.parse(fs.readFileSync(deliveryManifestPath, "utf8"));
const replacementManifest = JSON.parse(fs.readFileSync(replacementManifestPath, "utf8"));

const expectedFiles = [
  {
    path: "Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html",
    bytes: 2815417,
    sha256: "31b4d0d29516f5ae96a3b084bee9b8e1c3fdca0b8c8df707edad4dab180cebcc"
  },
  {
    path: "Concepts/chat-assistant-concepts/5.6 Pro/index.html",
    bytes: 2815417,
    sha256: "31b4d0d29516f5ae96a3b084bee9b8e1c3fdca0b8c8df707edad4dab180cebcc"
  },
  {
    path: "Concepts/chat-assistant-concepts/5.6 Pro/app.js",
    bytes: 298079,
    sha256: "7e08ab89eea4110e3f030405435fc85dc72340cf348fe40b01e67a25c4cbfa57"
  },
  {
    path: "Concepts/chat-assistant-concepts/5.6 Pro/collaboration.js",
    bytes: 174856,
    sha256: "ee6fcf595f6ee5f5ebb654793be4822a9651db2197209f5d529f0ee18f16e636"
  },
  {
    path: "Concepts/chat-assistant-concepts/5.6 Pro/threadops.js",
    bytes: 87534,
    sha256: "ebdb51a49df2c5167dddbc6abe665ded3d9c999052fe46d7d3a6535e174b9961"
  }
];

for (const exp of expectedFiles) {
  const fullPath = path.resolve(rootDir, exp.path);
  const buf = fs.readFileSync(fullPath);
  const actualBytes = buf.length;
  const actualSha256 = crypto.createHash("sha256").update(buf).digest("hex");

  assert.strictEqual(actualBytes, exp.bytes, `${exp.path} byte count mismatch (got ${actualBytes}, expected ${exp.bytes})`);
  assert.strictEqual(actualSha256, exp.sha256, `${exp.path} sha256 mismatch (got ${actualSha256}, expected ${exp.sha256})`);

  // Verify in DELIVERY_MANIFEST
  const dmEntry = deliveryManifest.files.find(f => f.path === exp.path);
  assert.ok(dmEntry, `${exp.path} must exist in DELIVERY_MANIFEST.json`);
  assert.strictEqual(dmEntry.bytes, exp.bytes, `DELIVERY_MANIFEST ${exp.path} bytes mismatch`);
  assert.strictEqual(dmEntry.sha256, exp.sha256, `DELIVERY_MANIFEST ${exp.path} sha256 mismatch`);

  // Verify in REPLACEMENT_MANIFEST
  const rmEntry = replacementManifest.files.find(f => f.path === exp.path);
  assert.ok(rmEntry, `${exp.path} must exist in REPLACEMENT_MANIFEST.json`);
  assert.strictEqual(rmEntry.bytes, exp.bytes, `REPLACEMENT_MANIFEST ${exp.path} bytes mismatch`);
  assert.strictEqual(rmEntry.sha256, exp.sha256, `REPLACEMENT_MANIFEST ${exp.path} sha256 mismatch`);
}

// Verify standalone LF normalized build digest
const standaloneBuf = fs.readFileSync(path.resolve(rootDir, "Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html"));
const standaloneText = standaloneBuf.toString("utf8").replace(/\r\n/g, "\n");
const normalizedDigest = crypto.createHash("sha256").update(Buffer.from(standaloneText, "utf8")).digest("hex");
assert.strictEqual(normalizedDigest, "afde28c3638df7bfab881c1668ddef34065f58686cce2edfa438743e08c2875a", "LF normalized digest must match afde28c3638df7bfab881c1668ddef34065f58686cce2edfa438743e08c2875a");

// Verify git blob
const blobId = execSync("git hash-object 'Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html'", { cwd: rootDir }).toString().trim();
assert.strictEqual(blobId, "428b2c67aa8e4354ba59dfcdf8d5cc4607b167d6", "Git blob must match 428b2c67aa8e4354ba59dfcdf8d5cc4607b167d6");

console.log("PASS: TEST 5 (V3-R09 exact bytes, SHA256, normalized digest, git blob) passed.\n");

console.log("=== ALL V3 RESIDUALS REGRESSION TESTS PASSED CLEANLY (exit 0) ===");
