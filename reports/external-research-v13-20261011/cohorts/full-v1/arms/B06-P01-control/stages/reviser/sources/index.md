# Reviser source index

This index preserves predecessor IDs and points to their complete identity records. IDs are not redefined or silently rebound.

## Assigned material

- Brief: [inputs/brief.md](../../../inputs/brief.md)
- Investigator discovery: [discovery.md](../../investigator/discovery.md)
- Investigator draft: [draft.md](../../investigator/draft.md)
- Released plan: [revealed-plan.md](../../investigator/revealed-plan.md)
- Reveal record (single-use reveal time and hashes): [plan-reveal.json](../../investigator/plan-reveal.json)
- Critic review: [critique.md](../../critic/critique.md)

## Inherited source catalogs

- **S01–S20:** investigator source IDs; full URL, version, locator, access UTC, observed operation, conditions, and applicability are in [investigator/source-map.json](../../investigator/source-map.json) and the [investigator source index](../../investigator/sources/index.md).
- **C01–C16:** critic direct-check IDs; full identity records are in [critic/source-map.json](../../critic/source-map.json) and the [critic source index](../../critic/sources/index.md). The critique prose says C01–C17 once; its map/index enumerate C01–C16. No C17 record was provided, so this index does not create one.
- Source ID policy: S, C, and R IDs are distinct. R IDs below are direct checks for this reviser stage, not replacements for S or C IDs.

## Direct reviser checks (R01–R05)

| ID | Primary source | Claim checked |
|---|---|---|
| R01 | [Wasmtime security at v49.0.2](https://github.com/bytecodealliance/wasmtime/blob/v49.0.2/docs/security.md) | Outside-world access through explicit imports; WASI filesystem capability model; runtime/embedder limits |
| R02 | [Linux Kernel Landlock documentation](https://docs.kernel.org/userspace-api/landlock.html) | ABI detection and authority of pre-opened descriptors |
| R03 | [Microsoft AppContainer isolation](https://learn.microsoft.com/en-us/windows/win32/secauthz/appcontainer-isolation) | Least-privilege isolation rationale; platform policy remains to be implemented and tested |
| R04 | [VS Code extension runtime security](https://code.visualstudio.com/docs/configure/extensions/extension-runtime-security) | Extension host has editor file/network/process permissions; publisher trust is separate |
| R05 | [VS Code API reference](https://code.visualstudio.com/api/references/vscode-api) | applyEdit distinction between text-only all-or-nothing and resource-edit failure behavior |

