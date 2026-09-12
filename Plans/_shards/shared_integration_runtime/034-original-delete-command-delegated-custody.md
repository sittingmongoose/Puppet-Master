# Shard 034: Original delete-command delegated custody

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L2383-L2449

Source SHA256: `86dbaee473cbe795f3f4650f0862a466d74adbefb72882bb9ef6bacf34c414ed`

---

## Original delete-command delegated custody

The `restore_point_delete_result` physical family is narrow canonical delegated custody for the existing delete owner under SP-272. It retains the genuine original normalized request/IdentityEnvelope, SIR-owned CommandOutcomeRecord and CV-333 response with exact operation/topology/generation/frame/payload/result/receipt/event joins. It creates no peer outcome producer or new UI response contract. Native succeeded/deleted requires genuine original success; owner-admitted refusal/failure requires original no-effect proof. Pre-dispatch errors remain non-durable. Existing SIR normalization and hash meanings remain unchanged; owner_result_sha256 hashes only the separately closed typed owner result, excluding its custody container/outcome/response.

Resolve `restore-point-delete-result:{sha256_utf8(exact_physical_result_key)}#/result` and `#/original_dispatch_custody/original_command_outcome` by authenticated actual-row lookup, rederived exact physical key and member pointer under SP-272. This is no physical alias or digest-to-row authority. The app-root original-result duty requires this complete original custody after RP90 point/operation/event retirement. Replay preserves original request/instance/outcome/result/receipt/event and original response; only the current dispatch wrapper marks replay and original_dispatch_id. It cannot reconstruct current topology in place of original values or rerun deletion.

Original native deletion admission authenticates SP-268's actual B1 and complete fresh lifecycle gates. The initial completed-operation evidence binds B1/B3 and append acknowledgement/group; the explicitly installed SP-285 pending route consumes authentic admitted pending custody and SP-286 receipt to publish B3 without disposed B1 controls. B3 writes only operation/result, preserving the actual point snapshot and independently admitted intervening holds. After lawful retirement, original replay resolves canonical retained result plus authentic SIR/dispatcher custody without re-requiring removed point/companion/source rows. Current disclosure permissions still apply. SP-272 owns retained bytes/lifetime and the exact `Plans/restore_point_deleted_contracts.schema.json#/$defs/command_result_receipt`; SIR remains the semantic owner of the original outcome. Later retained-result resolution explicitly follows SP-285 and authenticates the exact immutable delegated capsule under SIR plus current disclosure permissions; original raw normalized payload/dispatch and B1/B3/append-group controls are not reacquired. No original value, acknowledgement or outcome is reconstructed.

For the installed SP-285 pending recovery route, actual canonical pending custody delegates the original normalized identity/payload digest, original dispatch ID and genuine nonterminal SIR outcome. Initial dispatch authentication occurs before pending publication; restart never downgrades success or recreates raw dispatch payloads. SIR alone advances that same original operation. Preserve an existing acknowledgement; if absent, acknowledge in the actual current recovery frame. Bind current full owner identity, target generation, availability, frame and revision. Resolve the actual SP-286 receipt before the final complete owner-local guard, then publish terminal companion/result/outcome/response atomically with no dependent resolver between guard and publication. Stale completion preserves pending custody and current legitimate holds; no silent redispatch or new operation is allowed.

### SIR-045 — Original delete-command delegated custody

```yaml
plan_unit_id: SIR-045
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: SIR preserves its original delete-command normalized request, outcome and CV-333 response
  through narrow delegated SP-272 custody. Full original receipt/result and identity/topology/generation/frame
  joins remain authentic after lawful RP90 retirement, permitting original-result replay without dispatching
  deletion again. Full original B1/B2/B3/source authentication gates first capture; later SP-285 canonical-row
  resolution does not reacquire disposed raw SIR or transaction/group controls and still requires current
  disclosure authority.
  Installed SP-285 pending recovery authenticates retained original dispatch custody, uses SP-286 first receipt and publishes only after the final complete owner-local runtime/domain guard.
gui_related: false
gui_classification_reason: Defines backend custody, source validation and owner-result authority.
split_recommended: false
depends_on:
- SP-272
- CV-333
- SP-285
- SP-286
unblocks: []
acceptance_criteria:
- Capture actual original request/outcome/response and successful complete append receipt; a self-issued
  hash or schema-valid snapshot is insufficient.
- Exact logical member locators resolve authenticated canonical row identity; no physical alias or peer
  outcome is created.
- No-effect refusal/failure requires owner admission; pending and pre-dispatch rejection cannot fabricate
  terminal custody.
- Replay preserves all original semantics and current disclosure checks after source retirement without
  reexecuting deletion or changing SIR hashes.
- Initial source authentication remains complete; later original-result reads authenticate immutable retained
  canonical custody and current disclosure authority without retired raw source/transaction controls or
  reconstructed outcome/receipt facts.
- For the installed SP-285 pending recovery route, actual canonical pending custody delegates the original normalized identity/payload digest, original dispatch ID and genuine nonterminal SIR outcome. Initial dispatch authentication occurs before pending publication; restart never downgrades success or recreates raw dispatch payloads. SIR alone advances that same original operation. Preserve an existing acknowledgement; if absent, acknowledge in the actual current recovery frame. Bind current full owner identity, target generation, availability, frame and revision. Resolve the actual SP-286 receipt before the final complete owner-local guard, then publish terminal companion/result/outcome/response atomically with no dependent resolver between guard and publication. Stale completion preserves pending custody and current legitimate holds; no silent redispatch or new operation is allowed.
validation_surfaces:
- Plans/restore_point_deleted_contracts.schema.json
- Plans/restore_point_deleted_read_adapter.schema.json
- reports/event-authority-20260911/step-08-restore-pair-validation.md
- Plans/restore_point_retained_read.schema.json
- Plans/restore_point_retained_read_result.schema.json
- Plans/restore_point_retained_creation_read.schema.json
- Plans/restore_point_retained_creation_read_result.schema.json
risk_class: restore_point_terminal_custody_or_false_completion
reasoning_tier: high
context_scope: event_authority_step08_restore_pair
implementation_surfaces:
- Plans/Shared_Integration_Runtime.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- EA-BINDINGS-285-RESPONSE-001
```
