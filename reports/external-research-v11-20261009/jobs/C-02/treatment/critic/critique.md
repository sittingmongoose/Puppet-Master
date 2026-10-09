# H02 — C-02/treatment/critic

**Review status:** Complete independent critique of the assigned treatment/research draft. This is an evaluation, not a repaired candidate draft, product decision, procurement result, software test, or legal applicability opinion. I read the H02 brief, exact revealed plan, complete assigned predecessor draft/discovery/source map and all declared source notes. I did not read campaign, history, evaluator, counterpart, or other-arm material. Public primary-source checks are recorded in [source-map.json](source-map.json) and [sources/index.md](sources/index.md).

## Overall assessment

The draft is careful and useful as a bounded pilot proposal. It preserves the brief’s undecided governance and buyer-channel choices, does not announce a product winner, separates local queue/sync state from operational status, treats the FDA/NSSP material as conditional on Authority review, and marks all product/field validations as proposed. The public evidence checks support the central ODK, AppSheet, GS1, and NSSP descriptions. The older ODK issue-to-release chain is appropriately used as evidence about error feedback, not proof of reliable upload or current defect.

The main revisions I would ask of a reviser are about classification and scope, not reversing the product conclusion:

1. **P4 should not be classified as an uncertain plan requirement.** The plan clearly requires multilingual labels and glove-usable shed controls. What remains uncertain is the actual language set, device and environmental conditions, and acceptance criteria. Keep the obligation and label its implementation/validation details unresolved.
2. **P1 combines necessary workflow detail with optional design choices.** Stable lot identification, queued-versus-server-received state, and visibility of bed/window/capacity links are reasonable corrections to make the stated traceability operable. Specific preallocated ID ranges, mandatory separate event IDs, split/merge lineage for operations the pilot may not perform, and an Authority-approved tag integration are proposed mechanisms or conditional safeguards, not all omissions in P1. Separate core corrections from optional or conditional items.
3. **P2 correctly requires recoverable correction history, but backups, digital retention, restore ownership, and audit-file architecture are additional operational decisions.** They are valuable pilot/procurement questions, not all corrections to the exact plan clause. Do not make a particular append-only architecture or review step a product requirement if another tested approach preserves the prior value and who changed it.
4. **The ODK correction caveat should be more explicit.** Collect-based edits apply the form version active when the original submission was filled; they are only available for submissions still on the device, and later Central edits disable Collect-side editing for that submission. A form update that disables editing does not necessarily disable it for already-filled submissions. Add these cases to the version and authorization validation rather than relying on a generic “version check.” [R01]

These adjustments preserve the draft’s no-winner, no-legal-conclusion position. No material false factual assertion was found in the claims sampled against current public primary sources. No runtime, cost quote, legal review, or usability check was executed; none should be implied.

## Material findings

### M1 — P4 disposition conflates a stated requirement with unresolved acceptance criteria

The draft marks P4 “Uncertain,” then correctly says to keep both multilingual and glove-use requirements. That label is inaccurate for the exact plan clause. The brief says several crew members speak different first languages and a shared touchscreen is used with gloves; the revealed plan expressly says to provide multilingual labels and glove-usable shed controls for the initial pilot. The requirement is therefore already covered and should remain a pilot obligation. What is uncertain is which languages, device, gloves, wet/glare/temperature conditions, and measurable pass thresholds apply. The draft’s proposed native-speaker and realistic glove testing is appropriate, but the farm/crew should set acceptance criteria before testing.

**Critic disposition:** Reclassify as **already-covered; acceptance criteria uncertain**. Do not weaken or defer the user-visible requirement because no test threshold has yet been chosen. Do not claim that translated XLSForms establish glove usability. ODK’s language guide supports translated labels, hints and validation messages, warns that blank translations remain blank, separates form and app-interface language, and recommends native-speaker testing; it does not establish glove performance. [R04]

### M2 — P1 is right to identify omissions but overstates several as required corrections

P1’s end-to-end lot tracking is in the plan. It is reasonable to make the missing links concrete: farm lot identity must survive offline entry and shed receipt; the interface must distinguish a local finalized/queued form from a server-received submission; and the workflow should expose bed assignment, pickup window, and the active shed’s capacity. Those details are directly connected to the brief’s reliability and management needs. ODK’s docs confirm that finalized offline forms appear in Ready to send and that a successful upload changes the device form to Sent; its Entity docs also describe last-received updates and visible parallel-update/conflict states. They do not validate this farm’s ID policy or operational model. [R01][R02]

The P1 correction paragraph then treats multiple choices as though each is required by the clause: issuing non-overlapping human-readable ranges, distinct event IDs, full split/merge lineage, and an Authority-approved-tag link. These may be sensible options or conditional tests, but the plan does not require a particular ID-generation scheme, an explicit event identifier separate from the underlying record key, or lot splitting/merging in the initial workflow. EPCIS itself does not require event IDs; it describes them as optional. A pilot that cannot split or merge lots can simply prohibit that action or route it for review. The physical waterproof card must remain linked to its lot as source evidence, but an official shellstock tag is a separate conditional record; the brief does not establish whether the card is such a tag or what local rules apply. [R07][R08]

**Critic disposition:** Keep **Correction** for stable, collision-resistant lot identity (scheme open), visible sync/operational states, and the bed/window/capacity/receipt/pack/hold path. Mark collision handling and source-card linkage as acceptance details. Make preallocated ranges versus another collision-resistant mechanism, separate event IDs, split/merge handling, and official-tag integration **optional/conditional**. Preserve Authority confirmation before legal-tag claims. The proposed 12-crew load trial is useful workload coverage; do not infer from it that all twelve crews must convert to the digital workflow before the farm has selected a pilot.

### M3 — P2’s history correction is sound; its supporting operations are not all plan defects

The clause requires preserving correction history, and the brief specifically says a transcription must be correctable without erasing who changed a value. The draft properly asks for old and corrected values, actor, time, reason, and linkage to the source record. Its phrase “append-only or equivalently recoverable” allows more than one implementation and is appropriately outcome-focused. ODK’s current form audit can record changed answers and prompt for an edit reason and user identity; the export and Central activity feed are distinct pieces of evidence, and the old open issue #5550 is a version-specific reproduction target rather than evidence of a current general defect. [R03][R16]

However, canonical history selection, digital retention duration, backup cadence/location, restore ownership, and correction review status are broader record/recovery policy choices. They are good questions to resolve before relying on a production record, but are enhancements/operational decisions beyond the exact P2 text. A mandatory “review status” for every correction is not stated in the brief; use it only if the farm’s process needs it. Avoid treating an Authority’s 90-day shellstock-tag retention statement as a retention rule for all digital records; the draft correctly makes this distinction. [R07]

**Critic disposition:** Keep **Correction** for preserving prior/current values and attribution in a recoverable history. Classify backup/restore, digital retention, canonical-source selection, and whether corrections need approval as **optional pilot controls or user/Authority decisions**, to be proportionate to the pilot and applicable duties. The #5550 scenario remains proposed; it was not run.

### M4 — One ODK edit-version condition should be added to validation

The draft says edits to finalized/sent submissions require explicit form opt-in and specified minimum Collect/Central versions, that changes appear in an activity feed, and that entity-backed submissions do not update their Entity. Those statements match the current ODK docs. The docs add two conditions that matter to a correction-history design: Collect-side edits use the form version active when the submission was originally filled, and only submissions still on that device are editable that way. A later form definition change can turn off editing for new records without turning it off for older submissions. The draft’s proposed “form version checks” are too compressed to guarantee these cases are exercised. [R01]

**Critic disposition:** Add test cases for an old queued submission, a form-definition change that turns off `client_editable`, a submission edited centrally, a submission no longer on its originating device, and an edit to a form that creates/updates an Entity. Confirm which actor can edit and which event/history record changes. This is a validation clarification, not evidence that ODK is unsuitable.

### M5 — Do not overread the evolution chain as an upload reliability finding

The independently reviewed #1703/#4489 history matches the draft’s bounded account: the older issue covered connectivity feedback during form download and send; v1.28.0 had more informative form-list feedback but still generic per-form download errors; #4489 specified per-form download detail and was linked to the v2021.3 release. The maintainer comment on #1703 says that the pattern would be applied to other download and upload paths; this is not evidence those paths were all implemented by that release. The draft explicitly says that the chain does not prove all upload/send failures were fixed, which is correct. Current issue #5550 remains open, but its reported environment is old; current open status does not prove a current defect or absence of a fix in later code. [R11][R12][R14][R16]

**Critic disposition:** Keep the chain as an O3 product-evolution example and test rationale. Do not extend its conclusion beyond the documented manual form-download behavior. The source-map’s inherited PR merge SHA is retained, but my direct GitHub API and PR-page opens returned an internal error, so I did not independently re-confirm that SHA in this pass. [R13]

## Exact plan comparison and dispositions

The quotations below are the complete P clauses from `revealed-plan.md`.

### P1

> “Track harvest lots from crew entry through shed handoff, packing, and review hold.”

**Critic disposition: Correction, scoped.** The core path is already present. Clarify the lot identity and event/state relationships required to make the path reliable while offline: bed/area, pickup window, intended/actual shed, packing capacity, local queue versus server receipt, operational receipt/packed/held/handoff. Keep the exact farm workflow and status names for the pilot decision. Treat a demonstrated collision-resistant ID as necessary; the choice of preallocated ranges versus another scheme is open. Treat full split/merge handling, mandatory distinct event IDs, and official shellstock-tag integration as optional or conditional. If no split/merge operation is allowed in the pilot, validate that the product blocks or flags it. Link the waterproof card as source evidence; seek Authority review before replacing or representing it as the legally approved tag. The proposed one-shed/twelve-crew workload exercise is meaningful, but the initial live-user cohort remains a farm pilot decision. [R01][R02][R07][R08]

### P2

> “Preserve a change history for corrections to quantities and lot details.”

**Critic disposition: Correction, outcome-based.** Require a retrievable prior value, corrected value, actor, and time, tied to the lot and source/card where applicable. A reason is a strong safeguard and matches the draft’s objective, but is a proposed field unless farm policy requires it. Accept append-only or another tested method that preserves the same history; do not prescribe event sourcing or require one audit file to be canonical. Treat digital retention, backups, restore, correction approval, and source-of-truth policy as proportionate pilot/operational choices and confirm applicable Authority requirements. The draft is right not to claim the #5550 old-version report is a current product defect. [R03][R07][R16]

### P3

> “Restrict crew contact details and internal quality notes from buyer-facing records.”

**Critic disposition: Already-covered.** Keep the prohibition intact across direct buyer views and paper. The draft correctly separates this from the undecided buyer field list. A buyer field allowlist, server-side source controls, export checks, printed-copy handling, and shared-screen cache/session tests are sound safeguards; they are implementation/validation work, not reasons to reopen P3. Confirm required traceability fields with the Authority/buyer while keeping phone numbers and internal quality notes excluded. [R05][R07][R10]

### P4

> “Provide multilingual labels and glove-usable shed controls for the initial pilot.”

**Critic disposition: Already-covered; acceptance criteria uncertain.** Keep both requirements for the initial pilot. Identify actual languages, form and application-interface strings, shed device, glove types, working conditions, and crew-approved pass criteria. Native speakers should review every user-visible string; test touchscreen controls with representative gloves. A translation feature supports language content but does not satisfy glove usability by itself. [R04]

### P5

> “Lot-release authority and the chosen source for locally issued notices are farm governance decisions.”

**Critic disposition: User decision, correct.** Do not assign a manager, issuer, or legal decision rule. The draft usefully identifies implementation questions (verifier, notice version/provenance, manual mapping, stale/ambiguous handling); record them as questions for the farm/Authority. A conservative review hold may be evaluated, but is not yet an adopted policy. The software must record evidence and operational review states without asserting whether harvest is legally permitted. The NSSP and FTL sources cannot select a local notice source or determine inlet-to-bed coverage. [R06][R07]

### P6

> “Buyer access versus paper handoff and expansion beyond one species and shed remain undecided.”

**Critic disposition: User decision, correct.** Keep channel and expansion unresolved. Compare buyer access and controlled printed records only against actual buyer needs, privacy, workload, device/connectivity fit, cost, record duties, and recovery. AppSheet and paper-first remain alternatives for evaluation; neither cost nor usability has been measured. One species/one shed remains the contemplated first boundary, not a decision to expand. The draft’s current-quote caveat is appropriate. [R05][R07][R09][R10]

## O1–O3 evidence and discovery review

- **Approaches:** ODK Collect/Central, AppSheet, EPCIS/CBV, and paper-first digital handoff are sufficiently different to inform the next decision: offline mobile forms with a managed server; managed no-code app over a data source; a standards/export vocabulary; and retained paper with shed transcription. The draft appropriately frames each as a candidate/reference, not a winner. Cost, local device, account/security configuration, and user fit remain unmeasured. No new tool inventory is requested in this critic stage.
- **ODK behavior:** The current Collect docs confirm offline forms in Ready to send, sent-state behavior, edit version prerequisites, opt-in configuration, old-form-version use, edit-order requirement, and no automatic update to the related Entity from Collect-side edit. The Entity docs confirm receive-order updates and surfaced parallel/conflict conditions, including held out-of-order chains up to five days for the documented versions. Keep statements version-qualified; do not infer conflict-free operation or data recovery guarantees. [R01][R02]
- **Audit and access:** Current docs support tracked old/new answers, optional reason and user prompts, and form-scoped App User access/revocation. They do not prove that one audit CSV is a complete or durable operational record; the draft correctly calls for a canonical record/recovery decision and tests. A shared physical device still needs actor attribution, session/cache tests, and a realistic account policy. [R03][R05]
- **Regulatory and standards boundaries:** The NSSP 2023 text supports the stated model-ordinance tag size/content/retention and conditional bulk-tag details, but local Authority applicability remains unresolved. The FDA Food Traceability List page states raw bivalve exceptions; product form and role are unknown. The draft makes no FSMA applicability conclusion. EPCIS supports the stated event-time, quantity/UOM and event semantics; event ID is optional in the standard, so do not present a distinct event-ID field as an EPCIS requirement. [R06][R07][R08]
- **AppSheet:** The current help page supports the online-first launch caveat, delayed-sync/prolonged-offline warning, map limitation, and 7/53-day Audit History retention claims. These support a bounded alternative, not a conclusion that AppSheet cannot be used for a shed board. Price, plan, data-source permissions, and device/cache behavior remain unknown. [R09][R10]
- **O3:** No missing issue/fix/release chain was identified. The predecessor research contains the source notes, and the independent public-source check confirmed the central limits above. R13’s merge commit was inherited from the predecessor source map; direct re-open was unsuccessful in this critic pass, as recorded in the source map. No repository source-code inspection or app runtime was done.

## Minor findings and sharpening points

1. **ID policy should be a result, not a prescribed mechanism.** A non-overlapping crew/device range is one option; another scheme is acceptable if the pilot demonstrates uniqueness and a safe recovery/reissue path. The brief does not require human-readable IDs or event IDs.
2. **Split/merge is conditional.** Retain lineage if the pilot allows split or combine operations. If not, make the initial workflow reject or quarantine them. Do not require a broad lot genealogy implementation without an actual pilot use case.
3. **Correction reason/review status is useful but not stated as a P2 requirement.** Decide whether to capture each based on the farm’s workflow. Preserve the mandatory actor and old/new-value history regardless.
4. **Keep official tag language model-based and local.** The source is the 2023 NSSP Guide’s Model Ordinance. Its requirements are not a case-specific finding about this farm’s jurisdiction, current card, or digital record. The draft generally uses this distinction correctly; keep it explicit wherever tag size/retention are summarized.
5. **Pilot sample sizes are scenario coverage, not reliability statistics.** “At least 20 lots” is a useful minimum exercise proposal, not a statistically justified sample. “Zero silent collisions/duplicates/missing events” is a reasonable critical acceptance gate for tested cases, not proof of zero production risk. Let the farm set workload volume, repeated cycles, acceptable outage/recovery time, and any operational thresholds.
6. **The 12-crew workload is distinct from the initial deployment cohort.** Testing assignments, queue, and shed visibility under all twelve crew identities may be needed to assess the real workflow. It does not require all crews to stop using cards or enter a live production service before the farm decides to pilot.
7. **Cost comparison is still open.** The draft correctly reports no researched current prices. Obtain comparable, written initial and annual estimates before comparing the $14,000 initial limit; no cost winner can be inferred here.
8. **Execution record is honest.** Source browsing is an executed research action; all runtime, backup/restore, privacy, localization, usability, record/tag, legal, and field validations remain proposed. No test result should be added without running the relevant system or review.

## Validation priorities

The proposed list is comprehensive. For a first pilot, I would sequence the highest-risk discriminators rather than require every test before a bounded trial:

1. **Record and offline correctness:** choose a lot-ID scheme, simulate multiple offline crews and one shed, verify queued versus server-received and operational states, conflict visibility, duplicate/re-entry handling, and card reconciliation. Include one form version change and one Collect-side correction under the original form version.
2. **Attribution, correction, and recovery:** correct a quantity/detail; inspect both form audit and Central activity; compare old/new value, actor, time, optional reason, and source record; test export and restore once. Reproduce #5550 only on the selected build/form as a targeted regression check; do not treat it as a current defect before results.
3. **Privacy and accessible use:** validate buyer outputs and shared-screen account/cache behavior; native speakers review translations; representative gloved users perform core shed actions with criteria agreed before observation.
4. **Governance and official records:** after the farm identifies jurisdiction, Authority, closure issuer, and release role, test notice provenance, manually reviewed bed mapping, hold workflow, and official physical tags/transaction records. Keep the system from asserting legal permission.
5. **Fit and cost:** only compare shortlisted workflows using the same required pilot tasks and current quotes. Keep AppSheet optional if the offline/permissions criteria eliminate it; keep paper-first if it remains operationally credible. Then the farm decides whether to expand scope.

These are proposals only. No app, device, configured account, notice feed, tag, or backup was available in this critique pass. Usage/billing remains unobserved (null/unknown). No product selection, legal conclusion, or validation pass is recorded.
