# CA-SEAL2 coverage inventory — round 11

Validator SHA-256: `3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72`. Historical base: `17c842445a2623bb0334ba8d6932e7a6bf088967`. Class table built for Python 3.14.4 (133 classes).

The census walks the complete bodies of all 15 touched top-level functions, including nested functions and unchanged August statements. Every node is dispatched on its exact AST class, and BinOp, AugAssign and UnaryOp also on their operator class, wherever they occur: a statement shape cannot hide a truth-carrying operator. Every call receives a row. Missing, stale, duplicate and changed identities fail before outcome checking. Byte-hash and line-metadata updates cannot supply a missing row.

| Census node type | Rows |
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
| AugAssign(BitAnd), AugAssign(BitOr), AugAssign(BitXor), NamedExpr, Assert, match case/guard, BinOp(BitXor), While test, TryStar dispatch | 0 |

**1617 census rows:** 873 predicate/preservation rows and 744 non-predicate data operations. The 327 historical syntax/semantic rows remain separately checked, for **1944 combined rows**. These counts include wrappers and children; they are not counts of independent invariants. Round 11 adds no census row: the frozen validator has no bitwise AugAssign in a touched function.

| Census outcome | Rows |
|---|---:|
| non-predicate data operation | 744 |
| preserved August predicate | 620 |
| killed by | 200 |
| implied | 8 |
| same-predicate duplicate | 3 |
| structural | 4 |
| frozen-input only | 38 |

## Complete AST class table

`AST_CLASSES` in `CA-SEAL2-checks.py` lists every node and operator class of Python 3.14.4's `ast` module, with one category each. The coverage test regenerates the class list from the running `ast` (its namespace, `_ast` and the subclass closure of `ast.AST`) and fails on any class missing from the table, on a stale entry when the running minor version is the recorded one, on a truth-carrying class without a census mechanism, on a census rule for a class the table does not mark truth-carrying, and on any class marked refused that occurs anywhere in the validator. A class unknown to the table counts as truth-carrying for the census and as refused when present. Table SHA-256 (canonical JSON): `a059dc26d90a5be752e92191efb140778d83246822e9f9b02474f2a73815035b`.

| Category | Classes |
|---|---:|
| truth-carrying | 37 |
| data | 43 |
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
| data | Arithmetic operator. On Booleans it returns an int, never a bool (True + False == 1), so it does not produce a truth value, although a nonzero result is truthy. Deliberate, reviewed exclusion from the truth census: on an inserted or changed line of an aligned unit the node needs a changed-line row; in a function new since CA-SEAL it is a data operation seen by the corpus, not by this table. | `Add`, `Sub`, `Mult`, `MatMult`, `Div`, `Mod`, `Pow`, `LShift`, `RShift`, `FloorDiv` |
| data | Unary arithmetic. On a Boolean it returns an int, never a bool; the same deliberate exclusion as the binary arithmetic operators. | `Invert`, `UAdd`, `USub` |
| data | Expression context of a name, attribute, subscript, starred item or display target. | `Load`, `Store`, `Del` |
| data | Binary operation; its operator class decides: BitAnd, BitOr and BitXor make it a census row, arithmetic is data. | `BinOp` |
| data | Unary operation; its operator class decides: Not makes it a census row, Invert, UAdd and USub are data. | `UnaryOp` |
| data | In-place update; its operator class decides: BitAnd, BitOr and BitXor make it a census row, arithmetic is data. | `AugAssign` |
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

Arithmetic (`Add`, `Sub`, `Mult`, `MatMult`, `Div`, `Mod`, `Pow`, `LShift`, `RShift`, `FloorDiv`, `Invert`, `UAdd`, `USub`) is the one deliberate exclusion: on Booleans it returns an int, never a bool, so it is not a truth-producing operator, but a nonzero result is still truthy. On an inserted or changed line of an aligned unit it needs a changed-line row; in a function new since CA-SEAL it is a data operation that the corpus, not this table, has to see.

## Operator census

Every operator occurrence in the 15 touched functions, by the node that holds it, and in the whole validator. A truth-carrying operator must sit in a node that anchors a census row; the coverage test requires zero unanchored occurrences.

| Operator | Category | Touched functions | Carried by a census row | Unanchored | Whole validator |
|---|---|---|---:|---:|---|
| `Add` | data | AugAssign 1, BinOp 27 | 0 | 0 | AugAssign 1, BinOp 70 |
| `And` | truth-carrying | BoolOp 43 | 43 | 0 | BoolOp 61 |
| `BitAnd` | truth-carrying | BinOp 9 | 9 | 0 | BinOp 11 |
| `BitOr` | truth-carrying | BinOp 3 | 3 | 0 | AugAssign 2, BinOp 15 |
| `BitXor` | truth-carrying | 0 | 0 | 0 | 0 |
| `Div` | data | BinOp 78 | 0 | 0 | BinOp 102 |
| `Eq` | truth-carrying | Compare 58 | 58 | 0 | Compare 69 |
| `FloorDiv` | data | 0 | 0 | 0 | 0 |
| `Gt` | truth-carrying | Compare 1 | 1 | 0 | Compare 2 |
| `GtE` | truth-carrying | 0 | 0 | 0 | Compare 1 |
| `In` | truth-carrying | Compare 23 | 23 | 0 | Compare 43 |
| `Invert` | data | 0 | 0 | 0 | 0 |
| `Is` | truth-carrying | Compare 23 | 23 | 0 | Compare 28 |
| `IsNot` | truth-carrying | Compare 36 | 36 | 0 | Compare 51 |
| `LShift` | data | 0 | 0 | 0 | 0 |
| `Lt` | truth-carrying | Compare 2 | 2 | 0 | Compare 4 |
| `LtE` | truth-carrying | Compare 6 | 6 | 0 | Compare 7 |
| `MatMult` | data | 0 | 0 | 0 | 0 |
| `Mod` | data | 0 | 0 | 0 | 0 |
| `Mult` | data | 0 | 0 | 0 | BinOp 1 |
| `Not` | truth-carrying | UnaryOp 113 | 113 | 0 | UnaryOp 153 |
| `NotEq` | truth-carrying | Compare 58 | 58 | 0 | Compare 121 |
| `NotIn` | truth-carrying | Compare 14 | 14 | 0 | Compare 23 |
| `Or` | truth-carrying | BoolOp 67 | 67 | 0 | BoolOp 101 |
| `Pow` | data | 0 | 0 | 0 | 0 |
| `RShift` | data | 0 | 0 | 0 | 0 |
| `Sub` | data | BinOp 31 | 0 | 0 | BinOp 40 |
| `UAdd` | data | 0 | 0 | 0 | 0 |
| `USub` | data | 0 | 0 | 0 | UnaryOp 1 |

The validator's two bitwise AugAssigns, `emit |= set(...)` at V:600–601, are in an untouched function, AST-identical to CA-SEAL, so they are outside the touched-function census, like every other untouched August statement.

The 620 **preserved August predicate** rows are inherited, unchanged occurrences. The coverage test computes that property instead of trusting a row's claim: it aligns CA-SEAL `17c842445a` to the frozen validator function by function, over unchanged source blocks, and maps each current node to its historical occurrence. A preservation row passes only if its claimed baseline id is the mapped counterpart of its own node, and each historical occurrence may be claimed once. This outcome does not claim a new accepting-input or guard-removal proof for the unchanged August implementation.

### Occurrence map (computed by the coverage test)

| Measure | Value |
|---|---:|
| Touched functions aligned to CA-SEAL by name | 4 |
| Touched functions new since CA-SEAL | 11 |
| Aligned unchanged blocks | 8 |
| Aligned unchanged lines | 1306 |
| Eligible nodes (computed counterpart) | 1126 |
| Ineligible: changed enclosing header | 1 |
| Ineligible: function new since CA-SEAL | 455 |
| Ineligible: inserted or changed line | 35 |
| Preserved rows matched to their own counterpart | 620 |
| CA-SEAL functions removed | 0 |

| Aligned unit | Blocks | Lines | Nodes | Eligible | Inserted lines | Changed lines | Deleted CA-SEAL lines | Replaced CA-SEAL lines |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `multi_family_receipt_state` | 2 | 28 | 57 | 51 | 0 | 1 | 0 | 1 |
| `post_august_validator_pin` | 2 | 46 | 57 | 56 | 0 | 1 | 0 | 1 |
| `main` | 2 | 1202 | 1020 | 1009 | 18 | 0 | 0 | 0 |
| `build_receipt` | 2 | 30 | 28 | 10 | 10 | 0 | 0 | 0 |
| `<module>` | – | – | – | – | 43 | 0 | 0 | 0 |

Line counts follow the parser (N04): universal newlines, then LF only. A form feed, vertical tab, U+0085 or U+2028 inside a string does not end a line, as it would for `str.splitlines()`; a sentinel statement checks the count against the parser on every alignment. `difflib` keeps the longer side of a move aligned (N03): the moved lines on the longer side keep their counterparts, and the shorter side shows up as deleted CA-SEAL lines plus inserted current lines, which need their own records.

## Changed lines carry rows (N02, option A)

The aligned units are the four aligned functions and the module body outside all top-level functions (`<module>`). Every node with a source position on an inserted or changed line of an aligned unit (a statement by its header span) either anchors a census row or has a **changed-line row**: data or structural as its class is, with a reviewed reason. A truth-carrying node there that no census row carries (possible only in `<module>`, which has no census) is refused. Every CA-SEAL line of an aligned unit without a current counterpart (deleted, replaced, or in a CA-SEAL function that no longer exists) is a **historical-line record** with a reviewed reason. Missing, stale or changed rows and records fail coverage.

| Changed-line rows | Rows |
|---|---:|
| `<module>` | 52 |
| `build_receipt` | 49 |
| `main` | 81 |
| `multi_family_receipt_state` | 5 |
| `post_august_validator_pin` | 3 |
| **total** | **190** (data 189, structural 1) |

By class: Assign 29, Attribute 8, BinOp 2, Constant 46, Dict 1, Expr 1, If 1, Import 3, Name 78, SetComp 2, Subscript 15, Tuple 1, alias 3.

| Historical-line record | Mark | Reason |
|---|---|---|
| `multi_family_receipt_state` CA-SEAL line 222: `or receipt.get("validator_after_sha256") != sha256_file(Path(__file__))` | replaced | CA-SEAL compared the receipt's validator_after_sha256 with the live file hash, sha256_file(Path(__file__)). Replaced in place by V:225, which compares it with third_change_validator_pin(); every node of V:225 has a census or changed-line row. |
| `post_august_validator_pin` CA-SEAL line 263: `live_hash = sha256_file(Path(__file__))` | replaced | CA-SEAL hashed the live file into live_hash. Replaced in place by V:266, live_hash = third_change_validator_pin(); its call is a census row and its other nodes have changed-line rows. |

The frozen validator deletes no CA-SEAL line (0 deleted, 2 replaced, 0 in removed functions). Its module-level changes are additions only: three imports and fourteen constants, none of them a name CA-SEAL binds or reads, read only by functions new since CA-SEAL.

The 744 **non-predicate data operations** have a reason and concrete parent/consumer AST data-flow records. Lookup, digest, type, length, bytes and collection producers remain distinct from the comparisons/truth tests that consume them. Mutation calls and exception construction have explicit effect/raise consumers. The twelve bitwise nodes are eleven set operations and one optional-type annotation; the full expressions and actual consumers distinguish them from Boolean bitwise combinations. Predicate-returning helpers and methods remain predicates. Classification never suppresses enumeration.

All historical and census outcomes together: killed by: 433, non-predicate data operation: 760, implied: 28, structural: 9, same-predicate duplicate: 6, frozen-input only: 88, preserved August predicate: 620. **Unclassified: 0.**

## Controls

The committed corpus keeps the three round-9 insertion controls (assigned `isinstance`, assigned Boolean `&`, the builder `| isinstance(...)`), the five round-10 preservation probes and the synthetic grammar and alignment controls. Round 11 adds `positive_ast_class_table` and sixteen negatives. Each edit probe edits a scratch copy of V, rebases line metadata, forges every group except the one under test and regenerates every count, so only that rule can refuse:

- `negative_census_augassign_bitor`: recount_validation: state['complete'] |= True before the return; refused by `coverage sites missing=`.
- `negative_census_augassign_bitand`: recount_validation: state['complete'] &= True before the return; refused by `coverage sites missing=`.
- `negative_census_augassign_bitxor`: recount_validation: state['complete'] ^= True before the return; refused by `coverage sites missing=`.
- `negative_census_hidden_builder_bitor`: build_receipt: overall_pass |= {"review_extra": False, **named}["review_extra"] after the round-9 gate; refused by `coverage sites missing=`.
- `negative_census_hidden_builder_bitand`: build_receipt: the same with &=; refused by `coverage sites missing=`.
- `negative_census_hidden_builder_bitxor`: build_receipt: the same with ^=; refused by `coverage sites missing=`.
- `negative_changed_truncated_input`: post_august_validator_pin: anchors = anchors[:1] before the preserved guard; refused by `changed-line nodes missing=`.
- `negative_changed_rebound_input`: main: actual_ets = expected_ets before the preserved partition comparison; refused by `changed-line nodes missing=`.
- `negative_changed_inserted_continue`: main: continue at the top of the partition loop; refused by `changed-line nodes missing=`.
- `negative_changed_module_rebinding`: module: POST_AUGUST_RECEIPT = MULTI_FAMILY_RECEIPT after MULTI_FAMILY_AUTHOR; refused by `changed-line nodes missing=`.
- `negative_changed_module_truth_carrier`: module: PM_PROBE = isinstance(HOME, Path) after MULTI_FAMILY_AUTHOR; refused by `truth-carrying node on a changed line without a census row`.
- `negative_deleted_preserved_guard`: main: the preserved if actual_ets != expected_ets block deleted in place; refused by `historical lines missing=`.
- `negative_refused_class_present`: recount_validation: global PM_PROBE as its first statement; refused by `ast class table`.
- `negative_ast_class_removed`: a synthetic edit of the class table, with V and this table unchanged.
- `negative_ast_truth_class_without_rule`: a synthetic edit of the class table, with V and this table unchanged.
- `negative_ast_rule_for_data_class`: a synthetic edit of the class table, with V and this table unchanged.

The grammar control adds `&=`, `|=`, `^=` (census rows), `+=` and `-` (no census row: the arithmetic exclusion), `while` and `except*`. The alignment control adds the line marks, changed-line rows and historical-line records of its synthetic edit, a form feed inside a string, a lone carriage return, a deleted and a changed decorator, and module-level insertions and deletions. See the round-11 report section for replay results and evidence hashes.
