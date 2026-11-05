# Lane DC — sweep part 1

Branch `plans/ea-collab-prep-20261104`; tested implementation commit `8a57581d724f4b41c3c24a30ad08434711426aa4`. Rebased onto `origin/main` `d5ec2f70c0d69c469796eea9b9cfdae30f281f42` before fixture repair. This report supersedes the round-3 report for current grades and verification; its prior binding searches remain in `DC-binding-search.md` and earlier Git commits.

**Part 1 fixture repairs pass; the lane is NOT_READY pending part 2.** No deck-2 item was assigned to DC in this task. C4-B1, C4-B2 and C4-B3 are fixed. The production checker, schemas, identity/number helpers and legacy proof machinery are unchanged by the fixture repair. Current base materializes the selected Chat retention policy; retention rises to PASS. Membership remains ABSENT, oracles remain PARTIAL and native execution remains NOT_RUN.

## Sweep part 1: findings and responses

| Item | Response and location | How to verify |
|---|---|---|
| C4-B1 | **Fixed in `8a57581d724f4b41c3c24a30ad08434711426aa4`.** All 1,631 reviewed stale-key cases are rebuilt. Computable full payloads refresh the key; invalid primitive identity operands use their actual canonical property node and a valid counterpart. `Plans/collaboration_event_contract_fixtures.json:95452` is the reviewed created/Project LF witness. The inventory covers all 18 families and additional explicit payload peers. | `fixture-audit.json`: 14,302 full-payload key checks, zero stale keys; `guard-cases.json` lists every parent and actual guard. Run the full checker. |
| C4-B2 | **Fixed in `8a57581d724f4b41c3c24a30ad08434711426aa4`.** The original revision ID remains a coherent full-payload adjacency negative so the prepared ledger keeps its valid reference; `configuration_changed_revision_1:minimum_component` separately isolates the subsumed minimum at the actual property node. Four ordinary completed/failed count minima refresh the other reviewer count; both single-reviewer large-request cases refresh the completed count. Wrong-type arithmetic operands use primitive components. `Plans/collaboration_event_contract_fixtures.json:281918` and `:49155`. | The fixture audit checks 929 revision pairs and 1,054 reviewer sums, all coherent. Original adjacency and reviewer-sum rejection guards remain enabled in the full checker. |
| C4-B3 | **Fixed in `8a57581d724f4b41c3c24a30ad08434711426aa4`.** All 38 reviewed overlapping-enum negatives now target the root `state_before` property component. Two additional full-payload `paused` cases isolate the distinct non-End conditional, with the root predicate satisfied. `Plans/collaboration_event_contract_fixtures.json:38525` and `:8758`. | Actual property negatives and their valid counterparts run in schema probes; both full conditional witnesses run through `payload_rejection`. |
| C4-I1 rebase integration | **Advanced-main units incorporated in `8a57581d724f4b41c3c24a30ad08434711426aa4`.** Landed DL-404 and the existing Storage policy are preserved; the inherited pending-policy timing claims in CWR-105..123, SP-460 and ATS-230 are corrected. Goal schema additions on main are preserved alongside DC wrapper additions. No retention value or Decision Log answer is changed. | The checker reports no missing-policy admission blocker; the final index result is recorded below without resealing. |

## Valid parents and per-guard inventory

2980 repaired or added cases: 1,402 canonical property-component witnesses and 1,578 full-payload witnesses. Each record names its valid parent, the target field, any refreshed companion and, for components, its valid counterpart. There are 243 new parent-specific component positives. The fixture has 19,322 schema negatives, 276 schema positives, 127 positive payloads and 193 explicit negative payloads.

`reports/event-authority-20261104/DC-sweep-p1-guards.json` groups the exact case IDs under 299 observed guard locations and records their parents. `guard-cases.json` retains the complete annotated inventory. This is fixture consistency evidence, not shared-tool guard-removal proof. The 72 missing identity-input required-member witnesses remain explicitly shape-boundary evidence; current identity cannot be evaluated without its required input. Part 2 must classify those dependencies/subsumptions without merging independent predicates. Existing fixed-width schema overlaps are also left to that predicate inventory.

## Part 2 items

| Item | Location and required work |
|---|---|
| SW-P1 | `scripts/pm_collaboration_events.py:2230,2385,2428`: adopt `scripts/pm_guard_isolation.py` from `plans/ea-guardtool-20261105`, **method B**, with named predicate functions in shared guard tables. Use the per-guard case inventory. Preserve compound peers; prove genuine duplicates site by site; classify requiredness/subsumption and fixed-width implications. The legacy table is not proof. |
| SW-N1 | `decode_json:106`, `canonical:145`, identity helpers `:193`, SP-460: adopt CV-1100 parsing/current integer-token admission; preserve local identity tuples and prefixes. |
| SW-N2 | Decoder/canonical/reference/wrapper/stored-size paths and SP-460: adopt SP-1100 owner-selected physical profiles; preserve finite float types/bytes and Storage uint64, with no 2^53 cap. |
| SW-N3 | `canonical:145`, `same_fact:216`, row/reference commitments and SP-460: preserve signed zero and integer/float distinctions in the selected physical domain. |
| SW-N4 | `producer_digest:212`, row/reference commitments, CV-460/SP-460: retain the payload-only producer projection and local recipe ownership; use qualified RFC8785 only where required, without v1 restamping. |
| SW-N5 | `historical_rejection:703` and current helper calls: adopt SP-1101 authenticated original edition/recipe selection, without caller-selected weaker recipes or current-first fallback. |
| SW-F1 | `Plans/collaborative_workflows_contracts.schema.json:213`, `utc_timestamp`, original source/wrapper paths: exact current calendar/zone/fraction/LF grammar and isolated negatives, with authenticated old-original grammar selection. Do not tighten retained schemas in place. |

No new number serializer, cap, guard-proof machinery, product binding, product decision, admission, registry member or PlanUnit ID is introduced in this sweep part.

## Family grades before and after

P/Q/A mean PASS/PARTIAL/ABSENT across the same twelve criteria. The nine prior PASS cells remain supported. Retention becomes the tenth PASS because the selected policy is materialized on the current base. Oracles stay PARTIAL until the shared method-B proof passes; membership stays ABSENT until separate admission.

| Family | Before P/Q/A | After P/Q/A | Preparation |
|---|---|---|---|
| `collaboration.created` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.started` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.paused` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.resumed` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.cancelled` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.completed` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.failed` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.participant_started` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.participant_completed` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.message_added` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.artifact_added` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.configuration_changed` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `brainstorm.proposal_added` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `brainstorm.vote_added` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `brainstorm.plan_synthesized` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `review.finding_added` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `review.finding_dispositioned` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `review.artifact_finalized` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |

**Totals:** 162 PASS / 36 PARTIAL / 18 ABSENT → 180 PASS / 18 PARTIAL / 18 ABSENT. No family is READY or admitted. All 576 current self-grade evidence quotes were relocated and hashed mechanically, with zero mismatches.

## Verification

All heavy checker processes ran sequentially. The resource controller waited for the prior Nas1 lane, deferred while another checker was active, and paused its process group if available memory fell below 6 GB. Exact commands, exits, elapsed times and resource samples are in `check-results.json`.

| Check | Exit / result |
|---|---|
| `fixture-audit` | 0 |
| `checker` | 0 |
| `self-test` | 0 |
| `shards-generate` | 0 |
| `index-generate` | 0 |
| `shards-check` | 0 |
| `index-validate` | 0 |

Full checker: `pass`, 18 prepared rows, zero admitted families, 0 failures, no missing-policy blocker. Self-test: `pass`, 14 scenarios, including both failure-exit and unvisited-reference controls.

Index validation: top-level `pass`, 0 failures. Its readiness status remains `blocked_runtime_certification_incomplete`; this is not runtime certification or a governance reseal. Shards and the index were regenerated from the rebased sources. No unrelated source document is changed.

Standing checks 1–10 and the recurring forgery/custody/type/reference/size/history/format controls execute in the unchanged full checker and self-test. Check 11 remains qualified by SW-P1. Numeric and original-source timestamp qualifications remain SW-N1..N5 and SW-F1; this sweep claims no shared-rule or native clearance.

## IDs and evidence

Existing allocations remain CWR-105..123, CV-460..478, SP-460..478 and ATS-230..248. No new PlanUnit, Decision Log, OSI, event admission or WorkNode ID is minted. New fixture IDs are 243 parent-specific valid component IDs, `configuration_changed_revision_1:minimum_component`, and four `sweep-p1:` full-payload adjacency/state cases. The original revision ID is retained for its prepared-ledger reference.

Evidence manifest: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/sweep-p1/manifest.json` — SHA-256 `24f8e8d11765f1377a74a3e3a47e1bc16cb62739377a0cdb897f2152f998fa05`.

- Fixture audit: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/sweep-p1/fixture-audit.json` — SHA-256 `62ecf17302538343cb43d447bfbb9adb2fbd408818dcfd572926ad1de561aaa2`.
- Per-guard inventory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/sweep-p1/guard-cases.json` — SHA-256 `ff0a682520bf145436b4d995228620199ce362de98a72be4013fc187d27bba8e`.
- Check results: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/sweep-p1/check-results.json` — SHA-256 `a21521e95d9270fbdd53d12e760272c9243874c8df04597e61a80bb949782fba`.
- Currentness copy: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/sweep-p1/currentness-copy.json` — SHA-256 `b72623c6887c9cb3b53eb0da0baf1e1b8c0b5d46fe116d4f25746361bbe73b8b`.

The report and self-grade are copied to the lane evidence directory and its `sweep-p1` folder. Only the lane branch is pushed; the temporary worktree is removed after the push.
