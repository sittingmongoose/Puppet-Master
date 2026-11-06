# GUARDTOOL — shared check-11 machinery

Current implementation: **Method B: guard tables**, at the end of this report. Earlier Python rewrite/clone claims below are historical lineage.

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

## Review round 7: findings and responses (lead fix, 2026-11-05)

**C7-B1 (`reviews/GUARDTOOL-sol/REVIEW-cycle7.md`): under `python -O`, cloning an `optimize=0` checker deleted its untouched assertions, so an x-only cut admitted both defects.** Fixed by the stream E lead as a small review fix.

- `scripts/pm_guard_isolation.py`:
  - `AstGuards.__init__` refuses to run when `sys.flags.optimize` is non-zero.
  - For every function whose bytecode changes under optimization (assertions or `__debug__`), `_require_unoptimized()` requires the supplied original to equal the `optimize=0` compilation of its source; otherwise the run fails closed with `IsolationError`. An absent original is not compared, because its uncut baseline cannot run and fails on its own.
  - `AstGuards.clone()` compiles every cut clone with `optimize=0`, so a clone differs from its original only by the declared cut.
- Traps (`Plans/guard_isolation_traps.json`, probe `round7_probe` in `scripts/pm_guard_isolation_traps.py`):
  - `C7-optimized-original`: an original compiled with `optimize=2` is refused before any cut.
  - `C7-optimized-process`: a subprocess under `python -O` is refused.
  - `C7-clone-keeps-assertions`: the reviewer's exact source; the x-only cut vector is accept / accept / refuse, so the untouched assertion still refuses the y defect.
- Verification: `python3 scripts/pm_guard_isolation.py --self-test` gives **PASS, 204/204 traps** (201 earlier and 3 new). The census gate passes at 82 classes × 5 positions, the coverage gate passes, and the cross-product is 945 cells with 72 verified per-atom credits. `reports/event-authority-20261105/GUARDTOOL-SELF-TEST.json` is updated.

## Review round 8: findings and responses (lead fix, 2026-11-05)

Sol cycle 8 (`reviews/GUARDTOOL-sol/REVIEW-cycle8.md`) showed the round-7 equality check was incomplete. Fixed by the stream E lead.

- **C8-B1: the fingerprint ignored constants.** `_code_fingerprint()` is now a semantic identity: instructions, typed constants (recursively, so `True`/`False`, `0`/`0.0`/`-0.0` and strings differ), names, locals, free and cell variables, argument counts, flags and the exception table. Only source positions are excluded. `_require_matching_original()` now compares **every** undecorated, directly bound original with `_reference_code()`, the `optimize=0`, `dont_inherit` compilation of the supplied source including its own `__future__` imports, whether or not optimization changes it. A mismatch fails closed.
- **C8-B2: an absent original was skipped.** `AstGuards` refuses a module-level `__getattr__`. `clone()` refuses, before any baseline or cut runs, when an undecorated source function is not directly bound in the supplied namespace. Clones compile with `optimize=0`, `dont_inherit=True` and the source's own future flags.
- **Traps (6 new):**
  - `C8-same-source-debug`: a `__debug__` fold at optimize levels 1 and 2 is refused.
  - `C8-nested-constant`: the same fold inside an inner function, a lambda or a generator is refused.
  - `C8-mismatched-operand`: an original whose string operand differs from the supplied source is refused.
  - `C8-dynamic-export`: a module `__getattr__` is refused.
  - `C8-absent-original`: `clone()` refuses a source function absent from the namespace.
  - `C8-matching-original-runs`: the exact original is accepted and its baseline runs.
- **Self-test:** `python3 scripts/pm_guard_isolation.py --self-test` gives **PASS, 210/210**. The census, coverage and cross-product gates are unchanged at 945 cells and 72 credited.

## Review round 9: findings and responses

**C9-B1..B6 — fixed.** Reviewed base: `a342adbe7376692129a750a772a1b2032e898692`. Core implementation: `da85f7f5a1ea355dfde9486293624a1f75467c4f`; annotation-cache/builtin-context completion: `55506a823b423672978136732e82e6010af2608d`. Automatic isolation remains a bounded capability, not a general Python equivalence proof or complete lane adoption. No owner Markdown, IDs, family grades, admission, registry, Decision Log or governance artifacts change.

| Finding | Where, cause and fix | Verification |
|---|---|---|
| **C9-B1 — fixed, both commits** | `scripts/pm_guard_isolation.py:1085, :1633`. Recompilation reevaluated defaults and rebound a foreign global context. Every cut/uncut sibling now uses one `FunctionType` builder with the verified original's defaults, keyword defaults, closure and complete supported metadata/attribute state. Originals must use the declared globals and builtin binding context. | Exact positional/keyword runtime-default cases stay narrow in both proof modes. Both foreign-global cases refuse. Full-state controls verify cached annotations, annotation evaluator, runtime attributes, metadata and default identities. |
| **C9-B2 — fixed, both commits** | `scripts/pm_guard_isolation.py:1075, :1291`. Verification only at construction let later bindings/state diverge. Immutable state snapshots cover every bound Python function, including aliases and declared external helpers. Registration and every clone recheck binding identity, code, defaults, nested state, metadata, annotations, closure cells, AST and supported binding context. | All eight exact post-construction attacks refuse. Eighteen additional mutation classes cover baseline and cut boundaries, including aliases, builtin context, nested defaults, closure cells and cached annotations. |
| **C9-B3 — fixed, core commit** | `scripts/pm_guard_isolation.py:1225, :1722`. Recompiled metadata was observable by untouched guards. A transitive source-subset barrier refuses observing functions and their callers before registration. Local cuts retain every original code field and line table except instructions within the selected atom and an optional Boolean constant append. | All eight reflective metadata cases refuse. Four nonreflective patched-metadata controls retain narrow cuts; the byte-locality control checks the exact changed-byte set and all other code fields. |
| **C9-B4 — fixed, core commit** | `scripts/pm_guard_isolation.py:1024`. `repr(nan)` collapsed physical sign/payload differences. Typed recursive fingerprints now use `struct` bytes for float/complex values, including nested containers/code and interpreter-produced slices; unsupported constants refuse. | All six physical-NaN attacks now have unequal fingerprints and refuse construction. Existing typed int/bool, float/bool and signed-zero cases still refuse. Recursive complex/NaN controls distinguish all four bit patterns. |
| **C9-B5 — fixed, core commit** | `scripts/pm_guard_isolation.py:1633, :1722`. Recompiled equal constants had new identities. Compiled proposal constants are mapped back to original objects; the emitted local cut retains the entire original constant prefix by identity and index. Non-singleton identity observations also poison every dependent candidate. | All six exact tuple/frozenset/NaN-identity cases refuse registration. The full-state control retains tuple, frozenset, NaN and scalar constant objects while its x cut still rejects y. |
| **C9-B6 — fixed, core commit** | `scripts/pm_guard_isolation.py:1085, :1858, :2042`. Sibling rebinding discarded function attributes, and no original/uncut comparison exposed it. Siblings now get full supported state; decorated/stateful dependencies become unclassified. Before any proof row, originals and uncut clones execute the same declared controls and negatives and must return identical complete outcomes. | Both exact `__dict__`-reading sibling cases refuse. Ordinary siblings stay narrow. A separate ordinary attribute-state control retains the flag; injecting an attribute-losing uncut clone aborts before any row. Decorated wrapper/closure controls now refuse conservatively. |

### Code locality and supported subset

The whole cut AST is compiled at original positions with original filename, `optimize=0`, `dont_inherit=True` and source future flags; it is never executed. Its function metadata is restored and equal constants are reused from the original. Compiler-wide branch folding and relocation are not accepted as an excuse to change peers. The backend lifts the verified Boolean edit into the original straight-line expression slots, with NOP padding. Stack balance, branch targets, overlapping spans, code fields and original constant identities are checked. A span that cannot be isolated refuses. Jumps, exception ranges and line tables remain byte-for-byte unchanged. This is stricter than allowing relocated peer instructions in the compiled proposal.

Supported automatic sources are verified, directly bound, undecorated top-level functions with the existing scalar-atom/composition/path restrictions. Refusals apply transitively through sibling/alias dependencies:

- **Refused internal-state reads:** `__code__`, `__defaults__`, `__kwdefaults__`, `__globals__`, `__dict__`, `__closure__`, `__builtins__`, dynamic attribute reflection and traceback/frame internals.
- **Refused reflection:** `inspect`, `traceback`, `sys` reflection, reflective imports/aliases, `_getframe`, and frame/line access.
- **Refused identity/namespaces:** `id`, `globals`, `locals`, `vars`, reflective builtins/aliases, `eval`/`exec`/`compile`, function-object escape and every `is`/`is not` except comparisons against literal `None`, `True` or `False`.
- **Refused callable/state seams:** decorators and dependent callers, callable instances/classes outside the supported interface, external Python functions outside explicitly declared predicate/refusal helpers, opaque function state and generic internals. Declared helpers retain the documented source/atomic-semantics reviewer trust boundary.
- **Annotations:** Python 3.14 lazy evaluators must match the source compilation and contain only literals or unshadowed builtin-type annotations. Original cache entries and evaluator are both preserved; later cache changes refuse. Arbitrary annotation callbacks/expressions and opaque values refuse. CPython wordcode is required; verification used CPython 3.14.4.

The complete guide is `reports/event-authority-20261105/GUARDTOOL-ADOPTION.md`, “Supported Python source and clone fidelity”. Full state does not mean deep-copying defaults or closure cells: those objects and attribute values intentionally remain shared with the original. Mutating verified function state prevents a subsequent clone. Sampled original/uncut controls supplement these static boundaries and do not certify untested helper semantics.

### Regressions and Sol cycle-9 replay

**268/268 traps caught: 210 old + 58 new.** Every old corpus record and `(id, expected, caught)` result is unchanged. The new traps include each of the review's **53 exact case/source/mode combinations**, plus five structural regressions. The older injected constant-cut trap is now caught by the earlier locality verifier; it still cannot receive credit. Syntax and whitespace checks pass.

The generated census remains **82 classes × 5 positions: 47 bounded supported / 363 fail closed**. Coverage passes. The generated matrix remains **945 cells / 72 credited cells / 144 verified per-atom cuts / 873 unclassified cells**. No complete lane or family grade is claimed.

Sol's scripts ran serially from fresh copies of the final implementation's three checker inputs. `fix9/cycle9-adaptation.diff` records changes to revision/path pins, corrected expected observations and registration-refusal handling. Sources, inputs, callbacks, proof modes and independent x-only witnesses are unchanged. Historical broad-cut assertions are replaced by refusal or correct narrow-cut assertions; decorated dependencies now refuse, including previous safe controls. The independent result audit verifies those preserved sources/inputs against the original evidence and matches every probe to a committed trap.

| Check | Exit / result |
|---|---|
| Full CLI self-test, 1 GiB address-space limit and 1,536 MiB RSS gate | **0; PASS, 268/268** |
| Sol cycle-9 design probes | **0; 34/34 safe: 23 refusals, 10 narrow cuts, one masked alias; zero broad credited cuts** |
| Sol cycle-9 constants/closures probes | **0; 19/19 refuse; zero broad credited cuts** |
| Exact cycle-8 replay from Sol's cycle-9 script | **0; all 18 C8-B1 + four C8-B2 cases refuse** |
| Independent source/corpus/outcome audit | **0; 619 assertions PASS** |
| Python syntax and `git diff --check` | **0** |

Only scripts, trap JSON, adoption guide, compact self-test and this report change. No plan owner or derived shard/index edit, governance refresh or main push occurs. No subagents or pm-mail were used. Plan-wide governance and older independent campaigns were not rerun in this targeted round.

### Evidence and resources

Evidence lives at `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/fix9/`. Its verification manifest fingerprints the scripts, adaptation diff, exact results, source/input hashes, resource/command receipts, reports and cleanup records. `input-manifest.json` identifies the three source files at `55506a823b423672978136732e82e6010af2608d`; restore them into its named scratch path to rerun the copied cycle-9 scripts. The result auditor accepts `GUARDTOOL_FIX9_ROOT` when reproducing from a different checkout.

Preflight had **108 GB free disk / 21 GiB available RAM**. Heavy checks ran one at a time. Final full self-test peak checker RSS was **76,896 KiB**, under the 1,536 MiB gate. The final checked command boundaries stayed above **21 GiB available RAM**. Synthetic low-memory regression messages are expected. A fresh subprocess launcher avoids inheriting the harness's unrelated RSS high-water mark. Runtime scratch is hash-verified and deleted; the worktree is removed after the final branch push. Only cited/reproducible evidence remains.

**Round-9 evidence manifest:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/fix9/verification-manifest.json`, SHA-256 `c6d23c71ef7bdf8c25c98a5eec1a3fe60981920ea105365cd344ac2de3a6d95f`.

## Review round 10: findings and responses

**C10-B1 and C10-B2 — fixed in `ec934ef00152fc0542d17c839845e533e364dc25`.** Base: `aafbe6427682eee632c1bc530d5221609ea85bb0`. This round replaces the reflection blacklist with a finite checker interface, preserves the reachable state graph with one memo, and requires original/uncut equality on every declared fixture. It changes only the tool, traps, adoption guide and reports. No owner Markdown, registry, Decision Log, Spec Lock, generated governance artifact or main push is included.

| Finding | Location, cause and fix | Verification |
|---|---|---|
| **C10-B1 — fixed** | `scripts/pm_guard_isolation.py:1113, :1292`. A blacklist missed indirectly obtained reflection and property implementations. `_source_subset` now accepts only named builtin/data methods, literal regex calls, engine Outcome constructors, canonical builtin raises, and direct verified lane helpers. Any other call, attribute, local import or function-object value makes the function and all direct/aliased callers unclassified before registration. The replaced forbidden-name and reflective-name lists are removed. `call_predicates` does not waive source verification. | All four reflective broad witnesses refuse, as do the custom callable/descriptor and `operator.is_` cases. Transitive two-hop caller tests, function escapes, dynamic calls/imports and external-helper declarations refuse. Named positive controls and builtin metadata fallback reads stay narrow. |
| **C10-B2 — fixed** | `scripts/pm_guard_isolation.py:1086, :1232, :1791`. Independent global copies broke aliases; copied globals also lost relationships with original defaults. Each clone now makes one `copy.deepcopy(graph, memo)` call across reachable globals, defaults, keyword defaults, closure contents, attributes and annotation/type-parameter state. Function shells enter the memo first. FIX9's required original default, keyword-default, closure and attribute-value identities are seeded recursively into that same memo for both clone modes. Global aliases reach those retained objects; other global data is copied once. The function attribute dictionary is installed from the graph. Exact builtin state is checked before deepcopy; unsupported objects/hooks refuse. Reachable global snapshots also prevent original execution from changing later clone contexts. | `global-alias-state` and `default-global-shared-state` retain original/uncut `[T,F,F]` and cut `[T,T,F]`, with all alias facts true. The operator-based identity witness refuses under the interface. Structural tests cover defaults/keyword defaults/closures/attributes, aliases of the attribute dictionary, cycles, function aliases, independent unanchored globals, two graph passes for two clones, unchanged original identity ports, live-global mutation and hostile deepcopy hooks. |
| **Every fixture — enforced** | `scripts/pm_guard_isolation.py:2277`. Original and uncut complete outcomes are compared on every control and every negative before cut rows. All comparisons are retained even after a mismatch; expected/checked counts and equality are explicit. A difference aborts before any proof row. | An injected uncut default defect agrees on ten fixtures but differs on the last negative. All eleven comparisons are recorded and no proof row runs. Each executing reviewer case has matching expected/checked counts and identical original/uncut outcomes. |

### Published allow-list

The exact, current table is in `reports/event-authority-20261105/GUARDTOOL-ADOPTION.md`, **Supported Python checker interface and clone fidelity (review round 10)**, and copied verbatim to external `fix10/allow-list.md`. Extensions require a reviewed adapter seam and implementation change.

- **Calls:** `isinstance`, restricted `type(value) is/is not listed_type`, `len`, `int`, `str`, `bool`, `bytes`, `set`, `frozenset`, `tuple`, `list`, `dict`, and `all`/`any` over supported comprehensions. Bindings must be canonical builtins.
- **Types:** `NoneType`, `bool`, `int`, `float`, `complex`, `str`, `bytes`, `list`, `tuple`, `dict`, `set`, `frozenset`. Existing comparison/Boolean/data-expression and atomic-cut restrictions remain. Non-type identity tests use only literal `None`, `True`, `False`.
- **Attributes:** only immediately invoked, explicitly listed methods of builtin `str`, `bytes`, `dict`, `list`, `set`, `tuple`. The guide names every method; arbitrary attribute values, modules, properties, descriptors and function attributes are outside the interface.
- **Regex:** canonical `re.fullmatch`, `re.match`, `re.compile(literal_pattern).fullmatch`, with literal str/bytes patterns and no keyword/dynamic argument expansion. This does not grant atomic credit to a multi-clause regex.
- **Helpers:** direct calls to same-module source functions, including aliases; every helper must pass the same checks. Unknown/external helpers, including declared predicate/refusal helpers, need a reviewed source/adapter seam.
- **Named necessities:** engine `Outcome.accept/refuse`; canonical builtin `ValueError`, `AssertionError`, `TypeError`, `RuntimeError`, `KeyError`, `Exception` constructors directly in `raise`. The builtin `object` value is retained for annotations; calling it is unsupported.

The graph memo preserves required original identities rather than retaining defaults while independently copying their global aliases. Retained mutable identity ports remain shared with the original in both modes. A mutation of verified function or reachable global state prevents later cloning. Opaque classes, subclasses and copying hooks cannot silently define clone behavior. This remains a bounded planning checker, not a general Python equivalence proof, complete lane adoption or family grade.

### Regressions and updated expectations

**305/305 traps caught: 268 existing + 37 new.** The 37 comprise all **33** new cycle-10 cases (nine attacks and 24 fidelity controls), plus four structural regressions. The existing 53 exact cycle-9 cases remain in the corpus. No old trap ID is removed.

Four old corpus records have updated descriptions:

| Existing record | Response |
|---|---|
| **C6-unknown-paths** | Unknown paths may now refuse through the finite interface before the older preceding-exit rule; registration must still refuse. |
| **C9-sibling-original-alias-control-single** | A memoized function alias now receives the same narrow cut as its canonical name. Formerly safe masking becomes a valid x-only flip; y still rejects. |
| **C9-full-state-locality** | The description explicitly retains the required original identity ports in both modes; its original identity/locality assertions still pass. |
| **C9-original-baseline-gate** | Its old `peer.enforce_y` observer is now outside the interface. A permitted runtime default is deliberately corrupted in the uncut clone instead; the last negative exposes the mismatch before any proof row. |

Five synthetic `Refusal` fixture bindings now use canonical builtin `ValueError` rather than an external exception subclass. Guard predicates, refusal strings and the duplicate/masking assertions remain intact. The mixed-negation and Python construct-audit helper-credit fixtures now include the helper's source; a new regression verifies that merely declaring an external helper cannot earn credit. These are explicit finite-interface fixture adaptations, not a claim that arbitrary exception classes or external helpers are supported.

The generated interpreter census remains **82 classes × 5 positions: 47 bounded supported / 363 fail closed**, with coverage PASS. The generated composition matrix passes at **945 cells / 60 credited cells / 120 verified per-atom cuts / 885 unclassified cells**. The twelve cells formerly credited through external helpers without included source now correctly remain unclassified; their 24 automatic cuts are removed.

### Sol cycle-10 replay and independent audit

All scripts ran serially against the final implementation. The copied scripts retain every original source, input, preparation and proof mode. `cycle10-adaptation.diff` records path/revision changes and the alias control's corrected narrow-cut expectation. No held-out peer was dropped.

| Check | Exit / result |
|---|---|
| **Full CLI self-test** | **0; PASS, 305/305** |
| **Nine cycle-10 attacks** | **0; seven refusals, two narrow cuts; zero broad credits and zero changed uncut baselines** |
| **24 cycle-10 fidelity controls** | **0; 19 refusals, five narrow executions; all 24 safe** |
| **34 replayed design probes** | **0; 23 refusals, eleven narrow executions, including the now-coherent alias** |
| **19 replayed constant/closure probes** | **0; all refuse** |
| **Independent observation/source/byte-span audit** | **0; 1,297 assertions PASS** |
| **Python syntax and whitespace** | **PASS** |

Across all **86** reviewer cases: **68 refusals, 18 narrow executions, zero broad credits, zero changed uncut baselines, zero reviewer errors**. The independent audit compares exact sources/inputs/modes against Sol's originals, matches new corpus entries, checks original default/keyword-default/closure identities in both clone modes, verifies alias facts and all-fixture counts, and independently disassembles the reference source to confine changed code bytes to x's expression span. No earlier independent campaign or repository-wide governance check is claimed.

### Evidence and resources

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/fix10/`. `input-manifest.json` pins the three executable inputs to implementation commit `ec934ef00152fc0542d17c839845e533e364dc25` with sizes and SHA-256 values. The copied reviewer scripts, adaptation diff, command/resource receipts, full self-test, compact summary, guide and allow-list are retained there. Restore the pinned inputs and set the copied `common.py` SCRATCH path to reproduce after worktree removal.

| Evidence | SHA-256 |
|---|---|
| **`fix10/self-test.json`** | `c754c7e27c1d81c82381c886bd751e64dcecddff3bebe416ef155aef5c6816f2` |
| **`fix10/result-audit.json`** | `0a9afa768492b4577ef9e937818ab87008faaf4fed1d6ce5c7ea76680b9e570a` |
| **`fix10/allow-list.md`** | `6c7b537fcaec3fd3e060b2de18d2b83aec82232bea13bfb37776af8f7f1f44ee` |

Preflight: **125 GB disk available / 14 GiB RAM available**. Heavy checks ran one at a time with a **1 GiB address-space limit**, **1,536 MiB RSS gate** and fresh **6 GiB available-memory checks**. The final self-test's peak checker RSS was **77,132 KiB**; its real command-boundary available memory was **16,167,723,008 / 17,228,996,608 bytes**. Low-memory messages belong to synthetic memory-gate tests. A fresh subprocess avoids the harness's inherited RSS high-water mark. No subagents, pm-mail, browser or server was used. Scratch runs and uncited logs are deleted; the worktree is removed after the final branch push, with the cleanup receipt retained externally.

**Round-10 verification manifest:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/fix10/verification-manifest.json`, SHA-256 `ed2c664eff37256ffeb51b2b2618b913e7626d4c93c7628977ff6a8dc77c0388`. The manifest excludes this report and the later cleanup receipt to avoid circular hashes and permit the final post-push cleanup record.

## Method B: guard tables

**Implementation base:** `e8c4658f1ce2b733aa78d5b33dab0a1324d6362c`. **Branch:** `plans/ea-guardtool-20261105`. This section supersedes the earlier Python proof/census/clone claims. It implements GUARDTOOL-B and pm7-build's B + C choice. Historical round reports above are retained as lineage. No previous Astra NOT_READY is downgraded by the lead's old sweep-item wording.

### API in five lines

```python
Guard(name, Invariant(field_path, predicate_words), refusal_code, predicate)
table = GuardTable(guards); table.require(name, complete_value, context)
factory(value) -> Case(table, original_check, context)  # factory() also supported
Suite(name, factory, controls, negatives, checker_modules, repository_root, duplicates=[], non_guards=[])
report = run(suite); markdown(report)
```

**Python cuts are table swaps.** A cut replaces exactly one `Guard` entry's predicate with always-pass. The original checker, predicate functions, code objects, constants, defaults, globals, closures and model state are never rewritten, recompiled or cloned. Every predicate/control/negative/cut/restoration gets a fresh factory invocation. Fixture data is reconstructed separately without copy hooks or order-changing set copies; dictionary/list aliases and typed scalar bytes are preserved. Mutable state reuse, including repository module/default/closure state, fails. Factories may derive per-input state but cannot repair the frozen fixture.

**The predicate matrix is mandatory.** Every negative is tested against every declared guard in isolation. It must fail its named guard and pass every other guard. Each predicate also sees every control. A failure in another column reports a two-defect fixture or undeclared overlap. A declared duplicate only qualifies after all site-by-site checks pass. Each original complete negative must have its own table-issued guard tag/code, its own single-guard cut must accept, every peer must keep its exact tag/code, and a fresh restoration reruns the whole case set.

**Duplicate credit is site-specific.** All members must declare the same field, predicate and code, with nonempty evidence and a witness. Each single cut still refuses; each member alone still refuses; the joint cut accepts; controls and peers are preserved throughout. A weaker impostor, empty evidence, different invariants or overlapping groups fail. The tool never unions removal sets by code, enclosing expression or site.

**Runtime has no refusal translator.** Only an exception object issued by the active table can be a product refusal. Matching strings/attributes, ordinary exceptions, `False`/`None`/zero/Outcome returns, swallowed table refusals and unknown guard names fail. Predicate exceptions/invalid results and mutation of input/context fail even if caught by the checker. The trace also records handled exceptions and calls into unscanned repository source. Canonical path caching preserves this check through the evidence share's symlink alias; the caught-exception regression exposed and closed an initial raw-prefix shortcut.

**Static scanning grants no cut credit.** It scans the declared checker modules and their repository import closure, including dormant helpers and package initialization. Raises, assertions, non-success or implicit returns, yields, mutation/error-list writes, refusal helpers and uncertain calls outside the exact registered predicate bodies are obligations. Each needs one exact non-guard declaration and a reviewer-checkable pure-computation/plumbing reason. Dynamic code/imports, star imports, unknown statements, nested predicate code, missing predicate source and stale/ambiguous declarations fail closed. Qualified function identities prevent a same-line or comprehension binding from exempting another function. Any safety, inventory, matrix or proof failure withholds all row credit.

### Earlier failure classes and the rewritten corpus

**71/71 expected observations caught.** This is a rewritten Method B corpus, not a claim that all 305 retired rewrite/clone traps were replayed. Each negative trap asserts its own required failure kind, not merely a failing suite. Positive controls include independent same-code rows, genuine duplicates, original set/code/default observations, per-input state factories, and full schema/member/reference proofs.

| Earlier class | Method B evidence |
|---|---|
| Merged predicates / two-defect negatives | `duplicate-distinct-invariants`, `predicate-checks-two-fields`, `two-defect-negative`: declaration refusal or the exact off-diagonal cell fails. |
| Masked/stale-copy negatives | `masked-stale-copy`: the copy guard fails the x witness's off-diagonal cell. No removal row receives credit. |
| Inline raises, returns, asserts and accumulated errors | Twelve static variants include dormant branches, append/extend/augmented/slice/item writes, plus runtime-only refusal controls. |
| Exceptions credited as product refusals | `exception-counted-as-refusal`, `predicate-exception`, forged tags, exit zero and swallowed table refusals fail through their named runtime checks. |
| Duplicate without equivalence proof | Empty evidence and distinct invariant declarations fail; weaker impostor fails its diagonal; a genuine duplicate retains its upper-bound peer. |
| Shared state / missing table guards / no witnesses | Shared context/list/default/imported state, missing entry, missing witness and factory fixture-repair regressions fail closed. |
| Tuple/chained/local/conditional returns, while and suffix assertions (A3, C4–C6) | Seven source-shape regressions now remain static obligations. There is no code-cut path to credit them. |
| Optimization, constants, defaults, function metadata, reflection and clone alias/copy fidelity (C7–C11) | No Python compilation/copy transformation exists. Original set, code and runtime-default observation controls pass; the DG6B example also passes under `-O`. |
| Schema findings from A1/A4/A5 and rounds 3–4 | Required members, bounds, typed membership, legacy contains, conditional branches and reference occurrences are tested. Unsupported pattern/negated/unknown/dormant-ref forms remain fail-closed. |

### Schema preservation

The reviewed `SchemaCatalog`, `SchemaView`, inventory constants and per-keyword/per-predicate mutation implementation are retained. An independent text comparison verifies the whole schema method is identical to the base except for renaming its internal metadata class to `SchemaGuard`. The original vocabulary audit function is replayed unchanged: **768 cells = 139 with individual cuts, 530 fail-closed, 99 with zero effective predicates**. No schema finding is waived.

`schema_table(catalog, selectors, guards=())` exposes these predicates in the same table/report. Each complete schema consumer has a distinct root/input binding; selectors are source-backed and reviewed. `table.validate` invokes the complete original/cut validator and the engine issues its guard tag. Unattributable rejection or an unconsumed declared baseline root fails. The direct schema matrix preserves routing while weakening other supported assertions. Previously unsupported contexts remain unclassified and cannot receive proof credit.

### DG6B worked example and its precise limit

`scripts/pm_guard_isolation_dg6b_example.py` ports the seven retained-history flag invariants from the real `history_contract` at `ff6d98d8740eff0df68a44f5d4eca0894c4fdf41`. Its checked-in runnable example explicitly uses a **synthetic extracted-phase boundary**. `history_case(adapter_check, record_check, storage_check)` retains the wiring for the original complete path.

| Exercise | Result |
|---|---|
| Checked-in example, ordinary Python | **PASS: 7/7 guards; 49 predicate/negative cells; 176 evaluations** |
| Same example under `python -O` | **PASS: 7/7**, using the original functions with that compilation mode |
| Original retained fixtures: `plugin.loaded`, `plugin.hook.invoked`, `auth.github.authenticated` | Each original complete control accepts. Each extracted flag phase proves **7/7**, totaling **21/21 guards and 147 matrix cells**. |
| Unported original complete retained path | **FAIL; zero credited rows.** The static scan exposes **1,132 sites requiring porting or plumbing classification** and factory freshness detects shared mutable state. |

The full original DG6B adapter cannot be made sound merely by wrapping its ValueErrors or retaining its old code mutant. Its remaining product refusals must become table predicates, pure helper/plumbing sites need review, and mutable state/caches need per-case initialization. Those lane changes belong in its sweep round. No complete lane adoption, family twelve-criterion grade or admission is certified here.

### Validation, scope and evidence

Serial verification: **71/71 traps**, normal/optimized worked examples, the three real fixture exercises, the **768-cell schema replay**, and **1,638 deterministic evidence assertions** pass. The **1 MiB RSS** and missing-adapter controls return their expected exit 1. Shard verification and whitespace checks pass. Index validation exits 1 with parsed top-level `status=fail`: **86 inherited findings** (21 invalid removal-ledger records and 65 unit-removal comparisons against newer origin/main). Its inheritance record verifies 32 named inputs and index/checker files unchanged from the pinned base. No index regeneration or unrelated repair is made.

Resource preflight passed at **120 GB disk / 15 GiB available RAM**. Fresh tool/test subprocesses use a **1 GiB address-space cap**, **1,536 MiB RSS gate**, and fresh **6 GiB available-memory checks**. A command-scoped small Git pack window allows read-only pinned-source extraction within that cap; no repository Git settings or history are changed. Limits are sampled, not an allocation sandbox. Freshness uses weak references where possible and retains otherwise non-weak-referenceable mutable state, so large lanes still need complete family/boundary partitions that fit the RSS cap.

**Evidence:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/B/`. `self-test.json`/`.md`, `commands.json`, `result-audit.json`, `schema-vocabulary.json`, `dg6b-summary.json`, complete matrices, reproducible drivers, index inheritance and the final verification manifest are copied there with SHA-256 fingerprints. The report and guide are copied alongside them. Temporary extracted runtime source trees are removed; the worktree is removed after the prescribed branch push.

**Open soundness boundary:** predicates must honestly implement their single invariant; non-guard reasons, complete-path/consumer bindings, duplicate semantic equality and external/native service resets require independent review. A finite matrix cannot prove those declarations. Unsupported forms fail rather than earning automatic credit. This implementation has no independent review waiver.

**Scope:** only tool scripts, the worked example, trap data, adoption guide and report companions change. No owner Markdown, registry, Decision Log, Spec Lock, generated shard/index/evidence, `.gitignore`, admission, PlanUnit IDs, main push, pm-mail or subagents.

**Method B verification manifest:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/B/verification-manifest.json`, SHA-256 `ea6e2021604afc510b5e1e6fe4750a9361f33156b0f7e56f34eb7c2ec372a853`. The manifest excludes this report and post-push completion/cleanup receipts to avoid circular hashes.


## Method B, review round 1: findings and responses

**B1–B5 fixed; none disputed.** Reviewed base: `034c1fd9f7b9bf3c5c006dfd5585db599f87447d`. Core fixes: `457d32baa8caa4d75ae3209523430a0d7b99d762`; source-backed purity instrumentation and actual builtin binding verification: `afdf917fa0f5bbd703b06786d7abf8ed858d0a7c`. Capability remains **PARTIAL**. This section supersedes the original Method B automatic freshness, purity, import-closure and exception-exemption claims where the review found gaps. No independent clearance or event-family grade is inferred.

| Finding | Location / cause / fix | Specific regressions and result |
|---|---|---|
| **B1 — fixed (`457d32baa8`)** | `scripts/pm_guard_isolation.py:1449, :1777`. A static exception declaration previously became a whole-line runtime allowance. The census now records the precise source span and exception operation; runtime disassembly matches that instruction. Exception objects retain their origin/traceback disposition through verified propagation. Another statement, assertion-test/payload error, or undeclared new raise is not exempt. Unknown positions fail closed. | **4 additions:** same-line and separate-line translations each require `runtime_untracked_site` with an actual `ValueError` and zero credit. Exact plumbing propagation is a positive proof control. An undeclared re-raise of the same exception object fails at runtime. Both exact reviewer translations now fail with their required runtime reason while retaining their truthful readiness assertion allowance. |
| **B2 — fixed (`457d32baa8`)** | `scripts/pm_guard_isolation.py:1492`. Freshness skipped classes and builtin bound-method receivers. It now follows class attributes, bases and descriptors, and builtin `__self__`; classes themselves are mutable state. Uncertifiable external, opaque/slotted or custom-access/metaclass graphs raise `state_shared_across_cases`. No state is cloned. | **3 additions:** shared class log and shared bound-list append both require `state_shared_across_cases` on two successive complete runs, with zero credit. An uncertifiable slotted object also fails closed. The exact reviewer sources no longer execute their shared logging checkers. |
| **B3 — fixed (`457d32baa8`)** | `scripts/pm_guard_isolation.py:1186, :1292`. Guessed roots and final-identifier matching missed real imports and loader aliases. Resolve actual loaded origins against Python search/package paths, follow package initializers and from-import bindings, and reject missing, ambiguous or unscannable origins/bindings. Importlib, builtin import and runpy loader provenance survives import and assignment aliases, including predicate bodies. Static scanning runs before freshness rejection so the static obligation remains visible. | **11 additions:** nonstandard `sys.path` helper and ordinary-path control require the dormant imported raise in the static census. Origin/search disagreement, package-relative imports and seven loader-alias forms require static closure/dynamic-import failure. The exact `root/lib/lane_helper.py` is scanned; the review's aliased predicate loader fails statically. No visited branch or runtime catch is needed. |
| **B4 — fixed (`457d32baa8`, `afdf917fa0`)** | `scripts/pm_guard_isolation.py:78, :1041, :1413, :1717`. Sorted value hashes erased dictionary order and alias topology. A separate purity snapshot retains order, aliases/cycles, typed bits and identities, with strong references against recycled IDs. Factory and selector comparisons use it too. Mutation syntax and uncertified predicate calls fail statically; runtime instruction checkpoints catch writes through helpers and temporary writes. Pure builtin calls require their actual original bindings. Unknown data/effects fail closed. | **8 additions:** both review order/alias observations are retained. Their proof suites require purity/protocol failure and zero credit; the uncut raw observations remain `b,a` versus cut `a,b`, and detached versus retained aliases. Context mutation, a mutating helper, temporary restoration, dormant writes, factory order repair and a dormant noncanonical builtin binding also fail for their named reasons. Product number/identity/storage serializers are unchanged. |
| **B5 — fixed (`457d32baa8`)** | `scripts/pm_guard_isolation.py:1041, :1777`. `_in_predicate` only covered nested table calls. Runtime entry now checks the registered function/code/global identities and bound receiver against the authorized engine evaluation frame. Aliases/raw bound calls remain the same known predicate. Direct/internal `_test` entry and nested predicates fail even if lane code catches the exception. | **7 additions:** the exact independent-field and same-field duplicate direct calls require their own `table_protocol_error`; no duplicate or row receives credit. Existing nested-table behavior is retained as a control. Alias, bound-alias, checker-direct and private `_test` calls fail with specific provenance/protocol errors. |

### Serial scratch verification

Four committed checker inputs were extracted from `afdf917fa0f5bbd703b06786d7abf8ed858d0a7c` into `/home/sittingmongoose/pm-scratch/guardtool-bfix1-runtime`; no repository clone, code clone or rewritten checker was used in the proof path. `run-checks.py <scratch>` and `audit-fix1.py <scratch>` in the evidence directory reproduce the run. The input manifest pins every extracted blob by SHA-256.

| Check | Exit / result |
|---|---|
| **CLI self-test** | **0; 104/104 caught**, comprising all **71 unchanged** existing trap records and **33 additions** (B1: 4, B2: 3, B3: 11, B4: 8, B5: 7). Every failing suite has zero credited rows. |
| **DG6B extracted example, normal / `-O`** | **0 / 0; each 7/7 guards, 49 matrix cells, 176 evaluations, 177 factories**. This is the extracted phase, not a complete-family grade. |
| **Review `probe.py`, `probe-more.py`, `probe-purity.py`** | **0 / 0 / 0; all 17 original suites retained**. Sixteen safety/control suites fail with zero credit. The intentionally dishonest single-row predicate remains the documented review/honesty limit and passes its sample, as before. |
| **Evidence auditor** | **0; 467 assertions PASS**: exact review sources and non-guard declarations, all required failure kinds, static closure, runtime failures, repeated-state failures, both state observations, zero credit, unchanged old traps and pinned inputs. |
| **Schema cut preservation** | All five retained segments (`SchemaCatalog`, `SchemaView`, `children`, `schema_copy`, `joined`) are text-identical to the reviewed base. Existing schema traps pass. The separate 768-cell campaign was not rerun. |
| **Syntax / whitespace** | Python parsing and `git diff --check` pass. |

The three probe sources are copied byte-for-byte except for one explicit driver adaptation: `probe-purity.py` catches the newly enforced `IsolationError` around its independent original/cut executions so both observations are recorded instead of aborting the driver. It does not change a checker, fixture, cut or suite result. `probe-purity-adaptation.diff` records the change. Its uncut observations now refuse with the purity error, while the cut accepts; the old sorted value digests remain equal and therefore are not used as purity witnesses.

The review's `runtime-unscanned-helper-control` now fails statically because B3 includes its helper in the closure; its passing input no longer calls unscanned code. The evidence auditor initially expected the old runtime diagnostic and was corrected to require the actual non-exempt static raise. `audit-correction.json` records that expectation correction. The first scratch example exposed synthetic dataclass snapshot methods; `afdf917fa0` replaced them with source-backed methods, preserving the runtime census. The final full scratch run uses that corrected pin.

### Scope, limits and evidence

No owner Markdown, registry, Decision Log, Spec Lock, generated shard/index/evidence or `.gitignore` change. No PlanUnit IDs, event-family grades, governance reseal, main push, pm-mail or subagents. Repository-wide governance/index/shard checks and complete lane adoption were not rerun for this tool-only fix. Unsupported imports, mutable graphs and predicate effects receive no automatic credit; the lane must supply an explicit reviewed supported seam. Predicate honesty, non-guard reasons, complete boundaries, semantic duplicate equivalence and external/native service semantics remain reviewer obligations.

Preflight: **118 GB root disk / 11 GiB available RAM**. Heavy checks ran one at a time in fresh children with **1 GiB address-space caps**, the **1,536 MiB RSS gate** and the **6 GiB available-memory floor**. Final recorded command-boundary memory remained above **12.85 GiB**. The self-test's low-memory message is an injected resource regression. The inherited high-water RSS setup refusal from the first direct harness invocation was avoided by fresh subprocesses with the gate still enabled. Temporary runtime inputs and uncited development outputs are deleted; the detached worktree is removed after the final branch push.

Evidence directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/B-fix1/`. Raw results remain external; repository companions contain compact summaries only.

| Evidence path (relative to that directory) | SHA-256 |
|---|---|
| `self-test.json` | `47b155cf874982d90accff2f96fdb167a9cccc14510407da0f439b41643c24ba` |
| `audit-results.json` | `1b79296b27d0d96c47a2611d9a9d2d66ca3e64fdc154777fd040ba39febbe2ad` |
| `probes.json` | `ad769703a7d33fe873d282092a4b89c2ee52c59fb442f3573b8f4c220f214b06` |
| `probes-more.json` | `7cdb5166d0ba44fdc580d65a6ddb16432171a73ab55e1c4c8f475a4510fc450e` |
| `probes-purity.json` | `755d42b8ef400d9ed4529b855b3ce034d6636a83ffdc92402a303ce958b9c8db` |
| `dg6b-example.json` | `a3eb267a4775f0a3809760e78ee08a60d9fb742296eaf6d488a8e2610b94e28d` |
| `dg6b-example-optimized.json` | `a3eb267a4775f0a3809760e78ee08a60d9fb742296eaf6d488a8e2610b94e28d` |
| `input-manifest.json` | `35bfedc2745cfbab52c21963501f41adfe921fdf7271f8335e423742f3c8479d` |
| `commands.json` | `a2aebda76479dc99f401cad9de54f3e735adf02a4c9ad47fe7cdeea85fbf86bb` |

The verification manifest additionally fingerprints the reproduction drivers, adaptation/correction receipts, report companions and copied response section. Cleanup and final-push receipts are recorded after delivery preparation.

## Method B, review round 2: findings and responses

**C3-B1–C3-B5 fixed; none disputed.** Base: `a9f87e04b0d9e839b039cb04a7ed72a35577ab07`. The snapshot/allowlist/reset/standalone implementation is `21090120781e742ee26f629897a1d51ced969a28`; scalar identity aliases and complete immutable code metadata are retained by `3ddf4a255a`. This section supersedes earlier automatic-state and static-census claims. Capability remains **PARTIAL** pending independent review and complete lane adoption.

| Finding | Location, cause and fix | Regression evidence |
|---|---|---|
| **C3-B1 — fixed (`2109012078`, `3ddf4a255a`)** | `scripts/pm_guard_isolation.py`, `_state_objects` and `_certified_snapshot`. The empty-cell handler enclosed recursion and swallowed `IsolationError`, a `ValueError` subclass. Only the read of `cell.cell_contents` is caught now; certification of its contents runs outside that handler. The new snapshot also represents cells and their aliases explicitly. | Closure/global slotted objects and external Python functions all require `state_shared_across_cases` and zero credit. Unsupported graphs are never converted to an empty fingerprint. |
| **C3-B2 — fixed (`2109012078`, `3ddf4a255a`)** | `static_scan`, `Suite.reset/reset_seams`, `_adapter_snapshot`. Scalar bindings were skipped as immutable contents. Global/nonlocal statements and shared/free/module/class writes are now static obligations that ordinary plumbing declarations cannot waive. The factory/adapter namespace, function metadata, cells, class state and reachable own modules are fingerprinted before runs. | Global scalar, nonlocal scalar and predicate-global mutation fail specifically with state failures and zero credit. A read-only scalar constant passes. An exact reviewed diagnostic reset passes; an ineffective reset still fails the snapshot. |
| **C3-B3 — fixed (`2109012078`, `3ddf4a255a`)** | `run.fresh`, `_adapter_snapshot`, `_certified_snapshot`. Factory-only state was outside the identity walk. The factory's complete own namespace/closures now participate from before construction. Every evaluation constructs two cases independently; each same-input table/context/input/checker graph must match its first fingerprint, including order and scalar/container/cell aliases while erasing fresh identities. Cuts and restorations repeat construction and comparison. | Both exact factory probes fail with no credited row, including the unchanged honest context-dependent predicate. An identity-derived context requires `factory_nondeterministic`. A scalar-topology regression distinguishes equal detached values from aliases and accepts freshly rebuilt equivalent aliases. |
| **C3-B4 — fixed (`2109012078`)** | `static_scan`. The old census allowed conversions and omitted implicit data exceptions. Outside predicates the scan now uses a bounded total-operation grammar: conversions, lookups/subscripts, unpacking, attributes, comparisons, truth tests, iteration, hash construction and unproven calls/bindings need exact reviewed plumbing. Unknown expression forms remain obligations. Only canonical one-argument `type`, literal-argument `bool` and engine constructors with verified argument boundaries are automatic total calls. Literal table names must exist; dynamic names fail unconditionally. | Conversion, lookup, unpacking and missing-name review suites fail statically without a fixture visiting the hidden error path. Additional dormant attributes, comparisons, float conversion, dynamic names, unbound locals, unhashable dictionary keys and invalid engine construction also fail for their own static obligations. |
| **C3-B5 / guard-tool T8 — fixed (`2109012078`)** | `scripts/pm_guard_isolation_traps.py`, CLI `--scratch`, `scripts/guard-isolation/README.md`. Scratch previously required a private evidence mount. The default is now the OS temporary directory; callers may choose a generic scratch parent. An adjacent corpus supports a flat three-file distribution. | The review's unchanged mkdir-denial audit hook passes the complete self-test. A flat distribution runs from another project directory with that mount denied. An explicit generic scratch override also passes and leaves no trap directories. |

The namespace fingerprint preserves binding order and original scalar/container identities. The case fingerprint preserves scalar/container/cell alias topology and physical numeric bits, ignoring fresh identities. Immutable code includes constants, operand/argument tables, flags, exception/line metadata and source identity; no `repr` or user equality is used on adapter objects. Slotted/opaque/custom-access graphs, external functions/classes/objects/modules and unlisted native objects fail closed. Lazy function annotations are refused without executing their evaluator. A reviewed reset must restore the first fingerprint; it cannot waive an unsupported graph. The original per-case mutable-identity checks remain in addition to snapshots.

Static scanning and original baselines still run after a snapshot diagnostic where possible, so a second unrelated safety failure cannot hide the named cause. Any safety failure withholds every row and duplicate credit before matrices/cuts. This is trusted-checker proof instrumentation, not a sandbox. Predicate honesty, complete boundaries, duplicate semantic equivalence and every plumbing/reset reason remain explicit independent-review obligations.

### Serial scratch verification

Only the tool, trap runner, example and corpus were copied to bounded local scratch. The cycle-2 and cycle-3 drivers were copied byte-for-byte from the review. The flat-portability driver changes only the import directory; its mkdir-denial hook is unchanged. Commands ran from a different project directory with a 1 GiB address-space cap, 1,536 MiB RSS gate and fresh 6 GiB available-memory checks, resuming at 7 GiB in the batch launcher. CPython 3.14.4/Linux, jsonschema 4.19.2 and referencing 0.36.2 were exercised.

| Check | Result |
|---|---|
| **Self-test** | **130/130 caught**, retaining all 104 previous IDs, descriptions, source bodies and required failure reasons. The two old positive controls gained only exact declarations for newly inventoried setup operations; schema controls likewise gained reviewed iteration/hash-construction declarations. No previous negative expectation was weakened. |
| **Cycle-2 replay** | All **22** original suites retain their statuses and required failure classes. The 21 rejecting suites have zero credit; the disclosed dishonest-single-predicate control still passes its finite sample. |
| **Cycle-3 state replay** | Fresh control passes. All **7** state probes/controls fail for `state_shared_across_cases`, including repeated runs, with zero credit. Both factory sources and the honest contextual predicate are unchanged. |
| **Cycle-3 dormant replay** | All **4** fail statically with zero credit and no runtime failure needed. The held-out originals still raise their original untagged errors; visiting them also fails. |
| **DG6B extracted example** | Normal and optimized Python each prove **7/7 guards**, **49 matrix cells**, **176 evaluations**, **353 factory constructions**. Results agree apart from process-specific identity snapshot hashes. No complete-family grade or adoption is inferred. |
| **Standalone / scratch** | Repository-layout and flat distributions each pass **130/130** with the private scratch mkdir denied; the flat run uses another project directory. The explicit scratch-parent run also passes **130/130** and cleans every trap directory. |
| **Schema preservation** | The five retained segments (`SchemaCatalog`, `SchemaView`, `children`, `schema_copy`, `joined`) remain text-identical to the reviewed base. The separate 768-cell campaign is not rerun or claimed here. |
| **Syntax / whitespace / evidence audit** | Python parsing and `git diff --check` pass. `audit-fix2.py` independently verifies original sources/declarations, named failure classes, zero credit, snapshot consistency, packaging results and final input hashes; its exact assertion count is in `audit-results.json`. |

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/B-fix2/`. `run-checks.py`, `commands.json`, `input-manifest.json`, `audit-fix2.py` and `audit-results.json` reproduce and check the raw results. `verification-manifest.json` provides SHA-256 values for retained drivers and results. Temporary runtime distributions, uncited development output and scratch parents are removed after validation; the prescribed worktree is removed after the branch push.

Scope is limited to tool/runner/example, trap corpus, standalone README, adoption guide and compact report companions. No owner Markdown, registry, Decision Log, Spec Lock, generated shard/index/evidence, `.gitignore`, main push, pm-mail, subagent, admission or PlanUnit ID changes. Repository-wide governance checks are outside this tool-only round. The subsequent T9 witness change is a separate branch from current `origin/main`, as required by the batch addendum.

| Round-2 evidence path (under the directory above) | SHA-256 |
|---|---|
| `self-test.json` | `374f442f8d0cfdf7ea6b46990fc70684484615e9d22f33ae01f39598f7cf6297` |
| `audit-results.json` | `e41d32dff8c9ef1ae116cb12ee5eeba64312d626d0473186cca588dd3426c1e1` |
| `B-cycle3/probes.json` | `41ec324412838729aae20401742ce555dca27e21924793c255753bb2bc92debb` |
| `B-cycle3/probes-static.json` | `e8d5f0a8963d6abd11f0e40083e84ae8f071b3f5e858152fcd56dde00c196cb7` |
| `portability-self-test.json` | `541af758b616bd14fb7ab11cda572a367459e8a6c06b46a60da1aab8e3e69cc7` |
| `verification-manifest.json` | `dfac8d577b944fe9e96bb63ff6481891d23531da9ff37866e915fcd9a5ea5b19` |

## Batch 1, recheck cycle 4: findings and responses

**C4-B1 and C4-B2 are fixed in `45538a7f57dd51e4028302e2c4ffb4185dafa59d`; neither is disputed.** Base: `dec0a57dce93238ab33452f6b7ca1c759435b587`. This section supersedes earlier claims about automatic operations outside predicates. Capability remains **PARTIAL** pending independent review and complete lane adoption.

**The structural change.** Both findings were allowlist entries assumed total, so the scan's default is reversed. It used to list obligations and let everything else through. It now classifies each syntax node through an explicit allowlist, and each accepted form cites a written reason in `TOTAL_FORMS`. A form with no entry, including syntax from a later Python, is an obligation. Reports list the forms each scan used in `static.automatic_totals`.

| Finding | Location, cause and fix | Regression evidence |
|---|---|---|
| **C4-B1 — fixed** | `scripts/pm_guard_isolation.py`, `static_scan`. Constructors were treated as having no validation hooks, but `Invariant.__post_init__` raises on a blank or non-string field. `Invariant` is now automatic only with literal nonblank string arguments; anything else is a `call_review` obligation. | The review's `hidden-invariant-constructor` fails with `hidden_static_sites`, zero credit, naming only that call. The held-out input still raises `IsolationError`. `C4-valid-invariant-constructor` passes, and `C4-constructor-hook-audit` fails if a hook is added to any allowlisted class. |
| **C4-B2 — fixed** | `static_scan`, `unary_form`. Any unary operator on a constant was accepted. It is now certified per operator and exact literal type: `not` on builtin literals, `+` and `-` on int or float, `~` on int. Everything else is an obligation, including valid forms such as `-True` and `-1j`. | The review's `hidden-unary-constant` fails with zero credit, naming only `-'invalid'`. String, float-invert, `None` and bytes negatives each hold out a real `TypeError`. The `-1` control passes both inputs. |

### What the audit changed

The adoption guide's "Outside-predicate allowlist audit" lists all 36 automatic forms with their reasons, the constructor hook audit, each form that became an obligation and those confirmed unchanged. Beyond the two findings, the audit found these automatic forms had no valid argument:

| Now an obligation | Why |
|---|---|
| `table.require` outside the exact checker shape | A foreign value or context raises the protocol error, and a rebound receiver raises `AttributeError`. The earlier "enforced at runtime" reason does not cover a dormant call. |
| Every `table.validate` | Raises on a missing schema, an undeclared root or an unattributable refusal. |
| Function-scope imports | They run module code on the visited path. |
| Name reads with no dominating binding | Defaults and annotations naming their own parameter, names made local by a nested `def` or import, deleted names, handler targets after their handler, and builtins the module's own builtins lack. |
| Shadowed aliases | A rebound `g`, predicate name or builtin exception class, and an engine callee absent from the engine. |
| Smaller forms | `except*`, `type(*x)`, mixed `str` and `bytes` display keys. `type` aliases and generic parameters were removed because nothing uses them. |

Subscripts and comparisons of literals, f-strings, literal operators and `len` or `isinstance` outside predicates were already obligations. The audit left them unchanged and added one dormant regression for each.

**Effect on adapters.** `table.validate` and `table.require` in a helper now need a `call_review` declaration. The trap runner's shared schema suite builder gained exactly one such declaration; the corpus entries for those traps are unchanged. Lane adapters written to the guide's checker shape need no other change, but each lane must run the new scan.

### Rerun results

Each command ran serially from a scratch copy of the commit, in another project directory, with a 1 GiB address-space cap and a 6 GiB available-memory floor, on CPython 3.14.4/Linux with jsonschema 4.19.2 and referencing 0.36.2. Review drivers were copied unchanged; `mount-denied.py` changes only its hard-coded distribution path.

| Check | Result |
|---|---|
| **Self-test** | **173/173 caught.** All 130 earlier traps are byte-equal in order, source and expectation, and 43 are new. |
| **`total-boundary.py`** | Both false passes now FAIL, for `hidden_static_sites` only, with zero credit. `honest-unary-numeric` passes both inputs. |
| **Cycle-2 replay** | All **22** suites keep their status, failure kinds and credit, with unchanged inputs. 21 rejecting suites have zero credit; the disclosed honesty-limit sample still passes. |
| **Cycle-3 replay** | All 8 state suites and 4 dormant suites keep their results, with zero credit on every rejection. |
| **`adjacent.py`, `hidden-operations.py`** | All 13 and all 3 keep their results. |
| **DG6B example** | Normal and optimized: **7/7 guards**, 49 matrix cells, 176 evaluations, 353 factory constructions. Results agree apart from process-specific hashes. No declaration changed. |
| **Standalone** | Flat copy from another project with the PuppetMaster mount denied: exit 0. Repository layout with the private scratch denied: exit 0. Explicit `--scratch`: 173/173. |
| **Worker sweep `dormant-sweep.py`** | 211 raising or suspect forms on a dormant branch, with only the dispatch declared. **0 false passes** and 203 raising forms refused; the one clean pass is an honest `table.require`. On the base tool the same sweep has **27 false passes**. |
| **New corpus on the base tool** | 27 new negatives were credited PASSes there. The 11 `C4-literal-*` traps were already caught, which confirms the unchanged list. |
| **Evidence audit** | **1234 assertions pass**, covering unchanged inputs, exact sites, zero credit, every reason's presence in the guide and unchanged schema, snapshot and table code. |

**Limits.** The sweep is this worker's own list, not a proof of completeness; it is evidence for the allowlist, whose soundness rests on the written reasons, which need independent review. Those reasons exclude resource exhaustion, interpreter interruption and warnings promoted to errors. Predicate bodies stay outside this scan: an exception inside one fails the run if visited, so predicate honesty remains a review obligation. Only CPython 3.14.4/Linux was exercised. The 768-cell schema campaign, lane adoption and governance checks were not rerun.

**Scope.** Tool, trap runner, corpus, standalone README, adoption guide and compact report companions. No owner Markdown, registry, Decision Log, Spec Lock, generated shard, index or evidence, `.gitignore`, `main` push, pm-mail or subagent.

Evidence directory: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/B-fix3/`.

| Evidence under that directory | SHA-256 |
|---|---|
| `self-test.json` | `364859d80c01d0beb9f45ec9a571e7a22c6fdff9b6062c23e978ee1370487d14` |
| `audit-results.json` | `e80123059b828215279becfa3396ab2b3be3622c5f1774b4ecd873cdd3b5a1fc` |
| `dormant-sweep.json` | `751e3330d950cf2d4e341f7646539883512011ae5a34443e58ff7d020383f8e2` |
| `dormant-sweep-base-tool.json` | `59722719c19da07f9a1086f1efb1e6610a314231b5b0e402d79b6bc4f6b6f6e9` |
| `new-corpus-on-base-tool.json` | `8a03f5c22e78244c31b3b52da08c308fecc68fb225a1a9588cec50f2e4bdc839` |
| `dg6b-example.json` | `dc6b5630cdafe4703315e2d44db98e0c9e2f327601c6c6fd5d1dacfb2576be1f` |
| `dg6b-example-optimized.json` | `7f2db93d47aa63c5616726f7a599f3a5eb8abacfebac811d059a9610eef893e8` |
| `scratch-override-self-test.json` | `d2e65f7a3cf2633541df33134f7cdaa9ee7a21db81dc6239e85cdacc00a9aeee` |
| `commands.json` | `746c6747405bf92f9a794e84b67dd1a29c3b3d2beeae79b43360c5253edaeb0b` |
| `run-checks.py` | `8d13a10add6f123e257c05e874f573918a8da4e29c98d33d5bb4dfd1e5d17f6c` |
| `audit-fix3.py` | `350452e69cd02fbd42df24fa2b539f30d1a45b3369921a66d861cd5a174e66f8` |
| `dormant-sweep.py` | `a1516e83123f722e5a16cf059b1ffd284d471ccf75217185265688b89e91f8c5` |
| `mount-denied.py` | `d8dc84c019f189b7d32f056e5f353e690219133bf167b4ef8407db51103fbf22` |
| `prepare-report.py` | `b9a0e6c7900b982bb4e010a5aeb7b6d4cd915dbde989230b3a09ecb4fd93bc64` |
| `B-cycle4/total-boundary.py` | `4f317a34f152e4dc714a31cc8465c1d23eb3ca264eda0cac04f60ff9f9cc4fcd` |
| `B-cycle4/total-boundary.json` | `281c90370f3cd5eb6a04c22bbe0db7a61546656f753e132303890a19c9d2e5db` |
| `B-cycle4/adjacent.json` | `464f12e26fc73b9ca9b6470888cae9190fad3218e82f522aa3644799dee183c2` |
| `B-cycle4/hidden-operations.json` | `429fbb834141b54ac347daeb615148dac381414cef9f16a6091312820a094acb` |
| `B-cycle3/probes.json` | `d5d7621de657c89ee18c2ce2be4197439fee019a37713771af41fc6cce4b23cd` |
| `B-cycle3/probes-static.json` | `3c765ea58db9d75fee3ffb85b363e3e4491c37238ffca9cdec207e3b10756935` |
| `B-cycle3/portability.json` | `ef4b1e03a5ee54d265868dcdbb8e2f929ef7a349dd13d6f5ebf398fc6706a0d9` |
| `B-cycle2/probes.json` | `9ab745fc8ee8a3af4ed037a088b34fe08f93d2b49a1459fca9ab4f79f6c3b6d7` |
| `B-cycle2/probes-more.json` | `beb8dc04d21503a0e52200029bd38c71c55ebab7bc83e1c3ed3eefc6c66bc583` |
| `B-cycle2/probes-purity.json` | `142262367c5ed953eb9f622a5b335f8e20920d0e04b2cbd6d0b5c7e1e8585d8a` |
| `B-cycle2/probes-adjacent.json` | `cb2bb3591d5c7e118bac3026de4cc12b9085a2f82c20294676b57b6a30858963` |

## Batch 1, Sol max cycle 6: findings and responses

**C6-B1 and C6-B2 are fixed in `8a49a8e38ddc094cf26494073401a24935076113`; neither is disputed.** Base: `07fefa83bddb397a2d41e132db4203a90e1b414d`. This section supersedes earlier claims about automatic name reads and equivalent case state. Capability remains **PARTIAL** pending independent review and complete lane adoption.

| Finding | Location, cause and fix | Regression evidence |
|---|---|---|
| **C6-B1 — fixed** | `scripts/pm_guard_isolation.py`, `static_scan`, `total_name`. The read climbed the syntax tree and counted any earlier sibling, so a class body looked like a binding visible to its methods. It now resolves each read by language reference 4.2.2 (`execution_scope`, `binding_scope`) and then requires a binding of that scope to dominate the read (`dominated`). `symtable` is a second opinion: where the compiler has a table for the scope and disagrees, the read is an obligation. | The review's dormant suite fails with `hidden_static_sites`, zero credit, naming only `absent`; the held-out input still raises `NameError`. The visited suite keeps its runtime refusal. The genuine-closure control passes both routes. |
| **C6-B2 — fixed** | `_certified_snapshot`, `_case_snapshot`, `run`. Case and shared snapshots were separate walks, so the edge between a case value and a shared binding existed in neither. Each build is now one graph: input, anchored shared state, context, checker, table. Addresses are erased; identity edges, including each function's edge to its global namespace, stay. | The review's search finds no non-causal flip. `C6-noncausal-flip-*` schedule the exact cut build deterministically and fail `factory_nondeterministic` with zero credit. `C6-identity-graph-collision-pair` proves the pair apart, while fresh equal values stay equivalent. |

### Name-read audit

Sol's fix asked for an audit of every automatic name read. Beyond the class-versus-method case, it found these automatic reads that raise in real Python, all now obligations. The adoption guide's "Name-read scope audit" names a trap for each.

| Form | Python's rule |
|---|---|
| Lambda, comprehension result or condition, later iterable or generator in a class body, with a class binding | A class namespace does not enclose them |
| A nested class body, with the outer class binding | Class namespaces do not nest |
| A class-body read or method default of a name the class binds later, with an enclosing binding | `LOAD_NAME` goes to globals and builtins, never the enclosing function |
| A comprehension iterable or condition reading a later target, with an enclosing binding | The target makes the name comprehension-local |
| A read under `global`, in a function or a class, with an enclosing binding | `global` skips every enclosing function |
| A closure over a handler target | The target is deleted when the handler ends |
| A read after a nested handler with the same target, or a loop target a handler reuses | That handler deletes it |
| `__private` under a class, with a module binding | The compiler mangles the name |
| A generic method, with a class binding | The type-parameter scope keeps the class excluded |

Type-parameter bounds, type alias values, type-parameter reads and annotations naming a local binding do not raise on these paths. They are obligations because no written argument covers them. The other automatic name uses (`type`, `bool`, `except` classes, `g`, `table`, `__code__`, `Guard` predicates) refuse any rebinding anywhere in the file and check the live binding, so they did not change.

**Effect on adapters.** An adapter that reads a name through one of these forms must declare it or fix it; all of them raise except the lazy forms and annotations above. A case that depends on state from a module not named in `checker_modules` may now fail closed with `state_shared_across_cases`, so name that module. The DG6B example needed no change.

### Rerun results

Each command ran serially from a scratch copy of the commit, in another project directory, with a 1 GiB address-space cap and a 6 GiB available-memory floor, on CPython 3.14.4/Linux with jsonschema 4.19.2 and referencing 0.36.2. Review drivers were copied unchanged except their hard-coded scratch paths.

| Check | Result |
|---|---|
| **Self-test** | **225/225 caught.** All 173 earlier traps are byte-equal in order, source and expectation, and 52 are new. |
| **`guard-probes.py` (cycle 6)** | `class-binding-is-not-method-binding`: credited PASS at the base, now FAIL for `hidden_static_sites` only. `class-binding-visited-control` keeps its three runtime failures and adds the static one. `outer-closure-binding-control` passes. The other 14 suites keep their results. |
| **`identity-probes.py` (cycle 6)** | No non-causal flip in 30 suites. `factory_nondeterministic` with zero credit: 27, exactly those where builds of one input disagreed. `wrong_baseline_guard` with zero credit: 1, where builds of each input agreed and the negative was not refused. Passing: 2, where every recorded build kept the canonical relation, so no flip occurred. These counts depend on the allocator and change between runs, as the review noted; the audit checks the property, not the counts. |
| **`identity-comparison.py` (cycle 6)** | Exit 1: its assertion that the two fingerprints collide now fails, which is the fix. A paired copy that asserts the opposite exits 0: equal inputs, different fingerprints, `GuardRefusal` versus `True`. |
| **`proof-probes.py`, `schema-replay.py` (cycle 6)** | All 13 suites keep their results. The 768-cell census stays 139 atomic, 530 fail-closed, 99 zero-predicate; its pin label is the driver's literal base value. |
| **Cycles 2 to 5** | Every suite keeps its status, failure kinds and credit, with unchanged inputs: 22 in cycle 2; 8 and 4 in cycle 3; 3, 13 and 3 in cycle 4; 44, 5 and 4 in cycle 5. Compared with the review's own cycle-5 results. |
| **DG6B example** | Normal and optimized: **7/7 guards**, 49 matrix cells, 176 evaluations, 353 factory constructions. Results agree apart from process-specific hashes. The example is unchanged. |
| **Standalone** | Flat copy from another project with program paths denied: exit 0, 225/225. Repository layout with the private scratch denied: exit 0. Explicit `--scratch`: 225/225. |
| **Worker sweep `scope-sweep.py`** | CPython itself is the oracle: every reader, binding and module combination runs, and a read the scan left automatic must not raise `NameError`. 6994 forms: **0 false passes**, 3146 raising reads refused, 2887 automatic reads that run, 961 valid reads kept as obligations. On the base tool the same sweep has **810 false passes**. |
| **New corpus on the base tool** | The base tool still catches all 173 earlier traps. 27 new negatives were credited PASSes there, the collision pair needs the new tool and every control passes. |
| **Evidence audit** | **1660 assertions pass**, covering unchanged inputs, exact sites, zero credit, every reason's presence in the guide and unchanged schema, table and memory code. |

**Limits.**
- **The sweep is a worker list.** It is evidence for the resolver, not a proof of completeness, and it needs independent review. Only a `NameError` for the probed name counts as a false pass.
- **Identity certification compares builds; it cannot predict them.** A factory that branches on an address passes only in a run where every build agreed. A checker branch on an address changes no graph at all, so a reviewer must reject a `call_review` declaration for `id()` whose result can reach a case value or a branch. The guide says so.
- **The resolver alone decides some scopes.** List, set and dict comprehensions have no compiler table of their own from Python 3.12, and generic definitions and same-line twins are not matched to one.
- **Predicate bodies stay outside this scan.** An exception inside one fails the run if visited.
- **Only CPython 3.14.4/Linux was exercised.** Traps using type-parameter syntax are recorded as skipped below Python 3.12, which cannot parse them. Lane adoption and governance checks were not run.

**Scope.** Tool, trap runner, corpus, standalone README, adoption guide and compact report companions. No owner Markdown, registry, Decision Log, Spec Lock, generated shard, index or evidence, `.gitignore`, `main` push, pm-mail or subagent.

Evidence directory: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/B-fix4/`.

| Evidence under that directory | SHA-256 |
|---|---|
| `self-test.json` | `18d324881e7a93af2f4365b69b8c72774e38f00c33f9d75cb27b724682c3753c` |
| `audit-results.json` | `4d19096f4cc86c2e03a0da2e5ea0bf674a0747759961f3bb53f7c80e29e3217b` |
| `scope-sweep.json` | `c36b1a3de6cf8ca046af7ff47016e1152f3b4dd6eefbafa609d889b70d064888` |
| `scope-sweep-base-tool.json` | `3ec6e895334f3b7874572cc435cd8f2d48b97e4ee54eec70ca2eefeddfcc4132` |
| `new-corpus-on-base-tool.json` | `9f6572256c8c7127ff6dbb5830cf5cefd116700bf72f1c50f977ff5d40a53ab3` |
| `dg6b.json` | `de9d5e1d99b09b865abb3d87bbe8f47f1cccda98951bc568544adea62bb72df4` |
| `dg6b-optimized.json` | `8d060358c5f361681b6cabc4b0b5e84956d6593c8b7ecd437d13a903be1bbbc3` |
| `scratch-override-self-test.json` | `5c81d1982ea8be882884147578d946aa0f4ecd3222b33fb40c6293b299b31557` |
| `standalone-guard.stdout` | `c0b57d1aaaf7b3ae36fe3081c4074208ee5d456ffd1bc646ad965812d0f840f3` |
| `commands.json` | `7094e9c2a6888ece6afef679586df985ade30aa37d923e6006aa814ad03183e9` |
| `run-checks.py` | `b7fd5080f4306e269ab9e356842a279d037ac29f8146f9ae7c1881bd8c88a60f` |
| `audit-fix4.py` | `2a44ed8be77b5b628300733dea5cfc5a078d2954f853956995c9852a484081df` |
| `scope-sweep.py` | `afa8bb7ace7a51819e2f89c2969ee22460c04137b05b9ec83235bf8c0942b39b` |
| `make-corpus.py` | `e8492c5b15e73e97c21d5f751385f4f1752efd9486baff5e3f54407eb601b118` |
| `prepare-report.py` | `cce13a0a1339f8cacec0a0b849473cd144342f56edae904754ff5c53c2af055b` |
| `cycle6/reviewlib.py` | `501d4c95a55f3d89e995e84ba61584184153b02411051ecd9662f6695ccef8d6` |
| `cycle6/guard-probes.json` | `04ad6b08f6dd682681d244771f1757fc5670a4bcfe76f16d1c44075b999c8d2c` |
| `cycle6/identity-probes.json` | `a3502d00f190d74dbe48a9957c9802a1afdd8ae55d4471c308ca8659e5c4967b` |
| `cycle6/identity-comparison-paired.py` | `75ba510261ff12b7a5b1f0e61afa8cfa54deb58c0f5d4d65d61e71a805dbd871` |
| `cycle6/identity-comparison-paired.json` | `f3b93920658c2d2336c0be494d5156f0f6db5b9161505b94992320653a57f899` |
| `cycle6/proof-probes.json` | `e608a6111ad04caee1634af83305a1eeb70ac942a598c8042947f63ab1c56de6` |
| `cycle6/schema-replay.json` | `92553b804849aecad50fdc6ef5ceac22778f1b9be1b95325741200c92cbb1a79` |
| `cycle5/allowlist-probes.json` | `7fbd5eda5fd27fad1d47ba66b43d528dc1cde2e99066a7e787fc28fd0acfdb5d` |
| `cycle5/hostile-bindings.json` | `e68406ad300a7c462105f38959335527d8d49619f683e49cc8717f082f2948e7` |
| `cycle5/implicit-probes.json` | `c5f9fbb003f2db62dd7743485bad29265f28c114fd793053d6f093d4ccdc9b96` |
| `cycle5/boundary-hooks.json` | `70d6ee43ac40f215299fdc3f8d4276a66426c1e66dc9a1fe4826238a2391ce89` |
| `cycle4/total-boundary.json` | `8da01c7b065dbab4644cd573358205936072cc93d5780a304bb045be68f2c117` |
| `cycle4/adjacent.json` | `7b276a25f2c271f8e3f71663502e89b8f20943867c42331a0aaaaeed0bd36c90` |
| `cycle4/hidden-operations.json` | `cd313c223fe43e1c87475766b679958d830e02d10bb7300354e0016defd77d97` |
| `cycle3/probes.json` | `a2073fb85647bf410462eb7cd60da5c41dd830c82c39df3e8b64b17773e58c16` |
| `cycle3/probes-static.json` | `8064ad3b83e5aae74740f627ccfe456702aa5335ab32f875819d309797ca6cb7` |
| `cycle3/portability.json` | `ef4b1e03a5ee54d265868dcdbb8e2f929ef7a349dd13d6f5ebf398fc6706a0d9` |
| `cycle2/probes.json` | `849bb5ee6ee13b36409ef352cd125fe2c4abb1aa47831a5ab841beaf8a2156b6` |
| `cycle2/probes-more.json` | `79878f259f5d0fd98bb267636330f1032172319a2066115e4b80d2abf66241f4` |
| `cycle2/probes-purity.json` | `282c1ded5566e3eccdb7d15a7739b929df55c810324e5adf833d87e8269ec66d` |
| `cycle2/probes-adjacent.json` | `44ac67ef872118b2836e0da32728987ca35b4e5147c6b39e6b7590482d5c7e29` |

## Batch 1, Opus pre-check cycle 7: findings and responses

**B7-G1, B7-G2, B7-G3 and B7-G4 are fixed in `56aa137071b06eb44fa2f62e14e7e9c66017ec93`; none is disputed.** Base: `df1306222bf9efe556bd34726a378177493e28ee`. The pre-check's notes N1 and N3 are fixed and N2 is documented. This section supersedes earlier claims about causal credit, class bodies, module reads and unwatched modules. Capability remains **PARTIAL** pending independent review and complete lane adoption.

| Finding | Location, cause and fix | Regression evidence |
|---|---|---|
| **B7-G1 — fixed** | `scripts/pm_guard_isolation.py`, `static_scan` (`plain_class`, `name_form`). Every class-body name store and read was automatic, but a class body runs in the mapping its metaclass's `__prepare__` returns, and `enum._EnumDict` raises on a duplicate member. A name store, read, `def` or handler target in a class body is now automatic only when the class has no bases, keywords, decorators or type parameters and `__build_class__` is the unshadowed builtin (`binding:plain-class-name`). Anything else is an obligation. | The review's Enum duplicate and `_sunder_` suites fail with `hidden_static_sites`, zero credit, naming the class-body names; the held-out inputs still raise. The visited suite keeps its runtime refusal. The plain-class duplicate control passes. Traps also cover a redefined member, a repository metaclass, a decorated class and an `object` base. |
| **B7-G2 — fixed** | `static_scan` (`module_read_form`). A read resolving to the module namespace was certified from the live namespace at scan time, while a dormant `except ... as` under `global` deletes that binding. Module reads are now certified from the syntax alone: the file must bind the name exactly once, by a top-level unconditional assignment, annotated assignment, `def`, `class` or plain import that precedes the statement holding the read. `del`, `global` rebinding, handler, loop and `with` targets, walrus, augmented assignment and star imports all disqualify it. Builtins and import-system attributes have their own written reasons; the live module is consulted only to refuse. | The review's reset-seam suite fails with zero credit, naming only the read of `marker`; the held-out input still raises `NameError`. The visited and local-handler suites keep their refusals. Six traps cover the other excluded bindings, and four controls keep the single-binding, recursive, `__name__` and builtin reads automatic. |
| **B7-G3 — fixed** | `run`, after the first static scan. A repository module the scan followed was not watched unless `checker_modules` named it. Every module the scan covers must now be named, or the run fails `scanned_module_not_declared` with zero credit; named modules are anchored in both snapshots, as before. | All 12 unnamed helper limits fail `scanned_module_not_declared`, and all 12 named ones fail `state_shared_across_cases`, with zero credit. `C7-unnamed-helper-module-state` and its named pair are traps. |
| **B7-G4 — fixed** | `GuardTable` records each `require` and `validate` call and the refusal position; `run` (`trace_check`) compares traces. An acceptance under a cut counted as a flip whether or not the cut guard ran. Now the baseline and the row's restoration must have identical traces, and a cut run must repeat the baseline trace up to and including the refusing cut guard; when the cut changes no guard result the whole trace must match. Divergence fails `noncausal_flip` (own negative) or `guard_trace_changed` (any other case) with zero credit. Traces are in the JSON. | None of the 40 random seeds gives a credited flip now; the six the review found (9, 13, 20, 22, 34, 37) fail `noncausal_flip`, and the 11 seeds in which every case took one path in all its runs, and every negative reached its guard, still pass. Traps cover a counter skip, the six seeds, a path that diverges before the cut guard, changed control and restoration paths, and a never-skipping control. |

### The trace check

- **What it compares.** For every cut row and every control and negative: the baseline trace, the cut run's trace and the restoration's trace, each the ordered `require` and `validate` calls with the position of the issued refusal.
- **Determinism.** Baseline and restoration are two uncut runs of the same case; their traces must be identical.
- **Attribution.** If the baseline was refused by a cut guard, the cut trace must start with the baseline trace through that refusing call. Otherwise the cut changes no guard result, so the traces must be equal.
- **What fails closed.** A skipped or never-reached cut guard, any divergence before it, a changed path for any other case, and an unnamed scanned module. Each withholds all credit.

The check uses the existing baseline and restoration runs, so DG6B keeps 176 evaluations and 353 factories, now with 56 trace comparisons, all equal.

### Notes

- **N1 — fixed.** Any read of `eval`, `exec`, `compile`, `__import__`, `getattr`, `globals`, `locals`, `vars` or `__builtins__` is a `dynamic_code_or_import` error, which a `NonGuard` cannot waive. All 14 of the review's forms are now errors (8 at the base); six traps hold the six waivable ones.
- **N2 — documented.** The adoption guide lists the fail-closed limits ordinary code meets: uncertifiable contexts, repeated subexpressions and names injected after load. The trap runner's shared schema subject now binds its `DOCUMENTS` and `ROOTS` placeholders once in the module, as the new rule requires; no corpus entry changed.
- **N3 — fixed.** A trap this Python cannot parse is reported under `skipped`, never counted as caught.
- **N4.** Information only; the review's identity cases keep their results.

The guide's allowlist table is now generated from `TOTAL_FORMS`, so each rule's totality reason in the guide is the tool's own. Its new "Class bodies and module reads" table names a trap for each form that became an obligation. The reviewer warning now covers `id()`, `hash` and `repr`, hash order, `random`, time, environment and I/O, and unwatched module state, and says which of them the trace check catches and which stay review items.

### Rerun results

Each command ran serially from scratch copies of the commits, in another project directory, with a 1 GiB address-space cap and a 6 GiB available-memory floor, on CPython 3.14.4/Linux with jsonschema 4.19.2 and referencing 0.36.2. Every review driver of cycles 2 to 7 ran against both the base and this tool from its own copy, changed only in hard-coded tool or scratch paths.

| Check | Result |
|---|---|
| **Self-test** | **266/266 caught**, none skipped. All 225 earlier traps are byte-equal in order, source and expectation, and 41 are new. Under `python3 -O`, which strips `assert` statements, only `runtime-inline-assert` is missed, as it is on the base tool; that trap's refusal is the assert itself. |
| **New corpus on the base tool** | The base tool still catches all 225 earlier traps. 28 new negatives were credited PASSes there, including every reproducer of the pre-check; 7 new regressions earn no credit there either, and all 6 new controls pass. |
| **Cycles 2 to 6** | Every suite keeps its status and credit on both tools. Failure kinds are unchanged except in 4 already failing, zero-credit suites that import a repository helper they do not name, which add `scanned_module_not_declared`. The allocator-dependent `identity-probes.py` suites change between any two runs; none gains credit. |
| **Pre-check drivers (cycle 7)** | Class namespace: the three false passes now fail with zero credit, the control passes. Global handler: the reset-seam false pass now fails, naming only `marker`. Identity: no non-causal credited flip (base: 6 in `identity_adjacent`, the review's six seeds, and 1 in `identity_followup`); every unnamed and named helper limit fails with zero credit. `exec_eval.py`: all 14 forms are dynamic-code errors (base: 8). Scope fuzzer, 20,000 programs, seed 20261105: **0 false passes** (base: 36). `scope_adjacent.py`: no false pass. Changed suites: cycle7/class-namespace.json 3, cycle7/global-handler.json 2, cycle7/identity-adjacent.json 43, cycle7/identity-followup.json 12. |
| **Worker sweep `scope-sweep.py` (fix 4)** | **0 false passes**; 3146 raising reads refused, 2699 automatic reads that run, 1149 valid reads kept as obligations (base: 2887 and 961). The stricter module rule moves valid reads to obligations; none becomes a false pass. |
| **Schema replay** | 768 cells: 139 atomic, 530 fail-closed, 99 zero-predicate, as before. |
| **DG6B example** | Normal and optimized: **7/7 guards**, 49 matrix cells, 176 evaluations, 353 factory constructions, as at the base. The example is unchanged. |
| **Standalone** | Flat copy from another project with program paths denied: exit 0, 266/266. Strict denial of the share, the source clone and both worktree roots under `python3 -I`: exit 0, 0 denied-path attempts. Explicit `--scratch`: 266/266. |
| **Evidence audit** | **323 assertions pass**, covering unchanged inputs, zero credit on every changed suite, the reproducers' results on both tools and the DG6B counts. |

**Limits.**
- **The trace check compares observed runs.** A source that is stable within one process but differs across processes, hosts or dates (`PYTHONHASHSEED` order, a time threshold, an environment variable, a file) gives every run the same trace, and a nondeterministic gate that never fired in the observed runs earns credit. Reviewers must reject declarations whose result can decide whether a guard runs; the guide says so.
- **The module rule is stricter than Python.** Forward references, conditional and repeated module bindings are valid Python that now need declarations or a restructure.
- **The sweep and the fuzzer are worker and reviewer lists.** They are evidence, not proofs of completeness.
- **Only CPython 3.14.4/Linux was exercised.** Lane adoption and governance checks were not run.

**Scope.** Tool, trap runner, corpus, standalone README, adoption guide and compact report companions. No owner Markdown, registry, Decision Log, Spec Lock, generated shard, index or evidence, `.gitignore`, `main` push, pm-mail or subagent.

Evidence directory: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/B-fix5/`.

| Evidence under that directory | SHA-256 |
|---|---|
| `self-test.json` | `a659d3ee04ebcda72055ee5dc35bf902bd53cccee3afdb82a6785bacee5adaef` |
| `self-test-optimized.json` | `891f1926f71421e4503e0ed498de692121534109c33d28c6e14b84c17bf78e69` |
| `new-corpus-on-base-tool.json` | `4960e27f1c0bdb175d59faf7576a1354246bb4e6d92257b641f6f40f63842da8` |
| `audit-results.json` | `0554cf17b946e18d936e076baf9b5208a69b6fd5740a8b079582bdf70e7584b2` |
| `commands.json` | `467b4813040e7fb4ac24e0ed89516a1ecee7981bd817b3943f76819a734f7c28` |
| `guard_isolation_traps.json` | `87f50110d8ac0a38b8f034423959341b8601ca22d4ce49c8d1f1bc2ca88a2882` |
| `new/dg6b.json` | `1f522a02bbba374d7835478d51d34d687b3f1bf773928f6d8139f67f0e05a864` |
| `new/dg6b-optimized.json` | `c0c15bae9355f7f5fed2ed215c67ff149472ee48167e53859741924233816540` |
| `base/dg6b.json` | `d3c63a48be8cebf49028eaa7931dbc4033637363b6702da36d9cf4927e142d3a` |
| `standalone-guard.stdout` | `1f87c11a8be6d57a4f959fb6848465af3300f21b93ae8567a17b21fd39893c6c` |
| `standalone-strict-guard.stdout` | `8a33a2da9a523a87869c70a175694649840ae383ae2196411a85932e8c7fe998` |
| `standalone-strict-guard.stderr` | `dfd559265cc271df123404111ee0484bfa8901746c6333a2228b1219fe2bd06e` |
| `scratch-override-self-test.json` | `53e77f8ddce7e3046ca0c64d83c84326a8a19a4f8a79847ac3ab1635d80fea5f` |
| `new/cycle7/class-namespace.json` | `62f90f90527dce5addb44b2cfe7a8002709aaebfd446d5d501996b662d8797a1` |
| `new/cycle7/global-handler.json` | `3a07294c53f02651964bf0981e2edec01dbcce8dc92af46cddfe8bd30aa84685` |
| `new/cycle7/identity-adjacent.json` | `0959726bfcf8246e5aa52b41b1eda5c7ca15ad2f4fe5ffa0446905a53e912231` |
| `new/cycle7/identity-followup.json` | `5866e2a5deba1e18bdca19f0c7ee3da0b0dac55c3df4f4962e292232c7f6a133` |
| `new/cycle7/scope-adjacent.json` | `3a5288273b7f2bcc8204356645a584170e92721fcafbc198a3f6c90df0c676c0` |
| `new/cycle7/scope-fuzz.json` | `d6462f52c9b5b8df208b5e8271b11ebafa8fa8a2ed7c7965192065c8b2cd12a4` |
| `new/cycle7/exec-eval.json` | `32420ce20eefdbafd9a917603935020c8dcf7a187424ae1be38a5ef5760d6a9f` |
| `base/cycle7/scope-fuzz.json` | `9d364a8abc60fc429d29b13fe71bd79606cf23b174d885e63b3f955a1e271b03` |
| `base/cycle7/identity-adjacent.json` | `af0d8feffb1251a1c8e9ec50d14c5a584a67f2b8b23b0d355877f55766746200` |
| `base/cycle7/identity-followup.json` | `f8efedd4698bdd674f0e65e8b3f87c2b77b5e7e0c36e256ac875305e38d7e12c` |
| `new/cycle6/guard-probes.json` | `7eb8453abe02ede5421a347fe3c40d3d5b6d29f4c45b3d54e6c06b5bf56d6aeb` |
| `new/cycle6/identity-probes.json` | `1a480e71c51da0dcf5d611908f79ac7f3cc40ea89d2d8f5ba11300510b35c45c` |
| `new/cycle6/proof-probes.json` | `702f052c7d01e31273da6775f413cd8e76732898c7979f4f52c9202d8619ffed` |
| `new/cycle6/schema-replay.json` | `92553b804849aecad50fdc6ef5ceac22778f1b9be1b95325741200c92cbb1a79` |
| `new/fix4/scope-sweep.json` | `3720eb24cb054348c84ac81e3e9913e6504addcfcd55fb166f03fcca44dbcb53` |
| `base/fix4/scope-sweep.json` | `c36b1a3de6cf8ca046af7ff47016e1152f3b4dd6eefbafa609d889b70d064888` |
| `run-checks.py` | `14e7b600f70fbdb1b2bc65c4733b27f2c286b7dd2efd3d4e19e149012a7bf75b` |
| `audit-guard.py` | `a724fe39b5db0b2fd55ccd08380791d8d93e535d33220fa66d90e4b408f02c5e` |
| `make-corpus.py` | `5eb32912f47394332144861ea881123f1bb7f68d4e12af53b39cc92fafcf3113` |
| `edit-guard-docs.py` | `7eba01c6c1c65a037187bf9abc6d8992e6a61dea8bd1c0db75cbf8e155d8cf69` |
| `prepare-guard-report.py` | `7690f3fc1f30962348260333507e91437acea316e95363c5d9375e0f8b0f7beb` |
