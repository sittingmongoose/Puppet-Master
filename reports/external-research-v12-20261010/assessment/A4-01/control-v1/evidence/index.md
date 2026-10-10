# Independent primary evidence index

The reviewer captured these primary sources separately. Local text line numbers refer only to the saved reviewer extraction; raw HTML preserves table structure. Captures are research evidence, never product validation. Original stage source roots contained indexes and maps, with no separate raw captures.

[Assessment](../assessment.md) · [Machine judgment](../assessment.json) · [Source map](../source-map.json) · [Original hashes](original-artifact-manifest.json) · [Freeze checks](freeze-integrity-check.json)

| Reviewer ID | Primary URL | Saved evidence | Governing check |
| --- | --- | --- | --- |
| I-AWS-01 | [Uploading objects — Amazon S3 User Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html) | [text](I-AWS-01.txt) / [raw](I-AWS-01.html) | Depending on size / upload choices; local text lines 12–38, single PUT examples later. |
| I-AWS-02 | [Amazon S3 multipart upload limits](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html) | [text](I-AWS-02.txt) / [raw](I-AWS-02.html) | Multipart core specification table, local text lines 12–27. |
| I-AWS-03 | [Uploading and copying objects using multipart upload in Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html) | [text](I-AWS-03.txt) / [raw](I-AWS-03.html) | Initiation, Parts upload, Completion, Listings, Checksums; local text lines 47–139 and algorithm/type table near end. |
| I-AWS-04 | [Checking object integrity in Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity.html) | [text](I-AWS-04.txt) / [raw](I-AWS-04.html) | Algorithm catalog and upload server verification; local text lines 6–39. |
| I-AWS-05 | [How to prevent object overwrites with conditional writes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html) | [text](I-AWS-05.txt) / [raw](I-AWS-05.html) | If-None-Match applicability and Conditional write behavior; local text includes existing/current version, 412 and 409 paragraphs. |
| I-AWS-06 | [Configuring lifecycle to delete incomplete multipart uploads](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpu-abort-incomplete-mpu-lifecycle-config.html) | [text](I-AWS-06.txt) / [raw](I-AWS-06.html) | Introductory AbortIncompleteMultipartUpload and configured day-count example. |
| I-R2-01 | [Upload objects — Cloudflare R2](https://developers.cloudflare.com/r2/objects/upload-objects/) | [text](I-R2-01.txt) / [raw](I-R2-01.html) | Choose an upload method local lines 114–131; Multipart details lines 830–843. |
| I-R2-02 | [S3 API compatibility — Cloudflare R2](https://developers.cloudflare.com/r2/api/s3/api/) | [text](I-R2-02.txt) / [raw](I-R2-02.html) | CompleteMultipartUpload local lines 596–600; CopyObject 604–657; UploadPart begins 658. Raw HTML preserves actual table-row structure. |
| I-R2-03 | [Configure CORS — Cloudflare R2](https://developers.cloudflare.com/r2/buckets/cors/) | [text](I-R2-03.txt) / [raw](I-R2-03.html) | Use CORS with a presigned URL; expired URL paragraph. |
| I-UPPY-01 | [AWS S3 uploader — Uppy documentation](https://uppy.io/docs/aws-s3/) | [text](I-UPPY-01.txt) / [raw](I-UPPY-01.html) | Direct upload/signing modes local lines 28–64; signRequest operation mapping; Bucket and CORS setup 330–375. |
| I-TUS-01 | [Resumable Upload Protocol 1.0.x](https://tus.io/protocols/resumable-upload) | [text](I-TUS-01.txt) / [raw](I-TUS-01.html) | Core HEAD/PATCH and offsets; Expiration; Checksum extension, local lines 360–410. |
| I-TUSD-01 | [tusd v2.5.0 release](https://github.com/tus/tusd/releases/tag/v2.5.0) | [text](I-TUSD-01.txt) / [raw](I-TUSD-01.html) | Release tag/commit local lines 110–145; independent release API published_at/created_at. |
| I-TUSD-02 | [tusd S3 storage backend docs](https://github.com/tus/tusd/blob/v2.5.0/docs/_storage-backends/aws-s3.md) | original blob unavailable | Raw tagged file: Configuration, Alternative endpoints, Storage format and Considerations; local raw text lines 9–101. |
| I-TUSD-03 | [tusd S3Store source](https://github.com/tus/tusd/blob/v2.5.0/pkg/s3store/s3store.go) | [text](I-TUSD-03.txt) / [raw](I-TUSD-03.html) | Raw source package comments and S3Store fields; New constructor; MaxObjectSize check. |
| I-RCLONE-01 | [Amazon S3 backend — rclone documentation](https://rclone.org/s3/) | [text](I-RCLONE-01.txt) / [raw](I-RCLONE-01.html) | Data integrity local lines 732–775; Multipart uploads 879–901; upload-cutoff/chunk options 3483–3526. |
| I-MINIO-01 | [MinIO issue #19670: multipart checksum with part count](https://github.com/minio/minio/issues/19670) | [text](I-MINIO-01.txt) / [raw](I-MINIO-01.html) | Issue description/reproduction local lines 123–235; CompleteMultipartUpload checksum variants 222–224. |
| I-MINIO-02 | [MinIO PR #19680: Accept multipart checksums with part count](https://github.com/minio/minio/pull/19680) | [text](I-MINIO-02.txt) / [raw](I-MINIO-02.html) | PR merge and issue link; independent commit patch NewChecksumWithType / Matches / CompleteMultipartUpload. |
| I-MINIO-03 | [MinIO RELEASE.2024-05-10T01-41-38Z](https://github.com/minio/minio/releases/tag/RELEASE.2024-05-10T01-41-38Z) | [text](I-MINIO-03.txt) / [raw](I-MINIO-03.html) | Release tag/commit local lines 125–136 and included #19680 change; API body. |
| I-MINIO-04 | [MinIO repository status](https://github.com/minio/minio) | [text](I-MINIO-04.txt) / [raw](I-MINIO-04.html) | Local text line 96. |

## Supplemental primary evidence

- [I-TUSD-02-RAW primary URL](https://raw.githubusercontent.com/tus/tusd/v2.5.0/docs/_storage-backends/aws-s3.md) — [saved body](I-TUSD-02-RAW.txt), SHA-256 `4c7f40f4e8f1501842d3f7cbb6398017da363710c1ea9a87fabcc841db56a806`.
- [I-TUSD-03-RAW primary URL](https://raw.githubusercontent.com/tus/tusd/v2.5.0/pkg/s3store/s3store.go) — [saved body](I-TUSD-03-RAW.txt), SHA-256 `5ea530d16e1bc5030e8a4ea0caa3a70691ff6d2be14ed6dad54526b4839e11a0`.
- [I-TUSD-RELEASE-API primary URL](https://api.github.com/repos/tus/tusd/releases/tags/v2.5.0) — [saved body](I-TUSD-RELEASE-API.txt), SHA-256 `ad07245b3716abb75a537d32adc37c8b7d85dbc62f78a01836b785e1d0b1930a`.
- [I-MINIO-FIX primary URL](https://github.com/minio/minio/commit/0b245da.patch) — [saved body](I-MINIO-FIX.txt), SHA-256 `31468573681b4ae94d1c7c15497d0e9977da7f2a1d63c9c864851e5c93cccbd3`.
- [I-MINIO-RELEASE-API primary URL](https://api.github.com/repos/minio/minio/releases/tags/RELEASE.2024-05-10T01-41-38Z) — [saved body](I-MINIO-RELEASE-API.txt), SHA-256 `96f60320ada1b7bc61eec5be3d977464027e0ca196a1175c7166d03e9f187a5f`.

## Web-tool retrieval and reviewer native receipt

- [AWS initial retrieval](web-aws-initial.json)
- [Checksum/R2/tusd retrieval](web-checksums-r2-tusd.json)
- [Routes and conditions](web-routes-conditions.json)
- [tus/rclone/MinIO history](web-tus-rclone-minio.json)
- [Reviewer Goal active receipt](reviewer-native-active.json)

The tagged tusd backend blob returned HTTP 503; its raw tagged primary URL succeeded. The release API establishes 2024, correcting the surviving 2026 metadata year without changing any frozen candidate file.

- [Reviewer native Goal completion receipt](reviewer-native-complete.json) — returned complete after full judgment save/verification.
- [Assessment save verification](assessment-save-verification.json).
