# CA-SEAL2 coverage inventory — round 12

Validator SHA-256: `3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72`. Historical base: `17c842445a2623bb0334ba8d6932e7a6bf088967`. Class table built for Python 3.14.4 (133 classes).

**The table is total (round 12).** Every one of the frozen validator's 10941 nodes with a source position has exactly one kind of row: a census row anchored at it (1585), a changed-line row (1436), or a node row (7920). Every node without a position is of a class recorded inside a positioned row (`POSITIONLESS`). The table also pins the SHA-256 of every one of the frozen validator's 2361 parser lines (2,360 lines and the empty remainder after the final newline), and every line inserted, changed, deleted or replaced relative to it needs a reviewed record (currently 0). So an edit of the validator with this table unchanged always fails coverage, and an edit with only line numbers, the byte hash and the counts updated fails too.

The census walks the complete bodies of all 15 touched top-level functions, including nested functions and unchanged August statements, and the inserted or changed lines of the module body. Every node is dispatched on its exact AST class, and every BinOp, AugAssign and UnaryOp is a census row of its own operator class, arithmetic and set operators included (CA2-C12-N03): a statement shape or an operator cannot hide a truth value. Every call receives a row. Missing, stale, duplicate and changed identities fail before outcome checking. Byte-hash and line-metadata updates cannot supply a missing row.

| Census node type | Rows |
|---|---:|
| Call | 891 |
| IfExp | 17 |
| BoolOp | 110 |
| If test | 171 |
| UnaryOp(Not) | 113 |
| Compare | 219 |
| parser callback | 5 |
| Try dispatch | 6 |
| comprehension if | 38 |
| except dispatch | 6 |
| except alternative | 29 |
| BinOp(BitAnd) | 9 |
| BinOp(BitOr) | 3 |
| BinOp(Div) | 80 |
| BinOp(Add) | 27 |
| BinOp(Sub) | 31 |
| AugAssign(Add) | 1 |
| AugAssign(BitAnd), AugAssign(BitOr), AugAssign(BitXor), NamedExpr, Assert, match case/guard, BinOp(BitXor), While test, TryStar dispatch, UnaryOp(Invert/UAdd/USub), other arithmetic | 0 |

**1756 census rows:** 873 predicate/preservation rows and 883 non-predicate data operations. The 327 historical syntax/semantic rows remain separately checked, for **2083 combined rows**. These counts include wrappers and children; they are not counts of independent invariants. Round 12 adds 139 census rows, all non-predicate data operations: 80 `BinOp(Div)` path joins (2 of them on module line V:810), 27 `BinOp(Add)` string, bytes and pattern concatenations, 31 `BinOp(Sub)` (27 set differences, 3 duplicate counts, 1 line index) and 1 `AugAssign(Add)` list extension. Each has a reason and its consumer chain; the 1,944 earlier rows are unchanged.

| Census outcome | Rows |
|---|---:|
| non-predicate data operation | 883 |
| preserved August predicate | 620 |
| killed by | 200 |
| implied | 8 |
| same-predicate duplicate | 3 |
| structural | 4 |
| frozen-input only | 38 |

## Complete AST class table

`AST_CLASSES` in `CA-SEAL2-checks.py` lists every node and operator class of Python 3.14.4's `ast` module, with one category each. The coverage test regenerates the class list from the running `ast` (its namespace, `_ast` and the subclass closure of `ast.AST`) and fails on any class missing from the table, on a stale entry when the running minor version is the recorded one, on a truth-carrying class without a census mechanism, on a census rule for a class the table does not mark truth-carrying, and on any class marked refused that occurs anywhere in the validator. A class unknown to the table counts as truth-carrying for the census and as refused when present. Table SHA-256 (canonical JSON): `0f535cde772782f223114eaa4bca3e5eb2835be62cedc74cfd6993ab7bb2455f`.

| Category | Classes |
|---|---:|
| truth-carrying | 53 |
| data | 27 |
| structural | 29 |
| refused when present | 24 |
| **total** | **133** |

| Category | Reason | Classes |
|---|---|---|
| structural | Abstract grammar category: the parser never produces a node of this exact class. | `AST`, `mod`, `stmt`, `expr`, `expr_context`, `boolop`, `operator`, `unaryop`, `cmpop`, `excepthandler`, `pattern`, `type_ignore`, `type_param`, `slice` |
| refused when present | Deprecated compatibility class: the parser never produces it. | `AugLoad`, `AugStore`, `ExtSlice`, `Index`, `Param`, `Suite` |
| structural | Root of an exec-mode parse; its statements are walked. | `Module` |
| refused when present | Root of another parse mode; a validator source file never parses to it. | `Interactive`, `Expression`, `FunctionType` |
| truth-carrying | Census row of its own: a comparison yields a bool; the row covers every operator of the node. | `Compare` |
| truth-carrying | Census row of its own: Boolean and/or; the walker also lists each clause. | `BoolOp` |
| truth-carrying | Census row of its own: every call, whatever its name, since its result may be a truth value. | `Call` |
| truth-carrying | Census row of its own: a conditional expression selects on a truth value. | `IfExp` |
| truth-carrying | Census row of its own: an assignment expression can capture a predicate. | `NamedExpr` |
| truth-carrying | Census row of its own (Assert). | `Assert` |
| truth-carrying | Its test is a census row (If test). | `If` |
| truth-carrying | Its test is a census row (While test). | `While` |
| truth-carrying | Census row of its own: exception dispatch over the handler list (Try dispatch, TryStar dispatch). | `Try`, `TryStar` |
| truth-carrying | Census row of its own (except dispatch), plus one per alternative (except alternative). | `ExceptHandler` |
| truth-carrying | Each filter is a census row (comprehension if). | `comprehension` |
| truth-carrying | Its pattern (match case) and guard (match guard) are census rows. | `match_case` |
| truth-carrying | Decides whether a case matches; covered by the enclosing match case row, whose expression is the whole pattern. | `MatchValue`, `MatchSingleton`, `MatchSequence`, `MatchMapping`, `MatchClass`, `MatchStar`, `MatchAs`, `MatchOr` |
| truth-carrying | Boolean operator; carried by the census row of its BoolOp. | `And`, `Or` |
| truth-carrying | Negation yields a bool; census row UnaryOp(Not) wherever it occurs. | `Not` |
| truth-carrying | On Booleans a bitwise operator returns a bool, so it combines truth values; census row BinOp(<op>) or AugAssign(<op>) wherever it occurs. | `BitAnd`, `BitOr`, `BitXor` |
| truth-carrying | Comparison operator; carried by the census row of its Compare. | `Eq`, `NotEq`, `Lt`, `LtE`, `Gt`, `GtE`, `Is`, `IsNot`, `In`, `NotIn` |
| truth-carrying | Arithmetic operator. On Booleans it returns an int, but what reaches the receipt is truthiness, not type: the receipt's pass is bool(overall_pass), and a nonzero int is truthy, so True + False carries a truth value; on sets, - is membership truth exactly like & and \|. No exclusion since round 12 (CA2-C12-N03): census row BinOp(<op>) or AugAssign(<op>) wherever it occurs. | `Add`, `Sub`, `Mult`, `MatMult`, `Div`, `Mod`, `Pow`, `LShift`, `RShift`, `FloorDiv` |
| truth-carrying | Unary arithmetic. On a Boolean it returns an int, and ~True == -2 and -True == -1 are truthy, so it carries a truth value through any truthiness sink; census row UnaryOp(<op>) wherever it occurs. | `Invert`, `UAdd`, `USub` |
| data | Expression context of a name, attribute, subscript, starred item or display target. | `Load`, `Store`, `Del` |
| truth-carrying | Operator census: every operator class is truth-carrying, so every binary operation, unary operation and in-place update is a census row <class>(<operator>) wherever it occurs. | `BinOp`, `UnaryOp`, `AugAssign` |
| data | Value reference or literal; truth carriers inside it are inventoried in their own right. | `Attribute`, `Subscript`, `Starred`, `Name`, `Constant`, `Slice` |
| data | Display or string building; truth carriers inside it are inventoried in their own right. | `Dict`, `Set`, `List`, `Tuple`, `JoinedStr`, `FormattedValue` |
| data | Builds a collection or generator; each filter is a census row through its comprehension. | `ListComp`, `SetComp`, `DictComp`, `GeneratorExp` |
| data | Binds or removes values; truth carriers in the value are inventoried in their own right. | `Assign`, `AnnAssign`, `Delete`, `Expr` |
| data | Binds module objects or import aliases to names. | `Import`, `ImportFrom`, `alias` |
| data | Keyword argument. The JSON parser callbacks object_pairs_hook, parse_constant and parse_float also have a census row (parser callback). | `keyword` |
| structural | Defines code; its header is a statement header and its body is walked. | `FunctionDef`, `ClassDef`, `Lambda`, `arguments`, `arg` |
| structural | Control flow without a test of its own; the values it uses are inventoried in their own right. | `Return`, `Raise`, `Pass`, `Break`, `Continue`, `For`, `With`, `withitem`, `Match` |
| refused when present | Coroutine or generator semantics; the census does not model them. | `AsyncFunctionDef`, `AsyncFor`, `AsyncWith`, `Await`, `Yield`, `YieldFrom` |
| refused when present | Rebinds a name outside the function's own scope; the census does not model it. | `Global`, `Nonlocal` |
| refused when present | PEP 695 type parameters and aliases are evaluated lazily; the census does not model them. | `TypeAlias`, `TypeVar`, `ParamSpec`, `TypeVarTuple` |
| refused when present | Produced only with type_comments=True, which this checker never uses. | `TypeIgnore` |
| refused when present | Template strings (3.14) build a Template object; the census does not model them. | `TemplateStr`, `Interpolation` |

There is no excluded class since round 12. Arithmetic (`Add`, `Sub`, `Mult`, `MatMult`, `Div`, `Mod`, `Pow`, `LShift`, `RShift`, `FloorDiv`, `Invert`, `UAdd`, `USub`) is truth-carrying: on Booleans it returns an int, but what reaches the receipt is truthiness, not type (`bool(overall_pass)`), and on sets `-` is membership truth like `&` and `|`. Round 11's written reason ("it does not produce a truth value") was wrong and is corrected (CA2-C12-N03).

## Operator census

Every operator occurrence in the 15 touched functions, by the node that holds it, and in the whole validator. A truth-carrying operator (now every operator) must sit in a node that anchors a census row; the coverage test requires zero unanchored occurrences. Operators outside the touched functions are in node rows.

| Operator | Category | Touched functions | Carried by a census row | Unanchored | Whole validator |
|---|---|---|---:|---:|---|
| `Add` | truth-carrying | AugAssign 1, BinOp 27 | 28 | 0 | AugAssign 1, BinOp 70 |
| `And` | truth-carrying | BoolOp 43 | 43 | 0 | BoolOp 61 |
| `BitAnd` | truth-carrying | BinOp 9 | 9 | 0 | BinOp 11 |
| `BitOr` | truth-carrying | BinOp 3 | 3 | 0 | AugAssign 2, BinOp 15 |
| `BitXor` | truth-carrying | 0 | 0 | 0 | 0 |
| `Div` | truth-carrying | BinOp 78 | 78 | 0 | BinOp 102 |
| `Eq` | truth-carrying | Compare 58 | 58 | 0 | Compare 69 |
| `FloorDiv` | truth-carrying | 0 | 0 | 0 | 0 |
| `Gt` | truth-carrying | Compare 1 | 1 | 0 | Compare 2 |
| `GtE` | truth-carrying | 0 | 0 | 0 | Compare 1 |
| `In` | truth-carrying | Compare 23 | 23 | 0 | Compare 43 |
| `Invert` | truth-carrying | 0 | 0 | 0 | 0 |
| `Is` | truth-carrying | Compare 23 | 23 | 0 | Compare 28 |
| `IsNot` | truth-carrying | Compare 36 | 36 | 0 | Compare 51 |
| `LShift` | truth-carrying | 0 | 0 | 0 | 0 |
| `Lt` | truth-carrying | Compare 2 | 2 | 0 | Compare 4 |
| `LtE` | truth-carrying | Compare 6 | 6 | 0 | Compare 7 |
| `MatMult` | truth-carrying | 0 | 0 | 0 | 0 |
| `Mod` | truth-carrying | 0 | 0 | 0 | 0 |
| `Mult` | truth-carrying | 0 | 0 | 0 | BinOp 1 |
| `Not` | truth-carrying | UnaryOp 113 | 113 | 0 | UnaryOp 153 |
| `NotEq` | truth-carrying | Compare 58 | 58 | 0 | Compare 121 |
| `NotIn` | truth-carrying | Compare 14 | 14 | 0 | Compare 23 |
| `Or` | truth-carrying | BoolOp 67 | 67 | 0 | BoolOp 101 |
| `Pow` | truth-carrying | 0 | 0 | 0 | 0 |
| `RShift` | truth-carrying | 0 | 0 | 0 | 0 |
| `Sub` | truth-carrying | BinOp 31 | 31 | 0 | BinOp 40 |
| `UAdd` | truth-carrying | 0 | 0 | 0 | 0 |
| `USub` | truth-carrying | 0 | 0 | 0 | UnaryOp 1 |

The validator's two bitwise AugAssigns, `emit |= set(...)` at V:600–601, are in an untouched function, AST-identical to CA-SEAL, so they are outside the touched-function census; like every other untouched node they now have node rows ("unchanged August truth carrier").

The 620 **preserved August predicate** rows are inherited, unchanged occurrences. The coverage test computes that property instead of trusting a row's claim: it aligns CA-SEAL `17c842445a` to the frozen validator function by function, over unchanged source blocks, and maps each current node to its historical occurrence. A preservation row passes only if its claimed baseline id is the mapped counterpart of its own node, and each historical occurrence may be claimed once. This outcome does not claim a new accepting-input or guard-removal proof for the unchanged August implementation.

### Occurrence map (computed by the coverage test)

| Measure | Value |
|---|---:|
| Touched functions aligned to CA-SEAL by name | 4 |
| Touched functions new since CA-SEAL | 11 |
| Aligned unchanged blocks | 8 |
| Aligned unchanged lines | 1306 |
| Eligible nodes (computed counterpart) | 1223 |
| Ineligible: changed enclosing header | 1 |
| Ineligible: function new since CA-SEAL | 495 |
| Ineligible: inserted or changed line | 35 |
| Preserved rows matched to their own counterpart | 620 |
| CA-SEAL functions removed | 0 |

| Unit | Aligned blocks | Aligned lines | Census nodes | Eligible | Inserted lines | Changed lines | Deleted CA-SEAL lines | Replaced CA-SEAL lines |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `multi_family_receipt_state` | 2 | 28 | 61 | 55 | 0 | 1 | 0 | 1 |
| `post_august_validator_pin` | 2 | 46 | 62 | 61 | 0 | 1 | 0 | 1 |
| `recount_json` | 0 | 0 | 21 | 0 | 24 | 0 | 0 | 0 |
| `recount_object` | 0 | 0 | 2 | 0 | 2 | 0 | 0 | 0 |
| `recount_anchor` | 0 | 0 | 27 | 0 | 10 | 0 | 0 | 0 |
| `third_change_validator_pin` | 0 | 0 | 22 | 0 | 14 | 0 | 0 | 0 |
| `recount_change_state` | 0 | 0 | 38 | 0 | 32 | 0 | 0 | 0 |
| `recount_relative` | 0 | 0 | 18 | 0 | 6 | 0 | 0 | 0 |
| `recount_source_bytes` | 0 | 0 | 28 | 0 | 15 | 0 | 0 | 0 |
| `recount_frozen_inputs` | 0 | 0 | 139 | 0 | 59 | 0 | 0 | 0 |
| `recount_outcomes` | 0 | 0 | 167 | 0 | 66 | 0 | 0 | 0 |
| `recount_validation` | 0 | 0 | 23 | 0 | 16 | 0 | 0 | 0 |
| `recount_snapshot_pins` | 0 | 0 | 10 | 0 | 15 | 0 | 0 | 0 |
| `main` | 2 | 1202 | 1108 | 1097 | 18 | 0 | 0 | 0 |
| `build_receipt` | 2 | 30 | 28 | 10 | 10 | 0 | 0 | 0 |
| `<module>` | – | – | – | – | 43 | 0 | 0 | 0 |

Line counts follow the parser (N04): universal newlines, then LF only. A form feed, vertical tab, U+0085 or U+2028 inside a string does not end a line, as it would for `str.splitlines()`; a sentinel statement checks the count against the parser on every alignment. `difflib` keeps the longer side of a move aligned (N03): the moved lines on the longer side keep their counterparts, and the shorter side shows up as deleted CA-SEAL lines plus inserted current lines, which need their own records.

## Changed lines carry rows (N02, option A; round 12, new functions too)

The units are the four aligned functions, the 11 functions new since CA-SEAL (every line of which is an inserted line, CA2-C12-B02) and the module body outside all top-level functions (`<module>`). Every node with a source position on an inserted or changed line of a unit (a statement by its header span) either anchors a census row or has a **changed-line row**: data or structural as its class is, with a reason. A truth-carrying node there that no census row carries (possible only in `<module>`, whose census has operator rows only) is refused. Every CA-SEAL line of an aligned unit without a current counterpart (deleted, replaced, or in a CA-SEAL function that no longer exists) is a **historical-line record** with a reviewed reason. Missing, stale or changed rows and records fail coverage.

**Bindings (round 12, CA2-C12-B01 and N02).** Before reading any row, the coverage test refuses: a module-level name bound more than once (every name, CA-SEAL names included, so the checker, the corpus and a script run read the same definition); a module name that shadows a builtin; a module statement that does not only declare (anything but a leading docstring, imports without `*`, assignments to plain names, function definitions and CA-SEAL's main guard as the last statement); an attribute or item write or deletion, in any function, lambda, class body or comprehension, whose chain starts at a module name, a builtin, an imported module, a call result or a local alias of one; an attribute of a module-level list, dict or set (or of an alias or element of one) other than a read-only method; the namespace builtins (`globals`, `vars`, `locals`, `setattr`, `delattr`, `exec`, `eval`, `compile`, `__import__`, `breakpoint`) and every dunder except `__name__`, `__file__` and `__new__`, which CA-SEAL uses. As in round 11, every name a change binds or mutates at module scope must also be new to CA-SEAL. The frozen validator (102 module names) and CA-SEAL (74) pass every rule.

| Changed-line rows | Rows |
|---|---:|
| `<module>` | 50 |
| `build_receipt` | 49 |
| `main` | 81 |
| `multi_family_receipt_state` | 5 |
| `post_august_validator_pin` | 3 |
| `recount_anchor` | 67 |
| `recount_change_state` | 126 |
| `recount_frozen_inputs` | 338 |
| `recount_json` | 70 |
| `recount_object` | 7 |
| `recount_outcomes` | 371 |
| `recount_relative` | 40 |
| `recount_snapshot_pins` | 48 |
| `recount_source_bytes` | 76 |
| `recount_validation` | 66 |
| `third_change_validator_pin` | 39 |
| **total** | **1436** (data 1307, structural 129) |

By class: Assign 86, Attribute 120, Constant 312, Dict 18, Expr 9, For 4, FunctionDef 15, GeneratorExp 9, If 42, Import 3, List 5, ListComp 3, Name 661, Pass 1, Raise 34, Return 18, Set 8, SetComp 2, Slice 1, Subscript 44, Tuple 19, alias 3, arg 15, keyword 4.

| Historical-line record | Mark | Reason |
|---|---|---|
| `multi_family_receipt_state` CA-SEAL line 222: `or receipt.get("validator_after_sha256") != sha256_file(Path(__file__))` | replaced | CA-SEAL compared the receipt's validator_after_sha256 with the live file hash, sha256_file(Path(__file__)). Replaced in place by V:225, which compares it with third_change_validator_pin(); every node of V:225 has a census or changed-line row. |
| `post_august_validator_pin` CA-SEAL line 263: `live_hash = sha256_file(Path(__file__))` | replaced | CA-SEAL hashed the live file into live_hash. Replaced in place by V:266, live_hash = third_change_validator_pin(); its call is a census row and its other nodes have changed-line rows. |

The frozen validator deletes no CA-SEAL line (0 deleted, 2 replaced, 0 in removed functions). Its module-level changes are additions only: three imports and fourteen constants, none of them a name CA-SEAL binds or reads, read only by functions new since CA-SEAL.

The 883 **non-predicate data operations** have a reason and concrete parent/consumer AST data-flow records. Lookup, digest, type, length, bytes and collection producers remain distinct from the comparisons/truth tests that consume them. Mutation calls and exception construction have explicit effect/raise consumers. The twelve bitwise nodes are eleven set operations and one optional-type annotation; the full expressions and actual consumers distinguish them from Boolean bitwise combinations. Predicate-returning helpers and methods remain predicates. Classification never suppresses enumeration.

All historical and census outcomes together: killed by: 433, non-predicate data operation: 899, implied: 28, structural: 9, same-predicate duplicate: 6, frozen-input only: 88, preserved August predicate: 620. **Unclassified: 0.**

## Node rows (round 12)

A node row is a node unchanged since CA-SEAL: in one of the 24 functions AST-identical to CA-SEAL, or on an unchanged line of a unit. It records its computed CA-SEAL line (`baseline_line`) and a reason naming its role, its statement and its counterpart. Its required outcome is its class's category: **data**, **structural** (including a truth carrier whose truth a census row carries, such as an `If` whose test is a census row), or **unchanged August truth carrier** (a truth carrier in code no census covers: any edit of its function makes it touched and its census then needs a row for this node; on the module, an edited line's operators need census rows and any other truth carrier is refused).

| Node-row outcome | Rows |
|---|---:|
| data | 6685 |
| structural | 370 |
| unchanged August truth carrier | 865 |
| **total** | **7920** |

By class: AnnAssign 10, Assign 492, Attribute 599, AugAssign 2, BinOp 89, BoolOp 52, Call 443, ClassDef 1, Compare 128, Constant 1628, Continue 14, Dict 133, DictComp 12, ExceptHandler 9, Expr 165, For 36, FormattedValue 4, FunctionDef 39, GeneratorExp 29, If 204, IfExp 14, Import 4, ImportFrom 4, JoinedStr 4, Lambda 1, List 60, ListComp 28, Name 3083, Pass 1, Raise 22, Return 62, Set 27, SetComp 16, Slice 30, Starred 2, Subscript 252, Try 9, Tuple 73, UnaryOp 41, With 1, alias 9, arg 64, keyword 24.

| Node without a position | Count | Recorded in |
|---|---:|---|
| `Add` | 71 | shared operator instance; named by the class and text of its holder |
| `And` | 61 | shared boolop instance; named by the class and text of its holder |
| `BitAnd` | 11 | shared operator instance; named by the class and text of its holder |
| `BitOr` | 17 | shared operator instance; named by the class and text of its holder |
| `Div` | 102 | shared operator instance; named by the class and text of its holder |
| `Eq` | 69 | shared cmpop instance; named by the class and text of its holder |
| `Gt` | 2 | shared cmpop instance; named by the class and text of its holder |
| `GtE` | 1 | shared cmpop instance; named by the class and text of its holder |
| `In` | 43 | shared cmpop instance; named by the class and text of its holder |
| `Is` | 28 | shared cmpop instance; named by the class and text of its holder |
| `IsNot` | 51 | shared cmpop instance; named by the class and text of its holder |
| `Load` | 4171 | shared expr_context instance; named by the class and text of its holder |
| `Lt` | 4 | shared cmpop instance; named by the class and text of its holder |
| `LtE` | 7 | shared cmpop instance; named by the class and text of its holder |
| `Module` | 1 | the parse root; every statement has its own row and every line its pin |
| `Mult` | 1 | shared operator instance; named by the class and text of its holder |
| `Not` | 153 | shared unaryop instance; named by the class and text of its holder |
| `NotEq` | 121 | shared cmpop instance; named by the class and text of its holder |
| `NotIn` | 23 | shared cmpop instance; named by the class and text of its holder |
| `Or` | 101 | shared boolop instance; named by the class and text of its holder |
| `Store` | 814 | shared expr_context instance; named by the class and text of its holder |
| `Sub` | 40 | shared operator instance; named by the class and text of its holder |
| `USub` | 1 | shared unaryop instance; named by the class and text of its holder |
| `arguments` | 55 | in the header text of its FunctionDef or Lambda row; each parameter has its own arg row |
| `comprehension` | 99 | in the text of its ListComp, SetComp, DictComp or GeneratorExp row; each filter is a census row |
| `withitem` | 1 | in the header text of its With row |

## Line pins and frozen-line records (round 12, CA2-C12-N01)

`line_pins` holds the SHA-256 of each of the 2361 parser lines of the frozen validator (commit `60913cb906590662c97696146edcb10960c2ed09`, SHA-256 `3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72`); the coverage test reads the frozen bytes from that commit and requires the pins to equal them. It aligns the current validator's lines to them, and every current line inserted or changed and every frozen line deleted or replaced needs a `frozen_lines` record with a reason. Deletions are therefore judged against both baselines: CA-SEAL (historical-line records) and the frozen validator (frozen-line records). The frozen validator itself has 0 records.

## Controls

The committed corpus keeps the three round-9 insertion controls (assigned `isinstance`, assigned Boolean `&`, the builder `| isinstance(...)`), the five round-10 preservation probes and the synthetic grammar and alignment controls. Round 11 added `positive_ast_class_table` and nineteen negatives; round 12 adds `positive_imported_bindings_match_ast`, `positive_module_scope_rules_on_V_and_CA_SEAL`, `positive_total_table_controls`, `negative_random_single_line_edits` and fifteen edit probes. Each edit probe edits a scratch copy of V, rebases line metadata, forges every row except its own identities in the group under test and regenerates every count, so only that rule can refuse (a binding probe forges every row):

- `negative_census_augassign_bitor`: recount_validation: state['complete'] |= True before the return; refused by `coverage sites missing=`.
- `negative_census_augassign_bitand`: recount_validation: state['complete'] &= True before the return; refused by `coverage sites missing=`.
- `negative_census_augassign_bitxor`: recount_validation: state['complete'] ^= True before the return; refused by `coverage sites missing=`.
- `negative_census_hidden_builder_bitor`: build_receipt: overall_pass |= {"review_extra": False, **named}["review_extra"] after the round-9 gate; refused by `coverage sites missing=`.
- `negative_census_hidden_builder_bitand`: build_receipt: the same with &=; refused by `coverage sites missing=`.
- `negative_census_hidden_builder_bitxor`: build_receipt: the same with ^=; refused by `coverage sites missing=`.
- `negative_census_arithmetic_augassign_add`: build_receipt: overall_pass += {"review_extra": 0, **named}["review_extra"] after the round-9 gate (N03); refused by `coverage sites missing=`.
- `negative_census_arithmetic_unary_usub`: build_receipt: overall_pass = -overall_pass after the round-9 gate (N03); refused by `coverage sites missing=`.
- `negative_changed_truncated_input`: post_august_validator_pin: anchors = anchors[:1] before the preserved guard; refused by `changed-line nodes missing=`.
- `negative_changed_rebound_input`: main: actual_ets = expected_ets before the preserved partition comparison; refused by `changed-line nodes missing=`.
- `negative_changed_inserted_continue`: main: continue at the top of the partition loop; refused by `changed-line nodes missing=`.
- `negative_changed_module_rebinding`: module: POST_AUGUST_RECEIPT = MULTI_FAMILY_RECEIPT after MULTI_FAMILY_AUTHOR (round 12: refused as a second binding before any row is read); refused by `module-level binding refused`.
- `negative_changed_module_new_constant`: module: PM_RECEIPT = MULTI_FAMILY_RECEIPT after MULTI_FAMILY_AUTHOR; refused by `changed-line nodes missing=`.
- `negative_changed_module_truth_carrier`: module: PM_PROBE = isinstance(HOME, Path) after MULTI_FAMILY_AUTHOR; refused by `truth-carrying node on a changed line without a census row`.
- `negative_changed_new_function_dict_spread`: recount_outcomes: cards = {"cards": cards, **doc}["cards"] before if cards: (CA2-C12-B02); refused by `changed-line nodes missing=`.
- `negative_deleted_preserved_guard`: main: the preserved if actual_ets != expected_ets block deleted in place; refused by `historical lines missing=`.
- `negative_frozen_round9_gate_deleted`: build_receipt: the round-9 gate deleted (CA2-C12-N01); refused by `frozen lines missing=`.
- `negative_frozen_comment_inserted`: sha256_file (untouched): a comment line inserted; no node changes; refused by `frozen lines missing=`.
- `negative_nodes_untouched_function_respaced`: sha256_file (untouched): one space added inside the lambda line; the AST stays identical, so no census or changed-line row exists; refused by `node rows missing=`.
- `negative_refused_class_present`: recount_validation: global PM_PROBE as its first statement; refused by `ast class table`.
- `negative_fresh_module_rebinding`: module: POST_AUGUST_RECEIPT = MULTI_FAMILY_RECEIPT, with every row forged; refused by `module-level binding refused`.
- `negative_fresh_module_mutation`: module: HOLDING_DECISIONS["DL-039"] = None, with every row forged; refused by `module-level binding refused`.
- `negative_fresh_function_shadows_builtin`: module: def isinstance(*args): return True, with every row forged; refused by `module-level binding refused`.
- `negative_binding_duplicate_def_build_receipt`: build_receipt: a weak def (gate replaced by overall_pass = True) in place, the honest def moved after the main guard (CA2-C12-B01); refused by `module-level binding refused`.
- `negative_binding_duplicate_def_admission_record_problems`: admission_record_problems: a weak def returning [] padded to the same lines, the honest def after the main guard; refused by `module-level binding refused`.
- `negative_binding_evidence_fields_truncation`: third_change_validator_pin: EVIDENCE_FIELDS[{"pm_fields": 12, **receipt}["pm_fields"]:] = [], with every row forged; refused by `module-level binding refused`.
- `negative_binding_module_alias_write`: module: PM_ALIAS = HOLDING_DECISIONS, then PM_ALIAS["DL-039"] = None; refused by `module-level binding refused`.
- `negative_binding_module_class_body`: module: class PmC: HOLDING_DECISIONS["DL-039"] = None; refused by `module-level binding refused`.
- `negative_binding_star_import`: module: from os.path import *; refused by `module-level binding refused`.
- `negative_binding_globals_write_new_function`: recount_outcomes: globals()["HOLDING_AUTHOR"] = "/root/other"; refused by `module-level binding refused`.
- `negative_binding_alias_method_new_function`: recount_outcomes: fields = EVIDENCE_FIELDS, then fields.clear(); refused by `module-level binding refused`.
- `negative_ast_class_removed`: a synthetic edit of the class table, with V and this table unchanged.
- `negative_ast_truth_class_without_rule`: a synthetic edit of the class table, with V and this table unchanged.
- `negative_ast_rule_for_data_class`: a synthetic edit of the class table, with V and this table unchanged.

`negative_random_single_line_edits` draws 200 seeded single-line edits of V (insert, delete, change and swap in turn, each still parsing) and requires every one to fail coverage with this table byte-identical. The grammar control has `&=`, `|=`, `^=`, `+=` and `-` (all census rows), `while` and `except*`. The alignment control has the line marks, changed-line rows and historical-line records of its synthetic edit (a new function included), a form feed inside a string, a lone carriage return, a deleted and a changed decorator, and module-level insertions and deletions. The total-table control has the node partition, a Lambda and a module-level IfExp on a changed line (N04), the frozen-line marks and each binding rule. See the round-12 report section for replay results and evidence hashes.
