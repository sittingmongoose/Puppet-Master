# Shard Index: Plans/Architecture_Invariants.md

Generated: 2026-07-09T09:46:21Z

Source SHA256: `6d940af76f0d50c6f92e8692ebc817938edcf6015f12a2072bc063517d7020f1`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L13 `ab2110db0232585850238d99f152b549f02629ae944b2a0f984a396a2c004882`
- [002 - 0. Scope](002-0.-scope.md) L15-L24 `ce9445a74c4966b83cc3bf9aeb438c3837d58217e4cac0022d4ba19c0e8ade8c`
- [003 - INV-001 -- Tool correlation integrity (normalized streams + persisted events)](003-inv-001-tool-correlation-integrity-normalized-streams-persisted-.md) L25-L44 `0ffc89d97822ce80f539124a6b649a70f4631904db4fffbc02e26fc01d4b4f8f`
- [004 - INV-002 -- No secrets in persistent storage](004-inv-002-no-secrets-in-persistent-storage.md) L45-L56 `d9a358eddb7052614950c0a9aa65909fa4ed5c6c97008602258d1bb9aec93b6d`
- [005 - INV-003 -- UI SSOT (no bespoke UI behavior)](005-inv-003-ui-ssot-no-bespoke-ui-behavior.md) L58-L67 `c4eb7c93ddab04445aab7450aafc6a82bc88d4c104963be58eb4bfa0ac0b1ba1`
- [006 - INV-004 -- UI command boundary (no business logic in UI)](006-inv-004-ui-command-boundary-no-business-logic-in-ui.md) L68-L77 `bb14960bf4fae26f126b0e4f2ea7745925191f2263e293fe6bf7e749276a98f2`
- [007 - INV-005 -- Deterministic ordering from SSOT lists](007-inv-005-deterministic-ordering-from-ssot-lists.md) L78-L87 `928f5d1f4346cd08e2ded2695d2a8402dd1291f92c7c2beaaa836aff8d279959`
- [008 - INV-006 -- Providers are storage-isolated](008-inv-006-providers-are-storage-isolated.md) L88-L92 `846403b759a20339fca94a5ebf515c7fa5d7bfc985c239330e80ab74bf2456cd`
- [009 - INV-007 -- No stringly-typed IDs outside SSOT](009-inv-007-no-stringly-typed-ids-outside-ssot.md) L94-L103 `85ca0b1d4b57ec053c7e37e0dfcb5ccb7ce90aef75f47e1429ae310aa7c445a9`
- [010 - INV-008 -- GitHub operations are API-only](010-inv-008-github-operations-are-api-only.md) L104-L113 `21cac3fc52bb08f09b834be2ccb31e1a840e8f45ba4eb263ac2e9e2cfa88dbbc`
- [011 - INV-009 -- Cursor transport is invisible to consumers](011-inv-009-cursor-transport-is-invisible-to-consumers.md) L114-L123 `062f22c37573f74b06e92782a4927d7534c8fcc41cdac9aa0f17141dd2a7b3fd`
- [012 - INV-010 -- Platform naming compliance](012-inv-010-platform-naming-compliance.md) L124-L134 `b8dbfb6f92d66982f06d3f6b684b7c1cecf842ef2bbe32553f70217befbf5f32`
- [013 - INV-011 -- UI command dispatch only (Rule 1)](013-inv-011-ui-command-dispatch-only-rule-1.md) L135-L146 `257a0c89404bea367746783ae8daf0461749fb0f748ef0f542c318aac45436f5`
- [014 - INV-012 -- Wiring matrix coverage (Rule 2)](014-inv-012-wiring-matrix-coverage-rule-2.md) L147-L153 `ba2def971468de4afd99e0024c7124844f59148cb2fe2bd021192f950ede521d`
- [015 - INV-013 -- Pre-dispatch tool validation](015-inv-013-pre-dispatch-tool-validation.md) L154-L163 `d9be2f408a4103ffe0bfbf1aa4de5d1a5cc1108fbe791077663196d3311827ab`
- [016 - INV-014 -- Shared mutable state requires RWMutex](016-inv-014-shared-mutable-state-requires-rwmutex.md) L165-L176 `11f494f42221ecb480b20d7dd2ba8810b2aecb47a73cfb2b668951f7b4bb8ca9`
- [017 - INV-015 -- Monetary values are integer microdollars](017-inv-015-monetary-values-are-integer-microdollars.md) L177-L189 `bbdac505ca109d4929caa95fc82ffc20f38a937c13cfef6032feeadf59468d9b`
- [018 - INV-016 -- Token fields are never aggregated at storage layer](018-inv-016-token-fields-are-never-aggregated-at-storage-layer.md) L190-L201 `b113ebb88054d4e0ab967a6686cd247fa5682f17670f5b0bfed7989bbd39f65c`
- [019 - INV-017 -- File mutations are atomic (temp-fsync-rename)](019-inv-017-file-mutations-are-atomic-temp-fsync-rename.md) L202-L210 `4a0922bd93f1cfce555c8dd635f1bcb850cfdc88f8d0ef11875d1a7474633873`
- [020 - INV-018 -- Seglog CRC32 is mandatory](020-inv-018-seglog-crc32-is-mandatory.md) L211-L226 `c5f5f73f33b888ede008841c03372ea8f7118c27a8f34da1150a688b9b8c9d03`
- [021 - Contract-driven code generation (lightweight; DRY)](021-contract-driven-code-generation-lightweight-dry.md) L228-L235 `9b0422b9bd2a85a7bbbfe9999355acce58d35452ec9d37473176a7c717fe63c1`
- [022 - Validation (gated; autonomous)](022-validation-gated-autonomous.md) L237-L252 `46d7a9931fa6c5d6b667e7bf16bd071d39b1e131c9c10e512c90bde0dae25c8a`
- [023 - Debug investigation invariants addendum (2026-03-23)](023-debug-investigation-invariants-addendum-2026-03-23.md) L254-L276 `4fa4004d1f8ce14951f6fc46857fb1ac59934434568fe3004ba54bc2bd094578`
- [024 - INV-019 -- Runtime identity and blocked-policy continuity](024-inv-019-runtime-identity-and-blocked-policy-continuity.md) L278-L312 `dbf2041da58e9dfdb92ab7c9ed7262f25aeafa7cd25083c0fa0e901519ce0b8a`
- [025 - INV-020 -- Project-driven capability activation](025-inv-020-project-driven-capability-activation.md) L314-L326 `e8afb080cb62dbcd6d52876a38f2b96eda46b0133cfc7a03fe3b6e3a0935377e`
- [026 - INV-021 -- Dependency-driven seam reconciliation order](026-inv-021-dependency-driven-seam-reconciliation-order.md) L328-L338 `80aea9157ec2356f0630781abaa645a9cf7a671aea104d853ccf8d79008e994b`
- [027 - INV-022 -- Service-bound native workbench architecture](027-inv-022-service-bound-native-workbench-architecture.md) L340-L363 `917976bef7315880d5c6d6368da2af368834b4082e6d5e29721a579454d0b19c`
- [028 - INV-023 -- Investigation lifecycle budgets are typed](028-inv-023-investigation-lifecycle-budgets-are-typed.md) L365-L375 `6cfd60545e3076d429c160ec9388f3e96e3df3af5ec37f60e9babf127b4ac5a0`
- [029 - INV-024 -- Debug Mode evidence planes stay explicit](029-inv-024-debug-mode-evidence-planes-stay-explicit.md) L377-L392 `164f5bd6085c2ecf14db9ca2428b90b53af5dc71d256f1a72c9d1fac40605de8`
- [030 - INV-025 -- Provider profile isolation is not shared mutable state](030-inv-025-provider-profile-isolation-is-not-shared-mutable-state.md) L394-L401 `5fefe379d53afddc49caf31615afc347a2e73214037e430ecf7adcdfdf4f999b`
- [031 - INV-026 -- Web/provider recovery consumers defer to owner contracts](031-inv-026-web-provider-recovery-consumers-defer-to-owner-contracts.md) L403-L412 `f745ce7219df08d0dc7a1a613e267025d7922c192e77f8978e1a64fc1f2fbf38`
- [032 - Owner / Consumer Map](032-owner-consumer-map.md) L414-L418 `37707b0eab411b9dfebbf1c04ea48c2fa9e5bc3dcd245615e3a6f5e3860a80eb`
- [033 - PlanUnits](033-planunits.md) L420-L4394 `8fee0925a66d1bfea86c0bbccda045b5852bf0595fe32c392c53183e7188eb89`
- [034 - Migration Coverage](034-migration-coverage.md) L4396-L4406 `7de061f0c32de5edd9be6b4fc4753faee06b6154b7f3bd500e091c6afdd69996`
- [035 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](035-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L4408-L4414 `f011e1e9d8bc913e21f8de8247b304691551c2086f12710135bb1fd79c2b722d`
