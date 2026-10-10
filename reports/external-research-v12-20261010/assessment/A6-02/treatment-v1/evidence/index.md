# Independent primary evidence — A6-02 treatment-v1

[Full assessment](../assessment.md) · [Machine assessment](../assessment.json) · [Source map](../source-map.json) · [Original inspected manifest](../original-inspected-manifest.json)

Pxx identifies the reviewer’s semantic check. Exx identifies an independent read-only GET capture. Web text files preserve browser retrieval output; successful official indexed text and direct-open errors are distinguished. Downloaded source code is evidence only and was never executed.

<a id="p01"></a>
## P01 — OAI-PMH 2.0

[Governing primary source](https://www.openarchives.org/OAI/openarchivesprotocol.html) — Protocol 2.0 (2002-06-14), document revision 2015-01-08.

Locator: Sections 2.5.1, 2.7.1, 3.3.2, 3.4, 3.5, 4.2; readable lines 294–312, 450–475, 1038–1120.

The conditional connector design is supported. Snapshot reconciliation/staleness thresholds are proposed local choices, not OAI guarantees. No five-collection endpoint compatibility was demonstrated.

- [E01 original capture](E01.html); SHA-256 `d81e32299f773b460c9dc8494bc3fe69d5e919fe4d9ef74c39d1a0e3ed7c2b98`; 148063 bytes; GET 200; 2026-10-10T05:18:09.958740+00:00 → 2026-10-10T05:18:10.177547+00:00.
- [Readable text](E01.txt); SHA-256 `63b512aa902dab9c8f6f1f456c25c08d7edae21d939224444bbd5964268c8e22`.

<a id="p02"></a>
## P02 — DPLA Hub Network and prospective hubs

[Governing primary source](https://pro.dp.la/hubs) — Current unversioned official documentation.

Locator: evidence/web5.txt: Hub Network and Prospective Hubs sections; official search retrieval.

Supports a realistic hub-mediated comparator. The general grouping of Content/Service Hubs is acceptable for this comparison, but their roles are not identical. Acceptance/geographic suitability is not assumed.

- E02 direct GET failed: HTTP Error 403: Forbidden; 2026-10-10T05:18:09.961250+00:00 → 2026-10-10T05:18:10.085738+00:00. Official indexed/browser text boundary is named above.

<a id="p03"></a>
## P03 — DPLA API Field Reference

[Governing primary source](https://pro.dp.la/developers/field-reference) — API documentation states MAP 3.1; page unversioned.

Locator: evidence/web2.txt: MAP introduction and object.@id/object.rights/originalRecord/sourceResource/sourceResource.rights definitions.

Supports preserving original versus mapped values and distinct rights subjects. No assertion is made that these are actual fields in the five unspecified sources.

- E03 direct GET failed: HTTP Error 403: Forbidden; 2026-10-10T05:18:09.962336+00:00 → 2026-10-10T05:18:10.087578+00:00. Official indexed/browser text boundary is named above.

<a id="p04"></a>
## P04 — DPLA MAP and metadata policy

[Governing primary source](https://pro.dp.la/hubs/metadata-application-profile) — Landing page gives conflicting 4.0 current-version and 5.0 download signals.

Locator: evidence/web2.txt: Download the MAP; Policy Statement on Metadata principles 2–4.

C2 appropriately uses this as a relationship-specific example, not permission for the museum network. C3 correctly leaves the future integration artifact unresolved.

- E04 direct GET failed: HTTP Error 403: Forbidden; 2026-10-10T05:18:09.963327+00:00 → 2026-10-10T05:18:10.086684+00:00. Official indexed/browser text boundary is named above.

<a id="p05"></a>
## P05 — DPLA API policies and API Codex

[Governing primary source](https://pro.dp.la/developers/policies) — API v2, current unversioned official pages.

Locator: evidence/web5.txt: Policies API Keys; API Codex essentials; Requests search result.

Supports the external API setup dependency and JSON-LD publishing precedent. Reviewer did not perform the POST, obtain a key, or query product data.

- E06 direct GET failed: HTTP Error 403: Forbidden; 2026-10-10T05:18:09.966131+00:00 → 2026-10-10T05:18:10.088523+00:00. Official indexed/browser text boundary is named above.
- E05 direct GET failed: HTTP Error 403: Forbidden; 2026-10-10T05:18:09.964449+00:00 → 2026-10-10T05:18:10.090654+00:00. Official indexed/browser text boundary is named above.

<a id="p06"></a>
## P06 — Europeana EDM Definition

[Governing primary source](https://pro.europeana.eu/files/Europeana_Professional/Share_your_data/Technical_requirements/EDM_Documentation/EDM_Definition_v5.2.7_042016.pdf) — EDM Definition v5.2.7, April 2016.

Locator: PDF printed page 40, edm:rights table; evidence/E07.txt lines 2198–2228; ProvidedCHO, WebResource, Aggregation class definitions.

Supports the final’s scoped comparison. It is pinned historical model evidence, not proof of a current pilot schema or an image license.

- [E07 original capture](E07.pdf); SHA-256 `64a7d4a67c24d1cb6bc3c26fecbc4d7957c80dd77617acd843f7d37c86b757da`; 2213229 bytes; GET 200; 2026-10-10T05:18:09.967290+00:00 → 2026-10-10T05:18:10.242754+00:00.
- [Readable text](E07.txt); SHA-256 `e027320f65d203e7e44d7f25cb4a69c5e872b7254654f873b3a2cd9ea79b8a15`.

<a id="p07"></a>
## P07 — Europeana ESE-to-EDM migration

[Governing primary source](https://pro.europeana.eu/page/ese-documentation) — Official historical guidance posted 2014-12-04, updated 2023-11-06 in indexed page.

Locator: evidence/web3.txt: Default mapping; options 1–3; dc:date/dcterms:created/dc:format examples.

The proposal’s collection-specific mapping review and retention for remapping follow the documented failure mechanism. It does not assert that the five collections actually use ESE.

- E08 direct GET failed: HTTP Error 403: Forbidden; 2026-10-10T05:18:09.968306+00:00 → 2026-10-10T05:18:10.047772+00:00. Official indexed/browser text boundary is named above.

<a id="p08"></a>
## P08 — Europeana Licensing Framework

[Governing primary source](https://pro.europeana.eu/page/europeana-licensing-framework) — Current official redirect; effective page published 2023-09-10; DEA replaced prior agreements 2012-07-01.

Locator: evidence/web4.txt: effective URL https://www.dataspace-culturalheritage.eu/en/news/europeana-licensing-framework, lines 17–31.

Supports C2 and the distinction between metadata and object rights. The final does not impose Europeana terms on the five sources or infer image reuse permission.

- E09 direct GET failed: HTTP Error 403: Forbidden; 2026-10-10T05:18:10.047915+00:00 → 2026-10-10T05:18:10.089788+00:00. Official indexed/browser text boundary is named above.
- E10 direct GET failed: HTTP Error 403: Forbidden; 2026-10-10T05:18:10.085840+00:00 → 2026-10-10T05:18:10.136900+00:00. Official indexed/browser text boundary is named above.

<a id="p09"></a>
## P09 — Europeana semantic enrichment

[Governing primary source](https://pro.europeana.eu/page/europeana-semantic-enrichment) — Official indexed guidance updated 2025-06-23.

Locator: evidence/web3.txt: Automatic semantic enrichment and linked-open-vocabulary guidance.

The opportunity to improve multilingual discovery while recording derived provenance is supported and survives in the final. No vocabulary configuration or enrichment was executed.

- E11 direct GET failed: HTTP Error 403: Forbidden; 2026-10-10T05:18:10.086767+00:00 → 2026-10-10T05:18:10.129582+00:00. Official indexed/browser text boundary is named above.

<a id="p10"></a>
## P10 — RightsStatements.org Other statements

[Governing primary source](https://rightsstatements.org/page/collection-other/1.0/?language=en) — Vocabulary 1.0.

Locator: evidence/web2.txt: CNE, UND, NKC definitions and collection introduction.

Supports preserving absent metadata as absent and not assigning a public-domain claim. Legitimately source-supplied CNE remains permissible to display. The final’s broad owner-input sentence about no determination is read in its missing-data context, not as overriding raw-value preservation.

- E13 direct GET failed: HTTP Error 526: <none>; 2026-10-10T05:18:10.088624+00:00 → 2026-10-10T05:18:10.690008+00:00. Official indexed/browser text boundary is named above.

<a id="p11"></a>
## P11 — RightsStatements.org work/digital-object applicability

[Governing primary source](https://rightsstatements.org/en/2018/12/where-statements-apply.html) — Official guidance dated 2018-12-21.

Locator: evidence/web2.txt: three statement-family sections and complete term lists.

The added final paragraph correctly distinguishes source-asserted subject, documented possible term applicability and displayed resource. C1 is resolved without expanding a permission or independently determining rights.

- E32 direct GET failed: HTTP Error 526: <none>; 2026-10-10T05:18:10.690143+00:00 → 2026-10-10T05:18:11.271779+00:00. Official indexed/browser text boundary is named above.

<a id="p12"></a>
## P12 — RightsStatements.org FAQ

[Governing primary source](https://rightsstatements.org/en/documentation/faq.html) — Current unversioned official FAQ; statement URIs include vocabulary version.

Locator: evidence/web5.txt: General questions and Technical URI question.

Supports exact URI preservation and statement/license distinctions. IIIF 3.0 describes HTTP identifiers; the final attributes that rule to the pinned IIIF specification and does not require converting source HTTPS identifiers.

- E33 direct GET failed: HTTP Error 526: <none>; 2026-10-10T05:18:10.726848+00:00 → 2026-10-10T05:18:10.918764+00:00. Official indexed/browser text boundary is named above.

<a id="p13"></a>
## P13 — Creative Commons licenses and public-domain tools

[Governing primary source](https://creativecommons.org/public-domain/) — Current official guidance; PDM 1.0, CC0; license version to be preserved when supplied.

Locator: evidence/E16.txt License Types; evidence/E17.txt Using CC0/PDM distinction and use conditions; evidence/E18.txt PDM 1.0 Other Information.

The final preserves supplied assertions, separates tools and refuses independent determinations. It does not select a CC license or infer permission from a preview.

- [E17 original capture](E17.html); SHA-256 `e59476895df81af0a0b6535cc083c735df0550fc02ea726e04948b7a143680b6`; 45237 bytes; GET 200; 2026-10-10T05:18:10.136990+00:00 → 2026-10-10T05:18:10.211097+00:00.
- [Readable text](E17.txt); SHA-256 `0ee3c30b209d098327a6e845ddefcb75109788a6287a6882f93601c8f35af5bd`.
- [E16 original capture](E16.html); SHA-256 `17f61c3bceb581c10d4440d7e6e80b24b786c453ff5aeb38537a171df340e21e`; 44217 bytes; GET 200; 2026-10-10T05:18:10.129679+00:00 → 2026-10-10T05:18:10.650321+00:00.
- [Readable text](E16.txt); SHA-256 `01663093944d2e6f2a7dfb1da223e90b69b8a1643ace13978b52768dedaf0dae`.
- [E18 original capture](E18.html); SHA-256 `28b3199d4df73c35c3593b1b42b41300fdfbd9a22ca851fd18e1c87a506f43ff`; 31377 bytes; GET 200; 2026-10-10T05:18:10.177810+00:00 → 2026-10-10T05:18:10.227178+00:00.
- [Readable text](E18.txt); SHA-256 `ddfaa7f17f3be162612ac40648c65e008dc573f9765be2343af592a123e01d93`.

<a id="p14"></a>
## P14 — IIIF Presentation API

[Governing primary source](https://iiif.io/api/presentation/3.0/) — Presentation API 3.0.0; page lists this as latest stable.

Locator: evidence/E19.txt lines 178–205; sections 1.1, 3.1, 4.5, 5.2.

Supports an optional presentation/help-link pattern and JSON precedent, not a five-source harvester or export authorization. The final scopes these roles correctly. HTTPS link advice is attributed to this version.

- [E19 original capture](E19.html); SHA-256 `3e4cad9a0ff652e0905c4bd15a27c8d68e208dd34c1d55102870419e5ca5f77e`; 385826 bytes; GET 200; 2026-10-10T05:18:10.211223+00:00 → 2026-10-10T05:18:10.639979+00:00.
- [Readable text](E19.txt); SHA-256 `4996a306b87989c93e148530c4b7d004788e3f8d14e80213e05382e80cf955a2`.

<a id="p15"></a>
## P15 — W3C SKOS Reference

[Governing primary source](https://www.w3.org/TR/skos-reference/) — W3C Recommendation 2009-08-18.

Locator: Sections 10.1, 10.3 S45, 10.6.8; evidence/E20.txt lines 1855–1875, 2177–2198.

The final’s brief concept-equivalence wording is acceptable in this retrieval context because it distinguishes owl:sameAs and requires evidence for mapping. No actual source-term crosswalk is claimed.

- [E20 original capture](E20.html); SHA-256 `3aa00cd16ee4d86d3a19b75501bb317d0b0c134e1f4029e9f3098c4dd3669e4c`; 227150 bytes; GET 200; 2026-10-10T05:18:10.227312+00:00 → 2026-10-10T05:18:10.399509+00:00.
- [Readable text](E20.txt); SHA-256 `976b54d77dd9f04dc4f22ed406a33355a94f447606d6c91697c74d2ac35c564f`.

<a id="p16"></a>
## P16 — W3C PROV-O

[Governing primary source](https://www.w3.org/TR/prov-o/) — W3C Recommendation 2013-04-30.

Locator: Section 3.1; evidence/E21.txt lines 218–245.

Supports the analogous mechanism for source snapshots, mapping activities and responsible owners. The proposal treats it as a modeling option, not completed validation.

- [E21 original capture](E21.html); SHA-256 `6b96671ab84faf12ce3f041aca12c3f93a6df2ed242348810743179a68e69555`; 464179 bytes; GET 200; 2026-10-10T05:18:10.243292+00:00 → 2026-10-10T05:18:10.458611+00:00.
- [Readable text](E21.txt); SHA-256 `4ffc3f730fb38035827489dca0c2e9f266ececcb9d99fbaae18ec7c0058e4a34`.

<a id="p17"></a>
## P17 — Europeana API key guidance

[Governing primary source](https://pro.europeana.eu/page/get-api) — Official guidance updated 2025-06-05; registration change 2025-05-28.

Locator: evidence/web3.txt: What does this mean and account requirement.

Supports treating an external API as a setup dependency rather than requiring it for this research. No account or key was created.

- E22 direct GET failed: HTTP Error 403: Forbidden; 2026-10-10T05:18:10.399823+00:00 → 2026-10-10T05:18:10.471138+00:00. Official indexed/browser text boundary is named above.

<a id="p18"></a>
## P18 — DPLA ingestion3 NARA fix and runbook

[Governing primary source](https://github.com/dpla/ingestion3/commit/608ea023de200df48e8241ed08e0fa49466646f9) — Commit 608ea023de200df48e8241ed08e0fa49466646f9, 2026-06-17T18:53:12Z, Issue 739 / PR 750.

Locator: evidence/E34.json scripts/harvest/nara-ingest.sh patch; evidence/E35.txt lines 127–219, 626–640; evidence/E36.txt lines 597–678.

Supports the bounded historical example and proposed counted-delete/backfill controls. The final does not claim incident reproduction or deploy this script. Its gate summary omits the missing-summary exception; L1 records this as nonmaterial historical-source precision.

- [E34 original capture](E34.json); SHA-256 `d15650785c8cbdf672efd57e218be583f1bb70abdf81f043fd3b8e0056337690`; 58365 bytes; GET 200; 2026-10-10T05:18:10.918867+00:00 → 2026-10-10T05:18:11.169414+00:00.
- [E23 original capture](E23.html); SHA-256 `556cbb94cd196b1b37ef0baa48899ba971c0829844a0c1168d62495af6e8fc1a`; 818128 bytes; GET 200; 2026-10-10T05:18:10.458844+00:00 → 2026-10-10T05:18:11.301502+00:00.
- [Readable text](E23.txt); SHA-256 `9298545a80b219d78d1bb74bcf3262c2dd34a7a00865af91352f686b9a1c45d3`.
- [E35 original capture](E35.txt); SHA-256 `87907e8734c9997587bcb9cf658cd9eb0f3d947de43079f125ff68afb91631d9`; 23937 bytes; GET 200; 2026-10-10T05:18:11.169538+00:00 → 2026-10-10T05:18:11.323199+00:00.
- [Readable text](E35.txt); SHA-256 `87907e8734c9997587bcb9cf658cd9eb0f3d947de43079f125ff68afb91631d9`.
- [E36 original capture](E36.txt); SHA-256 `719f42145f7c61b4d4bee2230e5ae9140d10737ff73beb8786b60ac60f205a50`; 42036 bytes; GET 200; 2026-10-10T05:18:11.277136+00:00 → 2026-10-10T05:18:11.419111+00:00.
- [Readable text](E36.txt); SHA-256 `719f42145f7c61b4d4bee2230e5ae9140d10737ff73beb8786b60ac60f205a50`.

<a id="p19"></a>
## P19 — DPLA bulk download

[Governing primary source](https://pro.dp.la/developers/bulk-download) — Current official documentation; documented format transitions 2015, 2018, 2019.

Locator: evidence/web3.txt: Bulk Download introduction and format-change dates.

A valid export precedent, not proof that this network may redistribute any given source fields or objects. The final keeps export version and authorization conditional.

- E25 direct GET failed: HTTP Error 403: Forbidden; 2026-10-10T05:18:10.616074+00:00 → 2026-10-10T05:18:10.679248+00:00. Official indexed/browser text boundary is named above.

<a id="p20"></a>
## P20 — Omeka S resource templates

[Governing primary source](https://omeka.org/s/docs/user-manual/content/resource-template/) — Current unversioned official manual.

Locator: evidence/E26.txt lines 150–182, 200–208.

Supports an optional editorial publisher requiring surrounding adapters/history. The final correctly does not present suggestions as a rights validator or automatic harvester. Template portability is retained in the inherited source map.

- [E26 original capture](E26.html); SHA-256 `ef41c91f67e0e6078c36e91578b11908742d664f022d04e62db4a676903bc68a`; 36623 bytes; GET 200; 2026-10-10T05:18:10.640431+00:00 → 2026-10-10T05:18:16.871691+00:00.
- [Readable text](E26.txt); SHA-256 `a72c7d3bb09e25786cc1afda518121c01665a426c5394573d6d0926956723d15`.

<a id="p21"></a>
## P21 — Omeka S CSV Import

[Governing primary source](https://omeka.org/s/modules/CSVImport/) — 2.6.2, 2024-10-22, Omeka S ^4.0.0 compatibility.

Locator: evidence/E27.txt release table; evidence/E28.txt lines 137–139, 317–336.

The final’s high-level import/update claim is true, and no specific operation is selected. Detailed operation differences remain future-adoption boundaries. The ^4.0.0 declaration should not be read as support for all later major versions.

- [E27 original capture](E27.html); SHA-256 `d6ffadce2f2b809275d6606787ab27b00882c8661ede35d3fa616d796b4780c1`; 13259 bytes; GET 200; 2026-10-10T05:18:10.650439+00:00 → 2026-10-10T05:18:16.813550+00:00.
- [Readable text](E27.txt); SHA-256 `111cc28ed2c367839d6094046e0998ea02ce3f7ebc3f6b0e411e922a934b70e4`.
- [E28 original capture](E28.html); SHA-256 `c7ed927e1e7e90805e8b04747a172df0ac47c6c97f312d994aa99e8a39580c0a`; 102661 bytes; GET 200; 2026-10-10T05:18:10.679325+00:00 → 2026-10-10T05:18:17.051454+00:00.
- [Readable text](E28.txt); SHA-256 `68ee99451eda1ed5892bd78a980280c6626cf57e0cfc045a5ab881573f2c7be6`.

<a id="p22"></a>
## P22 — Omeka S REST API and export

[Governing primary source](https://omeka.org/s/docs/developer/api/rest_api_reference/) — Current unversioned official manuals; property lookup detail since 4.0.0.

Locator: evidence/E29.txt lines 108–146; evidence/E30.txt lines 145–157.

Supports the conditional download option and separate access-policy flag. The final proposes excluding restricted fields and verifying actual deployment, not API writes or private-by-default behavior. The public default is an adoption boundary, not an exercised risk.

- [E29 original capture](E29.html); SHA-256 `78d995d68f19857896fdf46c1c67b6e9ade90c00d39d274b0b361d4d2bc14c1a`; 47530 bytes; GET 200; 2026-10-10T05:18:10.681835+00:00 → 2026-10-10T05:18:16.927998+00:00.
- [Readable text](E29.txt); SHA-256 `71186e490feee364e300c7e06424e1caaec3dd6945e2779077d1917e79c27d42`.
- [E30 original capture](E30.html); SHA-256 `f1e67aab088cbf53512271a16b0e78e39538171f719003da11b3d3acfc0b2b1c`; 29644 bytes; GET 200; 2026-10-10T05:18:10.687075+00:00 → 2026-10-10T05:18:16.973579+00:00.
- [Readable text](E30.txt); SHA-256 `8cf23c688460f3873a4fc8e2d8a66c1970468bceb0cec0c0f31e93c4bcd4f43d`.

<a id="p23"></a>
## P23 — Europeana Aggregators Forum

[Governing primary source](https://pro.europeana.eu/page/aggregators) — Current unversioned official program page.

Locator: evidence/web5.txt: Europeana aggregators; domain/thematic and national/regional sections.

Supports a concrete aggregation alternative. The network’s location, accreditation, acceptance and provider agreement remain external decisions.

- E31 direct GET failed: HTTP Error 403: Forbidden; 2026-10-10T05:18:10.687478+00:00 → 2026-10-10T05:18:10.726758+00:00. Official indexed/browser text boundary is named above.

## Browser-retrieval evidence

- [web1.txt](web1.txt); SHA-256 `35eb20ed36c456e24983b2be43be36e6d4200299e8e2931e6afb3f502eb9b05a`; raw browser evidence, access bracketed by the review window rather than invented per-request timestamps.
- [web2.txt](web2.txt); SHA-256 `3b3c6163db43bf0ee46dbe2961451fa727f6e3106a053f0965d1085a88eca560`; raw browser evidence, access bracketed by the review window rather than invented per-request timestamps.
- [web3.txt](web3.txt); SHA-256 `0fc1e6780331b917453017fb7a742cceb9b82ba24e4559e2914e27629e965ed6`; raw browser evidence, access bracketed by the review window rather than invented per-request timestamps.
- [web4.txt](web4.txt); SHA-256 `e9e85e62c38f6eb92049c3b22341a852635c4cc678cedb6b5b9c3c7260dca0f0`; raw browser evidence, access bracketed by the review window rather than invented per-request timestamps.
- [web5.txt](web5.txt); SHA-256 `67dff8bfb5932e5372087b3a0aa8d30f6c95161875376e122a10fdbc5d2d9ef8`; raw browser evidence, access bracketed by the review window rather than invented per-request timestamps.
- [web6.txt](web6.txt); SHA-256 `fc1b17839257d046f2b985504c3629557ed1a252f9be39de22441b659e2abbaf`; raw browser evidence, access bracketed by the review window rather than invented per-request timestamps.

[Direct retrieval manifest](retrieval-manifest.json) includes unsuccessful URLs as well as captures. Every original stage source index/map remains untouched.
