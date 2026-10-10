# Independent primary evidence — A8-01 control v1

This dossier was independently retrieved by the reviewer. Raw files preserve governing text/code and retrieval receipts. Product operation was NOT_RUN. Refer to [assessment](../assessment.md) and [source map](../source-map.json).

Hashes and access times identify evidence; semantic conclusions come from its contents. [Retrieval receipts](retrieval-records.json) and [evidence hashes](evidence-hashes.json).

<a id="E01"></a>
## E01 — BagIt File Packaging Format

Primary: [BagIt File Packaging Format](https://www.rfc-editor.org/rfc/rfc8493.txt). Version: RFC 8493, BagIt 1.0, October 2018.

Locator: §§1.1, 2.1.2–2.1.3, 2.2.1–2.2.4, 2.4, 3, 5.4, 6.1.

Result: SUPPORTED. See structured governing conditions and applicability in source-map.json.

- [E01-rfc8493.txt](E01-rfc8493.txt), SHA-256 `4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537`.

<a id="E02"></a>
## E02 — OCFL Specification

Primary: [OCFL Specification](https://ocfl.io/1.1.0/spec/). Version: OCFL 1.1.0, 7 October 2022.

Locator: §§3.3–3.8; readable capture lines 201–240, 244–350, 402–438.

Result: SUPPORTED_WITH_LINEAGE_LIMIT. See structured governing conditions and applicability in source-map.json.

- [E02-ocfl11.html](E02-ocfl11.html), SHA-256 `e01510fe5173961a84e0f92bae50a26f9cab2c2f3fb2d692d368141e94398eed`.
- [E02-ocfl11.txt](E02-ocfl11.txt), SHA-256 `954cae07e2e3541891d76be5a95be199ed15d4d71251610937d0b0c47939b55c`.

<a id="E03"></a>
## E03 — OCFL 1.1 Change Log

Primary: [OCFL 1.1 Change Log](https://ocfl.io/1.1.0/spec/change-log.html). Version: OCFL 1.1, 7 October 2022.

Locator: Changes from 1.0; readable lines 15–50.

Result: SUPPORTED. See structured governing conditions and applicability in source-map.json.

- [E03-ocfl11-changelog.html](E03-ocfl11-changelog.html), SHA-256 `7d9c7b3f7b58ea33229c62475a8c4c92273539ed192769bd9d47f9445add69b6`.
- [E03-ocfl11-changelog.txt](E03-ocfl11-changelog.txt), SHA-256 `aa23a31dc041867202eb8ed74c389229346a76d6d7ebd6cb2918907ca0d88f02`.

<a id="E04"></a>
## E04 — bagit-python issue #51

Primary: [bagit-python issue #51](https://github.com/LibraryOfCongress/bagit-python/issues/51). Version: Opened 2016-01-20, closed 2017-02-24, milestone 1.6; report does not specify bagit release.

Locator: Issue body; comments 173395149, 173397299, 173670998, 173694437, 197048716, 197074748.

Result: SUPPORTED_AFTER_FINAL_QUALIFICATION. See structured governing conditions and applicability in source-map.json.

- [E04-issue51.json](E04-issue51.json), SHA-256 `49acd85cbb8fd7575f82050d035665929fd59202cad7781a9e42a81188394ea7`.
- [E04-issue51-comments.json](E04-issue51-comments.json), SHA-256 `0197e6f77c7df80e1c1a818705f99b1cf477414f05050a311e9d808526ba0a47`.

<a id="E05"></a>
## E05 — NFD normalization fix commit

Primary: [NFD normalization fix commit](https://github.com/LibraryOfCongress/bagit-python/commit/16f34b6). Version: 16f34b64452628be82ee545401ea579c5e1e7bd1, 2016-03-15.

Locator: commit.message; files[bagit.py].patch and files[test.py].patch.

Result: SUPPORTED. See structured governing conditions and applicability in source-map.json.

- [E05-commit16f34b6.json](E05-commit16f34b6.json), SHA-256 `164e67c55a9b03eb08d0b85b8944b0b786f225bae415cd5711eccd18a8a85a3f`.

<a id="E06"></a>
## E06 — bagit-python released source and test

Primary: [bagit-python released source and test](https://github.com/LibraryOfCongress/bagit-python/blob/v1.6.0/bagit.py). Version: v1.6.0 tag commit 43fd5007115fd0e24dd701518ac6f82271006acd.

Locator: bagit.py lines 345–398, 519–537, 625–627, 669–685, 727–761, 878–959; test.py lines 751–786.

Result: MATERIAL_WRONG_OPERATION_M1. See structured governing conditions and applicability in source-map.json.

- [E06-v160-bagit.py](E06-v160-bagit.py), SHA-256 `5dcb0c0f6739b8b60ca148fdd1cb37b48101f99fc44bb1831d18591b19cbac57`.
- [E06-v160-ref.json](E06-v160-ref.json), SHA-256 `7acc3e1838afa2fcb0f55ca25844854ca21c94a60d1506c821166cb729fb3376`.
- [E06-v160-test.py](E06-v160-test.py), SHA-256 `52a4c2c86342daf72f1a54ac10530f76a797e1032be8a563c561fcef65a32838`.
- [E06-static-call-check.json](E06-static-call-check.json), SHA-256 `33e66199de439dd353d80eb13396f59672fe86f99c709309f7f588855ae32e8b`.

<a id="E07"></a>
## E07 — bagit-python v1.9.0 release

Primary: [bagit-python v1.9.0 release](https://github.com/LibraryOfCongress/bagit-python/releases/tag/v1.9.0). Version: v1.9.0; 861ddacb339d5b92659f0187a402f501d841abbe; published 2025-06-13T17:43:22Z.

Locator: release.body Behavioral changes, PR184; tag object.sha.

Result: SUPPORTED. See structured governing conditions and applicability in source-map.json.

- [E07-v190-release.json](E07-v190-release.json), SHA-256 `440f889a816cbae1de6d557161dc43e6494d102f0c2459bc07a1ff5d04b7700e`.
- [E07-v190-ref.json](E07-v190-ref.json), SHA-256 `7c41fcb68acb5959ef7fa44669f4c112f2e3ff0a7557d90622edff499a948c3a`.

<a id="E08"></a>
## E08 — bagit-python PR #184 and exact diff

Primary: [bagit-python PR #184 and exact diff](https://github.com/LibraryOfCongress/bagit-python/pull/184). Version: Merged 2025-06-13T16:26:17Z, merge 753679c9b342660d038f65a8dc4f755ab95d679b.

Locator: body, merged_at, merge_commit_sha; files[0].patch at _path_is_dangerous.

Result: SUPPORTED. See structured governing conditions and applicability in source-map.json.

- [E08-pr184.json](E08-pr184.json), SHA-256 `3f82b9c64514a1d9510033d62b83908e3cb65f449f68dae97bcb116e11c8d430`.
- [E08-pr184-files.json](E08-pr184-files.json), SHA-256 `3d6e3c8b852dbe56c8abc04a7c9df99a99aaf227fd6c656203665bf34988fe78`.

<a id="E09"></a>
## E09 — PREMIS Data Dictionary

Primary: [PREMIS Data Dictionary](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf). Version: PREMIS 3.0, June 2015, revised November 2015.

Locator: Printed pp.6–7, 59 (§1.5.2), 258–259; PDF zero-based pp.15–16,68,267–268; extracted text lines 452–480,2906–2963,9537–9590.

Result: SUPPORTED. See structured governing conditions and applicability in source-map.json.

- [E09-premis30.pdf](E09-premis30.pdf), SHA-256 `2e3e3fe001798f3f43d26b4aed03e8737310fa044ee001af2493f7c72517b0e0`.
- [E09-premis30.txt](E09-premis30.txt), SHA-256 `33f5c18cadf03d00b9b7a1232d662d40501dbbe17d31caffaa455b487ec22e95`.

<a id="E10"></a>
## E10 — PREMIS semantic-unit listing

Primary: [PREMIS semantic-unit listing](https://www.loc.gov/standards/premis/v3/premis-hierarchical-3-0.html). Version: PREMIS 3.0 HTML listing; page footer 2022-01-28.

Locator: Introduction lines 14–27; Event/Agent lines 117–148.

Result: SUPPORTED. See structured governing conditions and applicability in source-map.json.

- [E10-premis30-listing.html](E10-premis30-listing.html), SHA-256 `135b448572a12fc9a5eb52d250bfab45f702b1ab6213c9baa25a88655cc5566a`.
- [E10-premis30-listing.txt](E10-premis30-listing.txt), SHA-256 `dee1109074e8c1190d05ceb6852a71dee81e6559d5c9b5a931ba67414016041d`.

<a id="E11"></a>
## E11 — git-annex whereis manual

Primary: [git-annex whereis manual](https://git-annex.branchable.com/git-annex-whereis/). Version: Rolling official manual, release version not stated.

Locator: DESCRIPTION; readable lines 24–36.

Result: SUPPORTED. See structured governing conditions and applicability in source-map.json.

- [E11-annex-whereis.html](E11-annex-whereis.html), SHA-256 `e812d30340382ffd2771adc14e35123c327feab0f7b9a3aef818525d0658a5a6`.
- [E11-annex-whereis.txt](E11-annex-whereis.txt), SHA-256 `6d6d5ab38ff75e3a1fe19fe38927c6c7b0ccbc00aabc404bbfeba7cc6606ecbf`.

## Reproducible review operations

Original artifacts were read in full and hashed; freeze hashes/sizes were checked without changing sources. HTTP GET retrieved public primary documentation/API/tagged raw code, with no authentication or account changes. HTML was converted with a local standard-library text parser; PDF text used `pdftotext -layout`, then form feeds were normalized into line breaks for stable text locators. Python `ast.parse` inspected downloaded source syntax and call-site names without executing the module or tests. No gallery assets, validator, package, local/offsite copy or restore were operated.

The E06 AST record lists zero calls to the collision lookup helper. Review the full validation call flow, not just that count. The finding does not assert the output of an unrun executable witness.
