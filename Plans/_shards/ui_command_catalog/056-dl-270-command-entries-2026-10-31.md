# Shard 056: DL-270 command entries (2026-10-31)

Source: `Plans/UI_Command_Catalog.md`

Source lines: L17019-L17036

Source SHA256: `715b489e7711ed6f4a709a6b542f4d10cf949f344c00a0c44d6cfb71960c9bcd`

---

## DL-270 command entries (2026-10-31)

| Command ID | Label | Args | command_kind | Availability | Confirmation | Disabled reasons | Owner | Sole future handler | Result |
|---|---|---|---|---|---|---|---|---|---|
| `cmd.chat.load_older` | Load 50 older | `{ thread_id, before_page_ref }` | `shell_view` | selection (`older_pages_present`) | none | `stale_projection`, `degraded` | chat | `handlers::chat::load_older` | One sealed page of at most 50 items and 256 KiB, appended above the loaded window; `loaded`, `no_older_pages` or `unavailable`. Read-only: no thread mutation and no persisted event, only a no-persist command receipt. A missing or rebuilding page store shows the degraded state; it never falls back to replaying events. |

Command-line dispositions (no catalog ID; SP-339 owns the verbs and their read semantics, Release_Supply_Chain owns packaging):

| Verb | Disposition | In-app counterpart |
|---|---|---|
| `pm db dump` | Command-line read of a store family from a read-only snapshot | Record inspector via `cmd.storage.open_value` |
| `pm inspect` | Command-line read of one record or value | Record inspector via `cmd.storage.open_value` |
| `pm tail` | Command-line follow of appended records | None required |
| `pm export` (JSONL or JSON on request; optional `--sqlite`, SP-342) | Command-line read; writes only the output it names | None; `cmd.chat.export`, `cmd.usage.export` and the backup commands keep their own rows |

All four apply the Permissions_System default masking and redaction profile. Flag names and exit codes are SP-339's to fix.

ContractRef: ContractName:Plans/Decision_Log.md#DL-270, ContractName:Plans/storage-plan.md#SP-338, ContractName:Plans/storage-plan.md#SP-339, ContractName:Plans/assistant-chat-design.md#ACD-242, ContractName:Plans/Commands_System.md#CS-107
