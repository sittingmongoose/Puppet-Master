# Shard 045: DL-218 shared research and grilling wiring

Source: `Plans/Wiring_Matrix.md`

Source lines: L6339-L6433

Source SHA256: `7304c55288721d09f1c08a64e30ee5cd202487c687a30507474da61c58fa3f1a`

---

## DL-218 shared research and grilling wiring

| Producer | Command | Disposition and target |
|---|---|---|
| workflow_card, workflow_panel, wonderer_workspace Check It | `cmd.collaboration.research_lead` | Exact candidate exclusion; sole future handlers::collaboration::research_lead, CollaborationLeadResearchRequest → CollaborationLeadResearchResult. Require lead_admission_open, return an existing in-flight operation, or refuse lead_admission_closed after BrainStorm/Crew synthesis starts. |
| Legacy BrainStorm brainstorm_panel or wonderer_workspace Check It | `cmd.brainstorm.research_lead` | Compatibility-only normalization to the preceding row; brainstorm_panel maps to workflow_panel; no second primary row or handler. |
| questionnaire_card recommended-answer acceptance or edit | `cmd.questionnaire.draft_update` | Reuse existing exact candidate exclusion and host draft operation. |
| questionnaire_card accept whole round | `cmd.questionnaire.submit` | Reuse existing exact candidate exclusion and explicit validated round submission; no agreement confirmation. |
| questionnaire_card Wrap up | `cmd.questionnaire.grill_me.wrap_up` | Exact candidate exclusion; sole future handlers::questionnaire::grill_me_wrap_up, QuestionnaireGrillWrapUpRequest → QuestionnaireGrillWrapUpResult. |
| questionnaire_card What we agreed / Confirm | `cmd.questionnaire.grill_me.confirm` | Exact candidate exclusion; sole future handlers::questionnaire::grill_me_confirm, QuestionnaireGrillConfirmRequest → QuestionnaireGrillConfirmResult. |
| questionnaire_card What we agreed / Keep going | `cmd.questionnaire.grill_me.keep_going` | Exact candidate exclusion; sole future handlers::questionnaire::grill_me_keep_going, QuestionnaireGrillKeepGoingRequest → QuestionnaireGrillKeepGoingResult. |
| brainstorm_panel Allow more questions mid-run | `cmd.collaboration.reconfigure` | Existing assistant.redesign.cmd.collaboration_reconfigure gains this source and the switch-only add_grill_me acceptance test; interview at the next boundary, continue running work and gate only the step using that session's confirmed answers. |
| BrainStorm Write the plan | `cmd.brainstorm.synthesize_plan` | Existing assistant.redesign.w_029.brainstorm_synthesize_plan gains the pass-in-flight, lead disposition/research and current grilling-confirmation gates; start closes lead admission and freezes the lead/research revision for publication. |

The four new candidates and six existing questionnaire candidates stay handler_unavailable, render disabled command_not_registered, and have empty expected_event_types under DL-093. Plans/Wiring_Matrix.production.exclusions.json is their current inventory location; admission atomically removes an exact candidate exclusion and supplies its native command/handler and sole production row. Adding a production row now would contradict the existing candidate boundary (WM-063). Existing production-intent entries above are updated in Plans/Wiring_Matrix.production.json; they still prove no native runtime. Every surface reads its owner availability, currentness and exact reason, preserves route/focus, and uses the same keyboard/pointer request. An unavailable control, denied request, stale agreement or replay changes no extra state. No new event is proposed by these companions.

### WM-094 - Shared Research Alias And Grilling Control Wiring

```yaml
plan_unit_id: WM-094
unit_type: integration_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  DL-218 places cmd.collaboration.research_lead and cmd.questionnaire.grill_me.wrap_up,
  cmd.questionnaire.grill_me.confirm and cmd.questionnaire.grill_me.keep_going in exact candidate
  exclusions under UCC-205..206 and CS-103. Canonical Check It sources are workflow_card,
  workflow_panel and wonderer_workspace, and grilling session controls use questionnaire_card. All
  render disabled command_not_registered with handler_unavailable and no expected_event_types until
  admission removes each exact exclusion atomically with its handler and production row.
  cmd.brainstorm.research_lead is only the BrainStorm compatibility alias; normalize before all
  gates, map brainstorm_panel to workflow_panel and preserve operation identity with no peer handler
  or production row. Both spellings return the same operation if research is in flight and refuse
  lead_admission_closed after BrainStorm/Crew synthesis starts; successful results need receipts,
  resulting revision/currentness and terminal evidence/reason or observable work. Existing
  draft_update and submit exclusions cover recommendation edits and accept-the-round without
  changing lifecycle semantics. assistant.redesign.cmd.collaboration_reconfigure gains
  brainstorm_panel and switch-only add_grill_me tests, starts the interview at the next round,
  assignment or phase boundary and gates only the step using that session's newly confirmed answers
  while running work continues; assistant.redesign.w_029.brainstorm_synthesize_plan gains the
  pass-in-flight, undecided-lead, pending-research and current grilling-Confirm gates, atomic
  lead-admission closure and a frozen lead/research revision for publication. Chat Room round 1
  never waits for Wonderer; its first pass joins between turns when delivered. The two
  production-intent edits and exclusions are machine companions, never native proof or event
  admission.
gui_related: true
gui_classification_reason: Wires visible Check It, grilling and synthesis controls and exact disabled
  reasons.
depends_on:
- UCC-205
- UCC-206
- CS-103
- ACD-503
unblocks: []
acceptance_criteria:
  - "Each candidate has its exact explained exclusion and no premature production row."
  - "Both research spellings reach one canonical operation."
  - "Switch enabling adds no ParticipantSpec and preserves question history."
  - "Synthesis gates and keyboard/pointer availability agree with owner state."
  - "In-flight research coalesces, and synthesis atomically closes admission with lead_admission_closed and binds its starting revision."
  - "Mid-run grilling waits for the next boundary and only its consuming step waits for the current session's Confirm."
  - "Chat Room round 1 starts without waiting for a Wonderer pass."
validation_surfaces:
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
- python3 scripts/pm-new-contracts-verify.py
- python3 scripts/pm-plan-index.py validate
risk_class: collaboration_wiring_semantics
reasoning_tier: high
context_scope: wonderer_grill_me_companions
implementation_surfaces:
- Plans/Wiring_Matrix.md
- Plans/Wiring_Matrix.production.json
- Plans/Wiring_Matrix.production.exclusions.json
node_compile_hint:
  mode: static_wiring_intent_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md DL-218"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DECISIONS.md sha256:dfa2f354936defd187d610de4aee77a3d8b75b6d25692e592ba48f7b66bfebce"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DEFAULTS-APPROVED.md sha256:f199f188e3e4b1ecd5474a1bc2f87c2d5156863909eb9de9cc3ee9fcb7bfd5be"
preserved_exact_tokens:
- cmd.collaboration.research_lead
- cmd.brainstorm.research_lead
- questionnaire_card
- add_grill_me
- expected_event_types
negative_constraints:
- Do not create peer alias handlers or fabricate native availability.
- Do not add an EventRecord.
owner_hints:
- Plans/Wiring_Matrix.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-218, ContractName:Plans/UI_Command_Catalog.md#UCC-205, ContractName:Plans/UI_Command_Catalog.md#UCC-206, ContractName:Plans/Commands_System.md#CS-103
