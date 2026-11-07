# Shard 032: Wizard status and blocked lifecycle owner addendum (DL-330, 2026-11-05)

Source: `Plans/Planning_Wizard.md`

Source lines: L4059-L4148

Source SHA256: `fbd7591fa699bc3a490cad2a61ec2f06645f00ff674fca6da68ccf2cc0cc3249`

---

## Wizard status and blocked lifecycle owner addendum (DL-330, 2026-11-05)

Jared's answer of 2026-11-05 ("approve all") to closure question 2 makes this document the owner of `wizard_status` and of the wizard `attention_required` and `blocked` states, their transitions, the blocked record and the blocked clear rule. Retired `Plans/chain-wizard-flexibility.md` defined them in §2.2, §15.2 and the 2026-03-08/09 blocked-state addenda; those sections are now source lineage only. The semantics move here unchanged; only the names follow current canon (PRD Builder for the retired Requirements Doc Builder, and the Auditor validation loop for the retired fixed validation passes). `Plans/Decision_Policy.md` keeps the clarification-round limits (§6.5, DP-064) and the requirements-quality check (§6.4). `Plans/Contracts_V0.md` keeps the `wizard.blocked` / `wizard.unblocked` event payloads, `Plans/storage-plan.md` the durable storage binding, and `Plans/FinalGUISpec.md` the `wizard_attention_required` / `wizard_blocked` card presentation.

### PWIZ-038 - Wizard Status And Blocked Lifecycle

```yaml
plan_unit_id: PWIZ-038
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'Planning Wizard owns wizard_status, the wizard''s own lifecycle enum: setup (wizard instance and project setup are being prepared), requirements (requirements upload, PRD Builder, or canonical requirements merge is active), interview (adaptive interview phase is active), validating (Contract Unification and the Auditor validation loop are running), attention_required (the current clarification or review loop can still resolve the issue set), blocked (automatic progress cannot continue without new input, recovery, or replan), ready_to_execute (validated package is ready to launch execution), complete (wizard finished successfully), and cancelled (user cancelled). Builder bundle state, agent activity run state, and executor node status are separate state families and are not conflated with wizard_status.
  attention_required means the current clarification cycle can continue and answering the current questions may unblock progress; blocked means clarification rounds are exhausted or progress otherwise cannot continue automatically. A Debug investigation budget trip may surface as failed or attention_required depending on whether user recovery is meaningful, but its stop_reason_code stays investigation.budget_exhausted and carries budget_kind. When the requirements-quality check of Decision_Policy §6.4 ends with non-empty needs_user_clarification[], the wizard becomes attention_required: Proceed and Start Run are disabled and the step that triggered the issue shows a lock icon or warning badge. It returns to its normal state only when every needs_user_clarification[] entry is answered and the re-run with those answers injected produces verdict PASS with an empty needs_user_clarification[]. The wizard stays attention_required while the current clarification or review loop can still resolve the issue set, and escalates to blocked when clarification_round_count reaches the Decision_Policy §6.5 cap (DP-064, 3 cycles) without clearing the blocking issues, or when the next required action can no longer be completed inside the current flow (for example auth recovery, explicit user correction outside the inline form, or replan approval). The wizard UX distinguishes clarification still pending (attention_required), blocked on user correction, auth, approval, or integrity (blocked), and degraded but still usable draft structure before graph lock.
  In blocked, Proceed and Start Run stay disabled, the UI copy explains that repeated clarification attempts did not resolve the issue set, the latest canonical quality report is preserved, and requirements are not rewritten automatically without new explicit user input. Blocked persistence uses wizard_status = blocked with blocked_reason_code. A wizard blocked record persists wizard_id, wizard_step, blocked_reason_code, clarification_round_count, report_ref, resume_url?, decomposition_degraded, degradation_reason?, replan_generation?, and attempted_recovery_action_ids[]; wizard state also carries attention_required_reason and attention_required_report_path, the latest blocking requirements quality report. The legacy blocked field names is_blocked, blocked_info, blocked_state, and blocked_episode_ref are non-canonical aliases and are not introduced in new wizard state. A wizard leaves blocked only when materially new user input creates a new issue set, the external prerequisite named by blocked_reason_code is actually resolved, a new replan_generation begins for the wizard context, or the wizard is cancelled; reopening the same blocked wizard without one of those changes does not clear blocked and does not reset clarification_round_count. Wizard packets support both wizard_attention_required and wizard_blocked with the shared fields wizard_id, wizard_step, report_ref, resume_url, thread_id?, and status, so Dashboard, thread, and resume deep-link behavior works for both states.'
gui_related: true
gui_classification_reason: Defines user-visible wizard state behavior, including disabled Proceed and Start Run, step badges, blocked copy, and resume for both states.
split_recommended: false
depends_on:
- DP-064
unblocks: []
acceptance_criteria:
- wizard_status has exactly the nine values setup, requirements, interview, validating, attention_required, blocked, ready_to_execute, complete, and cancelled, and blocked is a canonical persisted state distinct from attention_required.
- attention_required and blocked use distinct semantics and user copy, and resume and deep links work for both states.
- A wizard leaves blocked only on one of the four clear conditions; reopening it alone neither clears blocked nor resets clarification_round_count.
- No live Plans unit routes wizard_status or the wizard blocked lifecycle to retired Plans/chain-wizard-flexibility.md.
- No WorkNodes, NodeSeeds, executable queues, implementation files, or production build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
risk_class: wizard_lifecycle_owner_drift
reasoning_tier: high
context_scope: closure_owner_answers_20261105
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/Decision_Policy.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: wizard_status_blocked_lifecycle_owner
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-330
- Plans/chain-wizard-flexibility.md#CWF-013 (retired source lineage, section 2.2 canonical wizard_status definition)
- Plans/chain-wizard-flexibility.md#CWF-014 (retired source lineage, blocked persistence aliases)
- Plans/chain-wizard-flexibility.md#CWF-103 (retired source lineage, section 15.2 wizard state transition)
- Plans/chain-wizard-flexibility.md#CWF-129 (retired source lineage, attention_required versus blocked)
- Plans/chain-wizard-flexibility.md#CWF-130 (retired source lineage, blocked controls and rewrite stop)
- Plans/chain-wizard-flexibility.md#CWF-131 (retired source lineage, attention and blocked resume packet)
- Plans/chain-wizard-flexibility.md#CWF-135 (retired source lineage, wizard status UX differentiation)
- Plans/chain-wizard-flexibility.md#CWF-136 (retired source lineage, block escalation thresholds)
- Plans/chain-wizard-flexibility.md#CWF-137 (retired source lineage, canonical wizard blocked record)
- Plans/chain-wizard-flexibility.md#CWF-138 (retired source lineage, blocked clear and counter preservation)
preserved_exact_tokens:
- wizard_status
- setup
- requirements
- interview
- validating
- attention_required
- blocked
- ready_to_execute
- complete
- cancelled
- blocked_reason_code
- clarification_round_count
- attempted_recovery_action_ids[]
- attention_required_report_path
- wizard_attention_required
- wizard_blocked
- is_blocked
- blocked_info
- blocked_state
- blocked_episode_ref
- investigation.budget_exhausted
- budget_kind
- DL-330
negative_constraints:
- Do not conflate wizard_status with Builder bundle state, agent activity run state, or executor node status.
- Do not collapse blocked into attention_required.
- Do not introduce the legacy blocked field aliases in new wizard state.
- Do not route wizard_status or the wizard blocked lifecycle back to retired Plans/chain-wizard-flexibility.md.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/Decision_Policy.md
- Plans/Contracts_V0.md
- Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Planning_Wizard.md#PWIZ-038, ContractName:Plans/Decision_Policy.md#DP-064, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md
