# Shard 006: References

Source: `Plans/Crosswalk.md`

Source lines: L311-L384

Source SHA256: `87e9726d43ebe99698b62e6a35b362674b4207f4d8d2aaa904ec79b9a1f77429`

---

## References


- `Plans/Spec_Lock.json`
- `Plans/DRY_Rules.md`
- `Plans/Glossary.md`
- `Plans/Decision_Policy.md`
- `Plans/Tools.md`
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/Widget_System.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`


### 3.14 DocumentInlineNotes
**Owner:** GUI contract in `Plans/FinalGUISpec.md`; persistence contract in `Plans/storage-plan.md`; workflow semantics in `Plans/chain-wizard-flexibility.md` and `Plans/interview-subagent-integration.md`; chat-handoff rules in `Plans/assistant-chat-design.md`.

Rules:
- This primitive now covers durable document annotations on the legacy `note_record.v1` substrate.
- User-facing term is **Annotations** even though storage keys retain `note` naming for continuity.
- Durable annotation operations are `comment`, `replace`, `insert_after`, and `remove`.
- The implementation-ready operation contract is `operation = comment | replace | insert_after | remove`, `intent_kind = question | change_request | both`, and optional `operation_payload` with exact shapes: `comment` uses `{ body }`, `replace` uses `{ replacement_text, rationale? }`, `insert_after` uses `{ insert_text, rationale? }`, and `remove` uses `{ rationale? }`.
- Annotation lifecycle is `open -> addressed -> resolved`.
- Anchor storage MUST include both `TextPositionSelector { start, end }` and `TextQuoteSelector { exact, prefix, suffix }` when deterministic source text exists.

ContractRef: Primitive:DocumentInlineNotes, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

- Re-anchoring is deterministic: 1) position selector match, else 2) quote selector match using prefix/suffix preference, else 3) keep the annotation open and surface `Anchor not found — reselect to re-anchor`.
- `comment` annotations may coexist with any other annotation on the same span.
- Overlapping mutating annotations conflict by default and are excluded from automatic targeted revision until resolved.
- `Send selection to chat` is adjacent behavior, not a durable annotation by default.
- `Send selection to chat` is a thread-scoped chip/handoff path; it must not be collapsed into the durable `/annotation` lifecycle, and it does not create patch-apply semantics.
- Supported `source_surface` values include `assistant_deep_plan`, `interview_doc_pane`, and `document_viewer`; unsupported or `/no-source-map` surfaces are `send-to-chat-only` unless they define stable semantic anchor IDs.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md

---

### 3.15 TargetedRevisionPass
**Owner:** Workflow semantics in `Plans/chain-wizard-flexibility.md` and `Plans/interview-subagent-integration.md`; UI placement in `Plans/FinalGUISpec.md`; prompt and persistence details in `Plans/Prompt_Pipeline.md` and `Plans/storage-plan.md`.

Rules:
- `Resubmit with Annotations` triggers a targeted revision pass scoped to documents with open durable annotations, or a user-selected subset.
- Targeted revision consumes deterministic ordered annotation records that include `annotation_id`, `doc_id`, `operation`, `intent_kind`, `selected_text`, `operation_payload`, `anchor`, and bounded provenance.
- Targeted revision may apply requested edits and/or answer question/comment annotations.
- For each input annotation, the runtime records `addressed | still_open | cannot_apply`, `addressed_explanation`, and `updated_anchor?`.

ContractRef: Primitive:TargetedRevisionPass, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/storage-plan.md

- Targeted revision MUST NOT trigger Multi-Pass Review.
- Conflicting or stale mutating annotations are excluded from automatic revision until resolved.
- One automatic retry is allowed on structured validation failure; after that, the run must explicitly degrade or fail.
- The requested/effective revision capability is explicit: `requested_revision_capability` is compared with the effective capability, which is one of `schema_enforced_structured_revision`, `validated_structured_revision`, or `chat_handoff_only`.
- `schema_enforced_structured_revision` requires transport-native `/structured-output` support and local validation; `validated_structured_revision` allows local shape and anchor validation when provider guarantees are weaker; `chat_handoff_only` preserves durable annotations but routes mutating work into chat/manual follow-up.
- Bundle lifecycle/audit events remain visible as `bundle.note_created`, `bundle.note_status_changed`, `bundle.revision_started`, `bundle.revision_completed`, `bundle.revision_interrupted`, `bundle.selection_sent_to_chat`, and `bundle.selection_forward_blocked`.
- Future-phase risk tags for this primitive are explicit and non-blocking: `/future-phase`, `/risk`, `/providers`, `/conflicts`, `revision-prompt`, `thread-target`, `send-to-chat`, `sensitivity-aware`, `/stale`, and `/degradation`.
- V1 is note-based embedded-document review upgraded into structured annotations; direct `patch-apply` behavior is out of scope.

ContractRef: ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Permissions_System.md

---

### 3.16 FinalReviewGate
**Owner:** Workflow semantics in `Plans/chain-wizard-flexibility.md` and `Plans/interview-subagent-integration.md`; artifact taxonomy and restore semantics in `Plans/storage-plan.md`.

Rules:
- Multi-Pass Review is final-review only: enabled only when all bundle docs are Approved/Done and no durable annotations remain open.
- Question/comment annotations count as open until the user resolves them.
- Pending `Send selection to chat` chips do not satisfy or bypass the gate.
- Final review runs once by default; rerun explicit only.
- Final gate is a single decision: `Accept | Reject | Edit`.

ContractRef: Primitive:TargetedRevisionPass, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/storage-plan.md
