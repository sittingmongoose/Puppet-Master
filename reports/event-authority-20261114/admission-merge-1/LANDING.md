# Admission merge 1: landing record

Stream E, PNC-019 step S5, 2026-11-15. This is the landing record that each of the 173 DL-077 admission records names in `admission_landing.record`. A record leaves `admission_landing.commit` null because it cannot name the commit that contains it; the family table below names each one.

## Landing note (merge 1)

**What lands:** branch `plans/ea-merge1-apply-20261115`, rechecked head `ddf1e6860aadc94dc55d0f94ed234ec21a5589c5`, built on `main` `5b8b14ad51711feecbf32fda2ddc59cb936ba163`.

- **Count:** 173 admissions, DL-520 (`attempt.completed`) to DL-692 (`todo.work_bound`), one commit, one Decision Log entry, one DL-077 record and one 12-cell depth file each. 32 come from batch 2 (CPU ledger) and 141 from batch 3 (recount).
- **Registry:** `Plans/event_family_registry.json` goes from revision `2026-11-04.1` (46 families) to `2026-11-15.173` (219 families), SHA-256 `e1bcd4b70ee6cf0bc698a748cfee94d5f4035d70e73c2fbaec806bddc7422c0c`.
- **Lander:** `ea-land-merge1`, holding the landing lock. No reseal: `Plans/Spec_Lock.json`, `Plans/.evidence/**` and `Plans/auto_decisions.jsonl` are unchanged.
- **Native execution:** NOT_RUN. Every result here is static contract, oracle or planning evidence.
- **Writer record:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/s5w/REPORT.md`, section "Apply (post-S1)".

### Jared's words

Answered on the AI Account Center Status tab, signed, at 12:49 PM EST Nov 14 (send `5e901daf-ac4e-473f-967f-44df640d7102`), relayed by pm7-build as mail `1114181307-96f3` ("Go."). Record: `decision-answers/ANSWERS_EA-P_20261114.md` (SHA-256 `8f8c89d237c83fa265aa2baeebd041b657e757014a3a806aff451efb6641f1ac`).

| Card | Choice, in the card's words | What it means here |
|---|---|---|
| EA-P1 | **A**, "Add each once its definition passes every check" | Each recount name is admitted once its full definition, its record and both reviews pass (DL-078, DL-096, DL-400). DL-039's "no bulk registration" stands: one commit, one entry and one record per family. |
| EA-P2 | **B**, "Two merges: the 173 ready now, then the rest" | This is merge 1: the 173 ready families. Merge 2 takes the rest. Each merge has a review pair before it and an Astra review after it. |
| EA-P3 | **A**, "Switch these five now; let others switch once they pass the same checks" | DG's five Goal successor definitions replace the registered ones. Merge 1 switches no registered family. |

### Reviews

| Review | Target | Verdict |
|---|---|---|
| Sol 6.1, reasoning max (pre-landing pair) | dry run `34569f3228` (r3), S1 simulated | **LANDING_READY_WITH_NOTES**. ADMIT 173, HOLD 0, no REAL finding. Notes: preparation-only checkers refuse the admitted state (T225); scratch support inputs; governance staleness as a reseal request (finding 3). |
| GPT-6 Astra, reasoning max (pre-landing pair) | dry run `34569f3228` (r3), S1 simulated | **LANDING_READY_WITH_NOTES**. ADMIT 173, HOLD 0, no REAL finding. Notes: T221 (evidence relocation outside the cited unit, fixed by `03a09c6636` on this branch), T222 (preparation checkers), T215 (NUMRULE W3H preload), T212/T213 (large-integer loader). |
| Sol 6.1, reasoning high (targeted recheck) | applied head `ddf1e6860a` against the dry run | **LANDING_READY_WITH_NOTES**, no REAL finding. Verified the delta against the dry run, the T221 fix and the holding-bucket fixture change; its dry landing check exited 1 with 0 blocking. Note 1: the date-time inventory gate fails at this head (127 unclassified containers, 107 stale exclusions) because the merge regenerates derived files; the T198 refresh after landing clears it. |

Reports under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/`: `MERGE1-sol/REVIEW.md` (SHA-256 `05da8371d769f1e624d9787e71cb2e5f4a52d39af9383d15a616201051c3f848`), `MERGE1-astra/REVIEW.md` (`22716934a6757250f4b3ca6af8f6a3d5743f2254c8e0e8a36bbe71de521c4017`), `MERGE1-apply-solhigh/REVIEW.md` (`03e4a0cfccbf3482d6905783973fef715ba5155fd53397b68739b8ad1ed34ce9`).

### Merge of newer `main`

The rechecked head is kept by tag `archive/ea-merge1-reviewed-ddf1e6860a` on both push URLs. `main` moved 27 commits from `5b8b14ad51` to `4a1d6a36e0`: 4 merge commits, 20 commits that touch only `Concepts/` (PM7 FO-206 Welcome/Look work), and these:

- `4a1d6a36e0` plans: refresh the plan-migration snapshot and the landing-check baseline after C's wave-5 append
- `e87174af96` audit-closure: append wave-5 re-audit rows for registry rows 1203, 25 and 35 and regenerate the audit status index
- `92ee1a560b` audit-closure: wave-5 re-audit receipts for registry rows 1203, 25 and 35 (PLS-026, DL-511)

- **Merge:** `git merge --no-ff 4a1d6a36e0` as `ee095d428e`.
- **Conflicts:** 0.
- **Non-derived paths changed on both sides:** none.
- **Regeneration:** the 15-file currentness edition `Plans/.audits/event-authority-2026-08-13-currentness/` was copied in from the shared checkout first (SHA-256 identical, 15 files). `pm-shard-plans.py --generate`, then `pm-plan-index.py generate`, then `pm-shard-plans.py --check` (pass, 99 sources). Index generate rewrote only `generated_at_utc` in `coverage_report.json`, `dependencies.json`, `doc_cards.json`, `node_readiness_report.json`; those were restored. No regenerated file changed content.

**Preservation proof** (blob level, rename detection off, deletions included; merge base `5b8b14ad51`). Record: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/landing/merge1-20261115/merge/proof.json` (SHA-256 `27a02610f0e71adfd86b35e311bf1d0fa0eaa6c8053a92e75863f5264cd05e4a`).

| Set | Paths | Result |
|---|---:|---|
| Non-derived paths the rechecked head changed against its base | 401 | 401 equal `ddf1e6860a`; 0 clean merges; 0 differ |
| Non-derived paths `main` changed since the base | 25 | 25 equal `4a1d6a36e0`; 0 differ |
| Derived paths the rechecked head changed | 19 | 19 equal `ddf1e6860a` |
| Derived paths `main` changed | 21 | 21 equal `4a1d6a36e0` |
| Paths equal to neither side | | 0 non-derived; 0 derived |

**The 173 admissions are intact** at `ee095d428e`, against the rechecked head:

| Artifact | Result |
|---|---|
| Registry rows | file bytes equal: yes; 219 families, 173 added by merge 1, 173 of them row-equal; revision `2026-11-15.173` |
| Decision Log entries DL-520..DL-692 | 173 present, 173 equal (section text) |
| DL-077 records | 173 present, 173 equal |
| Depth files | 173 present, 173 equal |

### Frozen check at the merge

`Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py` with `PM_EA_RECOUNT_SOURCE_MAP` set to `drafts/CA-SEAL2/resume/source-locations.json`: it admits 174 post-August families, exactly the 173 of merge 1 plus the pre-existing `coordination.agent_registered`. It reports 6 errors, the ones the reviews recorded: S8 `fresh_census_denominator_not_closed`; S2 `post_august_admission_incomplete`, `unexpected_august_set`, `registered_contract_depth_incomplete` and `individual_dispositions_evidence_gap_blocking`; and the partial OUTCOMES `recount_input_or_outcome_invalid` (141 of 249 recount names until merge 2). Its tracked receipt was restored after the run; the receipt is kept as `landing/merge1-20261115/frozen-merge/receipt.json` (SHA-256 `f23f220bccde48b87c540b16601592b46d2f41f42fd23e24e0552b5602528cdf`).

### What comes after

- **Landing check** at this note's commit, in a clean full local worktree, against the fetched `origin/main` SHA, then the fast-forward and push.
- **Follow-up 1:** `pm-plan-migration.py snapshot-current` and `pm-landing-check.py --record-baseline`, one commit.
- **Follow-up 2:** the date-time inventory refresh (T198 class: prune, relocate, projection, classify) on a tracked-files-only tree, its own commit, so that `pm_event_datetime_inventory.py` passes.
- **Reseal request:** the governance staleness the landing check reports goes to Jared in `/mnt/Cursor/share/puppet-master/2026-11-04-program/streams/E-RESEAL-MERGE1.md`, with both reviews' reseal lists. The reseal is P's task, not this landing's.
- **Open tool issues, not blocking:** T215, T222, T225 and T212/T213 above.

## Family commits

| # | DL | Event type | Lane | Batch | Family commit | DL-077 record |
|---:|---|---|---|---|---|---|
| 1 | DL-520 | `attempt.completed` | DX | batch 2 | `6604207e45` | `attempt.completed.json` |
| 2 | DL-521 | `attempt.started` | DX | batch 2 | `a068130692` | `attempt.started.json` |
| 3 | DL-522 | `browser.session.closed` | DCN | batch 2 | `3838412d99` | `browser.session.closed.json` |
| 4 | DL-523 | `browser.session.created` | DCN | batch 2 | `aad8ff9a13` | `browser.session.created.json` |
| 5 | DL-524 | `browser.session.promoted` | DCN | batch 2 | `c9e18390b9` | `browser.session.promoted.json` |
| 6 | DL-525 | `browser.session.state_changed` | DCN | batch 2 | `d6a5f66781` | `browser.session.state_changed.json` |
| 7 | DL-526 | `browser.session.takeover_state_changed` | DCN | batch 2 | `ff22c4b826` | `browser.session.takeover_state_changed.json` |
| 8 | DL-527 | `coordination.agent_aborted` | DCO | batch 2 | `d73bdc4cc1` | `coordination.agent_aborted.json` |
| 9 | DL-528 | `coordination.agent_crashed` | DCO | batch 2 | `cfbeca5754` | `coordination.agent_crashed.json` |
| 10 | DL-529 | `coordination.agent_file_ownership_updated` | DCO | batch 2 | `a069a4bdc3` | `coordination.agent_file_ownership_updated.json` |
| 11 | DL-530 | `coordination.agent_operation_updated` | DCO | batch 2 | `9c90f01df1` | `coordination.agent_operation_updated.json` |
| 12 | DL-531 | `coordination.agent_status_updated` | DCO | batch 2 | `f2ffa4f7db` | `coordination.agent_status_updated.json` |
| 13 | DL-532 | `coordination.agent_unregistered` | DCO | batch 2 | `71a7da2aab` | `coordination.agent_unregistered.json` |
| 14 | DL-533 | `debug.investigation.instrumentation_state_changed` | DDBG | batch 2 | `460361d071` | `debug.investigation.instrumentation_state_changed.json` |
| 15 | DL-534 | `debug.investigation.state_changed` | DDBG | batch 2 | `6542525714` | `debug.investigation.state_changed.json` |
| 16 | DL-535 | `memory.gist_state_changed` | DCN | batch 2 | `e85376c189` | `memory.gist_state_changed.json` |
| 17 | DL-536 | `node.blocked` | DX | batch 2 | `8807170acc` | `node.blocked.json` |
| 18 | DL-537 | `node.completed` | DX | batch 2 | `53a678b539` | `node.completed.json` |
| 19 | DL-538 | `node.started` | DX | batch 2 | `353169e1b7` | `node.started.json` |
| 20 | DL-539 | `node.unblocked` | DX | batch 2 | `dfbd3504c1` | `node.unblocked.json` |
| 21 | DL-540 | `plan.decomposition_degraded` | DX | batch 2 | `d470352d60` | `plan.decomposition_degraded.json` |
| 22 | DL-541 | `remediation.resolved` | DX | batch 2 | `98fcb8120f` | `remediation.resolved.json` |
| 23 | DL-542 | `remediation.spawned` | DX | batch 2 | `ae0b49963b` | `remediation.spawned.json` |
| 24 | DL-543 | `run.completed` | DX | batch 2 | `25fb3e1bc1` | `run.completed.json` |
| 25 | DL-544 | `run.graph_integrity_failed` | DX | batch 2 | `d786dba064` | `run.graph_integrity_failed.json` |
| 26 | DL-545 | `run.node_backoff_expired` | DX | batch 2 | `5c471b70e5` | `run.node_backoff_expired.json` |
| 27 | DL-546 | `run.node_backoff_started` | DX | batch 2 | `bf1b372208` | `run.node_backoff_started.json` |
| 28 | DL-547 | `run.node_ready` | DX | batch 2 | `4b126e0e7b` | `run.node_ready.json` |
| 29 | DL-548 | `run.node_retry_scheduled` | DX | batch 2 | `947a05c691` | `run.node_retry_scheduled.json` |
| 30 | DL-549 | `scheduler.pass` | DX | batch 2 | `bbfa27bbc3` | `scheduler.pass.json` |
| 31 | DL-550 | `subagent.context_rehydrated` | DM | batch 2 | `01117e408f` | `subagent.context_rehydrated.json` |
| 32 | DL-551 | `subagent.context_shrunk` | DM | batch 2 | `0357365156` | `subagent.context_shrunk.json` |
| 33 | DL-552 | `artifacts.capture_provenance.inspected` | W3C | batch 3 | `519db29226` | `artifacts.capture_provenance.inspected.json` |
| 34 | DL-553 | `artifacts.demonstration_video.created` | W3C | batch 3 | `94b7622490` | `artifacts.demonstration_video.created.json` |
| 35 | DL-554 | `artifacts.demonstration_video.failed` | W3C | batch 3 | `8ffca68f34` | `artifacts.demonstration_video.failed.json` |
| 36 | DL-555 | `assistant_plan.build_started` | W3G | batch 3 | `2eb7072d2c` | `assistant_plan.build_started.json` |
| 37 | DL-556 | `assistant_plan.cancelled` | W3G | batch 3 | `cd771815bc` | `assistant_plan.cancelled.json` |
| 38 | DL-557 | `assistant_plan.completed` | W3G | batch 3 | `a4ff005917` | `assistant_plan.completed.json` |
| 39 | DL-558 | `assistant_plan.created` | W3G | batch 3 | `352f9c7751` | `assistant_plan.created.json` |
| 40 | DL-559 | `assistant_plan.exported` | W3G | batch 3 | `b8fab46891` | `assistant_plan.exported.json` |
| 41 | DL-560 | `assistant_plan.schedule_invalidated` | W3H | batch 3 | `d824d84ae6` | `assistant_plan.schedule_invalidated.json` |
| 42 | DL-561 | `assistant_plan.version_created` | W3G | batch 3 | `4646f3bb0b` | `assistant_plan.version_created.json` |
| 43 | DL-562 | `assistant_plan.wizard_handoff_created` | W3G | batch 3 | `576480a18e` | `assistant_plan.wizard_handoff_created.json` |
| 44 | DL-563 | `autonomy.ceiling_checked` | W3F | batch 3 | `bafefd3aa6` | `autonomy.ceiling_checked.json` |
| 45 | DL-564 | `discovery.backpressure` | W3F | batch 3 | `949a6794c8` | `discovery.backpressure.json` |
| 46 | DL-565 | `discovery.candidates_returned` | W3F | batch 3 | `6c5886b169` | `discovery.candidates_returned.json` |
| 47 | DL-566 | `discovery.disabled` | W3F | batch 3 | `562320ef4a` | `discovery.disabled.json` |
| 48 | DL-567 | `discovery.fallback` | W3F | batch 3 | `da77dbd7e2` | `discovery.fallback.json` |
| 49 | DL-568 | `discovery.invoked` | W3F | batch 3 | `f83695905b` | `discovery.invoked.json` |
| 50 | DL-569 | `discovery.selected` | W3F | batch 3 | `f0d1410dbc` | `discovery.selected.json` |
| 51 | DL-570 | `discovery.unsupported` | W3F | batch 3 | `2e08d8cede` | `discovery.unsupported.json` |
| 52 | DL-571 | `discovery.verified` | W3F | batch 3 | `233ac4d13d` | `discovery.verified.json` |
| 53 | DL-572 | `docker.compose.scenario.deleted` | W3H | batch 3 | `89c2ded778` | `docker.compose.scenario.deleted.json` |
| 54 | DL-573 | `docker.compose.scenario.edited` | W3H | batch 3 | `8fccf09b83` | `docker.compose.scenario.edited.json` |
| 55 | DL-574 | `docker.compose.scenario.run` | W3H | batch 3 | `4922c00fec` | `docker.compose.scenario.run.json` |
| 56 | DL-575 | `docker.compose.scenario.saved` | W3H | batch 3 | `d05fb84644` | `docker.compose.scenario.saved.json` |
| 57 | DL-576 | `execution_window.created` | W3H | batch 3 | `4c56fad26a` | `execution_window.created.json` |
| 58 | DL-577 | `execution_window.invalidated` | W3H | batch 3 | `218cfd95b5` | `execution_window.invalidated.json` |
| 59 | DL-578 | `execution_window.updated` | W3H | batch 3 | `be969c58fe` | `execution_window.updated.json` |
| 60 | DL-579 | `external_research.budget_denied` | W3G | batch 3 | `4a6dc9e73a` | `external_research.budget_denied.json` |
| 61 | DL-580 | `external_research.finding_classified` | W3G | batch 3 | `672a344c60` | `external_research.finding_classified.json` |
| 62 | DL-581 | `external_research.job_terminal` | W3G | batch 3 | `cdc2292550` | `external_research.job_terminal.json` |
| 63 | DL-582 | `external_research.packet_delivered` | W3G | batch 3 | `6e223c08fe` | `external_research.packet_delivered.json` |
| 64 | DL-583 | `external_research.topic_started` | W3G | batch 3 | `987499ead6` | `external_research.topic_started.json` |
| 65 | DL-584 | `forge.api.compatibility_changed` | W3A | batch 3 | `3b6df35194` | `forge.api.compatibility_changed.json` |
| 66 | DL-585 | `forge.connection.capabilities_changed` | W3A | batch 3 | `bfedd2f97a` | `forge.connection.capabilities_changed.json` |
| 67 | DL-586 | `forge.connection.reauthorized` | W3A | batch 3 | `fd2783fab5` | `forge.connection.reauthorized.json` |
| 68 | DL-587 | `forge.connection.validated` | W3A | batch 3 | `27ce816d30` | `forge.connection.validated.json` |
| 69 | DL-588 | `forge.mirror.connected` | W3A | batch 3 | `2b35f856bc` | `forge.mirror.connected.json` |
| 70 | DL-589 | `forge.mirror.degraded` | W3A | batch 3 | `056b4b9fc6` | `forge.mirror.degraded.json` |
| 71 | DL-590 | `forge.mirror.detached` | W3A | batch 3 | `fce7858534` | `forge.mirror.detached.json` |
| 72 | DL-591 | `forge.mirror.status_changed` | W3A | batch 3 | `01b5376340` | `forge.mirror.status_changed.json` |
| 73 | DL-592 | `forge.mirror.sync_completed` | W3A | batch 3 | `600b9022f0` | `forge.mirror.sync_completed.json` |
| 74 | DL-593 | `forge.mirror.sync_started` | W3A | batch 3 | `36cb8012d8` | `forge.mirror.sync_started.json` |
| 75 | DL-594 | `forge.pipeline.cancelled` | W3A | batch 3 | `d5fedb7fa9` | `forge.pipeline.cancelled.json` |
| 76 | DL-595 | `forge.pipeline.completed` | W3A | batch 3 | `f021ef8cf7` | `forge.pipeline.completed.json` |
| 77 | DL-596 | `forge.pipeline.retried` | W3A | batch 3 | `7ce8ad3fca` | `forge.pipeline.retried.json` |
| 78 | DL-597 | `forge.pipeline.started` | W3A | batch 3 | `c327fe2bb2` | `forge.pipeline.started.json` |
| 79 | DL-598 | `forge.repository.authority_changed` | W3A | batch 3 | `23cecd5570` | `forge.repository.authority_changed.json` |
| 80 | DL-599 | `forge.repository.created` | W3A | batch 3 | `1d67d29bca` | `forge.repository.created.json` |
| 81 | DL-600 | `forge.repository.discovered` | W3A | batch 3 | `2920c3c01d` | `forge.repository.discovered.json` |
| 82 | DL-601 | `forge.repository.eligibility_changed` | W3A | batch 3 | `6485f49d86` | `forge.repository.eligibility_changed.json` |
| 83 | DL-602 | `forge.review.approved` | W3A | batch 3 | `8630807284` | `forge.review.approved.json` |
| 84 | DL-603 | `forge.review.changes_requested` | W3A | batch 3 | `4771546afa` | `forge.review.changes_requested.json` |
| 85 | DL-604 | `forge.review.closed` | W3A | batch 3 | `e1bbbb8960` | `forge.review.closed.json` |
| 86 | DL-605 | `forge.review.created` | W3A | batch 3 | `388401fa15` | `forge.review.created.json` |
| 87 | DL-606 | `forge.review.marked_ready` | W3A | batch 3 | `1b00e9cee0` | `forge.review.marked_ready.json` |
| 88 | DL-607 | `forge.review.merged` | W3A | batch 3 | `bfb9a1903e` | `forge.review.merged.json` |
| 89 | DL-608 | `forge.review.reopened` | W3A | batch 3 | `e50778508d` | `forge.review.reopened.json` |
| 90 | DL-609 | `forge.review.thread.reopened` | W3A | batch 3 | `5094255b94` | `forge.review.thread.reopened.json` |
| 91 | DL-610 | `forge.review.thread.replied` | W3A | batch 3 | `6b7161b471` | `forge.review.thread.replied.json` |
| 92 | DL-611 | `forge.review.thread.resolved` | W3A | batch 3 | `7d7869d5e5` | `forge.review.thread.resolved.json` |
| 93 | DL-612 | `forge.review.updated` | W3A | batch 3 | `328ee15afb` | `forge.review.updated.json` |
| 94 | DL-613 | `forge.review.version_created` | W3A | batch 3 | `8a3cc83281` | `forge.review.version_created.json` |
| 95 | DL-614 | `forge.webhook.delivery_failed` | W3A | batch 3 | `45d5e831e6` | `forge.webhook.delivery_failed.json` |
| 96 | DL-615 | `forge.webhook.delivery_recovered` | W3A | batch 3 | `3c14db04d4` | `forge.webhook.delivery_recovered.json` |
| 97 | DL-616 | `forge.webhook.received` | W3A | batch 3 | `0dd9f27fb0` | `forge.webhook.received.json` |
| 98 | DL-617 | `forge.webhook.redelivery_queued` | W3A | batch 3 | `e747a1022c` | `forge.webhook.redelivery_queued.json` |
| 99 | DL-618 | `forge.webhook.rejected` | W3A | batch 3 | `686b28063e` | `forge.webhook.rejected.json` |
| 100 | DL-619 | `goal.continuation_evaluated` | W3H | batch 3 | `eac1f66217` | `goal.continuation_evaluated.json` |
| 101 | DL-620 | `goal.paused` | W3G | batch 3 | `4627dd5c86` | `goal.paused.json` |
| 102 | DL-621 | `goal.resumed` | W3G | batch 3 | `76b5b8431e` | `goal.resumed.json` |
| 103 | DL-622 | `named_plan.archived` | W3H | batch 3 | `443948fe9c` | `named_plan.archived.json` |
| 104 | DL-623 | `named_plan.child_refs_changed` | W3H | batch 3 | `5a755bb75b` | `named_plan.child_refs_changed.json` |
| 105 | DL-624 | `named_plan.created` | W3H | batch 3 | `ee3b8dbb55` | `named_plan.created.json` |
| 106 | DL-625 | `named_plan.priority_changed` | W3H | batch 3 | `c8299431ed` | `named_plan.priority_changed.json` |
| 107 | DL-626 | `named_plan.renamed` | W3H | batch 3 | `7a70de6de8` | `named_plan.renamed.json` |
| 108 | DL-627 | `named_plan.restored` | W3H | batch 3 | `362b1f7cce` | `named_plan.restored.json` |
| 109 | DL-628 | `notebook.checkpoint_committed` | W3G | batch 3 | `b632e6a427` | `notebook.checkpoint_committed.json` |
| 110 | DL-629 | `notebook.checkpoint_failed` | W3G | batch 3 | `0da23ff37d` | `notebook.checkpoint_failed.json` |
| 111 | DL-630 | `notebook.entry_committed` | W3G | batch 3 | `155a4ec434` | `notebook.entry_committed.json` |
| 112 | DL-631 | `notebook.entry_superseded` | W3G | batch 3 | `c565a18b4c` | `notebook.entry_superseded.json` |
| 113 | DL-632 | `notebook.transition_state_changed` | W3G | batch 3 | `932e787f29` | `notebook.transition_state_changed.json` |
| 114 | DL-633 | `planning.question_budget_exhausted` | W3F | batch 3 | `ceb6b45448` | `planning.question_budget_exhausted.json` |
| 115 | DL-634 | `run.graph_canonical_locked` | W3F | batch 3 | `8cc2793cb1` | `run.graph_canonical_locked.json` |
| 116 | DL-635 | `runtime.automation_pause_changed` | W3H | batch 3 | `3e3774f788` | `runtime.automation_pause_changed.json` |
| 117 | DL-636 | `runtime.quota_resume_attempted` | W3H | batch 3 | `01c32c09b1` | `runtime.quota_resume_attempted.json` |
| 118 | DL-637 | `runtime.quota_resume_consent_changed` | W3H | batch 3 | `34b5796dac` | `runtime.quota_resume_consent_changed.json` |
| 119 | DL-638 | `runtime.quota_wait_started` | W3H | batch 3 | `fb6c97724e` | `runtime.quota_wait_started.json` |
| 120 | DL-639 | `scheduled_dispatch.cancelled` | W3H | batch 3 | `7e1631827f` | `scheduled_dispatch.cancelled.json` |
| 121 | DL-640 | `scheduled_dispatch.created` | W3H | batch 3 | `ad4e52a2d5` | `scheduled_dispatch.created.json` |
| 122 | DL-641 | `scheduled_dispatch.dispatched` | W3H | batch 3 | `bd5a117f57` | `scheduled_dispatch.dispatched.json` |
| 123 | DL-642 | `scheduled_dispatch.failed` | W3H | batch 3 | `5c08995d1d` | `scheduled_dispatch.failed.json` |
| 124 | DL-643 | `scheduled_dispatch.held` | W3H | batch 3 | `a07dbf750c` | `scheduled_dispatch.held.json` |
| 125 | DL-644 | `scheduled_dispatch.updated` | W3H | batch 3 | `a8519baa28` | `scheduled_dispatch.updated.json` |
| 126 | DL-645 | `session_prompt.admitted` | W3F | batch 3 | `e41c24beaf` | `session_prompt.admitted.json` |
| 127 | DL-646 | `session_prompt.cancelled` | W3F | batch 3 | `5b72bef1a7` | `session_prompt.cancelled.json` |
| 128 | DL-647 | `session_prompt.expired` | W3F | batch 3 | `84500f3304` | `session_prompt.expired.json` |
| 129 | DL-648 | `session_prompt.rejected` | W3F | batch 3 | `eacc0a6a1f` | `session_prompt.rejected.json` |
| 130 | DL-649 | `source_control.backend.detected` | W3B | batch 3 | `a9ed951e8c` | `source_control.backend.detected.json` |
| 131 | DL-650 | `source_control.backend.selected` | W3B | batch 3 | `88e447ac27` | `source_control.backend.selected.json` |
| 132 | DL-651 | `source_control.checkpoint.created` | W3B | batch 3 | `a2c5d4112d` | `source_control.checkpoint.created.json` |
| 133 | DL-652 | `source_control.checkpoint.restored` | W3B | batch 3 | `822cdc4b70` | `source_control.checkpoint.restored.json` |
| 134 | DL-653 | `source_control.remote.fetch_completed` | W3B | batch 3 | `addceda450` | `source_control.remote.fetch_completed.json` |
| 135 | DL-654 | `source_control.remote.fetch_started` | W3B | batch 3 | `612541e118` | `source_control.remote.fetch_started.json` |
| 136 | DL-655 | `source_control.remote.publish_completed` | W3B | batch 3 | `2bf9d36e29` | `source_control.remote.publish_completed.json` |
| 137 | DL-656 | `source_control.remote.publish_started` | W3B | batch 3 | `c5ef39a103` | `source_control.remote.publish_started.json` |
| 138 | DL-657 | `source_control.remote.sync_completed` | W3B | batch 3 | `226fe756ed` | `source_control.remote.sync_completed.json` |
| 139 | DL-658 | `source_control.remote.sync_started` | W3B | batch 3 | `4e1d6000be` | `source_control.remote.sync_started.json` |
| 140 | DL-659 | `source_control.repository.bound` | W3B | batch 3 | `b5ecdd49ff` | `source_control.repository.bound.json` |
| 141 | DL-660 | `source_control.repository.unbound` | W3B | batch 3 | `c4c7e159b5` | `source_control.repository.unbound.json` |
| 142 | DL-661 | `source_control.status.refreshed` | W3B | batch 3 | `8352753ca7` | `source_control.status.refreshed.json` |
| 143 | DL-662 | `source_control.workspace.created` | W3B | batch 3 | `26e769e1d8` | `source_control.workspace.created.json` |
| 144 | DL-663 | `source_control.workspace.opened` | W3B | batch 3 | `b92c95e768` | `source_control.workspace.opened.json` |
| 145 | DL-664 | `source_control.workspace.removed` | W3B | batch 3 | `6119b68549` | `source_control.workspace.removed.json` |
| 146 | DL-665 | `source_control.workspace.switched` | W3B | batch 3 | `44556ea6cf` | `source_control.workspace.switched.json` |
| 147 | DL-666 | `source_control.writer_lease.granted` | W3B | batch 3 | `175f8c945a` | `source_control.writer_lease.granted.json` |
| 148 | DL-667 | `source_control.writer_lease.lost` | W3B | batch 3 | `af4724bd48` | `source_control.writer_lease.lost.json` |
| 149 | DL-668 | `testing.capture.bookmarked` | W3C | batch 3 | `091b006045` | `testing.capture.bookmarked.json` |
| 150 | DL-669 | `testing.capture.clip_saved` | W3C | batch 3 | `3ac74eedff` | `testing.capture.clip_saved.json` |
| 151 | DL-670 | `testing.capture.effective_quality_changed` | W3C | batch 3 | `86e4a13e6e` | `testing.capture.effective_quality_changed.json` |
| 152 | DL-671 | `testing.capture.health_degraded` | W3C | batch 3 | `bfdb3270ac` | `testing.capture.health_degraded.json` |
| 153 | DL-672 | `testing.capture.health_recovered` | W3C | batch 3 | `aff59029c1` | `testing.capture.health_recovered.json` |
| 154 | DL-673 | `testing.capture.interrupted` | W3C | batch 3 | `812b3f109d` | `testing.capture.interrupted.json` |
| 155 | DL-674 | `testing.capture.paused` | W3C | batch 3 | `1a5a383ad4` | `testing.capture.paused.json` |
| 156 | DL-675 | `testing.capture.provenance_rejected` | W3C | batch 3 | `fc580ff594` | `testing.capture.provenance_rejected.json` |
| 157 | DL-676 | `testing.capture.provenance_verified` | W3C | batch 3 | `e4f7e74aa3` | `testing.capture.provenance_verified.json` |
| 158 | DL-677 | `testing.capture.redaction_applied` | W3C | batch 3 | `fafe62b121` | `testing.capture.redaction_applied.json` |
| 159 | DL-678 | `testing.capture.resumed` | W3C | batch 3 | `78cd270079` | `testing.capture.resumed.json` |
| 160 | DL-679 | `testing.capture.segment_corrupt` | W3C | batch 3 | `7510c218eb` | `testing.capture.segment_corrupt.json` |
| 161 | DL-680 | `testing.capture.segment_finalized` | W3C | batch 3 | `1ba01b7a37` | `testing.capture.segment_finalized.json` |
| 162 | DL-681 | `testing.capture.segment_recovered` | W3C | batch 3 | `03a16a5f51` | `testing.capture.segment_recovered.json` |
| 163 | DL-682 | `testing.capture.started` | W3C | batch 3 | `b331a66bd5` | `testing.capture.started.json` |
| 164 | DL-683 | `testing.capture.stopped` | W3C | batch 3 | `a1a6beb6c1` | `testing.capture.stopped.json` |
| 165 | DL-684 | `testing.capture.target_changed` | W3C | batch 3 | `a15aaad39b` | `testing.capture.target_changed.json` |
| 166 | DL-685 | `testing.runtime_enabled_for_adapter` | W3C | batch 3 | `7afc022c44` | `testing.runtime_enabled_for_adapter.json` |
| 167 | DL-686 | `todo.created` | W3H | batch 3 | `bb75e62d29` | `todo.created.json` |
| 168 | DL-687 | `todo.dependency_changed` | W3H | batch 3 | `73b4671d70` | `todo.dependency_changed.json` |
| 169 | DL-688 | `todo.removed_from_current_list` | W3H | batch 3 | `586486c1d2` | `todo.removed_from_current_list.json` |
| 170 | DL-689 | `todo.reordered` | W3H | batch 3 | `9a7ccd185e` | `todo.reordered.json` |
| 171 | DL-690 | `todo.status_changed` | W3H | batch 3 | `e92c369b9d` | `todo.status_changed.json` |
| 172 | DL-691 | `todo.updated` | W3H | batch 3 | `860c2ac0f7` | `todo.updated.json` |
| 173 | DL-692 | `todo.work_bound` | W3H | batch 3 | `450d782c3c` | `todo.work_bound.json` |
