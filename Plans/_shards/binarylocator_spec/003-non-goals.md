# Shard 003: Non-goals

Source: `Plans/BinaryLocator_Spec.md`

Source lines: L10-L20

Source SHA256: `2e09bcc480993cdcb2784ff083b4b74c78a552979e441ad22465aaf984a4e97e`

---

## Non-goals
- Installing, updating, or uninstalling Provider CLIs. (ContractRef: Primitive:Provider)
- Filesystem crawling or heuristic "best guess" scanning beyond the explicitly enumerated probe layers below. (ContractRef: Primitive:Provider)
- Provider orchestration, authentication, or model discovery (owned by Provider layer). (ContractRef: Primitive:Provider)
- Locating, installing, updating, uninstalling, or health-checking the PM-managed bundled browser runtime is out of scope; browser runtime distribution, including any CEF/`wef`/`cargo-wef` packaging path, is owned by the promoted browser/runtime docs. (ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/newtools.md)

Usage source metadata emitted from binary/provider discovery uses the locked `usage_source_kind` vocabulary: `provider_runtime_usage`, `provider_quota_api`, `provider_usage_api`, `provider_error_hint`, and `project_rollup`. Binary location only reports which source kind is available or detected; canonical usage accounting remains owned by `Plans/usage-feature.md`.

BinaryLocator diagnostics must not define `/outcome` or reason-code taxonomies and must not own bridge-side `usage-field` or failure-class mapping. Those contracts remain in `Plans/Run_Modes.md` and `Plans/CLI_Bridged_Providers.md`; BinaryLocator only emits discovery traces that those owners can classify.

---
