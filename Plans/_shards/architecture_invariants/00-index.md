# Shard Index: Plans/Architecture_Invariants.md

Generated: 2026-11-03T22:13:31Z

Source SHA256: `480fac0bed813d64ffbc35f54515ef098785f04fd1b0893cdf132bba61a93e2b`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L13 `4fe674ed293ec49ea551991811dd13948754fc2470084c34f5884c16f58a22aa`
- [002 - 0. Scope](002-0.-scope.md) L15-L24 `b7c4adbaddb736687585cca17b9da443741dc7a7eb9c9d7df3289732c457ab3b`
- [003 - INV-001 -- Tool correlation integrity (normalized streams + persisted events)](003-inv-001-tool-correlation-integrity-normalized-streams-persisted-.md) L25-L44 `9010253a83b13cf9ce22771828f2a93e2b0c9b82628c2f9f040190a77b921948`
- [004 - INV-002 -- No secrets in persistent storage](004-inv-002-no-secrets-in-persistent-storage.md) L45-L56 `6eb97165658db2cafe511d0c73b80716166dfa380614ccba224597b5e2d9eeb7`
- [005 - INV-003 -- UI SSOT (no bespoke UI behavior)](005-inv-003-ui-ssot-no-bespoke-ui-behavior.md) L58-L67 `84300c884607910c469bf6398f95b32da62416209209dc95e70d5ef6ab007410`
- [006 - INV-004 -- UI command boundary (no business logic in UI)](006-inv-004-ui-command-boundary-no-business-logic-in-ui.md) L68-L77 `09889135d03aede1de5777fd0c88c90c0dc27e7b589d4f5ba661971e386e43a5`
- [007 - INV-005 -- Deterministic ordering from SSOT lists](007-inv-005-deterministic-ordering-from-ssot-lists.md) L78-L87 `a90e47acd0ac21d9aa874b963672bd4966103f55547213549531f580884d22bb`
- [008 - INV-006 -- Providers are storage-isolated](008-inv-006-providers-are-storage-isolated.md) L88-L92 `4f5e1477823b86b83faf443c20ad3067ea0f7dc90f980aa44048f6e3cbfe9eec`
- [009 - INV-007 -- No stringly-typed IDs outside SSOT](009-inv-007-no-stringly-typed-ids-outside-ssot.md) L94-L103 `295b5f8988ebcbfd456329a910b35bf9c101180973ee29c466040bb303a89a06`
- [010 - INV-008 -- GitHub operations are API-only](010-inv-008-github-operations-are-api-only.md) L104-L113 `524566c9be2aae009b243a29d2b60e5fa8e6820d5a9c7e4be28a12e4432882bd`
- [011 - INV-009 -- Cursor transport is invisible to consumers](011-inv-009-cursor-transport-is-invisible-to-consumers.md) L114-L123 `fd83775cb5d77d7f60f1ec86ddf18c00f4e62c651feae082ebe933ba063caa00`
- [012 - INV-010 -- Platform naming compliance](012-inv-010-platform-naming-compliance.md) L124-L134 `2cabc289c95012fff7bbcba84fe262360aba141e785923622cc28c5d9e9d0584`
- [013 - INV-011 -- UI command dispatch only (Rule 1)](013-inv-011-ui-command-dispatch-only-rule-1.md) L135-L146 `4b290dbc1c6c5354dcfec9c3083aac76abb972530c9f743c5dcef3b7a0dc7ab2`
- [014 - INV-012 -- Wiring matrix coverage (Rule 2)](014-inv-012-wiring-matrix-coverage-rule-2.md) L147-L153 `6dee9e28931959dba136f171d084f789ba9c2d95b770c05b8b5115929bec9685`
- [015 - INV-013 -- Pre-dispatch tool validation](015-inv-013-pre-dispatch-tool-validation.md) L154-L163 `449d5426504a6b7aba361d728967e1bd5e9d6bbb9b7209b64d19f22927282050`
- [016 - INV-014 -- Shared mutable state requires RWMutex](016-inv-014-shared-mutable-state-requires-rwmutex.md) L165-L176 `76b00aa2502adcad49fd37d3541fb4a618c260e47092b9b98365c69357708c46`
- [017 - INV-015 -- Monetary values are integer microdollars](017-inv-015-monetary-values-are-integer-microdollars.md) L177-L189 `4ac4bc2f947150dd967fc7afed2d2cb0307b9856710b34c313da45f802f1b066`
- [018 - INV-016 -- Token fields are never aggregated at storage layer](018-inv-016-token-fields-are-never-aggregated-at-storage-layer.md) L190-L201 `1d0fdf3c283957c3903a4126dafcd597b667ff070ba4972faeab428820aafe1f`
- [019 - INV-017 -- Durable atomic replacement and exact-replace recovery](019-inv-017-durable-atomic-replacement-and-exact-replace-recovery.md) L202-L212 `27826f26c3e78c713ead1387e6a3428acd7d34a75a6a139dc1d65358045afd65`
- [020 - INV-018 -- Seglog frame integrity and deterministic recovery are mandatory](020-inv-018-seglog-frame-integrity-and-deterministic-recovery-are-ma.md) L213-L236 `8db294d8f6ad808a815082c61eb31100afc98865acf76fce878711bd49cb9081`
- [021 - Contract-driven code generation (lightweight; DRY)](021-contract-driven-code-generation-lightweight-dry.md) L238-L245 `f07250049856e6cb95cdcaa4a36848d5a69db1af573062ef2b50e7b33f3b61aa`
- [022 - Validation (gated; autonomous)](022-validation-gated-autonomous.md) L247-L262 `7cb64d025d42987bf7517a99d8dbd9a0ce09c3578f6d0b26b2c1fcdf9aef6345`
- [023 - Debug investigation invariants addendum (2026-03-23)](023-debug-investigation-invariants-addendum-2026-03-23.md) L264-L286 `743575f9144fe2bb17c3d1ae5c8331e0db8b19fbcc7445b29011a1365d827267`
- [024 - INV-019 -- Runtime identity and blocked-policy continuity](024-inv-019-runtime-identity-and-blocked-policy-continuity.md) L288-L323 `f4e4f3f73b95fc2bcafd88324e8ee2d5acfa4e31dd4ab577ebdc8f6dac82feab`
- [025 - INV-020 -- Project-driven capability activation](025-inv-020-project-driven-capability-activation.md) L325-L337 `f919fc4fb23194f1ed0c4fb46442b1a611d4626c4fb49518df63e94436c36412`
- [026 - INV-021 -- Dependency-driven seam reconciliation order](026-inv-021-dependency-driven-seam-reconciliation-order.md) L339-L349 `0b03fd4073b0a4ed2a12cece67affe64010b678f1864e076c0fe72ca18e56984`
- [027 - INV-022 -- Service-bound native workbench architecture](027-inv-022-service-bound-native-workbench-architecture.md) L351-L374 `ab492ee53b6dd8999f86694c08f678928f9d6fc82d660b02082d8e19cf7c4a8e`
- [028 - INV-023 -- Investigation lifecycle budgets are typed](028-inv-023-investigation-lifecycle-budgets-are-typed.md) L376-L386 `09264b4cc28b78ddba8317621990d27ff84d4fe4ab0ec27370ace422756a7369`
- [029 - INV-024 -- Debug Mode evidence planes stay explicit](029-inv-024-debug-mode-evidence-planes-stay-explicit.md) L388-L403 `0a9c8493b5189b8432056ba9d5159159ac883146c1f3798ce46dbd17de7b6365`
- [030 - INV-025 -- Provider profile isolation is not shared mutable state](030-inv-025-provider-profile-isolation-is-not-shared-mutable-state.md) L405-L412 `f924ace5ac6d732959bf80ebe63e10aabd6fdf55cb17431f5e630156327c8a13`
- [031 - INV-026 -- Web/provider recovery consumers defer to owner contracts](031-inv-026-web-provider-recovery-consumers-defer-to-owner-contracts.md) L414-L423 `e5ecbf001ce2c1a9707eafb00074dd79b175ed555741b45e4554ef532f48836e`
- [032 - INV-027 -- Durable-state authority, scope, replay, and recovery remain explicit](032-inv-027-durable-state-authority-scope-replay-and-recovery-remain.md) L425-L437 `2e00d8aa9dd6b52f08da9192d20bca628c9423d37284475d4522702579bd4382`
- [033 - Owner / Consumer Map](033-owner-consumer-map.md) L439-L443 `44c4b18faad53ed86788349dad3bbf9087308eccca6999491a374b19421bfc81`
- [034 - PlanUnits](034-planunits.md) L445-L4532 `bc06b3b09c9ab94d281f946dd241cfe52f0d75394a6a16c5b3f434b19d3ac406`
- [035 - Migration Coverage](035-migration-coverage.md) L4534-L4544 `68403e9580e8a305a7bcb4e805a41e9faeec64abd48f66270bd324626caf3df9`
- [036 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](036-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L4546-L4619 `c97c5d6d6a9f39f17f711b63daa7ae483894d5378ae487b2717d1567e21bdf0c`
