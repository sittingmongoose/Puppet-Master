# Investigator draft — C-R2-02-treatment

## Purpose, scope, and result status

This proposal responds to the released design record for ER12-C-R2-02-FRESH. It asks how a bounded discovery experiment can expose useful missing evidence and keep individual source records, document versions, and underlying studies traceable when the eligible evidence universe is unknown. It does not determine whether any urban-heat intervention works, assert completeness, or deliver a finished review or search product.

The discovery note was frozen by the assigned release helper before the plan was read. Frozen discovery SHA-256: 462d79eec60b698f2ee8f8924fb263102da696b69873b3bc7ecbae2aa338caf1. The only plan read was the released copy at revealed-plan.md. No empirical pilot was executed.

## Proposal in brief

Use a short protocol-development step to settle scope, then compare four distinct discovery routes under one fixed scope: (1) a baseline database/free-text search against (2) a changed terminology/field/database arm; (3) backward and forward citation discovery from a diverse seed set; and (4) a finite, hand-searched municipal/repository source frame curated by an information specialist and an internal local subject expert. OpenAlex and Crossref are candidate public scholarly-metadata services within the first route; their documented coverage and ranking conditions mean neither is a local-report denominator. A small sample of source records, not a fabricated complete corpus, supports screening-workload and identity-quality audits.

Keep three result axes separate:

- **Discovery:** eligible documents and distinct studies observed by each route, unique eligible additions per route, and route overlap, all conditional on this protocol.
- **Workload:** records screened, minutes by stage, records needing full text/manual retrieval, agreement, and reviewer time per confirmed eligible study.
- **Identity:** false merge and missed-link estimates within explicit reviewed samples, document-version groups, unresolved pairs, and completeness of field provenance.

Raw record totals alone are not a success metric. Report unique eligible yield per equal reviewer-hours and per equal screened records, with uncertainty. Since the corpus is unknown and routes are dependent, results are observed yields and miss proxies, never recall or completeness.

## Scope decisions required before comparing coverage

The group should record an owner, decision, date, and settled/provisional status for each item:

1. **Intervention:** what counts as an urban-heat intervention, including whether planning/policy, proposed measures, modeled scenarios, maintenance, and mixed interventions are included.
2. **Evidence unit and design:** whether eligibility is a study, report, or either; which observational designs count; whether models, descriptive monitoring, evaluations, and reviews are eligible at discovery or used only as seed sources.
3. **Outcomes and setting:** whether heat exposure, air/pedestrian temperature, health, energy, or implementation outcomes are relevant; what qualifies as urban/local.
4. **Geography:** jurisdictions, administrative levels, cross-jurisdiction projects, and the exact place hierarchy. Retain original place names and aliases alongside any standard code; do not infer equivalence from similar city names.
5. **Language:** eligible languages, translation/transliteration policy, and whether non-English titles/abstracts can be screened. The Québec comparator used French and English; that is evidence of a workable precedent, not a default for this group.
6. **Dates:** publication, report, study, and intervention date boundaries; choose the date field and treatment of undated reports.
7. **Reports and versions:** document types to include; treatment of municipal plans, monitoring/evaluation reports, theses, presentations, preprints, and final articles; whether later versions are separate documents tied to one study.
8. **Screening rules:** title/abstract and full-text criteria, treatment of uncertain records, reviewer count and adjudication, and whether reviews are eligible evidence or only citation sources.
9. **Access and capacity:** public sources and permitted access routes; time/people available for later screening and full-text retrieval; stop rules and maximum site/search extent.

Without these choices, “local,” “observational,” “report,” “duplicate,” and “coverage” are not stable comparison variables. The scope step is mandatory; concrete alternatives and a route-comparison design are still specified below so the step does not replace research.

## Comparison arms and mechanisms

| Arm | Retrieval mechanism and useful alternative | What it may expose | Main condition or limitation |
|---|---|---|---|
| Baseline scholarly query | Current vocabulary across approved databases/indexes; controlled terms plus title/abstract text | Indexed studies found under established terminology | Metadata and indexing coverage vary; first search’s high review yield is not evidence it covered local studies |
| Changed-term/index arm | Add or revise synonyms, local spellings, database-specific controlled vocabulary/fields; compare against baseline with one changed factor per sub-arm | Term mismatch, indexing differences, local terms, vocabulary in titles/abstracts/keywords | Broader terms may increase noise; an index’s order is not exhaustive. OpenAlex ranks by text relevance with citation count contributing; full text applies only to a subset [S005]. |
| Citation arm | Backward reference checking and forward citation search from diverse eligible seeds and relevant reviews | Studies that cite different terminology, older work, or are linked to known sources | Citation connectivity depends on seed selection and index coverage. Cite every base record and record direction/depth/date; overlap is not completeness [S001–S003]. |
| Repository/municipal arm | Finite source frame of approved municipal/regional planning, public-health, environment, open-data and institutional repositories; direct site search and handsearch | Reports, technical appendices, local monitoring, implementation evaluations, items without DOI/abstract | Highly dependent on chosen jurisdictions, site functionality, language, and person-hours. Crossref report type covers deposited report records only; it does not replace direct local-source search [S006–S007]. |
| Manual/expert-curated arm | A librarian/information specialist plus an internal heat/planning subject expert select a bounded portal list and curated seed set; hand-search the named sites | Local vocabulary and organizations that broad indexes do not expose | Curator geography, language, memory, and institutional bias. Record why each source/seed was selected and compare this route against the others. No author contact is proposed. |
| Optional screening support | Conventional double-screening or ASReview LAB on the frozen route union | Workload/ranking changes after retrieval | Screening priority cannot recover a record absent from the input set. ASReview’s stop threshold is unset by default and asks the user whether to stop; it is not an automatic completeness rule [S009]. |

Candidate query concepts include urban heat/UHI and approved intervention families, with explicit geographic aliases and language equivalents added only after scope decisions. The Québec report demonstrates one bilingual, librarian-assisted search and is a source of candidate implementation details, not a universal term list [S004]. Build each platform strategy separately; retain the exact query and its translation. A search specialist should review Boolean/proximity syntax, field mapping, thesaurus terms, and limits.

OpenAlex can test public scholarly discovery across title, abstract, available full text, and keywords; its semantic option may be an exploratory arm, but the team must record the exact query and request and evaluate results under the same screening rules. Citation-weighted ranking may favor highly cited general reviews. Crossref is useful for DOI/report metadata and source linking, but only where works are represented by member/trusted deposits and their types/fields are populated [S005–S007]. Neither should be represented as a complete source for city reports.

## Record model and identity procedure

Keep three linked entities:

- **Source record:** each result exactly as exported/returned, identified by source, source-local key, retrieval timestamp, route, query, and raw citation/fields.
- **Document/version:** one article, report, preprint, thesis, or other artifact, with original title, author/issuing body, original place names, dates, version/edition, DOI/report number/ISBN/repository accession/stable URL if present, language, and relation to other versions.
- **Underlying study:** the observational investigation/data collection, with study ID, place, period, population/data, design and intervention. One study may have several documents; one document can describe multiple studies.

Store raw title and a normalized comparison title in separate fields. Preserve the provenance of every corrected or standardized field and do not replace a local name with a geographic code. Automated title/identifier similarity should create a candidate edge only. Use five resolution labels: repeated source record; same document with metadata variants; distinct versions of one study; distinct studies with similar titles; unresolved. An absent DOI is not evidence of distinctness, and a shared city/title/author is not sufficient evidence of sameness.

Two reviewers independently judge all proposed merges and a declared random sample of unflagged pairs. Use report/contract number or DOI, author/issuing body, date/version, geography, observation period, design, and content as combined evidence. A third reviewer resolves disagreements. Preserve records and link ambiguous cases as unresolved; do not delete or irreversibly merge them. If Zotero is used, its duplicate detector is a candidate-generation aid only: its documented rules and within-library scope are limited, and its page warns about false positives [S008].

Report duplicate-pair precision among flagged cases; missed same-document and same-study/version links found in the unflagged audit; false-merge count; distinct-study false-link count; unresolved count; reviewer agreement; and metadata provenance completeness. State each denominator and sampling frame. Distinct documents tied to one study must not be counted as duplicate records without a separate document/version decision.

## Auditable pilot protocol

### 1. Freeze a scope and protocol

Publish the decisions listed above and a short eligibility matrix. Define query concepts, source frame, citation-seed selection, source-specific limits, data fields, reviewer rules, and route stop boundaries before the comparison. Have an experienced information specialist peer-review the database strategies. Keep an independently identified known-item set for a retrieval check only; a convenience set cannot establish recall [S002].

### 2. Run distinct routes and preserve returns

Run baseline and changed-term arms over identical eligible sources, time limits, languages, jurisdictions, and inclusion criteria; alter one principal factor at a time. Run citation and repository/manual routes separately. For each source preserve the exact query, interface/API, query date and UTC, result total, all result pages/exports, version/commit where available, source identifiers, fields, site/organization name and URL, page/result cap, stop boundary, and access/availability notes. Keep original results immutable and add later updates as new events, not overwrites. Do not scrape restricted services or use private accounts.

### 3. Sample screening and audit what routes miss

Screen all records if feasible. Otherwise sample randomly within route × source × document type × language × year strata, publish the seed and inclusion probability, and oversample records unique to each route. Screeners should be blind to route when practical. Double-screen a preregistered subset, all likely eligible reports, and all uncertain cases; adjudicate disagreements. Log eligible, ineligible, uncertain, not accessed, and unassessed distinctly.

For a limited miss estimate, treat records independently discovered by citation or repository/manual routes as an **audit set**. Among the eligible audit-set records, report how many the baseline query also retrieved, how many it retrieved but screening missed, and how many were absent. Repeat the comparison for each route and for the union. Describe this as a route-conditional miss proxy: source routes are dependent and the audit set is incomplete, so the denominator is not the unknown evidence universe. Also randomly inspect records classified ineligible and pairs not flagged as duplicates. Do not infer recall from route overlap, a known-item set, or the found-record union.

### 4. Compare outcomes under equal resources

Report raw source records, unique document/version records, adjudicated underlying studies, eligible discoveries, route-unique eligible additions, and overlap separately. Compare discovery at equal reviewer-hours and equal records screened. For workload report reviewer-minutes, number of records at each stage, access failures/manual retrievals, agreement, adjudications, and time per eligible study. For identity report the adjudicated pair metrics above. Show uncertainty intervals or exact sample counts with their method; never imply precision unsupported by sample design.

### 5. Stop, update, and report

Define stop rules per route before searching: a closed list of sites/jurisdictions, a fixed page/record cap, or a pilot-tuned consecutive-run threshold. Record the last page/record, the remaining unreviewed queue, and reason for stopping. Do not declare a sparse-topic search complete after a quiet run; stopping rules have little formal evaluation and need caution in sparse evidence [S002]. If a later update occurs, preserve the original run and log new queries, metadata changes, and newly identified versions.

Use PRISMA-S as a reporting checklist for exact per-source strategies, web/portal browsing, citations/base records, prior-strategy reuse, per-source counts, and deduplication method [S001]. Keep a source index with stable IDs; every source note should include exact URL, release/version/commit where applicable, locator, access UTC, operation observed, applicable condition/default/exception, and why it matters. The current investigator source index does so; mutable documentation needs a revision pinned when the pilot actually runs.

## Prior implementation and tool-history findings

The closest implemented collection is INSPQ’s 2021 Québec urban-heat mitigation update. Its appendix records six scholarly database/platform searches with English/French free-text and controlled terms, concept logic, fields and years, plus a librarian-assisted gray-literature route through Google, Google Scholar, and named public bodies. It reports 4,487 scholarly records and 985 duplicates removed, then describes staged screening and 55 final selected items. The grey route used English/French terms and stopped when results no longer seemed relevant [S004]. This demonstrates a mixed local, bilingual search design. Its search description is more useful than its headline total: the stated counts are from the scholarly stream, and the cited grey-search passage does not provide portal-specific yields or a fixed stop boundary. Its Québec scope, climate and selection criteria must not be imported as defaults.

The ASReview v3.0.5–v3.0.8 release history documents fixes for decision migration, retry-safe import, database locking, dropped ranking-table persistence, and corrupted saved-ranking record IDs; the v3.0.8 release is tag/commit d3e863c [S010]. That is a history of screening-state implementation, not evidence about discovery coverage. If active learning is selected, pin the release and test export/reopen plus label retention; otherwise use conventional screening. No validation of either tool was executed here.

## Exact clause-by-clause disposition

The exact text below is from the released plan. “Correction” refers to interpretation or an implementation claim, not a change to the original brief.

### Original brief

**P1 — Situation:** “A university group is preparing an evidence collection about urban heat interventions. Their first search returned many general reviews and few local observational studies, although a collaborator remembers several municipal reports. Titles in the working list sometimes differ between repositories, and the team is unsure which items are duplicates. There is no supplied search export or known complete reference set. This is a synthetic planning situation, not a request to conclude whether an intervention works.”

Disposition: Preserve as motivating context, not observed empirical input. No known item list or city is supplied. The collaborator’s remembered reports motivate a future independent audit but are not a hidden gold standard. The unknown universe prohibits recall/completeness claims. This draft does not assess intervention effectiveness. No correction to the brief.

**P2 — Request:** “Use the 60-minute research window to propose an evidence-discovery study that can tell us how to improve coverage without losing the identity and provenance of individual studies. Explain retrieval and screening mechanisms, compare useful routes, and investigate the implementation history of related collection efforts. Provide a reproducible pilot protocol rather than an application or a finished review.”

Disposition: Answer with a bounded staged protocol, route mechanisms/comparison, record/study model, and implementation evidence from INSPQ and ASReview. No software/product built; no finished review; no empirical pilot claimed.

**P3 — Coverage, workload, identity:** “Distinguish discovery coverage, screening workload, and correct study identity; increased record counts alone do not establish improvement.”

Disposition: Answered with separate metric sets and denominators. Raw hits are reported only as process counts; success depends on eligible studies observed, screen time, and adjudicated identity quality.

**P4 — Alternatives:** “Compare terminology or database search changes with citation or repository-based discovery and a useful manual or expert-curated alternative.”

Disposition: Answered with baseline/changed terminology, citations, bounded municipal/repository, and internal librarian/subject-expert arms. These are not ranked as a priori winners. A scoped manual source list is tailored but curator-biased. No author contact proposed.

**P5 — Reports, versions, titles, geography:** “Address reports, multiple versions, ambiguous titles, and geographic terminology without treating every similar title as a duplicate.”

Disposition: Answered with three-level source-record/document-version/study model; preserved raw titles and place names; explicit version and unresolved states; human adjudication and non-destructive links. DOI/title similarity generates candidates only.

**P6 — Prior strategies:** “Explain what a prior search strategy or collection implementation would need to disclose for its claimed coverage to be informative here.”

Disposition: Answered using PRISMA-S and the INSPQ example: exact per-source searches, interface, fields, controlled/free terms, date/time and language limits, source frame, results by route, citation seeds/direction, stop rule, eligibility, duplicate algorithm and review, version handling, and provenance of final items. Correction: INSPQ’s 4,487/985 figures identify the scholarly stream and cannot establish gray-route or total local-report coverage.

**P7 — Design, provenance, uncertainty, executed vs future:** “Propose an auditable sampling and comparison design, provenance recording, and uncertainty treatment; label searches or desk checks actually executed separately from future validation.”

Disposition: Answered with a frozen protocol, random stratified sample and disclosed seed, route-unique oversample, blinded/double screening, conditional miss proxy, source-level logs, versioned exports, and uncertainty tags. Executed searches are separately logged in sources/search-log.md; no database, municipal portal, API, screening, or identity pilot was executed.

**P8 — No invented completeness or effectiveness:** “Do not claim a comprehensive systematic review, calculate recall against an invented complete corpus, or infer intervention effectiveness from search yield.”

Disposition: Preserved. Results are conditional observed route yields and miss proxies only; no effectiveness claim.

**P9 — Access boundaries:** “Do not scrape restricted services, use private accounts, contact authors, or create a search product.”

Disposition: Preserved. Work used public documentation only; no private service/account, author contact, scrape, API result harvesting, or product build.

**P10 — Ambiguous records:** “Do not delete ambiguous records merely to make the collection look cleaner.”

Disposition: Preserved as a non-destructive identity rule: keep records, create candidate links, and leave unresolved pairs visible.

**P11 — Unresolved owners’ choices:** “The intervention scope, languages, jurisdictions, date limits, review inclusion rules, access routes, and time available for later screening are undecided. We want the proposal to identify which decisions must precede a meaningful coverage comparison and which can be tested provisionally.”

Disposition: Listed as explicit decisions with owners/status. Fixed eligibility, geography, language/date and access boundaries must precede valid comparisons; query variants and portal feasibility may be tested provisionally under a shared frozen scope. No decision is silently made for the group.

### Additional released design clauses

**P12 — Research question:** “Can a bounded discovery experiment reveal meaningful missed evidence and manageable identity handling when no complete ground-truth corpus exists?”

Disposition: Addressed by a route-conditional audit set and three independent outcome axes. “Missed” means absent from a comparison route among eligible items found through the explicitly bounded alternative-route audit, not a population miss rate.

**P13 — Incompleteness:** “The unit of evidence, definition of useful local evidence, screening capacity, and scope boundaries remain open. A defensible proposal may stage the scope decision first, but must still explain the substantive discovery alternatives and how later observations would choose between them.”

Disposition: Scope decision is first; concrete routes and decision metrics are specified above. Selection among routes depends on unique eligible additions, time, source availability, and identity error under comparable rules.

**P14 — Alternatives and their bias:** “Consider revised controlled and free-text vocabulary, multiple public indexes, citation following, municipal repository exploration, and a small manually curated reference exercise. An expert-produced seed list can be useful but may inherit the expert's geographic and language preferences. A scope-narrowing exercise may be more valuable than expanding searches indiscriminately. No search route or deduplication procedure is prespecified as superior.”

Disposition: All routes are proposed, none declared superior. Scope narrowing is a required decision step. Curator bias is recorded; expert seeds are an audit/checking source and never a complete denominator.

**P15 — Mechanisms:** “Investigate indexing coverage, term mismatch, citation connectivity, repository metadata, and the distinction between a document version and an independent study. Ask how each route could expose different missingness and how screening rules interact with yield. A coverage proxy should state what it measures; overlap between routes is not automatically true recall or completeness.”

Disposition: Addressed in route table, entity model, source eligibility, and conditional miss proxy. Distinct-route differences are interpreted as diagnostic evidence about mechanisms, with dependencies and coverage limits stated.

**P16 — Implementation/history:** “Look for public search histories and evidence-collection implementation descriptions with query dates, database boundaries, inclusion rules, version handling, and changes over time. An older implementation may differ because repositories, terms, and indexing changed. The remembered municipal reports can motivate future provenance checks but are not a hidden reference set or a supplied list of winning sources.”

Disposition: INSPQ supplies dated database and bilingual grey-search history, rules, and counts; ASReview releases show changes to screening-state handling. The report is not treated as current coverage, and the collaborator’s memory is not treated as ground truth. Future pilot must repeat searches and pin current repository/index behavior.

**P17 — Validation:** “A later pilot could prerecord a provisional scope, run several discovery routes, retain route provenance, sample screened and rejected records, and examine independently identified useful additions. Specify how manual adjudication would handle versions and uncertain identity, and how workload and misses would be estimated with limited coverage. Searches actually run during the hour must be logged with dates and limitations; the final proposal must not present a planned multi-route experiment as executed or a union of found records as complete ground truth.”

Disposition: Answered with preregistered route design, records from accepted/rejected/unassessed strata, identity adjudication, reviewer time, and a route-conditional addition audit. Search log distinguishes actual public-web source research from future source searches. The union remains an observed set, not ground truth.

**P18 — Full-session scope/no winner:** “The topic is sized for a full 60-minute research-and-proposal session: substantive evidence discovery, causal reasoning, comparison of useful alternatives, implementation/history investigation, and a coherent later validation design. The proposal may contain reasoned provisional choices, but the case provides no predetermined winner. It requests no product build.”

Disposition: The proposal covers substantive method discovery and a later design; no winner or product is selected. One provisional suggestion is a librarian-reviewed terminology arm plus bounded local portals and citations because the sources address distinct missingness mechanisms. This is a design recommendation to test, not a factual winner.

## Corrections, optional improvements, and owner decisions

### Corrections to avoid misleading interpretation

- The Québec report’s 4,487 retrieved records and 985 deduplicated records are reported for its scientific-literature stream, not a count of all grey-literature coverage [S004].
- A Crossref report type or OpenAlex result cannot stand in for all municipal reports; each service is governed by its indexed/deposited records and available fields [S005–S007].
- ASReview ranks records already retrieved and its threshold is user-controlled; it is a screening aid, not a retrieval route or validated recall estimator [S009–S010].
- A title/identifier matcher creates candidate links, not proof that the records are the same study [S008].

### Optional improvements

- Have an information specialist peer-review every translated query.
- Double-screen a small set and all uncertain/local-report records; mask source route where feasible.
- Preserve original exports and use a versioned event log for field corrections, duplicate decisions, and study-version links.
- Include a low-cost export/reopen/label-retention check before any active-learning tool is used.
- Add translations/local aliases in a provisional arm only after the eligible language and place scope is decided.

### Owner decisions

Intervention categories; eligibility and design; outcomes; geographic units and jurisdictions; languages and translation; dates/date field; report/version inclusion; use of reviews as evidence or seed source; approved public sources/access; later screening/full-text time; reviewers and tie-break rules. These decisions cannot be resolved by retrieval research alone.

## Covered, rejected, uncertain

**Covered:** every original requirement, boundary, and unresolved item; plan-added mechanism and implementation-history prompts; route comparison; source identity/provenance; identity uncertainty; sampling and conditional miss evaluation; distinction between executed and proposed work.

**Rejected:** a comprehensive-review claim; a known-complete corpus or invented recall denominator; raw-count-only success; a claim about intervention effectiveness; automatic merging/deletion; a ranking-based claim of exhaustive search; private/restricted access; any claim that the proposed pilot was run.

**Uncertain:** the group’s eligibility scope, places, languages, period, actual database/platform availability, portal functionality, later screening budget, local terminology, the identity of the collaborator-remembered reports, metadata quality, and actual yield/false-merge rates. Several vendor/project docs are mutable; source-map.json records the observed version and calls for pinning at pilot time. These uncertainties are retained rather than filled with assumptions.

## Executed checks vs proposed validation

**Executed:** read assignment.md and input-map.json; read the exact brief; activated one native Goal and passed the exact create response through the active-goal binding guard; ran the assigned reveal helper once after saving and hashing discovery; read only the released plan copy; executed public-web searches and desk checks of the exact source records S001–S010; wrote this draft, frozen discovery, source map, source index, and query log.

**Not executed:** no database, API, municipality, or repository topic search; no title retrieval, study screening, sample, expert curation, citation chaining, duplicates audit, performance test, or validation study. No recall, superiority, effectiveness, or completeness measure is reported.

**Proposed:** settle scope; peer-review and freeze the pilot; run distinct routes; preserve full exports and provenance; independently screen a declared sample; adjudicate identity pairs; estimate conditional route misses and workloads with explicit denominators; report uncertainty; and keep unassessed records visible.
