# Shard 072: Browser Program prepared event oracles — 2026-11-14

Source: `Plans/Automated_Testing_System.md`

Source lines: L15712-L15770

Source SHA256: `7f3de4358330a5eaefa6b785390776844406d8d68d8b8628f5b939253ea031d9`

---

## Browser Program prepared event oracles — 2026-11-14

### ATS-2500 - Browser Program prepared families criterion-12 oracles (s4b)

**Newly authored oracle contract under DL-046** for the 51 Browser families of CV-2500..CV-2550 and SP-2500..SP-2550 (PNC-019 lane s4b). The executable static oracle is `scripts/pm_s4b_browser_events.py`; it covers every family separately, with its own positives and single-defect negatives, and none is admitted. Native execution is NOT_RUN; these oracles prove planning contracts, not a runtime.

**How the checker is built.** Each guard is one predicate over one subject, declared once in the checker and generated into `scripts/pm_s4b_table_<table>.py` by `scripts/pm-s4b-table-generate.py`; the checker refuses only through those table predicates, and each table holds at most eight rows. A row's inputs are the presented value and the independent authority it must equal (the committed owner transition the producer resolved, Storage's own record, the store's registry, dedupe, log, SP-278 selection, checkpoints and sealed receipts, or a recomputed identity), or a shared helper's own result where the rule is that helper: the full owner schemas with the CV-1101 format checker (one row per subject, every keyword kept), `pm_event_datetime.date_time`, `storage_uint64`, `current_integer`, `storage_value_bytes`, `qualified_jcs`, `producer_semantic_digest`, `full_value_commitment` and `RetainedDispatcher`. A row's precondition is derived from the case, never from another row's result. Cases are built authority first and every dependent copy, digest and receipt is re-derived after a witness's one change. Dedupe, retry, compare-and-swap advance, withdrawal, rebuild, cleanup and the retained read are computed by the checker's store model, not asserted by fixture flags.

**Boundaries.** Append (admission, writer cutoff before dedupe, dedupe catch-up, the committed owner transition and its producer, numbers, the EventRecord envelope, Storage's own record and partition, the 2.0.0 inline body, the payload schema, identity and the producer-semantic route, every envelope and payload copy of the transition, each family predicate of its Section 15 section, custody v2 and the success disclosure); retry (writer cutoff before dedupe, replay-only refusal, the scoped original, semantic-digest conflict, the original receipt, event and sequence, no second append); derived (the SP-278 filtered checkpoint over a complete prefix: slots, size, schema, key, scope, durable token, inclusive cursor, through-sequence, count, compare-and-swap, a withdrawn predecessor, publication, holds and retired history); read (state, token currency, coverage, access, tombstones and the original's custody after restore); withdrawal (writer cutoff first, Storage's time and receipt, compare-and-swap, unchanged core, no event); rebuild (at most two retired generations, the withdrawn core retired with its original time, recomputed count, cursor and token, a new publication); cleanup (a retired target, holds, the 604800-second window on shared instants, every other generation kept, compare-and-swap); and retained (SP-1101 sealed-receipt dispatch, the frozen verifier's sixteen components, a store snapshot proving no receipt is created, and an instrumented current writer gate proving it is never called).

**Cases.** Positives per family: a fresh append, a linked-lineage append whose every copied field holds a distinct non-null value, a body near the inline limit, an uncertain append that reports no success, a lost-ack retry with different Storage metadata, a compare-and-swap advance over a mixed prefix whose last frame is another family's, a verified empty prefix, advances that carry holds and retired history, a read, a withdrawal, rebuilds, a cleanup (also at an offset time), a retained read after the live owner state changed, a retained `projector_replay_only` original that the current writer refuses, and a linked retained read. Negatives: every row that applies to a family has single-defect witnesses in that family, built from a valid case by changing one input; schema witnesses at every leaf of the family's payload and checkpoint; number witnesses at Storage's sequence, the producer sequence, every first-receipt and checkpoint slot and the payload's integer slots (wrong types, out of range, 4,400-digit integers, values outside the RFC 8785 route); timestamp witnesses per field and profile; and trailing-LF witnesses on identifiers. A row that can never refuse alone in a family is listed with its checked reason (a schema non-null rule, or an implication between two of the family's own predicates); two rows that never refuse first anywhere sit alone in their own tables with written proofs. Each family predicate is cross-checked against the shared Browser owner validator on every case, and the identity, partition, scan and binding-hash recipes are pinned by known-answer checks.

**Proof.** `scripts/pm-s4b-guard-proof.py` runs the gated guard tool `scripts/pm_guard_isolation.py` (`004bdedd63`) once per table, crediting exactly what it reports. `scripts/pm-s4b-mutations.py` weakens table inputs and derivation code in a scratch copy; a mutation counts as killed only when one of its row's own witnesses is accepted, a stated witness is refused at exactly a stated other row, a stated control is refused at exactly the stated row, or a stated cross-check fails. The shared number corpus runs through the complete append route at Storage's sequence and the producer sequence.

```yaml
plan_unit_id: ATS-2500
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: NEWLY AUTHORED criterion-12 oracles for the 51 prepared Browser Program families of CV-2500..CV-2550
  and SP-2500..SP-2550, executed by scripts/pm_s4b_browser_events.py through generated guard tables proved by the
  gated guard tool, with mutation proof and the shared number and date-time calls. Native execution NOT_RUN.
gui_related: false
gui_classification_reason: Static oracle contract; no presentation behavior.
depends_on:
- SP-278
- SP-286
- SP-1101
- CV-1100
- CV-1101
unblocks: []
acceptance_criteria:
- Every applicable row of every family has a single-defect witness refused at exactly that row, or a written proof alone in its own table.
- Mutations of predicates and derivation code are killed only by their own witnesses.
validation_surfaces:
- scripts/pm_s4b_browser_events.py
- scripts/pm-s4b-guard-proof.py
- scripts/pm-s4b-mutations.py
risk_class: browser_event_oracle_masking_or_overclaim
reasoning_tier: high
context_scope: event_authority_s4b_browser_program
implementation_surfaces:
- Plans/Automated_Testing_System.md
- scripts/pm_s4b_browser_events.py
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-046
- reports/event-authority-20261114/S4B.md
preserved_exact_tokens:
- NOT_RUN
- projector_replay_only
negative_constraints:
- No admission, native execution or runtime readiness claim.
- No lane-local number, date-time or proof machinery.
```
