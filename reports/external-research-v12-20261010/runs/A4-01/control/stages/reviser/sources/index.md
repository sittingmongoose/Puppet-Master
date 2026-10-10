# Reviser source index

Source IDs are carried forward without rebinding from the investigator and critic maps. Exact URLs, version or commit, access UTC, locators, observed operations, conditions and applicability are in [source-map.json](../source-map.json). Public retrieval is research evidence, not product validation.

The reviser independently rechecked [AWS-03](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html) at the multipart checksum table (displayed lines 170–176) and [R2-02](https://developers.cloudflare.com/r2/api/s3/api/) at the MPU and CopyObject rows (displayed lines 516–620). These rechecks settle C2 and C1 respectively.

| ID | Primary source | Use in the proposal |
| --- | --- | --- |
| AWS-01 | [Uploading objects — Amazon S3 User Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html) | AWS S3 PutObject (single SDK/REST/CLI operation); S3 console upload; multipart API. |
| AWS-02 | [Amazon S3 multipart upload limits](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html) | AWS S3 multipart API part-count/object-size/part-size and listing limits. |
| AWS-03 | [Uploading and copying objects using multipart upload in Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html) | CreateMultipartUpload, UploadPart, ListParts, CompleteMultipartUpload, AbortMultipartUpload. |
| AWS-04 | [Checking object integrity in Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity.html) | AWS single/multipart object upload checksum validation and later checksum retrieval. |
| AWS-05 | [How to prevent object overwrites with conditional writes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html) | PutObject and CompleteMultipartUpload with If-None-Match: *; optional If-Match. |
| AWS-06 | [Configuring lifecycle to delete incomplete multipart uploads](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpu-abort-incomplete-mpu-lifecycle-config.html) | S3 lifecycle AbortIncompleteMultipartUpload. |
| R2-01 | [Upload objects — Cloudflare R2](https://developers.cloudflare.com/r2/objects/upload-objects/) | R2 single PUT and multipart upload; automatic incomplete MPU lifecycle. |
| R2-02 | [S3 API compatibility — Cloudflare R2](https://developers.cloudflare.com/r2/api/s3/api/) | R2 ListMultipartUploads, CreateMultipartUpload, CompleteMultipartUpload, AbortMultipartUpload, UploadPart, ListParts. |
| R2-03 | [Configure CORS — Cloudflare R2](https://developers.cloudflare.com/r2/buckets/cors/) | Browser cross-origin access to R2 presigned URLs. |
| UPPY-01 | [AWS S3 uploader — Uppy documentation](https://uppy.io/docs/aws-s3/) | Browser PutObject or multipart CreateMultipartUpload/UploadPart/ListParts/CompleteMultipartUpload/AbortMultipartUpload. |
| TUS-01 | [Resumable Upload Protocol 1.0.x](https://tus.io/protocols/resumable-upload) | HEAD reads Upload-Offset; PATCH applies bytes at that offset; optional checksum extension validates each PATCH body; OPTIONS advertises extensions and Tus-Max-Size. |
| TUSD-01 | [tusd v2.5.0 release](https://github.com/tus/tusd/releases/tag/v2.5.0) | Released reference-server version identity for the S3Store source and docs below. |
| TUSD-02 | [tusd S3 storage backend docs](https://github.com/tus/tusd/blob/v2.5.0/docs/_storage-backends/aws-s3.md) | tusd stores uploads to AWS S3 or compatible service using configured endpoint/bucket. |
| TUSD-03 | [tusd S3Store source](https://github.com/tus/tusd/blob/v2.5.0/pkg/s3store/s3store.go) | S3Store maps tus uploads to S3 multipart; defaults include 5 MiB minimum part, 50 MiB preferred, 10,000 parts, 5 TiB MaxObjectSize, 20 buffered parts, 10 concurrent S3 part uploads. |
| RCLONE-01 | [Amazon S3 backend — rclone documentation](https://rclone.org/s3/) | rclone S3 single/multipart upload and post-upload HEAD/hash checks. |
| MINIO-01 | [MinIO issue #19670: multipart checksum with part count](https://github.com/minio/minio/issues/19670) | CompleteMultipartUpload with SHA256 composite checksum including -partCount suffix. |
| MINIO-02 | [MinIO PR #19680: Accept multipart checksums with part count](https://github.com/minio/minio/pull/19680) | MinIO CompleteMultipartUpload checksum parsing and part-count validation. |
| MINIO-03 | [MinIO RELEASE.2024-05-10T01-41-38Z](https://github.com/minio/minio/releases/tag/RELEASE.2024-05-10T01-41-38Z) | Release includes ‘Accept multipart checksums with part count’ (#19680). |
| MINIO-04 | [MinIO repository status](https://github.com/minio/minio) | Repository archival status only. |

### Retrieval limitation

The critic’s retrieval of TUSD-02 returned an internal error. The investigator’s prior source record is retained; the released TUSD-03 code is the directly inspectable evidence for the temporary-disk behavior and implementation defaults. No product was run.
