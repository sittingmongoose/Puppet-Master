# Shard 078: ATS-3900 - Executable s3bo family boundaries for the platform, seglog and Storage recovery families (C12-SS)

Source: `Plans/Automated_Testing_System.md`

Source lines: L16244-L16334

Source SHA256: `bfe1f88f8f06d79c825a512e7a86472961c45194610f6c9b29ea6c9932314493`

---

## ATS-3900 - Executable s3bo family boundaries for the platform, seglog and Storage recovery families (C12-SS)

PNC-019 lane C12-SS adds five family-boundary extensions to the ATS-2206 checker through the ATS-3880 extension contract: `scripts/pm_s3bo_ext_ss_platform.py`, `pm_s3bo_ext_ss_seglog.py`, `pm_s3bo_ext_ss_boot.py`, `pm_s3bo_ext_ss_integrity.py` and `pm_s3bo_ext_ss_recovery.py`, with shared owner codecs in `pm_s3bo_ss_common.py`. Each attaches a complete boundary record to its family's controls, projects raw operands into its own generated tables of at most eight real predicates, and adds independently labelled single-defect negatives whose expected outcomes are authored, never taken from the checker. Equality operands compare by exact JSON type, so a Boolean, a float and an integer never stand for one another. The common and C12-SR controls are unchanged, so their tables consume byte-identical proof inputs.

For `platform.capability_evaluated`, the N2-157 evaluation is executed over the original request, its independently authenticated context and every supplied source fact: the capability ref resolves only to an active entry of the frozen active catalog revision (CAP-POS-001, CAP-NEG-001, CAP-NEG-002, and the empty production catalog refuses every evaluation); each fact must match the request subject, an allowed source kind, a registered owner other than the retired `platform_specs`, owner verification, freshness, complete enumeration and no-secret checks, a source revision ref and an observation no later than the occurrence (CAP-NEG-007, CAP-NEG-008, CAP-NEG-009, CAP-NEG-011); duplicate source kinds refuse (CAP-NEG-010); required or preferred without valid evidence fails closed (CAP-NEG-006); `live_runtime_discovery`, then `provider_policy_snapshot`, then `static_platform_baseline` selects the state and reason over all nine finding products while lower valid evidence stays in precedence order (CAP-POS-002 to CAP-POS-005, CAP-POS-007); `not_requested` yields `not_evaluated`, `none`, null selection and no evidence (CAP-POS-006); and the scopes keep their exact project identity (CAP-POS-010, CAP-NEG-014). The decision custody is executed exactly: the `platform-evaluation:v1:` event identity over the restricted-JSON identity object, the scope-qualified physical key, the request and frozen-input digests, the request-and-context envelope projection, and the 14-field decision row joining request, catalog selection, minimal source facts, frozen input, Storage assignments and the original first receipt. A committed retry returns the exact original receipt with no action authority or read-through, a changed request is `idempotency_conflict`, lawfully deleted custody is never reconstructed from shared receipts, and capture closure refuses a fresh evaluation while retained retry still answers. The SP-2209 read returns the retained decision with the complete current marker and the live token of the read, or one closed unavailable reason; a decision whose catalog revision was later superseded replays against its own revision without recomputation (CAP-POS-008). The run-context consumer joins Storage instance, project scope, original request, owner-resolved run, thread, subject and evaluation identity, returns the committed decision with the unchanged runtime snapshot reference, and answers unavailable for aggregate coverage. Every v1 payload quarantines without a checkpoint advance or event, with its exact reason (CAP-NEG-012); because Puppet Master has not been released, no v1 platform payload or legacy `capability_key` exists and no owner text defines the typed evidence sidecar, so the CAP-POS-009 alias positive has no admissible input and its defined outcome, quarantine, is what executes.

For `seglog.event_appended`, the SP-270 producer is executed: one observability obligation per newly committed native original after the adoption floor and none for a `seglog.event_appended`, `projector_replay_only`, pre-floor, compatibility, import or relocated record; original frame and watermark proof before metadata admission, append and receipt, then the canonical settlement prefix, then the disposable checkpoint, with an unproved source leaving the obligation pending; the identity digest over RFC 8785 `[storage_instance_id, original.event_id]`; the exact payload mapping and envelope bindings, with a metadata sequence strictly after the original; original results and receipts never rewritten; replay, `idempotency_conflict` and `dedupe_unavailable`; and the reader, which stores only the nine-field durable token, discloses under the live token of its own read, reports `source_removed` and `source_unavailable` honestly and follows no metadata chain. `evidence` authenticates and replays the SP-270 package refrozen for DL-076: `/mnt/Cursor/PM-Experiments/ea-c12-ss-seglog-refreeze-20261114/event-authority-step08-seglog-appended-20260911/v5/manifest.json`, SHA-256 `8284857eaef00eaec19b333c4fc5c5ae5cbf696872b52b8efabd73c8e8e04ac2`, built by `scripts/pm-s3bo-ss-seglog-refreeze.py` from the v4-root package `1dbd8542840086c1741d55cc2ada0edbc4b3c02affa552c60d4f13321251a171`; its stored reader tokens carry no `redb_snapshot_id`, its stored-snapshot negatives refuse, and every other output is byte-identical to v4-root except the hashes of values that contain the token.

For `storage.boot_recovery`, the SP-291, SP-292 and SP-2205 boundary is executed: complete discovery by all six source owners with a nonempty result union per member; the W and S digests over the sorted unique work set and episode, the event ID, idempotency key, recovery set ID and publish actor; no-work settlement without an event; same-episode replay, and a later exact-W episode with `repeat_of` the earliest matching original by original sequence while earliest completeness holds; each issuance advancing a complete floor exactly once (revision, count, predecessor hash, issued transition and Boot receipt-set hash) and publishing the anchor as the same bytes, and an unavailable floor only by revision; a restore whose image floor equals the anchor keeping continuity, an older restore leaving the `continuity_unavailable` floor with the anchor never rolled back; post-restore issuance only through SP-286 fresh admission, a restored pending intent never first-minting and a surviving exact receipt replayed; `storage.boot_recovery.resolve_earliest.v1` answering the minimum original sequence or unavailable; a passive history reader that stores no checkpoint and returns unavailable rather than an empty history; and the DL-083 `app:storage_operational` bucket, fail-closed at 2,000,000, compacting only an expired unheld member and never borrowing another bucket's room.

For `storage.integrity_detected`, the SP-279 producer is executed over the finding input relations, canonical_uint_json.v1 finding bytes, the input, integrity, event, idempotency and report identities, the payload and envelope projections, the identical-input retry returning the original finding and result, a bound identity with different input refusing, a torn finding blocking, an unsafe sink leaving the finding pending, resumption after each crash cut without a second append, and the no-repair, no-checkpoint effect rule. The full-uint64 downstream route is the shared qualified RFC 8785 digest: values it preserves complete digest, append, first receipt and history read exactly, and values it cannot preserve, including the two full-u64 wire cases, refuse before any effect with the finding pending. The `exact_event` route joins unique UTF-8-byte-sorted refs to header-verified witnesses and corroborating source frames inside the affected ranges, never to advisory index rows. The history reader examines nonmatches, accepts only its own issued continuation, refuses a stale token and answers unavailable when the permanent report is missing or corrupt. `evidence` also authenticates the SP-279 actual-wire package pinned by `reports/event-authority-20260911/step-08-integrity-wire-validation.md` (manifest SHA-256 `d3692a22d5af8a1d611d7b53eb4f4065ef37d9e9b3a81e8089ab1ff70751078f`, 233 files) and replays its wire-capture and owner-reader suites byte-identically on a scratch copy.

For `storage.recovery_applied`, the SP-293 capsule boundary is executed over the six action fixtures: the input, prepared-postcondition and physical-receipt MP digests and every identity derived from them; the closed phase graph with `recovery_required` keeping the last proven phase, a committed capsule never reopened and revisions advancing by one; every captured field immutable; the frozen producer input and payload derived from the physical receipt; one append at the commit step and replay of the same receipt after a durable commit frame; the exact `publish.v1` response; the SP-2207 aftermath classes (new generation, kept generation, hold) after a verified receipt with no newer block, repeating nothing on restart; and the passive read with its exact fields, freshness `current`, `refreshing` or `stale`, health `healthy` or `degraded` from the current source contract, and typed unavailable for any missing proof, permission or foreign selector.

`scripts/pm-s3bo-check.py corpus` runs the whole shared number and date-time corpus through every common payload, envelope and receipt slot of these families and through each declared boundary slot; the seglog payload `seq` slot changes together with the common reference copy it is joined to, as `batteries` already does. These are deterministic fixture comparisons of presented protocol outcomes against owner rules over independently held inputs, plus the replay of one frozen external package; they do not authenticate a native Store or execute native producers. Native conformance remains NOT_RUN for all five families.

```yaml
plan_unit_id: ATS-3900
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  PNC-019 C12-SS adds executable family-boundary extensions to the ATS-2206 s3bo checker for
  platform.capability_evaluated, seglog.event_appended, storage.boot_recovery, storage.integrity_detected and
  storage.recovery_applied, runs the whole shared number and date-time corpus through each family boundary,
  executes the SP-279 full-uint64 route through the shared RFC 8785 digest, and replays the SP-270 package
  refrozen for DL-076.
gui_related: false
gui_classification_reason: Static event-authority contract oracles without presentation changes.
depends_on:
- ATS-2206
- ATS-3880
- SP-270
- SP-279
- SP-290
- SP-291
- SP-292
- SP-293
- SP-2205
- SP-2207
- SP-2209
- SP-2210
- N2-157
- CV-1100
- DL-076
- DL-083
unblocks: []
acceptance_criteria:
- Each family-boundary refusal is a real named table predicate with an independently labelled single-defect witness, at most eight per table.
- The common and C12-SR tables consume byte-identical proof inputs after these extensions load.
- The shared corpus runs through every common and declared boundary slot of each extension family, with expectations from corpus verdicts and owner bounds.
- Full-uint64 integrity payloads complete through the shared RFC 8785 route when it preserves them and stay pending before effects when it cannot.
- The refrozen SP-270 package is authenticated by its manifest and every file hash and replays byte-identically with no stored redb_snapshot_id.
validation_surfaces:
- scripts/pm-s3bo-check.py
- scripts/pm_s3bo_oracles.py
- scripts/pm_s3bo_cases.py
- reports/event-authority-20261114/depth-c12-ss-families.json
risk_class: false_event_oracle_closure
reasoning_tier: high
context_scope: event_authority_pnc019_c12_ss
implementation_surfaces:
- scripts/pm_s3bo_ext_ss_platform.py
- scripts/pm_s3bo_ext_ss_seglog.py
- scripts/pm_s3bo_ext_ss_boot.py
- scripts/pm_s3bo_ext_ss_integrity.py
- scripts/pm_s3bo_ext_ss_recovery.py
- scripts/pm_s3bo_ss_common.py
- scripts/pm-s3bo-ss-seglog-refreeze.py
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Automated_Testing_System.md#ATS-2206
- Plans/Automated_Testing_System.md#ATS-3880
- Plans/storage-plan.md#SP-270
- Plans/storage-plan.md#SP-279
- Plans/storage-plan.md#SP-290
- Plans/storage-plan.md#SP-293
- Plans/newtools.md#N2-157
preserved_exact_tokens:
- storage.integrity_history_reader.v1
- storage.boot_recovery.resolve_earliest.v1
- storage.recovery_applied.aftermath.v1
- platform.capability_run_context.consume.v1@1.0.0
- MIG-PLATFORM-CAPABILITY-EVALUATED-PAYLOAD-001@1.0.0
negative_constraints:
- Do not admit events, reseal governance or claim native execution.
- Do not add a replacement digest, rounding or a numeric cap for values RFC 8785 cannot preserve.
- Do not edit the gated guard tool, the frozen date-time files or the common and C12-SR tables.
```
