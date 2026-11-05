# Ledger compile witness

Static text checks for a v2 planning ledger: claimed repairs must target changed
units, compiled atom tokens must occur in the same owner unit's body and token
registry, and registry entries must occur outside the registry itself. This is
text evidence, not a semantic or product-policy review.

## Standalone installation and commands

Copy `pm-ledger-compile-witness.py` and `pm_ledger_compile_witness_traps.py` from
`scripts/` into any project's `tools/` directory, together with this README.
The tool uses **Python 3.10–3.14 and the standard library only**. Linux, macOS
and Windows are the supported platform contract; this change is exercised on
Python 3.14.4/Linux. Run the self-test on each target interpreter/platform before
adoption. Git 2.28+ is required for `--base` and the self-test's repair fixtures;
ordinary text checks without `--base` do not require a Git repository.

```sh
python3 tools/pm-ledger-compile-witness.py ledgers/change-001 --root . --json
python3 tools/pm-ledger-compile-witness.py ledgers/change-001 --root . --base origin/main --json
python3 tools/pm-ledger-compile-witness.py --self-test --json
python3 tools/pm-ledger-compile-witness.py --self-test --scratch ./scratch --json
```

`--root` defaults to the current directory. Relative ledger and owner-document
paths resolve against it. `--json` prints the full report to stdout; redirect
stdout to retain a file. Without it the CLI prints a summary. The self-test
uses the OS temporary directory by default, respects `TMPDIR`, and removes its
synthetic projects and local Git repositories after each case. No mount,
repository checkout, network service or program-specific path is required.

Exit codes are **0** for `pass` or the explicit empty override, **2** for
findings or vacuity, and **1** for malformed/missing input or an invalid base.
Argument-parser errors also use 2. JSON reports use
`pm.ledger_compile_witness.v2` and preserve the three witness arrays.

## Empty coverage is explicit

A queue with no `target_plan_unit_ids` cannot pass. Its status is `vacuous`
(or `vacuous_with_findings` when other findings exist), and it exits 2. A target
list that reaches no existing owner registry is likewise vacuous. Missing or
ambiguous targeted units are findings; the checker cannot silently skip them.

```sh
python3 tools/pm-ledger-compile-witness.py ledgers/change-001 --root . --allow-empty --json
```

Only an otherwise clean empty scope is permitted by this flag. Its status is
`vacuous_allowed_by_--allow-empty`, never `pass`; `vacuous` remains true. The flag
cannot waive token, repair, registry or configuration findings. Counters report
declared target units, registries actually checked, item tokens and exemptions.
`DL-*` decision units retain the existing format's exclusion from owner-token
and owner-registry evidence; a decision-only scope is therefore vacuous.

## Targets and exact-token scope

The required files are `state/compile_queue.json` and
`records/design_atoms.jsonl`. Optional `records/corrections.jsonl` connects
findings IDs to atoms; optional `source_shards/findings.md` supplies the existing
`## Record ...` / `Repairs AA-001.` text format. Owner documents are listed in
`canonical_plan_targets`, `compiled_owner_docs`, or queue-item `target_docs` /
`target_doc`. They contain `## AA-001 — Title` blocks or fenced blocks declaring
`plan_unit_id: AA-001`. Numeric prefixes such as `0PI-001` are supported.

```json
{
  "queue_id": "q-1",
  "source_atom_ids": ["atom-1"],
  "target_plan_unit_ids": ["AA-001", "BB-001"],
  "atom_target_plan_unit_ids": {"atom-1": ["AA-001"]},
  "target_docs": ["owners.md"]
}
```

The optional per-atom mapping must name every source atom and use subsets of
the item targets. Without it, every source atom maps to all item targets, as
before. An explicit empty per-atom target list means that atom is not compiled
in this scope and is listed under `atoms_without_owner_targets`; it receives
no token witness. A pass covers the targeted owners, not the entire ledger.

Each design atom has `atom_id` and an `exact_tokens` string list. Each required
token must occur in one mapped owner's body and **that same owner's**
`preserved_exact_tokens` registry. Inline flow lists and indented dash lists
use the existing registry parser. The entire registry is excluded from body
evidence, including block-list entries. Companion JSON alone is insufficient.

## Reviewed held and retired tokens

Add explicit records to `records/compile_witness_exemptions.jsonl`; no original
atom needs rewriting. Each line is one object, for example:

```json
{"schema_id":"pm.ledger_compile_witness_exemption.v1","exemption_id":"ex-1","queue_id":"q-1","atom_id":"atom-1","token":"old spelling","target_plan_unit_ids":["AA-001"],"disposition":"ledger_retired","reason":"Accepted correction replaces this source spelling; the active spelling remains required.","reviewed_by":"named reviewer","review_ref":"records/corrections.jsonl#corr-1"}
```

`disposition` is exactly `held` or `ledger_retired`. Reason, reviewer and review
reference are required. The reference must resolve to exactly one **accepted**
ledger record with a `correction_id`, `decision_id`, `question_id` or `review_id`.
That record must link the exact atom through `linked_atom_ids`,
`source_atom_ids` or `atom_id`, and list the exact token in `exact_tokens`.
The record path must remain inside the ledger's `records/`; it cannot cite
the exemption file itself.

Exemptions bind the queue item, atom, token and existing mapped owner units.
Duplicate/overlapping, stale or malformed scopes fail as input errors. An
exemption for one owner cannot waive another owner's obligation, other tokens
or another atom. Fully exempt item-token rows remain visible in the report.
Exemptions never waive registry hygiene or the changed-repair witness: a retired
token left in a registry without body text still fails.

The checker verifies this structure and the cited record's existence, not a
reviewer's identity or the meaning/authority of the disposition. Review the
record, reason and scope before accepting an exemption. A held-token exemption
does not accept the held product requirement, and `--allow-empty` establishes
no compilation fidelity evidence.
