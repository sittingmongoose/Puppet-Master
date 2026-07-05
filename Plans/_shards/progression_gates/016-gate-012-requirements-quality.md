# Shard 016: GATE-012 -- Requirements quality

Source: `Plans/Progression_Gates.md`

Source lines: L382-L436

Source SHA256: `1662dae45b80cff576a398c163bae48c6cc47ff005bfb274a64d9e6066a2dd4c`

---

## GATE-012 -- Requirements quality
### Evaluation moment and progression boundary

- GATE-012 evaluates the latest `.puppet-master/project/traceability/requirements_quality_report.json` produced by the requirements validation workflow.
- For this gate, “advance to the next plan node” means any transition from requirements-generation/validation into execution of executable plan-graph nodes, and any later attempt to resume execution after a prior `BLOCKED` result.
- Puppet Master MUST NOT start or resume executable plan-node progression while GATE-012 is `BLOCKED` or `FAIL`.

ContractRef: Gate:GATE-012, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/Decision_Policy.md#6.4-requirements-quality-report-boundary-severity-and-persistence

**Pass conditions (ALL must hold):**
1. `.puppet-master/project/traceability/requirements_quality_report.json` exists.
2. The file validates against schema `pm.requirements_quality_report.schema.v1` (cross-ref: `Plans/requirements_quality_report.schema.json`).
3. `verdict == "PASS"`.
4. `needs_user_clarification[]` is empty (length == 0).

**BLOCKED state (deterministic):**
- If `needs_user_clarification[]` is non-empty after a Puppet Master run, the gate enters BLOCKED state.
- In BLOCKED state: Puppet Master MUST NOT advance to the next plan node; instead it MUST surface each clarification item to the user via the UI escalation path (thread badge + in-thread clarification message + dashboard CtA).  
  ContractRef: Gate:GATE-012, PolicyRule:Decision_Policy.md§6, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md
- Puppet Master MUST NOT auto-resolve clarification items; each item MUST be resolved by explicit user input before re-running the gate.  
  ContractRef: Gate:GATE-012, PolicyRule:Decision_Policy.md§6, ContractName:Plans/assistant-chat-design.md
- Once the user resolves all items and the quality agent re-runs, producing `needs_user_clarification[] == []` and `verdict == "PASS"`, the gate transitions to PASS and progression resumes.

**Deterministic gate outcomes:**
- PASS: Conditions 1–4 hold.
- BLOCKED: Conditions 1–2 hold and `needs_user_clarification[]` is non-empty.
- FAIL: Missing/invalid report artifact (conditions 1–2 fail), or `needs_user_clarification[]` is empty while `verdict != "PASS"`.
ContractRef: Gate:GATE-012, SchemaID:pm.requirements_quality_report.schema.v1

Required evidence:
- Evidence bundle conforming to `Plans/evidence.schema.json` with `checks[]` entries:
   - Schema validation of `requirements_quality_report.json` against `pm.requirements_quality_report.schema.v1`
   - Deterministic gate-state classification evidence (`PASS` | `BLOCKED` | `FAIL`) derived from `verdict` + `needs_user_clarification[]`
   - PASS-path assertions (required when classified as PASS): `verdict == "PASS"` and `needs_user_clarification[]` is empty
    - BLOCKED-path escalation evidence (required when `needs_user_clarification[]` is non-empty):
      - Thread state transitioned to `attention_required` with unanswered-question count equal to `len(needs_user_clarification[])` (thread badge evidence).
        Cross-ref: `Plans/assistant-chat-design.md §11.1`
      - A dashboard clarification Call to Action was emitted and linked to the same clarification scope (wizard/thread context), consistent with dashboard CtA behavior.
        Cross-ref: `Plans/assistant-chat-design.md §21`
      - Clarification request payload/message evidence includes all `question_id`s from `needs_user_clarification[]` (no omissions).
        Cross-ref: `Plans/assistant-chat-design.md §11.2`
      - A persisted `requirements.clarification_requested` event exists for the same `wizard_id`, `thread_id`, and `question_id` set represented by the final blocked report.
        Cross-ref: `Plans/Contracts_V0.md §3.3`
      - A deterministic redaction check proves that `description`, `before`, `after`, `context`, and `question` fields in the stored report contain no secret-like values.
        Cross-ref: `Plans/Decision_Policy.md §6.4`
    - Unblock/re-run evidence (required before progression resumes from BLOCKED): subsequent report shows `needs_user_clarification[] == []` and `verdict == "PASS"`.
   ContractRef: SchemaID:evidence.schema.json, Gate:GATE-012, ContractName:Plans/assistant-chat-design.md, PolicyRule:Decision_Policy.md§6

**Script enforcement status:** Not yet enforced by `run-gates`; targeted for inclusion after traceability artifact generation is integrated.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, Gate:GATE-012, SchemaID:evidence.schema.json, PolicyRule:Decision_Policy.md§6, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

---

<a id="GATE-013"></a>
