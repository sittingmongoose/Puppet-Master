# Independent primary-source inspection map

Every source below was independently retrieved and statically inspected in the specified range. Retrieval alone is not source correctness. Code and tests were read, never executed. Reviewer-only counterevidence earns no candidate research credit. Exact capture identities and retrieval timestamps are in manifest.json. HTML text files are deterministic HTMLParser extractions with script/style omitted, whitespace-only lines removed; their numbered lines are local locators, not upstream line numbers. Source-code line numbers use the upstream exact file.

## P01
URL: https://www.rfc-editor.org/rfc/rfc8493.html
Version: RFC 8493, October 2018
Actually assessed: RFC §§1.3,2.1-2.4,3,5.1-5.4,6.1.1-6.1.2; extracted lines 130-159,180-343,383-475,526-575,583-635 plus naming subsection
Retrieved UTC: 2026-10-07T18:50:30.748131+00:00
Evidence: sources/P01.html
SHA-256: f801a6d8685e3910354079fe2194b223f574343b74f0897d505a32bf313925f2
HTTP 200; 63600 bytes.

## P02
URL: https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/v1.9.0/bagit.py
Version: v1.9.0
Actually assessed: bagit.py lines 128-148,195-259,383-460,451-543,545-572,586-630,628-728,729-940,1111-1148,1275-1313,1433-1518,1535-1600
Retrieved UTC: 2026-10-07T18:50:30.632061+00:00
Evidence: sources/P02.py.txt
SHA-256: 1c851d04fb8ebdc28e5ad2ffc484569575a1f3922ed83abccd61edd3ee26f80a
HTTP 200; 54632 bytes.

## P03
URL: https://www.sqlite.org/atomiccommit.html
Version: rolling doc
Actually assessed: atomic commit §§3,4,5,9; extracted lines 387-425,450-644,993-1080; attached-DB versus arbitrary file distinction
Retrieved UTC: 2026-10-07T18:50:30.778406+00:00
Evidence: sources/P03.html
SHA-256: 5a5be7b660217c9408c8a81eaf2faa2d08832ed3790f895a0a713916ad856ea1
HTTP 200; 77968 bytes.

## P04
URL: https://omeka.org/s/docs/user-manual/content/items/
Version: rolling manual
Actually assessed: Items: permissions table, private-object roles, owner deletion, site/user defaults, property visibility, public/private media; extracted lines 116-238,300-324; linked-resource/template presence
Retrieved UTC: 2026-10-07T18:50:30.679799+00:00
Evidence: sources/P04.html
SHA-256: f36a64815742c75aac25927348b9f5a0e0f4b96d3de571d8d8703934ebba69da
HTTP 200; 64527 bytes.

## P05
URL: https://www.archivematica.org/en/docs/archivematica-1.18/getting-started/overview/intro/
Version: Archivematica 1.18
Actually assessed: introduction body, extracted lines 28-69; OAIS, AtoM, SIP appraisal, audience, licenses; intro-only negative term check
Retrieved UTC: 2026-10-07T18:50:30.766173+00:00
Evidence: sources/P05.html
SHA-256: 245b64ef520e43be5d951eea66f4bd442655f0cd3c87d0b967d7f4b1caa32809
HTTP 200; 24438 bytes.

## P06
URL: https://www.archivematica.org/en/docs/
Version: rolling version index
Actually assessed: version index: stable-current1.18.0 and storage-service headings; extracted lines 1-11,30-38
Retrieved UTC: 2026-10-07T18:50:30.792197+00:00
Evidence: sources/P06.html
SHA-256: 1914917c686e6b9615969da556692b9324dc094906a643e694962e93a1bce04a
HTTP 200; 16437 bytes.

## P07
URL: https://www.archivematica.org/en/docs/archivematica-1.18/
Version: Archivematica 1.18
Actually assessed: documentation root: transfer/BagIt, SIP-AIP-DIP, PREMIS, normalization, format policy; extracted lines 35-50,66-76,100-163
Retrieved UTC: 2026-10-07T18:50:30.798571+00:00
Evidence: sources/P07.html
SHA-256: c4bb42b8115950619983934dabb707482113ee766038ac7465e995ad6a560173
HTTP 200; 44903 bytes.

## P08
URL: https://api.github.com/repos/LibraryOfCongress/bagit-python/issues/177
Version: issue 177 retrieval snapshot
Actually assessed: issue state, title, created_at, body; no claimed fix accepted
Retrieved UTC: 2026-10-07T18:50:30.891711+00:00
Evidence: sources/P08.json
SHA-256: ceb4962d11162e4a99c7b612a2c511d456fe28ad76dfde093987dd69ab08deee
HTTP 200; 2771 bytes.

## P09
URL: https://api.github.com/repos/LibraryOfCongress/bagit-python/pulls/174
Version: PR 174 retrieval snapshot
Actually assessed: PR state, merged, created_at, closed_at, merge_commit_sha, body; unmerged status
Retrieved UTC: 2026-10-07T18:50:31.045231+00:00
Evidence: sources/P09.json
SHA-256: 126d0bc5c0a1f61ff8711e7545e247cb7139537cc0e819a1d13aea8b78683c95
HTTP 200; 16696 bytes.

## P10
URL: https://api.github.com/repos/LibraryOfCongress/bagit-python/issues/174/comments
Version: PR 174 discussion retrieval snapshot
Actually assessed: all six PR174 comments; maintainer/reporter exchange and author close explanation
Retrieved UTC: 2026-10-07T18:50:31.288985+00:00
Evidence: sources/P10.json
SHA-256: 8a5432cc15c5324c7614d16d6a103ad80389ddbca9ca96c072b04f87f6db3f31
HTTP 200; 12373 bytes.

## P11
URL: https://api.github.com/repos/LibraryOfCongress/bagit-python/releases/tags/v1.9.0
Version: v1.9.0 release metadata
Actually assessed: tag_name, published_at, created_at, full release body and PR references
Retrieved UTC: 2026-10-07T18:50:30.935567+00:00
Evidence: sources/P11.json
SHA-256: 440f889a816cbae1de6d557161dc43e6494d102f0c2459bc07a1ff5d04b7700e
HTTP 200; 4053 bytes.

## P12
URL: https://api.github.com/repos/LibraryOfCongress/bagit-python/pulls/183
Version: PR 183 retrieval snapshot
Actually assessed: PR183 body, merged state/date and merge_commit_sha; pool lifecycle/constructor failure
Retrieved UTC: 2026-10-07T18:50:31.105797+00:00
Evidence: sources/P12.json
SHA-256: c9134bddde6fa253d38aa7d461264c077cb8e624022842ee65d24f0874e10bc9
HTTP 200; 17640 bytes.

## P13
URL: https://api.github.com/repos/LibraryOfCongress/bagit-python/pulls/162
Version: PR 162 retrieval snapshot
Actually assessed: PR162 body, merged state/date and merge_commit_sha; CLI tests and completeness diagnostics
Retrieved UTC: 2026-10-07T18:50:31.085973+00:00
Evidence: sources/P13.json
SHA-256: cf0ec73d0d0133c93be4dc8553e2b66324d4e68d1703527585c348042ccc17a4
HTTP 200; 17936 bytes.

## P14
URL: https://api.github.com/repos/LibraryOfCongress/bagit-python/pulls/184
Version: PR 184 retrieval snapshot
Actually assessed: PR184 body, merged state/date and merge_commit_sha; removing expandvars only
Retrieved UTC: 2026-10-07T18:50:31.192081+00:00
Evidence: sources/P14.json
SHA-256: 3f82b9c64514a1d9510033d62b83908e3cb65f449f68dae97bcb116e11c8d430
HTTP 200; 17852 bytes.

## P15
URL: https://api.github.com/repos/LibraryOfCongress/bagit-python/git/ref/tags/v1.9.0
Version: v1.9.0 tag identity
Actually assessed: tag ref object SHA/type; v1.9.0 resolves directly to commit 861ddacb339d5b92659f0187a402f501d841abbe
Retrieved UTC: 2026-10-07T18:50:31.247018+00:00
Evidence: sources/P15.json
SHA-256: 7c41fcb68acb5959ef7fa44669f4c112f2e3ff0a7557d90622edff499a948c3a
HTTP 200; 369 bytes.

## P17
URL: https://api.github.com/repos/LibraryOfCongress/bagit-python/pulls/183/files
Version: PR183 snapshot
Actually assessed: both file patches: bagit.py pool close/join and test.py RuntimeError constructor regression
Retrieved UTC: 2026-10-07T18:51:42.669141+00:00
Evidence: sources/P17.json
SHA-256: 87417bf650db10ec885edc893c7f985910748ae216331fae2cee78db04f5bb48
HTTP 200; 2462 bytes.

## P18
URL: https://api.github.com/repos/LibraryOfCongress/bagit-python/pulls/162/files
Version: PR162 snapshot
Actually assessed: bagit.py CLI/completeness patch; test.py CLI cases, independently cross-checked against P28
Retrieved UTC: 2026-10-07T18:51:42.699984+00:00
Evidence: sources/P18.json
SHA-256: b90489d0d620918ee2c602177704fdd332e8c8e286df7479648f2d79d0362ab8
HTTP 200; 10513 bytes.

## P19
URL: https://api.github.com/repos/LibraryOfCongress/bagit-python/issues/173
Version: issue173 snapshot
Actually assessed: issue body Issue2 and traceback (UnboundLocalError after pool construction failure); fix context, not every reporter mechanism endorsed
Retrieved UTC: 2026-10-07T18:51:42.543533+00:00
Evidence: sources/P19.json
SHA-256: d919c4e26d7ec7af10576269abdc62757757ea886dd58b09888e7065689fdc18
HTTP 200; 6970 bytes.

## P20
URL: https://forum.omeka.org/t/media-privacy-and-direct-file-urls/29696.json
Version: forum discussion July2026 snapshot
Actually assessed: July8 maintainer response by jflatnes, post3; direct-file availability and permission-enforcing storage alternatives; reporter chronology distinguished
Retrieved UTC: 2026-10-07T18:51:42.494447+00:00
Evidence: sources/P20.json
SHA-256: 3311c08063ae9f79e7cd1a5202557005c8cc671d1fda86e20031587ee0f07900
HTTP 200; 19952 bytes.

## P21
URL: https://omeka.org/s/modules/Access/
Version: rolling module-owned documentation
Actually assessed: module-owned server configuration and delivery conditions; extracted lines 115-118,190-205,299-302
Retrieved UTC: 2026-10-07T18:51:42.434985+00:00
Evidence: sources/P21.html
SHA-256: 3e97c1fc4b8d229f8409124880a2250321fe179dda8bf81fd270094217e57d41
HTTP 200; 51281 bytes.

## P22
URL: https://api.github.com/repos/omeka/omeka-s/releases/latest
Version: published release snapshot
Actually assessed: release tag_name=v4.2.1 and published_at=2026-06-18T17:25:14Z; independent conditional analogue pin only
Retrieved UTC: 2026-10-07T18:51:42.643362+00:00
Evidence: sources/P22.json
SHA-256: dd723f863772ba196e6a6713b911146d8efe38af11205a3d6e302912809d0f68
HTTP 200; 6290 bytes.

## P23
URL: https://www.sqlite.org/howtocorrupt.html
Version: rolling documentation
Actually assessed: How To Corrupt §1.2 live backup, journal/WAL companionship; §1.3 journal loss and filesystem/flush conditions
Retrieved UTC: 2026-10-07T18:51:42.598347+00:00
Evidence: sources/P23.html
SHA-256: e00709e3f37e95332d8e6df243510665e9cab1d7938d4fd85cbf5f47648a50bf
HTTP 200; 46737 bytes.

## P24
URL: https://man7.org/linux/man-pages/man2/fsync.2.html
Version: Linux man-pages rolling published man page
Actually assessed: fsync file versus directory distinction; extracted lines 26-39
Retrieved UTC: 2026-10-07T18:51:42.945930+00:00
Evidence: sources/P24.html
SHA-256: f0a986d21500222ecb69580fc7a910f346c6b1ff1005ca515501fb05bb5d91f5
HTTP 200; 15152 bytes.

## P25
URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html
Version: AWS S3 rolling official documentation
Actually assessed: Object Lock versus versioning, per-version retention, modes; extracted lines 6-38,59-68,109-125
Retrieved UTC: 2026-10-07T18:51:42.620019+00:00
Evidence: sources/P25.html
SHA-256: 84cdbe56b2484c985c2f9b7a17a4485945dae6abd0e8ea52996f07cdf8b63d1f
HTTP 200; 36101 bytes.

## P26
URL: https://openzfs.github.io/openzfs-docs/man/master/8/zpool-scrub.8.html
Version: OpenZFS master manpage snapshot
Actually assessed: scrub verification and redundant-pool repair, I/O limits; extracted lines 143-165
Retrieved UTC: 2026-10-07T18:51:42.719446+00:00
Evidence: sources/P26.html
SHA-256: 0103bc9c8356495131580755687cbac7f1c0b5c5e55785884d351d88c114a90c
HTTP 200; 28396 bytes.

## P27
URL: https://restic.readthedocs.io/en/stable/100_references.html
Version: restic stable repository-design reference snapshot
Actually assessed: repository snapshot ordering and chunk dedup; extracted lines 600-638; threat-model assumptions and detection limitations 639-670
Retrieved UTC: 2026-10-07T18:51:42.739445+00:00
Evidence: sources/P27.html
SHA-256: 40cc7855bbbdab09699bac73c5d094f7cf519980e3d5a75a7e2172a497e18264
HTTP 200; 109592 bytes.

## P28
URL: https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/test.py
Version: bagit-python v1.9.0 exact commit
Actually assessed: pinned test.py lines 100-144 (bit flip/rename/oxum),383-407 (tag reference),449-468 (pool error),482-485 (0.97),868-903 (authorized save),1141-1263 (CLI)
Retrieved UTC: 2026-10-07T18:52:09.935106+00:00
Evidence: sources/P28.source.txt
SHA-256: 751f20546c671b9128e9577d077c39574586d7c9be42921f4cd3ab86a5e0ef6a
HTTP 200; 49297 bytes.

## P29
URL: https://api.github.com/repos/omeka/omeka-s/git/ref/tags/v4.2.1
Version: Omeka S v4.2.1
Actually assessed: annotated tag object SHA/type; resolved by P36
Retrieved UTC: 2026-10-07T18:52:09.941907+00:00
Evidence: sources/P29.json
SHA-256: 91a9403a156d5d36d0873dd6892c83439683ec228373f612235f873b61bb9aab
HTTP 200; 329 bytes.

## P31
URL: https://raw.githubusercontent.com/omeka/omeka-s/v4.2.1/application/src/File/Store/Local.php
Version: Omeka S v4.2.1
Actually assessed: Local store lines 36-53,72-90; file copy/local path and direct URI
Retrieved UTC: 2026-10-07T18:52:10.072711+00:00
Evidence: sources/P31.source.txt
SHA-256: a31a28a5b461e00efa066044d5e80b0f46c3cf4d4a9bd330e68fb7e6f30cd50a
HTTP 200; 2692 bytes.

## P32
URL: https://raw.githubusercontent.com/omeka/omeka-s/v4.2.1/application/src/Api/Representation/MediaRepresentation.php
Version: Omeka S v4.2.1
Actually assessed: MediaRepresentation originalUrl lines 50-56 and thumbnailUrl64-86; URL assembly checked with Local factory/store, no permission-inference from this method alone
Retrieved UTC: 2026-10-07T18:52:09.969662+00:00
Evidence: sources/P32.source.txt
SHA-256: 7c9675c97a79caa5d2702f8f6097501e87b72c25904d9827d8a865f96b54c20a
HTTP 200; 8273 bytes.

## P33
URL: https://www.archivematica.org/en/docs/archivematica-1.18/user-manual/preservation/preservation-planning/
Version: Archivematica1.18
Actually assessed: Preservation Planning body, extracted lines29-45; FPR rules/tools and upgrade-preserved local policy
Retrieved UTC: 2026-10-07T18:52:10.035781+00:00
Evidence: sources/P33.html
SHA-256: 1347e1d59491587fb60d20383b68ce841ded6339dd21b7857df0ad6ba33ccc5e
HTTP 200; 100840 bytes.

## P34
URL: https://www.archivematica.org/en/docs/archivematica-1.18/user-manual/archival-storage/archival-storage/
Version: Archivematica1.18
Actually assessed: Archival Storage body extracted lines29-40; AIP inventory/download and DIP separation only
Retrieved UTC: 2026-10-07T18:52:10.142350+00:00
Evidence: sources/P34.html
SHA-256: a61f103be14bcb610b594db39237c8bfce858b3c73d4acf175a9149cc470d487
HTTP 200; 47178 bytes.

## P35
URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/DeletingObjectVersions.html
Version: AWS S3 rolling official documentation
Actually assessed: version expiry/permanent deletion; extracted lines8-18,29-43,59-61
Retrieved UTC: 2026-10-07T18:53:19.176927+00:00
Evidence: sources/P35.html
SHA-256: 4216af1b1cbbe352a409948753f9ae79fcc12df091d2f04e8f8454a1b298eda2
HTTP 200; 23837 bytes.

## P36
URL: https://api.github.com/repos/omeka/omeka-s/git/tags/dbdfcd335d41c6391af17e944c42d1ff288fb855
Version: Omeka v4.2.1 annotated tag
Actually assessed: annotated tag object resolves to commit7e428a3296a399e21a6a6418578175ad8c7edf60
Retrieved UTC: 2026-10-07T18:53:19.348883+00:00
Evidence: sources/P36.json
SHA-256: d55bc58a67eb1175c0e715bd4441aea39d8cdbc256ca1573b4186f5c514ce982
HTTP 200; 656 bytes.

## P38
URL: https://raw.githubusercontent.com/omeka/omeka-s/v4.2.1/application/src/Service/File/Store/LocalFactory.php
Version: Omeka v4.2.1
Actually assessed: LocalFactory lines20-33; default filesystem and URI root /files
Retrieved UTC: 2026-10-07T18:53:19.658393+00:00
Evidence: sources/P38.source.txt
SHA-256: b14be249c63b49e8404019849d37a7250fd81a7de8ba22cad66146bd3562e839
HTTP 200; 1102 bytes.

## P39
URL: https://raw.githubusercontent.com/omeka/omeka-s/7e428a3296a399e21a6a6418578175ad8c7edf60/.htaccess.dist
Version: Omeka S v4.2.1 exact commit 7e428a3296a399e21a6a6418578175ad8c7edf60
Actually assessed: exact-commit .htaccess.dist lines5-10; existing static files served before application routing
Retrieved UTC: 2026-10-07T18:53:38.080959+00:00
Evidence: sources/P39.source.txt
SHA-256: da4d6119e55b3f36ecc55ce9f7054c4801dde65c9af4ee563b75b1228281674e
HTTP 200; 1229 bytes.

## Retrieval failures and locator-only reads

P16 test_bagit.py returned404; P28 test.py at the same exact commit is the corrected inspected source. P30 .htaccess returned404; P37 root-filename listing located .htaccess.dist, and P39 is that file at the resolved v4.2.1 commit. No failed fetch is counted as inspected substantive evidence.

P37 is a public filename listing used only for a locator, not a product/source correctness claim.

## Frozen input identities

input-identities.json captures exact hashes/line counts of authorized inputs and supplied evidence. These identities describe files read in this review; they do not claim to verify excluded terminal receipts or candidate allowances.
