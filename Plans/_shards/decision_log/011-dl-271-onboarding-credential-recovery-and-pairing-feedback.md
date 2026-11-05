# Shard 011: DL-271 — Onboarding credential, recovery and pairing feedback

Source: `Plans/Decision_Log.md`

Source lines: L26794-L28307

Source SHA256: `6df9b16a4ff070f3cc38b4c4c4ef532776fc8c59b48026d61963f4b21cef1823`

---

## DL-271 — Onboarding credential, recovery and pairing feedback

```yaml
plan_unit_id: DL-271
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: 'DL-271 records the PM7 final onboarding batch accepted through the lead on 2026-10-31. DL-271 FO-11,
  2026-10-31: where an OpenCode server requires its own HTTP Basic credentials, the Password field asks for that server’s
  password, not an AI provider’s API key or the person’s Puppet Master sign-in. Its hint states that distinction and
  identifies credential custody in the OS keychain on the selected execution host, through the existing credential owner.
  Optional server auth stays optional when the server needs none. Protected entry, secret-free readback and exact host/account
  binding remain; an API-key-only hint is used only on an actual API-key field. DL-271 FO-12, 2026-10-31: Protect’s missing-access
  guidance is count-neutral: ask for the access details without claiming a fixed number of fields. The selected Backup
  destination family, auth method and credential mode determine the actual required fields and validation through their
  existing owner. Changing the line never omits a required credential, locator, region or temporary-session value and
  never turns incomplete access into an available Connect action. DL-271 Unlock wording, 2026-10-31: ask for your recovery
  phrase, rather than six words or another fixed word count. The Recovery Kit is not a six-word format (PWIZ-025/BRS-018);
  the Backup owner still defines and verifies the real protected recovery material and its exact source/target binding.
  The wording admits no new phrase format, key derivation, unlock proof or weaker secret-handling rule. DL-271 weak-key
  eligibility, 2026-10-31: Choose a key may list a DSA or RSA-1024 key as Too weak to use, but it cannot be selected,
  used as a default, advanced or installed. The refusal reads Older key type — too weak to use. Check this eligibility
  before an existing authorization, matching prior profile or passphrase/unlock state; those cannot make a weak key usable.
  A retained weak selection must be replaced by an owner-eligible key before the flow advances. Other keys keep their
  existing owner checks, identity binding and custody; the shared list never exposes or moves a private half. DL-271
  initial request waiting, 2026-10-31: while the current invitation is live and no device request has arrived, Your Server
  is ready shows No requests yet with Check again. Checking re-reads the current owner run; a real arriving request also
  updates that view. This neutral state is not an error and invents no candidate, approval or trust. Continue retains
  its existing Server-ready gates. Keep it distinct from DL-259 FO-7’s answered approval/rejection: a completed request
  stays answered, and a fresh request requires the existing new-code/new-generation route. DL-271 FO-14, 2026-10-31:
  long tokens in an opened question note wrap within its available width, so their full text is readable without horizontal
  scrolling. Keep vertical scrolling when the note exceeds its available height. This applies to Plain English and Expert,
  including NieR, and visual wrapping preserves the exact token for copying; it adds no second note renderer or per-family
  content version.'
gui_related: true
gui_classification_reason: Corrects credential/recovery wording, weak-key eligibility and visible pairing waiting state.
split_recommended: false
depends_on:
- DL-126
- DL-259
- DL-260
- PWIZ-021
- PWIZ-025
- PO-009
- SSYS-042
- SRV-004
unblocks: []
acceptance_criteria:
- 'DL-271 FO-11, 2026-10-31: where an OpenCode server requires its own HTTP Basic credentials, the Password field asks
  for that server’s password, not an AI provider’s API key or the person’s Puppet Master sign-in. Its hint states that
  distinction and identifies credential custody in the OS keychain on the selected execution host, through the existing
  credential owner. Optional server auth stays optional when the server needs none. Protected entry, secret-free readback
  and exact host/account binding remain; an API-key-only hint is used only on an actual API-key field.'
- 'DL-271 FO-12, 2026-10-31: Protect’s missing-access guidance is count-neutral: ask for the access details without claiming
  a fixed number of fields. The selected Backup destination family, auth method and credential mode determine the actual
  required fields and validation through their existing owner. Changing the line never omits a required credential, locator,
  region or temporary-session value and never turns incomplete access into an available Connect action.'
- 'DL-271 Unlock wording, 2026-10-31: ask for your recovery phrase, rather than six words or another fixed word count.
  The Recovery Kit is not a six-word format (PWIZ-025/BRS-018); the Backup owner still defines and verifies the real
  protected recovery material and its exact source/target binding. The wording admits no new phrase format, key derivation,
  unlock proof or weaker secret-handling rule.'
- 'DL-271 weak-key eligibility, 2026-10-31: Choose a key may list a DSA or RSA-1024 key as Too weak to use, but it cannot
  be selected, used as a default, advanced or installed. The refusal reads Older key type — too weak to use. Check this
  eligibility before an existing authorization, matching prior profile or passphrase/unlock state; those cannot make
  a weak key usable. A retained weak selection must be replaced by an owner-eligible key before the flow advances. Other
  keys keep their existing owner checks, identity binding and custody; the shared list never exposes or moves a private
  half.'
- 'DL-271 initial request waiting, 2026-10-31: while the current invitation is live and no device request has arrived,
  Your Server is ready shows No requests yet with Check again. Checking re-reads the current owner run; a real arriving
  request also updates that view. This neutral state is not an error and invents no candidate, approval or trust. Continue
  retains its existing Server-ready gates. Keep it distinct from DL-259 FO-7’s answered approval/rejection: a completed
  request stays answered, and a fresh request requires the existing new-code/new-generation route.'
- 'DL-271 FO-14, 2026-10-31: long tokens in an opened question note wrap within its available width, so their full text
  is readable without horizontal scrolling. Keep vertical scrolling when the note exceeds its available height. This
  applies to Plain English and Expert, including NieR, and visual wrapping preserves the exact token for copying; it
  adds no second note renderer or per-family content version.'
validation_surfaces:
- python3 scripts/pm7-build-check.py
- python3 scripts/pm7-canon-check.py
- python3 scripts/pm7-demo-canon-check.py
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: credential_confusion_unsafe_key_selection_or_pairing_state
reasoning_tier: high
context_scope: onboarding_credential_and_pairing_feedback
implementation_surfaces:
- Plans/Provider_OpenCode.md
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/Settings_System.md
- Plans/Server_System.md
- Plans/UI_Wiring_Rules.md
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: canonical_amendment
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- 'PM7 final batch, lead 1031214952-2d19 (2026-10-31), integration 2819a3def0: FO-11 2a3661f021; FO-12/Unlock 4c6305553d;
  weak-key/waiting view dfbaacbad7. Provider/onboarding/server reports are source lineage only; no concept host, seeded
  situation, artificial delay or helper API is a product requirement. Lead 1031215509-a74e confirms unconditional weak-key
  refusal.'
- 'PM7 final batch, lead 1031214952-2d19 (2026-10-31), integration 2819a3def0: FO-11 2a3661f021; FO-12/Unlock 4c6305553d;
  weak-key/waiting view dfbaacbad7. Provider/onboarding/server reports are source lineage only; no concept host, seeded
  situation, artificial delay or helper API is a product requirement. Lead 1031215509-a74e confirms unconditional weak-key
  refusal.'
preserved_exact_tokens:
- DL-271
- OpenCode
- DSA
- RSA-1024
- Too weak to use
- Older key type — too weak to use
- No requests yet
- Check again
- recovery phrase
negative_constraints:
- Do not persist protected input in ordinary drafts, receipts or logs.
- Do not invent a fixed recovery-phrase format or change Backup cryptography.
- Do not allow prior authorization or passphrase state to bypass weak-key refusal.
- Do not promote concept scaffolding, artificial owner delays or prefilled scenarios into product canon.
- Do not add commands, trust authority or executable build tasks.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/Provider_OpenCode.md
- Plans/Settings_System.md
- Plans/Server_System.md
```


### DL-272 — Footage review alignment, real product rules

```yaml
plan_unit_id: DL-272
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: 'DL-272 records the PM7 lead’s 2026-11-01 footage batch at integration 7d2dd568be, not a new set
  of personal rulings by Jared. Existing DL-126, DL-257, DL-259, DL-260 and DL-271 remain constraints. It aligns
  protected sign-in fallback/addition/retry and per-service expiry, native-Client auth before listing under D7,
  matching identity/pairing feedback, generated proxy files and actionable failures, truthful restore/Ready status,
  source-control validation/privacy/access/selection, and fixed readable stage/indicator/Pip success behavior. It
  adds the single Models route-disable command of CS-108/UCC-213. Stale canon’s global five-minute timeout and blanket
  pre-Review auth prohibition are amended only as specified by MA-047/RAS-014/PWIZ-021/025. Remote Link grammar
  remains deferred by Jared’s REMOTE-CODE-1; XXXX-XXXX belongs only to pairing-code display. Forgejo restricted-token
  support without account identity remains an owner question. Demo mechanics, samples, Studio situations, concept
  hosts, seeds, timings and source function names are not product rules. No governance reseal, WorkNodes, NodeSeeds
  or native/runtime acceptance is supplied.


  Final delta FO-16/FO-18/FO-19, lead 2026-11-01, integration 0cf2bf59e4: choosing another option ends the old refusal
  feedback without a cheer; no usable AI or Free Models means calm Almost ready in every look with no celebration;
  long values wrap in their pane with a fingerprint’s hash whole on its own line after its algorithm when needed.
  PWIZ-022, MS-122, F3-520/598/600/663 and DR-020/080 own the amendments. No Jared ruling changes, new commands,
  Settings rows or trust authority result. hosted Forgejo naming/admission and Forgejo restricted-token support remain
  Jared’s open questions.


  Disposition amended by DL-273, Jared 2026-11-01: hosted Forgejo’s question is closed by removal of hosted Forgejo.
  Repository-restricted Forgejo tokens were deliberately left for now, preserving the existing account-based
  flow; this is a decided deferral, not an unanswered request for immediate approval. The preceding footage
  history remains unchanged.'
gui_related: true
gui_classification_reason: Defines user-visible setup/feedback or its exact owner-routed control.
split_recommended: false
depends_on:
- DL-259
- DL-271
unblocks: []
acceptance_criteria:
- DL-272 records the PM7 lead’s 2026-11-01 footage batch at integration 7d2dd568be, not a new set of personal rulings
  by Jared. Existing DL-126, DL-257, DL-259, DL-260 and DL-271 remain constraints. It aligns protected sign-in fallback/addition/retry
  and per-service expiry, native-Client auth before listing under D7, matching identity/pairing feedback, generated proxy
  files and actionable failures, truthful restore/Ready status, source-control validation/privacy/access/selection, and
  fixed readable stage/indicator/Pip success behavior. It adds the single Models route-disable command of CS-108/UCC-213.
  Stale canon’s global five-minute timeout and blanket pre-Review auth prohibition are amended only as specified by MA-047/RAS-014/PWIZ-021/025.
  Remote Link grammar remains deferred by Jared’s REMOTE-CODE-1; XXXX-XXXX belongs only to pairing-code display. Forgejo
  restricted-token support without account identity remains an owner question. Demo mechanics, samples, Studio situations, concept hosts, seeds, timings and source function names are
  not product rules. No governance reseal, WorkNodes, NodeSeeds or native/runtime acceptance is supplied.
- 'Final delta FO-16/FO-18/FO-19, lead 2026-11-01, integration 0cf2bf59e4: choosing another option ends the old
  refusal feedback without a cheer; no usable AI or Free Models means calm Almost ready in every look with no celebration;
  long values wrap in their pane with a fingerprint’s hash whole on its own line after its algorithm when needed.
  PWIZ-022, MS-122, F3-520/598/600/663 and DR-020/080 own the amendments. No Jared ruling changes, new commands,
  Settings rows or trust authority result. hosted Forgejo naming/admission and Forgejo restricted-token support remain
  Jared’s open questions.'
- 'Disposition amended by DL-273, Jared 2026-11-01: hosted Forgejo’s question is closed by removal of hosted Forgejo.
  Repository-restricted Forgejo tokens were deliberately left for now, preserving the existing account-based flow;
  this is a decided deferral, not an unanswered request for immediate approval. The preceding footage history remains
  unchanged.'
validation_surfaces:
- python3 scripts/pm7-canon-check.py
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: owner_identity_and_truthful_feedback
reasoning_tier: high
context_scope: pm7_footage_review_20261101
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Lead BATCH-FOOTAGE-REVIEW.md, 2026-11-01
- Concepts/onboarding/opus-5.5 at7d2dd568be76874ff8b4d3e82bad3701226d248c (source lineage only)
- PM7 final delta FO-16/FO-18/FO-19; lead mail 1101140232-5344, 2026-11-01; integration 0cf2bf59e4d9048d65f56842c7b8bc75eda9be78.
  Actual 60-ui-core.js, 61-components.js, 74-screens-ready.js and 10-window.css under Concepts/onboarding/opus-5.5/src
  are source lineage only.
- 'Jared 2026-11-01 via PM7 lead: hosted Forgejo is not offered; Forgejo repository-restricted tokens — we can leave
  it for now. Fields8762cda61a658081878344ddff95f9916c1aa0f0 is source lineage only.'
preserved_exact_tokens:
- DL-272
- DL-126
- DL-259
- DL-260
- DL-271
negative_constraints:
- Do not infer native handlers, trust, success, credential authority or governance readiness from a concept or static
  fixture.
owner_hints:
- Plans/Decision_Log.md
```


### DL-273 — Retire unselected hosted offerings; keep self-managed services and defer restricted tokens

```yaml
plan_unit_id: DL-273
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: 'Jared decided on 2026-11-01 that hosted Forgejo is not offered: Forgejo is a server the person runs,
  represented only by forgejo_self_managed. A hosting provider whose terms forbid AI-generated Projects is not useful
  to Puppet Master, because Puppet Master’s Projects are AI-written; such a host is ineligible. The earlier hosted variant
  entered the source proposal in commit 3e1842da40 on 2026-09-02, not through a Jared ruling. Current instance, adapter,
  onboarding and embedded storage profiles admit only the own-server Forgejo variant and require the real address and
  normal owner verification, with no implicit account or repository authority. Gitea is self-managed only under this
  same decision. On repository-restricted Forgejo tokens Jared said "we can leave it for now." That question remains
  open and deliberately deferred; the existing account-based flow stays unchanged and no support is admitted or permanently
  rejected. This closes DL-272’s hosted-provider admission question and records the restricted-token deferral as decided.


  DL-273, Jared 2026-11-01: Forgejo and Gitea are servers the person runs, not hosted service choices. Cursor Origin
  source control, its native/mirror profiles and its dedicated inspector are retired. Cursor as an AI provider is unchanged.
  These hosted offerings were agent proposals, not selections Jared made; Gitea Cloud applicable terms could not be read,
  while Cursor terms restrict automated access. generic_git and generic_host remain independent transport-only identities
  and cannot restore a retired service, review, CI, auth or mirror capability.

  DL-273, Jared 2026-11-01: Retired services and hosted variants cannot return through saved onboarding drafts. Their selection, address, account, repository, credential and authorization references and Review confirmation are invalidated, followed by explicit admitted service/address/account selection and fresh owner checks; never silently relabel a hosted tenant as self-managed.

  DL-273, Jared 2026-11-01: Retirement applies to every source of a Source Control service choice, including
  saved or uncommitted controls and incoming actions before they become main-draft selections. Current
  admission is checked again at activation; a retired service or variant cannot start protected sign-in,
  discovery, setup or other service work. An unpicked main draft grants no exception.'
gui_related: true
gui_classification_reason: Changes the Forgejo choices shown in onboarding and Settings while preserving the deferred
  authentication flow.
split_recommended: false
depends_on:
- DL-272
unblocks: []
acceptance_criteria:
- Forgejo choices and current profiles expose only forgejo_self_managed, for a server the person runs. There is no offered
  hosted Forgejo route.
- The same narrowed admission applies to the Forge owner, onboarding and its stored schema; providers whose terms forbid
  AI-written Projects are ineligible.
- Repository-restricted token support remains open and left for now; existing account-based identification, authentication
  and repository selection remain unchanged.
- The source proposal’s 2026-09-02 introduction is not recorded as a Jared approval. Existing commands, settings, credentials
  and Project/permission/generation fences remain.
- 'DL-273, Jared 2026-11-01: Forgejo and Gitea are servers the person runs, not hosted service choices. Cursor Origin
  source control, its native/mirror profiles and its dedicated inspector are retired. Cursor as an AI provider is unchanged.
  These hosted offerings were agent proposals, not selections Jared made; Gitea Cloud applicable terms could not be read,
  while Cursor terms restrict automated access. generic_git and generic_host remain independent transport-only identities
  and cannot restore a retired service, review, CI, auth or mirror capability.'
- 'DL-273: A saved draft for a retired service or hosted variant grants no authority after loading or resuming; PWIZ-024 requires explicit admitted selection and current validation before Review.'

- 'DL-273: Retired service actions are refused before any auth or service-owner handoff regardless of where
  the selected value came from.'

validation_surfaces:
- python3 scripts/pm-plans-verify.py validate-new-contracts
- python3 scripts/pm7-onboarding-rulings-check.py
- python3 scripts/pm-onboarding-contracts.py --check
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: provider_instance_admission
reasoning_tier: high
context_scope: pm7_own_server_forgejo_decision_20261101
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/Planning_Wizard.md
- Plans/forge_integration_contracts.schema.json
- Plans/product_onboarding_contracts.schema.json
- Plans/storage_value_registry.json
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- 'Jared 2026-11-01 via PM7 lead messages1101175626-78dd and1101175823-8b4a: unnamed own-server Forgejo rule, terms compatibility
  with AI-written Projects, and restricted-token support left for now.'
- Git commit3e1842da40cf2e03b48ad62687f95600fcf1d329, 2026-09-02, introduces the earlier hosted variant as source material;
  not a Jared ruling.
- Fields8762cda61a658081878344ddff95f9916c1aa0f0 andf2a9b7a252f589b68cf2862b6b6a2a7c482dfff0, source lineage only.
- 'Jared: You can remove both. Lead1101190655-f8ab. Retirement anchors authorized by lead1101191011-e8cd, 2026-11-01.'
preserved_exact_tokens:
- forgejo_self_managed
- AI-written
- we can leave it for now.
negative_constraints:
- Do not offer hosted Forgejo or infer a hosted endpoint.
- Do not admit a hosting provider whose terms forbid AI-written Projects.
- Do not turn the deferred restricted-token question into new supported behavior.
- Do not alter protected governance artifacts, migration snapshots or the landing baseline.
owner_hints:
- Plans/Forge_Integrations.md
- Plans/Planning_Wizard.md
```

### DL-280 - Approve The Packet And Apply The Later Rulings

```yaml
plan_unit_id: DL-280
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  Jared said on 2026-11-03: "I approve the outstanding questions with their recommended settings." This accepts the Split Projects direction, S1–S16, Y1, O1–O3, N1–N27, P1–P12 and the proposal's Q1–Q11 defaults, with the later corrections recorded in DL-292. Goals and Crew are available without a Project, and the later Plan-mode and scheduled-task ruling overturns N21/N22 as well as the old Q11 exclusion. The approved recommendations, followed by those later rulings, control this pass; older proposal tables and research remain source history. The earlier blanket person-only conversion wording is qualified by N27's guarded YOLO route. DL-273's service retirements and deliberately deferred restricted Forgejo token route remain unchanged. HTML concepts show the approved look and behavior; their demo names, data, APIs and simulated success are not product contracts or native evidence.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
- The approved cards, later ruling and exact changed rule are traceable to their source.
- Quoted user words remain exact; accepted design does not imply native implementation.
validation_surfaces:
- Exact approved card, quotation and supersession coverage review.
risk_class: decision_scope_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/Project_System.md
- Plans/Settings_System.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#280
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- S1–S16
- Y1
- O1–O3
- N1–N27
- P1–P12
- Q1–Q11
negative_constraints:
- Do not revive a superseded recommendation, alter earlier user quotes or grant native/Event Authority/readiness from
  this record.
owner_hints:
- Plans/Decision_Log.md#DL-292
- Plans/Project_System.md#PJCT-012
- Plans/Settings_System.md#SSYS-002
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-292, ContractName:Plans/Project_System.md#PJCT-012, ContractName:Plans/Settings_System.md#SSYS-002


### DL-281 - One Settings Ladder And The Word Computer

```yaml
plan_unit_id: DL-281
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  S1–S3 are accepted. Jared's clarification, 2026-11-02, was: "To clarify, when I say separate settings for different environments, that is what T3
  calls the different computers, but it is where Puppet Master runs its work. I am not sure what we call it." The approved on-screen word is Computer, each by its own name, with This computer for the current one. It means the Server doing the work and the Host where programs, paths or hardware matter; Device means the screen in front of the person. Execution Environment is a finer resource identity, never another settings level.

  Ordinary values follow Default, Everywhere, the offered Computer or Device level, Project when present, then existing owner/chat/run/tab levels. Managed remains above them. Most shared rows may differ per Computer and Project; screen, Project-file, same-for-you and owner-thing rows keep their declared exceptions. Project normally wins; declared safety answers combine more carefully and Computer capacity is a ceiling. Unknown/custom protective combinations use the owner's declared fallback, not an invented ordering. SSYS-002/059 owns classification and resolution. This supersedes the universal Project-only persistence and inheritance bans, resolves q-035 in favor of a real ordinary Everywhere store, and leaves source-memory ledgers unchanged.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
- The approved cards, later ruling and exact changed rule are traceable to their source.
- Quoted user words remain exact; accepted design does not imply native implementation.
validation_surfaces:
- Exact approved card, quotation and supersession coverage review.
risk_class: decision_scope_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/Settings_System.md
- Plans/Server_System.md
- Plans/Glossary.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#281
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/SETTINGS-PROPOSAL.md#12-what-computer-means
preserved_exact_tokens:
- Computer
- Everywhere
- Device
- Execution Environment
- q-035
negative_constraints:
- Do not revive a superseded recommendation, alter earlier user quotes or grant native/Event Authority/readiness from
  this record.
owner_hints:
- Plans/Settings_System.md#SSYS-002
- Plans/Settings_System.md#SSYS-059
- Plans/Server_System.md#SRV-016
- Plans/Glossary.md#G-032
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-002, ContractName:Plans/Settings_System.md#SSYS-059, ContractName:Plans/Server_System.md#SRV-016, ContractName:Plans/Glossary.md#G-032


### DL-282 - One Settings Home And Explicit Joining

```yaml
plan_unit_id: DL-282
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  S7 and S12 are accepted. One Computer keeps the shared settings and other same-owner Computers follow it through explicit protected trust. Each level has one writer and bounded read-only mirrors or caches. A Computer that cannot reach the writer may show the last known values with their age; it cannot queue edits, elect itself writer or silently fail over. Joining two existing setups first chooses the home and shows exact differences, alternatives and affected contexts. The accepted join Undo lasts 30 days. Ordinary per-setting Undo keeps its existing owner policy.

  Home transfer verifies the copy and history, fences the old writer and switches the role generation once. A stale copy acknowledgement cannot prove the old writer is fenced; recovery without that proof remains blocked. Settings following never grants access to Projects, files, chats or another person's work. SSYS-060 and SRV-016 own these rules, with storage binding them rather than creating another synchronization engine.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
- The approved cards, later ruling and exact changed rule are traceable to their source.
- Quoted user words remain exact; accepted design does not imply native implementation.
validation_surfaces:
- Exact approved card, quotation and supersession coverage review.
risk_class: decision_scope_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/Settings_System.md
- Plans/Server_System.md
- Plans/storage-plan.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#282
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- 30 days
- one writer
- read-only
negative_constraints:
- Do not revive a superseded recommendation, alter earlier user quotes or grant native/Event Authority/readiness from
  this record.
owner_hints:
- Plans/Settings_System.md#SSYS-060
- Plans/Server_System.md#SRV-016
- Plans/storage-plan.md#SP-348
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-060, ContractName:Plans/Server_System.md#SRV-016, ContractName:Plans/storage-plan.md#SP-348


### DL-283 - Show Origin And Change At The Actual Place

```yaml
plan_unit_id: DL-283
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  S4–S6 and S8 are accepted. A normal human row edit changes the place the value already comes from, then shows where it went, with narrow re-target and Undo. Agents follow DL-285 instead. The origin word opens Details and replaces the question mark. Unchanged default rows stay quiet; Show where each setting comes from starts Off. Changed means a difference from the factory value, shown by the word Changed and a 1px outline around the control. It is separate from having an own value or varying elsewhere; no side stripe or color-only signal is introduced.

  The shared panel says Used everywhere, except … and shows exact offered levels, target, reasons and recent changes. Manager things have an owner-defined home, reach, Project switches and whole Project versions. Owners keep their records, stable IDs, protected built-ins and editors; Settings does not merge a thing field by field or gain a second writer. All chats and All terminals explicitly target Everywhere through the same Settings transaction.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
- The approved cards, later ruling and exact changed rule are traceable to their source.
- Quoted user words remain exact; accepted design does not imply native implementation.
validation_surfaces:
- Exact approved card, quotation and supersession coverage review.
risk_class: decision_scope_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/Settings_System.md
- Plans/FinalGUISpec.md
- Plans/DRY_Rules.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#283
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- Changed
- 1px
- Details
- Everywhere
negative_constraints:
- Do not revive a superseded recommendation, alter earlier user quotes or grant native/Event Authority/readiness from
  this record.
owner_hints:
- Plans/Settings_System.md#SSYS-061
- Plans/Settings_System.md#SSYS-063
- Plans/FinalGUISpec.md#F3-670
- Plans/DRY_Rules.md#DR-084
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-061, ContractName:Plans/Settings_System.md#SSYS-063, ContractName:Plans/FinalGUISpec.md#F3-670, ContractName:Plans/DRY_Rules.md#DR-084


### DL-284 - Copy Own Values And Selected Accounts Without Keys

```yaml
plan_unit_id: DL-284
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  S9–S11 and P12 are accepted. A detached copy normally brings the source's own values, selected owner-held things and its AI account choices. Advanced can select exact kinds and IDs or Keep them fixed by copying the effective values. Project-file-only values are explicitly chosen where offered. Every owner contributes its own preview, apply, readback and eligible rollback; no ongoing link or later source change affects the destination.

  A sign-in on the same Computer is reused only when the destination chose that account and its owner confirms current readiness. Another Computer resolves the chosen account through its own connection and asks for its own sign-in or key where needed. Keys, tokens, credential/profile bytes, pairings, host-local paths and executable trust do not travel. Ready, check there, sign in there, key needed, not installed, expired and cannot move are one shared readiness list. The copy kind is Notifications & limits, with no billing wording. One confirmation/result and the existing account/history exclusions remain; copied content never becomes permission, live Goal/Plan/Crew state or a notebook.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
- The approved cards, later ruling and exact changed rule are traceable to their source.
- Quoted user words remain exact; accepted design does not imply native implementation.
validation_surfaces:
- Exact approved card, quotation and supersession coverage review.
risk_class: decision_scope_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/Settings_System.md
- Plans/Multi-Account.md
- Plans/Multi-Account_Connection_Spec.md
- Plans/DRY_Rules.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#284
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- Notifications & limits
- Keep them fixed
- own values
negative_constraints:
- Do not revive a superseded recommendation, alter earlier user quotes or grant native/Event Authority/readiness from
  this record.
owner_hints:
- Plans/Settings_System.md#SSYS-062
- Plans/Multi-Account.md#MA-074
- Plans/Multi-Account_Connection_Spec.md#MACS-006
- Plans/DRY_Rules.md#DR-085
- Plans/DRY_Rules.md#DR-089
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-062, ContractName:Plans/Multi-Account.md#MA-074, ContractName:Plans/Multi-Account_Connection_Spec.md#MACS-006, ContractName:Plans/DRY_Rules.md#DR-085, ContractName:Plans/DRY_Rules.md#DR-089


### DL-285 - Agent Settings And Always Choices Keep Their Authority

```yaml
plan_unit_id: DL-285
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  S13, S15 and S16 are accepted. Jared said: "The recommended settings look fine in the questions. Keep in mind, full authorization/yolo mode(I forget what we call it now) also exists and won't ask the user for approvals." An agent normally uses the narrowest offered level within its admitted work. In Regular, changing Everywhere needs the person's current yes. A clearly requested Everywhere change, or an Everywhere-only row, uses admitted YOLO task authority without an extra ordinary yes. It still shows the preview, actor/place, outcome, History and Undo; a Project-only task never expands itself to Everywhere.

  Repository-brought loosening waits for a separate protected acceptance of that source/version. Always allow explicitly chooses This project, This computer or Everywhere, never preselected; a path rule can never be Everywhere. YOLO cannot manufacture that durable choice, trust a new executable source, accept repository loosening, change Managed values, choose the settings home or approve its own grant. Human approval and mode authority remain distinguishable. A read grant or a message to another Project is not setting-write authority.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
- The approved cards, later ruling and exact changed rule are traceable to their source.
- Quoted user words remain exact; accepted design does not imply native implementation.
validation_surfaces:
- Exact approved card, quotation and supersession coverage review.
risk_class: decision_scope_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/Settings_System.md
- Plans/Permissions_System.md
- Plans/Run_Modes.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#285
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/SETTINGS-PROPOSAL.md#12-what-computer-means
preserved_exact_tokens:
- Everywhere
- This project
- This computer
- YOLO
negative_constraints:
- Do not revive a superseded recommendation, alter earlier user quotes or grant native/Event Authority/readiness from
  this record.
owner_hints:
- Plans/Settings_System.md#SSYS-065
- Plans/Permissions_System.md#PS-144
- Plans/Permissions_System.md#PS-146
- Plans/Run_Modes.md#RM-053
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-065, ContractName:Plans/Permissions_System.md#PS-144, ContractName:Plans/Permissions_System.md#PS-146, ContractName:Plans/Run_Modes.md#RM-053


### DL-286 - Reduce Motion And The Saved Look Reach The First Frame

```yaml
plan_unit_id: DL-286
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  S14 is accepted. Reduce motion may be set Everywhere, per Device and per Project; the more careful own value wins and the operating system's reduction request is combined with it. Computer adds no second motion level. This amends only RM1's persistence/resolution in DL-237: its safe feedback, still poses and loop/visibility guards remain.

  The chosen theme family and presentation mode are one atomic pair from one offered level/revision, Everywhere, Device or Project. One Settings-resolved reader supplies the local first frame before a Project opens as well as after it does. A valid saved resolution never flashes an ephemeral Basic Dark look; Basic Dark remains the factory or pre-claim fallback. No surface keeps a last-painted hint or second look store. Onboarding preview remains non-persistent and commits once at the owner's accepted application/Computer or real-Project boundary. This qualifies DL-153/159's universal opening-Project assumptions while keeping one reader, five families, ten variants, retired NieR-toggle migration and existing motion/hero owners.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
- The approved cards, later ruling and exact changed rule are traceable to their source.
- Quoted user words remain exact; accepted design does not imply native implementation.
validation_surfaces:
- Exact approved card, quotation and supersession coverage review.
risk_class: decision_scope_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/Settings_System.md
- Plans/FinalGUISpec.md
- Plans/DRY_Rules.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#286
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- Reduce motion
- Everywhere
- Device
- Project
- Basic Dark
negative_constraints:
- Do not revive a superseded recommendation, alter earlier user quotes or grant native/Event Authority/readiness from
  this record.
owner_hints:
- Plans/Settings_System.md#SSYS-059
- Plans/Settings_System.md#SSYS-065
- Plans/FinalGUISpec.md#F3-468
- Plans/DRY_Rules.md#DR-054
- Plans/DRY_Rules.md#DR-056
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-059, ContractName:Plans/Settings_System.md#SSYS-065, ContractName:Plans/FinalGUISpec.md#F3-468, ContractName:Plans/DRY_Rules.md#DR-054, ContractName:Plans/DRY_Rules.md#DR-056


### DL-287 - No Project Is A Real Chat On A Named Computer

```yaml
plan_unit_id: DL-287
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  N1, N5, N7, N8, N12, N14, N15, N17 and N23 are accepted. No project is an application chat with a null Project ID, never a scratch or default Project. It runs on the current Computer if it is set up, otherwise the person's chosen main Computer, and always names that Computer on phone and web. The choice is fixed after the first message. A visible chat folder under ~/Puppet Master Chats is made only on the first saved file or command; talking and internal Plan records do not make it. Draft attachments have real draft/Computer ownership and adopt the first-message identity once.

  The switcher has a fixed No project row. Its settings use Everywhere, This computer and existing chat levels, skipping Project. Set up a project later still sets up AI on that named Computer, then enters this chat. No chat auto-archives. Chats on an unavailable Computer stay listed as not answering, without silent continuation elsewhere. Delivery order is chat/app workflows and conversion, then explicit cross-project reads/requests, then computer use and cross-computer continuation/conversion. Stages awaiting implementation remain typed unavailable; they are not reversed product decisions.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
- The approved cards, later ruling and exact changed rule are traceable to their source.
- Quoted user words remain exact; accepted design does not imply native implementation.
validation_surfaces:
- Exact approved card, quotation and supersession coverage review.
risk_class: decision_scope_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/assistant-chat-design.md
- Plans/Server_System.md
- Plans/Settings_System.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#287
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- No project
- ~/Puppet Master Chats
- not answering
negative_constraints:
- Do not revive a superseded recommendation, alter earlier user quotes or grant native/Event Authority/readiness from
  this record.
owner_hints:
- Plans/assistant-chat-design.md#ACD-508
- Plans/Server_System.md#SRV-017
- Plans/Settings_System.md#SSYS-065
- Plans/FinalGUISpec.md#F3-671
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-508, ContractName:Plans/Server_System.md#SRV-017, ContractName:Plans/Settings_System.md#SSYS-065, ContractName:Plans/FinalGUISpec.md#F3-671


### DL-288 - A Chat Folder Does Not Grant The Whole Computer

```yaml
plan_unit_id: DL-288
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  N6 and N10 are accepted. The agent may work in its own chat folder and explicitly granted roots under current permissions and FileSafe. FileSafe-on allows task-needed listed home reads while excluding Project folders, Puppet Master data, credentials/sign-in roots, mail and password managers. FileSafe-off does not turn those exclusions into a free read grant. Changing anything outside the admitted roots still needs the applicable guard. A Project is changed through its own chat or conversion, never by an outside write approval.

  Computer use is available to any admitted chat only after per-chat and per-app authorization. It is off until allowed, names the actual Computer and allowed apps, shows a visible strip and session-bound Stop, and never enters protected authentication or password prompts. Current provider/session capability, disclosure and controller ownership remain required in YOLO. Screen frames are transient and scrubbed, not retained as chat history. No new FileSafe switch, test-driver capability or global mouse owner is introduced.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
- The approved cards, later ruling and exact changed rule are traceable to their source.
- Quoted user words remain exact; accepted design does not imply native implementation.
validation_surfaces:
- Exact approved card, quotation and supersession coverage review.
risk_class: decision_scope_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/Permissions_System.md
- Plans/FileSafe.md
- Plans/Tools.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#288
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- FileSafe
- Computer
- Stop
- YOLO
negative_constraints:
- Do not revive a superseded recommendation, alter earlier user quotes or grant native/Event Authority/readiness from
  this record.
owner_hints:
- Plans/Permissions_System.md#PS-145
- Plans/FileSafe.md#F2-213
- Plans/Tools.md#T-186
- Plans/Tools.md#T-187
```

ContractRef: ContractName:Plans/Permissions_System.md#PS-145, ContractName:Plans/FileSafe.md#F2-213, ContractName:Plans/Tools.md#T-186, ContractName:Plans/Tools.md#T-187


### DL-289 - Explicit Other Project Reads Always State Coverage

```yaml
plan_unit_id: DL-289
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  N3 and N19 and Q7/Q9/Q10 are accepted. Every chat may explicitly list, search and read the other Projects that the person can open, subject to each source's current read switch, source Computer, access, content and provider-exposure checks. Regular asks for the read scope once per chat with the explicit time/chat/Computer choices; YOLO uses only its admitted task authority and never creates a durable Always choice. Metadata listing is separate from content consent. Archived Projects are skipped unless named.

  Every result accounts for what was requested, looked in, not looked in and why, and partial or missing ranges. Empty and partial answers include the same quiet expandable coverage sentence; an unread or offline source never becomes a false none. Only bounded authorized results are combined, not physical indexes or ambient retrieval. Notebooks, private memory, safe copies and secrets remain excluded. A later outward effect retains read provenance and follows Permissions' disclosure and actual-network policy; plain web searches remain ordinary searches. A settings follower is not a Project read grant.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
- The approved cards, later ruling and exact changed rule are traceable to their source.
- Quoted user words remain exact; accepted design does not imply native implementation.
validation_surfaces:
- Exact approved card, quotation and supersession coverage review.
risk_class: decision_scope_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/assistant-chat-design.md
- Plans/DRY_Rules.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#289
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- coverage
- not looked in
negative_constraints:
- Do not revive a superseded recommendation, alter earlier user quotes or grant native/Event Authority/readiness from
  this record.
owner_hints:
- Plans/Tools.md#T-185
- Plans/Permissions_System.md#PS-145
- Plans/assistant-chat-design.md#ACD-509
- Plans/DRY_Rules.md#DR-088
```

ContractRef: ContractName:Plans/Tools.md#T-185, ContractName:Plans/Permissions_System.md#PS-145, ContractName:Plans/assistant-chat-design.md#ACD-509, ContractName:Plans/DRY_Rules.md#DR-088


### DL-290 - Requests To Other Chats Respect The Receiver

```yaml
plan_unit_id: DL-290
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  N4 and N18 and Q4 are accepted. An agent drafts a bounded request to the selected chat; Regular asks the person before sending, while an admitted YOLO task may cover that ordinary send. The receiving Project's own Off, Ask me or allowed setting, mode, task ceiling and current permissions decide what happens there. Off refuses. A person-approved exact message may start a normal target turn; an unseen Regular Ask me turn reads and answers until the person accepts changing anything. The sender cannot turn the receiver YOLO, answer its protected approvals or transfer a build grant.

  The existing request/spawn/await owners keep ordering, expiry, replies and identity; this is not another message transport. At most three automatic round trips occur before a person extends the exchange. Starting another Project's Goal goes through a request to that Project's chat. This restriction concerns the other Project's Goal, not an app Goal in the calling No project chat.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
- The approved cards, later ruling and exact changed rule are traceable to their source.
- Quoted user words remain exact; accepted design does not imply native implementation.
validation_surfaces:
- Exact approved card, quotation and supersession coverage review.
risk_class: decision_scope_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/assistant-chat-design.md
- Plans/orchestrator-subagent-integration.md
- Plans/Permissions_System.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#290
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- 'Off'
- Ask me
- YOLO
- three automatic round trips
negative_constraints:
- Do not revive a superseded recommendation, alter earlier user quotes or grant native/Event Authority/readiness from
  this record.
owner_hints:
- Plans/assistant-chat-design.md#ACD-509
- Plans/orchestrator-subagent-integration.md#OSI-439
- Plans/Permissions_System.md#PS-145
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-509, ContractName:Plans/orchestrator-subagent-integration.md#OSI-439, ContractName:Plans/Permissions_System.md#PS-145


### DL-291 - Two Equal Ways To Join A Project With Report And Undo

```yaml
plan_unit_id: DL-291
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  N2, N9, N11, N13, N20, N25 and N27 and Q1/Q2 are accepted. Make a project from this chat and Move this chat into a project are equal first-class choices, neither preselected. Each names what will happen, shows a fresh preview, acts through a button naming the action, then reports moved/stayed/held/failed work and offers Undo. Moving into an existing Project defaults to a separate branch/worktree or admitted Jujutsu change/bookmark and a chosen folder; direct main is Advanced. Keep-both is the conflict default; unsaved work is never overwritten.

  A new Project is committed/listed first. Files copy and verify before the single live writer cuts over, including across Computers. The retained thread ID gets full destination-owned history; original immutable events, usage and receipts stay sealed with lineage and no re-charge. Goal, Crew and Plan default to linked new destination records; only a complete separate owner rebind may change association. Active work is stopped/fenced and exact future schedules are held and explicitly re-admitted with fresh target authority, never silently retargeted or dispatched twice.

  Undo ends at first new work or seven days. It never deletes remote repositories, branches, backups, changed work or independently retained canonical/audit custody. Regular applies by the person; N27 admits the guarded YOLO owner route only when the task clearly asks for a new Project or names the existing destination. Ambiguous convert this still asks for a destination. Merge means a chat joining a Project, not two chats; moving Project chats between Projects comes later.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
- The approved cards, later ruling and exact changed rule are traceable to their source.
- Quoted user words remain exact; accepted design does not imply native implementation.
validation_surfaces:
- Exact approved card, quotation and supersession coverage review.
risk_class: decision_scope_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/assistant-chat-design.md
- Plans/Project_Sync_and_Backbone.md
- Plans/Goal_Runtime_System.md
- Plans/Assistant_Plan_Runtime.md
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#291
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- Make a project from this chat
- Move this chat into a project
- seven days
- Undo
negative_constraints:
- Do not revive a superseded recommendation, alter earlier user quotes or grant native/Event Authority/readiness from
  this record.
owner_hints:
- Plans/assistant-chat-design.md#ACD-510
- Plans/assistant-chat-design.md#ACD-511
- Plans/Project_Sync_and_Backbone.md#PSB-007
- Plans/Goal_Runtime_System.md#GRS-087
- Plans/Assistant_Plan_Runtime.md#APR-074
- Plans/Scheduling_and_Quota_Resume.md#SQR-019
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-510, ContractName:Plans/assistant-chat-design.md#ACD-511, ContractName:Plans/Project_Sync_and_Backbone.md#PSB-007, ContractName:Plans/Goal_Runtime_System.md#GRS-087, ContractName:Plans/Assistant_Plan_Runtime.md#APR-074, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-019


### DL-292 - Goals Crew Plan Modes And Schedules Work Without A Project

```yaml
plan_unit_id: DL-292
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  Jared said on 2026-11-03: "Those look good, except goals and crew should be allowed in no project." He then said: "Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't." These later rulings correct Q11 and explicitly overturn N21 and N22. No project admits ordinary chat, Goals, Crew and the existing admitted collaboration kinds, Plan and Deep Plan, their ordinary Build/Build With Crew/Build As Goal/Build At variants, scheduled messages and scheduled tasks. Only Planning Wizard, PRD Builder and Orchestrator retain no-project workflow gates; an action intrinsically targeting a Project still needs its real target and authority.

  N16, N24 and N26 retain thread-only app memory, widest explicitly taught public-safe rules and the app scratch notebook. App records use genuine null Project scope and actual thread/Computer/writer identity, the existing owners, equal counterpart caps and the same retention, backup, recovery and Stop rules. Plan approval/version bytes and Goal/Plan/Crew bindings stay immutable. One scheduler freezes exact text/attachments or target version/hash and owns timers on the named Server. App Pause is operational state with its own epoch, not a Settings preference. Conversion follows DL-291. Historical Project codecs and event sources remain exact; selected app variants and complete source/read/backup graphs must be admitted together. Acceptance creates no fake Project, WorkNode, source certification or native availability.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
- The approved cards, later ruling and exact changed rule are traceable to their source.
- Quoted user words remain exact; accepted design does not imply native implementation.
validation_surfaces:
- Exact approved card, quotation and supersession coverage review.
risk_class: decision_scope_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/Goal_Runtime_System.md
- Plans/Collaborative_Workflows.md
- Plans/Assistant_Plan_Runtime.md
- Plans/Scheduling_and_Quota_Resume.md
- Plans/Working_Notebook.md
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#292
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- N21
- N22
- Q11
- Plan mode
- scheduled tasks
- No project
negative_constraints:
- Do not revive a superseded recommendation, alter earlier user quotes or grant native/Event Authority/readiness from
  this record.
owner_hints:
- Plans/Goal_Runtime_System.md#GRS-086
- Plans/Collaborative_Workflows.md#CWR-045
- Plans/Assistant_Plan_Runtime.md#APR-073
- Plans/Assistant_Plan_Runtime.md#APR-074
- Plans/Scheduling_and_Quota_Resume.md#SQR-019
- Plans/Scheduling_and_Quota_Resume.md#SQR-020
- Plans/Working_Notebook.md#WN-021
- Plans/assistant-memory-subsystem.md#AMS-054
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-086, ContractName:Plans/Collaborative_Workflows.md#CWR-045, ContractName:Plans/Assistant_Plan_Runtime.md#APR-073, ContractName:Plans/Assistant_Plan_Runtime.md#APR-074, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-019, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-020, ContractName:Plans/Working_Notebook.md#WN-021, ContractName:Plans/assistant-memory-subsystem.md#AMS-054


### DL-293 - New Project And Split Projects Use The Existing Owners

```yaml
plan_unit_id: DL-293
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  The pass-one New Project label and one Use settings from phrase for the two settings-copy routes remain accepted. P5, P7, P10 and P11 are accepted. Split Projects is the quiet library/detail presentation over the one registry and owner-derived status, with labeled Open, Details and More, full paths, explicit archived/removed/missing-folder/empty states and recovery. A duplicate registered copy offers Open on its named Computer and does not block creating another copy. Folder names keep their spaces.

  cmd.project.rename changes display name only, never physical folder, repository, Vault or stable ID. Import from another app stays visible as not here yet and dispatches no working import command. Remove is list-only and separate from Delete data. Source-control, backup, topology, settings and work owners supply their own truth; stale or missing data never becomes healthy, zero or none. Safe distinguishes history, online copy, last complete backup and newer failed/unverified attempts.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
- The approved cards, later ruling and exact changed rule are traceable to their source.
- Quoted user words remain exact; accepted design does not imply native implementation.
validation_surfaces:
- Exact approved card, quotation and supersession coverage review.
risk_class: decision_scope_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/Project_System.md
- Plans/FinalGUISpec.md
- Plans/DRY_Rules.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#293
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- New Project
- Use settings from
- cmd.project.rename
- not here yet
negative_constraints:
- Do not revive a superseded recommendation, alter earlier user quotes or grant native/Event Authority/readiness from
  this record.
owner_hints:
- Plans/Project_System.md#PJCT-012
- Plans/FinalGUISpec.md#F3-668
- Plans/DRY_Rules.md#DR-085
```

ContractRef: ContractName:Plans/Project_System.md#PJCT-012, ContractName:Plans/FinalGUISpec.md#F3-668, ContractName:Plans/DRY_Rules.md#DR-085


### DL-294 - Create Online Copies On Every Offered Service

```yaml
plan_unit_id: DL-294
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  P1 is accepted: new online copies can be created on every service Puppet Master offers, with that service's own fields and the most-private supported and allowed default. GitHub and GH Enterprise, GitLab's offered forms, Azure DevOps Services/Server, Bitbucket Cloud/Data Center and self-managed Forgejo/Gitea each use their admitted owner/capability/auth route. Plain Git remains transport-only. Current service admission is checked at entry, resume and activation; GHES host policy, TFVC refusal, Dedicated unoffered status and DL-273 retirement/token deferral remain.

  Each chain keeps the exact reviewed setup, create or fork result, source preparation/clone or bind, Settings and registry handoff. GitHub keeps its existing specialized route; other forges gain exact owner compositions, not a generic Project-create wrapper. A local-only new Project cannot pretend to have a remote-create effect. Unknown remote outcomes reconcile before retry, failed-before-effect retains no invented remote identity, and a verified created repository survives a later local failure behind the existing recovery anchor. Original-key replay never repeats create or resumes work; a fresh fenced resume performs only remaining effects. Failed setup and conversion Undo never automatically delete the remote repository.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
- The approved cards, later ruling and exact changed rule are traceable to their source.
- Quoted user words remain exact; accepted design does not imply native implementation.
validation_surfaces:
- Exact approved card, quotation and supersession coverage review.
risk_class: decision_scope_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/Project_System.md
- Plans/Forge_Integrations.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#294
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- P1
- GH Enterprise
- transport-only
- DL-273
negative_constraints:
- Do not revive a superseded recommendation, alter earlier user quotes or grant native/Event Authority/readiness from
  this record.
owner_hints:
- Plans/Project_System.md#PJCT-010
- Plans/Forge_Integrations.md#FGI-023
- Plans/Source_Control_System.md#SCS-025
- Plans/Decision_Log.md#DL-273
```

ContractRef: ContractName:Plans/Project_System.md#PJCT-010, ContractName:Plans/Forge_Integrations.md#FGI-023, ContractName:Plans/Source_Control_System.md#SCS-025, ContractName:Plans/Decision_Log.md#DL-273


### DL-295 - Contribution Forks Are GitHub Only For Now

```yaml
plan_unit_id: DL-295
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  P2 and P6 are accepted. Contribute supports GitHub and GitHub Enterprise for now: fork to the chosen account, clone the fork, bind the original as upstream and start a branch or admitted Jujutsu change/bookmark. Review targets explicitly distinguish head/fork and base/original repositories. Fetching and reconciling the original uses the existing native Source Control owner, with exact captured revisions and strategy; publication is a separate admitted stage. A remote name alone never grants permission or selects the repository.

  Other offered forges use the team-project Make a change to offer branch path; no all-provider contribution-fork implementation is invented. A team Project defaults to that branch path, with Work on it directly one tap away. Just copy it remains available for trying something. Capability, account, branch, lease, trust and provider-specific unsupported reasons remain. Existing historical cross-forge fixtures do not imply new support.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
- The approved cards, later ruling and exact changed rule are traceable to their source.
- Quoted user words remain exact; accepted design does not imply native implementation.
validation_surfaces:
- Exact approved card, quotation and supersession coverage review.
risk_class: decision_scope_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/Forge_Integrations.md
- Plans/GitHub_Integration.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#295
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- P2
- P6
- Make a change to offer
- Work on it directly
negative_constraints:
- Do not revive a superseded recommendation, alter earlier user quotes or grant native/Event Authority/readiness from
  this record.
owner_hints:
- Plans/Forge_Integrations.md#FGI-024
- Plans/GitHub_Integration.md#GI-032
- Plans/Source_Control_System.md#SCS-025
```

ContractRef: ContractName:Plans/Forge_Integrations.md#FGI-024, ContractName:Plans/GitHub_Integration.md#GI-032, ContractName:Plans/Source_Control_System.md#SCS-025


### DL-296 - Starters Are Files And Saved Setups Are Configuration

```yaml
plan_unit_id: DL-296
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  P3 is accepted. Project System owns a Starters catalog of versioned local-folder or template-repository file sets, shown in Settings as Starters / My starters. This is separate from Saved setups, the detached configuration-copy presentation over Settings and owner contributions. The existing Project template/composition engine uses an explicit kind, not a new manager or engine. A local-only Project may use a Starter without an online account.

  Starter preview freezes the exact files, placeholders, destination, permissions and source/secret scan; revalidate them before copying. Neither history directories nor secrets or executable trust are copied. README, ignore list and license for initializing an online copy stay in its single Advanced section; the default ignore list remains its own setting. Saved setups contain no files, history, live Goal/Plan/Crew records, notebook bodies, host paths or keys, and never inherit later edits from a source Project.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
- The approved cards, later ruling and exact changed rule are traceable to their source.
- Quoted user words remain exact; accepted design does not imply native implementation.
validation_surfaces:
- Exact approved card, quotation and supersession coverage review.
risk_class: decision_scope_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/Project_System.md
- Plans/Settings_System.md
- Plans/DRY_Rules.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#296
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- Starters
- My starters
- Saved setups
- Advanced
negative_constraints:
- Do not revive a superseded recommendation, alter earlier user quotes or grant native/Event Authority/readiness from
  this record.
owner_hints:
- Plans/Project_System.md#PJCT-011
- Plans/Settings_System.md#SSYS-062
- Plans/DRY_Rules.md#DR-085
```

ContractRef: ContractName:Plans/Project_System.md#PJCT-011, ContractName:Plans/Settings_System.md#SSYS-062, ContractName:Plans/DRY_Rules.md#DR-085


### DL-297 - Inspect Sources Keep Format In Settings And Protect Backups

```yaml
plan_unit_id: DL-297
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  P4, P8 and P9 are accepted. A new repository's object-format choice is in Settings only; this supersedes DL-051's setup-picker placement and retains permanent-format/capability evidence and no cross-format migration. New Project inspects every admitted local/Server/SSH/SMB/NFS/mounted source read-only, reporting actual Git/Jujutsu history, branch/bookmark, dirty state, remotes, submodules, LFS, hooks and duplicate-copy evidence. Discovered origin never links an account or repository by itself. Jujutsu lacks submodule/LFS support and does not run Git hooks; inspection may suggest Git without silently replacing existing history. New Project offers no no-history alternative.

  Backup names the place and inclusion/policy before sign-in, tests non-destructively, offers daily by default and labels retention Standard with actual Advanced time/zone/counts, using the existing 7 daily/4 weekly/6 monthly seed. First policy creation uses absent-key compare-and-set on policy.update, not a new create command. Archive pauses its schedule and preserves the last good backup, with no prune; unarchive restores eligibility, not a hidden run or cleared Stop. Recovery Kit remains protected. Full Server Backup includes canonical app work; restored app/chat/task lineage prevents a second live writer. Restore rewrites PM-internal identities while external forge identity remains historical until revalidated.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
- The approved cards, later ruling and exact changed rule are traceable to their source.
- Quoted user words remain exact; accepted design does not imply native implementation.
validation_surfaces:
- Exact approved card, quotation and supersession coverage review.
risk_class: decision_scope_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
- Plans/Backup_Restore_System.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#297
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- Standard
- 7 daily/4 weekly/6 monthly
- DL-051
- Settings only
negative_constraints:
- Do not revive a superseded recommendation, alter earlier user quotes or grant native/Event Authority/readiness from
  this record.
owner_hints:
- Plans/Jujutsu_Integration.md#JJI-023
- Plans/Source_Control_System.md#SCS-025
- Plans/Backup_Restore_System.md#BRS-032
- Plans/Backup_Restore_System.md#BRS-033
```

ContractRef: ContractName:Plans/Jujutsu_Integration.md#JJI-023, ContractName:Plans/Source_Control_System.md#SCS-025, ContractName:Plans/Backup_Restore_System.md#BRS-032, ContractName:Plans/Backup_Restore_System.md#BRS-033


### DL-298 - YOLO Pushes And Publishes With Narrow Force Push Authority

```yaml
plan_unit_id: DL-298
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  Jared ruled on 2026-11-03: "YOLO mode needs to absolutely be able to git push and publish." Ordinary Git/Jujutsu, package, image and template publication and needed repository-create effects proceed in admitted YOLO work without repeated ordinary yes prompts. Regular keeps its actual approvals. Automated authority is recorded as mode authority, never a fabricated human approval. Existing private/default visibility, actual destination/account/capability, currentness, unknown-effect reconciliation, truthful reports and No safe Undo disclosure remain.

  Y1 is accepted as recommended: force-push needs a current expected-head lease and a branch Puppet Master created for this work. It never permits main, default, protected, unrelated or merely imported branches and has no unleased force fallback. Ordinary YOLO still asks for prune, deleting remote branches/repositories, destructive discard and Kubernetes delete/exec unless a separate exact build grant covers the operation under DL-299. DAE, FileSafe, trust, secrets, source/receiver/parent ceilings, explicit Always choices and Stop remain. YOLO is runtime yolo, not the Full permission profile. This supersedes the stale universal publication yes/never-YOLO clauses in Permissions, Run Modes and Containers owners only to this extent.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
- The approved cards, later ruling and exact changed rule are traceable to their source.
- Quoted user words remain exact; accepted design does not imply native implementation.
validation_surfaces:
- Exact approved card, quotation and supersession coverage review.
risk_class: decision_scope_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/Permissions_System.md
- Plans/Run_Modes.md
- Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#298
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- YOLO mode needs to absolutely be able to git push and publish.
- Y1
- DAE
- FileSafe
- Full
negative_constraints:
- Do not revive a superseded recommendation, alter earlier user quotes or grant native/Event Authority/readiness from
  this record.
owner_hints:
- Plans/Permissions_System.md#PS-146
- Plans/Permissions_System.md#PS-148
- Plans/Run_Modes.md#RM-053
- Plans/Containers_Registry_and_Unraid.md#CRAU-104
```

ContractRef: ContractName:Plans/Permissions_System.md#PS-146, ContractName:Plans/Permissions_System.md#PS-148, ContractName:Plans/Run_Modes.md#RM-053, ContractName:Plans/Containers_Registry_and_Unraid.md#CRAU-104


### DL-299 - Approve A Build Grant Once And Show Every Target

```yaml
plan_unit_id: DL-299
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  Jared asked: "Isnt orchestrator going to need a lot of permissions to fully build an entire platform from plans that the planning wizard makes? Its hands off from the human in that process so I would think so." O1–O3 are accepted as recommended. The person approves one exact Plan-bound build grant listing needed operations and resources: repository create/push, publication namespaces, CI setup/execution and deployment targets. The Orchestrator and narrower children then run YOLO within that grant, without repeating those ordinary prompts. A changed Plan, target, permission ceiling or Stop/revocation generation never silently widens it; no agent issues, expands or renews its own grant.

  A verified created-resource manifest binds stable IDs/generations and ownership receipts. The build may change or clean up what this grant demonstrably created, within the enumerated operations. Naming a pre-existing resource does not grant deletion, a name prefix is not ownership and a namespace does not authorize every child object. This is the narrow grant exception to Y1's ordinary risky-action asks, never permission to force-push main, touch unrelated resources or bypass FileSafe/trust/secrets. Secrets, paid sign-ups and protected administration retain their separate human choices.

  What the build did reads the existing work/History projection and lists each remote action, exact target, authority and outcome, including pending, blocked or unknown. One run-owner Stop fences new dispatch and children. Undo is offered only where safe; otherwise say No safe Undo. Existing final YOLO checks remain. App Goals/Crew and cross-project requests cannot borrow this Project's grant.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on: []
unblocks: []
acceptance_criteria:
- The approved cards, later ruling and exact changed rule are traceable to their source.
- Quoted user words remain exact; accepted design does not imply native implementation.
validation_surfaces:
- Exact approved card, quotation and supersession coverage review.
risk_class: decision_scope_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/Permissions_System.md
- Plans/orchestrator-subagent-integration.md
- Plans/human-in-the-loop.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#299
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- O1–O3
- build grant
- What the build did
- No safe Undo
negative_constraints:
- Do not revive a superseded recommendation, alter earlier user quotes or grant native/Event Authority/readiness from
  this record.
owner_hints:
- Plans/Permissions_System.md#PS-147
- Plans/Permissions_System.md#PS-148
- Plans/orchestrator-subagent-integration.md#OSI-441
- Plans/human-in-the-loop.md#HITL-038
- Plans/FinalGUISpec.md#F3-673
```

ContractRef: ContractName:Plans/Permissions_System.md#PS-147, ContractName:Plans/Permissions_System.md#PS-148, ContractName:Plans/orchestrator-subagent-integration.md#OSI-441, ContractName:Plans/human-in-the-loop.md#HITL-038, ContractName:Plans/FinalGUISpec.md#F3-673


### DL-300: Event Authority Admits The App Scope Editions And Three New Families

```yaml
plan_unit_id: DL-300
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-300 records Jared's approval of 2026-11-04 ("Admit them now") of the Event Authority checkpoint that
  registers settings.layer.changed (Plans/Settings_System.md#SSYS-060), approval.chat_tool_requested and
  approval.chat_tool_resolved (Plans/Permissions_System.md#PS-145), and gives eleven Goal event families the exact
  application scope-selector edition of Plans/Contracts_V0.md#CV-366 and Plans/Goal_Runtime_System.md#GRS-086
  (scope_policy application_or_project, payload_versions, payload_selection_policy
  exact_scope_and_schema_id_no_fallback). Registry checkpoint: Plans/event_family_registry.json revision
  2026-11-04.1 (46 families) is approved as the PNC-019 baseline, superseding 2026-10-09.1, in the manner of
  DL-039, DL-045 and DL-188. Registration admits the families and selectors only: every application payload
  version keeps producer_admission requires_owner_adoption, so no app producer may append until its owner adopts
  it; Project payload bytes and Project producers are unchanged, and events already written are never rewritten.
  This is the one Event Authority grant of the projects and settings refresh; DL-280 through DL-299 still grant
  none. The checkpoint evidence and the readiness receipt are refreshed by the next reseal.
gui_related: false
gui_classification_reason: Records an Event Authority checkpoint approval for persisted event families.
split_recommended: false
depends_on: [DL-292]
unblocks: [SSYS-060, PS-145, CV-366, GRS-086]
acceptance_criteria:
  - "Plans/event_family_registry.json is registry revision 2026-11-04.1 with 46 families: the 43 of 2026-10-09.1, eleven of them Goal families with the exact CV-366 scope-selector edition, plus settings.layer.changed, approval.chat_tool_requested and approval.chat_tool_resolved."
  - "The PNC-019 checkpoint pinned in scripts/pm_pnc019_currentness.py names that revision and 46 rows; the browser and emit-only admission gates accept the eleven editions and the three families only by exact digest or whole-row fingerprint."
  - "Every application payload version keeps producer_admission requires_owner_adoption, and no Project payload byte changes."
  - "No unit still calls these three families proposed or candidate pending Event Authority admission."
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
  - python3 scripts/pm-plans-verify.py validate-browser-event-admission
  - python3 scripts/pm-plan-index.py validate
risk_class: event_authority_checkpoint_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
  - Plans/event_family_registry.json
  - Plans/browser_event_admission.json
  - Plans/Settings_System.md
  - Plans/Permissions_System.md
  - Plans/storage-plan.md
  - scripts/pm_pnc019_currentness.py
  - scripts/pm-browser-event-admission.py
  - scripts/pm_emit_only_event_contract.py
  - Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "T3 thread 42da24d4-cc18-4469-8092-ed4f38d15061, 2026-11-04: Jared's answer \"Admit them now\" to the lead's question on the three new families and eleven Goal editions in the registry"
  - "/mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/Fd-phase2-report.md, SHA-256 977ae697c027507bd4532e89889145371d266341a57848ed234e4567d7aff584 (the registry rows)"
  - "Plans/Decision_Log.md#DL-188 (the checkpoint pattern; cited, not a dependency)"
preserved_exact_tokens:
  - "DL-300"
  - "2026-11-04.1"
  - "settings.layer.changed"
  - "approval.chat_tool_requested"
  - "approval.chat_tool_resolved"
  - "requires_owner_adoption"
negative_constraints:
  - "Do not let registration admit an application producer append."
  - "Do not rewrite events already written."
owner_hints:
  - Plans/Settings_System.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
```


### DL-302 - DL-260 Also Supersedes DL-173's Concept-Only Demo Controls

```yaml
plan_unit_id: DL-302
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-302 records Jared's answer of 2026-11-04 ("2. yes") to the demo-cleanup question whether DL-260 also covers
  DL-173: DL-260 ("Product canon excludes prototype mechanics") supersedes the "concept-only demo controls" item in
  DL-173's list of the Usage redesign's requirements, as it supersedes the concept-mechanics portions of the decisions
  it names. DL-173's other decisions and its historical bytes are unchanged. Plans/usage-feature.md#UF-107 and the
  other Usage owners carry only real product behavior; the concept keeps its demo controls (Jared, 2026-11-04: "the
  demo stuff should be in PMConcept7, just not in the plans docs").
gui_related: false
gui_classification_reason: Records the supersession of a historical demo-control requirement; no GUI contract changes.
split_recommended: false
depends_on: [DL-260, DL-173]
unblocks: []
acceptance_criteria:
  - "No live Plans unit treats DL-173's concept-only demo controls as a product requirement."
  - "DL-173 and DL-260 keep their bytes."
validation_surfaces:
  - python3 scripts/pm7-demo-canon-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: prototype_promoted_to_product_or_real_rule_lost
reasoning_tier: medium
context_scope: product_canon_boundary
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521 (pm7-build), 2026-11-04: Jared's answer \"1. yes 2. yes\" to the stream P demo-cleanup questions; 2 is this entry"
  - "/mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/demo-cleanup/classify-C.md (the DL-173 history row)"
preserved_exact_tokens:
  - "DL-302"
  - "concept-only demo controls"
owner_hints:
  - Plans/usage-feature.md
```
