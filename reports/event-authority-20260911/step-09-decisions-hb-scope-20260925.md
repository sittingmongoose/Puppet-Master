# Step 9: the heartbeat card answer and the DL-093 scope answer, 2026-09-25

Branch `plans/ea-s09-decisions-hb-scope-20260925`, made from `main` `63cf2cb97f`. It records two answers Jared gave on 2026-09-25 as DL-095 and DL-096. It is not landed. The coordinator dispatches any blind review and gives the landing go.

## What lands

- **DL-095, the heartbeat card.** Card `EA-S09B2-HEARTBEAT-EXPIRY-001`, answered **Approve**, which selects option 1: an agent that stops sending its heartbeat while its process is still running counts as crashed five minutes after its last heartbeat. That is ten missed 30-second heartbeats, `coordination_heartbeat_expiry_ms` = 300000. The entry has the form of DL-084 to DL-092: the header, the card text from Name through Recommendation exactly as presented (with the blank line the earlier entries add between a label and its list), the Answer and one application paragraph. The owner edit is not made on this branch. In it, the Orchestrator runtime policy that OSI-438 names records the value, SP-320 cites it, and the `heartbeat_expired` crash reason becomes active. That edit lands before or with the `coordination.agent_crashed` admission, and until then `heartbeat_expired` is still not inferred. The entry is not that family's decision entry and registers, admits or changes nothing else.
- **DL-096, the DL-093 scope answer.** Jared answered the host's question whether his DL-093 approval also covers the 18 collaborative families and later registrations (asked at 05:53Z, last reminded at 12:10Z) with "And yes I approve the DL-093 covering the families and later". The rule now covers the 18 collaborative workflow families of DL-090 and DL-091 and every later Step 9 registration: the DL-078 landing entry of the family's own registration is Jared's decision entry for that family in the DL-077 sense, as DL-093 already says for the seven coordination families. D-02 is now answered for every Step 9 registration. DL-077, DL-078 and DL-093 are not edited. The entry names no event family, so the seal check would not accept it as any family's decision entry. It registers nothing and lowers no Step 9 requirement: every registration still needs:
  - its full contract;
  - a blind review;
  - its own Storage admission landing;
  - the coordinator's landing go;
  - a complete DL-077 admission record.
- **Both Decision Log sections** hold both entries, and each has a PlanUnit in DL-083's form. The shards and index are regenerated and change only for the Decision Log. PlanUnits go from 6,742 to 6,744 and acceptance units from 26,321 to 26,327.
- **Reports:**
  - `step-09-coordination-heartbeat-card-20260925.md`, a byte-identical copy of the presented card (artifact `M8GSmygZ1MXjYaA7osPcTh`, SHA-256 `530e7837...118b`).
  - Two rows in `decision-responses.jsonl`:
    - `EA-S09B2-HEARTBEAT-EXPIRY-001-RESPONSE-001`, with status `approved_recorded_owner_contract_pending` because the owner edit comes later.
    - `HOST-Q4-DL093-SCOPE-RESPONSE-001`, with status `approved_recorded`. There was no card and no earlier row records a non-card answer, so `card_ref` is null.
  - One paragraph under open question 2 (D-02) of the Step 9 procedure record. Its count table does not change.

## Authority

Jared's own words, given in the Event Authority host session at about 13:39Z, are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_HEARTBEAT_AND_DL093_SCOPE.md` (SHA-256 `5d0538a1...f889f`). The card he answered is frozen in `step-09-heartbeat-card-presented-20260925/` (SHA256SUMS `787f5e2d...d772`).

DL-094 is reserved for the first coordination admission, on `plans/ea-s09-coord-registered-20260925`. At the fetch, no local or remote branch carried DL-095 or DL-096.

## Checks

The checks ran at `9b4f96e9ff` and are saved in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-09-decisions-hb-scope-checks-20260925/` (SHA256SUMS `83546399...e7fa`).

- Shard check: pass, 2,738 shards.
- `pm-plan-index.py validate`: pass.
- Regeneration reproduces every committed derived file apart from timestamps.
- Unit tests:
  - `test_event_authority_holding_bucket`: 34 OK.
  - `test_pm_emit_only_event_boundaries`: 13 OK.
  - `test_pm_pnc019_currentness`: 8 OK and 1 failure. The failure is drift only: eight source drift rows, including `Plans/Decision_Log.md`. All eight were already drifted on `main` at `63cf2cb97f`, and none is new.
- PyYAML parses both new PlanUnits. Each has DL-083's fields in DL-083's order, its preserved tokens are in its canonical text, and each equals its row in the plan index.
- The prose sections of DL-040, DL-046, DL-077, DL-078 and DL-093 are byte-unchanged, and the receipt and the three admission records still match their pins. Removing the two new entries gives back the base Decision Log byte for byte.
- `lint-contractrefs` (an extra check) reports only the known `00-plans-index.md` line 81 failure.
- Not run, as instructed: the independent validator, readiness generation, the gates and the landing check.

## Expected at landing

This forecast was not measured. Among the Plans documents, only `Plans/Decision_Log.md` changes, and its staleness is already on `main` from the DL-084 to DL-093 landing. Every row that names this branch should be that staleness:

- `artifact_hash_stale` rows for the Decision Log and its 10 shards;
- the currentness drift row;
- run-002 batch report row 43 and the final summary's PlanUnit count;
- the plan-migration current-snapshot rows for the Decision Log's units.

The expected result is exit 1 with 0 blocking items.

If `plans/ea-s09-coord-registered-20260925` lands first, this branch rebases onto it:

- **Decision Log.** DL-094 goes first in both sections, then DL-095 and DL-096. DL-094's pinned section must stay byte-identical: it ends with one blank line, and the DL-095 heading follows it.
- **Shards and index.** They are regenerated, never hand-merged.
- **Procedure record.** The paragraph added here and that branch's count rows touch different lines.

## Reseal request

For the designated Plans agent, because `Plans/Decision_Log.md` was edited:

- the plan-sharding bundle rows for the Decision Log and its 10 shards;
- a currentness edition that covers it;
- run-002 `refresh-batch-hashes` for row 43, and `refresh-final-summary` for the PlanUnit count;
- the implementation-readiness gate report;
- the nightly `snapshot-current`.

The Decision Log has no Spec Lock entry.

## Follow-ups

- **DL-095's owner edit.** It lands before or with the `coordination.agent_crashed` admission, the runtime policy value together with SP-320's citation. The edit has to name where the Orchestrator runtime policy records the value; review finding CP-05 found no Plans document that holds it. It also has to align OSI-438's sentences that assign no number. The coordination prep landing record forecast that family at 10 of 12 criteria while the value was missing.
- **D-02** needs nothing more. DL-094 on the coordination admission branch already cites DL-093.

## Commits

| Commit | What |
|---|---|
| `aa680074af` | the heartbeat card copy, byte-identical |
| `faee36ac16` | DL-095, both sections, with shards and index |
| `0f84a7d616` | DL-096, both sections, with shards and index |
| `69fa5663ed` | the two response rows |
| `9b4f96e9ff` | the procedure record, open question 2 |
| this commit | this report |
