# Shard 032: Wizard status and blocked lifecycle owner addendum (DL-330, 2026-11-05)

Source: `Plans/Planning_Wizard.md`

Source lines: L4059-L4263

Source SHA256: `6799b1bf957303b9664591fc5e9ca5e894560914cfa42805c2a1f360c60c8faf`

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

### PWIZ-097 - Deferred Intake wizard.opened Observation

```yaml
plan_unit_id: PWIZ-097
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: wizard.opened is a newly authored technical event binding under DL-045 for the already specified
  UCC-032 deferred Planning Wizard intake; it does not revive Chain Wizard or alias another event name. UCC-002/current
  section 2.1A normalizes cmd.project.chain_wizard_open_deferred as a compatibility command spelling before admission,
  and PWIZ-001 admits exactly ApprovedPRDPack, normalized_requirements_pack and assistant_chat_handoff_seed. PWIZ-002/SP-216
  own the real PlanningRun, Named Plan, thread_group_id and actual planning_wizard/intake child identity. Observe
  the existing successful open result for the real Project and actual current PlanningRun intake child, after owner
  route/currentness and permission validation. Opening is not proof of seed acceptance; a route click, attempt or
  failed open emits nothing. predecessor_event_id is null. This event never creates or selects a child on replay.
  The exact producer is emitter.wizard_opened@1.0.0, the current Planning Wizard deferred-intake owner continuation,
  never a GUI callback or generic projector. An admitted current command result supplies actual immutable request_id,
  child, source seed version/hash, parent joins and project-context refs; focus, fabricated Project, raw transcript
  and old Chain Wizard lifecycle are refused. Source refs preserve warnings, amendments/lineage and all compatible
  work-intent axes from the current seed; neither this fact nor its reader edits those owners. CV-594 owns the independent
  closed payload and identity recipe; Plans/storage-plan.md#wizard-opened-original-custody owns its independent
  original source, SP-286 receipt, SP-278 history and withdrawal contract. Current writes remain disabled pending
  this exact family's later admission and retention disposition. This observation changes no existing product action
  or user-visible result boundary. Original custody and restore remain independently required; a successful static
  fixture never supplies native source authority.
gui_related: false
gui_classification_reason: Defines original event/source custody and read contracts, without a presentation change.
depends_on:
- PWIZ-001
- PWIZ-002
- UCC-032
- SP-216
unblocks: []
acceptance_criteria:
- Prepared without family admission; retention remains PENDING_RETENTION_DECISION.
- The complete positive and negative static oracles pass; native execution is NOT_RUN.
validation_surfaces:
- python3 scripts/pm_bundle_revision_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody
reasoning_tier: high
context_scope: event_authority_wave2_dcw_fix1
implementation_surfaces:
- Plans/Planning_Wizard.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- wizard.opened
negative_constraints:
- No event admission, retention choice, new UI behavior, native execution claim or governance seal.
```


### PWIZ-098 - Deferred Intake wizard.deferred_payload.loaded Observation

```yaml
plan_unit_id: PWIZ-098
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: wizard.deferred_payload.loaded is a newly authored technical event binding under DL-045 for the
  already specified UCC-032 deferred Planning Wizard intake; it does not revive Chain Wizard or alias another event
  name. UCC-002/current section 2.1A normalizes cmd.project.chain_wizard_open_deferred as a compatibility command
  spelling before admission, and PWIZ-001 admits exactly ApprovedPRDPack, normalized_requirements_pack and assistant_chat_handoff_seed.
  PWIZ-002/SP-216 own the real PlanningRun, Named Plan, thread_group_id and actual planning_wizard/intake child
  identity. Observe the existing successful acceptance/loading result of one PWIZ-001 canonical seed into the actual
  current PlanningRun intake child. The original successful open event and its exact first receipt must already
  resolve; predecessor_event_id is that wizard.opened event for the same original request, child, Project, Named
  Plan, seed and context. Loading is distinct from opening; route-open, a stale seed, unsupported raw legacy payload
  or failed load emits nothing. Receipt-backed acceptance is not a compile/approval/execution grant. The exact producer
  is emitter.wizard_deferred_payload_loaded@1.0.0, the current Planning Wizard deferred-intake owner continuation,
  never a GUI callback or generic projector. An admitted current command result supplies actual immutable request_id,
  child, source seed version/hash, parent joins and project-context refs; focus, fabricated Project, raw transcript
  and old Chain Wizard lifecycle are refused. Source refs preserve warnings, amendments/lineage and all compatible
  work-intent axes from the current seed; neither this fact nor its reader edits those owners. CV-595 owns the independent
  closed payload and identity recipe; Plans/storage-plan.md#wizard-deferred-payload-loaded-original-custody owns
  its independent original source, SP-286 receipt, SP-278 history and withdrawal contract. Current writes remain
  disabled pending this exact family's later admission and retention disposition. This observation changes no existing
  product action or user-visible result boundary. Original custody and restore remain independently required; a
  successful static fixture never supplies native source authority.
gui_related: false
gui_classification_reason: Defines original event/source custody and read contracts, without a presentation change.
depends_on:
- PWIZ-001
- PWIZ-002
- UCC-032
- SP-216
unblocks: []
acceptance_criteria:
- Prepared without family admission; retention remains PENDING_RETENTION_DECISION.
- The complete positive and negative static oracles pass; native execution is NOT_RUN.
validation_surfaces:
- python3 scripts/pm_bundle_revision_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody
reasoning_tier: high
context_scope: event_authority_wave2_dcw_fix1
implementation_surfaces:
- Plans/Planning_Wizard.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- wizard.deferred_payload.loaded
negative_constraints:
- No event admission, retention choice, new UI behavior, native execution claim or governance seal.
```
