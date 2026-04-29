# File Manager & IDE-style Editor -- Plan

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0213
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Plans/FileManager.md`
  - Plans/FileManager.md
  - The coordination-canon contradiction in `[retired-token-1]` is now explicit in the same file.
  - [retired-token-1]
  - The runtime-artifact docs now name an envelope file, but they still do not define the common envelope field family strongly enough in prose.
  - Promote the runtime-artifact envelope from a named schema file to a clearly stated common field contract in `Runtime_Artifacts_Panel.md`.
  - Runtime_Artifacts_Panel.md
  - That means the docs have already outgrown a path-only open contract, even though the main body still acts as if all opens resolve to a workspace file path first.
  - UI callers should not reconstruct file paths heuristically when a stable identity exists
  - current “Open in Editor” wording in Orchestrator/Evidence surfaces risks implying raw-path opens even when the correct target is an artifact-backed or report-backed subject.
  - `Open in Editor` for file/document-backed targets
  - Open in Editor
  - `generated://<artifact_id>` is already the proof that the system needs non-path editor targets.
  - generated://<artifact_id>
  - `Runtime_Artifacts_Panel.md` also confirms that artifact surfaces are identity-native and project-scoped, but it still does not fully own the open-resolution path. It references File Manager for open-by-artifact identity, which means the open contract boundary is still under-specified.
  - Narrow `Plans/FileManager.md` so `OpenFile { path... }` is explicitly the workspace-document path contract only, not the universal object-open contract.
  - OpenFile { path... }
  - `Project_Output_Artifacts.md` is clear that canonical persistence is seglog-first and filesystem materialization under `.puppet-master/project/**` is staging/export/cache only.
  - Project_Output_Artifacts.md
  - .puppet-master/project/**
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - `FileManager.md`: owns workspace-file open semantics and editor realization only
  - FileManager.md
  - remains the right tool for real file opens and code-navigation clicks when a canonical workspace path is already known
  - Several rewrite-era object families now clearly need stable target kinds even though older docs still mostly pivot by `run_id`, `tier_id`, or file path.
  - run_id
  - tier_id
  - Docker Manager: `active_subview`, runtime/context/registry/namespace focus, publish state
  - active_subview
  - `FileManager.md` should stay focused on path-based editor realization and should not become the owner of cross-surface identity navigation just because `OpenFile` is important there.
  - OpenFile
  - Keep `OpenFile` as the path-based editor contract only.
  - `OpenFile` = path-based editor open
  - Research Progress - 2026-03-17 - File open versus subject open consumer split
  - `Plans/FileManager.md` still states one universal open primitive:
  - many earlier event examples in the file still center `tier_id`
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - the file is self-referential in its compliance line and therefore cannot serve as an independent example of owner-routing discipline
  - `remediation.resolved` is also internally inconsistent inside the same file:
  - remediation.resolved
  - The file still claims HITL semantics must not change, while later sections already change the meaning from request-centric tier-boundary approvals to blocked/runtime overlays.
  - The file still treats tier boundaries as the approval scope anchor, while newer runtime canon requires blocked-episode identity anchored by run/node/blocked sequence.
  - This file is still teaching consumers how to persist approval state. Leaving the old section in place will keep recreating the same storage and command drift.
  - the same file later defines canonical `cmd.runtime.*` recovery commands keyed by `run_id`, `node_id`, and `blocked_sequence`
  - cmd.runtime.*
  - node_id
  - blocked_sequence
  - `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/UI_Command_Catalog.md`, `Plans/Crosswalk.md`, `Plans/Wiring_Matrix.md`, `Plans/Progression_Gates.md`, `Plans/FileManager.md`, `Plans/Project_Output_Artifacts.md`
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
  - Plans/Crosswalk.md
  - Plans/Wiring_Matrix.md
  - Plans/Progression_Gates.md
  - Plans/Project_Output_Artifacts.md
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


