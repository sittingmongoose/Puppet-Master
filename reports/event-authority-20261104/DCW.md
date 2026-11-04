# DCW — Event Authority wave 2, 2026-11-04

Branch: `plans/ea-w2-chain-wizard-20261104`. Base: `be4766513ff71776346fc73b84f2542990f955af` (fresh `origin/main`). Machine: `ubuntu-agent-nas1`; initial `free -g` available 10 GB. Prepared without admission. No main push, landing lock, reseal, event registry append, admission record, Decision Log edit, mail or subagent.

## Outcomes and self-grade

| Exact row | Outcome | Current owner / reason | Self-grade |
|---|---|---|---|
| `bundle.revision_requested` | register (prepared draft) | ACD-049/050 → NEW ACD-571, CV-590, SP-575 | 7 PASS / 4 PARTIAL / membership ABSENT |
| `bundle.revision_started` | register (prepared draft) | ACD-049/050 → NEW ACD-572, CV-591, SP-576 | 7 PASS / 4 PARTIAL / membership ABSENT |
| `bundle.revision_completed` | register (prepared draft) | ACD-049/050 → NEW ACD-573, CV-592, SP-577 | 7 PASS / 4 PARTIAL / membership ABSENT |
| `bundle.revision_interrupted` | register (prepared draft) | ACD-049/050 → NEW ACD-574, CV-593, SP-578 | 7 PASS / 4 PARTIAL / membership ABSENT |
| `wizard.blocked` | blocked on Jared | Active Contracts payload versus retired wizard lifecycle; Q1 | owner CONFLICT; 5 PARTIAL / 6 ABSENT |
| `wizard.unblocked` | blocked on Jared | Active Contracts payload versus retired wizard lifecycle; Q1 | owner CONFLICT; 5 PARTIAL / 6 ABSENT |
| `wizard.opened` | blocked on Jared | UCC-032 preserves old deferred-launch command/events without a current replacement success boundary; Q2 | owner CONFLICT; 5 PARTIAL / 6 ABSENT |
| `wizard.deferred_payload.loaded` | blocked on Jared | UCC-032 preserves old deferred payload load while current planning intake uses approved packs; Q2 | owner CONFLICT; 5 PARTIAL / 6 ABSENT |

Totals: four prepared drafts, zero exclusions, four rows blocked on product questions grouped into two cards. Zero admissions. No ledger/census exclusion applications: retirement of an owner document alone does not exclude these exact event names.

The self-grade JSON is `DCW.self-grade.json`. It is deliberately not an all-PASS admission assessment. The prepared families still need verification of the physical `revision_run.v1` original evidence composition and more complete semantic fixture adapters for first-receipt/source custody, concurrent terminal publication and withdrawal. The current static checker verifies shape, identity, joins, predecessor order and resume, not native effects or transactional custody. Native obligations remain NOT_RUN. The seven PASS cells describe normative draft text, not runtime proof. Integration must resolve every PARTIAL cell before admission.

## Current-owner reconciliation and premise checks

`Plans/chain-wizard.md` opening retirement notice and `Plans/chain-wizard-flexibility.md` Change Summary / Plan document status explicitly retire the old owners. Their content cannot supply current writer authority. DL-045's scope row names all eight exact DCW families under historical CWF ownership, but DL-045 explicitly says owner labels route investigation and do not override semantic/Storage authority, and excludes competing-owner product choices.

For EACH of the four bundle events, the current replacement behavior is independently supported by `Plans/assistant-chat-design.md` §8.7 and ACD-049/050: targeted revision, no automatic Multi-Pass Review, eligible annotation handling and interrupted revision recovery. `Plans/storage-plan.md` bundle annotation/revision audit bullet explicitly names started/completed/interrupted; `Plans/Contracts_V0.md` Cross-surface event minima explicitly names requested. `Plans/FinalGUISpec.md` §7.15 retains Resubmit with Annotations and targeted revision. This resolves the survey's retired-owner lead for these four events without reviving Chain Wizard. Current use is narrowed to the already specified Deep Plan review path; no new PRD/PlanningRun ledger producer is authorized.

The retained `revision_run.v1` spelling in Storage and `revision_run.{bundle_id}.{revision_id}` in ACD-050 are existing source-owner descriptions, not proof their original physical composition is fully materialized. This lane adds no new revision-run store or inferred checkpoint. That verification is reported as a remaining technical gap rather than a product question.

For the two wizard lifecycle events, `Plans/Contracts_V0.md` “Wizard blocked escalation events” still says they are canonical ledger events. CV routing text and ACD's blocked-notice boundary ground blocked recovery in route_target/blocked-remediation identity. However `Plans/Wiring_Matrix.md` WM-036 still names retired CWF as the wizard_status / blocked lifecycle surface; CWF §8.4 preserves clarification-round threshold and wizard_status rules as historical only. `Plans/Planning_Wizard.md` PWIZ-001/003 instead owns PlanningRun and dynamic topics. There is no exact current mapping of the legacy wizard lifecycle/round predicate to those objects. Choosing a new lifecycle would decide user-visible behavior. Do not carry over the retired three-round trigger, assume wizard_id means planning_run_id, or silently exclude the pair.

For the two launch/load events, `Plans/UI_Command_Catalog.md` UCC-032 is accepted and preserves `cmd.project.chain_wizard_open_deferred`, `wizard.opened` and `wizard.deferred_payload.loaded`. The old owner is explicitly retired; current PRD Builder intake and Planning Wizard approved-pack handoff are different workflows. No exact current success boundary for the legacy action was found. Neither renaming it to a modern intake event nor excluding it is authorized by the document retirement alone.

No August/September product answer is used to select retention or resolve these four wizard rows. DL-045 is used only for its exact eight-name scope and bounded technical authority. Its premise holds for the specified Deep Plan revision behavior; its old owner routing does not establish current CWF authority. DL-076 nine-field durable-token rule and current SP-286 (including DL-270/SP-336/SP-347) are reused as they appear in today's canon, not from an old receipt. No Decision Log answer is extended.

## Per-family search and newly authored bindings

Search scope: literal exact names, separately for all eight families, in every top-level `Plans/*.md`, every `Plans/event_payloads/**/*.json`, `Plans/event_family_registry.json` and `Plans/storage_value_registry.json`; inspect matching current owner passages and their referenced ACD, Contracts, Storage and Wiring units. Generated shards and ledgers are not semantic evidence. Also searched scripts/tests for the exact family names and `revision_run`; no existing event-specific checker was found before the new checker. Survey L2 and September interaction rows were read as leads only.

| Family | Existing partial definition reused | Scoped negative evidence | NEW owner contract identifiers |
|---|---|---|---|
| `bundle.revision_requested` | Contracts minima, ACD-049; existing SP-286 and SP-278 | No exact family emitter version, phase identity recipe or authorized passive history-reader binding was found in this scope before drafting. | `emitter.bundle_revision_requested@1.0.0`, `reader.bundle_revision_requested_history@1.0.0`, payload `pm.event_payload.bundle.revision_requested.v1@1.0.0` |
| `bundle.revision_started` | Storage exact audit bullet; ACD-049; SP-286 and SP-278 | No exact family emitter version, phase identity recipe or authorized passive history-reader binding was found in this scope before drafting. | `emitter.bundle_revision_started@1.0.0`, `reader.bundle_revision_started_history@1.0.0`, payload `pm.event_payload.bundle.revision_started.v1@1.0.0` |
| `bundle.revision_completed` | Storage exact audit bullet; ACD-049; SP-286 and SP-278 | No exact family emitter version, phase identity recipe or authorized passive history-reader binding was found in this scope before drafting. | `emitter.bundle_revision_completed@1.0.0`, `reader.bundle_revision_completed_history@1.0.0`, payload `pm.event_payload.bundle.revision_completed.v1@1.0.0` |
| `bundle.revision_interrupted` | Storage exact audit bullet; ACD-050 recovery; SP-286 and SP-278 | No exact family emitter version, phase identity recipe or authorized passive history-reader binding was found in this scope before drafting. | `emitter.bundle_revision_interrupted@1.0.0`, `reader.bundle_revision_interrupted_history@1.0.0`, payload `pm.event_payload.bundle.revision_interrupted.v1@1.0.0` |

Each family has its own semantic, payload and Storage unit. Each NEW identity recipe hashes the compact JSON array of that exact event type, project, thread, bundle, revision and phase_sequence; its own idempotency key includes its event type and digest. phase_sequence is newly authored technical ordering custody, not a new product feature: request zero, each phase increments the actual latest predecessor, interrupted revision resume keeps revision_id and uses a new phase sequence. Current dispatch/admission remains closed. Each family explicitly adopts original complete-value SP-286 receipt custody, independent current-source verification and its own writer cutoff / reader withdrawal / authenticated rebuild fence.

Reused bindings, not newly authored: `projector.storage.event_record_index@1.0.0`, `reader.storage.event_record_index@1.0.0`, `event_record_index_checkpoint.v1:{storage_instance_id}` / `pm.storage_value.event_record_index_checkpoint.v1@1.0.0`, existing source-coupled index rows and RP-PROJECTION-3GEN. No per-family stored projection/checkpoint/token is introduced. Therefore no storage-value registry rows are added; all history is queried from the already registered generic index. Original source stores remain their owners' responsibility, with unresolved physical composition flagged above.

The per-family current search capture (including the newly drafted owner text) is external at `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/current-family-search.json`, SHA-256 `d960c9dc32664858f4818e546e6891005e2e5455a0d32a2beb886cce0391fc8f`. Current references and exact quotes are recorded in the self-grade; the capture is audit evidence, not a canonical owner contract.

## Retention cells

All eight rows leave `retention_policy_ref=PENDING_RETENTION_DECISION`. For four prepared bundle families, candidates are Case L-3's receipt/audit/source-lineage class versus Chat content (`Plans/storage-plan.md`, “Retention authority and defaults”); bundle audit vocabulary alone is not a resolved lifetime assignment for Deep Plan review history. RT must settle the exact class and original body relationship. For four unresolved wizard rows, the current product owner/lifecycle must also be established before class selection; candidate receipt/audit, operational history or planning source lineage is not an assignment. Existing shared generic checkpoint/index retention remains unchanged.

## Questions for Jared — unanswered

### Q1: Which current lifecycle owns wizard blocked history?

**Rows:** `wizard.blocked`, `wizard.unblocked`.

**Question:** Should the distinct blocked/unblocked wizard lifecycle survive as active PlanningRun events? If yes, which current owner and trigger/recovery predicates replace retired wizard_status and clarification-round rules? Or should the exact old families become historical-only/retired?

**Evidence:** Contracts' canonical-event requirement and WM-036's retired lifecycle route conflict with CWF's explicit retirement and PWIZ-001/003's current PlanningRun/topic ownership. Technical identity work cannot choose the user-visible blocked lifecycle. No proposed three-round threshold is carried forward.

**Answer:** PENDING. No decision applied.

### Q2: Does deferred Chain Wizard launch/load remain a current action?

**Rows:** `wizard.opened`, `wizard.deferred_payload.loaded`.

**Question:** Should opening/loading the old deferred payload remain an action in PRD Builder or Planning Wizard? If yes, identify the destination workflow and successful open/load boundary. Otherwise, may these exact families be excluded as retired?

**Evidence:** UCC-032 still accepts the old command/events; CWF is retired, and the current owners define PRD intake and Approved PRD Pack handoff instead. No alias or exact replacement-success boundary was established.

**Answer:** PENDING. No decision applied.

## Shared-file hunks, IDs and integration boundary

Only append hunks in `Plans/Contracts_V0.md`: CV-590–593, and `Plans/storage-plan.md`: SP-575–578. Append hunks in `Plans/assistant-chat-design.md`: ACD-571–574. No existing shared rows reflowed or reordered. The fixtures and four closed payload files are new. `scripts/pm_bundle_revision_events.py` is the new static checker. No tests file is edited.

Allocated IDs used: CV-590, CV-591, CV-592, CV-593; SP-575, SP-576, SP-577, SP-578; ACD-571, ACD-572, ACD-573, ACD-574. ACD starts 60 above main's highest ACD-511. No other PlanUnit, admission, census, card-decision or family registry IDs minted. Q1/Q2 are report-local unanswered labels.

The two mandated memory paths were absent on Nas1: `/home/sittingmongoose/.claude-t3/me/projects/-home-sittingmongoose-src-PuppetMaster/memory/pm-plan-id-allocation.md` and `pm-index-needs-currentness-edition.md`. The explicit brief's ID and currentness-copy requirements were followed; no contents were invented. All 15 copied currentness files matched SHA-256; external `currentness-sha256.txt` records the hashes.

## Checks

Check exit codes and final generation/validation status are appended below after completion. An intermediate diff observed broad shard churn during generation; once the generator completed, tracked shard changes were confined to the three edited owners. No unrelated document is included in the branch.

ID collision check: 475 fetched origin refs, all assigned CV/SP/ACD declaration blocks searched in their owner documents; no collisions.

Additional verification: four Draft 2020-12 schemas pass check_schema; all twelve new PlanUnit YAML blocks parse. New owner prose is append-only (Contracts +264/-0, Chat +192/-0, Storage +363/-0). Forbidden-path diff: empty.

Every NEW binding listed above is a newly authored owner contract under DL-045; none is represented as a pre-existing definition.

Base-canon per-family search was also reproduced against the unchanged starting commit, excluding every new draft binding: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/base-family-search.json`, SHA-256 `96832ddf6013b0116d2adff5ac939f365bb6928a4b2454d59435a1881d0f605a`. This provides a distinct before-draft evidence surface for every scoped negative finding above.

Implementation commit: `73a678dfaa0f9f890c442eb9eb0ffe5b8f12f50f`. Report/self-grade are a separate follow-up commit; their addition does not change the assessed owner contracts.

| Check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_bundle_revision_events.py` | 0 | PASS, 179 static cases |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | pass |
| `python3 scripts/pm-plan-index.py generate` | 0 | pass |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | pass |
| `python3 scripts/pm-plan-index.py validate` | 0 | pass |

`git diff --check`: exit 0. Self-grade quote verification: PASS. ID collision scan: 475 origin refs, zero collisions. All native oracles remain NOT_RUN. Full required index validation top-level status is `pass`, zero failures. No governance checks, reseal or landing were run.

External check evidence (path plus SHA-256):

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/contract-check.txt` — `de0a0fa533ec64fbd6d74bc7439f17d70b47fdb303ece3087caf204e833d18cf`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/shard-generate.txt` — `48c09691cf1c0464d1276a594016813a0df26d1a721256cd653580869c58d3c4`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/index-generate.txt` — `9ef2e01f0b9556b35fd76b096da2caecbd2da2db129a59005aee607be3ca77dd`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/shard-check.txt` — `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/index-validate.txt` — `649ab4ca523ece13df797f76022650d37d98aaf5d814f33f3350f55b0a886a7b`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/check-results.json` — `42977f4608b8dbefae5ea67fe4906b9e242096d30a89114d5524e45f5c33c6be`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/diff-check.txt` — `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/path-audit.txt` — `16fac38a5fa3d7b5c17a454393ba003718da20d2f577196c328639153b377060`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/id-collision-check.txt` — `540eafdf353d805dfb2364371b4c9fcd52fade7be5d393ec8b7df77cb18de05d`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/currentness-sha256.txt` — `edac215a3dd1a1dcf3c6f820967258de5b4626dd3dbe6631c4b5331838161f26`

Handoff: four review drafts remain below admission depth for the technical gaps stated above; four wizard rows require Jared’s unanswered Q1/Q2. Do not treat the passing shape/index checks as a full Event Authority depth pass. All eight retention cells remain pending for RT. Leave this local worktree for lead integration.
