# ER12 critic source index

Independent access batch: 2026-10-10T04:13:28Z (UTC clock read immediately after opening the six pages). Source IDs S1–S6 are preserved from the investigator map and remain bound to the same URLs and claims.

| ID | Primary source | Independent check and critique use |
|---|---|---|
| S1 | [Tus resumable upload protocol 1.0.0](https://tus.io/protocols/resumable-upload) | Read version/date, HEAD/PATCH offset and 409 requirements, OPTIONS extension discovery, and creation, expiration, checksum, and termination rules. Confirms the draft's protocol description; auth, URL, and persistence details remain implementation choices. |
| S2 | [AWS S3 multipart upload overview](https://docs.aws.amazon.com/us_en/AmazonS3/latest/userguide/mpuoverview.html) | Read initiation, part numbering/replacement, ETag, completion, ListParts, checksum, in-flight part, and permission sections. Confirms the draft's general AWS caveats; exposes the full-object versus composite algorithm and encryption conditions in finding C1, and the pending-part visibility/retry gap in C2. AWS evidence only. |
| S3 | [AWS S3 multipart limits](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html) | Read current part/object/count/list-page table. Confirms AWS limits and the stated 16 MiB arithmetic only for AWS. |
| S4 | [AWS S3 abort multipart upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/abort-mpu.html) | Read object-visibility, incomplete-part cost, lifecycle, and abort-by-upload-ID sections. Confirms AWS cleanup context; not evidence of equivalent vendor behavior. |
| S5 | [AWS SDK for Rust S3 integrity announcement, issue 1240](https://github.com/awslabs/aws-sdk-rust/issues/1240) | Read issue status, opening date, v1.69.0 behavior, third-party compatibility warning, and configuration note. Open at access. It is an implementation announcement, not a general S3-compatible-service guarantee. |
| S6 | [tusd issue 1315](https://github.com/tus/tusd/issues/1315) | Read issue status/date, reporter's mutable tusproject/tusd:latest version, AWS S3 setup, and completion error. Open at access; exact image version/root cause unresolved. One report only, suitable as test motivation. |

## Applicability guard

S1 is a protocol specification. S2–S4 describe Amazon S3 only. S5 is a dated AWS SDK for Rust maintainer announcement for the named release line. S6 is one user report against a mutable image tag. None proves behavior of the fictional gateway or the unspecified S3-compatible vendor. Notes here paraphrase bounded evidence; the sibling source-map.json holds exact source identity, locator, governing condition, access time, and applicability.
