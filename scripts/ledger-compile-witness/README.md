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

Coverage is the set of atom-to-existing-owner mappings, not the list of declared
targets. When no atom reaches an existing owner unit, the status is `vacuous`
(or `vacuous_with_findings` when other findings exist), and it exits 2. That holds
for a queue with no `target_plan_unit_ids`, for targets with no source atoms, and
for targets whose atoms are all mapped to `[]`. `vacuity_reason` says which:
`no_owner_targets` or `no_atom_reaches_an_owner`. Registry hygiene still runs on
any existing target, so a registry-only scope keeps its findings, but its clean
result is not `pass`. The report lists `atom_owner_mappings`.

```sh
python3 tools/pm-ledger-compile-witness.py ledgers/change-001 --root . --allow-empty --json
```

Only an otherwise clean empty scope is permitted by this flag. Its status is
`vacuous_allowed_by_--allow-empty`, never `pass`; `vacuous` remains true. The flag
cannot waive token, repair, registry or configuration findings, and it never waives
a missing `state/compile_queue.json` or `records/design_atoms.jsonl`: those exit 1.
A present, empty atoms file is not missing. Counters report atoms reaching an owner,
declared target units, registries actually checked, item tokens and exemptions.
`DL-*` decision units retain the existing format's exclusion from owner-token
and owner-registry evidence; a decision-only scope is therefore vacuous.

## One definition per targeted owner

A targeted unit with more than one independent definition is an
`ambiguous_owner_unit` finding that lists every definition's path, form and lines,
in one document or across documents. The first fence declaring a heading's own ID
inside that heading's section, deeper subheadings included, is its metadata and not
a second definition. A second such fence, a repeated heading, a repeated headless
fence, a declaring fence outside the section and a fence declaring several IDs are
all independent definitions. Duplicates of an untargeted ID are not findings.

`DL-*` units are the one same-document exception, because they supply no owner
evidence and the Decision Log may carry a log entry and a PlanUnit under one number.
Across documents they are still findings. The exception is disclosed, never silent:
`repeated_decision_units` lists every same-document repeat of a targeted or
repaired `DL-*` unit with each definition's lines and title, and `titles_differ`
is true when the titles still differ after case, punctuation and a trailing
reference list such as `(J-1, J-2)` are removed. A person decides whether two
titles name one decision; the witness only shows them.

Definitions are recognised in two forms: a level 2–4 heading `ID <separator> title`
(separator `-`, `–`, `—` or `:` followed by a space) and a fenced
`plan_unit_id: ID` line, bare or with matching single or double quotes, in a
```` ``` ```` or `~~~` fence. A heading's own metadata fence counts as part of that
unit's text wherever it sits in the section, so its registry is checked too, and
every `preserved_exact_tokens` registry in a unit is read, not only the first.
Any other form that names a targeted or repaired owner ID is refused as
`unsupported_owner_definition_form` before a pass: a heading without a separator,
a level 1, 5 or 6 heading, a setext heading (a paragraph over an `===` or `---`
underline) that names the ID, or a `plan_unit_id` line the grammar cannot read or that
sits outside a fence. Longer identifiers that start with the ID (`AA-001.2`) and
`DL-*` IDs are not refused.

Headings and fences follow CommonMark where it matters to a definition (tool batch 2,
C8-W1 and C8-W2):
- An ATX heading may be indented up to three spaces, and its ID may be wrapped in
  `**ID**`, `__ID__` or `[ID]`: `   ## **AA-001** — Title` is the same heading as
  `## AA-001 — Title`, so a second one is a duplicate. Indented and wrapped forms are
  read only outside fences (a fenced line is code); four spaces of indentation is code,
  not a heading. A paragraph that is a list item or block quote over `---` is a
  thematic break, not a setext heading.
- A fence opens on three or more backticks or tildes indented at most three spaces (a
  backtick opener's info string holds no backtick). It closes only on the same
  character, at least as long as the opener, indented at most three spaces, with
  nothing after it but spaces: a `` ```yaml `` line or a shorter run inside a longer
  fence does not close it, and an unclosed fence runs to the end of the document. A
  fence indented four spaces or more is indented code, so a `plan_unit_id` line in it
  is outside any fence and refused. A heading line inside a fence is code, never a
  heading definition (a fenced `plan_unit_id` line still is a declaration).
- A `plan_unit_id: AA-001  # comment` line inside a fence does not match the grammar
  (bare or quoted ID, nothing after it) and is refused as `unparsed_plan_unit_id_line`
  (C8-W3). Put a comment on its own line.

## Targets and exact-token scope

The required files are `state/compile_queue.json` and
`records/design_atoms.jsonl`. Optional `records/corrections.jsonl` connects
findings IDs to atoms; optional `source_shards/findings.md` supplies the existing
`## Record ...` / `Repairs AA-001.` text format. Owner documents are listed in
`canonical_plan_targets`, `compiled_owner_docs`, or queue-item `target_docs` /
`target_doc`. They contain `## AA-001 — Title` blocks or fenced blocks declaring
`plan_unit_id: AA-001`. Numeric prefixes such as `0PI-001` are supported.

Owner headings, fenced declarations and `Repairs` sentences share one identifier
grammar: a letter-or-digit prefix, a hyphen and any number of digits. Ledger
candidate IDs such as `RT-01` have the same shape. An ID named in a `Repairs`
sentence that resolves to no unit (no declared target, no definition now or at
the base) is set aside only when it is one of the ledger's own candidate IDs: a
record heading's candidate ID or a correction's `finding_id`. Those are listed
under `unresolved_candidate_ids` (also kept as `unresolved_short_ids`, its former
name). Any other unresolved ID, whatever its digit count, stays named, is listed
under `named_but_unresolved` and fires as `named_but_not_targeted`.

A repair compares **every** definition of the named unit with the base, in order.
It is reported unchanged, and fires, only when no definition changed;
`changed_occurrences` names the definitions that did change when a unit has more
than one.

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
no token witness. A pass needs at least one atom compiled to an owner, and it
covers the mapped owners, not the entire ledger. A compiled atom with an empty
token list counts as compiled and has no token to witness.

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

The accepted record must also carry the decision as structured data, in a
`token_dispositions` list. A label or sentence elsewhere in the record does not
count:

```json
{"correction_id":"corr-1","status":"accepted","linked_atom_ids":["atom-1"],"exact_tokens":["old spelling"],"correction":"Replaces the source spelling.","token_dispositions":[{"schema_id":"pm.ledger_token_disposition.v1","queue_id":"q-1","atom_id":"atom-1","token":"old spelling","target_plan_unit_ids":["AA-001"],"disposition":"ledger_retired"}]}
```

Each entry's `disposition` is `active`, `held` or `ledger_retired`. An exemption is
refused unless the cited record has exactly one entry for its queue item, atom,
token and exact target set, and that entry's value equals the exemption's:

| Case | Result |
|---|---|
| No entry for that exact queue item, atom, token and target set | Refused, exit 1 |
| The entry says `active` | Refused, exit 1 |
| The entry's value differs from the exemption | Refused, exit 1 |
| An accepted entry in any `records/**/*.jsonl` gives the same atom and token a different value on an overlapping target | Refused, exit 1 |
| A malformed entry on any accepted record, or one with an unknown value | Refused, exit 1 |

Only records with `status` `accepted` count. To withdraw a disposition, change
its record's status; a later record does not silently override an earlier one.
An active disposition for another owner of the same token is not a conflict:
that owner keeps its own requirement. Records are read only when an exemption
exists, and a disposition without an exemption waives nothing.

Exemptions bind the queue item, atom, token and existing mapped owner units.
Duplicate/overlapping, stale or malformed scopes fail as input errors. An
exemption for one owner cannot waive another owner's obligation, other tokens
or another atom. Fully exempt item-token rows remain visible in the report.
Exemptions never waive registry hygiene or the changed-repair witness: a retired
token left in a registry without body text still fails.

The checker verifies this structure, the cited record's existence and that the
recorded value agrees; it does not verify a reviewer's identity or the meaning or
authority of the recorded decision. A person must review the record, reason and
scope before accepting an exemption: anyone who can write the ledger can write an
accepted disposition. A held-token exemption does not accept the held product
requirement, and `--allow-empty` establishes no compilation fidelity evidence.
