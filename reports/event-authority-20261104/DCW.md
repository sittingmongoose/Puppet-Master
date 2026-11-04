# DCW — fix round 4, Event Authority

Branch: `plans/ea-w2-chain-wizard-20261104`. Worker: **DCW-FIX4**, VM. Reviewed head: `3f91eece872b0c2266172c9204e842e9e66ecc21`. Assessed implementation: `1e9ca78cc51fafd184cb8e86e69fe333d54e7f0e`. This authorized extra round repairs the two standing-check findings only.

**Worker self-grade: 0/6 prepared passes before → 6/6 after (6/8 assigned).** Before is Astra's independent review, not the earlier worker claim. Each prepared family has 10 PASS / 1 PARTIAL / 1 ABSENT. Membership remains ABSENT, retention remains PENDING_RETENTION_DECISION, and native adapters remain NOT_RUN. `wizard.blocked` and `wizard.unblocked` stay held on their unchanged exact questions.

## Review round 4: findings and responses

1. **F1 — fixed (`9728165bc635d0c0383dd621075f686fb230dc78`). Where:** `scripts/pm_dcw_event_oracles.py:471`, with exact-family `compatibility_forged_*` cases in `Plans/dcw_event_contract_fixtures.json`. **Why:** compatibility replaced the supplied view before comparing its full value. **Fix:** normalize only the explicitly allowed transient replay policy, authenticate every other supplied field against the retained original, then verify its recorded producer-semantic digest, full-value commitment and original first receipt. All 30 Astra payload/actor/sequence/Storage-time/source-time forgeries now refuse; the complete CLI accepts each correctly classified negative. Retained reads survive writer cutoff, obsolete writer CAS, unknown current effects and later resumed source phases. Withdrawal, foreign partitions/Storage identities and forged originals still refuse. Referenced-body compatibility reads obey the same authentication.

2. **F2 — fixed (`1e9ca78cc51fafd184cb8e86e69fe333d54e7f0e`). Where:** CV-590–595 in `Plans/Contracts_V0.md`, all six exact-family payload schemas, and `scripts/pm_dcw_event_oracles.py:164–235,430`. **Why:** JSON sizing rejected valid canonical MessagePack bodies at exactly 16 KiB; contracts admitted no overflow event transport. Source-record overflow did not solve event-body overflow. **Fix:** each family's own CV unit adopts SP-337, preserving the existing shared EventRecord schema. Measure the actual SP-026 canonical MessagePack body bytes. Exactly 16,384 inline accepts; 16,385 inline refuses `inline_limit`. Larger bodies use an empty inline stub plus a compact sorted-key JSON descriptor string in `payload_ref`, with exact BLAKE3/byte_size/family media type. Resolve and validate the complete closed logical payload, exact canonical bytes and original source joins; require readable and durable pack/index authority before referencing append/publication. Missing, wrong-size/type/digest, noncanonical, malformed, unavailable or undurable data refuses. Original semantic digest, full-value commitment and first receipt bind the stored reference representation. Retry, read, compatibility, rebuild and admitted restore resolve that same original; coherent restore additionally requires the event-payload inventory. Source overflow remains independently verified. No annotation truncation, new product cap, feature or retention/deletion answer was chosen.

**Verification:** `python3 scripts/pm_bundle_revision_events.py` → 1,826 PASS (179 original + 1,647 full composition). `python3 scripts/pm_dcw_event_regressions.py --output <evidence>/standing-checks.json` → 1,328/1,328, all 66 family/check cells populated and PASS, including 264 guard-ablation witnesses. Independent Python msgpack encoding reproduces Astra's four exact 16,384-byte bundle examples (JSON sizes 16,506 / 16,503 / 16,503 / 16,503); all now accept. An additional 300 independent event-byte/reference/retry/history cases and all 183 exact Astra probes pass.

No finding is disputed or stopped for a new owner decision.

## Family grades before and after

All 96 cells are rechecked at the implementation above; every quote in the self-grade is verified against its current exact owner unit or family fixture. The producer and positive_negative_oracles cells recover from PARTIAL to PASS for all six prepared families.

| Family | Before (Astra) | After (worker) | Outcome |
|---|---|---|---|
| `bundle.revision_requested` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared without admission |
| `bundle.revision_started` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared without admission |
| `bundle.revision_completed` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared without admission |
| `bundle.revision_interrupted` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared without admission |
| `wizard.opened` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared without admission |
| `wizard.deferred_payload.loaded` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared without admission |
| `wizard.blocked` | 6 PARTIAL / 6 ABSENT | unchanged | held for Jared |
| `wizard.unblocked` | 6 PARTIAL / 6 ABSENT | unchanged | held for Jared |

## Per-family standing checks, 1 through 11

**Fixed F1 = `9728165bc635d0c0383dd621075f686fb230dc78`; Fixed F2 = `1e9ca78cc51fafd184cb8e86e69fe333d54e7f0e`. Pass = exercised successfully at this implementation. No standing-check cell remains open.** These families are Project-only; check 2 tests refusal of both a correctly formatted CV-366 application key and a malformed application key, without inferring application support.

| Family | 1 Writer/retry | 2 App key | 3 Project partition | 4 Bytes/SP-337 | 5 LF | 6 Semantic retry | 7 Checkpoint | 8 Failure exit | 9 Refs | 10 Retained history | 11 Isolation |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `bundle.revision_requested` | Pass | Pass | Pass | Fixed F2 | Pass | Pass | Pass | Pass | Pass | Fixed F1 | Fixed F2 |
| `bundle.revision_started` | Pass | Pass | Pass | Fixed F2 | Pass | Pass | Pass | Pass | Pass | Fixed F1 | Fixed F2 |
| `bundle.revision_completed` | Pass | Pass | Pass | Fixed F2 | Pass | Pass | Pass | Pass | Pass | Fixed F1 | Fixed F2 |
| `bundle.revision_interrupted` | Pass | Pass | Pass | Fixed F2 | Pass | Pass | Pass | Pass | Pass | Fixed F1 | Fixed F2 |
| `wizard.opened` | Pass | Pass | Pass | Fixed F2 | Pass | Pass | Pass | Pass | Pass | Fixed F1 | Fixed F2 |
| `wizard.deferred_payload.loaded` | Pass | Pass | Pass | Fixed F2 | Pass | Pass | Pass | Pass | Pass | Fixed F1 | Fixed F2 |

| Check | Exact-family evidence and isolation |
|---|---|
| 1 | Replay-only first-write/publish/prepared-source and incoming-caller retry negatives rerun over every successful writer variant, including referenced/restored originals. Isolated caller policy changes only that field; relaxing its reader-only admission guard accepts it. |
| 2 | Foreign application key negatives align the synthetic source/custody/receipt mirrors, so only the exact-family key recipe is defective. Wizard source_ref follows the mutated key; the legacy bundle validator's repeated identity guard is mutated with the same invariant. Both well-formed CV-366 and malformed keys refuse. |
| 3 | Positives use encoded project~ base64url partitions without padding. Raw and other encoded Project partitions refuse receipt_scope; relaxing only that guard accepts the same input. |
| 4 | Inline 16,383/16,384 positives, 16,385 inline negatives, and 16,385/20,000 referenced positives use actual canonical bytes. Full paths cover append/publish/retry/read/rebuild/compatibility and admitted restore. Every new pack defect is built after a valid source/event/custody construction. Size, digest, media, body closure, stub closure, canonical bytes/reference text, missing/readability/sync/index, substituted result and inventory guards have otherwise-valid controls. Source references cannot satisfy missing event-pack authority. |
| 5 | All 29 anchored identifier sites have exact lengths; LF/CRLF/short/long direct mutants refuse. Full-composition matching original-owner hash LF negatives still refuse. Ref BLAKE3 LF is guarded by both exact schema length and digest equality; its ablation relaxes that one exact-identifier invariant at both enforcement sites. |
| 6 | Caller semantic changes conflict; semantic-only and Storage-only observed/persisted/sequence changes accept. The isolated semantic mutation changes no stored original. Referenced retry metadata variants also pass. Original full-value authentication remains independent. |
| 7 | Event/source/custody Storage identities move coherently while the checkpoint stays foreign; only checkpoint_storage_instance fails, and its isolated ablation accepts. Token-only mismatch negatives remain. |
| 8 | Each complete CLI rejects a deliberately accepted invalid inline-source case with exit 1. Relaxing only the runner's result/expectation assertion makes the same complete CLI exit 0 (6 controls); no fixture or repository file is edited. |
| 9 | All schema references preflight. Unused dangling local/external refs in each family's source/payload schemas make the complete CLI exit 1, with source-registry mirrors aligned; identical inputs exit 0 when only preflight is disabled (24 controls). |
| 10 | Valid retained originals read after independent writer-state changes and later source progression. Withdrawal, all five supplied compatibility forgeries, and altered recorded commitments/first receipts refuse. Each historical negative has its own guard-ablation witness; referenced original history and access/withdrawal cases also run independently. |
| 11 | 264 exact-family witnesses show each isolated standing-negative input accepts when only its defective invariant is weakened. Repeated enforcement of one invariant is ablated together, preserving all other guards. Missing-pack controls weaken only absent-resolution into fallback to the unchanged original pack observation. Earlier composite stress cases remain as regression coverage and are not used as isolation witnesses. |

## Earlier findings: mutation replay

| Earlier finding | Replay result |
|---|---|
| Cycle 1 F1: reader-only writers | Append/publish/retry/prepared-source and incoming-caller policy mutations still refuse, including all successful referenced/restored/cutoff-drain cases. |
| Cycle 1 F2: deferred originals | All six source/restore deferral probes through complete CLIs refuse. Missing/substituted receipts, commitments, source inventory and restore admission still refuse. |
| Cycle 1 F3: full oracles | Terminal conflicts, completed resume, cutoff fences, withdrawal, incomplete rebuild/replacement and forbidden reader effects still refuse. Failure-exit probes pass. |
| Cycle 1 F4/F5: Wizard provenance and false holds | Existing intake and all canonical seeds remain supported. Actual child/request/seed/context/open-predecessor mutations still refuse. Artifact audit rejects false action-existence stops, retired-owner conflicts and broadened/reintroduced questions. |
| Cycle 2 F1: trailing-LF hashes | 36 exact hash/oversized-source recipes replay on append/publish/retry. Matched malformed owner mirrors still refuse. All 29 identifier sites are guarded. |
| Cycle 2 F2: source profiles and overflow | Registry schema passes. Unchanged checker has exactly the same 41 errors as current origin/main; all 9 delete/over-limit/wrong-file profile mutants are detected. Original oversized sources remain refused at 23,760 / 26,927 / 30,143 / 30,157 / 24,124 / 24,548 bytes. |
| Cycle 3 F1: caller retry policy | All 12 original caller-policy counterexamples refuse; Storage-only metadata still accepts. New referenced original retries obey the same admission rule. |
| Cycle 3 F2 / standing 9: citation and refs | Loaded-family citations remain inside its own Storage heading; wrong-heading artifact mutant refuses. All 24 dangling-ref negatives and 24 single-guard-disabled complete-CLI controls pass. |

Counts: cycle-one contract replay **119/119**; cycle-two mutation replay **575/575**; exact cycle-two recipes **36/36**; later independent regression replay **1,105/1,105**; exact Astra replay **183/183**; independent event-byte/transport probes **300/300**. Original positives, every prior scenario and all native obligations are preserved.

## Questions for Jared — card-ready, no answer applied

**Q1a — wizard.blocked / current subject and emission predicate.** Under `Plans/Contracts_V0.md:14896` (CV-233) and `Plans/Contracts_V0.md:2686`, which exact existing PlanningRun or topic owner identity must `wizard_id` identify, and which existing blocked/remediation predicate emits this observation, including the current source of `round_count`? PWIZ-002 owns the current aggregate/topic model; shared route_target/blocked identity does not decide that subject or predicate.

**Review recommendation, unapplied:** retain an observation of the existing Planning Wizard blocked/remediation episode after Jared confirms its actual current subject/trigger. Use current route/blocked identity; do not resurrect a three-round threshold or separate wizard_status state machine. Subsequent identity/schema/checkpoint work is technical.

**Q1b — wizard.unblocked / matching current resolution predicate.** Under `Plans/Contracts_V0.md:14944` (CV-234), for that same confirmed current subject and blocked/remediation episode, which existing authorized resolution transition emits the corresponding observation, and how does `resolution_source` identify that actual resolution and preserve causality?

**Review recommendation, unapplied:** the corresponding observation when that same owner episode clears through an existing authorized resolution, preserving subject and causality. Confirm with Q1a; a route-open or replay never counts as resolution.

Current supporting evidence: `Plans/assistant-chat-design.md:3524`; `Plans/Planning_Wizard.md:116`. These holds do not reopen already-decided intake action existence or choose retirement/historical-only disposition. **Jared's answers: PENDING.**

## Scope, authority and IDs

This round authors only the six missing SP-337 event-body technical bindings in the already allocated CV-590–595 units, schema companions and their static oracles. It reuses the existing event identities, source owners, producers, readers, SP-278 checkpoint and SP-337 pack machinery. No family/consumer/projector/checkpoint identifier, admission, source family or owner decision is added. The sole owner Markdown edit is Contracts_V0.md, confined to CV-590–595; regenerated shards are confined to contracts_v0, plus the aggregate plan index.

DL-045 still names all eight assigned families and permits only bounded technical bindings for existing behavior. Current ACD-049/050 + ACD-571–574 still govern targeted Deep Plan revision. UCC-002/UCC-032 + PWIZ-001/002 + PWIZ-097/098 still govern the existing real-Project intake and canonical seed kinds. DL-076's nine durable token fields/no persisted snapshot ID remain. SP-026/SP-337 remain the current canonical-byte/overflow owners; no old retention or retired CWF ruling is revived. Failed premise checks: none. Original per-family search lineage remains base-family-search.json (SHA-256 96832ddf6013b0116d2adff5ac939f365bb6928a4b2454d59435a1881d0f605a) and fix1-wizard-search.json (SHA-256 324dffe4d7426126626a8fe31fc4262d501880855d81d357a2c4441e5621180f) under the parent drafts/DCW evidence directory.

**IDs used (existing): CV-590–595, SP-575–579, ACD-571–574, PWIZ-097/098. New IDs: none.** SP-026 and SP-337 are reused authorities. `wizard.blocked` and `wizard.unblocked` retain the exact held grades and questions above.

## Commands and exit codes

| Command/check | Exit | Final result |
|---|---:|---|
| python3 scripts/pm_bundle_revision_events.py | 0 | 1,826 PASS; 1,647 full composition |
| python3 scripts/pm_dcw_event_regressions.py --output <evidence>/standing-checks.json | 0 | 1,328 PASS; all 66 cells; 264 ablations |
| fix4-prior-findings-audit.py <worktree> | 0 | 119 PASS |
| fix4-cycle2-mutation-audit.py <worktree> | 0 | 575 PASS |
| fix4-prior-counterexamples.py <worktree> | 0 | 36 PASS |
| fix4-review-mutation-audit.py <worktree> | 0 | 1,105 PASS, 29 guarded patterns, 6 correct exit-1 failure probes |
| astra-exact-replay.py | 0 | 183 exact review-derived probes pass; forged CLI cases now correctly exit 0 |
| independent-event-bytes.py <worktree> | 0 | 300 PASS, independent msgpack bytes, four exact reviewer boundary examples accept |
| fix4-storage-audit.py | 0 | Registry valid, 41 identical baseline errors, 9 profile mutants caught |
| python3 scripts/pm-storage-recovery-contracts.py --self-test | 0 | Parsed top-level pass; 22 checks true |
| python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json | 0 | Only edited owner shard directory changes |
| python3 scripts/pm-plan-index.py generate | 0 | Parsed top-level pass; currentness edition present |
| python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json | 0 | Parsed top-level pass; no failures |
| python3 scripts/pm-plan-index.py validate | 0 | Parsed top-level pass; no failures |
| fix4-artifact-audit.py | 0 | 96 cells/current quotes, 10 artifact mutants, original fixtures and holds preserved |
| git diff --check | 0 | No whitespace errors |

The unchanged storage-profile checker itself still exits 1 for its 41 baseline errors; the comparison audit exits 0 because branch and baseline errors are identical. An intermediate index validation ran before the final CV dependency regeneration and correctly refused stale generated hashes; final generation and validation above pass. During fixture construction the checker caught byte-size-changing substitution and duplicate opened-original mirror defects; corrected builders now preserve isolated defects. No production guard was relaxed: all ablations run only in test-memory controls and restore the real rules afterward.

## Resources, cleanup and limitations

Entry: 104 GB root disk free, 17 GB available RAM. Latest check: 108 GB disk free, 10 GB available RAM. Both the stricter 50 GB disk and 6 GB RAM thresholds were met. The requested detached sparse worktree is /home/sittingmongoose/pm-worktrees/DCW-fix4 from /home/sittingmongoose/src/PuppetMaster. Fifteen ignored currentness files were copied from the specified shared edition and SHA-256 matched before generation. After the final report commit/push and evidence copy, remove that literal worktree path; completion records the final head, remote verification and removal.

Two initial read-only mailbox commands ran before FIX-ROUND.md was consumed. No registration or mail send occurred; no subsequent mailbox use. No subagent, admission, registry append, Decision Log entry, test-file edit, .gitignore edit, governance reseal/lock/evidence edit, landing lock or main push occurred. No browser/server/temporary branch was created. Temporary authoring helpers are deleted. Retained audit programs/results below are the task evidence, not discarded scratch.

Native authentication, pack/index durability issuance, real redb CAS, actual append/recovery/restore and OS codecs remain **NOT_RUN**. Open integration items remain the two exact owner holds, pending retention, individual admissions, native adapter proof and the unchanged 41 baseline profile errors. No native writer activation follows this self-grade.

## Retained evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/fix4/`. The report/self-grade are also copied to the parent drafts/DCW directory. Each evidence path below is that absolute directory plus filename, bound by SHA-256. Completion is recorded separately after the final head exists.

| File | SHA-256 |
|---|---|
| `artifact-audit.txt` | `97bbbea3567bb94b7f1e2d2f439675d664f95f0b86d5910dabeafec24019e103` |
| `astra-exact-replay.json` | `72386ae6abcbd7b3fbc2235d987a0fbe6913bd6dc556d7bea7613b139634a3d4` |
| `astra-exact-replay.py` | `82077e51e750669d4691e7e9d8d9ed12d6738718d7ecdea894948dad8ad3c7b0` |
| `astra-exact-replay.txt` | `b0fa56fc4c393f9d4a689525b7af99b8a1683d7d882442293b2463061d1c527d` |
| `check-results.json` | `06aa2600299cdee8e68407b49fe604caca475f98712a98ac1d6162388993bb87` |
| `contract-check.txt` | `b0317c57ef500a07c492e9679f9d5922e00f11a306fc7f31f1421f412dc420b0` |
| `currentness-sha256.json` | `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c` |
| `cycle2-mutations.txt` | `3f3c611995d70615a1e57dc4747258d1f4c24ea171e5dc4c95cfe85162863616` |
| `fix4-after-review-mutations.json` | `f17b32657096aac9a287ce73452430569e0ed4323a0a8bbed4b656265068f1bb` |
| `fix4-artifact-audit.json` | `97bbbea3567bb94b7f1e2d2f439675d664f95f0b86d5910dabeafec24019e103` |
| `fix4-artifact-audit.py` | `9236a582e6f26a1e48c022010c0acee0563dece0dd97517c5e89f7826939dfdf` |
| `fix4-cycle2-mutation-audit.py` | `22fd12eafada2ac42f7e173fe3a606e85481d568424bf240088ed4950ba4a2c8` |
| `fix4-cycle2-mutations.json` | `3c8648844379af913333db37dc61a32de045ca6da54eb29959b4b6ef03aa5496` |
| `fix4-prior-counterexamples.json` | `0b82b6f6a7398d6f99030ba84ff94c2853f5992b12d441c4ab6587c3f1482ea7` |
| `fix4-prior-counterexamples.py` | `4d9fa467d1a7de9296fcf33b30eca811f674bb91563ac3135af4b53a36c5061a` |
| `fix4-prior-findings-audit.py` | `6b896931e14e925036f0eab1bbe6b3a28968efe51c1b791a909c12d9dc4f0e68` |
| `fix4-prior-findings.json` | `4a7b0998968c5f61607f0c0f369ba27906315383223c15fcbb43e3099a37e378` |
| `fix4-review-mutation-audit.py` | `f272175542f1ba9f60cbd0abf38786c5cfa13b4e4d710eaa1968abc6c46decc5` |
| `fix4-storage-audit.py` | `72c2c8b9c2ff9be791bafb90b1aa2ea4df73ac385f1f22aa3b845ce2adc62819` |
| `fix4-storage-regression.json` | `487d6cb10ca00399265fa081f5dd0f6ecde1fdf90831e0b02851251e86e04b5a` |
| `independent-event-bytes.json` | `27e9aada11c782d9b96605746b4a6e49426e99bdf9c8e4d61f7be9781edec3f4` |
| `independent-event-bytes.py` | `605bc9dae321fefbc732b44373c0bc9a0567d192b75a4a28ec3ca216100ac0e5` |
| `independent-event-bytes.txt` | `326b5bfdddb6a150e8ae2b175bb2be4ae736b61d3a72411ab707790e41b9daf0` |
| `index-generate.json` | `8c19d0ba0273f8f8ed4ffc41f956ffb1106e200c74df40bd605c234409c3aa9c` |
| `index-validate.json` | `894f88e691192486778623f2138a54c17d0dec029cffdf63dffb3d6e9789528f` |
| `prior-counterexamples.txt` | `1437e4841ee8eb7af271d618bf32d508ffa2fc0e6d2dafc5165864dbcd8f6542` |
| `prior-findings.txt` | `bc40bd97bd006e18adfb8db4fd473c970e6c915aa16f6589e35162265e8dbc23` |
| `review-mutations.txt` | `d09bd9acf519f65915842bfe0ad3ccfdf703c05354a07bcf9528b04f93b33805` |
| `shard-check.json` | `353b434b8f99c23e82801aee68941ecef36e9fc71638a6bce463523cd6b01ade` |
| `shard-generate.json` | `8c69184b47a3633087138322660fd620b900339e49e603fbc29230e5ade7a015` |
| `standing-checks.json` | `aa4d761f695b3d96aa162c229d15ec8c0449531507a808810bb5eb485b4a1bbd` |
| `standing-checks.txt` | `d5d29483a4e78ac6ce917cb1edf9c296a060a3cac2fb7f5152d5e6ab5ea7beec` |
| `storage-audit.txt` | `e13a391a36b9dd8a0ca8ac2b616a12607673f3a59cf9acd95d17d09cada6323a` |
| `storage-recovery.json` | `e56e543c18588569abd7a299f25004750f6954e919c5571c6a669b38668eca1a` |
