# Shard 077: Original Goal update source, physical custody and publication

Source: `Plans/storage-plan.md`

Source lines: L24368-L26444

Source SHA256: `061a32972fd4db5fd4c5be3ce7f13a9710c541e01000930067786e4a36d29ee8`

---

## Original Goal update source, physical custody and publication

SP-299 adopts the existing `cmd.chat.goal.update` through GRS-068, SIR-049 and CV-342. The sole body writer remains SP-287's `owner.goal.body.mutation@1.0.0`; this contract adds its exact original update participants, never a second body engine. Source capture, physical/body reservation and commit, event publication and original SIR terminal settlement are distinct acyclic boundaries. `Plans/goal_update_command_custody.schema.json` supplies exact closed definitions; `Plans/goal_update_schema_resources.json` supplies every selected local retrieval URI and complete byte commitment with no network fallback. Registration or a matching schema cannot issue original source/installation authority.

The following new update-only internal selectors are contract allocations under DL-045. Each requires actual original owner/root enrollment and its complete final boundary before implementation availability: `storage.goal_update.capture_original_source.v1` (U0), `storage.goal_update.advance_original_progress.v1` (U1–U3/U5 at the original participating owner), `storage.goal_update.publish_original_terminal.v1` (U4), `storage.goal_update.backup_capture.v1` and `storage.goal_update.backup_restore.v1` (complete coherent backup). The two semantic readers are `reader.goal.update_command_audit@1.0.0` and `reader.goal.update_input@1.0.0`. Neither Goal-start selectors nor a generic constructor/profile flag grants these roles.

| Physical family | Exact wrapper | Scoped key after the common family prefix | Retention |
|---|---|---|---|
| `goal_update_source_audit` | `Plans/goal_update_command_custody.schema.json#/$defs/StorageSourceAudit` | `goal_update_source_audit:<hex_utf8(storage_instance_id)>:<hex_utf8(project_id)>:<hex_utf8(thread_id)>:<hex_utf8(goal_id)>:<hex_utf8(operation_id)>` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `goal_update_input_content` | `Plans/goal_update_command_custody.schema.json#/$defs/StorageInputContent` | `goal_update_input_content:<hex_utf8(storage_instance_id)>:<hex_utf8(project_id)>:<hex_utf8(thread_id)>:<hex_utf8(goal_id)>:<hex_utf8(operation_id)>` | `RP-GOAL-THREAD-LIFETIME@1.0.0` |
| `goal_update_progress` | `Plans/goal_update_command_custody.schema.json#/$defs/StorageProgress` | `goal_update_progress:<hex_utf8(storage_instance_id)>:<hex_utf8(project_id)>:<hex_utf8(thread_id)>:<hex_utf8(goal_id)>:<hex_utf8(operation_id)>:head OR :epoch:<canonical_nonnegative_decimal>` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `goal_update_terminal_audit` | `Plans/goal_update_command_custody.schema.json#/$defs/StorageTerminal` | `goal_update_terminal_audit:<hex_utf8(storage_instance_id)>:<hex_utf8(project_id)>:<hex_utf8(thread_id)>:<hex_utf8(goal_id)>:<hex_utf8(operation_id)>` | `RP-AUTHORITY-INDEFINITE@1.0.0` |

### Closed source, content and progress carriers

Four new redb families, each canonical, non-rebuildable and mandatory-backup, are declared in the SP-299 physical-family table. All use exact closed outer `{schema_id,schema_version,record}` wrappers, version 1.0.0 and the local `pm.goal.update_command_json.v1` qualification of registry `json_canonical`: canonical UTF-8 JSON, no BOM, duplicate/unknown properties, surrogates, unsupported versions or noncanonical alternate integer spelling. Preserve strings byte-exact after canonical decoding; integers are arbitrary precision, no binary64 narrowing. Ordinary record commitment is SHA-256 of complete outer canonical bytes. CV-333 owner-result SHA-256 remains its separately specified RFC 8785 domain; it is not a wrapper digest.

The update-local `pm.goal.update_command_json.v1` explicitly adopts **the unchanged exact `pm.goal.canonical_json.v1` encoder in GRS-064** (frozen Goal_Runtime_System.md:5869–5871), with no alternate byte recipe. ASCII property names sort ascending, compact comma/colon separators have no whitespace, arrays preserve order, and the output is UTF-8 with no BOM or terminal LF. Quote/backslash are escaped; U+0008/000C/000A/000D/0009 use the JSON short escapes; remaining U+0000–001F use lowercase four-hex-digit escapes; all other Unicode scalars remain literal UTF-8. Strings are never normalized, trimmed or case-folded. Booleans/null use lowercase JSON literals. Integers use mathematically exact canonical decimal with no leading zero, plus, fraction, exponent, negative zero, binary64 rounding or new fixed-width ceiling. Reject duplicate/extra keys, malformed UTF-8, surrogates, non-integer numbers and any decode/re-encode byte difference. SourceAudit.accepted_text_sha256 is lowercase SHA-256 of **the exact accepted objective's scalar UTF-8 bytes alone**, including its actual whitespace and control scalars: no JSON string quotes/escaping, BOM, appended LF, prefix, domain marker, normalization or additional text copy. Empty text hashes the empty byte string. Only this commitment belongs in content-free audit; original text stays in the admitted InputContent/SP-287 owners.

SP-287 currentness/revision/pending hashes keep their original semantic domains and inputs. A complete outer physical hash never replaces an inner semantic hash. CV-333 typed-result RFC 8785 remains independently owned and is not this arbitrary-precision local encoder. Reject a known unsupported exact CV-333 result route before coupled work wherever the limitation is knowable. If the limitation is discovered only after an actual original body/event effect, preserve exact original progress, receipts and effect custody and keep terminal issuance unavailable until a genuine exact CV-333 result route exists. A recovery_required result with body_effect=committed requires the same original BodyCommit numeric facts and cannot bypass that limitation. Never manufacture an unrepresentable recovery_required Terminal, round, clamp, add a revision cap, omit committed facts, claim arbitrary-precision RFC 8785 support or relabel a physical digest as the typed-result hash. This original recovery/effect custody is distinct from an issued Terminal/GoalUpdateResultV2.


Keys use an explicitly specified ASCII function: `k(s)` is lowercase hexadecimal of exact UTF-8 encoding of a nonempty ID, with no normalization. Key is `<family>:<k(storage_instance_id)>:<k(project_id)>:<k(thread_id)>:<k(goal_id)>:<k(operation_id)>`. No unescaped ID interpolation, aliases, prefix-only authorization or reassignment of thread binding. Every key component equals original inner scope. The source row's operation ID is its normalized identity operation ID; other rows carry that exact operation. This key codec is new update-only physical addressing, not a change to any SP-287 key or semantic digest.

* `goal_update_source_audit`: SourceAudit, immutable content-free capture of authentic original normalized identity and nonterminal outcome, actual dispatch ID/frame/target generation, actor/permission/return route, expected body/head, actual accepted-change refs, original origin refs, text commitment and original capture authority/time. SIR first authenticates its source object and Goal independently authenticates direct Save or resolved approval. Both participate in a native admitted source capture; JSON flags, hashes or merely selecting installed roles cannot produce it. Input/capture scope and all normalized identity joins must agree. Accepted source references are redacted IDs, not previews or copied context bodies.
* `goal_update_input_content`: InputContent, complete genuine original request including replacement text, bound to original source outer commitment. This is thread-lifetime content under DL-047, never indefinite audit. No invented normalized request or reconstruction from a digest is permitted. Admission retains it before a body reservation can occur. Its source_surface preserves routing lineage only and cannot enable a route.
* `goal_update_progress`: Progress, content-free original effect progression. It retains immutable original producer metadata and exact semantic pending-intent / complete reserved-control outer commitment, original body receipt selector/hash, later exact producer input, first publication and original resolution authority. Epoch CAS prevents replacing or regressing an admitted state. It contains no after_record, objective text or copied pending body; SP-287 control remains the existing content-bearing pending authority. Source and first progress/input install atomically under absent operation-key CAS.
* `goal_update_terminal_audit`: Terminal, immutable content-free typed result + actual SIR outcome + exact original CV-333 response, with terminal_progress_selector identifying its exact original immutable progress epoch/key. It names source/progress commitments and original result ref/hash. Result, outcome, response and this row are published in one native original terminal transaction, or under an equivalent existing SIR atomic terminal boundary with exact admitted joined member custody. A successful individual write or a later repair is not completion. No success-shaped response leaves before this terminal admission.

The three audit carriers use existing RP-AUTHORITY-INDEFINITE. No text, complete request, request preview, context body, pending afterimage or text-bearing error is permitted there. References do not retain referenced content. The input carrier uses RP-GOAL-THREAD-LIFETIME with the exact bound thread; archive retains, compaction does not evict, deletion hides immediately and applies existing 24h active / 30d backup physical bounds unless held. Hold does not restore visibility. Preterminal input purging follows those same rules, not a new indefinite recovery exception. Losing source content before a required mutation fences mutation; it is never reconstructed.

### Acyclic operation and original effect resolution

1. **Source admission.** Authenticate original existing SIR request and acceptance objects, full normalized topology/operation identity, source text, current Goal/head and source-owner posture. Capture the complete original producer metadata with its original event ID, occurrence time, causality, actor/account refs and replay identity. Occurrence time is the original producer's actual accepted-input occurrence, not a guessed body commit, persistence or acknowledgement time. Actual observed/persisted times and storage sequence remain Storage assignments only. Capture cannot synthesize missing source facts from present defaults. Atomically install original source/input/progress with phase source_admitted; no body effect yet. Before any body attempt, authenticate independent post-body producer preparedness against this original source audit and installed event/result paths. This resolution means **prepared to produce after a commit**, never 'event already appended'. It contains no future receipt.
2. **Reserve existing SP-287 pending.** Construct the exact existing `objective_update` pending intent, including original full after_record, accepted_revision and original origin, prior accepted head across metadata gaps, original_change_authority_ref and external_authority_ref resolving to the independent prepared original producer above. Expected ordinary revision/currentness, owner/Stop epoch, operation and entire text are captured, never refreshed during retry. Use actual complete body/control CAS and atomically advance progress to body_reserved with the complete reserved control outer commitment. The body owner remains sole writer; adding the joined progress write does not replace its transaction rules. Reservation increments the existing control epoch and leaves current text/history untouched.
3. **Commit body.** Independently resolve original accepted source and producer preparedness; recheck actual approval if agent-proposed, current body/history/origin, owner/Stop/cancellation/access/deletion/installation/origin facts at the joint SP-287 final boundary. Compare the complete actual nonnull reserved control plus epoch, not merely operation ID or the old empty control. Commit body ordinary revision n+1, exactly one new accepted revision/origin at n+1, cleared pending control and narrow original body receipt atomically with body_committed progress. Preserve original immutable identity/created_at; updated_at is nondecreasing. Prior accepted hash is the latest objective revision hash, not n's metadata-only revision. This original body receipt proves only this body transaction. It contains no event/command success assertion.
4. **Freeze original event input.** Only after independent original body receipt admission, form the exact content-free active-v3 payload and freeze ProducerInput by CAS from body_committed to event_ready. Every payload field joins original source, committed body receipt and actual accepted revision, including before/after revision/hash, predecessor, approval/source facts and event/source scope. Never read the then-current Goal to reinterpret an older accepted operation. Later body revisions, deletion or Stop do not erase a genuine earlier body commit; current audit admission still applies to finishing its factual event. No copied receipt or equal bytes can replace original provenance.
5. **Publish once.** Call the genuine existing event producer/Storage append using that exact frozen ProducerInput and existing outer EventRecord pm.event.v0 / 2.0.0. Retain the genuine first AppendReceipt, original append result and independently captured full original EventRecord value commitment. Outer project/thread/actor/account/causality/identity agree with the input. Storage-assigned fields agree with actual original assignments. First receipt never becomes a reconstructed retry receipt; exact retained full value is authenticated independently of a supplied digest. A lost acknowledgement yields event_unknown. Resolve through original retained event/append authority, never absence, age, matching current event fields or fresh event IDs. Only genuinely issued original publication advances to event_issued.
6. **Terminal.** Join exact actual typed update result, canonical owner-result ref/schema/hash, original outcome and central response. Stage by the original SIR owner; freeze a single terminal transaction after rechecking original source/progress/member custody and current audit/installation authority. Source terminal staging has no body/event reissue path. Success requires independently authentic original body AND original event/full-value evidence. No-effect requires independently proved zero accepted body mutation and zero event publication, plus proved release/terminalization of any reservation. Other unresolved/partial cases preserve evidence and use recovery_required / terminal_unknown only when the exact original typed result is representable and admitted by its actual owner. Otherwise retain original progress/effect custody with terminal issuance unavailable as specified above; never failure-as-rollback or synthetic success.

Permitted progress edges are source_admitted→body_reserved→body_committed→event_ready→event_issued; body_reserved→body_unknown; event_ready→event_unknown; unknown stages resolve only from the original corresponding effect owner to their genuine committed/issued stage or to a proved no-effect stage where zero body/event effect remains true. Any pre-body reservation may reach no_effect only after genuine owner resolution confirms no body commit and releases its exact pending slot. Source_admitted may reach no_effect without reserve with authentic pre-effect refusal proof. There is no edge from committed/issued to no_effect or backward to a new reservation. Body/producer synchronization failures preserve current accepted values and unresolved original custody. Timeout, missing row, unknown crash point or lost approval is not no-effect evidence.

The producer/body authority must be joined at the actual source/reserve/commit boundary. Separate successful callbacks without a held joint lease are insufficient. A callback revoking approval/Stop/installation before body commit fences it. A later refusal cannot roll back an admitted revision. Event/result audit completion after body commit does not authorize further body writes or continuation. Current continuation independently evaluates current body/state/Stop at its own dispatch boundary; command completion is not a new continuation permission gate.

### Immutable unknown, retries and command/result joins

Duplicate original request/operation identity resolves original source custody. Different bytes or different normalized source under that identity reject; it cannot repair capture. Before terminal, recovery may inspect/resume only the same original effect chain under actual owner authority. It never re-accepts text, replaces identity/time/epoch, reruns old approval to claim a new acceptance or creates a second revision/event. Once terminal audit exists, replay returns the exact original result/outcome/response with central replay decoration only; no body, event, result or original terminal write is allowed.

If SIR terminalizes unknown before effects are resolved, its original typed result/outcome/response remain immutable. Separate genuine owner recovery may subsequently resolve the original pending effect progression and release the existing body slot where actually proved safe; it does not convert that original command outcome to success or dispatch the command again. Terminal's terminal_progress_selector stores the exact original storage_instance_id/project_id/thread_id/goal_id/operation_id/progress_epoch and snapshot_key. `snapshot_key` must equal the prescribed `goal_update_progress:<hex_utf8(instance)>:<hex_utf8(project)>:<hex_utf8(thread)>:<hex_utf8(goal)>:<hex_utf8(operation)>:epoch:<canonical_nonnegative_decimal_epoch>`; no hash-only search or current-head fallback resolves an old terminal. Selector scope and operation equal Terminal, SourceAudit.normalized_identity.operation_id, original request/dispatch identity and snapshot scope. Snapshot inner progress_epoch equals the key epoch. The epoch key admits only a StorageProgress wrapper whose record is Progress, never ProgressHead. Conversely the same scoped `:head` key admits only ProgressHead, never Progress; its inner scope/operation must agree with source and selected snapshot, its epoch equals that snapshot's epoch, and snapshot_sha256 is SHA-256 of the snapshot's complete exact outer canonical bytes. At terminal staging the actual original head must resolve precisely the terminal-selected epoch, and terminal_progress_sha256 must equal that same complete original snapshot commitment. SourceAudit's original complete outer commitment equals snapshot.source_audit_sha256 and Terminal.source_audit_sha256. All original key/owner/installation/origin admissions are independent predicates beyond matching hashes. Later original-owner recovery may advance the head but never the old terminal selector/hash or immutable selected snapshot; missing old snapshot custody makes retained replay unavailable. Required immutable historical snapshots remain admitted audit custody when progress advances. the SP-299 physical-family table explicitly keys immutable progress snapshots by epoch, with a CAS head row; the source/input/body control are not silently recreated. A new user-authorized edit is a new command identity and faces current body/Stop/approval checks.

NoEffectResult's goal_id is the original requested existing Goal, never null merely because an update failed. It reports no accepted body/event effect; a transient reservation is disclosed through original no-effect resolution evidence, not called a successful edit. Pre-dispatch invalid/unregistered refusal remains CV-333's existing pre-dispatch branch and is outside these admitted owner-operation carriers. Failed/cancelled/rejected after owner admission map exactly to CV-333; rejected response has null result_status. Empty or unchanged replacement is still an accepted full revision under existing 'every body mutation advances' rules, not an invented no_op optimization.

Terminal success uses `GoalUpdateResultV2`, schema identity pm.goal.update.result.v2, and only the existing central definition path. All source/request/outcome/result/response scope, command, command instance, operation, payload hash, target generation, dispatch frame, idempotency and original dispatch joins must agree. Result hash is RFC 8785 of the authentic separately owned result, not a caller copy. Success body receipt reference may appear as the existing result_receipt_ref only for its narrow actual body facts; it does not stand in for the separately required event or typed result. Event refs contain exactly the original event. Failed/no-effect contains no event. Unknown's event refs describe only actually issued evidence; 'unknown' never supplies a guessed event ref. Error status/code joins follow actual outcome; cancelled requires cancelled code. Central response errors remain the central closed error shape, mapped by actual SIR rather than copying an arbitrary Goal error. Original dispatch/ack timestamps and return route are SIR facts, never body commit time. Replay obeys existing CV-333 decoration while retaining original members exactly.

### Event version, readers and backup

`Plans/event_payloads/goal_runtime/goal_updated.schema.json` selects active v3 and embeds the **whole** old v2 resource under legacy_v2_reader with its own original ID and all old definitions/conditions. No v2 child/scope/budget/old-lifecycle/envelope tuple is fabricated for current text acceptance. Registry change is limited to existing goal.updated family revision 3.0.0 / v3 payload ID; EventRecord version/codec and all other events remain unchanged. Old D-R14, table minima/common-v2 references/oracle and old command request spelling retain whole-v2 interpretation and are superseded for active update by GRS-068/CV-342. Production-intent wiring must name actual update event and closed request/result under this contract. No alias or general metadata-update event is created.

Retained command/source/progress audit reader is a **new update-only** binding `reader.goal.update_command_audit@1.0.0`, selected by exact original store/project/thread/Goal/operation and optional immutable epoch. It resolves admitted original wrappers/members under one final current app/Project/audit/installed-origin boundary, without ordinary body visibility or current Goal availability. It returns only content-free audit. Input read is a separate new `reader.goal.update_input@1.0.0` requiring current thread content/access/deletion authority; it never escapes through retained audit. Body/history reads remain the existing three SP-287 readers. The update-only composition below precisely adopts their current Activity/control/history use and the selected active-v3 event/audit/input/replay consumers with complete original source and final disclosure predicates. Goal-start readers grant no authority here. No additional event-derived Goal state or family checkpoint is assigned to these actual effects; native installation/execution and an end-to-end event-depth claim remain separate.

Backup must atomically capture every original source, retained progress epoch/head, terminal member, complete still-retained input and relevant original SP-287 body/control/revision/origin/receipt scope. Terminal progress snapshots and original result/outcome/response refs are mandatory members, not rebuildable references. Include complete original EventRecord/first append/full-value custody through actual existing event backup owner; no detached digest certifies that dependency. Restore authenticates original selected store/coordinator/backup provenance and every join, fences missing required custody, replays current tombstones before content publication, and preserves any newer admitted terminal/progress without overwriting it with stale pending. Audit-only image requires genuine lawful content disposal proof. Same-owner restore evidence will not prove arbitrary fresh-root migration/install/withdrawal. No start backup selector can admit these four new families.


### Original owner participation and installation

U0 inserts original source/input/progress epoch zero and head atomically before any pending body reservation. U1 uses the actual body owner's original reservation publication (`ModelStore._issue` in the reviewed offline original) to commit only wrapped control plus the new progress snapshot/head, then publish the matching semantic view. U2 uses its actual original body/receipt publication (`ModelStore._commit_unit`) to commit semantic body/history/origin/receipt, exact SP-287 physical rows and body_committed progress together. Private afterimage preparation must not expose semantic changes before the physical/progress result. Physical synchronization after a visible body commit cannot supply missing participation. U5 uses the original reservation/release boundary to clear pending and commit proved no_effect progress together; an existing committed body cannot enter that branch. U3 uses the original shared Store/Joint/Seglog and first-receipt owner after genuine body custody, without pretending that append shares the body database transaction. SIR-049 owns U4's original unpublished result/outcome/response preparation and atomic terminal member release.

Every independently callable original effect method checks its complete applicable source/root/operation, actual beforeimages and independently derived candidate after all helpers at its final held publication boundary. Unpublished staging, current owner/Stop/access/deletion/approval/origin checks, complete physical control/head CAS, absent immutable revision/receipt/epoch keys and exact original transaction/readback remain mandatory. Model method names document reviewed original placement; they do not establish native implementation.

The actual StorageMigrationCoordinator must enroll the four exact families, source/progress/body/shared/terminal roles, selected schema graph and coherent mandatory backup/restore ownership before a writer becomes available. Original installed source selection and all complete historical obligations must be proved; an after-birth matching registry map cannot repair original enrollment. A pre-existing backup path that cannot enumerate all original update custody must refuse at entry and final release/restore publication, including old image tokens captured before update enrollment. Refusal preserves original effects. No production migration edge, fresh-root restore, installed package withdrawal or native backup support is inferred from these schemas.

### Active updated-v3 consumers and exact original read composition

SP-299 explicitly adopts this update-only composition in `Plans/goal_updated_consumer_contracts.schema.json` and its exact `Plans/goal_updated_consumer_resources.json` graph. It does not import SP-298's Goal-created profile, cursor, request, uint64 output codec, command-member mapping or passive exemption. The actual consumer/effect map is:

| Consumer | Actual selected source and semantic owner | Release/effect/checkpoint |
|---|---|---|
| Current Goal Activity item, hover preview, objective detail/editor | Existing `reader.goal.body@1.0.0`; exact SP-287 body/control and accepted-head/origin in the explicitly selected store/Project/thread/Goal; GRS-064/GRS-055 | Current visible body only; transient view replacement; no family checkpoint |
| Activity objective History and current hidden control/pending/cancellation posture | Existing `reader.goal.objective_history@1.0.0` and the body reader's privately joined actual control; GRS-064/SP-287 | Accepted revision/origin chain; old committed body while pending; no raw pending afterimage disclosure, event-derived state or checkpoint |
| Explicit active updated-v3 event inspection | NEW `storage.goal_updated.inspect_current.v1@1.0.0` with `EventReadRequest`/`EventObservation`; original SP-278 selected source plus actual SP-299 source/frozen progress, SP-287 receipt and SP-286 whole-value/first receipt | One content-free selected-event observation, no page/cursor, no checkpoint or event/body/command write |
| Original update source/progress/terminal audit | Existing `reader.goal.update_command_audit@1.0.0`, now precisely selected by `AuditReadRequest`; SP-299 original admitted wrappers | Content-free exact source and selected original progress/terminal members, no event-source traversal/checkpoint or replay effect |
| Original complete update input | Existing `reader.goal.update_input@1.0.0`, now precisely selected by `InputReadRequest`; SP-299 actual source/input under current bound-thread content authority | Exact retained input only, transient content disclosure; no audit-lifetime copy, reconstruction or checkpoint |
| Narrow original accepted-body transaction receipt | Existing `reader.goal.body_mutation_receipt@1.0.0`; its unchanged SP-287 exact request/key/original receipt | Body-commit audit only, independent of ordinary body visibility; no event/command success or checkpoint |
| Original command response replay | Actual SIR-049 original normalized identity and immutable Terminal's exact selected progress epoch/result/outcome/response | Original response with only CV-333 replay decoration; no re-dispatch, revision, event, terminal change or checkpoint |

These views use already durable canonical body, accepted history, control and update custody. They require no additional updated-v3 event-built `goal_state.v1`, child, lineage, certification or evidence projector. `goal_projection_families` remains deferred; SP-214's older projection inventory cannot fill this active-v3 ownership map. The `none_required` disposition here follows each actual listed effect, not another family's passive status. A future durable projection or another Goal/GoalRun event still requires its own exact source/write/checkpoint adoption.

#### Current body, History, control and Activity

The existing SP-287 current readers authenticate the exact selected native instance and registered five-family/schema/codec/migration/backup origin. Join full outer body/control bytes, body semantic currentness, the actual control epoch/pending/cancellation posture and complete retained accepted revision/origin chain in one coherent physical snapshot. The selected Project/thread/Goal is an explicit authorized navigation/owner input; no latest event, focused sibling thread, event payload or key-prefix guess supplies identity. There is no new public control reader: current body/history readers and actual action owners keep their original private control custody and disclose only their existing permitted current/pending/action disposition. The control's pending text never becomes current objective or history.

An update's body transaction may already have committed while event publication or SIR settlement remains pending/unknown. A current view reads that actual accepted body. It neither waits for an event to invent acceptance nor hides a committed revision merely because a later event/result is unresolved. Later ordinary body revision/state, accepted-head changes, cancellation or Stop are current facts even if the selected update event describes an older accepted operation. History uses original admitted retained accepted revision/origin rows without reacquiring old user input, approval handles, original command/source generations or an old event. A surviving audit does not reconstruct absent text.

For Activity/view publication, capture independent original typed reader outputs and complete selected semantic/physical expectations before navigation/formatting/copy/encoding helpers. Keep the actual current Activity/navigation target identity and generation, Project/thread visibility, current deletion/tombstone/hold, owner/Stop/cancellation, registration/schema/codec, installed source/root/migration/backup posture and selected body/control/history snapshot under one native joint lease. After the last helper, compare the entire candidate view, exact selected identity, source bytes/currentness/control epoch/history joins and every current owner fact with the independent originals, then perform the existing transient view replacement under that same exclusion. No helper, asynchronous gap or user callback may intervene after the final pure predicate. If the UI transport cannot preserve the joint final boundary, disclose unavailable and acquire a fresh read rather than publish a stale candidate. A compatible viewer can read only under its actual admitted posture; it grants no mutation. On an action, the already registered command's own owner independently rechecks current body/CAS/state/Stop/permissions/approval/handler installation at dispatch; displaying a control or observing updated-v3 never grants the action or enables an otherwise unavailable lifecycle handler.

#### Selected current updated-v3 event inspection

`EventReadRequest` selects one exact actual Storage instance, Project/thread/Goal, event_id, sequence_id and the complete `event_record_index.v2` key supplied by the original Storage index owner. This is an explicit selected-event operation, not a new list/page/search API. Goal code cannot derive a key from focus or substitute the latest update. The original `reader.storage.event_record_index@1.0.0` acquires and authenticates the whole current SP-278 authority: uniquely current root/node/checkpoint, immutable generation anchor, independently current complete frontier/coverage, dataset/snapshot, CURRENT/manifest bytes and selected physical generation/recovery epoch, survivor/inventory/watermark/exclusion/retirement facts, complete source/frame/index/envelope/schema and selected row/value joins. Import the complete ten-field `read_token`, including its exact thirteen-field `source_selection`, from `Plans/event_record_index_checkpoint.schema.json#/$defs/read_token`; no private shortened token or Goal generation substitutes. The immutable generation birth anchor is distinct from a later advancing frontier. Authentic empty/missing or unsupported source yields typed event/source unavailable, never an empty success, no-effect proof, source repair or new birth.

In the same actual canonical redb snapshot, the shared owner resolves table `checkpoints`, exact key `event_record_index_checkpoint.v1:{storage_instance_id}`, its `current_generation_id`, exact `#/generations/{generation_id}` node and same-database dataset `event_record_index.v2@{generation_id}`. Validate the selected row as the original `pm.storage_value.event_record_index.v2@2.0.0` family value with the complete Storage-issued key `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}` and owner-decoded reversible Project partition; no flat-table, foreign database or naked reference fallback is admitted. Its publication_locator.checkpoint_ref resolves that exact admitted node; locator manifest/recovery/survivor facts bind the immutable generation birth anchor, while the current frontier separately covers all matching and nonmatching global source positions. Resolve the exact four-field `(segment_generation, segment_name, byte_offset, sequence_id)` frame cursor, full frame bounds/CRC/durable watermark and original existing payload/producer/value digests. A compaction relocation uses genuine exact source/target translation and retained coverage authority, never a patched offset or newly stamped original receipt.

Only original EventRecord pm.event.v0/2.0.0, Project scope, event_type=goal.updated and payload_schema_id=pm.goal_runtime_event.goal_updated.schema.v3 enters this new route. Validate the complete original envelope and all eighteen exact active-v3 payload members, including explicit direct-user nulls and original scope. Whole-v2 retains its complete existing schema/meaning under CV-342, but this active-only inspection returns unsupported_payload for v2; it does not invent a v2 adoption, test shapes to choose a decoder, extract an inner payload or inherit Goal-created historical witnesses. Other events are outside this route.

For v3, payload.body_receipt_request provides the original operation and intent selector, with actual store/Project/Goal identity equal to the selected source; its thread is the original event/source thread. Use SP-299's exact hexadecimal key codec to resolve that operation's original SourceAudit and current authentic ProgressHead plus the exact immutable Progress snapshot named by its epoch and whole outer hash. Head and snapshot are separate exact wrappers/keys; a head is never decoded as Progress. Require the actual original source/operation/frozen producer metadata, admitted BodyCommit and ProducerInput. Permitted inspected snapshot phases are event_ready, event_unknown or event_issued, with the exact nonnull original producer input/body facts; a no_effect, body-only or missing input snapshot cannot prove this event. This use of the actual current operation head is only the selected event-observation route, never SIR terminal replay. Read-only inspection does not promote phase, repair an acknowledgement or select an old epoch merely because its bytes fit.

Independently resolve the original `reader.goal.body_mutation_receipt@1.0.0` using the payload's complete request. Validate actual original outer receipt bytes and the unchanged original receipt identity/hash in its admitted owner domain, operation/intent/scope, before/after revision/currentness, accepted revision/hash against SourceAudit, BodyCommit and every corresponding payload field. The accepted predecessor is SourceAudit.prior_revision_hash/the original accepted chain fact, not a guessed previous ordinary metadata revision. Compare the complete surviving event's producer-owned value to the independently admitted original ProducerInput, exact original producer metadata and original source/action/ref set; no current Goal read reinterprets the operation. SP-299 original accepted-source custody supplies original acceptance without rerunning disposed UI/approval inputs or holding content forever. The source/audit rows, origin, admitted original body receipt and frozen producer remain mandatory for this v3 route; equal caller bytes or a constructed source capsule do not replace them.

Resolve actual `storage.first_append_receipt.resolve_full_value.v1` under SP-286/CV-339 for this exact event/producer identity. It independently supplies the entire originally issued EventRecord, all eleven fields of the first AppendReceipt, actual original append result including opaque segment ref, and the original complete-event value commitment. Compare every original producer/storage assignment/full-value/receipt field to their actual authorities and the surviving current source event. Current relocated frame/index coordinates need only satisfy current SP-278 physical joins; they never rewrite the original append receipt or segment ref. The original receipt may predate the current generation anchor/frontier. If actual append succeeded before progress acknowledged it, the genuine shared original witness permits factual observation from event_ready/event_unknown without changing progress or requiring terminal success. A matching current event, digest, later retry receipt or historical raw bytes cannot mint a missing first witness. If Progress already holds publication, all its members must exactly equal the genuine first publication. No Terminal is required for event observation, and an immutable terminal_unknown cannot become succeeded through this read.

`PrivateEventReadWitness` is an exact serializable projection of these captured facts, including the whole SP-278 token, source/snapshot/receipt wrappers and full event/publication. It is not authority, a stored family or a public result. `PrivateEventReadWitness.current_index_value_sha256` is lowercase SHA-256 of the complete actual selected index row's canonical MessagePack value bytes, including every stored value field; it excludes the key and adds no BDIG wrapper, JSON reserialization, source-event substitution or omitted field. `PrivateEventReadWitness.installed_resource_graph_sha256` is lowercase SHA-256 of the exact complete installed `Plans/goal_updated_consumer_resources.json` file bytes, including any terminal LF, with no reserialization or field omission. Both commitments are compared against independently held actual row/installation sources at final release; neither authenticates or installs an owner by itself. The actual original source, retained-owner, first-receipt, installed-origin and audit/retention leases remain privately owned and cannot be deserialized or replaced by this projection. Every independent acquisition/checker/decoder/resolver/encoder method must enforce its own full applicable original admission; the composite release cannot be the only guard protecting independently callable helpers.

Before disclosure independently freeze the full public observation from genuine source and original custody. Run all nested source/receipt/audit resolvers, copies, codecs and returned-value helpers before the final pure predicate. Under one actual joint native boundary, revalidate complete SP-278 selected source/token/frontier and selected index/event bytes, the entire actual SourceAudit/head/selected snapshot/body receipt/original full-value/first-publication custody, exact installation/resource graph and current app/Project/audit/access/deletion/hold/backup/maintenance/reference-owner facts. Compare every returned candidate field and complete encoded bytes against the independently frozen original expectation. No helper or gap follows this predicate before the same-boundary logical response release. A later frontier/root/head/permission/retention or installation change invalidates this candidate even when the selected old event bytes are unchanged; a fresh independent call may obtain a new current proof. A compatible viewer supplies only its real read admission and no writer/repair permission. Failure releases no observation, token, cursor, checkpoint or new event. The public result contains no objective/input, account/provider metadata, hidden control or dereferenced source content; its payload is the exact existing content-free v3 payload.

#### Distinct audit, retained input and replay selectors

`AuditReadRequest` is the existing update audit binding with exact store/Project/thread/Goal/operation and one disjoint selection: current_progress, immutable_progress with the complete original ProgressSnapshotSelector, or terminal_members. Current-progress resolves the actual head to its exact immutable epoch and validates complete key/inner scope/epoch/outer-hash joins. Immutable-progress resolves only the explicitly selected retained key/epoch, with no head substitution and no claim that it is current. Terminal-members independently resolves original StorageTerminal and exactly its terminal_progress_selector/terminal_progress_sha256, never the later head. Returned original SourceAudit and selected immutable StorageProgress are mandatory; Terminal adds the complete original typed result/outcome/response and original member refs/hash. Authenticate actual original admission and immutable lineage of every selected epoch/member, not just checksums or the existence of a current owner role. Missing mandatory terminal/old epoch is terminal_pending or original_custody_unavailable as actually proved, never synthesized success/no-effect or a search for similar progress.

Audit exposes only original content-free wrappers under current app/Project/audit permissions, registered installed-source/migration/backup and deletion/hold/retention ownership. It does not require ordinary current Goal/body/thread visibility, an old SP-278 source frontier, surviving event traversal, disposed input or still-live original UI/approval handles. Original admitted retained publication/result custody must still be independently authenticated, including actual shared first-receipt/full-value dependencies when those members are claimed; a generic current-source scan is not a replacement for that retained authority. Later effect recovery may advance the head while an original terminal and its selected epoch remain unchanged. Audit read performs no effect recovery or SIR replay. SIR-049 alone returns the original response through the existing command replay route and its original normalized identity checks, not by fabricating a dispatch from the audit result.

`InputReadRequest` selects only the exact original operation. Resolve admitted original StorageInputContent and matching actual SourceAudit using the original SP-299 keys/outer commitment and exact original request content. Current actual bound-thread content permissions/tombstone/deletion/holds and source/root/installation/backup predicates apply, independently of audit permission. Missing or lawfully purged input is content_unavailable; no accepted_text_sha256, current body, revision history, event or Terminal can recreate it. This read does not rerun acceptance or approval and cannot initiate the command. Freeze each audit/input result from actual native selected values before helpers; after the last resolver/copy/codec compare complete original values/key/scope/epoch/semantic and physical commitments, returned candidate bytes and all applicable current owner facts at one held final disclosure boundary with no intervening helper or gap. Current head is guarded only on the current-progress selection; an immutable/terminal-selected read does not falsely require its historical epoch to remain the current head. Input visibility loss does not retroactively deny a separately admitted content-free audit, and audit availability never authorizes content disclosure.

#### Exact encodings, retention, backup and adoption

The new reader request/result/private-witness envelopes use the unchanged `pm.goal.canonical_json.v1` encoder qualified by SP-299, including exact arbitrary-precision nonnegative integers and scalar UTF-8 without normalization; this is an API representation, not a new stored family or result hash. Whole existing Goal body/currentness/revision/intent, SP-299 outer wrapper, SP-278 binding, SP-286 canonical MessagePack full-event and CV-333 RFC8785 typed-result domains remain unchanged and separately verified before embedding. No created-reader uint64 cap, decimal-string coercion, binary64 narrowing, numerical revision ceiling or relabelled digest is introduced. Any actual transport unable to preserve an admitted exact value returns numeric_representation_unavailable before release. Known writer result-route limitations and late effect-preservation in SP-299/SIR-049 remain entirely unchanged; a read cannot manufacture an unrepresentable terminal. The existing original source graph is preserved byte-for-byte; new graph entries pin the complete exact owner definitions/read_token and direct source recipes. Unsupported/missing runtime codec, source owner or installation refuses the individual dependent reader; a schema/support declaration is not installation.

The original current update event and content-free SourceAudit, Progress epochs/head, Terminal and body receipt keep their existing indefinite authority/audit policies. The complete InputContent and SP-287 body/history/origin/control keep RP-GOAL-THREAD-LIFETIME@1.0.0 under DL-047: archive retains, compaction has no eviction effect, thread deletion hides content immediately with unheld active copies purged within 24h and backups within 30d; valid holds delay physical purge but never restore visibility. No read starts/resets a clock, increments logical retention counts, creates a body hold, extends a reference target or grants purge. Retained content-free event/audit facts do not make deleted body/input available. Dependent source/full-event/receipt/backup custody remains governed and protected by its actual owner; a needed immutable epoch or original first-publication member cannot be silently retired because a transient read completed.

Backup/restore uses SP-287/SP-299's complete original mandatory participants, including the source/input if retained, every required immutable progress epoch/head, original Terminal selected epoch/result/outcome/response, body/control/accepted history/origin/receipt and actual shared event/full-value/first-receipt members. This proposal creates no new backed-up read table/cursor/cache. Reconstruct only transient views from independently admitted surviving original rows after genuine coordinator admission and current tombstone filtering. An old predelete backup cannot republish text; an older pending/head image cannot overwrite newer admitted body/progress/terminal custody. Missing required original dependencies remains recovery loss. All current source/row/admission and deletion/hold/backup owner fences span the final capture/restore/filter/purge or disclosure effect after helpers, through the existing original owners. Package migration/withdrawal and root changes invalidate in-flight readers; a successor must genuinely enroll each exact required role/schema graph and coherent backup support before use, without inventing a store version, migration edge, source issuer or new authority registry.

This is normative composition for the named active-v3 consumers. It is not proof of native code/installation, source ownership, concurrency, transport atomicity, restart/backup behavior, model execution, complete family/event depth, WorkNode readiness or governance closure. Old command variants, whole-v2 consumers and other Goal events retain their independently admitted contracts.

### SP-299 - Original Goal Update Physical And Transaction Custody
```yaml
plan_unit_id: SP-299
unit_type: owner_boundary
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The existing Goal objective update joins independently accepted original source, original
  shared body reservation/commit, immutable update progress, genuine shared event/first-receipt custody
  and original SIR terminal members through their exact participating owners; four physical families preserve
  distinct content and audit lifetimes. Named current Activity/body/history, selected-event observation,
  audit/input and immutable replay consumers use their own complete original sources and final disclosure
  boundaries without a new event-derived Goal projector or checkpoint.
gui_related: false
gui_classification_reason: Defines existing-command source, event, storage and result publication without
  a new visual surface.
depends_on:
- SP-287
- SP-286
- CV-342
- DL-047
unblocks: []
acceptance_criteria:
- Four exact closed outer wrappers use the unchanged arbitrary-precision Goal encoder and scoped hexadecimal
  keys; inner semantic and CV-333 hashes retain their own domains.
- Actual original source/input/epoch-zero/head enroll together under absent operation identity before
  body reservation; a matching source projection cannot issue original acceptance.
- Original reserve and body/receipt publication commit exact physical control/body/history/origin with
  immutable progress/head in their respective held transactions; later sync cannot repair missing participation.
- Event input is frozen only from the admitted original body/source and published once through the actual
  shared event, first-receipt and full-value owners with original unknown resolution.
- Immutable progress snapshots and complete CAS head preserve terminal-selected original epoch custody
  when genuine later recovery advances progress.
- No-effect requires genuine zero body/event effect and safe pending release; late unsupported numeric
  terminal routes retain exact progress/effects with terminal unavailable.
- Input content follows the bound Thread under DL-047; content-free source/progress/terminal audit remains
  indefinite without retaining or reconstructing referenced content.
- Named updated-v3 consumers adopt exact original physical or complete SP-278 sources, original full-value/first-receipt
  and body evidence where required, after-helper joint release, independent content/audit lifetimes and immutable terminal replay.
- Complete original installation, disclosure and coherent backup/restore predicates are required; missing native
  owner coverage remains unavailable and normative composition supplies no native event-depth proof.
validation_surfaces:
- Plans/goal_update_command_custody.schema.json
- Plans/goal_update_schema_resources.json
- Plans/goal_updated_consumer_contracts.schema.json
- Plans/goal_updated_consumer_resources.json
- reports/event-authority-20260911/step-08-goal-update-validation.md
- reports/event-authority-20260911/step-08-goal-update-checks.json
risk_class: false_original_update_or_lost_accepted_effect
reasoning_tier: high
context_scope: original_goal_update_physical_and_transaction_custody
implementation_surfaces:
- Plans/storage-plan.md
- Plans/goal_update_command_custody.schema.json
node_compile_hint:
  mode: original_goal_update_prerequisite_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-047
- Plans/Goal_Runtime_System.md#GRS-064
negative_constraints:
- Do not infer accepted source or native atomicity from a schema, copied owner map, result-shaped value
  or fixture.
- Do not reconstruct disposed input, change original terminal outcomes, borrow creation authority or claim
  current event-consumer depth.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Shared_Integration_Runtime.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-299, ContractName:Plans/storage-plan.md#SP-287, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/Goal_Runtime_System.md#GRS-068, ContractName:Plans/Shared_Integration_Runtime.md#SIR-049, ContractName:Plans/Contracts_V0.md#CV-342, ContractName:Plans/goal_update_schema_resources.json

### SP-300 - Exact historical goal.progressed source reader

```yaml
plan_unit_id: SP-300
unit_type: constraint
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: For exactly goal.progressed, storage.goal_progressed_history_read.v1@1.0.0 returns one original
  historical record and truthful validation disposition under the unchanged authoritative whole v2 contract, current
  Project/access authority and complete actual SP-278 root/current generation/dataset/birth anchor/global frontier/source
  token. Original admission and all D-R08 historical predicates remain independent requirements. Every original
  helper and composite read is guarded before helpers and by a final complete pure after-helper source/output/access
  check. This exact family owns zero durable effect and none_required family checkpoint; the actual generic checkpoint
  is separately mandatory.
gui_related: false
gui_classification_reason: This is an internal historical source/validation contract with no new visual surface.
split_recommended: false
depends_on:
- GRS-069
- CV-343
- SP-278
- DL-045
unblocks: []
acceptance_criteria:
- Current schema-valid `goal.progressed` append is refused before dedupe/CAS/append with no state, receipt, provider,
  Usage, scheduling, Goal or workflow effect. A current blocked/active/paused Goal, a To-Do transition, an unchanged
  fingerprint, or a schema-valid old running pair cannot authorize a current append. Historical task IDs do not
  become active To-Dos, Goal children or percentages.
- Given an actually lawfully admitted original historical event, its complete source and original applicable owner
  proof, the exact historical reader returns that original value with verified historical provenance under a current
  full SP-278 token and permitted disclosure. This is a normative conditional oracle, not a claim that such an instance
  exists.
- Missing original required predecessor/receipt/source/decision proof reports unresolved historical validation;
  current data cannot invent it. Invalid envelope/payload/source rejects truthful inspection without this read writing
  quarantine or a checkpoint.
- A same-generation nonmatching append, changed root/anchor/frontier/source, access/deletion/hold/maintenance change
  or post-helper candidate alteration invalidates the read before disclosure. No helper runs after the final actual-owner
  guard.
- Repeated lookup changes no durable state; reader withdrawal returns unavailable while preserving exact original
  custody. Lawfully removed required source yields unavailable, not payload reconstruction.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_progressed.schema.json
- Plans/event_family_registry.json
- Plans/storage_value_registry.json
- Plans/event_record_index_checkpoint.schema.json
- python3 scripts/pm-plan-index.py validate
risk_class: goal_progressed_historical_authority_confusion
reasoning_tier: high
context_scope: goal_progressed_historical_contract
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: historical_source_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Goal_Runtime_System.md#GRS-052
- Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima
preserved_exact_tokens:
- goal.progressed
- pm.goal_runtime_event.goal_progressed.schema.v2
- storage.goal_progressed_history_read.v1@1.0.0
- D-R08
- RP-AUTHORITY-INDEFINITE
- none_required
negative_constraints:
- No current writer, event-derived Goal state, retired topology/role/stage, new event admission, historical byte
  rewriting, or original-admission inference from schema/hash/timestamp.
- No durable reader effect, family checkpoint, read-triggered recovery/quarantine, native proof, WorkNode/readiness
  admission or governance seal.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
```

Exact internal binding `storage.goal_progressed_history_read.v1@1.0.0`; no public command. It adopts the complete mechanics below for this family independently, with its own exact original D-R08/schema/receipt/reference predicates under GRS-069. Request is the closed four-field project_id, goal_id, event_id, sequence_id selector; actual selected Storage instance and access authority are owner context. It returns one ephemeral original historical record and truthful validation/provenance disposition, never an event-derived active Goal record.

For this exact family, SP-214's old Goal-state/child/evidence/progress projection implications are superseded: no family projection or durable replay effect is owned, and checkpoint disposition is `none_required`. This is a direct zero-effect owner assignment for `goal.progressed`, not borrowed from another event. The independently required SP-278 generic root/anchor/frontier/token/source publication remains mandatory. No write to canonical receipt, Goal body/control/history, To-Do, WorkGraph, Workflow/GoalRun, source index, checkpoint, hold or recovery state occurs. Storage keeps the existing RP-AUTHORITY-INDEFINITE event assignment; source/frame/index and referenced record lifetimes remain under their own owners.

The exact internal request is `{project_id, goal_id, event_id, sequence_id}` with no additional fields. IDs are exact nonempty strings; sequence is an exact nonnegative integer in the existing EventRecord/source owner domain. There is no binary64 round trip or new 53-bit/fixed-width cap. Resolve the actual selected Storage instance, Project/audit access, original applicable-contract custody and current installed reader version from owner context, not caller flags.

Use SP-278's actual `reader.storage.event_record_index@1.0.0` and exact `Plans/event_record_index_checkpoint.schema.json#/$defs/read_token`. In one real redb snapshot resolve table `checkpoints`, key `event_record_index_checkpoint.v1:{storage_instance_id}`, uniquely current `current_generation_id`, exact `#/generations/{generation_id}` node and same-database `event_record_index.v2@{generation_id}` dataset. Resolve the original row key `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}` under the existing key codec and admitted integer domain. The immutable row publication locator/checkpoint joins generation birth anchor; it is not silently compared to the latest appended manifest. Current advancing frontier separately joins actual synchronized CURRENT/manifest and complete global source, including nonmatching and other-Project records.

Preserve every field of the exact full read token: storage_instance_id, checkpoint_key, checkpoint_ref, generation_id, generation_anchor_sha256, frontier_revision, frontier_sha256, index_dataset_name, source_selection and redb_snapshot_id. Complete source_selection binds actual CURRENT/manifest bytes, selected generation, manifest generation, recovery epoch, survivor prefix, retained inventory, durable watermarks, excluded ranges and retired inputs. Same-generation append invalidates the previous token. No filtered matching maximum, foreign dataset, reference-only checkpoint or sibling family checkpoint qualifies.

Read the complete original source frame at its full segment-generation/name/byte-offset/sequence tuple; verify bounds, CRC, durable watermark, event/project/Goal/sequence/type identities, exact outer EventRecord, authoritative whole original v2 payload root and all common/row field joins. Preserve actor/runtime/account identity and optional parent/causation/idempotency members as historical source data only. Apply original producer/payload/semantic/idempotency digest rules and the schema header's original n -> n+1/current-CAS predicate; do not apply current state aliases. Generic source coverage/translation requires actual committed authority and preserved original identity; a later suffix joins current frontier separately. This reader never reconstructs source or runs generic rebuild/recovery.

Original lawful historical admission is independently mandatory: actual applicable-contract source-generation/compatibility evidence or authenticated identity-preserving restoration and original recovery custody. A timestamp, current schema validity, old-looking bytes, valid hash or absence of a current writer cannot establish historical admission. Preserve the exact row's original predecessor, decision, receipt and referenced-record predicates. Where those independently required original facts cannot be proved, return `unresolved_historical_validation` with non-content-bearing missing-obligation identifiers, no assertion that the old transition was lawful, and no current action authority. A `verified_historical` result requires all of them. A missing/corrupt/withdrawn source/access/token returns `unavailable`; this read does not write quarantine. No historical positive instance is claimed.

The ephemeral output has exactly eight required fields: `kind`, `reader_binding`, `selector`, `original_event`, `original_validation`, `unresolved_obligations`, `read_token`, `action_authority`. `selector` is exactly the four-field request. `reader_binding` is this PlanUnit's exact constant. `kind` is `verified_historical | unresolved_historical_validation | unavailable`; `original_validation` is respectively `verified | unresolved | unavailable`, and `action_authority` is always `none`. The first two kinds carry the complete unchanged original EventRecord and exact full SP-278 read token; unavailable carries null for both. A verified result has an empty obligation array. An unresolved result has a nonempty unique array of fixed identifiers from `original_admission`, `original_producer_authority`, `original_revision_cas`, `original_predecessor_state`, `original_runtime_identity`, `original_idempotency`, `original_referenced_record`, `original_decision`, `original_row_predicate`; each identifies an independently unproved obligation in this exact row, without adding dynamic source text. Unavailable has an empty obligation array and discloses no source value. The complete actual original checks determine the kind; absence of a diagnostic never proves a predicate. Denied access, invalid source/envelope/payload or changed current source/token cannot become unresolved-with-content. Missing historical semantic/admission evidence may be reported unresolved only when the current generic source read and permission independently authorize the complete raw historical observation. No unresolved output claims original lawful transition, completion or present action authority. Current permission must authorize every disclosed original value and ref; no partial/drop/redact transform may be presented as the original full value. Existing reject-unhandled-secrets remains mandatory. This output is internal and ephemeral, not a new persisted event, receipt, schema family or public command.

At each original reader entry before the first decoder/resolver/validator/copy/output helper, independently capture the selector, actual Storage/root/node/dataset/whole source-token/maintenance fence, original applicable-contract/source/receipt facts and current access/deletion/hold authority. Independently derive the complete permitted original record and validation/provenance output before its builders. After all helpers—including receipt/predecessor validation and the final currentness/permission helper—compare the entire candidate, immutable selector, actual original admission/source facts and complete current owner/token fence in a final pure predicate. No replaceable helper may run between that predicate and ephemeral disclosure. Drift discards the answer; an old coherent snapshot cannot claim a new boundary. Original source invalidity cannot be certified merely because its bytes did not change. Every independently callable source resolver, frame decoder, original-admission/row validator or output helper is itself an original entry boundary: it captures its actual invoking owner scope and required source/access inputs before replaceable helpers, independently derives its entire permitted typed result, and makes its own complete pure source/output/fence comparison after all helpers before returning. A caller-supplied witness or a later composite guard does not discharge that helper boundary. The outer reader still performs the complete final boundary after those helper returns; no helper may run between that predicate and disclosure.

This exact family owner explicitly assigns no durable effect: no state projector, acknowledgment token, replay cursor, idempotency ledger, command, notification, provider/tool call, Usage charge, hold/recovery action or canonical receipt mutation. Family checkpoint is individually `none_required`; SP-278's actual generic checkpoint is still required. Current lookup does not reacquire lawfully disposed old control files just to reconstruct authority; if preserved original admission cannot suffice under its owner, disclose unavailable/unresolved. Existing event/source/ref retention and recovery owners remain unchanged; refs do not create new content holds. Withdrawal stops this reader, retains old custody and does not install a producer or silently select another version.

This binding selects the unchanged authoritative whole v2 payload and original supported EventRecord envelope only. Existing separately owned legacy v1 reader/upgrader routes remain unchanged; this contract adds no legacy conversion, v1 output or current-write route. The original generic source envelope/version admission remains independently mandatory. The original retained frame and referenced records keep their existing separate clocks; RP-AUTHORITY-INDEFINITE@1.0.0 and RP-EVENT-INDEX-SOURCE@1.0.0 remain the exact source/index assignments. Original source translation must have authentic committed identity-preserving authority, with immutable target birth and later current suffix checked separately. No old original control file is reacquired merely to recreate disposed admission evidence, and no reference creates a new content hold. An old coherent snapshot may finish only under its actual still-valid owner lease/fence and may never claim a newer boundary. No fixture, schema result or hypothetical historical positive establishes native reader availability.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-069, ContractName:Plans/Contracts_V0.md#CV-343, ContractName:Plans/storage-plan.md#SP-278, SchemaID:pm.goal_runtime_event.goal_progressed.schema.v2

### SP-301 - Exact historical goal.replanned source reader

```yaml
plan_unit_id: SP-301
unit_type: constraint
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: For exactly goal.replanned, storage.goal_replanned_history_read.v1@1.0.0 returns one original historical
  record and truthful validation disposition under the unchanged authoritative whole v2 contract, current Project/access
  authority and complete actual SP-278 root/current generation/dataset/birth anchor/global frontier/source token.
  Original admission and all D-R10 historical predicates remain independent requirements. Every original helper
  and composite read is guarded before helpers and by a final complete pure after-helper source/output/access check.
  This exact family owns zero durable effect and none_required family checkpoint; the actual generic checkpoint
  is separately mandatory.
gui_related: false
gui_classification_reason: This is an internal historical source/validation contract with no new visual surface.
split_recommended: false
depends_on:
- GRS-070
- CV-344
- SP-278
- DL-045
unblocks: []
acceptance_criteria:
- Current schema-valid `goal.replanned` append is refused before dedupe/CAS/append with no state, receipt, provider,
  Usage, scheduling, Goal or workflow effect. Current material objective change or workflow replan cannot append
  this exact old Goal event, and missing original child/evidence/currentness facts cannot be backfilled with present
  workflow state.
- Given an actually lawfully admitted original historical event, its complete source and original applicable owner
  proof, the exact historical reader returns that original value with verified historical provenance under a current
  full SP-278 token and permitted disclosure. This is a normative conditional oracle, not a claim that such an instance
  exists.
- Missing original required predecessor/receipt/source/decision proof reports unresolved historical validation;
  current data cannot invent it. Invalid envelope/payload/source rejects truthful inspection without this read writing
  quarantine or a checkpoint.
- A same-generation nonmatching append, changed root/anchor/frontier/source, access/deletion/hold/maintenance change
  or post-helper candidate alteration invalidates the read before disclosure. No helper runs after the final actual-owner
  guard.
- Repeated lookup changes no durable state; reader withdrawal returns unavailable while preserving exact original
  custody. Lawfully removed required source yields unavailable, not payload reconstruction.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_replanned.schema.json
- Plans/event_family_registry.json
- Plans/storage_value_registry.json
- Plans/event_record_index_checkpoint.schema.json
- python3 scripts/pm-plan-index.py validate
risk_class: goal_replanned_historical_authority_confusion
reasoning_tier: high
context_scope: goal_replanned_historical_contract
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: historical_source_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Goal_Runtime_System.md#GRS-052
- Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima
preserved_exact_tokens:
- goal.replanned
- pm.goal_runtime_event.goal_replanned.schema.v2
- storage.goal_replanned_history_read.v1@1.0.0
- D-R10
- RP-AUTHORITY-INDEFINITE
- none_required
negative_constraints:
- No current writer, event-derived Goal state, retired topology/role/stage, new event admission, historical byte
  rewriting, or original-admission inference from schema/hash/timestamp.
- No durable reader effect, family checkpoint, read-triggered recovery/quarantine, native proof, WorkNode/readiness
  admission or governance seal.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
```

Exact internal binding `storage.goal_replanned_history_read.v1@1.0.0`; no public command. It adopts the complete mechanics below for this family independently, with its own exact original D-R10/schema/receipt/reference predicates under GRS-070. Request is the closed four-field project_id, goal_id, event_id, sequence_id selector; actual selected Storage instance and access authority are owner context. It returns one ephemeral original historical record and truthful validation/provenance disposition, never an event-derived active Goal record.

For this exact family, SP-214's old Goal-state/child/evidence/progress projection implications are superseded: no family projection or durable replay effect is owned, and checkpoint disposition is `none_required`. This is a direct zero-effect owner assignment for `goal.replanned`, not borrowed from another event. The independently required SP-278 generic root/anchor/frontier/token/source publication remains mandatory. No write to canonical receipt, Goal body/control/history, To-Do, WorkGraph, Workflow/GoalRun, source index, checkpoint, hold or recovery state occurs. Storage keeps the existing RP-AUTHORITY-INDEFINITE event assignment; source/frame/index and referenced record lifetimes remain under their own owners.

The exact internal request is `{project_id, goal_id, event_id, sequence_id}` with no additional fields. IDs are exact nonempty strings; sequence is an exact nonnegative integer in the existing EventRecord/source owner domain. There is no binary64 round trip or new 53-bit/fixed-width cap. Resolve the actual selected Storage instance, Project/audit access, original applicable-contract custody and current installed reader version from owner context, not caller flags.

Use SP-278's actual `reader.storage.event_record_index@1.0.0` and exact `Plans/event_record_index_checkpoint.schema.json#/$defs/read_token`. In one real redb snapshot resolve table `checkpoints`, key `event_record_index_checkpoint.v1:{storage_instance_id}`, uniquely current `current_generation_id`, exact `#/generations/{generation_id}` node and same-database `event_record_index.v2@{generation_id}` dataset. Resolve the original row key `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}` under the existing key codec and admitted integer domain. The immutable row publication locator/checkpoint joins generation birth anchor; it is not silently compared to the latest appended manifest. Current advancing frontier separately joins actual synchronized CURRENT/manifest and complete global source, including nonmatching and other-Project records.

Preserve every field of the exact full read token: storage_instance_id, checkpoint_key, checkpoint_ref, generation_id, generation_anchor_sha256, frontier_revision, frontier_sha256, index_dataset_name, source_selection and redb_snapshot_id. Complete source_selection binds actual CURRENT/manifest bytes, selected generation, manifest generation, recovery epoch, survivor prefix, retained inventory, durable watermarks, excluded ranges and retired inputs. Same-generation append invalidates the previous token. No filtered matching maximum, foreign dataset, reference-only checkpoint or sibling family checkpoint qualifies.

Read the complete original source frame at its full segment-generation/name/byte-offset/sequence tuple; verify bounds, CRC, durable watermark, event/project/Goal/sequence/type identities, exact outer EventRecord, authoritative whole original v2 payload root and all common/row field joins. Preserve actor/runtime/account identity and optional parent/causation/idempotency members as historical source data only. Apply original producer/payload/semantic/idempotency digest rules and the schema header's original n -> n+1/current-CAS predicate; do not apply current state aliases. Generic source coverage/translation requires actual committed authority and preserved original identity; a later suffix joins current frontier separately. This reader never reconstructs source or runs generic rebuild/recovery.

Original lawful historical admission is independently mandatory: actual applicable-contract source-generation/compatibility evidence or authenticated identity-preserving restoration and original recovery custody. A timestamp, current schema validity, old-looking bytes, valid hash or absence of a current writer cannot establish historical admission. Preserve the exact row's original predecessor, decision, receipt and referenced-record predicates. Where those independently required original facts cannot be proved, return `unresolved_historical_validation` with non-content-bearing missing-obligation identifiers, no assertion that the old transition was lawful, and no current action authority. A `verified_historical` result requires all of them. A missing/corrupt/withdrawn source/access/token returns `unavailable`; this read does not write quarantine. No historical positive instance is claimed.

The ephemeral output has exactly eight required fields: `kind`, `reader_binding`, `selector`, `original_event`, `original_validation`, `unresolved_obligations`, `read_token`, `action_authority`. `selector` is exactly the four-field request. `reader_binding` is this PlanUnit's exact constant. `kind` is `verified_historical | unresolved_historical_validation | unavailable`; `original_validation` is respectively `verified | unresolved | unavailable`, and `action_authority` is always `none`. The first two kinds carry the complete unchanged original EventRecord and exact full SP-278 read token; unavailable carries null for both. A verified result has an empty obligation array. An unresolved result has a nonempty unique array of fixed identifiers from `original_admission`, `original_producer_authority`, `original_revision_cas`, `original_predecessor_state`, `original_runtime_identity`, `original_idempotency`, `original_referenced_record`, `original_decision`, `original_row_predicate`; each identifies an independently unproved obligation in this exact row, without adding dynamic source text. Unavailable has an empty obligation array and discloses no source value. The complete actual original checks determine the kind; absence of a diagnostic never proves a predicate. Denied access, invalid source/envelope/payload or changed current source/token cannot become unresolved-with-content. Missing historical semantic/admission evidence may be reported unresolved only when the current generic source read and permission independently authorize the complete raw historical observation. No unresolved output claims original lawful transition, completion or present action authority. Current permission must authorize every disclosed original value and ref; no partial/drop/redact transform may be presented as the original full value. Existing reject-unhandled-secrets remains mandatory. This output is internal and ephemeral, not a new persisted event, receipt, schema family or public command.

At each original reader entry before the first decoder/resolver/validator/copy/output helper, independently capture the selector, actual Storage/root/node/dataset/whole source-token/maintenance fence, original applicable-contract/source/receipt facts and current access/deletion/hold authority. Independently derive the complete permitted original record and validation/provenance output before its builders. After all helpers—including receipt/predecessor validation and the final currentness/permission helper—compare the entire candidate, immutable selector, actual original admission/source facts and complete current owner/token fence in a final pure predicate. No replaceable helper may run between that predicate and ephemeral disclosure. Drift discards the answer; an old coherent snapshot cannot claim a new boundary. Original source invalidity cannot be certified merely because its bytes did not change. Every independently callable source resolver, frame decoder, original-admission/row validator or output helper is itself an original entry boundary: it captures its actual invoking owner scope and required source/access inputs before replaceable helpers, independently derives its entire permitted typed result, and makes its own complete pure source/output/fence comparison after all helpers before returning. A caller-supplied witness or a later composite guard does not discharge that helper boundary. The outer reader still performs the complete final boundary after those helper returns; no helper may run between that predicate and disclosure.

This exact family owner explicitly assigns no durable effect: no state projector, acknowledgment token, replay cursor, idempotency ledger, command, notification, provider/tool call, Usage charge, hold/recovery action or canonical receipt mutation. Family checkpoint is individually `none_required`; SP-278's actual generic checkpoint is still required. Current lookup does not reacquire lawfully disposed old control files just to reconstruct authority; if preserved original admission cannot suffice under its owner, disclose unavailable/unresolved. Existing event/source/ref retention and recovery owners remain unchanged; refs do not create new content holds. Withdrawal stops this reader, retains old custody and does not install a producer or silently select another version.

This binding selects the unchanged authoritative whole v2 payload and original supported EventRecord envelope only. Existing separately owned legacy v1 reader/upgrader routes remain unchanged; this contract adds no legacy conversion, v1 output or current-write route. The original generic source envelope/version admission remains independently mandatory. The original retained frame and referenced records keep their existing separate clocks; RP-AUTHORITY-INDEFINITE@1.0.0 and RP-EVENT-INDEX-SOURCE@1.0.0 remain the exact source/index assignments. Original source translation must have authentic committed identity-preserving authority, with immutable target birth and later current suffix checked separately. No old original control file is reacquired merely to recreate disposed admission evidence, and no reference creates a new content hold. An old coherent snapshot may finish only under its actual still-valid owner lease/fence and may never claim a newer boundary. No fixture, schema result or hypothetical historical positive establishes native reader availability.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-070, ContractName:Plans/Contracts_V0.md#CV-344, ContractName:Plans/storage-plan.md#SP-278, SchemaID:pm.goal_runtime_event.goal_replanned.schema.v2

### SP-302 - Exact historical goal.stopped source reader

```yaml
plan_unit_id: SP-302
unit_type: constraint
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: For exactly goal.stopped, storage.goal_stopped_history_read.v1@1.0.0 returns one original historical
  record and truthful validation disposition under the unchanged authoritative whole v2 contract, current Project/access
  authority and complete actual SP-278 root/current generation/dataset/birth anchor/global frontier/source token.
  Original admission and all D-R12 historical predicates remain independent requirements. Every original helper
  and composite read is guarded before helpers and by a final complete pure after-helper source/output/access check.
  This exact family owns zero durable effect and none_required family checkpoint; the actual generic checkpoint
  is separately mandatory.
gui_related: false
gui_classification_reason: This is an internal historical source/validation contract with no new visual surface.
split_recommended: false
depends_on:
- GRS-071
- CV-345
- SP-278
- DL-045
unblocks: []
acceptance_criteria:
- Current schema-valid `goal.stopped` append is refused before dedupe/CAS/append with no state, receipt, provider,
  Usage, scheduling, Goal or workflow effect. A user Stop, cleared dependency, quota reset, execution window, recovery
  receipt or retained resumable=true never authorizes current stopped Goal state, resume/stop-epoch clearing or
  a new settlement/receipt.
- Given an actually lawfully admitted original historical event, its complete source and original applicable owner
  proof, the exact historical reader returns that original value with verified historical provenance under a current
  full SP-278 token and permitted disclosure. This is a normative conditional oracle, not a claim that such an instance
  exists.
- Missing original required predecessor/receipt/source/decision proof reports unresolved historical validation;
  current data cannot invent it. Invalid envelope/payload/source rejects truthful inspection without this read writing
  quarantine or a checkpoint.
- A same-generation nonmatching append, changed root/anchor/frontier/source, access/deletion/hold/maintenance change
  or post-helper candidate alteration invalidates the read before disclosure. No helper runs after the final actual-owner
  guard.
- Repeated lookup changes no durable state; reader withdrawal returns unavailable while preserving exact original
  custody. Lawfully removed required source yields unavailable, not payload reconstruction.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_stopped.schema.json
- Plans/event_family_registry.json
- Plans/storage_value_registry.json
- Plans/event_record_index_checkpoint.schema.json
- python3 scripts/pm-plan-index.py validate
risk_class: goal_stopped_historical_authority_confusion
reasoning_tier: high
context_scope: goal_stopped_historical_contract
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: historical_source_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Goal_Runtime_System.md#GRS-052
- Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima
preserved_exact_tokens:
- goal.stopped
- pm.goal_runtime_event.goal_stopped.schema.v2
- storage.goal_stopped_history_read.v1@1.0.0
- D-R12
- RP-AUTHORITY-INDEFINITE
- none_required
negative_constraints:
- No current writer, event-derived Goal state, retired topology/role/stage, new event admission, historical byte
  rewriting, or original-admission inference from schema/hash/timestamp.
- No durable reader effect, family checkpoint, read-triggered recovery/quarantine, native proof, WorkNode/readiness
  admission or governance seal.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
```

Exact internal binding `storage.goal_stopped_history_read.v1@1.0.0`; no public command. It adopts the complete mechanics below for this family independently, with its own exact original D-R12/schema/receipt/reference predicates under GRS-071. Request is the closed four-field project_id, goal_id, event_id, sequence_id selector; actual selected Storage instance and access authority are owner context. It returns one ephemeral original historical record and truthful validation/provenance disposition, never an event-derived active Goal record.

For this exact family, SP-214's old Goal-state/child/evidence/progress projection implications are superseded: no family projection or durable replay effect is owned, and checkpoint disposition is `none_required`. This is a direct zero-effect owner assignment for `goal.stopped`, not borrowed from another event. The independently required SP-278 generic root/anchor/frontier/token/source publication remains mandatory. No write to canonical receipt, Goal body/control/history, To-Do, WorkGraph, Workflow/GoalRun, source index, checkpoint, hold or recovery state occurs. Storage keeps the existing RP-AUTHORITY-INDEFINITE event assignment; source/frame/index and referenced record lifetimes remain under their own owners.

The exact internal request is `{project_id, goal_id, event_id, sequence_id}` with no additional fields. IDs are exact nonempty strings; sequence is an exact nonnegative integer in the existing EventRecord/source owner domain. There is no binary64 round trip or new 53-bit/fixed-width cap. Resolve the actual selected Storage instance, Project/audit access, original applicable-contract custody and current installed reader version from owner context, not caller flags.

Use SP-278's actual `reader.storage.event_record_index@1.0.0` and exact `Plans/event_record_index_checkpoint.schema.json#/$defs/read_token`. In one real redb snapshot resolve table `checkpoints`, key `event_record_index_checkpoint.v1:{storage_instance_id}`, uniquely current `current_generation_id`, exact `#/generations/{generation_id}` node and same-database `event_record_index.v2@{generation_id}` dataset. Resolve the original row key `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}` under the existing key codec and admitted integer domain. The immutable row publication locator/checkpoint joins generation birth anchor; it is not silently compared to the latest appended manifest. Current advancing frontier separately joins actual synchronized CURRENT/manifest and complete global source, including nonmatching and other-Project records.

Preserve every field of the exact full read token: storage_instance_id, checkpoint_key, checkpoint_ref, generation_id, generation_anchor_sha256, frontier_revision, frontier_sha256, index_dataset_name, source_selection and redb_snapshot_id. Complete source_selection binds actual CURRENT/manifest bytes, selected generation, manifest generation, recovery epoch, survivor prefix, retained inventory, durable watermarks, excluded ranges and retired inputs. Same-generation append invalidates the previous token. No filtered matching maximum, foreign dataset, reference-only checkpoint or sibling family checkpoint qualifies.

Read the complete original source frame at its full segment-generation/name/byte-offset/sequence tuple; verify bounds, CRC, durable watermark, event/project/Goal/sequence/type identities, exact outer EventRecord, authoritative whole original v2 payload root and all common/row field joins. Preserve actor/runtime/account identity and optional parent/causation/idempotency members as historical source data only. Apply original producer/payload/semantic/idempotency digest rules and the schema header's original n -> n+1/current-CAS predicate; do not apply current state aliases. Generic source coverage/translation requires actual committed authority and preserved original identity; a later suffix joins current frontier separately. This reader never reconstructs source or runs generic rebuild/recovery.

Original lawful historical admission is independently mandatory: actual applicable-contract source-generation/compatibility evidence or authenticated identity-preserving restoration and original recovery custody. A timestamp, current schema validity, old-looking bytes, valid hash or absence of a current writer cannot establish historical admission. Preserve the exact row's original predecessor, decision, receipt and referenced-record predicates. Where those independently required original facts cannot be proved, return `unresolved_historical_validation` with non-content-bearing missing-obligation identifiers, no assertion that the old transition was lawful, and no current action authority. A `verified_historical` result requires all of them. A missing/corrupt/withdrawn source/access/token returns `unavailable`; this read does not write quarantine. No historical positive instance is claimed.

The ephemeral output has exactly eight required fields: `kind`, `reader_binding`, `selector`, `original_event`, `original_validation`, `unresolved_obligations`, `read_token`, `action_authority`. `selector` is exactly the four-field request. `reader_binding` is this PlanUnit's exact constant. `kind` is `verified_historical | unresolved_historical_validation | unavailable`; `original_validation` is respectively `verified | unresolved | unavailable`, and `action_authority` is always `none`. The first two kinds carry the complete unchanged original EventRecord and exact full SP-278 read token; unavailable carries null for both. A verified result has an empty obligation array. An unresolved result has a nonempty unique array of fixed identifiers from `original_admission`, `original_producer_authority`, `original_revision_cas`, `original_predecessor_state`, `original_runtime_identity`, `original_idempotency`, `original_referenced_record`, `original_decision`, `original_row_predicate`; each identifies an independently unproved obligation in this exact row, without adding dynamic source text. Unavailable has an empty obligation array and discloses no source value. The complete actual original checks determine the kind; absence of a diagnostic never proves a predicate. Denied access, invalid source/envelope/payload or changed current source/token cannot become unresolved-with-content. Missing historical semantic/admission evidence may be reported unresolved only when the current generic source read and permission independently authorize the complete raw historical observation. No unresolved output claims original lawful transition, completion or present action authority. Current permission must authorize every disclosed original value and ref; no partial/drop/redact transform may be presented as the original full value. Existing reject-unhandled-secrets remains mandatory. This output is internal and ephemeral, not a new persisted event, receipt, schema family or public command.

At each original reader entry before the first decoder/resolver/validator/copy/output helper, independently capture the selector, actual Storage/root/node/dataset/whole source-token/maintenance fence, original applicable-contract/source/receipt facts and current access/deletion/hold authority. Independently derive the complete permitted original record and validation/provenance output before its builders. After all helpers—including receipt/predecessor validation and the final currentness/permission helper—compare the entire candidate, immutable selector, actual original admission/source facts and complete current owner/token fence in a final pure predicate. No replaceable helper may run between that predicate and ephemeral disclosure. Drift discards the answer; an old coherent snapshot cannot claim a new boundary. Original source invalidity cannot be certified merely because its bytes did not change. Every independently callable source resolver, frame decoder, original-admission/row validator or output helper is itself an original entry boundary: it captures its actual invoking owner scope and required source/access inputs before replaceable helpers, independently derives its entire permitted typed result, and makes its own complete pure source/output/fence comparison after all helpers before returning. A caller-supplied witness or a later composite guard does not discharge that helper boundary. The outer reader still performs the complete final boundary after those helper returns; no helper may run between that predicate and disclosure.

This exact family owner explicitly assigns no durable effect: no state projector, acknowledgment token, replay cursor, idempotency ledger, command, notification, provider/tool call, Usage charge, hold/recovery action or canonical receipt mutation. Family checkpoint is individually `none_required`; SP-278's actual generic checkpoint is still required. Current lookup does not reacquire lawfully disposed old control files just to reconstruct authority; if preserved original admission cannot suffice under its owner, disclose unavailable/unresolved. Existing event/source/ref retention and recovery owners remain unchanged; refs do not create new content holds. Withdrawal stops this reader, retains old custody and does not install a producer or silently select another version.

This binding selects the unchanged authoritative whole v2 payload and original supported EventRecord envelope only. Existing separately owned legacy v1 reader/upgrader routes remain unchanged; this contract adds no legacy conversion, v1 output or current-write route. The original generic source envelope/version admission remains independently mandatory. The original retained frame and referenced records keep their existing separate clocks; RP-AUTHORITY-INDEFINITE@1.0.0 and RP-EVENT-INDEX-SOURCE@1.0.0 remain the exact source/index assignments. Original source translation must have authentic committed identity-preserving authority, with immutable target birth and later current suffix checked separately. No old original control file is reacquired merely to recreate disposed admission evidence, and no reference creates a new content hold. An old coherent snapshot may finish only under its actual still-valid owner lease/fence and may never claim a newer boundary. No fixture, schema result or hypothetical historical positive establishes native reader availability.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-071, ContractName:Plans/Contracts_V0.md#CV-345, ContractName:Plans/storage-plan.md#SP-278, SchemaID:pm.goal_runtime_event.goal_stopped.schema.v2

### SP-303 - Exact historical goal.verification_decided source reader

```yaml
plan_unit_id: SP-303
unit_type: constraint
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: For exactly goal.verification_decided, storage.goal_verification_decided_history_read.v1@1.0.0 returns
  one original historical record and truthful validation disposition under the unchanged authoritative whole v2
  contract, current Project/access authority and complete actual SP-278 root/current generation/dataset/birth anchor/global
  frontier/source token. Original admission and all D-R15 historical predicates remain independent requirements.
  Every original helper and composite read is guarded before helpers and by a final complete pure after-helper source/output/access
  check. This exact family owns zero durable effect and none_required family checkpoint; the actual generic checkpoint
  is separately mandatory.
gui_related: false
gui_classification_reason: This is an internal historical source/validation contract with no new visual surface.
split_recommended: false
depends_on:
- GRS-072
- CV-346
- SP-278
- DL-045
unblocks: []
acceptance_criteria:
- Current schema-valid `goal.verification_decided` append is refused before dedupe/CAS/append with no state, receipt,
  provider, Usage, scheduling, Goal or workflow effect. A current reviewer result, VerificationCycle.status, valid
  Workflow receipt, or old passed payload cannot append this Goal event, mutate Goal state, create a required Goal
  verifier/adjudicator role, or claim completion.
- Given an actually lawfully admitted original historical event, its complete source and original applicable owner
  proof, the exact historical reader returns that original value with verified historical provenance under a current
  full SP-278 token and permitted disclosure. This is a normative conditional oracle, not a claim that such an instance
  exists.
- Missing original required predecessor/receipt/source/decision proof reports unresolved historical validation;
  current data cannot invent it. Invalid envelope/payload/source rejects truthful inspection without this read writing
  quarantine or a checkpoint.
- A same-generation nonmatching append, changed root/anchor/frontier/source, access/deletion/hold/maintenance change
  or post-helper candidate alteration invalidates the read before disclosure. No helper runs after the final actual-owner
  guard.
- Repeated lookup changes no durable state; reader withdrawal returns unavailable while preserving exact original
  custody. Lawfully removed required source yields unavailable, not payload reconstruction.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_verification_decided.schema.json
- Plans/event_family_registry.json
- Plans/storage_value_registry.json
- Plans/event_record_index_checkpoint.schema.json
- python3 scripts/pm-plan-index.py validate
risk_class: goal_verification_decided_historical_authority_confusion
reasoning_tier: high
context_scope: goal_verification_decided_historical_contract
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: historical_source_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Goal_Runtime_System.md#GRS-052
- Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima
preserved_exact_tokens:
- goal.verification_decided
- pm.goal_runtime_event.goal_verification_decided.schema.v2
- storage.goal_verification_decided_history_read.v1@1.0.0
- D-R15
- RP-AUTHORITY-INDEFINITE
- none_required
negative_constraints:
- No current writer, event-derived Goal state, retired topology/role/stage, new event admission, historical byte
  rewriting, or original-admission inference from schema/hash/timestamp.
- No durable reader effect, family checkpoint, read-triggered recovery/quarantine, native proof, WorkNode/readiness
  admission or governance seal.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
```

Exact internal binding `storage.goal_verification_decided_history_read.v1@1.0.0`; no public command. It adopts the complete mechanics below for this family independently, with its own exact original D-R15/schema/receipt/reference predicates under GRS-072. Request is the closed four-field project_id, goal_id, event_id, sequence_id selector; actual selected Storage instance and access authority are owner context. It returns one ephemeral original historical record and truthful validation/provenance disposition, never an event-derived active Goal record.

For this exact family, SP-214's old Goal-state/child/evidence/progress projection implications are superseded: no family projection or durable replay effect is owned, and checkpoint disposition is `none_required`. This is a direct zero-effect owner assignment for `goal.verification_decided`, not borrowed from another event. The independently required SP-278 generic root/anchor/frontier/token/source publication remains mandatory. No write to canonical receipt, Goal body/control/history, To-Do, WorkGraph, Workflow/GoalRun, source index, checkpoint, hold or recovery state occurs. Storage keeps the existing RP-AUTHORITY-INDEFINITE event assignment; source/frame/index and referenced record lifetimes remain under their own owners.

The exact internal request is `{project_id, goal_id, event_id, sequence_id}` with no additional fields. IDs are exact nonempty strings; sequence is an exact nonnegative integer in the existing EventRecord/source owner domain. There is no binary64 round trip or new 53-bit/fixed-width cap. Resolve the actual selected Storage instance, Project/audit access, original applicable-contract custody and current installed reader version from owner context, not caller flags.

Use SP-278's actual `reader.storage.event_record_index@1.0.0` and exact `Plans/event_record_index_checkpoint.schema.json#/$defs/read_token`. In one real redb snapshot resolve table `checkpoints`, key `event_record_index_checkpoint.v1:{storage_instance_id}`, uniquely current `current_generation_id`, exact `#/generations/{generation_id}` node and same-database `event_record_index.v2@{generation_id}` dataset. Resolve the original row key `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}` under the existing key codec and admitted integer domain. The immutable row publication locator/checkpoint joins generation birth anchor; it is not silently compared to the latest appended manifest. Current advancing frontier separately joins actual synchronized CURRENT/manifest and complete global source, including nonmatching and other-Project records.

Preserve every field of the exact full read token: storage_instance_id, checkpoint_key, checkpoint_ref, generation_id, generation_anchor_sha256, frontier_revision, frontier_sha256, index_dataset_name, source_selection and redb_snapshot_id. Complete source_selection binds actual CURRENT/manifest bytes, selected generation, manifest generation, recovery epoch, survivor prefix, retained inventory, durable watermarks, excluded ranges and retired inputs. Same-generation append invalidates the previous token. No filtered matching maximum, foreign dataset, reference-only checkpoint or sibling family checkpoint qualifies.

Read the complete original source frame at its full segment-generation/name/byte-offset/sequence tuple; verify bounds, CRC, durable watermark, event/project/Goal/sequence/type identities, exact outer EventRecord, authoritative whole original v2 payload root and all common/row field joins. Preserve actor/runtime/account identity and optional parent/causation/idempotency members as historical source data only. Apply original producer/payload/semantic/idempotency digest rules and the schema header's original n -> n+1/current-CAS predicate; do not apply current state aliases. Generic source coverage/translation requires actual committed authority and preserved original identity; a later suffix joins current frontier separately. This reader never reconstructs source or runs generic rebuild/recovery.

Original lawful historical admission is independently mandatory: actual applicable-contract source-generation/compatibility evidence or authenticated identity-preserving restoration and original recovery custody. A timestamp, current schema validity, old-looking bytes, valid hash or absence of a current writer cannot establish historical admission. Preserve the exact row's original predecessor, decision, receipt and referenced-record predicates. Where those independently required original facts cannot be proved, return `unresolved_historical_validation` with non-content-bearing missing-obligation identifiers, no assertion that the old transition was lawful, and no current action authority. A `verified_historical` result requires all of them. A missing/corrupt/withdrawn source/access/token returns `unavailable`; this read does not write quarantine. No historical positive instance is claimed.

The ephemeral output has exactly eight required fields: `kind`, `reader_binding`, `selector`, `original_event`, `original_validation`, `unresolved_obligations`, `read_token`, `action_authority`. `selector` is exactly the four-field request. `reader_binding` is this PlanUnit's exact constant. `kind` is `verified_historical | unresolved_historical_validation | unavailable`; `original_validation` is respectively `verified | unresolved | unavailable`, and `action_authority` is always `none`. The first two kinds carry the complete unchanged original EventRecord and exact full SP-278 read token; unavailable carries null for both. A verified result has an empty obligation array. An unresolved result has a nonempty unique array of fixed identifiers from `original_admission`, `original_producer_authority`, `original_revision_cas`, `original_predecessor_state`, `original_runtime_identity`, `original_idempotency`, `original_referenced_record`, `original_decision`, `original_row_predicate`; each identifies an independently unproved obligation in this exact row, without adding dynamic source text. Unavailable has an empty obligation array and discloses no source value. The complete actual original checks determine the kind; absence of a diagnostic never proves a predicate. Denied access, invalid source/envelope/payload or changed current source/token cannot become unresolved-with-content. Missing historical semantic/admission evidence may be reported unresolved only when the current generic source read and permission independently authorize the complete raw historical observation. No unresolved output claims original lawful transition, completion or present action authority. Current permission must authorize every disclosed original value and ref; no partial/drop/redact transform may be presented as the original full value. Existing reject-unhandled-secrets remains mandatory. This output is internal and ephemeral, not a new persisted event, receipt, schema family or public command.

At each original reader entry before the first decoder/resolver/validator/copy/output helper, independently capture the selector, actual Storage/root/node/dataset/whole source-token/maintenance fence, original applicable-contract/source/receipt facts and current access/deletion/hold authority. Independently derive the complete permitted original record and validation/provenance output before its builders. After all helpers—including receipt/predecessor validation and the final currentness/permission helper—compare the entire candidate, immutable selector, actual original admission/source facts and complete current owner/token fence in a final pure predicate. No replaceable helper may run between that predicate and ephemeral disclosure. Drift discards the answer; an old coherent snapshot cannot claim a new boundary. Original source invalidity cannot be certified merely because its bytes did not change. Every independently callable source resolver, frame decoder, original-admission/row validator or output helper is itself an original entry boundary: it captures its actual invoking owner scope and required source/access inputs before replaceable helpers, independently derives its entire permitted typed result, and makes its own complete pure source/output/fence comparison after all helpers before returning. A caller-supplied witness or a later composite guard does not discharge that helper boundary. The outer reader still performs the complete final boundary after those helper returns; no helper may run between that predicate and disclosure.

This exact family owner explicitly assigns no durable effect: no state projector, acknowledgment token, replay cursor, idempotency ledger, command, notification, provider/tool call, Usage charge, hold/recovery action or canonical receipt mutation. Family checkpoint is individually `none_required`; SP-278's actual generic checkpoint is still required. Current lookup does not reacquire lawfully disposed old control files just to reconstruct authority; if preserved original admission cannot suffice under its owner, disclose unavailable/unresolved. Existing event/source/ref retention and recovery owners remain unchanged; refs do not create new content holds. Withdrawal stops this reader, retains old custody and does not install a producer or silently select another version.

This binding selects the unchanged authoritative whole v2 payload and original supported EventRecord envelope only. Existing separately owned legacy v1 reader/upgrader routes remain unchanged; this contract adds no legacy conversion, v1 output or current-write route. The original generic source envelope/version admission remains independently mandatory. The original retained frame and referenced records keep their existing separate clocks; RP-AUTHORITY-INDEFINITE@1.0.0 and RP-EVENT-INDEX-SOURCE@1.0.0 remain the exact source/index assignments. Original source translation must have authentic committed identity-preserving authority, with immutable target birth and later current suffix checked separately. No old original control file is reacquired merely to recreate disposed admission evidence, and no reference creates a new content hold. An old coherent snapshot may finish only under its actual still-valid owner lease/fence and may never claim a newer boundary. No fixture, schema result or hypothetical historical positive establishes native reader availability.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-072, ContractName:Plans/Contracts_V0.md#CV-346, ContractName:Plans/storage-plan.md#SP-278, SchemaID:pm.goal_runtime_event.goal_verification_decided.schema.v2

### SP-304 - Original cancellation stages and custody

```yaml
plan_unit_id: SP-304
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Own the seven new canonical cancellation/Stop/audit families and the current version of the
  existing Goal body control. Original source, Stop, receipt, independently owned disposition, append, control
  and SIR terminal stages preserve exact original identities, immutable progress and whole preimages. Current
  passive event inspection has no durable effect or checkpoint; current body/Activity is read from canonical
  control.
gui_related: false
gui_classification_reason: Defines original owner, schema, storage or verification contracts.
split_recommended: false
depends_on:
- GRS-073
- SP-287
- SP-286
- SP-278
- DL-047
unblocks: []
acceptance_criteria:
- Each C-stage commits its original permitted whole write set and exact next immutable progress/head; repeated
  uncertainty or retry creates no replacement original.
- Original accepted occurrence and normalized operation identity fix cancellation timestamp, id and receipt
  key before Stop.
- Stop/receipt/event/control/SIR effects survive every later failure; no-effect requires complete genuine zero-effect
  proof for this operation and preserves prior Stop.
- Head versus immutable epoch selects exact distinct key/record types; Terminal preserves its original selected
  epoch after later recovery.
- Canonical backup/restore preserves complete original source/progress/terminal/body/receipt joins, applies
  current tombstones, and cannot regress committed authority.
- Passive current-v3 or whole-v2 inspection authenticates complete SP-278 source and original first receipt,
  returning only allowed content-free observation with no checkpoint.
validation_surfaces:
- Plans/goal_cancel_command_custody.schema.json
- Plans/goal_execution_binding_custody.schema.json
- Plans/goal_cancel_schema_resources.json
- python3 scripts/pm-plan-index.py validate
risk_class: goal_cancellation_original_authority_or_effect_loss
reasoning_tier: high
context_scope: sp-304_original_cancel_contract
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-047
negative_constraints:
- No fifth Goal state, objective/body revision mutation, child/tool settlement list, new command or peer handler.
- No raw Goal content in indefinite audit, new retention limit, silent codec substitution or fabricated original
  receipt.
- No native execution proof, full event-depth verdict, WorkNode/readiness admission or governance seal.
```

##### Original operation stages

C-source captures immutable SourceAudit plus progress epoch zero/head in one actual redb transaction after original SIR/Goal validation, before any Stop effect. SourceAudit includes the exact content-free original request, original normalized nonterminal source, body/history/currentness/Stop preimage commitments, actual execution binding and complete original producer metadata. Event identity, occurrence, actor/account/causality and idempotency originate here; Storage's later observed/persisted/sequence assignments do not become producer time. Original native producer/codec/result preparedness is independently checked before C-stop, without requiring a future event/receipt. Missing exact required provider or known unsupported byte/result route refuses before coupled effects.

C-stop is one joint original Goal-body/host-Stop/Storage transaction. Recheck the entire actual original source and complete unchanged expected body/control/history/Stop preimage, actual scope/binding, original accepted user permission and current owner/installation/access/deletion/backup facts. Increment actual user_stop_epoch and continuation_epoch by exactly one, latch Stop, issue immutable StopReceipt, add CancellationPending to the same BodyControlV2, increment control_epoch and commit the new immutable progress snapshot/head atomically. Preserve body/history bytes and any older ordinary pending reservation exactly. Control's cancellation_pending binds the already frozen SourceAudit and StopIntent; it does not hash the future reserved control, cancellation receipt, event or terminal. StopReceipt binds the original before/after epochs, original StopIntent and actual transaction/time but no after-control hash. This is an accepted Stop effect even before minimal receipt/event/projection publication. No cancellation receipt or success response is exposed from this stage.

Stop priority applies immediately at C-stop: no new Goal continuation or new body mutation may cross its final boundary. A preexisting evaluated continuation with the old epoch is discarded. New evaluation sees both the actual latch and cancellation pending. Host restart, approval, quota/window changes and provider retry cannot clear either. A later additional genuine Stop may advance the actual epochs; it must preserve this original cancellation identity and cannot refresh the operation's captured source or receipt. Existing Pause/Resume/Stop owners retain their rules; no automatic or new schedule route can revive a permanently cancelled Goal. Unrelated scheduled messages remain independently owned and untouched.

If an older SP-287 objective/metadata pending reservation exists, cancellation does not delete, replace, reissue or mark it successful. Its original owner resolves its authentic prior effects. The new Stop fences an uncommitted body attempt; any earlier committed body/event/receipt remains true. The cancellation can proceed only once the exact older reservation is genuinely resolved and cleared through its owner while this cancellation_pending is preserved. The original cancel body's expected revision/currentness and body/history commitments must still match; no target refresh is permitted. A contradiction or unknown old effect keeps this cancellation pending. Genuine changed body before C-stop makes original admission stale and no Stop is written by this operation; after C-stop every other body writer is fenced. Resolution of an older pending slot may change control_epoch/control bytes and is proved by the actual participating original transition chain, not by comparing a stale whole-control hash or trusting a helper's claimed chain.

C-receipt issues one immutable minimal CancellationReceipt under the same shared Goal/Storage fence after the actual StopReceipt and authentic cancellation_pending are established and older ordinary pending is clear. Scope, operation, cancellation_id, original body revision/currentness, SourceAudit, actual original StopReceipt and original accepted occurrence agree. The receipt records user cancellation acceptance and its original durable Stop; it does not assert event issuance, active-view removal, SIR success or Workflow settlement. It contains no future receipt/event/control-publication hash and no text. cancellation_id equals the exact already genuine SourceAudit.normalized_identity.operation_id; its scope is the same Storage/Project/thread/Goal tuple. The cancellation_receipt_ref is the exact existing goal_cancel_receipt:O physical key. Both identifiers are known at original C-source and never allocated anew by C-receipt or replay. accepted_at equals SourceAudit.producer_metadata.occurred_at_utc byte-for-byte, preserving the original accepted cancellation time and spelling; receipt durability time is separate actual progress/transaction evidence. Actual receipt and receipt_committed progress publication are atomic. Later loss or refusal preserves that genuine receipt.

C-owners obtains the actual independently owned effect disposition for this exact execution. No-bound-Plan requires complete actual binding-owner proof, not active_run_ref=null or an empty caller list; it preserves Workflow/run records and asserts none_required only for the Plan coupling specified below. A bound Plan requires its genuine original PlanRun cancellation, Plan Canceled control, exact run-specific schedule/quota invalidation and late-callback fence under PGOAL-007..010 before owners_settled. Goal never writes those bodies, cancels unrelated schedules or manufactures settlement receipts. APR-017, SQR-011, CV-348 and SP-306 supply the exact original bound-Plan producer/query/CAS/result source contracts; GRS-076 and SIR-051 bind their complete C-source/assignment/publication profile before C-stop. Actual original owner installation, full codec admission and current native authority remain mandatory. An already begun genuine owner effect can only be reconciled by that owner, never represented as none_required. Ordinary in-flight run/tool safe-stop obligations remain with their actual owners; this contract supplies no Goal child/tool/write settlement list or blanket workflow cancellation.

C-event freezes ProducerInput from the actual original minimal receipt, SourceAudit and independently authenticated owners_settled progress, with payload revision/currentness equal to the original unchanged body. Cancelled occurrence is the original accepted cancellation time, not append acknowledgement. The exact active-v3 payload references the earlier actual receipt and source; it never contains the future first AppendReceipt, ControlPublication or terminal. Compare and publish the complete immutable producer input by progress CAS; changing current body/time/caller metadata cannot reseal an old event.

Call the actual existing EventRecord/Storage append owner once with that exact original ProducerInput. SP-278 original full-value and SP-286 genuine eleven-field first AppendReceipt, original append result and independently authenticated original full EventRecord commitment all remain mandatory. No EventRecord version, event ID formula, payload digest, sequence lease, corruption hash or first-mint semantics changes. Genuine storage-assigned fields are joined to the actual original assignment; none is generated from latest event bytes. A lost acknowledgement is event_unknown. Resolve only the original shared producer/append custody; absence, time or an equal payload cannot prove no event or mint a replacement. An authentic issued event can be observed before local progress is advanced to event_issued.

C-publish requires the actual issued original event/full-value/first receipt, immutable cancellation/Stop receipts, source and exact current reserved BodyControlV2. The sole shared body owner verifies unchanged body/revision/currentness/history/origin, original cancellation_pending, no ordinary pending, current original scope/permission/deletion/installation and original Stop succession. Atomically set control.cancellation_receipt_ref to the actual minimal receipt, clear only cancellation_pending, increment control_epoch and issue immutable ControlPublication plus control_published progress/head. Preserve body, revision, timestamps, accepted history/origin and actual current Stop row. The final current Stop need not equal a stale snapshot if the actual owner proves a complete monotonic still-latched successor preserving this cancellation; no refreshed original intent or resumed target is accepted. An unrelated helper may not manufacture that succession.

The active Goal projection is the canonical body/control view, so C-publish removes it by that original authenticated control marker. It does not write a second event-derived Goal projection table, invent a terminal body state, delete history or mutate Workflow state. ControlPublication commits original before/after control bytes, original event/receipts, unchanged body facts, real owner settlement and actual transaction/time; the after-control has only the earlier cancellation receipt reference, preventing a self-hash cycle. This control-only receipt is distinct from SP-287 body_mutation_receipt and proves exactly cancellation publication, not a body update. If the thread is deleted first, ordinary content visibility stays hidden; unresolved cancellation remains owned pending/audit, never restores text or bypasses deletion to publish a body.

C-terminal uses the actual original SIR owner. It independently captures full original SourceAudit/nonterminal outcome and immutable selected progress epoch before returning preparers. It prepares the exact GoalCancelResultV2, original CommandOutcomeRecord and UICommandResponse privately; result, outcome, response and new immutable Terminal wrapper publish together through the real SIR/Storage terminal transaction after every source, codec, comparison and final-currentness helper. Full scope/command/instance/operation/dispatch/frame/generation/payload/idempotency/actor/return-route and selected-progress joins are required. Success means genuine minimal receipt, original issued event and original control publication; command outcome is succeeded even though the product action is cancellation. Do not map successful cancellation to an owner-operation cancelled error. Success event_refs contains exactly this original event and result_receipt_ref selects the actual minimal cancellation receipt, not a nonexistent body receipt. Owner_result_schema_ref is the central GoalCancelResultV2 and owner_result_sha256 retains CV-333 RFC8785. Source-owned dispatch/ack times remain actual SIR facts.

SIR terminal_unknown may record original recovery_required with exact separately known Stop/receipt/event/control effects. The immutable selected progress epoch and real original effect refs constrain every claim; unknown means the corresponding actual owner cannot resolve the effect, never an inferred rollback. No_effect is available only before this operation's C-stop and after genuine complete owner proof that THIS cancellation added no Stop/continuation epoch or latch effect, issued no cancellation receipt, performed no owner cancellation/invalidation, appended no event and published no cancellation control. Any preexisting genuine Stop/latch and unrelated owner effects are preserved, including when the target was already paused. Source-audit, source-selection and abandoned assignment/sequence administration are disclosed separately and cannot be represented as zero administrative writes. The original resolver atomically commits the immutable no_effect progress snapshot and its head at epoch 1 only from source_admitted epoch 0; no_effect_proof_ref is that exact prescribed immutable epoch key. Full source identity, operation absence, genuine owner no-effect custody and unchanged relevant original preimages are checked at the original resolution boundary. A missing row, timeout, absent acknowledgement or lost reservation is never a no-effect proof. Once any genuine Stop or later effect exists, no_effect is impossible. A terminal unknown is immutable even if original owner recovery later advances progress; it never becomes a replayed success. A terminal unknown must not itself re-dispatch the cancelled command.

##### Independent final boundaries

Every independently callable stage, source read, owner disposition read, audit/event read, migration/enrollment and backup/restore method captures original participants, actual complete beforeimages (including unrelated rows/resources in its transaction), original source and independently permissible entire output BEFORE its first returning helper. Independently compute the permitted transition, do not use a builder's result as its own expectation. After ALL returning helpers, including the last source resolution, equality, codec, currentness, receipt and copy helper, one final PURE typed predicate compares the full actual current original source/owner/permission/Stop/deletion/registration/installation/backup set and entire candidate with that independent original permitted result. No replaceable helper executes between that predicate and original commit, issuance or passive disclosure. Complete readback precedes dependent release. FinalFence describes this obligation; a serialized object, matching hash, boolean or callback cannot satisfy it.

At a late failure retain exact prior genuine source, Stop, pending reservation, minimal receipt, owner effects, event/first receipt, control publication and original terminal facts. No rollback of Stop or event; no fabricated paused state, failure-to-zero conversion, re-enrollment, replacement command/event/receipt or disposal of original pending to claim completion. Typed terminal issuance unavailable is a truthful state when exact original result encoding/authority is unavailable; native absence is not a new Goal lifecycle state.

###### Actual original SIR error profile

Before source admission, the original SIR owner selects this fixed content-free error projection for the new cancellation carrier. Map GoalError codes to the actual central UICommandError code/reason: invalid_request -> invalid_args / "Goal cancellation request is invalid."; goal_not_found -> invalid_args / "Goal is unavailable."; stale_goal_revision or stale_currentness -> stale_projection / "Goal cancellation target changed."; command_not_registered -> unknown_command / "Goal cancellation command is not registered."; permission_denied -> permission_denied / "Goal cancellation permission denied."; owner_unavailable -> handler_unavailable / "Goal cancellation owner is unavailable."; cancelled (the command itself ended without cancellation effects) -> internal_error / "Goal cancellation command ended before its cancellation effects.". A recovery_required/terminal_unknown response uses internal_error / "Goal cancellation requires original owner recovery.". Offending field is null or an exact original request field name; it never carries a raw value or path. GoalError.evidence_ref is an actual original redacted diagnostic identifier. Result/outcome status joins remain central CV-333; rejected has null result_status, and successful product cancellation is succeeded with null error. Unknown's event_refs contains only actually issued original events; receipt_ref/result_receipt_ref are null for unknown/no-effect, even when an internal minimal receipt exists, so they cannot look like full success.

These fixed literals are a NEW original-issuer profile, not post-hoc sanitization of a previously accepted arbitrary response. A real original response outside it remains outside this permanent carrier; no reserialization, stripping or hash substitutes for exact original replay. Pre-dispatch errors keep their existing central route. No other command's original response is changed.

###### Exact original recovery and currentness

The real installed original Goal/SIR/Storage owners may resolve this same admitted pending operation from their authenticated immutable SourceAudit, actual current progress/head, exact shared cancellation_pending/Stop/receipt custody and original source/root/migration admission after in-place restart. This is explicit recovery of an already admitted source, not reconstruction of the original UI action, deserialization of an owner capability or a new acceptance. Each resumed method still proves its complete applicable original effect and current owner/scope/permission/deletion/Stop/backup facts at final release. It may not silently switch from a revoked in-flight live source to the recovery reader within that same call. Missing/foreign/unadmitted canonical source, destroyed required content or a restored image without genuine original custody remains unavailable. Receipt/event-only audit never needs to reacquire disposed original UI/source-message bodies or old permission/control objects merely to report historical facts.

#### Exact physical and digest contract

All newly declared carriers use the actual selected canonical redb under the original Storage owner, complete registered schema/codec/version graph, original root/migration/backup provenance and joint final owner fence. No standalone JSON, handle spelling or matching map enrolls a family. Every family below is canonical, non-rebuildable and mandatory-backup. Retention policy versions are 1.0.0; no new policy ID/lifetime is introduced.

Let k(x) be lowercase hexadecimal of the exact scalar UTF-8 bytes of a nonempty original ID, with no normalization. O = k(storage_instance_id):k(project_id):k(thread_id):k(goal_id):k(operation_id). G is the same tuple without operation_id. Each key and complete inner scope must agree with actual owner/root and original source. No prefix-only authorization or guessed ID resolution.

| Family | Exact key | Current closed wrapper | Existing policy |
|---|---|---|---|
| goal_cancel_source_audit | goal_cancel_source_audit:O | StorageSourceAudit | RP-AUTHORITY-INDEFINITE |
| goal_host_stop_control | goal_host_stop_control:G | StorageStopControl | RP-GOAL-THREAD-LIFETIME |
| goal_cancel_stop_receipt | goal_cancel_stop_receipt:O | StorageStopReceipt | RP-AUTHORITY-INDEFINITE |
| goal_cancel_receipt | goal_cancel_receipt:O | StorageCancellationReceipt | RP-AUTHORITY-INDEFINITE |
| goal_cancel_progress | goal_cancel_progress:O:head OR goal_cancel_progress:O:epoch:N | StorageProgress, whose record is respectively ProgressHead OR Progress | RP-AUTHORITY-INDEFINITE |
| goal_cancel_control_publication | goal_cancel_control_publication:O | StorageControlPublication | RP-AUTHORITY-INDEFINITE |
| goal_cancel_terminal_audit | goal_cancel_terminal_audit:O | StorageTerminal | RP-AUTHORITY-INDEFINITE |
| existing goal_body_control | unchanged SP-287 key | NEW StorageBodyControlV2, preserves complete old v1 route | unchanged RP-GOAL-THREAD-LIFETIME |

N is the exact canonical nonnegative decimal epoch, no leading zero except 0. Epoch rows are immutable; head CAS increments progress_epoch by one and commits exactly one new snapshot plus head in the same actual stage transaction. Head's snapshot_sha256 is SHA-256 of the complete outer immutable snapshot bytes and its identity/epoch/key equal that snapshot. The head key cannot admit Progress and epoch keys cannot admit ProgressHead. Terminal selects its exact original immutable epoch/key/hash at original staging; later head progress never changes that old selection. All mandatory selected old snapshots remain retained. Hash-only lookup, current-head fallback and reconstruction from terminal partial fields are forbidden.

Stop control has exactly one original current row per Goal and shares the true host epoch; its content-free immutable cancellation Stop receipts are independent audit. It is not a generic replacement schedule/PlanRun state store. A fresh host-stop row originates only with genuine SP-287 Goal creation or explicit actual owner migration of the prior epoch; no ordinary reader/cancel/Stop installs missing zero authority. Existing non-cancel Stop/Pause/Resume/run-binding writers participate under their real owner, preserving original existing semantics and using their own actual original transition refs. Their unsupported exact adapters remain disabled; this contract does not invent their public commands or substitute a cancellation receipt for their original result.

##### Exact local bytes

New local qualification pm.goal.cancel_command_json.v1 adopts the unchanged GRS-064 pm.goal.canonical_json.v1 encoder, not an invented JCS implementation. Exact UTF-8 JSON has ASCII object property names sorted ascending, compact comma/colon separators, no whitespace, BOM or terminal LF, and exact original array order. Quote/backslash use escapes; backspace/formfeed/LF/CR/tab use their JSON short escapes; other U+0000..001F use lowercase four-hex-digit escapes. Other Unicode scalars remain literal UTF-8. Do not normalize, trim or case-fold strings. Booleans/null use lowercase literals; integers use exact mathematical canonical decimal with no leading zero, plus, fraction, exponent, negative zero, binary64 rounding or new fixed-width ceiling. Reject duplicates, unknown properties, malformed UTF-8, surrogates, non-integers and any decode/re-encode byte difference. Schema domains remain mandatory. This is a new local qualification of existing json_canonical, not a change to EventRecord MessagePack or CV-333 RFC8785.

Unless explicitly identified otherwise below, *_sha256 for a selected stored row means lowercase SHA-256 of its COMPLETE actual outer canonical wrapper bytes, including schema_id, schema_version and record; no prefix or omitted field. Bytes.sha256 is SHA-256 of the actual complete bytes selected by opaque_ref with exact byte_length, not a hash of the containing Bytes object. Revalidate actual source identity/bytes independently.

| Slot | Exact preimage |
|---|---|
| SourceAudit original body_outer_sha256/control_outer_sha256/stop_control_sha256 and every selected physical before/after/progress/source/receipt/publication/terminal hash | Complete actual original selected outer canonical bytes, with their actual codec/version; do not relabel old v1 bytes as v2. |
| BodySelection.body_semantic_sha256 and unchanged body in CancellationPending/ControlPublication | Complete original semantic body canonical JSON including currentness_hash, under unchanged GRS-064; not its wrapper. |
| currentness_hash/latest_revision_hash | Existing GRS-064 domain-separated original semantic recipes unchanged. |
| complete_history_origin_inventory_sha256 | SHA-256 of local canonical JSON of complete ordered list of closed {revision_key,revision_outer_sha256,origin_key,origin_outer_sha256}; sort by numeric accepted ordinary revision ascending, verify each exact key/revision and one genuine origin. Include all actual accepted entries, not metadata gaps or only the head; no body text copy. |
| StopIntent hash stored in cancellation pending/StopReceipt | SHA-256(UTF8(pm.goal.cancel.stop_intent.v1) + one actual LF byte + local canonical JSON of complete closed StopIntent), all fields included. No own/future receipt/control hash. |
| reservation_sha256 in progress | Complete local canonical JSON of the exact CancellationPending object, SHA-256 without prefix; its parent control is separately checked/hash committed where required. |
| source_audit_sha256 | Complete StorageSourceAudit outer bytes; source row cannot contain this own hash. |
| Original owner binding/scope/settlement/receipt refs | Exact actual original owner-declared complete byte domain; that original schema/codec is independently verified. No automatic new JSON or RFC8785 preimage by suffix. |
| owner_result_sha256 | Existing CV-333 RFC8785 of the complete authentic GoalCancelResultV2; new local arbitrary-precision JSON is NOT RFC8785. |
| EventRecord payload/producer/idempotency/event identity/full-value/first AppendReceipt | Unchanged exact original EventRecord/SP-278/SP-286/CV-339 owner domains; no new Goal-local rehash or conversion. |

The two new domain-specific values StopIntent and CancellationPending are complete closed types and have no self-hash. SourceAudit precedes StopIntent/StopReceipt/reservation; the StopReceipt's after-epoch values do not commit after-StopControl, which may therefore reference that receipt without a cycle. CancellationReceipt precedes EventRecord; ControlPublication follows both and hashes after-control containing only the earlier receipt reference. Terminal selects earlier immutable progress and cannot enter a hash it contains. No future acknowledgement, receipt or final hash is hidden in an allegedly original admission ref.

New durable JSON can represent arbitrary original integer epochs/revisions, but the separately required original EventRecord and CV-333 routes retain their own exact domains. Before C-stop, authentic installed codec owners must prove the complete known source/next epoch/payload and all permitted later result assignments are exactly representable. Actual Storage append/lease ownership must bound all possible assigned sequence/offset/receipt fields where this is required; a current small sample, caller estimate, string tag or boolean is not that proof. Missing exact provider binding is recorded as a normative dependency; no new canonical numeric cap. Late codec inability preserves all original actual effects and pending custody with terminal issuance unavailable; never round, clamp, stringify numbers, omit committed fields or fabricate recovery_required that the original result codec cannot represent.

##### Lifetime and original backup

SourceAudit/request/StopReceipt/cancellation receipt/progress/publication/terminal are content-free original cancellation authority and use the same RP-AUTHORITY-INDEFINITE policy as the exact event and analogous original command audit. All retained string refs/IDs are actual owner-issued redacted identifiers, never raw user text, URLs/paths, title, objective, prompt or copied Workflow content. A user-bearing unsupported original variant cannot enter this profile by hashing, stripping or rewriting it after acceptance. Canonical source bodies retain their own lifetimes; a ref creates no hold or reconstruction right.

Host Stop and shared body control use existing exact Goal/thread lifetime: archive retains, compaction/restart/model change does not purge, deletion immediately hides and enforces existing 24-hour active/30-day backup purge bounds unless a valid owner hold delays bytes. Holds do not restore ordinary visibility. Cancellation alone does not delete the thread or its objective/history. Preterminal control purge has no new indefinite recovery exemption; durable audit may prove original effects while missing body/control makes remaining mutation unavailable. A completed cancellation's indefinite receipt can be audited without reacquiring a deleted control/body; it cannot recreate either or continue that Goal.

Backup capture includes the actual complete stop/control/body/history/origin unit while retained plus every immutable source/progress epoch/head/Stop receipt/minimal receipt/publication/terminal, exact original SIR members and mandatory original shared EventRecord/full-value/first receipt through their respective real backup owners. An opaque dependency list is not capture. Preserve prior pending owner custody too. Atomic capture means one actual coherent owner-bound snapshot across all participants, or the original qualified backup owner must reject. Capture/restore final guards include all current original source/physical/owner/deletion/hold facts after helpers. Restore requires real Storage coordinator/selected original root/protected image admission, restores complete custody without regressing newer actual Stop/progress/terminal, applies current tombstones before content release and fences lost required dependencies. A prior image missing newly enrolled families is not a valid coherent current image. Same-owner in-place restart, actual confirmed rollback, fresh-root migration and withdrawal stay distinct; this contract does not grant new restore authority.

##### Exact current event inspection

NEW storage.goal_cancelled.inspect_current.v1 is a passive single-member SP-278 consumer, distinct from Goal-created/update bindings. For originally accepted Workflow V3 operations, GRS-081/SIR-053/SP-313 select the explicit private owner.goal.workflow_cancel.inspect_current_event.v2 and its complete private source reader while preserving this original Storage observation binding. Original no-association and bound Plan V2 operations keep their complete existing routes. It accepts the exact actual Storage/project/thread/Goal/event/global sequence/full canonical index key, complete current ten-field read_token and thirteen-field source_selection. No paging cursor, hidden scan, best-effort prefix, numeric cut or search-by-hash exists. The actual Storage reader independently resolves the full original EventRecord from the token's genuine current selected root/node/dataset/families and all complete source frames. It validates the complete index row/value/key, covered source interval, checkpoint anchor versus later frontier, exact original event/first receipt/full-value custody and full current source selection. Copying a token or a SourceAudit does not confer source authority. Full schema/role/codec graph installation and actual selected original owner provenance are required.

Active v3 validates the entire exact payload and original envelope, then derives exact original audit/receipt keys only from the verified original scope/operation/cancellation identity. Authenticate actual complete SourceAudit, immutable frozen ProducerInput, original minimal cancellation receipt and original Stop receipt, all actual header/payload/occurrence/revision/currentness/operation/source joins, and the genuine shared full-value/eleven-field first receipt. Original event may already be issued while local progress is event_ready or event_unknown; authentic original append evidence and original frozen input prove it without inventing local event_issued or terminal success. Later original progress may be event_issued/control_published; immutable original source/input/receipt comparisons stay identical. Contradictory no_effect or missing original input is unavailable, never repaired from matching current EventRecord bytes.

Whole v2 is the exact embedded original complete resource, not a field subset, alias, version-only check or active payload with old fields. It preserves historical D-R02 cancellation-state/settlement meaning solely for historical interpretation. It cannot create a fifth current Goal state, manufacture a current minimal receipt or overwrite current body/control. Historical original full-value and required receipt/custody must be independently authenticated under the actual admitted old route; missing historical evidence is unavailable, with no minted v3 receipt or retrofit source.

Successful observation has only event_id, sequence_id, payload_version, Project/thread/Goal, original revision and occurrence plus kind/action_authority=none. For v2 revision is original goal_revision and payload_version identifies the selected whole-v2 route; do not treat its actual schema_version spelling as '2.0.0' or rewrite it. For v3 revision is its original unchanged revision. No objective, old child/settlement payload, body, account identity or dereferenced source content is exposed. A typed unavailable result discloses no partial authoritative observation.

Before each read's first returning helper, capture the complete original request, resource bytes/role, actual index/source/receipt/audit/owner expectations and independently permitted whole result. After every helper, including the final currentness/resource/codec/audit resolver, one pure full typed/source/current-owner predicate runs with no replaceable helper gap to atomic observation/error disclosure. It covers complete candidate, original bytes and genuine current source selection; an unchanged invalid original is still invalid. Audit-member read uses its own actual source/audit boundary without a current EventRecord source, and current body/history use their independently owned content boundary. Native unsupported roles are unavailable, not simulated by schemas.

##### Effects and checkpoints

This NEW event inspector and existing canonical Activity/body/history read produce no durable effect and need no checkpoint, by explicit owner assignment for this passive current/historical observation only. They neither own a projector nor process an event into cancellation control. The durable cancellation effects are original C-stop, C-receipt, independently owned execution disposition, original append/first receipt, C-publish and C-terminal at their actual writers. Current Activity removal is a view of C-publish's canonical control marker. A view refresh, event observation, UI cursor or transport replay is not an execution checkpoint.

SP-214's older Goal projection/child/evidence/GoalRun projector requirements keep their versioned original owner and cannot be borrowed for this current route. A separately requested durable consumer, historical projector, notification or another event needs its own exact original source/effect/checkpoint contract. No family-wide none_required or end-to-end depth/native readiness follows.

The complete method contract is `Plans/goal_cancel_contracts/methods.json`. Its independently callable entry and final boundary predicates apply to each named method. The exact complete schema graph is CV-347, including current v2 shared control for every original Start/Update/metadata/approval/Stop/continuation/body-history/coordinator/backup participant. Existing Start/Update requests, semantic 11/9/7 bodies and original receipts retain their complete schemas. Fresh current control and actual host Stop originate in the genuine shared birth; a reader never initializes absent authority. For retained old v1 control, select the whole old physical schema only with its original admitted owner route; explicit coordinator migration must prove original Stop/cancellation/binding/pending inventory before adding null cancellation_pending. An unsupported old source is fenced.

SP-214's historical cancelled-v2 event projection and checkpoints apply only to the admitted old route; they do not define a current cancelled state or a current durable projector. SP-305 supersedes only the generic execution-association/possible-assignment dependencies in these stages. Every other remaining source integration is explicit there.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-073, ContractName:Plans/storage-plan.md#SP-304, ContractName:Plans/Contracts_V0.md#CV-347, ContractName:Plans/storage-plan.md#SP-305

### SP-305 - Execution binding custody and original append reservation

```yaml
plan_unit_id: SP-305
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Own nine exact execution writer-domain/binding/origin/selection/assignment families, complete
  arbitrary-precision local bytes and current versus retained source reads. Genuine acknowledged original SIR
  source precedes the original append owner's exclusive assignment reservation. Full original finite EventRecord/SIR/MessagePack
  domain proof precedes Stop, while consumed reservations yield to actual original append evidence for later
  control and terminal publication.
gui_related: false
gui_classification_reason: Defines original owner, schema, storage or verification contracts.
split_recommended: false
depends_on:
- GRS-074
- SP-304
- SP-287
- DL-045
unblocks: []
acceptance_criteria:
- Original writer-domain epoch and head are complete, authenticated and exhaustive across every affecting writer;
  registration changes revoke old live selections.
- All nine actual canonical redb values validate their complete wrapper, selected store/key/inner identity,
  exact original codec and native source origin.
- SIR acknowledgement commits before exclusive original append selection/rotation/sequence reservation; reservation
  never serves as an AppendReceipt.
- The real 4096-ID lease, 48-byte prefix, 4096-byte header and 16777216-byte payload domain are preserved;
  no Goal revision bound or codec substitution is introduced.
- New append requires the unused live original capability; later control/terminal uses genuine original append
  and admitted assignment evidence after consumption.
- Missing Plan/Workflow effect CAS/settlement or unsupported prior representation refuses the affected route
  before Stop; loss after genuine effects cannot manufacture no-effect.
validation_surfaces:
- Plans/goal_cancel_command_custody.schema.json
- Plans/goal_execution_binding_custody.schema.json
- Plans/goal_cancel_schema_resources.json
- python3 scripts/pm-plan-index.py validate
risk_class: goal_cancellation_original_authority_or_effect_loss
reasoning_tier: high
context_scope: sp-305_original_cancel_contract
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-047
negative_constraints:
- No fifth Goal state, objective/body revision mutation, child/tool settlement list, new command or peer handler.
- No raw Goal content in indefinite audit, new retention limit, silent codec substitution or fabricated original
  receipt.
- No native execution proof, full event-depth verdict, WorkNode/readiness admission or governance seal.
```

##### Concrete codec and possible-assignment custody

The unchanged Goal JSON domain remains arbitrary precision. The current EventRecord semantic producer digest and CV-333 owner-result hash still use their original RFC8785 contracts; the full EventRecord uses Case L-2 MessagePack. This contract neither silently substitutes Goal JSON for those hashes nor imposes a new Goal revision/Stop-epoch limit. A valid Goal source that the selected existing codec route cannot preserve is `unsupported_existing_codec_route`, not invalid Goal input, corrupt state or permission failure. A broader route requires explicit owner-qualified codec/profile integration, outside this contract and without automatic Step 9 admission.

`owner.storage.goal_cancel.reserve_assignment.v1` is a new technical participant inside the actual original append/sequence/rotation owner. After C-source, the genuine original SIR acknowledgement and its committed readback, but before C-stop, it reads the genuine `storage/seglog/CURRENT`, `storage/seglog/manifest.v1.msgpack` and `seglog_sequence_allocator.v1:{storage_instance_id}` through the unchanged native current/manifest/sequence_lease_control schemas. It independently verifies the actual live selection, active sink origin/bytes/end, all original pending group members and genuine 4096-ID lease. It acquires an actual nonserializable exclusive append/rotation/selection fence, obtains one never-reused next sequence from the actual original lease, and reserves that selected sink position for this same original operation. Any required prior genuine group flush uses only its original shared owner and is preserved as prior work. This contract does not reset an allocator, create an alternative sequence source, rewrite CURRENT, run compaction, or treat a reservation as an AppendReceipt.

The reservation fixes the actual `reserved_sequence_id`, selected segment generation/name/physical identity, selected manifest generation and original append offset. All competing append, rotation, recovery-selection and maintenance writers honor the actual original fence until append or abandonment. Existing manual Stop is not blocked: it remains a separate higher-priority Goal/host effect. A serialized reservation/fence ID or restored audit is not the actual lock or native boot session. Crash or lost native fence invalidates the unconsumed reservation; the already allocated sequence remains an original abandoned-lease gap under its real owner, never reused. Releasing the fence to resolve another original operation also invalidates this reservation. No old witness authorizes a new assignment. This is a bounded in-process append preparation route, not a claim of arbitrary crash-resumable reserved slots.

The complete eight-field original header is fixed by original producer identity; compute its exact canonical MessagePack length h and require the existing h <= 4096. Existing Case L-2 full-payload cap is 16,777,216 bytes. The reservation's full conservative admitted domains are:

- Event value length: every integer 1 through 16,777,216.
- Frame length: every integer 48+h+1 through 48+h+16,777,216.
- First receipt durable_end_offset: every integer b+48+h+1 through b+48+h+16,777,216, where b is the actual reserved byte offset.
- Sequence, segment generation, manifest generation and byte_offset: the exact reserved singleton values.

These are existing physical frame limits, not new product bounds. Checked uint64 arithmetic must succeed for the whole interval. The intervals deliberately cover every potentially admitted full frame, including future original timestamp spellings; a currently small packet is not the proof. A later over-cap payload remains an original representation refusal before append, preserving any genuine Stop. At the original append boundary the actual event bytes, exact frame length, original singleton assignments and real first receipt must belong to this admitted domain. The reserved append owns a single-event barrier group ending at this frame, using the original shared barrier/first-receipt authority; unrelated original groups are not reissued or included as this command's evidence.

`AssignmentAudit` is immutable original administrative evidence, committed by the original append/Goal/SIR owners while the genuine reservation is held. It records every exact source selector, source audit and binding selection, complete recursive event encoding term tree, every numeric path/domain, codec/resource identity, initial control epoch, actual older-pending disposition bound and original issuer. The encoding tree is a closed template, not a fake EventRecord. All fixed scalar/array/map members come from the actual original producer and source. cancellation_id is the already genuine normalized operation_id, cancellation_receipt_ref is the exact scoped goal_cancel_receipt:O key, and payload.cancelled_at_utc plus receipt.accepted_at preserve SourceAudit.producer_metadata.occurred_at_utc byte-for-byte. These are source literals before Stop, never future allocator or timestamp substitutions. Only the future original cancellation-receipt SHA-256 and actual Storage observed/persisted timestamps are variable; duplicate map keys or omitted envelope/payload fields reject. Future hash has its exact 64-byte lowercase hex language; future timestamps preserve their original spelling/precision and schema. No placeholder is published as data.

Original Goal owns the finite post-Stop control domain for this route: C-stop adds one to the captured control epoch; at most the one already-existing ordinary pending reservation may subsequently resolve once; C-publish adds one. That old owner must prove its complete original resolution transition and unchanged body. Additional genuine host Stops can advance actual Stop epochs, but cannot rewrite this cancellation's receipt/intent or mutate its BodyControlV2; new body/association writers remain fenced. Any other required control transition is outside this selected assignment proof, preserving Stop and pending rather than guessing a new epoch. Original cancellation receipt uses the already fixed first Stop epoch, never the latest extra Stop epoch. Progress uses one exact immutable transition graph. source_admitted is epoch 0. A genuinely proved pre-Stop no_effect may terminate it at epoch 1. Otherwise stop_reserved is epoch 1, receipt_committed 2, owners_settled 3 and event_ready 4. Direct original acknowledgement yields event_issued 5 and control_published 6. If an actual original append outcome is unresolved, event_ready 4 may instead commit event_unknown 5; subsequent original shared-custody resolution may yield event_issued 6 and control_published 7. Duplicate unresolved observations and retries retain the already issued snapshot; they create no extra epoch, new append identity or mutable epoch row. A late first unknown observation cannot regress an issued/publication stage. Every real phase transition atomically advances the head by exactly one and writes one absent immutable epoch key, preserving all already genuine members. The complete admitted progress domain is [0,1,2,3,4,5,6,7], with phase/epoch/path joins enforced by the original stage owner. Terminal selects an existing immutable epoch and does not manufacture one. The whole primitive path-domain inventory covers success, no-effect and recovery-required results, original CommandOutcomeRecord and UICommandResponse, including all fixed original SIR integer fields and every nested receipt/control integer.

The actual SIR owner also supplies its already genuine acknowledged/executing CommandOutcomeRecord and original acknowledgement receipt before codec admission. AssignmentAudit binds that complete original acknowledged source, including the exact acknowledgement frame offset, dispatch identity and generations. If C-source captured accepted before acknowledgement, the actual SIR owner performs its normal original acknowledgement and completes its durable readback BEFORE the append owner acquires the exclusive cancellation reservation; the selected later source must preserve that same original dispatch and normalized identity. This order lets the acknowledgement use its own actual append authority without waiting on a reservation held for the later cancellation event. No cancellation helper invents an acknowledgement or assumes offset zero. Once captured, terminal publication preserves these actual original acknowledgement fields. Thus acknowledgement_frame_offset is a proved singleton, not an omitted future allocation. Missing genuine acknowledgement leaves this codec route unprepared before C-stop.

`owner.sir.goal_cancel.admit_codec_domain.v1` independently derives those complete domains from actual original source and reservation before returning codecs/builders. For each original numeric value and every integer in each admitted interval that enters the producer-semantic or GoalCancelResult hash projection, RFC8785 must preserve the original exact mathematical value and primitive type. The full EventRecord independently uses unchanged MessagePack. CommandOutcomeRecord and UICommandResponse are not themselves a new RFC8785 hash projection: their exact retained typed components use the already declared cancellation Goal-JSON carrier, and original SIR transport must preserve those same complete typed values. No JCS restriction is inferred for a number merely because it occurs in an outcome/response rather than in the owner result. Do not merely check that a floating-point conversion is finite or that two rounded values compare equal: parse the produced decimal exactly and compare with the original integer. Verify the entire strings/arrays/objects against the genuine installed codec and closed result/response resources as well. MessagePack must independently preserve its entire applicable exact integer/type domain. Domains may be checked with exact interval arithmetic and the codec's actual mathematical representability predicate; no allocation proportional to a large span is required. A numeric path omitted from the complete expanded schema/branch inventory rejects. The inherited Goal/source JSON hash is separately verified with arbitrary-precision exact decimal bytes.

The original append boundary repeats the full domain/resource/source/candidate checks after all returning helpers and requires the genuine currently held UNUSED reservation and native fence. Once the actual append consumes that reservation, later control and SIR terminal publication authenticate its exact genuine original EventRecord, four-field result, eleven-field first receipt and complete full-value custody, including original operation, assignments and their membership in the already admitted domains; they do not require an unused reservation or an indefinitely held append lock. Original SIR terminal publication always repeats its complete applicable source/owner/resource/domain/effect and whole candidate checks after all helpers. Terminal-only recovery may disclose an authentic immutable result for already proved effects or unresolved disposition after reservation loss, if its exact original result codec and SIR authority permit it; neither an unused reservation nor an audit object proves an effect. The actual singletons and interval results may not be widened or refreshed after C-stop. An unused reservation lost before append forbids a new append under it; a missing or consumed reservation never proves that no append occurred. A changed receipt/control/result, out-of-domain old pending resolution or unavailable required codec refuses the affected new event or terminal publication while preserving every prior genuine effect. A representable original recovery-required result may be issued only through its full original SIR predicate; otherwise terminal issuance remains unavailable. No unsupported number is rounded, clamped, stringified or stripped. A fresh native recovery/assignment profile could be separately bound later; this one does not borrow authority from the surviving audit.

##### Every original entry and final boundary

The exact method/family matrix is Plans/goal_cancel_contracts/execution-methods.json. The complete integer path inventory and source derivations are Plans/goal_cancel_contracts/numeric-paths.json; no_bound_plan Plan-version paths remain null, bound_plan paths are the exact nonnull positive integer singleton from the authentic original binding under the unchanged original CV-333 whole-result codec, and full EventRecord adds its separately reserved sequence singleton. Before the first returning helper, each independently callable installer, creator, association reserving/committing/transferring/migrating/restoring/deleting method, current/audit reader, selection issuer, assignment reservation issuer, domain validator and original append/terminal publisher independently captures complete actual original participant/root/registration/owner/operation/source preimages and the entire permitted output. This includes unrelated existing members that its transaction must preserve. A supplied BindingRevision, Selection, EncodingTerm, AssignmentAudit or builder result is not that independent expectation.

After ALL parsers, schema validators, hash/codec functions, membership builders, copies, currentness checks and source resolvers return, one final pure predicate compares the complete actual native source/permission/Stop/cancellation/registration/root/backup/owner/lease set and every pending candidate byte with the independently derived permitted result. Actual whole control/head CAS, immutable-key absence, pending identity and all old preserved members participate. No returning helper occurs between this predicate and original commit/append/disclosure. Readback verifies complete actual committed values before dependent publication. An outer check after an incorrect original effect is insufficient. Third-state or changed guards fence; they do not roll back an earlier Stop, receipt, original event, control publication, SIR result or unrelated genuine effect.

##### Exact remaining scope

Bound Plan routes retain PGOAL-007..010: original PlanRun cancellation, Plan Canceled control, exact run-specific schedules/quota consent invalidation and late-callback fencing, without cancelling unrelated thread messages. APR-017, SQR-011, CV-348 and SP-306 supply their complete original effect/CAS/settlement source contracts, with GRS-076 and SIR-051 providing exact bound C-source/assignment/publication admission. Genuine current native owner/effect/codec authority remains independently required. Workflow-specific disposition is likewise not inferred from no AssistantPlan binding. Unsupported prior Stop representations and pre-enrollment binding mappings require exact original migration evidence; neither is zero-initialized. No new product lifecycle or retention selection was made. This is Step 8 contract work for an already registered event. Native installation and full depth remain unproved; the distinct Step 9 campaign is untouched.

#### Exact source bytes, keys, codecs and retention

The nine new physical family assignments are Plans/goal_cancel_contracts/execution-physical-families.json. All are canonical non-rebuildable original custody with mandatory coherent backup. No new public command, runtime instance, TTL or retention policy is created. The cancellation and shared control schemas retain their exact declared definitions.

`k(x)` is lowercase hex of the complete original Unicode-scalar UTF-8 bytes of nonempty x, without normalization. `G=k(storage_instance_id):k(project_id):k(thread_id):k(goal_id)`. `O=G:k(operation_id)`. Integer key components are exact nonnegative canonical decimal, no leading zeros except 0; writer domain generations begin at 1. Keys use the exact fixed family prefixes/version/separators in the family manifest. No omitted namespace, prefix inference, key alias or case folding is allowed. The Plan binding key ends with k(plan_run_id); its Goal and run IDs equal the complete original seven-field value.

Every new outer value has exactly schema_id, schema_version, storage_instance_id, physical_key and record. The actual selected Storage instance/key/version and inner identity must agree. All nine use the predecessor's fully specified `pm.goal.cancel_command_json.v1`, the existing GRS-064 arbitrary-precision Goal JSON qualification: sorted ASCII object keys, exact scalar UTF-8, original array order, compact separators, exact decimal integers, original short/control escapes, no normalization or final LF, duplicate/unknown fields and surrogate/noninteger rejection, exact decode/re-encode equality. This does not change canonical MessagePack, RFC8785 or old v1 bytes.

Unless explicitly stated otherwise, every physical selection SHA-256 is the lowercase SHA-256 of the entire actual outer value bytes, including key/schema/version/record. BindingOrigin.issued_revision_sha256 names the complete issued revision wrapper, not a semantic-only digest. Before/after control and Goal/Stop hashes name complete actual original outer values using their actual original codecs. BindingPending's original pending candidate SHA-256 is the hash of complete local canonical JSON of that BindingRevision semantic object, because it is not yet a physical issued revision. The same exact semantic hash is used in BindingSelection and BindingPendingResolution for that original candidate. No self/future result hash is substituted.

##### Full nonphysical preimages

All four preimage types below are closed in goal_execution_binding_custody.schema.json. Hash inputs contain every field of the named object. UTF8(domain) + LF means the exact named ASCII domain bytes followed by one byte 0x0a, not two characters backslash-n.

| Commitment | Exact recipe |
|---|---|
| WriterDomain.complete_original_dispatch_registration_sha256 | SHA256(local JSON of complete DispatchCommitmentInput). Its domain field is pm.goal.execution_dispatch.v1, and it includes actual storage/root plus every NativeWriterDescriptor. Sort by operation in the seven-category order, then exact UTF-8 native_handler_id. No omitted disabled implementation or actual writer. Descriptor family/schema lists are unique UTF-8 sorted. |
| WriterDomain.schema_resources_sha256 and identical registration resource-closure slots | SHA256(local JSON of complete ResourceCommitmentInput), including domain pm.goal.execution_resources.v1 and every exact reachable resource's schema/version/full original resource hash/codec/full codec-contract hash/original registration ref. Sort unique resources by UTF-8 schema_id then version. External and embedded original resources are independently resolved; the complete owning original document bytes determine complete_resource_sha256, not a reserialized fragment. |
| AssignmentAudit.complete_original_input_commitment | SHA256(UTF8(pm.goal.cancel.assignment_input.v1) + LF + local JSON of complete AssignmentInput). AssignmentInput has exactly all AssignmentAudit source/reservation/template/domain/control/progress/codec fields, excluding the later OriginalTransaction issuer and the commitment itself. These are separate fields of the issued audit, not omitted input members. |
| AssignmentAdmission.full_domain_sha256 | SHA256(UTF8(pm.goal.cancel.assignment_domain.v1) + LF + local JSON of complete DomainCommitmentInput). This includes the complete selected AssignmentAudit physical selector, complete numeric path-domain inventory, complete codec-resource list and complete encoding term tree. |

Method-contract and codec/resource hashes are SHA256 of complete actual original resource bytes named by their registered identity. Complete original active-sink SHA-256 hashes every byte from its original start to the actual captured append end, including any genuine prior frames; it is not just the last frame or watermark. CURRENT/manifest/sequence allocator hashes use their complete unchanged canonical MessagePack bytes and true native resource owners. A caller-held digest proves none of those bytes or permissions by itself.

`IntegerDomain` is the exact inclusive arithmetic progression minimum, minimum+step, ... maximum; require minimum<=maximum and (maximum-minimum) divisible by step. Reservation singletons have minimum=maximum, step=1. The complete offset/frame domains use step=1 and the exact existing Case L-2 formulas in the protocol. They are conservative complete domains of admitted assignments, not a claim that every interval member is a valid EventRecord. NumericPathDomain entries are unique and sorted by target, schema_branch, then exact UTF-8 JSON pointer. All nested integers in all actual branches are covered; optional/null branches are explicitly separated. Fixed source values appear as singleton domains. Nullable numeric absence remains null, never 0. Exact JCS admissibility is evaluated over every member by a sound exact arithmetic method, without enumerating unbounded integer spans or introducing a new Goal limit.

The event encoding term tree includes the complete original EventRecord shape, not only the event payload or producer digest. TemplateMap members use original UTF-8 key order and no duplicates. Literal integer values preserve exact mathematical values and primitive types. The two future timestamp slots represent only actual Storage observation and Storage persistence. The original accepted cancellation time is already fixed at C-source: receipt.accepted_at and payload.cancelled_at_utc equal SourceAudit.producer_metadata.occurred_at_utc byte-for-byte. cancellation_id equals its genuine normalized operation_id, and the receipt ref is the exact scoped goal_cancel_receipt:O key; all three are literal template values. No future timestamp is predicted, reformatted or fixed-width truncated. Only cancellation_receipt_sha256 may use the runtime-hash term. All other strings, including actual original source audit SHA-256 and producer identity, are fixed before assignment admission. Hash terms/timestamp terms cannot occur at unrelated fields. Schema validation of a term tree is insufficient: the original owner independently checks the full expanded EventRecord and actual eventual substitutions.

##### Retention by actual carrier meaning

The actual existing RP-AUTHORITY-INDEFINITE@1.0.0 policy has creation anchor, indefinite retention, no TTL/count/byte eviction, hold eligibility, fail-closed overflow and no expiry. Existing goal_runtime_lineage_record already retains content-free Goal/run/Plan identity, owner epochs and source/currentness/recovery refs under that policy. Existing original command/cancellation audit likewise retains content-free accepted source and original result evidence. The new immutable binding revision/origin and seven-field Plan binding carry precisely that identity/lineage class: no objective, Plan text, To-Do body, provider bytes, workspace content or raw diagnostic. BindingSelection and pending-resolution receipt carry only original command/scope/commitment/disposition facts. They therefore receive the existing lineage/command audit policy explicitly, without using a source ref to retain the referenced bodies.

WriterDomain/head contain only registered role/owner/resource identities, generations and hash commitments needed to authenticate those retained original lineage records; no native pointer, credential, path, binary, configuration body or source document is copied. These are original authority metadata under the same existing class. AssignmentAudit contains this cancellation's fixed content-free producer envelope/template, source commitments, native physical identities/numbers and codec/assignment evidence. Its template contains no Objective or source-message text and only the predecessor's already selected content-free command/error profile. Variable terms are definitions, not copied runtime content. Its original record is retained with cancellation authority; it does not keep a native lock alive. An unsupported source bearing raw user/diagnostic/provider/path content cannot be sanitized after acceptance to enter these permanent carriers.

BindingControl is live per-Goal association/pending control, and explicitly follows existing RP-GOAL-THREAD-LIFETIME@1.0.0 with Goal/Stop/body control: archive retains, deletion hides immediately, active bytes purge within the existing 24 hours and deleted backups within 30 days unless an original hold delays physical purge. A hold does not restore visibility. Missing purged control cannot prove current absence or be reconstructed from indefinite revisions. Cancellation is not chat deletion and does not itself dispose this source.

All referenced Plans, To-Dos, Workflow records, actual Goal text/history, original SIR sources and Seglog bytes retain their independent existing owners/policies. A retained selector/hash creates no hold and cannot reconstruct disposed content. The immutable binding metadata may remain historically auditable after content deletion but cannot re-enable the Goal. The original borrowed append lock is process-owned, not persistent authority. Restore or restart never recreates it from AssignmentAudit.

##### Original backup, restore and deletion boundaries

Actual coherent backup includes the current WriterDomain/head, each retained original binding control/revision/origin/Plan binding/pending resolution, every cancellation selection/assignment audit, and the unchanged Goal/Stop/cancellation/SIR/shared-event dependencies while retained. Original backup owners capture actual complete values and all required old pending custody in one coherent fence. A foreign copy, table prefix, missing new family or restored role string is not enrollment. Original coordinator restore applies genuine current deletion tombstones before exposure, preserves current owner/Stop/domain fencing and immutable original records, and never regresses a more recent binding head or recreates an abandoned append capability.

`owner.goal.execution_binding.delete_content.v1` disposes only eligible BindingControl through the original thread deletion/hold owner at its final held boundary. It does not delete immutable lineage/audit, erase a bound Plan obligation, mutate the Plan, clear Stop or infer a new no-bound state. Any required separately owned current Plan/run source remains governed by its owner; body/control loss makes this cancellation path unavailable rather than free of obligations. Existing-binding migration and prior Stop representation mapping require their exact original source admission separately; no missing source is repaired into an empty source.

#### Successor dependency disposition

These are normative source integration requirements, not native execution or Step 9 admission. The predecessor's complete event v2 history, current v3 payload, Goal arbitrary-precision body/request domain, StopControl/BodyControlV2, central start/update definitions and SIR result/hash semantics remain exact.

| Boundary | Disposition |
|---|---|
| Original current execution association/absence | B-defined here for original enrolled native Goals: exact writer-domain/all-writer placement, fresh original birth, complete binding revision/origin/control, Plan binding carrier, original mutation/reservation/Stop race and current versus historical read closure. A null body ref or missing cache is not proof. |
| Original no-bound-Plan selection | B-defined here: durable original C-source selection and exact unchanged ExecutionBinding projection; no execution association and no unaccounted current owner obligation. C-owners joins the actual selection and current Stop/source custody. Captured wholly unpublished binding pending is resolved only by its original owner with exact no-effect receipt. |
| New Goal identity with prior host Stop | Unchanged original Stop rules. Fresh identity never proves epoch zero. Original effective prior host/thread/run Stop mapping must exist; unsupported preexisting native representations remain unavailable without exact migration. |
| Existing unenrolled binding representations | Separate technical source-migration dependency: original complete actual associations and pending operations must be mapped under all owners before enrollment. No inferred none, and no synthetic original source created by a reader. The new fresh native source route is fully specified independently. |
| Bound Plan effects | Association truth is now typed; cancellation effects remain separately owned technical integrations: original PlanRun/Plan Canceled control, every run-specific execution schedule/quota consent, exact owner/source/expected-state CAS, original settlement and callback fencing. PGOAL-007..010 preserve these obligations. This bounded cancellation route rejects them before C-stop; no broad cancellation, omission-as-empty or new policy is selected. |
| Workflow association effects | Explicit different current association. Its actual original disposition is required, never none_required because AssistantPlan is absent. This contract does not select a new Workflow cancellation policy or run event. |
| Codec and possible assignments | B-defined positive route: actual original native append reservation, exact singleton assignments, full interval of admitted lengths under existing 4096/16777216 Case L-2 caps, complete exact JCS/MP domain checks at original entry and after every returning helper. Genuine native lock/lease placement and codecs remain NOT_RUN. |
| Valid Goal values unsupported by current JCS/MP projection | Explicit representation-route limitation, not a Goal schema/range change. This contract preserves values outside that selected route and refuses it before C-stop. A broader original EventRecord producer-semantic/CV-333 result codec qualification needs its exact Contracts/SIR/Storage schema/resource/hash-preimage integration and root adoption; no automatic switch to Goal JSON or new numeric cap. |
| Lost append reservation after Stop | Concrete bounded behavior: no new append under old witness, preserve genuine Stop/receipt/pending effects, issue only an authentic representable original recovery-required result or disclose terminal issuance unavailable. Arbitrary post-restart reassignment needs a separately bound original recovery profile. Surviving audit cannot recreate a native capability. |
| Original event/first receipt | Existing original SP-278/SP-286 contracts remain mandatory. This contract only specifies the reservation participant they would use. GRS-073/CV-347 adopt the current v3 producer/schema route for this already registered event as bounded Step 8 contract work. Whole historical v2 interpretation remains unchanged. Actual original publication and full event depth remain unproved. |
| Product selection | No new product choice identified or made. Existing Goal/Plan/Stop/cancellation and independent retention meanings are preserved. A future incompatible owner alternative must be adjudicated explicitly rather than chosen through a helper or schema analogy. |

Native registration/all-writer exclusion, Goal birth, actual source authentication, actual codec implementation, locking/leases, atomic redb/Seglog/first receipt, backup/restore/deletion, ordinary/crash/fault behavior and model fixtures are all NOT_RUN. The bounded canonical source contracts do not prove these native behaviors. Metaschema/reference/hash inspection is only source evidence.

The exact physical-family and independently callable method contracts are `Plans/goal_cancel_contracts/execution-physical-families.json` and `Plans/goal_cancel_contracts/execution-methods.json`. `Plans/goal_cancel_contracts/numeric-paths.json` is the complete selected source integer inventory; it does not impose a new Goal integer bound. All schema references resolve through CV-347's complete offline graph. APR-017/SQR-011 and GRS-076/SIR-051 supply the bound Plan source and cancellation integration contracts. Original Workflow settlement adapters, unsupported prior-source migrations, and genuinely installed native roles/codec/publication remain independent prerequisites; declaring these source records supplies none of their actual execution evidence.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-073, ContractName:Plans/storage-plan.md#SP-304, ContractName:Plans/Contracts_V0.md#CV-347, ContractName:Plans/storage-plan.md#SP-305

### SP-306 - Original Plan cancellation physical custody and existing class assignments

SP-306 supplies the original native redb custody for APR-017/SQR-011. CV-348's schema resource and `Plans/assistant_plan_cancel_contracts/physical-families.json` define the exact wrappers and keys. All ten families are canonical, non-rebuildable original custody with mandatory coherent backup; none is a cache or materialized event projection. The actual semantic source owner remains Plan, Scheduling or original Storage as declared by the family. This is a registry/source classification under the existing Case L-3 classes, not a product lifetime decision or unknown-policy fallback.

| Family / wrapper | Exact physical key | Existing policy at 1.0.0 | Actual semantic class |
|---|---|---|---|
| `assistant_plan_record` / `StorageAssistantPlanRecord` | `assistant_plan_record.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(thread_id)}:{hex(assistant_plan_id)}` | `RP-AUTHORITY-INDEFINITE` | original Plan identity, approved-version and source-lineage authority |
| `assistant_plan_run` / `StoragePlanRun` | `assistant_plan_run.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(thread_id)}:{hex(plan_run_id)}` | `RP-RUNTIME-365D` | full runtime Run; original run_completion anchor and runtime policy only |
| `execution_schedule` / `StorageExecutionSchedule` | `execution_schedule.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(schedule_id)}` | `RP-AUTHORITY-INDEFINITE` | actual admitted exact-target scheduling instruction/source authority |
| `quota_resume_consent` / `StorageQuotaResumeConsent` | `quota_resume_consent.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(run_id)}:{hex(provider_id)}:{hex(account_id)}:{hex(consent_id)}` | `RP-AUTHORITY-INDEFINITE` | actual run/provider/account-scoped opt-in approval authority |
| `execution_schedule_run_binding` / `StorageScheduleRunBinding` | `execution_schedule_run_binding.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(schedule_id)}` | `RP-AUTHORITY-INDEFINITE` | original admitted schedule-to-run source lineage |
| `plan_cancel_effect` / `StoragePlanEffect` | `plan_cancel_effect.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(thread_id)}:{hex(plan_run_id)}:{hex(cancellation_id)}` | `RP-AUTHORITY-INDEFINITE` | immutable original cancellation receipt/audit authority |
| `schedule_quota_cancel_effect` / `StorageScheduleQuotaEffect` | `schedule_quota_cancel_effect.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(plan_run_id)}:{hex(cancellation_id)}` | `RP-AUTHORITY-INDEFINITE` | immutable original invalidation receipt; reason digest only |
| `assistant_plan_cancel_result` / `StoragePlanCancelResult` | `assistant_plan_cancel_result.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(thread_id)}:{hex(plan_run_id)}:{hex(cancellation_id)}` | `RP-AUTHORITY-INDEFINITE` | immutable original native result/request-lineage authority |
| `plan_cancel_source_origin` / `StorageSourceOrigin` | `plan_cancel_source_origin.v1:{hex(storage_instance_id)}:{hex(issued_physical_key)}:{issued_physical_sha256}` | `RP-AUTHORITY-INDEFINITE` | immutable original source lineage, including original compact run anchor |
| `assistant_plan_run_retirement` / `StorageRunRetirementReceipt` | `assistant_plan_run_retirement.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(thread_id)}:{hex(plan_run_id)}` | `RP-AUTHORITY-INDEFINITE` | original atomic redb compaction receipt and source lineage; no full Run body or history |

Plans/assistant_plan_cancel_contracts/physical-families.json declares exact original redb families/keys/wrappers for the four records, original schedule-to-execution correlation, original source origins, both original effects, original cancellation result and runtime retirement receipt. Logical IDs are lower-case hex of exact UTF-8, never normalized or extracted by prefix guess. Each mutable original source has a monotonically increasing source_revision in its wrapper, starting at 1 at genuine absent-key native birth and advancing by one per actual mutation. This technical revision supports exact CAS and ABA rejection independently of Plan document version, schedule revision, and PlanRun epoch.

Before any original mutation, the actual owner authenticates the whole prior physical value and origin. The owner compares whole bytes/hash, schema/key/storage scope, source_revision and actual current ownership; permitted field changes are derived independently from the actual original operation. The new source and its immutable SourceOrigin publish atomically. The origin names the exact original issuer, operation/transaction, previous whole physical hash (null only for actual proven absent-key birth), new whole physical hash, source revision and causation. An origin is not accepted from a public caller and cannot be minted later to authenticate a preexisting or copied record.

Original native values use the explicitly selected canonical JSON physical codec below; all record fields are retained. SourceBinding binds exact source and origin physical hashes, schema and key. The selector decoder enforces exact family-to-schema/wrapper-role mapping, not only a caller string. Numeric representability is a read/write-route qualification, not a new logical field cap. Values valid under the logical schemas but unsupported by the physical route fail before C-stop for this route; they are not rounded, clamped or silently rewritten. Original restore/deletion/backup/encryption rules remain Storage's.

The mutable source stores only its latest original value; effect receipts store exact before/after bindings and commitments rather than duplicate full Plan/schedule bodies. The explicit existing policy-class assignments below govern the complete compact origins and original native result. They grant no indefinite lifetime to referenced full runtime bodies. No raw transcript/archive, new TTL or alternative physical history store is introduced. Restart must restore the durable native records and original result identity needed by the existing owners; missing source custody is unavailable, never reconstructed from goal.cancelled, owner-effect summaries, UI or worker prose.

#### Exact physical codec and commitments

The declared new native record/receipt/origin families use Storage json_canonical with the existing RFC8785/JCS qualification already consumed by the current cancellation owner and Contracts_V0. This contract does not redefine JCS, canonical MessagePack, Goal JSON or historic physical bytes. The local registry handle RFC8785-JCS-exact-route-v1 names that existing algorithm plus the required original-value exactness preflight; it is not a new numerical product domain.

At the actual original native input boundary reject malformed UTF-8, duplicate keys, surrogate code points, nonfinite/invalid JSON numbers and unknown record fields. Preserve strings without normalization and arrays in original order. Validate the whole native schema. Qualify every actual integer/number against its complete original exact value and the selected JCS implementation, encode canonically, then require exact decode/re-encode equality and equality to the original authorized semantic value. Never let a floating-point parser erase evidence of original rounding before this comparison. Valid logical values not representable on this route are unavailable before C-stop; neither JSON Schema nor this source declaration adds a fixed-width integer cap or confidence range.

Every physical SHA is lowercase SHA-256 over the entire actual canonical wrapper bytes, including schema/version/storage instance/key/source revision where present and all record fields. SourceOrigin.issued_physical_sha256 hashes the entire issued original wrapper. prior_physical_sha256 hashes the entire previous original wrapper; null is allowed only under proven original absent-key birth. SourceBinding.origin hashes the complete original origin wrapper. No semantic-only hash is substituted for a physical selection.

scheduler_complete_selection_sha256 hashes the full canonical ordered object {schedules: [...], consents: [...]} using the complete ScheduleExpected and ConsentExpected values in OwnerSelection. Arrays are sorted by complete physical source keys in exact UTF-8 order and must have unique full source identity; consent identity retains run/provider/account/consent joins. It commits to complete full original values and original source/origin bindings. Actual complete selection and all-writer exclusion still come from the native Scheduler owner, not from the hash or serialized array.

A currentness hash for this native Plan source profile is the whole StorageAssistantPlanRecord physical hash. Actual expected PlanRun, schedule/consent, source revisions and current Stop/permission/owner guards are independent CAS operands. Source revision arithmetic and PlanRun epoch arithmetic remain mathematical integers; an unrepresentable resulting physical value refuses this declared route rather than losing information.

Source assembly order is native after-values -> their origins -> Plan/Scheduler effect receipts -> their origins -> typed Plan cancellation result -> its origin. Native source values do not contain their own origin hash, and origins do not contain their own physical SHA. Effect receipts point at already assembled native source/origin pairs; the typed result points at the already assembled PlanEffect. There is no self/future hash cycle.


Every hex component is lowercase hexadecimal of the complete original Unicode-scalar UTF-8 identity with no normalization, trimming, prefix inference or case folding. The issued_physical_sha256 component in the origin key is the exact lowercase 64-character digest of the earlier whole issued value. Every selected physical key, schema/version, storage instance, wrapper role and inner identity must agree. Source revision is an exact integer starting at 1 only at genuine never-born admission and advancing once for each changed mutable wrapper. Full native rows keep all fields, including full schedule invalidation reason; origin/effect/result metadata does not substitute for them.

The Plan record's authority classification covers actual Plan identity, immutable strategy/scope and approved-version/hash source/approval authority; it is the current full aggregate and not document/history-body custody. Schedule authority covers the actual admitted exact-target scheduling instruction, including its full original reason, not timer caches, telemetry, scheduled messages or attachment bodies. Quota consent covers the actual scoped opt-in approval; no provider response/usage archive or future-run consent is added. ScheduleRunBinding is original scheduling lineage and creates no hold on the referenced full Run.

The full PlanRun alone uses RP-RUNTIME-365D@1.0.0; original run source origins preserve its compact first-settlement anchor under SP-307 without retaining the full Run indefinitely. Original effects, result/request identity, source origins and retirement receipt are compact receipt/result/audit/source-lineage authority under RP-AUTHORITY-INDEFINITE@1.0.0. Indefinite-class source admission must reject secret/raw-body content in fields restricted to opaque authentic identities/refs; it cannot sanitize an already accepted value and call it identical. This restriction does not redact full native fields assigned to actual source authority.

The existing authority policy remains indefinite, creation anchored, hold eligible, expiry none and overflow fail_closed, with no TTL/cardinality/max-byte limit. The existing runtime policy remains exactly as SP-307 states. References, hashes and compact receipts create no new full-source hold, content lifetime, restore capability or reconstructible archive. Existing thread/Project visibility, legal holds, content deletion and backup windows remain independently owned.

StorageSourceOrigin authenticates genuine simultaneous issuance by its actual native owner, operation/transaction, exact prior/issued whole hash and original source revision. Birth authenticates complete prior-origin and retirement custody as well as row absence; absence is not never-born proof. All native writers/readers/coherent backup/restore/migration roles are installed together with complete anchor and identity invariants. The canonical map's original_issuer_identities retains the five actual source issuer identities; matching their strings does not create native enrollment. Those issuer identities are provenance, not alternate unqualified v1 direct routes; every actual method uses the full current private entry qualification in the canonical method map. An actual prior deployed value without the required complete schema/original migration is unavailable. No alternate cancellation-owned source database or automatic migration is introduced.

Every independently callable original participant captures complete authentic inputs, native participant/root/registration/operation/currentness/permission/deletion/hold sources, all beforeimages and the independently derived full permissible output before any returning helper. After all returning parsers, builders, codecs, resolvers, copies and comparators, it repeats one pure full-native and whole-candidate predicate with no helper, callback, logger or async gap to its own commit or passive disclosure. The outer publisher also checks the complete joined result. Original readback precedes dependent publication. Shape, detached hashes, matching names and serialized leases do not authenticate authority. Refusal preserves every genuine prior effect and unrelated original member.

This is a source-contract integration. Native installation, original issuer authentication, all-writer enrollment, safe-stop/callback exclusion, exact codec execution, redb atomicity/fsync/crash behavior, source/result replay, backup/restore and Janitor execution remain NOT_RUN. No new public command, event, Goal state, WorkNode, NodeSeed, readiness admission, event-depth pass or governance seal follows.

```yaml
plan_unit_id: SP-306
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Original Plan cancellation physical custody and existing class assignments. Exactly ten
  canonical non-rebuildable original families use complete source/wrapper schemas, exact keys, whole-value
  hashes and mandatory coherent backup.
gui_related: false
gui_classification_reason: Defines original owner, schema, storage or verification contracts.
split_recommended: false
depends_on:
- SP-305
- CV-348
unblocks: []
acceptance_criteria:
- Exactly ten canonical non-rebuildable original families use complete source/wrapper schemas, exact keys,
  whole-value hashes and mandatory coherent backup.
- Full PlanRun uses the unchanged runtime class; other families use explicitly justified original authority
  classes without creating a full runtime archive.
- Native source birth and every mutation jointly publish authentic origins and preserve complete original
  logical fields.
- Every physical/hash/selection codec is exact; unsupported representability refuses the route without
  a product bound or alternate codec.
validation_surfaces:
- Plans/assistant_plan_cancel_contracts/physical-families.json
- Plans/assistant_plan_cancel_custody.schema.json
- Plans/storage_value_registry.json
- Plans/storage_value_registry.schema.json
risk_class: goal_cancellation_original_authority_or_effect_loss
reasoning_tier: high
context_scope: sp_306_bound_plan_custody
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-029
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-047
negative_constraints:
- No public command, event, Goal or Plan lifecycle expansion, peer owner or fabricated original effect.
- No native field redaction, numeric coercion, new retention policy, full runtime archive or automatic
  deployed migration.
- No model/native execution, WorkNode/NodeSeed/readiness admission or governance seal.
```

### SP-307 - Original run completion anchor and runtime-only retirement

SP-307 applies only to the full `assistant_plan_run` runtime row and its original compact retirement custody. It does not retire the Plan aggregate, scheduling instruction, consent, correlations, original origins/effects/result, blobs, EventRecords or backup content. `RunCompletionAnchor`, complete `RunRetentionBoundary`, `RunRetirementSources`, `StorageRunRetirementReceipt` and the independently callable methods are defined by CV-348's canonical schema and `Plans/assistant_plan_cancel_contracts/methods.json`.

#### First actual settlement anchor

`StoragePlanRun.run_completion_anchor` is a NEW required nullable physical-wrapper field; it is not a sixteenth logical PlanRun field. At a genuine unfinished Run birth it is null. `running`, `paused`, `waiting_quota`, `waiting_window`, `blocked` and an unfinished `failed` Run retain null. A failed Run's failure time, Stop time, first cancellation request, audit read, file mtime or backup/restore time is never a run-completion anchor.

The original Plan owner creates `RunCompletionAnchor` exactly once in the same native write that first settles that Run as `completed` or `cancelled`. It contains the exact original storage/Project/thread/Plan/Run identity, terminal state, actual original owner operation and transaction IDs, actual original settlement UTC timestamp, and the **at-settlement** wrapper source_revision and PlanRun epoch. For the new cancellation route those two integers are the independently derived original +1 values; the operation/transaction are the real pre-reserved Plan operation and joint transaction. The time is the actual original native settlement time, not a guessed future clock value. The terminal state must equal the actual native Run state.

The actual native transaction supplies its original timestamp once before full candidate encoding/publication. It becomes an authoritative settlement time only if the transaction commits. Never restamp it on retry. The original Plan effect's committed_at_utc and this first cancellation anchor use that same actual Plan settlement timestamp. An origin's issued_at_utc is independently its actual source issuance time; a later origin time never becomes a new completion anchor.

The new whole Run value and its genuine `SourceOrigin` publish atomically. Every run SourceOrigin carries the exact `run_completion_anchor` of the issued Run wrapper; every non-run SourceOrigin carries null. At first settlement the original source_revision equals anchor.settlement_source_revision and the native epoch equals anchor.settlement_plan_run_epoch. All later lawful writers preserve the whole first anchor byte-exact even if their own source revision or issuance time advances. Their original scopes and terminal state remain immutable; no writer reuses the Run identity, resumes a settled Run, or resets the anchor. Historical terminal sources without authentic first-settlement evidence are unavailable under this profile, not backfilled from current state/time.

The anchor deliberately contains no hash of its own wrapper or origin. Hash order is full Run including anchor -> Run physical hash -> Run SourceOrigin including copied anchor -> origin physical hash -> Plan/Scheduler effects -> effect origins -> original result -> result origin. This is acyclic. The actual native original first-settlement origin is the retained anchor carrier after lawful full Run retirement. Its existing authority/source-lineage class does not turn the full Run into an indefinite archive.

`owner.storage.assistant_plan_run.read_completion_anchor.v3` resolves the exact original terminal SourceOrigin by actual native origin-family custody and exact Run scope, not by source timestamp or row-prefix guesses. The original first-settlement origin must name the same actual run key, have source_revision equal to the anchor's settlement revision, original operation/transaction equal to the anchor's, nonnull prior source hash, and the complete anchor identity/state. The actual origin owner's retained authentication proves issuance. All later encountered run origins must preserve the same anchor. Conflicts or missing original terminal origin return unavailable. A complete original-family lookup or already authoritative exact membership resolver is required; an optional index miss does not prove absence. The read projects `anchor_kind=run_completion` and `retention_anchor_at_utc=anchor.settled_at_utc` for the existing policy resolver, without changing original spelling. It does not claim current full Run availability or lawful deletion merely because an anchor exists.

#### Existing runtime policy and atomic full-row successor

Case L-3's runtime policy is exactly 31,536,000 seconds after actual run completion, 1,000,000/run plus 5,000,000/project, overflow `roll_successor`, expiry `compact`, hold eligible. Those are the existing class limits, not per-new-family caps. Age eligibility is inclusive at original anchor + TTL. Counts use the actual complete runtime class population and the existing order `(retention_anchor_at_utc, sequence_id?, stable_object_id)`, never filename, new observation clock or a cancellation-only count. No numerical product cap or count-scope substitute is added.

`RunRetentionBoundary` is the complete typed original native selection for this one full Run: exact unchanged policy, frozen actual cutoff, full actual scoped runtime population, full actual Project terminal-Run cohort, all applicable protecting refs and required authority survivors, with their actual original owner/source identity and current backup/restore/deletion sources. The actual Storage owner must resolve complete authoritative membership, not accept caller arrays, summary counts or an optional index miss. The population's exact records preserve original owner/run identity, source commitments and existing sequence/stable-object order. Refs/hashes authenticate the actual original native membership source only alongside its full native origin/currentness guard; they do not manufacture completeness.

The latest 25 genuinely terminal Runs in the Project receive the existing automatic recent_run protection. The cohort includes all relevant actual runtime owners, not only Assistant Plan or cancelled Runs; its own authentic original anchors and ordering must be available. A failed unfinished PlanRun has no invented terminal anchor and is not counted as a settled Run by this source profile. Becoming 26th releases only that automatic protection. Unknown cohort/member/currentness evidence blocks compaction. No new recent-run count or timeline is selected.

Every applicable legal hold, recovery/preserved/recent-run anchor, live ref, backup ref, rollback ref and maintenance ref overrides age/count eligibility. Live current readers, unfinished C-publication, original command reconciliation, pending effect recovery and callbacks needing the full original Run are covered by their actual existing live/maintenance/recovery reference owners. The narrow current-after-state route cannot release its own dependency by converting itself into retained audit. Actual retained-result consumers that only need original compact custody do not invent a permanent full-Run ref; their real source owner must explicitly confirm that dependency has settled. No reference is released merely because a side receipt or timer says done.

The executing Janitor's own transaction-scoped selection/exclusion is consumed by this atomic operation; it is not evidence that other live/maintenance refs vanished. Any independently protecting self/pending maintenance dependency must satisfy its actual owner release rule. Do not filter it out by matching operation names.

This narrow `compact_expired.v3` full-row replacement requires actual TTL expiry **and** all original eligibility protections cleared. Count pressure can initiate existing successor rollover/compaction, but cannot use this route to erase unexpired or protected full runtime values. Earlier count-driven successor rollover preserves those values under the original policy. If complete successor capacity/eligibility cannot be proven, the original maintenance owner preserves source authority rather than changing the policy or dropping protected data.

The existing native Storage Janitor/maintenance owner runs this original step under the aggregate canonical-store lock and applicable original maintenance lease. The outer `compact_expired.v3` accepts exact RunScope in that actual native invocation, resolves a prior genuine retirement receipt first, and otherwise resolves the complete original `RunRetirementSources` for the directly callable `compact_expired_native.v3` participant. Thus replay after full-row retirement requires no reconstructed Run input. Missing full source without authentic prior receipt returns unavailable. `RunRetirementSources.actual_maintenance_operation` uses the complete existing generic storage_maintenance_operation shape with actual operation_kind=compaction. Its actual owner, scope, lease, source/target authority and full current operation bytes are independently authenticated. Merely validating that generic shape grants no native maintenance authority. The owner performs this exact redb compaction step, not an EventRecord-only seglog source/target manifest or CURRENT transition. No seglog generation, event or storage lifecycle status is fabricated or borrowed as proof of a redb row removal.

Before any returning helper, independently capture the complete current anchored StoragePlanRun, exact current source origin, original first-settlement origin, actual maintenance operation, original policy/whole selection/protection/backup sources, existing retirement destination, and all required authority survivors. Derive the complete candidate retirement receipt and independently expected write/removal set. Whole values and numerical domains are qualified under the installed exact schemas/JCS before mutation. Reserve original native transaction/receipt identity through the actual owner; the deterministic receipt key is based on original storage/Project/thread/Run identity. Set compacted_at_utc only to that genuine original Storage compaction transaction's time. It is never an anchor for the old Run's runtime policy.

The permanent compact receipt names the exact full removed Run source binding, original terminal origin selector and immutable anchor, original native maintenance operation/transaction/owner/lease, unchanged policy identity/registry commitment, original frozen cutoff, complete original selection/protection/authority-survivor commitments, exact observed class counts and original backup/deletion source bindings. Full runtime population arrays, complete beforeimages and private eligibility inputs are transient native operation inputs; they are not copied into the permanent receipt. Every committed receipt member is independently derived from those full originals. No field contains a hash of its own receipt or a later journal/result, so the graph is acyclic.

After all returning helpers, the existing Storage and original Plan participants independently recheck their complete native source/operation/control/permission/membership/policy/reference/hold/backup/recovery/currentness facts, exact original full candidate and complete survivor union. In **one original redb transaction**, CAS the full Run bytes/revision and required original gate/preimages, require actual absence of the exact retirement destination, publish the complete immutable original retirement receipt, and remove only the selected expired full StoragePlanRun row. All original run SourceOrigins, the original anchor, Plan/Scheduler effects, results, other required authority receipts, Plan aggregate, schedule/consent/correlation values and unrelated rows remain byte-exact survivors. The transaction performs no file/blob/seglog deletion, hold release, public status change, new Run birth or second cancellation.

This receipt is the compact linked successor custody for the one retired full runtime value: original identity/anchor/receipt commitments survive while the expired full Run does not. It is not a new live Run or a replacement full runtime body. Case L-3's verified-successor principle is applied to this exact redb atomic scope; the receipt's own original same-transaction publication, source CAS/removal and survivor verification prove that scope. It does not certify any external seglog range, blob, backup or another store. Required survivor bytes/identity are verified before commit and read back under the independently fenced post-commit owner boundary before success is delivered.

Before commit, crash leaves the original full Run authoritative and no retirement receipt. After commit, the authentic receipt and original compact survivors are authoritative, and the full Run is absent. Loss before readback does not authorize repeating mutation; the existing native owner resolves the original exact result from committed custody. A present receipt plus inconsistent remaining full Run, conflicting original anchor/source hash, or incomplete authority survivors enters existing disclosed source/recovery unavailability, not inferred success. The source is not deleted in a sequential best-effort step after writing a receipt.

`read_retirement.v3` accepts exact RunScope, obtains the full original compact receipt and original terminal SourceOrigin through their actual native owners, checks current read/restore/deletion authority and native consistent retirement disposition, and returns the original result with a separate replay_of. The inner typed reader has the same independent guards. No old full Run or original cleanup lease is required for passive retained disclosure. Missing receipt plus missing full Run is unavailable, not proof of lawful retirement. An anchor alone also proves no removal. The native full-Run/current-effect reader reports unavailable after authentic retirement and never rebuilds the full value from retained hashes.

#### Original backup, restore and identity

All original native writers and native backup/restore roles are installed together with the immutable anchor invariant and exact source/result/origin schemas. Mandatory coherent backup includes the original full current Run while it exists, original immutable run origins/anchor, required original effects/results/request identity, and any actual committed retirement receipt. No partial backup or restore can claim complete cancellation/retirement authority. The existing content/backup lifetimes remain unchanged; a reference creates no new full-source hold.

Restore preserves original anchor bytes and original operation/transaction/time. It processes genuine terminal/retirement authority before exposing current Run state. It cannot resurrect a pre-retirement full Run as current, reset its source revision/epoch/anchor, discard the original receipt or create a fresh identity because the main row is absent. Source birth checks authentic prior-origin and retirement custody under the same whole native owner fence; original full-row absence is not never-born proof. Corrupt/conflicting or incomplete original history/backup/retirement custody remains unavailable for current action.

An old backup containing full Run bytes retains them only under the existing backup/deletion/hold rules and cannot publish them over later authentic compaction authority. Restoration into another native root must prove coherent original authority and installed migration/backup compatibility; this contract does not declare arbitrary root reconstruction from hashes. Retained origin/receipt disclosure remains possible under current permission even when raw runtime source is lawfully gone, but never recreates that source or authorizes new action.

Every independently callable original participant captures complete authentic inputs, native participant/root/registration/operation/currentness/permission/deletion/hold sources, all beforeimages and the independently derived full permissible output before any returning helper. After all returning parsers, builders, codecs, resolvers, copies and comparators, it repeats one pure full-native and whole-candidate predicate with no helper, callback, logger or async gap to its own commit or passive disclosure. The outer publisher also checks the complete joined result. Original readback precedes dependent publication. Shape, detached hashes, matching names and serialized leases do not authenticate authority. Refusal preserves every genuine prior effect and unrelated original member.

This is a source-contract integration. Native installation, original issuer authentication, all-writer enrollment, safe-stop/callback exclusion, exact codec execution, redb atomicity/fsync/crash behavior, source/result replay, backup/restore and Janitor execution remain NOT_RUN. No new public command, event, Goal state, WorkNode, NodeSeed, readiness admission, event-depth pass or governance seal follows.

```yaml
plan_unit_id: SP-307
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Original run completion anchor and runtime-only retirement. run_completion_anchor is immutable
  physical-wrapper metadata created only by actual first completed/cancelled native Run settlement; the
  15 logical PlanRun fields remain unchanged.
gui_related: false
gui_classification_reason: Defines original owner, schema, storage or verification contracts.
split_recommended: false
depends_on:
- SP-306
- APR-017
unblocks: []
acceptance_criteria:
- run_completion_anchor is immutable physical-wrapper metadata created only by actual first completed/cancelled
  native Run settlement; the 15 logical PlanRun fields remain unchanged.
- Retirement requires actual 31536000-second expiry, full runtime-class membership, latest-25 Project
  terminal-run protection and every original hold/reference/backup guard.
- One original redb transaction publishes the compact retirement receipt and removes only the expired
  full Run while preserving complete required authority survivors.
- Count pressure cannot erase unexpired/protected Runs; absent/conflicting original sources or survivor
  authority refuse compaction.
- Retained anchor/retirement reads and coherent restore preserve original time/identity and never reconstruct
  or resurrect a retired full Run.
validation_surfaces:
- Plans/assistant_plan_cancel_custody.schema.json
- Plans/assistant_plan_cancel_contracts/methods.json
- Plans/assistant_plan_cancel_contracts/publication-dependencies.json
- Plans/storage_value_registry.json
risk_class: goal_cancellation_original_authority_or_effect_loss
reasoning_tier: high
context_scope: sp_307_bound_plan_custody
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-029
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-047
negative_constraints:
- No public command, event, Goal or Plan lifecycle expansion, peer owner or fabricated original effect.
- No native field redaction, numeric coercion, new retention policy, full runtime archive or automatic
  deployed migration.
- No model/native execution, WorkNode/NodeSeed/readiness admission or governance seal.
```

### SP-308 - Original activation physical custody, current reads and lifetime

SP-308 registers 54 new exact original-custody families while preserving all 166 previously registered family rows and every existing registry policy/top-level value. The resulting registry contains 220 families. `Plans/storage_value_registry.json` and `Plans/workflow_activation_contracts/physical-families.json` jointly specify each full closed outer wrapper, canonical physical key, schema/version, exact codec, original producer and consumer, mutability, non-rebuildable class, migration/restore disposition and retention assignment. The new rows are canonical source definitions; `materialized` registry status is not evidence of native installation or an available writer.

The existing `attempt_record`, `attempt_receipt` and `execution_unit_context_store` are reused only through their actual complete native owner roles. Their original generic fields, codecs, keys, deferred posture and policies remain unchanged. The old bootstrap-only plan_compile_run, design-only compiler_wave_contract, per-request executor_intake_report and requested_effective_runtime are distinct original families. None is widened, reinterpreted or promoted to stand in for a full native checkpoint, thirteen-field aggregate report or eight-field Models receipt.

#### Exact physical families and original producers

The complete adopted key and producer mapping is normative below. Multiple listed original methods mean only the exact applicable original operation(s) for that family/value and declared joint transaction; listing a method never grants it permission to impersonate another member. Every source owner, capture issuer and Storage participant retains its original role. The full schemas and classification/mutability remain selected by the physical catalog.

| Original physical family | Complete canonical key | Exact original producer methods |
|---|---|---|
| `workflow_activation_abort` | `workflow_activation_abort.v1:H(storage_instance_id):H(project_id):H(goal_id):H(goal_run_id):H(activation_id)` | `owner.workflow.activation.cancel_before_mutation.v1` |
| `workflow_native_compile_source` | `workflow_native_compile_source.v1:H(storage_instance_id):H(project_id):H(plan_compile_run_id):decimal(source_revision)` | `owner.workflow.compile.issue_native.v1` |
| `workflow_native_request_source` | `workflow_native_request_source.v1:H(storage_instance_id):H(project_id):H(plan_compile_run_id):H(workgraph_id):decimal(workgraph_revision):H(request_id):decimal(source_revision)` | `owner.workflow.compile.issue_request.v1` |
| `workflow_certified_graph_source` | `workflow_certified_graph_source.v1:H(storage_instance_id):H(project_id):H(plan_compile_run_id):H(workgraph_id):decimal(revision)` | `owner.workflow.compile.issue_graph.v1` |
| `workflow_native_intake_source` | `workflow_native_intake_source.v1:H(storage_instance_id):H(project_id):H(goal_id):H(goal_run_id):H(activation_id)` | `owner.executor.intake.issue.v1` |
| `workflow_provisioning_source` | `workflow_provisioning_source.v1:H(storage_instance_id):H(project_id):H(goal_id):H(goal_run_id):H(activation_id)` | `owner.executor.provision.issue.v1` |
| `workflow_activation_decision_source` | `workflow_activation_decision_source.v1:H(storage_instance_id):H(project_id):H(goal_id):H(goal_run_id):H(activation_id)` | `owner.executor.activation.decide.v1` |
| `workflow_completion_requirement_source` | `workflow_completion_requirement_source.v1:H(storage_instance_id):H(project_id):H(goal_id):H(goal_run_id):H(workgraph_id):decimal(workgraph_revision)` | `owner.workflow.compile.issue_graph.v1` |
| `workflow_born_worknode` | `workflow_born_worknode.v1:H(storage_instance_id):H(project_id):H(goal_id):H(goal_run_id):H(worknode_id)` | `owner.executor.activation.materialize.v1` |
| `workflow_worknode_materialization_receipt` | `workflow_worknode_materialization_receipt.v1:H(storage_instance_id):H(project_id):H(goal_id):H(goal_run_id):H(worknode_id)` | `owner.executor.activation.materialize.v1` |
| `workflow_installed_workgraph` | `workflow_installed_workgraph.v1:H(storage_instance_id):H(project_id):H(goal_id):H(goal_run_id):H(workgraph_id):decimal(workgraph_revision)` | `owner.executor.activation.materialize.v1` |
| `workflow_goal_run_required_set` | `workflow_goal_run_required_set.v1:H(storage_instance_id):H(project_id):H(goal_id):H(goal_run_id):H(workgraph_id):decimal(workgraph_revision)` | `owner.executor.activation.materialize.v1` |
| `workflow_goal_run_body` | `workflow_goal_run_body.v1:H(storage_instance_id):H(project_id):H(goal_id):H(goal_run_id)` | `owner.workflow.activation.begin.v1`; `owner.workflow.activation.commit_materialized.v1`; `owner.workflow.activation.stage_entrypoints.v1`; `owner.workflow.activation.prepare_start.v1`; `owner.workflow.activation.cancel_before_mutation.v1` |
| `workflow_goal_run_control` | `workflow_goal_run_control.v1:H(storage_instance_id):H(project_id):H(goal_id):H(goal_run_id)` | `owner.workflow.activation.begin.v1`; `owner.workflow.activation.commit_materialized.v1`; `owner.workflow.activation.stage_entrypoints.v1`; `owner.workflow.activation.prepare_start.v1`; `owner.workflow.activation.cancel_before_mutation.v1` |
| `workflow_activation_transition` | `workflow_activation_transition.v1:H(storage_instance_id):H(project_id):H(goal_id):H(goal_run_id):H(activation_id):decimal(activation_revision)` | `owner.workflow.activation.commit_materialized.v1`; `owner.workflow.activation.stage_entrypoints.v1`; `owner.workflow.activation.prepare_start.v1`; `owner.workflow.activation.cancel_before_mutation.v1` |
| `workflow_entrypoint_staging` | `workflow_entrypoint_staging.v1:H(storage_instance_id):H(project_id):H(goal_id):H(goal_run_id):H(activation_id)` | `owner.workflow.activation.stage_entrypoints.v1` |
| `workflow_activation_receipt` | `workflow_activation_receipt.v1:H(storage_instance_id):H(project_id):H(goal_id):H(goal_run_id):H(activation_id)` | `owner.workflow.activation.prepare_start.v1` |
| `workflow_start_outbox_intent` | `workflow_start_outbox_intent.v1:H(storage_instance_id):H(project_id):H(goal_id):H(goal_run_id):H(activation_id)` | `owner.workflow.activation.begin.v1`; `owner.workflow.activation.prepare_start.v1` |
| `workflow_native_source_control` | `workflow_native_source_control.v1:H(storage_instance_id):H(logical_source_key)` | `owner.workflow.compile.issue_native.v1`; `owner.workflow.compile.issue_request.v1` |
| `workflow_original_source_origin` | `workflow_original_source_origin.v1:H(storage_instance_id):H(issued_value_key):H(issued_record_sha256)` | `owner.workflow.compile.issue_native.v1`; `owner.workflow.compile.issue_graph.v1`; `owner.workflow.compile.issue_request.v1`; `owner.executor.intake.issue.v1`; `owner.executor.provision.issue.v1`; `owner.executor.activation.decide.v1`; `owner.workflow.activation.begin.v1`; `owner.workflow.activation.commit_materialized.v1`; `owner.executor.activation.materialize.v1`; `owner.workflow.activation.stage_entrypoints.v1`; `owner.workflow.activation.prepare_start.v1`; `owner.workflow.activation.cancel_before_mutation.v1`; `owner.storage.activation_source.capture_input.v1` |
| `workflow_original_input_capture` | `workflow_original_input_capture.v1:H(storage_instance_id):H(original_source_operation_id):H(input_kind):H(capture_id)` | `owner.storage.activation_source.capture_input.v1` |
| `workflow_native_compile_live_capture` | `workflow_native_compile_live_capture.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(plan_compile_run_id)}:{hex(original_operation_id)}:{original_operation_revision}:{hex(capture_id)}` | `owner.plan_compile.native.publish_state_input.v1` |
| `workflow_compile_certification_live_capture` | `workflow_compile_certification_live_capture.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(plan_compile_run_id)}:{hex(original_operation_id)}:{original_operation_revision}:{hex(capture_id)}` | `owner.plan_compile.native.publish_certification_input.v1` |
| `workflow_aggregate_intake_live_capture` | `workflow_aggregate_intake_live_capture.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(plan_compile_run_id)}:{hex(activation_id)}:{hex(original_operation_id)}:{original_operation_revision}:{hex(capture_id)}` | `owner.executor.intake.publish_aggregate_input.v1` |
| `workflow_executor_preflight_live_capture` | `workflow_executor_preflight_live_capture.v1:H(storage_instance_id):H(project_id):H(original_operation_id):H(request_id)` | `owner.storage.executor_preflight.capture_live.v1` |
| `workflow_test_capability_live_capture` | `workflow_test_capability_live_capture.v1:H(storage_instance_id):H(project_id):H(original_operation_id):H(request_id)` | `owner.storage.test_capability.capture_live.v1` |
| `workflow_model_resolution_live_capture` | `workflow_model_resolution_live_capture.v1:H(storage_instance_id):H(project_id):H(plan_compile_run_id):H(original_operation_id):H(output_identity)` | `models.storage.capture_role_resolution.v1` |
| `workflow_worknode_request_set_live_capture` | `workflow_worknode_request_set_live_capture.v1:H(storage_instance_id):H(project_id):H(plan_compile_run_id):H(original_operation_id):H(output_identity)` | `goal_runtime.storage.capture_activation_request_set.v1` |
| `workflow_compiler_live_capture_origin` | `workflow_compiler_live_capture_origin.v1:{hex(storage_instance_id)}:{hex(issued_capture_key)}:{issued_capture_record_sha256}` | `owner.plan_compile.native.publish_state_input.v1`; `owner.plan_compile.native.publish_certification_input.v1` |
| `workflow_aggregate_intake_live_capture_origin` | `workflow_aggregate_intake_live_capture_origin.v1:{hex(storage_instance_id)}:{hex(issued_capture_key)}:{issued_capture_record_sha256}` | `owner.executor.intake.publish_aggregate_input.v1` |
| `workflow_provisioning_live_input_origin` | `workflow_provisioning_live_input_origin.v1:H(storage_instance_id):H(issued_value_key):H(issued_record_sha256)` | `owner.storage.executor_preflight.capture_live.v1`; `owner.storage.test_capability.capture_live.v1` |
| `workflow_models_request_live_origin` | `workflow_models_request_live_origin.v1:H(storage_instance_id):H(issued_value_key):issued_record_sha256` | `models.storage.capture_role_resolution.v1`; `goal_runtime.storage.capture_activation_request_set.v1` |
| `native_plan_compile_checkpoint` | `native_plan_compile_checkpoint.v1:H(storage_instance_id):H(project_id):H(original_operation_id):H(output_identity):N(output_revision)` | `owner.plan_compile.native.publish_state_input.v1`; `owner.storage.activation_operational_custody.publish.v1` |
| `native_plan_compile_certification_receipt` | `native_plan_compile_certification_receipt.v1:H(storage_instance_id):H(project_id):H(original_operation_id):H(output_identity):N(output_revision)` | `owner.plan_compile.native.publish_certification_input.v1`; `owner.storage.activation_operational_custody.publish.v1` |
| `executor_aggregate_intake_receipt` | `executor_aggregate_intake_receipt.v1:H(storage_instance_id):H(project_id):H(original_operation_id):H(output_identity):N(output_revision)` | `owner.executor.intake.publish_aggregate_input.v1`; `owner.storage.activation_operational_custody.publish.v1` |
| `ats_test_capability_receipt` | `ats_test_capability_receipt.v1:H(storage_instance_id):H(project_id):H(original_operation_id):H(output_identity):N(output_revision)` | `owner.ats.test_capability.output.v1`; `owner.storage.activation_operational_custody.publish.v1` |
| `models_plans_to_code_resolution_receipt` | `models_plans_to_code_resolution_receipt.v1:H(storage_instance_id):H(project_id):H(original_operation_id):H(output_identity):N(output_revision)` | `models.resolve_plans_to_code_role.v1`; `owner.storage.activation_operational_custody.publish.v1` |
| `workflow_activation_request_set_decision` | `workflow_activation_request_set_decision.v1:H(storage_instance_id):H(project_id):H(original_operation_id):H(output_identity):N(output_revision)` | `goal_runtime.executor.decide_activation_request_set.v1`; `owner.storage.activation_operational_custody.publish.v1` |
| `native_plan_compile_artifact` | `native_plan_compile_artifact.v1:H(storage_instance_id):H(project_id):H(original_operation_id):H(output_identity):N(output_revision)` | `owner.plan_compile.native.publish_artifact.v1`; `owner.storage.activation_operational_custody.publish.v1` |
| `native_plan_compile_head` | `native_plan_compile_head.v1:H(storage_instance_id):H(project_id):H(compile_id)` | `owner.plan_compile.native.advance_head.v1`; `owner.storage.activation_operational_custody.publish.v1` |
| `activation_operational_origin` | `activation_operational_origin.v1:H(storage_instance_id):H(issued_key):H(issued_physical_sha256)` | `owner.storage.activation_operational_custody.publish.v1` |
| `executor_source_control_preflight_receipt_source` | `executor_source_control_preflight_receipt_source.v1:H(storage_instance_id):H(project_id):H(original_operation_id):H(original_receipt_id)` | `owner.executor.source_control_preflight.output.v1`; `owner.storage.executor_sc_receipt.publish.v1` |
| `executor_sc_receipt_original_origin` | `executor_sc_receipt_original_origin.v1:H(storage_instance_id):H(issued_key):H(issued_record_sha256)` | `owner.executor.source_control_preflight.output.v1`; `owner.storage.executor_sc_receipt.publish.v1` |
| `executor_worknode` | `executor_worknode.v1:k(storage_instance_id):k(project_id):k(goal_id):k(goal_run_id):k(worknode_id)` | `owner.executor.activation.materialize.v1`; `owner.executor.native.begin_attempt.v1`; `owner.executor.native.submit_verification.v1`; `owner.executor.native.record_verified.v1`; `owner.executor.native.record_failed.v1`; `owner.executor.native.complete_worknode.v1`; `owner.executor.native.record_cancellation.v1`; `owner.executor.native.record_invalidation.v1` |
| `executor_worknode_control` | `executor_worknode_control.v1:k(storage_instance_id):k(project_id):k(goal_id):k(goal_run_id):k(worknode_id)` | `owner.executor.activation.materialize.v1`; `owner.executor.native.begin_attempt.v1`; `owner.executor.native.submit_verification.v1`; `owner.executor.native.record_verified.v1`; `owner.executor.native.record_failed.v1`; `owner.executor.native.complete_worknode.v1`; `owner.executor.native.record_cancellation.v1`; `owner.executor.native.record_invalidation.v1` |
| `executor_attempt_control` | `executor_attempt_control.v1:k(storage_instance_id):k(project_id):k(node_id):decimal(attempt_number)` | `owner.executor.native.begin_attempt.v1`; `owner.executor.native.record_failed.v1`; `owner.executor.native.complete_worknode.v1` |
| `executor_run_execution_control` | `executor_run_execution_control.v1:k(storage_instance_id):k(project_id):k(goal_id):k(goal_run_id)` | `owner.executor.activation.materialize.v1`; `owner.executor.native.record_cancellation.v1`; `owner.executor.native.apply_graph_lock.v1` |
| `executor_attempt_birth` | `executor_attempt_birth.v1:k(storage_instance_id):k(project_id):k(node_id):decimal(attempt_number)` | `owner.executor.native.begin_attempt.v1` |
| `executor_worknode_transition` | `executor_worknode_transition.v1:k(storage_instance_id):k(project_id):k(goal_id):k(goal_run_id):k(worknode_id):decimal(transition.cas_revision)` | `owner.executor.native.begin_attempt.v1`; `owner.executor.native.submit_verification.v1`; `owner.executor.native.record_verified.v1`; `owner.executor.native.record_failed.v1`; `owner.executor.native.complete_worknode.v1` |
| `executor_worknode_completion` | `executor_worknode_completion.v1:k(storage_instance_id):k(project_id):k(goal_id):k(goal_run_id):k(worknode_id):k(completion_id)` | `owner.executor.native.complete_worknode.v1` |
| `executor_native_operation_result` | `executor_native_operation_result.v1:k(storage_instance_id):k(project_id):k(goal_id):k(goal_run_id):k(worknode_id):k(operation_id)` | `owner.executor.activation.materialize.v1`; `owner.executor.native.begin_attempt.v1`; `owner.executor.native.submit_verification.v1`; `owner.executor.native.record_verified.v1`; `owner.executor.native.record_failed.v1`; `owner.executor.native.complete_worknode.v1`; `owner.executor.native.record_cancellation.v1`; `owner.executor.native.record_invalidation.v1` |
| `executor_original_input_capture` | `executor_original_input_capture.v1:k(storage_instance_id):k(project_id):k(goal_id):k(goal_run_id):k(worknode_id):k(capture_id)` | `owner.executor.native.record_verified.v1`; `owner.executor.native.capture_original_input.v1` |
| `executor_original_publication_origin` | `executor_original_publication_origin.v1:k(storage_instance_id):k(issued_key):issued_record_sha256` | `owner.executor.activation.materialize.v1`; `owner.executor.native.begin_attempt.v1`; `owner.executor.native.submit_verification.v1`; `owner.executor.native.record_verified.v1`; `owner.executor.native.record_failed.v1`; `owner.executor.native.complete_worknode.v1`; `owner.executor.native.record_cancellation.v1`; `owner.executor.native.record_invalidation.v1`; `owner.executor.native.apply_graph_lock.v1`; `owner.executor.native.capture_original_input.v1` |
| `executor_run_operation_result` | `executor_run_operation_result.v1:k(storage_instance_id):k(project_id):k(goal_id):k(goal_run_id):k(operation_id)` | `owner.executor.activation.materialize.v1`; `owner.executor.native.record_cancellation.v1`; `owner.executor.native.apply_graph_lock.v1` |

`H` and compiler `{hex(...)}` denote the exact source-owner lowercase hex of scalar UTF-8 bytes, without Unicode normalization. `N(output_revision)` is exact positive decimal. The native `k(...)` key codec retains `pm.executor.native_source_json.v1`’s exact definition. All scope abbreviations are expanded through the physical catalog’s proper owner table: activation A means storage/project/Goal/GoalRun/activation, while native A means storage/project/node/attempt; activation R and native R retain their respective exact H/k codecs. A substring, basename or similarly named scope cannot select the other owner’s expansion. The key, schema_id, schema_version, storage_instance_id and entire record agree with their complete physical wrapper, including any original wrappers that do not contain an embedded key field.

`workflow_native_source_control` is written only by the native compile/request source issuers through shared original Storage CAS. Its current immutable source, logical source key, revision, owner/epoch and pending state remain whole. `workflow_original_source_origin` uses the exact 13 A4 `OwnerIssueOrigin.issuer_method` alternatives, selected by the actual issuing family and genuine original transaction. It is not a generic copied-origin signer.

`OriginalInputCapture` and `workflow_original_input_capture` remain the preserved older physical-input compatibility contract, with the exact original owner.storage.activation_source.capture_input.v1 issuer alternative and older original reader semantics. This family and its older readers reject every new live capture/origin schema ID. They are not selected for any of the current seven live/durable roles, and their registry/materialized source declaration or presence in OwnerIssueOrigin does not install a legacy endpoint or grant a current fallback. The current methods.json.compatibility_original_input entry records that boundary. Genuine surviving old values may be disclosed only through their original compatibility provenance and current policy; missing current input is never satisfied by this older family, retained metadata, a new producer operation or another source lease.

Capture and semantic output are separate publications. `workflow_provisioning_live_input_origin.issuer_method` names owner.storage.executor_preflight.capture_live.v1 or owner.storage.test_capability.capture_live.v1, while original_source_method retains the preflight or ATS output owner. `workflow_models_request_live_origin.issuer_method` similarly names models.storage.capture_role_resolution.v1 or goal_runtime.storage.capture_activation_request_set.v1, independently of the original Models/request-set semantic owner. Compiler artifact/head methods are owner.plan_compile.native.publish_artifact.v1 and owner.plan_compile.native.advance_head.v1; their original participation joins state publication and owner.storage.activation_operational_custody.publish.v1. The operational origin’s physical publisher is that Storage method; its eight exact original semantic owner alternatives remain complete original_method data, not interchangeable physical publishers.

#### Whole publication, hashes and reads

The new operational compiler/state/receipt families use exact `pm.workflow.activation_source_json.v1`; the native WorkNode and reused source-control custody use their exact `pm.executor.native_source_json.v1` contract. Full source/certification payload digests retain their separately declared codec. Exact original integer domains, string spelling/escaping, array ordering and nullable/optional presence survive admission. Duplicate keys, malformed UTF-8, surrogates, unsupported non-integer JSON numbers and unknown fields refuse the applicable route. No source/body hash is silently substituted for the complete physical wrapper digest.

For operational custody, Origin.issued_semantic_record_sha256 hashes the entire semantic record and Origin.issued_physical_sha256 hashes the complete outer wrapper. The origin’s physical key commits the full issued key and physical digest. A4 OwnerIssueOrigin.issued_record_sha256 retains its semantic preimage; its SourceSelector.physical_value_sha256 selects complete outer bytes. Native publication-origin and Source Control certification digests likewise retain their own exact preimages. A schema-shaped origin, matching digest or chosen owner/operation ID is not original issuance.

Original output publication orders complete semantic output, its complete physical source, genuine original source origin and origin wrapper before any dependent capture/activation source and its separate original issuer origin. The compiler head selects already assembled checkpoint/origin and joins the original complete checkpoint commit. Immutable same-key changed bytes conflict; equal original retries return the actual original result. A mutable head/control uses the entire actual original current value, origin, owner and generation in its CAS. Proven fresh absence is permitted only at actual original birth under exclusion; restored missing rows or empty lookup results are not birth authority.

`owner.storage.activation_operational_custody.publish.v1` consumes the complete OriginalPublishInput and returns the complete OriginalPublishResult under the actual original semantic owner transaction. Each role’s exact full request/result in methods.json remains mandatory. A complete available durable result supplies the whole original input and full source/origin; compiler reads also supply the whole operational checkpoint. Its original capture binding must identify the same actual original operation/output and complete input bytes. Missing, corrupt, foreign, stale or unavailable sources return the exact original unavailable arm. No reader runs a compiler, probe, model, Tool or receipt producer to replace unavailable original data.

The fourteen current direct live/audit readers retain exact native request shapes and return the current inner complete available/unavailable union selected by CV-349. Current live reads require the actual original stage and source lease. Retained metadata reads disclose only the original surviving metadata and no full input. `original_durable_custody` is a separately admitted full source route with original capture provenance plus actual original durable input/origin; it never changes original_live source_mode, revives its lease or converts metadata to content. All these reads and recovery returns have action_authority=none; current original action admission remains separately mandatory.

`owner.storage.activation_source.read_current.v1` on the admitted pre-start association route explicitly performs GRS-077’s CurrentWorkflowLaunchChainRead plus CurrentAssociatedGoalRead internal join before returning its same complete current physical value/origin or unavailable. It preserves complete current mutable body/control values and the actual compact original transition/origin chain. A prior selector or body receipt authenticates a historical commitment; it neither retrieves overwritten B0/W0 payload bytes nor makes an old full-body source current. Current source checking cannot return a later body under the original activation_body label. Staging/preparation chains do not authorize later start/execution/cancellation/certification writers.

#### Retention, original lifetime and restore

The 54 new family mappings use the existing `RP-AUTHORITY-INDEFINITE@1.0.0` canonical state/receipt/source-lineage class. Its original indefinite duration, creation anchor, hold eligibility, no expiry and fail_closed overflow remain unchanged; no TTL, cardinality or maximum-byte cap is added. Every full native checkpoint, typed artifact, native state and declared semantic receipt/report retains all canonical fields, including reason, summary, objective, test/model/command/context text. These complete defined values are not “content-free” merely because they are source authority. Original secret/raw-content admission occurs before issuance; stripping a required field afterward and calling the result the same original is forbidden.

The classification is limited to the complete closed adopted value schemas. Source documents, code trees, logs, stdout, provider responses, screenshots, traces, raw test results, FileSafe snapshots, old design-only waves, requested_effective_runtime and all other separately referenced source/body families retain their original policy, anchor, legal/content holds and visibility/deletion controls. References and hashes do not extend those lifetimes, create a hold, imply restore capability or reconstruct disposed content. A full payload outside an adopted closed schema must obtain its actual owner/classification; it cannot enter through a generic blob, an omitted field or a blanket indefinite label.

Mutable current authority keeps its genuine current value together with the permitted compact original transition/receipt/origin custody. Indefinite policy does not require an archive of every old full Goal or Workflow body. GRS-077 preserves B0’s launch commitment, B1’s actual metadata receipt/association bridge, and original Workflow transition commitments without the vanished prior payload. Already immutable checkpoints and semantic receipts remain complete immutable originals under their assigned policy. No current reader reacquires disposed full content merely because a surviving receipt references it.

All new original families are canonical_non_rebuildable and require coherent mandatory backup under BRS-024 before durable/restart/dispatch promises. Original registry/schema/codec/owner/root identity, full current heads, exact original source/origin values, complete checkpoint/artifact/receipt participants and all dependencies necessary for the claimed operation must be captured through their actual owner boundaries. Restore validates exact complete keys/bytes/hashes/versions/origins, original transaction and dependency closure, current holds/tombstones/deletion and newer committed/terminal/head truth before exposure. Restored data does not restore a lease, writer capability or admission. Missing authority stays unavailable and keeps dependent mutation fenced; no reconstruction from Plans, UI, event summaries, sibling results or a new producer operation is allowed.

Every independently callable original issuer, capture participant, head/artifact writer, Storage publisher, live/current/durable/retained reader, recovery reader and replay responder must enforce both native boundaries itself. Before its first returning helper it authenticates the complete actual operation, registered owner and epoch, native Storage/root/backend identity, whole original source values and beforeimages, current permissions, effective Stop/cancellation, writer/registration generations, deletion/tombstone/hold and coherent recovery state. It independently derives every complete permissible candidate and return from those sources. Caller-selected method, schema, family, codec, source mode, operation ID, owner string or serialized lease cannot establish that authority.

After all returning parsers, builders, codecs, copies, resolvers, validators, comparison helpers and currentness reads, the same original participant independently rechecks the whole authentic source/preimage set, actual native fences and entire candidate. A publisher checks its complete pending transaction union, including preserved/unrelated members; the outer joint publisher independently checks the complete joined union as well. One final pure predicate has no returning helper, asynchronous callback, logger or mutable gap before that participant’s commit or passive disclosure. A lower entry never inherits authority merely because its caller checked. Whole original readback with its own independent final predicate precedes dependent release. A later refusal preserves every genuine prior effect and never repairs a missing source by replaying its producer.

This unit establishes a canonical source contract and the required original-owner placements. Native installation and capability authentication, original source execution, all-writer exclusion, exact codec execution, redb atomicity/fsync/crash behavior, retained/current replay and coherent backup/restore remain NOT_RUN. Schema/source checks do not establish those properties. No WorkNode, NodeSeed, executable queue, runtime launch, PNC-019 enablement, readiness admission, event-depth pass, Step 9 campaign result, global D05 closure or governance seal follows from this adoption.

```yaml
plan_unit_id: SP-308
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Original activation physical custody, current reads and lifetime. The registry preserves all 166
  old rows and policies while defining exactly 54 complete new non-rebuildable source families with exact owner/key/codec/backup
  mappings.
gui_related: false
gui_classification_reason: Defines original source, owner, storage and verification semantics without a visual surface.
split_recommended: false
depends_on:
- SP-278
- SP-305
- SP-306
- SP-307
- CV-349
unblocks: []
acceptance_criteria:
- The registry preserves all 166 old rows and policies while defining exactly 54 complete new non-rebuildable source
  families with exact owner/key/codec/backup mappings.
- Original semantic source owners, capture publishers and Storage participants retain their distinct exact methods
  and whole transaction obligations.
- Current, original durable and retained metadata reads retain complete available/unavailable contracts without
  reconstructing missing bodies or renewing source lifetimes.
- Existing indefinite canonical state/receipt policy applies only to full closed adopted records; referenced raw
  and mutable historical bodies retain their actual owner lifetimes.
validation_surfaces:
- Plans/storage_value_registry.json
- Plans/workflow_activation_contracts/physical-families.json
- Plans/workflow_activation_contracts/retention-field-classification.json
- Plans/workflow_activation_contracts/methods.json
- Plans/Backup_Restore_System.md#BRS-024
- Plans/Goal_Runtime_System.md#GRS-077
risk_class: workflow_activation_original_source_or_lifetime_drift
reasoning_tier: high
context_scope: sp_308_activation_original_custody
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-047
- Plans/workflow_activation_contracts/methods.json
- Plans/workflow_activation_contracts/physical-families.json
source_atom_ids: []
negative_constraints:
- No public command, event or Goal lifecycle expansion and no fabricated original source or receipt.
- No full historical mutable-body archive, new retention policy, native field redaction, numeric coercion or automatic
  deployed migration.
- No WorkNode/NodeSeed/runtime/readiness/global event-depth or governance claim from source adoption.
```

ContractRef: ContractName:Plans/storage_value_registry.json, ContractName:Plans/workflow_activation_contracts/physical-families.json, ContractName:Plans/workflow_activation_contracts/retention-field-classification.json, ContractName:Plans/workflow_activation_contracts/methods.json, ContractName:Plans/Backup_Restore_System.md#BRS-024, ContractName:Plans/Goal_Runtime_System.md#GRS-077

### SP-309 - Workflow and bounded safe-stop original physical custody

SP-309 registers 55 new complete original-custody families after SP-308's 220-family baseline. The resulting registry has 275 families. `Plans/storage_value_registry.json` and `Plans/executor_cancellation_contracts/physical-families.json` jointly define each entire closed wrapper, original key/codec, native producer, exact consumer, mutability, source realm, retention and coherent backup obligation. Registry `materialized` status is a source-definition posture, not installed native operation or an available writer.

All 220 existing value schemas, keys, codecs and lifetimes and all 27 policy objects remain unchanged. Exactly four existing rows gain bounded method/read/scope metadata: workflow_goal_run_body and workflow_goal_run_control add original start/D06 producer and reader routes; workflow_original_source_origin and workflow_start_outbox_intent add only the reviewed original-start consumer/target annotations. Every other field and all 216 other complete existing rows remain exact. Existing permission_snapshot_record, safe_point_record, safe_point_restore_transaction, mcp_server_lifecycle_record, seglog_current, seglog_manifest and event_append_receipt_custody are whole reused families.

The new families comprise twelve D01/D02/D03 values, four compact original-start values, three FileSafe k1 values, fifteen Process values, sixteen bounded aggregate values and five D06 values. The five D01 lineage wrappers are explicit v4 declarations; the seven ordinary scheduler wrappers retain v2 grammar and validate in the fixed retained original realm. Actual current writers still require their complete current native, Goal and Start phase arguments. A historical value realm never grants an old current-Workflow writer. No unadopted proposal wrapper is treated as a migrated canonical value.

#### Exact original start event and compact custody

The new `goal_run.started` payload identity is `pm.goal_runtime_event.goal_run_started.schema.v3`; outer EventRecord stays 2.0.0. Preserve all 22 original definitions and the whole six-field event-specific payload. Keep goal_revision as authentic unchanged original Goal context, remove expected_goal_revision and retired parent_goal_id, and require expected_goal_run_revision, goal_run_revision and inner idempotency_key. The Workflow revisions equal actual before revision and before-plus-one. Outer run identity equals the Workflow GoalRun; all actor, requested/effective provider/model/account, execution/correlation, graph/request/activation and scope joins come from the admitted original producer. Settings, focus and a later reconstruction supply none of them. Only GoalRunStarted remains an allowed source alias; BuildStarted is rejected.

The producer submission is the complete EventRecord grammar excluding only Storage's future sequence_id, observed_at_utc and persisted_at_utc. Original append supplies those fields and authenticates whole typed event, eleven-field first barrier, full-value result and exact v2 custody as one original outcome. First receipt must be synced with durability_class=barrier. The idempotency key is `pm.goal-runtime-event.v3:` followed by lowercase SHA-256 of RFC8785 JCS of `["pm.goal-runtime-event-idempotency.v3", scope_partition, "goal_run.started", project_id, goal_id, goal_revision, expected_goal_run_revision, goal_run_revision, goal_run_id, workgraph_ref, activation_receipt_ref]`. Storage owns exact scope partition; inner and outer keys byte-equal. Old v2 keys, schema interpretation and retained readers remain unchanged.

Four compact start families retain Candidate/Commit/Control/Origin only. Their complete declarations and original methods are in the exact start physical/method maps. Keys use lowercase hexadecimal exact UTF-8 scalar bytes without normalization; declared decimal components keep canonical decimal form. `pm.workflow.start_custody_json.v1` is complete closed-wrapper RFC8785 UTF-8 with integer-only numbers and rejection of duplicate keys, malformed UTF-8, surrogates and unknown fields. Physical SHA-256 covers those complete bytes. Native semantic body hashes and original EventRecord MessagePack commitments keep their own domains.

Candidate retains compact identities/selectors/digests, never a producer or native-body archive. Commit retains original issue/transition/event commitments; current control selects the authentic original commit. The four metadata families use RP-AUTHORITY-INDEFINITE/1.0.0 under existing deletion/hold/tombstone controls, are canonical_non_rebuildable and require coherent mandatory backup. This does not extend source/body/EventRecord lifetimes. Full original event claims require its actually available full value under original retention; compact surviving custody cannot reconstruct it. Restore authenticates full original participant closure, versions/bytes/origins, current heads, newer committed truth and actual deletion/recovery state; restored data never restores a lease or capability.

The five D01 lineage families explicitly use their v4 schemas/keys and enrollment/update/coverage v3 methods. Seven ordinary scheduler v2 families and their methods remain exact. Positive D06 preserves all five existing v3 persistent grammars, keys, versions, codecs and lifetimes. Every whole source route change is explicit and preserves historical resources at original IDs. No blanket same-ID registry replacement or new body archive is admitted.


#### Complete producer digest and exact codec admission

Both original start and D06 producer_semantic_digest use the complete shared `Plans/Contracts_V0.md#EventRecord` producer-owned semantic-field recipe, including its exact optional/null presence rules. They do not hash the whole envelope or add event_id, schema_id, schema_version or Storage-assigned fields to that recipe. Full EventRecord, value and physical-wrapper commitments retain their distinct original domains.

Preserve all original unbounded integer domains. No maximum-safe cap, binary64 rounding, truncation or string substitution is permitted. The actual original owner must establish whole-value encode/decode equality and exact codec bytes before append. Storage qualifies its genuine assignment path and verifies the complete assigned EventRecord, first receipt, custody and co-issued values inside the held original operation. An unqualified encoding path remains unavailable/pending, preserves every real prior effect and never yields a fabricated first receipt, narrowed schema or independent repair. Schema meta-validity does not establish native codec qualification.
These custody contracts apply with the complete bounded Executor, FileSafe and Process predicates. Physical declarations and complete whole-value schemas reside under `Plans/executor_cancellation_contracts/`; they do not turn metadata into native capabilities or extend referenced content lifetimes.

#### D05 physical families, key algorithms and origin publication

The complete canonical physical declarations identify all sixteen D05 compact redb families and their complete physical wrappers. They use the Storage canonical MessagePack codec, preserving full valid UTF-8, original exact integer domains, required-present nulls, shortest type-preserving encodings, canonical UTF-8-byte map order, no duplicate keys/trailing values/invalid Unicode and no lossy conversion. Original imported owner values retain their original physical codec; they are not re-encoded as new owner records. SHA-256 covers the whole exact new physical wrapper including family/schema/version/storage/key/value, never selected fields.

K(s) is lowercase hexadecimal of exact valid UTF-8 without normalization. B is SHA-256 of UTF-8 `pm.executor.safestop-scope.v2`, one zero byte, and registered canonical MessagePack of the complete C RunScope. Base key is `{family_id}.v2:K(storage_instance_id):B`. ReservationAllocation, DomainBirth and AggregateHead use base alone. CompileReservationJoin and WorkflowReservationJoin append `:K(operation_id)`. PreAttemptEffectAdmission appends `:ordinal` in shortest nonnegative decimal; the native operation identity remains exact in its value and origin, and the domain allocator enforces unique operation-to-ordinal binding. AllocationCurrent is a private whole-source read, not an additional persisted family. CapabilityBirth appends `:K(capability_id)`; CapabilityDisposition appends `:K(capability_id):revision` in shortest positive decimal. ObligationBirth appends `:K(obligation_id)`. DomainCut appends `:revision` using its own contiguous original domain sequence. CoreEventAdmission appends `:K(writer_id):K(queue_id):queue_generation:ordinal`, both shortest nonnegative decimals. Every remaining immutable row appends `:K(operation_id)`; Recovery uses recovery_operation_id. A distinct row of a repeated family requires a distinct real owner operation ID. There is no arbitrary replacement or timestamp-generated identity.

OriginLocator intentionally carries exact origin physical identity and original operation without a content hash, because issued rows precede the origin that authenticates them. Origin hashes complete already-issued immutable wrappers at the same genuine transaction, excluding itself and the mutable AggregateHead. Its previous_origin selects an already-issued origin; first has null. Source sequence begins at one and never wraps. AggregateHead selects the original allocation, the already-issued latest origin and result/cut, retains each compile/Workflow join once issued and the complete append-only pre-attempt admission history and every original required-flush attempt selection, and is advanced by genuine native CAS in the same durable transaction. Origins cannot hash future results, future C/D06 rows, or their own hashes. Full issued compact rows remain at immutable keys; unequal same-key reuse is conflict. Separate stores need a real native coordinator and original recovery, not matching transaction strings.

Family assignments are RP-AUTHORITY-INDEFINITE compact original custody, subject to explicit owner/codec/retention/backup/deletion/hold registration. They do not extend raw event/payload retention. Whole-boundary mandatory backup preserves the original compact source rows and current head together. Unregistered family, missing original row, unavailable current owner value, recovery uncertainty or source deletion causes unavailable. An index, event projection or equal hash cannot recreate lost original source. The compact custody does not grant runtime availability without authentic original installation.

#### FileSafe complete carriers, journal issue custody and keys

Original values retain their exact complete canonical registry value schemas, without field deletion or renaming, and preserve their original full registry declarations, keys, codecs and retention. A source read returns the complete original value and SourceSelector: actual storage instance, family/schema/version, exact physical key, SHA-256 of stored bytes and messagepack_canonical codec. JSON is the schema/interchange description, not a claim that JSON bytes are the stored MessagePack value. Original required nullable fields are still required. Unknown fields fail the original closed schema.

Three new original-owner compact metadata families use the same registered MessagePack canonical codec and wrapper checks: executor_filesafe_invocation_binding.v2.k1:K(storage_instance_id):K(invocation.invocation_id); executor_filesafe_journal_head.v2.k1:K(project_id):K(restore_transaction_id); executor_filesafe_journal_origin.v2.k1:K(project_id):K(restore_transaction_id):N(revision). Each is project-owned, redacted_refs_only, no inline files/blobs/secrets, and is assigned to existing RP-AUTHORITY-INDEFINITE for original dispatch/journal authority. Owner and codec registration, backup/restore and deletion transactions must include all three families before this profile is installed; absent registration is unavailable, not a default policy. Original safe-point retention remains RP-SAFEPOINT-90D-AFTER-RELEASE and cannot be replaced with indefinite raw-content retention. Linked payload/blob holds follow the original owner while unresolved. Metadata retention does not authorize retention, release or copying of raw files.

At initial FileSafe acceptance, the native FileSafe and Storage owners atomically commit the complete invocation binding, original initial journal, first immutable origin and mutable head together in the single original acceptance/journal-preparation transaction, before mutation or C acknowledgement. There is no binding-only or journal-only initial commit. Revision 1 has both prior selectors null and requires authentic original absence plus the independently derived whole initial journal candidate. Every subsequent original journal write atomically commits its full current journal candidate, new immutable origin and mutable head in that actual original journal transaction. Every later revision increments exactly once and authenticates the complete live prior journal before overwrite plus its immutable origin; the prior journal issue commitment persists its identity/hash, not its body; concurrent writers compare the prior head and native owner lease in the transaction. The issued_journal_commitment hashes the exact original stored journal bytes at that original write. prior_journal_commitment and issued_journal_commitment are historical issue commitments carrying original family/key/codec/hash; they do not promise that old values of the mutable same-key journal remain readable. The origin is serialized after that selector is known; the head selects that origin after its bytes exist. No origin hashes its own head or itself. Initial resolution has resolved_original_result null; later result-link-only origins select the first authentic resolution origin. A missing historical origin is not backfilled by the cancellation reader.

##### Injective FileSafe original key algorithm

This source profile requires `filesafe_original_injective_keys.v1` to be authentically installed by the original FileSafe/storage owner before original binding admission and journal preparation, hence before any mutation. Every admission, journal write, origin/head read, acknowledgment, reconciliation, restart readback, backup/restore and deletion boundary must use the exact disjoint `.v2.k1:` key profile defined here. K is lowercase hex of exact valid UTF-8 identifier bytes, with no Unicode normalization, case folding, rejection of colon-containing identifiers or other narrowing of the original identifier domain. N is positive decimal revision with no leading zeros. Components have fixed arity, so the inverse splits only the separator, decodes each even-length lowercase hex component as exact UTF-8, and parses the last numeric component for origin keys. A malformed key, wrong prefix, wrong arity or noncanonical spelling is not an alternative identity.

The three stored value schema IDs, schema versions, headers and complete grammars remain exactly v2; codec is unchanged. This is a physical key/source profile revision, not value-version migration. The new source URI and its own self-references differ together as a complete document. Imported original C2, permission, safe-point and journal roots are unchanged. Consumers must explicitly consume this complete source document and require original profile installation under the native owner boundary; shape equality, version equality or a renamed old selector does not prove provenance. The original owner must check the installed profile in its actual authoritative original admission/preparation and every current boundary, using the existing authentic private source/codec/retention/backup boundary rather than accepting caller-supplied profile strings. No schema-only value is an installation receipt.

An operation originally born under the old raw v2 key profile is unsupported by this successor even if its values compare equal; do not discover, rename, backfill, copy or relabel it into the new profile. Missing authentic original installed-profile custody returns unavailable (unsupported_source_profile or original_custody_missing as applicable); it does not admit new work or remove an inventory member. A caller cannot change the profile for an existing operation. Historical raw-key profiles remain separately versioned and cannot qualify here. Only original new-profile operations are eligible. Existing original safe-point, permission and restore-journal families keep their exact original keys, codecs and lifetimes; this profile applies only to the three new compact metadata families. No whole-journal history or raw content archive is added.

UTF-8 encoding of valid identifier strings is injective; lowercase hex is an injective encoding of bytes and contains no colon; fixed arity colon concatenation is therefore injective. Positive canonical decimal revision is injective and occurs only in its fixed final position. Prefixes are disjoint from the old raw profile and each other.

#### Process complete physical records, keys and original write order

The complete canonical physical declarations identify all fifteen Process compact redb families and their complete Physical wrappers. The whole wrapper has family_id, schema_id, schema_version, storage_instance_id, physical_key and the complete closed payload value. No generic JSON payload is admitted. Original MCP lifecycle, CURRENT, manifest and first-receipt custody values remain unchanged whole original canonical owner schemas and declarations. Those original families retain their existing physical codecs and keys; they do not acquire this new wrapper.

For new keys, K(s) is lowercase hexadecimal of the exact valid UTF-8 bytes of s, without Unicode normalization. B is SHA-256 of the UTF-8 domain `pm.executor.process-probe-key.v1`, one zero byte, then registered canonical MessagePack of the complete DispatchInvocation. No timestamp, PID, display name or caller-selected JSON participates. The key prefix is `{family_id}.v1:K(storage_instance_id):B`. The single immutable ProbeBirth and mutable ProcessSourceHead use that exact prefix. ProcessBirth appends `:K(native_spawn_operation_id)`; membership appends `:revision` using shortest positive decimal; normalized admission appends `:K(stream_id):ordinal` with shortest nonnegative decimal; writer cut appends `:K(writer_id):K(native_cut_operation_id)`; every other immutable source appends `:K(operation_id)` (recovery uses recovery_operation_id). The original source origin uses its own operation_id. An operation issuing several distinct source records reserves distinct original source-write operation IDs within its real transaction; it cannot collide at a same-family key. Reusing an immutable key with unequal bytes is conflict. There is no replacement-write version archive for raw output.

New wrappers use the exact Storage canonical MessagePack codec in Case L-2: shortest type-preserving integers/strings, UTF-8-byte map order, required-present nulls preserved, no duplicate keys or trailing values, no invalid Unicode and no lossy numeric conversion. The existing representation limits are codec refusal, not newly imposed schema limits. SHA-256 covers complete exact physical wrapper bytes. OriginLocator deliberately has exact family/schema/version/key/operation identity but no origin content hash: its record is issued before its authenticating origin can hash the record. OriginalWriteOrigin hashes the issued complete wrapper, identifies the actual native operation/transaction/owner and chains to the prior immutable origin and issued record. It never hashes itself. ProcessSourceHead selects the already-serialized latest origin and current immutable source rows. Origins do not include the mutable head as their own afterimage. The actual native storage writer commits the issued wrapper, its origin and the head CAS at one genuine durable transaction boundary; native capability release follows that commit.

The first probe-admission origin has probe_birth=null and no prior record/origin; later origins select the already-issued immutable birth. Sequence begins at one and increases exactly once per original source write. All mutable current selection is through the actual ProcessSourceHead; membership snapshots are immutable at revision keys. Readers never reconstruct overwritten historical bytes. Full original issued rows remain compact metadata under their own immutable keys. A same-operation read or crash recovery retrieves exactly the original record and origin; it does not issue a new observation time or a replacement successful result.

The new families are assignments to existing RP-AUTHORITY-INDEFINITE for compact original-operation/capability/receipt custody. Canonical owner registration must explicitly add their exact wrappers, keys, codec, whole-boundary backup, holds and deletion handling; absent registration means unavailable. Original MCP lifecycle retains RP-RUNTIME-365D and mandatory backup; original Storage control/receipt families retain their own policies. No assignment extends raw event/log/transcript lifetime. Admission metadata, normalized queue commitments, receipts and terminal source origins contain no raw credentials, decrypted launch environment, absolute host paths or provider-visible output. They are not a hidden logging archive.

#### Event registry, terminal caller and remaining proof boundary

The exact started-v3 source-family selection and complete original reader/consumer/projector/checkpoint are now governed by GRS-079/SP-311. The separate complete cancelled-v3 consumer/projector/checkpoint and existing-family v3 source selection are now GRS-080/SP-312; original started-v3 routes and all native proof gates remain unchanged. Actual original native v3 publication and reads remain unavailable until the corresponding original owner/custody/codec/root/backup and current-source boundaries qualify. This source contract supplies no Event-depth pass, cannot borrow Executor run.started qualification and cannot replace a full original EventRecord claim with receipt-only custody.

Positive D06 has a separate originally registered terminal-service source boundary and its own required first append barrier. It does not mutate D05's sealed work queues, capability/admission history, final flush or sticky failures. If SP-305's actual outer Goal operation holds a competing pre-reserved sequence/segment/offset append/rotation fence, D06 remains unavailable until the original Goal/Storage owner supplies its explicit compatible caller/assignment successor. No foreign lock release, fake receipt, omitted event, widened numeric domain or generic post-cut exception is admitted. D05 imports no future D06 result, event or Goal terminal; the positive consumer imports complete fresh D05 readback.

RequiredCheckpointSuccess remains false. Every actual required checkpoint, unsupported pre-attempt effect, unknown capability/obligation, pooled/shared process, arbitrary callback or unsupported role remains unresolved in the complete original census. The admitted product controls, default pooling, Stop priority, independent effect ownership and all source/raw lifetimes remain unchanged. No original source is recreated from a schema, event projection, surviving hash, current body, PID scan or new producer operation.

Source/schema checks establish no native installation, actual capability/root authentication, source execution, exhaustive native enrollment, concurrent exclusion, exact codec execution, cross-store atomicity/fsync/crash behavior, complete current/retained replay, backup/restore or outer Goal integration. Those runtime proofs remain NOT_RUN. No runtime launch, global D05 closure, event-depth pass, WorkNode/NodeSeed/readiness admission or governance seal follows.
#### Exact v3 event-depth handoff

Original-start producer/source adoption does not discharge SP-214's separate event consumers. The actual selected v3 `goal_run.started` route must independently bind the complete original EventRecord/payload, scoped identity/digest, original first receipt and whole-value custody, exact retained/current source reader, current traversal/inspection boundary, every actual effect and its checkpoint or owner-justified none_required disposition. Original source unavailability refuses that claim rather than downgrading it to receipt-only proof. Disposable projection rebuild cannot manufacture original event, source, native state, receipt, dispatch, provider/tool or Usage effects.

The v3 family revision/schema route requires explicit event-registry and consumer adoption while preserving whole historical v2 readers and RP-RUNTIME-365D/1.0.0. The sole GoalRunStarted alias does not change payload admission. SP-278 whole original read/custody and SP-286/CV-339 first-receipt/full-value obligations remain mandatory at their actual lifecycle boundaries. Do not borrow Executor `run.started` reader/checkpoint qualification for Workflow `goal_run.started`, or infer an event-depth pass from the new source schema, its ordinary static checks, a barrier receipt alone or the registration row. The full original started reader/projector/checkpoint/replay source contract is now SP-311 with GRS-079/EP-120/BRS-027; its actual original native installation, execution, source disclosure and replay/atomicity proof remain independently pending.

#### Outer Goal caller and qualification boundary

SP-305's original exclusive pre-reserved sequence/segment/offset fence cannot be assumed compatible with the required subsequent D06 append. If the actual outer Goal operation still holds that competing append/rotation fence, positive D06 native availability is blocked until the original Goal/Storage owner supplies its explicit compatible caller/assignment successor. This source does not release a foreign reservation, suppress/reorder D06's required event, widen reserved numeric domains or invent a first receipt. Any separately adopted successor must name its exact original phase, methods, whole arguments and source/codec authority; D06 alone supplies no end-to-end Goal terminal consumption.

These additions establish source contracts only. Native installation/capability authentication, actual original source execution, both final fences/all-writer exclusion, exact codec execution, cross-store atomicity/fsync/crash recovery, current/retained replay, coherent backup/restore and outer Goal integration remain NOT_RUN. No runtime launch, event-depth pass, global D05 closure, WorkNode/NodeSeed/readiness admission or governance seal follows. All previously admitted product controls and separately versioned source contracts remain applicable.

#### Event and native qualification boundary

GRS-079/SP-311 now adopt the complete original started-v3 reader/consumer, owned durable projection/checkpoint and exact existing-family registry selection. GRS-080/SP-312 now separately adopt the complete positive cancelled-v3 consumer, versioned combined projection/checkpoint and exact existing cancelled-family v3 source selection. Existing started-v3 methods, rows and profiles remain unchanged. The original started RP-RUNTIME-365D and cancelled RP-AUTHORITY-INDEFINITE policies remain unchanged. Neither source adoption nor a registry row clears Event depth, original native source/codec/custody/backup qualification or runtime execution; those independent gates remain unproved. No sibling checkpoint or passive none_required disposition is borrowed.

Native installation/capability authentication, complete original source execution, both final fences and all-writer exclusion, exact codec execution, original atomicity/fsync/crash recovery, current/retained replay, coherent backup/restore and compatible outer Goal terminal integration remain NOT_RUN. RequiredCheckpointSuccess is false in the bounded aggregate. No WorkNode, NodeSeed, executable queue, runtime/readiness admission, global safe-stop closure, Step 9 result or governance seal follows from these source contracts.

```yaml
plan_unit_id: SP-309
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Workflow and bounded safe-stop original physical custody. Exactly 55 complete new wrappers produce
  a 275-family registry while all 220 existing stored contracts and 27 policy objects remain exact.
gui_related: false
gui_classification_reason: Defines original runtime source, owner, storage and verification semantics without a
  visual surface.
split_recommended: false
depends_on:
- SP-278
- SP-286
- SP-308
- EP-118
- EP-119
unblocks: []
acceptance_criteria:
- Exactly 55 complete new wrappers produce a 275-family registry while all 220 existing stored contracts and 27
  policy objects remain exact.
- Four existing family rows receive only the enumerated bounded owner/read/scope metadata; 216 existing whole rows
  remain unchanged.
- Exact original key/codec/hash domains, source realms, mutability, first-receipt custody and phase-specific absent/current/retained
  conditions are preserved.
- Complete new custody uses the existing authority retention policy without extending referenced event, body, raw
  input or source lifetimes.
validation_surfaces:
- Plans/executor_cancellation_contracts/methods.json
- Plans/executor_cancellation_contracts/realm-entry-boundaries.json
- Plans/executor_cancellation_contracts/physical-families.json
- Plans/executor_cancellation_schema_resources.json
- Plans/storage_value_registry.json
risk_class: original_workflow_source_custody_or_native_admission_drift
reasoning_tier: high
context_scope: sp_309_original_source_contract
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/executor_cancellation_contracts/methods.json
- Plans/executor_cancellation_contracts/realm-entry-boundaries.json
- Plans/executor_cancellation_contracts/physical-families.json
- Plans/executor_cancellation_schema_resources.json
source_atom_ids: []
negative_constraints:
- No public command, event-membership, Goal lifecycle or retention-policy expansion.
- No fabricated source, absence, origin, receipt, current body, native authority or retrospective original enrollment.
- No numeric coercion, lossy codec, hidden effect/census member or required-flush failure removal.
- No WorkNode/NodeSeed/runtime/readiness/event-depth/global safe-stop or governance claim from source adoption.
```

ContractRef: ContractName:Plans/executor_cancellation_contracts/methods.json, ContractName:Plans/executor_cancellation_contracts/realm-entry-boundaries.json, ContractName:Plans/executor_cancellation_contracts/physical-families.json, ContractName:Plans/executor_cancellation_schema_resources.json


### SP-310 - Original Workflow Goal cancellation stored profiles and physical custody

#### Exact codecs, numeric domains and commitments

All six declared metadata/versioned carrier profiles use original `pm.goal.cancel_command_json.v1`: sorted ASCII object keys, exact scalar UTF-8, original array order, compact separators, original short/control escapes, exact canonical mathematical decimal integers, no normalization/BOM/final LF, and duplicate/unknown/surrogate/noninteger/decode-reencode mismatch rejection. This retains arbitrary precision where the logical schema permits it. Actual EventRecord MessagePack and the genuine original SIR/CV-333 codec remain their distinct original codecs; they are never replaced by the Goal JSON encoder. BeforeStopReadiness selects exactly the four genuine original codec resources defined by original AssignmentInput, with their complete version/resource commitments. A codec resource digest is not native encode/decode capability evidence.

Plans/goal_workflow_cancel_contracts/numeric-paths.json preserves every original declared producer/result/outcome/response root and potential numeric field, including original null and branch alternatives. Before Stop, actual native owners independently enumerate the complete original expanded schema graph and qualify all known values and exact derived domains, including permitted currentness/Stop/control/phase increments. No schema maximum is newly narrowed to make the adapter pass. Fields derived from future Storage assignment are explicit FutureNumericPath entries with no fabricated value; the event template's sole new late term is sequence_id from the actual original Storage reservation owner. Original runtime hash and timestamp terms retain their exact grammar and domains; identities, literal content and producer times are not mutable template slots. Whole immutable event payload remains the original registered v3 payload, including null plan_version for this exact Workflow association.

After owners settle, late qualification uses the actual reserved sequence/segment/manifest/offset, actual complete encoded EventRecord bytes and exact original frame/header/durable-end arithmetic. It enumerates the entire actual final public V3 result and original outcome/response graph, including duplicate nested receipt/publication fields and original progress-selector epochs, and checks all values/domains under every selected actual codec. It computes no first receipt before its real barrier. Runtime timestamps/hash outputs use the admitted exact domains and real original generating owner; their representability must be proved for every value admitted by that domain. Any late unrepresentable actual value prevents Goal append and successful terminal publication while preserving earlier genuine effects. An incomplete path list, single sample value or caller asserted representability is unavailable, not proof.

Immutable readiness, WorkflowScopeProof and late-assignment argument hashes commit to the complete original argument bytes at their own issuing phase. Later methods authenticate that genuine original metadata issuance and the original selected outputs, then validate their own freshly fetched phase-appropriate current controls. They never compare a later current argument hash as if it were the earlier captured hash, and never reconstruct an old whole argument from retained metadata. This remains true when progress/head advances or C-publish clears cancellation_pending and installs the receipt marker: successful terminal admission checks that authentic post-publication state, not the earlier pre-publication pending slot. Original selected terminal progress remains a separately authenticated immutable snapshot.

Selected SHA-256 values always hash complete actual physical outer bytes using their own registered codec/version, unless explicitly semantic below. BeforeStopReadiness.goal_argument_sha256 and native_argument_sha256 hash complete original BeforeStopEntry and BeforeStopNativeEntry respectively. WorkflowScopeProof.goal_argument_sha256 and native_argument_sha256 hash complete OriginalOwnersEntry and OriginalOwnersNativeEntry. LateAssignmentAudit.complete_goal_argument_sha256 hashes complete LatePrepareEntry; complete_native_argument_sha256 hashes complete OriginalOwnersNativeEntry; complete_assignment_input_sha256 hashes complete LateAssignmentEntry. Each argument digest is SHA256 of UTF8("pm.goal.workflow_cancel.argument.v1") + LF + UTF8(the exact definition URI) + LF + the complete exact local Goal JSON argument bytes. These transient whole arguments include their full native values; the physical metadata retains only their digest and no full source snapshot. Their referenced native physical selections continue to use actual native physical codecs; hashing a transient argument does not recode stored native bytes.

exact_encoding_template_sha256 hashes UTF8("pm.goal.workflow_cancel.event_template.v1") + LF + complete original EncodingTerm Goal JSON. complete_numeric_inventory_sha256 hashes UTF8("pm.goal.workflow_cancel.numeric_inventory.v1") + LF + the complete corresponding original BeforeStopNumericInventory or complete late ordered NumericPathDomain array, as determined by the containing readiness/assignment definition; complete_original_schema_inventory_sha256 selects the complete actual expanded schema inventory including root/branch/field roles. The codec registration must pin that complete expansion. The original producer_semantic_digest retains its complete original producer canonical preimage and hash algorithm; it is not the metadata argument digest. All selected refs identify already issued values; no self or future commitment is inserted. Metadata issuer transaction/owner/root/permission source is authenticated by the actual issuing owner, not by the content of OriginalTransaction.

#### Physical custody, retention, migration and backup

Plans/goal_workflow_cancel_contracts/physical-profiles.json declares three versioned original progress/control-publication/terminal profiles and three new compact lineage families. Each exact selected key, wrapper schema/version, storage instance, original scope and operation agree. Original SourceAudit, host Stop, StopReceipt, minimal receipt and BodyControlV2 keep exact original physical types/keys/bytes. New versioned progress head keys cannot select epoch rows and vice versa. Immutable same-key changed bytes conflict; equal retry means authentic readback of the original issued row, not a fresh issue. Head CAS authenticates the whole prior head and matching epoch plus actual original native owner/fence; new epoch and head publish atomically.

Actual redb family registration, versioned wrapper codecs, original root/installation/migration provenance and coherent backup participation must exist before admission. Empty lookup, matching JSON or resource installation alone cannot create family/root authority. Existing V1 families and original V2 accepted operations remain callable in their exact profiles; no existing bytes are relabelled. New Goal profile rows arise only under a genuinely new correctly accepted original source. Pre-enrollment images/runs cannot acquire these original records retrospectively. Fresh-root migration, authenticated restore, same-owner restart and withdrawal retain their distinct actual original owner contracts; no generic reconstruction path is added.

The three new compact lineage profiles contain original source/operation/run/owner identifiers, selectors, commitments and codec/domain metadata, with no reachable full Goal/native body or EventRecord schema. The three versioned original audit profiles preserve their complete original recursive record fields. In particular terminal.response.error retains the full typed UICommandError, including textual reason and offending_field on applicable no_effect/unknown branches; it is not classified as content-free merely because it is audit. All these existing fields retain their exact original bytes and meaning. The complete profile-composition and fixed physical-route schemas preserve every expanded stored property and branch/constraint site; SP-310 assigns their actual semantic classes. The versioned records inherit the original complete command/event audit policy; the new compact records use the existing original-lineage class under the same RP-AUTHORITY-INDEFINITE@1.0.0 policy, with creation anchor, no TTL/count/byte eviction, original hold eligibility and fail-closed overflow. Original identity/ref fields remain authentic original identifiers; no field is stripped, replaced by a hash, renamed or sanitized to force a retention classification. Original source admission and privacy restrictions apply independently, before acceptance, and cannot rewrite an already accepted original result. No new retention period or full mutable-body archive exists. A hash/ref creates no hold on the referenced Goal/history/Workflow/D05/EventRecord source. Native source bodies remain transient full inputs subject to their existing independent lifetimes and privacy/deletion rules.

Actual backup capture includes the complete coherent original Goal body/control/history/origin while retained, existing Stop/receipt/source/selected progress/SIR/event/first-custody unit, six new/versioned profile records, original positive D06 result/origin and applicable original D05/start/native custody through their real qualified owners. A list of refs is not a coherent capture. Required original current root/permission/deletion/hold/restore controls are revalidated after helpers before capture/release. Restore authenticates the real protected image and selected original Storage coordinator, applies current tombstones before content release, preserves newer Stop/progress/terminal, and refuses missing required original custody. It cannot regenerate an expired source or treat an image missing new mandatory families as complete. Withdrawal removes current effect authority without fabricating no-effect or deleting lawful retained original facts.

#### Complete stored-profile and physical-key validation

This is a nonstored validation composition for the original Goal cancellation owner and Storage. It creates no envelope, command profile, native capability, caller dispatch choice or migration. The immutable original SIR acceptance and installed original owner descriptor select the command result profile. The actual owner derives the validation input from that native acceptance, the real database key and the complete decoded stored wrapper; a caller-supplied validation object establishes none of them.

The three existing logical families keep both original profiles active. An operation originally accepted as `pm.goal.cancel.result.v2` uses its entire original V1 wrapper, unversioned physical prefix and original native methods/readers. A genuinely new operation accepted under `goal_workflow_cancel_late_assignment.v1` with `pm.goal.cancel.result.v3` uses the entire V2 carrier wrapper and `.v2:` prefix. The three compact lineage families admit only that genuinely original V3 Workflow profile and their exact `.v1:` keys. No old accepted command changes profiles on retry, restore or retained read.

`Plans/goal_workflow_cancel_contracts/schemas/storage-profile-composition.schema.json` gives each existing family a real, referenceable complete validation-schema ID/version 1.0.0. These IDs are **not stored wrapper IDs**. Each value definition is an exact `oneOf` of references to the whole old and whole new wrapper. Every member retains its original literal stored `schema_id` and `schema_version`. The registry's `value_schema_id`, `value_schema_ref`, `schema_version` and `value_schema` identify this composition; `Plans/goal_workflow_cancel_contracts/physical-profiles.json` explicitly records the actual stored member identities. New lineage rows reference their whole actual stored wrapper directly. The existing registry schema already allows a complete JSON Schema object in `value_schema` and a referenceable schema identity; no registry-schema extension is used.

For each actual storage operation:

1. Independently authenticate the actual original acceptance/profile, operation, family, owner/root/registration/codec, current phase, permission and deletion/hold/recovery/backup boundary. Select the fixed key/value definition for that family and accepted profile. This selection happens before inspecting a candidate as possible stored truth. Other public V2 Goal/Plan operations retain their original route, not a fallback through this Workflow profile.
2. Decode the complete actual wrapper with `pm.goal.cancel_command_json.v1`, without lossy numeric conversion, replacement characters, duplicate keys or field projection. Validate it through the registry's complete family `value_schema` and the exact selected key/value definition. Every branch references the whole original wrapper, not a shortened header or record substitute. A mismatch is unavailable/conflict under its original phase; it does not select another profile.
3. Require the physical key to match the fixed profile prefix and exact component count. Decode each `k(s)` as even-length lowercase hex of valid scalar UTF-8. Reject malformed, noncanonical or normalized spellings; do not reject otherwise valid colon-containing or Unicode identifiers. The five components are storage instance, project, thread, Goal and original operation. For audit carriers compare each decoded value to its complete `record` field. For compact lineage compare the first four to `record.scope`, operation to `record.operation_id`, and also compare the outer `storage_instance_id` and `physical_key` to the actual database/root/key. The whole method-specific original scope and identity joins remain mandatory.
4. For progress, `:head` accepts only the full `ProgressHead` arm inside the complete wrapper. `:epoch:N` accepts only the full `Progress` arm. `N` is canonical nonnegative mathematical decimal, with no leading zero except zero, and equals `record.progress_epoch`. Validate the current head and its actual selected immutable epoch together; `snapshot_sha256` hashes the complete exact outer epoch bytes. Never use a head in place of a selected epoch, use the current head for an old terminal selection, or infer original absence from a failed lookup.
5. Derive the entire permitted write candidate under the original native phase. Genuine first absence belongs only to original admission. Immutable unequal occupancy conflicts; equal occupancy requires actual same-original readback rather than another issuance. A progress advancement publishes the new immutable epoch and head CAS atomically; terminal selects its genuine original immutable epoch. No generic update, rekey or migration path is introduced.
6. Every independently callable owner/lower Storage reader or writer repeats the complete original before-helper and final pure whole-source/candidate/owner/permission/hold/deletion/backup/codec predicate, including actual database key, accepted profile, root and phase. No returning helper, callback, logger or mutable gap follows the final predicate before that write/disclosure. A successful JSON Schema check is only one part of this predicate.

The combined producer/consumer lists on the three registry rows are family inventories, not permission cross-products. `Plans/goal_workflow_cancel_contracts/physical-profiles.json` preserves each old list exactly and assigns new adapters only to the newly accepted profile. SP-313 adds only its two private consumers to the Workflow V3 progress list and inspector v2 to the Workflow V3 late-assignment list; all original entries and every V2 list remain exact, and the five registry consumer additions are qualified inventories only. The source method signatures and original phase contracts remain complete. Control-publication terminal consumers authenticate its full original record through the genuine selected progress/publication custody; unsettled branches require that publication only if it actually occurred. No-effect or unknown replay gains no future successful-publication prerequisite.

This source adoption contains schema/configuration checks, not encoded native values, schema instances, runtime readers, migrated records, source-custody proof or native codec qualification.

#### Original Goal Workflow cancellation physical custody

The baseline is commit `953634d128bb5d216c25070b64cdacbb894a141c`, with 275 storage families and 27 retention policies. This source adoption adds three genuinely new compact lineage families and adds an explicit second stored profile to three existing logical audit families. The resulting family count is **278**. All 27 policy objects remain exact. The other 272 existing registry rows remain byte-equivalent as JSON objects. The three changed rows retain their original family identity and exact historical member schemas.

`goal_cancel_progress`, `goal_cancel_control_publication` and `goal_cancel_terminal_audit` retain the complete original V1 stored wrappers, keys, codec, native producer/read routes and active original V2 command admission. The additional V2 wrappers arise only from new original commands accepted with the complete V3 result under `goal_workflow_cancel_late_assignment.v1`. The old profile is not a read-only compatibility route. A new nonstored, explicitly versioned schema composition validates both complete wrappers and the original-acceptance-selected physical key/value route. Each physical member keeps its literal stored schema ID/version. Registry composition identities are validation metadata and never appear as new stored envelope headers.

The three new families are `goal_workflow_cancel_readiness`, `goal_workflow_cancel_scope_proof` and `goal_workflow_cancel_late_assignment`. Their complete frozen outer wrappers contain `schema_id`, `schema_version`, `storage_instance_id`, `physical_key` and the entire closed record. Readiness is issued by the original prepare adapter before Stop with no append reservation. Scope proof is issued by original owner settlement together with the corresponding progress epoch. Late-assignment audit is issued by the genuine Storage assignment owner after the actual original late reservation; the record cannot recreate that reservation or prolong its native fence. Their exact producer/consumer and phase bindings appear in the full profile map and frozen source method map.

All six new/versioned profiles use the existing `pm.goal.cancel_command_json.v1` codec: sorted ASCII object keys, exact scalar UTF-8, original array order, compact separators and original escapes, exact canonical mathematical decimal integers, no normalization/BOM/final LF, and rejection of duplicates, unknown fields, invalid surrogates, noninteger values or decode/re-encode mismatch. This does not replace EventRecord MessagePack, native physical codecs, or original SIR/CV-333 encoding. Whole outer values and selected immutable epoch hashes use their actual original codec. Argument, template, numeric inventory, producer-semantic and physical-value commitments retain their separately declared preimages and domains. No maximum-safe narrowing or floating-point truncation qualifies an otherwise unsupported codec.

The audit carriers preserve their entire original recursive record graphs. Progress retains its complete original phase-dependent Stop/receipt/settlement/producer/publication/control fields, with full head versus immutable epoch semantics. Control publication retains complete original control/body/currentness commitments and original settlement/publication audit; it does not archive a Goal or Workflow body. Terminal retains the whole V3 result, original outcome and UICommandResponse, including applicable unknown/no-effect diagnostic branches. A successful branch separately requires `error=null`.

In particular, UICommandError `reason` remains its original nonempty text up to 512 characters, and `offending_field` remains the original string-or-null up to 160 characters. These are actual typed diagnostic text, not opaque identifiers or hashes. GoalError retains its distinct code/evidence/offending-field meaning. The former blanket content-free annotations cannot accurately describe these complete terminal branches; the explicit row delta corrects the classification without rewriting any old stored schema, field, value, key or lifetime. Original owner privacy and source admission still apply before acceptance/issuance. This permits no new arbitrary user reason, objective, prompt, decrypted secret, body archive, or post-hoc sanitization. An unsupported original value cannot be made admissible by removing fields.

The complete field classification is based on actual reachable schemas: 831 distinct family/value paths, 3,122 constraint-bearing field sites, 523 object/required/closure sites and 527 resolved reference sites across the six new/versioned wrappers. Independent traversal reproduces every frozen classified path and constraint, including conditional and nullable branches. The three new compact lineage graphs reach identities, exact selections, hashes, codec descriptors, numeric/domain and actual reservation/issuer metadata. They do not reach a full Goal/Workflow body, D05 argument, EventRecord or source frame. Schema descriptor paths/pointers, original segment locators and scope/account/environment identifiers keep their declared owner meanings; they are neither automatically user content nor automatically safe because their names end in `_id` or `_ref`.

All six profiles use existing `RP-AUTHORITY-INDEFINITE@1.0.0`: actual creation anchor, indefinite retention, no new TTL/count/byte eviction, existing hold eligibility, fail-closed overflow and original privacy/deletion/restore rules. The three audit profiles inherit the original complete command/event audit meaning. The three new metadata profiles use the existing original lineage/assignment authority class. There is no new retention policy or universal content-free category. References and commitments create no hold on Goal/history/Workflow/D05/EventRecord sources and never recreate disposed source bytes. A retained terminal may report original command facts only; it cannot prove a current EventRecord or current native source remains available.

Each authoritative profile is canonical non-rebuildable custody and requires actual mandatory coherent backup. Before admission the genuine Storage owner must enroll the exact family/profile/key/schema/codec/root in its original backup/restore, deletion/hold and migration boundaries. Registry `materialized` is a source-definition classification, not proof of installed native writers or successful backup. An absent registration or missing required authority fails closed; it does not become a default policy or a rebuildable projection.

A coherent capture includes all **actually issued** records for the original scope and authentic phase/absence evidence for profiles that have not yet issued. Capture the existing SourceAudit, Stop/control/receipt, current progress head plus selected immutable epochs, SIR terminal/outcome/response, original event/first custody, versioned control publication and the three compact lineage values at their real phases. Include original positive D06 result/origin and applicable retained D05/start/native sources through their real owners. Full Goal body/control/history/origin and event/source bytes enter only while legitimately retained and required by that original boundary. An early no-effect or unknown outcome cannot be forced to contain a future assignment, D05/D06 success or publication. A family list, empty array, surviving reference or lookup failure is not coherent capture or proof of nonissuance.

Capture and release independently authenticate actual original owner/root/permission/deletion/hold/codec/backup controls before helpers and in the final pure predicate. Restore uses the protected image and genuine original Storage coordinator, applies current tombstones before disclosure, preserves newer Stop/progress/terminal truth and authenticates the original immutable selected epoch and whole outer hash. It cannot silently accept an image missing an issued mandatory family, backfill an origin, alter old keys, manufacture an EventRecord or revive a lease, native process, late reservation, callback capability or runnable release. Missing original authority remains data loss/unavailable under the existing disclosure/recovery path.

A lost or released late reservation cannot be reacquired by this stored audit. Same-owner restart may only resume a genuinely already admitted stage whose complete native fences still hold. Unknown or refused later work preserves every real earlier Stop/receipt/D05/D06/append/control effect and never fabricates no-effect or success. Retained succeeded and unsettled readers keep their distinct complete source prerequisites; neither replays cancellation or demands disposed historical bodies. Withdrawal removes current effect authority while preserving lawful original audit facts and original deletion/hold dispositions.

Existing shared SourceAudit, host StopControl, StopReceipt, minimal cancellation receipt and BodyControlV2 remain their exact original families/keys/bytes and actual owner routes. This source adoption does not count them again. Source SP-304/SP-305, GRS-073/076 and SIR-050/051 passages were reread against the baseline and remain byte-equal; their earlier pins are preserved. New SP-309/BRS-025 source prerequisites and their unresolved native/event/outer-Goal gates are explicitly retained. The physical registration does not close active Workflow v3 event producer/consumer/registry integration, event depth, native capability/codec execution, atomicity/crash/backup qualification, or end-to-end Goal cancellation. No schema/native instances were created.

#### Existing readiness validator representation gap

The 278-family registry validates against the unchanged `Plans/storage_value_registry.schema.json`. Its complete profile composition preserves all original V1/V2 stored headers and schemas. This is source/configuration validity, not implementation readiness.

The actual baseline `scripts/pm-implementation-readiness.py` (SHA-256 `7101cbd81f9c8670c20c2824f77db1708001ad36213a77d3f383aa5e42c4579f`) uses an inline, single-stored-header assumption in `storage_value_registry_data_failures`. Its materialized-row checks require `value_schema.type=object`, `additionalProperties=false`, inline matching required/properties, and one `properties.schema_id.const` plus one `properties.schema_version.const` equal to the row's metadata. It does not resolve the existing three whole-wrapper references. It also still expects 88 families.

Calling that unchanged pure function on the pinned 275-family baseline and proposed 278-family registry yields **85 failures in each**, including **24 failures on the same three carrier rows**. No additional error class or count appears. The expected family count remains the pre-existing 88; the observed count changes from 275 to 278. The three reference rows still fail the same eight inline-shape checks each. The source validation report preserves exact per-row before/after diagnostics and expected-versus-observed identities.

The added composition has a further representational requirement even after reference resolution: its own schema identity is a real nonstored family validator, while its member values deliberately retain two distinct original stored IDs/versions. One synthetic inline `schema_id` or `schema_version` constant cannot honestly describe both. Adding the composition's identity as a stored-header const would reject both real original wrappers. Relabelling stored members, inventing a new envelope, changing old accepted-operation routes, or counting the old profile as a new logical family would violate the source contract.

A future explicitly owner-qualified readiness contract must resolve the full fixed family schema, recognize the separate nonstored validation identity, and check each complete native-accepted profile's original wrapper/key/codec/producer/reader branch. This source adoption does not implement or authorize that validator change, change the registry schema, or claim an implementation-readiness/gate pass. The source adoption preserves this readiness limitation.

**2026-09-23 follow-up.** Section 2.3.1 now states the owner-qualified readiness contract that this subsection called for, written on Jared's 2026-09-23 instruction to repair the Storage registry findings, and the readiness validator implements it. The three rows resolve their composition and both whole wrappers in the declared `goal` realm. The composition identity stays validation metadata, and each wrapper keeps its literal stored header. This clears the 24 inline-shape failures on these rows without relabelling a member or inventing an envelope. The registry rows, the registry schema and every stored identity are unchanged. Native codec, key, producer and reader qualification remains NOT_RUN.

**2026-09-24 follow-up: member wrapper digests.** Each `whole_wrapper_sha256` in `Plans/goal_workflow_cancel_contracts/physical-profiles.json` is the lowercase hexadecimal SHA-256 of the UTF-8 bytes of one text. That text is the JSON value the member's `whole_wrapper_ref` resolves to in the `goal` realm of `Plans/goal_workflow_cancel_schema_resources.json`: the definition at the reference's JSON Pointer, not its whole document. It is written with object members in document order, not sorted, two-space indentation, one member or array element per line, `": "` after each member name, non-ASCII characters as UTF-8 rather than escapes, and one final LF. Exactly, it is Python's `json.dumps(definition, ensure_ascii=False, indent=2) + "\n"`. The digest pins the reviewed wrapper schema definition inside the declaration. It is not a hash of any stored value, and it does not use `pm.goal.cancel_command_json.v1`, the codec of the stored wrappers themselves. This is the recipe of the generator that wrote the declaration: `build_proposal.py` of the physical source package whose manifest `reports/event-authority-20260911/step-08-goal-workflow-coordinator-checks.json` pins by SHA-256 `1c2a331b8fc097a6215712227e7abb0250a8334ec73dd33401bd92d68f4b8ab2`. It reproduces all six declared values from the current hash-pinned documents. Readiness recomputes each member's digest and rejects a member whose declared value differs (section 2.3.1), so a changed wrapper definition needs a newly declared digest even when the resource map's document pin is refreshed. Decided by Jared, by delegation to the coordinator, on 2026-09-24 (DL-076).

```yaml
plan_unit_id: SP-310
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Original Workflow Goal cancellation stored profiles and physical custody. Three existing logical
  families preserve their full original active profiles and add three exact new stored profiles; three new lineage
  families yield 278 total families.
gui_related: false
gui_classification_reason: Defines native owner, typed source, physical custody and verification semantics without
  a visual surface.
split_recommended: false
depends_on:
- SP-304
- SP-305
- SP-309
- GRS-078
unblocks: []
acceptance_criteria:
- Three existing logical families preserve their full original active profiles and add three exact new stored
  profiles; three new lineage families yield 278 total families.
- Nonstored complete validation compositions retain literal old and new wrapper headers; genuine immutable acceptance
  selects fixed whole key/value/native routes.
- Complete scope/operation/key and head/selected-epoch joins, exact codecs and every numeric/hash domain are authenticated
  at the actual native phase.
- All 27 existing retention policies and all 272 unrelated whole rows remain exact; complete diagnostic text is
  accurately classified without changing stored fields or lifetimes.
- Mandatory coherent backup covers genuinely issued authority and authentic original absence; readiness validator
  representation limitations remain explicitly unqualified. Amended 2026-09-23 — that limitation was qualified on
  2026-09-23 by the section 2.3.1 readiness representation contract, on Jared's 2026-09-23 instruction to repair
  the Storage registry findings.
validation_surfaces:
- Plans/goal_runtime_workflow_cancel_contracts.schema.json
- Plans/goal_workflow_cancel_schema_resources.json
- Plans/goal_workflow_cancel_contracts/entry-boundaries.json
- Plans/goal_workflow_cancel_contracts/methods.json
- Plans/goal_workflow_cancel_contracts/numeric-paths.json
- Plans/goal_workflow_cancel_contracts/physical-profiles.json
- Plans/goal_workflow_cancel_contracts/schemas/storage-profile-composition.schema.json
- Plans/storage_value_registry.json
risk_class: original_goal_workflow_source_custody_or_native_admission_drift
reasoning_tier: high
context_scope: sp_310_original_source_contract
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/goal_runtime_workflow_cancel_contracts.schema.json
- Plans/goal_workflow_cancel_schema_resources.json
- Plans/goal_workflow_cancel_contracts/entry-boundaries.json
- Plans/goal_workflow_cancel_contracts/methods.json
- Plans/goal_workflow_cancel_contracts/numeric-paths.json
- Plans/goal_workflow_cancel_contracts/physical-profiles.json
- Plans/goal_workflow_cancel_contracts/schemas/storage-profile-composition.schema.json
source_atom_ids: []
negative_constraints:
- No public command, event-membership, Goal lifecycle or retention-policy expansion.
- No fabricated source, absence, original acceptance, native authority, receipt, reservation or retrospective
  enrollment.
- No numeric coercion, lossy codec, stored header relabelling, dropped diagnostic branch or rewritten immutable
  terminal.
- No WorkNode/NodeSeed/runtime/readiness/event-depth/global safe-stop or governance claim from source adoption.
```

ContractRef: ContractName:Plans/goal_runtime_workflow_cancel_contracts.schema.json, ContractName:Plans/goal_workflow_cancel_schema_resources.json, ContractName:Plans/goal_workflow_cancel_contracts/entry-boundaries.json, ContractName:Plans/goal_workflow_cancel_contracts/methods.json, ContractName:Plans/goal_workflow_cancel_contracts/numeric-paths.json, ContractName:Plans/goal_workflow_cancel_contracts/physical-profiles.json, ContractName:Plans/goal_workflow_cancel_contracts/schemas/storage-profile-composition.schema.json


### SP-311 - Original started-v3 event reader and owned projection checkpoint

Scope: exactly original `goal_run.started` carrying the frozen v3 payload and complete EventRecord 2.0.0, for one Workflow run. The new family implements the SP214 / Goal Runtime D-R20 goal_run_projection role as a versioned member. The existing deferred aggregate registration and v1/v2 readers remain byte-for-byte unchanged. This source adoption registers exactly the existing started family revision and its complete original producer/read/projector/checkpoint routes; native installation and execution remain independently unavailable until qualified. Goal still has exactly its four existing states; `Unavailable` is reader source quality, never a Goal or Workflow state. All five methods here are newly source-adopted contracts with native installation unproved. Native execution and crash tests are NOT_RUN.

#### Authority and full sources

`read_retained_native` is a passive Storage/native-owner coordinated read. In one actual Storage read snapshot, resolve the existing per-run Start control at its actual physical key, initial A4 control origin, committed original operation, complete StorageCandidate, StorageCommit and StorageOrigin, and the complete original D01 StorageWorkflowUpdate, StorageWorkflowMutationOrigin and StorageWorkflowHead. Return exactly RetainedNativeStart or unavailable. All complete input wrappers use the unchanged frozen v3 resources; no invented compact substitutes. No Workflow body archive is created or read. Historical before_body/after_body and control selectors inside these objects are issuance commitments, never dereferenced as retained historical bodies.

The native original-custody service must authenticate the complete objects as actual originally coissued values under the frozen `workflow_start_original.v2` coordinator. Merely comparing serialized method names, owner refs, source hashes, copied JSON, selectors, or caller-supplied origin records is insufficient. The service uses original Storage custody for the complete retained native records and native owner method publication provenance. Missing original custody means unavailable. There is no repair by replaying Start, reconstructing bodies, enrolling new origins, rereading an old request as current, or creating a new publication receipt. Authentic records prove the original publication facts only. Original source argument hashes are historical commitments; they do not assert continued availability of the full original arguments.

Require equal exact run identity, storage instance, original operation/transaction, owner identity/epoch, before/after selectors, captured Goal context, original source/Goal argument commitments, event type/schema/id, original event value commitment, producer semantic digest and first append receipt across candidate, commit, origin and D01 chain. Control's committed_start resolves this exact commit, pending_candidate is absent, and initial control's original issuance links the same born run. Candidate prepared outbox and intended payload must equal commit's corresponding values and the frozen delivery mapping. Commit.record.transition is the complete five-field ActivationTransitionReceipt: activation_id equals the original run activation identity, from_state=`start_event_pending`, to_state=`active`, outbox_ref equals the original prepared outbox, and causation_ref equals the original authenticated Start cause. It is not a rule string. The separate original_d01_update.record.transition.rule is `original_workflow_start`; original D01 update cause is `owner_status`, its original_owner_result/origin select this exact commit/origin, D01 origin method is the existing `owner.executor.workflow_source.update_workflow.v3`, and its authenticated afterimages select the original update/head. Start issuer is `owner.workflow.activation.commit_start.v2`. Original update before/after issuance commitments obey the frozen transition rules, ready/start_event_pending to running/active, exact body and activation revisions, same run and owner. D01 head binds that update and after selectors. Authenticate original publication; do not require an old head to be today's current head.

`inspect_original` additionally uses the genuine SP278 whole current generic checkpoint, read token, actual current dataset selection, complete index row and original full frame. Load the complete generic row using the unchanged `event_record_index` embedded value_schema from the pinned whole storage_value_registry, never a reduced row. Read the full original Event via the existing generic exact-read service with complete CV339 FirstBarrier, full_value_result and custody_v2. Validate complete original Event schema, complete inline v3 common payload and its exact six-field event-specific payload and exact payload schema, no compatibility upconversion or payload_ref substitution. Authenticate full original stored-value commitment (including Storage-assigned observed/persisted/sequence fields) separately from the producer semantic digest. Verify frame bounds, CRC, full encoded payload, current segment translation and real original append custody. Then perform all retained native causal checks above, including equality of every payload field to the original intended payload and delivery profile. This reader does not append, checkpoint, mutate native state, certify, dispatch, stop or recover anything. Its checkpoint answer is explicitly none because this particular passive inspection has no durable progress; that does not remove the separate projector checkpoint.

#### Concrete projector and generation ownership

`owner.goal_run.started.project_prefix.v1` is the sole semantic writer of the new projection dataset and its checkpoint root. Storage owns their physical transaction and custody. Owner-private capability objects are not JSON fields and cannot be fabricated by supplying a schema-valid value. Storage instance + exact project/Goal/run identity determines the root. K(s) is unpadded base64url of the exact UTF-8 identity bytes, with no Unicode normalization. Physical keys and dataset names must equal Plans/goal_run_started_consumer_contracts/physical-families.json recipes and the authenticated root; no caller-selected dataset. Own root is separate from the global SP278 root and from D05. Generic SP278 remains the owner of global source coverage.

A generation seed is 32 cryptographically random bytes supplied by Storage, with collision rejection against all extant roots. Canonical hashing uses the existing CV339 canonical MessagePack whole-value encoder and SHA-256, never JSON serialization. `anchor_sha256 = SHA256(encode(["goal_run_started_anchor.v1", storage_instance_id, scope, profile, seed_hex, source_token_at_birth]))`; `generation_id = "grsg_" + anchor_sha256`; `dataset_name = "goal_run_projection.v3@" + generation_id`. The immutable anchor includes the complete nine-field durable generic token. Snapshot id from the actual ten-field generic token is only a live transaction fence; never persist or manufacture it. Map key must equal generation_id. The current_generation_id must select exactly one current entry; only staged/retired others permitted. Current and staged timestamps/nullability must match lifecycle. At most three total generations exist, counting staged/current/retired. Reserve a slot before rebuild; holds and live references fence deletion; unavailable if no legal slot. Current has no TTL. A retired generation becomes deletion-eligible seven days after retirement, subject to RP-PROJECTION-3GEN holds/references. first_prepared_at_utc is the original successful stage creation time. Activation timestamp is first successful activation, never refreshed by reads. Retiring atomically sets successor_generation_id to the distinct newly activated generation and preserves the original first_prepared_at_utc, activated_at_utc and hold_refs. Retired timestamps and successor facts never refresh. A never-activated staged generation has null activation/retirement/successor; lawful abandonment uses the existing Storage maintenance policy and never invents an activation. Hold refs are the complete existing SP278 hold-reference grammar and must resolve actual independent owner holds. No reader can add or release a hold.

The frontier commitment is `SHA256(encode(["goal_run_started_frontier.v1", anchor_sha256, frontier_revision, prior_frontier_sha256, processed, last_transaction_id]))`. At generation birth revision=0 and prior=null. Each committed prefix update increments revision exactly once and chains the previous hash. processed.row_key and row_sha256 are jointly null or jointly present. A present key selects exactly one complete StorageProjection in this dataset, whose full canonical encoded bytes hash to row_sha256 and whose identity equals the root; no extra rows. An empty projection makes no never-started or current-state claim. The checkpoint wrapper physical_key and storage_instance_id must match the real table/key and database. A syntactically valid checkpoint supplied by a caller is never a checkpoint source.

#### Global scan, prefix and atomicity

At each attempt acquire a single real database snapshot and genuine SP278 checkpoint/read token, immutable generation anchor, advancing frontier and current source selection. Validate the complete generic checkpoint, full source_selection and every selected segment against SP278. Scan the globally ordered complete retained source, all scopes, all registered families, including nonmatching rows. Never compute coverage from a filtered maximum sequence. For each raw frame/index row authenticate all SP278 validation and exact-read requirements; unknown, malformed or unverified rows prevent full coverage. Retention gaps must have the actual Storage retention-owner proof and match the generic generation's full coverage/gap disposition. Empty scan is not evidence of no start. Gap digest is SHA256 of canonical ordered complete authenticated gap dispositions, not caller-provided gap labels. coverage_sha256 is SHA256 of canonical ordered pairs of complete generic index rows and their authenticated original full-value commitments for the processed global prefix. Counts and through_sequence_id refer to that complete verified global prefix, with null through for zero records. The private live sources include all full rows/frames, generic checkpoint/token and authenticated retention decisions; the durable projection root is not a replacement source.

Known registered events outside this run are verified no-ops and count toward the prefix. For this run, exactly the frozen v3 started event is supported and must pass inspect_original's complete causal checks. Require one unique original start publication for the run. Duplicate physical/index exposure of one original Event is a coverage failure, not a second start; conflicting original start ids or values are custody mismatch. Replanned, blocked, certified, cancelled and stopped GoalRun events in this run are `UNSUPPORTED_RELEVANT_EVENT`: stop immediately before that row. Do not treat them as no-ops or infer terminal status. Any other same-run GoalRun event or unknown schema also stops. Thus this is a deliberately bounded started-only projector, not an implementation of all six GoalRun transitions.

For the matching event derive every Projection field from the full original Event and authenticated complete native objects: original_event is the entire original stored Event (six exact v3 payload fields retained), after commitment and captured Goal context are unchanged originals, selectors resolve the full authenticated original records, append receipt/digests remain original, and status_at_original_event/activation_at_original_event describe the original transition only. Canonical projection serialization is deterministic; the first matching event fixes the row. No current native body or reconstructed body is written into it. Reprocessing the same verified prefix yields identical derived bytes.

A Storage write transaction rereads and CAS-fences the actual generic root selection and full frontier token (including same-generation frontier advancement), actual projector root/current generation/frontier and all native/retention custody inputs used. Verify the live snapshot is still authoritative; reject stale observations. Only then atomically write the complete derived row (or none) and the checkpoint's processed prefix + frontier. Both become visible together or neither does. A failed row never advances the checkpoint past it or mutates the row for that failure; earlier separately committed valid prefixes may remain. A failed whole batch rolls back the whole batch. Crash before commit exposes neither; crash after commit exposes both. Reads never repair. A later attempt begins from the last committed genuine prefix. If original retained source selection/gaps changed, do not carry the prior row/checkpoint blindly: stage a new generation and rebuild from genuine survivors.

Rebuild starts with an empty isolated dataset and genuine current whole generic coverage. Stage progress is never exposed as current. Cutover revalidates source and custody fences and atomically switches the root current_generation_id, staged state to current, old current to retired plus timestamps, and new dataset binding. Failure rolls back cutover. Never rewrite the immutable generation anchor to match a new source. Missing original event/native custody cannot preserve the old row as a currently supported result. A fully verified survivor scan with no supported original may cut over an empty row, but only as unavailable source quality, never never-started. Unsupported relevant events halt before them; their incomplete staged prefix cannot cut over as a current view.

#### Reads and current meaning

`read_historical` fetches the actual root/dataset in a single snapshot, verifies all checkpoint hashes/bindings, reloads the full original Event and complete retained native custody, and byte-compares deterministic derived row. It returns HistoricalRead only when those originals remain fully available. Its result explicitly asserts no current state. It does not need a historical Workflow body or current Goal body. A surviving compact origin or projection by itself is insufficient to return the full original event after source expiry.

`read_current` additionally takes both complete private source realms: frozen CurrentStartSource and separate CurrentGoalArgument, fetched as actual fresh native/Goal sources. Apply all original read_started_current.v2 rules, actual native controls/owner fencing, current Goal Stop/binding checks, D01 complete current body/control and original custody; require current body's entire issuance commitment to equal projected original after commitment. Require processed global prefix exactly equals the genuine current generic full frontier, all gaps covered, with no unsupported relevant event, pending transaction, or stale source token. Revalidate actual root, source frontier, native controls and Goal controls in one coordinated read fence immediately before return. Read results describe that snapshot and carry no action capability. If D06 or another native update has advanced the body, return STALE_NATIVE/PENDING_OR_STOPPED; never show stale running, replay the original Start, or reconstruct an earlier body. The current reader result contains complete current Workflow native source. The separate current Goal argument remains an internal full source in its own realm and is not merged with incompatible historical schema resources.

#### Retention and forbidden effects

Original goal_run.started remains RP-RUNTIME-365D: 31,536,000 seconds from run completion, existing per-run/project caps and successor rollover, hold eligibility and compaction semantics unchanged. No borrowed exception, refreshed read TTL, source lifetime extension or durable input archive. Original native candidate/commit/origin/control and D01 metadata retain the frozen source families' owner policies; this reader cannot promise longer availability. Losing any required complete native record/custody makes original inspection unavailable. Derived full original Event content is readable only while the original source is legitimately retained under its actual policy; expiry invalidates/removes that content through a governed rebuild, including held generations' disclosure fence. A projection hold is not a hold on runtime source. Historical commitments can survive under their own policy but are never presented as full source availability.

Only project_prefix writes its own derived projection/checkpoint. All passive readers write nothing and own no checkpoints. None of these methods writes original Event, emits a new receipt/origin, edits Goal state, mutates Workflow or WorkNode, dispatches, cancels, certifies, changes D05, or repairs native lineage. The exact original issuer and coordinator remain unchanged. This contract gives no action authority to projections, complete source values, receipts, metadata, or hashes.

#### Universal original entry and final predicate

This applies independently to all five methods, every lower Storage/native-owner helper and every passive retained/inspect release. Before any returning helper, each actual original owner independently obtains the complete typed entry inputs, authentic original issuer/custody sources, applicable current owner/permission/deletion/hold/backup/root controls, transaction/snapshot identity and complete permissible output candidate for that phase. A caller's copy, prior helper output, claimed validation flag or metadata digest does not satisfy independent source admission. The complete candidate is checked as a candidate, never treated as a previously issued source. No future event, body, receipt or progress record is demanded where this phase has not issued it.

After every returning helper, and after all helpers have finished, the owner reevaluates one pure final predicate over those entire actual inputs, candidate, original source/custody, native owner epochs, codec/root selections, applicable current permissions/deletion/holds/backup and the actual transaction/snapshot fence. No helper, unguarded interleaving, publication, mutation or passive data release can occur between that final predicate and the specific effect/release. A changed, missing or revoked participant makes this invocation unavailable; it cannot fall into recovery or substitute another source within the call. The lower Storage write/cutover owner performs its own same complete entry/final checks in addition to CAS comparisons; comparing token/hash equality alone is insufficient. The lower retained-custody and exact-frame owners independently perform their own whole original-source/candidate final checks before returning bytes.

For project_prefix the final predicate covers the entire actual verified global prefix, checkpoint preimage, proposed complete row/checkpoint afterimages, retention decisions and current source selection. For inspect_original and read_retained_native it covers complete original Event/native sources applicable to that method and actual passive disclosure controls without requiring historical bodies. For read_historical it additionally covers the actual derived row/checkpoint and complete original source joins. For read_current it additionally covers full current native and separately resolved full current Goal controls. Each method authenticates only its applicable source class; passive original/historical reads never introduce a current Workflow/Goal-body prerequisite. Failure preserves all genuine earlier effects and writes/releases none for the refused step.

#### Exact physical and source registration

The two new registry family IDs are `goal_run_started_projection` and `goal_run_started_checkpoint`. Their entire reviewed values are respectively StorageProjection and Checkpoint from `Plans/goal_run_started_consumer_contracts/consumer.schema.json`; the literal value schema IDs remain `pm.goal_run_projection.started.v3` and `pm.goal_run_started_checkpoint.v1`. Those registry labels do not rename a physical key, schema identity or generation. Exactly two additions extend the 278-family coordinator baseline through SP-310 to 280; all 278 preceding whole rows and all 27 retention-policy objects remain exact. The deferred goal_projection_families group remains unchanged. Its old aggregate key inventory does not replace this concrete versioned role.

`Plans/goal_run_started_consumer_schema_resources.json` fixes the complete independent native and Goal resolution realms, exact whole-resource bytes, original retrieval bases and embedded pointers. Whole canonical source dependencies from EP-118/119 and SP-309 are reused only after exact hash equality; remaining resources are whole content-addressed documents. No schema ID is rewritten, conflicting historical/current resource merged, pointer stripped or network fallback enabled. `Plans/goal_run_started_consumer_contracts/methods.json` declares all five exact source methods and applicable whole private arguments. Existing Start/D01 physical rows and original producer methods are reused without changing their keys, complete value schemas or source lifetimes. Their additional bounded passive joins are governed by this owner route and EP-120; the 278-row current baseline is not reserialized into new source contracts.

The actual original Storage projector, decoder/encoder, root/transaction, current source selection, native original-custody and disclosure participants must be installed and jointly qualified before use. A new generation cannot supply a missing original schema/method/receipt/custody installation. Versioned source registration, whole schema well-formedness, static reference closure or an Event family row alone does not establish native authority, complete Event depth, deterministic native execution, currentness, crash recovery, backup correctness or a runnable WorkNode. No validator, governance lock, generated evidence, checkpoint compiler or FileSafe disposition is changed by this source contract.

```yaml
plan_unit_id: SP-311
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Complete original started-v3 source and bounded consumer ownership; native execution remains unproved.
gui_related: false
gui_classification_reason: Defines original runtime source, custody, replay and retention contracts without a visual surface.
split_recommended: false
depends_on:
- SP-214
- SP-278
- SP-286
- SP-309
- EP-120
unblocks: []
acceptance_criteria:
- Exact original whole source and retained/current boundary is preserved.
- Only the existing started Event family changes; all other Event rows and all 278 Storage rows and 27 policies remain exact.
- The mandatory durable projection has complete atomic generation/checkpoint ownership.
- Source definitions do not claim installed native authority, Event depth or runtime execution.
validation_surfaces:
- Plans/goal_run_started_consumer_contracts/consumer.schema.json
- Plans/goal_run_started_consumer_contracts/methods.json
- Plans/goal_run_started_consumer_contracts/physical-families.json
- Plans/goal_run_started_consumer_schema_resources.json
- Plans/event_family_registry.json
- Plans/storage_value_registry.json
risk_class: original_started_source_or_projection_currentness_drift
reasoning_tier: high
context_scope: original_started_v3_consumer_adoption
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Executor_Protocol.md#EP-118
- Plans/storage-plan.md#SP-309
- Plans/Backup_Restore_System.md#BRS-025
source_atom_ids: []
```


### SP-312 - Complete cancelled-v3 source consumer and versioned combined projector

This unit adopts the complete positive-D06 cancelled-v3 reader and bounded started/cancelled successor projector source. It materializes the mandatory SP214 per-project, per-Workflow-run goal_run_projection role through a separate versioned family and concrete checkpoint. GRS-080 selects only the existing cancelled Event family revision 3.0.0; the preceding started-v3 row, all other Event rows, original v2 resources and native writer registrations remain unchanged. The positive D06 source is the canonical EP118 contract, not authority inferred from started. Source selection does not establish installed native service, Event depth, runtime, readiness or governance qualification; native execution remains NOT_RUN.

The six methods in Plans/goal_run_cancelled_consumer_contracts/methods.json form an explicit versioned successor for exactly started-v3 and positive-D06 cancelled-v3. The complete previously adopted started source remains Plans/goal_run_started_consumer_contracts and SP-311. Its original 20 consumer definitions survive in Plans/goal_run_cancelled_consumer_contracts/consumer.schema.json with only the successor consumer's own identity and internal self-references changed; separate added definitions supply this successor. No old schema resource is edited. Original started-only methods, families, checkpoints and all their source and retention predicates remain unchanged. For the new successor, all original started causal, generic coverage, current-source, retention, generation and independent entry/final rules in Plans/storage-plan.md#SP-311 apply, with the following explicit substitutions only: the new method names, Combined* types, v4 projection family, started_cancelled checkpoint, new generation/hash domains, and the supported cancellation transition defined here. A copied URI or value grammar is not an installed owner or native authority.

#### Scope and realms

ScopeRequest carries exact storage instance and full native RunScope. Storage reversible scope partitions, project/Goal/run identities, original owner identities and transaction/operation coordinates are authenticated at their existing actual owners. There is no normalized identifier, selector-only substitute, caller-provided capability or archived Workflow/Goal body. All emitted results carry no action authority. Unavailable is source quality, not a Goal or Workflow lifecycle state.

Resource maps are new explicit consumer compositions. Every shared retrieval URI has an equal whole resource, recorded in the exact whole resource placement and independent realms in Plans/goal_run_cancelled_consumer_schema_resources.json. Canonical maps remain unchanged; this proposal never installs a different body under an existing URI. The native, Goal and FileSafe maps remain distinct because their complete historical schema contexts are not interchangeable. Original URI bases and embedded IDs remain literal; there is no network fallback, historical alias repair or blanket claim that unused definitions are callable. Every actual method request/result/private root requires transitive schema closure independently of inherited inactive reference failures; full source registration does not make an unused historical definition callable.

RetainedGoalCause supplies whole original SourceAudit, StopIntent, StopReceipt, original full ControlPublication and original execution binding selection/revision/origin under the Goal realm. RetainedFileSafeEffects supplies every applicable actual FileSafe invocation's full binding, full original terminal RestoreTransaction journal and entire original journal-origin chain under the FileSafe realm. Actual original owner provenance must establish complete membership; an empty array is never proof of absence. No current or historical mutable Goal body is reconstructed or required by the retained paths. Current methods separately require their full current Goal sources.

#### Original cancelled native custody

owner.goal_run.cancelled.read_retained_native.v1 performs a passive coordinated read of existing original values. Before any helper, obtain the exact born run identity, native original registration and full applicable retained source candidates through real owner-private custody. Read complete RetainedNativeCancellation, including original EventCandidate, nonterminal Intent, committed Control, CancelledResult, prepare and publish Origins, original D01 update/head/mutation origin, full original safe-stop cause, Start cause and process effects. The native owner authenticates that these were originally issued under the genuine positive original_bounded_safe_stop_terminal_publication.v1 registration, with original principal, native entrypoint, owner epoch and coordinator. Matching serialized issuer_method, profile, source hashes or role names alone does not prove original invocation.

Resolve the existing original physical families and exact keys from Plans/executor_cancellation_contracts/physical-families.json, the 275-family storage registry and their pinned source owners. All wrapper schema IDs, storage instance, table/key, selector codec/hash, scope, operation and transaction must match the actual values. Historical before/after fields are original issuance commitments only. Do not dereference them as old mutable Workflow bodies or demand that an original head is today's head. Missing actual retained values or original owner custody yields unavailable, without an archive, replay, repair, re-enrollment or fresh receipt.

The D06 candidate, Intent and prepare Origin belong to one genuine prepare publication. Intent.kind is cancel_nonterminal. Candidate selection, complete producer submission and digest match Intent, result and both origins. The committed Control selects the exact immutable Result, phase committed, genuine original operation and epoch/revision; its change obeys the original one-step prepared-to-committed rule. Authenticate the original initial control through prepare Origin's complete afterimage commitments, not a fabricated historical control. Publish Origin names owner.workflow.executor_cancel.publish_disposition.v3 and its exact closed outputs; prepare Origin names owner.workflow.executor_cancel.prepare_disposition.v3 and its distinct closed outputs. Preserve the canonical acyclic derivation: candidate precedes prepare outputs; native/result/committed control precede publish origin; D01 lineage follows. No origin commits itself or a downstream D01 value.

The D01 update is original owner_status with rule d06_cancel_nonterminal. Its original_owner_result and original_owner_origin select this exact D06 result and publish origin. Original owner.executor.workflow_source.update_workflow.v3 custody proves the complete update/head and original pointer commitment were coissued with the same genuine coordinated outcome as native D06 and append. Require exact identity, owner and original operation/transaction joins only where the native contract says they are the same. The update's full before/after BodyIssuanceCommitment proves legal nonterminal-to-cancelled, body revision +1, unchanged activation state and activation revision and all non-status fields. Head binds the exact update and after commitment. Native run control, Goal body/control, objective/history/lifecycle, active_run_ref/association, WorkNode/Attempt/prior results and Stop latch follow the original preservation rules. No implied resume, replan, certification, quota or plan-schedule effect.

D06 operation, D05 aggregate operation, SchedulerStop/native cancellation operation, FileSafe/process effect operations and required-flush operations retain their distinct original identities. D05's native cancellation join selects original_scheduler_stop.native_cancel_result.operation_id, resolved against full original StorageRunOperationResult and StoragePublicationOrigin. D06 result's safe_stop_source selects the full original aggregate result. Intent/result Goal Stop, SchedulerStop, inventory cut, binding/association and prepare/publish causation resolve the exact full original Goal and native chain. Never make unrelated operation IDs equal to simplify comparison.

The full RetainedD05Cause supplies original resolved aggregate/result origin, DomainBirth/final DomainCut, all required flush records, original registered writers/capability births/dispositions/obligations, core writer cuts/event admissions, reservation allocation/compile/workflow joins, original D01 SchedulerStop/inventory/coverage and origin chains, original native cancel result/origin, pre-attempt admissions and recovery records. Native owner custody proves exhaustive membership against the original born domain, original inventory and complete original chains. Require bounded_original_safe_stop_resolved, no unresolved/unknown producer, exact supported roles, no pre-attempt effect, no required checkpoint success, complete revoked capability census and unchanged stopped queue/generation/admission cuts. Required final flush exists even for an authentic empty event set. Every required failure is sticky; a later successful flush cannot erase it. Authenticate actual original Storage flush/first-receipt custody for every recorded commitment without claiming an expired event's full bytes are still available. D06's own cancellation append occurs after the sealed D05 flush under the independently registered terminal writer and is never inserted into that earlier flush or used to reopen its queue.

All original capabilities for selected-run work/effect/callback/normalizer/drain remain revoked. The original terminal service was registered before DomainBirth with the exact positive descriptor. This reader is not that writer and acquires no terminal service capability.

#### Start and effect branches

RetainedStartCause is exactly one original_started or original_initialized_no_start branch. original_started carries every complete reviewed RetainedNativeStart value: Start control and initial A4 origin, original candidate/commit/origin and original D01 update/head/origin. Apply every original started-custody equality and publication predicate, including its complete five-field ActivationTransitionReceipt, genuine ready/start_event_pending to running/active transition and captured Goal context. The cancellation after-commitment preserves the native activation at cancellation; it does not reset activation to a constant. An earlier Start does not make a later current running claim.

The no-start branch requires the actual born run's whole initial StartControl with epoch zero and pending_candidate, committed_start and original_operation_id all null, genuine initial A4 issuance origin, original WorkflowBirth and its full original mutation origin. Authenticate that exact initialized control and complete original birth custody were the sources used at cancellation; absence of a started Event, empty retained logs, empty dispatch, or a missing commit never proves no start. Pending/partial Start has no successful branch here and makes this bounded consumer unavailable. No historical body archive is introduced.

mutation_started, settlement_refs and optional rollback_refs come from the original D-R17 effect owners, never inferred from D06 status, empty dispatch, a reference's presence, a phase label alone or the current workspace. The full original partition and invocation membership determine every applicable FileSafe/process effect. Process records include complete birth, shutdown admission, termination/shutdown results and origins for the supported disposable role only, with exact scope, genuine operation identities and native birth/termination provenance. Unsupported workspace/external/unknown roles refuse.

For each FileSafe invocation, the original owner independently authenticates injective key binding to full original journal and original origin chain, the exact native original mutation/rollback execution and durable terminal equality/outcome under canonical FileSafe rules. Require native provenance for target_proven, pre_restore_proven or already_target_zero_mutation as applicable; the serialized enum alone proves no effect or durability. The full journal and actual original origin chain establish which changes truly began, settled and rolled back. The consumer must reproduce the exact original payload references by the original producer mapping, resolving them against these full genuine owners. A settlement/rollback reference to the future consumer, current D06 result, a derived checkpoint or a invented aggregate marker is invalid.

If no mutation began according to the genuine exhaustive original effect owner census, mutation_started is false, settlement_refs is empty and rollback_refs is absent. If mutation began, mutation_started is true and settlement_refs is nonempty and exhaustively identifies the authentic durable original settlement dispositions required by D-R17; rollback_refs, when present, are the exact genuinely executed original rollback records. Every applicable effect must have reached its required durable terminal disposition before the original cancelled append. user_cancelled is the only reason in this positive route. activation_aborted/cancelled_before_mutation remain separate owner semantics and are not admitted by this consumer.

#### Full original Event and exact inspection

inspect_original adds actual GenericSnapshot and ActualGenericSources. Validate complete original EventRecord 2.0.0 with exact inline cancelled-v3 payload and no payload_ref, compatibility upconversion or synthetic event. GenericIndexRow is the entire exact current registry family 8 value_schema; the whole GenericIndexRow binding in Plans/goal_run_cancelled_consumer_contracts/consumer.schema.json pins the whole 275-family canonical registry and proves equality of that entire embedded value_schema to the preserved started copy. ActualGenericSources carries full CURRENT/manifest byte images, native full source_selection and selected entry, actual complete segment bytes, source frames and full sequence gaps. These are source types used by SP278 under its own native authority; this consumer does not claim installation as a compaction writer.

The real SP278 exact-read owner authenticates the complete index row, original frame bytes/CRC/bounds/encoded value and current translation, complete first AppendReceipt barrier, full_value_result and custody_v2. Separate original whole stored-value commitment from producer semantic digest, retaining Storage-assigned observed/persisted timestamps and sequence. Compare every producer-owned field of the entire original stored Event against the genuine complete EventCandidate.producer_submission under the original delivery mapping, including full nested runtime envelope and effect payload. All optional fields retain their original presence and bytes; no timestamps are refreshed.

Inner/outer event name, scope partition, project/Goal/run, original Goal revision, expected_goal_run_revision and successor goal_run_revision, actor/provider/model/account, causation/correlation, payload schema, cancellation reason, mutation and settlement/rollback fields must join original D06/native/Goal sources. The Goal context revision remains unchanged, while expected_goal_run_revision equals the original D01 before body revision and goal_run_revision is exactly +1 and equals its after body revision. They are distinct clocks.

Verify the exact existing idempotency formula: `pm.goal-runtime-event.v3:` followed by lowercase SHA-256 of RFC8785 JCS of `["pm.goal-runtime-event-idempotency.v3", scope_partition, "goal_run.cancelled", project_id, goal_id, goal_revision, expected_goal_run_revision, goal_run_revision, goal_run_id, "user_cancelled", mutation_started]`. Use original Storage reversible scope partition; inner and outer keys byte-equal. Existing producer semantic digest and CV339 original-value codecs remain distinct from this JCS recipe. Original event/receipt/value are the first original append and are never reconstructed or appended again.

All native custody, D05, Goal, Start and effect checks above apply independently to exact inspection. read_retained_native has no event bytes success claim; inspect_original requires full original cancellation Event. Passive methods have no durable checkpoint and cannot substitute a none_required exception for the mandatory projector checkpoint.

#### Concrete successor projection and checkpoint

Only owner.goal_run.started_cancelled.project_prefix.v1 may derive this versioned row/checkpoint. Storage owns physical publication. K(s) is unpadded base64url of exact UTF-8 identity bytes, with no Unicode normalization. Root table is checkpoints; key is `goal_run_started_cancelled_checkpoint.v1:K(storage_instance_id):K(project_id):K(goal_id):K(goal_run_id)`. Row key is `goal_run_projection.v4:K(project_id):K(goal_run_id)` in exact `goal_run_projection.v4@<generation_id>`. The authenticated root determines every key and dataset. No caller-selected table or arbitrary scope.

Use the existing CV339 canonical MessagePack whole-value codec and SHA-256. Storage supplies a fresh 32-byte random seed with collision rejection. `anchor_sha256 = SHA256(encode(["goal_run_started_cancelled_anchor.v1", storage_instance_id, scope, "goal_run_started_cancelled_projector.v1", seed_hex, source_token_at_birth]))`. Generation id is `grscg_` + anchor_sha256. The immutable birth anchor includes the complete nine-field durable generic token. The tenth actual redb_snapshot_id is a live fence only, never durable or manufactured.

`frontier_sha256 = SHA256(encode(["goal_run_started_cancelled_frontier.v1", anchor_sha256, frontier_revision, prior_frontier_sha256, processed, last_transaction_id]))`. Birth revision zero and prior null; each committed prefix advance increments exactly once and chains the prior hash. Checkpoint map key equals generation_id; exactly one selected current entry, others staged/retired only. processed.row_key and row_sha256 are both null or both present; present selects the one complete deterministically encoded CombinedStorageProjection in the authenticated dataset and hashes its complete bytes. No extra row or unbound root. A null row makes no never-started, never-cancelled or current-state claim.

RP-PROJECTION-3GEN applies exactly: max three total staged/current/retired generations; reserve a legal slot before rebuild; current has no TTL; retired becomes deletion-eligible seven days after original retirement subject to authentic holds and live references. first_prepared_at_utc is original successful stage birth, activated_at_utc is first successful activation. Retire atomically sets distinct successor_generation_id and original retirement timestamp, preserving earlier timestamps and hold refs. Never refresh timestamps on reads or restart the retirement clock. Never-activated stage has null activation/retirement/successor; abandonment uses existing Storage maintenance rules. No consumer creates/releases holds. Complete hold refs use existing SP278 grammar and actual independent hold authority.

#### Global prefix and transition interpretation

Obtain one real database snapshot, current full generic checkpoint/token, actual CURRENT/manifest/selection and globally ordered full retained source. Validate the immutable anchor, advancing frontier and every source-selection entry against the genuine SP278 owner. Scan all scopes and families, not a filtered run maximum. For every raw frame/index row authenticate full generic exact-read/schema/coverage requirements, including nonmatching events. Unknown, malformed or unverifiable records stop coverage before that row. Actual Storage retention-owner decisions prove complete gap disposition and survivor translation; empty arrays, max sequence, claimed coverage count and copied gap digest prove no absence.

Gap digest is SHA-256 of canonical ordered complete authenticated gap dispositions. coverage_sha256 is SHA-256 of canonical ordered pairs of complete generic index rows and authenticated original full-value commitments for this verified global prefix. Counts and through_sequence_id cover that entire prefix, null through only for zero records. Whole actual source images/frames/selection, original retention decisions and existing SP278 source/lease custody remain live entry/final inputs. A root token alone is insufficient. Retention-source changes force a fresh staged rebuild.

Registered events outside this run are verified no-ops only after complete generic validation. For this run the exact reviewed started-v3 and positive cancelled-v3 events are supported. A v2 sibling is not upconverted. Replanned, blocked, certified, stopped, every other same-run GoalRun event, and unknown relevant schema are UNSUPPORTED_RELEVANT_EVENT and halt immediately before the row. They are never no-ops. This remains bounded even though the native D06 may cancel any legal nonterminal status: a genuine original cancellation after an unsupported same-run event may be inspectable, while this current projector cannot cross the unsupported event.

A supported started event performs all preserved original started checks and derives the unchanged full Projection. One unique original Start publication is permitted. A supported cancelled event performs every cancelled check here and derives CancelledProjection. It replaces an earlier started row only when native original Start custody, exact run lineage and original revisions authenticate that causal order. A genuine no-start cancellation derives directly from its initialized control/birth branch. Duplicate physical exposure, conflicting original start/cancel identities or values, a Start after cancellation, two distinct cancellations, mismatched before/after lineage or incompatible ordering refuse. Event dedupe is the existing first-original owner contract, never a second transition.

CancelledProjection derives scope, cancelled status, original activation, both full native commitments, entire original Event, all original D06/D01/D05/Start selectors, exact original whole-value commitment, producer digest and first receipt exclusively from authenticated originals. Its original_start_cause contains metadata selectors only; it does not embed the earlier full started Event. That allows genuine retained Start metadata to support cancellation after a legally expired started Event without pretending the full started event remains readable. A started row still requires the complete original started Event under its own lifetime. Reprocessing equal complete verified inputs produces byte-equal rows.

#### Atomic publication, rebuild and passive reads

At Storage write entry acquire the complete actual root preimage, full proposed row/checkpoint afterimages, complete globally verified prefix and every applicable original native/Goal/effect/retention custody source. In the actual transaction reread and CAS-fence the generic root, current generation and FULL frontier token, including advancement within the same generic generation; own root/generation/frontier; and every applicable owner/current/source/disclosure fence. The lower Storage owner independently admits these full sources and afterimages and runs its own final predicate. Equality of hashes or tokens alone is not admission.

Only after the final predicate atomically write row (or none) plus processed prefix and frontier. Either both are visible or neither. Failure at a row never advances over it or mutates the row on that failure. Earlier separately committed valid prefixes remain genuine; a failed whole batch rolls back entirely. Crash before commit shows neither, crash after commit shows both. Retry reads genuine committed state and never creates a replacement original event/receipt. Same-generation generic frontier advancement invalidates a stale attempt.

A changed retained source/gap selection stages a new empty isolated dataset from genuine survivors; never copy an old row as retained source or rewrite an anchor. Staged progress cannot be served as current. Cutover requires complete verified current generic frontier with no unsupported row, whole custody and independent final checks; atomically select new current generation, retire the old with immutable retirement/successor facts and switch dataset. Failure leaves the previous genuine selection. A complete legal survivor scan with no supported event may install an empty row only as unavailable source quality. An incomplete staged prefix cannot cut over.

read_historical fetches actual selected root/row/checkpoint in one coordinated snapshot, validates all hashes/bindings and rederives the selected original row from full currently retained originals. It returns the matching original_started or original_cancelled branch and explicitly asserts no current state. Full original native and Goal/effect sources are independently admitted; the selected branch cannot borrow another branch's full event availability. This reader may report an authenticated older committed prefix as historical, with that exact checkpoint, and cannot label it current.

read_current_started additionally consumes whole CurrentStartedPrivate and separate CurrentStartedGoal, applies all preserved original current Start/native/Goal predicates, and requires exact whole current native after commitment to match the running row. read_current_cancelled consumes whole CurrentCancelledPrivate: both actual CurrentRead and CurrentSuccessfulReadback, not just a prior returned readback. It independently obtains the complete fresh positive D06 current source, full D05 SuccessfulReadback, complete current Start argument, separate full CurrentGoalStopArgument and full D06 current-controls argument at the actual held native/Goal boundary. Apply every canonical positive D06 current-read predicate. Require the cancelled branch, exact original D06 result/Event/D01 commitments, genuine current native cancelled body/control and unchanged activation matching the row. Preserve current Goal Stop latch and binding/association; an old readback never proves fresh currentness.

Both current methods require processed prefix to equal genuine complete current generic frontier, with all gaps proved and no unsupported relevant event, pending native transaction, stale generic token or later incompatible native update. Revalidate actual root/frontier, current native owners/epochs, Goal Stop/binding/current controls and applicable original disclosure sources immediately before return under the coordinated held read fence. Different later state returns unavailable, never a stale running/cancelled view. Methods return only their matching success branch even though the shared success schema is a union. Serialized current results confer no action capability.

#### Source-coupled retention and universal independent boundaries

Original started remains RP-RUNTIME-365D: 31,536,000 seconds from run completion with existing caps, rollover, holds and compaction. Original cancelled remains RP-AUTHORITY-INDEFINITE subject to its actual deletion/hold/backup rules. D06/D05/Start/D01/Goal/FileSafe/process original metadata and journals retain their existing owner policies, without new archive, refreshed TTL or guarantee of indefinite availability. Losing any required full original value or actual original custody makes that method unavailable. Full effect journals may be unavailable after lawful disposal; compact selectors do not replace them.

Derived original Event bytes are disclosable only while their actual original source remains lawfully retained. Expiry/deletion fences disclosure in all current, staged, retired and held generations and invalidates/removes derived full content through governed rebuild/maintenance. Projection hold does not hold the underlying runtime/effect source. A cancelled row may survive a started source expiry only after genuine full survivor rebuild and only if every cancelled event and native/Goal/effect/retained Start prerequisite remains available under its own policy. No lifetime changes, backup exception or source resurrection.

The following applies independently to all six methods, preserved started methods when composed, and every returning lower helper for source acquisition, native retained custody, Goal cause, FileSafe/process original proof, exact Event read, generic coverage/retention, row derivation, checkpoint write/cutover and passive release. Each actual original owner independently obtains the entire typed applicable entry source graph, authentic issuer/custody, current owner/permission/deletion/hold/backup/root controls, real transaction/snapshot identity and complete proposed output candidate before any helper. A caller's copy, previous helper output, validation flag, hash, selector or serialized handle never substitutes for independent admission. Candidates are evaluated as candidates; do not require a future row/checkpoint/event/origin as a previously issued entry source.

After every returning helper and after the last helper, the owner reevaluates one pure final predicate over all those complete actual inputs, whole candidate, original provenance, owner epochs, codec/root selections, disclosure/current controls and actual held transaction/snapshot fence. No helper, unguarded interleaving, mutation, publication or passive release may intervene between final predicate and its specific effect/release. Any missing, changed or revoked participant refuses this invocation without recovery fallback or source substitution within the call. This is required at lower helpers as well as their caller, in addition to all explicit CAS tests.

For projection publication/cutover, the predicate covers whole actual global prefix and retention disposition plus complete old/new roots and row/checkpoint afterimages. For retained native it covers full applicable native and original Goal/effect records and passive disclosure controls, without demanding original Event bytes. For exact inspection it also covers whole Event/frame/custody; historical adds actual derived row/checkpoint; current adds all full freshly admitted native and separate Goal controls. Passive historical methods never gain a current Workflow/Goal-body prerequisite. All refused effects/releases preserve earlier genuine outcomes.

Only project_prefix writes its own new projection/checkpoint. No method writes original Event, native Workflow/Goal/WorkNode/Attempt, D05 result, receipt, origin, source ledger, schedule, quota or governance. No dispatcher, Stop, replan, certification, replay, repair, recovery or terminal native writer is created. Original values and commitments remain evidence with no action authority.

#### Exact delta registration and successor selection

The registry adds exactly two whole families, goal_run_started_cancelled_projection and goal_run_started_cancelled_checkpoint, with unchanged complete reviewed CombinedStorageProjection and CombinedCheckpoint wrappers from Plans/goal_run_cancelled_consumer_contracts/consumer.schema.json. Their schema identities are pm.goal_run_projection.started_cancelled.v4@4.0.0 and pm.goal_run_started_cancelled_checkpoint.v1@1.0.0. They are separate physical families and roots; neither overwrites goal_run_started_projection nor goal_run_started_checkpoint. Original started-v3 physical rows, methods, codecs, lifecycle contracts and existing active started Event selection remain whole and unchanged. No compatibility key is added and no old v3 root is silently upgraded to grscg_ or v4.

The expected post-coordinator/started baseline has 280 Storage families, 42 Event families and 27 policies. Apply two additions to that actual whole baseline, yielding 282 Storage families; all 280 predecessor rows and all 27 complete policies remain exact. Counts qualify only that stated baseline and must be re-adjudicated if other authorized additions land. Never replace the live registry with a frozen older image. Only the existing event-family-goal-run-cancelled row changes to its complete current v3 payload/source route.

Plans/goal_run_cancelled_consumer_schema_resources.json fixes three full separate native_consumer, goal_consumer and filesafe_consumer realms. Four complete new schema resources are placed under Plans/goal_run_cancelled_consumer_contracts; the previously adopted started consumer and all existing canonical source resources are reused by exact whole bytes. Literal retrieval URIs, including historical proposal/file spellings, embedded scopes and explicit JSON pointers remain unchanged. No trimmed alias, replacement body, cross-realm merge or network fallback is accepted. The inherited inactive original-completion aliases remain noncallable and are not dependencies of these six method roots.

The new combined route is explicitly selected by its own full native installed owner/profile. A current run view that must consume cancellation uses the new exact current_cancelled boundary; the old started-only reader still refuses cancellation and remains a valid bounded original/running reader under SP-311. No automatic default-view switch, old reader reinterpretation or action authority follows from this source adoption. To establish a combined current dataset, use the fresh isolated rebuild and full-source cutover above under the new root. The new current-started reader preserves the whole native/Goal started predicate; it is not allowed to carry an old v3 checkpoint forward as proof.

Each new value is derived_rebuildable under existing RP-PROJECTION-3GEN, with optional coherent derivative backup. Original authority remains under its existing mandatory backup, retention and deletion owners; a new recovery source-family list grants no lifetime or disclosure extension. Exact full native installation, all returning helper boundaries, codec execution, actual original provenance, global coverage, crash recovery, retention/hold and backup/restore behavior remain independently NOT_RUN. No validator relaxation, new policy, generated evidence, Spec Lock, WorkNode, NodeSeed, runtime admission, Step 9 result or global safe-stop closure is supplied.

```yaml
plan_unit_id: SP-312
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Complete positive original cancelled-v3 source consumer and bounded versioned projector ownership; native execution remains unproved.
gui_related: false
gui_classification_reason: Original runtime custody and derived source currentness contract without visual presentation.
split_recommended: false
depends_on:
- SP-214
- SP-278
- SP-286
- SP-309
- SP-311
- EP-121
unblocks: []
acceptance_criteria:
- Whole original Event/native/Goal/effect sources and independent helper entry/final predicates are preserved.
- Only the cancelled Event row changes; two separate derived families preserve all 280 expected predecessor rows and all 27 policies.
- Existing started-v3 profiles and methods remain unchanged, with explicit fresh combined generation/cutover.
- Source adoption does not qualify installed native authority, Event depth, runtime or governance.
validation_surfaces:
- Plans/goal_run_cancelled_consumer_contracts/consumer.schema.json
- Plans/goal_run_cancelled_consumer_contracts/cancelled-causal-arguments.schema.json
- Plans/goal_run_cancelled_consumer_contracts/goal-arguments.schema.json
- Plans/goal_run_cancelled_consumer_contracts/filesafe-arguments.schema.json
- Plans/goal_run_cancelled_consumer_contracts/methods.json
- Plans/goal_run_cancelled_consumer_contracts/physical-families.json
- Plans/goal_run_cancelled_consumer_schema_resources.json
- Plans/storage_value_registry.json
- Plans/event_family_registry.json
risk_class: original_cancelled_source_or_combined_projection_currentness_drift
reasoning_tier: high
context_scope: positive_cancelled_v3_consumer_adoption
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Executor_Protocol.md#EP-118
- Plans/storage-plan.md#SP-309
- Plans/Backup_Restore_System.md#BRS-025
source_atom_ids: []
```


### SP-313 - Whole original Workflow cancellation inspection custody

SP-313 adopts the complete explicit private Workflow Goal cancellation current-inspection successor through the whole new schema and complete resource/method/entry/source-route maps. GRS-081 owns the semantic selection and SIR-053 the exact native private dispatch selection. The normative body below preserves the entire reviewed source protocol with recorded status, owner/path and heading substitutions only.

Exactly five existing storage-family consumer inventories gain the qualified private routes: goal_cancel_source_audit, goal_cancel_stop_receipt, goal_cancel_receipt and goal_cancel_progress gain read_original_inspection_custody.v1 plus inspect_current_event.v2; goal_workflow_cancel_late_assignment gains only inspect_current_event.v2, all under owner.goal.workflow_cancel. Only the V3 progress native-consumer list gains those two methods, and only the V3 late-assignment list gains inspector v2. All old entries and V2 profiles remain. There are zero new families, Events, policies, stored wrapper/schema/key/producer changes or durable reader effects. The existing BRS-026 coherent recovery owner remains sufficient and unchanged; the private bundle is transient and grants no source archive, backup destination or retention extension.

#### Original Workflow Goal cancellation current inspection — explicit private v2 source contract

SP-313 adopts the complete source contract for the original-source inputs of the already declared Workflow Goal cancellation current Event inspector. The exact original command remains cmd.chat.goal.cancel, accepted under goal_workflow_cancel_late_assignment.v1 with pm.goal.cancel.result.v3. The current goal.cancelled payload remains its existing v3 and the original Event family is unchanged. Only the private current inspection signature is a successor: owner.goal.workflow_cancel.inspect_current_event.v2. Its separately callable private source reader is owner.goal.workflow_cancel.read_original_inspection_custody.v1. Their complete signatures are Plans/goal_workflow_cancel_contracts/current-inspection-methods.v2.json and Plans/goal_workflow_cancel_contracts/current-inspection-entry-boundaries.v2.json.

The original inspect_current_event.v1 signature and its source map remain whole source lineage. They are not silently widened, reinterpreted or claimed installed. A native owner selecting this current-inspection successor must register its entire explicit v2 descriptor/resource/private source-reader/profile/codec/disclosure graph before exposing it. Missing any part leaves the route unavailable. This source adoption supplies no actual native installation. It does not change the original accepted command/result profile of any operation; all active no-association and bound Plan V2 operations keep their whole original command, schemas, physical keys and reader/producer routes.

##### Whole source types and separate authority

The new seven-definition schema uses whole existing resources by literal retrieval URI and exact containing-document hash. The complete predecessor Goal resource realm, including its four explicit embedded registrations, is preserved and augmented by one new whole schema. No native realm is merged, historical same-ID resource substituted, trimmed alias installed or network fallback permitted. The existing complete Goal custody, Goal argument, late-assignment, EventRecord, index/source and first/full-value custody schemas remain byte-identical. Their original numeric domains and codecs remain distinct.

OriginalInspectionCustodyV1 contains the complete original WorkflowSourceAudit wrapper, original StorageStopReceipt, original StorageCancellationReceipt, complete CurrentProgressPair, full frozen ProducerInput and exact OriginalInspectionCustodyReadRequestV1 selection. WorkflowSourceAudit refines the whole original StorageSourceAudit for the genuine nonnull Workflow association; it does not replace its complete original request, normalized identity, original nonterminal outcome, producer metadata, original body commitments or original execution binding. The shared SourceAudit/Stop/minimal-receipt physical wrappers keep their original V1 schemas and keys. Structural equality or reused schema IDs establish neither common issuer nor original accepted V3 profile.

CurrentInspectionProgressPairV1 references the whole existing CurrentProgressPair: complete current V2 StorageProgress head and its complete selected immutable V2 StorageProgress epoch. It narrows that selected original epoch only to event_ready, event_unknown, event_issued or control_published, with workflow_settled owner disposition. All complete fields and branch constraints survive, including original StopIntent/receipts, owner settlement, producer, nullable original publication and control-publication members. No head stands in for an epoch and no field is extracted into a shortened progress substitute. The explicit frozen_producer member equals the entire authentic selected epoch's producer_input byte-semantically under its original codec; duplicate copies are not independent provenance.

The source request contains exactly event_id and the whole existing seven-field ProgressSnapshotSelector. It is a requested selector, not an issued source capability. Its scoped versioned immutable key and epoch must agree with the actual current head and actual selected immutable epoch under original Storage custody. The inspector's actual original owners derive the scope/operation from the independently authenticated complete current Event and original accepted source, acquire the genuine current progress head/epoch, and form the exact requested selection. A caller cannot choose a V2 profile, forge a native accepted descriptor or turn a guessed key/hash into original custody. A stale or mismatched request refuses this invocation; it is not rewritten to a later head within the call.

The original immutable SIR acceptance selects the complete existing GoalCancelResultV3 descriptor before C-source, as GRS-078/SIR-052 require. The native original acceptance/installation owner authenticates that actual retained selection, full original operation identity and original issuing source/phase, not a new boolean, result-shaped object, caller field, descriptor copy or current command catalog default. There is no new acceptance archive or historical-body prerequisite. Missing genuine original acceptance/profile custody is unavailable; old operations cannot be upgraded to satisfy the request.

##### Exact permitted source routes

Plans/goal_workflow_cancel_contracts/current-inspection-source-routes.v2.json is the exact per-profile native consumer delta; SP-313 changes only the exact qualified consumer inventories in Plans/storage_value_registry.json under that adopted source contract. These inventories are not permission cross-products.

The new source reader and inspector v2 may independently read only the actual original operation's unchanged shared goal_cancel_source_audit, goal_cancel_stop_receipt and goal_cancel_receipt values, and the goal_cancel_progress **V3 accepted-result / V2 stored-wrapper** current head plus its selected immutable epoch, for this full private current-inspection purpose. They gain no general audit member, terminal, body, arbitrary operation, old V2 profile, writer, restore or migration authority. The late-assignment family's V3 profile additionally admits only the inspector v2; its whole original assignment is already part of OriginalGoalAppendReadback. Existing producers, all original profile lists and the original v1 source-lineage entries remain exact.

All five real key components use the existing lowercase even-length hexadecimal k(s) of exact scalar UTF-8: storage instance, project, thread, Goal and original operation. No Unicode normalization or rejection of otherwise valid colon-containing identifiers is allowed. The three shared prefixes remain unchanged. Progress uses only goal_cancel_progress.v2:...:head and goal_cancel_progress.v2:...:epoch:N, with N canonical nonnegative mathematical decimal and equal to the actual epoch. The actual database key, original root and exact stored wrapper identity are independently checked through the existing complete SP-310 family composition and fixed key/value branch. The current head's snapshot_sha256 hashes the entire actual selected immutable outer wrapper bytes under pm.goal.cancel_command_json.v1. Original immutable epoch selection does not use terminal copies, an old V1 key, hash-only lookup, a scan or a failed lookup as proof of absence.

The current head and immutable epoch are read together under the real original Storage snapshot/registration/root and current passive disclosure fence. The complete actual phase must contain the already frozen producer. Missing head, epoch, shared source or receipt is unavailable; the reader does not initialize missing authority, use an earlier head as current or recapture an absent record. A later valid invocation may select its own genuine current head normally. This contract supplies no in-call source substitution, automatic retry, recovery or progress advance.

##### Independently callable private source reader

owner.goal.workflow_cancel.read_original_inspection_custody.v1 has the complete request, OriginalInspectionCustodyReadEntryV1, success and unavailable signatures in the method map. The private entry carries that same full request and actual_custody. The actual original Goal/SIR/Storage owners independently acquire those whole original values and authenticate original accepted profile/issuer, exact physical keys/codec and current root/permission/hold/deletion/backup participants before any returning helper. A caller-supplied bundle, a prior helper's output or successful schema check cannot assemble an admissible entry on their behalf. If the complete entry cannot be obtained, the only branch is typed unavailable; no partial authoritative source bundle is returned.

The owner compares all scope and operation identities across request selector, original SourceAudit request/normalized identity, both original receipts, current head and selected epoch. The actual source has the original Workflow association admitted by GRS-078: no_bound_plan, genuine nonnull original run and exactly the original single Workflow owner association. Current binding changes or a later body cannot restamp that historical source. Original phase issuance is authenticated through its true retained owner/root/accepted profile and original storage lineage, not inferred from all matching identifiers.

SourceAudit's complete original producer metadata equals the complete header metadata of the frozen ProducerInput. event_id equals the requested exact original Event ID. Full original producer payload, original source audit and receipt joins use SP-304's exact source contract. The selected progress source_audit_sha256, StopReceipt.source_audit_sha256, CancellationReceipt.source_audit_sha256 and producer payload source_audit_sha256 all hash the complete actual original StorageSourceAudit outer bytes. Progress's original StopReceipt and CancellationReceipt semantic values equal the records in their complete independently authenticated physical wrappers. Their original physical keys, original issuing transactions, StopIntent domain-separated hash, original epoch succession and original receipt ref/hash all agree under the unchanged SP-304 recipes. Do not recompute a stored-row hash from the bare record or conflate original semantic, outer-value, RFC8785 and MessagePack domains.

The original cancellation_id equals the genuine original normalized operation_id; source, receipts, progress and producer retain the same project/thread/Goal/operation/command-instance identities. Receipt original_revision/currentness and producer payload revision/currentness equal the actual accepted SourceAudit body-selection facts. user_stop_epoch is the authentic original Stop receipt's resulting epoch, not today's host Stop. cancel_reason remains user_cancelled. CancellationReceipt.accepted_at, ProducerInput.occurred_at_utc and payload.cancelled_at_utc preserve SourceAudit.producer_metadata.occurred_at_utc exactly, including spelling. The source does not reauthorize the original user action against a newer body or permission snapshot and does not require the current Goal body/Stop row to reproduce these original facts.

The complete selected epoch's original Workflow settlement is authentic original issuing-phase custody. Reading it does not require a fresh current Workflow body, D05 success, D06 current readback, live reservation or current Start. All embedded immutable original fields remain whole; compact owner refs/hashes do not reconstruct original runtime values or become effect authority. This reader proves the retained original Goal event inputs only. It neither certifies that an Event was appended nor claims current Event availability.

On success the reader returns the entire OriginalInspectionCustodyReadSuccessV1 only across the qualified private original-owner boundary, with action_authority=none. It is not a public general audit API. The complete producer, source metadata and receipt/progress bundle stay private to the existing original inspection owners and are not exposed by the Event observation. Current app/Project audit permission and the actual original source owners' current lawful disclosure, codec, root, backup and hold/deletion guards apply independently, without a new current Goal-body/thread-visibility condition. No field is dropped, hashed or rewritten to manufacture an admissible original record.

##### Current Event inspector v2

owner.goal.workflow_cancel.inspect_current_event.v2 preserves the existing complete EventInspectRequest and EventInspectResult. Its complete private InspectCurrentEventEntryV2 adds the entire original Goal custody bundle to the complete actual OriginalGoalAppendReadback. The existing reader_binding remains storage.goal_cancelled.inspect_current.v1 as the original Storage observation binding; actual explicit native v2 method/descriptor/profile selection supplies this private source integration. That binding string is not a fallback into an old accepted-profile reader.

At its own original entry the inspector independently holds and admits the full actual request, original custody, current Event source and whole permitted EventObservation/unavailable candidate. It may invoke the separately callable private source reader, but the source reader's successful returned bundle is never sufficient admission for its caller. The caller independently authenticates every actual source and repeats its complete predicate. Lower original Storage, first/full-value receipt, exact Event, source/index, codec, provenance and copy/disclosure helpers have their own complete independent entry and final boundaries as well.

The genuine current SP-278 owner supplies the complete typed goal.cancelled v3 EventRecord, full actual source frame, append source/sink/manifest selection, index checkpoint/generation/frontier/read-token/row and current selected-root/coverage evidence. Exact storage/project/thread/Goal/event/global sequence/index-key and the whole read token/source selection agree with the full request. The source owner authenticates all actual source bytes and locator/index joins and the correct anchor/frontier relation. Neither a copied token, optional index miss, prior readback, old append-time source pointer nor equal value hash proves a current original Event. Lawful relocation/compaction is checked by the unchanged current SP-278 source/coverage owner, without rewriting original append facts or demanding that a current locator equal its original first-append locator.

OriginalGoalAppendReadback also supplies the complete original publication, genuine eleven-field first AppendReceipt, full_value_result, original custody and entire original LateAssignmentAudit. Apply all existing SP-286 original first-custody and domain-bound complete-value predicates independently of producer semantic equality. Compare the full actual Event's producer-owned fields to the entire independently authenticated frozen ProducerInput, preserving every field and primitive type. Compare Storage-assigned sequence/observed/persisted fields and original full-value/first-receipt/assignment joins through their authentic original owner domains. The late audit binds this original producer and assignment but never substitutes for the full original producer, current Event bytes, first custody or native original issuance. A released old reservation is original history, not a renewed live append requirement or permission.

All original payload/header/source/receipt joins from the private reader are rechecked against the current complete Event. The minimal receipt's physical key and complete outer hash equal payload.cancellation_receipt_ref and cancellation_receipt_sha256, and every original revision/currentness/Stop/occurrence/operation/source identity agrees. No current-body text, objective, fifth Goal state or fresh Workflow state is inferred. An unchanged invalid original remains invalid even when the current Event is byte-equal to a prior read.

Preterminal event_ready and event_unknown remain successful observation candidates when the actual original append/first-custody/current-source evidence exists and all full original inputs agree. They do not require event_issued, control publication or any terminal. If original progress is event_issued or control_published, its full already-recorded original publication must agree with that same actual Event/custody; no alternative original Event is accepted. NoEffect/unknown terminal is not a mandatory inspector source or a future prerequisite. Any contradictory genuine original evidence encountered by the actual owner refuses, and a terminal copy never repairs a missing frozen input. An immutable original unknown terminal does not itself contradict a later authentic original append; that terminal remains its original unknown outcome while the inspector may observe the genuinely issued Event. A true original no-effect claim conflicting with actual prior Stop/receipt/append evidence is a contradiction, not an absence proof. The separate retained-success/unsettled readers keep their existing full terminal-only routes and cannot be used as a generic preterminal progress provider.

Success discloses only the unchanged EventObservation fields: kind, event_id, sequence_id, payload_version, project_id, thread_id, goal_id, original revision, occurred_at_utc and action_authority=none. UnavailableRead discloses no partial authoritative observation. The inspector does not return the private source bundle, full producer, account identity, Goal body or a Workflow completion/state result. It changes no source, progress, receipt, control, terminal, Event or index state.

##### Universal final predicate and failure

Every method, independently callable original owner and returning lower helper first independently obtains and validates its entire actual typed input graph, genuine original accepted profile/issuance, full current source/custody/permission/deletion/hold/backup/root/codec participants and whole allowed candidate before any helper. Full expected sources are actual original owner-held values; booleans, hashes, schema IDs, resource maps, serialized handles, caller assertions or earlier helper results do not stand in for them. Structural checks apply to candidates as candidates, not as future previously issued objects.

After every returning helper and after the last helper, that owner reevaluates one pure full typed/source/owner/candidate predicate under the real held transaction/snapshot/disclosure fence. It rechecks the actual current progress head and selected immutable epoch, all original stored bytes/keys/issuer/profile/disclosure guards and, for inspector v2, the complete actual current Event/source/index/first/full-value custody and exact final observation. No helper, callback, logger, asynchronous gap, mutation or unguarded disclosure may intervene before the specific effect-free release. A lower helper's guard and its caller's guard are separate obligations. Final returned immutable copies preserve all admitted bytes; a copy helper also precedes the last predicate.

A changed head/selected epoch, missing full source, revoked registration, stale current Event selection, unsupported actual codec, wrong original profile/key, lost required original custody, changed permission, tombstone or lawful hold/deletion refusal yields the existing typed unavailable branch. It does not select a different source/epoch/profile in this call, replay the cancellation, enter recovery implicitly, initialize missing authority, append a replacement, invent no-effect/success, clear pending state or rewrite any genuine earlier effect. Earlier valid original Stop/receipt/Workflow/append/control/terminal facts remain as issued.

##### Storage, retention and installation boundary

There is no new physical family, stored wrapper, producer, checkpoint, projection, original archive, retention policy or lifetime. Source/progress/receipt/assignment originals keep their exact existing canonical non-rebuildable custody, RP-AUTHORITY-INDEFINITE policy and mandatory coherent backup/restore/deletion/hold rules. Full Event/source bytes remain governed by their actual original owners; a surviving audit or held derivative does not recreate or extend another source's lifetime. The transient private bundle grants no new storage or backup destination. Missing original authority stays unavailable/data loss under its existing owner; source readers never rebuild it from hashes, terminal copies, current Event bytes or current bodies.

SP-304's current Activity removal remains the canonical C-publish control-marker view. This passive inspector and source reader have no durable effect and no checkpoint. The original historical v2 Goal cancelled projection remains its own old route; the separate goal_run started/cancelled projectors cannot be borrowed here. Neither this source adoption nor source signature closure establishes current action authority, native execution, Event depth, end-to-end cancellation, global safe-stop, readiness or governance.

GRS-081/SIR-053/SP-313 select this complete private source-reader and inspector successor alongside the original GRS-078/SIR-052/SP-310 coordinator and separately adopted GRS-079/SP-311 started and GRS-080/SP-312 cancelled Event source contracts. Those event source adoptions remain separate installation prerequisites, as do every genuine original native writer/reader/codec/root/backup enrollment and all actual transaction/currentness/crash/replay/restore qualifications. This is adopted source-contract prose only; native installation and qualification remain independent.


```yaml
plan_unit_id: SP-313
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
gui_related: false
title: Whole original Workflow cancellation inspection custody
canonical_text: SP-313 adopts the complete explicit private Workflow Goal cancellation
  current-inspection successor through the whole new schema and complete resource/method/entry/source-route
  maps. GRS-081 owns the semantic selection and SIR-053 the exact native private dispatch
  selection. The normative body below preserves the entire reviewed source protocol
  with recorded status, owner/path and heading substitutions only.
unblocks: []
acceptance_criteria:
- Complete original source graph and independently enforced entry/final passive boundaries
  are selected.
- All original accepted profiles, stored wrappers, keys, producer routes and source
  lifetimes remain unchanged.
- Native installation and execution, Event depth, readiness and governance remain
  independently unqualified.
depends_on:
- SP-304
- SP-310
- GRS-078
- SIR-052
validation_surfaces:
- Plans/Goal_Runtime_System.md#GRS-078
- Plans/Shared_Integration_Runtime.md#SIR-052
- Plans/storage-plan.md#SP-304
- Plans/storage-plan.md#SP-310
- Plans/Backup_Restore_System.md#BRS-026
- Plans/goal_workflow_cancel_contracts/current-inspection-entry-boundaries.v2.json
- Plans/goal_workflow_cancel_contracts/current-inspection-methods.v2.json
- Plans/goal_workflow_cancel_contracts/current-inspection-source-routes.v2.json
- Plans/goal_workflow_cancel_contracts/schemas/current-inspection.v2.schema.json
- Plans/goal_workflow_cancel_current_inspection_schema_resources.v2.json
risk_class: original_goal_inspection_source_or_disclosure_drift
reasoning_tier: high
context_scope: sp_313_source_contract
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Goal_Runtime_System.md#GRS-078
- Plans/Shared_Integration_Runtime.md#SIR-052
- Plans/storage-plan.md#SP-304
- Plans/storage-plan.md#SP-310
- Plans/Backup_Restore_System.md#BRS-026
- Plans/goal_workflow_cancel_contracts/current-inspection-entry-boundaries.v2.json
- Plans/goal_workflow_cancel_contracts/current-inspection-methods.v2.json
- Plans/goal_workflow_cancel_contracts/current-inspection-source-routes.v2.json
- Plans/goal_workflow_cancel_contracts/schemas/current-inspection.v2.schema.json
- Plans/goal_workflow_cancel_current_inspection_schema_resources.v2.json
source_atom_ids: []
negative_constraints:
- No public command/result/Event/Goal-state or original accepted-profile change.
- No source reconstruction, new archive, lifetime extension, implicit recovery or
  original authority fabrication.
- No native writer/capability, projector/checkpoint, Event depth or runtime qualification
  from source adoption.
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-078, ContractName:Plans/Shared_Integration_Runtime.md#SIR-052, ContractName:Plans/storage-plan.md#SP-304, ContractName:Plans/storage-plan.md#SP-310, ContractName:Plans/Backup_Restore_System.md#BRS-026, ContractName:Plans/goal_workflow_cancel_contracts/current-inspection-entry-boundaries.v2.json, ContractName:Plans/goal_workflow_cancel_contracts/current-inspection-methods.v2.json, ContractName:Plans/goal_workflow_cancel_contracts/current-inspection-source-routes.v2.json, ContractName:Plans/goal_workflow_cancel_contracts/schemas/current-inspection.v2.schema.json, ContractName:Plans/goal_workflow_cancel_current_inspection_schema_resources.v2.json
