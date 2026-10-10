# Independent critic assessment — A2-01-control

**Stage:** critic  
**Inputs:** the frozen brief, investigator discovery, draft, source map, source index, revealed plan, and plan-reveal record named by `input-map.json`.  
**Review boundary:** this is a critique of the investigator package, not a repaired proposal or product validation.

## Overall assessment

The investigator package is strong and unusually careful about provenance. It compares ODK Collect/Central and ArcGIS Survey123, screens Kobo as a further option, and uses CouchDB only as a synchronization analogy. It preserves the two named owner authorities and all negative constraints, differentiates retries from corrections, proposes durable identities, gives a bounded issue/commit/release example, and labels research separately from product operation. I found no material wrong factual claim in the primary evidence I independently checked. All local product behavior and pilot tests remain unrun, as the package says.

The main gap is obligation 1: the state proposal does not fully explain how device-only queue and uncertain-acknowledgment facts become visible to coordinators after reconnection. There are also two evidence boundaries to make sharper: the technical route for optional CSV import remains unresolved, and the Survey123 export comparison omits an Enterprise/ArcGIS Server limitation. These are incomplete coverage, not reasons to remove scope or reject the overall proposal.

## Findings

### C-01 — Material incomplete: coordinator visibility of offline and uncertain-delivery states

**Locators:** `draft.md`, “Proposed workflow and coordinator-visible states,” rows “Queued / offline,” “Sending / receipt unknown,” and “Received after offline queue / apparent late arrival” (around lines 60–63); “Identity, timestamps, photographs, duplicates” (around lines 78–80).  
**Evidence:** ODK’s Collect documentation describes Draft, Ready to send, and Sent as device-side states; it does not describe a coordinator seeing a pending or receipt-unknown state before the phone reconnects (critic source C01). ODK Central’s `createdAt` is the server receipt time and a duplicate `instanceId` returns 409, but neither records a client’s queue/offline interval by itself (C05). Survey123 likewise keeps unsent responses in the device’s Outbox until connectivity returns (C09).  
**Assessment:** The draft recognizes that there is “no server record yet” for local drafts/queued records, which is correct. It then says a coordinator view should mark a submission as queued offline or receipt unknown, without naming the durable event/field or interaction that supplies that fact after the phone reconnects. A server cannot show the phone’s current offline queue before it can communicate with that phone. The submission should be described as client-local until upload; after upload, a captured client queue/attempt event can support an “arrived after offline queue” label. Without that event, show reported observation time beside server receipt time and call the delay apparent; do not claim to know that the phone was offline or infer queue state from device time. The proposal needs that lifecycle boundary to fully answer the coordinator-visible part of obligation 1.

### C-02 — Material incomplete: CSV import remains a preserved option, but its technical path is not assessed across the candidate routes

**Locators:** `draft.md`, “Optional coordinator-reviewed legacy CSV import” and clause 5 disposition (around lines 41 and 85–90); product table’s Survey123 and Kobo rows (around lines 51–52).  
**Evidence:** The ODK REST create documentation covers XML submission creation, attachment follow-up, and duplicate-ID responses; its export endpoints establish CSV export, not a native CSV-to-submission path (C05). The Survey123 CSV documentation I checked describes using a local CSV to prepopulate form answers through `pulldata()`, not importing legacy rows as survey submissions (C17). The reviewed Kobo sources establish offline collection and correction behavior, not legacy-row import (C13–C14).  
**Assessment:** The draft correctly preserves the authorized option and explicitly avoids claiming a native importer. Its safety conditions for any adapter are useful. The evidence does not yet establish whether either product can safely ingest a legacy CSV, whether the data steward needs it in the pilot, or what adapter path is feasible. This is a technical research gap, not an evidence-based exclusion. Keep the option explicitly conditional/NOT_RUN until an actual supported route and the legacy file shape are known; do not silently turn the option into a required feature.

### C-03 — Material incomplete: Survey123 export qualification for Enterprise deployments

**Locators:** `draft.md`, Recommendation and Survey123 row of “Product and mechanism comparison” (around lines 13 and 51); source-map entry S12.  
**Evidence:** Survey123’s results documentation lists CSV, Excel, KML, shapefile, and file-geodatabase downloads, and notes coded choice names plus attachment-keyword handling. It also says surveys created from ArcGIS Server feature layers cannot be downloaded through the Survey123 website (critic source C12). The comparison separately names ArcGIS Online/Enterprise as candidate deployment contexts (C10–C12).  
**Assessment:** The export claims are broadly correct, but the deployment recommendation does not distinguish hosted feature layers from ArcGIS Server feature layers. That distinction can change the stated website export path for an Enterprise installation. Preserve the ArcGIS candidate, but qualify the export claim for this case and leave the exact route to be verified against the charity’s deployment type.

### C-04 — Minor locator/wording: ODK export locator in inherited source map

**Locator:** investigator `source-map.json`, S04 locator.  
**Evidence:** The ODK Central submissions page places the ZIP attachment-tree detail (`files/` folders keyed by submission `instanceId`) in the CSV export section around its page lines 224–235 (critic source C04). The inherited S04 locator lists the correct section heading but gives line ranges “around 175–200 and 313–330,” which do not pinpoint that export detail.  
**Assessment:** This is easy to repair and does not undermine the source identity: the exact URL and section title are present. Point the locator at the export passage so a reader can verify the table/repeat/attachment claim directly.

## Obligation coverage and exact-plan dispositions

| Obligation | Independent assessment |
|---|---|
| 1. Offline, retry, late arrival, correction states | Substantively addressed, with C-01 remaining on how local queue/uncertain-ack facts reach the coordinator. The distinction between transport retry and an explicit linked correction is clear. |
| 2. Two survey products and one analogy, deployment/export | Met with ODK, Survey123, and CouchDB. Kobo is an additional screened option. Add the Survey123 export qualification in C-03. |
| 3. Identity, form version, attachments, clock, duplicates | Met as a proposal: separate site/visit/submission/form/attachment identity, separate reported observation time and server receipt, and human duplicate investigation. Identity generation and attachment digest are recommendations, not product capabilities asserted as tested. |
| 4. Bounded failure/release history | Met. Issue #4589, commit `0bc6cde`, and Collect v2021.2.0 describe a narrow historical uncertain-ack/edit/retry case; the draft avoids claiming a current defect or exactly-once guarantee. I directly checked the issue, diff, and release listing (C06–C08). |
| 5. Optional coordinator-reviewed CSV import | Scope is preserved and not promoted to mandatory; no exclusion is made. Technical feasibility remains unresolved as C-02. |
| 6. Owner authority | Met. The field coordinator’s duplicate-investigation role and the steward’s current-view/side-by-side choice are retained explicitly; no automatic merge is authorized. |
| 7. Negative constraints | Met. No requirement to stay online, photo-location inference, personal-device setting changes, or remote deletion of originals appears in the proposal. |
| 8. Coherent proposal and validation boundary | Met. Sources, versions/conditions, decisions, open inputs, and a validation table are present. Documentation and release review are represented as research; product operation and proposed scenarios remain NOT_RUN. |

The revealed plan was fallible input, and the investigator treats it as a comparison target rather than authority. The clause-by-clause dispositions match the disclosed obligations. The package does not silently rebind S01–S16; the source IDs remain fixed to their original URLs.

## Evidence and execution status

I directly revisited the bounded source index and checked the primary pages listed as C01–C17 in this critic’s `source-map.json`, focusing on claims used in the recommendation, identity model, export comparison, correction conditions, optional-import boundary, and historical example. The exact URLs, version applicability, locators, observed retrieval, conditions, and applicability limits are recorded there. These reads were research only. I did not install or operate a product, use an account, run downloaded code, or test a workflow. Every proposed product validation remains NOT_RUN.

The investigator’s native Goal receipt at `draft.md` lines 120–122 is reported as directly observed by that stage. This critic can read the artifact but cannot inspect the prior stage’s Goal event, so that receipt and its numeric timestamps are not independently verified here. I treat them as the investigator’s reported provenance, not as evidence of product behavior or as a material defect.

## Critic native Goal activation record (pre-terminal)

Directly observed before substantive review: `create_goal` returned objective exactly as specified by the critic freeze, `ER12 critic stage, run A2-01-control: execute ER12_RUNTIME/runs/A2-01/control/stages/critic/assignment.md; preserve complete brief scope and save required outputs before completing this native Goal.`; `threadId=01a12410-3a85-7750-8fef-665d3f05c2e4`; initial `status=active`; `tokensUsed=0`; `timeUsedSeconds=0`; raw `createdAt=1791606450`; raw `updatedAt=1791606450`; `remainingTokens=null`; `completionBudgetReport=null`. A direct `get_goal` immediately after creation returned the same objective, thread ID, active status, and raw values. The numeric timestamps are preserved as returned; their timezone and further timestamp provenance are **UNKNOWN**. Terminal status is intentionally not asserted in this pre-terminal artifact.

## Conclusion

The draft is a credible, evidence-backed planning proposal and is substantially faithful to both the brief and the revealed plan. Address C-01 and C-03 in any later revision; keep C-02 openly conditional until its public evidence and legacy-data inputs support a technical decision. C-04 is a locator correction. This critique grants no authority to narrow the scope, decide the steward’s policy, or write a final proposal.
