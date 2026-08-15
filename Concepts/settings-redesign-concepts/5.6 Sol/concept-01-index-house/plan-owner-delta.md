# 5.6 Sol — Index House — Plan Owner Delta

> Concept-only impact analysis. No Plans, inventory, command catalog, wiring, or DRY owner was modified.

## Design contract

Stable-address archive of settings, provenance, memory, and delegated behavior.

## Manager-to-owner review

| Manager family | Probable canonical owners | Review required |
|---|---|---|
| Provider / Account / Model / Installation | `Plans/Models_System.md`<br>`Plans/Multi-Account.md`<br>`Plans/CLI_Bridged_Providers.md`<br>`Plans/Provider_OpenCode.md`<br>`Plans/BinaryLocator_Spec.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| Context & Instructions | `Plans/agent-rules-context.md`<br>`Plans/Prompt_Pipeline.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| Memory | `Plans/assistant-memory-subsystem.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| Personas | `Plans/Personas.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| Goal & Automation | `Plans/Goal_Runtime_System.md`<br>`Plans/Orchestrator_Page.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| Crew | `Plans/orchestrator-subagent-integration.md`<br>`Plans/Orchestrator_Page.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| Permissions & FileSafe | `Plans/Permissions_System.md`<br>`Plans/FileSafe.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| Back Seat Driver | `Plans/assistant-memory-subsystem.md`<br>`Plans/Goal_Runtime_System.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |

## Cross-cutting owner deltas

- `Plans/FinalGUISpec.md`: destination navigation, search, workspace/manager shell, responsive inspector behavior, accessibility, and semantic motion intent.
- `Plans/settings_inventory.json` and `Plans/settings_inventory.schema.json`: stable destination IDs and typed source/scope/exposure/requested/effective/availability/recovery fields.
- `Plans/UI_Command_Catalog.md`: census and adjudication of reuse, alias, supersession, conflict, and provisional candidates in `candidate-command-delta.json`.
- `Plans/Wiring_Matrix.production.json`: trace each enabled action through owner, validation, operation/receipt, projection, attribution, and recovery.
- DRY owner: adjudicate candidate semantic component families without erasing the four concepts’ distinct composition and motion systems.

## Required supersessions

- Replace the old Settings chip/bloom/no-sidebar interaction contract; assess `cmd.settings.bloom.open` only as a compatibility alias.
- Replace stale fixed right-panel wording with wide inspector, middle-width drawer, and squeezed inline evidence behavior.
- Do not reintroduce stale `regular/yolo` coupling or invalid inventory values.

## Boundaries

- Provider CLI installation remains explicit, official-source, ownership-aware, separately verified, and rollback-capable.
- CLI-owned OAuth remains provider-owned; PM-direct OAuth is used only where explicitly supported.
- Usage measurements remain owned by Usage; Settings shows only source-labelled readiness snapshots and handoff routes.
- Candidate command and component names are provisional; this concept mints no canon.

## Deferred insertion

No deferred manager family is claimed by this concept.

## Validation surface

- ConceptHub structural validator.
- State/architecture tests for manager assignment, provider installation boundaries, lifecycle conflict/rollback, all deterministic fixtures, and theme preview/revert.
- Browser review at 900, 1280, 1700, 2200, and 2500 px; reduced motion; all eight themes; narrow and squeezed height; deep-link/history/focus checks.

## 2026-08-13 correction authority

This delta is candidate-only and NOT_MINTED. It does not assert that any Plan owner, PlanUnit, command, wiring path, component, schema, or runtime is canonically available. Canonical owners and IDs require later census and adjudication.

- ObservableWork is the sole truthful work/progress/wait owner. A concept-local card, row, folio, checkpoint, or route is a projection/adapter only. Its candidate projection must carry operation ID, owner domain, scope/object refs, title, human phase/state, progress kind/source and trustworthy totals only, queue/wait reason, activity/heartbeat, cancel/background/retry, blocking scope, generation, and result/receipt refs.
- RuntimeResourceGovernor is the sole resource/admission owner. Settings requests policy and projects requested/effective state; it never schedules or adjudicates. Host enforcement uses the same contract rather than inventing another governor. Outcomes remain admitted, queued, admitted degraded, blocked permission, blocked resource, and cancelled.
- Provider lifecycle work must keep first acquisition, existing-installation selection, authentication, verification, update, repair, and rollback distinct. First acquisition requires explicit official-source consent for the exact Host/Environment. No provider CLI may be bundled, baseline-preseeded, or silently acquired by Project, model, provider, Goal, Plan, WorkNode, agent, Auto, or On. Authentication remains separate; only post-consent maintenance may follow policy.
- Settings Home/search carries compact metadata; only the selected manager hydrates. Generation currentness, byte-bounded caches, at most 40 mounted rows, 825+ setting and 100-installation fixtures, inactive unsubscribe/refcount release, non-persistence of transient input, and narrow frame-coalesced deltas are candidate requirements, not production claims.
- Manager completeness must include Media, accessibility/input/spellcheck, visible DRY states, app/content update insertion, Server, Product Onboarding, and Doctor. Deferred owner modules are insertion-only. No engine is invented here. The Server owner remains unresolved residual risk.
- Deterministic old-hardware/network/resource fixtures are projections only. Native Slint and actual Ivy Bridge, Xeon, CPU, RAM, disk, and network validation remain open gates. Required review may run in bounded waves but may not be omitted.
- No Playwright product/runtime/facade/compatibility/package/port/command/MCP/capture dependency or candidate ID is introduced. Browser checks are evidence only and do not certify native Slint.
