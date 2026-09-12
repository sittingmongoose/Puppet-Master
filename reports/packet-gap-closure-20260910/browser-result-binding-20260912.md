# Browser Program result binding — bounded static repair

Status: implemented and statically verified; full integration/audit and runtime acceptance remain open. This report records pre-rebase verification on base `2c1797be191735b8d39e3da787c3d9d94721703a` plus the authored changes, then separately captured post-rebase verification below. Earlier runs are not relabelled as current-main runs.

## Authority and repair

Jared answered exactly `yes` at 2026-09-11 23:46:24 UTC to question `call_YLuFIE8wHarbwXVTPPV6xnZC`, item 0: “May I add the missing technical bindings between Browser Program results, their existing byte budgets, and their output schemas? I would reuse existing limits, add no new product policy, and leave runtime and event admission unchanged.”

Existing owners are Section 15 §3.18A and SMPFS-147/148/152/153. New non-GUI SMPFS-169 binds the complete actual uncompressed UTF-8 result bytes to the producing program's existing `max_output_bytes`, pinned output-schema bytes and complete pinned offline dependency closure, plus independently resolved terminal subject and ProgramWorkspace revision. No new numerical budget or token policy is introduced. A schema-valid standalone result is no longer sufficient. Earlier programs lacking schema pins require explicit recompile/preflight, not a permissive default. Legitimate terminal generation/revision advancement remains valid; substituted, regressed or self-asserted context does not.

The Python helper checks exact bytes including whitespace, escaping, nested data and all record references; rejects invalid UTF-8, duplicate keys, non-JSON numbers and schema/resource collisions; retains exact decimal values; checks unused reference branches; and uses no ambient schema retrieval. The fixture wrapper is explicitly excluded from the runtime record union. Large values still require the existing typed-artifact spill path and an independently bounded summary; these tests do not execute spill or prove artifact custody.

Required derived-file generation exposed checkout-local paths in index failure diagnostics. The accompanying `pm-plan-index.py` change removes only the exact repository-root prefix from those diagnostic strings. Two regression tests preserve the failure code and fail-closed certification status. The currentness helper, certification receipt and governance authority are not changed. This script change adds stale-hash failures until a separately authorized seal; they are not suppressed.

## Counterexamples and regression coverage

Before the repair, the actual static schema/helper accepted all 16 synthetic results: one bounded control, eleven oversized results (including the seven terminal states), and four program/lineage/subject/revision substitutions. Afterward the same 16 byte-identical result bodies keep the control valid and reject all 15 negatives. The eight-MiB case is 8,389,463 complete UTF-8 bytes against the fixture's existing 1,048,576-byte budget. This is a demonstrated static acceptance gap, not an observed native/model-output leak.

Both raw probes are retained under `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/browser-result-budget-20260911-FX55biB1/`:

- `current-result-counterexamples.json` — SHA-256 `a8aafd583845cc98bcb019c93c2d8e270f23934dcc190ccd2a1d81fc01c10be1`.
- `bound-result-counterexamples.json` — SHA-256 `d2a13f281d38825d0567c127de6c7dd8df8bd2c07d5cc59fdfef497c7d9a212c`.

The 54 focused test methods include all 21 existing mode/terminal combinations, exact-limit/one-byte-over checks, Unicode and escaping, reference-list overhead, malformed data, all lineage dimensions, protected-auth rejection, legitimate advancement, missing owner bindings, original schema-byte hashes, local anchors, offline imports and transitive closure, collisions, unsupported dialects, unused unresolved branches, exact decimals and caller-context immutability. These are supplied-context comparisons, not compiler/dispatcher/provider/native currentness authentication.

## Captured verification

All seven completed captures below are under `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/browser-result-binding-final-20260912-Ch1QgTHK/`. Each named receipt pins the command, stdout/stderr hashes, base HEAD, capture source and 416 selected root Plans/script/test inputs; none of those selected inputs changed during its run. The selection is explicit and is not every possible transitive input.

| Receipt | Result | Receipt SHA-256 |
| --- | --- | --- |
| `focused.receipt.json` | PASS, 54 tests | `0228e88e7051dce75d339ba4062a9615dadf44c066a8f685799e7517e5813e70` |
| `existing-browser.receipt.json` | PASS, 10 tests | `cb78be48ea96f340228f62526146c39981200ec7db018f1689836e2c8b28065f` |
| `contracts.receipt.json` | PASS, 30 pairs, 1,028 positive / 3,338 negative fixtures | `f72cdc734df8a6812c98f042e5cb57f4a4bb1bfdcc82cd2eae40ccc45c7d298a` |
| `index.receipt.json` | PASS | `0482abba3bca28b3e49faa1df47dab8f31de9eb9b7bc4176d5c0c25159e257a3` |
| `shards.receipt.json` | PASS | `7a6e41516645c8fffbec123f9d76cf5b97565bdb002001f4b8753c67d45681ff` |
| `full-suite.receipt.json` | FAIL, 696 tests: 683 passed, 4 failures, 9 errors | `5bdc8652a579ddd848d1ec744745c1b1121fe224f9186b936d727b1bd906b5f8` |
| `gates.receipt.json` | FAIL, 24/36 checks pass | `a0fea6f87b8d160ca761f22fd61d832c40e3669280c0c6a144f7936fc25c80a0` |

The four full-suite failures are the Onboarding storage census (102 versus expected 90), shared-runtime storage census (102 versus 84), PRD-planning embedded Home schema reference scanning (72 errors), and stale runtime-integration owner hashes. All nine errors are PNC-019 setup reads of the missing currentness `VALIDATOR_RECEIPT.json`. These categories also occurred in the earlier capture, not introduced as new passing claims here.

Failed governance checks and full subcheck failure counts: `json_syntax` 1; `lint_contractrefs` 1; `lint_path_refs` 10; `validate_audit_closure` 201; `validate_audit_status_index` 1; `validate_evidence` 1,448; `validate_implementation_readiness` 49; `validate_plan_graph` 1,448; `validate_plan_migration` 180; `validate_pm7_gui_fixtures` 1; `validate_prd_planning_runtime_contracts` 72; `verify_spec_lock` 27. Relative to the preceding run before the index-diagnostic change, readiness adds `execution_unit_context_spec_lock_hash_stale` for `scripts/pm-plan-index.py`, and Spec Lock adds that changed script's stale hash. No seal or readiness refresh is attempted.

Authored source hashes: Section 15 `e750a78018fc0ec74c2408635d69f122e1f9a59c26ba6d8a5c8508f534bdf091`; Browser schema `8be6e1d1761a7316226a485846c1b45e9b11b02b158a0311f5cdd0aa9aadf33a`; fixtures `a37b54ae9fb75bb43b8d602b8d6003968f49b9a478ecbedf3d6d4a6d232d9ff8`; semantic helper `0e0b90d3bb0849772cee4ed9e5e95ab454b0e6f114945e199fa6950f41e1a335`; contract runner `37834af4e03c4326e3d45cb7d892c78595f764ed86475d482cc50ff30837eab6`; index generator `29c9eb0c5c57d52867b0b0f956a3ff6e3e54d1cb46dc11cc4c1a0d0b4939600d`; focused tests `831178a460d53859abeabe48cc13bad572e4cf1de95c47529b8007837be73f02`; index tests `491719f1480ec313525edec0d7345ff16e441d13328322c20b9391abd7ba42e3`.

## Outstanding packet audit and boundaries

This repair is not final packet-audit closure. The R5 frozen workbook remains 437 formally reviewed cases and 12,979 missing reviews. Another 53 explicitly authored command/alias reviews are saved as an unfinished working checkpoint, not validated chunk credit: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/r5-command176-review-20260911-My8iicF0/root-review-working.json`, SHA-256 `84a2dd3b9685d974f96fddb2cc50f29d5fe6bce092c40ebd6aae36a3f695193c`. The command cohort has 176 cases; remaining source/owner adjudication and formal chunk receipts are still required. That checkpoint includes a primary-catalog gap for `cmd.auth_profile.open_official_page`; it is not repaired or declared closed by this Browser result change.

No visual design, native implementation, Event Authority admission, production handler availability, artifact authenticity, transport enforcement, WorkNode/NodeSeed, executable queue, Spec Lock, generated evidence, governance seal or full goal completion is claimed. Other agents' changes remain outside this patch.

## Post-rebase verification

The implementation was rebased onto main `20ea55d303b328ddb581262819978a6d20cc37fd`, preserving the other agent's DL-047 Goal retention change, as commit `e39e42c2d53d6ac87449aef9426683b056fafe69`. Four generated index conflicts were resolved only by regeneration. No authored Browser source, schema, fixture, helper or test changed during the rebase. The combined generation has 95 documents, 6,544 PlanUnits and 25,153 acceptance units; runtime certification remains blocked and no WorkNodes or NodeSeeds were created.

All seven checks were rerun at that exact commit, with unchanged HEAD and all 416 selected inputs unchanged throughout every run. Their captures are under `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/browser-result-binding-land-20260912-ISBLnq0R/`:

| Receipt | Result | Receipt SHA-256 |
| --- | --- | --- |
| `focused.receipt.json` | PASS, 54 tests | `bac80cc9b587f0816c718e2a396e278acbd03cf0b8bfed73d5d1817da9486d12` |
| `existing-browser.receipt.json` | PASS, 10 tests | `1ff9e5d0cbfcc100d3c22375714b70c3d6697b70e691e9e9a34d1d5caa685fcc` |
| `contracts.receipt.json` | PASS, 30 pairs, 1,028 positive / 3,338 negative fixtures | `11565eafe6a080de506455743acc75f4928ce140f4466b77be20cf77211059b5` |
| `index.receipt.json` | PASS | `a04f780f9a0ca7a0dfd8e82fd8a813a9b1f2154d5fbb9ee78e4a002ae649a8eb` |
| `shards.receipt.json` | PASS, 98 documents / 2,303 shards | `655c064aa550004e260ea35593d411e06e86bd13990c5b953d2a84769ecf95a9` |
| `full-suite.receipt.json` | FAIL, 696 tests: 683 passed, 4 failures, 9 errors | `33d076b3c28cd3cab0b2c11e39b380bd132d8f7973f629d35e4865f49cf6a593` |
| `gates.receipt.json` | FAIL, 24/36 checks pass | `b061ccfde7e8160785380b5b76421188f6bb5a8da965adb420c65c4448c68c1d` |

The four failing test identities, nine error identities, and all governance subcheck failure counts match the preceding capture. Full-suite stderr SHA-256 is `3aba94870412b0f3ad771ea5a9c09ddf54ce98efc0bfec17cc5a70ce1963c207`. The report-only addendum does not change a tested source input.

`scope.json` in the same capture directory, SHA-256 `69a840f13453c9420b4ecaab2b18f98f1f8091f5f37a3f1cfbba60ed61bff156`, pins the exact 44 changed paths at the implementation commit and verifies: no unrelated changed path; 6,375 non-Browser PlanUnits, 24,532 non-Browser acceptance units, 94 other owner document cards and 6,375 other owner dependency nodes remain unchanged versus the rebased main; existing numerical budgets, the runtime root union and unrelated Browser schema definitions remain unchanged; the sole new definition is the non-runtime validation input; and generated indexes contain no checkout-root path. This snapshot includes the earlier report bytes and is retained unchanged, not retroactively updated for this addendum.

The formal audit status was also rechecked after the rebase: 13,416 expected cases, 437 reviewed, 12,979 missing, nine valid result files, 142 missing chunks, zero duplicates or validation errors, `complete: false`. Its frozen manifest remains `456598e38de20ff164fb7fcf7d95ce2ff9273d17f063d7a425b11968c03554cb`.
