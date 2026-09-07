# Assistant v3 feature-to-demonstration coverage matrix

Date: 2026-09-07. Tested source: `c99872170dab69b46d82f0d0f0abb1e8d408fc1f`.
Assistant raw SHA-256: `31b4d0d29516f5ae96a3b084bee9b8e1c3fdca0b8c8df707edad4dab180cebcc`.

## Verdict and denominator

The matrix/census is complete for the retained packet inputs: **236 original requirements + 245 correction-v4 requirements + 70 polish requirements = 551 distinct namespaced rows**, organized into the **67 feature/proof groups below**. Groups are navigation, not a claim that every clause within a group is proven. The original and correction ID sets were checked against `reports/REDESIGN_TRACEABILITY.json` and `reports/CORRECTION_V4_TRACEABILITY.json`; all original requirement statements also match. APR identities are checked against `REQUIREMENT_CLOSURE.csv`.

This is NOT a certificate that every feature already has two successful demonstrations. **APR-016 remains OPEN.** Two required workflows are specified per group below; the gallery column contains discovery candidates, not blanket acceptance. Process/native obligations remain in the denominator rather than being silently excluded. Native persistence, security/authority, provider execution, and recovery cannot be proven by HTML fixture state.

Actual execution on the pinned build:
- **127 gallery controls** clicked in a fresh Chromium page each: **127 observed landings, zero browser page errors**. No landing is counted as completed workflow proof.
- **37 additional concept outcome scenarios; 127 explicit assertions; all pass.** These are owner-API/registered-action subchecks, not substitutes for user-visible gallery demos. They directly touch 42 source rows but do not prove every clause of those rows.
- **315 registered extension actions** inventoried; an action is not automatically a separate feature or a registered native command.
- **31 History threads at initial boot**. Some demonstrations create further threads; earlier 35-thread totals are not carried forward as the boot denominator.
- Default independently swappable families remain selected. Orbit and Step Rail Simple are the only working variants in this scope. No protected working source was modified.
- APR-018 / exhaustive 60fps recording and every-frame review was NOT executed in this work.

`G001` means the first rendered `.demo-dialog .demo-trigger` on these exact bytes (1-based); control order is frozen by the source hash. Named labels and actions are emitted by the companion census script. Blank candidate cells mean no candidate was assigned, not proof that the feature is absent. A candidate may show only an entry or partial state. In particular, a Work note diagnostic demo is not a public transcript feature.

## Two-workflow matrix

Subchecks = additional executed concept cases, not full feature acceptance. A zero does not revoke prior accepted bounded repairs; it means no new complete outcome scenario for this group is certified by this work.

| Feature/proof group | Source rows | Required workflow A | Required workflow B | Gallery candidates | Subchecks |
|---|---:|---|---|---|---:|
| activity-bar | 2 | Read final transcript above floating bar | Verify transparent side/bottom gutters with mixed content | — | 0 |
| activity-hover | 3 | Select exact record from short preview | Dense bounded preview, no scroll or extra Open button | G024,G025 | 0 |
| activity-panels | 3 | Open selected record pinned left | Unpin, select another record, restore pinned default | G024,G025,G045,G046,G048 | 6 |
| assistant-layout | 17 | Pinned History and Activity coexist | Open document, resize, return to chat | — | 0 |
| assistant-memory | 2 | Inspect automatic capture | Preserve locked teaching during reconciliation | — | 0 |
| attachments | 14 | Add and preview exact file version | Retry failed attachment without losing siblings/text | G122,G123 | 0 |
| audit-process | 1 | Reproduce claim on final bytes | Test a counterexample without weakening criteria | — | 0 |
| authority | 8 | Compare source and generated outputs | Separate concept checks from runtime certification | — | 0 |
| brainstorm | 16 | Configure then cancel | Commit and inspect research roster; extend to debate/synthesis | G015 | 2 |
| browser | 9 | Send isolated screenshot | Add component instructions, then revalidate | G035,G111 | 0 |
| browser-currentness | 12 | Resolve original-generation element | Reject obsolete selection after rerender | G035 | 0 |
| bsd | 21 | Configure identity and stage bindings | Reconfirm held finding against newer generation | G010,G011,G087-G091 | 0 |
| build-as-goal | 15 | Build exact Plan as one bound Goal | Pause/cancel through Goal controls | — | 0 |
| chat_room | 6 | Configure then cancel | Commit roster; extend to discussion and explicit promotion | G014 | 2 |
| collaboration | 11 | Cancel detached draft | Commit workflow with attributable participants | G012,G014-G016,G048 | 0 |
| collaboration-options | 2 | Choose strategy with option help | Narrow modal with inset wrapping footer | G012,G014-G016 | 0 |
| collaboration-pickers | 2 | Select participant identity without changing primary | Cancel participant picker, then change primary route | G010,G012-G016 | 0 |
| commands-governance | 11 | Trace canonical command reuse | Validate derived currentness separately | — | 0 |
| composer | 12 | Switch threads with unsent content | Retarget without losing attachments | G102,G109,G120,G121 | 0 |
| concept-integration | 20 | Mixed transcript with default families | Step Rail Simple and refreshed surrounding panels | — | 0 |
| context-details | 2 | Inspect compact usage/BSD state | Expand provenance without duplicate BSD/side stripes | — | 0 |
| context-lens | 2 | Focus or mute selected region | Preview then apply/cancel Subcompact in flow | G017,G018,G092-G096 | 0 |
| contract-proof | 20 | Validate exact payload against owner | Reject stale/invalid data without success receipt | — | 0 |
| crew | 3 | Cancel detached Crew draft | Commit requested roster and inspect run | G012,G048 | 2 |
| crew-auto | 4 | Cancel policy draft | Commit policy without starting work | G013 | 2 |
| debug | 2 | Progress through investigation phases | Recover interruption and verify cleanup | G033,G034,G111 | 0 |
| deep-plan | 10 | Build Exhaustive Plan with scoped units | Promote BrainStorm result with lineage | G015,G084 | 0 |
| delivery | 2 | Extract and rebuild Assistant outputs | Rebuild generated Settings from source | — | 0 |
| demo-gallery | 2 | Full primary workflow outcome | Substantively different workflow of same feature | — | 0 |
| eli5 | 2 | Per-thread explanation override | Reset to default without altering work products | G030,G097 | 0 |
| folders | 8 | Bounded folder manifest/exclusions | Refuse over-limit expansion, preserve payload | — | 0 |
| goal | 15 | Pause/resume unfinished objective | Cancel with continuation fenced | G098-G100 | 0 |
| goal-replay | 12 | Resume from persisted owner state | Reject duplicate completion/continuation | — | 0 |
| goal-todos | 1 | Edit Goal without phase percentage | Complete leaves without conflating Goal lifecycle | G024,G098,G099 | 0 |
| history | 2 | Ordinary successful workflows | Explicitly labeled minority recovery examples | G101-G110 | 0 |
| internal-notes | 1 | Hide neutral-titled internal notes | Preserve typed public records with failure wording | G023 | 0 |
| modal-transaction | 18 | Edit/cancel with no durable effects | Commit once with duplicate admission refused | G012,G014-G016 | 0 |
| motion-evidence | 1 | Record full scenario at target cadence | Inspect all frame intervals with lineage | — | 0 |
| participant-outcomes | 24 | Complete required participants with attribution | Retry under new attempt and reject old callback | G045-G048 | 0 |
| plan-progress | 18 | Parallel steps without changing approved prose | Reject stale projection callback | — | 0 |
| plan-records | 12 | Stable tab and Rich/Markdown projection | Export with safe static embed fallbacks | G019,G020,G073,G080,G084 | 0 |
| plan-recovery | 10 | Pause/resume same unfinished PlanRun | Cancel and reject pending completion | — | 0 |
| plan-scheduling | 14 | Recurring window for one unfinished run | Revision invalidates exact-version schedule | G005,G006,G009 | 0 |
| plan-tabs | 2 | Open repeatedly, reuse tab | Invoke owner-backed control from tab | G019,G020 | 2 |
| provider-control | 12 | Account-specific route identity | Truthful constrained/unavailable capabilities | G124-G127 | 0 |
| question-budget | 20 | Typed nonfatal refusal at exact base | Late Grill +25 without resetting answers | G015,G063-G065 | 12 |
| reference-evidence | 1 | Consecutive reference-frame traversal | Larger representative keyframes | — | 0 |
| regular-plan | 18 | Approve/build and inspect To-Dos | Revise stopped Plan, retain prior version | G019,G066-G068 | 0 |
| reset-lifecycle | 2 | Reset delayed title generation | Each working reset owner executes once | G032,G043 | 0 |
| revert | 1 | Preview/apply eligible whole-turn revert | Refuse conflicting/ineligible revert | G031 | 0 |
| review | 14 | Configure/cancel | Remove to one, switch strategy without resurrection | G016 | 4 |
| scheduled-message | 19 | Edit pending message in place | Cancel and refuse registered dispatch | G003,G004,G007 | 1 |
| scheduling | 14 | Create/edit future dispatch | Cancel before delivery | G001-G009 | 0 |
| settings-build | 2 | Regenerate from immutable checkpoint | Verify preserved non-Settings scripts | — | 0 |
| settings-managers | 4 | Section navigation retains opened manager | Aligned narrow controls across full registry | — | 0 |
| settings-persistence | 1 | Save/reload project-bound values | Reject stale/failed writes without false saved state | — | 0 |
| spellcheck | 2 | Correct ordinary prose | Leave code/paths/identifiers untouched | — | 0 |
| teach | 1 | Capture explicit teaching | Correct by supersession | — | 0 |
| teacher | 1 | Explain a PM control | Explain a workflow using Teacher Persona | — | 0 |
| title-spellcheck | 7 | Manual rename races pending generated title | Passive prose correction with identifier exclusions | G032 | 0 |
| todo-graph | 16 | Explicit retain/rebind graph replacement | Reject cycle, preserve old graph | G024,G036,G037 | 0 |
| todos | 15 | Complete independent leaves out of order | Refuse bulk/provider completion | G024,G036,G037 | 2 |
| transcript-records | 5 | Open actual file/hunk | Open typed Artifact without title-based inference | G021,G022,G025,G124 | 0 |
| wand | 1 | Product submenu navigation/dismissal | Demo launch occurs only in Gallery | — | 0 |
| wonderer | 9 | Keep adjacent lead a hypothesis | Research and resolve before synthesis | — | 0 |
| wonderer-convergence | 8 | Separate unexplored lead from agreed decisions | Deliberate include/exclude after research | — | 0 |
| working-activity | 4 | Default Orbit sequence | Step Rail Simple without duplicate resets | G026,G027,G038-G044,G049-G062 | 0 |

The two additional passing cases not assigned as primary group counts above are `plan-build-ap-index` (Build/idempotency/Cancel) and `schedule-stop` (manual-stop precedence). Cross-requirement mappings remain explicit in the detailed evidence rather than inflating group totals.

## Detailed-source and evidence custody

The companion delivery contains the complete `SOURCE_REQUIREMENTS.json`, 551-row JSON/CSV requirement matrix with original wording and acceptance fields, 67-row JSON/CSV feature matrix, searchable review HTML, all 127 gallery observations/screenshots, registered-action source locations, and the 37 outcome cases with actual assertions. It also preserves the first harness pilot and explains the corrected harness assumptions; pilot failures are not relabeled product failures or counted as final passes.

Exact companion hashes:
- source requirement freeze: `467d9411e1a248ab0f3ebdd6cc3c6b5227091833e7b892b7ab79b9f7f5ed02d4`
- detailed requirement CSV: `7948e105c5468dbcdf902d4aa3246791cf17ba6877acb3835c162a601510643e`
- feature CSV: `6c69429e66395c0f45255516fc25e8a60ff236e9109b3070d640c63dfae0004f`

Original source IDs are not replaced by category summaries. The complete source freeze preserves source fields, while current canonical owner docs and later user corrections resolve meaning. APR-039's historical public Work note presentation is narrowed by APR-056/069; no public note card is reintroduced. Static `PM56_FEATURE_MANIFEST` and historical test totals are not current denominator or execution evidence.

## Remaining acceptance

A complete census reveals missing proof; it does not manufacture it. No group is certified for its entire two-demo requirement by this matrix alone. Implement/verify both meaningful workflows for each applicable feature, map actual outcomes to every retained clause, and keep native-only proof separate. Names, titles, fixture launches, a passing API assertion, or two different documents opening in the same way are insufficient on their own. APR-016 stays OPEN until this evidence exists. APR-018 remains a separate unexecuted campaign.

This audit artifact does not change product semantics, command registrations, Settings persistence authority, or native readiness. Authorized PlanUnit/governance currentness results are in `currentness-20260907/RESULT.json` and do not close demo acceptance.
