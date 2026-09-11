# Shard 048: Research decision disposition persistence

Source: `Plans/storage-plan.md`

Source lines: L18940-L19025

Source SHA256: `8e517f8404a5590c4d3939ec562cccf5203afa656e736872513a2e6f0bdf0eb9`

---

## Research decision disposition persistence

DL-036 consumes CV-328's logical research-decision envelope alongside the existing thread-scoped questionnaire persistence. Retain the complete packet manifest/revision, artifact and chat-delivery refs, ordered item identities/revisions, current pending-item relation, questionnaire-round/draft/result refs, trusted user submissions and correlated clarification questions/answers as bounded structured records. The physical family/value-schema admission must follow this plan's existing registry/versioning rules before runtime writes; this prose does not add an unregistered key, silently extend a closed value, select retention policy or claim implemented durability.

`ResearchDecisionDispositionRecord.disposition` is exactly `pending | approved | denied | denied_with_changes`, keyed logically by stable `decision_item_id`, not its current display position or questionnaire status. Store the terminal user response's immutable ref, exact reviewed item revision, required requested-change text where applicable and its trusted user-origin/time provenance. Clarification refs preserve the submitted question, response/item/revision correlation and returned answer or unavailable state independently. Questionnaire `submitted`, `dismissed`, `paused`, `timed_out` and `unavailable` remain their original lifecycle concepts and cannot be used as decision dispositions.

Persist a validated terminal response, its disposition and the resulting next-current relation atomically or with the existing replay-safe commit mechanism; publish terminal success/next-card state only after durable read-back/commit assurance from that mechanism. Duplicate accepted response identity replays the same result without another decision or card advance; conflicting payload/currentness loses without mutation. Persistence failure preserves the unresolved/current view and reports the failure rather than silently approving, denying or skipping. Store the complete artifact/delivery relation before the first card can be admitted, and retain the artifact's identity so opening the full packet never depends on a current questionnaire widget.

For Ask a question, persist the user-authored question and same pending item before requesting the research/agent answer. Deduplicate dispatch by the accepted response identity; retain enough status/correlation to resume after a crash without inventing an answer or advancing. Persist the answer as clarification evidence, not a user decision; re-presentation binds the same item/revision, and a fresh questionnaire round does not reset its disposition. If the user dismisses or the questionnaire expires, its draft/lifecycle follows §4.2 while the decision and prior exchange remain pending. Restoring a terminal disposition never returns it as an unanswered question, even if the packet is reordered, republished or reached from a new questionnaire round.

User-originated responses are immutable decision facts; agents may contribute clarification answers, recommendations and planning amendments but may not forge or replace those facts. A genuinely changed proposal uses explicit `amends_decision_item_id` under the separate Planning Wizard amendment policy and preserves the prior terminal item. Deny with changes retains the user's change request as a denied_with_changes disposition, not an approval or automatic amended decision. An approval is planning authority only, with no execution/Approve And Build token minted by storage.

Acceptance includes reload of an untouched pending packet, saved conditional drafts, all three terminal dispositions, Ask waiting/answered/unavailable, dismissal during an answer, replayed submissions, stale/concurrent submissions, crash between durable disposition and card advance, packet reorder/republication and a separately linked changed proposal. Verify full artifact identity, same pending item and correlated exchanges survive, that answered items never reappear as pending, and that failure or missing UI state never fabricates a disposition. These are unexecuted storage acceptance obligations, not a runtime or governance result.

ContractRef: ContractName:Plans/Decision_Log.md#DL-036, ContractName:Plans/Contracts_V0.md#CV-328, ContractName:Plans/assistant-chat-design.md#ACD-459, ContractName:Plans/Planning_Wizard.md#PWIZ-010, ContractName:Plans/storage-plan.md#SP-153

### SP-258 - Durable Research Decision Dispositions And Clarification Resume

```yaml
plan_unit_id: SP-258
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Persist stable research decision identity, complete packet/artifact relation, user-originated responses
  and separate pending/approved/denied/denied_with_changes dispositions across reload/resume; questions preserve
  pending state and answered items are never re-asked.
gui_related: false
gui_classification_reason: Durable structured disposition, replay and clarification persistence are backend contracts.
split_recommended: false
depends_on:
- DL-036
- CV-328
- SP-153
unblocks: []
acceptance_criteria:
- Retain exact packet/item/revision identity, full artifact/delivery refs, current item, questionnaire draft/result
  refs, trusted user response and required change/question text without inventing physical family/key registration.
- Dispositions are pending/approved/denied/denied_with_changes, separate from generic questionnaire lifecycle. Terminal
  response/disposition/current-item publication follows one replay-safe durable commit and a failed write cannot
  appear as a decision.
- Ask persists the same pending item and correlated exchange before dispatch; replay cannot dispatch twice. Returned,
  missing or unavailable agent answers cannot change disposition, proposal text or item identity.
- Reload/resume, questionnaire expiry/dismissal and packet reorder/republication preserve terminal decisions and
  never re-ask answered items; unresolved decisions restore with drafts and clarification context rather than inferred
  answers.
- Acceptance includes concurrent/stale/conflicting submit, idempotent replay, crash after commit before card advance,
  Ask waiting and answer recovery, failed persistence, complete artifact reopening and explicit separately linked
  amendment without resetting the original disposition.
- Trusted user-originated response facts survive unchanged; no agent answer, UI default, timeout or missing widget
  is substituted. Approved planning facts cannot authorize PWIZ-010 execution.
validation_surfaces:
- PlanUnit YAML parse and identifier uniqueness
- python3 scripts/pm-plan-index.py validate
- Future DL-036 positive, negative, replay and resume acceptance; no runtime result implied
risk_class: research_decision_review_authority_or_resume_drift
reasoning_tier: high
context_scope: research_decision_review
implementation_surfaces:
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/assistant-chat-design.md
- Plans/Planning_Wizard.md
node_compile_hint:
  mode: research_decision_review_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-036
- Plans/ledgers/v2/pldg-20260909-001-research-decision-review/source_shards/decision_authority_20260909.md
- Plans/ledgers/v2/pldg-20260909-001-research-decision-review/records/design_atoms.jsonl:atom-0002
source_atom_ids:
- atom-0002
negative_constraints:
- No new physical family/key, retention choice, unversioned closed-value extension or fake durability proof from
  this logical contract.
- No resetting terminal dispositions or converting denial-with-changes into approval.
- No implementation, WorkNodes, NodeSeeds, executable queues, runtime acceptance or governance seal is created by
  this planning compile.
- Research decision approval authorizes planning only; Approve And Build remains the separate PWIZ-010 execution
  gate.
owner_hints:
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/assistant-chat-design.md
- Plans/Planning_Wizard.md
```
