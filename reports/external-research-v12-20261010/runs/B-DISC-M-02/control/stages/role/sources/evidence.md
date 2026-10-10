{
  "schema": "publication-source-body-repair-v1",
  "record_type": "source evidence capsule; fetched body private",
  "classification_basis": "fetched body: content signature, capture provenance and source-map binding",
  "primaryURL": [
    "https://arxiv.org/abs/2504.02095",
    "https://borgbackup.readthedocs.io/en/latest/internals/security.html",
    "https://iacr.org/archive/eurocrypt2013/78810294/78810294.pdf",
    "https://kopia.io/docs/advanced/encryption/",
    "https://restic.readthedocs.io/en/stable/100_references.html",
    "https://restic.readthedocs.io/en/v0.18.1/design.html",
    "https://www.usenix.org/conference/atc16/technical-sessions/presentation/xia"
  ],
  "source_urls": [
    "https://arxiv.org/abs/2504.02095",
    "https://borgbackup.readthedocs.io/en/latest/internals/security.html",
    "https://iacr.org/archive/eurocrypt2013/78810294/78810294.pdf",
    "https://kopia.io/docs/advanced/encryption/",
    "https://restic.readthedocs.io/en/stable/100_references.html",
    "https://restic.readthedocs.io/en/v0.18.1/design.html",
    "https://www.usenix.org/conference/atc16/technical-sessions/presentation/xia"
  ],
  "version": [
    {
      "version": "restic documentation v0.18.1",
      "conditions_exceptions": "Specific version documents Rabin CDC parameters and 0.18.0 pack randomization; side-channel claims are scoped to its threat model.",
      "applicability": "Evidence for a concrete Rabin baseline and historical mitigation; not universal CDC behavior."
    },
    {
      "version": "restic documentation v0.19.1 stable",
      "conditions_exceptions": "Password key files can change without re-encrypting stored data; this does not imply content master-key rotation.",
      "applicability": "Illustrates distinction between credential rewrap and content-key rotation."
    },
    {
      "version": "Borg documentation 2.0.0b26.dev82 as titled at retrieval",
      "conditions_exceptions": "Beta/live documentation; stored chunk sizes are explicitly visible; exact implementation must be pinned before reuse.",
      "applicability": "Inspectable keyed-Buzhash and keyed-ID design lead."
    },
    {
      "version": "Live docs; page says last modified 2023-03-21; embedded sample buildVersion v0.3.0",
      "conditions_exceptions": "Embedded example version is not asserted to be current or a default.",
      "applicability": "Architecture lead for envelope separation and repository metadata."
    },
    {
      "version": "USENIX ATC '16 proceedings, 2016, pp. 101-114",
      "conditions_exceptions": "Throughput and ratio are reported for the paper's benchmark setup.",
      "applicability": "Primary research evidence for FastCDC tradeoff, not a device-level prediction."
    },
    {
      "version": "March 2025 author preprint, arXiv:2504.02095",
      "conditions_exceptions": "Attacks depend on specific construction, version, visibility, and known/chosen-plaintext assumptions; preprint status.",
      "applicability": "Threat-model evidence for parameter extraction and chunk-size leakage."
    },
    {
      "version": "EUROCRYPT 2013 paper",
      "conditions_exceptions": "Formal MLE constructions/security definitions are not a validation of an arbitrary product scheme.",
      "applicability": "Evidence for deterministic message-derived encryption and its deduplication purpose."
    }
  ],
  "selector": [
    {
      "locator": [
        "Backups and Deduplication",
        "Threat Model"
      ]
    },
    {
      "locator": [
        "Keys, Encryption and MAC",
        "config and masterkey descriptions"
      ]
    },
    {
      "locator": [
        "Stored chunk sizes",
        "buzhash and buzhash64",
        "Secret key usage against fingerprinting"
      ]
    },
    {
      "locator": [
        "format blob",
        "encryptedBlockFormat",
        "ContentFormat struct"
      ]
    },
    {
      "locator": [
        "abstract",
        "paper summary"
      ]
    },
    {
      "locator": [
        "abstract",
        "sections 1, 2.1-2.2, 3.2-3.3, 5.1-5.2"
      ]
    },
    {
      "locator": [
        "sections 1.1-1.2"
      ]
    }
  ],
  "conditions": [
    {
      "version": "restic documentation v0.18.1",
      "conditions_exceptions": "Specific version documents Rabin CDC parameters and 0.18.0 pack randomization; side-channel claims are scoped to its threat model.",
      "applicability": "Evidence for a concrete Rabin baseline and historical mitigation; not universal CDC behavior."
    },
    {
      "version": "restic documentation v0.19.1 stable",
      "conditions_exceptions": "Password key files can change without re-encrypting stored data; this does not imply content master-key rotation.",
      "applicability": "Illustrates distinction between credential rewrap and content-key rotation."
    },
    {
      "version": "Borg documentation 2.0.0b26.dev82 as titled at retrieval",
      "conditions_exceptions": "Beta/live documentation; stored chunk sizes are explicitly visible; exact implementation must be pinned before reuse.",
      "applicability": "Inspectable keyed-Buzhash and keyed-ID design lead."
    },
    {
      "version": "Live docs; page says last modified 2023-03-21; embedded sample buildVersion v0.3.0",
      "conditions_exceptions": "Embedded example version is not asserted to be current or a default.",
      "applicability": "Architecture lead for envelope separation and repository metadata."
    },
    {
      "version": "USENIX ATC '16 proceedings, 2016, pp. 101-114",
      "conditions_exceptions": "Throughput and ratio are reported for the paper's benchmark setup.",
      "applicability": "Primary research evidence for FastCDC tradeoff, not a device-level prediction."
    },
    {
      "version": "March 2025 author preprint, arXiv:2504.02095",
      "conditions_exceptions": "Attacks depend on specific construction, version, visibility, and known/chosen-plaintext assumptions; preprint status.",
      "applicability": "Threat-model evidence for parameter extraction and chunk-size leakage."
    },
    {
      "version": "EUROCRYPT 2013 paper",
      "conditions_exceptions": "Formal MLE constructions/security definitions are not a validation of an arbitrary product scheme.",
      "applicability": "Evidence for deterministic message-derived encryption and its deduplication purpose."
    }
  ],
  "versions_conditions_and_authored_summaries": [
    {
      "authored_source_map": "runs/B-DISC-M-02/control/stages/role/source-map.json",
      "source_id": "restic_design_0_18_1",
      "existing_authored_summary_fields": {
        "version": "restic documentation v0.18.1",
        "conditions_exceptions": "Specific version documents Rabin CDC parameters and 0.18.0 pack randomization; side-channel claims are scoped to its threat model.",
        "applicability": "Evidence for a concrete Rabin baseline and historical mitigation; not universal CDC behavior."
      }
    },
    {
      "authored_source_map": "runs/B-DISC-M-02/control/stages/role/source-map.json",
      "source_id": "restic_references_0_19_1",
      "existing_authored_summary_fields": {
        "version": "restic documentation v0.19.1 stable",
        "conditions_exceptions": "Password key files can change without re-encrypting stored data; this does not imply content master-key rotation.",
        "applicability": "Illustrates distinction between credential rewrap and content-key rotation."
      }
    },
    {
      "authored_source_map": "runs/B-DISC-M-02/control/stages/role/source-map.json",
      "source_id": "borg_security_2_0_beta",
      "existing_authored_summary_fields": {
        "version": "Borg documentation 2.0.0b26.dev82 as titled at retrieval",
        "conditions_exceptions": "Beta/live documentation; stored chunk sizes are explicitly visible; exact implementation must be pinned before reuse.",
        "applicability": "Inspectable keyed-Buzhash and keyed-ID design lead."
      }
    },
    {
      "authored_source_map": "runs/B-DISC-M-02/control/stages/role/source-map.json",
      "source_id": "kopia_encryption_docs",
      "existing_authored_summary_fields": {
        "version": "Live docs; page says last modified 2023-03-21; embedded sample buildVersion v0.3.0",
        "conditions_exceptions": "Embedded example version is not asserted to be current or a default.",
        "applicability": "Architecture lead for envelope separation and repository metadata."
      }
    },
    {
      "authored_source_map": "runs/B-DISC-M-02/control/stages/role/source-map.json",
      "source_id": "fastcdc_usenix_2016",
      "existing_authored_summary_fields": {
        "version": "USENIX ATC '16 proceedings, 2016, pp. 101-114",
        "conditions_exceptions": "Throughput and ratio are reported for the paper's benchmark setup.",
        "applicability": "Primary research evidence for FastCDC tradeoff, not a device-level prediction."
      }
    },
    {
      "authored_source_map": "runs/B-DISC-M-02/control/stages/role/source-map.json",
      "source_id": "cdc_attacks_preprint_2025",
      "existing_authored_summary_fields": {
        "version": "March 2025 author preprint, arXiv:2504.02095",
        "conditions_exceptions": "Attacks depend on specific construction, version, visibility, and known/chosen-plaintext assumptions; preprint status.",
        "applicability": "Threat-model evidence for parameter extraction and chunk-size leakage."
      }
    },
    {
      "authored_source_map": "runs/B-DISC-M-02/control/stages/role/source-map.json",
      "source_id": "mle_eurocrypt_2013",
      "existing_authored_summary_fields": {
        "version": "EUROCRYPT 2013 paper",
        "conditions_exceptions": "Formal MLE constructions/security definitions are not a validation of an arbitrary product scheme.",
        "applicability": "Evidence for deterministic message-derived encryption and its deduplication purpose."
      }
    }
  ],
  "original_capture_selectors": [
    {
      "locator": [
        "Backups and Deduplication",
        "Threat Model"
      ]
    },
    {
      "locator": [
        "Keys, Encryption and MAC",
        "config and masterkey descriptions"
      ]
    },
    {
      "locator": [
        "Stored chunk sizes",
        "buzhash and buzhash64",
        "Secret key usage against fingerprinting"
      ]
    },
    {
      "locator": [
        "format blob",
        "encryptedBlockFormat",
        "ContentFormat struct"
      ]
    },
    {
      "locator": [
        "abstract",
        "paper summary"
      ]
    },
    {
      "locator": [
        "abstract",
        "sections 1, 2.1-2.2, 3.2-3.3, 5.1-5.2"
      ]
    },
    {
      "locator": [
        "sections 1.1-1.2"
      ]
    }
  ],
  "raw_sha256": "a25e2634d921bcafad3a7e3780a20e9d34603383f5985765a7cc460ec5938757",
  "rawSHA256": "a25e2634d921bcafad3a7e3780a20e9d34603383f5985765a7cc460ec5938757",
  "original_bytes": 4788,
  "private_archive_lineage": "publication-final-prep-v6/root-final-publication-001/private/originals/runs/B-DISC-M-02/control/stages/role/sources/evidence.md",
  "quoted_body_words": 0,
  "evidence_coverage": "BOUNDED_EXISTING_AUTHORED_SUMMARY; omitted body coverage UNKNOWN",
  "byte_exact_replay": false,
  "omission": "Full source/native capture private; zero new quotations, no invented summary or semantic repair."
}
