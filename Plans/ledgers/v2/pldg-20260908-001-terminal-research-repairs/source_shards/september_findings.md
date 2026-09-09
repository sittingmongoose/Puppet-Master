# September source lineage

Source run: `research-audit-native-20260907/astra-xhigh-03`, final `jobs/synthesis-all/workspace/audit.md`. SHA-256: `249e14f6c0ea8bb7a755fb88fec666ed8a07faa86a56e8c0cec7b652427c7d30`. Its accepted final review is `evaluation/astra-xhigh-03/final-review.md` in the same experiment. Original reports remain preserved there.

## Finding 5 — retry wording

The reviewed report contrasts chat retry wording with the command catalog. Replacement execution creates a new session/card; same-shell rerun creates a new invocation/block; attachment recovery and movement reconciliation do not replay execution. Current revalidation finds unconditional new-terminal wording in both chat prose occurrences and ACD-108, while the current command catalog still permits explicit same-session rerun and same-session recovery.

## Finding 2 — output association and reads (bounded subset)

The report requires coherent extraction results for known-empty, complete-so-far, final, partial and unavailable output. It distinguishes live ranges, retained backing and command metadata; ordinary resize must preserve valid selections. Mutation, reflow, overwrite, pruning, alternate screens and uncertain writer attribution need explicit outcomes. Half-open ranges, generation fields and a named OutputRead type are candidates, not adopted schema requirements. Current SMPFS-020/023/125 and SP-125 already require stable text selection, honest partial backing and no silent loss but lack the read-result and concurrent-mutation acceptance details below.

## Scope limits

These are specification corrections, not reproduced runtime bugs. Only retry identity and output-read honesty are compiled. Final-drain implementation, schema reconciliation, Clear durability and PTY topology are not claimed resolved. The entire command output range must remain backed to claim completeness; surviving endpoint positions alone are insufficient. Known authoritative command completion does not become indeterminate because output backing is lost.
