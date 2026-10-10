# Source index — A6-02-control reviser

All evidence is bounded public primary documentation, published source code/history, or official vocabulary material. Retrievals were read-only. No source code was run, no account or product was used, and no collection endpoint was accessed. The complete identity record for every stable ID—including exact URL, release/commit, locator, access UTC, operation, observed condition/default/exception and applicability—is in [source-map.json](../source-map.json).

Stable source IDs are preserved: S01–S29 retain the investigator source-map bindings; C01 is the separately reviewed Omeka S Item Importer source added by the critic. The reviser adds observations to those IDs without changing their source identity.

## Aggregation, publishing and update history

### S01

[DPLA Ingestion 3 README](https://github.com/dpla/ingestion3/blob/698795ed19d8f1d8032f988e68123d39dd842413/README.md)

- **Version/release:** GitHub commit 698795ed19d8f1d8032f988e68123d39dd842413 (main HEAD observed at retrieval); commit date 2026-10-09T14:10:10Z
- **Locator:** Mapping and Validation; Validations; edmRights normalization and validation; NARA section references in S02; Running ingests
- **Applicability:** Operational comparator for five different sources, per-collection mapping, original retention and update diagnostics; not a rule that the regional network should rewrite or decide source claims.

### S02

[DPLA NARA Delta Ingest Pipeline](https://github.com/dpla/ingestion3/blob/698795ed19d8f1d8032f988e68123d39dd842413/docs/ingestion/README_NARA.md)

- **Version/release:** Same pinned commit as S01; document states last updated February 2026
- **Locator:** History table and warning, lines/section around 2025-12, 2026-01 and June 2026 fix
- **Applicability:** A bounded update-safety case motivating per-collection insert/update/delete counts, tombstones and sample-ID reconciliation; no claim that pilot feeds have this bug.

### S03

[DPLA API Field Reference](https://pro.dp.la/developers/field-reference)

- **Version/release:** Living documentation; search result states DPLA API currently implements MAP 3.1; separate official MAP page search result had 4.0/5.0 labels; not a coherent single release declaration
- **Locator:** Metadata Application Profile; definitions of dataProvider, originalRecord, provider, sourceResource, hasView.rights, object.rights
- **Applicability:** Useful field neighborhood and a reason to pin the pilot's own output contract; low-confidence as a current version statement.

### S04

[The METIS Sandbox - or finding joy in working with data](https://pro.europeana.eu/index.php/post/the-metis-sandbox-or-finding-joy-in-working-with-data)

- **Version/release:** Europeana Common Culture pilot article; no API release version declared on page
- **Locator:** Metis Sandbox workflow description: import, validation, transformation, normalization, enrichment, publication, per-step reports and preview
- **Applicability:** Process pattern for provider-facing preflight and preview; no use/availability check performed.

### S22

[Omeka S CSV Import module release page](https://omeka.org/s/modules/CSVImport/)

- **Version/release:** Module release listing: CSV Import 2.6.2, released 2024-10-22, minimum Omeka S ^4.0.0
- **Locator:** Module description and release compatibility table
- **Applicability:** A configurable import step for an Omeka S pilot, not evidence that it natively aggregates five independent source feeds or supplies source-aware reconciliation.

### S23

[Omeka S CSV Import user manual](https://omeka.org/s/docs/user-manual/modules/csvimport/)

- **Version/release:** Living manual; module options correspond to the CSV Import 2.x workflow; deployment version not selected
- **Locator:** Permissions and UTF-8 preparation; Advanced Settings actions; identifier matching; Past Imports and Undo
- **Applicability:** Concrete update/delete and audit behaviors to include in an isolated fixture test; do not assume empty-field or duplicate-ID semantics are suitable for five collection feeds.

### S26

[Omeka S OAI-PMH Repository module page](https://omeka.org/s/modules/OaiPmhRepository/)

- **Version/release:** Module 3.4.14, released 2026-10-05, minimum Omeka S ^4.0.0
- **Locator:** Module purpose; global/site endpoints; namespace; formats and file exposure defaults; TODO list
- **Applicability:** Optional publishing path for a source-attributed metadata record; OAI output, crosswalk, endpoint and tombstone/delete behavior must be tested before choosing it as a feed. It is a repository/publisher, not an inbound harvester.

### S27

[Omeka S REST API developer documentation](https://omeka.org/s/docs/developer/api/rest_api/)

- **Version/release:** Living developer documentation; non-JSON-LD response formats documented from Omeka S 4.1.0
- **Locator:** Endpoint and response/request formats; authentication and public resource access
- **Applicability:** Potential read/export/import integration path; verify pagination, fields, access exposure and version-specific JSON-LD behavior in a safe fixture before relying on it.

### C01

[Omeka S Item Importer module page](https://omeka.org/s/modules/Osii/)

- **Version/release:** Module 1.4.0, released 2024-03-18; minimum Omeka S ^4.0.0
- **Locator:** Module overview and release compatibility table; lines 24-27 and 39-42
- **Applicability:** A conditional alternative if one or more collections already publish Omeka S; it does not address arbitrary heterogeneous feeds and has local-edit overwrite consequences.

## Rights statements, licenses, public-domain tools and access

### S05

[Rights Statements FAQ](https://rightsstatements.org/en/documentation/faq.html)

- **Version/release:** FAQ unversioned; vocabulary statement URI form explicitly carries its own version, commonly /1.0/
- **Locator:** General: what statements are and how they differ from CC licenses; Technical: URI formats and using /vocab/ URI
- **Applicability:** Supports distinction and URI modeling; do not present the statements as network-issued grants.

### S06

[Understanding the rights statements used by Europeana](https://pro.europeana.eu/index.php/page/available-rights-statements)

- **Version/release:** Living Europeana rights guidance; page lists its current 14 accepted options
- **Locator:** Sections 1-3: rights statements, Creative Commons public-domain tools and CC licenses
- **Applicability:** Terminology distinction and cautious statement selection pattern; no legal conclusion for any object.

### S07

[How to select an accurate rights statement](https://pro.europeana.eu/index.php/page/selecting-a-rights-statement)

- **Version/release:** Europeana guidance updated 2024-09-20
- **Locator:** Section 1 on best efforts/organizational sharing policy; Section 3 on content vs digital object
- **Applicability:** Rights/access and owner routing context; maintain source scope and avoid importing Europeana rules as local policy.

### S08

[Europeana Data Model Definition v5.2.7](https://pro.europeana.eu/files/Europeana_Professional/Share_your_data/Technical_requirements/EDM_Documentation/EDM_Definition_v5.2.7_042016.pdf)

- **Version/release:** EDM Definition v5.2.7 (April 2016)
- **Locator:** Section 3.2.32, p. 39: edm:rights; surrounding classes/obligation table
- **Applicability:** Demonstrates object/representation scope and separate original/mapped controlled terms.

### S15

[IIIF Authorization Flow API 2.0](https://iiif.io/api/auth/2.0/)

- **Version/release:** Authorization Flow API 2.0.0, published 2023-07-10; current stable listed by IIIF
- **Locator:** Authorization services on a Manifest/Image content resource; simple flow; substitute/status handling
- **Applicability:** Separate collection access conditions from reuse statement display if IIIF access controls are present.

### S20

[Rights Statements: Copyright Undetermined](https://rightsstatements.org/page/UND/1.0/?language=en)

- **Version/release:** RightsStatements.org vocabulary statement UND/1.0
- **Locator:** Statement definition, Notices, disclaimer and URI for this statement
- **Applicability:** Keep distinct from no statement and from Copyright Not Evaluated; only display if supplied by the responsible collection registrar.

### S21

[Rights Statements: Copyright Not Evaluated](https://rightsstatements.org/page/CNE/1.0/?language=en)

- **Version/release:** RightsStatements.org vocabulary statement CNE/1.0
- **Locator:** Statement definition and URI for this statement
- **Applicability:** Semantic example only; show it only when the collection registrar actually supplies it.

### S28

[Omeka S Access module page](https://omeka.org/s/modules/Access/)

- **Version/release:** Module page lists release 3.4.48; current deployment compatibility was not selected
- **Locator:** Description, independent visibility/access/embargo rules, file and resource-notice behavior
- **Applicability:** Supports modeling local file/access policy separately from reuse statement. A pilot must not retrieve or scrape restricted files and must test metadata notice versus media visibility.

## IIIF URI, attribution, migration and optional links

### S09

[IIIF Presentation API 2.1.1](https://iiif.io/api/presentation/2.1/)

- **Version/release:** Presentation API 2.1.1; previous version to stable 3.0.0
- **Locator:** Status of this Document; Manifest example; Rights and Licensing Properties
- **Applicability:** Legacy collection manifest crosswalk source.

### S10

[IIIF Presentation API 3.0](https://iiif.io/api/presentation/3.0/)

- **Version/release:** Presentation API 3.0.0; stable published 2020-06-03
- **Locator:** Status; properties rights, requiredStatement, provider, seeAlso, rendering; responses/context/versioning
- **Applicability:** Good target pattern if a collection uses IIIF; not evidence that a current collection publishes compliant v3 manifests.

### S11

[IIIF Presentation API 3.0 Change Log](https://iiif.io/api/presentation/3.0/change-log/)

- **Version/release:** Change log for 3.0.0, backwards-incompatible from 2.1.1
- **Locator:** Sections 1.2.3, 1.2.5, 1.2.12, 1.2.14
- **Applicability:** Primary migration rule source for collection-specific IIIF manifests.

### S12

[IIIF API issue #1287: Rename attribution, change semantics to any text that must be rendered](https://github.com/IIIF/api/issues/1287)

- **Version/release:** Issue opened 2017-10-12; milestone Presentation 3.0 - RC1; closed per page
- **Locator:** Issue description and proposal; compare adopted wording in S11/S10
- **Applicability:** Explains why old creator attribution and required visible statement must not be conflated in local migration.

### S13

[IIIF Cookbook recipe 0008: Rights statement](https://iiif.io/api/cookbook/recipe/0008-rights/)

- **Version/release:** Cookbook recipe for Presentation API 3.0; non-normative example
- **Locator:** Use Case and differences between `rights` and `requiredStatement`
- **Applicability:** Separate machine rights links from visible supplied text and optional help/credit UI.

### S14

[IIIF Cookbook recipe 0053: Linking to Structured Metadata](https://iiif.io/api/cookbook/recipe/0053-seeAlso/)

- **Version/release:** IIIF Cookbook; current recipe page, no discrete release tag
- **Locator:** Differences between homepage, rendering and seeAlso
- **Applicability:** Optional source-attributed downloadable metadata record and help-link separation.

## Controlled vocabulary and provenance

### S16

[W3C SKOS Simple Knowledge Organization System Reference](https://www.w3.org/TR/skos-reference/)

- **Version/release:** W3C Recommendation 2009-08-18
- **Locator:** Sections 10.1 and 10.6.3: mapping properties and transitivity; section 10.6.8 distinction from owl:sameAs
- **Applicability:** Controlled-term mapping rule for heterogeneous source vocabularies.

### S17

[Getty AAT Editorial Guidelines: General Information](https://www.getty.edu/publications/vocabularies-editorial-guidelines/aat-guidelines/1_about_aat/1.1/)

- **Version/release:** Living editorial guideline page; no stable numeric edition shown on this section
- **Locator:** 1.1.1.3 Structure of Data; facets/hierarchies; concept warrant; 3.3 Terms cross-reference
- **Applicability:** Analogy for governed vocabularies with persistent IDs and evidence, not a universal vocabulary requirement.

### S18

[Getty Vocabularies and Linked Open Data](https://www.getty.edu/research/tools/vocabularies/Linked_Data_Getty_Vocabularies.pdf)

- **Version/release:** Getty presentation labeled May 2023
- **Locator:** Pages 27-30: merged records, contributors, sources and revision history; pages 56-60: linked data, persistent IDs and attribution
- **Applicability:** Analogous controlled-vocabulary/provenance model: retain contributor/source/revision alongside a normalized concept.

### S19

[W3C PROV-O: The PROV Ontology](https://www.w3.org/TR/prov-o/)

- **Version/release:** W3C Recommendation 2013-04-30
- **Locator:** Starting-point properties; wasDerivedFrom; wasGeneratedBy; used; wasAssociatedWith; qualified usage/generation patterns
- **Applicability:** Optional formal model for recording collection source, mapper/ruleset, time and derived field history.

## Omeka vocabulary entry and mapping behavior

### S24

[Omeka S Rights Statements module release page](https://omeka.org/s/modules/RightsStatements/)

- **Version/release:** Module 1.2.1, released 2023-01-19, listed for Omeka S ^3.0.0 || ^4.0.0
- **Locator:** Module description, Rights Statement data type, and compatibility table
- **Applicability:** Possible data-entry aid, not a binary permission mapper or complete network-wide decision. Compare current statement coverage and preservation behavior before selection.

### S25

[Omeka S Value Suggest user manual](https://omeka.org/s/docs/user-manual/modules/valuesuggest/)

- **Version/release:** Living user manual; module release is not selected for this study
- **Locator:** RightsStatements.org and Creative Commons vocabulary list; suggestion behavior; batch conversion of existing values
- **Applicability:** Evidence that Omeka suggestions do not alone enforce complete controlled input; preserve raw text and URI separately and do not treat autocomplete as a rights-validation gate.

### S29

[Omeka S Custom Vocab user manual](https://omeka.org/s/docs/user-manual/modules/customvocab/)

- **Version/release:** Living user manual; module release is not selected for this study
- **Locator:** URI vocabularies with labels; duplicate URI behavior; converting existing values
- **Applicability:** Potential local mapping aid, with a documented label-loss risk. It does not substitute for external, versioned SKOS mapping provenance.

## Reviser rechecks

- **S27:** Official REST API source page direct open timed out; official search result for that exact URL exposed the documented PUT/PATCH semantics and other API sections. See reviser_primary_source_rechecks in the map.
- **C01:** Official module page direct open timed out; official search result exposed version, one-way sync, overwrite behavior and compatibility. The path remains conditional on a registrar-confirmed Omeka S source.
- **S21:** Direct English CNE page open timed out; official search text supplied the definition and URI. This does not remove the direct-retrieval limitation.
