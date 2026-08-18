# Plan-owner delta — concept-10-command-suite (Qwen 5.8)

Concept work only. No canonical Plans, inventory, schema, Command Catalog, Wiring Matrix, or DRY owners are edited.

## Inventory legacy `global` scope → schema impact

- `Plans/settings_inventory.json` records carry legacy scope metadata (e.g. `"global"`). This concept treats every visible value as stored for the current Project and never renders scope as an editable selector (no Global/Project/Goal/Host controls anywhere in the surface).
- Schema impact candidate: add an explicit `legacy_scope_provenance` annotation so future migrations can strip or reinterpret `global` without presenting it as a live dimension. Until adjudicated, the concept hides it behind Details/“Why this value?” evidence.
- Supersessions exercised here: old Settings chip/bloom/no-sidebar contract; stale right-panel language; stale `regular/yolo` mode coupling; invalid inventory values hidden behind row Details.

## Plan owners touched (candidate impacts only)

| Owner | Delta |
| --- | --- |
| FinalGUISpec | Candidate alternate Settings shell: command index home, Ctrl+K palette, left→right drill panes, compact tables, editor-beside-context. |
| Commands / UI Command Catalog | Candidate navigation/value/lifecycle bindings (palette, drill, open, out). Census + exact IDs remain with owner. |
| settings inventory and schema | No record changes; legacy scope annotation candidate above. |
| Multi-Account / Providers | Roster/detail tables over headless fixtures; no probe/auth changes. |
| Permissions / FileSafe | Rule tables rendered; engine untouched. |
| Storage / Backup | Copy + rollback reuse PMCopy2/PMState2 restore points. |
| Release/updates + Binary Locator | Ask-first update and explicit official-source install rows deep-linked; acquisition semantics unchanged. |

## Deferred named owners (9)

Each renders as a clearly-labeled owner shell at a reachable concept-local route (`#/mgr/<id>`), names its canonical owner, shows the insertion destination and return/deep-link contract, and fabricates no backend state machine. See `impact-register.json#deferred_named_owners` and `manager-coverage.json`.

## Command discipline notes

- Palette and key bindings are UI projections over candidate command IDs; they do not create canonical IDs.
- `cmd.settings.bloom.open` remains retired/aliased per base packet; this concept never renders bloom/chip navigation.
- Persistent setting mutation (PMState2.setSetting), one-shot actions (beginOp/finishOp), and manager navigation (hash routes) stay distinct in the wiring delta.
