# Shard 076: Original Goal update source, physical custody and publication

Source: `Plans/storage-plan.md`

Source lines: L24000-L24954

Source SHA256: `365c5fa39cab5d0525f56d6eaf54da2dfb298fa4cf9c22bb027cfcdb8c77fedc`

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

C-owners obtains the actual independently owned effect disposition for this exact execution. No-bound-Plan requires complete actual binding-owner proof, not active_run_ref=null or an empty caller list; it preserves Workflow/run records and asserts none_required only for the Plan coupling specified below. A bound Plan requires its genuine original PlanRun cancellation, Plan Canceled control, exact run-specific schedule/quota invalidation and late-callback fence under PGOAL-007..010 before owners_settled. Goal never writes those bodies, cancels unrelated schedules or manufactures settlement receipts. The exact bound-Plan producer/query/CAS/result adapters are not yet supplied by the current owners; SP-305 remaining source integrations marks that variant unbound before C-stop. An already begun genuine owner effect can only be reconciled by that owner, never represented as none_required. Ordinary in-flight run/tool safe-stop obligations remain with their actual owners; this contract supplies no Goal child/tool/write settlement list or blanket workflow cancellation.

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

NEW storage.goal_cancelled.inspect_current.v1 is a passive single-member SP-278 consumer, distinct from Goal-created/update bindings. It accepts the exact actual Storage/project/thread/Goal/event/global sequence/full canonical index key, complete current ten-field read_token and thirteen-field source_selection. No paging cursor, hidden scan, best-effort prefix, numeric cut or search-by-hash exists. The actual Storage reader independently resolves the full original EventRecord from the token's genuine current selected root/node/dataset/families and all complete source frames. It validates the complete index row/value/key, covered source interval, checkpoint anchor versus later frontier, exact original event/first receipt/full-value custody and full current source selection. Copying a token or a SourceAudit does not confer source authority. Full schema/role/codec graph installation and actual selected original owner provenance are required.

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

The exact method/family matrix is Plans/goal_cancel_contracts/execution-methods.json. The complete integer path inventory and source derivations are Plans/goal_cancel_contracts/numeric-paths.json; conditional nullable Plan-version paths remain null in this bounded route, and full EventRecord adds its separately reserved sequence singleton. Before the first returning helper, each independently callable installer, creator, association reserving/committing/transferring/migrating/restoring/deleting method, current/audit reader, selection issuer, assignment reservation issuer, domain validator and original append/terminal publisher independently captures complete actual original participant/root/registration/owner/operation/source preimages and the entire permitted output. This includes unrelated existing members that its transaction must preserve. A supplied BindingRevision, Selection, EncodingTerm, AssignmentAudit or builder result is not that independent expectation.

After ALL parsers, schema validators, hash/codec functions, membership builders, copies, currentness checks and source resolvers return, one final pure predicate compares the complete actual native source/permission/Stop/cancellation/registration/root/backup/owner/lease set and every pending candidate byte with the independently derived permitted result. Actual whole control/head CAS, immutable-key absence, pending identity and all old preserved members participate. No returning helper occurs between this predicate and original commit/append/disclosure. Readback verifies complete actual committed values before dependent publication. An outer check after an incorrect original effect is insufficient. Third-state or changed guards fence; they do not roll back an earlier Stop, receipt, original event, control publication, SIR result or unrelated genuine effect.

##### Exact remaining scope

Bound Plan routes retain PGOAL-007..010: original PlanRun cancellation, Plan Canceled control, exact run-specific schedules/quota consent invalidation and late-callback fencing, without cancelling unrelated thread messages. Their complete original effect/CAS/settlement sources remain a separate normative integration dependency; this contract supplies association truth but not those effects. Workflow-specific disposition is likewise not inferred from no AssistantPlan binding. Unsupported prior Stop representations and pre-enrollment binding mappings require exact original migration evidence; neither is zero-initialized. No new product lifecycle or retention selection was made. This is Step 8 contract work for an already registered event. Native installation and full depth remain unproved; the distinct Step 9 campaign is untouched.

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

The exact physical-family and independently callable method contracts are `Plans/goal_cancel_contracts/execution-physical-families.json` and `Plans/goal_cancel_contracts/execution-methods.json`. `Plans/goal_cancel_contracts/numeric-paths.json` is the complete selected source integer inventory; it does not impose a new Goal integer bound. All schema references resolve through CV-347's complete offline graph. Original Plan/Workflow settlement adapters, unsupported prior-source migrations, and genuinely installed native roles/codec/publication remain independent prerequisites; declaring these source records supplies none of their actual execution evidence.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-073, ContractName:Plans/storage-plan.md#SP-304, ContractName:Plans/Contracts_V0.md#CV-347, ContractName:Plans/storage-plan.md#SP-305
