# Census Adjudication Ledger Schema

## Purpose

Canonical ledger spanning the **complete fresh candidate universe** after `DIRECT_EVENT_TYPE_BINDING_REQUIRED` admission filtering and lexical rejection.

This restores original cohort scope (july248/40/68/26, august2, known37) that IndividualDisposition alone cannot represent.

## Categories (exactly one primary category per `candidate_id`)

| category | meaning |
|---|---|
| `registered_keep` | Live registered families: Known37 + August2 |
| `persisted_unregistered_quarantine` | Working unregistered quarantine (248 original + 5 auth.github reclass) |
| `alias` | July40 RECLASSIFY_ALIAS rows (non-persisted compatibility tokens; not admitted to denominator). **Remains valid.** |
| `unresolved` | Still-open July40 substantive rows plus unresolved emit/evidence-gap restores; all remain outside the admitted denominator |
| `quarantined_not_admitted` | Owner-closed non-admitted quarantine. **Not admitted.** **Not unresolved.** Not a live-registry admit. Not a denominator member. Expected IndividualDisposition disposition: `KEEP_QUARANTINED`. |
| `exact_excluded` | Working july68 exact exclusions (63; excludes reclassified auth.github) |
| `non_exact_excluded` | July26 non-exact exclusions (26) |
| `rejected_lexical_candidate` | Lexical/config/method rejects; **not** denominator members |

`quarantined_not_admitted` is a valid census category. Authority: owner decision **`UNRESOLVED-54-CLOSE-PATH`** option `NEW_NON_ADMITTED_QUARANTINE_BUCKET`. It is the census counterpart of IndividualDisposition bucket `quarantined_not_admitted`. Do not merge it into `unresolved`, `alias`, or `persisted_unregistered_quarantine`. `alias` stays a separate non-admitted category.

This schema addition does **not** restamp live ledger counts, does **not** claim contract-depth complete, and does **not** claim PNC-019.

Current live counts for this package (pre-close-path snapshot; not a claim that `quarantined_not_admitted` is empty or that seal/PNC-019 passed): `registered_keep=39`, `persisted_unregistered_quarantine=253`, `unresolved=54`, `alias=12`, `exact_excluded=63`, `non_exact_excluded=26`, `rejected_lexical_candidate=81` (total 528). After `UNRESOLVED-54-CLOSE-PATH` apply, former unresolved rows belong in `quarantined_not_admitted`; authoritative counts are the live ledgers, not this snapshot.

## Multi-cohort pins

Reclassified rows (auth.github.*) appear **once** under `persisted_unregistered_quarantine` with `cohort_pins: ["july68","july248"]` and `multi_cohort_reclass: true`. They must not also appear as `exact_excluded`.

## Advisor-2 machine-contract restore

Advisor-2 machine-contract restore evidence is now reflected in this live package. RECLASSIFY_ALIAS july40 rows are in category `alias` (synchronized to IndividualDisposition alias bucket; **alias remains valid**). Unresolved emit candidates and substantive july40 veto rows stay in category `unresolved` only while still open. Owner decision **`UNRESOLVED-54-CLOSE-PATH`** (`NEW_NON_ADMITTED_QUARANTINE_BUCKET`) closes that path into category `quarantined_not_admitted` with `KEEP_QUARANTINED`: **not admitted**, **not unresolved**, no registry admit. Persistence proof is not invented by that close.

## Split checks (Advisor-2)

1. **Exact denominator equality** — applies only to **admitted persisted event families** (`persisted_unregistered_quarantine` + August `registered_keep` = IndividualDisposition 255 in the current package). `unresolved`, `alias`, and `quarantined_not_admitted` are tracked here for partition completeness but remain **outside** the admitted denominator (`quarantined_not_admitted` is non-admitted by `UNRESOLVED-54-CLOSE-PATH`). See `FRESH_CENSUS_DENOMINATOR.json` `admitted_persisted_event_families`.
2. **Exclusion/rejection completeness** — separate **exact-partition** check over this census-adjudication ledger (`PARTITION.json`), including july68/july26 pin coverage and rejected lexical membership.

IndividualDisposition must **not** be asked to exact-equality-revalidate july68/july26.
