# ER12 investigator source index

Evidence notes are paraphrased and bounded. Exact source identities, access UTC, locators, conditions, and applicability are in the sibling `source-map.json`. Discovery cites these stable IDs; do not reassign IDs if pages change.

| ID | Primary source | Key locator and use |
|---|---|---|
| S1 | [Tus resumable upload protocol 1.0.0](https://tus.io/protocols/resumable-upload) | Core HEAD/PATCH offset and 409 behavior; optional creation, expiry, checksum, termination extensions. Protocol version dated 2016-03-25. |
| S2 | [AWS S3 multipart upload overview](https://docs.aws.amazon.com/us_en/AmazonS3/latest/userguide/mpuoverview.html) | Initiate/part/complete, part bookkeeping, ETag limitation, full-object checksum, incomplete-part costs and abort race. AWS behavior only. |
| S3 | [AWS S3 multipart limits](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html) | 5 MiB–5 GiB parts (last may be smaller), 10,000 parts, 1,000 part listing page limit. AWS behavior only. |
| S4 | [AWS S3 abort multipart upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/abort-mpu.html) | Incomplete object visibility, charges until completion/abort, and lifecycle cleanup. AWS behavior only. |
| S5 | [AWS SDK for Rust S3 default integrity announcement, issue 1240](https://github.com/awslabs/aws-sdk-rust/issues/1240) | Maintainer says v1.69.0 (2025-01-16) changed default checksum behavior and warns third-party services may lag. Compatibility-boundary rationale. |
| S6 | [tusd issue 1315](https://github.com/tus/tusd/issues/1315) | Open report (2025-09-03; used mutable `latest`) of multipart completion `InvalidPartOrder`; version and root cause remain unknown. Treat as test motivation, not general proof. |

## Applicability guard
Only S1 is a protocol specification. S2–S4 describe Amazon S3. S5–S6 report behavior of particular implementation versions/configurations, with S6's version unresolved. None establishes conformance of the fictional gateway or unnamed S3-compatible service. No test or upload was run.
