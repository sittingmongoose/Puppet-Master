# Draft — volunteer-shifts (S08), per-P comparison vs executed thin plan (M08 final stage)

Status: post-reveal planning deliverable. Discovery frozen pre-reveal (`discovery.md` sha256 `6dd83e2c57fb9ea0…`, `source-map.json` `0c537348989fac1e…`; retained intermediate at `versions/discovery-intermediate-1.md`). Sources cited by immutable ID (S01–S08, N01) as mapped in `source-map.json`; full findings and exact quotes/URLs/timestamps live in discovery + `sources/` and are retained here by reference and substance, never ID-only (O5).

Revealed plan (verbatim, 6 clauses): **P1** Generate recurring shifts from a weekly template. **P2** Assign the first available volunteer alphabetically. **P3** Allow coordinators to swap names. **P4** Email everyone the full roster. **P5** Use local wall-clock timestamps. **P6** Test one ordinary week.

Disposition vocabulary per O4: correction / optional enhancement / user decision / already-covered / rejected / uncertain.

---

## P1 — "Generate recurring shifts from a weekly template."

**Disposition: correction (kept as core, fixed on two points).**

Retained findings: food-bank operations run on "a fixed, recurring schedule tied to warehouse operations" (S06) — the weekly template matches the domain. No fetched vendor page exposes a *named* recurring-shifts feature (S07 explicit absence note), so a first-class template engine is also the product-gap differentiator.

Corrections:
1. **Exceptions and overrides must be part of the template, not around it**: holiday skips, one-off extra shifts, and template edits mid-cycle. A bare weekly generator cannot express "no Tuesday shift on Thanksgiving week" without per-instance overrides.
2. **Imported rosters must land as templates (or template deltas), not just shift instances**: the brief requires occasional imported rosters; primary product evidence shows import is precisely what goes missing (S07: no roster import; only Salesforce/Blackbaud/Zapier/background-check integrations). Template-level import is the reusable form.

Conditions: template expansion must be timezone-explicit (interlocks with P5); expansion horizon bounded (e.g., 4–8 rolling weeks) so availability changes re-enter allocation before far-future shifts lock.

Alternatives retained: full RRULE/RFC-5545 recurrence semantics (more expressive, heavier; **unverified this session** — no RRULE source was retained, so this is a proposed standard, not evidenced); plain per-week template rows with override dates (simpler, matches the thin plan's spirit).

Uncertainty: whether dedicated food-bank verticals (S06 category 1, unnamed) already ship template+import together — product gap probe V4 below would settle it.

## P2 — "Assign the first available volunteer alphabetically."

**Disposition: rejected as the allocation rule; replaced by availability-derived constraint allocation.**

Retained findings: alphabetical first-fit is a scan order, not an allocation policy — where several volunteers are available it resolves ties by name, which (a) concentrates load on the top of the alphabet chronically, (b) is blind to no-show history, which vendor-domain evidence frames as the strongest predictor of coverage failure (S06), and (c) has no fairness semantics at all, while the brief forbids assuming equal availability.

Replacement, from primary-documented mechanics: model assignment as boolean allocation (S01: `new_bool_var`, `add_exactly_one` per slot, `add_at_most_one` per volunteer/day) with **per-volunteer caps derived from that volunteer's declared availability** — the S01 hard bound `min = total // n` is documented as assuming divisible-by-headcount load and is inapplicable as written under unequal availability; the corrected form caps each volunteer at a fraction of their own offered slots. Fairness objective, two evidenced options: Timefold `ConstraintCollectors.loadBalance(...)` with `LoadBalance::unfairness` on a BigDecimal soft score (S02, minimax semantics, key function generic so it can key volunteer) — with the documented caveat that `unfairness()` is dimensionless, unbounded, dataset-local, and integer rounding creates score traps (~1e-6); or plain CP-SAT availability-proportional caps plus a minimize-spread objective using only S01 primitives. Preference weights (S01 request-weighted objective) can layer on top as a soft term.

Conditions: the OR-Tools docs state **no practical size limit** and only demonstrate 4×3×3 and 5×3×7 instances (S01) — behavior at 180 volunteers × multi-week horizons is genuinely unknown (V1 below); Timefold's full constraint set beyond the quickstart (skills, pairing, fairness) lives in its **commercial** model, not the Apache-2.0 quickstart (S03), a licensing boundary a build decision must respect.

Alternatives retained: keep alphabetical as the *fallback* when the solver fails or times out (deterministic, explainable); self-signup as the dominant flow with allocation only filling gaps (all vendor products work this way; S07 "Volunteer Scheduling — volunteers self-manage their shifts").

User decision: whether assignment is suggestion-only (coordinator confirms) or authoritative — evidence does not discriminate; default suggestion-only.

## P3 — "Allow coordinators to swap names."

**Disposition: already-covered (matches the draft-roster-edit pattern); two optional enhancements.**

Retained findings: manual override is exactly the "constraint-produced draft roster the coordinator edits" pattern retained in discovery §1 approach 2 — P3 is compatible with the P2 replacement and should be kept verbatim.

Enhancements: (1) swaps should **warn, not block**, on hard-constraint violation (availability mask, required skill) — final say stays human; (2) an audit trail per swap, which doubles as the coordinator-facing record that privacy-limited sharing (P4) requires. Executed check note: no runtime this session, so both enhancements are design proposals only.

User decision: whether coordinator swaps may override soft-fairness outcomes freely (recommended: yes, with logged reason) and whether swaps past a cutoff trigger re-notification (recommended: yes).

## P4 — "Email everyone the full roster."

**Disposition: correction (conflicts with a brief requirement as written).**

Retained findings: the brief requires **privacy-limited sharing**; emailing the *full* roster to every volunteer exposes all contact details and patterns to all 180 people. Primary vendor evidence shows the scoped alternatives are standard product surface: "Advanced Permissions" (access controls), per-audience "Email Messaging" and "Text Messaging", "Mobile App", "Check-In" (S07 — exact feature names).

Correction: per-person schedule emails (own shifts only), coordinator-visible full roster under permission control, and targeted broadcast to affected volunteers only. Reminders: dual channel email + SMS at designated intervals (S07 names both); accessibility honored by offering both channels and machine-readable text rather than image-only content.

Conditions: notification sends must be **decoupled from solver callbacks** — OR-Tools v9.11 documents callbacks slowing search so severely that "search will continue until the time limit is crossed" (S04 known issue; fix trajectory through later releases). Solve, then notify, as separate passes.

User decision: what "roster" means in any shared artifact — names-only directory vs full contact list; evidence cannot decide an organizational privacy norm.

## P5 — "Use local wall-clock timestamps."

**Disposition: rejected as storage representation; corrected to zone-aware timestamps.**

Retained finding + reasoning provenance: **no retained source covers timezone handling** — this correction comes from engineering reasoning, not retained evidence, and is labeled as such (O3 honesty): local wall-clock storage cannot represent DST spring-forward gaps or fall-back ambiguities, mis-orders imported rosters produced in other zones, and makes interval-based reminder scheduling (S07 "sent at intervals you designate") drift across transitions. Correction: persist UTC (or zone-aware datetimes) plus one IANA zone per site; render local at the edge. Uncertain: whether single-site food banks ever cross zones in practice — the imported-roster requirement makes it non-hypothetical, so the cheap fix is warranted regardless.

## P6 — "Test one ordinary week."

**Disposition: correction (keep as smoke test; insufficient alone).**

Retained findings: one week cannot exercise template rollover across weeks, DST boundaries (P5), multi-week fairness drift, or the import path (P1) — none of which an "ordinary" week contains by definition. The discovery validations are all **proposed, none executed** (no runtime available this session; honest per O6): V1 scale probe (180 × 3 × 28, CP-SAT time-to-optimality vs 1% gap); V2 fairness-metric probe (raw-count loadBalance vs availability-ratio caps + spread; compare utilization spread); V3 score-type probe (BigDecimal vs scaled long, testing the S02 score-trap warning); V4 product gap probe (primary vendor pages for recurring auto-assignment + roster import); V5 callback decoupling timing check (reproducing/refuting the v9.11 known-issue shape on v9.15). Executed this session, in full: **source retrieval and static reading only** (recorded per-source in `source-map.json` `observed_operations`, including the N01 404 negative evidence). Proposed test additions replacing/augmenting P6: property test for cap derivation from availability; multi-week fairness drift assertion; import round-trip test; DST-transition notification test; plus P6's ordinary week as the end-to-end smoke.

---

## Optional capabilities (not required by the thin plan, retained for scope honesty)

Attendance-history no-show weighting in allocation (S06 framing, no product evidence of implementation — genuinely novel in the fetched landscape); preference-weight soft objectives (S01); template-level import (P1 correction); scoped directory sharing (P4).

## User decisions ledger

1. Suggestion-only vs authoritative allocation (P2). 2. Swap policy on hard-constraint violation and re-notification cutoff (P3). 3. Roster-sharing content norm (P4). 4. Build-vs-buy, contingent on V4 results and the Timefold commercial-boundary finding (S03).

## Uncertainty register (top items)

CP-SAT behavior at brief scale (S01 shows no limit claim, only toy instances); loadBalance keyed by utilization *ratio* is proposed composition, not documented; `shift_scheduling_sat.py` internals unverified (N01 404s); commercial Timefold constraint contents; quickstart repo publishes no releases, so quickstart version pinning is unevidenced (S03); some release dates lacked years and inferred years are marked unverified (S04); RRULE proposal unevidenced; S06 volunteer-hour figure ($36.14) disagrees with other 2026 sources ($33.49) — recorded, unresolved, immaterial to the dispositions above.

## Obligations coverage (O1–O6)

O1 product/approach discovery: discovery §1 (9+ named platforms, 4 materially different approaches; one primary-verified product page). O2 primary mechanism evidence: discovery §2 (exact APIs, formulas, defaults, limits, applicability; S01/S02/S03). O3 issue/fix/release chains: discovery §3 (OR-Tools #4674/#4677 regression window and v9.11 known issue; Timefold fork evolution 2.0.0→2.7.1 + 1.34.0 maintenance line; explicit absence/inapplicability statements incl. N01). O4: this document, every P disposed with category labels. O5: retained findings inline with conditions/alternatives/disagreement; no bare-ID references. O6: validations split proposed (V1–V5 + test additions) vs executed (static retrieval only), no runtime claimed.
