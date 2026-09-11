# Shard 009: Known-37 recovery-unavailable graph actions - 2026-07-18

Source: `Plans/Run_Graph_View.md`

Source lines: L188-L192

Source SHA256: `15a71b95a9383d4bea46ba17a8024ecc8f6829f5a2bb9f857a87c3fdb7e592c5`

---

## Known-37 recovery-unavailable graph actions - 2026-07-18

For a graph node bound to `safe_point.recovery_unavailable`, the graph consumes the current canonical blocked episode and exact ordered owner actions: `open_details`, `locate_and_verify_recovery`, `replan`, conditional `start_fresh_attempt`, and `abandon_recovery`. It retains the owner order and displays the exact reason and preserved-work warning. It never introduces graph-local action IDs, reconstructs membership, substitutes ordinary restore/retry, or treats node selection as attempt identity.

Pre-attempt nodes dispatch without `attempt_id`; post-attempt nodes use the exact current prior attempt. Locate/verify and abandonment normalize only to the two catalog commands and sole runtime handlers. The graph refreshes to released only after the typed result and committed resolution receipt establish `resolved`, `superseded_with_verified_successor`, or `abandoned_by_user` under the owning command. Accepted dispatch, stale projection, refused/recoverable result, or missing receipt retains the recovery-unavailable node and exposes the owner disabled reason. No graph action performs cleanup or silently cancels the run.
