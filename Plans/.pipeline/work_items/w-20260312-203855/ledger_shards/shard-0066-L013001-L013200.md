- Deprecated aliases and stable wrappers need different lifecycle rules.
- The wiring/gate layer now needs to understand normalization, not just uniqueness.
- Event aliasing is still the right analogy for migration behavior, but not for permanent UX-facing wrapper commands.

## Research Progress - 2026-03-17 - Exact shape of the command-normalization contract

### Targeted docs read
- `Plans/UI_Command_Catalog.md`
- `Plans/Contracts_V0.md`
- `Plans/Wiring_Matrix.schema.json`
- `Plans/Progression_Gates.md`

### Key findings
- The normalization contract needs to stay deliberately small.
- The right owner boundary is:
  - command-definition metadata belongs in the command catalog / command contract layer
  - the route schema remains the owner of actual route-target structure
  - wiring rows should reference command IDs and handlers, not restate the normalization model in full
- The minimum useful shape now looks like:
  - `command_kind`
    - `shell_view`
    - `navigation_wrapper`
    - `domain_action`
  - optional `normalization`
    - `kind`
      - `wrapper`
      - `deprecated_alias`
    - exactly one target field depending on kind:
      - `normalizes_to_contract` for wrappers
      - `alias_of_command_id` for deprecated aliases
- For wrapper commands, `normalizes_to_contract` should stay narrow and contract-level, for example:
  - `route_target`
  - `open_subject`
  - potentially another future canonical primitive family
- It should NOT inline route payload shape, object kinds, or argument mapping rules into the command metadata. That would duplicate the route contract and turn the catalog into a second routing schema.
- Deprecated alias metadata should remain explicit and separate because it implies lifecycle/removal expectations that wrapper commands do not have.
- The wiring layer should stay mostly unchanged. It already keys off `ui_command_id` and handler location. The important addition is gate logic that can understand the normalization metadata, not a large wiring-schema expansion.

### Impacted docs
- Primary owners:
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Contracts_V0.md`
- Strongly implicated adjacent docs:
  - `Plans/Wiring_Matrix.schema.json`
  - `Plans/UI_Wiring_Rules.md`
  - `Plans/Progression_Gates.md`
  - `Plans/Crosswalk.md`

### Contradictions / gaps surfaced
- `Contracts_V0.md` still defines only a very thin `UICommand` envelope and has nowhere to express command-normalization metadata.
- `UI_Command_Catalog.md` currently carries command meaning in prose/tables only; it has no precise slot for wrapper-vs-alias classification.
- `Wiring_Matrix.schema.json` is intentionally lean, which is good, but it means verification must mostly derive normalization expectations from the catalog rather than from repeated row-local metadata.
- `GATE-010` does not yet name any normalization consistency checks, so even after the metadata exists there would still be a verification gap unless the gate is expanded.

### Candidate fixes to carry forward
- Add a minimal command-classification / normalization contract to the command-definition layer:
  - `command_kind`
  - optional `normalization { kind, normalizes_to_contract? | alias_of_command_id? }`
- Keep wrapper metadata contract-level and narrow:
  - point to the canonical primitive family
  - do not restate route payload structure there
- Keep wiring schema expansion minimal or zero if possible.
- Extend `GATE-010` to verify:
  - wrapper commands marked as normalizing to the same primitive do not diverge in handler semantics unexpectedly
  - deprecated aliases resolve to real canonical command IDs
  - normalization metadata is internally consistent with the command kind
- Use `Crosswalk.md` to make the owner split explicit:
  - command catalog / command contract owns normalization metadata
  - route contract owns route-target structure
  - wiring matrix owns UI element to command/handler binding only

### Do-not-forget details
- The catalog should describe what class of command this is, not become the full route schema.
- Wrapper normalization metadata is about canonical primitive family, not about serializing the exact route payload.
- If the wiring matrix starts storing full normalization blocks per row, it will duplicate the catalog and drift quickly.

## Research Progress - 2026-03-17 - Wording rule reinforcement

### Key rule
- Use deterministic wording in this research stream.
- Do not use hedge words such as `optional`, `maybe`, or similar softeners when describing canonical design direction.
- When a rule is established, state it directly.
- When a point is still unresolved, state that it is unresolved rather than softening the recommendation.

### Do-not-forget details
- This applies to future seam writeups and recommendation language.
- The ledger should preserve firm contract language instead of drifting into ambiguous wording.

## Research Progress - 2026-03-17 - `route_target` owner placement

### Targeted docs read
- `Plans/Contracts_V0.md`
- `Plans/Crosswalk.md`
- `Plans/storage-plan.md`
- `Plans/FinalGUISpec.md`
- `Plans/FileManager.md`
- `Plans/UI_Command_Catalog.md`

### Key findings
- `Contracts_V0.md` is the correct owner for the canonical route contract.
- `Crosswalk.md` is the correct owner for the primitive boundary declaration.
- `storage-plan.md` is a consumer of navigation identity, not the owner of it.
- `FinalGUISpec.md`, `FileManager.md`, and `UI_Command_Catalog.md` are also consumers. They should reference the route contract and the primitive boundary instead of restating them.
- The clean owner split is:
  - `Contracts_V0.md`
    - owns `route_target`
    - owns `OpenSubject`
    - keeps `OpenFile` as the path-based file-open contract reference point for UI command work
    - defines how `resume_url` relates to the canonical route contract
  - `Crosswalk.md`
    - declares a primitive boundary for route-target / subject-open navigation
    - states that command catalog metadata, shell docs, storage docs, and surface docs consume that primitive rather than owning it
  - `storage-plan.md`
    - owns persisted refs and projections that store navigation-related fields such as `resume_url`
    - does not define canonical route identity or target structure
- `resume_url` should be treated as a serialized transport of canonical route identity, not as the owner contract.
- `FileManager.md` should stay focused on path-based editor realization and should not become the owner of cross-surface identity navigation just because `OpenFile` is important there.

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
  - `Plans/Crosswalk.md`
- Strongly implicated adjacent docs:
  - `Plans/storage-plan.md`
  - `Plans/FileManager.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/UI_Command_Catalog.md`

### Contradictions / gaps surfaced
- `Crosswalk.md` still lacks a primitive entry for route-target / identity-native open behavior.
- `Contracts_V0.md` still has no `route_target` or `OpenSubject` contract even though several downstream docs are already depending on that concept.
- `storage-plan.md` currently carries `resume_url` fields in persisted records, which is correct for persistence, but there is still no owner doc that defines what `resume_url` serializes.
- `FileManager.md` still reads as if path-based `OpenFile` is the universal open/navigation primitive.

### Candidate fixes to carry forward
- Put the canonical `route_target` and `OpenSubject` contract in `Contracts_V0.md`.
- Add a new primitive boundary in `Crosswalk.md` for route-target / open-by-identity navigation.
- Keep `OpenFile` separate and narrow:
  - file-system path target
  - line/range targeting
  - editor realization
- Treat `resume_url` as a derived serialization of `route_target`, with decoding rules anchored back to `Contracts_V0.md`.
- Keep storage ownership narrow:
  - persistence of route-derived refs belongs in `storage-plan.md`
  - definition of canonical route identity does not

### Do-not-forget details
- The owner question is settled:
  - contracts own canonical route identity
  - crosswalk owns the primitive boundary
  - storage owns persisted refs
  - surface docs consume the primitive
- If `storage-plan.md` or `FileManager.md` starts defining canonical route identity, the same drift will reappear in a different place.

## Research Progress - 2026-03-17 - `route_target` vs `OpenSubject`

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/FileManager.md`
- `Plans/storage-plan.md`
- `Plans/assistant-chat-design.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/usage-feature.md`

### Key findings
- `route_target` and `OpenSubject` are related primitives with different jobs.
- `route_target` owns app-navigation intent:
  - destination surface
  - scope restoration
  - object identity needed to land on the correct view
  - inspector/detail focus when needed
- `OpenSubject` owns identity-native source opening:
  - resolve a canonical subject such as `doc:<document_id>` or `artifact:<artifact_id>`
  - choose the best openable realization
  - hand off to `OpenFile` or transient generated-source realization when appropriate
- `OpenSubject` is not the general cross-surface navigation contract.
- `route_target` is not the source-opening contract.
- The clean split is:
  - `route_target`
    - gets the user to the correct app surface, project/run/thread scope, object, and focus context
    - may reference `subject_id`, `object_kind/object_id`, `tab_id`, `inspector_target`, and related scope fields
  - `OpenSubject`
    - takes a canonical `subject_id`
    - resolves it to:
      - workspace-backed file/document open
      - transient `generated://<artifact_id>` source buffer
      - another subject-native preview/open path defined by the subject contract
    - does not own broad shell routing or panel selection
- `OpenFile` remains narrower still:
  - path-based editor/file open
  - line/range targeting
  - editor-group realization
- The preview/subject work in `storage-plan.md` already supports this split:
  - `preview_subject_id = doc:<document_id> | artifact:<artifact_id>`
  - transient `generated://<artifact_id>` source buffers are a realization detail, not the canonical identity
- `resume_url` sits on the `route_target` side, not the `OpenSubject` side, because it restores app navigation context rather than just opening a source artifact.

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
