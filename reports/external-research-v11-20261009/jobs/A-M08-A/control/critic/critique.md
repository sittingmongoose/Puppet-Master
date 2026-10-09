# Critique — S08 volunteer-shifts (A-M08-A, control arm, M08 stage critic)

Independent critic review of the complete own-arm predecessor draft (`research/draft.md`, written against frozen discovery `research/discovery.md` sha256 `9d2798f9…19384`, source map S1–S10, and `research/revealed-plan.md`) against the brief (`cases/S08/brief.md` sha256 `cc962dde…e73cf`) and governing primary evidence. Claim inventory: `claim-inventory.md`; per-claim verification with locators/timestamps: `verification.md`. Every P clause of the revealed plan was compared exactly (text match confirmed in ticket 1). Sources treated as data throughout. **This critique repairs nothing and replaces nothing — findings only, per the assigned recipe.**

## Verdict summary

The draft is factually accurate on every locally checkable claim: all SHA attributions, all code-level statements about both retained Timefold files, the OR-Tools model description, the CiviVolunteer VOL-267/VOL-269/permissions chain, and its date claims (its dates are committer dates — a consistent, defensible convention, verified per-commit). The P dispositions are broadly sound and honestly labeled. **9 material findings** (2 of which correct the draft's evidence record, the rest tighten claims the draft overreaches on or mis-classifies) and **9 minor findings** follow. The draft's own honesty devices (absent-evidence statements, proposed/executed separation) held up under challenge.

## Material findings

**M1 — Timefold fairness-constraint arrival window: draft's implication superseded (chain A).** The draft says tags v2.0.0–v2.2.0 returned 404 "at this path" (true, literally) and infers the constraint "presumably arrived inside a squashed release PR," leaving arrival open anywhere between v1.10.0 (2024-05-14) and 2.3.0 (2026-07-10). Verification found the repo restructured at v2.0.0–v2.2.0 (no `use-cases/`; quickstarts under `java/`), and at the restructured path the provider **already contains `balanceEmployeeShiftAssignments` at v2.0.0, v2.1.0 and v2.2.0, byte-identical to stable** (sha `c59fa688…26a4`; `verification.md` N1). New-path history pins first appearance to `b2056965eb30` (2024-06-19, "build: release version"). *Corrected record:* the constraint demonstrably exists from ≤ 2024-06-19 and is unchanged through 2.3.0. *Uncertainty:* the exact introducing diff inside that release/restructure commit is still not decomposed — no dedicated feature commit exists on either path; "arrived inside `b2056965eb30`" is the honest terminal statement, not a specific authoring event.

**M2 — Draft sentence contradicts its own evidence list ("no non-release commit after 2022").** The path history contains `0e274a686bbe` (2023-04-20, "Timefold fork step 5: rename packages") — non-release, post-2022 — which the draft itself lists two clauses earlier. The inference's substance survives (the rename is not the fairness addition; after v1.10.0 only release commits touch the old path), but the sentence as written is false. Evidence: GitHub API `commits?path=` extraction, `verification.md` F5.

**M3 — P2 correction (1) overreach: "change effective immediately."** The draft requires availability changes to be "effective immediately," citing S7's hard "Unavailable employee" constraint as "the template." Solver constraints act at the next solve; immediacy is a product-behavior/triggering claim the fetched code cannot establish. The correction's direction is right; its evidentiary basis must be narrowed to "single source of truth + re-solve on change," with immediacy as a design requirement, not source-backed fact.

**M4 — P6 classification tension: two proposed tests are corrections-mandatory, not "optional enhancements."** The draft's P1/P5 corrections (IANA-pinned expansion, UTC-instant storage) and P2 fairness mechanism make the DST-recurrence test and the fairness-discrimination test validation of *required* corrections, not optional extras. Under O4's taxonomy they belong with the corrections; leaving them under "optional enhancement" understates what the draft's own corrections demand.

**M5 — P4 rejection ground broader than evidence.** "Emailing the entire roster … publishes everyone's contact info" — a roster need not carry contact info; the fetched privacy mechanisms (VolunteerHub Advanced Permissions, CiviVolunteer relationship permissions) support *gated visibility*, not the contact-publication claim specifically. The rejection as stated still stands on the privacy-limited-sharing constraint plus signal-to-noise (targeted-reminder product evidence), so the disposition survives; the stated ground must be narrowed. Related overreach: "VolunteerHub's dominant pattern is the opposite of silent auto-assign" — marketing-page emphasis does not establish product dominance.

**M6 — OR-Tools availability caveat: mechanism mislabeled.** The draft says the band formula "implicitly assumes everyone is available every day." Precisely: bands are uniform across nurses and requests are soft preferences, so a nurse requesting nothing can still be assigned up to the band — availability never binds the model. Directionally consistent with the brief's "do not assume equal availability," but the draft uses this example as its counterweight to Timefold's approach in P2 and should state the mechanism correctly.

**M7 — Reproducibility of live-page evidence: no snapshots or hashes in the research stage.** S2–S6 and S10 have no sha256 and no retained copy; every product claim in the draft rests on unretained page states. Drift exposure is concrete, not hypothetical: within this critic stage both VolunteerHub pages returned HTTP 404 to bot-UA fetches while returning 200 with a browser UA (access-method-dependent serving), ~18 minutes after the research fetches. The critic retained full-HTML snapshots of both pages (`sources/verify-volunteerhub-*.html`, hashed in `source-map.json` C11/C12) and verified the draft's quoted phrases against them — all quoted strings found. The finding is about the research stage's record, not about quote accuracy.

**M8 — The draft's strongest fairness claim rests on unverified API semantics.** "Fairness is computed over **all** employees including zero-assignment ones" depends on `complement(Employee.class, e -> 0L)` semantics and on `LoadBalance::unfairness` being a spread statistic; the retained file shows the calls, not their behavior. All primary-API lookups failed (docs fairness page 404 reproduced at 21:36:00Z; javadoc and timefold-solver source paths 404 — `verification.md` F1-API). The claim must stay labeled as upstream-API behavior not evidenced in this stage's sources. BigDecimal-required-by-`penalizeBigDecimal` is in the same class.

**M9 — O5 self-containment gap in the draft.** The draft must be "one self-contained coherent final" retaining original constraints. Mobile access, on-site check-in (evidenced, S2/S3), roster import identity/dedupe, the 180-volunteer scale note, and reminder-accessibility absence-evidence live only in the frozen discovery — the draft's consolidated sections cover six user decisions and a per-P subset, and never restate mobile/import/scale. A reader with only the draft lacks binding constraints the brief names.

## Minor findings

- **m1.** Line-count convention: draft claims 112/123/125 (v1.6.0/v1.10.0/stable); `wc -l` gives 111/122/124 — consistent off-by-one (final-line counting). Content unaffected.
- **m2.** Draft dates are committer dates (verified: initial add author 2021-11-15 / committer 2022-01-21; both 2022-02 commits committer 2022-02-07T13:47:19Z). Correct but the convention should be named; author dates differ by up to 9 weeks.
- **m3.** "CiviVolunteer's whole permission model is relationship-based" overstates S5–S6, which show relationship-based *management* plus two named permissions, not the whole model.
- **m4.** Unremarked diff: v1.10.0's `atLeast10HoursBetweenTwoShifts` uses `forEachUniquePair`; stable uses `forEach().join()` — behaviorally near-equivalent pairing change worth one line in the evolution chain.
- **m5.** P3's "Uncertainty: None material" is the only zero-uncertainty disposition, while its condition (3) (audit trail) is unsourced — a design requirement stated as if evidence-backed.
- **m6.** The timefold.ai docs lead (fairness/constraint catalog, directly relevant to M8) was abandoned after one 404 without trying the docs index — a discoverable-alternative gap, not a correctness error.
- **m7.** CiviVolunteer AGPL-3.0 + exception files: GitHub API `license` field is null; file names not re-verified at file level.
- **m8.** S9 (v1.6.0) was not retained by the research stage; the critic re-fetched and retained it (C3), confirming balance-absent, HardSoftScore, and 111 lines.
- **m9.** OR-Tools/VolunteerHub/CiviVolunteer exact wording beyond the critic's VH snapshots remains transcription-only (no page hashes exist for C13–C15 fetches).

## Invalid critic demands (considered and rejected, with reasons)

1. **"Identify the exact introducing commit of the fairness constraint."** Not derivable from public evidence: both path histories contain only release/restructure commits in the relevant window; the research's commit-search (0 results) was reproduced in spirit by this stage's failure to find any feature commit on the new path either. The honest terminal record is M1's bounded statement.
2. **"Run the five proposed validations."** No runtime/solver sandbox exists in this stage; the assignment explicitly permits honest proposals only. The draft's proposed/executed separation is correct and must not be blurred.
3. **"Reverse the P4 rejection because a roster need not include contact info."** Invalid: the correction (targeted reminders + gated visibility) is what the privacy evidence actually supports; only the stated ground needs narrowing (M5). Demanding reversal would weaken the deliverable.
4. **"State WCAG requirements for reminder emails."** Invalid — no fetched source evidences accessibility specifics, and the draft correctly records absence rather than inventing claims; the brief forbids inventing requirements.
5. **"Rewrite the draft / repair candidate text."** Outside the critic recipe; findings and corrected evidence records only.

## P-disposition re-adjudication (post-verification)

| P | Draft disposition | Critic verdict |
|---|---|---|
| P1 | already-covered + conditional; TZ/DST + end-condition corrections | **Keep class**, "already-covered" rests on VolunteerHub marketing precedent alone (CiviVolunteer lacks recurrence — the draft says so itself); conditions sound and now cross-checked against P5 |
| P2 | rejected as sole mechanism; tiebreak correction; user decision | **Keep rejection** (bias is sound reasoning, correctly unsourced-labeled); **narrow** "effective immediately" (M3); keep normalized-fairness recommendation labeled as unsupported-by-sources open point (verified honest) |
| P3 | already-covered + conditional; optional swap requests | **Keep**; strike "none material" uncertainty (m5), narrow m3 |
| P4 | rejected as stated; targeted reminders + gated roster | **Keep rejection, narrow ground** (M5); accessibility absence-evidence correctly recorded |
| P5 | rejected as storage model; UTC + IANA correction | **Keep**; the failure-mode narrative should separate wrong-conversion vs instant-reuse drift (F3) |
| P6 | already-covered smoke test + optional enhancements | **Reclass DST + fairness tests as correction-validation** (M4); executed/proposed separation verified intact |

## Uncertainty register (critic stage)

- `complement` zero-inclusion, `LoadBalance::unfairness` spread semantics, BigDecimal API requirement: unverified from any primary doc (M8) — all lookups 404 at access time.
- Exact introducing diff of the fairness constraint: not decomposable; bounded by M1.
- Live-page states beyond the retained VH snapshots (C13–C15): transcription-only; undated CiviVolunteer pages bounded by access 2026-10-09 (draft's caveat verified).
- VolunteerHub serving differs by client (404 bot-UA / 200 browser-UA at 21:35–21:36Z): quote verification is valid for the browser-UA snapshots retained; other clients may see other content.
- CiviVolunteer license file names: not re-verified at file level (m7).

## Separation of executed vs proposed (honesty record)

**Executed in this stage:** ingestion + hash verification of all declared inputs; raw re-fetches of Timefold files at 7 refs + 3 restructured-path refs (status/bytes/lines/sha256); GitHub API commits/tags/contents/releases queries; VolunteerHub browser-UA fetches with full-HTML snapshot retention + phrase greps; CiviVolunteer docs/release-notes fetches; OR-Tools page 9-point check; negative-result doc lookups. **Proposed:** none added — the research stage's five discriminating validations stand as proposals; this stage ran no scheduler, solver, or product code (none available), per assignment.
