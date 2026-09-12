# Shard 068: Platform capability decision custody

Source: `Plans/storage-plan.md`

Source lines: L23067-L23195

Source SHA256: `71a2cfe2d19dcd08d42d316b467fd788cf31b1fa9ac2267143b815f6bfa0e61e`

---

## Platform capability decision custody

Status: `STATICALLY_MATERIALIZED`; no native installation, complete event depth or production positive admission is established.

SP-290 defines the new independent physical Platform decision family under DL-045 and adopts DL-048's approved pending/reference/hold lifetime. N2-157 owns original evaluation meaning through `platform.capability_evaluation.v1`. Storage's writer is `storage.platform_capability_decision.capture.v1` and event-bearing passive reader is `storage.platform_capability_decision.read.v1`. Registration is later-feature static materialization and does not add this family to critical/MVP arrays. Shared SP-286/CV-339 shapes and Case L-2 / SP-026 / SP-236 complete-source contracts retain their authority.

Register the independent redb family `platform_capability_decision` in table `platform_capability_decision.v1`, using `platform_capability_decision.v1:{storage_instance_id}:{scope_partition}:{sha256_utf8(evaluation_id)}`. Scope partition is `app` or `project~` followed by unpadded base64url of exact Project ID UTF-8. Recheck complete stored identity; the suffix hash is not authority. Event ID and idempotency key are both `platform-evaluation:v1:` plus SHA-256 of the restricted canonical JSON identity object containing domain `pm.platform.evaluation.identity.v1`, storage_instance_id, scope_partition and evaluation_id. Same evaluation IDs across scopes remain distinct.

The closed definitions are owned by `Plans/platform_capability_decision_contracts.schema.json`. The row is the exact closed 14-field `decision` definition, schema_id `pm.storage_value.platform_capability_decision.v1`, schema_version `1.0.0`. The original request is the closed 11-field `evaluation_request`, schema_id `pm.platform_capability_evaluation_request.v1`, schema_version `1.0.0`. The passive selector is exactly four fields. No alternate tags, extra fields, coercion or old external shape are allowed. Preserve all nested schema fields, nullability, enum and semantic joins. In particular, preserve original request and hash, selected catalog revision/entry, zero-to-three minimal source-owner facts, frozen input and hash, pending/committed state, exact Storage assignment custody, original eleven-field receipt and committed time. Source facts contain the original decision/provenance needed to explain the choice, never raw probe bodies, provider responses, credentials, account content, old transaction controls or source-service history.

The restricted JSON codec uses UTF-8; Unicode scalar key ordering; no insignificant whitespace or Unicode normalization; lowercase literals; base-10 integers without redundant zeros; and exactly the following escaping: quote and backslash escaped, U+0008/0009/000A/000C/000D use b/t/n/f/r escapes, remaining U+0000–001F use lowercase `u00hh`. All other scalars, including solidus, DEL, U+2028/U+2029, are literal UTF-8. Reject floats/nonfinite values, lone surrogates, non-string keys and foreign types. Decode rejects duplicate keys and any bytes unequal to exact re-encoding. SHA-256 is over these exact bytes, lowercase hex. EventRecord/shared append codecs remain separate and unchanged. Chronology compares exact RFC3339 instants with arbitrary decimal fractional precision while preserving original timestamp strings; do not lexically compare or normalize original receipts.

Actual Storage registration, installed writer/reader/codec, migration, origin, permission, quarantine and coherent backup/current-source authority must be available before admission. StorageMigrationCoordinator owns source/target version installation; this first canonical schema has no deployed proposal predecessor, guessed store version, lazy conversion or fabricated original custody. Missing/corrupt custody is canonical loss requiring mandatory backup and truthful mutation/history fences; schema/hash equality alone cannot authenticate imports.

### Capture, recovery and exact publication

Capture and validate the exact pending candidate from actual admitted original owners, then compare all held current facts immediately before publication. Subsequent helpers cannot run after the final guard. Duplicate pending/committed admission resolves the authentic original row and complete request before that same currentness fence.

Initial append requires exact original global/scoped event absence from the complete current append authority and all original source/dedupe/restore/first-mint controls. Use the same actual live append owner and its real publication algorithm. The NEW joint predicate runs inside actual install and issuance boundaries, protecting both original owner/root/restore capability facts and held caller facts. It cannot replace original owner checks, clone a capability or manufacture a returned receipt.

Preserve the three cuts: before publication resumes the same intent; after protected source publication continues its original group without another event; after actual first issuance resolves the original receipt without re-minting. A generic-source adoption or decision-CAS refusal after actual publication/issuance must preserve that genuine independent effect in the same owner and retain pending Platform custody. Fresh valid recovery rejoins it. A settled old restore cannot mint old Platform work without separately authenticated actual fresh restore admission. Decision-only backup restore does not implement full-root restore.

Storage assigns all three original fields. Before issuance, authenticate actual original unissued source/group/dedupe/barrier selection. After independent issuance, explicitly use `storage.first_append_receipt.resolve_full_value.v1` under SP-286/CV-339. Require the strict v2 writer, exact retained v1/v2 readers and explicit full-value binding, with no semantic-only fallback. The existing four-entry legacy selector map routes the shared calls to the same active v2 owner but does not grant full-value authority by itself. A genuine crash with null assignment custody can guardedly recover all three exact original fields after independent/backup issuance and lawful raw-control disposal only when current event and retained v2 witness survive.

Before assignment CAS and terminal CAS, independently derive the complete allowed successor from authentic retained row and actual original event/receipt custody. Candidate copying, validators and resolver outputs must equal that independently captured typed successor; caller-produced self-consistency is insufficient. Complete row/request/catalog/source seals, source and backups, original append/root/restore/capability state, reference and retirement owners, registration/admission and permissions remain current through the last pure predicate. No resolver/validator/copy helper follows it. Exact typed receipt bytes distinguish Boolean/integer/float substitutions. Both the returned full-value witness and current event join actual canonical append custody. A byte-equal replacement owner is not the same owner.

### Already committed receipt retry

Pending-to-committed completion and event-bearing passive reads require the exact current EventRecord and explicit original full-value witness. An already committed completion retry may return only the exact original AppendReceipt from its authentic retained decision row under the same current Store and final disclosure guards. This receipt retry grants no action authority or fresh read-through coverage, does not extend the DL-048 lifetime, and is unavailable after the decision row is deleted.

The committed branch authenticates the actual retained row, original receipt join, required installed bindings, current registration/migration/origin/permission/quarantine/backup authority and complete current generic source. It preserves complete held facts and exact typed returned-receipt equality through the final disclosure boundary. It does not need selected-event-body membership or a new full-value resolution solely to return that retained receipt. A lawful frozen-snapshot or owner-hold reference may keep the row after event-body retirement; receipt retry creates no new reference, hold, grace period or reason to delay due cleanup. A pending row with an independently issued receipt must still satisfy pending completion's current-event/full-value joins. Deleted Platform custody is not reconstructed from independently retained shared receipts.

### Passive read and complete source coverage

`storage.platform_capability_decision.read.v1` resolves authentic retained decision, complete current generic EventRecord authority including later nonmatching frames, exact selected event and frozen producer semantics, all three original Storage assignments and original v2 full-value/eleven-field receipt. Current relocation or lawful disposal of old controls cannot require original locators. Source advance invalidates a stale read; a fresh read can use the new complete boundary. Output is the original decision plus complete current read-through marker and action_authority none. Independently compare final output to actual retained decision and actual current source cursor after every helper and before the final owner fence. No checkpoint, probe, reevaluation, workflow action, Doctor health assertion or capability installation results.

### DL-048 cleanup, backups and gap custody

`RP-PLATFORM-DECISION-REFERENCED@1.0.0` is anchored_then_ttl/reference_release/zero TTL, indefinite false, no count/byte cap, fail_closed overflow, hold eligible, compact expiry. The original evaluation must be resolved and every current retained active or authenticated registered backup event reference, frozen run snapshot and valid owner hold must be released before the anchor exists. No grace period, historical timestamp or absence of cache bypasses a newly current reference. Authenticate complete current enumeration and scope-qualified physical targets; caller-provided zero refs, hashes and strings cannot release custody. Preserve these current facts through deletion of active and all registered decision backup copies. Pending custody always protects the row.

Backup capture and decision-only restore authenticate complete image bytes and original row origins. Restore must preserve every currently held row exactly: it cannot drop a newer pending original, rewind committed to pending or replace current authority. Capture/deletion preserve unrelated active/source/backup survivors exactly; backups cannot resurrect a lawfully cleaned row. Mandatory full-root restore still requires separate real coherent root authority. Original first receipt, events, frozen snapshots and raw source bodies keep independent policies. `platform.capability_evaluated` remains `RP-OPERATIONAL-2555D@1.0.0`.

The NEW transient same-owner retirement adapter consumes an actual existing-policy release for the selected event, not a new TTL/hold decision. Actual issuing owner generates canonical evidence bytes binding storage/event identity, complete selected event and digest, complete source/manifest preimage hashes, exact first/last sequence, reason and policy. Preserve issuing owner, actual Store and original token identity; caller-created evidence/ref/hash or legacy token alone cannot authorize an interior gap. At admission, consumption and final deletion, authenticate actual evidence bytes/seal/reference/origin and still-current actual selected event/source/manifest. Preserve every old gap and its distinct evidence exactly; add only the selected one-point retention_compaction interval, without coalescing, enlargement or omitted old gaps. Late owner/evidence/source revocation refuses without publishing the unauthorized retirement effect; every genuine independent append publication or receipt issuance already completed remains preserved in its actual owner. This does not add a durable evidence family or prove native eligibility.

### Installed operation support, withdrawal and complete obligations

SP-290 adopts RSC-017's original selected/running executable lease and exact `pm.platform.package_support_map` resource. Platform owns its five operation meanings. New pending capture requires `new_pending_capture` plus every retained role needed by the resulting durable obligation. An actual retained pending original requires `retained_pending_completion` and its resulting retry/read/backup-cleanup support. Committed receipt retry requires `retained_committed_retry`; event-bearing passive read and its selector materialization require `retained_decision_event_read`; backup, restore, relocation, authorized retirement and cleanup require `backup_cleanup_custody` plus their original independent proofs. No role declaration substitutes for actual registration, codec, migration, permission, origin, quarantine, complete source, full-value receipt or restore authority.

The existing admission method first resolves an authentic retained row at the exact scope-qualified key and compares its complete original request. An exact retained retry uses its current installed retained role without reacquiring disposed evaluation/catalog/probe/provider owners. A changed request conflicts. Absent or lawfully deleted custody cannot take this branch or be reconstructed from shared receipts. A fresh request, including `not_requested`, remains subject to current original evaluation authority and new-capture support. Closing capture preserves every original pending/committed row and independent effect, and starts no retention clock.

Acquire the actual original selection lease inside each affected original Storage operation and hold it through final publication/disclosure, including the original pending-row setter and joint shared append install/issuance boundaries. Preserve the operation's original Store facts before lease helpers. Compare returned lease/map facts to independently obtained original owners and exact resource bytes; the caller or a resolver cannot downgrade the required operation role. The final pure predicate also compares actual registered Vault contents with complete immutable typed originals. An earlier capture grant cannot publish after target closure; if a real pending publication wins, that row becomes a retained obligation for the next switch. Independently lawful shared issuance or backup remains in the same original owner when a later Platform step refuses.

Before a target may remove support, Storage supplies complete authenticated requirements across every enrolled scope, including inactive Projects, every active and registered-backup decision row and seal, pending originals and their downstream roles, current and legacy Platform event bodies, original append controls still holding such event bodies, active/registered backup event references, frozen snapshots, valid owner holds and exact shared receipt/read/restore bindings. Reference authorization and complete target resolution are required. Unknown backup event identities conservatively retain reader support; unresolved enumeration cannot establish absence. Every actual registered shared Vault artifact contributes its retained event obligations, including forensic custody without making it restore authority. A surviving shared-backup event prevents decision cleanup. Independently callable original Vault publishers/restore and reference mutations use RSC-017's same selection exclusion within their original owner bodies.

A candidate may omit a role only when the actual complete owners prove no remaining obligation depends on it, or an explicitly verified compatible successor supplies it under existing owner rules. Pending work must resolve, all applicable references/holds must end, and due active/registered-backup decision deletion must actually complete under DL-048 before those decision obligations disappear. Selected-target preparation preserves the complete original contents through RSC-017's final pure comparison; a new genuine row or backup after the last returned inventory invalidates selection without undoing that effect. Empty decision rows alone do not remove independent shared receipt, legacy/current event-reader or whole-boundary restore duties. No grace period, additional hold, early deletion or historical-control reacquisition is introduced.

Keep exact current v2 event writing and the original v1 payload compatibility reader/migration edge. Legacy conversion validates actual old bytes and owner-backed derivation, preserves original source/cardinality/lineage, and quarantines unprovable conversion without advancing a checkpoint. It neither creates a native decision nor remints an event. Decision schema `pm.storage_value.platform_capability_decision.v1@1.0.0`, strict shared v2 writes, retained v1/v2 readers and explicit shared legacy selectors remain unchanged. The selected package may close capture while preserving pending completion, committed retry, passive read and backup/cleanup; actual loss of any prerequisite fences its dependent operation with custody intact. Cold reopen reacquires current original installed/running agreement and complete obligations. Compatible rollback uses the same real target-admission checks, never an old receipt or withdrawal latch.


### Validation boundary

The validation report `reports/event-authority-20260911/step-08-platform-custody-validation.md` pins the frozen v11 implementation model, completed independent binding review, direct/mandatory-backup fixture captures and exact static schema checks. These establish bounded contract/model evidence only. Native source/owner authentication, actual schema/family/policy/reader installation, locks/leases, redb CAS and physical atomicity, frame/CRC/fsync, complete backup/archive enumeration, whole-root restore, real concurrent crash execution, actual TTL/hold adjudication and production capability admission remain NOT_RUN. No cross-owner atomicity or native installation follows from in-process fixture identities. The active catalog remains empty; no runtime/depth/readiness/WorkNode/governance clearance follows.

### SP-290 - Platform Capability Decision Custody

```yaml
plan_unit_id: SP-290
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  The independent platform_capability_decision redb family retains exact original scoped
  evaluation custody through the closed Platform capability decision custody contract.
  Its capture and event-bearing passive read explicitly adopt the same original append owner;
  pending-to-committed completion and event-bearing reads require current full-value proof.
  Already committed retry discloses only the exact retained receipt under current guards,
  without fresh coverage or lifetime extension. Mandatory backup, coherent recovery and
  complete reference-aware cleanup preserve DL-048 and independent event/receipt policies.
  RSC-017 original package leases separate fresh capture from retained service and preserve
  complete actual obligations through target selection and every original publication.
gui_related: false
gui_classification_reason: Defines internal custody, codec, owner interfaces, recovery and cleanup without visual presentation.
depends_on: [RSC-017, SP-026, SP-236, SP-237, SP-278, SP-286, CV-339, DL-045, DL-048]
unblocks: []
acceptance_criteria:
  - Exact scope-qualified physical key and canonical identity hash distinguish application/project evaluations while complete original identity remains authoritative.
  - Closed decision, evaluation_request and read_request definitions retain exact tags, fields, nullability, source facts, frozen input, Storage assignments and original receipt.
  - Restricted canonical JSON, exact re-encoding, scalar ordering, escaping and timestamp-instant comparison preserve original typed bytes without changing shared EventRecord codecs.
  - Actual installed registration, writer/reader/codec, migration, origin, permission, quarantine and coherent current-source/backup authority precede admission and remain current through publication.
  - Original pending capture and duplicate admission authenticate complete actual source/request/row authority; changed same-key requests refuse.
  - Actual original append install and issuance boundaries preserve both original owner/root/restore capability and caller facts, with no cloned authority or fabricated receipt.
  - Before-publication, after-publication and after-first-issuance recovery retain one original intent, event and receipt; later refusal preserves genuine independent effects.
  - Pending assignment and terminal CAS join actual current event, all original assignments and explicit retained v2 full-value witness, including genuine null-assignment recovery after backup issuance.
  - Independently captured complete allowed successors and final pure owner predicates fence every helper, typed candidate, resolver witness and returned receipt.
  - Already committed receipt retry preserves current Store, generic source, bindings, authentic row and exact output guards without a new selected-body/full-value requirement, fresh coverage or lifetime extension; deleted rows remain unavailable.
  - Event-bearing passive reads require exact current selected event and complete current read-through including later nonmatching frames; they supply original decision and action_authority none.
  - Pending state and every current active/registered-backup event reference, frozen snapshot and valid owner hold protect custody through complete authenticated cleanup enumeration and deletion.
  - Mandatory backup and decision-only restore preserve every currently held original row and unrelated survivor; cleanup cannot be undone by a stale decision backup or confused with full-root restore.
  - Same-owner selected retirement evidence preserves actual owner/token/source/manifest authority and all distinct old gaps, adding only the exact one-point interval after existing-policy release.
  - Existing event and receipt policies, catalog, payload and critical/MVP arrays remain unchanged; native execution and complete event depth are not inferred.
  - Actual installed five-role support separates new capture from exact retained completion/retry/read/backup-cleanup without disposed source reevaluation.
  - Original operation and independently callable Vault/reference mutation bodies enforce the same selection lease; genuine earlier effects survive later refusal.
  - Complete actual active, inactive-project, source-control, reference and registered-backup obligations remain unchanged through the final pure target publication predicate.
validation_surfaces:
  - Plans/platform_package_support_map.schema.json
  - reports/event-authority-20260911/step-08-platform-withdrawal-validation.md
  - reports/event-authority-20260911/step-08-platform-withdrawal-checks.json
  - Plans/platform_capability_decision_contracts.schema.json
  - Plans/storage_value_registry.json
  - Plans/event_append_receipt_contracts.schema.json
  - reports/event-authority-20260911/step-08-platform-custody-validation.md
risk_class: lost_original_platform_decision_or_false_append_and_retention_authority
reasoning_tier: high
context_scope: original_platform_decision_physical_custody
implementation_surfaces: [Plans/storage-plan.md, Plans/storage_value_registry.json, Plans/platform_capability_decision_contracts.schema.json]
node_compile_hint: {mode: platform_decision_custody_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - reports/event-authority-20260911/step-08-platform-custody-validation.md
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-048
negative_constraints:
  - Do not mint from caller claims, clone original append/root/restore capability, replace full-value joins with semantic receipts, or roll back genuine independent issuance after a refused domain commit.
  - Do not add a receipt-only Platform endpoint or fallback after row deletion, independent grace period, app-root indefinite lifetime, raw source archive or new event-retention policy.
  - Do not grant action authority, current health, fresh coverage, recovery effects or checkpoint advance from receipt retry or passive historical reads.
  - Do not introduce a new durable retirement-evidence family or infer native eligibility, complete event depth, readiness, WorkNodes, NodeSeeds or governance sealing.
owner_hints: [Plans/storage-plan.md, Plans/newtools.md, Plans/Contracts_V0.md, Plans/Decision_Log.md]
```

ContractRef: ContractName:Plans/storage-plan.md#SP-290, ContractName:Plans/newtools.md#N2-157, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/Contracts_V0.md#CV-339, ContractName:Plans/storage-plan.md#SP-026, ContractName:Plans/storage-plan.md#SP-236, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/Decision_Log.md#DL-045, ContractName:Plans/Decision_Log.md#DL-048, ContractName:Plans/platform_capability_decision_contracts.schema.json, ContractName:Plans/storage_value_registry.json
