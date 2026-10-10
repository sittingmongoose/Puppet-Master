# Independent primary-source evidence — A6-02 control-v1

[Assessment](../assessment.md) · [Machine assessment](../assessment.json) · [Source map](../source-map.json) · [Original hashes](../original-inspected-hashes.json)

Each entry is an independent reviewer retrieval and semantic check. Source/code inspection is research; no product, feed, API write, module or downloaded code was operated. Failed retrievals and search-only support remain explicit.

## R-S01

[Primary source](https://github.com/dpla/ingestion3/blob/698795ed19d8f1d8032f988e68123d39dd842413/README.md)

- Applicability/version: GitHub commit 698795ed19d8f1d8032f988e68123d39dd842413 (main HEAD observed at retrieval); commit date 2026-10-09T14:10:10Z
- Governing locator: README: Harvest L467-469; Mapping L474-527; validations/rights exception L565-627; original export retention L154-158
- Check: **VERIFIED**. DPLA-specific provider maps and rights normalization/validation, including invalid edm:rights plus dc:rights passing while invalid-only fails. Preserve originals; the pilot is not bound to these rules.
- Accessed: 2026-10-10T05:22:29.633026+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S01.txt) — SHA-256 `ad7d528bf8b8105c6a00df197721f15339230a3ad7a22000bd8f778d675a9b18`; 52345 bytes.
- [Navigable extracted text](R-S01.text.txt) — SHA-256 `ad7d528bf8b8105c6a00df197721f15339230a3ad7a22000bd8f778d675a9b18`.

## R-S02

[Primary source](https://github.com/dpla/ingestion3/blob/698795ed19d8f1d8032f988e68123d39dd842413/docs/ingestion/README_NARA.md)

- Applicability/version: Same pinned commit as S01; document states last updated February 2026
- Governing locator: README_NARA.md History L626-639; R-X01 L352-437; R-X02 L345-350
- Check: **VERIFIED**. The pinned history records zero deletes in December 2025/January 2026, the June 2026 fix, and an undecided backfill. The source script separates NAC_DESC_Deletes files from rosters; merge code reads case-sensitive naId. No actual ingest or present database repair is proved.
- Accessed: 2026-10-10T05:22:29.635027+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S02.txt) — SHA-256 `87907e8734c9997587bcb9cf658cd9eb0f3d947de43079f125ff68afb91631d9`; 23937 bytes.
- [Navigable extracted text](R-S02.text.txt) — SHA-256 `87907e8734c9997587bcb9cf658cd9eb0f3d947de43079f125ff68afb91631d9`.

## R-S03

[Primary source](https://pro.dp.la/developers/field-reference)

- Applicability/version: Living documentation; search result states DPLA API currently implements MAP 3.1; separate official MAP page search result had 4.0/5.0 labels; not a coherent single release declaration
- Governing locator: evidence-web-search7.json: official Field Reference, Metadata Application Profile and Definitions; official MAP page opening paragraphs
- Check: **VERIFIED_WITH_ACCESS_LIMIT**. Official search retrieval supports the API MAP 3.1 wording and inconsistent MAP-page 4.0/5.0 labels. Direct GET returned an empty 202 response. This is a documentation inconsistency, not proof of a live API version.
- Accessed: 2026-10-10T05:22:29.636416+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S03.html) — SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`; 0 bytes.
- [Navigable extracted text](R-S03.text.txt) — SHA-256 `01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b`.

## R-S04

[Primary source](https://pro.europeana.eu/index.php/post/the-metis-sandbox-or-finding-joy-in-working-with-data)

- Applicability/version: Europeana Common Culture pilot article; no API release version declared on page
- Governing locator: evidence-web-context5.json: Metis article L12-14, L30, L44-60
- Check: **VERIFIED**. The December 2020 pilot article, updated August 2025, describes sample import/validation/transformation/normalization/enrichment/publication, reports and preview. It is historical workflow evidence, not current onboarding or service operation proof.
- Accessed: 2026-10-10T05:22:29.637504+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- Direct retrieval unavailable: HTTP Error 403: Forbidden. See the named reviewer web-response evidence where applicable.

## R-S05

[Primary source](https://rightsstatements.org/en/documentation/faq.html)

- Applicability/version: FAQ unversioned; vocabulary statement URI form explicitly carries its own version, commonly /1.0/
- Governing locator: evidence-web-batch4.json: official FAQ, General/For users/Technical
- Check: **VERIFIED_WITH_ACCESS_LIMIT**. The official FAQ distinguishes descriptive statements from licensing tools and statement /vocab/ identifiers from /page/ and /data/ representations. Direct canonical retrieval failed with 526; official search text supplies the governing context.
- Accessed: 2026-10-10T05:22:29.639113+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- Direct retrieval unavailable: HTTP Error 526: <none>. See the named reviewer web-response evidence where applicable.

## R-S06

[Primary source](https://pro.europeana.eu/index.php/page/available-rights-statements)

- Applicability/version: Living Europeana rights guidance; page lists its current 14 accepted options
- Governing locator: evidence-web-context5.json: Europeana rights guide L23-54, L73-84
- Check: **VERIFIED**. The guide has 14 accepted options and separates CC0, Public Domain Mark, CC licences and rights statements. Its submissions policy is Europeana-specific; the final attributes it to that platform rather than granting rights locally.
- Accessed: 2026-10-10T05:22:29.642628+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- Direct retrieval unavailable: HTTP Error 403: Forbidden. See the named reviewer web-response evidence where applicable.

## R-S07

[Primary source](https://pro.europeana.eu/index.php/page/selecting-a-rights-statement)

- Applicability/version: Europeana guidance updated 2024-09-20
- Governing locator: evidence-web-context5.json: selection guide L23-37 and L57-69
- Check: **VERIFIED**. Best efforts, rights-holder permission, organizational policy, and work/reproduction distinctions are platform guidance. The final preserves source scope instead of importing the platform policy as a local legal conclusion.
- Accessed: 2026-10-10T05:22:29.644342+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- Direct retrieval unavailable: HTTP Error 403: Forbidden. See the named reviewer web-response evidence where applicable.

## R-S08

[Primary source](https://pro.europeana.eu/files/Europeana_Professional/Share_your_data/Technical_requirements/EDM_Documentation/EDM_Definition_v5.2.7_042016.pdf)

- Applicability/version: EDM Definition v5.2.7 (April 2016)
- Governing locator: EDM Definition v5.2.7 25/04/2016, printed p39 §3.2.32; extracted L2228-2263
- Check: **VERIFIED**. edm:rights concerns digital objects; mandatory on ore:Aggregation, optional on edm:WebResource, maximum one. Historical profile and accepted-set conditions are correctly bounded.
- Accessed: 2026-10-10T05:22:29.645576+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S08.pdf) — SHA-256 `64a7d4a67c24d1cb6bc3c26fecbc4d7957c80dd77617acd843f7d37c86b757da`; 2213229 bytes.
- [Navigable extracted text](R-S08.text.txt) — SHA-256 `e027320f65d203e7e44d7f25cb4a69c5e872b7254654f873b3a2cd9ea79b8a15`.

## R-S09

[Primary source](https://iiif.io/api/presentation/2.1/)

- Applicability/version: Presentation API 2.1.1; previous version to stable 3.0.0
- Governing locator: Presentation 2.1.1 §3.2, extracted L157-164; status L68
- Check: **VERIFIED**. The v2 properties are license and attribution; attribution is text for display and license references rights/licensing information. The final does not equate this legacy text with a new legal grant.
- Accessed: 2026-10-10T05:22:29.646943+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S09.html) — SHA-256 `67f7247d11409bd6736edbd0f474f553ea715f0e60a7f06b25a5eebf30221f1c`; 310181 bytes.
- [Navigable extracted text](R-S09.text.txt) — SHA-256 `d88b72a96897b0f41fdc47b049811ad4927091f482fa99fb20a087bc4dc9849a`.

## R-S10

[Primary source](https://iiif.io/api/presentation/3.0/)

- Applicability/version: Presentation API 3.0.0; stable published 2020-06-03
- Governing locator: Presentation 3.0.0 §3.1 requiredStatement/rights/provider; §3.3 homepage/rendering/seeAlso; extracted rendering L543-547, seeAlso L629-633
- Check: **VERIFIED**. Rights is a URI string from permitted schemes/extension sets; requiredStatement is localized label/value text with mandatory client rendering when present. seeAlso processing is optional; rendering targets are directly displayable without an interstitial page. No pilot endpoint or successful download follows from these rules.
- Accessed: 2026-10-10T05:22:29.648316+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S10.html) — SHA-256 `3e4cad9a0ff652e0905c4bd15a27c8d68e208dd34c1d55102870419e5ca5f77e`; 385826 bytes.
- [Navigable extracted text](R-S10.text.txt) — SHA-256 `4996a306b87989c93e148530c4b7d004788e3f8d14e80213e05382e80cf955a2`.

## R-S11

[Primary source](https://iiif.io/api/presentation/3.0/change-log/)

- Applicability/version: Change log for 3.0.0, backwards-incompatible from 2.1.1
- Governing locator: 3.0 change log §1.2.3, §1.2.5, §1.2.12, §1.2.14; extracted L48-53, L66-76
- Check: **VERIFIED**. Released migration history supports attribution→requiredStatement, license→rights, structured provider and new context. The normative specification governs implementation; the change log and cookbook have inconsistent scheme wording, so literal URI rules should be pinned rather than silently rewritten.
- Accessed: 2026-10-10T05:22:29.704973+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S11.html) — SHA-256 `a1c25c702c13ef5cea91be23888aa77279c389c1b08530f0ab4658b4faf66e35`; 71875 bytes.
- [Navigable extracted text](R-S11.text.txt) — SHA-256 `887dd405c10a9ab34cf4b5318029663541a81ae4dae6e85f7ab7546d017c6f23`.

## R-S12

[Primary source](https://github.com/IIIF/api/issues/1287)

- Applicability/version: Issue opened 2017-10-12; milestone Presentation 3.0 - RC1; closed per page
- Governing locator: Issue #1287 opened 2017-10-12; extracted L113-129, L178-191
- Check: **VERIFIED**. The issue documents confusion over artist attribution versus publisher-required display text. It is design history; the final properly uses the released specification for the adopted rule.
- Accessed: 2026-10-10T05:22:29.706620+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S12.html) — SHA-256 `aaf98e910b54ab8df9f548b733e656237f1f2efa192e6b47f9081b7344634954`; 439744 bytes.
- [Navigable extracted text](R-S12.text.txt) — SHA-256 `56bd8cc46532cb4094b25393e3926cdf22664407f66052f563286cc6942426c5`.

## R-S13

[Primary source](https://iiif.io/api/cookbook/recipe/0008-rights/)

- Applicability/version: Cookbook recipe for Presentation API 3.0; non-normative example
- Governing locator: Cookbook 0008 Implementation Notes, extracted L21-31
- Check: **VERIFIED**. The cookbook supports visible requiredStatement versus potentially non-visible rights, and URI/text separation. It is non-normative guidance for a v3 client, not a guarantee about a particular viewer.
- Accessed: 2026-10-10T05:22:29.715586+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S13.html) — SHA-256 `2c1f8ed8dc2c1144ab00cda749071b4e90b0b9a793a83c7fa79142bfe091e28e`; 18867 bytes.
- [Navigable extracted text](R-S13.text.txt) — SHA-256 `dca3f1d141eae7a2e96a29ea710fedb28eed5024a56bb3a220b6c5f7db673325`.

## R-S14

[Primary source](https://iiif.io/api/cookbook/recipe/0053-seeAlso/)

- Applicability/version: IIIF Cookbook; current recipe page, no discrete release tag
- Governing locator: Cookbook 0053 Use Case/Implementation Notes, extracted L21-36; compare R-X08
- Check: **VERIFIED_WITH_LOCATOR_LIMIT**. This source supports structured metadata links and their distinction from homepage/rendering. It does not contain the discovery’s cited v2/v3 content-negotiation pattern; the correct governing recipe is 0057 (R-X08).
- Accessed: 2026-10-10T05:22:29.728408+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S14.html) — SHA-256 `6a62bf56d27e9a84b37169a6516221b5964760e27f3ff01fcc90c7241e836d4c`; 19572 bytes.
- [Navigable extracted text](R-S14.text.txt) — SHA-256 `5d1799ead4a1222ad14d2bd9d55d083cb0616281f1ce121a10dff6b9b949e309`.

## R-S15

[Primary source](https://iiif.io/api/auth/2.0/)

- Applicability/version: Authorization Flow API 2.0.0, published 2023-07-10; current stable listed by IIIF
- Governing locator: Authorization Flow 2.0.0 Status; Introduction; substitute/probe/service model
- Check: **VERIFIED**. The specification governs access to controlled resources and substitutes, not reuse permission. No IIIF source or actual access flow from the five collections was established. The cited publication day was not independently needed for this access distinction.
- Accessed: 2026-10-10T05:22:29.796733+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S15.html) — SHA-256 `3b8556ac46b943b4a25e9e3dfa375f6a77f1c9ae155344c842be79c0695fe82b`; 150767 bytes.
- [Navigable extracted text](R-S15.text.txt) — SHA-256 `49494ba6570bf4aa7301fa3db418d6a9ba9e5197fce24a5c55f3dc780f9f8eff`.

## R-S16

[Primary source](https://www.w3.org/TR/skos-reference/)

- Applicability/version: W3C Recommendation 2009-08-18
- Governing locator: SKOS W3C Recommendation 2009-08-18 §10, especially §10.6.3; extracted L2080-2096
- Check: **VERIFIED**. Only exactMatch is declared transitive among mapping properties; closeMatch is not a transitive relation. Concept links and relation types support a governed mapping analogy, not identity from similar strings.
- Accessed: 2026-10-10T05:22:29.820351+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S16.html) — SHA-256 `3aa00cd16ee4d86d3a19b75501bb317d0b0c134e1f4029e9f3098c4dd3669e4c`; 227150 bytes.
- [Navigable extracted text](R-S16.text.txt) — SHA-256 `976b54d77dd9f04dc4f22ed406a33355a94f447606d6c91697c74d2ac35c564f`.

## R-S17

[Primary source](https://www.getty.edu/publications/vocabularies-editorial-guidelines/aat-guidelines/1_about_aat/1.1/)

- Applicability/version: Living editorial guideline page; no stable numeric edition shown on this section
- Governing locator: Getty AAT Guidelines §1.1.1.3, extracted L264-277; scope exclusions immediately preceding
- Check: **VERIFIED**. AAT concept records have numeric identifiers, terms, related concepts, hierarchy, sources and notes. The final uses a vocabulary-governance analogy without requiring AAT for all museum subjects.
- Accessed: 2026-10-10T05:22:29.828584+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S17.html) — SHA-256 `0888d558363a145d07331b54a9d48ac5fcb4853782380648762210cb545104c1`; 94052 bytes.
- [Navigable extracted text](R-S17.text.txt) — SHA-256 `3706c0b324e9c6bc82233501e55098db65fd11cf977248dfe9952a9a7b63a46a`.

## R-S18

[Primary source](https://www.getty.edu/research/tools/vocabularies/Linked_Data_Getty_Vocabularies.pdf)

- Applicability/version: Getty presentation labeled May 2023
- Governing locator: Getty PDF Revised May 2023, printed slides 27-30; extracted L708-827; licensing overview
- Check: **VERIFIED**. Merged records retain source/contributor information and the data diagram includes editor/action/date revision fields. This supports provenance design, not an automatic audit log or rights in museum images.
- Accessed: 2026-10-10T05:22:29.861167+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S18.pdf) — SHA-256 `39f90195eb9d5135157c971745d4ea7b25bb18705911b59c910100bd0a12a4d6`; 10369698 bytes.
- [Navigable extracted text](R-S18.text.txt) — SHA-256 `3454a1b8428b773d7d8e9f619945e06d4a12751efbdf6c36c807520b9204f2cb`.

## R-S19

[Primary source](https://www.w3.org/TR/prov-o/)

- Applicability/version: W3C Recommendation 2013-04-30
- Governing locator: PROV-O W3C Recommendation 2013-04-30 §3.1 Starting Point Terms, extracted L218-247
- Check: **VERIFIED**. Entities, activities and agents with derivation/generation/usage/association can describe source transformations. The final explicitly treats the ontology as a vocabulary, not a logging implementation.
- Accessed: 2026-10-10T05:22:29.883774+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S19.html) — SHA-256 `6b96671ab84faf12ce3f041aca12c3f93a6df2ed242348810743179a68e69555`; 464179 bytes.
- [Navigable extracted text](R-S19.text.txt) — SHA-256 `4ffc3f730fb38035827489dca0c2e9f266ececcb9d99fbaae18ec7c0058e4a34`.

## R-S20

[Primary source](https://rightsstatements.org/page/UND/1.0/?language=en)

- Applicability/version: RightsStatements.org vocabulary statement UND/1.0
- Governing locator: evidence-web-batch4.json: official collection-other/1.0 definition of UND; canonical page GET 526
- Check: **VERIFIED_WITH_ACCESS_LIMIT**. UND requires an attempted but unsuccessful status determination. It remains separate from missing input, CNE, and public-domain assertions. The canonical page was not directly independently fetched.
- Accessed: 2026-10-10T05:22:29.890544+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- Direct retrieval unavailable: HTTP Error 526: <none>. See the named reviewer web-response evidence where applicable.

## R-S21

[Primary source](https://rightsstatements.org/page/CNE/1.0/?language=en)

- Applicability/version: RightsStatements.org vocabulary statement CNE/1.0
- Governing locator: evidence-web-batch4.json: official collection-other/1.0 CNE definition; official 2016 recommendations §2.11 excerpt
- Check: **VERIFIED_WITH_ACCESS_LIMIT**. CNE means no evaluation effort by the providing institution, not a catalogue default. Direct page and PDF retrieval failed with 526, but official governing vocabulary text supports the distinction.
- Accessed: 2026-10-10T05:22:29.899642+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- Direct retrieval unavailable: HTTP Error 526: <none>. See the named reviewer web-response evidence where applicable.

## R-S22

[Primary source](https://omeka.org/s/modules/CSVImport/)

- Applicability/version: Module release listing: CSV Import 2.6.2, released 2024-10-22, minimum Omeka S ^4.0.0
- Governing locator: CSV Import release page extracted L16-30 and L55-58
- Check: **VERIFIED**. Release 2.6.2, 2024-10-22, compatibility ^4.0.0 and CSV/TSV/ODS import/update are supported. ODS additionally requires PHP zip/xml. These are documented capabilities, not a tested five-source deployment.
- Accessed: 2026-10-10T05:22:29.907572+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S22.html) — SHA-256 `d6ffadce2f2b809275d6606787ab27b00882c8661ede35d3fa616d796b4780c1`; 13259 bytes.
- [Navigable extracted text](R-S22.text.txt) — SHA-256 `111cc28ed2c367839d6094046e0998ea02ce3f7ebc3f6b0e411e922a934b70e4`.

## R-S23

[Primary source](https://omeka.org/s/docs/user-manual/modules/csvimport/)

- Applicability/version: Living manual; module options correspond to the CSV Import 2.x workflow; deployment version not selected
- Governing locator: CSV Import manual Advanced Settings L242-260; Past Imports/Undo L537-552; R-X06/R-X09
- Check: **VERIFIED**. Revise skips empty cells; Update replaces even with empty cells; identifiers require exact matches and select the oldest duplicate. The manual distinguishes unundoable update actions while providing an Undo control. Released source clarifies that Undo deletes created import entities rather than restoring overwritten values.
- Accessed: 2026-10-10T05:22:29.953752+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S23.html) — SHA-256 `c7ed927e1e7e90805e8b04747a172df0ac47c6c97f312d994aa99e8a39580c0a`; 102661 bytes.
- [Navigable extracted text](R-S23.text.txt) — SHA-256 `68ee99451eda1ed5892bd78a980280c6626cf57e0cfc045a5ab881573f2c7be6`.

## R-S24

[Primary source](https://omeka.org/s/modules/RightsStatements/)

- Applicability/version: Module 1.2.1, released 2023-01-19, listed for Omeka S ^3.0.0 || ^4.0.0
- Governing locator: Rights Statements module page extracted L20-35
- Check: **VERIFIED**. The release page lists 11 dropdown statements and URI/label pairing for module 1.2.1 (2023-01-19, ^3.0.0 || ^4.0.0). The final prudently makes no claim that this equals all currently available rights statements.
- Accessed: 2026-10-10T05:22:29.954878+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S24.html) — SHA-256 `a85d2e8f19f7481b768e8a340f60d987383db28408542c3daaacb9e708951846`; 7510 bytes.
- [Navigable extracted text](R-S24.text.txt) — SHA-256 `5d7f5e78cdb657df4d20d6d790d399d0a92aba4e6d4177d6e1dc783f202beb11`.

## R-S25

[Primary source](https://omeka.org/s/docs/user-manual/modules/valuesuggest/)

- Applicability/version: Living user manual; module release is not selected for this study
- Governing locator: Value Suggest manual extracted L122-149 and L345-346
- Check: **VERIFIED**. Suggestions can be ignored; batch conversion does not import canonical labels and preserves empty or existing label states. The final correctly rejects autocomplete as an enforcement guarantee.
- Accessed: 2026-10-10T05:22:29.957318+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S25.html) — SHA-256 `d0ee90e1860a2972c4ff3edf0611239dfca9c72afb300093d6c4ff9c696c9322`; 47060 bytes.
- [Navigable extracted text](R-S25.text.txt) — SHA-256 `6018167281fc7854221294a01ed9a694f17d584ff782b5c98e2beb2555ff8e9f`.

## R-S26

[Primary source](https://omeka.org/s/modules/OaiPmhRepository/)

- Applicability/version: Module 3.4.14, released 2026-10-05, minimum Omeka S ^4.0.0
- Governing locator: OAI-PMH Repository extracted L24-37, L67-87, L191-230, L244-250, L298-301
- Check: **VERIFIED**. Release 3.4.14 dated 2026-10-05 requires compatible Omeka and Common. OAI-PMH 2.0 publication has required oai_dc, configurable simple_xml, media exposure default false and deletion support TODO. The proposed optional export must verify profile/visibility; this is not an inbound harvester.
- Accessed: 2026-10-10T05:22:30.241187+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S26.html) — SHA-256 `903f2cfb28be2c05a96d9999755388b4966d2a19c5a453b2f00ef87233d076c0`; 31589 bytes.
- [Navigable extracted text](R-S26.text.txt) — SHA-256 `61f194ca0f17d05afdaba3160dc87816abef416d91bdfaddcc30798ba705af7b`.

## R-S27

[Primary source](https://omeka.org/s/docs/developer/api/rest_api/)

- Applicability/version: Living developer documentation; non-JSON-LD response formats documented from Omeka S 4.1.0
- Governing locator: REST API extracted L126-162, L180-194; final L25/L98/L140 versus critic L11/L32
- Check: **VERIFIED_FINAL_CORRECTS_LINEAGE**. Default JSON-LD, alternate formats from 4.1.0 and public anonymous reads are documented. PUT replaces the resource. A REST PATCH with any RDF values replaces the entire RDF value collection, not only one property. Final L25 gives the correct resource-wide condition; the critic’s narrower wording is a corrected lineage defect.
- Accessed: 2026-10-10T05:22:30.476353+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S27.html) — SHA-256 `6f7c73141999ed692adfc943698c8c80f608cc5ad20e43955aebac9798bb589b`; 53083 bytes.
- [Navigable extracted text](R-S27.text.txt) — SHA-256 `7c8f9ed6c181fba8c0c413cadc6a10449a4da8ca067e84222756ac66b2fff6ea`.

## R-S28

[Primary source](https://omeka.org/s/modules/Access/)

- Applicability/version: Module page lists release 3.4.48; current deployment compatibility was not selected
- Governing locator: Access module Usage extracted L208-218; server configuration L72-83; Embargo L442-449
- Check: **VERIFIED**. Record visibility follows core; file access and embargo add independent restrictions, requiring server routing. Public metadata is not a license or evidence that the original file is accessible.
- Accessed: 2026-10-10T05:22:30.477946+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S28.html) — SHA-256 `dc54d2382a97fced6545801c3b5caf1d13f83f87049e7c8ee1c2cbb9c167ac5f`; 53882 bytes.
- [Navigable extracted text](R-S28.text.txt) — SHA-256 `13243269c53d57fc7cf001bb73145496d6a044d47f4130339ab6feb6cb9c49a7`.

## R-S29

[Primary source](https://omeka.org/s/docs/user-manual/modules/customvocab/)

- Applicability/version: Living user manual; module release is not selected for this study
- Governing locator: Custom Vocab extracted L103-111 and L136-145
- Check: **VERIFIED**. Duplicate URIs keep the last label; conversion can replace a source label. The final’s preservation warning and separate provenance are supported; no conversion was actually run.
- Accessed: 2026-10-10T05:22:30.505407+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-S29.html) — SHA-256 `38c90848bb2e0dac683507012fa0c7e214d4125f87e8069aab9e99ad8de5382b`; 28754 bytes.
- [Navigable extracted text](R-S29.text.txt) — SHA-256 `8edc5ea579ae6df533cad0d4025ff6cab315ede5e99516459303ab67789c5bbd`.

## R-C01

[Primary source](https://omeka.org/s/modules/Osii/)

- Applicability/version: Module 1.4.0, released 2024-03-18; minimum Omeka S ^4.0.0
- Governing locator: Item Importer page extracted L20-23 and L35-38
- Check: **VERIFIED**. Release 1.4.0, 2024-03-18, ^4.0.0: remote Omeka-only one-way item/media/item-set synchronization, overwriting later local edits except site/block assignments. The final preserves that prerequisite and owner uncertainty.
- Accessed: 2026-10-10T05:22:30.567179+00:00; operation: Independent read-only HTTPS GET via Python urllib; no remote or downloaded code executed
- [Retrieved bytes](R-C01.html) — SHA-256 `7fc6a33a1cdbbaa54bfaa18b0dae6f59ab525c45919253fbebef6661d658fb15`; 8600 bytes.
- [Navigable extracted text](R-C01.text.txt) — SHA-256 `efa1e4e7c5b16e40be124e72910e0f45562073b4efa8edcdffdc27e9d5c74059`.

## R-X01

[Primary source](https://raw.githubusercontent.com/dpla/ingestion3/698795ed19d8f1d8032f988e68123d39dd842413/scripts/harvest/nara-ingest.sh)

- Applicability/version: Pinned DPLA preprocessing script; 698795ed19d8f1d8032f988e68123d39dd842413
- Governing locator: preprocess_month L352-437; zero-delete diagnostic L629-635
- Check: **VERIFIED_STATIC_SOURCE**. Code corroborates correct delete-file separation and diagnostic conditions; not executed.
- Accessed: 2026-10-10T05:27:31.409306+00:00; operation: Independent read-only primary HTTPS retrieval; code inspected as text only
- [Retrieved bytes](R-X01.txt) — SHA-256 `719f42145f7c61b4d4bee2230e5ae9140d10737ff73beb8786b60ac60f205a50`; 42036 bytes.
- [Navigable extracted text](R-X01.text.txt) — SHA-256 `719f42145f7c61b4d4bee2230e5ae9140d10737ff73beb8786b60ac60f205a50`.

## R-X02

[Primary source](https://raw.githubusercontent.com/dpla/ingestion3/698795ed19d8f1d8032f988e68123d39dd842413/src/main/scala/dpla/ingestion3/utils/NaraMergeUtil.scala)

- Applicability/version: Pinned DPLA NaraMergeUtil.scala; same commit
- Governing locator: XML parsing L345-350/L376-382; delete metrics L210-290
- Check: **VERIFIED_STATIC_SOURCE**. Code corroborates case-sensitive naId parsing and delete reconciliation metrics; not executed.
- Accessed: 2026-10-10T05:27:31.411191+00:00; operation: Independent read-only primary HTTPS retrieval; code inspected as text only
- [Retrieved bytes](R-X02.txt) — SHA-256 `169272db452581c346acabd8ffed48a4bbed475eadb2694b271c16b73333ec83`; 18154 bytes.
- [Navigable extracted text](R-X02.text.txt) — SHA-256 `169272db452581c346acabd8ffed48a4bbed475eadb2694b271c16b73333ec83`.

## R-X03

[Primary source](https://api.github.com/repos/dpla/ingestion3/commits/698795ed19d8f1d8032f988e68123d39dd842413)

- Applicability/version: GitHub commit metadata for 698795ed19d8f1d8032f988e68123d39dd842413
- Governing locator: sha and commit.author.date / commit.committer.date
- Check: **VERIFIED_STATIC_SOURCE**. Independently confirms exact commit and 2026-10-09T14:10:10Z date. Does not prove candidate retrieval occurred at its claimed time.
- Accessed: 2026-10-10T05:27:31.412381+00:00; operation: Independent read-only primary HTTPS retrieval; code inspected as text only
- [Retrieved bytes](R-X03.txt) — SHA-256 `625815ebd29620a382c259f3cb24b48afb7285148bd2b58c054cd51618ca284a`; 10431 bytes.
- [Navigable extracted text](R-X03.text.txt) — SHA-256 `625815ebd29620a382c259f3cb24b48afb7285148bd2b58c054cd51618ca284a`.

## R-X04

[Primary source](https://rightsstatements.org/files/160208recommendations_for_standardized_international_rights_statements_v1.1.pdf)

- Applicability/version: RightsStatements.org Recommendations v1.1, 2016
- Governing locator: §2.11 CNE
- Check: **UNAVAILABLE**. Direct PDF unavailable (526). Official-domain returned text is retained in web batch4; no local PDF exists.
- Accessed: 2026-10-10T05:27:31.413659+00:00; operation: Independent read-only primary HTTPS retrieval; code inspected as text only
- Direct retrieval unavailable: HTTP Error 526: <none>. See the named reviewer web-response evidence where applicable.

## R-X05

[Primary source](https://api.github.com/repos/omeka-s-modules/CSVImport/git/trees/v2.6.2?recursive=1)

- Applicability/version: CSVImport release v2.6.2 tree; tree SHA efdd9211da118d1c7fa31512ed768f1d4f7d91b1
- Governing locator: tree entries for src/Job/Undo.php and src/Job/Import.php
- Check: **VERIFIED_STATIC_SOURCE**. Read-only release tree establishes paths and release version for static code inspection.
- Accessed: 2026-10-10T05:27:31.414805+00:00; operation: Independent read-only primary HTTPS retrieval; code inspected as text only
- [Retrieved bytes](R-X05.txt) — SHA-256 `0e6cae55d05fc747f0ec5b3bdfc9048581c5ade7fafe0c41a3c350a3c5d1b963`; 31876 bytes.
- [Navigable extracted text](R-X05.text.txt) — SHA-256 `0e6cae55d05fc747f0ec5b3bdfc9048581c5ade7fafe0c41a3c350a3c5d1b963`.

## R-X06

[Primary source](https://raw.githubusercontent.com/omeka-s-modules/CSVImport/v2.6.2/src/Job/Undo.php)

- Applicability/version: CSVImport v2.6.2 Undo.php
- Governing locator: perform L15-29
- Check: **VERIFIED_STATIC_SOURCE**. Undo searches tracked imported entities and deletes their resources. This is deletion, not restoration of old property values.
- Accessed: 2026-10-10T05:28:12.231985+00:00; operation: Independent read-only primary-source HTTPS GET; code never executed
- [Retrieved bytes](R-X06.txt) — SHA-256 `fba4ce1a6a8312be434b161de66993ce31de1fcd31365488ee71a4ad4807581a`; 1313 bytes.
- [Navigable extracted text](R-X06.text.txt) — SHA-256 `fba4ce1a6a8312be434b161de66993ce31de1fcd31365488ee71a4ad4807581a`.

## R-X07

[Primary source](https://raw.githubusercontent.com/omeka-s-modules/CSVImport/v2.6.2/src/Entity/CSVImportImport.php)

- Applicability/version: CSVImport v2.6.2 CSVImportImport.php
- Governing locator: undoJob field/getter/setter
- Check: **VERIFIED_STATIC_SOURCE**. Supporting entity definition only; no claim of a rollback snapshot.
- Accessed: 2026-10-10T05:28:12.234277+00:00; operation: Independent read-only primary-source HTTPS GET; code never executed
- [Retrieved bytes](R-X07.txt) — SHA-256 `230481d4af2f94884493fa1c839ab1f4e1352a958c1afb1d146c9978357c4187`; 1869 bytes.
- [Navigable extracted text](R-X07.text.txt) — SHA-256 `230481d4af2f94884493fa1c839ab1f4e1352a958c1afb1d146c9978357c4187`.

## R-X08

[Primary source](https://iiif.io/api/cookbook/recipe/0057-publishing-v2-and-v3/)

- Applicability/version: IIIF Cookbook 0057, living recipe for Presentation 2/3
- Governing locator: Use Case, Implementation Notes and Restrictions
- Check: **VERIFIED_STATIC_SOURCE**. Supports version-specific URLs or negotiated v2/v3 responses; clients must check returned version and account for default responses/406. Correct locator for discovery L40, which instead cited 0053.
- Accessed: 2026-10-10T05:28:12.235467+00:00; operation: Independent read-only primary-source HTTPS GET; code never executed
- [Retrieved bytes](R-X08.html) — SHA-256 `edcfe5672f9bfc4a8dcafbde3b4933de28a417c6bbbe6e229d1700f2961b2044`; 20293 bytes.
- [Navigable extracted text](R-X08.text.txt) — SHA-256 `c8f0b70cfd7f12d60a547e90d2fa801df2c8c5eed3558cd176d8ea93fe3d3dbc`.

## R-X09

[Primary source](https://raw.githubusercontent.com/omeka-s-modules/CSVImport/v2.6.2/src/Job/Import.php)

- Applicability/version: CSVImport v2.6.2 Import.php
- Governing locator: create L340-380; update L391-457
- Check: **VERIFIED_STATIC_SOURCE**. Static code registers csvimport_entities on creation and does not register replacement snapshots in the update path. Complements Undo code; no product operation or module test executed.
- Accessed: 2026-10-10T05:28:24.955587+00:00; operation: Independent read-only source-code retrieval and text inspection; not executed
- [Retrieved bytes](R-X09.txt) — SHA-256 `2772d4f8b6849af84e8bc87167cfc43cb04137560fda547f11eae60431071a19`; 46889 bytes.
- [Navigable extracted text](R-X09.text.txt) — SHA-256 `2772d4f8b6849af84e8bc87167cfc43cb04137560fda547f11eae60431071a19`.

## Web retrieval/context records

- [evidence-web-batch1.json](../evidence-web-batch1.json) — SHA-256 `d704080dd95b130db0280c847e4900d53e1cf9643a00d0f84f8e73588b86f6cb`.
- [evidence-web-batch2.json](../evidence-web-batch2.json) — SHA-256 `e5897c3e3f26cf698480da8236f9154a059a3adb2135d713a99466b56e014c1a`.
- [evidence-web-search3.json](../evidence-web-search3.json) — SHA-256 `0bef5219391d115b95231f392ff662db01617ddc45fd32b45c5b867d32318a01`.
- [evidence-web-batch4.json](../evidence-web-batch4.json) — SHA-256 `3de9435390e129581b4559757117d30a9a003b392e9d86dfc479d9bf1c387c3b`.
- [evidence-web-context5.json](../evidence-web-context5.json) — SHA-256 `b2ed0ab86ec4881045587befcbe181cbe20961819af0e6a478a572be18d6d9b4`.
- [evidence-web-search6.json](../evidence-web-search6.json) — SHA-256 `3bb63a91a6e194f3f9336a5dc1cb71b5c01451da2322eb49acd0441137f7bbb2`.
- [evidence-web-search7.json](../evidence-web-search7.json) — SHA-256 `2b825be1371b7fe187d2285d8731ca43642a3761a0de580ebbbb334c232bb39b`.
