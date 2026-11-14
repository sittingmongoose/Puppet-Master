# Shard 069: Browser Program prepared event oracles — 2026-11-14

Source: `Plans/Automated_Testing_System.md`

Source lines: L14151-L14209

Source SHA256: `58e00bd0e83f4f55778a057ad2da2b6a3374506e1170ba5345bb3f3dd5780216`

---

## Browser Program prepared event oracles — 2026-11-14

### ATS-2500 - Browser Program prepared families criterion-12 oracles (s4b)

**Newly authored oracle contract under DL-046** for the 51 Browser families of CV-2500..CV-2550 and SP-2500..SP-2550 (PNC-019 lane s4b). The executable static oracle is `scripts/pm_s4b_browser_events.py`; it covers every family separately, with its own positives and single-defect negatives, and none is admitted. Native execution is NOT_RUN; these oracles prove planning contracts, not a runtime.

**How the checker is built.** Each guard is one predicate over one subject, declared once in the checker and generated into `scripts/pm_s4b_table_<table>.py` by `scripts/pm-s4b-table-generate.py`; the checker refuses only through those table predicates, and each table holds at most eight rows. A row's inputs are the presented value and the independent authority it must equal (the committed owner transition the producer resolved, Storage's own record, the store's dedupe, log, checkpoint and sealed receipts, or a recomputed identity), or a shared helper's own result where the rule is that helper: the full owner schemas with the CV-1101 format checker, `pm_event_datetime.date_time`, `storage_uint64`, `current_integer`, `storage_value_bytes`, `qualified_jcs`, `producer_semantic_digest`, `full_value_commitment` and `RetainedDispatcher`. A row's precondition is derived from the case, never from another row's result.

**Boundaries.** Append (admission, writer cutoff before dedupe, dedupe catch-up, the committed owner transition, numbers, the EventRecord envelope and Storage's record, the 2.0.0 inline body, the payload schema, every envelope and payload copy of the transition, identity, each family predicate of its Section 15 section, custody v2 and the success disclosure); retry (same-key original, semantic-digest conflict, original receipt, no new sequence); derived (the SP-278 filtered checkpoint over a complete prefix, its durable token, cursor, count and compare-and-swap advance); read (state, token currency, coverage, access, tombstones and original custody); withdrawal (writer cutoff, consumer withdrawal in one compare-and-swap, no event); rebuild (recomputed from retained originals, retired cores kept); cleanup (RP-PROJECTION-3GEN window and holds); and retained (SP-1101 sealed-receipt dispatch, the frozen verifier's components, a store snapshot proving no receipt is created, and an instrumented current writer gate proving it is never called).

**Cases.** Positives per family: a fresh append, a lost-ack retry with different Storage metadata, a linked-lineage append whose every copied field holds a distinct non-null value, a compare-and-swap advance over a mixed prefix whose last frame is another family's, an empty verified prefix, a read, a withdrawal, a rebuild after withdrawal, a lawful cleanup, a retained read after the live owner state changed, and a retained `projector_replay_only` original that the current writer refuses. Negatives: for every row that applies to a family, single-defect witnesses built from a valid case by changing one input and re-deriving every dependent copy, digest and receipt; schema negatives for every keyword class of the family's closed payload, the envelope, the custody receipt and the checkpoint; number negatives at every integer slot (wrong types, out of range, 4,400-digit integers); timestamp negatives per field and profile; and trailing-LF negatives on identifiers.

**Proof.** `scripts/pm-s4b-guard-proof.py` runs the gated guard tool `scripts/pm_guard_isolation.py` (`004bdedd63`) once per table, crediting exactly what it reports; a row without a reachable single-defect witness sits alone in its own table with a written proof. `scripts/pm-s4b-mutations.py` weakens table predicates and derivation code in a scratch copy; a mutation counts as killed only when one of its row's own witnesses is accepted, or a stated control is refused at exactly the stated row. The shared number corpus runs through the complete append route.

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
