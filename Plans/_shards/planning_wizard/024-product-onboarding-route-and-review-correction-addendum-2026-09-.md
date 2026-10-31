# Shard 024: Product Onboarding route-and-review correction addendum - 2026-09-01

Source: `Plans/Planning_Wizard.md`

Source lines: L2463-L2655

Source SHA256: `fe32d389c7c50561a530fd9e42fef00d64641ea655d1c0f8e07531c9fae614a2`

---

## Product Onboarding route-and-review correction addendum - 2026-09-01

PWIZ-024 retains the four semantic source intents and independent placement; DL-259 H2/FF-20 supplies the current New/Existing/Restore grouped presentation. PWIZ-021 now applies the September 3 draft/copy/late-commit and postcommit provider phases; the six-stage connect-existing shortcut, the typed local actions (fourteen since DL-153) and existing owner boundaries remain intact.

### PWIZ-024 - Visible project routes, independent placement, and live reviewed setup draft

```yaml
plan_unit_id: PWIZ-024
unit_type: integration_contract
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'Product Onboarding keeps the four First Project intents new/existing_local/existing_online/restore,
  presenting New, Existing and Restore with the selected Existing card’s local/online/device choices joined underneath,
  independently selects Server, Storage and Client, and keeps local Git/Jujutsu Safe History independent from optional
  forge hosting and complementary FileSafe. A durable reversible draft includes the Settings-owned Start fresh or Start
  like another Project preview. Selected-source read-only browsing/validation and individually consented source-account
  authentication may occur before Review; destination, repository, clone/history, Settings and Project mutations require
  the reviewed owner commit. Broad provider setup follows the actual committed Project. DL-259, Jared 2026-10-31: D1
  A: the online-service step creates or selects a code repository; onboarding does not publish a website, GitHub Pages,
  GitLab Pages or another site. Local-only Project choices remain valid. D2 A: explicit always-on Server setup on this
  computer, manual private HTTPS, a self-hosted Remote Link gateway, rarer SSH key types, China-region AI variants and
  local AI servers live in Settings, with a clear context-correct pointer from onboarding. The ordinary This computer
  choice remains the easy local-work default. The wizard says AI accounts available in this setup, not every AI. Existing
  Settings routes and owners retain the advanced capabilities. Audit FF-01..12: Review binds the exact provider/instance/account
  and repository or creation target. GitHub Internal requires an eligible enterprise organization capability; personal
  repositories cannot be Internal. Origin personal repositories are Private; eligible team codebases may be Private or
  Internal. GitLab uses the exact personal/group/subgroup namespace and instance visibility policy. Bitbucket Cloud binds
  an authorized workspace and explicit chosen/default Project with visibility compatibility; Data Center resolves an
  actual project key, including a supported personal Project. Azure Services binds organization and team Project; Server
  binds collection URI and team Project; selecting an existing repository carries its owner-resolved Project identity.
  Forgejo/Gitea use Public/Private repository privacy, not a fabricated Internal value; both hosted and self-managed
  choices require a real instance profile. Provider/owner changes invalidate incompatible visibility/container/auth choices;
  current provider-specific naming and Git ref validation precede availability. The selected actual auth method and least-privilege
  scopes must match the saved instance profile. Review shows privacy, target/instance, branch and material creation consequences,
  with expandable exact details and owner-routed Edit links. DL-259, Jared 2026-10-31: D2 A: onboarding offers NAS, Google
  Drive, OneDrive, Amazon S3, Backblaze B2, S3-compatible, SFTP and WebDAV backup choices, retaining their exact owner
  family/profile/locator identity. Azure Blob, Google Cloud Storage and REST-server destinations remain available in
  Settings > Backup & Restore, with a clear pointer. The Backup owner still supports all eleven registered families.
  D2 A: repository object-format selection and its permanence acknowledgement belong in Settings, not onboarding. Existing-repository
  format observation, unknown/capability handling and the Source Control owner’s safeguards remain unchanged. DL-259
  H8: Naming and Review show the actual resolved NFS, SMB or already-connected share/path selected by the source owner,
  preserving its identity instead of displaying an empty local-only field. DL-259 late integration, 2026-10-31: for an
  unnamed Project using the automatic local destination, Name shows the base destination plus “in a folder with your
  Project’s name”. With the factory base the line is “Kept in Documents › Puppet Master, in a folder with your Project''s
  name”. A placeholder or unselected suggestion never supplies a chosen folder leaf. Typing a name or explicitly choosing
  a suggestion adds that current draft name; clearing it restores the generic line. The local-location picker’s On this
  computer card names the base destination. Existing folders and selected network/mounted/remote sources still display
  their actual resolved location under H8. These are truthful draft previews and create no folder or Project before the
  reviewed commit. DL-259 late integration, 2026-10-31: a typed online-service address belongs to that service and its
  hosted/self-managed variant. Switching choices retains each choice’s own draft text for return and never substitutes
  another service’s address. An untouched or resumed choice resolves its actual current service, default variant and
  address consistently. Only the selected service/variant/address enters the reviewed setup plan. Changing the service,
  variant or instance invalidates incompatible account, repository, visibility and auth/preflight proofs under the existing
  owners. Remembered address text conveys no authentication or readiness and creates no setting, account registry or
  new durable storage family. DL-259 late integration, 2026-10-31: the online-copy/import service screen’s displayed
  selection, Continue availability/reason and activation consume one current resolved service/variant/address validation
  result. A missing or invalid required address keeps Continue unavailable, and activation rechecks that same current
  choice before any navigation, draft acceptance or owner dispatch; refusal has no partial effect or crash. Untouched
  defaults, Review Edit and resumed choices use that same interpretation. Protect Connect and restore destination Continue
  likewise recheck their displayed owner prerequisites at activation. Existing domain permission, exact identity, generation
  and currentness gates remain authoritative; a visually enabled button alone never authorizes owner work.'
gui_related: true
gui_classification_reason: Defines the visible First Project choices, connect-existing order, editable live Review
  projection, and defer behavior.
depends_on:
- PWIZ-021
- SCS-012
- FGI-011
- RAS-014
unblocks: []
acceptance_criteria:
- 'DL-259 H2/FF-20: the First Project stage shows New, Existing and Restore as three aligned, keyboard-reachable groups.
  Selecting Existing reveals its local/online/device choices in the joined tray before sibling alternatives. The four
  semantic intents new/existing_local/existing_online/restore remain reachable, with no unrelated More/Other Project
  Choices disclosure hiding a route.'
- Open a folder here supports a local folder, an OS-mounted SMB/NFS location, or Advanced SSH transport; Restore a backup
  uses its own backup source and transport and never reuses the ordinary folder path by implication.
- Server (where work runs), Storage (where files live), and Client (the device in hand) remain independent selections;
  mounted, SMB, NFS, and SSH storage choices do not force Server or Client identity.
- Local Safe History explicitly selects Git or Jujutsu without an account; FileSafe is an independent complementary safeguard;
  an online copy is optional and requires a verified forge account plus an explicit repository binding.
- Cursor Origin is a real eligible hosted Git destination in `Bring one from online` and optional online-copy setup,
  with Private visibility for personal repositories and Private or Internal for eligible team codebases; it is never
  rendered as a no-host or no-repository pseudo-option.
- The connect-existing stage first records one of four routes — Local or VPN, Tailscale with hosted or Headscale control,
  Reverse proxy, or Puppet Master Remote Link; bounded read-only discovery may project candidate endpoints before Review,
  while identity verification and pairing by approval, code, or QR remain owner-controlled work after confirmation.
- No visible `I recognize this Puppet Master` checkbox exists; verified Server identity plus the Server-owned pairing/trust
  result is the only recognition boundary.
- The Review summary is a live projection of the exact current draft, including edits, skips, destinations, transport,
  privacy, account/repository binding, pairing method, deferred items, and setup consequences.
- Before commit, only local draft writes, bounded read-only source/Project/Server/folder validation and selected-source
  authentication with current owner authorization may run; no Project/destination/history/repository/clone/Settings/sync
  mutation or unrelated provider work occurs.
- Visible Close/Skip remain available and persist the proper resumable or skipped state; retained ui.onboarding.defer
  is compatibility, not an extra required visible CTA; optional Remote Access may be Not now on guided setup, while connect-existing
  may defer the session but cannot claim Ready without a usable reviewed route plan.
- Confirmation dispatches only owner-defined operations and observes owner results; this PlanUnit creates no `cmd.onboarding.*`
  command, provider adapter, discovery engine, pairing authority, transport engine, or repository engine.
- 'DL-259, Jared 2026-10-31: D1 A: the online-service step creates or selects a code repository; onboarding does not
  publish a website, GitHub Pages, GitLab Pages or another site. Local-only Project choices remain valid. D2 A: explicit
  always-on Server setup on this computer, manual private HTTPS, a self-hosted Remote Link gateway, rarer SSH key types,
  China-region AI variants and local AI servers live in Settings, with a clear context-correct pointer from onboarding.
  The ordinary This computer choice remains the easy local-work default. The wizard says AI accounts available in this
  setup, not every AI. Existing Settings routes and owners retain the advanced capabilities. Audit FF-01..12: Review
  binds the exact provider/instance/account and repository or creation target. GitHub Internal requires an eligible enterprise
  organization capability; personal repositories cannot be Internal. Origin personal repositories are Private; eligible
  team codebases may be Private or Internal. GitLab uses the exact personal/group/subgroup namespace and instance visibility
  policy. Bitbucket Cloud binds an authorized workspace and explicit chosen/default Project with visibility compatibility;
  Data Center resolves an actual project key, including a supported personal Project. Azure Services binds organization
  and team Project; Server binds collection URI and team Project; selecting an existing repository carries its owner-resolved
  Project identity. Forgejo/Gitea use Public/Private repository privacy, not a fabricated Internal value; both hosted
  and self-managed choices require a real instance profile. Provider/owner changes invalidate incompatible visibility/container/auth
  choices; current provider-specific naming and Git ref validation precede availability. The selected actual auth method
  and least-privilege scopes must match the saved instance profile. Review shows privacy, target/instance, branch and
  material creation consequences, with expandable exact details and owner-routed Edit links.'
- 'DL-259, Jared 2026-10-31: D2 A: onboarding offers NAS, Google Drive, OneDrive, Amazon S3, Backblaze B2, S3-compatible,
  SFTP and WebDAV backup choices, retaining their exact owner family/profile/locator identity. Azure Blob, Google Cloud
  Storage and REST-server destinations remain available in Settings > Backup & Restore, with a clear pointer. The Backup
  owner still supports all eleven registered families. D2 A: repository object-format selection and its permanence acknowledgement
  belong in Settings, not onboarding. Existing-repository format observation, unknown/capability handling and the Source
  Control owner’s safeguards remain unchanged.'
- 'DL-259 H8: Naming and Review show the actual resolved NFS, SMB or already-connected share/path selected by the source
  owner, preserving its identity instead of displaying an empty local-only field.'
- 'DL-259 late integration, 2026-10-31: for an unnamed Project using the automatic local destination, Name shows the
  base destination plus “in a folder with your Project’s name”. With the factory base the line is “Kept in Documents
  › Puppet Master, in a folder with your Project''s name”. A placeholder or unselected suggestion never supplies a chosen
  folder leaf. Typing a name or explicitly choosing a suggestion adds that current draft name; clearing it restores the
  generic line. The local-location picker’s On this computer card names the base destination. Existing folders and selected
  network/mounted/remote sources still display their actual resolved location under H8. These are truthful draft previews
  and create no folder or Project before the reviewed commit.'
- 'DL-259 late integration, 2026-10-31: a typed online-service address belongs to that service and its hosted/self-managed
  variant. Switching choices retains each choice’s own draft text for return and never substitutes another service’s
  address. An untouched or resumed choice resolves its actual current service, default variant and address consistently.
  Only the selected service/variant/address enters the reviewed setup plan. Changing the service, variant or instance
  invalidates incompatible account, repository, visibility and auth/preflight proofs under the existing owners. Remembered
  address text conveys no authentication or readiness and creates no setting, account registry or new durable storage
  family.'
- 'DL-259 late integration, 2026-10-31: the online-copy/import service screen’s displayed selection, Continue availability/reason
  and activation consume one current resolved service/variant/address validation result. A missing or invalid required
  address keeps Continue unavailable, and activation rechecks that same current choice before any navigation, draft acceptance
  or owner dispatch; refusal has no partial effect or crash. Untouched defaults, Review Edit and resumed choices use
  that same interpretation. Protect Connect and restore destination Continue likewise recheck their displayed owner prerequisites
  at activation. Existing domain permission, exact identity, generation and currentness gates remain authoritative; a
  visually enabled button alone never authorizes owner work.'
validation_surfaces:
- Plans/product_onboarding_contracts.schema.json
- Plans/product_onboarding_contract_fixtures.json
- future native four-route
- live-review
- defer/resume
- and pre-review no-effect fixtures
- tests/test_pm_onboarding_phases.py
- tests/test_pm_settings_draft_transfer.py
risk_class: onboarding_hidden_route_or_pre_review_side_effect
reasoning_tier: high
context_scope: onboarding_setup_plan_semantics
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/product_onboarding_contracts.schema.json
- future Product Onboarding native controller
node_compile_hint:
  mode: onboarding_setup_plan_projection_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- user-correction:2026-09-01-onboarding-route-review-semantics
- Plans/product_onboarding_contracts.schema.json
- Concepts/pm7-tools/onboarding_cinematic_source.py
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/lanes/onb/REPORT.md — GLM Name/Kept in amendment at 7aafb35322;
  product behavior only.
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/lanes/fields/REPORT.md — GLM online-service validation and same-kind
  sweep; source implementation serviceChoice and address map are lineage only.
- Concepts/onboarding/opus-5.5/src/js/73-screens-ai.js at cf0ae92b9a; 638b68f169 makes phase-skip feedback immediately
  visible. Source DOM keys, callback helpers and demonstration controls are not product APIs.
preserved_exact_tokens:
- Start a new project
- Open a folder here
- Bring one from online
- Restore a backup
- Local or VPN
- Reverse proxy
- Puppet Master Remote Link
- Do this later
negative_constraints:
- Do not hide a First Project route behind More or Other Project Choices.
- Do not conflate Server, Storage, Client, project-source transport, or restore transport.
- Do not conflate local Safe History, FileSafe, and optional forge hosting.
- Do not add a recognition checkbox or claim reachability establishes trust.
- Do not create new commands, handlers, owner engines, or runtime-readiness evidence in Onboarding.
- Do not expand bounded selected-source access into precommit Project/repository/filesystem/Settings mutation or
  broad provider setup.
```
