# Shard 042: DL-180 to DL-185 — The Artifact Viewer Is A Tab Kind (2026-10-09)

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L3120-L3221

Source SHA256: `3ef4afcb0597344ef3dc97cb5f5091ded46edcd3c3307bac5b6e3565109844ec`

---

## DL-180 to DL-185 — The Artifact Viewer Is A Tab Kind (2026-10-09)

Jared's home redesign (`Plans/Decision_Log.md#DL-180`, decision D9) lists the Artifact viewer among the kinds of tab
any home panel can hold, with a subtype per artifact kind and versions. Canon had no unit saying where an opened
artifact renders: the Assistant redesign's Plan card sends embedded artifacts to "the normal artifact viewer", which
nothing defined, and `cmd.artifacts.open_panel` was named but never registered (UCC-120). This addendum adds RAP-065,
which makes the artifact viewer the `artifact` tab kind and says which artifacts it shows and how. The tab kind and its
ids are `Plans/FinalGUISpec.md#F3-635`'s and the opening rules `#F3-634`'s. It supersedes and amends no RAP unit:
RAP-007, RAP-008, RAP-019, RAP-026, RAP-037 and RAP-052 stand and are cited. It creates no WorkNodes, NodeSeeds,
executable queues, implementation files or production build tasks.

### RAP-065 - The Artifact Viewer Tab

```yaml
plan_unit_id: RAP-065
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  The artifact viewer is the `artifact` tab kind of the home panels (DL-180, D9; Plans/FinalGUISpec.md#F3-635): there
  is one artifact viewer, and every caller that shows an artifact opens it, the Artifacts side panel's rows, the chat's
  artifact cards and its Plan card's embedded artifacts, Usage and Ledger drill-throughs that land on an artifact, and
  agents. "The normal artifact viewer" of the Assistant redesign's Plan card is this tab kind. An artifact opens
  through the one opening module (F3-634, Plans/DRY_Rules.md#DR-071) by the existing `cmd.nav.open_subject` with an
  artifact subject and the placement fields of Plans/Contracts_V0.md#CV-360; the never-registered
  `cmd.artifacts.open_panel` is retired and resolves to that same open (Plans/UI_Command_Catalog.md#UCC-200,
  Plans/Commands_System.md#CS-101). The open resolves identity first, as RAP-007, RAP-008 and RAP-019 say: the
  artifact_id and its envelope refs, never a raw path. Tab ids: `artifact:<artifact_id>` shows the artifact's current
  version, `artifact:<artifact_id>@v<n>` shows version n and never changes, and the chat's own artifact ids open with
  the artifact kind (F3-635); one id is one tab, so opening an artifact that is already open reveals it where it is. The
  artifact_id, and the version for a pinned tab, are the tab's domain reference; the tab id never stands in for them.
  Each artifact type renders in its own subtype of the one viewer, drawn from the artifact's own payload, never from
  copied figures: the runtime artifact types of section 3 and the inline visualizer artifacts of RAP-037. A type that
  has no subtype of its own yet shows the artifact's metadata record and its open-in-owner routes (RAP-019,
  RAP-026), never an empty tab. Loading, stale and error are states the subtype shows from the artifact's own
  projection freshness and health, with RAP-019's freshness rules; an artifact whose payload retention removed shows
  RAP-052's tombstone, never a blank body. Versions: the viewer lists the artifact's versions in its header row (the
  shared row of F3-635), and choosing an earlier version opens or reveals that version's own tab through the opening
  module; the unversioned tab always follows the current version. A tab's serialized state holds the artifact
  reference and its subtype's view state only, never the payload (F3-635's 16 KB limit). The Artifacts side panel
  (section 1) stays a side panel that lists, previews and links; it is not a tab and holds no viewer of its own. Shell
  state still never replaces artifact identity: which panel the tab lands in is F3-634's, and nothing about the tab
  is written into the artifact, its index row or its events.
gui_related: true
gui_classification_reason: Defines where and how a person sees an opened artifact, its versions and its states in the home panels.
split_recommended: false
depends_on: [DL-180, F3-634, F3-635, RAP-007, RAP-008, RAP-019, RAP-026, RAP-037, RAP-052, CV-360]
unblocks: [ATS-075, GRRC-040]
acceptance_criteria:
  - "Opening an artifact from the Artifacts side panel, a chat artifact card, a Plan card's embedded artifact, a Usage or Ledger drill-through or an agent opens an `artifact` tab through `cmd.nav.open_subject`, and no caller opens a viewer of its own."
  - "No control dispatches `cmd.artifacts.open_panel`."
  - "`artifact:<artifact_id>` shows the current version and `artifact:<artifact_id>@v<n>` shows version n; opening either when it is already open reveals that tab."
  - "Choosing an earlier version in the header row's version list opens or reveals that version's own tab, and the unversioned tab keeps following the current version."
  - "Each artifact type renders from its own payload in its subtype; a type without a subtype shows its metadata record and owner routes; loading, stale, error and a retention tombstone each show their state, never an empty tab."
  - "A tab's saved state holds the artifact reference and view state only, and restoring the layout reopens the same artifact and version."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D9)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (section 2, artifact tab ids; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md, SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8 (section 3.5 and gap C8; audit lineage only)"
  - "Concepts/home-redesign/src/panels/kinds/44-artifact.js on concept/home-panels-20261009 (subtypes drawn from the payload, the states and the version list; concept lineage only)"
preserved_exact_tokens:
  - "artifact:<artifact_id>"
  - "artifact:<artifact_id>@v<n>"
  - "cmd.nav.open_subject"
  - "cmd.artifacts.open_panel"
  - "the normal artifact viewer"
negative_constraints:
  - "Do not give any caller an artifact viewer of its own, or open an artifact by a raw path."
  - "Do not register or dispatch `cmd.artifacts.open_panel`."
  - "Do not let a version tab change the version it shows, or the unversioned tab stop following the current version."
  - "Do not draw an artifact from copied figures, or show an empty tab for a missing, loading, stale or removed artifact."
  - "Do not store an artifact's payload in the tab's saved state."
compatibility_only_notes:
  - "The concept's demo artifacts, its versioned chat route form and its subtype list are concept lineage; the product's subtypes follow the artifact types canon owns."
stale_retired_dispositions:
  - "Retired 2026-10-09 (DL-180): `cmd.artifacts.open_panel`, which was never registered; an artifact opens through `cmd.nav.open_subject` into the artifact tab."
owner_boundary_notes:
  - "F3-635 owns the tab kind, its ids and the shared header row; F3-634 owns placement; this document owns which artifacts the viewer shows, how each type renders and the version rule."
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/Contracts_V0.md#CV-360, ContractName:Plans/UI_Command_Catalog.md#UCC-200
