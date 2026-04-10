## 13. Batch operations

This section defines the canonical contract for this surface.

Core rules:
- Batch semantics must preserve the explicit false branch for continue_on_error.
- Batch audit/event canon must preserve a parent audit event for the batch plus child audit events per URL.
- Batch approval and timeout behavior already restored in section 13 must survive unchanged.
- Batch webfetch canon includes exact batch inputs, concurrency limits, shared-host permission flow, and the locked batch timeout formula.

Fields:
- continue_on_error: false
- stop on the first failure
- return completed results plus failure detail
- parent audit event for the batch
- child audit events per URL
- tool.invoked
- continue_on_error

Labels and values:
- Firecrawl
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap

Permission rules:
- single confirmation prompt showing all unique domains in the batch
- For Session grants all listed domains for that session

Rules:
- one approval prompt covers the full batch and lists all unique domains in scope
- For Session grants the listed domains for that session
- individual_timeout × min(url_count, 5)
- 600s
- `urls: string[]` (required; min 1, max 50)
- `concurrency?: number` (default 3; max 10
- `continue_on_error?: boolean` (default true
- "For Session" grants all listed domains for that session
- Batch-level timeout is LOCKED as `individual_timeout × min(url_count, 5)`, cap 600s (10 min)
