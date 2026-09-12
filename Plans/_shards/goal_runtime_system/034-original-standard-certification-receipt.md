# Shard 034: Original Standard certification receipt

Source: `Plans/Goal_Runtime_System.md`

Source lines: L6029-L6104

Source SHA256: `9f8c49299453abd893e62f18c22ddbed101869eeeeda878eb1ede2b8ec87d984`

---

## Original Standard certification receipt

GRS-065 defines the minimal original Standard certification prerequisite under DL-045. SP-289 owns its same-family physical custody and explicit role/version installation; CV-340 owns exact schemas and hash bytes. The original current Plans-to-Code `goal_completion_receipt` remains unchanged at `Plans/plans_to_code_handoff.schema.json#/$defs/goal_completion_receipt`. This is the selected Standard source route, not a new Workflow lifecycle or a claim that every certification/exception producer is installed.

### Original issuer and complete decision

The actual owning Workflow controller or assigned canonical artifact owner issues the original typed decision. The existing Planning Run/final audit controller allocation in Planning Wizard remains authoritative; workers, auditors and receipt panels cannot promote their own result to certification. Source identity is its actual resolved ref and schema, not a hardcoded fixture location or a caller permission boolean. The schema and owner/target authorization, current source/workgraph revision and original issuance time must be authenticated before receipt custody.

Resolve the original Workflow's complete required WorkNode, child, validator and acceptance-criterion sets independently from the original workgraph/owner records. Require exact Project/Goal/GoalRun/receipt identity and scope, source ref, original certifier authority for that target, original tier and graph revision/hash. Each required WorkNode receipt validates against the original canonical `worknode_completion_receipt`, names the expected WorkNode and is complete without unresolved findings. Each required child receipt binds the original parent and required child Goal/GoalRun and successful result. Each validator's actual source record validates against `validator_outcome`, joins its expected source ref/ID, passed status and evidence; every required criterion has satisfied disposition and evidence. Missing/extra/duplicate/foreign/failed records reject.

The original Workflow's eight booleans (`all_worknodes_terminal`, `all_tests_passed_or_dispositioned`, `source_control_receipts_valid`, `no_active_blockers`, `rollback_requirements_satisfied`, `safe_point_requirements_satisfied`, `no_stale_plan_workgraph_currentness_mismatch`, `auditor_passed`) are actually true, with valid original referenced source/runtime/admission evidence; setting flags in a supplied object is insufficient. Its final source state is `clean` or `intentionally_preserved`, decision is `certified`, and unresolved risks are empty. Actual original authority checks bind the certifier and GoalRun, and original issuance/observation chronology is valid without rewriting timestamp spelling or precision.

The original typed receipt retains the exact source/graph/authority hashes and refs, acceptance dispositions, changed artifacts, validator outputs and their source bindings, complete child/WorkNode requirements, certifier identity, original time and decision. Independently project those complete fields from the actual original owner records before copy/serialization. Compare the issuer return and full pending Storage row against that projection, and include actual origin evidence as well as source values in the final complete owner guard. A correct detached receipt hash never substitutes for actual owner authorization or canonical origin.

### Standard scope and truthful exceptions

The newly bound route is exactly `certification_tier = standard`, `final_certifier_decision = certified`, truthful label `certified`, no unresolved risks or exception approvals, and passing validators. The existing D-R18 branch `certified_with_approved_exception`, approval/residual-risk evidence and truthful `completed_with_approved_verification_exception` remain semantically preserved in CV-340. They are excluded from this Standard writer. An approved testing restriction or incomplete-item disposition alone supplies neither an original final Workflow decision nor an automated pass. The selected Plans-to-Code source has no exception decision; the exact original exception/waiver owner route remains separately unbound. This prerequisite does not invent it, widen the source enum or revoke D-R18's already specified distinction.

The broad generic v1 receipt grammar and all original kinds/tiers keep their own meaning. A string `accepted`, a receipt kind, worker success, a body mutation receipt, a projected state or an event observation is not the original Standard receipt. Actual original receipt durability precedes D-R18's eventual `provisional_success|verifying -> certified` GoalRun transition/event; projection follows append. This prerequisite performs neither transition nor event append.

### Body, event and retained disclosure boundaries

The four-state text-first Goal remains under GRS-064; Workflow GoalRun status is separate. Each future event producer must explicitly compose the actual body/control/history/origin, current access/deletion/cancellation/stop/owner state, source Workflow decision, original input, exact event and shared first-AppendReceipt authority. It must use the shared body CAS/reservation interface and complete final joint guard, not a parallel Goal mutation engine. D-R09 evidence association still requires a pre-existing receipt and changes evidence only. No Goal objective/state/revision/history is changed by this receipt-only prerequisite, and no current state is inferred from retired Goal states.

After genuine admission, SP-289's retained reader returns exact original content-free certification metadata from actual canonical custody without reacquiring disposed original Workflow controls or deleted Goal text. Current permission to disclose and native row origin remain required; original permission to issue is retained as evidence, not current action permission. Existing generic views may read the exact compatibility component without claiming Standard proof. Receipt loss cannot be repaired into success from raw events or generic accepted markers. DL-047 body/content lifetime and the existing receipt authority lifetime remain separate; refs create no new content hold.

The fixtures establish bounded original-source and retained-read relationships only. Supplied Workflow/graph/child/validator owner envelopes are test seams, not new durable source families, native authorization services or original-source retention requirements. The initial fixture's generic-shaped component does not prove native absence of its same-key destination. Native original issuance/authentication, actual Standard role installation, complete validator/runtime gates, durability, event producer and GoalRun/body publication remain NOT_RUN; see `reports/event-authority-20260911/step-08-certified-custody-validation.md`.

### GRS-065 - Original Standard Workflow Certification Decision

```yaml
plan_unit_id: GRS-065
unit_type: schema_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Original Standard certification comes from the actual owning Workflow controller or assigned
  canonical artifact owner and complete independently resolved source, target authority, workgraph,
  validator, child, WorkNode and acceptance evidence. The Original Standard certification receipt
  contract preserves its immutable decision and truthful labels through SP-289 custody, keeps
  existing generic receipts and exception semantics separate, and grants no Goal/body/event action.
gui_related: false
gui_classification_reason: Defines internal original certification metadata, custody and owner interfaces; no GUI presentation is specified.
depends_on: [GRS-042, GRS-064, CV-288, CV-340, DL-045]
unblocks: []
acceptance_criteria:
  - "The actual original source and certifier/target/scope/revision/time evidence independently establish every required dependency and Standard final decision."
  - "Original issuer/Storage outputs exactly match actual complete source projection and remain guarded through final current owner/origin checks."
  - "Generic accepted markers, worker success and body receipts never substitute for original Standard certification."
  - "D-R18 exception/waiver semantics stay distinct and unavailable through this Standard route; no new policy or source enum is granted."
  - "Receipt disclosure preserves original metadata after lawful source/body disposal and grants no current action, event proof or Goal/GoalRun transition."
validation_surfaces:
  - Plans/goal_certification_custody.schema.json
  - Plans/goal_certification_custody_fixtures.json
  - Plans/goal_receipt_version_routes.json
  - reports/event-authority-20260911/step-08-certified-custody-validation.md
risk_class: false_certification_or_lost_original_decision_authority
reasoning_tier: high
context_scope: original_standard_workflow_certification
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/storage_value_registry.json
node_compile_hint:
  mode: original_standard_workflow_certification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20260911/step-08-certified-custody-checks.json
negative_constraints:
  - Do not infer certification from an accepted marker, worker success, body receipt, event or projection.
  - Do not claim native installation, event/body publication, exception authority or complete event depth from this prerequisite.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
```
