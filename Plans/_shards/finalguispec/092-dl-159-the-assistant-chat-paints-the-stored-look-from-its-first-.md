# Shard 092: DL-159 — The Assistant Chat Paints The Stored Look From Its First Frame (2026-10-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L44014-L44070

Source SHA256: `95ad57449f79828dd3aa0c785fc4e77d33e869248480bf4bf274f68ca9d4dd54`

---

## DL-159 — The Assistant Chat Paints The Stored Look From Its First Frame (2026-10-09)

This addendum compiles the owner decision DL-159: the 5.6 Pro assistant chat concept opened on the browser's dark default and showed the viewer's stored look only when its first render ran, 1.3 to 1.7 seconds in, which flashed the whole window for a Light theme. The chat now applies the boot paint of F3-468 to its own page, as PMConcept7 does for its Project's look. The look's owners are unchanged: the theme token tables of F3-426, NieR Mode's contract (SSYS-043, F3-441) and the chat under NieR Mode (F3-589). The unit below owns the chat's first paint only. The concept is source lineage only: its store keys, its build script, its class names and every measured timing outside this unit are not canon.

### F3-612 — The Assistant Chat Paints The Stored Look From Its First Frame

```yaml
plan_unit_id: F3-612
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: |-
  A standalone Assistant chat page paints its first frame from F3-468’s one resolved look, including app scope, and uses the same OS-plus-Settings motion result. It keeps no chat-private theme store. When hosted in PMConcept7 the shared host remains the first-paint owner. Keep the five-family/ten-variant choice, resolved NieR Light/Dark ground, eligible initial boot log, pinned History placement and no large-surface recolor or reboot replay on reload. The previous standalone private reader and no-app-global-value wording are historical source lineage.
gui_related: true
gui_classification_reason: Defines what the assistant chat paints in its first frame and which reader paints it.
split_recommended: false
depends_on: [DL-159, F3-468, F3-589]
unblocks: []
acceptance_criteria:
  - "The first painted frame of the chat's page shows the stored look in each of the ten themes, in NieR Light and NieR Dark with all parts, no parts or Boot sequence removed, and under reduced motion; with nothing stored it shows Basic Dark."
  - "Opening the page writes no look setting and adds no stored key; no global holds the theme."
  - "No large surface changes colour between the first frame and the rendered chat, and the chat never shows before NieR Mode's boot log when the log plays."
  - "The reboot moment does not play on a reload, and the pinned history drawer is in place from the first frame."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: first_paint_drift
reasoning_tier: standard
context_scope: chat_fixes_20261009
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-159
- /mnt/Cursor/PuppetMaster-Evidence/scratch/c56-first-paint-20261009/REQUEST.md, SHA-256 8dcfcde107fc2d97bd3a884477a63dda5606ee04af23feba897a015474fd92be
- /mnt/Cursor/PuppetMaster-Evidence/scratch/c56-first-paint-20261009/MEASUREMENTS.md, SHA-256 edee5055e6a1ce894478b13a0c63a0103f5ef4ae0c20c615213a082b696469b7
- 'Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md, First paint: the stored look from the first frame (concept
  lineage only)'
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-work-packages;
  /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md; A-F09,C-F11
preserved_exact_tokens:
  - "first frame"
  - "Boot sequence"
negative_constraints:
  - "Do not write the look store, or a copy of the theme, while painting the first frame."
  - "Do not keep the chat's own first-paint reader once the chat is a part of PMConcept7's page."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-159, ContractName:Plans/FinalGUISpec.md#F3-468, ContractName:Plans/FinalGUISpec.md#F3-589, ContractName:Plans/DRY_Rules.md#DR-054
