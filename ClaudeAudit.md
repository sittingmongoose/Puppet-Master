# Puppet Master — Implementation-Readiness Audit (FINAL)

**Auditor:** Claude (Opus 4.8) · **Date:** 2026-07-05
**Scope:** All 72 `Plans/*.md` documents (~1.86M words / ~5,400 PlanUnits) + `Concepts/PMConcept.html`
**Method:** Every doc deep-read semantically (large docs split across 2–3 agents) **and** the whole corpus mechanically censused. Findings verified before reporting; false positives explicitly retracted. Working evidence lives in the session scratchpad (`SYNTHESIS.md`, `WIRING_FINDINGS_VERIFIED.md`, `mechanical/`).

---

## 1. The verdict

**Is everything implementation-ready? No — but the reason is more specific and more fixable than "the specs are bad."**

The corpus is a **deliberate, disciplined planning *capture***: ~5,400 PlanUnits across 72 docs, and **100% are `create_worknodes: false`** (verified: zero are `true`). By design, `status: accepted` means *the text was captured faithfully*, not *this is buildable*. A separate **PlanCompile runtime** is meant to turn accepted PlanUnits into buildable WorkNodes.

That compiler's **contract is genuinely well-specified** (`Plan_To_Node_Compilation.md` is one of the strongest docs — 16 stage cards, a 110-`$def` schema, full artifact-kind coverage). **But the compiler and its certification harness do not exist, and have no sanctioned path to be built:** the live artifact `Plans/.plan_index/node_readiness_report.json` self-reports `status: "blocked_runtime_certification_incomplete"`, and the one gate that would unblock it (PNC-019) is *itself* `create_worknodes:false` — so **no PlanUnit anywhere authorizes building the harness that would unblock the other 5,400.** That is the corpus's central chicken-and-egg.

So "not ready" is true on **two levels**:
1. **The machine that would make the corpus buildable is unbuilt and unauthorized.**
2. **The captured specs it would consume contain hundreds of concrete under-designs** — some the compiler's own gates would reject at compile time; others need human design the compiler can't invent (the 6 zero-command GUI surfaces, the security gaps, the three "empty-center" subsystems).

Critically — **the project's own readiness signals cannot detect any of this.** The gates, invariants, governance docs, coverage matrices, and the master GUI-rebuild checklist all verify *document/schema consistency*, never *buildability*. That is precisely why the project's own tooling reports "0 blockers" while the gaps below are real.

**This is a coherent, honestly-blocked planning corpus — not a pile of careless gaps. But it is not implementation-ready, and the path to ready is substantial.**

---

## 2. The seven systemic issues (the *why*)

**S1 — Nothing is buildable yet, and the compiler that would change that is unbuilt.** 5,435 `create_worknodes:false`, 0 `true`. The PlanCompile runtime + PNC-019 harness don't exist and no unit authorizes building them.

**S2 — Three subsystems are "empty at the center"** — referenced everywhere, defined nowhere (or circularly):
- **Persistence:** `storage-plan.md` (the deferral target) gives redb *key-name templates* only; **no `EventRecord`/`pm.event.v0` field schema exists anywhere**; no legacy→canonical crosswalk.
- **`execution_unit_context`:** the core runtime object, referenced in 16 docs; the ≥4 field lists that exist **disagree** (Executor gives *three* contradictory lists); none is authoritative or typed.
- **Provider-stream normalization:** how the app parses provider output is undefined — Executor's streaming is one-line intents → CLI_Bridged has no per-CLI schema → Provider_Stream_Mapping is external-reference material that defers *back* to CLI_Bridged. A closed loop with no schema.

**S3 — GUI wiring (rule UIW-003) is systematically incomplete.** The pattern is consistent across the whole app: **backends are specified; the feature-settings command layer is absent.** Six surfaces have `gui_related` PlanUnits but **zero commands** (Personas, Media, Plugins, Skills, Formatters, Account). It reaches the core: the **orchestrator's own node controls (replan/abort/approve-hitl)** are only `(EXAMPLE)` rows; **chat's mode strip, Edit/Resend, Copy, Persona, Teach, and reserved `/export…/share`** are unwired; Permissions (~15 controls, 1 command), Models (0), Widget, usage (1 command in 5,764 lines), MiscPlan's 3 screens — all unwired. Terminal/Search additionally have spec-vs-wiring *drift* (tab-model specs vs pane-model wiring).

**S4 — Security boundaries are the least-ready surfaces.** Permissions self-admits **three unresolved privilege-escalation gaps** (plan-mode downgrade, SSRF via custom provider URLs, command-approval replay). Plugins has **no sandbox/isolation model at all** for untrusted code + an API that can't cross the boundaries it mandates. Containers ships **privileged Docker-in-Docker / remote-SSH with no trust/credential schema**. GitHub auth never specifies its device-code flow. The **HTE `kill.hte_tool_observed` kill-condition and the DAE↔worktree jail binding have no owner** (Run_Modes points at CLI_Bridged/Worktree; neither defines them).

**S5 — Contracts are under-typed; open enums are pervasive.** 677 `such as` open-enum instances across 65 docs; `execution_role` used in 5 docs, enumerated in none; `blocked_reason_code`, `wake_reason`, `finish_reason`, `availability_state`, `auth_family` all named "canonical/closed" but left open or contradictory; `UICommand.args` has no shape; no `schema_version` on persisted payloads.

**S6 — Structural integrity is unreliable.** ≥37 empty "canonical" section headings (25 docs); duplicate section numbers (Tools §10–13 twice, plus ≥10 others); **referenced-but-never-written sections** (Executor's `Wake reasons`, Worktree §2.7, Tools §9); **circular ownership** (GitHubApiTool's operation contracts live in *no* doc); the master index `00-plans-index.md` omits a real owner doc; and a recurring **"accepted" that describes a fix never applied to the live text** (C-049, BS-025, M-082). The **retired `chain-wizard-flexibility.md` is still cited by active docs (Decision_Policy, DRY_Rules) as the live owner of the mandatory Auditor loop that gates "Start Run."**

**S7 — The certification machinery can't see any of it.** Gates check JSON/schema/text hygiene, never compiled code (GATE-010 defers all real Rust/Slint certification to "after the app tree exists"); 21/26 invariants have no gate; Crosswalk/Glossary self-contradict and don't define the terms they own; the master GUI-rebuild checklist is an **unexecuted template**; 54/72 docs paste a **"No open questions"** banner that's false wherever checked.

**Cross-cutting pattern:** the **newest 2026-06/07 "P0" ledger addenda are systematically the least-designed** — bare field-name stubs citing "future X" surfaces (Media MGAC-100/101, Tools' 9 subsystems, Models MS-123–133, orchestrator GRS-033–040, assistant-chat ACD-422–432). Recent commitments are the least grounded.

---

## 3. ⚑ WHAT NEEDS TO BE FIXED (prioritized)

### TIER 0 — Unblocks everything (do first)
1. **Build the PlanCompile runtime + PNC-019 certification harness**, and add a `create_worknodes:true` PlanUnit authorizing its construction. Until this exists, *nothing* in the corpus becomes buildable work.
2. **Define `execution_unit_context` once** — one typed schema, one owner (Executor_Protocol); delete the contradictory lists.
3. **Write the persistence schema** in storage-plan: `EventRecord`/`pm.event.v0` fields + redb table *values* (not just key templates) + legacy→canonical crosswalk.
4. **Define the normalized provider-stream event schema** and break the Executor→CLI_Bridged→Stream_Mapping circular deferral.

### TIER 1 — Security (before any tool-execution / agent build)
5. Permissions: specify `AutonomyCeilingReceipt`, `ProviderEgressPolicy` (SSRF), and the command-approval lease.
6. Plugins: define the sandbox/isolation/capability model + cross-runtime ABI (WASM/subprocess/dylib).
7. Containers: define the remote-host / DinD trust + credential schema.
8. GitHub: specify the device-code OAuth flow, scope enum, and token-storage/refresh.
9. Define the HTE `kill.hte_tool_observed` detection mechanism and the DAE↔worktree jail binding.

### TIER 2 — GUI wiring
10. Add `cmd.*` families + Wiring-Matrix rows for the 6 zero-command surfaces (Personas/Media/Plugins/Skills/Formatters/Account).
11. Wire the **orchestrator node controls** (replan/abort/approve), **chat controls** (mode/Edit/Resend/Copy/Persona/Teach + reserved `/export…/share`), and Permissions/Models/Widget/usage/MiscPlan/Formatters settings.
12. Reconcile Terminal (tab vs pane model) and Search (naming drift + unwired toggles) between specs and the production Wiring Matrix.

### TIER 3 — Contracts / consistency
13. Close every open enum (`blocked_reason_code`, `wake_reason`, `finish_reason`, `availability_state`, `auth_family`, `execution_role`, …); give `UICommand.args` a discriminated union; add `schema_version`.
14. Reconcile prompt-bundle ordering across Prompt_Pipeline / agent-rules-context / Personas, and **specify the prompt's actual wire format** (Prompt_Pipeline never does).
15. Migrate the **Auditor invariant loop + `wizard_status`** off the retired chain-wizard doc to a live owner and repoint Decision_Policy / DRY_Rules.

### TIER 4 — Structural integrity + governance
16. Renumber duplicate sections; write the ≥37 empty "canonical" headings + the referenced-but-missing sections; fix circular ownership (GitHubApiTool operation catalog); update `00-plans-index`; actually apply the C-049 / BS-025 / M-082-class "accepted" fixes.
17. Make gates verify buildability (GATE-010 code-level handler resolution), wire the 21 un-gated invariants, and execute the GUI-Rebuild checklist.
18. Replace preservation-only acceptance criteria with behavioral ones for every unit destined to compile.

### TIER 5 — MVP scope + concept
19. Section15: actually design the **16 of 18 MVP features** that are bullet-point promotions (especially MCP and one-click-install "Agents," which is named but defined nowhere); close Terminal's 13 self-listed P0 gaps.
20. Fix the 3 concept↔plan contradictions (bottom-panel Browser; Git activity-icon opening GITHUB ACTIONS; standalone Unraid panel), and add the **Seams tab** + Docker **Kubernetes/Compose** subviews to the concept (or confirm they are plan-ahead).

---

## 4. Per-area readiness (deep-read)

| Area | Doc(s) | Build-ready | Headline gap |
|---|---|---|---|
| Compilation | Plan_To_Node | contract complete, **0% executable** | compiler + harness unbuilt, unauthorized |
| Orchestration | orchestrator-subagent-integration | ~⅓ | own "built-but-not-wired" validator is unbuildable |
| Contracts | Contracts_V0 | ~15–20% | RuntimeIdentity / EventRecord unschematized; 15 empty sections |
| Persistence | storage-plan | ~10–25% | redb *values* + EventRecord undefined |
| Executor / stream | Executor_Protocol, CLI_Bridged, Stream_Mapping | ~15–20% | execution_unit_context ×3; stream schema circular |
| Tools | Tools / newtools | ~70% core / ~25% new | §10–13 dup; GitHubApiTool no schema |
| Permissions | Permissions_System | ~70–75% eng, **unsafe** | 3 escalation gaps |
| Plugins | Plugins_System | ~60%, **unsafe** | no sandbox |
| Runtime / goals | Goal_Runtime | ~30% | no execution-engine schema / FSM |
| Verification | Automated_Testing / Progression_Gates | ~55% / gates = consistency-only | receipt has no pass/fail field; gates don't check code |
| Chat (central) | assistant-chat-design | ~60% | Worktree strong; most controls unwired; webview unnamed |
| GUI spec | FinalGUISpec / Orchestrator-GUI | ~half | node controls (EXAMPLE only); 19 artifact schemas absent |
| File ops | FileSafe / FileManager | ~35% / ~60–65% | 3 compile-blocking bugs; §13 vanished feature |
| Media / LSP | Media / LSPSupport | ~⅔ / ~⅔ | GUI unwired; vision pipeline stub; broken cross-refs |
| Providers/models | Models / Multi-Account / OpenCode | ~10% / ~55% / ~20% | model-picker unwired; stale model IDs; OpenCode v2 stale |
| Invariants / governance | Architecture_Invariants, Crosswalk/Glossary/DRY | ~20% enforceable | invariants aspirational; governance self-contradicts |
| Planning system | Planning_Wizard/Ledger/PRD/Plan_Document, Prompt_Pipeline | ~⅓ | prompt wire-format undefined; PDS-018 raw import |
| MVP scope | Section15 | **~11% (2/18 features)** | 16 features are bullet-point promotions |
| Release | Release_Supply_Chain | **~0%** | no code-signing / notarization / update at all |
| Reference | Document_Packaging_Policy / BinaryLocator | solid / ~partial | (bright spots — see §5) |

---

## 5. Bright spots (this is not all bad)

Genuinely strong, build-ready material exists and should be preserved as the model for the rest:
- The **PlanCompile compiler contract** (110-`$def` schema, full discriminator coverage).
- The **classic Tools built-ins** (bash/edit/read/grep/glob/write) + the Firecrawl/web family.
- The **Permissions enforcement engine** (~70–75%: precedence, scope-specificity, 7-step resolution, guards, TOML persistence).
- **FileSafe's optimistic-concurrency / CAS + case-folding contracts.**
- **assistant-chat's Worktree feature (W.1–17)** — data models, redb keys, seglog events, full command tables.
- **Media's `media.generate` contract** + slot-extraction grammar + provider route matrix.
- **Contracts_V0's L2200–2540 taxonomy block** (restore_outcome, remediation.resolved, failure_class, token buckets, timestamp provenance).
- **`Document_Packaging_Policy.md`** — fully buildable as written (concrete constants + losslessness proofs).
- **storage-plan's seglog wire-header + regex-index binary formats** (§2.1–2.2).
- **Multi-Account taxonomy** and **MiscPlan's cleanup contract**.

The `create_worknodes:false` discipline, the atomization/lineage tracking, and the pervasive compatibility-alias governance layer are real engineering rigor — the corpus is *organized*, not sloppy.

---

## 6. Concept vs plans (PMConcept.html)

Feature **breadth is well-reconciled** — nearly every concept surface has plan backing, and the plans are actually *ahead* of the concept on several points (they document an explicit concept-vs-plan reconciliation).

- **Concept → Plans gaps:** one concept-only detail is unspecced (a **code-editor minimap** — no source-editor owner doc). Three concept choices **actively contradict named plan decisions**: Browser as a bottom-panel tab (FinalGUISpec forbids it), the Git activity-bar icon opening the GITHUB ACTIONS panel (FinalGUISpec: "MUST NOT"), and a standalone retired Unraid panel (FinalGUISpec retired it → opens `docker_manager`).
- **Plans → Concept gaps:** the concept **drops the Orchestrator's 7th "Seams" tab** (plans specify 7; concept shows 6) and **omits Docker Manager's Kubernetes + Compose subviews** (heavily specified with full `cmd.docker.k8s.*` / `cmd.docker.compose.*` families).
- **Ruled out** (earlier suspicions that proved *not* gaps): screenshot-to-chat, activity bar, problems panel, ports — all specified.

**Takeaway:** GUI feature *breadth* is well-accounted-for; the readiness problem is *depth* (schemas, wiring, contracts), not missing surfaces.

---

## 7. Method & coverage

- **72 / 72 `Plans/*.md` deep-read** (semantic), the largest split across 2–3 agents each; plus **all 72 mechanically censused** (see Appendix A).
- Findings were verified before reporting. Notable **retracted false positives**: the `cmd.git.*` vs `cmd.source_control.*` "drift" (a documented two-layer design), the "9 cataloged-but-unwired" commands (documented exclusions), and a sub-agent's prompt-injection flag on `Planning_Wizard.md` (the file is clean — the agent misattributed its own harness context).
- No prompt-injection content exists in the corpus (verified).

---

# Appendix A — Corpus-wide mechanical census (verified)

- **`create_worknodes`: 5,435 `false`, ZERO `true`** across all 72 docs. Nothing is marked to compile into a buildable WorkNode.
- **`future <X>` deferrals: 718 occurrences / 62 of 72 docs** — the dominant de-facto-stub pattern (literal "TODO / to be defined later / propose to create" ≈ 0; the ban is honored, the meaning displaced into "future X").
- **`such as` open enums: 677 occurrences / 65 docs** (+ `or provider/equivalent-specific`: 9 / 5 docs).
- **`MUST RECONCILE` (51) + `MUST VERIFY` (47) = 98 self-flagged unresolved markers / 13 docs.**
- **"No open questions" self-certification: 54 of 72 docs (75%)** — false wherever deep-read.
- **Duplicate top-level `##` headings: ≥11 docs** (Tools §10, storage-plan §8, Commands §7, DRY_Rules §7, FinalGUISpec §15, newtools §12, MiscPlan §10, WorktreeGit §7, orchestrator, BinaryLocator, GUI_Rebuild_Checklist).
- **Empty "canonical owner-section" headings (heading → straight to `> Compliance:` banner, no body): ≥37 across 25 docs** (a floor; single blocks hold 7–8 — usage-feature 8, WorktreeGit 7, FinalGUISpec 6, Contracts 5).
- **`gui_related:true` PlanUnits: 2,386 total** (FinalGUISpec 381, assistant-chat 248, storage 87, …) — the GUI-wiring scale.
- **`execution_unit_context`: referenced in 16 docs**, defined authoritatively in none (≥4 disagreeing partial field lists).

### Command-wiring cross-reference
- 531 distinct `cmd.*` tokens referenced corpus-wide; 460 cataloged in `UI_Command_Catalog.md`; production `Wiring_Matrix.production.json` wires 774 tokens.
- **W1 (BLOCKER):** 6 feature surfaces have `gui_related:true` PlanUnits but **zero** `cmd.*` vocabulary — **Personas (16), Media (29), Plugins (14), Skills (11), Formatters (3), Account.** Under-served (family too small for the surface): LSP (47 GUI units vs 10 commands), Widget (12 vs 8). *(memory was initially in this list but is actually wired via `cmd.chat.memory.*`; corrected.)*
- **W2 (MAJOR):** Terminal & Search spec-vs-production-wiring divergence. Terminal specs use a tab/section/workgroup model (18 tokens: `new_tab`/`close_tab`/`pin_tab`/`rename_tab`/`detach_section`/`embed_in_editor`/`undock_all_from_editor`/…); production wires a pane model (`split_pane`/`close_pane`/`move_pane`/`focus`) — none of the 18 wired. Search: naming drift (`prev_result`→`previous_result`, `rebuild_regex_index`→`rebuild_index`, `clear_scope`→`set_scope`, `clear_all_remote_caches`→`evict_remote_cache`) + unwired toggles (regex/case/whole-word/expand-all/collapse-all).
- **W3 (MINOR):** node-action ownership split `cmd.graph.*` vs `cmd.orchestrator.*` — mostly reconciled; needs one stated ownership rule.
- **Retracted:** git-vs-source_control "drift" (documented two-layer design, reconciled at `Wiring_Matrix.md:556`); "9 cataloged-but-unwired" (documented exclusions + 1 code false-positive `cmd.indexOf`).

---

# Appendix B — Per-document findings

> Legend: percentages are rough build-readiness estimates of the doc's *substantive* content (PlanUnit ledgers are preservation-only and excluded). "W1/UIW-003" = interactive controls not mapped to `cmd.*` commands.

### orchestrator-subagent-integration.md — NOT build-ready; ~⅓ buildable
- The doc's own deliverable — the "Avoiding Built-but-not-Wired" validator — is itself unbuildable (contradictory signatures, all bodies `// Implementation:`, mapping table with no location/schema/rows, `FindingCategory` enum missing variants it uses, ~15 undefined result/error types).
- Storage model self-contradictory (canonical seglog/redb claimed; only the disclaimed legacy JSON files implemented). Concurrency safety absent (races, non-locking `FileLock`, Windows `process_exists` hardcodes `true`, no rate-limit logic). `safe_hook_main` defined twice, neither catches panics. Remediation loop has no termination bound. Crew message-board schema contradictory; parser hand-waved.
- Contradictions reusing the same vocabulary for opposite rules: Severity mapping (Major→Warning vs Major→block), retry-exhaustion recovery (block-user vs auto-continue), max active agents **32 vs 100**. A validation-matrix cell is literally unresolved (OSI-128: "Wiring/readiness (GUI? backend? steps? gaps?)"). New `GoalRun/WorkGraph/WorkNode` vocabulary grafted on with no crosswalk. UIW-003 unmet corpus-wide.
- Build-ready parts: config-merge/precedence, test-scaffolding sections, retry/backoff matrix, interview wiring.

### Contracts_V0.md — ~15–20% specified, ~80% under-designed
- Self-certifies "No open questions" (L286) while containing 15+ **empty** "Concern record" section headings + a corpus-completeness self-contradiction two sentences apart.
- `RuntimeIdentity` (the most load-bearing primitive) never consolidated — fields scattered across ~11 units. `availability_state` self-contradicts (4 values §4.1 vs 5 §4.4). Many enums asserted "closed" but never listed (`auth_family` explicitly open-ended, `decision_kind`, `control_mode`, `drift_state`, AuthRealm/AuthSurface/AuthJobState/ProviderReadinessState, per-provider auth defaults, `wake_reason`, promotion classes, `tab_id`, `stop_reason_code`, …).
- `EventRecord`/`pm.event.v0` schema absent + broken anchor. `HITLRequest` `blocked_reason_code`/`allowed_action_ids[]` unenumerated; `UICommand.args` has no shape; UICommand never mapped to any Slint component; no `schema_version` anywhere. Across ~140 units no field carries type/unit/nullability.
- **Bright spot:** the L2200–2540 taxonomy block is fully specified (the model the rest should follow).

### storage-plan.md — p1 ~20–25%, p2 ~10–15%. The canonical-persistence deferral target under-delivers
- No `pm.event.v0`/`EventRecord` envelope + no per-event payload schema anywhere (`event_type` is opaque `string`). ~30 redb "v1" families are key-name templates only — no value encoding, no typed fields. SP-029 "redb Schema Boundary Anchor" is a heading-as-boundary stub. `execution_unit_context` declared canonical (SP-050) but no field list. Terminal persistence has 3 incompatible key families. SP-227/228/229 (P0 History/Resource-Governor) are one-sentence "propose to create" stubs. ~18 "future X records" forward-refs to nothing. No legacy→canonical crosswalk.
- **Bright spot:** §2.1–2.2 regex-index binary formats + seglog wire-header/CRC/rotation/replay (SP-016..028) are buildable.

### Tools.md — BIFURCATED: core built-ins ~70–75%, edges weak
- Built-ins (bash/edit/read/grep/glob/write) + Firecrawl/web family are unusually thorough (best-specified feature doc). But `## 10/11/12/13` each appear **twice** with different content; `## 9` is missing. `GitHubApiTool` declared "sole permitted interface" for GitHub API has **zero** operation/argument/result/error schema. `discover_paths` defers all enum values to an external `CV-291` registry. `individual_timeout` used in a "LOCKED" formula but never defined; `mutation_capable` mandatory-but-never-populated; 5 drifting `tool.denied` addenda. T-090 preserves 17 known gaps verbatim; 9 new P0 subsystems are one-line intents.

### Permissions_System.md — ~70–75% engineering-ready, but NOT safe to implement
- **Bright:** action triad, §2.4 precedence/scope-specificity, §8 seven-step resolution, doom_loop/external_dir/publish guards, TOML persistence, permission-snapshot schema.
- **Security (self-admitted, dated one day before audit):** PS-127 plan/act autonomy downgradable by model output (no `AutonomyCeilingReceipt` schema); PS-128 SSRF via custom provider URLs (no `ProviderEgressPolicy`); PS-129/130 command-approval replay (no lease algorithm/expiry).
- `permission_scope`/`approval_carryover_scope` declared but never defined; 4 of 15 acceptance criteria cite nonexistent sections (incl. the durable always-grant API). Permission GUI unwired (only `cmd.permissions.revoke` for ~15 controls).

### Executor_Protocol.md — ~15–20%. NOT ready (H1 title "Overseer Protocol" ≠ filename)
- `execution_unit_context`/`DispatchContext`: three mutually-inconsistent required-field lists, no types, no schema file. `### Wake reasons and coalescing` forward-referenced 4× but **never written** (`wake_reason` enum + watchdog polling undefined). EP-110–113 (P0 streaming/WebSocket — the doc's core job) are one-line intents. 113/113 preservation-only.
- **Bright:** status lifecycle, §7.1 retry/backoff, attempt-counter formula, signal grace windows, safe-point payload table.

### FileSafe.md — narrative core ~35–40% (bright spot); rest inert + real defects
- **Bright:** optimistic-concurrency/CAS (§11.1.2a) + case-folding (§11.1.3) contracts are implementation-ready.
- Three compile-blocking bugs in the safety-critical path: fail-closed policy contradicted by `BashGuard::disabled()` fallback in 3 places; `GuardError::SymlinkResolution` used but never declared; `FileSafeEvent` struct (7 fields) vs constructor (5 fields) mismatch.
- **Architectural:** write-scope enforcement is a regex-*guess* over prompt text, not interception of real writes — since platform CLIs are opaque subprocesses, any write whose path isn't phrased in a recognized shape silently bypasses the guard (false-negative scope escape), never documented.
- Scaffolded at `src-tauri/` (Tauri) while the project is `puppet-master-rs/` + Slint. Blanket env-var override bypasses canonical recording. Snapshot/safe-point contract asserted but never schematized. Sensitive-file regexes (`.*key.*`) unbounded. GUI unwired.

### Models_System.md — ~10% build-ready
- §4.4 "Two Gemini providers" heading is **empty**. `fast`/`powerful` model variants (shipped) have no ranking metric (no `capability_tier`/`cost_tier`). Model-picker + Settings>Models GUI entirely unwired (zero `cmd.models`). `ModelSelectionRouter` (core selection) is a bare proposal. MS-123–133 = nine consecutive P0/P1 stub schemas (two are unreconciled duplicates). **Stale/nonexistent Claude model IDs baked as locked canon** (`claude-sonnet-4`, `claude-3-opus`, "Claude Sonnet/Opus 4.6" — real: Sonnet 5 / Opus 4.8).

### FileManager.md — ~60–65% (core tree/drag-drop/buffer/save/persistence solid)
- §13 "Git Status Integration" is changelog-committed and still in the TOC, but the actual §13 body is unrelated (feature vanished). "click-to-open" claimed as owned here but specified nowhere (circular ownership with assistant-chat-design). "Reveal" tree action has no command anywhere; F-050 "Canonical File Tree Action Catalog" resolves to a `cmd.file.*` wildcard. §10 editor-nav is ownership-assertion prose; doc self-admits ~13 "sparse product seams."

### Media_Generation_and_Capabilities.md — ~⅔ (backend solid), GUI unwired + vision pipeline stubbed
- **Bright:** capability system, `media.generate` contract, slot-extraction grammar, error schemas, provider route matrix.
- Zero `cmd.media.*` for any interactive control (gap self-documented in a working ledger). MGAC-100/101 (P0/P1 multimodal attachment) are field-name lists depending on `vision_bridge`/`see_image` tools whose implementation surfaces literally read "future vision_bridge tool" — the vision/image-input pipeline is a stub across Media + Tools + orchestrator + Prompt_Pipeline.

### LSPSupport.md — ~⅔ (protocol lifecycle, doc-sync, config, diagnostics solid)
- Settings>LSP GUI owner cites `FinalGUISpec §7.4.2`, which has two different headings (neither is Settings>LSP). `FileManager §10.10` cited as editor owner but doesn't exist. 9 `cmd.lsp.*` cover single-file actions, but Settings-admin, verification-gate config, code lens, completion-apply, and chat quick-actions have zero commands (47 GUI units vs 9). `ServerSpec` 6 fields unschematized; `capability_profile` open enum on attach-gating logic; `lsp_gate.when_unavailable` contradictory across 3 spots.

### Multi-Account.md — ~55–60% (taxonomy, storage, credential_ref, thresholds solid)
- Account-management GUI has **zero** `cmd.*` wiring (7th zero-command surface; `cmd.account` exists only as a gap-item). Routing-critical fields named-never-typed (`execution_role` — now undefined across 5 docs — `resolution_outcome`, `switch_mode_override`, `cooldown_policy`, `retry_budget`). §5 auto-rotation is a priority list, not an algorithm. MA-067 `CredentialRouteEpoch` is an admitted gap contradicting its own "No open questions" banner + §11 "Open points for implementer."

### Personas.md — prose OK, 0% node-buildable; CRUD unwired; selection algo missing
- Persona CRUD (~10 controls) has zero commands. `Auditor` and `High-Effort Worker` referenced as selectable but defined in no catalog; `workflow_behavior_profile` used but absent from the §3 schema. `tier_personas`/`operation_frame_personas` entirely absent from the SSOT (resolves the cross-doc ambiguity — the owner defines neither). Selection precedence is prose. The 9 core + 5 specialty Personas exist as prose only — not one has a YAML instance, so there's no ship-ready persona data.

### Plugins_System.md — ~60%, but security model disqualifying
- **No sandbox/isolation/resource-limit model** for untrusted code (the word "sandbox" never appears; dylib plugins get full host access; only control is a one-time approval dialog). `PluginContext` API is native function pointers but the spec mandates 3 entry types (WASM/subprocess/dylib) with no ABI/IPC. Manifest has no capabilities field despite the approval UI needing to show "requested capabilities." Plugin-management UI unwired; undefined hook names contradict the canonical hook table.

### Skills_System.md — prose-complete, 0/34 node-buildable; GUI unwired
- Agent Config>Skills GUI has zero `cmd.*` (the 846-entry catalog has 0 skill IDs; the sibling `/web` feature has a full family, proving the catalog process skipped Skills). Three unreconciled "readiness" enums for the same row badge with no merge rule. Skill-manifest `input` schema named-but-schemaless (gates every invoke). "Installed from GitHub" label contradicts "no git import v1."

### Formatters_System.md — engine ~70%; settings tab unwired
- Formatters tab (~10 controls) has zero `cmd.formatter.*`. Command editor is an undecided "text input OR tag list"; reset-to-defaults semantics ambiguous across Global/Project tiers; Status enum has no precedence over the boolean cross-product; add-custom validation is prose. *(Refined W1 pattern across all 6 surfaces: backend engine specified; feature-settings-tab command layer systematically absent.)*

### assistant-memory-subsystem.md — ~⅔; retrieval core unbuildable; wired-but-under-cited
- Memory is wired via `cmd.chat.memory.*` (12 commands) but the owner doc cites only 5/12 and its 2 GUI units cite none. **Retrieval unbuildable:** USearch semantic ANN has no embedding model/dimensionality named anywhere (`embed_text`→vector undefined). Activation-scoring blend has no normalization formula; decay-curve function never stated; maintenance thresholds never numeric; `WorkingSetCapsule`/`MemoryGistHit` return types never schematized.

### Containers_Registry_and_Unraid.md — ~60–65% (auth/publish/tag-sanitization/Unraid XML solid)
- **Security:** CRAU-090–092 "Containerized Hosts" (remote Docker over SSH, privileged DinD, Sysbox) is MVP but has no trust/credential schema (`RuntimeHostFamilyProfile` = column names; validation = "future fixtures"). Canonical local-runtime reason-code enum contradicts itself (prose vs CRAU-017). Most container/image/network/volume/registry controls are English verb lists, not command IDs (spelling conflict `select_context` vs `set_context` in one sentence). Empty stub headings; `registry_hosts`/`k8s_host_policy` named-no-schema.

### Architecture_Invariants.md — only ~20% of invariants precisely + gate-enforced (~80% aspirational)
- INV-019 (largest, most-referenced — runtime identity continuity) is ~30 run-on prose bullets with no testable pass/fail. Self-contradiction: INV-019 mandates all mandatory checks be gate-visible, yet only 4 of 26 invariants are wired to a gate. INV-012 (the "every interactive element maps to exactly one UICommandID" rule underpinning all W1 findings) is physically orphaned (its enforceable half stranded unheaded). `bench-01..32` + session-SQL tables cited as "canonical" justification but never defined.

### Plan_To_Node_Compilation.md — contract complete, 0% executable (the pivotal doc)
- Defines a genuinely complete compiler *contract* (16 stage cards, 110-`$def` schema, full artifact-kind coverage) — one of the strongest docs. But `node_readiness_report.json` self-reports `blocked_runtime_certification_incomplete`; no compiler code exists; the PNC-019 certification harness doesn't exist and (being `create_worknodes:false` itself) has no authorized build path. Missing `## 3.` section (PNC-007 compiler algorithm orphaned); stage-card "algorithms" name the *what*, not the mapping rule.

### Progression_Gates.md — the keystone: gates certify consistency, not buildability
- No gate compiles or runs the Rust+Slint app; every enforced gate checks doc/schema/text hygiene. GATE-010 (UI-command coverage) validates the wiring-matrix *document* only and defers all real Rust/Slint handler certification to "after the app tree exists." 21/26 invariants have no gate; GATE-003 is defined inconsistently across two docs; GATE-007/008 don't exist. ~40% of gates executable, ~60% prose-only; 6 addenda "gates" have no ID/script.

### Goal_Runtime_System.md — ~30% (strong policy/safety contract; weak execution-engine spec)
- `execution_unit_context`/`GoalRun`/`WorkGraph`/`WorkNode` not schema-defined here; §3 "Contracts/Schemas" is bare field-name lists; 23× "future Goal Mode service/scheduler/storage." Scheduler `try_start_turn_if_idle` is prose (no state machine); goal-status lifecycle no FSM/enum. Task Template Catalog claims completion criteria for 10 goal classes, defines 5. Two unreconciled loop-detection subsystems.

### human-in-the-loop.md — ~40%; safety-critical approval boundary NOT buildable to one contract
- Owner of `HITLRequest` yet doesn't close the gap Contracts §6 was flagged for — `blocked_reason_code` still unenumerated; collides with a competing "canonical" `concern_reason`. The retry/restart action has **three** incompatible spellings across 3 sections (can't build the `ActionId` enum). `approval_scope_key` described relationally, no schema; 5 of 8 actions no `cmd.runtime.*`; no UI spec for concurrent blocked episodes; default approval timeout owned by no doc.

### Automated_Testing_System.md — ~55–60% (governance/receipt-naming thorough; operative HOW missing)
- `TestRunReceipt` has **no result/status field** (passed/failed/flaky/error) — a test receipt that can't record pass/fail; `flake_policy` named 5× never defined. No test-generation algorithm for `generated_test_ids`; schemas deferred to a "design-only" external file. The 17-family Auto/On/Off settings model has no behavioral acceptance criteria. The de-facto-stub *detector* has no detection algorithm.

### CLI_Bridged_Providers.md — ~45–55% (envelope/retry/eligibility/provider-retirement concrete)
- **HTE/DAE/`dae_allowed` have zero mentions** here, yet Run_Modes designates this doc as the owner of the no-tools posture + the safety-critical `kill.hte_tool_observed` kill-condition. No per-CLI stdout/event wire-schema for the actual spawned CLIs (conflates "provider"=API-vendor with the spawned-CLI process). `BridgeHandshakeReceipt` canonical_text is a verbatim copy of the proposal.

### Provider_Stream_Mapping_External_Reference_A2A.md — NOT build-ready; external-reference only
- Maps the AutoGen/A2A frameworks the product **rejected** for internal use; no mapping for the actual V0 CLI-bridged providers. Defers the event schema to CLI_Bridged, which defers back — a circular chain; no doc defines the normalized stream-event field schema. Self-admits an unresolved `attempt_id` contradiction. *(Third "empty at the center" subsystem.)*

### OpenCode cluster (Provider_OpenCode + Deep_Extraction + Coverage_Matrix) — ~20% buildable/current
- HTTP/SSE wire contract admitted-**stale** vs OpenCode v2; the proposed `OPEN-CODE-V2-DELTA-MATRIX` remediation was never produced. "Required data shape" is audit prose, not schema. ACP terminology copy-paste-bleeds into the server-bridged-only OpenCode section. Coverage_Matrix's own summary arithmetic is wrong (claims 36/2/0, actual 41/1/0).

### GitHub cluster (GitHub_Integration + GitHub_API_Auth_and_Flows) — ~15–20% / ~5–10%
- GitHubApiTool operation contracts exist in **no** doc (Tools→GitHub_Integration→GitHub_API_Auth, none has the catalog). Empty subsection stubs; a changelog claiming a PR/Issues panel + "§D Project Management" that don't exist; no workflow run/job status-conclusion enum. Device-code OAuth (the named default) never specified; no OAuth scope enumeration; no token-storage/refresh schema; a loopback callback-listener rule that contradicts the poll-based device-code flow.

### MCP_Integration.md — ~15–20%; tool-invocation contract NOT closed
- MI-037 tool-invocation liveness (timeout/heartbeat/interrupt/settlement), MI-034 typed-param JSON-fidelity, and MI-035 remote-server secret injection are all admitted `pm_gap_or_delta` backlog items. `{server_slug}_{tool_name}` identity isn't reversibly parseable (no escaping rule). Two irreconcilable server-config schemas.

### WorktreeGitImprovement.md — ~65% (§1–3 mechanics + exit-code tables solid)
- §2.7 (`worktree_exists` validity — a required checklist item) referenced 3× but **never written**; 7 empty "Canonical owner-section requirements" headings. **Zero mention of DAE anywhere** despite owning the worktree identity DAE jail-isolation consumes (DAE↔worktree binding unspecified). `detect_orphaned_worktrees()` invoked 6× as a black box. §7.7 stale open-question contradicts the "no open questions" banner.

### newtools.md — ~25–30% (interview wiring + Custom-Headless detection concrete; §14 backlog)
- 150/150 preservation-only, contradicting the doc's own "single implementation, no phased rollout" claim. Catalog-ownership contradiction (central registry vs interview module). `FrameworkToolChoice` named 6× never defined; `gui_run_scenario`/`CustomHeadlessTool` have no I/O/error schema. No machine-readable error contract; "research and list" placeholder left in a seed table.

### Section15_MVP_Promoted_Features_Spec.md — the actual MVP scope is ~89% not-build-ready
- Of 18 MVP-promoted features, only **2 (Terminal, Browser)** have schema-level specs; the other 16 are 2–5 bullet promotion-announcements. §3.13 "One-Click Install for Commands, **Agents**, Hooks, Skills" names "Agents" as installable but defines it nowhere. §3.7 MCP is 4 bullets with no health-state model. Even Terminal (the best-specified) has 13 self-documented unresolved P0/P1 gaps (no VT/OSC test matrix, backpressure, accessibility mirror, paste-safety).

### Release_Supply_Chain.md — ~0% (HARD PRE-SHIP BLOCKER)
- No code-signing / notarization / auto-update / SBOM mechanism for a shippable desktop app. All RSC-001–007 are "need X" gap statements proposing successor docs that don't exist; §3 states "concrete schema materialization not_applicable."

### BinaryLocator_Spec.md + Document_Packaging_Policy.md + rewrite-tie-in-memo.md + 00-plans-index.md
- **Bright:** `Document_Packaging_Policy` is genuinely buildable (`max_bytes=262144`, token=char/4, losslessness proofs, 3-audit rule). BinaryLocator's probe-layer algorithm is concrete.
- BinaryLocator BS-027 P0 `desktop_version_handshake` unfilled; duplicate "Deterministic discovery algorithm" H2 headings (acknowledged, live text unfixed). `00-plans-index.md` (the master index) is **stale** — omits real owner doc `Release_Supply_Chain` from its primary Plan map. `rewrite-tie-in-memo` has an empty "Preview session contract" heading.

### Planning cluster (Planning_Wizard + Planning_Ledger + Plan_Document + PRD_Builder) — ~¼–⅓
- **Bright:** approval/CAS transaction contracts (PWIZ-010/014), PRD source-security intake, ledger file/record layout.
- PDS-018 is raw unprocessed import (title "PDS-018 - PDS-018"; body admits 12 empty `target_docs` rows). Only 2 of ~20 controls have `cmd.*` names. §3 "Contracts/Schemas" names 13+ entities with no fields; topic-card 12-state enum has no transition table. PLS-016/017/018 dump unrelated GitHub-issue-triage backlog into the ledger doc.

### Prompt_Pipeline.md — ~40% (attachment normalization + compaction tiers concrete)
- **No literal serialization/wire-format for the final prompt payload** — the pipeline's output is undefined. Self-contradicting persona-vs-rules ordering (§1.2 vs §1.3). `ContextEpoch` depended on by 8+ units, but its defining unit admits it doesn't exist. "No open questions" banner contradicted by §6 ("still not safe to call ready_for_reconciliation").

### Orchestrator-GUI cluster (Orchestrator_Page + Run_Graph_View + Runtime_Artifacts_Panel + Wiring_Matrix.md) — ~half
- Node-graph run-control (retry/replan/abort/approve-hitl — the orchestrator's central action menu) not concretely wired: only `(EXAMPLE)` rows; `replan` has zero command anywhere. `cmd.account`/`cmd.concern`/`cmd.promotion` named only as gap-items explicitly barred from becoming canon. All 19 runtime-artifact JSON schemas don't exist yet. Wiring_Matrix.md is a template with EXAMPLE rows only (real SSOT is `production.json`).

### usage-feature + feature-list + newfeatures — usage-feature ~15–20%; the other two are self-declared backlogs
- 8 empty heading stubs under "canonical live spec text." usage-feature cites `newfeatures §7/§19.2` for the 5h/7d cost mechanism, but those sections **don't exist** (§5–23 were deleted in a compression, cross-refs never updated). No formal `UsageRecord` schema. 5h/7d hardcoding contradiction; 1 `cmd.*` in 5,764 lines; feature-list references a "Part 2" that doesn't exist.

### assistant-chat-design.md (p1 + p2) — ~60% (one of the better core docs)
- **Bright:** the Worktrees-in-Assistant feature (W.1–17 / ACD-318–399) is concrete (data models, redb keys, seglog events, full command tables). But it's the **exception**: mode strip, message Edit/Resend, Copy, Context Lens, Persona controls, Teach, and reserved `/export…/share` have zero `cmd.chat.*` bindings. §7.3 "Extensibility surface" is an empty stub. `/export` is claimed a "fully adopted MVP feature" but has no schema + a wrong cross-reference. The Inline HTML/JS Visual Module is specified with browser-only primitives (iframe/postMessage/DOM) but Slint has no DOM and the webview tech is never named. The newest 2026-06/07 addenda cite "future Assistant Chat X" surfaces that don't exist.

### MiscPlan.md + Project_Output_Artifacts.md — detailed cores; fail at cross-doc coherence
- Project_Output §2.2 sidecar path uses the **retired** Phase/Task/Subtask tier hierarchy as current canon (contradicting MiscPlan's own "tier is legacy"). Project_Output's SSOT `artifact_type` tables omit the entire receipt family (PlanCompile/safe_point/test_run/GoalCompletionReceipt/ApprovedPRDPack) that lives only in ledger prose. MiscPlan's Shortcuts/Skills/Cleanup GUI (3 screens) is unwired; missing §9.1.20 (acknowledged, never fixed).
- **Bright-ish:** MiscPlan's cleanup contract is unusually gap-resolved; Project_Output §1–12 is tight + hash/coverage self-checking.

### Widget_System + interview-subagent-integration + GUI_Rebuild_Requirements_Checklist
- **GUI_Rebuild_Requirements_Checklist** — billed as "the single auditable summary" master pre-build gate — is an **unexecuted template** (every checkbox empty; only pass/fail *rules*, no results; GRRC-023 says `.evidence` is "not live canon" so there's nowhere to record a PASS). Reinforces the keystone. Widget leaves Dashboard/Usage catalogs unenumerated and its 8 action labels unwired. interview has two prose-not-algorithm stubs (`two-trigger order`, `/rules`).

### chain-wizard* (retired) + Bootstrap_Planning_Migration — internally clean, externally miscited
- The chain-wizard docs are cleanly retired internally. **But active `status:accepted` docs still cite the retired `chain-wizard-flexibility.md` as the live owner of mandatory execution-gating logic:** Decision_Policy §6.4 (MUST) says the pre-run `requirements_quality_report` is "generated during the mandatory Auditor invariant loop **defined in** chain-wizard-flexibility.md §12"; DRY_Rules DR-009 encodes "chain-wizard-flexibility **owns** `wizard_status`" — while that doc's header says it "must not be accepted/indexed as active product truth." The retrieval-exclusion mechanism hides it from RAG but not from a human reading Decision_Policy directly. The Auditor loop that gates "Start Run" has no live owner.

### Governance layer (Crosswalk + Glossary + DRY_Rules) — amplifies rather than resolves gaps
- Crosswalk self-diagnoses its missing primitives + undefined load-bearing terms but fixes none. C-049 is `status:accepted` claiming a stub-header was "retired/converted" while the live headers remain empty. Glossary self-contradicts (`execution_unit_context` both "defined" and "missing"), has zero entries for `EventRecord`/`GoalRun`/`WorkGraph`/`WorkNode`, and disagrees with Crosswalk on `usage_event_ref`. No trustworthy authority exists to resolve cross-doc conflicts.

### Run_Modes / Commands_System / Decision_Policy + Decision_Log / FinalGUISpec (governance triad + GUI spec)
- Run_Modes: 7 BLOCKERs. Commands_System: 4 BLOCKERs. Decision_Policy + Decision_Log: 1 BLOCKER. FinalGUISpec read in full (the GUI spec — home of many surfaces the concept depicts; the concept↔plan reconciliation lives here). The Run_Modes runtime/overlay enums (`ask|plan|regular|yolo`; `none|plan|deep_plan|debug|interview|brainstorm|crew`) are concretely defined; the HTE/DAE execution strategies are defined here but defer enforcement mechanics to CLI_Bridged/Worktree (which don't supply them — see S4).

---

*End of report. Working evidence and the running synthesis are preserved in the session scratchpad (`SYNTHESIS.md`, `WIRING_FINDINGS_VERIFIED.md`, `mechanical/`).*
