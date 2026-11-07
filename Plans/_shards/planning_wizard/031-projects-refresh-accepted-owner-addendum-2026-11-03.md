# Shard 031: Projects refresh accepted owner addendum (2026-11-03)

Source: `Plans/Planning_Wizard.md`

Source lines: L3926-L4057

Source SHA256: `7f2dafc4592563d84b438ebd36dab197ae524d14adae1c431d5a6a09e77bd0be`

---

## Projects refresh accepted owner addendum (2026-11-03)

### PWIZ-037 - Shared New Project re-entry presentation

```yaml
plan_unit_id: PWIZ-037
unit_type: integration_contract
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: |-
  New Project is a launcher plus one guided page and live Review over PJCT-009, shared with Product Onboarding and conversion-to-new. The launcher recognizes a pasted online URL, folder or computer/address as a suggested way, never an authority or identity proof. Six equal entry ways are new, folder, online, computer/NAS, restore and from-chat. They map to existing new/existing_local/existing_online/restore intents; from-chat consumes the chat conversion engine and computer/NAS is a source transport, not a new backend or arbitrary registration kind. P11 other-app import remains not here yet.

  Compute applicable sections from current answers and owner results, not a stored visited/completed boolean. New content asks Start with; existing content is inspected by SCS-025. Where work runs names the Computer/Server, while where files live names the actual local/Server/SSH/PM/SMB/NFS/mounted source and full destination path. Show available space and refused/missing/waiting status from current owner evidence, not a fabricated estimate. New folders default to code.execution.projects-folder for the selected Computer, a Computer-only execution_host-keyed path with factory value execution_host_home_relative Projects, resolved against that actual Host’s home (for example ~/Projects on Unix), never an install-folder or initiating-Client path; preserve interior name spaces and validate the actual destination filesystem/collision. Advanced may select another admitted work Host/Environment without making a Client the execution owner.

  Your usual settings follows SSYS-002/059. A chosen source Project copies its own_values, selected owner things and account IDs through SSYS-036/062; Advanced may select exact portable IDs and effective_values/Keep them fixed, with project_only_rows off by default. The eleven disjoint selector sets are Settings-owned and the visible kind is Notifications & limits. No copy runs when merely opening an existing Project, on Later or connect-only. One MA-074 readiness list reports ready_here, check_there, sign_in_there, key_needed, not_installed, expired or cannot_move on the destination Computer. No keys, CLI profiles, pairings, implicit install or invented account fallback travel.

  Git and Jujutsu are equal choices with the inspected backend authoritative. FileSafe uses its one default-on owner switch. A found online copy offers explicit Link it, Leave it unlinked or Make a new online copy; only current account/repository checks can bind. FGI-023 supplies per-service fields/private-most visibility and PJCT-010 owner commit/recovery. FGI-024 supplies GitHub/GHES contribution and the team-branch default/direct alternative. Starters and Saved setups are distinct under PJCT-011. README/ignore/licence online-copy choices have a single Advanced editor. Jujutsu format/permanence choices stay in Settings and setup only consumes their result. Backup asks the exact place before sign-in and the BRS-032 inclusion/policy preview; Standard uses the owner seed and Advanced counts, not More/Fewer presets.

  Review names the actual source, work Computer, full destination, current inspected history, copy exclusions/account readiness, fork or remote effects/privacy, backup choice and exactly what commit will do. Unknown values remain unchosen/pending. One named Create/Add/Copy/Restore action routes the exact root and current children. Later/Back/Edit follow current PM7 FO-22 valid history and fresh-Review rules. Creating observes actual owner receipts, with no invented percent or finished phase. Failure preserves retained recovery and exact Continue Setup/Open Repository/Delete Repository availability. Done lists only committed effects; optional backup/Kit/AI protection remains visibly incomplete until its owner settles. Closing never cancels or replays accepted work.

  Set up a project later offers scoped AI and optional Free Models setup on the named Computer, then a No project chat. Guided Tour finishes there without a fake Project; Project-bound chapters remain gated. Only Planning Wizard, PRD Builder and Orchestrator retain no-project workflow gates; Goals, Crew, Plan/Deep Plan and scheduled tasks/messages use their approved application owners. Conversion-to-new moves the chat last, after verified listing, under ACD-510/511 and its report/Undo.

  The account_resolution readiness list is recomputed when the work Computer changes. Explicit look/NieR choices remain excluded from copy. Almost ready, unusable-account and incomplete optional setup feedback retain the current PM7 no-celebration and owner-reason behavior.

  From a chat keeps Make a project from this chat and Move this chat into a project equally visible and uses the ACD-510/511 preview/report rather than another setup engine. Existing-Project conversion defaults to a separate Git work branch/worktree or Jujutsu change/bookmark plus the chosen folder; direct main is Advanced only. Review discloses settings/account/permission differences, missing Git identity, selected files and active work, and blocks unsaved target buffers or history grafting. The notice Needs a project. applies to actual Planning Wizard, PRD Builder and Orchestrator intake. A converted app Plan still needs its exact revision map and fresh Project handoff. On the N15 Later path, explicit Skip AI remains available alongside scoped AI/Free Models setup; skipping lands in No project without claiming provider readiness or creating a Project.

  When SSH is selected, the same guided page consumes cmd.server.ssh.trust and cmd.server.ssh.public_key.install from SRV-018/RAS-017 with exact SshHostTrustCommandRequestV1/SshHostTrustCommandResultV1 and SshPublicKeyInstallCommandRequestV1/SshPublicKeyInstallCommandResultV1 definitions in Plans/server_system_contracts.schema.json. The view shows the owner preview for the observed host/port/key and exact remote account/public-key ref and returns to the captured draft/route/focus after the human-only apply. A changed key, stale target/key generation, weak key, missing auth, uncertain install or absent native handler remains blocked/pending. Creation, YOLO and source inspection cannot click/forge protected trust or key installation. Puppet Master source pairing stays distinct; no concept SSH command is dispatched.

  Consume the final SRV-018 closed result/refusal branches literally: ssh_host_key_changed requires fresh explicit replacement preview and human approval, and effect_unknown remains pending reconciliation. Missing initiating caller returns caller_unavailable while the original operation/result remains discoverable; never retarget a late result to another Client or the current tab. Setup Cancel/Close/Undo cannot claim installed trust or a public entry was removed.
gui_related: true
gui_classification_reason: Defines visible setup, choice, status, recovery or exact return behavior.
depends_on:
- PJCT-009
- PJCT-010
- PJCT-011
- SCS-025
- FGI-023
- FGI-024
- BRS-032
unblocks: []
acceptance_criteria:
- All six entry ways map to exact owner routes and same draft/applicability/Review engine.
- Back/Edit service/source/Computer changes invalidate abandoned answers while preserving compatible choices; no
  old folder/repository returns to Review.
- Existing/unlinked/duplicate sources, names with spaces, inaccessible/low-space destination and all service variants
  remain truthful.
- No-project Later offers scoped AI setup or explicit Skip AI and lands in the correct chat; pending backup or provider work is never called ready.
- >-
  Both conversion entries remain visible; a default separate work branch/worktree or JJ change/bookmark never silently lands on main, grafts source history or overwrites unsaved buffers.
- >-
  Later with Skip AI reaches the app chat without Project reservation, Settings copy or a false Ready result.
- >-
  SSH prerequisites use the exact Server request/result and captured return context; changed fingerprints, stale key/target, weak keys, uncertain installs and missing handlers cannot be rendered trusted or installed.
validation_surfaces:
- Plans/product_onboarding_contracts.schema.json
- Plans/server_system_contracts.schema.json
- scripts/pm-projects-refresh-contracts.py
risk_class: identity_authority_or_false_completion
reasoning_tier: high
context_scope: projects_refresh_pwiz_037
implementation_surfaces:
- Plans/Planning_Wizard.md
- future existing owner handlers; handler_unavailable until native evidence
node_compile_hint:
  mode: static_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#P1-P12; N15; S1/S9-S11; latest no-project
  rulings
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-e
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/BUILD-SPEC-split-v2.md#18-and-21
- 'Jared, 2026-11-03 (verbatim): Those look good, except goals and crew should be allowed in no project.'
- 'Jared, 2026-11-03 (verbatim): Plan mode and scheduled tasks are also available in no project. It''s only planning
  wizard/prd builder/orchestrator that isn''t.'
- 'Jared (verbatim): when I say separate settings for different environments, that is what T3 calls the different
  computers, but it is where Puppet Master runs its work.'
- '/mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-E01'
- '/mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#Fc-E01'
- 'Plans/Server_System.md#SRV-018; Plans/Remote_Access_System.md#RAS-017; A interface freeze pm-mail 1103211659-9a77 (2026-11-03)'
- 'Plans/Server_System.md#SRV-018 exact command and data contract; A publication pm-mail 1103212607-5405'
preserved_exact_tokens:
- New Project
- FO-22
- code.execution.projects-folder
- execution_host
- ~/Projects
- own_values
- effective_values
- Keep them fixed
- project_only_rows
- Notifications & limits
- ready_here
- check_there
- sign_in_there
- key_needed
- not_installed
- expired
- cannot_move
- No project
- account_resolution
- Make a project from this chat
- Move this chat into a project
- Needs a project.
- Skip AI
- cmd.server.ssh.trust
- cmd.server.ssh.public_key.install
- SshHostTrustCommandRequestV1
- SshHostTrustCommandResultV1
- SshPublicKeyInstallCommandRequestV1
- SshPublicKeyInstallCommandResultV1
- ssh_host_key_changed
- effect_unknown
- caller_unavailable
negative_constraints:
- Do not add a concept JavaScript API, fixture account/host, demo default, second form engine or generic Project
  command to canon.
- Do not link from displayed origin, substitute backend, copy credentials or let a client-local path impersonate
  the work Computer.
- Do not treat a preview, dispatch acceptance, local timer or unknown phase as settled success.
owner_hints:
- Plans/Planning_Wizard.md
compatibility_only_notes:
- Existing exact historical Project requests/results/receipts remain readable under their original version; no in-place
  reinterpretation.
stale_retired_dispositions:
- Earlier pending decision labels are superseded by the approved packet; native implementation and governance certification
  remain unproved.
```

ContractRef: ContractName:Plans/Planning_Wizard.md#PWIZ-037, ContractName:Plans/Plan_Document_System.md#PDS-003
