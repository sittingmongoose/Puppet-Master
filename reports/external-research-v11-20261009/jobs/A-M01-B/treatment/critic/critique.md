# Critique — A-M01-B treatment/critic · S07 documentation-portal · M01 coherent-batching

- Block/arm/stage: A-M01-B / treatment / critic. Case S07. Method M01.
- Status: independent critic review of complete own-arm predecessors; no candidate repair beyond assigned recipe.
- Inputs inspected COMPLETE: brief (`cases/S07/brief.md`), `treatment/research/draft.md` (332 lines), `treatment/research/discovery.md` (439 lines), `treatment/research/source-map.json` (S00–S23), `treatment/research/revealed-plan.md` (6 P clauses), `treatment/research/sources/` (index + 10 excerpt files). No campaign/history/evaluator/counterpart read. No nested agents, no repo/canon edits, no installs, no private internals.
- Independent verification window: 2026-10-09T18:36Z–18:38Z via harness `web_fetch` (5 primary pages, all HTTP 200). Usage/billing unobserved (null) throughout.
- Independently re-fetched (byte-identical to research): Docusaurus versioning (93725 bytes, v3.10.2), Docusaurus search (125862 bytes, v3.10.2), Meilisearch typo tolerance (15047 bytes), Pagefind search-config (5988 bytes), Vale `.vale.ini` (14810 bytes). Grep-verified governing defaults against fetched bytes. Full excerpts in `sources/`, locator table in `source-map.json` (C00–C14, immutable).
- No qualified sandbox offered; no runtime witnesses run. All mechanism claims are doc-observed. Validation section separates executed (none here) from proposed refinements honestly.
- Thin plan under audit (exact): P1 "Crawl main branches nightly." P2 "Put every chunk in one vector index." P3 "Answer with the top five chunks and links." P4 "Let maintainers approve suggested rewrites." P5 "Keep old documentation pages separately." P6 "Test by asking maintainers ten familiar questions."

## Summary — per-P verdict audit

| P | Draft disposition | Critic verdict | Effect |
|---|-------------------|----------------|--------|
| P1 | CORRECTION | AGREE on verdict; rationale needs conditioning on U1/U4 | Verdict stands; fix staleness/firewall bullets to conditional |
| P2 | CORRECTION (flat part REJECTED) | AGREE on verdict; two sub-claims unsupported | Verdict stands; downgrade vector-multilingual geometry to hypothesis; fix C6 schema conflation (M2, M4) |
| P3 | CORRECTION + USER DECISION | AGREE | Verdict stands; fix Chain A citation (minor) |
| P4 | REJECTED (mechanism) + CORRECTION (report-only retained) | AGREE on REJECTED as normative brief reading; flag interpretive risk + strike/fence optional carve-out | Verdict stands under draft's brief reading; alternative reading noted and rebutted; carve-out is material weakening (M5) |
| P5 | ALREADY-COVERED + CORRECTION + USER DECISION | PARTIAL DISAGREE on taxonomy; AGREE correction+decision needed | Drop ALREADY-COVERED for P5 clause; fix banner enum to `none/unreleased/unmaintained` (M1, M6) |
| P6 | CORRECTION (kept as signal, replaced as gate) | AGREE on verdict; gate as specified is unexecutable without sampling budget | Verdict stands; bound the stratified matrix (M7) |

No P verdict flips to acceptance. No false REJECTION found (no valid plan clause wrongly rejected). Two false-precision risks found (banner enum M1, C6 schema M4) that would produce invalid config if copied. Three O2 evidence gaps found (linkage M8, export M9, local-search omission M10). Validations are discriminating (O6 met) but need bounding/success criteria (M11).

## Material findings (must fix before build; verdict-blocking precision or evidence gaps)

### M1 — Docusaurus banner enum is wrong: `outdated`/`stable` are not banner values

- Draft claims: P5 correction requires "status banners (unreleased/outdated/stable)" (draft §P5); architecture says "`next`/unreleased bannered"; discovery §2.1 lists `banner: 'unreleased'|...`.
- Verified (C10, grep): `banner`: one of `'none'`, `'unreleased'`, and `'unmaintained'`. "Any version above the latest version would be 'unreleased', and any version below would be 'unmaintained'."
- Impact: copying `outdated` or `stable` into `versions.{v}.banner` produces invalid config. `stable` is a version concept (RTD stable, mike default alias), not a Docusaurus banner. `outdated` appears nowhere in the verified enum.
- Recommendation: replace every banner triple with `none/unreleased/unmaintained`; state mapping explicitly (above latest → unreleased; below latest → unmaintained). Keep `lastVersion`/stable-route discussion separate from banner enum.
- Critic-uncertainty: none on enum; verified verbatim. Whether future Docusaurus adds values is mutable-drift, pinned here to v3.10.2.

### M2 — P2 multilingual-vector geometry claim is unevidenced inference

- Draft claims (P2 "What's wrong" (b)): "multilingual false positives — Meilisearch's own guidance warns typo tolerance causes false-positive matches on massive/multilingual data, and the same geometry argument applies to dense vectors across languages."
- Verified (C12): Meilisearch warning exists verbatim ("Massive or multilingual datasets may be exceptions, as typo tolerance can cause false-positive matches"). Scope is typo tolerance (edit-distance matching), not dense vectors. No vector/embedding source was fetched in S00–S23; no vector engine behavior, dimensionality, or cross-lingual similarity was observed.
- Impact: P2's flat-index REJECTION does not need this claim (version/locale/codebase mixing + C6 + identifier exact-match already decide it), but as written the vector sub-claim presents hypothesis as evidenced consequence. A build team could over-generalize to "vectors unusable multilingually" without evidence.
- Recommendation: downgrade to hypothesis: "Dense-vector cross-language false positives are plausible but unobserved here; no vector engine was sourced. Validate with a cross-locale vector probe before asserting." Retain the lexical typo warning as verified. Do not weaken the flat-index rejection, which stands on independent grounds.
- Where critic demand could be invalid: if reviser already treats (b) as illustrative analogy, this is wording-only. Critic still requires the hypothesis label because draft's "What's wrong" framing reads as established defect.

### M3 — P1 staleness and crawler-inapplicability bullets depend on unresolved U1/U4

- Draft P1 rationale: (b) nightly crawl "stale within hours of a tag" (assumes sub-daily releases); (c) crawler inapplicable behind auth (assumes firewalled).
- Brief says "frequent releases" and "internal"; draft honestly records U1 (public vs firewalled unknown) and U4 (daily vs weekly unknown). If releases are weekly, nightly is fresh; if portal is public, hosted crawler is viable.
- Verified (C11): DocSearch "crawls your website once a week (the schedule is configurable)"; "if your website sits behind a firewall and is not public, then you can run your own DocSearch crawler." So (c) is conditionally correct, not categorically. P1 says "nightly", not "weekly" — conflating P1's nightly with DocSearch weekly default misattributes the cadence.
- Impact: verdict CORRECTION still stands on the version-scoping ground alone (main-only indexing serves WIP; tag-push should define version boundary — verified via C10 current-vs-latest distinction and `includeCurrentVersion` WIP tip). But two of three rationale bullets are conditional, and draft's §1 claim "No finding below is uncertain ABOUT the verdicts" overstates.
- Recommendation: restructure P1 rationale: (a) version-scoping (categorical, decides verdict); (b) freshness (conditional on U4: nightly suffices iff release interval ≫ 24h, else tag-triggered); (c) crawler reachability (conditional on U1: public → hosted crawler viable; firewalled → self-host/static). Fix "weekly" attribution: P1's nightly vs DocSearch weekly are distinct cadences.
- Critic-uncertainty: U1/U4 remain genuinely unknown; critic does not resolve them, only requires conditional framing.

### M4 — C6 conflates Docusaurus/Algolia required schema with generic filter rule; `tags` vs `docusaurus_tag` error

- Draft C6 (condition map): "facet/filter schema (version, language, lang, type, tags — ALL required in index config)". Draft P2 correction: "version+locale+codebase are facet/filter fields (Typesense `filter_by`, Meilisearch filterable attributes, Algolia facets, or Pagefind per-version index + `data-pagefind-filter`)".
- Verified (C11, grep): required Algolia faceting fields are exactly `docusaurus_tag`, `language`, `lang`, `version`, `type` (screenshot + fix steps + "Check your index is recreated with the appropriate faceting fields"). `tags` (bare) is not in the list; `docusaurus_tag` is. `codebase` is not in the Docusaurus required list (multi-codebase is handled via docs multi-instance + per-instance tags like `docs-default-3.2.1`, verified in C11 record examples).
- Impact: a builder copying C6's list into Algolia "Attributes for faceting" would add wrong attribute (`tags`) and miss required (`docusaurus_tag`), reproducing Chain A. Porting the Algolia list verbatim to Typesense/Meilisearch/Pagefind is also wrong: those use `filter_by`/filterable-attributes/`data-pagefind-filter`, not Algolia faceting.
- Recommendation: split C6 into (i) generic rule: version + locale + codebase MUST be filterable/faceted in every engine, default query pins reader context; (ii) product-specific required lists: Algolia/Docusaurus = the verified five; Typesense = `filter_by` fields (declare in schema); Meilisearch = filterableAttributes (declare); Pagefind = author-designed `data-pagefind-filter`. Fix `tags` → `docusaurus_tag` in the Docusaurus list. Add CI check per engine (P-V1 already proposes e2e; add schema-declaration check).
- Critic-uncertainty: Typesense/Meilisearch/Pagefind filter mechanics rely on research S07–S09/S04 (fetched primaries, not all re-verified here); critic re-verified Meilisearch typo (C12) and Pagefind search-config (C13) but not Typesense search API or Meilisearch ranking due to time. No reason to doubt S09/S07 (fetched + grep-verified by research, byte counts recorded); confidence is inherited, flagged in §"Critic limits".

### M5 — P4 REJECTED is correct as normative brief reading, but interpretive risk + optional carve-out weaken C10

- Draft: P4 REJECTED because "rubber-stamp approvals under time pressure ARE silent rewrites with extra steps"; approval gates retained only for human-authored edits; then adds "OPTIONAL, default-off, future enhancement (user decision): a proposal queue where a tool may file explicitly-labeled suggestions."
- Brief constraint: "without silently rewriting documentation." Two readings exist. Narrow reading: explicit approval is not silent, so P4's approval gate satisfies the brief. Draft's broad reading: approval-gated machine rewrites still mutate versioned content outside docs-as-code review and rubber-stamping makes them silent in practice.
- Critic assessment: draft's broad reading is preferred and REJECTED stands, for two independent reasons beyond rubber-stamping: (1) versioning exists to provide per-version review (C10 + P5); a parallel rewrite-approval loop bypasses per-version PR discipline even when clicked deliberately; (2) the report-only alternative is feasible (verified C14: Vale config is report-oriented — `vale sync`, `vale ls-config`, MinAlertLevel suggestion/warning/error, no mutation mechanism in `.vale.ini` docs — supporting "report-only by design" as design inference, though the docs do not contain the literal string "never mutates").
- Why this is still material: (a) draft presents the rubber-stamp prediction as fact; it is a process prediction without issue-chain (draft honestly admits "no issue-chain was needed" — good — but should label the prediction as prediction). (b) The optional proposal-queue carve-out contradicts the hard REJECTED posture: once a suggestion pipeline exists, even default-off, it reintroduces the exact mechanism C10 forbids and invites quiet enablement. "Recorded only so a future request cannot claim it was never considered" is scope creep that weakens the gate P-D1 is meant to enforce (git-clean assertion).
- Recommendation: keep REJECTED; add one paragraph acknowledging the narrow reading and rebutting it on versioning-bypass + feasibility grounds (above); strike the optional proposal queue from this scope entirely (or fence as "rejected in this scope; any future proposal requires a brief amendment, not a user decision"). Label rubber-stamping as predicted failure mode, not observed fact. Soften "Vale never mutates" to "Vale `.vale.ini` docs expose no mutation mechanism; observed workflow is report-oriented (sync/ls-config/alert levels) — report-only by configuration."
- Where critic demand could be invalid: if stakeholders insist the narrow reading is intended (explicit approval suffices), then P4 becomes CORRECTION (route suggestions through normal PR path with diff/provenance) rather than REJECTED. That requires explicit brief adjudication (draft's U7/Q7 already demands this — correct). Critic does not resolve U7; it requires the adjudication gate stay blocking.

### M6 — P5 triple verdict overuses ALREADY-COVERED; user-decision model needs fencing

- Draft P5: "ALREADY-COVERED in principle + CORRECTION in precision + USER DECISION on model."
- Problem: O4's "already-covered" should mean discovery already specified the mechanism the P clause names. P5 names nothing ("separately" underspecifies URLs/trees/indexes/switcher/banners/robots/redirects/backports — draft's own correct list). Discovery's four models (a)–(d) are covered as *options*, but P5 as a plan clause selects and specifies none. Calling vague intent "already-covered in principle" stretches the category and lets a future reader claim P5 was fine.
- Recommendation: verdict CORRECTION + USER DECISION (drop ALREADY-COVERED for the clause); keep "four models already discovered (O1)" as provenance, not as coverage of P5. Add fencing: exactly one hub model must be chosen (Q1); (c)/(d) require explicit acceptance of stated costs (no versioned PRs / vendor-owned semantics); (b) Antora requires ref-hygiene owner; record choice before retrieval build (P-V1 depends on hub URL/index shape).
- Banner fix is M1 (same P5). No verdict flip; taxonomy + fencing only.

### M7 — P6 replacement gate is combinatorially unbounded and uncosted

- Draft corrected P6 sampling rule: "per (version, locale, codebase) × (in-scope, cross-version, untranslated, adversarial/negative) instead of 'ten familiar.'"
- Problem: with V versions × L locales × 3 codebases × 4 case types, V=5/L=3 already yields 180 cells as a *gate*. No sampling budget, no minimal-viable subset, no pass thresholds. This replaces an undiscriminating gate (ten familiar questions) with an unexecutable one.
- Recommendation: keep CORRECTION verdict; bound the gate: (i) minimal gate = stable + previous version × default locale + one non-default locale × 1 codebase smoke + full 3-codebase on release; (ii) full matrix = scheduled (nightly/weekly), not per-PR; (iii) per-cell assertions already in P-V1/P-L1/P-C1, plus explicit sampling budget (e.g., 20 citation audits per P-C1, 3 injected conflicts per P-D1). Define gate vs scheduled split in build plan.
- Where critic demand could be invalid: if build team has automation budget for full matrix per-PR, bound is unnecessary — but draft provides no cost model, so bounding is required until costed.

### M8 — Code/doc linkage has zero primary sources (O2 gap)

- Discovery §1.5/Q-linkage names TypeDoc/rustdoc/JSDoc/Doxygen/Sphinx-autodoc/godoc, OpenAPI Redoc/Scalar/Stoplight/Fern, Sourcegraph/ctags/LSIF-SCIP, version-pinned snippets (code-from-file, literalinclude), per-release CI rebuild. Zero S-IDs attached; no defaults, units, version-pinning mechanism, or snippet-test behavior observed. S20 (Mintlify/Fern) is secondary-snippet, provisional (U5).
- Impact: draft §2 linkage architecture (per-tag reference, OpenAPI-as-contract, (repo,tag,path,symbol) links, snippet-import with CI rebuild) is plausible but unevidenced. O2 requires "consequential primary source/code behavior and governing defaults" for selected mechanisms — linkage is selected (governs C1/C3/C4/C11) but unobserved.
- Recommendation: before build, source at least: (1) one extractor's version-pinning/output contract (e.g., TypeDoc options or Sphinx literalinclude version behavior); (2) OpenAPI render/versioning (Redoc or Scalar version handling); (3) snippet-import staleness detection (one CI pattern). Until then, mark linkage architecture provisional with the same U5-style qualifier Starlight/Mintlify already carry. Do not block P verdicts (linkage does not decide any P), but block linkage build.
- Critic-uncertainty: critic did not have time to source linkage independently either (deadline); this is a gap report, not a competing design.

### M9 — Export/migration contracts unevidenced (O2 gap)

- Draft/discovery assert: `docslit import` Mintlify→DocsLit path, `llms.txt`/agent surfaces, static+PDF/ePub matrix, `openapi.yaml` + index-dump diff for recall regressions. No S-ID for docslit, llms.txt spec, PDF tooling, or index-dump feasibility. "Re-import Markdown into a second generator" (P-M1) is asserted without lossiness rubric (admonitions, includes, JSX, AsciiDoc↔Markdown lossiness correctly noted as lossy in discovery §1.6, but then P-M1 proposes round-trip without fidelity criterion).
- Recommendation: mark export architecture provisional; before build, source llms.txt convention + one converter path + one PDF path; define P-M1 fidelity rubric (must-preserve: headings/links/code/version-badges; may-drop: theme chrome; measure: index-recall delta on dumped JSON). Do not block P verdicts; block export build.
- Where critic demand could be invalid: if export is explicitly out of MVP build (brief lists "migration/export options" as research, not necessarily build), then provisional status suffices and P-M1 becomes scheduled, not gating. Critic requires the scoping decision be recorded.

### M10 — Omission: Docusaurus Local Search (community) never evaluated despite deciding C12 axis

- Verified C11/S02 excerpt: Docusaurus search options include "community: Typesense DocSearch, local search, custom SearchBar" alongside official Algolia. Discovery §1.2 evaluates Algolia/Typesense/Pagefind/Meilisearch/Typesense/Lunr-Orama-FlexSearch but never evaluates Local Search (offline, client-side, no crawler, no service) as a distinct option.
- Impact: for the firewalled-internal branch of U1/C12, Local Search competes directly with Pagefind (zero-service/static) and undercuts the "crawler vs engine vs static" trilemma framing (decision axis §1.2). If Local Search provides version-scoped client-side search without Pagefind's hand-built cross-version UI cost, the Pagefind-vs-engine trade-off (§6) is incomplete. This is a genuine O1 omission on the brief's most constraining axis (internal portal).
- Recommendation: reviser should add Local Search spike (version-scope behavior, index size at 60-person/3-codebase scale, multilingual/tokenizer behavior) or record explicit exclusion rationale (e.g., "excluded because X, sourced"). Do not assume Pagefind dominates zero-service without comparing.
- Critic-uncertainty: critic did not source Local Search either (deadline); reports omission, does not assert Local Search superiority.

### M11 — Validations are discriminating (O6 met) but need bounding and success criteria before they gate

Critic agrees O6 is met at research stage (executed vs proposed honestly separated; no runtime pretense). For build gating, each proposal needs the stated tightening; none is rejected:

- P-V1 version-facet e2e: add index-reset discipline (Chain A fix required delete + recrawl; test must control stale index, not just query). Assert disjoint top-hit version tags AND facet-schema presence.
- P-V2 crawler/auth probe: DocSearch hosted crawler requires application/eligibility; probe may block on process, not tech. Add local-crawler dry-run as parallel probe. Settles U1/C12 only if both attempted.
- P-L1 locale matrix: requires U3 (locale set) to bound; needs fixtures (CJK queries, IME flows, cafe/café pairs), not just queries. `exactDiacritics` behavior verified (C13); tokenizer adequacy still needs per-locale measurement.
- P-T1 typo A/B: 5/9 vs 4/7 are different engines (Meilisearch vs Typesense), not configs on one engine. Split into (a) per-engine threshold sweep (e.g., Meilisearch 5/9 vs 4/10; Typesense 4/7 vs 5/9) and (b) cross-engine comparison with engine held constant per arm. Otherwise conflates engine choice with threshold choice. Identifier fixtures (`v2.1.0`, `getUserById`) are correct.
- P-R1 ranking placement: sound; keep words-right-to-left order-swap cases (Meilisearch; verify analogous Typesense/Pagefind behavior separately, do not port).
- P-C1 citation audit: define excerpt→passage identity rule (exact substring vs whitespace/diacritic-normalized? version-pin + permalink freshness checks are correct). 20 samples need inter-rater rule if manual.
- P-D1 contradiction drill: Vale house rules must be authored before drill can run (rules don't exist yet); separate rule-authoring milestone from drill. Git-clean assertion is correct C10 enforcement — keep.
- P-M1 export round-trip: needs fidelity rubric (see M9); index-dump diff needs recall-regression threshold, not just "diff."
- E1–E4 executed checks: E1 (10+2 fetches, grep-verified) consistent with source-map; critic re-verified 5/10 primaries byte-identical, supporting E1. E2 (freeze.json) and E3 (pre-reveal discipline, 331-byte plan file, reveal at 18:31:20Z) rely on freeze/reveal artifacts critic is forbidden to read (campaign boundary) — inherited trust, not doubt; mark as unverified-by-critic. E4 (no runtime) honest.

## Minor findings (wording, citation hygiene, epistemics; fix opportunistically)

- m1 — C3 "WIP exposed by default" needs route qualification. Verified (C10): current at `/docs/next`, latest at `/docs`; current labeled Next by default. WIP is reachable but not at default `/docs`. Rephrase to "current/WIP built and reachable at `/docs/next` by default; `/docs` serves `lastVersion`." Also `includeCurrentVersion`/`lastVersion`/`onlyIncludeVersions` defaults (true / versions.json[0] / all) were research "cross-checked via snippets", not grep-verified in fetched bytes; critic grep confirms keys + banner enum + switcher but not default values in page body. Cite plugin-options table or soften to "observed default per plugin docs (snippet-cross-checked)."
- m2 — P3 Chain A citation conflates failure modes. Chain A is facet-schema drift (zero/wrong-version due to missing faceting attributes); P3's empty-result problem is in-scope emptiness with correct schema. Fallback UX ("no results in v2.1 — search all versions?") is still correct, but cite Chain A for schema discipline (P-V1), not for P3's k/excerpt problem. P3's own rationale (ranking without pinned scope, unpinned permalinks, no excerpt contract) stands independently.
- m3 — P2 "pure-vector retrieval cannot express [typo-off-on-fields]" overstates. Vectors + metadata filtering / hybrid pipelines can implement field-scoped behavior; the issue is P2's *flat unpartitioned* design, not vectors per se. Rephrase to "P2's flat vector-only design as specified provides no field-level typo/exact-match control."
- m4 — Pagefind `excerptLength` unit ambiguous. Verified (C13): "maximum length for generated excerpts. Defaults to 30." No unit stated. Research excerpt honestly notes "words/chars"; draft should carry the ambiguity ("30 (unit unstated in docs; verify tokens vs words vs chars before tuning)") rather than asserting.
- m5 — `diacriticSimilarity` cited from truncated page (research S05 excerpt notes "exact page truncated"). Draft C7/C8 leans on it lightly; either fetch full ranking page section or mark as partially observed.
- m6 — Typesense defaults (4/7, `max_candidates=4`, synonym v27 defaults, facet strategy) rely on research S09/S18 (S09 fetched 156k + grep-verified; S18 snippet-only). Critic did not re-verify due to deadline; no reason to doubt S09, but confidence is inherited. If Typesense is selected (recommended default), re-verify `max_candidates`, `default_sorting_field` truncation interaction, and v27 synonym defaults against pinned release before build. Same for Meilisearch ranking (S07, not re-fetched here) if Meilisearch selected.
- m7 — Chain A generalization ("same shape recurs in Typesense/Meilisearch/Pagefind filter gaps") is analogy without issue-chains. Label as hypothesis; P-V1 already validates it. Do not present as established.
- m8 — Chain B S17 (IME commit 50641b0) is snippet-only (research honest); S16 CHANGELOG fetched. Inherited confidence; re-verify if locale matrix weights CJK/IME heavily (depends on U3).
- m9 — Draft §1 "No finding below is uncertain ABOUT the verdicts" overconfident given U1–U4 conditionals (M3). Rephrase to "Verdicts stand under stated conditions; rationales for P1/P2/P5 depend on U1/U4 as noted."
- m10 — O1 secondary options (Starlight, Mintlify/Fern, RTD, textlint, Sphinx) correctly flagged provisional (U5) — good practice, keep. Antora (hub candidate b) has single S10 fetch (mutable latest), no issue-chain (honestly noted as "not observed, not safe") — thin for a recommended default tie; flag as thinner than Docusaurus evidence if (b) selected.
- m11 — `prefix` default true marked "(inferred)" in research S09 excerpt — honest; ensure draft/build docs carry the qualifier until verified.
- m12 — Contradiction-drill rules presuppose house-style authoring (see P-D1 in M11); also markdownlint/lychee patterns (S22) are snippet-level provisional — re-verify MD013/MD033 exclusions and lychee cache/accept-codes against pinned configs before CI gates on them.

## Omissions register (beyond M8–M10)

- O-A (material, = M10): Local Search option unevaluated.
- O-B (material, = M8/M9): linkage/export O2 sourcing gaps.
- O-C (minor): No per-engine `default_sorting_field` (Typesense) vs `sort`-placement (Meilisearch) vs Pagefind weight-profile comparison table; P-R1 proposes the experiment, but a pre-build expectations table (which engine favors recency vs relevance by default) would sharpen it.
- O-D (minor): No robots/canonical/redirect mechanics sourced beyond naming (`noIndex` per-version verified via C10; `canonical_version` via mike S12 snippet; `@docusaurus/plugin-client-redirects` named but unsourced). P5 correction requires these; source before build or mark provisional.
- O-E (minor): Backport discipline (which versions accept doc PRs, Q5) correctly deferred to user decision; no finding, but note it interacts with Docusaurus snapshot duplication cost (V×L build growth) — the cost model for V snapshots is asserted qualitatively, not quantified. If V large (frequent releases + long support), quantify build/index growth before choosing (a) over (b).

## False-correction / false-rejection audit

- No false REJECTION: every REJECTED element (P2 flat unpartitioned index; P4 rewrite-suggestion loop) is correctly rejected under brief constraints + verified evidence. P4's alternative (narrow) reading is noted and rebutted in M5; it does not flip the verdict without a brief amendment.
- No false CORRECTION: every CORRECTION identifies a genuine defect (P1 main-only/WIP-default; P2 unpartitioned mixing + missing citation identity; P3 unpinned scope/links/excerpts; P5 underspecification; P6 biased sample). M3/M4/M6 require rationale/taxonomy fixes, not verdict reversals.
- One permissiveness risk (opposite direction): P4's optional proposal-queue carve-out (M5) and P5's ALREADY-COVERED label (M6) both soften correct verdicts. Critic recommends hardening, not softening.
- Critic self-check: critic's own demands most at risk of invalidity are M5 (if brief intends narrow approval reading — requires U7 adjudication, already gated by draft Q7) and M7 (if full-matrix-per-PR is costed and funded — requires cost model draft does not provide). Both are framed as conditional, not absolute.

## Validation applicability (O6)

- Executed vs proposed boundary: honest. Research E1–E4 make no runtime claims; draft §8 preserves the boundary. Critic executed no witnesses (no sandbox) and claims none.
- E1 support: critic byte-identical re-fetch of 5/10 primaries (C10–C14) corroborates research fetch integrity; remaining 5 primaries + snippet-only S13/S15/S17–S23 inherit research provenance (byte counts + grep notes recorded). No integrity doubt raised.
- E2/E3: unverified-by-critic due to campaign-read boundary (freeze.json, plan-file listing, reveal timestamp). Not doubted; marked as boundary, not gap.
- Proposed P-V1..P-M1: all discriminate named decisions; all applicable to this small-product scope (not unlimited production guarantees — correctly scoped). Tightenings required are in M11; none requires new validation concepts, only bounding/criteria. Priority order for build: P-V2 (settles U1/C12 hub/crawler choice) → P-V1 (schema/scope) → P-T1 (engine/threshold, split per M11) → P-L1 (needs U3) → P-C1/P-D1 (need fixtures/rules) → P-R1 (tuning) → P-M1 (needs rubric; scheduled, not gating unless export is MVP).

## Uncertainty carried forward (critic additions to U1–U7)

- U1–U4 (hosting, languages, locales, cadence): unchanged, still deciding. Critic adds: P1 rationale must stay conditional until U1/U4 answered; P-T1/P-L1 cannot run until U2/U3 bounded.
- U5 (secondary-snippet provisional): unchanged; critic extends provisional label to linkage/export (M8/M9) and S22 CI patterns (m12).
- U6 (textual-vs-semantic contradiction mix): unchanged; critic adds: P-D1 drill only validates textual/link layer; semantic-conflict recall has no proposed metric — correctly left to human review, but do not imply drill coverage exceeds textual.
- U7 (P4 attachment): unchanged and still blocking for P4's alternative reading (M5). Critic adds: any future proposal-queue request requires brief amendment, not silent user-decision enablement.
- U8 (new, critic): Typesense vs Meilisearch default-characterization confidence is asymmetric in this review (Meilisearch typo re-verified C12; Typesense inherited S09). No action unless engine selected, then re-verify selected engine's governing defaults against pinned version.
- U9 (new, critic): Local Search (O-A) behavior unknown; blocks zero-service decision completeness until spiked or explicitly excluded.

## Method compliance (critic)

- M01 coherent-batching: single critic, full scope (all P + conditions + validations) in one pass, shared condition-map audit (§M4/C6) + per-P verdicts. Same critic/reviser continuity is for later stages; this critique preserves per-question traceability via M1–M11 + m1–m12 + O-A–O-E.
- No premium evaluator access; no candidate repair (recommendations only, no draft edits); no nested agents; no repo/canon edits; no installs; no private provider internals.
- Predecessor discipline: discovery frozen pre-reveal (inherited, unverified-by-critic per boundary); draft post-reveal complete deliverable (inspected complete); this critique does not rewrite predecessors.
- Science saved before native Goal terminal completion; after terminal only mechanical delivery.

## Critic limits (honest)

- Time-boxed to stage deadline (review + 5 independent fetches + writing in ~10 minutes); Typesense search API, Meilisearch ranking, Antora, mike, Pagefind indexing/ranking, and issue/changelog primaries were NOT re-fetched. Confidence in those rests on research S04/S05/S07/S09–S12/S14/S16 (fetched + byte-counted + grep-noted) and snippet-only S13/S15/S17–S23 (honestly marked provisional where secondary). Byte-identical re-fetch of 5/10 primaries with matching versions (Docusaurus 3.10.2, Pagefind 1.5.0 banner, Vale v3.22.0+ note) supports research fetch integrity; no fabrication indicators found.
- No sandbox witnesses; no code execution; no config validation runs. Proposed tightenings (M11) are honestly proposed, not executed.
- Freeze/reveal/campaign artifacts not read (boundary); E2/E3 inherited.
