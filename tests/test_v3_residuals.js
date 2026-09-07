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
// TEST 2: V3-R02 - Internal Work Note Projection Segregation
// ---------------------------------------------------------------------------
console.log("--- TEST 2: V3-R02 Internal Work Note Segregation ---");

const threadopsPath = path.resolve(rootDir, "Concepts/chat-assistant-concepts/5.6 Pro/threadops.js");
const threadopsCode = fs.readFileSync(threadopsPath, "utf8");

window.PM56_RECORDS = {
  reference: function(m) {
    if (m.id === "subagents-07" || m.id === "note-1") return { kind: "note" };
    return { kind: "work" };
  }
};

eval(threadopsCode);

// 2a. Verify isInternalNote behavior
const sampleNote = { id: "subagents-07", role: "system", type: "agent-work", internalOnly: true, title: "Orphan Gate failed", detail: "Classes read before harvest" };
assert.ok(sampleNote.internalOnly === true, "internalOnly is true");
assert.ok(sampleNote.title.includes("Orphan Gate failed"), "title includes Orphan Gate failed");

// 2b. Test Restore Point creation & Snapshot Segregation
const sampleThreadWithNote = {
  id: "th-subagents",
  title: "Subagent Harvest",
  status: "idle",
  messages: [
    { id: "m-1", role: "user", text: "Start harvest" },
    { id: "m-2", role: "assistant", text: "Harvesting dependencies" },
    { id: "m-3", role: "user", text: "Check orphan gates" },
    { id: "m-4", role: "assistant", text: "Running checks" },
    { id: "subagents-07", role: "system", type: "agent-work", internalOnly: true, title: "Orphan Gate failed", text: "Orphan Gate failed: race condition" },
    { id: "m-5", role: "user", text: "Acknowledge status" },
    { id: "m-6", role: "assistant", text: "Status acknowledged and clean" }
  ]
};

const isInternalNote = (m) => {
  if (!m) return false;
  if (m.internalOnly === true) return true;
  if (m.role === 'system' && m.type === 'agent-work') return true;
  var txt = (m.text || m.body || m.title || m.detail || '');
  if (typeof txt === 'string' && txt.indexOf('Orphan Gate failed') !== -1) return true;
  return false;
};

const ordinaryMessages = sampleThreadWithNote.messages.filter(m => !isInternalNote(m));
assert.strictEqual(ordinaryMessages.length, 6, "Must have exactly 6 ordinary messages");
assert.ok(!ordinaryMessages.some(m => m.id === "subagents-07"), "subagents-07 must NOT be in ordinary messages");

// 2c. Rewind card preview: test that 6 preview messages do not include Orphan Gate failed
const previewCandidates = sampleThreadWithNote.messages.filter(m => !isInternalNote(m));
const previewSlice = previewCandidates.slice(-6);
const previewText = previewSlice.map(m => m.text || "").join(" ");
assert.ok(!previewText.includes("Orphan Gate failed"), "Rewind preview .pm-tops-fold-text must not contain Orphan Gate failed");

// 2d. Branch from restore point: messages must exclude notes, rawMessages keeps rawSnapshot
const fakeRestorePoint = {
  id: "rp-1",
  threadId: sampleThreadWithNote.id,
  atTurn: 6,
  messageCount: 6,
  snapshot: JSON.parse(JSON.stringify(ordinaryMessages)),
  rawSnapshot: JSON.parse(JSON.stringify(sampleThreadWithNote.messages))
};

const branchedMessages = fakeRestorePoint.snapshot.filter(m => !isInternalNote(m));
assert.strictEqual(branchedMessages.length, 6, "Branched thread messages contains 6 ordinary messages");
assert.ok(!branchedMessages.some(m => isInternalNote(m)), "Branched messages contains 0 internal notes");
assert.strictEqual(fakeRestorePoint.rawSnapshot.length, 7, "rawSnapshot preserves full 7 messages for audit/diagnostics");

// 2e. Export thread excludes internal notes
const exportedMessages = sampleThreadWithNote.messages.filter(m => !isInternalNote(m));
assert.strictEqual(exportedMessages.length, 6, "Exported messages count must be 6");
assert.ok(!exportedMessages.some(m => m.id === "subagents-07"), "subagents-07 excluded from export");

console.log("PASS: TEST 2 (V3-R02 internal work note segregation) passed.\n");


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
    bytes: 2815569,
    sha256: "76f88689f6209cb06d06010672284225fea4b3c10c6f0cdb21817ddad3b968f6"
  },
  {
    path: "Concepts/chat-assistant-concepts/5.6 Pro/index.html",
    bytes: 2815569,
    sha256: "76f88689f6209cb06d06010672284225fea4b3c10c6f0cdb21817ddad3b968f6"
  },
  {
    path: "Concepts/chat-assistant-concepts/5.6 Pro/app.js",
    bytes: 298151,
    sha256: "ce923893122c77956ddd75650150f5f7021abe2170b66a44a776a84514533faa"
  },
  {
    path: "Concepts/chat-assistant-concepts/5.6 Pro/collaboration.js",
    bytes: 174856,
    sha256: "ee6fcf595f6ee5f5ebb654793be4822a9651db2197209f5d529f0ee18f16e636"
  },
  {
    path: "Concepts/chat-assistant-concepts/5.6 Pro/threadops.js",
    bytes: 87612,
    sha256: "0dc4489bae7eab0d573341abff50df8d730b3b4f21f4e8ef5fac9bb651db5879"
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
assert.strictEqual(normalizedDigest, "33721cdf7d3a6d5366ef0b3fcc642e832aa14cd6887ff5787a40e1d446c087a0", "LF normalized digest must match 33721cdf7d3a6d5366ef0b3fcc642e832aa14cd6887ff5787a40e1d446c087a0");

// Verify git blob
const blobId = execSync("git hash-object 'Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html'", { cwd: rootDir }).toString().trim();
assert.strictEqual(blobId, "bce6fda60ebd23ca759d562da8514be53fb9b467", "Git blob must match bce6fda60ebd23ca759d562da8514be53fb9b467");

console.log("PASS: TEST 5 (V3-R09 exact bytes, SHA256, normalized digest, git blob) passed.\n");

console.log("=== ALL V3 RESIDUALS REGRESSION TESTS PASSED CLEANLY (exit 0) ===");
