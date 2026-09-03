# Shard 023: Product Onboarding route-and-review correction addendum - 2026-09-01

Source: `Plans/Planning_Wizard.md`

Source lines: L1959-L2013

Source SHA256: `de4da73fc489b3041304f58d5cf5d6563aa152b5ba4bd3256b81f4c1bc43351e`

---

## Product Onboarding route-and-review correction addendum - 2026-09-01

PWIZ-024 supersedes only the conflicting choice-density, hidden-project-route, and generic connect-existing wording in
PWIZ-021 and the preceding Product-design law. The nine-stage guided path, six-stage connect-existing shortcut, typed
local action vocabulary, Review confirmation fence, and retained owner boundaries remain unchanged.

### PWIZ-024 - Visible project routes, independent placement, and live reviewed setup draft

```yaml
plan_unit_id: PWIZ-024
unit_type: integration_contract
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  Product Onboarding exposes all four First Project entry routes together: Start a new project, Open a folder here,
  Bring one from online, and Restore a backup. It records Server, Storage, and this Client as independent choices;
  records local Git or Jujutsu Safe History independently from optional forge hosting; and keeps FileSafe complementary.
  Connect existing chooses a connection route before discovery, identity selection, and pairing. The local draft and
  Review summary update immediately and may consume cached owner data, nearby/known Server endpoint projections,
  already-detected account/session status, and explicitly non-authenticating read-only discovery. Authentication,
  pairing, live repository lookup/creation/binding, restore execution, Server/network configuration, filesystem mutation,
  and every other side effect wait for confirmation of the current Review revision. Setup-later remains a valid
  resumable outcome.
gui_related: true
gui_classification_reason: Defines the visible First Project choices, connect-existing order, editable live Review projection, and defer behavior.
depends_on: [PWIZ-021, SCS-012, FGI-011, RAS-014]
unblocks: []
acceptance_criteria:
  - The First Project stage shows four equal, aligned, keyboard-reachable routes at once — `new`, `existing_local`, `existing_online`, and `restore`; no More/Other Project Choices disclosure hides any route.
  - Open a folder here supports a local folder, an OS-mounted SMB/NFS location, or Advanced SSH transport; Restore a backup uses its own backup source and transport and never reuses the ordinary folder path by implication.
  - Server (where work runs), Storage (where files live), and Client (the device in hand) remain independent selections; mounted, SMB, NFS, and SSH storage choices do not force Server or Client identity.
  - Local Safe History explicitly selects Git or Jujutsu without an account; FileSafe is an independent complementary safeguard; an online copy is optional and requires a verified forge account plus an explicit repository binding.
  - Cursor Origin is a real eligible hosted Git destination in `Bring one from online` and optional online-copy setup, with Private or Internal visibility only; it is never rendered as a no-host or no-repository pseudo-option.
  - The connect-existing stage first records one of four routes — Local or VPN, Tailscale with hosted or Headscale control, Reverse proxy, or Puppet Master Remote Link; bounded read-only discovery may project candidate endpoints before Review, while identity verification and pairing by approval, code, or QR remain owner-controlled work after confirmation.
  - No visible `I recognize this Puppet Master` checkbox exists; verified Server identity plus the Server-owned pairing/trust result is the only recognition boundary.
  - The Review summary is a live projection of the exact current draft, including edits, skips, destinations, transport, privacy, account/repository binding, pairing method, deferred items, and setup consequences.
  - Before the current Review revision is confirmed, Onboarding performs local draft writes and may consume cached owner data, already-detected account/session status, known endpoints, and owner-bounded read-only LAN/VPN or active-tailnet discovery; no sign-in, enrollment, pairing, trust grant, protected account verification, live repository lookup/create/bind, filesystem mutation, restore execution, Server/Storage/network change, or Remote Access mutation occurs.
  - The Do this later action remains available from every non-terminal stage and persists the exact resumable continuation; optional Remote Access may be Not now on guided setup, while connect-existing may defer the session but cannot claim Ready without a usable reviewed route plan.
  - Confirmation dispatches only owner-defined operations and observes owner results; this PlanUnit creates no `cmd.onboarding.*` command, provider adapter, discovery engine, pairing authority, transport engine, or repository engine.
validation_surfaces: [Plans/product_onboarding_contracts.schema.json, Plans/product_onboarding_contract_fixtures.json, Concepts/pm7-tools/onboarding_cinematic_source.py static assertions, future native four-route, live-review, defer/resume, and pre-review no-effect fixtures]
risk_class: onboarding_hidden_route_or_pre_review_side_effect
reasoning_tier: high
context_scope: onboarding_setup_plan_semantics
implementation_surfaces: [Plans/Planning_Wizard.md, Plans/product_onboarding_contracts.schema.json, future Product Onboarding native controller]
node_compile_hint: {mode: onboarding_setup_plan_projection_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [user-correction:2026-09-01-onboarding-route-review-semantics, Plans/product_onboarding_contracts.schema.json, Concepts/pm7-tools/onboarding_cinematic_source.py]
preserved_exact_tokens: [Start a new project, Open a folder here, Bring one from online, Restore a backup, Local or VPN, Reverse proxy, Puppet Master Remote Link, Do this later]
negative_constraints:
  - Do not hide a First Project route behind More or Other Project Choices.
  - Do not conflate Server, Storage, Client, project-source transport, or restore transport.
  - Do not conflate local Safe History, FileSafe, and optional forge hosting.
  - Do not mutate network, authentication, owner, repository, filesystem, or trust state before Review confirmation.
  - Do not add a recognition checkbox or claim reachability establishes trust.
  - Do not create new commands, handlers, owner engines, or runtime-readiness evidence in Onboarding.
```
