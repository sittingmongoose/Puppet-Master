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

- **Independent schema inventory:** scalar type/membership/numeric/string/format assertions, required members, dependency members, closures, array/item/contains constraints, branches and boolean schemas. All declared references, including dormant branches/definitions, resolve before cases. Referenced selectors and logical polarity propagate through the graph; dynamic anchors are conservatively included. Cycles are visited without reference expansion.
- **Exact cuts:** one required or dependency member; one Boolean/code clause; one scalar assertion; one closure/item boolean; one contains count. A type cut preserves const/enum for correctly typed values. OneOf exclusivity retains all alternatives and the nonzero-match requirement. Negated atoms are cut with opposite polarity. Peer assertions remain enabled.
- **Code sites:** function/column/AST fingerprint, direct raise/refusal-return, boolean-return leaf, assert leaf, accumulated refusal append and declared acceptance-predicate call argument. Sibling Python functions share the cloned module namespace; declared modules' cross-imports are rebound. Nested/class/module guard sites are visible as unsupported candidates requiring an explicit adapter seam, never silently omitted.
- **Whole matrix:** valid controls accept; each baseline negative rejects with its declared target code; the target cut accepts its own negatives; every other negative runs and retains its exact original refusal; restored fresh state re-rejects and controls re-accept. Unexpected checker exceptions are not refusals. Type-sensitive input diffs, source hashes, stable case identities and exact complement sets are exported.
- **Duplicate proof:** one field/predicate declaration, evidence, each site removed alone, all sites removed, and each site restored while its peers remain cut. No overlap/code/keyword union is performed. Assertion identities include the consumed root, input field and reference trail. Private resources isolate repeated ordinary references, including an inline assertion referenced by a peer; source schemas and siblings are not flattened. Python-built schema container aliases are separated as JSON schema occurrences. These private resource URIs are proof internals, not product bindings. A structured or opaque multi-field guard must expose its atomic predicates in the adapter; an aggregate refusal is not permission to remove its peers.
- **Shared-reference regression:** a final inspection found that a shared physical target could still couple two fields. The implementation now creates separate evaluation occurrences and private reference frames; new complete matrices prove different-field isolation, same-field duplicates, inline/reference duplicates and mixed-polarity field routes. A negated compound shortcut is also required to fail when it flips unrelated targets.
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
