### Do-not-forget details
- This packet must be a canon-collapse pass, not a light additive pass.
- Owner docs must go first, primary stale consumers second, mirrors and checklists after.
- `Plans/Section15_MVP_Promoted_Features_Spec.md` remains verification-only unless upstream reconciliation reveals direct stale references that require edits.

## Transfer-Fidelity + Buildability Audit - 2026-04-06

### Scope and method
- Goal of this pass: distinguish **ledger-to-plan transfer misses** from broader plan-doc quality gaps.
- Constraint for this pass: do **not** edit planning docs directly; use the existing work-item ledger plus current canonical docs.
- Evidence base used for this pass:
  - 34 stored subauditor reports across baseline, Opus 4.6, Sonnet 4.6, and GPT-5.2 passes
  - 4 manual spot-check findings used to eliminate false positives
  - prior direct reads of current owner docs and late-straggler route/records slices
- Covered lenses:
  - UX / flow / action-surface behavior
  - state / storage / command / audit-trail behavior
  - tools / permissions / provider / identity integration
  - cross-doc consistency / precedence / terminology / routing ownership

### Raw findings themes before deduplication
- The raw subauditor set kept resurfacing the same families of misses rather than discovering wholly new seams.
- Main clusters repeatedly surfaced:
  - export taxonomy and manifest rules
  - settings / requested-vs-effective / identity display grammar
  - project-summary, escalation, blocked-owner, and resurfacing rules
  - projection-trust UI/gating/fallback rules
  - governance record schemas and shared envelopes
  - lane/worktree lifecycle and cleanup semantics
  - route/open-subject/bridge-field refinement and verification rules
  - glossary/help/cross-doc terminology collapse
- The audit now appears exhausted for **major** missed-transfer issues. Additional findings from late straggler passes only sharpened existing clusters.

### Recurring drift patterns
- Base primitive transferred, but the **refinement layer** was omitted.
  - Example pattern: `route_target` / `OpenSubject` exist, but precedence, reject rules, examples, and scoped-resolution rules are still missing.
- Owner docs were updated, but **consumer docs were not canon-collapsed**.
  - Same-file supersession remains a major source of stale implementation guidance.
- Storage or key registration landed without the **field schema / value-shape contract**.
- UI/behavior docs often contain the top-level statement, but not the **operational policy layer** implementation agents would need.
- Cross-doc primitives are referenced in prose but not elevated into **machine-verifiable contract owners**.

### High-confidence transfer misses from this ledger

#### Cluster A - Orchestrator UI / Progress / notification / projection behavior
- `Plans/Widget_System.md`
  - Progress-only scope landed, but the named Progress widget catalog and deterministic drill-target mapping from the ledger did not.
- `Plans/Orchestrator_Page.md`
  - Missing the fuller blocked-owner taxonomy, resurfacing/aging rules, concern action policy details, projection fallback ladder, saved-view / sort-default behavior, historical-mode behavior, search scope/switch disclosure, and dense-tab scale rules.
- `Plans/FinalGUISpec.md`
  - Missing shared escalation ladder semantics, system-notification narrowing rules, project-card blocked-owner / primary-reason / pressure-summary details, settings display grammar, help-system structure, and action-surface / shortcut / context-menu policy.

#### Cluster B - Storage / governance / record-schema transfer misses
- `Plans/storage-plan.md`
  - Still missing field schemas for `project_summary.v1`, `project_attention_item.v1`, `account_pressure_episode.v1`, `account_switch_event.v1`, and broader governance/runtime record-envelope families.
  - Bridge fields exist, but precedence/join semantics and compatibility fallback rules remain under-specified.
- `Plans/Runtime_Artifacts_Panel.md`
  - Envelope fields landed, but per-family behavior rules and stronger bridge-governance semantics were not fully transferred.

#### Cluster C - Identity / attribution / owner-doc transfer misses
- `Plans/Prompt_Pipeline.md`
  - Missing a unified execution-role and operational/account identity layer.
- `Plans/Contracts_V0.md`
  - Missing `execution_role` in attempt/runtime packet families and still incomplete around blocked-family minimums and ref-family separation.
- `Plans/Tools.md`
  - `tool.invoked` remains analytics-thin rather than carrying the richer attribution packet worked out in the ledger.
- `Plans/GitHub_API_Auth_and_Flows.md`
  - Still login-keyed rather than stably account-keyed.
- `Plans/orchestrator-subagent-integration.md`
  - Still preserves `TierContext`-era live canon rather than fully reflecting `execution_unit_context` direction.

#### Cluster D - Route / open-subject / bridge-field refinement misses
- `Plans/Contracts_V0.md`
  - Base route/open primitives landed, but missing:
    - selector precedence
    - reject rules
    - closed `tab_id` vocabulary
    - scoped resolver rules
    - concrete route examples
    - `resume_url` allowed/prohibited serialization classes
- `Plans/UI_Command_Catalog.md`
  - Missing per-command `command_kind` / normalization metadata and still lacks the canonicalized navigation-family treatment implied by the ledger.
- `Plans/FileManager.md`
  - `OpenSubject` landed, but runtime-lineage subject families and fuller OpenFile/OpenSubject governance remained partial.
- `Plans/Wiring_Matrix.md`, `Plans/Progression_Gates.md`, `evidence.schema.json`
  - Route-aware schema/gate/evidence extensions remain incomplete relative to the ledger's normalized routing model.
- `Plans/chain-wizard-flexibility.md`, `Plans/FinalGUISpec.md`
  - Still preserve `resume_url` as a primary routing primitive in places that should treat it as derived transport only.

#### Cluster E - Lifecycle / glossary / help / terminology transfer misses
- `Plans/WorktreeGitImprovement.md`
  - Missing full lane/worktree lifecycle vocabularies, cleanup semantics, gating checks, and transition rules.
- `Plans/Glossary.md`
  - `Orchestrator rewrite terms` remains effectively empty relative to the ledger's terminology transfer.
- `Plans/FinalGUISpec.md` / glossary/help surfaces
  - Missing help-entry template, related-concept linking, and distinction rules for high-risk term pairs.

#### Cluster F - Same-file supersession failures
- `Plans/human-in-the-loop.md`
  - Older request/tier-era canon still coexists with newer blocked-runtime canon.
- `Plans/usage-feature.md`
  - Base text still carries older tier-era correlation and incomplete usage-event guidance despite later corrective text.
- `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/FinalGUISpec.md`, `Plans/UI_Command_Catalog.md`
  - Each still shows some degree of mixed-era layering where additive patches landed without fully retiring older framing.

### Additional buildability gaps surfaced during the audit
- Some gaps are not clean "missed transfer" claims, but they are still real buildability risks:
  - owner-doc primitive boundaries that remain prose-only rather than formalized (for example navigation identity / route-target ownership)
  - evidence/gate schemas that cannot yet structurally prove the richer routing/normalization behavior
  - cases where a doc implies a stronger shared contract should exist but does not clearly own it
- These should be treated as **secondary** findings behind the ledger-backed missed-transfer set above.

### Contradictions and false positives to exclude
- Do **not** treat these as missing transfer:
  - `route_target`, `OpenSubject`, `command_kind`, `normalizes_to_contract`, `target_kind`, `object_kind`, and `inspector_target` are already present in `Plans/Contracts_V0.md`.
  - `requested_account_id`, `requested_account_binding`, and `operational_identity` are not wholly absent from the current plan set.
  - `account_pressure_episode` and `account_switch_event` key families already exist as registered families; the missing transfer is the schema/detail layer.
  - `projection_freshness` and `projection_health` already exist; the missing transfer is the operational UI/gating/fallback layer, not simply "invent trust states."
- Route/open auditing must stay focused on **refinement omissions**, not on re-claiming absence of primitives that already landed.

### Impacted docs and likely owner order
- Primary owner docs for reconciliation:
  - `Plans/Contracts_V0.md`
  - `Plans/storage-plan.md`
  - `Plans/Prompt_Pipeline.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Glossary.md`
  - `Plans/WorktreeGitImprovement.md`
- Primary consumer cleanup docs:
  - `Plans/human-in-the-loop.md`
  - `Plans/usage-feature.md`
  - `Plans/FileManager.md`
  - `Plans/orchestrator-subagent-integration.md`
  - `Plans/Runtime_Artifacts_Panel.md`
  - `Plans/chain-wizard-flexibility.md`
  - `Plans/assistant-chat-design.md`
- Verification / mirror followers should remain downstream of owner reconciliation.

### Candidate reconciliation direction
1. Reconcile owner contracts and schemas first.
2. Collapse same-file mixed-era canon in primary consumers.
3. Reconcile routing, blocked-family, and attribution flows end-to-end across owner + consumer docs.
4. Update mirrors/checklists only after owner/consumer canon is stable.

### Do-not-forget implementation risks
- Missing field schemas will cause different implementation agents to invent incompatible shapes.
- Same-file mixed canon will cause later implementation work to pick contradictory behavior depending on which section is read.
- Missing route/ref-family boundaries will invite shadow routing and ad hoc payloads that gates cannot verify.
- Missing blocked-owner / escalation / resurfacing rules will produce inconsistent UX and inconsistent persistence semantics.
- Missing cleanup/lifecycle rules will produce destructive ambiguity between archive/remove/prune/recover behaviors.

## Chunked Transfer-Fidelity Recheck - 2026-04-06

### Scope and method
- This rerun was requested specifically to re-check the transfer audit with **smaller chunked subauditors**, because several owner/consumer docs are too large for one subauditor to read cleanly end-to-end.
- Audit shape used:
  - **13 smaller baseline subauditors** over narrow ledger/doc seams
  - **13 matching Opus 4.6 subauditors** over the same seam boundaries
- A few subauditors attempted clarification loops instead of auditing; those slices were retried with stricter prompts and explicit file paths.
- This pass remained audit-only: no planning docs were edited; only the work ledger and work-item meta were updated.

### What changed from the earlier synthesis
- The rerun did **not** overturn the prior conclusion that the major issue is incomplete ledger transfer rather than missing whole primitives.
- What it did add was **more precise line-grounded misses** inside those clusters.
- The recheck confirms the earlier main pattern:
  - base primitive or high-level concept landed
  - detailed rules, examples, field schemas, or operational policies often did not

### New or sharpened high-confidence transfer misses surfaced by the chunked rerun

#### Early Orchestrator surface details that were more under-transferred than the earlier synthesis made explicit
- `Plans/Orchestrator_Page.md` / `Plans/Widget_System.md`
  - The **13-widget Progress catalog** is not just "underspecified" - it is effectively absent as a named catalog.
  - The **default widget drill-target mappings** are also absent.
- `Plans/Orchestrator_Page.md` / `Plans/FinalGUISpec.md` / `Plans/Glossary.md`
  - The early ledger's **state/action label set**, **alert-level taxonomy**, **event-family taxonomy**, **backbone events**, and **condition-aging policy** remain largely untransferred.

#### Historical mode / search / trust behavior sharpened
- `Plans/Orchestrator_Page.md` / `Plans/FinalGUISpec.md`
  - The rerun sharpened several misses that were previously grouped too broadly:
    - explicit `focus_mode = live | historical`
    - `orchestrator.project_state.{project_id}` persistence record
    - page-wide shared `focused_run_id` coherence across tabs
    - historical Progress behavior
    - default search scope = focused run, widening to project/all-runs, and required disclosure when search changes focused run
    - global-vs-local Orchestrator search distinction
    - explicit fallback hierarchy to History/Ledger under projection degradation

#### Concern/governance record and confirmation policy transfer is weaker than the earlier synthesis stated
- `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/Decision_Policy.md`, `Plans/FinalGUISpec.md`
  - The rerun makes it clear that the concern/action/governance tranche is missing not just "some schemas", but the following concrete families:
    - concern record canonical field set
    - non-weak-integration concern categories
    - `resolution_kind`
    - concern owner-kind enum
    - review / corroboration / graph-patch / promotion / recovery record shapes
    - state transition report family
    - 4-level confirmation taxonomy
