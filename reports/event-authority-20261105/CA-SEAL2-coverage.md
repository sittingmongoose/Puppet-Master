# CA-SEAL2 coverage inventory — round 9

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

**1617 node rows:** 808 predicate/preservation rows and 809 non-predicate data operations. The 327 historical syntax/semantic rows remain separately checked, for **1944 combined rows**. These counts include wrappers and children; they are not counts of independent invariants.

| Node outcome | Rows |
|---|---:|
| non-predicate data operation | 809 |
| preserved August predicate | 557 |
| killed by | 198 |
| implied | 8 |
| same-predicate duplicate | 3 |
| structural | 4 |
| frozen-input only | 38 |

The 557 **preserved August predicate** rows identify inherited, unchanged occurrences by historical node identity, line, function, column, type and expression at CA-SEAL `17c842445a`. The coverage test regenerates and verifies those historical identities. This preservation outcome does not claim a new accepting-input or guard-removal proof for the unchanged August implementation. They were absent from the earlier changed-line inventory and are now explicitly inventoried. No newly inserted node can acquire their identities through byte/line metadata updates.

The 809 **non-predicate data operations** have a reason and concrete parent/consumer AST data-flow records. Lookup, digest, type, length, bytes and collection producers remain distinct from the comparisons/truth tests that consume them. Mutation calls and exception construction have explicit effect/raise consumers. The twelve bitwise nodes are eleven set operations and one optional-type annotation; the full expressions and actual consumers distinguish them from Boolean bitwise combinations. Predicate-returning helpers and methods remain predicates. Classification never suppresses enumeration.

All historical and node outcomes together: killed by: 431, non-predicate data operation: 825, implied: 28, structural: 9, same-predicate duplicate: 6, frozen-input only: 88, preserved August predicate: 557. **Unclassified: 0.**

The committed corpus adds three scratch insertion controls: assigned `isinstance`, assigned Boolean `&`, and the builder `| isinstance(...)`. They update existing identities/byte metadata without supplying a new row, then require missing identities. Synthetic grammar controls exercise every requested node type, including absent-in-source walrus/assert/match/XOR forms, a bare comprehension filter, nested functions and an unknown callable. See the round-9 report for replay results and evidence hashes.
