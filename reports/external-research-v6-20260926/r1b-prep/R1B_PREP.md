# R1b preparation — response to the independent review (offline only, not dispatched)

Scope: step 1 of the review's bounded follow-on. There were no provider calls, no native Goals, no evaluator runs, and no canon or production writes. The R1 code and results stay frozen; all new code is under `tools/r1b/`, and prompts and policy are under `r1b/`.

## Review claims checked against the published files (all reproduced)

- **Economics:**
  - Muse stage-1 uncached input fell 82,702 before the treatment; stage 2 rose 25,342.
  - Muse main and reminder calls: 133 main + 103 reminder, i.e. 77.4% more calls than the main count (43.6% of the combined count).
  - zcode stage-2 duration: −4.3%.
- **Diagnostic normalizer** (`tools/quote_check_v2_diagnostic.py`): it folds underscores, drops ellipsis fragments under 12 characters, and ignores fragment order. It is superseded, not reused.
- **Bundle v1** (`tools/build_evidence_bundle.py`):
  - merged windows are cut at 160 lines, so cited lines can be dropped;
  - long lines are cut at 2,000 characters;
  - `setdefault` re-reads the source file on every call.

## Repairs (tools/r1b)

| File | Change |
|---|---|
| `quote_locator.py` | Exact classes allow only documented carrier decoding (`\"`/`\'` unescape, whitespace folding). A separately named class covers `\n`/`\t` escape decoding. Case, underscores, backticks and typography stay contractual. Ellipsis fragments of any length must appear in order and are never exact. Looser matches are named locator classes. `not_located` is never evidence of absence. For a composite field such as `"a" ... "b" (note)`, the whole field is tried strictly first and the quoted segments are used only as a locator fallback. |
| `build_evidence_bundle_v3.py` | Every cited line is delivered: merged windows are paged, not truncated, with a self-check assertion. Long lines are shown in part with an explicit `OMITTED chars a-b` locator. The nearest preceding heading or title is given as governing context. Citations beyond the end of a source are listed. Each source is read once. |
| `assemble_delivery.py` | Deterministic draft segmentation: every line is assigned exactly once, or the tool raises. Verifier decisions per block (`confirm`/`qualify`/`reject`/`unresolved`/`not_a_claim`), with ranges for bookkeeping blocks. The host assembles `delivered.md` from verbatim draft blocks, the decisions, replacement text and additions. An undecided block is UNVERIFIED, never confirmed. Absence-based rejections without a recorded search are flagged. |
| `run_r1b.py`, `run_goal_r1b.py`, `muse-serve-noshell.sh` | One verifier assignment per frozen package. The Muse host runs with `--disable-shell` (an existing native restriction; probed with no inference). zcode keeps the Read/Write/Edit/Grep/Glob allowlist. A harness fault stops the block. |
| `run_reviewer_v2.py` | Tools pinned to Read/Grep/Glob/Write/Edit with `--strict-mcp-config`, so no subagents, web or MCP. Records the argv and the init-reported effort and tools. The host validates JSON and hashes. |
| `test_r1b.py` | 19 provider-free tests, all OK. They cover the review's three quote probes, the 1-155 + 165-175 paging fixture, long-line omission, the single read per source, governing headings, the real frozen observations, exact segmentation of all four real drafts, and the assembly rules. |

## Residual quote classification (strict locator on the frozen R1 stage-1 packages)

| Package | Quotes | Exact | Locator only | Not located | Not located: ≥50% verbatim 6-word pieces / some pieces / none |
|---|---:|---:|---:|---:|---|
| M-control | 68 | 34 | 4 | 30 | 14 / 7 / 9 |
| M-candidate | 40 | 38 | 0 | 2 | — |
| Z-candidate | 80 | 10 | 38 | 32 | 7 / 23 / 2 |
| Z-control | 75 | 14 | 33 | 28 | 5 / 19 / 4 |

The residuals are mixed, neither harmless formatting nor fabrication:

- **Muse** dropped string delimiters inside code quotes, e.g. `lookup(multiscales, [])` for `lookup("multiscales", [])`.
- **zcode** spliced grep-style `file:line:` prefixes and descriptions into quotes, and wrote composite multi-segment quotes.
- A few quotes have no overlap with the cited source.

## Evaluation clean-up, decided before the next comparison

- **C07 transpose facet split.** Handling or truthfully refusing transpose-codec pipelines is eligible (S109 L553-600 and L2720: transpose followed by sharding errors, and F/C-notation parse gaps). The normative decode-order semantics are unassessable_missing_input; no Zarr v3 codec text is admitted. S085 (a file name only) and S051 (RFC-5 axis permutation) are not codec evidence.
- **Reviewer effort.** Both R1 stream inits report `effort: null`. `--restricted` ignores user settings (which hold `effortLevel: xhigh`), so only `--effort xhigh` applied. Effective effort stays unconfirmed; v2 records what the stream reports.

## Predeclared block 1 (frozen in `r1b/r1b-policy.json`; NOT dispatched)

**Packages.** The outcome-independent rule takes the first stage-1 package per app in R1's preregistered order: Muse `M-control/stage1` (126 blocks) and zcode `Z-candidate/stage1` (103 blocks). Both arms get that same package.

**Arms.** Four fresh `/goal` verifier assignments, serial:

1. R1b-M-P1-control
2. R1b-M-P1-candidate
3. R1b-Z-P1-candidate
4. R1b-Z-P1-control

Each assignment is capped at 1,800 s and 160 responses. Then two blinded xhigh reviews, one per pair, with the host validating JSON.

**Stop rules.**
- A harness fault stops the block.
- After evaluation, loss of materially confirmed upstream content or a consequential false dismissal means stop and repair; block 2 is not bought to finish a table.
- Block 2 (the other two packages) is conditional and not authorized.

**Expected cost.**
- **Candidate lane:** R1 verifier stages ran 8–13 min on Muse and 22–23 min on zcode. The per-block decision protocol may take longer.
- **Evaluation lane:** R1 reviews took about 21 min and about $9.50–$9.88 list-equivalent each.
- **Account state:** the Claude weekly window was at 85% after R1.

**Measured consequence of repair 2.** The v3 bundle for Z-candidate is 483 KB (v1: 308 KB), because its stage-1 cites 6,812 lines, including whole-file ranges, and every cited line is now delivered. Bundle bytes are therefore reported as a cost, not assumed small.
