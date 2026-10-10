# Final mechanical results wrapper — root review required

Preparation only. No campaign join, old 236/194 checks, extraction, science-body interpretation, source/host call, account change, Git operation, publication, cleanup or delegation ran. Existing code, outputs, tests and scientific originals were not written. One actual native Goal covers this bounded preparation and is completed after saving. Root reviews these files and runs only after the final quiet freeze and final-v2 accounting snapshot exist.

The existing `results-table-v1/join.py` is imported by absolute path and its exact `build(runtime, checkpoint, accounting)` is called. SHA-256 is pinned in executable code to `a4e9f933b2260eeb12e6a4ad857289c7d92e884e20b66592a1b88ba2ac4ae4f8`. This wrapper does not call either extractor or freezer. `READ-PINS.json` records the preparation's read contracts; `SHA256SUMS.json` pins the new deliverables.

Root must first generate the final-v2 accounting snapshot with `--delivery-manifest` pointing to the same final-freeze-prep-v2 child whose `global-root-science-freeze.json` is supplied here. Both tools must use that child's exact `frozen-checkpoint.json`; a live root-checkpoint is refused. Final accounting without a valid delivery manifest is refused. Runtime must stay immutable; the wrapper validates hashes for consumed inputs before saving. It does not reread scientific bodies or independently verify root-attested science hashes. The global root before/after hash inventories, final science inventory metadata, exact reconciliation/custody pointers, original assessment hashes/pointers, source-label equality and missing sidecar pin are checked. Pointer metadata identifies frozen evidence; external custody/terminal pointers are not reread or reinterpreted here. Root's actual reconciliation and freeze remain the authority.

Exact CLI (replace the three named paths with root's actual frozen inputs and choose a nonexistent direct child):

```sh
python3 -B ER12_RUNTIME/mechanics/results-table-final/join_final.py \
  --runtime ER12_RUNTIME \
  --checkpoint /absolute/final-freeze-child/frozen-checkpoint.json \
  --accounting /absolute/final-v2-accounting-snapshot.json \
  --science-freeze /absolute/final-freeze-child/global-root-science-freeze.json \
  --output ER12_RUNTIME/mechanics/results-table-final/root-final-join-001
```

Only the new output child is written during invocation. All inputs are explicit. Output files:

- `legacy-product.json`: the full unmodified return value of the pinned legacy build, including all 80 rows, raw heterogeneous dimension facets, original labels, counts, provenance and read errors.
- `table.json`: copied rows with full final accounting, mechanically preserved declared-attempt records, their snapshot hash/JSON pointers and completeness flags. All original fields stay identical except the missing arm's mechanical `delivery`, set to `MISSING_PRE_INPUT_GUARD_FAILURE`. Original legacy resource fields and counts remain visibly named as legacy; final metrics use `final_accounting` exclusively.
- `metric-comparison.json`: descriptive failure-inclusive all-assigned totals and both-original-source-pass pair ratios/totals, stratified by exact phase, original method, role, arm, actual provider and requested tier. G assignment lineage may have actual Muse provider. No incompatible attribution strata are merged.
- `provenance-manifest.json`: consumed file hashes, full root-attested frozen hash inventory, accounting source manifest/errors, legacy errors, category accounting and original separate host/native failure records, unsummed native observations and authored Goal records.

All 80 unique arm IDs must agree across legacy, accounting and root freeze. Exactly 79 unique completed quiet original `-v1` evaluations must cover every arm except D-R1-03 treatment. Exactly 79 root-attested deliveries and the one missing arm are required. The missing arm retains `source_judgment=UNKNOWN` and `assessment_state=UNASSESSED`; original source judgment is never replaced by `FAIL`. Its sole original investigator, absent final role, failed-consumption evidence and original missing sidecar pin remain required. Accounting's observed created-context consumed cost must retain at least the known 197 seconds. No delivery latency/proxy is allowed for that missing arm. Original delivery dimension facets, native/protocol/time labels and all mismatches stay unchanged.

Attempt terminal latency is distinct from designated-final raw interval, root-attested delivery proxy and exact delivery time. Final accounting keeps created/start sums, unions, overlaps, missing inventory, complete sums and delivery evidence separate. Native/host failures never alter source correctness or delivery claims. No native cumulative meter is summed. No protocol/time/effective/billing eligibility, new grade or production qualification is inferred. Requested tier never becomes billed tier.

PASS and PASS_WITH_LIMITATIONS remain separate original labels but form the explicit source-passing-output denominator. Cost per source-passing output includes all assigned consumed costs, including failed and missing arms, and is labeled `CONDITIONAL_SOURCE_CORRECTNESS; not production qualification`. Ratios/totals restricted to both-source-pass pairs are explicitly labeled survivorship selections. No missing arm is called savings. Unknown or incomplete components make complete totals and per-output costs UNKNOWN; partial observed sums remain separately visible. Ratios of incomplete observed metrics are UNKNOWN. Arm-union sums are explicitly sums of per-arm unions, never a campaign wall-clock union. No heterogeneous provider billing equivalence, efficiency win or production savings claim is emitted.

New checks only:

```sh
python3 -B ER12_RUNTIME/mechanics/results-table-final/checks.py
```

Four finite in-memory fixture groups verify: retained 197-second missing failed attempt in failure-inclusive cost per original passing output; unchanged legacy product/raw facets and G→actual Muse attribution; UNKNOWN complete totals/per-pass costs when data or lifetimes are incomplete; and both-source-pass selection excluding FAIL/UNKNOWN while all-assigned totals retain them. They also import the hash-pinned join without calling its campaign build. `CHECKS.json` records their result. No old suite runs, temporary directories, fixtures on disk or cleanup occurs. CLI `--help` was checked. Production validation remains root-only; no `table.json` campaign product exists from preparation. Saving failures can leave an incomplete new child; require all four named output files before use.
