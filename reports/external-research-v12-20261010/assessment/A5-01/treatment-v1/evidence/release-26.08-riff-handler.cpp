{
  "schema": "publication-source-body-repair-v1",
  "record_type": "source evidence capsule; fetched body private",
  "classification_basis": "fetched body: content signature, capture provenance and source-map binding",
  "source_urls": [
    "https://github.com/MediaArea/BWFMetaEdit/blob/318d800d92c4a3cc8a814f6fdceba0ed8b3416ec/Source/Riff/Riff_Handler.cpp",
    "https://raw.githubusercontent.com/MediaArea/BWFMetaEdit/318d800d92c4a3cc8a814f6fdceba0ed8b3416ec/Source/Riff/Riff_Handler.cpp"
  ],
  "primary_url_status": "BOUND",
  "versions_conditions_and_authored_summaries": [
    {
      "authored_source_map": "assessment/A5-01/treatment-v1/source-map.json",
      "source_id": "release-26.08-riff-handler.cpp",
      "existing_authored_summary_fields": {
        "version_or_commit": "v26.08 at 318d800d92c4a3cc8a814f6fdceba0ed8b3416ec",
        "governing_meaning": "For nonempty axml/ixml/xmp, the released handler invokes TinyXML2 parsing and records a syntax warning on failure. A warning alone does not turn IsValid false; errors do. This is static code evidence of a verification/warning path, not schema validation or guaranteed refusal to save malformed XML.",
        "applicability": "Static public released-source evidence only; installed 26.08.1 binary behavior remains untested."
      }
    },
    {
      "authored_source_map": "assessment/A5-01/treatment-v1/evidence/supplemental-retrieval-manifest.json",
      "source_id": "release-26.08-riff-handler.cpp",
      "existing_authored_summary_fields": {}
    }
  ],
  "original_capture_selectors": [
    {
      "locator": "Lines 1959–1984, 2927–2932 and 3205–3211"
    }
  ],
  "raw_sha256": "b610951194f7100931c14bf834f38147a75b27924848d772cc3209249dea6af4",
  "original_bytes": 184884,
  "private_archive_lineage": "publication-prior-code-capture-repair-v1/private/originals/assessment/A5-01/treatment-v1/evidence/release-26.08-riff-handler.cpp",
  "evidence_coverage": "BOUNDED_EXISTING_AUTHORED_SUMMARY; omitted body coverage UNKNOWN",
  "quoted_body_words": 0,
  "omission": "Full fetched body omitted. No new source retrieval, invented summary or semantic adjudication. Missing version/selector/conditions remain UNKNOWN.",
  "byte_exact_replay": false,
  "primaryURL": [
    "https://github.com/MediaArea/BWFMetaEdit/blob/318d800d92c4a3cc8a814f6fdceba0ed8b3416ec/Source/Riff/Riff_Handler.cpp",
    "https://raw.githubusercontent.com/MediaArea/BWFMetaEdit/318d800d92c4a3cc8a814f6fdceba0ed8b3416ec/Source/Riff/Riff_Handler.cpp"
  ],
  "version": [
    {
      "version_or_commit": "v26.08 at 318d800d92c4a3cc8a814f6fdceba0ed8b3416ec",
      "governing_meaning": "For nonempty axml/ixml/xmp, the released handler invokes TinyXML2 parsing and records a syntax warning on failure. A warning alone does not turn IsValid false; errors do. This is static code evidence of a verification/warning path, not schema validation or guaranteed refusal to save malformed XML.",
      "applicability": "Static public released-source evidence only; installed 26.08.1 binary behavior remains untested."
    }
  ],
  "selector": [
    {
      "locator": "Lines 1959–1984, 2927–2932 and 3205–3211"
    }
  ],
  "conditions": [
    {
      "version_or_commit": "v26.08 at 318d800d92c4a3cc8a814f6fdceba0ed8b3416ec",
      "governing_meaning": "For nonempty axml/ixml/xmp, the released handler invokes TinyXML2 parsing and records a syntax warning on failure. A warning alone does not turn IsValid false; errors do. This is static code evidence of a verification/warning path, not schema validation or guaranteed refusal to save malformed XML.",
      "applicability": "Static public released-source evidence only; installed 26.08.1 binary behavior remains untested."
    }
  ],
  "rawSHA256": "b610951194f7100931c14bf834f38147a75b27924848d772cc3209249dea6af4",
  "publication_correction": "prior-path guard skipped this fetched external capture; mechanical policy application only"
}
