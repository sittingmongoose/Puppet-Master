# Shard Index: Plans/Architecture_Invariants.md

Generated: 2026-07-07T16:57:08Z

Source SHA256: `fab349fb07405fa12bb0ee2bf0c49308e8b0bb9581290de3ba5db02abe5c0b1e`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L13 `2bc86b661765ec12473fc000b0764b24dd8cbf99b3eb1b39447251ec90f01e0e`
- [002 - 0. Scope](002-0.-scope.md) L15-L24 `062c19ff10e23770be3bf101477e8202db8c94b9ca3d843cee88403a4ef336b7`
- [003 - INV-001 -- Tool correlation integrity (normalized streams + persisted events)](003-inv-001-tool-correlation-integrity-normalized-streams-persisted-.md) L25-L77 `4d479cff926df2082541694e5669da493b1e2ec7ebc6ebb7f3a9895f74ea03ec`
- [004 - INV-002 -- No secrets in persistent storage](004-inv-002-no-secrets-in-persistent-storage.md) L78-L89 `4b09cc7a2dcc0505266d73306862edd95ccf923efbc3a07edbedac793690ce8a`
- [005 - INV-003 -- UI SSOT (no bespoke UI behavior)](005-inv-003-ui-ssot-no-bespoke-ui-behavior.md) L91-L100 `5c2762c3e12b236681aafbda7e7fc2de4241a04847c014014b7632a6859212f2`
- [006 - INV-004 -- UI command boundary (no business logic in UI)](006-inv-004-ui-command-boundary-no-business-logic-in-ui.md) L101-L110 `9c6877fe1dd5e0b742a8c145adc6b95fc836369e3562513471d4ecff0c064006`
- [007 - INV-005 -- Deterministic ordering from SSOT lists](007-inv-005-deterministic-ordering-from-ssot-lists.md) L111-L120 `d7587672bba8011bd0a62ce22a683f32e6e51db697d1fe9ac0a721257edeff6b`
- [008 - INV-006 -- Providers are storage-isolated](008-inv-006-providers-are-storage-isolated.md) L121-L125 `6730ce5b3272826bdf068aeafe8e01ebdec3f97540aa8961d0377f1f9149006b`
- [009 - INV-007 -- No stringly-typed IDs outside SSOT](009-inv-007-no-stringly-typed-ids-outside-ssot.md) L127-L136 `8cdc02bb316b67aaa87f28b2850f7516ba11699442f83840ea595db2556e6f7b`
- [010 - INV-008 -- GitHub operations are API-only](010-inv-008-github-operations-are-api-only.md) L137-L146 `a437b67a8ba73cc45bf832ab76680c20b642806bc4d3a0343898017b84863524`
- [011 - INV-009 -- Cursor transport is invisible to consumers](011-inv-009-cursor-transport-is-invisible-to-consumers.md) L147-L156 `ce21285eaa0a93ae51d6e6868a78cc0b3e2f1bd7e4db8328965f266b8c3e12c1`
- [012 - INV-010 -- Platform naming compliance](012-inv-010-platform-naming-compliance.md) L157-L167 `3cd24f30180897af6bc08db8e192bfffa85ad469e4b7cc817006b71b75351f91`
- [013 - INV-011 -- UI command dispatch only (Rule 1)](013-inv-011-ui-command-dispatch-only-rule-1.md) L168-L179 `9e563f98921f48a4fce5e10a18a7054c61dafa3b9f204d0517cae2ecb0520344`
- [014 - INV-012 -- Wiring matrix coverage (Rule 2)](014-inv-012-wiring-matrix-coverage-rule-2.md) L180-L186 `66c5ef118fe2bea10612fa418c9b4c15c33376b380c46d7709543d80afcff88e`
- [015 - INV-013 -- Pre-dispatch tool validation](015-inv-013-pre-dispatch-tool-validation.md) L187-L196 `ec45745438620c59cee44fe381419a0375ffcf8d2492f4e7aa532eec96b78cdf`
- [016 - INV-014 -- Shared mutable state requires RWMutex](016-inv-014-shared-mutable-state-requires-rwmutex.md) L198-L209 `5f5fe4e6ad9a0d045e34b682c976b3753b3b6efc7a8b0dab28ecf1fd80babf1a`
- [017 - INV-015 -- Monetary values are integer microdollars](017-inv-015-monetary-values-are-integer-microdollars.md) L210-L222 `19ae75ccaf4d2540e6ca71c10430453652b74cd8a8141da3da5280361a358251`
- [018 - INV-016 -- Token fields are never aggregated at storage layer](018-inv-016-token-fields-are-never-aggregated-at-storage-layer.md) L223-L234 `e72cd64c97e6d2ae8a85cfd6d8a18d2c3eb7b5dcdbc6bfbcabb08b945c5109b3`
- [019 - INV-017 -- File mutations are atomic (temp-fsync-rename)](019-inv-017-file-mutations-are-atomic-temp-fsync-rename.md) L235-L243 `778293a91c01e4d3cbd59f27de6cb6cc86af8a23ddafa4795ba844abd7742c59`
- [020 - INV-018 -- Seglog CRC32 is mandatory](020-inv-018-seglog-crc32-is-mandatory.md) L244-L259 `efa5ac697cdc985a5a7d4a4b26e140ebf89b3e12babb50294e02bc8a3c25bed2`
- [021 - Contract-driven code generation (lightweight; DRY)](021-contract-driven-code-generation-lightweight-dry.md) L261-L268 `9f43dd493ea592f9c6290cfc7fb7989ffff2e27bfb163284fe8e7719aa468661`
- [022 - Validation (gated; autonomous)](022-validation-gated-autonomous.md) L270-L285 `47167e600067e005575db91c94b58bc4252434e003ba00eb6427004da3d3b79b`
- [023 - Debug investigation invariants addendum (2026-03-23)](023-debug-investigation-invariants-addendum-2026-03-23.md) L287-L309 `10c02d7c1f235cd4ad9aa7a33db59b8a75eeb8efc7ee3b7fae8fa388fd5bad1a`
- [024 - INV-019 -- Runtime identity and blocked-policy continuity](024-inv-019-runtime-identity-and-blocked-policy-continuity.md) L311-L345 `6a5092071ed5e13ce50461ad22cf142e341c61050ae16d0e6caa74fecb473261`
- [025 - INV-020 -- Project-driven capability activation](025-inv-020-project-driven-capability-activation.md) L347-L359 `f44ae689b24c8740e346db15ed40759e5af1c847bbb861a1f224dcb2c144efa5`
- [026 - INV-021 -- Dependency-driven seam reconciliation order](026-inv-021-dependency-driven-seam-reconciliation-order.md) L361-L371 `013f4be2c3b7dcb3ab5fea0eed015d97695e31d54bb8c4b572111a73dc9e4b04`
- [027 - INV-022 -- Service-bound native workbench architecture](027-inv-022-service-bound-native-workbench-architecture.md) L373-L396 `8ad99b8836f6078646107b9e628ae60c264b8631e80a9fdbd87ad3b2450eb719`
- [028 - INV-023 -- Investigation lifecycle budgets are typed](028-inv-023-investigation-lifecycle-budgets-are-typed.md) L398-L408 `fa5a5ea6883edcc9e90227784db1506f18cea4203d0ec2fb42a4e8fd700da31b`
- [029 - INV-024 -- Debug Mode evidence planes stay explicit](029-inv-024-debug-mode-evidence-planes-stay-explicit.md) L410-L425 `de901d785440f1858460e2c35b839bcb5be1d3b26f0ec022d5be42a884a77a5e`
- [030 - INV-025 -- Provider profile isolation is not shared mutable state](030-inv-025-provider-profile-isolation-is-not-shared-mutable-state.md) L427-L434 `d8368895f01f7b982f0966684b9752cc5ff800adfc3cd1b95398aa10a594a802`
- [031 - INV-026 -- Web/provider recovery consumers defer to owner contracts](031-inv-026-web-provider-recovery-consumers-defer-to-owner-contracts.md) L436-L445 `ff29f3853d8146dd8c434151cb04f4cd5fd5608d279052f6c425a055adc505cb`
- [032 - Owner / Consumer Map](032-owner-consumer-map.md) L447-L451 `69fe8cc25fa0c3a8243bce444ba26c013365a67d2210447a2adf1b45a6f18bd9`
- [033 - PlanUnits](033-planunits.md) L453-L4424 `36d3aade4505306f9a979ba83ca600fefd86d7c8a265f261d7fb217f3d8b6352`
- [034 - Migration Coverage](034-migration-coverage.md) L4426-L4436 `e4bc70660e25778ea1a2a0b1fd966bfa057180abc0d406415ddd270ab80b4d5a`
