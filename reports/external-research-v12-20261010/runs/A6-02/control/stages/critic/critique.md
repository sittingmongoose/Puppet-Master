# Independent critic review — A6-02-control

**Stage:** critic  
**Review scope:** the complete brief, exact released plan, investigator discovery and draft, investigator source map, and its source index. The seven reviewed frozen documents match their recorded SHA-256 values. The frozen plan-reveal helper record was not inspected.  
**Native Goal activation:** the supported Goal tool returned status active for objective “ER12 critic stage, run A6-02-control: execute ER12_RUNTIME/runs/A6-02/control/stages/critic/assignment.md; preserve complete brief scope and save required outputs before completing this native Goal.” Directly returned fields: threadId 01a1242b-d3a9-7e52-878b-d4b23a9cb1d4; tokensUsed 0; timeUsedSeconds 0; createdAt 1791608250; updatedAt 1791608250. Those are preserved as returned, without a fabricated receipt or converted timestamp. Goal provenance beyond these fields and terminal fields at the time this artifact was saved are UNKNOWN.

## Overall assessment

The investigator’s draft is a strong, coherent response to the brief and the released plan. It corrects the central unsafe design, distinguishes the four kinds of information, preserves the optional help/export scope, retains exact owner roles and negative constraints, and presents a credible source-preserving update proposal. Its plan table covers every numbered clause. The source map preserves the limits of search excerpts, version mismatch, and non-tested product descriptions.

**One material incomplete issue remains:** the Omeka REST API is named as a pilot candidate, but the proposed Omeka API checks omit the API’s destructive update semantics. The source docs say PUT replaces the whole resource; PATCH preserves unspecified keys, while values supplied for an RDF property replace that property’s full value set. That matters to the proposed source-preserving update contract and should be an explicit proposed check or limitation.

I found no material wrong, unsupported, or minor locator/wording issue that warrants changing the draft’s central recommendation. I made no edits to the investigator’s draft or discovery.

## Exact plan and brief coverage

| Brief obligation | Draft treatment | Critic assessment |
| --- | --- | --- |
| 1. Compare two workflows and analogous vocabulary/provenance mechanism | Compares Metis and Omeka S; adds DPLA as a code-backed comparator; discusses SKOS, Getty and PROV-O. | Complete and useful. It keeps the workflow patterns distinct and does not select a winner. |
| 2. Distinguish source statement, license, public-domain claim and access policy | Separate model/table; preserves source scope; no legal determination. | Complete. Europeana guidance is labeled platform-specific rather than local authority. |
| 3. URI, attribution, mapping, update conditions; missing/conflicting input | Preserves raw text/URI and mapping provenance; adds missing/conflict/update queue; covers IIIF neighborhood. | Complete, with the API update-test gap below. |
| 4. Migration or released behavior change with collection consequences | IIIF 2.1.1 to 3.0.0 migration and DPLA NARA delete history; per-collection consequences and unknown prevalence are explicit. | Complete. Both examples are bounded and not generalized to the five collections. |
| 5. Optional reuse-help link and downloadable source-attributed record | Retained as optional, conditional owner-approved scope; candidate IIIF and Omeka paths and compatibility checks are proposed. | Complete. It is neither discarded due to baseline limits nor falsely presented as implemented. |
| 6. Owner decisions and routing | Exact registrar and metadata-lead authority is retained; open owner inputs are listed. | Complete. No actual owner decision is invented. |
| 7. Negative constraints | Rejects new license grants, thumbnail inference, restricted scraping, and unknown-to-public-domain conversion. | Complete and aligned with the corrected design. |
| 8. Evidence-backed proposal and separated validation | Full proposal, source/version limits, owner inputs, and executed/research versus proposed/NOT_RUN table. | Complete. Documentation review is explicitly not product validation. |

## Classified findings

| Classification | Locator | Evidence and assessment |
| --- | --- | --- |
| **Material incomplete** | Draft “Workflow comparison and fit,” Omeka S row; “Validation status and next checks,” Omeka S import/API/OAI/access row. | The row proposes API pagination, JSON-LD, access, and other checks but omits API update semantics. The official Omeka REST API documentation [S27](https://omeka.org/s/docs/developer/api/rest_api/) describes PUT as a full replacement and PATCH as preserving unspecified keys while replacing the supplied RDF-property value collection. Because the draft proposes an update/reconciliation contract and records that statements can change, propose an isolated test for PUT versus PATCH, omitted versus explicitly empty properties, and multi-valued rights fields before relying on API writes. This is a coverage gap in validation planning, not evidence that Omeka is unsuitable. |
| **Honestly unresolved external input** | Draft “Workflow comparison and fit,” Omeka S row; “Owner decisions and open inputs.” | A conditional alternative exists if a collection already publishes through Omeka S: the official Omeka S Item Importer [C01](https://omeka.org/s/modules/Osii/) describes one-way sync of remote items and related media/item sets, with later imports overwriting local edits. Whether any of the five collections uses Omeka S is unknown. This is a bounded opportunity to ask registrars about, not a requirement to expand the product search absent that input. |
| **Honestly unresolved external source retrieval** | Draft “Rights, reuse and access model,” CNE example; “Bounded conclusions and limitations.” | The CNE distinction is appropriately bounded in the draft and source record S21. The full English CNE page was not directly available in the earlier session; this review found official-domain CNE materials but did not observe the full current English page. The draft correctly reports the limitation. |
| **Material wrong** | None found. | — |
| **Unsupported** | None found. | Key consequential claims reviewed against public primary documentation or pinned primary code/history, with access limits recorded. |
| **Minor locator/wording** | None found. | — |

## Primary-source review and evidence quality

The carried sources index is navigable and the source map gives stable IDs with exact URL, version/commit where applicable, locator, access UTC, observed operation, governing condition, and applicability. I independently checked key primary materials read-only; results and locators are recorded in this stage’s [source map](source-map.json).

- **DPLA:** The pinned README at commit 698795ed19d8f1d8032f988e68123d39dd842413 confirms per-source mapping, required rights validation, DPLA-specific URI normalization, accepted-list checks, warning/error reporting, and the invalid-rights-plus-other-rights-field exception [S01](https://github.com/dpla/ingestion3/blob/698795ed19d8f1d8032f988e68123d39dd842413/README.md). The same commit confirms zero deletes in the listed December 2025 and January 2026 NARA cycles, the June 2026 fix, and the unresolved reprocessing decision [S02](https://github.com/dpla/ingestion3/blob/698795ed19d8f1d8032f988e68123d39dd842413/docs/ingestion/README_NARA.md). The draft keeps this history NARA-specific.
- **Europeana:** The Metis article describes sample-data validation and preview as a pilot workflow, not a current service guarantee [S04](https://pro.europeana.eu/index.php/post/the-metis-sandbox-or-finding-joy-in-working-with-data). Rights guidance distinguishes CC0, Public Domain Mark, CC licences and Rights Statements, while limiting its accepted set and policy to Europeana [S06](https://pro.europeana.eu/index.php/page/available-rights-statements).
- **IIIF and controlled vocabularies:** The Presentation API 3.0.0 spec and change log support the draft’s URI/text, attribution and required-statement distinctions [S10](https://iiif.io/api/presentation/3.0/), [S11](https://iiif.io/api/presentation/3.0/change-log/). The W3C SKOS Recommendation supports the transitivity and mapping statements [S16](https://www.w3.org/TR/skos-reference/).
- **Omeka S:** Official module/manual material confirms CSV Import 2.6.2 and its compatibility listing; Revise versus Update behavior and the apparent Undo tension; Rights Statements module 1.2.1 with 11 choices; Value Suggest’s optionality and conversion behavior; OAI-PMH Repository’s deletion TODO; REST API formats and update semantics; Access module separation of resource visibility, file access and embargo; and Custom Vocab’s duplicate-label/conversion behavior [S22](https://omeka.org/s/modules/CSVImport/), [S23](https://omeka.org/s/docs/user-manual/modules/csvimport/), [S24](https://omeka.org/s/modules/RightsStatements/), [S25](https://omeka.org/s/docs/user-manual/modules/valuesuggest/), [S26](https://omeka.org/s/modules/OaiPmhRepository/), [S27](https://omeka.org/s/docs/developer/api/rest_api/), [S28](https://omeka.org/s/modules/Access/), [S29](https://omeka.org/s/docs/user-manual/modules/customvocab/). Several direct Omeka page opens timed out; official-domain search results were used and that operation is recorded rather than represented as a live installation.
- **RightsStatements.org:** The draft correctly distinguishes UND from CNE and from no statement. The full English CNE statement page could not be independently opened in this review, so the already-recorded source limitation remains [S20](https://rightsstatements.org/page/UND/1.0/?language=en), [S21](https://rightsstatements.org/page/CNE/1.0/?language=en).

## Validation and unresolved inputs

The draft’s execution labels are coherent: it reports public documentation/code review as executed research only; product operation, collection feeds, optional-path compatibility, and the five-source scenario remain proposed or NOT_RUN. The actual reviewed brief authorizes read-only public research and explicitly does not require implementation. No test product, feed, account, restricted asset, or executable code was used in this critic stage.

The collection-specific facts remain honestly unresolved: actual feed type, IDs, statement scope, IIIF prevalence, source update/delete semantics, access rules, and available export endpoints. Owner decisions remain with the registrars and network metadata lead as stated in the brief. The review does not require reducing scope or choosing a product.

**Critique saved before native Goal completion.** Terminal Goal fields were UNKNOWN at this save checkpoint and must not be inferred from T3 task completion.
