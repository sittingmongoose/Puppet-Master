# Critic source index — A6-02 treatment

Source identity, observed operation, access window, governing conditions, and applicability are in [source-map.json](../source-map.json). The web retrieval tool did not return per-request completion timestamps; source-map access windows are bracketed by UTC clock observations. Failed direct opens are disclosed and search-result text from the official source is distinguished from direct opens.

## Protocol, rights scope, and source conditions

- [S01 — OAI-PMH 2.0](https://www.openarchives.org/OAI/openarchivesprotocol.html): deletedRecord declaration, datestamps, metadataPrefix and flow control.
- [S10 — RightsStatements.org 1.0 Other statements](https://rightsstatements.org/page/collection-other/1.0/?language=en): CNE, UND and NKC conditions.
- [S11 — Creative Commons public-domain tools](https://creativecommons.org/public-domain/): CC0 versus PDM and applicability cautions.
- [S22 — RightsStatements.org scope guidance](https://rightsstatements.org/en/2018/12/where-statements-apply.html): statement-specific work/digital-object scope; basis of critique C1.

## Aggregation and migration

- [S02 — DPLA Hub Network](https://pro.dp.la/hubs): Content/Service Hub contribution workflow.
- [S03 — DPLA API Field Reference](https://pro.dp.la/developers/field-reference): API MAP 3.1, sourceResource/object rights, originalRecord.
- [S04 — DPLA MAP and metadata policy](https://pro.dp.la/hubs/metadata-application-profile): version signals and partner metadata terms; basis of critique C2/C3.
- [S07 — Europeana ESE-to-EDM guidance](https://pro.europeana.eu/page/ese-documentation): flat-field migration and date/format ambiguity.
- [S08 — Europeana Licensing Framework](https://pro.europeana.eu/index.php/page/europeana-licensing-framework): CC0 for received metadata versus edm:rights for previews/digital objects.
- [S16 — DPLA Issue 739 commit](https://github.com/dpla/ingestion3/commit/608ea023de200df48e8241ed08e0fa49466646f9): pinned NARA deletion-processing correction and runbook.

## Presentation, mapping, and optional tool

- [S12 — IIIF Presentation API 3.0](https://iiif.io/api/presentation/3.0/): rights URI, requiredStatement, provider and user-facing links.
- [S13 — W3C SKOS Reference](https://www.w3.org/TR/skos-reference/): exactMatch and closeMatch.
- [S19 — Omeka S CSV Import](https://omeka.org/s/docs/user-manual/modules/csvimport/): import strategy, operator and job requirements.
- [S20 — Omeka S REST API Reference](https://omeka.org/s/docs/developer/api/rest_api_reference/): JSON-LD values and value-level visibility.

