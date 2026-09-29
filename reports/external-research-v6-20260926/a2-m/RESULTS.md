# A2-M: FAIL / INCOMPLETE at native time cap

One fresh Muse Code / Muse 1.3 Contributor Max native Goal ran from approved commit `dfaa7254f7119229f79b9e4c22605dfbccdf77fb`, through the unchanged pinned driver and prepared operator/audit. Setup completed in 2.939 seconds, inside the ten-second gate. The exact A1 task and all nine templates were retained unchanged; [input hashes](input-manifest.json) bind the [existing packet](../a1-m/inputs/task.txt).

The native driver stopped at `cap_seconds`: **six of nine acknowledgements** were reached. The independent seventh finding and both prescribed revisions were not submitted. The [unchanged automatic audit](checks/structural-audit.json) reports failure; dependent full-task checks are not reached/unavailable. There was no retry, replacement, correction slot, zcode assignment, evaluator, account probe or smoke call.

| Observation | Actual result |
|---|---|
| Initial payload / marker batches | Six completed Writes in each single native batch |
| Marker-operation overlap | 15 overlapping pairs observed from bound start/terminal sequences |
| Acknowledgements / accepted snapshots | 6 / 12 (required 9 / 18) |
| Protocol errors | 0 |
| Seven independent current records and two revisions | Not completed; full lineage/history criterion not reached |
| Idle polls after acceptance | 493; publication delta 0; projection bytes unchanged |

[Partial sequence evidence](checks/partial-sequence.json) preserves exact call/session/run/task/effect identities, intervals, result text/advisories and acknowledgement records. These reached observations do not replace the full-task audit or turn this result into a pass. The Store's local `structurally_complete: true` means its received submissions were structurally accepted; it does **not** establish completion of all nine task submissions. Receipt/snapshot and current/history requirements remain subject to the failed full-task allocation gate.

## Time and usage

The persistent [Go record](go-observation.json) starts at epoch `1790701385.2851405`; deadline `1790701775.2851405`. Native limits were 300 seconds / 48 parent responses. The driver requested pause/interrupt at the time cap and retained its existing shutdown grace; its final elapsed receipt includes that grace. [Execution termination](phase-terminal.json), including staging, cleanup and automatic audit, occurred 322.094 seconds after Go. [Host receipt](host-receipt.json): 6017 polls, 16.482 overlapping receiver-core seconds, 34 projection publications. No wall-time saving is inferred.

Actual confirmed publication timing is recorded separately in `PUBLICATION.json`; execution completion alone is not whole-check compliance. [Usage](checks/usage.json) distinguishes requested/observed settings, completed parent usage and unknown child/cancelled/whole-run components. Astra orchestration and Sol medium mechanical accounting are development/host work, not candidate or formal grader usage. This is structural evidence only, with no semantic research qualification.

Raw native events, snapshots, pending/partial files and receipts remain on the VM, bound by [RAW_EVIDENCE.json](RAW_EVIDENCE.json). All 535 previously pinned original files remain unchanged. A1-M stays FAIL/INCOMPLETE; I2 stays closed and its two zcode originals remain unstarted. V-FOLLOWON-1 stays OPEN. No R1b Block 2, canon/governance or WorkNodes changed. A2-M is closed; no further live work is authorized.
