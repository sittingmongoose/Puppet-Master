# Independent critic review — reconnect-safe volunteer observation intake

## Stage record

- Run/stage: A2-01-treatment / critic.
- Reviewed the original brief, frozen investigator discovery and draft, investigator source map/index, and exact revealed plan from immutable handoff paths. Input-map byte gate passed at 2026-10-10T04:27:11.863Z: 7 complete members verified; manifest SHA-256 2a22c47356262d1ba2293fce7a789d1c18b2802b807ca883eda12b19bec1e440. The gate expressly does not prove comprehension or source truth.
- Native Goal create response fields observed directly: threadId 01a1240f-9ff9-7dc3-9521-cd08aa95104e; objective “ER11 critic stage, run A2-01-treatment: execute ER12_RUNTIME/runs/A2-01/treatment/stages/critic/assignment.md; preserve complete brief scope and save required outputs before completing this native Goal.”; status active; tokensUsed 0; timeUsedSeconds 0; createdAt 1791606392; updatedAt 1791606392. A later get_goal observation at 2026-10-10T04:29:16Z returned the same threadId/objective, status active, tokensUsed 108138, timeUsedSeconds 163, createdAt 1791606392, updatedAt 1791606556. Tool timestamps are preserved as raw integers; their units/ISO UTC conversion, provider/model provenance in the native Goal object, and terminal timestamp are UNKNOWN.
- Primary-source rechecks were read-only web.open/web.find operations against the full carried source index. No product was configured or operated, no account/device/server was used, no source code was run, and no proposed validation is reported as executed product validation. Per-request UTC timestamps are not exposed; the source map preserves original access times and separately records observed bounds for critic rechecks.

## Overall assessment

The draft is a coherent, evidence-backed proposal and substantially satisfies the full brief and released plan. It corrects the plan’s unsupported online-only, timestamp-identity, filename-identity, weekly-deduplication, and recent-release assumptions. It retains optional CSV scope without asserting product support; distinguishes ODK, Kobo, and the CouchDB analogue; preserves both owner authorities and all four binding negative constraints; and keeps product checks proposed or NOT_RUN. Its ODK failure-history example is bounded to the reported historical condition. The ODK/Kobo preference is conditional, not represented as validation.

Three issues merit retained-author disposition: a material gap in how the append-only correction rule is enforced across native edit paths, a material export/timezone omission for Kobo, and a minor overstatement of the no-GPS constraint. No material wrong claim or unsupported technical assertion was found in the reviewed scope. This critique is not a replacement proposal or authority to narrow scope.

## Findings

### CR-01 — Material incomplete: correction preservation across native edit paths

**Draft locators:** “Recommendation” paragraph beginning “Whichever product is selected”; “Proposed data and coordinator workflow,” states 6–7; ODK/Kobo rows in “Product and sync comparison”; “Validation table,” proposed correction path.

The draft correctly recommends a charity-owned append-only correction event and says product behavior must be checked. It does not fully resolve how that rule is preserved if users take the products’ native edit paths, which can change a submission rather than create the proposed charity-owned correction event with its own ID, reason, and before-image. This is central to the brief’s no-overwrite requirement, so the distinction should remain explicit as a deployment/configuration condition and pilot acceptance check.

Current ODK Collect documentation records that editing finalized or sent submissions is available starting in Collect v2025.2.0 / Central v2025.1.4, is off by default, requires the form’s client_editable setting, applies only while the submission remains on the device, uses the original form version, and creates activity-feed entries; manually sending multiple edits requires order. Central’s web edit creates a new submission version and activity, but the same documentation does not establish that the selected build exposes a retrievable original version in its UI. Kobo’s current editing page says raw edits bypass form logic, cannot be undone, and should be tracked in an external log; web edits can re-evaluate current logic and alter or remove values. These facts make a test of “original remains inspectable” useful but do not themselves specify the event identity, immutable before-image, or rule for preventing an in-place edit from becoming the correction of record.

**Evidence:** ODK [Managing Forms in Collect](https://docs.getodk.org/collect-forms/) (section “Editing finalized or sent forms,” lines 181–198); ODK [Managing Submissions in Central](https://docs.getodk.org/central-submissions/) (lines 303–317); Kobo [Editing and deleting your data](https://support.kobotoolbox.org/editing_deleting_data.html) (lines 10–11, 44–61, 122–131). These are current living docs, not tests of a chosen release.

### CR-02 — Material incomplete: Kobo XLS export can discard timezone information

**Draft locators:** Kobo row in “Product and sync comparison”; “Site, visit, form, attachment, time, and duplicate handling,” paragraph beginning “ODK explicitly warns”; final proposed version-pinned export/restore rehearsal.

The draft proposes preserving the volunteer-reported time and any known zone/offset, then recommends Kobo’s XLSX export for repeat-group data. The official export page calls this the XLS export (an .xlsx file), recommends it for repeat groups, and says only that format carries repeat groups in sheets while CSV omits them. It also warns that Excel date/time formats do not support timezone data: timezone information is removed during XLS export unless dates are exported as text. The proposal does not connect that condition to its required observation-time/offset field. If Kobo is selected and XLS is used for repeat data, the pilot/export plan should test the text-date setting or another representation that preserves the stated offset.

**Evidence:** Kobo [Exporting and downloading your data](https://support.kobotoolbox.org/export_download.html), lines 30–40, 67–74. This is a documentation-based gap, not an observed export failure.

### CR-03 — Minor locator/wording: distinguish a no-GPS proposal from the brief’s narrower constraint

**Draft locators:** “Conditions and local recommendation,” sentence “Do not require GPS/online access”; “Site, visit, form, attachment, time, and duplicate handling,” paragraph beginning “Do not infer precise location.”

The brief prohibits inferring precise location from photographs; it does not prohibit separately requested GPS or all location collection. Using a controlled site code without GPS is a reasonable privacy-minimization choice for this pilot, but the draft should identify it as a recommendation rather than expand the user’s binding negative constraint. No extra GPS collection is required by the brief either; this is a scope-labeling issue, not a request to add GPS.

**Evidence:** Original brief, obligation 7, bans photo-derived precise location but does not impose a general no-GPS requirement. The draft’s stated no-GPS wording is broader than that exact clause. Keep the scope distinction visible.

## Obligation-by-obligation and released-plan disposition audit

| Brief obligation / exact-plan topic | Assessment of investigator treatment |
|---|---|
| 1. Offline creation, retry, late arrival, explicit correction as separate coordinator-visible states | Strong treatment: seven states separate draft, queued, receipt, duplicate investigation, review, correction proposal, and steward decision. Same-payload retry is distinguished from a new visit and correction. CR-01 is the remaining correction-enforcement gap. |
| 2. Two usable survey products plus analogous synchronization mechanism, deployment and export tradeoffs | Satisfied conditionally: ODK and Kobo are compared; CouchDB is explicitly only an analogue. Hosting, review, export, repeats/media, and alternatives are addressed. CR-02 adds a material Kobo export condition. |
| 3. Site, visit, form version, attachment identity, clock uncertainty and duplicate detection | Strong proposed data model with explicit site/form/version, stable IDs, attachment identity, separate receipt time, uncertain client time, advisory duplicate matching, and human review. These are proposed charity fields/adapters, not misattributed product fields. CR-02 affects preservation of a known offset on export. |
| 4. Bounded failure/release-history example and applicability | Satisfied: ODK Collect #4589/#4655 and the v2021.2.4 forum report are tied to their historical poor-signal/rejected-submission conditions; the draft expressly disclaims a current 2026 regression. S21 is clearly a separate attachment-retention test-code example, not a reconnect test. |
| 5. Authorized optional coordinator-reviewed legacy CSV import | Satisfied and retained as optional. The draft distinguishes Kobo lookup CSV and experimental app-bundle recovery from arbitrary legacy-row import, records the duplicate-language inconsistency, and gives evidence-based intake/quarantine conditions. It does not silently exclude or make the option mandatory. |
| 6. Coordinator accepts duplicates for investigation; steward decides correction projection; no silent merge | Satisfied. It preserves both authorities, leaves the steward’s choice open, represents pending state, and rejects deterministic/latest-arrival winner as the business decision. |
| 7. Four explicit negative constraints | Satisfied for offline use, no photo-derived precise location, no personal-device setting changes, and no remote deletion of originals. CR-03 notes the additional no-GPS wording so it is not misrepresented as a user constraint. |
| 8. One evidence-backed proposal with source/version applicability, discoveries, owner inputs, and proposed/executed validation separated | Satisfied. Research review and the plan-release artifact are not called product validation; product operation is NOT_RUN and future scenarios remain Proposed. Owner inputs are explicit and publicly answerable questions were investigated. |

The released plan’s dispositions are generally supported: obligations 1 and 3 replace faulty assumptions; 2 completes the comparison without declaring an evidence-free winner; 4 replaces an unsupported “recent fix” assumption with a bounded historical case; 5 retains authorized optional scope; 6 preserves authority; 7 preserves its prohibitions; and 8 is represented as a complete proposal rather than as product validation. The findings above refine correction implementation, export conditions, and wording; they do not justify dropping any brief obligation or optional path.

## Discovery quality, alternatives, and validation separation

The brief-only discovery identifies ODK and Kobo independently and preserves CouchDB as a deliberately bounded analogue. The draft carries forward useful discoveries rather than treating product features as owner decisions: Central’s distinct system/user review states and missing-media warning; Kobo’s stable rootUuid and edit caveats; Kobo’s experimental recovery route with conflicting duplicate language; and CouchDB’s hidden deterministic winner. ODK remains a conditional lead and Kobo a usable alternative, with budget, data-location, support, data familiarity, photo policy, and CSV feasibility open to owners. The same-site/time fingerprint is advisory only.

The validation table is carefully split: source/documentation retrieval is research only; no product deployment, form submission, offline retry, correction, import, or export was executed. The listed device, clock, correction, CSV, and backup/export exercises remain proposed. This matches the brief. CR-02 should be carried into the proposed export validation if Kobo is selected; CR-01 should be carried into the correction acceptance check. No additional external owner decision is demanded by this critique.

## Critique disposition index

See critique-dispositions.json for the three unique issue IDs. The retained author supplies disposition, rationale, and final locator.

