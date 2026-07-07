# FABLE REPORT — Puppet Master Plans: Implementation-Readiness Audit

**Date:** 2026-07-06 · **Auditor:** Claude (Fable 5), 135-agent parallel audit · **Scope:** all 73 top-level `Plans/*.md` docs (~360k lines), key JSON artifacts (wiring matrix, control reconciliation, Spec_Lock, plan_graph, all schemas), and `Concepts/PMConcept.html` (21,193 lines). Derived layers (`_shards`, `.evidence`, `.audits`, `.plan_index`, `.plan_migration`, `ledgers`) excluded from hand-review; covered indirectly via pipeline checks.

## Overall verdict: NOT IMPLEMENTATION-READY

53 of 55 audited markdown docs received a NOT READY verdict from at least one of their chunk reviewers. After synthesis and de-duplication the report below carries **81 Critical-tagged and 258 High-tagged must-fix findings**, plus several hundred condensed Medium/Low items. The repo's own verification pipeline **passes everything** (shard check: 78 docs / 1,413 shards, pass; `run-gates`: 17/17 gates pass) — a headline result in itself: the gates verify *traceability and structure*, not *buildability*. A plan corpus can be perfectly sharded, hashed, and lineage-sealed while still not telling an engineer what to build.

**What's strong (subjective):** the corpus is unusually rigorous for a pre-code project — canonical-token discipline, per-doc owner maps, a real reconciliation JSON tying 1,284 concept controls to dispositions (sha-fresh against PMConcept.html), well-specified tool I/O contracts (Tools.md §3.5.x), worktree flows, memory-subsystem retrieval mechanics, and a genuinely sound 34-branch discriminated union in `plans_to_code_handoff.schema.json`.

**What's systemically weak:**
1. **The PlanUnit compile layer restates instead of specifying.** Roughly half the corpus volume is machine-compiled PlanUnit YAML whose `acceptance_criteria` are identical migration boilerplate ("tokens preserved, lineage intact") on nearly every unit, with `depends_on`/`unblocks` empty almost everywhere. Nothing at that layer is behaviorally testable, and it duplicates the prose it mirrors (drift already observed in several places).
2. **GUI wiring is the single weakest area.** Only **35 of 459 (7.6%)** production wiring-matrix entries have both a real UI location and a real event; 179 rows are location-orphans ("Cataloged GUI surface"); 99 rows cite a fabricated `<module>.command_applied` placeholder event; whole command families used by the GUI specs don't exist in UI_Command_Catalog (theme, persona CRUD, alert, concern, model refresh, composer send/stop, panel undock, orchestrator pause/resume, dashboard add-widget).
3. **A handful of unadjudicated canon conflicts poison many docs at once** — file-based coordination vs seglog/redb, `platform_specs` retired-vs-live, Slint 1.17.0 vs Spec_Lock 1.15.1, tier vocabulary retired-vs-required.
4. **Numeric policy values are pervasively "pending adjudication"** (~14 orchestrator policies, retry ceilings, MCP timeouts, budgets, caps), and several P0 features exist only as "create_new_planunit" backlog tickets marked `accepted`.

## Audit trustworthiness

An independent verification agent re-opened 30 findings (15 headline claims + 15 random samples across chunks): **0 outright false; 28 fully true; 2 partially imprecise** (an exact count of empty headings — 15 strictly empty of 18, not 17; one duplicate-bullet line pairing off by two lines). Three chunk-agent claims were caught and corrected during adjudication before entering this report (see "False alarms corrected" below). Confidence in the findings below is high.

## False alarms corrected during adjudication (excluded from findings)

- "MCP_Integration.md / Section15_MVP_Promoted_Features_Spec.md don't exist" (TOOLS-1) — **false**; both exist; the agent globbed the wrong directory.
- "execution_unit_context.schema.json missing" (CONTRACTS-3) — **false**; file exists and is git-tracked.
- "runtime_artifact_*.schema.json family doesn't exist" (PROJOUT-2 / RAP audit) — **false**; all 20 exist (minified, one line each) and validate. Residual true issue: RAP-017's "until files materialize" wording is stale and should be updated.
- "Skills_System.md doesn't exist" (MISC-1) — **false**; 2,482 lines, actively cross-referenced. The related true finding stands: MiscPlan §7.10 stub vs §7.8 inline spec placement conflict.
- "interview.scope_probe.max_questions unresolved" — **false alarm**; defined at chain-wizard-flexibility.md:881 (default 2). The neighboring gap (`max_subagents_spawn` absent from interview-subagent-integration.md) is real.

## Pipeline check results

- `python3 scripts/pm-shard-plans.py --check` → pass (78 docs, 1,413 shards, 0 failures)
- `python3 scripts/pm-plans-verify.py run-gates` → pass (validate_auto_decisions, validate_evidence, lint_contractrefs, lint_banned_phrases, lint_path_refs, project artifact requirements, handoff schema, prd runtime contracts, implementation readiness, plan migration, runtime artifact schemas, goal-runtime fixtures, project-output fixtures, wiring matrix, audit closure, audit status index, shards — all pass)
- **Gap:** the run-gates suite enforces only 8 of the 14 gates defined in Progression_Gates.md; GATE-007/008 are referenced by other docs but never defined; the Verifier's own "MUST run exactly as written" rule is contradicted by the 6 unenforced gates.

## Priority fix order (P0 → P3)

**P0 — Adjudicate canon (blocks nearly everything):**
1. Storage/coordination canon: retire OSI-271's "file-based canonical" claim and every `active-agents.json` / `.puppet-master/state/*.json` mechanism (Gap #28-36, AgentCoordinator register/update/unregister/load/save) in favor of named seglog record families + redb projections — then actually name those records/events. Add a locking/atomicity contract for concurrent multi-worktree RMW state (up to 32 agents), and a crash/abort unregister path.
2. `platform_specs` authority: one ruling — retired lineage or live source. Then fix assistant-chat-design's live uses (context_window, fallback_model_ids, ACD-009), Models_System's silence (its own SSOT claim never addresses it), and Provider_OpenCode's unilateral retirement.
3. GUI toolkit truth: Spec_Lock `toolkit_version` 1.15.1 vs FinalGUISpec Slint 1.17.0 (12 mentions, "verified 2026-07-02"); purge stale Tauri references in OpenCode_Deep_Extraction (incl. "Tauri commands OR internal calls" left unresolved); source `slint_msrv: 1.92`.
4. Tier vocabulary: OSI-425 builds v1 config UX on tier labels OSI-428 retires (OSI-408 still asserts "Iteration remains the lowest tier"). Decide and reconcile; then give OSI-428's fanout/parallel/cost/retry config an actual schema with field names, units, defaults.
5. FileSafe fail-open defects (security): replace `.unwrap_or_else(BashGuard::disabled)` init (and its §15.10 "accepted mitigation" restatement) with fail-closed; fix prefix-match vs "exact match" allowlist hole; remove empty-allowlist warn-only downgrade under `strict_mode=false`; gate the destructive-override env var behind auth + audit event.

**P1 — Define the missing contracts:**
6. UI_Command_Catalog: add the missing families — cmd.theme.*, cmd.persona.*, cmd.alert.*, cmd.concern.*, cmd.model.* (refresh), composer send/stop, panel undock (Ctrl+Shift+\ per F3-058 rule), orchestrator-level pause/resume (tray), dashboard add-widget/catalog, wizard-handoff, plan-approval, retry-from-safe-point as a named command, Free Models refresh/retry/setup, FileManager cmd.file.* CRUD. Give UCC rows field-level payload/response schemas (the whole doc currently has none) and map the 6 unmapped `allowed_action_ids` (resume_after_prerequisite, restore_safe_point_then_retry, start_fresh_attempt, replan, skip_node, abort_run).
7. Wiring_Matrix.production.json: regenerate against its own contract (Wiring_Matrix.md §4.1/4.4 is strict; the production file violates it) — eliminate `command_applied` placeholders, resolve 179 location-orphans, exclude or fix the 14 bare namespace roots the exclusions file's own pattern disqualifies.
8. Contracts_V0: fill the 15 empty owner-section headings; close `wake_reason` ("| ...") and the other open enums (stop_reason_code, attention_required_reason_code, budget_kind values/defaults, node.unblocked resolution, conflict_reason_code); one canonical `safe_point.created` field set (CV-224/225 vs CV-242); add `auth` to blocked_reason_code (node.blocked already carries auth_realm/missing_scopes); pick work_package_id vs package_id; type every payload field; add per-event schema_version; give UICommand envelope a response/ack/error contract (incl. invalid_route transport); define the concern record as types, not "Define X" bullets; AuthEvent payloads.
9. Goal Runtime: enumerate the goal/goal_run event catalog with payload minima for all 21 events (5/21 today); schemas for the six new primitives (LoopBreakerRegistry, AgentControlEnvelope, CertificationReceipt, ChildAgentLease, WorkNodeRequests, AuditCycle/Finding/Closure); provider tier mappings (deferred twice).
10. Executor_Protocol: write the missing "Wake reasons and coalescing" section (forward-referenced 6×, zero headings); score-tuple algorithm; closed failure/blocked-reason enum; stream-coalescer terminal timeout; backpressure bound; transport-decision receipt schema.
11. Missing referenced docs: create or re-point WIDGETS_VISUAL_REFERENCE.md + WIDGETS_QUICK_REFERENCE.md (normative target of FinalGUISpec §8/F3-154), Release_Process.md, Terminal_Integration.md, Context_Management.md; fix `Skill_System.md` → `Skills_System.md` typo (PP-069).
12. Gates: define GATE-007/008 or renumber the references; wire GATE-011/012/013 (and the other unenforced gates) into run-gates or mark them explicitly manual with owners.

**P2 — Feature-level completion (per-doc sections below):** Section15 terminal hardening (11 P0/P1 entries currently deferred as create_new_planunit), Models_System capability matrix context-window field + fallback-chain schema + empty "Two Gemini providers" section, MS-123..133 / T-167..175 backlog-tickets-as-accepted, Plugins sandbox/signing/capabilities + hook-name reconciliation (pre_tool_invoke vs tool.execute.before), GitHub device-flow mechanics + scope list + credential store, Media enum contradiction (UNSUPPORTED/CAPABILITY_GATED) + route-row schema + Rust-regex lookaround incompatibility, MCP MI-032..038 acknowledged gaps (timeouts, heartbeat, cache eviction), Multi-Account rotation budgets/backoff + schema reconciliation, numeric defaults everywhere ("pending adjudication" ×14 in orchestrator §crew, retry one-vs-max_retries with no default, GHA polling interval, MCP timeouts, widget catalog numbers), QuestionItem schema + thread lifecycle reverse transitions (assistant-chat-design), DAG canvas command wiring (Run_Graph_View owns behavior but binds no commands), safe-point retry UI commands, persona/crew.roles schemas, PAUSE.md contract ownership.
13. PlanUnit layer hardening: replace boilerplate acceptance_criteria with behavioral ACs on gui_related/P0 units at minimum; populate depends_on/unblocks (implementation ordering is currently underivable); execute or clear the dozens of self-flagged `split_recommended: true`; fix corrupted preserved tokens (slash-fragments like "/contrast", "Fee models" typo-AC, "thodse", 66-hex "sha256").

**P3 — Hygiene:** duplicate section numbering (FinalGUISpec two "## 15" + dup "#### 7.4.2"; Tools.md two "## 10"; Plugins dup "3.2"; Commands dup "## 7", §6.4/6.5 missing, §6.6 ordering), `:v1` vs `.v1` storage-key notation drift, 18-vs-19 Settings tab count ("Tiers (retired alias)"), "13 promoted features" vs "All 12", auto_decisions.jsonl decision_id reuse + 16 malformed timestamps, INDEX chain-wizard status contradiction, stale gap-prose left in canon (RAP L114-160, A2A P5 fleet-sweep notes, Worktree §2.x gaps already resolved by PlanUnits).

## Corpus & method

73 markdown docs (~360k lines) mechanically split into 118 line-range slices (50-line overlaps, each slice ≤ ~4.3k lines) so no agent read a whole large doc; every slice got the doc's heading outline for context. 26 small docs (<2k lines) were reviewed whole, bundled 2-3 per agent; docs 2-3k lines were halved and cross-paired so no agent saw a whole doc. 5 agents extracted the full PMConcept.html GUI inventory; 4 audited the JSON artifact layer; 2 adjudicated cross-doc contradictions and the concept↔plans gap; 3 synthesized; 1 verified. 128 findings files (raw, with per-finding line refs beyond what this report carries) are preserved in the audit working directory. Sections below: cross-doc adjudication → concept↔plans gap analysis → per-doc digests (core, systems, remaining + JSON) → verification transcript.

---

# PART 1 — Cross-document contradiction adjudication

# Cross-Document Consistency Adjudication (XREF)

Adjudicator: XREF. All evidence re-verified by direct grep/read against `/PuppetMaster/Plans/` (line numbers from current tree, 2026-07-06). Severity rubric: [CRITICAL] blocks implementation, [HIGH] causes wrong implementation, [MED] causes rework/confusion, [LOW] cosmetic/tracked. Tags: INCONSISTENT (real contradiction), OPENREF (dangling reference), UNDERSPEC, FALSEALARM (chunk finding refuted), OWNER-DECISION.

---

## 1. Storage canon: file-based coordination vs seglog/redb projection

**VERDICT: REAL CONTRADICTION [CRITICAL][INCONSISTENT]** — internal to `orchestrator-subagent-integration.md`, and OSI-271 contradicts its own dependency.

Evidence:
- OSI-271 canonical_text, `orchestrator-subagent-integration.md:22476-22478`: "File-based coordination is always on ... without replacing **file-based coordination state as the source of truth**"; preserved_exact_tokens `:22505-22509`: "File-based coordination (canonical)", "single source of coordination truth". OSI-271 `depends_on: [OSI-270]`.
- OSI-270 canonical_text `:22420-22423`: "All platforms use the **canonical coordination projection, optional active-agents.json debug mirror**".
- OSI-225 canonical_text `:19967-19970`: "AgentCoordinator ... projected from seglog/redb; optional debug mirrors may exist, but **active-agents.json is not canon**."
- Body text agrees with projection-canon: `:3149` ("active-agents.json is not canonical runtime truth"), `:3511`, `:3745`, `:4070`, `:4375` ("Optional debug mirror").
- Cross-doc: `Media_Generation_and_Capabilities.md:483` (active-agents.json "compatibility inputs only, while /redb ... own durable execution state"); `Contracts_V0.md:456` (retire "split-brain state files"); `storage-plan.md:131,2801` (registers active-agents under project_state family, not as canon).
- Chunk-citation correction: INV-002/INV-006 (`Architecture_Invariants.md:78,121-123`) are secrets/provider-isolation invariants that merely *name* seglog/redb as the persistent store — they are supporting, not the mandate source. The mandate is OSI-225/OSI-270 + storage-plan.
- Ad hoc `.puppet-master/state/*.json`: live instructions at `:1779` (`verification-{node_id}-end.json`) and `:2367` (`handoff-validation-{node_id}.json`); the doc itself concedes at `:15097` "path is preserved from source and requires storage-owner alignment". `agent-messages.json` is properly fenced as optional mirror (`:3673,:3754`).

**FIX:** Rewrite OSI-271 canonical_text/preserved tokens to match OSI-225/270 ("file mirror always available for debugging; seglog/redb projection is the single source of coordination truth"), or mark span S0142 compatibility-only. Register or retire the two ad hoc state-file paths with storage-plan.

---

## 2. platform_specs authority

**VERDICT: REAL CONTRADICTION [HIGH][INCONSISTENT+OPENREF]** — mostly internal to `assistant-chat-design.md`, plus one dangling ContractRef.

Evidence:
- Retired: `Provider_OpenCode.md:51` ("Legacy `platform_specs.rs` references are source-lineage only"), `:430`, `:515` (§11 "Legacy platform_specs lineage"), `:679` ("retired/source-lineage only; not active provider capability SSOT").
- Claimed SSOT never mentions it: `Models_System.md:1` ("Canonical SSOT"), MS-002 `:1398` — **0 occurrences** of `platform_specs` in Models_System.md.
- `assistant-chat-design.md` negates it: `:194` ("no legacy platform_specs authority"), `:195` ("never platform_specs::fallback_model_ids(platform)"), `:2319` ("source-lineage only") — yet uses it live: `:49` ("single source of truth for platform data (`platform_specs`)"), `:1904` + `:1910` ("Max tokens sourced from `platform_specs::context_window(provider)`"), `:2108`, `:2333` ("same `platform_specs` data source").
- Dangling ContractRef: `assistant-chat-design.md:2344` cites "`Plans/Contracts_V0.md` — platform_specs contract" — `platform_specs` has **0 hits in Contracts_V0.md**.

**FIX:** In assistant-chat-design.md replace live `platform_specs` uses (:49, :1904, :1910, :2108, :2333) with Models_System/capability-resolver vocabulary (e.g., "context window from the provider/model capability snapshot"); delete or repoint :2344.

---

## 3. GUI toolkit versions / Tauri residue

**VERDICT: REAL [HIGH][INCONSISTENT] (Spec_Lock stale) + REAL [MED] stale Tauri prose + [LOW] unsourced MSRV.** OWNER-DECISION for the Spec_Lock edit.

Evidence:
- `Spec_Lock.json:333-336`: `"legacy_toolkit": "iced", "toolkit": "slint", "toolkit_version": "1.15.1"` vs `FinalGUISpec.md:133,166,198,2587` "Slint **1.17.0** ... verified current stable on 2026-07-02" (12+ occurrences incl. planunit tokens :4997, :18114) and `PMConcept_Control_Reconciliation.json:34216` `"slint_stable": "1.17.0"`.
- Tauri: `OpenCode_Deep_Extraction.md:705` ("wire this through its **Tauri GUI** or CLI interface") and `:771` ("Puppet Master uses **Tauri + Rust backend**") read as live statements; ODE-072 `:4453` preserves "maps API surface to Tauri commands or internal Rust function calls" — unresolved delta. Contradicts FinalGUISpec (Slint/winit/Skia) and INV-022 (`Architecture_Invariants.md:373` service-bound native workbench). `Architecture_Invariants.md:378,3063` Tauri mentions are external-repo bench lineage (acceptable); `newtools.md` Tauri mentions are target-project GUI-framework examples (fine).
- `slint_msrv "1.92"`: only `PMConcept_Control_Reconciliation.json:34217`; no source/verify date (FinalGUISpec pins Rust stable 1.96.1 verified 2026-07-02). Not a contradiction (MSRV < stable) but unsourced.

**FIX:** Owner decision: update Spec_Lock `ui.toolkit_version` to 1.17.0 (Spec_Lock is a do-not-edit-without-instruction artifact). Mark ODE :705/:771 Tauri statements retired-lineage with pointer to FinalGUISpec/INV-022 and resolve ODE-072's "Tauri commands OR internal calls" to "internal Rust calls under the Slint workbench". Add source note for slint_msrv or drop it.

---

## 4. Missing files referenced as normative

Split verdicts:

| Reference | Verdict | Evidence | Fix |
|---|---|---|---|
| `WIDGETS_VISUAL_REFERENCE.md` + `WIDGETS_QUICK_REFERENCE.md` | **REAL [HIGH][OPENREF]** — cited as alignment targets, stated as existing | `FinalGUISpec.md:1745` ("Detailed widget references align with `Plans/WIDGETS_VISUAL_REFERENCE.md` and `Plans/WIDGETS_QUICK_REFERENCE.md`"); F3 unit `:11772,:11799-11800`. Neither file exists. | Create both, or repoint §8/F3-154 to the in-doc §8 catalog. |
| `Built_In_Terminal_Runtime.md` | **FALSEALARM as dangling [LOW]** — explicit proposal, not a normative pointer | `Section15_MVP_Promoted_Features_Spec.md:8193,8265`: "Add PlanUnits under Section15 **or a new** Built_In_Terminal_Runtime.md" | Track as open decision (terminal protocol test matrix owner). |
| `Release_Process.md` | **REAL [MED][OPENREF]** | `Release_Supply_Chain.md:296,323,328` — listed under `implementation_surfaces` as if real | Create stub or repoint to Release_Supply_Chain sections. |
| `Supply_Chain_Security.md` | **FALSEALARM [LOW]** — self-declared conditional | `Release_Supply_Chain.md:402,410`: "new Supply_Chain_Security.md **if owner doc is missing**" | None; resolve during compile. |
| `security-sanitization.md` | **FALSEALARM [LOW]** — explicitly future | `assistant-chat-design.md:2508`: "until a dedicated `Plans/security-sanitization.md` owner exists ... lineage for that proposed split, not the current owner" | None; keep rendering contract in ACD until split. |
| `Skill_System.md` (PP-069) | **REAL [MED][OPENREF]** — near-certain typo for existing `Skills_System.md` | `Prompt_Pipeline.md:4792-4799` (target_docs + owner_hints); `Skills_System.md` exists, `Skill_System.md` does not. `Plan_Document_System.md:970` already flags it as a "missing placeholder" to adjudicate. | s/Skill_System.md/Skills_System.md/ in PP-069. |
| `Context_Management.md` | **REAL [MED][OPENREF]** — no file, no owner | `Prompt_Pipeline.md:4792,4798`; `Plan_Document_System.md:970,1004` (flagged "missing placeholder") | Assign scope to Prompt_Pipeline/assistant-memory or create doc. |
| `Terminal_Integration.md` | **REAL [MED][OPENREF]** | `Section15...md:9075,9080`, `Goal_Runtime_System.md:2916,2922`, `Automated_Testing_System.md:1764,1769`, `Plan_Document_System.md:970,1003` (self-flagged missing placeholder). NOT referenced in rewrite-tie-in-memo.md (chunk detail wrong — 0 hits). | Repoint to Section15 terminal ownership or create doc at compile time. |

---

## 5. Disputed existence claims

**VERDICT: all three "does not exist" claims are FALSE ALARMS [FALSEALARM] — chunk-agent tooling errors (Glob/grep run from the audit outputs cwd, not the repo).**

- `MCP_Integration.md` **exists** (131,984 bytes) and `Section15_MVP_Promoted_Features_Spec.md` **exists** (494,802 bytes) — TOOLS-1's two CRITICAL OPENREFs (TOOLS-1.md:5-6,31-32) must be discarded; Tools.md §5/§8.6/§8.7 deferrals are valid.
- `execution_unit_context.schema.json` **exists** and is git-tracked (commit c59571551; `$id` https-form per JSON-SCHEMAS.md:21). CONTRACTS-3.md:8,41 wrong; EXEC-1.md:23 right. CV-154's machine-artifact anchor is satisfied.
- `runtime_artifact_*.schema.json`: **exactly 20 files exist** (mtime Jul 2 13:21, before the audit): 19 type schemas + `runtime_artifact_envelope.schema.json`. JSON-SCHEMAS.md:8,38,53 validated them and confirmed the envelope's 19-value `artifact_type` enum exactly matches the 19 type filenames ("PERFECT MATCH"). The "21" figure was a task-prompt error (JSON-SCHEMAS.md:26), not a filename mismatch — **no expected-filename differences exist**. PROJOUT-2.md:3,7,20 and BUNDLE-1.md:15,35 non-existence claims discarded.
- Residual real item [LOW]: RAP-017 (`Runtime_Artifacts_Panel.md:589-593`) still says "**until files materialize**, this section is normative" — stale now that all 20 files exist; this stale phrasing is what misled BUNDLE-1. FIX: update RAP-017 to "files are materialized; schemas are canon, this section is commentary."
- Synthesis guidance: treat any chunk claim of file non-existence as unverified unless accompanied by `ls` evidence from the repo path.

---

## 6. UI_Command_Catalog missing command families

**VERDICT: REAL GAPS [HIGH][UNDERSPEC] — confirmed absent across ALL Plans docs (grep `*.md`+`*.json`, excl. `_shards`), not owned elsewhere.** Binding rule: INV-011 (`Architecture_Invariants.md:168-176`) — UI may only dispatch typed UICommands, so each feature below is currently unwireable.

- `cmd.theme.*`, `cmd.persona.*`, `cmd.alert.*`, `cmd.model.*`: **zero hits repo-wide**. (UCC's 11 "persona" hits are retired-alias/payload notes, e.g. `UI_Command_Catalog.md:155`; theme features live in FinalGUISpec Settings/custom-themes with no command IDs.)
- `cmd.concern.*` (+ `cmd.account.*`, `cmd.promotion.*`): absent, and the corpus itself says so — `Runtime_Artifacts_Panel.md:114` and RAP-009 `:544` preserve "there are still no stable cmd.account.*, cmd.concern.*, cmd.promotion.* families" as gap evidence (also ledger `w-20260312-203855/working_ledger.md:8874`). Self-acknowledged, still unfixed.
- Composer send/stop: UCC's only send-adjacent row is `cmd.chat.resend_last_user_message` (`UI_Command_Catalog.md:949`); no primary send, no stop/interrupt command.
- Panel undock: FinalGUISpec F3-067 (`FinalGUISpec.md:7095-7104`) requires undock via "keyboard shortcut Ctrl+Shift+\ **or command palette actions**" (also `:753,:879`) — command palette requires a command ID; UCC has zero "undock" hits.
- Orchestrator-level pause/resume: tray menu mandates it (`FinalGUISpec.md:529` "Right-click tray menu: Show/Hide | **Pause/Resume Orchestrator** | Quit") but UCC's pause/resume families are only `cmd.plan_compile.pause/resume` (:7846-7847), `cmd.debug.pause/resume` (:970), `cmd.browser.pause_agent` (:818), `cmd.runtime.resume_after_prerequisite` (:1151). `cmd.orchestrator.*` exists only as `build_run`/`push_image` (`Containers_Registry_and_Unraid.md:474-475`).
- Dashboard add-widget: flow specified at `FinalGUISpec.md:1228,2638,2659` and UF-062 (`usage-feature.md:4171-4207`); zero `add_widget` command hits in UCC.

**FIX:** Add rows to `UI_Command_Catalog.md` for: theme apply/switch, persona select/manage, alert acknowledge/route, concern operations, model list refresh, `cmd.chat.send` + `cmd.chat.stop`, `cmd.panel.undock`/`redock`, `cmd.orchestrator.pause`/`resume` (tray + palette), `cmd.dashboard.add_widget`. Where a family is deliberately deferred, name the owner doc explicitly.

---

## 7. Contract field drift (all within/around Contracts_V0.md)

1. **`safe_point.created` worktree fields — REAL [HIGH][INCONSISTENT].** Minimum payload `Contracts_V0.md:2212-2215` + prose `:2220` + CV-224 acceptance `:13751-13752`: `worktree_branch?`, `working_directory?`. Normative guard `:2407` + CV-242 `:14620-14628` (preserved tokens): `branch_name`, `HEAD_sha`. Same event, same doc, two field sets; `worktree.created` (`:844`) already uses `branch_name`. FIX: converge on `worktree_id, worktree_path, branch_name, HEAD_sha` (+`working_directory` if needed); update CV-224 + §payload list.
2. **`non_selected_nodes[]` vs `non_selected[]` — REAL [MED][INCONSISTENT].** `scheduler.pass` minimum payload `:2121` (`non_selected_nodes[]` with `{node_id, non_selected_reason}`; planunit token `:13400`) vs runtime-event-family addendum `:2348` (`non_selected[]`; planunit `:14370-14402`). FIX: canonical `non_selected_nodes[]`, mark `non_selected[]` as retired alias.
3. **`blocked_reason_code` 16-value enum lacks auth — REAL [HIGH][UNDERSPEC].** Closed enum `:2456-2472` (16 values, none auth). Yet `wake_reason` includes `auth_recovered` (`:540`) and "auth" wakes (`:2105`); blocked payloads may carry `auth_realm`/`missing_scopes[]` (`:2395`); GitHub-Actions blocked detail includes "auth expired" (`:2475` ¶). `auth_expired` is only a `failure_class` with one retry (`Executor_Protocol.md:377`) — a node blocked awaiting re-auth has no valid code. FIX: add `auth_required` (or normatively state which existing code covers auth blocks and how `auth_realm` co-occurs).
4. **`work_package_id` vs `package_id` — REAL [MED][INCONSISTENT].** `tool.invoked`/`tool.denied` described with `work_package_id` at `:462,:4463,:4494` but `package_id` in the payload tables `:1154,:1179` and planunit `:7372`; `worktree.*` events use `package_id` (`:844-845`); `Executor_Protocol.md:225` uses `work_package_id`. FIX: declare one canonical name (payload tables suggest `package_id`) + alias disposition for the other.
5. **`wake_reason` open-ended enum — REAL [MED][UNDERSPEC].** `:540` literally ends "`| startup_recovered | ...`"; `:2105` is "values **include** ..."; no closed enum anywhere. FIX: publish the closed value list in the scheduler.pass section.
6. **`requested_effective_snapshot_ref?` vs `requested_effective_snapshot_refs` — PROBABLE FALSEALARM / OWNER-DECISION [LOW].** Singular on event rows (`:416,:835,:3894,:3903,:3921`); plural only on the shared record envelope (`:568,:4895,:4924`). Reads as intentional (event→one ref; record→join list) but the relationship is never stated. FIX: one clarifying sentence.

---

## 8. Duplicate/broken section numbering

**VERDICT: ALL CONFIRMED [MED, mechanical].** grep -n `^##` evidence:

- `FinalGUISpec.md`: two "## 15." — `:2239` (Persistence) and `:3332` (Promoted widget catalog). Two "#### 7.4.2" — `:1286` (Indexing settings subsection) and `:1400` (Agent Config Skills tab).
- `Tools.md`: two "## 10." — `:1272` (Implementation plan: permissions) and `:1531` (Firecrawl provider integration).
- `Plugins_System.md`: two "### 3.2" — `:120` (Deterministic load order) and `:128` (Plugin lifecycle).
- `Commands_System.md`: two "## 7" — `:492` (Reserved built-in slash commands) and `:575` (UICommand catalog entry). §6 subsections are out of order AND gapped: `### 6.6` at `:408` precedes `### 6.1` (`:425`), `6.2` (`:478`), `6.3` (`:490`); **6.4 and 6.5 do not exist**.

**FIX:** Renumber (second §15→§16 etc.); then re-verify every anchor/ContractRef citing the affected section numbers (e.g., "§15", "§7", "§3.2") since section-number citations are load-bearing in ContractRefs.

---

## 9. Terminology conflicts

- **19-tab Settings registry — REAL AMBIGUITY [MED][OWNER-DECISION].** §7.4.4 table (`FinalGUISpec.md:1298-1318`) contains exactly **19 rows including** "Tiers (retired alias)" (`:1302` — "Compatibility/search alias only"), while `:1320` and F3 unit `:9326-9338` declare "canonical **19-tab** registry ... includes Terminal". Visible tabs are therefore 18 unless a retired alias counts as a tab. FIX: restate as "18 tabs + 1 retired-alias registry row" (or move the alias out of the table).
- **Promoted MVP feature count — REAL [MED][INCONSISTENT].** F3-268 (`FinalGUISpec.md:17890-17894`) lists **13** features (includes "search"); `:2597` says "**All 12** former future considerations are MVP" and omits search (token preserved at `:18173`). FIX: reconcile — likely 13 with search promoted, or state search's separate promotion lineage.
- **Glossary InstantGrep → Tools.md — PARTIAL FALSEALARM, with a REAL primitive dangler [MED][OPENREF].** Tools.md *does* contain "Instant Grep" (`Tools.md:11161`, one PlanUnit), so the name pointer isn't fully dangling. But Glossary's ContractRef (`Glossary.md:272`) cites `Primitive:SparseNgramIndex, ContractName:Plans/Tools.md` and **SparseNgramIndex has 0 hits in Tools.md** (owners: Glossary.md + 00-plans-index.md only); the entire index primitive spec (Roaring bitmaps, xxh3, ArcSwap snapshots — `Glossary.md:275-277`) lives only in the Glossary. FIX: add the SparseNgramIndex/InstantGrep section to Tools.md (grep/Search-panel integration owner) or repoint the ContractRef.
- **Plugin hook names — REAL [HIGH][INCONSISTENT].** `Plugins_System.md` hook catalog defines `tool.execute.before`/`tool.execute.after` (`:208,:216`; manifest example `:81`; full catalog `:208-311` = tool.execute.*, permission.ask, session.start/end, chat.message/params, session.compacting, shell.env, system.prompt.transform). The "Plugin Hook Blocked Specification Addendum" (`:614-624`, PLG unit `:3762,:3794-3801`) instead uses `pre_tool_invoke`, `pre_attempt_start`, `pre_node_dispatch`, `post_tool_invoke`, `post_attempt_complete` — **five hook names absent from the catalog** (and `pre_attempt_start`/`pre_node_dispatch` have no catalog equivalent at all). FIX: map addendum names to catalog names (`pre_tool_invoke`→`tool.execute.before`, `post_tool_invoke`→`tool.execute.after`) and either define attempt/node-dispatch hooks in the catalog or drop them from the blocked spec.

---

## 10. GATE registry integrity

- **GATE-007/GATE-008 — REAL [MED][OPENREF, self-acknowledged].** `Progression_Gates.md` registry runs GATE-001..006 (`:213-:286`) then jumps to GATE-009 (`:297`); GATE-007/008 appear **nowhere** in the doc. Referencing docs demand visibility: `Run_Modes.md:176` + RM-013 `:798` ("missing GATE-007 / GATE-008 placement"); `chain-wizard-flexibility.md:2296` + `:9653,:9672-9673` ("Gate-registry integrity must keep GATE-007, GATE-008 ... /reserved tombstone handling visible"). FIX: add reserved/tombstone entries for GATE-007/008 in Progression_Gates.md.
- **GATE-011/012/013 not enforced by run-gates — FALSEALARM as contradiction [LOW].** Self-documented pending state: `Progression_Gates.md:148` ("GATE-011, GATE-012, GATE-013 target the traceability layer (**not yet enforced by run-gates; pending** traceability artifact generation integration)") and `:149` (same for GATE-014). `scripts/pm-plans-verify.py` keys checks by name (spec_lock, plan_graph, shards, runtime_artifact_schemas, ...), never by GATE-ID. Open work, not drift.
- **Other nonexistent gate IDs: NONE.** Repo-wide gate references resolve to GATE-001..014 only (counts: 001×54 ... 014×62); every referenced ID except 007/008 exists in the registry.

---

## 11. Missing named values

- **`max_subagents_spawn` — REAL [MED][OPENREF].** `Crosswalk.md:145` maps "Per-interview reviewer cap (`max_subagents_spawn`)" to `Plans/interview-subagent-integration.md`; that doc has the reviewer-cap *concept* (ISI-017, `interview-subagent-integration.md:819-826,860`: reviewer cap "consume[s] the Orchestrator concurrency SSOT") but the key name appears **nowhere in the repo except the Crosswalk row**. FIX: define the key in the interview doc (or rename the Crosswalk row to the actual Orchestrator concurrency SSOT key).
- **`interview.scope_probe.max_questions` — FALSEALARM as "missing" [LOW residual].** It IS defined: `chain-wizard-flexibility.md:881` ("Config: `interview.scope_probe.max_questions`, default `2`") + CWF-050 token `:5002`. CHAINWIZ-2/BUNDLE-9 grepped only interview-subagent-integration.md, which indeed never references it. FIX: add a cross-reference from the interview doc to the chain-wizard-flexibility owner definition.
- **`widget-custom-metrics` — REAL [MED][OPENREF].** FinalGUISpec locks it into the exact 4-widget default Dashboard catalog (`FinalGUISpec.md:1228,:2649`) and the F3 unit `:18541-18547` states "**Widget_System consumes this named catalog directly**" — but `Widget_System.md` has **0 occurrences** of custom-metrics/custom_metrics. FIX: register `widget-custom-metrics` in Widget_System.md (spec: user-defined metric display, user-generated, optional).

---

## 12. PAUSE.md file contract ownership

**VERDICT: NEEDS OWNER DECISION [MED][UNDERSPEC].** The mechanism is referenced as live but its only definition is fenced as source-lineage.

Evidence:
- Only definition: `orchestrator-subagent-integration.md:5973` ("Add `PAUSE.md` file check before each iteration"), `:5982` + `:6143` (location `.puppet-master/PAUSE.md`), `:5796,:6135` (existence halts run; enables safe editing of tasks/progress).
- But OSI-380 (`:28437-28444`) classifies "PAUSE.md halting" among "**source-lineage concepts**", and the pause-gate planunit (`:28837+`, tokens `check_pause_gate`, ".puppet-master", "PAUSE.md") carries compatibility note "Rust snippet is **source-lineage evidence only**".
- Meanwhile `human-in-the-loop.md:253` and HITL unit `:1565` treat the "global PAUSE.md pause gate" as a live, coexisting mechanism ("global pause can coexist; HITL adds gate-specific approval points").
- No doc defines: who creates/removes the file, file content (if any), emitted event, GUI/tray mapping (ties to item 6's missing `cmd.orchestrator.pause/resume`).

**FIX:** Either (a) promote a canonical pause-gate contract in orchestrator-subagent-integration.md (existence semantics, writer, emitted event, command mapping) and have HITL reference it by anchor, or (b) retire the file mechanism and repoint human-in-the-loop.md:253 to the runtime pause command family.

---

## Additional dangling references (OpenRefs sweep across 128 chunk files, ≥2 mentions, verified by grep)

Live danglers (5 total; #1-2 fold into items 9/2 above):
1. **`SparseNgramIndex`** — Glossary ContractRef targets `Plans/Tools.md`; 0 hits there (see item 9).
2. **"Plans/Contracts_V0.md — platform_specs contract"** (`assistant-chat-design.md:2344`) — 0 platform_specs hits in Contracts_V0.md (see item 2).
3. **`project_root_id`**, 4. **`target_object`**, 5. **`cmd.docker.open_target`** — each exists ONLY as preserved_exact_tokens in one `Containers_Registry_and_Unraid.md` planunit (`:1851,:1855,:1856`, Docker Manager deep-link routing); no definition anywhere in Plans. FIX: define in the Docker deep-link routing contract or mark compatibility-only.

Historical, already correctly adjudicated LOW (not live danglers): `Plans/rebrand.md`, `Plans/Rebrand_Chunked_Playbook.md`, `Plans/RECOVERY_AUDIT_REPORT.md`, `Plans/RECOVERY_FIX_QUEUE.md`, `transfer_state/**` — `auto_decisions.jsonl` applied_to paths for post-decision cleaned-up artifacts (JSON-STATE.md:10,28); fix is an optional `historical`/`target_status` flag in the ledger schema, not file creation. `Plans/auto_decisions.json` (x3 in chunks) is a chunk-side extension typo for the real `auto_decisions.jsonl`; 0 such refs in Plans docs.

Verified non-issues from the sweep: `workspace_root_id` (8 hits), `verifier_result` (23), `buildability_gate_report` (31), `UsageRecord` (60), `BinaryErrorCode` (7), `cmd.chat.worktree.*` (187) — all resolve in Plans.

---

# PART 2 — PMConcept.html ↔ Plans gap analysis (two-way)

# CONCEPT-GAP — Two-way gap analysis: Concepts/PMConcept.html ↔ Plans/

**Verdict: NOT READY (both directions).** Concept→Plans: all 44 `production_wiring_required` controls (= 23 distinct command surfaces) exist as wiring rows but 100% of wiring-matrix rows self-declare "not implementation proof," and the approval/git/runtime families the concept treats as core carry fabricated `*.command_applied` placeholder events. Feature-level: of 27 major concept features, 14 COVERED, 10 PARTIAL, 3 CONTRADICTED-superseded; 12 concrete concept-vs-plans contradictions found. Plans→Concept: 12 plans-mandated GUI surfaces are fully ABSENT from the concept and 8 more only vestigial — expected (concept predates the addenda) but the final design has no source imagery for any of them.

Inputs: PMCONCEPT-1..5.md, JSON-RECON.md + JSON-RECON-gaps.md (1284 controls; sha256 match vs current PMConcept.html), JSON-WIRING.md, GUI-1..7.md; direct greps of `Plans/**` and `Concepts/PMConcept.html` (repo read-only). Concept line numbers = PMConcept.html; F3-xxx = FinalGUISpec.md PlanUnits.

---

## A. CONCEPT → PLANS

### A1. The 44 production_wiring_required controls — the real engineering backlog

The 44 rows de-duplicate to **23 distinct canonical command surfaces** (JSON-RECON-gaps.md says "~28"; exact recount of unique `canonical_command_id`s is 23). Every one exists in `Plans/UI_Command_Catalog.md` and has a `Wiring_Matrix.production.json` row (JSON-WIRING verified all 23 keys present) — so nothing is *unnamed*; what is missing everywhere is handler/state/receipt/test evidence, and for most, a real emitted event.

| # | Command surface (canonical id) | Concept control(s) / lines | Wiring reality (Wiring_Matrix.production.json) | Sev |
|---|---|---|---|---|
| 1 | `cmd.search.replace_all` | Search "All"/"Replace All" 9060, 9118 | Row exists; receipt-only, no event | HIGH |
| 2 | `cmd.search.set_scope` | Scope select 9070 | receipt-only | MED |
| 3 | `cmd.search.show` | per-file result group headers 9083/9095/9104 | receipt-only | MED |
| 4 | `cmd.search.open_result` | 6 result rows 9084–9108 | receipt-only | HIGH |
| 5 | `cmd.search.replace_selected` | "Replace" 9117 | receipt-only | MED |
| 6 | `cmd.search.previous_result` / 7 `cmd.search.next_result` | Prev/Next 9121–9122 | receipt-only | LOW |
| 8 | `cmd.git.diff_open` | file rows 9268/9281/9288 | event = placeholder `source_control.command_applied` (fabricated; defined nowhere outside the matrix — JSON-WIRING CRITICAL) | HIGH |
| 9 | `cmd.git.stage_hunks` | + buttons 9283/9290 | placeholder event | HIGH |
| 10 | `cmd.git.unstage_hunks` | − button 9270 | placeholder event | HIGH |
| 11 | `cmd.git.discard_hunks` | ✕ buttons 9271/9284/9291 | placeholder event; destructive action with no domain event | HIGH |
| 12 | `cmd.git.diff_search` | SC diff-search input 9304 | placeholder event | MED |
| 13 | `cmd.git.conflict_apply_resolution` | Apply Ours/Theirs 9319–9320 | placeholder event; destructive | HIGH |
| 14 | `cmd.git.diff_set_compare_target` | Set Compare Target 9383 | placeholder event | MED |
| 15 | `cmd.remote.reconnect` | Reconnect 9341 | receipt-only | MED |
| 16 | `cmd.source_control.history_open_commit` | 3 commit rows 9363/9368/9373 | placeholder event | MED |
| 17 | `cmd.orchestrator.switch_tab` | Open Plan Compile 9921, 10931 | catalog row | MED |
| 18 | `cmd.plan_compile.open_build` | Open Build 9927, 10936 | placeholder `plan_compile.command_applied`; also "Cataloged GUI surface" orphan twin | HIGH |
| 19 | `cmd.prd_builder.approve_for_planning_wizard` | Approve PRD 10757 | pre-implementation contract only | **CRITICAL** (launch-path gate) |
| 20 | `cmd.planning_wizard.approve_and_build` | Approve And Build 10875 (data-state-selector/CAS receipt attrs) | in the 179 "Cataloged GUI surface" location-orphan set | **CRITICAL** (sole ordinary launch authority per Planning_Wizard.md:111, PWIZ-010:710–785) |
| 21 | `cmd.runtime.approve` | Approve Step 10977 | placeholder `runtime.command_applied` | **CRITICAL** (HITL gate) |
| 22 | `cmd.chat.revert` | Revert Last Edit 14999, 15631 | real location row; file-mutation semantics routed to unnamed "Source Control or FileSafe command" (F3-171, GUI-4 HIGH) | HIGH |
| 23 | `cmd.chat.rewind` | Rewind Chat 15000, 15632 | real location row; revert≠rewind semantic owned only by concept caption | HIGH |

Context that makes this the top-line number: **only 35/459 (7.6%) of all wiring-matrix entries have both a real UI location and a real emitted event** (JSON-WIRING); 459/459 `evidence_required` fields open with "this row is not implementation proof." So even the "adjudicated covered" 1175 concept controls rest on a wiring layer that is a contract, not evidence.

### A2. Feature-level coverage — 27 major concept features vs Plans owners

| # | Concept feature (evidence) | Plans owner (doc / section) | Status | Sev / what's absent |
|---|---|---|---|---|
| 1 | Worktree-per-thread lifecycle: bind/unbind/create/merge modals, clean/dirty/conflict pills, SC Worktrees filter (9168–9241, 14645–14658, 18551–18663) | WorktreeGitImprovement.md — topology view "Source Control > Worktrees" (:382), rebind/lineage rules (:223, :244), lease/write-mode labels (:4850); `cmd.git.worktree_*` ×17 in wiring matrix | PARTIAL | HIGH — all 17 worktree commands are "Cataloged GUI surface" location-orphans with placeholder events; merge-modal GUI (squash/merge/rebase + pre-merge test gate + Merge Anyway, concept 18032–18074) has no plans-side card/dialog spec; only "worktree merge checks" phase ordering (:2885) |
| 2 | 9-provider auth + quota-confidence chips AUTH/EST/Inferred/Passthrough (11619–11631, 11909–12238, 12815–13158) | Multi-Account.md (owner), CLI_Bridged_Providers.md, usage-feature.md (confidence/quota), Provider_OpenCode.md | COVERED | MED residue — Cursor CLI ACP re-evaluation is an open decision with no owner/date (F3-032, GUI-2); provider diagnostics Revalidate not command-bound (F3-116) |
| 3 | Requested-vs-effective model disclosure w/ fallback reason (9840–9841, 12791, ctx-detail rows) | Models_System.md; F3-112 operational-identity payload; F3-293/294/295 disclosure fields + 4 surfaces | PARTIAL | HIGH — no event/IPC name delivers Honored/Skipped/Clamped disclosures and no persistence contract for run-history copies (GUI-6 HIGH) |
| 4 | Embedded browser + automation takeover (Pause/Continue/Stop 9683–9685) + element-pick/selection/screenshot-to-chat (9653–9655) + permissions requested-vs-effective panel (9664–9674) | Section15_MVP_Promoted_Features_Spec.md (browser contract); FileManager.md; UCC takeover cmds; `catalog.browser_add_*` rows; storage `browser_session_state.v1` | COVERED | MED — plans-internal engine contradiction (locked CEF-class Chromium vs stale `wry` still hardcoded in FinalGUISpec §14.1 — GUI-1); browser_add_* rows are location-orphans |
| 5 | 9-step Planning Wizard w/ data-command CAS gates (10448–10890; `approval_cas_receipt`, `PlanApproved`, `PlanCompileRun_created_or_bound` 10875) | Planning_Wizard.md (PWIZ-010 :710–785; GUI repair addendum :97+); PRD_Builder.md; F3-398 (commands typed in UCC ~6870–6984, verified) | PARTIAL | HIGH — plans replaced the linear 9-step stepper with a topic-graph PlanningRun (`cmd.planning_wizard.topic_add/split/merge/reorder/...`); only Approve And Build and the doc-review steps survive recognizably; concept stepper must not be treated as final IA |
| 6 | Orchestrator DAG: zoom/fit/minimap/quick-filters/layout presets, node table, Safe-Point retry, detail C1–C4+C6 (11094–11237, 18392–18398) | Orchestrator_Page.md (7-tab shell :1, :44; OP-023 Plan Compile); Run_Graph_View.md (minimap/zoom/overlays :44/:79/:100/:381–413; node/attempt inspector :31/:94; safe-point + `cmd.orchestrator.restore_safe_point_then_retry` :108/:116) | COVERED | MED — plans do not use the concept's C1–C6 section numbering at all (grep C5 = 0), so the concept's missing-C5 is moot but its labels are not spec; "Retry from safe point"/"Start fresh attempt" labels lack UCC ids (GUI-6 MED) though `catalog.runtime_restore_safe_point_then_retry`/`_start_fresh_attempt` matrix rows exist |
| 7 | Multi-pass review config (passes/max-subagents/use-different-models at 10585, 10696–10700, 10852–10858) | Models_System.md; orchestrator-subagent-integration.md; interview-subagent-integration.md (`max_subagents_spawn`, Crosswalk :145) | PARTIAL | HIGH — F3-296 Multi-Pass persona/provider mapping editor has no schema, storage key, settings location, or save command (GUI-6 HIGH) |
| 8 | Run budget/strategy: Mode Regular/Yolo/Plan/Ask, Strategy DAE/HTE, outcomes OK/BUDGET/ROTATED/DEFERRED (11828–11880) | Run_Modes.md (`done.deferred` :383, `done.rotated` :384, rotation rules :426–441); Executor_Protocol.md; Decision_Policy.md; budget-outcome supervision orchestrator-subagent-integration.md:47 | COVERED | LOW |
| 9 | Crew Mode debate board + synthesis (17872–17983); Settings: consensus modes, debate rounds | orchestrator-subagent-integration.md — crew message-board contract (:75, :3667–3729), crew scheduling (:31) | PARTIAL | MED — debate board + parent mediation covered; concept's consensus-mode (majority/unanimous/lead-decides) and debate-round-cap settings not found as plans controls |
| 10 | Debug Mode: DAP header, Investigation Context, Export Investigation Bundle, Reopen/Retry/Supersede/Close (17655–17741) | assistant-chat-design.md §11.0A (:1082–1104 reopen semantics incl. resolved/cancelled/superseded/blocked/attention_required/failed_cleanup); `cmd.debug.*` ×10 (UCC :970); `cmd.chat.export_investigation_bundle` + `revoke_investigation_item` (UCC :7873); newtools.md :1114–1115; `debug_investigation_record.v1` | COVERED | LOW — best-covered concept feature |
| 11 | Batch fan-out: 25 subagents, groups of 10, 11 running concurrently (18092–18270); Settings "max concurrent 25 / batch group 10" | Run_Modes.md RM-015 (:810) | **CONTRADICTED** | HIGH — locked caps are `max_concurrent_crews_per_platform=4`, `max_concurrent_agents_per_crew=8`, `max_total_active_agents=32`, non-overridable; concept's 25/10 numbers echo the explicitly retired "5-crews/10-agents" wording; batch-group card UI itself has no plans spec |
| 12 | Escalation mediation: "awaiting parent", "blocked by policy", Approve/Override buttons (18273–18390) | orchestrator-subagent-integration.md (:61 parent-owned escalation, :1003, :1078); Contracts_V0.md ("awaiting parent") | PARTIAL | MED — semantics covered; the concept's parent-mediation button set (Approve Indexes / Use Mat. Views / Override Policy) has no command family or card spec |
| 13 | Terminal multiplexer: ≤2×2 grid cap (`isValidQuadrantLayout` 15997), workgroups, docked-in-editor, detached window | FinalGUISpec F3-062/063/064 (workgroups/subtabs/split/DnD payloads); storage-plan.md 9 `terminal_*` record families; Section15_MVP_Promoted_Features_Spec.md | COVERED | HIGH pointer defect — the normative "Section 15 terminal-core architecture" is unlocatable: FinalGUISpec has two "## 15" chapters and neither contains it (GUI-4 HIGH) |
| 14 | Context Lens (mute/focus/subcompact) + Context Detail Pane Curated/Raw (8323–8419, 9749–9841, 14693–14716) | assistant-chat-design.md §17.6 (verified via F3-306); UCC `catalog.chat_context_lens_apply_subcompact`, `chat_close_thread_context_details`, `chat_compact_context` (full result vocab); usage-feature.md :161/:180 curated per-thread overview | COVERED | LOW |
| 15 | Text-selection annotation palette gating Approve; Resubmit-with-Annotations (19553–19803, drawers 10647/10778) | FinalGUISpec §7.18.1 + F3-145/146 (AnnotationActionMenu/Drawer/ContextChipStrip); F3-150 status machine draft→in_review→all_notes_resolved→approved→merged; `catalog.prd_builder_annotation_upsert/resolve` | PARTIAL | MED — "Resubmit with Annotations" has no command anywhere in UCC (GUI-6, grep-verified); Add Note unbound; only Resubmit transition of the F3-150 machine is bound to any control |
| 16 | Revert-Last-Edit vs Rewind-Chat distinction ("revert ≠ rewind" caption 14999–15000) | `cmd.chat.revert`/`cmd.chat.rewind` (matrix rows, real locations); F3-171 revert-last-agent-edit routing | PARTIAL | HIGH — the file-mutation side is routed to "the owning Source Control or FileSafe command," which is unnamed (GUI-4); the semantic guarantee (rewind never touches files) exists only as concept copy |
| 17 | Instruction Assembly Order (6 ordered toggles) + byte-budget meter 8.2k/1,048,576 (13255–13294) | Prompt_Pipeline.md (:209–223 Injected Context breakdown w/ byte counts + truncation reason; :1785 budget snapshot; :1943 GUI breakdown); agent-rules-context.md | COVERED | LOW — plans model is compiled-sections + budget snapshot rather than a fixed 6-row toggle list; concept's hard 1 MiB figure not a plans constant |
| 18 | Settings: 18 bento cards + slide-in inspector; plus separate Agent Config page (7 tabs) and Project Settings Modal (13436–14450, 12694–13432, 10380–10441) | FinalGUISpec F3-109: canonical **19-tab registry**; F3-247 two-level sidebar + search; Agent Config Skills as a settings tab (§7.4.2 dup) | **CONTRADICTED** | HIGH — see A3-1/A3-2 |
| 19 | Usage page: 4 fixed tabs Overview/Analytics/Providers/Ledger (11321–12413) | usage-feature.md — Usage page "MUST be composed entirely of widgets" (:754–769; widget catalog rows e.g. `widget.ledger_table` :796) | **CONTRADICTED** (layout), content COVERED | MED — every concept Usage widget has a widget-catalog analog, but the fixed 4-tab IA is superseded by the widget grid |
| 20 | Projects page: bento project cards, health dots, per-card actions, sort/filter (10167–10376) | FinalGUISpec :1410–1428 (Projects = multi-project management surface; project cards summary-first w/ shared status vocabulary + precedence); F3-…:10117 | COVERED | LOW — "bento" styling not normative; card status vocabulary is |
| 21 | 6-theme system incl. glass-dark/glass-light + Sunlight-Shimmer shader + SVG distortion (76–453, 20942–21190) | FinalGUISpec F3-073/077/078: ThemeMode = retro-dark/retro-light/basic-light/basic-dark; **3 user-facing choices**; grep "glass" in FinalGUISpec = 0 hits | **CONTRADICTED** | HIGH — see A3-3 |
| 22 | Composer chips (file-ref/browser-selection/element-pick/screenshot) + slash menu (/web /skill /model @) + per-message cost popover (15006–15126, 8256–8283) | F3-298 capture chips (incl. blocked/expired states); F3-137 slash palette; `catalog.chat_add_file_reference`; FinalGUISpec §7.16 message info row | PARTIAL | MED — plans slash set is /web family + /skill (+deprecated /cancel): concept's **/model** slash command is not in the plans set; composer send/stop/attach and message-info controls carry no command ids (GUI-1/GUI-3) |
| 23 | Git accordion: Worktrees/Changes/History/Graph/Branches&Stash + Conflict Review + Remote Projection State badges (9157–9444) | FinalGUISpec :629 (`source_control` = "changes, history, graph, branches/stash, and worktrees") + :674 subview discoverability; freshness enum current/refreshing/stale/degraded/unavailable (F3-008) matches concept cycleBadge states | COVERED | LOW — commands are the A1 backlog + orphan-location issue |
| 24 | Docker / GitHub Actions / Unraid side panels (9447–9557) | Containers_Registry_and_Unraid.md (owner per FinalGUISpec :1366); GitHub_Integration.md; `catalog.docker_*` ×~60, `catalog.github_actions_*` ×~20 | COVERED | MED — nearly all docker/actions matrix rows are location-orphans; plans add Kubernetes subviews the concept lacks (see B) |
| 25 | LSP registry multi-host w/ enable toggles + status (14318–14351, 6063) | LSPSupport.md (:77 SSH placement; :155/:254 session key `(host_id, server_id, root_identity)`) | COVERED | LOW |
| 26 | Collapsible tool-call/thinking blocks in chat ([+]/[−] 17628 etc.) | assistant-chat-design.md / F3-134 activity cards (5/15/50-line caps, expandable) | COVERED | LOW |
| 27 | Thread list: 13 archetype threads, role badges (assistant/doc/interviewer/prd), status dots, worktree glyphs (14730–14962) | assistant-chat-design.md thread lifecycle (:1041–1063); F3-328/329 worktree icon (fully specified); F3-330 thread badges | PARTIAL | MED — worktree glyphs and badges well specified; the concept's role-badge taxonomy (doc/interviewer/prd threads) has no plans-side thread-role model; 13 archetypes are fixtures, not a spec'd taxonomy |

**Tally:** COVERED 12, PARTIAL 9, CONTRADICTED/superseded 3 (+3 of the PARTIALs contain a contradiction element). No concept feature is entirely MISSING from Plans at the behavioral level — the recurring failure mode is **named-but-unwired GUI controls** and **superseded interaction models**.

### A3. Concept details that Plans explicitly contradict (do not build from the concept here)

1. **Settings IA** — concept ships three alternate Settings prototypes (`.page-settings-a/-b/-c`, CSS 7337–7345) plus an 18-card bento grid + slide-in inspector (13436–14450) plus a Project Settings Modal (10380) plus a separate 7-tab Agent Config page (12694). Plans canon is a single 19-tab Settings registry (F3-109) with two-level sidebar (F3-247) — and even that registry is internally ambiguous (19 includes a retired "Tiers" alias; 4 referenced tabs missing from it — GUI-1/GUI-3). Nobody has adjudicated bento-vs-tabs or modal-vs-inspector. [HIGH]
2. **Concept 18 nav items ≠ plans 19 tabs** — the sets do not map 1:1 (concept has "Tiers & Branching" card; plans retire Tiers). [MED]
3. **Themes** — 6 concept themes incl. two glass themes with a WebGL-class shimmer shader (20973–21190) vs locked 3 user-facing themes / 4 ThemeMode values; glass does not appear in FinalGUISpec at all. The concept's largest single JS/CSS investment is dead-on-arrival. [HIGH]
4. **Orchestrator tab set** — concept 6 tabs (10914–10919: Progress, Plan Compile, Node Graph, Evidence, History, Ledger); plans canon is **seven** tabs incl. **Seams** (Orchestrator_Page.md:1, :44, :128). Concept CSS additionally implies a retired 8-tab era (Terminal/Tiers/RunGraph). [HIGH]
5. **Tiers ontology** — concept's Plan Compile tab renders a tier tree (11005–11077, `.orch-tier-node`) and Node Graph "Grouped by Phase"; plans: "`Tiers` plus tier-era tab labels survive only as compatibility/search aliases; canonical runtime model is node/package/seam/lane aware" (Orchestrator_Page.md:44; Run_Graph_View.md:49 retires tier_id joins). [HIGH]
6. **Subagent concurrency numbers** — concept 25 max / batch 10 / 11 shown running vs RM-015 locked 4/8/32 (Run_Modes.md:810). [HIGH]
7. **Dashboard widgets** — concept ~20 bespoke widgets across Main/Metrics/Monitoring sub-tabs (9901–10163) vs plans-locked catalog of exactly 4 dashboard widgets (F3-277/279) + 13 `progress.*` widget ids (F3-099), and plans themselves disagree 3-vs-4 on the default set (GUI-1 MED). Concept sub-tab IA absent from plans. [HIGH]
8. **Usage IA** — fixed 4 tabs vs mandatory fully-widget-composed page (usage-feature.md:763–769). [MED]
9. **Wizard shape** — 9-step linear stepper vs topic-graph PlanningRun with topic add/split/merge/reorder commands; retired launch labels (`START`, `BUILD`, `Approve & Continue`, `Compile Settings`, `BUILD/BAKE` at concept 9522) must not reappear (JSON-RECON retired set; Planning_Wizard.md:111). [MED]
10. **Slash commands** — concept offers `/model` (15010–15027); plans slash set is /web family + /skill only, /cancel deprecated (F3-137). [LOW]
11. **Node-detail C-numbering** — concept C1/C2/C3/C4/C6 (C5 absent, 11182–11232); plans never adopt C-numbering — Run Graph inspector is defined by object kind (node/attempt) + execution-axis fields (Run_Graph_View.md:31/:94). Concept numbering is not spec; its C5 hole needs no repair, it needs deletion. [LOW]
12. **Top-level navigation** — concept: 7 title-bar page tabs + 11-icon activity bar; plans: activity bar with "5 groups" (never enumerated — GUI-1 HIGH) + 8 side panels + breadcrumb Group>Page. Neither doc set fully specifies the merged model. [MED]
13. *(Concept-internal, flagged for cleanup)* "Enable Hit-in-the-Loop" (10429) is a typo for HITL; localhost/token/path fixtures and `[PASS]/[READY]` chips are explicitly non-evidence (JSON-RECON-gaps Cat-2). [LOW]

---

## B. PLANS → CONCEPT — plans GUI surfaces with no concept imagery

Expected (concept predates the 2026-06/07 addenda), but these are the surfaces the final design must invent from text alone. Each verified by direct grep of PMConcept.html before claiming absence.

| # | Plans feature | Plans owner | Concept check | Status | Sev |
|---|---|---|---|---|---|
| 1 | First-run onboarding wizard (4 screens, exact copy) + Doctor states | F3-411 + UCC-106; 8 `catalog.onboarding_*` matrix rows | "onboard" = 0 hits; Doctor exists only as Settings card + "Run Doctor Now" (13656–13664) | ABSENT (Doctor PARTIAL) | HIGH |
| 2 | Free Models catalog page / refresh / top-10 editor | F3-407/408/409 (upstream github.com/vava-nessa/free-coding-models) | "Free Models"/"free-coding" = 0 | ABSENT — and its commands are also unwired in plans (GUI-7 HIGH): double gap | HIGH |
| 3 | Goal Mode / Goal Runtime policy controls (~30 settings, 6 capability lanes, typed blocked states; GoalRun data on 16 surfaces) | Goal_Runtime_System.md; F3-393/394/396 | "Goal Mode"/"goal_" = 0 | ABSENT | HIGH |
| 4 | Teach mode: Teacher thread, guided overlay (Back/Next/Stop/Let me try/Do it), Teach records | F3-402/403 + UCC-102; assistant-chat-design.md :452–461 | "Teach" = 0 | ABSENT | MED |
| 5 | Notifications center + external destinations (Slack/Discord/webhook/ntfy/Pushover/Telegram) + per-event mapping | F3-405 + UCC-103; 7 `catalog.notifications_*` rows | "ntfy"/"Pushover" = 0; only bell + run-complete checkboxes (13770, 13837) | ABSENT | MED |
| 6 | Concern records / attention-center rows / alert ack-snooze-mute + incident bundling + escalation ladder (info/watch/attention_required/blocked/escalated) | FinalGUISpec §7.5 family, F3-124/125/126/128/130 | "concern"/"attention center" = 0; nearest analog is Usage W2 Alerts widget (11603–11616) | ABSENT | HIGH |
| 7 | Command palette (Ctrl+K/P; `>` `@` `/` prefixes) | F3-054/055 | "command palette" = 0; only a title-bar search input (8941) | ABSENT | MED |
| 8 | Breadcrumb strip Group > Page (20px, clickable) | F3-057 | only projects-page + file-manager-worktree breadcrumbs | ABSENT | LOW |
| 9 | System tray menu (Show/Hide, Pause/Resume Orchestrator, Quit; state-reflecting icon) | F3-037 | only "Minimize to tray" checkbox (13817) | ABSENT | LOW |
| 10 | Orchestrator **Seams** tab | Orchestrator_Page.md:44 | "seam" = 0 | ABSENT | HIGH |
| 11 | Widget catalog overlay + Add Widget flow + widget move/resize/configure/reset commands | F3-275/278; `catalog.widget_*` ×7 | `.add-widget-btn`/`.customize-widgets-btn` CSS (3182) + dashboard "Customize" button exist; no catalog UI; concept widget set ≠ locked catalog | PARTIAL-ABSENT | MED (plans themselves haven't picked the entry point — GUI-5 HIGH) |
| 12 | Permission approval cards: 4-tier ladder Deny/Once/For Session/Always, host patterns, 6 web tools | F3-384/385/386; Permissions_System.md | "For Session" only in a mock Rust log line (19948); concept has FileSafe-blocked dialog + skill Allow/Deny/Ask selects (13334–13366) only | ABSENT (ladder), PARTIAL (per-skill) | HIGH |
| 13 | Plan-mode PT control (Light/Balanced/Comprehensive) + plan approval command | F3-317/318/319 | "Comprehensive" = 0; Plan/Deep Plan modes + sticky plan tracker ARE present (15040–15051, 15522, thread3) | PARTIAL (modes present; PT + approval absent) | MED |
| 14 | Memory/gist review + consolidation UI | assistant-memory-subsystem.md | "gist" = 0; "Memory & Context" settings card exists (nav 13439–13469) | ABSENT (review UI) | MED |
| 15 | Persona editors: CRUD, compatibility matrix (supported/partial/unsupported × providers), talkativeness enum | Personas.md; F3-114, F3-283/285/286 | Active-persona select + "Edit Persona Prompt" toast stub (12718–12725) + Personas settings card | PARTIAL | MED |
| 16 | Multi-Account picker / `requested_account_binding` none-preferred-required | Multi-Account.md; F3-118 | "Multi-account count" numeric input (13647); Copilot billing-entity select + switch history (12951) | PARTIAL | MED |
| 17 | Interactive Mermaid/inline visualizer (sandboxed iframe, sendPrompt bridge, `--pm-viz-*` tokens, export) | F3-380–383/390/404 | static `.mock-mermaid` only (5826–5842, 10724) | PARTIAL-ABSENT | LOW |
| 18 | Kubernetes surfaces in Docker Manager (contexts/namespaces/helm/port-forward) | Containers_Registry_and_Unraid.md; 10 `catalog.docker_k8s_*` rows | "Kubernetes"/"k8s" = 0 (podman appears only as a runtime select option 13570) | ABSENT | MED |
| 19 | Site Reader vs provider-fetch labels; web operation cards ("Searching Web:", "Fetching Site: … (via provider)") | F3-364/370 | "Site Reader" = 0; generic web activity cards exist | PARTIAL | LOW |
| 20 | Runtime Artifacts panel viewers/receipts (show-in-ledger/usage cross-links) | Runtime_Artifacts_Panel.md; `catalog.artifacts_show_in_*` | 3-row artifact list + buttons only (9560–9576) | PARTIAL | LOW |

**Tally:** 12 ABSENT, 8 PARTIAL/vestigial. None of these has any concept mockup to anchor the final design — they are pure text-to-pixels work items.

---

## C. What the concept's construction implies for the real GUI build

- **339 inline `onclick` handlers, 71 command tokens, 250 controls with accessibility gaps** (JSON-RECON summary; recomputed-match). Only 5.5% of concept controls even *name* a command; the interaction layer is toast-stub theater (`toast(...)` ~60+ sites/chunk) plus three private mock engines (PM_TERMINAL_DEMO 28-pane terminal sim, Usage IIFE, editor/minimap renderer). None of it is portable: the real GUI is Slint/Rust (FinalGUISpec L133/197), so every one of the 1284 controls must be re-expressed as UICommand dispatch + state selector + disabled-reason + receipt per the `production_wiring_contract` pattern — which today is fully satisfied for **0** controls and contractually staged for 44.
- **Accessibility**: the entire file-tree context menu and most custom click targets lack roles/keyboard parity (JSON-RECON-gaps Cat-2 cluster, 9013–9037); plans answer with 17 `production_accessibility_contracts_added` + Slint accessible-props (F3-203) + WCAG AA on Basic themes only — the 250-gap inventory is the checklist for that work, not a port list.
- **Wiring matrix is the bottleneck, not the catalog**: 459 commands cataloged, but 39% location-orphans ("Cataloged GUI surface"), 70% event-less, 21.6% fabricated `command_applied` events, 100% self-declared non-proof → **7.6% fully wired**. Concept fidelity is irrelevant until this layer is real.
- **Self-aware fixture markers must be honored**: 64 `concept_fixture_only` controls (localhost URLs, fake keys, canned rustc/slint errors, `[PASS]/[READY]` chips) and the Step-8 "non-emitting … concept fixture" note (10876–10890) are explicitly excluded from acceptance evidence — any test plan that screenshots PMConcept.html as "expected behavior" is invalid by the reconciliation's own rules (final_gui_ownership: "concept_source_lineage_only_not_implementation_evidence").
- **One architectural constraint in the concept IS load-bearing**: the `.pm-tab-model-strip` banner (9598–9602) — "never collapse editor, browser, and terminal into one generic tab model" — matches plans' distinct route kinds and should be preserved as a named invariant.

## Ten worst gaps (ranked)

1. [CRITICAL] Launch/approval chain (`prd_builder.approve_for_planning_wizard` → `planning_wizard.approve_and_build` → `runtime.approve` → `plan_compile.open_build`) exists only as pre-implementation rows with placeholder/orphan wiring — the product's single most important flow has no evidence path. (A1 #17–21)
2. [CRITICAL] Wiring matrix: 7.6% fully wired; 99 fabricated `command_applied` events; 179 location-orphans — invalidates "covered" status corpus-wide. (C)
3. [HIGH] 12 plans-mandated surfaces (onboarding, Free Models, Goal Mode, Teach, notifications center, concern/attention center, palette, Seams tab, permission ladder, K8s, memory review, breadcrumb/tray) have zero concept imagery. (B)
4. [HIGH] Settings IA unadjudicated: concept bento+inspector+modal+Agent-Config-page vs plans 19-tab registry (itself ambiguous 18-vs-19). (A3-1/2)
5. [HIGH] Subagent caps: concept 25/10/11-running vs locked RM-015 4/8/32 — concept demos an illegal state. (A3-6)
6. [HIGH] Theme system: 6 concept themes (glass + shimmer shader) vs locked 3; huge dead concept investment, and plans' own theme commands unbound (F3-082). (A3-3)
7. [HIGH] Orchestrator drift: 6-tab concept lacking Seams; tier-tree UI built on retired Tiers ontology. (A3-4/5)
8. [HIGH] Requested-vs-effective disclosure: concept UI exists, plans define payload+surfaces, but no delivery event or history persistence — unbuildable end-to-end today. (A2 #3)
9. [HIGH] Dashboard: concept ~20 widgets/3 sub-tabs vs locked 4-widget catalog + undecided Add-Widget entry point + 3-vs-4 default contradiction. (A3-7, B #11)
10. [HIGH] Worktree GUI: 17 `cmd.git.worktree_*` commands all location-orphans with placeholder events; merge-gating modal (tests + Merge Anyway + keep/remove) unspecified in plans despite being the concept's marquee safety flow. (A2 #1)

---

# PART 3 — Per-document findings: core docs (orchestrator, FinalGUISpec, chat, Contracts)

## orchestrator-subagent-integration.md — NOT READY (C=1 H=30 M=94 L=59 across its chunks)

This is the load-bearing contract for how tiers, subagents, hooks, and coordination state fit together, and it reads like three drafts stapled end to end: the transport taxonomy (DirectApi vs CliBridge vs ServerBridge) is contradicted by parser/hook code written for the retired model, the canonical coordination store flips between "file is canonical" and "file is a debug mirror" at least four separate times across the doc, and core failure semantics (what makes a subagent "critical," what happens to siblings when one parallel subagent fails, what the post-handoff-retry-exhaustion outcome is) are asserted differently in different sections with no resolution. The back two-thirds of the document is an atomized PlanUnit ledger (OSI-001 through OSI-431) whose acceptance criteria are near-universally migration boilerplate ("source span remains losslessly available") rather than behavioral tests, so the ledger format itself can't catch the contradictions it's supposed to certify. Strengths: the event/enum vocabulary (wake_reason, failure_class, blocked_reason_code), executionLimits, and worktree-status taxonomy are genuinely precise and consistent everywhere they appear.

### Must fix (Critical/High)
- [CRITICAL] L14,191 vs L1111-1119,2684-2871,3229-3236: Doc calls Codex/Copilot/Gemini CLI transport material "historical context only," yet the Codex JSONL parser, Copilot text-regex parser, and CLI hooks tables are written as normative guidance for providers declared DirectApi — FIX: rewrite parser/hook sections per-transport or mark retired CLI impls explicitly.
- [HIGH] L4070 vs L4077-4078,5453-5456 (Gaps #28-#36): "File-based coordination is canonical" contradicts the doc's own statement that `active-agents.json` is an optional debug mirror over a seglog/redb projection; every concrete AgentCoordinator mitigation (locking, backup, corruption recovery) targets only the file — FIX: mark the file implementation debug-mirror-only and specify the canonical projection's API/schema.
- [HIGH] L22476-22511 (OSI-271) vs OSI-225/245/251/270: same contradiction recurs in the atomized ledger layer — "file-based coordination state as the source of truth" directly opposes five other accepted units — FIX: rewrite OSI-271 to "canonical coordination projection," add a retired-disposition marker.
- [HIGH] L5201-5265 (Gap #33) vs L6325,6334,7627 (OSI-020): `FileLock`/`acquire_file_lock` (30-min expiry) directly contradicts the doc's own "MUST NOT adopt file-lease orchestration" rule, with no retirement marker on the locking mitigation — FIX: mark Gap #33 retired; keep only conflict detection.
- [HIGH] L5693-5695 (Strategy 4) vs L5635-5673,6717-6719: "All subagent work executes through provider CLI commands" contradicts the three-transport model and per-platform notes (Gemini is direct, not CLI) — FIX: reword to transport-aware determinism rules.
- [HIGH] L5932,6106,6141,6177-6178: `prepend_task_feedback` writes to an undefined "task file" and a Markdown "progress file," but the orchestrator is elsewhere said to consume only sharded plan-graph JSON — no artifact path/schema exists for either — FIX: define the feedback/progress artifact or route through the handoff/remediation contract.
- [HIGH] L9216-9217,9254: "fail tier if critical" never defines what makes a subagent/tier "critical" — not linked to required_subagents or any severity policy — FIX: define critical = present in required_subagents, or state the rule and cross-link.
- [HIGH] L8990-9026 (OSI-045): parallel-subagent `join_all`+`result??` gives no cancellation/partial-result/cleanup policy for first-failure-in-parallel-group — FIX: state whether siblings are cancelled, drained, or retained on failure.
- [HIGH] L15508-15510 vs L11764,11779,15629-15630 (OSI-093/094/156/157): post-handoff-retry-exhaustion outcome is simultaneously "auto-continue with partial output" and "surface error with Retry/Skip/View-raw," with the compat note acknowledging but not resolving which path the code takes — FIX: pick one canonical outcome (surface-error CTA), mark the other retired.
- [HIGH] L14985-15376 (OSI-148/149 vs OSI-154/156): handoff retry ceiling is simultaneously "exactly one" and "configurable max_retries" with no default value stated anywhere — FIX: set default (e.g., max_retries=1), name the config key.
- [HIGH] L14218-14220, L11779/11809: Assistant chat CTA (review/skip/retry/abort) and the parser-failure prompt ("[Retry] [Skip] [View raw output]") both have defined copy but zero command IDs, event names, payload schema, or post-action state transitions — FIX: name the events, per-option commands, and resulting node status.
- [HIGH] L16103-18527 (OSI-177/178/179/180/184 vs OSI-186/198/200): hook-name duality — canonical_text alternates between tier-era names (BeforeTier/AfterTier, verify_tier_start) and execution-unit names (BeforeUnit/AfterUnit) with only some units carrying an "align to execution-unit" caveat — FIX: one alias table, rewrite all canonical_text to unit naming.
- [HIGH] L17047-17098 (OSI-179): the old 2h-inactivity stale-agent heuristic is demoted to lineage but the "canonical status and expiry logic" replacing it is never defined anywhere in Plans — FIX: cite the owner section and specify thresholds/state machine.
- [HIGH] L21773-22156 (OSI-258/260/261/264/265): every concrete AgentCoordinator API only implements the retired JSON-file mirror; the mandated seglog/redb projection has no API, record family, or event names anywhere in range — FIX: add a unit specifying the canonical record schema.
- [HIGH] L21505-22156: concurrent agents in separate worktrees do unguarded read-modify-write on shared coordination state (load→mutate→save) with no lock/CAS/append-only contract — lost-update race at scale — FIX: specify concurrency control for both mirror and canonical projection.
- [HIGH] L12052: architecture-confirmation mechanism is left as three undecided alternatives ("phase gate, dedicated phase, or prompt line") — FIX: choose one and specify trigger/completion condition.
- [HIGH] L25343-25357 (OSI-323): fail-open 5s lock-timeout policy explicitly parked as "requires owner adjudication" with no adjudicating doc named — FIX: name the owner anchor and record the decision.
- [HIGH] L25478,25510-25518 (OSI-326): non-Unix `process_exists` is a `true // Assume exists for now` placeholder; no Windows mechanism specified anywhere — FIX: specify OpenProcess-based check.
- [HIGH] L31068-31333 (OSI-425 vs OSI-428, OSI-408): normative addenda contradict on v1 vocabulary — tier-keyed config (`tier_overrides`) is called "ordinary v1 user flow" while a later accepted unit forbids tier-era wording as canonical, and OSI-408 still asserts "Iteration is the lowest tier" as a live constraint — FIX: reconcile v1 config vocabulary explicitly.
- [HIGH] L31189-31198 (OSI-428): required spawn/concurrency/cost policy (fanout thresholds, max parallel subagents, max cost per wave, retry policy) has no field names, types, or defaults anywhere in Plans — FIX: define a SubagentPolicy schema with exact keys/units/defaults.
- [HIGH] L31146-31172 (OSI-427): required continuity records (actor identity, provenance, redaction, replay) have no schema, event family, or storage keys — the unit literally admits the gap — FIX: inline the canonical storage key/event names.

### Worth fixing (Med, condensed)
- **Config/API signature drift** (repeated ~8×): `validate_config_wiring_for_tier`, `execute_tier_with_subagents`, `get_coordination_context`, `update_agent_status`/`update_agent_operation`/`update_agent_files` all have 2+ incompatible call signatures across the doc (L1422/1605-1607, L376-380/3597, L436/3947, L520-536/3919-3925).
- **Undefined defaults/keys**: `enable_parallel_subagents` flag, `config.verification_policy`, `.puppet-master/quality.json` schema, `validator.max_retries()` default, canonical validation-table artifact location — all referenced, never defined with a value or path (L454-458, L1513-1520, L13128, L13778-13781, L15375-15416).
- **Escalation/GUI wiring gaps**: parent-tier escalation ("skip, fix manually, or re-plan") has no decision algorithm or UI surface anywhere (L3107-3110, L17705-17713); AfterTierEnd user feedback surface unnamed (L13304-13337); agent-communication/coordination-monitoring GUI promised 3× with zero panel names (L4822, L5323, L24440, L25206, L26469).
- **Event/naming enumeration gaps**: `run.qa_cycle_*` wildcard family never enumerated (L2536, L12536); seglog event names for tier/iteration start-end never listed exactly (L137); `TaskType` enum, `SubagentOutput::example()`, `extract_partial_output()` referenced but never defined.
- **Retry/timeout ceiling ambiguity**: three separate un-reconciled ceilings (retry-count reset-on-progress, "unchanged after 2 retries," 30-min overall timeout) with no stated precedence (L16392-17713); child timeout envelope has no exact field schema (L691, L9684-9689).
- **Persona/config ownership split**: persona precedence order (mode vs tier_personas vs auto) never fully enumerated with tie-breaks (L6199-6269); Personas UI (import/add/delete/trim) has no message/command names anywhere in 4 separate chunks (L1012, L11132-11171, L19450-19500 [chat-side]).
- **Platform coverage gaps**: OSI-004 transport taxonomy omits Antigravity CLI and Alibaba/Z.AI/MiniMax direct providers (L6717-6719); env smoke-test gates named for only 3 of 6 providers (L10052-10092).
- **Cross-platform/Windows gaps**: predictable `/tmp/puppet-master-<user>/` fallback is a symlink-squat risk; `chmod 755` is POSIX-only for a cross-platform app (L18040-18041, L26983-27000 caps/eviction receipts also undefined).

### Notable Low/hygiene
- Duplicate "Implementation Notes"/"Considerations" sections verbatim (L3413-3437 = L3440-3464); orphaned mid-expression code fragment (L2670-2682); syntax error in a load-bearing `format!` example (L4055).
- `ContractRef:` lines embedded inside Rust code fences throughout (invalid/non-compiling pseudo-code hygiene, recurring 15+ times).
- Corrupted YAML block admitted but left unrepaired near L642/L23068-23070/L27170-27207, with retirement of the executionLimits duplicate made conditional on its own repair.

---

## FinalGUISpec.md — NOT READY (C=2 H=21 M=64 L=45 across its chunks)

The canonical GUI spec is structurally sound in its shell/layout/theme/persistence sections but functionally incomplete everywhere it matters for implementation: two widget-reference docs it repeatedly cites as authoritative (WIDGETS_VISUAL_REFERENCE.md, WIDGETS_QUICK_REFERENCE.md) don't exist in the repo, the CtA-card specification section it points to is five lines long, and roughly 80% of named controls across the ~27,000-line document have no backend command ID — a pattern that holds from the hand-written prose sections through all ~380 atomized PlanUnits. The best-wired areas (Search panel, blocked/recovery banners, worktree controls, terminal operation cards) show the doc CAN be built to this level of precision; the rest simply wasn't finished to the same standard. Persistence-key naming is internally inconsistent (colon vs dot separators, per-project vs global scoping contradictions), and there are two sections both numbered "15."

### Must fix (Critical/High)
- [CRITICAL] L1745: §8.2 widget catalog defers all per-widget contracts (props, states, focus, theme tokens) to `WIDGETS_VISUAL_REFERENCE.md`/`WIDGETS_QUICK_REFERENCE.md` — neither file exists anywhere in the repo — FIX: create the docs or inline the contracts into §8.
- [CRITICAL] L2623 vs L1226-1230: "function identically (see §7.2 for full specs)" — §7.2 is 5 lines with zero CtA card specs; HITL-approval, run-interrupted, rate-limit, and warning card fields/CTAs are undefined anywhere in range — FIX: write full card contracts into §7.2.
- [HIGH] L11771-11800 (F3-154): same missing-doc problem recurs in the atomized layer — F3-154 aligns "detailed widget references" with the same two nonexistent files — FIX: repoint to `Widget_System.md` (exists) or create the docs.
- [HIGH] L2340-2341: startup restore reads `hotreload_state:v1:{project_id}` and `onboarding:v1` — neither key is defined in §15.1 or storage-plan.md — FIX: add both keys to the catalog with schema.
- [HIGH] L2535-2538,1608,1298-1320: Settings registry references Catalog/Sync/SSH/Debug tabs (§7.4.5, §7.4.6) that don't exist in the canonical 19-tab registry; §7.4.2 is used twice for different tabs — FIX: reconcile registry and renumber §7.4.
- [HIGH] L541-547: project-switch commands (title-bar badge, keyboard entry) are entirely unnamed — FIX: name `cmd.project.*` ids for switch-in-tab/new-tab.
- [HIGH] L168,737: "5-group Activity Bar" is asserted but the 5 groups are never enumerated, and their relationship to the 8 side-panel items and `Ctrl+1..8` is undefined — FIX: enumerate groups and members.
- [HIGH] L2130-2156,14446-14545 (F3-205/206): §14.1 Slint file inventory has no file for the Orchestrator seven-tab page, Docker/Hosts, Source Control, GitHub Actions, Docker Manager, Artifacts, or Search/Run&Debug panels — the flagship surfaces have no planned host file, and this gap recurs identically in the atomized layer — FIX: name a `.slint` file for every §7 view.
- [HIGH] L7102-7135 (F3-067): panel undock/pop-out has 6 triggers including a palette action and a keyboard shortcut, but NO command ID exists anywhere in Plans (grep-verified) — contradicts the doc's own rule that shortcuts must map through the command catalog — FIX: add `cmd.panel.undock`/`redock` rows.
- [HIGH] L7903-11577 (~10 units: F3-082,083,107,114,116,125,130,133,135,150): theme management, terminal theme apply, index enable/rebuild, Personas CRUD, concern acknowledge/dismiss/resolve, alert ack/snooze/mute, thread rename/archive, composer send/stop, and bundle Resubmit ALL have zero backend command IDs anywhere in Plans (grep-verified) — FIX: register a command ID + payload + events for each in UI_Command_Catalog.md.
- [HIGH] L13807-15074 (F3-193/216): the doc has TWO sections numbered "15" (Persistence at L2239; Promoted widget catalog at L3332), and the referenced "Section 15 terminal-core architecture" (high-frequency grid, diff-painting, off-UI-thread PTY) doesn't exist under either — FIX: replace pointer with exact doc+anchor, renumber the duplicate.
- [HIGH] L17073-18305 (F3-252 vs F3-275): Dashboard widget-grid reorder is locked to "drag-handle + click-to-swap, full DnD deferred" in one accepted unit while a later accepted unit requires full drag-to-reorder + edge resize + grid snapping as required MVP — no precedence stated — FIX: add explicit precedence note.
- [HIGH] L18470-18474: "Add Widget" has three undecided entry points (menu/FAB/toolbar) with no command ID and a flow contradiction (choose-then-place vs auto-place-then-move) — FIX: decide entrypoint, register `dashboard.add_widget`, sequence the flow.
- [HIGH] L19349-19500 (F3-293-296): provider-control disclosure payload (Honored/Skipped/Clamped) and 4 Persona mapping editors are both fully specified in structure but have no delivery event name and no save/validate command/storage key — FIX: name the event and the mapping-editor commands.
- [HIGH] L26384-26511 (F3-407/408/409): "Refresh Models," "Retry check," "View details," top-10 editor — all lack command IDs, unlike sibling units that do have UCC hooks — FIX: add a UCC PlanUnit for the model-refresh command family.
- [HIGH] L24663-24698 (F3-389): the doc's own accepted unit mandates renaming the duplicate "## 15" chapter and deconflicting §7.4 headings — the live doc still has both duplicates uncorrected — FIX: apply the renumbering before implementation freeze.

### Worth fixing (Med, condensed)
- **Persistence-key inconsistency**: colon vs dot separator used inconsistently across sibling key families (`layout:v1` vs `search_panel_state.v1:{project_id}`), with at least one prior stale-alias incident from this exact drift (L15127-15324); per-project vs global scoping contradicts itself for dock state and chat-thread selection (L906-908/2247-2249, L2254 vs L2266).
- **Severity/status enum fragmentation**: three different severity ladders (info/watch/attention_required/blocked/escalated vs advisory/... vs a third) coexist with no mapping table (L1459/1222/1424); card status machines conflict across three different vocabularies (L3362/3540/3454).
- **Breakpoint/layout contradictions**: side-panel auto-collapse breakpoint disagrees between §3.5 and §12.1 (L571 vs L2021-2022); Dashboard column count contradicts itself below 720px (L13916 vs L14022-14023).
- **Undecided control forms**: PT control (segmented/dropdown/compact — no rule), pause-gate GUI event (unnamed), all-nodes-blocked runtime event (declared pending), watchdog/kill-switch for Free Models (no values) — recurring pattern of "named but not decided" (L20640-20693, L28918, L21783-21835, L26682-26698).
- **PlanUnit structural quality**: `depends_on`/`unblocks` are empty on effectively all ~380 units despite obvious real orderings; acceptance_criteria are the same 4 migration-boilerplate lines on nearly every unit, so "accepted" doesn't mean behavior-verified.
- **Widget/count contradictions**: default Dashboard widget count stated as both 3 and 4 (L1228 vs L2630-2649); "12 vs 13 promoted features" list mismatch (L17890-18173); "25 retired" vs "25 current" widget wording drift (L16181 vs L16210).

### Notable Low/hygiene
- "No open questions" compliance banner sits directly above 17 empty canonical-owner headings (L129 vs L9-128) — self-contradicting document-quality claim.
- `preserved_exact_tokens` fields contain shredded-word extraction artifacts across dozens of units (e.g., "/task/subtask," "/contrast," "/pill") that read as slash commands but aren't — undermines the units' own "exact-text audit" claim.
- Bare "ContractName:Plans/X.md" template-variable syntax repeats uncommented across 1,093+ uses corpus-wide with no glossary definition of what the prefix means.

---

## assistant-chat-design.md — NOT READY (C=2 H=21 M=21 L=21 across its chunks)

Chat/Assistant design is the most internally consistent of the four documents in its hand-written prose (worktree controls, message-list virtualization, and slash-command wiring are genuinely thorough and precise), but two problems recur enough to block implementation: first, a direct same-document contradiction on whether `platform_specs` is a retired lineage-only token or a live function still called for context-window sizing and model-dropdown fallback — both readings are asserted as canonical in different PlanUnits; second, several core interaction mechanics (Stop/Edit/Resend cancellation semantics, annotation reanchoring algorithm, thread lifecycle transition table, debug-investigation "promote to fix lane" control) are asserted as outcomes with no algorithm, storage mutation type, or command ID given anywhere — leaving an engineer to invent the mechanism. The back half of the document (roughly ACD-268 onward) is comparatively clean atomized ledger material with almost no contradictions found.

### Must fix (Critical/High)
- [HIGH] L1904,1910 vs L194-195,2319,3874: §17.3 context-repack sources max tokens from `platform_specs::context_window(provider)`, contradicting the doc's own "no legacy platform_specs authority" rule for the same model-capability domain — FIX: route through the shared provider/model registry, or explicitly declare this a live exception.
- [HIGH] L3865-3874 (ACD-009): the PlanUnit meant to restate §1.1 instead asserts the opposite — "Data comes from platform_specs; no hardcoding" — directly opposing the "no legacy platform_specs authority" prose two paragraphs above it — FIX: align ACD-009's negative_constraints to the retired-authority wording.
- [HIGH] L11973-13606 vs L15007-15577 (ACD-255,257,260,262,268): the contradiction recurs and deepens — `platform_specs::context_window`, `context.repack.verbatim_turns`, and `platform_specs::fallback_model_ids` are all cited as living in Contracts_V0.md but do not exist there (grep-verified against the full corpus); ACD-262 calls platform_specs "source-lineage only" while ACD-255/257/268 call its functions live — FIX: resolve whether platform_specs is dead or live, and define the three missing keys/functions in their claimed owner doc.
- [CRITICAL] L4711-4765 (ACD-028): Question Schema — the full QuestionItem/questionnaire envelope schema (fields, types, optionality) is described only narratively via scattered aliasing rules, with no coherent type given in-range or an unambiguous pointer — FIX: include or precisely point to the complete schema.
- [CRITICAL] L6817-6858 (ACD-074): Thread Lifecycle State Machine gives only a linear transition list (creating→active→suspended→archived→deleted) with no stated reverse/restore edges (can suspended return to active? can archived be restored?) — FIX: provide the full allowed-transition table with command IDs per edge.
- [HIGH] L3972-4063 (ACD-012/013): Stop/Edit/Resend "discard later generated history/work" has no defined mutation type (soft-delete/tombstone/hard-delete) and no cancellation sequence for in-flight tool/agent work; the message queue has no entry schema or defined overflow behavior at max-2 — FIX: define the mutation type, cancellation sequence, and queue schema/overflow UX.
- [HIGH] L4669-4765 (ACD-027): Question Flow lifecycle names 5 states but gives no transition command IDs, no autosave debounce interval, and no paused-state expiry/GC policy — FIX: specify these three missing values.
- [HIGH] L5120-5161 (ACD-037): PT budget matrix gives numeric ceilings (Light=2, Balanced=4, Comprehensive=6) without stating with certainty what dimension is being counted (questions? research calls? both?) — FIX: state explicitly which budget the numbers govern.
- [HIGH] L5601-5743 (ACD-048/050): annotation "Replace with.../Insert after..." actions have no described mutation path to the document if not patch-apply, and the reanchoring `quote_match` has no algorithm or tolerance threshold — FIX: clarify the actual mutation path; specify the match algorithm and parameters.
- [HIGH] L4860-4900, L7121-7166 (ACD-031, ACD-081): subagent-question "unavailable" status and debug-investigation "explicitly promoted" residue both lack any defined UI surface or command name for the user-facing side of the decision — FIX: define the notification path and the promotion command/button.
- [HIGH] L6035-6083 (ACD-057): chat-revert with zero eligible prior mutating turns has no defined empty-state/error behavior — FIX: define the no-op/error/disabled-button behavior.
- [HIGH] L8006-8252 (ACD-100,103,104): Investigation Context actions (Open target/Export bundle/Revoke item), "Open in Terminal," and the full operation-card transition table all lack command/IPC IDs or an owner cross-reference — FIX: add exact command_id per action and the transition table.

### Worth fixing (Med, condensed)
- **Undefined confirmation UI**: Teach Capture confirmation mechanism (modal/chip/toast — undecided, ACD-020); domain-permission batch-webfetch confirmation dialog has no field spec (ACD-123); Crew-selection "asks whether to use a valid default crew" has no button copy (ACD-163/168).
- **Missing routing/command IDs**: cross-doc "open/focus" routing to the canonical thread-usage surface has no command ID (ACD-089); Context Detail Pane opener is ambiguous between `cmd.chat.focus_thread_usage` and an unnamed alternative (L1161-1198); Compact Now Retry doesn't state what it re-invokes (ACD-245).
- **Enumeration gaps**: `_context_updates` entry schema never defined despite being required on every context-shaping event; error_code enum for the visualizer bridge result never listed (ACD-427, CV-300 cross-ref); Goal Mode's four activation paths (button/chip/icon/`/goal`/NL) have no single command ID the way worktree commands do.
- **Batch/limit edge cases**: batch webfetch exceeding url/concurrency limits has no defined UX (reject/truncate/queue, ACD-122); batch fan-out subgroup boundary at exactly 10 vs 11 children undefined (ACD-160); hot-memory cap "200 messages or 8MB" doesn't state precedence when both trigger (ACD-243).
- **Settings key completeness**: worktree settings keys only 4 of ~9 actually enumerated verbatim in the audited range (ACD-338); auditor validation storage keys (`model_roles.auditor.*`) not found in their claimed owner doc.

### Notable Low/hygiene
- Nearly every one of the ~430 ACD PlanUnits restates canonical_text as its own acceptance_criteria rather than giving an independently falsifiable test — makes "accepted" status circular.
- One raw chat typo ("Fee models" for "Free Models") is preserved as if it might be required literal UI copy in an acceptance criterion — needs a lineage-only annotation.
- Two chunks (CHAT-5, CHAT-6) are entirely clean atomized YAML with no contradictions found — the second half of this document is comparatively solid.

---

## Contracts_V0.md — NOT READY (C=1 H=21 M=76 L=27 across its chunks)

As the canonical cross-surface contract file that every other Plans doc defers to for event names, payload schemas, and enums, this document has the highest concentration of Medium findings of the four because so much of its content is "define X" imperative bullets rather than actual typed field tables — the doc tells you a concern record, an AuthEvent, and a `SubagentPolicy`-adjacent contract must exist, but does not give their fields. Two categories of problem compound this: (1) the doc contradicts itself on canonical field names for the same event across different PlanUnits written at different times (safe_point.created has two incompatible field sets; scheduler.pass's array is named two different things), and (2) three "P0 security/readiness" contracts near the end of the document (WS auth, runtime-readiness probe, session-prompt-admission) are pure statements of intent with no mechanism at all. The opening ~280 lines are literally empty headings claiming to be "canonical owner sections." Where the doc does commit to real schemas (EventRecord, blocked_reason_code, child lifecycle states, cost/token accounting) it is precise and good.

### Must fix (Critical/High)
- [CRITICAL] L224-283: 17 "Canonical owner-section requirements" subsections — including the concern-record shape and approval-scope-key definitions — are headings with completely empty bodies, despite the doc claiming these ARE the canonical specification text — FIX: write the actual content or delete the headings and point elsewhere.
- [HIGH] L773-791: the concern record (a first-class cross-surface family referenced everywhere else in Plans) is specified only as imperative "Define X" bullets — no field table, no types, no enum values for severity/category/visibility_level/attention_level — FIX: publish a typed field table matching the style used for EventRecord.
- [HIGH] L1466-1475: AuthEvent defines only 5 example event-name strings with zero payload fields, while every sibling event family in the doc has a minimum-payload table — FIX: define the minimum AuthEvent payload.
- [HIGH] L1608-1631: §5's four promised mechanisms (instruction scoping, attempt journaling, parent summary, AGENTS.md enforcement) are not specified; InvestigationContextAttachment is one sentence with zero fields — FIX: specify fields/mechanics or point explicitly to the true owner.
- [HIGH] L10287-10326 (CV-154): field truth for `ExecutionUnitContext` is anchored to `Plans/execution_unit_context.schema.json`, which does not exist anywhere in the repo (glob-confirmed) despite Executor_Protocol.md declaring it the normative, non-redefinable contract — FIX: create the schema file or repoint to the Executor_Protocol table as interim canon.
- [HIGH] L13751-14649 (CV-224/225 vs CV-242): the SAME event, `safe_point.created`, has two incompatible canonical field sets across two PlanUnits — `worktree_id/worktree_path/worktree_branch/working_directory` vs `branch_name/HEAD_sha` — FIX: pin one field set, mark the other retired alias.
- [HIGH] L13399-14402 (CV-216 vs CV-237): `scheduler.pass`'s non-selected-nodes array is named `non_selected_nodes[]` in one unit and `non_selected[]` in another — FIX: pin one name.
- [HIGH] L14914-15319 (CV-215,241,248): the closed 16-value `blocked_reason_code` enum has NO value for auth-blocked nodes, even though `node.blocked` payloads carry `auth_realm`/`missing_scopes[]` and `wake_reason` includes an auth-recovery value — a node blocked on re-auth cannot be legally coded — FIX: add `auth_required` to the closed enum.
- [HIGH] L12826-12883 (CV-205/206): usage/cost "adjustment or clamp events" are required by contract but have no event name, payload fields, or persistence shape given anywhere — FIX: define e.g. `usage.cost_adjusted{delta_microdollars, reason_code, source_ref, ts}`.
- [HIGH] L14467-14751 (CV-239,244): "effective permission snapshot identifier" and "requested/effective model snapshot" appear in persisted payloads (attempt.started, tool.denied) with no pinned field name, directly violating the doc's own CV-195 rule requiring pinned names for persisted payloads — FIX: pin `permission_snapshot_id`, `requested_model`/`effective_model`.
- [HIGH] L10629-11135: `UICommand` is asserted as the canonical command envelope and routes can be "rejected as invalid_route," but no response/ack/error envelope exists anywhere for how a rejection reaches the caller or renders in the UI — FIX: define `UICommandResult{accepted | rejected{error_code, reason, offending_field}}`.
- [HIGH] L17064-17109 (CV-282/283): the mandated runtime-continuity contract (schema, event family, storage keys) and the shared route-object model are both required but nowhere defined — CV-282's own preserved token admits "no schema, no event family, no storage keys" — FIX: register both contracts with concrete schemas.
- [HIGH] L19149-19217 (CV-306): the P0-security WS-auth contract has no auth mechanism (token? mTLS?), no handshake fields, no rejection error variants, and empty negative_constraints — FIX: specify the full auth handshake and rejection contract.
- [HIGH] L19219-19282 (CV-307): the runtime-surface readiness probe defines no request/result schema and no state enum — "model-visible, UI-visible, roundtrip-ready" are adjectives in prose, not fields — FIX: define the probe contract.
- [HIGH] L19284-19352 (CV-308): required session-prompt-admission-inbox event family self-admits it doesn't exist anywhere (grep-confirmed) — no event names, payload minima, or idempotency derivation — FIX: register the event family.
- [HIGH] L4463-7426 (CV-038 vs CV-097/098): the same attribution packet is named `work_package_id`+`feature_seam_id` in one unit and `package_id` (no feature_seam_id) in the owner payload tables — FIX: standardize on `package_id`.
- [HIGH] L5828-6185: concern-family attention fields (`visibility_level`, `attention_level`, `chatworthy`, `blocking_effect?`) and machine-readable code fields (`stop_reason_code`, `budget_kind`) have no types or value enums anywhere in the doc — FIX: define closed value sets.

### Worth fixing (Med, condensed)
- **Unenumerated closed enums** (recurring ~15×): `pass_verdict`, `resolution_source`, `resolution` (node.unblocked), `conflict_reason_code`, `reason_code` (plan.decomposition_degraded), `approver_identity` structure, `lsp.server.lifecycle_changed.state`, `object_kind` — all referenced as "closed" but never given their value list.
- **Web-error/support-state fragmentation**: web tool error codes are listed 3 different ways across CV-120/121/122 with gaps (`crawl_depth_exceeded` missing from one list); support-state (native/native_projected/projected) has no mapping matrix to the 8 evidence dispositions.
- **Undefined thresholds/defaults**: OAuth refresh trigger is self-referential ("20% of remaining lifetime" of what); clock-skew "material"/stale threshold never given a default; large-web-payload inline-size cap unquantified; UI-scale slider control for 1.15-1.5 range not specified beyond presets stopping at 1.1.
- **Destination/bridge contract gaps**: 3 of 9 notification destination kinds (in-app toast, system/tray, sound) have no profile contract; visualizer bridge (`sendPrompt`/`openLink`/etc.) has an error shape but no error-code enum or per-method arg/return types.
- **Receipt/record families named without schemas**: ~15 receipt/report family names (TestHarnessProbeReport, safe_point_receipt, etc.) have no corresponding schema `$defs` entry; VisionBridgeResult and Teacher guided-action records are prose-only with no schema id.
- **PlanUnit graph hygiene**: `depends_on`/`unblocks` are non-inverse-consistent in multiple places (A unblocks B but B doesn't depend_on A) — the dependency graph can't be mechanically trusted.

### Notable Low/hygiene
- Grammar artifacts from unreviewed compiled text ("must not be over-summarizes into," "must not over-focuses") suggest at least two rule sentences were never proofread after generation.
- Duplicate validation_surfaces line appears verbatim in two separate PlanUnits (CV-286/CV-288); a stray bare ContractRef paragraph sits outside any YAML block.
- "Part P provenance-badge harmonization" and "Coasts" (external system) are both cited as decision-blockers with no definition or owner named anywhere in the corpus.

---

# PART 4 — Per-document findings: system docs

> **Adjudication correction:** TOOLS-1 flagged Plans/MCP_Integration.md and Plans/Section15_MVP_Promoted_Features_Spec.md as non-existent (ContractRef targets that "don't exist"). This is a FALSE ALARM — both files exist in the repo; the auditing agent globbed the wrong directory. Section15_MVP_Promoted_Features_Spec.md is audited below in its own right (SEC15-1/2/3 chunks) and is graded on its actual content, not on TOOLS-1's mistaken claim. Both dangling-OpenRef findings citing these two filenames as "does not exist in repo" are dropped from the Tools.md entry below.

---

## storage-plan.md — NOT READY (C=1 H=6 M=9 L=7)
The document's Tier-0 registry candidly admits most non-core record families (GUI, analytics, provider, terminal, browser, worktree, project-state, permission, safe-point) are deferred/non-materialized with `buildability_gate_passed=false`, yet the "Required record families" prose elsewhere treats several of these same families as mandatory — an implementer cannot tell which storage surface is actually build-ready versus aspirational, and the ~16,000 lines of PlanUnit YAML (SP-030 through SP-231) restate this same ambiguity as token lists rather than resolving it.

### Must fix (Critical/High)
- [CRITICAL] L506,510: registry itself states `buildability_gate_passed=false` for most non-Tier-0 families while other sections list them as "required" — FIX: scope any READY claim to only the 10 materialized Tier-0 rows, or promote the rest before calling this range implementation-ready.
- [HIGH] L131,2801: `active-agents.json` coexists with `projects:v1`/`project_state:v1` with no retirement/migration schema stated — FIX: state whether it's retired, mirrored, or still live file-canon.
- [HIGH] L2003: `kv.json`/`prompt-history.jsonl` "must either be migrated or protected by atomic write" — unresolved either/or, no target key — FIX: pick one path now.
- [HIGH] L952-1004: terminal_* v1 record families listed as "required" but registry marks them deferred (L493-506) — FIX: reconcile.
- [HIGH] L4183 vs L4656/7539 (SP-032): unversioned key baseline (`run:<run_id>` etc.) contradicts every other family's versioned `{type}.v1:{scope}:{id}` pattern, with no supersession note — FIX: mark SP-032 keys retired/alias-only.
- [HIGH] L14405-14469 (SP-206): `permission_snapshot_record` fields deferred entirely to Permissions_System.md with no retention/TTL stated even for storage's own portion — FIX: add a retention note here.
- [HIGH] L16402-16481 (SP-231): "fully materialized" registry claim cannot be verified in-doc — all schema content lives in external `storage_value_registry.json`, confirmed present but unread — FIX: none in this doc; downstream reviewer must open that file directly.

### Worth fixing (Med, condensed)
Three coexisting `blocked_projection` key shapes (canonical vs. two legacy dated forms) invite implementation mistakes (L622,1998,3940,7924,13940) — needs one canonical callout, migration mechanics for existing rows unspecified. `gha_panel_state.v1` cache-invalidation trigger unnamed (L1024). SP-099's legacy 3-component key can't map cleanly to the 2-component canonical (missing project_id). `FileChange[]`/`BundleFile`/`NoteReplyRef` types referenced, never defined (SP-103-105, L8237). Unsafe-filesystem detection (NFS/remote mounts) named with no algorithm (SP-133, L9910). mmap "inode-by-fd safety" invariant undefined (SP-136, L10091). Restart-survival guarantee for fallback-path durable state left ambiguous vs. primary path (SP-132/133, L9862). Notification per-provider payload shapes deferred to CV-298 without an explicit ownership statement (SP-222, L15721). Containerized-host record has no key-template pattern unlike siblings (SP-226, L15988).

### Notable Low
- ~30+ near-identical PlanUnit boilerplate blocks (SP-002..SP-231) triple document length with no new schema content, raising prose/PlanUnit drift risk.
- "XV2" abbreviation used (compatibility label source) but never expanded/defined anywhere (SP-156, L11314).

---

## FileSafe.md — NOT READY (C=2 H=11 M=15 L=9)
FileSafe's central promise — fail-closed security enforcement — is directly contradicted by its own reference code and by a "graceful degradation" mitigation that reappears twice in the doc; a whitelist-matching helper also implements prefix matching that the doc's own locked AutoDecision forbids, which is a live security hole (approving `git status` would also approve `git status && rm -rf /`). Beyond these two showstoppers, override auditing, realpath/case-fold algorithms, and several late-stage redaction/observability proposals (RedactionSettlement, ObservabilityEnvelope) are introduced with zero schema.

### Must fix (Critical/High)
- [CRITICAL] L204-211,690-708: `BashGuard::new(...).unwrap_or_else(|| BashGuard::disabled())` fails OPEN on init error, directly contradicting the doc's fail-closed mandate — FIX: replace with a blocking startup error path.
- [CRITICAL] L2421-2427,11196-11247: "Graceful degradation" mitigation re-endorses the same disabled-fallback pattern as accepted, doubling down on the contradiction rather than resolving it — FIX: pick one behavior canon-wide; delete the graceful-degradation prose/code if fail-closed is truly required.
- [CRITICAL] L414-423 vs L1828-1829: `commands_match()` implements prefix matching (`c.starts_with(a)`) while the locked AutoDecision says approved-commands matching must be exact only — a live whitelist-bypass security hole — FIX: rewrite to `c == a` only, strike "prefix match" from code comments.
- [HIGH] L1638-1646: prompt-based command/path extraction (regex over free text) is the sole Layer-1 defense with no coverage bound and an admitted "less reliable" self-rating — FIX: document as best-effort/non-authoritative or add a compensating control.
- [HIGH] L1819-1955: `PUPPET_MASTER_ALLOWED_FILES` fail-closed default is downgraded to warn-only under `strict_mode=false`, silently turning an empty allowlist into logged-but-unblocked writes — FIX: force block regardless of strict_mode when the allowlist itself is missing/empty.
- [HIGH] L5478-5525 (F2-052): `PUPPET_MASTER_ALLOW_DESTRUCTIVE=1` has no auth/audit gating — any process env var disables all destructive-command blocking — FIX: specify who may set it and whether use is distinctly logged/scoped.
- [HIGH] L5145-5196,6723-6780: realpath/case-fold/symlink comparison algorithm deferred to undefined external IDs "OC-FILE-201/202" — FIX: inline the actual steps.
- [HIGH] L8317-8319 (F2-101): doc explicitly flags an unresolved prose/example mismatch in destructive-pattern detection and defers resolving it — FIX: resolve before implementation; an engineer cannot build from an acknowledged contradiction.
- [HIGH] L11097-11146 (F2-153): "warn-only mode" preserved alongside fail-closed policy with the unit itself admitting reconciliation is needed pre-implementation — FIX: resolve to one canonical policy.
- [HIGH] L13510-13589,13664-13754 (F2-195/197): RedactionSettlement and ObservabilityEnvelope/TracePersistencePolicy proposed with zero data contract, hook point, quota, or sampling algorithm — FIX: define concrete schema/limits or mark as requiring a follow-up design doc.
- [HIGH] L9043-9053 (F2-115): embedded minimal fallback pattern list (when bundled+custom patterns both missing) never enumerated — FIX: state the actual list or source constant.

### Worth fixing (Med, condensed)
No IPC/command name for "Approve once"/"Approve & add to list" actions despite Message enum being defined (L2224-2239). 60s auto-dismiss timeout has no defined logged outcome distinct from approve/deny, and no defined behavior if app closes mid-approval (L2233,10195). Local-pattern load failure reporting is inconsistent between "visible error" and "silently ignored" across two units with no resolution (F2-034 vs F2-038, L4503-4779). `filesafe.project_scope_overrides` schema named, no example given (F2-065, L6213). Two different canonical blocked-payload field lists coexist with no note on whether they're the same schema at different times (F2-172 vs F2-182, L12097-12660).

### Notable Low
- Toggle label drifts across sections: "Write scope" vs. "Restrict writes to plan" for the same control (L636, L2222).
- Template-concatenation defect (missing punctuation between merged fields) appears identically in F2-195/196/198, signaling unreviewed generated text at scale.

---

## Tools.md — NOT READY (C=1 H=9 M=9 L=5) — *corrected: 2 false-alarm OpenRefs dropped*
Core tool contracts (bash, edit, grep, webfetch) are unusually well-specified with concrete timeouts and caps, but the doc has a confirmed structural defect — two separate `## 10` sections with colliding `§10.3`/`§10.7` sub-numbering — that makes every ContractRef into those anchors ambiguous, plus a block of nine "accepted" PlanUnits (T-167–T-175) that are pure backlog problem statements with no schemas.

### Must fix (Critical/High)
- [CRITICAL] L8316-8317,10473-10474: two `## 10` sections exist in the same doc, each with their own §10.3/§10.7 — every citation of "§10.x"/"§11-14" by other PlanUnits is ambiguous until this is fixed (self-acknowledged elsewhere as the "Tools.md#10 defect").
- [HIGH] L11413-12095 (T-167 through T-175): 9 PlanUnits marked `status: accepted` contain only problem statements/acceptance-criteria one-liners — zero schemas, state machines, or wire formats (ToolTurnSettlement, ProviderToolTurnAdmissionGate, CommandInvocationContract, etc.) — FIX: write the actual contracts or downgrade status from "accepted."
- [HIGH] L11413-11497 (T-167): 9 named states (success/partial/truncated/malformed/redacted/etc.) with no transition rules, no precedence when multiple apply, no wire field name — FIX: define enum field name + precedence order.
- [HIGH] L11737-11810 (T-171): `invocation_kind` enum given but no concrete data structure or reconciliation with the existing `bash` tool contract — FIX: needs schema + explicit tie-in.
- [HIGH] L11812-11885 (T-172): fields listed (configured/allowed/injected/visible_to_model/etc.) with no types, no example payload, no persistence location.
- [HIGH] L297-299: `bash` tool `initial_wait` range is referenced but min/max never quantified.
- [HIGH] L1145-1146: retry jitter formula (±25%) doesn't state application method or whether it can push delay negative — FIX: define precisely.
- [HIGH] L1949-2031: DuckDuckGo capability description restated 4+ times with slightly different phrasing across §11.1/§11.3 — risk of silent drift.
- [HIGH] L7672-7719 (T-101): "advanced query-pattern matcher contract" for webcrawl host-pattern scoping has no named owner — explicit unresolved dependency.

### Worth fixing (Med, condensed)
`output_limit_exceeded` error references an unquantified cap (L317-321); `read`/`view` "too_large" has no byte value (L391, contrast webfetch's explicit 5MB). Permission preset tables (§9.2 vs §10.4) enumerate divergent tool lists for the same concept, risking drift (L1263,1310). "Full" preset doesn't state bash/edit/webfetch treatment explicitly. `debug_capable` tool list is non-exhaustive ("commonly participating," L1206). T-106/T-107 overlap on blocked/denied field ownership without stating which is canonical. Perf-tier overflow behavior (>50GB project) undefined (T-052, L5142-5212).

### Notable Low
- Two span IDs (Tools-S0075/S0076) referenced nowhere in the doc — possibly silently dropped content, unconfirmed.
- Optional websearch/webfetch rate limit ("mitigation: optional") means no rate limit is actually mandated anywhere.

---

## chain-wizard-flexibility.md — NOT READY (C=2 H=15 M=13 L=6)
The single biggest issue: the entire document is explicitly retired in place (all CWF-* PlanUnits `status: retired`), yet a later unit within the same file (CWF-152) is the only place this is stated plainly, and it contradicts 150+ preceding units without a migration cutover mechanism — an implementer following this file alone has no active spec, and it's unclear which sections `PRD_Builder.md`/`Planning_Wizard.md` actually superseded versus merely renamed.

### Must fix (Critical/High)
- [CRITICAL] L38,10156-10229: entire doc is compatibility-only lineage; CWF-152 declares "Chain Wizard"/"Plan Wizard" stale names retired in favor of "Planning Wizard" with no stated cutover date or which CWF units are void vs. still authoritative — FIX: confirm successor docs cover branching/skip/back/resume semantics equivalently before treating this as closed.
- [HIGH] L1128-1245: intent-change-mid-flow modal and Builder→Interview handoff "guard" are prose-only resolutions with no actual mechanism (what fires the check, what error surfaces).
- [HIGH] L3823-3878: run-state enum given with no transition table; PDF/DOCX extraction failure has no named engine or error taxonomy.
- [HIGH] L4104-4494: "enough information" generation-suggestion trigger has no measurable definition; annotation `operation_payload` shapes named as tokens with no actual JSON schema per operation type.
- [HIGH] L4640-4645: selection-palette operations (Comment/Replace/Insert/Remove) have no defined trigger location, enabled/disabled logic, or keyboard path.
- [HIGH] L5002-5298: `interview.scope_probe.max_questions` config keys referenced but not found in interview-subagent-integration.md via grep; GUI-inventory elicitation algorithm for UI wiring fragments during interview undefined.
- [HIGH] L5792-5794,6680: org-picker UI flow for "read:org" fork destination undefined; legacy `validation_pass_report` schema referenced repeatedly, never shown.
- [HIGH] L7894-7917,9993-10023: "3 cycles" clarification cap has no idle/expiry handling for a stalled cycle; blocked-packet payload lists ~15 fields with no schema/example.

### Worth fixing (Med, condensed)
Two "Required fields" lists for what appears to be the same handoff contract, unreconciled (L339,1494). Pause/cancel "next handoff boundary" undefined per-subsystem (L3774). Precedence between selector-driven and manual-checklist Skip overrides on resume unstated (CWF-051 vs 053, L5041-5153). Dry-run "unbound action" detection algorithm for GUI catalog coverage undefined (CWF-059, L5460). CWF-140's audit-lineage counters left unclear whether they still apply post-CWF-152 supersession (L9560,10077). Nearly every CWF unit self-flags `split_recommended: true` without the split ever being executed.

### Notable Low
- "MVP = user fork only" phrase explicitly retired but restated 3x in the same unit as if still relevant (L5779-5832).
- Structural mismatch: §3.5 heading present at L468 with body appearing only at L492+.

---

## Models_System.md — NOT READY (C=4 H=10 M=8 L=4)
The doc claims sole SSOT status for model selection but never states what replaced the retired `platform_specs.rs` authority (a question another doc, Provider_OpenCode.md, explicitly raises and this doc never answers), is missing `context_window`/token-limit fields from its entire capability matrix, has a heading with zero body text (§4.4 "Two Gemini providers"), and defines the same `ProviderCapabilityEpoch` structure twice with different field sets.

### Must fix (Critical/High)
- [CRITICAL] L435-462: capability matrix has no `context_window`/`max_context_tokens` field anywhere — blocks context-aware truncation, compaction denominator, and model-picker context-size display — FIX: add to the §3.3.1 field table.
- [CRITICAL] L570-573: "§4.4 Two Gemini providers" is a heading with zero body content; PlanUnit MS-031 confirms this is intentional/unwritten — FIX: write the content or delete the heading.
- [CRITICAL] L13,295,306: doc claims sole SSOT for model config, but never mentions that Provider_OpenCode.md independently retires `platform_specs.rs` as the capability authority — no replacement source is named — FIX: state explicitly what the live capability-metadata source is.
- [CRITICAL] L8471 vs L8718 (MS-124 "P0-PROVIDER-CAPABILITY-EPOCH" vs MS-127 "-2"): two differently-scoped definitions of the same `ProviderCapabilityEpoch` structure, unreconciled — FIX: state whether -2 replaces, merges, or extends the original.
- [HIGH] L242-265,963-992: 6-7 tier "selection priority" fallback chain has no schema, no max depth, no exhaustion behavior — only an ordered list of source names.
- [HIGH] L79-90: resolver's most-cited data contract (~13 fields) has no JSON example anywhere, unlike other contracts in the same doc.
- [HIGH] L528: `model_lifecycle_state` enum has no transition rules and no GUI surface to show it in the model picker.
- [HIGH] L8631-8792: EffortSettlementReceipt and ModelSelectionRouter each list 6-11 field names with no types/enums/example payload or scoring algorithm.
- [HIGH] L8964-9231 (MS-130/131/132/133): EntitlementQuotaSettlement enum given with no classification logic; ProviderPolicyRuleset/ProviderMetadataReplayPolicy/ProviderErrorEnvelope units are literally "Add X" to-do phrasing marked `status: accepted`.
- [HIGH] "platform_specs" term does not appear anywhere in Models_System.md despite being the doc's own steer-flagged authority question (confirmed via full-file grep).

### Worth fixing (Med, condensed)
`billing_entity` optionality condition ("when applicable") undefined (L454-456). Variant-cycling keybind has no default value or disabled-mid-cycle behavior (L735-742). Three different "priority N" claims for Persona/variant/picker precedence never resolved into one ordered chain (MS-041/049/056). Image-generation route rules (6+ providers) given only as dense run-on prose, not a table (MS-057, L4423). Firecrawl/Tavily/Exa/DDG/Google full 5-provider priority order never stated as one list (MS-032 vs MS-034).

### Notable Low
- No collision-safety regex given for Persona `id`/alias keys despite one existing for variant names (L720).
- `target_docs` inconsistently uses bare filenames vs. "Plans/" prefix (MS-130, L9004).

---

## Section15_MVP_Promoted_Features_Spec.md — NOT READY (C=6 H=6 M=5 L=4)
Prose sections (L1-800) are genuinely strong — named contracts, concrete timeouts, persistence tiers — but everything from L810 onward is machine-generated PlanUnit YAML restating that same prose with zero new mechanism, and a cluster of 11 P0/P1 terminal-hardening units (SMPFS-125..136) explicitly defer the actual spec work via `compile_disposition: create_new_planunit`, meaning roughly a third of the "MVP-promoted" terminal features have no real content yet.

### Must fix (Critical/High)
- [CRITICAL] L8185-8267 (SMPFS-124): fixture matrix for VT/xterm/OSC protocol testing is stated not to exist yet, deferred to an unspecified future doc — FIX: author it now or drop from MVP scope.
- [CRITICAL] L8269-9161 (SMPFS-125 through 136, 11 units): TerminalIngestionReceipt, TerminalBackpressureState, and 9 other P0/P1 structures have no field list, wire format, or storage location — all explicitly deferred — FIX: write real specs or exclude from an "implementation-ready" doc.
- [CRITICAL] L6614-6694 (SMPFS-100): canonical browser action table (action_id/bucket/tier/output fields) is referenced but never actually shown anywhere in range.
- [CRITICAL] L6621-6674: three conflicting timeout constants (5000ms/30000ms/30s) with no disambiguation of which applies to which action.
- [CRITICAL] L6274-6335 (SMPFS-095): tab-cap policy names four outcomes (prompt/block/close/detached) but never states the actual numeric threshold or dialog copy.
- [CRITICAL] L6818-6981 (SMPFS-103/104/105): restore-identity behavior described with no algorithm, ordering, or conflict-resolution rule when two tabs claim the same project_id.
- [HIGH] L672-673: browser runtime (CEF via wef/cargo-wef) remains conditional with no packaging/install strategy defined.
- [HIGH] L3452-3512 (SMPFS-048): streaming usage payload fields named with no JSON schema or event name.
- [HIGH] L5866-5994,6070-6137: `cmd.browser.share_with_agent`, `browser_run_code`, `browser_evaluate` referenced as exact command tokens but not found anywhere in Tools.md via grep.
- [HIGH] L6139-6335 (SMPFS-093/094/095): DevTools boundary, artifact manifest, and session persistence all described in prose with zero concrete schema (no manifest fields, no retention numbers, no naming template).
- [HIGH] L188: pane layout family transform algorithm ("nearest valid family") has no geometry spec or transform table.

### Worth fixing (Med, condensed)
`command_block_id` schema given as prose, not a formal type table (L298). Transcript persistence chunk size/flush interval unspecified (L302). SMPFS-089/090 duplicate near-identical negative-constraints blocks about screenshot/chip capture with no distinguishing content. Command palette entries for project/workspace/terminal families are token-only, no actual command IDs shown (SMPFS-101/102). Best_effort_durable transcript snapshot bound (rows/KB) unspecified (SMPFS-109).

### Notable Low
- ~2260+6800 lines of duplicated PlanUnit YAML restate L1-800 prose verbatim with zero new mechanism — severe bloat, flagged as a cross-cutting concern.
- "Section 15 terminal-core architecture" is cross-referenced by FinalGUISpec.md but has no literal matching heading in this doc (substantively covered by §3.14, not a literal anchor).

---

## Permissions_System.md — NOT READY (C=0 H=13 M=13 L=6)
No single showstopper, but a cluster of dangling internal section anchors (§6.2, §6.4A, §2.4B all cited but don't exist) combined with an undefined `cmd.permissions.revoke` command and a durable rule schema missing a stable `rule_id` field means the core grant/revoke flow cannot be implemented as specified; several late-added units (AutonomyCeilingReceipt, ProviderEgressPolicy, command-approval lease) introduce entirely new mechanisms with zero schema.

### Must fix (Critical/High)
- [HIGH] L1016,396: "`always` response (§6.2)" — §6.2 does not exist; derivation actually lives in §3.4 — FIX: correct all references.
- [HIGH] L1028: "§6.4A" does not exist anywhere in the doc; `create_project_rule`/`create_global_rule` only described in unlabeled prose.
- [HIGH] L1034: "§2.4B" does not exist; scope specificity lives in unlabeled prose inside §2.4.
- [HIGH] L1028,5688: `cmd.permissions.revoke` cited repeatedly as the revocation command but never defined (no params, return value, or error cases anywhere).
- [HIGH] L728: durable rule record has no `rule_id` field, yet rules must be revocable and `tool_pattern` alone can collide — FIX: add a stable UUID field.
- [HIGH] L713-779: TOML persistence layer has no corruption/parse-failure recovery, no concurrent-write conflict handling, no atomic-write/rename strategy.
- [HIGH] L4634-4950 (PS-063/065/068): Permissions tab route, rule-editor add/reorder/delete, and directory-picker all lack exact command/IPC names and validation-error UI states.
- [HIGH] L8606-8704 (new, dated 2026-07-03): AutonomyCeilingReceipt and ProviderEgressPolicy introduced with zero field schema, storage location, or enforcement-point algorithm.
- [HIGH] L8761-8864 (PS-129/130): "Command approval lease bound to normalized command identity" — normalization algorithm (shell-string vs argv, whitespace, env interpolation) is completely undefined; PS-130's title is a literal placeholder ("PS-130 - PS-130").
- [HIGH] L7708-7709: `network_access_policy`/`secret_access_policy`/`destructive_command_policy` field names referenced by 3+ units with no single canonical enum/defaults table.
- [HIGH] L1136: runtime-addendum domain-sensitive permission classes (docker exec, kubectl exec, git force-push) don't appear anywhere in the §5 tool-key table — a parallel undocumented taxonomy.
- [HIGH] L1150-1199: permission_snapshot schema exists but reason-code enums (stop_reason_code, blocked_reason_code, budget_kind) lack full value sets/transitions.
- [HIGH] L4899-4950 (PS-068): external-directory picker has no dispatch name, no duplicate-path or invalid-glob error state.

### Worth fixing (Med, condensed)
"Identical input" for doom_loop's 3-strikes rule is undefined for non-deterministic args like timestamps (L456-466). §5 tool-key list mixes tool names, guard keys, and UI-state fields without separation — would render nonsense table rows if built literally. "Owner/Consumer Map" heading has no actual table beneath it (L1283). individual_timeout default for the batch-timeout formula is never stated (PS-045). Scope-selector disabled state has no visual spec, only a token (PS-071).

### Notable Low
- ~1700+ lines of PS-002 through PS-032 duplicate L1-1280 prose as YAML with no sync-enforcement mechanism, drift risk.
- 12+ instances of "future X" as the only implementation_surface (future SSH prompt flow, future bridge disclosure popup, etc.) signal a systemic backlog with no home doc.

---

## newtools.md — NOT READY (C=0 H=10 M=8 L=3)
No single Critical blocker, but a dense cluster of Doctor check IDs asserted as "canonical" throughout the doc (doctor.mcp.context7, doctor.registry.auth, doctor.docker.buildx, doctor.debug.*, etc.) do not appear anywhere else in the corpus — grepped against Tools.md and Containers_Registry_and_Unraid.md with zero hits — meaning these checks may exist only in this document's imagination, and several core schemas (catalog entry struct, action-catalog format, manifest.json) are described only in prose bullets.

### Must fix (Critical/High)
- [HIGH] L173-186: `FrameworkEntry`/`ToolEntry` catalog struct has no full field-type schema, only prose bullets.
- [HIGH] L340,1116: "action catalog" schema/action-ID/scenario-file format referenced repeatedly, never defined — only points to `src/automation/` as a reference location.
- [HIGH] doctor.mcp.context7, doctor.registry.auth, doctor.dockerhub.auth.capability, doctor.docker.buildx, doctor.debug.* (6+ check families) — asserted "canonical" throughout newtools.md but zero hits when grepped against the docs that should also define/register them.
- [HIGH] L5610 (N2-095): preflight failure fields (code, severity, dependency, expected, observed, remediation) given with no enum of `code` values or `severity` levels.
- [HIGH] L4923-4926: manifest.json field list is a token list only, not a schema; "render hints" undefined.
- [HIGH] L7423 (N2-132): "deny-code families" for a shared trust/proxy/governance preflight are named but never enumerated, with no link to the exact Permissions_System.md mechanism.
- [HIGH] L7473 (N2-133): instrumentation-scope records (temporary/durable status, cleanup path) have no schema or storage location.
- [HIGH] L7267 (N2-129): debug target registry (launch config, URL, attach PID, browser session) has no stated storage location — redb? in-memory? file?
- [HIGH] ~8 instances of `split_recommended: true` across N2-096 through N2-140 with no visible resulting split — systemic pattern, not one-off.
- [HIGH] L8814 vs L8873: two units (N2-120, N2-141) encode the same "doctor.registry.auth is deprecated" constraint with different scope language, unreconciled duplicate source of truth.

### Worth fixing (Med, condensed)
MCP adapter generation timing leaves "long-lived user/profile config" undefined for which providers (L523-525). §7.2 and §12.6 duplicate the same `tools.custom_headless` spec with no cross-link at first mention, drift risk (L244,496). N2-121 claims to be the "Result payload minima section" but has no fields of its own — circular naming confusion with N2-144/145/146 (L6866,8016-8179). Package-size budget stated only as "around 1 GB," non-testable (N2-093, L5513). doctor.debug.* behaviors (hide/degrade/block/fallback) named per-check-family but not mapped individually (N2-136, L7626).

### Notable Low
- L318 vs L265: identical boilerplate sentence ("newtools.md is live canon now") repeated verbatim two sections apart.
- Meta-commentary about the migration/atomization process ("Lines 801-817... covered by N2-097 after Phase 2B batch 106") embedded directly as canonical_text rather than the actual requirement (N2-096, L5658).

---

## UI_Command_Catalog.md — NOT READY (C=1 H=12 M=6 L=3)
The single most consequential gap: there is no `cmd.chat.send` command anywhere in this 7,880-line catalog — the single most-used action in the entire product (submitting a chat message) has no defining row — alongside six entirely missing command families the steer explicitly asked about (theme, persona, alert, concern CRUD, orchestrator-level pause/resume, model refresh), and every command row from UCC-049 onward is expressed only as prose/token lists with no actual payload schema.

### Must fix (Critical/High)
- [CRITICAL] L3891-7880 (whole second half): every command row (UCC-049 through UCC-106) is `preserved_exact_tokens` + prose, never a schema with types/required-optional/defaults — an engineer cannot implement a wire contract from this range alone.
- [HIGH] L979-1067: no `cmd.chat.send`/`send_message` row exists anywhere — composer message submission, the single most-used action, is undefined; only `/cancel`→`cmd.chat.stop` is named without its own defining row.
- [HIGH]: no `cmd.theme.*` family anywhere in the doc.
- [HIGH]: no live `cmd.persona.*` family — only retired field aliases (`requested_persona_id`/`effective_persona_id`).
- [HIGH]: no `cmd.alert.*` family anywhere.
- [HIGH]: no `cmd.concern.*` CRUD/lifecycle family — only a state-vocabulary route-open pivot.
- [HIGH]: no generic orchestrator-level `cmd.orchestrator.pause`/`resume` — only Debug-Mode-scoped and blocked-episode-scoped variants exist.
- [HIGH]: no `cmd.model.*` family (model refresh) anywhere in the doc.
- [HIGH] L3902-3904,3780-3795 (UCC-047,049): PlanUnit `preserved_exact_tokens` list command IDs (`cmd.docker.build.image`, `cmd.github.actions.settings.open`, etc.) that do not match the actual prose command tables (`cmd.docker.build`, no settings.open row exists) — the ledger layer contradicts its own source of truth.
- [HIGH] L6274-6402 (UCC-089/091): of 9 named runtime-recovery actions, only approve/decline/retry_now/open_attempt_details map to explicit `cmd.runtime.*` targets — resume_after_prerequisite, restore_safe_point_then_retry, start_fresh_attempt, replan, skip_node, abort_run have no shown target command ID, a direct gap for "retry-from-safe-point" flows.
- [HIGH] L849-859,801-824: neither Terminal nor Browser command tables have an error/failure-event column — only success-path domain events are listed.
- [HIGH] L4522-4568 (UCC-060): compaction command return-state enum given (9 values) with no payload/response field shapes per state.
- [HIGH] L3930-4162 (UCC-050-053): 6-state disabled-state taxonomy (Unsupported/Not configured/etc.) listed once but never mapped per-command to which states apply where.

### Worth fixing (Med, condensed)
No generic "panel undock" command — only browser-tab-detach and terminal-detach exist as one-offs. `context_scope: ui_command_catalog_batch_190` reused verbatim across ~30 unrelated units, signaling mechanical batch-tagging over authored spec. Route payloads given as bare shape literals with no required/optional marking or error variant (UCC-091, L6358). "Drift/trust blockers refresh effective capability before mutation" mechanism (poll vs push, which event) unspecified (UCC-053, L4104).

### Notable Low
- Literal chat-transcript residue ("All of that.", "all of thodse" [sic]) preserved as command-vocabulary tokens in UCC-100 — harmless but pollutes the anchor list.
- UCC-095's `split_recommended: true` was never acted on; the unit still mixes GUI copy and backend metadata in one block.

---

## LSPSupport.md — NOT READY (C=0 H=3 M=5 L=8)
The best-specified document in this batch — core lifecycle, registry, and config sections are genuinely implementation-ready — but a real self-contradiction on whether PM auto-installs or merely detects rust-analyzer, an unresolved client-crate choice for Phase 1 (two candidates still listed with no decision), and two different unreconciled evidence-caps ("10 files/50 diagnostics" vs. "top five items") keep it from full readiness.

### Must fix (Critical/High)
- [HIGH] L109-144,1411-1468: §3.2 table lists rust-analyzer as self-managed/PM-detects-on-PATH, but §3.2 prose later calls it part of the "PM-managed/default first-class set" — contradicts whether PM auto-installs it — FIX: state one behavior explicitly.
- [HIGH] L107-144: server catalog table has no `default_enabled`/`support_classification`/install-behavior columns populated for any of the 30+ rows, though those fields exist abstractly elsewhere (§14.9).
- [HIGH] L920-923: gate `scope: "project"` offers two different bounding strategies (under project root vs. only open-document files) with no decision on which applies.
- [HIGH] L5172-5173 (LSPS-075): Phase 1 prerequisite still lists two candidate crates ("lsp-client"/"async_lsp_client") with no canonical decision — blocks Phase 1 start without a spike.

### Worth fixing (Med, condensed)
Root-discovery table (§3.5) covers only 10 of 30+ cataloged servers; the other 20 (astro, bash, csharp, dart, etc.) have no root-marker rule or fallback stated. `select_for_node` subagent-selection function has no file/module location given, unlike sibling functions. Two different diagnostic/evidence caps ("10 files, 50 diagnostics" vs. "top five evidence items") are never reconciled as the same or distinct budgets (L5124 vs L6485). Two snapshot filename patterns given with no rule for which applies when (L6608). Only two example server→subagent bias mappings given with no full table (rust-analyzer→rust-engineer, pyright→python-pro).

### Notable Low
- Restart backoff stated two different ways for the same "server crash" concept: 1s/2s/4s cap 30s (client-side) vs. 2s/4s/8s max-3 (state-machine section) — worth reconciling.
- Evidence retention policy for `.puppet-master/evidence/lsp-snapshots/` (max files/age) never given.
- PlanUnits section roughly doubles doc length restating prose verbatim rather than referencing it by anchor.

---

## Executor_Protocol.md — NOT READY (C=2 H=8 M=7 L=4)
Core lifecycle/dispatch prose is unusually precise on concrete values (backoff timings, signal grace windows, status enums), but the scheduler's scoring/tie-break algorithm and the full failure/blocked-reason-code enum — arguably the two most load-bearing mechanisms in the whole doc — are described only as field-name token lists, never as an actual algorithm or closed enum, across ~3,500 lines of PlanUnit metadata.

### Must fix (Critical/High)
- [CRITICAL] L3436-3485,4074-4118: scheduler score-tuple fields (scheduler_lane, manual_priority, transitive_unblock_count, etc.) are named with defaults, but the actual tie-break comparator/algorithm is never shown — FIX: inline the literal scoring function.
- [CRITICAL] L3874-4264: non-success classification, failure/blocked-episode split, and HTE/DAE graph-lock safety are described only via canonical_text summaries — no enumerated closed set of failure_class or blocked_reason_code values anywhere in range.
- [HIGH] L146-239: `execution_unit_context` field table is thorough but has no JSON example instance and no conditional-requirement matrix (which optional fields become mandatory per execution_unit_type).
- [HIGH] L335-341,543-546,2221-2265,3487-3530: three separate "Wakeup triggers" sections forward-reference a "Wake reasons and coalescing" section that does not exist anywhere in the audited range.
- [HIGH] L370-388: "malformed provider structured output" detection mechanism (schema validation? parse failure? both?) never defined despite retry counts/backoff being given.
- [HIGH] L6656-6946 (EP-110-113): StreamHistoryCoalescer phases, WebSocket transport policy, and backpressure diagnostics are all one-line proposals with no message schema, timeout values, or queue-depth limits — exactly the streaming/error-taxonomy gap the steer asked about.
- [HIGH] L4954-5003 (EP-083): attempt-counter invariant formula given, but no spec for what happens if sub-counters disagree with attempt_count at runtime.
- [HIGH] L5056-5106 (EP-085): event dedup key includes a raw timestamp — fragile, since two truly-distinct events could share event_name/node_id/attempt_id/ts at sub-second resolution; no sequence-number fallback given.

### Worth fixing (Med, condensed)
`stop.identical_failure` vs `kill.identical_failure` naming: EP-033's canonical_text still uses the stale event name without the compatibility-alias note that a later unit (EP-035) adds (L399,2507). Doom-loop "nesting level" for identical-triple detection is never defined (call-stack depth? recursion depth?) (L397-401). SIGTERM-past-grace-window escalation to SIGKILL is implied but never stated explicitly (L429-438). MVP cleanup posture ("no sandbox worktree jail") isn't reconciled with FileSafe-bypass detection still being listed as a first-class blocked class elsewhere (EP-062 vs EP-068).

### Notable Low
- `replan_generation` typed as u32 but described as having "no practical maximum," a soft inconsistency since u32 does have a hard ceiling (L5108-5156).
- "Owner/Consumer Map" section (L850-854) is two lines of meta-description with no actual table.

---

## Media_Generation_and_Capabilities.md — NOT READY (C=3 H=9 M=8 L=3)
The doc's own canonical disabled-reason enum is contradicted by its own acceptance criteria within the same document (two extra values used that aren't in the locked 6-value enum), the pivotal "verified generated-media route" mechanism that gates Cursor image generation is referenced 6+ times but never defined anywhere, and at least one regex pattern given for prompt-slot extraction uses lookahead syntax that Rust's standard `regex` crate does not support — a potential hard implementation blocker if the backend is Rust.

### Must fix (Critical/High)
- [CRITICAL] L309-320,960,4955 vs L1338: canonical disabled_reason enum is locked to exactly 6 values, but AC-MED05/MGAC-072 use `UNSUPPORTED`/`CAPABILITY_GATED`, which are in neither the 6-value nor the 9-value error enum — FIX: either add these to the canonical set or rewrite the acceptance criteria to use only canonical values.
- [CRITICAL] L4348,L6348 ("verified generated-media route"): term used repeatedly (MGAC-061/069/070/071/072/080) to gate Cursor image generation, but the actual mechanism — what API/field is checked, cache/refresh cadence — is never defined anywhere in the audited range.
- [CRITICAL] L6400-6566 (MGAC-100/101): MultimodalInputSettlement and MediaFallbackCaptionPolicy introduce substantial new data models as bullet field-name lists only — no types, no state machine, no wire format, no relationship to the existing media.generate envelope.
- [HIGH] L621-805,672,1047-1048: regex patterns for prompt-slot extraction use lookahead `(?<!\w)`/`(?=...)` — Rust's `regex` crate does not support lookaround — FIX: name the actual regex engine/crate or rewrite patterns.
- [HIGH] L444-491: media routing through `generated_media_routes[]` has no data model given anywhere — no schema for what a provider/model "row" is or how routes are structured, unlike other sections with JSON examples.
- [HIGH] L536: tie-break rule for selecting among multiple eligible routing rows is unspecified (first-match vs. best-match).
- [HIGH] L557: no cleanup spec for partially-written artifact files when persistence fails after partial provider output.
- [HIGH] L4348-4398,4642-4833 (MGAC-061/069/070): Cursor image-generation enabled-by-default status contradicts itself across units — canonical_text says "enabled" while compatibility notes call the same phrase "retired," and the BACKEND_UNSUPPORTED canned copy assumes image is always supported when it's actually conditional.
- [HIGH] L4241-4287,4607-4668 (MGAC-059/066): footer copy for "no eligible media route" must not imply AI Studio/Gemini exclusivity, but no actual replacement copy string is supplied anywhere — a UI-copy requirement with no literal string, i.e., a stub disguised as a spec.
- [HIGH] L1007,5483 (AC-MED14/MGAC-082): multi-artifact numbering scheme (`output_000`, `output_001`...) for count>1 requests is never confirmed — is padding fixed at 3 digits or scaled?

### Worth fixing (Med, condensed)
Count-clamp "default 8" has no named setting/config key for changing it (L410,690). Manifest.json `schema_version` format/value never given (L2540). request_id collision handling and entropy guarantee unstated (L2653). Model-override alias resolution has no tie-break rule when a normalized key collides across kinds (image vs video alias) (MGAC-044, L3436). size_px enum has no fallback for out-of-enum numeric sizes (MGAC-047, L3618). "trailing comma controls" grammar referenced but not restated in range (MGAC-048).

### Notable Low
- capabilities.get new fields (enabled_on_instance, usable_now, caller_scope, etc.) introduced narratively (MGAC-092) with no full updated response schema shown in one place.
- Stray unescaped Unicode apostrophe artifacts ("PM's") in canonical_text (MGAC-100, L6407/6484) — cosmetic generation-quality flag.

---

## MiscPlan.md — NOT READY (C=1 H=8 M=7 L=5)
The doc delegates all Agent Skills backend/runtime behavior to `Plans/Skills_System.md`, which does not exist in the repo (confirmed via glob) — yet the GUI section for the same feature (§7.8) still contains the full detailed model inline, meaning the document contradicts itself on where the skill spec actually lives; several other GUI decisions (concurrent-edit handling, version-mismatch policy) are left as unresolved "implementation must decide" placeholders with contradictory defaults stated in different places.

### Must fix (Critical/High)
- [CRITICAL] L699,1117,3179: `ContractName:Plans/Skills_System.md` cited as owner for all Agent Skills backend/runtime behavior — file does not exist in Plans/ (verified via glob) — FIX: create it or restore the detailed spec that was apparently replaced by this reference.
- [HIGH] L696-719 vs L583-648: §7.10 (backend) is a thin ContractRef-only stub pointing to the nonexistent Skills_System.md, while §7.8 (GUI) still has the full detailed model (discovery paths, name regex, permission integration) inline — doc contradicts itself on where the model lives.
- [HIGH] L629-631 vs L696-719: two different placement authorities stated for the same Skills tab/section location (this doc vs. Skills_System.md/FinalGUISpec via a compatibility note).
- [HIGH] L748: Skill permission "ask" flow explicitly deferred to "phase 2," with UI location left to implementation — a real stub in a feature §7.8 lists as required.
- [HIGH] L735 vs L773: Shortcuts export version-mismatch handling is stated as ambiguous ("implementation must decide") in one place and definitively "reject" in another — same feature, two confidence levels in the same doc.
- [HIGH] L6053,6081 (M-079): debug instrumentation lifecycle subsystem explicitly marked "not treated as grounded MVP behavior until this contract exists," with no contract defined in-range.
- [HIGH] L6356-6365,6379 (M-083): platform_specs injection contract lists field names only, zero schema; `list_skills_for_agent` flagged stub with no resolving owner doc.
- [HIGH] L6307-6317 (M-082): doc documents its own "duplicate References/Implementation status sections" and a missing §9.1.20 (confirmed absent via grep) but defers fixing it rather than doing so.

### Worth fixing (Med, condensed)
§7.4.0 cross-reference to FinalGUISpec.md doesn't resolve — no matching section header found via grep (L37,1508). Global-skill create has no path-collision handling, unlike the project-skill case which does specify one (L751). `resolve_git_executable()` existence/location asserted uncertain across two units describing the same call site (L3938 vs L5511). Slint key-event API version pin ("1.17.0 or current stable") is a to-do note rather than a verified decision, repeated in two places (L1136, M-068 L5384).

### Notable Low
- Strikethrough dead content ("SDK fallback removed") left in-place rather than deleted, adding noise (L1085,2211).
- ~1840 lines of PlanUnits section restate §1-11 content with near-identical boilerplate, roughly doubling doc length with no new implementation detail.

---

# PART 5 — Per-document findings: remaining docs + JSON artifacts

# Digest C — Synthesized Audit Findings (Chunk Set C)

Covers 55 Plans/*.md documents (from CONTAINERS/USAGE/INDEX/WORKTREE/MULTIACCT/PROMPTPIPE/OCDEEP/FILEMGR/ARCHINV/PLUGINS/PROVOC/CMDS/GATES/PROJOUT/WIRINGMD/PERSONAS/DECPOL/CROSSWALK halves, PAIR-1..11, and BUNDLE-1..10) plus one JSON artifacts section (JSON-WIRING, JSON-RECON, JSON-SCHEMAS, JSON-STATE). Adjudicated corrections applied per steer: MISC-1's "Skills_System.md doesn't exist" is a FALSE ALARM (file exists, 2482 lines, actively cross-referenced); PROJOUT-2/BUNDLE-1 claims that `runtime_artifact_*.schema.json` files "don't exist" are FALSE (all 20 exist, minified to 1 line each); FILEMGR-2's note that a peer's §10.10.5-8 reference is wrong STANDS (that section does not exist in FileManager.md).

---

## Containers_Registry_and_Unraid.md — NOT READY (2 HIGH/CRITICAL, ~14 MED/LOW across both halves)
Solid prose contracts for Docker/Unraid publishing, but a canonical reason-code enum contradicts itself, and several GUI cockpit contracts are directional rather than exact.
**Must fix**
- [HIGH] L1885 vs L196: CRAU-017 reason-code enum (`container_unreachable, port_unbound, auth_expired...`) doesn't match the canonical L196 list (`runtime_context_missing, compose_invalid...`) — reconcile into one enum.
- [HIGH] L4319-4373: 9-state template-repo enum is "normative" but no transition table is inline; CRAU-070 UI labels ("dirty/committed/ready-to-push") don't map onto the canonical enum values — add mapping.
- [HIGH] L142-236: dense Docker Manager cockpit contracts define dozens of controls with no enabled/disabled trigger conditions or exact labels (systemic across L142-244).
**Worth fixing**: empty headings (§ca_profile.xml round-trip, tag template resolution) with content deferred elsewhere; OpenRefs `cmd.docker.open_target`/`target_object` cited but never defined; two migration run-dir names (`pds-...001`/`...002`) never reconciled; CRAU-085 status enum lacks a `blocked` value despite CRAU-039 defining `blocked_preflight`.

## usage-feature.md — NOT READY (2 CRITICAL, several HIGH across both halves)
Canonical schema/pipeline well-specified in prose, but widget catalog section refs are dangling and net-new mechanisms (anomaly guard, cache envelope) have zero design.
**Must fix**
- [CRITICAL] L788-864: cites `Widget_System.md` §2/3/4/7 but that file's real headings are §1-4 only — renumber cross-refs.
- [CRITICAL] L515: references a `Unified UsageRecord schema` heading that doesn't exist anywhere in the file — write it or drop the claim.
- [HIGH] L5601-5686: UsageAnomalyGuard has no spike ratio/window/confidence formula defined.
- [HIGH] L563,629,614: refresh interval and 90-day retention lack concrete config keys/enforcement mechanism.
**Worth fixing**: alert threshold "80%" stated as example (L141) but preserved as a hard token (L1355) — resolve; multiple "split_recommended: true" units never actually split.

## 00-plans-index.md — first half NOT READY / second half READY
Meta-index is internally consistent; INDEX-2 (L2583-5264) verified all sampled owner docs exist and found only hygiene issues.
**Must fix**
- [MED] L269 vs L20-21: ambiguous whether chain-wizard.md is fully retired or still a valid "PlanUnit-index owner doc" — state explicitly.
- [MED] L2796 vs L4992: conflicting statements on whether newtools.md retains live Docker/Actions-doctor ownership post-2026-06-30.
**Worth fixing**: 0PI-060 missing its `### 0PI-0NN` heading; 0PI-066 title is literally "0PI-066 - 0PI-066" (placeholder); ~1,900 lines of PlanUnit YAML mechanically re-serialize prose above with no new info.

## WorktreeGitImprovement.md — NOT READY (1 CRITICAL, several HIGH across both halves)
Missing Section 2.7 entirely; GUI command surfaces (Source Control > Graph, Conflict assistant, etc.) lack full state/error contracts; second half is pure PlanUnit metadata with no HOW.
**Must fix**
- [CRITICAL] L445,464,505: "2.7 (worktree_exists validity)" is referenced 3x but no `### 2.7` heading exists (2.6 jumps to 2.8) — add the section defining the actual algorithm.
- [HIGH] L146 vs L1240-1248 vs §7.14(3): conflict-worktree persistence resolved three different (partially contradictory) ways across the doc — state the one resolved decision (in-memory HashSet) and remove open-question framing elsewhere.
- [HIGH] L392-397, W-033/W-036: Source Control > Graph, AI commit batching, Conflict assistant have command IDs but no enabled/disabled logic, payload schema, or failure states.
**Worth fixing**: `worktree_id/path`/`owner_tier_id` treated as canonical in prose but compatibility-only per PlanUnit metadata; `grace_period_ms` has no default value.

## Multi-Account.md — NOT READY (several HIGH across both halves)
Account storage/credential schema defined but rotation-on-rate-limit lacks concrete parameters; one internal contradiction on "no open questions."
**Must fix**
- [HIGH] L406-411: `retry_budget` field named but no default value, unit, decrement/refill rule.
- [HIGH] L573-594: account/profile row list has no click/keyboard/empty-state definitions; per-action enabled/disabled logic missing (L590).
- [HIGH] L4385-4387 vs L4961: MA-057 claims "no remaining design-open questions" while MA-067 later introduces a new unresolved architecture need (CredentialRouteEpoch) — reconcile or scope MA-057's guarantee explicitly.
- [HIGH] L4211-4269: MA-054 native auth token store has field names only, no Rust struct/on-disk format/lock mechanism.
**Worth fixing**: three near-identical but non-identical account-registration/profile schemas never reconciled; credential encryption scheme for "file" store unnamed.

## Prompt_Pipeline.md — NOT READY (1 CRITICAL, several HIGH)
Core assembly algorithm exists only as stage names; second half is entirely PlanUnit YAML with no algorithm content.
**Must fix**
- [HIGH] L79-96: 9 named pipeline stages have no per-stage algorithm/I-O contract.
- [HIGH] L242: `max_compaction_immune_pct` default 30% but "effective context window" is never defined (tokens? which model's window for subagents?).
- [HIGH] L4791-4802 (PP-069): cites "Context_Management.md" and "Skill_System.md" — neither exists; elsewhere the doc correctly uses "Plans/Skills_System.md" (plural) — fix the typo/dangling ref.
- [HIGH] L4099-4178 (PP-060): HistoryAdmissionGate needs quarantine storage location and validation rule set — undefined.
**Worth fixing**: L353 vs L363 — 15% low-context warning vs 5% contingency bucket interaction unreconciled; Gemini cache refresh has no lead-time/failure fallback value.

## OpenCode_Deep_Extraction.md — NOT READY (1 CRITICAL, several HIGH across both halves)
Behaviors are left as "study OpenCode's source file/line" rather than converted to normative PM specs.
**Must fix**
- [CRITICAL] L136-146,266-327: Plan mode, permission resolution, wildcard matching described only as OpenCode file pointers — no PM algorithm/state machine given.
- [HIGH] L3906-3950 vs L3762 (ODE-060/061 vs ODE-058): approval-flow GUI framework named inconsistently as Tauri in one unit and Slint (per Permissions_System.md) in another — material inconsistency, must reconcile.
- [HIGH] L4445-4494 (ODE-072): "maps API surface to Tauri commands OR internal Rust function calls" — unresolved either/or on core IPC mechanism.
- [HIGH] L4102-4150 (ODE-065): plugin-runtime language choice (JS/TS/WASM/subprocess/dylib) left as open options, not decided.
**Worth fixing**: FILE_REGEX (ODE-034) named but literal regex never given; model-priority list transition from hardcoded to "configurable" has no config schema.

## FileManager.md — NOT READY (2 CRITICAL each half)
Core tree actions never get concrete command IDs; §10.7 is dangling; F-067 admits §5-8/13-14 were/are missing.
**Must fix**
- [CRITICAL] L500,169: §11.1 promises canonical `cmd.file.*` IDs but zero (`cmd.file.delete/rename/create/move`) are ever defined anywhere in the doc.
- [CRITICAL] L235,370: "§10.7" (file watcher/LRU eviction) referenced twice; heading doesn't exist (TOC jumps §10.4→§11).
- [CRITICAL] L4227-4265 (F-067): self-admits §5-8 and §13-14 were/are structurally absent/stub; the "recovery" is only a pointer to consume other docs, not actual content.
- [HIGH] Peer-claimed §10.10.5-8 (LSP) reference does NOT exist — confirmed via grep, §10 only has 10.1-10.4. This peer flag stands as-is.
**Worth fixing**: Delete has no confirmation copy/undo/trash policy; disk-space preflight and rollback-on-partial-failure undefined.

## Architecture_Invariants.md — NOT READY (2 CRITICAL first half, several HIGH second half)
Invariants declared but contradicted by an unresolved reconciliation dump embedded in the same doc; GATE-001/003/010 never defined in Plans/ within grep reach.
**Must fix**
- [CRITICAL] L29-68: INV-001's rule is preceded by ~40 lines of raw unedited reconciliation fragments inside the canonical rule body — extract to changelog or delete.
- [CRITICAL] L44,54,57: invariants describe their OWN unresolved gaps (`correlation_id` lacks trace-through, `usage_event_ref` still special-cased) as if canonical — not enforceable as stated.
- [HIGH] L271,275,283 / GATE-003/001/010: cited repeatedly as enforcement authorities with no gate registry/definition doc found anywhere in Plans/*.md via grep.
- [LOW] L4428: "Original hash" is a 66-hex-char string — invalid for SHA-256 (needs 64) — likely copy-paste corruption.
**Worth fixing**: `cost_usd` rounding/truncation mode from microdollars unspecified; AI-026 static-analysis check for "no UI code calling backend directly" names no actual tool/lint.

## Plugins_System.md — NOT READY (3 CRITICAL first half, 1 CRITICAL second half)
No sandbox model, no signature-verification mechanism, manifest omits the capabilities it claims to declare; hook-name family for plugin-blocking never reconciled against canonical hook names.
**Must fix**
- [CRITICAL] L71-96: manifest schema has no `permissions`/`capabilities` field despite §3.1 requiring the approval screen to show "requested capabilities."
- [CRITICAL] whole §2.2/§3: zero sandboxing model for WASM/script/subprocess/dylib entry types (no fs scope, network policy, syscall restriction).
- [CRITICAL] L199-204,1590-1641: "signed verification" mandated with no signing algorithm, trust root, key storage, or failure UX defined.
- [CRITICAL] L3762,3794-3799: `pre_tool_invoke`/`pre_attempt_start`/`pre_node_dispatch` used for plugin-blocking eligibility but never mapped to the canonical hook names (`tool.execute.before` etc.) established in §4 — an engineer cannot implement the gate.
**Worth fixing**: two subsections both numbered "3.2"; catalog/marketplace install-source trust model and specifier grammar entirely undefined.

## Provider_OpenCode.md — NOT READY (several CRITICAL each half)
Core transport/lifecycle spec solid but session-ID format, model-list caching, port conflict, and retry-exhaustion outcomes are underspecified.
**Must fix**
- [CRIT] L142: `pm/state.json` sidecar has no schema, no write/lock/atomicity model.
- [CRIT] L106: default port 4096 has no conflict-resolution rule if occupied.
- [CRIT] L360-362 vs L51/679: PO-048 claims platform_specs.rs retirement is "source-lineage only" per this doc, but neither Models_System.md nor CLI_Bridged_Providers.md corroborates that retirement (zero grep hits) — unilateral claim, not concurred by claimed SSOT owner.
- [HIGH] L2758-2818 (PO-039): retry backoff (1s→2s→4s, max 3) never states the terminal outcome/failure_class after retry exhaustion.
**Worth fixing**: four duplicate identical bullet lines (L84-88) look like a copy-paste artifact; concurrency upper-bound table referenced but not embedded.

## Commands_System.md — NOT READY (several HIGH each half)
Core schema solid but §6 GUI section is missing 6.4/6.5, `arguments` has no sub-schema, reserved git/GitHub prefix rules never enumerated.
**Must fix**
- [HIGH] L238,416: `arguments: array<object>` has no sub-schema and no GUI list-editor field to build it.
- [HIGH] L407-490: §6 jumps 6.6→6.1-6.3→§7 with no 6.4/6.5 — renumber or confirm nothing was dropped.
- [HIGH] L2715,3038,3072 (CS-039/045): "reserved git/GitHub prefix rules" invoked repeatedly as a negative constraint but the actual prefix list never appears anywhere in-doc.
- [MED] L226 vs L240-241: frontmatter example uses `mode:`/`model:` (unprefixed) but field table defines `mode_override`/`model_override` — copying the example produces invalid frontmatter.
**Worth fixing**: two different "## 7" headings in the same document (duplicate H2 numbering); Goal Mode's `/goal`/`/goal again` bolted on with no schema integration.

## Progression_Gates.md — NOT READY (2 CRITICAL first half)
GATE-007/008 never defined despite numbering gap; verifier is required to "block on every gate fail" while 6 of 14 gates are explicitly "not currently enforced by run-gates" — a direct contradiction.
**Must fix**
- [CRITICAL] L212-517: GATE-007 and GATE-008 are never defined anywhere in the doc (registry jumps 001-006, 009-014).
- [CRITICAL] L130-134 vs L256,270,290,375,430,473: "Verifier MUST run gates exactly as written... MUST block progression when any gate fails" directly contradicts 6 of 14 gates being unenforced by the only named verifier command — reconcile.
- [HIGH] L397-403: GATE-012 BLOCKED-state UI (thread badge, dashboard CtA) has no command/IPC name or failure state.
**Worth fixing**: PG-055/PG-056 give conflicting live status for `recovery_options[]`/`allowed_actions[]` vs `allowed_action_ids[]` — add explicit supersession note.

## Project_Output_Artifacts.md — NOT READY (several HIGH/MED each half)
Normative body (1-838) is solid; PlanUnits section is redundant boilerplate; one confirmed dependency on schemas that (per adjudication) DO exist.
**Must fix**
- [HIGH] L2038,3205: "GUI... logical paths" / Runtime_Artifacts_Panel.md referenced for `runtime_artifact_*.schema.json` set — **ADJUDICATED CORRECTION: these 20 files DO exist** (minified, 1 line each) — the original PROJOUT-2 finding claiming they "don't exist" is FALSE; no fix needed here beyond confirming the naming match.
- [MED] L2150,3241,3270: `validation_pass_report` compatibility disposition re-described three different ways (POA-027/029/047) with varying phrasing — consolidate into one normative definition.
- [MED] L3350-3351 (POA-049): `ApprovedPlanPack`/Approved PRD Pack packaging format, storage path, and versioning scheme never given exact values.
**Worth fixing**: repeated near-duplicate "Historical P5 recovery note" paragraphs (4x) — collapse to one; POA-051 has a literal typo "thodse" preserved in tokens.

## Wiring_Matrix.md — NOT READY (several HIGH each half)
The contract for "wired" is strict and well-specified, but its own metrics (7.6% fully-wired rate per JSON-WIRING cross-check) violate the doc's own rules; second half has zero actual wiring rows.
**Must fix**
- [HIGH] L150,210: "typed state selector, disabled-reason projection, effect contract, accessibility contract" required fields are named but never given a schema shape/example.
- [HIGH] L166-169: "44 production wiring required" vs "71 containing cmd.* tokens" vs "0 missing a command" — counts don't reconcile from the text given.
- [HIGH] L1752,1818,1889: every WM PlanUnit (019-041) *names* row categories but the actual wiring rows (producer/consumer/handler per WM-004's own template) are never instantiated.
**Worth fixing**: STEER ANSWER confirmed by this doc's own text — placeholder `.command_applied` events and generic `ui_location` values are contract violations by the doc's own stated rules, not permitted slack (see JSON-WIRING for the quantified violation count).

## Personas.md — NOT READY (several HIGH each half)
GUI persona CRUD has zero backend command/IPC wiring anywhere in the doc.
**Must fix**
- [HIGH] L221-239: 7 GUI CRUD workflows (create/edit/disable/restore/delete/save-as-override/schema-validation) have zero `cmd.persona.*` IDs anywhere — confirmed via grep, none exist in Plans/.
- [HIGH] L2016-2065: `crew.roles` tag-map structure and full tag vocabulary never published as a schema/table.
- [HIGH] L1963-2014: `requested_persona`/`effective_persona`/`persona_selection_source` etc. are field names only — no types, enums, or persistence schema.
**Worth fixing**: name/description char limits (100/500) not enforced live in the editor form per spec, only "on save"; word-count bands (250-500 etc.) have no enforcement mechanism named.

## Decision_Policy.md — NOT READY (several HIGH each half)
Core precedence/logging/redaction rules solid, but §2.1-2.4 is dense unglossaried slash-notation, and PlanUnits assert outcomes with no enforcement mechanism named.
**Must fix**
- [HIGH] L63-151: pervasive "/model/persona/auth/account" slash-shorthand never defined/glossaried anywhere in the doc.
- [HIGH] L91: "tier-level settings may remain... only when reframed as approval-trigger policy" — never names the resulting field/schema.
- [HIGH] L1663-1750 (DP-028/029): Spec Lock update mechanics named but no writer module/enforcement point (pre-commit hook? CI gate?) specified.
**Worth fixing**: doc structurally duplicates itself (prose §0-6 vs ~30 YAML PlanUnits) doubling drift risk; DP-048 "provider adapters check choices.len" asserted as policy with no Result/Option type given.

## Crosswalk.md — NOT READY (1 confirmed broken owner target + hygiene issues)
Dense owner-routing prose is largely internally consistent, but one confirmed broken cross-doc target.
**Must fix**
- [HIGH] L136-155: claims `Plans/interview-subagent-integration.md` owns `max_subagents_spawn` — **confirmed via grep, this string appears NOWHERE in that file** — genuinely broken owner pointer, not just unverified (corroborated independently by BUNDLE-9's audit of interview-subagent-integration.md itself).
- [MED] L278,285,326-328: doc self-reports duplicated section numbering for 3.13 (3.13A/3.13B) but never fixes it.
- [MED] L234: `Primitive:Seglog`/`Primitive:EvidenceBundle`/`Primitive:CapabilityGating` flagged by the doc's own text as missing from the §2.1 primitive index — confirmed absent.
**Worth fixing**: C-029/C-038 both restate the same "scheduler truth split" negative constraint near-verbatim — fold into one owning unit.

## Goal_Runtime_System.md — NOT READY (1 CRITICAL, several HIGH across PAIR-1 and PAIR-11)
Durable state/event-log contracts named but not schematized for 16 of 21 events; budget fields and write-authority enums conflict with a sibling unit.
**Must fix**
- [CRITICAL] L419 + Contracts_V0.md CV-287 cross-check: 21 goal/goal_run event names are canonical, but CV-287 only defines event-specific payload fields for 5 of them — 16 named events (`goal.scheduled`, `goal.progressed`, `goal.completed`, all 6 `goal_run.*` events, etc.) have zero payload schema anywhere.
- [HIGH] L1064-1076 (GRS-015): budget fields (max_turns, max_tokens, max_wall_time_seconds, max_parallel_agents) have no default values or units anywhere.
- [HIGH] L1766 vs L1854 (GRS-026): two non-identical write-authority/write_mode enums for what appears to be the same concept (`direct_write_single_owner` vs `leased_writer` families) — reconcile.
- [HIGH] L2221-2224 (GRS-031): ~750-word single-paragraph canonical_text covers 8 distinct subsystems at once; several referenced types (WorkNodeRequests, AuditCycle, CertificationReceipt) are named but never defined anywhere.
**Worth fixing**: GRS-033 through GRS-039 (6 units) introduce new primitives (AgentProgressHeartbeat, LoopBreakerRegistry, etc.) as accepted requirements with zero schema; GRS-040's title is literally "GRS-040 - GRS-040" (placeholder).

## human-in-the-loop.md — NOT READY (1 CRITICAL, several HIGH across PAIR-1 and PAIR-2)
Canonical HITL request contract is prose-only; PAUSE.md coexistence and precedence never resolved in this doc.
**Must fix**
- [CRITICAL] L1591/253: PAUSE.md global pause gate referenced as coexisting with HITL but its file format, watcher, and precedence-if-both-active rule are not defined anywhere in this doc (deferred to orchestrator-subagent-integration.md, unverified).
- [CRITICAL] L4-16,37-91: "Provider-native correlation" and "Canonical HITL request contract" headings are either empty or list fields with no types/wire format/enum enumeration.
- [HIGH] L1449/1493: Skip/Cancel Run map to `skip_node`/`abort_run` with no `cmd.*` IPC names, unlike Approve/Decline which do get `cmd.runtime.approve/decline`.
- [HIGH] L296-343: `approval_wait`/`long_governance_wait` have no numeric timeout/expiry-mapping values.
**Worth fixing**: heavy "/slash" shorthand throughout (e.g. `/package/seam/remediation`) never expanded to real field names.

## MCP_Integration.md — NOT READY (several CRITICAL across PAIR-2 and PAIR-3)
Schema resolution algorithm, retry/eviction values, and record schemas are all asserted without concrete detail.
**Must fix**
- [CRITICAL] L87-91: schema resolution ("max depth 32, 64 KiB cap") has no algorithm/pseudocode — an engineer must invent the resolver.
- [CRITICAL] L108-116: `mcp_server_record`/`mcp_runtime_availability`/`mcp_tool_record` have no types, no persistence format, no versioning story.
- [HIGH] L1998-2515 (MI-032..038, Ledger Compile Addendum): 7 units for config-import trust, catalog cache, lifecycle liveness are explicitly "pm_gap_or_delta"/acknowledged backlog, not implementable spec — timeout, heartbeat, and cache-eviction values are all missing.
- [HIGH] L2383-2446 (MI-037): "runtime call timeout, heartbeat, interrupt" required but zero concrete ms/s values.
**Worth fixing**: MI-028 GUI actions (Install/Configure/Repair/Reconnect/Disable/Remove) have labels only, no `cmd.mcp.*` IDs or confirmation/error states.

## assistant-memory-subsystem.md — NOT READY (several HIGH across PAIR-3 and PAIR-4)
Retrieval/verification well-specified overall, but activation-scoring formula and hash function are unnamed; MiscPlan's Skills_System.md non-existence claim is refuted here too.
**Must fix**
- [HIGH] L1417-1425/L333-343: activation scoring lists 5 components (pinned boost, recency decay, BM25+ANN blend, etc.) but only 2 numeric constants exist (0.5/0.5 blend, 0.5 Done multiplier) — no combining formula across all 5.
- [HIGH] L204-207: `embed_text`/`text_hash` use an unspecified `hash()` function — no algorithm named (SHA-256? xxhash?).
- [MED] L2350-2507 (AMS-042/043): MemoryTierContract proposed as future work but referenced as if it already exists — flag as non-blocking for v1 or implement now.
**Worth fixing**: **CONFIRMED (adjudicated as correct, not a false alarm this direction): MiscPlan.md's "Skills_System.md doesn't exist" claim IS a false alarm** — file exists, 2482 lines, actively cross-referenced by MiscPlan.md itself in 15+ places.

## Skills_System.md — NOT READY (several HIGH across PAIR-4 and PAIR-5)
Vocab/states well-specified but no numeric defaults for timeout/walk-up bound, and the "ask" permission-UI flow is confirmed absent.
**Must fix**
- [HIGH] whole file (confirmed via grep): no "ask" permission-UI mechanism anywhere — permission enforcement is allow/deny only; a skill needing an ungranted permission has a "Needs permission" badge but no defined interactive consent flow at invocation time.
- [HIGH] L161: skill invocation `timeout` field has no default value, unit, or expiry behavior.
- [HIGH] L307-315: remediation buttons ("Set up Context7", "Review permissions", "Edit skill", "Review tool setup") have no backend command/IPC IDs bound to them.
- [MED] L1982-2041 (SS-028): import flow has no max package size, no zip-slip/path-traversal guard, no name-collision resolution UX — security-relevant gap.
**Worth fixing**: `source_type` runtime envelope field vs GUI "source vocabulary" badge enum may or may not be the same enum — clarify.

## agent-rules-context.md — NOT READY (several HIGH across PAIR-5 and PAIR-6)
`get_agent_rules_context` signature explicitly marked EXAMPLE only; rules editor has no command IDs; budget thresholds given only as ranges.
**Must fix**
- [HIGH] L79-84: function signature is explicitly "EXAMPLE only" with no locked error-handling contract.
- [HIGH] L108-110: rules editor "Expose in GUI (e.g. Settings...)" has no exact panel path, command ID, or save/dirty-state visual spec.
- [MED] L1906-1910 (ARC-028): AGENTS.md lint budget given as a range ("6-10KB") rather than one canonical default — pick one.
- [MED] L1927-1929 (ARC-029): "can block runs in strict mode" but no default mode or setting-key/control-surface stated.
**Worth fixing**: ARC-020 says "5-10 line hard cap" but ARC-031 acceptance criteria drops the lower bound to "10-line cap" — align wording.

## Orchestrator_Page.md — NOT READY (1 CRITICAL, several HIGH across PAIR-6 and PAIR-7)
Seven-tab shell has good scope prose but zero pixel/component-level structure; safe-point retry UI and Node Graph detail panel have zero wiring in this doc.
**Must fix**
- [CRITICAL] L1497/1577/1670 (OP-020): fixes "seven canonical tabs" but its own preserved_exact_tokens includes stray "six-tab behavior" string with no reconciling compatibility-alias note (unlike other tier-label aliases elsewhere in the same doc).
- [HIGH] safe-point retry UI: "safe points" appears only as a token; no retry button, command ID, or confirmation flow anywhere in range — an implementer has zero mechanism.
- [HIGH] Node Graph/DAG view: named as one of seven tabs but no node-detail-panel content, click/select wiring, or command IDs in this doc (deferred to Run_Graph_View.md, which per BUNDLE-8 also does NOT close this gap).
- [HIGH] L46-56: Plan Compile launch repair paragraph has no timeout/expiry rule if `PlanApproved` publication never arrives.
**Worth fixing**: OP-002's acceptance_criteria are unfalsifiable restatements of scope rather than testable assertions; every PlanUnit's validation_surfaces are limited to generic migration-index validators, none functional.

## Provider_Stream_Mapping_External_Reference_A2A.md — NOT READY (1 CRITICAL across PAIR-7 and PAIR-8)
Self-admits its own schema cannot represent a field its own addenda require.
**Must fix**
- [CRITICAL] L370: doc explicitly admits none of the reserved diagnostic category schemas expose `attempt_id`, even though its own 2026-03-09 addenda mandate attempt_id continuity — a normative MUST NOT with no schema field to enforce against, in the same document.
- [HIGH] L362-379: "P5 provider-stream continuity recovery requirements" section reads as raw unintegrated audit prose ("the doc internally contradicts itself") rather than resolved spec.
- [HIGH] L362: `approval_scope_key` composition algorithm/format never given despite being needed across permissions/HITL/doom-loop caching.
**Worth fixing**: `provider_attempt_ref?` trailing-`?` field never given a type or owning schema; PSMERA-025 tagged `gui_related: true` with zero actual UI content (metadata over-tagging, not a real gap).

## GitHub_Integration.md — NOT READY (1 CRITICAL across PAIR-8 and PAIR-9)
GitHub Actions freshness mechanism (webhook vs. poll) is entirely absent from the file — zero occurrences of either term.
**Must fix**
- [CRITICAL] L1015-1073,126-128: confirmed via grep — zero occurrences of "webhook" or "poll" anywhere in the file; Actions readiness/staleness states are named but the actual observation transport and interval are never specified anywhere, including GI-012 ("Actions Readiness Refresh," title only).
- [HIGH] L84-227: no field-level schema for `compare_origin`, `graph_patch_request/result`, or pinned-workflow record — every payload named, never typed.
- [HIGH] L1022,1046-1063: 13-14 `actions_*` blocked-reason codes listed as bare tokens with no severity/retry-eligibility/user-message table.
- [HIGH] L1126-1177: worktree topology view and `cmd.git.worktree.*` commands named with zero trigger/confirmation/state detail.
**Worth fixing**: two different "Original hash" values across sequential Migration Coverage blocks with no date/commit label distinguishing them.

## DRY_Rules.md — NOT READY (1 CRITICAL across PAIR-9 and PAIR-10)
Governance rules restated well but the actual enforcement gate for requirement-traceability claims is confirmed NOT wired.
**Must fix**
- [CRITICAL] DR-034/DR-035 depend on GATE-011/012/013 for requirement-coverage enforcement, but Progression_Gates.md L148 explicitly states these gates are "not yet enforced by run-gates" — "dedup governance" for coverage claims is aspirational, not mechanically gated today; this gap should be stated in DRY_Rules.md itself, not just discoverable by cross-reference.
- [HIGH] L1641-1687 (DR-030/§7.1): the most mechanically concrete rule in the doc (6-step text-normalization algorithm) has no reference implementation/script path cited.
- [MED] DR-016 vs DR-004: two different precedence orderings exist (audit-check order vs. SSOT-conflict order) without stating whether they're the same list.
**Worth fixing**: every PlanUnit repeats ~35 lines of near-identical boilerplate, ironic for a doc about eliminating duplication.

## Glossary.md — NOT READY (several MED/HIGH across PAIR-10 and PAIR-11)
Primitive definitions (DRYRules, PatchPipeline, SessionStore etc.) are well cross-referenced, but one term is confirmed dangling and two freshness vocabularies coexist unreconciled.
**Must fix**
- [HIGH] L1391-1406 (G-022): "InstantGrep" cited as owned by Tools.md — **confirmed via grep, zero occurrences of "InstantGrep" in Tools.md** — the promoted user-facing name is undefined in its stated owner doc.
- [MED] L157-161 vs L145-149: two different freshness/health enum pairs (`current|refreshing|stale`/`healthy|degraded|unavailable` vs `fresh|warm|stale|expired`/`healthy|degraded|blocked|unknown`) coexist without a stated mapping or axis distinction.
- [MED] L1631-2010 (G-026): 150+-item negative_constraints/token list for Teach/Teacher help content with no concrete Help-entry schema shown.
**Worth fixing**: L103-111 legacy flat bolded-term definitions sit un-migrated inside a section whose own header mandates the newer help-entry record shape.

## GUI_Rebuild_Requirements_Checklist.md — NOT READY (CRITICAL)
**Must fix**
- [CRITICAL] all checklist rows are `- [ ]` (unchecked) — the "single auditable summary" has never actually been verified PASS; completion is structurally unreachable as currently written (doc's own completion criteria require all-PASS).
- [HIGH] rows are prose assertions, not automatable test cases — no test IDs/scripts beyond 2 named validators.
**Worth fixing**: doc title dated 2026-02-23 but content amended through 2026-06-30 — stale title.

## Runtime_Artifacts_Panel.md — NOT READY (CRITICAL, paired with GRRC above)
**Must fix**
- [CRITICAL] L114-160: first-person "gap analysis" prose embedded as live body text directly contradicts §7 (L296-298)'s claim that the envelope "pins attempt_id" — remove stale self-contradicting commentary or fence as historical.
- [HIGH] L292,589-593: **ADJUDICATED — the 19+1 `runtime_artifact_*.schema.json` files DO exist** (confirmed elsewhere in this audit); this doc's own "not current live doc targets until those files exist" framing is now stale and should be updated to reflect they've materialized.
- [HIGH] numbering gap: RAP-028 never defined anywhere in the file (RAP-027 and RAP-029 exist, 028 is missing) — confirm retired/renumbered or restore.
**Worth fixing**: literal typo "all of thodse" preserved in RAP-034 tokens; §2 and §5 parent headings confirmed missing per the doc's own RAP-025.

## BinaryLocator_Spec.md — NOT READY (HIGH, paired with ATS below)
**Must fix**
- [HIGH] L282-296: cache file format/path/serialization and `workspace_fingerprint` algorithm undefined; unclear which of the locked redb/seglog stack backs it.
- [HIGH] L247-249: 5s subprocess timeout has no cleanup spec (SIGTERM vs SIGKILL, zombie handling, Windows process-tree kill).
- [HIGH] L188-198: Cursor versions-dir "lexicographically greatest" selection has no filter/tie-break for non-version junk directories.
**Worth fixing**: no `Scanning...`/in-progress UI state defined for the binary-check action.

## Automated_Testing_System.md — NOT READY (2 CRITICAL)
**Must fix**
- [CRITICAL] whole doc: every ATS PlanUnit is prose pointing at generic validators — no concrete IPC schema, adapter interface, or `TestRunReceipt` file format anywhere.
- [CRITICAL] whole doc: zero GUI wiring despite steer explicitly asking for GUI result surfacing — no command IDs, panel layout, or button states for watching/viewing test results.
- [HIGH] §6 (L279-281): entire document is gated behind an undefined future "runtime_disabled → enabled" event with no trigger criteria.
**Worth fixing**: ATS-004 vs ATS-019 both claim to be "the primary" web-testing path for overlapping scenarios without reconciling precedence.

## Document_Packaging_Policy.md — NOT READY (HIGH, paired with feature-list below)
**Must fix**
- [HIGH] L90-114: §2.0a-2.0b documents 5+ unresolved SSOT naming contradictions (`chat.thread.created` vs `chat.thread_created`, etc.) as *permanent policy* rather than pointing to a resolution owner/date — an implementer cannot know which shape to emit.
- [HIGH] L211: "the run MUST fail" has no defined exit code, error format, or partial-write rollback spec.
**Worth fixing**: DPP-009/011/012 self-tag `gui_related: true` for pure packaging/routing prose with zero actual screens — correct the tagging or clarify it's metadata-only.

## feature-list.md — NOT READY (HIGH; reference index by design)
**Must fix**
- [HIGH] whole doc: declared a "reference inventory" (FL-002) — ~40% of capability bullets describe behavior with zero mechanism, deferring entirely to owner docs; readiness rests on those docs, not this one.
- [HIGH] `tier_id`/`tier_runtime_record`/`/phase/iteration` labeled "compatibility history" with no stated cutover date or removal mechanism.
**Worth fixing**: confirmed — `LspGateVerifier`/`LF-006`/`LF-007` (cited in some peer steer) have zero occurrences anywhere under Plans/ via grep; likely a mislabeled reference belonging to a different doc entirely.

## Planning_Wizard.md — NOT READY (2 CRITICAL, paired with Decision_Log/Bootstrap below)
**Must fix**
- [CRITICAL] whole doc: every PWIZ unit is prose-only YAML — no data schema for PlanningRun, topic map, Planning Context Capsule, or ledger record shape anywhere.
- [CRITICAL] L1075-1139 (PWIZ-013): topic card states (11 named) have no transition table, trigger events, or command/IPC names.
- [HIGH] L803-869 vs L710-800 (PWIZ-014 vs PWIZ-010): both fully restate the same CAS/idempotency mechanism near-verbatim — should cross-reference, not duplicate.
**Worth fixing**: clean-room fixture suite referenced (L1157) but not defined/located anywhere.

## Decision_Log.md — NOT READY (CRITICAL)
**Must fix**
- [CRITICAL] whole doc: steer asks about "decision record schema/GUI" — no such schema or GUI exists anywhere in the file; every DL unit is a prose decision statement with governance metadata only.
- [HIGH] "Each entry is timestamped and final" (L7) is contradicted by 5 PlanUnits (DL-021/023/024/025/026) all flagging `split_recommended: true` with no split ever executed.
**Worth fixing**: prose Entries section (DL-001..019) duplicates content already re-expressed as PlanUnits — confirm intentional legacy/compat framing.

## Bootstrap_Planning_Migration.md — NOT READY (HIGH)
**Must fix**
- [HIGH] whole doc vs Planning_Wizard.md's later ledger addenda: describes an AGENTS.md/Codex-thread workflow that appears superseded by more detailed, differently-worded later addenda — not marked stale/retired.
- [MED] L13-14: hard-codes a named individual ("Jared") as sole ledger-compile authorizer with no role/fallback generalization.
**Worth fixing**: validation script name drift (`validate-bootstrap-ledgers` vs `pm-bootstrap-ledger-validate.py` used elsewhere) — confirm which is current.

## CLI_Bridged_Providers.md — NOT READY (3 CRITICAL, paired with Plan_To_Node_Compilation below)
**Must fix**
- [CRITICAL] L45-67: BRIDGE_INVOKE_OPTIONS record has no actual CLI invocation syntax (flag names, argv/env/stdin encoding) specified.
- [CRITICAL] whole doc: no process exit-code handling specified anywhere — no mapping of exit codes to normalized events, no zombie/orphan reap policy.
- [CRITICAL] L154-158,188: incremental JSON/JSONL parser has no buffer-cap, backpressure, or partial-UTF-8 handling spec.
**Worth fixing**: CBP-024's "BridgeHandshakeReceipt" is a proposal/intent statement, not a schema — no field types or sequence diagram.

## Plan_To_Node_Compilation.md — NOT READY (1 CRITICAL)
**Must fix**
- [CRITICAL] whole doc: NodeSeed schema described only as a field-name list, repeated 3+ times (PNC-012/013/016) with slightly different, non-reconciled field sets each time — no single authoritative schema.
- [HIGH] PNC-004 (L310) vs PNC-021 (L162): two different blocking-condition vocabularies (`blocked_runtime_certification_incomplete` vs `hard_disabled`) for the apparently same gate.
- [HIGH] PNC-010 (L582-583): `route_kind` enum values for `compile_wave_retry_route` never listed.
**Worth fixing**: zero worked examples anywhere across both 1425-line docs for a stage_card instance.

## newfeatures.md — NOT READY (CRITICAL, paired with OCM/PRD_Builder below)
**Must fix**
- [CRITICAL] whole doc: pure PlanUnit YAML with no data models/algorithms/GUI wiring — mislabeled "Implementation Plan" in its own H1 despite every unit having `create_worknodes: false`.
- [HIGH] N-006: names required feature families (corroboration/promotion/graph-patch, trust state) with zero schema or state machine.
**Worth fixing**: L16 vs N-004 canonical_text — "provider" vs "route" used inconsistently for the same Antigravity CLI concept.

## OpenCode_Coverage_Matrix.md — NOT READY (HIGH; self-referential audit)
**Must fix**
- [HIGH] §3.2/§5.2: five SSOT docs listed as "missing stable anchors" with the gap repeated in two later PlanUnits (OCM-009/013) without resolution.
- [HIGH] §5.4 item 11: `disabled_plugins` field present in Plugins_System.md §7.3 but absent from Personas.md §3.2 — acknowledged live inconsistency, no resolution owner named.
**Worth fixing**: summary tally (Covered 36/Partial 2/Missing 0 = 38) doesn't visibly reconcile against the 42 numbered matrix rows without manual recount.

## PRD_Builder.md — NOT READY (CRITICAL)
**Must fix**
- [CRITICAL] PRDB-007 (L508-572): conflict-resolution priority order has no tie-break algorithm, no conflict-record schema, no UI mechanism for user resolution.
- [HIGH] PRDB-005 (L293-362): quality-report tri-state gate (Ready/Ready-with-Warnings/Blocked) has no defined scoring rule or threshold anywhere.
- [HIGH] PRDB-008 (L445-505): ~10 resource-limit fields named with no default values; actual values deferred to a JSON file without citing which fields/values live there.
**Worth fixing**: `cmd.prd_builder.approve_for_planning_wizard` disable conditions named but no success/failure toast copy or loading state.

## Plan_Document_System.md — NOT READY (HIGH, paired with Planning_Ledger_System/rewrite-tie-in-memo below)
**Must fix**
- [HIGH] whole doc: never states whether `Plans/.plan_index/*` artifacts are consumed by the shipped Rust/Slint app at runtime, or are purely authoring-time tooling discarded before build — the single biggest ambiguity in this bundle.
- [HIGH] L299-337 (PDS-007): the one unambiguously runtime-facing setting ("use different model for GUI elements?") has no UI location, default, or model list — hedges with "such as."
**Worth fixing**: PDS-018 heading is literally "PDS-018 - PDS-018" (placeholder, matches the pattern seen in other docs).

## Planning_Ledger_System.md — NOT READY (1 CRITICAL)
**Must fix**
- [CRITICAL] L899-955 (PLS-015 Native Ledger Service): explicitly "the finished-product runtime owner" yet specified only as a list of abstract API verb names — no payload shapes, no storage-engine binding, no cross-reference proving it's the same system as storage-plan.md's seglog/redb model (two competing storage descriptions never reconciled).
- [HIGH] L17-22 vs L899-906: doc never resolves whether this is a network service, in-process API, or storage layer ("service/API or storage-backed" left as an open either/or).
**Worth fixing**: same authoring-vs-runtime ambiguity as Plan_Document_System.md — is Plans/ledgers/v2/ format read by the shipped app or planning-time-only?

## rewrite-tie-in-memo.md — NOT READY (HIGH)
**Must fix**
- [HIGH] title claims "(Active)" and "No open questions" but the entire body is a routing memo where nearly every RTIM unit defers to an "owner doc" — this is derivative-of-a-migration canon, not fresh spec (RTIM-001 was already retired into 38 successor units).
- [MED] L38 vs L108: memo asserts seglog/redb/Tantivy storage architecture while Planning_Ledger_System.md's PLS-015 never mentions any of these three for its own persistence — no ContractRef ties them together.
**Worth fixing**: "~1GB" browser budget and `wef` crate treated as both "candidate, not decided" and locked MUST-governance in adjacent sentences.

## Run_Modes.md — NOT READY (CRITICAL, paired with Formatters/Run_Graph_View below)
**Must fix**
- [CRITICAL] L176-177: doc explicitly lists itself as having unresolved "P5 run-mode governance recovery requirements" (Contribute/PR vs DAE isolation conflict, yolo step-1 vs step-7 guard ambiguity, mid-run account-switch invalidation) — all self-flagged "not resolved," left in the SSOT as prose rather than tracked with owners/dates.
- [HIGH] L177: doc admits "yolo is still overstated as approval-free even though non-bypassable step-7 guards remain in force" — self-admitted inconsistency in its own mode description.
**Worth fixing**: no anchor anywhere in this doc for the actual Mode-switcher widget (dropdown/button/shortcut) — OpenRef with no target given.

## Formatters_System.md — NOT READY (HIGH; closest to READY in this bundle)
**Must fix**
- [HIGH] L57: "invoked sequentially in registration order" — "registration order" itself is never defined (config order? alphabetical? built-in-then-custom?).
- [MED] L108-128: no tie-break/precedence when multiple built-in formatters (prettier vs biome) both claim the same file extension.
**Worth fixing**: no formatter-subprocess timeout/hang-behavior spec, separate from the run's overall `task_timeout_ms`. Only minor gaps — no CRITICAL findings in this doc.

## Run_Graph_View.md — NOT READY (1 CRITICAL)
**Must fix**
- [CRITICAL] whole doc: core DAG interactions (pan, zoom, drag, minimap click, right-click, keyboard nav, multi-select) are narrative "should" statements only — zero command IDs or enabled/disabled logic anywhere; confirms Orchestrator_Page.md does not close this gap either (checked both docs).
- [HIGH] L47,602: replacement commands for stale `cmd.graph.approve_hitl`/`deny_hitl` are named only as a `cmd.runtime.*` wildcard with no concrete list.
- [MED] L74-76 vs RGV-011: an early "no historical-run mode contract yet" gap-admission was left in the doc even though RGV-011 (later in the same file) appears to resolve it — stale self-contradiction.
**Worth fixing**: "Recommended concern envelope" (~25 fields) never promoted to a mandatory schema despite being consumed by RGV-008's acceptance criteria.

## interview-subagent-integration.md — NOT READY (CRITICAL, paired with Widget_System/chain-wizard below)
**Must fix**
- [CRITICAL] whole doc: every requirement is YAML metadata (owner/tokens/acceptance criteria referencing other units) rather than an implementable spec — no request/response payload examples, no error codes, no retry values anywhere.
- [HIGH] confirmed via grep: `max_subagents_spawn` never appears anywhere in this document, corroborating Crosswalk.md's broken-pointer finding independently from the other side.
- [HIGH] confirmed via grep: `scope_probe`/`max_questions` also never appear anywhere in this file — the interview question-count limit is entirely unresolved here too.
**Worth fixing**: "/rules" mechanism for Contract Unification conflict-resolution referenced but never defined (no syntax, no priority ordering, no example).

## Widget_System.md — NOT READY (HIGH)
**Must fix**
- [HIGH] confirmed via grep: `widget-custom-metrics` does not appear anywhere in this file, despite the doc claiming to be the cross-cutting hostability owner for Dashboard/Usage widgets where such a widget would need classification.
- [HIGH] L100-116: internal section numbering (§1/§2/§3/§4) doesn't match external "§7" cross-references from other docs (e.g. usage-feature.md) — this file has no §7 at all.
- [HIGH] L102-115: the "full 13-widget Progress catalog" names 13 IDs but never instantiates a full example widget-shell JSON payload for any of them, despite claiming a typed data contract exists.
**Worth fixing**: an anchor tag (`ws-progress-only-widget-hostability`) sits physically in §2 while the heading it names lives in §4 — split placement.

## chain-wizard.md — INFO (retired, non-actionable by design; internally consistent)
No findings above LOW. Doc explicitly retires itself (L3-7, all CW-* units `status: retired`), correctly matches chain-wizard-flexibility's characterization of it as a stale name, and correctly flags its own shared route-object model as under-specified elsewhere rather than claiming false completeness. Not gradeable against "implementation-ready" since no implementation should target this file directly.

## GitHub_API_Auth_and_Flows.md — NOT READY (3 CRITICAL, paired with UI_Wiring_Rules/Release_Supply_Chain below)
**Must fix**
- [CRITICAL] L16: "Default auth flow: OAuth device-code" has zero device-code flow steps (poll interval, expiry, error codes like `authorization_pending`) anywhere in the doc.
- [CRITICAL] L54,140,173: no OAuth scope list (`repo`, `workflow`, `read:org` etc.) is ever enumerated for any operation.
- [CRITICAL] L17,140,172: "secrets live only in OS credential store" names no concrete crate/API (Keychain/Credential Manager/keyring) or key-naming scheme.
**Worth fixing**: four consecutive identical bullet lines look like a copy-paste artifact (same pattern found in Provider_OpenCode.md).

## UI_Wiring_Rules.md — NOT READY (1 CRITICAL; strongest of the bundle's three docs)
**Must fix**
- [CRITICAL] whole doc: this is meta-rules for the Wiring Matrix (schema/keys/gate names) but contains zero actual wiring rows itself — real content lives in Wiring_Matrix.md/.production.json, which per JSON-WIRING is only 7.6% fully wired.
- [HIGH] L534: `handler_location` example cites a Rust module path but no canonical crate root is fixed, and no fallback is defined for the current pre-implementation (no source tree) state.
**Worth fixing**: the RULES themselves (schema validation, coverage check, dead-command detection) are mechanically precise and scriptable — enforceability is conditional on artifacts outside this doc that are only partially populated (confirmed by JSON-WIRING).

## Release_Supply_Chain.md — NOT READY (2 CRITICAL)
**Must fix**
- [CRITICAL] whole doc: every PlanUnit (RSC-001..007) is `compile_disposition: create_new_planunit` — a backlog-intake ledger compile, not a build/sign/update pipeline spec; no signing tool, SBOM format, or update mechanism named anywhere.
- [CRITICAL] L565: "Concrete schema materialization is not_applicable during this ledger-to-Plans compile" — self-certifies as pre-implementation-ready; all data shapes explicitly deferred.
- [MED] L8 vs L573: Scope says doc "does not own... GUI presentation," yet 4 of 7 PlanUnits are marked `gui_related: true` with GUI acceptance criteria — boundary asserted then immediately violated by its own units.
**Worth fixing**: build/sign/update pipeline is a prioritized (P0/P1/P2) gap list awaiting a future phase, not a spec an engineer could build against today.

---

## JSON artifacts — NOT READY overall (1 file READY, 3 NOT READY)

### Wiring_Matrix.production.json (+exclusions +schema) — NOT READY
Schema and structural integrity are excellent (0 jsonschema violations across all 459 entries, no duplicate keys, no TBD/placeholder values), but the wiring CONTENT fails the doc's own bar for "fully wired":
- **[CRITICAL]** 179/459 (39.0%) entries have `ui_location = "Cataloged GUI surface"` — a single generic literal string with no real panel/screen path; none of these 179 duplicate a real-location row for the same command — they are catalog-only orphans.
- **[CRITICAL]** 323/459 (70.4%) entries declare `expected_event_types: []` (no emitted event) even for clearly state-mutating actions (deleting a container, aborting a run).
- **[CRITICAL]** Of the 136 entries that DO declare an event, 99 (72.8% of those) use one of six generic catch-all placeholder strings (`source_control.command_applied`, `runtime.command_applied`, etc.) that appear NOWHERE else in the Plans/ corpus and are not defined in Contracts_V0.md's event catalog — fabricated placeholders, not real domain events.
- **[HIGH]** Net effect: only 35/459 (7.6%) entries have BOTH a real location AND a real event — this is the load-bearing "is everything wired" number, and the answer is no.
- **[HIGH]** `evidence_required` field: 100% of entries use identical boilerplate self-declaring "this row is not implementation proof" — directly undercuts any claim the JSON demonstrates verified wiring.

### PMConcept_Control_Reconciliation.json — READY
Internally consistent, sha256-fresh vs. source HTML (hash matches live), sample-verified against 7 owner docs. Only LOW findings: `slint_msrv: 1.92` has no corroborating source anywhere in FinalGUISpec.md (unlike sibling `rust_stable`/`slint_stable`, both verified) — worth a sanity check since 1.92 is unusually high for an "MSRV" on a 1.96.1-stable project; and one anchor slug (`#plan-compile-tab`) doesn't literally match a heading (content exists nearby under a differently-worded subsection).

### JSON Schemas (44 files) + data instances — NOT READY
Mechanically sound (100% parse, 0 broken $refs, 0 duplicate keys, all 8 checked instance files validate against their paired schema), but real cross-file drift exists:
- **[CRITICAL]** `requirements_quality_report.schema.json` declares `$schema: draft-07` while all 43 other schema files declare 2020-12 — a one-line fix.
- **[HIGH]** `plan_graph.schema.json`'s `change_budget` property is a bare unconstrained `{"type":"object"}` even though a fully-typed `change_budget.schema.json` exists standalone AND `project_plan_node.schema.json` (a likely-duplicate schema for the same node concept) correctly inlines the full shape — genuine drift between two schemas for the same entity.
- **[HIGH]** `non_executable_closure_evidence.schema.json`: 7 fields are `required` AND bare unconstrained objects with zero documented internal shape (`event_payload_contract_registry`, `gui_wiring_contract`, etc.).
- **[MED]** 3 incompatible `$id` naming conventions coexist with no documented rule for which file uses which; `path_reference_registry.schema.json` has no `$id` at all; `Wiring_Matrix.schema.json` is the only `.v0`-suffixed `$id` in the set (all siblings are `.v1`).
- **[LOW]** `zero_incomplete_disposition.json` self-declares `schema_id: pm.zero_incomplete_disposition.v1` but no schema file with that `$id` exists among the 44 checked — the one data file in this chunk without a resolvable schema.
- Adjudicated note: task-prompt said "21 minified runtime_artifact schemas" — actual count is 20 (19 artifact types + 1 envelope), all confirmed to exist and be minified to 1 line each — not a repo defect, just a prompt miscount.

### Spec_Lock.json, auto_decisions.jsonl, plan_graph.json, zero_incomplete_disposition.json, storage_value_registry.json, path_reference_registry.json — NOT READY
- **[CRITICAL]** Spec_Lock.json `locked_decisions.ui.toolkit_version: "1.15.1"` directly contradicts the canonical owner doc FinalGUISpec.md, which states `Slint 1.17.0` in 12+ places and contains zero occurrences of "1.15.1" — no auto_decisions.jsonl entry documents or justifies this specific divergence. This is the single most load-bearing SSOT contradiction found in the JSON layer.
- **[HIGH]** auto_decisions.jsonl: 19 distinct `decision_id` values are reused across 2-8 lines each (verified mechanically) — the natural primary key is not unique, making ID-based lookup ambiguous; schema requires `minLength: 3` but never uniqueness.
- **[MED]** 16 of 188 auto_decisions.jsonl entries use non-RFC3339 timestamp formats inconsistent with the other 172 — breaks chronological sortability.
- All other structural checks passed clean: Spec_Lock's 67 pinned file hashes all verified live-matching; plan_graph.json is acyclic with 0 dangling refs; storage_value_registry.json's 28 families have 0 duplicate IDs and its 11 materialized = 11 critical_family_ids exactly; path_reference_registry.json's job (cataloging broken/stale refs) is confirmed working as designed.

---

# PART 6 — Audit verification transcript (anti-hallucination pass)

# VERIFY — Anti-Hallucination Pass

Method: every claim re-checked against the live files under `Plans/` (Read + grep + python3 recounts). Repo untouched (read-only). Verdicts: TRUE = claim confirmed at cited location; PARTIAL = phenomenon real but a detail (count/line/pairing) is off; FALSE = not reproducible.

## Task 1 — Headline claims (15)

### 1. orchestrator-subagent-integration.md file-canon vs projection-canon conflict — TRUE (with line-ref caveats)
- OSI-271 (block L22469-22511; canonical_text L22476-22478): "File-based coordination is always on for orchestrator-managed runs... without replacing file-based coordination state as the source of truth." Preserved tokens L22506-22509: `File-based coordination (canonical)`, `Always on`, `single source of coordination truth`. CONFIRMED.
- OSI-270 (L22413-22467; canonical_text L22420-22423): "All platforms use the canonical coordination projection, optional active-agents.json debug mirror..."; L22460 "Debug mirror is not the source of truth." CONFIRMED (says "canonical coordination projection"; seglog/redb named by OSI-225, not OSI-270).
- OSI-225 is at **L19960-20014**, not ~L3149: "projected from seglog/redb; ... active-agents.json is not canon" (L19968-19970, token `seglog/redb` L20006). L3149-3150 is the matching prose rule: "child visibility, conflict prevention, and status rollups come from seglog/redb projections."
- Ad hoc `.puppet-master/state/*.json` persistence: L1779 ("Save verification results to `.puppet-master/state/verification-{node_id}-end.json`") and L2367 ("Save validation results to `.puppet-master/state/handoff-validation-{node_id}.json`") CONFIRMED. **Caveat:** L1448 is the *opposing* line ("Verification results are persisted as seglog/redb events and projections... not as authoritative ad hoc JSON files") — it is the canonical side of the contradiction, not an ad hoc instance. The L1448-vs-L1779 pair is itself a direct intra-doc contradiction.
- Verdict: TRUE — contradiction real and multi-sited; fix line refs in final report (OSI-225 → L19960; L1448 → canonical-side quote).

### 2. FileSafe.md fail-closed prose vs fail-open code; prefix vs exact allowlist — TRUE
- Fail-closed prose in range: L230 "if no trustworthy baseline exists, fail closed"; L297 "If no trustworthy baseline exists: return initialization error (fail closed)".
- Fail-open code L690-708: `BashGuard::new(pattern_file).unwrap_or_else(|e| { warn!("...Guard disabled."); BashGuard::disabled() })` and `SecurityFilter::new().unwrap_or_else(|e| {...SecurityFilter::disabled()})`. CONFIRMED verbatim.
- Prefix vs exact: L414-423 `commands_match` code comment "Handles: exact match, prefix match (approved is prefix of command)" with `c == a || c.starts_with(a.as_str())` vs L1828 AutoDecision "`approved_commands` matching is **exact** after normalization... Do not use prefix/substring matching." CONFIRMED.
- Caveat: later plan-unit blocks mark both as stale lineage (L11241 "BashGuard::disabled() ... preserved as source-lineage only, not as final fail-open policy"; L4437-4441 prefix "source-lineage text only"). The raw conflicting text nonetheless stands at the cited lines.

### 3. UI_Command_Catalog.md missing command families — TRUE
- `cmd.theme.*`, `cmd.persona.*`, `cmd.alert.*`, `cmd.model.*`: **zero** definitions in UCC or anywhere in Plans/ (non-shard). `cmd.concern.*` appears only as an acknowledged gap (Runtime_Artifacts_Panel.md L114; working ledger) — never defined.
- UCC family census (grep `cmd\.[a-z_]*\.`): 36 families, none of the five.
- Orchestrator pause/resume: `cmd.orchestrator.*` = 28 IDs, all open/focus/build/preview/switch — no pause/resume; `cmd.runtime.*` has `resume_after_prerequisite`/`abort_run` but no run-level pause/resume; nothing elsewhere defines `orchestrator.pause|resume`.
- Composer send: no `cmd.chat.send` (closest: `cmd.chat.resend_last_user_message`); no `cmd.composer.*` anywhere.
- Panel undock: `cmd.panel.*` = only `cmd.panel.switch`. Caveat: Wiring_Matrix.md L424/L1931 defines terminal-specific `cmd.terminal.undock_all_from_editor`, but no general panel undock/pop-out command exists despite FinalGUISpec §5.3 "Undock Triggers" (L873) and FileManager.md L257 drag-out behavior.

### 4. FinalGUISpec.md dead references to WIDGETS_*_REFERENCE.md — TRUE
- L1745: "Detailed widget references align with `Plans/WIDGETS_VISUAL_REFERENCE.md` and `Plans/WIDGETS_QUICK_REFERENCE.md`." F3-154 references at L11772 and L11799-11800.
- `find` across the whole repo (case-insensitive): no file matching `*WIDGETS_VISUAL*` or `*WIDGETS_QUICK*` exists. Only referrers are FinalGUISpec.md and its derived shards.

### 5. Duplicate section numbers — TRUE (exact)
- FinalGUISpec.md: `## 15. Persistence` at **L2239** and `## 15. Promoted widget catalog (web tools, planning, question, operation cards)` at **L3332** (all other `## N` are unique, 1-19).
- FinalGUISpec.md: `#### 7.4.2 Indexing settings subsection` at **L1286** and `#### 7.4.2 Agent Config Skills tab` at **L1400**.
- Tools.md: `## 10. Implementation plan: permissions (spec for implementers)` at **L1272** and `## 10. Firecrawl provider integration` at **L1531**.

### 6. Spec_Lock toolkit_version 1.15.1 vs Slint 1.17.0 — TRUE
- Spec_Lock.json L335-336: `"toolkit": "slint", "toolkit_version": "1.15.1"`.
- FinalGUISpec.md L133 and L198: "Slint 1.17.0... verified current stable on 2026-07-02"; L2587 repeats. 00-plans-index.md L25/L199 also pin 1.17.0.

### 7. Wiring_Matrix.production.json counts — TRUE (all four numbers exact)
python3 recount of `entries` (dict): **459** total; ui_location == "Cataloged GUI surface": **179**; entries whose expected_event_types are only `<module>.command_applied` placeholders: **99** (99 have such an event; all 99 have nothing else); entries with a real ui_location AND non-empty non-placeholder expected_event_types: **35**. Also: 323 entries have empty expected_event_types.

### 8. PMConcept_Control_Reconciliation.json — TRUE (exact)
- `controls` array length **1284**. Dispositions: concept_only_owner_adjudicated 1175, concept_fixture_only **64**, production_wiring_required **44**, retired_or_rescoped_non_launch_authority **1** → 109 not fully covered.
- source_sha256 `80a19bf...3e06` == `sha256sum Concepts/PMConcept.html` (exact match; generated_at 2026-07-02).

### 9. Contracts_V0.md — PARTIAL (2 of 3 sub-claims exact; heading count off)
- wake_reason open enum: TRUE — L540: "`wake_reason = approval_resolved | clarification_resolved | auth_recovered | startup_recovered | ...`" (ends with `| ...`).
- Empty owner-section headings: PARTIAL — the "## Canonical owner-section requirements" block (L224-L299) has **18** `###` headings of which **15 are strictly empty** (L229, 236, 239, 242, 245, 248, 251, 254, 257, 258, 261, 264, 267, 270, 280); "Requested/effective account identity contract" (L232) has one bullet; two others have minimal content. Claim said 17 empty — phenomenon real, count is 15 (17 only if two near-empty ones are included).
- safe_point.created divergent worktree field sets: TRUE — CV-224 (L13734-13780, acceptance L13751 + tokens L13770-13773) and CV-225 (tokens L13819-13822): `worktree_id, worktree_path, worktree_branch, working_directory`; CV-242 (block ~L14608-14655): `worktree_id, worktree_path, branch_name, HEAD_sha`. Mirrored by prose conflict L2220 vs L2407 (same event, two different field sets — `worktree_branch`/`working_directory` vs `branch_name`/`HEAD_sha`).

### 10. Goal events: only 5 of 21 get payload minima — TRUE (with envelope caveat)
- CV-287 (block starts L17339; canonical_text ~L17347) enumerates 15 `goal.*` + 6 `goal_run.*` = **21** events. Family-specific payload minima are given only for `goal.created`, `goal.updated`, `goal.replanned`, `goal.blocked`, and receipt events (= 5); acceptance criterion states exactly that list. All 21 do share a generic envelope (event_name, schema_version, goal_id, ...), so "no minima at all" would overstate — the accurate phrasing is "family-specific minima for only 5 of 21".
- Goal_Runtime_System.md §3 (L1760-1766) lists the same 21 names and defers: "Concrete cross-owner Goal event names and payload minima are registered in Plans/Contracts_V0.md" (L1770 area).

### 11. Progression_Gates.md missing GATE-007/GATE-008 — TRUE
- `grep -c 'GATE-007\|GATE-008' Progression_Gates.md` = **0**. Registry sections: GATE-001 (L213), 002 (L229), 003 (L245), 004 (L263), 005 (L277), 006 (L287), 009 (L297), 010 (L311), 011 (L337), 012, 013, 014 — numbering jumps 006→009.
- External references exist: Run_Modes.md L176 "`Progression_Gates.md` contains... missing GATE-007 / GATE-008 placement"; chain-wizard-flexibility.md L2296 "Gate-registry integrity must keep `GATE-007`, `GATE-008`... visible" (+ L9653, L9672-9673).

### 12. Models_System.md capability matrix / empty Gemini heading — TRUE
- §3.3.1 matrix (table L443-462): fields system_role_name, streaming, tool_use, thinking_blocks, cache_control, cache_with_oauth, assistant_prefill, parallel_tool_calls, image_input, max_payload_bytes, pricing_version, billing_entity_mode, billing_entity, billing_source — **no context-window field**; no table row anywhere in the doc contains "context" (grep `^| .*context` = 0), despite L510 requiring "effective context window" in capability snapshots and three imported P0 findings about wrong context-window metadata (L8471+).
- `### 4.4 Two Gemini providers` at **L570** followed by two blank lines, then `### 4.5` at **L573** — empty section.

### 13. Storage value registry deferral — TRUE (exact)
- storage_value_registry.json: 28 families; status counts: `deferred_not_build_blocking` **17**, `materialized` 11. `buildability_gate_policy.buildability_gate_passed_must_remain_false: true` (appears once).
- storage-plan.md L506: "Later GUI, analytics, provider, terminal, browser, worktree/lane, project-state, permission/safe-point, and feature projection families remain inventoried with `status = deferred_not_build_blocking`..."; L510: "...and `buildability_gate_passed` remains false."

### 14. Executor_Protocol.md phantom "Wake reasons and coalescing" section — TRUE
- 6 mentions, 0 headings. Prose forward refs: L337 "defined in `### Wake reasons and coalescing`"; L544 "See `### Wake reasons and coalescing` for the canonical wake-trigger list..."; plan units EP-028 (L2228, L2254) and EP-053 (L3494, L3519) also point to "the later Wake reasons and coalescing section".
- `grep '^#\+ *Wake reasons and coalescing'` = no match in Executor_Protocol.md or any non-shard Plans doc. Headings that do exist: "### 5. Wakeup triggers" (L335), "### Runtime recovery wakeup triggers" (L543) — neither is the referenced owner section.

### 15. Personas GUI CRUD without commands — TRUE
- Personas.md §4.1 (L221-238): Library view, Create ("New Persona" editor with ~20 fields), Prompt visibility, Edit, Disable/restore, Delete (confirmation modal), Schema validation on save — full CRUD surface.
- `grep -rn 'cmd\.persona'` across Plans/ (non-shard): **zero** occurrences.

## Task 2 — Random sample of 15 chunk findings

| # | Chunk | Finding (doc, cited lines) | Verdict | Evidence |
|---|-------|---------------------------|---------|----------|
| S1 | CHAT-2 | assistant-chat-design.md L5120-5161 (ACD-037): PT budget matrix Plan 2/4/6, Deep Plan 4/6/8; dimension ambiguous | TRUE | canonical_text "Plan budgets 2, 4, and 6, Deep Plan budgets 4, 6, and 8"; tokens "Plan \| Light \| 2" ... "Deep Plan \| Comprehensive \| 8". Matrix does not bind numbers to one dimension; adjacent ACD-036 (L5089) says PT controls both clarifying-question budget and research breadth. |
| S2 | STORAGE-1 | storage-plan.md L131, L2801: active-agents.json listed as project-state content, no retirement/migration schema | TRUE | L131 lists "active-agents, active-agents.json" among persisted shell/UI state in a token-soup sentence; L2801 preserved token. Only 2 occurrences in doc; no migration/retirement contract in storage-plan.md (retirement language lives in orchestrator-subagent-integration.md instead). |
| S3 | PERMS-1 | Permissions_System.md L396, L1016 cite "(§6.2)" but §6.2 does not exist | TRUE | Both lines cite §6.2; §6 headings are only "## 6. Ask flow semantics" (L534) and "### 6.1" (L549). No §6.2 anywhere. |
| S4 | EXEC-2 | Executor_Protocol.md L5108-5156 (EP-086): replan_generation typed u32 with token "no practical maximum value" | TRUE | canonical_text (L5115): "per-run monotonic u32 starting at 0"; preserved tokens include `u32` and `no practical maximum value` (~L5149). |
| S5 | WORKTREE-1 | WorktreeGitImprovement.md: §2.7 referenced (L445, L464, phase table) but no `### 2.7` heading; 2.6 jumps to 2.8 | TRUE | L445: "2.7 (worktree_exists validity) before create/cleanup"; L464 checklist "worktree_exists: require path + worktree validity". Heading list: 2.6 (L165) → 2.8 (L170). No 2.7 heading exists. |
| S6 | TOOLS-2 | Tools.md L7672-7719 (T-101): "separate owner-defined matcher contract and validation evidence before use" — unresolved dependency, no owner named | TRUE | T-101 "Web Operation Approval Summary Rules" at L7672; the quoted acceptance line at ~L7690; no owning doc named in the unit. |
| S7 | GUI-4 | FinalGUISpec.md: Slint file inventory has no orchestrator.slint / artifacts.slint / source_control.slint despite §7.1/7.12/7.13 views | TRUE | grep count of those three filenames = 0; §7.1 Orchestrator (L1115), §7.12 Artifacts (L1521), §7.13 Source Control (L1525) exist; inventory contains dashboard/settings/interview/nodes/evidence/metrics/... .slint but none for the flagship views. |
| S8 | MODELS-2 | "platform_specs" appears nowhere in Models_System.md | TRUE | grep -c = 0 in Models_System.md; term lives in Multi-Account.md, Provider_OpenCode.md, orchestrator-subagent-integration.md, newtools.md, FileSafe.md. |
| S9 | LSP-1 | LSPSupport.md L135 vs L148: rust-analyzer "command available" (PATH) vs member of "PM-managed/default first-class set" | TRUE | Table row L135: "rust \| .rs \| rust-analyzer command available"; L148: "The PM-managed/default first-class set... : rust-analyzer; ...". L264 further says "e.g. rust-analyzer from PATH". Install posture never reconciled. |
| S10 | MEDIA-1 | Media_Generation_and_Capabilities.md: §1.3 canonical 6-value disabled_reason enum ("MUST use exactly these strings", L321) vs AC-MED05 (L960) and MGAC-072 (L4955) allowing `UNSUPPORTED`/`CAPABILITY_GATED` | TRUE | §1.3 table L311-319 lists exactly NOT_CONFIGURED, MODEL_UNAVAILABLE, ADMIN_DISABLED, BACKEND_UNSUPPORTED, RATE_LIMITED, QUOTA_EXCEEDED; L960/L4955 use two values outside that enum. |
| S11 | MULTIACCT-1 | Multi-Account.md L677: OAuth token polling 5s interval / 5min total timeout is the only concrete retry value in range | TRUE | L677 verbatim: "PM polls for the token every 5 seconds with a total timeout of 5 minutes." |
| S12 | SEC15-1 | Section15 L611 vs L613 "near-duplicate restatements... appearing twice in immediate succession" | PARTIAL | Real duplication cluster exists at L610-L614, but the true near-dupe pair is **L610 vs L611** (both "DOM-style... non-ship"); L613 ("Terminal core MUST center native...") appears only once (grep = 1). Phenomenon confirmed, cited pairing off by one bullet. |
| S13 | INDEX-1 | 00-plans-index.md L25, L199: Rust stable 1.96.1 + Slint 1.17.0 "verified 2026-07-02" currentness claim | TRUE | Both lines verbatim, including "reverify official stable releases before runtime implementation." (Also confirms headline #6's cross-doc version mismatch with Spec_Lock 1.15.1.) |
| S14 | GATES-1 | Progression_Gates.md L130-134 "Verifier MUST run gates exactly as written / MUST block progression" vs multiple gates "not currently enforced by run-gates" | TRUE (minor citation slip) | L130-134 verbatim. Unenforced/partial: L256 (GATE-003 "Not currently enforced"), L270 (GATE-004 drift-half only), L375/L430/L473 (GATE-011/012/013 "Not yet enforced"), plus L148-149 (GATE-011/012/013/014 pending). Note: cited L290 actually shows GATE-006 IS enforced — one of six cited lines wrong, contradiction itself solid. |
| S15 | JSON-SCHEMAS | requirements_quality_report.schema.json declares draft-07 `$schema` while the other 43 schemas declare 2020-12 | TRUE | File header verbatim: `"$schema": "http://json-schema.org/draft-07/schema#"`; grep -l 'draft-07' across Plans schema files (top-level, .implementation_readiness, ledgers/v2) returns only this file. |

## Tally
- Headline claims: 14 TRUE, 1 PARTIAL (#9: 15 not 17 empty headings; other two sub-claims exact), 0 FALSE.
- Random sample: 14 TRUE, 1 PARTIAL (S12: right duplication, wrong line pairing), 0 FALSE.
- Outright false-positive rate across 30 checks: **0/30**. Imprecision rate (PARTIAL): **2/30 (~7%)** — both are detail-level (a count of empty headings; a duplicate-pair line attribution), neither changes the substance or severity of the finding.
- Recurring citation caveats to carry into the final report: (a) claim 1 should cite OSI-225 at L19960 and describe L1448 as the seglog/redb-canonical side of the L1448-vs-L1779/L2367 contradiction; (b) claim 9 should say "15 strictly empty of 18 headings (2 more near-empty)"; (c) claim 2/claim 1 conflicts are acknowledged as "source-lineage only" in later plan-unit blocks — the final report should note the docs contain their own reconciliation language while the conflicting raw text remains.
