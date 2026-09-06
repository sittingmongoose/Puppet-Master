# Shard Index: Plans/Architecture_Invariants.md

Generated: 2026-09-06T17:37:25Z

Source SHA256: `6ce7f74c2d708b8bdc9358c3f7e41354630e681db5985087d30bd42654a39c7b`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L13 `e74cd6be7112b1179263c9bc1fa52d0d9605ef4979b88a1f0b3ad68402359741`
- [002 - 0. Scope](002-0.-scope.md) L15-L24 `8ccfa2a894e930aa3a2a0fdc7723de376e02922baaa90ff25bdb3c906570e7ab`
- [003 - INV-001 -- Tool correlation integrity (normalized streams + persisted events)](003-inv-001-tool-correlation-integrity-normalized-streams-persisted-.md) L25-L44 `71d1c802924a64bc51deb01ce91f201716a921530766105d6b8aab22127ce4a6`
- [004 - INV-002 -- No secrets in persistent storage](004-inv-002-no-secrets-in-persistent-storage.md) L45-L56 `ba05c4bce6a854f0c0b0ed7a76a35e3bfc471fa2992bb4fae48798ae49b051a4`
- [005 - INV-003 -- UI SSOT (no bespoke UI behavior)](005-inv-003-ui-ssot-no-bespoke-ui-behavior.md) L58-L67 `8284e6fa77761ef6005abe783cabbbc9c5bc760b5b41e8811d27cbe0e1ce8ee8`
- [006 - INV-004 -- UI command boundary (no business logic in UI)](006-inv-004-ui-command-boundary-no-business-logic-in-ui.md) L68-L77 `59bc14f2d4b07e1e612074acd65f198ea4063aed13c9be9e9115c0b2e6de0560`
- [007 - INV-005 -- Deterministic ordering from SSOT lists](007-inv-005-deterministic-ordering-from-ssot-lists.md) L78-L87 `d72076568a3d09adb50618c6320c98eda9fd3ac9b298e44d44c0355b20259ba9`
- [008 - INV-006 -- Providers are storage-isolated](008-inv-006-providers-are-storage-isolated.md) L88-L92 `b2ab260bc6f5c290c5d0b486cf3b0b8df77c723eb27c16bcb2fecf17aea194e3`
- [009 - INV-007 -- No stringly-typed IDs outside SSOT](009-inv-007-no-stringly-typed-ids-outside-ssot.md) L94-L103 `99805a4c444cdee938a39004d02dbd554d3c023267ee7eae976a2e9b09c262f2`
- [010 - INV-008 -- GitHub operations are API-only](010-inv-008-github-operations-are-api-only.md) L104-L113 `363b7a96d6e444763c708fe77b4057055ec851b0b732f620efeb65cc6869aa61`
- [011 - INV-009 -- Cursor transport is invisible to consumers](011-inv-009-cursor-transport-is-invisible-to-consumers.md) L114-L123 `1d806c812c530ef2c029eb37f43e010442c3516dc62c97d553aae2907d80402e`
- [012 - INV-010 -- Platform naming compliance](012-inv-010-platform-naming-compliance.md) L124-L134 `2c752f6b5f88ebb26ec7c046927394643ff30df3f56db10039c723ec9a4bbff7`
- [013 - INV-011 -- UI command dispatch only (Rule 1)](013-inv-011-ui-command-dispatch-only-rule-1.md) L135-L146 `b9dad7ac5ed63a18cfdae2a48b45b63060eae95d1a39e7e45afa1d988d26bca8`
- [014 - INV-012 -- Wiring matrix coverage (Rule 2)](014-inv-012-wiring-matrix-coverage-rule-2.md) L147-L153 `01187ffedf312f5148b144ddc5e83d33a7b9de33b648f538d9b8d593794076bc`
- [015 - INV-013 -- Pre-dispatch tool validation](015-inv-013-pre-dispatch-tool-validation.md) L154-L163 `4cf2d2ee331cda1d189aae8a368049554676b5168663c8cf0d02bafb496aaea7`
- [016 - INV-014 -- Shared mutable state requires RWMutex](016-inv-014-shared-mutable-state-requires-rwmutex.md) L165-L176 `00e900da57ddd14038c827f558fef0a98dea7e798b983d2e5362ed15cf57d6f9`
- [017 - INV-015 -- Monetary values are integer microdollars](017-inv-015-monetary-values-are-integer-microdollars.md) L177-L189 `4bb1310e6072af4ac9754e257458ba3f0d9c004a515157791604018f62a0a59a`
- [018 - INV-016 -- Token fields are never aggregated at storage layer](018-inv-016-token-fields-are-never-aggregated-at-storage-layer.md) L190-L201 `d6b83b9d1336d36589a2d800eaad44767810cebc0893c33560429e3ad9eeac68`
- [019 - INV-017 -- Durable atomic replacement and exact-replace recovery](019-inv-017-durable-atomic-replacement-and-exact-replace-recovery.md) L202-L212 `a6578333dc8d682574bdc5239d6f7c163f4d0bbb1bad34d3f0b4b2de3001d435`
- [020 - INV-018 -- Seglog frame integrity and deterministic recovery are mandatory](020-inv-018-seglog-frame-integrity-and-deterministic-recovery-are-ma.md) L213-L236 `e8a9dbfeb3e190bb1441c9279d7c0c3487431ada8dfafc3084efc9933484423d`
- [021 - Contract-driven code generation (lightweight; DRY)](021-contract-driven-code-generation-lightweight-dry.md) L238-L245 `ae7bdf926d6ea61694003653ce80e5fe0746c0e676bdd05a42ec8ff1c689b31d`
- [022 - Validation (gated; autonomous)](022-validation-gated-autonomous.md) L247-L262 `8770957c1c05ee3a958ae126dd1bd024425740393fdedf6ba5d9ed1d5ec7d6d8`
- [023 - Debug investigation invariants addendum (2026-03-23)](023-debug-investigation-invariants-addendum-2026-03-23.md) L264-L286 `1627970982f4e3458daa160537d8ea094046f324fe687a65fb2cc2611182bea0`
- [024 - INV-019 -- Runtime identity and blocked-policy continuity](024-inv-019-runtime-identity-and-blocked-policy-continuity.md) L288-L323 `62c7b797c56f06b60069bfcee0956bac169dfaf4c82268d663d1b60bee7e355b`
- [025 - INV-020 -- Project-driven capability activation](025-inv-020-project-driven-capability-activation.md) L325-L337 `df701109b6e818579f461f8d3ef03dde50dcb7d5b99170c6a9c38f7a7530e92f`
- [026 - INV-021 -- Dependency-driven seam reconciliation order](026-inv-021-dependency-driven-seam-reconciliation-order.md) L339-L349 `705ca70c3dd10d7731a18ae1864fe9b87ba4571096afbc7221a4ae0c61725295`
- [027 - INV-022 -- Service-bound native workbench architecture](027-inv-022-service-bound-native-workbench-architecture.md) L351-L374 `87c4f725768d224aa20fe5b3267ecf1963997738772c6b3367fd12eff7c7f5b7`
- [028 - INV-023 -- Investigation lifecycle budgets are typed](028-inv-023-investigation-lifecycle-budgets-are-typed.md) L376-L386 `0f028f86935f470c30a52cebb42b0f193f8a555f77d8487fa6e26bc342225910`
- [029 - INV-024 -- Debug Mode evidence planes stay explicit](029-inv-024-debug-mode-evidence-planes-stay-explicit.md) L388-L403 `3ac8d651a70d9192cbf93ab480caafe718b540bb2d95a9f27fe5aa7a9edddbc7`
- [030 - INV-025 -- Provider profile isolation is not shared mutable state](030-inv-025-provider-profile-isolation-is-not-shared-mutable-state.md) L405-L412 `1ef402673b7d1351ad31804874f2444f944853c1f8337fde4b54c597e7f3e450`
- [031 - INV-026 -- Web/provider recovery consumers defer to owner contracts](031-inv-026-web-provider-recovery-consumers-defer-to-owner-contracts.md) L414-L423 `2532d56b00b8e95745bf4ee36e9cbbc1b91655e87651fd9ad6f3a68ca6ba816f`
- [032 - INV-027 -- Durable-state authority, scope, replay, and recovery remain explicit](032-inv-027-durable-state-authority-scope-replay-and-recovery-remain.md) L425-L437 `f480999a681c1da601b6885715cfcffe82abc7c121034138274b81712dca68d6`
- [033 - Owner / Consumer Map](033-owner-consumer-map.md) L439-L443 `7fa3135adb2e23e4451e9a39ebfc143b7c78f13059433e47cf614a06435b54e3`
- [034 - PlanUnits](034-planunits.md) L445-L4531 `64e7fc12e46618bbe08c63064a859374e338cb703c07a0252492b98ab9c0366b`
- [035 - Migration Coverage](035-migration-coverage.md) L4533-L4543 `dfc2d2b0c2358eaa2db6de71176aed6ff0726bc6ddebaceda3f93c19b6fdd777`
- [036 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](036-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L4545-L4551 `e1463347afdcc7b27db79a5f5543dd14ad6f3c4112df79529924305ae963a61e`
