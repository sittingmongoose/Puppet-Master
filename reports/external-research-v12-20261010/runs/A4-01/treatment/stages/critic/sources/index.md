# Critic source index

Read-only public primary evidence independently checked for this review. Exact versions/commits, locators, access times, operations, conditions and applicability are recorded in [source-map.json](../source-map.json). Critic IDs C01-C19 are distinct from investigator IDs S01-S19; each C record separately records the corresponding investigator ID.

| Critic ID | Source | Bounded use |
|---|---|---|
| C01–C04 | [AWS upload guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html); [AWS multipart quotas](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html); [AWS integrity guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity-upload.html); [CompleteMultipartUpload API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html) | Operation-specific size limits, part-number/checksum conditions and embedded completion errors. |
| C05–C07 | [Uppy AWS S3 docs](https://uppy.io/docs/aws-s3/); [Uppy Golden Retriever docs](https://uppy.io/docs/golden-retriever/); [tus protocol 1.0.x](https://tus.io/protocols/resumable-upload) | Browser multipart threshold/CORS, browser persistence and recovery, resumable offsets and chunk-checksum scope. |
| C08–C09 | [tusd v2.10.1 S3 backend](https://github.com/tus/tusd/blob/v2.10.1/docs/_storage-backends/aws-s3.md); [tusd v2.10.1 release](https://github.com/tus/tusd/releases/tag/v2.10.1) | Backend constraints and the released deferred-length truncation fix. |
| C10–C11 | [MinIO issue #20455](https://github.com/minio/minio/issues/20455); [fix commit f246ee7](https://github.com/minio/minio/commit/f246ee7) | Reported PutObject checksum retrieval mismatch and code-level fix; no packaged release inference. |
| C12–C13, C19 | [AWS multipart overview](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html); [AWS conditional writes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html); [AWS lifecycle examples](https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-configuration-examples.html) | Completion manifest, retained parts, race controls and configurable cleanup example. |
| C14–C16 | [AWS CLI S3 configuration](https://docs.aws.amazon.com/cli/latest/topic/s3-config.html); [AWS CLI checksum FAQ](https://docs.aws.amazon.com/cli/latest/topic/s3-faq.html); [AWS CLI cp reference](https://docs.aws.amazon.com/cli/latest/reference/s3/cp.html) | CLI defaults, checksum behavior, and endpoint/profile controls as candidate-client behavior. |
| C17–C18 | [R2 upload guide](https://developers.cloudflare.com/r2/objects/upload-objects/); [R2 limits](https://developers.cloudflare.com/r2/platform/limits/) | R2-specific multipart behavior and the two pages' 5 TiB / 4.995 TiB wording difference. |

All sources were viewed read-only. No account or bucket access, credential handling, upload, executable product test, or archive validation was performed.
