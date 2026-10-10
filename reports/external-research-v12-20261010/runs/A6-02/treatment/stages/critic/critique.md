# Independent critic review — A6-02 treatment

**Stage:** critic  
**Review basis:** the frozen brief, investigator discovery, complete draft, source-map, released plan, and plan-reveal record named in the critic input map. The plan was treated as fallible input. Primary-source checks below were grouped by governing source neighborhood; no other candidate, evaluation, or campaign history was consulted.

## Overall assessment

The draft is a coherent, evidence-backed proposal and substantially repairs the released plan. It compares a hub-mediated aggregator with a network-owned catalog; adds SKOS mapping and PROV-O provenance; keeps source assertions, object/reproduction scope, metadata terms, and local access policy distinct; retains the help-link and downloadable-record options as conditional options; preserves the named owners and all negative constraints; and separates proposed checks from executed research. The DPLA deletion fix and ESE-to-EDM migration provide useful, bounded history with collection-specific consequences. I found no material false correction that requires rejecting the proposal.

Two material gaps remain in the research proposal: statement-specific RightsStatements.org scope is not resolved, and source terms/authorization are not made an explicit gate on the core catalog’s retained and publicly displayed metadata. One minor version ambiguity should also be surfaced. These are review findings, not a proposed final or permission to repair the investigator draft.

## Issue register

### C1 — Material incomplete: statement URI does not by itself resolve the subject/scope

**Draft locator:** “Rights assertions, scope and display,” especially the subject/scope paragraph; “URI, attribution, mapping, provenance and changes”; missing/conflicting statement bullets; and the optional help-link paragraph.

The draft correctly says to store the stated subject/scope and does not treat a URI as a network legal finding. It does not, however, investigate the documented scope distinctions among the RightsStatements.org terms. Its current general rule leaves a consequential mapping question unanswered: a URI may describe the underlying work and its digital copy, or may express an additional permission/restriction only for the digital object. For example, the RightsStatements.org applicability guidance distinguishes statements that apply to both work and digital object from digital-object-only terms; its “Other” statements (CNE, UND, NKC) are described as applying to both. A catalog cannot safely populate a single “object rights” field from the URI label alone.

**Evidence:** S22, RightsStatements.org, “Do the rights statements apply to works, digital representations of works or both?” (official page, scope by statement family). This complements S10’s CNE/UND/NKC conditions. S12 also makes IIIF rights apply to the resource to which it is attached; the property does not fix an omitted source subject.

**Assessment/action for a later complete proposal:** preserve the raw URI and source subject, record the statement family’s documented scope as a separate interpretive field, and flag disagreement or missing subject to the registrar. Keep the UI explicit about which resource the supplied statement describes. Do not infer status or expand a digital-object permission to the underlying work. This is a material completeness issue under obligations 2–3, not a finding that the draft’s existing raw-value preservation is wrong.

### C2 — Material incomplete: gate core record retention/publication on source terms

**Draft locator:** “Proposal and workflow comparison,” first two paragraphs and network-owned workflow row; “URI…changes,” provenance envelope; “Owner inputs still needed,” item 1 and item 5; optional-download conditions.

The recommended path says to harvest, keep immutable raw source records, and publish a normalized searchable view. It asks for feed access conditions in owner input 1, and correctly gates the download option on export approval, but never makes source-specific terms/owner authorization an explicit prerequisite for the core catalog’s retention and public display of source-provided metadata. Read-only/public retrieval does not itself establish permission to retain or republish the whole record. This is an unresolved source-by-source input, not a legal conclusion. The brief’s requirement to link records and expose their supplied statements supports the catalog goal, but does not supply the five collections’ metadata terms.

**Evidence:** the DPLA MAP/metadata-policy page (S04) says DPLA partners agree to dedicate any partner-provided metadata that may be copyright-protected to CC0; this is a DPLA hub condition, not a rule for this network. Europeana’s current licensing page (S08) likewise describes CC0 for metadata it receives under its provider relationship. These examples show that aggregation arrangements can set explicit metadata terms distinct from object rights. The five collection terms are absent from the frozen brief and remain UNKNOWN.

**Assessment/action for a later complete proposal:** put a per-collection terms/authorization gate before snapshot retention and public catalog display, record the allowed fields, retention and attribution conditions, and keep any further download approval as a separate optional-path gate. Preserve source links and never assume a metadata term licenses an image or reproduction. This is material to the recommended workflow and optional export.

### C3 — Minor locator/wording: DPLA profile page exposes conflicting version signals

**Draft locator:** workflow comparison, DPLA MAP version sentence; source-map S03–S04.

The draft accurately says the profile page offers MAP 5.0 and the API field reference states MAP 3.1. The same profile landing page also says “current version is 4.0” while offering a 5.0 download. This is a source-page version ambiguity, not evidence that the draft selected the wrong DPLA contract: it sensibly says to pin the exact interface/profile version. Record the page’s conflicting signals and leave the applicable profile version unresolved until a real integration identifies the artifact used.

**Evidence:** S03 and S04, current DPLA API field reference and MAP landing page; the latter’s page text contains both statements.

### C4 — Honestly unresolved external input: no competent-reference artifact is in the frozen inputs

The stage packet contains no competent-reference proposal or measured sequential-review trace. I therefore contrast methods, not candidate performance: an ordinary competent clause-by-clause review would open the same governing specification again as each obligation arises; the grouped pass opens one neighborhood (for example OAI-PMH deletion/date/token rules) and then resolves each obligation’s distinct condition from those shared bytes. The investigator makes the same bounded, non-empirical claim and does not invent a reference result. A side-by-side result is UNKNOWN and cannot be assessed from this packet.

## Obligation and plan-disposition review

| Brief obligation | Released-plan treatment | Critic assessment of draft |
| --- | --- | --- |
| 1. Two workflows plus analogous vocabulary/provenance mechanism | Binary reusable flag and universal thumbnail badge; aggregator route omitted | Materially corrected. Hub contribution and network harvest/publish are meaningfully compared; SKOS and PROV-O are relevant analogues, not asserted as products. |
| 2. Distinguish statement, license, public-domain assertion, local policy | Omeka-only; provenance assumed to be a source link | Correct distinctions and no independent legal finding. Apply C1 to ensure URI-specific subject/scope is covered. Omeka S remains an option, not a winner. |
| 3. URI, attribution, mapping, update conditions; missing/conflicting values | Discard identifiers; no missing/conflict workflow | Strong correction: raw URI/value, field path, attribution, mapping/version, source version, OAI deletion declarations, stale/unavailable and conflict states are addressed. C1 is the material remaining scope gap; C2 conditions retained/public metadata. |
| 4. Migration or released behavior change and per-collection effects | No released history; two records proposed for five collections | Correctly replaced with the pinned DPLA Issue 739 history and Europeana ESE-to-EDM mapping warning; one per-source-schema sample plus edge cases is more appropriate than two records for five collections. Historical claims are bounded to public documentation/runbook and not represented as a reproduced incident. |
| 5. Supported optional reuse-help and downloadable attributed metadata | Plan explicitly marks both as optional and asks not to drop them | Correctly retained as optional, with source/registrar and format conditions and evidence-based field/record exclusions. C2 should separately gate the core catalog; do not confuse the download condition with core-publication authority. |
| 6. Named owners and ambiguity routing | Exact owner boundary retained | Draft preserves each registrar’s statement authority and metadata lead’s mapping/provenance authority; decisions remain explicitly unresolved rather than being invented. |
| 7. Negative constraints | Four binding exclusions | Preserved throughout: no new license, thumbnail inference, restricted scraping, or unknown-to-public-domain conversion. |
| 8. Complete proposal and executed/proposed separation | No complete final | A single proposal, comparison, recommendations, alternatives, owner inputs, evidence/version applicability, and validation table are present. Documentation review and read-only history inspection are correctly distinguished from product operation; product/feed/UI/export checks remain NOT RUN or PROPOSED. |

## Discovery, evidence, and validation boundaries

The most useful discovery beyond the tentative plan is the combination of OAI-PMH’s repository-declared deletion behavior, the DPLA NARA roster-versus-delete-file failure, and ESE’s flat-field mapping ambiguity. Those produce concrete per-collection controls: store Identify/deletion policy, count delete outcomes, retain snapshots for reconciliation, and review source-specific date/format scope before mapping. IIIF is appropriately framed as a possible presentation layer rather than a harvester; Omeka S is correctly treated as an editorial/publishing component requiring adapters and provenance around it. No source establishes that any of the five collections offers a compatible feed, permits public metadata reuse, or exposes IIIF.

The investigator’s executed/proposed table is mostly well calibrated. The source reads and pinned GitHub inspection are research observations only; there was no live collection feed/API query, Omeka installation/import, product UI run, legal review, or catalog validation. Proposed future fixture and migration checks remain proposed. The claim that DPLA documentation/readme describes a failure and fix is supported by the pinned commit; it is not independent confirmation of the operational incident.

## Grouped verification method

I checked related questions by shared governing source and reused the same source bytes: OAI-PMH §§2.5.1, 3.3.2–3.5 and Identify; RightsStatements.org CNE/UND/NKC plus the statement-applicability page; DPLA API/profile and partner metadata policy; Europeana ESE/EDM and licensing; IIIF Presentation 3.0 rights/requiredStatement; SKOS mapping semantics; and the pinned DPLA commit/runbook. Within each group, I kept the distinct scope/default/exception questions separate. Compared with a competent sequential clause review, this avoids reopening the same source for each clause while preserving all eight obligations and the draft’s discovery breadth. The absent competent-reference artifact prevents an empirical quality or time comparison.

## Native Goal provenance

Actual create_goal returned threadId=01a12428-01ef-7f61-8b03-6710bf615d91, the frozen objective verbatim, status=active, tokensUsed=0, timeUsedSeconds=0, createdAt=1791607995, updatedAt=1791607995, remainingTokens=null, and completionBudgetReport=null. The native result exposed active status; it did not expose provider/model, a separate activation receipt, or a separate activation timestamp: **UNKNOWN**. Terminal completion is recorded only by the later native Goal update; no receipt is fabricated here.

