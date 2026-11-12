# Shard 011: DL-271 — Onboarding credential, recovery and pairing feedback

Source: `Plans/Decision_Log.md`

Source lines: L28747-L31559

Source SHA256: `8f4901fb35459ac7c3b90fe28af65b37eff861c85952f8e444c76d7e1488ac62`

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


### DL-301 - Theme Chooses A Family And One Control Chooses The Scheme

```yaml
plan_unit_id: DL-301
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: |-
  Jared, 2026-11-04: "We don't need light and dark next to each theme, since it's at the top with auto. So just the 1 control."
  Theme offers only Basic, Friendly, Retro, Glass and NieR. One Light / Dark / Auto control chooses the scheme for every family. A family pick preserves that scheme, including Auto. The title-bar quick switch retains its existing five-family and single-scheme separation. The older Basic light/dark control is no longer offered, including in advanced Settings.
  This supersedes exactly the DL-228 amendment in SSYS-010 that read: "picking a named variant, such as Glass Light, while Theme Mode is Auto commits that variant and its mode as one SSYS-009 transaction, even when the variant is already the stored value, so the mode leaves Auto". Visible family picks now preserve Auto. The ten composite storage values remain compatible, existing per-Project selections survive reload, and no data migration is introduced. The older Basic scheme value remains compatibility input; theme-mode decides the scheme. SSYS-009's atomic pair, refusal behavior and Settings ownership remain binding.
gui_related: true
gui_classification_reason: Defines the visible theme choices and the single scheme control.
split_recommended: false
depends_on: [DL-228]
unblocks: [SSYS-010]
acceptance_criteria:
- Theme offers five family names and no light/dark variants; exactly one scheme choice offers Light, Dark and Auto.
- Every family works in both schemes and Auto; family changes preserve the scheme and existing per-Project selections survive reload.
- The superseded DL-228 sentence is identified exactly; ten composite storage values remain compatible without migration.
validation_surfaces:
- Settings Theme and scheme controls, title-bar quick switch, Project reload and Auto OS appearance changes.
risk_class: appearance_choice_or_compatibility_drift
reasoning_tier: high
context_scope: theme_scheme_ruling_20261104
implementation_surfaces:
- Plans/Settings_System.md
- Plans/settings_inventory.json
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- "Jared's verbatim SW-04 ruling, 2026-11-04, implementation lane task in T3; /mnt/Cursor/share/puppet-master/2026-11-04-program/streams/F/theme/REPORT.md"
- "pm-fo-lead mail 1104184345-2f61: Plans owner authorizes DL-301 and narrow DL-228 supersession"
preserved_exact_tokens:
- "We don't need light and dark next to each theme, since it's at the top with auto. So just the 1 control."
- Light / Dark / Auto
- DL-228
negative_constraints:
- Do not change the ten composite storage values, add a migration or remove the title-bar quick switch.
owner_hints:
- Plans/Settings_System.md#SSYS-010
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-010, ContractName:Plans/Decision_Log.md#DL-228

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


### DL-330 - Planning Wizard Owns Wizard Status And The Blocked States; Decision Policy Keeps The Clarification Limits

```yaml
plan_unit_id: DL-330
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-330 records Jared's answer of 2026-11-05 ("approve all") to closure question 2 on wizard ownership.
  Plans/Planning_Wizard.md owns wizard_status and the wizard attention_required and blocked states, their
  transitions, the blocked record and the blocked clear rule (PWIZ-038), migrated from retired
  Plans/chain-wizard-flexibility.md with only names updated to current canon. Plans/Decision_Policy.md keeps the clarification-round limits (section 6.5,
  DP-064) and points them at the Planning Wizard, and keeps the requirements-quality check (section 6.4), whose
  blocking rules are already there. Plans/DRY_Rules.md section 2.1 (DR-009) and the other live references that
  named the retired document as the owner of these items now route to the new owners, and the retired document's
  Owner / Consumer Map says where each item went. The approved removal of section 6.4's pointer to the retired
  section 12 is not applied by this record: moving that loop definition showed it needs the Requirements Completion
  Contract (retired section 14) and the report shaping rules (sections 14.1-14.2), which Decision Policy does not
  hold, so the answer said to stop and return that question to Jared rather than invent a home for them.

  Amended 2026-11-05 (coordinator resolution under Jared's answer to closure question 2; pm7-build, pm-mail
  1105045522-d98a): the stop above is resolved without returning to Jared, because the move carries out the
  recommendation his answer ("approve all") approved, that Decision Policy also keeps the requirements-quality check
  because its blocking rules are already there. The Requirements Completion Contract C-1 to C-5 (retired section 14),
  the report rules (sections 14.1-14.2), the requirements-quality steps of the section 12 Auditor loop and the part of
  section 15 that the section 6.4 blocking rule relies on (its opening and the section 15.1 escalation trigger) move
  into section 6.4 as a new unit, Plans/Decision_Policy.md#DP-066. The criteria and report steps keep their wording
  except the retired vocabulary and references: the Planning Wizard replaces the Chain Wizard/Interview phase
  (GRS-028), post-repair replaces post-Pass-2 (the 2026-06-18 retirement of fixed passes), and the retired document's
  section references point inside DP-066, to Plans/Planning_Wizard.md#PWIZ-038 or to section 6.5. One pronoun names
  the Auditor loop because the sentence it pointed back to did not move, and one added sentence says where the rest
  of section 15 went. DP-066 lists every changed word and its reason. Section 6.4's pointer to the retired section 12 is replaced by DP-066, DP-034 no longer names the
  retired document as a surface or owner hint, and the retired document's Owner / Consumer Map says where each item
  went. Section 12's generic Auditor invariant loop, which other live documents still cite, is not part of this
  answer.
gui_related: false
gui_classification_reason: Records an owner-routing decision; the GUI behavior it moves is defined by PWIZ-038.
split_recommended: false
depends_on: [PWIZ-038, DP-064, DP-066]
unblocks: []
acceptance_criteria:
  - "No live Plans unit or routing table names Plans/chain-wizard-flexibility.md as the owner of wizard_status, the wizard blocked states and transitions, or the clarification-round limits."
  - "PWIZ-038 and DP-064 carry the migrated semantics, and the retired document's Owner / Consumer Map names both."
  - "Amended 2026-11-05: section 6.4 and DP-034 no longer point to retired Plans/chain-wizard-flexibility.md for the requirements-quality loop; DP-066 holds the Requirements Completion Contract, the report rules, the loop's requirements-quality steps and the escalation trigger."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_routing_to_retired_document
reasoning_tier: high
context_scope: closure_owner_answers_20261105
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Planning_Wizard.md
  - Plans/Decision_Policy.md
  - Plans/DRY_Rules.md
  - Plans/Progression_Gates.md
  - Plans/FinalGUISpec.md
  - Plans/Wiring_Matrix.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521 (pm7-build), 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to the closure questions; question 2 (closure rows B06 106, 112, 117, 118, 119, 125) is this entry"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/source-records.md (the closure records and the fix each asked for)"
  - "pm-mail 1105045522-d98a (coordinator pm7-build, 2026-11-05): resolution A, move the Requirements Completion Contract and the report steps into a new Decision_Policy section 6.4 unit as a coordinator resolution under this record, without the retired vocabulary"
preserved_exact_tokens:
  - "DL-330"
  - "wizard_status"
  - "clarification-round limits"
  - "PWIZ-038"
  - "DP-064"
  - "DP-066"
owner_hints:
  - Plans/Planning_Wizard.md
  - Plans/Decision_Policy.md
  - Plans/DRY_Rules.md
```


### DL-331 - Retire The Exact Token "Playwright optional" With A Ledger Correction

```yaml
plan_unit_id: DL-331
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-331 records Jared's answer of 2026-11-05 ("approve all") to closure question 3: the exact-token requirement
  "Playwright optional" of ledger pldg-20260617-001-plans-to-code-handoff atom-0031 is retired by an append-only
  ledger correction (corr-0012, event evt-0019), and the words are not restored to ATS-004, RAP-029 or T-159. The
  2026-08-13 browser terminology decision (Plans/Automated_Testing_System.md#ATS-035, Plans/Tools.md#T-159) removed
  Playwright as any Puppet Master path on purpose: Puppet Master has no Playwright runtime, facade, compatibility
  layer or fallback, and a user Project's own Playwright suite runs only as a generic external Project
  command/process that is not a fallback for BrowserRuntimeService. atom-0031's other exact tokens and its rule that
  native Puppet Master web testing is not defaulted to Playwright stay in force; the atom record is unchanged.
gui_related: false
gui_classification_reason: Records the retirement of a ledger exact-token requirement; no GUI contract changes.
split_recommended: false
depends_on: [ATS-035, T-159]
unblocks: []
acceptance_criteria:
  - "Ledger pldg-20260617-001-plans-to-code-handoff records corr-0012 and evt-0019 linking atom-0031, and its validator passes."
  - "ATS-004, RAP-029 and T-159 do not reintroduce an optional or fallback Puppet Master Playwright path."
validation_surfaces:
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260617-001-plans-to-code-handoff
  - python3 scripts/pm-plan-index.py validate
risk_class: retired_token_revived_or_ledger_unrecorded
reasoning_tier: medium
context_scope: closure_owner_answers_20261105
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/ledgers/v2/pldg-20260617-001-plans-to-code-handoff/records/corrections.jsonl
  - Plans/ledgers/v2/pldg-20260617-001-plans-to-code-handoff/events.jsonl
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521 (pm7-build), 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to the closure questions; question 3 (closure row B03 66) is this entry"
  - "Plans/ledgers/v2/pldg-20260617-001-plans-to-code-handoff/records/corrections.jsonl#corr-0012"
preserved_exact_tokens:
  - "DL-331"
  - "Playwright optional"
  - "atom-0031"
  - "corr-0012"
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/Tools.md
```


### DL-332 - UF-019 Distinguishes Gemini Direct From Antigravity CLI

```yaml
plan_unit_id: DL-332
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-332 records Jared's answer of 2026-11-05 ("approve all") to closure question 4: Plans/usage-feature.md#UF-019
  is reworded so Usage distinguishes the two current Gemini-family routes, Gemini Direct and Antigravity CLI, instead
  of Gemini direct versus Gemini CLI. Gemini CLI stays retired/source-lineage vocabulary only (UF-021) and is never an
  active Usage route or distinction.
gui_related: false
gui_classification_reason: Records a provider-route wording decision; no GUI contract changes.
split_recommended: false
depends_on: [UF-019, UF-021]
unblocks: []
acceptance_criteria:
  - "UF-019 names Gemini Direct and Antigravity CLI as the routes Usage distinguishes, and names Gemini CLI only as retired lineage."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: retired_provider_route_revived
reasoning_tier: medium
context_scope: closure_owner_answers_20261105
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521 (pm7-build), 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to the closure questions; question 4 (closure row B14 317) is this entry"
preserved_exact_tokens:
  - "DL-332"
  - "Gemini Direct"
  - "Antigravity CLI"
  - "Gemini CLI"
owner_hints:
  - Plans/usage-feature.md
  - Plans/CLI_Bridged_Providers.md
```

### DL-334 - June Audit Directories Get A Bounded Legacy Format Rule; Uncovered Rows Get A Supplemental Closure Pass

```yaml
plan_unit_id: DL-334
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-334 records Jared's answer of 2026-11-05 ("approve all") to stream C's question 7 on the per-audit completeness
  failures of the June audits. It is a split. (a) audit-20260619-002 gets an append-only supplemental closure pass,
  because its uncovered row is a real gap. (b) The audit directories written before July 2026 get a legacy rule for
  format and schema-evolution errors only; new audits stay under the full rules. The legacy rule must not excuse a
  missing closure row or any other substantive gap in any audit. This loosens a check, and the limit is stated plainly
  in Plans/Planning_Ledger_System.md#PLS-026. Measured on the audit data of commit 6fac1ed357 (after the
  audit-20260619-002 and audit-20260619-004 supplemental rows), with the closure matrix required and effective status
  optional: the 55 June directories report 44,557 per-audit errors under the earlier validator; the rule reports
  31,793 of them as warnings and keeps 12,764 as errors, and 19 of the 55 directories pass; every directory from July
  on reports exactly what it reported before. The rule also covers closure rows over source rows that are
  non-actionable only by the compatibility inference: those rows predate the explicit repair_required field, so
  whether they need repair is inferred, and a historical closure that over-covers them leaves nothing unrepaired. A
  row that states repair_required or finding_level, or a closure row added later, keeps that error. Jared's answer
  names the supplemental pass for audit-20260619-002 only. The coordinator (pm7-build, 2026-11-05, pm-mail
  1105030457-ade2) applied the same approved option to the other June audits with uncovered actionable rows; that
  extension is a coordinator resolution, not Jared's words, and under it a row closes only if its repair is real
  against current canon.
gui_related: false
gui_classification_reason: Records a governance decision about historical audit validation; no GUI contract changes.
split_recommended: false
depends_on: [PLS-025, PDS-014]
unblocks: []
acceptance_criteria:
  - "Plans/Planning_Ledger_System.md#PLS-026 states which errors the legacy rule reports as warnings and that it never excuses a missing closure row or any other substantive gap."
  - "audit-20260619-002's uncovered planunit_source_claims.jsonl:31 row is closed by an appended matrix row and a supplemental_closure_pass record; no existing row changes."
validation_surfaces:
  - python3 scripts/pm-audit-closure.py self-test
  - python3 scripts/pm-plan-index.py validate
risk_class: governance_integrity
reasoning_tier: high
context_scope: semantic_audit_closure
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Planning_Ledger_System.md
  - scripts/pm-audit-closure.py
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521 (pm7-build), 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to the five stream C questions; question 7 is this entry"
  - "/mnt/Cursor/share/puppet-master/2026-11-04-program/streams/C-REPORT.md (question 7)"
preserved_exact_tokens:
  - "DL-334"
  - "must not excuse a missing closure row or any other substantive gap"
owner_hints:
  - Plans/Planning_Ledger_System.md
```

### DL-336 - Settings Names Govern Verification Repair Strategies

Coordinator resolution A1 (pm7-build, 2026-11-05; mail `1105125610-4b4f` answering stream C's `1105125445-d6fd`) makes the Settings repair-strategy names and order canonical. The three GRS-027 spellings are retired through an append-only ledger correction. The restored rules live in EP-098, EP-102, EP-103, CV-288, OSI-428, and the corrected 0PI-056 owner map.

```yaml
plan_unit_id: DL-336
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-336 records coordinator resolution A1 by pm7-build on 2026-11-05 (mail 1105125610-4b4f answering stream C's 1105125445-d6fd): Settings planning.verification.repair-strategies supplies the canonical repair-strategy names and their order. The GRS-027 spellings escalate_capability_lane, assign_specialist_subagents, and manual_decision are retired by append-only ledger correction corr-0010; their replacements are escalate_capability, assign_specialists, and manual. The rename changes spellings only, not when a strategy applies: manual remains for a true product blocker and follows the internal escalation ladder by default, with earlier use only where explicit HITL policy requires it (EP-102). The atom-0046 record remains unchanged, and GRS-027 remains superseded source lineage.
  The five restored rules live in active owners: repeated-defect thresholds in EP-102 with repair-loop owner routing corrected in 0PI-056; the failed VerificationCycle, DefectBundle, bounded RepairWorkNode, and verification-rerun loop in EP-098 with the DefectBundle definition in CV-288; the Settings-ordered ten-value repair-strategy set in EP-102; cost controls that preserve required verification, receipts, and certification gates in OSI-428; and the certified complete gate in EP-103. Independent review by risk tier and degraded finish remain open product questions and are not resolved by this decision.
gui_related: false
gui_classification_reason: Records runtime repair-strategy naming and owner routing; no GUI contract changes.
split_recommended: false
depends_on: [0PI-056, CV-288, EP-098, EP-102, EP-103, OSI-428]
unblocks: []
acceptance_criteria:
  - EP-102 lists patch, replan, split_node, merge_node, widen_context, rollback, escalate_capability, assign_specialists, manual, and authority_blocked in Settings order.
  - The ledger records corr-0010 and evt-0017 retiring the three GRS-027 spellings without changing atom-0046.
  - Active owner units carry all five restored rules, and 0PI-056 routes verification repair-loop policy to Executor_Protocol.
  - This decision does not settle independent review by risk tier or degraded finish.
validation_surfaces:
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260616-002-orchestrator-goal-runtime-flow
  - python3 scripts/pm-plan-index.py validate
risk_class: repair_strategy_owner_drift
reasoning_tier: high
context_scope: closure_grs027_lost_rules_20261105
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/00-plans-index.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/ledgers/v2/pldg-20260616-002-orchestrator-goal-runtime-flow/records/corrections.jsonl
  - Plans/ledgers/v2/pldg-20260616-002-orchestrator-goal-runtime-flow/events.jsonl
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "pm7-build coordinator resolution A1, 2026-11-05, mail 1105125610-4b4f answering stream C mail 1105125445-d6fd"
  - "Plans/ledgers/v2/pldg-20260616-002-orchestrator-goal-runtime-flow/records/corrections.jsonl#corr-0010"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/qc/widen/fix-packet/FIX-PACKET-BRIEF.md"
preserved_exact_tokens:
  - "DL-336"
  - "A1"
  - "escalate_capability_lane"
  - "assign_specialist_subagents"
  - "manual_decision"
  - "escalate_capability"
  - "assign_specialists"
  - "manual"
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
```

### DL-337 - Independent Review Stays A Free Choice, On By Default

Jared answered stream C's card 1 on 2026-11-05 ("on by default, always free"): users may turn off independent review of their own work, including high-risk work. The Settings toggle stays on by default and always free. GRS-027's rule scaling independent review to the risk tier is retired. The Models System floor on the verifier model stays.

```yaml
plan_unit_id: DL-337
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-337 records Jared's answer of 2026-11-05 to stream C's card 1, "Can users turn off independent review on high-risk work?": "on by default, always free." Independent review stays a user choice on every piece of work: Settings planning.verification.independent-review ("Never let the builder grade its own work") remains on by default and always free to turn off, including on high-risk work. The superseded GRS-027 requirement that independent review scale with the risk or certification tier is retired; GRS-049 stands, so review is chosen by its owner rather than imposed by Goal. MS-128's rule that the verifier or adjudicator model cannot be downgraded below the risk tier stays in force: it governs the model a review uses when a review runs, not whether one runs. This decision covers the review of a user's own work: the Orchestrator and Executor verification that GRS-027's risk-tier rule described, and the Settings toggle. It does not change the evidence rules for Puppet Master's own deliverables, such as F3-524's two independent reviews of high-risk campaign spans, which certify the product's GUI evidence rather than a user's run.
  OSI-428's cost-control sentence now reads that cost controls cannot disable required verification, receipts, independent review where its owner requires it, or certification gates. Ledger correction corr-0011 retires atom-0055's risk-tiered independent-review requirement without editing the atom record.
gui_related: false
gui_classification_reason: Records a product decision about an existing Settings toggle; no GUI contract changes.
split_recommended: false
depends_on: [F3-524, GRS-049, MS-128, OSI-428]
unblocks: []
acceptance_criteria:
  - Settings planning.verification.independent-review stays a toggle, on by default, that the user may turn off on any work.
  - No active Orchestrator or Executor owner requires the independent review of a user's run to scale with the risk or certification tier.
  - Evidence rules for Puppet Master's own deliverables, including F3-524's reviews of high-risk campaign spans, are unchanged.
  - OSI-428 says cost controls cannot disable independent review where its owner requires it.
  - MS-128's verifier and adjudicator model floor is unchanged.
validation_surfaces:
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260616-002-orchestrator-goal-runtime-flow
  - python3 scripts/pm-plan-index.py validate
risk_class: review_policy_drift
reasoning_tier: high
context_scope: closure_owner_answers_20261105
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/ledgers/v2/pldg-20260616-002-orchestrator-goal-runtime-flow/records/corrections.jsonl
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521 (pm7-build), 2026-11-05T17:02:41Z: Jared's answer \"on by default, always free\" to stream C card 1, relayed in pm-mail 1105170344-5b48"
  - "/mnt/Cursor/share/puppet-master/2026-11-04-program/streams/C-QUESTIONS-2.md (card 1)"
  - "Plans/ledgers/v2/pldg-20260616-002-orchestrator-goal-runtime-flow/records/corrections.jsonl#corr-0011"
preserved_exact_tokens:
  - "DL-337"
  - "on by default, always free"
  - "independent review where its owner requires it"
owner_hints:
  - Plans/orchestrator-subagent-integration.md
  - Plans/Models_System.md
```

### DL-338 - An Exhausted Repair Budget Stops The Run Or Asks For An Approved Exception

Jared deferred card 2 to the recommendation on 2026-11-05 ("The rest I will defer to your recommendations"): option A. The Settings choice "Finish, marked not fully checked" is replaced by "Stop and ask me to approve an exception", which uses the DL-081 approved verification exception route. No degraded run state is added.

```yaml
plan_unit_id: DL-338
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-338 records Jared's answer of 2026-11-05 to stream C's card 2, "What happens when fix attempts run out?": "The rest I will defer to your recommendations." The recommendation was option A. Settings planning.verification.repair-budget-exhaustion offers block (default and recommended, "Stop the work") and ask_exception ("Stop and ask me to approve an exception"); the former degraded value ("Finish, marked not fully checked") is removed. EP-103 states the behavior: an exhausted repair budget stops the run blocked with BlockedReasonCode budget_exhausted, and with ask_exception that stop also asks the project owner, through the DL-081 approved verification exception route, whether to finish as completed_with_approved_verification_exception, with the approver and remaining risks recorded and never shown as a clean pass. Until the DL-081 route contract is written (GRS-065 keeps it separately unbound), ask_exception leaves the run blocked. GoalRunStatus gains no degraded value.
  Ledger correction corr-0011 records that atom-0049's degraded outcome is realized as this blocked stop and exception request, and retires its exact-token requirement degraded, without editing the atom record.
gui_related: true
gui_classification_reason: Changes the choices of an existing Settings row.
split_recommended: false
depends_on: [DL-081, EP-103, GRS-065]
unblocks: []
acceptance_criteria:
  - Settings planning.verification.repair-budget-exhaustion offers exactly block and ask_exception, with block the default.
  - EP-103 says an exhausted repair budget stops the run blocked, and ask_exception only requests an owner exception through the DL-081 route.
  - No active owner defines a degraded run state or a finish marked not fully checked.
  - This decision does not bind the DL-081 route contract.
validation_surfaces:
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260616-002-orchestrator-goal-runtime-flow
  - python3 scripts/pm-plan-index.py validate
risk_class: false_completion
reasoning_tier: high
context_scope: closure_owner_answers_20261105
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Executor_Protocol.md
  - Plans/settings_inventory.json
  - Plans/ledgers/v2/pldg-20260616-002-orchestrator-goal-runtime-flow/records/corrections.jsonl
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521 (pm7-build), 2026-11-05T17:02:41Z: Jared's answer \"The rest I will defer to your recommendations\" covering stream C card 2, relayed in pm-mail 1105170344-5b48"
  - "/mnt/Cursor/share/puppet-master/2026-11-04-program/streams/C-QUESTIONS-2.md (card 2)"
  - "Plans/Decision_Log.md#DL-081"
  - "Plans/ledgers/v2/pldg-20260616-002-orchestrator-goal-runtime-flow/records/corrections.jsonl#corr-0011"
preserved_exact_tokens:
  - "DL-338"
  - "ask_exception"
  - "budget_exhausted"
  - "completed_with_approved_verification_exception"
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/settings_inventory.json
```

### DL-339 - Migration Run 001 Is History Only

Jared deferred card 3 to the recommendation on 2026-11-05 ("The rest I will defer to your recommendations"): option A. Migration run pds-20260611-001-standardize-plans is a frozen historical record that no check validates.

```yaml
plan_unit_id: DL-339
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-339 records Jared's answer of 2026-11-05 to stream C's card 3, "Must the oldest migration record still pass its own check?": "The rest I will defer to your recommendations." The recommendation was option A. Plans/.plan_migration/pds-20260611-001-standardize-plans is frozen history: no landing check, gate, reseal or audit closure validates it against the live Plans, and its batch hashes and declared missing-document list are never refreshed. Its artifacts stay byte-for-byte as recorded. On main 82e3204346 its own validator reported 58 failures, which measure how far the Plans have moved since June 2026 and are not defects. Run 002 keeps its role: the aggregate checks validate it, and every current snapshot declares it superseded (2026-11-04). Closure rows that claimed run 001 passes its validator close as retired by this decision.
gui_related: false
gui_classification_reason: Records the validation scope of a historical migration run; no GUI contract changes.
split_recommended: false
depends_on: [PDS-014]
unblocks: []
acceptance_criteria:
  - No check validates pds-20260611-001-standardize-plans against the live Plans.
  - No file under Plans/.plan_migration/pds-20260611-001-standardize-plans changes.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: governance_integrity
reasoning_tier: medium
context_scope: closure_owner_answers_20261105
implementation_surfaces:
  - Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521 (pm7-build), 2026-11-05T17:02:41Z: Jared's answer \"The rest I will defer to your recommendations\" covering stream C card 3, relayed in pm-mail 1105170344-5b48"
  - "/mnt/Cursor/share/puppet-master/2026-11-04-program/streams/C-QUESTIONS-2.md (card 3)"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/questions-2/pds001-validate-82e3204346.json"
preserved_exact_tokens:
  - "DL-339"
  - "pds-20260611-001-standardize-plans"
owner_hints:
  - Plans/Plan_Document_System.md
```

### DL-340 - The June Legacy Rule Reads Four Older Words As Passed

Jared approved stream C's question Q-A on 2026-11-05 ("i approve all of it", option 1): in the 55 June audit directories only, the compatibility inference reads four older words as passed. This record lists the words, the limit and the counts.

```yaml
plan_unit_id: DL-340
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-340 records Jared's answer of 2026-11-05 ("i approve all of it", 2026-11-05T04:33:13Z) to stream C's question Q-A, option 1, confirmed by the coordinator pm7-build on 2026-11-05 (mail 1105170615-ec65) after DL-334 landed. In the 55 June directories of the legacy format rule (PLS-026), when the run requests no companion file (closure matrix, audit report, effective status, scope manifest or impact matrix) as a source and reads no input through a symlink, and only for a frozen file other than the closure matrix, whose frozen part is only a prefix, the compatibility inference of scripts/pm-audit-closure.py reads four older words as passed: the claim statuses pass, supported_by_source_atoms and previously_closed, and a validator result with status expected_fail whose command is one of five governance commands (pm-plans-verify.py run-gates, verify-spec-lock, validate-evidence and validate-plan-graph, and pm-shard-plans.py --check). Those five failed in June only on stale generated files, which a governance seal refreshes. Every other field of such a row keeps its meaning (an issue list, an overclaim list or a failing status still makes the row actionable), and any other expected_fail result stays actionable. Directories from July 2026 on, files added after the freeze, and edited or symlinked files get the full rules.
  Counts on the 2026-11-05 tree: 151 source rows carry one of the words and were actionable by inference, and 150 of them no longer are. 29 pass rows of audit-20260616-005 and 61 supported_by_source_atoms rows of audit-20260618-006 were uncovered. 5 expected_fail results each in audit-20260617-013 and audit-20260617-014 were uncovered. 50 pass rows of audit-20260618-007 already had historical closure rows, so their closures now count as over-coverage there. The one previously_closed row (audit-20260619-001, planunit_source_claims.jsonl line 31) stays actionable, because it lists extra source atoms. The per-audit errors of the 55 directories go from 12,764 to 12,759, and passing directories from 19 to 21 (17 to 19 when effective_status.json is required). The effective_status.json projections of audit-20260616-005 (repair_required_count 33 to 4, still BLOCKED), audit-20260617-013, audit-20260617-014 and audit-20260618-006 (now PASS_WITH_WARNINGS) are regenerated. No other audit directory changes. The registry report keeps its status, row count, error count and error kinds; only the current digests in 142 pre-existing stale-hash diagnostics change, because this branch edits files they hash.
gui_related: false
gui_classification_reason: Records a governance decision about historical audit validation; no GUI contract changes.
split_recommended: false
depends_on: [DL-334, PLS-026]
unblocks: []
acceptance_criteria:
  - Only the 55 listed June directories read the four words as passed, only in a run that requests no companion file as a source and reads no input through a symlink, and only in frozen files other than the closure matrix.
  - An expected_fail result counts as passed only for the five named governance commands.
  - A row with an issue list, an overclaim list or a failing status stays actionable whatever its claim status.
  - The audit directories outside the list are unchanged, and the registry report keeps its status, counts and error kinds.
validation_surfaces:
  - python3 scripts/pm-audit-closure.py self-test
  - python3 scripts/pm-plan-index.py validate
risk_class: governance_integrity
reasoning_tier: high
context_scope: semantic_audit_closure
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Planning_Ledger_System.md
  - scripts/pm-audit-closure.py
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521 (pm7-build), 2026-11-05T04:33:13Z: Jared's answer \"i approve all of it\" to stream C's questions Q-A and Q-C"
  - "pm-mail 1105170615-ec65 (coordinator pm7-build, 2026-11-05): build Q-A; the 55 June directories only; the change record lists the words and the counts"
preserved_exact_tokens:
  - "DL-340"
  - "supported_by_source_atoms"
  - "previously_closed"
  - "expected_fail"
owner_hints:
  - Plans/Planning_Ledger_System.md
```

### DL-349 - Onboarding Retains Auto Appearance

Jared's answer to stream F question Q2 accepts option A: onboarding offers and retains Auto.

```yaml
plan_unit_id: DL-349
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-349 records Jared's answer "The rest I will defer to your recommendations." relayed by pm7-build
  on 2026-11-05T17:02:41Z in T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521 to stream F question Q2:
  option A is accepted. The onboarding look screen and onboarding header offer five families plus one
  Light/Dark/Auto control, consistent with SSYS-010 and DL-301. Auto follows the system appearance live,
  including a system change while onboarding is open. Onboarding keeps a prior Auto choice from Settings
  or the header unless the person picks Light or Dark. Draft and onboarding_look_choice carry theme_mode
  auto; Back restores that selection. The five families retain their ten rendered Light/Dark looks.
  F3-520 owns this presentation; the existing Settings owner retains persistence and admission boundaries.
gui_related: true
gui_classification_reason: Changes onboarding appearance controls and their retained selection.
split_recommended: false
depends_on: [F3-520, SSYS-010, DL-301]
unblocks: []
acceptance_criteria:
  - Both onboarding appearance controls offer Light, Dark and Auto separately from the five families.
  - A prior Auto survives onboarding; live system changes update its resolved appearance.
  - The draft and look-choice schema accept auto and Back restores it.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Concepts/pm7-tools/browser-check/checks/theme-header.check.mjs
risk_class: appearance_state_drift
reasoning_tier: high
context_scope: onboarding_appearance
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/product_onboarding_contracts.schema.json
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Jared via pm7-build, T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T17:02:41Z"
  - "/mnt/Cursor/share/puppet-master/2026-11-04-program/streams/F/JARED-QUESTIONS.md#Q2, option A"
preserved_exact_tokens:
  - DL-349
  - "The rest I will defer to your recommendations."
  - Light/Dark/Auto
  - onboarding_look_choice
  - theme_mode
  - auto
owner_hints:
  - Plans/FinalGUISpec.md
```

### DL-333 - Typed Command Definitions Live In Owner Docs For UCC-049..UCC-105

```yaml
plan_unit_id: DL-333
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-333 records Jared's answer of 2026-11-05 ("approve all") to closure question Q5, raised by closure row B16 607
  against the UCC-049..UCC-105 strict schema overlay in Plans/UI_Command_Catalog.md. Each active command that the
  overlay's command_id rule resolves gets one typed payload definition in the owner doc for its area, in the shared
  pm.command_payload_definitions.v1 format that UCC-230 fixes. A definition gives the command's args with types,
  required flags and defaults, its typed owner result carried by the CV-333 UICommandResponse, and error and
  disabled-reason codes narrowed from the overlay's closed sets. The overlay keeps its common fields and closed code
  sets and points each row range at those owner-doc definitions instead of "this catalog"; catalog command rows still
  hold no data shapes. UCC-230 routes every command to one of the owner units CRAU-115, CRAU-116, W-095, ACD-637,
  ACD-638, ACD-639, SMPFS-328, SMPFS-329, CS-125, AMS-141, RAP-129, F3-716, F3-717, EP-236, GRS-218, PRDB-024,
  PWIZ-109, PNC-037, SSYS-076, OP-049, ACD-640 and F3-718, which the owner-doc packets add. Agents write the definitions, fanned out by owner
  doc, with mechanical ones allowed on a cheaper model; scripts/pm-command-payload-defs-check.py verifies coverage,
  placement, types, defaults, required identity, envelope, narrowings, results, provenance and command kinds. Jared's
  only words in this decision are "approve all". The ten questions the Q5 design left open were settled by the
  coordinator (pm7-build, 2026-11-05) as technical calls under that answer, not as owner answers; they are listed in
  coordinator_resolutions. Resolution 11, the checker's literal-default scope, is a later coordinator call under the
  same answer. A command whose resolution is not yet applied stays in UCC-230's contested list and gets no
  definition until it is.
coordinator_resolutions:
  - "Resolution 1 (PRD Builder, Planning Wizard and Plan Compile ids): the catalog ids stay canonical for the 28 commands; the field lists of Plans/prd_planning_runtime_contracts.json ui_command_contracts move under the catalog ids and that file's own ids are recorded as aliases; topic.open and annotation.resolve take their fields from the catalog rows; cmd.plan_compile.open_build takes the PlanCompileRun identity the catalog names, not goal_run_id."
  - "Resolution 2: cmd.docker.image.push is a primary command with its own DockerImagePushV3Request; the UCC-051 compatibility-alias note goes."
  - "Resolution 3 (Docker build): the flow stays as Plans/Containers_Registry_and_Unraid.md already requires it: infer the target, prompt instead of guessing when ambiguous, expose build and bake preview commands, persist the selected target and resolve build_run to it. cmd.docker.build.select_target, cmd.docker.build.run, cmd.docker.bake.preview and cmd.docker.bake.run stay current; cmd.docker.build.image, cmd.docker.build.compose and cmd.docker.build.bake get catalog rows as the build modes; each of the seven is registered by a unit and has a production wiring row."
  - "Resolution 4: cmd.chat.worktree.bind_existing is retired as a non-alias; its production wiring row is dropped and the Contracts_V0 alias note is corrected."
  - "Resolution 5: cmd.git.worktree.request_prune is its own command, the non-mutating approval-request phase of the two-phase prune flow (GI-041); the UCC-054 alias note changes."
  - "Resolution 6: owner disabled states outside the overlay's closed set (the GitHub_Integration worktree states and the prd_planning_runtime_contracts.json codes) map to closed disabled-reason codes through UCC-230 owner_state_code_map; the owner word stays display detail and the closed set is not expanded."
  - "Resolution 7: cmd.runtime.open_queue_analysis, cmd.runtime.open_remediation_lineage and cmd.runtime.open_safe_point_history are exempt from the blocked identity blocked_sequence and allowed_action_id; they keep run_id."
  - "Resolution 8: cmd.chat.new is exempt from thread_id; it runs before a thread exists and carries draft identity."
  - "Resolution 9a: typing /teach opens the Teach popup, as DL-127 already decided; UCC-102 and CS-053 no longer treat /teach as a Teacher launch. The Teacher keeps the help icon and CS-053's intent-classified natural-language route. This is not a new owner decision."
  - "Resolution 9b: History (UCC-100), Vision bridge (UCC-101) and Teach guided GUI (UCC-102) get minted command ids, catalog rows, unit tokens, owner definitions and production wiring rows from the actions those units already list. An action too vague to define without inventing behaviour is reported to the coordinator instead of being minted."
  - "Resolution 10: the catalog's existing payload columns stay as history with a one-line pointer to the owner definition."
  - "Resolution 11 (checker scope; pm7-build, pm-mail 1105094308-ee03): fields of type timestamp, url or path take no literal default. The checker refuses any such literal and fails closed instead of validating its syntax; the owners (webfetch for URLs, FileSafe for paths, RFC 3339 consumers for timestamps) validate syntax at run time, and an owner that needs a literal default first adds its validation to the checker. No definition writes one today, so no canon behavior changes."
gui_related: false
gui_classification_reason: Records where command payload shapes live; no GUI behavior changes.
split_recommended: false
depends_on: [CV-333, UCC-098, UCC-109, DL-127]
unblocks: []
acceptance_criteria:
  - "No UI_Command_Catalog command row gains a payload field; the overlay names the owner-doc definition unit for every row range."
  - "Every active UCC-049..UCC-105 command has exactly one definition, in the owner doc UCC-230 names, or is listed as contested until its resolution is applied."
  - "python3 scripts/pm-command-payload-defs-check.py exits 0."
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: command_payload_definition_home
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/UI_Command_Catalog.md
  - scripts/pm-command-payload-defs-check.py
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to the stream C owner questions; Q5 is this entry"
  - "pm-mail 1105034552-f6f4 (pm7-build, 2026-11-05): coordinator resolutions 1-10 under that answer"
  - "pm-mail 1105094308-ee03 (pm7-build, 2026-11-05): coordinator resolution 11, the checker's literal-default scope"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/drafts/for-jared-rows.md (B16 row 607)"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/DESIGN.md and inventory.jsonl"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/RESOLUTIONS.md"
preserved_exact_tokens:
  - "DL-333"
  - "pm.command_payload_definitions.v1"
  - "approve all"
owner_hints:
  - Plans/UI_Command_Catalog.md
```

### DL-335 - cmd.chat.worktree.bind_existing Is Retired As A Non-Alias

```yaml
plan_unit_id: DL-335
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-335 retires cmd.chat.worktree.bind_existing as a non-alias. Plans/UI_Command_Catalog.md UCC-058 already rules
  that "Arbitrary Bind Existing remains outside the Assistant thread-worktree MVP and must not be exposed as
  cmd.chat.worktree.bind_existing", yet the projects refresh had given that id a binding row, a production-wiring
  row, a planned handler and an actionable Touch row. The owner answer is Jared's "approve all" to closure question
  Q5 (2026-11-05, DL-333); those are his only words in this decision. Retiring the command is coordinator resolution
  4 under that answer (pm7-build, 2026-11-05), and how the retirement is applied is a later coordinator ruling
  (pm7-build, 2026-11-05); neither is an owner answer. The projects-refresh command census in
  Plans/projects_refresh_command_bindings.json falls from 494 to 493 because a command that UCC-058 forbids exposing
  was retired; no other command is added or removed, and the 28 new primaries are unchanged. Its production-wiring
  row catalog.chat_worktree_bind_existing goes (1332 to 1331 entries) and Plans/Wiring_Matrix.production.exclusions.json
  lists the token with a note. Its binding row, its command_id entries in the binding and application-workflow
  schemas and its planned handler handlers::chat::worktree_bind_existing go, and it no longer routes as a
  compatibility alias (Plans/Contracts_V0.md section 7.1 and CV-160). Its Touch row TOUCH-FB-162 stays under profile
  TCP-FB-259, now blocked with an absent handler and absent wiring, so that no TCP-FB number moves: the TCP-FB
  derivation in scripts/pm_wiring_inventory.py keeps the retired command's stored number instead of counting list
  positions past it. UCC-230 lists it as a retired non-alias that gets no payload definition.
coordinator_resolutions:
  - "Resolution 4 (pm-mail 1105034552-f6f4, pm7-build, 2026-11-05): cmd.chat.worktree.bind_existing is retired as a non-alias; its production wiring row is dropped and the Contracts_V0 alias note is corrected."
  - "Cascade ruling (pm-mail 1105041321-b509, pm7-build, 2026-11-05): \"Mark the Touch row blocked rather than deleting it, so TCP-FB numbers do not move; trim the two enums; drop the binding row and take the census to 493. The change record says plainly that the count fell because a forbidden command was retired, and it cites the rule that forbids exposing it.\""
gui_related: false
gui_classification_reason: Removes a command that no GUI control may expose; no visible behavior changes.
split_recommended: false
depends_on: [DL-333]
unblocks: []
acceptance_criteria:
  - "Plans/projects_refresh_command_bindings.json has 493 commands, none of them cmd.chat.worktree.bind_existing, and scripts/pm_projects_refresh_contracts.py pins 493."
  - "cmd.chat.worktree.bind_existing has no production-wiring row, binding row, handler, schema enum entry or dispatch alias, and Plans/Wiring_Matrix.production.exclusions.json lists it."
  - "Touch row TOUCH-FB-162 stays under TCP-FB-259, blocked, and every other TCP-FB id is unchanged."
  - "UCC-230 lists cmd.chat.worktree.bind_existing in non_definition_tokens as retired_non_alias, and its contested list is empty."
validation_surfaces:
  - python3 scripts/pm-projects-refresh-contracts.py
  - python3 scripts/pm-touch-closure-verify.py
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: forbidden_command_exposed_or_touch_ids_renumbered
reasoning_tier: medium
context_scope: command_retirement
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/UI_Command_Catalog.md
  - Plans/Contracts_V0.md
  - Plans/projects_refresh_command_bindings.json
  - Plans/Wiring_Matrix.production.json
  - Plans/touch_closure.json
  - scripts/pm_wiring_inventory.py
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to the stream C owner questions; Q5 is DL-333"
  - "pm-mail 1105034552-f6f4 (pm7-build, 2026-11-05): coordinator resolution 4 under that answer"
  - "pm-mail 1105041321-b509 (pm7-build, 2026-11-05): coordinator ruling on how the retirement cascades"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/RESOLUTIONS.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/R4-REPORT.md"
preserved_exact_tokens:
  - "DL-335"
  - "cmd.chat.worktree.bind_existing"
  - "approve all"
  - "TCP-FB-259"
negative_constraints:
  - "Do not expose cmd.chat.worktree.bind_existing as a command, alias or control."
  - "Do not renumber any TCP-FB id when a projects-refresh command is retired."
owner_hints:
  - Plans/UI_Command_Catalog.md
```

### DL-341 - Command Definitions Record Judgments, And UCC-230 Gains Nullable Fields, Canon Enum Spelling, Identity Aliases And The Chat-Tool Approval Branch

```yaml
plan_unit_id: DL-341
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-341 amends the pm.command_payload_definitions.v1 format and the UCC-230 map in Plans/UI_Command_Catalog.md
  after rounds 1 to 3 of the blind review of the 275 Q5 command payload definitions (DL-333). In round 1 all five
  review slices failed (3 blockers, 27 majors, 42 minors) while scripts/pm-command-payload-defs-check.py passed.
  Part of the cause was the format and the map: writers had nowhere to record a judgment except a YAML comment,
  which no tool reads, the vocabulary had no nullable form and forced snake_case enum values, and the map missed
  aliases and rules that canon states. Format: a definition records each judgment it makes in an optional judgments
  list of key, choice and gap_note entries. The key is command_kind, response_kind, disabled_reason_codes,
  error_codes, owner_request, owner_result, aliases, omitted:<field> for a field it deliberately leaves out, or
  field:<arg path>; the choice is what the definition chose, equal to its own value for a fixed key; the gap_note
  says what canon lacks or where it disagrees. A judgment carries no provenance, a canon field whose source or
  gap_note says JUDGMENT is a provenance finding, and reviewers check judgments as they check fields. A definitions
  block holds no YAML comment, whatever it says, and no string that names review or evidence material. A field
  marked nullable: true may be JSON null, with any required value, except a required row-group identity or a
  restated common optional field, which keeps its canonical type. Enum values keep canon's exact spelling: non-empty
  strings without surrounding whitespace, unique within the field. Map: cmd.runtime.approve and cmd.runtime.decline
  define both the node approval shape and the HITL-038 chat-tool shape, through conditional identity exemptions that
  require blocked_sequence and allowed_action_id on every approval_kind branch except chat_tool and forbid them on
  chat_tool; canon names only the chat_tool value of approval_kind, so the definition marks that field a gap. Owner
  states maintenance_cutoffs_pending (DL-403, and since the DL-446 and DL-447 cutoffs the hold until their
  approvals pass) and dedup_hold_pending (DL-444, DL-445) map to not_configured. The thirteen CRAU-095 local-runtime
  reason codes and the UCC-111 safe-point retry states safe_point_missing and state_changed map to closed codes;
  canon names those codes without giving them closed codes, so each mapping is a worker's choice under DL-333
  resolution 6 as the stream C lead applies it, and four CRAU-095 mappings are asked of the CRAU owner
  (crau_owner_questions). A definition may tie the owner states it shows to their codes in owner_state_codes. identity_aliases lets gist_id stand for memory_item_id
  (UCC-084..UCC-088) and investigation_id for debug_session_id (UCC-077..UCC-083) without renaming canon. Canon
  already decided three further map corrections, made here with their sources: cmd.terminal.focus_session,
  compose.save_scenario, compose.run_scenario, set_context and set_namespace are recorded aliases with no
  definition; cmd.runtime.locate_and_verify_recovery and cmd.runtime.abandon_recovery are pre-attempt admissible, so
  they never require attempt_id; and worktree_lifecycle_state is required when a command mutates worktree state, as
  the overlay cell says, rather than for every domain action, so cmd.git.worktree.request_prune, which never mutates
  worktree state (GI-041), does not carry it. This entry was amended in place on 2026-11-07, before it reached main,
  after rounds 2 and 3 of the review (round_2_changes, round_3_changes), and on 2026-11-08 after the first,
  second and fifth max reviews (max_review_changes), which add to non_definition_tokens the two assistant worktree
  compatibility aliases CV-160 records, cmd.chat.worktree.create_pr and cmd.chat.worktree.open_files, the two
  worktree compatibility spellings canon targets, cmd.worktree.provision to cmd.git.worktree.create and
  cmd.worktree.release to cmd.git.worktree.release (CS-066, UCC-145), and the safe-point compatibility alias
  cmd.orchestrator.restore_safe_point_then_retry, whose exact contract names the wrapper
  cmd.orchestrator.safe_point_retry as its alias_of_command_id and normalizes it to
  cmd.runtime.restore_safe_point_then_retry (UCC-111). Jared's only words remain "approve all" (DL-333). The coordinator's
  ruling, quoted verbatim in coordinator_resolutions, is the only coordinator resolution in this entry; how it was
  applied, the lead's implementation of resolution 2, the workers' own calls, the application of DL-333 resolution 6
  and the lead's proposals are listed separately and labelled by who made them. This entry changes no owner-doc
  definition; the per-slice fixers bring the definitions to these rules.
coordinator_resolutions:
  - "Ruling (pm-mail 1107140349-9370, pm7-build, 2026-11-07T14:03Z), verbatim: \"All five as you recommend, recorded as coordinator resolutions under DL-333/DL-341. (1) (a): an identity exemption for the HITL-038 chat-tool branch, with both shapes defined; don't leave chat-tool approval without a command. (2) Yes to all three. Add checker rules so every judgment has a key, a choice and a gap_note, and no judgment can claim canon provenance; reviewers check judgments the same way as fields. (3) Yes. (4) Yes: aliases, never renaming canon. (5) Out of this branch, but not dropped: Jared wants everything finalized, so the eight unrouted ids become a follow-up packet (Q5b) in your queue, done before the final reseal.\""
resolutions_as_applied:
  - "How the P0b worker applied resolution 1 (cmd.runtime.approve and cmd.runtime.decline, round 1 S4 C1, option a): UCC-230 identity_exemptions records, for each command, blocked_sequence and allowed_action_id as conditional exemptions (condition required_when, branch_field approval_kind, exempt_branch chat_tool). The definition lists them, keeps both fields with required_when on the node branch, and offers the chat_tool branch in a required approval_kind enum, so both the OrchestratorNodeApprovalRequestV1 shape and the RuntimeApproveV3ToolRequest or RuntimeDeclineV3ToolRequest shape are defined. P0c added that both fields are forbidden on the chat_tool branch and that approval_kind is a gap field (round_2_changes)."
  - "How the P0b worker applied resolution 2 (format): the optional judgments list, nullable: true on a field, and enum values in canon's own spelling. The checker validates the judgments shape, that each key names a part of the definition (or, for omitted:, a field it does not have), a non-blank choice and gap_note, and unique keys."
  - "How the P0b worker applied resolution 3 (maintenance hold, AMS-141): owner state maintenance_cutoffs_pending maps to closed code not_configured in UCC-230 owner_state_code_map, citing DL-403, so the reason is machine-readable without widening the closed set."
  - "How the P0b worker applied resolution 4 (identity names): UCC-230 identity_aliases records gist_id for memory_item_id (UCC-084..UCC-088) and investigation_id for debug_session_id (UCC-077..UCC-083), each with canon evidence the checker finds outside UCC-230 and that names the canon name. The checker types and requires the canon name as the overlay name it stands for and refuses a definition that carries both names."
  - "Resolution 5 (ids outside UCC-049..UCC-105 that round 1 found unrouted, R1-DECISIONS call 5) is not applied in this entry; a follow-up packet Q5b settles them before the final reseal."
lead_implementation_of_resolution_2:
  - "The stream C lead's implementation of resolution 2's \"no judgment can claim canon provenance\" (P0b task text, 2026-11-07T14:04Z), not the coordinator's words: (a) no judgment may carry a provenance key, even gap; (b) a canon field whose source or gap_note contains the word JUDGMENT in any case is a C11 finding; (c) a definitions block whose fence holds a YAML comment with that word is a C11 finding."
  - "The lead's round 2 change to (c) (P0c task text, after round 2 S6 finding 7): any YAML comment in a definitions block is a C11 finding, whatever it says, because comments are invisible to tools and a word list cannot tell a choice from a note."
worker_calls:
  - "P0b worker's call, kept by the lead: for a fixed key, a judgment's choice equals the definition's own value (set equality for the two code lists), so a stale judgment cannot survive a later edit."
  - "P0b worker's reading of resolution 1, kept by the lead: a conditional exemption is mandatory, so a definition that keeps only the node shape fails; read from \"don't leave chat-tool approval without a command\"."
  - "P0b worker's call, kept by the lead: the JUDGMENT word rule also matches JUDGEMENT and the plurals; P0c extends it to snake_case compounds such as judgment_basis (round 2 S6 finding 7)."
  - "P0b worker's classification of the worktree commands, kept by the lead: create, lock, prune, recover, release, remove, reuse and unlock mutate worktree state (lock and unlock set the git lock state; unlock's precondition is worktree_locked); request_prune and select do not (select persists per-project selection and filter state, which W-075 keeps an owner runtime/view record)."
  - "P0c worker's calls: the checker enforces that approval_kind is a gap field, and a forbidden_when on the chat_tool branch may not also forbid a branch that requires the field; nullable is refused on a required row-group identity even where an identity exemption lets the definition leave the field out, since an exemption makes the field omissible, not nullable; a [] step in any judgment path must name a list field of the definition; a list choice may not repeat an entry; a whole-line YAML comment is reported against the definition of the next content line; owner_state_code_map may not map one owner state twice; the review-reference rule's list of names, read from the brief's examples and \"and the like\" (the Q5 design's sections and the fix reports' canon-conflict labels included, a future compile review not); the closed code chosen for each CRAU-095 code; and leaving CRAU-095's compatibility vocabulary unmapped (under_dl333_resolution_6)."
  - "P0d worker's calls (round 3): keeping blocked_state_required for compose_invalid, compose_service_missing, image_missing and k8s_rollout_blocked, where canon reads two ways (crau_owner_questions); the closed codes for the two UCC-111 states, safe_point_missing to blocked_state_required and state_changed to stale_projection; and not adding storage failure, source verification failure or missing explicit confirmation to the map, since canon names them only in prose and no owner-state token spells them (open_owner_questions)."
  - "Max-review fixer's calls (max_review_changes): cmd.chat.worktree.create_pr targets cmd.chat.worktree.pr, the six's Create PR command, since CV-160 names no target among the six; cmd.chat.worktree.open_files targets cmd.git.worktree.open, the catalog's side of a canon conflict: CV-160 lets it route to the canonical assistant worktree commands, none of which opens files, while UCC-058 routes Open Files through the project-scope cmd.git.worktree.open and the section 2.5C rules let the thread-scoped family normalize to project-scope worktree operations, and the catalog keeps aliases. Each alias is recorded on its target's definition."
canon_decided_changes:
  - "non_definition_tokens: cmd.terminal.focus_session, an alias of cmd.terminal.focus (UCC-202 canonical_text: \"cmd.terminal.focus is canonical and cmd.terminal.focus_session is its alias\"); compose.save_scenario and compose.run_scenario, compatibility aliases of cmd.docker.compose.scenario.save and .run (UCC-137 canonical_text: \"the flat compose.save_scenario and compose.run_scenario spellings recorded as compatibility aliases\"); set_context and set_namespace, compatibility aliases of cmd.docker.k8s.select_context and select_namespace (UCC-137 canonical_text; UCC-052 compatibility_only_notes). Round 1 S1 map items 1-2 and S3 M1."
  - "pre_attempt_admissible: cmd.runtime.locate_and_verify_recovery and cmd.runtime.abandon_recovery (UI_Command_Catalog.md Known-37 recovery-unavailable rows: \"Pre-attempt payloads omit `attempt_id`\"; Commands_System.md: \"Pre-attempt dispatch omits `attempt_id`\"; Contracts_V0.md: \"A pre-attempt request omits `attempt_id`\"). Round 1 S4 U1."
  - "worktree_lifecycle_state: when mutating, as the overlay cell says (\"`worktree_lifecycle_state` when mutating worktree state\"). The map lists create, lock, prune, recover, release, remove, reuse and unlock as mutating and request_prune and select as not mutating, each with its row in the catalog's section 2.5C project-scope git worktree commands table (UCC-054) as evidence; the per-command classification is the P0b worker's call (worker_calls); GI-041 says \"request_prune never mutates worktree state\" and W-075 keeps the selected worktree an owner runtime/view record. A domain_action in the row group that the map lists in neither fails closed, so the rule checks every case the earlier domain_action rule covered. Round 1 S5 M1 and F10."
  - "non_definition_tokens (max_review_changes): cmd.chat.worktree.create_pr and cmd.chat.worktree.open_files, compatibility aliases (CV-160 acceptance_criteria: \"cmd.chat.worktree.open_files and cmd.chat.worktree.create_pr may route to canonical assistant worktree commands.\"; Contracts_V0.md section 7.1: they \"are not replacements for the canonical six command IDs\"). Their targets are the max-review fixer's calls (worker_calls). Max review finding 5."
  - "non_definition_tokens (max_review_changes, second max review): cmd.worktree.provision and cmd.worktree.release, compatibility aliases of cmd.git.worktree.create and cmd.git.worktree.release (UI_Command_Catalog.md candidate compatibility and rejection table: \"`cmd.worktree.provision` / `cmd.worktree.release` | alias intents -> `cmd.git.worktree.create` / `cmd.git.worktree.release`; no new rows\"; Commands_System.md candidate census: \"compatibility spelling, not registered\"; CS-066 and UCC-145 count them among seven compatibility intents; DRY_Rules.md and Shared_Integration_Runtime.md normalize them to the same targets). Canon names both targets, so neither is a worker's call. Second max review finding 3."
  - "non_definition_tokens (max_review_changes, fifth max review): cmd.orchestrator.restore_safe_point_then_retry, a compatibility alias of cmd.runtime.restore_safe_point_then_retry (UI_Command_Catalog.md exact recovery command contracts table: \"`normalization.kind = compatibility_alias`, `normalizes_to_contract = cmd.runtime.restore_safe_point_then_retry`, `alias_of_command_id = cmd.orchestrator.safe_point_retry`\"; the catalog's Orchestrator safe-point retry prose: \"`cmd.orchestrator.restore_safe_point_then_retry` remains a compatibility alias for that same runtime command\"; UCC-111 canonical_text: \"The compatibility alias cmd.orchestrator.restore_safe_point_then_retry has no second handler or authority\"). Its immediate alias_of_command_id is the wrapper cmd.orchestrator.safe_point_retry, whose own contract is normalization.kind wrapper with alias_of_command_id null, so the wrapper stays a wrapper and is not listed. Canon names the runtime target, so it is not a worker's call. Fifth max review finding 2."
under_dl333_resolution_6:
  - "DL-333 resolution 6, verbatim with its scope: \"owner disabled states outside the overlay's closed set (the GitHub_Integration worktree states and the prd_planning_runtime_contracts.json codes) map to closed disabled-reason codes through UCC-230 owner_state_code_map; the owner word stays display detail and the closed set is not expanded.\" Its scope names only the GitHub_Integration worktree states and the prd_planning_runtime_contracts.json codes. Extending it to other owner states is the stream C lead's application, not the resolution's words: it rests on UCC-230's general sentence \"Owner disabled states that fall outside the closed set map to closed codes through owner_state_code_map and stay display detail\". No new ruling."
  - "Applied to the thirteen codes of the CRAU-095 canonical local-runtime reason-code base enum (the stream C lead's P0c task text, round 2 S1 finding 6 and map item 1). CRAU-095 and Containers_Registry_and_Unraid.md section 2B list the names only; every one of the thirteen mappings is the P0c worker's choice from the code's name, and each map entry says so. runtime_context_missing, k8s_context_missing, k8s_namespace_missing and access_url_unresolved map to not_configured; runtime_context_unreachable and k8s_context_unreachable to unreachable; buildx_unavailable and bake_unavailable to partial_capability; container_unhealthy to degraded: nine codes inside the shared Docker/Kubernetes disabled-state taxonomy (UCC-053; UI_Command_Catalog.md section 2.5B). compose_invalid, compose_service_missing, image_missing and k8s_rollout_blocked map to blocked_state_required, outside that taxonomy; their entries cite UCC-053 and section 2.5B beside Containers_Registry_and_Unraid.md section 2B, and the choice is asked of the CRAU owner (crau_owner_questions). Canon passages cited beside a mapping where they exist: section 2A Runtime access URL resolution (access_url_unresolved), section 2A buildx readiness (buildx_unavailable), CRAU-093 (compose_invalid, compose_service_missing), CRAU-099 (runtime_context_missing, runtime_context_unreachable) and section 2B's local-runtime blockers (runtime_context_missing, k8s_context_unreachable, container_unhealthy). CRAU-095's compatibility vocabulary is not a second base enum and is not mapped."
  - "Applied to the UCC-111 safe-point retry states (the stream C lead's P0d task text, round 3 S4 map item U1): UCC-111 and the Orchestrator safe-point retry row keep the pre-modal disabled reasons safe_point_missing, state_changed, permission_denied and operation_in_progress; the last two were already mapped (GI-041). safe_point_missing maps to blocked_state_required and state_changed to stale_projection, both the P0d worker's choice; the state_changed entry also cites the storage fallback divergence dispositions' closed disabled reasons, which include state_changed."
lead_proposals:
  - "The stream C lead's proposals, sent to pm7-build at 2026-11-07T15:54Z with \"unless you object\"; no objection arrived. They are the lead's calls, not coordinator resolutions."
  - "Lead proposal 1 (round 2 S2 map item M1): owner state dedup_hold_pending maps to not_configured, as maintenance_cutoffs_pending does. DL-444 and DL-445 keep the duplicate sweep's automatic jobs and panel buttons \"unavailable until your answer is applied and all remaining definition, review and recording approvals pass\"."
  - "Lead proposal 2 (round 2 S1 map item 2): a judgments key aliases, for a choice about which alias tokens a definition records; its choice is those tokens, or none when the definition records no alias."
  - "Lead proposal 3 (round 2 S2 map item M2): an optional per-definition owner_state_codes list of owner_state and code entries. Each owner state is in owner_state_code_map, its code is the map's code for it and is one of the definition's disabled_reason_codes, so a definition's tie to maintenance_cutoffs_pending or dedup_hold_pending is machine-readable."
round_2_changes:
  - "Round 2 (P0c, the stream C lead's task text, after definitions review round 2: r2-opus-S1.md..r2-opus-S6.md). The coordinator text above is unchanged."
  - "No YAML comment in a definitions block (S6 finding 7, S1 finding 5): any # comment inside a pm.command_payload_definitions.v1 fence is a C11 finding, whatever it says. 137 comments remained at 0dd32a1253."
  - "No review or evidence reference in a definitions block (S1 finding 9, S3 finding 7): a string that names review rounds or findings, fix rounds or their reports, review files, the defs-review or owner-answers folders, the evidence share, the Q5 design's sections or the fix reports' canon-conflict labels is a C11 finding; canon text stands on canon. A unit fence's source_lineage may keep evidence paths. 49 such strings remained at 0dd32a1253."
  - "nullable: true is refused again, as before this entry, on a required row-group identity (C07) and on a restated common optional field (C08): neither the overlay's identity cells and payload_optional bullet nor UCC-230's row_groups and common_optional record a nullable field, so the checker has no source that could make one nullable (S6 finding 4)."
  - "Restated common fields (S3 map item M3): a definition may restate a common optional field, required or optional, only with its canonical type and narrowing constraints. This supersedes the Q5 DESIGN.md section 4.3 rule that a restatement may only make the field required: true or add constraints; the checker already enforced the type."
  - "Approve and decline (S6 findings 3 and 5): blocked_sequence and allowed_action_id are forbidden on the chat_tool branch (forbidden_when approval_kind in [chat_tool]), since HITL-038 refuses cross-variant fields. OrchestratorNodeApprovalRequestV1 carries run_id, node_id, blocked_sequence and an optional attempt_id and no allowed_action_id or approval_kind; the node branch keeps allowed_action_id from the overlay. Canon names only the chat_tool value of approval_kind, so its node branch value is not canon and the definition marks approval_kind a gap."
  - "Shape rules (S6 finding 6): a [] step in a judgment path, omitted:<x>[] included, needs x to be a list field; a when: mutating entry lists not_mutating as well as commands; a list choice has no repeats."
  - "Corrected labels (S6 finding 2): the worktree evidence is the catalog's section 2.5C project-scope git worktree commands table (UCC-054), not GitHub_Integration.md's Worktree Topology Commands; the investigation alias's contract unit is Contracts_V0 CV-123 (section 3.5 Debug investigation events), not CV-294."
  - "Map additions under DL-333 resolution 6 (under_dl333_resolution_6) and the lead's proposals (lead_proposals) are listed above."
round_3_changes:
  - "Round 3 (P0d, the stream C lead's task text, after definitions review round 3: r3-opus-S1.md, r3-opus-S2.md, r3-opus-S4.md and r3-opus-S6.md). The coordinator text above is unchanged, and the change is to UCC-230 owner_state_code_map and this entry only; no owner-doc definition changes."
  - "CRAU-095 sources (S6 finding 3, canon conflict C4; S1 finding 1): each of the thirteen entries now says that CRAU-095 lists the code and gives it no meaning, labels its mapping the P0c worker's choice under DL-333 resolution 6, and cites the canon passage where one exists. The four blocked_state_required mappings keep their code and cite both readings of canon (under_dl333_resolution_6, crau_owner_questions). No mapping changed code. This entry now quotes DL-333 resolution 6 with its scope and labels its extension the lead's application."
  - "maintenance_cutoffs_pending (S2 map item M1): its sources add DL-446 and DL-447. The cutoffs exist now; what still holds the two maintenance commands is their \"until your answer is applied and all remaining definition, review and recording approvals pass\"."
  - "Owner states added (S4 map item U1): safe_point_missing to blocked_state_required and state_changed to stale_projection (UCC-111), each the P0d worker's choice under DL-333 resolution 6. Not added: the Known-37 recovery-unavailable rows' storage failure, source verification failure and missing explicit confirmation, which canon names only in prose (open_owner_questions)."
max_review_changes:
  - "Max review (the stream C lead's fix brief after the Sol 6.1 max review of f4d48b6f7a, finding 5). The coordinator text above is unchanged; the change is to UCC-230 non_definition_tokens and this entry, and the fix round records each alias on its target's definition."
  - "Two aliases added (canon_decided_changes, worker_calls): cmd.chat.worktree.create_pr to cmd.chat.worktree.pr and cmd.chat.worktree.open_files to cmd.git.worktree.open, each a compatibility_alias whose evidence is CV-160's acceptance criterion. Before this, a definition that recorded either alias failed the checker with C04 alias_not_a_non_definition_token. Neither becomes a primary definition, and neither is retired."
  - "Citation re-point: the two entries add 26 lines to UI_Command_Catalog.md after cmd.chat.worktree.bind_existing's entry, so 217 UI_Command_Catalog.md line citations past that point in the 15 owner-doc definitions sections were moved by 26, by a script that checked each cited line's text is the same before and after."
  - "Second max review (the stream C lead's fix brief after the Sol 6.1 max review of 953413902a, finding 3). The coordinator text above is unchanged; the change is to UCC-230 non_definition_tokens and this entry, and the fix round records each spelling on its target's definition in W-095."
  - "Two compatibility spellings added (canon_decided_changes): cmd.worktree.provision to cmd.git.worktree.create and cmd.worktree.release to cmd.git.worktree.release, each a compatibility_alias whose evidence is the catalog's candidate compatibility and rejection table. Before this, a definition that recorded either failed the checker with C04 alias_not_a_non_definition_token. Neither becomes a primary definition."
  - "Citation re-point: the two entries add 22 lines to UI_Command_Catalog.md after cmd.thread.request's entry, so 217 UI_Command_Catalog.md line citations past that point in the 15 owner-doc definitions sections were moved by 22, by a script that checked each cited line's text is the same before and after. Plans/orchestrator-subagent-integration.md's catalog line citation for the cmd.thread.* family was already off its target before this branch and was left as it is."
  - "Owner question added from the same review's finding 2 (open_owner_questions): the SMPFS-328 browser rows whose wired request has no action for them."
  - "Fifth max review (the closure lead's fix brief after the Sol 6.1 max review of 1b7ee8e890, finding 2). The coordinator text above is unchanged; the change is to UCC-230 non_definition_tokens and this entry, and the fix round records the alias on EP-236's cmd.runtime.restore_safe_point_then_retry, which the alias-target rule allows because the entry's target is that command."
  - "One compatibility alias added (canon_decided_changes): cmd.orchestrator.restore_safe_point_then_retry to cmd.runtime.restore_safe_point_then_retry. Its evidence is the exact contract row, which records both the immediate alias_of_command_id, the wrapper cmd.orchestrator.safe_point_retry, and the normalization to the runtime command; its note records the wrapper input and the wrapper's identical permission-validation and consumption transform. Before this, a definition that recorded it failed the checker with C04 alias_not_a_non_definition_token. The wrapper is not relabelled as an alias, and neither token becomes a primary definition."
  - "Citation re-point: the entry adds 16 lines to UI_Command_Catalog.md after cmd.k8s.*'s entry, so 230 UI_Command_Catalog.md line citations past that point in the 15 owner-doc definitions sections (223 in the eight documents whose change is digits only, 7 in GRS-218 and EP-236) were moved by 16, by a script that checked each cited line's text is the same before and after. Plans/orchestrator-subagent-integration.md's catalog line citation for the cmd.thread.* family was already off its target before this branch and was left as it is."
  - "Owner question added from the same review's finding 1 (open_owner_questions): the Goal Mode commands' per-scope request editions, which GRS-218 now selects by the thread's actual scope."
crau_owner_questions:
  - "Docker/Kubernetes disabled reasons (asked of the Plans/Containers_Registry_and_Unraid.md owner): may Docker Manager command availability use blocked_state_required, outside the six-family taxonomy of UCC-053 and UI_Command_Catalog.md section 2.5B (Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability), for compose_invalid, compose_service_missing, image_missing and k8s_rollout_blocked? Containers_Registry_and_Unraid.md section 2B calls compose-up failure, unhealthy container, missing Docker context, cluster unreachable and rollout failure local-runtime blockers under a blocked/degraded classification, and CRAU-103 keeps unproven states manual-only, blocked, degraded or partial capability. Until the owner answers, the map keeps blocked_state_required for those four; if the taxonomy is binding, the nearest families are not_configured for the compose and image codes and degraded for k8s_rollout_blocked."
  - "Do the other nine CRAU-095 mappings (the P0c worker's choice by name) match the owner's meaning, in particular access_url_unresolved to not_configured and buildx_unavailable and bake_unavailable to partial_capability?"
open_owner_questions:
  - "Legacy cmd.docker.remove (for the Q5b follow-up packet under resolution 5): UI_Command_Catalog.md section 2.5A still lists cmd.docker.remove as Remove Container, and that section's boundary normalizes legacy Docker rows into the canonical families with no new payload shape, while the current registration is cmd.docker.container.delete (UCC-049). Canon names no target for this row, so UCC-230 gives it no disposition and no definition records it as an alias. Q5b adjudicates it as a compatibility alias of cmd.docker.container.delete or a retirement, and records that in UCC-230 non_definition_tokens before the final reseal. Raised by the stream C lead after the fourth Sol 6.1 max review."
  - "Local or registered-host Docker target (asked of the Containers_Registry_and_Unraid.md CRAU-116 and UI_Command_Catalog.md UCC-105 owners): UCC-105 keeps the existing cmd.docker.run and cmd.docker.container.open on the HostCapabilityCommand envelope 'where exact semantics match', and CRAU-116's definitions read that as a target on a registered host: a dispatch from the Docker Manager row with neither host_capability_ref nor host_profile_id is local and builds no envelope, while one from the Docker/Hosts destination or another UCC-105 envelope caller without either ref is refused with invalid_args. Canon names no source_surface value for either case. Which values mark a local Docker Manager dispatch and which a host dispatch? Raised by the stream C lead after the third recheck of the Sol 6.1 max fixes."
  - "Host command execution context (asked of the Contracts_V0.md CV-304 and UI_Command_Catalog.md UCC-105 owners): CV-304's canonical text lists execution_unit_context among the HostCapabilityCommand fields, its acceptance criterion does not, and UCC-105 spells it execution_unit_context_ref. CRAU-116's definitions carry it only when an execution unit dispatches a host command (cmd.docker.host.session.launch from its arg; runtime attribution 'where applicable', Contracts_V0.md Runtime attribution ownership split) and none on a GUI dispatch. Which typed carrier gives an executor or orchestrator dispatch of preflight, start, stop, restart, retain or open_app, and of cmd.docker.run or cmd.docker.container.open when they target a registered host, its execution unit context, for example the UCC-230 envelope's run_id and attempt_id? Raised by the stream C lead after the second recheck of the Sol 6.1 max fixes."
  - "Assistant worktree button visibility (asked of the assistant-chat-design.md owner): ACD-322 (canonical text and acceptance criterion) and W.1's behavior rules (assistant-chat-design.md:2962) hide the Worktree button when the active project has no git repository, while CV-159 (Contracts_V0.md) keeps projectIsGitRepo only as the original Git-reader guard and never as a universal test that excludes an admitted Jujutsu route. ACD-637's six cmd.chat.worktree.* definitions follow CV-159 and cite both. Should ACD-322 and W.1 show the button for an admitted Jujutsu project? Raised by the stream C lead after the recheck of the Sol 6.1 max fixes."
  - "Known-37 recovery-unavailable rows (asked of the UI_Command_Catalog.md Known-37 and Contracts_V0 recovery-unavailable owners): the catalog says disabled projections retain \"the exact owner reason, including stale projection, permission/storage failure, operation in progress, source verification failure, or missing explicit confirmation\", but names no owner-state token for storage failure, source verification failure or missing explicit confirmation. The recovery_unavailable_resolution_receipt reason_code enum (Plans/storage_value_registry.json) has storage_read_only, storage_io_exhausted, recovery_source_not_verified and explicit_confirmation_required, which are result reasons, not disabled states. Which tokens are those disabled states? Until an owner names them, the map has no entry for them and the definitions keep their gap-note mappings."
  - "Browser control rows' owner request (asked of the Section15_MVP_Promoted_Features_Spec.md owner and the owner of Plans/section15_browser_program_contracts.schema.json): the wiring rows of cmd.browser.share_with_agent, cmd.browser.revoke_share_with_agent, cmd.browser.take_over, cmd.browser.pause_agent, cmd.browser.let_agent_continue and cmd.browser.stop_agent_keep_browser name BrowserActionRequestV2, whose command_id enum lists them, but the request requires a closed browser_action whose action_type enum holds page and tab primitives only: no share, revoke-share, takeover or agent-control action, and no field for share's thread_id or take_over's takeover_choice. Sharing and revoking change browser-session share state only and are not captures (UI_Command_Catalog.md capture event rules; Section15 browser click/highlight/share rules). The same holds for cmd.browser.detach_browser_tab, cmd.browser.open_devtools, cmd.browser.toggle_devtools_dock, cmd.browser.focus_browser_tab, cmd.browser.promote_to_normal_browsing, cmd.browser.reopen, cmd.browser.retry and cmd.browser.keep_closed, which have no detach, DevTools, dock, session-tab reveal, promotion or session-recovery action and, for open_devtools, toggle_devtools_dock, focus_browser_tab and promote_to_normal_browsing, no field for mode, dock, where, by, background or target_workspace_tab_id. SMPFS-328's definitions keep the wired request, map these fourteen commands onto no action_type, never turn share or revoke into a capture, and have a handler refuse them with handler_unavailable. Should BrowserActionRequestV2 gain session-control actions with those fields, should these commands name a different owner request, or should the two layout-only rows (toggle_devtools_dock, focus_browser_tab) be handled by the shell with no owner request? The request also has no field for the capture rows' optional thread_id, which SMPFS-328 leaves on the UICommand envelope, or for the four screenshot rows' scope (clip or full), which SMPFS-328 keeps as an arg; SMPFS-328 maps the screenshot rows to action_type screenshot and the pick-element and add-selection rows to snapshot, as its own choices. Raised in the fix round after the second Sol 6.1 max review, at the stream C lead's request."
  - "Goal Mode request editions (asked of the Goal_Runtime_System.md owner and the owners of the UI_Command_Catalog.md Simplified Goal Runtime registration rows, its section 2.7.1 Goal rows and Plans/Wiring_Matrix.production.json): GRS-086 admits a Goal in an app thread with project_id=null, and CV-366 selects the application editions for its start and update (the app.goal_start.v1 and app.goal_update.v1 graphs, input root GoalCommandRequestApplicationV1, update branch GoalCommandRequestApplicationV2), while the Project editions GoalStartRequestV2 and GoalUpdateRequestV2 stay exact. The rows name one edition each: cmd.chat.goal.update's registration and 2.7.1 rows name only GoalUpdateRequestV2 and its wiring row the scope-neutral ChatOwnerCommandRequestV2, and cmd.chat.goal.start's wiring and registration rows name only GoalStartRequestScopeV2, which resolves to the application root, while Goal_Runtime_System.md:262 and the Original Goal creation command settlement passage before GRS-066 (Goal_Runtime_System.md:6337) name GoalStartRequestV2. GRS-218's definitions keep the wired requests and select the owner input of the thread's actual scope: a Project thread's start builds GoalStartRequestV2 and its update GoalUpdateRequestV2, and an app thread's start and update build the application editions, with no Project identity and no null-to-Project rebinding. Should the registration, 2.7.1 and wiring rows name both editions of each command, and which edition marker does a UICommand dispatch carry? GRS-218 uses each edition's own schema_id for the update and the thread's scope for the start. Raised in the fix round after the fifth Sol 6.1 max review, at the closure lead's request."
gui_related: false
gui_classification_reason: Records how command payload definitions state their judgments and how UCC-230 maps identities; no GUI behavior changes.
split_recommended: false
depends_on: [DL-333, HITL-038, DL-403, UCC-202, UCC-137, GI-041, UCC-052, UCC-054, W-075, CV-123, CRAU-095, DL-444, DL-445, DL-446, DL-447, UCC-053, UCC-111, CRAU-093, CRAU-099, CV-160, UCC-058, CS-066, UCC-145]
unblocks: []
acceptance_criteria:
  - "UCC-230 states the judgments list with its aliases key, nullable fields and where they are refused, canon enum spelling, that a definitions block holds no YAML comment and no review or evidence reference, the restated common field rule, the when-mutating rule, identity_aliases, the conditional approve and decline exemptions with the chat_tool branch forbidden and approval_kind a gap, owner_state_codes, owner states maintenance_cutoffs_pending and dedup_hold_pending, the thirteen CRAU-095 codes and the UCC-111 states safe_point_missing and state_changed, each worker-chosen mapping labelled as such, and lists the ten recorded aliases and the two pre-attempt admissible commands."
  - "python3 scripts/pm-command-payload-defs-check.py --self-test passes with a passing and a failing case for every rule this entry adds."
  - "This entry edits no owner-doc definitions section; definitions that break a corrected rule are reported to the per-slice fixers."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-command-payload-defs-check.py --self-test
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: command_payload_definition_format_amendment
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/UI_Command_Catalog.md
  - scripts/pm-command-payload-defs-check.py
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to closure question Q5 (DL-333)"
  - "pm-mail 1107140349-9370 (pm7-build, 2026-11-07T14:03Z): coordinator resolutions 1-5 under that answer"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/defs-review/R1-DECISIONS.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/defs-review/r1-opus-S1.md, r1-opus-S2.md, r1-opus-S3.md, r1-opus-S4.md and r1-opus-S5.md (round 1 reviews, UCC-230 map items sections)"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/P0B-BRIEF.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/defs-review/r2-opus-S1.md, r2-opus-S2.md, r2-opus-S3.md, r2-opus-S4.md, r2-opus-S5.md and r2-opus-S6.md (round 2 reviews; S6 reviewed this entry)"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/P0C-BRIEF.md (round 2 changes, the stream C lead's task text)"
  - "Stream C lead to pm7-build, 2026-11-07T15:54Z: lead proposals 1-3, sent with \"unless you object\"; no objection arrived"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/defs-review/r3-opus-S1.md (finding 1), r3-opus-S2.md (map item M1), r3-opus-S4.md (map item U1) and r3-opus-S6.md (finding 3, canon conflict C4) (round 3 reviews)"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/P0D-BRIEF.md (round 3 changes, the stream C lead's task text)"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/review-q5defs-sol-max.md (finding 5) and owner-answers/q5/DEFS-FIX-MAX1-BRIEF.md (max review changes, the stream C lead's task text)"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/review-q5defs-sol-max2.md (findings 2 and 3) and owner-answers/q5/DEFS-FIX-MAX2-BRIEF.md (second max review changes, the stream C lead's task text)"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/review-q5defs-sol-max5.md (findings 1 and 2) and owner-answers/q5/DEFS-FIX-MAX5-BRIEF.md (fifth max review changes, the closure lead's task text)"
preserved_exact_tokens:
  - "DL-341"
  - "pm.command_payload_definitions.v1"
  - "approve all"
  - "judgments"
  - "nullable"
  - "identity_aliases"
  - "maintenance_cutoffs_pending"
  - "approval_kind"
  - "chat_tool"
  - "dedup_hold_pending"
  - "owner_state_codes"
  - "safe_point_missing"
  - "state_changed"
owner_hints:
  - Plans/UI_Command_Catalog.md
```

### DL-471 - Unrouted Command Coverage And Typed Notification Provider Profiles

```yaml
plan_unit_id: DL-471
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-471 implements the Q5b follow-up authorized by DL-341 resolution 5 and Jared's 2026-11-08 stream C
  question 3 answer, quoted verbatim in owner_decisions. Nine ids were examined, including the subsequently
  identified cmd.docker.container.stats. Seven live commands receive typed definitions in their existing
  command_contract owners: cmd.docker.bake and cmd.docker.container.stats in CRAU-115;
  cmd.git.worktree.merge, cmd.git.worktree.open_topology and cmd.git.worktree.repair in W-095;
  cmd.debug.record_verification and cmd.debug.run_cleanup in CS-125. UCC-132 and UCC-142 already register
  merge and the debug phase commands; UCC-231 makes the other four existing owner/catalog registrations
  addressable. UCC-230's outside_range_commands is a closed concrete list with registration evidence,
  explicit owner unit and inherited row group. Every listed id receives all ordinary definition checks,
  including exactly-one coverage. DL-471 Q-ID1 decides cmd.docker.remove is a compatibility_alias of cmd.docker.container.delete.
  DL-471 Q-ID2 decides cmd.git.worktree is a non-dispatch family token.
  Both are recorded in UCC-230 non_definition_tokens, with no independent definition.
  Amended after review: selectors must be supplied and non-null; evidence line hints are checked.
  Amended after review (2026-11-09 13:25Z): reject direct external unions in owner_request/owner_result and scope line hints to the cited unit/field, excluding the map itself; Jared: "Narrow fix, quick check, land (Recommended)".
  Amended after review: merge keeps the complete expected_lease and adds observed topology_generation
  and source_location_id fences, required when leased. Q-ID5e: Jared, 2026-11-09 about 04:12Z, relayed by
  pm7-build (pm-mail 1109042811-84aa), chose "Two separate fields (Recommended)": the two fences are sibling
  arguments beside expected_lease, with W-095's exact fence names and the approved lease untouched.
  Amended after review: unions declare in_record or external discriminator supply; required matching
  branch consts and explicit external use-site sources are checked, including discriminator deletion.
  CV-369 adds pm.typed_contracts.v1 with all thirty-five CV-298 provider fields and the six provider
  branches, using UCC-230 field/type/default/provenance rules and reference-only secrets. The generic
  webhook predicate is closed to default 2xx plus zero to five atoms from CV-298's six named kinds.
  Both F3-717 profile args now name CV-369/NotificationDestinationProfileV1. Markdown contract refs
  require Plans/<Doc>.md#<UNIT-ID>/<ContractName> that resolves to a named typed_contracts definition;
  a bare unit ref is an error. The checker validates block placement/format, fields, defaults,
  provenance and closed discriminator branches, not merely the existence of a PlanUnit. JSON and
  Primitive refs retain their existing forms. Current owner units are reused; CV-369 is a schema
  owner, not a new command owner. The two debug states phase_not_reached and preservation_hold_active
  map to blocked_state_required, decided by DL-471 Q-DB3, with exact owner words retained as detail.
  Jared's 2026-11-09 answer approves all 46 recommended choices, recorded below as decided by the owner.
  Whole-profile replacement and immutable provider on update are decided by DL-471 Q-F2/Q-F3.
  Repair's undefined operation remains unavailable without mutation, decided by DL-471 Q-ID7b. No new wiring,
  handler, provider API claim, readiness acceptance or governance reseal is certified by this packet.
owner_decisions:
  - 'Jared, 2026-11-09 about 02:05Z, relayed by pm7-build in pm-mail 1109020252-acf7, verbatim: "Approve all 46 (Recommended)". Question packet: /mnt/Cursor/share/puppet-master/2026-11-04-program/streams/C-Q5B-QUESTIONS.md; SHA-256 5d7b3869093d4daed0c8088812ad4475c183fe5d5a552689ed61cb28de3bac30.'
  - 'DL-341 resolution 5, pm7-build, 2026-11-07T14:03Z, verbatim: "(5) Out of this branch, but not dropped: Jared wants everything finalized, so the eight unrouted ids become a follow-up packet (Q5b) in your queue, done before the final reseal."'
  - 'Jared, 2026-11-08, stream C question 3 (row 607), verbatim: "Define them now (Recommended)".'
  - 'Chosen option, verbatim: "Stream C writes typed profile schemas for the six providers. Choices that canon leaves open are marked as gaps, as the Q5 definitions do, and secrets stay reference-only. C binds F3-717 to them, and a checker rule stops a bare reference from counting as a typed schema. A CV-298 owner approves."'
command_outcomes:
  - command_id: cmd.docker.bake
    standing: live
    canon: 'CRAU-011: "expose cmd.docker.build.*, cmd.docker.bake, cmd.docker.bake.*, and preview commands"; UCC reserved namespace and catalog.docker_bake production wiring.'
    outcome: CRAU-115 definition; UCC-231 registration coverage; DL-471 Q-ID3 decides the existing Bake-run operation, shape, result and readiness checks.
  - command_id: cmd.docker.remove
    standing: compatibility_alias
    canon: 'Catalog section 2.5A: "Removes a stopped container"; later boundary: "Legacy Docker rows normalize into canonical" families and "MUST NOT introduce new payload shapes"; DL-341: "Canon names no target for this row".'
    outcome: "Decided by DL-471 Q-ID1: compatibility_alias to cmd.docker.container.delete."
  - command_id: cmd.docker.container.stats
    standing: live
    canon: 'Catalog section 2.5A: "Shows live or cached container stats with freshness markers".'
    outcome: CRAU-115 definition and UCC-231 registration coverage; DL-471 Q-ID4 decides the existing live/cached projection and freshness markers.
  - command_id: cmd.git.worktree.merge
    standing: live
    canon: 'UCC-132: "cmd.git.worktree.merge mints the project-scope worktree merge the UCC-054 family lacked"; W-081: "only after exact-result approval, fresh target observation, permission admission, and FileSafe protection".'
    outcome: W-095 definition, retaining real Project scope, exact-result approval and independent Permissions/FileSafe fences.
  - command_id: cmd.debug.record_verification
    standing: live
    canon: 'CS-065: "records the verification outcome that lets an investigation leave attention_required"; UCC-142 registers the row.'
    outcome: CS-125 definition; verification outcome/evidence shape and result receipts are decided by DL-471 Q-DB1/Q-DB4.
  - command_id: cmd.debug.run_cleanup
    standing: live
    canon: 'CS-065: "mutation-capable and dispatches only behind confirmation class two_step"; UCC-142 registers the row.'
    outcome: CS-125 definition; confirmation and current holds remain mandatory; current owner-held state, disabled mappings and result receipts are decided by DL-471 Q-DB2/Q-DB3/Q-DB4.
  - command_id: cmd.git.worktree.open_topology
    standing: live
    canon: 'GitHub_Integration Worktree Topology Commands: "Command IDs: `cmd.git.worktree.open_topology`".'
    outcome: W-095 definition and UCC-231 registration coverage; DL-471 Q-ID6 decides the existing topology projection.
  - command_id: cmd.git.worktree.repair
    standing: live
    canon: 'GitHub_Integration Worktree Topology Commands includes "`cmd.git.worktree.repair`" and names destructive confirmation fields.'
    outcome: W-095 definition and UCC-231 registration coverage; DL-471 Q-ID7a/Q-ID7b decide selected-worktree admission and unavailability without mutation until the exact operation is defined.
  - command_id: cmd.git.worktree
    standing: family_alias
    canon: 'Wiring_Matrix.production.json catalog.git_worktree: "ui_command_id": "cmd.git.worktree", "handler_location": "handlers::git::worktree"; no concrete operation or catalog registration precedes this packet.'
    outcome: "Decided by DL-471 Q-ID2: non-dispatch family token."
decided_by_owner:
  - "Decided by DL-471 Q-ID1: compatibility_alias of cmd.docker.container.delete."
  - "Decided by DL-471 Q-ID2: a non-dispatch family token, with the concrete commands handling actions."
  - "Decided by DL-471 Q-ID3: the shared Bake-run operation and shape used in the draft, with no independently invented payload."
  - "Decided by DL-471 Q-ID4: the existing projection, keeping cached metrics visible with freshness markers."
  - "Decided by DL-471 Q-ID5a: the bounded owner string until the owner defines a shared enum."
  - "Decided by DL-471 Q-ID5b: refs, all revalidated against the exact target and generation before mutation."
  - "Decided by DL-471 Q-ID5c: the complete typed observed lease, mandatory whenever the selected worktree has a lease and compared to current owner fences."
  - 'Decided by DL-471 Q-ID5e: the observed topology_generation and source_location_id fences are sibling arguments beside expected_lease (Jared, 2026-11-09, "Two separate fields (Recommended)").'
  - "Decided by DL-471 Q-ID5d: direct typed args plus the custody-preserving receipt ref for this packet."
  - "Decided by DL-471 Q-ID6: the existing topology projection, as the draft defines it."
  - "Decided by DL-471 Q-ID7a: the draft's exact selected-worktree shape, with `target_worktree_id == worktree_id` and detached targets refused until represented explicitly."
  - "Decided by DL-471 Q-ID7b: keeping it unavailable without mutation until the exact repair operation is defined. The current command list alone does not specify an algorithm."
  - "Decided by DL-471 Q-DB1: the explicit bounded record in the draft."
  - "Decided by DL-471 Q-DB2: current owner-held state, with no caller hold override."
  - "Decided by DL-471 Q-DB3: `blocked_state_required` for both, retaining the exact owner state as display detail."
  - "Decided by DL-471 Q-DB4: receipt refs, with no successful result fabricated from dispatch alone."
  - "Decided by DL-471 Q-S1/Q-D1/Q-G1/Q-P1/Q-T1: required credential refs, as the draft types them."
  - "Decided by DL-471 Q-C1: the required policy-record ref."
  - "Decided by DL-471 Q-D2/Q-T2: sensitive refs, preserving their exact CV-298 field names."
  - "Decided by DL-471 Q-S2: optional sensitive ref."
  - "Decided by DL-471 Q-S3: the explicit enum with plain default."
  - "Decided by DL-471 Q-S4: the draft enum, keeping broad mentions disabled."
  - "Decided by DL-471 Q-D3: the single compound policy for this packet, with no raw avatar URL."
  - "Decided by DL-471 Q-D4: the bounded ref list, admitting no broad-mention token."
  - "Decided by DL-471 Q-G2: the three-value draft enum."
  - "Decided by DL-471 Q-G3: the bounded empty-by-default list."
  - "Decided by DL-471 Q-G4: a required validated non-secret template ref."
  - "Decided by DL-471 Q-G5: the draft milliseconds shape."
  - "Decided by DL-471 Q-G6: optional, preserving the existing default."
  - "Decided by DL-471 Q-G7: the flat all/any draft, with the default 2xx test retained."
  - "Decided by DL-471 Q-G8: the typed `kind` union and the exact bounds written in CV-369."
  - "Decided by DL-471 Q-G9: literal refs, excluding raw secrets and arbitrary bodies."
  - "Decided by DL-471 Q-N1: sensitive refs, with no raw server URL or topic."
  - "Decided by DL-471 Q-N2: optional credentials with explicit owner admission; destination enablement and live-send authority still apply."
  - "Decided by DL-471 Q-N3: the optional bounded integer."
  - "Decided by DL-471 Q-N4: the bounded list."
  - "Decided by DL-471 Q-N5: the draft enum, with no raw click URL."
  - "Decided by DL-471 Q-P2: a sensitive ref."
  - "Decided by DL-471 Q-P3: the draft bounded integer, subject to owner/provider validation."
  - "Decided by DL-471 Q-P4: the bounded selector for this packet, without certifying provider support."
  - "Decided by DL-471 Q-P5: the explicit draft object, with the cross-field rules enforced by the owner."
  - "Decided by DL-471 Q-T1: a required sensitive ref. Bot credential completeness and optional thread custody are decided in items 16 and 18."
  - "Decided by DL-471 Q-T3: the draft enum with plain default; those decided tokens are not claimed as existing canon API facts."
  - "Decided by DL-471 Q-T4: false, as typed in the draft."
  - "Decided by DL-471 Q-F1: the nested named contract."
  - "Decided by DL-471 Q-F2: whole-profile replacement; omitted profile leaves it unchanged."
  - "Decided by DL-471 Q-F3: immutable provider."
remaining_open_gaps:
  - None from the 46 owner questions. Other inherited field/type and definition choices in the owner units remain outside this answer.
  - Repair's exact mutation algorithm remains undefined by the decided unavailable-until-defined policy; this is not an open gap.
gui_related: false
gui_classification_reason: Records routing, type definitions and decided owner choices; no new GUI behavior.
depends_on: [DL-333, DL-341, CV-298, UCC-132, UCC-142]
unblocks: []
acceptance_criteria:
  - All nine ids have a source-backed standing; DL-471 decides the two prior standing questions.
  - The closed external list routes exactly seven live definitions and retains all existing checker rules.
  - All six provider profiles are typed, all secrets are refs, both F3-717 profile refs are named and bare unit refs fail.
  - All 46 recommendations are decided by the owner; unrelated inherited gaps remain explicit and Repair stays unavailable until defined.
  - The checker and self-tests pass, including positive/negative cases and reverted-copy proofs for new rules.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, runtime handlers or production build tasks are created.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py --json
  - python3 scripts/pm-command-payload-defs-check.py --self-test
  - python3 scripts/pm-plan-index.py validate
risk_class: unrouted_commands_and_untyped_notification_profiles
reasoning_tier: high
context_scope: q5b_command_and_profile_closure
implementation_surfaces: [Plans/UI_Command_Catalog.md, Plans/Contracts_V0.md, Plans/FinalGUISpec.md, Plans/Containers_Registry_and_Unraid.md, Plans/WorktreeGitImprovement.md, Plans/Commands_System.md, scripts/pm-command-payload-defs-check.py]
node_compile_hint: {mode: owner_decision_record, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5b/BRIEF.md"
  - "DL-341 resolution 5, pm7-build, 2026-11-07T14:03Z."
  - "Jared, 2026-11-08, stream C question 3 (row 607): Define them now (Recommended)."
preserved_exact_tokens: [DL-471, pm.command_payload_definitions.v1, pm.typed_contracts.v1, outside_range_commands, unresolved_tokens, cmd.docker.bake, cmd.docker.remove, cmd.docker.container.stats, cmd.git.worktree.merge, cmd.debug.record_verification, cmd.debug.run_cleanup, cmd.git.worktree.open_topology, cmd.git.worktree.repair, cmd.git.worktree, NotificationDestinationProfileV1]
negative_constraints:
  - Do not silently resolve a standing conflict, call a bare ref a typed schema, or present recommendations as owner answers.
  - Do not rename or delete existing command canon, expand closed error sets, or expose raw secrets.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Contracts_V0.md, Plans/FinalGUISpec.md]
```

### DL-472 - Auditor Loop And TargetedRevisionPass Live Owners (As-Is Move)

```yaml
plan_unit_id: DL-472
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: 'DL-472 records Jared''s owner decision of 2026-11-08, relayed by pm7-build 1108230613-1863: "The
  generic Auditor invariant loop moves into Plans/assistant-chat-design.md §26, which is retitled to cover the loop''s
  specification as well as its settings. TargetedRevisionPass moves into Plans/PRD_Builder.md, next to PRDB-007
  ("PRD Builder doc (Recommended)"). Plans/Planning_Wizard.md references it rather than restating it. Both move
  as-is. References are redirected, and one Decision Log entry records the move. No redesign: do not change what
  the rules say, only where they live."


  CWF §12.1–§12.5, including its report-lineage tail, moves into assistant-chat-design §26.10–§26.14, retaining
  §26.1–§26.9 numbers. ACD-269 owns the generic loop and carries the machine-form rules and acceptance criteria
  from retired CWF-082–CWF-087, without activating legacy pass aliases. CWF-117''s mixed Builder per-stage filtering
  remains retired source; ACD §26.7 and ACD-268 retain live provider capability filtering. CWF §5.5.2 and the targeted-revision
  bundle state and doc-level state portion of §5.5.0 move into PRD_Builder PRDB-014 immediately after PRDB-007.
  Planning_Wizard PWIZ-007''s targeted-revision use points to PRDB-014 rather than repeating the contract.


  Redirected references: ACD §26.1, §26.9 and its ContractRef, ACD-269 canonical text, acceptance criteria, implementation
  surfaces, owner hints and preserved ContractName token now name ACD §26 for loop ownership. ACD §26.5 and §26.9
  OpenCode settings citations now name Provider_OpenCode §10.1. The moved loop''s Requirements Completion Contract
  and escalation citations name Decision_Policy DP-066 and Planning_Wizard PWIZ-038; its optional final-review citation
  names Crosswalk §3.16, and its retired workflow ContractRef names Planning_Wizard PWIZ-038. Project_Output_Artifacts
  §9 item 8 (Auditor reports), its requirements-quality ContractRef and the POA-029 exact-token mirror, and Contracts_V0''s
  requirements-quality event ContractRef and CV-099 exact-token mirror name ACD §26. Crosswalk §3.15 owner and ContractRef,
  §3.16''s TargetedRevisionPass ContractRef, and C-035 implementation surfaces and owner hints name PRD_Builder
  PRDB-014 (document-level surfaces name PRD_Builder). Planning_Wizard references PRDB-014 at its targeted-revision
  use. ACD §8.7''s targeted-revision ContractRef, ACD-049''s implementation surfaces and owner hints, and the
  Contracts_V0 runtime event catalog''s targeted-revision owner sentence name PRD_Builder PRDB-014 in place of the
  retired document. The reference sweep also redirects assistant-chat-design ACD-253 implementation surfaces and
  owner hints, ACD-254 and ACD-264 implementation surfaces, and Contracts_V0 CV-099 implementation surfaces to
  assistant-chat-design (removing duplicate document-level entries). Crosswalk §3.14 owner and ContractRef and C-034
  canonical text, implementation surfaces and owner hints name PRD_Builder PRDB-014 for annotations (document-level
  surfaces name PRD_Builder). Crosswalk §3.13B''s shared ContractRef, §3.16 owner and C-036 implementation surfaces
  and owner hints retain the retired reference for the unmoved navigation/final-review material and add PRD_Builder
  PRDB-014 for the annotation portion (document-level surfaces name PRD_Builder). FinalGUISpec''s Assistant Planning
  UX addendum §2 Deep Plan ContractRef names PRD_Builder PRDB-014. Plans/Decision_Log.md DL-472 records these
  redirected references.


  No rule changed; redesign is out of scope. Changes to moved prose are section numbers and cross-references only,
  with one bracketed editor''s note retaining the historical Contract Unification sentence/reference because PWIZ-038
  owns the lifecycle rather than the detailed retired pass. CWF §12 and §5.5.2 retain their old text and gain live-owner
  pointers. Historical changelog and source_lineage references, including DL-330''s earlier scope boundary, remain
  history. This record does not reseal governance, regenerate shards/indexes, or redesign the loop, revision semantics,
  wizard lifecycle, settings or provider capability contracts.'
gui_related: false
gui_classification_reason: Records owner relocation only; moved GUI behavior is owned by the named workflow units.
depends_on:
- ACD-269
- PRDB-014
unblocks: []
acceptance_criteria:
- Auditor loop specification and settings have a live home in ACD §26, owned by ACD-269.
- TargetedRevisionPass has a live home in PRDB-014; Planning Wizard and Crosswalk consume it.
- Moved rules retain wording except section numbers, cross-references and the documented editor note; no redesign.
- Historical CWF text and legacy pass aliases remain retired source.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-command-payload-defs-check.py --json
risk_class: owner_routing_to_retired_document
reasoning_tier: high
context_scope: closure_owner_answers_20261109
implementation_surfaces:
- Plans/chain-wizard-flexibility.md
- Plans/assistant-chat-design.md
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Crosswalk.md
- Plans/Contracts_V0.md
- Plans/Project_Output_Artifacts.md
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
source_lineage:
- Jared owner decision, 2026-11-08, relayed by pm7-build 1108230613-1863; quoted in the Q1 implementation brief
- /mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q1-auditor-home/BRIEF.md
preserved_exact_tokens:
- DL-472
- TargetedRevisionPass
- ACD-269
- PRDB-014
negative_constraints:
- No rule changed; redesign is out of scope.
owner_hints:
- Plans/assistant-chat-design.md
- Plans/PRD_Builder.md
```

### DL-470 - Append Audit-004's Correction And Check Its Repairs

```yaml
plan_unit_id: DL-470
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered stream C question 2 on 2026-11-08, through pm7-build: "Append a correction" and
  "Also repair anything that needs to be repaired". PLS-027 implements the append-only correction for
  audit-20260619-004-prd-planning-wizard-post-repair-head-fidelity: preserve the June files, correct the original
  PASS_WITH_WARNINGS to BLOCKED for its five actionable source rows, and identify the 16 matrix-covered rows
  that never required repair. On 2026-11-09 about 04:35Z, Jared answered exactly "Owner-named rows only (Recommended)"
  through pm7-build (pm-mail relay 1109044810-9b5f). These 16 exemptions are the owner's judgment on the record,
  individually named below in owner_judged_rows. The 14 previously_closed atom-fidelity rows already reported no
  unclosed gap; the invalid migration invocation was superseded within the audit; and the passing audit-closure
  check's skipped-matrix warning was audit housekeeping. For each validator-results record, whether it "never
  needed a fix" is the owner's per-record judgment; owner_named_rows names the exact two records and their
  canonical JSON SHA-256 pins. The validator checks those pins, exact list equality for the audit, matrix coverage
  and its classifier; it does not prove cleanliness from free-form evidence. Registry row 280 remains the
  historical record of adding the matrix, not evidence that its passing source result needed a canonical repair.
  No matrix or registry row is removed or relabelled, no missing coverage is excused, and no evidence hash is
  restamped. Check the five repairs and the whole closure chain against current text and repair bounded defects
  separately in the same packet, listing every repair. Existing registry staleness still needs PLS-025 re-audit
  evidence; the correction alone cannot clear it, reseal governance or authorize runtime/build work.
owner_judged_rows:
- source_artifact: atom_fidelity_matrix.jsonl
  source_row: 2
  reason: "Rename Chain Wizard and Plan Wizard to Planning Wizard: status compiled_to_plan, classification previously_closed, no missing exact tokens or negative constraints; source notes say closed/revalidated without reopening."
- source_artifact: atom_fidelity_matrix.jsonl
  source_row: 8
  reason: "Planning Wizard uses one typed thread family: status compiled_to_plan, classification previously_closed, no missing exact tokens or negative constraints; source notes say closed/revalidated without reopening."
- source_artifact: atom_fidelity_matrix.jsonl
  source_row: 83
  reason: "Discover project-local test capabilities before WorkNode binding: status compiled_to_plan, classification previously_closed, no missing exact tokens or negative constraints; source notes say closed/revalidated without reopening."
- source_artifact: atom_fidelity_matrix.jsonl
  source_row: 84
  reason: "Research current testing methods online: status compiled_to_plan, classification previously_closed, no missing exact tokens or negative constraints; source notes say closed/revalidated without reopening."
- source_artifact: atom_fidelity_matrix.jsonl
  source_row: 85
  reason: "Record online testing research provenance: status compiled_to_plan, classification previously_closed, no missing exact tokens or negative constraints; source notes say closed/revalidated without reopening."
- source_artifact: atom_fidelity_matrix.jsonl
  source_row: 101
  reason: "Use exact final action label Approve And Build: status compiled_to_plan, classification previously_closed, no missing exact tokens or negative constraints; source notes say closed/revalidated without reopening."
- source_artifact: atom_fidelity_matrix.jsonl
  source_row: 102
  reason: "Approval freezes an immutable Approved Plan Pack: status compiled_to_plan, classification previously_closed, no missing exact tokens or negative constraints; source notes say closed/revalidated without reopening."
- source_artifact: atom_fidelity_matrix.jsonl
  source_row: 103
  reason: "Approved plans and indexes are downstream authority: status compiled_to_plan, classification previously_closed, no missing exact tokens or negative constraints; source notes say closed/revalidated without reopening."
- source_artifact: atom_fidelity_matrix.jsonl
  source_row: 104
  reason: "Approval transaction is atomic and outbox-backed: status compiled_to_plan, classification previously_closed, no missing exact tokens or negative constraints; source notes say closed/revalidated without reopening."
- source_artifact: atom_fidelity_matrix.jsonl
  source_row: 105
  reason: "PlanApproved is idempotent: status compiled_to_plan, classification previously_closed, no missing exact tokens or negative constraints; source notes say closed/revalidated without reopening."
- source_artifact: atom_fidelity_matrix.jsonl
  source_row: 106
  reason: "Automatically launch Plan Compile after approval: status compiled_to_plan, classification previously_closed, no missing exact tokens or negative constraints; source notes say closed/revalidated without reopening."
- source_artifact: atom_fidelity_matrix.jsonl
  source_row: 107
  reason: "Navigate immediately to Orchestrator Plan Compile: status compiled_to_plan, classification previously_closed, no missing exact tokens or negative constraints; source notes say closed/revalidated without reopening."
- source_artifact: atom_fidelity_matrix.jsonl
  source_row: 109
  reason: "Preserve design-only v1 and add runtime-capable v2: status compiled_to_plan, classification previously_closed, no missing exact tokens or negative constraints; source notes say closed/revalidated without reopening."
- source_artifact: atom_fidelity_matrix.jsonl
  source_row: 110
  reason: "Runtime contract carries explicit launch and adapter policy: status compiled_to_plan, classification previously_closed, no missing exact tokens or negative constraints; source notes say closed/revalidated without reopening."
- source_artifact: validator_results.json
  source_row: invalid_invocations.pm_plan_migration_validate
  reason: "Superseded invalid invocation: missing --run-dir caused returncode 2 with no side effects; the corrected pm_plan_migration_validate invocation passed in the same audit."
  record_sha256: 88a0f3c54d5e3e0c59f6a10ba8644228f275087db986bb1de26b20edcce1f10d
- source_artifact: validator_results.json
  source_row: results.pm_audit_closure_validate_audit_004
  reason: "The source result is status pass, returncode 0, no side effects."
  record_sha256: 5ff3757ec7b5b357950eff8afd0c6e6efef5cdbeb7bddea66404b0d5f91142f7
owner_named_rows:
- audit_id: audit-20260619-004-prd-planning-wizard-post-repair-head-fidelity
  source_artifact: validator_results.json
  source_row: invalid_invocations.pm_plan_migration_validate
  record_sha256: 88a0f3c54d5e3e0c59f6a10ba8644228f275087db986bb1de26b20edcce1f10d
- audit_id: audit-20260619-004-prd-planning-wizard-post-repair-head-fidelity
  source_artifact: validator_results.json
  source_row: results.pm_audit_closure_validate_audit_004
  record_sha256: 5ff3757ec7b5b357950eff8afd0c6e6efef5cdbeb7bddea66404b0d5f91142f7
gui_related: false
gui_classification_reason: Records an audit-governance decision with no GUI change.
split_recommended: false
depends_on: [PLS-012, PLS-025, PLS-026]
unblocks: []
acceptance_criteria:
- The hash-bound correction exposes historical and corrected status without editing the June report or matrix.
- The 21 source rows, five repairs, terminal projections and registry chains are checked and every repair is listed.
validation_surfaces:
- python3 scripts/pm-audit-closure.py self-test
- python3 scripts/pm-audit-closure.py validate
risk_class: governance_integrity
reasoning_tier: high
context_scope: semantic_audit_closure
implementation_surfaces:
- Plans/Planning_Ledger_System.md
- scripts/pm-audit-closure.py
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- 'Jared, 2026-11-09 about 04:35Z, via pm7-build (pm-mail relay 1109044810-9b5f): "Owner-named rows only (Recommended)".'
- 'Jared, 2026-11-08 about 22:45Z, via pm7-build (relay 1108225102-4e43): "Append a correction";
  "Also repair anything that needs to be repaired" (stream C question 2).'
- /mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q2-audit004/BRIEF.md
preserved_exact_tokens:
- Owner-named rows only (Recommended)
- DL-470
- Append a correction
- Also repair anything that needs to be repaired
- BLOCKED
owner_hints:
- Plans/Planning_Ledger_System.md
```
