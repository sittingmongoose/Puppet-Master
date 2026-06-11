# Shard 026: PlanUnits

Source: `Plans/MiscPlan.md`

Source lines: L1352-L1582

Source SHA256: `37d2cb724014b4aa42d8ad8efe2c6269e508f7ca0e5fbf45209a1f97fb8373c4`

---

## PlanUnits

### M-001 - Misc Plan -- Agent Artifacts, Cleanup & Related Improvements Source-Preserving PlanUnit

```yaml
plan_unit_id: M-001
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Plans/MiscPlan.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0074
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0075
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0076
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0077
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0078
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0079
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0080
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0081
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0082
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0083
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0084
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0085
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0086
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0087
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0088
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0089
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0090
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0091
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0092
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0093
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0094
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0095
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0096
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0097
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0098
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0099
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0100
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MiscPlan-S0101
preserved_exact_tokens:
- Misc Plan -- Agent Artifacts, Cleanup & Related Improvements
- Plan Document Status
- Rewrite alignment (2026-02-21)
- Table of Contents
- 1. Executive Summary
- Goals
- Non-Goals
- Target-project DRY (interview-seeded)
- 2. Problem Statement
- 3. Cleanup Policy
- 3.1 What Must Never Be Removed
- 3.2 What May Be Removed (Policy)
- 3.3 Cleanup Scope
- 3.3.1 Assistant worktree persistence
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md'
- 3.4 Cleanup Mechanisms (Choose One or Combine)
- '3.5 DRY Method: Single source of truth and reuse'
- 'ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002'
- 3.6 Gitignore and security (no secrets to GitHub)
- 4. Runner Contract Implementation
- 4.1 Trait and Types
- 4.2 prepare_working_directory
- 4.3 cleanup_after_execution
- 4.4 Wiring
negative_constraints:
- '- **Worktrees, lanes, and attempts:** When execution uses a worktree, lane, or attempt-specific working directory, cleanup runs in that selected path only; it must not clean the main working tree for artifacts owned by another lane, attempt, or worktree.'
- '- **Staging (add):** The codebase uses `git add -A` (e.g. `GitManager::add_all`) for tier commits. That command stages all changes and adds untracked files that are **not** ignored by .gitignore. So by default, ignored files are not staged. **Do not introduce `git add -f` (force-add)** anywhere; for'
- '- **Commit / stage:** Do not force-add paths that match these patterns. If adding a "pre-commit" or staged-file check, fail or warn when a staged file matches a sensitive pattern.'
- '- **Logs:** Do not log token values, API keys, private key contents, or the contents of credential files. `git-actions.log` currently logs action name and details (e.g. commit message). If commit messages ever come from untrusted input or could contain secrets, consider redacting or not logging the '
- '- **Evidence:** Evidence artifacts (test logs, screenshots, gate reports) must not contain API keys, tokens, or key contents. When capturing command output or writing evidence, strip or redact known secret patterns (e.g. token=..., Authorization: Bearer ...) if that output is ever written to disk or'
- '- Do not log, commit, or include in evidence or PR content: tokens, keys, or credential file contents.'
- '- **Do not run broad "git clean -fd" (untracked) here.** The orchestrator commits tier progress *after* the runner returns; if we removed untracked files here we would delete the agent''s new files before they are committed (§9.1.13). Optionally remove only **known build-artifact dirs** (e.g. `target'
- '- **Use shared git binary:** Resolve the `git` executable via the same helper as GitManager/Doctor (e.g. `path_utils::resolve_executable("git")` until Worktree plan adds `resolve_git_executable()`) so cleanup works when git is in a custom or app-local path. Do not assume `Command::new("git")` is suf'
- '- **Behavior:** If `clean_untracked` is false, return `Ok(())` without running git. Otherwise run `git clean -fd` (or `-fdx` if `clean_ignored`). Resolve the git binary via the same helper used by GitManager/Doctor (e.g. `crate::platforms::path_utils::resolve_executable("git")` until Worktree plan a'
- '3. **Optional build-artifact dirs:** If config allows (e.g. `cleanup.remove_build_artifacts: true`), remove only known dirs such as `work_dir.join("target")` (Rust). Do not remove untracked source or docs.'
- '- **Pruning:** A scheduled or manual job removes evidence older than the retention window. Do not remove evidence for the current run or recent runs still in progress.'
- '- **Concrete function:** `pub async fn prune_evidence_older_than(base_dir: &Path, config: &EvidenceRetentionConfig) -> Result<PruneResult>` in cleanup module (DRY:FN). List `.puppet-master/evidence/` recursively; for each file/dir, check mtime; if older than `retention_days` days (or if using retain'
- '- **Config:** Cleanup and evidence config (cleanup.untracked, cleanup.ignored, cleanup.clear_agent_output, evidence.retention_days, etc.) live in the **same** config schema and file as the rest of the app (e.g. `PuppetMasterConfig` / discovery). Do not introduce a separate cleanup-only config shape;'
- '- **Gap:** Doctor checks today may not receive the "active project" path; "Clean workspace now" must run in the **project directory** the user intends (e.g. selected project in Dashboard or the directory of the loaded config). Worktree plan §7.2 and §7.3: when running Doctor or starting a run, pass '
- '- **MCP:** We use MCP for Context7 and other tooling; platform CLIs can also connect to MCP servers. Cleanup and evidence are **not** exposed as MCP tools; they remain internal to Puppet Master. Future: optional MCP tool "clean_workspace" for external orchestration could call our run_git_clean_with_'
- '- **Remove:** "Remove" / "Disable" -- either delete the skill folder (with confirmation) or hide via permissions. Do not delete without explicit user confirmation.'
- '- **Discovery and list refresh:** List is built from `discover_skills(project_root)` using the ordered discovery paths (see §7.10). List is refreshed: (1) on opening the Skills tab; (2) after Add (Create/Import), Edit save, or Remove; (3) when user clicks "Refresh". Do not auto-refresh on a timer; u'
- '- workspace-owned projections are tracked separately from provider-root-owned runtime state; cleanup or repair flows must not confuse workspace-owned projected files with provider-root-owned account/runtime directories.'
- '- editing a provider-native projection target directly requires switching only that target to `Manual Override`; repair acts on the chosen target and must not silently revert sibling targets.'
- '| **Config file corrupted or invalid shortcuts section** | **Resolution:** On load, if `GuiConfig.shortcuts` (or the shortcuts section) fails to parse or is structurally invalid: **fall back to defaults** (empty overrides), log a warning, and **show a toast** ("Shortcuts reset to defaults due to con'
- '| **Filter: empty query vs no matches** | **Resolution:** **Empty filter** = show all shortcut rows. **Non-empty filter with no matches** = show empty list and a single inline message (e.g. "No shortcuts match ''xyz''") so the user can tell "no match" from "no data." Implementation must not show "No s'
- '- [ ] **8.8.7** **Config load failure:** When loading GuiConfig, if the shortcuts section is missing, use empty overrides. If it fails to parse or is structurally invalid, fall back to empty overrides, log a warning, show toast "Shortcuts reset to defaults due to config error", and build key map fro'
- '- **Resolved:** Prepare **does not** reset tracked state. It only cleans **untracked** (and optionally ignored) files via `run_git_clean_with_excludes`. Do not run `git checkout -- .` or `git restore .` in prepare unless a future config flag is added and documented. This avoids losing uncommitted wo'
- '- **Recommendation:** Consider out of scope for v1, or add a short note that cleanup is best-effort and concurrent use may lead to races; avoid holding locks across cleanup if possible.'
compatibility_only_notes:
- '- **One folder per skill**, with a `SKILL.md` inside. Recognized fields in frontmatter: `name` (required), `description` (required), `license`, `compatibility`, `metadata` (optional map).'
- '| **KeyBinding serialization** | Config stores overrides; use a format that is cross-platform and stable (e.g. string `"Ctrl+A"` or structured `{ "modifiers": ["ctrl"], "key": "A" }`). Document in implementation plan; ensure backward compatibility if format changes later. |'
- '- **Export:** Button "Export..." on Shortcuts tab opens a file picker (or native save dialog). Serialize current overrides only (or full key map) to JSON. Format: e.g. `{ "version": 1, "overrides": { "MoveToLineStart": "Ctrl+A", ... } }` using the same action-id and KeyBinding serialization as confi'
- '- In older code paths, **orchestrator** resolves `working_directory` via the legacy-named `get_tier_worktree(tier_id).unwrap_or_else(|| config.project.working_directory)` helper (execution_engine / orchestrator path). Canonical implementation treats that as lane/attempt worktree selection before fal'
- '- **Current plan:** §4.3 says cleanup_after_execution "Run workspace cleanup in work_dir per policy (e.g. git clean -fd)". The call flow is: **run_with_cleanup** does prepare → execute → **cleanup** (immediately after the runner returns). The **orchestrator** then runs its legacy-named **commit_tier'
- '- **Start chain / wizard:** Writes to `.puppet-master/start-chain/` (e.g. legacy-named `tier-plan.md`) and pipeline phase/task/subtask/iteration plans under paths derived from config. As long as those are under `.puppet-master/`, they are safe. If any start-chain or wizard output is written to proje'
- '- CLI-bridged providers may receive compatibility projections only when explicitly enabled, but runtime correctness still depends on PM-native bundling plus the PM `skill` tool.'
- '- Tier language is legacy decomposition/help terminology. Tier IDs and `/request-era` or tier-era state file names remain compatibility inputs only; worktrees, crews, agent coordination, route/open cleanup, blocked-identity cleanup, and runtime cleanup use node, lane, package, attempt, `/block/runti'
- '**What the Orchestrator plan does:** Subagent selection and invocation at Phase/Task/Subtask/Iteration, config-wiring validation, start/end verification (legacy-named `verify_tier_start`, `verify_tier_end`) at phase/task/subtask boundaries, quality verification (reviewer subagent, gate criteria), pa'
- '- **Ordering with start/end verification:** Orchestrator plan''s legacy-named `verify_tier_start` runs at Phase/Task/Subtask (and optionally Iteration) **entry**; `verify_tier_end` runs at Phase/Task/Subtask **completion**. MiscPlan''s prepare/cleanup run at **iteration** boundaries (before and after '
- '- **Commit order:** The orchestrator calls its legacy-named `commit_tier_progress` helper **after** the iteration returns; run_with_cleanup runs cleanup **before** that. So cleanup_after_execution must not remove untracked files (§9.1.13); only runner temp files. Full workspace untracked clean runs '
- '| **orchestrator-subagent-integration** | When adding subagent/iteration execution, use run_with_cleanup (MiscPlan) for every runner invocation; keep legacy-named verify_tier_start/verify_tier_end checks at phase/task/subtask boundaries and prepare/cleanup at iteration boundaries. |'
- '- Cleanup artifact boundaries are node-level, not tier-scoped; tier-era state file names such as `progress.txt`, `AGENTS.md`, and `prd.json` are compatibility inputs for `/cleanup`, not canonical scoping anchors.'
stale_retired_dispositions:
- '- `Contracts_V0` and `Contracts_V0.md` provide `/alias` handling, but cleanup needs that discipline elevated into a command-catalog pattern before deprecated commands, recovery namespaces, and cleanup commands drift.'
- '- Cleanup reconciliation includes Orchestrator tab/page retargeting, Source Control versus Orchestrator surface cleanup, `/glossary` and `/help/view` expansion, stale consumer-doc requested and `/effective/runtime` identity cleanup, and `/search/attention/project-summary` alignment.'
owner_boundary_notes:
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '- **GitHub (API-only):** The app uses the GitHub HTTPS API for PR creation (no GitHub CLI). Authentication is OAuth device-code by default; tokens live only in the OS credential store at runtime (never in seglog/redb/Tantivy, logs, or evidence). Ensure no code path builds a PR body or title from unt'
- '**Placement (exact UI location):** Add as a subsection under **Config**: either **Config → Advanced → Shortcuts** or a dedicated **Config → Shortcuts** tab (single canonical location; implementation chooses one). If the app has a **Settings / Preferences** area, Shortcuts may live there instead, but'
- 'A **GUI screen** is required to let users **manage Agent Skills**: discover, list, add, edit, remove, and configure permissions for skills that agents can load. Skills are reusable instruction sets defined as `SKILL.md` files in folders; discovery follows project and global paths compatible with Ope'
- '- discover skills from PM roots plus compatible import roots defined by the canonical skill system.'
- '| **How runners receive skills** | **Decision:** MVP runtime delivery uses the canonical registry + permission filter + context bundling + `skill` tool path. Provider-native formats may be documented as interoperability inputs, but implementation does not require a separate per-provider native runti'
- Implement in order; discovery path order is canonical (§7.10).
- '- [ ] **8.9.2** Define discovery paths (DRY:DATA:skill_search_paths) in **canonical order**: project first (`.puppet-master/skills`, `.claude/skills`, `.agents/skills`), then global (`~/.config/puppet-master/skills`, etc.); implement `discover_skills(project_root) -> Vec<SkillInfo>` with first-wins '
- '- [ ] **8.9.6** Implement `list_skills_for_agent(project_root, permissions) -> Vec<SkillInfo>` for runner/prompt integration; tag DRY:FN:list_skills_for_agent. Runtime delivery follows the canonical registry + permission filter + context bundling + `skill` tool path; provider-native formats remain i'
- '- In older code paths, **orchestrator** resolves `working_directory` via the legacy-named `get_tier_worktree(tier_id).unwrap_or_else(|| config.project.working_directory)` helper (execution_engine / orchestrator path). Canonical implementation treats that as lane/attempt worktree selection before fal'
- 'Canonical rule:'
- MiscPlan should summarize these as references to the owning SSOTs rather than restating an open-ended “wire later” status once the canonical behavior is fixed elsewhere.
- '- Routing owner docs already identified for cleanup reconciliation include `Plans/Contracts_V0.md`, `Plans/Crosswalk.md`, `/Contracts_V0.md`, and `/Crosswalk.md`.'
- '- Reconciliation cleanup covers Orchestrator retargeting from tiers to Seams and `/packages/graph`, Widget System hostability and `/persistence`, `/help` inventory expansion, UI command and route normalization, attention-center alignment, and consumer-doc cleanup for requested `/effective` identity '
- '- `orchestrator-subagent-integration` / `orchestrator-subagent-integration.md` is a consumer and `/worker-spawn` document over canonical runnable units, not a competing tier-era execution model.'
- '- `Contracts_V0`, `Contracts_V0.md`, and `FileManager.md` split primitive shape ownership from file consumer `/realization`: file-backed document opening, `/tab/buffer` behavior, path validation, and path-target open behavior stay constrained by the owner contracts.'
- '- Export or archival status can make a live-retained object eligible for later cleanup, but it does not by itself authorize deletion of the canonical `/historical` record model or the `/worktree` lineage needed for recovery explanation.'
- '- Cleanup reconciliation includes Orchestrator tab/page retargeting, Source Control versus Orchestrator surface cleanup, `/glossary` and `/help/view` expansion, stale consumer-doc requested and `/effective/runtime` identity cleanup, and `/search/attention/project-summary` alignment.'
- '- hidden memory files and active-agent side files are not canonical cleanup coordination state.'
- Cleanup lifecycle and quality features must use canonical child-run and blocked-state contracts.
- '- blocked cleanup actions use canonical `blocked_reason_code` and `allowed_action_ids[]`.'
- '- cleanup retries, reroutes, and cancellation preserve canonical lineage.'
- '- cleanup continuity comes from canonical state and handoff reconstruction, not child-memory files.'
- '## Runner Preparation/Cleanup and Safe-Point Canonical Alignment (2026-03-08)'
owner_hints:
- Plans/MiscPlan.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

