# Step 9: DL-095 and DL-096 rebuilt on today's main, 2026-11-04

Branch `plans/ea-s09-decisions-hb-scope-20261104`, made from `main` `be4766513f`. It rebuilds `origin/plans/ea-s09-decisions-hb-scope-20260925` (tip `46d4eced3d`, 11 commits over `63cf2cb97f`), which recorded two answers Jared gave on 2026-09-25 and was reviewed landing-ready but never landed. `main` has moved 3,737 commits since that base. Nothing in the two decisions changes. This branch is not landed; the Event Authority lead gives the landing go.

- **DL-095.** The heartbeat card `EA-S09B2-HEARTBEAT-EXPIRY-001`, answered **Approve** (option 1). A silent agent counts as crashed five minutes after its last heartbeat: `coordination_heartbeat_expiry_ms` is 300000. The owner edit lands later, with the `coordination.agent_crashed` admission.
- **DL-096.** Jared's answer "And yes I approve the DL-093 covering the families and later". Each Step 9 registration's own Decision Log entry is Jared's decision entry for its family.

The September branch report, `step-09-decisions-hb-scope-20260925.md`, is carried unchanged as the record of the reviewed branch. Its statements about base, counts and checks are that branch's. This note says what changed in the rebuild and why.

## What moved

| September commit | This branch | What |
|---|---|---|
| `aa680074af` | `c50bcd75da` | Heartbeat card copy, byte-identical to the presented file (SHA-256 `530e7837...118b`). |
| `faee36ac16`, `46d4eced3d` (HS-05) | `be22066bd3` | DL-095 in both Decision Log sections, with shards and index regenerated. |
| `0f84a7d616`, `fc615537e7` (HS-01), `71ce54b30a` (HS-04) | `5a2a3221cb` | DL-096 in both sections, with shards and index regenerated. |
| `69fa5663ed`, `04f0515c32` (HS-03) | `d1ff740ec8` | The two `decision-responses.jsonl` rows. |
| `9b4f96e9ff` | `c0e2cc6143` | The open question 2 (D-02) paragraph in the Step 9 procedure record. |
| `28fb80463f`, `d594f048fc` (HS-02), `04f0515c32` (HS-03) | `c02ca2cd17` | The September branch report, unchanged. |
| none | this commit | This note. |

**Text carried byte for byte.** Each carried block equals the September tip's bytes:
- the DL-095 and DL-096 prose entries and their two PlanUnits;
- the two response rows;
- the procedure paragraph;
- the card copy;
- the September report.

No word of Jared's and no entry text changed. The quotes and hashes were re-verified against `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/`:
- `ANSWERS_HEARTBEAT_AND_DL093_SCOPE.md`, SHA-256 `5d0538a1ab9e9a7d397093cfefc71045b2ac214654984767f37efa2bbabf889f`. It holds "Card (EA-S09B2-HEARTBEAT-EXPIRY-001): Approve" and "And yes I approve the DL-093 covering the families and later".
- `QUESTION_WORDINGS_DL093_SCOPE.md`, `6c546805b16ff95b0a442439ad2c2e1bd6f9b6f10d10240bc96aeeac4e3cbe56`. It holds the host's 05:53Z and 12:10Z wordings, which DL-096 quotes.
- `ANSWERS_OPEN_QUESTIONS.md`, `678b9a32a0942fff08cea4127d9c52d7e73774509869c88958f466d6b8d0171a`.
- The presented card directory `step-09-heartbeat-card-presented-20260925/`: `sha256sum -c SHA256SUMS` is OK, and SHA256SUMS hashes to `787f5e2d...d772`.
- Review finding CP-05's file `/mnt/Cursor/PM-Experiments/review-ea-s09-coordination-prep-20260925/findings.jsonl`, still `e14c7f5a3e79b80f0058544943c651e440a2935cefe3f0db1d0d31e9d8f76401`.

**Placement.** DL-094 (`coordination.agent_registered`) landed on 2026-09-25 (`abdf4eead`), and `main` now jumps from DL-094 to DL-104.
- The DL-095 and DL-096 prose entries go after DL-094's one trailing blank line and before DL-104. Their PlanUnits go after DL-094's and before DL-001.
- Both are pure insertions: removing the two blocks gives back `main`'s Decision Log byte for byte.
- DL-094's prose section, by the independent validator's `decision_section_bytes` recipe, still hashes `e8e2404f028e426c6e69572ab848eae668ea095baf7389b3ae21ba85f151587f`, the `decision_section_sha256` its admission record pins.
- The DL-039, DL-045, DL-077, DL-078, DL-090 and DL-091 sections hash as at `63cf2cb97f`.
- DL-093's text is unchanged. Its section now ends with one blank line instead of two because DL-094 follows it; that change is `main`'s, not this branch's.

**Numbers.** DL-095 and DL-096 are still free on `main` and on every `origin` branch, with two exceptions:
- the September branch itself;
- the stale `origin/fix/server-pairing-issuance-rebased-20260925` (tip `2148e15956`, 2026-09-26). It now holds DL-094 to DL-103, ten unrelated decisions, not DL-094 to DL-098 as the September report says. Its DL-094 already collides with `main`, so it renumbers if it ever lands.

`origin/fix/server-pairing-issuance-20260925` holds none of them. The scan covered the `### DL-NNN` headings and `plan_unit_id` lines of `Plans/Decision_Log.md` on all 462 remote branches. The lander re-checks at the landing fetch.

**Procedure record.** `main` added the first registration's count row (1 registered, 15 excluded, 0 carded, 236 remaining) on other lines. The D-02 paragraph applied cleanly, and the count table is not touched.

**Response rows.** The file on `main` is byte-equal to the September base, so the two rows are a pure append. The file now has 36 rows, and the response ids are unique.

**Derived files.** The Decision Log shards and `Plans/.plan_index` were regenerated after each Decision Log commit, not cherry-picked.
- The currentness edition was copied from the shared checkout into the ignored path first, and its 15 files were checked by SHA-256.
- Regenerating clean `main` in this worktree first changed only `generated_at_utc`.
- Only the Decision Log changed: PlanUnits went from 7,421 to 7,423, and acceptance units from 29,932 to 29,938.
- The node readiness report gains one row, `event_authority_currentness_source_drift` for `Plans/Decision_Log.md`. On `main`, after the 2026-11-04 reseal, the Decision Log was current. That row is staleness until the next reseal.

## Citations re-checked against today's text

Every passage DL-095 and DL-096 cite still says what they say. Neither entry cites a line number, so no citation in the entries moved and neither entry was edited.

- **OSI-438** (`Plans/orchestrator-subagent-integration.md`, PlanUnit at line 3898, prose at 3837). It still names `coordination_heartbeat_expiry_ms` as the runtime policy value with no number assigned. It still says the value "is owned by the Orchestrator runtime policy that the card records; until it is answered, `heartbeat_expired` is not inferred". Since September its PlanUnit was rewrapped and gained an app-children sentence (OSI-440) that adds "no ... heartbeat threshold". `coordination_heartbeat_expiry_ms` is still unset in every owner. The only number for it on `main` is the negative fixture `crashed_threshold_field` in `Plans/coordination_event_contract_fixtures.json`, which was already there at the September base.
- **SP-320** (`Plans/storage-plan.md`, line 27262). It gained app-scope text and a longer `source_lineage` and still does not cite the value. Citing it is DL-095's future owner edit.
- **CV-353** (`Plans/Contracts_V0.md`, line 3118). Its PlanUnit is byte-identical to September's.
- **DL-078** still says "is the decision entry its DL-077 admission record cites".
- **DL-093** still records DL-077's V-07 pin.
- **The Step 9 procedure record** still has open question 2 (D-02), with the DL-093 paragraph before the one this branch adds.
- **Only `coordination.agent_registered` is registered** among the seven coordination families. The registry is at revision `2026-11-04.1` with 46 families. So DL-095's "lands before or with the `coordination.agent_crashed` admission" still holds.

**One passage moved, in the frozen card, not in the entries.** The card's evidence line cites `Plans/orchestrator-subagent-integration.md` Gap #30 "around lines 4934 to 4944" and the claim-expiry rule "around line 5131" at `cd46487bf0`. Today Gap #30 is at lines 5102 to 5111, with byte-identical text including "(e.g., 5 minutes)". The claim-expiry bullet is at line 5298, unchanged. The card copy is a frozen copy of what Jared answered and is not edited; this note records the move.

## Checks

Run in this worktree, a full (non-sparse) T3 checkout with the ignored inputs that `reports/landing-checks/README.md` lists:
- the currentness edition, copied and checked by SHA-256;
- the ten `Plans/.audits` inputs, copied and checked by SHA-256;
- the `tests/agent_packet_restrictions` symlink, with an absolute target.

- **Shard check:** pass, 3,092 shards, exit 0.
- **`pm-plan-index.py validate`:** exit 0, top-level `status` `pass` (read with a JSON parse).
- **Unit tests.** Each module fails on `main` `be4766513f` with exactly the same failing tests, run in the same tree:
  - `test_event_authority_holding_bucket`: 34 run, 2 failures.
  - `test_pm_emit_only_event_boundaries`: 13 run, 1 failure.
  - `test_pm_pnc019_currentness`: 9 run, 1 failure.
  - `test_pm_coordination_events`: 50 run, 14 failures.

  The holding-bucket failures name `approval.chat_tool_requested`, `approval.chat_tool_resolved` and `settings.layer.changed`, which `main` registered after September without DL-077 admission records. The output of three modules is identical to `main`'s. In the currentness test the drift list grows from 22 to 23 rows, the added row being `Plans/Decision_Log.md`.
- **Dry landing check** (`pm-landing-check.py --base origin/main --json`, at `c02ca2cd17`, the tip before this note): **exit 1, with 0 blocking items** and no timed-out subcheck. The baseline `5aa12e1dd0` is current. All 2,808 new rows are staleness, and none is pre-existing on the branch's files:
  - **`plan-migration-validate`**, 0 to 2,802 rows. All of them compare the current snapshot `pds-20261104-004` with the edited Decision Log: 2,419 span-metadata rows, 344 span-hash rows, 15 coverage rows, and the manifest, count and pointer rows.
  - **In each aggregate**, three buckets grow:
    - `event_authority_currentness_source_drift`, from 22 to 23 (`Plans/Decision_Log.md`);
    - run-002 `stale_batch_report_sha256_after`, from 58 to 59 (row 43), with its `complete_final_summary_live_plan_unit_count_stale` row;
    - `artifact_hash_stale` on the plan-sharding evidence bundle, from 1,436 to 1,450: the Decision Log and its 13 shard files.
  - **`audit_closure`**, compared by total only, is unchanged at 201.

The check outputs are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/B1/landing-check-branch1/`.

## Expected at landing, and the reseal request

Among the Plans documents, only `Plans/Decision_Log.md` changes. For the reseal agent:
- the plan-sharding bundle rows for the Decision Log and its shards;
- a currentness edition that covers it, which clears the new drift row;
- run-002 `refresh-batch-hashes` and `refresh-final-summary`;
- the readiness gate report.

After the landing, the landing agent runs `snapshot-current` and `--record-baseline`. The Decision Log has no Spec Lock entry.

## Follow-ups, unchanged from September

- **DL-095's owner edit** lands before or with the `coordination.agent_crashed` admission. It names where the Orchestrator runtime policy records the value, and it aligns OSI-438's sentences that assign no number.
- **D-02** needs nothing more.
