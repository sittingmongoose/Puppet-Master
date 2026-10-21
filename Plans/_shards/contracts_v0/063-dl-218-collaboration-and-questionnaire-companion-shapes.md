# Shard 063: DL-218 collaboration and questionnaire companion shapes

Source: `Plans/Contracts_V0.md`

Source lines: L23954-L24030

Source SHA256: `2cbcda1c4776a368c3a581f4e04e2fa2fa02f76140733ab77a2e10fcbfa592d0`

---

## DL-218 collaboration and questionnaire companion shapes

| Schema ID | Definition | Owner and schema |
|---|---|---|
| `pm.collaboration.wonderer_pass.v1` | `WondererPass` | CW section 12; `Plans/collaborative_workflows_contracts.schema.json` |
| `pm.collaboration.wonderer_lead.v1` | `WondererLead` | CW section 12; `Plans/collaborative_workflows_contracts.schema.json` |
| `pm.collaboration.lead_research_request.v1` | `CollaborationLeadResearchRequest` | CWR-041; same schema |
| `pm.collaboration.lead_research_result.v1` | `CollaborationLeadResearchResult` | CWR-041; same schema |
| `pm.collaboration.brainstorm_lead_research_request.v1` | `BrainstormLeadResearchRequest` | BrainStorm-only compatibility envelope; same schema |
| `pm.collaboration.brainstorm_lead_research_result.v1` | `BrainstormLeadResearchResult` | BrainStorm-only compatibility envelope; same schema |
| `pm.chat.questionnaire_grill_wrap_up_request.v1` / `pm.chat.questionnaire_grill_wrap_up_result.v1` | `QuestionnaireGrillWrapUpRequest` / `QuestionnaireGrillWrapUpResult` | ACD-503; `Plans/assistant_chat_contracts.schema.json` |
| `pm.chat.questionnaire_grill_confirm_request.v1` / `pm.chat.questionnaire_grill_confirm_result.v1` | `QuestionnaireGrillConfirmRequest` / `QuestionnaireGrillConfirmResult` | ACD-503; same schema |
| `pm.chat.questionnaire_grill_keep_going_request.v1` / `pm.chat.questionnaire_grill_keep_going_result.v1` | `QuestionnaireGrillKeepGoingRequest` / `QuestionnaireGrillKeepGoingResult` | ACD-503; same schema |

Only WondererPass and WondererLead are new record shapes; requests/results add no durable record family. All use the owners' ordinary envelopes, not a second command response. The two existing schema/fixture pairs remain in the closed CONTRACT_PAIRS manifest. The definition gains grill_me_enabled for Crew, BrainStorm and Chat Room and additive_role_kind closes to none | wonderer. MIG-021 converts legacy Grill Me specs first. These shape registrations admit no storage writer/key, runtime handler or EventRecord; physical registration remains requires_central_adjudication under the existing CW section 12 boundary. DL-093 still owns event admission.

### CV-363 - Wonderer And Grilling Companion Shape Registry

```yaml
plan_unit_id: CV-363
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  DL-218 registers the shapes pm.collaboration.wonderer_pass.v1 (WondererPass), pm.collaboration.wonderer_lead.v1
  (WondererLead), pm.collaboration.lead_research_request.v1 (CollaborationLeadResearchRequest) and pm.collaboration.lead_research_result.v1
  (CollaborationLeadResearchResult) in Plans/collaborative_workflows_contracts.schema.json. The existing
  pm.collaboration.brainstorm_lead_research_request.v1 and pm.collaboration.brainstorm_lead_research_result.v1
  remain one-to-one BrainStorm compatibility envelopes. Plans/assistant_chat_contracts.schema.json holds
  QuestionnaireGrillWrapUpRequest/Result, QuestionnaireGrillConfirmRequest/Result and QuestionnaireGrillKeepGoingRequest/Result
  under their pm.chat.questionnaire_grill_* request/result IDs listed above, referencing existing host
  state. Requests and results create no durable family. CollaborativeDefinition gains grill_me_enabled
  and ParticipantSpec additive_role_kind closes to none | wonderer. Both schema/fixture pairs stay in
  the existing closed CONTRACT_PAIRS manifest; shape checks admit no writer, storage key, native handler
  or event. Physical registration remains requires_central_adjudication, and DL-093 governs any future
  EventRecord admission.
gui_related: false
gui_classification_reason: Defines record, migration or validation contracts.
depends_on:
- CWR-041
- CWR-042
- ACD-503
unblocks: []
acceptance_criteria:
- Every listed schema discriminator resolves to its owner definition.
- Both compatibility shapes remain valid and normalize one to one.
- No new command or record implies physical or event admission.
validation_surfaces:
- python3 scripts/pm-new-contracts-verify.py
- python3 scripts/pm-plan-index.py validate
risk_class: collaboration_contract_registry
reasoning_tier: high
context_scope: wonderer_grill_me_companions
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/collaborative_workflows_contracts.schema.json
- Plans/assistant_chat_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md DL-218
- /mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DECISIONS.md sha256:dfa2f354936defd187d610de4aee77a3d8b75b6d25692e592ba48f7b66bfebce
preserved_exact_tokens:
- pm.collaboration.wonderer_pass.v1
- pm.collaboration.wonderer_lead.v1
- pm.collaboration.lead_research_request.v1
- pm.collaboration.lead_research_result.v1
- requires_central_adjudication
negative_constraints:
- Do not create an EventRecord or storage writer from a schema registration.
owner_hints:
- Plans/Contracts_V0.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-218, ContractName:Plans/Collaborative_Workflows.md#CWR-041, ContractName:Plans/Collaborative_Workflows.md#CWR-042, ContractName:Plans/Collaborative_Workflows.md#CWR-043
