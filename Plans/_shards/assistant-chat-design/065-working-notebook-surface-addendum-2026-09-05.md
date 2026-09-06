# Shard 065: Working Notebook Surface Addendum (2026-09-05)

Source: `Plans/assistant-chat-design.md`

Source lines: L24654-L24762

Source SHA256: `6042b076a4835fecf4c2297bc51de70c98e5f604a4552c5ef425289124ebb4b7`

---

## Working Notebook Surface Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Notebook semantics are owned by `Plans/Working_Notebook.md` (WN-019); this section owns the chat-side surfaces under the existing chrome/tab patterns. The thread notebook opens as an ordinary editor/detail tab through the canonical route/open model (the same non-file tab family as the Context Detail tab, F3-421/F3-445) — no new permanent rail, no Settings manager, and no transcript flooding with note updates. The tab renders concrete states: empty (positive empty copy, create affordance), loading (skeleton, bounded), available (entries with author, epistemic kind, freshness, evidence refs), read-only (no Project binding, deleted Project, viewer role, or denied scope — each with its truthful reason), stale (freshness `needs_revalidation`/`source_unavailable` shown per entry), conflict (CAS stale-edit conflict with both revisions and reapply), and error (typed reason + retry). Trivial chat produces no notebook and no overhead (WNC-A01).

User corrections and additions are attributed revision-safe actions: a user edit creates a new attributed revision (CAS; a conflicting agent edit surfaces the stale-edit conflict instead of overwriting), in-flight requests keep their original receipt-bound bytes, and dependent future assembly revalidates or invalidates as necessary. Editing never claims to change bytes already sent.

Context Detail and context controls disclose continuity truthfully: the Context Detail Pane shows notebook/capsule contributions as distinct source classes (separate from memory, history, and workflow state), requested/effective fresh-window transition reason and path, checkpoint status, omitted/truncated/redacted classes, and unknown native state labeled unknown — never fabricated. The context controls offer a separately labeled **fresh-context request** distinct from **Compact Now**: Compact Now remains compaction (`cmd.chat.compact_context`, unchanged); the fresh-context request is a new labeled affordance rendering truthful eligibility and disabled reasons (unsupported route, unsaved required checkpoint, deferred) and is never mislabeled as complete session deletion or `done.rotated`. Occupancy drops after a fresh window while cumulative usage and quota display stay correct per UF-099.

```yaml
plan_unit_id: ACD-449
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: The thread Working Notebook opens as an ordinary editor/detail tab through the canonical route/open model with concrete empty, loading, available, read-only, stale, conflict, and error states; no new permanent rail or Settings manager exists and the transcript is not flooded with note updates. User corrections are attributed revision-safe actions producing CAS revisions with visible stale-edit conflicts; in-flight requests keep their original bytes.
gui_related: true
gui_classification_reason: "This unit is chat notebook surface behavior: tab entry, states, and correction affordances."
depends_on: [ACD-448, WN-019]
unblocks: [ACD-450, ACD-451]
acceptance_criteria:
  - Notebook tab states render truthfully for empty/denied/stale/conflicted/loading/available.
  - Concurrent user edit surfaces a conflict instead of overwriting; sent bytes are never rewritten.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: untruthful_surface_state
reasoning_tier: high
context_scope: assistant_chat
implementation_surfaces: [Plans/assistant-chat-design.md, Plans/Working_Notebook.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: gui_surface_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-X01
  - source_packet:PM-WNC-2026-09-05-v1:WNC-X02
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A53
preserved_exact_tokens: ["editor/detail tab", "stale-edit conflict", "receipt-bound bytes"]
negative_constraints:
  - Do not add a permanent notebook rail or mandatory standalone Settings manager.
  - Do not flood the transcript with every note update.
owner_hints: [Plans/assistant-chat-design.md, Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Working_Notebook.md, ContractName:Plans/UI_Command_Catalog.md

```yaml
plan_unit_id: ACD-450
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: "Context Details discloses continuity truthfully: notebook/capsule contributions render as a distinct source class separate from memory, history, and workflow state; requested/effective fresh-window transition reason/path, checkpoint status, omitted/truncated/redacted source classes, and unknown native state render as unknown rather than fabricated. A separately labeled fresh-context request exists in context controls with truthful eligibility and disabled reasons; Compact Now remains compaction with unchanged semantics; fresh context is never labeled session deletion or done.rotated."
gui_related: true
gui_classification_reason: This unit is Context Details and context-control UI behavior.
depends_on: [ACD-449, PP-085]
unblocks: []
acceptance_criteria:
  - The user can distinguish notebook, memory, history, and workflow contributions.
  - Fresh-context request and Compact Now are visibly distinct with truthful disabled reasons.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: misleading_disclosure
reasoning_tier: high
context_scope: assistant_chat
implementation_surfaces: [Plans/assistant-chat-design.md, Plans/usage-feature.md, Plans/Prompt_Pipeline.md]
node_compile_hint: {mode: gui_surface_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-X03
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A34
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A53
preserved_exact_tokens: ["Compact Now", "fresh-context request", "unknown", "done.rotated"]
negative_constraints:
  - Do not repurpose Compact Now as a fresh-context control.
  - Do not render unknown native state as known.
owner_hints: [Plans/assistant-chat-design.md, Plans/usage-feature.md]
```

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Prompt_Pipeline.md

```yaml
plan_unit_id: ACD-451
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: "Chat integration is eligibility-aware across long research, editing, debugging, model changes, pause/resume, and thread recovery. The notebook and fresh-window affordances appear only where eligible; a trivial chat uses neither and produces no notebook or helper overhead. Debug flows keep Investigation Context authority: debug notes reference investigation/target/instrumentation/cleanup records, and transition or recovery rechecks active/redacted/revoked/blocked/expired/omitted evidence and target/worktree/session drift before reuse; raw logs and media remain artifacts. Thread restore and model change never silently rebind a notebook to a different target; provider-hidden content is never shown as PM-authored notes (WNC-N17)."
gui_related: true
gui_classification_reason: This unit specifies chat eligibility and debug-note surface behavior.
depends_on: [ACD-449]
unblocks: []
acceptance_criteria:
  - A trivial exchange creates no notebook and no fabricated usage attempt.
  - Old debug notes never reactivate revoked evidence or imply cleanup occurred.
  - Thread recovery rehydrates notebook access without rebinding to a different target.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: evidence_staleness
reasoning_tier: high
context_scope: assistant_chat
implementation_surfaces: [Plans/assistant-chat-design.md, Plans/Working_Notebook.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: gui_surface_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I01
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I09
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N17
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A02
preserved_exact_tokens: ["Investigation Context", "trivial chat", "rehydrates"]
negative_constraints:
  - Do not scrape hidden provider notes into the notebook UI.
  - Do not rebind notebooks to a different target on restore.
owner_hints: [Plans/assistant-chat-design.md, Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Working_Notebook.md, ContractName:Plans/Runtime_Artifacts_Panel.md
