# Source index — A6-02 investigator

Source identities, observed access windows, versions/commits, exact locators, conditions and applicability are recorded in [source-map.json](../source-map.json). The access timestamp is a bounded UTC window because the web retrieval tool exposes source text but not each per-request timestamp. No linked executable source was downloaded or run.

## Aggregation, source records and updates

- [S01 — OAI-PMH 2.0](https://www.openarchives.org/OAI/openarchivesprotocol.html): §§2.5.1, 3.3.2, 3.4, 3.5; deletion declarations, datestamps, format and flow control.
- [S02 — DPLA Hub Network](https://pro.dp.la/hubs): Content/Service Hub aggregation model.
- [S03 — DPLA API Field Reference](https://pro.dp.la/developers/field-reference): API MAP 3.1; source versus digital-object rights; originalRecord.
- [S04 — DPLA MAP profile](https://pro.dp.la/hubs/metadata-application-profile): profile download version 5.0; distinguish from API field contract.
- [S05 — DPLA API requests](https://pro.dp.la/developers/requests) and [policies](https://pro.dp.la/developers/policies): item links and API key requirement.
- [S16 — DPLA ingestion3 Issue 739 commit](https://github.com/dpla/ingestion3/commit/608ea023de200df48e8241ed08e0fa49466646f9): NARA delete-file fix and zero-delete gate; pinned [README](https://github.com/dpla/ingestion3/blob/608ea023de200df48e8241ed08e0fa49466646f9/docs/ingestion/README_NARA.md).
- [S17 — DPLA Bulk Download](https://pro.dp.la/developers/bulk-download): zipped JSON/Parquet export precedent and format changes.

## EDM, rights and migration

- [S06 — Europeana EDM Definition v5.2.7](https://pro.europeana.eu/files/Europeana_Professional/Share_your_data/Technical_requirements/EDM_Documentation/EDM_Definition_v5.2.7_042016.pdf): edm:rights definition and occurrence.
- [S07 — ESE migration guidance](https://pro.europeana.eu/page/ese-documentation): default flat ESE-to-EDM mapping and ambiguity.
- [S08 — Europeana Licensing Framework](https://pro.europeana.eu/index.php/page/europeana-licensing-framework): metadata CC0 versus edm:rights on previews/digital objects.
- [S09 — Europeana Semantic Enrichment](https://pro.europeana.eu/page/europeana-semantic-enrichment): vocabulary-based derived terms.
- [S10 — RightsStatements.org](https://rightsstatements.org/en/about.html): About plus 1.0 statement collections for Copyright/No Copyright/Other.
- [S11 — Creative Commons](https://creativecommons.org/share-your-work/use-remix/cc-licenses/), [public-domain tools](https://creativecommons.org/public-domain/), and [PDM 1.0 deed](https://creativecommons.org/publicdomain/mark/1.0/): supplied license versus CC0 and PDM.
- [S15 — Europeana API key guidance](https://pro.europeana.eu/page/get-api): current account requirement for future API key requests.

## Publication, mapping and provenance

- [S12 — IIIF Presentation API 3.0.0](https://iiif.io/api/presentation/3.0/): rights, requiredStatement, provider, links and Manifest serialization.
- [S13 — W3C SKOS](https://www.w3.org/TR/skos-reference/): exactMatch and closeMatch semantics.
- [S14 — W3C PROV-O](https://www.w3.org/TR/prov-o/): entities, activities, agents and derivation/attribution.

## Omeka S publishing lead (read after plan release)

- [S18 — Resource Templates](https://omeka.org/s/docs/user-manual/content/resource-template/): rights property, URI-valued fields and non-enforcing Value Suggest.
- [S19 — CSV Import module 2.6.2](https://omeka.org/s/modules/CSVImport/) and [manual](https://omeka.org/s/docs/user-manual/modules/csvimport/): versioned import/update strategies and operator requirements.
- [S20 — REST API](https://omeka.org/s/docs/developer/api/rest_api_reference/) and [Import/Export](https://omeka.org/s/docs/user-manual/importexport/): JSON-LD value provenance, visibility and export routes.
- [S21 — Europeana Aggregators Forum](https://pro.europeana.eu/page/aggregators): regional/domain aggregators gather partner records for Europeana.
