# DM — small owners, 2026-11-04

Branch: `plans/ea-w2-small-owners-20261104`. Base: `be4766513ff71776346fc73b84f2542990f955af`. Nas1 `ubuntu-agent-nas1`; initial available memory 9 GiB. Eight prepared drafts, two owner questions, no exclusions or admissions. **The eight drafts are not admission-ready depth PASSes:** the oracle criterion is PARTIAL. Membership remains ABSENT in every row.

| Row | Outcome | Self-grade | Retention |
|---|---|---|---|
| `format.applied` | register_prepared_draft | 9 PASS, 2 PARTIAL, 1 ABSENT | PENDING_RETENTION_DECISION |
| `git.clone.completed` | register_prepared_draft | 9 PASS, 2 PARTIAL, 1 ABSENT | PENDING_RETENTION_DECISION |
| `lsp.server.lifecycle_changed` | register_prepared_draft | 9 PASS, 2 PARTIAL, 1 ABSENT | PENDING_RETENTION_DECISION |
| `model.catalog_refreshed` | register_prepared_draft | 9 PASS, 2 PARTIAL, 1 ABSENT | PENDING_RETENTION_DECISION |
| `project.added` | register_prepared_draft | 9 PASS, 2 PARTIAL, 1 ABSENT | PENDING_RETENTION_DECISION |
| `project.created` | register_prepared_draft | 9 PASS, 2 PARTIAL, 1 ABSENT | PENDING_RETENTION_DECISION |
| `settings.theme.updated` | blocked_on_Jared | 7 PARTIAL, 5 ABSENT | PENDING_RETENTION_DECISION |
| `settings.updated` | blocked_on_Jared | 7 PARTIAL, 5 ABSENT | PENDING_RETENTION_DECISION |
| `subagent.context_rehydrated` | register_prepared_draft | 10 PASS, 1 PARTIAL, 1 ABSENT | RP-RUNTIME-365D |
| `subagent.context_shrunk` | register_prepared_draft | 10 PASS, 1 PARTIAL, 1 ABSENT | RP-RUNTIME-365D |

## Current-canon reconciliation and premise checks

- DL-045 still lists all ten exact names and still permits only technical binding for already specified behavior (Decision_Log lines 562–609). Search and bounded negative evidence are per family in DM-search.json, captured before authoring.
- Project_System section 2 requires atomic identity/config/permission/handoff/readback before listing. Current commands/results allow future event admission rather than prohibit it. PJCT-072 binds project.added to completed existing-content registration; PJCT-073 binds project.created to completed new-local/approved forge creation. Neither event creates a Project, bypasses permission, treats a remote create as listed success, or replaces an existing receipt. Backup consumer `expected_event_types=[]` stays unchanged pending actual admission. The historical catalog tokens alone were not treated as producer evidence.
- Source_Control_System lines 386–388 specify sole ordinary Git clone cmd.source_control.repository.clone and disjoint Jujutsu clone. SCS-085 applies the old git.clone.completed token only to verified succeeded ordinary Git completion with its original terminal receipt; registration remains a later Project operation. The old cmd.git.clone premise is superseded and was not applied.
- DL-041 selected settings.updated and preserves the exact default-guard key. Settings_System line 2312 confirms that naming premise still holds, but explicitly says key-to-inventory/writer mapping remains unproved and grants no EventRecord. No alias to memory.assembly.dry-method-guard was authored. DL-300 admits settings.layer.changed only; neither older Settings token is thereby admitted, aliased or excluded. These are the two held rows, with exact questions below.
- DL-076 nine-field durable token remains explicit in current SP-278. SP-286 now includes SP-336/SP-347 durable group-frame custody; the new contracts adopt that current rule and CV-339 full-value v2 rather than restating an obsolete per-event sync rule.
- Case L-3 assigns Runtime/run/node/attempt to 365 days; both child-context rows are runtime evidence. Formatting, LSP, model refresh, Project and clone roles have competing runtime/operational/authority candidates, cited to Case L-3, so RT must decide them. Unknown-policy indefinite is not treated as completion.

## Newly authored bindings

Each row below owns its own schema, adapter, SHA-256 identity recipe, exact operating-reader version, replay/custody/withdrawal text and oracle obligations. These are newly authored owner contracts under DL-045, not pre-existing evidence. No binding is inferred from a sibling.

- `format.applied`: FS-075, CV-620, SP-600; `Plans/event_payloads/format_applied.schema.json`; original operation identity plus real scope/storage instance; named operating reader in these units. Search: DM-search.json exact row, all live top-level owner/Contracts/Storage/catalog/registry/decision JSON/Markdown. No full exact-family contract was found. SP-278 generic projector/reader/checkpoint and SP-286/CV-339 original receipts are reused. Operating reader: `reader.evidence.format_applied@1.0.0`.
- `lsp.server.lifecycle_changed`: LSPS-173, CV-621, SP-601; `Plans/event_payloads/lsp_server_lifecycle_changed.schema.json`; original operation identity plus real scope/storage instance; named operating reader in these units. Search: DM-search.json exact row, all live top-level owner/Contracts/Storage/catalog/registry/decision JSON/Markdown. No full exact-family contract was found. SP-278 generic projector/reader/checkpoint and SP-286/CV-339 original receipts are reused. Operating reader: `reader.lsp.lifecycle@1.0.0`.
- `model.catalog_refreshed`: MS-199, CV-622, SP-602; `Plans/event_payloads/model_catalog_refreshed.schema.json`; original operation identity plus real scope/storage instance; named operating reader in these units. Search: DM-search.json exact row, all live top-level owner/Contracts/Storage/catalog/registry/decision JSON/Markdown. No full exact-family contract was found. SP-278 generic projector/reader/checkpoint and SP-286/CV-339 original receipts are reused. Operating reader: `reader.models.catalog_refresh@1.0.0`.
- `subagent.context_rehydrated`: PP-151, CV-623, SP-603; `Plans/event_payloads/subagent_context_rehydrated.schema.json`; original operation identity plus real scope/storage instance; named operating reader in these units. Search: DM-search.json exact row, all live top-level owner/Contracts/Storage/catalog/registry/decision JSON/Markdown. No full exact-family contract was found. SP-278 generic projector/reader/checkpoint and SP-286/CV-339 original receipts are reused. Operating reader: `reader.context.rehydrated@1.0.0`.
- `subagent.context_shrunk`: PP-152, CV-624, SP-604; `Plans/event_payloads/subagent_context_shrunk.schema.json`; original operation identity plus real scope/storage instance; named operating reader in these units. Search: DM-search.json exact row, all live top-level owner/Contracts/Storage/catalog/registry/decision JSON/Markdown. No full exact-family contract was found. SP-278 generic projector/reader/checkpoint and SP-286/CV-339 original receipts are reused. Operating reader: `reader.context.shrunk@1.0.0`.
- `project.added`: PJCT-072, CV-625, SP-605; `Plans/event_payloads/project_added.schema.json`; original operation identity plus real scope/storage instance; named operating reader in these units. Search: DM-search.json exact row, all live top-level owner/Contracts/Storage/catalog/registry/decision JSON/Markdown. No full exact-family contract was found. SP-278 generic projector/reader/checkpoint and SP-286/CV-339 original receipts are reused. Operating reader: `reader.project.added@1.0.0`.
- `project.created`: PJCT-073, CV-626, SP-606; `Plans/event_payloads/project_created.schema.json`; original operation identity plus real scope/storage instance; named operating reader in these units. Search: DM-search.json exact row, all live top-level owner/Contracts/Storage/catalog/registry/decision JSON/Markdown. No full exact-family contract was found. SP-278 generic projector/reader/checkpoint and SP-286/CV-339 original receipts are reused. Operating reader: `reader.project.created@1.0.0`.
- `git.clone.completed`: SCS-085, CV-627, SP-607; `Plans/event_payloads/git_clone_completed.schema.json`; original operation identity plus real scope/storage instance; named operating reader in these units. Search: DM-search.json exact row, all live top-level owner/Contracts/Storage/catalog/registry/decision JSON/Markdown. No full exact-family contract was found. SP-278 generic projector/reader/checkpoint and SP-286/CV-339 original receipts are reused. Operating reader: `reader.scm.git_clone_completed@1.0.0`.

All operating readers are passive with no own persisted progress. Their explicit checkpoint answer is the existing generic EventRecord index root and closed value schema under SP-278; no family-specific projection, journal, cursor, key or physical stored family was introduced. Therefore storage_value_registry.json needs no new row and is unchanged. Producer original intent/result and refs remain under their existing owner, and failure to preserve them prevents activation rather than creates a new journal. Exact body/schema/identity and permission checks remain mandatory before publication or disclosure.

## Shared-file hunks and ids

Append-only owner units: FS-075; LSPS-173; MS-199; PP-151/152; PJCT-072/073; SCS-085. These start 60 above each owner's main maximum (15/113/139/91/12/25). Main and all 475 origin refs were checked for collision; none found. The slow first scan's final local maximum includes the new units, so the main maxima above are the pre-edit ones.

Shared files: Contracts_V0 appends CV-620..627; storage-plan appends SP-600..607; Automated_Testing_System appends ATS-300..304 plus three independent exact-family supplements after ATS-304. Existing rows are neither reordered nor reflowed. Schemas and fixtures are new companions. Derived shards/index are generated only by repo scripts. No owner IDs outside these ranges are used; SP-608/609 and CV-628/629 remain unused.

## Questions for Jared

- **settings.theme.updated:** Does the retained cmd.theme.* exact-event requirement survive as a distinct settings.theme.updated family beside the current atomic theme-pair Settings transactions and admitted settings.layer.changed, or should the old requirement receive an explicit historical-only/alias disposition? No alias or duplicate emission is inferred.
- **settings.updated:** How should the retained settings.updated obligations (including memory auto-save and the DL-041 default guard) relate to current settings.layer.changed, given SSYS-060/SP-348 leave settings.updated owner_contract_missing? DL-041 already decides the spelling; this asks only for resolution of the competing owner obligations, not a new naming answer. The guard stays disabled until its exact key-to-valid-setting-ID and writer mapping is established.

## Verification and limitations

Check exits and top-level index status are recorded in DM-checks.json. The schema/semantic checker includes each family's own required-field/unknown-field/version/timestamp negatives, scope-separated identity, per-family producer-witness boundaries, lost-ack/conflicting-semantics retry and read-token/permission/source-loss/withdrawal/version fences. It is a synthetic static contract check. It does not exercise native writer state, real durability/CAS/restore, or complete envelope/admission/original-intent withdrawal matrices; those gaps keep positive_negative_oracles PARTIAL. Native obligations remain NOT_RUN.

The prescribed memory files pm-plan-id-allocation.md and pm-index-needs-currentness-edition.md were absent at the exact supplied paths; bounded home searches found no replacement. The explicit lane allocation and currentness-copy instructions were followed directly. The ignored currentness edition was copied from the shared checkout and all 15 file SHA-256 digests matched before index generation (external currentness-copy.json).

No main push, landing lock, reseal, pm-mail, subagent, event registry append, admission record, Decision Log answer or frozen-validator edit. Forbidden paths remain unchanged. Worktree is left for the lead after branch push.

Raw check outputs and report copy: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/. Checks/evidence hashes are in DM-checks.json. No temporary browser/server was started.

Existing test discovery: exact-family searches over scripts/ and tests/ found no pre-existing checker for these ten rows. No tests/ file was edited; new fixtures live under Plans/ and the checker lives under scripts/.
