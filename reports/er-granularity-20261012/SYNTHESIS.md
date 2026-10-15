# ER granularity pilot — synthesis (2026-10-13; Phase 8 addendum below)

> **Update (Phases 6–8, same day):** the "one identified, untested missing
> stage" below (acceptance/oracle design) was built and tested as pipeline
> v2 and **all three flash models now pass the fresh A8-01 case under
> double blind grading** (PASS_WITH_LIMITATIONS, 35–36/40, conditions 8/8,
> zero material errors). The original synthesis text is preserved as the
> Phase 0–5 record; the Phase 8 addendum at the end supersedes its Answer.

Question: can the planning-wizard external-research process run on
flash-class models — much faster and cheaper — without quality loss, using
small single-question Goals and tolerant output normalization? Tested on two
frozen ER12 snapshot cases (A5-02 crate labels; A8-01 exhibition deposits)
with three flash routes: `gpt-6-luna` Max (Codex, `codex_gmail`),
GLM-5.3-Flash Max (zcode), DeepSeek V4.1 Flash High (OMP/OpenCode Go).
`gpt-6.1-sol` Max was orchestration and blind grading only; its cost is never
counted as candidate cost. No canonical Plans were edited; nothing landed.
Detail: `RESULTS.md` (Phase 1), `PHASE2-RESULTS.md`, `PHASE3-RESULTS.md`,
`PHASE4-RESULTS.md`, `PHASE5-RESULTS.md`, `PHASE0-SMOKE.md`, `RUN_LEDGER.md`.
Sandbox: `~/PM-Experiments/er-granularity-20261012/`.

## Answer

**Partly — and the boundary is now precise.** Flash models reliably do the
bottom two-thirds of the job when tasks are bounded: discovery nomination,
extraction with verbatim quotes and conditions, entailment checking, and
condition-faithful integration *when carriage is host-enforced*. They do not
yet reliably do the top layer: composing acceptance gates — first naming
exact values (fixed by a dedicated repair packet, Phase 3), then designing
what those gates compare against (failed by all three models on a fresh
case, Phase 4). Two of three models produced a strict pass on the tuned
case; zero of three passed on the fresh case. The process below is therefore
a tested skeleton with one identified, untested missing stage — not a
production recipe yet.

## Evidence by phase

| Phase | Test | Result |
|---|---|---|
| 0 | 1-source extract/verify atoms, condition trap | All 3 models 4/4; quotes 37/38 verbatim. Only Codex/Luna reported a native Goal tool |
| 1 | Monolith vs 5-packet chain, same bundle, blind grades | 0/6 pass both shapes. Packets retained conditions better (5.7/8 vs 4.3/8); integration dropped the `e()` escaping limit 6/6 despite records containing it |
| 2 | + host conditions checklist, quote check + repair bounce | 0/3 pass, but escaping 3/3, conditions 7.0/8 avg, zero invented quotes. Residual: gate sentences admit wrong values; one failure traced to missing host provenance stamp |
| 3 | + provenance stamps, gate-composition repair packet | **Luna and GLM PASS_WITH_LIMITATIONS** (first strict passes); DeepSeek fails on unrelated pre-existing claim errors. Conditions 8/8 all arms |
| 4 | Full winning shape, fresh case A8-01 | **0/3 pass.** All fail acceptance-oracle design (self-referential gates, no collision screen, incomplete offsite-restore protocol). Diagnostics: Luna 25/40, GLM 23/40, DeepSeek 15/40 |
| 5 | Brief-only live-web discovery, 1 Goal/model | All nominate the right products/standards (union 4/4 families) in 3–9 min. None pins released versions; 0/3 find product-internal defect history unprompted |

## What is actually established

1. **Bounded questions beat whole-report assignments for evidence work.**
   The within-model contrast is the cleanest signal of the pilot: Luna's
   monolith missed the F1 mechanism entirely; the same model in an
   extraction packet captured it exactly. Extraction at flash grade is
   effectively solved (35–123 claims per arm, conditions attached).
2. **Free-prose integration is where quality dies, in every shape.**
   Every Phase 1 final dropped a condition its own records held. The fix is
   mechanical, not rhetorical: a host-generated checklist of the arm's own
   extracted conditions, each required in prose or explicitly N/A'd. That
   moved condition retention from 5.7/8 to 8/8.
3. **Exact quotes prevent fabricated quotations — nothing more.** The host
   checker plus one-sentence repair packets eliminated invented quotes
   (Phase 2–3), and GLM's Phase 4 final checked 20/20 verbatim. Fabricated
   *implications* of real quotes remained the dominant error class
   throughout, exactly as the counter-response predicted.
4. **Each newly fixed layer exposes the next.** Facts → carriage → gate
   composition → gate epistemology. This progression, not any single
   verdict, is the pilot's main product: it tells us the failure stack is
   finite and each layer so far yielded to one small dedicated stage.
5. **Discovery is cheap and good at nomination, bad at pinning.** It needs a
   separate host fetch/pin stage (pinned released code + issue-tracker
   search inside chosen repos) before extraction.
6. **Costs observed (wall time and contexts only — no billing data):**
   discovery 1 context, 3–9 min; extraction packets minutes each; a full
   passing chain on A5-02 was 6 candidate contexts. Packet chains are
   *slower* than monoliths per case (GLM ~48 min vs ~10), so the cost case
   rests on flash-model pricing/quota, which this pilot did not measure.
   DeepSeek was fastest and most exhaustive in extraction; GLM slowest,
   most precise quotes; Luna best diagnostics on both cases' finals.

## Recommended process shape (tested parts marked)

1. **Discovery Goal** (brief only, preserve-don't-rank) — tested, works.
2. **Host fetch/pin stage** — resolve nominations to pinned released code /
   versioned standards; bounded issue search per chosen repo — *required by
   Phase 5 evidence; implemented by hand in this pilot, not yet as a
   reusable stage.*
3. **Extraction packets** (one source family per Goal; claim + verbatim
   quote + conditions; host provenance stamp on every record) — tested,
   works.
4. **Comparison packet** (records × plan clauses) — tested, works.
5. **Host conditions checklist + integration packet** (every KEY condition
   carried in prose or N/A with reason; verbatim-or-paraphrase quote rule;
   host quote check with repair bounce) — tested, works.
6. **Gate-composition repair packet** (acceptance rules must name exact
   selected values; imported guidance scoped as guidance/PROPOSED) —
   tested, works.
7. **Acceptance-design packet** — per gate: name the oracle, prove its
   independence from the artifact under test, screen known blind spots,
   specify the complete bounded protocol including failure retention —
   **identified by Phase 4, not yet tested.** This is the next experiment,
   one small stage on the existing frozen A8-01 records.
8. **Grading/qualification stays premium and separate.** Single-grader
   verdicts showed real variance (same text, different material findings
   across runs); condition-retention counts were far more stable. Use two
   graders or treat one strict verdict as a noisy oracle.

## Not established

- Repeatability: one run per arm per case, two cases total.
- Dollars/quota: no attributable billing or subscription-window measurement
  was made; "cheaper" is argued from model class, not measured.
- End-to-end chain: discovery → pin → extract was never run as one unbroken
  pipeline (Phases 1–4 held the bundle host-supplied by design).
- Native Goal semantics on zcode/OMP: neither harness reported a Goal tool;
  workers ran on the delegated prompt as the goal. A production "every
  prompt is a Goal" rule must accept that or supply a broker.
- Gold strictness calibration is Jared's call, flagged at each phase: the
  `e()` escaping detail as material (case 1), any non-verbatim quoted word
  as material, and GOLD2's synthesized independent-oracle requirement
  (case 2). No verdict in this pilot flips on any one of these alone,
  but they set where the pass line sits.

## Phase 8 addendum — the missing stage, built and replicated

Phases 6–8 (`PHASE6-RESULTS.md`, `PHASE7-RESULTS.md`, `PHASE8-RESULTS.md`)
closed the acceptance-design gap with three added components, then
replicated the full pipeline v2 on all three models:

1. **Host-written skeleton before integration** — gate table with a
   mandatory oracle column and blind-spot/screen column, a mutation table
   (seeded from adversary output, never from gold), and evidence-mode
   wording rules. This forces oracle design at draft time instead of
   repairing it after the fact.
2. **Cross-family defect hunting** — single-pattern flash critics plus
   dual-direction adversaries (wrongly-accepted *and* wrongly-rejected),
   host-adjudicated, repaired in bounded patches with a host diff audit.
   Adversarial generation beat review-style criticism for acceptance
   design.
3. **Double blind grading as protocol** — four split verdicts occurred;
   every split-FAIL was a genuine single-sentence material error the PASS
   grader missed. Split = FAIL-and-repair. A single PASS is not accepted
   as evidence at this strictness.

Final results (fresh case A8-01, Phase 4 records reused, Sol Max blind
graders): Luna 36/40 + 36/40, DeepSeek 36/40 + 35/40, GLM 36/40 + 36/40 —
all PASS_WITH_LIMITATIONS, conditions 8/8, zero material errors, no
premium model anywhere in a candidate chain. Cost shape: ~12–14 small
flash candidate contexts per arm beyond the 5-context record chain;
premium cost exists only in grading (experiment overhead). One standing
repair rule proved load-bearing across three arms: **never convert a
rejection into an acceptance** (no overrides, waivers, re-baselining, or
supersession — legitimate paths go through separately gated successors
while the original mismatch stays failed/unresolved).

Still unproven (unchanged honesty list): the unbroken end-to-end chain
(live discovery → host fetch/pin → records → v2 loop) has never run as
one pipeline — that is the next experiment; repeatability is one run per
arm on one fresh case; dollars/quota unmeasured; proposed local tooling
in the finals is unbuilt/unqualified; native Goal tool exists only on the
Codex route. The pipeline is now a demonstrated process on frozen
snapshots, ready for the end-to-end fresh-case test before any run
against the real Puppet Master plans.
