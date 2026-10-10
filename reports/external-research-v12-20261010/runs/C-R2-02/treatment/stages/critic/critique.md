# Independent critic — C-R2-02-treatment

## Scope and review method

This is an independent review of the complete assigned brief, released plan, investigator discovery, draft, source map, and carried source index. It is a critique, not authority to narrow the research scope or author/repair a final proposal. I preserve uncertainty and distinguish primary-source desk checks completed here from proposed validation.

## SCW-6 v1 selected-claim register (frozen before new source access or verdicts)

Selection rule: exact claims with a scope-bearing reading where a mistaken interpretation could change a recommendation, the comparison estimand, a plan disposition, or a consequential applicability condition. Priority is the miss-estimand and resource-comparison claims first, then scholarly-source route conditions, identity tooling, and implementation-history applicability; tied claims follow draft order. This selection is locked; no substitution after evidence review.

1. **Draft §Auditable pilot protocol, “Sample screening and audit what routes miss.”** Exact selected sentence: “For a limited miss estimate, treat records independently discovered by citation or repository/manual routes as an **audit set**.” Context: the next sentence compares the baseline query against eligible audit-set records. Scope ambiguity: does the set include every eligible record found through an alternate route, including overlap with baseline, or only route-unique records absent from baseline?
2. **Draft §Auditable pilot protocol, “Compare outcomes under equal resources.”** Exact selected sentence: “Compare discovery at equal reviewer-hours and equal records screened.” Context: the sentence precedes process and identity outcomes. Scope ambiguity: does reviewer-hours include only screening/adjudication, or also query setup, portal search, retrieval, and source-frame curation?
3. **Draft §Comparison arms and mechanisms, paragraph beginning “OpenAlex can test public scholarly discovery.”** Exact selected sentence: “OpenAlex can test public scholarly discovery across title, abstract, available full text, and keywords; its semantic option may be an exploratory arm, but the team must record the exact query and request and evaluate results under the same screening rules.” Context: OpenAlex is proposed as a candidate scholarly discovery service; full-text applicability affects interpretation of its coverage.
4. **Draft §Comparison arms and mechanisms, same paragraph.** Exact selected sentence: “Crossref is useful for DOI/report metadata and source linking, but only where works are represented by member/trusted deposits and their types/fields are populated [S005–S007]. Neither should be represented as a complete source for city reports.” Context: a candidate supplemental route; the relevant scope is which report records its metadata/filter can reach.
5. **Draft §Record model and identity procedure, Zotero sentence.** Exact selected sentence: “If Zotero is used, its duplicate detector is a candidate-generation aid only: its documented rules and within-library scope are limited, and its page warns about false positives [S008].” Context: optional identity candidate-pair tool; whether matching crosses libraries changes its suitability for this multi-source collection.
6. **Draft §Prior implementation and tool-history findings, INSPQ paragraph.** Exact selected sentence: “Its search description is more useful than its headline total: the stated counts are from the scholarly stream, and the cited grey-search passage does not provide portal-specific yields or a fixed stop boundary.” Context: interpretation of the Québec implementation as evidence for the plan’s prior-search disclosure requirement. “Fixed stop boundary” may mean a quantitative/predeclared cap or any stated stopping condition.

### SCW_NOT_RUN beyond the cap

These risks remain in the ordinary review: the PRISMA-S checklist’s applicability to a bounded discovery pilot; the ASReview default stopping behavior; and the meaning of “unique eligible yield per equal reviewer-hours” elsewhere in the proposal. The selected reviewer-hours sentence above is the locked SCW record for the resource denominator; I will also assess the broader time/cost omission ordinarily.

## SCW-6 v1 records

### SCW-1 — Audit-set membership

**Draft locator:** §Auditable pilot protocol, “Sample screening and audit what routes miss,” draft.md line 80.  
**Exact sentence/context:** “For a limited miss estimate, treat records independently discovered by citation or repository/manual routes as an audit set.” The next sentence asks how many eligible audit-set records the baseline also retrieved, missed at screening, or did not retrieve.  
**Intended C:** include all eligible records found by an alternative route, including records also found by baseline, so overlap, screening misses, and absent records can be counted.  
**C* / selector delta:** only eligible records unique to an alternative route and absent from baseline are audit-set members. Changed selector: set membership, “all alternate-route finds” → “route-unique finds only.”  
**Evidence E:** C002, plan lines 71/77: independently identified additions are useful, but the union of found records is not complete ground truth; the adjacent draft sentence explicitly asks for baseline overlap.  
**C relation:** ENTAILS — the adjacent comparison requires baseline-overlap cases to remain in the set.  
**C* relation:** CONTRADICTS — if membership requires absence from baseline, the set cannot contain any baseline-retrieved records, making the requested overlap count structurally zero.  
**Disposition:** Scoped clarification. Supported replacement: define the audit set as all eligible records found by the declared alternate route(s), including overlap with baseline; call the resulting measure a route-conditional miss proxy.  
**Affected obligations:** C001/C002 P3, P7, P12, P17.

### SCW-2 — Equal reviewer-hours

**Draft locator:** §Auditable pilot protocol, “Compare outcomes under equal resources,” draft.md line 85.  
**Exact sentence/context:** “Compare discovery at equal reviewer-hours and equal records screened.” It precedes the separate workload and identity metrics.  
**Intended C:** equal reviewer-hours spent screening/adjudicating records, since the brief asks for screening workload.  
**C* / selector delta:** equal total human effort across query design, source-frame curation, searching, retrieval, screening, and adjudication. Changed selector: denominator scope, “screening/review hours” → “end-to-end discovery-and-review hours.”  
**Evidence E:** C001 lines 13-31 separates coverage, screening workload, and identity; C002 lines 47/55 leaves later screening time and capacity open. Neither defines whether route setup/search time belongs in the comparison denominator.  
**C relation:** UNDETERMINED — consistent with the screening-workload axis, but the plan does not bind “reviewer-hours” to screening alone.  
**C* relation:** UNDETERMINED — end-to-end effort is also compatible with the pilot’s route-comparison purpose; the plan does not require it.  
**Disposition:** Qualify unresolved. Report screening-only time and discovery/setup/retrieval time separately; state which denominator is used for each efficiency comparison.  
**Affected obligations:** C001/C002 P3, P7, P11, P17.

### SCW-3 — OpenAlex full-text scope

**Draft locator:** §Comparison arms and mechanisms, OpenAlex paragraph, draft.md line 50.  
**Exact sentence/context:** “OpenAlex can test public scholarly discovery across title, abstract, available full text, and keywords; its semantic option may be an exploratory arm, but the team must record the exact query and request and evaluate results under the same screening rules.”  
**Intended C:** works search includes a full-text search field, with “available” indicating a conditional per-work content boundary.  
**C* / selector delta:** full-text search is available for every OpenAlex work. Changed selector: quantifier, “available when present” → “every work.”  
**Evidence E:** S005 lists work-search fields as title, abstract, fulltext, and keywords. S011 defines per-work has_content/has_fulltext flags; S012 reports 50M+ cached full-text works; S013 reports roughly 322M OpenAlex works and defines OA separately. The join shows content availability is per work, but these pages do not state that fulltext.search coverage exactly equals downloadable-content coverage.  
**C relation:** ENTAILS for the listed search fields and the qualified “available” reading.  
**C* relation:** UNDETERMINED — downloadable-content counts do not establish the exact search-index boundary; that mapping is the missing fact.  
**Disposition:** Retain with a scope note: record the OpenAlex search field and do not equate full-text search coverage with downloadable-content or OA counts.  
**Affected obligations:** C001/C002 P4, P6, P15.

### SCW-4 — Crossref report scope

**Draft locator:** §Comparison arms and mechanisms, OpenAlex/Crossref paragraph, draft.md line 50.  
**Exact sentence/context:** “Crossref is useful for DOI/report metadata and source linking, but only where works are represented by member/trusted deposits and their types/fields are populated [S005–S007]. Neither should be represented as a complete source for city reports.”  
**Intended C:** Crossref can expose deposited metadata records with relevant type/fields, not reports absent from Crossref or miscoded there.  
**C* / selector delta:** Crossref’s report route reaches all municipal reports, whether deposited/type-coded or not. Changed selector: population, “deposited, typed records” → “all city reports.”  
**Evidence E:** S006 says the REST API exposes metadata deposited by members/trusted sources; S007 defines type as records whose metadata type equals a given value.  
**C relation:** ENTAILS — the API and filter operate on represented/deposited metadata.  
**C* relation:** CONTRADICTS — the documented filter cannot return works that are absent or lack the selected type metadata.  
**Disposition:** Retain; keep Crossref supplemental and portal/repository search separate. Minor citation cleanup: S005 is OpenAlex; S006–S007 support the Crossref clause.  
**Affected obligations:** C001/C002 P4-P6, P15.

### SCW-5 — Zotero library scope

**Draft locator:** §Record model and identity procedure, Zotero sentence, draft.md line 62.  
**Exact sentence/context:** “If Zotero is used, its duplicate detector is a candidate-generation aid only: its documented rules and within-library scope are limited, and its page warns about false positives [S008].”  
**Intended C:** candidate detection operates inside one library; separate group libraries do not cross-match.  
**C* / selector delta:** matching works across different group libraries. Changed selector: applicability boundary, “within one library” → “across libraries.”  
**Evidence E:** S008, “Finding Duplicates,” states detection only works within a library and different group libraries will not appear in one another’s Duplicate Items collection; it also says false positives cannot currently be marked as non-duplicates.  
**C relation:** ENTAILS — the cited documentation explicitly gives the within-library condition.  
**C* relation:** CONTRADICTS — the same passage explicitly excludes cross-library matching.  
**Disposition:** Retain. The draft correctly limits Zotero to reversible candidate generation, not study-identity authority.  
**Affected obligations:** C001/C002 P3, P5, P7, P15, P17.

### SCW-6 — INSPQ grey-search stopping condition

**Draft locator:** §Prior implementation and tool-history findings, INSPQ paragraph, draft.md line 94.  
**Exact sentence/context:** “Its search description is more useful than its headline total: the stated counts are from the scholarly stream, and the cited grey-search passage does not provide portal-specific yields or a fixed stop boundary.”  
**Intended C:** “fixed stop boundary” means a predeclared measurable page/result/source cap; the excerpt does not describe one.  
**C* / selector delta:** any reported stopping cue, including a relevance judgment, counts as a fixed boundary. Changed selector: stopping-boundary type, “predeclared measurable cap” → “any stated stop cue.”  
**Evidence E:** S004 Appendix 1 lines 4617-4623 reports searches stopped when results “no longer seemed relevant”; the neighboring section names Google, Google Scholar, and government sites but no portal-level yields.  
**C relation:** UNDETERMINED — the report gives a qualitative cue but not whether it was fixed in advance or operationalized; absence of a stated cap cannot establish that none existed elsewhere.  
**C* relation:** ENTAILS — there is an explicit relevance-based stopping cue in the cited passage.  
**Disposition:** Scoped correction. Say the excerpt reports relevance-based stopping but does not state a predeclared measurable cap or per-portal yield; do not imply that no stopping rule existed.  
**Affected obligations:** C001/C002 P6, P16.

## Ordinary critique findings

### Overall assessment

The draft is strong and substantially faithful to the released scope. I found no material wrong claim that overturns the proposed design, no invented recall/completeness result, no intervention-effect conclusion, and no boundary violation. The main route comparisons, non-destructive three-level identity model, unresolved owner decisions, and executed-versus-proposed distinction are all present. Four material-incompleteness issues and two smaller evidence/locator issues remain; they do not require narrowing the brief.

### Issues by required class

1. **Material incomplete — unflagged identity-audit frame.** **Draft locator:** §Record model and identity procedure, draft.md line 62; audited pilot §3, line 82. The draft proposes a random sample of unflagged pairs, but does not define the pair universe or blocking frame from which pairs are sampled. For N records, “all unflagged pairs” could mean an impractical all-pairs universe; a near-title/identifier/geography block would measure misses only in that block. Name the frame, pair unit (source-record/document/study relation), sampling probabilities, and which false-link/missed-link rate each sample estimates. The draft otherwise correctly requires denominator disclosure and separates duplicate documents from same-study versions. Evidence: the draft’s sampling instructions; C001/C002 P5, P7, P17.
2. **Material incomplete — end-to-end route cost.** **Draft locator:** §Proposal in brief, draft.md line 19; §Compare outcomes under equal resources, line 85. Screening workload is measured well, but route setup, query execution, expert source curation, report retrieval, and search time are not given a parallel accounting. Because a manually curated municipal arm may require more staff time than a database arm, unique yield per screening-hour can rank routes differently from yield per total pilot-hour. SCW-2 records the unresolved denominator; preserve both costs and keep the brief’s screening-workload axis distinct. Evidence: C001 requirements lines 13-31 and C002 unresolved later screening capacity/time lines 47/55.
3. **Material incomplete — search-implementation change over time.** **Draft locator:** §Prior implementation and tool-history findings, draft.md line 94; plan disposition P16. S004 is a useful, detailed 2021 Québec implementation and S014-S017 verify real ASReview changes across v3.0.5-v3.0.8. The latter are screening-state releases, not a change history of search routes or the INSPQ collection strategy. S004 itself calls the report an update of a 2009 report (front matter lines 23-24), but the draft does not compare the two strategies. The cited 2009 PDF URL returned 404 at the recorded access time (S018), so whether another accessible copy supplies that history remains unresolved. P16 is partially covered, not disproved.
4. **Material incomplete — “independently discovered” needs a set definition.** **Draft locator:** audited pilot §3, draft.md line 80. The following sentence implies the audit set includes records that overlap baseline, while “independently discovered” can be read as unique to alternate routes. SCW-1 finds the overlap-only reading contradicted by the next sentence. Define membership before presenting the conditional miss proxy; do not treat it as an independent gold standard.
5. **Unsupported, low consequence — characterization of OpenAlex ranking.** **Draft locator:** OpenAlex paragraph, draft.md line 50. “Citation-weighted ranking may favor highly cited general reviews” is an inference. S005 says the relevance score combines text similarity, citation count capped at half, and a keyword bonus; it does not specifically establish a general-review preference, and the cap limits that effect. Safer claim: citation count contributes to default relevance ranking, so record sort/rank behavior and do not treat a truncated top-N as exhaustive. This does not undermine the route design.
6. **Minor locator/wording — Crossref citation span.** **Draft locator:** same paragraph, draft.md line 50. The Crossref claim cites S005–S007, but S005 is OpenAlex documentation; S006–S007 support the Crossref statement. This is a locator cleanup, not a factual defect.
7. **Honestly unresolved external input — INSPQ predecessor.** **Evidence locator:** S004 front matter lines 23-24 links a 2009 predecessor; S018 records a 404 at the cited URL. Do not infer that the report or method history is unavailable elsewhere, and do not claim a method change without comparing a retrieved predecessor.

### Clause-by-clause review against the released plan

The draft’s own P1-P18 disposition register is accurate in most respects. This review independently adjudicates it:

| Clause | Critic disposition |
|---|---|
| P1 Situation | Covered. Synthetic context stays motivation; no memory of reports is treated as a reference set. |
| P2 Request | Covered as a reproducible proposal with retrieval, screening, alternative routes, and implementation evidence; no app or finished review. History limitation is recorded under P16. |
| P3 Coverage/workload/identity | Covered as distinct metric axes; total route effort needs separate accounting (issue 2). |
| P4 Alternatives | Covered: changed terminology/database, citations, finite repository/municipal, and a useful librarian/subject-expert route, with biases and conditions. |
| P5 Reports/versions/titles/geography | Covered in the entity model and reversible adjudication; sampling frame for unflagged links is incomplete (issue 1). |
| P6 Prior-strategy disclosure | Covered with PRISMA-S, INSPQ’s source/date/query detail, and limits on its counts; adaptable checklist scope is appropriate. |
| P7 Audit/provenance/uncertainty/status | Mostly covered: route records, stratified sampling, uncertainty tags, and actual desk-check vs future validation are clear; identity-pair frame needs definition (issue 1). |
| P8 No invented recall/effectiveness | Preserved. The miss proxy is explicitly route-conditional and the unknown universe stays unknown. |
| P9 Access boundaries | Preserved in the proposal; investigator log records only public documentation searches and no restricted scraping, account use, author contact, or product build. |
| P10 Ambiguous records | Preserved through unresolved links and non-destructive source/document/study relations. |
| P11 Owner decisions | Covered: intervention, evidence unit, outcomes, places, languages, dates, report/version rules, access, and later capacity are explicit. |
| P12 Research question | Covered through a bounded conditional miss proxy, not a population miss rate. Clarify audit-set membership (SCW-1). |
| P13 Incompleteness | Covered: scope first, followed by concrete routes and comparison measures. |
| P14 Alternatives and bias | Covered, including expert geography/language bias and the value of scope narrowing. |
| P15 Mechanisms | Covered: indexing, term mismatch, citation links, repository metadata, screening interaction, and document/study identity. |
| P16 Implementation/history | Partly covered. INSPQ documents a real 2021 search; ASReview changes are tool-state history. Search-strategy changes over the INSPQ 2009-to-2021 update are not compared and remain unresolved (issue 3). |
| P17 Validation | Mostly covered: sampling, blinded/double screening, route overlap, manual adjudication, and uncertainty; denominator and unflagged-pair frame need precision (issues 1-2). |
| P18 Full-session scope/no winner | Covered for discovery-method causal reasoning: it explains how indexing, terminology, citations, repositories, and screening generate different observed missingness. It does not infer intervention effectiveness or select a winner. |

### Executed versus proposed checks

**Independently executed in this critic stage:** read the complete ordinary packet and source index; reopened official sources S001, S002, S004-S009 and ASReview release pages S014-S017; checked the current OpenAlex search and full-text applicability docs S005, S011-S013; checked the exact Crossref, Zotero, ASReview, PRISMA-S, and INSPQ conditions cited above; attempted the source-linked 2009 INSPQ predecessor and recorded its 404. This was primary-source document review only.

**Not executed here:** no topic query against OpenAlex, Crossref, a bibliographic database, municipal portal, or repository; no title retrieval, citation chasing, screening, deduplication, identity adjudication, sampling, pilot, or yield/recall estimate. The investigator’s carried search log likewise records only public-web desk searches and source opens. Those remain proposed validation, not results.


## Native Goal execution record

The exact create_goal response is saved in native-goal-activation.json; the preterminal get_goal response is saved in native-goal-preterminal.json. Both identify the same thread and frozen objective. Directly observed activation fields: status active, tokensUsed 0, timeUsedSeconds 0, createdAt 1791612121, updatedAt 1791612121, remainingTokens null, completionBudgetReport null. Preterminal fields: status active, tokensUsed 275792, timeUsedSeconds 1325, createdAt 1791612121, updatedAt 1791613446, remainingTokens null, completionBudgetReport null. The independent-goal provenance attestation is UNKNOWN; the binding guard reports provenance_independently_proved=false. The timestamp numbers are preserved exactly as returned; their unit/time-zone semantics are UNKNOWN.

