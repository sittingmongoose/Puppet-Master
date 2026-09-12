# Shard 035: Original legal-hold command and pending outcome custody

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L2451-L2546

Source SHA256: `86dbaee473cbe795f3f4650f0862a466d74adbefb72882bb9ef6bacf34c414ed`

---

## Original legal-hold command and pending outcome custody

For exactly `cmd.storage.legal_hold.manage`, SIR-047 installs `owner.sir.storage_legal_hold_pending_custody@1.0.0` as the same-row delegation defined by Storage SP-288. Shared Integration Runtime remains the sole semantic producer and authenticator of the actual original CommandOutcomeRecord and the source of its CV-333 response join. Storage retains authenticated original normalized request, genuine pending progress and terminal outcome/response in the exact HoldV2 transition; it does not create a global Full Thread outcome family or peer producer. Create-only SIR-044, delete-only SIR-045 and Home-only SIR-046 are not authority for this command.

The original normalized request retains its actual full IdentityEnvelope, command/instance/operation, original dispatch ID/request ref, idempotency, actor, accepted time and exact arguments. Application/project/Server/Project Home Server/Host/Environment/topology bindings remain SIR-042's actual original values; no current topology or default identity replaces them. Source target generation is the actual SIR target generation, not a guessed topology generation. Command payload hash remains the existing hash of the normalized arguments. Full original request, outcome ref, target generation, dispatch frame and acknowledgement frame/offset/receipt must join the independently authenticated source, not merely two agreeing supplied objects.

### Durable nonterminal source and explicit resume

Before prepared Hold publication, capture the required closed SP-288 `PendingSIRCustody`, with immutable `original_source`, actual `current_source`, their complete canonical-JSON checksums, schema `pm.storage.legal_hold_pending_sir_custody.v1@1.0.0` and exact owner binding. Both sources carry actual original normalized request, full genuine nonterminal outcome, dispatch/acknowledgement identities, original outcome custody ref, capture authority/time and source stage clock. These are authenticated typed capture values; no claim of original SIR wire bytes or new serialization of the existing outcome is implied. The checksums exclude the containing capsule and are not authentication.

The outcome ref resolves only through the authenticated actual Hold row and selected set/clear slot's `pending_sir_custody.original_source.nonterminal_outcome`, with current progress at the parallel `current_source` path. The owner validates original request/operation identity and exact slot before resolving; caller-made capsule/slot paths or a nonempty ref are insufficient. On committed transition, the same original outcome ref resolves the exact retained terminal `command_outcome`; original/current nonterminal snapshots remain provenance rather than a competing outcome. `accepted`, `acknowledged` and `executing` are the only pending outcomes, with all terminal result/error/owner-result fields null. Accepted without acknowledgement preserves real absence. Acknowledged/executing requires actual receipt and frame; frame equality is equivalent to zero offset and `same_frame_acknowledged`, without inferred same-frame success.

Only an actual SIR-owned nonterminal observation may advance current custody under SP-288's complete pending-row CAS. Preserve original request/dispatch/outcome identity and the first capture; progress and observation/capture times cannot regress, and an existing acknowledgement cannot be relabelled. A first later acknowledgement carries its real frame/offset/receipt, time and capture authority and must commit as current custody before any Hold append or terminal work. No persisted terminal outcome is downgraded into missing pending provenance. Pending admission and acknowledgement publication revalidate actual binding/source plus complete current owner/domain/target/permission/writer facts after every dependent helper and before row/delegation publication; a post-write bind failure is not admission.

The explicit `resume_pending_sir` route authenticates only an actual admitted prepared Hold slot and its current authority, preserving the original operation. It does not silently replace a disappearing live source during an in-flight finish. Capture complete current row/owner/source/delegation/clock observations before dependent resolvers; after the final target/schema/clock helper, revalidate actual installed SIR owner/binding, unchanged source/delegation/clock, current permission/writer/target and complete owner fence before binding or disclosing the recovered source. No resolver follows that binding. Repeated unchanged resume and multiple admitted pending delegations are lawful without durable writes or redispatch; preserve actual authenticated owner bindings and immutable key/action/transition/capsule identities rather than clone or fabricate owner instances. A second crash may explicitly resume the durably advanced real acknowledgement again. The same final live guards apply after every resume. Missing required custody or original authority stays unavailable/protective and never becomes a generic recovery or new-operation capability.

### Terminal production and original replay

After SP-288 has actual original SP-286/CV-339 barrier receipt proof and a genuinely derived typed OwnerResult, SIR authenticates the original operation/result and privately stages its own terminal CommandOutcomeRecord and CV-333 response. This refines SIR-042/CV-333 publication ordering: those owners require authentic owner verification before public completion, not public success before delegated custody is durable. Staging grants Storage no producer authority, changes no public enum and creates no durable peer outbox.

The separate owner result is exactly `Plans/storage_retention_hold_contracts.schema.json#/$defs/OwnerResult`, schema ID `pm.storage.legal_hold_result.v1`, version `1.0.0`. `owner_result_ref` is the actual SP-288 receipt ref plus `/owner_result`; `owner_result_sha256` hashes that closed result object alone under existing RFC8785/SHA-256. Full original request/command/instance/operation/identity, argument hash, idempotency, target generation, dispatch/ack facts, outcome ref, result schema/ref/hash, receipt and sole event ref join the actual source. Clear preserves all original set custody; admitted legacy protection has no invented original set outcome or receipt.

Use a separately actual current SIR terminal clock. It cannot precede retained capture or original append acknowledgement, and must remain unchanged through final terminal admission. Fresh append observation follows its admitted current pending capture; original receipt replay retains historical times after later real progress. A discarded stage may be replaced by a genuinely later observation of the same original operation and original receipt; it is not an immutable public response.

After all receipt/custody/current-source/target validators return, revalidate selected stage/transition binding, complete staged records, captured complete source, actual live SIR source/delegation/binding and clock, then the complete current Storage owner/domain/target/permission/writer and whole-row preimage fence immediately before mutation. Hold actual exclusion through SP-288's one complete terminal row commit/readback, with no dependent resolver between final guard and publication. Source removal/replacement, stage/capture drift, clock or current authority change fails before mutation; postcommit SIR refusal cannot substitute. Publish actual original `succeeded` and CV-333 accepted/succeeded only from that complete committed slot, never an acknowledgement or schema-valid candidate. There is no incomplete immutable terminal row awaiting a later SIR patch.

Original terminal request/outcome/result/response and first receipt remain immutable and mandatory-backup. The delegated receipt/outcome resolver returns those authentic retained values under current disclosure authority without reacquiring disposed original dispatch/staging or transaction/group controls. A replay projection may identify its current transport dispatch and original_dispatch_id, while preserving original topology/time/command/operation/result/outcome/error/receipt/event identities. Passive replay/history writes no outcome, repeats no hold action, releases no protection and performs no cleanup. Current source/event inspection and current protection status remain SP-288/SP-278 duties, distinct from original receipt replay.

SP-288's old-restored-pending restriction remains exact: surviving original receipt replay is allowed; absence cannot authorize a replacement first receipt or classify old work as a fresh operation. This delegation supplies no Hold-specific fresh post-restore owner-acceptance capability. Shared exact frame/header/payload codec remains OPEN until separately adopted. Native authentication, owner/domain exclusion, dispatcher delivery, redb/fsync and restore remain `NOT_RUN`; schema validity and bounded adapters are not native proof or complete event depth.

### SIR-047 - Original Legal Hold Pending And Terminal Delegated Custody

```yaml
plan_unit_id: SIR-047
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  For exactly cmd.storage.legal_hold.manage, Shared Integration Runtime delegates authentic original
  normalized request, actual original/current nonterminal outcome and terminal outcome/CV-333 custody
  to SP-288's same canonical HoldV2 slot through owner.sir.storage_legal_hold_pending_custody@1.0.0.
  SIR retains exclusive semantic production and authentication. Actual acknowledgement progression,
  explicit repeated pending resume and privately staged terminal success preserve original identity
  and use final complete current owner guards before binding, disclosure or row publication. The
  separately hashed typed Hold result and exact first AppendReceipt join the original outcome;
  passive original replay never synthesizes custody or repeats a hold effect.
gui_related: false
gui_classification_reason: Original backend dispatch, owner-result, pending recovery and delegated custody.
split_recommended: false
depends_on:
- SIR-042
- CV-333
- DL-045
unblocks: []
acceptance_criteria:
- Only the exact legal-hold command receives this delegation; other command-specific or global outcome families supply no authority.
- Original/current pending source is captured from actual SIR before publication, with exact identity, real acknowledgement or absence and nonrecursive checksums.
- Real nonterminal progress preserves immutable original request/dispatch/outcome/capture and acknowledgement, with complete final owner checks before pending CAS.
- Explicit repeated/multiple pending resume preserves actual owner bindings and full current source/clock/fence state without implicit in-flight fallback or redispatch.
- SIR alone stages actual terminal outcome and CV-333 after authentic typed Hold result and original receipt proof; all source/stage/current owner helpers precede final guard and complete commit/readback before public success.
- Typed result ref/schema/hash and full original command/operation/topology/generation/frame/receipt/event joins remain exact; original set and truthful legacy absence are preserved.
- Passive original replay retains immutable values and current disclosure authority without disposed original controls, new acknowledgement or repeated hold effect.
- Old restored pending cannot first-mint; shared exact wire codec remains OPEN and native authentication, exclusion, durability and recovery remain NOT_RUN.
validation_surfaces:
- Plans/storage_retention_hold_contracts.schema.json
- Plans/storage_retention_hold_evidence.schema.json
- Plans/storage_retention_hold_version_routes.json
- Plans/full_thread_runtime_contracts.schema.json
- Plans/ui_command_response.schema.json
- reports/event-authority-20260911/step-08-hold-validation.md
risk_class: legal_hold_original_sir_custody_or_stale_owner_false_completion
reasoning_tier: high
context_scope: storage_legal_hold_original_pending_and_terminal_sir_binding
implementation_surfaces:
- Plans/Shared_Integration_Runtime.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/storage-plan.md#SP-288
- Plans/Shared_Integration_Runtime.md#SIR-042
- Plans/Contracts_V0.md#CV-333
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- cmd.storage.legal_hold.manage
- owner.sir.storage_legal_hold_pending_custody@1.0.0
- CommandOutcomeRecord
- pending_sir_custody
- same_frame_acknowledged
negative_constraints:
- No global outcome family, peer producer, guessed original identity/acknowledgement, redispatch, automatic clear or history action.
- No fresh post-restore admission from old pending or missing receipt, complete event depth, native proof, readiness or seal.
```

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#SIR-047, ContractName:Plans/storage-plan.md#SP-288, ContractName:Plans/Shared_Integration_Runtime.md#SIR-042, ContractName:Plans/Contracts_V0.md#CV-333, ContractName:Plans/storage_retention_hold_contracts.schema.json, ContractName:Plans/Decision_Log.md#DL-045
