# Source index — A1-01-treatment reviser

This index is limited to sources cited by the complete recommendation in [final.md](../final.md). Source IDs S1–S6 keep the same URL/topic bindings assigned in the predecessor maps; no ID has been rebound. Full source identity, locator, access time, observed operation, governing condition, and applicability are recorded in [source-map.json](../source-map.json).

| ID | Primary source | Exact URL | Used for |
|---|---|---|---|
| S1 | Tus Resumable Upload Protocol 1.0.x; version 1.0.0 dated 2016-03-25 | https://tus.io/protocols/resumable-upload | Core HEAD/PATCH/409 behavior; optional extensions, expiry, per-PATCH checksum, termination and concatenation. |
| S2 | AWS, Uploading and copying objects using multipart upload in Amazon S3; current guide, no semantic version shown | https://docs.aws.amazon.com/us_en/AmazonS3/latest/userguide/mpuoverview.html | AWS-only multipart flow, part IDs/ETags, unfinished request and listing behavior, checksum types, checksum encryption/permission conditions, in-flight stop behavior, completion and cost. |
| S3 | AWS, Amazon S3 multipart upload limits; current guide, no semantic version shown | https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html | AWS-only object/part limits, last-part exception, and ListParts page size. |
| S4 | AWS, Aborting a multipart upload; current guide, no semantic version shown | https://docs.aws.amazon.com/AmazonS3/latest/userguide/abort-mpu.html | AWS-only object visibility before completion, incomplete-part charges, lifecycle cleanup and abort operation. |
| S5 | AWS SDK for Rust maintainers, issue 1240, “Announcement: S3 default integrity change”; AWS SDK S3 client v1.69.0, announced 2025-01-16 | https://github.com/awslabs/aws-sdk-rust/issues/1240 | Release/history evidence for Put checksum and Get validation defaults, plus the third-party implementation compatibility caveat. |
| S6 | tusd issue 1315, “Encounter InternalServerError and InvalidPartOrder when uploading to S3 storage”; opened 2025-09-03 | https://github.com/tus/tusd/issues/1315 | One open report with mutable latest image tag and unknown root cause; motivates a bounded ordered-completion check only. |

## Direct review and limits

All six primary pages were opened directly in this reviser stage. S2 and S4 were reopened around multipart completion, ListParts, checksum tables, KMS/SSE-C notes, and in-flight stop behavior to independently adjudicate C1 and C2. Access time for this review: 2026-10-10T04:24:14Z.

AWS statements apply only to Amazon S3. The fixture leaves its S3-compatible provider, gateway, endpoint, API/model version, SDK, signing mode, encryption, and host contracts unspecified. The tusd issue is a report, not a specification or established general defect. No source supports a claim that this fictional system has been tested or that any proposed limit is optimal.
