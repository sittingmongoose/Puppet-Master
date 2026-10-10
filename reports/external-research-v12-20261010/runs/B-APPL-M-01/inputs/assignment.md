# B-APPL-M-01: SQLite WAL on a local cache

Case ID: ER12-B-APPL-M-01-FRESH

Role: Applicability/exception verification

## Equal arm policy and time boundary
This complete assignment and its listed corpus are identical for both arms. Fresh context; same permitted tools and effort policy. You have 900 seconds total, including saving the output. Spend at most 600 seconds investigating and reserve the final 300 seconds for writing. No delegation or communication with other arms. Read local fixture files and retrieve public primary documentation with web search/open or HTTPS retrieval; at most eight additional primary pages. Do not read other cases, campaign results, assessor files, repository canon, or old answers. Do not execute downloaded code, install software, log into services, or modify this fixture. Any local probe must be tiny, use already installed tools, and run only in the arm's root-assigned output directory. Cite source URLs plus section/version and distinguish source statements from inference. Document retrieval failures and unresolved evidence rather than inventing observations. Root supplies an arm-specific writable output directory; if absent, return the complete output in your response. Do not write in the input directory.

## Scenario and claims
An artifact catalog uses SQLite 3.51.3 with WAL, ordinary shared-memory-capable VFS, multiple processes on one host and local disk. One long-running read transaction is possible. A team also proposes moving the database to a multi-host NFS mount and shipping a read-only snapshot. No workload measurement or custom SQLite build settings are supplied.

1. WAL permits multiple writers to append transactions simultaneously to the same database file.
2. A long-running reader can prevent a checkpoint from completing and keep the WAL growing.
3. Moving this unchanged multi-process design to a shared NFS filesystem is supported merely because SQLite is embedded.
4. SQLite 3.51.3 can open some read-only WAL databases when the documented sidecar or immutable conditions hold.
5. Calling the PASSIVE checkpoint interface guarantees a zero-byte WAL on successful return.
6. These primary documents establish that this catalog’s p95 lookup latency will fall by at least 40% after enabling WAL.

## Required output
Save `verification.md`, at most 900 words. Address all six numbered claims independently with disposition, applicable version/configuration, primary citation, corrected bounded wording where necessary, and consequential exceptions. Preserve uncertainty; state what missing evidence would resolve it. Finish with two concrete acceptance checks. Do not silently substitute a different deployment or turn this verification into an architecture redesign.

## Navigable primary corpus

Read [corpus/index.json](corpus/index.json). Primary passages are in [S1](corpus/S1.md), [S2](corpus/S2.md). Local text is deliberately short; retrieve surrounding sections and history as needed.
