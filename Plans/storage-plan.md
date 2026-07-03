# Storage plan (seglog, redb, Tantivy, projectors)


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Owner-first canonicalization order
### Shared governance/runtime record envelope


### Export taxonomy and manifest contract


### Concern record family definition
### Concern lifecycle and resolution kinds


### Focused run and historical routing contract


### Source Control and worktree handshake
### Projection trust and action gating
### Lane vs worktree lifecycle split


### Historical semantic consistency
### Project summary projection


### Project attention projection


### Coverage blocker concern lifecycle owner section
### Concern source-event vs record vs projection split
### Runtime attribution ownership split


### Bridge-field precedence for attempt/provider/usage/receipt joins


### Projection fields for startup rehydration


### Artifacts index exact indexed fields
### Lane cleanup lineage fields
### P5 runtime storage special recovery register

Storage owns the durable record families that make runtime, HITL, command, receipt, and projection behavior replayable. The retired heading string `### 5.1B Persona/Runtime Snapshot Payload Contract` maps into attempt and permission snapshot storage: payloads must preserve `{ tool_name`, `invocation_summary`, and `options }`, plus `result_id`, requested/effective provider, requested/effective model, requested/effective account, requested_persona, effective_persona, permission_snapshot_id, account_switch_reason, account_pressure_episode, requirements_quality_report_ref, and the /chat/GUI disclosure needed by FinalGUISpec.md, UI_Command_Catalog.md, Plans/Contracts_V0.md, Plans/Executor_Protocol.md, Plans/human-in-the-loop.md, Plans/Orchestrator_Page.md, Plans/orchestrator-subagent-integration.md, Plans/Glossary.md, and Plans/storage-plan.md.

Snapshot vocabulary stays literal for compatibility: `{ tool_name, invocation_summary, options }`, Plans/interview-subagent-integration.md, and /interview-subagent-integration.md are preserved as searchable aliases while the canonical storage owner remains attempt and permission snapshot records.

Command records remain graph-local and command-family specific. `cmd.search.replace_selected`, `cmd.runtime`, `cmd.runtime.*`, slash-command, `cmd.nav.focus_route`, `cmd.artifacts.show_in_usage`, and `cmd.orchestrator.open_in_source_control` persist enough route data to restore page/tab/run/thread/inspector context without implying editing/opening. Surface-specific wrappers may stay user-facing, but raw payloads normalize into route-derived target and subject forms; `destination_surface`, `destination_tab`, `object_kind`, `object_id`, `record_id`, `artifact_id`, `attempt_id`, `lane_id`, `worktree_id`, `usage_event_ref`, `filter_payload`, `inspector_target`, `scroll_target`, and `focus_behavior` are canonical command routing fields.

Command compatibility terms that remain migration-only include self-contradictory command tables, graph-patch event routes, remediation_parent_attempt_id, usage_sequence, hitl.approval_requested, hitl.approved, request_id, /scope, execution-unit, display-only identity labels, /switch panels, cost_usage joins, still-structural blockers, node-graph consumers, promotion_class rollups, switch-history, artifact-event records, /completed filters, /failure filters, nice-to-have display fields, /open-subject/bridge-field aliases, project-summary aliases, blocked-owner labels, event-driven transition prose, cross-cutting consumers, operational-identity spelling, /pressure panels, rewrite-era tab pressure, flat-command-only gates, and actor_run_kind route filters.

Runtime storage recovery rules:

- Artifact indexes treat `attempt_id?` and `node_id?` as first-class indexed refs where relevant. Tool events (`tool.invoked`) keep `tool_name`, `run_id`, optional `thread_id`, latency, success, and error as analytics fields, but storage joins them through the same attempt/receipt/usage/artifact attribution packet instead of a separate tool-only identity world.
- Runtime compatibility stays derived: `tier_runtime_record`, tier-shaped records, `tier-targeted` terminal bindings, `tier_id`, `auto`, and `widget.completed_prose` are migration aliases, view overlays, or derived views. `widget.completed_prose` cannot remain completed tier summaries; canonical execution truth lives in `attempt_record`, blocked/runtime records, active work objects, blocked/attention items, lane/worktree state, and object-backed record summaries.
- Owner-doc supersession cleanup treats request-era, tier-era, `/runtime-era`, and blocked/runtime-era storage families as migration evidence: route/open (`/open`) contracts consume storage records, and multiple execution-era storage tables and record families resolve into the same runtime object families instead of remaining parallel canon.
- `blocked_sequence` is the identity component for `object_kind = blocked_episode` inside `{ run_id, node_id }` scope; canonical projectors preserve it when writing blocked projections, recovery refs, and Ledger routes.
- Storage-backed inspectors keep right-side inspectors summary/action (`/action`) oriented, while dense objects open full-record views (`/full-record`) for attempt handoff artifacts, review records, corroboration records, graph patch requests, state transition reports, promotion records, and recovery records.
- Projection consumers map `Progress` to concern attention/urgency (`/urgency`) projection and `Seams` to grouped concern clusters by seam/package (`/package`) and weak-integration category.
- `project_summary.v1` rolls up current active run state, dominant concern/blocked owner (`/blocked`), highest-severity attention state, current pressure summary, and health/config integrity (`/config`) without replacing project attention records.
- Non-trivial bundle exports, `Ledger/Usage CSV/JSON`, thread exports, general app exports, and artifact/record bundles use one manifest shape that preserves manifests, canonical IDs/refs, canonical artifact IDs/path rules, scope, included records/artifacts, and trust-state disclosure. View-only exports may stay lightweight but do not redefine canonical identity; `Project_Output_Artifacts.md` remains the strongest artifact manifest precedent.
- Projection degradation keeps usable record-backed slices: a stale graph projection may still support focused inspection of selected nodes/generations, and stale ledger/history slices remain usable because they are closer to canonical records.
- Lane/worktree lifecycle keeps `baseline`, `active`, `suspect`, `restoring`, `retained`, `cleanup_eligible`, `archived`, `removed`, and `historical` as distinct states. `historical`, `archived`, `removed`, `retained`, and `cleanup_eligible` carry cross-surface meanings and must not collapse into a generic cleanup bucket.
- Concern acknowledgment is a noise-control mechanism, not a blocked-state suppressor. Quiet windows apply to advisory/pressure warnings; canonical blocked episodes still require action, and degraded/stale disclosure or canonical revalidation is required before projection-heavy surfaces emit strong notification claims.
- Record-family split stays explicit: review finding is produced by a review/corroboration/validation flow, concern is a durable tracked issue/observation (`/observation`), blocked episode is a runtime execution stop with canonical recovery metadata, and annotation is a document-review instruction/comment object. Old concern ids remain queryable in Ledger/History after merge/split/supersession, and a newer concern carries lineage back to prior ids.
- The `dashboard_layout:v1` migration contradiction resolves in storage and is cross-referenced from `FinalGUISpec.md`; app-default, project override, and project-scoped persistence must not silently reuse one layout contract for every surface.
- Account identity migration treats `manual_preferred_account_id` as a preference hint only; it does not solve the broader missing `requested_account_id` asymmetry in runtime records, nor replace requested/effective auth/account and upstream provider identity ownership.
- Short-term concern rendering may piggyback on `finding_refs[]` only until a minimal non-remediation `node_concerns[]` projection exists for node-level concern display.
- Execution-role fielding is explicit: add `execution_role` to the effective-resolution record, `attempt_record`, `tier_runtime_record` or successor graph-owned runtime record, and `usage_record`; `extract_tier_id()` is a named migration trap, not just a vocabulary issue.
- Runtime coordination/audit cannot claim both file-based canon and event-sourced canon as primary authority. Storage treats file-based canon as export/inspection mirror material and event-sourced canon as the seglog/source-of-truth path for replayable runtime coordination/audit.
- Replace pseudo-tier interview/wizard/runtime lineage keys with the same canonical thread/project/run/attempt identity families used elsewhere. The planning/UI docs may describe staged/generated flows, but storage owns one canonical subject-open contract for the first-class staged/generated artifact, later filesystem path materialization, and backing-document assignment.
- Runtime/account-history reconciliation resolves audit labels into storage-owned joins: `runtime-identity` and `/receipt/account-history` remain requested/effective storage, receipt, and usage join concerns, while `pseudo-target` and `partial-transfer` are migration evidence labels only and must not become storage record families or owner headings.
- Attention cards, blocked notices, and wizard surfaces must not keep card-local or notice-local activation fields as canon; they resolve through one normalized route target. Migration notes are required when raw local IDs are replaced by normalized `subject_id` or `object_kind/object_id` forms.
- Runtime artifacts must not let `task_id` language drag artifact identity back toward older decomposition terms; artifact identity reconciles through the node/package/seam/lane rewrite and the canonical runtime/artifact refs above.
- Rewrite-root decision routing stays explicit: `rewrite-tie-in-memo.md` is the stronger place to record missing rewrite-root decisions, while `Executor_Protocol.md` remains the stronger runtime baseline and pulls `Orchestrator_Page.md` toward it, not the reverse.
- Search and navigation route through the broad object model. A narrow Source Control panel should not own richer cross-object search; those flows belong in Orchestrator / command-palette flows rather than side-panel SCM UI, and Historical results preserve run context so search does not create silent run-focus jumps.
- Recovery records include `recovery kind`, `safe-point restore`, `restart reconciliation`, `blocked prerequisite resolution`, `lane/worktree restore`, `target scope refs`, `trigger reason`, `preconditions`, `result`, `resulting attempt/run linkage`, and `affected concern refs`.
- Export contracts define canonical manifests before surface views: Orchestrator exports, Ledger/Usage CSV/JSON, thread exports, artifact bundles, record bundles, and general app exports distinguish view-shaped exports from record-shaped bundles. The canonical manifest records export family, scope, canonical IDs/refs, included records/artifacts/references, artifact path rules, superseded/removed/historical backing-object disclosure, trust-state, and whether view re-query or canonical revalidation happened; CSV and JSON are serializations, not source-of-truth.
- Governance storage uses one `governance-record` template for concern, review, promotion, corroboration, graph-patch, and recovery records (`/review/promotion/corroboration/graph-patch/recovery`). That template carries the shared envelope, lineage refs, status, actor identity, timing, evidence refs, artifact refs, source refs, and `/contracts` linkage so those durable records do not emerge ad hoc per surface.
- Legacy `tier` wording that remains in storage, contracts, `user-copy`, or `/help` text is both a data-model risk and a user-copy/help migration risk. Canonical prose must mark tier spellings as compatibility aliases or migrate them to node/attempt/package/seam/lane terms, not leave visible help or schema copy implying tier authority.
- Runtime records for side-effectful or externally-scoped actions include an `operational-identity` block distinct from provider account identity. The block records requested and effective operational refs, kind, selection reason, partial capability, target authority, and surface-specific scope so GitHub, registry, Kubernetes, remote-mode, and other externally scoped actions remain auditable.
- Artifact lineage and project-artifact, memory, `/handoff`, and handoff joins preserve `/run/thread/wizard/attempt/account` anchors. Project-artifact references are derived from canonical runtime/artifact/receipt joins and must not become a separate identity family that bypasses attempt, thread, wizard, account, or handoff lineage.
- Runtime-era owner docs that require stricter registration/verification/routing resolve through versioned storage and contract fields before catalog, matrix, or gate consumers act on them. `/verification/routing` coverage is required for runtime-era actions and records before `/matrix/gate` decisions can claim complete authority.
- Startup recovery, counter ceilings/backoff (`/backoff`), DAE `/jail` lifecycle, and attention `/blocked` escalation keep authoritative owner refs in storage records. Cross-doc inference is not enough to own DAE jail state, startup recovery, backoff ceilings, or blocked escalation.
- Always-on planner or `/overseer` agents, deterministic schedulers with short-lived agents, and mixed execution models are execution-policy choices outside storage identity. Storage records actor refs, overseer relationships, bounded context lineage, and graph decomposition refs without recreating tier authority as a second execution model.
- Projection health and `/trust` use one projection-backed contract across Orchestrator, Usage, Source Control, and other storage consumers. Projection states include current, refreshing, stale, degraded, and unavailable; when projections are stale/degraded/unavailable or `/degraded/unavailable`, record-backed fallback views stay available for selected canonical slices, and sensitive actions require direct canonical revalidation before execution.
- Large-run density is a real-world storage concern: many active and historical concerns, corroboration `/review/promotion/recovery` records, retained lanes, and cleanup-eligible lanes/worktrees (`/worktrees`) must remain separately queryable instead of collapsing into one graph-only summary.
- Contract naming drift and native-surface ownership are highest-risk reconciliation areas. Storage names record families and projection keys at the owner boundary first, then consumer docs expose native-surface labels only as display or route wrappers.
- Cross-surface receipt refs stay trust-safe linkage, not the sole operational-identity disclosure model. Follow-on cleanup prefers receipt/attempt-based (`/attempt-based`) routing over ad-hoc page-local refs, while preserving receipt refs as cross-surface pivots.
- Project-level attention remains object-first, not notification-first: a project may have many badges or warnings, but the attention center points to the canonical owning object and next action path rather than copied banner text.
- Project `/card` and badge rollups show the highest-severity active item plus a count, while the attention center keeps each active item separately object-linked; rows must not collapse into one synthetic "project blocked" blob.
- Search, attention, and usage `/artifact` pivots use a shared route-target model. Feature-specific local identity is allowed only as a resolver input that normalizes into route-target or subject/object refs before storage writes.
- Simple tabular `/view` exports may stay lightweight, but any non-trivial bundle export preserves canonical IDs/refs (`/refs`) and includes the manifest, so export identity does not degrade into detached view data.
- Graph patch request/decision records preserve `/decision` and `/generation` history: an old path or generation can become historical, an invalidated prior path may be superseded by a newer generation, and the patch decision itself may later be historical without being revoked.
- Attention delivery keeps `/in-app` advisory concerns distinct from seam-blocking weak-integration concerns. `/minor` advisory rows stay local or in-app, while seam-blocking concerns with no progress can escalate to blocked surfaces and system notification according to severity and elapsed time.
- Review findings may nominate or update concerns, corroboration may validate or downgrade a concern to advisory/minor, graph patches may create post-patch concerns, recovery may create follow-on concerns, and blocked episodes may reference concerns when they become execution-blocking; none of those flows replace the concern record.
- Spec-integrity failures become concrete reconciliation targets before they are treated as `/resolved`; structural owner gaps must be assigned and resolved rather than left as live ambiguity or reopened core model questions.
- Runtime-governance gaps have explicit storage/policy homes: startup recovery, backoff, counter ceilings, DAE `/jail` lifecycle, account-switch strategy invalidation, and wizard blocked-escalation semantics resolve through policy, `/run-mode/gate`, and storage-owned recovery records rather than scattered addenda.
- FileManager, editor, Artifacts, and Orchestrator open flows share one identity model. `/editor/Artifacts/Orchestrator` pivots normalize into the same route-target, subject, and object refs instead of ad hoc open handlers per surface.
- Mirrors and `/checklists` update only after owner/consumer canon is stable; checklist or mirror propagation is a downstream `/consumer` step after owner storage and contract evidence has passed.

### Cross-surface receipt record storage recovery

The receipt family is not a junk drawer. `orchestrator.receipt.{run_id}.{attempt_id}` and `orchestrator.receipt` bridge attempts, usage, evidence, runtime artifacts, and UI surfaces, but lifecycle truth remains in `attempt_record`, `usage_record`, `evidence_record`, `scheduler_pass_record`, `blocked_projection.{run_id}.{node_id}.{blocked_sequence}`, `wizard_runtime_state`, artifact-index records, and worktree/lane records. Receipts are useful cross-surface pivots, but `orchestrator.receipt` is not enough to replace durable worktree/lane lifecycle records or `/lane` ownership state. Cross-surface receipt records require `project_id`, actor refs, `created_at_utc`, and `usage_event_ref` whenever a surface may pivot historically or across projects. `usage_event_ref` and `usage_event_id` are receipt and Usage/docs join fields, while `provider_attempt_ref` joins provider traces; downstream surfaces must join them coherently instead of substituting one for the other. Usage/artifact flows must not keep `usage_event_ref` as a first-class top-level route selector; storage normalizes it into object identity and receipt/usage joins.

The receipt blocker set remains explicit: `gap-004`, `gap-006`, `gap-005`, and `gap-008` cover missing owner anchors, projection-freshness, identity-thin wrappers, owner-kind disclosure, graph-local wiring, /wiring, /action/governance, /isolation, workspace_path, /theme/account-policy, /rollup, active-run, /lifecycle, field-shape, /what, /operational, /raw, and /subject migration aliases. The old `exact_items` evidence labels are not runtime records; storage resolves them into record-envelope rules and first-class object families.

### Runtime object family ownership

Runtime storage is SSOT for record-shaped state, not for every consumer surface. The canonical family bundle includes `{project`, `run`, `seam`, `package`, `node`, `attempt`, `lane`, `promotion`, `review`, `resolution_thread}`, plus `project_id`, `run_id`, `seam_id`, `package_id`, `node_id`, `attempt_id`, `lane_id`, `worktree_id`, `safe_point_id`, `wizard_id`, `thread_id`, `document_id`, `artifact_id`, `concern_id`, `promotion_id`, `detail_ref`, `source_refs`, `source_refs[]`, `artifact_refs`, `artifact_refs[]`, `evidence_refs`, `evidence_refs[]`, `created_at_utc`, `created_by_kind`, `created_by_ref`, `superseded_by_record_id`, `record_kind`, and `record_id`.

The compact object-family tuple `{project, run, seam, package, node, attempt, lane, promotion, review, resolution_thread}` is a shorthand for the same record family set, not a separate schema.

Attempt and execution-session records carry orchestration-specific identity. They include execution_unit_context, optional decomposition_context and view_context for legacy prompt or UI help, action-family, execution_role, operational_identity, actor-aware /actor-snapshot, actor-role, actor_role, run-level, feature_seam, feature_seam_id, work_package, work_package_id, package-governance, seam-promotion, execution-context, selected_worktree_id, selected_repo_id, workspace_ref, mutation_capable, side-effect, and provider_attempt_ref. Role-scoped execution uses `execution_role` plus `actor_role`, `allowed_roles?`, and `disallowed_roles?`; effective-resolution/runtime and usage records identify which role actually executed the attempt/message. They must expose requested-side and effective-side identity for /model/auth/account, /effective, /routing, identity-contract, requested-vs-effective, admin-capability, switch-reason, login, REST, remote-mode, account-identity, effective-account, and provider-facing disclosure-only values. `operational_identity` records which operational identity the action was actually aimed at, distinct from the provider account used to execute it. Decision and `/permission` records follow the same requested/effective identity rule: permission snapshots preserve requested state and identity context, not just runtime event records, so rewrite-era requested/effective disclosure remains auditable.

Effective identity projections consume the effective-resolution record family; `effective-resolution` is the migration spelling for that same storage join.

Legacy tier and event names are compatibility aliases only. Storage may ingest `run.tier_started`, `run.tier_completed`, `run.persona_stage_changed`, `tier_runtime_record`, `tier_id`, `tier_type`, `tier-era`, `tier-start`, `tier-boundary`, `PuppetMasterEvent`, `PuppetMasterEvent::*`, `PuppetMasterEvent::Output`, `PuppetMasterEvent::TierChanged`, `PuppetMasterEvent::IterationStart`, `PuppetMasterEvent::EvidenceStored`, `PuppetMasterEvent::UserInteractionRequired`, `TierChanged`, `IterationStart`, `EvidenceStored`, and `UserInteractionRequired` as migration inputs, but canonical runtime-core records persist node/attempt/package/seam/lane identity. Any surviving `PuppetMasterEvent::*` and `TierChanged` / `request_id` `live-status` references are compatibility transport or migration notes, not the primary operational source and not replacements for blocked-projection or `blocked_projection` contracts. `attempt_record` is the rewrite-era execution unit owner; `tier_runtime_record` remains tier-shaped compatibility progress state and must not own canonical execution-unit identity.

Runtime ownership references Plans/Provider_Stream_Mapping_External_Reference_A2A.md and /Provider_Stream_Mapping_External_Reference_A2A.md only as adapter evidence; it does not let adapter stream names redefine storage state.

### Worktree, lane, and source-control storage

The worktree/lane family is first-class. Storage records durable worktree_id and lane_id identities, source_control.project_state.{project_id}, source_control projections, package-lane lineage, lane-pool membership, /delegation/worktree metadata, /worktree/baseline/artifact refs, baseline, active, retained, suspect, restoring, cleanup_eligible, archived, historical, removed, /removed, /baseline, /history/audit, /split/supersession, /superseded, /predecessor, reverse-merge, lineage-changing, lineage-aware, commit-range, and multi-identity SCM audit. Source Control uses a concrete worktree-first row posture: `live`, `dirty`, `conflict`, `orphaned`, `recovering`, `retained`, `archived`, and `removed`. The compact lifecycle vocabulary `baseline/active/suspect/restoring/retained/cleanup_eligible/archived/removed/historical` is a migration alias for those individually queryable states, not a collapsed generic worktree state. `WorktreeGitImprovement.md` owns operational behavior, cleanup/archive/remove rules including `/archive/remove`, and UI expectations for Source Control and Orchestrator; storage owns persisted lifecycle/history state and projection joins.

Project registry state stays narrow. `projects:v1` is a registry, while `project_state:v1:{project_id}`, `orchestrator.project_state`, and `orchestrator.project_state.{project_id}` persist shell/UI state such as focused_run_id, per-tab state, active-agents, active-agents.json, project-state, /project, /state, /queue, /refresh, active-run, and focused run context. Project summary and attention projections are separate: `project_summary.v1`, `project_attention_item.v1`, project_summary, project_attention_item, thread_blocked_notice, activity, attention, health, health status, and under-defined rollups must not turn the registry into an operational junk drawer. The canonical project-summary/project-attention projection owner is this storage family, and its `/record` reconciliation plan must resolve contradictory event/record families already identified in SSOTs instead of overloading `projects:v1` or `project_state:v1:{project_id}`. `resume_url` may remain one serialized route form, but project attention aligns with the shared internal route payload model rather than inventing a separate routing identity.

Consumer docs that must not own storage include Run_Graph_View, Plans/Widget_System.md, /Widget_System.md, Crosswalk.md, Decision_Log, and Decision_Log.md; they consume storage records through route/open, projection, and history views.

### Projection, concern, and historical semantics

Projection trust is operational: `projection_freshness` is the recency field and `projection_health` is the reliability/usability field, with states current, refreshing, stale, degraded, and unavailable. The base freshness/health model already carries `/health`; the missing requirement is `trust-state` operationalization, where storage decides when stale or degraded projections can be inspected, when canonical revalidation is required, and when mutation or export authority is withheld. Degraded projections fall back to record-backed History, Ledger, /Ledger, /ledger/detail, /JSON, /artifact, exact record inspectors, Ledger-backed inspector routes, and /degraded routes before enabling mutation CTAs; a deep link to a concern during projection degradation routes to the exact record view instead of the normal rollup tab presentation. Projection-trust UI, /gating/fallback, /surface, /open, /opening, /tab/run/thread/inspector, and first-class projection routes must remain separate from storage ownership.

Concern, annotation, blocked, wizard, and remediation lifecycles are family-specific. Concern lifecycle remains `active -> acknowledged -> resolved -> dismissed`; annotation examples may use `open -> addressed -> resolved`; wizard status distinguishes attention_required from blocked. `acknowledged` means a user/operator (`/operator`) has seen and accepted the concern as still real without requiring immediate noise; `dismissed` means the presentation was intentionally hidden or `/rejected` as actionable framing and requires rationale when it disagrees with corroborated or `/high-severity` evidence; `resolved` means the underlying truth changed and records `resolution_kind`. Review findings may nominate a concern or attach evidence to an existing concern, and a corroborated nomination may promote into an accepted canonical `concern_record` with lineage back to the finding and evidence. Corroboration may confirm/deny/escalate/downgrade (`/deny/escalate/downgrade`) concern credibility, graph patches may resolve or supersede concerns, and recovery may resolve operational concerns or create follow-on concerns when `/recovery` exposes deeper integrity issues. `reopened`, `revoked`, and `superseded` are reserved for lineage-changing transitions, while /dismissal, /compensating-action, /approval, /approval/promotion, accepted risk, /retire, /deleted, hard-delete, and reverse-merge history rules preserve canonical history. A concern undo is a compensating follow-up record, not history erasure.

Direct-record actionability is storage-backed rather than projection-inferred. `action-capable` direct records include promotion record, graph patch record + state transition report, recovery/restore record, and concern record for acknowledge/dismiss style actions. Any direct record view that allows action must display currentness, generation match, superseded yes/no, and actionable yes/no before surfacing mutation controls; `/dismiss` remains concern lifecycle action vocabulary and `/restore` remains recovery lineage vocabulary.

Blocked and recovery actionability stays keyed to canonical runtime identity. `blocked_projection` is keyed by `run_id`, `node_id`, and `blocked_sequence`; `allowed_action_ids` and `allowed_action_ids[]` identify permitted direct actions; `attempt_record` carries scheduler/safe-point/remediation/runtime identity fields for `/safe-point/remediation/runtime` so recovery context can reopen without inferring identity from live UI state.

Storage keeps the orchestration source stack explicit: `event/source-of-truth` (`/source-of-truth`) aspects live in seglog, `projected/current-state/read-optimized` (`/current-state/read-optimized`) aspects live in redb, and `/inspection` export views are JSON/JSONL (`/JSONL`) only when the user requests them from UI surfaces such as Orchestrator. Loose JSON files are never the canonical source for these artifacts.

The `multi-account` storage model preserves project settings, run snapshot, and attempt record boundaries. `/account/execution-role` and provider/account/execution-role precedence are resolved by the shared account/runtime contracts, but storage records the resolved run snapshot and attempt record inputs so later usage, receipt, and blocked-state projections can explain which provider, account, and execution_role rule won.

Account pressure episodes are durable attribution records, not UI-only account hints. `account_pressure_episode` carries `episode_id`, `project_id`, `provider_id`, `account_id`, `execution_role?`, `source_kind`, `signal_confidence`, `pressure_kind`, `projected_remaining?`, `reset_at?`, `started_at_utc`, `updated_at_utc`, `ended_at_utc?`, and `status`; status values are `active | cooled_down | resolved | invalidated`, with `cooled_down` preserved as a queryable state rather than flattened into resolved.

Migration aliases stay explicit but subordinate. HTE, `/visible/manual-default`, `widget.tier_tree`, phase-grouped run-graph layouts, singular current-task, and `/current-worktree`/current-worktree widgets are compatibility labels that resolve into automation-first runtime mode policy, first-class worktree/lane records, native graph/history/evidence/ledger projections, and route/open state. Glossary-era aliases such as `Feature Seam`, `Work Package`, `Node`, `Package Overseer`, `Seam Overseer`, `Weak Integration`, `Promotion`, `Corroboration`, `Graph Patch`, `Graph Generation`, `Concern`, `Lane`, `Lane Pool`, `Worktree`, `Historical Run`, `Reopened`, `Revoked`, `Superseded`, `stale_historical`, current, refreshing, stale, degraded, and unavailable stay searchable while resolving into the canonical storage families above. `Run_Modes`, `Run_Modes.md`, `newtools.md`, and approval consumers may surface HTE or `/visible/manual-default`, including legacy approval-flow assumptions that interactive or visible execution was treated as the normal baseline, but storage treats them as explicit mode overrides rather than the baseline. `Plans/human-in-the-loop.md` and `/human-in-the-loop.md` request `/tier-era` canon are migration evidence only; canonical HITL behavior is the blocked-runtime overlay.

Historical semantics keep `time/replacement/validity status` split into `time status`, `replacement status`, and `validity status` (`/validity`). `archived vs historical` is not a workflow-state choice: `historical` is `/time` record/time truth, `archived` is visibility `/operational-surface` policy, and `removed` is lifecycle/tombstone state. `stale_historical` is stronger than plain `historical`: it carries `/non-live` and non-resumable semantics, and attempts may expose when later remediation or `/graph` generation supersedes an older attempt. `superseded`, `revoked`, and `reopened` apply only where real object lineage or validity relationships exist, not to arbitrary project runs. Concern history keeps active, acknowledged, resolved, and dismissed lifecycle states plus merged/split/superseded and `/split/superseded` concern records. `resolved-but-historical` records retain concern lineage after resolution; Evidence stores concern-backed proof and source artifacts, while History stores concern timeline and major lifecycle transitions. History remains broadly usable under degraded projections because chronological record slices can fall back closer to canonical events and record-backed History before mutation CTAs are enabled.

### Artifact, route, and export storage

Artifact and file/storage ownership is identity-first. Storage registers artifact-index records, artifact_type, runtime-artifact payloads, open-by-identity refs, preview_subject_id = doc:<document_id> | artifact:<artifact_id>, linked_artifact_id, logical artifact IDs, generated/runtime identity, /file/storage, /file-management, /runtime, /storage, /state, /event, /projection, and /record joins. Low-level `/Actions/Docker/Kubernetes` artifact pivots and validation pass-report lineage normalize through those same refs rather than inventing separate surface IDs. Runtime artifacts normalize `attempt_id`, `node_id`, `execution_role`, `provider_attempt_ref`, and `operational_identity` at the envelope or linked-record boundary so cross-surface receipt linkage can recover who produced the artifact and under which target identity. Runtime lineage refs include `attempt:<attempt_id>`, `safe_point:<safe_point_id>`, `remediation:<remediation_root_id>`, and `scheduler_pass:<scheduler_pass_id>`; these resolve through projections `/indexes` to the strongest openable target, including `/artifact`, `/document/report`, detail record, generated buffer, or a related surface pivot when `file-open` is not the right UX. Records and artifacts stay separate: a record is the canonical structured object in Ledger/export/search/routing (`/export/search/routing`), while an artifact is the file/blob/renderable (`/blob/renderable`) output linked from that record. Canonical findings summaries, prose summaries, and `/views` are artifacts/views that must resolve back to exact records rather than becoming replacement sources. `Plans/**` docs may consume these IDs, but storage owns persisted refs like resume_url and route-derived refs; route identity itself belongs to the shared command/open contract.

Export families stay distinct. Run export, Ledger export, Evidence export, CSV, JSONL, record-shaped bundles, scope-keyed manifests, surface-local view exports, and DRY_Rules / DRY_Rules.md compliance records must preserve canonical IDs and `trust-state` disclosure instead of creating export-local shadow identity; exports built from projections require canonical revalidation before claiming current authority. Pass-report, pass_verdict, phase_plan_ref, requirements_quality_report_ref, evidence_id, workflow_run_id, /branch, /Source, /docs, /Usage, and /consumer joins are export and inspection refs, not alternate storage owners.

Storage migration is prose-rule driven and forward-only. Low-level actually-populated fields may keep migration aliases for request-era, blocked-state, restore point, /block, /blocked/wizard, `/system`, /help/cross-doc, and under-specified terms, but owner-routing, policy-layer, schema-owner, non-weak-integration, multi-package, packages, /reusable, /accepted, /promoted/active, /wizard/interview, /wizard/validation, /Actions/Docker/Kubernetes, /Seams/Evidence/History/Ledger, /lifecycle/projection, /scheduler/worker/governance/storage/UI, and GUI/HITL/SSOT wording must resolve into the canonical object families above. Event naming and command extraction rules across catalog/storage/wiring and `/storage/wiring` are reconciled here before any automated gate trusts doc parsing. New docs/producers (`/producers`) must prefer canonical route-target forms; consumers may accept older wrapper-local payloads during migration, but migration aliases must not become permanent parallel canon. Graph/Evidence/Ledger and `/Evidence/Ledger` search can remain tab-local inside those tabs, while Orchestrator search may be page-level, `/or` command-palette integrated, or both; all cases reuse storage routing fields so Ledger, exports, search, and `/routing` inspect record families consistently.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

**Date:** 2026-02-20
**Status:** Implementation checklist + detailed design
**Cross-references:** Plans/rewrite-tie-in-memo.md, Plans/assistant-chat-design.md (§10-§11, §24), Plans/assistant-memory-subsystem.md, Plans/usage-feature.md, Plans/FileManager.md (§2.9), Plans/Tools.md (§8.0, §8.4 -- tool events and rollups), AGENTS.md. **Validation:** Deterministic verifier gates plus SSOT acceptance/evidence contracts are authoritative for this stack (`python3 scripts/pm-plans-verify.py run-gates`, `Plans/Progression_Gates.md`, `Plans/evidence.schema.json`); SQLite remains off the table.

---

## Summary

Storage for the rewrite follows a multi-store design: **seglog** as the canonical append-only event stream, **redb** for durable KV state (settings, sessions, runs, checkpoints, editor state, analytics rollups), and **Tantivy** for full-text search. Projectors consume seglog and maintain a JSONL mirror, Tantivy indices, and redb state. Analytics scan jobs compute rollups from seglog and store them in redb for fast dashboard and Usage queries. This plan specifies **how** we implement it: file locations, event format, redb schema, projector behavior, and how we address gaps, failure modes, and optional enhancements.

---

## Table of Contents

1. [Definitions and concepts](#1-definitions-and-concepts)
2. [How we're going to do it](#2-how-were-going-to-do-it)
3. [Implementation checklist](#3-implementation-checklist)
4. [Impact on chat (Assistant / Interview)](#4-impact-on-chat-assistant--interview)
5. [Gaps and how we address them](#5-gaps-and-how-we-address-them)
6. [Potential problems and solutions](#6-potential-problems-and-solutions)
7. [Enhancements](#7-enhancements)
8. [Implementation order and testing](#8-implementation-order-and-testing)

---

## 1. Definitions and concepts
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md

### Additional shell/runtime identities required by the promoted Section 15 feature set


The storage model MUST treat the following as first-class identities when the feature is enabled:
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

- `workspace_tab_id`
- `window_id`
- `browser_tab_id`
- `preview_session_id`
- `terminal_section_id`
- `terminal_tab_id`
- `terminal_pane_id`
- `terminal_session_id`
- `dev_session_id`
- `branch_id` for branched conversation/session lineage

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

Identity rules:
- `project_id` is stable across path rebinding and restore operations; raw path is not the canonical identity
- `workspace_tab_id` is distinct from `project_id`
- `browser_tab_id` is distinct from `preview_session_id`
- `terminal_section_id` owns presentation continuity and dock or detach realization
- `terminal_tab_id` owns tab continuity, label, pin state, and order within a terminal section
- `terminal_pane_id` owns split-tree slot continuity and visible binding location
- `terminal_session_id` owns exact PTY continuity
- `dev_session_id` owns higher-level dev workflow continuity and MUST NOT replace `terminal_session_id` when exact shell reuse is required
- detached windows and ephemeral automation/auth sessions have separate persistence scope from workspace-tab shell state

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md

Additional terminal identity rule:
- command-block and transcript metadata may reference stable per-session command-block identifiers, but command-block identity is subordinate to `terminal_session_id` rather than a peer replacement for it

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md
## 2. How we're going to do it

### 2.1 File locations and directory layout

All storage lives under a single **app data root** (for example `~/.puppet-master/`, `$XDG_DATA_HOME/puppet-master/`, `%APPDATA%/puppet-master`, or `~/Library/Application Support/puppet-master`). Project-scoped runtime state still lives under `.puppet-master/` inside the workspace when the feature is inherently project-local.

| Path (relative to app data root) | Purpose |
|----------------------------------|---------|
| `storage/seglog/` | Append-only seglog segments or rolling event log files |
| `storage/redb/` | redb database files for settings, checkpoints, snapshots, and rollups |
| `storage/jsonl/` | Human-readable JSONL mirror emitted by projectors |
| `storage/tantivy/projects/{project_id}/` | Per-project Tantivy indices (`chat`, `code`, `logs`, optional `docs`) |
| `storage/blobs/` | Blob store for large secrets-scrubbed payloads referenced by `blob_ref` |
| `storage/backups/` | Optional point-in-time recovery copies |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md

Regex-index storage policy: `regex_index/` lives under `.puppet-master/` managed state, not inside the user's repo/Git working tree, so no separate gitignore rule is required for ordinary project Git state. Regex-index directories use OS-specific indexer exclusions: Windows applies `FILE_ATTRIBUTE_NOT_CONTENT_INDEXED` via `SetFileAttributesW`, macOS creates `.metadata_never_index` using the Spotlight convention, and Linux needs no default system-indexer marker. These exclusions prevent Spotlight/Defender I/O contention and file locks during builds.

Regex-index algorithm policy: PM does not adopt probabilistic Blackbird-style posting augmentation as canonical storage. `nextMask` and `locMask` near-quadgram bloom masks are source-reference evidence only; BUT they are rejected for dynamic PM indexes because saturated bloom masks eventually match everything and degrade back toward full scans under frequent updates. Canonical PM storage keeps deterministic sparse n-gram postings plus authoritative ripgrep verification.

Regex-index implementation dependencies are `regex-syntax`, `roaring`, `memmap2`, `xxhash-rust`, `arc-swap`, and `thread-priority`. `trigrep` and `fast-grep-rust` remain algorithmic references only, not runtime dependencies.

Regex-index n-gram hashing uses xxHash (`xxh3`) through the `xxhash-rust` crate as the 64-bit hash function for n-gram keys. Classification: Non-cryptographic. Rationale: Fast with excellent distribution for index-key hashing, not security-sensitive hashing.

Regex-index compression and metadata policy: each posting list is a Roaring Bitmap (`roaring` crate) over `u32` file IDs, highly compressed for dense and sparse sets, and supports fast intersection/union (`/union`) for multi-n-gram queries. `index_meta.json` carries `anchor_sha: string | null` (Git HEAD SHA, null for non-Git), `build_timestamp_utc` as ISO-8601 with Z, `schema_version: u32` starting at 1 and incremented on format-breaking changes, `file_count: u32`, `generation: u64`, `case_sensitive_fs: bool`, `roaring_format: "portable"`, and `checksums` as per-file xxh3 hex strings exactly shaped `{ "file_map": "<hex>", "lookup": "<hex>", "postings": "<hex>" }`. Dirty file lists are in-memory only per `/Q19`.

Remote Git regex-index cache policy: on remote project open, PM stores the local Git cache under `.puppet-master/cache/r/{hash8}/git/`, with remote submodules under `.puppet-master/cache/r/{hash8}/git/m/{sub_hash8}/` and submodule repositories under `git/modules/{submodule_path}/`. Clone mode may be full, shallow, or partial (`/shallow/partial`), but bare-clones are the storage shape: PM may run `git clone --bare ssh://remote_host/path/to/repo` or `git -c core.sshCommand="ssh -J remote_host" clone --bare`, where `core.sshCommand`, `remote_host`, `//remote_host/path/to/repo`, and remote `URL` handling are recorded for reproducibility. If auth or `/network` topology means the repository is only reachable from the remote host, PM initiates the clone remotely and streams a `git bundle` over SSH; if that fails, it falls back to the non-Git remote path.

Remote-project storage split: Git-backed remote projects keep local Git cache, dirty staging, and regex-index snapshots under the cache root, while non-Git remote projects use the remote-build/local-query path below. Storage records that split without re-owning remote-search behavior, remote-only settings, or `/admin` controls, which remain governed by `Plans/GitHub_Integration.md`.

Remote Git index builds read bare-clone content with `git cat-file --batch` rather than filesystem walks and apply the same CRLF-strip -> ASCII-lowercase -> n-gram extraction pipeline as local projects. If a remote Git repo has no public clone URL, PM cannot bare-clone it directly and falls back to Option 2: remote-build, local-query, remote-verify.

Remote Git fetch cadence is on project open, every 5 minutes after the prior fetch+build cycle completes, and explicit user `/sync`, pull, or refresh action; webhook or push notification remains aspirational and not MVP-required.

Remote submodule and verification policy: CRITICAL FIX for bare-clone and recurse-submodules behavior is that `--recurse-submodules` is ignored with `--bare`, so PM parses `.gitmodules`/gitmodules, separately bare-clones each submodule repo after validating submodule paths, stores them under `git/modules/{submodule_path}/`, and includes `/modules/{submodule_path}/` content by reading the gitlink-referenced commit via `git show`. Bare Git clones cannot be searched directly by ripgrep; CRITICAL FIX verification resolves `file_id -> path`, runs `git show {anchor_sha}:{path}` / `git show {anchor}:{path}` / `git show {sha}:{path}` and pipes that content to ripgrep, while index-build bulk content reads use `git cat-file --batch`.

During bare-clone index builds that enumerate files with `git ls-tree` / `ls-tree`, PM detects case-insensitive filesystems, deduplicates entries by lowercased path, keeps the first entry encountered, and logs a `case-collisions` warning when later entries collapse to the same normalized path.

Remote dirty-file locality and re-anchor policy: dirty remote content is staged locally at `.puppet-master/cache/r/{hash8}/dirty/{relative_path}` so ripgrep can verify dirty files from local storage and keep the near-zero-SSH-during-grep guarantee. Content arrives with the file-change notification for files up to 1 MB or through background prefetch for larger files; if grep outruns that prefetch, PM may block briefly and then fall back to SSH ripgrep for that file. This near-zero policy SUPERSEDES any absolute zero-SSH claim for >1 MB dirty files. The dirty staging area is merged into the next re-anchor build before clearing.

Remote editor/search storage treats `remote proxy`, SSHFS-style, and `SSHFS` access as capability profiles over one remote project identity, not separate path authorities. Each profile records whether file-watch is native, proxied, or polling-derived; stale or disconnected remote search snapshots are `/read-only` until refresh, while dirty remote buffers remain local pending-sync state until the effective destination confirms write success.

Dirty-layer generation clearing is a CRITICAL FIX: dirty-layer entries carry a monotonically increasing `generation: u64`; when a re-anchor build starts, PM records `build_generation`, and on build completion clears only entries with `generation <= build_generation` / `generation ≤ build_generation`. Entries added during the build (`generation > build_generation`) survive so a long-running build cannot lose files dirtied during that build.

Dirty-layer concurrency uses `RwLock<HashMap<PathBuf, DirtyEntry>>`. Each `DirtyEntry` carries the generation counter and deleted flag; PM-mediated writes take a brief write lock for synchronous inserts, file watcher inserts are async backup/dedup, and query readers clone the relevant dirty entries at query start.

Regex-index snapshot publication is a CRITICAL FIX: PM publishes `ArcSwap<Arc<IndexSnapshot>>` using the `arc-swap` crate. `IndexSnapshot` holds the mmap handle for `lookup.bin`, the postings file handle, `file_map` data, and `index_meta`; the builder constructs a new snapshot from `gen-{N+1}/` and performs one atomic pointer swap. Readers hold `Arc` references until query completion, old generation directories are cleaned only after the last reader exits, and the generation-directory design removes rename-of-mmap'd-file / d-file hazards on Windows and eliminates multi-file rename atomicity issues.

Regex-index durability before publish: all new generation files are flushed with `File::sync_all()` / `sync_all` before ArcSwap publication, preventing a crash-after-swap-before-flush from leaving truncated content behind valid filenames.

Anchor SHA reachability policy: if `git cat-file -t {sha}` fails because the indexed SHA was garbage-collected, rebased away, shallow-pruned, or no longer reachable from current HEAD, PM treats the index as invalid, triggers a full rebuild from current HEAD, emits an info-level log, and does not surface a user-visible error.

Regex-index memory budget: steady-state peak RSS contribution is typically under 500 MB because only `lookup.bin` is mmap'd and postings are streamed by offset; incremental rebuilds may temporarily use `O(index_size) RAM` and roughly `1.5x index size` while running in the background.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md

#### Local project regex-index layout


### 2.1 Regex-index cache layout and Windows compatibility

| Path (relative to project root) | Purpose |
|----------------------------------|---------|
| `.puppet-master/project/state/regex_index/` | Root directory for the per-project sparse n-gram index |
| `.puppet-master/project/state/regex_index/frequency_table.bin` | Project-specific blended frequency table (256x256 `u16`) used by both build and query |
| `.puppet-master/project/state/regex_index/gen-{N}/` | Generation-numbered snapshot directory (`u64`) |
| `.puppet-master/project/state/regex_index/gen-{N}/postings.bin` | Roaring Bitmap posting lists keyed by xxh3 hash |
| `.puppet-master/project/state/regex_index/gen-{N}/lookup.bin` | Sorted mmap-friendly hash-to-offset table |
| `.puppet-master/project/state/regex_index/gen-{N}/file_map.bin` | `u32 file_id -> relative path` mapping, forward-slash normalized |
| `.puppet-master/project/state/regex_index/gen-{N}/index_meta.json` | Snapshot metadata: anchor, schema version, checksums, generation, compatibility flags |

ContractRef: ContractName:Plans/Tools.md, Invariant:INV-002, ContractName:Plans/Architecture_Invariants.md

#### Remote Git project regex-index cache layout

| Path (relative to app data root) | Purpose |
|----------------------------------|---------|
| `.puppet-master/cache/r/{hash8}/` | Remote project cache root (`hash8` = first 8 chars of xxh3(project_id)) |
| `.puppet-master/cache/r/{hash8}/git/` | Bare Git clone for the primary repository |
| `.puppet-master/cache/r/{hash8}/git/m/{sub_hash8}/` | Bare Git clones for submodules (recursive, max depth 5) |
| `.puppet-master/cache/r/{hash8}/dirty/` | Local staging area for remote dirty-file content used by verification and re-anchor merge |
| `.puppet-master/cache/r/{hash8}/regex_index/` | Same snapshot layout as local projects (`frequency_table.bin` + `gen-{N}/...`) |
| `.puppet-master/cache/r/{hash8}/manifest.json` | `hash8 -> project_id/submodule_path` mapping for recovery, MAX_PATH mitigation, and cleanup |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/BinaryLocator_Spec.md

#### Remote non-Git project regex-index cache layout

| Path (relative to app data root) | Purpose |
|----------------------------------|---------|
| `.puppet-master/cache/r/{hash8}/` | Remote project cache root |
| `.puppet-master/cache/r/{hash8}/regex_index/` | Transferred sparse n-gram snapshot built on the remote host |
| `.puppet-master/cache/r/{hash8}/regex_index/frequency_table.bin` | Remotely computed blended frequency table copied to local cache |
| `.puppet-master/cache/r/{hash8}/regex_index/gen-{N}/postings.bin` | Transferred postings snapshot |
| `.puppet-master/cache/r/{hash8}/regex_index/gen-{N}/lookup.bin` | Transferred lookup snapshot |
| `.puppet-master/cache/r/{hash8}/regex_index/gen-{N}/file_map.bin` | Transferred file map snapshot |
| `.puppet-master/cache/r/{hash8}/regex_index/gen-{N}/index_meta.json` | Transferred metadata snapshot |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/BinaryLocator_Spec.md, ContractName:Plans/Tools.md

Total local footprint for a remote project: Git cache (varies by clone depth and history size) + sparse n-gram index (~1-10% of source size). Shallow and partial clone settings reduce the Git cache portion; index size scales with current source tree size, not repository history depth.

Windows compatibility note for `storage-plan.md ### 2.1`: PM mitigates MAX_PATH with hash-based short paths such as `.puppet-master/cache/r/{hash8}/git/m/{hash8}/` (`/cache/r/{hash8}/git/m/{hash8}/`) where `hash8` is derived from `xxh3(full_id)`, and `manifest.json` keeps the full `full_id` mapping. The Windows app manifest also declares `longPathAware` as `<longPathAware>true</longPathAware>` (`/longPathAware`) as defense-in-depth; both mitigations apply together.

### 2.1.1 Remote Git cache settings

Remote cache settings are per-project with global defaults:
- Shallow clone is OFF by default; when enabled, PM uses `--depth=1`.
- Partial clone is OFF by default; when enabled, PM uses `--filter=blob:none` so blob fetches are lazy. This minimizes initial footprint, makes the first index build slower while blobs are fetched, and then reuses blobs from the Git cache once fetched.
- The two toggles are independent and may be combined for minimum footprint.

Remote cache eviction is storage-owned and does not run on ordinary project close. PM evicts remote project caches after 30 days of no project opens, when the total cache directory exceeds the global cache size limit (default: 50 GB or 10% of free disk at first cache creation, whichever is smaller), or when the user manually evicts one project cache or chooses Clear All Remote Caches. Disk-pressure eviction removes LRU project caches until the cache is under limit. Eviction deletes both the Git cache and regex index for that project; the next open performs a fresh clone plus background index build.

Remote cache settings are permission-adjacent configuration: this storage section records the persisted global and per-project values, but it does not introduce a new grep permission key or `/plan-mode` exception. `grep` remains read-only under `Plans/Permissions_System.md` (`/Permissions_System.md`) and `Plans/Run_Modes.md`.

Disk-usage reporting is required for BOTH local and remote project caches: local projects show `Index: {size}`, while remote projects show `Remote cache: {total} - Index: {idx_size}, Git: {git_size}` so users can see the index and Git portions separately.

#### Binary file contracts

All binary index files use **little-endian** byte order with no inter-field padding.

- **`file_map.bin`:** header `PMFM` + `schema_version:u32` + `entry_count:u32`. Entries are `path_byte_length:u32` + UTF-8 path bytes. Stored paths are forward-slash (`/`) normalized regardless of OS and convert to native separators only at query/I/O time, matching Git internal convention and keeping the `file_map` format platform-independent. File IDs are generation-local only and MUST NOT be treated as stable across builds or across snapshot generations.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md

- **`lookup.bin`:** header `PMLK` + `schema_version:u32` + `entry_count:u32`. Entries are sorted `(xxh3_hash:u64, postings_offset:u64)` pairs. `lookup.bin` remains a separate mmap file from offset 0; if a future packed format combines files, the lookup region MUST begin at a 64 KB-aligned offset for Windows `MapViewOfFile` compatibility. Startup validation checks both `12 + entry_count * 16` sizing and every referenced postings offset before mmap. When two distinct n-grams produce the same xxh3 64-bit hash, their posting lists are merged at index time (Roaring union); the lookup table has exactly one entry per unique hash. Collisions broaden candidates but never affect correctness.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Architecture_Invariants.md

- **`postings.bin`:** header `PMPL` + `schema_version:u32`. Entries are `bitmap_byte_length:u32` + portable-format Roaring Bitmap bytes produced with `RoaringBitmap::serialize_into` portable mode. Postings store `u32` file IDs only; line-level precision always comes from ripgrep verification on candidate files.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md

- **`index_meta.json`:** metadata object with these required fields: `anchor_sha: string | null`, `build_timestamp_utc: string`, `schema_version: u32`, `file_count: u32`, `generation: u64`, `checksums: { file_map, lookup, postings }`, `case_sensitive_fs: bool`, and `roaring_format: "portable"`. Dirty-layer state is NOT persisted in `index_meta.json`; it is reconstructed as needed because the index is a cache.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md, Invariant:INV-002

Incremental rebuild reverse mapping is MVP memory-backed: the builder loads the forward index into RAM during rebuild so it can know which n-grams each unchanged file contributed. This is O(index_size) RAM and may temporarily reach roughly 1.5x index size; the rebuild runs on background low-priority threads. `reverse_map` / `reverse_map.bin` remains a v2 optimization candidate for reducing rebuild memory.

Incremental serialization remains full-snapshot I/O: even when extraction is incremental, PM rewrites `postings.bin`, `lookup.bin`, and `file_map.bin`, so write cost is `O(index_size)`. For a 50 GB repo with a roughly 2-5 GB index, expected storage time is about 1-3s on NVMe and 3-7s on SATA SSD; SSD storage is strongly recommended for repos above 5 GB, HDD performance is not targeted, and an append-only/log-structured (`/log-structured`) posting format is reserved for v2 if write amplification becomes a bottleneck.

#### Frequency table, path compatibility, and validation rules

- **Base frequency corpus:** PM derives the shipped base frequency table from The Stack Smol (`bigcode/the-stack-smol`, ~2.6 GB), a multi-language random subset of The Stack. A one-time development char-pair / byte-pair counting script produces the 256x256 matrix on the same CRLF-stripped normalized byte stream; no public pre-computed table is assumed, and PM computes its own so it can refresh the table on new Stack releases when needed.
- **Binary embedding:** The base frequency table is compiled into the PM binary as a `static const [u16; 65536]` (~128 KB), not shipped as a separate file. Runtime project builds blend that embedded base table with per-project counts and persist only the resulting project `frequency_table.bin` cache.


- **Base table source:** `frequency_table.bin` is derived from a shipped 256x256 `u16` base matrix built from The Stack Smol, counted on CRLF-stripped ASCII-lowercased bytes. The base table is compiled into the PM binary as a `static` constant (`[u16; 65536]`, ~128 KB); it is not shipped as a separate file.
- **Blend rule:** Local and remote full builds compute per-project byte-pair counts on the same CRLF-stripped normalized byte stream and blend them with the base table using `effective[a][b] = 0.5 * base[a][b] + 0.5 * project[a][b]`.
- **Stability rule:** `frequency_table.bin` is shared by both build and query logic and is recomputed only on full rebuilds. Incremental rebuilds reuse the current stored table.
- **Boundary-failure fallback:** When weighting cannot place sparse boundaries for a segment of length >= 3, the builder and query path fall back to fixed-width 3-gram extraction for that segment.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md

- **Path normalization:** `file_map.bin` stores forward-slash relative paths on every platform. Conversion to native separators happens only at I/O time.
- **Filesystem compatibility:** `case_sensitive_fs` records whether the snapshot was built on a case-sensitive filesystem. On case-insensitive filesystems, bare-clone path enumeration deduplicates by lowercase path and logs collisions.
- **Startup validation:** snapshot load validates the per-file xxh3 checksums, the lookup-table size and offsets, and (for Git snapshots) whether `anchor_sha` is still reachable. Unreachable anchors or invalid metadata invalidate the generation and force rebuild.
- **Windows MAX_PATH mitigation:** In addition to the `hash8` short-path scheme for cache directories, the PM Windows app manifest declares `<longPathAware>true</longPathAware>` as defense-in-depth against MAX_PATH limits.
- **OS indexer exclusion:** regex-index directories use OS-specific indexer exclusions (`FILE_ATTRIBUTE_NOT_CONTENT_INDEXED` via `SetFileAttributesW` on Windows, `.metadata_never_index` on macOS as the Spotlight convention; none required on Linux) to reduce contention.
- **Repository exclusion:** `regex_index/` lives under `.puppet-master/` managed state, not inside the user's repo/Git working tree, so no separate gitignore rule is required for ordinary project Git state.
ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Tools.md

#### Index sizing guidance

Sparse n-gram index is typically 1-10% of source code size: 50 MB source produces ~0.5-5 MB index, 500 MB → ~5-50 MB, 1 GB → ~50-100 MB, 50 GB → ~2-5 GB. Only the hash lookup table is mmap'd in process memory; the OS pages in what is needed per query. Peak RSS contribution is typically <500 MB even for large repositories.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md

### 2.2 seglog: format, writer, rotation

#### 2.2.1 Mandatory CRC32 per record

Every seglog record MUST include a CRC32 checksum computed over the record payload. This is a mandatory correctness requirement, not an optional enhancement.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md

On read, CRC32 MUST be validated before the record is processed. If validation fails:
- the corrupt record is skipped
- PM emits a recovery/integrity event including record offset and expected vs observed CRC
- projectors resume from the last known-good checkpoint rather than replaying the corrupt record

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Runtime_Artifacts_Panel.md

#### 2.2.2 Concrete wire format

Seglog uses a length-prefixed binary record stream. The canonical payload codec is MessagePack; mirrors and diagnostics may expose the same envelope in JSON, but JSON is not the on-disk authority.

Canonical record structure:
```text
SeglogRecord {
  header: SeglogHeader,
  payload: bytes
}
```

Canonical header fields:
```text
SeglogHeader {
  version: u8,
  segment_generation: u32,
  event_type: string,
  sequence_id: u64,
  source_timestamp_ns?: u64,
  observed_timestamp_ns: u64,
  session_id?: string,
  project_id?: string,
  payload_length: u32,
  checksum_crc32: u32,
  compression: "none" | "lz4"
}
```

Wire-format rules:
- `payload` is the encoded event payload after any payload-only compression step.
- `checksum_crc32` is computed over the stored payload bytes.
- readers validate `payload_length`, then checksum, then decode.
- a single append operation produces exactly one record; record order is the canonical event order.
- `source_timestamp_ns?` preserves upstream/authored time when the source provides it; `observed_timestamp_ns` is always populated by the seglog writer.

#### 2.2.3 Deterministic rotation

Seglog rotation is deterministic and generation-aware.

Rules:
- there is exactly one active writable segment per seglog generation
- active segment path: `storage/seglog/seg-{generation:06}-{start_seq:020}.active`
- closed segment path: `storage/seglog/seg-{generation:06}-{start_seq:020}-{end_seq:020}.seglog`
- rotate on size threshold, clean shutdown, explicit maintenance, or schema-generation change
- closed segments are immutable; no in-place rewrite is allowed
- projectors and rebuild tools consume closed segments in lexicographic order, then the active segment tail when present

#### 2.2.4 Replay and rebuild rules

Replay/rebuild rules:
- redb projections, JSONL mirror files, and Tantivy indices are rebuildable from seglog plus stable checkpoints; none of them outrank seglog as authority
- on restart, replay begins from the last committed checkpoint `{ segment_generation, segment_name, byte_offset, last_seq }`
- if the active segment ends with a partial/corrupt tail, rebuild truncates only after the last verified record and records the recovery action
- rebuild MUST preserve `sequence_id` ordering; regenerated mirrors or indices may differ in file timestamps but not in semantic event order

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

### 2.3 redb: schema, migrations, key patterns


#### Canonical records baseline


- Canonical records are the single source of truth for run, node, lane, and execution state.
- Canonical records are immutable once committed; corrections require a new record with explicit lineage.
- All canonical records include `created_at_utc`, `updated_at_utc`, and `created_by` for audit.

### Concern record and lifecycle canon


- Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request.
- Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata.
- Create one canonical concern-lifecycle owner section with explicit active/acknowledged/resolved/dismissed semantics.
- Carry resolution_kind including accepted_risk and a concern-action confirmation matrix into that owner section.
- Storage persists concern_record separately from concern_projection and blocked_episode linkage so lifecycle ownership stays durable and queryable.

#### Required redb keys baseline
- `run:<run_id>`: Run context and policy.
- `node:<node_id>`: Node definition and execution state.
- `lane:<lane_id>`: Lane lifecycle and worktree allocation.
- `execution_unit:<execution_unit_id>`: Execution unit context and identity.
- `receipt:<receipt_id>`: Execution receipt and artifact linkage.

### Historical semantic consistency
- Define shared historical vocabulary: historical, stale_historical, superseded, revoked, reopened, archived, removed.
- Keep family-local workflow states distinct and reconcile remediation.resolved enum conflict.
- Historical terms stay shared across concern, receipt, artifact, worktree, and usage families without collapsing family-local workflow states.

#### Cross-surface receipt record baseline


- Receipt records bind execution results to canonical run, node, and lane identity.
- Receipts include `execution_unit_id`, `result_summary`, `artifacts`, and `evidence_ref`.
- Dashboard, CLI, and API surfaces query receipt records to display execution results.

#### Projection freshness, health, and startup rehydration baseline
- Projections are derived from canonical records and events.
- Projection freshness is tracked per projection type; stale projections are recomputed at startup.
- Startup rehydration restores projections from seglog and redb canonical records.

#### Account pressure, history, and runtime attribution baseline


- Account pressure metrics are stored per account and updated at node/lane boundaries.
- History records (account-level and execution-level) are immutable and linked to canonical run/node identity.
- Runtime attribution tracks which actor/role executed each node or phase.

#### Artifacts index, export manifests, and route/open linkage baseline
- Artifacts are indexed by artifact ID and linked to run, node, and receipt records.
- Export manifests bind artifact collections to project deliverables.
- Route/open linkage documents which route args and open contracts were active during execution.

#### Worktree/lane lifecycle, handshake, and cleanup lineage baseline


- Worktree lifecycle records track allocation, usage, and reclamation events.
- Handshake records document the Source Control → Orchestrator worktree allocation contract.
- Cleanup lineage ensures stale worktrees are eventually removed and audited.

#### Naming and migration rules baseline


- Schema keys follow `entity_type:entity_id:sub_key` patterns for consistency.
- Migrations are versioned and idempotent; old schema versions must be supported for at least one major release.
- Deprecation is explicit and documented in migration notes.

### Canonicalization order
- Apply owner-doc corrections before consumer and mirror cleanup.
- Rerun fidelity audit only after owner and consumer corrections are in place.
- Storage-owner sequencing follows the same order: canonical owner records first, dependent projections and mirrors second, and fidelity rerun evidence only after both are complete.

### Canonical records (runtime/storage families)
Storage owns one shared record envelope with canonical lineage refs plus artifact/evidence refs. Record objects remain distinct from rendered views, mirrors, exports, and summaries.

Required record families include:
- `attempt_record.v1:{project_id}:{node_id}:{attempt_number}`
- `blocked_projection.v1:{project_id}:{node_id}`
- `concern_record.v1:{project_id}:{concern_id}`
- `worktree_record.v1:{project_id}:{worktree_id}`
- `worktree_projection.v1:{project_id}:{worktree_id}`
- `thread_state:{thread_id}:worktree_binding`
- `thread_state:{thread_id}:persona_override`
- `worktree_binding_reverse:{worktree_id}`
- `lane_record.v1:{project_id}:{lane_id}`
- `lane_projection.v1:{project_id}:{lane_id}`
- `project_summary.v1:{project_id}`
- `project_attention_item.v1:{project_id}:{attention_item_id}`
- `account_pressure_episode.v1:{provider_id}:{account_id}:{episode_id}`
- `account_switch_event.v1:{provider_id}:{event_id}`

Concern canon:
- concern is a first-class durable record distinct from review findings, annotations, blocked episodes, and graph patch requests
- lifecycle states are `active`, `acknowledged`, `resolved`, and `dismissed`
- `resolution_kind` values are `fixed`, `accepted_risk`, `superseded`, `merged`, `split`, `invalidated`, `obsoleted_by_patch`, and `obsoleted_by_recovery`
- source-event refs, concern records, and concern projections are separate structural layers rather than one collapsed object

Historical vocabulary stays explicit: `historical`, `stale_historical`, `superseded`, `revoked`, `reopened`, `archived`, and `removed` are shared storage terms, while family-local workflow states remain family-local.

### Required redb keys (project/runtime families)
- `artifacts_index.v1:{project_id}:{artifact_id}`
- `artifacts_project_state.v1:{project_id}`
- `projector.checkpoint.runtime_artifacts:{project_id}`
- `attempt_record.v1:{project_id}:{node_id}:{attempt_number}`
- `blocked_projection.v1:{project_id}:{node_id}`
- `concern_record.v1:{project_id}:{concern_id}`
- `project_summary.v1:{project_id}`
- `project_attention_item.v1:{project_id}:{attention_item_id}`
- `worktree_record.v1:{project_id}:{worktree_id}`
- `worktree_projection.v1:{project_id}:{worktree_id}`
- `thread_state:{thread_id}:worktree_binding`
- `thread_state:{thread_id}:persona_override`
- `worktree_binding_reverse:{worktree_id}`
- `lane_record.v1:{project_id}:{lane_id}`
- `lane_projection.v1:{project_id}:{lane_id}`
- `account_pressure_episode.v1:{provider_id}:{account_id}:{episode_id}`
- `account_switch_event.v1:{provider_id}:{event_id}`

### Cross-surface receipt record (required fields)
Required fields:
- `attempt_id`
- `provider_attempt_ref`
- `usage_event_ref`
- `workflow_refs`
- `docker_refs`
- `kubernetes_refs`
- `auditor_cycle_report`
- legacy `validation_pass_report` mirror only when `compatibility_only: true` and `cycle_report_ref` points to `auditor_cycle_report`
- `workflow_run_id`
- `run_id`
- `pass_verdict`
- `phase_plan_ref`
- `requirements_quality_report_ref`

Rules:
- `attempt_id` is the primary local anchor.
- `provider_attempt_ref` is the provider/runtime bridge, `usage_event_ref` is the usage bridge, and receipt refs are the external side-effect lineage bridge; none of them replace the local key.
- Runtime artifacts are attempt-native by default and stay joinable to receipts, usage, workflow, and validation lineage.
- Artifact open flows resolve by `artifact_id` first and then by linked envelope refs.

#### Command alert and incident timeline records

Command-originated alerts are durable incident timeline records. Cascade failures use `parent_incident_id` / `parent-incident` bundling so one primary alert owns the `root_cause_key`, child issues attach as related consequences, and CTAs prioritize root-cause repair before derivative failures.

Required alert timeline fields are `raised_at`, `source_surface`, `severity`, `root_cause_key`, `owning_surface`, `acknowledged/snoozed state`, `resolved_at`, and linked receipt/run/worktree/workflow/container/workload ids (`receipt_id`, `run_id`, `worktree_id`, `workflow_run_id`, `container_id`, `workload_id`). The compact lineage key `/run/worktree/workflow/container/workload` is preserved alongside `/snoozed` state so historical records can answer what alerted, where the user acted, and whether it cleared.

Active attention rows carry both `attention_key` and `root_cause_key`. `attention_key` identifies the user-visible attention thread and owning route, while `root_cause_key` identifies the durable causal cluster for `/coalescing`. Repeated events with the same `root_cause_key` update one active alert thread; interruptive notifications retrigger only on severity or state transition.

Attention routing precedence is canonical: run-blocking issues route to Orchestrator and its CTA stack; branch and workflow issues route to GitHub Actions; runtime, `/container/rollout`, and Kubernetes issues route to Docker Manager; global degraded infrastructure routes to the status bar plus Dashboard. Mirrored surfaces store deep-link payloads to the primary owner instead of minting parallel remediation records.

The cross-shell `attention-routing` record stores delivery class and escalation state separately from owner routing. Delivery classes are `blocking_modal`, `interruptive_toast`, `persistent_banner_or_card`, and `badge_only`; active-project issues may interrupt when severity requires it, while `non-active-project` issues default to compact global attention until selected. Waiting states include `waiting`, `waiting_long`, and `attention_waiting`; pinned workflow `/run/failed`, Docker, and `/Kubernetes` failures coalesce by root cause and only retrigger interruptive delivery when severity or state changes.

#### Project attention and execution-owner reconciliation state

Project attention records MUST NOT collapse user attention into only `orchestrator status`: the `idle/running/paused` activity enum and any `/running/paused` display value are activity_state hints, not the primary reason a project needs attention. Severity uses `info`, `warning`, `attention_required`, and `blocked` with stable meaning: an advisory concern with no execution effect is usually `info` or `warning`; a concern tied to weak integration but not yet `completion-blocking` is `warning` or `attention_required`; a concern that blocks seam completion, promotion, or recovery is `blocked`.

Historical and lifecycle terms stay `family-local`. `archived`, `removed`, and `deleted` remain distinct storage states, and generic `resolved` labels do not overwrite the owner-specific `remediation.resolved` contract; that conflict is a real reconciliation item. Boundary schemas migrate from `tier_boundary` to a versioned `governance_boundary`, with any compatibility alias documented as migration-only rather than as a peer canonical key.

Trust and attention projections treat auth, `/scope/rate-limit`, account pressure, and provider limits as `concern-aware` and `trust-aware` storage facts rather than UI-only error strings. Remaining reconciliation seams include `/glossary` ownership, `route-payload` normalization, `attention-item` versus `project-summary` projection ownership, and `/worktree` lifecycle split; those are storage/schema cleanup items, not fresh design proposals.

Projection records carry enough freshness and lineage to be trusted after restart: `projection_freshness`, `projection_health`, `last_projected_at_utc`, `source_seq` or an equivalent `/cursor`, `degraded_reason_code`, and `refresh_in_progress`. Mutating actions must read those fields before trusting a derived view.

Execution ownership migrations are storage-visible. `Prompt_Pipeline.md` / `Prompt_Pipeline` still consumes `persona_override_owner_id`, but `tier_id` is a legacy scope for Orchestrator execution identity and must migrate toward `/node/attempt/subagent-owned` ownership. `Executor_Protocol.md` / `Executor_Protocol` and `orchestrator-subagent-integration.md` / `orchestrator-subagent-integration` must define the mint and `/ownership` rules for `blocked_sequence`, the `startup-recovery` to first `scheduler-pass` handshake using `startup_recovered`, `execution_role`, reviewer `/corroboration`, and the way `active-agent`, `TierContext`, and `/decomposition` records join to `attempt-keyed` runtime records.

Source Control remains the worktree owner surface, but storage owns durable joins. `worktree_id` is the durable storage key, `/path` is a resolver/display attribute, `/source-control` owns Git-facing operations, and `base-branch` ownership must be reconciled before Source Control or UI code mint competing base-branch fields.

#### Evidence, receipt, redaction, and bulk-action provenance

Persisted or `/exported` evidence and `/receipt` summaries that include result state or spawned attempt/remediation refs carry derivation provenance fields: `source_event_ids[]`, `source_event_ids`, `blob_ref?`, `blob_ref`, `derived_by_projector`, `projector_version`, `redaction_profile_id`, and `derived_at`.

Consumers distinguish source facts from projected summaries. `source_event_ids[]` and `blob_ref?` point to source observations, while `derived_by_projector`, `projector_version`, `redaction_profile_id`, and `derived_at` identify the projector and policy that produced the summary.

Evidence refs declare exactly one stability class: `embedded_snapshot`, `local_blob_ref`, `external_live_ref`, or `external_missing`. Exports and history mark a record as not `self-contained` when remote evidence was not snapshotted, including `/exported` views and historical receipt views.

Persisted/exported audit items include `mandatory_scrub_applied`, `heuristic_redaction_enabled`, `redaction_policy_version`, and `display_may_hide_details` so consumers can distinguish source absence from post-processing omissions. The provenance packet is also attached to bulk action families that cover stage/unstage/discard (`/unstage/discard`), rerun/cancel, cleanup/prune (`/prune`), apply/delete, and pin/unpin. Stored bulk outcomes preserve target preview reference, scope summary/count (`/count`), result state, `partial-success`, `per-target` failure list, spawned attempt/remediation refs, and rollback/undo expectations where possible.

Audit/export bundles are provenance-preserving manifests, not copied folders with lost lineage. Each package records `exported_at`, `source_scope`, `source_seglog_range`, `included_event_count`, `/checksums`, `redaction_policy_version`, `missing_external_refs[]`, `missing_external_refs`, filtered item counts, and a `/rationale` when evidence is omitted or transformed. Export manifests include `command_invocation_id` when generated from a command and keep `blocked_resolution_record` links when a blocked episode, remediation, or recovery action contributed to the bundle. `hold_state` applies to runs, receipts, evidence, blocked episodes, and linked blobs/artifacts; a hold suspends pruning, cleanup, export garbage-collection, and linked-graph deletion until explicitly released.

Structured-copy contracts use canonical reason/state keys and typed placeholders rather than ad hoc English concatenation. Copy payloads store target identity, missing capability, blocked step, recovery action, timestamp, source event refs, and redaction profile so localized UI text can be regenerated from durable state without weakening audit facts.

#### External operation evidence, privileged sessions, and sensitive metadata

Runtime and provider evidence separates ephemeral in-memory view, scrubbed persisted blob, and `user-exported` file. Container/Kubernetes logs, inspect output, diff blobs, workflow YAML previews, manifest diffs, `/diffs/receipts`, and provider-bound summaries store the evidence class, data-class label, redaction profile, and whether `scrub-before-persist` and `scrub-before-index` ran before any local persistence or indexing. Provider-facing `/AI` or `LLM` features must receive only already-scrubbed payload refs and may not treat a local scrub as provider consent.

Privileged-session evidence for `docker exec/attach`, `kubectl exec`, `kubectl port-forward`, remote SCM-over-SSH mutation sessions, and browser/device auth handoffs stores bounded metadata only: actor, target, started and `/ended` timestamps, credential realm, transport, local bind address/port when relevant, requested vs effective state, and the owning attempt/action id. The durable store does not persist interactive transcript or `/stdin` by default; if a user explicitly exports session material, it is a `user-exported` artifact with an export profile rather than canonical runtime history.

Build/deploy secret-handling storage uses `no-persist` and `/no-echo` flags for docker build secrets, build args, compose env files, registry auth helpers, kube Secret manifests, and generated deployment `YAML` containing sensitive values. Preview, diff, receipt, `/deploy`, drift, and publish records compare and persist non-secret metadata only; redaction happens before display persistence as well as before storage. SCM, GitHub Actions, Docker, Kubernetes, and Orchestrator receipts must carry enough provenance to prove redaction and omission policy without echoing secret-bearing fields.

Sensitive metadata persistence and export defaults cover remote URLs, private repo names, registry namespaces, Docker Hub account identity, account handles, namespace ownership, kube user/context names, namespace/workload names, SSH usernames/host aliases, discovered service URLs, port-forward endpoints, and screenshot-visible values. Local history may keep masked references for joinability, but exports, evidence bundles, and screenshots default to masked values unless the selected export profile explicitly permits fuller disclosure. Account-identity redaction is governed by `/redaction` policy and applies before help/copy text, screenshots, exported receipts, and provider-bound summaries reuse stored evidence. Logout, unlink, and project-delete cleanup invalidates non-secret residue such as validation snapshots, last-used account identity, workflow admin receipts, registry capability snapshots, kube context selections, discovered endpoints, and downloaded scrubbed artifacts.

Kubernetes `Secret` resources are never rendered back in full, never indexed, and never included in receipts or `/evidence` beyond kind, `/name/namespace`, and redacted status. `ConfigMap` resources use a separate configurable redaction policy because they may contain sensitive plaintext even when they are not Kubernetes Secrets. Review mode, history compare, conflict assistant, run-to-repo lineage, `/diff/export`, and `/file` evidence may persist raw `changed-line` content only when the selected evidence class allows it; otherwise they persist commit/file metadata and scrubbed snippets. Cached diff blobs follow the same scrub, `/TTL/export`, and auto-export policy as logs. `Open app` and `access-intelligence` storage treats URLs and `/endpoints` as sensitive metadata by default.

### Scope split (durable store boundaries)


| Scope | Store | What belongs here |
|---|---|---|
| Secret | OS credential store only | GitHub API tokens, Docker PATs, browser-login derived credentials, registry/helper secrets |
| Global app state | redb | shared Source Control defaults, Actions defaults, Docker Manager defaults, hidden-subview policy |
| Project state | redb | selected repo/worktree, panel subviews, pinned workflows, selected runtime/context, requested auth mode, template repo state |
| Event ledger | seglog | auth validation, blocked/recovery outcomes, workflow actions, publish results, runtime receipts, cross-surface linkage |

### Projection freshness, health, and startup rehydration (operational rules)


Required rules:
- Use active_run_id/focused_run_id with focus_mode = live | historical
- Keep cross-tab deep links and search pivots coherent on the focused run
- Split projection_freshness from projection_health
- Reserve trust_tier for preview/browser semantics and tie action gating to both axes

Canonical storage rules:
- Project state stores `active_run_id`, `focused_run_id`, and `focus_mode = live | historical` so live dashboards, historical inspectors, and restart rehydration all resolve the same focused run.
- Cross-tab deep links and search pivots MUST target the focused run context; switching tabs or reopening the app does not silently retarget links back to the active run when `focus_mode = historical`.
- `projection_freshness` remains the recency axis and `projection_health` remains the integrity/availability axis; storage and consumers MUST NOT collapse them into a single trust field.
- Sensitive action gating evaluates both axes together: stale-but-healthy projections can require refresh, degraded projections can fall back to canonical record reads, and unavailable projections block projection-dependent actions.
- `trust_tier` is retired as canonical projection vocabulary and is reserved only for preview/browser semantics where UI transport trust must still be disclosed without replacing freshness or health.

### Account pressure, history, and runtime attribution (ownership split)

Required rules:
- Introduce execution_unit_context as canonical runtime-facing context object
- Demote TierContext to a derived or compatibility-only selection/decomposition helper
- Anchor worker spawn, recovery, remediation, coordination, and UI inspection to execution_unit_context
- Let Contracts_V0 own cross-family attribution packet shape
- Let storage-plan own persistence and projection of attempt/usage/receipt/artifact joins

Canonical ownership split:
- `execution_unit_context` is the canonical runtime-facing context object persisted with account pressure episodes, switch history, runtime artifacts, receipts, and usage joins.
- Any `TierContext` or `tier_id` decomposition is compatibility-only derived metadata for legacy selection helpers and MUST NOT own runtime canon, storage keys, or join identity.
- Worker spawn, recovery, remediation, coordination, and UI inspection all resolve runtime identity from `execution_unit_context` so restart flows and inspectors reuse the same run/node/attempt/account anchors.
- Contracts_V0 owns the cross-family attribution packet shape, including run/attempt/thread/node/artifact/provider/usage anchors plus execution/runtime identity.
- storage-plan owns persistence and projection of the attempt/usage/receipt/artifact joins that materialize that packet for history, audit, and inspector consumers.
- Remaining storage/event cleanup is doc-by-doc reconciliation of these frozen placement rules, not invention of new storage concepts.

### Artifacts index, export manifests, and route/open linkage (ownership split)
- Make runtime artifacts attempt-native by default with artifact identity, routing refs, content refs, and provider/usage linkage.
- Resolve artifact open flows by artifact_id and then by linked envelope refs.
- Let Contracts_V0 own canonical route_target and OpenSubject contracts.
- Keep Crosswalk limited to primitive boundary ownership and FileManager OpenFile narrow and path-based.
- Export manifests and artifact indices carry route/open linkage by reference rather than redefining route payload shapes locally.

### Worktree/lane lifecycle, handshake, and cleanup lineage (ownership split)
- Keep Orchestrator as lane-pool operational truth and Source Control as concrete repo/worktree operator.
- Show owning package/lane/run refs plus lifecycle and blocked/recovery state on worktree rows.
- Register worktree_record/worktree_projection and lane_record/lane_projection families.
- Use worktree_id as durable filesystem/git identity and lane_id as operational lineage identity.
- Keep package/work-package linkage and cleanup/archive lineage explicit in lane_record and lane_projection families.
- Handshake and cleanup history remain lineage-bearing storage records instead of ad hoc UI-only summaries.

### Naming and migration rules (forward-only storage policy)


Storage migrations are forward-only and monotonic.

Required rules:
- new fields are additive first; destructive renames require a migration note in the same section that introduces them
- stable semantic names stay aligned across runtime, persistence, and events unless an explicit translation layer is defined
- account/profile-backed runtime records and server-profile-backed runtime records stay distinct durable shapes even when surfaced through one GUI ontology
- consumer docs follow owner-first reconciliation order: owner correction here first, then consumer propagation, then fidelity audit rerun

### Canonical records (owner reconciliation)
Storage owns discoverable record families for runtime, receipt, and projection truth.

### Required redb keys (owner reconciliation)
- `artifacts_index.v1:{project_id}:{artifact_id}`
- `artifacts_project_state.v1:{project_id}`
- `projector.checkpoint.runtime_artifacts:{project_id}`
- `worktree_record.v1:{project_id}:{worktree_id}`
- `lane_record.v1:{project_id}:{lane_id}`
- `worktree_projection.v1:{project_id}:{worktree_id}`
- `thread_state:{thread_id}:worktree_binding`
- `worktree_binding_reverse:{worktree_id}`
- `lane_projection.v1:{project_id}:{lane_id}`
- `orchestrator.project_state.{project_id}`

### Cross-surface receipt record (storage rules)
Required fields:
- `attempt_id`
- `provider_attempt_ref`
- `usage_event_ref`
- `workflow_refs`
- `docker_refs`
- `kubernetes_refs`
- `auditor_cycle_report`
- legacy `validation_pass_report` mirror only when `compatibility_only: true` and `cycle_report_ref` points to `auditor_cycle_report`
- `workflow_run_id`
- `run_id`
- `pass_verdict`
- `phase_plan_ref`
- `requirements_quality_report_ref`

Rules:
- Receipt fields remain lineage-bearing rather than summary prose.
- Runtime artifacts, worktree records, lane records, and project-state keys stay storage owned.

#### Temporal receipt fields, crash-critical persistence, and retention-window anchor semantics

Storage owns durable temporal fields used by receipts, blocked states, stream views, and projections. These fields are crash-critical overrides to debounced persistence where noted.

Required fields on any receipt or blocked-state record that involves a wait, timeout, scheduled observation, reconnect, or stale observation:
- `timeout_class?`
- `wait_state_class?`
- `source_timer_ref?`
- `scheduled_workflow_ref?`
- `last_observation_at_utc?`
- `transitioned_at_utc`
- `retention_anchor_kind`
- `retention_anchor_at_utc`

Rules:
- Receipts and blocked states retain `timeout_class` because recovery differs for `hard execution timeout`, `inactivity timeout`, `polling timeout`, `reconnect timeout`, and `user-visible wait timer expiry`.
- Active receipt/session lifecycle changes flush immediately or on lifecycle transition, not only on debounce.
- Blocked episode creation/resolution flushes immediately or on lifecycle transition, not only on debounce.
- Follow-mode intent flushes immediately when changed and remains separate from source liveness; restored `follow` still requires source revalidation before a new live stream session is claimed.
- Last inspected run/node/log context, including `/node/log`, flushes immediately when it changes so crash recovery can restore the inspector without inventing continuity.
- Retention-window anchor semantics are explicit per family: receipts use `creation time` unless a stronger legal-hold or preservation rule applies; log tails and watch buffers use `last observation`; explorer snapshots and stale caches use `last access`; run-scoped completion artifacts use `run completion`.
- Retention policies for receipts, log tails, watch buffers, explorer snapshots, and stale caches MUST store both `retention_anchor_kind` and `retention_anchor_at_utc`; implementations MUST NOT infer the anchor from file mtime alone.

#### Freshness, stale-window, and watch-mode projection rules

Storage records freshness policy separately from retention. Any record family used for `/watch`, follow-mode, log tails, explorer snapshots, stale caches, or remote runtime projections declares `stale_window_policy`, `stale_window_expires_at_utc`, and the post-expiry behavior: `actionable`, `refresh-first`, or `read-only`.

Required stale-window families:
- Actions readiness snapshot: stale data may remain visible, but workflow generation, apply, rerun, cancel, and pin/unpin actions require `refresh-first`.
- Workflow run list/detail: stale rows may be inspected as historical evidence; live log follow and run mutation require `refresh-first`.
- Docker runtime snapshot: stale container/image/compose state is read-only until refresh; lifecycle actions require `refresh-first`.
- Kubernetes workload/watch state: stale workload, rollout, log, exec, and port-forward state is read-only until refresh; rollout mutation requires `refresh-first`.
- Orchestrator lineage/receipt stitching: stale receipt/lineage views remain inspectable, but run-blocking recovery or CTA actions require canonical revalidation before execution.

Default stale-window thresholds are explicit and may be tightened by a surface owner, but may not be silently lengthened without a persisted policy version:

| Family | Default stale threshold | Expiry computation | Post-expiry posture |
| --- | --- | --- | --- |
| Actions readiness snapshot | `5m` or immediately on workflow/settings/secret/environment input change | `last_observation_at_utc + 5m` unless an input-change event occurs first | Visible as stale; workflow generation/apply and Actions Settings mutation require `refresh-first`. |
| Workflow run list/detail | `60s` for run lists and `15s` for active run/detail/log-follow state | `last_observation_at_utc + threshold` per view family | Historical inspection allowed; rerun/cancel/pin, dispatch, and live log follow require `refresh-first`. |
| Docker runtime snapshot | `15s` for containers/compose health and `60s` for image/registry inventory | `last_observation_at_utc + threshold` per snapshot subtype | Runtime lifecycle actions are read-only until refresh; cached inventory keeps freshness markers. |
| Kubernetes workload/watch state | `15s` for workload/watch/rollout state | `last_observation_at_utc + 15s` or watch disconnect, whichever is earlier | Workload mutation, exec, port-forward, and rollout recovery require `refresh-first`; stale state remains inspectable. |
| Orchestrator lineage/receipt stitching | `30s` for active run stitching; completed historical receipts use retention policy instead of live freshness | `last_observation_at_utc + 30s` while the run is active | Receipt/lineage history remains inspectable; run-blocking recovery and CTA execution require canonical revalidation. |

Pause-when-hidden behavior is explicit on watchable streams. A surface declares whether polling pauses immediately or after a grace period when hidden, whether return to visibility forces refresh before claiming current state, and whether relative timers preserve hidden elapsed time or reset. Actions auto-refresh, log follow, container health polling, and Kubernetes watches use the same `when-hidden` policy fields so consumers do not infer continuity from the last rendered frame.

### Scope split (owner reconciliation)

| Scope | Store | What belongs here |
|---|---|---|
| Secret | OS credential store only | GitHub API tokens, Docker PATs, browser-login derived credentials, registry/helper secrets |
| Global app state | redb | shared Source Control defaults, Actions defaults, Docker Manager defaults, hidden-subview policy |
| Project state | redb | selected repo/worktree, panel subviews, pinned workflows, selected runtime/context, requested auth mode, template repo state |
| Event ledger | seglog | auth validation, blocked/recovery outcomes, workflow actions, publish results, runtime receipts, cross-surface linkage |

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/newtools.md, PolicyRule:no_secrets_in_storage

Unified event/projection wording for storage records stays referenced through the `Plans/newtools.md` (`/newtools.md`) owner-doc; regex-index storage records do not add a competing `/projection` family beyond those owner-doc references.

Cross-surface panel state is per-project and panel-specific. Source Control persists `source_control.project_state.{project_id}` for selected repo/worktree, `History` and `Graph` filters, and worktree focus; GitHub Actions persists `github_actions.project_state.{project_id}` for selected repo binding, pinned workflows, `Current Branch`, `Workflows`, `Settings`, refresh/log/admin preferences, active `sub-view`, current-branch focus, last-opened run `/job/log`, `admin-scope` context, and readiness snapshot focus; Docker Manager persists generalized `container_manager` state for active subview, dock state, expanded panels, detected domains, selected runtime/context, `/context/compose/Kubernetes` focus, selected registry/namespace/repository, selected image/container/compose project, selected Kubernetes context `/namespace/workload` focus, requested/effective capability snapshots, compose scenarios, drift baseline refs, cleanup preferences, and hidden-subview policy for Docker/Podman/Kubernetes. Renamed/split container surface migration is explicit: legacy `docker.project_state.{project_id}`, `docker.project_state`, `docker_manage_surface_state`, and publish-oriented `/auth/Unraid` panel state migrate into `container_manager`; standalone Unraid navigation/layout state becomes `Docker Manager > Publish / Unraid`; canonical `cmd.docker.*` command aliases win when both legacy and new keys exist.

Docker Manager project-state key migration is one-way: legacy `docker_manager.project_state.*`, `docker.project_state.{project_id}`, `docker.project_state`, `docker_manage_surface_state`, and publish-oriented `/auth/Unraid` panel state are migration-read aliases only. Canonical writes use `container_manager.project_state.{project_id}` for Docker Manager state; adjacent owner families remain `source_control.project_state.{project_id}`, `github_actions.project_state.{project_id}`, and `orchestrator.receipt.{run_id}.{attempt_id}` rather than being re-owned by the container plan.

Cross-process and multi-instance mutation rules are explicit for MVP. Concurrent mutable control of the same `project_id`, `repo_id`, `/workspace-root`, `/repo/runtime`, runtime target, or hosted `remote_repo_ref` is unsupported unless a canonical project/target lock exists. If another owner is detected, the affected surface degrades to read-only or explicit override mode; receipts record the cross-process ownership conflict as blocked, not failed. Multi-repo projects introduce stable `workspace_root_id` and `repo_id` below `project_id`; repo-bound state, receipts, deep links, and commands carry `repo_id`, while GitHub Actions current-repository binding stores the current-repository and remote binding instead of assuming `origin`.

Mutation-capable operations claim a target-scoped `mutation_lock_id` (`mutation-lock` in audit vocabulary) and persist the armed selection/version that was validated before execution. If the selected row, route, worktree, container, workflow run, Kubernetes workload, or `/workspace-root` changes before execution, the operation fails `stale-selection` revalidation and rebuilds against the new canonical identity instead of applying to the previously visible row. Identical in-flight operations may coalesce only when their project/repo/workspace target, requested action, effective actor/account, and validated selection version all match; cancel-vs-complete races reconcile through the receipt `reference_state` rules instead of overwriting completed outcomes.

Worktrees panel state persists selected worktree, sort mode, `hide-stale` toggle, ownership display mode, worktree ownership projection focus, and persisted worktree panel filters. Optional Graph overlay badges from the Worktrees view are stored with the same Worktrees panel state until the dedicated Source Control Graph contract applies its own persisted graph state.

Assistant worktree settings are ADDITIVE project-level redb config keys, not replacements for existing Branching, File Manager, or Source Control panel-state keys:
- `config:project:{pid}:branching.assistant_auto_worktree`
- `config:project:{pid}:branching.assistant_worktree_cleanup_default`
- `config:project:{pid}:branching.assistant_worktree_base_ref`
- `config:project:{pid}:file_manager.worktree_follow_thread`
- `config:project:{pid}:branching.worktree_warning_threshold`
- `config:project:{pid}:branching.worktree_create_timeout_s`
- `config:project:{pid}:branching.assistant_worktree_pre_merge_test`
- `config:project:{pid}:branching.assistant_worktree_pre_merge_cmd`
- `config:project:{pid}:branching.worktree_pre_merge_test_timeout_s`
- `config:project:{pid}:branching.assistant_worktree_pre_merge_test_target`

Source Control accordion and filter persistence are storage-backed panel state. `config:project:{pid}:source_control.accordion_state` stores per-project open/close state for Changes, Worktrees, Branches/Stash, History, and Graph. `config:project:{pid}:source_control.worktree_filter` stores the Worktrees filter field `worktree_filter` as the enum `All`, `Threads`, `Orchestrator`, or `Manual`, defaults to `All`, and is never shared across projects. `source_control.project_state.{project_id}` stores selected repo/worktree, History and Graph filters, worktree focus, and Worktrees panel filters; these panel-state keys are ADDITIVE to the thread binding keys `thread_state:{thread_id}:worktree_binding` and `worktree_binding_reverse:{worktree_id}`.

Refresh and projection budgets are shared rather than panel-local. Git fetch, Actions auto-refresh, container health polling, Kubernetes watch/log streams, and receipt projection use per-domain budgets, `pause-when-hidden` rules, coalescing/throttle behavior, event-loop backpressure limits, and `/backpressure` telemetry so SCM, Actions, Docker/Kubernetes, and Orchestrator do not compete with independent loops. Icon/text/badge mappings for state classes stay consistent across SCM, Actions, Docker/Kubernetes, and Orchestrator, while observability records projector lag for receipts/state, cache freshness and stale-read age, GitHub rate-limit state, container runtime probe failures, and Kubernetes watch disconnect/reconnect counts.

Stitched receipt and long-running command lineage is ordered by storage records, not by remote clock trust. The `command-execution` metadata for operational commands records `command_invocation_id`, `started_at`, `completed_at`, `transport`, `retry_count`, and `final_reason_code?`; cross-system ordering and `/correlation` rules require each stitched receipt/event to carry `receipt_id`, `correlation_id`, `source_system`, `observed_at`, `source_occurred_at?`, `attempt_id?`, and `run_id?`. UI ordering prefers deterministic receipt ordering when remote clocks disagree. Non-functional coverage for these surfaces includes large repo `/history/graph` datasets, many Actions runs plus log pagination, many containers `/images/tags`, Docker Manager `/Kubernetes` watch reconnects and stale workloads, restart/resume stitching, workflow/deploy `YAML`, and `/privacy/retention` export and redaction paths.

Orchestrator deep-link contexts are typed payload families rather than generic URLs. `open_source_control_context` carries `project_id`, `repo_id`, `worktree_id`, optional `branch`, optional `commit`, optional `compare_target`, and optional `conflict_file`; `open_github_actions_context` carries `project_id`, `repo_remote`, optional `workflow_id`, optional `run_id`, optional `job_id`, optional `step_id`, and optional `branch`; `open_docker_manager_context` carries `project_id`, `runtime`, optional `context_name`, optional `compose_project`, optional `container_id`, optional `image_ref`, optional `publish_result_id`, and optional `registry_host`; `open_kubernetes_context` carries `project_id`, `runtime`, optional `kube_context`, optional `namespace`, optional `workload_ref`, optional `rollout_ref`, and optional `port_forward_session_id`. The shared payload may include `allowed_action_ids[]?`, `deep_link_context`, `partial_lineage?`, and `stale_data?` so restored pivots can disclose partial evidence or stale data without inventing authority.

Per-surface filter state persists per project; `/search`, filter, and `/focus` inheritance is storage-backed rather than transient view memory. Deep links from receipts or Orchestrator owner routes record whether the destination should apply a visible context filter chip or isolated focus mode, and they store the inherited-filter marker needed to clear that context in one action without erasing the surface's saved project filters.

File/editor `/search/write-state` is host-aware and storage-backed. Local tree search, remote tree search, diff search, and editor-buffer search may persist query/filter/focus state, but write-capable actions must bind to the same project, host, repo/worktree, and recover-unsaved context that owns the buffer; a stale cross-ref can reopen the visible query but cannot claim write authority.

SCM side-effect lineage persists restart-stable receipt context for Orchestrator and Source Control. Mutation-capable attempts record repo/worktree/branch/head refs, partial receipt availability, and whether lineage is complete or partial; cross-surface deep links from Orchestrator replay the saved destination, filter or focus mode, and receipt context after restart. Partial lineage is stored as an explicit state and must not be silently omitted or invented.

SCM/worktree contract-resolution is storage-owned for identity and history. `project_id` remains the top-level project identity; `repo_id` is stable per project repo root and derived from canonical VCS root identity using a `vcs_root_fingerprint`, with candidate format `gitrepo::<project_id>::<vcs_root_fingerprint>`. `worktree_id` is stable per concrete worktree instance and derived from canonical realpath identity using `worktree_realpath_fingerprint`, with candidate format `worktree::<repo_id>::<worktree_realpath_fingerprint>`. `worktree_path` is display and `/navigation` state, not canonical identity. Cross-surface SCM links and receipts carry `project_id`, `repo_id`, `state_scope`, and when worktree-scoped also `worktree_id`; completed-run history stores `historical_snapshot` and `live_state` separately so `compare_historical_to_live` can show a CTA without overwriting historical truth.

SCM runtime-record growth is explicit. `attempt_record` stores `repo_id`, `worktree_id`, `worktree_path`, `branch_name`, `head_commit_oid`, `baseline_commit_oid`, `compare_target_ref`, `git_operation_ref`, and `pr_ref`; `tier_runtime_record` stores stable latest-SCM refs including `current_worktree_status`, `head_commit_oid`, `compare_target_ref`, and `latest_pr_ref`; `blocked_projection` stores `dirty_file_paths`, `dirty_file_paths[]`, `conflict_file_paths[]`, `ownership_state`, `clean_baseline`, `dirty_baseline`, `post_restore`, and the recovery target; `evidence_record` stores `evidence_scm_state` so receipts, blocked cards, and history can replay the exact SCM state instead of reconstructing it from UI text.

Project/worktree lifecycle after `/deletion` or `/missing-root` has durable tombstone states. Project roots can be `active`, `missing_on_disk`, `archived_from_ui`, or `deleted_from_registry`; missing roots show `not-found` with `rebind_required` instead of silently matching a same-name path. Retired worktrees keep immutable `worktree_id`, last path, last branch, retired timestamp, retirement cause, and `/receipts`; historical deep links open tombstone detail or nearest valid compare target. `/recreate` creates a new identity, and resumable state is allowed only when the original root/worktree identity is validated.

Receipt reference-state is deterministic when identities disappear. `reference_state` and `reference-state` values include `live`, `historical`, `missing`, `superseded`, `target_no_longer_available`, `rebased-away`, `already_stopped`, `already_replaced`, `already_finished`, and `completed_before_cancel`; `/containers`, workflow runs, logs, images, commits, worktrees, and Kubernetes resources degrade to the nearest surviving identity/history view instead of rewriting the original receipt. If a container stop races with an exited or `/restarted` container, or a cancel races with a completed remote run, the receipt reconciles to an informational terminal state rather than failed. Live-refreshing lists preserve row, `/menu/dialog`, and action anchors while a user is focused or armed for mutation; `/update-source` metadata explains whether the row came from live refresh, history, receipt projection, or superseded state.

Source Control storage is an independent SCM surface contract, not a GitHub-only side effect. Earlier planning left multi-repo Source Control inventory under-specified; the canonical storage model now covers provider-agnostic SCM inventory, graph/history filters, merge-editor availability, compare identity, conflict presentation, and remote-aware Source Control contexts. The UI owner documents command placement, while storage owns the durable state keys and receipt joins.

SCM/review GUI state stores identity-rich review routes rather than path-only links: compare, `/open/review`, and chat diff cards carry `project_id`, `repo_id`, and `worktree_id`, while worktree rows can surface `/banners` for conflicted, `/drifted`, orphaned, historical, or cleanup-needed states. Diff and editor projections persist `/change-marker`, heat-map, and `/hunk/conflict/heat-map` references as review-state summaries; the owning GUI decides whether the rendering appears in the editor scrollbar, diff view scrollbar, or both. The highest-value storage `/contract` for these review surfaces records the side-panel filter/focus state and `/preview` linkage without making storage the owner of hunk UI layout.

File command receipt payloads preserve the exact workspace-node intent before UI labels are localized: `cmd.file.*`, `cmd.file.new_file { project_id, parent_path }`, `cmd.file.new_folder { project_id, parent_path }`, `cmd.file.rename { project_id, path, new_name? }`, `cmd.file.delete { project_id, paths: string[] }`, `cmd.file.copy_full_path { project_id, path }`, `cmd.file.copy_relative_path { project_id, path, root_kind?: "project"|"worktree" }`, `cmd.file.copy_nodes { project_id, paths: string[] }`, `cmd.file.cut_nodes { project_id, paths: string[] }`, `cmd.file.paste_nodes { project_id, target_dir }`, and `cmd.file.save_local_copy` are stored as command refs or receipt payloads when they produce durable effects. `root_kind`, `target_dir`, `image_viewer`, `diff_review`, `workspace_preview`, and `detached_preview` remain typed payload vocabulary, not inferred from display text.

Cross-surface account-switch propagation is storage-backed. When the effective account changes, `source_control`, `github_actions`, `docker_manager`, `kubernetes`, `receipts`, `blocked_state`, and `requested_effective` projections hard-refresh or invalidate account-bound selections, clear stale selected rows, reclassify Orchestrator CTAs, and mark background observation as read-only or interrupted until revalidation completes. The event ledger stores the old account binding, new effective account binding, invalidated projection families, and any preserved historical focus refs so restored surfaces do not imply stale authority.

Help, copy, and first-use teaching use authored namespaces rather than ad hoc panel strings. `source_control`, `github_actions`, `docker_manager`, `kubernetes`, `receipts`, `blocked_state`, and `requested_effective` each define empty states, disabled-state explainers, first-use disclosure copy, expert variants, and eli5 variants. Worktree-native SCM first-use teaching triggers on the first worktree-backed run, conflict, orphan recovery, or compare-review open, and the persistent "what worktrees mean here" help entry is reachable from Source Control and Orchestrator.

Hosted and `/runtime-backed` panel projections persist freshness fields for last refresh timestamp, active refresh state, stale marker, and whether displayed data is cached, `/live`, partial, or `/last-known`. Mutating actions against stale runtime projections must record a `refresh-first` or explicit last-known warning posture before execution, so visible stale data is never mistaken for current execution capability.

Receipt and storage retention classes are explicit. Durable state keeps canonical receipts and canonical state transitions; bounded cache keeps log tails, watch buffers, and explorer snapshots with retention windows, truncation rules, stale markers, and project-delete cleanup behavior; discardable state keeps transient stream frames only while useful for the active view. Receipt retention preference maps to the explicit retention class, policy, and anchor fields without replacing durable canonical receipts or canonical state transitions. Project-delete cleanup removes bounded-cache and discardable records according to class policy without erasing durable receipts or canonical state transitions.

The promoted provider/runtime rewrite and the updated terminal/editor model require durable record and projection families that preserve concrete runtime surfaces, account/profile identity, entitlement attribution, and terminal layout continuity.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md

Required canonical record and projection families include:
- `attempt_record.v1:{project_id}:{node_id}:{attempt_number}`
- `blocked_projection.v1:{project_id}:{node_id}`
- `artifacts_index.v1:{project_id}:{artifact_id}`
- `lane_record.v1:{project_id}:{lane_id}`
- `lane_projection.v1:{project_id}:{lane_id}`
- `worktree_record.v1:{project_id}:{worktree_id}`
- `worktree_projection.v1:{project_id}:{worktree_id}`
- `concern_record.v1:{project_id}:{concern_id}`
- `project_summary.v1:{project_id}`
- `project_attention_item.v1:{project_id}:{attention_item_id}`
- `provider_account_record.v1:{provider_id}:{account_id}`
- `provider_entitlement_context_record.v1:{provider_id}:{account_id}:{billing_entity_id}`
- `server_profile_record.v1:{provider_id}:{connection_profile_id}`
- `account_pressure_episode.v1:{provider_id}:{account_id}:{episode_id}`
- `account_switch_event.v1:{provider_id}:{event_id}`
- `terminal_workspace_state.v1:{project_id}:{workspace_tab_id}`
- `terminal_section_record.v1:{project_id}:{terminal_section_id}`
- `terminal_tab_record.v1:{project_id}:{terminal_tab_id}`
- `terminal_pane_record.v1:{project_id}:{terminal_pane_id}`
- `terminal_leaf_pane_record.v1:{project_id}:{terminal_leaf_pane_id}`
- `terminal_workgroup_record.v1:{project_id}:{terminal_workgroup_id}`
- `editor_terminal_panel_state.v1:{project_id}:{workspace_tab_id}:{editor_terminal_panel_id}`
- `terminal_session_record.v1:{project_id}:{terminal_session_id}`
- `terminal_command_block.v1:{project_id}:{terminal_session_id}:{command_block_id}`
- `dev_session_record.v1:{project_id}:{dev_session_id}`
- `mcp_server_record.v1:{mcp_server_id}`
- `mcp_runtime_availability.v1:{mcp_server_id}:{provider_id}:{runtime_subject_id}`
- `mcp_tool_record.v1:{mcp_server_id}:{tool_id}`
- `skill_record.v1:{skill_id}`
- `skill_runtime_readiness.v1:{skill_id}:{provider_id}:{runtime_subject_id}`
- `debug_investigation_record.v1:{project_id}:{investigation_id}`
- `gha_panel_state.v1:{project_id}`
- `bundle_registry.v1:{project_id}:{bundle_id}`
- `note_record.v1:{bundle_id}:{note_id}`
- `revision_run.v1:{bundle_id}:{revision_id}`
- `composer_prep_state.v1:{thread_id}`
- `preview_state.v1:{project_id}:{preview_id}`
- `browser_session_state.v1:{project_id}:{browser_session_id}`
- `browser_profile_state.v1:{project_id}:{profile_scope}`

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/Skills_System.md

Investigation bundle records use the root manifest identity `schema_id = pm.investigation_bundle.schema.v1` plus `bundle_id` and `schema_version`; the Runtime Artifacts panel owns the full manifest field set, while storage persists registry identity and lookup keys.

Debug investigation records persist target binding and temporary instrumentation lineage. Durable fixes are allowed only for workspace-bound targets or for PM-owned surfaces such as `agent_session`; arbitrary external targets may store evidence and suggestions, but storage must not represent them as durable workspace mutation authority until a workspace binding exists.

`debug_investigation_record.v1:{project_id}:{investigation_id}` includes `instrumentation_manifest[]`. Each `instrumentation_manifest` item records `instrumentation_id`, `scope`, `state`, `targets_or_files`, `introduced_at_utc`, optional `removed_at_utc`, optional `restore_point_id`, and `cleanup_outcome`. These fields preserve the storage join between temporary source edits, temporary env/config/runtime changes, rollback evidence, and cleanup reporting.

The investigation record also persists cross-surface identity links needed for Debug restore and reopen: `run_id?`, `thread_id?`, `dev_session_id?`, `browser_session_id?`, DAP/debugger identity refs, and relevant `artifact_ids[]` / `artifact_refs[]`. Debug overlay state stores requested and effective mode overlay, target binding summary, lifecycle phase/state, attention or blocked reason codes, visible Investigation Context item refs, and last restore/reopen outcome so PM can reopen the same investigation without rebinding by guess or flattening DAP, browser, dev-session, and runtime-artifact identities into one generic debug session.

When an investigation needs relaunch or attach semantics, storage records enough target context to restart or relaunch under the correct env `/config/wrapper` settings and to attach browser `/debugger/profiler` tooling to the correct process `/session` without rebinding by guess.

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md

Canonical key reconciliation notes:
- `attempt_record.v1:{project_id}:{node_id}:{attempt_number}` is the canonical attempt key. `project_id` is required for cross-project queries, retention, and cleanup; `run_id` and `attempt_id` remain stored fields on the record but are not key components.
- `blocked_projection.v1:{project_id}:{node_id}` is the canonical blocked-state key. The value includes `{ blocked_reason_code, blocked_at, blocked_family, approval_scope_key?, allowed_action_ids[] }`.
- older 3-component or run-scoped variants are superseded by the canonical forms above and remain migration-read aliases only.

Blocked-projection migration/versioning rule:
- `blocked_projection.v1:{project_id}:{node_id}` is the only write target for blocked-state projections.
- Run-scoped or sequence-keyed variants such as `blocked_projection.{run_id}.{node_id}.{blocked_sequence}` are migration-read aliases only; projectors may read them for replay but must write the canonical v1 key.
- Any future redb key-shape or value-shape change must introduce an explicit family/version or same-section `/migration` note before writes begin. Unversioned shape drift, three-way concurrent key ownership, and silent redb rewrites are invalid.
- Migrations preserve the original source key, translated canonical key, schema/version used, and replay checkpoint so blocked history can be audited without diffing addenda.

Canonical record field-level minima:
- `attempt_record.v1:{project_id}:{node_id}:{attempt_number}` stores `project_id`, `node_id`, `attempt_number`, `run_id`, `attempt_id`, `execution_unit_context_ref?`, `permission_snapshot_id?`, recovery/safe-point lineage refs, and result or blocked-state refs. SCM-capable attempts also carry `repo_id`, `worktree_id`, `worktree_path`, `branch_name`, `head_commit_oid`, `baseline_commit_oid`, `compare_target_ref`, `git_operation_ref`, and `pr_ref`.
- `terminal_workspace_state.v1`, `terminal_section_record.v1`, `terminal_tab_record.v1`, `terminal_pane_record.v1`, `terminal_leaf_pane_record.v1`, `terminal_workgroup_record.v1`, `editor_terminal_panel_state.v1`, `terminal_session_record.v1`, and `terminal_command_block.v1` preserve workspace tab identity, section/tab/pane split identity, layout slot/order, labels, active/focus state, cwd/cwd snapshot, shell profile, runtime or historical state, transcript/scrollback anchors, command text, exit status, and command-block metadata without collapsing terminal restore into one bottom-panel blob.
- `dev_session_record.v1:{project_id}:{dev_session_id}` stores `project_id`, `dev_session_id`, linked `run_id?`, `thread_id?`, `workspace_tab_id?`, `terminal_session_id?`, DAP/debugger identity refs, target binding summary, lifecycle phase/state, historical/live verification state, last restore or reopen outcome, and relevant `artifact_ids[]` / `artifact_refs[]`. `dev_session_id` owns higher-level dev workflow continuity and must not replace `terminal_session_id` when exact PTY reuse is required.

GitHub Actions panel state:

```text
gha_panel_state.v1:{project_id} {
  effective_account_id: string?,     // account partition; absent only for unauthenticated/read-only views
  pinned_workflows: string[],      // workflow IDs pinned to panel header
  filter_status: "all" | "failed" | "running" | "success",
  auto_refresh_interval_ms: u64,   // default: 30000
  collapsed_sections: string[],    // collapsed workflow groups
  last_viewed_run_id: string?,
  notification_prefs: {
    notify_on_failure: bool,       // default: true
    notify_on_success: bool,       // default: false
  },
}
```

`gha_panel_state.v1:{project_id}` is account-sensitive. Implementations may store per-account partitions inside the project-scoped record or migrate to a narrower account-scoped key, but they MUST invalidate pinned workflows, last-opened run/job/log focus, and admin-readiness snapshots when the active effective account no longer matches `effective_account_id`.

Document bundle registry persistence:

Embedded-document bundle and annotation persistence extends the existing note model, not a net-new storage subsystem. The stable storage-key inventory is `notes_index.{bundle_id}`, `note.{bundle_id}.{note_id}` with `note_record.v1` payload compatibility, `revision_run.{bundle_id}.{revision_id}` for targeted revision recovery, and `note_reply_index.{bundle_id}.{note_id}` for reply-to-revision lookup. This receipt-extension and `/revision/preview` storage coverage stays under the bundle/revision/preview schema family rather than becoming scattered GUI state. Implementations may map those ledger keys to typed store keys such as `note_record.v1:{bundle_id}:{note_id}` or `revision_run.v1:{bundle_id}:{revision_id}`, but migrations, event projections, and recovery diagnostics must preserve the semantic key names and bundle/note revision lineage.

```text
bundle_registry.v1:{project_id}:{bundle_id} {
  bundle_id: string,
  project_id: string,
  created_at: ISO8601,
  status: "draft" | "in_review" | "approved" | "rejected" | "merged",
  files: BundleFile[],
  review_gate: {
    required_approvals: u32,
    current_approvals: u32,
    auto_merge: bool,
  },
  notes: NoteRecord[],
}

note_record.v1:{bundle_id}:{note_id} {
  note_id: string,
  bundle_id: string,
  file_path: string,
  line_range: [u32, u32],
  content: string,
  author: "user" | "agent",
  created_at: ISO8601,
  resolved: bool,
  resolution: string?,
  operation?: "comment" | "replace" | "insert_after" | "remove",
  intent_kind?: "question" | "change_request" | "both",
  operation_payload?: { body } | { replacement_text, rationale? } | { insert_text, rationale? } | { rationale? },
  source_surface?: "assistant_deep_plan" | "interview_doc_pane" | "document_viewer" | string,
  provenance?: { doc_id: string, path: string, selected_text_excerpt: string },
  anchor?: {
    text_position?: "anchor.text_position",
    text_quote?: "anchor.text_quote",
  },
  last_revision_id?: string,
  last_reanchor_result?: string,
  updated_anchor?: AnchorRef,
}
```

`note_record.v1` remains the compatibility lineage for Annotations, but the storage contract is no longer note-only. Implementations MUST preserve `anchor.text_position`, `anchor.text_quote`, `selected_text_excerpt`, `last_revision_id`, `last_reanchor_result`, `updated_anchor`, and provenance whenever they exist, so targeted revision can re-anchor or keep the annotation open instead of silently losing context.

Targeted revision persistence:

```text
revision_run.v1:{bundle_id}:{revision_id} {
  revision_id: string,
  bundle_id: string,
  trigger: "note_reply" | "resubmit" | "auto_fix",
  note_reply_index: NoteReplyRef[],  // which notes triggered this revision
  status: "pending" | "running" | "completed" | "failed",
  requested_revision_capability?: string,
  effective_revision_capability?: "schema_enforced_structured_revision" | "validated_structured_revision" | "chat_handoff_only",
  annotation_ids[]: string,
  changes: FileChange[],
  created_at: ISO8601,
}

composer_prep_state.v1:{thread_id} {
  draft_text: string,
  attachments: AttachmentRef[],
  mode_overlay: ModeOverlay?,
  requested_persona: string?,
  effective_persona: string?,
  persona_selection_source: string?,
  persona_override_owner_id: string?,
  saved_at: ISO8601,
}
```

`/chip/persistence` is storage-owned for document and browser capture handoff. `selection-to-chat`, `document-selection`, and `browser.context_captured` write chat-side pending composer chips into `composer_prep_state.v1:{thread_id}` with bounded excerpt or browser context summary, source pointer, provenance, requested/effective target, sensitivity status, capture status, and failure status when forwarding is blocked. Browser capture records preserve `attachment_type` as either `browser_selection_context` or `browser_element_context`, plus `chip_id`, `browser_session_id`, and optional `thread_id`, so element-pick and text-selection chips remain distinct until the user sends. Legacy browser-only click-to-context and Deep Plan note-only review wording are compatibility labels only; persistence normalizes these paths into typed selection/context chips plus durable annotation records instead of maintaining separate browser-only or note-only storage families.

Bundle annotation/revision audit events:
- `bundle.note_created` records the durable annotation id and source document provenance.
- `bundle.note_status_changed` records status changes for `open`, `addressed`, `still_open`, `cannot_apply`, and `resolved`.
- `bundle.revision_started`, `bundle.revision_completed`, and `bundle.revision_interrupted` record targeted revision lifecycle, `annotation_ids[]`, and `requested_revision_capability` versus effective capability.
- `bundle.selection_sent_to_chat` records `requested_target` and `effective_target` for successful chat handoff.
- `bundle.selection_forward_blocked` records blocked handoff attempts and the visible reason instead of pretending the chip was sent.

Preview and browser persistence:

Legacy `browser_state.v1` and `browser_state:v1` single-blob shapes are retired. Browser persistence is split across `preview_state.v1`, `browser_session_state.v1`, and `browser_profile_state.v1` so requested/effective runtime capability, permission tier, profile scope, restore policy, and visible session class remain auditable independently. Browser-specific fields such as `requested_browser_runtime`, `effective_browser_runtime`, requested/effective capabilities, and visible session class are additive child fields on the shared runtime-identity model; they must not fork the canonical requested/effective naming pattern owned by `Plans/Contracts_V0.md`.

```text
preview_state.v1:{project_id}:{preview_id} {
  preview_id: string,
  preview_type: "web" | "markdown" | "component",
  source_file: string,
  port: u16?,
  status: "starting" | "running" | "stopped" | "error",
  last_refresh: ISO8601,
}

browser_session_state.v1:{project_id}:{browser_session_id} {
  browser_session_id: string,
  project_id: string,
  workspace_tab_id: string?,
  preview_subject_id: string?,
  session_class: "workspace_preview" | "detached_preview" | "automation_session" | "auth_session" | "normal_browsing",
  requested_browser_runtime: string,
  effective_browser_runtime: string,
  requested_capabilities: string[],
  effective_capabilities: string[],
  capability_degradations: string[],
  blocked_actions: string[],
  permission_tier: "always_allowed" | "session_granted" | "explicit_confirmation",
  profile_scope: string,
  restore_policy: "restore_intent" | "restore_session" | "do_not_restore",
  takeover_state: "none" | "offered" | "paused_for_user" | "promoted" | "stopped_keep_browser",
  url: string,
  viewport: { width: u32, height: u32 },
  scroll_position: { x: f64, y: f64 },
  zoom_level: f64,
  dev_tools_open: bool,
  last_error: string?,
}

browser_profile_state.v1:{project_id}:{profile_scope} {
  project_id: string,
  profile_scope: string,
  user_agent: string?,
  cookies_enabled: bool,
  javascript_enabled: bool,
  custom_headers: Record<string, string>,
  profile: { name: string, saveChanges: boolean },
  persistent_profiles_enabled: bool,
  cookie_scope: "session" | "project_profile",
  localStorage_persistence: "isolated" | "save_on_close",
  saveChanges_writeback_state: "not_requested" | "pending" | "written" | "blocked" | "failed",
}
```

**runtime artifact index** authoritative record families:

```text
artifacts_project_state.v1:{project_id} {
  project_id: string,
  projection_freshness: "current" | "refreshing" | "stale",
  projection_health: "healthy" | "degraded" | "unavailable",
  artifacts: [{
    artifact_id: string,
    artifact_type: string,
    run_id?: string,
    thread_id?: string,
    node_id?: string,
    attempt_id?: string,
    worktree_id?: string,
    lane_id?: string,
    repo_id?: string,
    path_ref?: string,
    branch_ref?: string,
    baseline_ref?: string
  }]
}

projector.checkpoint.runtime_artifacts:{project_id} {
  project_id: string,
  projection_freshness: "current" | "refreshing" | "stale",
  projection_health: "healthy" | "degraded" | "unavailable"
}
```

**worktree record** and **lane record** authoritative fields:

```text
worktree_record.v1:{project_id}:{worktree_id} {
  project_id: string,
  worktree_id: string,
  lane_id?: string,
  owner_thread_id?: string,
  repo_id?: string,
  path_ref?: string,
  branch_ref?: string,
  baseline_ref?: string
}

lane_record.v1:{project_id}:{lane_id} {
  project_id: string,
  lane_id: string,
  worktree_id?: string,
  repo_id?: string,
  path_ref?: string,
  branch_ref?: string,
  baseline_ref?: string
}

worktree_projection.v1:{project_id}:{worktree_id} {
  project_id: string,
  worktree_id: string,
  projection_freshness: "current" | "refreshing" | "stale",
  projection_health: "healthy" | "degraded" | "unavailable"
}

lane_projection.v1:{project_id}:{lane_id} {
  project_id: string,
  lane_id: string,
  projection_freshness: "current" | "refreshing" | "stale",
  projection_health: "healthy" | "degraded" | "unavailable"
}
```

Related events:
- `preview.session.started`
- `preview.session.stopped`
- `preview.session.refreshed`
- `browser.session.navigated`
- `browser.session.resized`
- `browser.context_captured`

Required identity and attribution fields across runtime-linked record families include:
- `project_id`
- `run_id`
- `node_id?`
- `attempt_id?`
- `blocked_sequence?`
- `feature_seam_id?`
- `work_package_id?`
- `lane_id?`
- `worktree_id?`
- `execution_role?`
- `requested_platform?`
- `effective_platform?`
- `requested_provider_family_id?`
- `provider_family_id?`
- `effective_provider_family_id?`
- `requested_transport_kind?`
- `effective_transport_kind?`
- `requested_runtime_platform_id?`
- `effective_runtime_platform_id?`
- `requested_model?`
- `effective_model?`
- `model_provider_id?`
- `model_id_raw?`
- `model_key?`
- `requested_auth_mode?`
- `effective_auth_mode?`
- `requested_account_policy?`
- `requested_account_id?`
- `requested_billing_entity_id?`
- `effective_account_id?`
- `effective_billing_entity_id?`
- `effective_billing_entity_label?`
- `effective_entitlement_class?`
- `connection_profile_id?`
- `requested_connection_profile_id?`
- `effective_connection_profile_id?`
- `selectable_unit_id?`
- `effective_health_state?`
- `effective_pressure_state?`
- `instruction_projection_state?`
- `skill_projection_state?`
- `reason_codes[]?`
- `transport_backend_contract?`
- `account_switch_reason?`
- `provider_attempt_ref?`
- `usage_event_ref?`
- `workspace_tab_id?`
- `terminal_section_id?`
- `terminal_tab_id?`
- `terminal_pane_id?`
- `terminal_leaf_pane_id?`
- `terminal_workgroup_id?`
- `editor_terminal_panel_id?`
- `terminal_session_id?`
- `dev_session_id?`

Storage rules for provider/runtime identity:
- `selectable_unit` persistence carries the full chosen-unit snapshot: `selectable_unit_id`, `root_path`, `last_usage_snapshot`, and `last_cooldown_snapshot` are stored with the attempt or deeper resolver/debug payload that needs them.
- Lower-level `provider-session` identifiers stay out of base canonical event `/history` records; they may appear only in attempt-scoped or `/debug` payloads where they are subordinate to `attempt_id`, `provider_attempt_ref?`, and the requested/effective runtime snapshot.
- Runtime transport/backend contracts are stored as account/auth and capability facts using the exact backend vocabulary `direct_api`, `acp`, `stream_json`, and `headless_json` when those surfaces are material to replay, health, or attribution.
- Persisted provider/runtime records that need a storage-local transport discriminator use `transport_class` and reuse canonical `ProviderTransport` values rather than inventing unrelated transport labels.
- Requested/effective runtime snapshots preserve `requested_provider_family_id`, `effective_provider_family_id`, `requested_transport_kind`, `effective_transport_kind`, `requested_connection_profile_id`, and `effective_connection_profile_id` separately so explicit user/profile intent, resolver fallback, and the transport that actually executed the call remain auditable.
- Attempt and resolver records persist `effective_health_state`, `effective_pressure_state`, and `instruction_projection_state` beside the selected runtime snapshot when those states affected eligibility, routing, fallback, or projected-instruction trust; these fields do not collapse into account auth status, generic cooldown, or `skill_projection_state`.
- Model availability and `/discovery` records use `model_key = model_provider_id/model_id_raw`; `/model_id_raw` is preserved as provider-native identity and does not replace PM's canonical model identifier.
- Provider-native projection records persist `drift-state` and `drift-check` timing separately from `/detach` and `/runtime` actions, so repair history can distinguish stale projections from user-detached targets.
- Codex-style entitlement attribution stores the exact class distinction `effective_entitlement_class = chatgpt_plan | api_billed` so ChatGPT-plan usage and API-billed usage do not collapse into one account bucket.
- Resolver output records preserve `reason_codes` / `reason_codes[]` for the selected `selectable_unit_id`, including fallback, pressure, capability, and policy reasons.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md, ContractName:Plans/assistant-chat-design.md

Projection-state families must expose both freshness and health:
- `projection_freshness`: `current | refreshing | stale`
- `projection_health`: `healthy | degraded | unavailable`

Rules:
- stale and degraded are different states and must not collapse into one generic trust field.
- account-backed runtime records and server-profile-backed runtime records remain distinct durable shapes even though the GUI presents them in one runtime ontology.
- usage attribution records store effective billing/entity context when it explains the active quota bucket, but they do not persist scheduler-only debug internals.
- `requested_runtime_platform_id` and `effective_runtime_platform_id` stay audit-visible requested/effective runtime snapshot fields; lower-level `/provider-registry/scheduler-only` internals remain hidden unless a concrete debug/audit use case proves otherwise.
- GUI projection key `terminal_state:v1` may remain a GUI-facing projection name, but canonical ownership stays with terminal workspace, section, workgroup, tab, leaf-pane, panel, session, and command-block records.
- route restoration resolves through canonical record identity, not through feature-local ad hoc payloads.
- PM-generated CLI adapter config and projection files are derived artifacts and MUST NOT become the canonical ownership store for accounts, MCP state, instruction state, or skills.
- Prompt `injected-context` artifacts and provider-facing instruction projections are derived runtime inputs; storage persists their source refs, projection state, and lineage, not the injected text as a canonical replacement for Prompt Pipeline owner contracts.
- Prompt/cache affinity preserves stable cache identity across ordinary continuation or resume within the same logical run lineage. Branch, rewind, replacement, and other lineage-changing actions establish a new cache lineage; manual `Compact Now` does not by itself force a new cache lineage unless it also changes the logical run lineage.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/storage-plan.md

ContractRef: Plans/Runtime_Artifacts_Panel.md#4. redb key and projector, Plans/WorktreeGitImprovement.md#4.1 Assistant-created worktree lifecycle

### Runtime artifact and projection storage scope

Storage restores identity-native targets subject-first: persisted `doc:<document_id>` and `artifact:<artifact_id>` subjects remain the durable identity for generated or staged content, while `resume_url` and route payloads restore navigation context around that subject rather than replacing it. Any surviving `tier_runtime_record` is a compatibility/current-view overlay and MUST NOT own canonical runtime identity, joins, or restoration authority.


Required fields:
- artifact_type
- repo_id
- path_ref
- branch_ref
- baseline_ref

Canonical terms and values:
- artifacts_project_state.v1:{project_id}
- projector.checkpoint.runtime_artifacts:{project_id}

Labels:
- runtime artifact index
- worktree record
- lane record

Behavioral rules:
- Runtime-artifact indexing and durable worktree/lane identity are storage-owned families.
- Projection state and projector checkpoints must be first-class rather than panel-owned leftovers.

### Canonical terminal persistence decomposition


Storage-plan is the canonical source for terminal persistence keys. The terminal surface persists as the following decomposed key families:

1. `terminal_session.v1:{terminal_session_id}` — PTY session state
2. `terminal_layout.v1:{project_id}` — terminal panel layout
3. `terminal_history.v1:{terminal_session_id}` — command history
4. `terminal_profile.v1:{profile_name}` — shell profile config
5. `terminal_env.v1:{project_id}` — environment variable overrides
6. `terminal_cwd.v1:{terminal_session_id}` — working directory
7. `terminal_scroll.v1:{terminal_session_id}` — scroll buffer state
8. `terminal_font.v1:global` — terminal font settings
9. `terminal_color.v1:global` — terminal color scheme

FinalGUISpec §15.1 references `terminal_state:v1` as a subset alias. The canonical keys above provide the full decomposition.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md

### Terminal persistence data model

Storage-plan owns the terminal persistence `/data-model`; Contracts and UI surfaces consume these records rather than inventing local terminal schemas.

- `terminal_project_state`: `project_id`, settings version, last-opened time, restore flag, and per-project terminal settings blob/reference.
- `terminal_sections`: `terminal_section_id`, `project_id`, `order_index`, `dock_state`, `dock_zone`, visibility, and `detached_window_bounds` when detached.
- `terminal_tabs`: `terminal_tab_id`, `terminal_section_id`, `order_index`, label, active state, `layout_style`, and `review_only`.
- `terminal_panes`: `terminal_pane_id`, `terminal_tab_id`, `order_index`, `layout_slot`, label, `runtime_state`, and nullable `attached_terminal_session_id`.
- `terminal_sessions`: `terminal_session_id`, current pane attachment, `shell_type`, `shell_profile`, cwd, `cwd_snapshot`, environment summary, capability tier, `runtime_state`, `created_at`, last activity timestamp, nullable `exit_code`, and restore state. For worktree-bound thread terminals, the `terminal_session_record` records `cwd_snapshot` as the worktree path, not the main project root.
- `terminal_command_blocks`: command-block identity, owning `terminal_session_id`, ordinal, command text, cwd, exit status, `/scrollback` or transcript anchors, and command-block metadata.

Terminal storage MUST preserve the `section/tab/pane/session` identity split rather than collapsing it into flat bottom-panel metadata. Durable restore first reconstructs terminal sections, tabs, panes, labels, layout style, and session bindings; only after that may runtime code verify whether an attached `terminal_session_id` is still live.

The restore record carries an explicit transcript-vs-command-block boundary. Transcript chunks are bounded, append-oriented, and referenced by session and scrollback anchors; command blocks are metadata layered on those transcript ranges and may become partially backed or metadata-only when transcript retention prunes backing output. This is the canonical no-fake-liveness rule: a restored pane may be historical, review-limited, or history-unavailable, but storage MUST NOT mark it live unless liveness is revalidated by the terminal runtime.

Storage also owns the durable join shape for `/tab/pane/session` and `/tab/pane/session/dev-session` lookups. Command `/routing` and `/open` selectors persist target identity refs such as `terminal_section_id`, `terminal_tab_id`, `terminal_pane_id`, `terminal_session_id`, and optional `dev_session_id`; route/open recovery must use those refs instead of labels, last visible titles, or legacy `cmd.dev.*`-only hidden-gap assumptions.

Terminal GUI `/persistence/settings` records are separate from live PTY state. Storage persists project/workspace defaults, per-tab overrides, font and color references, transcript-retention settings, and shell profile refs; `Plans/FinalGUISpec.md` owns visible Settings > Terminal GUI grouping, `/theming/discoverability`, shortcuts, and user-facing labels, while this plan owns the durable keys and migration behavior consumed by that GUI.

Terminal terminology cross-refs remain explicit so storage does not drift back into ambiguous "terminal tab" wording. `terminal_section_id`, `terminal_tab_id`, `terminal_pane_id`, `terminal_session_id`, and `dev_session_id` are the persisted terms consumed by `Plans/Glossary.md`, `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/FinalGUISpec.md`, `Plans/UI_Command_Catalog.md`, and `Plans/Contracts_V0.md`; adjacent terminal-heavy tools and /IDEs research informs these records only through canonical fields, not through research-task names.

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

### Naming and migration rules (terminal/storage keys)
Storage migrations are forward-only and monotonic.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Required rules:
- New fields must be additive first; destructive renames require a migration note in the same section that introduces them.
- Keys MUST keep stable semantic names across runtime, persistence, and events unless this plan explicitly defines a translation layer.
- `session_id`, `thread_id`, `run_id`, `message_id`, `step_id`, `tool_call_id`, `approval_id`, `provider_session_id`, `terminal_session_id`, and `dev_session_id` keep their existing meanings everywhere they appear.
- If two subsystems need different terminology, the owner doc must define the mapping explicitly rather than silently overloading a shared field name.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

### Storage owner lock-path, migration, and bounded-collections canon

Storage owns `lock-path` derivation. The active `pm.lock` path is `root-derived`: compute it from the selected `logical-root` and, when the selected durable root is not safe for writes, from the safe-local `fallback-derived` durable-store path while preserving the logical root in lineage and diagnostics. Legacy hardcoded `/.puppet-master/pm.lock` and `<project>/.puppet-master/pm.lock` strings are migration evidence only; new writers and consumer docs MUST use the owner-derived lock path.

When the active durable-store lock cannot be acquired or validated, PM opens storage projections in `/read-only` viewer mode and stops before writer startup. It MUST NOT create a second project-local lock beside the owner-derived path.

Storage also owns `run.completed.usage` persistence as the optional run-completion usage snapshot. It is a bounded snapshot derived from canonical `usage.event` records, not a replacement for the usage event ledger.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Commands_System.md

### Storage-owned rewrite contract
All non-append durable-store rewrites MUST use same-directory temporary files and atomic promotion.
- Replacement writes for state files, manifests, checkpoints, segment rewrites, or similar durable storage artifacts MUST create `<target>.tmp.<random>` in the target directory, write the full replacement payload there, `fsync` the temp file, and then rename/promote it into place.
- Append-only seglog/event writers are exempt from temp-rename promotion, but they remain subject to durable flush and corruption-detection rules.
- Per-session temp directories MAY hold scratch artifacts or janitor-managed work files, but they MUST NOT be used for replacement writes that rely on same-filesystem atomic rename.
- Failure to create the temp file, `fsync` it, or rename/promote it is a hard error; PM MUST NOT silently fall back to direct overwrite.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md

Storage-root (`storage-root`) selection order:
1. Explicit user-configured storage root (if valid and permitted).
2. `PUPPET_MASTER_DATA_DIR` environment override when present, valid, and permitted.
3. Project-scoped durable root when the feature is project-owned.
4. App-level durable root for cross-project state.
5. Session temp root only for explicitly temporary data.

Selection rules:
- A feature may write to a session temp root only if its contract explicitly classifies the artifact as temporary or disposable.
- Durable state MUST survive process restart unless the owning contract explicitly says otherwise.
- Remote-mode projects keep durable storage colocated with the owning authority defined by `Plans/GitHub_Integration.md`; temp mirrors are not durable ownership transfers.

Durable-store safety rules:
- Never rewrite durable files via cross-filesystem temp paths when the final correctness contract depends on atomic rename.
- Janitor cleanup MAY remove abandoned temp files, but it MUST NOT touch active durable targets or preserved checkpoints.
- When a durable store is unavailable, writers fail closed and surface a structured error instead of downgrading silently to temp-only persistence.
- Detect `unsafe-filesystem` classes such as NFS, remote mounts without reliable locking, and roots that cannot prove same-directory atomic rename semantics before opening writers. If a safe local durable-store fallback is available, route writer state, lock files, and session snapshots there while keeping the selected logical root as lineage; otherwise enter `/read-only` viewer mode.
- Migration backups follow `backup-before-any-migration-step`: snapshot the affected canonical store before validation, schema rewrite, file promotion, destructive cleanup, or rollback-sensitive repair begins, and keep that backup addressable until the migration result has been verified.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md

#### Active durable-store lock identity
The active durable-store lock is keyed by `(storage_root, authority_scope, store_family)`.
- Session or run ids are not sufficient durable-store lock identities by themselves.
- Store families that require independent recovery or retention policies must not share a lock identity merely because they live under the same root.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md

#### Concrete bounded collections
Live storage-managed collections MUST have explicit bounds or retention contracts.

The universal bounded-collection rule is `TTL` plus `/max-cardinality`: every persistent `/long-lived` storage-managed collection either declares a time-to-live, declares a maximum retained item count, or declares both. This is the `bounded-collections` canon; a separate collection inventory is not required when the owner section names the family, bound type, bound source, and retention/eviction notes.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/LSPSupport.md

| Collection / family | Bound type | Bound source | Notes |
|---|---|---|---|
| Active assistant and child-session state maps | Max cardinality | Active run envelope plus `max_total_active_agents` | Historical data moves to durable history/checkpoints instead of staying in live maps. |
| MCP connection and auth-handle caches | Max cardinality | Registered server count x active auth scopes | Superseded or idle handles are evicted instead of accumulating indefinitely. |
| LSP session and host/root attachment maps | Max cardinality | Open project/worktree roots x configured servers | Restart/rebind replaces prior attachments instead of widening the map. |
| Projector and analytics work queues | Max queue depth | Per-projector batch limits plus checkpoint/resume contract | Excess work spills via checkpointed resume rather than unbounded in-memory growth. |
| Persisted event records and `seglog.event_appended` append observability | TTL + cardinality | Run/thread retention policy plus segment checkpoint boundaries | Default TTL is inherited from the owning event family retention window; cleanup is triggered by janitor sweep and segment compaction, with legal-hold or preserved-run anchors opting out explicitly. |
| Safe points, snapshot metadata, and undo indexes | TTL + cardinality | Session/run lineage plus configured retention window | Preserved or legal-hold items opt out explicitly; ordinary session artifacts age out. |
| Temp artifacts and stale rewrite remnants | TTL | Janitor sweep plus configured max age | `.tmp.*` rewrite remnants and abandoned scratch artifacts are cleaned deterministically. |

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/LSPSupport.md

### 2.4 Projector pipeline: consumption, JSONL mirror, Tantivy, checkpoints

Regex-index indexing model byte contract (`storage-plan.md ### 2.4`): implementers MUST NOT decode content to Unicode for frequency-table computation or n-gram extraction; all extraction, weighting, and case-fold guard checks operate byte-level on `u8`.

Regex-index build concurrency (`storage-plan.md ### 2.4`): projects share a common build thread pool, each project has one build slot within that shared pool, and when the pool is saturated pending builds queue FIFO until their project slot and a shared worker are available.

Concurrent mmap/file-handle contract (`storage-plan.md ### 2.4`): on Windows, `memmap2` index files are opened with `share_mode(0x7)` (`FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE`) as defense-in-depth; on Linux and macOS (`/macOS`), mmap'd file deletion remains safe through inode-by-fd semantics.


**Consumption model:** Each projector advances in canonical seglog order:

1. Read checkpoint from redb (`segment_generation`, `segment_name`, `byte_offset`, `last_seq`).
2. Open seglog at that location and read records in order.
3. For each event, update only the projections that own it (JSONL mirror, Tantivy, redb snapshot/projector state, analytics enqueue, etc.).
4. Commit the new checkpoint only after the owned projection writes are durable.

**JSONL mirror policy:**
- JSONL mirror is derived, human-readable, and rebuildable. It is never authoritative over seglog.
- The mirror preserves the canonical event envelope in sequence order; projector-local metadata may exist in file naming or side metadata, but not as a semantic fork of the event payload.
- Mirror files rotate deterministically with seglog generations/segments so replay, diffing, and corruption recovery stay explainable.
- A missing or stale mirror file is repaired by replaying the corresponding seglog range; PM MUST NOT backfill seglog from JSONL.
- Mirror retention follows the source seglog retention/preservation decision. A preserved or legal-hold seglog range keeps its mirror unless the mirror is explicitly regenerated in place from the same source range.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/FileSafe.md

**Tantivy/index rebuild rules:**
- Tantivy indices, analytics rollups, and other projections rebuild from seglog or the canonical source range chosen by the owning projector.
- Projector checkpoints are durable ownership boundaries; partial projection writes do not advance checkpoints.
- Rebuild after schema-version change clears only the derived projection state being regenerated; the canonical seglog and unrelated redb families remain untouched.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

**Checkpoint guarantees:**
- checkpoints encode enough information to resume without duplicate semantic writes
- sequence order, not file mtime, is the source of truth for replay ordering
- checkpoint advancement is atomic with projector durability, not with UI refresh timing
- projector checkpoints are not a substitute for runtime recovery checkpoint markers. Runtime/executor-owned checkpoint marker events and safe-point lineage records MUST be durably emitted to seglog before mutation-capable execution resumes or restore flows continue.
- recovery resume logic uses the canonical runtime checkpoint marker stream plus projector checkpoints; projector checkpoints alone are insufficient for mutation/recovery replay.
- `run.completed.usage` is the optional run-completion snapshot carried in `run.completed`; it is derived from canonical `usage.event` records and must include the same attribution tuple when present.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### 2.5 Analytics scan jobs

**Trigger:** Periodic (e.g. every 5 minutes) or on-demand (e.g. when Usage view is opened). Can run in a background task or a separate thread; must not block the main UI. On-demand refresh should leave the previously written rollups visible until the new scan completes.

**Scan range:** Last N hours (e.g. at least 7d for `tool_usage.7d`) or since last scan checkpoint. Read from seglog (or JSONL mirror) in order; filter by event type (`usage.event`, `run.completed`, `tool.invoked`). Canonical tool-usage windows for MVP are `5h`, `24h`, and `7d`; `1h` remains optional.

**Compute:** For 5h/7d: aggregate `usage.event` by platform, sum tokens (or request count) in sliding 5h and 7d windows. For tool latency: collect `tool.invoked` latencies, compute percentiles (p50, p95). For error rates: count run failures / total runs in window. For **tool usage** (Usage tool widget, Plans/Tools.md §8.4): aggregate `tool.invoked` by `tool_name` over the window -- count, p50/p95 ms, error_count (count only events where `success = false`). `tool.denied` events and FileSafe blocks do **not** contribute to `tool_usage.{window}` because the widget reflects executed calls only.

**Write:** Store results in redb under `rollups` namespace (e.g. `usage_5h.{platform}`, `usage_7d.{platform}`, `tool_latency.{window}`, **`tool_usage.{window}`**, `tool_usage_meta.{window}`). Usage view and tool usage widget read from these keys; no direct seglog read for dashboard.

**Checkpoint:** Store "last scanned up to seq X" or "last scanned timestamp" in redb so the next run doesn't rescan from the beginning. Idempotent: recomputing the same window and writing the same keys is safe.

### 2.6 Assistant worktree event schemas

Storage registers assistant worktree seglog events using the same underscore convention as `chat.thread_created`, `chat.thread_archived`, and `chat.thread_deleted`; incoming dot-form review aliases such as `chat.thread.worktree_bound` normalize to `chat.thread_worktree_bound` before projection. The `worktree_` segment inside the event name groups the assistant worktree lifecycle events logically without introducing a new namespace depth. The event schemas are ADDITIVE to the existing chat event catalog and bind to `thread_state:{thread_id}:worktree_binding`, `worktree_binding_reverse:{worktree_id}`, and `worktree_record.v1:{project_id}:{worktree_id}` rather than inventing another worktree store. The first eight rows below are assistant worktree lifecycle, merge, and PR events; the final three rows are pre-merge test events.

The `thread_state:{thread_id}:worktree_binding` and `worktree_binding_reverse:{worktree_id}` redb keys are disposable projections rebuilt by replaying `chat.thread_worktree_bound` and `chat.thread_worktree_unbound` seglog events in order, consistent with the JSONL mirror and other redb/Tantivy projections being rebuildable from seglog. `thread_state:{thread_id}:persona_override` follows the same per-thread redb state-key pattern, while `worktree_projection.v1:{project_id}:{worktree_id}` remains the project/worktree projection record.

| Event type | Minimum payload |
|---|---|
| `chat.thread_worktree_bound` | `thread_id`, `worktree_id`, `branch_name`, `worktree_path`, `binding_origin` |
| `chat.thread_worktree_unbound` | `thread_id`, `worktree_id`, `reason` |
| `chat.thread_worktree_renamed` | `thread_id`, `worktree_id`, `old_branch_name`, `new_branch_name` |
| `chat.thread_worktree_create_failed` | `thread_id`, `error`, `binding_origin` |
| `chat.thread_worktree_merged` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `strategy`, `result_commit_sha` |
| `chat.thread_worktree_merge_failed` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `strategy`, `error`, `has_conflicts` |
| `chat.thread_worktree_pr_created` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `pr_url`, `pr_number` |
| `chat.thread_worktree_pr_failed` | `thread_id`, `worktree_id`, `branch_name`, `error`, `phase` |
| `chat.thread_worktree_pre_merge_test_started` | `thread_id`, `worktree_id`, `command`, `test_target`, `strategy` |
| `chat.thread_worktree_pre_merge_test_passed` | `thread_id`, `worktree_id`, `command`, `duration_ms`, `strategy` |
| `chat.thread_worktree_pre_merge_test_failed` | `thread_id`, `worktree_id`, `command`, `exit_code`, `duration_ms`, `strategy`, `user_override` |

For `chat.thread_worktree_pr_failed`, `phase` is the exact enum `push | api`: use `push` for git push failure and `api` for PR API failure. The three pre-merge test events are `chat.thread_worktree_pre_merge_test_started`, `chat.thread_worktree_pre_merge_test_passed`, and `chat.thread_worktree_pre_merge_test_failed`; the ADDITIVE family shorthand `chat.thread_worktree_pre_merge_test_started/passed/failed` expands only to those three event types. Projectors store these events with the same canonical envelope as other chat events, and safe-point creation records for worktree-bound execution include worktree snapshot fields (`worktree_id`, `worktree_path`, `branch_name`, `HEAD_sha`) before mutation-capable merge or test operations continue.

`run.background_enqueued` remains part of the existing run-event family and may carry optional `worktree_path` and `branch_name` fields when background work is enqueued from a bound thread. Consumers treat absent fields as main-project context rather than inventing worktree context.

---

## 3. Implementation checklist
- [ ] **Resolve app data root** and create `storage/seglog`, `storage/redb`, `storage/jsonl`, `storage/tantivy`.
- [ ] **Implement seglog writer:** envelope format (ts, seq, type, payload); rotation by size or day; flush on append.
- [ ] **Define event type schemas** for `chat.message`, `chat.thread_created`, `run.started`, `run.completed`, `usage.event`, `tool.invoked` (include optional `success`, `error`, `thread_id` per Plans/Tools.md §8.0), optional `tool.denied`, runtime checkpoint-marker events, and any editor lifecycle events per FileManager.md.
- [ ] **Implement redb schema + migrations:** namespaces (settings, sessions, runs, checkpoints, editor, rollups, review_rules); key patterns as in §2.3; migration runner and version bump.
- [ ] **Implement projector: seglog -> JSONL mirror** (tail, checkpoint, write mirror).
- [ ] **Implement projector: seglog -> Tantivy** (chat index; optional docs/logs); incremental index updates; checkpoint.
- [ ] **Persist projector checkpoints** in redb under `checkpoints` namespace.
- [ ] **Emit runtime checkpoint-marker events:** before mutation-capable execution resumes, before safe-point restore continues, and when recovery resumes from a stored runtime checkpoint; persist the marker lineage needed for replay.
- [ ] **Implement analytics scan:** scan seglog (or JSONL) for usage/tool/run events; compute 5h/7d, tool latency, and **tool_usage** (per-tool count, p50/p95, error_count) rollups; write to redb `rollups` (including `tool_usage.{window}` per Plans/Tools.md §8.4); store scan checkpoint.
- [ ] **Wire chat persistence:** thread list and thread content write to seglog; read from redb (session metadata) and seglog or redb snapshots for full thread load (per assistant-chat-design.md).
- [ ] **Wire editor state:** open tabs, active tab, scroll/cursor per FileManager.md §2.9 into redb `editor` namespace.
- [ ] **Wire Usage/dashboard:** read 5h/7d and rollups from redb; trigger analytics scan on interval or when Usage view opens (per usage-feature.md).
- [ ] **Emit usage.event with thread_id and parent lineage:** When recording usage for Assistant or Interview runs, include `thread_id`, `parent_run_id` when applicable, and the canonical attribution fields needed for per-thread and parent-rollup aggregation.
- [ ] **Emit usage.event for hidden/background model work:** title generation, summaries, compaction helpers, tool-triggered model calls, and other helper invocations still write canonical `usage.event` records even when not directly user-visible.
- [ ] **Emit run.completed with optional usage snapshot:** When a run finishes, include optional `usage` in the `run.completed` payload using the canonical usage field set (`input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`, `reasoning_tokens`, `total_tokens`, `cost_microdollars`, `provider_id`, `model_id`, `account_id?`, `billing_entity_id?`, `entitlement_class?`, `thread_id`, `parent_run_id?`, `cache_hit?`, `cache_strategy?`). The storage type for canonical persisted cost is `cost_microdollars: u64`; canonical per-request data remains `usage.event`.

## 4. Impact on chat (Assistant / Interview)

Assistant and Interview surfaces persist thread-local state, activity traces, and reviewable history, but they do not become the canonical owner of runtime identity.

Shared runtime identity projection is consumed across chat, widgets, audit, and delegated execution. Storage keeps the canonical field names and their meanings aligned.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Personas.md

### 4.1 Shared runtime identity consumption

| Field | Meaning |
|---|---|
| `requested_persona` | Persona requested for the run. |
| `effective_persona` | Persona actually in effect. |
| `requested_account_binding` | Requested account or provider binding before routing and policy resolution. |
| `operational_identity` | Stable runtime identity used for execution and audit. |
| `effective_account_label` | Human-readable effective account label shown to the user. |
| `effective_provider_identity` | Effective provider/account pair used after routing. |
| `effective_project_id` | Project identity bound to the execution context. |

Storage rules:
- these fields are additive and do not replace the existing requested/effective vocabulary
- `_id` aliases such as `requested_persona_id` and `effective_persona_id` are not canonical runtime snapshot fields
- chat and GUI surfaces consume the same stored field names rather than projecting local variants

ContractRef: Plans/Multi-Account.md#4. Data model, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules)

Required fields:
- requested_account_id
- requested_account_policy
- effective_account_id
- execution_role
- account_id
- credential_ref
- login
- auth_realm

Canonical terms and values:
- requested_account_id
- requested_account_policy
- effective_account_id
- execution_role
- account_id
- credential_ref
- login
- auth_realm

Labels:
- requested account
- operational identity

Behavioral rules:
- Requested/effective identity must survive in storage snapshots.
- GitHub durable identity uses stable internal account keys while login remains display metadata.

Permission carry-through:
- permission snapshots and usage surfaces must preserve `effective_account_id` and `execution_role`
- Web-facing runtime records use the shared runtime snapshot vocabulary for `/web`, search, extract, research, crawl, and map operations. `/history/detail` inspectors read frozen requested/effective identity snapshots rather than current provider settings, and any provider-internal recommendation about provider settings row structure, provider ordering, `/algorithm`, or account-vs-API-key grouping remains adapter-layer provisional unless restated through the canonical identity-model.
- Provider/runtime selection preserves no-silent-cross-fallback behavior: account resolution happens before dispatch, capability-based routing may select from an execution-role-aware account-pool, and auth surfaces must not hide provider-local retries or fallback loops behind generic success events.
- When a web operation has external scope or side effects, storage carries `execution_role`, `operational_identity`, `/account/role` disclosure context, requested/effective provider and model fields, and projection freshness/health so UI history can explain honored, skipped, clamped, or changed runtime choices.
### 4.2 Question and clarification state

Question and questionnaire persistence stores thread-scoped draft state, answer state, and final submission state as bounded structured data only, without inventing chat-local aliases. Canonical status values are `answered | submitted | dismissed | timed_out | unavailable`; `draft_value`, `response_kind`, and `validation_state` persist with the question item so reloads can resume a partially answered `/questionnaire` flow.

Shared question-card persistence covers single-question and multi-question flows with explicit `draft`, `/draft`, `incomplete`, `ready_to_submit`, `submitted`, and `paused` states. Composer controls may expose `/send` and `/resend`, but storage records only the state transition and active-run linkage needed to rewind later work, pause follow, or restore jump-to-latest context.

- answered | submitted | dismissed | timed_out | unavailable
- thread-scoped questionnaire draft state
- bounded structured data only
- /questionnaire


This section consumes the linked owner contract and stays aligned with it.

Core rules:
- Question schema canonical names and enums are locked, including QuestionItem fields, canonical freeform and multi-select field names, and answer source metadata.

Labels and values:
- questionnaire
- single_question
- unavailable
- dismissed

Rules:
- question_id
- question
- allow_freeform
- multi_select
- default_values?: string[]
- draft_value?: string
- response_kind
- validation_state
### 4.3 Plan and TODO state

This section defines the canonical contract for this surface.

Core rules:
- Plan and Deep Plan must both project to a normalized TODO list, with a named Q&A loop before Deep Plan execution and a locked TODO item schema/status set.
- Plan/TODO persistence is locked to explicit revision states, structural-edit gating after approval, bounded revision history, and emission of `chat.plan_todo_updated` for durable TODO mutations.
- TODO tool behavior is locked so todowrite and todoread use the normalized TODO schema, todowrite is not blanket auto-denied in ask/plan mode, and Deep Plan edits must resync the TODO projection before execution.
- `chat.plan_todo_updated` must have an explicit owner-contract definition for durable normalized TODO mutation, and `todoread` must not survive as a `source_surface` mutation source.

Fields:
- Q&A loop
- todo_id
- title
- summary
- status
- dependencies[]
- order_index
- owner_hint
- verification_hint
- notes
- pending | in_progress | completed | blocked | skipped
- superseded (plan-level only)
- draft
- approved
- executing
- completed
- blocked
- Structural edits = adding / removing / reordering TODO items
- chat.plan_todo_updated
- todowrite
- todoread
- todowrite can create, reorder, update statuses/notes
- todoread returns current normalized list for active thread/run
- Remove `todowrite` from blanket `ask/plan` mode auto-deny
- editing Deep Plan markdown (the rich artifact) MUST update the normalized TODO projection BEFORE execution begins
- TODO structural edits preserve item-level ordering through `order_index`; plan-level supersession uses a separate superseded plan revision marker rather than adding `superseded` to the TODO item status enum.
- Legacy XV2 inline progress strings such as `Superseded TODO N/M` and `Superseded TODO 5/5` are plan-level visibility labels for superseded plans, not TODO item statuses; individual TODOs keep their last item status.
- The panel shows `verification_hint` per TODO item row; a plan-level summary is not a substitute unless a separate plan-level field is defined.
- Inline progress stays compact and must not duplicate the full checklist on every turn; examples include `Started TODO 2/5`, `Completed TODO 2/5`, `Blocked TODO 3/5`, `Skipped TODO 4/5`, and `Superseded TODO 5/5`.
- When the auto-use heuristic fires mid-conversation, storage records the resulting TODO projection as a draft or refreshed plan state and emits `chat.plan_todo_updated` before execution observes the changed list; it must not silently replace the current plan panel without a durable event.
- Durable TODO mutation events persist `chat.plan_todo_updated` with minimal payload schema `{ plan_id: string, todo_id: string, field: string, old_value: any, new_value: any, source: "agent" | "user" }`. Storage retains `plan_id`, `todo_id`, changed `field`, `old_value`, `new_value`, and mutation `source` so replay can distinguish agent edits from user edits.
- The Assistant chat plan panel remains the `/source-of-truth` for visible TODO execution state, while storage owns the durable normalized TODO projection. `/todo/tool` activity, `todoread`, `todowrite`, question cards, web activity cards, assistant runtime disclosures, and other `/consumer` surfaces all obey the same persistence boundary.
- User edits and reorder operations are pre-approval structural changes. After execution begins, reorder or status corrections create a new TODO revision event instead of mutating the approved plan in place.
ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3 Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events

Labels and values:
- Plan
- Deep Plan

### 4.4 Activity transparency payloads

Activity transparency payloads carry canonical runtime bridge fields and receipt refs used across audit, artifacts, and usage surfaces.

ContractRef: Plans/Tools.md#8.0 Event payloads (seglog), Plans/Runtime_Artifacts_Panel.md#Cross-Surface Operation Receipt Linkage Addendum (2026-03-12)

Storage carry-through rules:
- Storage is the owner contract for blocked/denied payload persistence, including `blocked_reason_code`, `allowed_action_ids[]`, approval scope linkage, and immutable historical snapshots for retried attempts.
- Adapter-selection payloads persist requested/effective adapter identity, `adapter_selection_reason`, and subordinate provider bridge refs without letting chat, GUI, or web-tool consumers invent local variants.
- Long-running activity transparency persists `progress_event` payloads so chat, GUI, replay, and audit views can reconstruct operation phase, detail text, completed/total counts, elapsed timing, estimated remaining time, cancellation, and partial-result state without scraping rendered cards.
- Question/TODO/runtime event fields stay aligned with `### 4.2`, `### 4.3`, and this `### 4.4` section; source-route lineage `/TODO/runtime`, question state, TODO state, runtime receipts, and activity payloads must be carried through storage rather than copied as stale consumer-only variants; stale variants are retired in transfer metadata rather than copied into storage canon.
- Command child-run storage consumes the command owner spans historically cited as `### 4.2 Command execution model` and `### 4.3 Persona selection`: resolved command execution mode, requested/effective Persona, child/subagent overlay inheritance, and narrowed permission/capability state persist as storage facts instead of being inferred from command text after the run.
- Obligation carry-through for this storage owner span preserves `obl-021, obl-040, obl-059`, `obl-021`, `obl-040`, `obl-059`, `obl-060`, `obl-035`, `obl-041`, `obl-043`, `obl-056`, `obl-067`, and `obl-068`.
- The stale blocked-action aliases `unblock_action_ids` and `unblock_action_ids[]` are not canonical storage fields; storage persists `allowed_action_ids[]` and uses command/action records to describe the user-visible recovery action.
- Long-running progress payloads persist `cancelled: true` when cancellation is the terminal state, alongside `progress_event`, `pages_completed`, `pages_total`, `elapsed_ms`, `estimated_remaining_ms`, and any partial-result refs.
- Question `/questionnaire` session state persistence and TODO schema persistence stay under this storage family so web tools can reference them without redefining questionnaire or TODO records locally.
- Approval/HITL storage payloads preserve the approval ladder choice as `once/session/always/deny` with explicit `source` and `layer` fields, while permission snapshots remain immutable and frozen at attempt start.
- Rollback lineage, Persona/runtime snapshots, and long-running/watch-mode activity are persisted as the same operation-card model used for ordinary lifecycle-bearing activity. Watch-mode and long-running commands do not create a separate background-card type.
- Blocked-action persistence records the direct-recovery-action choice, approval-card scope, and cross-link targets that let GUI, chat, and `/audit/projectors` reopen the same recovery context. Chat audit entries may be `/collapsible`, but the durable event still points to the canonical PTY, Open in Terminal handoff, log/audit projector state, and same-session recovery target.
- Terminal command storage treats agent terminal commands as first-class permissioned activity: sandbox state, approval decision, `/allowlist` source, terminal_session_id, command block, and Open in Terminal / Show Terminal handoff refs persist with the same immutable attempt snapshot instead of living only in chat UI. `UI_Command_Catalog.md` command labels map distinctly: `Open in Terminal` uses `cmd.terminal.open`, `Show Terminal` uses `cmd.terminal.show`, and neither implies `cmd.terminal.new_tab`.
- Subagent task records carry subagent-default behavior as product state: aggressive-by-default task launches, blocked/failed outcomes, and permission denial recovery are visible in history without letting a child agent own the parent thread's durable storage.

**web-operation inline vs ref/blob split**

Inline activity payload fields carry short previews, counts, enum-like routing fields, and error codes. Ref/blob payloads carry extracted page bodies, research synthesis, full source sets, crawl inventories, and map graph payloads.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions

Web-operation ref/blob storage uses `blob-ref` naming conventions for large payloads, registers per-tool `payload.meta` child fields for replay and audit joins, and binds cache storage to the web content cache structure plus the declared `TTL` retention table.

Concrete web-operation storage registers the `payload.meta` child fields used by replay and audit without duplicating full result bodies. Common inline fields include `web_operation`, `web_input_preview`, `support_tier`, `execution_path`, `requested_adapter_id?`, `effective_adapter_id?`, `adapter_selection_reason?`, `projection_freshness?`, `projection_health?`, `provider_fallback_occurred`, `provider_fallback_summary?`, `source_count?`, `sources_ref?`, `result_quality_hint?`, `warnings_count?`, and `error_code?`. Operation child fields include `query_preview`, `/candidate`, and `results_count` for `websearch`; `url`, `/url/task`, `content_format?`, and `content_length_hint?` for `webextract`; `task_preview`, `/what`, `sources_used_count?`, and `answer_summary_ref?` for `webresearch`; `root_url`, `pages_visited_count?`, `pages_returned_count?`, `depth_limit?`, `max_pages?`, and `max_depth?` for `webcrawl`; and `root_url`, `nodes_count?`, `edges_count?`, `max_pages?`, and `max_depth?` for `webmap`.

Web activity storage also preserves the web-operation `execution_path?: string` field when present so replay can distinguish `provider_search_native`, `provider_extract_native`, `pm_search_plus_site_reader`, `pm_site_reader`, `provider_firecrawl_scrape`, `pm_fetch_fallback`, `provider_firecrawl_agent`, and `pm_research_composed` routes without reading display labels.

Web-operation storage records rate-limit/outage fallback in `provider_fallback_summary?` and persists the same-operation fallback chain shown in the chat activity label so replay, history, and audit logs agree on the route actually used.

Compact web activity cards may display provider-named labels such as `Searching Web` or `Extracting Site`, but persisted history keeps `/model/account-policy` runtime snapshot fields separate from web-specific child fields so result cards, history rows, and audit logs do not fork runtime identity names.

**activity payload**

| Field | Requirement |
| --- | --- |
| `node_id` | Runtime node identity for the emitted activity payload. |
| `attempt_id` | Canonical local execution anchor for the activity record. |
| `lane_id` | Lane identity associated with the activity payload. |
| `package_id` | Package identity associated with the activity payload. |
| `execution_role` | Effective execution-role disclosure for the activity payload. |
| `effective_account_id` | Effective account identity carried into the activity payload. |
| `operational_identity` | Stable runtime identity for audit and joins. |
| `provider_attempt_ref` | Provider-side bridge reference that remains subordinate to `attempt_id`. |
| `usage_event_ref` | Usage-side reference for accounting and evidence joins. |
| `detail_ref` | Inspection reference for drilldown payloads. |
| `report_ref` | Inspection reference for report payloads. |
| `web_input` | Structured web-operation input object for routing, audit, replay, and provenance joins; this is not a preview string. |
| `result_quality_hint` | Web output quality hint with exact values `search_snippets_only`, `extracted_pages`, `site_reader_pages`, and `research_synthesis`; storage preserves it for replay and audit without deriving it from display labels. |
| `provenance_badge` | Web provenance display/join badge using canonical underscore values `site_reader`, `search_snippet`, `site_extract`, `research_synthesis`, `crawl_result`, and `map_result`; `provider_scrape` is persisted only with the proposed-extension caveat from `Plans/Contracts_V0.md`. |

**receipt refs** remain inspection and provenance links rather than route/open surrogates.

Labels:
- activity payload
- bridge fields

Behavioral rules:
- Inspection refs remain inspection/provenance refs; route/open contracts remain route/open contracts.
- Bridge-field precedence must be explicit rather than inferred.

Permission carry-through:
- effective actor and account identity must survive into activity payloads
### 4.5 Inline visualizer persistence

Inline visualizer persistence stores only PM-managed source, metadata, and PM-owned outputs.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

Persistence rules:
- persisted fields include source fragment, title, type/kind, version, and PM-managed output or draft values
- Inline visualizer persistence stores the source fragment as an `HTML/JS/CSS` string, including richer `/JS` visuals, plus render config such as width, height, `/design` theme tokens, `/auto-height` constraints, and bridge metadata for the sandboxed `visual-module` card.
- Bridge metadata records only approved host-mediated capabilities such as the `open-link` bridge and local `in-module` visual state refs; arbitrary bridge calls, direct DOM reach-through, and client heap state are not durable storage.
- Question-flow embedded visuals persist explicit PM-managed draft-state outputs instead of generic `send-message` bridge payloads, so reloads resume the question draft lifecycle without converting draft answers into chat messages.
- `/interactive` visual modules may record bundled `/scripts` or third-party library refs only when the supported visual runtime has version-pinned, integrity-recorded, and policy-allowed them as part of the visual source metadata.
- Rendered output references may include screenshot or `/snapshot` fallback evidence for scroll-back; on thread reload/export review, PM re-renders from the persisted source fragment, title/type metadata, render config, and PM-managed state outputs, and uses the screenshot fallback only when re-render is impractical.
- arbitrary JS heap state is not persisted
- replay or reload re-renders from the persisted source plus metadata
- visible fallback and error state are persisted as PM-owned display state, not as arbitrary client script state
## 5. Gaps and how we address them


The remaining persistence gaps for the rewrite shell are addressed by explicit owner-aligned state instead of feature-local ad hoc blobs.

### 5.1 Unsaved editor recovery is required, not optional

Unsaved editor recovery is a live shared-buffer storage contract, not implementation-order housekeeping. The `/checklist` may track delivery work, but it must not downgrade recover-unsaved to `/later`: recovery begins when the first dirty buffer state is captured, `/ends` only after save, discard, or explicit recovery resolution, and multi-view `/editor` surfaces share the same recovery record, `/restore` target, and `/redo` lineage rather than creating per-view recovery branches.


Rules:
- recover-unsaved is required MVP behavior for local and remote-backed buffers
- recovery snapshots store local buffer state, capture metadata, host/path identity, and write availability at capture time
- remote-backed recovery banners must say `Recovered local edits — remote destination not yet synchronized`
- save success is only claimed after the effective destination confirms the write

Implementation spec:
- key: `editor_state.v1:{project_id}:{file_path_hash}`
- stores: cursor position, scroll offset, selection ranges, undo stack reference, and unsaved changes flag
- recovery trigger: on session restore, reload each open editor's state before restoring focus
- conflict handling: if the file changed on disk since the last save, show a diff and let the user choose how to resolve the mismatch

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md

### 5.2 Requested vs effective runtime state must remain visible


The persistence model stores enough context to reconstruct effective behavior honestly after restart.

Required stored distinctions:
- requested vs effective browser runtime/capabilities
- requested vs effective LSP enablement and attached-server set
- freshness vs health vs write availability for remote-backed projections
- restore outcome for historical Search, LSP, browser, and editor recovery surfaces

Implementation spec:
- key patterns: `{resource_type}_requested.v1:{scope}:{id}` and `{resource_type}_effective.v1:{scope}:{id}`
- requested state is what the user or system asked for; effective state is what actually applies after resolution
- projection freshness is persisted as `current`, `refreshing`, or `stale`
- `current` means just resolved, `refreshing` means re-resolution is in progress, and `stale` means the projection needs refresh before it should be treated as current

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md

### 5.3 Search and Source Control keep separate projection state

Rules:
- Search state stores text query intent and query snapshots
- Source Control state stores repo projections, compare origins, and review context
- diff-local search does not get persisted as project Search state
- editor markers consume Source Control/LSP projections but do not become a substitute owner

Implementation spec:
- keys: `search_projection.v1:{project_id}` and `sc_projection.v1:{project_id}`
- Search projection stores last query, results, filter state, and scope
- Source Control projection stores branch, diff state, staged files, and commit message draft
- editor markers consume these projections but do not own them

Source Control review and conflict persistence:
- `sc_projection.v1:{project_id}` stores the last compare target, left/right compare targets, review filters, ignore-whitespace, file filter, collapse-unchanged, generated-file visibility, review context, and local review-comments/notes state for `cmd.source_control.open_review`, `cmd.source_control.review.open/swap/filter`, `cmd.source_control.set_compare_target`, and `cmd.source_control.toggle_generated_filter`
- stale compare targets are retained as stale-target references only long enough to explain the downgrade and offer alternate pivots; replacement baselines are written as new compare target state
- Conflict assistant persistence stores per-project conflict presentation mode, open external merge tool preference, and the auto-open first conflicted file toggle
- `cmd.source_control.open_conflict`, `cmd.source_control.open_merge_editor`, `cmd.source_control.resolve_conflict_side`, and `cmd.source_control.mark_conflict_resolved` record resolution events and blocked-state handoff outcomes, not conflict content

GitHub Actions to-code correlation persistence:
- `github_actions.project_state.{project_id}` and receipt projections store last-opened run/job/step focus, `/job/step` log focus, preferred diff target, auto-open failing file hints, show heuristic matches toggle, correlation confidence threshold, branch-diff preference, and auto-open related worktree preference
- workflow run/job/step receipts join workflow run ids to commit range, changed files, branch refs, worktree refs, failing-step metadata, candidate related diffs, and candidate related worktrees for `cmd.github.actions.open_run`, `cmd.github.actions.open_job`, `cmd.github.actions.open_step_logs`, `cmd.github.actions.open_related_diff`, and `cmd.github.actions.open_related_worktree`
- log-to-file correlation candidates remain evidence with confidence and uncertainty labels; they do not become canonical source truth unless a stronger owner record confirms the mapping

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md


### 5.4 Host-aware LSP persistence and restart behavior
Rules:
- LSP lifecycle and restart budgets are persisted by host-aware session key
- restart/reconnect preserves enough state to disclose whether a projection is current, refreshing, stale, degraded, or unavailable
- remote-mode projects never restore into a silent local fallback path
- On crash, `/transport` loss, or `/sync-loss` restart, PM recreates the host-aware LSP session and replays all currently attached documents for that session/root in deterministic URI order.
- Automatic restart uses the persisted restart budget and backoff state; after the bounded crash budget is exhausted, the session remains `Degraded` until user retry, and a user-initiated restart resets the budget/backoff counters.
- Each host-aware LSP session keeps a bounded protocol/state trace buffer for operational/debug inspection only, not canonical app history; the surfaced trace fields include session key, root, current state, last error, restart attempt/backoff, and a recent protocol trace reveal action.

Implementation spec:
- key: `lsp_server_state.v1:{host_id}:{server_id}:{root_hash}`
- stores: server config, capabilities snapshot, last known status, and restart count
- recovery path: on session restore, restart LSP servers using the persisted config
- persisted restart counts survive reconnects so budget enforcement and degraded-state disclosure remain stable after restart

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md

## 6. Potential problems and solutions

| Problem | Solution |
|---------|----------|
| **seglog corruption or partial write** | Append-only with flush and last-complete-record recovery. CRC32 per record is mandatory; validate on every read; corrupt record -> skip + recovery event. |
| **redb corruption** | Restore from backup or rebuild projections from canonical seglog. |
| **Projector falls behind** | Buffer events in bounded batches and checkpoint only after a successful commit. |
| **Analytics scan blocks UI** | Run analytics scans in the background; UI shows last committed rollup plus freshness state. |
| **Disk full / storage I/O** | Surface a user-facing error, stop unsafe writes, and retry only per storage I/O policy. |
| **Migration failure** | Leave previous version intact; do not open a half-migrated store. |
| **Multiple app instances** | Acquire exclusive flock on the active durable-store `lock-path` / `pm.lock` derived from the selected logical storage root or safe-local fallback before any writes. If the lock is held, enter `/read-only` viewer mode and notify the user. |

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

| Problem | Solution |
|---------|----------|
| **Checkpoint lost** | Rebuild from seglog / last retained segment. |
| **API contract (caller handling errors)** | `append()` / redb write operations return structured `Result`; no silent swallow. |
| **Projector panic or crash** | Do not advance checkpoint; restart from last good checkpoint. |
| **File record LRU eviction** | Cap in-memory file records at 10,000 entries and rebuild lazily on access. |
| **Boot-time janitor** | After active durable-store lock acquisition, sweep stale `.tmp.*` artifacts, validate lock freshness, and emit a `storage.boot_recovery` event if cleanup was required. |
| **DB / redb shutdown hygiene** | Close the DB handle in the shutdown sequence before process exit. |

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileSafe.md

## 7. Enhancements

- **Compaction:** Specified in §2.2.1. Optional for MVP, but when enabled it MUST preserve `seq`, exclude the active segment, and keep replay/projector correctness intact.
- **Backup/restore:** Scheduled backups MUST snapshot canonical stores at one shared boundary, validate checksums before restore, and rebuild disposable projections (JSONL/Tantivy) after restore rather than treating them as authoritative.
- **Export:** Export thread or run history to JSONL/JSON for user (e.g. from seglog or JSONL mirror filtered by thread_id).
- **Read replicas:** Not applicable for embedded redb; if we move to a server-backed store later, read replicas can serve dashboard/Usage reads.
- **Per-project seglog:** Specified in §2.1.2; default remains app-global.
- **Event schema registry:** Required infrastructure for payload validation and doc generation; this plan owns payload registry/workflow while `Plans/Contracts_V0.md` owns the top-level envelope.
- **Streaming projector:** Optional richer UX path; correctness still depends on committed projector state and durable checkpoints.

---

## 8. Implementation order and testing

### 8.1 Phased implementation order

- **Phase 1 -- seglog foundation**
  Build first: app data root resolution, directory creation (`storage/seglog`, `storage/redb`, `storage/jsonl`, `storage/tantivy`), and seglog writer only (envelope format, seq, flush, optional rotation by size/day). No projectors, no redb.
  **Exit criterion:** We can append events and read them back (by tailing or reading the segment file).

- **Phase 2 -- redb and schema**
  Build: redb open under app data root, schema (namespaces/tables per §2.3: settings, sessions, runs, checkpoints, editor, rollups, review_rules), key patterns, and a migrations runner (version in meta, run migrations on open).
  **Exit criterion:** We can read/write settings and checkpoints (e.g. put/get in `settings` and `checkpoints` namespaces).

- **Phase 3 -- projector: seglog → JSONL mirror**
  Build: single projector that tails seglog from a checkpoint, appends to the JSONL mirror (same envelope format), and persists its checkpoint in redb (`checkpoints` namespace).
  **Exit criterion:** Tail seglog, write mirror, resume from checkpoint after restart (no duplicate mirror lines, checkpoint advances).

- **Phase 4 -- projector: seglog → Tantivy (chat index)**
  Build: projector (or second projector) that reads seglog from checkpoint, indexes `chat.message` (and optionally `chat.thread_created`) into a Tantivy chat index (fields: thread_id, content, role, ts, message_id), and persists its checkpoint in redb.
  **Exit criterion:** Events are indexed and search returns results (e.g. by content or thread_id).

- **Phase 5 -- analytics scan and rollups**
  Build: analytics scan job (periodic or on-demand) that scans seglog (or JSONL mirror) over a time range, computes 5h/7d usage rollups, tool latency, and tool_usage (per-tool count, p50/p95, error_count per Plans/Tools.md §8.4), writes to redb `rollups` namespace, and stores a scan checkpoint.
  **Exit criterion:** 5h/7d and tool rollups are written to redb and the UI (or a test reader) can read them.

- **Phase 6 -- wire chat, editor, and Usage**
  Build: wire chat persistence (thread list and thread content to seglog; read from redb + seglog/snapshots per assistant-chat-design), editor state to redb `editor` namespace (FileManager.md §2.9), Usage/dashboard reading rollups from redb and triggering analytics scan (usage-feature.md); emit `usage.event` with `thread_id` and `run.completed` with optional usage snapshot.
  **Exit criterion:** Full flow works: create thread, send message, events in seglog; projectors update mirror and index; Usage view shows rollups; editor state persists.

**Dependencies:** seglog writer before any projector; redb open + schema + migrations (including `checkpoints` and `rollups` namespaces) before projectors and analytics scan; projectors must not start until redb is open and checkpoints namespace exists; analytics scan must not run until rollups namespace (and scan checkpoint key) exists. Projectors may start once the seglog writer is initialized (current segment may be empty). When checkpoint is missing and seglog is empty, projector starts from position 0 and has nothing to process; when checkpoint is missing and seglog has data, projector starts from the beginning of the first segment.

### 8.2 Dependency graph

- **seglog writer** before any projector (projectors read seglog).
- **redb open + schema + migrations** before projector checkpoints (checkpoints namespace must exist).
- **checkpoints namespace** before any projector runs (projectors read/write checkpoint).
- **Event type schemas** (minimal set for writer) before or with Phase 1; full set before Phase 3/4/5.
- **rollups namespace** before analytics scan writes (Phase 2 defines it; Phase 5 uses it).
- **Tantivy chat index** before chat search UX (Phase 4 before Phase 6 chat wiring).
- **Chat/editor/Usage wiring** after Phase 1-5 storage primitives exist.

### 8.3 Startup and shutdown

**Startup order:**
1. Resolve the app data root (environment override optional).
2. Probe the selected storage root for durable-store safety, including `unsafe-filesystem` / NFS posture, and establish any required safe local fallback before durable stores are opened.
3. Derive the active durable-store root and its `lock-path`, then acquire exclusive `pm.lock` ownership before any writer opens durable state. If the lock is already held, PM enters `/read-only` viewer mode and stops before writer startup.
4. Create `storage/seglog`, `storage/redb`, `storage/jsonl`, `storage/tantivy` if missing.
5. Open redb and run migrations.
6. Open the seglog writer.
7. Start projectors that tail seglog and write JSONL/Tantivy/checkpoints.
8. Start optional analytics schedulers and per-project index services.

If durable-store fallback is active, PM routes lock files, durable DB state, and session snapshot metadata to the safe local fallback while preserving the selected logical storage root for lineage and user-visible diagnostics.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md

**Regex-index startup recovery:** After a project context is known and before the first indexed `grep` or Search-panel regex query for that project:
1. Scan the relevant `regex_index/` directory.
2. Pick the highest valid `gen-{N}/` candidate.
3. Validate `index_meta.json`, per-file xxh3 checksums, and `lookup.bin` sizing / offsets before mmap.
4. For Git-backed caches, verify `anchor_sha` is still reachable (`git cat-file -t {anchor_sha}`). Unreachable anchors invalidate the snapshot and trigger rebuild from current HEAD.
5. If a valid snapshot exists, create `IndexSnapshot`, mmap `lookup.bin`, and mark the project `ready`.
6. If no valid snapshot exists, mark the project `no_index` and transparently serve raw ripgrep until the background full build completes.
7. On checksum or metadata mismatch, delete the corrupt generation directory and trigger a full rebuild; fall back to raw ripgrep until the rebuilt snapshot is ready. Delete orphaned or partial generations opportunistically during this recovery path.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Architecture_Invariants.md

**Shutdown:**
1. Signal projectors to stop and flush outputs.
2. Cancel in-flight regex builds and wait briefly for partial-generation cleanup.
3. Flush and close the seglog writer.
4. Close redb.
5. Release the active durable-store lock after the final writer flush completes.
6. Leave the last valid regex snapshot and any reusable remote cache state in place; ordinary shutdown does not evict caches.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

**Concurrency and single-writer rules:** Seglog remains a single-writer stream. Regex-index publication is likewise single-writer per project: one build path publishes snapshots, while readers use lock-free `ArcSwap` snapshots and never observe partially-written generations.

Multi-instance prompt/session state is not allowed to degrade into last-write-wins flat files. Any compatibility state such as `kv.json` or `prompt-history.jsonl` must either be migrated into the canonical durable store or protected by atomic write plus file-locking semantics with clear session/run lineage; concurrent instances must never overwrite prompt-history or key-value state without conflict evidence.

ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

### 8.4 First run / empty state


- **Dirs:** If app data root exists but `storage/*` dirs are missing, create them (§2.1).
- **Seglog:** If `storage/seglog/` is empty, writer creates the first segment on first append; projectors reading checkpoint "none" start from offset 0 and see no events until the first append.
- **redb:** On first open, if no `schema_version` (or missing `meta` namespace), run initial migration that creates all namespaces and sets `schema_version` to 1. redb is created on first open if the file does not exist (standard redb behavior).
- **Projectors:** When checkpoint is missing, treat as "start from beginning of seglog" (first segment, offset 0); when seglog is empty, no work.
**Analytics Scan When Checkpoint Missing (Resolved):**

When the analytics scan checkpoint is missing (first run or after reset):
- Scan from **seq 0** (beginning of seglog).
- Rationale: ensures no data is missed. The seglog is append-only, so a full scan is safe and idempotent.
- For large seglogs, the scan is paginated: process **1000 events per batch**, yielding between batches to avoid blocking the event loop.
- After the scan completes, write the checkpoint to redb (`analytics:scan_checkpoint` → last processed seq).
- Subsequent runs resume from the checkpoint.
- Config: `analytics.scan_batch_size`, default `1000`.

### 8.5 Testing strategy

- **Phase 1:** Unit: app data root resolution; dir creation idempotent; seglog writer append and read-back/tail; rotation. Integration: append N events, close writer, open for read, assert all N lines and envelope fields.
- **Phase 2:** Unit: redb open/create; put/get in each namespace; migration runner. Integration: run migrations from version 0 to current; assert all namespaces usable.
- **Phase 3:** Unit: checkpoint read/write; tail logic; mirror append. Integration: append N events; run JSONL projector; assert mirror has N lines; restart projector, assert no duplicates and checkpoint advanced.
- **Phase 4:** Unit: Tantivy index add document and search by content and thread_id. Integration: append chat.message events; run chat projector; assert search results.
- **Phase 5:** Unit: rollup computation (usage by platform, tool percentiles). Integration: fixture seglog with known usage.event and tool.invoked; run analytics scan; assert rollup values in redb.
- **Phase 6:** Integration: end-to-end thread + message + projectors + search + Usage + editor state.

### 8.6 Acceptance criteria per phase

| Phase | Acceptance criteria |
|-------|----------------------|
| **1** | App data root resolved and storage dirs exist; seglog writer appends envelope-format events and they can be read back in order. |
| **2** | redb opens with current schema; migrations run on version change; settings and checkpoints can be written and read. |
| **3** | JSONL projector tails seglog, appends to mirror, and resumes from checkpoint after restart without duplicating or skipping events. |
| **4** | Chat projector indexes seglog events into Tantivy; search by content and thread_id returns expected results. |
| **5** | Analytics scan writes 5h/7d and tool_usage rollups to redb; a reader (e.g. UI or test) can read them. |
| **6** | Chat, editor, and Usage use seglog and redb; full flow (thread + message + projectors + search + Usage + editor state) works end-to-end. |

---

## Version history

| Date | Change |
|------|--------|
| 2026-02-20 | Initial checklist. |
| 2026-02-22 | Validation reference migrated from file-specific citation to verifier/evidence-based validation contracts. |
| 2026-02-22 (current) | Implementation-ready pass: §8 (phased implementation order, dependencies, startup/shutdown, first-run, testing, acceptance criteria); definitions (project_id, path_hash, window); extended event types (HITL, interview, run tier/iteration/verification, queue, plan_todo, thread archive/delete, subagent, editor lifecycle); extended redb keys (queue, plan_todo, thread_usage, file_tree_expanded, layout, recent_files, run/interview/hitl checkpoints) and value encoding; §5 gaps (implementation order, projectors when seglog empty); §6 problems (API contract, projector panic, project/thread lifecycle, queue/HITL restore, interview vs thread, retention, editor keys, thread_checkpoint cleanup, multi-instance HITL). |
| 2026-02-20 | Fleshed out: definitions, §2 how we do it (locations, seglog format, redb schema, projectors, analytics), §5 gaps, §6 problems, §7 enhancements; expanded checklist. |

## Scheduler Runtime, Safe-Point, and Remediation Storage Addendum (2026-03-08)


Required storage support for the runtime scheduler feature cluster.

### Event ingestion

The storage layer MUST ingest and project the following canonical events (using canonical names, not legacy aliases):

**Scheduler events:**
- `scheduler.pass` (canonical; legacy alias: `run.scheduler_analysis`)
- `node.blocked` (canonical; legacy alias: `run.node_blocked`)
- `node.unblocked` (canonical; legacy alias: `run.node_unblocked`)

**Safe-point events:**
- `safe_point.created`
- `safe_point.restored`

**Remediation events:**
- `remediation.spawned` (canonical; legacy alias: `run.remediation_started`)
- `remediation.resolved` (canonical; legacy alias: `run.remediation_completed`)

> **Migration rule:** Storage consumers MUST accept both canonical and legacy event names during migration but MUST normalize to canonical names before writing projections. New storage code MUST NOT emit legacy names.

### redb key projections

```
scheduler_pass.{run_id}.{scheduler_pass_id}
blocked_projection.{run_id}.{node_id}.{blocked_sequence}
remediation.{run_id}.{remediation_root_id}
safe_point.sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}
```

Canonical note:
- `blocked_projection.{run_id}.{node_id}.{blocked_sequence}` is superseded by canonical `blocked_projection.v1:{project_id}:{node_id}`
- canonical blocked-projection values include `{ blocked_reason_code, blocked_at, blocked_family, approval_scope_key?, allowed_action_ids[] }`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md
## Runtime Attempt / Safe Point / Queue Analysis Storage Addendum (2026-03-09)


Storage and projections MUST persist the scheduler and recovery model without SQLite.

### Projection rules
- run-graph and orchestrator projections MUST resolve by `attempt_id` rather than only by `node_id`
- the latest blocked state must remain inspectable after app restart
- `ready_since_utc` must survive projection refresh while the node remains continuously ready
- stale attempts from an older `replan_generation` must remain queryable for history but may not be resumed as active work

### Persistence safety rules
- safe-point metadata must persist before mutation-capable attempt execution begins
- local-work-preserved blocked outcomes must be represented explicitly, not inferred from missing failure rows
- queue-analysis records are append-only observability data; later projections may summarize them, but the canonical pass history must remain reconstructable
## Runtime Attempt / Safe Point / Queue Analysis Canonical Alignment (2026-03-09)


Storage and projections MUST persist the scheduler and recovery model without ambiguity.

### Counter semantics


- `attempt_count` is the ground-truth count of started attempts for a node in a run, including the first attempt.
- `retry_count` is derived display data only: `max(attempt_count - 1, 0)`.
- sub-counter decomposition is additive attribution, not a replacement for `attempt_count`: `attempt_count = initial_attempts + retry_attempts + resume_attempts + remediation_retry_attempts`.
- permission, auth, approval, safe-point, or revalidation changes produce new attempt snapshots/records; they do not mutate prior attempt counters in place.
- projections that need lineage MUST join through `attempt_id` and the immutable attempt snapshot, not infer history from `retry_count` alone.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md

- run-graph and orchestrator projections MUST resolve by `attempt_id`, not only `node_id`
- blocked projections remain historical after resolution; unblocking does not overwrite prior blocked rows
- `ready_since_utc` survives projection refresh only while the node remains continuously ready
- attempts from older generations remain queryable but are labeled stale and are never resumable

ContractRef: Plans/Widget_System.md#2. Hostability and data contracts, Plans/FinalGUISpec.md#10.6 Blocked and recovery surfaces

Required fields:
- projection_freshness
- projection_health
- last_projected_at_utc
- projector_lag
- degraded_reason_code
- fallback_policy

Canonical terms and values:
- projection_freshness
- projection_health
- last_projected_at_utc
- projector_lag
- degraded_reason_code
- fallback_policy
- runtime_artifact.*

Labels:
- projection freshness
- projection health
- fallback

Behavioral rules:
- Projection freshness is not the same thing as action authority.
- Projection-backed surfaces must degrade to direct-record views when trust drops.
- Runtime-artifact projections must be rebuildable from canonical seglog events.

Permission carry-through:
- action gating must respect projection trust before surfacing mutation actions
### Snapshot refresh rules
- permission/auth/approval/replan resolution creates a new attempt snapshot; old attempt snapshots remain immutable
- safe-point restore does not mutate the originating attempt record in place; it leads to a new attempt record tied back by lineage
## Runtime Recovery Persistence and Restart Canonical Alignment (2026-03-09)


### Restart and stale history
Required fields:
- `historical`
- `archived`
- `removed`
- `projection_freshness`
- `projection_health`
- `historical_lineage_refs[]`
- `worktree_id`
- `lane_id`
- `last_seen_at_utc`
- `owner_run_id`
- `owner_attempt_id`

Rules:
- Restart and cleanup must keep `historical`, `archived`, and `removed` distinct.
- Missing live worktrees or lanes remain historically inspectable instead of disappearing.
- Projection trust remains explicit through `projection_freshness` and `projection_health`.
## Permission Snapshot Storage and Safe-Point Namespace Addendum


### Permission snapshot storage

`Plans/storage-plan.md` owns only the durable storage binding for permission snapshots. `Plans/Permissions_System.md` owns the snapshot schema, enums, approval-surface expectations, and blocked-action semantics.

**Canonical storage binding:**
- durable family: `permission_snapshot_record.v1:{project_id}:{snapshot_id}`
- immutable link from attempt state: `attempt_record.permission_snapshot_id`
- projector/query fields MAY cache `blocked_family`, `approval_scope_key`, `approval_target_ref`, and `revalidation_required` for indexing, but they MUST NOT redefine the nested snapshot schema locally

**Rules:**
1. The snapshot record is written before the corresponding attempt becomes durable/dispatchable.
2. The snapshot payload is immutable after creation. Later approval or policy changes create a new snapshot and a new attempt lineage entry; they do not rewrite the old one.
3. Snapshot retention follows attempt lineage and any stronger preservation/hold rule.
4. storage-plan MUST reference the owner-doc schema instead of embedding a competing schema copy.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md

### Safe-point vs restore-point namespace separation

Safe points and restore points use distinct storage key prefixes:

| Type | Key prefix | Scope |
|------|-----------|-------|
| Safe point | `sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}` | Runtime-internal, scoped to run/node/attempt |
| Restore point | `rp:{project_id}:{restore_point_id}` | User-facing, scoped to project |

These namespaces MUST NOT overlap. Queries for safe points MUST use the `sp:` prefix; queries for restore points MUST use the `rp:` prefix.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/newfeatures.md, ContractName:Plans/Contracts_V0.md

## Assistant Worktree Binding Storage Addendum
Source Control remains the Git/worktree owner surface.

Rules:
- Storage projections reference the live `Plans/Orchestrator_Page.md#Source Control boundary` heading rather than the stale numbered anchor.
- Worktree-binding persistence remains worktree-first when it hands off to Source Control.
## 8. Web content caching persistence

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- The PM-owned web cache contract must preserve two-phase lookup, state vocabulary, and per-project cache sizing.
- Cache routing must skip read-time cache for requests with actions, may still store the post-action result, and must preserve PM-cache precedence over Firecrawl cache with diff-reuse audit states.
- Web cache persistence is per-project with a 500 MB default cache budget, per-operation TTL defaults, LRU eviction for bounded storage, stable cache key ordering, and change detection persistence for future `change_tracking` comparison.
- Each cache entry stores `cache_key: string` as the hash of `(url, formats, adapter_id)`, `url: string` as normalized `URL`, `formats_requested: string[]`, `adapter_id`, `content_hash`, `content_ref: string` as a pointer to cached content and not inline content, `metadata: { title?: string, status_code?: number, content_type?: string, content_length?: number }`, `fetched_at` as ISO time, `expires_at` as `fetched_at` plus TTL, `access_count`, and `last_accessed_at`; eviction is LRU and TTL-driven.

Fields:
- hit
- miss
- bypassed
- expired_used_for_diff
- normalized_url
- cache_key: string
- cache_key
- hash of (url, formats, adapter_id)
- formats_requested: string[]
- url
- URL
- formats_hash
- formats_requested
- adapter_id
- content_hash
- content_ref: string
- content_ref
- pointer to cached content (not inline)
- metadata
- title?
- fetched_at
- status_code
- content_type
- content_length
- expires_at
- access_count
- last_accessed_at
- 500 MB
- TTL
- LRU
- per-project
- per-operation
- cache key ordering
- change detection persistence

Rules:
- Cache lookup is adapter-agnostic and action-free at read time: before provider selection, PM checks `(url, formats_hash)` only; after adapter selection, it validates `adapter_id` and discards a hit on mismatch.
- If request includes `actions`, skip cache entirely (always fresh-execute). Actions modify page state, so cache lookup only applies to action-free requests.
- Cache STORE still applies to the final result after actions execute; the post-action content is cacheable for future action-free requests to the same normalized `URL`.
- Cache bypass: when `cache_policy.max_age_seconds: 0` or `cache_policy.store: false`, storage records `cache_state: "bypassed"` and does not serve a cached read for that operation.
- If cache is enabled and an entry exists within TTL, return the cached result with `cache_state: "hit"` and skip provider execution UNLESS the request includes `actions` or the post-selection `adapter_id` validation fails.
- PM cache takes precedence for serving cached content.
- Firecrawl cache serves as provider-side /latency optimization only.
- `cache_state: "hit" | "miss" | "bypassed" | "expired_used_for_diff"`

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/storage-plan.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### SP-002 - Storage Owner Scope And Structural Anchor Map

```yaml
plan_unit_id: SP-002
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Plans/storage-plan.md preserves storage owner routing for runtime, governance, export, concern, route, projection, artifact, and lane topics through its title and canonical owner-section anchor map."
gui_related: false
gui_classification_reason: "This unit preserves backend storage ownership and section routing rather than visual presentation."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-002 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: storage_owner_scope_anchor_map
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0001"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0002"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0003"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0004"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0005"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0006"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0007"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0008"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0009"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0010"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0011"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0012"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0013"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0014"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0015"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0016"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0017"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0018"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0019"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0020"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0021"
preserved_exact_tokens:
- "Storage plan (seglog, redb, Tantivy, projectors)"
- "Canonical owner-section requirements"
- "Owner-first canonicalization order"
- "Shared governance/runtime record envelope"
- "Export taxonomy and manifest contract"
- "Concern record family definition"
- "Focused run and historical routing contract"
- "Source Control and worktree handshake"
- "Projection trust and action gating"
- "Lane vs worktree lifecycle split"
- "Runtime attribution ownership split"
- "Artifacts index exact indexed fields"
- "Lane cleanup lineage fields"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-003 - Attempt Snapshot And GUI Disclosure Join

```yaml
plan_unit_id: SP-003
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage maps the retired Persona/Runtime snapshot payload contract into attempt and permission snapshot storage, preserving snapshot payload fields, requested/effective identity fields, and chat/GUI disclosure joins."
gui_related: true
gui_classification_reason: "This unit preserves user-visible chat/GUI disclosure joins backed by storage records."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
- "UCC-001"
unblocks: []
acceptance_criteria:
- "SP-003 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: attempt_snapshot_gui_disclosure_join
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0022"
preserved_exact_tokens:
- "5.1B Persona/Runtime Snapshot Payload Contract"
- "{ tool_name"
- "invocation_summary"
- "options }"
- "result_id"
- "requested/effective provider"
- "requested/effective model"
- "requested/effective account"
- "permission_snapshot_id"
- "account_pressure_episode"
- "requirements_quality_report_ref"
- "/chat/GUI"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/FinalGUISpec.md"
- "Plans/UI_Command_Catalog.md"
- "Plans/Contracts_V0.md"
```

### SP-004 - Command Route Normalization And Migration-Only Command Terms

```yaml
plan_unit_id: SP-004
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage keeps command records graph-local and command-family specific, normalizing wrapper payloads into route-derived target and subject fields while keeping listed command terms migration-only."
gui_related: true
gui_classification_reason: "This unit preserves user-visible command routing and surface restore behavior."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "UCC-001"
unblocks: []
acceptance_criteria:
- "SP-004 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: command_route_normalization_migration_terms
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0022"
preserved_exact_tokens:
- "cmd.search.replace_selected"
- "cmd.runtime"
- "cmd.runtime.*"
- "slash-command"
- "cmd.nav.focus_route"
- "cmd.artifacts.show_in_usage"
- "cmd.orchestrator.open_in_source_control"
- "destination_surface"
- "destination_tab"
- "object_kind"
- "object_id"
- "record_id"
- "artifact_id"
- "attempt_id"
- "lane_id"
- "worktree_id"
- "usage_event_ref"
- "filter_payload"
- "inspector_target"
- "scroll_target"
- "focus_behavior"
negative_constraints:
- "Command compatibility terms that remain migration-only must not become canonical storage families."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/UI_Command_Catalog.md"
```

### SP-005 - Runtime Recovery Record Families And Derived Compatibility

```yaml
plan_unit_id: SP-005
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage owns runtime recovery record families, blocked_sequence identity, recovery fields, operational identity, governance-record templates, and derived-only tier aliases for replayable runtime coordination."
gui_related: false
gui_classification_reason: "This unit preserves backend record identity, runtime recovery, and governance storage requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
unblocks: []
acceptance_criteria:
- "SP-005 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: runtime_recovery_record_families
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0022"
preserved_exact_tokens:
- "attempt_id?"
- "node_id?"
- "tool.invoked"
- "attempt/receipt/usage/artifact attribution packet"
- "tier_runtime_record"
- "tier_id"
- "widget.completed_prose"
- "blocked_sequence"
- "object_kind = blocked_episode"
- "recovery kind"
- "safe-point restore"
- "restart reconciliation"
- "blocked prerequisite resolution"
- "lane/worktree restore"
- "operational-identity"
- "governance-record"
- "/review/promotion/corroboration/graph-patch/recovery"
negative_constraints:
- "Runtime compatibility stays derived and must not own canonical execution-unit identity."
- "Runtime coordination/audit cannot claim both file-based canon and event-sourced canon as primary authority."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Contracts_V0.md"
```

### SP-006 - Projection Attention Export And Action-Gating Recovery Rules

```yaml
plan_unit_id: SP-006
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage recovery rules preserve projection fallback, attention/card/badge behavior, export identity, notification escalation, and action gating from canonical records instead of projection-only state."
gui_related: true
gui_classification_reason: "This unit preserves user-visible projection, attention, export, and direct-record action surfaces."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "UCC-001"
unblocks: []
acceptance_criteria:
- "SP-006 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: projection_attention_export_action_gating_rules
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0022"
preserved_exact_tokens:
- "Progress"
- "Seams"
- "project_summary.v1"
- "/blocked"
- "/config"
- "Ledger/Usage CSV/JSON"
- "trust-state"
- "projection_freshness"
- "projection_health"
- "/full-record"
- "attention center"
- "Project /card"
- "highest-severity active item plus a count"
- "direct canonical revalidation"
- "sensitive actions"
negative_constraints:
- "Project /card and badge rollups must not collapse rows into one synthetic project blocked blob."
- "Attention cards, blocked notices, and wizard surfaces must not keep card-local or notice-local activation fields as canon."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Project_Output_Artifacts.md"
```

### SP-007 - Receipt Bridge And Usage Join Contract

```yaml
plan_unit_id: SP-007
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Receipt records bridge attempts, usage, evidence, runtime artifacts, and UI pivots while lifecycle truth remains in durable record families and usage_event_ref does not become a top-level route selector."
gui_related: false
gui_classification_reason: "This unit preserves backend receipt and usage join identity rather than visual presentation."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
unblocks: []
acceptance_criteria:
- "SP-007 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: receipt_bridge_usage_join_contract
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0023"
preserved_exact_tokens:
- "orchestrator.receipt.{run_id}.{attempt_id}"
- "orchestrator.receipt"
- "attempt_record"
- "usage_record"
- "evidence_record"
- "scheduler_pass_record"
- "blocked_projection.{run_id}.{node_id}.{blocked_sequence}"
- "wizard_runtime_state"
- "project_id"
- "actor refs"
- "created_at_utc"
- "usage_event_ref"
- "usage_event_id"
- "provider_attempt_ref"
- "gap-004"
- "gap-006"
- "gap-005"
- "gap-008"
negative_constraints:
- "The receipt family is not a junk drawer."
- "Usage/artifact flows must not keep usage_event_ref as a first-class top-level route selector."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-008 - Runtime Object Family And Requested Effective Identity

```yaml
plan_unit_id: SP-008
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Runtime object family storage preserves canonical object tuples, requested/effective model/auth/account routing, operational_identity, decision and permission requested/effective identity, and legacy event names only as migration aliases."
gui_related: false
gui_classification_reason: "This unit preserves backend runtime object and identity record requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
- "PS-001"
unblocks: []
acceptance_criteria:
- "SP-008 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: runtime_object_family_requested_effective_identity
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0024"
preserved_exact_tokens:
- "runtime object families"
- "actor_role"
- "execution_role"
- "operational_identity"
- "requested-side"
- "effective-side"
- "/model/auth/account"
- "identity-contract"
- "requested-vs-effective"
- "effective-resolution"
- "run.tier_started"
- "run.tier_completed"
- "PuppetMasterEvent::*"
- "TierChanged"
- "attempt_record"
- "provider_attempt_ref"
negative_constraints:
- "Legacy tier and event names are compatibility aliases only."
- "attempt_record is the rewrite-era execution unit owner."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Permissions_System.md"
- "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
```

### SP-009 - Worktree Lane Source-Control And Project-State Boundaries

```yaml
plan_unit_id: SP-009
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage owns durable lane, worktree, source-control projection, and project-state persistence while WorktreeGitImprovement owns operational behavior, cleanup/archive/remove rules, and UI expectations."
gui_related: true
gui_classification_reason: "This unit preserves user-visible Source Control and Orchestrator state backed by storage records."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "W-001"
unblocks: []
acceptance_criteria:
- "SP-009 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: worktree_lane_source_control_project_state_boundaries
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0025"
preserved_exact_tokens:
- "worktree_id"
- "lane_id"
- "source_control.project_state.{project_id}"
- "baseline"
- "active"
- "retained"
- "suspect"
- "restoring"
- "cleanup_eligible"
- "archived"
- "historical"
- "removed"
- "live"
- "dirty"
- "conflict"
- "orphaned"
- "recovering"
- "projects:v1"
- "project_state:v1:{project_id}"
- "focused_run_id"
- "active-agents.json"
- "resume_url"
negative_constraints:
- "Project registry state stays narrow."
- "Consumer docs must not own storage records."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/WorktreeGitImprovement.md"
```

### SP-010 - Projection Trust And Concern Lifecycle Semantics

```yaml
plan_unit_id: SP-010
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Projection trust uses projection_freshness and projection_health, concern and blocked lifecycles remain family-specific, direct-record actions are storage-backed, and source-of-truth aspects stay split across seglog, redb, and JSONL exports."
gui_related: true
gui_classification_reason: "This unit preserves user-visible trust, concern, direct-record action, and fallback surfaces."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
unblocks: []
acceptance_criteria:
- "SP-010 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: projection_trust_concern_lifecycle_semantics
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0026"
preserved_exact_tokens:
- "projection_freshness"
- "projection_health"
- "current"
- "refreshing"
- "stale"
- "degraded"
- "unavailable"
- "trust-state"
- "active -> acknowledged -> resolved -> dismissed"
- "open -> addressed -> resolved"
- "attention_required"
- "blocked"
- "action-capable"
- "blocked_projection"
- "allowed_action_ids[]"
- "seglog"
- "redb"
- "JSON/JSONL"
- "/source-of-truth"
- "/current-state/read-optimized"
negative_constraints:
- "projection_freshness remains the recency axis and projection_health remains the integrity/availability axis; storage and consumers MUST NOT collapse them into a single trust field."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-011 - Account Pressure Migration Aliases And Historical Status Semantics

```yaml
plan_unit_id: SP-011
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage preserves multi-account run snapshot and attempt boundaries, durable account_pressure_episode records, subordinate migration aliases, and split time/replacement/validity historical semantics."
gui_related: false
gui_classification_reason: "This unit preserves backend account, migration, and historical status storage semantics."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
unblocks: []
acceptance_criteria:
- "SP-011 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: account_pressure_aliases_historical_semantics
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0026"
preserved_exact_tokens:
- "account_pressure_episode"
- "episode_id"
- "project_id"
- "provider_id"
- "account_id"
- "execution_role?"
- "signal_confidence"
- "pressure_kind"
- "started_at_utc"
- "updated_at_utc"
- "cooled_down"
- "active | cooled_down | resolved | invalidated"
- "HTE"
- "/visible/manual-default"
- "time/replacement/validity status"
- "time status"
- "replacement status"
- "validity status"
- "stale_historical"
- "resolved-but-historical"
negative_constraints:
- "Migration aliases stay explicit but subordinate."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Multi-Account.md"
```

### SP-012 - Artifact Identity Route Export And Forward-Only Migration

```yaml
plan_unit_id: SP-012
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage owns artifact identity, record/artifact separation, openable runtime refs, export family identity, route/search reuse, and forward-only migration from wrapper-local payloads to route-target forms."
gui_related: true
gui_classification_reason: "This unit preserves user-visible artifact, route, export, and search pivots backed by storage identity."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "UCC-001"
unblocks: []
acceptance_criteria:
- "SP-012 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: artifact_identity_route_export_forward_only_migration
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0027"
preserved_exact_tokens:
- "artifact-index records"
- "artifact_type"
- "preview_subject_id = doc:<document_id> | artifact:<artifact_id>"
- "linked_artifact_id"
- "attempt:<attempt_id>"
- "safe_point:<safe_point_id>"
- "remediation:<remediation_root_id>"
- "scheduler_pass:<scheduler_pass_id>"
- "/export/search/routing"
- "/blob/renderable"
- "Run export"
- "Ledger export"
- "Evidence export"
- "CSV"
- "JSONL"
- "route-target"
- "/routing"
negative_constraints:
- "Storage migration is prose-rule driven and forward-only."
- "New docs/producers must prefer canonical route-target forms."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Project_Output_Artifacts.md"
```

### SP-013 - Multi-Store Summary And Navigation Shell

```yaml
plan_unit_id: SP-013
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "The storage summary states the multi-store design with seglog as canonical event stream, redb for durable KV state, Tantivy for full-text search, and projectors/analytics maintaining read models; the table of contents remains navigation structure."
gui_related: false
gui_classification_reason: "This unit preserves backend storage architecture summary and document navigation rather than visual presentation."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-013 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: multi_store_summary_navigation_shell
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0028"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0029"
preserved_exact_tokens:
- "SQLite remains off the table"
- "seglog"
- "redb"
- "Tantivy"
- "Projectors"
- "JSONL mirror"
- "analytics scan jobs"
- "Implementation checklist + detailed design"
- "Table of Contents"
- "Implementation order and testing"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-014 - Promoted Shell Runtime Identity Storage

```yaml
plan_unit_id: SP-014
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage treats promoted shell/runtime IDs as first-class identities, including workspace, window, browser, preview, terminal section/tab/pane/session, dev session, branch lineage, detached scope, and subordinate command-block identity."
gui_related: true
gui_classification_reason: "This unit preserves user-visible workspace, browser, terminal, preview, and branch continuity identity."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
- "F3-001"
unblocks: []
acceptance_criteria:
- "SP-014 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: promoted_shell_runtime_identity_storage
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0030"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0031"
preserved_exact_tokens:
- "workspace_tab_id"
- "window_id"
- "browser_tab_id"
- "preview_session_id"
- "terminal_section_id"
- "terminal_tab_id"
- "terminal_pane_id"
- "terminal_session_id"
- "dev_session_id"
- "branch_id"
- "project_id"
- "raw path is not the canonical identity"
- "detached windows"
- "ephemeral automation/auth sessions"
- "command-block identity"
negative_constraints:
- "dev_session_id owns higher-level dev workflow continuity and MUST NOT replace terminal_session_id when exact shell reuse is required."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md"
- "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md"
- "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md"
- "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Section15_MVP_Promoted_Features_Spec.md"
- "Plans/FinalGUISpec.md"
- "Plans/Contracts_V0.md"
```

### SP-015 - App Data Root And Core Store Layout

```yaml
plan_unit_id: SP-015
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage uses one app data root for core stores and records project-scoped runtime state under managed .puppet-master state when inherently project-local."
gui_related: false
gui_classification_reason: "This unit preserves backend file layout and storage root requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-015 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: app_data_root_core_store_layout
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0032"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0033"
preserved_exact_tokens:
- "~/.puppet-master/"
- "$XDG_DATA_HOME/puppet-master/"
- "%APPDATA%/puppet-master"
- "~/Library/Application Support/puppet-master"
- ".puppet-master/"
- "storage/seglog/"
- "storage/redb/"
- "storage/jsonl/"
- "storage/tantivy/projects/{project_id}/"
- "storage/blobs/"
- "storage/backups/"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md"
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-016 - Deterministic Regex Index Algorithm And Metadata

```yaml
plan_unit_id: SP-016
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Regex-index storage rejects probabilistic Blackbird-style masks, uses deterministic sparse n-gram postings plus ripgrep verification, and records dependencies, xxh3 hashing, Roaring posting lists, and index_meta.json metadata."
gui_related: false
gui_classification_reason: "This unit preserves backend regex index algorithm and metadata requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "T-001"
unblocks: []
acceptance_criteria:
- "SP-016 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: deterministic_regex_index_algorithm_metadata
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0033"
preserved_exact_tokens:
- "regex_index/"
- "FILE_ATTRIBUTE_NOT_CONTENT_INDEXED"
- ".metadata_never_index"
- "Blackbird-style"
- "nextMask"
- "locMask"
- "deterministic sparse n-gram postings"
- "ripgrep verification"
- "regex-syntax"
- "roaring"
- "memmap2"
- "xxhash-rust"
- "arc-swap"
- "thread-priority"
- "xxh3"
- "Roaring Bitmap"
- "index_meta.json"
- "anchor_sha"
- "build_timestamp_utc"
- "schema_version"
- "file_count"
- "generation"
- "case_sensitive_fs"
- "roaring_format: \"portable\""
negative_constraints:
- "PM does not adopt probabilistic Blackbird-style posting augmentation as canonical storage."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md"
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Tools.md"
- "Plans/GitHub_Integration.md"
```

### SP-017 - Remote Git Regex Cache Submodules Verification And Dirty Locality

```yaml
plan_unit_id: SP-017
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Remote Git regex storage keeps local bare-clone cache and dirty staging, handles submodules explicitly, builds with git cat-file, verifies with git show plus ripgrep, and preserves near-zero SSH grep with documented dirty-file fallback."
gui_related: false
gui_classification_reason: "This unit preserves backend remote Git cache, verification, and dirty-file storage requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "GI-001"
- "T-001"
unblocks: []
acceptance_criteria:
- "SP-017 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: remote_git_regex_cache_submodules_verification_dirty_locality
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0033"
preserved_exact_tokens:
- ".puppet-master/cache/r/{hash8}/git/"
- "--shallow/partial"
- "--bare"
- "git clone --bare"
- "core.sshCommand"
- "git bundle"
- "git cat-file --batch"
- "--recurse-submodules"
- "git/modules/{submodule_path}/"
- "git show {anchor_sha}:{path}"
- "case-collisions"
- "dirty/{relative_path}"
- "1 MB"
- "near-zero-SSH-during-grep"
- "SUPERSEDES any absolute zero-SSH claim"
negative_constraints:
- "Remote project storage split does not re-own remote-search behavior, remote-only settings, or /admin controls."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md"
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/GitHub_Integration.md"
- "Plans/Tools.md"
```

### SP-018 - Dirty Layer Generation And Snapshot Publication Safety

```yaml
plan_unit_id: SP-018
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Dirty-layer and regex-index publication use generation-based clearing, RwLock dirty entries, ArcSwap snapshot publication, sync_all durability, anchor reachability invalidation, and bounded memory guidance."
gui_related: false
gui_classification_reason: "This unit preserves backend concurrency, publication, durability, and rebuild safety requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "AI-001"
unblocks: []
acceptance_criteria:
- "SP-018 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: dirty_layer_generation_snapshot_publication_safety
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0033"
preserved_exact_tokens:
- "generation <= build_generation"
- "generation ≤ build_generation"
- "RwLock<HashMap<PathBuf, DirtyEntry>>"
- "DirtyEntry"
- "deleted flag"
- "ArcSwap<Arc<IndexSnapshot>>"
- "gen-{N+1}/"
- "File::sync_all()"
- "sync_all"
- "git cat-file -t {sha}"
- "anchor_sha"
- "full rebuild"
- "500 MB"
- "O(index_size) RAM"
- "1.5x index size"
negative_constraints:
- "Entries added during the build must survive so a long-running build cannot lose files dirtied during that build."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md"
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Architecture_Invariants.md"
```

### SP-019 - Local And Remote Regex Index Layouts And Windows Path Compatibility

```yaml
plan_unit_id: SP-019
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Local, remote Git, and remote non-Git regex-index layouts preserve generation snapshot paths, remote cache roots, manifest mappings, hash8 short paths, and Windows longPathAware mitigation."
gui_related: false
gui_classification_reason: "This unit preserves backend cache layout and platform compatibility requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "GI-001"
- "BS-001"
- "T-001"
unblocks: []
acceptance_criteria:
- "SP-019 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: local_remote_regex_layout_windows_path_compatibility
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0034"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0035"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0036"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0037"
preserved_exact_tokens:
- ".puppet-master/project/state/regex_index/"
- "frequency_table.bin"
- "gen-{N}/postings.bin"
- "gen-{N}/lookup.bin"
- "gen-{N}/file_map.bin"
- "gen-{N}/index_meta.json"
- ".puppet-master/cache/r/{hash8}/"
- "git/m/{sub_hash8}/"
- "dirty/"
- "manifest.json"
- "hash8 -> project_id/submodule_path"
- "MAX_PATH"
- "/cache/r/{hash8}/git/m/{hash8}/"
- "xxh3(full_id)"
- "longPathAware"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Tools.md, Invariant:INV-002, ContractName:Plans/Architecture_Invariants.md"
- "ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/BinaryLocator_Spec.md"
- "ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/BinaryLocator_Spec.md, ContractName:Plans/Tools.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/GitHub_Integration.md"
- "Plans/BinaryLocator_Spec.md"
- "Plans/Tools.md"
```

### SP-020 - Remote Cache Settings And Eviction Policy

```yaml
plan_unit_id: SP-020
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Remote cache settings persist per-project with global defaults, keep shallow and partial clone toggles independent and off by default, and evict remote caches only by idle age, cache size pressure, or explicit user action."
gui_related: false
gui_classification_reason: "This unit preserves backend remote cache policy and permission-adjacent configuration requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "PS-001"
unblocks: []
acceptance_criteria:
- "SP-020 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: remote_cache_settings_eviction_policy
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0038"
preserved_exact_tokens:
- "Shallow clone is OFF by default"
- "--depth=1"
- "Partial clone is OFF by default"
- "--filter=blob:none"
- "30 days"
- "50 GB"
- "10% of free disk"
- "LRU project caches"
- "Clear All Remote Caches"
- "grep remains read-only"
- "/Permissions_System.md"
- "/plan-mode"
negative_constraints:
- "Remote cache settings do not introduce a new grep permission key or /plan-mode exception."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Permissions_System.md"
- "Plans/Run_Modes.md"
```

### SP-021 - Remote Cache Disk Usage Display

```yaml
plan_unit_id: SP-021
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Disk-usage reporting shows local and remote project cache sizes, including separate remote index and Git portions."
gui_related: true
gui_classification_reason: "This unit preserves user-visible disk-usage reporting text."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-021 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: remote_cache_disk_usage_display
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0038"
preserved_exact_tokens:
- "Disk-usage reporting"
- "BOTH local and remote project caches"
- "Index: {size}"
- "Remote cache: {total} - Index: {idx_size}, Git: {git_size}"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-022 - Binary Index File Contracts

```yaml
plan_unit_id: SP-022
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Binary index files use little-endian no-padding formats for file_map.bin, lookup.bin, postings.bin, and index_meta.json with explicit headers, offsets, portable Roaring bytes, and dirty-layer non-persistence."
gui_related: false
gui_classification_reason: "This unit preserves backend binary file format requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "T-001"
- "AI-001"
unblocks: []
acceptance_criteria:
- "SP-022 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: binary_index_file_contracts
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0039"
preserved_exact_tokens:
- "little-endian"
- "no inter-field padding"
- "file_map.bin"
- "PMFM"
- "schema_version:u32"
- "entry_count:u32"
- "path_byte_length:u32"
- "forward-slash (/) normalized"
- "lookup.bin"
- "PMLK"
- "xxh3_hash:u64"
- "postings_offset:u64"
- "64 KB-aligned"
- "MapViewOfFile"
- "postings.bin"
- "PMPL"
- "bitmap_byte_length:u32"
- "RoaringBitmap::serialize_into"
- "index_meta.json"
- "dirty-layer state is NOT persisted"
negative_constraints:
- "File IDs are generation-local only and MUST NOT be treated as stable across builds or across snapshot generations."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md"
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Architecture_Invariants.md"
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md, Invariant:INV-002"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Tools.md"
- "Plans/GitHub_Integration.md"
- "Plans/Architecture_Invariants.md"
```

### SP-023 - Frequency Table Path Compatibility And Startup Validation

```yaml
plan_unit_id: SP-023
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Frequency-table, path compatibility, and validation rules preserve The Stack Smol base matrix, static binary embedding, project blend rule, fixed 3-gram fallback, path normalization, case sensitivity, startup validation, Windows MAX_PATH mitigation, and OS indexer exclusions."
gui_related: false
gui_classification_reason: "This unit preserves backend indexing, compatibility, and validation requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "T-001"
- "GI-001"
- "AI-001"
unblocks: []
acceptance_criteria:
- "SP-023 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: frequency_table_path_compatibility_startup_validation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0040"
preserved_exact_tokens:
- "The Stack Smol"
- "bigcode/the-stack-smol"
- "256x256 matrix"
- "CRLF-stripped ASCII-lowercased bytes"
- "static const [u16; 65536]"
- "[u16; 65536]"
- "effective[a][b] = 0.5 * base[a][b] + 0.5 * project[a][b]"
- "fixed-width 3-gram extraction"
- "file_map.bin stores forward-slash relative paths"
- "case_sensitive_fs"
- "anchor_sha"
- "FILE_ATTRIBUTE_NOT_CONTENT_INDEXED"
- "SetFileAttributesW"
- ".metadata_never_index"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md"
- "ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Tools.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Tools.md"
- "Plans/GitHub_Integration.md"
- "Plans/Architecture_Invariants.md"
```

### SP-024 - Index Sizing Guidance And Seglog Boundary Anchor

```yaml
plan_unit_id: SP-024
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Sparse n-gram index sizing guidance remains explicit, and the 2.2 seglog heading is retained as the source boundary for the next storage-plan batch."
gui_related: false
gui_classification_reason: "This unit preserves backend sizing guidance and the next storage section anchor."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "T-001"
- "GI-001"
unblocks: []
acceptance_criteria:
- "SP-024 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: index_sizing_guidance_seglog_boundary_anchor
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0041"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0042"
preserved_exact_tokens:
- "1-10% of source code size"
- "50 MB"
- "500 MB"
- "1 GB"
- "50 GB"
- "2-5 GB"
- "<500 MB"
- "2.2 seglog: format, writer, rotation"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Tools.md"
- "Plans/GitHub_Integration.md"
```

### SP-025 - Mandatory Seglog CRC32 Integrity

```yaml
plan_unit_id: SP-025
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Seglog records must include CRC32 over the stored payload, validate before processing, skip corrupt records, emit recovery/integrity events, and resume projectors from the last known-good checkpoint."
gui_related: false
gui_classification_reason: "This unit preserves backend seglog integrity and recovery behavior."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "AI-001"
- "CV-001"
unblocks: []
acceptance_criteria:
- "SP-025 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: mandatory_seglog_crc32_integrity
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0043"
preserved_exact_tokens:
- "CRC32"
- "checksum"
- "mandatory correctness requirement"
- "not an optional enhancement"
- "record offset"
- "expected vs observed CRC"
- "last known-good checkpoint"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md"
- "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Runtime_Artifacts_Panel.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Architecture_Invariants.md"
- "Plans/Executor_Protocol.md"
- "Plans/Contracts_V0.md"
- "Plans/Runtime_Artifacts_Panel.md"
```

### SP-026 - Seglog Wire Format And Payload Authority

```yaml
plan_unit_id: SP-026
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Seglog uses a length-prefixed binary MessagePack record stream with canonical header fields, payload-only compression, checksum validation, and JSON diagnostics as non-authoritative mirrors."
gui_related: false
gui_classification_reason: "This unit preserves backend on-disk seglog wire-format requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
unblocks: []
acceptance_criteria:
- "SP-026 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: seglog_wire_format_payload_authority
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0044"
preserved_exact_tokens:
- "length-prefixed binary record stream"
- "MessagePack"
- "JSON is not the on-disk authority"
- "SeglogRecord"
- "SeglogHeader"
- "version: u8"
- "segment_generation: u32"
- "event_type: string"
- "sequence_id: u64"
- "source_timestamp_ns?"
- "observed_timestamp_ns"
- "payload_length: u32"
- "checksum_crc32: u32"
- "compression: \"none\" | \"lz4\""
negative_constraints:
- "JSON is not the on-disk authority."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Contracts_V0.md"
```

### SP-027 - Deterministic Seglog Rotation

```yaml
plan_unit_id: SP-027
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Seglog rotation is deterministic and generation-aware with one active segment, canonical active and closed segment path formats, immutable closed segments, and lexicographic projector consumption."
gui_related: false
gui_classification_reason: "This unit preserves backend seglog segment lifecycle and rotation requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-027 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: deterministic_seglog_rotation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0045"
preserved_exact_tokens:
- "one active writable segment"
- "storage/seglog/seg-{generation:06}-{start_seq:020}.active"
- "storage/seglog/seg-{generation:06}-{start_seq:020}-{end_seq:020}.seglog"
- "schema-generation change"
- "closed segments are immutable"
- "no in-place rewrite"
- "lexicographic order"
negative_constraints:
- "Closed segments are immutable; no in-place rewrite is allowed."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-028 - Seglog Replay And Rebuild Rules

```yaml
plan_unit_id: SP-028
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Replay and rebuild keep seglog authoritative over redb projections, JSONL mirrors, and Tantivy indices, resume from stable checkpoints, truncate only corrupt tails after the last verified record, and preserve sequence_id ordering."
gui_related: false
gui_classification_reason: "This unit preserves backend replay, rebuild, and source-of-truth ordering requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "AI-001"
- "CV-001"
unblocks: []
acceptance_criteria:
- "SP-028 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: seglog_replay_rebuild_rules
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0046"
preserved_exact_tokens:
- "redb projections"
- "JSONL mirror files"
- "Tantivy indices"
- "seglog"
- "last committed checkpoint"
- "{ segment_generation, segment_name, byte_offset, last_seq }"
- "partial/corrupt tail"
- "last verified record"
- "sequence_id ordering"
- "semantic event order"
negative_constraints:
- "redb projections, JSONL mirror files, and Tantivy indices are rebuildable from seglog plus stable checkpoints; none of them outrank seglog as authority."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Architecture_Invariants.md"
- "Plans/Executor_Protocol.md"
- "Plans/Contracts_V0.md"
```

### SP-029 - redb Schema Boundary Anchor

```yaml
plan_unit_id: SP-029
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "The redb schema, migrations, and key patterns heading remains the canonical section boundary for durable KV schema rules."
gui_related: false
gui_classification_reason: "This unit preserves backend section anchoring for redb schema requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-029 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: redb_schema_boundary_anchor
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0047"
preserved_exact_tokens:
- "2.3 redb: schema, migrations, key patterns"
- "redb"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-030 - Canonical Record Baseline

```yaml
plan_unit_id: SP-030
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Canonical records are the immutable single source of truth for run, node, lane, and execution state and carry created/updated audit fields."
gui_related: false
gui_classification_reason: "This unit preserves backend canonical record baseline requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-030 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: canonical_record_baseline
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0048"
preserved_exact_tokens:
- "single source of truth"
- "run"
- "node"
- "lane"
- "execution state"
- "immutable once committed"
- "explicit lineage"
- "created_at_utc"
- "updated_at_utc"
- "created_by"
negative_constraints:
- "Canonical records are immutable once committed; corrections require a new record with explicit lineage."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-031 - Concern Record Lifecycle Canon

```yaml
plan_unit_id: SP-031
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Concern is a first-class durable record distinct from findings, annotations, blocked episodes, and graph patch requests, with lifecycle, lineage, severity/category/status, governance metadata, resolution_kind, and separate projection/linkage layers."
gui_related: false
gui_classification_reason: "This unit preserves backend concern record lifecycle and storage separation requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-031 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: concern_record_lifecycle_canon
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0049"
preserved_exact_tokens:
- "Concern"
- "first-class durable record"
- "review finding"
- "annotation"
- "blocked episode"
- "graph patch request"
- "concern_id"
- "project_id"
- "evidence/source refs"
- "lineage refs"
- "severity/category/status"
- "resolution_kind"
- "accepted_risk"
- "concern_record"
- "concern_projection"
- "blocked_episode linkage"
negative_constraints:
- "Storage persists concern_record separately from concern_projection and blocked_episode linkage so lifecycle ownership stays durable and queryable."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-032 - Required redb Key Baseline

```yaml
plan_unit_id: SP-032
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "The baseline redb key families include run, node, lane, execution_unit, and receipt records with stable entity key patterns."
gui_related: false
gui_classification_reason: "This unit preserves backend redb key-pattern requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-032 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: required_redb_key_baseline
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0050"
preserved_exact_tokens:
- "run:<run_id>"
- "node:<node_id>"
- "lane:<lane_id>"
- "execution_unit:<execution_unit_id>"
- "receipt:<receipt_id>"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-033 - Historical Semantic Consistency

```yaml
plan_unit_id: SP-033
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage defines shared historical vocabulary while keeping family-local workflow states distinct across concern, receipt, artifact, worktree, and usage families."
gui_related: false
gui_classification_reason: "This unit preserves backend historical vocabulary and lifecycle separation requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-033 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: historical_semantic_consistency
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0051"
preserved_exact_tokens:
- "historical"
- "stale_historical"
- "superseded"
- "revoked"
- "reopened"
- "archived"
- "removed"
- "remediation.resolved"
- "family-local workflow states"
- "concern"
- "receipt"
- "artifact"
- "worktree"
- "usage"
negative_constraints:
- "Historical terms stay shared across concern, receipt, artifact, worktree, and usage families without collapsing family-local workflow states."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-034 - Cross-Surface Receipt Baseline

```yaml
plan_unit_id: SP-034
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Receipt records bind execution results to canonical run, node, and lane identity for dashboard, CLI, and API query surfaces."
gui_related: false
gui_classification_reason: "This unit preserves backend receipt baseline and cross-surface query requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-034 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: cross_surface_receipt_baseline
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0052"
preserved_exact_tokens:
- "Receipt records"
- "canonical run"
- "node"
- "lane identity"
- "execution_unit_id"
- "result_summary"
- "artifacts"
- "evidence_ref"
- "Dashboard"
- "CLI"
- "API"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-035 - Projection Rehydration Baseline

```yaml
plan_unit_id: SP-035
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Projections are derived from canonical records and events, freshness is tracked per projection type, and startup rehydration restores projections from seglog and redb canonical records."
gui_related: false
gui_classification_reason: "This unit preserves backend projection freshness and startup rehydration requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-035 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: projection_rehydration_baseline
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0053"
preserved_exact_tokens:
- "Projections"
- "canonical records and events"
- "Projection freshness"
- "per projection type"
- "stale projections"
- "startup"
- "seglog"
- "redb canonical records"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-036 - Account Pressure Attribution Baseline

```yaml
plan_unit_id: SP-036
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Account pressure metrics are stored per account at node/lane boundaries, history records are immutable and linked to canonical identity, and runtime attribution tracks actor/role execution."
gui_related: false
gui_classification_reason: "This unit preserves backend account pressure, history, and attribution requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-036 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: account_pressure_attribution_baseline
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0054"
preserved_exact_tokens:
- "Account pressure metrics"
- "per account"
- "node/lane boundaries"
- "History records"
- "account-level"
- "execution-level"
- "immutable"
- "canonical run/node identity"
- "Runtime attribution"
- "actor/role"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-037 - Artifact Index And Route Linkage Baseline

```yaml
plan_unit_id: SP-037
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Artifacts are indexed by artifact ID, export manifests bind artifact collections to deliverables, and route/open linkage records active route args and open contracts during execution."
gui_related: false
gui_classification_reason: "This unit preserves backend artifact index, export manifest, and route/open linkage requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-037 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: artifact_index_route_linkage_baseline
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0055"
preserved_exact_tokens:
- "artifact ID"
- "run"
- "node"
- "receipt records"
- "Export manifests"
- "project deliverables"
- "Route/open linkage"
- "route args"
- "open contracts"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-038 - Worktree Lane Cleanup Baseline

```yaml
plan_unit_id: SP-038
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Worktree lifecycle storage tracks allocation, usage, reclamation, Source Control to Orchestrator handshakes, and cleanup lineage for stale worktree audit."
gui_related: false
gui_classification_reason: "This unit preserves backend worktree/lane lifecycle and cleanup storage requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "W-001"
unblocks: []
acceptance_criteria:
- "SP-038 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: worktree_lane_cleanup_baseline
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0056"
preserved_exact_tokens:
- "Worktree lifecycle records"
- "allocation"
- "usage"
- "reclamation events"
- "Handshake records"
- "Source Control → Orchestrator"
- "cleanup lineage"
- "stale worktrees"
- "removed"
- "audited"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/WorktreeGitImprovement.md"
```

### SP-039 - Naming And Migration Baseline

```yaml
plan_unit_id: SP-039
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Schema keys follow entity_type:entity_id:sub_key patterns, migrations are versioned and idempotent, old versions remain supported for at least one major release, and deprecation is explicit in migration notes."
gui_related: false
gui_classification_reason: "This unit preserves backend naming and schema migration requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-039 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: naming_migration_baseline
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0057"
preserved_exact_tokens:
- "entity_type:entity_id:sub_key"
- "Migrations"
- "versioned"
- "idempotent"
- "old schema versions"
- "at least one major release"
- "Deprecation"
- "migration notes"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-040 - Owner-First Canonicalization Order

```yaml
plan_unit_id: SP-040
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Owner-doc corrections happen before consumer and mirror cleanup, and fidelity audit reruns only after owner and consumer corrections are in place."
gui_related: false
gui_classification_reason: "This unit preserves backend plan-governance sequencing for storage owner corrections."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-040 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: owner_first_canonicalization_order
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0058"
preserved_exact_tokens:
- "owner-doc corrections"
- "consumer and mirror cleanup"
- "fidelity audit"
- "canonical owner records first"
- "dependent projections and mirrors second"
- "fidelity rerun evidence"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-041 - Runtime Storage Record Families

```yaml
plan_unit_id: SP-041
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage owns one shared record envelope and required runtime/storage families for attempts, blocked projections, concerns, worktrees, lanes, project summaries, attention items, account pressure, and account switch events."
gui_related: false
gui_classification_reason: "This unit preserves backend runtime/storage record family requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
unblocks: []
acceptance_criteria:
- "SP-041 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: runtime_storage_record_families
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0059"
preserved_exact_tokens:
- "shared record envelope"
- "attempt_record.v1:{project_id}:{node_id}:{attempt_number}"
- "blocked_projection.v1:{project_id}:{node_id}"
- "concern_record.v1:{project_id}:{concern_id}"
- "worktree_record.v1:{project_id}:{worktree_id}"
- "lane_record.v1:{project_id}:{lane_id}"
- "project_summary.v1:{project_id}"
- "project_attention_item.v1:{project_id}:{attention_item_id}"
- "account_pressure_episode.v1:{provider_id}:{account_id}:{episode_id}"
- "account_switch_event.v1:{provider_id}:{event_id}"
- "resolution_kind"
- "fixed"
- "accepted_risk"
- "superseded"
- "merged"
- "split"
- "invalidated"
- "obsoleted_by_patch"
- "obsoleted_by_recovery"
negative_constraints:
- "source-event refs, concern records, and concern projections are separate structural layers rather than one collapsed object."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Contracts_V0.md"
```

### SP-042 - Project Runtime redb Keys

```yaml
plan_unit_id: SP-042
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Project/runtime redb keys include artifact indices, projector checkpoints, attempt and blocked records, concern records, project summary/attention items, worktree/lane records and projections, thread state bindings, and account pressure/switch events."
gui_related: false
gui_classification_reason: "This unit preserves backend project/runtime redb key requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-042 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: project_runtime_redb_keys
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0060"
preserved_exact_tokens:
- "artifacts_index.v1:{project_id}:{artifact_id}"
- "artifacts_project_state.v1:{project_id}"
- "projector.checkpoint.runtime_artifacts:{project_id}"
- "thread_state:{thread_id}:worktree_binding"
- "thread_state:{thread_id}:persona_override"
- "worktree_binding_reverse:{worktree_id}"
- "lane_projection.v1:{project_id}:{lane_id}"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-043 - Cross-Surface Receipt Required Fields

```yaml
plan_unit_id: SP-043
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Cross-surface receipts preserve required attempt/provider/usage/workflow/container/Kubernetes/auditor-cycle/run/verdict/phase/quality fields, allow legacy validation_pass_report only as a compatibility mirror with compatibility_only true plus cycle_report_ref, and keep attempt_id as the primary local anchor."
gui_related: false
gui_classification_reason: "This unit preserves backend cross-surface receipt field and join requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-043 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: cross_surface_receipt_required_fields
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0061"
preserved_exact_tokens:
- "attempt_id"
- "provider_attempt_ref"
- "usage_event_ref"
- "workflow_refs"
- "docker_refs"
- "kubernetes_refs"
- "auditor_cycle_report"
- "validation_pass_report"
- "compatibility_only"
- "cycle_report_ref"
- "workflow_run_id"
- "run_id"
- "pass_verdict"
- "phase_plan_ref"
- "requirements_quality_report_ref"
- "primary local anchor"
- "Artifact open flows"
- "artifact_id"
- "linked envelope refs"
negative_constraints:
- "provider_attempt_ref, usage_event_ref, and receipt refs do not replace the local key."
preserved_contractrefs: []
compatibility_only_notes:
- "validation_pass_report is a legacy mirror only and must carry compatibility_only true plus cycle_report_ref to auditor_cycle_report."
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-044 - Command Alert Incident Timeline Records

```yaml
plan_unit_id: SP-044
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Command-originated alerts are durable incident timeline records with parent/root cause linkage, required alert fields, attention routing precedence, delivery classes, escalation state, waiting states, and coalescing behavior."
gui_related: false
gui_classification_reason: "This unit preserves durable alert records with user-visible routing terms but remains classified as storage-record behavior."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "UCC-001"
unblocks: []
acceptance_criteria:
- "SP-044 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: command_alert_incident_timeline_records
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0062"
preserved_exact_tokens:
- "parent_incident_id"
- "parent-incident"
- "root_cause_key"
- "raised_at"
- "source_surface"
- "severity"
- "owning_surface"
- "acknowledged/snoozed state"
- "resolved_at"
- "attention_key"
- "/coalescing"
- "Orchestrator"
- "GitHub Actions"
- "Docker Manager"
- "status bar"
- "Dashboard"
- "blocking_modal"
- "interruptive_toast"
- "persistent_banner_or_card"
- "badge_only"
- "waiting"
- "waiting_long"
- "attention_waiting"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/UI_Command_Catalog.md"
```

### SP-045 - Project Attention And Execution Reconciliation

```yaml
plan_unit_id: SP-045
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Project attention records do not collapse attention into orchestrator status; storage preserves severity meanings, family-local lifecycle states, projection freshness/health lineage, execution ownership migration, and worktree durable-key boundaries."
gui_related: true
gui_classification_reason: "This unit preserves user-visible project attention and execution ownership state."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "W-001"
unblocks: []
acceptance_criteria:
- "SP-045 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: project_attention_execution_reconciliation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0063"
preserved_exact_tokens:
- "orchestrator status"
- "idle/running/paused"
- "activity_state"
- "info"
- "warning"
- "attention_required"
- "blocked"
- "completion-blocking"
- "archived"
- "removed"
- "deleted"
- "governance_boundary"
- "tier_boundary"
- "projection_freshness"
- "projection_health"
- "last_projected_at_utc"
- "source_seq"
- "degraded_reason_code"
- "refresh_in_progress"
- "blocked_sequence"
- "startup-recovery"
- "scheduler-pass"
- "startup_recovered"
- "execution_role"
- "worktree_id"
- "/path"
- "/source-control"
- "base-branch"
negative_constraints:
- "Project attention records MUST NOT collapse user attention into only orchestrator status."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/WorktreeGitImprovement.md"
- "Plans/Executor_Protocol.md"
```

### SP-046 - Evidence Receipt Redaction Provenance

```yaml
plan_unit_id: SP-046
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Persisted/exported evidence, receipts, summaries, audit items, bulk outcomes, export manifests, holds, and structured-copy payloads preserve source provenance, redaction policy, stability classes, missing refs, and lineage facts."
gui_related: true
gui_classification_reason: "This unit preserves user-visible exported evidence, receipts, audit, and bulk action provenance."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-046 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: evidence_receipt_redaction_provenance
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0064"
preserved_exact_tokens:
- "source_event_ids[]"
- "source_event_ids"
- "blob_ref?"
- "blob_ref"
- "derived_by_projector"
- "projector_version"
- "redaction_profile_id"
- "derived_at"
- "embedded_snapshot"
- "local_blob_ref"
- "external_live_ref"
- "external_missing"
- "mandatory_scrub_applied"
- "heuristic_redaction_enabled"
- "display_may_hide_details"
- "partial-success"
- "per-target"
- "exported_at"
- "source_seglog_range"
- "missing_external_refs[]"
- "hold_state"
- "structured-copy"
negative_constraints:
- "Consumers distinguish source facts from projected summaries."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-047 - External Evidence And Sensitive Metadata Storage

```yaml
plan_unit_id: SP-047
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "External operation evidence separates ephemeral, scrubbed persisted, and user-exported forms; privileged sessions store bounded metadata only; secret-bearing build/deploy data uses no-persist/no-echo flags; sensitive metadata and Kubernetes Secret rendering are masked by default."
gui_related: true
gui_classification_reason: "This unit preserves user-visible export, screenshot, evidence, auth handoff, and sensitive metadata behavior."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "PS-001"
unblocks: []
acceptance_criteria:
- "SP-047 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: external_evidence_sensitive_metadata_storage
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0065"
preserved_exact_tokens:
- "ephemeral in-memory view"
- "scrubbed persisted blob"
- "user-exported"
- "scrub-before-persist"
- "scrub-before-index"
- "docker exec/attach"
- "kubectl exec"
- "kubectl port-forward"
- "remote SCM-over-SSH"
- "browser/device auth handoffs"
- "no-persist"
- "/no-echo"
- "Docker Hub account identity"
- "SSH usernames/host aliases"
- "screenshot-visible values"
- "Kubernetes Secret"
- "ConfigMap"
- "Open app"
- "access-intelligence"
negative_constraints:
- "The durable store does not persist interactive transcript or /stdin by default."
- "Kubernetes Secret resources are never rendered back in full, never indexed, and never included in receipts or /evidence beyond kind, /name/namespace, and redacted status."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Permissions_System.md"
```

### SP-048 - Durable Store Scope Split

```yaml
plan_unit_id: SP-048
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Durable store boundaries split secrets into the OS credential store, global app state and project state into redb, and auth/recovery/action/event linkage into seglog."
gui_related: true
gui_classification_reason: "This unit preserves user-visible scope/store boundaries in a table consumed by configuration and state surfaces."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-048 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: durable_store_scope_split
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0066"
preserved_exact_tokens:
- "Secret"
- "OS credential store only"
- "Global app state"
- "redb"
- "Project state"
- "Event ledger"
- "seglog"
- "GitHub API tokens"
- "Docker PATs"
- "browser-login derived credentials"
- "registry/helper secrets"
- "selected repo/worktree"
- "panel subviews"
- "pinned workflows"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-049 - Projection Freshness Health Operational Rules

```yaml
plan_unit_id: SP-049
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Projection operational rules persist active/focused run identity, historical focus mode, cross-tab deep link targeting, separate freshness and health axes, action gating, and trust_tier retirement to preview/browser semantics only."
gui_related: true
gui_classification_reason: "This unit preserves user-visible projection trust, focus, deep-link, and action gating behavior."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-049 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: projection_freshness_health_operational_rules
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0067"
preserved_exact_tokens:
- "active_run_id"
- "focused_run_id"
- "focus_mode = live | historical"
- "cross-tab deep links"
- "search pivots"
- "projection_freshness"
- "projection_health"
- "MUST NOT collapse"
- "stale-but-healthy"
- "degraded"
- "unavailable"
- "trust_tier"
- "preview/browser semantics"
negative_constraints:
- "projection_freshness remains the recency axis and projection_health remains the integrity/availability axis; storage and consumers MUST NOT collapse them into a single trust field."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-050 - Execution Unit Context Ownership Split

```yaml
plan_unit_id: SP-050
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage owns persistence/projection of attempt, usage, receipt, and artifact joins from execution_unit_context while TierContext and tier_id remain compatibility-only derived metadata."
gui_related: true
gui_classification_reason: "This unit preserves GUI/runtime inspection identity and storage ownership for execution context."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
unblocks: []
acceptance_criteria:
- "SP-050 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: execution_unit_context_ownership_split
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0068"
preserved_exact_tokens:
- "execution_unit_context"
- "TierContext"
- "tier_id"
- "compatibility-only derived metadata"
- "worker spawn"
- "recovery"
- "remediation"
- "coordination"
- "UI inspection"
- "Contracts_V0"
- "cross-family attribution packet"
- "attempt/usage/receipt/artifact joins"
negative_constraints:
- "Any TierContext or tier_id decomposition is compatibility-only derived metadata for legacy selection helpers and MUST NOT own runtime canon, storage keys, or join identity."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Contracts_V0.md"
```

### SP-051 - Artifact Route Open Ownership Split

```yaml
plan_unit_id: SP-051
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Runtime artifacts are attempt-native by default with artifact identity and linked refs; Contracts_V0 owns route_target/OpenSubject, Crosswalk remains primitive-boundary limited, FileManager OpenFile remains narrow/path-based, and export manifests carry route/open linkage by reference."
gui_related: false
gui_classification_reason: "This unit preserves backend artifact and route/open ownership boundaries."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
unblocks: []
acceptance_criteria:
- "SP-051 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: artifact_route_open_ownership_split
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0069"
preserved_exact_tokens:
- "attempt-native"
- "artifact identity"
- "routing refs"
- "content refs"
- "provider/usage linkage"
- "artifact_id"
- "linked envelope refs"
- "route_target"
- "OpenSubject"
- "Crosswalk"
- "FileManager OpenFile"
- "path-based"
- "route/open linkage by reference"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Contracts_V0.md"
- "Plans/Crosswalk.md"
- "Plans/FileManager.md"
```

### SP-052 - Worktree Lane Ownership Split

```yaml
plan_unit_id: SP-052
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage records worktree/lane rows with owning package/lane/run refs, lifecycle and blocked/recovery state, durable worktree_id and lane_id identities, package linkage, and cleanup/archive lineage while Orchestrator and Source Control own their operational halves."
gui_related: true
gui_classification_reason: "This unit preserves user-visible Source Control and Orchestrator worktree/lane rows backed by storage records."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "W-001"
unblocks: []
acceptance_criteria:
- "SP-052 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: worktree_lane_ownership_split
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0070"
preserved_exact_tokens:
- "Orchestrator"
- "lane-pool operational truth"
- "Source Control"
- "concrete repo/worktree operator"
- "owning package/lane/run refs"
- "lifecycle"
- "blocked/recovery state"
- "worktree_record/worktree_projection"
- "lane_record/lane_projection"
- "worktree_id"
- "lane_id"
- "package/work-package linkage"
- "cleanup/archive lineage"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/WorktreeGitImprovement.md"
```

### SP-053 - Forward-Only Storage Migration Policy

```yaml
plan_unit_id: SP-053
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage migrations are forward-only and monotonic: new fields are additive first, destructive renames require same-section migration notes, semantic names stay aligned or use explicit translations, durable account/profile and server-profile shapes stay distinct, and consumers follow owner-first propagation."
gui_related: true
gui_classification_reason: "This unit preserves user-visible GUI ontology boundaries and forward-only storage migration policy."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-053 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: forward_only_storage_migration_policy
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0071"
preserved_exact_tokens:
- "forward-only"
- "monotonic"
- "new fields are additive first"
- "destructive renames"
- "migration note"
- "stable semantic names"
- "translation layer"
- "account/profile-backed runtime records"
- "server-profile-backed runtime records"
- "one GUI ontology"
- "owner correction here first"
- "consumer propagation"
- "fidelity audit rerun"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-054 - Canonical Records Owner Reconciliation

```yaml
plan_unit_id: SP-054
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage owns discoverable record families for runtime, receipt, and projection truth during owner reconciliation."
gui_related: false
gui_classification_reason: "This unit preserves backend owner reconciliation for record-family ownership."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-054 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: canonical_records_owner_reconciliation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0072"
preserved_exact_tokens:
- "Canonical records (owner reconciliation)"
- "runtime"
- "receipt"
- "projection truth"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-055 - Required redb Keys Owner Reconciliation

```yaml
plan_unit_id: SP-055
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Owner-reconciled redb keys include artifact/projector checkpoint, worktree, lane, thread binding, reverse binding, and orchestrator project state families."
gui_related: false
gui_classification_reason: "This unit preserves backend owner-reconciled redb key requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-055 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: required_redb_keys_owner_reconciliation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0073"
preserved_exact_tokens:
- "artifacts_index.v1:{project_id}:{artifact_id}"
- "artifacts_project_state.v1:{project_id}"
- "projector.checkpoint.runtime_artifacts:{project_id}"
- "worktree_record.v1:{project_id}:{worktree_id}"
- "lane_record.v1:{project_id}:{lane_id}"
- "thread_state:{thread_id}:worktree_binding"
- "worktree_binding_reverse:{worktree_id}"
- "orchestrator.project_state.{project_id}"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-056 - Cross-Surface Receipt Storage Rules

```yaml
plan_unit_id: SP-056
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Cross-surface receipt storage rules keep auditor_cycle_report receipt fields lineage-bearing and storage-owned for runtime artifacts, worktree records, lane records, and project-state keys; validation_pass_report is legacy mirror storage only with compatibility_only true plus cycle_report_ref."
gui_related: false
gui_classification_reason: "This unit preserves backend receipt storage ownership and lineage requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-056 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: cross_surface_receipt_storage_rules
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0074"
preserved_exact_tokens:
- "Cross-surface receipt record (storage rules)"
- "attempt_id"
- "provider_attempt_ref"
- "usage_event_ref"
- "workflow_refs"
- "docker_refs"
- "kubernetes_refs"
- "auditor_cycle_report"
- "validation_pass_report"
- "compatibility_only"
- "cycle_report_ref"
- "Receipt fields remain lineage-bearing"
- "Runtime artifacts"
- "worktree records"
- "lane records"
- "project-state keys"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- "validation_pass_report is a legacy mirror only and must carry compatibility_only true plus cycle_report_ref to auditor_cycle_report."
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-057 - Temporal Receipt Persistence And Retention Anchors

```yaml
plan_unit_id: SP-057
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Temporal receipt fields, blocked-state records, stream views, and projections preserve timeout/wait/timer/observation fields, immediate flush rules, follow-mode/source-liveness separation, and explicit retention anchor semantics."
gui_related: false
gui_classification_reason: "This unit preserves backend temporal persistence and retention rules for receipt and blocked-state records."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-057 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: temporal_receipt_persistence_retention_anchors
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0075"
preserved_exact_tokens:
- "timeout_class?"
- "wait_state_class?"
- "source_timer_ref?"
- "scheduled_workflow_ref?"
- "last_observation_at_utc?"
- "transitioned_at_utc"
- "retention_anchor_kind"
- "retention_anchor_at_utc"
- "hard execution timeout"
- "inactivity timeout"
- "polling timeout"
- "reconnect timeout"
- "user-visible wait timer expiry"
- "flush immediately"
- "follow-mode intent"
- "/node/log"
- "creation time"
- "last observation"
- "last access"
- "run completion"
- "MUST NOT infer the anchor from file mtime alone"
negative_constraints:
- "Retention policies for receipts, log tails, watch buffers, explorer snapshots, and stale caches MUST store both retention_anchor_kind and retention_anchor_at_utc; implementations MUST NOT infer the anchor from file mtime alone."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-058 - Freshness Policy Fields And Post-Expiry Modes

```yaml
plan_unit_id: SP-058
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage records freshness policy separately from retention; watch, follow-mode, log tail, explorer snapshot, stale cache, and remote runtime projection families declare stale_window_policy, stale_window_expires_at_utc, and post-expiry posture actionable, refresh-first, or read-only."
gui_related: false
gui_classification_reason: "This unit preserves backend stale-window policy fields rather than visual presentation."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-058 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: freshness_policy_fields_post_expiry_modes
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0076"
preserved_exact_tokens:
- "stale_window_policy"
- "stale_window_expires_at_utc"
- "actionable"
- "refresh-first"
- "read-only"
- "/watch"
- "follow-mode"
- "log tails"
- "explorer snapshots"
- "stale caches"
- "remote runtime projections"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-059 - Actions Readiness Refresh-First Gate

```yaml
plan_unit_id: SP-059
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Actions readiness snapshots may remain visible when stale, but workflow generation, apply, rerun, cancel, pin/unpin, and Actions Settings mutation require refresh-first; default expiry is 5m or immediate on workflow/settings/secret/environment input change."
gui_related: true
gui_classification_reason: "This unit preserves user-visible Actions readiness and stale action gating."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-059 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: actions_readiness_refresh_first_gate
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0076"
preserved_exact_tokens:
- "Actions readiness snapshot"
- "workflow generation"
- "apply"
- "rerun"
- "cancel"
- "pin/unpin"
- "Actions Settings mutation"
- "refresh-first"
- "5m"
- "last_observation_at_utc + 5m"
- "workflow/settings/secret/environment input change"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-060 - Workflow Run Freshness Gate

```yaml
plan_unit_id: SP-060
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Workflow run list/detail stale rows remain historical evidence, but live log follow, run mutation, rerun/cancel/pin, and dispatch require refresh-first; defaults are 60s for run lists and 15s for active run/detail/log-follow."
gui_related: true
gui_classification_reason: "This unit preserves user-visible workflow run freshness and log-follow gating."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-060 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: workflow_run_freshness_gate
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0076"
preserved_exact_tokens:
- "Workflow run list/detail"
- "stale rows"
- "historical evidence"
- "live log follow"
- "run mutation"
- "rerun/cancel/pin"
- "dispatch"
- "refresh-first"
- "60s"
- "15s"
- "last_observation_at_utc + threshold"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-061 - Docker Runtime Stale Snapshot Gate

```yaml
plan_unit_id: SP-061
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Docker container/image/compose snapshots are read-only when stale; lifecycle actions require refresh-first, with defaults of 15s for containers/compose health and 60s for image/registry inventory."
gui_related: true
gui_classification_reason: "This unit preserves user-visible Docker runtime stale-state and lifecycle action gating."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-061 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: docker_runtime_stale_snapshot_gate
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0076"
preserved_exact_tokens:
- "Docker runtime snapshot"
- "container/image/compose state"
- "read-only until refresh"
- "lifecycle actions"
- "refresh-first"
- "15s"
- "60s"
- "image/registry inventory"
- "cached inventory keeps freshness markers"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-062 - Kubernetes Workload Watch Stale Gate

```yaml
plan_unit_id: SP-062
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Kubernetes workload/watch state remains inspectable but read-only when stale; workload mutation, exec, port-forward, and rollout recovery require refresh-first, expiring at last_observation_at_utc + 15s or watch disconnect."
gui_related: true
gui_classification_reason: "This unit preserves user-visible Kubernetes stale-state and mutation gating."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-062 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: kubernetes_workload_watch_stale_gate
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0076"
preserved_exact_tokens:
- "Kubernetes workload/watch state"
- "rollout"
- "log"
- "exec"
- "port-forward"
- "workload mutation"
- "rollout recovery"
- "refresh-first"
- "last_observation_at_utc + 15s"
- "watch disconnect"
- "stale state remains inspectable"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-063 - Orchestrator Lineage Revalidation Freshness

```yaml
plan_unit_id: SP-063
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Orchestrator receipt/lineage stale views remain inspectable, but run-blocking recovery and CTA execution require canonical revalidation; active run stitching defaults to 30s, while completed historical receipts use retention policy instead of live freshness."
gui_related: true
gui_classification_reason: "This unit preserves user-visible Orchestrator receipt/lineage inspection and CTA revalidation gating."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-063 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: orchestrator_lineage_revalidation_freshness
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0076"
preserved_exact_tokens:
- "Orchestrator lineage/receipt stitching"
- "stale receipt/lineage views"
- "run-blocking recovery"
- "CTA actions"
- "canonical revalidation"
- "30s"
- "last_observation_at_utc + 30s"
- "completed historical receipts"
- "retention policy"
- "live freshness"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-064 - Stale Threshold Policy Versioning

```yaml
plan_unit_id: SP-064
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Default stale-window thresholds are explicit and may be tightened by a surface owner, but must not be silently lengthened without a persisted policy version."
gui_related: false
gui_classification_reason: "This unit preserves backend stale threshold policy-versioning requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-064 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: stale_threshold_policy_versioning
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0076"
preserved_exact_tokens:
- "Default stale-window thresholds"
- "surface owner"
- "may be tightened"
- "may not be silently lengthened"
- "persisted policy version"
- "Default stale threshold"
- "Expiry computation"
- "Post-expiry posture"
negative_constraints:
- "Default stale-window thresholds are explicit and may be tightened by a surface owner, but may not be silently lengthened without a persisted policy version."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-065 - Watchable Stream When-Hidden Policy

```yaml
plan_unit_id: SP-065
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Watchable streams declare when-hidden behavior for polling pause, return-to-visibility refresh, and relative timer elapsed/reset semantics so consumers do not infer continuity from the last rendered frame."
gui_related: true
gui_classification_reason: "This unit preserves user-visible watchable stream visibility and refresh behavior."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-065 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: watchable_stream_when_hidden_policy
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0076"
preserved_exact_tokens:
- "Pause-when-hidden"
- "watchable streams"
- "when-hidden"
- "polling pauses"
- "grace period"
- "return to visibility"
- "forces refresh"
- "relative timers"
- "hidden elapsed time"
- "reset"
- "last rendered frame"
negative_constraints:
- "Consumers do not infer continuity from the last rendered frame."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-066 - Store Scope Split And Projection Owner Boundary

```yaml
plan_unit_id: SP-066
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage records keep secret, global app state, project state, and event ledger scope split across OS credential store only, redb, and seglog, while unified event/projection wording remains owned by Plans/newtools.md rather than a competing storage projection family.
gui_related: false
gui_classification_reason: This unit preserves backend storage ownership and projection owner boundaries.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: store_scope_split_and_projection_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- Scope split (owner reconciliation)
- OS credential store only
- redb
- seglog
- Plans/newtools.md
- /projection
- regex-index storage records
- PolicyRule:no_secrets_in_storage
negative_constraints:
- Secrets belong in the OS credential store only, not in redb or seglog.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/newtools.md, PolicyRule:no_secrets_in_storage'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-067 - Cross-Surface Project Panel State Persistence

```yaml
plan_unit_id: SP-067
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Cross-surface panel state is per-project and panel-specific across Source Control, GitHub Actions, Docker Manager, Kubernetes, hidden-subview policy, and Unraid navigation while canonical cmd.docker.* command aliases win when legacy and new keys coexist.
gui_related: true
gui_classification_reason: This unit preserves user-visible panel state, subviews, filters, focus, and navigation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: cross_surface_project_panel_state_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- source_control.project_state.{project_id}
- github_actions.project_state.{project_id}
- container_manager
- Docker Manager > Publish / Unraid
- cmd.docker.*
- History
- Graph
- Current Branch
- Workflows
- Settings
- admin-scope
- /job/log
- /context/compose/Kubernetes
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Legacy container and publish-oriented panel state migrates into container_manager or Docker Manager > Publish / Unraid.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-068 - Docker Manager One-Way Key Migration

```yaml
plan_unit_id: SP-068
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Docker Manager project-state key migration is one-way: legacy Docker keys are migration-read aliases only, canonical writes use container_manager.project_state.{project_id}, and adjacent owner families stay with Source Control, GitHub Actions, and Orchestrator receipts.'
gui_related: false
gui_classification_reason: This unit preserves backend storage-key ownership and one-way migration rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: docker_manager_one_way_key_migration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- docker_manager.project_state.*
- docker.project_state.{project_id}
- docker.project_state
- docker_manage_surface_state
- /auth/Unraid
- migration-read aliases only
- container_manager.project_state.{project_id}
- source_control.project_state.{project_id}
- github_actions.project_state.{project_id}
- orchestrator.receipt.{run_id}.{attempt_id}
negative_constraints:
- Legacy Docker project-state keys are migration-read aliases only.
preserved_contractrefs: []
compatibility_only_notes:
- Legacy Docker Manager keys may be read for migration but must not receive canonical writes.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-069 - Cross-Process Target Ownership And Multi-Repo Identity

```yaml
plan_unit_id: SP-069
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Concurrent mutable control of the same project, repo, workspace root, runtime target, or remote repository is unsupported without a canonical project/target lock; conflicts degrade to read-only or explicit override and multi-repo projects carry stable workspace_root_id and repo_id below project_id.
gui_related: false
gui_classification_reason: This unit preserves backend cross-process locking, receipt, and multi-repo identity semantics.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: cross_process_target_ownership_and_multi_repo_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- project_id
- repo_id
- /workspace-root
- /repo/runtime
- remote_repo_ref
- read-only
- explicit override mode
- workspace_root_id
- origin
negative_constraints:
- Concurrent mutable control is unsupported unless a canonical project/target lock exists.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-070 - Mutation Lock And Stale-Selection Revalidation

```yaml
plan_unit_id: SP-070
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Mutation-capable operations claim mutation_lock_id, persist the validated armed selection/version, fail stale-selection when the visible target changes, and reconcile cancel-vs-complete races through receipt reference_state rules.
gui_related: false
gui_classification_reason: This unit preserves backend mutation lock, revalidation, and receipt reconciliation rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: mutation_lock_and_stale_selection_revalidation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- mutation_lock_id
- mutation-lock
- stale-selection
- reference_state
- project/repo/workspace target
- validated selection version
- cancel-vs-complete races
negative_constraints:
- Mutations must rebuild against the new canonical identity rather than applying to a previously visible row after stale-selection.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-071 - Worktrees Panel State Persistence

```yaml
plan_unit_id: SP-071
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Worktrees panel state persists selected worktree, sort mode, hide-stale, ownership display/focus, filters, and temporary Graph overlay badges until the dedicated Source Control Graph contract owns persisted graph state.
gui_related: true
gui_classification_reason: This unit preserves visible Worktrees panel state and Graph overlay badges.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: worktrees_panel_state_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- selected worktree
- sort mode
- hide-stale
- ownership display mode
- worktree ownership projection focus
- persisted worktree panel filters
- Graph overlay badges
- Source Control Graph contract
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-072 - Assistant Worktree Config Keys

```yaml
plan_unit_id: SP-072
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Assistant worktree settings are additive project-level redb config keys and do not replace Branching, File Manager, or Source Control panel-state keys.
gui_related: false
gui_classification_reason: This unit preserves backend project-level configuration keys.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: assistant_worktree_config_keys
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- config:project:{pid}:branching.assistant_auto_worktree
- config:project:{pid}:branching.assistant_worktree_cleanup_default
- config:project:{pid}:branching.assistant_worktree_base_ref
- config:project:{pid}:file_manager.worktree_follow_thread
- config:project:{pid}:branching.worktree_warning_threshold
- config:project:{pid}:branching.worktree_create_timeout_s
- config:project:{pid}:branching.assistant_worktree_pre_merge_test
- config:project:{pid}:branching.assistant_worktree_pre_merge_cmd
- config:project:{pid}:branching.worktree_pre_merge_test_timeout_s
- config:project:{pid}:branching.assistant_worktree_pre_merge_test_target
- ADDITIVE
negative_constraints:
- Assistant worktree settings are not replacements for existing Branching, File Manager, or Source Control panel-state keys.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-073 - Source Control Accordion And Filter Persistence

```yaml
plan_unit_id: SP-073
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Source Control accordion state and worktree_filter persist per project with enum values All, Threads, Orchestrator, and Manual, defaulting to All and remaining additive to thread/worktree binding keys.
gui_related: true
gui_classification_reason: This unit preserves visible Source Control accordion and Worktrees filter state.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: source_control_accordion_and_filter_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- config:project:{pid}:source_control.accordion_state
- Changes
- Worktrees
- Branches/Stash
- History
- Graph
- config:project:{pid}:source_control.worktree_filter
- worktree_filter
- All
- Threads
- Orchestrator
- Manual
- thread_state:{thread_id}:worktree_binding
- worktree_binding_reverse:{worktree_id}
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-074 - Shared Refresh Budgets And State-Class Observability

```yaml
plan_unit_id: SP-074
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Refresh and projection budgets are shared by SCM, Actions, Docker/Kubernetes, and Orchestrator through per-domain budgets, pause-when-hidden rules, backpressure telemetry, consistent state-class icon/text/badge mapping, and projector/cache/runtime observability records.
gui_related: true
gui_classification_reason: This unit preserves visible state-class mappings and backend refresh-budget observability.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: shared_refresh_budgets_and_state_class_observability
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- Git fetch
- Actions auto-refresh
- container health polling
- Kubernetes watch/log streams
- receipt projection
- per-domain budgets
- pause-when-hidden
- /backpressure
- Icon/text/badge mappings
- projector lag
- cache freshness
- stale-read age
- GitHub rate-limit state
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-075 - Command Receipt Lineage And Remote Clock Ordering

```yaml
plan_unit_id: SP-075
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Stitched receipt and long-running command lineage is ordered by storage records rather than remote clock trust, and operational command metadata carries command invocation, retry, correlation, observed, source, attempt, and run identifiers for deterministic replay.
gui_related: false
gui_classification_reason: This unit preserves backend receipt ordering and command lineage records.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: command_receipt_lineage_and_remote_clock_ordering
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- command-execution
- command_invocation_id
- started_at
- completed_at
- transport
- retry_count
- final_reason_code?
- /correlation
- receipt_id
- correlation_id
- source_system
- observed_at
- source_occurred_at?
- attempt_id?
- run_id?
- UI ordering
negative_constraints:
- Remote clocks are not trusted for canonical stitched receipt ordering.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-076 - Typed Orchestrator Deep-Link Context Payloads

```yaml
plan_unit_id: SP-076
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Orchestrator deep links use typed context payload families for Source Control, GitHub Actions, Docker Manager, and Kubernetes, with allowed_action_ids, deep_link_context, partial_lineage, and stale_data disclosure instead of generic URLs.
gui_related: false
gui_classification_reason: This unit preserves backend typed deep-link payload contracts.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: typed_orchestrator_deep_link_context_payloads
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- open_source_control_context
- open_github_actions_context
- open_docker_manager_context
- open_kubernetes_context
- allowed_action_ids[]?
- deep_link_context
- partial_lineage?
- stale_data?
- generic URLs
negative_constraints:
- Restored pivots must disclose partial evidence or stale data without inventing authority.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-077 - Per-Surface Filter And Focus Inheritance

```yaml
plan_unit_id: SP-077
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Per-surface search, filter, and focus inheritance is storage-backed per project; deep links record visible context filter chips or isolated focus markers so inherited context can be cleared without erasing saved project filters.
gui_related: true
gui_classification_reason: This unit preserves visible context filter chips, focus mode, and per-surface filter state.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: per_surface_filter_and_focus_inheritance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- /search
- filter
- /focus
- visible context filter chip
- isolated focus mode
- inherited-filter marker
- saved project filters
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-078 - Host-Aware File And Editor Search Write-State

```yaml
plan_unit_id: SP-078
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'File/editor search write-state is host-aware: persisted search state may reopen visible local, remote, diff, or editor-buffer queries, but write-capable actions bind to the owning project, host, repo/worktree, and recover-unsaved buffer context.'
gui_related: true
gui_classification_reason: This unit preserves user-visible search state and write-authority recovery behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: host_aware_file_and_editor_search_write_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- /search/write-state
- Local tree search
- remote tree search
- diff search
- editor-buffer search
- project
- host
- repo/worktree
- recover-unsaved context
negative_constraints:
- A stale cross-ref can reopen the visible query but cannot claim write authority.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-079 - SCM Side-Effect Lineage And Partial Receipt Replay

```yaml
plan_unit_id: SP-079
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: SCM side-effect lineage persists restart-stable receipt context for Orchestrator and Source Control, including repo/worktree/branch/head refs, partial receipt availability, destination filter/focus replay, and explicit complete-or-partial lineage state.
gui_related: false
gui_classification_reason: This unit preserves backend SCM receipt lineage and restart replay semantics.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: scm_side_effect_lineage_and_partial_receipt_replay
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- SCM side-effect lineage
- restart-stable receipt context
- repo/worktree/branch/head refs
- partial receipt availability
- complete or partial
- destination
- filter or focus mode
- Partial lineage
negative_constraints:
- Partial lineage is stored as an explicit state and must not be silently omitted or invented.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-080 - SCM Worktree Canonical Identity

```yaml
plan_unit_id: SP-080
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'SCM/worktree contract-resolution is storage-owned: project_id remains top-level, repo_id derives from vcs_root_fingerprint, worktree_id derives from worktree_realpath_fingerprint, worktree_path is display/navigation state, and historical snapshots stay separate from live_state.'
gui_related: false
gui_classification_reason: This unit preserves backend SCM and worktree identity rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: scm_worktree_canonical_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- project_id
- repo_id
- vcs_root_fingerprint
- gitrepo::<project_id>::<vcs_root_fingerprint>
- worktree_id
- worktree_realpath_fingerprint
- worktree::<repo_id>::<worktree_realpath_fingerprint>
- worktree_path
- /navigation
- historical_snapshot
- live_state
- compare_historical_to_live
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-081 - SCM Runtime Record Growth

```yaml
plan_unit_id: SP-081
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: SCM-capable attempt, tier runtime, blocked projection, and evidence records add exact SCM refs, dirty/conflict fields, ownership and baseline states, recovery targets, and evidence_scm_state so replay does not reconstruct state from UI text.
gui_related: false
gui_classification_reason: This unit preserves backend SCM runtime-record field growth.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: scm_runtime_record_growth
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- attempt_record
- tier_runtime_record
- blocked_projection
- evidence_record
- repo_id
- worktree_id
- worktree_path
- branch_name
- head_commit_oid
- baseline_commit_oid
- compare_target_ref
- git_operation_ref
- pr_ref
- dirty_file_paths
- dirty_file_paths[]
- conflict_file_paths[]
- ownership_state
- evidence_scm_state
negative_constraints:
- Receipts, blocked cards, and history replay exact SCM state instead of reconstructing it from UI text.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-082 - Project And Worktree Tombstone Lifecycle

```yaml
plan_unit_id: SP-082
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Project roots and retired worktrees keep durable tombstone states after deletion or missing-root, preserving immutable identity, last-known refs, receipts, historical deep-link behavior, and validation before resumable state.
gui_related: true
gui_classification_reason: This unit preserves user-visible tombstone, historical link, and rebind behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: project_and_worktree_tombstone_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- active
- missing_on_disk
- archived_from_ui
- deleted_from_registry
- not-found
- rebind_required
- worktree_id
- /receipts
- /recreate
- tombstone detail
- nearest valid compare target
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-083 - Receipt Reference-State And Live-List Anchors

```yaml
plan_unit_id: SP-083
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Receipt reference_state degradation is deterministic when identities disappear, and live-refreshing lists preserve row, menu, dialog, action anchors, and update-source metadata while users focus or arm mutations.
gui_related: true
gui_classification_reason: This unit preserves visible receipt degradation, list anchors, and update-source metadata.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: receipt_reference_state_and_live_list_anchors
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- reference_state
- reference-state
- live
- historical
- missing
- superseded
- target_no_longer_available
- rebased-away
- already_stopped
- already_replaced
- already_finished
- completed_before_cancel
- /containers
- /restarted
- /menu/dialog
- /update-source
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-084 - Source Control Storage Owner Boundary

```yaml
plan_unit_id: SP-084
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Source Control storage is an independent provider-agnostic SCM surface contract; storage owns durable keys and receipt joins while GUI owner docs own command placement.
gui_related: false
gui_classification_reason: This unit preserves backend storage owner/consumer boundaries for Source Control.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: source_control_storage_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- Source Control storage
- independent SCM surface contract
- GitHub-only side effect
- provider-agnostic SCM inventory
- graph/history filters
- merge-editor availability
- compare identity
- conflict presentation
- remote-aware Source Control contexts
negative_constraints:
- Source Control storage is not a GitHub-only side effect.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-085 - SCM Review GUI State Storage Boundary

```yaml
plan_unit_id: SP-085
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: SCM/review GUI state stores identity-rich review routes and summaries for compare, open/review, diff markers, heat maps, conflict heat maps, side-panel filter/focus, and preview linkage without owning hunk UI layout.
gui_related: true
gui_classification_reason: This unit preserves visible SCM review routes, banners, markers, heat maps, and preview linkage.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: scm_review_gui_state_storage_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- /open/review
- /banners
- /drifted
- /change-marker
- heat-map
- /hunk/conflict/heat-map
- /preview
- side-panel filter/focus state
- hunk UI layout
negative_constraints:
- Storage records review-state summaries without owning hunk UI layout.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-086 - File Command Receipt Payload Vocabulary

```yaml
plan_unit_id: SP-086
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: File command receipt payloads store exact workspace-node intent and typed payload vocabulary before UI localization for cmd.file.* operations, root_kind, target_dir, image_viewer, diff_review, workspace_preview, and detached_preview.
gui_related: false
gui_classification_reason: This unit preserves backend command-ref and receipt payload vocabulary.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: file_command_receipt_payload_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- cmd.file.*
- cmd.file.new_file { project_id, parent_path }
- cmd.file.new_folder { project_id, parent_path }
- cmd.file.rename { project_id, path, new_name? }
- 'cmd.file.delete { project_id, paths: string[] }'
- cmd.file.copy_full_path { project_id, path }
- 'cmd.file.copy_relative_path { project_id, path, root_kind?: "project"|"worktree" }'
- 'cmd.file.copy_nodes { project_id, paths: string[] }'
- 'cmd.file.cut_nodes { project_id, paths: string[] }'
- cmd.file.paste_nodes { project_id, target_dir }
- cmd.file.save_local_copy
- root_kind
- target_dir
- image_viewer
- diff_review
- workspace_preview
- detached_preview
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-087 - Account-Switch Projection Invalidation

```yaml
plan_unit_id: SP-087
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Effective account changes hard-refresh or invalidate account-bound projections for source_control, github_actions, docker_manager, kubernetes, receipts, blocked_state, and requested_effective while preserving historical focus refs in the event ledger.
gui_related: true
gui_classification_reason: This unit preserves user-visible account-switch invalidation, CTA reclassification, and stale row clearing.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: account_switch_projection_invalidation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- source_control
- github_actions
- docker_manager
- kubernetes
- receipts
- blocked_state
- requested_effective
- hard-refresh
- invalidate
- clear stale selected rows
- read-only or interrupted
- old account binding
- new effective account binding
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-088 - Authored Help Copy And First-Use Namespaces

```yaml
plan_unit_id: SP-088
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Help, copy, empty states, disabled-state explainers, first-use disclosure, expert variants, eli5 variants, and worktree-native SCM teaching use authored namespaces for source_control, github_actions, docker_manager, kubernetes, receipts, blocked_state, and requested_effective.
gui_related: true
gui_classification_reason: This unit preserves user-visible help, copy, empty-state, and first-use teaching namespaces.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: authored_help_copy_and_first_use_namespaces
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- source_control
- github_actions
- docker_manager
- kubernetes
- receipts
- blocked_state
- requested_effective
- empty states
- disabled-state explainers
- first-use disclosure copy
- expert variants
- eli5 variants
- what worktrees mean here
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-089 - Runtime-Backed Panel Freshness Warnings

```yaml
plan_unit_id: SP-089
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Hosted and runtime-backed panel projections persist freshness, cache/live, partial, and last-known fields; mutating stale runtime projections must record refresh-first or explicit last-known warning posture before execution.
gui_related: true
gui_classification_reason: This unit preserves visible runtime-backed freshness markers and stale mutation warning posture.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: runtime_backed_panel_freshness_warnings
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- /runtime-backed
- last refresh timestamp
- active refresh state
- stale marker
- cached
- /live
- partial
- /last-known
- refresh-first
- last-known warning
negative_constraints:
- Visible stale data is never mistaken for current execution capability.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-090 - Receipt And Storage Retention Classes

```yaml
plan_unit_id: SP-090
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Receipt and storage retention classes distinguish durable state, bounded cache, and discardable state, mapping retention preference to explicit class, policy, and anchor fields without erasing canonical receipts or state transitions.
gui_related: false
gui_classification_reason: This unit preserves backend retention class and cleanup semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: receipt_and_storage_retention_classes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- Durable state
- canonical receipts
- canonical state transitions
- bounded cache
- log tails
- watch buffers
- explorer snapshots
- retention windows
- truncation rules
- stale markers
- discardable state
- Project-delete cleanup
negative_constraints:
- Project-delete cleanup removes bounded-cache and discardable records according to class policy without erasing durable receipts or canonical state transitions.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-091 - Provider Runtime Record Family Purpose

```yaml
plan_unit_id: SP-091
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The promoted provider/runtime rewrite and updated terminal/editor model require durable record and projection families for concrete runtime surfaces, account/profile identity, entitlement attribution, and terminal layout continuity.
gui_related: false
gui_classification_reason: This unit preserves backend provider/runtime record-family purpose.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: provider_runtime_record_family_purpose
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- promoted provider/runtime rewrite
- terminal/editor model
- durable record and projection families
- concrete runtime surfaces
- account/profile identity
- entitlement attribution
- terminal layout continuity
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-092 - Core Runtime Project Provider Families

```yaml
plan_unit_id: SP-092
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Core runtime storage includes attempt, blocked, artifact, lane, worktree, concern, project, attention, provider account, entitlement, server profile, pressure, and account-switch record families with their exact v1 key templates.
gui_related: false
gui_classification_reason: This unit preserves backend runtime/project/provider key families.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: core_runtime_project_provider_families
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- attempt_record.v1:{project_id}:{node_id}:{attempt_number}
- blocked_projection.v1:{project_id}:{node_id}
- artifacts_index.v1:{project_id}:{artifact_id}
- lane_record.v1:{project_id}:{lane_id}
- lane_projection.v1:{project_id}:{lane_id}
- worktree_record.v1:{project_id}:{worktree_id}
- worktree_projection.v1:{project_id}:{worktree_id}
- concern_record.v1:{project_id}:{concern_id}
- project_summary.v1:{project_id}
- project_attention_item.v1:{project_id}:{attention_item_id}
- provider_account_record.v1:{provider_id}:{account_id}
- provider_entitlement_context_record.v1:{provider_id}:{account_id}:{billing_entity_id}
- server_profile_record.v1:{provider_id}:{connection_profile_id}
- account_pressure_episode.v1:{provider_id}:{account_id}:{episode_id}
- account_switch_event.v1:{provider_id}:{event_id}
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-093 - Terminal And Dev Session Families

```yaml
plan_unit_id: SP-093
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Terminal and dev-session record families preserve workspace tab, section, tab, pane, leaf-pane, workgroup, panel, session, command-block, and dev-session identity without collapsing terminal restore into one bottom-panel blob.
gui_related: true
gui_classification_reason: This unit preserves user-visible terminal layout continuity plus dev-session restoration identities.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: terminal_and_dev_session_families
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- terminal_workspace_state.v1:{project_id}:{workspace_tab_id}
- terminal_section_record.v1:{project_id}:{terminal_section_id}
- terminal_tab_record.v1:{project_id}:{terminal_tab_id}
- terminal_pane_record.v1:{project_id}:{terminal_pane_id}
- terminal_leaf_pane_record.v1:{project_id}:{terminal_leaf_pane_id}
- terminal_workgroup_record.v1:{project_id}:{terminal_workgroup_id}
- editor_terminal_panel_state.v1:{project_id}:{workspace_tab_id}:{editor_terminal_panel_id}
- terminal_session_record.v1:{project_id}:{terminal_session_id}
- terminal_command_block.v1:{project_id}:{terminal_session_id}:{command_block_id}
- dev_session_record.v1:{project_id}:{dev_session_id}
- bottom-panel blob
negative_constraints:
- Terminal restore must not collapse into one bottom-panel blob.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-094 - MCP And Skill Runtime Readiness Families

```yaml
plan_unit_id: SP-094
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: MCP and skill runtime readiness storage preserves server, runtime availability, tool, skill, and skill runtime readiness records with exact v1 key templates.
gui_related: false
gui_classification_reason: This unit preserves backend MCP and skill runtime readiness record families.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: mcp_and_skill_runtime_readiness_families
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- mcp_server_record.v1:{mcp_server_id}
- mcp_runtime_availability.v1:{mcp_server_id}:{provider_id}:{runtime_subject_id}
- mcp_tool_record.v1:{mcp_server_id}:{tool_id}
- skill_record.v1:{skill_id}
- skill_runtime_readiness.v1:{skill_id}:{provider_id}:{runtime_subject_id}
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-095 - Debug GHA Bundle Preview Browser Families

```yaml
plan_unit_id: SP-095
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Debug, GitHub Actions, bundle/note/revision/composer, preview, browser session, and browser profile state families remain durable storage families with exact v1 key templates.
gui_related: true
gui_classification_reason: This unit preserves user-visible debug, GHA panel, bundle review, preview, and browser state families.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: debug_gha_bundle_preview_browser_families
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- debug_investigation_record.v1:{project_id}:{investigation_id}
- gha_panel_state.v1:{project_id}
- bundle_registry.v1:{project_id}:{bundle_id}
- note_record.v1:{bundle_id}:{note_id}
- revision_run.v1:{bundle_id}:{revision_id}
- composer_prep_state.v1:{thread_id}
- preview_state.v1:{project_id}:{preview_id}
- browser_session_state.v1:{project_id}:{browser_session_id}
- browser_profile_state.v1:{project_id}:{profile_scope}
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/Skills_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-096 - Investigation Bundle Registry Identity Boundary

```yaml
plan_unit_id: SP-096
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Investigation bundle records use schema_id pm.investigation_bundle.schema.v1 plus bundle_id and schema_version for registry identity and lookup keys, while the Runtime Artifacts panel owns the full manifest field set.
gui_related: false
gui_classification_reason: This unit preserves backend investigation bundle registry identity ownership.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: investigation_bundle_registry_identity_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- schema_id = pm.investigation_bundle.schema.v1
- bundle_id
- schema_version
- Runtime Artifacts panel
- full manifest field set
- registry identity
- lookup keys
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-097 - Debug Instrumentation Lineage And Durable Authority

```yaml
plan_unit_id: SP-097
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Debug investigation records persist target binding and instrumentation_manifest lineage, but arbitrary external targets may store evidence and suggestions only and must not become durable workspace mutation authority without workspace binding.
gui_related: false
gui_classification_reason: This unit preserves backend debug instrumentation lineage and authority boundaries.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: debug_instrumentation_lineage_and_durable_authority
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- debug_investigation_record.v1:{project_id}:{investigation_id}
- instrumentation_manifest[]
- instrumentation_id
- scope
- state
- targets_or_files
- introduced_at_utc
- removed_at_utc
- restore_point_id
- cleanup_outcome
- agent_session
negative_constraints:
- Storage must not represent arbitrary external targets as durable workspace mutation authority until a workspace binding exists.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-098 - Debug Restore Identity Overlay And Relaunch Context

```yaml
plan_unit_id: SP-098
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Investigation records persist cross-surface identity links, overlay state, visible Investigation Context refs, last restore/reopen outcome, and relaunch or attach target context without flattening DAP, browser, dev-session, and runtime-artifact identities.
gui_related: true
gui_classification_reason: This unit preserves visible debug overlay state and restoration/relaunch context.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: debug_restore_identity_overlay_and_relaunch_context
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- run_id?
- thread_id?
- dev_session_id?
- browser_session_id?
- DAP/debugger identity refs
- artifact_ids[]
- artifact_refs[]
- requested and effective mode overlay
- Investigation Context
- last restore/reopen outcome
- /config/wrapper
- /debugger/profiler
- /session
negative_constraints:
- Debug restore must not rebind by guess or flatten DAP, browser, dev-session, and runtime-artifact identities into one generic debug session.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-099 - Canonical Attempt And Blocked Projection Key Migration

```yaml
plan_unit_id: SP-099
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Canonical attempt and blocked projection keys supersede older variants; older run-scoped or three-component forms are migration-read aliases only, and future redb key/value shape changes require explicit family/version or migration notes before writes begin.
gui_related: false
gui_classification_reason: This unit preserves backend key reconciliation and migration-versioning rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: canonical_attempt_and_blocked_projection_key_migration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- attempt_record.v1:{project_id}:{node_id}:{attempt_number}
- blocked_projection.v1:{project_id}:{node_id}
- blocked_reason_code
- blocked_at
- blocked_family
- approval_scope_key?
- allowed_action_ids[]
- migration-read aliases only
- blocked_projection.{run_id}.{node_id}.{blocked_sequence}
- Unversioned shape drift
- three-way concurrent key ownership
- silent redb rewrites
- replay checkpoint
negative_constraints:
- blocked_projection.v1:{project_id}:{node_id} is the only write target for blocked-state projections.
- Unversioned shape drift, three-way concurrent key ownership, and silent redb rewrites are invalid.
preserved_contractrefs: []
compatibility_only_notes:
- Older 3-component or run-scoped variants remain migration-read aliases only.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-100 - Canonical Field Minima For Attempt Terminal Dev Records

```yaml
plan_unit_id: SP-100
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Canonical field-level minima preserve attempt, terminal workspace/section/tab/pane/workgroup/session/command-block, and dev_session records, including SCM refs, terminal layout/focus/transcript anchors, and dev workflow continuity without replacing exact PTY reuse identity.
gui_related: true
gui_classification_reason: This unit preserves terminal GUI layout/focus fields and backend attempt/dev-session minima.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: canonical_field_minima_for_attempt_terminal_dev_records
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- attempt_record.v1:{project_id}:{node_id}:{attempt_number}
- terminal_workspace_state.v1
- terminal_section_record.v1
- terminal_tab_record.v1
- terminal_pane_record.v1
- terminal_leaf_pane_record.v1
- terminal_workgroup_record.v1
- editor_terminal_panel_state.v1
- terminal_session_record.v1
- terminal_command_block.v1
- dev_session_record.v1:{project_id}:{dev_session_id}
- workspace tab identity
- section/tab/pane split identity
- layout slot/order
- transcript/scrollback anchors
- dev_session_id
- terminal_session_id
negative_constraints:
- dev_session_id owns higher-level dev workflow continuity and must not replace terminal_session_id when exact PTY reuse is required.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-101 - GitHub Actions Panel State Payload

```yaml
plan_unit_id: SP-101
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: GitHub Actions panel state preserves gha_panel_state.v1:{project_id}, workflow pins, filters, refresh interval default, collapsed sections, last run focus, notification preferences, and account-sensitive invalidation semantics.
gui_related: true
gui_classification_reason: This unit preserves visible GitHub Actions panel state and notifications.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: github_actions_panel_state_payload
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- gha_panel_state.v1:{project_id}
- effective_account_id
- pinned_workflows
- filter_status
- auto_refresh_interval_ms
- '30000'
- collapsed_sections
- last_viewed_run_id
- notification_prefs
- 'notify_on_failure: bool'
- 'default: true'
- 'notify_on_success: bool'
- 'default: false'
- active effective account
negative_constraints:
- Implementations MUST invalidate pinned workflows, last-opened run/job/log focus, and admin-readiness snapshots when the active effective account no longer matches effective_account_id.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-102 - Bundle Annotation Storage Key Lineage

```yaml
plan_unit_id: SP-102
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Embedded-document bundle and annotation persistence extends the existing note model under stable notes, note, revision_run, and note_reply_index key names rather than a net-new storage subsystem or scattered GUI state.
gui_related: false
gui_classification_reason: This unit preserves backend bundle annotation key lineage.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: bundle_annotation_storage_key_lineage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- notes_index.{bundle_id}
- note.{bundle_id}.{note_id}
- note_record.v1
- revision_run.{bundle_id}.{revision_id}
- note_reply_index.{bundle_id}.{note_id}
- /revision/preview
- note_record.v1:{bundle_id}:{note_id}
- revision_run.v1:{bundle_id}:{revision_id}
- bundle/note revision lineage
negative_constraints:
- Bundle annotation persistence does not become scattered GUI state.
preserved_contractrefs: []
compatibility_only_notes:
- Existing note model and semantic key names remain compatibility lineage.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-103 - Bundle Registry Payload

```yaml
plan_unit_id: SP-103
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: bundle_registry.v1:{project_id}:{bundle_id} preserves bundle identity, project identity, created_at, status enum, files, review gate approvals, auto_merge, and note records.
gui_related: false
gui_classification_reason: This unit preserves backend bundle registry payload fields.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: bundle_registry_payload
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- bundle_registry.v1:{project_id}:{bundle_id}
- bundle_id
- project_id
- created_at
- ISO8601
- draft
- in_review
- approved
- rejected
- merged
- BundleFile[]
- required_approvals
- current_approvals
- auto_merge
- NoteRecord[]
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-104 - Note Record Annotation Payload And Reanchor Compatibility

```yaml
plan_unit_id: SP-104
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: note_record.v1 remains annotation compatibility lineage while preserving operation intent, source surface, provenance, anchor text_position/text_quote, selected_text_excerpt, last_revision_id, last_reanchor_result, and updated_anchor for targeted revision and open behavior.
gui_related: true
gui_classification_reason: This unit preserves user-visible annotation, review, and reanchor/open behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: note_record_annotation_payload_and_reanchor_compatibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- note_record.v1:{bundle_id}:{note_id}
- 'operation?: "comment" | "replace" | "insert_after" | "remove"'
- 'intent_kind?: "question" | "change_request" | "both"'
- operation_payload?
- source_surface?
- assistant_deep_plan
- interview_doc_pane
- document_viewer
- selected_text_excerpt
- anchor.text_position
- anchor.text_quote
- last_revision_id
- last_reanchor_result
- updated_anchor
negative_constraints:
- Implementations MUST preserve annotation anchor and provenance fields whenever they exist.
preserved_contractrefs: []
compatibility_only_notes:
- note_record.v1 remains the compatibility lineage for Annotations.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-105 - Targeted Revision Run Persistence

```yaml
plan_unit_id: SP-105
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'revision_run.v1:{bundle_id}:{revision_id} persists targeted revision identity, trigger, note_reply_index, status, requested/effective revision capability, annotation_ids, changes: FileChange[], and created_at: ISO8601.'
gui_related: false
gui_classification_reason: This unit preserves backend targeted revision run persistence.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: targeted_revision_run_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- revision_run.v1:{bundle_id}:{revision_id}
- revision_id
- bundle_id
- trigger
- note_reply
- resubmit
- auto_fix
- 'note_reply_index: NoteReplyRef[]'
- pending
- running
- completed
- failed
- requested_revision_capability?
- effective_revision_capability?
- schema_enforced_structured_revision
- validated_structured_revision
- chat_handoff_only
- annotation_ids[]
- 'changes: FileChange[]'
- 'created_at: ISO8601'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-106 - Composer Prep State Record

```yaml
plan_unit_id: SP-106
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: composer_prep_state.v1:{thread_id} preserves chat-side draft text, attachments, mode overlay, requested/effective persona, selection source, override owner, and saved_at for handoff continuity.
gui_related: true
gui_classification_reason: This unit preserves visible composer draft, attachment, mode, and persona handoff state.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: composer_prep_state_record
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- composer_prep_state.v1:{thread_id}
- draft_text
- attachments
- ModeOverlay?
- requested_persona
- effective_persona
- persona_selection_source
- persona_override_owner_id
- 'saved_at: ISO8601'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-107 - Selection And Browser Capture Chip Persistence

```yaml
plan_unit_id: SP-107
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Document selection and browser context capture write pending composer chips into composer_prep_state.v1:{thread_id} with typed browser selection or element attachment identity, bounded context, provenance, requested/effective target, sensitivity, capture, and failure status.
gui_related: true
gui_classification_reason: This unit preserves user-visible capture chips and chat handoff state.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: selection_and_browser_capture_chip_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- /chip/persistence
- selection-to-chat
- document-selection
- browser.context_captured
- composer_prep_state.v1:{thread_id}
- attachment_type
- browser_selection_context
- browser_element_context
- chip_id
- browser_session_id
- thread_id
- click-to-context
- Deep Plan note-only review
negative_constraints:
- Legacy browser-only or note-only storage families are not maintained as separate persistence models.
preserved_contractrefs: []
compatibility_only_notes:
- Legacy browser-only click-to-context and Deep Plan note-only review wording are compatibility labels only.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-108 - Bundle Annotation And Revision Audit Events

```yaml
plan_unit_id: SP-108
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Bundle annotation and revision audit events record note creation, status changes, revision lifecycle, selection-to-chat handoff, and blocked forwarding with durable ids, provenance, requested/effective capability, and visible reasons.
gui_related: true
gui_classification_reason: This unit preserves visible bundle annotation/revision event outcomes and blocked reasons.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: bundle_annotation_and_revision_audit_events
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- bundle.note_created
- bundle.note_status_changed
- open
- addressed
- still_open
- cannot_apply
- resolved
- bundle.revision_started
- bundle.revision_completed
- bundle.revision_interrupted
- annotation_ids[]
- requested_revision_capability
- bundle.selection_sent_to_chat
- requested_target
- effective_target
- bundle.selection_forward_blocked
- visible reason
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-109 - Preview Browser Persistence Split

```yaml
plan_unit_id: SP-109
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Legacy browser_state single-blob shapes are retired; preview, browser session, and browser profile persistence split runtime capability, permission tier, profile scope, restore policy, visible session class, viewport, scroll, zoom, dev tools, cookies, localStorage, and saveChanges writeback state.
gui_related: true
gui_classification_reason: This unit preserves visible preview/browser session state and profile persistence.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: preview_browser_persistence_split
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- browser_state.v1
- browser_state:v1
- retired
- preview_state.v1:{project_id}:{preview_id}
- browser_session_state.v1:{project_id}:{browser_session_id}
- browser_profile_state.v1:{project_id}:{profile_scope}
- requested_browser_runtime
- effective_browser_runtime
- requested_capabilities
- effective_capabilities
- permission_tier
- always_allowed
- session_granted
- explicit_confirmation
- restore_policy
- restore_intent
- restore_session
- do_not_restore
- takeover_state
- stopped_keep_browser
- viewport
- scroll_position
- zoom_level
- dev_tools_open
- localStorage_persistence
- saveChanges_writeback_state
negative_constraints:
- Browser-specific fields must not fork the canonical requested/effective naming pattern owned by Plans/Contracts_V0.md.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Legacy browser_state.v1 and browser_state:v1 single-blob shapes are retired.
owner_hints:
- Plans/storage-plan.md
```

### SP-110 - Runtime Artifact Project Index

```yaml
plan_unit_id: SP-110
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Runtime artifact index storage defines artifacts_project_state.v1 and projector.checkpoint.runtime_artifacts with artifact identity refs, projection_freshness, and projection_health for runtime artifact projection authority.
gui_related: false
gui_classification_reason: This unit preserves backend runtime artifact index and projector checkpoint records.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: runtime_artifact_project_index
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- runtime artifact index
- artifacts_project_state.v1:{project_id}
- projector.checkpoint.runtime_artifacts:{project_id}
- artifact_id
- artifact_type
- run_id?
- thread_id?
- node_id?
- attempt_id?
- worktree_id?
- lane_id?
- repo_id?
- path_ref?
- branch_ref?
- baseline_ref?
- projection_freshness
- current
- refreshing
- stale
- projection_health
- healthy
- degraded
- unavailable
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/Runtime_Artifacts_Panel.md#4. redb key and projector, Plans/WorktreeGitImprovement.md#4.1 Assistant-created worktree lifecycle'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-111 - Worktree And Lane Storage Records

```yaml
plan_unit_id: SP-111
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Worktree and lane authoritative records and projections preserve project, worktree, lane, owner thread, repo, path, branch, baseline, projection_freshness, and projection_health fields under worktree and lane v1 key families.
gui_related: false
gui_classification_reason: This unit preserves backend worktree and lane storage records and projections.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: worktree_and_lane_storage_records
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- worktree_record.v1:{project_id}:{worktree_id}
- lane_record.v1:{project_id}:{lane_id}
- worktree_projection.v1:{project_id}:{worktree_id}
- lane_projection.v1:{project_id}:{lane_id}
- project_id
- worktree_id
- lane_id
- owner_thread_id?
- repo_id?
- path_ref?
- branch_ref?
- baseline_ref?
- projection_freshness
- projection_health
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/Runtime_Artifacts_Panel.md#4. redb key and projector, Plans/WorktreeGitImprovement.md#4.1 Assistant-created worktree lifecycle'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-112 - Preview Browser Event Set

```yaml
plan_unit_id: SP-112
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Preview and browser session storage events preserve preview start/stop/refresh, browser navigation/resize, and browser.context_captured as related runtime event families.
gui_related: true
gui_classification_reason: This unit preserves user-visible preview/browser session event families.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: preview_browser_event_set
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- preview.session.started
- preview.session.stopped
- preview.session.refreshed
- browser.session.navigated
- browser.session.resized
- browser.context_captured
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-113 - Runtime Linked Core Identity Minima

```yaml
plan_unit_id: SP-113
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Runtime-linked record families carry required identity and attribution fields from project/run/node/attempt through provider/model/account/runtime health, pressure, instruction, skill, reason, transport, account-switch, provider-attempt, and usage references.
gui_related: false
gui_classification_reason: This unit preserves backend runtime-linked identity and attribution fields.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: runtime_linked_core_identity_minima
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- project_id
- run_id
- node_id?
- attempt_id?
- blocked_sequence?
- feature_seam_id?
- work_package_id?
- lane_id?
- worktree_id?
- execution_role?
- requested_platform?
- effective_platform?
- requested_provider_family_id?
- provider_family_id?
- effective_provider_family_id?
- requested_transport_kind?
- effective_transport_kind?
- requested_runtime_platform_id?
- effective_runtime_platform_id?
- requested_model?
- effective_model?
- model_provider_id?
- model_id_raw?
- model_key?
- requested_auth_mode?
- effective_auth_mode?
- requested_account_policy?
- requested_account_id?
- requested_billing_entity_id?
- effective_account_id?
- effective_billing_entity_id?
- effective_billing_entity_label?
- effective_entitlement_class?
- connection_profile_id?
- requested_connection_profile_id?
- effective_connection_profile_id?
- selectable_unit_id?
- effective_health_state?
- effective_pressure_state?
- instruction_projection_state?
- skill_projection_state?
- reason_codes[]?
- transport_backend_contract?
- account_switch_reason?
- provider_attempt_ref?
- usage_event_ref?
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-114 - Workspace Terminal Dev Session Identity Minima

```yaml
plan_unit_id: SP-114
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Runtime-linked workspace, terminal, and dev-session identity fields stay explicit for workspace tabs, terminal sections/tabs/panes/leaf panes/workgroups/panels/sessions, and dev sessions.
gui_related: true
gui_classification_reason: This unit preserves visible terminal/workspace/developer session identity fields.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: workspace_terminal_dev_session_identity_minima
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- workspace_tab_id?
- terminal_section_id?
- terminal_tab_id?
- terminal_pane_id?
- terminal_leaf_pane_id?
- terminal_workgroup_id?
- editor_terminal_panel_id?
- terminal_session_id?
- dev_session_id?
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-115 - Provider Runtime Identity Storage Rules

```yaml
plan_unit_id: SP-115
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Provider/runtime identity storage stores selectable-unit snapshots, keeps lower-level provider-session ids out of base event history, uses direct_api/acp/stream_json/headless_json backend vocabulary, reuses transport_class and ProviderTransport values, and preserves requested/effective runtime snapshots.
gui_related: false
gui_classification_reason: This unit preserves backend provider/runtime identity storage rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: provider_runtime_identity_storage_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- selectable_unit
- selectable_unit_id
- root_path
- last_usage_snapshot
- last_cooldown_snapshot
- provider-session
- attempt_id
- provider_attempt_ref?
- /debug
- direct_api
- acp
- stream_json
- headless_json
- transport_class
- ProviderTransport
- requested_provider_family_id
- effective_provider_family_id
- requested_transport_kind
- effective_transport_kind
- requested_connection_profile_id
- effective_connection_profile_id
- effective_health_state
- effective_pressure_state
- instruction_projection_state
- skill_projection_state
negative_constraints:
- Lower-level provider-session identifiers stay out of base canonical event history records.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-116 - Model Discovery Drift Entitlement Resolver Records

```yaml
plan_unit_id: SP-116
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Model discovery, provider-native drift, entitlement attribution, and resolver output records preserve model_key = model_provider_id/model_id_raw, /model_id_raw, drift-state, drift-check, effective_entitlement_class = chatgpt_plan | api_billed, and reason_codes[] semantics.
gui_related: false
gui_classification_reason: This unit preserves backend model discovery, drift, entitlement, and resolver records.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: model_discovery_drift_entitlement_resolver_records
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- model_key = model_provider_id/model_id_raw
- /model_id_raw
- drift-state
- drift-check
- /detach
- /runtime
- effective_entitlement_class = chatgpt_plan | api_billed
- reason_codes
- reason_codes[]
- selectable_unit_id
- fallback
- pressure
- capability
- policy
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-117 - Projection Freshness Health Runtime Boundaries

```yaml
plan_unit_id: SP-117
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Projection-state families expose both projection_freshness and projection_health, keep stale and degraded distinct, keep account-backed and server-profile-backed runtime records distinct, and exclude scheduler-only debug internals unless a concrete debug/audit use case proves otherwise.
gui_related: false
gui_classification_reason: This unit preserves backend projection trust, runtime record, and audit boundary semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: projection_freshness_health_runtime_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- projection_freshness
- current | refreshing | stale
- projection_health
- healthy | degraded | unavailable
- stale
- degraded
- account-backed runtime records
- server-profile-backed runtime records
- effective billing/entity context
- scheduler-only debug internals
- requested_runtime_platform_id
- effective_runtime_platform_id
- /provider-registry/scheduler-only
negative_constraints:
- stale and degraded are different states and must not collapse into one generic trust field.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-118 - Terminal Projection And Route Restoration Ownership

```yaml
plan_unit_id: SP-118
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: terminal_state:v1 may remain a GUI-facing projection name, but canonical ownership stays with terminal workspace, section, workgroup, tab, leaf-pane, panel, session, and command-block records, and route restoration resolves through canonical record identity.
gui_related: true
gui_classification_reason: This unit preserves visible terminal projection naming and route restoration behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: terminal_projection_and_route_restoration_ownership
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- terminal_state:v1
- GUI-facing projection name
- terminal workspace
- section
- workgroup
- tab
- leaf-pane
- panel
- session
- command-block records
- route restoration
- canonical record identity
negative_constraints:
- Route restoration resolves through canonical record identity, not through feature-local ad hoc payloads.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-119 - Derived Adapter Instruction Projection And Cache Lineage

```yaml
plan_unit_id: SP-119
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: PM-generated CLI adapter config/projection files, prompt injected-context artifacts, provider-facing instruction projections, and prompt/cache affinity are derived runtime inputs with source refs, projection state, and lineage; Compact Now alone does not force a new cache lineage unless it also changes logical run lineage.
gui_related: false
gui_classification_reason: This unit preserves backend derived artifact, instruction projection, and cache lineage boundaries.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: derived_adapter_instruction_projection_and_cache_lineage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
- Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/compaction_compile_readiness_matrix.json:cmp-automated-testing-acceptance
- Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0090
preserved_exact_tokens:
- PM-generated CLI adapter config
- projection files
- MUST NOT
- accounts
- MCP state
- instruction state
- skills
- injected-context
- Prompt Pipeline
- source refs
- projection state
- lineage
- Prompt/cache affinity
- logical run lineage
- Branch
- rewind
- replacement
- Compact Now
- logical run lineage
negative_constraints:
- PM-generated CLI adapter config and projection files are derived artifacts and MUST NOT become canonical ownership stores.
- Manual Compact Now does not by itself force a new cache lineage unless it also changes the logical run lineage.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-120 - Runtime Artifact Subject-First Restore Identity

```yaml
plan_unit_id: SP-120
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Storage restores generated or staged content subject-first: persisted doc:<document_id> and artifact:<artifact_id> subjects remain durable identity, while resume_url and route payloads restore navigation context around that subject, and any tier_runtime_record remains only a compatibility/current-view overlay.'
gui_related: true
gui_classification_reason: This unit preserves user-visible restore/navigation behavior for runtime artifacts.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: runtime_artifact_subject_first_restore_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0078
preserved_exact_tokens:
- doc:<document_id>
- artifact:<artifact_id>
- resume_url
- route payloads
- tier_runtime_record
- compatibility/current-view overlay
- MUST NOT
- canonical runtime identity
- joins
- restoration authority
negative_constraints:
- Any surviving tier_runtime_record MUST NOT own canonical runtime identity, joins, or restoration authority.
preserved_contractrefs: []
compatibility_only_notes:
- Any surviving tier_runtime_record is a compatibility/current-view overlay only.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-121 - Runtime Artifact Projection And Worktree Lane Index Scope

```yaml
plan_unit_id: SP-121
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Runtime-artifact indexing, durable worktree/lane identity, projection state, and projector checkpoints are storage-owned families with required artifact, repo, path, branch, and baseline fields rather than panel-owned leftovers.
gui_related: false
gui_classification_reason: This unit preserves backend storage ownership for runtime artifact, worktree, lane, and projector checkpoint families.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: runtime_artifact_projection_and_worktree_lane_index_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0078
preserved_exact_tokens:
- artifact_type
- repo_id
- path_ref
- branch_ref
- baseline_ref
- artifacts_project_state.v1:{project_id}
- projector.checkpoint.runtime_artifacts:{project_id}
- runtime artifact index
- worktree record
- lane record
- Runtime-artifact indexing
- Projection state
- projector checkpoints
- panel-owned leftovers
negative_constraints:
- Projection state and projector checkpoints must be first-class rather than panel-owned leftovers.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-122 - Canonical Terminal Persistence Key Families

```yaml
plan_unit_id: SP-122
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage-plan is the canonical source for decomposed terminal persistence key families from terminal_session.v1 through terminal_color.v1:global, with terminal_state:v1 retained only as a FinalGUISpec subset alias.
gui_related: true
gui_classification_reason: This unit preserves visible terminal persistence, layout, font, and color state key families.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: canonical_terminal_persistence_key_families
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0079
preserved_exact_tokens:
- terminal_session.v1:{terminal_session_id}
- terminal_layout.v1:{project_id}
- terminal_history.v1:{terminal_session_id}
- terminal_profile.v1:{profile_name}
- terminal_env.v1:{project_id}
- terminal_cwd.v1:{terminal_session_id}
- terminal_scroll.v1:{terminal_session_id}
- terminal_font.v1:global
- terminal_color.v1:global
- terminal_state:v1
- subset alias
- full decomposition
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md'
compatibility_only_notes:
- FinalGUISpec section 15.1 references terminal_state:v1 as a subset alias.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-123 - Terminal Project Section And Tab Records

```yaml
plan_unit_id: SP-123
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Terminal project, section, and tab records preserve project settings, restore flags, dock state/zone, detached bounds, tab order, labels, active state, layout_style, and review_only state.
gui_related: true
gui_classification_reason: This unit preserves visible terminal project, section, tab, layout, and detached-window state.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: terminal_project_section_and_tab_records
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0080
preserved_exact_tokens:
- terminal_project_state
- project_id
- settings version
- last-opened time
- restore flag
- terminal_sections
- terminal_section_id
- order_index
- dock_state
- dock_zone
- visibility
- detached_window_bounds
- terminal_tabs
- terminal_tab_id
- layout_style
- review_only
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-124 - Terminal Pane Session And Restore Identity Split

```yaml
plan_unit_id: SP-124
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Terminal pane, session, and command-block records keep pane/session attachment, shell profile, cwd_snapshot, runtime/restore state, command-block metadata, and the section/tab/pane/session identity split; durable restore reconstructs layout and bindings before runtime liveness validation.
gui_related: true
gui_classification_reason: This unit preserves visible terminal panes, session bindings, labels, layout style, and restore flow.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: terminal_pane_session_and_restore_identity_split
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0080
preserved_exact_tokens:
- terminal_panes
- terminal_pane_id
- terminal_sessions
- terminal_session_id
- terminal_command_blocks
- terminal_session_record
- cwd_snapshot
- worktree path
- section/tab/pane/session
- sections, tabs, panes, labels, layout style, and session bindings
- runtime code verify
- attached terminal_session_id
negative_constraints:
- Terminal storage MUST preserve the section/tab/pane/session identity split rather than collapsing it into flat bottom-panel metadata.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-125 - Terminal Transcript Boundary And No-Fake-Liveness Rule

```yaml
plan_unit_id: SP-125
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Terminal restore records carry an explicit transcript-vs-command-block boundary; restored panes may be historical, review-limited, or history-unavailable, and storage must not mark them live unless terminal runtime liveness is revalidated.
gui_related: false
gui_classification_reason: This unit preserves backend terminal transcript retention and liveness truth rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: terminal_transcript_boundary_and_no_fake_liveness_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0080
preserved_exact_tokens:
- transcript-vs-command-block boundary
- Transcript chunks
- append-oriented
- scrollback anchors
- command blocks
- metadata-only
- transcript retention
- no-fake-liveness
- historical
- review-limited
- history-unavailable
- MUST NOT mark it live unless liveness is revalidated
negative_constraints:
- Storage MUST NOT mark a restored pane live unless liveness is revalidated by the terminal runtime.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-126 - Terminal Route Open Identity Refs And Dev-Session Lookups

```yaml
plan_unit_id: SP-126
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage owns durable joins for tab/pane/session and tab/pane/session/dev-session lookups; routing and open selectors persist terminal and optional dev_session_id refs and recover by those refs rather than labels, titles, or legacy cmd.dev.* hidden-gap assumptions.
gui_related: false
gui_classification_reason: This unit preserves backend terminal route/open identity and lookup semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: terminal_route_open_identity_refs_and_dev_session_lookups
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0080
preserved_exact_tokens:
- /tab/pane/session
- /tab/pane/session/dev-session
- /routing
- /open
- terminal_section_id
- terminal_tab_id
- terminal_pane_id
- terminal_session_id
- dev_session_id
- labels
- last visible titles
- legacy cmd.dev.*-only hidden-gap assumptions
negative_constraints:
- Route/open recovery must use persisted refs instead of labels, last visible titles, or legacy cmd.dev.*-only hidden-gap assumptions.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes:
- legacy cmd.dev.*-only hidden-gap assumptions are compatibility-only context, not canonical recovery authority.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-127 - Terminal GUI Settings Persistence And Terminology Boundary

```yaml
plan_unit_id: SP-127
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Terminal GUI persistence settings are separate from live PTY state: storage owns durable keys and migration behavior, FinalGUISpec owns Settings > Terminal GUI grouping, theming discoverability, shortcuts, and labels, and terminal terminology cross-refs stay explicit.'
gui_related: true
gui_classification_reason: This unit preserves visible Terminal GUI settings grouping, theming discoverability, shortcuts, labels, and storage-backed settings.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: terminal_gui_settings_persistence_and_terminology_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0080
preserved_exact_tokens:
- Terminal GUI
- /persistence/settings
- live PTY state
- project/workspace defaults
- per-tab overrides
- font and color references
- transcript-retention settings
- shell profile refs
- Settings > Terminal GUI
- /theming/discoverability
- shortcuts
- user-facing labels
- terminal_section_id
- terminal_tab_id
- terminal_pane_id
- terminal_session_id
- dev_session_id
- Plans/Glossary.md
- /IDEs research
negative_constraints:
- Storage must not drift back into ambiguous "terminal tab" wording.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-128 - Terminal Storage Key Naming And Forward-Only Migration

```yaml
plan_unit_id: SP-128
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Terminal/storage key migrations are forward-only and monotonic: new fields are additive first, destructive renames require same-section migration notes, stable semantic names are preserved, and owner docs must define terminology mappings rather than overloading shared fields.'
gui_related: false
gui_classification_reason: This unit preserves backend storage key naming and migration rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: terminal_storage_key_naming_and_forward_only_migration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0081
preserved_exact_tokens:
- forward-only
- monotonic
- additive first
- destructive renames
- migration note
- stable semantic names
- session_id
- thread_id
- run_id
- message_id
- step_id
- tool_call_id
- approval_id
- provider_session_id
- terminal_session_id
- dev_session_id
- owner doc
- mapping explicitly
- silently overloading
negative_constraints:
- If two subsystems need different terminology, the owner doc must define the mapping explicitly rather than silently overloading a shared field name.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-129 - Owner-Derived Lock Path And Read-Only Fallback

```yaml
plan_unit_id: SP-129
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Storage owns lock-path derivation: active pm.lock is root-derived from logical-root or safe-local fallback-derived durable-store path, legacy hardcoded lock strings are migration evidence only, and failed lock acquisition opens read-only viewer mode without creating a second project-local lock.'
gui_related: false
gui_classification_reason: This unit preserves backend durable-store lock-path derivation and read-only fallback rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_derived_lock_path_and_read_only_fallback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0082
preserved_exact_tokens:
- lock-path
- pm.lock
- root-derived
- logical-root
- safe-local
- fallback-derived
- durable-store path
- /.puppet-master/pm.lock
- <project>/.puppet-master/pm.lock
- migration evidence only
- /read-only
- viewer mode
- second project-local lock
negative_constraints:
- PM MUST NOT create a second project-local lock beside the owner-derived path.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Commands_System.md'
compatibility_only_notes:
- Legacy hardcoded /.puppet-master/pm.lock and <project>/.puppet-master/pm.lock strings are migration evidence only.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-130 - Run Completed Usage Snapshot Boundary

```yaml
plan_unit_id: SP-130
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage owns run.completed.usage as an optional bounded run-completion usage snapshot derived from canonical usage.event records, not as a replacement for the usage event ledger.
gui_related: false
gui_classification_reason: This unit preserves backend usage snapshot storage and ledger boundary semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: run_completed_usage_snapshot_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0082
preserved_exact_tokens:
- run.completed.usage
- optional run-completion usage snapshot
- bounded snapshot
- canonical usage.event records
- usage event ledger
negative_constraints:
- run.completed.usage is not a replacement for the usage event ledger.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Commands_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-131 - Same-Directory Atomic Durable-Store Rewrite

```yaml
plan_unit_id: SP-131
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: All non-append durable-store rewrites use same-directory temporary files, fsync, and rename/promote; append-only seglog writers remain subject to durable flush and corruption detection, and replacement-write failures are hard errors without direct-overwrite fallback.
gui_related: false
gui_classification_reason: This unit preserves backend durable storage rewrite atomicity and failure rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: same_directory_atomic_durable_store_rewrite
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0083
preserved_exact_tokens:
- same-directory temporary files
- <target>.tmp.<random>
- fsync
- rename/promote
- Append-only seglog/event writers
- durable flush
- corruption-detection
- Per-session temp directories
- same-filesystem atomic rename
- hard error
- direct overwrite
negative_constraints:
- Per-session temp directories MUST NOT be used for replacement writes that rely on same-filesystem atomic rename.
- Failure to create the temp file, fsync it, or rename/promote it is a hard error; PM MUST NOT silently fall back to direct overwrite.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-132 - Storage Root Selection And Durable Authority

```yaml
plan_unit_id: SP-132
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage-root selection prefers explicit configured roots, valid PUPPET_MASTER_DATA_DIR overrides, project-scoped durable roots, app-level durable roots, and session temp roots only for temporary data; durable state survives process restart unless the owning contract says otherwise.
gui_related: false
gui_classification_reason: This unit preserves backend storage-root selection and durable authority rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: storage_root_selection_and_durable_authority
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0083
preserved_exact_tokens:
- storage-root
- Explicit user-configured storage root
- PUPPET_MASTER_DATA_DIR
- Project-scoped durable root
- App-level durable root
- Session temp root
- temporary or disposable
- Durable state MUST survive process restart
- Remote-mode projects
- owning authority
- temp mirrors
negative_constraints:
- A feature may write to a session temp root only if its contract explicitly classifies the artifact as temporary or disposable.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-133 - Durable-Store Safety Unsafe Filesystem And Migration Backups

```yaml
plan_unit_id: SP-133
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Durable-store safety detects unsafe-filesystem classes, fails closed or enters read-only mode when needed, preserves safe-local fallback lineage, and requires backup-before-any-migration-step before validation, schema rewrite, file promotion, destructive cleanup, or rollback-sensitive repair.
gui_related: false
gui_classification_reason: This unit preserves backend durable-store safety, unsafe-filesystem handling, and migration backup requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: durable_store_safety_unsafe_filesystem_and_migration_backups
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0083
preserved_exact_tokens:
- cross-filesystem temp paths
- atomic rename
- Janitor cleanup
- active durable targets
- preserved checkpoints
- fail closed
- structured error
- unsafe-filesystem
- NFS
- remote mounts
- same-directory atomic rename semantics
- safe local durable-store fallback
- /read-only
- backup-before-any-migration-step
- schema rewrite
- file promotion
- destructive cleanup
- rollback-sensitive repair
negative_constraints:
- Never rewrite durable files via cross-filesystem temp paths when the final correctness contract depends on atomic rename.
- Janitor cleanup MUST NOT touch active durable targets or preserved checkpoints.
- When a durable store is unavailable, writers fail closed and surface a structured error instead of downgrading silently to temp-only persistence.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-134 - Active Durable-Store Lock Identity

```yaml
plan_unit_id: SP-134
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The active durable-store lock is keyed by storage_root, authority_scope, and store_family; session or run ids are insufficient lock identities, and store families with independent recovery or retention policies must not share a lock merely because they live under the same root.
gui_related: false
gui_classification_reason: This unit preserves backend durable-store lock identity rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: active_durable_store_lock_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0084
preserved_exact_tokens:
- (storage_root, authority_scope, store_family)
- Session or run ids
- durable-store lock identities
- independent recovery
- retention policies
- same root
negative_constraints:
- Session or run ids are not sufficient durable-store lock identities by themselves.
- Store families that require independent recovery or retention policies must not share a lock identity merely because they live under the same root.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-135 - Bounded Collection Retention Contracts

```yaml
plan_unit_id: SP-135
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Live storage-managed collections must declare TTL, max-cardinality, or both; bounded-collections canon is satisfied when owner sections name family, bound type/source, and retention/eviction notes for active maps, auth caches, LSP maps, queues, event records, safe points, temp artifacts, and stale rewrite remnants.
gui_related: false
gui_classification_reason: This unit preserves backend bounded collection retention contracts.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: bounded_collection_retention_contracts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0085
preserved_exact_tokens:
- TTL
- /max-cardinality
- /long-lived
- bounded-collections
- Active assistant and child-session state maps
- max_total_active_agents
- MCP connection and auth-handle caches
- LSP session and host/root attachment maps
- Projector and analytics work queues
- seglog.event_appended
- Run/thread retention policy
- legal-hold
- preserved-run anchors
- Safe points
- snapshot metadata
- undo indexes
- Temp artifacts and stale rewrite remnants
- .tmp.*
- abandoned scratch artifacts
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/LSPSupport.md'
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/LSPSupport.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Temp artifacts and stale rewrite remnants retain their literal row label as bounded-collection material, not a new storage owner.
owner_hints:
- Plans/storage-plan.md
```

### SP-136 - Regex Index Byte Build Concurrency And Mmap Contract

```yaml
plan_unit_id: SP-136
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Regex-index projector rules require byte-level u8 extraction without Unicode decoding, shared build-thread-pool concurrency with one project build slot and FIFO queueing, and platform mmap deletion/open semantics using memmap2 share_mode(0x7) on Windows and inode-by-fd safety on Linux/macOS.
gui_related: false
gui_classification_reason: This unit preserves backend regex-index byte, concurrency, and mmap file-handle contracts.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: regex_index_byte_build_concurrency_and_mmap_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0086
preserved_exact_tokens:
- Regex-index indexing model byte contract
- MUST NOT decode content to Unicode
- frequency-table computation
- n-gram extraction
- byte-level
- u8
- common build thread pool
- one build slot
- FIFO
- memmap2
- share_mode(0x7)
- FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE
- /macOS
- inode-by-fd
negative_constraints:
- Implementers MUST NOT decode content to Unicode for frequency-table computation or n-gram extraction.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/FileSafe.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-137 - Projector Consumption Order And JSONL Mirror Policy

```yaml
plan_unit_id: SP-137
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Projectors advance in canonical seglog order from redb checkpoints, write only owned projections, commit checkpoints after durable writes, and maintain JSONL mirrors as derived, rebuildable, sequence-ordered files that never backfill seglog.
gui_related: false
gui_classification_reason: This unit preserves backend projector consumption ordering and JSONL mirror policy.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: projector_consumption_order_and_jsonl_mirror_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0086
preserved_exact_tokens:
- canonical seglog order
- segment_generation
- segment_name
- byte_offset
- last_seq
- JSONL mirror
- derived
- human-readable
- rebuildable
- authoritative over seglog
- canonical event envelope
- sequence order
- deterministically
- stale mirror file
- PM MUST NOT backfill seglog from JSONL
- legal-hold
negative_constraints:
- PM MUST NOT backfill seglog from JSONL.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/FileSafe.md'
compatibility_only_notes: []
stale_retired_dispositions:
- A missing or stale mirror file is repaired by replaying the corresponding seglog range.
owner_hints:
- Plans/storage-plan.md
```

### SP-138 - Tantivy And Projection Rebuild Boundaries

```yaml
plan_unit_id: SP-138
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Tantivy indices, analytics rollups, and projections rebuild from seglog or the owning projector canonical source range; projector checkpoints are durable ownership boundaries, partial writes do not advance checkpoints, and schema-version rebuilds clear only derived projection state.
gui_related: false
gui_classification_reason: This unit preserves backend projection rebuild and checkpoint ownership boundaries.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: tantivy_and_projection_rebuild_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0086
preserved_exact_tokens:
- Tantivy indices
- analytics rollups
- projections
- seglog
- canonical source range
- owning projector
- Projector checkpoints
- durable ownership boundaries
- partial projection writes
- schema-version change
- derived projection state
- canonical seglog
- unrelated redb families
negative_constraints:
- Partial projection writes do not advance checkpoints.
- Rebuild after schema-version change clears only the derived projection state being regenerated; the canonical seglog and unrelated redb families remain untouched.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-139 - Projector Checkpoints Runtime Recovery And Usage Carry-Through

```yaml
plan_unit_id: SP-139
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Projector checkpoints encode resume state without duplicate semantic writes and are atomic with projector durability, but runtime/executor checkpoint marker events and safe-point lineage records in seglog remain required before mutation-capable execution or restore flows continue; run.completed.usage carries optional usage snapshot attribution from usage.event records.
gui_related: false
gui_classification_reason: This unit preserves backend projector checkpoint, runtime recovery, and usage carry-through boundaries.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: projector_checkpoints_runtime_recovery_and_usage_carry_through
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0086
preserved_exact_tokens:
- checkpoints
- duplicate semantic writes
- sequence order
- file mtime
- UI refresh timing
- projector durability
- runtime recovery checkpoint markers
- safe-point lineage records
- seglog
- mutation-capable execution
- restore flows
- canonical runtime checkpoint marker stream
- projector checkpoints alone are insufficient
- run.completed.usage
- run.completed
- usage.event
- attribution tuple
negative_constraints:
- Projector checkpoints are not a substitute for runtime recovery checkpoint markers.
- Projector checkpoints alone are insufficient for mutation/recovery replay.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Runtime_Artifacts_Panel.md'
compatibility_only_notes:
- run.completed.usage carry-through here is linked to SP-130 and does not create a second usage snapshot owner.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-140 - Analytics Refresh Trigger And UI Rollup Read Boundary

```yaml
plan_unit_id: SP-140
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Analytics scans may run periodically or on-demand without blocking the main UI; on-demand refresh keeps prior rollups visible, writes rollup keys in redb, and dashboard consumers read rollups rather than seglog directly.
gui_related: true
gui_classification_reason: This unit preserves user-visible Usage view refresh behavior and dashboard read boundaries.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: analytics_refresh_trigger_and_ui_rollup_read_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0087
preserved_exact_tokens:
- Periodic
- every 5 minutes
- on-demand
- Usage view
- background task
- separate thread
- main UI
- previously written rollups visible
- rollups
- usage_5h.{platform}
- usage_7d.{platform}
- tool_latency.{window}
- tool_usage.{window}
- tool_usage_meta.{window}
- no direct seglog read for dashboard
negative_constraints:
- Analytics scans must not block the main UI.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-141 - Analytics Scan Range Computation And Checkpoint Semantics

```yaml
plan_unit_id: SP-141
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Analytics scans read seglog or JSONL mirror in order over canonical windows, compute usage, tool latency, error rate, and tool usage rollups, exclude denied/FileSafe-blocked calls from tool_usage, and checkpoint last scanned sequence or timestamp idempotently.
gui_related: false
gui_classification_reason: This unit preserves backend analytics scan, computation, and checkpoint semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: analytics_scan_range_computation_and_checkpoint_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0087
preserved_exact_tokens:
- Last N hours
- at least 7d
- tool_usage.7d
- usage.event
- run.completed
- tool.invoked
- 5h
- 24h
- 7d
- 1h
- p50
- p95
- tool_name
- success = false
- tool.denied
- FileSafe blocks
- last scanned up to seq X
- last scanned timestamp
- Idempotent
negative_constraints:
- tool.denied events and FileSafe blocks do not contribute to tool_usage.{window}.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-142 - Assistant Worktree Event Naming And Projection Keys

```yaml
plan_unit_id: SP-142
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Assistant worktree events use underscore canonical names, normalize dot-form aliases before projection, bind to thread/worktree redb projection keys and worktree records, and keep background enqueue fields optional without inventing worktree context.
gui_related: false
gui_classification_reason: This unit preserves backend assistant worktree event naming and projection key ownership.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: assistant_worktree_event_naming_and_projection_keys
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0088
preserved_exact_tokens:
- chat.thread_created
- chat.thread_archived
- chat.thread_deleted
- chat.thread.worktree_bound
- chat.thread_worktree_bound
- worktree_
- ADDITIVE
- thread_state:{thread_id}:worktree_binding
- worktree_binding_reverse:{worktree_id}
- worktree_record.v1:{project_id}:{worktree_id}
- thread_state:{thread_id}:persona_override
- worktree_projection.v1:{project_id}:{worktree_id}
- run.background_enqueued
- worktree_path
- branch_name
negative_constraints:
- Absent worktree fields on run.background_enqueued are treated as main-project context rather than inventing worktree context.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-143 - Assistant Worktree Lifecycle Merge PR And Pre-Merge Payloads

```yaml
plan_unit_id: SP-143
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Assistant worktree lifecycle, merge, PR, and pre-merge test events preserve exact chat.thread_worktree_* event names, minimum payload fields, PR failure phase enum push | api, and shorthand expansion only to the three pre-merge test event types.
gui_related: false
gui_classification_reason: This unit preserves backend assistant worktree event payload schemas.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: assistant_worktree_lifecycle_merge_pr_and_pre_merge_payloads
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0088
preserved_exact_tokens:
- chat.thread_worktree_bound
- chat.thread_worktree_unbound
- chat.thread_worktree_renamed
- chat.thread_worktree_create_failed
- chat.thread_worktree_merged
- chat.thread_worktree_merge_failed
- chat.thread_worktree_pr_created
- chat.thread_worktree_pr_failed
- chat.thread_worktree_pre_merge_test_started
- chat.thread_worktree_pre_merge_test_passed
- chat.thread_worktree_pre_merge_test_failed
- thread_id
- worktree_id
- branch_name
- worktree_path
- binding_origin
- target_branch
- strategy
- result_commit_sha
- pr_url
- pr_number
- phase
- push | api
- user_override
- chat.thread_worktree_pre_merge_test_started/passed/failed
negative_constraints:
- The ADDITIVE family shorthand expands only to chat.thread_worktree_pre_merge_test_started, chat.thread_worktree_pre_merge_test_passed, and chat.thread_worktree_pre_merge_test_failed.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-144 - Worktree Safe-Point Snapshot Carry-Through

```yaml
plan_unit_id: SP-144
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Projectors store assistant worktree events with the canonical envelope, and safe-point creation records for worktree-bound execution include worktree_id, worktree_path, branch_name, and HEAD_sha before mutation-capable merge or test operations continue.
gui_related: false
gui_classification_reason: This unit preserves backend safe-point snapshot carry-through before mutation-capable worktree operations.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: worktree_safe_point_snapshot_carry_through
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0088
preserved_exact_tokens:
- canonical envelope
- safe-point creation records
- worktree-bound execution
- worktree_id
- worktree_path
- branch_name
- HEAD_sha
- mutation-capable merge
- test operations continue
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-145 - Core Store Event Schema And Redb Checklist Preservation

```yaml
plan_unit_id: SP-145
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The implementation checklist is preserved as PlanUnit readiness metadata for core storage roots, seglog writer, event schemas, redb schema, migration runner, and version bump, not as executable work nodes.
gui_related: false
gui_classification_reason: This unit preserves backend storage checklist readiness without creating executable tasks.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: core_store_event_schema_and_redb_checklist_preservation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0089
preserved_exact_tokens:
- Implementation checklist
- storage/seglog
- storage/redb
- storage/jsonl
- storage/tantivy
- seglog writer
- envelope format
- ts
- seq
- type
- payload
- chat.message
- chat.thread_created
- run.started
- run.completed
- usage.event
- tool.invoked
- tool.denied
- runtime checkpoint-marker events
- review_rules
- migration runner
- version bump
negative_constraints:
- Checklist prose is PlanUnit readiness metadata, not WorkNodes or executable build tasks.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-146 - Projector Checkpoint Marker And Analytics Checklist Preservation

```yaml
plan_unit_id: SP-146
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The checklist preserves projector requirements for JSONL mirror, Tantivy, redb checkpoints, runtime checkpoint-marker events before mutation or restore, and analytics rollups including tool_usage.{window}.
gui_related: false
gui_classification_reason: This unit preserves backend projector, checkpoint-marker, and analytics checklist readiness.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: projector_checkpoint_marker_and_analytics_checklist_preservation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0089
preserved_exact_tokens:
- seglog -> JSONL mirror
- seglog -> Tantivy
- Persist projector checkpoints
- checkpoints
- runtime checkpoint-marker events
- mutation-capable execution resumes
- safe-point restore continues
- stored runtime checkpoint
- analytics scan
- 5h/7d
- tool latency
- tool_usage
- tool_usage.{window}
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-147 - Chat Editor And Usage Wiring Checklist Preservation

```yaml
plan_unit_id: SP-147
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The checklist preserves chat persistence, editor state, and Usage/dashboard wiring as storage integration readiness, including assistant-chat-design, FileManager section 2.9, usage-feature, and Usage view triggers.
gui_related: true
gui_classification_reason: This unit preserves user-visible chat, editor, and Usage/dashboard storage wiring expectations.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: chat_editor_and_usage_wiring_checklist_preservation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0089
preserved_exact_tokens:
- Wire chat persistence
- thread list
- thread content
- assistant-chat-design.md
- Wire editor state
- open tabs
- active tab
- scroll/cursor
- FileManager.md §2.9
- Wire Usage/dashboard
- Usage/dashboard
- Usage view opens
- usage-feature.md
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-148 - Usage Attribution And Run Completed Snapshot Checklist

```yaml
plan_unit_id: SP-148
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Usage checklist coverage requires Assistant/Interview usage events with thread and parent lineage, hidden/background model work usage.event records, and optional run.completed usage snapshots with canonical attribution fields while per-request canon remains usage.event.
gui_related: false
gui_classification_reason: This unit preserves backend usage attribution and run completion snapshot checklist semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: usage_attribution_and_run_completed_snapshot_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0089
preserved_exact_tokens:
- usage.event with thread_id and parent lineage
- Assistant
- Interview
- thread_id
- parent_run_id
- hidden/background model work
- title generation
- summaries
- compaction helpers
- tool-triggered model calls
- run.completed
- input_tokens
- output_tokens
- cache_read_input_tokens
- cache_creation_input_tokens
- reasoning_tokens
- total_tokens
- cost_microdollars
- provider_id
- model_id
- account_id?
- billing_entity_id?
- entitlement_class?
- cache_hit?
- cache_strategy?
- 'cost_microdollars: u64'
- canonical per-request data remains usage.event
negative_constraints:
- run.completed optional usage snapshot does not replace canonical per-request usage.event data.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-149 - Chat Interview Runtime Identity Consumer Boundary

```yaml
plan_unit_id: SP-149
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Assistant and Interview surfaces persist thread-local state, activity traces, and reviewable history, but they consume shared runtime identity projection and do not become canonical owners of runtime identity field names.
gui_related: false
gui_classification_reason: This unit preserves backend owner/consumer boundaries for chat and Interview runtime identity.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: chat_interview_runtime_identity_consumer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0090
preserved_exact_tokens:
- Assistant
- Interview
- thread-local state
- activity traces
- reviewable history
- canonical owner of runtime identity
- Shared runtime identity projection
- chat
- widgets
- audit
- delegated execution
negative_constraints:
- Assistant and Interview surfaces do not become canonical owner of runtime identity.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Personas.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-150 - Shared Runtime Identity Field Vocabulary

```yaml
plan_unit_id: SP-150
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Shared runtime identity storage preserves requested/effective persona, account binding, operational identity, effective account/provider/project fields, and required account/auth vocabulary for requested account, execution role, credential, login, and auth realm.
gui_related: false
gui_classification_reason: This unit preserves backend shared runtime identity field vocabulary.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: shared_runtime_identity_field_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0091
preserved_exact_tokens:
- requested_persona
- effective_persona
- requested_account_binding
- operational_identity
- effective_account_label
- effective_provider_identity
- effective_project_id
- requested_account_id
- requested_account_policy
- effective_account_id
- execution_role
- account_id
- credential_ref
- login
- auth_realm
- requested account
- operational identity
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/Multi-Account.md#4. Data model, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules)'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-151 - Runtime Snapshot Alias Rejection And Surface Consumption Boundary

```yaml
plan_unit_id: SP-151
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Runtime identity fields are additive, _id aliases such as requested_persona_id and effective_persona_id are not canonical runtime snapshot fields, and chat/GUI surfaces consume the same stored names while permission snapshots and usage preserve effective_account_id and execution_role.
gui_related: true
gui_classification_reason: This unit preserves user-visible chat/GUI consumption boundaries and permission carry-through fields.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: runtime_snapshot_alias_rejection_and_surface_consumption_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0091
preserved_exact_tokens:
- additive
- _id
- requested_persona_id
- effective_persona_id
- canonical runtime snapshot fields
- chat and GUI surfaces
- stored field names
- local variants
- permission snapshots
- usage surfaces
- effective_account_id
- execution_role
negative_constraints:
- requested_persona_id and effective_persona_id are not canonical runtime snapshot fields.
preserved_contractrefs:
- 'ContractRef: Plans/Multi-Account.md#4. Data model, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules)'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-152 - Web Runtime Identity And No-Silent-Cross-Fallback Disclosure

```yaml
plan_unit_id: SP-152
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Web-facing runtime records use shared runtime snapshot vocabulary for web/search/extract/research/crawl/map operations; history/detail inspectors read frozen requested/effective snapshots, adapter-layer provider recommendations stay provisional, and provider/runtime selection preserves no-silent-cross-fallback disclosure.
gui_related: true
gui_classification_reason: This unit preserves user-visible web runtime identity disclosure and fallback explanation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: web_runtime_identity_and_no_silent_cross_fallback_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0091
preserved_exact_tokens:
- /web
- search
- extract
- research
- crawl
- map
- /history/detail
- frozen requested/effective identity snapshots
- provider settings row structure
- provider ordering
- /algorithm
- account-vs-API-key grouping
- adapter-layer provisional
- no-silent-cross-fallback
- account-pool
- provider-local retries
- fallback loops
- /account/role
- projection freshness/health
- honored, skipped, clamped, or changed
negative_constraints:
- Auth surfaces must not hide provider-local retries or fallback loops behind generic success events.
preserved_contractrefs:
- 'ContractRef: Plans/Multi-Account.md#4. Data model, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules)'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-153 - Questionnaire State Draft And Status Persistence

```yaml
plan_unit_id: SP-153
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Question and questionnaire persistence stores thread-scoped draft, answer, and final submission state as bounded structured data with canonical status values, QuestionItem field names, draft_value, response_kind, validation_state, and answer source metadata.
gui_related: false
gui_classification_reason: This unit preserves backend questionnaire state and schema persistence.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: questionnaire_state_draft_and_status_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0092
preserved_exact_tokens:
- Question and questionnaire persistence
- thread-scoped draft state
- answer state
- final submission state
- bounded structured data only
- answered | submitted | dismissed | timed_out | unavailable
- draft_value
- response_kind
- validation_state
- /questionnaire
- QuestionItem
- question_id
- question
- allow_freeform
- multi_select
- 'default_values?: string[]'
- single_question
- unavailable
- dismissed
negative_constraints:
- Questionnaire persistence must not invent chat-local aliases.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-154 - Question Card Composer Control Persistence Boundary

```yaml
plan_unit_id: SP-154
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Shared question-card persistence covers single and multi-question flows with draft, incomplete, ready_to_submit, submitted, and paused states; composer send/resend controls remain UI controls while storage records state transition and active-run linkage.
gui_related: true
gui_classification_reason: This unit preserves user-visible question-card and composer control persistence boundaries.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: question_card_composer_control_persistence_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0092
preserved_exact_tokens:
- Shared question-card persistence
- single-question
- multi-question
- draft
- /draft
- incomplete
- ready_to_submit
- submitted
- paused
- /send
- /resend
- state transition
- active-run linkage
- rewind later work
- pause follow
- restore jump-to-latest context
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Composer controls may expose /send and /resend, but storage records only state transition and active-run linkage.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-155 - Plan Deep Plan Normalized TODO Projection Contract

```yaml
plan_unit_id: SP-155
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Plan and Deep Plan project to a normalized TODO list with a named Q&A loop, locked TODO schema/status, explicit revision states, structural-edit gating after approval, bounded revision history, and chat.plan_todo_updated for durable TODO mutations.
gui_related: true
gui_classification_reason: This unit preserves user-visible Plan/Deep Plan TODO projection and panel behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: plan_deep_plan_normalized_todo_projection_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0093
preserved_exact_tokens:
- Plan
- Deep Plan
- normalized TODO list
- Q&A loop
- locked TODO item schema/status set
- revision states
- structural-edit gating after approval
- bounded revision history
- chat.plan_todo_updated
- todoread
- todowrite
- ask/plan mode
- Deep Plan edits
negative_constraints:
- chat.plan_todo_updated must have an explicit owner-contract definition for durable normalized TODO mutation.
- todoread must not survive as a source_surface mutation source.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3 Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-156 - TODO Schema Status Revision And Legacy Progress Vocabulary

```yaml
plan_unit_id: SP-156
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: TODO storage preserves item schema fields, item status enum, plan-level superseded state, structural edit meaning, TODO tool behavior, Deep Plan resync rule, and legacy XV2 inline progress strings as plan-level visibility labels rather than TODO item statuses.
gui_related: false
gui_classification_reason: This unit preserves backend TODO schema, status, revision, and legacy label semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: todo_schema_status_revision_and_legacy_progress_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0093
preserved_exact_tokens:
- todo_id
- title
- summary
- status
- dependencies[]
- order_index
- owner_hint
- verification_hint
- notes
- pending | in_progress | completed | blocked | skipped
- superseded (plan-level only)
- draft
- approved
- executing
- Structural edits = adding / removing / reordering TODO items
- todowrite can create, reorder, update statuses/notes
- todoread returns current normalized list for active thread/run
- Remove todowrite from blanket ask/plan mode auto-deny
- editing Deep Plan markdown
- BEFORE execution begins
- Superseded TODO N/M
- Superseded TODO 5/5
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3 Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events'
compatibility_only_notes:
- Legacy XV2 inline progress strings are plan-level visibility labels for superseded plans, not TODO item statuses.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-157 - TODO Panel Verification And Compact Progress Boundary

```yaml
plan_unit_id: SP-157
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The Assistant chat TODO panel shows verification_hint per item, compact inline progress examples, and durable plan refresh behavior so auto-use heuristic changes emit chat.plan_todo_updated before execution and do not silently replace the current panel.
gui_related: true
gui_classification_reason: This unit preserves visible TODO panel verification hints and compact progress behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: todo_panel_verification_and_compact_progress_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0093
preserved_exact_tokens:
- verification_hint
- plan-level summary
- Inline progress
- Started TODO 2/5
- Completed TODO 2/5
- Blocked TODO 3/5
- Skipped TODO 4/5
- Superseded TODO 5/5
- auto-use heuristic
- draft or refreshed plan state
- chat.plan_todo_updated
- current plan panel
- durable event
negative_constraints:
- Inline progress must not duplicate the full checklist on every turn.
- Auto-use heuristic changes must not silently replace the current plan panel without a durable event.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3 Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-158 - Durable TODO Mutation Event And Source-Of-Truth Boundary

```yaml
plan_unit_id: SP-158
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Durable TODO mutation events persist plan/todo ids, changed field, old/new values, and mutation source, while the Assistant chat plan panel remains the visible source-of-truth and storage owns durable normalized TODO projection consumed by related surfaces.
gui_related: true
gui_classification_reason: This unit preserves visible TODO source-of-truth behavior and backend durable mutation event payloads.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: durable_todo_mutation_event_and_source_of_truth_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0093
preserved_exact_tokens:
- chat.plan_todo_updated
- '{ plan_id: string, todo_id: string, field: string, old_value: any, new_value: any, source: "agent" | "user" }'
- 'source: "agent" | "user"'
- /source-of-truth
- /todo/tool
- todoread
- todowrite
- question cards
- web activity cards
- assistant runtime disclosures
- /consumer
- pre-approval structural changes
- new TODO revision event
negative_constraints:
- After execution begins, reorder or status corrections create a new TODO revision event instead of mutating the approved plan in place.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3 Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-159 - Activity Transparency Bridge And Blocked Payload Owner

```yaml
plan_unit_id: SP-159
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Activity transparency payloads carry canonical runtime bridge fields and receipt refs; storage owns blocked/denied payload persistence, adapter-selection payloads, approval scope linkage, and immutable historical snapshots without allowing chat, GUI, or web-tool local variants.
gui_related: true
gui_classification_reason: This unit preserves visible activity transparency payloads and blocked/denied recovery context.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: activity_transparency_bridge_and_blocked_payload_owner
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0094
preserved_exact_tokens:
- Activity transparency payloads
- canonical runtime bridge fields
- receipt refs
- blocked_reason_code
- allowed_action_ids[]
- approval scope linkage
- immutable historical snapshots
- Adapter-selection payloads
- requested/effective adapter identity
- adapter_selection_reason
- subordinate provider bridge refs
- chat, GUI, or web-tool consumers
- local variants
negative_constraints:
- Chat, GUI, and web-tool consumers must not invent local variants for adapter-selection payloads.
preserved_contractrefs:
- 'ContractRef: Plans/Tools.md#8.0 Event payloads (seglog), Plans/Runtime_Artifacts_Panel.md#Cross-Surface Operation Receipt Linkage Addendum (2026-03-12)'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-160 - Long-Running Progress And Question TODO Carry-Through

```yaml
plan_unit_id: SP-160
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Long-running activity transparency persists progress_event payloads and cancellation fields, while question/TODO/runtime state, source-route lineage, runtime receipts, and activity payloads carry through storage rather than stale consumer-only variants.
gui_related: true
gui_classification_reason: This unit preserves user-visible long-running progress, cancellation, and question/TODO activity state.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: long_running_progress_and_question_todo_carry_through
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0094
preserved_exact_tokens:
- progress_event
- operation phase
- detail text
- completed/total counts
- elapsed timing
- estimated remaining time
- cancellation
- partial-result state
- '### 4.2'
- '### 4.3'
- '### 4.4'
- /TODO/runtime
- question state
- TODO state
- runtime receipts
- stale consumer-only variants
- 'cancelled: true'
- pages_completed
- pages_total
- elapsed_ms
- estimated_remaining_ms
- /questionnaire
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/Tools.md#8.0 Event payloads (seglog), Plans/Runtime_Artifacts_Panel.md#Cross-Surface Operation Receipt Linkage Addendum (2026-03-12)'
compatibility_only_notes: []
stale_retired_dispositions:
- Stale consumer-only variants are retired in transfer metadata rather than copied into storage canon.
owner_hints:
- Plans/storage-plan.md
```

### SP-161 - Command HITL Terminal And Subagent Activity Snapshots

```yaml
plan_unit_id: SP-161
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Command child-run, approval/HITL, watch-mode, terminal command, and subagent task records persist execution mode, requested/effective Persona, permission snapshots, approval ladder, operation-card lineage, terminal handoff refs, command labels, and child-agent outcomes as durable activity state.
gui_related: true
gui_classification_reason: This unit preserves visible command, HITL, terminal handoff, watch-mode, and subagent activity history.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: command_hitl_terminal_and_subagent_activity_snapshots
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0094
preserved_exact_tokens:
- Command child-run storage
- '### 4.2 Command execution model'
- '### 4.3 Persona selection'
- requested/effective Persona
- child/subagent overlay inheritance
- once/session/always/deny
- source
- layer
- permission snapshots
- Rollback lineage
- Watch-mode
- background-card type
- direct-recovery-action
- approval-card scope
- /audit/projectors
- /collapsible
- canonical PTY
- Open in Terminal
- Show Terminal
- sandbox state
- /allowlist
- terminal_session_id
- command block
- cmd.terminal.open
- cmd.terminal.show
- cmd.terminal.new_tab
- aggressive-by-default task launches
negative_constraints:
- Watch-mode and long-running commands do not create a separate background-card type.
- Open in Terminal and Show Terminal do not imply cmd.terminal.new_tab.
preserved_contractrefs:
- 'ContractRef: Plans/Tools.md#8.0 Event payloads (seglog), Plans/Runtime_Artifacts_Panel.md#Cross-Surface Operation Receipt Linkage Addendum (2026-03-12)'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-162 - Web Operation Inline Ref Blob And Payload Meta Storage

```yaml
plan_unit_id: SP-162
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Web-operation storage splits inline activity payload fields from ref/blob payloads, uses blob-ref naming and payload.meta child fields for replay/audit joins, binds cache storage to the web content cache and TTL table, and preserves common and per-tool child fields without duplicating full result bodies.
gui_related: false
gui_classification_reason: This unit preserves backend web-operation payload storage, blob refs, and replay/audit joins.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: web_operation_inline_ref_blob_and_payload_meta_storage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0094
preserved_exact_tokens:
- web-operation inline vs ref/blob split
- Inline activity payload fields
- Ref/blob payloads
- extracted page bodies
- research synthesis
- full source sets
- crawl inventories
- map graph payloads
- blob-ref
- payload.meta
- web content cache
- TTL
- web_operation
- web_input_preview
- support_tier
- execution_path
- requested_adapter_id?
- effective_adapter_id?
- adapter_selection_reason?
- projection_freshness?
- projection_health?
- provider_fallback_occurred
- provider_fallback_summary?
- source_count?
- sources_ref?
- result_quality_hint?
- warnings_count?
- error_code?
- query_preview
- /candidate
- results_count
- websearch
- webextract
- webresearch
- webcrawl
- webmap
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-163 - Web Operation Execution Path Fallback And Display Label Boundary

```yaml
plan_unit_id: SP-163
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Web activity storage preserves execution_path and provider_fallback_summary so replay, history, audit, compact cards, result cards, and provider-named labels agree on the route used without forking runtime identity names.
gui_related: true
gui_classification_reason: This unit preserves visible web activity labels and backend route/fallback replay boundaries.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: web_operation_execution_path_fallback_and_display_label_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0094
preserved_exact_tokens:
- 'execution_path?: string'
- provider_search_native
- provider_extract_native
- pm_search_plus_site_reader
- pm_site_reader
- provider_firecrawl_scrape
- pm_fetch_fallback
- provider_firecrawl_agent
- pm_research_composed
- rate-limit/outage fallback
- provider_fallback_summary?
- same-operation fallback chain
- chat activity label
- Searching Web
- Extracting Site
- /model/account-policy
- result cards
- history rows
- audit logs
negative_constraints:
- Persisted history must not fork runtime identity names from web-specific display labels.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-164 - Activity Payload Runtime Bridge Field Table

```yaml
plan_unit_id: SP-164
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Activity payload records preserve runtime bridge fields for node, attempt, lane, package, execution role, account, operational identity, provider attempt, usage event, inspection refs, structured web_input, result quality, and provenance badge values.
gui_related: false
gui_classification_reason: This unit preserves backend activity payload field-table semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: activity_payload_runtime_bridge_field_table
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0094
preserved_exact_tokens:
- activity payload
- node_id
- attempt_id
- lane_id
- package_id
- execution_role
- effective_account_id
- operational_identity
- provider_attempt_ref
- usage_event_ref
- detail_ref
- report_ref
- web_input
- Structured web-operation input object
- result_quality_hint
- search_snippets_only
- extracted_pages
- site_reader_pages
- research_synthesis
- provenance_badge
- site_reader
- search_snippet
- site_extract
- crawl_result
- map_result
- provider_scrape
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions'
compatibility_only_notes:
- provider_scrape is persisted only with the proposed-extension caveat from Plans/Contracts_V0.md.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-165 - Receipt Refs Route Open Precedence And Permission Carry-Through

```yaml
plan_unit_id: SP-165
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Receipt refs remain inspection and provenance links rather than route/open surrogates, bridge-field precedence stays explicit, and effective actor/account identity survives into activity payloads.
gui_related: false
gui_classification_reason: This unit preserves backend receipt ref, route/open precedence, and permission carry-through semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: receipt_refs_route_open_precedence_and_permission_carry_through
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0094
preserved_exact_tokens:
- receipt refs
- inspection and provenance links
- route/open surrogates
- Inspection refs
- route/open contracts
- Bridge-field precedence
- effective actor
- account identity
- activity payloads
negative_constraints:
- Receipt refs remain inspection and provenance links rather than route/open surrogates.
- Bridge-field precedence must be explicit rather than inferred.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-166 - Inline Visualizer Source Metadata And Sandbox Bridge Storage

```yaml
plan_unit_id: SP-166
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Inline visualizer persistence stores only PM-managed source, metadata, outputs, render config, and approved host-mediated bridge metadata for sandboxed visual-module cards, not arbitrary bridge calls, direct DOM reach-through, client heap state, or generic send-message payloads.
gui_related: true
gui_classification_reason: This unit preserves user-visible inline visualizer source, render, and sandbox bridge persistence.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: inline_visualizer_source_metadata_and_sandbox_bridge_storage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0095
preserved_exact_tokens:
- Inline visualizer persistence
- PM-managed source
- metadata
- PM-owned outputs
- source fragment
- title
- type/kind
- version
- HTML/JS/CSS
- /JS
- width
- height
- /design
- /auto-height
- visual-module
- open-link
- in-module
- send-message
- /interactive
- /scripts
- version-pinned
- integrity-recorded
- policy-allowed
negative_constraints:
- Arbitrary bridge calls, direct DOM reach-through, and client heap state are not durable storage.
- Question-flow embedded visuals persist PM-managed draft-state outputs instead of generic send-message bridge payloads.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-167 - Inline Visualizer Replay Snapshot Fallback And Display State

```yaml
plan_unit_id: SP-167
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Inline visualizer replay and export review re-render from persisted source, title/type metadata, render config, and PM-managed state outputs, using screenshot or snapshot fallback only when re-render is impractical and storing visible fallback/error state as PM-owned display state.
gui_related: true
gui_classification_reason: This unit preserves visible inline visualizer replay, snapshot fallback, and error-state behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: inline_visualizer_replay_snapshot_fallback_and_display_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0095
preserved_exact_tokens:
- screenshot
- /snapshot
- scroll-back
- thread reload/export review
- re-renders from the persisted source fragment
- title/type metadata
- render config
- PM-managed state outputs
- screenshot fallback
- arbitrary JS heap state is not persisted
- replay or reload
- visible fallback and error state
- PM-owned display state
negative_constraints:
- Arbitrary JS heap state is not persisted.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-168 - Persistence Gap Owner-Aligned State Boundary

```yaml
plan_unit_id: SP-168
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Remaining persistence gaps for the rewrite shell resolve through explicit owner-aligned state rather than feature-local ad hoc blobs.
gui_related: false
gui_classification_reason: This unit preserves backend storage owner alignment for remaining persistence gaps.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: persistence_gap_owner_aligned_state_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0096
preserved_exact_tokens:
- persistence gaps
- rewrite shell
- owner-aligned state
- feature-local ad hoc blobs
negative_constraints:
- Remaining persistence gaps are not addressed by feature-local ad hoc blobs.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-169 - Unsaved Editor Recovery Required Shared-Buffer Lifecycle

```yaml
plan_unit_id: SP-169
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Unsaved editor recovery is required MVP live shared-buffer storage: checklist delivery cannot downgrade it to later, recovery starts on first dirty buffer capture, ends only on save/discard/resolution, and multi-view editor surfaces share recovery, restore, and redo lineage.'
gui_related: true
gui_classification_reason: This unit preserves user-visible unsaved editor recovery, banner, restore, and conflict lifecycle.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: unsaved_editor_recovery_required_shared_buffer_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0097
preserved_exact_tokens:
- Unsaved editor recovery
- live shared-buffer storage contract
- /checklist
- /later
- first dirty buffer state
- /ends
- save, discard, or explicit recovery resolution
- multi-view
- /editor
- /restore
- /redo
- recover-unsaved
- required MVP behavior
- local and remote-backed buffers
- remote-backed recovery banners
- Recovered local edits — remote destination not yet synchronized
- save success
- effective destination
negative_constraints:
- The checklist may track delivery work, but it must not downgrade recover-unsaved to /later.
- Save success is only claimed after the effective destination confirms the write.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-170 - Editor Recovery Key Snapshot Restore And Conflict Handling

```yaml
plan_unit_id: SP-170
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Editor recovery stores editor_state.v1:{project_id}:{file_path_hash}, cursor, scroll, selection ranges, undo stack reference, unsaved changes flag, and session-restore/conflict-handling behavior that reloads state before focus and shows diffs on disk changes.
gui_related: true
gui_classification_reason: This unit preserves user-visible editor state restoration and conflict resolution behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: editor_recovery_key_snapshot_restore_and_conflict_handling
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0097
preserved_exact_tokens:
- editor_state.v1:{project_id}:{file_path_hash}
- cursor position
- scroll offset
- selection ranges
- undo stack reference
- unsaved changes flag
- recovery trigger
- session restore
- restoring focus
- conflict handling
- file changed on disk
- show a diff
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-171 - Requested Effective Runtime Visibility Distinctions

```yaml
plan_unit_id: SP-171
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The persistence model stores requested versus effective browser runtime/capabilities, LSP enablement/server set, freshness versus health versus write availability, and restore outcomes for historical Search, LSP, browser, and editor recovery surfaces.
gui_related: true
gui_classification_reason: This unit preserves user-visible requested/effective runtime disclosure and restoration honesty.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: requested_effective_runtime_visibility_distinctions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0098
preserved_exact_tokens:
- requested vs effective browser runtime/capabilities
- requested vs effective LSP enablement
- attached-server set
- freshness vs health vs write availability
- remote-backed projections
- restore outcome
- historical Search
- LSP
- browser
- editor recovery surfaces
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-172 - Requested Effective Key Patterns And Freshness Triad Disposition

```yaml
plan_unit_id: SP-172
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Requested and effective resource state persist under resource_type requested/effective key patterns; the local freshness triad current/refreshing/stale remains a source preservation note here and must not expand into full projection-health canon beyond the owning sections.
gui_related: false
gui_classification_reason: This unit preserves backend requested/effective state key patterns and limited freshness-triad disposition.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: requested_effective_key_patterns_and_freshness_triad_disposition
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0098
preserved_exact_tokens:
- '{resource_type}_requested.v1:{scope}:{id}'
- '{resource_type}_effective.v1:{scope}:{id}'
- requested state
- effective state
- projection freshness
- current
- refreshing
- stale
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions:
- projection freshness is persisted as current, refreshing, or stale in this span; do not expand it as full projection-health canon here.
owner_hints:
- Plans/storage-plan.md
```

### SP-173 - Search And Source Control Projection Separation

```yaml
plan_unit_id: SP-173
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Search state and Source Control state keep separate projection families: search_projection stores query intent/results/filter/scope, sc_projection stores repo projections, compare origins, review context, branch/diff/staging/commit draft, and editor markers consume rather than own those projections.'
gui_related: true
gui_classification_reason: This unit preserves visible Search and Source Control projection separation and editor marker consumption.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: search_and_source_control_projection_separation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0099
preserved_exact_tokens:
- Search state
- text query intent
- query snapshots
- Source Control state
- repo projections
- compare origins
- review context
- diff-local search
- project Search state
- editor markers
- Source Control/LSP projections
- search_projection.v1:{project_id}
- sc_projection.v1:{project_id}
- last query
- results
- filter state
- scope
- branch
- diff state
- staged files
- commit message draft
negative_constraints:
- Diff-local search does not get persisted as project Search state.
- Editor markers consume Source Control/LSP projections but do not become a substitute owner.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-174 - Source Control Review And Conflict Projection State

```yaml
plan_unit_id: SP-174
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Source Control review and conflict persistence stores compare targets, review filters, generated-file visibility, review comments/notes, stale target downgrade refs, conflict presentation settings, and command resolution events without persisting conflict content.
gui_related: true
gui_classification_reason: This unit preserves visible Source Control review/conflict filters, compare state, and command outcomes.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: source_control_review_and_conflict_projection_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0099
preserved_exact_tokens:
- sc_projection.v1:{project_id}
- last compare target
- left/right compare targets
- review filters
- ignore-whitespace
- file filter
- collapse-unchanged
- generated-file visibility
- review context
- local review-comments/notes state
- cmd.source_control.open_review
- cmd.source_control.review.open/swap/filter
- cmd.source_control.set_compare_target
- cmd.source_control.toggle_generated_filter
- stale compare targets
- stale-target references
- replacement baselines
- Conflict assistant persistence
- conflict presentation mode
- open external merge tool preference
- auto-open first conflicted file toggle
- cmd.source_control.open_conflict
- cmd.source_control.open_merge_editor
- cmd.source_control.resolve_conflict_side
- cmd.source_control.mark_conflict_resolved
negative_constraints:
- Source Control conflict commands record resolution events and blocked-state handoff outcomes, not conflict content.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Stale compare targets are retained only long enough to explain the downgrade and offer alternate pivots.
owner_hints:
- Plans/storage-plan.md
```

### SP-175 - GitHub Actions Receipt To Code Correlation Projection

```yaml
plan_unit_id: SP-175
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: GitHub Actions to-code correlation persistence stores project state and receipt projections for run/job/step focus, log focus, diff targets, failing-file hints, heuristic toggles, confidence thresholds, related diffs/worktrees, and evidence-labeled log-to-file candidates.
gui_related: true
gui_classification_reason: This unit preserves visible GitHub Actions to-code focus, related-diff/worktree pivots, and uncertainty labels.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: github_actions_receipt_to_code_correlation_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0099
preserved_exact_tokens:
- github_actions.project_state.{project_id}
- receipt projections
- last-opened run/job/step focus
- /job/step log focus
- preferred diff target
- auto-open failing file hints
- show heuristic matches toggle
- correlation confidence threshold
- branch-diff preference
- auto-open related worktree preference
- workflow run/job/step receipts
- commit range
- changed files
- branch refs
- worktree refs
- failing-step metadata
- candidate related diffs
- candidate related worktrees
- cmd.github.actions.open_run
- cmd.github.actions.open_job
- cmd.github.actions.open_step_logs
- cmd.github.actions.open_related_diff
- cmd.github.actions.open_related_worktree
- confidence and uncertainty labels
negative_constraints:
- Log-to-file correlation candidates remain evidence with confidence and uncertainty labels; they do not become canonical source truth unless a stronger owner record confirms the mapping.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-176 - Host-Aware LSP Lifecycle Restart Budget And No Local Fallback

```yaml
plan_unit_id: SP-176
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Host-aware LSP persistence stores lifecycle and restart budgets by host-aware session key, discloses current/refreshing/stale/degraded/unavailable state, forbids silent local fallback for remote-mode projects, and deterministically replays attached documents after transport or sync loss.
gui_related: false
gui_classification_reason: This unit preserves backend host-aware LSP lifecycle, restart, and recovery semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: host_aware_lsp_lifecycle_restart_budget_and_no_local_fallback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0100
preserved_exact_tokens:
- LSP lifecycle
- restart budgets
- host-aware session key
- current
- refreshing
- stale
- degraded
- unavailable
- remote-mode projects
- silent local fallback path
- /transport
- /sync-loss
- host-aware LSP session
- deterministic URI order
- persisted restart budget
- backoff state
- Degraded
- user retry
negative_constraints:
- Remote-mode projects never restore into a silent local fallback path.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md'
compatibility_only_notes: []
stale_retired_dispositions:
- restart/reconnect preserves enough state to disclose whether a projection is current, refreshing, stale, degraded, or unavailable.
owner_hints:
- Plans/storage-plan.md
```

### SP-177 - LSP Protocol Trace Inspection Buffer Boundary

```yaml
plan_unit_id: SP-177
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Each host-aware LSP session keeps a bounded protocol/state trace buffer for operational/debug inspection only, exposing session key, root, current state, last error, restart/backoff, and protocol trace reveal action without becoming canonical app history.
gui_related: true
gui_classification_reason: This unit preserves user-visible LSP trace reveal action and debug inspection state.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: lsp_protocol_trace_inspection_buffer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0100
preserved_exact_tokens:
- bounded protocol/state trace buffer
- operational/debug inspection only
- canonical app history
- session key
- root
- current state
- last error
- restart attempt/backoff
- recent protocol trace reveal action
negative_constraints:
- The bounded protocol/state trace buffer is not canonical app history.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-178 - LSP Server State Key Recovery And Restart Count Persistence

```yaml
plan_unit_id: SP-178
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: LSP server state persists under lsp_server_state.v1:{host_id}:{server_id}:{root_hash} with server config, capabilities snapshot, last known status, restart count, recovery path, and persisted restart counts for stable budget enforcement and degraded-state disclosure.
gui_related: false
gui_classification_reason: This unit preserves backend LSP server state keys, recovery, and restart count persistence.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: lsp_server_state_key_recovery_and_restart_count_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0100
preserved_exact_tokens:
- lsp_server_state.v1:{host_id}:{server_id}:{root_hash}
- server config
- capabilities snapshot
- last known status
- restart count
- recovery path
- session restore
- persisted config
- persisted restart counts
- budget enforcement
- degraded-state disclosure
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-179 - Seglog Redb Checkpoint Projector Recovery

```yaml
plan_unit_id: SP-179
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage recovery rules preserve seglog last-complete-record recovery, redb backup or canonical-seglog rebuild, bounded projector commits, checkpoint loss rebuild, and projector panic/crash behavior that restarts from the last good checkpoint without advancing it.
gui_related: false
gui_classification_reason: This unit preserves backend seglog, redb, checkpoint, and projector recovery rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: seglog_redb_checkpoint_projector_recovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0101
preserved_exact_tokens:
- seglog corruption or partial write
- Append-only with flush
- last-complete-record recovery
- CRC32
- corrupt record -> skip + recovery event
- redb corruption
- Restore from backup
- canonical seglog
- Projector falls behind
- bounded batches
- successful commit
- Checkpoint lost
- last retained segment
- Projector panic or crash
- Do not advance checkpoint
- last good checkpoint
negative_constraints:
- 'Projector panic or crash: Do not advance checkpoint; restart from last good checkpoint.'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileSafe.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-180 - User-Visible Storage Error Lock And Boot Recovery

```yaml
plan_unit_id: SP-180
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: User-visible storage problem handling keeps analytics scans in the background with freshness state, surfaces disk/storage errors, prevents half-migrated stores, enforces active durable-store lock-path/pm.lock read-only mode, and emits storage.boot_recovery after boot-time janitor cleanup.
gui_related: true
gui_classification_reason: This unit preserves user-visible storage error, read-only, lock, and boot recovery behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: user_visible_storage_error_lock_and_boot_recovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0101
preserved_exact_tokens:
- Analytics scan blocks UI
- background
- last committed rollup
- freshness state
- Disk full / storage I/O
- user-facing error
- stop unsafe writes
- storage I/O policy
- Migration failure
- previous version intact
- half-migrated store
- Multiple app instances
- exclusive flock
- lock-path
- pm.lock
- logical storage root
- safe-local fallback
- /read-only
- notify the user
- Boot-time janitor
- .tmp.*
- lock freshness
- storage.boot_recovery
negative_constraints:
- Do not open a half-migrated store.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileSafe.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-181 - Storage API LRU And Shutdown Hygiene

```yaml
plan_unit_id: SP-181
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage API and hygiene rules require append/redb writes to return structured Result values without silent swallow, cap in-memory file records at 10,000 with lazy rebuild, and close the DB/redb handle in the shutdown sequence before process exit.
gui_related: false
gui_classification_reason: This unit preserves backend API, LRU, and shutdown hygiene rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: storage_api_lru_and_shutdown_hygiene
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0101
preserved_exact_tokens:
- append()
- redb write operations
- structured Result
- no silent swallow
- File record LRU eviction
- 10,000
- rebuild lazily on access
- DB / redb shutdown hygiene
- Close the DB handle
- shutdown sequence
- process exit
negative_constraints:
- append() / redb write operations return structured Result; no silent swallow.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileSafe.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-182 - Compaction And Backup Restore Authority

```yaml
plan_unit_id: SP-182
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Compaction and backup/restore enhancements preserve sequence order, exclude the active segment, keep replay/projector correctness intact, snapshot canonical stores at one shared boundary, validate checksums before restore, and rebuild JSONL/Tantivy disposable projections instead of treating them as authoritative.
gui_related: false
gui_classification_reason: This unit preserves backend compaction and backup/restore authority rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: compaction_and_backup_restore_authority
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0102
preserved_exact_tokens:
- Compaction
- §2.2.1
- Optional for MVP
- MUST preserve seq
- exclude the active segment
- replay/projector correctness
- Backup/restore
- Scheduled backups
- canonical stores
- one shared boundary
- validate checksums before restore
- rebuild disposable projections
- JSONL/Tantivy
- authoritative
negative_constraints:
- Backup/restore must rebuild disposable projections after restore rather than treating them as authoritative.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-183 - Export Replica Per-Project Seglog Event Registry Enhancements

```yaml
plan_unit_id: SP-183
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Enhancement coverage preserves export from seglog or JSONL mirror, embedded redb read-replica non-applicability, per-project seglog default behavior, event schema registry ownership, and optional streaming projector correctness boundaries.
gui_related: false
gui_classification_reason: This unit preserves backend enhancement routing and owner boundaries.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: export_replica_per_project_seglog_event_registry_enhancements
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0102
preserved_exact_tokens:
- Export
- thread or run history
- JSONL/JSON
- seglog
- JSONL mirror
- thread_id
- Read replicas
- embedded redb
- server-backed store
- dashboard/Usage reads
- Per-project seglog
- §2.1.2
- app-global
- Event schema registry
- payload validation
- doc generation
- Plans/Contracts_V0.md
- top-level envelope
- Streaming projector
- Optional richer UX path
- committed projector state
- durable checkpoints
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-184 - Seglog Redb Jsonl Tantivy Build Phases

```yaml
plan_unit_id: SP-184
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The implementation order heading and phases 1-4 remain PlanUnit readiness metadata for seglog foundation, redb/schema, JSONL mirror, and Tantivy chat index build phases, with storage directories, namespaces, checkpoints, and exit criteria preserved without creating WorkNodes.
gui_related: false
gui_classification_reason: This unit preserves backend phased implementation order as readiness metadata only.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: seglog_redb_jsonl_tantivy_build_phases
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0103
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0104
preserved_exact_tokens:
- Implementation order and testing
- Phase 1 -- seglog foundation
- storage/seglog
- storage/redb
- storage/jsonl
- storage/tantivy
- seglog writer only
- envelope format
- seq
- flush
- rotation
- Phase 2 -- redb and schema
- settings
- sessions
- runs
- checkpoints
- editor
- rollups
- review_rules
- migrations runner
- 'Phase 3 -- projector: seglog → JSONL mirror'
- JSONL mirror
- 'Phase 4 -- projector: seglog → Tantivy (chat index)'
- chat.message
- chat.thread_created
- thread_id
- content
- role
- ts
- message_id
negative_constraints:
- Phased implementation order is PlanUnit readiness metadata, not WorkNodes or executable build tasks.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-185 - Analytics Chat Editor Usage Wiring Phase

```yaml
plan_unit_id: SP-185
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Phases 5-6 preserve analytics scan and rollups plus chat, editor, and Usage wiring expectations, including tool_usage, p50/p95/error_count, redb rollups, Usage/dashboard reads, usage.event, run.completed, and end-to-end visible flow.
gui_related: true
gui_classification_reason: This unit preserves user-visible Usage/dashboard, chat, editor, and end-to-end wiring expectations.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: analytics_chat_editor_usage_wiring_phase
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0104
preserved_exact_tokens:
- Phase 5 -- analytics scan and rollups
- analytics scan job
- periodic or on-demand
- 5h/7d usage rollups
- tool latency
- tool_usage
- per-tool count
- p50/p95
- error_count
- Plans/Tools.md §8.4
- redb rollups namespace
- scan checkpoint
- UI
- test reader
- Phase 6 -- wire chat, editor, and Usage
- assistant-chat-design
- FileManager.md §2.9
- Usage/dashboard
- usage-feature.md
- usage.event
- run.completed
- Full flow works
- create thread
- send message
- Usage view shows rollups
- editor state persists
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-186 - Storage Phase Dependency Ordering

```yaml
plan_unit_id: SP-186
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage phase dependencies require seglog writer before projectors, redb schema/migrations and checkpoints before projector checkpoint use, rollups before analytics writes, Tantivy before chat search UX, and chat/editor/Usage wiring after storage primitives exist.
gui_related: false
gui_classification_reason: This unit preserves backend dependency ordering and startup prerequisites.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: storage_phase_dependency_ordering
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0104
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0105
preserved_exact_tokens:
- Dependencies
- seglog writer before any projector
- redb open + schema + migrations
- checkpoints
- rollups
- projectors must not start until redb is open and checkpoints namespace exists
- analytics scan must not run until rollups namespace
- scan checkpoint key
- current segment may be empty
- position 0
- Dependency graph
- Event type schemas
- Tantivy chat index
- Chat/editor/Usage wiring
negative_constraints:
- Projectors must not start until redb is open and checkpoints namespace exists.
- Analytics scan must not run until rollups namespace and scan checkpoint key exist.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-187 - Durable Store Startup Lock And Fallback Order

```yaml
plan_unit_id: SP-187
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Startup order resolves app data root, probes durable-store safety including unsafe-filesystem/NFS posture, derives lock-path, acquires pm.lock before writers, enters read-only mode if held, opens stores and projectors in order, and routes fallback metadata to safe local storage while preserving logical-root lineage and diagnostics.
gui_related: true
gui_classification_reason: This unit preserves user-visible startup diagnostics/read-only posture and backend lock/fallback order.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: durable_store_startup_lock_and_fallback_order
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0106
preserved_exact_tokens:
- Startup order
- app data root
- environment override optional
- unsafe-filesystem
- NFS
- safe local fallback
- lock-path
- pm.lock
- /read-only viewer mode
- storage/seglog
- storage/redb
- storage/jsonl
- storage/tantivy
- Open redb
- run migrations
- Open the seglog writer
- Start projectors
- analytics schedulers
- per-project index services
- durable-store fallback
- session snapshot metadata
- lineage
- user-visible diagnostics
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-188 - Regex Index Startup Recovery

```yaml
plan_unit_id: SP-188
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Regex-index startup recovery scans regex_index directories after project context, selects and validates gen-{N} candidates, verifies index_meta, checksums, lookup.bin and git anchors, creates IndexSnapshot when ready, serves raw ripgrep on no_index or corrupt snapshots, and deletes corrupt/orphaned generations during recovery.
gui_related: true
gui_classification_reason: This unit preserves user-visible Search fallback and backend regex-index recovery behavior.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: regex_index_startup_recovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0106
preserved_exact_tokens:
- Regex-index startup recovery
- regex_index/
- grep
- Search-panel regex query
- gen-{N}/
- index_meta.json
- xxh3 checksums
- lookup.bin
- mmap
- anchor_sha
- git cat-file -t {anchor_sha}
- IndexSnapshot
- ready
- no_index
- raw ripgrep
- checksum or metadata mismatch
- corrupt generation directory
- full rebuild
- orphaned or partial generations
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Architecture_Invariants.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-189 - Shutdown Flush Close And Cache Retention

```yaml
plan_unit_id: SP-189
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Shutdown signals projectors, cancels in-flight regex builds, flushes and closes seglog, closes redb, releases the active durable-store lock only after final writer flush, and leaves valid regex snapshots and reusable remote cache state in place.
gui_related: false
gui_classification_reason: This unit preserves backend shutdown, flush, lock-release, and cache-retention rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: shutdown_flush_close_and_cache_retention
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0106
preserved_exact_tokens:
- Shutdown
- Signal projectors to stop
- flush outputs
- Cancel in-flight regex builds
- partial-generation cleanup
- Flush and close the seglog writer
- Close redb
- Release the active durable-store lock
- final writer flush
- last valid regex snapshot
- reusable remote cache state
- ordinary shutdown does not evict caches
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-190 - Single Writer And Compatibility Prompt State Protection

```yaml
plan_unit_id: SP-190
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Concurrency rules keep seglog a single-writer stream, regex-index publication single-writer per project with ArcSwap reader snapshots, and compatibility prompt/session files such as kv.json or prompt-history.jsonl protected against last-write-wins overwrite unless migrated or locked with lineage and conflict evidence.
gui_related: false
gui_classification_reason: This unit preserves backend single-writer and compatibility prompt/session state protection.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: single_writer_and_compatibility_prompt_state_protection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0106
preserved_exact_tokens:
- Concurrency and single-writer rules
- Seglog remains a single-writer stream
- Regex-index publication
- single-writer per project
- ArcSwap
- partially-written generations
- Multi-instance prompt/session state
- last-write-wins flat files
- kv.json
- prompt-history.jsonl
- canonical durable store
- atomic write
- file-locking semantics
- session/run lineage
- conflict evidence
negative_constraints:
- Multi-instance prompt/session state is not allowed to degrade into last-write-wins flat files.
- Concurrent instances must never overwrite prompt-history or key-value state without conflict evidence.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes:
- kv.json and prompt-history.jsonl are compatibility state until migrated or protected by atomic write plus file-locking semantics.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-191 - First Run Storage Initialization

```yaml
plan_unit_id: SP-191
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: First-run storage initialization creates missing storage directories, creates the first seglog segment on append, initializes redb schema_version/meta namespace, treats missing projector checkpoints as start-from-beginning, and leaves empty seglog projectors with no work.
gui_related: false
gui_classification_reason: This unit preserves backend first-run initialization behavior.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: first_run_storage_initialization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0107
preserved_exact_tokens:
- First run / empty state
- storage/*
- storage/seglog/
- first segment on first append
- checkpoint "none"
- offset 0
- schema_version
- meta namespace
- initial migration
- schema_version to 1
- redb is created on first open
- Projectors
- start from beginning of seglog
- first segment
- seglog is empty
- no work
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-192 - Analytics Missing Checkpoint Full Scan

```yaml
plan_unit_id: SP-192
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: When the analytics scan checkpoint is missing, storage scans from seq 0, paginates large seglogs in 1000-event batches, yields between batches, writes analytics:scan_checkpoint to last processed seq, resumes subsequent runs from the checkpoint, and preserves analytics.scan_batch_size default 1000.
gui_related: false
gui_classification_reason: This unit preserves backend analytics first-run checkpoint recovery and batching.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: analytics_missing_checkpoint_full_scan
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0107
preserved_exact_tokens:
- Analytics Scan When Checkpoint Missing (Resolved)
- seq 0
- beginning of seglog
- full scan is safe and idempotent
- 1000 events per batch
- yielding between batches
- event loop
- analytics:scan_checkpoint
- last processed seq
- Subsequent runs resume
- analytics.scan_batch_size
- default 1000
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-193 - Phase Storage Verification Strategy

```yaml
plan_unit_id: SP-193
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The testing strategy preserves phase-specific unit and integration verification for data root resolution, seglog append/readback, redb namespaces, JSONL mirror, Tantivy chat index, analytics rollups, and end-to-end chat/editor/Usage flow as PlanUnit validation metadata only.
gui_related: false
gui_classification_reason: This unit preserves backend verification strategy without creating executable tasks.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: phase_storage_verification_strategy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0108
preserved_exact_tokens:
- Testing strategy
- Phase 1
- Unit
- Integration
- app data root resolution
- dir creation idempotent
- seglog writer append and read-back/tail
- rotation
- Phase 2
- redb open/create
- put/get
- migration runner
- Phase 3
- checkpoint read/write
- mirror append
- Phase 4
- Tantivy index
- search by content and thread_id
- Phase 5
- rollup computation
- fixture seglog
- Phase 6
- end-to-end thread + message + projectors + search + Usage + editor state
negative_constraints:
- Testing strategy rows are PlanUnit validation metadata, not WorkNodes or executable tasks.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-194 - Backend Storage Phase Acceptance Criteria

```yaml
plan_unit_id: SP-194
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Backend acceptance criteria preserve phase 1-5 success conditions for storage dirs, seglog readback, redb schema/migrations, JSONL projector resume, Tantivy search, and analytics rollups readable from redb.
gui_related: false
gui_classification_reason: This unit preserves backend phase acceptance criteria.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: backend_storage_phase_acceptance_criteria
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0109
preserved_exact_tokens:
- Acceptance criteria per phase
- Phase 1
- App data root resolved
- storage dirs exist
- seglog writer appends envelope-format events
- read back in order
- Phase 2
- redb opens with current schema
- migrations run
- settings and checkpoints
- Phase 3
- JSONL projector tails seglog
- resumes from checkpoint
- without duplicating or skipping events
- Phase 4
- Chat projector indexes seglog events into Tantivy
- search by content and thread_id
- Phase 5
- Analytics scan writes 5h/7d and tool_usage rollups
- reader
- UI or test
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-195 - End-To-End Chat Editor Usage Acceptance

```yaml
plan_unit_id: SP-195
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Phase 6 acceptance preserves the visible end-to-end flow where Chat, editor, and Usage use seglog/redb and thread, message, projectors, search, Usage, and editor state work together.
gui_related: true
gui_classification_reason: This unit preserves user-visible end-to-end Chat/editor/Usage acceptance.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: end_to_end_chat_editor_usage_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0109
preserved_exact_tokens:
- Phase 6
- Chat, editor, and Usage
- seglog and redb
- full flow
- thread + message + projectors + search + Usage + editor state
- works end-to-end
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-196 - Storage Plan Version History Preservation

```yaml
plan_unit_id: SP-196
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Version history rows remain preserved source metadata, including 2026-02-20, 2026-02-22, validation-reference migration, implementation-ready pass details, extended event/redb key history, and original fleshed-out checklist/change notes.
gui_related: true
gui_classification_reason: This unit preserves user-visible/source-visible version history metadata.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: storage_plan_version_history_preservation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0110
preserved_exact_tokens:
- Version history
- '2026-02-20'
- Initial checklist
- '2026-02-22'
- Validation reference migrated
- verifier/evidence-based validation contracts
- current
- Implementation-ready pass
- §8
- phased implementation order
- dependencies
- startup/shutdown
- first-run
- testing
- acceptance criteria
- project_id
- path_hash
- window
- HITL
- interview
- queue
- plan_todo
- thread archive/delete
- subagent
- editor lifecycle
- queue, plan_todo, thread_usage, file_tree_expanded, layout, recent_files, run/interview/hitl checkpoints
- Fleshed out
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-197 - Scheduler Safe-Point Remediation Event Ingestion

```yaml
plan_unit_id: SP-197
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Scheduler/runtime storage support ingests canonical scheduler, node blocked/unblocked, safe-point, and remediation events while accepting legacy aliases during migration, normalizing to canonical names before projections, and forbidding new legacy event emission.
gui_related: false
gui_classification_reason: This unit preserves backend scheduler/safe-point/remediation event ingestion and migration alias rules.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: scheduler_safe_point_remediation_event_ingestion
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0111
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0112
preserved_exact_tokens:
- Scheduler Runtime, Safe-Point, and Remediation Storage Addendum (2026-03-08)
- Event ingestion
- MUST ingest and project
- canonical names
- legacy aliases
- scheduler.pass
- run.scheduler_analysis
- node.blocked
- run.node_blocked
- node.unblocked
- run.node_unblocked
- safe_point.created
- safe_point.restored
- remediation.spawned
- run.remediation_started
- remediation.resolved
- run.remediation_completed
- Migration rule
- MUST accept both canonical and legacy event names
- MUST normalize to canonical names
- MUST NOT emit legacy names
negative_constraints:
- New storage code MUST NOT emit legacy names.
preserved_contractrefs: []
compatibility_only_notes:
- Legacy scheduler, node, and remediation aliases are accepted only during migration and normalized before projection.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-198 - Scheduler Runtime Redb Projection Keys

```yaml
plan_unit_id: SP-198
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Scheduler runtime redb projections preserve scheduler_pass, blocked_projection, remediation, and safe_point key patterns, while blocked_projection run-scoped keys are superseded by canonical blocked_projection.v1:{project_id}:{node_id} values with blocked reason, family, approval scope, and allowed actions.
gui_related: false
gui_classification_reason: This unit preserves backend scheduler runtime redb projection keys and supersession notes.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: scheduler_runtime_redb_projection_keys
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0113
preserved_exact_tokens:
- scheduler_pass.{run_id}.{scheduler_pass_id}
- blocked_projection.{run_id}.{node_id}.{blocked_sequence}
- remediation.{run_id}.{remediation_root_id}
- safe_point.sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}
- Canonical note
- superseded
- blocked_projection.v1:{project_id}:{node_id}
- blocked_reason_code
- blocked_at
- blocked_family
- approval_scope_key?
- allowed_action_ids[]
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md'
compatibility_only_notes:
- blocked_projection.{run_id}.{node_id}.{blocked_sequence} is superseded by canonical blocked_projection.v1:{project_id}:{node_id}.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-199 - Attempt-Aware Projection Rules

```yaml
plan_unit_id: SP-199
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Runtime attempt, safe-point, and queue analysis projections persist scheduler/recovery state without SQLite, resolve run-graph/orchestrator projections by attempt_id, preserve latest blocked state after restart, preserve ready_since_utc during continuous readiness, and keep stale replan_generation attempts queryable but not resumable.
gui_related: false
gui_classification_reason: This unit preserves backend attempt-aware projection and stale attempt rules.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: attempt_aware_projection_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0114
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0115
preserved_exact_tokens:
- Runtime Attempt / Safe Point / Queue Analysis Storage Addendum (2026-03-09)
- without SQLite
- Projection rules
- run-graph
- orchestrator projections
- attempt_id
- node_id
- latest blocked state
- app restart
- ready_since_utc
- continuously ready
- stale attempts
- older replan_generation
- queryable for history
- may not be resumed as active work
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- stale attempts from an older replan_generation remain queryable for history but may not be resumed as active work.
owner_hints:
- Plans/storage-plan.md
```

### SP-200 - Safe-Point Queue Analysis Persistence Safety

```yaml
plan_unit_id: SP-200
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Persistence safety requires safe-point metadata before mutation-capable attempt execution, explicit local-work-preserved blocked outcomes, and append-only queue-analysis observability data whose canonical pass history remains reconstructable even if later projections summarize it.
gui_related: false
gui_classification_reason: This unit preserves backend safe-point and queue-analysis persistence safety.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: safe_point_queue_analysis_persistence_safety
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0116
preserved_exact_tokens:
- Persistence safety rules
- safe-point metadata
- before mutation-capable attempt execution begins
- local-work-preserved blocked outcomes
- represented explicitly
- not inferred from missing failure rows
- queue-analysis records
- append-only observability data
- later projections may summarize
- canonical pass history
- reconstructable
negative_constraints:
- Local-work-preserved blocked outcomes must be represented explicitly, not inferred from missing failure rows.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-201 - Attempt Counter Semantics And Snapshot Lineage

```yaml
plan_unit_id: SP-201
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Attempt counter semantics preserve attempt_count as ground truth, retry_count as derived display data, additive sub-counter decomposition, immutable attempt snapshots for permission/auth/approval/safe-point/revalidation changes, and lineage joins through attempt_id and immutable snapshots.
gui_related: false
gui_classification_reason: This unit preserves backend attempt counter and immutable snapshot lineage semantics.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: attempt_counter_semantics_and_snapshot_lineage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0117
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0118
preserved_exact_tokens:
- Runtime Attempt / Safe Point / Queue Analysis Canonical Alignment (2026-03-09)
- without ambiguity
- Counter semantics
- attempt_count
- ground-truth count
- started attempts
- retry_count
- derived display data only
- max(attempt_count - 1, 0)
- sub-counter decomposition
- initial_attempts
- retry_attempts
- resume_attempts
- remediation_retry_attempts
- permission, auth, approval, safe-point, or revalidation changes
- new attempt snapshots/records
- do not mutate prior attempt counters in place
- attempt_id
- immutable attempt snapshot
negative_constraints:
- permission, auth, approval, safe-point, or revalidation changes produce new attempt snapshots/records; they do not mutate prior attempt counters in place.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-202 - Runtime Projection Historical State

```yaml
plan_unit_id: SP-202
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Runtime projection historical state requires run-graph/orchestrator projections to resolve by attempt_id, preserves blocked projections as historical after resolution, keeps ready_since_utc only while continuously ready, and labels older-generation attempts stale and never resumable.
gui_related: false
gui_classification_reason: This unit preserves backend runtime projection historical state rules.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: runtime_projection_historical_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0118
preserved_exact_tokens:
- run-graph and orchestrator projections
- attempt_id
- not only node_id
- blocked projections remain historical after resolution
- unblocking does not overwrite prior blocked rows
- ready_since_utc
- continuously ready
- older generations
- stale
- never resumable
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/Widget_System.md#2. Hostability and data contracts, Plans/FinalGUISpec.md#10.6 Blocked and recovery surfaces'
compatibility_only_notes: []
stale_retired_dispositions:
- attempts from older generations remain queryable but are labeled stale and are never resumable.
owner_hints:
- Plans/storage-plan.md
```

### SP-203 - Projection Freshness Health Fallback Surface

```yaml
plan_unit_id: SP-203
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Projection trust metadata exposes freshness, health, projection time, lag, degraded reason, fallback policy, runtime_artifact terms, labels, direct-record degradation, and action gating before mutation actions.
gui_related: true
gui_classification_reason: This unit preserves user-visible projection freshness/health/fallback labels and backend trust fields.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: projection_freshness_health_fallback_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0118
preserved_exact_tokens:
- projection_freshness
- projection_health
- last_projected_at_utc
- projector_lag
- degraded_reason_code
- fallback_policy
- runtime_artifact.*
- projection freshness
- projection health
- fallback
- Projection freshness is not the same thing as action authority
- Projection-backed surfaces
- direct-record views
- trust drops
- Runtime-artifact projections
- canonical seglog events
- Permission carry-through
- action gating
- mutation actions
negative_constraints:
- Projection freshness is not the same thing as action authority.
- Action gating must respect projection trust before surfacing mutation actions.
preserved_contractrefs:
- 'ContractRef: Plans/Widget_System.md#2. Hostability and data contracts, Plans/FinalGUISpec.md#10.6 Blocked and recovery surfaces'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-204 - Attempt Snapshot Refresh Rules

```yaml
plan_unit_id: SP-204
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Snapshot refresh creates new attempt snapshots when permission, auth, approval, or replan resolution changes, and safe-point restore creates a new attempt record tied back by lineage rather than mutating the originating attempt.
gui_related: false
gui_classification_reason: This unit preserves backend attempt snapshot refresh and restore lineage rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: attempt_snapshot_refresh_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0119
preserved_exact_tokens:
- Snapshot refresh rules
- permission/auth/approval/replan resolution
- new attempt snapshot
- old attempt snapshots remain immutable
- safe-point restore
- does not mutate the originating attempt record in place
- new attempt record
- tied back by lineage
negative_constraints:
- Safe-point restore does not mutate the originating attempt record in place.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-205 - Restart Historical Archived Removed Records

```yaml
plan_unit_id: SP-205
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Runtime recovery restart history preserves historical, archived, removed, projection freshness/health, lineage refs, worktree/lane ids, owner ids, last seen time, and rules that keep historical/archived/removed distinct while missing worktrees or lanes remain historically inspectable.
gui_related: false
gui_classification_reason: This unit preserves backend restart history and stale historical record semantics.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: restart_historical_archived_removed_records
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0120
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0121
preserved_exact_tokens:
- Runtime Recovery Persistence and Restart Canonical Alignment (2026-03-09)
- Restart and stale history
- historical
- archived
- removed
- projection_freshness
- projection_health
- historical_lineage_refs[]
- worktree_id
- lane_id
- last_seen_at_utc
- owner_run_id
- owner_attempt_id
- Restart and cleanup
- distinct
- Missing live worktrees or lanes
- historically inspectable
- Projection trust
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Restart and stale history remains an explicit historical record family.
owner_hints:
- Plans/storage-plan.md
```

### SP-206 - Permission Snapshot Storage Binding

```yaml
plan_unit_id: SP-206
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Permission snapshot storage binds durable permission_snapshot_record keys to immutable attempt_record.permission_snapshot_id references while Permissions_System owns schema/enums/surfaces; storage may cache query fields but must not redefine nested snapshot schema locally.
gui_related: false
gui_classification_reason: This unit preserves backend permission snapshot storage binding and owner boundary.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: permission_snapshot_storage_binding
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0122
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0123
preserved_exact_tokens:
- Permission Snapshot Storage and Safe-Point Namespace Addendum
- Permission snapshot storage
- Plans/storage-plan.md owns only the durable storage binding
- Plans/Permissions_System.md owns the snapshot schema
- enums
- approval-surface expectations
- blocked-action semantics
- permission_snapshot_record.v1:{project_id}:{snapshot_id}
- attempt_record.permission_snapshot_id
- blocked_family
- approval_scope_key
- approval_target_ref
- revalidation_required
- snapshot record
- durable/dispatchable
- immutable after creation
- Snapshot retention
- owner-doc schema
- competing schema copy
negative_constraints:
- projector/query fields MUST NOT redefine the nested snapshot schema locally.
- storage-plan MUST reference the owner-doc schema instead of embedding a competing schema copy.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-207 - Safe-Point Restore-Point Namespace Separation

```yaml
plan_unit_id: SP-207
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Safe points and restore points use distinct prefixes, with sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id} for runtime-internal run/node/attempt scope and rp:{project_id}:{restore_point_id} for user-facing project scope; namespaces and queries must not overlap.
gui_related: false
gui_classification_reason: This unit preserves backend safe-point versus restore-point namespace separation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: safe_point_restore_point_namespace_separation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0124
preserved_exact_tokens:
- Safe-point vs restore-point namespace separation
- Safe point
- sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}
- Runtime-internal
- run/node/attempt
- Restore point
- rp:{project_id}:{restore_point_id}
- User-facing
- project
- MUST NOT overlap
- 'sp: prefix'
- 'rp: prefix'
negative_constraints:
- Safe-point and restore-point namespaces MUST NOT overlap.
- 'Queries for safe points MUST use sp: and queries for restore points MUST use rp:.'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/newfeatures.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-208 - Assistant Worktree Binding Owner Boundary

```yaml
plan_unit_id: SP-208
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Assistant worktree binding storage preserves Source Control as the Git/worktree owner, references the live Orchestrator_Page Source Control boundary instead of a stale numbered anchor, and keeps worktree-binding persistence worktree-first when handing off to Source Control.
gui_related: false
gui_classification_reason: This unit preserves backend Source Control owner boundary and stale-anchor disposition.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: assistant_worktree_binding_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0125
preserved_exact_tokens:
- Assistant Worktree Binding Storage Addendum
- Source Control remains the Git/worktree owner surface
- Plans/Orchestrator_Page.md#Source Control boundary
- stale numbered anchor
- Worktree-binding persistence
- worktree-first
- hands off to Source Control
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Storage projections reference the live Plans/Orchestrator_Page.md#Source Control boundary rather than the stale numbered anchor.
owner_hints:
- Plans/storage-plan.md
```

### SP-209 - Web Cache Owner Contract And Core Routing

```yaml
plan_unit_id: SP-209
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Web content cache persistence consumes the linked owner contract, preserving two-phase lookup, state vocabulary, per-project 500 MB cache sizing, action skip/read-time behavior, PM-cache precedence, Firecrawl latency-only role, and diff-reuse audit states.
gui_related: true
gui_classification_reason: This unit preserves user-visible web cache routing/cache-state behavior.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: web_cache_owner_contract_and_core_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0126
preserved_exact_tokens:
- Web content caching persistence
- linked owner contract
- PM-owned web cache contract
- two-phase lookup
- state vocabulary
- per-project cache sizing
- requests with actions
- post-action result
- PM-cache precedence
- Firecrawl cache
- diff-reuse audit states
- per-project
- 500 MB
- per-operation TTL defaults
- LRU eviction
- bounded storage
- stable cache key ordering
- change_tracking
negative_constraints:
- Cache routing must skip read-time cache for requests with actions.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-210 - Web Cache Entry Schema Budget Eviction

```yaml
plan_unit_id: SP-210
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Web cache entries store cache_key, normalized URL, formats, adapter_id, content hash/ref pointer, metadata, fetched/expires/access fields, 500 MB budget, TTL, LRU, per-project/per-operation scope, cache key ordering, and change detection persistence without inlining cached content.
gui_related: false
gui_classification_reason: This unit preserves backend web cache entry schema, budget, and eviction fields.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: web_cache_entry_schema_budget_eviction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0126
preserved_exact_tokens:
- 'cache_key: string'
- hash of (url, formats, adapter_id)
- 'url: string'
- normalized URL
- 'formats_requested: string[]'
- adapter_id
- content_hash
- 'content_ref: string'
- pointer to cached content (not inline)
- metadata
- title?
- status_code
- content_type
- content_length
- fetched_at
- ISO time
- expires_at
- TTL
- access_count
- last_accessed_at
- 500 MB
- LRU
- per-project
- per-operation
- cache key ordering
- change detection persistence
negative_constraints:
- content_ref is a pointer to cached content and not inline content.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-211 - Web Cache Lookup Bypass Hit Rules

```yaml
plan_unit_id: SP-211
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Web cache lookup is adapter-agnostic and action-free at read time, validates adapter_id after provider selection, always fresh-executes requests with actions while still allowing post-action store, records bypass when max_age_seconds is 0 or store is false, serves hit only within TTL and absent actions/adapter mismatch, and preserves exact cache_state enum values.
gui_related: true
gui_classification_reason: This unit preserves user-visible cache hit/bypass state and backend lookup rules.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: web_cache_lookup_bypass_hit_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0126
preserved_exact_tokens:
- Cache lookup
- adapter-agnostic
- action-free at read time
- (url, formats_hash)
- adapter_id
- actions
- always fresh-execute
- Cache STORE
- post-action content
- 'cache_policy.max_age_seconds: 0'
- 'cache_policy.store: false'
- 'cache_state: "bypassed"'
- 'cache_state: "hit"'
- skip provider execution
- post-selection adapter_id validation fails
- PM cache takes precedence
- Firecrawl cache serves as provider-side /latency optimization only
- 'cache_state: "hit" | "miss" | "bypassed" | "expired_used_for_diff"'
negative_constraints:
- Cache lookup only applies to action-free requests.
- Firecrawl cache is provider-side latency optimization only.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-212 - Storage Batch Owner Consumer Boundary Map

```yaml
plan_unit_id: SP-212
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The owner/consumer map keeps storage-plan as the owner doc for preserved behavior while cross-doc ownership follows ContractRefs and boundary notes from original text and the Plan Document System/Bootstrap Planning Migration contracts.
gui_related: false
gui_classification_reason: This unit preserves backend plan ownership and migration boundary metadata.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: storage_batch_owner_consumer_boundary_map
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0127
preserved_exact_tokens:
- Owner / Consumer Map
- source-preserving standardization
- owner and consumer boundaries
- Plans/storage-plan.md
- owner doc
- preserved sections
- cross-doc ownership
- ContractRefs
- boundary notes
- original text
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-001 - Storage Plan Generated Artifact Residual

```yaml
plan_unit_id: SP-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/storage-plan.md
canonical_text: >-
  SP-001 is retired as active source-preserving product coverage after Phase 2B batch 180. storage-plan-S0001 through S0127 are covered by fine-grained SP-002 through SP-212 or explicit split coverage, while storage-plan-S0128 through S0130 are generated PlanUnits and Migration Coverage audit material. SP-001 remains only a generated-artifact residual for migration lineage and must not override implementation-facing Storage Plan units.
gui_related: true
gui_classification_reason: >-
  The retired generated residual preserves GUI-bearing historical bridge metadata from storage-plan-S0129, but the live SP-001 disposition is migration/audit lineage rather than product GUI coverage.
split_recommended: false
depends_on: [PDS-003, PDS-004, PDS-010]
unblocks: []
acceptance_criteria:
  - storage-plan-S0001 through S0127 remain mapped to fine-grained Storage Plan PlanUnits rather than SP-001.
  - storage-plan-S0128 through S0130 remain available as generated PlanUnits and Migration Coverage audit material only.
  - SP-001 no longer uses node_compile_hint.mode source_preserving_planunit; that token is preserved only as migration lineage.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: storage_generated_residual_tail
implementation_surfaces:
  - Plans/storage-plan.md
node_compile_hint:
  mode: generated_artifact_residual
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0128
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0129
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0130
preserved_exact_tokens:
  - PlanUnits
  - Migration Coverage
  - source_preserving_planunit
  - "SP-001 - Storage plan (seglog, redb, Tantivy, projectors) Source-Preserving PlanUnit"
  - generated_artifact_residual
negative_constraints:
  - SP-001 must not provide product implementation coverage for storage-plan-S0001 through S0127 after Phase 2B batch 180.
  - SP-001 must not override SP-002 through SP-212 or later structural dispositions.
preserved_contractrefs:
  - Generated PlanUnits and Migration Coverage material remain preserved by span_map and coverage_map as migration-lineage audit material.
compatibility_only_notes:
  - The source_preserving_planunit token is preserved only as retired migration lineage and not as an active node_compile_hint mode.
  - The old storage-plan SP-001 bridge title is a compatibility alias for audit and search only.
stale_retired_dispositions:
  - The former SP-001 source-preserving bridge is retired as active product coverage; product coverage lives in SP-002 through SP-212 and coverage_map rows.
  - Generated storage-plan-S0128 through storage-plan-S0130 are not product implementation canon.
owner_hints:
  - Plans/storage-plan.md
```

## Migration Coverage

Original hash: `62042a057b7f4e759a36b464c2df75eb4fbe7ac420c534741c43401f65412d71`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 173 atomized `storage-plan-S0001` through `storage-plan-S0042` into fine-grained PlanUnits `SP-002` through `SP-024`. Phase 2B batch 174 atomized `storage-plan-S0043` through `storage-plan-S0075` into fine-grained PlanUnits `SP-025` through `SP-057`. Phase 2B batch 175 atomized `storage-plan-S0076` into fine-grained PlanUnits `SP-058` through `SP-065`. Phase 2B batch 176 atomized `storage-plan-S0077` into fine-grained PlanUnits `SP-066` through `SP-119`. Phase 2B batch 177 atomized `storage-plan-S0078` through `storage-plan-S0086` into fine-grained PlanUnits `SP-120` through `SP-139`. Phase 2B batch 178 atomized `storage-plan-S0087` through `storage-plan-S0100` into fine-grained PlanUnits `SP-140` through `SP-178`. Phase 2B batch 179 atomized `storage-plan-S0101` through `storage-plan-S0127` into fine-grained PlanUnits `SP-179` through `SP-212`. Phase 2B batch 180 retired `SP-001` from active `source_preserving_planunit` mode into `generated_artifact_residual` lineage for generated `storage-plan-S0128` through `storage-plan-S0130`; it must not override the fine-grained units. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and they did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.

## Ledger Compile Addendum - pldg-20260614-001

### SP-213 - Projection Rehydration Artifact Index And Lane Cleanup Header Recovery

```yaml
plan_unit_id: SP-213
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  storage-plan top owner headers for projection fields used by startup rehydration, artifacts-index fields, lane-cleanup lineage, bridge-field
  precedence, and related owner sections hydrate from existing SP PlanUnits and body sections. Recovery must preserve durable event/projection
  ownership without inventing new storage record families.
gui_related: false
gui_classification_reason: Storage projection and durable record ownership are backend persistence contracts.
depends_on: [SP-035, SP-037, SP-038]
unblocks: []
acceptance_criteria:
  - Startup rehydration projection fields map to existing durable storage/projector ownership.
  - artifacts-index fields and lane-cleanup lineage resolve to storage and runtime owner records.
  - Bridge-field precedence is recorded as storage owner behavior or a consumer pointer, not a dangling header.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual storage owner-section review
risk_class: storage_owner_stub_loss
reasoning_tier: standard
context_scope: storage_owner_section_recovery
implementation_surfaces: [Plans/storage-plan.md, Plans/Runtime_Artifacts_Panel.md, Plans/Contracts_V0.md, Plans/WorktreeGitImprovement.md]
node_compile_hint: {mode: storage_owner_section_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0013
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0066
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0067
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0073
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0074
preserved_exact_tokens: ["projection fields for startup rehydration", "artifacts-index fields", "lane-cleanup lineage", "bridge-field precedence", "allowed_actions[]"]
negative_constraints:
  - Do not create new storage record families solely to fill old stub headings.
  - Do not preserve allowed_actions[] as a live blocked/HITL storage contract.
owner_hints: [Plans/storage-plan.md, Plans/Runtime_Artifacts_Panel.md, Plans/Contracts_V0.md, Plans/Orchestrator_Page.md]
```

## Ledger Compile Addendum - pldg-20260616-001

### SP-214 - Goal Runtime Persistence Consumer

```yaml
plan_unit_id: SP-214
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  storage-plan owns persistence, replay, and projection boundaries for Goal Runtime durable state, append-only goal event log, completion/degraded/stopped/blocked receipts, child-goal state, recovery state, evidence refs, goal_revision/expected_goal_revision, and retention anchors. Canonical persisted goal events registered by Contracts_V0 are goal.created, goal.scheduled, goal.progressed, goal.tool_check_recorded, goal.updated, goal.replanned, goal.child_status_changed, goal.evidence_captured, goal.verification_decided, goal.receipt_recorded, goal.completed, goal.degraded, goal.stopped, goal.blocked, goal.cancelled, plus Orchestrator GoalRun events goal_run.started, goal_run.replanned, goal_run.blocked, goal_run.certified, goal_run.cancelled, and goal_run.stopped. Storage persists them in an append-only goal_event_log and rebuilds disposable projections goal_state.v1:{project_id}:{goal_id}, goal_receipt.v1:{project_id}:{receipt_id}, goal_blocked_projection.v1:{project_id}:{goal_id}, goal_child_index.v1:{project_id}:{parent_goal_id}, goal_evidence_index.v1:{project_id}:{goal_id}, and goal_run_projection.v1:{project_id}:{goal_run_id}. Goal_Runtime_System owns behavior semantics; Contracts_V0 owns event-name and payload-minimum registration.
gui_related: false
gui_classification_reason: Goal Runtime persistence and projection ownership is backend storage behavior, not visual presentation.
depends_on:
  - SP-041
  - SP-057
  - SP-090
  - CV-286
unblocks: []
acceptance_criteria:
  - Goal Runtime durable state and append-only event-log records have a storage owner for persistence/projection and replay.
  - Completion, degraded, stopped, blocked, child-goal, recovery, evidence-ref, revision, and retention-anchor fields are preserved in append-only events and rebuilt projections.
  - storage-plan consumes Goal Runtime semantics from Plans/Goal_Runtime_System.md and does not redefine lifecycle policy.
  - Stale goal_revision or expected_goal_revision writes are rejected or reconciled through compare-and-swap recovery rather than overwriting current state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-goal-runtime-event-fixtures
risk_class: goal_runtime_persistence_owner_gap
reasoning_tier: high
context_scope: goal_runtime_storage
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/goal_runtime_events.schema.json
node_compile_hint:
  mode: goal_runtime_persistence_consumer
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0031
  - pldg-20260616-001-goal-runtime-system:atom-0032
  - pldg-20260616-001-goal-runtime-system:atom-0033
  - pldg-20260616-001-goal-runtime-system:atom-0034
  - pldg-20260616-001-goal-runtime-system:atom-0038
  - pldg-20260616-001-goal-runtime-system:atom-0039
  - pldg-20260616-001-goal-runtime-system:atom-0047
  - pldg-20260616-001-goal-runtime-system:atom-0048
  - pldg-20260616-001-goal-runtime-system:atom-0049
  - pldg-20260616-001-goal-runtime-system:atom-0107
  - pldg-20260616-001-goal-runtime-system:atom-0109
  - pldg-20260616-001-goal-runtime-system:atom-0110
preserved_exact_tokens:
  - "durable state"
  - "append-only goal event log"
  - "completion/degraded/stopped/blocked receipts"
  - "child-goal state"
  - "recovery state"
  - "evidence refs"
  - "goal_revision"
  - "expected_goal_revision"
  - "retention anchors"
  - "goal.*"
  - "goal_state.v1:{project_id}:{goal_id}"
  - "goal_event_log"
  - "payload schemas"
negative_constraints:
  - Do not let projection rebuild or stale state overwrite append-only event truth.
  - Do not make storage-plan the semantic owner for Goal Runtime lifecycle policy.
  - Do not preserve GoalRunStarted or BuildStarted as a second persisted event naming family.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
  - Plans/Runtime_Artifacts_Panel.md
```

## Ledger Compile Addendum - pldg-20260616-002

### SP-215 - GoalRun Receipt And Evidence Persistence

```yaml
plan_unit_id: SP-215
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  storage-plan owns persistence and projection boundaries for GoalRun, WorkGraph, SubagentWave, VerificationCycle, DefectBundle, RepairWorkNode, VerificationReceipt, WorkNodeReceipt, and GoalCompletionReceipt records. Stored VerificationCycle fields preserve verification_cycle_id, target_ref, attempt, status failed | passed | blocked only, typed VerificationFinding details, findings, defect_signatures, finding type, failing check, affected artifact/path/span, root_cause_key, repeated_signature_count, prior repair strategies, repair_strategy, and next_required_action alongside the broader GoalRun status projection. Stored records preserve goal_id, workgraph/worknode refs, GoalRun/WorkNode projection status values ready, running, provisional_success, verifying, failed_verification, repairing, certified, failed, blocked, cancelled, and stopped, defect signature, repair cycle, requested/effective provider/model/account refs, capability_lane, agent_role, write_mode, certification_tier, worktree lease refs, evidence refs, artifact refs, restart/model-switch lineage, and retention anchors. Stored VerificationReceipt fields include verifier identity, findings, defect signatures, passed/failed/skipped validator outputs, repair-cycle refs, and regression checks. Stored WorkNodeReceipt fields include executor identity, input refs, output refs, changed artifacts, validators run, evidence refs, and unresolved risks. Stored GoalCompletionReceipt fields include child receipts, WorkNode receipts, changed artifacts, validator outcomes, authority checks, and final certifier decision. Evidence refs distinguish acceptance criteria, live evidence, tests, diffs, validator outputs, canonical evidence, source evidence, process evidence, and governance evidence. GoalRun replay rebuilds projections from append-only goal_run.* events, goal receipt records, WorkNode receipts, safe-point/source-control receipts, and Executor/Auditor receipt chains; older replan_generation attempts and safe points remain queryable as historical records but are never resumable when superseded.
gui_related: false
gui_classification_reason: Receipt and evidence persistence is backend storage behavior; GUI panels consume projections.
depends_on:
  - SP-214
  - CV-288
unblocks: []
acceptance_criteria:
  - Storage records preserve GoalRun, WorkGraph, SubagentWave, VerificationCycle, DefectBundle, RepairWorkNode, VerificationReceipt, WorkNodeReceipt, and GoalCompletionReceipt identity.
  - Stored VerificationCycle records preserve verification_cycle_id, target_ref, attempt, status failed | passed | blocked, typed VerificationFinding details, findings, defect_signatures, finding type, failing check, affected artifact/path/span, root_cause_key, repeated_signature_count, prior repair strategies, repair_strategy, and next_required_action.
  - GoalRun/WorkNode projection lifecycle values ready, running, provisional_success, verifying, failed_verification, repairing, certified, failed, blocked, cancelled, and stopped are not persisted as VerificationCycle.status.
  - Evidence, artifact, worktree lease, requested/effective runtime, capability lane, write mode, certification tier, restart, model-switch, verifier/executor/certifier identity, validator outcome, authority check, and unresolved-risk refs are not lost.
  - Evidence refs retain acceptance criteria, live evidence, tests, diffs, validator outputs, canonical evidence, source evidence, process evidence, and governance evidence classifications.
  - Runtime Artifacts and GUI surfaces consume projections instead of becoming durable truth.
  - GoalRun replay discloses stale, degraded, or unavailable projection state and falls back to record-backed inspection.
  - Older replan_generation attempts and safe points remain queryable but not resumable when superseded.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-goal-runtime-event-fixtures
risk_class: goalrun_evidence_persistence_gap
reasoning_tier: high
context_scope: goalrun_storage
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/goal_runtime_events.schema.json
  - Plans/WorktreeGitImprovement.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: goalrun_receipt_evidence_persistence
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0014
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0015
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0021
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0022
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0033
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0036
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0051
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0052
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0053
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0056
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0071
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0072
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0091
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0094
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0102
preserved_exact_tokens:
  - "GoalRun"
  - "WorkGraph"
  - "SubagentWave"
  - "VerificationCycle"
  - "DefectBundle"
  - "RepairWorkNode"
  - "VerificationReceipt"
  - "WorkNodeReceipt"
  - "GoalCompletionReceipt"
  - "ready"
  - "running"
  - "provisional_success"
  - "verifying"
  - "failed_verification"
  - "repairing"
  - "certified"
  - "failed"
  - "blocked"
  - "cancelled"
  - "stopped"
  - "attempt"
  - "status failed | passed | blocked"
  - "VerificationFinding"
  - "findings"
  - "finding type"
  - "failing check"
  - "affected artifact/path/span"
  - "root_cause_key"
  - "defect_signatures"
  - "repeated_signature_count"
  - "prior repair strategies"
  - "repair_strategy"
  - "next_required_action"
  - "capability_lane"
  - "write_mode"
  - "certification_tier"
  - "verifier identity"
  - "executor identity"
  - "final certifier decision"
  - "validator outputs"
  - "canonical evidence"
  - "source evidence"
  - "process evidence"
  - "governance evidence"
negative_constraints:
  - Do not let storage deferral drop required receipt or evidence fields.
  - Do not make GUI projections durable source of truth.
  - Do not expand VerificationCycle.status beyond failed | passed | blocked; ready/running/provisional_success/verifying/failed_verification/repairing/certified/failed/blocked/cancelled/stopped are GoalRun/WorkNode projection lifecycle values.
  - Do not resume superseded GoalRun attempts from stale projections.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Permissions_System.md
```


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### SP-216 - PlanningRun, PlanCompile, WorkNode, And Audit Persistence

```yaml
plan_unit_id: SP-216
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'PlanningRun owns source pack identity, project and work-intent context, thread group, global planning ledger, dynamic topic map, topic threads, topic plan drafts, amendments, invalidations, audit cycles, final plan pack, status, hashes, and handoff events. Planning Wizard child-thread records persist thread_type planning_wizard, thread_role, and Planning Run membership so intake, topic, final_integration, audit_review, and final_review conversations stay one typed thread family rather than unrelated top-level thread types. PlanCompileRun persists stage, cursor, bounded worklists, assignment receipts, source hashes, currentness status, blockers, repairs, artifacts, retries, cancellation, supersession, and exact next action across context and process restarts. After Activation Decision accepts the certified graph, Executor materializes canonical WorkNodeRecord objects from accepted WorkNodeRequests and emits materialization receipts. WorkNodeRecord includes worknode_id, goal_run_id, workgraph_id and revision, source_request_id, source PlanUnit and acceptance refs, objective, surfaces, typed readiness predicates, lifecycle, attempts and retries, authority, model, tests, repository/worktree/safe-point
  refs, evidence, currentness, cancellation, invalidation, and replan generation. Plans-to-code runtime records carry schema version, project, planning run, plan pack, PlanCompileRun, GoalRun, WorkGraph and revision, WorkNode, attempt, actor, status, revision, hashes, currentness, correlation, causation, idempotency, source, artifact, evidence, and supersession fields as applicable. Audit findings have stable finding keys, source and artifact hashes, closure status, evidence, reason, repair attempts, and reopen conditions so unchanged closed findings become previously closed rather than recurring forever.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: execution_boundary
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/storage-plan.md
- Plans/Planning_Wizard.md
- Plans/Contracts_V0.md
- Plans/assistant-chat-design.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Goal_Runtime_System.md
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0008
- pldg-20260618-001-prd-planning-wizard:atom-0042
- pldg-20260618-001-prd-planning-wizard:atom-0111
- pldg-20260618-001-prd-planning-wizard:atom-0121
- pldg-20260618-001-prd-planning-wizard:atom-0122
- pldg-20260618-001-prd-planning-wizard:atom-0128
- pldg-20260618-001-prd-planning-wizard:atom-0134
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/07-audit-readiness-and-safety.md#SRC-AUDIT
source_atom_ids:
- atom-0008
- atom-0042
- atom-0111
- atom-0121
- atom-0122
- atom-0128
- atom-0134
decision_refs:
- dec-0010
- dec-0025
- dec-0026
correction_refs: []
preserved_exact_tokens:
- PlanningRun
- 'thread_type: planning_wizard'
- thread_role
- thread_group_id
- topic map
- PlanCompileRun
- currentness
- resume
- WorkNodeRecord
- WorkNodeMaterializationReceipt
- worknode_id
- goal_run_id
- workgraph_revision
- attempt_id
- replan generation
- correlation_id
- causation_id
- idempotency_key
- currentness_status
- finding_key
- previously_closed
- reopen conditions
negative_constraints:
- Do not define planning_topic or audit_review as unrelated top-level thread types.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Goal_Runtime_System.md
- Plans/Executor_Protocol.md
```

## Ledger Compile Addendum - pldg-20260622-001-fff

### SP-217 - Discovery Index Persistence, Cache Identity, And History Boundaries

```yaml
plan_unit_id: SP-217
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  storage-plan owns DiscoveryIndex persistence, cache identity, lifecycle state, and frecency/history boundaries for native DiscoveryService. Discovery indexes are scoped per project, worktree, and remote identity, with separate canonical_path_identity, identity_scope, display_path, normalization_profile, case_sensitivity, symlink_policy, cache_schema_version, ranking_policy_version, policy_hash, ignore_hash, identity_hash, source_manifest_generation, source_index_generation, and remote_identity when applicable. Warm, reindex, teardown, progress, health, stale, fallback, disabled, unsupported, over_budget, and backpressure states are persisted or projected without merging unrelated projects. Frecency/query/open history is on-device, user-scoped, and project/worktree-local by default; reset/disable controls stop future ranking use for the selected identity without deleting durable redacted discovery receipts by default.
gui_related: true
gui_classification_reason: This includes user-visible reset/disable behavior, display_path identity, freshness/fallback projection, and GUI score explanations.
depends_on: [PDS-003, PDS-005, SP-016, SP-017, SP-020, SP-188, SP-206, T-160]
unblocks: [SP-218, F3-399, ATS-011, RAP-031]
acceptance_criteria:
  - Cache keys separate project, worktree, branch, remote, and SSH identity variants.
  - Path identity, display path, normalization, case, and symlink policy are explicit in cached results and receipts.
  - Frecency/history reset or disable removes future ranking use for the selected identity while durable receipts remain under Runtime Artifacts retention/redaction policy.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future cache identity tests for schema/ranking/policy/ignore/identity/manifest changes.
  - Future frecency reset versus durable receipt retention tests.
risk_class: persistence_identity_drift
reasoning_tier: standard
context_scope: discovery_storage
implementation_surfaces: [Plans/storage-plan.md, future DiscoveryIndex, future Runtime Artifacts receipt store]
node_compile_hint: {mode: discovery_index_persistence, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0023
  - pldg-20260622-001-fff:atom-0024
  - pldg-20260622-001-fff:atom-0040
  - pldg-20260622-001-fff:atom-0042
  - pldg-20260622-001-fff:atom-0053
  - pldg-20260622-001-fff:atom-0062
  - pldg-20260622-001-fff:atom-0078
  - pldg-20260622-001-fff:atom-0081
  - pldg-20260622-001-fff:atom-0082
  - pldg-20260622-001-fff:atom-0083
  - pldg-20260622-001-fff:atom-0086
  - pldg-20260622-001-fff:atom-0089
  - pldg-20260622-001-fff:state/precision_contract.json#cache_identity_contract_required_fields
  - pldg-20260622-001-fff:state/implementation_gap_defaults.json
source_atom_ids: [atom-0023, atom-0024, atom-0040, atom-0042, atom-0053, atom-0062, atom-0078, atom-0081, atom-0082, atom-0083, atom-0086, atom-0089]
preserved_exact_tokens: ["DiscoveryIndex", "canonical_path_identity", "identity_scope", "display_path", "normalization_profile", "case_sensitivity", "symlink_policy", "cache_schema_version", "ranking_policy_version", "policy_hash", "ignore_hash", "identity_hash", "source_manifest_generation", "source_index_generation", "project-local frecency", "reset/disable", "durable redacted discovery receipts"]
negative_constraints:
  - Do not persist frecency globally across unrelated projects by default.
  - Do not treat display_path as canonical identity.
  - Do not delete durable Runtime Artifacts receipts merely because Assistant Chat activity is hidden or frecency is reset.
owner_hints: [Plans/storage-plan.md, Plans/Runtime_Artifacts_Panel.md, Plans/assistant-chat-design.md]
```

### SP-218 - Remote SSH Discovery Manifest Cache And Verification Handoff

```yaml
plan_unit_id: SP-218
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Remote/cache/SSH discovery uses a local DiscoveryService plus SSH remote manifest adapter for MVP. The adapter uses Git-tracked file manifests such as git ls-files when available, or an allowed remote directory walk only inside the authorized remote project root, then normalizes, policy-filters, annotates, and indexes remote entries locally. Cache/index keys derive from normalized remote identity hashes including project_id, remote_kind, host alias or host fingerprint, user/account alias, remote_root, repo_id when available, branch/worktree ref, and index_generation, and must not include secrets or merge unrelated local paths. Exact verification for SSH results reads through the authorized remote identity/path or a provenance-equivalent remote cache entry; it must not verify an unrelated local checkout as if it were the SSH result.
gui_related: false
gui_classification_reason: This defines remote cache and SSH manifest persistence/verification authority, not GUI presentation.
depends_on: [SP-217, W-074, F2-191, PS-118]
unblocks: [ATS-011, GI-033]
acceptance_criteria:
  - SSH-backed project roots can discover candidates without requiring a local checkout.
  - Stale remote_cache or ssh_manifest fallback is explicitly disclosed and never reported as fresh remote truth.
  - Remote cache keys contain no credential or secret material.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future SSH project with no local checkout test.
  - Future stale remote cache and wrong-branch invalidation tests.
risk_class: remote_identity_drift
reasoning_tier: high
context_scope: remote_ssh_discovery_storage
implementation_surfaces: [Plans/storage-plan.md, future SSH remote manifest adapter, future DiscoveryIndex]
node_compile_hint: {mode: remote_manifest_cache_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0054
  - pldg-20260622-001-fff:atom-0061
  - pldg-20260622-001-fff:atom-0069
  - pldg-20260622-001-fff:atom-0070
  - pldg-20260622-001-fff:atom-0079
  - pldg-20260622-001-fff:atom-0083
  - pldg-20260622-001-fff:atom-0085
  - pldg-20260622-001-fff:atom-0091
  - pldg-20260622-001-fff:state/precision_contract.json#ssh_topology
source_atom_ids: [atom-0054, atom-0061, atom-0069, atom-0070, atom-0079, atom-0083, atom-0085, atom-0091]
preserved_exact_tokens: ["local DiscoveryService plus SSH remote manifest adapter", "git ls-files", "authorized remote project root", "remote_identity", "host_alias_or_host_fingerprint", "credential_handle_ref without secret material", "remote_cache", "ssh_manifest", "no silent local substitution"]
negative_constraints:
  - Do not require a persistent PM remote daemon for MVP.
  - Do not silently fallback from SSH or remote projects to unrelated local filesystem paths.
  - Do not include secrets in cache keys, receipts, diagnostics, or prompts.
owner_hints: [Plans/storage-plan.md, Plans/WorktreeGitImprovement.md, Plans/FileSafe.md, Plans/Permissions_System.md]
```


## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### SP-219 - Project Scoped Unified History Projection

```yaml
plan_unit_id: SP-219
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: History uses a project-scoped unified read projection for wizard documents, Orchestrator runs, artifacts,
  evidence, source lineage, package manifests, retention/archive state, and currentness/action availability. The
  projection is not the mutable authority; it preserves stable refs to immutable source records and is rebuildable
  from wizard save/approval, run lifecycle, artifact/evidence write, archive/unarchive, lineage, and manifest events.
  Stale, corrupt, incomplete, or out-of-sync projection state is detected and surfaced; rebuild never rewrites immutable
  source history or approved/final outputs.
gui_related: false
gui_classification_reason: Projection storage, rebuild, and identity rules are storage/read-model behavior; GUI
  consumers are separate.
depends_on:
- CV-295
unblocks:
- OP-026
- OP-027
- RAP-034
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: history_projection_drift
reasoning_tier: high
context_scope: project_history_projection
implementation_surfaces:
- Plans/storage-plan.md
- future History projection store
node_compile_hint:
  mode: history_projection_read_model
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0008
- pldg-20260626-001-feature-name:atom-0009
- pldg-20260626-001-feature-name:atom-0012
- pldg-20260626-001-feature-name:atom-0024
- pldg-20260626-001-feature-name:atom-0025
- pldg-20260626-001-feature-name:atom-0047
- pldg-20260626-001-feature-name:atom-0048
- pldg-20260626-001-feature-name:atom-0049
- pldg-20260626-001-feature-name:atom-0051
- pldg-20260626-001-feature-name:atom-0052
- pldg-20260626-001-feature-name:atom-0053
- pldg-20260626-001-feature-name:atom-0054
- pldg-20260626-001-feature-name:atom-0056
- pldg-20260626-001-feature-name:atom-0057
- pldg-20260626-001-feature-name:atom-0058
- pldg-20260626-001-feature-name:atom-0059
- chat:misc-history-scope
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Project_Output_Artifacts.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Orchestrator_Page.md
- chat:history-scope-retention-actions-answers
- chat:history-source-index-answer
- chat:history-projection-lifecycle-answer
- chat:history-degraded-mode-answer
source_atom_ids:
- atom-0008
- atom-0009
- atom-0012
- atom-0024
- atom-0025
- atom-0047
- atom-0048
- atom-0049
- atom-0051
- atom-0052
- atom-0053
- atom-0054
- atom-0056
- atom-0057
- atom-0058
- atom-0059
decision_refs:
- dec-0002
- dec-0004
- dec-0008
- dec-0009
- dec-0010
preserved_exact_tokens:
- see historical documents that are made
- by documents I mean the plans and PRD docs that are created by the wizard
- plans and PRD docs
- created by the wizard
- historical orchestrator runs in PM
- historical orchestrator runs
- Runtime-artifact route-state answers "where should the user land," not "how should every panel be laid out when
  they get there."
- artifact_id
- run_id
- thread_id
- attempt_id
- identity-based open
- History versus Ledger
- final/approved outputs
- retained forever by default
- 'yes'
- show everything
- retention/archive rules
- project-scoped unified History index/projection
- source-of-truth shape
- immutable wizard, run, artifact, evidence, and lineage records
- manifest
- History surface
- filters
- exports
- compare
- artifact
- evidence
- rebuildable from immutable source records
- wizard
- run
- lineage
- wizard save/approval
- run lifecycle
- artifact/evidence write
- archive/unarchive
- lineage/manifest events
- stale/out-of-sync state detected and surfaced
- History
- rebuildable
- immutable source records
- approved/final outputs
- sounds good
- read-only viewing with a warning
- stale/out-of-sync
- Rebuild
- block compare/export/reopen/send-forward until rebuild succeeds
- until rebuild succeeds
- currentness
- authority
negative_constraints:
- Do not collapse PRD Builder outputs, Planning Wizard outputs, Plan packs, and runtime artifacts into an anonymous
  flat document list.
- Do not treat mutable draft projections as the same thing as immutable approved packs or historical snapshots.
- Do not show historical runs as ambiguous text summaries without stable run identity.
- Do not lose links to artifacts, evidence, ledger records, usage, or receipts when a run becomes historical.
- Do not use shell-state, current tab, filesystem path, or timestamp heuristics as the primary identity for historical
  documents or runs.
- Do not mint shadow IDs for manifest-backed bundles or receipt-like historical objects.
- Do not apply ordinary draft/intermediate retention cleanup to final/approved outputs by default.
- Do not silently remove final/approved outputs from History.
- Do not promise draft/intermediate rows remain visible forever by default.
- Do not make archived/hidden all-history rows indistinguishable from deleted records.
- Do not implement the History surface as fragile cross-subsystem ad hoc scans at view time.
- Do not make the History read model global or cross-project by default.
- Do not duplicate mutable source-of-truth content into the projection as if it were authoritative.
- Do not lose canonical IDs or lineage refs when projecting History rows.
- Do not mutate historical records through projection updates.
- Do not let UI rows, exports, or compare flows drift into different identity models.
- Do not open or export stale copies without resolving preserved source refs and currentness/authority checks where
  required.
- Do not make the projection the only copy of historical truth.
- Do not make projection corruption unrecoverable when source records remain valid.
- Do not rely on view-time scanning as the primary way to discover normal History changes.
- Do not omit archive/unarchive or lineage/manifest updates from the projection lifecycle.
- Do not let stale projection state silently drive History, export, or compare behavior without detection.
- Do not hide projection corruption/out-of-sync status in logs only.
- Do not repair the projection by rewriting immutable source history.
- Do not mutate approved/final wizard outputs in place during projection rebuild.
- Do not erase source refs when rebuilding.
- Do not hide stale/out-of-sync status while still showing rows.
- Do not allow normal-looking mutable history actions when the projection is stale.
- Do not make rebuild available only as hidden developer tooling.
- Do not rebuild by mutating immutable source records.
- Do not allow compare/export/reopen/send-forward from stale projection state.
- Do not bypass currentness/authority checks just because rebuild is requested.
- Do not treat successful rebuild as automatic permission to bypass currentness or authority checks.
- Do not mutate immutable historical records after rebuild.
owner_hints:
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Project_Output_Artifacts.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/Orchestrator_Page.md
- Plans/UI_Command_Catalog.md
- Plans/FinalGUISpec.md
- Plans/Permissions_System.md
```

### SP-220 - Teach Memory Capture Storage Boundary

```yaml
plan_unit_id: SP-220
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Teach memory capture is explicit and separate from one-off Teacher-guided instruction. Eligible
  Teacher answers may offer Save as taught memory; durable records preserve normalized fact, scope selector thread/project/user,
  source message/thread, secret-safety warning, conflict or supersession state, and user-locked record state. Users
  can inspect, narrow, supersede, revoke, or unlock records; one-off guidance is not auto-saved and secrets must
  not be persisted.
gui_related: false
gui_classification_reason: Durable taught-memory scope and record state are storage behavior; capture UI is owned
  by Assistant Chat.
depends_on:
- ACD-426
unblocks:
- G-026
- ATS-014
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: teach_memory_persistence_drift
reasoning_tier: standard
context_scope: teach_memory_capture_records
implementation_surfaces:
- Plans/storage-plan.md
- future taught memory records
node_compile_hint:
  mode: teach_memory_storage_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0094
- pldg-20260626-001-feature-name:atom-0122
- pldg-20260626-001-feature-name:atom-0123
- pldg-20260626-001-feature-name:atom-0146
- Plans/assistant-chat-design.md#6-Teach
- chat:teach-teacher-correction
- chat:teach-gap-fill-correction
- q-0028
- chat:teach-bundle-accepted-pmconcept-reference
- chat:work-through-teach-gaps
- Plans/assistant-chat-design.md#6-teach
source_atom_ids:
- atom-0094
- atom-0122
- atom-0123
- atom-0146
decision_refs:
- dec-0018
- dec-0019
- dec-0020
- dec-0024
correction_refs:
- corr-0003
preserved_exact_tokens:
- Teach
- Teacher
- remember that...
- for this repo always...
- please prefer...
- ordinary one-off chat instructions do not become taught knowledge unless the user explicitly confirms persistence
- taught memory
- memory scope
- durable
- user-approved
- current thread
- current project
- feature area
- scope selector
- edit/delete
- one-off Teacher instruction
- user-locked record
- must not silently overwrite
- rejects an update
- resolves a conflict
- pins a correction
- unlock/edit flow
- conflict display
- Save as taught memory
- normalized fact
- thread
- project
- user
- source message/thread
- secret-safety warning
- conflict/supersession preview
- Save/Cancel
- inspect
- narrow
- supersede
- revoke
- unlock
negative_constraints:
- Do not make Teacher-guided instruction automatically persist memory.
- Do not make durable Teach capture a closed mode overlay detached from the current thread runtime/mode selection.
- Do not weaken existing `user-locked` Teach records through automated cleanup or summarization.
- Do not persist Teach conversation content as memory without confirmation.
- Do not use taught memory outside its approved scope.
- Do not bury edit/delete controls away from the memory explanation.
- Do not let later Teach runs overwrite locked corrections without explicit user action.
- Do not cite a locked record without showing its scope/source when relevant.
- Do not auto-save one-off Teacher guidance as taught memory.
- Do not persist secrets, tokens, passwords, or credentials.
- Do not allow conflicting teachings to silently overwrite prior locked records.
owner_hints:
- Plans/assistant-chat-design.md
- Plans/Prompt_Pipeline.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/Personas.md
- Plans/Glossary.md
- Plans/FinalGUISpec.md
```

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into Storage Plan owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### SP-221 - Inline Visualizer V2 State And Replay Storage

```yaml
plan_unit_id: SP-221
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Inline visualizer v2 persists source fragment, title/type/version, render config, approved bridge metadata,
  PM-managed state outputs, visible fallback or error state, and replay/re-render lineage scoped by project, thread,
  message, and visualizer artifact. Reload re-renders from source/config when practical; screenshot or snapshot
  fallback is stored only when re-render is impractical. PM-managed bridge state uses the namespace
  `visualizer_state.v1:{project_id}:{thread_id}:{message_id}:{visualizer_artifact_id}`, stores only
  JSON-serializable values under quota, records the bridge method and schema version that wrote the state, and exposes
  replay, export, and purge boundaries. Runtime heap, same-origin storage, raw parent localStorage, secrets, and
  diagnostic payload leaks are never persistence sources.
gui_related: false
gui_classification_reason: Defines durable visualizer record scope and replay storage behavior; visible rendering is owned by GUI and Assistant Chat.
depends_on: [ACD-427, CV-300]
unblocks: [RAP-037, ATS-015]
acceptance_criteria:
  - Visualizer records are scoped by project, thread, message, and visualizer artifact.
  - Reload can replay from persisted source/config/state or show the stored fallback/error state.
  - PM-managed visualizer state is namespaced, quota-bound, JSON-serializable, and reload/export/purge aware.
  - PM-managed state outputs are allowed; raw parent localStorage and runtime heap persistence are forbidden.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Inline visualizer reload and export storage fixtures
risk_class: inline_visualizer_replay_storage_gap
reasoning_tier: high
context_scope: inline_visualizer_v2_storage
implementation_surfaces:
  - Plans/storage-plan.md
  - future visualizer artifact records
node_compile_hint:
  mode: inline_visualizer_v2_storage_replay
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/inline_visualizer_v2_readiness_matrix.json:iv2-persistence-reload-security
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0060
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0088
source_atom_ids: [atom-0060, atom-0088]
preserved_exact_tokens:
  - "source fragment"
  - "title/type/version"
  - "render config"
  - "approved bridge metadata"
  - "PM-managed state outputs"
  - "visualizer_state.v1:{project_id}:{thread_id}:{message_id}:{visualizer_artifact_id}"
  - "project/thread/message/visualizer artifact"
  - "screenshot/snapshot fallback"
  - "raw parent localStorage"
negative_constraints:
  - Do not persist runtime heap as visualizer state.
  - Do not read or write raw parent localStorage from the visualizer iframe.
  - Do not store secrets or unredacted diagnostic payloads in visualizer replay records.
owner_hints:
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
```

### SP-222 - Notification Settings Destinations Receipts And Sound Assets Storage

```yaml
plan_unit_id: SP-222
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Notification storage separates non-secret settings, destination definitions, sound mappings, sound asset manifests,
  uploaded/imported sound blobs, and delivery attempt receipts. Record keys include `notification_settings.v1:global`,
  project-scoped settings, `notification_destination.v1:{scope}:{destination_id}`,
  `notification_sound_mapping.v1:{scope}:{event_category}`, and `sound_asset_manifest.v1:{scope}:{sound_id}`.
  Destination records include provider_kind, scope, enabled state, display_name, event_category allowlist, quiet/focus
  policy, rate_limit_profile, idempotency profile, last_test_receipt_ref, and provider-specific profile payloads for
  Slack, Discord, generic webhook, ntfy, Pushover, and Telegram as defined by CV-298. Webhook and push tokens are stored
  only as OS credential references; receipts store redacted request and response digests, provider kind, destination id,
  event id, event category, status class, HTTP status, provider request/message id when available, retry count, next
  retry time, redaction profile, idempotency key, and secret refs only. Built-in sound manifests include sound_id,
  built_in/user_uploaded/imported source_kind, display_name, source_url_or_package_ref, license_ref, attribution,
  version, format, duration_ms, loudness_normalization, sha256, disabled/hidden state, and default event_category
  mappings.
gui_related: false
gui_classification_reason: Defines durable settings, credential references, sound assets, and delivery receipt records; GUI renders them elsewhere.
depends_on: [CV-298, PS-124]
unblocks: [F3-405, RAP-039, ATS-016]
acceptance_criteria:
  - Non-secret notification settings and sound manifests are durable and scope-aware.
  - Provider-specific destination profile payloads are persisted as credential refs and non-secret settings, not as raw tokens or URLs.
  - Built-in normal notification sounds carry source, license, attribution, version, duration, hash, and default event-category mapping metadata.
  - Webhook URLs, tokens, and push credentials are represented only by credential refs outside redb/plain settings.
  - Uploaded sound assets validate MIME/header/decode/path, cap at 5 MiB and 10 seconds decoded, warn above 3 seconds, normalize to PM-managed copies, trim silence, hash duplicates, soft-delete user assets, and never export secrets.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Notification settings and sound asset storage fixtures
risk_class: notification_storage_secret_leak
reasoning_tier: high
context_scope: notifications_sounds_storage
implementation_surfaces:
  - Plans/storage-plan.md
  - future notification settings records
  - future sound asset records
node_compile_hint:
  mode: notifications_sounds_storage
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-destination-record-schema
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-retry-rate-receipt-contract
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-global-project-overrides
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:sound-catalog-default-mappings
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:sound-upload-asset-lifecycle
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0061
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0063
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0064
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0065
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0066
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0067
source_atom_ids: [atom-0061, atom-0063, atom-0064, atom-0065, atom-0066, atom-0067]
preserved_exact_tokens:
  - "notification_settings.v1:global"
  - "notification_destination.v1:{scope}:{destination_id}"
  - "notification_sound_mapping.v1:{scope}:{event_category}"
  - "sound_asset_manifest.v1:{scope}:{sound_id}"
  - "provider_kind"
  - "event_category"
  - "rate_limit_profile"
  - "idempotency"
  - "source_kind"
  - "license_ref"
  - "source_url_or_package_ref"
  - "WAV"
  - "MP3"
  - "OGG"
  - "5MiB"
  - "10s"
  - "warn >3s"
  - "soft-delete"
negative_constraints:
  - Do not store webhook URLs or provider tokens in non-secret settings.
  - Do not export secrets with sound packs or notification settings.
  - Do not hard-delete built-in sounds; built-ins may be hidden or disabled.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Permissions_System.md
  - Plans/FinalGUISpec.md
```

### SP-223 - DRY Setting Receipt And Rules Provenance Storage

```yaml
plan_unit_id: SP-223
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  DRY Method storage preserves the application setting `app.agent_rules.dry_method_default_guard` as enabled or
  disabled_by_user with default enabled, plus run/turn receipts carrying `instruction_bundle_ref`,
  `rules_application_sha256`, `rules_project_sha256`, `dry_method_effective_state`, `dry_method_reason`, and
  `dry_method_source_refs`. Turning DRY off disables only the default DRY guard and DRY-specific caveat/block behavior;
  it does not delete receipt provenance or disable explicit instructions, safety, secrets, source authority,
  governance phase boundaries, permissions, or source-control hygiene.
gui_related: false
gui_classification_reason: Defines durable setting and provenance/receipt fields rather than visible presentation.
depends_on: [ARC-036, CV-299]
unblocks: [F3-406, ATS-018]
acceptance_criteria:
  - The stored enum is exactly enabled or disabled_by_user, with enabled as the default.
  - Run-start minimum fields include instruction_bundle_ref, rules_application_sha256, rules_project_sha256, dry_method_effective_state, and dry_method_reason.
  - DRY-off state remains auditable through receipts and does not weaken non-DRY authority boundaries.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - DRY setting and receipt persistence fixtures
risk_class: dry_method_provenance_storage_gap
reasoning_tier: high
context_scope: dry_method_storage
implementation_surfaces:
  - Plans/storage-plan.md
  - future run receipts
node_compile_hint:
  mode: dry_method_setting_receipt_storage
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-rules-provenance
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-default-001
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-default-002
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-val-002
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0075
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0083
source_atom_ids: [atom-0073, atom-0075, atom-0083]
decision_refs: [dec-0016]
preserved_exact_tokens:
  - "app.agent_rules.dry_method_default_guard"
  - "enabled"
  - "disabled_by_user"
  - "instruction_bundle_ref"
  - "rules_application_sha256"
  - "rules_project_sha256"
  - "dry_method_effective_state"
  - "dry_method_reason"
  - "dry_method_source_refs"
negative_constraints:
  - Do not make disabling DRY delete receipts or provenance.
  - Do not treat disabled DRY as permission to bypass safety, secrets, source authority, governance, permissions, or source-control hygiene.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/agent-rules-context.md
```

## Ledger Compile Addendum - pldg-20260629-001-feature-name

This addendum compiles Free Models storage requirements for import snapshots, currentness, activation/quarantine/rollback, and redacted diagnostics. It does not create WorkNodes, NodeSeeds, executable queues, generated governance artifacts, or implementation files.

### SP-224 - Free Models Import Snapshot Alias And Currentness Storage

```yaml
plan_unit_id: SP-224
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  PM persists Free Models trusted source state, source resolver outcomes, source refs, release/tag/commit/npm/changelog/source hashes, current and previous imported catalog snapshots, import disposition, check cadence/timestamps, stable internal imported ids, and alias/rename/provider-move mappings. Storage keeps underlying provider/account/model/source identity intact and stores secret material only as credential references, never raw secrets.
gui_related: false
gui_classification_reason: Defines persistence records, not user-visible visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
  - Import snapshots preserve current and previous source state with hashes and source refs.
  - Alias/rename/provider-move mappings keep top-10 lists, section settings, Usage history, and diagnostics stable across upstream churn.
  - Secrets are represented only by refs and never raw secret/token values.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models import snapshot persistence fixtures
  - Alias/rename/provider-move persistence fixtures
risk_class: import_snapshot_storage_drift
reasoning_tier: high
context_scope: free_models_import_storage
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Models_System.md
node_compile_hint:
  mode: free_models_import_snapshot_storage_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/source_shards/free_coding_models_upstream_inspection_20260629.json
source_atom_ids: [atom-0011, atom-0017, atom-0020, atom-0025, atom-0051, atom-0052, atom-0057, atom-0071, atom-0129, atom-0193, atom-0194, atom-0197, atom-0198, atom-0242, atom-0250, atom-0258, atom-0262, atom-0289, atom-0290]
preserved_exact_tokens:
  - "source/ref/version"
  - "source/ref/hash"
  - "Last checked"
  - "Last updated"
  - "stable PM internal IDs"
  - "upstream alias/rename mappings"
negative_constraints:
  - Do not store raw secret material in Free Models import snapshots.
  - Do not lose alias/rename/provider-move history during Auto Apply updates.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Models_System.md
```

### SP-225 - Free Models Activation Quarantine Rollback And Diagnostics Storage

```yaml
plan_unit_id: SP-225
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  PM persists Free Models activation receipts, last-known-good refs, quarantine state, rollback evidence, failed-check state, route impact, affected provider/model ids, redaction profile, redaction summary, and support export manifests. Failed or quarantined updates keep the current known-good state active. Diagnostics/export may preserve source/ref/hash and route impact while raw secrets, tokens, provider error payloads, and sensitive provider responses remain redacted or Advanced/Support-only.
gui_related: false
gui_classification_reason: Defines stored receipts and export manifests; GUI projection is owned elsewhere.
depends_on: []
unblocks: []
acceptance_criteria:
  - Failed/quarantined updates preserve last-known-good active state and write quarantine/rollback evidence.
  - Support exports include redaction profile and redaction summary.
  - Raw secrets/tokens and raw provider error payloads are never stored or exported in unredacted normal records.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models quarantine and rollback storage fixtures
  - Redacted diagnostics export fixtures
risk_class: rollback_diagnostics_storage_drift
reasoning_tier: high
context_scope: free_models_activation_storage
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: free_models_activation_diagnostics_storage_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0034, atom-0061, atom-0064, atom-0066, atom-0070, atom-0083, atom-0087, atom-0178, atom-0182, atom-0225, atom-0229, atom-0233, atom-0237, atom-0241, atom-0245, atom-0249, atom-0252, atom-0253, atom-0256, atom-0260, atom-0264, atom-0277, atom-0278, atom-0287, atom-0288, atom-0291, atom-0292]
preserved_exact_tokens:
  - "current known-good state active"
  - "Free Models update needs attention"
  - "Retry check"
  - "View details"
  - "redacted copy/export"
  - "redaction summary"
  - "secrets/tokens always redacted"
  - "The user can’t fix this"
negative_constraints:
  - Do not expose secrets or tokens in Advanced/Support diagnostics.
  - Do not export raw secrets or tokens in diagnostics copy/export.
  - Do not expose raw provider error payloads in normal expanded availability rows.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Permissions_System.md
```

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host persistence, projection, cleanup, and retention records. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### SP-226 - Containerized Host Persistence Projection And Cleanup Records

```yaml
plan_unit_id: SP-226
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  PM persists containerized-host profiles, instances, assignments, build artifacts, port access records, capability
  states, preflight receipts, execution receipts, TestRunReceipt host proof refs, cleanup_retention_receipt records,
  blocker payloads, and projection indexes under PM-owned identity. Host records preserve host_capability_ref,
  host_profile_id, host_instance_id, host_assignment_id, runtime_family, runtime_context_ref, permission_snapshot_id,
  filesafe_scope_ref, redaction_profile, retention_state, cleanup_policy, cleanup receipt refs, stale_window_expires_at_utc,
  confidence, health_state, source, and blocked_reason_code. Instances are ephemeral by default, retain-on-failure is
  explicit, and stale/orphaned resources reconcile through retained_for_debug, cleanup_pending, cleaned, orphaned, or
  historical states rather than inference from missing runtime resources.
gui_related: false
gui_classification_reason: Persistence, projection, and cleanup records are storage/data behavior, not GUI presentation.
depends_on: [CV-303, CRAU-091, PS-126, F2-194]
unblocks: [RAP-042, ATS-019, EP-109, F3-410]
acceptance_criteria:
  - Stored host profiles, instances, assignments, artifacts, access records, receipts, and blockers use PM-owned ids and preserve backend facts separately.
  - Dynamic port/access discoveries persist with source, confidence, health, staleness, redaction, and manual override state rather than becoming unqualified canon.
  - Failed or retained instances cannot disappear without cleanup_retention_receipt or explicit orphan reconciliation state.
  - Raw secrets, decrypted env values, registry credentials, and secret-bearing outputs are absent from persisted records and exports.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future containerized host storage schema fixtures
  - future cleanup/orphan reconciliation fixtures
risk_class: containerized_host_storage_drift
reasoning_tier: high
context_scope: containerized_host_persistence
implementation_surfaces:
  - Plans/storage-plan.md
  - future redb host profile, instance, assignment, access, receipt, and projection stores
node_compile_hint:
  mode: containerized_host_persistence_projection_records
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0012
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0015
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0016
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0020
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0039
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0048
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0058
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0063
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0066
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0067
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0072
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0075
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0078
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0079
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#core_contracts
source_atom_ids: [atom-0012, atom-0015, atom-0016, atom-0020, atom-0039, atom-0048, atom-0058, atom-0063, atom-0066, atom-0067, atom-0072, atom-0075, atom-0078, atom-0079]
decision_refs: [dec-0012, dec-0013, dec-0020]
preserved_exact_tokens:
  - "ephemeral instances by default"
  - "retain-on-failure"
  - "cleanup/retention"
  - "cleanup_retention_receipt"
  - "stale_window_expires_at_utc?"
  - "redaction_profile"
  - "retained_for_debug"
  - "cleanup_pending"
  - "orphaned"
  - "port_access_ref"
  - "dynamic URLs remain visible"
  - "canonical ports/URLs"
  - "confidence"
  - "health_state"
  - "source"
negative_constraints:
  - Do not persist transient port discoveries as canonical state without source/confidence/staleness.
  - Do not infer cleanup from missing runtime resources; use reference_state and cleanup receipts.
  - Do not silently discard failed host instances before receipts/artifacts are available.
  - Do not store raw secrets, decrypted env values, or unredacted registry credentials.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
```

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### SP-227 - P0-HISTORY-STORAGE-CAPS

```yaml
plan_unit_id: SP-227
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  P0-HISTORY-STORAGE-CAPS (P0) is compiled as canonical Puppet Master intent for Bounded session/history storage: Add HistoryObjectBudget and ManagedOutputRef requirements. Segment large histories by reference; never inline unbounded JSON into model context. The preserved PM gap/delta is: Need explicit per-record, per-turn, per-tool-result, and per-thread cap policy with managed-output references and context compiler backpressure. The observed external-repo signal remains source-lineage evidence: Agent Zero issue list reports chat history metadata ~127MB and raw JSON pollution of utility-model context; Cline issues/PRs target large MCP result crashes and compacted provider history; Pi has a SQLite session-storage PR.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- 127MB metadata fixture is rejected/segmented before UI or model context load.
- Context compiler emits compact summaries plus refs, not raw massive JSON.
- Large tool results remain retrievable from artifacts with hashes.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- 127MB metadata fixture is rejected/segmented before UI or model context load.
- Context compiler emits compact summaries plus refs, not raw massive JSON.
- Large tool results remain retrievable from artifacts with hashes.
risk_class: p0_memory_history_logging_hardening
reasoning_tier: high
context_scope: memory_history_logging
implementation_surfaces:
- Plans/storage-plan.md
- Plans/Prompt_Pipeline.md
- Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: p0_history_storage_caps
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0011
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0011
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0007/P0-HISTORY-STORAGE-CAPS@line=7
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0007/P0-HISTORY-STORAGE-CAPS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:7
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0011
external_atom_id: extrepo-20260703-0007
source_row_id: P0-HISTORY-STORAGE-CAPS
priority: P0
finding_family: Bounded session/history storage
source_repos:
- agent0ai/agent-zero
- cline/cline
- earendil-works/pi
target_docs:
- Plans/storage-plan.md
- Plans/Prompt_Pipeline.md
- Plans/Runtime_Artifacts_Panel.md
owner_hints:
- Plans/storage-plan.md
- Plans/Prompt_Pipeline.md
- Plans/Runtime_Artifacts_Panel.md
preserved_exact_tokens:
- extrepo-20260703-0007
- P0-HISTORY-STORAGE-CAPS
- P0
- Bounded session/history storage
- agent0ai/agent-zero
- cline/cline
- earendil-works/pi
negative_constraints: []
observed_signal: Agent Zero issue list reports chat history metadata ~127MB and raw JSON pollution of utility-model context; Cline issues/PRs target large MCP result crashes and compacted provider history; Pi has a SQLite session-storage PR.
pm_current_coverage: PM uses seglog/redb/checkpoints and says transcript retention is bounded/honest.
pm_gap_or_delta: Need explicit per-record, per-turn, per-tool-result, and per-thread cap policy with managed-output references and context compiler backpressure.
proposal_or_recommendation: Add HistoryObjectBudget and ManagedOutputRef requirements. Segment large histories by reference; never inline unbounded JSON into model context.
compile_disposition: create_new_planunit
```

### SP-228 - P1-RESOURCE-QUOTAS-INDEXERS-WATCHERS

```yaml
plan_unit_id: SP-228
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  P1-RESOURCE-QUOTAS-INDEXERS-WATCHERS (P1) is compiled as canonical Puppet Master intent for Resource ceilings for indexers/watchers/background agents: Add RuntimeResourceGovernor PlanUnit with quotas, backoff, suspension, prioritization, and Explain/Resume controls. The preserved PM gap/delta is: Need per-project/global file watcher, indexer, terminal transcript, MCP result, and agent-context budgets with user-visible degradation. The observed external-repo signal remains source-lineage evidence: Warp issue reports exhausting hundreds of thousands of file watchers; Agent Zero history bloat crashes; Cline large MCP/history issues.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Large repo cannot allocate unbounded watchers.
- Quota exceeded degrades with warning and exact subsystem, not crash.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Large repo cannot allocate unbounded watchers.
- Quota exceeded degrades with warning and exact subsystem, not crash.
risk_class: p1_provider_capability_and_metadata_hardening
reasoning_tier: standard
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/storage-plan.md
- Plans/FileManager.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: p1_resource_quotas_indexers_watchers
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0016
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0016
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0012/P1-RESOURCE-QUOTAS-INDEXERS-WATCHERS@line=12
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0012/P1-RESOURCE-QUOTAS-INDEXERS-WATCHERS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:12
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0016
external_atom_id: extrepo-20260703-0012
source_row_id: P1-RESOURCE-QUOTAS-INDEXERS-WATCHERS
priority: P1
finding_family: Resource ceilings for indexers/watchers/background agents
source_repos:
- warpdotdev/warp
- agent0ai/agent-zero
- cline/cline
target_docs:
- Plans/FileManager.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FinalGUISpec.md
owner_hints:
- Plans/FileManager.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0012
- P1-RESOURCE-QUOTAS-INDEXERS-WATCHERS
- P1
- Resource ceilings for indexers/watchers/background agents
- warpdotdev/warp
- agent0ai/agent-zero
- cline/cline
negative_constraints: []
observed_signal: Warp issue reports exhausting hundreds of thousands of file watchers; Agent Zero history bloat crashes; Cline large MCP/history issues.
pm_current_coverage: PM has dirty-layer watcher design and storage rollups but not a global resource-governor narrative for all background services.
pm_gap_or_delta: Need per-project/global file watcher, indexer, terminal transcript, MCP result, and agent-context budgets with user-visible degradation.
proposal_or_recommendation: Add RuntimeResourceGovernor PlanUnit with quotas, backoff, suspension, prioritization, and Explain/Resume controls.
compile_disposition: create_new_planunit
```

### SP-229 - P0-SYSTEM-RESOURCE-GOVERNOR

```yaml
plan_unit_id: SP-229
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  P0-SYSTEM-RESOURCE-GOVERNOR (P0) is compiled as canonical Puppet Master intent for System memory/process/file-watcher/resource management: Define RuntimeResourceGovernor: memory budgets, queue budgets, process pools, stale helper reaper, file-watcher caps, terminal scrollback/transcript retention, MCP transport cleanup, crash snapshot budget, low-memory degradation mode, and GUI-visible resource alerts. The preserved PM gap/delta is: PM needs a cross-runtime resource governor with explicit limits and cleanup for GUI renderer, PTY terminal, agents, MCP, browser/device sessions, file watchers, logs, memory stores, and helper processes. The observed external-repo signal remains source-lineage evidence: Ghostty reports major memory leaks under long-running Claude Code sessions; Warp reports CPU hangs and large-output TUI crashes; Codex reports stale Computer Use/MCP/app-server helper accumulation; Agent Zero reports large chat.json/memory scalability issues.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Closing/crashing PM reaps child helpers or marks them orphaned for cleanup.
- Huge terminal output applies backpressure without GUI freeze.
- Memory store and chat/session files have size/compaction policies.
- Low-memory mode disables optional previews/agents before core runtime fails.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Closing/crashing PM reaps child helpers or marks them orphaned for cleanup.
- Huge terminal output applies backpressure without GUI freeze.
- Memory store and chat/session files have size/compaction policies.
- Low-memory mode disables optional previews/agents before core runtime fails.
risk_class: p0_memory_history_logging_hardening
reasoning_tier: high
context_scope: memory_history_logging
implementation_surfaces:
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
- Plans/Goal_Runtime_System.md
- Plans/MCP_Integration.md
- Plans/Tools.md
node_compile_hint:
  mode: p0_system_resource_governor
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0067
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0067
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0063/P0-SYSTEM-RESOURCE-GOVERNOR@line=9
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0063/P0-SYSTEM-RESOURCE-GOVERNOR
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:9
source_atom_ids:
- atom-0067
external_atom_id: extrepo-20260703-0063
source_row_id: P0-SYSTEM-RESOURCE-GOVERNOR
priority: P0
finding_family: System memory/process/file-watcher/resource management
source_repos:
- Ghostty
- Warp
- Codex
- Agent Zero
- Cline
target_docs:
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
- Plans/Goal_Runtime_System.md
- Plans/MCP_Integration.md
- Plans/Tools.md
owner_hints:
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
- Plans/Goal_Runtime_System.md
- Plans/MCP_Integration.md
- Plans/Tools.md
preserved_exact_tokens:
- extrepo-20260703-0063
- P0-SYSTEM-RESOURCE-GOVERNOR
- P0
- System memory/process/file-watcher/resource management
- Ghostty
- Warp
- Codex
- Agent Zero
- Cline
negative_constraints: []
observed_signal: Ghostty reports major memory leaks under long-running Claude Code sessions; Warp reports CPU hangs and large-output TUI crashes; Codex reports stale Computer Use/MCP/app-server helper accumulation; Agent Zero reports large chat.json/memory scalability issues.
pm_current_coverage: FinalGUISpec and storage-plan include terminal projection throttling/ring buffers, memory-bounds risks, file watcher risk, persistence, and crash recovery.
pm_gap_or_delta: PM needs a cross-runtime resource governor with explicit limits and cleanup for GUI renderer, PTY terminal, agents, MCP, browser/device sessions, file watchers, logs, memory stores, and helper processes.
proposal_or_recommendation: 'Define RuntimeResourceGovernor: memory budgets, queue budgets, process pools, stale helper reaper, file-watcher caps, terminal scrollback/transcript retention, MCP transport cleanup, crash snapshot budget, low-memory degradation mode, and GUI-visible resource alerts.'
compile_disposition: create_new_planunit
```
