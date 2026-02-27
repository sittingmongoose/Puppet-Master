## 10. Implementation Readiness Checklist

Before implementation, an implementation agent must complete or have clear specs for the following. Use this list to derive implementation tasks; order may be adjusted by dependency.

1. Add **FlowIntent** enum to app state: `NewProject | ForkEvolve | EnhanceRewriteAdd | ContributePR`.
2. Persist **intent** in wizard/app state and in recovery snapshot (with `wizard_step`).
3. Implement **merge_canonical_requirements(uploads, builder_path) → Path**: merge order uploads then Builder, write canonical doc, return path.
4. Add **phase_plan** to interview state schema (e.g. `.puppet-master/interview/phase_plan.json` or embedded in existing interview state file).
5. Define **PhasePlanEntry** (phase_id, depth: Full | Short | Skip) in types and JSON schema.
6. Implement **phase selector** input (intent, requirements_summary first 2000 chars, codebase_summary Option) and output (Vec<PhasePlanEntry>); call from pre-interview step.
7. Implement **rule-based fallback** when phase selector fails or returns empty (per-intent defaults from §6.3).
8. On **resume interview**, load phase_plan from state and do not re-run selector.
9. Add GUI checkbox **"Run all phases"** (default off); when on, ignore phase_plan and run all phases Full.
10. Add **phase checklist** (optional): list phases with checkboxes; unchecked = force-skip.
11. Enforce **depth semantics** in phase runner: Full = all questions + research; Short = max 2 questions, no research; Skip = omit.
12. **Intent change mid-flow:** modal "Changing intent will clear requirements and interview progress. Continue?" [Continue] [Cancel]; on Continue clear requirements list, canonical path, Builder handoff flag, interview state; set wizard step to project setup; keep project_path and intent (new value).
13. **Recovery:** Include intent and wizard_step in snapshot; restore without defaulting to New project when snapshot says Contribute (PR).
14. **Builder handoff:** Ensure project_path and intent are passed to Interview and not overwritten by empty/default.
15. **Builder output template:** Define required sections (Scope, Goals, Out of scope, Acceptance criteria, Non-goals); add validation warning if missing.
16. **Cancel Builder:** "Cancel and return to requirements" (no save); optional idle timeout with "Return to requirements without saving?" prompt.
17. **GitHub create repo:** Add GUI fields and GitHub API create-repo call with repo name, visibility, description, .gitignore template, license, default branch per §7.1.
18. **Fork:** "Create fork for me" (GitHub API fork endpoint) and "I'll create the fork myself" path/URL input; validate fork exists or path is valid repo.
19. **PR start:** Fork → clone → create feature branch; branch name input or suggest from requirements slug.
20. **PR finish:** Commit, push branch, open PR via GitHub API; detect upstream default branch via GitHub API (`GET /repos/{owner}/{repo}` → `default_branch`); prefill title/body from task; link to PR in UI.
21. **GitHub auth:** Document required scopes; surface "Permission denied" with token-scope message and link.
22. **Contribute (PR) vs worktrees:** Document and implement so PR branch is main clone's feature branch; orchestrator worktrees (if any) do not replace it.
23. **Agent activity view:** One shared non-interactive streaming component; use on requirements page (Builder, Multi-Pass Review) and Interview page (document creation, Multi-Pass Review).
24. **Progress indicator:** Current document/step and remaining count; pause, cancel, resume; persist "in progress" in recovery for resume or start over.
25. **Accessibility:** All new controls keyboard-accessible and screen-reader labeled; use widget catalog.
26. **i18n:** New strings in central module/resource file keyed by id.
27. **No secrets:** Sanitize requirements doc, Builder output, and PR body; checklist item for implementation.
28. **Document:** Fork/PR we only clone and create branch; no execution of upstream code.
29. **Required user-project artifacts:** Emit the canonical `.puppet-master/project/` artifact set exactly as specified in `Plans/Project_Output_Artifacts.md` (no local schema/path restatement).
30. **Plan graph materialization (sharded-only):** Treat `.puppet-master/project/plan_graph/index.json` + referenced `nodes/<node_id>.json` shards (optional `edges.json`) as the only canonical execution graph; `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` is optional derived export only.
31. **Schema + field contracts:** Enforce `pm.project-plan-graph-index.v1` and `pm.project-plan-node.v1` requirements via SSOT/schema validation (do not duplicate field lists in this plan).
32. **Deterministic integrity:** Enforce SSOT deterministic node-ID + shard-hash integrity rules; no randomness and no nondeterministic ordering.
33. **Human-readable view:** Keep `.puppet-master/project/plan.md` mandatory as the operator-facing summary.
34. **Contract/acceptance coverage:** Enforce resolvable `ProjectContract:*` references and acceptance-manifest coverage via the dry-run validator.
35. **Canonical seglog persistence:** Persist required artifacts as full-content artifact events with deterministic chunking and final integrity hash, per SSOT.
36. **Filesystem materialization contract:** Treat filesystem files as reproducible projections of canonical seglog content.
37. **Contract seed pack (Builder):** When Requirements Doc Builder is used, write `.puppet-master/requirements/contract-seeds.md` and include it in Multi-Pass Review (§5.6). Treat it as staging input and reconcile it during the Contract Unification Pass (§6.6); do not treat it as the canonical Project Contract Pack.
38. **Contract Unification Pass:** Implement the deterministic unification step (§6.6) to materialize SSOT-defined canonical artifacts and ensure every plan node references at least one resolvable `ProjectContract:*`.
39. **Dry-run validator:** Run the SSOT-defined validator rules before execution begins; surface failures as gating errors (no manual verification).
40. **Builder opener:** Ensure first Builder Assistant message is exactly `What are you trying to do?`.
41. **Turn counter + 6-turn suggestion:** Implement completed-turn semantics (Assistant message + user response) and suggest generation when `completed_turns >= 6` or earlier if enough info exists; suggestion does not auto-generate.
42. **Checklist dual state:** Implement `builder_checklist_state.v1` and `builder_conversation_state.v1` and keep them synchronized.
43. **Qualifying questions:** Ask only for checklist sections marked `empty` or `thin` before generation.
44. **Post-generation confirmation:** Ask `Do you want to make any more changes or talk about it more?` before Multi-Pass/handoff.
45. **Three-location review:** After generation/revision, open in File Editor, show clickable canonical path, and show document pane entry; chat must not render full document bodies.
46. **Findings summary surfaces:** Show Multi-Pass findings summary in chat and in the wizard preview section before final approval.
47. **Single final approval gate:** Capture one final decision (`accept | reject | edit`) per Multi-Pass run with `findings_summary_shown=true` precondition.
48. **Document pane recovery:** Persist `document_pane_state.v1` and restorable `document_checkpoint.v1` so recovery restores selected document/view and approval stage.
49. **Three-Pass Canonical Validation Workflow (§12):** Implement as a post-Contract-Unification-Pass pipeline that runs Pass 1 → Pass 2 → Pass 3 serially.
50. **Pass 1 (Document Creation):** Verify all required `.puppet-master/project/` artifacts are generated and emit `validation_pass_report` (Pass 1) to seglog.
51. **Pass 2 (Docs + Canonical Alignment):** Compare artifacts against Project Contract Pack and platform canonicals; apply fixes; emit `validation_pass_report` (Pass 2) with findings, changes, diff_pointers.
52. **Pass 3 (Canonical Systems Only):** Enforce DRY/SSOT, plan graph integrity, wiring matrix, evidence/invariants, deterministic decisions; emit `validation_pass_report` (Pass 3); MUST NOT modify requirements.md or plan.md.
53. **Per-pass provider/model:** Read per-pass provider+model from app settings (see assistant-chat-design.md §26); apply deterministic defaults when not configured.
54. **Headless execution:** All three passes MUST run headless (no GUI, no user approval gates between passes).
55. **Failure surfacing:** If Pass 1 fails, halt and surface failure; if Pass 2 or 3 fails, surface unresolved findings while still writing the corrected artifact set.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/assistant-chat-design.md

---

