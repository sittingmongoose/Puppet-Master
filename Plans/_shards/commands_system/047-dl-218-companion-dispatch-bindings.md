# Shard 047: DL-218 companion dispatch bindings

Source: `Plans/Commands_System.md`

Source lines: L7990-L8072

Source SHA256: `65241c5eadb888e593ca008aff5d5c07c10a06c08d74905daef442bbbaf42f82`

---

## DL-218 companion dispatch bindings

The census and alias ruling are UCC-205 and UCC-206. Shared CV-333 command responses, closed owner errors, currentness, permissions and idempotency apply to every row below. Source availability stays handler_unavailable; the four new candidates and six existing questionnaire candidates render disabled command_not_registered under their exact exclusions. expected_event_types is empty. No native dispatcher or handler is asserted.

| Command | Sole future handler | Request → Result | Owner | Source surfaces |
|---|---|---|---|---|
| `cmd.collaboration.research_lead` | `handlers::collaboration::research_lead` | `CollaborationLeadResearchRequest` → `CollaborationLeadResearchResult` | `Plans/Collaborative_Workflows.md` | `workflow_card`, `workflow_panel`, `wonderer_workspace` |
| `cmd.questionnaire.draft_update` | `handlers::questionnaire::draft_update` | Existing section 7.4 questionnaire draft operation | `Plans/assistant-chat-design.md` | `questionnaire_card`, existing decision-review origins |
| `cmd.questionnaire.submit` | `handlers::questionnaire::submit` | Existing section 7.4 questionnaire round operation | `Plans/assistant-chat-design.md` | `questionnaire_card`, existing decision-review origins |
| `cmd.questionnaire.grill_me.wrap_up` | `handlers::questionnaire::grill_me_wrap_up` | `QuestionnaireGrillWrapUpRequest` → `QuestionnaireGrillWrapUpResult` | `Plans/assistant-chat-design.md` | `questionnaire_card` |
| `cmd.questionnaire.grill_me.confirm` | `handlers::questionnaire::grill_me_confirm` | `QuestionnaireGrillConfirmRequest` → `QuestionnaireGrillConfirmResult` | `Plans/assistant-chat-design.md` | `questionnaire_card` |
| `cmd.questionnaire.grill_me.keep_going` | `handlers::questionnaire::grill_me_keep_going` | `QuestionnaireGrillKeepGoingRequest` → `QuestionnaireGrillKeepGoingResult` | `Plans/assistant-chat-design.md` | `questionnaire_card` |

cmd.brainstorm.research_lead is compatibility-only, not a second primary dispatch row: normalize to cmd.collaboration.research_lead with the BrainStorm-only run check and UCC-205's one-to-one schema and source mapping before availability, permissions, currentness, idempotency and dispatch. The earlier CS-085 BrainStorm table row names this same canonical handler. Both spellings share the operation identity and original receipt on replay. An already in-flight lead returns its existing research operation without starting another attempt. BrainStorm/Crew synthesis closes further-pass and Check It admission with lead_admission_closed, binding its starting lead/research revision. Both alias-identical results require receipts, revision and currentness on committed success and a terminal evidence/reason outcome or observable running work. The research pair is in collaborative_workflows_contracts.schema.json; the new questionnaire pairs are in assistant_chat_contracts.schema.json. Numbering and recommendation seeding are presentation/draft operations and add no commands.

### CS-103 - Wonderer Research Alias And Grilling Session Dispatch

```yaml
plan_unit_id: CS-103
unit_type: command_contract
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  DL-218 binds cmd.collaboration.research_lead to handlers::collaboration::research_lead with
  CollaborationLeadResearchRequest and CollaborationLeadResearchResult. The old
  cmd.brainstorm.research_lead is a BrainStorm-only one-to-one compatibility alias, normalized
  before all gates and operation identity; it has no second handler. Both spellings coalesce an
  already in-flight lead research operation and refuse lead_admission_closed after BrainStorm/Crew
  synthesis starts. A committed success carries receipts, resulting revision and currentness and
  either terminal evidence/reason or observable running work. UCC-206 reuses questionnaire
  draft_update and submit for recommended drafts and accepting a round. The questionnaire_card
  session controls cmd.questionnaire.grill_me.wrap_up, cmd.questionnaire.grill_me.confirm and
  cmd.questionnaire.grill_me.keep_going bind respectively to
  handlers::questionnaire::grill_me_wrap_up, handlers::questionnaire::grill_me_confirm and
  handlers::questionnaire::grill_me_keep_going and their QuestionnaireGrillWrapUpRequest/Result,
  QuestionnaireGrillConfirmRequest/Result and QuestionnaireGrillKeepGoingRequest/Result pairs in
  Plans/assistant_chat_contracts.schema.json. Initial handler_unavailable and
  candidate_not_registered status is preserved, expected_event_types is empty pending DL-093, and
  CV-333 remains the command response owner. No draft or round submit confirms the accumulated
  agreement, and each session's explicit current user confirmation releases only the step that needs
  its new answers while running work continues.
gui_related: true
gui_classification_reason: Defines the visible controls and their owner behavior.
depends_on:
- UCC-205
- UCC-206
- ACD-503
unblocks: []
acceptance_criteria:
- One research operation serves both spellings with unchanged identity and replay.
- The three session controls have one named future handler each.
- Candidate availability and zero unregistered events remain truthful.
validation_surfaces:
- python3 scripts/pm-new-contracts-verify.py
- python3 scripts/pm-plan-index.py validate
risk_class: collaboration_questionnaire_dispatch
reasoning_tier: high
context_scope: wonderer_grill_me_companions
implementation_surfaces:
- Plans/Commands_System.md
- Plans/UI_Command_Catalog.md
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
- handlers::collaboration::research_lead
- expected_event_types
negative_constraints:
- Do not create a second BrainStorm research handler or receipt.
- Do not treat handler names as runtime proof.
owner_hints:
- Plans/Commands_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-218, ContractName:Plans/Collaborative_Workflows.md#CWR-041, ContractName:Plans/Collaborative_Workflows.md#CWR-042, ContractName:Plans/Collaborative_Workflows.md#CWR-043
