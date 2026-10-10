# Independent critic review — community workshop printable-project handoff

**Run/stage:** A7-01-treatment / critic-finalizer  
**Review basis:** immutable brief and revealed plan, complete investigator discovery/draft/source map and carried source notes; independent read-only rechecks of the governing primary pages recorded under `sources/`. Source IDs S01-S15 retain the carried identity and URL; S16-S17 add direct primary evidence.  
**Review date:** 2026-10-10 UTC.

## Overall assessment

The investigator draft is substantially complete and preserves the pilot boundary, the three assigned owner roles, all negative constraints, the optional preview/note authorization, and the distinction between research and product validation. Its default 3MF proposal is defensible for a small review pilot if it remains a tested receiver matrix, not a universal-fidelity claim. The STEP route is useful but should carry a sharper, version-aware warning because a recent issue comment reports another beta reproduction. The Cura position history needs correction: issue #19456 was closed after the reporter said the specific sample worked in Cura 5.10.0. The current Cura alpha release notes also identify a later multi-model positioning improvement. The draft should incorporate these timelines and keep tests pinned to the exact operation and version.

The Core v1.4 naming convention and a version-pair condition in the optional materials extension also merit explicit treatment. The latter is an honestly unresolved documentation condition; it should not be resolved by inference or converted into mandatory extension scope.

## Obligation-by-obligation review

| Brief obligation | Draft locator and assessment | Independent disposition |
| --- | --- | --- |
| 1. Two CAD-to-slicer routes plus an analogous portable package | Sections 2 and 5 compare CAD→3MF, CAD→STEP and Cura UCP. The route choices are useful and appropriately conditional. Section 2 currently puts Cura UCP and a generic ZIP in one row even though they differ: UCP carries Cura project models/settings and behavior, while ZIP is only an outer file bundle. | Accept the route set, amend the comparison into separate UCP and generic ZIP entries. Keep STEP as a conditional second route and STL as a limited fallback only. |
| 2. Units, objects/assembly, materials and application settings | Section 3 explains Core units/components/material labels, the STEP triangulation boundary, and the difference between design intent and slicer settings. It correctly assigns machine settings to the technician. | Accept with a precision addition: Core v1.4 recommends purpose suffixes that distinguish a neutral model from a full project; note the exact extension pairing uncertainty for M&P. |
| 3. Optional preview/metadata/extensions | Section 4 correctly retains the optional preview and human-readable note, recommends a sidecar fallback, and avoids universal-preservation claims. Section 3 warns that extension support varies. | Accept, amend with the Core v1.4 naming recommendation and the published M&P/Core version-pair question. Do not promote optional fields or extensions to mandatory scope. |
| 4. Released importer/exporter issue or compatibility change | Section 5 has useful Cura and Prusa history. The S12 account is materially stale: its timeline shows a March 2025 report that the S12 example worked in Cura 5.10.0 and the issue was closed completed. Its retained labels do not override that activity outcome. S06 also received a later, unpinned 2026 Flathub-beta report. | Amend both histories with their exact scope and reporter status. Keep all issue evidence as reported behavior rather than reproduced behavior. |
| 5. Authorized optional package preview and note | Sections 1, 4, 6 preserve the option as authorized, optional and not technically universal; no evidence-based exclusion is asserted. | Accept. Keep the thumbnail/Description conditional on producer and receiver, with an optional sidecar image/note fallback. |
| 6. Owner decisions | Section 6 preserves author, technician and lead roles and identifies the project/matrix inputs still missing. | Accept. Do not reopen authority assignments: exact per-project values, receiver versions/modes, acceptance thresholds and later printer setup remain distinct inputs. |
| 7. Negative constraints | Sections 1, 3, 6 and 7 reject printer operation, safety-critical scope, STL-completeness assumptions and universal approval of saved settings. | Accept and repeat all four constraints in the final proposal and validation record. |
| 8. Coherent proposal, evidence, unresolved inputs, validation status | Draft is coherent, gives source applicability and owner inputs, and separates research from unrun product checks. It includes a full plan-clause disposition table. | Accept structure and content, but correct the material histories/conditions below. Preserve every proposed check as proposed. |

## Indexed criticisms

### C01 — material wrong: Cura issue #19456 outcome

- **Draft locator:** Section 5, “Cura issue #19456”; related claim in the current-version paragraph and source-map S12.
- **Finding:** The draft says the issue has duplicate/under-investigation labels and “no linked resolution,” then treats the position problem as lacking a reported later repair. The live issue activity shows the reporter wrote on 2025-03-26 that saving and loading the same file worked correctly in Cura 5.10.0 and then closed the issue completed. The page still displays old labels, but the activity outcome must be included. The same issue thread separately says Open Project and Import Models behave differently, so the resolution is bounded to the reported sample and operation. No branch or PR is linked, so do not invent an implementation cause.
- **Evidence:** S12, description and activity at lines 148-190 and 295-421; especially the 5.10.0 report and completed closure. S11 release behavior distinguishes project loading from Import Models.
- **Classification:** material wrong.
- **Requested treatment:** Correct the chronology; describe the 5.10.0 result as a reporter-confirmed outcome, not independently reproduced behavior or universal compatibility.

### C02 — material incomplete: later Cura position improvement

- **Draft locator:** Section 5 Cura history and the stable/prerelease paragraph citing S14.
- **Finding:** The official Cura 5.14.0-alpha.0 release page says it improves positioning when loading multiple models from a non-project 3MF. The draft notes the alpha exists but omits this directly relevant change. The tag is pre-release, and the note does not state that it fixes the exact S12 project/import report.
- **Evidence:** S17 release tag/commit and its non-project 3MF positioning note; S14 release list says 5.14.0-alpha.0 is pre-release and 5.13.0 is the latest stable entry.
- **Classification:** material incomplete.
- **Requested treatment:** Record it as a pre-release test lead, keep 5.13.0 as the version snapshot at access, and do not claim the alpha or its note resolves S12.

### C03 — material incomplete: recent Prusa STEP report

- **Draft locator:** Section 5 “PrusaSlicer STEP history,” the current-version applicability paragraph, and source-map S06.
- **Finding:** The draft characterizes #8998 only as an early 2.5.0 report and says it is not evidence of later releases. The same issue now has a 2026-09-18 comment that the same Owl STEP case reproduced using the then-installed Flathub beta, a fresh MK3S profile and default STEP settings. The exact build is not named. This does not establish behavior in stable 2.9.6; it is still a material later observation for choosing STEP tests and correctly framing uncertainty.
- **Evidence:** S06, original 2.5.0 report and Sep 18 2026 comment at lines 151-188 and 395-447. The issue page currently has no linked branch/PR.
- **Classification:** material incomplete.
- **Requested treatment:** Add the later beta report with its unknown version, preserve that it is a user report not reproduced here, and require STEP shape sentinels on the actual selected stable receiver.

### C04 — material incomplete: Core v1.4 file-purpose suffixes

- **Draft locator:** Section 2 default artifact naming (“project.3mf”) and section 4's distinction between a neutral model package and a slicer project.
- **Finding:** Core v1.4.0 recommends double extensions: `.model.3mf` for design models and `.project.3mf` for complete projects with models/settings/metadata, with other suffixes for build/toolpath/slice data. The draft explains the conceptual difference but misses the standard's new, useful naming opportunity. This is recommended, not mandatory, and the receiving apps still need a filename acceptance check.
- **Evidence:** S01, Core 1.4.0 sections 2.2.1-2.2.2.
- **Classification:** material incomplete.
- **Requested treatment:** Recommend a purpose-bearing `.model.3mf` for the neutral geometry handoff and reserve `.project.3mf` for a full app project when receivers accept the suffix; retain `.3mf` compatibility if required by tested tools.

### C05 — honestly unresolved external input: M&P extension/Core pairing

- **Draft locator:** Section 3, “Materials and application-specific settings,” and source-map S09.
- **Finding:** The official index lists Core 1.4.0 and Materials and Properties 1.2.1 as published, describing the extension as full-color/multi-material. The extension's own v1.2.1 preface says the extension must be used only with Core 1.2. These official pages leave a version-pair question that the index alone does not resolve. The draft correctly says to check receiver support but does not identify this specification condition. No inference should broaden the extension's claimed applicability.
- **Evidence:** S09 current specification table; S16 version 1.2.1 preface and a-la-carte scope.
- **Classification:** honestly unresolved external input.
- **Requested treatment:** Keep rich M&P optional and out of the pilot baseline. State that the Core/extension pairing must be resolved from current authoritative specification guidance before claiming support; use Core base-material labels for intent meanwhile.

### C06 — material incomplete: distinguish the project mechanism from a ZIP wrapper

- **Draft locator:** Section 2 option C table row, “Cura Universal Cura Project (UCP) or a project ZIP with note/preview.”
- **Finding:** Both are useful but are not one mechanism. UCP is a Cura-specific project containing models and settings; an outer ZIP is only a wrapper for the selected geometry, preview and README and has no standard 3D semantics. Grouping them weakens the required tradeoff comparison.
- **Evidence:** S11 UCP content/behavior; S01 OPC 3MF parts; the draft's own description of a generic archive does not establish slicer interoperability.
- **Classification:** material incomplete.
- **Requested treatment:** Give UCP its own analogous-project row. Describe a simple ZIP separately as optional reviewer packaging, with an explicit warning that its members must be opened individually.

## Supported points and alternatives to preserve

- The default recommendation of neutral 3MF geometry is supported for this pilot, provided the exact exporter/receiver/mode is tested and the note supplies expected dimensions, named parts and relationships.
- STEP remains a useful CAD-to-slicer alternative when the selected receiver documents import; the import triangulates geometry in PrusaSlicer and has versioned issue history. The 2026 beta report is unpinned; keep it a risk signal, not proof about stable 2.9.6.
- Cura UCP is a useful app-specific portable-project analogy, with the documented saved-position/project-load distinction and settings-reset caveat. Its “different printers” claim does not approve those settings for workshop machines.
- STL is a restricted geometry fallback with units and intent supplied separately; it is not a complete project record. A neutral mesh does not carry native CAD history/associativity.
- The preview image and human-readable note are explicitly authorized optional scope. Keep them when supported, provide a sidecar fallback when a receiver hides them, and do not treat either as geometry validation.
- Core base-material labels express portable design intent. The author owns intended units and materials; the technician owns printer settings; the pilot lead selects a tested receiving matrix.

## Validation review

**Actually observed:** read-only retrieval of the official docs, specs, release records and issue histories listed under `sources/`; a manual frozen-byte digest check of the 26 paths named in the critic input map passed. These actions validate the source review and handoff bytes only.

**Not executed:** the `check-input` command is not installed/on PATH (`command not found`); therefore the official intake gate/overlay did not run. No downloaded code was run. The `freeze-review` and `seal-final` commands have not yet been attempted at critique-save time. No CAD export, app install, 3MF archive inspection, slicer import, geometry/bounds check, print or product validation was run. All such product checks remain proposed.

**Uncertainty retained:** selected exporter and receiver builds/modes, project-specific values, pilot thresholds, whether optional metadata is visible/preserved, and the M&P/Core version pairing need owner or authoritative resolution. The actual version in the Sep 2026 Flathub-beta STEP report is unknown.
