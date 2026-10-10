{
  "schema": "publication-source-body-repair-v1",
  "record_type": "source evidence capsule; fetched body private",
  "classification_basis": "fetched body: content signature, capture provenance and source-map binding",
  "source_urls": [
    "https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/fail.md",
    "https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/fail.md#L21-L35",
    "https://raw.githubusercontent.com/curl/curl/curl-8_10_1/docs/cmdline-opts/fail.md"
  ],
  "primary_url_status": "BOUND",
  "versions_conditions_and_authored_summaries": [
    {
      "authored_source_map": "assessment/B-FINAL-M-01/control-v1/source-map.json",
      "source_id": "P8",
      "existing_authored_summary_fields": {
        "version": "curl-8_10_1",
        "conditions_exceptions_applicability": "Useful alternative if body retention is unwanted; mutually exclusive with fail-with-body. Its authentication caveat cannot be blindly attributed to the distinct CLI post-processing implementation of fail-with-body."
      }
    },
    {
      "authored_source_map": "assessment/B-FINAL-M-01/control-v1/source-map.json",
      "source_id": "P8",
      "existing_authored_summary_fields": {
        "version": "curl-8_10_1"
      }
    },
    {
      "authored_source_map": "assessment/B-FINAL-M-01/control-v1/primary-evidence/retrievals.json",
      "source_id": "UNKNOWN",
      "existing_authored_summary_fields": {
        "version": "curl-8_10_1"
      }
    }
  ],
  "original_capture_selectors": [
    {
      "locators": [
        {
          "start_line": 21,
          "end_line": 35,
          "subject": "fail without body, default HTTP behavior and authentication caveat",
          "url": "https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/fail.md#L21-L35"
        }
      ]
    },
    {
      "start_line": 21
    },
    {
      "end_line": 35
    }
  ],
  "raw_sha256": "1c6ea656161a83257ad346aab0bb6e38d476e7a2785656aa3a24df501fcd0966",
  "original_bytes": 1082,
  "private_archive_lineage": "publication-cohort4/private/originals/assessment/B-FINAL-M-01/control-v1/primary-evidence/fail.md",
  "evidence_coverage": "BOUNDED_EXISTING_AUTHORED_SUMMARY; omitted body coverage UNKNOWN",
  "quoted_body_words": 0,
  "omission": "Full fetched body omitted. No new source retrieval, invented summary or semantic adjudication. Missing version/selector/conditions remain UNKNOWN.",
  "byte_exact_replay": false,
  "primaryURL": [
    "https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/fail.md",
    "https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/fail.md#L21-L35",
    "https://raw.githubusercontent.com/curl/curl/curl-8_10_1/docs/cmdline-opts/fail.md"
  ],
  "version": [
    {
      "version": "curl-8_10_1",
      "conditions_exceptions_applicability": "Useful alternative if body retention is unwanted; mutually exclusive with fail-with-body. Its authentication caveat cannot be blindly attributed to the distinct CLI post-processing implementation of fail-with-body."
    },
    {
      "version": "curl-8_10_1"
    },
    {
      "version": "curl-8_10_1"
    }
  ],
  "selector": [
    {
      "locators": [
        {
          "start_line": 21,
          "end_line": 35,
          "subject": "fail without body, default HTTP behavior and authentication caveat",
          "url": "https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/fail.md#L21-L35"
        }
      ]
    },
    {
      "start_line": 21
    },
    {
      "end_line": 35
    }
  ],
  "conditions": [
    {
      "version": "curl-8_10_1",
      "conditions_exceptions_applicability": "Useful alternative if body retention is unwanted; mutually exclusive with fail-with-body. Its authentication caveat cannot be blindly attributed to the distinct CLI post-processing implementation of fail-with-body."
    }
  ],
  "rawSHA256": "1c6ea656161a83257ad346aab0bb6e38d476e7a2785656aa3a24df501fcd0966"
}
