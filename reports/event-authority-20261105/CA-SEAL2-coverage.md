# CA-SEAL2 combined predicate coverage

Validator SHA-256: `3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72`. Baseline: `fceb67118ec6f5b73017f2fb8ab31056ed27a52e`; CA-SEAL ancestor: `17c842445a2623bb0334ba8d6932e7a6bf088967`.

**370 classified rows: 327 walker sites (286 syntax + 41 semantic), plus 43 AST-regenerated supplement rows; 0 unclassified.** The combined inventory is the completeness claim for every predicate added or touched in the 15 frozen changed top-level functions, including nested functions. This applies Astra 5's neutral ruling. The earlier supported-forms-only claim and unenforced `outside_walker_sites` list are retired.

| Outcome | Walker | Supplement | Combined |
|---|---:|---:|---:|
| **killed by** | 233 | 37 | 270 |
| **structural** | 21 | 0 | 21 |
| **implied** | 20 | 3 | 23 |
| **same-predicate duplicate** | 3 | 1 | 4 |
| **frozen-input only** | 50 | 2 | 52 |
| **Unclassified** | 0 | 0 | 0 |

The supplement covers the assigned completion negation, four exception tuples and their twenty alternatives, three parser callbacks, Boolean compositions/coercion, the combined comprehension filter and the changed multiline third-receipt wrapper. Each row has the same enforced identity, outcome, named tests or explanation, cut and evidence requirements as walker rows. Wrapper sensitivity does not prove its children. The three UnicodeError alternatives are implied by ValueError on the same raised exception; explicit single-cut and paired-cut witnesses establish that subclass containment. The new builder bool() conversion duplicates the existing returned-pass conversion; a zero input proves both single cuts preserve False and the paired cut loses it.

`predicate_supplement()` audits changed spans with a separate AST pass. It checks an explicit syntax/call grammar before admitting rows, including nested functions and predicates whose first line predates a changed line. Missing, stale, duplicate or edited supplement rows fail the real coverage test. Unknown syntax, exception classes, callbacks, calls or comprehension filters fail closed. A separate evidence script independently derives changed spans using Git diff and checks all 43 identities without invoking that function.

The corpus has **190 checks**: every B01 dispatch alternative has a strict returned-result or contextual-diagnostic control; every B02 wrong-type control requires False or the intended ValueError; B03 checks an absent map against 597 actual synthetic absolute sources, all four present snapshot digests against fixture bytes, and a missing denominator's diagnostic null. Eight additional dependency-fault controls exercise the defensive dispatch alternatives. These do not claim that the real frozen sources resolve without the supplied map. Aggregates use ordinary assertions, so an escaping exception fails.

The original 84 survivor records remain historical lineage from Astra 3. Current row outcomes supersede their former structural labels for the newly tested type guards. Structural rows include fixed data returns and other explicitly explained data-flow outcomes, not claimed accepting-negative proofs. Frozen-only and same-field proofs retain their pinned evidence. Exact name boundaries, path components, span bounds, authority tokens and individual receipt clauses remain separately inventoried.

Replay commands, current results, coverage failure demonstrations and content hashes are recorded in `CA-SEAL2.md`, section **Astra round 5: findings and responses**, and the compact `CA-SEAL2-fix8-results.json`. This is regression coverage; final approval, admission and a live seal remain unearned.
