# DF — second-pass FileSafe Event Authority draft

Branch: `plans/ea-w2-filesafe-20261104`. DF-P2 contract head: `43921a583f7641c1c5ee5d6858b2c5d136223fb6`. Started from pushed `c7058590332b1cc87afb56e39dc6b7afc2fa3e7a`; origin/main basis remains `be4766513ff71776346fc73b84f2542990f955af`.
Worktree: `/home/sittingmongoose/pm-worktrees/DF-p2`, left for integration. The following report-only commit preserves this assessed source tree.

**All nine families now have 10 PASS / 1 PARTIAL / 1 ABSENT.** Producer, scope_identity and positive_negative_oracles moved from PARTIAL to PASS. Retention remains PARTIAL with its exact PENDING_RETENTION_DECISION marker; membership_version remains ABSENT until individual admission. Native execution is NOT_RUN, and every original-source method is specified_unimplemented. No family is 12/12 or ready to emit.

## Per-family grades and units

| Family | Before (PASS / PARTIAL / ABSENT) | After | Units |
|---|---|---|---|
| `filesafe.command_denied` | 7 / 4 / 1 | 10 / 1 / 1 | CV-550, SP-550, ATS-275 |
| `filesafe.destructive_override_denied` | 7 / 4 / 1 | 10 / 1 / 1 | CV-551, SP-551, ATS-275 |
| `filesafe.destructive_override_granted` | 7 / 4 / 1 | 10 / 1 / 1 | CV-552, SP-552, ATS-276 |
| `filesafe.destructive_override_requested` | 7 / 4 / 1 | 10 / 1 / 1 | CV-553, SP-553, ATS-276 |
| `filesafe.guard_init_failed` | 7 / 4 / 1 | 10 / 1 / 1 | CV-554, SP-554, ATS-277 |
| `filesafe.path_denied` | 7 / 4 / 1 | 10 / 1 / 1 | CV-555, SP-555, ATS-277 |
| `filesafe.policy_degraded` | 7 / 4 / 1 | 10 / 1 / 1 | CV-556, SP-556, ATS-278 |
| `safe_point.created` | 7 / 4 / 1 | 10 / 1 / 1 | CV-557, SP-557, ATS-279 |
| `safe_point.restored` | 7 / 4 / 1 | 10 / 1 / 1 | CV-558, SP-558, ATS-279 |

Counts before are the first-pass reported grades; current source was re-read, including the inconsistencies corrected below. The aggregate and nine individual self-grade JSON files contain current exact line citations, source hashes, prior statuses and change reasons. Family IDs/revisions remain null: no registry identity has been minted.

## Exact technical additions

| Family | Own source schema / graph basename | Exact producer |
|---|---|---|
| `filesafe.command_denied` | `Plans/filesafe_event_sources/filesafe_command_denied.schema.json` and `.contract.json` | `BaseRunner::check_command -> BashGuard::check_command -> log_blocked_command` |
| `filesafe.destructive_override_denied` | `Plans/filesafe_event_sources/filesafe_destructive_override_denied.schema.json` and `.contract.json` | `FileSafe::evaluate_destructive_override -> deny_override` |
| `filesafe.destructive_override_granted` | `Plans/filesafe_event_sources/filesafe_destructive_override_granted.schema.json` and `.contract.json` | `FileSafe::evaluate_destructive_override -> issue_override_receipt` |
| `filesafe.destructive_override_requested` | `Plans/filesafe_event_sources/filesafe_destructive_override_requested.schema.json` and `.contract.json` | `FileSafe::request_destructive_override -> record_override_request` |
| `filesafe.guard_init_failed` | `Plans/filesafe_event_sources/filesafe_guard_init_failed.schema.json` and `.contract.json` | `FileSafe::initialize_guard -> record_guard_init_failure` |
| `filesafe.path_denied` | `Plans/filesafe_event_sources/filesafe_path_denied.schema.json` and `.contract.json` | `FileSafe::check_path -> FileGuard::check_operation -> record_path_denial` |
| `filesafe.policy_degraded` | `Plans/filesafe_event_sources/filesafe_policy_degraded.schema.json` and `.contract.json` | `FileSafe::load_policy -> record_policy_degradation` |
| `safe_point.created` | `Plans/filesafe_event_sources/safe_point_created.schema.json` and `.contract.json` | `FileSafe::capture_pre_write_safe_point -> commit_safe_point_record` |
| `safe_point.restored` | `Plans/filesafe_event_sources/safe_point_restored.schema.json` and `.contract.json` | `FileSafe::restore_exact_replace -> reconcile_restore_transaction` |

Each schema has separate closed Project/application original-source roots and its own complete request/result/materialization definitions. Each graph pins exact resources by path/URI/SHA-256, names the two private original-source interfaces and their capture_at_original_commit/read_same_operation/recover_same_operation operations, lists own input/subject/body joins, orders body commit, prepared event, append, first receipt, terminal, history read, backup and withdrawal, and preserves the retention hold.

The exact interface pattern is `owner.filesafe.<basename>.original_source.project@1.0.0` and `owner.filesafe.<basename>.original_source.application@1.0.0`, expanded independently in every graph and CV unit. These are newly authored owner contracts under DL-045, not discoveries, public commands, new durable tables, a registry append or native installation. All existing history-reader IDs remain unchanged.

Original source views require genuine owner operation/commit, writer/storage context, original request/result and body ref/hash selection. Source hashes cannot authenticate acceptance. Application accepted-source and graph hashes use the exact CV-366 typed domains; Project adds a view commitment without replacing original native codecs or source hashes. The unchanged original Project safe_point_record and restore-transaction schemas are imported in full for their respective Project source roots and joined to actual body bytes and event subjects. Application uses a separate source root and rejects the Project-only record member.

Every SP unit explicitly retains SP-286/CV-339 strict full-value v2 and SP-278, its existing generic index/checkpoint/CAS and durable token. No family checkpoint/read model or new physical storage family is introduced. Replay returns the original complete event and all first-receipt fields; changed semantic intent conflicts, missing dedupe/source fences, and no audit replay performs the original domain effect.

## Current-premise checks and corrections

- **DL-045:** its exact scope still names all nine families; current FileSafe F2-041/F2-052/F2-213 and the other cited guard/capture/restore owners retain the specified behaviors. Only missing technical contracts were authored. No feature, user-visible behavior, retention/deletion choice or competing owner was decided.
- **CV-365/366 and F2-213:** application context remains required. The first-pass Project-only completeness premise cannot close these current families; separate full original-source graphs now describe application. Existing app.restore_lifecycle.v1 belongs to restore_point lifecycle and was not borrowed for safe_point or FileSafe.
- **Override scope:** the first-pass flat scope omitted application Server/Environment/recorded roots and overconstrained optional Project run/worktree/command restrictions. Prepared requested/granted schemas now follow current F2-213 with an explicit closed union. Application binds real Server/Computer/thread/run/Host/Environment and roots; Project retains its optional restrictions, with no broader grant than the authentic request. The checker has Project-wide positives and narrowing/wrong-root/missing-identity negatives. No original accepted Project source was recast.
- **Snapshot versions:** the first-pass created payload used integers while the intact original Project safe_point_record schema uses nonempty strings. The unadmitted draft and its fixtures now preserve those strings without coercion. Restore conflict codes likewise use the original closed vocabulary, and both safe-point families import full original Project native source records.
- **Envelope:** canonical EventRecord has scope_kind/project_id and no nested scope object. Own CV text, fixtures and joins now use the actual envelope fields and preserve the payload WorkflowScopeV2 intact.
- **Retention:** the exact first-pass paragraphs in SP-550..558 were checked byte-for-byte unchanged. Case L-3 candidate classes, original snapshot retention and generic index/checkpoint policies are distinct. No August/September retention answer was imported or extended; no failed old decision premise was applied. The registered safe_point.recovery_unavailable comparison supplies no admission or sibling contract.

## Every remaining non-PASS cell

| Family | membership_version — ABSENT | retention — PARTIAL / exact question for Jared |
|---|---|---|
| `filesafe.command_denied` | No registry row; individual batch admission is outside DF-P2. | Which Case L-3 class owns `filesafe.command_denied` history: authority/approval/receipt indefinite, non-authority security/recovery operational, or runtime/run history? `PENDING_RETENTION_DECISION` waits on Jared. |
| `filesafe.destructive_override_denied` | No registry row; individual batch admission is outside DF-P2. | Which Case L-3 class owns `filesafe.destructive_override_denied` history: authority/approval/receipt indefinite, non-authority security/recovery operational, or runtime/run history? `PENDING_RETENTION_DECISION` waits on Jared. |
| `filesafe.destructive_override_granted` | No registry row; individual batch admission is outside DF-P2. | Which Case L-3 class owns `filesafe.destructive_override_granted` history: authority/approval/receipt indefinite, non-authority security/recovery operational, or runtime/run history? `PENDING_RETENTION_DECISION` waits on Jared. |
| `filesafe.destructive_override_requested` | No registry row; individual batch admission is outside DF-P2. | Which Case L-3 class owns `filesafe.destructive_override_requested` history: authority/approval/receipt indefinite, non-authority security/recovery operational, or runtime/run history? `PENDING_RETENTION_DECISION` waits on Jared. |
| `filesafe.guard_init_failed` | No registry row; individual batch admission is outside DF-P2. | Which Case L-3 class owns `filesafe.guard_init_failed` history: authority/approval/receipt indefinite, non-authority security/recovery operational, or runtime/run history? `PENDING_RETENTION_DECISION` waits on Jared. |
| `filesafe.path_denied` | No registry row; individual batch admission is outside DF-P2. | Which Case L-3 class owns `filesafe.path_denied` history: authority/approval/receipt indefinite, non-authority security/recovery operational, or runtime/run history? `PENDING_RETENTION_DECISION` waits on Jared. |
| `filesafe.policy_degraded` | No registry row; individual batch admission is outside DF-P2. | Which Case L-3 class owns `filesafe.policy_degraded` history: authority/approval/receipt indefinite, non-authority security/recovery operational, or runtime/run history? `PENDING_RETENTION_DECISION` waits on Jared. |
| `safe_point.created` | No registry row; individual batch admission is outside DF-P2. | Which Case L-3 class owns `safe_point.created` history: authority/approval/receipt indefinite, non-authority security/recovery operational, or runtime/run history? `PENDING_RETENTION_DECISION` waits on Jared. |
| `safe_point.restored` | No registry row; individual batch admission is outside DF-P2. | Which Case L-3 class owns `safe_point.restored` history: authority/approval/receipt indefinite, non-authority security/recovery operational, or runtime/run history? `PENDING_RETENTION_DECISION` waits on Jared. |

All other cells are PASS in the current self-grade. No additional product blocker was invented. RT/integration may apply a genuine current retention answer later; this worker selects none. Independent grading, reviews, retention and individual admission remain lead/integration work.

## Verification and limits

- **Authority/source suite:** `python3 scripts/pm_filesafe_event_authority.py`, exit 0, top-level pass: 30 complete Project/application positives, 1074 negatives, 162 protocol traces across nine families. All five restore outcomes are covered. Forged self-consistent sources, wrong scope/subject/Host/root, missing joins/body/receipt, altered complete-value commitments, exact-original retries, digest conflict, dedupe loss, six crash boundaries, older-backup skew, early terminal publication, pending withdrawal, tampered/changed survivor sets and fenced reader publication have authored cases.
- **Existing payload suite:** `python3 scripts/pm_filesafe_event_contracts.py`, exit 0, top-level pass. Closed schemas, Project/application payloads, identity vectors and own semantic negatives still pass after the scope/type corrections.
- **Derived files:** shard generate, index generate, shard check and index validate each exit 0 with top-level pass. Validation status was parsed from JSON. Shard changes are confined to Contracts, Storage and Automated Testing; index changes reflect those owner units and their companions. No unrelated owner shard changed.
- **Currentness:** copied all 15 ignored currentness-edition files from the shared checkout and confirmed matching SHA-256 before index generation. This copies existing inputs and performs no reseal. Index readiness stays blocked_runtime_certification_incomplete; no executable node, readiness clearance or governance seal follows.
- **Scope guards:** git diff --check passes; event registry, Spec Lock, auto decisions, .evidence, .gitignore and frozen validator are unchanged. No test file was edited. No main push, landing lock, pm-mail, subagent, admission record or Decision Log entry.
- **Infrastructure:** full checkout and broad Plans checkout hit disk exhaustion before drafting; their incomplete worktree was removed. The final sparse worktree excludes historical migration/evidence/ledger bulk but includes the exact run-002 migration input required by index generation. An initial index generation reported only that absent input; after adding it, generation/validation passed. No baseline, governance or unrelated worktree was changed.
- **Native boundary:** source authenticity, native producer installation, actual original codecs/durability/fsync, filesystem effects/equality, SP-278 transaction/CAS, permissions/holds/deletion, coherent backup/restore and real withdrawal effects remain authored NOT_RUN. Synthetic source banks and protocol state machines establish contract cases only; none is runtime acceptance or an effect/grant source.

## IDs and shared hunks

**IDs used/reused:** CV-550..558, SP-550..558, ATS-275..279 (23 existing DF units). No new PlanUnit ID, family ID, family revision or Decision ID. CV-559/SP-559 remain unused. Native Project resources are unchanged.

Shared-file hunks are confined to the existing first-pass DF units: Contracts CV-550..558 (source graphs, lifecycle, exact joins and corrections), Storage SP-550..558 (same-original/full-value recovery joins), Automated Testing ATS-275..279 (separate per-family source/envelope/receipt/trace acceptance and validator surfaces). No shared registry hunk. Four own prepared payload schemas, existing payload fixtures/checker, nine new source schemas, nine new source graphs, one new authority fixture and one new read-only checker accompany the prose.

## Evidence custody

Per-family searches were rerun against pushed baseline c7058590332b1cc87afb56e39dc6b7afc2fa3e7a before claiming new bindings. Each external search file states its exact current owner/schema/registry/source-bank scope, cites partial definitions and records the missing complete original-source graph/fixture set within that scope. Existing definitions were reused first; no sibling identity or contract was inferred. Search summaries and old/new report copies live in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/`; pass1/ preserves the prior aggregate/report. The table below cites retained evidence by exact path suffix and SHA-256.

| File under the external DF evidence directory | SHA-256 |
|---|---|
| `check-authority-p2.json` | `98f38f7ef54749aa6717aa12569a2b0f3c9b2bcd13e8d71e2c68068289b7a9e3` |
| `check-contracts-p2.json` | `8f7d3c1856e3d51f2147aa2f9833ff0158a30678adcf3ea5b526f21861d688ad` |
| `check-shards-generate-p2.txt` | `48c09691cf1c0464d1276a594016813a0df26d1a721256cd653580869c58d3c4` |
| `check-shards-p2.txt` | `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21` |
| `check-index-generate-p2.txt` | `d3c3f46aa4228c72dff2fca2f904302bbeabcccab64ab4e3026289fa54a6fe67` |
| `check-index-validate-p2.json` | `ca23d529fbdfd8364758472935deb7dfb437969e00e421673589dae3cf3ff2f6` |
| `check-evidence-p2.json` | `d7a7dad27552b93ec92e7240fa733c2e1ebf600de25f4015f2540688f63612af` |
| `currentness-sha256-p2.json` | `1b765b9ac2ab42d60576eba5c1f1edd03454965e434717497da8cbcf32c009bf` |
| `search-summary-p2.json` | `b2f79ebb660d54bd4772fe9fc67b9a08f321c055160c4a7f565b8803a7c53129` |
| `filesafe.command_denied.search-p2.txt` | `07b5711f0aa26c04a908aef2f19286bbd70733ed879317d3c11a9fadaacd4624` |
| `filesafe.destructive_override_denied.search-p2.txt` | `4330f16ff56ef65394a21d42d388e6350410a4b72e1121bb28ad5f1803062246` |
| `filesafe.destructive_override_granted.search-p2.txt` | `8e0f01642a6e920643d49df026182b5bfc88df4f09bae0433eac94d51671a678` |
| `filesafe.destructive_override_requested.search-p2.txt` | `1d55d9cbd051e788197e0f22ddc1ff6e764b097d9cfac49d8df7b60a33e997d7` |
| `filesafe.guard_init_failed.search-p2.txt` | `a29abeeeb1958414e461684bb26dbaa4ec3432218dcd89ba5390b572ab69faa5` |
| `filesafe.path_denied.search-p2.txt` | `3ac7de57886a383770741aa06c5afba7115fba07d3f98d16f19bad43d9a28c71` |
| `filesafe.policy_degraded.search-p2.txt` | `c099f06c4e6e639843b8d7b9dbc2773f0cdb8bc4c820db7bee1afc97a201eb0c` |
| `safe_point.created.search-p2.txt` | `4ea6edd46b78444112bcef55eefc96867c68d7a9b2a71d42ba7f08e978101605` |
| `safe_point.restored.search-p2.txt` | `e384902ae3d8dc78903fbcf0b37f0c4e3ba219c4a885c84842a8ae1a40efec58` |
