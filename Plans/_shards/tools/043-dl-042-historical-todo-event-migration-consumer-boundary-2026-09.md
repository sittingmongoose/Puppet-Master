# Shard 043: DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Source: `Plans/Tools.md`

Source lines: L12985-L13356

Source SHA256: `62ede04d56ef24109a9f2fb6e7c69f581a0da383eea3430a4239faac691622fd`

---

## DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Tools retains proposal-only `todowrite` authority and non-mutating `todoread` projection reads under T-179. Permission approval authorizes proposal processing, not direct canonical writes. TDR-012 in `Plans/ToDo_Runtime.md` owns the complete approved historical-read/future-event mapping and its admission gates.

ContractRef: ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Decision_Log.md

### T-185 - Explicit Project Reads And One Coverage Contract

```yaml
plan_unit_id: T-185
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: 'The agent tools projects.list, projects.status, projects.search, projects.read_file,
  projects.read_chat and projects.read_plans are explicit read-only operations usable from Project and
  No project chats. list returns only accessible Project names/place/status/reachability metadata without
  content consent; status returns owner summaries and Safe lines, but a Project with reading Off yields
  name only. search requires an explicit scope: all or an exact named set; direct reads name their exact
  Project/chat/file/version/range. read_chat may name an app thread under the same explicit read authority;
  read_plans returns bounded Plan/Goal/scheduled-work summaries. These tools never fall back to the current
  Project when scope is absent. Regular uses the approved per-chat consent choices (This time, For this
  chat, Always on this computer, No), including an explicit file/Project mention grant; YOLO uses recorded
  task-scoped authority for an explicit requested set, never fabricated human approval. Every read runs
  through the source Computer and current person-access, source-Project reading switch, path/content,
  actor/phase, retention, secret and provider-exposure checks. Archived Projects are skipped unless named.
  No notebooks, private memory, FileSafe safe copies, PM-private data or secrets are exposed. Only bounded
  authorized result sets may merge; physical indexes and automatic retrieval stay isolated. Each tool
  returns one shared coverage shape: requested, looked_in (exact source and Computer/currentness), not_looked_in
  (closed reason), partial (missing range/cursor/index coverage). Empty/partial answers disclose coverage
  in text; multi-source, empty and partial tool cards show the quiet expandable line, and successful one-source
  cards retain it in Details. Offline, denied, archived-skipped, missing/rebuilding index, truncation
  and missing ranges cannot become none anywhere. One scope: all call performs fan-out through existing
  source owners; no second index, route registry or History engine is created. Reading conveys no write,
  Stop or service-control authority; requests to act use the existing thread.request/spawn/await owner
  and receiver mode. Permissions_System PS-145 owns other_projects_read and outward_after_cross_project_read;
  acting requests consume other_projects_message and incoming_chat_messages receiver ceilings. settings.follow
  is never content-read authority.'
gui_related: true
gui_classification_reason: Owns user-visible manager, activity or control behavior.
depends_on:
- T-044
- T-046
- T-053
- SSYS-002
unblocks: []
acceptance_criteria:
- Missing explicit scope refuses rather than silently using the visible Project.
- A mixed all query reports every requested source as looked_in, not_looked_in or partial with truthful
  reasons; an empty result never hides offline/denied/archived sources.
- A direct ID, symlink into a Project, copied grant or read permission cannot reveal notebooks, private
  memory, secrets or permit a Project mutation.
- Every retained read and result preserves source/Computer/version/range provenance through scrub and
  outward-effect policy.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- future post-landing owner/command/wiring/touch reconciliation; native runtime and GUI evidence remain required.
risk_class: scope_authority_or_custody_drift
reasoning_tier: high
context_scope: project_and_application_scope
implementation_surfaces:
- Plans/Tools.md
- Plans/settings_system_contracts.schema.json
- Plans/Shared_Integration_Runtime.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N3/N12/N24; N4/N19
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#4.1–4.6;9.4
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
- 'Jared, 2026-11-03: "Those look good, except goals and crew should be allowed in no project."'
- 'Jared, 2026-11-03: "Plan mode and scheduled tasks are also available in no project. It''s only planning
  wizard/prd builder/orchestrator that isn''t."'
- projects-refresh-20261030/pass2/plans-edit-requests/A-requests.md#A-B01
- projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-B01
preserved_exact_tokens:
- projects.list
- projects.status
- projects.search
- projects.read_file
- projects.read_chat
- projects.read_plans
- coverage
- requested
- looked_in
- not_looked_in
- partial
- 'scope: all'
negative_constraints:
- Do not make ambient cross-Project retrieval, a merged physical index, a memory share or a permission
  bypass.
- Do not run a foreign Project read from another Computer's filesystem/cache when its owner is unavailable.
- Do not infer an implemented handler, admitted event writer, native verification, WorkNode, NodeSeed
  or governance clearance from this accepted contract.
owner_hints:
- Plans/Tools.md
- Plans/Settings_System.md
- Plans/Permissions_System.md
```

ContractRef: ContractName:Plans/Tools.md#T-185, ContractName:Plans/Settings_System.md#SSYS-002, ContractName:Plans/Contracts_V0.md#CV-365

### T-186 - Computer Use Admission, Disclosure And Targeted Stop

```yaml
plan_unit_id: T-186
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Computer use is the stage-3 computer.* family for any chat, with or without Project. Its
  executable census is exactly computer.screen, computer.pointer and computer.keys; computer.* is a family/policy
  selector, never a callable tool or native capability proof. It is off until task-bound per-chat/per-app
  admission names the target Computer, permitted apps, signed-in desktop, supported provider/model/session
  ActiveToolNamespaceReceipt and a DAE-safe execution path. Regular asks per chat/app; YOLO may satisfy
  the ordinary tool ask through its task authority but cannot invent permitted apps, change Computers,
  bypass protected auth or skip separate scoped permission to send screen pictures to the named AI service.
  Images are scrubbed and transient, not retained as chat image history; bounded action/target audit remains.
  Password/sign-in pages, protected browser sessions, terminal secret prompts and secret stores remain
  human-only. A visible Using the screen of [Computer] strip and labelled Stop stay active; two Esc presses
  call the same Stop. cmd.computer_use.stop targets the exact chat/session/Computer/controller generation,
  releases only its own input authority and cancels its queued actions; it never claims global mouse ownership
  or stops another session. Unsupported/no-desktop/offline/no-safe-path states return typed unavailable
  reasons before input. Sends, purchases, installs, deletion and publication use their actual effect's
  Permissions/FileSafe/capability policy; computer use is no shortcut around it. The computer_use permission
  input is owned by PS-145, not this tool dispatcher. The attached T-186 census fixes the three sole planned
  tools::computer handlers and request/result definitions. Exact per-tool and per-action schema hashes,
  supported native adapter mapping and current ActiveToolNamespaceReceipt evidence must join the existing
  CapabilityStageRecord and L0-L3 materialization before injection or dispatch. No shell/test-driver/remote-desktop
  CLI, guessed provider tool name, wildcard or installed package proves an active native surface. cmd.computer_use.stop
  uses handlers::computer_use::stop and Plans/computer_use_contracts.schema.json#/$defs/ComputerUseStopRequest
  and ComputerUseStopResult; this separate user control is not a fourth agent tool. Screen contracts,
  native surfaces and effect evidence remain unavailable until actually admitted together. The sole planned
  handler map is computer.screen -> tools::computer::screen, computer.pointer -> tools::computer::pointer,
  and computer.keys -> tools::computer::keys.
gui_related: true
gui_classification_reason: Owns user-visible manager, activity or control behavior.
depends_on:
- T-172
- T-176
- SSYS-002
unblocks: []
acceptance_criteria:
- A task cannot input into an unallowed app, another Computer, another controller generation or any protected
  auth/secret prompt.
- YOLO with no valid screen-provider disclosure grant asks for that disclosure; no admitted desktop/DAE
  path means unavailable.
- Stop and double Esc fence queued input immediately for the exact owner session while unrelated work
  remains intact.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- future post-landing owner/command/wiring/touch reconciliation; native runtime and GUI evidence remain required.
risk_class: scope_authority_or_custody_drift
reasoning_tier: high
context_scope: project_and_application_scope
implementation_surfaces:
- Plans/Tools.md
- Plans/settings_system_contracts.schema.json
- Plans/Shared_Integration_Runtime.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N10; N6/N12/N24
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#3.5;9.4–9.5
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
- 'Jared, 2026-11-03: "Those look good, except goals and crew should be allowed in no project."'
- 'Jared, 2026-11-03: "Plan mode and scheduled tasks are also available in no project. It''s only planning
  wizard/prd builder/orchestrator that isn''t."'
- projects-refresh-20261030/pass2/plans-edit-requests/A-requests.md#A-B01
- projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-B01
- projects-refresh-20261030/pass2/plans-edit-requests/PHASE2-BRIEF.md#known-corrections
- projects-refresh-20261030/pass2/plans-edit-requests/Fb-requests.md#Fb-B02
- projects-refresh-20261030/pass2/plans-edit-requests/Fd-requests.md#Fd-B01
preserved_exact_tokens:
- computer.*
- computer_use
- cmd.computer_use.stop
- ActiveToolNamespaceReceipt
- Stop
- computer.screen
- computer.pointer
- computer.keys
- tools::computer::screen
- tools::computer::pointer
- tools::computer::keys
- handlers::computer_use::stop
negative_constraints:
- Do not imply that filesystem guards can constrain every GUI effect; visible bounded app/target admission
  and Stop remain required.
- Do not retain raw screenshots in chat, expose test-only desktop drivers as product capability or silently
  expand the app set.
- Do not infer an implemented handler, admitted event writer, native verification, WorkNode, NodeSeed
  or governance clearance from this accepted contract.
owner_hints:
- Plans/Tools.md
- Plans/Settings_System.md
- Plans/Permissions_System.md
```

ContractRef: ContractName:Plans/Tools.md#T-186, ContractName:Plans/Settings_System.md#SSYS-002, ContractName:Plans/Contracts_V0.md#CV-365

**T-186 executable tool census — closed, version 1.0.0**

The product namespace contains exactly these three agent tools. These are PM contract identities;
an adapter must separately prove its native implementation and session injection. Names of test
drivers, provider APIs or desktop-control executables are not aliases or availability evidence.

| Tool ID | Sole planned handler | Closed operations | Request / result in `Plans/computer_use_contracts.schema.json#/$defs/` |
|---|---|---|---|
| `computer.screen` | `tools::computer::screen` | `capture`: capture only the admitted app/window or a bounded region inside it; exclude other windows and protected surfaces before provider disclosure. | `ComputerScreenRequestV1` / `ComputerScreenResultV1` |
| `computer.pointer` | `tools::computer::pointer` | `move`, `click`, `scroll`, `drag`: one bounded pointer operation in the admitted app/window, using the exact observed geometry. Click names its button and single/double count; drag names start/end; scroll names axis/delta. | `ComputerPointerRequestV1` / `ComputerPointerResultV1` |
| `computer.keys` | `tools::computer::keys` | `press`, `type`: one supported key/chord or bounded nonsecret text insertion into the admitted app/window. No clipboard read, secret entry, macro, script or shell operation is implied. | `ComputerKeysRequestV1` / `ComputerKeysResultV1` |

The six definitions have logical IDs `pm.computer_use.{screen|pointer|keys}.{request|result}.v1`,
version `1.0.0`. Each definition is closed; pointer and keys use a discriminated operation union,
with no arbitrary action string, script, provider argument bag or additional properties.
`Plans/computer_use_contracts.schema.json` and `Plans/computer_use_contract_fixtures.json` define and
exercise these contracts; `Plans/projects_refresh_command_bindings.json` and `Plans/touch_closure.json`
supply their registry/binding/touch joins. The agent-tool census
is three screen tools plus T-185's six read tools. `computer.*` is only a family selector. No
`computer.stop` tool or `cmd.computer.*` primary is admitted.

Every request binds its exact `tool_id`, tool-call/operation and idempotency identities,
`WorkflowScopeV2`, real thread, execution Host/Environment, desktop session, controller identity
and generation, permitted app/window identity, namespace/schema generation, current permission
and disclosure refs, Stop epoch and initiating return context. Project execution has its real
Project; application execution has required-present null Project and the real Server. Existing
scope, permission, currentness and return contracts are referenced rather than copied. Each
input operation also binds an admitted observation ref, its app/window generation and geometry;
coordinates are physical pixels in that exact observation, with explicit adapter scale mapping.
Stale geometry, changed foreground/target ownership or an unobserved replacement window refuses
before input. There is no focus, main-screen, current-Project or other-Computer fallback.

An active tool entry requires its exact schema ID/version/hash and canonical-to-native
tool/action mapping in the supported adapter/session capability evidence, plus T-172's configured,
allowed, injected, model-visible, UI-visible and ready `ActiveToolNamespaceReceipt`. Existing
`CapabilityStageRecord` stages and deterministic L0–L3 selection still apply. Unsupported
operation, OS permission, desktop, adapter, provider/model/session, namespace injection or DAE
path returns `unavailable` with the exact stage/reason before capture/input. An installed package
or a schema-valid request does not enable any producer. Permission key `computer_use` remains
PS-145-owned and the inventory control is `safety.rules.computer-use`; per-tool names add no
permission key, settings row, resolver or trust grant.

App/window admission and provider disclosure are rechecked for capture and input. Protected
auth/password/secret surfaces are excluded before capture as well as input; an adapter that
cannot enforce that boundary is unavailable. Capture returns only scrubbed, size-bounded,
request-scoped transient image input and observation metadata to the admitted provider. Images
expire with the observation/session and are not copied into chat history, evidence, exports or
backups. Audit keeps bounded redacted action/target/outcome metadata. Provider disclosure does
not grant mutation; sends, purchases, installs, deletion, publication and system changes still
require their actual effect authority. An unclassifiable effect cannot dispatch through a
generic click or key operation.

Results bind the original tool call/operation, scope/session/controller generation, target and
return context, with one outcome `succeeded|refused|unavailable|cancelled|failed|unknown_effect`
and a bounded owner reason/receipt. A reported success requires the actual native result;
transport settlement alone proves no effect. Matching replay returns the retained original
outcome and never repeats input. Unknown effect requires owner reconciliation before a fresh
mutation; an expired image/observation is not renewed by replay. Late completion cannot retarget
another tab, session or app. No new EventRecord family is admitted by this census.

Visible Stop and double Esc use only `cmd.computer_use.stop` → `handlers::computer_use::stop`,
with `Plans/computer_use_contracts.schema.json#/$defs/ComputerUseStopRequest` and
`Plans/computer_use_contracts.schema.json#/$defs/ComputerUseStopResult`. Stop fences this
controller generation, cancels queued input, releases only its own authority and returns an
idempotent settled result. Missing screen schemas, fixtures, dispatch/registry/touch joins or
native/session evidence keeps the affected screen tool unavailable; it does not disable the
independently admitted cross-Project read tools or invent a fourth screen tool.

ContractRef: ContractName:Plans/Tools.md#T-172, ContractName:Plans/Tools.md#T-176, ContractName:Plans/Permissions_System.md#PS-145, ContractName:Plans/Contracts_V0.md#CV-365, ContractName:Plans/Commands_System.md#CS-112

### T-187 - Application Tool Context, Local Search And Bounded Custody

```yaml
plan_unit_id: T-187
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Every app tool call uses explicit application scope, project_id=null, real thread/Server/Host/Environment,
  operation/attempt and frozen working roots. A command or saved file lazily creates the visible chat
  folder; pure conversation creates no user folder. bash/edit/read/grep/glob and explicitly supported
  evaluation use that folder or admitted exact directories, never CWD/home/main-Project guesses. Task-needed
  home reads follow Permissions' listed FileSafe-on exception; canonical identity checks exclude Project
  folders, PM data and secrets through symlinks/reparse points, and external-directory default ask remains
  a guard. Local chatsearch/chatread stay in the calling thread's app corpus; other-thread/Project reads
  use T-185. codesearch uses explicitly selected roots and reports missing indexes instead of searching
  the whole Computer. App log reads use the payload store, and app web caching shares the counterpart
  500 MB per-Computer bucket with the same TTL/LRU. The project_enabled stage and web.fetch.cache-size
  use their owner rules. Discovery, enablement and immutable defaults consume the single Settings/Permissions
  owners without a Project tier or org layer; installed, enabled and permitted remain distinct. todowrite
  carries the exact thread/place/Computer into ToDoController. Notebook tools and exact-history reads
  preserve identical scope/actor/phase/visibility checks with nullable Project; notes never become cross-Project
  readable. Conversion re-resolves future roots, discovery, indexes, caches and runtime context against
  the destination manifest; frozen receipts, original payload scope and already-running processes retain
  their original identities. Permissions_System PS-145 owns external_directory and system_change admission;
  no tool-local rule table widens them. Application tool, notebook, memory, browser, restore-point, terminal
  and Eval roots use the selected CV-366 graph in Plans/application_workflow_contracts.schema.json, Plans/application_workflow_sources.schema.json
  and Plans/application_workflow_source_graph.json, with SP-349 physical keys and counterpart quotas.
  Original Project sources remain exact. A missing actual source/handler/retention/backup join is unavailable
  rather than an app-capable alias. Conversion under CV-367/PSB-007 and ACD-510/511 re-resolves these destinations
  through the one owner manifest; it neither transfers a live process/controller nor reuses source permissions.
gui_related: false
gui_classification_reason: Defines runtime scope, data identity and custody without owning visual presentation.
depends_on:
- T-044
- T-053
- T-066
- T-152
- T-161
- T-176
- T-179
- WN-021
- AMS-054
- CV-366
- SP-349
unblocks: []
acceptance_criteria:
- A no-project call never synthesizes an empty/sentinel Project key or derives authority from focused
  UI.
- App cache and search limits are shared per owning Computer as their counterparts require, with per-thread
  access isolation.
- Conversion preserves original events/usage/process identity, revalidates new work and reports unsupported/missing
  roots honestly.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- future post-landing owner/command/wiring/touch reconciliation; native runtime and GUI evidence remain required.
risk_class: scope_authority_or_custody_drift
reasoning_tier: high
context_scope: project_and_application_scope
implementation_surfaces:
- Plans/Tools.md
- Plans/settings_system_contracts.schema.json
- Plans/Shared_Integration_Runtime.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N3/N6/N12/N24/N25/N26
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#3.3–3.4;5;7.12;9.4
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
- 'Jared, 2026-11-03: "Those look good, except goals and crew should be allowed in no project."'
- 'Jared, 2026-11-03: "Plan mode and scheduled tasks are also available in no project. It''s only planning
  wizard/prd builder/orchestrator that isn''t."'
- projects-refresh-20261030/pass2/plans-edit-requests/A-requests.md#A-B01
- projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-B01
- projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-B01
- projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#Fc-B01
preserved_exact_tokens:
- application
- project_id=null
- project_enabled
- chatsearch
- chatread
- todowrite
- 500 MB
- web.fetch.cache-size
negative_constraints:
- Do not scrape home/desktop/downloads as an implicit default or let a raw path bypass Project read/write
  policy.
- Do not add a second tool dispatch, permission engine, notebook API or unbounded app cache.
- Do not infer an implemented handler, admitted event writer, native verification, WorkNode, NodeSeed
  or governance clearance from this accepted contract.
owner_hints:
- Plans/Tools.md
- Plans/Settings_System.md
- Plans/Permissions_System.md
```

ContractRef: ContractName:Plans/Tools.md#T-187, ContractName:Plans/Settings_System.md#SSYS-002, ContractName:Plans/Contracts_V0.md#CV-365
