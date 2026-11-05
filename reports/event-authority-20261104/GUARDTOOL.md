# GUARDTOOL — shared check-11 machinery

Branch: `plans/ea-guardtool-20261105`. Base: `f9c5de6561dff0a53a48e530f2a5c6804a7e941d` (`origin/main`, fetched before branching). Implementation and synthetic verification only; no lane branch is edited or admitted.

## 1. Survey of lane proof implementations

The survey read the seven required implementations, their branch reports and the cited review findings. Source refs were pinned before extraction; later branch movement is not incorporated silently. The evidence manifest records each source path, pinned head, absolute snapshot path and SHA-256. `survey/other-lane-interfaces.json` records the remaining twelve drafting-lane interfaces used by the adoption guide. Those additional interfaces were inspected statically, not run.

| Lane and pinned source head | Lane-specific construction and callback to retain | Generic machinery replaced; main finding |
|---|---|---|
| **DG6B** `ff6d98d8740eff0df68a44f5d4eca0894c4fdf41` | `pm_dg6b_full_oracles.rebuild`, `Probe`, `family_probes`; `complete_append_contract`, complete retry/recovery and separate retained-reader callbacks. Source construction synchronizes actual payload, result, operation, identity and physical observations before execution. | `guard_inventory`, `predicate_clauses`, `compiled_module`, `module_for`, `discover`, grouping and matrix in `pm-dg6b-guard-proof.py`. **Current source is newer than its round-7 report:** it already narrows clauses, avoids overlap union and adds per-site tests. The old overlap claim in report prose is not treated as the current implementation. Shared machinery replaces that growing bespoke implementation; fixture C8-B1 is not excused. |
| **DG** `cfb7e550746c08a989bb41583286d72acc47e68d` | Four complete current/history/stop/lifecycle oracle commands, `materialize_cases`, `Gates`, per-family successor/projector and source/history construction. | `schema_type_inventory`, `expanded_guards`, keyword wrappers and `Audit` in `pm_goal_oracle_common.py`. **The inventory is type-centered and same-node membership/branch sets require narrower predicate identities.** Shared inventory includes the independent bounds/lengths and does not remove a required list or merge peer clauses. |
| **DFM** `17cbdfb2d24fecba11b2ad389667c7d5d8d37296` | `boundary_case`, `negative_case`, `transition_case`, `validate_case`, `validate_original_models`, effect/control transitions and `validate_historical_operation`; genuine whole-schema controls. | External `fix6/guard-audit.py`, `build-rules.py`, predicate/lookup and matrix runners. **DFM supplies the useful full-control → isolated edit → complete-schema cut → restoration pattern, but its latest round-7 report is resource-stopped and retracts final proof credit for old schema sets.** Astra's earlier sample of 317 groups / 320 witnesses is evidence for that earlier sample only. |
| **DS15** `024adc567a2cf4f1c6da898c3951b9110df3b59e` | `semantic_input`, `semantic_parent`, `guard_proof_input`, `guard_proof_result`, `evaluate`, actual migration/retained paths; source and Browser witness construction. | `add`, refusal/accept-predicate inventory, `Replace`, `exact_weaken`, model and loop in `pm-ds15-guard-audit.py`. **Its construction universe includes unexposed mutations; a shared tool must report those as unproved rather than equating mutation construction with a witness.** Compound predicates and helper delegations need explicit disposition. |
| **DCH** `3a994263ef63354fd9e2fde754f06faec92c84be` | `corpus`, `Case`, `changed`, real surface dispatch into `pm_dch_events`; lane-specific date-time/URI parsers and original-history witnesses. | `Proof` instrumentation, aliases, schema path normalization/generation and matrix/restoration in `pm_dch_guard_proofs.py` / `pm_dch_schema_guard_proofs.py`. **Named surfaces and primitive labels are reusable; detached payload shapes must be wrapped in coherent complete-path inputs before append credit.** |
| **DX** `578ca65028307887448bb0c2280d095dc565bacc` | Existing family/capture/source/trace/type specimens; `validate_capture`, `validate_dependencies`, `validate_retry`, `validate_history`, `run_trace`; exact original Storage and receipt inputs. | External `fix7/harness/matrix-loader.py`, family/duplicate runners and result caches. **A parameterized `require` helper is not one invariant: each call/Boolean clause and input field must retain its own identity.** Repeated display names must retain occurrence multiplicity. |
| **DO** `f69bfd4629390c47a9f57e3f3e3c8268732d465a` | External `sync_source`, `sync_read`, case bank and domain dispatch; real event/checkpoint/history/recovery callbacks plus required owner joins. | External `fix-round-7/guard_audit.py` mutation classes, grouping, caches and matrix; `normalize_guard_table.py`. **Accumulated error appends need exact sites and codes; the large helper-domain bank is not automatically a complete append/history matrix.** |

No lane's passing authored suite or historical reviewer sample is promoted to current clearance. The common reusable part is the proof engine; complete-path construction, field binding and product refusal meaning remain lane responsibilities.

## 2. Implementation and proof behavior

`scripts/pm_guard_isolation.py` provides `SchemaCatalog`, `AstGuards`, `Control`, `Negative`, `Duplicate`, `Suite`, `Outcome`, `run`, `markdown` and `MemoryGate`.

- **Independent schema inventory:** scalar type/membership/numeric/string/format assertions, required members, dependency members, closures, array/item/contains constraints, branches and boolean schemas. All declared references, including dormant branches/definitions, resolve before cases. Referenced selectors and logical polarity propagate through the graph; dynamic anchors are conservatively included as context-bound unclassified occurrences. Dialect-ignored assertions carry explicit evidence. Every consumed validator entry must map to a declared root occurrence, including entries reached only during mutation. Cycles are visited without reference expansion.
- **Exact cuts:** one required or dependency member; one Boolean/code clause; one scalar assertion; one closure/item boolean; one contains count. A type cut preserves const/enum for correctly typed values. OneOf exclusivity retains all alternatives and the nonzero-match requirement. Single-atom negated schema contexts are cut with opposite polarity. Compound negative schema contexts remain explicitly unproved before mutation; no whole-conjunction false shortcut is generated. Supported cuts keep peer assertions enabled.
- **Code sites:** function/column/AST fingerprint, direct raise/refusal-return, boolean-return leaf, assert leaf, accumulated refusal append and declared acceptance-predicate call argument. Sibling Python functions share the cloned module namespace; declared modules' cross-imports are rebound. Nested/class/module guard sites, including declared predicate calls and refusal appends, are visible as unsupported candidates requiring an explicit adapter seam, never silently omitted.
- **Whole matrix:** valid controls accept; each baseline negative rejects with its declared target code; the target cut accepts its own negatives; every other negative runs and retains its exact original refusal; restored fresh state re-rejects and controls re-accept. Unexpected checker exceptions are not refusals. Type-sensitive input diffs, source hashes, stable case identities and exact complement sets are exported.
- **Duplicate proof:** one field/predicate declaration, evidence, each site removed alone, all sites removed, and each site restored while its peers remain cut. No overlap/code/keyword union is performed. Assertion identities include the consumed root, input field and reference trail. Private resources isolate repeated ordinary references, including an inline assertion referenced by a peer; source schemas and siblings are not flattened. Python-built schema container aliases are separated as JSON schema occurrences. These private resource URIs are proof internals, not product bindings. A structured or opaque multi-field guard must expose its atomic predicates in the adapter; an aggregate refusal is not permission to remove its peers.
- **Shared-reference regression:** a final inspection found that a shared physical target could still couple two fields. The implementation now creates separate evaluation occurrences and private reference frames; new complete matrices prove different-field isolation, same-field duplicates, inline/reference duplicates and mixed-polarity field routes. Compound negative schema contexts are rejected before an unsafe cut can generate a misleading row.
- **Honest gaps:** missing witnesses remain unproved. Unknown extensions, recursive/dynamic contexts and unavailable format checkers remain explicit. Classifications and cross-copy bindings are reviewable evidence. No automatic theorem about arbitrary Python helper semantics or source constructors is claimed.
- **Serial resources:** peak RSS guard around callbacks; optional low-memory hysteresis and continuous-low timeout; no child processes, parallel matrix or instance-result cache. Validator construction alone is cached within one immutable schema state. RSS sampling cannot interrupt a single allocation; lane constructors must stay bounded.

The adoption guide specifies complete callbacks, target labels, replaced functions and open machinery findings for all 19 drafting lanes. Adoption must pass before any machinery sweep item closes. Real missing negatives, stale copies and accepted bad product inputs remain lane defects.

## 3. Owner and premise checks

**Reused owners:** current `Plans/Automated_Testing_System.md#ATS-003` owns project-specific oracle selection and `#ATS-004` owns automatic evidence and explicit gaps. Their current prose was read at the base head. The repository method and public API are named in the adoption guide; no new owner prose or ATS unit is needed. **IDs used: none.** No allocation from ATS-1100..1109 was consumed.

**Old decisions applied: none.** No August/September answer is reused, extended or reworded. No event consumer, projector, checkpoint, identity, replay, withdrawal, retention or deletion binding is authored. **Premise checks failed: none.** The two requested memory files did not exist at their prescribed Nas1 paths and no relocated copy was found by the local filename search; no ID allocation or index generation depended on them.

No canonical Markdown changed, so shard/index regeneration and currentness restamping were not performed. The ignored currentness edition was copied from the shared checkout and all 15 files matched with `sha256sum` for read-only index validation. No generated governance artifact, registry, admission, Decision Log, Spec Lock, auto-decision, frozen validator or other lane file is edited.

## 4. Verification and evidence

Verification results, exact commands, exit codes, parsed statuses and evidence hashes are recorded in `GUARDTOOL.checks.json`. The self-grade is `GUARDTOOL.self-grade.json`. Raw outputs and full trap/matrix rows are retained outside the repository under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/`; the evidence manifest pins their absolute paths and SHA-256 values.

**Preflight:** Nas1 (`ubuntu-agent-nas1`), 19 GiB total RAM, initially 15 GiB available; root filesystem 497 GB free before worktree creation. All checker jobs run serially. Low-memory self-test messages exercise an injected clock/availability source; they are not claims of a real host pause.

| Check | Exit / observed result |
|---|---|
| `pm_guard_isolation.py --self-test` | **0; 49/49 traps caught** |
| CLI adapter example | **0; PASS**, complete toy-schema flip/stay table |
| RSS-limit refusal | **1 expected**, structured `max-rss exceeded` result |
| Missing adapter refusal | **1 expected**, structured setup failure |
| Python syntax compilation | **0** |
| Targeted source discovery | Default directory walk returned **1 / no matches**; explicit `--no-ignore` discovery returned **0**. The initial driver stop is retained, not relabelled as a checker pass. |
| `pm-plan-index.py validate` | **0; top-level `status=pass`; zero failures** |
| `pm-shard-plans.py --check --config Plans/sharding_config.json` | **0** |
| Canonical-input invariance | **0**; canonical Markdown, shard/index bodies and their checker sources unchanged after the tool-only occurrence fix |
| Staged whitespace check | **0** |

**Resource pause:** available RAM fell below 6 GiB before the final checker sequence. Work paused for 240 seconds, sampled every two minutes, and resumed at 9 GiB. No checker jobs overlapped and no other thread's process was changed. The earlier plan-index run had already completed successfully.

**Evidence:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/verification-manifest.json`, SHA-256 `6ba9204c901609206090aa2838b1420e0da0916a281225393c446f12666abf14`. It pins the final full trap rows, adapter guard-removal table, check outputs, serial drivers, currentness-copy receipt and surveyed source snapshots by absolute path plus SHA-256. `source-fingerprints.json` pins the delivered tool, companion and corpus bytes. The report, guide and self-grade are copied beside that evidence before delivery.

## 5. Open items and integration limits

- **Lane adoption remains NOT_RUN.** This task supplies the shared tool and all-lane migration contract; it does not edit or execute another lane's complete matrix, close a real fixture defect or upgrade family grades.
- **Adapters must expose hidden predicates.** Native/compiled code, closures, class-method internals, dynamic field loops and opaque structured comparisons require explicit atomic seams and full callback wiring. The AST backend reports unsupported refusal sites. Recursive/dynamic schema contexts and unknown extensions are unclassified until represented soundly.
- **Format enforcement is a real capability dependency.** This interpreter lacks the default date-time registration; the tool reports it and fails closed. Lanes must supply their actual grammar and preserve authenticated historical recipes. Number-domain and format policy remain separate sweep work.
- **No native product proof.** Synthetic schemas/checkers demonstrate machinery behavior; product runtime/custody and per-family twelve-criterion grades remain outside this tool task. No categorical architecture incompatibility was found among the 19 inspected lane interfaces, subject to the stated adapter obligations.

## Review round 1: findings and responses

Fix base: `88f7a96a383b6cc8e2137e9a332729ce0956e10f`. The reviewed report and its 49-trap observations above describe the original head; this section supersedes its broad atomic-cut and unsupported-inventory claims. The fix runs on the VM from a detached sparse worktree, with 112 GB free and 14 GiB available before creation. Checkers run one at a time with the 6/7 GiB memory gate. No owner Markdown or governance artifact changes; no IDs, event admissions, registry changes or Decision Log entries.

| Finding | Where / cause | Fix and verification |
|---|---|---|
| **F1 — fixed** | `AstGuards._leaves` treated unary `not` as one leaf and permitted whole-statement removal. | Traverse `not` into atomic leaves; preserve connective paths and invert cut truth through negations. `F1-negated-raise`, `F1-negated-return`, `F1-nested-not` prove separate x/y rows. `F1-single-negative` leaves the omitted y candidate unproved and its held-out defect rejected under the x cut. |
| **F2 — fixed** | Unsupported-context discovery omitted predicate calls and append refusals, allowing empty PASS. | Share call recognition across supported/unsupported walks. Unsupported candidates include enclosing identity/reason, remain in inventory and `unproved_guards`, and need an atomic seam or evidenced disposition. `F2-class-require`, `F2-class-append`, `F2-module-require`, `F2-nested-append` execute an independent real refusal and require FAIL. |
| **F3 — fixed** | Entry checks required declared roots to be consumed but allowed other consumed fragments to remain unreachable. | Canonicalize aliases by resolved occurrence; reject undeclared validator requests in every callback state. Re-inventory actually requested fragments as unclassified/unproved. `F3-consumed-fragment` and `F3-mutant-fragment` fail with visible minimum obligations; `F3-entry-alias` and `F3-declared-fragment` provide positive controls. |
| **F4 — fixed by conservative refusal** | A false atom inside a negated conjunction makes the entire conjunction false, suppressing its peers. | Classify compound negative schema contexts unsupported before cuts; direct cut requests refuse. Single-atom negatives remain supported. `F4-negated-conjunction`, `F4-negated-allof` and the revised `negated-compound-shortcut` require unproved assertions and no misleading rows. |
| **F5 — fixed** | Dynamic edges were skipped during occurrence traversal; dialect-ignored `$ref` siblings were treated as active guards. | Follow dynamic target/candidate edges for inventory while withholding proof; retain the selected dialect on rows and filter evaluation edges/assertions by it. `F5-dynamic-target`, `F5-recursive-context`, `F5-draft7-sibling` distinguish effective-but-unproved targets from ignored siblings. |

Implementation commit **`b004369868dafd173faf751695d0da7eca38352e`** fixes F1–F5. Source references: F1 `scripts/pm_guard_isolation.py:764` and `:917`; F2 `:773`, `:810`, `:1087`; F3 `:351`, `:704`, `:1119`, `:1235`; F4 `:460`, `:495`; F5 `:257`, `:447`, `:507`. Committed regression handlers begin at `scripts/pm_guard_isolation_traps.py:355`. No finding is disputed. Schema inventory and predicate-cut self-grades remain **PARTIAL** for the explicitly unsupported contexts; code-site handling returns from the review's **FAIL** to bounded **PASS** for the registered Python forms and unsupported-context regressions. Family twelve-cell grades are not applicable.

All seven real-finding additions in the review are committed, with their expected report rows. Supplementary reviewer controls cover const membership, four then/else peers, W3B's implied maximum (FAIL without proof, PARTIAL with explicit pigeonhole evidence), test assertions, exit-zero results, recursive contexts and memory timeout reset. This extends the original corpus rather than replacing its cases.


**Round-1 verification:** `--self-test` exits 0: **79/79 caught**, comprising the original 49 and 30 added regressions/controls. The toy adapter exits 0/PASS; max-RSS and missing-adapter checks return their expected exit 1. The reviewer's extra-schema controls both PASS. Its extra-code script now exits 1 because the former false PASS observations are gone: class append is FAIL/unproved, single-x proof is FAIL/uninventoried y, and held-out y still refuses under the x cut. The original independent driver exits 1 at the deliberately refused out-of-runner undeclared entry request; a retained reporting-only wrapper catches that exception and finishes the same diagnostics (exit 0). It changes no checker or cut.

`pm-shard-plans.py --check` exits 0 (99 docs, 3,095 shards). `pm-plan-index.py validate` exits 1, parsed top-level `status=fail`: 21 malformed removal-ledger records and the `PLS-025` removal comparison against newer `origin/main`. All 22 named paths, owner Markdown, the generated index and its checker are unchanged from the fix base (`scope-invariance.json`). These are out-of-scope baseline/integration findings, not tool clearance; no owner Markdown or derived artifacts were regenerated. Whitespace check exits 0. The VM already had the pinned real-adapter dependencies; an initial pip command was unavailable and made no changes.

**Unchanged reviewer real DG6B adapter:** original checker/fixtures are pinned at `ff6d98d8740eff0df68a44f5d4eca0894c4fdf41`. The exercised path is the actual retained reader (`history_contract` → `record_contract` → historical Storage verification), not current-writer admission. No instance-outcome cache, lane guard-proof code or fixture repair runs in the callback.

| Family | Overall / exit | Inventory | Rows | Evaluations | Selected guards proved | Unproved | Undispositioned code |
|---|---|---:|---:|---:|---:|---:|---:|
| `plugin.loaded` | FAIL / 1 | 10,755 | 426 | 3,849 | 7/7 | 649 | 230 |
| `plugin.hook.invoked` | FAIL / 1 | 10,761 | 432 | 3,903 | 7/7 | 655 | 230 |
| `auth.github.authenticated` | FAIL / 1 | 10,779 | 448 | 4,047 | 7/7 | 671 | 230 |

All **21 selected runtime predicates** have their own flip, all six peer refusals unchanged and successful restoration; no schema row is credited as proved. Compared with the review, the extra 230 inventory/unproved entries per family are the existing undispositioned code candidates now explicitly included in both lists. The 1,306 removal rows and 11,799 evaluations retain the review's scope. These honest FAIL results demonstrate executable integration and remaining work, not complete adoption or family clearance.

**Evidence:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/fix1/verification-manifest.json`, SHA-256 `961e47f74a72a9f1a870fba04600c0b9a4f657abc7823b2320b76fc4978f8ff5`. It pins complete trap reports, all real matrix rows, exact commands/exits, dependencies, currentness copy (15 matching files), review source hashes and source fingerprints. `real-summary.json` includes the 21 selected rows. `GUARDTOOL-SELF-TEST.json` in the repository is the compact expected-observation index. Reports, guide and self-grade are copied into the same external `fix1/` directory before delivery. Worktree and local extraction are removed after the branch push.

## Review round 2: findings and responses

Fix base: `305952a2be640f4e3faa8638a738678dd6c593c7`. Implementation commit: **`5181b37ea868f71d188f460a38e243377810e563`**. This section supersedes round 1's F2/F5 closure claims. Preflight on the VM found 106 GB free and 14 GiB available before the detached sparse worktree was created. Checker processes run serially with a 1,536 MiB RSS guard and the 6/7 GiB pause/resume gate. No product-family grades or PlanUnit IDs are created.

| Finding | Where / cause | Fix and verification |
|---|---|---|
| **F2 — fixed** | `scripts/pm_guard_isolation.py:804`: refusal recognition required an expression statement, so assigning an append result removed the obligation. | Discover refusal Call nodes independently of their parent; retain one site for a standalone expression. Calls with consumed results remain explicit unsupported candidates with enclosing identity and a reason (`:843`). The engine inventories them as unclassified/unproved and refuses clearance. `F2-round2-assigned-class-append` preserves the exact review spelling; `F2-round2-annotated-append` adds a top-level annotated assignment. Both execute an independent `bad_x` refusal and require one visible unproved candidate, FAIL and no removal rows. Handlers: `scripts/pm_guard_isolation_traps.py:371`. |
| **F5 — fixed by conservative refusal** | `scripts/pm_guard_isolation.py:466`: resource-only filtering mistook a legacy resource's dialect for the caller's keyword-selection context. A modern caller actually enforced its maximum sibling. | Detect mixed-dialect paths over the potential evaluation graph, retain the original validation resources, and mark potentially evaluated assertions unclassified/unproved with explicit context evidence (`:509`, `:532`, `:568`). No mixed-dialect cut is allowed. Potential children are retained even beneath a sibling that the resource-only filter would skip. `F5-round2-cross-dialect` reproduces the minimum-only false-PASS attempt and two-control inconsistency; `F5-round2-cross-dialect-child` adds enforced nested bounds beneath legacy sibling properties. Both compare original modern-entry, direct-legacy and uncut-tool outcomes, require visible obligations, refuse cuts and reject the old proof labels. Handlers: `scripts/pm_guard_isolation_traps.py:395`. |

No finding is disputed. Mixed-dialect isolation remains unsupported; this fix removes false reachability/proof claims rather than claiming a new context-aware dialect implementation. Direct homogeneous draft-07 sibling, dynamic and recursive regressions remain in the corpus. The guide now distinguishes the resource dialect recorded on a row from its calling evaluation context.

**Traps: 86 total, 86 caught.** All 79 prior traps are preserved. The seven additions comprise the exact F2/F5 review probes, one additional trap per remaining finding, and the review's new F1 mixed-negation call, F3 swallowed-entry exception and F4 negated-reference/positive-peer probes. The new observations are checked against concrete inventory, refusal, flip/stay/restoration or pre-mutation refusal rows. Running the expanded corpus against the reviewed base catches only 82/86: exactly the four new F2/F5 traps expose the old defects (`base-traps.json`). The fixed engine catches all 86. Caught includes intentional engine FAIL; it does not mean 86 complete proof matrices PASS.

The unchanged original targeted reviewer driver exits 1 with **16/17** assertions satisfied. All F2 assertions now pass. Its cross-dialect test still expects the legacy maximum to be ignored and the isolated minimum proof to PASS; the review's own F5 follow-up establishes why those expectations are unsound. Our preserved follow-up diagnostic confirms the original modern callback and uncut tool both refuse -1/3 and accept 0, while direct legacy validation accepts 3. The former minimum-only proof now FAILs before mutation because its target requires an explicit context-bound adapter. The committed F5 traps additionally run without unsupported labels and require both bounds in `unproved_guards`, so declaration refusal cannot stand in for inventory completeness. `audit-results.json` checks these dispositions without altering the original reviewer driver.

**Real DG6B exercise:** the unchanged reviewer adapter (SHA-256 `4b7b77b1980351381c5f00052e81397e9d84853acf5f578dbd7623b9e3beddaf`) executes the original checker, retained-history fixtures and owner-schema closure pinned at `ff6d98d8740eff0df68a44f5d4eca0894c4fdf41`. Dependencies remain jsonschema 4.19.2, referencing 0.36.2, rfc8785 0.1.4, blake3 1.0.11 and msgpack 1.2.4. The callback preserves the original physical integer checker and format choices and executes `history_contract` → `record_contract` → historical Storage verification.

| Family | Overall / exit | Inventory | Rows | Evaluations | Selected guards proved | Unwitnessed schema | Undispositioned code | Unproved total |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `plugin.loaded` | FAIL / 1 | 10,755 | 426 | 3,849 | 7/7 | 419 | 230 | 649 |
| `plugin.hook.invoked` | FAIL / 1 | 10,761 | 432 | 3,903 | 7/7 | 425 | 230 | 655 |
| `auth.github.authenticated` | FAIL / 1 | 10,779 | 448 | 4,047 | 7/7 | 441 | 230 | 671 |

The result audit passes: **21/21 selected guards**, **1,306 rows**, **11,799 evaluations**. Each selected row has an accepted control, expected own refusal, exactly one own flip, all six peers unchanged, restoration and reaccepted controls. No schema row is credited as proved. Each full report contains exactly 230 `uninventoried_code_site` failures and the `unproved_guards` summary, with no masking, changed peers, restoration failures or unexpected checker errors. Compared with the cycle-2 review's full reports, only unsupported-candidate reason/evidence text changes; all matrix outcomes and obligations are unchanged. Overall FAIL is the expected incomplete-adoption result, not full lane or family clearance. Consumer/input-field occurrence bindings still need completion beyond this digest-keyed capture exercise.

**Self-grade:** `schema_inventory` remains PARTIAL for mixed-dialect, recursive and dynamic contexts; `predicate_cuts` remains PARTIAL for unsupported logical contexts. `code_sites` is bounded PASS for the supported grammar plus explicit unsupported inventory, now including assigned refusal calls; it grants no proof of class internals or consumed-result mutation. Corpus is PASS for 86 expected observations. Event-family grades remain not applicable.

**Repository checks:** shard verification exits 0/PASS (99 documents, 3,095 shards). Plan-index validation exits 1, parsed top-level `status=fail`, with the same 22 findings: 21 removal-ledger records and `PLS-025` compared with `origin/main`. Every named path and both checker sources are unchanged from the fix base. `scope-invariance.json` verifies this and the unchanged canonical/protected/derived paths. Currentness input was copied into the ignored location and all 15 files hash-match the shared source. No owner Markdown was edited, so no shard/index regeneration was performed. No admission, registry or Decision Log changes; no main push, pm-mail or subagents.

**Round-2 evidence:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/fix2/verification-manifest.json`, SHA-256 `e43848f2a67643c02e4935c9e02f7e447ec8ce64e2e4d99dbd1ecf3dac344441`. Complete traps, review probes, serial commands/exits, real matrix reports, result audit and scope/source fingerprints are retained there. The report, self-grade and compact trap results are copied into the same `fix2/` folder. Local worktree and extracted product inputs are removed after the final branch push.

## Review round 3: findings and responses

**Core implementation:** `f62a23b9207b5be9e472c2070482007ce5f459e5`; closure follow-up `309359ebe9`; total-predicate negative-context follow-up `9769ca85108aed8faf82fe9530fda5cd9cd43147`. Base: `16bd9ccb0c52e557ef58b2b78b937308f1f28a03`. The current contract supersedes the earlier general support and code-sites PASS claims. Overall capability remains **PARTIAL**; active unsupported grammar prevents complete lane proof. No family grade or admission is granted.

The rule is explicit: proof credit requires an allow-listed cut of one predicate. Automatic guards expose `predicate_count=1` and their `cut`; unsupported obligations are unclassified with no cut. Unclassified schema obligations cannot be waived by assigning a selector label. The adoption guide contains the complete allow-list, predicate counts, scope, and remaining adapter work.

| Finding | Where / cause / fix | Verify |
|---|---|---|
| **A-B1 — fixed** (`f62a23b920`) | `scripts/pm_guard_isolation.py:451, :498, :811`. Legacy contains was incorrectly tied to modern minContains support. Inventory the implicit >=1 predicate in draft-06/07; its cut removes legacy contains, preserving other assertions. Ignored minContains=0/maxContains spellings never waive that obligation. | `python3 -B scripts/pm_guard_isolation.py --self-test`; A-B1-draft-06-* and A-B1-draft-07-* (six traps). |
| **A-B2 — fixed** (`f62a23b920`) | `scripts/pm_guard_isolation.py:927, :1005`. The refusal inventory recognized append but omitted equivalent effects. All calls and writes are audited; extend, +=, slice/insert/item mutation, helpers, and other unsupported effects become explicit seams. A proved x guard cannot clear an unregistered y refusal. | `python3 -B scripts/pm_guard_isolation.py --self-test`; A-B2-* and the Python construct audit; all four exact Astra forms retained. |
| **A-B3 — fixed by conservative refusal** (`f62a23b920`) | `scripts/pm_guard_isolation.py:219, :957, :1042`. Chained comparisons and opaque return expressions received aggregate cuts. Chains, ternaries, returned locals (including under not), conditional compound returns, dataflow and opaque calls now refuse registration. No chain is rewritten, so shared operands/evaluation order are preserved. Transparent and/or/not leaves still cut separately. | `python3 -B scripts/pm_guard_isolation.py --self-test`; A-B3-chain-single/aggregate; four exact return-form cases, aggregate reports and held-out peers; Python audit. |
| **A-B4 — fixed by conservative refusal** (`f62a23b920`) | `scripts/pm_guard_isolation.py:573, :614`. Negated routing/applicability created acceptance requirements without explicit child assertions. Negative property/conditional routing, nested not and compound contexts now carry unclassified obligations, including empty-inventory shapes. Only same-input total type/const/enum/Boolean predicates retain negative cuts. Negated typed assertions also require their applicability domain; those contexts fail closed (`9769ca8510`). | `python3 -B scripts/pm_guard_isolation.py --self-test`; A-B4-conditional/properties/no-guard/nested; held-out refusals checked by the original dialect validator. |
| **A-B5 — fixed by conservative refusal** (`f62a23b920`) | `scripts/pm_guard_isolation.py:218, :618; reports/event-authority-20261105/GUARDTOOL-ADOPTION.md:21`. A pattern keyword was treated as one predicate. All patterns now remain unclassified/unproved; no whole-pattern cut is offered. The DM syntax and CR/LF examples preserve independent narrow regex witnesses. Adoption alone does not close DM C8C-B1. | `python3 -B scripts/pm_guard_isolation.py --self-test`; A-B5-pattern-single/aggregate and A-B5-independent-clauses. |
| **Resource finite thresholds — fixed** (`f62a23b920`) | `scripts/pm_guard_isolation.py:1213`. NaN bypassed comparisons in the public API. Every threshold rejects non-finite/non-numeric values before deriving defaults. | `python3 -B scripts/pm_guard_isolation.py --self-test`; A-resource-finite: NaN and +/-infinity for all five thresholds (15 refusals). |
| **Resource fresh samples — fixed** (`f62a23b920`) | `scripts/pm_guard_isolation.py:1242`. The one-second throttle could skip a low-memory callback boundary. Every configured check samples available memory afresh. Factories/allocations are still outside hard containment. | `python3 -B scripts/pm_guard_isolation.py --self-test`; A-resource-fresh: successful t=0 sample, low t=.5 sample, injected pause/resume. |
| **Resource resume RSS — fixed** (`f62a23b920`) | `scripts/pm_guard_isolation.py:1258`. A rising high-water RSS during a low-memory pause escaped the check. RSS is rechecked after each pause sample and on resume. | `python3 -B scripts/pm_guard_isolation.py --self-test`; A-resource-resume: injected peak rises from 10 to 200 MiB under a 100 MiB cap; resume refuses. |

**Whole-tool audit, beyond the five reductions:** oneOf branch cuts remain unclassified because weakening a branch may create overlaps. Unevaluated coverage makes the complete entry unclassified because cuts can change annotation coverage. Pattern routing, formats, unknown vocabularies, unsupported dialects, dynamic/recursive and mixed contexts fail closed. Default invariant identity now includes activation antecedents and matcher occurrences: different contains matchers and different schema-dependency triggers cannot automatically form duplicates. The additional distinct-context trap refuses all three attempted false groups. Unknown keywords in unused definitions or unconsumed declared resources also remain unclassified (`309359ebe9`, scripts/pm_guard_isolation.py:680). The added number/string/object/array negation traps preserve the implicit applicability obligations. Ordinary DFM root-minimum duplicates still PASS.

**Adapter trust:** every run lists its complete callback, refusal translation, consumer/root bindings, module/helper closure, dynamic subject contexts, code predicate bindings, schema aliases, duplicate equivalence declarations and manual dispositions in `trust_decisions`, with inventory/source evidence. Review the callback that only constructs a validator, envelope/payload reuse of one root, x/y loop subjects, translated assertions/internal crashes, and false DC enum aliases. Matrix observations cannot certify those declarations. The guide names each decision explicitly. Some deliberately unsound adapters still PASS; that is the disclosed reviewer boundary, not isolation credit for unknown engine grammar.

### Schema vocabulary audit

The executable audit covers **64 keyword/Boolean/unknown specimens × 4 dialects × 3 contexts = 768 cells**. It covers every keyword exposed by the installed four dialect validators and their standard metadata/declaration vocabulary, plus implicit contains and unknown extensions. **C** means this specimen inventories only per-predicate cuts (each counted separately); **F** means at least one unclassified obligation and no complete proof credit; **0** means only evidenced routing/no-op/ignored/declaration rows. Each dialect column is **positive / negative / nested-not**. C describes the inventory of that keyword specimen including its child predicates, never a whole-container cut. The guide specifies scope and individual cut strategies; raw audit rows include counts, strategies and classifications.

| Keyword | Draft-06 + / - / nested | Draft-07 + / - / nested | 2019-09 + / - / nested | 2020-12 + / - / nested |
|---|---|---|---|---|
| `minimum` | C / F / F | C / F / F | C / F / F | C / F / F |
| `maximum` | C / F / F | C / F / F | C / F / F | C / F / F |
| `exclusiveMinimum` | C / F / F | C / F / F | C / F / F | C / F / F |
| `exclusiveMaximum` | C / F / F | C / F / F | C / F / F | C / F / F |
| `multipleOf` | C / F / F | C / F / F | C / F / F | C / F / F |
| `minLength` | C / F / F | C / F / F | C / F / F | C / F / F |
| `maxLength` | C / F / F | C / F / F | C / F / F | C / F / F |
| `minItems` | C / F / F | C / F / F | C / F / F | C / F / F |
| `maxItems` | C / F / F | C / F / F | C / F / F | C / F / F |
| `minProperties` | C / F / F | C / F / F | C / F / F | C / F / F |
| `maxProperties` | C / F / F | C / F / F | C / F / F | C / F / F |
| `type` | C / C / F | C / C / F | C / C / F | C / C / F |
| `const` | C / C / F | C / C / F | C / C / F | C / C / F |
| `enum` | C / C / F | C / C / F | C / C / F | C / C / F |
| `pattern` | F / F / F | F / F / F | F / F / F | F / F / F |
| `format` | F / F / F | F / F / F | F / F / F | F / F / F |
| `uniqueItems` | C / F / F | C / F / F | C / F / F | C / F / F |
| `required` | C / F / F | C / F / F | C / F / F | C / F / F |
| `dependentRequired` | 0 / F / F | 0 / F / F | C / F / F | C / F / F |
| `dependencies` | C / F / F | C / F / F | 0 / F / F | 0 / F / F |
| `dependentSchemas` | 0 / F / F | 0 / F / F | C / F / F | C / F / F |
| `properties` | C / F / F | C / F / F | C / F / F | C / F / F |
| `patternProperties` | F / F / F | F / F / F | F / F / F | F / F / F |
| `additionalProperties` | C / F / F | C / F / F | C / F / F | C / F / F |
| `unevaluatedProperties` | 0 / F / F | 0 / F / F | F / F / F | F / F / F |
| `items` | C / F / F | C / F / F | C / F / F | C / F / F |
| `prefixItems` | 0 / F / F | 0 / F / F | 0 / F / F | C / F / F |
| `additionalItems` | C / F / F | C / F / F | C / F / F | 0 / F / F |
| `unevaluatedItems` | 0 / F / F | 0 / F / F | F / F / F | F / F / F |
| `propertyNames` | C / F / F | C / F / F | C / F / F | C / F / F |
| `contains` | C / F / F | C / F / F | C / F / F | C / F / F |
| `minContains` | C / F / F | C / F / F | C / F / F | C / F / F |
| `maxContains` | C / F / F | C / F / F | C / F / F | C / F / F |
| `allOf` | C / F / F | C / F / F | C / F / F | C / F / F |
| `anyOf` | C / F / F | C / F / F | C / F / F | C / F / F |
| `oneOf` | F / F / F | F / F / F | F / F / F | F / F / F |
| `not` | F / F / F | F / F / F | F / F / F | F / F / F |
| `if` | 0 / F / F | C / F / F | C / F / F | C / F / F |
| `then` | 0 / F / F | C / F / F | C / F / F | C / F / F |
| `else` | 0 / F / F | C / F / F | C / F / F | C / F / F |
| `$ref` | C / F / F | C / F / F | C / F / F | C / F / F |
| `$dynamicRef` | 0 / F / F | 0 / F / F | 0 / F / F | F / F / F |
| `$recursiveRef` | 0 / F / F | 0 / F / F | F / F / F | 0 / F / F |
| `$defs` | 0 / F / F | 0 / F / F | 0 / F / F | 0 / F / F |
| `definitions` | 0 / F / F | 0 / F / F | 0 / F / F | 0 / F / F |
| `$boolean` | C / 0 / F | C / 0 / F | C / 0 / F | C / 0 / F |
| `$vocabulary` | F / F / F | F / F / F | F / F / F | F / F / F |
| `contentSchema` | 0 / F / F | 0 / F / F | 0 / F / F | 0 / F / F |
| `<unknown>` | F / F / F | F / F / F | F / F / F | F / F / F |
| `$id` | 0 / F / F | 0 / F / F | 0 / F / F | 0 / F / F |
| `$anchor` | 0 / F / F | 0 / F / F | 0 / F / F | 0 / F / F |
| `$dynamicAnchor` | 0 / F / F | 0 / F / F | 0 / F / F | 0 / F / F |
| `$recursiveAnchor` | 0 / F / F | 0 / F / F | 0 / F / F | 0 / F / F |
| `$comment` | 0 / F / F | 0 / F / F | 0 / F / F | 0 / F / F |
| `title` | 0 / F / F | 0 / F / F | 0 / F / F | 0 / F / F |
| `description` | 0 / F / F | 0 / F / F | 0 / F / F | 0 / F / F |
| `default` | 0 / F / F | 0 / F / F | 0 / F / F | 0 / F / F |
| `examples` | 0 / F / F | 0 / F / F | 0 / F / F | 0 / F / F |
| `deprecated` | 0 / F / F | 0 / F / F | 0 / F / F | 0 / F / F |
| `readOnly` | 0 / F / F | 0 / F / F | 0 / F / F | 0 / F / F |
| `writeOnly` | 0 / F / F | 0 / F / F | 0 / F / F | 0 / F / F |
| `contentEncoding` | 0 / F / F | 0 / F / F | 0 / F / F | 0 / F / F |
| `contentMediaType` | 0 / F / F | 0 / F / F | 0 / F / F | 0 / F / F |
| `$schema` | 0 / F / F | 0 / F / F | 0 / F / F | 0 / F / F |

**Schema audit totals:** 139 cells with per-predicate cuts; 530 fail closed; 99 contain no effective rejecting predicate. These are bounded audit cells, not 139 distinct keyword types. Every automatically cut assertion has exactly one predicate; a cell may contain several separately inventoried assertions. Typed assertions under negation are unclassified because their applicability domain is an additional acceptance requirement. Legacy implicit contains counts are separately tested for both dialects, including ignored explicit count spellings. Homogeneous draft-07 ignored ref siblings and eager dormant refs retain their controls.

### Python refusal and condition audit

Each supported specimen runs its complete two-predicate flip/peer/restoration matrix. Every unsupported specimen retains an unclassified candidate. Mutating list/refusal examples also run independent held-out y cases in the main corpus.

| Construct | Inventory / cut | Result |
|---|---|---|
| `raise` | 2 individual Boolean/refusal predicates; each peer retained | PASS |
| `return-False` | 2 individual Boolean/refusal predicates; each peer retained | PASS |
| `return-None` | 2 individual Boolean/refusal predicates; each peer retained | PASS |
| `return-bare` | 2 individual Boolean/refusal predicates; each peer retained | PASS |
| `return-zero` | 2 individual Boolean/refusal predicates; each peer retained | PASS |
| `return-float-zero` | 2 individual Boolean/refusal predicates; each peer retained | PASS |
| `return-empty-string` | 2 individual Boolean/refusal predicates; each peer retained | PASS |
| `return-list` | Unknown predicate count; unsupported seam, no registration | FAIL |
| `return-dict` | Unknown predicate count; unsupported seam, no registration | FAIL |
| `return-set` | Unknown predicate count; unsupported seam, no registration | FAIL |
| `return-and` | 2 individual Boolean/refusal predicates; each peer retained | PASS |
| `return-or-not` | 2 individual Boolean/refusal predicates; each peer retained | PASS |
| `return-chain` | Unknown predicate count; unsupported seam, no registration | FAIL |
| `return-conditional` | Unknown predicate count; unsupported seam, no registration | FAIL |
| `return-name` | Unknown predicate count; unsupported seam, no registration | FAIL |
| `return-negated-name` | Unknown predicate count; unsupported seam, no registration | FAIL |
| `conditional-compound-return` | Unknown predicate count; unsupported seam, no registration | FAIL |
| `implicit-falsy-return` | Unknown predicate count; unsupported seam, no registration | FAIL |
| `require-chain` | Unknown predicate count; unsupported seam, no registration | FAIL |
| `opaque-helper` | Unknown predicate count; unsupported seam, no registration | FAIL |
| `extend` | Unknown predicate count; unsupported seam, no registration | FAIL |
| `iadd` | Unknown predicate count; unsupported seam, no registration | FAIL |
| `slice-assignment` | Unknown predicate count; unsupported seam, no registration | FAIL |
| `insert` | Unknown predicate count; unsupported seam, no registration | FAIL |
| `item-assignment` | Unknown predicate count; unsupported seam, no registration | FAIL |
| `append-clauses` | 2 individual Boolean/refusal predicates; each peer retained | PASS |
| `require-clauses` | 2 individual Boolean/refusal predicates; each peer retained | PASS |
| `assert-clauses` | 2 individual Boolean/refusal predicates; each peer retained | PASS |

**Python audit totals:** 12 supported per-predicate constructions; 16 fail closed. Earlier corpus cases also cover class/nested/module/consumed-result guards, mixed/nested Boolean negations, exact append clauses and helper composition. Async functions, match/try/with/await/yield contexts, mutation/dataflow and opaque calls require explicit seams. Fresh empty-list initialization and the listed read-only value grammar create no new rejection predicates; function fallthrough is an explicit falsy-return obligation. A returned local is never assumed to be a single predicate.

### Verification and real adapter result

`python3 -B scripts/pm_guard_isolation.py --self-test` exits **0; 124/124 caught**: all 86 old traps and 38 new entries. The reviewed base catches **87/124**, comprising the old 86 and only the independent regex-witness control among the new entries. All 37 other new entries expose missing capability or a former false clearance on the reviewed base. The older trap sources and target predicates were preserved; exact inventory-size assertions now permit additional conservative obligations while still requiring their named offending sites. The fixture adapter explicitly declares successful returns and the error-list carrier with source evidence.

The untouched Astra producers run serially (all driver exits 0). DCH C8-B1, DC C4-B3, uncaught exceptions, dormant unresolved refs, closed dynamic/mixed and compound-not controls remain FAIL; the DFM schema-group control remains PASS. The original chained-expression, return-form and pattern drivers stop their affected probe when registration/cutting is refused, instead of yielding a misleading PASS; the committed regressions run every individual variant and the aggregate attempts independently. All resource counterexamples are closed by direct injected tests. The independent result audit passes **136 assertions**. Toy adapter and syntax checks pass; the 1 MiB RSS cap refuses as expected. Full commands/exits are in `final-checks.json`.

`pm-shard-plans.py --check --config Plans/sharding_config.json` exits **0/PASS**, 99 documents and 3,095 shards. `pm-plan-index.py validate` exits **1**, parsed top-level **fail**, with the same **22** findings (21 malformed removal-ledger records plus PLS-025 against newer origin/main). Every named finding path, owner Markdown, checker, protected and derived path is unchanged from this task's pinned base. All 15 ignored currentness inputs hash-match the shared source. No regeneration or governance check/reseal was performed.

The unchanged real reviewer adapter and checker/fixtures remain pinned at `ff6d98d8740eff0df68a44f5d4eca0894c4fdf41`. Its callback executes the retained reader `history_contract` → `record_contract` → historical Storage verification with the original format and physical integer choices.

| Family | Overall / exit | Inventory | Rows | Evaluations | Selected proved | Unproved schema/extension | Unclassified code | Unproved total (prior) |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `plugin.loaded` | FAIL / 1 | 12,007 | 403 | 3,642 | 7/7 | 425 | 730 | 1,155 (649) |
| `plugin.hook.invoked` | FAIL / 1 | 12,013 | 410 | 3,705 | 7/7 | 431 | 730 | 1,161 (655) |
| `auth.github.authenticated` | FAIL / 1 | 12,031 | 427 | 3,858 | 7/7 | 447 | 730 | 1,177 (671) |

**21/21 selected runtime guards still proved**, across **1,240 rows / 11,205 evaluations**. Each selected row has one own flip, all six peers unchanged, restoration and accepted controls. No masking or unexpected checker results. No schema row receives proof credit.

The complete results stay **FAIL**. Each module exposes 730 undispositioned code candidates instead of 230. Six formerly unreachable unknown metadata keyword occurrences per catalog now remain unclassified too. Former schema cuts for unsupported grammar also become explicit unclassified obligations. Total unproved rises from **1,975 to 3,493**. The supported-row count drops from 1,306 to 1,240; those unsupported rows receive no cut credit. This is the intended rule change, not new product failure or complete adoption. Distinct consumer/input bindings and all remaining obligations still need lane/reviewer work.

**Scope:** no owner Markdown, registry, admission, Decision Log, Spec Lock, auto-decisions, generated shards/index/evidence or .gitignore edits. No ids minted, pm-mail, subagents or main push. Only tool scripts, trap data and compact reports changed. No general prover, automatic chain normalization, regex clause splitter, resource sandbox, full lane adoption or family grade is claimed.

**Round-3 evidence:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/fix3/verification-manifest.json`, SHA-256 `2c8149b96f36b983ada12c4d1761004cff818c1cd6792776c2322c4e36fe7f1f`. The full trap reports, untouched Astra producer copies and rerun outputs, currentness receipt, pinned source fingerprints, serial command records, complete DG6B matrices and independent result audit are retained there. Report/guide/self-grade are copied to the requested drafts/GUARDTOOL folder. The temporary input tree and fix worktree are removed after the final push.

## Review round 4: findings and responses

**Base:** `68fd9b0b043831ef84b1b125d6f7d59b254dbb2d`. **Core fix:** `c34dddebc5b33465fa8b94c1ab5146137d51dc23`. **Refusal-value consistency follow-up:** `6998371fbe90d3f9ec32e98fdaccb7423966a615`. Capability remains **PARTIAL before and after**: unsupported grammar stays unclassified and cannot receive automatic isolation credit. No family, admission, owner contract or PlanUnit ID is added. No governance or generated plan artifact is edited.

| Finding | Where / why / fix | Verify |
|---|---|---|
| **C4-B1 — fixed** (`c34dddebc5`) | `scripts/pm_guard_isolation.py:314`. The old value grammar admitted tuple/list elements recursively and cut the enclosing comparison as one predicate. Comparison operands now use the scalar-only positional policy. Tuple/list/set/dict displays, starred values, comprehensions, slices, conditional/arithmetic/opaque expressions fail closed. No structured equality receives an automatic whole-value cut. Symbolic scalar reads retain their explicit reviewer binding requirement. | `--self-test`: four `C4-tuple/list-return/raise` entries and `C4-tuple-comparison`. Every entry attempts both the single-x and truthful aggregate registration, with independent x-only/y-only witnesses. |
| **C4-B2 — fixed** (`c34dddebc5`) | `scripts/pm_guard_isolation.py:1048, :1161`. Discovery retained only the last if condition, dropping while and other ancestors. It now checks actual ancestry against the controlling-context policy before registration. While, for, try/except, with, match, async, else and nested paths without a verified cut are unclassified. Refusal values inside those paths cannot be registered or credited independently of their controls. | `--self-test`: six `C4-while-return-*` spellings, `C4-while-early-return` and nine additional control-context specimens. Both direct and nearer-if-hidden while refusals are blocked. |
| **Generated census and gate — fixed** (`c34dddebc5`) | `scripts/pm_guard_isolation.py:270, :1730`; generated `reports/event-authority-20261105/GUARDTOOL-PYTHON-CENSUS.json`. Rows come from the running interpreter's concrete classes under all seven requested ast bases, rather than from sample programs or the reviewed policy's keys. Every node × position cell names a reviewed cut rule or fails closed. The gate checks for missing classes/positions and obsolete names in both directions; AstGuards construction also refuses a failing gate. | Three census traps: inject a new live statement class, remove While's controlling-context classification, and name a nonexistent class. Each makes self-test FAIL before traps and refuses AstGuards construction. |
| **Positional refusal-value constraints — fixed** (`6998371fbe`) | `scripts/pm_guard_isolation.py:1098`. Apply the census's fixed scalar payload constraint to assert messages, raise constructors and refusal/helper arguments. Compound or opaque payloads cannot evade the condition/operand policy. | `C4-scalar-boundaries`: 28 operand-side refusals, three accepted scalar grammar controls and six unsupported payload registrations; all caught. |

### Generated Python construct census

Generator: **CPython 3.14.4**, `3.14.4 (main, Aug 20 2026, 10:41:58) [GCC 15.2.0]`. The committed JSON contains the complete generated table, each rule, cut strategy and runtime constraint. The explicit policy classifies known classes; it is not the source of the discovered census. A newly discovered class is an error in all five positions until reviewed. A supported cell is conditional on its named grammar rule, not blanket support for that AST class. Wrapper/view/initialization rules retain their enclosing predicate cuts and add no independent rejection predicate.

| Position | Supported with named rule/cut | Fail closed | Total |
|---|---:|---:|---:|
| Controlling context | 3 | 79 | 82 |
| Condition | 21 | 61 | 82 |
| Comparison operand | 8 | 74 | 82 |
| Refusal value | 11 | 71 | 82 |
| Accumulator write | 4 | 78 | 82 |
| **Total: 82 classes × 5 positions** | **47** | **363** | **410** |

Class bases: 28 statements, 29 expressions, two Boolean operators, ten comparison operators, four unary operators, one exception handler and eight patterns. Every row and every position is classified. To regenerate, import `pm_guard_isolation` with `scripts` on sys.path and JSON-encode `python_construct_census()`; the final verification checks equality with the committed table.

**Gate demonstration:** `fix4/demonstrate-gate.py` copies the final engine and companion to a scratch directory, injects `ast.Round4UnclassifiedExpression`, and invokes the actual CLI `--self-test`. It exits **1**, reports **FAIL**, runs zero traps, and lists all five missing position classifications. The same engine without injection passes. The in-corpus gate tests also detect a single missing position and a classified-but-nonexistent class. Injection patch and raw output are retained; the temporary copied engine is removed.

### Regressions and Sol's cycle-4 rerun

**141/141 traps caught: 124 existing + 17 new.** The new rows are the ten exact counterexamples, both adversarial blocker entries, three census gates and two grammar-boundary audits. Each of the twelve source reproductions includes a single-negative/held-out-peer attempt and a truthful two-negative aggregate attempt. All **24 attempted proof reports FAIL/unproved** and all registrations are refused. Baselines still accept the control and reject each isolated defect. Independent narrow x-only and y-only sources yield `[true,true,false]` and `[true,false,true]`, against the original `[true,false,false]`. No unsupported cut is executed or credited. One older assigned-class-append test now locates its exact append candidate instead of assuming it is the first row; its refusal, enclosing identity, inventory and unproved assertions remain intact after class-context obligations were added.

Sol's six producer/audit scripts were copied from `reviews/GUARDTOOL-sol/cycle4/` into `fix4/cycle4/`, with the three final checker-read inputs copied into its scratch tree. Original source scripts are unchanged. Primary/extra/boundary producers exit **0**. The original adversarial and counterexample drivers stop at the now-refused while and structured-comparison registrations; the audit's byte-equality assertion stops because positional reason metadata changed; the original result verifier stops at its old 36-entry expectation. These exit-1 results are retained and are not reported as completed subcase coverage.

The scratch-only expectation patch preserves the source callbacks, controls, defects and independent narrow witnesses. It catches refused registration so every specimen runs, expects FAIL/unproved instead of false PASS, updates the supplemental count, compares unchanged Python outcomes/matrices while allowing new reason metadata, and records the narrowed for-loop boundary. Adapted rerun:

| Check | Result |
|---|---|
| Expanded counterexamples | **10/10 complete; 20 single/aggregate reports FAIL; zero false PASS** |
| Fresh adversarial specimens | **29/29 closed or independently proved**; both former blockers refuse registration |
| Supplemental Astra/new traps, excluding two audits | **53/53 caught** |
| Schema audit | **139 supported / 530 fail closed / 99 zero-predicate**, unchanged; all 99 zero cells still accept 99 samples and retain their contextual reasons |
| Earlier behavioral Python audit | **12 supported / 16 fail closed**, unchanged outcomes and proof matrices; this bounded sample table is supplemented by the generated census |
| Adapted Sol evidence verifier | **123 assertions PASS**, exit 0 |
| Final fix evidence audit | **66 assertions PASS**, exit 0 |

Correct controls remain as observed: DCH/DC/uncaught exceptions FAIL; genuine DFM duplicates PASS; unresolved dormant references fail eagerly. The intentionally dishonest callback, repeated-root and false-alias probes retain their disclosed trust boundary. For-loop code registration is now conservatively refused rather than receiving automatic dynamic-subject credit. No complete-lane or family grade is inferred. The DG6B campaign was **not rerun in round 4**; its round-3 observations remain pinned to that implementation, and affected adapters require fresh proof against this narrower grammar.

### Verification, scope and evidence

Syntax and the example adapter pass; shard verification exits **0**; whitespace check exits **0**. Plan-index validation's parsed top-level status is **fail**, exit **1**, with **29 inherited findings**: 21 ledger-record errors, seven PlanUnits absent relative to the newer fetched origin/main, and one stale readiness artifact. Every named failure input and the index validator is byte-identical to the pinned base (`fix4/scope-and-index-inheritance.json`). The earlier 22-finding observation used an older origin/main. No index regeneration or unrelated repair is made.

Disk/RAM preflight: **98 GB root disk available / 15 GiB RAM available**. Checks run serially, with fresh >=6 GiB gates, the 1,536 MiB RSS setting and a 1 GiB outer address-space limit in Sol's producers. Low-memory messages from the resource regressions use injected samples. The copied repository inputs and injected engine are removed after verification; no browser/server, subagent, pm-mail, main push, owner Markdown, registry, Decision Log, Spec Lock, governance evidence or gitignore change is part of this task. The literal-path worktree removal follows the final branch push.

**Evidence:** `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/fix4/verification-manifest.json`, SHA-256 `3782fcc215df39d665ef241dd0dab69345805d9ba1345f2cbe7fe71cfd0beffd`. It fingerprints the exact raw reports, original/adapted outputs, expectation patch, source manifest, commands/exits and gate demonstration. Report, self-grade, checks, compact traps, guide and generated census are copied to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/` (overwrite). Families and IDs used: **none**.


## Review round 5: findings and responses

**Base:** `26bae8267d5e7f9fa2d92e448ff6056756528766`. **Implementation commit:** `cfafa4f4ed471081bbf11f547903e94f95ea9a35`. **Capability:** PARTIAL before and after. No family, owner contract, admission or PlanUnit ID is added.

| Finding / requirement | Where, cause and fix | Verification |
|---|---|---|
| **C5-B1 — fixed** (`cfafa4f4ed`) | `scripts/pm_guard_isolation.py:1056`. Assertion discovery previously chose the assertion's test before its enclosing condition, so replacing `assert False` erased both field predicates. `_compose_refusal` now constructs one rejection formula for every refusal kind: all enclosing tests with polarity, plus the own acceptance test. A constant refusal under a controller contributes no input atom. Each supported controller leaf has its own target; every component must be supported before any part can register. | Four exact C5 sources; eight single/aggregate reports FAIL/unproved. For the three scalar sources, x-only cuts yield `[true,true,false]`; the tuple source refuses registration. Independent x-only/y-only sources retain `[true,true,false]` / `[true,false,true]`. |
| **Shared composition and execution — fixed** (`cfafa4f4ed`) | `scripts/pm_guard_isolation.py:1172, :1297`. All raise, return, assert, accumulator, refusal-helper and predicate-helper sites now enter the same composition function. Discovery exports `composition` and an exact `cut_target`; one transformer applies the target. The per-kind discovery choice and per-kind cut visitors were removed. Node class, line and column identify the target, including expression wrappers that share coordinates with their calls. | All **141 unchanged old traps** still catch. Single-refusal direct bodies retain atomic cuts. Else/nested paths, unsupported operands, shared multi-statement bodies and controller/nonconstant-own-test compositions are unclassified before registration. |
| **Generated refusal/control cross-product — fixed** (`cfafa4f4ed`) | `scripts/pm_guard_isolation_traps.py:1138, :1204`; refusal kinds are recorded in `python_construct_census()`. Coverage is checked against supported census refusal statement/call positions and all controlling-context classes. The generator exercises every refusal source form across each branch side and all two-deep body/else combinations, placing the two-field condition at the outer test, inner test, or both. | **630 cells**, **24** credited with separate per-atom cuts (**48 cuts**), **606** unclassified. Every baseline accepts its control and rejects both one-field defects. Each credited cut directly admits exactly one defect, retains its peer and passes restoration/control checks. An already-failing suite cannot hide a broad cut. |
| **Extension gates — fixed** (`cfafa4f4ed`) | `scripts/pm_guard_isolation.py:1765`; `scripts/pm_guard_isolation_traps.py:1262`. A new census refusal kind or controlling context without executable coverage fails self-test before traps. | Actual CLI injections for an uncovered kind and a newly supported While context each exit **1/FAIL**, zero traps run. Reintroducing the broad conditional-assert cut also exits **1/FAIL** and specifically fails `C5-composition-cross-product`. The original three census injections still fail as required. |

### Cross-product and trap totals

The matrix is **6 refusal kinds**, represented by **15 forms**, × **14 branch contexts** × **3 controlling forms** (`or`, negated `and`, tuple inequality). FunctionDef is the common function wrapper; Expr is exercised for each applicable standalone call; If supplies the branching paths. The wrapper and branching-class coverage is gated against the live census. Both depth-one sides and every depth-two combination are generated, including the conservatively unsupported boundaries. The supported direct-body constant-refusal cases produce two independently proved cuts. The other cells stay explicitly unclassified. This is bounded executable coverage, not a general Boolean solver.

**148/148 traps caught: 141 unchanged existing + 7 new.** The seven additions are four C5 sources, the generated matrix and two extension-coverage gates. The exact four source strings and independent witness sources match Sol's evidence; no checker, input defect or refusal behavior is weakened. Scalar single-negative attempts FAIL on the remaining unproved peer; truthful aggregate attempts cannot prove the y defect with the x-only cut. Structured comparison remains unclassified, with no credited cut.

The interpreter census remains **82 classes × 5 positions = 410 cells: 47 supported / 363 fail closed** on CPython 3.14.4. The committed table exactly matches runtime generation, including the updated shared-composition constraints and refusal-kind registry.

### Sol's cycle-5 scratch rerun

| Producer / check | Result |
|---|---|
| `recheck-c4.py` | **0**; all **10 exact counterexamples / 20 single-and-aggregate attempts** remain FAIL/unproved; all **29 adversarial cases** complete: 11 correct positive-control PASS, 18 FAIL/unproved. |
| `check-census.py` | **0**; independently matches all 82 classes, the committed census and all three actual CLI fail-closed injections. |
| `supported-cells.py` | **0**; **47/47** exact source combinations complete, **zero false PASS**; all aggregate attempts remain FAIL/unproved. |
| Original `new-counterexamples.py` | **1**, at its obsolete assertion that the x cut accepts both defects. This stop is retained; it is not counted as complete source coverage. |
| Original `verify-results.py` | **1**, assertion 181 expects the former four false-PASS cells. Retained as an obsolete expectation, not a passing verification. |
| Scratch-adapted new-counterexample producer | **0**; all **4 exact sources / 8 reports** complete as FAIL/unproved. Every available x-only cut retains the held-out y defect; unsupported registration remains unavailable. |
| Scratch-adapted Sol evidence verifier | **0**, **435 assertions PASS**; original sources, schemas, baselines, independent narrow witnesses and all outcomes checked. |
| Final fix audit | **0**, **1,551 assertions PASS**; all old trap records unchanged, every matrix cell/cut checked, exact cycle-5 sources preserved, and all four checker inputs match the implementation commit. |

Only scratch producer expectations, registration-refusal handling, and environment paths/revision pins changed. `fix5/cycle5/fix5-adaptation.diff` records these changes. Original producer copies and their nonzero outputs are retained. The state-owned callbacks still execute the exact source checker. Neither correct positive-control PASS nor conservative FAIL/unproved is relabeled as an engine failure. No DG6B rerun or family grade is claimed in this round.

### Checks, scope and evidence

Final self-test, in-memory syntax checks, example adapter, shard verification and whitespace checks exit **0**. The 1 MiB RSS test correctly exits **1/FAIL**. Plan-index validation exits **1**, parsed top-level **fail**, with **28 inherited findings**: 21 invalid removal-ledger records and seven units absent relative to newer origin/main. All named failure inputs, the index validator and every generated index file are byte-identical to this task's pinned base. All 15 ignored currentness inputs match the shared source. No owner/derived regeneration, governance check or reseal is performed.

Preflight: **110 GB disk available / 18 GiB RAM available**. Heavy checks ran one at a time; final logged command boundaries stayed above 6 GiB. Printed low-memory messages are injected resource regressions, not real low-memory events. Only the four checker-read inputs (under 1 MB) were copied into the local experiment scratch tree; their final hashes match the committed inputs, and that tree has been deleted. The fix worktree is removed after the final branch push.

Scope is tool scripts, trap JSON, guide, generated Python census and compact reports only. No owner Markdown, registry, Decision Log, Spec Lock, auto-decisions, governance evidence, generated plan shards/index or .gitignore changes. No ids, subagents, pm-mail or main push.

**Evidence:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/fix5/verification-manifest.json`, SHA-256 `ecb823a8cbbb73fcc30ce0a49cbf5fb01ec21a064acb006d99130c391e291f0b`. The manifest fingerprints all 67 retained raw results, exact scripts, original/adapted outputs, adaptation diff, gate injections, source fingerprints, resource/command receipts, index-inheritance proof and scratch-cleanup receipt. Reproduction restores the four paths in `fix5/input-manifest.json` from `cfafa4f4ed471081bbf11f547903e94f95ea9a35` to its named scratch directory, then runs the copied cycle-5 scripts serially; the original scripts retain their historical expectations, while the explicit scratch adaptation verifies the corrected outcomes. Report, guide, compact self-test, census, checks and self-grade are copied to the requested drafts/GUARDTOOL folder.


## Review round 6: findings and responses

**C6-B1 — fixed.** Complete-path fix: `ff7fb58db46861b403abce778960b91301d2a83c`; zero-read opaque-expression follow-up: `ec841e41cf272c43c829d6a8996a101b735dec4b`. Reviewed base: `830dd79b2dbfe85630cae1861e3f7e39c50b75a4`. The current rule supersedes the round-5 claim about literal refusals: **a constant refusal always has zero own input atoms**, regardless of its control context. Overall capability remains **PARTIAL**; no family grade or admission changes, and no IDs used.

| Finding / rule | Location, cause and fix | Verification |
|---|---|---|
| **C6-B1** | `scripts/pm_guard_isolation.py:1061, :1125`. Lexical ancestry missed the early successful return, then credited the constant suffix. `_preceding_exits` now scans preceding statements in every enclosing block. One simple successful-return branch supplies its negated fallthrough condition and separate input-atom cuts. | All 48 exact review cell/mode variants plus the minimal source's two attempts. Every available x cut has `[true,true,false]`; independent y cuts have `[true,false,true]`. Zero broad cuts, zero broad proved rows. |
| **Zero-own-atom invariant** | `scripts/pm_guard_isolation.py:1209, :1234, :1259`. Constant assertions, raises, falsy returns, fixed accumulator writes and helper calls contribute zero atoms. Candidate credit requires a transparent test reading a checked parameter. Literal terminal success returns have count 0 and no cut. Zero-atom refusals remain unclassified; no fixed-refusal deletion cut is emitted. | 42 fixed/constant-only specimens refuse registration. Opaque no-argument calls in returned, asserted and helper predicates also refuse; lack of an explicit input read never certifies an unknown expression as constant. |
| **Complete path or fail closed** | `scripts/pm_guard_isolation.py:1061`. Simple preceding rejecting exits have exact fallthrough tests, recorded as `retained_exit`; their original sites own those predicates and a suffix cut keeps them unchanged. Unknown exits, unconditional preceding exits and unsupported control contexts poison the suffix before registration. | Generated early raise, elif, continue, break, except-return and two-exit contexts; ten additional loop/while/try/finally/with/match/nested/opaque/unconditional suffix probes. Exiting assertions and declared predicate/refusal helpers are included in path discovery. |
| **Generated regression and gates** | `scripts/pm_guard_isolation_traps.py:1138, :1172, :1231, :1347`. The cross-product now includes seven preceding-exit contexts for every refusal form and controlling form. Every credited vector is checked before the suite status. | Missing exit coverage fails before traps. An injected constant assertion cut fails with `[true,true,true]`, even though another obligation makes the suite FAIL. The prior census/kind/context gates and shared-entry poison checks still pass. |

### Generated matrix at the final implementation commit

**15 refusal forms × 21 contexts × 3 controlling forms = 945 cells**, covering all six refusal kinds. The three forms remain disjunction, negated conjunction and structured inequality. All original sources and both isolated defects execute; each supported target has two separate peer-preserving cuts. The earlier refusing exits remain in place. Credited target rows do not imply a whole-suite PASS when other source sites remain unclassified.

| Context | Generated | Credited with per-atom cuts | Verified cuts | Unclassified |
|---|---:|---:|---:|---:|
| Original 14 lexical contexts | 630 | 24 | 48 | 606 |
| Early successful return | 45 | 24 | 48 | 21 |
| Early raise | 45 | 24 | 48 | 21 |
| Elif chain | 45 | 0 | 0 | 45 |
| Early continue | 45 | 0 | 0 | 45 |
| Early break | 45 | 0 | 0 | 45 |
| Return in except | 45 | 0 | 0 | 45 |
| Two preceding exits | 45 | 0 | 0 | 45 |
| **Total** | **945** | **72** | **144** | **873** |

**201/201 traps caught:** all **148 old records are unchanged**, plus 48 exact C6-B1 cell/mode variants, one minimal-source trap with both attempts, one 42-cell zero-atom regression, one unknown-path/opaque-expression regression, and two exit-coverage/constant-cut gates. Single-negative attempts can prove the x atom while the held-out y still rejects. Truthful aggregate attempts cannot prove both field defects under one cut: only x flips and the aggregate row is unproved. All 12 fixed-refusal forms retain independent narrow source witnesses. The generated census remains **82 classes × 5 positions = 410 cells; 47 bounded supported / 363 fail closed** on CPython 3.14.4; its committed JSON matches runtime generation.

### Sol cycle-5 and cycle-6 scratch reruns

Both campaigns ran serially against fresh copies of the final implementation's four pinned inputs (**430,307 bytes**), under the reviewers' 1 GiB address-space limit and 1,536 MiB sampled RSS gate. Original producer scripts are retained byte-for-byte in `fix6/cycle5-original/` and `fix6/cycle6-original/`. Scratch-only adaptations and complete diffs are retained beside their results. They update revision/path pins, historical false-PASS assertions, candidate selection after atom decomposition, matrix totals and original-24-cell slice selection. They preserve checker sources, callbacks, controls, isolated defects and independent source cuts. No source outcome is manufactured.

| Campaign / check | Exit / result |
|---|---|
| Cycle 5: exact cycle-4 counterexamples | **0**; 10 sources / 20 attempts FAIL/unproved; registrations refused |
| Cycle 5: cycle-4 adversarial set | **0**; 29 complete; 11 valid positive-control PASS, 18 FAIL/unproved |
| Cycle 5: census and CLI injections | **0**; 82 classes / 410 cells match; all three injected entries exit 1/FAIL before traps |
| Cycle 5: all supported census cells | **0**; 47 complete, zero false PASS |
| Cycle 5: four exact C5-B1 sources | **0**; eight single/aggregate attempts FAIL/unproved, all available x cuts preserve y |
| Cycle 5 evidence auditor | **0**; **435 assertions PASS** |
| Cycle 6: C5-B1 recheck | **0**; four exact sources / eight attempts remain FAIL/unproved |
| Cycle 6: cross-product and shared-route poison | **0**; 945 cells, 144 verified cuts; all 15 forms become unregistrable when shared composition is poisoned |
| Cycle 6: original 24 cells × seven fresh variants | **0**; 168 cases, zero broad cuts; 24 valid decomposed PASS controls, 144 FAIL/unproved |
| Cycle 6: actual CLI coverage/semantic injections | **0**; all four injected entries exit 1/FAIL as required |
| Cycle 6 evidence auditor | **0**; **5,145 assertions PASS** |
| Cycle 6: early-success-return probe and blocker auditor | **0 / 0**; all 48 attempts have zero broad cuts; **515 assertions PASS**, including both minimal reports and 12 independent witness forms |
| Independent final audit | **0**; **4,010 assertions PASS**; exact old corpus preservation, exact review sources, full Cartesian reconstruction, each cut vector and protected-scope invariance |

### Scope, resources and remaining limits

Python syntax and the example adapter pass. The 1 MiB RSS probe refuses as expected. Shards pass without regeneration. Plan-index validation exits **1**, parsed top-level `status=fail`, with **28 findings exactly matching fix5**; all 28 named/checker/index inputs match the reviewed base. `fix6/index-inheritance.json` records that comparison. No owner Markdown, registry, Decision Log, Spec Lock, governance evidence, generated shards/index or gitignore changed. No standard governance reseal or complete DG6B adoption is claimed.

Preflight: **106 GB disk / 19 GiB available RAM**. Heavy checks ran one at a time. Review scripts kept fresh RAM samples, the six-GiB floor and their outer address-space limit. Self-test low-memory messages are synthetic resource regressions. A small subprocess launcher avoids inheriting the harness's unrelated RSS high-water mark; the RSS gate stays enabled. Unknown flow, dataflow, non-scalar expressions, helper/source closure and checked-input bindings retain the documented adapter/reviewer boundary.

**Evidence:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/fix6/verification-manifest.json`, SHA-256 `e2188a82208af05e831c8b65038549c8790cf93f0db44cd6deeb8abfccc9c33e`. The manifest fingerprints 118 retained raw scripts, results, adaptations, command/resource receipts, review/source fingerprints and cleanup records. Reproduction restores the four paths in `fix6/input-manifest.json` from `ec841e41cf272c43c829d6a8996a101b735dec4b` to its named scratch tree, then runs the copied scripts serially. Their original sources remain unchanged in the `*-original/` directories. Runtime scratch was hash-verified and removed. Report, self-grade, checks, compact self-test and census are copied to the requested `drafts/GUARDTOOL/` directory. The branch alone is pushed; main is never pushed.
