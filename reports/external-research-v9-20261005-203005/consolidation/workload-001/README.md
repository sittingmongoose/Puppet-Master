# ER9 finite workload checkpoint

Metadata-only bounded checkpoint 2026-10-06T03:28:03.637095+00:00. Source hashes and observation window are recorded in WORKLOAD_SCOREBOARD.json. Live registry observations are not atomic.

{
  "A": {
    "requested_pairs": 32,
    "requested_arms_or_pipelines": 64,
    "registered_stages": 78,
    "native_started_stages": 54,
    "terminal_stages": 51,
    "remaining_nonterminal_stages": 27,
    "not_verified_operational_complete_stages": 77,
    "true_operational_complete_arms": 1,
    "unknown_operational_complete_arms": 18
  },
  "B": {
    "requested_pairs": 12,
    "requested_arms_or_pipelines": 24,
    "registered_stages": 74,
    "native_started_stages": 14,
    "terminal_stages": 22,
    "remaining_nonterminal_stages": 52,
    "not_verified_operational_complete_stages": 68,
    "true_operational_complete_arms": 0,
    "unknown_operational_complete_arms": 16
  },
  "C": {
    "requested_pairs": 4,
    "requested_arms_or_pipelines": 8,
    "registered_stages": 22,
    "native_started_stages": 5,
    "terminal_stages": 9,
    "remaining_nonterminal_stages": 13,
    "not_verified_operational_complete_stages": 22,
    "true_operational_complete_arms": 0,
    "unknown_operational_complete_arms": 5
  }
}

48 pair slots are targets to execute and assess. Native starts, operational terminal statuses, four final-file inventories, true operational completion and scientific qualification are distinct. Failed stages do not complete pipelines. Warm/recovery history is retained but has no fresh Track B credit. Diagnostic latest-stage selection is a metadata projection, not an admission or grade. All unknown judgments remain UNKNOWN.

Only files named by PUBLICATION_SELECTOR.json may be published; source bodies/raw native text/auth remain excluded.
