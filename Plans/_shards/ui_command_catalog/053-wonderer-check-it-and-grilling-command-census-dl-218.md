# Shard 053: Wonderer Check It and grilling command census — DL-218

Source: `Plans/UI_Command_Catalog.md`

Source lines: L16115-L16286

Source SHA256: `cd59305b17fd10a90053df362a4d10002c6fdf64954e2d69c15ed28f9f55b32d`

---

## Wonderer Check It and grilling command census — DL-218

The census inspected cmd.brainstorm.research_lead and every questionnaire lifecycle reference in this catalog, Commands_System, both wiring inventories and scripts before adding rows. The former BrainStorm operation has the same effect as Check It on a BrainStorm run, so it becomes a compatibility alias. The wider Crew and Chat Room scope needs one shared canonical identity. Numbering questions is presentation. The existing QuestionItem.default_values seeds the recommended option; cmd.questionnaire.draft_update accepts or edits one question’s draft without submitting its peers, and cmd.questionnaire.submit explicitly accepts all validated answers in the round. None needs a new command or alias.

| Command ID | Label | Description | Preconditions | command_kind | Owner | Request → Result | Sole future target |
|---|---|---|---|---|---|---|---|
| `cmd.collaboration.research_lead` | Check It | Research one Wonderer lead whatever its disposition; keep it a hypothesis until evidence supports it, or retain the reason it is set aside. | `run_kind in {crew, brainstorm, chat_room} && run_status in {running, waiting} && wonderer_lead_present && lead_admission_open` | `domain_action` | `Plans/Collaborative_Workflows.md` | `CollaborationLeadResearchRequest` → `CollaborationLeadResearchResult` | `handlers::collaboration::research_lead` |

Its source surfaces are exactly workflow_card, workflow_panel and wonderer_workspace. BrainStorm synthesis or Crew final synthesis starting atomically closes further-pass and Check It admission with lead_admission_closed. Checking a lead already in research returns that same operation with no second attempt. Success carries receipt_refs, revision_after and currentness_hash_after and either a terminal supported/set-aside outcome or observable_work_ref for research still running. It is a candidate_not_registered row, initially handler_unavailable, with an exact temporary exclusion and disabled command_not_registered controls. Admission removes that exclusion with the native command/handler and production row; this contract adds no runtime registration. expected_event_types is empty pending Event Authority (DL-093).

cmd.brainstorm.research_lead has normalization.kind = alias, alias_of_command_id = cmd.collaboration.research_lead. Its BrainstormLeadResearchRequest/Result compatibility envelopes map field for field to CollaborationLeadResearchRequest/Result, changing only the schema and command discriminators; every operation identity, idempotency key, lead ID, result, receipt and evidence reference is preserved. Reject a non-BrainStorm source run. The legacy brainstorm_panel source maps to workflow_panel, and wonderer_workspace keeps its name. Normalize before availability, permission, currentness, idempotency and dispatch. No separate brainstorm_research_lead handler, operation, state, event or primary production row remains; handler strings in earlier source lineage are retired.

### UCC-205 - Check It Across The Three Collaborative Kinds

```yaml
plan_unit_id: UCC-205
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Plans/Decision_Log.md DL-218 makes cmd.collaboration.research_lead the Check It domain_action for
  a Wonderer lead in a running or waiting Crew, BrainStorm or Chat Room. It takes
  CollaborationLeadResearchRequest and returns CollaborationLeadResearchResult through the sole
  future target handlers::collaboration::research_lead. Its surfaces are exactly workflow_card,
  workflow_panel and wonderer_workspace. Preconditions also require lead_admission_open; once
  BrainStorm synthesis or Crew final synthesis starts, a further pass or Check It is refused with
  typed lead_admission_closed. Checking research already in flight returns its existing operation
  without another attempt. Committed success has receipts, resulting revision and currentness, plus
  terminal evidence/reason or an observable running operation. cmd.brainstorm.research_lead is its
  one-to-one BrainStorm-only compatibility alias: normalize the BrainstormLeadResearchRequest and
  BrainstormLeadResearchResult discriminators and brainstorm_panel to workflow_panel before all
  gates, preserving operation identity, idempotency, receipts and evidence. The row remains
  candidate_not_registered and handler_unavailable with disabled command_not_registered controls and
  its exact temporary wiring exclusion; expected_event_types stays empty. Add specialists turns on
  grill_me_enabled without a row for Grill Me; add_grill_me keeps its truthful capability-addition
  name and adds no ParticipantSpec.
gui_related: true
gui_classification_reason: Defines the visible controls and their owner behavior.
depends_on:
- CWR-041
- CWR-042
- UCC-171
unblocks: []
acceptance_criteria:
  - "The three canonical surfaces share availability and exact disabled reasons."
  - "The legacy BrainStorm input reaches the same operation and sole future handler."
  - "Neither an undecided lead nor a set-aside disposition blocks the user override."
  - "No Grill Me participant is added."
  - "Both command spellings return the existing operation for in-flight research and refuse lead_admission_closed after synthesis begins."
  - "Committed research success cannot omit receipts, resulting revision/currentness or both an outcome and running work."
validation_surfaces:
- python3 scripts/pm-new-contracts-verify.py
- python3 scripts/pm-plan-index.py validate
risk_class: collaboration_command_identity
reasoning_tier: high
context_scope: wonderer_grill_me_companions
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- Plans/Commands_System.md
- Plans/Wiring_Matrix.production.exclusions.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md DL-218"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DECISIONS.md sha256:dfa2f354936defd187d610de4aee77a3d8b75b6d25692e592ba48f7b66bfebce"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DEFAULTS-APPROVED.md sha256:f199f188e3e4b1ecd5474a1bc2f87c2d5156863909eb9de9cc3ee9fcb7bfd5be"
preserved_exact_tokens:
- cmd.collaboration.research_lead
- cmd.brainstorm.research_lead
- CollaborationLeadResearchRequest
- CollaborationLeadResearchResult
- handlers::collaboration::research_lead
- grill_me_enabled
- add_grill_me
negative_constraints:
- Do not admit an event or fabricate native handler availability.
- Do not give the compatibility alias a peer operation or production row.
owner_hints:
- Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-218, ContractName:Plans/Collaborative_Workflows.md#CWR-041, ContractName:Plans/Collaborative_Workflows.md#CWR-042, ContractName:Plans/Collaborative_Workflows.md#CWR-043

The grilling census keeps round submission distinct from confirmation of the accumulated agreement. Wrap up ends questioning without submitting unfinished drafts, so dismiss (pause) and submit (validated round answers) are not one-to-one. Confirm commits the accumulated agreement after its rounds have already submitted, which ordinary submit cannot do again. Keep going reopens that agreement's frontier, while resume restores one paused envelope or its outcome. They therefore receive three new identities; none of the six lifecycle IDs becomes an alias.

| Command ID | Label | Description | Preconditions | command_kind | Owner | Request → Result | Sole future target |
|---|---|---|---|---|---|---|---|
| `cmd.questionnaire.grill_me.wrap_up` | Wrap up | End questioning, keep unsubmitted drafts as drafts and show What we agreed with answered and open decisions. | `grill_me_enabled && session_state == interviewing && current_questionnaire && explicit_host_user_action` | `domain_action` | `Plans/assistant-chat-design.md` | `QuestionnaireGrillWrapUpRequest` → `QuestionnaireGrillWrapUpResult` | `handlers::questionnaire::grill_me_wrap_up` |
| `cmd.questionnaire.grill_me.confirm` | Confirm | Confirm the current accumulated agreement so its owning flow may capture the user's decisions. | `session_state == awaiting_confirmation && current_agreement_revision && explicit_host_user_action` | `domain_action` | `Plans/assistant-chat-design.md` | `QuestionnaireGrillConfirmRequest` → `QuestionnaireGrillConfirmResult` | `handlers::questionnaire::grill_me_confirm` |
| `cmd.questionnaire.grill_me.keep_going` | Keep going | Return from the current agreement to the same interview, retaining answers and the question count. | `session_state == awaiting_confirmation && current_agreement_revision && explicit_host_user_action` | `domain_action` | `Plans/assistant-chat-design.md` | `QuestionnaireGrillKeepGoingRequest` → `QuestionnaireGrillKeepGoingResult` | `handlers::questionnaire::grill_me_keep_going` |

All three use the questionnaire_card source surface and the shared command response CV-333; normalization.kind = none, alias_of_command_id = null. The questionnaire host already exists; questionnaire_card is a newly registered surface ID in the surface table above, including when the host renders What we agreed. All remain candidate_not_registered, handler_unavailable, with exact explained exclusions and disabled command_not_registered controls until native admission. The six existing questionnaire candidates retain their current state and semantics. Draft editing and accept-the-round add questionnaire_card as documented producers of draft_update and submit under those existing exclusions. Number labels and recommendation seeds dispatch nothing. No command creates a new event, question counter or implementation authority.

### UCC-206 - Grilling Controls Reuse The Question Host

```yaml
plan_unit_id: UCC-206
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  DL-218 reuses QuestionItem.default_values for each preselected recommended answer,
  cmd.questionnaire.draft_update for edits and cmd.questionnaire.submit for accepting the whole
  validated round. Numbered labels are presentation. The existing host's newly registered
  questionnaire_card surface also raises three new domain_action candidates owned by
  Plans/assistant-chat-design.md ACD-503: cmd.questionnaire.grill_me.wrap_up uses
  QuestionnaireGrillWrapUpRequest and QuestionnaireGrillWrapUpResult through
  handlers::questionnaire::grill_me_wrap_up; cmd.questionnaire.grill_me.confirm uses
  QuestionnaireGrillConfirmRequest and QuestionnaireGrillConfirmResult through
  handlers::questionnaire::grill_me_confirm; cmd.questionnaire.grill_me.keep_going uses
  QuestionnaireGrillKeepGoingRequest and QuestionnaireGrillKeepGoingResult through
  handlers::questionnaire::grill_me_keep_going. They respectively end questioning without submitting
  drafts, confirm the accumulated agreement, and return to the same frontier without resetting its
  count. Dismiss only pauses, resume restores a paused envelope, and submit already submits a round,
  so none has one-to-one session semantics and none becomes an alias. Every new row remains
  candidate_not_registered and handler_unavailable with disabled command_not_registered controls and
  no expected events. Only authenticated host user actions may invoke the controls; each session
  requires Confirm of its own current agreement, gating only the step consuming those answers while
  already running work continues.
gui_related: true
gui_classification_reason: Defines the visible controls and their owner behavior.
depends_on:
- ACD-503
- CWR-043
- APR-072
- UCC-161
unblocks: []
acceptance_criteria:
- Recommendations remain drafts until explicit round submission.
- Wrap up never auto-submits a partial round.
- Only Confirm accepts the accumulated agreement.
- Keep going retains the same session, answer history and shared budget.
validation_surfaces:
- python3 scripts/pm-new-contracts-verify.py
- python3 scripts/pm-plan-index.py validate
risk_class: questionnaire_control_semantics
reasoning_tier: high
context_scope: wonderer_grill_me_companions
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- Plans/Commands_System.md
- Plans/assistant-chat-design.md
- Plans/assistant_chat_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md DL-218"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DECISIONS.md sha256:dfa2f354936defd187d610de4aee77a3d8b75b6d25692e592ba48f7b66bfebce"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DEFAULTS-APPROVED.md sha256:f199f188e3e4b1ecd5474a1bc2f87c2d5156863909eb9de9cc3ee9fcb7bfd5be"
preserved_exact_tokens:
- QuestionItem.default_values
- cmd.questionnaire.draft_update
- cmd.questionnaire.submit
- cmd.questionnaire.grill_me.wrap_up
- cmd.questionnaire.grill_me.confirm
- cmd.questionnaire.grill_me.keep_going
- QuestionnaireGrillWrapUpRequest
- QuestionnaireGrillConfirmRequest
- QuestionnaireGrillKeepGoingRequest
- questionnaire_card
negative_constraints:
- Do not alias session controls to round lifecycle commands with different effects.
- Do not auto-answer or auto-confirm on navigation, timeout or exhaustion.
owner_hints:
- Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-218, ContractName:Plans/Collaborative_Workflows.md#CWR-041, ContractName:Plans/Collaborative_Workflows.md#CWR-042, ContractName:Plans/Collaborative_Workflows.md#CWR-043
