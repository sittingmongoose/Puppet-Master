# Missing Transfer Report

## Interpretation rule
- `open_gaps.json` remains the registered `84`-gap baseline inventory.
- This report records the later semantic audit findings that **supersede the older blunt migrated wording** when a gap id appears here.
- A gap remaining open does **not** always mean "nothing transferred." Many live failures are now known to be anchor-only, partially transferred, over-summarized, or stale-contradictory.

## Summary
- Registered live transfer failures: `84`
- Registered baseline failure counts: missing structural heading `27`, stubbed consumer propagation `40`, over-summarized transfer `6`, other `11`
- Deep-audit refinement groups applied to registered gaps: `10`
- Cross-cutting findings added beyond the older migrated wording: `13`

## Registered gap refinements

### 1. Runtime identity, routing, permissions, and auth anchors
- gap ids: `FIDELITY-001`, `FIDELITY-002`, `FIDELITY-010`, `FIDELITY-011`, `FIDELITY-021`, `FIDELITY-022`, `FIDELITY-023`
- exact canon item: `execution_unit_context`, exact `route_target` closure, blocked-episode permission snapshot identity, and stable GitHub account keying must remain as explicit owner canon.
- where partial/stubbed transfer currently appears: `Plans/Contracts_V0.md` carries related runtime packet and route prose; `Plans/Executor_Protocol.md` carries large parts of the runtime identity extension; `Plans/Permissions_System.md` has nearby scope/snapshot prose; `Plans/GitHub_API_Auth_and_Flows.md` has live token/keying rules.
- what is still missing: the `5.1B` owner anchor; `operational_identity`; exact closed `target_kind`; `blocked_sequence`, `approval_scope_key`, `execution_entity_id`, `lane_id`, `package_id`, `account_id`; explicit credential-store keying heading and canonical key fields; removal of stale survivors `detached_window`, `TierContext`, `tier_id`, `work_package_id`, and `feature_seam_id`.
- failure type: missing structural heading; over-summarized transfer; stale contradictory residue.

### 2. Storage, runtime-artifact persistence, and receipt bridge canon
- gap ids: `FIDELITY-003`, `FIDELITY-004`, `FIDELITY-005`, `FIDELITY-006`, `FIDELITY-016`, `FIDELITY-017`, `FIDELITY-018`, `FIDELITY-019`, `FIDELITY-020`
- exact canon item: storage must own exact runtime-artifact key families, explicit historical/archive lifecycle semantics, receipt bridge fields, and projector/export behavior.
- where partial/stubbed transfer currently appears: `Plans/storage-plan.md` already carries many lifecycle tokens and some key families; `Plans/Runtime_Artifacts_Panel.md`, `Plans/Project_Output_Artifacts.md`, and related surfaces already reference runtime artifacts and receipts.
- what is still missing: `### Required redb keys`; `orchestrator.project_state.{project_id}` and its field shape; explicit semantics for `historical`, `archived`, `removed`; exact receipt precedence and correctness rules for `attempt_id`, `usage_event_ref`, `provider_attempt_ref`, `workflow_run_id`, and downstream bridge refs; retirement of old artifact-index and `task_id` residue; projector/export/degrade behavior keyed by projection freshness and health.
- failure type: missing structural heading; over-summarized transfer; stale contradictory residue.

### 3. Validation-pass and downstream handoff lineage
- gap ids: `FIDELITY-007`, `FIDELITY-024`
- exact canon item: `validation_pass_report` must remain an upstream artifact with full planning/runtime lineage and an exact downstream handoff shape.
- where partial/stubbed transfer currently appears: `Plans/Project_Output_Artifacts.md` and `Plans/chain-wizard-flexibility.md` mention validation/report and handoff concepts.
- what is still missing: owner headings; exact fields `workflow_run_id`, `pass_verdict`, `phase_plan_ref`, `staged_bundle_ref`, `requirements_quality_report_ref`, `execution_role`, `effective_account_id`, `run_id`, `launch receipt`, and `promoted package ref`.
- failure type: missing structural heading; stubbed owner section.

### 4. Help/glossary owner canon is partial backbone, not full transfer
- gap ids: `FIDELITY-008`, `FIDELITY-009`
- exact canon item: the live docs need owned help/glossary sections for rewrite terms plus routing/runtime terms, using the canonical help-entry contract.
- where partial/stubbed transfer currently appears: `Plans/Glossary.md` now has token lists, `Required fields` schema fragments, and some source-control definitions; `Plans/FinalGUISpec.md` carries one strong safe-point rule; `Plans/WorktreeGitImprovement.md` cites help governance.
- what is still missing: `### Orchestrator rewrite terms`; runtime/routing term owner section; instantiated 7-field entries; `related_concepts[]`; `canonical_help_entry_ref`; `blocked_owner_kind`; `alert_level`; confusion-pair help entries; replacement of the dead `FinalGUISpec.md §7.4.0` reference with an actual section.
- failure type: missing structural heading; skeletal owner section; over-summarized transfer.

### 5. Open-subject, route-target, and command normalization canon
- gap ids: `FIDELITY-029`, `FIDELITY-039`, `FIDELITY-040`, `FIDELITY-041`, `FIDELITY-042`, `FIDELITY-043`, `FIDELITY-054`, `FIDELITY-055`
- exact canon item: `OpenSubject`, command-envelope normalization, command policy dimensions, search-route payloads, and recovery-command canon must survive as stable owner sections.
- where partial/stubbed transfer currently appears: `Plans/FileManager.md` references `OpenSubject`; `Plans/UI_Command_Catalog.md` now carries command tables, search/open text, and some normalization ideas; recovery-command canon exists but is buried after `## References` without the required heading.
- what is still missing: exact `route_target` payload shape including `project_id`, selector exclusivity, subject-id families, shell destinations, and inspector targets; exact `subject_id` families (`doc:<document_id>`, `artifact:<artifact_id>` and peers); `command_kind`; `normalization.kind`; `normalizes_to_contract`; per-command policy fields such as `action_type`, `target_scope`, `palette_visible`, `shortcut_eligible`, `confirmation_strength`, `reversibility`; canonical labels for search/open/details/history; search still mixes the shared route payload with stale `result_id`.
- failure type: missing structural heading; semantic under-transfer; stale contradictory survivor.

### 6. Orchestrator / Final GUI structure is closer than the old bundle said, but still incomplete
- gap ids: `FIDELITY-056`, `FIDELITY-058`, `FIDELITY-060`, `FIDELITY-062`, `FIDELITY-063`, `FIDELITY-070`, `FIDELITY-073`
- exact canon item: Orchestrator and Final GUI need discoverable owner sections for scope, history, current-vs-historical behavior, concern/notification model, runtime/help split, and historical-run routing.
- where partial/stubbed transfer currently appears: the live docs already carry meaningful prose for scope, concern lifecycle, run identity, and provider/runtime status.
- what is still missing: the actual section anchors; history/current-vs-historical headings; concern model heading; closed `owner_kind` and alert-level families; historical-run route extension and exact fields; help/disclosure split that keeps runtime readiness separate from ELI5/Expert help architecture.
- failure type: missing structural heading; wrong section allocation; over-summarized transfer.

### 7. Chat, HITL, Tools, and wiring still fail on blocked-episode identity
- gap ids: `FIDELITY-012`, `FIDELITY-049`, `FIDELITY-050`, `FIDELITY-051`, `FIDELITY-052`, `FIDELITY-053`, `FIDELITY-074`, `FIDELITY-075`
- exact canon item: blocked-state lifecycle, approval identity, tool attribution, and approval-ladder fields must line up across chat, wiring, Tools, and HITL.
- where partial/stubbed transfer currently appears: `Plans/assistant-chat-design.md` carries parts of the blocked-state model; `Plans/Tools.md` documents ask flows; `Plans/human-in-the-loop.md` carries approval ladder prose; `Plans/Wiring.md` carries activation/projection wiring.
- what is still missing: `blocked_sequence`, `approval_scope_key`, `report_ref`, `startup_recovered`, `action_available`, `escalation_level`, exact blocked-state persistence rules, and the newer blocked-episode shape replacing the stale `{ tool_name, invocation_summary, options }` approval payload.
- failure type: stubbed consumer propagation; semantic under-transfer; stale contradictory survivor.

### 8. Usage, interview, and subagent surfaces have meaningful transfer but still force invention
- gap ids: `FIDELITY-076`, `FIDELITY-077`, `FIDELITY-078`, `FIDELITY-079`, `FIDELITY-080`, `FIDELITY-081`, `FIDELITY-082`, `FIDELITY-083`, `FIDELITY-084`, `FIDELITY-085`
- exact canon item: requested/effective runtime identity, subagent attribution, projection trust state, account history, and usage artifact drill-through must use the same shared packet families.
- where partial/stubbed transfer currently appears: `Plans/orchestrator-subagent-integration.md`, `Plans/interview-subagent-integration.md`, `Plans/usage-feature.md`, `Plans/Run_Modes.md`, and `Plans/Prompt_Pipeline.md` now carry meaningful runtime-identity prose and some minimum schemas.
- what is still missing: retirement of `TierContext`/`tier_id`; exact account-side requested/effective fields; named unified attribution packet; five-state projection freshness/health ladder; blocked-owner vocabulary; full escalation ladder; bridge-field precedence; append-only account history families `account_pressure_episode` and `account_switch_event`; exact validation-pass bridge payload.
- failure type: partial transfer; over-summarized transfer; stale contradictory residue.

### 9. Stale-survivor corrections that the older migrated bundle was under-describing
- exact canon item: old-system aliases and unauthorized enums must be actively retired, not merely outvoted by newer prose.
- where partial/stubbed transfer currently appears: `detached_window` in routing; `TierContext`, `tier_id`, `work_package_id`, and `feature_seam_id` in execution/subagent docs; `task_id` and old artifact index forms across storage/artifact docs; stale approval payload shape in `Tools.md`.
- what is still missing: explicit retirement, replacement, and "must not remain present" treatment in the live docs.
- failure type: stale contradictory survivor.

### 10. Overstated prior gaps that remain open for narrower reasons
- exact canon item: the bundle must not claim total absence when there is already partial transfer that implementers could rely on incorrectly.
- where partial/stubbed transfer currently appears: `FIDELITY-023`, `FIDELITY-040`, `FIDELITY-041`, `FIDELITY-042`, `FIDELITY-056`, `FIDELITY-062`, `FIDELITY-070`, `FIDELITY-079`, `FIDELITY-082`.
- what is still missing: exact headings, field sets, closed enums, cross-surface propagation, or stale-survivor cleanup.
- failure type: over-summarized prior migrated wording.

## Cross-cutting findings not cleanly represented by one legacy gap id

### Help system architecture
- exact canon item: a three-tier help contract (`canonical term system`, `contextual help system`, `dedicated help-entry contract`) plus depth taxonomy (`inline help`, `context help`, `canonical help entry`).
- where partial/stubbed transfer currently appears: bare tokens in `Glossary.md`; isolated "inline contextual help" mentions; dead citation to `FinalGUISpec.md §7.4.0`.
- what is still missing: an actual owned architecture section, definitions, and usage rules for each tier.
- failure type: missing structural heading; dead governance reference.

### Help entry template never instantiated
- exact canon item: every dedicated help entry needs `canonical_name`, `short_definition`, `why_it_matters`, `what_it_is_not`, `common_related_states`, `related_concepts`, and `surface_examples`.
- where partial/stubbed transfer currently appears: `Glossary.md` lists required fields and labels.
- what is still missing: even one complete instantiated entry, naming of the structure as a template, and preservation of the "states/actions" qualifier.
- failure type: skeletal owner section.

### Related-concept clusters absent
- exact canon item: six related-concept clusters must be explicit, including `Feature Seam`/`Work Package`/`Weak Integration`, `Promotion`/`Revoked`/`Reopened`, `Lane`/`Worktree`/`Cleanup Eligible`, and `Requested`/`Effective`/`Skipped`.
- where partial/stubbed transfer currently appears: isolated labels and isolated term mentions.
- what is still missing: any actual `related_concepts[]` population or `canonical_help_entry_ref` linkage.
- failure type: missing canon.

### `lane` vs `worktree`
- exact canon item: `lane` is persistent runtime identity; `worktree` is the concrete filesystem/Git backing.
- where partial/stubbed transfer currently appears: `Worktree` is defined briefly; `Lane` is used in Orchestrator prose.
- what is still missing: a `Lane` glossary entry, a `what it is not` distinction for `Worktree`, and the explicit "lane may outlive live worktree" rule.
- failure type: missing canon; incomplete confusion-pair transfer.

### `safe point` vs `restore point`
- exact canon item: safe points are runtime recovery anchors and must not be presented as user-facing restore points.
- where partial/stubbed transfer currently appears: `FinalGUISpec.md` carries the best behavioral transfer for retry behavior.
- what is still missing: glossary anchoring, paired help entries, and disambiguation from the different restore-point concept cited in `Plans/newfeatures.md`.
- failure type: over-summarized transfer.

### `historical` / `superseded` / `revoked` / `reopened`
- exact canon item: shared historical vocabulary, compound `stale_historical`, and historical-surface linger policy.
- where partial/stubbed transfer currently appears: token list in `Glossary.md`; isolated concern-level `superseded` prose in `Orchestrator_Page.md`.
- what is still missing: definitions, `History` and `Current vs historical` owner sections, interface fields such as `historical_state` and `supersession_refs`, and the linger-policy numbers.
- failure type: missing structural heading; skeletal glossary transfer.

### `acknowledged` / `dismissed` / `resolved`
- exact canon item: active blockers must not be dismissible into fake health; acknowledgment is not a blocker-resolution path.
- where partial/stubbed transfer currently appears: `Orchestrator_Page.md` already carries substantial concern lifecycle semantics.
- what is still missing: the explicit prohibition rule, alert-level set, glossary definitions, and HITL carry-through fields.
- failure type: wrong section allocation; stubbed consumer propagation.

### Blocked-owner vocabulary and alert levels
- exact canon item: `Runtime`, `Package Overseer`, `Seam Overseer`, `Corroboration`, `Graph Patch`, `Recovery`, `User`, `External Resource`, plus `Info`, `Warning`, `Attention`, `Action Required`.
- where partial/stubbed transfer currently appears: scattered owner nouns and concern prose.
- what is still missing: a single canonical family with closed values and consumer propagation.
- failure type: missing canon.

### Shared escalation ladder
- exact canon item: `info`, `warning`, `attention_required`, `blocked`, `system_notification`.
- where partial/stubbed transfer currently appears: local concern and approval language.
- what is still missing: one shared ladder spanning concern, approval, and system notification surfaces.
- failure type: stubbed consumer propagation.

### Browser capture disclosure rule
- exact canon item: normal browser capture must create visible composer chips and must not silently inject hidden chat messages.
- where partial/stubbed transfer currently appears: some browser/tool integration prose.
- what is still missing: stable consumer propagation across chat, tools, and permission surfaces.
- failure type: missing consumer propagation.

### Projection freshness and health ladders
- exact canon item: freshness = `current|refreshing|stale`; health = `healthy|degraded|unavailable`; these axes must not collapse together.
- where partial/stubbed transfer currently appears: scattered project/storage/runtime panel prose.
- what is still missing: consistent consumer-level rendering and degrade behavior across usage/history/artifact surfaces.
- failure type: over-summarized transfer.

### Unified attribution packet
- exact canon item: one reusable runtime/tool/provider attribution packet rather than four local variants.
- where partial/stubbed transfer currently appears: interview, usage, tool, and provider response surfaces all carry fragments.
- what is still missing: named canonical object, exact fields, and re-use across consumers.
- failure type: stubbed owner propagation.

### Account-history append-only families and provider-account governance
- exact canon item: `account_pressure_episode`, `account_switch_event`, and explicit `provider_account_id` governance/retirement rules.
- where partial/stubbed transfer currently appears: local account-id fields and bridged provider responses.
- what is still missing: the append-only family definitions and the cross-surface governance rule.
- failure type: missing canon.
