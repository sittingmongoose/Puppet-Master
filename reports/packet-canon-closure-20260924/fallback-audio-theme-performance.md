# D01 / PR07 / PR08 owner-spec repairs

Status: reviewed source requirements added to canonical owners. This closes the bounded prose omissions below, not their remaining typed companions, native implementation, whole-packet review, main landing or governance seal.

## Requirements retained

- **SIR-003 / D01:** all five ordered resolution branches: healthy compatible existing Installation/Connection, compatible cached PM ToolPackage, trusted supported source recipe, explicitly selected user/organization installation, exact unavailable/manual reason. A verified explicit selection is already an existing installation and cannot be displaced by cache/PATH. SIR-020 selection still acquires/authenticates nothing. Provider-first-install exception, invalid explicit BinaryLocator override failure, Off/policy/ownership/permission/provenance and all applicable approvals remain unchanged.
- **F3-405 and CV-298 / PR07:** local low-latency preview; bounded audio decode/cache with eviction; off-UI import hashing/validation; separately queued/rate-limited external test-send; notification fanout/backpressure isolated from Goal/provider event handling. Existing governor, truthful selected-asset playback, gesture, secret exclusion, receipts and permission remain authoritative. A queue admission is not delivery success or source-event completion.
- **F3-081 / PR08:** reversible preview and affected-consumer invalidation without unrelated reload; debounced theme watch; no retry loops for unchanged invalid content; lazy bounded theme/font inventory details. Required startup/selected-theme validation, warnings/last-valid state, Settings' atomic committed snapshot and font-change restart prompt remain intact. No numeric cache/debounce bound or second theme authority was invented.

## Source and evidence

Accepted source root: `/mnt/Cursor/PuppetMaster-Evidence/misc/packet-gap-closure-20260910/sources/legacy-custody/raw/PKT-05-pm-full-thread-performance-plans-pmconcept-implementation-packet-2026-08-08/PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/`.

- `source_inputs/07_demand_driven_capability_provisioning_handoff.md`, sections 4–5; SHA-256 `842ad378a7f1a0083d55080d1d258385c33d53955b82c37d0596a5f93af16e1b`.
- `source_inputs/09_optimization_settings_load_handoff.md`, section 6 notifications/sounds and themes; SHA-256 `cfcbca8ff5ad694d62de8db7784f17adea6b48d73652786c1410baf576b5a386`.

Review evidence root: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/`.

- Proposal receipt `settings_dependencies/performance-d01-pr07-pr08-receipt.json`, SHA-256 `90886b86d1655691c36fe89d8186534b0069b4696849056169737e7bb7ca3cbd`.
- Independent form-driven review `server_forge_backup/performance-d01-pr07-pr08-independent-review-001.json`, SHA-256 `edb98b1437e87a44638d92e860fd75b18a12611c5bff4dc12a40661e340390f3`: PASS, no findings.
- Actual applied-state verification `performance-d01-pr07-pr08-applied-001.json`, SHA-256 `ba6cdc692b8bb9c61785ee76e79d35e006e0abae649794c64074262cd7f1c007`: all 16 checks pass. Includes eight applied-state retention tests and 31 clause-deletion checks, exact reviewed candidates/raw sources/unchanged consumer hashes, and full-index delta against `9a8743644721c3962fff4f98c81fcae4a5a15c2a`.

Exactly SIR-003, F3-081, F3-405 and CV-298 changed semantically. All prior unit identities, fields, canonical prose, criteria and constraints remain; no unrelated index metadata or generated owner paths changed. Index: 6,720 units / 26,296 criteria. Shards: 99 documents / 2,733 shards. Index/shard/whitespace checks pass; runtime readiness remains blocked. No governance binding or baseline was refreshed.

Actual owner SHA-256: Shared Integration Runtime `fd0e31ff97d87160dde834b06d9d4d17f4bd2b36d14180e2f75498ef229c47d0`; Final GUI `67f37b6d89db7c1aba45288acbc4f9df3bb02753aca6b03c453b2dbe81fb6a4a`; Contracts `64b412d47d476cf1263a73af7bea0c2c90ab5922d86473d87eb74550b652a5ae`.

Demand/currentness and installation coalescing/waiter typed joins, plus nonpreview notification action companions, remain separate required work. Native resolver, audio, watcher/font/rendering, queue isolation and measured performance are not proved by prose or static tests. The PM planning-ledger skill kept this owner-first repair separate from companions and sealing; no ledger compile or WorkNodes were created.
