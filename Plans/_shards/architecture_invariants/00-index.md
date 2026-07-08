# Shard Index: Plans/Architecture_Invariants.md

Generated: 2026-07-08T13:17:20Z

Source SHA256: `6f883fb60e510b7c00faba9208e8a0702690c2df24d96a4294dc6f33d861634b`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L13 `40bda6a9cf4dac0eefbddde3de4a3df8037e50b48de539bcbe652e3fa7a79480`
- [002 - 0. Scope](002-0.-scope.md) L15-L24 `412fef63659ccb2301116a2c77f3257c3b256767b97784281798d81457a1d109`
- [003 - INV-001 -- Tool correlation integrity (normalized streams + persisted events)](003-inv-001-tool-correlation-integrity-normalized-streams-persisted-.md) L25-L77 `b92b1e8295a700b57ed672188f3b5401156181b86cb824474ee939c3e667ab1e`
- [004 - INV-002 -- No secrets in persistent storage](004-inv-002-no-secrets-in-persistent-storage.md) L78-L89 `26276f04a27d04775c388ce0819328c455166f091d7bf9c82d266a2f56b1073e`
- [005 - INV-003 -- UI SSOT (no bespoke UI behavior)](005-inv-003-ui-ssot-no-bespoke-ui-behavior.md) L91-L100 `a7b735ee8c2dc39452d4f2785cf9970af1804426690315cf8ee337ef540e1ee2`
- [006 - INV-004 -- UI command boundary (no business logic in UI)](006-inv-004-ui-command-boundary-no-business-logic-in-ui.md) L101-L110 `c6be76357017acc91c9d74fa42654fd81765a3697e5a51fe67e9e861a3abdac2`
- [007 - INV-005 -- Deterministic ordering from SSOT lists](007-inv-005-deterministic-ordering-from-ssot-lists.md) L111-L120 `cc3d7a4e6fcec2d0d3bd6fe10f93275a157f01645ad9c70de3ff22f0591301fc`
- [008 - INV-006 -- Providers are storage-isolated](008-inv-006-providers-are-storage-isolated.md) L121-L125 `b15b28bf45647aec0ea831a5e5604a38265fa23d0a004f720b96a961b563ffcf`
- [009 - INV-007 -- No stringly-typed IDs outside SSOT](009-inv-007-no-stringly-typed-ids-outside-ssot.md) L127-L136 `826cc4594faa239b95f81fbfff3a93bd73c7a4d4451a26d3283c52b4288280c1`
- [010 - INV-008 -- GitHub operations are API-only](010-inv-008-github-operations-are-api-only.md) L137-L146 `e2c586f63610e6127d698c3c046dddcd4c5f193d1ccd1d7d146ba33ded59e84c`
- [011 - INV-009 -- Cursor transport is invisible to consumers](011-inv-009-cursor-transport-is-invisible-to-consumers.md) L147-L156 `23abada28311262bb6b2c8726e4bde689f94c4b3d064d76a2b245d809af68c88`
- [012 - INV-010 -- Platform naming compliance](012-inv-010-platform-naming-compliance.md) L157-L167 `0d45a435abe1dd7e9af262cdd223ed26b17fabee4092a11238bbf00832bcc4e6`
- [013 - INV-011 -- UI command dispatch only (Rule 1)](013-inv-011-ui-command-dispatch-only-rule-1.md) L168-L179 `bbc933b567ea0c2a3b1815d487c6e8111b4870c2975e26d075e07ad6d976b4bd`
- [014 - INV-012 -- Wiring matrix coverage (Rule 2)](014-inv-012-wiring-matrix-coverage-rule-2.md) L180-L186 `be59346220b04e8d8f51127ebe94f4fb115c83ea2368d5d3868435a68fb5f970`
- [015 - INV-013 -- Pre-dispatch tool validation](015-inv-013-pre-dispatch-tool-validation.md) L187-L196 `1177da218fb66ea24703a89c63bcf411049a1832704b059f8b64ea7e1e0fcb42`
- [016 - INV-014 -- Shared mutable state requires RWMutex](016-inv-014-shared-mutable-state-requires-rwmutex.md) L198-L209 `76783d4e34f0c0445607a717437a4855a30f7fd99a5ee5d9fbf1e4eb079be563`
- [017 - INV-015 -- Monetary values are integer microdollars](017-inv-015-monetary-values-are-integer-microdollars.md) L210-L222 `a43063a6eade7e9e52fbadab165387d7c476a9a0bcfa502ac5ef85e8de2dab1a`
- [018 - INV-016 -- Token fields are never aggregated at storage layer](018-inv-016-token-fields-are-never-aggregated-at-storage-layer.md) L223-L234 `35c7d175e6ed89df519c0380d7d3c145ebc5b5446bc5fd97844e60a45eee4fa1`
- [019 - INV-017 -- File mutations are atomic (temp-fsync-rename)](019-inv-017-file-mutations-are-atomic-temp-fsync-rename.md) L235-L243 `fe41f3e11a0664d2ffab9bfaf0b47d3369e27a0c118f113c085406e537d7bcac`
- [020 - INV-018 -- Seglog CRC32 is mandatory](020-inv-018-seglog-crc32-is-mandatory.md) L244-L259 `73c34cb689470f8d0cc477e23bd158323d6bfb2ae46c0596727a972a336c1ce1`
- [021 - Contract-driven code generation (lightweight; DRY)](021-contract-driven-code-generation-lightweight-dry.md) L261-L268 `ab451d94ee047f5ed769115aa3d2bb64b416718c19ebb943172f8ee48de79d25`
- [022 - Validation (gated; autonomous)](022-validation-gated-autonomous.md) L270-L285 `01f598d1e6115968e740a6c2712440b06055786ef674e3d1a5d0de0adf89d7c0`
- [023 - Debug investigation invariants addendum (2026-03-23)](023-debug-investigation-invariants-addendum-2026-03-23.md) L287-L309 `07656fbcb6e920598f85e11e7cfc35042e3191ceb1c3205b0fbf0cd00fc00bb9`
- [024 - INV-019 -- Runtime identity and blocked-policy continuity](024-inv-019-runtime-identity-and-blocked-policy-continuity.md) L311-L345 `c1fb79b6576e7c9f82942feedab9f7e7c4129dcc3f5c7c0ff633b92f90b809fe`
- [025 - INV-020 -- Project-driven capability activation](025-inv-020-project-driven-capability-activation.md) L347-L359 `aa528ae7f42e588b1a4316b3586532029a17d013573ba578e5a06c831650c2b4`
- [026 - INV-021 -- Dependency-driven seam reconciliation order](026-inv-021-dependency-driven-seam-reconciliation-order.md) L361-L371 `b721272c8c8900f7fded6ef10e556e8135a9d8ea59c7953fc6c836e0c9450f1f`
- [027 - INV-022 -- Service-bound native workbench architecture](027-inv-022-service-bound-native-workbench-architecture.md) L373-L396 `660d15fa65adf855ff0ef30c500ae529bed5dc9b3758c1ca4f8212830876beed`
- [028 - INV-023 -- Investigation lifecycle budgets are typed](028-inv-023-investigation-lifecycle-budgets-are-typed.md) L398-L408 `eb3f0c03c42741b180752c20302633bb53ecf86a9ecf016a867776ebcac836e4`
- [029 - INV-024 -- Debug Mode evidence planes stay explicit](029-inv-024-debug-mode-evidence-planes-stay-explicit.md) L410-L425 `412bff88d519a067cedc349b79d3af9a37e4d341454fed54433a5df965566a25`
- [030 - INV-025 -- Provider profile isolation is not shared mutable state](030-inv-025-provider-profile-isolation-is-not-shared-mutable-state.md) L427-L434 `dd9d1c6fe4c0c03404d0ab78c3060ba193307821d9e199add08e7990183a814a`
- [031 - INV-026 -- Web/provider recovery consumers defer to owner contracts](031-inv-026-web-provider-recovery-consumers-defer-to-owner-contracts.md) L436-L445 `d2cbd959f87aee7a96420b9fad1dad31488049eaa97d625d2d22e4c7c01a0c86`
- [032 - Owner / Consumer Map](032-owner-consumer-map.md) L447-L451 `624f133154b7a3f8eb0023e4031712165622b7cd414c6bc984db74488727a643`
- [033 - PlanUnits](033-planunits.md) L453-L4424 `ce298f8ed64af4ef9f39e3f0ab05d4f998a23e90b52bd1107d672f6025753e44`
- [034 - Migration Coverage](034-migration-coverage.md) L4426-L4436 `40b453be05d8c52051394e02d1796beb5d398a5cf1ee8e2bd5b762e13241cdca`
- [035 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](035-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L4438-L4444 `ae490971c0ef0a188962baf73fb7d51d5cade74115a52b98bf2f09b02aed4a84`
