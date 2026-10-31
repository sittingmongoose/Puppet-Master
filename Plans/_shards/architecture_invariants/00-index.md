# Shard Index: Plans/Architecture_Invariants.md

Generated: 2026-10-31T20:35:29Z

Source SHA256: `822393a6f0344b214af8956dad4c888e8996f4676b530cdab4e83b2fdb16dada`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L13 `10cbdf2e3861942c0dbce287921dd63b749515172cd7ff387c377e3b9edf8fa1`
- [002 - 0. Scope](002-0.-scope.md) L15-L24 `02a5d83ef4762547329fe518c4eee40b2f8a0735e11145483f740d97e905326e`
- [003 - INV-001 -- Tool correlation integrity (normalized streams + persisted events)](003-inv-001-tool-correlation-integrity-normalized-streams-persisted-.md) L25-L44 `f7b35242471071609c686e0560c6bf08d05e7c7d7bbbae28e3f1806bab4c4a84`
- [004 - INV-002 -- No secrets in persistent storage](004-inv-002-no-secrets-in-persistent-storage.md) L45-L56 `d223ee8a0d19a6438484fbb64fb63cac4039a3514ac90dfd37d7074b5118d1db`
- [005 - INV-003 -- UI SSOT (no bespoke UI behavior)](005-inv-003-ui-ssot-no-bespoke-ui-behavior.md) L58-L67 `e414834b928d2102bda4d7e504d7741457b8fb29543986c4e6a0a2a377cff98f`
- [006 - INV-004 -- UI command boundary (no business logic in UI)](006-inv-004-ui-command-boundary-no-business-logic-in-ui.md) L68-L77 `aecbeb3a0f0091b2cc12fb3ebfb68a85a7d6b04ceee24270e9154634f324d507`
- [007 - INV-005 -- Deterministic ordering from SSOT lists](007-inv-005-deterministic-ordering-from-ssot-lists.md) L78-L87 `626ccd1449a6f061803712d988daf042374e11d2fad3ccf70c215e3863878e61`
- [008 - INV-006 -- Providers are storage-isolated](008-inv-006-providers-are-storage-isolated.md) L88-L92 `10cc551038f1ca19d304f39dfd75d510a5dbf3c4b05e62f37b020f3cd794d1c2`
- [009 - INV-007 -- No stringly-typed IDs outside SSOT](009-inv-007-no-stringly-typed-ids-outside-ssot.md) L94-L103 `aacab74d2958cd1190b9909b8a0e46ebd4b4ec3d312f4953637e694795f72a25`
- [010 - INV-008 -- GitHub operations are API-only](010-inv-008-github-operations-are-api-only.md) L104-L113 `b15e00d8ce4dbc376801676d1f38645897da8a85d800e6e4744ddc4d87ed657c`
- [011 - INV-009 -- Cursor transport is invisible to consumers](011-inv-009-cursor-transport-is-invisible-to-consumers.md) L114-L123 `59110857c462926e3ddd6fee533e04421bfb89cd0e69e799cf35f76d72333901`
- [012 - INV-010 -- Platform naming compliance](012-inv-010-platform-naming-compliance.md) L124-L134 `020cbf16d56bf9160f5abc78009e7f04eacb57780f6b3f81344442a470c66ef6`
- [013 - INV-011 -- UI command dispatch only (Rule 1)](013-inv-011-ui-command-dispatch-only-rule-1.md) L135-L146 `497956ebb80290f56a3efb83a3c01c581410584b772c01f74831b54e0b58041f`
- [014 - INV-012 -- Wiring matrix coverage (Rule 2)](014-inv-012-wiring-matrix-coverage-rule-2.md) L147-L153 `d44e5fcad8100fcade7f8d5436f6a051eff2aa4f18b2527e9debb4d7dfbf0fac`
- [015 - INV-013 -- Pre-dispatch tool validation](015-inv-013-pre-dispatch-tool-validation.md) L154-L163 `b011330ad503ffca88646c089689c3548aa20dfb7f6e5e85597bc81020791c29`
- [016 - INV-014 -- Shared mutable state requires RWMutex](016-inv-014-shared-mutable-state-requires-rwmutex.md) L165-L176 `bcfb7c817aa2666d5b6705111751a1ae2c1e5741dea600f98eca717774dc7374`
- [017 - INV-015 -- Monetary values are integer microdollars](017-inv-015-monetary-values-are-integer-microdollars.md) L177-L189 `f8103e37cfa750267a7ef8fe804ba66054f4f260d4f5643ad503ef7bc3cedd1f`
- [018 - INV-016 -- Token fields are never aggregated at storage layer](018-inv-016-token-fields-are-never-aggregated-at-storage-layer.md) L190-L201 `84c47d358043d91f5d4c1ffe2cc1801f5a3d17a8963626659f11f1a272d0dcaa`
- [019 - INV-017 -- Durable atomic replacement and exact-replace recovery](019-inv-017-durable-atomic-replacement-and-exact-replace-recovery.md) L202-L212 `e55f5b047bce3775735e512ce3058e6c33dbbccccb23f8bc35f3288e31cff782`
- [020 - INV-018 -- Seglog frame integrity and deterministic recovery are mandatory](020-inv-018-seglog-frame-integrity-and-deterministic-recovery-are-ma.md) L213-L236 `0aeacfb8a30cf2df234ebf3f3640b65c119960d05671e8d323c7b39a6adc6bcd`
- [021 - Contract-driven code generation (lightweight; DRY)](021-contract-driven-code-generation-lightweight-dry.md) L238-L245 `546d9bfe589d992c2103ee5a1a0781a051fd1d3ba97231e90e7649d730a962b2`
- [022 - Validation (gated; autonomous)](022-validation-gated-autonomous.md) L247-L262 `4a3c46c93a6f47610276f8267dc33b39552efdb03ed7aee35e6d32478dcae40b`
- [023 - Debug investigation invariants addendum (2026-03-23)](023-debug-investigation-invariants-addendum-2026-03-23.md) L264-L286 `87258ef304e89caf5e8c557b47e6dee6b34240c4502996fb3989287e43697431`
- [024 - INV-019 -- Runtime identity and blocked-policy continuity](024-inv-019-runtime-identity-and-blocked-policy-continuity.md) L288-L323 `e7099b118c05fc6882ec997b9fda481bb093925fd2f5ee4966e8097fedfaa9be`
- [025 - INV-020 -- Project-driven capability activation](025-inv-020-project-driven-capability-activation.md) L325-L337 `e61be03586b133786eed1b82df0e2ad7e2a4a1cfe8f72a81a2a338b31875d1b8`
- [026 - INV-021 -- Dependency-driven seam reconciliation order](026-inv-021-dependency-driven-seam-reconciliation-order.md) L339-L349 `9ed786b8bb5888096a2d8c8779bb791810505fd7f622e1f73f6b6a292e7a76e0`
- [027 - INV-022 -- Service-bound native workbench architecture](027-inv-022-service-bound-native-workbench-architecture.md) L351-L374 `f2bad5e05e0e97995545c52c3af299970a0a6364db02b34f89a340c3f957835b`
- [028 - INV-023 -- Investigation lifecycle budgets are typed](028-inv-023-investigation-lifecycle-budgets-are-typed.md) L376-L386 `d627908c4f63941653bcfb6948085c4c40641c6c96670ecde4a0f160e739c261`
- [029 - INV-024 -- Debug Mode evidence planes stay explicit](029-inv-024-debug-mode-evidence-planes-stay-explicit.md) L388-L403 `3e70083d8a547f60253c745e938f938d5db6219bce1cc19c7522d39784d1be14`
- [030 - INV-025 -- Provider profile isolation is not shared mutable state](030-inv-025-provider-profile-isolation-is-not-shared-mutable-state.md) L405-L412 `58bb2a63965f682e6d21b1b38d457502a67ed19d302f596e17d75e236ba110fa`
- [031 - INV-026 -- Web/provider recovery consumers defer to owner contracts](031-inv-026-web-provider-recovery-consumers-defer-to-owner-contracts.md) L414-L423 `45e0e5c32f8688244c99a3b49067c8247abcecc165013c80947cfca87f7345ae`
- [032 - INV-027 -- Durable-state authority, scope, replay, and recovery remain explicit](032-inv-027-durable-state-authority-scope-replay-and-recovery-remain.md) L425-L437 `6cafefc2b541e46cee1ae5f2f7388005c4480e9d742a3ff0a5ed6cf6f40fd243`
- [033 - Owner / Consumer Map](033-owner-consumer-map.md) L439-L443 `78461ee55b5f1f60da10f7f80075e0d250a1407da10f42ab42573e2a47f33d8f`
- [034 - PlanUnits](034-planunits.md) L445-L4532 `3054804d1e03474b5fc472fb0da6e11675d9c2e684cebd0c6299703a5bca1dae`
- [035 - Migration Coverage](035-migration-coverage.md) L4534-L4544 `0a0d103ff74501f83c28faa5c4cdfde1ab86cbc0ca33df56805d8a93ea886065`
- [036 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](036-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L4546-L4552 `9216c4f024826d28da1b473927400f319abd8a905fd3b6edfa836a7a19bf99b5`
