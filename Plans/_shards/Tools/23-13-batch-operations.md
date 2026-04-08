## 13. Batch operations

PM supports two batch web tools: `batch_webfetch` and `batch_webextract`. Batch contracts reuse the single-item routing, permission, audit, and cache model per URL.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md

| Tool | Input limit | Concurrency | Failure model | Provider note |
|---|---|---|---|---|
| `batch_webfetch` | `urls[]` min 1, max 50 | default `3`, max `10` | `continue_on_error` defaults to `true`; batch succeeds when at least one URL succeeds | Firecrawl uses `POST /v2/batch/scrape` when selected |
| `batch_webextract` | `urls[]` min 1, max 10 | default `3`, max `5` | `continue_on_error` defaults to `true`; same partial-failure model as fetch | Firecrawl native multi-URL extract remains `/v2/extract` with `urls[]` |

### 13.1 Shared batch behavior

- one approval prompt covers the full batch and lists all unique domains in scope.
- `For Session` grants the listed domains for that session; batch permission is not re-prompted per URL.
- batch timeout is `individual_timeout × min(url_count, 5)` capped at `600s`.
- a parent activity card/user-visible receipt is paired with a parent audit event for the batch plus child audit events per URL.
- progress surfaces through the shared `progress_event` payload and user-facing labels such as `Fetching sites: 5/20 complete`.
- cache entries, provider selection, warnings, and refs remain per-URL even when the batch has one parent activity card.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

### 13.2 Failure and cancellation behavior

- `continue_on_error` defaults to `true` for both batch tools.
- when `continue_on_error: false`, PM stops on the first failure and returns completed results plus failure detail; remaining URLs are not executed.
- user cancellation sets `cancelled: true` in the progress payload and returns partial completed results plus explicit cancellation state for the unfinished tail.
- provider or timeout failures preserve per-URL `error_code` values rather than collapsing the whole batch into one undifferentiated error.

### 13.3 Per-URL result carry-through

Every URL result preserves the per-item contract even when the overall batch succeeded only partially.

Per-URL result fields:
- `success`
- `error_code?`
- `content_ref?`
- `map_ref?`
- `answer_summary_ref?`
- `provenance_badge?`
- `execution_path?`

Carry-through rules:
- `summary`, `links`, `images`, and `pdf_artifact` carry over when the corresponding formats were requested.
- `actions` are not part of batch operations.
- per-URL entries keep the effective provider disclosure and any provider fallback explanation relevant to that URL.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md
