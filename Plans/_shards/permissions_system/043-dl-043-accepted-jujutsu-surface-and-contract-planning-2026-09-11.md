# Shard 043: DL-043 — Accepted Jujutsu Surface And Contract Planning (2026-09-11)

Source: `Plans/Permissions_System.md`

Source lines: L10025-L11097

Source SHA256: `30d3beb8e135f0dd30e7757570a3b6b7e2830c5655547b4ebb81b675b748cbed`

---

## DL-043 — Accepted Jujutsu Surface And Contract Planning (2026-09-11)

This addendum compiles accepted planning decisions only. Live semantic owners retain command admission, native behavior, authorization and evidence authority. Existing command schemas and production wiring remain unchanged.

### PS-142 — Jujutsu Action Specific Authorization And Read Boundaries

```yaml
plan_unit_id: PS-142
unit_type: security_contract
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: The accepted Jujutsu capabilities retain effect-specific Permissions and independent FileSafe
  admission through the existing owner services. Browsing, displaying a capability, creating a preview or operating
  an internal adapter service never grants execution authority for a later effect.
gui_related: false
gui_classification_reason: Defines envelope or authorization owner requirements rather than visual presentation.
depends_on:
- JJI-003
- PS-139
- SCS-018
- F2-211
- F2-212
- BRS-022
- JJI-009
unblocks: []
acceptance_criteria:
- Group undo, redo, selected-operation reversal, adoption/repair, convergence, duplicate, merge, absorption, back-out
  and selected-hunk/drag mutations revalidate exact target/native revision, writer lease, current permission,
  FileSafe, confirmation tier and idempotency at dispatch. Preview or earlier approval does not authorize a changed
  scope.
- Physically read-only browsing and earlier-state inspection cannot trigger migrations, metadata repair, snapshots
  or remote completion. Any permitted isolated read support has no write authority over the protected source.
- Marker metadata and hide/unhide require their metadata owner permission and cannot grant repository mutation,
  deletion, retention changes or ownership release. Hiding active work cannot suppress its safety warnings.
- Managed rewrite preview is an effectful workflow when it writes objects or permits external effects; preview
  creation and application each receive their applicable effect authorization. Cancellation/expiry requires truthful
  cleanup outcome, and application requires the current reviewed preview scope.
- History maintenance is explicit and target-bound, retaining Backup holds/capture/GC fences and destructive confirmation.
  Missing-data completion separately authorizes remote/credential/cost scope; browse/verify does not fetch and
  a prior credential lease does not grant completion.
- Diagnostic export requires explicit scope and destination authorization plus redaction of secrets and private
  path/content data. Technical log access respects read/redaction policy; knowledge of an operation ID or command
  string does not grant access.
- The separate internal adapter service carries the initiating identity and policy decisions; it has no independent
  authority, public service, external agent surface or permission bypass. Denied/unavailable outcomes use owner
  receipts without fabricated execution.
validation_surfaces:
- Future owner-qualified request/result, stale identity, denied, cancellation, partial and unknown-effect fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: jujutsu_identity_authority_or_effect_misrepresentation
reasoning_tier: high
context_scope: dl043_accepted_jujutsu_planning
implementation_surfaces:
- Plans/Permissions_System.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d001
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d002
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d003
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d004
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d007
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d008
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d009
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d010
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d011
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d012
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d013
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d014
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d019
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d022
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d031
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d035
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d037
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d038
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d042
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d043
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d044
- Plans/Decision_Log.md:DL-043
negative_constraints:
- 'Planning only: no new admitted command ID, native handler, runtime readiness, EventRecord family, schema widening,
  WorkNode, NodeSeed or governance seal follows from this unit.'
- Declined DL-043 dispositions remain declined; do not reopen them or add a third-party diff/source-control library,
  external IDE/MCP interface, shared public service, custom publish hooks, specialized storage or specialized
  AI workspace-review workflow.
owner_boundary_notes:
- Jujutsu and Source Control own native semantics and admitted command contracts; Final GUI owns presentation,
  Backup owns restore/completion/maintenance policy, FileManager owns newline behavior, Permissions and FileSafe
  independently own safety, and Forge owns hosted workflows.
owner_hints:
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
- Plans/FinalGUISpec.md
- Plans/Backup_Restore_System.md
- Plans/FileManager.md
- Plans/Forge_Integrations.md
- Plans/FileSafe.md
```

### PS-143 — Conditional Jujutsu Publication And Forge Workflow Authorization

```yaml
plan_unit_id: PS-143
unit_type: security_contract
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: Publication of unresolved conflicts remains blocked by default; an advanced path requires a
  qualified compatible Git/Jujutsu target and current effect-specific authority. PS-146 governs YOLO publication/Y1
  and PS-147 exact build grants; backend qualification, expected heads, auth and FileSafe remain independent
  checks. Bookmark/hosted workflow selection never widens local mutation, credentials or force-push authority.
gui_related: false
gui_classification_reason: Defines envelope or authorization owner requirements rather than visual presentation.
depends_on:
- PS-138
- PS-142
- JJI-019
- FGI-016
- FGI-017
- PS-146
- PS-147
- PS-148
unblocks: []
acceptance_criteria:
- Qualification is exact to adapter version, target and supported content behavior; unsupported or unknown
  compatibility stays blocked. Advanced publication approval binds the reviewed unresolved-content/remote scope
  and cannot waive branch protection, FileSafe, native expected-state fences or provider policy.
- Conflicted-bookmark resolution displays exact alternatives and applies only an existing admitted bookmark
  mutation with current permission and identity checks; selecting a visible candidate alone does not mutate.
- One explicitly supported stack workflow is authorized at a time with independent publication and hosted review
  creation/update scopes, provider instance, immutable revisions, credentials and current permission. Partial
  success and effect_unknown cannot be retried as though no effects occurred.
- An additional review service requires a concrete user workflow plus provider-specific authentication, identity,
  submit and recovery support; enabling it does not replace local history or authorize other providers. Local
  history remains usable when hosting is unavailable.
validation_surfaces:
- Future owner-qualified request/result, stale identity, denied, cancellation, partial and unknown-effect fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: jujutsu_identity_authority_or_effect_misrepresentation
reasoning_tier: high
context_scope: dl043_accepted_jujutsu_planning
implementation_surfaces:
- Plans/Permissions_System.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d027
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d028
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d039
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d040
- Plans/Decision_Log.md:DL-043
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards Y1/O1–O3
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "YOLO mode needs to
  absolutely be able to git push and publish."'
negative_constraints:
- 'Planning only: no new admitted command ID, native handler, runtime readiness, EventRecord family, schema
  widening, WorkNode, NodeSeed or governance seal follows from this unit.'
- Declined DL-043 dispositions remain declined; do not reopen them or add a third-party diff/source-control
  library, external IDE/MCP interface, shared public service, custom publish hooks, specialized storage or
  specialized AI workspace-review workflow.
owner_boundary_notes:
- Jujutsu and Source Control own native semantics and admitted command contracts; Final GUI owns presentation,
  Backup owns restore/completion/maintenance policy, FileManager owns newline behavior, Permissions and FileSafe
  independently own safety, and Forge owns hosted workflows.
owner_hints:
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
- Plans/FinalGUISpec.md
- Plans/Backup_Restore_System.md
- Plans/FileManager.md
- Plans/Forge_Integrations.md
- Plans/FileSafe.md
preserved_exact_tokens: []
```

### PS-144 - Computer Rules, Safety Defaults And Repository-Origin Acceptance

```yaml
plan_unit_id: PS-144
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: 'Permissions owns rule matching and durable authority; Settings owns the single effective-value
  resolver and level transactions. Profile in use and declared FileSafe/safety rows consume SSYS-059 more_careful:
  compare Computer own and Project own values, use the more careful listed value, and when both are set and
  either profile is custom use Computer own with its explicit reason. Everywhere supplies a default; Managed
  and parent ceilings remain above all. Permission rule matching remains per_item under this owner''s specificity/deny/last-match
  rules.


  Insert Computer rule layer 5b between Project and Everywhere. Scope specificity is lane > seam > package
  > project > computer > everywhere; absent Project context omits its nested rungs. `global` is compatibility
  spelling normalized to `everywhere` before policy. New resolved_permissions source values are `preset|project|computer|everywhere|user_override|session`
  in a versioned successor; historical exact snapshots keep their old enums. Mode and build-grant authority
  are separate decision provenance, not new human source labels. Computer identity is a tagged Server key
  or Execution Host key with exact Environment/root identity where relevant, never an ambiguous bare machine
  string or a new Execution Environment level.


  Everywhere rules have one Settings-home writer with bounded read-only user-config projections; Computer
  rules have one owning Server/Host writer; Project TOML and library permission profiles keep their owners.
  The existing `cmd.permissions.create_global_rule` now explicitly targets Everywhere; add `cmd.permissions.create_computer_rule`
  at the same durable-rule owner. Existing create_project_rule/update/reorder/delete/revoke/validate routes
  remain. Requests bind actor, explicit level/key, rule_id, normalized pattern/action, expected owning revision/hash
  and operation id; result is the durable rule/revision/hash or a closed refusal. Rule creation uses atomic
  owner CAS and immutable audit metadata; no offline write queue or second file writer. Copying a selected
  permission profile/rule invokes this owner as a subtransaction of the one Settings preview/apply/rollback
  engine, preserves stable source identity and origin, and never turns the copy into trusted executable code
  or a source approval into destination authority. Portable non-path rules may be selected; Computer paths/credentials
  are excluded and destination checks remain. Whole profile versions retain home/reach and declared Project
  enablement, with no field-by-field policy merge.


  Always requires a person to choose the exact pattern and `This project`, `This computer` or `Everywhere`;
  nothing is preselected. No-project hides This project. Rules about a file, directory, executable location,
  root or other host-dependent target never offer Everywhere. The external-directory row remains `safety.protection.external-dir-allowlist`;
  do not invent a second list. YOLO ordinary auto-allow creates neither an Always rule nor a FileSafe approved-command
  entry. Explicit rules stay inspectable and revocable and do not silently expand with mode changes.


  Repository-brought permission/config material carries origin and content/version identity distinct from
  person-authored rules. Restrictive rules may apply. Anything looser than the person''s current accepted
  policy is held until a human reviews and accepts that exact source/version and delta; changes invalidate
  prior acceptance. This S15 acceptance remains required in YOLO and is separate from executable-source/version
  trust and durable Always. Cloning/forking, copying settings, accepting a message, or approving a build never
  accepts loosening. Agent Settings edits use the narrowest offered level in their own context; Regular Everywhere
  changes ask, requested task-scoped YOLO Everywhere changes show the same preview and apply without that
  ordinary yes. Agents cannot change Managed policy, credentials, settings home/peer trust, another Project''s
  settings or their own blocked guard policy.


  settings.follow is a read-only settings peer scope: it grants no Project/content access, tool dispatch or
  grant authority. settings.everywhere.write is restricted to the authenticated owner devices admitted by
  the Settings/Server owner; a read-only follower or limited member cannot acquire it through a mode, copy
  or shared home. Existing peer trust and protected home/join decisions remain human-owned.


  The finite existing safety-answer scalar rows are safety.rules.default-tool-permission, safety.approvals.doom-loop-action
  and safety.protection.external-dir-action, each with careful_order deny→ask→allow. The profile order is
  read_only→plan→regular→full (custom uses the stated Computer fallback), and the one FileSafe switch orders
  On before Off. The per-tool-permissions and web-tool-permissions maps stay per_item: first resolve each
  layer own answer for the exact permission key with existing owner matching/deny semantics, then protectively
  combine simultaneous Computer-own and Project-own declared answers with deny before ask before allow. This
  is not per-field profile merging or a reordering of independent granular durable-rule specificity. Do not
  invent a fourth scalar ask row or generic internet-use toggle from imprecise source wording; actual web/network
  policy retains its existing owner contract. Numeric declared limit rows use computer_ceiling through Settings/runtime
  admission; Reduce motion keeps its separate Everywhere/Device/Project plus OS rule.


  Agent Everywhere writes in Regular require a real current confirmation (agent_everywhere_needs_confirmation
  when absent); requested or Everywhere-only task YOLO uses the same preview/CAS/writer checks and true mode
  provenance. no_project_context applies only when the operation actually requires a real Project. settings.follow
  permits reading the Everywhere mirror and submitting only the peer own Computer mirror, never an owner Client
  write session, Project content or dispatch. settings.everywhere.write requires the authenticated owner Client
  direct current settings-home session; it cannot be relayed over peer/tailnet trust. Limited/Member devices
  may edit only their own offered screen values and explicitly admitted Project scope, never Computer/Everywhere.
  Account choice reuses only the selected destination-local account/connection evidence; protected sign-in/profile
  operations remain human, and copied refs or ready-but-unchosen accounts grant no authority.


  Permission profiles/rules are owner things with explicit home/reach, whole Project versions and scope_model/project_switch_ids
  descriptors under SSYS-061/062; list only actual owner-declared switches. The ordinary safety.rules.permission-preset
  and safety.protection.filesafe-integration rows choose effective policy and never duplicate a profile body,
  create another manager or become trust/install authority. Persona/MCP/Skill/Plugin/command copying cannot
  relax protected built-ins or widen child/plugin/receiver ceilings. cmd.permissions.create_computer_rule
  has sole planned handler handlers::permissions::create_computer_rule and the computer_rule_create_request/computer_rule_create_result
  definitions in Plans/automation_authority_contracts.schema.json. SP-353 owns Computer-rule physical custody;
  a request/result shape is not a canonical rule/source record. Missing immutable permission_rule_computer
  record/source materialization keeps durable dispatch unavailable. A Project-specific agent task cannot silently
  become an Everywhere request; a human row edit still defaults to its actual origin.'
gui_related: true
gui_classification_reason: Approval cards, scope selection, live action targets and recovery controls are
  user-visible.
depends_on:
- PS-017
- PS-019
unblocks: []
acceptance_criteria:
- Both built-in profile values select the declared careful order; custom-vs-set uses Computer own and reports
  why.
- Computer rules survive restart at their sole writer; same-revision races refuse without overwrite; no-project
  creates no orphan Project rule.
- YOLO skips only the ordinary requested Everywhere yes, never source-loosening acceptance or durable Always
  choice.
- A copied owner rule/profile rechecks origin, target and permission and rolls back through the owner; path/credential
  entries never become Everywhere.
- Profile/rule whole-copy descriptors retain declared switches and owner readback/rollback without copying
  trust, installation, protected built-ins or child/plugin/receiver authority.
validation_surfaces:
- 'Phase 2: owner/companion semantic fixtures and exact positive/negative checks in D-requests.md.'
- 'Phase 2: python3 scripts/pm-projects-refresh-contracts.py (F deliverable; not run in phase 1).'
- 'Phase 2: python3 scripts/pm-plan-index.py validate; static success is not native execution proof.'
risk_class: authority_scope_and_target_drift
reasoning_tier: high
context_scope: project_refresh_permissions_and_automation
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards S3/S8/S13/S15/S16
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "I approve the outstanding
  questions with their recommended settings."'
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards approval envelope
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "I approve the outstanding
  questions with their recommended settings."'
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-D04
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fb-requests.md#Fb-D01
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#Fc-D01
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fd-requests.md#Fd-D01
preserved_exact_tokens:
- Computer
- Everywhere
- This project
- This computer
- more_careful
- per_item
- create_computer_rule
- safety.protection.external-dir-allowlist
- global
- careful_order
- computer_ceiling
- safety.rules.default-tool-permission
- safety.approvals.doom-loop-action
- safety.protection.external-dir-action
- agent_everywhere_needs_confirmation
- no_project_context
- settings.follow
- settings.everywhere.write
- scope_model
- project_switch_ids
- safety.rules.permission-preset
- safety.protection.filesafe-integration
- permission_rule_computer
negative_constraints:
- Do not move Computer paths or credential bytes in Settings copies, mirrors, previews or exports.
- Do not infer S15 acceptance from executable trust, a clone, a build grant or YOLO.
- Do not reorder individual permission matching by treating all rules as the safety-profile row.
- Acceptance of this specification creates no native handler, active EventRecord producer, WorkNode, NodeSeed,
  executable queue, production build task, readiness certification or governance seal.
owner_hints:
- Plans/Permissions_System.md
```

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Settings_System.md#SSYS-061, ContractName:Plans/Settings_System.md#SSYS-062, ContractName:Plans/storage-plan.md#SP-353

### PS-145 - Application Permission Evidence, Roots And Cross-Project Requests

```yaml
plan_unit_id: PS-145
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: 'Application chat, Goal, Crew, Plan/Deep Plan and scheduled message/task execution use scope_kind=application,
  project_id=null and scope_partition=app with real thread and owning Server/Computer plus the actual run,
  Host/Environment, actor/account and recorded roots required by that operation. Pure conversation/internal
  planning may have an empty admitted-root set and null cwd; this never launches a process or falls back to
  HOME/CWD/main. No visible Project, empty string, fake node or scratch Project supplies missing identity.
  Only Planning Wizard, PRD Builder and Orchestrator retain no-project workflow gates; an operation intrinsically
  targeting a real Project still requires that target. Availability alone never authorizes execution. Plan/Deep
  Plan remain read-only toward task files/system settings while their own Plan/To-Do/ledger records use admitted
  owner commands.


  The original Project permission_snapshot_record.v1 payload and hash inputs remain exact. Introduce a separately
  versioned ApplicationPermissionSnapshot with snapshot_id, real thread/run and operation/attempt where actually
  present, tagged Computer/Host/Environment, immutable root identities and root-grant revision, requested/effective
  mode and account bindings, actor/surface/runtime/decision context, resolved permission evidence, target/currentness
  refs, source receipt/event ref, redaction/integrity and policy/Stop generations. Node/package/seam/lane
  fields exist only for real owners. Commit the evidence before mutation-capable run/attempt admission; audit
  failure blocks dispatch. Storage owns its explicit app key family, retention/backup and single writer; never
  interpolate an empty Project into the v1 key or reconstruct history from current Settings. App ordinary
  tool asks use a distinct thread/tool/request/target-bound approval contract (candidate approval.chat_tool_requested/resolved)
  through the shared approval host; do not null required node fields in Orchestrator approval payloads or
  reuse cmd.runtime.approve without a typed app variant.


  Working roots are the chat''s lazy visible folder and exact places admitted Read and change for this chat.
  A Read only grant creates no write root. `external_directory` uses existing root/allowlist and configured
  allow/ask/deny, default ask, in Regular and YOLO. FileSafe On permits task-needed listed home-folder reads
  without the extra outside-root ask only after normalized identity and exclusions: all registered Project
  folders wherever stored, PM private data including every .puppet-master area, secrets/.env/key/certificate
  files, cloud/service/AI sign-in roots, browser profiles, mail, keychains and password managers are excluded.
  FileSafe Off removes the freer home-read exception. The exception authorizes neither hidden Desktop/Downloads
  scanning nor a root probe, write, trust expansion or cleanup. Raw PM-data file access remains denied; admitted
  owner commands may create their own scoped Goal/Plan/history/permission records. Reads/changes show actual
  Computer and paths in Activity under redaction policy. Clean workspace requires one exact admitted directory
  and refuses home, broad mounts and escapes.


  Changes outside the chat folder ask in Regular and need an admitted root in every mode. `system_change`
  asks in Regular with no durable Always; YOLO skips only the ordinary tool ask once roots, OS authority,
  DAE, FileSafe and domain guards admit the exact command. A registered Project is never directly writable
  from outside its scope, even with an external-directory yes; ask its chat or explicitly convert this one.
  App raw git/jj in a chat folder has its actual ad-hoc repository identity and PS-146 rights, not PM Project
  worktree authority.


  Permissions keys are: `other_projects_read` (Regular ask once per chat, explicit requested Project set;
  Everywhere/Computer defaults), `other_projects_message` (Regular each exact send, scoped Allow for this
  chat), `incoming_chat_messages` (receiving Project Ask me/allowed/Off), `computer_use` (Computer only, per-chat/per-app
  task admission), `outward_after_cross_project_read` (Regular ask; scoped chat grant only), `system_change`
  (Regular ask, no Always), plus existing `external_directory`. Map other_projects_read once to `safety.rules.cross-project-read-policy`,
  incoming_chat_messages to `safety.rules.incoming-chat-messages`, computer_use to `safety.rules.computer-use`,
  and external_directory to the existing safety.protection.external-dir-action and safety.protection.external-dir-allowlist.
  The separate source Project row `safety.rules.allow-project-reading` is on by default and can refuse. Send/outward/system-change
  decisions keep their actual owner scope; no extra scalar row is invented. These are the category-preserving
  canonical inventory names. The earlier assistant.cross-project.* spellings are source-lineage proposals
  only, never write aliases, extra rows or parallel permission stores.


  Every chat may explicitly list/read/request other accessible Projects. projects.list exposes authorized
  names/status only; reading Off reduces the entry to name only. Content uses the source Computer and each
  source''s current access, Off, sensitivity and exposure checks; no notebooks, private memory, safe copies
  or secrets are cross-readable. Regular consent offers This time/For this chat/Always on this computer/No;
  a human naming or mentioning a Project grants only that named read. Task YOLO records scoped mode authority
  for explicit named/all task scope, never ambient retrieval or forged human consent. Every read is listed
  and uses the shared requested/looked_in/not_looked_in/partial coverage. Offline, inaccessible, archived-unless-named
  and missing/rebuilding indexes report omissions; no silent focus fallback or false global none.


  thread.request/spawn/await retain one bounded task, source/target lineage, per-thread ordering, idempotency
  and at most three automatic round trips. The sender''s mode governs Send; the receiver''s own current mode/ceiling
  and incoming Off/Ask me policy govern work. A human-reviewed exact send satisfies receiving Ask me only
  for that request; a YOLO send is not human-reviewed. An unseen Regular Ask me request waits for Accept and
  is read/answer-only until accepted; a YOLO receiver can skip its ordinary accept/N18 asks. Off refuses in
  all modes. A message cannot answer an approval, alter settings/mode or transfer a grant. Replies retain
  their own sender authority. No automatic Continue resets the three-round-trip budget. Starting another Project''s
  Goal uses a request to that Project''s chat.


  Once another Project was read, Regular outward actions (web open/form/network command/send/screen) require
  the provenance-aware ask; plain searches remain listed. YOLO skips that extra outward ask for its task,
  including ordinary push/publication, but retains provenance, actual network authorization, body/destination
  currentness, FileSafe transfer, secrets and provider disclosure. No wrapper revives a generic publication
  yes. computer_use requires the exact named supported desktop and permitted apps, a current scoped screen/provider
  disclosure grant and scrub, protected-auth/password exclusion, visible using-screen strip and Stop/double-Esc.
  YOLO skips only ordinary tool asks and cannot silently widen apps/Computer or create disclosure authority.
  No admitted DAE-safe path means unavailable.


  N27 permits a YOLO agent to invoke the same conversion owner only when the task clearly selects new Project
  or names the existing destination and a fresh exact preview/authority join is valid. Ambiguous convert this
  still asks which destination. Regular''s final apply remains person-driven. Statement, preview, per-effect
  gates, report and Undo remain; main is never the YOLO default. N25 issues fresh destination permission/root/mode/Stop
  evidence and linked new Goal/Plan/Crew records or a separately owner-admitted rebind; old immutable evidence
  is never relabelled. Schedules freeze scope/target/text/version/mode and revalidate at actual timer dispatch
  and conversion; missing evidence/Stop custody holds work. No source-folder grant, source YOLO, approval,
  build grant or pause clearance transfers to the destination.


  An unregistered setup source may be inspected read-only under its real source_context/draft/operation identity
  and exact Computer/Host/Environment/transport, without inventing a Project lease or chat/run/node. Its bounded
  read/audit receipt is distinct from the app mutation snapshot required before execution. Inspection cannot
  run hooks/filters/helpers or create a Jujutsu snapshot, bind an observed origin, accept a fingerprint from
  display text, write files or confer execution/trust authority. Starter source read/secret scan and destination
  copy each have exact manifests, roots and separate permission/FileSafe evidence; symlink escapes, secrets
  and unreviewed overwrite refuse. source_location.test/update only repoints after verified identity; project.move.*
  owns file movement and cleanup. SSH trust/key-install remains at the shared Server/SSH/Auth owner with protected
  identity, never a concept alias or cmd.project.ssh route. Conversion, source trust and copied account refs
  transfer no root/disclosure/build authority.


  Goal objective authority remains user_direct|agent_proposed_user_approved at its existing Goal owner: direct
  Save is a current person action and an agent proposal requires the exact approved change. Goal birth is
  explicit. YOLO, a read grant, incoming message, schedule or build grant never supplies objective-rewrite
  or Goal-creation authority on its own.


  CV-365 WorkflowScopeV2 and CV-366 select ApplicationPermissionSnapshot and ChatToolApprovalApplicationV1
  in Plans/application_workflow_contracts.schema.json, with complete original-source/wrapper/hash joins through
  Plans/application_workflow_sources.schema.json and the selected source graph. SP-353 owns permission_snapshot_record_application
  and chat_tool_approval_application physical custody, single writer and audit/backup/retention. Original
  Project snapshot/source/cancellation resources remain byte/hash exact. Neither client booleans, current
  Settings, projections nor restored stale evidence authenticate current authority; missing original source
  or materialization refuses dispatch. Canonical permission/tool decisions and required source evidence retain
  their independent holds after chat Undo expiry.


  The six explicit T-185 projects.* read tools share this policy; omitted scope means neither current Project
  nor all Projects. A named file grants only that subject. Recheck source access/Off, phase/retention, normalized
  path/content sensitivity and disclosure before each read and again before provider exposure. Discovery exposes
  no inaccessible existence, private store or service/Stop/control authority. The three automatic round trips
  may be extended only by a fresh person decision. Preview is ui.thread.request.preview/ui.thread.spawn.preview,
  a local redacted projection; existing cmd.thread.request/cmd.thread.spawn keep their sole continuity handlers
  and outbox. CV-365 owns the captured preview/send join; send validates actual source/receiver authority
  immediately before durable commit.


  computer_use is off until exact task/chat/app/Computer admission. It consumes the closed T-186 executable
  census computer.screen, computer.pointer and computer.keys, with their sole Tools handlers and versioned
  request/result definitions; computer.* is only a family selector. The current ActiveToolNamespaceReceipt,
  supported adapter/provider/model/session, schema hashes, desktop/controller lease and generation, observation/app/window
  geometry, permission/disclosure and Stop must join before capture or input. Protected sign-in/browser/password
  and terminal secret surfaces are excluded before capture as well as input; a path unable to enforce that
  boundary is unavailable. Scrubbed screen pictures are transient scoped provider inputs, absent from chat
  history, evidence, exports and backups; bounded redacted action/target/outcome audit remains. Visible Stop
  and double Esc call only cmd.computer_use.stop through handlers::computer_use::stop, fencing that controller
  generation, cancelling its queued input and releasing only its own authority. No fourth computer.stop tool,
  global mouse control or fabricated native namespace is admitted. Sends, purchases, installs, deletion, publication
  and system changes still require exact effect authority; an unclassifiable effect cannot dispatch through
  a generic click or key.


  The same guarded N27 agent admission covers conversion Resume/Cancel and requested Undo for the clear new/existing
  destination and current visible preview; it calls the registered owner directly, never a person-only button
  or retained-approval control. Make a project from this chat and Move this chat into a project retain their
  separate-draft/Keep both defaults, unsaved-file blocks, source/destination writer/lease/root/Stop checks
  and exact report. Undo ends at new work or seven days, cannot delete changed work and never deletes remote
  repositories, branches or backups. CV-367/SP-350 own the exhaustive N25 manifest and linked new Goal/Plan/Crew
  records; optional explicit association rebind stays unavailable until its separate complete owner protocol
  is admitted.


  Delayed work freezes requested mode/model/account/configuration and exact text/attachments or Plan version/hash;
  committing a schedule creates no standing permission or current-view YOLO authority. Scheduling-window,
  quota-resume and continuation admission recheck original owner/source evidence, actual target/Computer/roots,
  account/capability, receiver/parent ceiling, storage writer and task plus scope user_stop_epoch at eligibility
  and immediately before effect. A saved Ask me first hold remains in YOLO. CV-368/SP-352 and SQR-019/020
  own the independent Server application pause, application_automation_paused and app_automation_pause_unavailable;
  absent/corrupt pause is unavailable, never off or a Settings seed. Only the authenticated user changes or
  clears pause through cmd.runtime.automation_pause.set; paused=false clears no task latch. Agent work, a
  new schedule, conversion, quota/window or reconnect cannot clear either app or Project pause. The exact
  SQR direct-user Send now/Build/resume exception admits only its one dispatch with every other guard and
  the stored pause unchanged. Conversion retains holds/per-run Stop and both scope epochs, then explicitly
  re-admits exact destination targets/text/time/consent; no latest-version, other-account or source-grant
  substitution.


  SSH host trust/public-key installation consumes the exact protected Server/Remote Access protocol owned
  by A; absent selected contract or native authority is typed unavailable, never an inferred remote key writer
  behind an integration.connection.* or Client-pairing alias.'
gui_related: true
gui_classification_reason: Approval cards, scope selection, live action targets and recovery controls are
  user-visible.
depends_on:
- PS-144
- PS-017
- PS-019
unblocks: []
acceptance_criteria:
- App Goal/Crew/Plan/scheduled task uses actual roots and immutable app evidence; original Project exact fixtures
  remain valid.
- FileSafe-on explicit home reads succeed only through exclusions; FileSafe-off, symlink-to-Project/PM/credential,
  unknown roots and forbidden direct writes fail.
- Regular/YOLO sender-receiver combinations preserve Off, true human review, bounded requests, three trips
  and listed coverage.
- Named supported desktop with valid disclosure is admitted; protected auth, changed provider/apps/Computer
  or unavailable DAE path refuses.
- N27 exact clear destination can apply with fresh preview; ambiguous/stale/destination-unauthorized cases
  do not execute or transfer grants.
- Delayed work uses frozen configuration plus fresh original-source/target/root evidence at eligibility and
  dispatch; saved Ask me first, unavailable pause and task/scope Stop block even under YOLO.
- Only the user changes pause or takes the exact one-dispatch SQR exception; conversion never clears holds,
  substitutes a Plan/account, borrows a grant or repeats a source occurrence.
- Closed T-186 tools refuse wrong app/window/controller/observation, unsupported namespace or protected capture/input;
  Stop/double Esc fences only the admitted session.
validation_surfaces:
- 'Phase 2: owner/companion semantic fixtures and exact positive/negative checks in D-requests.md.'
- 'Phase 2: python3 scripts/pm-projects-refresh-contracts.py (F deliverable; not run in phase 1).'
- 'Phase 2: python3 scripts/pm-plan-index.py validate; static success is not native execution proof.'
risk_class: authority_scope_and_target_drift
reasoning_tier: high
context_scope: project_refresh_permissions_and_automation
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards N3/N4/N6/N10/N18/N19/N24/N25/N27;
  Q11 and N21/N22 reversal
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "Plan mode and scheduled
  tasks are also available in no project. It''s only planning wizard/prd builder/orchestrator that isn''t."'
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards approval envelope
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "I approve the outstanding
  questions with their recommended settings."'
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards Q11
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "Those look good,
  except goals and crew should be allowed in no project."'
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-D01
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-D02
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-D03
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-D01
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-D02
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-D03
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-D05
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fb-requests.md#Fb-D01
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#Fc-D01
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#Fc-Fb01
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#Fc-Fd03
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#Fc-Fd04
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fd-requests.md#Fd-D01
preserved_exact_tokens:
- scope_kind=application
- project_id=null
- scope_partition=app
- ApplicationPermissionSnapshot
- external_directory
- other_projects_read
- other_projects_message
- incoming_chat_messages
- computer_use
- outward_after_cross_project_read
- system_change
- approval.chat_tool_requested/resolved
- This time
- For this chat
- Always on this computer
- Read and change
- Read only
- thread.request/spawn/await
- N27
- N25
- safety.rules.cross-project-read-policy
- safety.rules.incoming-chat-messages
- safety.rules.allow-project-reading
- safety.rules.computer-use
- user_direct|agent_proposed_user_approved
- ChatToolApprovalApplicationV1
- ActiveToolNamespaceReceipt
- computer.screen
- computer.pointer
- computer.keys
- cmd.computer_use.stop
- Keep both
- seven days
- user_stop_epoch
- Ask me first
- application_automation_paused
- app_automation_pause_unavailable
- paused=false
negative_constraints:
- No hidden cross-project index, memory or notebook sharing.
- No fake Project/node/empty-string identity and no mutation by raw PM private-data access.
- No outside-root mode bypass, image-disclosure fabrication, receiver-mode escalation or approval through
  a message.
- No schedule, conversion or reconnect may clear a Stop/pause or reinterpret historical approval as destination
  authority.
- Acceptance of this specification creates no native handler, active EventRecord producer, WorkNode, NodeSeed,
  executable queue, production build task, readiness certification or governance seal.
owner_hints:
- Plans/Permissions_System.md
```

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#CV-365, ContractName:Plans/Contracts_V0.md#CV-366, ContractName:Plans/Contracts_V0.md#CV-367, ContractName:Plans/Contracts_V0.md#CV-368, ContractName:Plans/storage-plan.md#SP-353, ContractName:Plans/storage-plan.md#SP-352, ContractName:Plans/Tools.md#T-185, ContractName:Plans/Tools.md#T-186, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-019, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-020

### PS-146 - YOLO Publication And Y1 Leased Force-Push

```yaml
plan_unit_id: PS-146
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: 'Jared''s ruling is verbatim: "YOLO mode needs to absolutely be able to git push and publish."
  In an otherwise admitted task, yolo authorizes ordinary Git/Jujutsu remote push, package/image/template publication
  and the needed remote repository creation without an extra publication yes. Regular retains its exact-effect
  approvals. Each create/push/publish remains a distinct domain operation through the same owner writer, preflight
  and result path; local Build approval, a toggle, authentication and a selected repository are not authority
  by themselves. A clearly requested Everywhere settings write uses PS-144 ordinary mode authority, not an
  implicit global Always.


  external_publish_side_effect remains evaluated but no longer imposes a universal human click: ordinary yolo
  publication records policy auto-allow/authority_kind=mode, task/snapshot/mode/target refs and actual executing
  subsystem/account/credential handle. No human_confirmed=true or invented approver encodes that decision.
  Exact destination, service admission, namespace/repository, visibility/private-most default, source/disclosure,
  account/auth/provider capability, expected heads/currentness, DAE, FileSafe, network/transfer and secret/trust
  checks remain. A needed missing-repository create must be explicit in the preview/report and separately admitted;
  it need not stop for another human click in YOLO. No outgoing-after-read or container/forge wrapper restores
  the ordinary publication ask.


  Y1 is accepted as recommended: force-push is eligible without another ordinary approval only with an explicit
  expected-head lease on a branch PM created for this work. Bind actual Computer/Host/repo/remote/branch, creation
  receipt/task lineage and current remote head, enforce force-with-lease at execution, and refuse a lost lease.
  The branch cannot be main, the actual default branch or protected; no build grant widens that exclusion.
  A same-named branch, an imported branch or a branch PM made for unrelated work is not eligible. No --force-only
  fallback, stale lease reuse or automatic branch retarget is allowed.


  Prune, remote branch/repository deletion, destructive discard and Kubernetes delete/exec still ask with exact
  targets in ordinary YOLO, unless a separately human-approved PS-147 grant covers the exact operation on demonstrably
  grant-created resources. Other domain-sensitive actions keep their own authority class; secrets, protected
  auth/trust, durable Always and paid signup remain person decisions. Named pre-existing resources do not receive
  the created-resource risky-action exception. FileSafe still independently admits or refuses every command/resource
  action; do not remove destructive patterns or approved-command boundaries to make Y1 work.


  Receipts/report retain targets, effective authority, checks, local results and actual remote success/failure/indeterminate
  state. Lost confirmation reconciles actual remote state before retry; it never repeats a speculative create/push
  or marks success from transport alone. Stop prevents new dispatch; in-flight remote effects are reported
  honestly. No safe inverse means the action says No safe Undo; any true inverse goes through fresh target/currentness
  and retained guards.'
gui_related: true
gui_classification_reason: Approval cards, scope selection, live action targets and recovery controls are user-visible.
depends_on:
- PS-144
- PS-145
- PS-017
- PS-019
unblocks: []
acceptance_criteria:
- Regular asks and YOLO ordinary Git/package/image/template publish/needed repo creation proceed without redundant
  approval.
- PM-created work branch plus exact current lease succeeds; foreign/default/protected/main/unrelated branch
  or lost lease refuses before effect.
- 'Absent grant: prune, remote delete, discard and Kubernetes delete/exec still ask; changed target invalidates
  authority.'
- Mode receipts record no fabricated human confirmation; unknown remote outcomes reconcile before retry.
validation_surfaces:
- 'Phase 2: owner/companion semantic fixtures and exact positive/negative checks in D-requests.md.'
- 'Phase 2: python3 scripts/pm-projects-refresh-contracts.py (F deliverable; not run in phase 1).'
- 'Phase 2: python3 scripts/pm-plan-index.py validate; static success is not native execution proof.'
risk_class: authority_scope_and_target_drift
reasoning_tier: high
context_scope: project_refresh_permissions_and_automation
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards Y1; push/publish ruling; O1–O3
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "YOLO mode needs to
  absolutely be able to git push and publish."'
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards approval envelope
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "I approve the outstanding
  questions with their recommended settings."'
- 'source_ref:chat:lane-D-phase-1-instruction; Jared: "The other risky actions still ask, unless they fall
  inside an approved build grant over things the build itself created."'
preserved_exact_tokens:
- YOLO mode needs to absolutely be able to git push and publish.
- external_publish_side_effect
- policy auto-allow
- authority_kind=mode
- human_confirmed=true
- force-with-lease
- Y1
- No safe Undo
negative_constraints:
- No generic tool allow, headless default or Full profile is substitute for target/capability/domain authority.
- No main/default/protected force-push under mode or build grant.
- No blanket removal of destructive FileSafe patterns or path/secret/trust boundaries.
- Acceptance of this specification creates no native handler, active EventRecord producer, WorkNode, NodeSeed,
  executable queue, production build task, readiness certification or governance seal.
owner_hints:
- Plans/Permissions_System.md
```

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

### PS-147 - Plan-Bound Hands-Off Orchestrator Build Grant

```yaml
plan_unit_id: PS-147
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: 'O1–O3 approve a build grant once at exact human Plan approval for a Project-bound Planning
  Wizard/Orchestrator build. The review lists the repositories to create/push, registry namespaces/package/image/template
  destinations, CI configuration/execution and deployment targets with allowed operations. It also lists exclusions,
  risky cleanup eligibility and actions with no safe Undo. Approval of a Plan alone is not an unbounded grant:
  the person must approve the exact manifest. The Orchestrator then runs yolo within that grant without repeating
  ordinary per-action human clicks. Application chat Goals/Crew/Assistant Plan builds and schedules cannot
  issue a Project Orchestrator grant or obtain one through a message.


  A BuildGrant binds grant_id and revision, actual issuing person and auth context/time, project_id, named_plan_id
  plus exact approved revision/hash, reserved build_run_id, scope/Computer/Host/Environment/route/account,
  allowed operation classes and typed stable target/resource selectors, permission snapshot and policy generation,
  validity/expiry when set, revocation generation and current user Stop epoch. A new-resource selector names
  exact provider/instance/account/parent container/namespace/name and creation constraints; it is not a wildcard
  for all future resources. A named existing resource binds immutable ID and only its listed permissible operations.
  Namespace grants enumerate allowed child kinds and operations; membership or a name prefix grants nothing.
  The permission snapshot and grant digest must be committed before build admission. Plan, target, account,
  permission ceiling or grant drift cannot widen authority; invalidated evidence blocks for refresh/review
  and any expansion requires another human decision.


  Permissions is the sole grant writer. Canonical commands are cmd.build_grant.preview, cmd.build_grant.approve
  and cmd.build_grant.revoke with sole planned handlers handlers::permissions::build_grant_preview, handlers::permissions::build_grant_approve
  and handlers::permissions::build_grant_revoke. Preview is read-only and returns exact manifest/ref/hash/owner
  revisions, exclusions and blockers. Approve binds that current preview, current approved Plan/hash/build
  identity, expected grant-absence/revision CAS, issuer and idempotency key; it is human-only, including expansion.
  Revoke targets grant_id/revision under current actor authority, records revocation and fences all future
  child/provider dispatch. Existing run-owner Start/Stop/abort commands remain the execution controls; no
  second build runner or stop engine is introduced. Agent requests may prepare a preview but cannot resolve
  their own protected approval, issue, expand, renew or un-revoke the grant.


  Each actual successful create appends a CreatedResourceManifest entry joined to the exact grant/build/task/operation
  receipt: provider/instance/account/parent, stable immutable resource ID/UID and generation, creation time,
  idempotency identity and verified result evidence. A failed or unknown create is not ownership proof; reconcile
  before adoption/retry. Pre-existing resources and a same-named replacement remain unowned regardless of
  selector or prefix. Observe identity/generation immediately before mutation/cleanup; replacement, owner
  drift, unknown provenance, user modification or other references/holds refuse the claimed automatic cleanup.


  The grant can change its exact listed resources and delete only what the build itself demonstrably created.
  The retained Y1 risky actions—prune, remote branch/repository delete, destructive discard and Kubernetes
  delete/exec—avoid another ask only when that exact operation and verified grant-created object are inside
  the approved grant. A named pre-existing target may receive listed non-destructive build/deploy operations,
  but it never receives that risky-action exception. Broad Docker/system/registry prune cannot become a closed
  owned-resource cleanup by naming a namespace. There is no failure-setup or conversion-Undo automatic remote-repository
  deletion, no unrelated Project/environment mutation, no main/default/protected force-push, no secret value
  exposure or Recovery Kit export, no protected sign-in/trust/claim/Always bypass, no paid signup or human-only
  Azure team-project administration. Existing credentials may be consumed only as already-admitted opaque
  references under their owner; the grant never acquires or exports secret bytes.


  Every coordinator, task/child admission and final local/remote effect checks exact grant/Plan/build/task/target/permission/ownership
  generations, parent ceiling and Stop/revocation epoch. Children receive at most their exact subset and cannot
  transfer authority to another Project/run/chat or broaden selectors. Logical operation idempotency binds
  exact operation/target/request under the grant; original historical receipts remain fixed and cannot re-authorize
  an attempt after drift. A remote indeterminate outcome reconciles before repeating work. Stop/revoke races
  fence new effects and late completions remain truthful rather than erased or re-executed.


  O3''s live What the build did list is an existing ObservableWork/History projection of every remote action
  and target, authority, outcome, time and linked owner receipt. It also exposes pending/blocked/unknown effects,
  Stop and available true Undo or explicitly labelled compensation/No safe Undo. It is not a new parallel
  action log or inferred build.* event family. Undo itself requires exact currentness/ownership/permission;
  revoking or stopping does not delete resources or reverse completed external actions. End-of-run YOLO scans/reconciliation
  and required verification still run. Static grant schemas/fixtures do not certify a native build, provider
  path or resource-ownership proof.


  The Project Home Server Permissions owner holds the canonical grant, ownership manifest and authority-receipt
  references in the Project Vault under Storage-registered versioned families. These records are not disposable
  projections and must be included coherently in Project Backup and retained with build/audit/recovery holds.
  A restored grant is historical until the current owner, Plan, permission generation and Stop/revocation
  checks re-admit it; backup restore never resurrects an active grant by itself.


  SP-353 is the sole physical owner for build_grant, created_resource_manifest and grant_revocation, referring
  to selected Permissions bodies and actual original authority sources. Missing immutable grant_revocation
  record/source materialization keeps that dispatch path unavailable; command request/result shapes or restored
  stale grants cannot substitute for current revocation authority. These records and required receipt/source
  refs retain independent audit/backup/hold lifetimes after chat conversion or Undo expiry.'
gui_related: true
gui_classification_reason: Approval cards, scope selection, live action targets and recovery controls are
  user-visible.
depends_on:
- PS-146
- PS-144
- PS-145
unblocks: []
acceptance_criteria:
- An exact approved Plan/grant admits listed repo/registry/CI/deployment operations without repeated human
  clicks.
- Grant-created exact object cleanup succeeds; pre-existing, same-name replacement, unrelated namespace/registry/repo,
  unlisted child kind and broad prune refuse.
- Plan/account/target/permission/Stop/revocation drift prevents effect and cannot be repaired by an agent
  widening authority.
- Children cannot mint grants or exceed parent/resource subsets; app Goal/Crew/Plan/schedule and cross-project
  messages cannot adopt a Project grant.
- Unknown create/push is reconciled before retry; action projection includes actual target/authority and no
  unsafe invented Undo.
validation_surfaces:
- 'Phase 2: owner/companion semantic fixtures and exact positive/negative checks in D-requests.md.'
- 'Phase 2: python3 scripts/pm-projects-refresh-contracts.py (F deliverable; not run in phase 1).'
- 'Phase 2: python3 scripts/pm-plan-index.py validate; static success is not native execution proof.'
risk_class: authority_scope_and_target_drift
reasoning_tier: high
context_scope: project_refresh_permissions_and_automation
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards O1/O2/O3; Y1
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "Isnt orchestrator
  going to need a lot of permissions to fully build an entire platform from plans that the planning wizard
  makes? Its hands off from the human in that process so I would think so."'
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards approval envelope
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "I approve the outstanding
  questions with their recommended settings."'
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards Y1
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "YOLO mode needs
  to absolutely be able to git push and publish."'
- 'source_ref:chat:lane-D-phase-1-instruction; Jared: "The other risky actions still ask, unless they fall
  inside an approved build grant over things the build itself created."'
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-D04
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fb-requests.md#Fb-D01
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#Fc-D01
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fd-requests.md#Fd-D01
preserved_exact_tokens:
- BuildGrant
- CreatedResourceManifest
- cmd.build_grant.preview
- cmd.build_grant.approve
- cmd.build_grant.revoke
- What the build did
- ObservableWork/History
- No safe Undo
- O1–O3
- grant_revocation
negative_constraints:
- No agent may issue, expand, renew or un-revoke its own grant.
- No prefix, namespace membership, discovered capability or name proves grant-created ownership.
- No risky pre-existing-resource exception, unrelated resource deletion, secret/trust/paid-signup bypass or
  automatic setup/Undo repository deletion.
- No build grant changes mandatory DAE, FileSafe, testing, custody, backup or recovery holds.
- Acceptance of this specification creates no native handler, active EventRecord producer, WorkNode, NodeSeed,
  executable queue, production build task, readiness certification or governance seal.
owner_hints:
- Plans/Permissions_System.md
```

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/storage-plan.md#SP-353

### PS-148 - Single Automation Admission And Authority Intersection

```yaml
plan_unit_id: PS-148
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: 'All tool, domain, CLI/DAE interception, child, scheduled and remote-effect dispatch uses
  one Permissions admission pipeline, policy.may_execute_tool(), on finalized operation context. Select a
  legitimate authority source—actual human decision, scoped mode authority under PS-146, or a previously human-approved
  PS-147 build grant—then intersect runtime/profile/Managed/parent/receiver ceilings, target/resource ownership,
  capability/account/auth/route, root/trust/FileSafe/DAE, actual network/body disclosure, currentness, storage
  integrity/writer and Stop/pause/revocation gates. Hook changes and final remote target/body changes require
  revalidation before effect. A broad mode/profile/default or a receipt from another task does not substitute
  for those independent joins.


  Only ordinary asks covered by the exact mode/grant are skipped. Y1 risky actions retain PS-146 asks except
  for the exact grant-created-resource exception. Grant issuance/expansion, durable Always, S15 source loosening,
  protected secrets/auth/trust/claim, screen/provider disclosure and paid signup stay human decisions. Source
  Project Off and receiver read-only/Regular ceilings are never widened by the sender. An app Goal, Crew,
  Plan build or schedule uses its own immutable app authority and roots; duration/delegation/scheduling does
  not mint a Project grant. A timer uses its frozen scope/target/configuration plus fresh actual eligibility,
  not the visible chat''s mode. Conversion retires source dispatch and reissues destination authority under
  N25/N27, retaining both source and destination Stop/pause fences; it never auto-resumes.


  The immutable decision/dispatch receipt identifies authority_kind=human|mode|build_grant with the real human
  decision or mode/task/snapshot or grant/issuer/revision reference. Keep approval_source compatibility values
  and add versioned provenance rather than rewriting old exact codecs. Human confirmation is never fabricated.
  Out-of-scope actions stop before effect with blocked_policy/blocked_approval/blocked_preflight as appropriate,
  canonical blocked_reason_code and ordered allowed_action_ids[], exact target and executed=false. A headless
  retained ask blocks with headless_ask_denied; absent handler/admitted contract/capability stays handler_unavailable
  or its existing closed owner reason. Typed app tool approval and Orchestrator blocked-node approval remain
  distinct envelopes through the same host.


  Stop/revocation is enforced at every child admission and immediately before each new external effect. In-flight
  outcomes and reconciliation retain truth and original idempotency; neither cancellation, reconnection, a
  fresh setting nor projection replay clears a recovery hold, grants new authority or rewrites history. Ordinary
  publication admitted under YOLO is not blocked again by a domain wrapper seeking another generic yes. No
  static schema, browser/concept or fixture boolean proves native authority joins or execution.


  Backup first-policy creation consumes the Backup owner absent-key CAS/current preview and confers no backup-completed,
  repository-initialization, unlock, restore or prune authority. Archive pause is an owner-routed schedule
  consequence and never destructive maintenance. Recovery Kit Save/Copy/Print/Test and secret export, protected
  auth, paid account signup and ADO-008 external team-project administration remain person-owned even inside
  an approved build. New UI results preserve the exact initiating Client/invocation/return context and continuation
  generation; Back/Close is not cancellation of an already dispatched effect. New/changed commands remain
  handler_unavailable until actual native admission; declared expected_event_types=[] or a static fixture
  never invents a live producer.


  CV-365/366 provide the selected scope, complete original-source/wrapper/hash graph and immutable app authority
  edition; SP-353 owns its physical custody, not another permission resolver. Only actual Project Orchestrator
  children inherit a narrowed BuildGrant subset. App/child/receiver work cannot borrow a foreign grant or
  turn restored evidence into current authority. Goal user_direct|agent_proposed_user_approved objective authority,
  S15 acceptance and every retained person decision remain separate from ordinary mode allow.


  Delayed app Goal/Crew/Plan/message/task work uses the frozen request plus fresh PS-145 admission at owner
  eligibility and immediately before effect, including actual task/scope user_stop_epoch, roots, account,
  permission/writer and receiver/parent ceiling. Saved Ask me first remains a hold in YOLO. CV-368/SP-352
  and SQR-019/020 own the independent Server app pause and exact one-dispatch direct-user exception; only
  a real user may change or clear pause. application_automation_paused blocks and app_automation_pause_unavailable
  fails closed, never treating missing custody as paused=false. Neither the exception nor a false clear erases
  task latches or source/destination holds. Conversion explicitly re-admits the exact destination target/version,
  consent and both scope epochs without borrowing current-view mode, another account or old authority.'
gui_related: false
gui_classification_reason: Defines permission, scope, admission and recovery policy consumed by UI owners.
depends_on:
- PS-144
- PS-145
- PS-146
- PS-147
- PS-017
- PS-019
unblocks: []
acceptance_criteria:
- All entry surfaces reach identical authority/guard outcomes for the same final context.
- Mode/grant cannot forge human approval, transfer grants through messages/conversion or widen parent/receiver.
- Final target/hook/Stop/revocation race refuses before effect and preserves historical snapshot/receipt.
- Regular and headless retained asks block honestly; admitted YOLO publication receives no second generic
  ask.
- Delayed-work checks reject stale source/root/permission, saved Ask me first, missing pause, Stop and receiver/parent
  widening; direct-user exceptions preserve authentic pause and every other guard.
validation_surfaces:
- 'Phase 2: owner/companion semantic fixtures and exact positive/negative checks in D-requests.md.'
- 'Phase 2: python3 scripts/pm-projects-refresh-contracts.py (F deliverable; not run in phase 1).'
- 'Phase 2: python3 scripts/pm-plan-index.py validate; static success is not native execution proof.'
risk_class: authority_scope_and_target_drift
reasoning_tier: high
context_scope: project_refresh_permissions_and_automation
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards S13/S15/S16; N3/N4/N18/N25/N27;
  Y1/O1–O3
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "YOLO mode needs
  to absolutely be able to git push and publish."'
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards approval envelope
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "I approve the outstanding
  questions with their recommended settings."'
- 'source_ref:chat:lane-D-phase-1-instruction; Jared: "The other risky actions still ask, unless they fall
  inside an approved build grant over things the build itself created."'
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-D01
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-D02
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-D03
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-D04
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-D01
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-D02
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-D03
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-D04
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-D05
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fb-requests.md#Fb-D01
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#Fc-D01
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fd-requests.md#Fd-D01
preserved_exact_tokens:
- policy.may_execute_tool()
- authority_kind=human|mode|build_grant
- blocked_reason_code
- allowed_action_ids[]
- executed=false
- headless_ask_denied
- handler_unavailable
- N25/N27
- BuildGrant
- user_direct|agent_proposed_user_approved
- user_stop_epoch
- Ask me first
- application_automation_paused
- app_automation_pause_unavailable
- paused=false
negative_constraints:
- No second permission resolver, publication approval wrapper, action log or Stop implementation.
- No final allow without durable current evidence and every retained independent gate.
- Acceptance of this specification creates no native handler, active EventRecord producer, WorkNode, NodeSeed,
  executable queue, production build task, readiness certification or governance seal.
owner_hints:
- Plans/Permissions_System.md
```

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#CV-365, ContractName:Plans/Contracts_V0.md#CV-366, ContractName:Plans/Contracts_V0.md#CV-368, ContractName:Plans/storage-plan.md#SP-353, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-020
