# Working Notebook repair recheck — a4111ec

## Verdict

**Most of the previous defects are repaired. Two bounded residual finding families remain: incomplete negative-case intent protection (high), and one public tool-signature omission (medium). Do not reopen the notebook architecture or start product runtime work.**

- Repository: `sittingmongoose/Puppet-Master`
- Reviewed commit: `a4111ec28b91f0f8ebbec139a43db8416771fbcf`
- Parent / previous review subject: `07382a95e9765890c8b56ab291c29144da60bf81`
- Packet: `PM-WNC-2026-09-05-v1`
- Work item: `wnc-20260905`
- Date: September 6, 2026
- Retrieval: live files through the GitHub plugin, pinned to the reviewed commit. Default-branch head matched at the beginning and end.
- Repository changes by this review: none.

## Scope and evidence boundary

This is a repair-focused recheck of FU-01..FU-05, not a new exhaustive certification of all 85 requirements / 62 scenarios. Sources inspected: AGENTS and Plans index; notebook authority, vocabulary, data/tool and validation sections; registered Tools signatures; repaired mutation schema branches; validator helpers, invariants, complete inventory checking and main validation loop; the corrected regression methods; relevant positive/negative fixtures; selected restamped coverage and manifest records; and REAUDIT_3.

`source_fragment_probes.py` was executed locally and produced 21 observations. It exercises the fetched inventory/reference-checker bodies with a synthetic inventory, the inspected supersede argument schema, and the isolated UTF-8 size predicate. The synthetic inventory is not represented as a canonical fixture corpus, and unrelated schema families are not reproduced. These experiments are not a full repository validator/test run.

`live_repo_followup.py` imports the actual validator and fixtures from a complete checkout, verifies an unmodified baseline, and tests same-record substitutions in memory. It was syntax-checked here but NOT executed against a complete checkout. Direct raw-network retrieval was unavailable, so this review did not independently run the full repository gates or 30-test suite. Published full-checkout results remain attributed to the implementing agent.

## Disposition of the five previous follow-up findings

| Finding | Disposition |
|---|---|
| FU-01: mutation contract mismatches | Largely repaired. Write now admits the required epistemic kind and provenance/validity references; operation is documented; supersede now requires an actual lifecycle operation and non-null CAS revision. A smaller `request_id` signature omission remains (RC3-02). |
| FU-02: create skips UTF-8 byte check | Repaired in the inspected code. The check now precedes operation branching. Local predicate probes exercised 65,536, 65,537, and 65,538 bytes for all three operations; the published tests also cover create at and above the limit. |
| FU-03: seven tests validate against wrong root | Repaired in the inspected source. The methods use the actual `$defs` via `subschema_errors`, include positive controls, and add ablations. No claim that the complete suite was independently executed here. |
| FU-04: coverage protects labels, not content | Partially repaired. Null records, absent/unresolvable static references, cross-record substitutions, and invalid declared targets are now checked. Same-record substitutions still evade intent protection (RC3-01). |
| FU-05: stale coverage stamp mismatch | The specific prior A58 validator-hash mismatch is reconciled: both inspected records now carry `8640639c3a024b8962babbdfb47f18175dbf7576459d5d0d7a4b333150fe8893`, and A58 is `process_evidence`. This is agreement of the inspected records, not a full independent rehash of every coverage file. |

The previous repaired memory, successful-transition, command-interface, and artifact-publication findings are not reopened by this review.

## RC3-01 — Negative-case identity is pinned to a record, not its intended constraint

**Priority: high. Continuation of FU-04 / WNC-R04.**

Evidence:
- `scripts/pm-working-notebook-contracts.py`: `EXPECTED_NEGATIVE_TARGETS`, `check_fixture_inventory`, and `run_validation` negative attribution.
- `Plans/working_notebook_contract_fixtures.json`: `neg_bad_epistemic_kind`, `neg_body_over_limit`, read-range and supersede negatives.
- `tests/test_pm_working_notebook_contracts.py`: current replacement test repoints all cases to `tool_requests[0]`, rather than replacing one case inside its allowed record.

The repair correctly requires each negative ID to declare its expected target record and mutate within that record. However, it compares only the first two path tokens:

```python
if mutation_tokens[:2] != target_tokens[:2]:
    # reject outside the record
```

For `neg_body_over_limit`, the target is `entry_envelopes[0]`. Its legitimate mutation makes the body oversized. Replacing only that mutation with:

```json
{
  "path": "entry_envelopes[0].epistemic_kind",
  "value": "verified"
}
```

still satisfies the target check. The ID, declared target, scenario inventory, and all positive records remain unchanged. It now duplicates `neg_bad_epistemic_kind`, so that row no longer exercises an oversized body.

The executed inventory-checker probe accepts this substitution. The main validator's rejection attribution is based on the supplied mutation path, not an independent intended constraint; rejecting the substituted enum value does not restore the lost body-size coverage. This is why the previous all-cases-to-one-record probe can now pass its expectation while the original coverage-intent weakness remains.

The live-checkout script includes three finite same-record substitutions:

1. `neg_body_over_limit` -> invalid epistemic kind in the same entry.
2. `neg_read_negative_offset` -> invalid range convention in the same read request.
3. `neg_supersede_null_expected_revision` -> unknown operation in the same supersede request.

Each must fail corpus validation for lost/replaced case intent, even though the replacement data is itself invalid. Their full-validator outcomes have not been executed locally by this reviewer; the fetched code and executed inventory check establish the gap.

### Related reference-resolution limit

`_scenario_ref_problem` strips the `#...` fragment and checks only filesystem existence for owner/process references. A supplied nonexistent anchor is accepted when the file exists. The local bounded probe confirmed this. Thus the helper establishes path existence, not exact owner-span resolution. This is included in the same evidence-integrity family, not a demand to build a general natural-language proof engine.

### Repair

Protect the intent of each required case, not merely its display name and enclosing record. A stable case descriptor can bind the relevant field/path, assertion category, and permitted mutation semantics; alternatively, an independently checked constraint-to-case map can establish equivalent coverage. Keep room for explicitly reviewed fixture evolution rather than blindly freezing every text byte.

Negative results should identify the expected failed constraint, with a valid unmodified control. Add tests that replace a case within its own record. Resolve supplied owner anchors/PlanUnit references using the repository's supported reference rules, or explicitly classify unresolved references rather than presenting them as resolved evidence.

Do not solve this by suppressing negatives, weakening the size/CAS/epistemic rules, or relabeling current static obligations as future runtime work.

## RC3-02 — Supersede still has an undocumented required argument

**Priority: medium. Continuation of FU-01 / WNC-R02.**

Evidence:
- `Plans/Tools.md`, Working Notebook And Exact History Read Tool Addendum, approximately L12770–12859.
- `Plans/working_notebook_contracts.schema.json`, `$defs/tool_request` notebook_supersede branch, approximately L1480–1555.
- Positive supersede request in `Plans/working_notebook_contract_fixtures.json`.

The operative Tools signature is:

```text
{ notebook_id, entry_id, expected_revision,
  operation: supersede | archive | tombstone,
  supersedes_entry_revision? }
```

The schema requires an additional `request_id`. The positive fixture supplies it. A request using exactly the listed required arguments is rejected with `request_id is a required property`; adding the field validates in the local schema-branch control.

This is much smaller than the previous mutation-contract defect. The lifecycle action and CAS requirements themselves are now correct. The broader notebook revision contract already explains request identities, but that does not make this agent-facing signature complete.

### Repair

Document `request_id` in the public supersede signature and its replay/idempotency behavior consistently with the existing mutation owner. If a common host/envelope carrier is deliberately intended instead, specify that mapping and align the schema; do not silently invent caller fields or remove idempotency merely to make an example pass.

Acceptance: a fully documented minimal supersede call validates; missing operation/CAS/request identity is rejected at the documented boundary; replay identity remains preserved.

## What the published green results establish

REAUDIT_3 reports 29/29 reviewer-script observations and 30 unit tests passing, plus the same three out-of-scope repository-wide failures. The repaired source supports real progress, and this review does not dispute that those particular tests could pass. Those tests do not currently cover the same-record substitutions above.

No allegation of fabricated execution is made. A passing named test population can coexist with an uncovered guard weakness. Runtime, provider, recovery, security, visual, and performance proof remain NOT_RUN as required for this Plans-only work.

## Finite completion target

Close RC3-01 and RC3-02; retain all prior repairs. Run the unmodified baseline, the existing regression suite and prior reviewer script, the added same-record replacement checks, and the minimal documented-signature check. Refresh affected evidence/closure records and then perform only the authorized supported governance reseal. Preserve existing out-of-scope blockers and unrelated work. Do not restart the feature design, create WorkNodes/NodeSeeds, unlock PNC-019, or build runtime handlers.
