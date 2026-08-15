# R6 decomposed experiment, revision 3

Revision 3 preserves R6-v1 and R6-v2. The passing R6-v2 decision and tension
artifacts are reused by exact payload hash. Only the invalidated grouped edge
work unit changes: each edge candidate receives one fresh typed subject call
containing exactly that candidate, its two keyed endpoint decisions, and the
frozen source-record excerpts cited by those decisions. A deterministic reducer
restores candidate order.

This remains an unfinished throwaway frozen-fixture experiment with no
current-Plans or production-readiness claim.
