# Shard 014: GATE-010 -- Wiring matrix validation

Source: `Plans/Progression_Gates.md`

Source lines: L311-L336

Source SHA256: `04fa25266602369dfd1e39048bb64567490865af81a8aed55236c5b8f9fdd785`

---

## GATE-010 -- Wiring matrix validation

`GATE-010` verifies canonical command binding and route-aware navigation normalization.
`python3 scripts/pm-plans-verify.py validate-wiring-matrix` enforces the deterministic contract subset now: production matrix schema, catalog command coverage after exclusions, handler path shape, state selector, disabled-reason projection, receipt/event effect contract, accessibility contract, test evidence, and event-test requirements. Rust/Slint handler resolution and rendered/control test pass evidence remain implementation-certification obligations after the app tree exists.

The gate must fail when any of the following are true:
- a public wrapper command lacks declared normalization metadata
- a deprecated alias is treated as an independent canonical command
- a routed command bypasses the canonical `route_target` / `OpenSubject` contract family
- routing-adjacent owner docs contain unresolved spec-integrity defects that make route/open verification ambiguous or contradictory
- a command row claims layout-only semantics while actually targeting a runtime object, usage object, or cross-surface focus action
- a command/action payload still keys approval or usage correlation by `request_id` or `tier_id` where blocked/runtime or usage identity is canonical
- command-family expansion is a broad-pass change: Source Control `git*`, GitHub Actions `actions*`, Docker Manager, and Docker `/registry/Kubernetes` command-family additions also require wiring-matrix expansion and renewed `GATE-010` coverage
- built-in chat command namespaces such as `git*` and `actions*` stay reserved; chat and file-tree surfaces are consumers of Source Control and GitHub Actions command contracts, not independent feature-owner command namespaces

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Crosswalk.md

Evidence for this gate must capture:
- command ID
- command kind
- normalization metadata when present
- handler binding
- emitted target contract or action family
- failure reason when the row is invalid

ContractRef: ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/evidence.schema.json, ContractName:Plans/Wiring_Matrix.schema.json
