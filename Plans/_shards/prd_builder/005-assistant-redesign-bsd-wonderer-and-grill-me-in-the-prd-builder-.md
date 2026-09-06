# Shard 005: Assistant redesign: BSD, Wonderer and Grill Me in the PRD Builder start flow (2026-09-03)

Source: `Plans/PRD_Builder.md`

Source lines: L579-L662

Source SHA256: `0dddb1aa7bb608605c65e6a5d043ae5afb2c4b91baa39260932698cb7af554ef`

---

## Assistant redesign: BSD, Wonderer and Grill Me in the PRD Builder start flow (2026-09-03)

### Additive Correction v4 — Grill Me is +25 here too (QMAX-020)

`PM_Assistant_v2_Additive_Correction_v4` sets the Grill Me extension to **25**,
retiring the former `+10`. It applies to the PRD Builder's own owner-defined
question scope; the Assistant's per-strategy bases (Plan 3/6/8, Deep Plan
10/15/20) belong to `Plans/Assistant_Plan_Runtime.md` and none of them becomes
this workflow's base. One counter still serves the whole run, and the global
duplicate-prevention registry still suppresses a question already answered in
an imported thread or planning context.


`Plans/Collaborative_Workflows.md` §9.4 fixes the shared-registry boundary for
Wonderer and Grill Me and states that their **placement** is owned here. This
section is that placement. It is canonical live specification text for this owner
document.

### The three start-flow options

The PRD Builder start flow offers exactly three additive options. Each is off unless
the user selects it, none of them is required to start, and none changes what
PRD Builder produces:

| Option | What it adds | When it runs |
|---|---|---|
| **Back Seat Driver** | A separate passive advisor over the run, at the stages bound in Settings. | Continuously, under `Plans/Back_Seat_Driver.md` §4 and §13. |
| **Wonderer** | A built-in Persona plus a reusable methodology Skill that explores adjacent domains and overlooked possibilities. | **Early**, while the shape of the problem is still open. |
| **Grill Me** | A reusable methodology Skill applied through a dedicated participant role that widens the question frontier. | **Near the end** of discovery and topic work, once enough is known to ask sharp questions. |

### Ordering is a rule, not a default

Wonderer runs early and Grill Me runs late **because the two do opposite jobs**.
Wonderer widens the space of things that might matter, which is only useful before
the shape is fixed. Grill Me closes the remaining decisions, which is only possible
once there is something specific to decide. Running Grill Me first produces
confident questions about the wrong subject; running Wonderer last produces leads
nobody has time to research. The flow therefore fixes the order rather than
offering it as a preference.

### Questions

A **shared global question history** spans the whole run. A question already
answered in this run's earlier topics is not asked again, and semantic duplicates
are merged rather than re-asked in new words. Answers are captured in the active
PRD or Wizard state through this owner; Grill Me itself stores nothing.

Grill Me raises the run's effective question allowance by the configured extension
(default **+25**), and the allowance is **shared across participants** — it is a
budget for the run, not a per-agent quota. Grill Me routes answerable factual
questions to research rather than to the user: finding facts is the workflow's job
and deciding is the user's.

The **+25** applies to the PRD Builder's own owner-defined question scope
(its per-flow and per-topic question counters). It does not import the
Assistant's per-strategy bases: BrainStorm's 20, Deep Thorough's 10, and the
regular Plan's 3/6/8 are Assistant Plan strategy values owned by
`Plans/Assistant_Plan_Runtime.md` (`QMAX-001..004`, `QMAX-020`) and none of them
becomes this workflow's base. One counter still serves the whole run: a question
first presented here is charged once and is not re-charged on revision, restart,
retry, or reopen, and the global duplicate-prevention registry still suppresses a
question already answered in an imported thread or planning context.

### Authority

None of the three can implement, execute or approve anything.

- Wonderer's leads remain **hypotheses until researched**, and are labelled that way
  wherever they appear. A lead is never promoted to a finding by assertion.
- Grill Me has no implementation authority: it cannot mutate the target project,
  cannot start execution, and cannot approve anything.
- Back Seat Driver is read-only and never gates a stage. PRD Builder completes
  identically whether BSD is Off, Auto, On, degraded or quarantined.
- Wonderer and Grill Me do **not** participate in hidden PlanUnit, WorkNode, audit,
  execution or certification stages unless explicitly invoked as ordinary agents for
  a relevant visible planning task. Back Seat Driver may cover those stages under
  `Plans/Back_Seat_Driver.md` §13.

Persona identity and storage remain owned by `Plans/Personas.md`; Skill identity,
discovery and bounded materialization remain owned by `Plans/Skills_System.md`;
participant-role semantics remain owned by `Plans/Collaborative_Workflows.md` §9.
This section owns only where the three options appear in this flow and when they run.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Back_Seat_Driver.md, ContractName:Plans/Personas.md, ContractName:Plans/Skills_System.md
