## Rewrite alignment (2026-02-21)

This plan remains authoritative for tier policy (Phase/Task/Subtask/Iteration), subagent selection policy, and wiring/verification requirements. As the rewrite lands (see `Plans/rewrite-tie-in-memo.md`):

- Platform-specific runner details should converge on **Providers** that emit a normalized streaming **event model**
- Tool gating/permissions should be centralized in the tool policy engine; orchestrator policy should *consume* normalized events/tools, not re-implement per-platform parsing
- Start/end verification, "built but not wired" checks, and tier boundary semantics should be represented as explicit events for replayability


### Persistence and event emission (rewrite)

- **Seglog:** Emit to the canonical seglog stream: tier start/end, iteration start/end, verification results, subagent invocation boundaries, and any event that must be replayable. Use the unified event model; do not add one-off log files for run history.
- **redb:** Persist in redb (per storage-plan.md schema): orchestrator **run** metadata (run id, PRD ref, status, timestamps); **session** identity and linkage to run; **checkpoints** at phase/task/subtask boundaries for resume and recovery. Config used by the run is built at run start per Option B (see config-wiring below).
- Implementation: run/session/checkpoint writes and seglog appends should be called from the same orchestrator boundaries (e.g. after verification, on tier advance) so state and event stream stay consistent.

### Config Wiring — Option B: Build at Run Start (Resolved, Canonical Definition) {#config-wiring}

At run start, the orchestrator builds the full execution config by merging three sources in this precedence order (later overrides earlier):
1. **GUI config defaults** (from redb `config:gui.*`): platform, model, effort, plan_mode defaults.
2. **Interview output config** (from interview artifacts): subagent assignments, phase config, research settings, technology-specific overrides.
3. **Per-tier overrides** (from PRD/plan tasks): any task-level overrides for platform, model, or effort.

Merge rules:
- Scalar values: last writer wins (per precedence).
- Arrays (e.g., `subagents`): concatenate and deduplicate.
- Objects: deep merge (per-key override).

The merged config is validated by `validate_config_wiring_for_tier()` before execution begins.

### Test Strategy Loading {#test-strategy-loading}

- Orchestrator loads `.puppet-master/interview/test-strategy.json` if present.
- Merges `items[].criterion` into tier acceptance criteria and injects relevant excerpts into prompt context.
- Missing/invalid file is WARN-only (no crash); continue execution with PRD/plan criteria only.

ContractRef: SchemaID:pm.test_strategy.schema.v1, PolicyRule:Decision_Policy.md§2

