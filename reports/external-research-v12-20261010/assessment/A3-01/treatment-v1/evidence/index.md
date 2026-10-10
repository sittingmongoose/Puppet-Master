# Independent primary evidence — A3-01 treatment reviewer

Every successful entry links the exact independently fetched primary URL and a local text/HTML snapshot. The retrieval manifest records actual HTTP status, access UTC, SHA-256 and resolved URL. These are review evidence, not original candidate captures. Text line locators are those of these saved extracts; versioned source line locators are also given. Candidate S/C/R labels are lineage only. A failed path (E36) is retained as a failed retrieval record, not governing evidence. No downloaded code was executed.

[Assessment](../assessment.md) · [Semantic source map](../source-map.json) · [Retrieval manifest](retrieval-manifest.json)

## E01 — HTTP 200

[Primary URL](https://www.sqlite.org/fts5.html) · [captured bytes](E01.html) · [readable text](E01.txt)

§2.1, §3.1–3.2, §4.3.1, §4.4.1–4.4.4, §4.9, §5.1.1/5.1.3, §6.7/6.12; E01.txt lines 189–193, 235–269, 491–541, 662–828, 1022–1035, 1117–1132, 1323–1342, 1414–1419

Access: 2026-10-10T04:39:32.127542+00:00. SHA-256: `92b7e721147d5119781a80273b43708f2f146314d150abb4d3e6eff1503d6fe6`.

## E02 — HTTP 200

[Primary URL](https://www.sqlite.org/transactional.html) · [captured bytes](E02.html) · [readable text](E02.txt)

Single-transaction guarantee; configuration caveats supplied by E17/E18

Access: 2026-10-10T04:39:32.128498+00:00. SHA-256: `3d6a66c925d32e66fb28872c0e0c32b1936d46f996995c1a30fe591173bc6266`.

## E03 — HTTP 200

[Primary URL](https://sqlite.org/releaselog/3_53_4.html) · [captured bytes](E03.html) · [readable text](E03.txt)

Release header and SQLITE_SOURCE_ID at patch hash section

Access: 2026-10-10T04:39:32.129421+00:00. SHA-256: `c8d12ef674ac295edba47c341cb18b5913795ba94a78474c68e4213970d128ac`.

## E04 — HTTP 200

[Primary URL](https://github.com/quickwit-oss/tantivy/commit/72d1ef9a6468aa68bbc69dcc80cdf60aaf64364d) · [captured bytes](E04.html) · [readable text](E04.txt)

Commit header 72d1ef9; crate-to-commit proof independently in E40

Access: 2026-10-10T04:39:32.135676+00:00. SHA-256: `06a42fed55ac3253a5d083e85d7527a76d5a26b8f2822206d260c466bf314e62`.

## E05 — HTTP 200

[Primary URL](https://docs.rs/crate/tantivy/0.26.2) · [captured bytes](E05.html) · [readable text](E05.txt)

Version list 0.26.2 (2026-09-08), dependencies ^0.26.0

Access: 2026-10-10T04:39:32.137526+00:00. SHA-256: `6e1b947d72168c7337323c14918ada52893f437a62ce300780eb6400fa780dab`.

## E06 — HTTP 200

[Primary URL](https://docs.rs/tantivy/0.26.2/tantivy/indexer/struct.IndexWriter.html) · [captured bytes](E06.html) · [readable text](E06.txt)

IndexWriter commit/delete_term/commit_opstamp/add_document; E06.txt lines 299–358

Access: 2026-10-10T04:39:32.139295+00:00. SHA-256: `f2b22513e42f73f9efb998d901bc8cb33cf7f804a2a92a9faece3a55abfd72bf`.

## E07 — HTTP 200

[Primary URL](https://docs.rs/tantivy/0.26.2/tantivy/struct.IndexReader.html) · [captured bytes](E07.html) · [readable text](E07.txt)

IndexReader reload/searcher; E07.txt lines 228–242

Access: 2026-10-10T04:39:32.309965+00:00. SHA-256: `17d235524009bad02d1530776248ae192cbde2482dfcb53a6c03e4b6d7a44eae`.

## E08 — HTTP 200

[Primary URL](https://docs.rs/tantivy/0.26.2/tantivy/tokenizer/index.html) · [captured bytes](E08.html) · [readable text](E08.txt)

Tokenizer default/custom/example/folding; E08.txt lines 225–291; source boundary E30/E42

Access: 2026-10-10T04:39:32.352095+00:00. SHA-256: `28f76a147756bc1247bc8c0a03f6eb54e8bb542b433ad27e83fcfc7b017dc57e`.

## E09 — HTTP 200

[Primary URL](https://docs.rs/tantivy/latest/src/tantivy/query/query_parser/query_parser.rs.html) · [captured bytes](E09.html) · [readable text](E09.txt)

Observed latest header and parse_query signature; mutable URL, not a pin

Access: 2026-10-10T04:39:32.363907+00:00. SHA-256: `8cc89ab4797f0b442694b37190c9a6c8d61f78834976404aae7236dd51cd272a`.

## E10 — HTTP 200

[Primary URL](https://docs.rs/tantivy/latest/tantivy/query/enum.QueryParserError.html) · [captured bytes](E10.html) · [readable text](E10.txt)

QueryParserError variants on observed latest page; not no-panic proof

Access: 2026-10-10T04:39:32.424351+00:00. SHA-256: `989e12ea05ef523efff34896df34a0b1018479bfa617ca3d747d6124428ac2f7`.

## E11 — HTTP 200

[Primary URL](https://docs.rs/tantivy/0.26.2/tantivy/collector/struct.TopDocs.html) · [captured bytes](E11.html) · [readable text](E11.txt)

TopDocs stability and order_by_score; E11.txt lines 226–234, 344–345

Access: 2026-10-10T04:39:32.441156+00:00. SHA-256: `045ca07362ee79de6e93dcb81fa4afc5777887cbe0d584e2f41d67a13f9ceb93`.

## E12 — HTTP 200

[Primary URL](https://docs.rs/tantivy/0.26.2/tantivy/snippet/struct.Snippet.html) · [captured bytes](E12.html) · [readable text](E12.txt)

Snippet fragment/highlighted/to_html API; implementation E31

Access: 2026-10-10T04:39:32.499457+00:00. SHA-256: `40485be7928ba9ad69d894083afd27ff0de87159e1e01f59ce05c5a6f10abc59`.

## E13 — HTTP 200

[Primary URL](https://github.com/quickwit-oss/tantivy/issues/2847) · [captured bytes](E13.html) · [readable text](E13.txt)

Issue body/version and competing July 28 comment; E13.txt lines 123–182, 191–210

Access: 2026-10-10T04:39:32.532823+00:00. SHA-256: `515098f03638425adf8dfbd0c01fd5fd6e037d2e42aafa303df87e6f2b668541`.

## E14 — HTTP 200

[Primary URL](https://github.com/quickwit-oss/tantivy/issues/3079) · [captured bytes](E14.html) · [readable text](E14.txt)

Issue body/questions/status; E14.txt lines 110–158; no version or confirmed recovery promise

Access: 2026-10-10T04:39:32.551973+00:00. SHA-256: `844605379a424b3dff1db67546c9988533ecab3a4821179698fb4e23017097db`.

## E15 — HTTP 200

[Primary URL](https://github.com/quickwit-oss/tantivy/issues/3031) · [captured bytes](E15.html) · [readable text](E15.txt)

#3031 version/input/cause/fork activity; E15.txt lines 125–188

Access: 2026-10-10T04:39:32.590856+00:00. SHA-256: `3f66cedbb94ba897c83777225c30b25798eb46642975405d1c315bb298f6eb6c`.

## E16 — HTTP 200

[Primary URL](https://github.com/puretechteam/tantivy/commit/28b2ed185381b59c17530bb37cb9e481921ac1f2) · [captured bytes](E16.html) · [readable text](E16.txt)

Fork commit description and parent, E16.txt lines 107–146

Access: 2026-10-10T04:39:32.614991+00:00. SHA-256: `9d7dce9b2b002715a13d0b3144a7b8792db834ce7aeca01531fea2df769d000e`.

## E17 — HTTP 200

[Primary URL](https://www.sqlite.org/wal.html) · [captured bytes](E17.html) · [readable text](E17.txt)

WAL §1/2/4; E17.txt lines 42–97, 133–159, 179–187, 302–320

Access: 2026-10-10T04:39:32.675085+00:00. SHA-256: `f3467b530b883d4a00574fe1a898b3d121ed72764ae28cf66941080ac0badb9e`.

## E18 — HTTP 200

[Primary URL](https://www.sqlite.org/atomiccommit.html) · [captured bytes](E18.html) · [readable text](E18.txt)

Rollback-only scope and hardware/VFS assumptions; E18.txt lines 71–96, 100–163 and §9

Access: 2026-10-10T04:39:32.730087+00:00. SHA-256: `5a5be7b660217c9408c8a81eaf2faa2d08832ed3790f895a0a713916ad856ea1`.

## E19 — HTTP 200

[Primary URL](https://docs.rs/tantivy/0.26.2/tantivy/snippet/index.html) · [captured bytes](E19.html) · [readable text](E19.txt)

Snippet module stored-field example and default maximum, not universal STORED requirement

Access: 2026-10-10T04:39:32.862922+00:00. SHA-256: `3c44040b03607bbc62958ba04a5b5a24dbd3ec154db8533df468e974bf612762`.

## E20 — HTTP 200

[Primary URL](https://www.sqlite.org/releaselog/3_43_0.html) · [captured bytes](E20.html) · [readable text](E20.txt)

3.43.0 release first item and source ID

Access: 2026-10-10T04:39:32.907541+00:00. SHA-256: `a3a5619b15570a64c864514ce4716c37929d7f8918e68ee5bec63ecc40cd87d9`.

## E21 — HTTP 200

[Primary URL](https://www.sqlite.org/lang_conflict.html) · [captured bytes](E21.html) · [readable text](E21.txt)

REPLACE conflict and trigger condition; E21.txt lines 96–118

Access: 2026-10-10T04:39:33.001838+00:00. SHA-256: `772b9b3f407bed4cdf59a32f1dd5828c3bc8293744bc40a3f25d07e15973b75f`.

## E22 — HTTP 200

[Primary URL](https://www.sqlite.org/pragma.html#pragma_recursive_triggers) · [captured bytes](E22.html) · [readable text](E22.txt)

PRAGMA recursive_triggers and synchronous; E22.txt lines 1208–1226 and 1349 onward

Access: 2026-10-10T04:39:33.042131+00:00. SHA-256: `af75d7d7ab00c29e6eea98618cb1259a3919c308af60a6173215bf9798706034`.

## E23 — HTTP 200

[Primary URL](https://www.sqlite.org/releaselog/3_6_18.html) · [captured bytes](E23.html) · [readable text](E23.txt)

3.6.18 release recursive triggers / REPLACE; E23.txt lines 28–32

Access: 2026-10-10T04:39:33.052569+00:00. SHA-256: `66faa369a3b1893193ac24c20698b9a2452d295dd93a3865d2b844def6797267`.

## E24 — HTTP 200

[Primary URL](https://www.sqlite.org/releaselog/3_7_0.html) · [captured bytes](E24.html) · [readable text](E24.txt)

3.7.0 released changes; absence of default item is not universal proof

Access: 2026-10-10T04:39:33.063531+00:00. SHA-256: `494f7be7133a4fd6f839f55ccc0550d30b6e02308aba791187ae9272547077c5`.

## E25 — HTTP 200

[Primary URL](https://www.sqlite.org/oldnews.html) · [captured bytes](E25.html) · [readable text](E25.txt)

2009-09-11 forecast; E25.txt lines 971–998

Access: 2026-10-10T04:39:33.091626+00:00. SHA-256: `94c04284bf044c1e7fceb3ddc5787bc1ed965c56b6e89dfb967f64c05a8391fc`.

## E26 — HTTP 200

[Primary URL](https://docs.rs/tantivy/0.26.2/tantivy/query/struct.QueryParser.html) · [captured bytes](E26.html) · [readable text](E26.txt)

QueryParser grammar/positions/default disjunction/typed boundary; E26.txt lines 228–280, 299–303 and parse_query

Access: 2026-10-10T04:39:33.156437+00:00. SHA-256: `eba1289a3923d0067246421375c95424ae5d6c748ab1e22a67b9c9eb99938cb3`.

## E27 — HTTP 200

[Primary URL](https://sqlite.org/releaselog/3_43_0.html) · [captured bytes](E27.html) · [readable text](E27.txt)

Duplicate www/no-www retrieval of 3.43.0 release

Access: 2026-10-10T04:39:33.161761+00:00. SHA-256: `a3a5619b15570a64c864514ce4716c37929d7f8918e68ee5bec63ecc40cd87d9`.

## E28 — HTTP 200

[Primary URL](https://www.sqlite.org/src/artifact/a54f839859) · [captured bytes](E28.html) · [readable text](E28.txt)

Artifact header check-in 235cf6586b (2025-07-18 trunk), guarded default; E28.txt lines 13–28, 674–679

Access: 2026-10-10T04:39:33.217423+00:00. SHA-256: `98671d710b784784fa1c8e479368e2201a2fd74c43461dc272a03c267e28079f`.

## E29 — HTTP 200

[Primary URL](https://docs.rs/tantivy/0.26.2/tantivy/tokenizer/struct.RemoveLongFilter.html) · [captured bytes](E29.html) · [readable text](E29.txt)

RemoveLongFilter byte-unit API; boundary source in E30/E42

Access: 2026-10-10T04:39:33.225099+00:00. SHA-256: `70b10e68c0c0aeed375da1cc57dc8a3eab949ec8fd02ec7553eb677fa67ba991`.

## E30 — HTTP 200

[Primary URL](https://docs.rs/tantivy/0.26.2/src/tantivy/tokenizer/remove_long.rs.html) · [captured bytes](E30.html) · [readable text](E30.txt)

remove_long.rs source lines 34–37 (predicate); source snapshot also E42

Access: 2026-10-10T04:39:33.241184+00:00. SHA-256: `1e2bdd10c02aeaee5492ca81c4dae9e3b9f7d31f0090bf1744a3919e7a62cc53`.

## E31 — HTTP 200

[Primary URL](https://docs.rs/tantivy/0.26.2/src/tantivy/snippet/mod.rs.html) · [captured bytes](E31.html) · [readable text](E31.txt)

snippet/mod.rs source lines 149–165 to_html, 448–474 canonical-text snippet; E31.txt lines 332–348, 631–657

Access: 2026-10-10T04:39:33.300685+00:00. SHA-256: `32384bccc8a7e34d7161e91d68d1a9bf03ae29268d10664bd42405bbcab8b6bf`.

## E32 — HTTP 200

[Primary URL](https://docs.rs/tantivy/0.26.2/src/tantivy/tokenizer/simple_tokenizer.rs.html) · [captured bytes](E32.html) · [readable text](E32.txt)

simple_tokenizer.rs source lines 30–54 alphanumeric scan

Access: 2026-10-10T04:39:33.318027+00:00. SHA-256: `7ab7b5201c8da6346f5950c45202532bb9d698d8f9f103ef8b11c03570b06e5d`.

## E33 — HTTP 200

[Primary URL](https://docs.rs/tantivy/0.26.2/src/tantivy/tokenizer/tokenizer_manager.rs.html) · [captured bytes](E33.html) · [readable text](E33.txt)

tokenizer_manager.rs source lines 53–77: default pipeline limit(40) then lowercase

Access: 2026-10-10T04:39:33.338084+00:00. SHA-256: `3de53d21084011783d7c69e4f453a67efe6a86510dafde05e1e0948364d680d6`.

## E34 — HTTP 200

[Primary URL](https://github.com/quickwit-oss/tantivy/pull/3075) · [captured bytes](E34.html) · [readable text](E34.txt)

PR3075 open status and branch, proposal and tests are contributor-reported, not reviewer execution

Access: 2026-10-10T04:41:48.129537+00:00. SHA-256: `7966eb6c7dc36e5bc332c4c532623a6562ee7a7d8b18ce78e9594c64369d214b`.

## E35 — HTTP 200

[Primary URL](https://raw.githubusercontent.com/quickwit-oss/tantivy/72d1ef9a6468aa68bbc69dcc80cdf60aaf64364d/Cargo.toml) · [captured bytes](E35.txt) · [readable text](E35.txt)

Commit-pinned Cargo.toml lines 1–14, 60–66: package version, Rust minimum and grammar requirement

Access: 2026-10-10T04:41:48.926560+00:00. SHA-256: `86580e1a8bde15d2b0e0b9eb9ffef5b02fb745fa2f1b01ffe7717841f48bd9d5`.

## E36 — HTTP 404

[Primary URL](https://raw.githubusercontent.com/quickwit-oss/tantivy/72d1ef9a6468aa68bbc69dcc80cdf60aaf64364d/.cargo_vcs_info.json) · [captured bytes](E36.txt)

HTTP 404 at attempted repository .cargo_vcs_info path; no semantic evidence; alternate successful E40

Access: 2026-10-10T04:41:49.093400+00:00. SHA-256: `d5558cd419c8d46bdc958064cb97f963d1ea793866414c025906ec15033512ed`.

## E37 — HTTP 200

[Primary URL](https://docs.rs/tantivy/0.26.2/tantivy/snippet/struct.SnippetGenerator.html) · [captured bytes](E37.html) · [readable text](E37.txt)

SnippetGenerator snippet(&str) versus snippet_from_doc; E37.txt lines 250–259

Access: 2026-10-10T04:41:49.204228+00:00. SHA-256: `fdab17557804f76c0d828801be38a3ed908cb449adc8c3c83bc3b506d5fe979b`.

## E38 — HTTP 200

[Primary URL](https://docs.rs/crate/tantivy-query-grammar/0.26.0/source/src/user_input_ast.rs) · [captured bytes](E38.html) · [readable text](E38.txt)

Released grammar 0.26.0 user_input_ast set_field Exists expect; E38.txt lines 523–543

Access: 2026-10-10T04:41:49.402440+00:00. SHA-256: `4682b0ae238f08d725ca2a809bb9ca810b86654b51a3068a309834a18dc09dc1`.

## E39 — HTTP 200

[Primary URL](https://raw.githubusercontent.com/quickwit-oss/tantivy/72d1ef9a6468aa68bbc69dcc80cdf60aaf64364d/CHANGELOG.md) · [captured bytes](E39.txt) · [readable text](E39.txt)

Commit-pinned CHANGELOG.md lines 1–6, actual 0.26.2 fixes

Access: 2026-10-10T04:41:49.645105+00:00. SHA-256: `702320ebbfe1ab5057d646c7647a834024e07c5741ab040a4113f5d3e446c645`.

## E40 — HTTP 200

[Primary URL](https://docs.rs/crate/tantivy/0.26.2/source/.cargo_vcs_info.json) · [captured bytes](E40.html) · [readable text](E40.txt)

Crate VCS metadata; E40.txt lines 62–66 sha1

Access: 2026-10-10T04:44:20.144576+00:00. SHA-256: `905b09e0ff6cf25d7eeefcbf755a4850d6e1acc3e36655cdf95cd4d8ebf07f9a`.

## E41 — HTTP 200

[Primary URL](https://raw.githubusercontent.com/quickwit-oss/tantivy/72d1ef9a6468aa68bbc69dcc80cdf60aaf64364d/query-grammar/src/query_grammar.rs) · [captured bytes](E41.txt) · [readable text](E41.txt)

Commit-pinned query_grammar.rs lines 365–377 literal optional-field/exists/set_field path; read only, not executed

Access: 2026-10-10T04:44:20.403402+00:00. SHA-256: `8c1590bbfdb84da3a547eace9f74bb2aa755ed865383b2e302d6f0cea73e17fa`.

## E42 — HTTP 200

[Primary URL](https://raw.githubusercontent.com/quickwit-oss/tantivy/72d1ef9a6468aa68bbc69dcc80cdf60aaf64364d/src/tokenizer/remove_long.rs) · [captured bytes](E42.txt) · [readable text](E42.txt)

Commit-pinned remove_long.rs lines 34–37 exclusive byte predicate

Access: 2026-10-10T04:44:20.555323+00:00. SHA-256: `d36c4183a9df3a512ec40c64b993b5ada656c018b588f18341ffec0aa2384d9c`.

