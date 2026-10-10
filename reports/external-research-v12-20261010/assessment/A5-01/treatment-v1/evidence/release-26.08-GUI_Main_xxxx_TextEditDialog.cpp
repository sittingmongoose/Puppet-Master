{
  "schema": "publication-source-body-repair-v1",
  "record_type": "source evidence capsule; fetched body private",
  "classification_basis": "fetched body: content signature, capture provenance and source-map binding",
  "source_urls": [
    "https://github.com/MediaArea/BWFMetaEdit/blob/318d800d92c4a3cc8a814f6fdceba0ed8b3416ec/Source/GUI/Qt/GUI_Main_xxxx_TextEditDialog.cpp",
    "https://raw.githubusercontent.com/MediaArea/BWFMetaEdit/318d800d92c4a3cc8a814f6fdceba0ed8b3416ec/Source/GUI/Qt/GUI_Main_xxxx_TextEditDialog.cpp"
  ],
  "primary_url_status": "BOUND",
  "versions_conditions_and_authored_summaries": [
    {
      "authored_source_map": "assessment/A5-01/treatment-v1/source-map.json",
      "source_id": "GUI_Main_xxxx_TextEditDialog.cpp",
      "existing_authored_summary_fields": {
        "version": "v26.08",
        "version_or_commit": "v26.08 at 318d800d92c4a3cc8a814f6fdceba0ed8b3416ec",
        "governing_meaning": "The released GUI distinguishes absent format-specific validation and undo from the IsValid editing path. Text changes call IsValid and display LastWarning when no blocking error exists; acceptance can continue. This establishes relevance to entered XML, not merely file import.",
        "applicability": "Static public released-source evidence only; installed 26.08.1 binary behavior remains untested."
      }
    },
    {
      "authored_source_map": "assessment/A5-01/treatment-v1/evidence/supplemental-retrieval-manifest.json",
      "source_id": "GUI_Main_xxxx_TextEditDialog.cpp",
      "existing_authored_summary_fields": {
        "version": "v26.08"
      }
    }
  ],
  "original_capture_selectors": [
    {
      "locator": "Lines 83–88 and 112–156"
    }
  ],
  "raw_sha256": "6820925b88a89bc91e1f238985c0020893c5cce5e64df7e080e37ccc9af9a0ad",
  "original_bytes": 9517,
  "private_archive_lineage": "publication-prior-code-capture-repair-v1/private/originals/assessment/A5-01/treatment-v1/evidence/release-26.08-GUI_Main_xxxx_TextEditDialog.cpp",
  "evidence_coverage": "BOUNDED_EXISTING_AUTHORED_SUMMARY; omitted body coverage UNKNOWN",
  "quoted_body_words": 0,
  "omission": "Full fetched body omitted. No new source retrieval, invented summary or semantic adjudication. Missing version/selector/conditions remain UNKNOWN.",
  "byte_exact_replay": false,
  "primaryURL": [
    "https://github.com/MediaArea/BWFMetaEdit/blob/318d800d92c4a3cc8a814f6fdceba0ed8b3416ec/Source/GUI/Qt/GUI_Main_xxxx_TextEditDialog.cpp",
    "https://raw.githubusercontent.com/MediaArea/BWFMetaEdit/318d800d92c4a3cc8a814f6fdceba0ed8b3416ec/Source/GUI/Qt/GUI_Main_xxxx_TextEditDialog.cpp"
  ],
  "version": [
    {
      "version": "v26.08",
      "version_or_commit": "v26.08 at 318d800d92c4a3cc8a814f6fdceba0ed8b3416ec",
      "governing_meaning": "The released GUI distinguishes absent format-specific validation and undo from the IsValid editing path. Text changes call IsValid and display LastWarning when no blocking error exists; acceptance can continue. This establishes relevance to entered XML, not merely file import.",
      "applicability": "Static public released-source evidence only; installed 26.08.1 binary behavior remains untested."
    },
    {
      "version": "v26.08"
    }
  ],
  "selector": [
    {
      "locator": "Lines 83–88 and 112–156"
    }
  ],
  "conditions": [
    {
      "version": "v26.08",
      "version_or_commit": "v26.08 at 318d800d92c4a3cc8a814f6fdceba0ed8b3416ec",
      "governing_meaning": "The released GUI distinguishes absent format-specific validation and undo from the IsValid editing path. Text changes call IsValid and display LastWarning when no blocking error exists; acceptance can continue. This establishes relevance to entered XML, not merely file import.",
      "applicability": "Static public released-source evidence only; installed 26.08.1 binary behavior remains untested."
    }
  ],
  "rawSHA256": "6820925b88a89bc91e1f238985c0020893c5cce5e64df7e080e37ccc9af9a0ad",
  "publication_correction": "prior-path guard skipped this fetched external capture; mechanical policy application only"
}
