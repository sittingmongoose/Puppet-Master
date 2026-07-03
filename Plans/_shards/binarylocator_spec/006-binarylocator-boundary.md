# Shard 006: BinaryLocator boundary

Source: `Plans/BinaryLocator_Spec.md`

Source lines: L72-L110

Source SHA256: `e9456832f2a15e65e0158775c6650904e162afa6161f7b115793467ad3ccb3b7`

---

## BinaryLocator boundary
BinaryLocator is a **Provider-owned** discovery + validation + trace service. (ContractRef: Primitive:Provider)

### Contract shape


#### Input (conceptual)
`BinaryLocateRequest` is a conceptual contract; concrete types belong in the Provider domain. (ContractRef: Primitive:Provider)

Required fields:
- `provider_cli`: enum identifying which CLI is being located (Cursor Agent, Claude Code). (ContractRef: Primitive:Provider)
- `force_rescan`: boolean; when `true`, bypass all caches and re-probe the filesystem. (ContractRef: Primitive:Provider)

Optional fields:
- `workspace_root`: absolute path; used **only** for workspace-scoped caching keys (must not expand filesystem probing scope). (ContractRef: Primitive:Provider)
- `override_path`: user-provided path string sourced from Setup/Health **manual path** controls for Cursor/Claude; see Override semantics below. (ContractRef: ConfigKey:advanced_config.cli_paths)
- `env_path`: effective PATH string used for PATH lookup. (ContractRef: Primitive:Provider)

#### Output (conceptual)
`BinaryLocateResult`:
- `status`: `Found | NotFound | FoundButInvalid`. (ContractRef: Primitive:Provider)
- `resolved_path`: absolute path when `Found`. (ContractRef: Primitive:Provider)
- `resolved_name`: candidate binary name that matched (e.g., `agent`, `cursor-agent`, `claude`). (ContractRef: Primitive:Provider)
- `source_layer`: `Override | PATH | CommonLocations | Launchers`. (ContractRef: Primitive:Provider)
- `version`: optional parsed version string. (ContractRef: Primitive:Provider)
- `validation`: `Valid | Invalid(BinaryErrorCode)`. (ContractRef: Primitive:Provider)
- `trace`: ordered list of probe attempts:
  - `layer`: one of the `source_layer` values
  - `candidate`: string (ContractRef: Primitive:Provider)
  - `probe_kind`: `DirectPath | PATHLookup | DirectoryJoin | LauncherResolution` (ContractRef: Primitive:Provider)
  - `result`: `Hit | Miss | HitButInvalid(BinaryErrorCode)` (ContractRef: Primitive:Provider)

#### Trace emission (storage contract note)
BinaryLocator's `trace` is diagnostic data that SHOULD be emitted as events when the event model is available; until then, it is returned as structured data to the caller. (ContractRef: SchemaID:EventEnvelopeV1)
AutoDecision: Until callers have a persisted event writer available, return `trace` only in `BinaryLocateResult`; once available, emit both persisted `EventRecord` diagnostics and return `trace` for deterministic UX/debuggability. (ContractRef: PolicyRule:Decision_Policy.md§4, ContractName:Plans/Contracts_V0.md#EventRecord)

> Compatibility note: storage-plan defines `EventEnvelopeV1` as a minimal envelope; Contracts V0 defines `EventRecord` as the canonical persisted envelope with additional required fields; implementations must emit full `EventRecord` envelopes, while readers may accept both during transition. (ContractRef: SchemaID:EventEnvelopeV1, ContractName:Plans/Contracts_V0.md#EventRecord)

---
