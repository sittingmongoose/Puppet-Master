# C017 R006: current-only assessment

Verdict: **quality failure**. Assessment coverage is complete; candidate correctness is not. All 312 report lines, all 896 admitted source lines, the full brief/plan and all six prospective facets were reviewed. No history, acquisition logs, mappings, other grades, method cards or external/economic sources were opened.

Report SHA-256: `2d44a26eb3c99f67f8a891a753a5085d0e70e33d55b7bfd557680a5d7c9d26fb`.
Admitted S003 SHA-256: `5d8b240877ed2cf9596566187bcb3779ea011d5319807134c65e2e7dc2ae82de`.

241 substantive-line rows and 620 exact sentence/semicolon segments are inventoried in the companion JSON. Each row has an exact report locator, admitted evidence and decision. Composite adverse assertions have separate atomic decisions below. `unreviewed_scope` is empty.

## Prospective facets

| Facet | Coverage | Decision |
|---|---|---|
| OME05-C01 Versioned metadata admission | full | Version/namespace distinction and hierarchy consistency are explicit; compatibility failures are explained rather than silently reinterpreted. |
| OME05-C02 Axis-to-array identity | partial | Rank/order/unique names/dimension_names and absent-axis controls are covered. Explicit absent-dimension versus length-one dimension navigation behavior is not specified. |
| OME05-C03 Declared pyramid selection | full | Group-relative declared paths, largest-first order, per-level transforms and missing-level handling are covered. Reader selection heuristics remain proposals. |
| OME05-C04 Composed coordinate calibration | partial | Sequential dataset then multiscales transforms, scale before translation and unknown/relative calibration are covered. There is no concrete numeric check combining offsets and group transforms that exposes reversed composition. |
| OME05-C05 Associated label discovery and registration | full | Declared labels paths including intermediates, equal level count, relative source.image/default resolution and mismatch flagging plus geometry-risk warning/fallback are explicit. No equal-shape shortcut establishes registration; supported overlay geometry remains a capability policy. |
| OME05-C06 Categorical label identity | partial | Integer dtypes and label-value keyed metadata are stated; neither report specifies exact uint64/int64 identity preservation or an exact supported range, nor categorical resampling that avoids creating IDs. Palette SHOULD is correctly not a universal styling MUST. |

## Atomic failures and qualifications

Supported portions of a composite claim remain supported; a qualification row does not declare the whole paragraph false. Product suggestions are evaluated as suggestions, and unexecuted tests are not invented execution results.

- **R006-E01: qualified**, report lines 55. No explicit disallow list appears in the capture, so all features have wide unqualified allowance. The general storage allowance is broad, but explicit OME restrictions exist (label integer types and multiscales transforms/dimensions). No global standalone list does not establish absence of restrictions. Evidence: S003:68-72, S003:301-312, S003:438-439.
- **R006-E02: qualified**, report lines 70, 270. All plate/well/image-label version fields have mandatory presence. The values are required to be strings if provided. Presence differs: plate.version MUST, well.version SHOULD, image-label/version SHOULD. The report elsewhere preserves the conditions correctly, so read the shorthand conditionally. Evidence: S003:550-551, S003:751-752, S003:456-460.
- **R006-E03: qualified**, report lines 88. The selection pseudocode is certainly informative. The capture does not visibly label this passage example/note. Permissive named choice is supported; definitive exemption classification is stronger than the admitted representation proves. Evidence: S003:388-397, S003:868-888.
- **R006-E04: qualified**, report lines 118, 129, 288. Format conformance or the thin brief mandates a plate grid, acquisitions filter and empty-group pruning in the viewer. These are useful proposed UX policies. Writer empty-group SHOULD-NOT rules do not require reader pruning or a particular presentation; discovery and truthful unsupported handling can use other UI designs. Evidence: S003:128-129, S003:518-560, S003:744-752, Viewer.md:5.
- **R006-E05: qualified**, report lines 146. The collection MAY rules are the only navigation-behavior norms. S003 supplies additional multiscale-entry selection prose and normative metadata/transform inputs. No numeric pan/zoom or latency algorithm is specified, which is the useful scoped conclusion. Evidence: S003:271-275, S003:388-397, S003:304-316.
- **R006-E06: contradicted**, report lines 159. There are 25 space units. The admitted line enumerates 26 space strings. This was independently counted from the frozen bytes. Evidence: S003:171.
- **R006-E07: contradicted**, report lines 159. There are 19 time units. The admitted line enumerates 23 time strings. This was independently counted from the frozen bytes. Evidence: S003:172.
- **R006-E08: qualified**, report lines 161. MAY-custom-type logic permits custom units, and missing axis types are unconditionally conforming. Custom types and units are separate fields. Non-listed unit strings are not prohibited because vocabulary is SHOULD, not because type has MAY. General recommended type presence does not erase required two/three space entries and ordering. Evidence: S003:169-170, S003:301-302.
- **R006-E09: qualified**, report lines 171, 262. Multiscales path-encoded vectors are unresolved as format permission. Generic transforms allow path representation and multiscales explicitly uses that specification while narrowing type/order/count. Reader support remains a product choice; treating permission as unknown needlessly narrows known source capability. Evidence: S003:284-289, S003:309-315.
- **R006-E10: qualified**, report lines 194. A three-space-axis structure by itself establishes which named axis is the plane selector. Axis count and order define structure. Arbitrary axis names and spatial types do not universally identify a stack axis or guarantee a named z axis. A documented capability/fallback policy is still needed, as report also recognizes. Evidence: S003:81, S003:301-303.
- **R006-E11: qualified**, report lines 204, 205, 266. The specified initial window rendering must apply start/end within min/max. All four window keys are required, but the operational mapping and bound checks are not established by this capture. The report explicitly acknowledges undefined math; this implication should be labeled a viewer policy awaiting evidence, not reproduced normative force. Evidence: S003:426-430, S003:411-415.
- **R006-E12: qualified**, report lines 225, 226. Same label/source level count makes index-i pairing sufficient or normative registration. Parity is required, but independent geometry still requires validation. The report usefully warns on transform mismatch and offers viewing without overlay; index pairing is a policy, not a proof of equal geometry. Evidence: S003:304-315, S003:432-455.
- **R006-E13: contradicted**, report lines 274, 279, 280. None of the assigned scope is omitted and no unsupported factual claims are made. The two unit counts are false, and singleton distinction, offset-sensitive numeric transform checking and exact categorical precision/resampling coverage are omitted. Generic heading coverage does not establish complete facets. Evidence: S003:171-172, S003:293-315, S003:438-474.
- **R006-E14: qualified**, report lines 282. Every finding preserves all normative force and source fit. Most enumerated tokens/rules are preserved. E01-E12 identify specific force, reasoning and numeric qualification defects; this self-certification is too broad. Evidence: S003:169-170, S003:301-315, S003:868-888.

## Scope and coherence

One combined report covers both brief groups with consistent numbering and a coherent high-level dependency flow. A few declared policy choices and unresolved items conflict with blanket force/completeness claims.

The capture supports useful collection/HCS discovery, optional omero validation and JSON/read-only synthesis beyond the non-exhaustive six-facet key. Actual implementation behavior and performance remain unobserved. Missing external evidence is an evidence limit, not a false factual claim or an invented added denominator.

Current report bytes expose grouping, control/treatment/task-card labels and budget/process/accounting cues. These were unavoidable current-deliverable content, recorded without consulting mappings/economics/history or inferring a comparative efficiency result.

The requested evaluator identity is GPT-6.1 Sol Extra High with a fresh non-inherited context. Effective model/reasoning introspection is not exposed; no recursive helpers were used.

## Inventory

The companion JSON is the complete exact-text material inventory, not a sample. Source outcomes and product-policy qualifiers are attached to every substantive line; repeated claims are retained with all locators. Empty/heading/carrier lines are separately accounted. The full report hashes and all admitted manifest hashes match.
