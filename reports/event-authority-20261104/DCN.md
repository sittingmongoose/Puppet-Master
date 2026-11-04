# DCN — Card 2 names, prepared without admission

Base `origin/main`: `16acf7594a3fe8559af89491b895f440b314b99e`. Branch: `plans/ea-w3-card2-names-20261104`. Source commit: `66480989f15aa8bf48fbd6c2dd2017caadc26c50`. Native execution: **NOT_RUN**. Independent review: **not run by this worker**.

**Scope count:** DCN is assigned 17 names: 7 Browser + 8 memory + 2 already-retired names. All 17 are handled. The lane also explicitly lists `chat.response_stop_requested` as **not yours**, assigned to DCH; including that held name gives 18 overall. This branch leaves that name to DCH and does not extend DCN’s scope.

## Per-row outcome

| Name | Outcome | Contract / current evidence |
|---|---|---|
| `browser.session.created` | Prepared, no admission; **11 PASS / membership ABSENT** | `SMPFS-244` / `CV-780` / `SP-760` |
| `browser.session.state_changed` | Prepared, no admission; **11 PASS / membership ABSENT** | `SMPFS-245` / `CV-781` / `SP-761` |
| `browser.session.closed` | Prepared, no admission; **11 PASS / membership ABSENT** | `SMPFS-246` / `CV-782` / `SP-762` |
| `browser.session.promoted` | Prepared, no admission; **11 PASS / membership ABSENT** | `SMPFS-247` / `CV-783` / `SP-763` |
| `browser.session.takeover_state_changed` | Prepared, no admission; **11 PASS / membership ABSENT** | `SMPFS-248` / `CV-784` / `SP-764` |
| `memory.gist_state_changed` | Prepared, no admission; **11 PASS / membership ABSENT** | `AMS-130` / `CV-785` / `SP-765` |
| `browser.session.navigated` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-405; Plans/storage-plan.md:1309 |
| `browser.session.resized` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-405; Plans/storage-plan.md:1309 |
| `memory.gist.verification_requested` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3179 |
| `memory.gist.verified` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3179 |
| `memory.gist.verification_failed` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3179 |
| `memory.gist.updated` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3179 |
| `memory.gist.pinned` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3179 |
| `memory.gist.unpinned` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3179 |
| `memory.gist.discarded` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3179 |
| `dashboard.widget_added` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-180; Plans/UI_Command_Catalog.md:16973 |
| `coordination.debug_mirror_exported` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-270; Plans/storage-plan.md:553 |

Exclusions preserve every legacy bucket, category and cohort pin and claim no denominator removal. `individual-disposition/LEDGER_WRITE_RULE.md` reserves the canonical union merge for the parent. This worker updates the 11 exact `rows/ROW_*.json` files and census lines and supplies `individual-disposition/deepen/DCN/LEDGER.jsonl`; the canonical union stays byte-identical to the base. The application JSON records all original/final row hashes and the census hashes. Widget/mirror exclusions overlap DS’s unlanded records: reconcile by exact name and current citation, never double-count them.

## Newly authored bindings and per-family search

Every family was searched independently across live top-level `Plans/*.md`, all top-level `Plans/*.schema.json`, the central registry and Browser admission manifest. Generated mirrors and source-lineage ledgers were excluded. Existing name occurrences are retained with paths/lines in the pinned external search file. None supplies this exact family’s complete payload, history-reader, operation identity or withdrawal contract. The six families are in DL-045’s original scope; DL-046 is reused only for the existing Browser Program relationship and generic Browser source owners, never as membership for these five manual families.

| Family | New Project / application payload IDs | New reader (version 1.0.0) |
|---|---|---|
| `browser.session.created` | `pm.browser.session.created.payload.v1` / `pm.browser.session.created.payload.application.v1` | `reader.browser.session.created.history` |
| `browser.session.state_changed` | `pm.browser.session.state_changed.payload.v1` / `pm.browser.session.state_changed.payload.application.v1` | `reader.browser.session.state_changed.history` |
| `browser.session.closed` | `pm.browser.session.closed.payload.v1` / `pm.browser.session.closed.payload.application.v1` | `reader.browser.session.closed.history` |
| `browser.session.promoted` | `pm.browser.session.promoted.payload.v1` / `pm.browser.session.promoted.payload.application.v1` | `reader.browser.session.promoted.history` |
| `browser.session.takeover_state_changed` | `pm.browser.session.takeover_state_changed.payload.v1` / `pm.browser.session.takeover_state_changed.payload.application.v1` | `reader.browser.session.takeover_state_changed.history` |
| `memory.gist_state_changed` | `pm.memory.gist_state_changed.payload.v1` / `pm.memory.gist_state_changed.payload.application.v1` | `reader.memory.gist_state_changed.history` |

Per-family new identity contracts also bind the original operation component (`event_type + ":" + original operation ID`), stable `owner_change_id`, Project `card2@1` key and global event-ID recipe. Application idempotency uses CV-366 exactly: `application@1:{hex(server_id)}:{hex(component)}`. Identical semantic changes seen through manual-session and workspace/controller owners share a change ID; distinct real changes remain distinct. No record reference is used as cross-owner fact identity.

**Reuse:** `projector.storage.event_record_index@1.0.0`, `reader.storage.event_record_index@1.0.0`, the real `event_record_index_checkpoint.v1:{storage_instance_id}` generation value and complete SP-278 source token. These are the exact generic index roles, not a sibling’s family binding. Each family explicitly has no independent durable projection/checkpoint (`none_required`), so no new checkpoint/storage registry row or derived retention policy is created. Its reader returns only an ephemeral answer, revalidates complete frontier/source/access/deletion fences and never advances generic progress.

## Premise checks

- **DL-045:** each of the six names is still present in its exact approved 285-family scope. Current partial definitions are documented by the per-family searches. No technical permission is extended to a new feature.
- **DL-046:** Browser Program still has its 53-name census and existing workspace identities. The five manual names are outside that census and remain DL-045 work; the session’s `workspace_id` links to the actual Browser workspace.
- **DL-405 / Card 2a:** the current manual commands still name exactly the five surviving events. Navigate/Reload declare no session event; Storage stores the current URL/viewport. The new rule is at both the behavior owner and actual Storage session record/list.
- **DL-407 / Card 2c:** Contracts still names the single gist-state candidate, while UCC-084 named seven button histories. The new contract covers verify/edit/pin/unpin/discard and every real automatic mutation, including new gists and automatic verification. Requested, failed and unchanged verification retain their command result only. Memory section 7.2 and DL-402/403 are not edited.
- **DL-401 / Card 1 G03 and G10:** exact per-name indefinite assignments are read from the pinned unlanded retention source and adopted without changing their terms. This branch must integrate with that source, not restate a competing policy.
- **DL-180 / UCC-202:** the old dashboard table row is explicitly amended and its event withdrawn.
- **DL-270 / SP-339:** mirror files and their writer/event are retired. Residual prepared Contracts minima do not authorize new mirror writes.

**Failed product-premise checks:** none. **Owner-decision rows stopped:** none among the 17 named rows. The separate Stop row remains out of scope under the lane’s explicit assignment.

## Standing checks 1–11

| Check | Evidence |
|---|---|
| 1 | Every family/scope has a current-writer/retry `projector_replay_only` negative. |
| 2 | Application key formula is exactly CV-366 with the explicit original operation component hex-encoded. |
| 3 | Project positives use Storage’s `project~` + unpadded UTF-8 base64url partition. |
| 4 | Closed metadata roots have worst-case bounds below 16 KiB (Browser below 4096 bytes, memory below 6144 bytes); SP-337 reference transport is required for any separately governed larger successor. |
| 5 | Recursive full-match accompanies identifier patterns; payload and token trailing-LF negatives reject. |
| 6 | Retry comparison uses the exact central producer-semantic fields; positives alter only Storage-assigned sequence/observation times. |
| 7 | Generic token/source storage identity must match the event; foreign checkpoint, frontier and snapshot negatives reject. No new persisted family checkpoint exists. |
| 8 | Failure-driver subprocess exits 1; success is refused by the negative test driver. |
| 9 | All local schema references resolve; an injected unresolved reference exits nonzero. No network resolver fallback. |
| 10 | Every family/scope has retained-event positives with absent/mutated live subjects; forged and withdrawn sources still reject. |
| 11 | Every negative has exactly one named failing predicate. Removing each actual guard flips all and only its own negatives; the remaining negatives still reject for their own reason. Observational copies are kept coherent. |

## Guard-removal table

Synthetic oracle status: **PASS**, 59 positives, 368 negatives. Native proof stays NOT_RUN.

| Guard removed and restored | Own negatives that flip | Other negatives still rejected |
|---|---:|---:|
| `schema` | 24 | 344 |
| `scope` | 12 | 356 |
| `source` | 50 | 318 |
| `transition` | 36 | 332 |
| `double_record` | 12 | 356 |
| `replay_only` | 36 | 332 |
| `identity` | 24 | 344 |
| `first_receipt` | 12 | 356 |
| `retry` | 24 | 344 |
| `token_schema` | 24 | 344 |
| `token_join` | 36 | 332 |
| `historical` | 24 | 344 |
| `access` | 24 | 344 |
| `reader_effect` | 24 | 344 |
| `command_only` | 6 | 362 |

The self-grade JSON includes the exact negative names in both table columns. Guard names are the actual predicates in `scripts/pm_card2_events.py`; they are removed one at a time by that executable oracle. Native authentication, source parsing, redb CAS/snapshots, wire durability, first-receipt issuance, crash/restore and physical deletion remain separate required implementation obligations. Static observations are not proof of those native facts.

## IDs and source/companion scope

`SMPFS-244..248` (main highest SMPFS-184 + 60), `SP-760..765`, `CV-780..785`, `AMS-130`, `ATS-380`: 19 new PlanUnits. Every origin branch (519 refs) was scanned across all current top-level Plans owner documents, deduplicating 1345 immutable blobs; no collision. UCC-084 and the actual memory command table are amended in place. The test-file path `tests/test_pm_card2_names.py` is ignored by the general `/tests/*` rule, with no explicit `!` allowance, so no test file is added; the executable suite lives under `scripts/`.

The two machine-memory paths required by the brief are absent on Nas1. Searches of both available `.claude-t3` account trees found no copies. The lane’s explicit ID allocations govern, and the currentness edition was copied and file-by-file SHA-256 verified before index generation. No missing-memory default was invented.

## Checks

| Check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | Top-level `pass` |
| `python3 scripts/pm-plan-index.py generate` | 0 | Top-level `pass` |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | Top-level `pass` |
| `python3 scripts/pm-plan-index.py validate` | 0 | Top-level `pass` |
| `python3 scripts/pm_card2_events.py` | 0 | PASS: 59 positives, 368 negatives, all 15 guards removed/restored with only their own negatives flipping. |
| Browser Program semantics unittest | 0 | 10 tests pass. |
| Browser event admission checker | 0 | 53 positives, 576 negatives; no failures. |
| Browser admission unittest | 1 | 38 tests, 30 failures at the same pre-existing upstream40 fingerprint assertion. Test/code/registry/manifest/fixture inputs are byte-identical to the base; the baseline witness reproduces the mismatched base fingerprint. |
| Coordination checker | 1 | Two pre-existing machine-input failures: payload-definition census and coordination projection value-schema mismatch. Both failing sections reproduce on immutable base inputs. |
| Injected failure / unresolved-schema-reference subprocesses | 1 each, expected | Both fail closed; the driver asserts success exit codes are invalid. |
| Exact grade citations / exclusion hashes / hard limits / `git diff --check` | 0 | 72 exact citations and eleven final row hashes verify; protected files and canonical union unchanged. |

`DCN-checks.json` records commands, exits and the guard counts. The full guard case lists are in `DCN-self-grade.json`. Index coverage passes; `blocked_runtime_certification_incomplete` remains the expected native-proof boundary, not a static validation failure. Every cited baseline failure is reported, not repaired outside this lane.

## Integration items and limits

1. Integrate the pinned answer and retention branches before admission. Do not append any family from this branch merely because its static suite passes.
2. Parent merges the 11 local disposition rows into the canonical individual union under its ledger write rule, preserving buckets/cohorts and reconciling DS’s two overlapping exclusions.
3. The lane’s separate Stop row belongs to DCH and remains untouched.
4. No main push, landing lock, admission record, registry append, Decision Log write, frozen-validator edit, reseal, governance artifact edit or policy choice was performed. Expected governance staleness belongs to the integration/reseal owner.

## Evidence paths and SHA-256

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/per-family-search.json` — SHA-256 `cebdbe820b9e43da54b2b8ee64ee892d262f50ef54b5c9531b3d63fb68d571fb`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/id-scan.json` — SHA-256 `3bd122facb0cca719becee8b79a5ec5ceb5a93051dd5314fa4f0beb0c13fe731`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/currentness-copy.json` — SHA-256 `e86c3eb59f33f0311d29561d52d4ecc90ad5155fe481a82e4074bc3ead0c13f5`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/payload-size-bounds.json` — SHA-256 `64658663c4d1d504c7d506548d20f19278cf4e4d491b0eda2e5f8c3f04149ab0`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/decision-inputs.json` — SHA-256 `b6001cc93221825e956308f58c70753e7b18675b10deedaefe95962877784b10`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/oracles.json` — SHA-256 `5270a1472565b531b45052fb3a68a251caa0364f5a3f5b23a83dc69cf489807d`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/infrastructure-checks.json` — SHA-256 `5e1e70ca7fde164b14c4d9c9edc2799347b861be42c00add564349f47e4b3a57`.

The exact append policy selected by each prepared companion contract is `dedupe_by_idempotency_key`; the suite also rejects the other two current append policies for these bindings, as well as compatibility-reader-only `projector_replay_only`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/derived-checks.json` — SHA-256 `76c74e3e4e3a91bbfa80fa929b1029b7a2da9627db367bf7a772b04e93a47258`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/targeted-checks.json` — SHA-256 `3e7cd1aad75e29176c267d973b643d1f88c24b77478900a9c363c1f2d1fbad3c`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/browser-test-baseline-witness.json` — SHA-256 `d7da08268712ac1e61dbb2fa77e62ea30d7eb7a60007318cfedcd3206041571b`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/coordination-baseline-witness.json` — SHA-256 `c11869809dfcc0711ca686d4fa1d11b7f9244cf1b9c4c489432cf5af2d9e4c95`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/hard-limit-check.json` — SHA-256 `c742505e23330f87dea367c91e3d11cc30ee53a5c150a25c69541f1e5509d447`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/scope-and-citations.json` — SHA-256 `c40028c8dab1f9c0c9246dbe38bf842d37263f1bd97d359e7e9335ef581ca2cf`.
