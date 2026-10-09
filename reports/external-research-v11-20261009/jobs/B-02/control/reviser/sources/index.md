# Evidence index — B-02/control/reviser

The source map at [`../source-map.json`](../source-map.json) is authoritative for every source ID’s exact URL, version or commit, locator, access timestamp, observed operations, and drift note. IDs inherited from the research and critic bundles are preserved unchanged. Reviser access observations use new IDs C08–C11; repeated URLs do not rewrite earlier observations.

## Reviser independent checks

| ID | Evidence note | Supports |
|---|---|---|
| ER11-C08 | [Dataverse auditing](reviser-independent-evidence.md#er11-c08) | Configurable audit scope/retention and privileged audit-history deletion; no default immutability claim |
| ER11-C09 | [Offline sync conflicts](reviser-independent-evidence.md#er11-c09) | Last-update-per-column sync behavior; canvas apps do not use the described conflict-resolution settings |
| ER11-C10 | [Optimistic concurrency](reviser-independent-evidence.md#er11-c10) | Row-version checks are an explicit API/SDK mechanism, not a built-in canvas form gate |
| ER11-C11 | [Mobile offline cache](reviser-independent-evidence.md#er11-c11) | Device-local cached reads, queued writes, OS sync differences, retention and lifecycle limits |

## Inherited research evidence — ER11-S01–S19

| ID | Evidence note | Supports |
|---|---|---|
| ER11-S01 | [Power Platform](research/power-platform.md#er11-s01) | Browser/mobile offline boundary; local `LoadData`/`SaveData` limits |
| ER11-S02 | [Power Platform](research/power-platform.md#er11-s02) | Dataverse offline limits, supported connectors, row and relationship constraints |
| ER11-S03 | [Power Platform](research/power-platform.md#er11-s03) | Setup roles and offline-profile administration |
| ER11-S04 | [Power Platform](research/power-platform.md#er11-s04) | Power Apps Premium announced price schedule |
| ER11-S05 | [Power Platform](research/power-platform.md#er11-s05) | Microsoft accessibility guidance and tested combinations |
| ER11-S06 | [Governance and safety](research/governance-and-safety.md#er11-s06) | Microsoft BAA scope and limits |
| ER11-S07 | [Governance and safety](research/governance-and-safety.md#er11-s07) | HHS cloud-provider BAA and risk-analysis guidance |
| ER11-S08 | [Governance and safety](research/governance-and-safety.md#er11-s08) | Workforce access/minimum-necessary guidance and applicability limits |
| ER11-S09 | [Governance and safety](research/governance-and-safety.md#er11-s09) | HIPAA retention FAQ; other law and safeguards remain relevant |
| ER11-S10 | [Governance and safety](research/governance-and-safety.md#er11-s10) | FDA general hearing-aid care cautions; not a reprocessing protocol |
| ER11-S11 | [Governance and safety](research/governance-and-safety.md#er11-s11) | Informative explanation of WCAG use-of-color criterion |
| ER11-S12 | [Governance and safety](research/governance-and-safety.md#er11-s12) | Informative explanation of WCAG keyboard criterion |
| ER11-S13 | [Snipe-IT](research/snipe-it.md#er11-s13) | Hosted and self-hosted price/operations at the recorded date |
| ER11-S14 | [Snipe-IT](research/snipe-it.md#er11-s14) | Asset tags, check-in/out and status behavior; target fit |
| ER11-S15 | [Snipe-IT](research/snipe-it.md#er11-s15) | Custom-field limits and configuration |
| ER11-S16 | [Snipe-IT](research/snipe-it.md#er11-s16) | Version-specific API checkout security advisory |
| ER11-S17 | [Snipe-IT](research/snipe-it.md#er11-s17) | Fix PR and merge/commit chain |
| ER11-S18 | [Snipe-IT](research/snipe-it.md#er11-s18) | Patched and later release chronology/runtime requirements |
| ER11-S19 | [Power Platform](research/power-platform.md#er11-s19) | Initial offline-cache lifecycle review and retention limitation |

## Inherited critic evidence — ER11-C01–C07

| ID | Evidence note | Supports |
|---|---|---|
| ER11-C01 | [Independent evidence](critic/independent-evidence.md#er11-c01) | Normative WCAG 2.2 color, keyboard, name/role/value and status-message criteria |
| ER11-C02 | [Independent evidence](critic/independent-evidence.md#er11-c02) | Offline cache, synchronization differences and local retention |
| ER11-C03 | [Independent evidence](critic/independent-evidence.md#er11-c03) | Snipe-IT advisory scope, affected/fixed versions and bounded impact |
| ER11-C04 | [Independent evidence](critic/independent-evidence.md#er11-c04) | Snipe-IT fix record and commit IDs |
| ER11-C05 | [Independent evidence](critic/independent-evidence.md#er11-c05) | Snipe-IT release version and commit at retrieval |
| ER11-C06 | [Independent evidence](critic/independent-evidence.md#er11-c06) | Power Apps price announcement and arithmetic |
| ER11-C07 | [Independent evidence](critic/independent-evidence.md#er11-c07) | FDA hearing-aid care guidance and its scope limit |

No product runtime, tenant, patient information, accessibility workflow, deployment, or clinical process was tested. Evidence citations support public-source claims only.
