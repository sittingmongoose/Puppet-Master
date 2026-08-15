# Shard 003: Non-goals

Source: `Plans/BinaryLocator_Spec.md`

Source lines: L10-L20

Source SHA256: `68378275f233e682c37ebbeb405a91ea064046815bf2454781f7589caba3304b`

---

## Non-goals
- Installing, updating, or uninstalling Provider CLIs. (ContractRef: Primitive:Provider)
- Filesystem crawling or heuristic "best guess" scanning beyond the explicitly enumerated probe layers below. (ContractRef: Primitive:Provider)
- Provider orchestration, authentication, or model discovery (owned by Provider layer). (ContractRef: Primitive:Provider)
- Locating, installing, updating, uninstalling, or health-checking the PM-managed bundled browser runtime is out of scope; browser runtime distribution, including any CEF/`wef`/`cargo-wef` packaging path, is owned by the promoted browser/runtime docs. (ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/newtools.md)

Usage source metadata emitted from binary/provider discovery may preserve the locked `usage_source_kind` vocabulary (`provider_runtime_usage`, `provider_quota_api`, `provider_usage_api`, `provider_error_hint`, and `project_rollup`) only as provider-discovery/evidence-signal aliases. Binary location reports which evidence source is available or detected, then consumers normalize that signal to `source_class`, `source_confidence`, and `source_authority` before UsageRecord persistence, accounting, display, rollups, or route/open behavior. `usage_source_kind` is not accounting authority, permission authority, display authority, or a replacement for `Plans/usage-feature.md` UF-085 source fields.

BinaryLocator diagnostics must not define `/outcome` or reason-code taxonomies and must not own bridge-side `usage-field` or failure-class mapping. Those contracts remain in `Plans/Run_Modes.md` and `Plans/CLI_Bridged_Providers.md`; BinaryLocator only emits discovery traces that those owners can classify.

---
