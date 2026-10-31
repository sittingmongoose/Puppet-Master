# Shard Index: Plans/Architecture_Invariants.md

Generated: 2026-10-31T21:07:45Z

Source SHA256: `aabdd384375f6ff5f75eac1ad5085ed9af05a5cebcf0dcbf4b5b3462eef1935e`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L13 `e927e94eb5ff332f4e24336844e2c721362e6c3e953fac3115101073194dd6c0`
- [002 - 0. Scope](002-0.-scope.md) L15-L24 `c8b7cf8951a1b8126833e38db868f806057fa76d722371f1a2ae2bada980666d`
- [003 - INV-001 -- Tool correlation integrity (normalized streams + persisted events)](003-inv-001-tool-correlation-integrity-normalized-streams-persisted-.md) L25-L44 `8aebb18a94c5d1556f243892b1bde1c3ab2462b8bb2ea633af1dab28e1e8d247`
- [004 - INV-002 -- No secrets in persistent storage](004-inv-002-no-secrets-in-persistent-storage.md) L45-L56 `91a1c60261cbf75ba347459e8ea5c9af5819b0f2066e3fb7801e8498a3ff06a0`
- [005 - INV-003 -- UI SSOT (no bespoke UI behavior)](005-inv-003-ui-ssot-no-bespoke-ui-behavior.md) L58-L67 `12a242909b73e74db0dab420c9649682168a27fd496d550bcdc06ad9d4597a15`
- [006 - INV-004 -- UI command boundary (no business logic in UI)](006-inv-004-ui-command-boundary-no-business-logic-in-ui.md) L68-L77 `43be57dd369fe8387e4bff8a46e243196d653398002fd80c8072361998b0d647`
- [007 - INV-005 -- Deterministic ordering from SSOT lists](007-inv-005-deterministic-ordering-from-ssot-lists.md) L78-L87 `d2cc6931dae32e25004673c8d91af4333e529548c77ed961d701bdf4130c75c2`
- [008 - INV-006 -- Providers are storage-isolated](008-inv-006-providers-are-storage-isolated.md) L88-L92 `08b92f73276cdb9845cbeb284830da744ee3e455d173b42735d32355a7728166`
- [009 - INV-007 -- No stringly-typed IDs outside SSOT](009-inv-007-no-stringly-typed-ids-outside-ssot.md) L94-L103 `6d96fd76b1947e0f09f5276464f6aac7ea0b61321910a61e881826802fc7d60a`
- [010 - INV-008 -- GitHub operations are API-only](010-inv-008-github-operations-are-api-only.md) L104-L113 `f7caafe4b7cf7cbb5a4f2394fd3be030fc984f3037805f409310d7db3186de03`
- [011 - INV-009 -- Cursor transport is invisible to consumers](011-inv-009-cursor-transport-is-invisible-to-consumers.md) L114-L123 `fd25ff29ecf6871f9992ae041bd410cf4a466fb4b253395cf1dfe835dbfc46ae`
- [012 - INV-010 -- Platform naming compliance](012-inv-010-platform-naming-compliance.md) L124-L134 `874986f661c021a38bc138c050143c64c4eb9e6b30199e293a6ab2d912c5c9d8`
- [013 - INV-011 -- UI command dispatch only (Rule 1)](013-inv-011-ui-command-dispatch-only-rule-1.md) L135-L146 `7e755930dea5c49d30bf1c813bde84c8479f7f6ee3a8b5e37bea447e61f22409`
- [014 - INV-012 -- Wiring matrix coverage (Rule 2)](014-inv-012-wiring-matrix-coverage-rule-2.md) L147-L153 `d37bbd20ee2f13e905a657239b931e9fb1c16ae89c3f67cda62d61d104d43dea`
- [015 - INV-013 -- Pre-dispatch tool validation](015-inv-013-pre-dispatch-tool-validation.md) L154-L163 `012a59219c3a6e2d397f118ef65aba2bbe9989ff6ef2a05a0fcc472d49b0eb6f`
- [016 - INV-014 -- Shared mutable state requires RWMutex](016-inv-014-shared-mutable-state-requires-rwmutex.md) L165-L176 `de728258b6c9cea29c84bf2b3efb2af00744bcaa3093eff29a96481b49859f87`
- [017 - INV-015 -- Monetary values are integer microdollars](017-inv-015-monetary-values-are-integer-microdollars.md) L177-L189 `4a8beea83d8b95d4ce9f31eb8fa43de11ba6a2037596112fe0ce73238727a64d`
- [018 - INV-016 -- Token fields are never aggregated at storage layer](018-inv-016-token-fields-are-never-aggregated-at-storage-layer.md) L190-L201 `f404dacb4e2d6df3f69b75c35c97fad14365d71ed93d0a4636a01968539e8f28`
- [019 - INV-017 -- Durable atomic replacement and exact-replace recovery](019-inv-017-durable-atomic-replacement-and-exact-replace-recovery.md) L202-L212 `5e3465ec460d21ec6ec58873f967849e28c2b274b6e2a8ccbbd738755f5d8658`
- [020 - INV-018 -- Seglog frame integrity and deterministic recovery are mandatory](020-inv-018-seglog-frame-integrity-and-deterministic-recovery-are-ma.md) L213-L236 `5aefcf35d56d554bb15d9b1b52f24b789131ab553a0a8b766d9b5197c3b15178`
- [021 - Contract-driven code generation (lightweight; DRY)](021-contract-driven-code-generation-lightweight-dry.md) L238-L245 `04a3c3472efc36986d00f04e51a02fd4d86513b7af1c1e7c9064e46ff4fab53a`
- [022 - Validation (gated; autonomous)](022-validation-gated-autonomous.md) L247-L262 `521ceb703967ca7b179a6f5b8afaab160e96fd75fb77126e83b7b4900b7851c1`
- [023 - Debug investigation invariants addendum (2026-03-23)](023-debug-investigation-invariants-addendum-2026-03-23.md) L264-L286 `097ee290d55ea955f766ac4a5ec568f4c1cb3ec7054d94afdc26dbe9640610e9`
- [024 - INV-019 -- Runtime identity and blocked-policy continuity](024-inv-019-runtime-identity-and-blocked-policy-continuity.md) L288-L323 `09c3c2ea3839fdaf071848d9427b108b84328e4a9da2527b634a585ed453480e`
- [025 - INV-020 -- Project-driven capability activation](025-inv-020-project-driven-capability-activation.md) L325-L337 `a16c786c292e8032baa905dea79f9053b9b926b61f14300f876e1f14789a1fec`
- [026 - INV-021 -- Dependency-driven seam reconciliation order](026-inv-021-dependency-driven-seam-reconciliation-order.md) L339-L349 `c5dda3e3ba063291844bb3d5e58fbe4ddbe588d80e926d3bad8479dbd889c21d`
- [027 - INV-022 -- Service-bound native workbench architecture](027-inv-022-service-bound-native-workbench-architecture.md) L351-L374 `7a370554b0d89080be6bbd947932c6ac46bcbde10514299c2d508bb5b11e0021`
- [028 - INV-023 -- Investigation lifecycle budgets are typed](028-inv-023-investigation-lifecycle-budgets-are-typed.md) L376-L386 `323cd26746e2881a326e47f9feea6f0af1b7eb1df1fc7a31065f1d07ffdec573`
- [029 - INV-024 -- Debug Mode evidence planes stay explicit](029-inv-024-debug-mode-evidence-planes-stay-explicit.md) L388-L403 `11a6b3020cd6d48e7aa29371a5b5f1b3526c8384dd6aacc042eb83691a1fdfb1`
- [030 - INV-025 -- Provider profile isolation is not shared mutable state](030-inv-025-provider-profile-isolation-is-not-shared-mutable-state.md) L405-L412 `8e0a16a8e00113e48ca90cd9fa5dcabd4c15e0a3d2211ae45d28e6c6542c45c3`
- [031 - INV-026 -- Web/provider recovery consumers defer to owner contracts](031-inv-026-web-provider-recovery-consumers-defer-to-owner-contracts.md) L414-L423 `7e5b0892a4756a8e46f83bfac0ed57cbc54e45709251e14512fea142b5e883d4`
- [032 - INV-027 -- Durable-state authority, scope, replay, and recovery remain explicit](032-inv-027-durable-state-authority-scope-replay-and-recovery-remain.md) L425-L437 `b4f51e19fe584bf5efd2ec04469bba625b71ce2c91f04571081e78dae9396c60`
- [033 - Owner / Consumer Map](033-owner-consumer-map.md) L439-L443 `021a5d204b88109f75a6611bc41dec972ced3d3976c5739248f7968442de6fd6`
- [034 - PlanUnits](034-planunits.md) L445-L4532 `c5bea3f020e4aa80ce495c93399c7ce86f1c68833833f58b30d7c64300123b64`
- [035 - Migration Coverage](035-migration-coverage.md) L4534-L4544 `aaf463ed0b2cde3cb4f6c3649bd17e33277c3b9db829f671837410944e7cd599`
- [036 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](036-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L4546-L4552 `eb5ff0468a826c407d413a661703c050593a423b033d9cacb199dc4a83149d52`
