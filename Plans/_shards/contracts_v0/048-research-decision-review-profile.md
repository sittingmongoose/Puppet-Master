# Shard 048: Research decision review profile

Source: `Plans/Contracts_V0.md`

Source lines: L21316-L21484

Source SHA256: `6452c533d694ae75071b524c3baf829cd049105b05247a06ae3ed68fbeb71cd2`

---

## Research decision review profile

DL-036 uses a typed wrapper around the existing `QuestionnaireEnvelope`, `QuestionItem` and `QuestionAnswer` from Assistant Chat §7.4. The types below are the logical owner contract, not new commands, runtime code, a registered schema family or a new questionnaire mode. `decision_response` is deliberately distinct from the existing `response_kind = selection | freeform | mixed`; a user decision's provenance is distinct from `QuestionAnswer.source = option | other | freeform`.

```typescript
type ResearchDecisionResponse = "approve" | "deny" | "deny_with_changes" | "ask_question";
type ResearchDecisionDisposition = "pending" | "approved" | "denied" | "denied_with_changes";

type ResearchDecisionItem = {
  decision_item_id: string;
  item_revision: string;
  plain_name: string;
  question_sentence: string;
  why_it_came_up: string;
  what_you_get: string;
  what_it_costs: string;
  options: string[]; // proposal alternatives, not the four response controls
  recommendation?: string;
  source_refs: string[];
  amends_decision_item_id?: string; // explicit separate planning amendment only
};

type ResearchDecisionPacket = {
  packet_id: string;
  packet_revision: string;
  thread_id: string;
  artifact_ref: string;
  items: ResearchDecisionItem[]; // complete, ordered manifest with unique item IDs
};

type ResearchDecisionReviewRequest = {
  profile: "research_decision_review";
  profile_version: "1.0.0";
  packet_id: string;
  packet_revision: string;
  decision_item_id: string;
  item_revision: string;
  questionnaire: QuestionnaireEnvelope;
  choice_question_id: string;
  detail_question_id?: string;
};

type ResearchDecisionUserResponse = {
  response_id: string;
  questionnaire_id: string;
  questionnaire_result_ref: string; // existing explicit submitted result
  packet_id: string;
  decision_item_id: string;
  expected_packet_revision: string;
  expected_item_revision: string;
  decision_response: ResearchDecisionResponse;
  change_text?: string;
  question_text?: string;
  respondent: "user"; // verified by trusted invocation provenance, never client assertion
  answered_at: string;
};

type ResearchDecisionClarification = {
  response_id: string; // the persisted ask_question submission, also the correlation key
  decision_item_id: string;
  item_revision: string;
  question_text: string;
  answer_ref?: string;
  answer_status: "pending" | "answered" | "unavailable";
};

type ResearchDecisionDispositionRecord = {
  decision_item_id: string;
  item_revision: string;
  disposition: ResearchDecisionDisposition;
  terminal_response_ref?: string;
  clarification_refs: string[];
};
```

Identity and presentation guards:
- `decision_item_id` is the stable identity of the proposal, independent of display order, questionnaire round and packet republication. Persisted terminal disposition follows it; changing a packet ID/revision, label or position cannot reopen it. A genuinely changed proposal has explicit `amends_decision_item_id` and separate Planning Wizard amendment treatment; it cannot overwrite the prior response or arise silently from answer text.
- The packet artifact must resolve to the same complete ordered item/revision manifest before the first request is admitted, and existing chat artifact delivery must precede card presentation. Every request binds the packet's thread, exact current pending item/revision and questionnaire identity. Exactly one logical decision card is current while active; no advance occurs during clarification or an unresolved persistence result.
- The choice QuestionItem uses the four object-array option IDs `approve`, `deny`, `deny_with_changes`, `ask_question` with labels exactly Approve, Deny, Deny with changes, Ask a question; `response_kind = selection`, `required = true`, `multi_select = false`, `allow_freeform = false`, and no selected/default answer. The item's plain-language proposal options are descriptive content, not additional response controls.
- For deny_with_changes or ask_question, a conditional companion QuestionItem within the same logical card uses `response_kind = freeform`, `required = true`, `allow_freeform = true`. Its nonblank user text normalizes to `change_text` or `question_text` respectively. The unused field is absent; approve/deny carry neither. `detail_question_id` is required exactly for these text-bearing choices. This is a required payload field, not an Other/fifth disposition or another independent decision.
- Existing `cmd.questionnaire.draft_update`, `.submit`, `.dismiss`, `.resume`, `.expire` and `.mark_unavailable` remain the lifecycle routes. The request wrapper is bound through the existing question source/context reference; its questionnaire uses the existing mode = questionnaire, with one choice QuestionItem plus only the currently required conditional text companion. Its thread_id matches the packet thread, and its question IDs belong to the exact current review round. Do not add a new mode or shadow command/result system. Catalog/Wiring still own registration/admission; naming a reused ID is not proof of a native handler or production row.

Submission and state guards:
- Derive `ResearchDecisionUserResponse` from the existing explicit submitted questionnaire result and trusted user invocation source. Verify packet/item/revision, current pending state, question IDs, exactly one allowed choice and conditional text before accepting it. `respondent = user` supplied by a client/agent is not authentication. The choice answer has exactly one allowed option ID with source = option; the conditional detail, when required, has exactly one nonblank user string with source = freeform. No extra answer, Other source, unused detail field or implicit recommendation/default is admitted. The normalized wrapper and referenced QuestionAnswer values must agree; no parallel independently editable answer authority exists.
- A repeated `response_id` with the same accepted payload returns the same result without another disposition, clarification dispatch or advance; conflicting reuse or stale revision/current-item submission is rejected without effect. Server/storage currentness fences serialize concurrent submissions so two terminal responses cannot win for one pending item.
- Approve maps to `approved`, Deny to `denied`, Deny with changes to `denied_with_changes`; each stores the user response and terminal disposition together before advancing to the next still-pending item. Deny with changes remains a denial of the current proposal with requested changes for separate planning treatment, never automatic approval.
- Ask a question maps to no disposition transition: persist the question exchange and leave `pending`. The questionnaire interaction may reach its ordinary submitted status, but that does not submit/answer the decision. Correlate research/agent answers using response/item/revision identity and re-present the same pending item, using a new questionnaire round if needed. An answer marks only the clarification as answered; absent/failed answers remain pending/unavailable clarification, not denial or item advance.
- Dismissed/paused/timed_out/unavailable questionnaire outcomes never map to a decision disposition or fabricate a user response. Expiration cannot erase the persisted pending decision or its prior clarifications; explicit resume may create a fresh questionnaire round for the same unresolved item. Agents may supply clarification answers but cannot select any user decision response.
- Disposition values are not additions to `QuestionnaireEnvelope.flow_state` or generic question output status. The general questionnaire can still batch items, accept its existing layouts and use freeform outside this profile. Approve is planning authority only and never satisfies PWIZ-010.

ContractRef: ContractName:Plans/Decision_Log.md#DL-036, ContractName:Plans/assistant-chat-design.md#ACD-459, ContractName:Plans/storage-plan.md#SP-258, ContractName:Plans/Planning_Wizard.md#PWIZ-010, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/Wiring_Matrix.md

### CV-328 - Research Decision Questionnaire Profile And Disposition Envelope

```yaml
plan_unit_id: CV-328
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: A research_decision_review wrapper binds complete packet and stable item/revision identity to the
  existing questionnaire and host-verified user submission. Fixed decision responses map to separate persistent
  dispositions; clarification submits only an interaction and leaves the item pending.
gui_related: false
gui_classification_reason: Typed identity, validation, submission authority and disposition semantics are nonvisual
  contracts.
split_recommended: false
depends_on:
- DL-036
unblocks: []
acceptance_criteria:
- Typed ResearchDecisionPacket, Item, ReviewRequest, UserResponse, Clarification and DispositionRecord preserve
  exact packet/item/revision/questionnaire identity and full artifact association without changing general questionnaire
  enums.
- Exactly one fixed response is submitted by the user; deny_with_changes requires change_text, ask_question requires
  question_text, and neither field is accepted for approve/deny. Conditional companion text uses canonical QuestionItem/QuestionAnswer
  rather than a fifth choice.
- Validate complete artifact handoff, current pending item/revisions, answer-source provenance and agreement with
  the canonical submitted questionnaire result before any effect. Agent impersonation, wrong question IDs, stale
  revisions, contradictory payload and conflicting replay fail without disposition.
- Idempotent replay returns one result; concurrent terminal responses cannot both win. Terminal approved/denied/denied_with_changes
  state persists across republication/reorder and is never reset by a new questionnaire ID.
- Ask persists a correlated clarification, keeps pending disposition and current item, and re-presents the same
  item with its answer. Duplicate Ask does not dispatch twice; unavailable/late/wrong-item answers do not decide,
  alter or advance the proposal.
- Dismissal, timeout, pause, unavailable UI and answer text alone cannot dispose or submit a decision. Existing
  questionnaire status and research disposition are separate, and general batch/multi-select/freeform behavior outside
  this profile is unchanged.
validation_surfaces:
- PlanUnit YAML parse and identifier uniqueness
- python3 scripts/pm-plan-index.py validate
- Future DL-036 positive, negative, replay and resume acceptance; no runtime result implied
risk_class: research_decision_review_authority_or_resume_drift
reasoning_tier: high
context_scope: research_decision_review
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/assistant-chat-design.md
- Plans/storage-plan.md
- Plans/Planning_Wizard.md
- Plans/UI_Command_Catalog.md
- Plans/UI_Wiring_Rules.md
- Plans/Wiring_Matrix.md
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
- No agent may answer for the user; no fixed-choice defaults, Other/fifth disposition or automatic decision from
  question lifecycle.
- Do not reopen an answered item by changing labels, packet order/revision or questionnaire identity.
- No implementation, WorkNodes, NodeSeeds, executable queues, runtime acceptance or governance seal is created by
  this planning compile.
- Research decision approval authorizes planning only; Approve And Build remains the separate PWIZ-010 execution
  gate.
owner_hints:
- Plans/Contracts_V0.md
- Plans/assistant-chat-design.md
- Plans/storage-plan.md
- Plans/Planning_Wizard.md
- Plans/UI_Command_Catalog.md
- Plans/UI_Wiring_Rules.md
- Plans/Wiring_Matrix.md
```
