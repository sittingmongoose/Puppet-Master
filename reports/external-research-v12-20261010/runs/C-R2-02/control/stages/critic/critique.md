# Independent critic review — C-R2-02-control

Reviewed: 2026-10-10, within the critic stage window.  
Disposition: **Return for revision before claiming full alignment with the released plan.** The proposal is methodologically careful and honors the brief’s core boundaries, but it does not yet provide the plan’s explicit multiple-public-index comparison, and its own equal-time comparison is contradicted by the timetable.

## Scope and checks performed

I read the full original brief, investigator `discovery.md`, `draft.md`, `source-map.json`, `revealed-plan.md`, `plan-reveal.json`, and the carried `sources/index.md). The released-plan receipt’s SHA-256 and byte count match `revealed-plan.md` (05b07646a51d90cfe102deabf5b52dab894ce633469a62455d3f70a351abe374; 6,612 bytes); the discovery hash and byte count also match its receipt (ef9e2d003e66e95137b44825f881ed21f304b8a3d43e37af0eba667426aeab00; 10,313 bytes).

I independently checked primary documentation for PRISMA-S, Cochrane Chapter 4, OpenAlex search and synchronization, Crossref’s API and relationship schema, Zotero duplicate detection, and ASReview v3.0.8. Directly observed source checks and their conditions are in [source-map.json](source-map.json) and [sources/index.md](sources/index.md). The TARCiS publisher page and two urban-heat-review publisher pages were inaccessible or did not expose their content; I did not treat the indexed excerpts as full-text verification.

No urban-heat intervention query, portal search, citation search on a case seed, screening, identity adjudication, or outcome analysis was executed by the investigator or by this critic. The public web checks here were method/tool-source checks only. The protocol’s future validations remain proposals, not results.

## Material issues

### C-01 — Material incomplete: the public-index comparison is not an assigned arm

**Locations:** `discovery.md`, “Candidate retrieval routes” 1–2; `draft.md`, “What each discovery route can reveal,” routes A–C; “Traceability and exact clause disposition,” released-plan clause about multiple public indexes.

The revealed plan explicitly includes “multiple public indexes” among the useful alternatives. The draft compares baseline and expanded queries on the same selected platform(s); it permits a second index for citation searching only “if available.” Discovery likewise makes an accessible subject database conditional and describes two indexes as preferable only when both are available. There is no defined comparison of the same search across two public indexes, nor a stated index-level outcome. The traceability row’s “Accepted” disposition therefore overstates what the protocol specifies (see C-03).

This leaves index-specific missingness confounded with query-vocabulary effects and does not fulfill the released-plan alternative as written. Platform availability is unresolved in the brief, so the evidence does not establish which index should be selected; it does establish that this comparison is currently optional rather than part of the planned design.

**Evidence:** [revealed plan](../investigator/revealed-plan.md), “Meaningful useful alternatives”; [OpenAlex search documentation](https://help.openalex.org/api/searching/) supports distinct scoped searches, but does not itself supply the missing comparative arm.

### C-02 — Material incomplete: effort allocation contradicts the equal-time claim

**Locations:** `draft.md`, “Recommendation”; “60-minute discovery pass and subsequent screening,” timetable.

The recommendation promises “four routes under equal, logged retrieval time.” The timetable gives A 05–17 and B 17–29 (12 minutes each), then C 29–41 and says at 41–53 to “Complete route C portal/manual search” while also capturing D. On its face, C receives another 12 minutes (24 total), while D shares that last interval. D’s pre-run curated-list preparation is also not included in a clearly bounded effort amount. The route yields per retrieval hour and comparison of discovery efficiency would therefore not be comparable as written.

The draft correctly says time allocation must be set before results and that screening time is separate. Those safeguards do not resolve this internal allocation conflict.

### C-03 — Material wrong: the traceability table marks the multiple-index clause accepted

**Location:** `draft.md`, “Traceability and exact clause disposition,” row “Released-plan clause: compare query changes, multiple public indexes, citation following, repositories, and curated sources without prespecifying a winner.”

The row says “Accepted,” but no multiple-index search comparison is specified (C-01). This is a materially inaccurate disposition of the proposal’s own coverage against the exact released plan. It should remain open until the proposal actually accounts for that opportunity or explicitly records its unresolved availability; this review does not choose the platform or rewrite the proposal.

## Other evidence qualifications

### C-04 — Minor locator/wording: OpenAlex search defaults need a parameter-specific description

**Location:** investigator `source-map.json`, S06 `governing_condition_default_exception`; related discussion in `draft.md`, routes A–B and OpenAlex identity/history passages.

The source record says the “Default search includes title/abstract/keywords” without naming the request form. The current official documentation distinguishes `search=` (which can search title, abstract, full text, and keywords), `search.title_abstract_keywords=`, and `search.title_and_abstract=`; relevance reranking is another option. The draft’s advice to preserve exact URLs, parameters, and query mode is sound, but the source record’s unqualified “default” is not enough to reproduce the governing field scope. See [OpenAlex search documentation](https://help.openalex.org/api/searching/), especially “What gets searched” and “Rerank.”

### C-05 — Honestly unresolved external input: prior-review excerpts are not full-text checked

**Locations:** `draft.md`, “A useful prior urban-heat search example”; “Implementation and applicability”; actual-work section; `source-map.json` S15 and S17.

The draft consistently limits the 2026 U.S.-focused review and 2024 review to disclosure examples, records the publisher access failures, and says their complete methods and supplements were not verified. My attempts also did not expose full text (the 2026 DOI redirected to an inaccessible Elsevier page; the 2024 DOI returned 403). Their exact strategy and exclusions therefore remain unverified external inputs. The caveat is honest and keeps these excerpts from functioning as a coverage benchmark; no unsupported coverage or effectiveness conclusion is drawn from them.

## Requirement and plan disposition

| Obligation | Assessment and evidence |
|---|---|
| Separate discovery coverage, screening workload, and study identity; do not use record counts as improvement | **Met.** The record/report/study model and separate outcomes are explicit in `discovery.md` (“keep three units and three outcomes separate”) and `draft.md` (“Comparison, outcomes, and uncertainty”). |
| Compare terminology/database changes with citation/repository discovery and a useful manual alternative | **Partly met.** Routes A–D cover these alternatives and preserve curator bias; however, the released plan’s multiple-public-index comparison remains optional (C-01). |
| Treat reports, versions, ambiguous titles, and geography without similarity-only merges | **Met.** The draft preserves original rows, proposes conservative candidate links and unresolved states, and defines locality aliases. Cochrane’s primary guidance also distinguishes reports from studies and advises manual linking of reports: [Chapter 4 §§4.2.3, 4.6.1–4.6.2](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-04). |
| Explain disclosures needed to make prior coverage claims informative | **Mostly met, with bounded examples.** The disclosure checklist is broad; S15/S17 remain excerpt-only examples (C-05). |
| Auditable sampling, provenance, and uncertainty; separate executed from proposed work | **Met.** Stratification, probability samples, inclusion probabilities, pair adjudication, unresolved-cluster bounds, source logs and explicit “not executed” lists are present. |
| Boundaries: no comprehensive review, invented-corpus recall, effectiveness inference, restricted scraping, private accounts, or deletion of ambiguous rows | **Met.** The draft repeatedly preserves these restrictions. |
| Released plan: keep scope, useful-evidence definition, and later-screening capacity open for owners | **Met.** The decision list stages these as owner decisions and permits only provisional syntax/alias work. |
| Released plan: investigate implementation/history, preserve release boundaries, and leave proposed versus executed checks distinct | **Mostly met.** OpenAlex, Crossref, Zotero, and ASReview are treated as evolving metadata/screening systems, with applicability limits; proposed and executed work are clearly separated. |
| Released plan: fit the design to the 60-minute window without prespecifying a winner | **Partly met.** A timed proposal is present, but its C/D allocation conflicts with its equal-time premise (C-02). |

## Overall assessment

The investigator package is strong on identity preservation, provenance, uncertainty, scope decisions, and truthful reporting of work performed. I found no material false correction of the original brief, no claim of intervention effectiveness, and no invented recall estimate. Full alignment with the released plan is not established because of C-01/C-03, and the planned efficiency comparison is not auditable on equal effort until C-02 is resolved. No final or repair has been written by this critic.
