# Shard 079: Grill Me rounds and agreement — DL-218

Source: `Plans/assistant-chat-design.md`

Source lines: L27908-L27986

Source SHA256: `33007fdf581501ae7446911d56da60472bf8b258082eb909d624d6bc7b0b398c`

---

## Grill Me rounds and agreement — DL-218

This is a profile of section 7.4's existing questionnaire, consumed by CWR-042, CWR-043 and APR-072. It adds no alternate question store. The host numbers the round's frontier questions and marks the recommended option in its description; that existing option ID is seeded through default_values. The recommendation is only a draft. Accepting an individual recommendation uses cmd.questionnaire.draft_update on that question’s PM-managed draft; it submits no other question. One explicit cmd.questionnaire.submit accepts all validated answers in the whole round. Answers from completed rounds are staged for the session, not yet decisions the workflow may act on. I don't know is a supported freeform answer that leaves the decision open, not a fabricated recommendation acceptance.

When the frontier is empty, the safety cap is reached or the user presses Wrap up, the host shows one What we agreed card with every answer and every open decision and reason. It is a review of existing answers, not a new charged QuestionItem. Wrap up uses cmd.questionnaire.grill_me.wrap_up and preserves any unfinished draft without submitting it. Confirm uses cmd.questionnaire.grill_me.confirm against the current agreement revision; only its acknowledged owner result confirms the accumulated decisions. Keep going uses cmd.questionnaire.grill_me.keep_going to return to the same interview with its answers and one counter intact. At the cap it may revisit existing answers but cannot admit another fresh question. Each newly presented question is still charged once under QMAX; a recommendation, action button or agreement render charges nothing.

The three typed request/result pairs live in Plans/assistant_chat_contracts.schema.json and its fixture pair. They reference the existing host session and source flow, current questionnaire and agreement, revision and currentness; they define no new durable record family. The session states interviewing, awaiting_confirmation and confirmed describe this profile's owner state, not new QuestionnaireEnvelope.flow_state values. The envelope's answer sources, response_kind and lifecycle enums stay locked. Authenticated host user provenance, revision checks and idempotent replay apply; an actor_ref string supplied by an agent is never proof of user action. Dismissal still pauses, resume restores the same paused envelope, and neither confirms or wraps up. No Plan write, Crew split, room round 1 or BrainStorm blind proposal may consume the staged agreement before Confirm. A stale confirmation changes nothing. The controls never mutate a target project, start execution or grant permission. No EventRecord is admitted (DL-093).

### ACD-503 - Grilling Rounds And What We Agreed

```yaml
plan_unit_id: ACD-503
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  DL-218 makes Grill Me use the existing QuestionnaireEnvelope host: numbered frontier questions, a recommended
  option seeded by default_values, edits or acceptance of one recommendation through cmd.questionnaire.draft_update,
  and explicit cmd.questionnaire.submit to accept the whole ready round. Default selection is no submitted answer. The host stages
  round answers until What we agreed lists every answer and every open decision. cmd.questionnaire.grill_me.wrap_up
  ends questioning without submitting incomplete drafts; cmd.questionnaire.grill_me.confirm confirms that
  current agreement; cmd.questionnaire.grill_me.keep_going returns to the same interview and recomputes
  its frontier with the existing answers and question count. These are session operations, distinct from
  dismiss, resume and round submission. The three request/result pairs are QuestionnaireGrillWrapUpRequest/QuestionnaireGrillWrapUpResult,
  QuestionnaireGrillConfirmRequest/QuestionnaireGrillConfirmResult and QuestionnaireGrillKeepGoingRequest/QuestionnaireGrillKeepGoingResult
  in Plans/assistant_chat_contracts.schema.json. They reference existing host state, add no durable family
  and preserve locked envelope enums. Only authenticated host user actions and current agreement revisions
  may commit; retries return the original outcome. No consumer acts on staged answers until Confirm. The
  cap remains a safety net; Keep going at the cap may revisit existing answers but admits no new question.
  What we agreed and its controls are not charged QuestionItems. No control mutates the target project,
  starts execution or grants permission.
gui_related: true
gui_classification_reason: Defines the visible controls and their owner behavior.
depends_on:
- ACD-459
- CWR-042
- CWR-043
- APR-072
unblocks: []
acceptance_criteria:
- Each recommendation uses an existing option and remains a draft until user submit.
- Accept-the-round submits all validated responses once.
- Wrap up, an empty frontier and exhaustion all show What we agreed without confirming it.
- Confirm gates consumers, rejects stale identity and replays without duplication.
- Keep going preserves answers, session and question budget.
validation_surfaces:
- python3 scripts/pm-new-contracts-verify.py
- python3 scripts/pm-plan-index.py validate
risk_class: grilling_confirmation_boundary
reasoning_tier: high
context_scope: wonderer_grill_me_companions
implementation_surfaces:
- Plans/assistant-chat-design.md
- Plans/assistant_chat_contracts.schema.json
- Plans/assistant_chat_contract_fixtures.json
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md DL-218
- /mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DECISIONS.md sha256:dfa2f354936defd187d610de4aee77a3d8b75b6d25692e592ba48f7b66bfebce
preserved_exact_tokens:
- default_values
- cmd.questionnaire.submit
- cmd.questionnaire.grill_me.wrap_up
- cmd.questionnaire.grill_me.confirm
- cmd.questionnaire.grill_me.keep_going
- What we agreed
negative_constraints:
- Do not infer a user answer from a preselection.
- Do not act on answers before Confirm.
- Do not add envelope enum values or a second question counter.
owner_hints:
- Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-218, ContractName:Plans/Collaborative_Workflows.md#CWR-041, ContractName:Plans/Collaborative_Workflows.md#CWR-042, ContractName:Plans/Collaborative_Workflows.md#CWR-043
