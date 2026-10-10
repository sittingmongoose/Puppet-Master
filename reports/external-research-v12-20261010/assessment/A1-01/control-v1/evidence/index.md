# Independent evidence index — A1-01 control v1

Reviewer R IDs are independent of candidate S IDs. Evidence was retrieved without authentication or source execution. Local plaintext line numbers refer to the saved reviewer extraction, not original browser line numbers. Raw response bytes are retained for verification. [Source map](../source-map.json) records operation, version, conditions and applicability.

## R01

[tus resumable upload protocol](https://tus.io/protocols/resumable-upload) — 1.0.0; 2016-03-25.

Access UTC: 2026-10-10T04:33:59.874348+00:00; HTTP 200. Governing context: About this version; core HEAD/PATCH/OPTIONS; expiration, checksum, termination and concatenation; local R01.txt:35-37; R01.txt:170-233; R01.txt:338-438; R01.txt:448-468.

[Raw capture](R01.html); [plaintext](R01.txt).

Raw SHA-256: `868947ec6573ff745f31649d730616bfcd7d154af0c22ab39f1af4937f3e3a21`; text SHA-256: `10d85535f1bbcd3170f00690abd44a17705966538c4c9b485e23c2ff90cfa386`.

Offset mismatch rejects mutation. Checksum failure discards that PATCH and leaves offset unchanged when the extension is supported. Expiration and termination are optional advertised capabilities. Authentication and backend crash persistence are outside protocol prescription.

tus implementations; not S3 APIs. Durably coupling bytes and offset is an engineering inference from the reported-offset contract, not an executed crash test.

## R02

[Amazon S3 multipart overview](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html) — Live AWS User Guide accessed 2026-10-10; document revision UNKNOWN.

Access UTC: 2026-10-10T04:33:59.875981+00:00; HTTP 200. Governing context: Multipart process; parts upload; completion; listings; checksums; pricing and encryption permissions; local R02.txt:7-32; R02.txt:47-138; R02.txt:168-193; R02.txt:307-324.

[Raw capture](R02.html); [plaintext](R02.txt).

Raw SHA-256: `69c3cbba7a976efc7d37f933d113a2f48eff409ff27800614db1c4b08aee95b4`; text SHA-256: `45e147610791e831a80b1f6e29a0ff4035e240abea93e4617a9f3cd93bb94e9e`.

Independent parts and same-number replacement; journal part numbers/ETags for completion. Listings omit unfinished requests and are verification, not an unconditional replacement for the caller's completion list. No automatic MPU expiry; explicit completion/abort or configured lifecycle required. Checksummed completion has algorithm/numbering conditions.

Amazon S3 documented service behavior only. Final's gateway journal plus qualified reconciliation does not claim arbitrary vendors or listings alone establish byte identity.

## R03

[Amazon S3 multipart upload limits](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html) — Live AWS User Guide accessed 2026-10-10; document revision UNKNOWN.

Access UTC: 2026-10-10T04:33:59.877370+00:00; HTTP 200. Governing context: Multipart upload core specifications table; local R03.txt:11-28.

[Raw capture](R03.html); [plaintext](R03.txt).

Raw SHA-256: `387c24248a3e09a9e067c15cd7d4f5786ff739db309b5306a987d884caee34f9`; text SHA-256: `f0a4327e411756df798913c974c7be20f5d5c407df68e9d88c76a6a7efa4ce1f`.

5 MiB–5 GiB parts; last part has no minimum; 10,000 parts numbered 1–10,000; ListParts page maximum 1,000. Current maximum object 48.8 TiB. These are binary units where stated.

AWS only. 6 GiB / 16 MiB = 384; 20 MiB = 16 + 4 MiB final part; preliminary 64 MiB gives 96 parts. Arithmetic is not throughput or vendor qualification.

## R04

[Amazon S3 abort multipart guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/abort-mpu.html) — Live AWS User Guide accessed 2026-10-10; document revision UNKNOWN.

Access UTC: 2026-10-10T04:33:59.883241+00:00; HTTP 200. Governing context: Opening explanation; API link; incomplete MPU lifecycle; local R04.txt:5-22.

[Raw capture](R04.html); [plaintext](R04.txt).

Raw SHA-256: `27667f4cb5abe91f5bb98929bd6f4c116e54b0eef2428a87c4735ed2b508049c`; text SHA-256: `7ecf350f3f8c4b0c9e6663e1bf48dbdae37084211e3eb132c79d08c3b50259c0`.

S3 assembles an object only after successful completion. Incomplete parts remain storage requiring complete/abort; configured lifecycle is another cleanup mechanism.

AWS only. Final correctly distinguishes incomplete-MPU abort from deletion of a completed object.

## R05

[Amazon S3 lifecycle examples](https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-configuration-examples.html) — Live AWS User Guide accessed 2026-10-10; document revision UNKNOWN.

Access UTC: 2026-10-10T04:33:59.987250+00:00; HTTP 200. Governing context: Lifecycle configuration to abort multipart uploads; local R05.txt:393-419.

[Raw capture](R05.html); [plaintext](R05.txt).

Raw SHA-256: `916007f60cb1790ef0669ff2df47f7472e83145defb176f311e9d2e721453276`; text SHA-256: `61080337dbbda438268a86fee2e460da7be21017ae857b40132bc836b1e1d1b9`.

Key-prefix selection and days after initiation; deletes associated incomplete parts. Tag-based filters cannot be used with this action. Seven days is the documentation example, not automatic service policy.

Configured Amazon S3 rule only. Final's seven-day gateway deadline and fourteen-day backstop are original policies; timing/filter/operation qualification remains required.

## R06

[CompleteMultipartUpload API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html) — S3 API namespace 2006-03-01; live reference accessed 2026-10-10; document revision UNKNOWN.

Access UTC: 2026-10-10T04:34:00.025501+00:00; HTTP 200. Governing context: Operation introduction, special errors, request syntax and checksum fields; local R06.txt:7-30; R06.txt:46-72.

[Raw capture](R06.html); [plaintext](R06.txt).

Raw SHA-256: `1f308a018c0679f7aac9f444888c409721ba63965d902aef8fd498957cc7a9f1`; text SHA-256: `89180d995d29607a59437feae359b316a6998f270c94133eeabac5f98c302d16`.

Ordered complete PartNumber/ETag list; initial HTTP 200 may contain an embedded error. AWS SDKs handle this condition according to configuration; a raw caller must parse it. NoSuchUpload includes invalid, aborted or completed IDs. Encryption-related permissions apply to checksum operation.

AWS API semantics; exact compatible endpoint and Rust SDK handling unknown. Final requires parsed success or reconciliation, not HTTP status alone.

## R07

[MinIO issue #21611](https://github.com/minio/minio/issues/21611) — Opened 2025-09-28; report names RELEASE.2025-09-07T16-13-09Z and Go service/s3 v1.73.0+; reproduction pins v1.73.0; archive banner 2026-04-25.

Access UTC: 2026-10-10T04:34:00.105801+00:00; HTTP 200. Governing context: Issue body/reproduction/environment, contributor comments, referenced commits, current status and Development; local R07.txt:96-139; R07.txt:154-193; R07.txt:201-246; R07.txt:269-272.

[Raw capture](R07.html); [plaintext](R07.txt).

Raw SHA-256: `880a9289535a974cab2e346367d504177453088c0db3c897533918b987ffc637`; text SHA-256: `2b690c195487e92455f2a36ef65ccd20500cdf175655aae25941b9e74174f331`.

Reporter describes >16 MiB failure; contributor separates streaming chunks from MPU parts and discusses buffering. Open issue is not release evidence. Workarounds in comments are reports, not independently qualified integrity-preserving recommendations.

Specific historical MinIO/Go path; not a Rust UploadPart result or universal part-size rule. Development currently shows no PR; relationship to #21626 is independently supported by the PR's own issue reference.

## R08

[AbortMultipartUpload API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_AbortMultipartUpload.html) — S3 API namespace 2006-03-01; live reference accessed 2026-10-10; document revision UNKNOWN.

Access UTC: 2026-10-10T04:34:00.129503+00:00; HTTP 200. Governing context: Opening abort race and ListParts guidance; error semantics; local R08.txt:7-13; R08.txt:106-109.

[Raw capture](R08.html); [plaintext](R08.txt).

Raw SHA-256: `dce987a4dd51d5f0c41f1efa579e28b05b8c585bcc879f5e503d242c524d0d02`; text SHA-256: `1cf3d7c663584ad74f92cd9929c8ead96ce1cb055e1fb4fb1d1b2ff76ad26926`.

In-flight parts might succeed or fail after abort; repeated abort can be necessary. AWS recommends ListParts empty to verify storage removal. Operation absence/error interpretation must be profiled rather than treated as successful cleanup by fiat.

AWS only; final extends a single fenced/drained/reconciled cleanup procedure to cancel, expiry, source change and orphans, with durable unresolved state.

## R09

[MinIO PR #21626 conversation](https://github.com/minio/minio/pull/21626) — Opened 2025-10-07; closed 2026-02-02; unmerged; proposal commit 3f2a26c48eb0cf3a1c9a92eb0cc819a03819fe39; actual current PR head recorded in R13.

Access UTC: 2026-10-10T04:34:00.226765+00:00; HTTP 200. Governing context: Status; description/issue reference; commit timeline; maintainer comments/closure; local R09.txt:109-153; R09.txt:268-332; R09.txt:333-369.

[Raw capture](R09.html); [plaintext](R09.txt).

Raw SHA-256: `545cf53180d1ab366a7c12f0b10ef61ac975145cf2eb77ad339e56be77f7476e`; text SHA-256: `d0aa31ef36242b40e107c013501d7c862234a6ae106e2731350018a291444e66`.

Closed PR is not a shipped fix. Maintainers criticized the change and pointed to AIStor, a different product; that comment is not verified release evidence for the named MinIO build.

History/context only. Final uses it to retain uncertainty, not claim a compatible release.

## R10

[AWS checking object integrity for uploads](https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity-upload.html) — Live AWS User Guide accessed 2026-10-10; document revision UNKNOWN.

Access UTC: 2026-10-10T04:34:00.235394+00:00; HTTP 200. Governing context: Checksum algorithm/type matrix; full-object MPU; initiation conditions; trailing checksums; local R10.txt:7-21; R10.txt:84-204; R10.txt:542-619.

[Raw capture](R10.html); [plaintext](R10.txt).

Raw SHA-256: `120bba4c5fffd1ffa8a57aa6e08d1adad866decadc331a77ab195afb27d73c11`; text SHA-256: `c63963285ce50a15475b0e1acc4003e5e5d95b89082cc66c2e308784423a946d`.

Multipart SHA-256 is composite; AWS FULL_OBJECT MPU support is CRC64NVME/CRC32/CRC32C, not SHA-256. Existing algorithm checksum headers at completion can be accepted but not validated/stored if initiation omitted the algorithm. Wire-body chunks and MPU parts differ; trailer format is a request-encoding property.

AWS only. Final's same-algorithm/type requirement and readback fallback avoid promising whole-file SHA-256 from AWS's composite field. No SHA-to-CRC downgrade is silently selected.

## R11

[AWS presigned URL use and expiry](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) — Live AWS User Guide accessed 2026-10-10; document revision UNKNOWN.

Access UTC: 2026-10-10T04:34:00.335736+00:00; HTTP 200. Governing context: URL capabilities; temporary credentials; expiration time; bearer token explanation; local R11.txt:7-34; R11.txt:43-83.

[Raw capture](R11.html); [plaintext](R11.txt).

Raw SHA-256: `4e6f7c5f3d9c826b209fd4e7048c9982125cb75c18ff4d4ab7e470cd4235eecc`; text SHA-256: `946fd4e60a4bab5b4581e162c94451bcecd333798cca8c1aceb1364265ef3b53`.

Reusable bearer capability limited by signer's permissions; temporary credential expiry can shorten URL life. Expiration is checked at request time; documented download may continue past expiry once started. Merely expiring a grant is not proof that every in-flight write has drained.

AWS presigned URLs; not host principal binding at the object store. Final conditions direct writes on a proven grant/request-drain boundary and otherwise proxies or disables them.

## R12

[ListParts API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListParts.html) — S3 API namespace 2006-03-01; live reference accessed 2026-10-10; document revision UNKNOWN.

Access UTC: 2026-10-10T04:34:00.385274+00:00; HTTP 200. Governing context: Opening pagination and permissions; local R12.txt:7-17; R12.txt:29-34.

[Raw capture](R12.html); [plaintext](R12.txt).

Raw SHA-256: `0487b570d09f6b38d76bc82b525db4ff06f293d9a09c44470fdd1e0a71a69bb3`; text SHA-256: `0d3c63563008daf53223ae20432ce2d0e891b3c41b6b99666c5a4515a9de7955`.

Default and maximum 1,000 entries; IsTruncated/NextPartNumberMarker govern pagination. SSE-KMS/DSSE-KMS listing requires decrypt permission.

AWS only. Final calls for complete-set reconciliation and profile-tested pagination, with no untested vendor guarantee.

## R13

[GitHub REST PR #21626 metadata](https://api.github.com/repos/minio/minio/pulls/21626) — PR created 2025-10-07T12:40:45Z; closed 2026-02-02T10:04:08Z; head 00cce833b0482ea7070986b1f467ad2c22089c43.

Access UTC: 2026-10-10T04:35:04.429437+00:00; HTTP 200. Governing context: JSON state, merged, merged_at, head.sha, created_at, closed_at; local R13.json: state/merged/merged_at/head.sha.

[Raw capture](R13.json).

Raw SHA-256: `69a42a5b002f4025dfe8ce54cad6d03119fc39d5190cfc9cb978a1c50d54987d`.

state=closed; merged=false; merged_at=null. A non-null merge_commit_sha alone does not establish merger; current head differs from 3f2a26c proposal commit.

Confirms a minor final source-map commit-label error; does not overturn final's closed/not-merged judgment.

## R14

[AWS Go SDK service/s3 v1.73.0 changelog](https://raw.githubusercontent.com/aws/aws-sdk-go-v2/service/s3/v1.73.0/service/s3/CHANGELOG.md) — Pinned tag service/s3/v1.73.0; release entry 2025-01-15.

Access UTC: 2026-10-10T04:35:04.735566+00:00; HTTP 200. Governing context: First v1.73.0 release entry, lines 1–5; local R14.md:1-5.

[Raw capture](R14.md).

Raw SHA-256: `c07a2902b2c98ace8a14e6d4b29bdeb2c7dc9c5856c543218073bbdbc233b089`.

Request checksums default for operations supporting/requiring them, such as PutObject/UploadPart; default CRC32. Configurable when_supported/when_required. Response validation is skipped for algorithms unimplemented by that SDK.

Go service/s3 v1.73.0 release only; independently corroborates the issue's changed-default lead without extrapolating to fictional Rust SDK.

## Provenance and checks

- [Retrieval manifest](retrieval-manifest.json): URLs, access times, response headers where captured, exact raw/text hashes.
- [Original inspected manifest](original-inspected-manifest.json): original paths, bytes, SHA-256 and mtimes.
- [Freeze identity checks](freeze-identity-check.json): terminal/stage frozen identity comparisons; not semantic proof.
- [Reviewer native active receipt](reviewer-native-active.json): actual observed Goal activation before judgment save.
- Candidate original sources and findings remain at their original paths, linked by [assessment.md](../assessment.md).


## Completion and delivery

- [Actual reviewer native terminal observation](reviewer-native-terminal.json), captured after the complete judgment was saved.
- [Output verification](output-verification.json).
- [Final original-byte preservation check](final-original-identity-check.json).
- [Delivery record](delivery.json).
