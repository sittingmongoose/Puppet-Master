# C12-DG6B closure implementation

Implementation commit: `3cf45ab255fc9f540e4ef51ccfbc2a922069be25`. Base: `7cf56368356da2b7a5ff25f6452cf753ce36bf45`. Branch: `plans/ea-pnc-c12-dg6b-20261114`. This report and the C12-only grade are a separate follow-up commit. No main landing is part of this lane.

## Result and grade scope

All 19 original family suites and all fresh family/shared Method B suites pass at the pinned implementation. Criterion 12 changes from PARTIAL to static PASS for each exact family below. Native execution remains `NOT_RUN`. The other eleven cell objects are unchanged. The aggregate grade becomes 190 PASS / 19 PARTIAL / 19 ABSENT (each family 10/1/1); this is not 12/12, admission, readiness, retention re-adjudication, or a governance seal. The existing retention cells are carried, not newly audited. Blind reviews remain with the lead.

| Exact family | C12 before | C12 after | Proved guard cells |
|---|---|---|---:|
| `auth.github.authenticated` | PARTIAL | PASS (static) | 86 |
| `auth.github.device_code.issued` | PARTIAL | PASS (static) | 86 |
| `auth.github.disconnected` | PARTIAL | PASS (static) | 86 |
| `auth.github.failed` | PARTIAL | PASS (static) | 86 |
| `auth.github.token.polling` | PARTIAL | PASS (static) | 87 |
| `plugin.hook.blocked` | PARTIAL | PASS (static) | 85 |
| `plugin.hook.error` | PARTIAL | PASS (static) | 84 |
| `plugin.hook.invoked` | PARTIAL | PASS (static) | 84 |
| `plugin.load_failed` | PARTIAL | PASS (static) | 84 |
| `plugin.loaded` | PARTIAL | PASS (static) | 84 |
| `plugin.permission.override` | PARTIAL | PASS (static) | 84 |
| `plugin.tool.collision` | PARTIAL | PASS (static) | 84 |
| `plugin.tool.registered` | PARTIAL | PASS (static) | 84 |
| `persona.created` | PARTIAL | PASS (static) | 125 |
| `persona.deleted` | PARTIAL | PASS (static) | 121 |
| `persona.exported` | PARTIAL | PASS (static) | 114 |
| `persona.imported` | PARTIAL | PASS (static) | 123 |
| `persona.selected` | PARTIAL | PASS (static) | 144 |
| `persona.updated` | PARTIAL | PASS (static) | 125 |

## Changes and counterexample

- **EventRecord date-time boundary:** `scripts/pm-dg6b-event-contracts.py:1080`, commit `3cf45ab255fc9f540e4ef51ccfbc2a922069be25`. The original append/retry/history validation invokes the inventory-authenticated shared `datetime_validator`, composed with the existing strict integer and uint64 validation. The complete owner schema and its keywords remain present.
- **Original receipt custody:** `scripts/pm_dg6b_original_custody.py:287`, commit `3cf45ab255fc9f540e4ef51ccfbc2a922069be25`. Independently sealed record, result, issued-receipt and custody-receipt bytes carry the existing CV-339 `full_value_result`, all eleven AppendReceipt fields, and the shared full-value commitment. Reads select the sealed original, never mint a missing receipt, and preserve the generic read-token schema/source-storage join without freezing the entire query token.
- **Receipt guards:** `scripts/pm_dg6b_original_custody.py:207`, commit `3cf45ab255fc9f540e4ef51ccfbc2a922069be25`. RC01 executes the complete receipt schema with `acknowledged_at_utc` on EventRecord (E5-2). RN01..RN05 execute shared `storage_uint64` on each receipt slot. RJ01 compares a typed event/sequence/full-value tuple to the independently sealed original. Exact row refusals propagate through the original checker. Tables total 183 distinct rows in 81 modules, each at most seven rows.
- **Whole-definition coverage:** `scripts/pm_dg6b_c12_schema.py:221`, commit `3cf45ab255fc9f540e4ef51ccfbc2a922069be25`. The generator proposes finite mutations; the original JSON Schema engine decides them. Occurrences, expanded refs/branches, controls, negatives, owner-clause cuts, actual predicate cuts and restoration are recorded. This uses C12 scope B's W3H whole-definition Method B option; it does not claim independent isolation of every JSON Schema keyword.
- **Complete replay entry:** `scripts/pm-dg6b-c12.py:15`, commit `3cf45ab255fc9f540e4ef51ccfbc2a922069be25`. It invokes the original family entry point before schema, date-time and sealed-store experiments. No replacement toy suite earns original-suite credit.

`missing-receipt-counterexample.log` pins the actual base checker and custody source hashes. With no first-AppendReceipt packet in sealed custody, the base accepts by substituting the query read token. The fixed checker refuses exactly `history_custody / HR01_original_custody / historical_original_recipe` without reconstructing the receipt from the available issuance witness. The earlier query-frontier probe changed a generic token; it is withdrawn and earns no original-receipt substitution credit.

Receipt geometry is authored fixture geometry. Native source issuance, frame/prefix verification and durability remain `NOT_RUN`; no native stored format is introduced by these static fixtures.

## Mutation ledger and proof

| Measurement | Count | Meaning |
|---|---:|---|
| Selected schema occurrences | 267 | Complete original boundary definitions across the 19 families |
| Expanded owner-clause occurrences | 20578 | Includes structural, duplicate and selector clauses |
| Exact expected phase/row/code kills | 34252 | Mutation ledger entries; not unique product defects |
| Isolated owner-clause witnesses | 14364 | Separate deep-copy owner-clause experiment |
| Invalid/non-targeting mutations | 10823 | Earlier or different refusal; zero kill credit |
| Owner-valid proposals discarded | 2171 | Zero negative credit |
| Complete schema row cuts accepted | 5920 | Explicit original-boundary acceptance observations |
| Complete schema row cuts without acceptance | 28332 | Later refusal or unavailable downstream value; no full-boundary acceptance credit |
| Fresh gated suites | 877 | Unchanged gated tool, source and dependency pinned |
| Proved guard row cells | 1868 | 35 declared donor cells included |
| Gated negative cells | 3012 | Native tool report total, separate from schema ledger |

The used guard-tool source is byte-identical to gated commit `004bdedd632d9463f3535190a6ed5772338cdce1` (`gated-tool-pin.json`). Every gated suite is PASS, with zero unproved guards, missing negatives, lane-matrix findings or checker findings. Guard/tool pins and every emitted report hash are checked by `tools/build-report.py`. Declared donors are recorded per suite; whole-definition, duplicate, earlier-schema and branch-selector entailments are explained in `covering-proofs.md`. The schema and guard totals are different experiment populations and are not added.

`input-manifest.json` additionally binds 45075 executed schema-negative references and 1216 original control occurrences to 22569 content-addressed JSON files under `inputs/`. These inputs are reconstructed from the frozen generator and matched to the already executed negative hashes; they add no test or kill credit. Multiple possible generating controls remain explicitly labelled as candidates. The report builder verifies every input file hash.

`coverage-matrix.json` binds each owner clause/branch to its original predicate, control, negative, cut and restoration, or its explicit covering proof. `reference-branch-inventory.json` inventories raw selected source resources; non-DG6B definitions in those resources earn no extra family coverage. `families/<exact-family>/coverage.json` keeps exact kills, invalid mutations and discarded proposals in separate arrays. `guards/<exact-family|shared>/summary.json` and each hashed native tool report are the gated evidence.

## Replays, numbers, date-time and store observations

- **Original replay:** 19/19 families pass through the existing entry point, including 323 append oracle records, 322 payload negatives and 108 relational negatives. Original p2b raw number spellings and complete producer/Storage routes remain in that suite.
- **Shared numbers:** 580/580 number-only cases pass (`numbers.log`). Current strict type semantics, Storage uint64 slots, large integers and raw spellings stay on the shared calls.
- **Date-time:** 53 distinct shared values run through each family at payload/envelope/retained/operation boundaries: 8109 observations (3372 accepts, 4737 exact expected refusals), including 3021 retained-read observations. All 53 values additionally reach the actual AppendReceipt ack boundary in each family. `timestamp-field-inventory.json` records 156 date-time occurrences (including 19 receipt ack occurrences), plus 38 UUID occurrences. EventRecord and Storage profiles are explicit; the inventory has no unsupported selected schema containers.
- **Store observations:** 532 custody observations, 7258 receipt-corpus observations and all retained date-time reads preserve before/after store hashes. These are separate experiment counts. `sealed-store/manifest.json` additionally binds 133 materialized read observations (19 accepted, 114 refused) to 96 full content-addressed snapshots. It includes actual foreign-original receipt/result packets and separate issued/custody-copy mutations of all eleven receipt fields.

## Shared integration issue

The full repository date-time inventory and combined shared self-test fail closed on the existing C12-DT exclusion citing the absent retired migration file `Plans/.plan_migration/pds-20261114-002-current-planunit-snapshot/span_map.jsonl`. This is one `scan_exclusions_invalid` root issue plus 290 derivative `inventory_node_missing` messages. All eight required tracked audit inputs were present for reproduction. `inventory.log` and `shared-all-current.log` record the result; the latter reports `NOT_RUN_ADMISSION_REFUSED`, so no combined 13,626-case corpus PASS is claimed. Confirmation and evidence hash are in `/mnt/Cursor/share/puppet-master/2026-11-04-program/streams/TOOL-ISSUES.md`. No frozen validator or exclusion was edited and no obsolete snapshot was manufactured.

The family-boundary proof and original suites above are separate static evidence. This lane does not claim repository-wide date-time integration closure. No new product choice is pending for Jared.

## Verification and artifact map

From the branch worktree, after meeting the lane's RAM/guard-slot requirements, run long jobs with a 2 GiB, zero-swap scope and foreground-wait with `long-job wait NAME --timeout 1500` (re-arm exit 124):

```sh
python3 scripts/pm-dg6b-table-generate.py scripts --check
python3 scripts/pm_event_numbers.py --self-test --scope numbers
python3 scripts/pm-dg6b-c12.py --family auth.github.authenticated --out /absolute/evidence/family
python3 scripts/pm-dg6b-guard-tables.py --family shared --out /absolute/evidence/guards/shared
python3 scripts/pm-dg6b-guard-tables.py --family auth.github.authenticated --pool /absolute/evidence/pool --out /absolute/evidence/guards/auth.github.authenticated
```

`tools/run-lane.py` enumerates all 19 exact families. `tools/run-proof.py` collects the three declared donor pools, then runs shared plus all 19 family proofs while reserving VM guard capacity. `tools/sealed-snapshots.py`, `tools/field-inventory.py` and `tools/missing-receipt-counterexample.py` reproduce their named artifacts. `tools/materialize-inputs.py` reconstructs the control/negative input artifacts without new mutation credit. `tools/build-report.py` checks current checker/tool/dependency/report hashes and refuses incomplete or failed proofs before regrading only C12. `tools/finish-report.py` emits this narrative from those verified totals.

- **Compact committed result:** `reports/event-authority-20261114/C12-DG6B.checks.json` and `C12-DG6B.md`.
- **C12-only grade:** `reports/event-authority-20261104/DG6B.self-grade.json`; exact owner/source quotes have line and SHA-256 evidence.
- **Raw evidence:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/c12-dg6b`. `SHA256SUMS` hashes every retained artifact except itself. Verify in that directory with `sha256sum -c SHA256SUMS`.
- **Frozen sources:** `summary.json` and each coverage/guard summary pin their exact sources. No Plans file, governance artifact, frozen guard tool or NUMRULE helper changed. No shard/index regeneration applies to this scripts-and-reports-only lane.
