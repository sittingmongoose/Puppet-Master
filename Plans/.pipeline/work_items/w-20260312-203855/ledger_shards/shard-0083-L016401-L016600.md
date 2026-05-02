  - `Crosswalk.md` first
  - `DRY_Rules.md` second
  - `Decision_Log.md` third
- `Crosswalk.md` needs:
  - corrected section numbering
  - removal of stale `Tiers` and widgetized-Orchestrator wording
  - explicit primitive ownership for `route_target` and `OpenSubject`
- `DRY_Rules.md` needs:
  - one deterministic `ContractRef` shape for `ContractName`
  - examples that follow its own rule exactly
  - cross-reference cleanup so gate and anchor examples are internally consistent
- `Decision_Log.md` needs:
  - explicit rewrite-era decisions entered as durable records
  - at minimum the owner-boundary decisions that now affect routing, Orchestrator ontology, blocked identity, runtime identity, and projection-trust vocabulary

### Do-not-forget details
- This seam is owner-level, not consumer-level. Fixing `Orchestrator_Page.md` or `FinalGUISpec.md` first would still leave stale routing at the top of the precedence stack.
- The duplicated `Crosswalk.md` numbering is not cosmetic. It undermines `ContractRef` stability and gateable traceability.
- `Decision_Log.md` currently gives downstream reconciliation no durable place to point when explaining why rewrite-era ownership changed.


## Research Progress - 2026-03-17 - owner-traceability seam: Progression Gates

### Targeted docs read
- `Plans/Progression_Gates.md`
- Adjacent references checked through existing owner docs:
  - `Plans/DRY_Rules.md`
  - `Plans/Crosswalk.md`

### Key findings
- `Plans/Progression_Gates.md` contains a direct `ContractRef` syntax violation inside canonical gate text:
  - `ContractRef: Plans/Architecture_Invariants.md#INV-002, Plans/Architecture_Invariants.md#INV-010, SchemaID:evidence.schema.json`
  - This bypasses the `ContractName:` taxonomy that `Plans/DRY_Rules.md` says is canonical.
- `GATE-010` still validates flat wiring coverage only. It does not validate:
  - command wrapper normalization
  - `route_target` pass-through
  - `OpenSubject` subject-open binding
  - deprecated alias versus stable wrapper semantics
- The lower addendum stack is structurally unstable:
  - `Runtime Recovery Canonicalization Gate Addendum` appears twice with the same body
  - multiple addenda append stronger runtime-lineage checks without being integrated into numbered gate canon
  - the file now mixes gate definitions with free-floating reconciliation notes
- The doc still uses non-deterministic phrasing in owner-level gate text:
  - `Execution contract (recommended)`
  - `targeted for future enforcement`
  - this weakens the deterministic posture expected from an owner gate doc

### Impacted docs
- Primary doc:
  - `Plans/Progression_Gates.md`
- Adjacent owners implicated:
  - `Plans/DRY_Rules.md`
  - `Plans/Contracts_V0.md`
  - `Plans/Crosswalk.md`
  - `Plans/UI_Wiring_Rules.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Wiring_Matrix.schema.json`
  - `Plans/evidence.schema.json`

### Contradictions / gaps surfaced
- The gate doc enforces `ContractRef` rigor while violating the same `ContractRef` taxonomy in its own canonical text.
- The routing and command-normalization model now depends on checks that `GATE-010` cannot express, which means the gate layer is behind the owner contract layer.
- The duplicated runtime-recovery addendum means the gate doc now has same-file canon duplication similar to the problems already logged in `Crosswalk.md`, `human-in-the-loop.md`, and `storage-plan.md`.

### Candidate fixes to carry forward
- Reconciliation should normalize `Progression_Gates.md` as an owner doc, not just tidy examples:
  - fix all `ContractRef` lines to use one taxonomy
  - fold duplicate addenda into numbered gate canon
  - keep deterministic gate language only
  - extend `GATE-010` coverage so routing/wrapper normalization can be verified through command-definition metadata plus wiring evidence
- `GATE-010` needs an explicit relationship to:
  - route/open primitives in `Contracts_V0.md`
  - wrapper metadata in `UI_Command_Catalog.md`
  - evidence structures that can encode normalization and alias failures

### Do-not-forget details
- The routing cleanup will stay weak if `Progression_Gates.md` remains flat-command-only while `Contracts_V0.md` and `UI_Command_Catalog.md` move to route/open primitives.
- The `ContractRef` syntax break in `GATE-003` is a hard owner-doc integrity defect, not a style preference.


## Research Progress - 2026-03-17 - owner-contract seam: Contracts_V0 runtime identity, blocked identity, route/open ownership

### Targeted docs read
- `Plans/Contracts_V0.md`

### Key findings
- `Plans/Contracts_V0.md` still lacks named canonical contracts for:
  - `route_target`
  - `OpenSubject`
- The main body still teaches older peer canon that conflicts with the rewrite:
  - section `6. HITLRequest` still defines approval around `request_id`, `tier_id`, `tier_type`, `request_kind = tier_boundary_approval`, and `allowed_actions[]`
  - section `1.1 EventRecord` still lists `run.tier_started` and `run.tier_completed` among events that carry the runtime snapshot
- The later addenda already move to the stronger model:
  - `node.blocked` with `blocked_sequence` and ordered `allowed_action_ids[]`
  - `scheduler.pass`
  - attempt-native lineage
  - stronger `wizard.blocked` fields
  - runtime event-name precedence
- `wizard.blocked` is internally inconsistent inside the same owner doc:
  - earlier addendum requires `resume_url`
  - later reconciliation addendum weakens it to `resume_url?`
  - neither form is grounded in a named `route_target` contract
- `remediation.resolved` is also internally inconsistent inside the same file:
  - earlier addendum uses `resolution` = `success | failed | ceiling_exceeded`
  - later reconciliation addendum uses `fixed | superseded | abandoned | replan_required`
  - both are presented as canonical in different sections

### Impacted docs
- Primary doc:
  - `Plans/Contracts_V0.md`
- Adjacent owners implicated:
  - `Plans/Crosswalk.md`
  - `Plans/storage-plan.md`
  - `Plans/human-in-the-loop.md`
  - `Plans/Executor_Protocol.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/FileManager.md`
  - `Plans/FinalGUISpec.md`

### Contradictions / gaps surfaced
- `Contracts_V0.md` is now carrying two parallel approval ontologies:
  - request-centric HITL
  - blocked-episode runtime identity
- `Contracts_V0.md` is also carrying two parallel navigation/open stories:
  - raw `resume_url`
  - no named route/open primitives
- The owner doc is ahead in late addenda and behind in its main body, which makes it a direct source of downstream drift across Orchestrator, Graph, HITL, storage, and command docs.

### Candidate fixes to carry forward
- Reconciliation should treat `Contracts_V0.md` as the primary collapse point for:
  - blocked identity over request-centric HITL identity
  - `allowed_action_ids[]` over `allowed_actions[]` as shared runtime canon
  - route/open primitive ownership through named `route_target` and `OpenSubject`
  - one remediation resolution enum family
- Owner adoption order from this seam:
  - insert `route_target` and `OpenSubject` into the UI-command/navigation section
  - retire `HITLRequest` as peer canonical approval identity and reduce `request_id` to lineage/compatibility metadata
  - retire `run.tier_*` event teaching from runtime snapshot guidance
  - reconcile `wizard.blocked` and `remediation.resolved` to one field contract each

### Do-not-forget details
- This is the owner doc where the route/open cleanup, blocked-identity cleanup, and tier-era runtime cleanup meet. Reconciliation elsewhere will keep bouncing until this file is normalized.
- `resume_url` cannot stay a shadow primitive if `route_target` is adopted here.
- `request_id` can survive as compatibility lineage. It cannot remain the primary approval identity.


## Research Progress - 2026-03-17 - owner-contract seam: human-in-the-loop blocked identity collapse

### Targeted docs read
- `Plans/human-in-the-loop.md`

### Key findings
- `Plans/human-in-the-loop.md` still opens with a canonical request contract built on:
  - `request_id`
  - `tier_id`
  - `tier_type`
  - `request_kind = tier_boundary_approval`
  - ordered `allowed_action_ids[]`
- The same file later moves to the stronger runtime-native model:
  - pending approval is `blocked_reason_code = waiting_approval`
  - action binding is through canonical runtime action families
  - `blocked_sequence` is part of the runtime-facing identity
  - blocked/runtime records, not generic paused state, are the persistence surface
- The middle of the file still preserves stale execution ontology:
  - phase/task/subtask toggles
  - tier-boundary run-loop wording
  - redb persistence text keyed to `request_id`, `tier_id`, `tier_type`, `request_kind`, and `allowed_actions`
- The file also contains terminology drift inside the same surface:
  - visible labels such as `Reject`, `Cancel Run`, and `Skip`
  - later canonical families `Approve`, `Decline`, `Retry from safe point`, `Start fresh attempt`, `Resume after prerequisite`, `Replan`, `Skip node`, `Abort run`

### Impacted docs
- Primary doc:
  - `Plans/human-in-the-loop.md`
- Adjacent owners implicated:
  - `Plans/Contracts_V0.md`
  - `Plans/storage-plan.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Run_Graph_View.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/orchestrator-subagent-integration.md`

### Contradictions / gaps surfaced
- The file still claims HITL semantics must not change, while later sections already change the meaning from request-centric tier-boundary approvals to blocked/runtime overlays.
- The persistence section still instructs storage to persist request-era fields that later sections explicitly demote.
- The file still treats tier boundaries as the approval scope anchor, while newer runtime canon requires blocked-episode identity anchored by run/node/blocked sequence.

### Candidate fixes to carry forward
- Reconciliation should retire the request-centric opening contract and rebuild the file around:
  - blocked/runtime approval identity
  - canonical runtime action families
  - lineage-preserving persistence through blocked records
- If tier-level settings remain as user-facing configuration, they need to be reframed as approval-trigger policy, not as canonical approval object identity.
- Any surviving `request_id` wording belongs only in compatibility or lineage notes.

### Do-not-forget details
- This file is still teaching consumers how to persist approval state. Leaving the old section in place will keep recreating the same storage and command drift.
- The action-label cleanup depends on this file, because it still legitimizes `Reject` / `Cancel Run` / `Skip` as if they were canonical action names rather than surface labels over runtime action families.


