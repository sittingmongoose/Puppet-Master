# Shard Index: Plans/Architecture_Invariants.md

Generated: 2026-07-08T16:32:36Z

Source SHA256: `3f3e3b9f42434b65cdfcdfd03597ce25926979886fe66d28c06cd0f8d23a3cc3`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L13 `ad5c5f95b5ff5001179890693dd1f97997f2e833176e7e4a2ca144aae3d0889c`
- [002 - 0. Scope](002-0.-scope.md) L15-L24 `d82ac691756d4bb22485c9901bf790c832601fd69df02b9500c72ed33bdad8d7`
- [003 - INV-001 -- Tool correlation integrity (normalized streams + persisted events)](003-inv-001-tool-correlation-integrity-normalized-streams-persisted-.md) L25-L44 `48c5798f9f2a9c5250b88a03c1f5688edb21af32f5c21d6142ccbe63cb40232a`
- [004 - INV-002 -- No secrets in persistent storage](004-inv-002-no-secrets-in-persistent-storage.md) L45-L56 `5abbc59aef5d8ae1643dc762e0738ed5b4e9ae5c58fb744f3078eee14b84c31e`
- [005 - INV-003 -- UI SSOT (no bespoke UI behavior)](005-inv-003-ui-ssot-no-bespoke-ui-behavior.md) L58-L67 `20214bd71232685f71f186e2860c5420841ef623427e27a006898dacf8641e07`
- [006 - INV-004 -- UI command boundary (no business logic in UI)](006-inv-004-ui-command-boundary-no-business-logic-in-ui.md) L68-L77 `261c9f9f669b3d214a62c131f9a308e262c3df9e62d45f4844ed36c61f225bd2`
- [007 - INV-005 -- Deterministic ordering from SSOT lists](007-inv-005-deterministic-ordering-from-ssot-lists.md) L78-L87 `66fca84f97f42db2d69b2757743809229de90bbf555e1e5922a7c4ad86e2c4a2`
- [008 - INV-006 -- Providers are storage-isolated](008-inv-006-providers-are-storage-isolated.md) L88-L92 `ca1f01ac6a2c2b1dbc395cde700d8558960f15618c7ca058a4d69378f142b7e6`
- [009 - INV-007 -- No stringly-typed IDs outside SSOT](009-inv-007-no-stringly-typed-ids-outside-ssot.md) L94-L103 `ade0ae1f2334c57dd7d8cc417478c8052d348fe678c19cb0d5696b32eec40632`
- [010 - INV-008 -- GitHub operations are API-only](010-inv-008-github-operations-are-api-only.md) L104-L113 `9e96036cc491e20fe8de1130c672940cd56392506dc5f91d614080fb968970a3`
- [011 - INV-009 -- Cursor transport is invisible to consumers](011-inv-009-cursor-transport-is-invisible-to-consumers.md) L114-L123 `5ef02bbca2e45a29edb83123416848bd75151c6757aa2af9b2e8a81970c142ae`
- [012 - INV-010 -- Platform naming compliance](012-inv-010-platform-naming-compliance.md) L124-L134 `42ed441f39440514f28ff90dd65d5c0e26a378cb7d99269aa8c2525c3b2898a5`
- [013 - INV-011 -- UI command dispatch only (Rule 1)](013-inv-011-ui-command-dispatch-only-rule-1.md) L135-L146 `1e901143d3c5b731aee7b01037389895ddd89c69abd79115404bbf8d2865c66f`
- [014 - INV-012 -- Wiring matrix coverage (Rule 2)](014-inv-012-wiring-matrix-coverage-rule-2.md) L147-L153 `a61ba261237054b719c81b9a8efc91cff88b61d2ff268f3aeecaaa7355e8171f`
- [015 - INV-013 -- Pre-dispatch tool validation](015-inv-013-pre-dispatch-tool-validation.md) L154-L163 `7ca8ded95152bbf9e7c8b970ab22878f89518e0483ad70616d12af782d8308e0`
- [016 - INV-014 -- Shared mutable state requires RWMutex](016-inv-014-shared-mutable-state-requires-rwmutex.md) L165-L176 `8b3086218d018d18834fff1def55c8b11a9184ba2ecd258a380395e2d2567827`
- [017 - INV-015 -- Monetary values are integer microdollars](017-inv-015-monetary-values-are-integer-microdollars.md) L177-L189 `02b3cc3399c1ea1d5abe4390daee8396c846b53d589f6c226a48c759b2f6ef24`
- [018 - INV-016 -- Token fields are never aggregated at storage layer](018-inv-016-token-fields-are-never-aggregated-at-storage-layer.md) L190-L201 `d100b512ad4a9f6af04838effaa3a519039ab9fbb1c2a106ade59c41844ea7d4`
- [019 - INV-017 -- File mutations are atomic (temp-fsync-rename)](019-inv-017-file-mutations-are-atomic-temp-fsync-rename.md) L202-L210 `deba0bdc4494954ec740d1a10e80f352089afe143e7430098ba5e78b052110ef`
- [020 - INV-018 -- Seglog CRC32 is mandatory](020-inv-018-seglog-crc32-is-mandatory.md) L211-L226 `e8edde7766dc8d84428f1c800f1104830bcc6d28328149000e37fede7582d738`
- [021 - Contract-driven code generation (lightweight; DRY)](021-contract-driven-code-generation-lightweight-dry.md) L228-L235 `8808cf9ed5b052db171598773c32a15721dddddbf48c0f774b83d3c041bce1aa`
- [022 - Validation (gated; autonomous)](022-validation-gated-autonomous.md) L237-L252 `75ce879db56df08b95ba1b75c457e88d595b2e6156a94e0c5c5ada98208433b2`
- [023 - Debug investigation invariants addendum (2026-03-23)](023-debug-investigation-invariants-addendum-2026-03-23.md) L254-L276 `69981ef35e4a10342777f2f22c606ac33b54e65cf2a18c11d532be185bdf656e`
- [024 - INV-019 -- Runtime identity and blocked-policy continuity](024-inv-019-runtime-identity-and-blocked-policy-continuity.md) L278-L312 `474d35c6e9c302942372fb025bc27da7f705b88ce7815b68c9b9f05718ee95ae`
- [025 - INV-020 -- Project-driven capability activation](025-inv-020-project-driven-capability-activation.md) L314-L326 `c1d5ed3d51786f0a3a16be9f8525acbaa9df30c32e4441d7897153fcb52319db`
- [026 - INV-021 -- Dependency-driven seam reconciliation order](026-inv-021-dependency-driven-seam-reconciliation-order.md) L328-L338 `acfefb72f9c02eb72e5e5d165aad14e381b95f265dcb1984edb90a96cdac5c33`
- [027 - INV-022 -- Service-bound native workbench architecture](027-inv-022-service-bound-native-workbench-architecture.md) L340-L363 `4b430f5066702e1c1b2cf34078a62c07e76342fe87b26470ad428eadca356d3c`
- [028 - INV-023 -- Investigation lifecycle budgets are typed](028-inv-023-investigation-lifecycle-budgets-are-typed.md) L365-L375 `d48a0d77995ab307dfe43a9baf3be7bf87f7a8d6954c5e2e2f06297f4e619719`
- [029 - INV-024 -- Debug Mode evidence planes stay explicit](029-inv-024-debug-mode-evidence-planes-stay-explicit.md) L377-L392 `b62f81fe8054e8bc46c02d119b6ae0a7a6c1793cbe5c1c1ad22932829ea6ed42`
- [030 - INV-025 -- Provider profile isolation is not shared mutable state](030-inv-025-provider-profile-isolation-is-not-shared-mutable-state.md) L394-L401 `2a9d534236348b1b994bf95b0c6ca8336b6d9aaef25d06d4b603d36141d6aa02`
- [031 - INV-026 -- Web/provider recovery consumers defer to owner contracts](031-inv-026-web-provider-recovery-consumers-defer-to-owner-contracts.md) L403-L412 `c750c35a1c9fddbb83a6a4ba20b7899c5eb6a2b268ae54f04f86e73b41d7392c`
- [032 - Owner / Consumer Map](032-owner-consumer-map.md) L414-L418 `f0a7be4c465a70cea4e57432e0e043531f5c0432aca9266e30fec526ce81e3ad`
- [033 - PlanUnits](033-planunits.md) L420-L4391 `e11f5d6f80fd95eaf5f89762b5929c202949dd28faf747cf1620f371fafffcd1`
- [034 - Migration Coverage](034-migration-coverage.md) L4393-L4403 `0db0b9ba158d21c7eecd6ef5aa36f704c87f065a85ba85103b0c57ece1403153`
- [035 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](035-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L4405-L4411 `d05024bcbeb3a8085af98d8d440084a1f86d452cca529bf053ac009b1f5d548a`
