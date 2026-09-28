# Delivery v2 and D1 results

TEST_ONLY_NEVER_PROMOTE. Offline implementation is complete. The two user-approved synthetic native assignments are closed, without retries. **Muse passes the declared D1 structural/protocol checks; zcode retains one failed host criterion. D1 is not a two-app qualification pass or a research-quality result.** I1 remains closed with no pass; no frozen answer or grade was changed.

## Implemented boundary

`tools/delivery_store.py` accepts one complete finding per unique Markdown submission through each app's existing native file tools. A successful payload Write precedes a separate ready-marker Write. The host captures both byte snapshots before emitting a structural receipt that the same live Goal can Read. Conditions, sources, implications, UNEXECUTED proposals and uncertainty remain in the finding; the host assigns IDs, revisions and typed part identities, serializes JSON, tracks mechanical replacements/removals, and renders current/history separately. Unknown fields are rejected with retained raw input. An invalid latest revision is explicit and excludes that finding from current, without erasing other valid findings or restoring its older answer. Failed writes, pending inputs and missing/corrupt snapshots block completeness.

`tools/evaluator_launch.py` composes an immutable task with an actual host-authorized blinded envelope only after checking exact user authority, task hash and finite assignment scope. Offline tests inspect the complete composed message, reject unauthorized dispatch, and retain consumption on callback failure. First-view paths are scoped in the task. This is a composition boundary for a later existing launcher callback, not an executed evaluation or provider-received payload proof. Consumption is instance-local; future execution must retain the gate and account for restart consumption. No approval file was created.

## Frozen native check

The user's “I approve the small native assignment too” authorized only the two short D1 checks. [D1_SPEC.md](D1_SPEC.md) and the common prompt were frozen before dispatch. Freeze SHA-256: `f690210f840ab2369291a51a28efc32937e751312b2b285dd31de53bd5621b70`. Each slot had 300 native seconds, 48 parent responses, a 390-second outer watchdog; the two-slot serial schedule had a 900-second ceiling and no retries. Both used the settled native Goal drivers and their requested flash model/Max settings. The synthetic source contains no real corpus, keys or I1 answer material.

| App/model (requested and observed) | Native result | Parent responses | Native seconds | Host seconds | Frozen host checks |
|---|---|---:|---:|---:|---|
| Muse Code / Muse 1.3 Contributor Max | goal_complete | 18 | 258.2 | 259.314 | 15/15 true |
| zcode / GLM 5.3 Flash Max | goal_complete | 17 | 219.6 | 223.656 | 14/15 true; current_history_separation false |

Both produced exactly four attempted records: valid initial Alpha, valid independent non-finding, invalid Alpha revision with `snapshots_note`, and valid corrected Alpha. Both retained eight byte-identical payload/marker snapshots and read all four receipts plus invalid/final aggregate status within their original Goal. No overwrites, external-file tools, shell or web calls were observed. Separate bounded Sol development audits establish tool sequence and byte identity; they are not formal semantic grades. See [Muse audit](evidence/d1-muse-native-audit.md) and [zcode audit](evidence/d1-zcode-native-audit.md).

Zcode's frozen whole-report marker check fails because [current.md](runs/zcode/store/current.md) contains `ALPHA_V1` in F0002_NON_FINDING's source-scope citation: “revisions 1–2, markers ALPHA_V1/ALPHA_V2”. Its current Alpha assertion uses `ALPHA_V2`; the initial Alpha assertion and `ALPHA_PENDING` are absent. The independent record remained unchanged. This distinguishes the lexical failure from host fallback, but **does not change the failed criterion or `structural_checks_passed: false`**. Neither the output nor the check was edited after freeze. Exact terminal results retain their original pending-audit field; the separately dated audit artifacts supply the post-run evidence.

## Tests and evidence limits

- 52 new offline tests pass: 24 delivery-boundary, 12 evaluator-composition and 16 launcher-accounting tests. They cover valid/malformed/unknown/duplicate/missing fields, quotes/code, invalid/latest revisions, host part bookkeeping, failed writes, snapshot loss/corruption, current/history and complete authorized/unauthorized evaluator messages.
- All 30 reused offline-repair-v1 tests pass. Untouched historical runner regressions were not rerun. Sol helpers independently checked changed boundaries; they made no grading calls.
- The 52 tests also pass from the published files after temporary layout staging, documented in [README.md](README.md). Initial direct-layout import/path failures are retained as packaging-check logs. No frozen code changed to obtain that result.
- All 21 VM I1-amendment freeze entries, 50 published I1 entries, 17 D1 input pins and 14 reused dependency/runtime pins remain consistent. See [preservation check](evidence/preservation-check.json). Original Muse/zcode I1 failure hashes remain pinned in [fixture provenance](evidence/fixture-provenance.json); only labeled synthetic/minimized development cases were created.

The Git whitespace check flags the frozen missing-field fixture's EOF blank line and blank blockquote lines in the exact zcode current report. These bytes are retained to preserve the frozen fixture and original output.

The interface captures submitted bytes, not arbitrary unsaved drafts or illicit overwrites before polling. Native traces corroborate compliant writes; they are not OS access traces or fsync durability proof. The transient invalid-time current Markdown was not separately snapshotted: invalid/no-fallback evidence is the delivered status plus pinned projection code and offline regression. Prompt-scoped first-view sequencing is not strict isolation. Structural acceptance never validates source truth, logical completeness or semantic preservation. The old absence matcher is not qualified or invoked; V-FOLLOWON-1 remains OPEN.

## Usage and next decision

Both assignments remain in the denominator: 35 parent responses and 477.8 native seconds total. Muse exposes ten reminder-child attempts on the same contributor model, but child tokens are unknown. Zcode exposes usage deltas for 16 of 17 requests; the missing delta is unknown. Cumulative cached input is not unique context, dollar spend or subscription debit. Development usage remains separate and unmetered here; formal evaluator calls are zero. [Usage](evidence/d1-usage.md) retains the reported counters and their limits. No efficiency or affordability win is claimed from this synthetic check.

Stop here for a separate decision. Before any full research campaign, review whether a global ban on an old marker inside source-scope citations is intended. A prospective criterion could distinguish an actually stale current assertion from a historical source citation, with offline tests for both; it must be declared at a new freeze, never applied to rescore D1. No further synthetic slot, investigator comparison or formal evaluation is authorized by this report. A later research comparison still needs matched access/feedback policy, acquisition versus preservation measures, finite evaluation capacity and independent Opus 5.5 requested xhigh reviewers. R1b Block 2 stays unauthorized; no verifier repair, canon, governance or WorkNode work is included.

The compact code/tests/prompts, exact synthetic current/history projections and structural receipts are prepared for the same research branch under the user's standing GitHub-review publication request. Raw snapshots, provider logs, corpus and keys stay on the VM; path/hash pointers do not give a GitHub-only reviewer access to raw contents.
