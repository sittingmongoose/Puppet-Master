# B-APPL-M-02: Python file inventory matching

Case ID: ER12-B-APPL-M-02-FRESH

Role: Applicability/exception verification

## Equal arm policy and time boundary
This complete assignment and its listed corpus are identical for both arms. Fresh context; same permitted tools and effort policy. You have 900 seconds total, including saving the output. Spend at most 600 seconds investigating and reserve the final 300 seconds for writing. No delegation or communication with other arms. Read local fixture files and retrieve public primary documentation with web search/open or HTTPS retrieval; at most eight additional primary pages. Do not read other cases, campaign results, assessor files, repository canon, or old answers. Do not execute downloaded code, install software, log into services, or modify this fixture. Any local probe must be tiny, use already installed tools, and run only in the arm's root-assigned output directory. Cite source URLs plus section/version and distinguish source statements from inference. Document retrieval failures and unresolved evidence rather than inventing observations. Root supplies an arm-specific writable output directory; if absent, return the complete output in your response. Do not write in the input directory.

## Scenario and claims
A CPython 3.13 local inventory scans an ordinary POSIX project directory containing `.env`, `src/main.py`, a symlink to another directory and a directory unreadable to the scanning account. Files may change during scanning. It proposes `Path(root).rglob('*')`; there is no supplied benchmark or stabilized filesystem snapshot.

1. The default pathlib glob rules treat a leading dot as ordinary, unlike the glob module’s default dotfile rules.
2. `Path.rglob` returns a sorted list and therefore provides deterministic order without additional work.
3. In 3.13, the default `recurse_symlinks=False` avoids following symlinks while expanding recursive `**` components.
4. An inaccessible subtree is guaranteed to make `Path.rglob` raise PermissionError in this target version.
5. Replacing `glob.glob('~/project/*')` with the same literal pattern guarantees home-directory expansion by the glob module itself.
6. This API contract guarantees a complete point-in-time inventory and sub-100-ms scan for the described directory.

## Required output
Save `verification.md`, at most 900 words. Address all six numbered claims independently with disposition, applicable version/configuration, primary citation, corrected bounded wording where necessary, and consequential exceptions. Preserve uncertainty; state what missing evidence would resolve it. Finish with two concrete acceptance checks. Do not silently substitute a different deployment or turn this verification into an architecture redesign.

## Navigable primary corpus

Read [corpus/index.json](corpus/index.json). Primary passages are in [S1](corpus/S1.md), [S2](corpus/S2.md). Local text is deliberately short; retrieve surrounding sections and history as needed.
