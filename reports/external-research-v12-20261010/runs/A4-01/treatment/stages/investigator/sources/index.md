# Evidence index

Public, read-only evidence reviewed 2026-10-10. Source IDs are stable within this stage; exact URL, version/commit, locator, access time, operation, conditions and applicability are in [source-map.json](../source-map.json).

| ID | Source | Bounded use in proposal |
|---|---|---|
| S01–S02 | [AWS upload guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html); [AWS quotas](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html) | Separates PutObject, console workflow and multipart limits; preserves 50 TB vs 48.8 TiB wording. |
| S03–S06 | [AWS multipart overview](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html); [lifecycle examples](https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-configuration-examples.html); [integrity guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity-upload.html); [completion API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html) | Part state, cleanup, checksum scope, and embedded completion errors. |
| S07–S08 | [Uppy S3 docs](https://uppy.io/docs/aws-s3/); [Golden Retriever docs](https://uppy.io/docs/golden-retriever/) | Browser signing/CORS/multipart threshold and limits on browser-side large-file recovery. |
| S09–S10, S19 | [tus protocol](https://tus.io/protocols/resumable-upload); [tusd v2.10.1 S3 backend](https://github.com/tus/tusd/blob/v2.10.1/docs/_storage-backends/aws-s3.md); [tusd v2.10.1 release](https://github.com/tus/tusd/releases/tag/v2.10.1) | Offset-based resumability, optional extensions, relay/backend requirements, and released deferred-length fix. |
| S11 | [AWS conditional writes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html) | Scope and gaps of AWS final-write conditions for idempotency. |
| S12–S13 | [R2 upload guide](https://developers.cloudflare.com/r2/objects/upload-objects/); [R2 limits](https://developers.cloudflare.com/r2/platform/limits/) | Illustrative provider-specific bounds, cleanup default, and 5 TiB vs 4.995 TiB doc difference. |
| S14–S16 | [AWS CLI config](https://docs.aws.amazon.com/cli/latest/topic/s3-config.html); [CLI FAQ](https://docs.aws.amazon.com/cli/latest/topic/s3-faq.html); [cp reference](https://docs.aws.amazon.com/cli/latest/reference/s3/cp.html) | Optional CLI fallback controls; not proof of compatibility or a performed upload. |
| S17–S18 | [MinIO issue #20455](https://github.com/minio/minio/issues/20455); [fix commit f246ee7](https://github.com/minio/minio/commit/f246ee7) | Reported PutObject checksum retrieval mismatch and code fix; no containing release tag identified. |

All evidence supports research findings only. No live archive or provider was accessed and no product behavior was validated.
