# Shard 031: Jared's answers to the week's open questions — 2026-10-17

Source: `Plans/00-plans-index.md`

Source lines: L6245-L6330

Source SHA256: `1624eec0543388e6972f09757b3492a2465f01e3aab12c4f1b536699f5cc50cf`

---

## Jared's answers to the week's open questions — 2026-10-17

DL-230 quotes Jared's answers of 2026-10-17 and maps each to its owners. A family switch is live under the look's cover, and the restart rule is retired (F3-077, F3-244, F3-430). Planning is about half of the tour, which the accepted tour meets; the tour will be redone after the chat port and the Planning Wizard redesign (PWIZ-023, F3-521). The wallpaper gallery's arrows choose as they move (F3-653, SSYS-054). The editor sheet's opening guard stands (F3-650). Saved named layouts belong to the person in `home_named_layouts:v1`, their dashboard boards per project (F3-630, SP-330, UCC-200, CV-361). Testing's Errored uses the shared failed mark (F3-619). The concept's plain Settings wording is adopted with search aliases and option_labels (F3-441, DR-068). Six Usage rows are bound, chart-type starts new charts, and ledger-page-size and CSV export retire (UF-107). A Usage widget is a card everywhere (G-030, UF-093, F3-628). Glass under reduced transparency or more contrast has no requirement (F3-652). No governance reseal or native certification is claimed.

ContractRef: ContractName:Plans/Decision_Log.md#DL-230, ContractName:Plans/FinalGUISpec.md#F3-077, ContractName:Plans/Planning_Wizard.md#PWIZ-023, ContractName:Plans/FinalGUISpec.md#F3-653, ContractName:Plans/FinalGUISpec.md#F3-650, ContractName:Plans/storage-plan.md#SP-330, ContractName:Plans/FinalGUISpec.md#F3-619, ContractName:Plans/FinalGUISpec.md#F3-441, ContractName:Plans/usage-feature.md#UF-107, ContractName:Plans/Glossary.md#G-030, ContractName:Plans/FinalGUISpec.md#F3-652

### 0PI-069 - Pass Two Settings No Project Automation And Projects Owner Map

```yaml
plan_unit_id: 0PI-069
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: |-
  Current ownership routes are: SSYS-002/059–065 and DR-084/085 for Settings classification/resolution, writers, detached copy and presentation; SRV-016/017 for same-owner settings follow and app work Computer custody, RAS for existing routes; MA-074/MACS-006 for destination readiness/protected app auth; Models MS-005/099/100 for its accepted scoped-owner tier edition with explicit no-Persona/no-stage Conservative rule. q-035 is resolved in live canon and source-memory ledgers remain unchanged.

  ACD-508–511 owns No project/place/folder, explicit reads/requests and conversion; T-185/186/187 and PS-145 own access, roots and computer use. GRS-086/087, CWR-045 and OSI-439/440 own app Goal/Crew/continuity/coordination and immutable conversion. APR-073/074, PLS-024, PDS-023 and SQR-019/020 own app Plan/Deep Plan, exact scheduled targets and independent operational pause; ordinary Assistant scoped bundles do not create product Plans or WorkNodes. Only Planning Wizard, PRD Builder and Orchestrator retain no-project workflow gates; real Project-target/capability checks remain distinct.

  PJCT-009/PWIZ-037 owns shared reviewed setup/FO-22 and N15 Later; PJCT-010/FGI-023/024 owns admitted per-service create/recovery/contribution; SCS-025/JJI-023 owns inspection/native backend/Settings-only format; PJCT-011 owns Starters separately from Saved setups; PJCT-012 owns Split Project metadata/actions and BRS-032/033 owns Standard backup/archive/app restore lineage. PS-144–148, RM-053, CRAU-104 and HITL-038 own human/mode/build-grant admission; OSI-441 is the narrower child consumer, not a grant issuer.

  CV-365–368 and SP-348–353 own the shared explicit scope/selected-version/hash/key/source/custody graphs; SP-353 is the dedicated permission snapshot/build-grant/manifest/revocation owner. The finite Plans/projects_refresh_command_bindings.json (pm.projects_refresh_command_bindings.v1) is a static packaged/import input owned by UCC-214, not native dispatch or runtime authority. Commands/Catalog/Matrix retain sole existing/new routes; UIW-048–052 and exact touch sources bind consumers, F3-668–674 renders them, WS-031 supplies app boards without hostability expansion, ATS-080–085 and TCME-007/008 define acceptance/evidence. DL-280–299 records approval and precise supersession; G-032–034 owns vocabulary. Preserve DL-270 substrate and exact historical bytes, DL-273 retirement/token deferral, current FO-22/Glass/return guards and every native NOT_RUN boundary. Canonical acceptance and generated indexes never create native handlers, Event Authority, executable queues, WorkNodes, readiness or governance seal.
gui_related: false
gui_classification_reason: This unit defines decision history, vocabulary, owner boundaries or data-contract acceptance,
  not visual implementation.
depends_on:
- DR-084
- DR-085
- DR-086
- DR-087
- DR-088
- DR-089
- DR-090
- DR-091
- DR-092
unblocks: []
acceptance_criteria:
- Every approved card/default and request is routed to one semantic owner; shared consumers never implement peer engines.
- Latest no-project rulings, resolved q-035, precise historical supersession and admitted service limits are coherent.
- This is owner routing and indexability only, not runtime/readiness/governance or a ledger compile.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-settings-layering-check.py
- scripts/pm-plans-verify.py
risk_class: owner_route_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/00-plans-index.md
- Plans/Settings_System.md
- Plans/assistant-chat-design.md
- Plans/Goal_Runtime_System.md
- Plans/Assistant_Plan_Runtime.md
- Plans/Scheduling_and_Quota_Resume.md
- Plans/Project_System.md
- Plans/Permissions_System.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#0PI-069
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- q-035
- No project
- Starters
- Saved setups
- DL-280–299
negative_constraints:
- Do not revive retired services, older no-project workflow bans, duplicate writers/registries, source-memory authority
  or native proof from routing.
owner_hints:
- Plans/Settings_System.md#SSYS-059
- Plans/assistant-chat-design.md#ACD-508
- Plans/Goal_Runtime_System.md#GRS-086
- Plans/Assistant_Plan_Runtime.md#APR-073
- Plans/Scheduling_and_Quota_Resume.md#SQR-019
- Plans/Project_System.md#PJCT-009
- Plans/Permissions_System.md#PS-147
- Plans/Contracts_V0.md#CV-365
- Plans/storage-plan.md#SP-348
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-059, ContractName:Plans/assistant-chat-design.md#ACD-508, ContractName:Plans/Goal_Runtime_System.md#GRS-086, ContractName:Plans/Assistant_Plan_Runtime.md#APR-073, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-019, ContractName:Plans/Project_System.md#PJCT-009, ContractName:Plans/Permissions_System.md#PS-147, ContractName:Plans/Contracts_V0.md#CV-365, ContractName:Plans/storage-plan.md#SP-348
