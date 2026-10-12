# D-P08 — Provisional design for review

The provisional index maps an attachment digest to extracted chunks and associates each chunk with a note ID and a location hint. Renaming a file would update its display label without re-extraction. Replacing its bytes would enqueue a new job while old chunks remain available with a pending badge. Investigate whether these identities cover duplicate attachments, note movement, extractor-version changes, and stale results during failed replacement.

Text PDFs and slide exports would use direct extraction where possible; scanned pages would use recognition, and audio would use supplied transcripts only. All chunks would enter the same text index, with a source-type field used for a small badge. Location hints would be page numbers or transcript offsets. Compare provenance representations and retrieval approaches, checking whether a badge and offset convey the requested uncertainty and open-original behavior.

Background work would be limited to one extraction per workspace. Cancelled jobs would leave the previous index unchanged, and deletion would remove chunks by note ID. The draft assumes this is a safe freshness rule and prevents dangling content; inspect ownership when attachments are shared across notes or a job completes after deletion.

Return evidence-backed dispositions for identity, extraction scope, provenance, freshness, deletion, and bounded scheduling. Propose checks for mixed writing systems, replacement after failed extraction, shared attachments, approximate locations, cancellation, and delayed completion after deletion. Label any executed public-fixture checks and their exact coverage, without claiming measured accuracy on the user's unknown corpus.

Complete all substantive research and planning obligations within a maximum of 60 elapsed minutes. Finish earlier when the complete output is ready. There is no minimum research duration, no requirement to consume the allowance, and no credit for waiting. The deadline includes arm-specific setup, provider queueing after admission, tools, native retries, handoffs, revision and delivery. Output quality is assessed independently of elapsed time.
