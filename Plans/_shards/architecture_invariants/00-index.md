# Shard Index: Plans/Architecture_Invariants.md

Generated: 2026-11-04T16:52:04Z

Source SHA256: `d48461a5189f0540f72edec82e53ffffd9a421fcdd39f7ec884aa1a81e22e254`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L13 `cf98e12e0887890e5ef1ae651a3d05472670122ddd1a242b2f898a14609e4c3c`
- [002 - 0. Scope](002-0.-scope.md) L15-L24 `c57ed617ad9e17e957b0ce87415842a582bc3cf8c2971ab946dfb45ff7589be6`
- [003 - INV-001 -- Tool correlation integrity (normalized streams + persisted events)](003-inv-001-tool-correlation-integrity-normalized-streams-persisted-.md) L25-L44 `c87e1bfc492b61b33871376c20f77b4266198556775c53f077e7d0c77e1862cc`
- [004 - INV-002 -- No secrets in persistent storage](004-inv-002-no-secrets-in-persistent-storage.md) L45-L56 `6289959c10fb71eeb1f0b6cc4ade518f34341d43582f214d9b8a7a99db43be2f`
- [005 - INV-003 -- UI SSOT (no bespoke UI behavior)](005-inv-003-ui-ssot-no-bespoke-ui-behavior.md) L58-L67 `3282daf5d0cd1a26e481b16ef311f92d125f41d3340cda8ca3a6b8a78f128974`
- [006 - INV-004 -- UI command boundary (no business logic in UI)](006-inv-004-ui-command-boundary-no-business-logic-in-ui.md) L68-L77 `27c0d0145e1907c1e5f62de97981b7c29f7c53db4cbc9ebc957c66da77448afd`
- [007 - INV-005 -- Deterministic ordering from SSOT lists](007-inv-005-deterministic-ordering-from-ssot-lists.md) L78-L87 `b4c90e6159efb522637780df4d357708063b1476a04e01454b0d302f38f0a9f7`
- [008 - INV-006 -- Providers are storage-isolated](008-inv-006-providers-are-storage-isolated.md) L88-L92 `574ce709a7c142e94801bb7ccff83faee035b18adf048acc250f6f87ffcff091`
- [009 - INV-007 -- No stringly-typed IDs outside SSOT](009-inv-007-no-stringly-typed-ids-outside-ssot.md) L94-L103 `9ccb90fad59ec2ae07ceedbabeef0081a6b6b7f66f649cb59b109d4f8ad3adfb`
- [010 - INV-008 -- GitHub operations are API-only](010-inv-008-github-operations-are-api-only.md) L104-L113 `4745e9a5a7ac5698eb13c2ebecb5655bd34f57edfeb8ce9aec301fe3731c7449`
- [011 - INV-009 -- Cursor transport is invisible to consumers](011-inv-009-cursor-transport-is-invisible-to-consumers.md) L114-L123 `a56dff91fbb29ae3455cc8bd81d1726ce9d03a44e3c439f8a0f3a87b010f8b98`
- [012 - INV-010 -- Platform naming compliance](012-inv-010-platform-naming-compliance.md) L124-L134 `ffe2a4bfe0b2dfc8f80473fc2f11435a3565c98ae7042afa343868495e04022a`
- [013 - INV-011 -- UI command dispatch only (Rule 1)](013-inv-011-ui-command-dispatch-only-rule-1.md) L135-L146 `0c2522be6b8155a0b8be8cffa8c1deae7e14523dfaf1a9a75b61f420a1c101eb`
- [014 - INV-012 -- Wiring matrix coverage (Rule 2)](014-inv-012-wiring-matrix-coverage-rule-2.md) L147-L153 `3444571d68278e50097305473d476983ba2e73f16e064e70ee4629ac6894f793`
- [015 - INV-013 -- Pre-dispatch tool validation](015-inv-013-pre-dispatch-tool-validation.md) L154-L163 `ff1c09095e78729e0c901581a1a273eef296e3f50f27fd3f55920a371e737a4b`
- [016 - INV-014 -- Shared mutable state requires RWMutex](016-inv-014-shared-mutable-state-requires-rwmutex.md) L165-L176 `30e4a8d64345e47642a8356db9dafb793f39b39e0aa0a6b04dbc74ad6635e269`
- [017 - INV-015 -- Monetary values are integer microdollars](017-inv-015-monetary-values-are-integer-microdollars.md) L177-L189 `ded236b4b6263b332141f47cd03f77ff66d4b52cc200ca26eb49f19cc449d129`
- [018 - INV-016 -- Token fields are never aggregated at storage layer](018-inv-016-token-fields-are-never-aggregated-at-storage-layer.md) L190-L201 `cbbd2706dd0cdbd1374e357416bc75f4b7d68d0200fea3a0399de7f20e68b149`
- [019 - INV-017 -- Durable atomic replacement and exact-replace recovery](019-inv-017-durable-atomic-replacement-and-exact-replace-recovery.md) L202-L212 `5d19324594046d0a0e2f56acd4c7f82787dd796bb3b5ad70bb10a9765c5a215e`
- [020 - INV-018 -- Seglog frame integrity and deterministic recovery are mandatory](020-inv-018-seglog-frame-integrity-and-deterministic-recovery-are-ma.md) L213-L236 `81ab0ee969a7ed3d48b025f425422205d8ec46db065c92a345f1671b8d9fcc4c`
- [021 - Contract-driven code generation (lightweight; DRY)](021-contract-driven-code-generation-lightweight-dry.md) L238-L245 `da64a59918f72deb6d26290dce90318193831d557035f7be0e9df5703dbe1fe1`
- [022 - Validation (gated; autonomous)](022-validation-gated-autonomous.md) L247-L262 `a19c27c5b63c0e77fcd27797f4c6e2b155e5af7b8eef085e4b8ea6f173e1d80f`
- [023 - Debug investigation invariants addendum (2026-03-23)](023-debug-investigation-invariants-addendum-2026-03-23.md) L264-L286 `09aa38a481936997e94ca66c6bba503a6100837030c2b1eeee1d8c4d01ba430b`
- [024 - INV-019 -- Runtime identity and blocked-policy continuity](024-inv-019-runtime-identity-and-blocked-policy-continuity.md) L288-L323 `84a46772bba2c3021332ecdd74dabf06fea3f79767b1a973877d94db59169b3d`
- [025 - INV-020 -- Project-driven capability activation](025-inv-020-project-driven-capability-activation.md) L325-L337 `1f677447efbc2eadce52c31d8115cb42ae84844b80fef12759c84f0951b22359`
- [026 - INV-021 -- Dependency-driven seam reconciliation order](026-inv-021-dependency-driven-seam-reconciliation-order.md) L339-L349 `1a5a21710ab8944bc70191ee90ec43f8b359be7a512c416f3a56f3c9cc8dc4cd`
- [027 - INV-022 -- Service-bound native workbench architecture](027-inv-022-service-bound-native-workbench-architecture.md) L351-L374 `35415fa51971109ba99415c367e34ab2eb66841a6387e56656a9892e3e351e36`
- [028 - INV-023 -- Investigation lifecycle budgets are typed](028-inv-023-investigation-lifecycle-budgets-are-typed.md) L376-L386 `b3d364d74ed4824863f4abc46aceef58b5521ef69db31390ae9e1ae44811cb62`
- [029 - INV-024 -- Debug Mode evidence planes stay explicit](029-inv-024-debug-mode-evidence-planes-stay-explicit.md) L388-L403 `da52bc687dbdae48f48beef20b91ae27d735270d384c6cad28218dafbbc85a96`
- [030 - INV-025 -- Provider profile isolation is not shared mutable state](030-inv-025-provider-profile-isolation-is-not-shared-mutable-state.md) L405-L412 `a69f8e283e37cfa8720195bd56443a6ee7ebdbd5c31ac5d2af35d46a62228531`
- [031 - INV-026 -- Web/provider recovery consumers defer to owner contracts](031-inv-026-web-provider-recovery-consumers-defer-to-owner-contracts.md) L414-L423 `0e6ddc0bd5cef52b3a5118a209057a0fe7798b7b9d26743c28a8b69ff20a36df`
- [032 - INV-027 -- Durable-state authority, scope, replay, and recovery remain explicit](032-inv-027-durable-state-authority-scope-replay-and-recovery-remain.md) L425-L437 `05cd04f546b4088c372a18c6324970bd9d130b389a41944443ba227b97e61eb0`
- [033 - Owner / Consumer Map](033-owner-consumer-map.md) L439-L443 `847a2fb6fd90f8b0744013746f57f2248988840f3982fc3ed061630ae829a48c`
- [034 - PlanUnits](034-planunits.md) L445-L4532 `67f5d4d0a2bf7a1480bfccd24d68ff3237101cd70a1370e5884ae3572259aace`
- [035 - Migration Coverage](035-migration-coverage.md) L4534-L4544 `733a7ac37eeec86c1f1bd1c60467d0859b10e9e5c3d77c0d65d073a90a8dee2f`
- [036 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](036-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L4546-L4619 `11017674289c2fe13c866b0794242cdf57d0008419194c21765eb3cef1dd3202`
