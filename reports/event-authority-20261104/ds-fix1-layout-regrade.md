# Lane DS-FIX1: workspace.layout_changed producer and oracle cells re-graded after the Home4 repair (review DS-SOL-01, DS-SOL-02)

**Record:** `ds-fix1-layout-regrade.json`, applied 2026-11-04T20:36:31Z on `78a7f8e824`. It has the before and after hashes, the cell statuses, and every citation with its exact quote, line and excerpt hash.
**Finding:** DS-SOL-01 and DS-SOL-02 (blocking): layout's producer and oracle cells stay non-PASS until the Home4 complete-value bound and reference identifiers are repaired; then re-grade them honestly.
**Pattern:** a receipted row update, as `ds-p2-august-regrade-application.json`: the row file and its two ledger lines are rewritten byte-for-byte except the changed fields; line endings are preserved; every citation is an exact single-line quote located by script.

**Why.** The review kept both cells non-PASS until SP-400 bounded the complete Home4 value and verified its references. That repair is `31cd37713c`: the complete slot or receipt is stored inline within SP-340's 16,384 bytes or by a verified payload reference, BLAKE3 ids are exactly 64 lower-case hex characters, and the fixtures cover the boundaries, the over-limit rejections and every reference branch. Re-grading honestly at this head still leaves both cells non-PASS for a different, newly found reason (standing check 4): a 2.0.0 payload over 16 KiB has no append route. CV-361's affected arrays are unbounded and SP-330 contemplates layouts over 16 KiB; SP-273 fixes `payload_ref=null` for this family; the envelope's DL-270 prose (`Plans/Contracts_V0.md:1019`) replaces a body over 16 KiB with a BLAKE3 `payload_ref`, while `Plans/event_record.schema.json` 2.0.0 still requires an object `payload` and types `payload_ref` as a nullable string. Settling that envelope inconsistency is outside this lane; it is an open item in `DS.md`. Under the rubric the producer lacks that append boundary and the oracles cannot test a boundary missing from the contract.

| Row | Cells not PASS before | Cells not PASS after | Row file SHA-256 before → after |
|---|---|---|---|
| `workspace.layout_changed` |  | producer (FAIL), positive_negative_oracles (FAIL) | `4482699e0f2976d8…` → `550a5960c335f4dc…` |

| File | SHA-256 before | SHA-256 after | Lines changed |
|---|---|---|---|
| `Plans/.audits/event-authority-2026-08-12/individual-disposition/LEDGER.jsonl` | `00f6b80636b4e08e…` | `d5db5c6adb93cfed…` | 1 |
| `Plans/.audits/event-authority-2026-08-12/census-adjudication/LEDGER.jsonl` | `49a6a6c4d5662f18…` | `d1496fb25c97be9c…` | 1 |

**Changed fields:** citations_checked, disposition_rationale, evidence, quality_notes; on the census line, notes. Disposition, `provisional`, bucket, cohort pins and the owner choice are unchanged.

**Boundaries:** no registry row, validator, cohort pin, owner choice or disposition changed; no consumer was invented or reactivated; no seal is claimed. `individual-disposition/COVERAGE.json` is not regenerated, as in step 5.
