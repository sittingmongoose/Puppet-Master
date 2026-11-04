# DR — Event Authority, final fix round 3

Branch `plans/ea-w2-runtime-artifacts-20261104`; reviewed head `a39121ebd79f660d9d651aecf45b3718b4ee6405`; implementation **`1ba1729437fe55d5609e3204f85f0f08bd1cb8a4`**. The report-only delivery head is pinned in external `drafts/DR/HEAD.txt`.

**Result:** 19/19 families self-graded prepared without admission, up from Astra's 0/19. All 228 cells were regraded: **190 PASS / 19 PARTIAL / 19 ABSENT → 209 PASS / 0 PARTIAL / 19 ABSENT**. Each family moves from 10 PASS / 1 PARTIAL / 1 ABSENT to 11 PASS / membership ABSENT. Independent acceptance remains integration work. Native execution remains NOT_RUN.

## Review round 3: findings and responses

- **B1 — fixed (`1ba1729437fe55d5609e3204f85f0f08bd1cb8a4`).** Where: `scripts/pm-runtime-artifact-event-drafts.py:39`, `:240`, `:502`; `Plans/runtime_artifact_event_drafts.fixtures.json`; ATS-260 at `Plans/Automated_Testing_System.md:7243`. Cause: Python `$` accepted a final LF and full-value equality could preserve that malformed digest. Fix: preserve historical schema IDs/bytes and every existing validator rule; add full-match guards for adopted anchored value patterns and patternProperties keys. Enforce them at payload decode, fresh append and original stored event/custody/result validation. Every family exercises custody digest LF/nonhex/short/long negatives; the seven affected payload families exercise all eight hash fields through schema, inline/packed decode, append and self-consistent stored copies. Shared guards cover exact event types, pack refs, checkpoint identifiers and tokens. Verification: the complete checker passes; removing the guard makes all nineteen fail, and injecting LF custody into the original positive input makes the complete checker exit 1 for all nineteen.
- **B2 — fixed (`1ba1729437fe55d5609e3204f85f0f08bd1cb8a4`).** Where: `scripts/pm-runtime-artifact-event-drafts.py:312` and `:433`; each family's `checkpoint_positives` fixture; ATS-260. Cause: advertised checkpoint schema/key routes and event/store joins were unchecked. Fix: resolve the exact adopted schema/pointer and root-key template, and give every family a concrete current root/generation, actual-shaped live ten-field token, selected-source adapter, complete single-event dataset and original receipt. Reuse SP-278's schema, binding codec and existing known-answer generation; join store/key/anchor/frontier/token/source/Project/event/value bytes/physical receipt coordinates and dataset coverage. Twenty independent faults per family must refuse, including wrong-store keys and checkpoint values, wrong selected source or custody, dangling pointers, stale frontier and nonexistent schema routes. The sixteen bundle-positive fault injections and both broken-route reproductions each make the complete checker exit 1 for all nineteen. This is synthetic relational evidence, not native source authentication, redb transactions or CAS.
- **Standing 3 additional gap — fixed (`1ba1729437fe55d5609e3204f85f0f08bd1cb8a4`).** Where: `full_value_matches` at checker line 218. Cause: valid writer output used the encoded partition, but self-consistent stored custody could carry the raw Project ID. The recorded pre-guard probe accepted it for 19/19. Fix: join original custody's encoded Project partition, exact event type and idempotency key to its EventRecord. Direct stored-copy negatives and removal of the partition join fail the full checker for every family.
- **Standing 4 additional gap — fixed (`1ba1729437fe55d5609e3204f85f0f08bd1cb8a4`).** Where: `stored_event_valid` at checker line 240. Cause: decode enforced 16 KiB, but self-consistent stored copies could bypass the inline boundary; the pre-guard probe accepted this in 19/19. Fix: enforce the existing limit at stored-value resolution as well. Both 16,385- and 17,000-byte stored-inline negatives refuse after commitments are recomputed. Removing only that stored limit fails the complete checker for every family.

**Disputed findings:** none. **Stopped for Jared:** none. **Open product questions:** none. This is the third and final fix round; no further review/fix cycle was started.

## All eight standing checks, per family

**P = pass; F = fixed in `1ba1729437fe55d5609e3204f85f0f08bd1cb8a4`; open = none.** Check 2 is Project-only refusal: these editions select no application writer, even with an exact CV-366 key. The numbered negative cases are recorded in `DR.standing-checks.json`; all execute inside the full checker. The mutation driver independently reruns that full checker and requires a structured failure for every affected family.

| Exact family | 1 policy | 2 app key | 3 partition | 4 inline | 5 exact match | 6 semantic | 7 checkpoint | 8 failure |
|---|---|---|---|---|---|---|---|---|
| `runtime_artifact.api_web_call` | P | P | F | F | F | P | F | P |
| `runtime_artifact.artifact_version` | P | P | F | F | F | P | F | P |
| `runtime_artifact.before_after_snapshot` | P | P | F | F | F | P | F | P |
| `runtime_artifact.browser_recording` | P | P | F | F | F | P | F | P |
| `runtime_artifact.code_diff` | P | P | F | F | F | P | F | P |
| `runtime_artifact.context_snapshot` | P | P | F | F | F | P | F | P |
| `runtime_artifact.cost_usage` | P | P | F | F | F | P | F | P |
| `runtime_artifact.document` | P | P | F | F | F | P | F | P |
| `runtime_artifact.evidence` | P | P | F | F | F | P | F | P |
| `runtime_artifact.failed_attempts` | P | P | F | F | F | P | F | P |
| `runtime_artifact.hitl_approval` | P | P | F | F | F | P | F | P |
| `runtime_artifact.implementation_plan` | P | P | F | F | F | P | F | P |
| `runtime_artifact.reasoning_summary` | P | P | F | F | F | P | F | P |
| `runtime_artifact.restore_point` | P | P | F | F | F | P | F | P |
| `runtime_artifact.screenshot` | P | P | F | F | F | P | F | P |
| `runtime_artifact.subagent_lineage` | P | P | F | F | F | P | F | P |
| `runtime_artifact.suggested_next_steps` | P | P | F | F | F | P | F | P |
| `runtime_artifact.tool_llm_trace` | P | P | F | F | F | P | F | P |
| `runtime_artifact.validation_test` | P | P | F | F | F | P | F | P |

For each family: (1) inline/packed fresh, retry and alternate IDs refuse projector_replay_only; (2) exact CV-366 and malformed application keys cannot enter its Project-only edition; (3) independently encoded writer and stored partitions reject raw IDs; (4) boundary positives and oversized inline/stored-copy/missing or corrupt pack negatives execute; (5) LF and malformed hash negatives cover payload and stored boundaries; (6) all 21 producer fields conflict while the three Storage fields stay excluded; (7) the exact checkpoint/source positive and twenty independent mismatch negatives execute; (8) return code zero is never a failure, and a failure expectation replaced by success makes the checker exit 1.

## Verification

**5,544 assertions pass**, including all pre-existing assertion groups. **Thirty full-checker mutation trials are caught**, each with exit 1 and failures for all nineteen families; guard-removal trials pin their mutated source hashes. The copied Astra driver runs **1,189 assertions, zero failed expectations**. Its only behavioral adaptation handles the strengthened fresh-append rejection returning `invalid` instead of dereferencing that refusal as a custody object; the head provenance was updated. It retains its original semantic/restore/replay/size/receipt assertions and whole-checker reproductions. No check is weakened.

The pinned `jsonschema==4.23.0`, `rfc8785==0.1.4`, `blake3==1.0.8`, `msgpack==1.1.2` environment is isolated. Shard generate/check, index generate and **parsed top-level index validate**, runtime-artifact schema validation and diff check all exit 0. The 15 ignored currentness files match the shared edition byte-for-byte. The self-grade quote audit validates **514 exact current-source excerpts across all 228 cells**.

Commands, exit codes, source hashes and every retained evidence path/SHA-256 are in `DR.checks.json`. Evidence lives in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-3/`. In particular:

| Evidence | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-3/fix3-draft-check.json` | `f6994e45138cc94f6930413af2d7d5c173e218908e6dfce6b32699abbacaea3c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-3/fix3-mutations.json` | `6188a29b00ab43c9f186b4418b453d8e58716c9a0d1b7ff3b3971c491146b27f` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-3/fix3-mutations.log` | `7d751b5ec61d00e8169a75139c0ecfce05f87c042909ae4c6d5bb0a96b31f798` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-3/fix3-astra-probes.py` | `92cc592fcb9e695f8f99365b74dec152aac91942054c4de2bc9c2ea0f3541481` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-3/fix3-astra-probes.json` | `d978e6232cc0761a8102501b741acdff56fe74c2cc29b0b0fc3d24786bee7c35` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-3/fix3-extra-pre-guard.json` | `d681b2d2f5c713e6958b9592d24b940e39925f5d829bd7a212cfd2d420f8ab4c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-3/fix3-index-generate.log` | `3199c26f6046dd9146ec54cd6496f0ef2a6aa8ae3c0123ea82acda3915cbe2dd` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-3/fix3-index-validate.log` | `a77caa2e35f02f9171233b1c79525c5df80317f11313af0a4ba634e6e7b0a6cc` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-3/fix3-shard-generate.log` | `fafb1c33a567c68de84f9f26c3cbd2828d5f49a400771374af7218463f00b5d2` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-3/fix3-shard-check.log` | `10cde07211161ba5007ce9acf94b977462852fb760eea82736b42c96996d0c85` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-3/fix3-schema-check.log` | `ad0f9b097aabd7df59731ac1ed213ca9d025874a093cd29433bf6824707f5527` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-3/fix3-scope-audit.json` | `3bae6586e38ea82c5ccfca6b63623da2088d9ea0a0c768f361e6fe72e7fb931b` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-3/fix3-currentness-copy.json` | `1b765b9ac2ab42d60576eba5c1f1edd03454965e434717497da8cbcf32c009bf` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-3/fix3-grade-source-audit.json` | `18e514f7fc9ee8f8bfdf58c88fcfe23175bbc57149bcafe03f685985f04c4d3a` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-3/fix3-dependencies.log` | `787c0de158dbac700207643d8950bdaa056bc8d8198255cc9e2c5bb72e867a69` |

## Authority, premises, scope and IDs

No new durable binding or product decision is authored. Each family's existing SP-520..538 adoption is instantiated separately using the existing SP-278 checkpoint machinery; no sibling contract substitutes for it. The original per-family searches remain pinned by the prior report: `drafts/DR/canon-search.json`, SHA-256 `94c22a7cf45511240628db8dbe4cfe94e8da51b545eba8d8dae04b333d999bac`, and `drafts/DR/fix-round-1/canon-search.json`, SHA-256 `ca087c26e09c210688290cda3ead21bc309c4a5899e5111e29ad8cb548433556`.

DL-045's technical authority, DL-075's indefinite event history, DL-076's nine-field durable-token rule and DL-270/SP-337's inline/pack boundary retain their premises. No additional old decision is applied this round. The five premise-owner files have no differences between reviewed main `5e37ffb616ec393af9097a198a9fc78dee9b8605` and fetched `origin/main` `16acf7594a3fe8559af89491b895f440b314b99e`. **Failed premise checks: none.** Event/index/checkpoint/body/Usage/restore-point retention assignments remain their existing separate assignments. These stateless readers persist no token.

Authored changes: ATS-260, the DR fixture/checker, and the new full-checker mutation driver. Derived changes are only the ATS owner's 52 shard files and six standard global index outputs. The three per-family RAP/SP/CV owner documents and all historical payload/receipt/checkpoint schemas are unchanged. Report and self-grade files are the delivery follow-up. No registry, admission, stored-value row, Decision Log, Spec Lock, evidence/governance seal, auto-decision, frozen validator, .gitignore or test file changes.

**IDs:** existing **58** — RAP-100..118, SP-520..538, CV-520..538, ATS-260; **new IDs zero**. This round edits only existing ATS-260 owner prose. Start resources were 15 GB available RAM / 111 GB free disk, above 6 GB / 50 GB thresholds; subsequent checks stayed above them. No mailbox command, subagent, landing lock or main push ran. The sparse detached `/home/sittingmongoose/pm-worktrees/DR-fix3` and temporary venv are removed after the pushed delivery and written final message.

Native source parsing/authentication, real payload sync, append receipt issuance, redb snapshot/CAS, crash recovery, coherent backup/restore and GUI execution remain NOT_RUN. This report requests no governance reseal or admission; those remain separate integration work.
