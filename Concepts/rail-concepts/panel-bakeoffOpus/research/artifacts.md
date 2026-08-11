# Runtime Artifacts side panel — design brief

Column: 240 min / 380 default / 480 max. Owner doc: `Plans/Runtime_Artifacts_Panel.md`. Current implementation: `Concepts/PMConcept7.html:15712-15793`.

**The core finding up front.** The envelope has no `title` field. The only guaranteed identity strings on any row are `artifact_id` and `artifact_type`; `summary` is optional and unbounded (`runtime_artifact_envelope.schema.json`). The label that truncates to `carg…` at 220px is optional spec-wise, and the kind chip that crowds it out is the one string that is always present and can be up to 21 characters (`before_after_snapshot`). The row grammar must therefore be built on `artifact_type` + `routing_refs` (required, `minItems: 1`) and treat the human label as a best-effort overlay, not as the anchor.

---

## 1. Artifact-kind taxonomy

19 canonical types, one seglog event each (`Plans/Runtime_Artifacts_Panel.md:L53-L72`). Column "payload contract" is decisive: only **5 of 19** per-type schemas constrain `type_payload`; the other 14 are literally `{"type":"object","minProperties":1}`, so **no per-kind identity or metadata field is spec-guaranteed for them** — those rows can only render envelope fields.

| Kind | Family | Payload contract | Identity-line source | Metadata source | Preview | Status vocabulary |
|---|---|---|---|---|---|---|
| `code_diff` | evidence | none (open payload) | `summary` → else `artifact_id` | envelope only: `node_id`, `created_at_utc`, `producer_ref` | diff (undefined by schema) | none defined — falls back to `projection_*` |
| `validation_test` | evidence | none | `summary` | envelope only | report | none defined |
| `evidence` | evidence | none | `summary` | envelope only | record view | none defined |
| `screenshot` | evidence / media | none | `summary` | envelope only | image (demand-loaded) | none defined |
| `before_after_snapshot` | evidence | none | `summary` | envelope only | pair view | none defined |
| `failed_attempts` | evidence | none | `summary` | `attempt_id` | list | none defined |
| `context_snapshot` | evidence | none | `summary` | `thread_id` | record view | none defined |
| `subagent_lineage` | evidence | none | `summary` | `producer_ref`, `actor_ref` | tree | none defined |
| `implementation_plan` | bundle | none | `summary` | envelope only | document | none defined |
| `reasoning_summary` | bundle | none | `summary` | `reasoning_tokens` lives on `cost_usage`, not here | text | none defined |
| `suggested_next_steps` | bundle | none | `summary` | envelope only | list | none defined |
| `document` | bundle | none | `summary` | envelope only | document; also the export vehicle for investigation bundles (`L237`) | none defined |
| `artifact_version` | bundle | none | `summary` | envelope only | version compare | none defined |
| `api_web_call` | web | **strict** | `operation_input` (query/URL), `web_operation`, `tool_id` | `source_count`, `pages_visited_count`, `cache_state`, `execution_path`, `effective_adapter_id`, `citation_refs[]` | sources list, `answer_summary_ref`, `content_ref`, `map_ref`, `page_representation_ref` | `success` bool + `denial_reason_code` + `provider_fallback_occurred`; `cache_state ∈ hit\|miss\|bypassed\|stored\|not_stored` |
| `browser_recording` | browser | **strict** | `browser_session_id` + target URL via `page_representation_ref` | `session_class`, `profile_scope`, `capture_scope`, `artifact_refs[]`, `redaction_profile_id` | Open / Watch drawer; page, actions, console, network, screenshots | `state ∈ active\|collapsed\|detached\|background\|closed\|runtime_unavailable`; `open_watch_state ∈ open_available\|watch_available\|fallback_open_external\|background_only\|unavailable` |
| `cost_usage` | receipt | **strict** | `usage_event_ref` (required) / model id | `provider`, `usage`, `cost`, `quota`, `authority`, `refs`, `flags`, `reasoning_tokens` | **Curated / Raw** two-mode (`L1952`, RAP-044) | `flags.is_estimated`, `is_provider_reported`, `is_cli_reported`, `is_subscription_hidden`, `is_byok`, `unknown_reason`; `stream.stop_reason` |
| `tool_llm_trace` | receipt | **strict** | `trace_ref` (required) + `trace_kind` | `tool_call_id`, `provider_attempt_ref`, `lifecycle.*`, `settlement.settlement_status`, `retry.relation` | **Curated / Raw**; `raw_payload.redaction_status` | `trace_kind ∈ llm_call\|tool_call\|stream\|retry\|escalation\|unknown`; `lifecycle.stream_state`, `partial_reason`, `stop_reason` |
| `restore_point` | receipt | **strict** | `restore_point_id` (primary identity — **not** `run_id`/`attempt_id`) | `record_sha256`, `retention.expires_at_utc`, `holds.*`, `workspace_effects.*` | record view + `actions{create,branch,delete,open,apply}` | `status ∈ available\|expired\|deleted\|corrupt`; `source_state ∈ active\|deleted_boundary_retained\|deleted_content_unavailable\|unavailable` |
| `hitl_approval` | receipt | none | `summary` | envelope only | approval record | none defined (permission owner supplies `blocked_reason_code`, `L2060`) |

Family axis notes:
- The current concept's filter chips (All / Web / Browser / Evidence, `PMConcept7.html:15717-15722`) cover 10 of 19 kinds. Receipt and bundle need chips too.
- **`media` has no canonical artifact type.** RAP-032 (`L432`) and RAP-033 (`L475`) require generated-media receipt/expiry projection — provider receipt metadata, hashes, durable local refs, original provider URL refs, expiry warnings, C2PA/SynthID caveats — but §3's canonical 19 (`L53-L72`) contains no `generated_media` type. Media rides on `screenshot`/`document`/`evidence` envelopes with provider fields stuffed into unconstrained `type_payload`. Gap, see §12.

## 2. The common envelope — what every row can rely on

From `runtime_artifact_envelope.schema.json` (`additionalProperties: false`) plus §4B (`L85-L165`):

**Required, always present:** `schema_id`, `artifact_id`, `artifact_type` (19-value enum), `project_id`, `created_at_utc`, `projection_freshness ∈ current|refreshing|stale`, `projection_health ∈ healthy|degraded|unavailable`, `retention_class`, `routing_refs[]` (`minItems: 1`), `type_payload`. Plus `run_id` and `attempt_id` — required for every kind **except** `restore_point` (`L29-L37`, enforced by the envelope's `allOf`/`if-then-else`).

**Optional bridges:** `thread_id`, `node_id`, `provider_attempt_ref`, `usage_event_ref`, `usage_record_id`, `receipt_refs[]`, `producer_ref`, `actor_ref`, `summary`, `detail_ref`, `content_ref`, `source_surface`.

Design consequences:
- `routing_refs[]` is the only always-present open target. Row activation binds to it, never to a path.
- Bridges are joins, never primary keys (`L102-L106`, RAP-006 `L535`). `attempt_id` = local anchor; `provider_attempt_ref` = provider bridge; `usage_event_ref` = usage bridge; `receipt_refs` = external side-effect lineage.
- `projection_freshness` and `projection_health` are the **only** universally guaranteed state chips. The green `success` / `pass on retry` chips in `PMConcept7.html:15726-15738` are not envelope-derived for 14 of 19 kinds.
- Envelope forbids `investigation_id` / `evidence_role` (see §5).

## 3. Identity and preview rules

`### Runtime-artifact identity, index, and preview rules` (`L308-L324`), quoting the load-bearing sentences:

> "Runtime artifact opens are identity-native. `OpenFile` remains a workspace-file source realization for concrete paths; generated artifacts, draft documents, checkpoints, search hits, runtime artifacts, and other object-backed subjects resolve through artifact/open identity first and then realize as `OpenSubject`, `OpenArtifact`, `generated://<artifact_id>`, or an owner-surface route as appropriate." (`L310`)

> "Evidence and artifact lists use independent virtualization and `/paging`. Heavy artifacts remain `metadata-first` until opened, and artifact previews are demand-loaded rather than `pre-rendered` for long lists." (`L312`)

> "`artifact_id` identifies the artifact object, not the runtime attempt." (`L318`)

RAP-019 (`L613`) restates this and adds that project-summary freshness disclosure "must not imply source artifact, receipt, or runtime event staleness unless the owner record says so" — a panel-level `stale` badge may not be painted onto rows. RAP-008 (`L547`) and `L112` add the hard rule: "`path-based` open remains for repo and `/workspace` files, while `identity-based` open is the canonical entrypoint for runtime artifacts."

**What this means for row activation.** Clicking a row emits an identity-first open (`artifact_id` → `routing_refs`), not `OpenFile(path)`. `path_ref` exists in the index projection (`storage-plan.md:L1215`) but is display metadata only. A row therefore must never render a filesystem path as its primary affordance — a path in the identity line invites a path-based open. Corollary: rows survive cleanup, archive/remove, retention, and bundle moves (`L114`), so the row must not go dead when a file disappears. Previews are demand-loaded: the row ships metadata, and the preview line in `PMConcept7.html:15727` (`src/services/import.rs +38 -9 · regression fixture added`) is a pre-rendered preview that violates metadata-first unless it comes from `summary`.

## 4. Route-state vs shell-state

`#### Route-state and shell-state boundary` (`L98-L106`), RAP-007 (`L541`):

> "Runtime-artifact route-state answers 'where should the user land,' not 'how should every panel be laid out when they get there.' … workspace-tab selection, panel docking, and per-project layout restore are `shell-state` concerns layered underneath canonical routing." (`L98-L99`)

| Persists | Where | Not persisted |
|---|---|---|
| expanded groups, selected artifact, compare target, preview mode | `artifact_panel_state.v1:{project_id}`, debounce 250ms (`FinalGUISpec.md:L2312`) | route identity — it is resolved fresh, never restored from panel state |
| last active side-panel occupant | `project_state:v1:{project_id}` | filter text (not in the key's content list) |

Implications, and they are sharp:
- **Filter state is not in `artifact_panel_state.v1`.** The key enumerates exactly four things and family/kind filters are not among them. Either the panel's filter chips reset on reload, or the key needs extending. Flagged in §12.
- Selection persists, so restoring a selected artifact that has since been evicted must render the unavailable reason, not an empty list (`L2056`).
- Panel-specific UX state must not co-mingle with global policy settings (`FinalGUISpec.md:L725`).
- Context-changing actions (`Show in Usage`, `Open in Source Control`, `View in Usage`) "normalize through route/open primitives first" (`L104`) — the panel does not own the destination tab.

## 5. Debug investigation grouping

RAP-012 (`L571`), RAP-013 (`L577`), manifest contract at `L196-L240`.

Grouping fields: `investigation_id?`, `instrumentation_id?`, `evidence_role? ∈ baseline|repro|diagnosis|fix|verification|cleanup`, `verification_strength? ∈ none|weak|strong` (`L200-L204`). "investigation grouping does not invent a new artifact family; it is an index and navigation layer over the canonical artifact records" (`L207`). Required participants when emitted: `context_snapshot`, `tool_llm_trace`, `failed_attempts`, `restore_point`, `before_after_snapshot`, `subagent_lineage` (`L209`).

Manifest contributes for the group header (`L216-L233`): `bundle_id`, `final_state`, `stop_reason_code`, `target_summary`, `phase_history`, `artifact_refs[]`, `verification_summary`, `cleanup_state`, `redaction_and_omission_summary`, `fix_summary{status, diff_artifact_id?, summary_text}`, `omitted_items_summary{omitted_evidence_count, omitted_raw_payload_count, omission_reason_codes[]}`.

**Rendering at 240px.** `evidence_role` is a 6-value closed enum — it is the one axis that compresses to a single glyph or a 4–9 char chip and orders deterministically (baseline → repro → diagnosis → fix → verification → cleanup). Member rows in a bundle should lead with `evidence_role`, not `artifact_type`: role is short, ordered, and explains the row's function; the kind is secondary. The current concept already does this correctly (`PMConcept7.html:15781-15785`) — that is the one pattern in the existing panel that survives 240px. Group header carries `final_state` + `verification_strength` + member count; `omitted_items_summary` must stay visible so users can tell what was not carried forward (`L240`), but at 240px it collapses to a count badge. The manifest references bytes rather than duplicating them (`L235`), so a bundle group never inflates the row payload.

**Schema gap that blocks this.** The envelope is `additionalProperties: false` and does not declare `investigation_id`, `instrumentation_id`, `evidence_role`, or `verification_strength`; each per-type schema is also `additionalProperties: false` at top level. So grouping fields can only live inside `type_payload`, which is unconstrained for 14 of 19 kinds — the grouping contract is unvalidatable today.

## 6. Ranked feature inventory

**P0 — visible at 240px** (≈33 characters of text per line at 12px):
1. Kind indicator (abbreviated or glyph; see §8).
2. Identity line: `summary` → falls back to a kind-specific derived label → falls back to short `artifact_id`.
3. One state chip, and only one: kind-native status where the schema defines it, otherwise `projection_health` when it is not `healthy` (never paint `healthy`).
4. Relative time from `created_at_utc`.
5. Family filter chips (filter-first is required at scale, `FinalGUISpec.md:L723`).
6. Row activation → identity-native open.
7. Investigation group header + `evidence_role`-led member rows.
8. Blocked / expired / redacted affordance (§9) — never silently hidden.

**P1 — at 380px:**
9. Second metadata line: 2 fields max, chosen per kind, from `node_id` / `attempt_id` / `source_count` / `session_class` / counts.
10. Preview line from `summary` or `detail_ref` (demand-loaded).
11. Curated/Raw toggle for `cost_usage` and `tool_llm_trace` (RAP-044, `L1952`).
12. Inline `Show in Usage` / `Show in Ledger` for cost-bearing rows.
13. Open / Watch pair for `browser_recording`; Sources count for `api_web_call`.
14. `retention_class` and `redaction_profile_id` indicators.

**P2 — overflow menu or detail sheet only:**
15. The bridge-field viewer (`L389-L397`): `attempt_id`, `provider_attempt_ref`, `usage_event_ref`, `workflow_refs`, `docker_refs`, `kubernetes_refs`, `workflow_run_id`. Seven ref fields; sheet-only, never a row.
16. Export (record / bundle / view — three distinct classes, RAP-014 `L583`, `L242-L248`).
17. Compare target selection (persisted, but the picker is a sheet).
18. Audit surface — "a dedicated searchable log/audit surface distinct from inline chat cards" (`L187`); a separate view, not the panel list.
19. Full attribution packet, `truncation_state` / gap rendering (`L181`), instrumentation lifecycle (`L189`).
20. Provider-native detail: `provider_entry_id`, `account_profile_ref`, `media_route_id`, `permission_snapshot_id` (RAP-032 `L432`).

## 7. Command list

**Wired in the catalog (2):** `Plans/UI_Command_Catalog.md:L1133-L1140`
- `cmd.artifacts.show_in_usage` — `{ project_id, route_target, open_subject, artifact_id?, usage_event_ref?, usage_record_id?, provider_attempt_ref?, attempt_id?, node_id?, tool_call_id?, trace_ref?, receipt_refs[]?, raw_payload_ref?, run_id?, thread_id? }`; `route_target.object_kind = usage_event` required when `usage_event_ref` exists.
- `cmd.artifacts.show_in_ledger` — same shape plus `ledger_ref?`.

Both are `navigation_wrapper` commands over canonical route targeting, not layout toggles (`UI_Command_Catalog.md:L121, L467`). `cmd.panel.switch` is a shell/view selector and **must not** be used for row activation (`L279`).

**Required by the owner doc, no catalog entry — proposed ids:**

| Proposed id | Requirement | Cite |
|---|---|---|
| `cmd.artifacts.show` | reveal/focus the panel (every peer surface has one, e.g. `cmd.search.show`) | `UI_Command_Catalog.md:L1147` by analogy |
| `cmd.artifacts.open` | identity-native row activation → `OpenSubject`/`OpenArtifact`/`generated://<artifact_id>` | `L310`, RAP-008 `L547`, RAP-019 `L613` |
| `cmd.artifacts.preview` | demand-loaded preview, metadata-first | `L312` |
| `cmd.artifacts.set_preview_mode` | Curated vs Raw; `preview mode` is persisted with no command to set it | RAP-044 `L1952`; `FinalGUISpec.md:L2312` |
| `cmd.artifacts.filter` | filter-first at scale; family/kind/role | `FinalGUISpec.md:L723` |
| `cmd.artifacts.load_older` | `initial_window` / `page_size` / `max_live_rows` / load-older | `FinalGUISpec.md:L723`; `L312` |
| `cmd.artifacts.expand_group` / `.collapse_group` | expanded groups persisted, no command | `FinalGUISpec.md:L2312` |
| `cmd.artifacts.set_compare_target` / `cmd.artifacts.compare` | compare target persisted, no command | `FinalGUISpec.md:L2312` |
| `cmd.artifacts.export` | record / bundle / view export classes + manifest (`export_id`, `export_kind`, project scope, included ids, trust-state disclosure) | RAP-014 `L583`, `L242-L248` |
| `cmd.artifacts.export_investigation` | writes `runtime_artifact.document` + `debug.investigation.exported` | `L237` |
| `cmd.artifacts.import_bundle` | creates an `imported_bundle` target, preserves provenance | `L239` |
| `cmd.artifacts.open_browser_evidence` / `cmd.artifacts.watch_recording` | Open / Watch / Focus Browser route back to the owning browser session | `L330-L335`, RAP-021 `L625` |
| `cmd.artifacts.open_sources` | `api_web_call` sources / citations drill | `runtime_artifact_api_web_call.schema.json` (`sources_ref`, `citation_refs`) |
| `cmd.artifacts.refresh` | viewer mode is a "frozen, manually refreshable read snapshot" | `L2056` |
| `cmd.artifacts.retry_storage` | "Retry storage" is named as an owner admission probe, no id | `L2058` |
| `cmd.artifacts.show_in_source_control` | `Open in Source Control` is named as a context-changing artifact action; only `cmd.orchestrator.open_in_source_control` exists | `L104`; `UI_Command_Catalog.md:L467` |
| (boundary) branch-from-restore-point | `restore_point.actions.branch` — likely Assistant Chat-owned, not artifacts; do not mint an artifacts id without owner agreement | `L2048` |

## 8. Row anatomy

Text budget at 12px UI font (≈6.2px/char), after panel padding (2×10) and row padding (2×8): **240px → ~33 chars/line; 380px → ~55; 480px → ~71.**

Worst realistic identity strings:

| Kind | Identity string | Chars | Fits 240 (33)? |
|---|---|---|---|
| `browser_recording` | `seriouseats.com/engineering/quantity-parsing` | 44 | no |
| `api_web_call` | `schema.org Recipe markup coverage 2026` | 38 | no |
| `restore_point` | `rp:proj-tastebook:2026-07-24T09:11:52Z` | 38 | no |
| `hitl_approval` | `Approve: write .github/workflows/ci.yml` | 39 | no |
| `subagent_lineage` | `researcher > extractor > validator` | 34 | no |
| `validation_test` | `cargo test -p import-worker --lib` | 33 | exactly |
| `tool_llm_trace` | `trace-run-8821-att-3-llm-0417` | 29 | yes |
| `code_diff` | `Import quantity parser fix` | 26 | yes |
| `screenshot` | `Recipe editor upload flow` | 25 | yes |
| `cost_usage` | `claude-opus-4-6-20260514` | 24 | yes |
| `code_diff` (path form) | `src/services/import.rs` | 22 | yes |

Kind tokens, which is where the current design fails: `before_after_snapshot` 21, `suggested_next_steps` 20, `implementation_plan` 19, `reasoning_summary` 17, `browser_recording` 17, `subagent_lineage` 16, `context_snapshot` 16, `artifact_version` 16, `validation_test` 15, `failed_attempts` 15, `tool_llm_trace` 14, `hitl_approval` 13, `restore_point` 13, `api_web_call` 12, `cost_usage` 10, `screenshot` 10, `code_diff` 9, `evidence` 8, `document` 8. **A 21-char chip at ~6.2px/char plus 12px padding is ~143px — 65% of the 220px content width at 240px, before the label gets a single pixel.** That is the truncation bug's root cause, not the `flex:none` on the chips.

Available metadata, per the current concept (`PMConcept7.html:15728, 15734, 15747, 15759`): `no fallback · 2 files · node n-19 · 6m ago` = 42 chars; `cmd.chat.web.search · provider model-native · no fallback · cache miss · 5 sources (3 read)` = 89 chars; `retry 2 of 2 · 214 cases · lane-b · 5m ago` = 42 chars. The 89-char run needs 3 lines at 240px. `cmd.chat.web.search` alone is 19 chars — over half a line.

**Droppable, in order:** (1) provider/adapter prose ("provider model-native", "no fallback" when false is the default), (2) counts other than the primary one, (3) lane/worktree, (4) command id, (5) node id, (6) cache state. **Never droppable:** relative time, the single state chip, the kind indicator, and any redaction/expiry/blocked marker.

Recommended grammar: **line 1** = `[kind glyph or 3-letter code] identity ……… [state]` with the identity as the only `flex:1 min-width:0` element and the state chip capped at 8 characters; **line 2** (380px+) = at most two metadata atoms plus relative time. The kind must become a glyph + tooltip below 360px — this matches `FinalGUISpec.md:L2084-L2089`, where 280–359px is already "icons only (tooltip on hover)" and 240px is "all extras behind overflow menu".

## 9. Redaction, expiry, and blocked states

- **Generated media expiry** (RAP-033 `L475`): media artifacts project provider receipt metadata, hashes, durable local refs, **original provider URL refs, and expiry warnings**; MiniMax Image-01 URL outputs require 24-hour expiry disclosure; OpenAI/Codex Images 2 requires account/route distinction and C2PA/SynthID caveats. A media row therefore needs a persistent expiry indicator with a real clock, not a generic status chip.
- **Redaction**: `redaction_profile_id` on `browser_recording`; `raw_payload.redaction_status` on `tool_llm_trace`; `redaction_profile ∈ no_secrets|redacted_refs_only` and `contains_raw_secrets` on `restore_point`. §4C `L179`: secret material is redacted by policy and "non-secret operational metadata is still masked or omitted when it can expose account, host, path, provider, or workspace context outside the selected export profile." Raw view must never expose raw secrets, account identifiers, credentials, or local paths (RAP-044 `L1952`). Redacted-field counts stay visible — `2 fields redacted` in `PMConcept7.html:15759` is the right instinct.
- **Stale vs degraded are orthogonal** (`L2037-L2042`): "A projection rebuilt to the current survivor checkpoint may be `projection_freshness = current` while remaining `projection_health = degraded` because canonical history has a proven or possible hole." Two independent signals; do not collapse them into one badge. Gap rendering distinguishes unacknowledged tail, exact event, exact byte range, bounded sequence range, and unknown segment remainder. "Runtime Artifacts never infers lost identity from timestamps or from its rebuildable index."
- **Evicted / missing index rows** degrade to record-backed views rather than implying artifact loss (`L314`, RAP-020 `L619`). A missing row is never an empty row.
- **Expired restore points** (`L2048`): "Expired, deleted, corrupt, stale-hash, permission-denied, viewer, and blocked states remain browsable with their exact unavailable reason and no enabled apply route." Browsable + reason + disabled action, never hidden.
- **Viewer / read-only mode** (`L2056`): in lock-conflict viewer mode the panel is a frozen manually refreshable snapshot; mutations "remain discoverable where useful but disabled with `storage_read_only`". `root_mismatch`, `root_unavailable`, or `fallback_diverged` "yields the owner viewer/blocked posture and never an apparently empty artifact list."
- **Permission denial** (`L2060`) consumes `{blocked_family, blocked_reason_code, allowed_action_ids[], permission_snapshot_id?, approval_scope_key?, executed:false}` and must not collapse denial, approval-required, storage-read-only, integrity-block, and preflight-drift into a generic failure. Five distinct blocked presentations, minimum.
- **`dedupe_unavailable`** (`L2035`): no persisted append succeeded — the panel "must not show a durable artifact, receipt, or success row."
- **Recovery-unavailable anchors** (`L424-L426`): shown with preserved-work state and ordered `allowed_action_ids[]`; ordinary restore/retry must not be offered while the anchor is recovery-unavailable.

## 10. Minimum viable 240px surface

One filter row of family chips (icon-only, horizontally scrollable, 24px tall per `FinalGUISpec.md:L2145`). Then a virtualized list of two-line rows:

```
[icon] Import quantity parser fix       6m
[icon] cargo test -p import-worker   ! 5m
```

Line 1: 16px kind glyph (tooltip = full `artifact_type`), identity at `flex:1 min-width:0` with a single trailing ellipsis, relative time right-aligned at fixed 3ch. Line 2 exists only when a non-default state applies: one chip, max 8 chars, drawn from kind-native status, else `projection_health` when degraded/unavailable, else redaction/expiry/blocked marker. Investigation bundles render as a collapsible group whose header is `[inv] target_summary` + member count, with members indented and led by their 6-value `evidence_role`.

Everything else — metadata, previews, Curated/Raw, bridge fields, export, compare, Sources/Open/Watch — moves to the row's overflow menu and the detail sheet. This is exactly the `FinalGUISpec.md:L2089` mandate for 240px: "Mode icons, messages, input only; all extras behind overflow menu."

Cut ruthlessly at 240px: the kind text chip, the preview line, the metadata line, all inline buttons, the provenance line (`PMConcept7.html:15748`), and every count except one.

## 11. The three hardest layout constraints

1. **The kind token is the longest guaranteed string and the least informative.** `before_after_snapshot` (21 chars, ~143px as a chip) versus `code_diff` (9). Nineteen kinds cannot share a fixed-width chip slot without either truncating the type — which destroys the one field that is always present and always meaningful — or starving the label, which is what happens today. Only a glyph/short-code mapping resolves it, and that mapping must be memorable across 19 values.
2. **There is no `title`.** `summary` is optional and unbounded; 14 of 19 kinds have no payload contract from which to derive a label. The panel must synthesize a per-kind label from whatever the strict schemas do provide (`operation_input`, `browser_session_id`, `trace_ref`, `restore_point_id`, `usage_event_ref`) and fall back to a truncated `artifact_id` for the rest — meaning the identity line is a *computed* field with 19 branches, not a data field.
3. **Two orthogonal state axes plus five distinct blocked presentations, in one chip slot.** `projection_freshness` × `projection_health` must not collapse (`L2042`), redaction/expiry/hold are independent again, and permission denial has five non-interchangeable reasons (`L2060`). At 240px there is room for exactly one indicator. Deciding the precedence order — blocked > expired > degraded > redacted > kind-native status > nothing — is a spec-level decision the owner doc does not make.

## 12. Open questions and spec gaps

1. **14 of 19 per-type schemas do not constrain `type_payload`** (`{"type":"object","minProperties":1}`), while `L298` states the schema files "must enforce the required per-type payload fields directly rather than allowing arbitrary non-empty `type_payload` objects." Only `cost_usage`, `tool_llm_trace`, `api_web_call`, `browser_recording`, and `restore_point` comply (RAP-043 `L1838` covers the first two only). Every unlisted kind's row metadata is therefore undesignable from spec.
2. **`retention_class` enum conflict.** Envelope schema: `ephemeral | session | project | governed | debug_retained`. §4C prose (`L174-L177`): `durable | session_bounded | ephemeral_view`. Two incompatible vocabularies for a required field.
3. **Investigation grouping fields are unrepresentable.** `investigation_id`, `instrumentation_id`, `evidence_role`, `verification_strength` are required by `L200-L204` but absent from an `additionalProperties: false` envelope.
4. **No `generated_media` artifact type** despite RAP-032/RAP-033 requiring media receipt and expiry projection.
5. **`artifact_panel_state.v1` omits filter state** (`FinalGUISpec.md:L2312` lists only expanded groups, selected artifact, compare target, preview mode) while `FinalGUISpec.md:L723` mandates filter-first behavior at scale. Also unspecified: `initial_window`, `page_size`, `max_live_rows`, `max_in_memory_rows` for this panel specifically.
6. **UCC-018 (`UI_Command_Catalog.md:L2129`) named gaps.** "gap-003 artifact drill-through commands route through Usage and the shared route/open contract; old tool-summary payloads such as `tool_name`, `invocation_summary`, `options`, and `No remaining gaps` remain source-lineage only." `UI_Command_Catalog.md:L185` adds that the tuple `{ tool_name, invocation_summary, options }`, standalone `invocation_summary`, and the conclusion "No remaining gaps" are source-lineage only, not active payload canon — so any row affordance built on a tool-summary payload is stale by construction.
7. **`L108-L124` self-reported panel gaps** (owner doc's own list): "`attempt_id` is still absent from the canonical artifact ID set, producer identity is anonymous at the envelope boundary, `subagent_lineage` still has no minimum payload semantics, `cost_usage` drill-through still rests on optional `usage_event_ref`." Items 1 and 4 are now fixed in the schema files (`attempt_id` required except `restore_point`; `usage_event_ref` required on `cost_usage`); items 2 and 3 remain open — `producer_ref`/`actor_ref` are optional and untyped, and `subagent_lineage` has no payload contract, which is precisely the kind whose row needs a lineage string.
8. **No section heading exists** for `validation artifact lineage`, `bridge-field viewer`, or `validation/report section` in the consumer docs (`L54`) — the bridge-field viewer is specified at `L389-L397` but has no consumer surface contract.
9. **`usage_event_ref` format is undefined.** `L107` calls it "locator-grade" and stable for the referenced record's lifetime; `storage-plan.md` "still never defines its concrete format or stability semantics" (`L109` of this doc). A row cannot budget characters for a field with no format.
10. **Status precedence is unspecified** (see §11.3), as is the abbreviation mapping for 19 kind tokens.
11. **`cmd.artifacts.*` has 2 entries and needs ~17** (§7). Notably there is no command for the panel's own reveal, open, filter, paging, or export — the three P2 export classes of RAP-014 have no command surface at all.
