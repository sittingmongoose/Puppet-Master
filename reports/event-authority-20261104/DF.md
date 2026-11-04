# DF — review round 3 fixes

Branch: `plans/ea-w2-filesafe-20261104`. Starting reviewed head: `bd0000e139825d8e99260de647f2421026eadb42`. Assessed repair head: `223e52e83e7b4147d371005d1c0d0a7621fa515c`. The subsequent report/self-grade commit changes no assessed source or derived artifact. This is the third and last permitted fix round; no further review was spawned.

All nine families are prepared with B8 repaired in the static contract/checker scope. Membership remains ABSENT, native execution NOT_RUN, and seven event-history retention questions remain pending. No emission permission, native payload-pack proof or 12/12 admission is claimed.

## Review round 3: findings and responses

- **B8 — fixed (`223e52e83e7b4147d371005d1c0d0a7621fa515c`). Where:** `scripts/pm_filesafe_event_authority.py:164` / `418`, `scripts/pm_filesafe_event_contracts.py:52`, each of the nine own payload/source schema roots and source graph resource pins, CV-550..558 and ATS-275..279. **Why:** the old materializer required a null reference without measuring the complete inline semantic body, and retained issued lookup had no independent byte-budget check. **Fix:** enforce SP-337's complete canonical UTF-8 JSON byte budget before original acceptance/append and on issued/retained-boundary copies. Exactly 16,384 bytes is inline-valid; 16,385 refuses as inline_payload_too_large. Larger semantic bodies use verified BLAKE3/byte-size/media-type references with empty stored inline payload, canonical decoding, exact original-source joins and selected durable synthetic pack/index custody. Recovery, terminal publication, retry and rebuild cannot accept oversized or unavailable stored copies. Each family has ASCII/UTF-8 exact-boundary negatives, isolated consistently committed oversized issued negatives, valid reference positives in both scopes, reference corruption/loss/durability negatives and full writer/refusal/recovery/retry traces. Verify `full-mutations.py standing`, both checker entry points and `standing-checks.json`; the review's original 18 B8 invalid originals now produce 18 of the deliberate CLI failures.
- **B1 — fixed previously (`42b9a62384`); regression PASS.** Both safe-point families' complete application originals remain closed. Re-encoded/rehashed wrong safe-point subjects and manifest counts refuse; restored's impossible cursor refuses. `full-mutations.py B1-B7` passes these independent mutations through the complete checker; all preserved original Project resources remain byte-identical.
- **B2 — fixed previously (`42b9a62384`); regression PASS.** For all nine families in both scopes, issued-row loss, custody loss and changed first receipts fence recovery, terminal publication and cached retry, including a second crash. The unchanged own full-checker traces and independent `cycle3-regression-probes.py` cover every earlier mutation.
- **B3 — fixed previously (`42b9a62384`); regression PASS.** Every family/scope refuses reduced retained sets before constructor/cutoff/rebuild/publication, pending owner work and source/reader generation races. Intact retained custody still supports retry/rebuild after original controls are disposed. B2/B3 total 396 independently asserted refusals plus valid disposed-control paths; the original authored protocol traces pass unchanged.
- **B4 — fixed previously (`42b9a62384`, `a73fe06f23`); regression PASS.** Own granted/policy_degraded retain the existing authority-indefinite / 2,555-day diagnostic defaults. Across all nine, four assignment probes each give exactly one valid policy. Three full-CLI graph mutation batches rehash the graph and apply each wrong alternative per family; all 27 mutations fail. Each batch returns exit 1 and exactly 18 diagnostics: retention_changed and the existing wrong_retention_assignment_accepted invariant for each family. The mutation harness originally expected one diagnostic per family; its assertion was corrected to require both existing diagnostics and rerun. No owner question was answered or expanded.
- **B5 — fixed previously (`42b9a62384`); regression PASS.** All 15 ignored currentness inputs match the shared edition by SHA-256, all 269 inventoried sources exist, index generation/validation pass, and committed readiness has zero false missing-source rows. Removing inventoried ledger_registry.json makes the actual full index validator exit 1/status fail, then exact restoration returns validation to pass (`B5-index-mutation.py`).
- **B6 — fixed previously (`655a0d97e8`); regression PASS.** Every family/scope refuses projector_replay_only at original materialization, owner_commit, prepare, append, receipt and both retry paths: 126 independent assertions, plus full-checker replay refusal traces. The Storage semantic digest remains byte-unchanged.
- **B7 — fixed previously (`655a0d97e8`); regression PASS.** All five application restore outcomes refuse rehashed wrong result pointers and delete against live targets; full-checker mutations pass. The 45-case independent journal group retains 39 expected refusals and six valid metadata/unchanged controls. Earlier valid null-pointer/create/delete/metadata positives remain unchanged.

No finding is disputed. No technical review finding remains open.

## Family grades before and after

Before is the independent cycle-3 review. Counts are PASS / PARTIAL / ABSENT. Only positive_negative_oracles changes PARTIAL to PASS; all other cells are checked against their own evidence. The 108 cells and all refreshed citations pin the assessed repair head.

| Family | Before | After |
|---|---|---|
| `filesafe.command_denied` | 9 / 2 / 1 | 10 / 1 / 1 |
| `filesafe.destructive_override_denied` | 9 / 2 / 1 | 10 / 1 / 1 |
| `filesafe.destructive_override_granted` | 10 / 1 / 1 | 11 / 0 / 1 |
| `filesafe.destructive_override_requested` | 9 / 2 / 1 | 10 / 1 / 1 |
| `filesafe.guard_init_failed` | 9 / 2 / 1 | 10 / 1 / 1 |
| `filesafe.path_denied` | 9 / 2 / 1 | 10 / 1 / 1 |
| `filesafe.policy_degraded` | 10 / 1 / 1 | 11 / 0 / 1 |
| `safe_point.created` | 9 / 2 / 1 | 10 / 1 / 1 |
| `safe_point.restored` | 9 / 2 / 1 | 10 / 1 / 1 |

## Standing checks per family

1 replay-only refusal; 2 exact CV-366 application key; 3 encoded Project partition; 4 SP-337 inline bytes/reference/stored copies; 5 trailing-LF guards; 6 caller semantic retry comparison; 7 storage identity joins; 8 failure exit codes. **F = fixed by the assessed repair commit above; P = pass.** Every cell has an own-family negative case in standing-case-map.json and a complete-checker result. The deliberate failure suites are expected to exit 1; their wrapper fails if either checker exits 0 or reports success.

| Family | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| `filesafe.command_denied` | P | P | P | F | P | P | P* | P |
| `filesafe.destructive_override_denied` | P | P | P | F | P | P | P* | P |
| `filesafe.destructive_override_granted` | P | P | P | F | P | P | P* | P |
| `filesafe.destructive_override_requested` | P | P | P | F | P | P | P* | P |
| `filesafe.guard_init_failed` | P | P | P | F | P | P | P* | P |
| `filesafe.path_denied` | P | P | P | F | P | P | P* | P |
| `filesafe.policy_degraded` | P | P | P | F | P | P | P* | P |
| `safe_point.created` | P | P | P | F | P | P | P* | P |
| `safe_point.restored` | P | P | P | F | P | P | P* | P |

*Check 7 is precise about coverage: every family has family_checkpoint=none_required, so there are zero family checkpoint positives. Complete original/event/receipt positives join Storage instance and partition; mismatches fail the full authority checker. All nine SP units independently adopt the generic SP-278/DL-076 nine durable token fields, fresh live snapshot, generation and CAS boundary. Actual generic native checkpoint/token/CAS execution remains NOT_RUN; receipt probes are not represented as execution of that protocol.

Standing negatives: replay_only_not_appendable; wrong application version/prefix/suffix; raw Project partition; complete 16,385-byte ASCII/UTF-8 inline body and consistently committed issued copy; trailing LF on source/body/receipt/hash/descriptor identifiers; changed caller semantic body with metadata-only positive controls; cross-Storage/partition receipt and changed-store retry; a valid materialization/payload deliberately labelled negative. Every family has all applicable negative shapes. No standing cell is open in the implemented static scope.

## Checks and exact limits

| Check | Exit | Result |
|---|---:|---|
| Full authority checker, every standing case | 0 | top-level pass: 131 positives, 1,570 negatives, 684 protocol traces |
| Full payload checker | 0 | pass: 92 positives, 186 negatives, 18 identity vectors |
| ASCII and multibyte exact-boundary cases | 0 | 108 family/scope/alphabet/size cases; 16,383 and 16,384 accepted; 16,385 refused |
| Complete semantic-body references | 0 | 18 positives; independently verified BLAKE3/length/media, 16,385 external bytes and empty 2-byte inline JSON object |
| Full checker deliberate failure controls | 1 / 1 | authority exactly 27 expected failures (nine valid negatives + 18 review B8 invalid positives); payload exactly nine |
| Full checker independent B1/B7 negatives + B6 traces | 0 | pass; original source relationships maintained and bodies re-encoded/rehashed |
| Full checker B4 wrong assignments, three batches | 1 each | expected refusal: nine wrong policies and 18 exact diagnostics per batch |
| Independent eight-check probe suite | 0 | 126 replay refusals, 432 retry comparisons, 108 guarded anchored patterns, 144 composed LF mutations, 45 journal cases; zero B8 acceptances |
| Independent B2/B3 earlier mutation audit | 0 | 396 refusals, zero prior counterexamples accepted; valid disposed-control paths retained |
| Shard generate / check | 0 / 0 | only Contracts and Automated Testing shard directories changed |
| Index generate / validate | 0 / 0 | parsed top-level pass; 15 exact currentness files, all 269 inputs, zero false missing-source rows |
| Full index missing-source negative | 1 | expected fail; source restored byte-for-byte, final validate pass |
| Scope / preservation / citation audit / diff check | 0 | old 41 positives / 1,300 negatives / 468 traces unchanged; original payload rows and Project resources unchanged |

Readiness remains blocked_runtime_certification_incomplete. Existing governance/currentness drift remains visible; no reseal, governance clearance, family admission or native certification is claimed. Native physical payload packs, fsync, permission/hold/deletion and generic checkpoint/CAS are NOT_RUN. The targeted checker search found the DF authority entry point and its imported payload owner; both ran in full. No test file was edited.

## Exact retention questions stopped for Jared

Each question is copied exactly from its own SP retention paragraph. The five security questions do not reopen a runtime class; the two snapshot-history questions explicitly separate already-governed originals. These are the remaining cells, not unfixed technical review findings.

- **`filesafe.command_denied`:** Does the retained command-denial EventRecord constitute audit authority (RP-AUTHORITY-INDEFINITE), or non-authority security diagnostic history (RP-OPERATIONAL-2555D)?
- **`filesafe.destructive_override_denied`:** Does the retained destructive-override refusal EventRecord constitute an authority decision receipt (RP-AUTHORITY-INDEFINITE), or non-authority security diagnostic history (RP-OPERATIONAL-2555D)?
- **`filesafe.destructive_override_requested`:** Does the retained destructive-override request EventRecord itself constitute approval/audit authority (RP-AUTHORITY-INDEFINITE), or non-authority security diagnostic history (RP-OPERATIONAL-2555D)?
- **`filesafe.guard_init_failed`:** Does the retained fail-closed guard-initialization EventRecord constitute audit authority (RP-AUTHORITY-INDEFINITE), or non-authority security diagnostic history (RP-OPERATIONAL-2555D)?
- **`filesafe.path_denied`:** Does the retained path-denial EventRecord constitute audit authority (RP-AUTHORITY-INDEFINITE), or non-authority security diagnostic history (RP-OPERATIONAL-2555D)?
- **`safe_point.created`:** Is safe_point.created EventRecord history an authority/capture receipt (RP-AUTHORITY-INDEFINITE), non-authority recovery operational history (RP-OPERATIONAL-2555D), or runtime history (RP-RUNTIME-365D), independently of the already-governed released snapshot bodies?
- **`safe_point.restored`:** Is safe_point.restored EventRecord history an authority/outcome receipt (RP-AUTHORITY-INDEFINITE), non-authority recovery operational history (RP-OPERATIONAL-2555D), or runtime history (RP-RUNTIME-365D), independently of the already-governed original restore transaction and snapshot bodies?

## Current premises, bindings and scope

The nine own CV-550..558 paragraphs each explicitly adopt the current EventRecord envelope limit (Contracts_V0:1019) and SP-337/DL-270. `payload-binding-searches.json` records each family's separate current-owner search and negative evidence: the previous null-only materializer had no complete-semantic-body reference codec; the existing large file-blob fixture did not exercise EventRecord inline limits. Newly authored per-family technical bindings are the canonical JSON descriptor in the existing string payload_ref, the own closed payload_reference schema root and strict synthetic pack/index selection/readback. They implement already specified SP-337 behavior, without a new product feature, public command, persisted family or envelope field. No premise check failed.

Unchanged premises: DL-045 still covers all nine exact names; F2-213/CV-366 still own application and encoded Project scope; SP-286/CV-339 retain full-value original custody; SP-278/DL-076 retain generic token/CAS; SP-336/SP-347 retain durability; granted and policy_degraded retain current governed defaults. The shared EventRecord schema, append-receipt roots, Storage-owned semantic digest, original Project resources, storage value registry, event family registry, Decision Log and Storage owner prose are byte-unchanged in this round. The seven exact questions above select no deletion, original-body, transaction, snapshot, index or checkpoint lifetime.

Shared owner hunks: added only each own CV-550..558 SP-337 paragraph and each named family's ATS-275..279 mandatory regression paragraph. Companions: nine payload schema comments, nine source schema descriptor roots/resource graph pins, two DF fixture packs and two DF checker entry points. Derived shards/indexes were generated, never hand-edited. No files for another owner document changed.

IDs used: existing **CV-550..558, SP-550..558, ATS-275..279**. No new IDs; CV-559/SP-559 remain unused. No registry append, admission, exclusion, Decision Log entry, storage-value addition, .gitignore/Spec Lock/auto_decisions/evidence/frozen-validator edit, main push, landing, subagent or additional blind review.

## Resources and cleanup

Before worktree creation: 21 GiB RAM available and 134 GB disk available, satisfying the 6 GiB / 50 GB stop rules. Later: 18 GiB / 148 GB. Work used the required sparse detached `/home/sittingmongoose/pm-worktrees/DF-fix3` from the local clone and pinned lane head. The protocol's no-mail rule was followed after loading it; the initial read-only inbox preceded that read, and no registration or message was sent. All mutation inputs restore byte-for-byte. No server/browser was started. After the report/grades and source are pushed and copied, the temporary worktree is removed with a literal path. Nothing is landed.

## Evidence custody

Reproduction scripts and full outputs: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix3/`. The report and ten self-grade files are copied to `drafts/DF/`. Full technical manifest: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix3/manifest.json`, SHA-256 `0f837cef96e773da16bde34cea7d9bf8f8972b06f9bd19a52517efe128d0f3f0`. It inventories every retained script/output by absolute path and SHA-256. Key evidence:

| Path | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix3/standing-checks.json` | `110ae5b1ee8e045ea31badb837ab0f7a10d8de1bccc165d1b09865aabb957bc3` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix3/full-mutations-standing.json` | `097bbcfb730c8837fcd9401bf95d01971e9bea5ce7034308319d307f48c9e51e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix3/full-mutations-failure.json` | `74c5ddf3c051b5eb1c399e9ebc5002fc1c0df0658506f8f12864b3c22e1ba597` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix3/full-mutations-B1-B7.json` | `5a2814c50ea400529c60bec38b0bbcacf31168d4855475f76b179c1369845c7e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix3/full-mutations-B4.json` | `692d6eae846c36021d1328217d3e2de028deaaff637ec93046cc1b23acd678e6` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix3/B5-index-mutation.json` | `e4c6990c8da686970cf121810427cf6addf8aecf73811f7b1481200a04809867` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix3/scope.json` | `6586d67e61c311369fa17f5cd54bdd171df17f3d4fb66c950e8ec16951e17d44` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix3/grade-citations.json` | `300dceb37c83f4f8dc26483363eaf4d3108f8005339c3ad0f09d15a9671d2523` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix3/index-validate.result.json` | `1643f99b4f175b0e234a1fcf050b935667ae1c9d4a9102f48e03f51dff136dc0` |
