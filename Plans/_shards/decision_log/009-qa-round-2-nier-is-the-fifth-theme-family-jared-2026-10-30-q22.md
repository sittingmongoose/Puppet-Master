# Shard 009: QA round 2 — NieR is the fifth theme family (Jared, 2026-10-30, Q22)

Source: `Plans/Decision_Log.md`

Source lines: L18644-L18943

Source SHA256: `4d7438497971839608473386d62b899d7dcd57f4dcdb53addb48bdaf990f683c`

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


QA2 owner amendment (2026-10-30; DL-258; integration 7d586bad18): current requirements in this document’s amended units take precedence over earlier presentation descriptions. Q16: You is the person alone, head and shoulders in each family’s materials and small-size maps. It carries no marionette cross, strings, holding arm/control or connection to a cross, and is never an agent Pip. Diagram edges to You express the plate’s result/topology, not puppet strings. The one ppYou/PX_YOU/pnYou drawer serves crew diagrams, cast plates, run cards and rosters. Optional agent strings and the single Pip primitive retain their existing meaning. Q15: the menu head and trigger use the same registry wand with the same rod/star/sparkle ink roles. Pip and that wand remain the head’s own children so a wrapper cannot discard the glyph’s role-specific colours. The sign’s kind glyph matches its sheet head; do not fork a second wand or fallback icon. Q6/Q7: point to the actual backup before asking to unlock it. A Recovery Kit is an untrusted locator plus protected recovery credential, not a storage place, backup payload, NAS password or cloud sign-in. Offer the Kit first, then the explicit no-Kit path to a folder, another device/NAS, or a cloud service. Continue waits for the selected file/folder/device/account and required fields. Validate the locator/trust and reach/authenticate the selected place through its existing owner. An accepted Kit may unlock that backup, but cannot bypass storage authentication. Show Unlock the backup only for a still-locked backup without an accepted unlock; name its selected place. Select a copy, coverage and preview only afterwards. Repointing invalidates the former unlock and snapshot selection. Owner recovery prerequisites, approval, protected secret handling and actual restore/Project commit boundaries remain mandatory; a concept Kit or seed never proves native unlock or restore. Q7/H2/H8: a selected choice’s follow-up belongs immediately in a tray joined to that card, before sibling alternatives. One C.cards under slot owns the join, indentation and line from the parent mark across all twelve affected screens. The parent opens into the tray in every look, with matching edges, no gap or overlapping lower corner/ring; narrow layouts put the parent question note first inside the tray. Arrow keys stay in their own choice list, and the option, its radio and question control never overlap. Apply to backup places/Kit, existing-work origins, work computer checks, sign-up links, Settings copy, remote routes/hosting/certificate fields, online service kind/address, device notes and connection routes. Naming and Review display the same selected mounted/network source, rather than an empty local-location field. Q3/Q8/Q9: question controls answer pointer hover and keyboard focus in the current look. Remove duplicate explanation-only disclosures (What is a Server?, the Connect proxy explanation, and What does Puppet Master read? on Choose a key); put their information in the shared option tips. Keep functional sections: More about keeping versions contains FileSafe, Which proxy contains the Caddy/NGINX/Traefik selector; identity fingerprints and Creating/restore receipts are data and remain. H3: SMB sign-in uses the operating system’s shared-folder keychain; Puppet Master stores no password. The SSH add-key password remains a separate one-use protected flow; never reuse its never-saved hint for SMB. Q4/Q10: there is one progress string. Chapter beads sit on and follow that string’s sag, with chapter names below Pip’s feet; Pip replaces the current bead and the current bead occupies no extra width. A highlight surrounds the name without covering Pip. The speech tail is cut from the bubble’s own fill/border as one silhouette, never a separate visible diamond; NieR keeps its no-tail treatment. Q1/Q2: onboarding sound defaults on under general.interaction.sound-effects, through the existing one player and trusted-gesture gate. No verified readable Project snapshot means an unbound preview: retain the factory-on choice or the person’s current visit choice rather than muting it on each refresh. An explicit readable Project value wins when it binds; a genuinely refused bound write remains refused. No Project value, credential, second mute key or durable sound preference is fabricated from an unreadable preview. H5: the onboarding owner holds one original inert-state basis for the entire open lifetime. Replacing an already-open screen acquires only newly encountered background nodes; it never re-snapshots nodes already held by that modal as originally inert. Every close/finish/skip path removes only the modal’s own holds, preserves pre-existing inert nodes and restores focus/input. H1: explicit lab open({screen}) invokes the screen owner’s seed(S), filling only missing fixture prerequisites; seed:false opts out. Connect/NAS/online fixtures have coherent identities, trust/key/source/sign-in examples. Seeds and seedCommit are lab-only: no native Project receipt, authentication, permission or completed owner work is inferred, no selected live input is overwritten, and no new product action/DTO field is admitted. Q12 amends G4: every Project’s Resources includes This computer and Puppet Master’s own services, which are shared and belong to no individual Project, alongside that Project’s own servers. An empty Project says that nothing in this Project is running, above the shared rows; it does not look empty or report another Project’s work as its own. Shared machines show only environments with running work. Metadata/freshness is available on tab entry; the existing visible-only 2 s sampling owner remains. Permission, exact host/environment identity and stale disclosure remain authoritative; shared read scope creates no Stop/Restart/Stop all or service-control authority. Q14/H9: Glass’s Activity bar and composer dock lines join Activity Detail, panel, System status, Stop/Quit list, History and hover/attachment cards on the persona/model menu’s near-opaque plate. The needs line keeps its warm wash over that plate. Settings dialogs and drawers flatten that same menu tint over the look’s ground so background labels cannot read through; ordinary panes keep their existing material. This is consumer treatment, no global Glass token change or extra backdrop-filter. H6: at the default narrow layout, 900 px and below folds chat to its existing 32 px edge strip under the centre-width ladder (C<480, with its hysteresis and explicit Keep open/peek rules). Suppress the hosted chat subtree’s painting/layout interaction while folded; a descendant visibility:visible must not expose a squeezed transcript, dock or composer. Open the chat/peek restores the same subtree at usable width, rather than a new chat instance. No folded/peek state is persisted and the saved message minimum, History and Activity Detail rules remain. H1/H5/H7/Q19: one lab Studio opens seeded owner screens and steps aside when launching a panel, chat view, Stop all or Quit. Recorded guides name the actual current control, including Schedule for …, and advance only after that control’s real example boundary. The teach-missed example owns its intended Send and finishes its recorded correction through the normal reply boundary; it does not simulate a native model promise. Natural user choices may remain waiting, and finished examples need not be forced into an artificial Done label. Keep DR-070’s existing named hidden-bridge debt unchanged; no additional synthetic click, demo product command, preference, persisted field or production wiring is authorized. Q18: when a concept page has no usable storage at all (opaque-origin sandbox access throws), each existing owner store retains a secret-free, key-isolated memory record for that visit and exposes persistent:false. Home PMW.store.raw/get/set/remove and O55.store.get/set/clear/scrub remain their sole adapters; reload/new visit loses memory. Settings’ corresponding Project adapter must preserve Project isolation and ordinary owner admission. Available storage whose write/quota/readback fails still reports failure and rolls back: never silently switch a failing persistent store to memory. Visit-only success is fixture-local, non-authoritative and never native durability, a restored backup, verified credential or a native owner receipt; production Storage/Settings CAS/readback/rollback rules are unchanged.


### DL-258 - QA Round 2 GUI And Owner Boundary Alignment

```yaml
plan_unit_id: DL-258
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: 'QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Jared’s QA2 and the accepted GUI/hunter
  fixes amend current presentation, retaining owner and production-proof boundaries. Q6/Q7: point to the actual
  backup before asking to unlock it. A Recovery Kit is an untrusted locator plus protected recovery credential,
  not a storage place, backup payload, NAS password or cloud sign-in. Offer the Kit first, then the explicit
  no-Kit path to a folder, another device/NAS, or a cloud service. Continue waits for the selected file/folder/device/account
  and required fields. Validate the locator/trust and reach/authenticate the selected place through its existing
  owner. An accepted Kit may unlock that backup, but cannot bypass storage authentication. Show Unlock the
  backup only for a still-locked backup without an accepted unlock; name its selected place. Select a copy,
  coverage and preview only afterwards. Repointing invalidates the former unlock and snapshot selection. Owner
  recovery prerequisites, approval, protected secret handling and actual restore/Project commit boundaries
  remain mandatory; a concept Kit or seed never proves native unlock or restore. Q7/H2/H8: a selected choice’s
  follow-up belongs immediately in a tray joined to that card, before sibling alternatives. One C.cards under
  slot owns the join, indentation and line from the parent mark across all twelve affected screens. The parent
  opens into the tray in every look, with matching edges, no gap or overlapping lower corner/ring; narrow layouts
  put the parent question note first inside the tray. Arrow keys stay in their own choice list, and the option,
  its radio and question control never overlap. Apply to backup places/Kit, existing-work origins, work computer
  checks, sign-up links, Settings copy, remote routes/hosting/certificate fields, online service kind/address,
  device notes and connection routes. Naming and Review display the same selected mounted/network source, rather
  than an empty local-location field. Q3/Q8/Q9: question controls answer pointer hover and keyboard focus in
  the current look. Remove duplicate explanation-only disclosures (What is a Server?, the Connect proxy explanation,
  and What does Puppet Master read? on Choose a key); put their information in the shared option tips. Keep
  functional sections: More about keeping versions contains FileSafe, Which proxy contains the Caddy/NGINX/Traefik
  selector; identity fingerprints and Creating/restore receipts are data and remain. H3: SMB sign-in uses the
  operating system’s shared-folder keychain; Puppet Master stores no password. The SSH add-key password remains
  a separate one-use protected flow; never reuse its never-saved hint for SMB. Q4/Q10: there is one progress
  string. Chapter beads sit on and follow that string’s sag, with chapter names below Pip’s feet; Pip replaces
  the current bead and the current bead occupies no extra width. A highlight surrounds the name without covering
  Pip. The speech tail is cut from the bubble’s own fill/border as one silhouette, never a separate visible
  diamond; NieR keeps its no-tail treatment. Q1/Q2: onboarding sound defaults on under general.interaction.sound-effects,
  through the existing one player and trusted-gesture gate. No verified readable Project snapshot means an
  unbound preview: retain the factory-on choice or the person’s current visit choice rather than muting it
  on each refresh. An explicit readable Project value wins when it binds; a genuinely refused bound write remains
  refused. No Project value, credential, second mute key or durable sound preference is fabricated from an
  unreadable preview. H5: the onboarding owner holds one original inert-state basis for the entire open lifetime.
  Replacing an already-open screen acquires only newly encountered background nodes; it never re-snapshots
  nodes already held by that modal as originally inert. Every close/finish/skip path removes only the modal’s
  own holds, preserves pre-existing inert nodes and restores focus/input. H1: explicit lab open({screen}) invokes
  the screen owner’s seed(S), filling only missing fixture prerequisites; seed:false opts out. Connect/NAS/online
  fixtures have coherent identities, trust/key/source/sign-in examples. Seeds and seedCommit are lab-only:
  no native Project receipt, authentication, permission or completed owner work is inferred, no selected live
  input is overwritten, and no new product action/DTO field is admitted. Q13/CC5: the PM_WORK dock provider
  gives a live process and the next pending scheduled run a 60000 ms presentation lifetime from first exposure
  in that thread’s dock projection. Key freshness by thread, work identity and run start/occurrence time; repaint
  or returning to the same run does not restart it, while a restarted/new occurrence gets a new lifetime. At
  elapsed >=60000 the non-needs line leaves. Needs-you lines bypass expiry and remain until the owning question/input
  is answered. One next-expiry timer requests a redraw; it owns no work, schedule or persisted state and expiry
  never stops/cancels/deletes work. Existing dock priority, at-most-three budget and transcript visibility
  gates remain; full work remains reachable through Activity and the panel. Q12 amends G4: every Project’s
  Resources includes This computer and Puppet Master’s own services, which are shared and belong to no individual
  Project, alongside that Project’s own servers. An empty Project says that nothing in this Project is running,
  above the shared rows; it does not look empty or report another Project’s work as its own. Shared machines
  show only environments with running work. Metadata/freshness is available on tab entry; the existing visible-only
  2 s sampling owner remains. Permission, exact host/environment identity and stale disclosure remain authoritative;
  shared read scope creates no Stop/Restart/Stop all or service-control authority. Q14/H9: Glass’s Activity
  bar and composer dock lines join Activity Detail, panel, System status, Stop/Quit list, History and hover/attachment
  cards on the persona/model menu’s near-opaque plate. The needs line keeps its warm wash over that plate.
  Settings dialogs and drawers flatten that same menu tint over the look’s ground so background labels cannot
  read through; ordinary panes keep their existing material. This is consumer treatment, no global Glass token
  change or extra backdrop-filter. Q20: Glass has only the F3-465/PMH shared hover light on registered edge-glow
  objects, including Usage/Home widgets, cards, tiles and rows. Remove the independent sheet-wide lg-shine/light,
  pointer listener and stale data-lg-lit. Its central sheen is at Basic’s level (Glass Dark white 4.5 percent,
  Glass Light accent 4.5 percent); edge glow is unchanged. Plain panels, bars and dialog ground do not light
  merely because the pointer crosses them. Retro and NieR retain their non-soft-light forms and existing Reduced
  Motion, software and gesture holds. Q17: hover-to-light/dimming starts only from an actual control inside
  its affects region (button, input, select, textarea, label or switch/radio/tab/slider semantics). Plain words,
  empty section space and the plate picture do not dim the cast. Keyboard focus on a control gives the same
  feedback; a plate-embedded control remains eligible. Scheduled highlights only rows/marks with a real partner
  on its plate; markless rows dim nothing. One affectsOf/linkStyle owner supplies this behavior, with no per-sheet
  hover engine. Q16: You is the person alone, head and shoulders in each family’s materials and small-size
  maps. It carries no marionette cross, strings, holding arm/control or connection to a cross, and is never
  an agent Pip. Diagram edges to You express the plate’s result/topology, not puppet strings. The one ppYou/PX_YOU/pnYou
  drawer serves crew diagrams, cast plates, run cards and rosters. Optional agent strings and the single Pip
  primitive retain their existing meaning. Q15: the menu head and trigger use the same registry wand with the
  same rod/star/sparkle ink roles. Pip and that wand remain the head’s own children so a wrapper cannot discard
  the glyph’s role-specific colours. The sign’s kind glyph matches its sheet head; do not fork a second wand
  or fallback icon. Q18: when a concept page has no usable storage at all (opaque-origin sandbox access throws),
  each existing owner store retains a secret-free, key-isolated memory record for that visit and exposes persistent:false.
  Home PMW.store.raw/get/set/remove and O55.store.get/set/clear/scrub remain their sole adapters; reload/new
  visit loses memory. Settings’ corresponding Project adapter must preserve Project isolation and ordinary
  owner admission. Available storage whose write/quota/readback fails still reports failure and rolls back:
  never silently switch a failing persistent store to memory. Visit-only success is fixture-local, non-authoritative
  and never native durability, a verified restore/credential or a native owner receipt; production Storage/Settings
  CAS/readback/rollback rules are unchanged. H6: at the default narrow layout, 900 px and below folds chat
  to its existing 32 px edge strip under the centre-width ladder (C<480, with its hysteresis and explicit Keep
  open/peek rules). Suppress the hosted chat subtree’s painting/layout interaction while folded; a descendant
  visibility:visible must not expose a squeezed transcript, dock or composer. Open the chat/peek restores the
  same subtree at usable width, rather than a new chat instance. No folded/peek state is persisted and the
  saved message minimum, History and Activity Detail rules remain. H1/H5/H7/Q19: one lab Studio opens seeded
  owner screens and steps aside when launching a panel, chat view, Stop all or Quit. Recorded guides name the
  actual current control, including Schedule for …, and advance only after that control’s real example boundary.
  The teach-missed example owns its intended Send and finishes its recorded correction through the normal reply
  boundary; it does not simulate a native model promise. Natural user choices may remain waiting, and finished
  examples need not be forced into an artificial Done label. Keep DR-070’s existing named hidden-bridge debt
  unchanged; no additional synthetic click, demo product command, preference, persisted field or production
  wiring is authorized. QA2 follow-up N1, integration 6609384fd0; DL-258: A reached backup place is bound to
  the selected service or device, not a reusable signed-in/ready boolean. Choosing another source, service,
  device, Kit or folder invalidates its old reach proof, protected access fields, unlock, copy selection and
  completed bucket check. A late sign-in/check result stays bound to the service/device it authenticated and
  cannot advance a different current choice. The concept reachKey/reachedFor projection is fixture state, never
  an owner credential or permission receipt. A protected SSH key passphrase unlock belongs to that exact selected
  key; changing keys requires that key’s own owner-proven access and never inherits another key’s unlock. The
  Remote Link endpoint belongs only to the Remote Link route; choosing Only at home/local-or-VPN, Tailscale
  or another route clears it from the reviewed draft. No stale endpoint enters an unrelated route.'
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
- Q6/Q7 restore is source-first, Kit is not a storage place/auth credential, and protected unlock follows owner
  proof.
- Q1/Q2 unreadable Project state keeps factory/visit sound; no audio before a trusted gesture.
- Q13 non-needs Work lines expire per thread/run after 60000 ms without mutating the owner.
- Q12/Q14 shared Resources and near-opaque Glass plates are truthful from first tab entry.
- Q15/Q16/Q17/Q20 use one wand, person-only You, control-only plate feedback and one shared Glass hover light.
- H1/H5/H6/H7 preserve coherent lab seeds, original modal holds, clean narrow strip and revealed launch destinations.
- Q18 visit memory is non-authoritative; actual persistent write/readback failures still refuse/rollback. No
  new command, event, setting, native payload or physical store.
- 'QA2 follow-up N1, integration 6609384fd0; DL-258: A reached backup place is bound to the selected service
  or device, not a reusable signed-in/ready boolean. Choosing another source, service, device, Kit or folder
  invalidates its old reach proof, protected access fields, unlock, copy selection and completed bucket check.
  A late sign-in/check result stays bound to the service/device it authenticated and cannot advance a different
  current choice. The concept reachKey/reachedFor projection is fixture state, never an owner credential or
  permission receipt. A protected SSH key passphrase unlock belongs to that exact selected key; changing keys
  requires that key’s own owner-proven access and never inherits another key’s unlock. The Remote Link endpoint
  belongs only to the Remote Link route; choosing Only at home/local-or-VPN, Tailscale or another route clears
  it from the reviewed draft. No stale endpoint enters an unrelated route.'
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
- Foundations e2de4bb8710a57cfb85448d605e67b0012389e8a; PM7_SETTINGS_STORE and retired_input_ids parser
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
