# User draft — upload recovery addition

Fixture ID: ER12-A1-01-FRESH. Authoring status: FINALIZED.
Release condition: root releases this document only after a substantive discovery handoff. It is an incomplete user plan, not an answer key. All external capability assumptions below require research.

I lean toward letting the desktop client send multipart pieces directly, with the existing gateway granting permission. A service implementing a resumable HTTP protocol is the alternative. I would like to avoid introducing a second durable server if the storage API is sufficient, but I have not established that it is.

Draft sequence: ask the gateway for a transfer identity; split the file into 16 MiB pieces; save a local JSON record with the remote identity, filename, file size, modification time, and piece numbers. Upload pieces with at most three concurrent requests. After restart, continue from the largest saved piece number; I have not addressed noncontiguous successful pieces. Call the completion operation and mark the job done. These sizes and concurrency limits are preferences, not measured optima.

I was assuming an ETag could serve as the file's integrity check. I do not know how that assumption changes for multipart uploads, encryption, or a compatible vendor. The plan also does not yet say how a lost response is distinguished from a failed operation. Please resolve those issues without silently choosing weaker integrity guarantees.

Keep the UI to progress, retry, and cancel. On cancellation I want remote temporary data removed, but the cleanup actor and retry behavior are undecided. Gateway token expiry during an upload is also undecided. A stale recovery file must never cause bytes from a changed source file to be accepted as the original upload. Do not store credentials in that recovery file.

Required final clauses U1–U6 and the brief's negative constraints remain binding. Preserve the option of a protocol service if research supports it; the initial preference is not a command to reject it. The final plan needs a minimal state sketch, one owner for each recovery/cleanup action, and an explicit compatibility boundary. It does not need executable product code.

Proposed validation, not executed: a fake transport can lose requests and acknowledgments; a toy local file can change after some pieces; a fake storage service can return a late completion result; cancellation can race completion. For each selected test, state the expected observable invariant and what a later integration test would still need to establish. Vendor compatibility and real throughput have not been tested. No current test results exist.
