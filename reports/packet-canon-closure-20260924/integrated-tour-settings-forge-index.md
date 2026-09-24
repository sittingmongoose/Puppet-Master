# Integrated Tour, Settings and Forge repairs

Integrated commits: `c3b0a1f13f75a8aab37c9c3738b6cf579ebbd131` (current Tour focus return), `3d6144b3709a5c621f3fb550b2074ee88a114b98` (Settings copy defaults and compact notices), `dfdcb0154d9733891883a5fdcd27e9ca1245804b` (report provenance), and `d8f25364b5b0365f6b1e1cf06a9ab9e6466cdd69` (Forge alias result pointers).

The combined 120 focused/adjacent tests pass; shard verification passes for 99 documents / 2,721 shards. Initial index validation identified exactly one stale artifact: `Plans/.plan_index/node_readiness_report.json`. A read-only in-memory generation comparison inspected every generated index, excluding generated timestamps. Its full stable delta adds exactly one diagnostic, `event_authority_currentness_source_drift` on `Plans/guided_tour_contracts.schema.json`, to the existing lifecycle certification failures. It removes none. No owner unit, acceptance unit, dependency or coverage content changes.

Full preview evidence: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/integrated-index-delta-before-regeneration.json`, SHA-256 `992d87b9037add3c70f71fd3d42956fbb36f2c08039752f0f7fe8297a092ec9b`.

After `python3 scripts/pm-plan-index.py generate`, the actual diff matches that preview plus four generated timestamps. `python3 scripts/pm-plan-index.py validate` passes: 6,719 PlanUnits, 26,220 acceptance units, coverage pass. Readiness remains `blocked_runtime_certification_incomplete`; no WorkNodes or NodeSeed candidates are created.

This is derived-index consistency, not a governance reseal, aggregate landing proof or main landing. Governance bindings and the landing baseline are unchanged. The Guided Tour schema is outside the previously authorized three-file hash-drift exception; this report does not extend that exception. The designated governance owner still needs to reseal affected sources. Full packet semantic closure, checkpoint persistence, native/runtime and GUI acceptance remain open.

The repository PM planning skill constrains this to non-executable index/readiness metadata; it does not confer governance-seal authority.
