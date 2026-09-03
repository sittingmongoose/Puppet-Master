# Shard 057: FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07

Source: `Plans/assistant-chat-design.md`

Source lines: L23717-L23788

Source SHA256: `3a7c8066cfd8103cbc605111d917224c61ae3d7ee19f2e6e354076306c67919e`

---

## FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07

This addendum closes only the residual FABLE Assistant Chat feature-contract rows for questionnaire shape, question lifecycle mechanics, Stop/Edit/Resend mutation and cancellation, annotation reanchoring minima, empty revert behavior, and thread lifecycle reverse/restore transitions. It does not repair unrelated GUI wiring, FileSafe, runtime certification, or implementation-build evidence.

### ACD-433 - FABLE Residual Chat Contract Mechanics

```yaml
plan_unit_id: ACD-433
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant Chat closes the residual FABLE mechanics gaps by making the questionnaire envelope and
  QuestionItem shape inline, assigning command ids to question lifecycle transitions, adding thread lifecycle
  reverse and restore transitions, defining Stop/Edit/Resend as soft history mutation plus active-work
  cancellation, specifying annotation reanchor thresholds, and defining empty revert as a disabled/no-op
  inline error state. Conversation rewind never mutates files, and revert never fabricates a target when no
  eligible prior mutating assistant turn exists.
gui_related: true
gui_classification_reason: These contracts define visible chat controls, questionnaire cards, annotation actions, thread restore behavior, and user-facing empty states.
depends_on: [ACD-012, ACD-013, ACD-027, ACD-028, ACD-048, ACD-050, ACD-057, ACD-074]
unblocks: []
acceptance_criteria:
  - QuestionnaireEnvelope and QuestionItem fields, enums, option shape, answer shape, autosave debounce, and paused expiry are defined inline in the question system section.
  - Question transitions use command ids for draft update, submit, dismiss, resume, expire, and unavailable outcomes.
  - Stop sends cancellation to active model/tool/subagent leases, records cancellation or timeout, and does not silently clear queued messages.
  - Edit and Resend soft-supersede later generated transcript and operation records with tombstones rather than hard-deleting audit history.
  - Queue entries have stable ids, state, position, text refs, attachment refs, and a defined max-2 overflow state.
  - Thread restore and unarchive edges are explicit, and deleted threads have no ordinary restore transition.
  - Annotation reanchoring uses exact range, then normalized quote matching with similarity >= 0.97, max 10 percent span-length delta, and no ambiguous best match.
  - Empty `cmd.chat.revert` is disabled when precomputed, or returns `no_eligible_mutating_turn` without changing transcript, files, worktree, or queue state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status
risk_class: fable_residual_chat_mechanics_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: residual_chat_mechanics_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:476
  - fablereport.md:477
  - fablereport.md:478
  - fablereport.md:479
  - fablereport.md:481
  - fablereport.md:483
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "QuestionItem"
  - "questionnaire"
  - "Stop/Edit/Resend"
  - "creating -> active -> suspended -> archived -> deleted"
  - "quote_match"
  - "cmd.chat.revert"
  - "cmd.chat.rewind"
  - "no_eligible_mutating_turn"
negative_constraints:
  - Do not treat this chat mechanics repair as GUI wiring, FileSafe, runtime certification, implementation readiness, or buildability proof.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime launches, runtime certification evidence, production build tasks, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
```
