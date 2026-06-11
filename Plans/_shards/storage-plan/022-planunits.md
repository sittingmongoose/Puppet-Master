# Shard 022: PlanUnits

Source: `Plans/storage-plan.md`

Source lines: L2232-L2520

Source SHA256: `e511858de8d0a127d40bda1e315d00ac4987efaaa217bddbf3de189ca16e46da`

---

## PlanUnits

### SP-001 - Storage plan (seglog, redb, Tantivy, projectors) Source-Preserving PlanUnit

```yaml
plan_unit_id: SP-001
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Plans/storage-plan.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/storage-plan.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0074
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0075
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0076
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0077
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0078
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0079
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0080
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0081
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0082
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0083
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0084
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0085
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0086
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0087
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0088
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0089
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0090
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0091
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0092
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0093
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0094
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0095
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0096
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0097
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0098
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0099
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0100
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0101
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0102
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0103
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0104
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0105
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0106
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0107
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0108
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0109
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0110
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0111
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0112
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0113
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0114
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0115
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0116
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0117
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0118
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0119
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0120
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0121
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0122
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0123
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0124
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0125
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:storage-plan-S0126
preserved_exact_tokens:
- Storage plan (seglog, redb, Tantivy, projectors)
- Canonical owner-section requirements
- Owner-first canonicalization order
- Shared governance/runtime record envelope
- Export taxonomy and manifest contract
- Concern record family definition
- Concern lifecycle and resolution kinds
- Focused run and historical routing contract
- Source Control and worktree handshake
- Projection trust and action gating
- Lane vs worktree lifecycle split
- Historical semantic consistency
- Project summary projection
- Project attention projection
- Coverage blocker concern lifecycle owner section
- Concern source-event vs record vs projection split
- Runtime attribution ownership split
- Bridge-field precedence for attempt/provider/usage/receipt joins
- Projection fields for startup rehydration
- Artifacts index exact indexed fields
- Lane cleanup lineage fields
- P5 runtime storage special recovery register
- Cross-surface receipt record storage recovery
- Runtime object family ownership
negative_constraints:
- '- Lane/worktree lifecycle keeps `baseline`, `active`, `suspect`, `restoring`, `retained`, `cleanup_eligible`, `archived`, `removed`, and `historical` as distinct states. `historical`, `archived`, `removed`, `retained`, and `cleanup_eligible` carry cross-surface meanings and must not collapse into a '
- '- The `dashboard_layout:v1` migration contradiction resolves in storage and is cross-referenced from `FinalGUISpec.md`; app-default, project override, and project-scoped persistence must not silently reuse one layout contract for every surface.'
- '- Runtime/account-history reconciliation resolves audit labels into storage-owned joins: `runtime-identity` and `/receipt/account-history` remain requested/effective storage, receipt, and usage join concerns, while `pseudo-target` and `partial-transfer` are migration evidence labels only and must no'
- '- Attention cards, blocked notices, and wizard surfaces must not keep card-local or notice-local activation fields as canon; they resolve through one normalized route target. Migration notes are required when raw local IDs are replaced by normalized `subject_id` or `object_kind/object_id` forms.'
- '- Runtime artifacts must not let `task_id` language drag artifact identity back toward older decomposition terms; artifact identity reconciles through the node/package/seam/lane rewrite and the canonical runtime/artifact refs above.'
- '- Artifact lineage and project-artifact, memory, `/handoff`, and handoff joins preserve `/run/thread/wizard/attempt/account` anchors. Project-artifact references are derived from canonical runtime/artifact/receipt joins and must not become a separate identity family that bypasses attempt, thread, wi'
- '- Project `/card` and badge rollups show the highest-severity active item plus a count, while the attention center keeps each active item separately object-linked; rows must not collapse into one synthetic "project blocked" blob.'
- The receipt family is not a junk drawer. `orchestrator.receipt.{run_id}.{attempt_id}` and `orchestrator.receipt` bridge attempts, usage, evidence, runtime artifacts, and UI surfaces, but lifecycle truth remains in `attempt_record`, `usage_record`, `evidence_record`, `scheduler_pass_record`, `blocked
- Legacy tier and event names are compatibility aliases only. Storage may ingest `run.tier_started`, `run.tier_completed`, `run.persona_stage_changed`, `tier_runtime_record`, `tier_id`, `tier_type`, `tier-era`, `tier-start`, `tier-boundary`, `PuppetMasterEvent`, `PuppetMasterEvent::*`, `PuppetMasterEv
- Project registry state stays narrow. `projects:v1` is a registry, while `project_state:v1:{project_id}`, `orchestrator.project_state`, and `orchestrator.project_state.{project_id}` persist shell/UI state such as focused_run_id, per-tab state, active-agents, active-agents.json, project-state, /projec
- Consumer docs that must not own storage include Run_Graph_View, Plans/Widget_System.md, /Widget_System.md, Crosswalk.md, Decision_Log, and Decision_Log.md; they consume storage records through route/open, projection, and history views.
- Storage migration is prose-rule driven and forward-only. Low-level actually-populated fields may keep migration aliases for request-era, blocked-state, restore point, /block, /blocked/wizard, `/system`, /help/cross-doc, and under-specified terms, but owner-routing, policy-layer, schema-owner, non-we
- '- `dev_session_id` owns higher-level dev workflow continuity and MUST NOT replace `terminal_session_id` when exact shell reuse is required'
- '- **`file_map.bin`:** header `PMFM` + `schema_version:u32` + `entry_count:u32`. Entries are `path_byte_length:u32` + UTF-8 path bytes. Stored paths are forward-slash (`/`) normalized regardless of OS and convert to native separators only at query/I/O time, matching Git internal convention and keepin'
- 'Project attention records MUST NOT collapse user attention into only `orchestrator status`: the `idle/running/paused` activity enum and any `/running/paused` display value are activity_state hints, not the primary reason a project needs attention. Severity uses `info`, `warning`, `attention_required'
- '- `projection_freshness` remains the recency axis and `projection_health` remains the integrity/availability axis; storage and consumers MUST NOT collapse them into a single trust field.'
- '- Any `TierContext` or `tier_id` decomposition is compatibility-only derived metadata for legacy selection helpers and MUST NOT own runtime canon, storage keys, or join identity.'
- '- Retention policies for receipts, log tails, watch buffers, explorer snapshots, and stale caches MUST store both `retention_anchor_kind` and `retention_anchor_at_utc`; implementations MUST NOT infer the anchor from file mtime alone.'
- 'SCM side-effect lineage persists restart-stable receipt context for Orchestrator and Source Control. Mutation-capable attempts record repo/worktree/branch/head refs, partial receipt availability, and whether lineage is complete or partial; cross-surface deep links from Orchestrator replay the saved '
- Debug investigation records persist target binding and temporary instrumentation lineage. Durable fixes are allowed only for workspace-bound targets or for PM-owned surfaces such as `agent_session`; arbitrary external targets may store evidence and suggestions, but storage must not represent them as
- '- `dev_session_record.v1:{project_id}:{dev_session_id}` stores `project_id`, `dev_session_id`, linked `run_id?`, `thread_id?`, `workspace_tab_id?`, `terminal_session_id?`, DAP/debugger identity refs, target binding summary, lifecycle phase/state, historical/live verification state, last restore or r'
- Legacy `browser_state.v1` and `browser_state:v1` single-blob shapes are retired. Browser persistence is split across `preview_state.v1`, `browser_session_state.v1`, and `browser_profile_state.v1` so requested/effective runtime capability, permission tier, profile scope, restore policy, and visible s
- '- stale and degraded are different states and must not collapse into one generic trust field.'
- '- PM-generated CLI adapter config and projection files are derived artifacts and MUST NOT become the canonical ownership store for accounts, MCP state, instruction state, or skills.'
compatibility_only_notes:
- 'Snapshot vocabulary stays literal for compatibility: `{ tool_name, invocation_summary, options }`, Plans/interview-subagent-integration.md, and /interview-subagent-integration.md are preserved as searchable aliases while the canonical storage owner remains attempt and permission snapshot records.'
- Command compatibility terms that remain migration-only include self-contradictory command tables, graph-patch event routes, remediation_parent_attempt_id, usage_sequence, hitl.approval_requested, hitl.approved, request_id, /scope, execution-unit, display-only identity labels, /switch panels, cost_us
- '- Runtime compatibility stays derived: `tier_runtime_record`, tier-shaped records, `tier-targeted` terminal bindings, `tier_id`, `auto`, and `widget.completed_prose` are migration aliases, view overlays, or derived views. `widget.completed_prose` cannot remain completed tier summaries; canonical exe'
- '- Storage-backed inspectors keep right-side inspectors summary/action (`/action`) oriented, while dense objects open full-record views (`/full-record`) for attempt handoff artifacts, review records, corroboration records, graph patch requests, state transition reports, promotion records, and recover'
- '- Legacy `tier` wording that remains in storage, contracts, `user-copy`, or `/help` text is both a data-model risk and a user-copy/help migration risk. Canonical prose must mark tier spellings as compatibility aliases or migrate them to node/attempt/package/seam/lane terms, not leave visible help or'
- Attempt and execution-session records carry orchestration-specific identity. They include execution_unit_context, optional decomposition_context and view_context for legacy prompt or UI help, action-family, execution_role, operational_identity, actor-aware /actor-snapshot, actor-role, actor_role, ru
- Legacy tier and event names are compatibility aliases only. Storage may ingest `run.tier_started`, `run.tier_completed`, `run.persona_stage_changed`, `tier_runtime_record`, `tier_id`, `tier_type`, `tier-era`, `tier-start`, `tier-boundary`, `PuppetMasterEvent`, `PuppetMasterEvent::*`, `PuppetMasterEv
- Direct-record actionability is storage-backed rather than projection-inferred. `action-capable` direct records include promotion record, graph patch record + state transition report, recovery/restore record, and concern record for acknowledge/dismiss style actions. Any direct record view that allows
- Migration aliases stay explicit but subordinate. HTE, `/visible/manual-default`, `widget.tier_tree`, phase-grouped run-graph layouts, singular current-task, and `/current-worktree`/current-worktree widgets are compatibility labels that resolve into automation-first runtime mode policy, first-class w
- '### 2.1 Regex-index cache layout and Windows compatibility'
- '| `.puppet-master/project/state/regex_index/gen-{N}/index_meta.json` | Snapshot metadata: anchor, schema version, checksums, generation, compatibility flags |'
- 'Windows compatibility note for `storage-plan.md ### 2.1`: PM mitigates MAX_PATH with hash-based short paths such as `.puppet-master/cache/r/{hash8}/git/m/{hash8}/` (`/cache/r/{hash8}/git/m/{hash8}/`) where `hash8` is derived from `xxh3(full_id)`, and `manifest.json` keeps the full `full_id` mapping.'
- '- **`lookup.bin`:** header `PMLK` + `schema_version:u32` + `entry_count:u32`. Entries are sorted `(xxh3_hash:u64, postings_offset:u64)` pairs. `lookup.bin` remains a separate mmap file from offset 0; if a future packed format combines files, the lookup region MUST begin at a 64 KB-aligned offset for'
- '#### Frequency table, path compatibility, and validation rules'
- '- **Filesystem compatibility:** `case_sensitive_fs` records whether the snapshot was built on a case-sensitive filesystem. On case-insensitive filesystems, bare-clone path enumeration deduplicates by lowercase path and logs collisions.'
- Active attention rows carry both `attention_key` and `root_cause_key`. `attention_key` identifies the user-visible attention thread and owning route, while `root_cause_key` identifies the durable causal cluster for `/coalescing`. Repeated events with the same `root_cause_key` update one active alert
- Historical and lifecycle terms stay `family-local`. `archived`, `removed`, and `deleted` remain distinct storage states, and generic `resolved` labels do not overwrite the owner-specific `remediation.resolved` contract; that conflict is a real reconciliation item. Boundary schemas migrate from `tier
- Execution ownership migrations are storage-visible. `Prompt_Pipeline.md` / `Prompt_Pipeline` still consumes `persona_override_owner_id`, but `tier_id` is a legacy scope for Orchestrator execution identity and must migrate toward `/node/attempt/subagent-owned` ownership. `Executor_Protocol.md` / `Exe
- '- Demote TierContext to a derived or compatibility-only selection/decomposition helper'
- '- Any `TierContext` or `tier_id` decomposition is compatibility-only derived metadata for legacy selection helpers and MUST NOT own runtime canon, storage keys, or join identity.'
- '- Active receipt/session lifecycle changes flush immediately or on lifecycle transition, not only on debounce.'
- '- Blocked episode creation/resolution flushes immediately or on lifecycle transition, not only on debounce.'
- Cross-surface panel state is per-project and panel-specific. Source Control persists `source_control.project_state.{project_id}` for selected repo/worktree, `History` and `Graph` filters, and worktree focus; GitHub Actions persists `github_actions.project_state.{project_id}` for selected repo bindin
- 'Docker Manager project-state key migration is one-way: legacy `docker_manager.project_state.*`, `docker.project_state.{project_id}`, `docker.project_state`, `docker_manage_surface_state`, and publish-oriented `/auth/Unraid` panel state are migration-read aliases only. Canonical writes use `container'
stale_retired_dispositions:
- 'Storage owns the durable record families that make runtime, HITL, command, receipt, and projection behavior replayable. The retired heading string `### 5.1B Persona/Runtime Snapshot Payload Contract` maps into attempt and permission snapshot storage: payloads must preserve `{ tool_name`, `invocation'
- '- Projection degradation keeps usable record-backed slices: a stale graph projection may still support focused inspection of selected nodes/generations, and stale ledger/history slices remain usable because they are closer to canonical records.'
- '- Concern acknowledgment is a noise-control mechanism, not a blocked-state suppressor. Quiet windows apply to advisory/pressure warnings; canonical blocked episodes still require action, and degraded/stale disclosure or canonical revalidation is required before projection-heavy surfaces emit strong '
- '- Projection health and `/trust` use one projection-backed contract across Orchestrator, Usage, Source Control, and other storage consumers. Projection states include current, refreshing, stale, degraded, and unavailable; when projections are stale/degraded/unavailable or `/degraded/unavailable`, re'
- 'Projection trust is operational: `projection_freshness` is the recency field and `projection_health` is the reliability/usability field, with states current, refreshing, stale, degraded, and unavailable. The base freshness/health model already carries `/health`; the missing requirement is `trust-sta'
- Migration aliases stay explicit but subordinate. HTE, `/visible/manual-default`, `widget.tier_tree`, phase-grouped run-graph layouts, singular current-task, and `/current-worktree`/current-worktree widgets are compatibility labels that resolve into automation-first runtime mode policy, first-class w
- 'Historical semantics keep `time/replacement/validity status` split into `time status`, `replacement status`, and `validity status` (`/validity`). `archived vs historical` is not a workflow-state choice: `historical` is `/time` record/time truth, `archived` is visibility `/operational-surface` policy'
- Remote editor/search storage treats `remote proxy`, SSHFS-style, and `SSHFS` access as capability profiles over one remote project identity, not separate path authorities. Each profile records whether file-watch is native, proxied, or polling-derived; stale or disconnected remote search snapshots ar
- '- Define shared historical vocabulary: historical, stale_historical, superseded, revoked, reopened, archived, removed.'
- '- Projection freshness is tracked per projection type; stale projections are recomputed at startup.'
- '- Cleanup lineage ensures stale worktrees are eventually removed and audited.'
- 'Historical vocabulary stays explicit: `historical`, `stale_historical`, `superseded`, `revoked`, `reopened`, `archived`, and `removed` are shared storage terms, while family-local workflow states remain family-local.'
- '- Sensitive action gating evaluates both axes together: stale-but-healthy projections can require refresh, degraded projections can fall back to canonical record reads, and unavailable projections block projection-dependent actions.'
- '- `trust_tier` is retired as canonical projection vocabulary and is reserved only for preview/browser semantics where UI transport trust must still be disclosed without replacing freshness or health.'
- 'Required fields on any receipt or blocked-state record that involves a wait, timeout, scheduled observation, reconnect, or stale observation:'
- '- Retention-window anchor semantics are explicit per family: receipts use `creation time` unless a stronger legal-hold or preservation rule applies; log tails and watch buffers use `last observation`; explorer snapshots and stale caches use `last access`; run-scoped completion artifacts use `run com'
- '- Retention policies for receipts, log tails, watch buffers, explorer snapshots, and stale caches MUST store both `retention_anchor_kind` and `retention_anchor_at_utc`; implementations MUST NOT infer the anchor from file mtime alone.'
- '#### Freshness, stale-window, and watch-mode projection rules'
- 'Storage records freshness policy separately from retention. Any record family used for `/watch`, follow-mode, log tails, explorer snapshots, stale caches, or remote runtime projections declares `stale_window_policy`, `stale_window_expires_at_utc`, and the post-expiry behavior: `actionable`, `refresh'
- 'Required stale-window families:'
- '- Actions readiness snapshot: stale data may remain visible, but workflow generation, apply, rerun, cancel, and pin/unpin actions require `refresh-first`.'
- '- Workflow run list/detail: stale rows may be inspected as historical evidence; live log follow and run mutation require `refresh-first`.'
- '- Docker runtime snapshot: stale container/image/compose state is read-only until refresh; lifecycle actions require `refresh-first`.'
- '- Kubernetes workload/watch state: stale workload, rollout, log, exec, and port-forward state is read-only until refresh; rollout mutation requires `refresh-first`.'
owner_boundary_notes:
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '### Owner-first canonicalization order'
- '### Coverage blocker concern lifecycle owner section'
- 'Snapshot vocabulary stays literal for compatibility: `{ tool_name, invocation_summary, options }`, Plans/interview-subagent-integration.md, and /interview-subagent-integration.md are preserved as searchable aliases while the canonical storage owner remains attempt and permission snapshot records.'
- Command records remain graph-local and command-family specific. `cmd.search.replace_selected`, `cmd.runtime`, `cmd.runtime.*`, slash-command, `cmd.nav.focus_route`, `cmd.artifacts.show_in_usage`, and `cmd.orchestrator.open_in_source_control` persist enough route data to restore page/tab/run/thread/i
- Command compatibility terms that remain migration-only include self-contradictory command tables, graph-patch event routes, remediation_parent_attempt_id, usage_sequence, hitl.approval_requested, hitl.approved, request_id, /scope, execution-unit, display-only identity labels, /switch panels, cost_us
- '- Runtime compatibility stays derived: `tier_runtime_record`, tier-shaped records, `tier-targeted` terminal bindings, `tier_id`, `auto`, and `widget.completed_prose` are migration aliases, view overlays, or derived views. `widget.completed_prose` cannot remain completed tier summaries; canonical exe'
- '- Owner-doc supersession cleanup treats request-era, tier-era, `/runtime-era`, and blocked/runtime-era storage families as migration evidence: route/open (`/open`) contracts consume storage records, and multiple execution-era storage tables and record families resolve into the same runtime object fa'
- '- `blocked_sequence` is the identity component for `object_kind = blocked_episode` inside `{ run_id, node_id }` scope; canonical projectors preserve it when writing blocked projections, recovery refs, and Ledger routes.'
- '- `project_summary.v1` rolls up current active run state, dominant concern/blocked owner (`/blocked`), highest-severity attention state, current pressure summary, and health/config integrity (`/config`) without replacing project attention records.'
- '- Non-trivial bundle exports, `Ledger/Usage CSV/JSON`, thread exports, general app exports, and artifact/record bundles use one manifest shape that preserves manifests, canonical IDs/refs, canonical artifact IDs/path rules, scope, included records/artifacts, and trust-state disclosure. View-only exp'
- '- Projection degradation keeps usable record-backed slices: a stale graph projection may still support focused inspection of selected nodes/generations, and stale ledger/history slices remain usable because they are closer to canonical records.'
- '- Concern acknowledgment is a noise-control mechanism, not a blocked-state suppressor. Quiet windows apply to advisory/pressure warnings; canonical blocked episodes still require action, and degraded/stale disclosure or canonical revalidation is required before projection-heavy surfaces emit strong '
- '- Record-family split stays explicit: review finding is produced by a review/corroboration/validation flow, concern is a durable tracked issue/observation (`/observation`), blocked episode is a runtime execution stop with canonical recovery metadata, and annotation is a document-review instruction/c'
- '- Replace pseudo-tier interview/wizard/runtime lineage keys with the same canonical thread/project/run/attempt identity families used elsewhere. The planning/UI docs may describe staged/generated flows, but storage owns one canonical subject-open contract for the first-class staged/generated artifac'
- '- Runtime/account-history reconciliation resolves audit labels into storage-owned joins: `runtime-identity` and `/receipt/account-history` remain requested/effective storage, receipt, and usage join concerns, while `pseudo-target` and `partial-transfer` are migration evidence labels only and must no'
- '- Runtime artifacts must not let `task_id` language drag artifact identity back toward older decomposition terms; artifact identity reconciles through the node/package/seam/lane rewrite and the canonical runtime/artifact refs above.'
- '- Export contracts define canonical manifests before surface views: Orchestrator exports, Ledger/Usage CSV/JSON, thread exports, artifact bundles, record bundles, and general app exports distinguish view-shaped exports from record-shaped bundles. The canonical manifest records export family, scope, '
- '- Legacy `tier` wording that remains in storage, contracts, `user-copy`, or `/help` text is both a data-model risk and a user-copy/help migration risk. Canonical prose must mark tier spellings as compatibility aliases or migrate them to node/attempt/package/seam/lane terms, not leave visible help or'
- '- Artifact lineage and project-artifact, memory, `/handoff`, and handoff joins preserve `/run/thread/wizard/attempt/account` anchors. Project-artifact references are derived from canonical runtime/artifact/receipt joins and must not become a separate identity family that bypasses attempt, thread, wi'
- '- Runtime-era owner docs that require stricter registration/verification/routing resolve through versioned storage and contract fields before catalog, matrix, or gate consumers act on them. `/verification/routing` coverage is required for runtime-era actions and records before `/matrix/gate` decisio'
- '- Startup recovery, counter ceilings/backoff (`/backoff`), DAE `/jail` lifecycle, and attention `/blocked` escalation keep authoritative owner refs in storage records. Cross-doc inference is not enough to own DAE jail state, startup recovery, backoff ceilings, or blocked escalation.'
- '- Projection health and `/trust` use one projection-backed contract across Orchestrator, Usage, Source Control, and other storage consumers. Projection states include current, refreshing, stale, degraded, and unavailable; when projections are stale/degraded/unavailable or `/degraded/unavailable`, re'
owner_hints:
- Plans/storage-plan.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

