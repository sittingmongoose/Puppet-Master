# ER12-A1-01 reviser source index

Reviser recheck batch: **2026-10-10 04:26:31 UTC**. [source-map.json](../source-map.json) records exact URL, version/commit or date, locator, access UTC, operation, governing condition/exception, and applicability. S01–S08 retain critic IDs/referents; S09 is appended for the linked PR.

| ID | Source | Use / limitation |
|---|---|---|
| [S01](https://tus.io/protocols/resumable-upload) | tus 1.0.0 (2016-03-25) | HEAD/PATCH offsets and conditional extensions |
| [S02](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html) | Amazon S3 multipart guide | Parts, retry, reconciliation, completion/checksums; AWS only |
| [S03](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html) | Amazon S3 multipart limits | Part/count arithmetic; AWS only |
| [S04](https://docs.aws.amazon.com/AmazonS3/latest/userguide/abort-mpu.html) | Amazon S3 abort guide | Incomplete object and abort; AWS only |
| [S05](https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-configuration-examples.html) | Amazon S3 lifecycle examples | Configured abort by prefix/age; AWS only |
| [S06](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html) | Amazon S3 CompleteMultipartUpload API, 2006-03-01 | Ordered complete, embedded error, ETag/checksum types; AWS only |
| [S07](https://github.com/minio/minio/issues/21611) | MinIO issue #21611, opened 2025-09-28 | HTTPS aws-chunked report; PutObject vs UploadPart; status/archive |
| [S08](https://docs.aws.amazon.com/AmazonS3/latest/API/API_AbortMultipartUpload.html) | Amazon S3 AbortMultipartUpload API, 2006-03-01 | In-flight part race, repeated abort, ListParts empty; AWS only |
| [S09](https://github.com/minio/minio/pull/21626) | Linked MinIO PR #21626 | Closed chunk-limit proposal, not a merged fix |

## Recheck findings

- **S07:** Page showed repository archived 2026-04-25 and issue Open. It names MinIO RELEASE.2025-09-07T16-13-09Z and AWS Go SDK service/s3 v1.73.0+; HTTPS repro uses PutObject and reports failure above 16 MiB with aws-chunked checksum trailers. A contributor distinguishes chunks from parts. It does not establish UploadPart or fictional Rust SDK behavior.
- **S09:** Issue links PR #21626. Page showed Closed, not merged; maintainers challenged the proposed larger configurable limit. No release fix is established.
- **S08:** AWS says in-flight parts may succeed or fail after abort, repeated aborts may be needed, and ListParts should be empty to verify cleanup. AWS-only; qualify other endpoints.

