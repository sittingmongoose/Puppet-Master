# Fresh census delta

- Frozen inventory: `closed-world-census/CURRENT_SOURCE_INVENTORY.json`
- Fresh inventory candidate: `closed-world-census/CURRENT_SOURCE_INVENTORY.FRESH_20260812T0900.json`
- Frozen digest: `b93ef8493d91b69beefbcfc9498e72fc01af9cabbbcd9259e684f3c15e540d56`
- Fresh digest: `9cbd87e6637377845c91b60ccea3de45371e8402b413b6f6257de0d85b88583e`
- Membership: frozen `180` vs fresh `180`
- Denominator `closed`: `false` and intentionally unchanged

## Membership

- Added members: 0
- Removed members: 0
- Result: membership unchanged; the fresh recensus remains a 180-source closed-world candidate set with class counts 72 prose / 83 schema / 25 registry-or-contract.

## Content drift

- Known drift paths from `FREEZE_CURRENTNESS.md`: 10
- Freshly recomputed drift paths: 10
- Additional drifts beyond the known 10: 0
- Missing from the known-drift list after recompute: 0

| Path | Source class | Frozen bytes | Fresh bytes | Frozen SHA-256 | Fresh SHA-256 |
|---|---|---:|---:|---|---|
| `Plans/00-plans-index.md` | `canonical_product_prose` | 345233 | 347882 | `e0358f4d0c5cdce2cbbac0fdef1e70a80ba910ff84c72d999f77c9fc01893eb2` | `ec69685c8f1c769879100ef8c305c390184659630b1a4bcab0b7fb941d9ba06e` |
| `Plans/Automated_Testing_System.md` | `canonical_product_prose` | 239947 | 242190 | `e31f410d13c34109b0e8f74e9a342035c71d0ced1bf04c8c8ac6a087851b96b3` | `cbf113bc3497116549e38ee16407505136466fca3596837cc3acbcfddb699533` |
| `Plans/FileManager.md` | `canonical_product_prose` | 281604 | 282208 | `e2ab56c877541e4bfaf3c69fab1ecfe81fa4ad96e5f0f032c68a8b309a8f3694` | `75c16d913e9410c6988a1e4d67c8bd9a03bf60216e0640aea83d5c0db65109bd` |
| `Plans/FinalGUISpec.md` | `canonical_product_prose` | 1674036 | 1683845 | `62b38f0b20ec5ffd6300105382188f64d70f5c26b8a41eb6761addafbf8d9360` | `dc51354b20dad6d8cf56051b7dcb649ab91d723ecfcf4a9dbbb2ab8a74341032` |
| `Plans/GUI_Rebuild_Requirements_Checklist.md` | `canonical_product_prose` | 107509 | 108520 | `171f065b11ff22f97b3cfe1bf884d75b4048fc9656fc91306f25e9da5f8735ab` | `706621f63d64d09122cea29208ce19c805002d89aee23ebc15df994033a763ca` |
| `Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json` | `canonical_machine_registry_or_contract` | 10406 | 12102 | `643366a5e2dc8073623ccccea4113884bcf1f4a5c5b24f4a28aca9d9fe0a661b` | `7d115787cf9b3595efce910f194bfb1a6ebd77b32592d4052b70d6b0154a2551` |
| `Plans/UI_Command_Catalog.md` | `canonical_product_prose` | 663531 | 664425 | `675341194e15f562897bd18f552ac6582a1198cc4095730f8d4ab219e0c87b88` | `fadca8b6579e67ee7a7c91df171fa823c2aef41d4129be8e22b873ff2673cae4` |
| `Plans/UI_Wiring_Rules.md` | `canonical_product_prose` | 46149 | 46439 | `87574f03b1957e88172a9a9d809b1bbeba5ddc0561f49e6d6adfc64d407a0626` | `a079b3c2ecfa46c779a6fd8f4516899d091a012c379c6ce3bdda5bc4b1bf67fb` |
| `Plans/Widget_System.md` | `canonical_product_prose` | 58640 | 59534 | `35371c337f13a7a43e31da7b629f9e2405fad713d188bb87915ab577078ea72d` | `4c3b870ad93bb8af380bcc86e47e6857f8f71946e59e620c00b51dc0d66d44ad` |
| `Plans/Wiring_Matrix.production.json` | `canonical_machine_registry_or_contract` | 3304568 | 2954976 | `42ff981beb8d456f0a442d1f2ec49134d389744fe6ec3a85a1d1db1a0b7828a7` | `f9942023b0bc2bd32216652d80eaf762c38bec8d1f8ca6a166c68231fa0b5341` |

- No additional drift paths were found beyond the 10 already recorded in `FREEZE_CURRENTNESS.md`.

## Admission rule and machine scan impact

- `DIRECT_EVENT_TYPE_BINDING_REQUIRED` still holds: `true`. The active rule remains unchanged in `admission/CENSUS_ADMISSION_RULE_V2.md`, `CENSUS_STATUS.md`, and `FRESH_CENSUS_DENOMINATOR.json`.
- `MACHINE_CONTRACT_EVENT_BINDING_SCAN.json` needs a v3 rescan: `true`. It is still pinned to the frozen digest `b93ef8493d91b69beefbcfc9498e72fc01af9cabbbcd9259e684f3c15e540d56`, while the fresh inventory digest is `9cbd87e6637377845c91b60ccea3de45371e8402b413b6f6257de0d85b88583e`.
- Reason: the scan consumes the source inventory digest plus drifted scan inputs such as `Plans/UI_Command_Catalog.md` and `Plans/Wiring_Matrix.production.json`; reusing the old scan would mix snapshots.

## Non-claims and invariants

- This delta does not close the denominator and does not restamp `freeze_digest_sha256`. That pin continues to reference the frozen inventory by design until owner-gated cutover.
- `closed-world-census/CURRENT_SOURCE_INVENTORY.json` must remain unchanged.
- `closed-world-census/denominator/FRESH_CENSUS_DENOMINATOR.json` must remain `closed=false`.
- IndividualDisposition ledger split (authoritative for denominator tracking): **54** unresolved (`28` owner-veto + `26` evidence-gap) plus **12** alias rows rebucketed outside unresolved; `event_types` stays `null`.
- No `scripts/**` edits are part of this recensus step.
