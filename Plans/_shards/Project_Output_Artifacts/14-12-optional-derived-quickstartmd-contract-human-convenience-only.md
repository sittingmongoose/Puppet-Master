## 12. Optional derived `quickstart.md` contract (human convenience only)

- Path: `.puppet-master/project/quickstart.md`
- Classification: derived convenience output; non-canonical for planning and orchestration.
- AI correctness, planning correctness, and validator correctness MUST NOT depend on `quickstart.md`.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:pm.acceptance_manifest.schema.v1

### 12.1 Deterministic generation rules (normative)

`quickstart.md` MUST be generated deterministically from `.puppet-master/project/acceptance_manifest.json` using the following rules:

ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, ContractName:Plans/Project_Output_Artifacts.md

1. **Verbatim source of truth:** command text comes only from `nodes[].checks[].commands[].cmd`.
2. **Allowed command set:** the allowed set is exactly the set of manifest `cmd` strings (no synthesis, normalization, aliasing, interpolation, or reformatting).
3. **Verbatim membership:** every executable command line emitted in `quickstart.md` MUST exist verbatim in the acceptance manifest command set.
4. **Deterministic ordering:** commands are emitted in manifest traversal order: `nodes[]` order, then `checks[]` order, then `commands[]` order.
5. **Deterministic defaults:** `max_commands = 20`; `max_file_size_bytes = 16384`.
6. **Deterministic truncation:** when command count or byte-size limits are reached, generation stops at the last fully included command and appends this exact note line:  
   `... truncated; see .puppet-master/project/acceptance_manifest.json for complete checks`

ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, ContractName:Plans/Project_Output_Artifacts.md

### 12.2 Validation rules (normative)

If `quickstart.md` is present, validator checks MUST enforce:
- file size <= `16384` bytes,
- executable command count <= `20`,
- each executable command appears verbatim in `.puppet-master/project/acceptance_manifest.json` (`nodes[].checks[].commands[].cmd`),
- no command appears that is absent from the manifest command set.

ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, ContractName:Plans/Project_Output_Artifacts.md

