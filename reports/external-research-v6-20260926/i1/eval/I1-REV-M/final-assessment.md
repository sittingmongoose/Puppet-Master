# Final assessment: first view, fixed before deferred access

TEST_ONLY_NEVER_PROMOTE. Evaluator: claude-opus-5-5, requested effort xhigh. Observed effort can't be seen from inside the session and is recorded as unknown. Tools used were Read, Glob, Grep and Write only: no shell, no network, no other models. The machine-readable twin of this file is `final-assessment.json`.

## Disclosures
- **Early root glob.** My first call was a root-level `Glob('*')`. It returned 145 matches, but the listing was truncated to 100 entries, all under first_view/case. The pattern covered deferred/ paths, so this technically breaches the rule against globbing deferred/ before judgments were fixed. No deferred names or contents were displayed. All later globs were scoped.
- **Treatment exposure.** X1/current.md says "CARRIER INVALID … Invalid draft carrier", which reveals a draft-carrier arm that failed. X2/current.md L3/L265 names observations.md, history.md and snapshots/0001.md, which reveals an observations-plus-draft carrier. Carrier blinding was not maintained at first view.
- **No first-view contamination.** X2's current report contains no superseded or history content: it cites O-IDs only. Upstream substance was unseen when these judgments were fixed. No economics or operational files were read.

## Input eligibility
The corpus has the OME-Zarr 0.5 spec (S003), real 0.5 captures (S054–S056), reader code (S016–S019, S048) and tool/issue corpora. It has **no Zarr v3 core, codec or store specification text**: grep finds no decoding-procedure, endian, transpose, fill_value or store-interface spec content. So:
- **C07 and C08** are `unassessable_missing_input` as whole references, with their eligible subsets traced separately.
- **C07's eligible subset** is the support boundary and metadata-driven chain (S003 L70-72, S055).
- **C08's eligible subset** is truthful failure, read-only and cancellation (brief L3-5, Viewer.md L7/9/11).

## X1: delivered report is an invalid carrier with no claims
`X1/current.md` L1-5 asserts nothing. Following SCORING.md L5, I don't synthesize a delivery from drafts.
- C01–C06 are **lost**. This is a delivery/render failure, not a checked false dismissal and not unvisited scope.
- C07 and C08 are unassessable, with their eligible subsets lost.
- There are no unsupported assertions, novel findings or decisions. The effective user burden is the whole task.

## X2: coherent report, unverified (no flash verifier ran)

| Ref | Status | Key evidence / missing facets |
|---|---|---|
| C01 | retained | R-01, R-03, R-18 (S003 L68-69, L152-156): ome namespace, hierarchy-consistent version, malformed-input feedback, no half-parsing of 0.4; validation proposals present |
| C02 | narrowed | Retained: R-04 dimension_names==axes with refusal on mismatch; R-05 roles by type+order, controls only for present roles. Missing: absent vs length-one distinction, name uniqueness, binding when `type` is absent |
| C03 | narrowed | Retained: R-16 declared order and per-level scale/shape mapping, non-dyadic/Z fixture. Missing: declared-but-missing level handling; relative path and arbitrary names only implied |
| C04 | retained | R-06 dataset→multiscales order, scale→translation, length==ndim; R-07/R-08 no invented units. The check (L75) exposes reversed order and omitted offsets but gives no numeric expectation |
| C05 | narrowed | Retained: labels-list discovery, same level count, metadata-free intermediates, per-level geometry check with refusal. Missing: `source.image` association; S003 L106-108 "same or 1" rule, which the report calls "unresolved" (L135) although it read S003 fully |
| C06 | narrowed | Retained: integer dtypes, no silent 64-bit truncation (R-14), colors SHOULD with a fallback. Missing: label-value keyed lookup, categorical resampling, keyed properties |
| C07 | unassessable_missing_input | Eligible subset **retained**: R-01, R-02, R-15. Endian, transpose and reverse-order facets are unassessable; S109 was unvisited by X2 (D-02) |
| C08 | unassessable_missing_input | Eligible subset **narrowed**: cancel (R-17), explained failures (R-01, R-02, R-15) and untouched sources (R-10) are kept. Cancellation-vs-failure display and reader-side writes are not considered |

### Unsupported or overstated assertions
- **UA-1 (low-moderate), R-02 L21.** "Real 0.5 filesets do not open at all" without sharding. Sharding is optional per S034 L43 and S058 L362/L388.
- **UA-2 (low), R-15 L175.** "v3 requires bytes-to-bytes codecs". S013 L184 is a zarr-python writer-API error, not a format rule.
- **UA-3 (moderate), R-19.** Warn-and-continue on non-scale/translation transforms is labelled a "correction" and an exact constraint. S003 L309 forbids those transforms in 0.5 datasets, so leniency is a product choice (Viewer.md L9). The required visible caveat mitigates it.
- **UA-4 (low), R-11 L131.** "Default hidden" is copied from napari (S048 L654) and silently approved.
- **UA-5 (low), R-07 L83.** "Unit absent ⇒ relative factor" is presented as a constraint, while L79/L87 call the rule unresolved. S003 L310 ties relative factors to unavailable scaling, not to a missing unit.
- **UA-6 (low), R-06 and R-09.** Tools-matrix evidence (S043) comes from v0.4 samples and is not qualified as such.

There are **no false dismissals** and **no unscoped absence claims**: absences are line-scoped, and D-01..D-04 are labelled unknown, not absent.

### Novel supported findings beyond the reference
- **NV-1:** sharding and a real-writer codec floor (S055, S033 L155-169, S058).
- **NV-2:** bioformats2raw.layout collections (S003 L175-275).
- **NV-3:** HCS navigation, correctly surfaced as a decision (S003 §1.2/§2.7-2.8, S056).
- **NV-4:** selection among multiple multiscales entries (S003 L388-397, S043 L277-316).
- **NV-5:** omero defaults, marked optional (S003 L398-430, S054).
- **NV-6:** a published dtype list (S025 L84-86).
- **NV-7:** RFC-5 forward tolerance. Partially verified; its disposition is disputed (UA-3).
- **NV-8:** strategy alternatives. Not evaluator-verified.

### Correct non-findings
- R-17: responsiveness is already covered by the Plan.
- R-08: vocabularies are SHOULD-level.
- R-18: AGAVE creates no obligation (not evaluator-verified).
- U-02: labels redesign not adopted (S004 not evaluator-verified).

### Coherence and decision burden
Coherence is high, with tensions at R-07 and R-19.
- **Blocking decisions: 3.** HCS model, dtype list, 0.4 boundary.
- **Nonblocking choices: 6.**
- **Clarification questions: 3** (D-04).
- **Silently decided choices: 2** (R-11 default hidden, R-19 leniency).
- **Redundant questions: 0.**

### Coverage
I spot-checked these sources: S003 in full, S054 and S055 in full, and parts of S056, S043, S033, S034, S025, S008, S013, S016, S018, S019 and S048. I did not verify claims resting only on S004, S011, S014, S027, S036, S051, S053, S059, S072, S017, S041, S070 or S010.

## Comparison (first view)
- **X2:** 2 retained, 4 narrowed, 0 lost, 0 contradicted. On C07/C08, both whole references are unassessable; the eligible subsets are retained and narrowed respectively.
- **X1:** 6 lost, plus 2 unassessable with their subsets lost. This is a carrier failure.

This is one case with two arms, so it supports no generalization. X2's new positives don't offset its narrowed facets or UA-3.
