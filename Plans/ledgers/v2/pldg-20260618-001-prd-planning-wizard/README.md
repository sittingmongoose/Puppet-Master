# PRD Builder, Planning Wizard, Testing, Approve And Build, and Runtime Handoff

- ledger_id: `pldg-20260618-001-prd-planning-wizard`
- phase: `compiled_prd_planning_wizard_governance_sealed`
- design atoms: `168`
- accepted decisions: `30`
- accepted corrections: `15`
- open questions: `0`
- open blockers: `0`

This is a **bootstrap v2 planning ledger**. It is source/planning memory for Codex and is not canonical product Plans.

## Main settled outcomes

- Requirements Doc Builder becomes **PRD Builder**.
- Chain Wizard and Plan Wizard become **Planning Wizard**.
- PRD Builder supports conversation, import, and hybrid creation with large-source parallel extraction.
- Planning Wizard uses a collapsible Planning Run and bounded topic/integration/audit child threads.
- Both products update their ledgers after every substantive turn.
- Topic ledgers compile and audit after each topic, then undergo final integration and parallel final audit/repair.
- Testing includes current online capability research, safe installation, Auto/On/Off capability settings, and visible browser/native testing where possible.
- The final action is exactly **Approve And Build**.
- Approval automatically opens Orchestrator → Plan Compile and starts the idempotent downstream process.
- Runtime contracts cover Plan Compile, Executor intake/provisioning/activation, WorkNodeRecord materialization, atomic GoalRun startup, and recovery.
- No unapproved stub, TODO, TBD, placeholder, empty required section, fake acceptance, mock production behavior, or deferred implementation detail may pass.

## Use

After overlaying this package into the repo, run:

```bash
python3 scripts/pm-install-prd-planning-wizard-ledger.py
python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
```

Continue conversation with `prompts/resume_ledger.md`, or begin canonical transfer with `prompts/compile_ledger_to_plans.md`.

The compile phase must not create runtime WorkNodes, NodeSeeds, queues, GoalRuns, implementation files, or production build tasks.
