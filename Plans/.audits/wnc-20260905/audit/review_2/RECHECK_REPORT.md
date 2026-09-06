# Working Notebook repair recheck — 07382a95e9

## Verdict

**Real repairs landed, but the claim that all seven findings are closed is not supported. A narrow follow-up repair is required.** Do not redo the notebook architecture or start application implementation.

Repository: `sittingmongoose/Puppet-Master`  
Reviewed commit: `07382a95e9765890c8b56ab291c29144da60bf81`  
Prior reviewed commit: `2826699f7e7f23ab12a8fdfaf5f1518748f12d5a`  
Packet: `PM-WNC-2026-09-05-v1`  
Work item: `wnc-20260905`  
Date: September 6, 2026

The default-branch head was checked at the start and end of this review and remained the reviewed commit. The repair commit and `audit/REAUDIT_2.md` explicitly claim all WNC-R01..R07 findings closed. This recheck used live files through the GitHub plugin, not just those claims. No repository files were edited.

## Scope and evidence boundary

This is a repair-focused source audit, not a fresh certification of every requirement in the 85-requirement/62-scenario packet. The inspected surfaces include the repaired memory verification section and injection consumers, Tools signatures, schema root and tool/transition branches, validator code, all published regression-test source, positive requests and the scenario map, publication rules, and selected manifest/coverage/closure records.

`source_fragment_probes.py` was executed locally and produced **29 observations**, including valid controls, repaired counterexamples, and remaining defects. These are bounded source-fragment experiments. Relevant schema branches are reproduced semantically; unrelated families are not implemented. The inventory-checker body is copied from the inspected source and exercised with a synthetic inventory control. This is not execution of the complete repository validator, its 21-test suite, broad governance gates, or product runtime.

`live_repo_recheck.py` is a read-only reproduction script for a complete checkout. It imports the actual repository schema/validator, uses the actual positive fixtures, mutates copies in memory, and can execute the seven suspect published test methods with their target definitions disabled. It was syntax-checked here but **not executed against a full checkout**. The review environment did not have a complete checkout; a direct raw-file network attempt failed. Reported repository test/gate results remain attributed to the agent's published evidence.

## Disposition of the original seven findings

| Original finding | Recheck disposition |
|---|---|
| WNC-R01: memory verification contradiction | Repaired within the inspected scope. Operative §5.3 now requires per-claim support, valid scoped evidence, and currentness. The old sufficient conditions are explicitly historical. Injection selection is an explicit legacy-revalidation trigger. |
| WNC-R02: unchecked tool arguments / contract drift | Partially repaired, still open. Read identities, empty argument bags, negative offsets, and the two named argument drifts are improved. Mutation-tool signatures and preconditions still disagree with the live owner; create-body byte enforcement has a gap. |
| WNC-R03: inconsistent successful transitions | Repaired for the reported cases. The schema now requires the receipt, checkpoint, and new window and restricts the successful effective controller. Corresponding explicit invariants exist. Faulty new unit tests are a separate validation defect, not evidence that these schema fixes failed. |
| WNC-R04: coverage loss can pass | Partially repaired, still open. Empty negatives, missing keys, minimum families, and anchor losses are now checked. Scenario contents/references and negative-case semantic identity are not adequately checked. |
| WNC-R05: unsupported `validate` command | Interface repaired. The parser now accepts the documented positional command and supports the four documented forms. Published tests cover invocation forms; full command execution was not independently rerun here. |
| WNC-R06: missing tracked regression file | Publication repaired. The 21-test source is fetchable and `.gitignore` has the narrow exception. Seven added methods are vacuous, as detailed below; file existence is not sufficient test-quality closure. |
| WNC-R07: unpublished evidence | Publication repaired substantially. The reports, coverage, manifests, closures, and logs are fetchable. Some advertised final coverage stamps still disagree with the updated manifest and need explicit current/historical reconciliation. |

## FU-01 — Mutation-tool schemas still conflict with live Tools contracts

**Priority: High. Original finding: WNC-R02.**

Evidence: `Plans/Tools.md`, Working Notebook And Exact History Read Tool Addendum, T-183/T-184; `Plans/working_notebook_contracts.schema.json`, `$defs/tool_request`; positive `tool_requests` in `Plans/working_notebook_contract_fixtures.json`.

The schema is no longer a completely unchecked argument bag, which is an improvement. However, closing the argument objects around the wrong shapes creates new incompatibilities.

### `notebook_write`

The registered signature includes:

```text
notebook_id?, scope (create), entry_id?, expected_revision?, request_id,
body, epistemic_kind, provenance_refs?, validity_refs?
```

The repaired schema rejects `epistemic_kind`, `provenance_refs`, and `validity_refs` as additional properties. It requires `notebook_id` and `operation`, while the signature marks the former optional and does not list the latter. It accepts an `actor` argument absent from the registered signature. The positive create/update fixtures follow the new schema rather than resolving the owner contract and omit the required epistemic kind.

Adding each of the three documented metadata fields to a schema-conforming create control was rejected in the bounded probes. This is not merely an untested theoretical disagreement: the source shapes cannot both describe the same request without an explicit mapping/alias contract.

### `notebook_supersede`

The registered signature requires `expected_revision` and `operation: supersede | archive | tombstone`, with optional `supersedes_entry_revision`.

The repaired schema instead admits `target_state: superseded | archived | tombstoned`, adds required `request_id`, does not admit the documented `operation` or `supersedes_entry_revision`, and makes both `expected_revision` and `target_state` optional. `expected_revision` may also be null.

This request is accepted by the reproduced branch:

```json
{
  "tool": "notebook_supersede",
  "args": {
    "notebook_id": "nb_A",
    "entry_id": "wne_A",
    "request_id": "req_A"
  }
}
```

It supplies neither the intended lifecycle action nor the CAS revision. There is no supersede-specific compensating check in `check_explicit_invariants`.

**Repair:** Reconcile the operative owner signatures, schema, and fixtures together. Preserve the accepted epistemic/provenance/validity contract. Establish one public mutation representation and explicit create/update/append and lifecycle preconditions. Require the lifecycle action and a non-null CAS revision. Do not repair by reopening every argument bag or silently deleting supported metadata from the owner.

**Acceptance:** Legal documented calls validate; missing lifecycle actions/revisions fail; optional/required fields agree across owner, schema, and fixtures; tests distinguish all mutation operations.

## FU-02 — UTF-8 size enforcement skips create requests

**Priority: High. Original finding: WNC-R02.**

Evidence: `Plans/Tools.md` hard 64 KiB UTF-8 body limit; schema `body.maxLength = 65536`; `scripts/pm-working-notebook-contracts.py::check_explicit_invariants`, notebook-write branch.

The schema's length constraint accepts 32,769 copies of `é`: 32,769 characters but **65,538 UTF-8 bytes**, exceeding the 65,536-byte limit. The explicit byte check is under the `update`/`append` branch only. The `create` branch checks for an existing entry/revision and a nonempty body, but not byte length.

Bounded probe outcomes:

| Same body | Schema | Relevant invariant | Combined fragment result |
|---|---|---|---|
| Create | Accepts | No violation | Accepts |
| Update | Accepts | Rejects UTF-8 size | Rejects |

The entry-envelope byte check does not compensate for this request gap: an isolated tool request does not automatically produce a corresponding positive entry-envelope fixture.

**Repair:** Apply UTF-8 byte limits before branching by mutation operation. Cover create/update/append consistently. Test the exact boundary and one byte over with ASCII and multibyte strings; retain schema character checks as an additional structural constraint rather than a byte substitute.

## FU-03 — Seven added regressions reject at the wrong schema level

**Priority: High. Related to WNC-R02, R03, R04, R06.**

Evidence: `tests/test_pm_working_notebook_contracts.py`; root of `Plans/working_notebook_contracts.schema.json`; `validate_with_jsonschema` does not automatically select a subschema.

The following test methods pass individual request/transition objects directly to the complete fixture-root schema:

```text
test_chatread_with_empty_args_rejected
test_notebook_write_with_empty_args_rejected
test_read_with_negative_offset_rejected
test_unknown_argument_name_rejected
test_success_without_admission_property_rejected
test_success_with_null_new_window_rejected
test_success_with_unavailable_controller_rejected
```

The root requires `schema_id`, `schema_version`, and all eight fixture-family arrays, and rejects unknown root properties. A raw `{tool, args}` request or a raw transition therefore fails for unrelated envelope errors, without reaching `$defs/tool_request` or `$defs/context_transition_record`.

The tests assert only that some error exists. A valid raw request/transition is rejected by that same wrong root too, as the local controls demonstrate. Removing the relevant target constraints would not make these seven assertions detect the regression. The supplied live-checkout script contains a direct test-definition ablation for the next agent to run.

This does **not** prove that the reported 21-test run was fabricated, or that the other 14 methods are worthless. Twenty-one tests can genuinely pass while seven fail to establish the properties their names claim. Existing full-envelope negative fixtures also provide some real overlapping coverage; they do not make these new methods valid.

**Repair:** Validate each object against its actual `$defs` entry (retaining the shared `$defs` reference environment), or mutate the object inside a valid complete positive fixture document. Include an unmodified positive control. Assert the relevant error path/class, and add an ablation/mutation test proving removal of the target constraint makes the regression fail.

## FU-04 — Coverage integrity pins labels but not sufficient content

**Priority: High. Original finding: WNC-R04.**

Evidence: `check_fixture_inventory` and negative-result construction in `scripts/pm-working-notebook-contracts.py`; `acceptance_scenario_map` in `Plans/working_notebook_contract_fixtures.json`.

The new inventory checks correctly reject an empty negative set and a missing scenario key. They still admit materially empty or irrelevant replacements.

The scenario loop is:

```python
for scenario_id, entry in sorted(scenarios.items()):
    if isinstance(entry, dict) and entry.get("disposition") not in SCENARIO_DISPOSITIONS:
        problems.append(...)
```

A non-dictionary row skips even the disposition check. The checker does not require or resolve `refs`. Local probes of the copied checker accepted all of the following while preserving the 62 keys:

- Every scenario value replaced by `null`.
- Every static reference replaced by `does_not_exist[999]`.
- All static reference lists removed.

Only `fixtures['positive']`, not this scenario map, is passed to the root contract schema. Therefore another schema check in the displayed validator does not fill the map-validation gap.

Similarly, `EXPECTED_NEGATIVE_IDS` pins 27 names, but not the intended semantic cases. The inventory checker accepts all 27 names repointed to the same invalid-tool mutation. The main loop checks rejection and attribution using the supplied mutation path, not a separately established case contract; `rejects` is copied into output but is not enforced as the expected target. The live-checkout script exercises whole-validator case substitution and invalid `rejects` targets in memory.

There is also a concrete mapping inconsistency: WNC-A58, "Static fixtures and validator integrity," is marked `runtime_only_future` in the new map, while the published acceptance coverage records it as statically covered with `validator_results.json`. WNC-A56..A61 include current preflight, scope, audit, and governance obligations; they cannot all be dismissed as future product-runtime execution. Future behavioral proof may remain NOT_RUN, but current process evidence needs an accurate disposition and reference.

**Repair:** Validate the map's record type, identity/version, complete scenario set, disposition-specific required fields, and actual reference resolution. Owner-prose rows need concrete owner references; current audit/governance obligations need concrete process evidence or an appropriate distinct disposition. Couple each negative identity to its intended target/constraint or verify semantic case coverage independently. Add loss/substitution tests, not just count/key deletion tests. Preserve legitimate versioned changes without permitting duplicate irrelevant cases under distinct expected labels.

## FU-05 — Published final coverage stamps are not fully synchronized

**Priority: Medium. Original finding: WNC-R07 currentness portion.**

Publication itself is repaired. Do not reopen the earlier 404/missing-file finding as though the files are still absent.

However, two published artifacts disagree on the same validator's SHA256:

```text
implementation/implementation_manifest.json
  scripts/pm-working-notebook-contracts.py:
  3f87127d1aa79b7b4aafe36ee90325f8e7e58eec72fe60f933bdb268ead04b0a

implementation/acceptance_coverage.jsonl, WNC-A58
  scripts/pm-working-notebook-contracts.py:
  81a1cb3f2da8950b014e6c967acacd21b5beed4dfc57cddf1dc3f98f08b5f387
```

The manifest includes a post-audit repair-wave-2 record explicitly listing the validator as rehashed. The coverage rows were not equivalently synchronized. Other selected coverage hashes (e.g. the notebook owner) also disagree with the updated manifest. This observation is an artifact-to-artifact inconsistency, not an independent claim that every final manifest hash was recomputed locally.

Historical logs and snapshots should remain preserved. A precommit working-tree fingerprint is also legitimate; a manifest need not magically contain the hash of the commit that embeds itself. The defect is failure to clearly separate historical coverage from the advertised final/current coverage and link the final closure to a coherent subject.

**Repair:** After substantive fixes, publish one explicit current coverage/closure snapshot, restamp affected evidence hashes, retain the old records as labeled history, and link the re-audit to the exact final content. Correct the assertions that all findings are closed until the demonstrated counterexamples are resolved. Do not hand-edit generated governance outputs or repair unrelated PNC-019 work.

## Recommended bounded closure

Repair the mutation contract and byte check first, then replace the seven wrong-root regression methods and harden inventory/reference/case validation. Run the read-only live-checkout probes with a passing baseline, then the repository's scoped tests and exact documented commands in a disposable checkout. Record genuine exit codes and any unrelated baseline failures separately. Refresh the final evidence and authorized governance outputs only after source/schema/test content stabilizes.

The agent's published re-audit reports three pre-existing broad-gate failures (PNC-019 receipt, parallel-stream touch closure, and closure-registry pinning) and keeps runtime proof NOT_RUN. This review does not reclassify those as notebook defects and does not independently certify their current status.

**No WorkNodes, NodeSeeds, production handlers, new runtime receipts, concept redesign, or readiness unlock are required for these repairs.**

## Files in this recheck bundle

- `RECHECK_REPORT.md`: this review.
- `source_fragment_probes.py`: locally executed bounded reproductions.
- `source_fragment_results.json`: the 29 observed outcomes and their scope.
- `live_repo_recheck.py`: read-only full-checkout reproduction script; syntax-checked but not executed against a checkout here.
- `SOURCE_INDEX.json`: inspected repository paths, selected blob identities, and source surfaces.

Run the full-checkout script with output directed outside the repo:

```bash
python /path/to/live_repo_recheck.py --repo /path/to/Puppet-Master > /tmp/wnc-recheck.json
```

Exit 1 is expected at the reviewed commit if the documented remaining defects are reproduced; it must not be suppressed or reported as a successful validation result.
