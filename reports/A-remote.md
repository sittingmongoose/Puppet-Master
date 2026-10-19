# A-remote: remote PM7 parity

Status: transport implemented; Windows proof and LeftRail matrix pending.
Branch: `concept/pm7-parity-remote-20261019`, based on `f9536abd6a`.
Own worktree; lead owns integration and landing.

## Mechanism

`--host windows|mac` selects GPU Browser Fleet; each pair shares one Chrome process.
Default local admission, rendering preparation and comparison gates remain unchanged.
Remote input delivery uses an ephemeral controller LAN HTTP server, a single per-worker
URL for both exact input bodies and inert storage probes, fresh contexts, and no-store
responses. All other HTTP routes return 404; the request gate permits only the exact
current top-level document. Remote concurrency accepts 1..8; local remains 1..6.
Rows include host, GPU renderer, Chrome build, session and transport. Remote process
IDs are never sampled through local `/proc`; remote memory is controller-only.
Minute keepalives protect leases; normal completion, signals and startup failures stop
and purge owned remote sessions. Report browser lifecycles retain cleanup results.

Remote CDP defaults to authenticated SSH. The documented P1000-to-Windows key restriction
was reproduced: `SSH forwarding rejected by the host/key policy: channel 1: open failed:
administratively prohibited: open failed`. There is no automatic fallback. The explicit
`--remote-cdp lan` option uses the supported trusted-LAN listener, revoked at stop.
The initial Windows probe reported RTX 3090, Chrome/155.0.8059.82 and hardware rendering;
it was stopped gracefully and purged.

## Validation

Controller unit tests: 12/12 pass, none skipped. Existing PNG/envelope/style/matrix/blob
and WebSocket tests remain, plus remote option boundaries and exact-byte HTTP delivery,
inert probes, per-input switching, non-document route rejection, and unregister cleanup.
Four-generator/hash proof is in progress. No generated page or Plans file was edited.

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/`.

| Evidence | SHA-256 |
|---|---|
| unit-tests-controller.log | 7b97b94bdc40ead6be25255ae5b6ec45cd7b558741adc4931601779bc0fffbe8 |

## Remaining assigned work

Windows-host unit tests; six-state main/main; target-only 1px sensitivity proof;
full LeftRail `10b644d389` versus `a6d9473cec` with baseline repeats eight and default
caps; forced eight-fresh-main diagnostic surveys for every raw-pixel row; distinct
DOM-only tag/id/path records; then Mac exact proof-copies matrix if feasible.
Original candidate captures and strict raw/selected verdicts will remain unchanged.
