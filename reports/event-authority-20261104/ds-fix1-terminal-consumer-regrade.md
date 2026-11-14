# Lane DS-FIX1: terminal.workgroup_moved consumer cell back to OWNER_REQUIRED (review DS-SOL-03)

**Record:** `ds-fix1-terminal-consumer-regrade.json`, applied 2026-11-04T20:35:50Z on `2220b74e24`. It has the before and after hashes, the cell statuses, and every citation with its exact quote, line and excerpt hash.
**Finding:** DS-SOL-03 (blocking): terminal's consumer PASS exceeds the unchanged rubric.
**Pattern:** a receipted row update, as `ds-p2-august-regrade-application.json`: the row file and its two ledger lines are rewritten byte-for-byte except the changed fields; line endings are preserved; every citation is an exact single-line quote located by script.

**Why.** The step-8 rubric grades a historical-only `consumers_checkpoints` on the exact historical reader and checkpoint (with SP-278 adoption) **and a named operating consumer**, PARTIAL where the owner says that facet is open (rubric line 24). The reader `storage.terminal_workgroup_move.inspect_current.v1@1.0.0`, no projector and the `none_required` checkpoint are cited, but SP-319's canonical text says no consumer operates, and SMPFS-170 (no new reader disclosure) and SP-319's DL-181 amendment (the reader stays for recorded 1.0.0 events) disagree on the reader itself. That is the terminal question stopped for Jared. The absence and withdrawal citations are kept; no consumer is invented or reactivated. `provisional` stays false: DL-039's condition (the consumer, projector and checkpoint cited from the Plans) still holds; the open part is an owner question, which the cell now records.

| Row | Cells not PASS before | Cells not PASS after | Row file SHA-256 before → after |
|---|---|---|---|
| `terminal.workgroup_moved` | positive_negative_oracles | consumers_checkpoints (OWNER_REQUIRED), positive_negative_oracles (FAIL) | `beb9214f5bb51d99…` → `08063c252d46f9d4…` |

| File | SHA-256 before | SHA-256 after | Lines changed |
|---|---|---|---|
| `Plans/.audits/event-authority-2026-08-12/individual-disposition/LEDGER.jsonl` | `52f0ac862efe889d…` | `00f6b80636b4e08e…` | 1 |
| `Plans/.audits/event-authority-2026-08-12/census-adjudication/LEDGER.jsonl` | `15cd4acc993b29b6…` | `49a6a6c4d5662f18…` | 1 |

**Changed fields:** citations_checked, disposition_rationale, evidence, quality_notes; on the census line, notes. Disposition, `provisional`, bucket, cohort pins and the owner choice are unchanged.

**Boundaries:** no registry row, validator, cohort pin, owner choice or disposition changed; no consumer was invented or reactivated; no seal is claimed. `individual-disposition/COVERAGE.json` is not regenerated, as in step 5.
