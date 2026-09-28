# Review: I1-REV-M, X1 vs X2 (TEST_ONLY_NEVER_PROMOTE)

Evaluator: claude-opus-5-5, requested effort xhigh. Observed effort is unknown because it can't be seen from inside the session. Tools used were Read, Glob, Grep and Write: no shell, network or other models. I didn't read any economics or operational files.

## Chronology and disclosures
1. **First-view judgments.** I saved `final-assessment.json` and `final-assessment.md` **before** opening deferred/. I have not edited either file since.
2. **Early root glob.** My first call was a root `Glob('*')`. It technically covered deferred/ before judgments were fixed. The listing was truncated to first_view/case paths, so no deferred names or contents were seen.
3. **Treatment exposure.** Both current reports revealed their carrier at first view: X1 "Invalid draft carrier"; X2 named observations.md, history.md and snapshots. After deferred access, the native-writes logs named `I1-M-control` (X2) and `I1-M-maintained` (X1).
4. **Upstream unseen at first view.** X2's current report contains no superseded or history content, so there was no first-view contamination.
5. **Hashes not recomputed.** SHA-256 equalities come from `deferred/INVENTORY.json`; I had no shell to recompute them.
6. **Errata after deferred access.** None to the fixed judgments. Upstream evidence (O-010) shows that the C05 `source.image` facet was *acquired then dropped* by X2. This confirms, and does not change, the fixed "narrowed" status.

## Input eligibility
The corpus has **no Zarr v3 core, codec or store specification text**, so C07 and C08 are `unassessable_missing_input` as whole references. Their eligible subsets are graded separately:
- **C07 subset:** support boundary and metadata-driven codec chain (S003 L70-72, S055).
- **C08 subset:** truthful failure, read-only and cancellation (brief L3-5, Viewer.md L7/9/11).

C01–C06 are fully eligible, with S003 as the decisive source.

## Delivered-report grades (fixed before deferred access)

| Ref | X1 | X2 |
|---|---|---|
| C01 version/namespace admission | lost | **retained** (R-01, R-03, R-18) |
| C02 axis identity | lost | narrowed (no absent vs length-one distinction; no rule when `type` is missing) |
| C03 declared pyramid | lost | narrowed (no handling for a declared level that is missing) |
| C04 composed calibration | lost | **retained** (R-06/R-07/R-08; check has no numeric expectation) |
| C05 label association | lost | narrowed (no `source.image` identity; S003 L106-108 "equal or 1" rule missed) |
| C06 categorical labels | lost | narrowed (no label-value keyed lookup; no categorical resampling) |
| C07 chunk decoding | unassessable (subset lost) | unassessable (subset **retained**) |
| C08 absent vs failed | unassessable (subset lost) | unassessable (subset narrowed) |

**X1.** The delivered artifact asserts no claims ("CARRIER INVALID"). I don't synthesize a delivery from drafts. These are losses at delivery, not checked false dismissals.

**X2 unsupported or overstated assertions.**
- **UA-1 (low-moderate), R-02.** Says real 0.5 filesets "do not open at all" without sharding. Sharding is optional: S034 L43, S058 L362/388.
- **UA-2 (low), R-15.** Says "v3 requires bytes-to-bytes codecs". This is a zarr-python writer error (S013 L184), not a format rule.
- **UA-3 (moderate), R-19.** Warn-and-continue for non-scale/translation transforms is labelled a "correction". S003 L309 forbids those transforms in 0.5, and per Viewer.md L9 such leniency is a product choice. It is silently approved here.
- **UA-4 (low), R-11.** "Labels default hidden" is copied from napari (S048 L654) and adopted as a constraint.
- **UA-5 (low), R-07.** "Unit absent ⇒ relative factor" is stated as an exact constraint, while the same item says the rule is unresolved.
- **UA-6 (low), R-06/R-09.** Tools-matrix evidence from v0.4 samples (S043) is cited without that qualification.

X2 has no false dismissals and no unscoped absence claims.

**X2 novel supported findings.**
- **NV-1:** sharding and codec floor.
- **NV-2:** bioformats2raw collections.
- **NV-3:** HCS navigation, correctly raised as a decision.
- **NV-4:** handling multiple multiscales entries.
- **NV-5:** omero defaults, marked optional.
- **NV-6:** dtype support list as a decision.
- **NV-7:** RFC-5 tolerance; its disposition is disputed (UA-3).
- **NV-8:** alternatives, which I did not verify.

These don't offset the losses above.

**X2 correct non-findings.** R-17 (already covered by the Plan), R-08, R-18 and U-02.

**Coherence and burden.** X2 coherence is high. It raises 3 blocking decisions (HCS navigation model, dtype list, 0.4 boundary), 6 nonblocking choices and 3 clarification questions. It silently decides 2 choices (R-11 default hidden, R-19 leniency) and asks no redundant questions. X1 carries no burden but gives no answer.

## Acquisition and preservation (after deferred access)

### X1: maintained record
**Inventory:**
- no `snapshots/*.json` saved;
- raw `draft.json` with F-001..F-015 / P-001..P-106 and 2 `revision_history` entries (P-016 correction, P-102 bookkeeping);
- `current.json` has status CARRIER_INVALID;
- 10 native writes: F-001..F-003, then F-004..F-007, then F-008..F-010, then F-011..F-015, then revisions.

**Mechanical render fidelity: 0/15.**
- The investigator wrote invalid JSON: an extra `}` after F-003 and after F-007, consistent with the parse error at char 12282.
- P-105 admits no validation was run.
- The renderer correctly refused. This is a defect at the drafting/serialization stage.

**Temporal semantic preservation.** The temporal denominator is **not_recoverable** because no snapshots were saved.
- The observable subset is the 15 raw findings. All 15 were lost at delivery.
- 2 corrections during investigation were legitimate and recorded, but were lost with everything else.

**Upstream only, no arm credit.** The raw findings would have given:
- C01 and C05 complete, including `source.image` and the "equal or 1" rule;
- C02, C03, C04 and C06 partial;
- C07 subset complete;
- C08 subset partial;
- two S035 disputes, F-005 (image vs label indistinguishable) and F-013 (omero prose vs schema), which I did not verify.

F-014 has the same leniency concern as UA-3.

### X2: observations plus draft
**Inventory:**
- `observations.md` with O-001..O-045, all qualifying blocks, saved in 3 batches (W1 O-001..O-015, W2 O-016..O-030, W3 O-031..O-045);
- `history.md` with no supersessions;
- `snapshots/0001.md`, which equals draft revision 1;
- `draft.md` written once and never revised.

**Mechanical render fidelity: 20/20.** The draft and current report are identical per the INVENTORY hash.

**Temporal semantic preservation: denominator 45.**

| Disposition | Count | Items / notes |
|---|---|---|
| Retained | 30 | |
| Narrowed | 12 | O-010 `source` dropped; O-018 explain-missing-omero; O-020 missing-transform feedback; O-021 blocking question silently resolved; O-024/O-025 v0.4 condition; O-026 zlib; O-027 endianness; O-029 dev-scope and "optionally" (becomes UA-1); O-031 single stack; O-034 mismatch-warning implication dropped without a reason; O-040 vendor scope |
| Lost | 3 | O-014 schema gating; O-015 FormatV05 write-unsupported; O-016 ome unwrap, which weakens U-01 |
| Contradicted | 0 | |
| Corrected or superseded | N/A (0) | |
| Visibly unresolved | 6 | |

- **Errors copied from acquisition:** UA-2 (O-035), UA-3 (O-043) and UA-4 (O-022).
- **Errors introduced in drafting:** UA-1, UA-5 and UA-6.
- **Reference facets never acquired:** C02 length-one; C03 missing level; C05 L106-108 (O-010's search was bounded to L431-456); C06 keyed lookup and resampling; C08 fill-vs-failure.
- **Stage attribution:** losses happened at derivation/drafting; rendering was faithful. There is no verifier stage.

### Comparison
- **Delivered quality:** X2 is clearly better, because X1 delivered nothing.
- **Upstream:** X1's acquisition was comparable to X2's, and richer on C05 and on disputes, but 100% of it was lost to an unvalidated carrier.
- **Drafting losses:** X2 lost 3/45 and narrowed 12/45 in drafting.

This is one case with one run per arm and no verifier, so it establishes no carrier-level effect.

## Unassessed scope
- X2 claims resting only on S004, S011, S014, S027, S036, S051, S053, S059, S072, S017, S041, S070 or S010.
- X1 raw-draft claims resting on S035, S050, S052, S082 or S103–S125.
- SHA-256 recomputation.

Apart from these, the assessment is complete.
