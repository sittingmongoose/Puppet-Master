# C12-CH1 — eleven worktree families

Implementation: `ce483b6976f45b4b07de8b69b8fd4b322f4ff789`. Base: `7cf56368356da2b7a5ff25f6452cf753ce36bf45`. Branch: `plans/ea-pnc-c12-ch1-20261114`.

Worker self-assessment of static criterion 12. Other criterion cells and admission membership are unchanged. Native execution, receipt authentication in the application, durability and blind review are NOT_RUN. No new product choice is needed.

## Grades

| Family | Before | After |
|---|---|---|
| `chat.thread_worktree_bound` | PARTIAL | PASS |
| `chat.thread_worktree_create_failed` | PARTIAL | PASS |
| `chat.thread_worktree_merge_failed` | PARTIAL | PASS |
| `chat.thread_worktree_merged` | PARTIAL | PASS |
| `chat.thread_worktree_pr_created` | PARTIAL | PASS |
| `chat.thread_worktree_pr_failed` | PARTIAL | PASS |
| `chat.thread_worktree_pre_merge_test_failed` | PARTIAL | PASS |
| `chat.thread_worktree_pre_merge_test_passed` | PARTIAL | PASS |
| `chat.thread_worktree_pre_merge_test_started` | PARTIAL | PASS |
| `chat.thread_worktree_renamed` | PARTIAL | PASS |
| `chat.thread_worktree_unbound` | PARTIAL | PASS |

## Implementation and proof

The original DCH entry points and source/tool pins are preserved. The complete current route composes unchanged owner schemas, shared producer qualification, independently held original intent/result/EventRecord/first receipt, binding transitions, W.8/W.9 execution observations and the original SP-278 publication graph. Frozen project/application controls cover merge strategies, test targets, enabled/disabled tests, successful and refused guards, failures, explicit overrides, Unix/Windows shell traces and receipt-before-launch recovery. These are deterministic observations, with no native process claim.

The source ledger records **186 controls, 3302 exact expected-refusal kills and 0 invalid mutations**. Each result names its exact phase, row and code, independent source copy, pre/post store digest, cut outcome and restored refusal. Exceptions never earn mutation credit. Whole-route cut outcomes are `{'accepted': 3082, 'exception_uncredited': 110, 'later_refusal_uncredited': 110}`. Exceptions or later refusals after a cut receive no isolated code-cut credit; only the separate actual gated report supplies that credit.

The gated tool `004bdedd632d9463f3535190a6ed5772338cdce1` proves **220/227 applicable rows in 69 tables**, with at most 7 rows/table. There are zero masked changes, unrelated changes or open findings. Seven singleton tables retain raw FAIL/unproved_guards status; their rows receive implication evidence only. Phases without applicable controls receive no credit.

| Unproved singleton | Earlier premise |
|---|---|
| `SC13_decoded_bytes` | SC12 has already strictly decoded the bytes as UTF-8 equal to project_id, whose own strict UTF-8 encoding is exact. Strict valid UTF-8 is injective and encode(decode(bytes))=bytes. |
| `CP29_value_event_type` | CP01 validates the selected complete checkpoint edition before any source family comparisons; every installed edition pins event_type to this exact family. |
| `CP30_event_event_type` | The same unchanged event object passed the complete retained reader before this row. That reader calls JN02 with this exact expected family before returning; no intervening write changes the object. |
| `CP32_consumer` | CP01 validates the selected complete checkpoint edition, whose consumer_id const equals this exact row reader in every installed edition. |
| `CP33_projector` | CP01 validates the selected complete checkpoint edition, whose projector_id const equals this exact row domain_projector in every installed edition. |
| `CS04_pointer_encodable` | CS06 already requires the exact one-key pointer containing an ASCII reference recomputed from real encoded bytes and their BLAKE3. Such a built-in map and string are always encodable by the current codec. |
| `CS05_pointer_size` | The exact CS06 pointer has a fixed ASCII prefix, 64 hex digits, a bounded decimal byte length and fixed media suffix. Even a 20-digit uint64 length gives at most 131 physical bytes, below 16384. |

The schema inventory covers **209 consumed definition occurrences** (19/family: payload, envelope, checkpoint, project/application source, four frozen recipes × three roots, receipt and commitment). Totals: `{"boundaries": 209, "controls": 3744, "expected_refusal_kills": 82649, "invalid_mutations": 2379}`. Every clause is witnessed or has an explicit covering argument; unresolved lists are empty. Method B uses the unchanged complete definition in SD01, with actual error-path witnesses, whole-definition cut and restoration. It makes no atomic schema-keyword-cut claim. Reference, format, pattern and supplementary checkpoint-selector constraints remain enforced. Strict-v4 aliases resolve only their separately SHA-pinned resources; the earlier recipes' explicit URI compatibility skip is recorded while date-time remains mandatory.

The complete original DCH suite replays **48126 checks, PASS**; the complete original Stop suite replays **4612 checks, PASS**. These are regression counts, not extra guard proofs. Stop-specific closure belongs to CH2.

## Shared numeric and time boundaries

The unchanged shared number self-test passes. The original adapter runs 186 checks and the newly completed receipt uint64 boundary runs 1474 checks. Logical integer domains are preserved; producer-semantic qualification is a separate boundary.

Date-time corpus: **83127 checks, PASS**, plus **28732 separately mutated returned/first-receipt checks, PASS**. `acknowledged_at_utc` uses EventRecord (E5-2), including permitted offsets; storage-only restrictions are not imposed on it. `ts` and checkpoint `retired_at_utc` retain their owner's uppercase-Z assertion plus EventRecord; `occurred_at_utc` uses EventRecord; `observed_at_utc` and `persisted_at_utc` use storage_utc_z. Both project and application boundaries are exercised. Classified node/resource bindings pass.

**Global shared datetime inventory: FAIL (291 diagnostics).** The frozen scan-exclusion purpose citation names absent `Plans/.plan_migration/pds-20261114-002-current-planunit-snapshot/span_map.jsonl`; one scan error causes 290 cascading inventory_node_missing diagnostics. This reproduces the existing shared-tool issue and is corroborated in `TOOL-ISSUES.md`. The frozen tool and retired migration run were not edited. There is no global datetime-suite PASS claim. This integration/tool issue is not counted as an oracle mutation kill.

## Sealed retained reads and real defect

Retained dispatch records **426 accepted/refused reads and 67 complete catalogue snapshots, PASS**. Worlds contain the actual custody map, first-receipt map, recipes and installed recipe tuples used by the reader. Missing, ambiguous and foreign-original receipt worlds are established before the read. Reader calls preserve the actual world and input bytes and never create receipts. Snapshot gzip files have their own byte SHA-256 pins.

Where: scripts/pm_dch_events.py, _current_record. Why: logical-schema admission omitted qualification of the current producer route. Fix: NW01_producer_route calls the unchanged shared semantic commitment. A prepared-family record reproduced the defect: producer_sequence_id=2^53+1 passed the current logical-schema route while the shared semantic commitment refused jcs_binary64. NW01_producer_route now refuses that append, while retained dispatch and logical integer domains remain separate. Before/after source, packet outputs and hashes are under diagnostics/tools. Run tools/verify_producer_repro.py from the lane checkout to load the byte-pinned prior source without editing files and reproduce accepted-before/refused-after.

## Evidence and reproduction

Raw evidence is external under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/c12-ch1/`. `SHA256SUMS` hashes actual file bytes, including compressed files. The guard driver also records uncompressed report hashes; those are different byte representations. `COVERAGE-MATRIX.json` maps owner clauses and complete consumed definitions to predicates, controls, negatives, cuts/restoration and raw reports. `QUOTE-AUDIT.json` re-reads the current owner/code quotes. `C12-GRADES.json` is a C12-only delta.

Use the assigned memory admission (12 GiB available), capped systemd scope (2 GiB, no swap) and a long-job. Run `python3 scripts/pm-dch-c12-check.py --out <external-output> --part source --part retained --part replay --part corpora --part entailments`; run `--family <exact-family> --part schema` for each of the eleven names above. Gated proof command and per-family selection are in `tools/prove.sh`; independent receipt-time checks are in `tools/copy_datetime.py`. Generated table verification is `python3 scripts/pm-dch-table-generate.py scripts --check`. Native runtime is NOT_RUN.

## CH2 handoff

Build on this branch. Shared schema_admission/current_record_valid and complete-definition inventory utilities are available; existing checker entry points and all frozen pins remain. CH2 owns ordinary thread/archive/bundle and Stop schema/source/retained gaps. In particular, Stop still needs its independently sealed retained store and its remaining grouped entailed rows isolated or proved. Reuse producer qualification at the actual current Stop writer boundary. The full Stop regression pass here does not close Stop C12. No IDs from reserved 3560–3579 were used.

No Jared decision is requested. The lead still owns blind review, integrated tool-issue reconciliation, admission and landing. The branch is pushed to both configured URLs; the final handoff records their independently read head SHAs. The worktree stays for integration.

## Source anchors

Each anchor is at implementation commit `ce483b6976f45b4b07de8b69b8fd4b322f4ff789`; source hashes are checked by the campaigns above.

| Path:line | Entry |
|---|---|
| `scripts/pm_dch_events.py:1075` | `_current_record` |
| `scripts/pm_dch_worktree.py:147` | `check_original` |
| `scripts/pm_dch_worktree_protocol.py:71` | `check` |
| `scripts/pm_dch_schema_coverage.py:278` | `run` |
| `scripts/pm_dch_c12_cases.py:173` | `cases` |
| `scripts/pm-dch-c12-check.py:293` | `main` |
