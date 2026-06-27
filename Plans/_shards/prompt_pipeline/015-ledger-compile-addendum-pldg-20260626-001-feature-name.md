# Shard 015: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/Prompt_Pipeline.md`

Source lines: L3525-L3886

Source SHA256: `fc63ee6efdc781020bed7d2846c9c56f0462c6966442cdef1bca52351e2d00be`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### PP-055 - Vision Bridge Prompt Output Contract

```yaml
plan_unit_id: PP-055
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: The vision bridge uses a structured prompt/output contract. Image source precedence is explicit
  current-turn attachment or selected artifact, then FileSafe-allowed project file, then explicit clipboard image,
  then recent OS screenshot picker. The vision route receives the image plus a bounded task and returns description/answer,
  uncertainty, notable text/OCR when available, limitations, and safety/redaction notes. The non-vision model receives
  the structured derived result and source refs, not raw image bytes. If bridge execution is denied, unavailable,
  inconclusive, or fails validation, PM returns a structured unavailable result; the instruction remains never guess
  image contents.
gui_related: true
gui_classification_reason: The structured image-derived output is user-visible and governs screenshot/image context
  passed into chat.
depends_on:
- CV-296
- F2-192
- PS-121
unblocks:
- RAP-035
- ACD-425
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: vision_prompt_injection_or_guessing
reasoning_tier: high
context_scope: vision_bridge_prompt_output
implementation_surfaces:
- Plans/Prompt_Pipeline.md
- future bridge prompt/result serializer
node_compile_hint:
  mode: vision_bridge_prompt_output
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0071
- pldg-20260626-001-feature-name:atom-0075
- pldg-20260626-001-feature-name:atom-0081
- pldg-20260626-001-feature-name:atom-0082
- pldg-20260626-001-feature-name:atom-0085
- pldg-20260626-001-feature-name:atom-0086
- external:github.com/alfaoz/opencode-see-image@cde1615f6dfc9039c58da6813112ee53391b5b49
- Plans/Runtime_Artifacts_Panel.md
- Plans/Prompt_Pipeline.md
- chat:vision-bridge-defaults-answer
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
- Plans/FinalGUISpec.md
- Plans/FileSafe.md
source_atom_ids:
- atom-0071
- atom-0075
- atom-0081
- atom-0082
- atom-0085
- atom-0086
decision_refs:
- dec-0014
- dec-0015
- dec-0016
- dec-0017
preserved_exact_tokens:
- see_image
- experimental.chat.system.transform
- OpenCode SQLite
- part
- screenshotSearchDirs
- SEE_IMAGE_MODEL
- SEE_IMAGE_PROVIDER
- minimax-m3
- opencode-go
- mimo-v2.5-free
- never guess image contents
- chat attachments
- runtime artifacts
- screenshots
- project files
- clipboard
- recent OS screenshots
- FileSafe
- 3. not deferred
- permission denied
- no eligible vision route
- provider unavailable
- auth expired
- timeout
- unsupported/corrupt/too-large image
- missing file/artifact
- empty clipboard
- ambiguous recent screenshot
- redaction blocked
- 'yes'
- current-turn attachment
- selected artifact
- project file allowed by FileSafe
- clipboard image
- recent OS screenshot picker
- ambiguous
- hidden Desktop/Downloads scraping
- sensitivity/redaction policy
- disclosure destination
- explicit user override
- redaction/omission details
- derived artifact manifest
- secrets
- structured prompt/output contract
- bounded question/task
- uncertainty
- notable text/OCR
- limitations
- safety/redaction notes
- source refs
- not raw image bytes
negative_constraints:
- Do not copy OpenCode's SQLite/session model as PM's source of truth.
- Do not hardcode `opencode-go`, `minimax-m3`, or `mimo-v2.5-free` as PM defaults without an explicit provider-routing
  decision.
- Do not carry over OpenCode-specific prompt injection unchanged.
- Do not defer clipboard or recent OS screenshot support out of MVP.
- Do not scrape arbitrary Desktop/Downloads/recent screenshot locations as a hidden default without PM-owned permission
  and ingestion rules.
- Do not bypass FileSafe or artifact access policy when resolving project images.
- Do not inline raw screenshots into prompts when artifact refs plus bounded summaries are required.
- Do not let the non-vision model infer or guess image contents after bridge failure.
- Do not serialize failed, revoked, blocked, expired, or omitted image artifacts as successful prompt content.
- Do not show a generic failure when PM can provide a concrete reason code and next action.
- Do not scrape arbitrary Desktop/Downloads/recent screenshot locations as a hidden default.
- Do not choose among ambiguous recent screenshots without user-visible selection or clear recency evidence.
- Do not bypass FileSafe or artifact permissions for project-file image sources.
- Do not silently send sensitive screenshots or images to another provider without policy evaluation.
- Do not claim redaction happened without recording redaction/omission metadata.
- Do not expose secret material in manifests, receipts, GUI previews, or exports.
- Do not pass raw image bytes into non-vision model context when artifact refs plus bounded derived text are the
  contract.
- Do not omit uncertainty or limitations from bridge output when the image is ambiguous or low-confidence.
- Do not let image text/OCR become hidden, unsourced prompt material.
owner_hints:
- Plans/Tools.md
- Plans/Prompt_Pipeline.md
- Plans/Models_System.md
- Plans/Provider_OpenCode.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Project_Output_Artifacts.md
- Plans/FileSafe.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Permissions_System.md
- Plans/Contracts_V0.md
```

### PP-056 - Teacher PM Knowledge Source Resolution

```yaml
plan_unit_id: PP-056
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: 'Teacher answers draw from a live PM knowledge substrate in this order: current surface context,
  canonical Plans, command catalog, GUI surface registry, model/capability/provider state, permission/policy state,
  runtime artifacts/history, Help/Glossary entries, taught memory, then safe fallback or handoff. Teacher must cite
  source groups or show missing coverage, expose source confidence/currentness states, avoid guessing about PM capabilities,
  and choose handoff when the user asks beyond teaching/help scope, external research beyond sources, build work,
  audit/repair, direct execution, or specialty tooling.'
gui_related: false
gui_classification_reason: Source ordering, confidence, and no-guessing are prompt/source behavior rather than visual
  presentation; GUI disclosure is owned elsewhere.
depends_on:
- P-055
unblocks:
- ACD-426
- ATS-014
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: teacher_pm_knowledge_guessing
reasoning_tier: high
context_scope: teacher_pm_knowledge_pipeline
implementation_surfaces:
- Plans/Prompt_Pipeline.md
- future Teacher source resolver
node_compile_hint:
  mode: teacher_pm_knowledge_pipeline
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0095
- pldg-20260626-001-feature-name:atom-0105
- pldg-20260626-001-feature-name:atom-0109
- pldg-20260626-001-feature-name:atom-0115
- pldg-20260626-001-feature-name:atom-0124
- pldg-20260626-001-feature-name:atom-0128
- pldg-20260626-001-feature-name:atom-0137
- pldg-20260626-001-feature-name:atom-0138
- pldg-20260626-001-feature-name:atom-0149
- chat:teacher-feature-initial-framing
- Plans/Personas.md#P-040---Teacher-Core-Persona
- Plans/Media_Generation_and_Capabilities.md
- Plans/UI_Command_Catalog.md
- chat:teach-visual-specificity-challenge
- Plans/assistant-chat-design.md#6-Teach
- chat:teach-help-glossary-rest-request
- Plans/Glossary.md
- Plans/assistant-chat-design.md
- chat:teach-gap-fill-correction
- q-0028
- chat:teach-bundle-accepted-pmconcept-reference
- chat:work-through-teach-gaps
- Plans/Personas.md#11.8-teacher
- Plans/assistant-chat-design.md#6-teach
- Plans/Runtime_Artifacts_Panel.md#runtime-artifact-identity-index-and-preview-rules
- Plans/Personas.md#P-040-teacher-core-persona
source_atom_ids:
- atom-0095
- atom-0105
- atom-0109
- atom-0115
- atom-0124
- atom-0128
- atom-0137
- atom-0138
- atom-0149
decision_refs:
- dec-0018
- dec-0019
- dec-0020
- dec-0021
- dec-0022
- dec-0023
- dec-0024
correction_refs:
- corr-0002
- corr-0003
preserved_exact_tokens:
- know everything in PM
- how it works
- all the capabilities of PM
- how the user interacts with it
- PM documentation coverage
- capabilities.get
- command catalog
- Where it will get all its info from
- Sources used
- PM context
- capability snapshots
- settings registry
- missing coverage
- current surface/selection context
- settings
- command/route registries
- capability resolver
- Plans/PlanUnits
- taught memories
- current surface/control route
- Teach-specific help entry
- Glossary canonical definition
- owner Plans/PlanUnits
- command/settings/capability records
- scoped taught memory
- missing-help coverage callout
- current surface/control
- current thread/project
- help/glossary entry
- provider/model/account state
- runtime artifact
- stale
- missing
- disabled
- permission-required
- Teacher handoff
- missing PM coverage
- non-teaching assistance
- implementation work
- high-capability reasoning
- external search
- another persona/tool path
- required help entry
- owner source
- capability record
- route/control record
- permission
- current surface/control context
- Glossary/help entries
- UI command/route catalog
- capability/provider/account snapshots
- available
- capability-unavailable
- conflict-detected
- could not verify
- PM knowledge pressure test
- PM concepts
- workflows
- models
- capabilities
- permissions
- history
- artifacts
- Personas
- skills/plugins
- Orchestrator behavior
- Teach memory
- avoid guessing
- handoff
negative_constraints:
- Do not hardcode a stale PM encyclopedia inside the Teacher prompt.
- Do not let Teacher invent unsupported capabilities or GUI steps when the capability resolver, command catalog,
  or Plans do not support them.
- Do not search other projects or external sources unless the user explicitly requests external navigation/import.
- Do not let Teacher present PM facts as unsourced hidden prompt lore.
- Do not hide stale, missing, disabled, or capability-unavailable source states.
- Do not cite unavailable PlanUnits before a future compile creates them.
- Do not let Teacher invent PM behavior when live PM sources are missing.
- Do not search external sources or other projects by default.
- Do not use taught memory outside its approved scope.
- Do not let Teacher silently skip missing help entries.
- Do not search/read external or cross-project sources unless the user explicitly approves that route.
- Do not use taught memory outside its scope.
- Do not collapse stale, missing, disabled, and permission-required states into generic uncertainty.
- Do not let Teacher guess through missing PM coverage.
- Do not silently change persona/model/tool path without disclosure.
- Do not treat handoff as failure when it is the correct safer route.
- Do not let Teacher invent PM behavior when owner sources are missing.
- Do not collapse stale, missing, disabled, permission-required, and capability-unavailable into one vague warning.
- Do not present unverified PM behavior as fact.
- Do not cite unavailable future PlanUnits before compile creates them.
- Do not certify Teacher on a small happy-path chat only.
- Do not let Teacher answer capability or settings questions without live/source-backed state.
- Do not treat missing coverage as a passing answer unless it is visibly disclosed and routed.
owner_hints:
- Plans/Prompt_Pipeline.md
- Plans/assistant-chat-design.md
- Plans/Tools.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/UI_Command_Catalog.md
- Plans/FinalGUISpec.md
- Plans/Glossary.md
- Plans/Personas.md
- Plans/storage-plan.md
- Plans/Models_System.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Permissions_System.md
- Plans/Automated_Testing_System.md
```
