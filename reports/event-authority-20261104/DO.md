# DO — Event Authority review round 2, 2026-11-04

Branch `plans/ea-w2-orchestrator-20261104`; current fix worker DO-FIX2. Round-2 response below supersedes the affected round-1 grades only. Historical round-1 account follows. Owner/code revision `644a3df9c97ffc19c76924a02641cb852852f7ef` repairs reviewed head `942679dd84606c684faa520d1f73c8e2fc6a5a43`. All 25 are self-graded prepared under the lane's retention exception: **10 PASS, retention PARTIAL, membership ABSENT per family**. This is specification preparation; native execution remains NOT_RUN. No admission, event-family append, Decision Log entry, main push or reseal.

## Review round 1: findings and responses

- **DO-01 — fixed (`644a3df9c97ffc19c76924a02641cb852852f7ef`).** Location: `Plans/orchestrator-subagent-integration.md:32218`, OSI-681..683 and OSI-686..704; checker `scripts/pm-orchestrator-event-contracts.py:33`. All 22 application families explicitly use CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}`, preserving the Storage lifetime tuple. Each original operation retains its own exact event observation component before append/recovery. Project keys and both scopes' event-ID recipe remain unchanged. Fixed vectors independently decode Server/operation bytes. Same-identity changed semantics is a conflict; retries do not remint. Verify `python3 scripts/pm-orchestrator-event-contracts.py`; full-checker old-application-key mutation exits 1.
- **DO-02 — fixed (`644a3df9c97ffc19c76924a02641cb852852f7ef`).** Location: `Plans/orchestrator-subagent-integration.md:32212`, the closed posted payload and exact-family fixtures. The event itself now carries exactly one of content up to 16,384 UTF-8 bytes or closed content_ref (BLAKE3 id, full byte size, text media type), adopting OSI-299/SP-337. Original message joins remain. Body bytes/index precede append acknowledgement; both inline and referenced text retain permission/deletion/hold checks. Required custom format pm-utf8-body-16k is enforced by producer/storage validators; maxLength alone is not the byte check. Positive/negative cases test both scopes, ASCII and multibyte boundaries, both/missing representations, invalid reference fields and secrets against both the payload and actual stored member. Pack-byte/BLAKE3 truth and crash/read races remain authored native NOT_RUN. Verify the DO checker; body-missing full-checker mutation exits 1.
- **DO-03 — fixed (`644a3df9c97ffc19c76924a02641cb852852f7ef`).** Location: `Plans/storage-plan.md:29481` (SP-720..722), OSI-681..683, coordination_event_records in Plans/storage_value_registry.json, `scripts/pm-orchestrator-event-contracts.py:112` and `scripts/pm_coordination_events.py:777`. Each board family has its own key-shape and closed member, original sole AgentCoordinator, Project/application append/source adoption, genuine Server/thread/crew/run/message joins, actual terminal-Run anchor and board-specific text protection. Original eight members and other registry rows/policies/profiles remain exact. Board history does not enter the seven-agent lifecycle reducer. Stored-message custody does not stand in for event storage. Source join vectors exercise both scope editions against the actual value composition; they are static joins, not native source authentication. The coordination checker retains strict expected-row comparison and rejects removal of each member through its full CLI. Q1 and Q3 remain retention integration items; no count interpretation or admission is chosen.
- **DO-04 — fixed (`644a3df9c97ffc19c76924a02641cb852852f7ef`).** Location: `Plans/orchestrator-subagent-integration.md:33014`, retry payload/fixtures and `scripts/pm-orchestrator-event-contracts.py:47`. New attempts cover failure, blockage and interruption without relabelling blocked/interrupted children as failed. Retain child lineage and increment the attempt once. Terminal/superseded, permission/ceiling, Stop/deadline, no-new/skipped-attempt, resume/reroute/replacement and missing interruption-source negatives refuse. Both-scope payload positives include all causes. Verify the DO checker; deleting blockage coverage from fixtures fails its full CLI.

No finding is disputed. No new product choice was supplied. Retention remains a stopped/PARTIAL cell wherever the cited dependency has unresolved prerequisites.

## Family grades before and after

Before is the independent DO-sol regrade, not the superseded original self-grade. After is the current self-grade at the source revision above. Every row keeps retention PARTIAL and membership ABSENT.

| Family | Owner units | Before | After |
|---|---|---:|---:|
| `config.validation.failed` | OSI-680 | 10 PASS | 10 PASS |
| `crew.board_message_posted` | OSI-681/SP-720 | 5 PASS | 10 PASS |
| `crew.board_message_read` | OSI-682/SP-721 | 6 PASS | 10 PASS |
| `crew.board_messages_archived` | OSI-683/SP-722 | 6 PASS | 10 PASS |
| `parser.error` | OSI-684 | 10 PASS | 10 PASS |
| `phase.force_completed` | OSI-685 | 10 PASS | 10 PASS |
| `subagent.budget_warning` | OSI-686 | 7 PASS | 10 PASS |
| `subagent.cancelled` | OSI-687 | 7 PASS | 10 PASS |
| `subagent.completed` | OSI-688 | 7 PASS | 10 PASS |
| `subagent.context_warning` | OSI-689 | 7 PASS | 10 PASS |
| `subagent.escalated` | OSI-690 | 7 PASS | 10 PASS |
| `subagent.failed` | OSI-691 | 7 PASS | 10 PASS |
| `subagent.message_received` | OSI-692 | 7 PASS | 10 PASS |
| `subagent.message_sent` | OSI-693 | 7 PASS | 10 PASS |
| `subagent.model_switched` | OSI-694 | 7 PASS | 10 PASS |
| `subagent.output_truncated` | OSI-695 | 7 PASS | 10 PASS |
| `subagent.paused` | OSI-696 | 7 PASS | 10 PASS |
| `subagent.progress` | OSI-697 | 7 PASS | 10 PASS |
| `subagent.resumed` | OSI-698 | 7 PASS | 10 PASS |
| `subagent.retried` | OSI-699 | 6 PASS | 10 PASS |
| `subagent.spawned` | OSI-700 | 7 PASS | 10 PASS |
| `subagent.started` | OSI-701 | 7 PASS | 10 PASS |
| `subagent.timeout` | OSI-702 | 7 PASS | 10 PASS |
| `subagent.tool_called` | OSI-703 | 7 PASS | 10 PASS |
| `subagent.tool_completed` | OSI-704 | 7 PASS | 10 PASS |

**Totals:** before 179 PASS / 50 PARTIAL / 46 CONFLICT / 25 ABSENT; after 250 PASS / 25 PARTIAL / 0 CONFLICT / 25 ABSENT. Prepared-family count under the lane exception: **3/25 → 25/25**. All 300 current cell citations were re-pinned and mechanically verified. The self-grade records prior review grades per cell and individual remaining gaps; independent re-review remains required.

## Newly authored bindings and current search evidence

Each of the 22 application families has its own stated observation component `JCS(["ea-do-observation-v1",operation_id,thread_id,run_id,event_type,occurrence])`, retained in its genuine original operation custody. This fills only the missing family-local effect component; CV-366 supplies the existing key format. All prior Project domains are preserved. OSI-681 newly spells the closed event content_ref and required UTF-8-byte format while preserving OSI-299/SP-337 behavior. SP-720..722 newly bind one board storage member/source/run anchor per exact family, reusing SP-320, OSI-440, CV-366, SP-351, SP-286 and SP-278. Readers remain ephemeral family-local adapters over the existing actual generic index/checkpoint; no new retained projection or checkpoint is introduced.

Per-family searches used all tracked current Plans Markdown/JSON at reviewed head 942679dd, excluding generated/pipeline/source-lineage trees. Exact hits are in per-family-current-search.json. Existing original drafting evidence remains `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/per-family-search.json`, SHA-256 `b210f7025b6efd58b4003d8246270b98d8e91dca81708413c3e84a774a1445c0`. The current search explicitly reuses shared CV-366 identity even though exact-family searches did not discover it originally. The old claim that history-reader reuse removed the need for canonical board storage members is withdrawn. Eight original composition members contain no board key; each SP unit documents that negative evidence and the original app source edition it adopts. No sibling binding or admission is inferred.

## Retention dependencies and premise checks

Retention stays cited to `origin/plans/ea-storage-retention-20261104` at inspected `d1b0338a21da131e62a0779aa46e822f3a439843`, especially Case L-3 and report reports/event-authority-20260911/step-09-storage-retention-20261104.md section 6. This fix does not copy that branch's assignments or policies.

- **DL-084:** the same 19 histories still exist; OSI-440/CV-366 application support changes neither their chat lifetime nor the shared **250,000 per thread** cap. Each contract names the actual parent chat; linked successor physical form is still first-admission technical work. Immediate deletion tombstone, active purge within 24 h, backup purge within 30 d and non-disclosing holds are explicit in every child contract. Policy citation alone closes none of those prerequisites.
- **DL-085:** all three run-internal board families remain current. Existing lane changes from “archived or deleted” to archived, unresolved blocker visibility and leaving-board-deletes-nothing remain intact. SP-720..722 now supply the missing members, text rule and first durable terminal actual-run anchor. **Q1 remains open:** Does the Storage owner/host read SP-349/SP-351's Server-wide application counterpart bound differently for application board EventRecords? This fix does not answer it or promote retention. **Q3** (carry-over of the host's September confirmation to the rebuilt retention branch) remains integration work.
- **DL-086:** three diagnostics remain Project-only under DL-292 and join the original Orchestrator/interview Run's first durable terminal record, never their own event timestamp or a child's completion. OSI-684 keeps the first 500 sanitized Unicode characters plus the full permitted sanitized output's SP-337 reference. Policy remains RP-RUNTIME-365D on the dependency; retention PARTIAL.
- **DL-087/088:** current Collaborative Workflows still owns lifecycle. Both Crew pointers remain, with no separate lifecycle history. None of the six retired crew lifecycle or two retired spawn-request names intersects these 25; board and subagent.spawned/completed names are preserved. Retirements dependency checked at d30028fbb943321df574cc159312c9c103d4de8c / b4ef60f0a9610a7fa64fc1e9f44674f20f31d876; no duplicate edit.
- **DL-292/CV-366:** application availability remains relevant to 22 families. The old assumption that a new hashed do1 app key was allowed **failed**; current CV-366:24099 already governs. DO-01 applies it. The old body-only-in-message assumption **failed** against OSI-299:24161 and is corrected by DO-02. Retry's failure-only premise **failed** against Contracts:2948–2958 and is corrected by DO-04. There is no current owner conflict left for those fixes.

**Named integration follow-ups:** original CV-267..269 / child-history DL-084 citations and original Contracts board minima carrying DL-085 remain visible owner follow-ups from the Storage report. The retention branch's linked-successor work, Q1 and Q3 are not erased by these ten-PASS rows. Q2's separate collaborative record policy, SR-04 Boot aggregates and storage_maintenance_operation are outside DO. No admission readiness is claimed.

## Shared-file hunks and IDs

- **Orchestrator:** amend only OSI-680..704 contracts from this lane; the earlier DL-085 and two DL-087 lifecycle edits remain intact.
- **Storage owner:** append three independent units SP-720..722. No existing prose rewritten and no retention assignment duplicated.
- **Storage registry:** amend only coordination_event_records: three key/member additions, exact required/optional intersection/union, original append/consumer adoption, replay, run-anchor, text and prepared-state prose. All original eight payload definitions and all other family/policy/profile bytes are semantically unchanged. No new storage family is added.
- **Testing owner:** amend ATS-360 with the exact-family regression obligations. **Checkers/companions:** two DO JSON files, DO checker and strict coordination composition expectation. No tests file edited: its ignore rule has no allowed `!` exception; regression vectors live in the allowed Plans companion and full-checker probe suite.
- **IDs used:** original OSI-680..704 and ATS-360; new SP-720..722. New IDs were scanned across 500 fetched origin refs / 61 unique Storage blobs: no collision. SP-723..739, CV-740..759, ATS-361..369 and OSI-705..719 remain unused.
- **Derived files:** regenerated only the edited Orchestrator, Testing, Storage and storage-value-registry shard directories plus six global plan-index files. No generated files hand-edited.

## Verification and boundaries

| Command/check | Exit | Result |
|---|---:|---|
| free -g / df -BG / before worktree | 0 / 0 | 15 GB available RAM; 122 GB available disk, above 6/50 GB floors |
| Currentness edition copy and SHA-256 compare | 0 | All 15 files match shared edition before generation |
| python3 scripts/pm-orchestrator-event-contracts.py | 0 | 25 families; 2,186 assertions; native NOT_RUN |
| Full DO checker negative mutations | 1 expected each | Old application key, missing posted body, missing member, omitted blockage retry coverage all caught |
| Full coordination CLI with each board member removed | 1 expected each | Additional coordination_event_records mismatch for all three individual removals |
| python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json | 0 | Only edited owners' derived paths |
| python3 scripts/pm-plan-index.py generate | 0 | Top-level status pass |
| python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json | 0 | Top-level status pass |
| python3 scripts/pm-plan-index.py validate | 0 | Parsed top-level status pass |
| python3 scripts/pm_coordination_events.py, baseline/fixed | 1 / 1 | Exact same 2 pre-existing failures; whole stdout bytes identical |
| python3 scripts/pm-runtime-integration-canon-validate.py validate, baseline/fixed | 1 / 1 | Exact same 161 pre-existing failures; whole stdout bytes identical |
| python3 scripts/pm-storage-profile-check.py, baseline/fixed | 1 / 1 | Exact same 41 pre-existing errors; whole stdout bytes identical |
| Full storage registry/schema and preservation audit | 0 | Registry validates; other rows/policies/profiles and all original members preserved |
| git diff --check | 0 | No whitespace errors |

Baseline/fixed checkers run with full read-only input overlays; only relevant baseline files are replaced with reviewed-head bytes. Scratch overlays were removed. No governance gates, admission, native run or landing was substituted for this bounded fix. A temporary integrity assertion used an incorrect underscore spelling for two shard directory names; correcting that audit expectation produced the passing four-owner preservation audit without changing product files.

**Procedure disclosure:** the parallel initial startup issued read-only pm-mail inbox/who before FIX-ROUND's no-pm-mail instruction had been read. No register/send/reply occurred and no later pm-mail was used. No subagents, admission, registry append, Decision Log, governance edit or main push. Sparse detached worktree /home/sittingmongoose/pm-worktrees/DO-fix1 is removed after the pushed report/self-grade and final packet are written, as the fix-round override requires.

## External evidence

Paths plus SHA-256 below identify the retained result evidence. Raw checks, repair/search/probe scripts and this report/self-grade copy remain outside the repository in the same DO draft directory.

| Path | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/fix-round-1/setup.json` | `806e7ff40beae0b680940b9d00c1e94ea06e093bae3e2164d7b853fd2383e086` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/fix-round-1/per-family-current-search.json` | `0f459fd5a177e35c882f307b54a8ef27ad9a78a0d795349493463b27c47a1d13` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/fix-round-1/contracts-check.json` | `7c3c5ca54f677da689b90506b86634455a3ad5cbcc79539a8e554625cfdac332` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/fix-round-1/probe-results.json` | `b43c51cf1d024ffbfb3d020abf4cfccd13852c215fa68e4606e06ca2daab26b3` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/fix-round-1/integrity.json` | `1758d443fdb03a0ffd674953eac3da199cf00d617a4502e3ad05b9bd805659c5` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/fix-round-1/shard-generate.json` | `0097f44a100929b5fcc967352e31e0a28f4a8974cb0027f58fdf4df24ed776d3` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/fix-round-1/index-generate.json` | `14ae5e716300a5bd14cc688998f874b37a360fe08f54a2ae6ed81fca75df082c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/fix-round-1/shard-check.json` | `d697ac77c260ee1fbe5007467d179c832c4c197ffc685d08b78f338e04ff7fdc` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/fix-round-1/index-validate.json` | `e171e02450dc2ac597de625533555d3701ab6f61f6a3f63ac016cfa5a64d02c5` |

## Review round 2: findings and responses

- **DO-C2-01 — fixed (`c886f97d8f1cf947e599571c9ff71cbd9d6b36d1`).** **Where:** `Plans/orchestrator_event_payloads.schema.json:235`, generated copy `Plans/storage_value_registry.json:11797`, fixtures and DO checker. **Why:** Python `$` matches before a final LF, so the pattern alone accepted a 72-character reference. **Fix:** the authoritative BLAKE3 field now requires both `minLength: 71` and `maxLength: 71`. Rebuilt the stored member with `pm_coordination_events.expected_svr_rows()`; no original member or other registry field changes. The checker requires the exact bounds and eight negative suffix cases per scope: LF, CR, CRLF, space, hex, nonhex, NUL and Unicode line separator. All sixteen vectors run against both the payload and the actual stored composition (32 validation assertions). No rule was weakened. Verify with `python3 scripts/pm-orchestrator-event-contracts.py`.

**Affected-cell regrade only:** `crew.board_message_posted.closed_payload_schema` and `.positive_negative_oracles` each **PARTIAL → PASS**, against REVIEW-cycle2.md rather than the old self-grade. That family moves from 8 PASS / 3 PARTIAL / 1 ABSENT to 10 PASS / 1 PARTIAL / 1 ABSENT. Other 24 families and other ten posted cells are carried unchanged. Totals: **248 PASS / 27 PARTIAL / 25 ABSENT → 250 PASS / 25 PARTIAL / 25 ABSENT**, zero conflicts; prepared under the lane retention exception **24/25 → 25/25**. Membership remains ABSENT, retention PARTIAL, native NOT_RUN. No new ID, binding, admission or policy decision.

**Pattern sweep:** recursively searched every definition in the DO payload schema and all three corresponding stored board definitions. Exactly two anchored-pattern occurrences (authoritative BLAKE3 field and stored copy), both now fenced at 71 characters. The inherited coordination source contains 43 anchored patterns; these belong to the original coordination families outside DO. They are recorded by JSON pointer in `pattern-audit.json` as integration follow-ups, preserving the original eight members as required by the lane. Examples include lineage platform / last_applied_event_id, path_hash, non_secret_ref and idempotency patterns. No outside-lane schema was changed.

**Verification:** full DO checker exits 0, status pass, 25 families / 2,235 assertions. The review's mutation appending LF to both referenced-body `valid_payloads` now exits 1 with maxLength failure; separate application-only and Project-only mutations each exit 1 too. All mutations restored in finally blocks. Shard generation/check exit 0. Index generation/validation have parsed top-level pass. The complete coordination checker exits 1 with the same two pre-existing failures as e3a99cf338; baseline and fixed stdout are byte-identical. Integrity checks prove only the reference bounds changed in the source schema/registry, all 308 prior grade quotations still resolve, and only storage-value-registry shards changed. `git diff --check` exits 0.

**Resources and procedure:** before checkout, 22 GB available RAM and 135 GB free root disk met the 6/50 GB floors. Sparse detached worktree `~/pm-worktrees/DO-fix2` from local clone at e3a99cf338; fetched origin, no pm-mail, subagents, admission, registry append, Decision Log, main push or governance edit. All 15 copied ignored currentness files verified SHA-equal before index generation. No Plans Markdown owner needed amendment: OSI-681 already specifies the exact reference. Derived registry shards and index regenerated normally. One initial baseline probe overlaid only the old registry and detected expected source/copy disagreement; rerun with both old source inputs yielded the byte-identical two-failure baseline. Final generation ran with all fixed inputs restored.

**IDs used:** none new; existing OSI-681 / SP-720 / ATS-360 context only. Existing lane allocation remains OSI-680..704, SP-720..722 and ATS-360. Retention Q1/Q3 and other previously named integration obligations remain open. The pushed detached worktree is removed at completion.

**Round-2 external evidence:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/fix-round-2/`; complete-byte hashes follow after verification.

| Evidence filename (under the round-2 directory above) | SHA-256 |
|---|---|
| `contracts-check.json` | `b64dc5054fe2449a0ebedad74cc412c8d14352047c9467544b98cf7c6b454b71` |
| `probe.py` | `0aab9c3c15ff34c624b9275316a26415baa2674631de52be3b43d66a3638e807` |
| `probe-results.json` | `1d87528541207030c68eb675718b74f3b987ebf88a585495034fdb735911a3dc` |
| `pattern-audit.json` | `afa6a092fc4d67c329700648f6259b883f0cc00de5681b1d1494c2b2dd3265aa` |
| `integrity.json` | `b13d7203213dead3f93fe3d04ea9fe1b8fdaf5bd80916ed53e182219d5722732` |
| `regrade.json` | `b9d64985e3c7acfe9e2ddbe44f05212e1848dad62fd7b4ad6673fc7bdaf5a3e0` |
| `currentness.json` | `bff89fc88c53bba8f8f10d8c971bbaafcf44533863363b102767089c02d89e9f` |
| `shard-generate.json` | `0097f44a100929b5fcc967352e31e0a28f4a8974cb0027f58fdf4df24ed776d3` |
| `shard-check.json` | `d697ac77c260ee1fbe5007467d179c832c4c197ffc685d08b78f338e04ff7fdc` |
| `index-generate.json` | `7f1587f916ff9ed1e3e779229fe7657def3539570b1d9c53bc5e248914329d6e` |
| `index-validate.json` | `afb4ecf617bbcc044505b08a6fda5c9dd7575e5889df89e4db8e41852e246388` |
| `coordination.json` | `a7a906d97e05afa3eec03aded40a2428d67c353bc3292400bddad104e8584b8d` |
| `coordination-baseline.json` | `a7a906d97e05afa3eec03aded40a2428d67c353bc3292400bddad104e8584b8d` |
