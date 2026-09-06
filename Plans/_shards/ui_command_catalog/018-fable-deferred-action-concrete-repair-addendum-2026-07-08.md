# Shard 018: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/UI_Command_Catalog.md`

Source lines: L8207-L8243

Source SHA256: `48f2f431bc886525e5510bb8e41fad60dbbf4147bb6d4ee78cee4261da7f608d`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime UI command catalog rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-ddc264cdea296caf349adecd`: active semantic-command rows UCC-049 through UCC-105 inherit the strict schema overlay below. Each active row exposes `command_id`, `payload_required`, `payload_optional`, `result_fields`, `error_codes`, `disabled_reason_codes`, and `owner_doc_ref` either through a concrete current `cmd.*` token in its preserved tokens or through the owner-referenced family schema named in the overlay. Rows with prose-only or slash-token source lineage are implementation-ready only through that owner reference, not as free-form handler text. UCC-106 is now an explicit lineage exclusion: its eleven retained `cmd.onboarding.*` command-era tokens are not active commands or aliases; its separate eight packet candidates are rejected as commands, aliases, and handlers; and its current thirteen `ui.onboarding.*` tokens are typed local UI actions rather than command-schema rows.
- Repairs `sfk-ed92df2325332306b2463b50`: browser production command IDs keep `cmd.browser.share_with_agent` and `cmd.browser.revoke_share_with_agent`; `cmd.browser.run_code`, `cmd.browser.evaluate`, legacy `browser_run_code`, and legacy `browser_evaluate` are compatibility-only diagnostic/page-evaluation lineage, not default production browser commands.

### UCC-049 through UCC-105 strict schema overlay and UCC-106 lineage exclusion

This overlay is the owner reference for every active command row from UCC-049 through UCC-105. It keeps the catalog as the command-ID SSOT while avoiding duplicated payload tables. Implementers MUST resolve each active row through the row range below, then through the row's concrete current `cmd.*` tokens or compatibility notes. UCC-106 does not inherit this command schema; its retained command-era tokens and current typed local actions have the closed disposition stated in the final row below.

Common fields for every covered row:

- `command_id`: every concrete current `cmd.*` token in the row's `preserved_exact_tokens`, except a token expressly marked retired, source-lineage-only, or non-alias in `compatibility_only_notes` or `stale_retired_dispositions`; grouped or wildcard tokens are family aliases and must normalize to a concrete active `cmd.*` row before dispatch.
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
| `UCC-101` through `UCC-105` | Vision bridge, Teach, notification/sound, DRY settings, and containerized-host command families in this catalog. UCC-103 expressly excludes retired non-alias `cmd.settings.open_notifications`; current Notifications navigation uses `cmd.settings.open`. | `image_ref?`, `teach_session_id?`, `notification_destination_id?`, `sound_asset_id?`, `settings_key?`, `host_capability_ref?`, and `host_profile_id?` for the concrete current command. |
| `UCC-106` | Product Onboarding is owned by `Plans/Planning_Wizard.md` PWIZ-021 through PWIZ-023. Its eleven command-era `cmd.onboarding.*` identifiers are retained source lineage only, its separate eight packet candidate tokens are rejected as commands/aliases/handlers, and its thirteen `ui.onboarding.*` identifiers are typed owner-local UI actions. | Not applicable: no Onboarding command schema, alias, primary handler, or production-wiring row. Owner-launch actions carry the Planning Wizard-owned typed route or intent to the target owner's existing command; local action requests/results use `pm.product_onboarding.action_request.v1` and `pm.product_onboarding.action_result.v1`. |

Compatibility-only and retired source tokens in these rows remain searchable lineage. They do not become command IDs unless the row's `command_id` rule maps them to a concrete active `cmd.*` value or an explicit `alias_of_command_id`; tokens expressly marked non-alias never normalize or dispatch.
