# ER12-A1-01 source index

Batch accessed at **2026-10-10 03:57:54 UTC**. `source-map.json` contains each record's exact URL, version/release, locator, access time, observed operation, governing condition/exception, and applicability. The notes below are bounded paraphrases of retrieved primary material; line numbers refer to the online pages at access time. No source record is rebound to another page.

| ID | Source | Locator | Use in discovery |
|---|---|---|---|
| [S01](https://tus.io/protocols/resumable-upload) | tus 1.0.0, 2016-03-25 | HEAD/PATCH 128-145; creation 170-218; expiry 246-276; checksum 277-297; termination 327-349 | Offset resumption and optional extensions |
| [S02](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html) | AWS S3 User Guide, current page | Multipart process 4-41; checksums/listing 51-64, 168-176 | Independent parts, retry, completion, billing, ETag/checksum semantics |
| [S03](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html) | AWS multipart limits | Specifications table 3-13 | Bound part size/count arithmetic |
| [S04](https://docs.aws.amazon.com/AmazonS3/latest/userguide/abort-mpu.html) | AWS abort guide | Overview 2-13; abort 77-98 | Cancel, explicit cleanup, no-object-until-complete |
| [S05](https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-configuration-examples.html) | AWS lifecycle examples | Abort MPU 336-356 | Age/prefix lifecycle backstop and configuration caveat |
| [S06](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html) | AWS S3 API 2006-03-01 | Completion 5-13; errors 32-55; response checksum/ETag 364-428 | Embedded error in 200, complete list/errors, checksum type and ETag caveat |
| [S07](https://github.com/minio/minio/issues/21611) | MinIO issue #21611 | Status/archive/version 115-153; report 157-181 | Version-specific HTTPS trailer/checksum compatibility warning |

## Evidence notes

- **S01:** Version header identifies tus 1.0.0 dated 2016-03-25. Core `HEAD` reports offset; `PATCH` must match current offset and mismatch is `409` without mutation. Expiration, checksum, and termination are optional, advertised extensions. These rules apply to tus servers, not automatically to an object-store backend.
- **S02/S03:** Amazon S3 MPU stores numbered independent parts, lists parts for reconciliation, replaces an existing part with the same number, then completes in ascending order. AWS says MPUs do not expire automatically and parts remain billed until complete/abort. It also warns that part requests already in flight may still succeed or fail after abort, so wait for them to settle before aborting if complete cleanup is required. The limits page gives 10,000 parts and 5 MiB-5 GiB (no final-part minimum); 64 MiB yields 96 parts for 6 GiB. This proves only Amazon S3's documented profile.
- **S02/S06:** Acknowledged part, completed object, and independent whole-file verification are distinct. Part and final ETags are not a dependable whole-object MD5. Multipart checksum type may be composite; AWS supports `COMPOSITE` and `FULL_OBJECT` semantics and full-object validation when declared. The algorithm/type matrix matters: a multipart SHA-256 composite is not a direct whole-file SHA-256. Completion HTTP 200 may carry XML `<Error>`, so status alone does not prove assembly.
- **S04/S05:** Incomplete MPU has no visible final object until successful complete. Explicit abort releases parts, and configured lifecycle can abort by key prefix after days since initiation. These are separate controls; lifecycle is a configuration, not an automatic promise for an arbitrary vendor.
- **S07:** A first-party MinIO issue, community-labeled and still marked Open on access, reports that AWS Go SDK `service/s3 v1.73.0+` uses trailer checksums over HTTPS and a MinIO build `RELEASE.2025-09-07T16-13-09Z` rejects an upload above 16 MiB with aws-chunked encoding. The repo is now archived. Treat this as a historical, version-specific report to test, not a universal compatibility rule or reason to disable checksums.
