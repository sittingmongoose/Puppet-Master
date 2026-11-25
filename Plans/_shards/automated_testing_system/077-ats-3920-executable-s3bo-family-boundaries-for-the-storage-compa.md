# Shard 077: ATS-3920 - Executable s3bo family boundaries for the Storage compaction, deletion, hold and quarantine families (C12-SL)

Source: `Plans/Automated_Testing_System.md`

Source lines: L16105-L16242

Source SHA256: `1c63cf0fb8234e6585a5606d01646e0f419af8fb195b615380a4d845214d9a5d`

---

## ATS-3920 - Executable s3bo family boundaries for the Storage compaction, deletion, hold and quarantine families (C12-SL)

PNC-019 lane C12-SL adds four family-boundary extensions to the ATS-2206 checker through the ATS-3880 extension contract: `scripts/pm_s3bo_ext_sl_compaction.py`, `scripts/pm_s3bo_ext_sl_deletion.py`, `scripts/pm_s3bo_ext_sl_hold.py` and `scripts/pm_s3bo_ext_sl_quarantine.py`, with shared codecs and fixture helpers in `scripts/pm_s3bo_sl_common.py`. Each extension attaches a complete boundary record to its family's control: the independently held owner facts and every run, each with its presented outcome. Its rows derive the expected outcome from those facts by the owner rules and compare. Every row is a real table predicate in a generated table of at most eight rows, with independently labelled single-defect witnesses. Only the expected guard together with its exact refusal code earns an input-mutation kill, and only the gated `scripts/pm_guard_isolation.py` cuts earn proof credit. `scripts/pm-s3bo-check.py corpus` runs the shared number and date-time corpus of `Plans/event_number_recipe_corpus.json` through every common slot and every declared boundary slot of the four families. `scripts/pm-s3bo-sl-report.py` writes the coverage matrix, the mutation ledger, the invalid mutations and the retained-read observations.

For `storage.deletion_lifecycle_changed`, every coordinator step is admitted or refused at the first failing stage of the fail-closed admission order of Thread/project deletion: the edge and payload conditional, the durable record state and pending obligation, scope and cross-project reachability, holds, the content-free tombstone and logical hide, writer and maintenance/compaction authority, and for `purged` a verified committed successor generation. Each stage has a positive and a refusal. A refused step appends nothing and changes no record, projection, checkpoint, purge or compaction dispatch or hold. An admitted step runs admission, then one record CAS with the frozen obligation, then the barrier append and first receipt, and only then the projection hide or purge dispatch and the result. The record, payload, SP-2200 identity with the 1-based `event_refs` ordinal and envelope scope are compared exactly. The checker also covers:

- **Retry after `failed`:** its only successor is `logically_hidden` (DL-695). It reuses `deletion_id` and the request key and takes the next ordinal after revalidating holds, tombstone, scope, writer and purge authority, and its record and payload carry the blockers found then. A retry to `requested`, `purge_pending` or `purged` is refused, and so is a retry whose revalidation is missing or fails at any of those stages; the record stays `failed`.
- **Replay variants:** same identity and digest, Storage-assigned fields only, a changed digest (`idempotency_conflict`), unavailable dedupe (`dedupe_unavailable`) and `projector_replay_only` (`replay_only_not_appendable`).
- **Crash cuts** at the CAS, the append and the first receipt, with resumption.
- **The two opening handlers**, the registry-only project removal and the separate confirmation.
- **Readers:** the passive history reader, returning unavailable rather than empty, and the canonical-record readers.
- **Withdrawal.**
- **Restore:** tombstones replay before visibility, and backup bytes are kept for at most 30 days unless held.
- **The 24-hour thread deadline.**

**Closed by DL-695 (lane C12-SL2, 2026-11-15):** Jared's E11-1 answer A makes `failed -> logically_hidden` the owner successor of a revalidated retry in Case L-3, and `RETRY_SUCCESSOR` in `scripts/pm_s3bo_ext_sl_deletion.py` is final. SP-2200 and SP-2201 keep the pending obligation in the record's `event_obligation` member, which both closed registry schemas now require. The deletion and quarantine checkers read the obligation from the row, compare its event identity, payload and envelope with the owner-derived values, and resume exactly that value after a crash.

For `storage.value_quarantine_changed`, detection mints the `qtn_` identity with occurrence one plus the matching purged records, and a re-detection of an open record resolves to it with nothing minted. Each transition follows the closed edges and the risk-class state sets. Resolution needs its own owner evidence:

| Resolution | Owner evidence it needs |
|---|---|
| `migrated` | An installed upgrader for a known observed schema |
| `rebuilt` | A rebuild source |
| `reset_to_default` | A resettable owner default |
| `restored` | A verified recovery source |
| `recovery_blocked` | Exactly when no lawful path exists |

Purge needs the original resolution receipt, an elapsed Q policy clock, no hold and no dependency. Raw custody is synchronized before the record CAS, and the live-key effect or DL-068 disposal follows the first receipt. The checker also covers:

- **Retirement:** operational records retire only after the purge settles and dependencies are released, and the audit then reports "Source evidence unavailable".
- **Cap pressure:** it never evicts an unresolved item, and blocks new mutation-capable writes for `Q-CRITICAL`.
- **Disclosure:** read-time disclosure shows only the quarantined fact without source access, and raw bytes leave only through permitted protected explicit export.
- **Restore** brings back the raw custody or reports it unavailable, and never re-runs a live-key effect.
- **Crash cuts** never re-copy raw bytes, repeat a live-key effect or purge twice.
- **Withdrawal and replay.**

The SP-2211 deleted-scope examples remain the common ATS-2206 rows.

For `storage.retention_hold_changed`, the checker covers:

- **Admission** in the SP-288 order: writer, installed versions, authenticated SIR, SP-2208 post-restore acceptance, permission, reason, the resolved target with canonical refs and exact scope, the expected core hash, then set absence or an active legal-hold preimage. A used set or clear slot replays the same command and conflicts for another.
- **Identity:** the hold-transition binding, `evt_hold_` id, key and logical receipt reproduce every owner fixture in `Plans/storage_retention_hold_contract_fixtures.json`. The EventRecord equals the original producer intent.
- **Cores and phases:** set and clear cores, `set_pending -> held` and `clear_pending -> cleared`, the OwnerResult with SIR success only after committed readback, and the pending-then-terminal order.
- **SIR custody:** non-regressing acknowledgement, and no append without one.
- **Union protection** with no automatic clear.
- **Crash cuts:** a first-receipt crash resumes without another append, while an ambiguous append or a failed commit stays pending.
- **Restore** without first-mint, passive history, and legacy `legacy_admitted_v1_protection` with a null original set receipt.

For `storage.compaction_lifecycle_changed`, the checker covers:

- **Admission and identity:** admission lookup (rejoin, `idempotency_conflict`, unavailable), the nonce `compaction_id`, target generation exactly source plus one and the carrier outside the frozen inputs.
- **Edges:** every reserved edge in the `Plans/storage_compaction_contracts/phases.json` adjacency, and each phase postcondition and exceptional predicate. An unprovable reservation is closed without observation, and its exceptional successor is proved at a fresh ordinal. Both `recovery_required` exits are covered.
- **Events:** transition ids and event ids by the HMP recipe, and the frozen producer with `failure_reason` exactly for `recovery_required` and `failed`.
- **Modes and aftermath:** action-mode selection, and the aftermath claims of each phase.
- **Publication** in the DL-270 order: the derived index activates before the pointer commit.
- **Reads:** CURRENT-only authority, with staged-prefix and mtime refusals.
- **Core and restart:** core and removal outcomes, restart, historical delivery order, and terminal settlement with replay.
- **Detail:** `RP-COMPACTION-DETAIL-7D` eligibility at 604800 seconds inclusive with every protection overriding age, exact eligible and forbidden members, the retirement intent and receipt order with the HMP retirement id, and coherent restore.

These are deterministic fixture comparisons of presented protocol outcomes against owner rules over independently held inputs. They do not authenticate a native Store or execute native producers, redb, fsync, backups or concurrency. Native conformance remains NOT_RUN for all four families.

```yaml
plan_unit_id: ATS-3920
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  PNC-019 C12-SL adds executable family-boundary extensions to the ATS-2206 s3bo checker for
  storage.compaction_lifecycle_changed, storage.deletion_lifecycle_changed, storage.retention_hold_changed and
  storage.value_quarantine_changed, and runs the whole shared number and date-time corpus through each family
  boundary. A deletion retry after failed is admitted only to logically_hidden (DL-695).
gui_related: false
gui_classification_reason: Static event-authority contract oracles without presentation changes.
depends_on:
- ATS-2200
- ATS-2201
- ATS-2205
- ATS-2206
- ATS-3880
- SP-2200
- SP-2201
- SP-2206
- SP-2208
- SP-2211
- SP-288
- SP-295
- SP-296
- SP-297
- DL-049
- DL-068
- DL-695
unblocks: []
acceptance_criteria:
- Each family-boundary refusal is a real named table predicate with an independently labelled single-defect witness, at most eight per table.
- The common s3bo and C12-SR table inputs are unchanged by the SL extensions, so their gated proofs are reused only after recomputing every consumed input.
- The shared corpus runs through every common and declared boundary slot of each SL family, with expectations from corpus verdicts and owner bounds.
- The hold identity recipes reproduce every owner fixture transition id, event id, receipt ref and result core hash.
- A deletion retry after failed is admitted only to logically_hidden with full revalidation (DL-695); retries to requested, purge_pending or purged and retries with revalidation missing or failed are refused at their expected rows.
validation_surfaces:
- scripts/pm-s3bo-check.py
- scripts/pm-s3bo-sl-report.py
- reports/event-authority-20261114/depth-c12-sl-families.json
- reports/event-authority-20261114/depth-c12-sl2-families.json
risk_class: false_event_oracle_closure
reasoning_tier: high
context_scope: event_authority_pnc019_c12_sl
implementation_surfaces:
- scripts/pm_s3bo_ext_sl_compaction.py
- scripts/pm_s3bo_ext_sl_deletion.py
- scripts/pm_s3bo_ext_sl_hold.py
- scripts/pm_s3bo_ext_sl_quarantine.py
- scripts/pm_s3bo_sl_common.py
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Automated_Testing_System.md#ATS-2206
- Plans/Automated_Testing_System.md#ATS-3880
- Plans/storage-plan.md#SP-2200
- Plans/storage-plan.md#SP-2201
- Plans/storage-plan.md#SP-2211
- Plans/storage-plan.md#SP-288
- Plans/storage-plan.md#SP-2208
- Plans/storage-plan.md#SP-295
- Plans/storage-plan.md#SP-296
- Plans/storage-plan.md#SP-297
- Plans/Decision_Log.md#DL-695
preserved_exact_tokens:
- RP-COMPACTION-DETAIL-7D
- legacy_admitted_v1_protection
- replay_only_not_appendable
- idempotency_conflict
- dedupe_unavailable
negative_constraints:
- Do not admit events, reseal governance or claim native execution.
- Do not admit a deletion retry successor other than logically_hidden (DL-695).
- Do not edit the gated guard tool or the frozen date-time files.
```
