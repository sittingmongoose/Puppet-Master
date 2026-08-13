# Shard Index: Plans/Architecture_Invariants.md

Generated: 2026-08-13T05:45:04Z

Source SHA256: `a1488a98949bf363a0c763a51dae6dc4db5261708c7828eeca492e65f251c543`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L13 `7871175f7cd778ecc2ed3a18aab4ba9a6761c1f2c75a93ad150e1425e3895714`
- [002 - 0. Scope](002-0.-scope.md) L15-L24 `1afc5eedd44352be7eea06b313d12a7e7aaf553a707c6c2f5c4c2ab6e8e785e9`
- [003 - INV-001 -- Tool correlation integrity (normalized streams + persisted events)](003-inv-001-tool-correlation-integrity-normalized-streams-persisted-.md) L25-L44 `348affad2aaef16c772f09adcffb1880534aa0d788a8c57e43e758fa9c5d600e`
- [004 - INV-002 -- No secrets in persistent storage](004-inv-002-no-secrets-in-persistent-storage.md) L45-L56 `30f69592799c8bd7527165d60a34a4991c8a7af3d24d95483d31c0edec0ca655`
- [005 - INV-003 -- UI SSOT (no bespoke UI behavior)](005-inv-003-ui-ssot-no-bespoke-ui-behavior.md) L58-L67 `f55ec6bf919b0a8d9bb0b2ebb97d42d70a9b871158f80074bcc3fbe55c818089`
- [006 - INV-004 -- UI command boundary (no business logic in UI)](006-inv-004-ui-command-boundary-no-business-logic-in-ui.md) L68-L77 `fc82d8bd8a6087a45feda00930171bddc19dd3ade32c83f28f0e7585cfa99158`
- [007 - INV-005 -- Deterministic ordering from SSOT lists](007-inv-005-deterministic-ordering-from-ssot-lists.md) L78-L87 `973007449a94a993f1abcf67d8d92baa5fa00cb21e5fb523165754547a0c4555`
- [008 - INV-006 -- Providers are storage-isolated](008-inv-006-providers-are-storage-isolated.md) L88-L92 `91d8a7a5665a1ca4c24ffa78c3c1da91f7667560803609431ec9593d31e47c5c`
- [009 - INV-007 -- No stringly-typed IDs outside SSOT](009-inv-007-no-stringly-typed-ids-outside-ssot.md) L94-L103 `149da9466455cefa7efb6f5a78496709a61f07d4c948c7eea8bba27dac3b7736`
- [010 - INV-008 -- GitHub operations are API-only](010-inv-008-github-operations-are-api-only.md) L104-L113 `64eb3799eb518d867a3304ac472d88d1d9016ae00d7b4c87cd28a25bb43547a0`
- [011 - INV-009 -- Cursor transport is invisible to consumers](011-inv-009-cursor-transport-is-invisible-to-consumers.md) L114-L123 `23894a15c027e57b1b7545aded2f78c3fda361a6be00dd62b71f79d71a78e68d`
- [012 - INV-010 -- Platform naming compliance](012-inv-010-platform-naming-compliance.md) L124-L134 `baa683fe22ec9fbf90fa191d48c8381b17ed8cb018b39ffbcd34d91b0307bbd2`
- [013 - INV-011 -- UI command dispatch only (Rule 1)](013-inv-011-ui-command-dispatch-only-rule-1.md) L135-L146 `65d4bb81be1b9a9637abe40bdeec449c6f60ba989dceba6e3bc9694ea5f157e0`
- [014 - INV-012 -- Wiring matrix coverage (Rule 2)](014-inv-012-wiring-matrix-coverage-rule-2.md) L147-L153 `f699bcfa7cfe9b635a0483a4ecbae140cacac657dd0a7cf4df86bb4d5c4cb1b5`
- [015 - INV-013 -- Pre-dispatch tool validation](015-inv-013-pre-dispatch-tool-validation.md) L154-L163 `878a398d9049f4728268c8d5c67da9eff019c9cc9b7e7d4586332731dc04c8f6`
- [016 - INV-014 -- Shared mutable state requires RWMutex](016-inv-014-shared-mutable-state-requires-rwmutex.md) L165-L176 `63cd7bbde985557532b40a3915d01cae59982894596b6989476fc2dc524d4451`
- [017 - INV-015 -- Monetary values are integer microdollars](017-inv-015-monetary-values-are-integer-microdollars.md) L177-L189 `156ebbee22f68a6599eeac46431f289a6dadc9db024b8a6edec4b33f8f54267c`
- [018 - INV-016 -- Token fields are never aggregated at storage layer](018-inv-016-token-fields-are-never-aggregated-at-storage-layer.md) L190-L201 `c788d71a2447c4a1fc2c5f4926a7706533be14c45c34ef5fd120574692e077f0`
- [019 - INV-017 -- Durable atomic replacement and exact-replace recovery](019-inv-017-durable-atomic-replacement-and-exact-replace-recovery.md) L202-L212 `1aab8b4ad1101ea0439a1f4836a6c5d4fadd6aaf9e4aadb127336947af50e244`
- [020 - INV-018 -- Seglog frame integrity and deterministic recovery are mandatory](020-inv-018-seglog-frame-integrity-and-deterministic-recovery-are-ma.md) L213-L236 `940053073108fff91d7d854269b54d6114239618c48278445356aacbace489ae`
- [021 - Contract-driven code generation (lightweight; DRY)](021-contract-driven-code-generation-lightweight-dry.md) L238-L245 `e7e3b1715013f41b6e420d874565ecf4ef7a6efd7aa632051d7db8e4672ddc28`
- [022 - Validation (gated; autonomous)](022-validation-gated-autonomous.md) L247-L262 `b29c995215b075453b824c57749fc358333f07752c80f62d99d916783d18713a`
- [023 - Debug investigation invariants addendum (2026-03-23)](023-debug-investigation-invariants-addendum-2026-03-23.md) L264-L286 `7db2346255de8cd77b92aafdc361f0c4794241f8ba6e5823f17a4839cd4d2cbe`
- [024 - INV-019 -- Runtime identity and blocked-policy continuity](024-inv-019-runtime-identity-and-blocked-policy-continuity.md) L288-L323 `ca3aedc3885a312c2a39dad58eafccee230d5911ebcf72ffee4da6835054494b`
- [025 - INV-020 -- Project-driven capability activation](025-inv-020-project-driven-capability-activation.md) L325-L337 `87e7af2fba171b5a2957d249819932cdb8dd46f76044c1fd6b485ef5b684a4c9`
- [026 - INV-021 -- Dependency-driven seam reconciliation order](026-inv-021-dependency-driven-seam-reconciliation-order.md) L339-L349 `6f50ec72baf75c58ca474e09336d56882ccd3bf694d9fd8626194cd5ce0770c6`
- [027 - INV-022 -- Service-bound native workbench architecture](027-inv-022-service-bound-native-workbench-architecture.md) L351-L374 `5fa3022453c388bd204e7ff0b1d4dc97b16b74b7e717c35a7457e753a84257fb`
- [028 - INV-023 -- Investigation lifecycle budgets are typed](028-inv-023-investigation-lifecycle-budgets-are-typed.md) L376-L386 `e0b7563c40ab12f48bbc10e27a9b548c03506fdc8074dec1fe0f94690246bea2`
- [029 - INV-024 -- Debug Mode evidence planes stay explicit](029-inv-024-debug-mode-evidence-planes-stay-explicit.md) L388-L403 `4376fc5c709f2750002ac5c9d8567759ba2abad043ca907a50aead8d51f1ecee`
- [030 - INV-025 -- Provider profile isolation is not shared mutable state](030-inv-025-provider-profile-isolation-is-not-shared-mutable-state.md) L405-L412 `f74247ce79c2e6c65bb02a701b1be247169001748cdf269c08b9fca4bfbe7e67`
- [031 - INV-026 -- Web/provider recovery consumers defer to owner contracts](031-inv-026-web-provider-recovery-consumers-defer-to-owner-contracts.md) L414-L423 `d05dec33172d6e94f00de0c61c7885cc410f45a23c3875eff51cd1436815d7c8`
- [032 - INV-027 -- Durable-state authority, scope, replay, and recovery remain explicit](032-inv-027-durable-state-authority-scope-replay-and-recovery-remain.md) L425-L437 `52eed91635368f41e74ee2da81accada74b0df033a369b5ef8238588a2232cb0`
- [033 - Owner / Consumer Map](033-owner-consumer-map.md) L439-L443 `2bf17d293b6de58df4e9fccaea697229e2070770352f38b6fc28ed9c9306b4b4`
- [034 - PlanUnits](034-planunits.md) L445-L4530 `24c7cbad9fa8c3831ef4109a6c9b436021d7f23cd36eee324d2c0b6dd8cff19c`
- [035 - Migration Coverage](035-migration-coverage.md) L4532-L4542 `c2b86d04245f5d93b55a53167a0e5a4ce12ecf8ddc06b155ab648c4ae389cc6c`
- [036 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](036-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L4544-L4550 `11a4b40fe15ffa28ed099a1e35472b422eb6eadb6d25f168ae0d5d2cf68a4ce5`
