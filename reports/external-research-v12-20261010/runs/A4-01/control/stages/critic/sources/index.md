# Critic source index

Source IDs are carried forward without rebinding from the investigator map. Exact URLs, version/release identity, locators, critic access UTC, observed operation, conditions and applicability are recorded in [source-map.json](../source-map.json). Retrieval is research evidence, not product validation. One attempted documentation page is called out below.

| ID | Primary source | Review use |
| --- | --- | --- |
| AWS-01 | [AWS S3 upload objects](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html) | PutObject vs console vs MPU ceilings. |
| AWS-02 | [AWS multipart limits](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html) | Object, part and listing limits. |
| AWS-03 | [AWS multipart overview](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html) | Recovery, completion, checksums, cleanup and checksum-type table. |
| AWS-04 | [AWS checksum integrity](https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity.html) | Algorithm catalog and server verification. |
| AWS-05 | [AWS conditional writes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html) | No-overwrite and conditional completion behavior. |
| AWS-06 | [AWS incomplete-MPU lifecycle](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpu-abort-incomplete-mpu-lifecycle-config.html) | Configured incomplete-part cleanup. |
| R2-01 | [Cloudflare R2 upload objects](https://developers.cloudflare.com/r2/objects/upload-objects/) | R2 operation limits, equal-size non-final parts, cleanup and ETag. |
| R2-02 | [Cloudflare R2 S3 API compatibility](https://developers.cloudflare.com/r2/api/s3/api/) | Operation/header matrix and C1 row attribution. |
| R2-03 | [Cloudflare R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/) | Browser CORS and presigned URL expiry. |
| UPPY-01 | [Uppy AWS S3 uploader](https://uppy.io/docs/aws-s3/) | Candidate browser route, signing and CORS. |
| TUS-01 | [tus resumable upload protocol 1.0.x](https://tus.io/protocols/resumable-upload) | Offset resume and optional per-request checksum. |
| TUSD-01 | [tusd v2.5.0 release](https://github.com/tus/tusd/releases/tag/v2.5.0) | Release/commit identity. |
| TUSD-02 | [tusd v2.5.0 S3 backend docs](https://github.com/tus/tusd/blob/v2.5.0/docs/_storage-backends/aws-s3.md) | Browser content extraction failed; see source-map note. |
| TUSD-03 | [tusd v2.5.0 S3Store source](https://github.com/tus/tusd/blob/v2.5.0/pkg/s3store/s3store.go) | Release-specific part buffering and limits. |
| RCLONE-01 | [rclone S3 backend docs](https://rclone.org/s3/) | Optional CLI behavior, integrity caveats and memory. |
| MINIO-01 | [MinIO issue #19670](https://github.com/minio/minio/issues/19670) | Reported checksum completion difference. |
| MINIO-02 | [MinIO PR #19680](https://github.com/minio/minio/pull/19680) | Merged source fix. |
| MINIO-03 | [MinIO RELEASE.2024-05-10T01-41-38Z](https://github.com/minio/minio/releases/tag/RELEASE.2024-05-10T01-41-38Z) | Tagged release inclusion. |
| MINIO-04 | [MinIO repository](https://github.com/minio/minio) | Archived repository context. |
