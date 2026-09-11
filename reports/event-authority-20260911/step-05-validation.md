# Step 5 validation

Applied seven genuine DL-039 decisions; all eight owner_response objects remain exact and the J248 decision object is wholly unchanged pending Step 9.

- Exactly 57 individual lines and mirrors, 59 census lines, and 2 exclusion lines updated. The other 264 / 469 / 92 lines remain byte-identical.
- Census: 39 registered, 253 persisted-unregistered, 54 receipt-bound holding, 12 aliases, 63 exact exclusions, 26 non-exact exclusions, 81 lexical rejects; total 528. Independent exact category sets agree.
- August2 remains registered/provisional with UNKNOWN/OWNER_REQUIRED checkpoints. Compaction retains its complete Profile B evidence and is evidence_gap_pending_step6.
- The denominator is reopened with 255 working members; freeze digest retained. No replacement seal, PNC-019, runtime, or depth closure is claimed.
- Frozen validator SHA-256 remains `bd54afffc689146753daec474d6cdbc7ac663afaf21d842aad4fcf10255112d5`. Final diagnostic has exactly four expected failures: fresh_census_denominator_not_closed, individual_dispositions_evidence_gap_blocking, individual_dispositions_provisional, registered_contract_depth_incomplete.
- Shard generation, index generation, and local shard check returned 0. No shard changes. Root approved restoring four environment/timestamp index side effects after external capture; no generated readiness changes retained.

Application stamps are siblings of owner_response because the frozen validator pins each complete owner_response object. The two August checkpoint note changes correct answer provenance only; their statuses/citations and other eleven cells are unchanged. Twenty-eight pre-existing mirrors were reconciled to their full canonical union-ledger rows, including two testing-policy evidence mirrors; the canonical evidence was not deepened.

Evidence (external path plus SHA-256):

- Final diagnostic: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-05/diagnostic/event_authority_validator_receipt.json` — `a4f94da58c4b23db59d93703ac38ca28450fffff2a4d28af77ba8b920db01085`.
- Preservation checks: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-05/preservation-checks.json` — `7af8da5ffe6b04a3957ceb0c000657065ed8bf93844ed0ac7a1beec80afd3870`.
- Independent 36-check August/compaction review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-05/independent-august-compaction-review-final.json` — `c841a7b5f4fda1645becd519f545d8b36ed8e82d2cf3da7579bfd2329382a205`.
- Generated side-effect diff: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-05/regeneration-diff.patch` — `1da91e8ededb61a95acb449859a18c8a6ea3502d4ad460756e6bbeb25d6b0d00`.

See step-05-phase1-application.json for the exact row sets, pre-application evidence archive, mirror drift, executor hashes, and regeneration logs. The Step 3 validator author remains barred from applying the seal.

Cost: one Astra implementation agent plus one Astra bounded review agent. Token and monetary usage are unavailable; no estimate is asserted.
