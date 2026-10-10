# Source index — A6-02-control investigator

All sources were retrieved read-only. Access batch time observed from the session clock: **2026-10-10 04:43:22 UTC**. For exact URLs, version/commit, locator, observed operation, governing conditions and applicability, see the matching source record in [`../source-map.json`](../source-map.json). Stable IDs below are used throughout `discovery.md` and the later draft.

## Aggregation workflows and metadata

- [S01 — DPLA Ingestion 3 README at commit `698795e…`](https://github.com/dpla/ingestion3/blob/698795ed19d8f1d8032f988e68123d39dd842413/README.md): API/file/OAI ingestion, provider-specific mapping, rights validation/normalization, error/warning reports and exports.
- [S02 — DPLA NARA delta pipeline at the same commit](https://github.com/dpla/ingestion3/blob/698795ed19d8f1d8032f988e68123d39dd842413/docs/ingestion/README_NARA.md): documented update/delete bug and later fix; NARA-specific.
- [S03 — DPLA API Field Reference](https://pro.dp.la/developers/field-reference): retrieved through official search excerpt; direct open returned 403. API MAP version and field roles; version labels elsewhere are inconsistent.
- [S04 — Europeana Metis Sandbox workflow](https://pro.europeana.eu/index.php/post/the-metis-sandbox-or-finding-joy-in-working-with-data): sample import through validation/transformation/normalization/enrichment to preview; described as pilot capability.
- [S08 — EDM Definition v5.2.7, April 2016](https://pro.europeana.eu/files/Europeana_Professional/Share_your_data/Technical_requirements/EDM_Documentation/EDM_Definition_v5.2.7_042016.pdf): §3.2.32 p.39, aggregation/WebResource rights cardinality and scope; neighboring controlled `edm:type` and preservation of local `dc:type`.

## Rights and display/access behavior

- [S05 — RightsStatements.org FAQ](https://rightsstatements.org/en/documentation/faq.html): official search excerpt distinguishes descriptive statements from licenses and specifies `/vocab/[id]/[version]/`; direct open repeatedly returned 526/timeout.
- [S20 — Copyright Undetermined, UND/1.0](https://rightsstatements.org/page/UND/1.0/?language=en): reviewed but unresolved; the page says this statement is not a license and includes accuracy/other-rights notices.
- [S21 — Copyright Not Evaluated, CNE/1.0](https://rightsstatements.org/page/CNE/1.0/?language=en): official search excerpt states the institution has not evaluated status; direct open returned 526.
- [S06 — Europeana rights vocabulary guide](https://pro.europeana.eu/index.php/page/available-rights-statements): CC0, Public Domain Mark, CC licenses and RightsStatements.org distinctions; applicable to Europeana's own accepted set.
- [S07 — Europeana statement-selection guidance](https://pro.europeana.eu/index.php/page/selecting-a-rights-statement): best efforts, organizational policy, and work/digital-object scope (updated 2024-09-20).
- [S09 — IIIF Presentation API 2.1.1](https://iiif.io/api/presentation/2.1/): prior `license`/`attribution` structure.
- [S10 — IIIF Presentation API 3.0.0](https://iiif.io/api/presentation/3.0/): current stable fields and conditions for `rights`, `requiredStatement`, provider, `seeAlso` and `rendering`.
- [S13 — IIIF rights recipe](https://iiif.io/api/cookbook/recipe/0008-rights/): machine-oriented rights URI versus required visible text.
- [S14 — IIIF structured metadata links recipe](https://iiif.io/api/cookbook/recipe/0053-seeAlso/): semantics of `homepage`, `seeAlso` and `rendering`.
- [S15 — IIIF Authorization Flow API 2.0.0](https://iiif.io/api/auth/2.0/): access-controlled resource workflow, distinct from reuse statements.

## Migration, mapping and provenance

- [S11 — IIIF Presentation 3.0 change log](https://iiif.io/api/presentation/3.0/change-log/): exact breaking renames and 2.1.1→3.0.0 reasons.
- [S12 — IIIF issue #1287](https://github.com/IIIF/api/issues/1287): history of creator attribution versus publisher-defined visible statement.
- [S16 — W3C SKOS Reference](https://www.w3.org/TR/skos-reference/): mapping relations and non-transitive `closeMatch`.
- [S17 — Getty AAT Editorial Guidelines](https://www.getty.edu/publications/vocabularies-editorial-guidelines/aat-guidelines/1_about_aat/1.1/): persistent IDs, concepts, hierarchy, source warrants and term/display distinction.
- [S18 — Getty Vocabularies as Linked Open Data, May 2023](https://www.getty.edu/research/tools/vocabularies/Linked_Data_Getty_Vocabularies.pdf): contributors, sources, merged records, revision activity and identifiers.
- [S19 — W3C PROV-O](https://www.w3.org/TR/prov-o/): entities, activities, agents, derivation and generation provenance.

## Omeka S workflow, modules and versioned behavior

Official Omeka pages retrieved read-only through the official site search at **2026-10-10 04:49:12 UTC**; direct page opens timed out for the first batch. See source records for access method and exact limits. No module or endpoint was installed, configured or exercised.

- [S22 — CSV Import module 2.6.2](https://omeka.org/s/modules/CSVImport/): CSV/TSV/ODS entity import/update; minimum Omeka S ^4.0.0.
- [S23 — CSV Import manual](https://omeka.org/s/docs/user-manual/modules/csvimport/): exact revise/update/delete and identifier semantics; import history/logs and an Undo control.
- [S24 — Rights Statements module 1.2.1](https://omeka.org/s/modules/RightsStatements/): template field with 11 linked URI plus label choices; verify current coverage.
- [S25 — Value Suggest manual](https://omeka.org/s/docs/user-manual/modules/valuesuggest/): rights and CC suggestions are optional; batch conversions can leave labels empty.
- [S26 — OAI-PMH Repository 3.4.14](https://omeka.org/s/modules/OaiPmhRepository/): OAI-PMH publishing, required `oai_dc`, configurable formats; media exposure defaults off and deletion support is TODO.
- [S27 — REST API manual](https://omeka.org/s/docs/developer/api/rest_api/): default JSON-LD, alternate response formats from 4.1.0, anonymous public reads and authenticated private/action access.
- [S28 — Access module](https://omeka.org/s/modules/Access/): file-access/embargo gates remain separate from resource visibility; resource notices remain visible.
- [S29 — Custom Vocab manual](https://omeka.org/s/docs/user-manual/modules/customvocab/): local URI vocabularies are possible, but duplicate labels and conversion may lose source labels.
