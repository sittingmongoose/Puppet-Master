{
  "schema": "publication-source-body-repair-v1",
  "record_type": "source evidence capsule; fetched body private",
  "classification_basis": "fetched body: content signature, capture provenance and source-map binding",
  "primaryURL": [
    "https://download.samba.org/pub/rsync/rsync.1"
  ],
  "source_urls": [
    "https://download.samba.org/pub/rsync/rsync.1"
  ],
  "version": [
    {
      "version": "Live upstream manual, unpinned; target both peers are rsync 3.2.7 per the assignment, but deployed versions are unverified.",
      "conditions_and_exceptions": [
        "Deletion is limited to synchronized receiving-side directories and requires recursive or directory transfer.",
        "Ordinary excludes protect receiver matches unless --delete-excluded or sender-only rule modifiers alter that behavior.",
        "A root-anchored filter assumes local-notes is at the effective transfer root and no later rule overrides it.",
        "Dry-run/itemized output may diverge after external source/destination changes or system-call failures.",
        "The live page is unpinned; exact 3.2.7 behavior and peer versions need endpoint verification.",
        "Sender-side I/O errors normally disable deletion unless --ignore-errors is enabled; this safeguard is not rollback."
      ]
    }
  ],
  "selector": [
    {
      "locators": [
        "USAGE: trailing source slash and directory contents",
        "--delete: receiving-side scope and exclude behavior",
        "--delete-excluded: effect on default filter rules",
        "--dry-run: no-change preview and output caveat",
        "FILTER RULES WHEN DELETING",
        "FILTER RULES IN DEPTH and PATTERN MATCHING RULES",
        "--delay-updates: delayed per-file rename behavior"
      ]
    }
  ],
  "conditions": [
    {
      "version": "Live upstream manual, unpinned; target both peers are rsync 3.2.7 per the assignment, but deployed versions are unverified.",
      "conditions_and_exceptions": [
        "Deletion is limited to synchronized receiving-side directories and requires recursive or directory transfer.",
        "Ordinary excludes protect receiver matches unless --delete-excluded or sender-only rule modifiers alter that behavior.",
        "A root-anchored filter assumes local-notes is at the effective transfer root and no later rule overrides it.",
        "Dry-run/itemized output may diverge after external source/destination changes or system-call failures.",
        "The live page is unpinned; exact 3.2.7 behavior and peer versions need endpoint verification.",
        "Sender-side I/O errors normally disable deletion unless --ignore-errors is enabled; this safeguard is not rollback."
      ]
    }
  ],
  "versions_conditions_and_authored_summaries": [
    {
      "authored_source_map": "runs/B-FINAL-G-01/control/stages/role/source-map.json",
      "source_id": "S1",
      "existing_authored_summary_fields": {
        "version": "Live upstream manual, unpinned; target both peers are rsync 3.2.7 per the assignment, but deployed versions are unverified.",
        "conditions_and_exceptions": [
          "Deletion is limited to synchronized receiving-side directories and requires recursive or directory transfer.",
          "Ordinary excludes protect receiver matches unless --delete-excluded or sender-only rule modifiers alter that behavior.",
          "A root-anchored filter assumes local-notes is at the effective transfer root and no later rule overrides it.",
          "Dry-run/itemized output may diverge after external source/destination changes or system-call failures.",
          "The live page is unpinned; exact 3.2.7 behavior and peer versions need endpoint verification.",
          "Sender-side I/O errors normally disable deletion unless --ignore-errors is enabled; this safeguard is not rollback."
        ]
      }
    }
  ],
  "original_capture_selectors": [
    {
      "locators": [
        "USAGE: trailing source slash and directory contents",
        "--delete: receiving-side scope and exclude behavior",
        "--delete-excluded: effect on default filter rules",
        "--dry-run: no-change preview and output caveat",
        "FILTER RULES WHEN DELETING",
        "FILTER RULES IN DEPTH and PATTERN MATCHING RULES",
        "--delay-updates: delayed per-file rename behavior"
      ]
    }
  ],
  "raw_sha256": "b35c190453f8f628a14f9a8bae5f0bd0f95d505d27d7972afcd4c2fd6e2ebbb1",
  "rawSHA256": "b35c190453f8f628a14f9a8bae5f0bd0f95d505d27d7972afcd4c2fd6e2ebbb1",
  "original_bytes": 3247,
  "private_archive_lineage": "publication-final-prep-v6/root-final-publication-001/private/originals/runs/B-FINAL-G-01/control/stages/role/sources/S1-primary-evidence.md",
  "quoted_body_words": 0,
  "evidence_coverage": "BOUNDED_EXISTING_AUTHORED_SUMMARY; omitted body coverage UNKNOWN",
  "byte_exact_replay": false,
  "omission": "Full source/native capture private; zero new quotations, no invented summary or semantic repair."
}
