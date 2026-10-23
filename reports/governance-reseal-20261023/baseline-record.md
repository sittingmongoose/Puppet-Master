# Frozen baseline and deferred follow-up — 2026-10-23

Frozen round-2 base: `51e1af633fd7e977a2f2c8f92a60035f3386ce33`. Observed main: `2d4287bcb77ed5e072ae619012f5c276375df423`. The untouched landing baseline records `a50e5c64ac2215e86e668fc797b1c87130ab945c` at `2026-10-23T01:59:38Z`; SHA-256 `dd45e89bd6a306cf726a89c8955d39b27fc30d3b88e9dc9a3108d62fe19cd0c5`.

Its 15 ignored currentness input hashes were reconstructed from preserved October 22 captures and verified exactly. The local landing comparison restores the old seven generated files into the same local directory, selects it explicitly, and restores the final edition afterward. The eight frozen inputs are never changed. No shared edition is accessed or installed by this agent.

Local landing check exit 2; 0 aggregate blocking rows; 0 infrastructure results. Its separate PM7 publication guard fails on both the frozen base and the prepared governance commit. Overall landing eligibility remains false.

The current snapshot `pds-20261023-001-current-planunit-snapshot` retains 2806 staleness findings at the frozen round-2 base. No snapshot, pointer, baseline or historical input is refreshed during preparation. Complete comparison reports, exports, input bindings and denominators are retained externally.

Round 2 must land before rebase and repeated checks. If new main's `Plans/` differs from `51e1af633f`, record the differences and redo affected steps; never claim whole-tree byte identity after an intervening snapshot refresh. Astra review and explicit Jared GO follow those checks.

Only after the later checked reseal main push may the landing agent back up and install the reviewed currentness edition. A full local worktree at that pushed main must dry-run and generate the next unused current snapshot (`--expected-doc-count 96`, superseding the then-current run) before `pm-landing-check.py --record-baseline`. Commit and push snapshot and baseline together as a separate follow-up. Never refresh a baseline to excuse a pending landing.
