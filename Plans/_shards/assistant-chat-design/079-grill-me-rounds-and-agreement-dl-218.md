# Shard 079: Grill Me rounds and agreement — DL-218

Source: `Plans/assistant-chat-design.md`

Source lines: L27908-L28000

Source SHA256: `8f058ecc712db40eff989a6e1ed36e4edafaf178be272eb68138c34cad4297d8`

---

## Grill Me rounds and agreement — DL-218

This is a profile of section 7.4's existing questionnaire, consumed by CWR-042, CWR-043 and APR-072. It adds no alternate question store. The host numbers the round's frontier questions and marks the recommended option in its description; that existing option ID is seeded through default_values. The recommendation is only a draft. Accepting an individual recommendation uses cmd.questionnaire.draft_update on that question’s PM-managed draft; it submits no other question. One explicit cmd.questionnaire.submit accepts all validated answers in the whole round. Answers from completed rounds are staged for the session, not yet decisions the workflow may act on. I don't know is a supported freeform answer: it removes that decision from the frontier, lists it as open in What we agreed and does not ask it again unless the user reopens it.

The session ends by itself only when no decision is ready, no fact research is pending and no branch is unsettled. If every remaining question waits on research, the host waits, says it is looking things up and recomputes when research returns. Automatic completion, the safety cap and Wrap up each show that session's What we agreed card with every answer and every open decision and reason. It is a review of existing answers, not a new charged QuestionItem. Wrap up uses cmd.questionnaire.grill_me.wrap_up and preserves any unfinished draft without submitting it. Confirm uses cmd.questionnaire.grill_me.confirm against the current agreement revision; only its acknowledged owner result confirms the accumulated decisions. Keep going uses cmd.questionnaire.grill_me.keep_going to return to the same interview with its answers and one counter intact. At the cap it may revisit existing answers but cannot admit another fresh question. Each newly presented question is still charged once under QMAX; a recommendation, action button or agreement render charges nothing.

The three typed request/result pairs live in Plans/assistant_chat_contracts.schema.json and its fixture pair. They reference the existing host session and source flow, current questionnaire and agreement, revision and currentness; they define no new durable record family. The session states interviewing, awaiting_confirmation and confirmed describe this profile's owner state, not new QuestionnaireEnvelope.flow_state values. The envelope's answer sources, response_kind and lifecycle enums stay locked. Authenticated host user provenance, revision checks and idempotent replay apply; an actor_ref string supplied by an agent is never proof of user action. Dismissal still pauses, resume restores the same paused envelope, and neither confirms or wraps up. No step may consume the staged agreement before that session's current Confirm. Initially this gates Plan writes, Crew split, room round 1 or BrainStorm blind proposals. Enabling Grill Me mid-run starts the interview at the next round, assignment or phase boundary; already running work continues, and only the step using new answers waits. Every later decision session ends in its own What we agreed revision with fresh Confirm and the same question counter. A stale confirmation changes nothing. The controls never mutate a target project, start execution or grant permission. No EventRecord is admitted (DL-093).

### ACD-503 - Grilling Rounds And What We Agreed

```yaml
plan_unit_id: ACD-503
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  DL-218 makes Grill Me use the existing QuestionnaireEnvelope host: numbered frontier questions, a
  recommended option seeded by default_values, edits or acceptance of one recommendation through
  cmd.questionnaire.draft_update, and explicit cmd.questionnaire.submit to accept the whole ready
  round. Default selection is no submitted answer. The host stages round answers until What we
  agreed lists every answer and every open decision. The interview ends by itself only when no
  decision is ready, no fact research is pending and no branch is unsettled; a frontier blocked on
  research waits with looking-things-up feedback and recomputes on return. I don't know removes a
  decision from the frontier and lists it as open until the user reopens it. Wrap up and exhaustion
  may end earlier with open items listed. cmd.questionnaire.grill_me.wrap_up ends questioning
  without submitting incomplete drafts; cmd.questionnaire.grill_me.confirm confirms that current
  agreement; cmd.questionnaire.grill_me.keep_going returns to the same interview and recomputes its
  frontier with the existing answers and question count. These are session operations, distinct from
  dismiss, resume and round submission. The three request/result pairs are
  QuestionnaireGrillWrapUpRequest/QuestionnaireGrillWrapUpResult,
  QuestionnaireGrillConfirmRequest/QuestionnaireGrillConfirmResult and
  QuestionnaireGrillKeepGoingRequest/QuestionnaireGrillKeepGoingResult in
  Plans/assistant_chat_contracts.schema.json. They reference existing host state, add no durable
  family and preserve locked envelope enums. Only authenticated host user actions and current
  agreement revisions may commit; retries return the original outcome. Grill Me enabled mid-run
  starts at the next round, assignment or phase boundary. Already running work continues; only the
  step consuming new answers waits for Confirm of that session's current agreement. Every later
  decision session has its own What we agreed revision and fresh Confirm, with no reuse of an
  earlier confirmation for new answers. The host never resets the shared question counter. The cap
  remains a safety net; Keep going at the cap may revisit existing answers but admits no new
  question. What we agreed and its controls are not charged QuestionItems. No control mutates the
  target project, starts execution or grants permission.
gui_related: true
gui_classification_reason: Defines the visible controls and their owner behavior.
depends_on:
- ACD-459
- CWR-042
- CWR-043
- APR-072
unblocks: []
acceptance_criteria:
  - "Each recommendation uses an existing option and remains a draft until explicit user submit; accept-the-round submits all validated responses once."
  - "Pending fact research keeps an otherwise blocked interview waiting, with visible feedback and recomputation when research returns."
  - "I do not know leaves an open item outside the frontier until reopened."
  - "Automatic completion requires no ready decision, pending fact research or unsettled branch; Wrap up and exhaustion list open items."
  - "Each session has its own current agreement and Confirm; stale and repeated actions do not release a later gate."
  - "Mid-run enablement starts at the next boundary, preserves running work and gates only the step using new answers."
  - "Keep going preserves answers, session and the shared counter."
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
  - "Plans/Decision_Log.md DL-218"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DECISIONS.md sha256:dfa2f354936defd187d610de4aee77a3d8b75b6d25692e592ba48f7b66bfebce"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DEFAULTS-APPROVED.md sha256:f199f188e3e4b1ecd5474a1bc2f87c2d5156863909eb9de9cc3ee9fcb7bfd5be"
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
