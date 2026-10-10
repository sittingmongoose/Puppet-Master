{
  "schema": "publication-source-body-repair-v1",
  "record_type": "source evidence capsule; fetched body private",
  "classification_basis": "fetched body: content signature, capture provenance and source-map binding",
  "primaryURL": [
    "https://redis.io/docs/latest/commands/expire/"
  ],
  "source_urls": [
    "https://redis.io/docs/latest/commands/expire/"
  ],
  "version": [
    {
      "version_scope": "Live command reference at retrieval; target Redis Open Source 7.2; NX/XX/GT/LT condition group since 7.0.0 per page metadata",
      "conditions_exceptions": "GT/LT treat non-volatile keys as infinite TTL; non-positive timeout deletes (del event, not expired); condition options skipped -> integer 0",
      "applicability": "All quoted behavior present in 7.2-line semantics; condition options since 7.0.0 <= 7.2"
    }
  ],
  "selector": [
    {
      "locator": "Description (timeout-clearing list incl. HSET); Optional arguments (NX/XX/GT/LT); non-positive-timeout note; Appendix: Redis expires (passive/active, accuracy, absolute timestamps, replication)"
    }
  ],
  "conditions": [
    {
      "version_scope": "Live command reference at retrieval; target Redis Open Source 7.2; NX/XX/GT/LT condition group since 7.0.0 per page metadata",
      "conditions_exceptions": "GT/LT treat non-volatile keys as infinite TTL; non-positive timeout deletes (del event, not expired); condition options skipped -> integer 0",
      "applicability": "All quoted behavior present in 7.2-line semantics; condition options since 7.0.0 <= 7.2"
    }
  ],
  "versions_conditions_and_authored_summaries": [
    {
      "authored_source_map": "runs/B-APPL-G-01/treatment/stages/role/source-map.json",
      "source_id": "R1",
      "existing_authored_summary_fields": {
        "version_scope": "Live command reference at retrieval; target Redis Open Source 7.2; NX/XX/GT/LT condition group since 7.0.0 per page metadata",
        "conditions_exceptions": "GT/LT treat non-volatile keys as infinite TTL; non-positive timeout deletes (del event, not expired); condition options skipped -> integer 0",
        "applicability": "All quoted behavior present in 7.2-line semantics; condition options since 7.0.0 <= 7.2"
      }
    }
  ],
  "original_capture_selectors": [
    {
      "locator": "Description (timeout-clearing list incl. HSET); Optional arguments (NX/XX/GT/LT); non-positive-timeout note; Appendix: Redis expires (passive/active, accuracy, absolute timestamps, replication)"
    }
  ],
  "raw_sha256": "60a0e0960d811bb0550de5778d5232dbcdf22743cffc126f5ebe6c0d7adb9968",
  "rawSHA256": "60a0e0960d811bb0550de5778d5232dbcdf22743cffc126f5ebe6c0d7adb9968",
  "original_bytes": 3603,
  "private_archive_lineage": "publication-final-prep-v6/root-final-publication-001/private/originals/runs/B-APPL-G-01/treatment/stages/role/sources/R1-expire.md",
  "quoted_body_words": 0,
  "evidence_coverage": "BOUNDED_EXISTING_AUTHORED_SUMMARY; omitted body coverage UNKNOWN",
  "byte_exact_replay": false,
  "omission": "Full source/native capture private; zero new quotations, no invented summary or semantic repair."
}
