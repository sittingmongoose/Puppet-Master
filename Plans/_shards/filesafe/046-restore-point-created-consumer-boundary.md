# Shard 046: Restore-point created consumer boundary

Source: `Plans/FileSafe.md`

Source lines: L15185-L15325

Source SHA256: `fec2705a0c4f5bcab7856d62a8ca80b2456552237d014f2d1f305ba481929b1b`

---

## Restore-point created consumer boundary

`restore_point.created` creation, native completion custody and supported historical completion reads are owned by Assistant Chat ACD-465 and Storage SP-281. FileSafe is not its producer or consumer and receives no new projector/checkpoint identity. The optional `safe_point_id` remains lineage only: creation, commit reconciliation and replay do not restore files, acquire a FileSafe restore transaction or turn the affected conversation-record custody fence into a project-wide filesystem/runtime fence. FileSafe's separate corruption-evidence and runtime safe-point contracts remain owner-defined.

ContractRef: ContractName:Plans/assistant-chat-design.md#restore-point-created-native-and-historical-consumers, ContractName:Plans/storage-plan.md#restore-point-created-consumer-checkpoint-contract, DecisionID:DL-045

### F2-213 - Layered Guard Policy And Application Working-Root Safety

```yaml
plan_unit_id: F2-213
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: 'One Settings resolver supplies the existing FileSafe switch and declared guard policy for
  exact Everywhere/Computer/Project/chat/run context; computer-specific paths/patterns have their Computer
  home and execution Host/Environment. Computer own On defeats Project Off under the declared safety order.
  GuiConfig.filesafe and puppet-master.yaml are effective run/compatibility views, not another live writer.
  Approved command identities remain exact normalized whole segments. Path-independent approved commands may
  have Everywhere home with declared Project additions; host/path-dependent entries are Computer/Project only,
  and agent-mode skips create no durable entry. Bundled sensitive protection and additive Computer plus Project
  patterns compose without removing required exclusions. Old two-file loader/config-save examples are compatibility
  illustrations, not authority to omit the Computer layer or persist a second store.


  FileSafe''s root is the actual admitted work context. Project work keeps its real Project/worktree roots;
  app chat/Goal/Crew/Assistant Plan/scheduled work has project_id=null and real thread/run/Computer/Host/Environment
  plus chat-folder/granted-root identity. PUPPET_MASTER_ALLOWED_FILES derives from the finalized task/context
  within those roots for planless work, never invented plan metadata. Resolve relative paths against explicit
  working_directory, canonicalize real paths and nearest existing parents for creates, share case-sensitive
  detection/cache per actual Host/root, fail closed on missing roots/empty authoritative scope and recheck
  TOCTOU before effect. The FileSafe-on home-read exception in PS-145 is read-only; Project folders, PM private
  data, secrets/sign-in roots, browser profiles, mail and password stores remain excluded. No hidden Desktop/Downloads
  scan or cleaning of home/broad mounts follows.


  Every mutation uses the same complete mutation-session inputs, scope-aware pre-write safe point, optimistic
  currentness and exact restore journal/equality protocol. Record immutable canonical absolute file identity,
  root, Host/Environment, source scope and permission snapshot; restoration never reinterprets through current
  cwd, visible Project or guessed main root. Root, integrity, storage-writer and recovery holds remain independent
  of permission approval. The application DestructiveOverrideScope is a discriminated union requiring null
  project_id, thread/run, owning Computer/Host/Environment and exact recorded roots/paths; the original Project
  variant still requires its real Project and applicable run/worktree. Both require authenticated operator/reason/expiry.
  The original Project variant retains its historical security event/receipt contract and exact payloads;
  the application variant requires a durable scope-bound owner override receipt. No filesafe.* application
  EventRecord edition is registered or selected by CV-366; app emission stays
  missing_event_registration/non-emitting until separate Event Authority admission and complete owner
  adoption. Missing durable receipt custody blocks the override before effect. PUPPET_MASTER_ALLOW_DESTRUCTIVE=1 is only a request signal and is never sufficient
  authority.


  Destructive command patterns remain active, including the embedded degraded baseline. Structured Y1 force-with-lease
  and PS-147 verified grant-created-resource actions may satisfy the exact authenticated exception after every
  guard; regex matching alone cannot deny all approved Y1 actions or authorize a broader shell segment. It
  never turns --force, broad prune, an unowned object, a lost lease, missing safe-point material or a protected
  target into an allow. No mode/build grant toggles FileSafe off or clears its own blocked policy.


  N25 conversion issues destination roots/permission/override evidence and re-derives allowed files after
  copy/check/cutover. Original sessions, grants and absolute identities stay historical; outside/unpicked
  file mutations remain listed and do not become Project restore targets. The same recovery hold, scope quotas,
  remote custody, backup/retention and atomic rollback apply. An app source hold is not cleared by conversion
  or Undo, and retained canonical permission/Goal/Plan/Crew/schedule evidence outlives the chat Undo window
  under its owner policy. No new FileSafe switch, event authority or restore engine is introduced.


  ACD-508/510 app root admission retains normalized identity, symlink/reparse and nearest-existing-parent checks before
  reads, mutations or restoration; listed FileSafe-on home reads are never a write grant. Actual Project writes
  use their authorized chat/conversion or a separately admitted real FileSafe/attachment owner target, never
  an outside-chat raw write or an external-directory yes. Clean workspace requires one exact admitted directory
  and refuses home, broad mounts and escapes. Pure conversation/internal planning may have no admitted root
  and null cwd; that state never launches a process, creates a probe or widens the allowed-file set. CV-365/366
  and SP-353 select fresh destination permission/source evidence; source safe points, destructive overrides,
  approvals and grants remain historical. N27 Resume/Cancel/requested Undo uses the same exact conversion
  preview/admission, retains Keep both and unsaved-file guards, and cannot clear source/destination holds
  or delete changed work, remote repositories/branches or backups. Goal/Plan/Crew/schedule and canonical permission
  evidence retain independent owner holds after the seven-day/new-work chat Undo limit.'
gui_related: false
gui_classification_reason: Defines permission, scope, admission and recovery policy consumed by UI owners.
depends_on:
- PS-144
- PS-145
- PS-146
- PS-147
- PS-148
unblocks: []
acceptance_criteria:
- Planless app writes within actual roots create the same pre-write evidence and restore exactly by recorded
  identity.
- Read-only root, symlink escape, excluded Project/PM/secret path, empty allowed scope and missing baseline
  refuse.
- Y1 exact authorized branch/lease can pass while other force/prune/delete commands retain blocks or exact
  grant requirements.
- Layer edits persist only at the sole admitted writer; case cache never aliases equal paths on different
  Hosts.
- Conversion/Undo never transplants overrides or clears root/integrity/recovery holds.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-plan-index.py
risk_class: authority_scope_and_target_drift
reasoning_tier: high
context_scope: project_refresh_permissions_and_automation
implementation_surfaces:
- Plans/FileSafe.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards S3/S7/S16; N6/N24/N25; Y1/O1–O3
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "YOLO mode needs
  to absolutely be able to git push and publish."'
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards approval envelope
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "I approve the outstanding
  questions with their recommended settings."'
- 'source_ref:chat:lane-D-phase-1-instruction; Jared: "The other risky actions still ask, unless they fall
  inside an approved build grant over things the build itself created."'
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-D03
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-D01
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-D03
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#Fc-D01
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fd-requests.md#Fd-D01
preserved_exact_tokens:
- GuiConfig.filesafe
- puppet-master.yaml
- PUPPET_MASTER_ALLOWED_FILES
- DestructiveOverrideScope
- PUPPET_MASTER_ALLOW_DESTRUCTIVE=1
- force-with-lease
- project_id=null
- N25
- Keep both
negative_constraints:
- No environment-variable-only override, empty-scope fail-open or prefix/substring command allow.
- No second FileSafe switch, config writer, safe-point owner or restoration algorithm.
- Acceptance of this specification creates no native handler, active EventRecord producer, WorkNode, NodeSeed,
  executable queue, production build task, readiness certification or governance seal.
owner_hints:
- Plans/FileSafe.md
```

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#CV-365, ContractName:Plans/Contracts_V0.md#CV-366, ContractName:Plans/storage-plan.md#SP-353
