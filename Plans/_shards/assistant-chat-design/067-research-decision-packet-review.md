# Shard 067: Research decision packet review

Source: `Plans/assistant-chat-design.md`

Source lines: L25124-L25219

Source SHA256: `b756ce837e6ec67820ebfc41180f9d8031c5b303fa8f4bc9674d1111edfad871`

---

## Research decision packet review

DL-036 applies this profile to research and audit decision packets. Deliver one complete artifact containing every item to the user in chat before presenting the first individual card. The artifact must resolve to the same packet revision and item manifest as the review; partial handoff or an unresolved artifact cannot be presented as a complete packet. Throughout review, its existing OpenSubject route (`cmd.nav.open_subject`) keeps the full artifact openable, independently of the current card. Opening it is read-only and neither submits nor advances a decision.

Exactly one current logical decision card is presented while the review is active; it may contain the choice and its conditional text field. Render the item's plain name, one-sentence question, why it came up, what the user would get, what it costs, options, and recommendation if present. Technical source IDs, owner codes and hashes belong in the artifact's technical companion rather than replacing this plain-language form. Status/disposition use text labels only, with no colored border bars/stripes and no emoji glyphs.

Use the existing §7.4 PM-managed drafts and questionnaire commands through the `research_decision_review` profile owned by CV-328. The fixed visible response labels are **Approve**, **Deny**, **Deny with changes**, and **Ask a question**. Approve and Deny need no invented default; Deny with changes requires the user's nonblank change, and Ask a question requires the user's nonblank question. One response is selected, and explicit user submit is required. Conditional freeform is payload for those two choices, not a fifth disposition or permission for an agent to answer. The generic questionnaire remains free to show multiple questions and use its other supported layouts outside this profile.

A valid Approve, Deny or Deny with changes records respectively `approved`, `denied` or `denied_with_changes` before the next pending item becomes current. Deny with changes is not approval of a modified proposal: retain the stated change for the Planning Wizard amendment handoff. Asking a question submits only that questionnaire interaction; the decision remains `pending` and cannot advance. Route the question through the parent orchestrator to research/the agent, correlate its answer to the same item and question, and re-present that same pending item with the answer. A new questionnaire round may carry the same decision item; answer text cannot silently rewrite the proposal, change its identity or answer on the user's behalf. If an answer is unavailable or the user dismisses while waiting, preserve the pending item and question; no fabricated resolution or next-item advance occurs.

Dismissal, navigation, timeout or headless/unavailable questionnaire outcomes preserve their existing lifecycle meaning and do not approve, deny, submit or decide a research item. Drafts survive normal pause/resume. Resume restores the same pending identity and prior clarification context; terminal dispositions are never asked again after reload, reordering or packet republication. Show answered items read-only in the artifact. A genuinely changed proposal requires explicit lineage and separate planning-amendment treatment, never resetting or relabeling the answered item as pending.

The typed request, user-submission projection and disposition identity are owned by CV-328; SP-258 persists them independently of questionnaire lifecycle state. Existing command currentness, user-source checks and publication-after-persistence apply. No inline visual, `sendPrompt`, assistant suggestion, timeout or client-provided claim of being the user substitutes for the explicit user response. Approval authorizes planning only; Planning Wizard consumes dispositions under its own flow and PWIZ-010 remains the separate Approve And Build gate.

ContractRef: ContractName:Plans/Decision_Log.md#DL-036, ContractName:Plans/Contracts_V0.md#CV-328, ContractName:Plans/storage-plan.md#SP-258, ContractName:Plans/Planning_Wizard.md#PWIZ-010, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md

### ACD-459 - Research Decision Artifact And Sequential Questionnaire Profile

```yaml
plan_unit_id: ACD-459
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Research/audit review hands off the complete packet artifact before exactly one current plain-language
  decision card, reuses questionnaire drafts/lifecycle with four fixed user responses, and returns clarification
  answers to the same pending item without deciding or advancing.
gui_related: true
gui_classification_reason: Artifact handoff, card fields, response controls, sequencing and status presentation
  are visible Chat behavior.
split_recommended: false
depends_on:
- DL-036
- CV-328
- SP-258
unblocks: []
acceptance_criteria:
- The full artifact contains every declared item at the reviewed revision and is delivered before any card; it stays
  openable using the existing artifact OpenSubject route throughout review. Opening it has no decision side effect.
- Each current card renders plain name, one-sentence question, why it came up, what the user gets, costs, options
  and optional recommendation. Exactly one logical item is current, though its response may require a conditional
  text field.
- Only Approve, Deny, Deny with changes and Ask a question are offered. The latter two require nonblank user-authored
  change/question text respectively; no default, Other/fifth response, multi-selection, missing conditional text
  or agent-authored submission is accepted.
- Ask routes through the parent orchestrator, retains pending disposition and same item identity, and returns the
  correlated answer with that same item. A submitted questionnaire round is not an answered decision; repeated Ask
  rounds cannot skip the item or implicitly revise it.
- Dismissal, timeout, headless/unavailable state and navigation never submit or dispose. Resume retains drafts,
  pending identity and clarification context; approved/denied/denied_with_changes items remain read-only and are
  never re-asked after reorder/republication.
- Acceptance covers artifact-before-card ordering, full-artifact access during a card/clarification, each fixed
  response, missing required text, Ask-answer-resume, dismissal while awaiting an answer, duplicate submit, stale
  item/revision, agent/visual answer attempts, and restart after terminal disposition but before next-card display.
- Text-only statuses have no colored border bars/stripes or emoji. The general questionnaire batch contract remains
  unchanged, and planning approval cannot dispatch build work.
validation_surfaces:
- PlanUnit YAML parse and identifier uniqueness
- python3 scripts/pm-plan-index.py validate
- Future DL-036 positive, negative, replay and resume acceptance; no runtime result implied
risk_class: research_decision_review_authority_or_resume_drift
reasoning_tier: high
context_scope: research_decision_review
implementation_surfaces:
- Plans/assistant-chat-design.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: research_decision_review_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-036
- Plans/ledgers/v2/pldg-20260909-001-research-decision-review/source_shards/decision_authority_20260909.md
- Plans/ledgers/v2/pldg-20260909-001-research-decision-review/records/design_atoms.jsonl:atom-0001
source_atom_ids:
- atom-0001
negative_constraints:
- No auto-approval, auto-denial or auto-submit; no agent answer on behalf of the user.
- Never interpret Deny with changes as approve-with-changes or clarification as decision completion.
- No implementation, WorkNodes, NodeSeeds, executable queues, runtime acceptance or governance seal is created by
  this planning compile.
- Research decision approval authorizes planning only; Approve And Build remains the separate PWIZ-010 execution
  gate.
owner_hints:
- Plans/assistant-chat-design.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
```
