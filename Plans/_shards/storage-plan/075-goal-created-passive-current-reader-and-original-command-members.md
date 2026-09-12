# Shard 075: Goal-created passive current reader and original command members

Source: `Plans/storage-plan.md`

Source lines: L23810-L23941

Source SHA256: `3161de48504e8baadc9d95242e0c9f8687c9c6d59f5dbc84653dff2c8e436f3c`

---

## Goal-created passive current reader and original command members

SP-298 defines the passive internal inspection facet of `goal.created`, following the original creation prerequisite SP-294/GRS-066/CV-341. It creates no durable family or projector. Its exact selectors are `storage.goal_created.current_read.v1@1.0.0`, `storage.goal_created.decode_active_v3.v1@1.0.0`, `storage.goal_created.decode_retained_v2.v1@1.0.0` and `storage.goal_start_command.resolve_member.v1@1.0.0`. The closed request/page/failure/private-cursor/observation/member shapes are `Plans/goal_created_reader_contracts.schema.json`; route and member artifacts are respectively `Plans/goal_created_reader_contracts/routes.json` and `Plans/goal_created_reader_contracts/command-members.json`, with their exact adjacent schemas. RSC-018 owns the complete package resource graph and current installation obligation. The supplied support map declares every native role unsupported.

The checkpoint disposition is `none_required` for this passive facet and whole original SP-278 admission remains mandatory. GRS-064 separately maps current creation Activity/body/history to existing canonical readers and the original SP-287/SP-294 durable body/command publications; it assigns no event-derived current Goal projector. That owner mapping is independent of this passive exemption. Other Goal/GoalRun events, deferred or historical projection routes and complete family depth remain separate. Neither event presence nor a released observation proves command success, first-continuation eligibility, objective completion or source authority.

### Encodings and exact shape boundary

Reader request/page/failure, observations, member API replies and private cursor use the primitive canonical MessagePack encoding defined by SP278: nil, boolean, uint64, scalar UTF-8 strings, arrays and maps with unique scalar-string keys. Use shortest integer/string/array/map prefixes, big-endian lengths/integers and strict UTF-8 byte order for map keys. Reject negative/overflow integers, floats including integral floats, binary/extension values, duplicate keys, lone surrogates, padding and trailing bytes. Preserve arrays and Unicode without normalization. This adopts encoding rules, not SP278's BDIG wrapper or a new shared digest domain. Decode/schema-check/re-encode must be byte-identical. JSON Schema alone does not distinguish every wire-level primitive or enforce cross-object equality; the original codec/owner must do so.

`Plans/goal_created_reader_contracts/support-map.json`, the newly authored reader schema, route and member resources are ASCII JSON, sorted keys, compact separators, no BOM/duplicate keys, exactly one final LF. SHA-256 covers actual entire resource bytes including LF. The four copied existing schema assets keep original file bytes and their original `$id` scopes; they are not reformatted to this new resource encoding. API serialization does not change an original returned command member's own `pm.goal.start_command_json.v1` semantics: its original canonical-JSON value/digest is authenticated before encoding the surrounding reply. No command/member row is rewritten.

Request has exactly five fields, always explicit: `reader_binding`, actual `storage_instance_id`, exact authorized `project_id`, `budget`, `cursor`. Binding is `storage.goal_created.current_read.v1@1.0.0`; no focused Project or additional filter exists. Budget has exactly max_observations=1..128, max_examined_frames=1..4096, max_source_bytes=1..67108864, max_decoded_value_bytes=1..67108864, max_response_bytes=1..1048576. No clamp, default or inferred resource permission. Caller budget must match the original cursor's budget exactly on resume.

Success page has exactly nine fields: reader binding, Storage instance, Project, observations, scan_complete, source_health, stop_reason, next_cursor, action_authority=none. An observation has exactly eight fields: event_id, sequence_id, payload_schema_id, project_id, goal_id, nullable thread_id, occurred_at_utc, creation_goal_revision. V3 requires revision 1 and its genuine nonnull thread; whole-v2 preserves its original revision and applicable envelope thread. Sequence/revision values must remain representable by the original uint64 wire domain. No body, legacy payload, account/provider identity or dereferenced source ref is exposed. Exact ordering and cross-field equality derive from original source, not schema validity.

Failure has exactly six fields: reader binding, storage_instance_id, project_id, status=unavailable, closed reason, action_authority=none. It has no observations or next cursor. For invalid_request only, an absent or malformed identity is null; a structurally valid supplied identity is echoed exactly, without resolving/defaulting another scope. Other failures require exact validated request identities. This closes malformed-request serialization without inventing authority. The member failure similarly uses null member_ref only when no structurally valid supplied reference exists. The bounded existing error transport is separate from the success-response-byte budget.

### Original source, budgets and deterministic prefix

Original SP278/native source admission verifies the complete selected root, uniquely current node, dataset, immutable anchor, frontier, source selection, source inventory/gaps/frame/index/envelope/admission and source value joins. A nonmatching frame receives all those original generic checks; the Goal reader does not interpret another family's semantics. The two Goal-specific payload/body/shared routes apply only to matching project-scoped goal.created frames. An unsupported generic source condition prevents complete proof and makes the call unavailable. The reader never repairs/rebuilds an index, changes source, skips an unsupported frame or writes a checkpoint.

Charge all logically required work even when cached. Whole-source/index verification, resume anchor and actual source/header/frame bytes charge source/value bytes wherever required; repeated validation work required by the original proof charges again. A cache changes physical I/O only, not logical charges or the prefix. Actual extra I/O also needs original Storage resource admission. max_examined_frames counts newly visited complete positions in the forward consumption scan, including a fully validated match which does not fit the output. Complete generic proof and inclusive anchor work consume their required byte/value budgets independently; neither manufactures forward progress or a returned observation. Count a forward position once per page attempt even if its original source proof was already admitted; caching does not avoid that charge. Inclusive anchor revalidation consumes byte/value budgets but is not a new frame or observation. Checked uint64 arithmetic and admission precede each operation; partial frames are never consumed.

For exact no-page behavior: exhausting a requested numerical byte/value budget during mandatory proof, inclusive resume revalidation or before any new consumable frame gives budget_too_small. Independent Storage resource admission refusal gives resource_unavailable. A missing, invalid or unsupported complete generic source proof gives source_unavailable. None returns a page/successor or destroys a still-valid previous cursor. A whole proof not admitted under the budget cannot become partial successful proof.

After complete admission, scan canonical global source order across all partitions. Nonmatching complete frames advance the consumed prefix. A match advances it only if the complete authorized observation and entire final page fit; no splitting, truncation or skipped match. Validation cost is charged for a nonfitting match but it is not consumed and must be revalidated next call. Stop immediately at a frame or observation limit. If the actual captured boundary is consumed, captured_boundary wins and next_cursor is null. Otherwise a successful prefix has a nonnull successor and one exact budget stop reason. Multiple limits reached at the same completed frame use observation_limit before frame_limit; byte limits stop at the next required charge in actual deterministic verification order; a completely verified candidate observation failing final page size uses response_byte_limit. The chosen reason cannot justify speculative reads.

A partial page with zero observations requires at least one genuine new consumed nonmatching frame. No progress means budget_too_small. The complete canonical MessagePack success bytes, including the exact 85-byte ASCII opaque handle when present, must fit max_response_bytes; if even the prefix-only page does not fit, no page is released. A complete page may have zero observations after genuinely consuming a nonempty source consisting entirely of validated nonmatching frames. Completion with zero forward progress is permitted only for an originally proved empty-source inventory with null coverage bounds and null last frame. A limit is not corruption or deletion permission.

Any malformed/unsupported matching payload, failed original value/body proof, lost fence, changed authority or I/O failure discards the entire candidate prefix and candidate cursor. Reason is unsupported_payload, original_value_proof_unavailable, source_unavailable, reader_unavailable or permission_denied according to the failed original boundary. A previously released page is unaffected. An unavailable command terminal member does not invalidate an otherwise proved creation-event observation.

### Whole cursor and issuance

PrivateGoalCreatedCursorV1 has exactly the twelve fields defined by `Plans/goal_created_reader_contracts.schema.json`: format_tag, reader_binding, contract_version, storage_instance_id, project_id, budget, installed_reader_map_sha256, route_contract_sha256, sp278_read_token, captured_source_last_frame, last_scanned_frame, last_scanned_source_value_sha256. The schema embeds the complete ten-field SP278 read_token, including its complete thirteen-field source_selection, and the entire six-field-or-null coverage last_frame schema without modification. The internal before-first-frame position has null last frame/hash and is not an issued successor. IssuedPrivateGoalCreatedCursorV1 requires genuine nonnull captured/progress frames and value hash. All Storage IDs and budget values agree with the original request/session; last consumed progress lies within the actual captured complete source order. Hashes do not establish those facts.

Opaque public handle is exactly `goal-created-page.v1:` plus 64 lowercase hex characters from 32 fresh original-owner random bytes (85 ASCII bytes total). It does not encode cursor data. The original existing ephemeral read session owns the issued membership, private canonical bytes, original owner/snapshot/fence/installation handles and scope. Caller JSON, equal hashes, a reconstructed token or a copied session cannot mint custody. Possession grants no permission. No durable table, backup/restore or TTL exists for handles.

Resume authenticates original issued membership, exact bound budget/scope/installed resources, original snapshot/fence and current audit authority. Revalidate the complete last frame inclusively and its exact value hash, then resume after that frame in source order; do not assume sequence+1. Current-only policy refuses every changed CURRENT/manifest, generation/anchor/frontier/dataset/snapshot or installed route/authority as stale_cursor. Session/process loss is cursor_unavailable. An equal-valued replacement snapshot is not continuity. A new null-cursor request can repeat observations and grants no deduplication checkpoint.

Original release is one atomic session operation that binds exactly the returned page and successor's private canonical bytes/issued membership under the original read fence after all decoders/resolvers/copies/codecs and final independently derived typed expectations. There is no helper after the final pure predicate. If actual session/transport ownership cannot provide this atomic logical release, the role is unavailable; native transport and transaction implementation remain unproved. Candidate membership is never exposed as issued before the exact page. Old valid cursors are not consumed by an unsuccessful attempt; successful resumptions do not acquire a new lifetime rule.

### Exact route and member independence

The route artifact dispatches solely on original envelope schema/version/scope/event/payload ID. It has exactly active-v3 and whole-v2 resources/decoders. The original whole-v2 file is separately byte exact; v3's embedded whole-v2 object is equal as a schema object. V2 root validation retains original local `$id`/refs and complete original outer/inner joins. No inner-payload extraction, shape trial, alias or active-root fallback is permitted.

Both matching routes need original current SP278 source and actual retained shared v2 full-value/first receipt witness for the exact complete event. V3 additionally uses original independent body receipt audit; it never reads objective text. V2 never synthesizes a v3 receipt. The private proof must compare all eleven first-receipt fields, original opaque segment ref and whole complete-event commitment to actual original custody; relocation preserves original receipt coordinates. A missing v2 witness is original_value_proof_unavailable; current raw bytes cannot mint one.

The separate member role derives K from exact explicit Project/thread/command identity under SP-294 and accepts only K#/owner_result or K#/creation_receipt. Original wrapper validation and origin/audit authority precede virtual mapping to /record/owner_result or /record/owner_result/creation_receipt. Owner result resolves genuine terminal/success, terminal_unknown or terminal_no_effect. Creation receipt resolves only succeeded terminal with its nonnull original receipt. Pending is member_pending; unknown/no-effect creation receipt is member_unavailable. No reverse event lookup or command-key inference exists. The independent original retained command reader supplies its body/shared proof without reacquiring disposed source inputs or requiring a current body/event. Missing original authority stays unavailable.

### Original implementation participation and evidence limits

The actual install-source owner, independently authenticated running-image owner, StorageMigrationCoordinator and Project/audit/deletion/hold/reference owners supply their own current permissions, exact installation and held leases. The original `reader.storage.event_record_index@1.0.0` and source/maintenance owners supply whole source/index acquisition and verified frames. `storage.first_append_receipt.resolve_full_value.v1`, `reader.goal.body_mutation_receipt@1.0.0` and `storage.goal_start_command.read_retained.v1@1.0.0` retain their own independent complete-value and audit predicates. The actual ephemeral session owner alone issues membership and atomically releases its page/cursor. A copied owner map, snapshot/token-shaped object, receipt-shaped value, generic source builder or support bit supplies none of these admissions.

Each independently callable reader and original release method checks its complete applicable current owner, resource, scope, snapshot and candidate facts after returning helpers at its final disclosure boundary. Member resolution independently covers its resource/role/reader ownership, original request/key/member, retained physical/result/body/shared custody and current audit; it does not acquire generic current-source/index authority. A changed resource or reader binding refuses even when the returned member bytes still match.

Native selected-image discovery, mixed-version original source admission, complete cross-Goal lookup, snapshot/transport atomicity, restart, concurrent ownership, physical restore/deletion and numerical budget boundary behavior require their actual implementations and evidence. The validation report distinguishes finite ordinary active-v3 model observations from those unproved paths and from whole-v2 format preservation. No support bit or old test result may promote an unavailable route.

### SP-298 - Passive Goal Creation Read And Original Member Boundaries

```yaml
plan_unit_id: SP-298
unit_type: owner_boundary
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The Goal-created passive reader and original-member contract binds exact closed formats,
  bounded deterministic whole-source traversal, complete original event/body proofs and original ephemeral
  page/cursor release; command members resolve independently through retained owner custody and current
  audit.
gui_related: false
gui_classification_reason: Defines internal passive read formats and owner publication boundaries without
  visual presentation.
depends_on:
- SP-278
- SP-286
- SP-294
- RSC-018
unblocks: []
acceptance_criteria:
- Exact closed request budgets and canonical primitive MessagePack preserve the entire original token,
  source selection and complete-frame progress without normalization, truncation, defaulting or skipped
  matching frames.
- Whole generic source/index and inclusive resume proof is admitted before its required work; limits preserve
  deterministic prefix and distinguish unavailable proof from valid partial progress.
- Active-v3 observations join the exact complete original EventRecord, all eleven original first-receipt
  fields and independent original body receipt without disclosing objective text or command authority.
- Whole-v2 interpretation uses its exact original resource and independently retained full-value custody;
  absent old custody is unavailable and cannot be minted from current bytes.
- Original same-session issued membership, exact budget and immutable snapshot/token/resource continuity
  govern resume and one atomic page/successor release after final currentness checks.
- Only the two exact virtual command members resolve through genuine original retained wrapper/result
  custody; pending and non-success creation-receipt branches remain honestly unavailable.
- Member final disclosure independently rechecks exact resource/role/reader ownership, supplied request/member
  and complete original audit/value custody without requiring a current generic source.
- This passive facet creates no durable family, TTL, projector, Goal action or readiness; native unsupported
  roles and finite-model evidence limits remain explicit.
validation_surfaces:
- Plans/goal_created_reader_contracts.schema.json
- Plans/goal_created_reader_contracts/resource-bindings.json
- reports/event-authority-20260911/step-08-goal-reader-validation.md
- reports/event-authority-20260911/step-08-goal-reader-checks.json
risk_class: stale_reader_authority_or_fabricated_original_value
reasoning_tier: high
context_scope: goal_created_passive_original_reader
implementation_surfaces:
- Plans/storage-plan.md
- Plans/goal_created_reader_contracts.schema.json
- Plans/goal_created_reader_contracts/resource-bindings.json
node_compile_hint:
  mode: passive_reader_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/storage-plan.md#SP-278
- Plans/storage-plan.md#SP-286
- Plans/storage-plan.md#SP-294
- Plans/Goal_Runtime_System.md#GRS-066
negative_constraints:
- Do not grant Goal mutation, source issuance, event append, checkpoint publication or action authority
  from this passive facet.
- Do not infer native installation, complete event depth, runtime readiness or governance closure from
  resource bytes or bounded offline observations.
owner_hints:
- Plans/storage-plan.md
- Plans/Goal_Runtime_System.md
- Plans/Release_Supply_Chain.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-298, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/storage-plan.md#SP-294, ContractName:Plans/Release_Supply_Chain.md#RSC-018, ContractName:Plans/goal_created_reader_contracts.schema.json

<a id="goal-update-original-command-custody-and-publication"></a>
