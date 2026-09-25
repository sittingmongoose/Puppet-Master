# Shard 076: Guided Tour pre-tour Original Chat State Custody - 2026-09-25

Source: `Plans/assistant-chat-design.md`

Source lines: L25893-L25944

Source SHA256: `51345ccf44e2484c8d13981a8dba1830c5e8f43da451c54ea478e4b8ef153a98`

---

## Guided Tour pre-tour Original Chat State Custody - 2026-09-25

`Plans/Planning_Wizard.md#PWIZ-023` hands the learner back the exact pre-tour Chat state after Skip, a
default-restore Finish, and the other already-defined restore paths. Assistant Chat owns that original because it
owns the covered state: the thread identity or its explicit capture-time absence, the conversation selection, the
composer placeholder, the unsent draft, and focus. `ACD-075` keeps restorable UI state with the thread and makes
deletion terminal for ordinary user navigation, while `ACD-076` forbids minting a durable `thread_id` for an
unsent empty draft, so the original can be neither derived from a thread-keyed record nor represented by one.

Operative requirement. Before the session's first Chat mutation, Assistant Chat MUST issue an authentic
pre-mutation original that:

- carries its own owner identity (`Assistant Chat`) and the Project/chat scope the original belongs to;
- covers exactly the captured thread identity or its explicit capture-time absence, the selection, the composer
  placeholder, the unsent draft, and focus, with a previously empty draft and a user-edited draft each covered
  exactly as captured;
- records the capture sequence proving capture preceded the first Chat mutation of the session, and the owner
  revision/currentness at capture;
- binds the captured value immutably with an owner-issued resolution and readback that no fixture, projection,
  live state, equal value recreated without that held original and readback, deferred `composer_prep_state.v1:{thread_id}` record, or
  `chat_state_restored` boolean can substitute;
- stays held and resolvable through the session's mutations, close/reload resume, and failed-restoration retry;
- is applied only by Assistant Chat, after Assistant Chat revalidates its own current lifecycle, deletion and
  tombstone state, permission, and scope for that state; and
- is released only after that session's terminal settlement or after the recovery resolution that ends it, with
  an unresolved or failed restoration retaining it.

Custody and the raw-content boundary. The prohibition on raw conversation bytes belongs to the Guided Tour
checkpoint: `captured_state.owner_refs_only=true` carries stable owner refs, and the checkpoint stores no raw
chat content, secrets, or transient animation geometry. That prohibition does not reach inside Chat-owned
custody. Assistant Chat MAY retain the exact unsent draft and the other original bytes it must hand back under
its own protected storage and permission model, provided no copy of them enters the Tour checkpoint, a Tour
schema field, a Tour fixture, or tour presentation state.

Current authority always wins over an authentic original. A held pre-tour original is a claim about past state,
never permission to restore it. If the thread was deleted or tombstoned after capture, or if current permission,
Project/chat scope, or lifecycle no longer admits the state, Assistant Chat applies nothing, keeps the tombstone
and its concealment visible, never re-creates the thread, selection, placeholder, or draft, and reports the
existing recoverable/unavailable outcome (`owner_state_unavailable` for resume; `recovery_required` with a
failed, retryable restoration that reuses the same original for Skip or Finish) instead of reporting
restoration. A hold on the original may delay byte purge; it never reverses, defers, or outranks owner deletion,
and it never restores a deleted source thread. Restoration is all-or-nothing across the covered components: a
partially applied composer, for example a restored placeholder without the captured draft or focus, is a failed
restoration and never an applied one.

Implementation status. This requirement is operative owner prose, not an available implementation. No typed
companion record, owner capture/resolve/readback/restore/release adapter, physical family, retention row, hold
record, or native writer for the Chat original exists today, and none is admitted here. Until those surfaces
exist and are admitted, a ref string, a tour fixture, a materialized current projection, the deferred
`composer_prep_state.v1:{thread_id}` record, or a boolean authenticates nothing and restoration fails closed.
This section adds no command, schema, storage family, retention policy, provider behavior, UI choice, product
default, or owner transfer.
