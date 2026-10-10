# Independent primary evidence index

Assessor IDs are local to this review. Raw HTTP bytes and extracted UTF-8 text are retained with retrieval UTC/status/URL/SHA-256 in [retrieval-manifest.json](retrieval-manifest.json). The [source map](../source-map.json) supplies independent semantic annotations and line locators. HTTP GET/source reading is research; no source code, upload or service write was executed.

| ID | Primary source/version | Local evidence | Governing context |
|---|---|---|---|
| P01 | [AWS S3 live User Guide, release not stated](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html) | [text](P01-text.txt) / [raw](P01-raw.html) | Upload options / PutObject, console, multipart |
| P02 | [AWS S3 live User Guide, release not stated](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html) | [text](P02-text.txt) / [raw](P02-raw.html) | Multipart core specifications |
| P03 | [AWS S3 live User Guide, release not stated](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html) | [text](P03-text.txt) / [raw](P03-raw.html) | Multipart creation/part replacement/completion/listings/pricing |
| P04 | [AWS S3 live User Guide, release not stated](https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-configuration-examples.html) | [text](P04-text.txt) / [raw](P04-raw.html) | AbortIncompleteMultipartUpload lifecycle example |
| P05 | [AWS S3 live User Guide, release not stated](https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity-upload.html) | [text](P05-text.txt) / [raw](P05-raw.html) | Checksum type table / composite numbering / initiation notes |
| P06 | [AWS S3 live API reference, release not stated](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html) | [text](P06-text.txt) / [raw](P06-raw.html) | CompleteMultipartUpload response processing and request conditions |
| P07 | [Live unversioned Uppy AWS S3 docs; CDN example v5.2.1 is not a page-version pin](https://uppy.io/docs/aws-s3/) | [text](P07-text.txt) / [raw](P07-raw.html) | Signing/CORS / shouldUseMultipart / getChunkSize |
| P08 | [Live unversioned Uppy Golden Retriever docs](https://uppy.io/docs/golden-retriever/) | [text](P08-text.txt) / [raw](P08-raw.html) | Storage/recovery defaults |
| P09 | [tus protocol 1.0.0, dated 2016-03-25](https://tus.io/protocols/resumable-upload) | [text](P09-text.txt) / [raw](P09-raw.html) | Core HEAD/PATCH/offset and optional extensions |
| P10 | [tusd v2.10.1 tagged documentation](https://github.com/tus/tusd/blob/v2.10.1/docs/_storage-backends/aws-s3.md) | [text](P10-text.txt) / [raw](P10-raw.html) | S3 backend docs on GitHub |
| P11 | [AWS S3 live User Guide, release not stated](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html) | [text](P11-text.txt) / [raw](P11-raw.html) | Conditional writes / multipart races |
| P12 | [Live Cloudflare R2 upload documentation](https://developers.cloudflare.com/r2/objects/upload-objects/) | [text](P12-text.txt) / [raw](P12-raw.html) | Method comparison and multipart restrictions |
| P13 | [Live Cloudflare R2 limits documentation](https://developers.cloudflare.com/r2/platform/limits/) | [text](P13-text.txt) / [raw](P13-raw.html) | Maximum upload size and numbered footnotes |
| P14 | [Direct current page AWS CLI 2.37.12; cached web title 2.37.6](https://docs.aws.amazon.com/cli/latest/topic/s3-config.html) | [text](P14-text.txt) / [raw](P14-raw.html) | multipart_threshold / multipart_chunksize / transfer-client selection |
| P15 | [Direct current page AWS CLI 2.37.12; cached web title 2.37.5](https://docs.aws.amazon.com/cli/latest/topic/s3-faq.html) | [text](P15-text.txt) / [raw](P15-raw.html) | Upload checksum FAQ |
| P16 | [Direct current page AWS CLI 2.37.12; candidate/cached version labels may differ](https://docs.aws.amazon.com/cli/latest/reference/s3/cp.html) | [text](P16-text.txt) / [raw](P16-raw.html) | cp global and checksum options |
| P17 | [MinIO issue #20455; reported server RELEASE.2024-09-13T20-26-02Z](https://github.com/minio/minio/issues/20455) | [text](P17-text.txt) / [raw](P17-raw.html) | Expected/current behavior and environment |
| P18 | [MinIO commit f246ee7f9ba1c3a133206e5726bfbb9d3bd86bf7, 2024-09-19](https://github.com/minio/minio/commit/f246ee7) | [text](P18-text.txt) / [raw](P18-raw.html) | Fix PutObject Trailing checksum commit/diff |
| P19 | [tusd v2.10.1 release, 2026-09-16; tag resolves 388a27cb81c33b2349e0308b5e97e23797e86fd9](https://github.com/tus/tusd/releases/tag/v2.10.1) | [text](P19-text.txt) / [raw](P19-raw.html) | Release changes / PR #1385 |
| P20 | [Google Cloud Storage live documentation; last updated 2026-10-07](https://cloud.google.com/storage/docs/resumable-uploads) | [text](P20-text.txt) / [raw](P20-raw.html) | JSON initiation / CORS / session URI / integrity / retry |
| P21 | [tusd v2.10.1 raw tagged backend document](https://raw.githubusercontent.com/tus/tusd/v2.10.1/docs/_storage-backends/aws-s3.md) | [text](P21-text.txt) / [raw](P21-raw.txt) | Storage format / Considerations / consistency / R2 configuration |
| P22 | [GitHub release API for tusd v2.10.1](https://api.github.com/repos/tus/tusd/releases/tags/v2.10.1) | [text](P22-text.txt) / [raw](P22-raw.json) | published_at and body |
| P23 | [tusd PR #1385 primary author report; clean public API](https://api.github.com/repos/tus/tusd/pulls/1385) | [text](P23-text.txt) / [raw](P23-raw.json) | Summary / root cause / fix / tests |
| P24 | [tusd PR #1385 public file patches](https://api.github.com/repos/tus/tusd/pulls/1385/files) | [text](P24-text.txt) / [raw](P24-raw.json) | s3store.go FinishUpload plus regression tests |
| P25 | [MinIO commit f246ee7f9ba1c3a133206e5726bfbb9d3bd86bf7 primary API](https://api.github.com/repos/minio/minio/commits/f246ee7) | [text](P25-text.txt) / [raw](P25-raw.json) | commit and files[].patch caller/definition |
| P26 | [MinIO PR #20456 primary API](https://api.github.com/repos/minio/minio/pulls/20456) | [text](P26-text.txt) / [raw](P26-raw.json) | merged_at / merge_commit_sha / body |
| P27 | [MinIO issue #20455 primary API; reported RELEASE.2024-09-13T20-26-02Z](https://api.github.com/repos/minio/minio/issues/20455) | [text](P27-text.txt) / [raw](P27-raw.json) | body Expected Behavior / Current Behavior / Environment |
| P28 | [tusd v2.10.1 tagged s3store.go](https://raw.githubusercontent.com/tus/tusd/v2.10.1/pkg/s3store/s3store.go) | [text](P28-text.txt) / [raw](P28-raw.txt) | FinishUpload lines 850 onward; WriteChunk and cached incomplete state |
| P29 | [tusd v2.10.1 GitHub tag ref primary API](https://api.github.com/repos/tus/tusd/git/ref/tags/v2.10.1) | [text](P29-text.txt) / [raw](P29-raw.json) | object.sha / object.type |
| P30 | [AWS S3 live CompletedPart API reference](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompletedPart.html) | [text](P30-text.txt) / [raw](P30-raw.html) | PartNumber Note, general-purpose and directory buckets |
| P31 | [AWS S3 live UploadPart API reference](https://docs.aws.amazon.com/AmazonS3/latest/API/API_UploadPart.html) | [text](P31-text.txt) / [raw](P31-raw.html) | Part identification / checksum/encryption/endpoint conditions |
| P32 | [Released AWS CLI tag 2.37.6, commit not resolved](https://raw.githubusercontent.com/aws/aws-cli/2.37.6/awscli/customizations/s3/transferconfig.py) | [text](P32-text.txt) / [raw](P32-raw.txt) | transferconfig.py DEFAULTS and conversion caller |
| P33 | [Released AWS CLI tag 2.37.6, commit not resolved](https://raw.githubusercontent.com/aws/aws-cli/2.37.6/awscli/customizations/s3/utils.py) | [text](P33-text.txt) / [raw](P33-raw.txt) | utils.py SIZE_SUFFIX and human_readable_to_int |

Original scoped artifact hashes and paths: [original-inspected-manifest.json](original-inspected-manifest.json). Freeze/path comparisons: [freeze-and-path-check.json](freeze-and-path-check.json). Independent arithmetic/process check: [reviewer-checks.json](reviewer-checks.json). Actual reviewer active Goal response: [reviewer-goal-active.json](reviewer-goal-active.json). Reviewer terminal receipt is written only after the complete judgment is saved.
