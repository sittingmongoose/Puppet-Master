# Shard 013: Browser Program Central-Route Binding Addendum - 2026-09-01

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L8612-L8732

Source SHA256: `cddc39f6018cb3977d9b4e9548a521c5befbf8d24e634cced5730046cb3b622c`

---

## Browser Program Central-Route Binding Addendum - 2026-09-01

The central command/wiring closure now assigns the read-only `cmd.browser.program.inspect` request to exactly one future handler target: `handlers::browser_program::inspect`. This target belongs to `BrowserRuntimeService` and consumes the existing `browser_command_request|browser_command_result|browser_command_error|browser_command_availability|browser_command_disabled_reason` family from `Plans/section15_browser_program_contracts.schema.json`. It is a planned dispatch identity only: the command remains `handler_unavailable`, emits no new EventRecord, and receives no runtime, security, visual, performance, or native-Slint credit until an executable Rust handler and dispatcher evidence prove the route. No `AuthBrowserSession`, protected content, capture authority, page-evaluate authority, or mutation authority is added by inspection.

### SMPFS-156 - Browser Program Inspect Sole Future Handler

```yaml
plan_unit_id: SMPFS-156
unit_type: command_binding
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: cmd.browser.program.inspect has exactly one planned BrowserRuntimeService route, handlers::browser_program::inspect, over the existing owner-DRY Browser command contracts; the target is not native-handler proof and availability remains handler_unavailable until executable dispatcher evidence exists.
gui_related: true
gui_classification_reason: Browser program status and Technical Details can expose the bounded read-only inspection action and its exact disabled reason.
depends_on: [SMPFS-147, SMPFS-155]
unblocks: []
acceptance_criteria:
  - The central catalog and production-intent row name exactly handlers::browser_program::inspect and the existing exact request/result schema pointers.
  - Inspect is read-only, receipt/projection-only, and admits no Browser Program mutation or EventRecord.
  - Missing executable Rust dispatch keeps availability false with handler_unavailable and cannot be promoted by static or browser-concept evidence.
validation_surfaces: [Plans/section15_browser_program_contracts.schema.json, Plans/section15_browser_program_contract_fixtures.json, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
risk_class: browser_inspect_phantom_handler_or_authority_widening
reasoning_tier: high
context_scope: browser_program_inspect_central_binding
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: command_binding_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md:23-36, source_report:scratchpad/pm-integration-20260831/authority-repairs/server-gap-adjudication/production-wiring-manifest/production-wiring-exact-map.json#retained_egolite_canonical:cmd.browser.program.inspect]
negative_constraints:
  - Do not treat the handler target string as executable-handler, runtime, security, visual, or performance proof.
  - Do not expose protected authentication, capture, page evaluation, or mutation authority through inspect.
```

### SMPFS-154 - Browser Capability Digest And Human Step Projection Closure

```yaml
plan_unit_id: SMPFS-154
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  Browser Program publishes one pinned versioned capability-specific API digest and bounded on-demand help
  projection, while every executable segment emits one typed HumanStepProjection with a secret/path/raw-ID/code-free
  user_step_label and bounded human detail. One stable step identity and revision projects the exact same underlying
  user_step_label, detail, state, requested/effective state, and owner-receipt refs into Chat, Testing, Watch,
  ObservableWork, and the shared timeline. A surface may visually truncate with the full canonical value accessible,
  but it cannot rewrite, regenerate, relabel, or independently infer the projection. Human copy is never payload or
  authorization.
gui_related: true
gui_classification_reason: The shared human step label/detail is visible across five user surfaces.
depends_on: [SMPFS-147, SMPFS-148, PP-083]
unblocks: [SIR-023]
acceptance_criteria:
  - HBU-005 binds API version/hash, capability-profile hash, registry generation, compact byte budget, help ref, explicit on-demand load policy, and receipt hash.
  - HBU-013 projects one stable step ID/revision and byte-for-byte identical underlying user_step_label, detail, state, requested/effective state, and owner receipt refs across Chat, Testing, Watch, ObservableWork, and the shared timeline.
  - Labels and details are bounded, secret/path/raw-ID/code-free, and `authority_grant=false`.
  - A positive shared-projection fixture joins all five surfaces to one canonical HumanStepProjection and proves that visual truncation does not mutate the stored/projected value or detach its full-value affordance.
  - Negative fixtures reject any missing or duplicate surface, per-surface label/detail/state/receipt override, regenerated wording, stale or mismatched step ID/revision, missing owner receipt, unsafe copy, authority grant, or success wording unsupported by the owner receipt.
  - Missing or stale step identity, owner receipt, capability digest, or projection generation fails closed rather than inventing success text; reconnect/replay must re-project the owner record rather than synthesize a new label.
  - Schema/fixture and PM7 projection evidence remains static; browser/native/runtime behavior and visual fidelity require later execution.
validation_surfaces: [Plans/egolite_retained_requirement_contracts.schema.json, Plans/egolite_retained_requirement_contract_fixtures.json, authored T48 PM7 source, focused Egolite remediation validator, future five-surface exact-value/replay/human-copy projection matrix]
risk_class: capability_digest_or_human_step_projection_drift
reasoning_tier: high
context_scope: browser_digest_and_human_step_projection
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Prompt_Pipeline.md, Plans/Shared_Integration_Runtime.md, future Browser Runtime]
node_compile_hint: {mode: browser_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:HBU-005, source_ref:egolite-requirement:HBU-013]
preserved_exact_tokens: [capability-specific API digest, on-demand help, user_step_label, Chat, Testing, Watch, ObservableWork, timeline]
negative_constraints:
  - Do not let human copy carry code, secrets, raw IDs, paths, payload, or authority.
  - Do not shorten, paraphrase, regenerate, or infer a distinct underlying user_step_label on any consumer surface.
  - Do not claim cross-surface runtime projection from static source alone.
owner_hints: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md, Plans/assistant-chat-design.md, Plans/Automated_Testing_System.md]
```

### SMPFS-155 - Focus-Independent Continuation And Truthful Browser Fidelity Profiles

```yaml
plan_unit_id: SMPFS-155
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  A server-owned admitted Browser Program continues under the same fenced BrowserWorkspace, PageGeneration,
  controller lease, budgets, and permissions when Puppet Master is backgrounded or focus moves to another app,
  browser tab, or Puppet Master panel; protocol-driven input never depends on foreground OS mouse/keyboard focus.
  Focus, visibility, selection, and viewer attachment never confer, revoke, pause, cancel, or transfer mutation
  authority. Execution selects an explicit requested/effective fidelity profile: foreground_equivalent keeps the
  target actively composited without stealing focus and preserves visible-equivalent timing, timer, network-priority,
  and render-cadence behavior within declared budgets; real_background uses actual background visibility and
  intentionally preserves and labels platform/CEF timing and throttling. Each profile records measured evidence and
  exposes degradation or fallback truthfully. OS suspend, lock-screen restrictions, process termination, and device
  disconnection produce explicit interruption/recovery boundaries rather than invented continuation.
gui_related: true
gui_classification_reason: Continuation, requested/effective fidelity, and degradation are visible Browser/Testing state.
depends_on: [SMPFS-150, SMPFS-152, SIR-015]
unblocks: []
acceptance_criteria:
  - BRW-010 covers PM background, another app, another tab, and another panel with `continues_independently=true`, while controller generation fencing remains mandatory.
  - BRW-010 also proves `foreground_input_dependency=false`: protocol-driven work does not pause, cancel, transfer, or require synthetic input merely because foreground OS mouse/keyboard focus changed.
  - BRW-011 defines distinct, non-swappable foreground_equivalent and real_background profiles with exact profile identity plus explicit composition/visibility, timer-throttle, network-priority, render-cadence, measured-evidence, and degradation fields.
  - Focus loss never means cancellation or controller transfer; explicit owner command, lease loss, budget/policy denial, timeout, or terminal result is required.
  - A positive focus matrix moves focus through PM background, another app, another browser tab, and another PM panel while the same generation-fenced program continues; a separate timing fixture proves foreground_equivalent within its declared tolerance without stealing focus and records actual real_background throttling.
  - Negative fixtures reject focus-driven pause/cancel/lease transfer, foreground-input dependency, swapped profile identity/semantics, missing timing/throttle/render/network evidence, silent throttling, or foreground_equivalent labeling outside measured tolerance.
  - Unsupported foreground-equivalent behavior degrades explicitly or blocks; it is never inferred from foreground UI focus, and real_background evidence is never relabeled foreground_equivalent.
  - OS suspend, lock-screen restriction, process termination, or device disconnection emits an explicit interruption/recovery boundary and is not misreported as focus-independent continuity.
  - Static contracts do not prove background execution, timing fidelity, throttling behavior, CEF/platform behavior, or performance.
validation_surfaces: [Plans/egolite_retained_requirement_contracts.schema.json, Plans/egolite_retained_requirement_contract_fixtures.json, authored T48 PM7 source, future four-state focus-independence and foreground-equivalent/real-background timing-throttle evidence matrix]
risk_class: focus_cancellation_or_fidelity_misrepresentation
reasoning_tier: high
context_scope: browser_focus_and_fidelity_profiles
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, future Browser Runtime, future Testing evidence harness]
node_compile_hint: {mode: browser_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:BRW-010, source_ref:egolite-requirement:BRW-011]
preserved_exact_tokens: [foreground_equivalent, real_background, PM background, other app, other tab, other panel]
negative_constraints:
  - Do not use UI focus as execution ownership or mutation authority.
  - Do not depend on foreground OS mouse/keyboard focus or steal focus to claim continuation or fidelity.
  - Do not label a throttled or degraded run foreground-equivalent without measured evidence.
  - Do not claim continuity across an unrecorded suspend, lock, process-loss, or device-disconnection interval.
owner_hints: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md, Plans/Automated_Testing_System.md]
```
