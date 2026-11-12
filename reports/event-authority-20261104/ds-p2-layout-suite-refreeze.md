# Lane DS-P2: re-freeze of the Home workspace layout suite under DL-076 (2026-11-04)

**Family and cell:** `workspace.layout_changed`, `positive_negative_oracles`.
**Machine record:** `ds-p2-layout-suite-refreeze.json` (hashes, counts, runs, pins).

## Why

The 2026-09-24 Step 8 assessment graded this cell PARTIAL. The suite that `Plans/home_layout_event_contract_fixtures.json` pins as `frozen_joined_subject` (v4, SHA-256 `60f1c8ad…`) stored `redb_snapshot_id` in the reader checkpoint's `generic_read_token`, in its previous generations and in history cores. DL-076 (2026-09-24) forbids that: a stored SP-278 read token is the nine-field durable token, and every read joins the snapshot id of its own live read. Canon was corrected the same day (`fe46283fc5`); the frozen suite was not.

## What was done

The suite lives at `~/PM-Experiments/event-authority-step08-workspace-layout-20260911`, a symlink to `/mnt/Cursor/archive/PM-Experiments/vm-archive-20260925/event-authority-step08-workspace-layout-20260911` on the Cursor share. v4 was left untouched. A successor packet `v5/` was made beside it, the same way the Browser suite's pin was re-frozen in the first pass: change only what the amendment requires, keep the guard, write the reason beside the pin.

1. **Proof v4 still reproduces.** In a scratch copy, `validate_v4.py` and `check_slot_migration.py` regenerated v4's fixtures byte-identically and v4's manifest verified. So any v4-to-v5 difference is the DL-076 edit alone.
2. **Proposed schema.** `v5/proposed/Plans/home_layout_event_contracts.schema.json` is byte-identical to the canonical schema at `fe46283fc5`, the DL-076 correction (git blob `ff4e1d08…`). v4's copy was byte-identical to that commit's parent content (`808bd8d918`). Its `reader_checkpoint` and `reader_checkpoint_core` also equal today's canonical definitions at `600575221d`.
3. **Registry rows.** In `proposed-storage-families.json`, only the reader-checkpoint row changes: its `value_schema` follows the corrected definition. The slot and receipt rows are unchanged.
4. **Validator.** `validate_v5.py` is `validate_v4.py` with five marked edits:
   - the stored token is the durable projection of the live token;
   - the join compares the stored token with that projection, and the proof's snapshot with the live token's;
   - converted v2 bundles and synthetic history keep the durable token only;
   - the v2 `generic_snapshot` defect (a foreign snapshot in the stored token) becomes the same defect on the live read.
5. **Regenerated.** Three fixture files and two derived schemas.
6. **Owner contract.** `owner-contract.md` quotes the canonical SP-273 DL-076 amendment under the paragraph it amends.
7. **Freeze.** `freeze_v5.py` checks that v4 is intact, that exactly the declared members changed, the canonical pins, that no stored value holds a snapshot id, and case and count parity. Then it writes `manifest.json`.
8. **Reproduction.** A fresh scratch copy of v2, v3, v4 and the frozen v5 reran the three scripts. Every manifest member re-hashed equal.

## Result

| | v4 (before) | v5 (after) |
|---|---|---|
| Manifest SHA-256 | `60f1c8ad2de3a350ac781a1d24e1f7dad979e61bccda8a36c48f748841ff3df5` | `62823e0a62173cdd99bc41cc676e1aec9f4b5689122a51bc289ffb951aa70877` |
| Members | 51 | 53 (+4 new, −3 v4-only scripts; v4 keeps them) |
| `redb_snapshot_id` in stored values (checkpoint, slot, receipt, history cores) | 173 | **0** |
| `redb_snapshot_id` in the proposed schema | 6 | **0** |
| `redb_snapshot_id` in live-read evidence (`proof`, `admitted_receipt_store`) | 96 | 96 (kept: a live fence, which DL-076 keeps) |
| Joined relation cases (positive / negative) | 48 (8 / 40) | 48 (8 / 40), same ids and validity |
| Reader-history / cleanup cases | 22 / 4 | 22 / 4, same ids and validity |
| Slot-migration cases (positive) / cleanup-ordinary | 32 (3) / 12 | unchanged, byte-identical fixtures |
| Static validation outputs | PASS_STATIC_ONLY | PASS_STATIC_ONLY, equal JSON |

Three negative outcomes now name the DL-076 join; their declared validity is unchanged:
- `generic_snapshot` → "read joins its own live redb snapshot (DL-076)";
- `generic_frontier` and `same_generation_append_stale_token` → "complete current generic durable token (DL-076)".

## Repin

`Plans/home_layout_event_contract_fixtures.json` `frozen_joined_subject` now names v5's manifest and hash. The old pin and the reason are kept beside it in `refrozen`. File SHA-256: `e6e84c0e…` before, `c6da1130…` after.

SP-273 records the re-freeze in a dated amendment and lists this report among its validation surfaces.

## The full-value suite

The full-value suite pinned by `reports/event-authority-20260911/step-08-home-full-value-validation.md` (SHA-256 `7ab4fb00…`) was **not** re-frozen.

- **It stores no reader checkpoint in its own cases.** `common.py`'s `token(v, snapshot)` is a live token that `home_model.py` compares with the current source at each read. Two probes mutate that live token as negatives.
- **Where the stored-checkpoint form occurs.** Only in three places:
  - its copy of the pre-DL-076 reader-checkpoint definitions inside `proposed/home_layout_pending_receipt.schema.json` (its checks require that copy to equal the old Home1 definition);
  - its `source/` snapshots;
  - its `lineage/` and `runtime/home-regressions/` copies of the v2–v4 workspace suite.

SP-273's 2026-11-04 amendment records that, for the stored token, these copies are superseded by `Plans/home_layout_pending_receipt.schema.json` (corrected 2026-09-24) and by v5. Re-freezing that 193 MB, 3,658-file packet would need its pinned-source checks redone against today's canon. That is an open item if a reviewer prefers a re-freeze to the supersession note.

## Boundaries

Static and synthetic only. Native codecs, redb transactions, authentication and durability remain NOT_RUN. No DEPTH_PASS or seal is claimed.
