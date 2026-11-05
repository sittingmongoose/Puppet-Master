# Shard 050: DG-OWN-D historical oracle completion (2026-11-05)

Source: `Plans/Automated_Testing_System.md`

Source lines: L7474-L7541

Source SHA256: `e39ce53819f1619474804edcdf0431b7598df1e2b36539e49f62f70aee213a80`

---

## DG-OWN-D historical oracle completion (2026-11-05)

### ATS-1119 - Ten separate complete historical Goal boundary oracle suites

```yaml
plan_unit_id: ATS-1119
unit_type: owner_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: |-
  Newly authored owner contract under DL-045 (2026-11-05), extending ATS-211. python3 scripts/pm_goal_own_d_oracles.py --output <external-evidence.json> tests complete independent logical owner inputs and actual existing payload/answer/receipt schemas; it is TEST_ONLY, not native execution or a historical instance. The unchanged SP-286 frozen event-value codec is reused verbatim in scripts/pm_goal_own_d_event_value_codec.py (SHA-256 3a0c53aadadd0b6df21e9aca1063531c0fd31a8ffce9a35eccb009c93871d92d); its complete original-value commitment is the existing CV-339 tuple, not a lane-local number/physical codec. Do not use semantic JSON normalization to compare physical bytes or signed zero.
  Each separate suite below calls entry, resolver, row_validator, answer_builder, inspection and disclosure directly. For each boundary, independently supply complete selector, actual source frame/full cursor and CRC/watermark, SP-278 root/generation/token/fence, complete first-receipt custody, accepted-at-issue owner/checkpoint records and required original reference/runtime/predecessor/fact values. Those TEST_ONLY owner records are separate from the presented candidate. Test every declared positive payload branch as a complete original with coherent mirrors/digests and original row facts; an all-true admission descriptor alone never suffices.
  At every independently callable boundary mutate every candidate leaf before entry and after the last returning helper, including original EventRecord metadata, selector, kind, obligations, reader binding, token/source-selection and action authority. Mutate every current owner/source/fence leaf after that helper, including nonmatching same-generation frontier advance and access/deletion/hold/maintenance/receipt/edition changes. No stale mirror/hash may conceal a negative's own defect. The final pure comparison follows all helpers and releases directly, with zero family writes/actions/checkpoint advance. Inventory guards with their negative IDs for the shared guard-isolation tool; do not claim check-11 proof from a private removal-set implementation.
  Separately test truthful missing-admission unavailable/unresolved answers, forged verified dispositions, coherent forged checkpoint/owner claims, missing own reference roles, foreign/altered first receipts and complete original values, CRC/cursor/source/Storage mismatch, lawful retired-writer/changed-live-state originals, retained v1 receipt without invented v2 proof, replay-only history, identity-preserving restore, and large SP-337 referenced source bodies with wrong hash/size/type/owner/ref/access/retention. Old-format/recipe authentication and the exact shared number domain remain O12/S2; format enforcement S1 and C3-F1/F3 proof-tool adoption remain explicit cross-lane sweep work. Native execution remains NOT_RUN; these sweep obligations prevent a complete oracle-grade claim here.

  Suite child_status: exactly goal.child_status_changed, SP-1140 / SP-271 / GRS-060 / CV-334, and its own existing closed answer and fixture bank. Validate the original child identity, actual predecessor and successor, and the legal edge in the independently resolved original child contract. The original parent is nonterminal and unchanged; completed children require the original completion receipt and failed/blocked/degraded children require their actual result or receipt. Preserve optional lease/result/receipt references and absence-means-false parent_action_required without filling stored bytes. A child never completes its parent or recreates topology. Include its own source, admission, original-recipe selection, helper and final-disclosure negatives; no sibling suite supplies this proof.

  Suite degraded: exactly goal.degraded, SP-1141 / SP-277 / GRS-061 / CV-335, and its own existing closed answer and fixture bank. Resolve the original tier, affected required check and mutation, exception evidence, risk acceptance, approval subset and prior/current risk facts from their own retained sources. required_check_affected, mutation_affected, exception_required and risk_accepted must each be actual booleans before interpretation; 0, 1, empty or nonempty strings, null, arrays and objects are not booleans. Preserve the original Strong/Standard restrictions, nonempty risks/actions and materially changed risk/currentness on a repeated degradation. Original allowed_actions remain data with no live dispatch. Include its own source, admission, original-recipe selection, helper and final-disclosure negatives; no sibling suite supplies this proof.

  Suite scheduled: exactly goal.scheduled, SP-1142 / SP-280 / GRS-062 / CV-336, and its own existing closed answer and fixture bank. Validate the original scheduling edge, all six scheduler reasons, four priorities and three next actions. Original blocked/stopped predecessors need their actual recovery/revalidation receipt. Dispatch required its original queue identity, eligibility no later than the append observation, positive remaining owner budget, permission allow, writer-capable Storage and resolved recovery; waiting branches do not dispatch. Reading any branch preserves the current Stop epoch and creates no timer, queue admission, budget use or continuation. Include its own source, admission, original-recipe selection, helper and final-disclosure negatives; no sibling suite supplies this proof.

  Suite progressed: exactly goal.progressed, SP-1143 / SP-300 / GRS-069 / CV-343, and its own existing closed answer and fixture bank. Resolve the authentic original revision/CAS and committed predecessor/successor. Preserve the four original status pairs, nonempty disjoint TaskDelta union, exact original artifact identities/hashes and progress fingerprint from their original source. Repeated progress requires the original repeat/continuation-count and unchanged-artifact/no-progress evidence; do not invent a new fingerprint recipe or infer progress from present artifacts. No To-Do, WorkNode or Goal projection is rebuilt. Include its own source, admission, original-recipe selection, helper and final-disclosure negatives; no sibling suite supplies this proof.

  Suite replanned: exactly goal.replanned, SP-1144 / SP-301 / GRS-070 / CV-344, and its own existing closed answer and fixture bank. Preserve every original interruption class, impact_summary, new_revision equality, original revision/CAS, seven next_action edges, exact unique affected-child/decision correspondence, WorkNode references and remaining-evidence currentness. Resolve original child decisions and evidence through their own owner records, not present WorkGraph or Goal state. Neither reader nor inspector dispatches current Replan; the separate O10 goal_run.replanned source/wiring work remains required. Include its own source, admission, original-recipe selection, helper and final-disclosure negatives; no sibling suite supplies this proof.

  Suite stopped: exactly goal.stopped, SP-1145 / SP-302 / GRS-071 / CV-345, and its own existing closed answer and fixture bank. Preserve all four original interruption boundaries, reason, actual safe point, resumability and complete child/tool settlement evidence. before_mutation has no settlement or safe point; after_mutation_before_settlement has actual incomplete-settlement evidence and resumable=false. A true resumable original requires its original safe-point, resolved recovery, permission and complete settlements. Repeated stopped originals require a materially new boundary. Current Stop/GoalRun ownership and epochs remain untouched. Include its own source, admission, original-recipe selection, helper and final-disclosure negatives; no sibling suite supplies this proof.

  Suite verification_decided: exactly goal.verification_decided, SP-1146 / SP-303 / GRS-072 / CV-346, and its own existing closed answer and fixture bank. Validate each original passed/failed/blocked edge, assigned verifier, actual audit/verification cycle and committed successor. Passed requires original closure/evidence with empty findings/risks; failed requires findings; blocked retains risk/block references. Strong third-repeat cases resolve the original assigned adjudicator. Original closure/currentness belongs to the original cycle; present reviews cannot fill gaps. Passed is no completion or current certification authority. Include its own source, admission, original-recipe selection, helper and final-disclosure negatives; no sibling suite supplies this proof.

  Suite evidence_captured: exactly goal.evidence_captured, SP-1147 / SP-431 / GRS-205 / CV-424, and its own existing closed answer and fixture bank. Preserve the nonterminal unchanged original state, evidence identity/kind, actual content hash/provenance, source-span locator and bounds, currentness, outer/inner redaction and any original snapshot/retention references. Resolve evidence content and source records through their actual owners; a supplied hash cannot establish provenance. Non-validator evidence needs original spans and artifact snapshots their original snapshot. Unknown currentness cannot prove verification/completion. Refuse both-scope new and equal-retry writers before dedupe. Include its own source, admission, original-recipe selection, helper and final-disclosure negatives; no sibling suite supplies this proof.

  Suite receipt_recorded: exactly goal.receipt_recorded, SP-1148 / SP-432 / GRS-206 / CV-425, and its own existing closed answer and fixture bank. Resolve the actual original receipt identity/kind/tier and certifier decision, validator outputs and the COMPLETE required child/WorkNode dependency set from the original certifier owner; the event cannot declare its own required set. Compare exact dependency membership, preserved running/verifying/repairing/degraded/blocked state, and original rejection/block evidence where required. Approved-exception history needs its original approval and residual-risk/incomplete-item dispositions, never a new waiver. Refuse both-scope new and equal-retry writers before dedupe. Include its own source, admission, original-recipe selection, helper and final-disclosure negatives; no sibling suite supplies this proof.

  Suite tool_check_recorded: exactly goal.tool_check_recorded, SP-1149 / SP-433 / GRS-207 / CV-426, and its own existing closed answer and fixture bank. Resolve the original tool-call identity/name/check and actual permission decision, including approval/block evidence where applicable; preserve the unchanged admitted original state. Passed with allow/not_applicable needs original output/log; failed/blocked/unknown needs original log; deny and approval_required cannot pass. Follow-on mutation is a different original event. Resolve output/log content through its own source/access/redaction owner and disclose only the original references and current truthful disposition. Refuse both-scope new and equal-retry writers before dedupe. Include its own source, admission, original-recipe selection, helper and final-disclosure negatives; no sibling suite supplies this proof.

  C3-F2 regression: scripts/pm_goal_history_reader_fixtures.py checks type(value) is bool separately for required_check_affected, mutation_affected, exception_required and risk_accepted. Each flag has a lawful boolean baseline and one-field 0/1/empty-string/string-false/string-zero/null/array/nonempty-array/object/nested-object negatives. The original semantic exception/approval/tier predicates remain enabled; baseline evidence keeps each negative independent of them. Existing retained schema banks are unchanged. Current app/Project new and equal-retry refusal remains independent of historical admission.
gui_related: false
gui_classification_reason: Internal historical-read authority and oracle boundaries; no new visual surface.
split_recommended: false
depends_on: ["SP-1140", "SP-1141", "SP-1142", "SP-1143", "SP-1144", "SP-1145", "SP-1146", "SP-1147", "SP-1148", "SP-1149"]
unblocks: []
acceptance_criteria:
- "All ten separate complete-input boundary suites pass, with native execution NOT_RUN and no claim of actual admission."
- "Every new guard has named single-defect negatives for the shared isolation sweep; false positives, masked negatives or ignored failed exits fail this suite."
- "All four degradation source flags reject every wrong-type form; lawful historical originals are independent of current writers/live state."
validation_surfaces:
- "python3 scripts/pm_goal_own_d_oracles.py"
- "python3 scripts/pm_goal_history_reader_fixtures.py"
- "Plans/goal_degraded_history_contract_fixtures.json"
risk_class: historical_original_authority_laundering
reasoning_tier: high
context_scope: ats-1119_historical_reader_boundaries
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- event-authority-20261104/reviews/DG-sol/REVIEW-cycle3.md#O6
preserved_exact_tokens: ["TEST_ONLY", "SP-420", "SP-339", "required_check_affected", "mutation_affected", "exception_required", "risk_accepted"]
negative_constraints:
- No registry, admission, Decision Log, retained schema, retention, writer or native-runtime authority change.
- No new physical number codec, invented bound or weaker retained-recipe selector.
owner_hints:
- Plans/Automated_Testing_System.md
```
