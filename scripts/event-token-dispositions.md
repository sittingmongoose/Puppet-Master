`python3 scripts/pm-event-token-dispositions.py classify --edition <fresh-edition> --outdir <external-empty-directory>`

PNC-019 S6 token classifier. Add `--readiness <json-array>` for each batch
readout. Run the same command with `validate` to reconstruct and compare all
five output artifacts without writing. Use `--root` for an explicit checkout.

The edition is produced with `pm-event-authority-currentness.py generate
--outdir <external-empty-directory>`. Copy the ignored installed currentness
edition into the worktree first, and materialize the historical census source
inventory. Its immutable expected-token and source-group inputs stay in that
worktree; the external fresh edition contains its generated outputs only.

The classifier rehashes the edition receipt, its producer, every inventoried
source and the source set. It reconstructs the entire token ledger from those
source bytes. Authority rows are read from a single pinned Git HEAD; dirty or
untracked corpus/authority sources are refused. Top-level census/individual
ledgers and explicit `*-NEW-NAMES-LEDGER.jsonl` supplements count. Nested source
shards, old overlays and backup ledgers supply no new authority.

Every token gets one ordered rule, one disposition, its exact granting source
row (file SHA-256, Git commit, JSON pointer or JSONL line, canonical row SHA-256)
and a re-extracted current occurrence with source SHA-256 and line window.
`RULES.md` describes every class. `SUMMARY.json` counts classes and resolution
states. `RESIDUE.jsonl` and `RESIDUE.md` list every token requiring judgement,
including ledger conflicts. `TOKEN_DISPOSITIONS.jsonl` contains the full map.

Live registry membership takes precedence over historical quarantine notes;
its observation certifies no depth. Conflicting live ledgers stay in residue.
Holding rows remain outside D under their recorded decision. Preparation and
recount names without outcomes stay pending. External readiness readouts are
preparation lineage only; their supplied landed-report pins are checked and
reported, and a stale pin never authorizes registration or exclusion. Recount
exclusions require the actual OUTCOMES row format, a matching landed DL section
hash naming the token, and matching Plans source hashes and exact line spans.

Lexical identifier/path classes and non-event-like negative/schema/lineage
contexts are mechanical queue dispositions. A context reference grants no
semantic event exclusion or alias equivalence. Role-qualified forms and
uncovered event-like or ambiguous names stay in residue. Direct emit/event_type
bindings override field-prefix hints (including `config.validation.passed`).

All runs are sizing runs: closure, denominator completeness, contract depth and
build/PNC authority remain false. The final S6 ledger needs a fresh run after
admissions, resolution of pending rows, and blind owner review of the residue.
This tool writes no registry, Plans owner document, governance or seal bytes.

Verification: `python3 scripts/pm-event-token-dispositions-check.py --edition
<fresh-edition> --readiness <batch2> --readiness <batch3> --scratch
<external-empty-directory> --report <external-report-directory>`. The two real
custody predicate tables contain five and one rows. Method B credit is confined
to those equality boundaries. Real-edition CLI mutations and classification
checks are reported separately; only the exact expected refusal is a kill.
No EventRecord payload/schema, numeric or timestamp field, retained reader or
Store join is implemented here; the existing owner schema keywords and shared
number/date-time helpers are unchanged.
