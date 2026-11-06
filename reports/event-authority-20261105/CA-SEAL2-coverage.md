# CA-SEAL2 coverage inventory — round 10

Validator SHA-256: `3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72`. Historical base: `17c842445a2623bb0334ba8d6932e7a6bf088967`.

The node inventory walks the complete bodies of all 15 touched top-level functions, including nested functions and unchanged August statements. Enumeration depends on AST node types, never on a call-name whitelist or an inferred predicate form. Every call receives a row. Missing, stale, duplicate and changed identities fail before outcome checking. Byte-hash and line-metadata updates cannot supply a missing row.

| Node type | Rows |
|---|---:|
| BinOp(BitAnd) | 9 |
| BinOp(BitOr) | 3 |
| BoolOp | 110 |
| Call | 891 |
| Compare | 219 |
| If test | 171 |
| IfExp | 17 |
| Try dispatch | 6 |
| UnaryOp(Not) | 113 |
| comprehension if | 38 |
| except alternative | 29 |
| except dispatch | 6 |
| parser callback | 5 |
| NamedExpr, Assert, match case/guard, BitXor, While test, TryStar dispatch | 0 |

**1617 node rows:** 873 predicate/preservation rows and 744 non-predicate data operations. The 327 historical syntax/semantic rows remain separately checked, for **1944 combined rows**. These counts include wrappers and children; they are not counts of independent invariants.

| Node outcome | Rows |
|---|---:|
| non-predicate data operation | 744 |
| preserved August predicate | 620 |
| killed by | 200 |
| implied | 8 |
| same-predicate duplicate | 3 |
| structural | 4 |
| frozen-input only | 38 |

The 620 **preserved August predicate** rows are inherited, unchanged occurrences. Since round 10 the coverage test computes that property instead of trusting a row's claim. It aligns the CA-SEAL `17c842445a` validator to the frozen validator function by function, over unchanged source blocks, and maps each current node to its historical occurrence. A preservation row passes only if its claimed baseline id is the mapped counterpart of its own node, and each historical occurrence may be claimed once. This outcome does not claim a new accepting-input or guard-removal proof for the unchanged August implementation.

### Occurrence map (computed by the coverage test)

| Measure | Value |
|---|---:|
| Touched functions aligned to CA-SEAL by name | 4 |
| Touched functions new since CA-SEAL | 11 |
| Aligned unchanged blocks | 8 |
| Aligned unchanged lines | 1306 |
| Eligible nodes (computed counterpart) | 1126 |
| Ineligible: inserted or changed line | 35 |
| Ineligible: changed enclosing header | 1 |
| Ineligible: function new since CA-SEAL | 455 |
| Preserved rows matched to their own counterpart | 620 |

| Aligned function | Blocks | Lines | Nodes | Eligible |
|---|---:|---:|---:|---:|
| `multi_family_receipt_state` | 2 | 28 | 57 | 51 |
| `post_august_validator_pin` | 2 | 46 | 57 | 56 |
| `main` | 2 | 1202 | 1020 | 1009 |
| `build_receipt` | 2 | 30 | 28 | 10 |

A node is eligible only if its own span lies in one unchanged block (`difflib.SequenceMatcher` over the function's lines, decorators and signature included), a historical node of the same type, expression and extent sits at the mapped position, and its enclosing chain up to the top-level function has the same node types and parent fields at unchanged positions, with every enclosing statement header unchanged. The map is one-to-one. The 1,126 eligible nodes are the 620 preserved rows and 506 non-predicate data operations; no killed, implied, duplicate, frozen-only or structural row is eligible. A node on an inserted or changed line, in a changed context or in a new function can never be preserved.

The 744 **non-predicate data operations** have a reason and concrete parent/consumer AST data-flow records. Lookup, digest, type, length, bytes and collection producers remain distinct from the comparisons/truth tests that consume them. Mutation calls and exception construction have explicit effect/raise consumers. The twelve bitwise nodes are eleven set operations and one optional-type annotation; the full expressions and actual consumers distinguish them from Boolean bitwise combinations. Predicate-returning helpers and methods remain predicates. Classification never suppresses enumeration.

All historical and node outcomes together: killed by: 433, non-predicate data operation: 760, implied: 28, structural: 9, same-predicate duplicate: 6, frozen-input only: 88, preserved August predicate: 620. **Unclassified: 0.**

The committed corpus adds three scratch insertion controls: assigned `isinstance`, assigned Boolean `&`, and the builder `| isinstance(...)`. They update existing identities/byte metadata without supplying a new row, then require missing identities. Synthetic grammar controls exercise every requested node type, including absent-in-source walrus/assert/match/XOR forms, a bare comprehension filter, nested functions and an unknown callable.

Round 10 adds five preservation probes. Each edits a scratch copy and forges a table that the round-9 rule accepts, with every count regenerated, and each must fail the occurrence check: the recheck's rebinding witness (an inserted `probe = isinstance(receipt, dict)` labelled with V:220's baseline), the same insertion holding the only claim, a duplicate claim with no source edit, V:218 edited in place while its preserved call keeps line, column and text, and V:1122's guard inverted in place over an unchanged body. A synthetic alignment control checks a moved function, a duplicated line, and inserted, changed-line, changed-context, changed-header, changed-handler and new-function nodes. See the round-10 report for replay results and evidence hashes.
