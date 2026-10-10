# Investigator source index

Every source ID is stable within this stage and maps to the exact URL, version/commit, access UTC, locator, observed operation, governing condition, and applicability in ../source-map.json. These are bounded public primary sources; the research did not retrieve raw captures or execute downloaded code.

| ID | Product/source | Use |
| --- | --- | --- |
| AWS-01 | [AWS S3 upload objects](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html) | Single PutObject vs console vs MPU ceiling. |
| AWS-02 | [AWS multipart limits](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html) | Exact S3 part/object/count limits and threshold guidance. |
| AWS-03 | [AWS multipart overview](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html) | MPU lifecycle, part ledger, completion, checksum, pagination, abort. |
| AWS-04 | [AWS checksum integrity](https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity.html) | Server validation and checksum-type interpretation. |
| AWS-05 | [AWS conditional writes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html) | Conditional no-overwrite behavior on PutObject/CompleteMultipartUpload. |
| AWS-06 | [AWS abort-incomplete MPU lifecycle](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpu-abort-incomplete-mpu-lifecycle-config.html) | Configured cleanup vs completed objects. |
| R2-01 | [Cloudflare R2 upload objects](https://developers.cloudflare.com/r2/objects/upload-objects/) | R2 limits, equal-size parts, 7-day default abort, ETag. |
| R2-02 | [Cloudflare R2 S3 API compatibility](https://developers.cloudflare.com/r2/api/s3/api/) | Operation/header matrix showing S3-compatible is a subset. |
| R2-03 | [Cloudflare R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/) | Browser presigned URL CORS requirements and expiry behavior. |
| UPPY-01 | [Uppy AWS S3 uploader](https://uppy.io/docs/aws-s3/) | Browser direct upload, per-operation signing, CORS and resume calls. |
| TUS-01 | [tus resumable upload protocol 1.0.x](https://tus.io/protocols/resumable-upload) | Offset-based resume, optional per-PATCH checksum, expiry. |
| TUSD-01 | [tusd v2.5.0 release](https://github.com/tus/tusd/releases/tag/v2.5.0) | Released version/commit for the studied adapter. |
| TUSD-02 | [tusd v2.5.0 S3 backend docs](https://github.com/tus/tusd/blob/v2.5.0/docs/_storage-backends/aws-s3.md) | Compatible endpoint setup and temporary disk behavior. |
| TUSD-03 | [tusd v2.5.0 S3Store source](https://github.com/tus/tusd/blob/v2.5.0/pkg/s3store/s3store.go) | Actual part-size, retry, buffering and implementation cap. |
| RCLONE-01 | [rclone S3 backend docs](https://rclone.org/s3/) | Optional CLI multipart defaults, memory use and checksum caveats. |
| MINIO-01 | [MinIO issue #19670](https://github.com/minio/minio/issues/19670) | Reported AWS-vs-MinIO completion checksum incompatibility. |
| MINIO-02 | [MinIO PR #19680](https://github.com/minio/minio/pull/19680) | Merged code fix and commit. |
| MINIO-03 | [MinIO RELEASE.2024-05-10T01-41-38Z](https://github.com/minio/minio/releases/tag/RELEASE.2024-05-10T01-41-38Z) | Released-tag inclusion of the fix. |
| MINIO-04 | [MinIO repository](https://github.com/minio/minio) | Current archived/read-only repository banner, context only. |
