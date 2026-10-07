# Independent primary-source evidence — new review attempt

Only ranges identified here count as assessed. Retrieval alone is not a correctness or completeness finding. Original v1 evidence remains untouched. These are source snapshots and static inspections, not executed component tests. All source files are text or an official matrix image; no downloaded code was executed.

Exact URL, retrieval time, response identity, full SHA-256, and derived-text identity are in `retrievals.json` and `checked-sources.json`. Dynamic page/API snapshots are fixed by saved bytes and hash, not claimed to be immutable upstream revisions. GitHub component pins additionally use commits.

## R01 — RFC 8493 / BagIt
Version: BagIt 1.0, October 2018
Required layout; per-manifest coverage; optional tag metadata; oxum, completeness, validity, fetch and safety conditions.

- [rfc8493.txt](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/rfc8493.txt): https://www.rfc-editor.org/rfc/rfc8493.txt
  Retrieved 2026-10-07T18:50:41.166848+00:00; SHA-256 `4964147d2e6e16442d4a6dbfbe68178a8f33c3e791c06d68a8b33f51ad821537`.
  Assessed: L238–565, 634–678, 698–778, 887–949.

## R02 — bagit-python selected code and tag identity
Version: v1.9.0 / 861ddacb339d5b92659f0187a402f501d841abbe
Default hashes; validator gates/reporting; generator version; shared manifest-entry representation; tag fixity; fetch syntax; CLI; read-once hashing; selected conformance gaps. Static inspection, not formal certification.

- [bagit-v190-immutable.py.txt](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/bagit-v190-immutable.py.txt): https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py
  Retrieved 2026-10-07T18:50:40.490424+00:00; SHA-256 `1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a`.
  Assessed: L128–183, 230–277, 328–370, 375–465, 511–574, 583–740, 739–930, 1111–1148, 1203–1257, 1374–1414, 1448–1490, 1540–1580.
- [bagit-v190-ref.json](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/bagit-v190-ref.json): https://api.github.com/repos/LibraryOfCongress/bagit-python/git/ref/tags/v1.9.0
  Retrieved 2026-10-07T18:50:40.478194+00:00; SHA-256 `7c41fcb68acb5959ef7fa44669f4c112f2e3ff0a7557d90622edff499a948c3a`.
  Assessed: object.type/object.sha.
- [bagit-v190.py.txt](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/bagit-v190.py.txt): https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/v1.9.0/bagit.py
  Retrieved 2026-10-07T18:50:40.497396+00:00; SHA-256 `1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a`.
  Assessed: Byte equality with immutable commit file, not an additional independent code assessment.

## R03 — bagit-python predecessor pin
Version: v1.8.1 / 22675e58c893a32107f62549974fdf6844591747
Oxum gate structure and defaults match; surrounding completeness messages and multiprocessing implementation differ. No assertion of whole-file identity.

- [bagit-v181-immutable.py.txt](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/bagit-v181-immutable.py.txt): https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/22675e58c893a32107f62549974fdf6844591747/bagit.py
  Retrieved 2026-10-07T18:50:40.477368+00:00; SHA-256 `0e60e1b92c7a9fad4f458e7668f41a66f9f174162fed23bd5c1e0ae2dabf5e57`.
  Assessed: L126–134, 593–611, 778–802, 839–922; static method-text comparison to v1.9.0.
- [bagit-v181-ref.json](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/bagit-v181-ref.json): https://api.github.com/repos/LibraryOfCongress/bagit-python/git/ref/tags/v1.8.1
  Retrieved 2026-10-07T18:50:40.477564+00:00; SHA-256 `c8700ce1f613672ed13ee0ced9b979865b813a177d98fc4e67ee7adb79e0c7e5`.
  Assessed: object.type/object.sha.
- [bagit-v181.py.txt](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/bagit-v181.py.txt): https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/v1.8.1/bagit.py
  Retrieved 2026-10-07T18:50:40.480979+00:00; SHA-256 `0e60e1b92c7a9fad4f458e7668f41a66f9f174162fed23bd5c1e0ae2dabf5e57`.
  Assessed: Byte equality with immutable commit file.

## R04 — Pinned upstream BagIt tests
Version: test.py at 861ddacb339d5b92659f0187a402f501d841abbe
test_validate_flipped_bit; fast/completeness definitions; detailed checksum and missing/extra-file coverage. Definitions only, no run or complete suite audit.

- [bagit-tests-v190.py.txt](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/bagit-tests-v190.py.txt): https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/test.py
  Retrieved 2026-10-07T18:50:40.437119+00:00; SHA-256 `751f20546c671b9128e9577d077c39574586d7c9be42921f4cd3ab86a5e0ef6a`.
  Assessed: L95–151, 161–250.

## R05 — BagIt reported issues
Version: Live GitHub API snapshot
Both issues open; issue #177 wording is a reporter interpretation contradicted by the successful-oxum full path.

- [bagit-issue137.json](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/bagit-issue137.json): https://api.github.com/repos/LibraryOfCongress/bagit-python/issues/137
  Retrieved 2026-10-07T18:50:40.367822+00:00; SHA-256 `80f70410151b3e71e6be6c5762f590f5306b855d238191ffcfef91d9dcd8a1ee`.
  Assessed: title,state,created_at,body.
- [bagit-issue177.json](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/bagit-issue177.json): https://api.github.com/repos/LibraryOfCongress/bagit-python/issues/177
  Retrieved 2026-10-07T18:50:40.184378+00:00; SHA-256 `ceb4962d11162e4a99c7b612a2c511d456fe28ad76dfde093987dd69ab08deee`.
  Assessed: title,state,created_at,body.
- [bagit-issue137-comments.json](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/bagit-issue137-comments.json): https://api.github.com/repos/LibraryOfCongress/bagit-python/issues/137/comments
  Retrieved 2026-10-07T18:50:40.286689+00:00; SHA-256 `74702d88639299825d721c634a8d0c4ed3fbbb7f5610e787e2604014d5a645a3`.
  Assessed: All comment bodies and html_url.
- [bagit-issue177-comments.json](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/bagit-issue177-comments.json): https://api.github.com/repos/LibraryOfCongress/bagit-python/issues/177/comments
  Retrieved 2026-10-07T18:50:40.300500+00:00; SHA-256 `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945`.
  Assessed: Empty comment array.

## R06 — BagIt proposed patch and rejection history
Version: PR #174; patch commit 18f4b582c7f354418edb6f96068f91cea8d55045; API snapshot
Closed unmerged; reason for rejection; diagnostic improvement distinguished from removing full-mode oxum checks. No merged fix established.

- [bagit-pr174.json](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/bagit-pr174.json): https://api.github.com/repos/LibraryOfCongress/bagit-python/pulls/174
  Retrieved 2026-10-07T18:50:40.243485+00:00; SHA-256 `126d0bc5c0a1f61ff8711e7545e247cb7139537cc0e819a1d13aea8b78683c95`.
  Assessed: title,state,created_at,closed_at,merged_at,body.
- [bagit-pr174.patch](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/bagit-pr174.patch): https://patch-diff.githubusercontent.com/raw/LibraryOfCongress/bagit-python/pull/174.patch
  Retrieved 2026-10-07T18:50:40.423451+00:00; SHA-256 `c6e220031fb6e308a1b18cc8c446fa92a8abf17251941ae17b1df5f4d353953e`.
  Assessed: Complete 990-byte patch.
- [bagit-pr174-comments.json](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/bagit-pr174-comments.json): https://api.github.com/repos/LibraryOfCongress/bagit-python/issues/174/comments
  Retrieved 2026-10-07T18:50:40.189256+00:00; SHA-256 `8a5432cc15c5324c7614d16d6a103ad80389ddbca9ca96c072b04f87f6db3f31`.
  Assessed: All six comments, especially issuecomment-2272257346, -2359230342, -2359532360, -2359595126.

## R07 — BagIt release applicability
Version: v1.9.0 release, 2025-06-13
#174 absent; immutable release code independently establishes actual behavior. Notes alone are not proof.

- [bagit-release-v190.json](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/bagit-release-v190.json): https://api.github.com/repos/LibraryOfCongress/bagit-python/releases/tags/v1.9.0
  Retrieved 2026-10-07T18:50:40.290946+00:00; SHA-256 `440f889a816cbae1de6d557161dc43e6494d102f0c2459bc07a1ff5d04b7700e`.
  Assessed: tag_name,published_at,body.

## R08 — SQLite Online Backup API
Version: Live official docs; page last-updated 2025-11-13
Database snapshots and locking; restart/starvation; alternatives. API does not snapshot external payload files.

- [sqlite-backup.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/sqlite-backup.html): https://www.sqlite.org/backup.html
  Retrieved 2026-10-07T18:50:41.003379+00:00; SHA-256 `306b6cca5c7c2f93b648040ae139f14d7d3221c0d16d79b5749e69d808382e04`.
  Assessed: Derived sqlite-backup.txt L30–70, 141–172, 246–305.

## R09 — SQLite WAL restrictions and corruption history
Version: Live official docs; page last-updated 2026-08-25
Same-host/network restrictions; durability settings; sidecars; exclusive-mode qualifications; WAL-reset race and fixed releases.

- [sqlite-wal.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/sqlite-wal.html): https://www.sqlite.org/wal.html
  Retrieved 2026-10-07T18:50:41.172984+00:00; SHA-256 `f3467b530b883d4a00574fe1a898b3d121ed72764ae28cf66941080ac0badb9e`.
  Assessed: Derived sqlite-wal.txt L41–96, 155–207, 292–326, 428–460, 461–574.

## R10 — SQLite VACUUM / VACUUM INTO
Version: Live official docs
INTO leaves source unchanged and is excluded from ordinary VACUUM write-operation wording; CPU/incremental tradeoff and output interruption conditions.

- [sqlite-vacuum.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/sqlite-vacuum.html): https://www.sqlite.org/lang_vacuum.html
  Retrieved 2026-10-07T18:50:41.159252+00:00; SHA-256 `740f02ade00626f50c7a71ded2615995362fedfc30e09aa22dbe4535b7615c54`.
  Assessed: Derived sqlite-vacuum.txt L45–130.

## R11 — SQLite atomic commit and crash tests
Version: Live official docs; rollback-mode mechanism
Database scope, attached-database super-journal, directory sync, simulated storage failures, broken locks/flushes, hot-journal protection. Not a payload-files transaction protocol.

- [sqlite-atomiccommit.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/sqlite-atomiccommit.html): https://www.sqlite.org/atomiccommit.html
  Retrieved 2026-10-07T18:50:41.033493+00:00; SHA-256 `5a5be7b660217c9408c8a81eaf2faa2d08832ed3790f895a0a713916ad856ea1`.
  Assessed: Derived sqlite-atomiccommit.txt L70–96, 406–432, 541–557, 591–600, 967–1050, 1065–1090.

## R12 — SQLite durability and integrity pragmas
Version: Live official docs; page last-updated 2026-06-04
integrity_check limits, foreign_key_check distinction, synchronous durability by journal mode.

- [sqlite-pragma.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/sqlite-pragma.html): https://www.sqlite.org/pragma.html
  Retrieved 2026-10-07T18:50:41.121842+00:00; SHA-256 `b9bcb335ae818497f3fa05114a10492f64f35503f275da2264f2d5d436db3f5d`.
  Assessed: Derived sqlite-pragma.txt L799–837, 1345–1436.

## R13 — Filesystem rename and fsync conditions
Version: Linux man-pages 6.19, manpage edition 2026-02-08
Namespace atomicity differs from directory durability; same-filesystem rename requirement; flush/error conditions and NFS caveat.

- [rename-manpage.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/rename-manpage.html): https://man7.org/linux/man-pages/man2/rename.2.html
  Retrieved 2026-10-07T18:50:41.352902+00:00; SHA-256 `8772946a809a0db54f4854f200908f10bee758ea452e8df5efd955bc3b8e6e57`.
  Assessed: Derived rename-manpage.txt L30–64, 190–193, 233–239.
- [fsync-manpage.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/fsync-manpage.html): https://man7.org/linux/man-pages/man2/fsync.2.html
  Retrieved 2026-10-07T18:50:40.981851+00:00; SHA-256 `f0a986d21500222ecb69580fc7a910f346c6b1ff1005ca515501fb05bb5d91f5`.
  Assessed: Derived fsync-manpage.txt L26–75.

## R14 — Omeka Access documentation / identity
Version: Access 3.4.47 / 96810900986ce5278cef79c2b9bfcda31d4e59ed
Public/private notice, access level and embargo independence; strictest access inheritance; embargo cascade configuration; static file routing conditions. Analogy, not deployment approval.

- [omeka-access-page.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/omeka-access-page.html): https://omeka.org/s/modules/Access/
  Retrieved 2026-10-07T18:50:40.819040+00:00; SHA-256 `3e97c1fc4b8d229f8409124880a2250321fe179dda8bf81fd270094217e57d41`.
  Assessed: Derived omeka-access-page.txt author/version L17–21 and rights/server-configuration matches L69–237.
- [omeka-access-readme34747.txt](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/omeka-access-readme34747.txt): https://raw.githubusercontent.com/Daniel-KM/Omeka-S-module-Access/3.4.47/README.md
  Retrieved 2026-10-07T18:50:40.850629+00:00; SHA-256 `84eae2c62a7641faf78b7a6c6ec178851498c738c742864a0cb8d93f5efc3fff`.
  Assessed: L78–137, 277–311, 383–405, 533–581.
- [omeka-access-tag34747.json](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/omeka-access-tag34747.json): https://api.github.com/repos/Daniel-KM/Omeka-S-module-Access/git/ref/tags/3.4.47
  Retrieved 2026-10-07T18:50:40.953551+00:00; SHA-256 `e8be17ed4b180dbacf372ee0f4c6e6a05917d050f961f86fbf5724e38909aad3`.
  Assessed: object.type/object.sha.

## R15 — Omeka access-serving code
Version: 96810900986ce5278cef79c2b9bfcda31d4e59ed
Core API visibility check then file gate; privileged/default exceptions; restricted/protected distinction; configured serving path. Selected authorization paths, not an exhaustive security audit.

- [omeka-access-media-check.php.txt](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/omeka-access-media-check.php.txt): https://raw.githubusercontent.com/Daniel-KM/Omeka-S-module-Access/96810900986ce5278cef79c2b9bfcda31d4e59ed/src/Mvc/Controller/Plugin/IsAllowedMediaContent.php
  Retrieved 2026-10-07T18:50:40.661507+00:00; SHA-256 `e06e9316a906c726ec0d26a3ec29798f92628ca41c6094f6b2a161a1d14fcf46`.
  Assessed: L100–207.
- [omeka-access-file-controller.php.txt](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/omeka-access-file-controller.php.txt): https://raw.githubusercontent.com/Daniel-KM/Omeka-S-module-Access/96810900986ce5278cef79c2b9bfcda31d4e59ed/src/Controller/AccessFileController.php
  Retrieved 2026-10-07T18:50:40.716996+00:00; SHA-256 `6c7cf708fc9aec7f268166ce0c273e1516f67223380151e4205f9db8dc31a2d0`.
  Assessed: L1–185, 193–285.

## R16 — Omeka access matrix test
Version: 96810900986ce5278cef79c2b9bfcda31d4e59ed
Anonymous/guest hierarchy matrix definitions exclude some protected/embargo conditions; no test execution or all-surface proof.

- [omeka-access-matrix-test.php.txt](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/omeka-access-matrix-test.php.txt): https://raw.githubusercontent.com/Daniel-KM/Omeka-S-module-Access/96810900986ce5278cef79c2b9bfcda31d4e59ed/tests/AccessTest/Service/AccessMatrixTest.php
  Retrieved 2026-10-07T18:50:40.654394+00:00; SHA-256 `bac02d39dc3060e5103915d168218f32354c4759d13c7166db900c50a519e8b8`.
  Assessed: Entire 125-line file.

## R17 — Archivematica roles and AIP layout
Version: Documentation path 1.13, title 1.13.2; explicitly legacy
Normalization roles, already-preservation-format no-op, AIP-before-DIP, BagIt packaging and metadata relationships. Roles adopted, not a current deployment recommendation.

- [archivematica-113-quickstart.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/archivematica-113-quickstart.html): https://www.archivematica.org/en/docs/archivematica-1.13/getting-started/quick-start/quick-start/
  Retrieved 2026-10-07T18:50:40.393687+00:00; SHA-256 `e5d4470a4a0900fd9766f2745ada0d4b02cf2c3e91560083ab3c634f4c025069`.
  Assessed: Derived archivematica-113-quickstart.txt L194–231, 254–269, 314–352; normalization/storage locators.
- [archivematica-113-aip.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/archivematica-113-aip.html): https://www.archivematica.org/en/docs/archivematica-1.13/user-manual/archival-storage/aip-structure/
  Retrieved 2026-10-07T18:50:40.305916+00:00; SHA-256 `4524dc5f7d14c9ba275f6b20f08f7f50b3901138acaef6bc0f7a52467f5535d1`.
  Assessed: Derived archivematica-113-aip.txt L28–130.

## R18 — Archivematica METS / PREMIS relationships
Version: Legacy 1.13.2 docs; PREMIS example 3.0
Objects/events/agents/rights and derivation relationship examples; METS-lite is candidate shorthand, not a claimed standards profile.

- [archivematica-113-metadata.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/archivematica-113-metadata.html): https://www.archivematica.org/en/docs/archivematica-1.13/user-manual/metadata/METS/
  Retrieved 2026-10-07T18:50:40.338426+00:00; SHA-256 `82f9c2a548557e4b180293cfd5f7d97f4ea5405e86ebaaae6a28dd99794151ae`.
  Assessed: Derived archivematica-113-metadata.txt L140–151, 183–239, 288–305.

## R19 — NDSA Levels matrix
Version: v2.1, March 2026
Storage, Integrity, Control, Metadata, Content; actual levels versus selected candidate targets. OSF supporting guide not needed for the bounded matrix claim and not inspected.

- [ndsa-levels.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/ndsa-levels.html): https://www.ndsa.org/publications/levels-of-digital-preservation/
  Retrieved 2026-10-07T18:50:40.540501+00:00; SHA-256 `d82e909d217e9a08979ec18e844855894aeaffd76c0ebf76df128a98320fc08a`.
  Assessed: Derived ndsa-levels.txt L41–62.
- [ndsa-matrix-v21.png](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/ndsa-matrix-v21.png): https://www.ndsa.org/images/Levels_v2-1.png
  Retrieved 2026-10-07T18:50:40.556696+00:00; SHA-256 `af3bc9e998ba4d3ab7424687d388c9f3e1bc6f6cb76b48987cc49fe977ccb37d`.
  Assessed: Entire five-row/four-level matrix visually inspected; cells mapped in review.

## R20 — LOC format preferences
Version: Live category pages; context from published 2025–2026 introduction
Native fidelity and several acceptable/preferred formats. S14 contains PDF/A in the vector page-layout context; separate text page is clearer support. No categorical PDF/A citation-absence finding.

- [loc-rfs-audio.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/loc-rfs-audio.html): https://www.loc.gov/preservation/resources/rfs/audio.html
  Retrieved 2026-10-07T18:50:40.710868+00:00; SHA-256 `1cb0276d5b78a3058de5d86057b053e39bd224b098c6151508e49cca4452c72b`.
  Assessed: Derived loc-rfs-audio.txt L46–81.
- [loc-rfs-stillimg.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/loc-rfs-stillimg.html): https://www.loc.gov/preservation/resources/rfs/stillimg.html
  Retrieved 2026-10-07T18:50:40.692387+00:00; SHA-256 `46f0763e8d893d8684bdd2b77179a1fec6726f636c191b4ee3f486e67c12c3ce`.
  Assessed: Derived loc-rfs-stillimg.txt L60–103, 135–165; original HTML preferred/acceptable table cells independently parsed.
- [loc-rfs-text.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/loc-rfs-text.html): https://www.loc.gov/preservation/resources/rfs/text.html
  Retrieved 2026-10-07T18:50:40.711190+00:00; SHA-256 `b9e2c4f35be2deddd851c6c46255a162967e913a356493674109082e90d7ba36`.
  Assessed: Derived loc-rfs-text.txt L92–151.

## R21 — LOC RFS applicability / institution assumptions
Version: Introduction names 2025–2026; live FAQ
Published-content selection focus and local resources; not a universal archival-ingest conversion policy. Accessibility and significant properties remain choices.

- [loc-rfs-faq.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/loc-rfs-faq.html): https://www.loc.gov/preservation/resources/rfs/faq.html
  Retrieved 2026-10-07T18:53:20.837722+00:00; SHA-256 `ad1f8f0dec4ba8c37a28552b9f1b45f70a70c95a56ac6e0ea65169c9a3623ca6`.
  Assessed: Derived loc-rfs-faq.txt L31–47.
- [loc-rfs-introduction.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/loc-rfs-introduction.html): https://www.loc.gov/preservation/resources/rfs/introduction.html
  Retrieved 2026-10-07T18:53:21.050279+00:00; SHA-256 `f6cf956cf4a03d3de473e0667d8452934229d1a6b95965b7b88eb9e4f8f253c9`.
  Assessed: Derived loc-rfs-introduction.txt L30–59.

## R22 — Comparison-only storage alternative: OCFL
Version: Specification 1.1
Versioned object-at-rest inventory/digests, within-object dedup, immutable versions. Not a demanded replacement for BagIt or a scored candidate addition.

- [ocfl-spec-v11.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/ocfl-spec-v11.html): https://ocfl.io/1.1/spec/
  Retrieved 2026-10-07T18:50:40.754538+00:00; SHA-256 `6cd3434f46df0d2b73c776f40453715e1bf7b780e5b46945c5b1aa275cd6c112`.
  Assessed: Derived ocfl-spec-v11.txt L34–76, 182–247, 302–325, 330–353, 404–437.

## R23 — Comparison-only backup alternative: restic
Version: Stable docs identify restic 0.19.1; no binary/code pin inspected
Snapshots/restore, metadata versus full-data checks, random-sample noncoverage, retained generations/prune policy. Documentation comparison only; not an implementation or affordability benchmark.

- [restic-repository-checks.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/restic-repository-checks.html): https://restic.readthedocs.io/en/stable/045_working_with_repos.html
  Retrieved 2026-10-07T18:50:40.887707+00:00; SHA-256 `d76d004ededbb3f7d5fdaa4510dd88e809d503ed8f4fd27dd5db5534c9c69880`.
  Assessed: Derived restic-repository-checks.txt L298–393.
- [restic-introduction.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/restic-introduction.html): https://restic.readthedocs.io/en/stable/010_introduction.html
  Retrieved 2026-10-07T18:53:21.344819+00:00; SHA-256 `c7be9c3cbdbbbd0afd4d386e9cdd46392dea8ef7c6f97464b64c070677a5cc3b`.
  Assessed: Derived restic-introduction.txt L26–46.
- [restic-retention.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/restic-retention.html): https://restic.readthedocs.io/en/stable/060_forget.html
  Retrieved 2026-10-07T18:53:21.415518+00:00; SHA-256 `2ac9aafb598368864bf42da3f74198d45fc1ea91bf155a9c3021b90348fdad64`.
  Assessed: Derived restic-retention.txt L31–46, 137–150, 202–210.

## R24 — Comparison-only SQLite remote snapshot alternative
Version: Official sqlite3_rsync docs; 3.50.0 applicability
Live SSH snapshots; former WAL/page-size restrictions removed at 3.50.0; mixed-version negotiation hang workaround. Not ordinary rsync or external-payload snapshotting.

- [sqlite-rsync.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/sqlite-rsync.html): https://www.sqlite.org/rsync.html
  Retrieved 2026-10-07T18:50:41.068353+00:00; SHA-256 `30b70362b95ddb9293b98757f87a3d3d9552f0e2ee45a96578af1578e17fc73d`.
  Assessed: Derived sqlite-rsync.txt L29–92, 120–162.

## R25 — PREMIS optional opportunity context
Version: LOC maintenance activity, current dictionary 3.0
Preservation metadata/event vocabulary lead; combined with R18 object/event/agent/rights evidence. No complete data-dictionary or conformance audit.

- [loc-premis.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/loc-premis.html): https://www.loc.gov/standards/premis/
  Retrieved 2026-10-07T18:50:40.569627+00:00; SHA-256 `6bf3f606c1058e946810fc1756d851bbe8e9ece2e1a8ce8f10da0fbee60ab4b6`.
  Assessed: Derived loc-premis.txt L6, 22–26, 33–58.

## R26 — SQLite WAL-reset fix release
Version: SQLite 3.51.3, 2026-03-13
Corroborates R09 release boundary; no downloaded SQLite build or reproducer run.

- [sqlite-release-3513.html](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/anchors/I-ANCHOR-MUSE/treatment/source-review-v2/sources/sqlite-release-3513.html): https://www.sqlite.org/releaselog/3_51_3.html
  Retrieved 2026-10-07T18:53:21.188114+00:00; SHA-256 `796996305c91c07d490f797d63b22a6e6e28d4d571a28e8ccaebef685e1beab8`.
  Assessed: Derived sqlite-release-3513.txt L89–93; source ID 737ae4a34738ffa0c3ff7f9bb18df914dd1cad163f28fd6b6e114a344fe6d618.

## Retrieval limits

One additional public LICENSE URL returned HTTP 404; it supplies no licensing finding. Three unused repository/module captures were deleted from this new review directory; their retrieval-only records are marked not retained. No inferred source pass uses those captures. Existing task/dispatch/provider receipts and configuration files were not opened.

The supplied S/C maps keep their original meanings. New R IDs are independent review evidence; they never rebind a candidate source ID.
