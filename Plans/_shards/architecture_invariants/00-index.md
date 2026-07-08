# Shard Index: Plans/Architecture_Invariants.md

Generated: 2026-07-08T01:27:17Z

Source SHA256: `13ae96c59ca1c16416a77b1d9bac8c759d67536df3d0c4f1e332ad5763e83785`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L13 `b401055ac3bb965fe08a1f7e68ef8956c3e53c0f261d8079e03f4b8e66a85cad`
- [002 - 0. Scope](002-0.-scope.md) L15-L24 `40157272ae4358773366fec2dfc9c76c3bcb606a4774e8c836e5bea3f375e35b`
- [003 - INV-001 -- Tool correlation integrity (normalized streams + persisted events)](003-inv-001-tool-correlation-integrity-normalized-streams-persisted-.md) L25-L77 `bba3c7afb65608a9bdc1fb6380fd3ad33c969d40f794ea6de731300b8dc77dc7`
- [004 - INV-002 -- No secrets in persistent storage](004-inv-002-no-secrets-in-persistent-storage.md) L78-L89 `30a7b220643f8491a8f8bf91560dfc10d43fada9f996e91f3f0df526af424290`
- [005 - INV-003 -- UI SSOT (no bespoke UI behavior)](005-inv-003-ui-ssot-no-bespoke-ui-behavior.md) L91-L100 `74d8a1e47458dd3b4b5ea9962e73dad2ec0c71cf13635188276f9f09b293539a`
- [006 - INV-004 -- UI command boundary (no business logic in UI)](006-inv-004-ui-command-boundary-no-business-logic-in-ui.md) L101-L110 `9ad13e55c0d2d64c60fed4027f02f8b6b36a4d2b01f07a9694b67fe38efc9046`
- [007 - INV-005 -- Deterministic ordering from SSOT lists](007-inv-005-deterministic-ordering-from-ssot-lists.md) L111-L120 `400066d3c9dbc331318f26ae7a43814df14b9187a975241c67811b93b44e2a5a`
- [008 - INV-006 -- Providers are storage-isolated](008-inv-006-providers-are-storage-isolated.md) L121-L125 `5bfba0493656a1e6039ee8b50b660be5638fb6d841b14f6c898e8718ba5ad0a6`
- [009 - INV-007 -- No stringly-typed IDs outside SSOT](009-inv-007-no-stringly-typed-ids-outside-ssot.md) L127-L136 `f9f3f409ddc1c2a3d50daff7b1cbc149fb331ca5f3f936deb9a4f0366a6cc54d`
- [010 - INV-008 -- GitHub operations are API-only](010-inv-008-github-operations-are-api-only.md) L137-L146 `9c1f4c4ea13cd6ae91a3b1a099b4ef7af8b30d5f02235ccd63771b298692e175`
- [011 - INV-009 -- Cursor transport is invisible to consumers](011-inv-009-cursor-transport-is-invisible-to-consumers.md) L147-L156 `8aa65bb0472339c03bcd35b5e45f8c9a8544b01f9edf14baef111204178092ed`
- [012 - INV-010 -- Platform naming compliance](012-inv-010-platform-naming-compliance.md) L157-L167 `1cd45c803f462cc13593709a171f1ec78b655fb8e9ca72f7df358f6964b72849`
- [013 - INV-011 -- UI command dispatch only (Rule 1)](013-inv-011-ui-command-dispatch-only-rule-1.md) L168-L179 `da2e2c51c8f75b38888b5d0052fb79caee385b84f9316aafb154c8da225bccd5`
- [014 - INV-012 -- Wiring matrix coverage (Rule 2)](014-inv-012-wiring-matrix-coverage-rule-2.md) L180-L186 `fd9be19afb226fd9b1a77ed7dbd125a5610d273056d65c896b9d54006e071d32`
- [015 - INV-013 -- Pre-dispatch tool validation](015-inv-013-pre-dispatch-tool-validation.md) L187-L196 `918a855ad4beb71bf1089846d4d024f1311668539e10d0048ac2e30fa86749d9`
- [016 - INV-014 -- Shared mutable state requires RWMutex](016-inv-014-shared-mutable-state-requires-rwmutex.md) L198-L209 `6da4927cd52ce880e6707d385df9cc410c15a5f68b7cf476f108af0713f8c867`
- [017 - INV-015 -- Monetary values are integer microdollars](017-inv-015-monetary-values-are-integer-microdollars.md) L210-L222 `614852cc95c7047c4be03ae84fca43caeeee8ddfec09e6aeb6e52e02b1d589b3`
- [018 - INV-016 -- Token fields are never aggregated at storage layer](018-inv-016-token-fields-are-never-aggregated-at-storage-layer.md) L223-L234 `23b29d4e4a222e6b3a1c1845bb05873d55ab2acb082680a22094068705adccac`
- [019 - INV-017 -- File mutations are atomic (temp-fsync-rename)](019-inv-017-file-mutations-are-atomic-temp-fsync-rename.md) L235-L243 `dee3bcf3c081a78ac98244a1eaa600b56cad73487136bb7488955bde8c88b537`
- [020 - INV-018 -- Seglog CRC32 is mandatory](020-inv-018-seglog-crc32-is-mandatory.md) L244-L259 `e3b391ac7532995e0cb41273b46d71997d17d9604e288c946aa05292e44b3de9`
- [021 - Contract-driven code generation (lightweight; DRY)](021-contract-driven-code-generation-lightweight-dry.md) L261-L268 `bd68f5ed5c7f707049a2327b643c7b111bbee96f66ad22d2ef9de2f8586e3724`
- [022 - Validation (gated; autonomous)](022-validation-gated-autonomous.md) L270-L285 `d07c643b37582e57fa376edbe64cffb8b48959a896a84f73f1605a357384242a`
- [023 - Debug investigation invariants addendum (2026-03-23)](023-debug-investigation-invariants-addendum-2026-03-23.md) L287-L309 `47260541514d5483c94522b2553d8da700de39b86e799d154d90e134a365efac`
- [024 - INV-019 -- Runtime identity and blocked-policy continuity](024-inv-019-runtime-identity-and-blocked-policy-continuity.md) L311-L345 `99e46032eac705adf85d414d79302dbb000d823a3855dc44d3be116139f83b8f`
- [025 - INV-020 -- Project-driven capability activation](025-inv-020-project-driven-capability-activation.md) L347-L359 `efbbd1a30688ea9299bdd0a1244409f0dd9672f1f315b2365417512307662edf`
- [026 - INV-021 -- Dependency-driven seam reconciliation order](026-inv-021-dependency-driven-seam-reconciliation-order.md) L361-L371 `6f5d0a78be1361915e96d584f3f7fb43542062f6c25bc15affab098d1182e224`
- [027 - INV-022 -- Service-bound native workbench architecture](027-inv-022-service-bound-native-workbench-architecture.md) L373-L396 `3fdfedbd436f94d673b49f2ffa12a3023f9ae8fca1f1f592d7efcfc1832aef07`
- [028 - INV-023 -- Investigation lifecycle budgets are typed](028-inv-023-investigation-lifecycle-budgets-are-typed.md) L398-L408 `62e0045929cb612e2c4b9fabe4fb052b19002543c3818e40a24b89f34a967273`
- [029 - INV-024 -- Debug Mode evidence planes stay explicit](029-inv-024-debug-mode-evidence-planes-stay-explicit.md) L410-L425 `7419851d08eb7a028c0baa56ab8fcd65fc0ba216c60e541d33b41f535b46c3eb`
- [030 - INV-025 -- Provider profile isolation is not shared mutable state](030-inv-025-provider-profile-isolation-is-not-shared-mutable-state.md) L427-L434 `bc9e514267011952bd15ea50836abdf2983809f87d69de12bf5007a8ba8cd2d3`
- [031 - INV-026 -- Web/provider recovery consumers defer to owner contracts](031-inv-026-web-provider-recovery-consumers-defer-to-owner-contracts.md) L436-L445 `4e1b5c717d01f438312e2c0525aa042dda1af81d3d63d9a159cecbc3a79212a0`
- [032 - Owner / Consumer Map](032-owner-consumer-map.md) L447-L451 `17e3217ce8ba109f0f306a01c0d3647f0c1802c6eb0ce55190c668b5e74df194`
- [033 - PlanUnits](033-planunits.md) L453-L4424 `edb43f90976340b164097d762a1358f8bc05c46aabdce46d4dacceba7daa73e3`
- [034 - Migration Coverage](034-migration-coverage.md) L4426-L4438 `954deb95e29fbfa958bb3a2ee131a09a415e4a133168844c22a7c30f20939f27`
- [035 - FABLE Remaining Action Plan Repair Notes (2026-07-08)](035-fable-remaining-action-plan-repair-notes-2026-07-08.md) L4439-L4447 `c646efaba269d87c765297285612a4a640037619fefbce2ff736b8364523fd51`
