{
  "schema": "publication-source-body-repair-v1",
  "record_type": "source evidence capsule; fetched body private",
  "classification_basis": "fetched body: content signature, capture provenance and source-map binding",
  "source_urls": [
    "https://github.com/LibraryOfCongress/bagit-python/blob/v1.6.0/bagit.py",
    "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/v1.6.0/test.py"
  ],
  "primary_url_status": "BOUND",
  "versions_conditions_and_authored_summaries": [
    {
      "authored_source_map": "assessment/A8-01/control-v1/source-map.json",
      "source_id": "E06",
      "existing_authored_summary_fields": {
        "released_version_or_commit": "v1.6.0 tag commit 43fd5007115fd0e24dd701518ac6f82271006acd",
        "governing_subject_operation_default_unit_type_domain_exceptions": "Stock validation compares NFC-normalized sets and writes normalized-key lookup maps. It defines FileNormalizationConflict and build_unicode_normalized_lookup_dict, but no stock call path invokes the latter. Its only conflict-exception call is inside that unused function. The tagged regression test exercises single-name normalization, not collision rejection. make_bag writes BagIt-Version 0.97 at line 210; this historical release is not evidence of a selected BagIt 1.0 deployment. Downloaded code was not executed.",
        "applicability_assessment": "NFC normalization mitigation is supported. Normal-operation collision rejection is not: material finding M1 survives final.md:40 and reviser source-map S06. A custom explicit helper caller or another release would require separate evidence."
      }
    },
    {
      "authored_source_map": "assessment/A8-01/control-v1/source-map.json",
      "source_id": "UNKNOWN",
      "existing_authored_summary_fields": {}
    },
    {
      "authored_source_map": "assessment/A8-01/control-v1/evidence/retrieval-records.json",
      "source_id": "UNKNOWN",
      "existing_authored_summary_fields": {}
    }
  ],
  "original_capture_selectors": [
    {
      "locator": "bagit.py lines 345–398, 519–537, 625–627, 669–685, 727–761, 878–959; test.py lines 751–786"
    }
  ],
  "raw_sha256": "52a4c2c86342daf72f1a54ac10530f76a797e1032be8a563c561fcef65a32838",
  "original_bytes": 39672,
  "private_archive_lineage": "publication-prior-code-capture-repair-v1/private/originals/assessment/A8-01/control-v1/evidence/E06-v160-test.py",
  "evidence_coverage": "BOUNDED_EXISTING_AUTHORED_SUMMARY; omitted body coverage UNKNOWN",
  "quoted_body_words": 0,
  "omission": "Full fetched body omitted. No new source retrieval, invented summary or semantic adjudication. Missing version/selector/conditions remain UNKNOWN.",
  "byte_exact_replay": false,
  "primaryURL": [
    "https://github.com/LibraryOfCongress/bagit-python/blob/v1.6.0/bagit.py",
    "https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/v1.6.0/test.py"
  ],
  "version": [
    {
      "released_version_or_commit": "v1.6.0 tag commit 43fd5007115fd0e24dd701518ac6f82271006acd",
      "governing_subject_operation_default_unit_type_domain_exceptions": "Stock validation compares NFC-normalized sets and writes normalized-key lookup maps. It defines FileNormalizationConflict and build_unicode_normalized_lookup_dict, but no stock call path invokes the latter. Its only conflict-exception call is inside that unused function. The tagged regression test exercises single-name normalization, not collision rejection. make_bag writes BagIt-Version 0.97 at line 210; this historical release is not evidence of a selected BagIt 1.0 deployment. Downloaded code was not executed.",
      "applicability_assessment": "NFC normalization mitigation is supported. Normal-operation collision rejection is not: material finding M1 survives final.md:40 and reviser source-map S06. A custom explicit helper caller or another release would require separate evidence."
    }
  ],
  "selector": [
    {
      "locator": "bagit.py lines 345–398, 519–537, 625–627, 669–685, 727–761, 878–959; test.py lines 751–786"
    }
  ],
  "conditions": [
    {
      "released_version_or_commit": "v1.6.0 tag commit 43fd5007115fd0e24dd701518ac6f82271006acd",
      "governing_subject_operation_default_unit_type_domain_exceptions": "Stock validation compares NFC-normalized sets and writes normalized-key lookup maps. It defines FileNormalizationConflict and build_unicode_normalized_lookup_dict, but no stock call path invokes the latter. Its only conflict-exception call is inside that unused function. The tagged regression test exercises single-name normalization, not collision rejection. make_bag writes BagIt-Version 0.97 at line 210; this historical release is not evidence of a selected BagIt 1.0 deployment. Downloaded code was not executed.",
      "applicability_assessment": "NFC normalization mitigation is supported. Normal-operation collision rejection is not: material finding M1 survives final.md:40 and reviser source-map S06. A custom explicit helper caller or another release would require separate evidence."
    }
  ],
  "rawSHA256": "52a4c2c86342daf72f1a54ac10530f76a797e1032be8a563c561fcef65a32838",
  "publication_correction": "prior-path guard skipped this fetched external capture; mechanical policy application only"
}
