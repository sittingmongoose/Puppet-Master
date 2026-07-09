# Shard 018: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/UI_Command_Catalog.md`

Source lines: L8081-L8116

Source SHA256: `1dec6392b73b4f06b7dd292309d2915004316a0455275e6b9c5ac07d57803b48`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime UI command catalog rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-ddc264cdea296caf349adecd`: UCC-049 through UCC-106 now inherit the strict schema overlay below. Each row exposes `command_id`, `payload_required`, `payload_optional`, `result_fields`, `error_codes`, `disabled_reason_codes`, and `owner_doc_ref` either through a concrete `cmd.*` token in its preserved tokens or through the owner-referenced family schema named in the overlay. Rows with prose-only or slash-token source lineage are implementation-ready only through that owner reference, not as free-form handler text.
- Repairs `sfk-ed92df2325332306b2463b50`: browser production command IDs are `cmd.browser.share_with_agent`, `cmd.browser.revoke_share_with_agent`, `cmd.browser.run_code`, and `cmd.browser.evaluate`. Legacy `browser_run_code` and `browser_evaluate` are compatibility aliases only.

### UCC-049 through UCC-106 strict schema overlay

This overlay is the owner reference for every command row from UCC-049 through UCC-106. It keeps the catalog as the command-ID SSOT while avoiding 58 duplicated payload tables. Implementers MUST resolve each row through the row range below, then through the row's concrete `cmd.*` tokens or compatibility alias notes.

Common fields for every covered row:

- `command_id`: every concrete `cmd.*` token in the row's `preserved_exact_tokens`; grouped or wildcard tokens are family aliases and must normalize to a concrete `cmd.*` row before dispatch.
- `payload_required`: `dispatch_id`, `command_id`, `source_surface`, `actor_ref`, and the row-specific identity listed below.
- `payload_optional`: `route_target?`, `OpenSubject?`, `project_id?`, `repo_id?`, `worktree_id?`, `run_id?`, `attempt_id?`, `node_id?`, `thread_id?`, `usage_event_ref?`, `usage_record_id?`, `provider_attempt_ref?`, `tool_call_id?`, `trace_ref?`, `receipt_ref?`, `receipt_refs[]?`, `raw_payload_ref?`, `query_session_id?`, `selection_ref?`, `confirmation_ref?`, `idempotency_key?`, and family-specific refs allowed by the owner row.
- `result_fields`: the shared `UICommandResponse` envelope fields `schema_version`, `dispatch_id`, `command_id`, `ack_status`, `result_status?`, `error?`, `event_refs[]?`, `receipt_ref?`, and `ts`.
- `error_codes`: closed to `invalid_route`, `unknown_command`, `invalid_args`, `permission_denied`, `blocked_state_required`, `stale_projection`, `handler_unavailable`, and `internal_error`; family owners may narrow but not expand this set without a new owner-doc row.
- `disabled_reason_codes`: closed to `unsupported`, `not_configured`, `unauthorized`, `unreachable`, `degraded`, `partial_capability`, `blocked_state_required`, `stale_projection`, and `permission_required`.
- `owner_doc_ref`: this document plus the family owner named below; no handler may invent unowned payload keys or fabricate `*.command_applied` events.

| Rows | Family owner reference | Row-specific required identity |
|---|---|---|
| `UCC-049` through `UCC-053` | Docker and Kubernetes command families in this catalog; storage and capability details remain with `Plans/FinalGUISpec.md`, `Plans/Wiring_Matrix.md`, `Plans/storage-plan.md`, and `Plans/Tools.md` ContractRefs already carried by the rows. | `container_ref?`, `image_ref?`, `compose_project_ref?`, `kubernetes_context?`, `namespace?`, and `capability_snapshot_ref` for mutating or capability-gated actions. |
| `UCC-054` through `UCC-055` | Project-scope worktree command family in this catalog. | `repo_id`, `worktree_id?`, `branch_ref?`, `safe_point_id?`, and `worktree_lifecycle_state` when mutating worktree state. |
| `UCC-056` through `UCC-060` | Assistant chat, context lens, thread worktree, and context-detail command families in this catalog. | `thread_id` plus `message_id?`, `context_lens_mode?`, `worktree_id?`, `usage_detail_ref?`, or `context_projection_ref?` according to the concrete command. |
| `UCC-061` through `UCC-065` | Browser and preview command family in this catalog. | `browser_session_id?`, `preview_subject_ref?`, `selection_ref?`, `screenshot_ref?`, and `agent_share_scope?` for capture/share/takeover commands. |
| `UCC-066` through `UCC-072` | Terminal and dev-session command families in this catalog. | `terminal_session_id?`, `pane_id?`, `dev_session_id?`, `command_ref?`, and `layout_target?` for focus, rerun, split, reveal, and recovery commands. |
| `UCC-073` through `UCC-076` | Chat message, code-block, rewind/revert, and activity-dimension command families in this catalog. | `thread_id`, `message_id?`, `code_block_id?`, `checkpoint_ref?`, and `activity_dimension?` for the concrete action. |
| `UCC-077` through `UCC-083` | Debug, web/slash dispatcher, web activity, reserved slash alias, and route-mapping command families in this catalog. | `thread_id`, `debug_session_id?`, `web_operation_id?`, `slash_command_id?`, `route_target?`, and `provider_route_ref?`; retired slash labels must normalize before dispatch. |
| `UCC-084` through `UCC-088` | Memory, artifact side-panel, and search command families in this catalog. | `memory_item_id?`, `artifact_id?`, `ledger_ref?`, `query_session_id?`, `replacement?`, and `index_scope?` as required by the concrete command. |
| `UCC-089` through `UCC-095` | Runtime recovery command family in this catalog. | `run_id`, `blocked_sequence`, `allowed_action_id`, `node_id?`, `attempt_id?`, `safe_point_id?`, `baseline_ref?`, and `permission_carry_ref?`; pre-attempt blocked rows MUST NOT fabricate an `attempt_id`. |
| `UCC-096` through `UCC-100` | Goal, Planning Wizard, Plan Compile, discovery-routed search, and history wrapper command families in this catalog. | `goal_id?`, `thread_id?`, `planning_session_id?`, `plan_pack_ref?`, `plan_compile_run_id?`, `history_query_ref?`, and `target_identity_ref?` for the concrete command. |
| `UCC-101` through `UCC-106` | Vision bridge, Teach, notification/sound, DRY settings, containerized host, and onboarding command families in this catalog. | `image_ref?`, `teach_session_id?`, `notification_destination_id?`, `sound_asset_id?`, `settings_key?`, `host_capability_ref?`, `host_profile_id?`, and `onboarding_step_id?` for the concrete command. |

Compatibility-only source tokens in these rows remain searchable lineage. They do not become command IDs until the row's `command_id` rule maps them to a concrete `cmd.*` value or to an explicit `alias_of_command_id`.
