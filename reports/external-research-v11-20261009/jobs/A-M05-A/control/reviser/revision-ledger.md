# Revision ledger — A-M05-A / control / reviser (ticket 1)

Written 2026-10-09, reviser stage, method M05 v1 retained-investigator. Purpose: enumerate every criticism in
`critic/critique.md` with a preliminary reviser disposition (accept / amend / reject / retain uncertainty), to govern
the final.md rewrite. Dispositions are preliminary until ticket-2 independent checks land; evidence-based, not
automatic obedience. Scope guard: only declared inputs (below) were read; no parent/counterpart/evaluator/history
artifacts; all reviser writes stay under this stage directory.

## Inputs read in full

| Input | Path | Status |
|---|---|---|
| Assignment | `reviser/assignment.md` | read |
| Input map | `reviser/input-map.json` | read (predecessors, source roots, deadlines) |
| Brief | `cases/S05/brief.md` | read (O1–O6; P clauses arrive via `research/revealed-plan.md`) |
| Draft | `research/draft.md` | read |
| Discovery | `research/discovery.md` | read |
| Research source map | `research/source-map.json` | read (SRC-01…09, immutable IDs) |
| Revealed plan | `research/revealed-plan.md` | read (P1–P6 exact text) |
| Critique | `critic/critique.md` | read (M1–M7 material, m1–m6 minor, §5 adjudication table) |
| Critic source map | `critic/source-map.json` | read (SRC-C01…C09) |
| Research source root | `research/sources/` (index.md + SRC-01…09, 10 files) | read |
| Critic source root | `critic/sources/` **does not exist** | see note below |

**Root discrepancy note:** the input-map declares `critic/sources` as a source root, but no such directory exists.
The critic's own `source-map.json` records every `evidence_path` under `critic/notes/` instead
(`verification-verdicts.md`, `claim-inventory.md`), and both were read in full as the critic stage's actual retained
evidence. This is recorded as observed state, not repaired; final.md citations follow the critic's own paths.

## Criticism ledger — one row per criticism ID

Preliminary disposition vocabulary: **accept** (adopt the criticism into final.md as stated), **amend**
(adopt with reviser modification), **retain-uncertainty** (keep the uncertainty flagged rather than resolve), 
**reject** (decline, with grounds). "Verify in T2" = the claim is load-bearing and gets an independent check
against the declared source roots in ticket 2 before final.md commits to it.

| ID | Criticism (compressed) | Preliminary disposition | Basis / action in final.md |
|---|---|---|---|
| M1 | P4 rejection grounds (a) exposure-window and (d) curator-visibility overreach; rejection itself likely stands on (b) fragility + (c) index-removal-is-not-enforcement | **Amend — accept the re-scope, with one nuance:** the 24h exposure window remains a true factual consequence of nightly removal; what overreaches is calling it a defect without a stated latency requirement. Final.md: uphold P4 rejection on (b)+(c)+transparency-design preference; re-express (a) as a quantified condition ("if same-day takedown is required — a user decision — nightly removal is insufficient by construction") and (d) as a design condition satisfied by the P1 internal-index scope. Drives the same replacement architecture (query-time visibility filtering; Mukurtu-style protocols). | Brief says rights *change*, never states enforcement latency; draft's own P1 allows an internal index scope (critique §2 M1, §5). |
| M2 | Draft uncertainties (2) Typesense defaults and (3) RightsStatements hierarchy were resolvable with one fetch each; research stopped at index level; Typesense defaults differ materially from Meilisearch's | **Accept, pending T2 verification of the concrete values.** The completeness-gap reading is fair (the critic's SRC-C08 fetch used exactly the path SRC-08's llms.txt index recorded). Final.md replaces both uncertainty registers with the fetched values (Typesense: num_typos=2, min_len_1typo=4, min_len_2typo=7, typo_tokens_threshold=1; RightsStatements: twelve-statement set) and keeps the genuinely residual parts uncertain: no Typesense numeric-fuzz equivalent surfaced; Meilisearch `≤255` bound unconfirmed (m5); canonical rightsstatements.org site still untested (noted, not hidden). T2 must spot-check SRC-C07/C08 quotes before the values are asserted as verified. | Critique §2 M2; SRC-C07/SRC-C08 evidence paths in `critic/notes/verification-verdicts.md` (C7/C8). |
| M3 | RightsStatements twelve-statement set is evidence-settled; research's 7 observed IDs and the critic's own inventory guess were both incomplete (OOC not defined; NoC-CR in) | **Accept, pending T2 verification of the twelve-ID enumeration.** Final.md states the full set (InC, InC-OW-EU, InC-RUU, InC-EDU, InC-NC, NoC-NC, NoC-CR, NoC-OKLR, NoC-US, NKC, CNE, UND) as repo-TTL-verified at master, drops the "full hierarchy unconfirmed" hedge, and carries the explicit caveats: canonical site untested this session; master is a moving branch pinned by enumeration+date. The critic's self-correction (its OOC prediction was wrong) strengthens, not weakens, the evidence discipline here. | Critique §2 M3; verification-verdicts C7; draft §6.3 being discharged. |
| M4 | P1 correction conflates record-level visibility (P4 mechanism) with field-level sensitivity on public records; the brief asserts restricted *material*, not restricted fields | **Accept.** The conflation is real in draft P1's grounds. Final.md keeps the public-field allowlist as a recommended default but conditions it explicitly on a user decision: which field-level sensitivity actually exists locally (curator notes, donor/rights-holder contacts), since the brief only establishes record-level restriction. Record-level filtering stays P4's mechanism; the two are presented as distinct layers. | Critique §2 M4, §5 P1 row; brief text itself ("restricted cultural material" is record-framed). |
| M5 | Solr/Elasticsearch/OpenSearch family and museum platforms (CollectiveAccess, Omeka S, Islandora) silently absent despite O1; draft §4/§8 claimed alternatives coverage without them | **Accept with scope discipline.** Final.md adds named, disposed entries — no new broad discovery required: Solr/ES/OpenSearch rejected for this scope (JVM cluster ops appetite vs 40k records; capability overlap with the two already-verified engines), stated as candidate-grade reasoning since no primary source was fetched; CollectiveAccess/Omeka S/Islandora acknowledged as museum-domain platform alternatives with their trade-off (platform adoption vs assembling the stack; migration cost from unknown system of record), graded candidate, left as user-decision leads. The engine-choice decision surface is then presented honestly as "discovered universe + explicitly disposed known families." | Critique §2 M5, §6; O1 demands discovery *and* disposition; silence was the defect, not any wrong answer. |
| M6 | V3 (filtered KNN recall on pgvector) listed without its applicability condition — executable only if the engine choice lands Postgres+pgvector | **Accept.** Final.md labels V3 conditional on the Postgres stack and states the corollary: if Meilisearch/Typesense wins, the SRC-02 pgvector chain (incl. the P2 pin) becomes inapplicable background rather than active guidance. Per-item applicability stated for all of V1–V6 (V6's condition already stated; V1/V2 carry the m2 staff-bias note; V4/V5 stack-independent). | Critique §2 M6, §7; O6 applicability requirement. |
| M7 | P3 "captions double as alt text" risks false correction — catalog captions are content-bearing, not written to the screen-reader contract | **Accept with split.** Final.md keeps (i) "captions are content: ride their object's visibility rules" as correction, and (ii) demotes "caption = alt text" to an optional enhancement requiring its own check (alt-text sampling added to the validation set as a proposed item, not executed). Rationale: an unexamined caption-to-alt-text pipeline can produce accessibility theater — long captions read wholesale, or captions that omit what the image visually shows. | Critique §2 M7, §5 P3 row preserves exactly this split. |
| m1 | P5 "rejected" overstates necessity; in-place writes with an audit trail are a known alternative pattern; correction-with-strong-default is accurate | **Accept.** Final.md re-grades P5 as correction with a strong default (attributed, reversible overlay-with-provenance; originals immutable) and names the in-place-with-audit-trail pattern as the known weaker alternative, so the disposition no longer claims logical forcing by the brief. | Critique §3 m1, §5 P5 row. |
| m2 | P6 framing inconsistent: "ten queries cannot discriminate" asserted without sample-size evidence; replacement 30–50 staff-written queries carry the same insider bias imputed to curator favorites | **Accept.** Final.md keeps the uncertainty flag, restates the sample-size point as a design judgment (ten is a floor-of-practicality choice, not a proven insufficiency), and acknowledges the golden set's staff-written bias with the mitigation lead (derive/validate queries from visitor search logs or observed reference-desk vocabulary where such data exists — user-side availability unknown). | Critique §3 m2, §5 P6 row; draft P6/§7 V1. |
| m3 | P2 "pin ≥0.8.4" is a superset pin — iterative scans alone need ≥0.8.0; clarify without changing the pin | **Accept.** Final.md states the layered requirement explicitly: ≥0.8.0 for iterative index scans (the rights-filter under-return fix), ≥0.8.3/0.8.4 for the HNSW vacuum-corruption and vacuum/memory fixes; the practical recommendation stays ≥0.8.4 (and current stable 0.8.7 observed) as a superset, with the reasoning visible so no reader infers <0.8.4 lacks filtered scans. | Critique §3 m3; SRC-02/SRC-C03 chain verbatim. |
| m4 | "Verified" grades quote-accuracy, not source authority (Mukurtu marketing/support pages; Meilisearch learn-guide); keep the distinction visible | **Accept.** Final.md carries one explicit grading note where Mukurtu patterns are recommended: product-documented feature evidence, not deployment-verified behavior — and keeps the same distinction for the Meilisearch learn-guide vs API-reference layers. | Critique §3 m4; verification-verdicts C6 grade note (GR1). |
| m5 | Meilisearch "0 ≤ oneTypo ≤ twoTypos ≤ 255" upper bound not surfaced by the critic's independent API-reference fetch | **Retain uncertainty.** Final.md cites the confirmed part (twoTypos ≥ oneTypo ≥ 0; defaults 5/9) and marks the ≤255 bound as residual sub-claim uncertainty from the learn-guide layer, not contradicted by either fetch. | Critique §3 m5; verification-verdicts C3. |
| m6 | SRC-02 is a mutable master branch; quotes pinned by tag+date (0.8.7 @ 2026-10-01); keep the pin when citing | **Accept.** Final.md citations of the pgvector chain and the RightsStatements TTL carry the tag+date / enumeration+date pins; same discipline for Typesense's versioned 30.2 docs path. No silent rebind; documented redirects (SRC-06/SRC-09) stay as recorded. | Critique §3 m6; both source maps' drift notes. |

Supplementary (not a numbered criticism; tracked to closure): critique §5 P1 hedge "(partially already-covered)" was
checked against the O4 vocabulary and judged legitimate — the keyword baseline *is* partly covered by discovery §3,
with the correction layering on top; final.md keeps the compound label with that reading stated.

## Dependencies carried into ticket 2 (independent checks before final.md)

1. Spot-verify SRC-C07 (twelve RightsStatements IDs, OOC absent) and SRC-C08 (Typesense defaults) quotes against the
   critic's retained evidence paths — these convert two draft uncertainties and gate M2/M3 acceptance.
2. Re-read draft P1/P3/P4/P5 passages against the current critique adjudication so amended text cites the right
   grounds (M1/M4/M7 splits).
3. Confirm no other draft section undermines the "nothing executed" honesty claim (OM7 closure carries into final).

## Deadlines (from input-map, restated for planning)

Stage deadline 2026-10-09T20:23:08Z; arm deadline 20:27:45Z. Protect the last quarter for complete writing/delivery.
