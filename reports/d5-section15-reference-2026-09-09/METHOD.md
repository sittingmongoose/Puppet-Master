# D5 frozen Section 15 reference audit method

This is evaluator-only reference construction, withheld from researchers. It compares the exact June 11 and July 4 snapshots in `source-freeze.json`. It does not amend current Plans, record current product approval, reopen answered Puppet Master decisions, or start another research campaign. D4 was completed, committed, verified and reported before these sources were captured.

## Comparison boundary

The baseline is the **entire frozen June 11 document**, including its body, source-preserving PlanUnit and migration notes. A July unit is not new merely because it has a new ID, heading, YAML block or sentence location. The heading and `plan_unit_id` occurrence identify one unit, not two. Mechanical census records both occurrence counts and distinct IDs; the expected distinct-unit comparison is one to 137, rather than the originally stated two to 274.

The preserved July body at lines 1–807 must be compared independently, including the changed Orchestrator paragraph at line 156. Requirements repeated in that paragraph and a later PlanUnit are deduplicated by obligation, not counted twice. Source hashes and exact line ranges, rather than current files or external owner-document contents, establish the evidence boundary. ContractRefs prove that the frozen source names another owner; they do not prove the unseen contents or current approval state of that owner.

## Unit and field coverage

Every distinct July unit receives a coverage disposition, including the retired source-preserving unit. Review every YAML field, especially `canonical_text`, `acceptance_criteria`, `negative_constraints`, `compatibility_only_notes`, `stale_retired_dispositions`, `preserved_exact_tokens`, and any additional normative field. Also inventory status, owner/dependency routing, source lineage, risk/context labels, GUI classification, validation commands, implementation surfaces and compile hints. A field name does not make its contents harmless: normative text embedded in a token or compatibility field is checked as text.

Record these separately from product additions:

- Restatement or compression of an existing requirement, with exact baseline evidence and retained conditions/exceptions.
- Source-preservation, indexing, migration, addressability and repeated governance packaging.
- Repeated acceptance packaging that checks preservation or indexing rather than changing product behavior.
- New explicit acceptance obligations, if any: assess their actual new test/behavior scope and classify independently rather than assuming all acceptance text is neutral or all tests are new product features.
- Genuine semantic changes, including narrowed support, broader mandatory scope, removed exceptions, new defaults, ownership/architecture choices and stronger failure behavior.

A summary's omitted detail does not automatically repeal a preserved source condition. Conversely, explicit exclusivity such as `only`, a changed default, or a contradictory requirement cannot be declared neutral solely because the old body remains present. Record ambiguity for adjudication when the two readings lead to different behavior.

## Classification rules

Split mixed additions into independently classifiable clauses. Each proposed addition receives one of:

- **necessary_correction:** supported by a specific preexisting promise, contradiction, or logical correctness need. Explain the trigger, required behavior and exact baseline evidence. General usefulness, severity labels, defensive hardening and observed vendor bugs do not establish necessity on their own.
- **optional_capability:** separable added behavior that the baseline does not promise and that can be omitted without violating that promise.
- **product_decision:** a choice of policy, default, support breadth, architecture, lifecycle or tradeoff for which the baseline does not determine the answer.

Uncertainty is explicit and is not inferred approval. A candidate in an `uncertain` unit remains provisional until root/cross-review adjudication. Existing baseline decisions are retained as decisions already present, not new questions for the user. Vendor or external-system references in frozen text remain contextual evidence; this audit neither acquires new evidence nor promotes a reported symptom into a proven defect.

## Record format and identifiers

Per-unit JSONL records use the assigned schema:

```json
{
  "unit_id": "SMPFS-012",
  "target_lines": [1392, 1448],
  "disposition": "contains_added_obligations",
  "baseline_evidence": [{"lines": [151, 159], "reason": "Describe the relevant existing contract and its conditions."}],
  "fields_reviewed": ["canonical_text", "acceptance_criteria", "negative_constraints"],
  "new_obligations": [{
    "local_id": "SMPFS-012-A01",
    "field_path": "canonical_text",
    "target_lines": [1399, 1399],
    "text": "Normalized independently classifiable target obligation",
    "source_quote": "Verbatim substring from the cited target lines",
    "classification": "product_decision",
    "baseline_evidence": [{"lines": [156, 156], "reason": "Explain the material difference rather than merely citing a nearby heading."}],
    "reason": "Explain why the classification follows from the frozen comparison.",
    "confidence": 0.95,
    "duplicate_hints": ["july04:156:seven_tab_orchestrator_shell"]
  }],
  "notes": ["Separate retained constraints and packaging from the added clause."]
}
```

The example is a schema illustration; final classifications and clause evidence are in reviewer records. `text` may normalize a mixed sentence into one obligation; `source_quote` preserves a verbatim substring (or complete lines) inside the cited source span so this normalization can be checked without inventing a quotation. `target_lines` and baseline `lines` are inclusive one-based `[first,last]` pairs in the corresponding immutable snapshot. `field_path` identifies the YAML field or list element, and `fields_reviewed` inventories all actual fields, not just the illustrated subset. `local_id` is stable within the source unit (`SMPFS-NNN-A01`, etc.); body-only additions can use `BODY-L0156-A01`. Confidence is an evaluator judgment from zero to one, not a measured probability.

Allowed unit dispositions are `restatement_or_format`, `contains_added_obligations`, and `uncertain`. A mixed unit retains its baseline restatement evidence alongside any added clauses. Duplicate hints preserve independent source occurrences; final aggregation assigns one obligation identity to semantically equivalent occurrences and keeps all citations. The seven-tab Orchestrator commitment in body line 156 and SMPFS-012 uses the shared hint `july04:156:seven_tab_orchestrator_shell`.

## Assembly and validation

The external `landing-draft` will contain exact frozen source copies, source identities, this method, complete classifications and non-addition census, a readable report, accounting/limits and validation receipts. Validation checks frozen bytes, exact source/target ranges, complete unique-unit coverage, JSON/JSONL structure, clause identity/deduplication, readable report/count agreement and usable local references. Mechanical extraction is evidence for review, not a semantic verdict. Independent cross-review and root release precede repository copy, staging or commit.

No new researcher/native campaign, live runtime or web acquisition is performed. Root and support work are unmetered here; actual cost is unknown. No zero-cost estimate or invented token total substitutes for absent accounting. No Plans, generated artifacts, indexes, ledgers, source snapshots or other agents' review files are edited by this audit. Repository staging/commit preparation remains separate from authorization to execute it; ordinary hooks and unrelated index/worktree state must be preserved.
