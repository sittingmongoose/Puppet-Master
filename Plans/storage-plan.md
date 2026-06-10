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
- `validation_pass_report`
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
- `validation_pass_report`
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
