# Shard 026: DL-036 research and audit decision review in planning - 2026-09-09

Source: `Plans/Planning_Wizard.md`

Source lines: L2334-L2422

Source SHA256: `ac582b97a7bf56c06d7b7f9b6dc72ba773b4da659e1de5cd6c3872e2b541b0b0`

---

## DL-036 research and audit decision review in planning - 2026-09-09

When research or audit in a PlanningRun produces product choices, the existing embedded Assistant Chat receives the complete decision-packet artifact and presents its items one at a time using the specialized question-card profile owned by Assistant Chat. The packet remains openable throughout review. This is a decision handoff within topic research, audit/repair and amendment work, not a new planning mode, independent ledger or execution controller. Planning Wizard consumes the typed packet/item identities and recorded dispositions through the Chat, Contracts and Storage owners; ordinary research evidence alone creates no user disposition.

Approve authorizes planning the exact reviewed feature through the existing topic graph and ledger. Deny excludes the proposal from accepted scope while retaining its source and disposition. Deny with changes retains the user's exact requested change and routes it through existing clarification/immutable Planning Amendment and impact rules; it does not approve either the original or the changed proposal. Ask a question routes the inquiry through the owning agent/research path, leaves the same item pending, and re-presents it with the correlated answer. Unaffected planning may continue under existing dependencies, but pending or denied items cannot silently enter approved scope. Existing PWIZ-005 invalidation and PRD immutability rules still apply.

The recorded decision is consumed before asking again. Dismissal, expiration of a questionnaire presentation, thread/window reload and wizard resume do not erase settled dispositions or turn pending into denial. Resolving a question round is distinct from resolving its pending decision. Exact requested changes and later reviewed revisions retain lineage; a changed proposal is never treated as approved because its predecessor was discussed. Feature planning approval does not freeze an ApprovedPlanPack, launch Plan Compile or execute work. The separate final Approve And Build transaction remains owned by PWIZ-010 and PWIZ-014.

ContractRef: ContractName:Plans/Decision_Log.md#DL-036, ContractName:Plans/assistant-chat-design.md#ACD-459, ContractName:Plans/Contracts_V0.md#CV-328, ContractName:Plans/storage-plan.md#SP-258, ContractName:Plans/FinalGUISpec.md#F3-550, ContractName:Plans/UI_Command_Catalog.md#UCC-161, ContractName:Plans/UI_Wiring_Rules.md#UIW-022, ContractName:Plans/Wiring_Matrix.md#WM-053

### PWIZ-027 - Research Decision Dispositions Into Topics And Amendments

```yaml
plan_unit_id: PWIZ-027
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'Research/audit decision packets are reviewed in the existing embedded Assistant Chat during PlanningRun
  topic, audit and amendment work. Planning Wizard consumes recorded exact-item dispositions: approval permits feature
  planning only, denial excludes the proposal, denial with changes preserves the exact requested change for existing
  amendment processing without approving the changed proposal, and questions keep the same item pending until a
  user disposition. The final Approve And Build authority remains separate.'
gui_related: true
gui_classification_reason: Defines the visible planning handoff and decision-card presentation or its user approval
  boundary.
split_recommended: false
depends_on:
- PWIZ-003
- PWIZ-005
- PWIZ-010
- PWIZ-014
- ACD-459
- CV-328
- SP-258
unblocks: []
acceptance_criteria:
- The full artifact contains every review item and remains openable through cmd.nav.open_subject before, during
  and after individual card responses; opening it neither advances the review nor changes a disposition.
- Topic research, audit findings and amendments route product choices through the Chat-owned one-at-a-time decision
  profile with exact typed packet/item/revision and source lineage. Existing general questionnaires remain multi-question
  and are not forced into this sequencing.
- Approve adds the reviewed feature to authorized topic planning; Deny excludes it from accepted scope while preserving
  the recorded decision. A disposition is not a research-agent inference or a Plan Compile receipt.
- Deny with changes requires and preserves the user’s exact change text. Existing clarification/immutable Planning
  Amendment, dependency invalidation and PRD successor rules process its impact; neither original nor changed proposal
  is silently approved, and the settled original is not re-asked as a pending decision.
- Ask a question retains the same pending item and correlates the agent/research answer before re-presentation.
  Submission of this question round does not count as a settled planning decision; the agent cannot answer the approval
  choice for the user.
- Resume, reload, dismissal and questionnaire expiration consume durable dispositions and preserve pending state.
  Settled items are not asked again, and missing/unavailable readback cannot be represented as an empty undecided
  packet or a successful disposition.
- Within this decision packet, only approved proposals enter authorized feature scope for topic conversion and final
  integration under existing readiness and currentness gates. Feature Approve does not invoke Approve And Build,
  freeze ApprovedPlanPack, create PlanCompileRun, or bypass PWIZ-010/PWIZ-014. The user still separately approves
  the final reviewed plan through that existing path.
- Questionnaire lifecycle command candidates consume UCC-161/UIW-022/WM-053 without a new approve/deny command family.
  Missing registration/handler/receipt wiring stays unavailable; static Plans do not establish native execution.
- If a changed proposal needs a new decision, preserve the owner-defined amends_decision_item_id linkage to the
  settled original rather than resetting or silently reusing its disposition. Changes to packet presentation alone
  do not recreate settled items.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- Future research decision review integration, replay and accessible presentation receipts; not_run
risk_class: research_decision_review_or_execution_authority_drift
reasoning_tier: high
context_scope: dl036_research_decision_review
implementation_surfaces:
- Plans/Planning_Wizard.md
node_compile_hint:
  mode: accepted_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-036
- Plans/ledgers/v2/pldg-20260909-001-research-decision-review/records/design_atoms.jsonl:atom-0003
- Plans/ledgers/v2/pldg-20260909-001-research-decision-review/source_shards/decision_authority_20260909.md
preserved_exact_tokens:
- Approve
- Deny
- Deny with changes
- Ask a question
- Approve And Build
negative_constraints:
- No agent answers on the user’s behalf, dismissal auto-submit, automatic approval/denial or mutation of an immutable
  approved PRD is permitted.
- No peer questionnaire lifecycle, decision-disposition storage owner or new planning mode is introduced.
- No implementation, WorkNodes, NodeSeeds or governance seal is created by this PlanUnit.
```
