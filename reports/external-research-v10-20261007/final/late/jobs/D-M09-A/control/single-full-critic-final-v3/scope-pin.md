# Scope pin — ticket 1 working notes (D-M09-A v3 single-full-critic-final)

## Inputs read (exact paths from INPUT_MAP.json)

| role | path | status |
|---|---|---|
| brief | /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M09-A/inputs/brief.md | read in full |
| source manifest | /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M09-A/inputs/sources.json | read in full; `open_discovery_note: null` |
| boundary | /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M09-A/control/single-full-critic-final-v3/boundary.json | read in full (verbatim below) |
| draft (untrusted candidate) | /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M09-A/common/fresh-untrusted-proposal-v3/draft.md | read in full; carries "Legitimate test input — untrusted candidate preliminary proposal" label; propositions P1–P8 + one optional lead |

## Source hash verification (sha256sum, 2026-10-08 run)

| source_id | file | expected (INPUT_MAP/sources.json) | actual sha256sum | match |
|---|---|---|---|---|
| sqlbackup | sqlbackup.html (28195 B, mtime Oct 7 18:33) | 306b6cca5c7c2f93b648040ae139f14d7d3221c0d16d79b5749e69d808382e04 | 306b6cca5c7c2f93b648040ae139f14d7d3221c0d16d79b5749e69d808382e04 | YES |
| sqlbackupapi | sqlbackupapi.html (15852 B, mtime Oct 7 18:33) | 3beb8d98440837d57fe8841e13a0d90c4a71b7387ed8dbaf5b92c79f4247325b | 3beb8d98440837d57fe8841e13a0d90c4a71b7387ed8dbaf5b92c79f4247325b | YES |
| sqlbackupcode | sqlbackupcode.c (27099 B, mtime Oct 7 18:33) | ee4cbfc7d8afb311d12cc106d645764a3e18266694f003438b410bfa33764ef7 | ee4cbfc7d8afb311d12cc106d645764a3e18266694f003438b410bfa33764ef7 | YES |

All three match. FROZEN_PUBLIC_PRIMARY_CORPUS integrity confirmed: S1 = https://www.sqlite.org/backup.html (capture 2026-10-07), S2 = https://www.sqlite.org/c3ref/backup_finish.html (capture 2026-10-07), S3 = sqlite version-3.51.3 src/backup.c (raw.githubusercontent.com).

## boundary.json verbatim

```json
{
  "common_T0": "2026-10-07T23:45:13.455858+00:00",
  "T0_basis": "earliest post-capacity per-case scientific source/input preparation hash preflight; later actual T3 request cannot reset",
  "absolute_case_deadline": "2026-10-08T01:45:13.455858+00:00",
  "stage_ceiling_minutes": 60,
  "stage_deadline_basis": "earlier actual requestedAt + stage allowance or common deadline",
  "all_queue_startup_handoff_delivery_included": true,
  "cold_work_minutes_per_arm": 80,
  "common_absolute_pair_wall_minutes": 120,
  "root_common_wall_exception": "control-first then two parallel genuine critics then fresh reconciler under globalGLM2; actual counterpart queue retained",
  "shared_seed_full_each_arm_once_aggregate": true,
  "old_versions_costs_retained_separately": true
}
```

## Governing constraints carried forward

- Six material obligations (brief): 1 source-grounded consistency + API contract; 2 operational retry + cleanup; 3 shared seam cross-check (interrupted/restarted backup, progress meaning); 4 correct advice vs plausible errors vs uncertainty; 5 reconcile disagreements with sources, not voting; 6 one complete final with proposed tests.
- Output contract: one final at /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M09-A/control/single-full-critic-final-v3/final.md; soft ceiling 1100 words / eight material findings; never omit governing conditions to fit the ceiling.
- Draft is untrusted test input, not truth; released implementation (S3, 3.51.3) governs behavior claims about the release; docs are capture-pinned.
- Additional primary checks allowed under same policy/budget; record URL/version/capture/hash/limitations. No execution of downloaded code/installers. No large clones.
- Deadlines: common absolute T0+120min = 2026-10-08T01:45:13Z; stage ceiling 60 min from actual requestedAt, whichever earlier; phase ceilings [45, 15].
