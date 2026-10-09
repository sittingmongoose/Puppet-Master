# Critique — A-M08-A/treatment/critic (S08 volunteer-shifts, method M08)

Status: critic-stage progressive draft (M08 v1). Inputs read, per input-map only: case brief, `research/draft.md`, `research/discovery.md`, `research/source-map.json`, `research/revealed-plan.md`, `research/sources/` (8 evidence files + index). Independent primary re-inspection recorded in `claim-judgments.md` (34 claims; critic fetches 2026-10-09T20:47–20:53Z; N01 reproduced by HTTP probes). Frozen-discovery discipline respected: no campaign/history/evaluator/counterpart material read. This draft is developing; intermediate retained at `versions/critique-v1.md`.

## 1. Material findings

**M1 — Citation defect in P2 conditions and discovery §2.1: "The docs state no practical size limit" is not on the cited page (S01).**
The predecessor (draft P2 Conditions; discovery §2.1) asserts the OR-Tools employee-scheduling page states CP-SAT has "no practical size limit." My independent fetch of that exact page (2026-10-09T20:47Z) found no size-limit statement of any kind; it contains only the toy instances (4×3×3; 5×3×7) and the model/objective text. The sentence may exist on some other OR-Tools page, but as cited it is unsupported. Severity: material (citation accuracy is an O2/O4 obligation), low consequence: the draft's operative conclusion — behavior at 180 volunteers × multi-week horizons is unknown and probed by V1 — survives, and actually strengthens once the unsupported assurance is removed. Required repair: re-scope the sentence to "no size-limit statement appears on the cited page" or cite the page that carries it.

**M2 — N01 underclaims a checkable O3-grade fact: the docs' linked sophisticated example is unlocatable across the v9.6–v9.15 window.**
N01 recorded 404s on two raw paths (stable, main). My probes (20:49–20:53Z) reproduce both, plus the blob path, and go further: the full `ortools/sat/samples` tree on `stable` (GitHub contents API) contains no file of that name under any alias (neighbors `nurses_sat.py`, `schedule_requests_sat.py` present), `ortools/sat/python` holds no `shift*` file, and tags v9.6, v9.10, v9.12 return 404 at both historical paths. So the documentation links an example that cannot be found in any recently probed tree — a live docs-vs-repo inconsistency. The draft's refusal to rest anything on the example ("UNVERIFIED this session") was exactly right; the finding available to it was stronger than "404 on two paths". Severity: material, low severity. Repair: upgrade the uncertainty-register wording to "example absent from all probed trees v9.6–v9.15", which also sharpens V-probe framing.

**M3 — Omission from the O3 chain: Timefold 1.x maintenance line has a declared EOL (early 2027).**
S05's 1.34.0 notes (fetched 20:48Z) state only two more 1.x maintenance releases are planned before EOL in early 2027. The draft's Timefold chain (2.0.0→2.7.1 + 1.34.0 line, move-selection fairness fixes) is otherwise verified verbatim, but this forward-looking fact belongs beside the quickstart "no releases → pinning unevidenced" uncertainty, because any build decision touching the maintenance line now carries a dated risk. Severity: material, low severity. Repair: one sentence in §3 + uncertainty register.

**M4 — Validation set (O6) is applicable and honestly split; one sharpening note.**
V1–V5 are well-formed discriminating probes: each names the uncertainty it separates (CP-SAT scale viability; raw-count vs ratio fairness definitions; BigDecimal vs scaled-long score traps; product gap for recurring auto-assignment + import; callback degradation shape). Applicability check: V5 correctly targets the current line (v9.15, which my fetch confirms is Latest); V1's "1% gap" threshold is a proposal, appropriately so; none of the five pretends to have run — "executed this session" is static retrieval only, and I verified that claim by reproducing N01 and confirming per-source `observed_operations`. Sharpening: with M1 applied, V1 is not merely discriminating but load-bearing, since no documented size assurance exists on the cited page.

## 2. Per-P disposition adjudication (O4)

- **P1 (correction, kept core + exceptions/overrides + template-level import):** sound. Evidence re-verified: S06's "fixed, recurring schedule tied to warehouse operations" (verbatim), S07's absence of named recurring-shift and roster-import features (reproduced today), integrations list matches (Salesforce/Blackbaud/Zapier/Sterling). The RRULE alternative is correctly labeled unevidenced rather than cited. Vertical-uncertainty (unnamed dedicated platforms) is flagged and probeable (V4).
- **P2 (rejected as allocation rule; availability-derived constraint allocation):** sound, with the M1 citation defect inside its Conditions paragraph. The rejection grounds verify: the S01 hard bound `(num_shifts*num_days)//num_nurses` with `min+1` cap assumes divisible, availability-blind load — inapplicable under the brief's explicit no-equal-availability prohibition. Replacement mechanics verify (S01 `new_bool_var`/`add_exactly_one`/`add_at_most_one`; S02 `loadBalance`/`unfairness`/BigDecimal/1.000001-vs-1.000002 trap/dimensionless/unbounded/dataset-local — all near-verbatim). Ratio-keyed loadBalance is honestly flagged as undocumented composition. A possible critic demand — "alphabetical is fine, reject the rejection" — is invalid: the draft retains alphabetical as fallback and self-signup as dominant flow, so it rejects the rule as *primary allocation only*, on evidence.
- **P3 (already-covered + two enhancements):** sound. Matches the discovery's constraint-draft-roster pattern; enhancements (warn-not-block; audit trail) are proposals honestly marked not-executed; user decisions properly deferred.
- **P4 (correction — conflicts with privacy-limited sharing):** sound. The conflict is real against the brief text; scoped alternatives verify as exact S07 feature names; the notification-decoupling condition verifies via S04's v9.11 known issue ("search will continue until the time limit is crossed" — reproduced verbatim today, page's own typo intact).
- **P5 (rejected as storage representation):** sound and honesty-compliant. The draft itself labels the correction as engineering reasoning, not retained evidence; my fetches confirm no retained source covers timezones (S01 has none; S07's "intervals you designate" is not zone semantics). The imported-roster requirement makes cross-zone input non-hypothetical, so the cheap fix is warranted regardless of single-site practice. A critic demand to demote this to "optional enhancement" would be invalid: DST mis-ordering of imported rosters is a correctness issue, not a preference.
- **P6 (correction — keep as smoke test, insufficient alone):** sound. The proposed/executed split is honest (M4); the additions (property test, drift assertion, import round-trip, DST notification test) each map to a P1/P4/P5 correction, so they test the corrections rather than pad scope.

No false correction or rejection found: both rejected clauses carry verified mechanical grounds; every kept clause keeps its evidence.

## 3. Minor findings

- **m1:** S06's "attendance history is the single strongest predictor" of no-shows appears on a *linked Golden post*, not the mapped S06 URL; the draft cites S06 for framing one hop beyond the mapped source. Re-scope wording to "Golden property, linked post".
- **m2:** The S06 article shows a publication date (September 14, 2026); the predecessor source-map recorded "no date visible in fetch". Minor, but it dates the $36.14 figure precisely relative to the recorded $33.49 disagreement.
- **m3:** The quickstart repo's "Load Balancing" appears in its overview table ("Notable Solver Concepts"), not in the Employee Scheduling use-case description ("availability and shift skill requirements"); the draft's "covers availability + skills + load balancing" compresses the two. Substance survives.
- **m4:** S02's key-function genericity is implied by usage, not stated; consistent with the draft's own uncertainty about the ratio-keyed composition.
- **m5:** New release-note detail: 2.7.1 (06 Oct) is a fix for a performance regression on very large datasets — relevant color for V1's scale probe, not consequential to dispositions.

## 4. Brief-scope and obligation coverage

- **O1 (discovery beyond thin plan):** 9+ named platforms, 4 materially different approaches, one primary-verified product page; leads honestly labeled leads. Adequate; the unnamed-vertical gap is probeable (V4).
- **O2 (primary mechanism evidence):** verified across S01/S02/S03 — APIs, governing defaults (hard bound vs soft fairness), units (counts; dimensionless unfairness), numeric-type limits, licensing boundary. M1 is the one citation defect.
- **O3 (issue/fix/regression chain):** OR-Tools #4674/#4677 regression→fix window and v9.11 callback issue verified; Timefold fork evolution and move-selection fairness fixes verified verbatim; absence statements present and one (N01) upgraded by M2; M3 adds the EOL fact.
- **O4 (per-P comparison):** all six clauses disposed with the declared vocabulary; adjudicated in §2; revealed plan quoted verbatim and byte-identical to `revealed-plan.md`.
- **O5 (self-contained coherent retention):** draft text carries findings in prose with conditions/alternatives/disagreement; no bare-ID references found (every S-ref is accompanied by substance); user-decision ledger and uncertainty register present.
- **O6 (discriminating validations, executed vs proposed):** M4. Honest; no runtime claimed anywhere.
- **Alternatives coverage (O5/O1):** RRULE (labeled unevidenced), plain template rows, alphabetical fallback, self-signup-first, preference weighting, CP-SAT vs Timefold fork, availability-proportional caps + spread penalty — all retained with tradeoffs.
- **Prohibitions honored:** no legal requirement invented anywhere in the reviewed text; no equal-availability assumption survives (the S01 hard bound is explicitly repaired, not assumed).

## 5. Contradictions, uncertainty, drift

- No internal contradiction found between frozen discovery and post-reveal draft; the draft carries discovery findings forward without altering frozen text.
- $36.14 vs $33.49 volunteer-hour disagreement: correctly recorded, unresolved, immaterial to dispositions — critic agrees.
- Inferred years on S04 rows: correctly labeled unverified (reproduced: v9.13–v9.15 rows lack years).
- Drift: re-fetches 14–21 minutes after the predecessor's found no content drift; differences are additive details (M3, m2, m5). Source IDs reused unchanged (no rebind).

## 6. Verdict

The predecessor draft is publishable after three repairs: (1) re-scope the S01 "no practical size limit" sentence (M1); (2) upgrade N01 wording to the unlocatable-across-v9.6–v9.15 finding (M2); (3) add the Timefold 1.x EOL fact to §3/uncertainty register (M3). Minor items m1–m3 should ride along if convenient. All six dispositions stand as written.
