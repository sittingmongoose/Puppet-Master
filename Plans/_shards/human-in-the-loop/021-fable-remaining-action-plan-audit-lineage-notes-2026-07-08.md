# Shard 021: FABLE Remaining Action Plan Audit-Lineage Notes (2026-07-08)

Source: `Plans/human-in-the-loop.md`

Source lines: L2682-L2803

Source SHA256: `e83477fb5445aacd63eb29a0513ee20fb69444fe64add25776c30616f3de13a0`

---

## FABLE Remaining Action Plan Audit-Lineage Notes (2026-07-08)

These rows are preserved as audit-lineage notes only. They do not prove repair by themselves; repaired status requires concrete canonical prose/schema/enum/command/algorithm evidence in this owner doc or an explicit non-repair disposition in `Plans/.audits/fable-20260706/owner_note_closure_fidelity_after.jsonl`. This note creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 295` (explicitly_deferred; source line 1022; `sfk-ea3ced32a2d07a9cb2ebcf07`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [CRITICAL] L4-16,37-91: "Provider-native correlation" and "Canonical HITL request contract" headings are either empty or list fields with no types/wire format/enum enumeration.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->

### HITL-038 - Human Decisions, Mode Authority And Approved Build Grants

```yaml
plan_unit_id: HITL-038
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: 'The existing approval host renders three distinct authorities from Permissions: an actual
  human decision, task-scoped mode authority and a previously human-approved build grant. PS-146 ordinary
  YOLO push/publication/needed repository creation and PS-147 listed build actions need no repeated human
  publication click. Their receipts never claim the person just approved them. Optional package/seam HITL
  choices retain their settings and existing current blocked-node contracts; full automation does not silently
  enable or disable those owner settings.


  Issuing/expanding a BuildGrant requires the person at the exact Plan/manifest review. The review names allowed
  operations/targets/created-resource cleanup and exclusions, Current Plan/hash/build and grant revisions;
  an agent can prepare it but cannot call approve/accept/confirm/issue/renew to settle its own retained approval.
  Protected secrets/auth/sign-in, trust/claim/pairing, Recovery Kit/export, S15 repository loosening, durable
  Always and paid signup retain explicit person choice. Always names This project/This computer/Everywhere
  without preselection; paths never offer Everywhere. No message, mode skip or build result becomes those
  consents.


  The host uses the real identity variant: Orchestrator node approval stays run_id/node_id/blocked_sequence/current
  attempt; application chat/Goal/Crew/Assistant Plan/scheduled tool approval binds scope/thread/run/Computer/request/tool/target
  under PS-145. This is one host and permission ladder with separate typed envelopes, not nullable required
  node fields, synthetic nodes or an extra tier/request-era action model. Existing runtime approve/decline
  commands gain only explicitly versioned owner-approved app request variants; no permissions-specific competing
  approve/decline engine is minted. Build-grant approve/revoke are authority-record operations, not tool-approval
  aliases.


  Actual pending human decisions expose only their current canonical action set and exact target/currentness;
  headless retained asks block honestly. Stop/revoke acts through the existing owners, prevents new effects
  and never claims to undo completed remote work. What the build did is the shared History/work projection
  with actual authority, outcome and safe Undo or explicitly labelled compensation/No safe Undo. Historical
  approvals and immutable source snapshots remain inspectable after conversion and retain their owner''s audit
  lifetime.


  Goal objective Save/change retains user_direct|agent_proposed_user_approved and explicit Goal birth, independent
  of ordinary YOLO tool authority. Saved Ask me first and retained schedule approvals cannot be answered by
  agents or cleared by changing visible mode. SQR-019/020 owns authenticated user-only app pause changes and
  its exact one-dispatch direct-user Send now/Build/resume exception; neither changes stored pause nor clears
  task/source/destination holds. CV-365/366 and SP-353 supply exact app authority/source custody, independent
  audit/backup/retention and historical restored evidence; current Settings, client claims or a copied grant
  never become an actual human decision.

  RuntimeApproveV3Request and RuntimeDeclineV3Request select a closed union of the historical run_id/node_id/blocked_sequence/optional attempt_id payload and a discriminated chat_tool decision carrying its exact command, request digest/revision, tool/target, protected person evidence and expiry. Pre-attempt blocks retain absent attempt_id; current attempts resolve only from the original blocked episode, never focus. Results distinguish node identity/effects from the ChatToolApprovalResult resolution payload. node.unblocked applies only to node approval; chat-tool resolution uses approval.chat_tool_resolved with DL-300 requires_owner_adoption. Cross-variant fields, wrong decisions and stale/currentness mismatch refuse; the host, handlers and permission ladder are shared.'
gui_related: true
gui_classification_reason: Approval cards, scope selection, live action targets and recovery controls are
  user-visible.
depends_on:
- PS-144
- PS-145
- PS-146
- PS-147
- PS-148
unblocks: []
acceptance_criteria:
- Mode/grant-authorized remote operations show truthful provenance and no duplicate human prompt.
- Only a real current person action can issue/expand a grant, accept S15 loosening or create Always; agent
  self-resolution fails.
- App and Project blocked approvals use their correct typed identities and share canonical action semantics.
- Headless retained ask, missing disclosure, Stop and stale decision all refuse without invented approval.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-plan-index.py
risk_class: authority_scope_and_target_drift
reasoning_tier: high
context_scope: project_refresh_permissions_and_automation
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards S15/S16/Y1/O1–O3; Q11/N21/N22
  reversals
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "Isnt orchestrator
  going to need a lot of permissions to fully build an entire platform from plans that the planning wizard
  makes? Its hands off from the human in that process so I would think so."'
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards approval envelope
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "I approve the outstanding
  questions with their recommended settings."'
- 'source_ref:chat:lane-D-phase-1-instruction; Jared: "The other risky actions still ask, unless they fall
  inside an approved build grant over things the build itself created."'
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-D01
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-D04
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-D05
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fb-requests.md#Fb-D01
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#Fc-D01
preserved_exact_tokens:
- BuildGrant
- This project
- This computer
- Everywhere
- run_id/node_id/blocked_sequence
- What the build did
- No safe Undo
- user_direct|agent_proposed_user_approved
- Ask me first
negative_constraints:
- No forged approver, agent self-approval, hidden Always or blanket build authority.
- No app node fabrication or weakening historical Orchestrator approval codecs.
- Acceptance of this specification creates no native handler, active EventRecord producer, WorkNode, NodeSeed,
  executable queue, production build task, readiness certification or governance seal.
owner_hints:
- Plans/human-in-the-loop.md
```

ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/storage-plan.md#SP-353, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-020
