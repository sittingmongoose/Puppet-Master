{
  "schema": "publication-source-body-repair-v1",
  "record_type": "source evidence capsule; fetched body private",
  "classification_basis": "fetched body: content signature, capture provenance and source-map binding",
  "source_urls": [
    "https://github.com/MediaArea/BWFMetaEdit/blob/318d800d92c4a3cc8a814f6fdceba0ed8b3416ec/Source/Common/Core.cpp",
    "https://raw.githubusercontent.com/MediaArea/BWFMetaEdit/318d800d92c4a3cc8a814f6fdceba0ed8b3416ec/Source/Common/Core.cpp"
  ],
  "primary_url_status": "BOUND",
  "versions_conditions_and_authored_summaries": [
    {
      "authored_source_map": "assessment/A5-01/treatment-v1/source-map.json",
      "source_id": "Core.cpp",
      "existing_authored_summary_fields": {
        "version": "v26.08",
        "version_or_commit": "v26.08 at 318d800d92c4a3cc8a814f6fdceba0ed8b3416ec",
        "governing_meaning": "Core forwards IsValid to Riff_Handler and exposes its last warning to the GUI. Static call-chain inspection supports M1; no compiled application was run.",
        "applicability": "Static public released-source evidence only; installed 26.08.1 binary behavior remains untested."
      }
    },
    {
      "authored_source_map": "assessment/A5-01/treatment-v1/evidence/supplemental-retrieval-manifest.json",
      "source_id": "Core.cpp",
      "existing_authored_summary_fields": {
        "version": "v26.08"
      }
    }
  ],
  "original_capture_selectors": [
    {
      "locator": "Lines 1573–1615"
    }
  ],
  "raw_sha256": "bf8bda2de2abc7d2f75ff4574bca24dbc733ad8c429abea3651a0f2d0ee7c5d3",
  "original_bytes": 90821,
  "private_archive_lineage": "publication-prior-code-capture-repair-v1/private/originals/assessment/A5-01/treatment-v1/evidence/release-26.08-Core.cpp",
  "evidence_coverage": "BOUNDED_EXISTING_AUTHORED_SUMMARY; omitted body coverage UNKNOWN",
  "quoted_body_words": 0,
  "omission": "Full fetched body omitted. No new source retrieval, invented summary or semantic adjudication. Missing version/selector/conditions remain UNKNOWN.",
  "byte_exact_replay": false,
  "primaryURL": [
    "https://github.com/MediaArea/BWFMetaEdit/blob/318d800d92c4a3cc8a814f6fdceba0ed8b3416ec/Source/Common/Core.cpp",
    "https://raw.githubusercontent.com/MediaArea/BWFMetaEdit/318d800d92c4a3cc8a814f6fdceba0ed8b3416ec/Source/Common/Core.cpp"
  ],
  "version": [
    {
      "version": "v26.08",
      "version_or_commit": "v26.08 at 318d800d92c4a3cc8a814f6fdceba0ed8b3416ec",
      "governing_meaning": "Core forwards IsValid to Riff_Handler and exposes its last warning to the GUI. Static call-chain inspection supports M1; no compiled application was run.",
      "applicability": "Static public released-source evidence only; installed 26.08.1 binary behavior remains untested."
    },
    {
      "version": "v26.08"
    }
  ],
  "selector": [
    {
      "locator": "Lines 1573–1615"
    }
  ],
  "conditions": [
    {
      "version": "v26.08",
      "version_or_commit": "v26.08 at 318d800d92c4a3cc8a814f6fdceba0ed8b3416ec",
      "governing_meaning": "Core forwards IsValid to Riff_Handler and exposes its last warning to the GUI. Static call-chain inspection supports M1; no compiled application was run.",
      "applicability": "Static public released-source evidence only; installed 26.08.1 binary behavior remains untested."
    }
  ],
  "rawSHA256": "bf8bda2de2abc7d2f75ff4574bca24dbc733ad8c429abea3651a0f2d0ee7c5d3",
  "publication_correction": "prior-path guard skipped this fetched external capture; mechanical policy application only"
}
