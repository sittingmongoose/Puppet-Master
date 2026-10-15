# Phase 10 — improvement levers not yet pulled (2026-10-13)

Framing (Jared): dollars/quota are not the metric; same-model wall-time and
token/output volume are the cost proxy, so every lever below is judged as
"more findings / more accuracy / faster at equal concurrency". Ordered
within each group by expected value per unit effort. None of these are
tested yet; each names the cheap test that would settle it.

## More findings (discovery breadth)

1. **Angled discovery prompts instead of one generic prompt.** Phase 9A's
   blind spots were angle-shaped: nobody searched "embeddable libraries for
   retained-mode Rust UI toolkits" or "agent tools with terminal
   handoff". Run 3–4 prompts with explicit angles (category; library
   long-tail; capability donors; failure-first — "what breaks / what do
   users complain about") and union them. Test: same brief, measure
   marginal valid nominations per added angle.
2. **Dry-round termination for discovery.** Iterate nomination rounds
   ("name products NOT already on this list") until two consecutive
   rounds add nothing new. Converts "did we look enough?" from a vibe
   into a stopping rule with a measurable tail. Test: run to dry on
   case3; count rounds and the value of late finds.
3. **Snowball sources.** Products' own comparison/migration docs
   ("migrating from X", "X vs Y"), awesome-lists, and "alternatives"
   pages are pre-built wide nets; host-fetches them and one slice
   extracts candidate names for verification. Cheap, high recall.
4. **Changelog-diff and issue-mining slices (defect history without
   reading everything).** Host-fetches via API: closed issues sorted by
   comments, release notes between two pins, "known issues" docs. One
   slice per repo turns these into pitfall records. This is the
   "issues they had along the way" requirement, mechanized.
5. **Absence slices.** One slice per source asks only: "which of these
   brief capabilities does this source NOT mention?" Negative coverage
   is where unknown-unknowns hide, and absence claims need the
   lint's ABSENCE discipline (searched-for terms recorded).

## More accuracy

6. **Quote-by-construction extraction.** Host pre-segments each cached
   source into numbered chunks; the model returns chunk IDs plus its
   statement, and the host attaches the quote text itself. Verbatim
   quoting stops being a model skill at all — the entire quote-check /
   repair-bounce stage (a real cost in Phases 2–8) disappears, and
   fabricated quotations become impossible rather than caught.
7. **Overlapping slices on high-value cells.** Same matrix cell extracted
   by two different models; host unions claims (dedup by chunk ID from
   lever 6) and routes only contradictions upward. Phase 9C slices were
   single-model per cell; Phase 0–4 data says cross-model disagreement
   is a cheap error detector.
8. **Acceptance-path hunter as pre-grade.** Every late Phase 8 failure
   was one sentence creating an acceptance path (waiver/override) or one
   transferred format claim. A single-pattern flash critic hunting only
   those two classes, run before premium grading, could cut the
   grade→repair→regrade rounds (currently the slowest part: 15–30 min
   per premium grade). Test: run it retrospectively on F4/F5/F12/F13
   frozen candidates and measure recall of the known MEs.
9. **Repair library.** The defect classes now repeat (waiver,
   re-baselining, format→implementation transfer, self-referential
   oracle, conditions dropped in summary cells). Canned per-class repair
   instructions + a host grep pack per class turns each recurrence into
   a one-step fix instead of fresh adjudication. The no-waiver rule is
   entry #1.
10. **Executable evidence slices.** Where a claim is about tool
    behavior, one slice runs the pinned tool (`--help`, a fixture, a
    test from its own suite) and records observed output as the quote.
    Upgrades evidence mode from "docs say" to "observed", killing a
    whole class of doc-vs-code transfers (cf. GLM F13 ME05).

## Faster / cheaper at equal concurrency

11. **Cache records, not just sources.** Extraction records keyed by
    (product, version, question) in a small DB; a second topic reuses
    records whose questions match and only slices the gaps. Phase 9B
    cached sources; this is the step that makes topic #2 actually
    cheaper, and it is measurable (records reused vs newly sliced).
12. **Model routing per slice type.** Observed strengths: DeepSeek =
    most exhaustive extraction, GLM = most precise quotes/versions,
    Luna = best integration diagnostics. Route cells accordingly
    instead of uniform assignment; measure same-cell quality per model
    once, then fix the routing table.
13. **Slice-size auto-tuning.** Host measures claims and conditions per
    slice; cells returning thin results are automatically split finer
    (more MRI slices), dense easy cells merged. Turns slice granularity
    from a guess into a feedback loop, spending contexts only where
    the source is hard.
14. **Mechanical slice-matrix generation.** Build the matrix from the
    source's own table of contents / headings / API surface in code,
    not by a model. Guarantees tiling (every heading belongs to ≥1
    cell) and removes a model context from setup.
15. **Same-model A/B harness as standing infrastructure.** Every future
    change is judged against frozen cases with wall-time, output bytes,
    claims, and checklist scores recorded per model — so "faster"
    claims are measured the way Jared specified, never asserted.
16. **Shared-prefix batching.** Slices over one source share the source
    text as a common prefix; where the provider supports prompt
    caching, batching same-source slices adjacently cuts repeated
    input cost. (Provider-dependent; measure before relying on it.)

## Suggested order

Lever 6 (quote-by-construction) + 14 (mechanical matrix) + 11 (record
cache) restructure the middle of the pipeline and should land before the
end-to-end run; levers 1+2+4 restructure discovery and are testable in
one afternoon on case3; lever 8 is a pure retrospective test on frozen
candidates and can run any time. Everything else is incremental tuning
once the end-to-end chain exists to measure against.
