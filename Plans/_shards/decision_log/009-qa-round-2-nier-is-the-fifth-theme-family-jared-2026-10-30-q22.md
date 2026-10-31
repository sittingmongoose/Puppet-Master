# Shard 009: QA round 2 — NieR is the fifth theme family (Jared, 2026-10-30, Q22)

Source: `Plans/Decision_Log.md`

Source lines: L18594-L19385

Source SHA256: `4799cbe5514520b5d56e6933bf371f7c3fb47e464f99b4b7694250b4c90a288c`

---

## QA round 2 — NieR is the fifth theme family (Jared, 2026-10-30, Q22)

### DL-257 - NieR Theme Family Replaces The Independent Override

```yaml
plan_unit_id: DL-257
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Q22, Jared 2026-10-30 (DL-257): NieR is the fifth selectable theme family (nier), ordered after Basic,
  Friendly, Glass and Retro. NieR Light (nier-light) and NieR Dark (nier-dark) complete ten built-in variants. A
  NieR family pick uses general.visual.theme and the existing mode through cmd.settings.transaction.preview then
  cmd.settings.transaction.apply; no independent NieR switch or command remains. Adjust NieR opens the one
  existing editor. general.visual.nier-parts (29 parts) and general.visual.nier-background remain its Adjust
  rows, shown when general.visual.theme is NieR Light or NieR Dark, with hidden values retained. Basic High
  contrast and Basic color scheme remain Basic-only; Glass and Retro controls remain confined to their own
  families. general.visual.nier-mode is a retired migration-only key, removed from the active inventory. On
  load, stored true selects the NieR theme in the stored presentation mode (Light, Dark or Auto, resolving Auto
  through the OS), preserving parts and background; false or absent preserves the existing family/mode. The old
  boolean is then cleared, and repeating migration has no further effect. No second underlying family is saved
  to restore later. Rendering reuses Basic CSS via data-theme='basic-<scheme>' plus html[data-o55-nier='on'];
  that marker is derived only from family nier, never an independent override. PMLogo.look() returns
  nier-<scheme>. NieR uses its existing precomputed palette and local fonts; its accent/font ownership while
  selected is unchanged, and stored general appearance overrides resume where applicable after another family is
  selected. The title-bar selector, Guided Tour Look menu, onboarding welcome and its Look menu all offer the
  same five families in order basic, friendly, glass, retro, nier. Live family picks use the Settings
  transaction pair; inside onboarding, choose_look on ui.onboarding.choose_look previews family/mode or retained
  NieR Adjust values in the closed look_choice and persists only at the existing exact Project commit/finish
  boundary. preview_nier and the independent nier_mode field are retired. Hover is silent and changes no theme;
  click or keyboard activation selects (O6). ui.settings.nier_editor.open, ui.settings.nier_editor.close and
  ui.settings.nier_editor.replay remain presentation-only; nier.editor.open is the Adjust binding. No
  manager_id, route, detail id, command, new part or event is added. shell.nier.mode, tour.nier.mode and
  onboarding.nier.mode are retired non_dispatch census tombstones with no action, setting or production writer.
  Entering NieR uses its one Reboot moment only when the Reboot moment part is installed; otherwise it uses the
  standard look cover. Leaving NieR and switching Light/Dark within NieR use the standard look cover. Reduced
  Motion keeps the existing calm/instant settle policy. Explicit Play reboot moment remains a local rehearsal
  that changes no setting. Jared’s QA round 2 ruling supersedes the override/four-family assumptions of DL-144,
  DL-152 and DL-153 while retaining their accepted art, local fonts, sound owner, Adjust parts/background and
  onboarding commit boundaries. Every current selector, Settings inventory, onboarding contract, wiring/command
  binding and DRY owner follows this decision. Earlier ten-theme evidence remains historical evidence only; the
  current acceptance matrix contains ten variants. Q22 visible copy is Adjust NieR, or Adjust NieR… in the
  title-bar menu (foundations source confirmation 1030182542-5544).
gui_related: true
gui_classification_reason: Defines the fifth selectable theme family and its shared Settings/onboarding presentation.
split_recommended: false
depends_on:
- F3-425
- SSYS-043
- DR-056
- PWIZ-021
- UCC-120
- UIW-043
unblocks: []
acceptance_criteria:
- The family selectors expose Basic, Friendly, Glass, Retro and NieR, with ten variants and the same Project-scoped
  Settings owner.
- 'The retired general.visual.nier-mode key is migration-only: true selects NieR in the stored mode and is cleared;
  false/absent preserves the selection; migration is idempotent.'
- The retained 29-part and background Adjust rows show only for a NieR theme, preserve values while hidden and reuse
  the one editor and local actions.
- Onboarding uses choose_look, never preview_nier or nier_mode, and writes no Settings before its existing exact
  Project commit boundary.
- The three removed checkbox bindings have non_dispatch tombstones, and no new command, event, key or manager is
  introduced.
- Entering NieR uses its one Reboot moment only when the Reboot moment part is installed; otherwise it uses the
  standard look cover. Leaving NieR and switching Light/Dark within NieR use the standard look cover. Reduced Motion
  keeps the existing calm/instant settle policy. Explicit Play reboot moment remains a local rehearsal that changes
  no setting.
- Basic-specific rows stay Basic-only; CSS reuse is not a logical Basic family selection.
validation_surfaces:
- python3 scripts/pm7-canon-check.py
- python3 scripts/pm7-nier-theme-check.py
- python3 scripts/pm-onboarding-contracts.py
- python3 scripts/pm-shard-plans.py --check
risk_class: theme_identity_migration
reasoning_tier: high
context_scope: pm7_q22_nier_family
implementation_surfaces:
- Plans/Settings_System.md
- Plans/FinalGUISpec.md
- Plans/product_onboarding_contracts.schema.json
- Plans/pm7_control_bindings.json
node_compile_hint:
  mode: static_contract_only
  create_worknodes: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/QA-ROUND2.md#q22
- Jared 2026-10-30 QA round 2; accepted names relayed by pm7-build and pm7-found mail 1030175829-4688
preserved_exact_tokens:
- nier
- nier-light
- nier-dark
- general.visual.theme
- general.visual.nier-mode
- general.visual.nier-parts
- general.visual.nier-background
- cmd.settings.transaction.preview
- cmd.settings.transaction.apply
- preview_nier
negative_constraints:
- Do not restore an independent NieR override, checkbox, preview_nier intent or nier_mode field.
- Do not add a settings key, part, manager, route, command or event for the fifth family.
- Do not persist onboarding appearance before its existing Project commit boundary.
- Do not derive palette values at runtime or use game assets/audio.
owner_hints:
- Plans/Settings_System.md
- Plans/FinalGUISpec.md
- Plans/DRY_Rules.md
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-043, ContractName:Plans/FinalGUISpec.md#F3-425, ContractName:Plans/DRY_Rules.md#DR-056


Q22 appearance amendment (Jared, 2026-10-30; Plans/Decision_Log.md#DL-257): current appearance contracts use five ordered families and ten variants. Earlier override-only or eight-theme evidence is historical, not current acceptance. Settings_System SSYS-043 owns the retired-key migration and retained NieR Adjust rows.




### DL-258 - QA Round 2 GUI And Owner Boundary Alignment

```yaml
plan_unit_id: DL-258
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: 'QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Jared’s QA2 and the accepted GUI/hunter fixes
  amend current presentation, retaining owner and production-proof boundaries. Q6/Q7: point to the actual backup before
  asking to unlock it. A Recovery Kit is an untrusted locator plus protected recovery credential, not a storage place,
  backup payload, NAS password or cloud sign-in. Offer the Kit first, then the explicit no-Kit path to a folder, another
  device/NAS, or a cloud service. Continue waits for the selected file/folder/device/account and required fields. Validate
  the locator/trust and reach/authenticate the selected place through its existing owner. An accepted Kit may unlock
  that backup, but cannot bypass storage authentication. Show Unlock the backup only for a still-locked backup without
  an accepted unlock; name its selected place. Select a copy, coverage and preview only afterwards. Repointing invalidates
  the former unlock and snapshot selection. Owner recovery prerequisites, approval, protected secret handling and actual
  restore/Project commit boundaries remain mandatory; only a verified Backup owner result proves unlock or restore. Q7/H2/H8:
  a selected choice’s follow-up belongs immediately in a tray joined to that card, before sibling alternatives. One C.cards
  under slot owns the join, indentation and line from the parent mark across all twelve affected screens. The parent
  opens into the tray in every look, with matching edges, no gap or overlapping lower corner/ring; narrow layouts put
  the parent question note first inside the tray. Arrow keys stay in their own choice list, and the option, its radio
  and question control never overlap. Apply to backup places/Kit, existing-work origins, work computer checks, sign-up
  links, Settings copy, remote routes/hosting/certificate fields, online service kind/address, device notes and connection
  routes. Naming and Review display the same selected mounted/network source, rather than an empty local-location field.
  Q3/Q8/Q9: question controls answer pointer hover and keyboard focus in the current look. Remove duplicate explanation-only
  disclosures (What is a Server?, the Connect proxy explanation, and What does Puppet Master read? on Choose a key);
  put their information in the shared option tips. Keep functional sections: More about keeping versions contains FileSafe,
  Which proxy contains the Caddy/NGINX/Traefik selector; identity fingerprints and Creating/restore receipts are data
  and remain. H3: SMB sign-in uses the operating system’s shared-folder keychain; Puppet Master stores no password. The
  SSH add-key password remains a separate one-use protected flow; never reuse its never-saved hint for SMB. Q4/Q10: there
  is one progress string. Chapter beads sit on and follow that string’s sag, with chapter names below Pip’s feet; Pip
  replaces the current bead and the current bead occupies no extra width. A highlight surrounds the name without covering
  Pip. The speech tail is cut from the bubble’s own fill/border as one silhouette, never a separate visible diamond;
  NieR keeps its no-tail treatment. Q1/Q2: onboarding sound defaults on under general.interaction.sound-effects, through
  the existing one player and trusted-gesture gate. Until the Settings owner supplies the applicable sound preference,
  retain the factory-on or current effective choice rather than muting on every refresh. An explicit readable Project
  value wins when it binds; a genuinely refused bound write remains refused. An unavailable Settings projection never
  fabricates a saved value or authorizes a write. H5: the onboarding owner holds one original inert-state basis for the
  entire open lifetime. Replacing an already-open screen acquires only newly encountered background nodes; it never re-snapshots
  nodes already held by that modal as originally inert. Every close/finish/skip path removes only the modal’s own holds,
  preserves pre-existing inert nodes and restores focus/input. Q13/CC5: the PM_WORK dock provider gives a live process
  and the next pending scheduled run a 60000 ms presentation lifetime from first exposure in that thread’s dock projection.
  Key freshness by thread, work identity and run start/occurrence time; repaint or returning to the same run does not
  restart it, while a restarted/new occurrence gets a new lifetime. At elapsed >=60000 the non-needs line leaves. Needs-you
  lines bypass expiry and remain until the owning question/input is answered. One next-expiry timer requests a redraw;
  it owns no work, schedule or persisted state and expiry never stops/cancels/deletes work. Existing dock priority, at-most-three
  budget and transcript visibility gates remain; full work remains reachable through Activity and the panel. Q12 amends
  G4: every Project’s Resources includes This computer and Puppet Master’s own services, which are shared and belong
  to no individual Project, alongside that Project’s own servers. An empty Project says that nothing in this Project
  is running, above the shared rows; it does not look empty or report another Project’s work as its own. Shared machines
  show only environments with running work. Metadata/freshness is available on tab entry; the existing visible-only 2
  s sampling owner remains. Permission, exact host/environment identity and stale disclosure remain authoritative; shared
  read scope creates no Stop/Restart/Stop all or service-control authority. Q14/H9: Glass’s Activity bar and composer
  dock lines join Activity Detail, panel, System status, Stop/Quit list, History and hover/attachment cards on the persona/model
  menu’s near-opaque plate. The needs line keeps its warm wash over that plate. Settings dialogs and drawers flatten
  that same menu tint over the look’s ground so background labels cannot read through; ordinary panes keep their existing
  material. This is consumer treatment, no global Glass token change or extra backdrop-filter. Q20: Glass has only the
  F3-465/PMH shared hover light on registered edge-glow objects, including Usage/Home widgets, cards, tiles and rows.
  Remove the independent sheet-wide lg-shine/light, pointer listener and stale data-lg-lit. Its central sheen is at Basic’s
  level (Glass Dark white 4.5 percent, Glass Light accent 4.5 percent); edge glow is unchanged. Plain panels, bars and
  dialog ground do not light merely because the pointer crosses them. Retro and NieR retain their non-soft-light forms
  and existing Reduced Motion, software and gesture holds. Q17: hover-to-light/dimming starts only from an actual control
  inside its affects region (button, input, select, textarea, label or switch/radio/tab/slider semantics). Plain words,
  empty section space and the plate picture do not dim the cast. Keyboard focus on a control gives the same feedback;
  a plate-embedded control remains eligible. Scheduled highlights only rows/marks with a real partner on its plate; markless
  rows dim nothing. One affectsOf/linkStyle owner supplies this behavior, with no per-sheet hover engine. Q16: You is
  the person alone, head and shoulders in each family’s materials and small-size maps. It carries no marionette cross,
  strings, holding arm/control or connection to a cross, and is never an agent Pip. Diagram edges to You express the
  plate’s result/topology, not puppet strings. The one ppYou/PX_YOU/pnYou drawer serves crew diagrams, cast plates, run
  cards and rosters. Optional agent strings and the single Pip primitive retain their existing meaning. Q15: the menu
  head and trigger use the same registry wand with the same rod/star/sparkle ink roles. Pip and that wand remain the
  head’s own children so a wrapper cannot discard the glyph’s role-specific colours. The sign’s kind glyph matches its
  sheet head; do not fork a second wand or fallback icon. H6: at the default narrow layout, 900 px and below folds chat
  to its existing 32 px edge strip under the centre-width ladder (C<480, with its hysteresis and explicit Keep open/peek
  rules). Suppress the hosted chat subtree’s painting/layout interaction while folded; a descendant visibility:visible
  must not expose a squeezed transcript, dock or composer. Open the chat/peek restores the same subtree at usable width,
  rather than a new chat instance. No folded/peek state is persisted and the saved message minimum, History and Activity
  Detail rules remain. QA2 follow-up N1, integration 6609384fd0; DL-258: A reached backup place is bound to the selected
  service or device, not a reusable signed-in/ready boolean. Choosing another source, service, device, Kit or folder
  invalidates its old reach proof, protected access fields, unlock, copy selection and completed bucket check. A late
  sign-in/check result stays bound to the service/device it authenticated and cannot advance a different current choice.
  A protected SSH key passphrase unlock belongs to that exact selected key; changing keys requires that key’s own owner-proven
  access and never inherits another key’s unlock. The Remote Link endpoint belongs only to the Remote Link route; choosing
  Only at home/local-or-VPN, Tailscale or another route clears it from the reviewed draft. No stale endpoint enters an
  unrelated route.'
gui_related: true
gui_classification_reason: Adopts QA2 restore/onboarding/activity/chat/Glass and storage-free preview behavior.
split_recommended: false
depends_on:
- PWIZ-021
- PWIZ-022
- BRS-019
- ACD-476
- F3-664
- F3-465
- SSYS-016
unblocks: []
acceptance_criteria:
- Q6/Q7 restore is source-first, Kit is not a storage place/auth credential, and protected unlock follows owner proof.
- Q1/Q2 unreadable Project state keeps factory/visit sound; no audio before a trusted gesture.
- Q13 non-needs Work lines expire per thread/run after 60000 ms without mutating the owner.
- Q12/Q14 shared Resources and near-opaque Glass plates are truthful from first tab entry.
- Q15/Q16/Q17/Q20 use one wand, person-only You, control-only plate feedback and one shared Glass hover light.
- H1/H5/H6/H7 preserve coherent lab seeds, original modal holds, clean narrow strip and revealed launch destinations.
- 'QA2 follow-up N1, integration 6609384fd0; DL-258: A reached backup place is bound to the selected service or device,
  not a reusable signed-in/ready boolean. Choosing another source, service, device, Kit or folder invalidates its old
  reach proof, protected access fields, unlock, copy selection and completed bucket check. A late sign-in/check result
  stays bound to the service/device it authenticated and cannot advance a different current choice. A protected SSH key
  passphrase unlock belongs to that exact selected key; changing keys requires that key’s own owner-proven access and
  never inherits another key’s unlock. The Remote Link endpoint belongs only to the Remote Link route; choosing Only
  at home/local-or-VPN, Tailscale or another route clears it from the reviewed draft. No stale endpoint enters an unrelated
  route.'
validation_surfaces:
- python3 scripts/pm7-qa2-alignment-check.py
- python3 scripts/pm7-build-check.py
- python3 scripts/pm7-canon-check.py
- python3 scripts/pm-shard-plans.py --check
risk_class: cross_owner_qa2_alignment
reasoning_tier: high
context_scope: pm7_qa2_integration
implementation_surfaces:
- Plans/FinalGUISpec.md
- Plans/Planning_Wizard.md
- Plans/assistant-chat-design.md
- Plans/Settings_System.md
node_compile_hint:
  mode: static_contract_only
  create_worknodes: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/QA-ROUND2.md
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/lanes/QA2-HUNTER.md
- Integration 7d586bad189b6fae24045430ef2d8e6d1ce0b091; pm7-build QA2 alignment instruction
- Integration 6609384fd0; onboarding review N1 158ad4404d; accepted lead mail 1030234015-8f7c
preserved_exact_tokens:
- Q6/Q7
- Q13/CC5
- '60000'
- persistent:false
- C.cards
- seed:false
negative_constraints:
- Do not promote concept fixture/memory success or seeded owner refs into native effects, durability, authentication,
  credentials or certification.
- Do not add a product demo command, new permission, event family, physical storage family or unapproved compatibility
  alias.
owner_hints:
- Plans/FinalGUISpec.md
- Plans/Planning_Wizard.md
- Plans/assistant-chat-design.md
```


### DL-259 - Onboarding Product Scope, Connectivity, Custody And Shared Help

```yaml
plan_unit_id: DL-259
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: 'Jared 2026-10-31: canonical Plans specify real product behavior only; implementation illustrations and
  test-driving machinery belong outside product canon. This amendment removes this branch’s non-product additions while
  preserving the earlier baseline for the separately authorized Q3 cleanup. D1 A: the online-service step creates or
  selects a code repository; onboarding does not publish a website, GitHub Pages, GitLab Pages or another site. Local-only
  Project choices remain valid. D2 A: explicit always-on Server setup on this computer, manual private HTTPS, a self-hosted
  Remote Link gateway, rarer SSH key types, China-region AI variants and local AI servers live in Settings, with a clear
  context-correct pointer from onboarding. The ordinary This computer choice remains the easy local-work default. The
  wizard says AI accounts available in this setup, not every AI. Existing Settings routes and owners retain the advanced
  capabilities. D3 A: generated proxy settings support Caddy, NGINX and Traefik, with Caddy the default. Nginx Proxy
  Manager is existing-only: it can be selected as an existing proxy but never sent to a generation/install/export operation.
  DL-259 CERT-1 / srv C1, Jared 2026-10-31: onboarding offers Make the settings file or I have one already. The first
  generates/exports Caddy, NGINX or Traefik configuration for the person to add on their own system before the owner’s
  DNS, reachability and live-connection checks; Caddy is the default. The second only checks the existing proxy route
  and live connection, with nothing generated. Set it up for me is removed: Puppet Master does not install or host the
  proxy. The onboarding draft carries proxy_hosting=generate_only or existing_proxy for this new-Server proxy branch
  and keeps proxy_tls null; it collects no certificate choice. Generating a file proves neither installation nor consent,
  identity, secure reachability or a live route. For generation, onboarding proxy_kind is exactly caddy, nginx or traefik
  and maps to reverse_proxy_configuration.proxy_family. The existing-proxy branch may record nginx_proxy_manager but
  never emits a generated-configuration record; neither branch silently substitutes a family. D4: confirm provider admission
  and executable conformance immediately before building Puppet Master. The wizard lists its provider choices without
  unconfirmed/not-verified badges, warnings or caveats. This scheduling decision does not change per-account authentication,
  entitlement, health or quota truth: Ready is the shared account owner’s current usable result, not merely signed in.
  D5 A: the live Free Models source is github.com/vava-nessa/free-coding-models v0.6.0, read 2026-10-31; the June v0.5.39
  inspection remains historical lineage. Onboarding and Settings show OpenRouter free models (sign-in), Groq free plan
  (key) and NVIDIA free models (key) up front. Other currently eligible free providers from the same Free Models catalog
  appear behind one closed-by-default advanced control in each surface. That list is catalog-driven, never a pinned list
  or count, and still applies the Models owner’s supported/free/readiness filters. GitHub Models retired on 2026-07-30
  and has no active setup/catalog/routing action; saved choices remain No longer available and never become Copilot.
  Cerebras, Hugging Face and Ollama Cloud are excluded from the free offer. Authentication, billing class and currently
  usable account/model identity remain separate; catalog labels do not prove a route is free. No changing limits or prices
  are frozen in onboarding prose. D6 A: the human signs in on the initiating active device while the AI/tool runs on
  the selected execution host. Official tool sign-ins and private account roots stay with that tool on that host; direct
  API keys are held by Puppet Master’s secure credential store on that host. Onboarding, Settings, model selection and
  Usage share stable account/profile/host/environment references, never provider-name booleans or copied secrets. Protected
  returns are bound to the exact operation, initiating Client/session/generation and execution host. Changing account,
  host or route invalidates stale validation; another account of the same provider has a distinct identity. D7 B supersedes
  the former no-per-Client-node restriction. Native Puppet Master apps on Windows, macOS and Linux have their own built-in
  Tailscale connection and sign in once through the shared protected auth owner, with no separate Tailscale app install.
  The same signed PM-owned Go tsnet helper is supervised by its owning PM process. A Server keeps one active node per
  stable server_id; a native Client installation keeps one active node per stable client_id, independent of Projects,
  windows, tabs, sessions and Server endpoint selection. Owner-qualified configuration, process, IPC, authorization,
  egress and secure-state references prevent identity/key sharing or duplicate active nodes. Native Client nodes provide
  bounded Dial/stream access only to verified PM endpoints, not arbitrary proxying or a Server public listener. Server
  nodes retain the automatic private listener; Funnel remains Server-only, explicit, off by default and unavailable on
  Headscale. Human approval and reusable connection identity do not grant PM pairing/trust or work permission. A plain
  browser tab has no embedded Tailscale connection: it needs Remote Link or a private endpoint reachable through the
  device’s own Tailscale connection. It cannot be enrolled by a browser sign-in. Existing user-managed host Tailscale
  stays external and unmanaged. D8 A: onboarding has one FileSafe switch, default on, covering command blocklist, write
  scope, security filter and pre-write safe points together. Individual controls remain in Settings. The switch expresses
  a requested owner configuration, never approval to bypass a required guard, an absent allowlist/baseline, failed canonical-path
  resolution, failed initialization or failed safe-point persistence. Mandatory policy and effective guard state win;
  a refused change stays refused with a clear reason. No failure silently turns a guard off. ELI5: the wizard bar and
  Guided Tour bar expose the same global general.interaction.mode through the Settings owner, with values ELI5 and Expert,
  labels Plain English and Expert, and default ELI5. Both bars reflect the same effective state. Every opened onboarding
  question tip and prose help section has useful Plain English and technical versions, including FileSafe, service differences,
  storage, remote access and AI/auth choices, assuming no coding experience. Screen copy, control labels, exact fingerprints,
  paths and receipt data stay single; dual copy is limited to tips/help (DL-126). A mode change updates an open tip without
  rewriting a chat reply. Existing cmd.settings.transaction.preview/apply owns the preference; ui.guided_tour.toggle_eli5
  is a compatibility local adapter to that shared preference, not a tour-only setting or chat ELI5 command. The predecessor
  tour_narration_only tag is retired. Q1 B, Jared 2026-10-31: the shared Pip voice, say and vocals everywhere Pip speaks,
  sends 0.35 after trim and pan into its look’s room; Glass uses 0.30 and NieR 0.16. Each look uses its one per-look
  kit room, registered before the first shared voice in every host, with no stacked rooms. These restore the old voice’s
  own sends. Loudness remains within approximately 0.4 dB. The existing preference, gesture and sound owner still gates
  playback. Q2 A: Jared confirmed on 2026-10-31 that staged toasts stay below the open bell inbox through the existing
  --pmn-push; it is his ruling, not an unresolved lead exception. Closed-inbox theme-menu resting-top placement and entry/exit
  click guards remain. DL-259, Jared 2026-10-31: D2 A: onboarding offers NAS, Google Drive, OneDrive, Amazon S3, Backblaze
  B2, S3-compatible, SFTP and WebDAV backup choices, retaining their exact owner family/profile/locator identity. Azure
  Blob, Google Cloud Storage and REST-server destinations remain available in Settings > Backup & Restore, with a clear
  pointer. The Backup owner still supports all eleven registered families. D2 A: repository object-format selection and
  its permanence acknowledgement belong in Settings, not onboarding. Existing-repository format observation, unknown/capability
  handling and the Source Control owner’s safeguards remain unchanged. DL-259, Jared 2026-10-31, D4/D6: cursor_sdk is
  the separate Cursor SDK direct-provider entry, with API key as its default auth surface. A user key bills that user’s
  plan and a service-account key its owning team; these remain distinct account/billing identities. cursor_cli keeps
  browser login as its default and an advanced optional CLI-key path; it does not rename or absorb the SDK entry. alibaba_token_plan
  is a separate direct-provider entry for Alibaba Token Plan, a monthly-credit subscription with its own key and Singapore
  route identity, distinct from Alibaba Coding Plan and DashScope pay-as-you-go. MiniMax M Plan is the current label,
  with MiniMax Coding Plan retained as a former-name/search alias; OpenCode Console replaces the Zen display name and
  is a pay-as-you-go gateway. A label change never changes a saved provider/account ID. DL-259 D4, Jared 2026-10-31:
  immediately before PM is built, confirm Z.AI’s listed-tools rule, Kimi Code’s client/session identity, OpenCode Go’s
  client/session identity and Muse’s Muse-only subscription credential. This is the pre-build provider-conformance checklist,
  not a wizard warning, badge or disabled choice. DL-259 D6, Jared 2026-10-31: the Codex remote/headless device-code
  alternative requires enabling device-code login in ChatGPT security settings first, or the corresponding workspace
  permission by its administrator. This remains an alternative inside Sign in with ChatGPT, not another top-level auth
  family. DL-259 CERT-1, Jared 2026-10-31: Puppet Master generates the proxy configuration; the person handles certificates
  and signing on their own systems. PM does not select, hold, validate, issue or sign those certificates, and admits
  no certificate-profile field or selector command. No certificate selection/validation is a prerequisite to configuration
  generation, route activation or Ready. Generation proves only that the configuration artifact was produced. Route Ready
  reports the actual PM-owner checks performed: endpoint reachability, protocol/API compatibility, expected Server identity
  and pairing/auth, and the applicable WebSocket, stream, transfer, deep-link and callback checks. It never claims that
  a certificate is valid. Existing secure-transport, public-exposure consent, identity and reachability requirements
  remain; missing or failed actual route checks cannot be called successful. DL-259 CLOUD-1 A, Jared 2026-10-31: the
  person uses an explicit cloud-provider console or local-bootstrap handoff and its one-time Server setup code to claim
  a new cloud computer. The Server owner checks and consumes the code through the protected local/private bootstrap handoff.
  Its initial owner-claim authorization is bound to the existing discovery_observation_id, pairing_session_id and identity_fingerprint
  handed to cmd.server.claim, with the command’s current permission and generation fences. The tuple references owner-verified
  authority; guessed IDs, an address or a caller-provided success flag are not proof. Raw setup code never enters the
  ordinary command payload, stored setup plan, logs or receipts. No public unclaimed setup, automated provider-console/SSH
  provisioning or implicit tailnet enrollment is admitted. cmd.server.bootstrap.start remains separate after successful
  claim. DL-259 DESKTOP-RESTORE-1 A, Jared 2026-10-31: the native desktop performs the first owner claim of its dormant
  local Server through a protected direct local handoff, with no code for the person to type. The Server owner binds
  that initial owner-claim authorization to its discovery_observation_id, pairing_session_id and identity_fingerprint
  for the existing cmd.server.claim request and exact current permission/generations. Ordinary Clients, browser state
  and loopback reachability cannot manufacture this protected native authority. Claim then separate cmd.server.bootstrap.start
  must complete for the actual local Server, its durable roots/mounts and immutable execution baseline before cmd.restore.server_full.
  Backup maintenance/recovery authority, exact-target verification, paused restore and separate pairing/remote activation
  remain required. Reuse current verified prerequisites when already satisfied; dormant capability alone is never a claim
  or bootstrap receipt. DL-259 REMOTE-CODE-1 A, Jared 2026-10-31: the Remote Link owner issues and checks its protected
  HTTPS link or opaque short code. Decide the actual code grammar, normalization/case behavior, expiry/abuse policy and
  raw-code resolution protocol immediately before building PM, alongside D4’s pre-build checks; no grammar or sample
  code is pinned in canon. Preserve the owner-defined representation, reject empty input, and treat nonblank text as
  unverified draft rather than identity, pairing or Ready proof. After Review, the trusted owner validates/resolves it
  before the existing open and Server identity/pairing continuation. Unknown, expired or unresolvable input fails closed
  without another-Server fallback. This accepted pre-build verification point is not an unanswered product choice or
  a wizard caveat. DL-259 srv final, 2026-10-31: Creating observes only the reviewed Project creation/open/restore result
  and its actual prerequisites. It does not run optional remote-access configuration. After that owner settlement, a
  separate postcommit remote-setup view inside automatic_preparation runs any requested Remote Access continuation, before
  the normal provider/Free Models continuation; the eleven-stage graph is unchanged. Tailscale/Headscale authorization,
  new Remote Link output, and configuration-file/export or existing-proxy checks (CERT-1 / srv C1) use their existing
  domain owners, approvals and truthful results. Later always finishes onboarding and leaves the committed Project intact:
  it does not wait for optional setup, certify it, undo owner effects or invent readiness. Unstarted setup is deferred;
  any already-started work obeys the owner’s existing cancel/background rules, and the app shows its actual result or
  pending state. Existing whole-session ui.onboarding.skip/close semantics supply this exit without a new mutation command.
  DL-259 srv final, 2026-10-31: what the person actually set up is what the app shows. Enter/finish binds the shell,
  Settings and status views to the stable Client, Server, Execution Host, route and Project identities supplied by current
  owner results and registries, with their actual readiness/deferred state. Display names never become IDs, and the reviewed
  setup plan is intent rather than effective state. Onboarding creates no second account/server/Project registry or durable
  handoff writer; its initial context is a non-authoritative join of existing owner receipts/projections, followed by
  their normal updates. No concept-global object, event or store key is a product contract. Jared answered the four owner
  questions on 2026-10-31. CERT-1 is neither proposed selector option: his words are "Dont we just generate the proxy
  conf for them? They deal with signing and certs on their own systems." CLOUD-1 A selects the console one-time setup-code
  handoff. DESKTOP-RESTORE-1 A selects protected native local handoff with no typed code. REMOTE-CODE-1 A places protocol
  verification immediately before the product build. These decisions supersede the earlier tentative safeguards and close
  all four owner questions; the existing command IDs and typed claim tuple remain. Coverage-audit follow-up, 2026-10-31:
  accepted QA2 product rules include Auto retaining its mode while the Theme word follows the current family/OS scheme
  through the existing Settings writer; semantic technical-tooltip candidacy excluding internal container/render keys;
  focus-independent inner-overlay Escape; five equally prominent bounded look choices; readable settled-stage help notes
  without a separate tail; ordinary props visibly above the floor except Creating blocks; and No account yet retaining
  its category on return. Provider key rows use the exact official key console/guide through the existing protected official-page
  command and explain key versus password. Grouped First Project criteria, D7 shared consumers and five-family/ten-variant
  acceptance are reconciled in their owners. Concept API spellings move to source lineage under DL-260; they add no product
  request, persisted state or authority. Late integration amendment, 2026-10-31: automatic local Name previews never
  treat a placeholder/suggestion as a chosen folder; typed service addresses remain scoped to their service/variant;
  AI phase Skip immediately reveals its skipped-state feedback; and the online-copy/import view, Continue button and
  activation use one current choice/validation result, including the Protect/restore action-prerequisite sweep. These
  retain existing local actions, owner admission/commit and readiness truth. The GLM re-check at 17e87e52e0 closed all
  13 coverage findings; that static re-check is not native/runtime proof. DL-259 FO-4, 2026-10-31: onboarding provider
  rows and connected-account summaries show the category and concise product/account identity without billing explanations,
  prices, limits or extra-usage pitches. Retain useful category names and exact account/product distinctions; this presentation
  rule does not alter the provider owner’s charging model, auth surface, account identity or credential custody. DL-259
  FO-5, 2026-10-31: a choice’s question control stays visible, readable and reachable when its card is selected, hovered
  or keyboard-focused in every family. NieR’s selected/cursor ink stops before the help region or uses contrasting inverse
  ink there, without hiding the question, radio or selected state. DL-259 FO-6, 2026-10-31: a protected field keeps its
  typed value through redraws of the same screen and field identity, including typing in another field, opening help
  and changing Plain English/Expert. A blank rendering template alone must not erase it. The action clears the field
  when it consumes the input; leaving/recreating the screen, changing its service/method/target or explicit cancel/reset
  clears it too. Keep that input only in the protected entry control until consumption, never in ordinary draft/session
  persistence, receipts or logs. A filled/masked flag is not a credential or validation proof; submission reads the current
  protected value and rechecks its existing owner requirements. DL-259 FO-7, 2026-10-31: accepting an owner’s approval
  or rejection finishes that exact pairing request/generation in the view. Clear its obsolete warning and render the
  answered result; later refreshes must not re-adopt the consumed result as a new request or show a false used-answer
  warning. The answered view offers a fresh code/request rather than Check again for the completed one. A fresh invitation
  starts a new generation; exact Server/Client/session/generation, matching-identity confirmation, permission, expiry
  and genuine replay rejection remain. Rejecting a later request cannot remove a Client already approved by an earlier
  request. A view marker never grants trust or bypasses the Server owner. DL-259 FO-8, 2026-10-31: after actual clipboard
  success, Copy’s transient Copied acknowledgment holds for its full feedback interval across redraws of that same control,
  including countdown updates. Another successful copy starts a fresh full interval; an older timeout cannot clear its
  newer acknowledgment. Failure reports no success. Feedback is local presentation state and does not retain the copied
  protected value or become a saved preference, owner receipt or proof of any other operation. DL-259 FO-9 final, 2026-10-31:
  Creating’s checklist and block stack share the accepted owner’s phase/effect projection. When GitHub creation only
  partly settles, show only verified completed phases as checked or landed blocks; the phase proven to have failed may
  show failure and unexecuted/unproven phases remain pending. Unexecuted or unproven phases stay pending through an incomplete
  or unclear result until a later accepted owner result from Continue Setup or Check again proves those effects settled.
  The checklist, stage block count and stage progress use that same result; a settled phase keeps its block and an unproven
  phase has no completed block. Refresh alone neither completes a phase nor repeats a settled remote create. Transport
  completion and animation never prove the later registration, settings or connection steps. The recovery banner/actions,
  Continue availability and Ready use that same current owner result; O12’s last-block landing condition is additional
  to owner completion, never a replacement for it. DL-259 FS-1, 2026-10-31, supersedes Q17’s dimming: hover/focus emphasis
  begins only at an actual control in its affects region, including an embedded plate control; plain text, empty space
  and the picture alone trigger none. Affected marks take a one-pixel theme accent ring, with the shared soft glow in
  Glass and ink in NieR; their connecting lines and the job-card edge take accent, and the linked read-back takes the
  shared wash. Hover/focus never lowers another cast part’s opacity or recolours a Pip body, seat or label; each retains
  its intrinsic colours. Genuine owner-state quietness remains independent of hover. Scheduled emphasises only a row/mark
  with a drawn partner and never dims unrelated marks. Keyboard focus uses the same emphasis, Reduced Motion settles
  it instantly, and emphasis changes no layout or owner state. One shared affects/partner owner serves every sheet; there
  is no per-sheet hover engine. DL-259 FS-2 / plate text, 2026-10-31: the input paper’s fixed label and supporting fixed
  words (including The job and Your latest changes) fit their actual inner text box in each family, counting its padding/insets
  before sizing or fitting text. User-supplied job text retains the existing bounded fit. BrainStorm’s final chapter
  name keeps a visible gap from You after all placement offsets; labels never run together. Preserve the richest-mode-that-fits
  and no-scale/no-scroll yield rules: compact means names only and intentionally omits model lines, including Retro;
  full mode retains its model line. This adds no new plate mode, glyph, status or model-selection behavior. DL-259 FX-1
  final, 2026-10-31: an export/print attempt that fails before producing a PDF closes any unusable temporary print window
  and says plainly in its result/receipt and visible failure notice that no PDF was made. Opening the print flow alone
  is not proof that a file was created. A receipt records only the artifact owner’s actual result and never claims a
  successful PDF that was not made; failure or cancellation leaves the exact Plan revision unchanged. This is an outcome/feedback
  rule, not a new export command, receipt family or platform-detection mechanism. DL-259 FO-10 final, 2026-10-31: on
  Connect’s route screen, disabled Continue gives an actionable reason for the selected route’s visible input before
  an unresolved Server-choice reason. Web address and Remote Link use that field’s current missing/invalid-address result;
  an address typed instead of the found list asks for the address when empty and explains when no Puppet Master answers,
  with a route back to the list. Say Choose your Puppet Master only while the found-Server choice list is shown. Pip’s
  feedback conveys the same cause. These screen/status words stay single in Plain English and Expert (DL-126); only tips/help
  have two versions. Reason priority changes no validation, route identity, readiness, pairing or permission gate and
  admits no address/Remote Link grammar.'
gui_related: true
gui_classification_reason: Sets actual onboarding choices, shared explanation controls, native connection setup and Pip/notice
  presentation.
split_recommended: false
depends_on:
- PWIZ-021
- PWIZ-022
- PWIZ-025
- RAS-005
- RAS-014
- RAS-015
- MS-118
- F2-030
- DL-257
unblocks: []
acceptance_criteria:
- 'D1 A: the online-service step creates or selects a code repository; onboarding does not publish a website, GitHub
  Pages, GitLab Pages or another site. Local-only Project choices remain valid.'
- 'D2 A: explicit always-on Server setup on this computer, manual private HTTPS, a self-hosted Remote Link gateway, rarer
  SSH key types, China-region AI variants and local AI servers live in Settings, with a clear context-correct pointer
  from onboarding. The ordinary This computer choice remains the easy local-work default. The wizard says AI accounts
  available in this setup, not every AI. Existing Settings routes and owners retain the advanced capabilities.'
- 'D3 A: generated proxy settings support Caddy, NGINX and Traefik, with Caddy the default. Nginx Proxy Manager is existing-only:
  it can be selected as an existing proxy but never sent to a generation/install/export operation. DL-259 CERT-1 / srv
  C1, Jared 2026-10-31: onboarding offers Make the settings file or I have one already. The first generates/exports Caddy,
  NGINX or Traefik configuration for the person to add on their own system before the owner’s DNS, reachability and live-connection
  checks; Caddy is the default. The second only checks the existing proxy route and live connection, with nothing generated.
  Set it up for me is removed: Puppet Master does not install or host the proxy. The onboarding draft carries proxy_hosting=generate_only
  or existing_proxy for this new-Server proxy branch and keeps proxy_tls null; it collects no certificate choice. Generating
  a file proves neither installation nor consent, identity, secure reachability or a live route. For generation, onboarding
  proxy_kind is exactly caddy, nginx or traefik and maps to reverse_proxy_configuration.proxy_family. The existing-proxy
  branch may record nginx_proxy_manager but never emits a generated-configuration record; neither branch silently substitutes
  a family.'
- 'D4: confirm provider admission and executable conformance immediately before building Puppet Master. The wizard lists
  its provider choices without unconfirmed/not-verified badges, warnings or caveats. This scheduling decision does not
  change per-account authentication, entitlement, health or quota truth: Ready is the shared account owner’s current
  usable result, not merely signed in.'
- 'D5 A: the live Free Models source is github.com/vava-nessa/free-coding-models v0.6.0, read 2026-10-31; the June v0.5.39
  inspection remains historical lineage. Onboarding and Settings show OpenRouter free models (sign-in), Groq free plan
  (key) and NVIDIA free models (key) up front. Other currently eligible free providers from the same Free Models catalog
  appear behind one closed-by-default advanced control in each surface. That list is catalog-driven, never a pinned list
  or count, and still applies the Models owner’s supported/free/readiness filters. GitHub Models retired on 2026-07-30
  and has no active setup/catalog/routing action; saved choices remain No longer available and never become Copilot.
  Cerebras, Hugging Face and Ollama Cloud are excluded from the free offer. Authentication, billing class and currently
  usable account/model identity remain separate; catalog labels do not prove a route is free. No changing limits or prices
  are frozen in onboarding prose.'
- 'D6 A: the human signs in on the initiating active device while the AI/tool runs on the selected execution host. Official
  tool sign-ins and private account roots stay with that tool on that host; direct API keys are held by Puppet Master’s
  secure credential store on that host. Onboarding, Settings, model selection and Usage share stable account/profile/host/environment
  references, never provider-name booleans or copied secrets. Protected returns are bound to the exact operation, initiating
  Client/session/generation and execution host. Changing account, host or route invalidates stale validation; another
  account of the same provider has a distinct identity.'
- 'D7 B supersedes the former no-per-Client-node restriction. Native Puppet Master apps on Windows, macOS and Linux have
  their own built-in Tailscale connection and sign in once through the shared protected auth owner, with no separate
  Tailscale app install. The same signed PM-owned Go tsnet helper is supervised by its owning PM process. A Server keeps
  one active node per stable server_id; a native Client installation keeps one active node per stable client_id, independent
  of Projects, windows, tabs, sessions and Server endpoint selection. Owner-qualified configuration, process, IPC, authorization,
  egress and secure-state references prevent identity/key sharing or duplicate active nodes. Native Client nodes provide
  bounded Dial/stream access only to verified PM endpoints, not arbitrary proxying or a Server public listener. Server
  nodes retain the automatic private listener; Funnel remains Server-only, explicit, off by default and unavailable on
  Headscale. Human approval and reusable connection identity do not grant PM pairing/trust or work permission. A plain
  browser tab has no embedded Tailscale connection: it needs Remote Link or a private endpoint reachable through the
  device’s own Tailscale connection. It cannot be enrolled by a browser sign-in. Existing user-managed host Tailscale
  stays external and unmanaged.'
- 'D8 A: onboarding has one FileSafe switch, default on, covering command blocklist, write scope, security filter and
  pre-write safe points together. Individual controls remain in Settings. The switch expresses a requested owner configuration,
  never approval to bypass a required guard, an absent allowlist/baseline, failed canonical-path resolution, failed initialization
  or failed safe-point persistence. Mandatory policy and effective guard state win; a refused change stays refused with
  a clear reason. No failure silently turns a guard off.'
- 'ELI5: the wizard bar and Guided Tour bar expose the same global general.interaction.mode through the Settings owner,
  with values ELI5 and Expert, labels Plain English and Expert, and default ELI5. Both bars reflect the same effective
  state. Every opened onboarding question tip and prose help section has useful Plain English and technical versions,
  including FileSafe, service differences, storage, remote access and AI/auth choices, assuming no coding experience.
  Screen copy, control labels, exact fingerprints, paths and receipt data stay single; dual copy is limited to tips/help
  (DL-126). A mode change updates an open tip without rewriting a chat reply. Existing cmd.settings.transaction.preview/apply
  owns the preference; ui.guided_tour.toggle_eli5 is a compatibility local adapter to that shared preference, not a tour-only
  setting or chat ELI5 command. The predecessor tour_narration_only tag is retired.'
- 'Q1 B, Jared 2026-10-31: the shared Pip voice, say and vocals everywhere Pip speaks, sends 0.35 after trim and pan
  into its look’s room; Glass uses 0.30 and NieR 0.16. Each look uses its one per-look kit room, registered before the
  first shared voice in every host, with no stacked rooms. These restore the old voice’s own sends. Loudness remains
  within approximately 0.4 dB. The existing preference, gesture and sound owner still gates playback.'
- 'Q2 A: Jared confirmed on 2026-10-31 that staged toasts stay below the open bell inbox through the existing --pmn-push;
  it is his ruling, not an unresolved lead exception. Closed-inbox theme-menu resting-top placement and entry/exit click
  guards remain.'
- 'D2 A: onboarding offers NAS, Google Drive, OneDrive, Amazon S3, Backblaze B2, S3-compatible, SFTP and WebDAV backup
  choices, retaining their exact owner family/profile/locator identity. Azure Blob, Google Cloud Storage and REST-server
  destinations remain available in Settings > Backup & Restore, with a clear pointer. The Backup owner still supports
  all eleven registered families.'
- 'D2 A: repository object-format selection and its permanence acknowledgement belong in Settings, not onboarding. Existing-repository
  format observation, unknown/capability handling and the Source Control owner’s safeguards remain unchanged.'
- 'DL-259, Jared 2026-10-31, D4/D6: cursor_sdk is the separate Cursor SDK direct-provider entry, with API key as its
  default auth surface. A user key bills that user’s plan and a service-account key its owning team; these remain distinct
  account/billing identities. cursor_cli keeps browser login as its default and an advanced optional CLI-key path; it
  does not rename or absorb the SDK entry. alibaba_token_plan is a separate direct-provider entry for Alibaba Token Plan,
  a monthly-credit subscription with its own key and Singapore route identity, distinct from Alibaba Coding Plan and
  DashScope pay-as-you-go. MiniMax M Plan is the current label, with MiniMax Coding Plan retained as a former-name/search
  alias; OpenCode Console replaces the Zen display name and is a pay-as-you-go gateway. A label change never changes
  a saved provider/account ID.'
- 'DL-259 D4, Jared 2026-10-31: immediately before PM is built, confirm Z.AI’s listed-tools rule, Kimi Code’s client/session
  identity, OpenCode Go’s client/session identity and Muse’s Muse-only subscription credential. This is the pre-build
  provider-conformance checklist, not a wizard warning, badge or disabled choice.'
- 'DL-259 D6, Jared 2026-10-31: the Codex remote/headless device-code alternative requires enabling device-code login
  in ChatGPT security settings first, or the corresponding workspace permission by its administrator. This remains an
  alternative inside Sign in with ChatGPT, not another top-level auth family.'
- 'DL-259 CERT-1, Jared 2026-10-31: Puppet Master generates the proxy configuration; the person handles certificates
  and signing on their own systems. PM does not select, hold, validate, issue or sign those certificates, and admits
  no certificate-profile field or selector command. No certificate selection/validation is a prerequisite to configuration
  generation, route activation or Ready. Generation proves only that the configuration artifact was produced. Route Ready
  reports the actual PM-owner checks performed: endpoint reachability, protocol/API compatibility, expected Server identity
  and pairing/auth, and the applicable WebSocket, stream, transfer, deep-link and callback checks. It never claims that
  a certificate is valid. Existing secure-transport, public-exposure consent, identity and reachability requirements
  remain; missing or failed actual route checks cannot be called successful.'
- 'DL-259 CLOUD-1 A, Jared 2026-10-31: the person uses an explicit cloud-provider console or local-bootstrap handoff
  and its one-time Server setup code to claim a new cloud computer. The Server owner checks and consumes the code through
  the protected local/private bootstrap handoff. Its initial owner-claim authorization is bound to the existing discovery_observation_id,
  pairing_session_id and identity_fingerprint handed to cmd.server.claim, with the command’s current permission and generation
  fences. The tuple references owner-verified authority; guessed IDs, an address or a caller-provided success flag are
  not proof. Raw setup code never enters the ordinary command payload, stored setup plan, logs or receipts. No public
  unclaimed setup, automated provider-console/SSH provisioning or implicit tailnet enrollment is admitted. cmd.server.bootstrap.start
  remains separate after successful claim.'
- 'DL-259 DESKTOP-RESTORE-1 A, Jared 2026-10-31: the native desktop performs the first owner claim of its dormant local
  Server through a protected direct local handoff, with no code for the person to type. The Server owner binds that initial
  owner-claim authorization to its discovery_observation_id, pairing_session_id and identity_fingerprint for the existing
  cmd.server.claim request and exact current permission/generations. Ordinary Clients, browser state and loopback reachability
  cannot manufacture this protected native authority. Claim then separate cmd.server.bootstrap.start must complete for
  the actual local Server, its durable roots/mounts and immutable execution baseline before cmd.restore.server_full.
  Backup maintenance/recovery authority, exact-target verification, paused restore and separate pairing/remote activation
  remain required. Reuse current verified prerequisites when already satisfied; dormant capability alone is never a claim
  or bootstrap receipt.'
- 'DL-259 REMOTE-CODE-1 A, Jared 2026-10-31: the Remote Link owner issues and checks its protected HTTPS link or opaque
  short code. Decide the actual code grammar, normalization/case behavior, expiry/abuse policy and raw-code resolution
  protocol immediately before building PM, alongside D4’s pre-build checks; no grammar or sample code is pinned in canon.
  Preserve the owner-defined representation, reject empty input, and treat nonblank text as unverified draft rather than
  identity, pairing or Ready proof. After Review, the trusted owner validates/resolves it before the existing open and
  Server identity/pairing continuation. Unknown, expired or unresolvable input fails closed without another-Server fallback.
  This accepted pre-build verification point is not an unanswered product choice or a wizard caveat.'
- 'DL-259 srv final, 2026-10-31: Creating observes only the reviewed Project creation/open/restore result and its actual
  prerequisites. It does not run optional remote-access configuration. After that owner settlement, a separate postcommit
  remote-setup view inside automatic_preparation runs any requested Remote Access continuation, before the normal provider/Free
  Models continuation; the eleven-stage graph is unchanged. Tailscale/Headscale authorization, new Remote Link output,
  and configuration-file/export or existing-proxy checks (CERT-1 / srv C1) use their existing domain owners, approvals
  and truthful results. Later always finishes onboarding and leaves the committed Project intact: it does not wait for
  optional setup, certify it, undo owner effects or invent readiness. Unstarted setup is deferred; any already-started
  work obeys the owner’s existing cancel/background rules, and the app shows its actual result or pending state. Existing
  whole-session ui.onboarding.skip/close semantics supply this exit without a new mutation command.'
- 'DL-259 srv final, 2026-10-31: what the person actually set up is what the app shows. Enter/finish binds the shell,
  Settings and status views to the stable Client, Server, Execution Host, route and Project identities supplied by current
  owner results and registries, with their actual readiness/deferred state. Display names never become IDs, and the reviewed
  setup plan is intent rather than effective state. Onboarding creates no second account/server/Project registry or durable
  handoff writer; its initial context is a non-authoritative join of existing owner receipts/projections, followed by
  their normal updates. No concept-global object, event or store key is a product contract.'
- 'Jared answered the four owner questions on 2026-10-31. CERT-1 is neither proposed selector option: his words are "Dont
  we just generate the proxy conf for them? They deal with signing and certs on their own systems." CLOUD-1 A selects
  the console one-time setup-code handoff. DESKTOP-RESTORE-1 A selects protected native local handoff with no typed code.
  REMOTE-CODE-1 A places protocol verification immediately before the product build. These decisions supersede the earlier
  tentative safeguards and close all four owner questions; the existing command IDs and typed claim tuple remain.'
- 'Coverage-audit follow-up, 2026-10-31: accepted QA2 product rules include Auto retaining its mode while the Theme word
  follows the current family/OS scheme through the existing Settings writer; semantic technical-tooltip candidacy excluding
  internal container/render keys; focus-independent inner-overlay Escape; five equally prominent bounded look choices;
  readable settled-stage help notes without a separate tail; ordinary props visibly above the floor except Creating blocks;
  and No account yet retaining its category on return. Provider key rows use the exact official key console/guide through
  the existing protected official-page command and explain key versus password. Grouped First Project criteria, D7 shared
  consumers and five-family/ten-variant acceptance are reconciled in their owners. Concept API spellings move to source
  lineage under DL-260; they add no product request, persisted state or authority.'
- 'Late integration amendment, 2026-10-31: automatic local Name previews never treat a placeholder/suggestion as a chosen
  folder; typed service addresses remain scoped to their service/variant; AI phase Skip immediately reveals its skipped-state
  feedback; and the online-copy/import view, Continue button and activation use one current choice/validation result,
  including the Protect/restore action-prerequisite sweep. These retain existing local actions, owner admission/commit
  and readiness truth. The GLM re-check at 17e87e52e0 closed all 13 coverage findings; that static re-check is not native/runtime
  proof.'
- 'DL-259 FO-4, 2026-10-31: onboarding provider rows and connected-account summaries show the category and concise product/account
  identity without billing explanations, prices, limits or extra-usage pitches. Retain useful category names and exact
  account/product distinctions; this presentation rule does not alter the provider owner’s charging model, auth surface,
  account identity or credential custody. DL-259 FO-5, 2026-10-31: a choice’s question control stays visible, readable
  and reachable when its card is selected, hovered or keyboard-focused in every family. NieR’s selected/cursor ink stops
  before the help region or uses contrasting inverse ink there, without hiding the question, radio or selected state.
  DL-259 FO-6, 2026-10-31: a protected field keeps its typed value through redraws of the same screen and field identity,
  including typing in another field, opening help and changing Plain English/Expert. A blank rendering template alone
  must not erase it. The action clears the field when it consumes the input; leaving/recreating the screen, changing
  its service/method/target or explicit cancel/reset clears it too. Keep that input only in the protected entry control
  until consumption, never in ordinary draft/session persistence, receipts or logs. A filled/masked flag is not a credential
  or validation proof; submission reads the current protected value and rechecks its existing owner requirements. DL-259
  FO-7, 2026-10-31: accepting an owner’s approval or rejection finishes that exact pairing request/generation in the
  view. Clear its obsolete warning and render the answered result; later refreshes must not re-adopt the consumed result
  as a new request or show a false used-answer warning. The answered view offers a fresh code/request rather than Check
  again for the completed one. A fresh invitation starts a new generation; exact Server/Client/session/generation, matching-identity
  confirmation, permission, expiry and genuine replay rejection remain. Rejecting a later request cannot remove a Client
  already approved by an earlier request. A view marker never grants trust or bypasses the Server owner. DL-259 FO-8,
  2026-10-31: after actual clipboard success, Copy’s transient Copied acknowledgment holds for its full feedback interval
  across redraws of that same control, including countdown updates. Another successful copy starts a fresh full interval;
  an older timeout cannot clear its newer acknowledgment. Failure reports no success. Feedback is local presentation
  state and does not retain the copied protected value or become a saved preference, owner receipt or proof of any other
  operation. DL-259 FO-9 final, 2026-10-31: Creating’s checklist and block stack share the accepted owner’s phase/effect
  projection. When GitHub creation only partly settles, show only verified completed phases as checked or landed blocks;
  the phase proven to have failed may show failure and unexecuted/unproven phases remain pending. Unexecuted or unproven
  phases stay pending through an incomplete or unclear result until a later accepted owner result from Continue Setup
  or Check again proves those effects settled. The checklist, stage block count and stage progress use that same result;
  a settled phase keeps its block and an unproven phase has no completed block. Refresh alone neither completes a phase
  nor repeats a settled remote create. Transport completion and animation never prove the later registration, settings
  or connection steps. The recovery banner/actions, Continue availability and Ready use that same current owner result;
  O12’s last-block landing condition is additional to owner completion, never a replacement for it. DL-259 FS-1, 2026-10-31,
  supersedes Q17’s dimming: hover/focus emphasis begins only at an actual control in its affects region, including an
  embedded plate control; plain text, empty space and the picture alone trigger none. Affected marks take a one-pixel
  theme accent ring, with the shared soft glow in Glass and ink in NieR; their connecting lines and the job-card edge
  take accent, and the linked read-back takes the shared wash. Hover/focus never lowers another cast part’s opacity or
  recolours a Pip body, seat or label; each retains its intrinsic colours. Genuine owner-state quietness remains independent
  of hover. Scheduled emphasises only a row/mark with a drawn partner and never dims unrelated marks. Keyboard focus
  uses the same emphasis, Reduced Motion settles it instantly, and emphasis changes no layout or owner state. One shared
  affects/partner owner serves every sheet; there is no per-sheet hover engine. DL-259 FS-2 / plate text, 2026-10-31:
  the input paper’s fixed label and supporting fixed words (including The job and Your latest changes) fit their actual
  inner text box in each family, counting its padding/insets before sizing or fitting text. User-supplied job text retains
  the existing bounded fit. BrainStorm’s final chapter name keeps a visible gap from You after all placement offsets;
  labels never run together. Preserve the richest-mode-that-fits and no-scale/no-scroll yield rules: compact means names
  only and intentionally omits model lines, including Retro; full mode retains its model line. This adds no new plate
  mode, glyph, status or model-selection behavior. DL-259 FX-1 product portion, 2026-10-31: editing a terminal’s name
  stays in its own tab context menu, with Rename/Enter accepting the changed label and Cancel/Escape leaving it unchanged.
  Use the existing cmd.panel_tab.rename once; clearing the label still restores the terminal’s own name. DL-181’s retirement
  of workgroups and their commands remains in force. DL-259 FX-1 product portion, 2026-10-31: PDF export/print feedback
  names what actually happened. Opening the print flow is not proof that a PDF was written. If export or printing is
  unavailable, blocked or fails before producing a file, say plainly that no PDF was made and keep the exact Plan revision
  unchanged. The existing artifact owner’s verified result is the only success evidence; cancellation and failure cannot
  produce a successful export receipt.'
- 'DL-259 FX-1 final, 2026-10-31: an export/print attempt that fails before producing a PDF closes any unusable temporary
  print window and says plainly in its result/receipt and visible failure notice that no PDF was made. Opening the print
  flow alone is not proof that a file was created. A receipt records only the artifact owner’s actual result and never
  claims a successful PDF that was not made; failure or cancellation leaves the exact Plan revision unchanged. This is
  an outcome/feedback rule, not a new export command, receipt family or platform-detection mechanism.'
- 'DL-259 FO-10 final, 2026-10-31: on Connect’s route screen, disabled Continue gives an actionable reason for the selected
  route’s visible input before an unresolved Server-choice reason. Web address and Remote Link use that field’s current
  missing/invalid-address result; an address typed instead of the found list asks for the address when empty and explains
  when no Puppet Master answers, with a route back to the list. Say Choose your Puppet Master only while the found-Server
  choice list is shown. Pip’s feedback conveys the same cause. These screen/status words stay single in Plain English
  and Expert (DL-126); only tips/help have two versions. Reason priority changes no validation, route identity, readiness,
  pairing or permission gate and admits no address/Remote Link grammar.'
validation_surfaces:
- python3 scripts/pm7-onboarding-rulings-check.py
- python3 scripts/pm-new-contracts-verify.py
- python3 scripts/pm-shard-plans.py --check
risk_class: cross_owner_product_rulings
reasoning_tier: high
context_scope: onboarding_product_rules_20261031
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/Remote_Access_System.md
- Plans/FileSafe.md
- Plans/Models_System.md
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: accepted_product_contracts
  create_worknodes: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/DECISIONS-ONBOARDING.md Jared verbatim, 2026-10-31
- https://docs.github.com/en/github-models
- https://tailscale.com/docs/features/tsnet
- https://docs.gitea.com/api/operations/create-current-user-repo/
- https://cursor.com/docs/origin/create-repository
- https://cursor.com/docs/sdk/typescript
- https://platform.minimax.io/docs/m-plan/intro
- https://opencode.ai/v2/docs/console/models/
- https://www.alibabacloud.com/help/en/model-studio/token-plan-overview
- https://developers.openai.com/codex/auth/
- user-ruling:2026-10-31-shared-Pip-room-sends-0.35-Glass-0.30-NieR-0.16
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/DECISIONS-ONBOARDING.md (Owner questions, Jared 2026-10-31; DL-259)
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/lanes/srv/REPORT.md — Owner answers C1–C4, Jared 2026-10-31; product-only
  rules, no hints.
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/lanes/COVERAGE-AUDIT-astra.md — confirmed M1–M7, F1/F2, C1–C3
  and D1; source coverage only, no native proof.
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/lanes/onb/REPORT.md — GLM Name/Kept in amendment at 7aafb35322;
  product behavior only.
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/lanes/fields/REPORT.md — GLM online-service validation and same-kind
  sweep; source implementation serviceChoice and address map are lineage only.
- Concepts/onboarding/opus-5.5/src/js/73-screens-ai.js at cf0ae92b9a; 638b68f169 makes phase-skip feedback immediately
  visible. Source DOM keys, callback helpers and demonstration controls are not product APIs.
- 'PM7 final product delta at 44d0d3a1b1: final-onb FO-4–9, srv/fields/found/chatpip reports; FO-9 b75da99bef and FX-1
  229cbf9eae are WIP source evidence, not final implementation acceptance. Historical DL-258 Q17 is superseded by FS-1;
  DL-181 workgroup retirement remains.'
- 'PM7 foundations FX-1 final d8df03ac1820a7cb68d0d1b4897eeb03fa228a6b: plans.js PDF export outcome/error cleanup; lead
  1031173939-a128. Source implementation/preview mechanics do not become product requirements.'
- 'PM7 FO-9 final 503368802df57c9d35660d0a89dea15df01afc53 (completes b75da99bef), merged GUI d5a370fc98: 72-screens-review.js
  shownPhases and 55-scenes.js creating props/vars are source lineage, not native API names. Lead 1031175210-c5f1; fields
  report FO-9 final.'
- PM7 FO-10 final 03a02a178b1c386488b4a6f7865f9172cca7990c, merged integration 619cd29955; lead 1031184303-22ee and srv/final-onb
  FO-10 reports. 67-screens-connect.js routeReason/c-route foot and pip.oops copy keys are source lineage, not native
  API/error-grammar admission.
preserved_exact_tokens:
- D1 A
- D2 A
- D3 A
- D4
- D5 A
- D6 A
- D7 B
- D8 A
- Q1 B
- Q2 A
- general.interaction.mode
- Plain English
- Expert
- Caddy
- NGINX
- Traefik
- Nginx Proxy Manager
negative_constraints:
- Do not add non-product progression mechanics to canonical Plans.
- Do not label wizard providers as unconfirmed; verify admission immediately before building PM.
- Do not turn a plain browser tab into an embedded tailnet node or weaken pairing/guard checks.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/Remote_Access_System.md
- Plans/Models_System.md
- Plans/FileSafe.md
```
