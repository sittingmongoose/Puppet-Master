{
  "schema": "publication-source-body-repair-v1",
  "record_type": "source evidence capsule; fetched body private",
  "classification_basis": "fetched body: content signature, capture provenance and source-map binding",
  "source_urls": [
    "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c",
    "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L482-L503",
    "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L555-L565",
    "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L555-L593",
    "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L634-L654",
    "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L664-L670",
    "https://raw.githubusercontent.com/curl/curl/curl-8_10_1/src/tool_operate.c"
  ],
  "primary_url_status": "BOUND",
  "versions_conditions_and_authored_summaries": [
    {
      "authored_source_map": "assessment/B-FINAL-M-01/control-v1/source-map.json",
      "source_id": "P7",
      "existing_authored_summary_fields": {
        "version": "curl-8_10_1",
        "conditions_exceptions_applicability": "Static target-tag implementation evidence, not an executed test or deployment. Default retries also cover host/proxy resolution failures; connection refusal requires opt-in. Retry-After is evaluated for selected transient HTTP responses, takes the longer of existing/header delay, and may stop retries if beyond retry-max-time."
      }
    },
    {
      "authored_source_map": "assessment/B-FINAL-M-01/control-v1/source-map.json",
      "source_id": "P7",
      "existing_authored_summary_fields": {
        "version": "curl-8_10_1"
      }
    },
    {
      "authored_source_map": "assessment/B-FINAL-M-01/control-v1/source-map.json",
      "source_id": "P7",
      "existing_authored_summary_fields": {
        "version": "curl-8_10_1"
      }
    },
    {
      "authored_source_map": "assessment/B-FINAL-M-01/control-v1/source-map.json",
      "source_id": "P7",
      "existing_authored_summary_fields": {
        "version": "curl-8_10_1"
      }
    },
    {
      "authored_source_map": "assessment/B-FINAL-M-01/control-v1/source-map.json",
      "source_id": "P7",
      "existing_authored_summary_fields": {
        "version": "curl-8_10_1"
      }
    },
    {
      "authored_source_map": "assessment/B-FINAL-M-01/control-v1/source-map.json",
      "source_id": "P7",
      "existing_authored_summary_fields": {
        "version": "curl-8_10_1"
      }
    },
    {
      "authored_source_map": "assessment/B-FINAL-M-01/control-v1/source-map.json",
      "source_id": "P7",
      "existing_authored_summary_fields": {
        "version": "curl-8_10_1"
      }
    },
    {
      "authored_source_map": "assessment/B-FINAL-M-01/control-v1/source-map.json",
      "source_id": "P7",
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
          "start_line": 482,
          "end_line": 503,
          "subject": "preserve pre-existing transfer error; post-process fail-with-body",
          "url": "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L482-L503"
        },
        {
          "start_line": 539,
          "end_line": 593,
          "subject": "retry window, DNS/timeout defaults, opt-in connection refusal and HTTP statuses",
          "url": "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L539-L593"
        },
        {
          "start_line": 617,
          "end_line": 654,
          "subject": "Retry-After uses greater delay and can suppress retry past window",
          "url": "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L617-L654"
        },
        {
          "start_line": 664,
          "end_line": 670,
          "subject": "decrement remaining retries and cap exponential delay",
          "url": "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L664-L670"
        },
        {
          "start_line": 703,
          "end_line": 705,
          "subject": "retry accounting",
          "url": "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L703-L705"
        }
      ]
    },
    {
      "start_line": 664
    },
    {
      "end_line": 670
    },
    {
      "start_line": 555
    },
    {
      "end_line": 593
    },
    {
      "start_line": 634
    },
    {
      "end_line": 654
    },
    {
      "start_line": 482
    },
    {
      "end_line": 503
    },
    {
      "start_line": 555
    },
    {
      "end_line": 565
    },
    {
      "start_line": 634
    },
    {
      "end_line": 654
    },
    {
      "start_line": 482
    },
    {
      "end_line": 503
    }
  ],
  "raw_sha256": "c93873c49643fbb87211aa0d6c50ab8799a170d3287854c1f0f5a66fdc9af1b2",
  "original_bytes": 107334,
  "private_archive_lineage": "publication-cohort4/private/originals/assessment/B-FINAL-M-01/control-v1/primary-evidence/tool_operate.c",
  "evidence_coverage": "BOUNDED_EXISTING_AUTHORED_SUMMARY; omitted body coverage UNKNOWN",
  "quoted_body_words": 0,
  "omission": "Full fetched body omitted. No new source retrieval, invented summary or semantic adjudication. Missing version/selector/conditions remain UNKNOWN.",
  "byte_exact_replay": false,
  "primaryURL": [
    "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c",
    "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L482-L503",
    "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L555-L565",
    "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L555-L593",
    "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L634-L654",
    "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L664-L670",
    "https://raw.githubusercontent.com/curl/curl/curl-8_10_1/src/tool_operate.c"
  ],
  "version": [
    {
      "version": "curl-8_10_1",
      "conditions_exceptions_applicability": "Static target-tag implementation evidence, not an executed test or deployment. Default retries also cover host/proxy resolution failures; connection refusal requires opt-in. Retry-After is evaluated for selected transient HTTP responses, takes the longer of existing/header delay, and may stop retries if beyond retry-max-time."
    },
    {
      "version": "curl-8_10_1"
    },
    {
      "version": "curl-8_10_1"
    },
    {
      "version": "curl-8_10_1"
    },
    {
      "version": "curl-8_10_1"
    },
    {
      "version": "curl-8_10_1"
    },
    {
      "version": "curl-8_10_1"
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
          "start_line": 482,
          "end_line": 503,
          "subject": "preserve pre-existing transfer error; post-process fail-with-body",
          "url": "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L482-L503"
        },
        {
          "start_line": 539,
          "end_line": 593,
          "subject": "retry window, DNS/timeout defaults, opt-in connection refusal and HTTP statuses",
          "url": "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L539-L593"
        },
        {
          "start_line": 617,
          "end_line": 654,
          "subject": "Retry-After uses greater delay and can suppress retry past window",
          "url": "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L617-L654"
        },
        {
          "start_line": 664,
          "end_line": 670,
          "subject": "decrement remaining retries and cap exponential delay",
          "url": "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L664-L670"
        },
        {
          "start_line": 703,
          "end_line": 705,
          "subject": "retry accounting",
          "url": "https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L703-L705"
        }
      ]
    },
    {
      "start_line": 664
    },
    {
      "end_line": 670
    },
    {
      "start_line": 555
    },
    {
      "end_line": 593
    },
    {
      "start_line": 634
    },
    {
      "end_line": 654
    },
    {
      "start_line": 482
    },
    {
      "end_line": 503
    },
    {
      "start_line": 555
    },
    {
      "end_line": 565
    },
    {
      "start_line": 634
    },
    {
      "end_line": 654
    },
    {
      "start_line": 482
    },
    {
      "end_line": 503
    }
  ],
  "conditions": [
    {
      "version": "curl-8_10_1",
      "conditions_exceptions_applicability": "Static target-tag implementation evidence, not an executed test or deployment. Default retries also cover host/proxy resolution failures; connection refusal requires opt-in. Retry-After is evaluated for selected transient HTTP responses, takes the longer of existing/header delay, and may stop retries if beyond retry-max-time."
    }
  ],
  "rawSHA256": "c93873c49643fbb87211aa0d6c50ab8799a170d3287854c1f0f5a66fdc9af1b2"
}
