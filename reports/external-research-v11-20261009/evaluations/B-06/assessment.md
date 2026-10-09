# B-06 fresh independent assessment — I06

Both complete finals were assessed independently. **N2 (control): FAIL. N1 (treatment): FAIL.** These failures have different causes; they do not establish equal quality or a speed win. Comparative quality eligibility is **false**. Neither candidate was repaired.

The exact assignment/input map, ORIGINAL brief, frozen P1–P6 plan, rubric, complete discovery/draft/critique/final texts, source registers and source indexes were read. Material primary behavior was checked against independently retrieved official documentation, advisories, release records and tagged code. This assessment evaluates a small planning/handoff deliverable, not an installed broadcast platform or unlimited production guarantee.

Provenance and detailed source operations are in `assessment.json`, `source-map.json` and `primary-evidence.json`. Hashes identify frozen inputs/evidence; they are not quality scores. Method clues make blinding partial. Candidate native completion, T3 lifecycle, elapsed time, usage and billing are unknown and remain null. The input map marks both scientific finals available and delivered.

## Independent findings and grades

### N2 — control — FAIL

Final: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-06/control/reviser/final.md`.

**N2-F1 — MATERIALLY_WRONG; MATERIAL / medium**

Affected obligations: O2: investigate governing behavior/defaults and release applicability; O5: evidence-backed treatment of criticism; O6: meaningful discriminating validation proposals. Affected plan clauses: P1, P2.

Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-06/control/reviser/final.md`, lines 366–373:

> - Same advisory batch, second vulnerability (omitted by the investigator,
>   restored here): through the fetch-URL feature, a user could execute a
>   request to an external server with privileged network access; the mitigation
>   is to route network requests through a trusted proxy (GHSA-qh95-2qv8-pqx3).
>   This drives the proxy-or-disable condition on every Grist deployment
>   option. The exact fetch-URL default (owner-only or open) and the proxy
>   environment knobs are uncertain until the grist-core documentation is opened
>   at build. (C03.)

Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-06/control/reviser/final.md`, lines 415–425:

> - M2 (omitted fetch-URL SSRF; P1/P2, O2/O3): ACCEPT. The 1.7.7 release notes
>   list two vulnerabilities, and the fetch-URL privileged-network request with
>   its trusted-proxy mitigation is verbatim in the carried excerpt yet absent
>   from all investigator prose — a genuine omission with same-host relevance
>   for a self-hosted no-developer deployment. The final adds the condition in
>   disjunctive form (disable or lock the fetch-URL feature, route requests
>   through a trusted proxy, or use managed hosting where the vendor owns
>   egress) plus a validation (attempt an external fetch from a formula cell;
>   expect denial or proxy routing). AMENDED only in certainty marking: the
>   exact default and proxy knobs stay uncertain until the grist-core
>   documentation is opened at build, per the critic's own could-be-wrong.

Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-06/control/reviser/final.md`, lines 664–668:

> 9. Fetch-URL egress (P1, P2). From a formula cell, attempt an external fetch;
>    expect denial or trusted-proxy routing per the deployed disjunct, and
>    confirm the exact default plus proxy knobs from the documentation at run
>    time. Fail on any direct privileged-network request. Owner: whoever holds
>    the deployment (staffer on a managed trial; vendor support otherwise).

Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-06/control/reviser/final.md`, lines 697–700:

> - Uncertainty preserved: grist-core parallel-line or backport status (floor
>   wording covers; changelog check at build); fetch-URL defaults and proxy
>   knobs (documentation at build plus validation 9); new-values approval
>   expressiveness without owner intervention (custom-rules documentation at

The final adopts the critic M2 formula-cell probe as its test of the fetch-URL advisory and defers available defaults/proxy research to build time. The advisory concerns a server-side URL-fetch path reachable through document communication, not specifically the REQUEST formula. Tagged code distinguishes ActiveDoc.fetchURL from DocRequests handling formula requests. In the selected v1.7.20 release, fetchURL refuses an unset explicit untrusted-request configuration; an explicit direct value is accepted as configuration and uses no proxy. REQUEST is separately disabled unless its enable flag is affirmative. Thus, with REQUEST disabled and the URL-fetch path explicitly configured direct, the proposed formula attempt can be denied while the other fetch path remains direct. This is a static code-derived counterexample to discrimination, not an executed exploit or a claim that the station is deployed insecurely.

The proposed deployment qualification could accept a denial on the wrong surface as evidence for the named egress control. The selected-version default and configuration exception were available for research. The flaw remains despite honest no-runtime reporting and despite the otherwise useful version floor.

Criticism lineage: control/critic/critique.md:48-62 conflates REQUEST()/fetch-URL, identifies formula-capable users, and asks for a formula-cell check. final.md:415-425 ACCEPT/AMEND carries the conflation rather than resolving it. Historical SSRF and the general proxy condition are supported; the claimed test/applicability mapping is not.

No executed-validation overclaim; no candidate installation or exploit was run. This finding does not require a full security audit or a new broad discovery campaign.

Primary evidence: [E34](https://github.com/gristlabs/grist-core/security/advisories/GHSA-qh95-2qv8-pqx3), [E26](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/app/server/lib/ActiveDoc.ts), [E27](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/app/server/lib/uploads.ts), [E28](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/README.md), [E29](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/app/server/lib/ProxyAgent.ts), [E40](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/app/server/lib/outgoingRequests.ts), [E42](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/app/server/lib/Requests.ts), [E32](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/app/client/components/DocComm.ts).

Minor findings, separated from the material grade:

- **N2-m1** (`/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-06/control/reviser/final.md:285`): NocoDB no-trash/permanent-delete is stated without deployment/version qualification. The 2026.04.2 release supplies Record Trash for managed bases on all cloud plans and on-prem Enterprise, excluding external PostgreSQL/MySQL bases. Baserow three-day trash is supported. The NocoDB generalization is wrong, but the final marks this fallback preliminary and gates any switch; it does not determine the selected Grist recommendation.
- **N2-m2** (`/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-06/control/reviser/final.md:90`): Built-in team logins can be read as a local self-host identity provider. Official self-host guidance instead offers an external getgrist.com sign-in service or another configured authentication method. A viable vendor-login option exists; the hosted-versus-self-host distinction is left unclear. Login is required and hosting remains an explicit question, so this is not independently graded a material product failure.
- **N2-m3** (`/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-06/control/reviser/final.md:426`): The rationale implies loosening the ordinary copy/download gate can leak a partially readable full document and leaves current partial-copy behavior uncertain. Documentation explicitly retains the full-read prerequisite, with a separately named template exception. Testing exports and keeping defaults are sensible; the ordinary-copy threat premise needs narrower wording.
- **N2-m4** (`/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-06/control/reviser/final.md:180`): Conditional formatting is documented to change cell/row styles. Saying it must set text or an icon can imply it generates a label; the separately specified status text already supplies the required non-color channel. No particular label-rendering capability is demonstrated by that phrase.

Honest unresolved inputs:

- Actual hosting/IdP/volunteer ops capacity
- Approval role, retention law/period and transmitter-break layout
- Actual device freshness/print behavior, costs and purge surfaces
- Current AzuraCast root-doc beta status could not be refreshed: independent fetch 403; final already gates re-verification

Not treated as false facts, no-delivery, or independent material failures.

### N2 — all six assessment axes

| Axis | Actual coverage | Judgment |
|---|---|---|
| 1. Original obligations and explicit constraints | FULL | All O1-O6 and explicit brief constraints examined. Broad fulfillment is substantive; O2/O6 are defective at the specific fetch validation mechanism, not omitted wholesale. No station decision is silently answered. |
| 2. Consequential primary behavior/defaults/limits/applicability | FULL | Rules, role visibility, history/patch sequence, deployment/ops envelopes and color rule checked. Correct release corrections coexist with a selected-version fetch/default/test mismatch (N2-F1). Preliminary fallback and auth ambiguities are separated as minor. |
| 3. Useful discovery and viable alternatives/options | FULL | Permissioned Grist plus paper workflow is materially different from a single print log. Baserow/NocoDB fallback, LibreTime planning-only trial, AzuraCast manual stream complement and Rivendell rejection are explained with conditions. This is useful discovery despite provisional fallback details. No source/product count is used as grade. |
| 4. Every exact P clause and dispositions | FULL | P1-P6 all compared verbatim. Shared versus identical, labeling, privacy and freshness refinements are generally consistent implementations, not proof of intrinsic plan errors. P5/P6 choices and optional paths are preserved. No supported P scope is rejected outright. |
| 5. Draft-critique-final preservation and fallible criticism | FULL | Full discovery/draft/critique/final reviewed; all M1-M12 and m1-m8 adjudicated independently. Supported alternatives, undecideds and core conditions survive. M2 is not resolved correctly; several categorical critic premises are overbroad but are qualified or harmless in final scope. |
| 6. Meaningful proposed versus executed validation | FULL | Static fetch/read work is separated from proposed station tests; no runtime result is fabricated. V1-V8 address canary visibility, approval, late-change misses, affected-person legibility, fallback, retention and layout with independent outcomes. V9 uses the wrong fetch surface and has a code-derived false-pass counterconfiguration. |

### N2 — every exact plan disposition

**P1: Provide a shared show schedule and operator handoff view for both transmitters and the web stream.**

Candidate 68–98: already-covered, correction, optional enhancement, rejected, uncertain. Shared master, role-specific recipient visibility, stamped print and measured late-change discipline fit the brief. A shared view does not itself mean identical permissions: the correction is a brief-derived implementation constraint, not proof P1 is intrinsically wrong. Rejection of AzuraCast as primary preserves its bounded complement role. Egress applicability/test defect N2-F1 remains.

**P2: Track clearance status and restrictions at the track or clip level used in a show.**

Candidate 100–139: already-covered, correction, optional enhancement, rejected, uncertain. Track/clip granularity, separate restriction notes, textual status and changed-since-print overlay are preserved. The approver remains a station variable. newRec/rec conditions can gate permitted transitions; a configured approval workflow is unexecuted. Pending-at-airtime and interim contact are explicitly station decisions. LibreTime is optional and its planning-only use is honestly unproven.

**P3: Preserve a printable daily log and a manual fallback for transmission interruptions.**

Candidate 141–175: already-covered, correction, optional enhancement. Daily print and manual fallback are retained, including version/zone, change acknowledgement, redaction, insert slips and offline reconciliation/clearance responsibility. Paper supplies a rundown, not restored RF or stream transmission; the final must be read within its planning scope. Print-path and fallback drills are proposed.

**P4: Use text labels with status cues so operators do not rely on color alone.**

Candidate 177–201: already-covered, correction, rejected, uncertain. Labels meet the explicit brief; the color/lightness distinction is supported. Web criterion and paper policy are separated. The affected staff member remains in the test. Calling this a correction is mostly elaboration of an already explicit P4, not grounds to reject the plan. See minor style/content ambiguity.

**P5: Approval authority for usage-note changes and retention of listener requests are station decisions.**

Candidate 203–227: user decision, optional enhancement, uncertain. Neither approver role nor retention duration is filled. Quarantine and 30/90-day drill candidates are postures/options; the station records its decision. History deletion is not equated with destruction of backups, exports and logs. Counsel/jurisdiction is honestly unresolved.

**P6: Whether differing local breaks need separate schedules is not settled.**

Candidate 229–253: user decision, uncertain, rejected, optional enhancement. Single-with-transmitter columns and split schedules/shared program are both preserved. Tabletop replay and live pilot avoid forcing a choice. The final preserves the low-cost two-view proviso, so the critic blanket infeasibility statement does not erase the alternative. Stream break mapping is conditional enhancement.

### N2 — complete criticism and preservation adjudication

The following is the assessor’s decision, not automatic agreement with the critic. Material supported options and qualifications are checked against their original stage and final treatment.

| Criticism / critic locator | Final treatment | Independent evidence-backed decision |
|---|---|---|
| M1; critique.md:29-46 | ACCEPT | **ACCEPT with scope caveat**. Vendor patch 1.7.6 and later undo/structure fix are supported. Pinning a line containing the fixes is appropriate. Neither a latest-release guarantee nor a complete vulnerability survey is established. Evidence: E35, E04, E05. |
| M2; critique.md:48-62 | ACCEPT/AMEND | **PARTLY ACCEPT; REJECT formula-path equivalence**. Historical SSRF and proxy mitigation are real. REQUEST and document fetchURL are distinct, with different enabling defaults. The final did not settle the readily available code/default issue and preserves the invalid witness (N2-F1). Evidence: E34, E26, E29, E28, E42. |
| M3; critique.md:64-79 | ACCEPT | **AMEND threat premise**. Export/channel tests and full/partial-read matrix are useful. Ordinary full-document copying still requires full read; changing its gate alone does not bypass that prerequisite. Template exception is distinct (N2-m3). Evidence: E01, E46. |
| M4; critique.md:81-93 | ACCEPT | **ACCEPT as scoped retention question**. History removal covers history. Backup/export/log inventory and a narrowed station-accepted purge claim are appropriate; no total-deletion proof or fixed legal period exists. Evidence: E35, E11, E46. |
| M5; critique.md:95-113 | ACCEPT | **ACCEPT workflow conditionality; AMEND auth wording**. Push versus pull and station IdP/hosting capacity are facts to measure/ask, not reasons to discard either. Authenticated multi-user access is necessary. Vendor sign-in exists for self-host; it is not a built-in local credential service. Evidence: E08, E33. |
| M6; critique.md:115-129 | ACCEPT | **ACCEPT mechanism/liveness question**. Checking new values uses rec/newRec and user attributes, supporting transition-gating sketches. It does not auto-implement a pending change workflow. Airtime and emergency authority remain station decisions; no runtime is claimed. Evidence: E01. |
| M7; critique.md:131-147 | ACCEPT | **ACCEPT evidence boundary**. An Owner/unfiltered print is not redacted by a non-owner denial. Named recipient-safe output and negative print checks are reasonable; procedure/audit alone is not a technical denial. Offline-clear duty is explicitly station-named. Evidence: E01. |
| M8; critique.md:149-162 | ACCEPT | **PARTLY ACCEPT**. Separating web criterion from paper policy is sound. The claim that one affected-person task check proves almost nothing is too broad for this small brief; that user task is meaningful. Additional sampling is optional rigor, not a source-derived mandatory size. Final keeps the affected user. Evidence: E20. |
| M9; critique.md:164-177 | ACCEPT | **ACCEPT explicit decision preservation; qualify rationale**. No law or grant floor was researched. A station-tolerated shortest option is not necessarily a researcher-imposed period, but a quarantine posture plus explicit management choice avoids ambiguity. The final retains candidate periods without choosing one. Evidence: Original brief / design-method inference. |
| M10; critique.md:179-193 | ACCEPT with near-free proviso | **AMEND categorical infeasibility**. Comparing two representations of the same past week need not air a week twice. The blanket cannot-build/run claim is unsupported. Final tabletop comparison and near-free two-view proviso preserve the useful supported option, so no material loss remains. Evidence: Original brief / design-method inference. |
| M11; critique.md:195-221 | ACCEPT | **ACCEPT provisional fit limits; qualify cost absolutes**. Planning-only and no-code API-feed paths are not established by install/navigation pages. Preliminary fallback and manual dashboard check are reasonable. Non-goal/ops burden support rejecting full automation; a $6k cost impossibility is not established. NocoDB blanket no-trash wording is now inaccurate. Evidence: E19, E25, E18, E36, E37. |
| M12; critique.md:223-237 | ACCEPT | **PARTLY ACCEPT**. Named test owners/no-developer variants improve feasibility. A safely isolated old-versus-patched control is not intrinsically irresponsible; the assignment permits qualified sandbox witnesses. Removing that optional control does not make the remaining negative tests meaningless. Measure-and-agree thresholds are design criteria, not facts. Evidence: Original brief / design-method inference. |
| m1; critique.md:241-243 | ACCEPT | **ACCEPT**. Changed-since-print is independent of clearance status; the final explicitly separates the boolean overlay. Evidence: Original brief / design-method inference. |
| m2; critique.md:244-245 | ACCEPT | **ACCEPT pinning; qualify image naming**. Tag/digest pinning is sound; grist-core is the repository and gristlabs/grist is the documented image. The final has no executed deployment command, so vague image naming is not an installed failure. Evidence: E33. |
| m3; critique.md:246-247 | ACCEPT | **ACCEPT**. Duty operator/version control, timestamp zone and acknowledgement record are now specified as proposed workflow. Evidence: Original brief / design-method inference. |
| m4; critique.md:248-250 | ACCEPT | **ACCEPT scope compression**. Cutting unrelated upgrade trivia retains the relevant operations condition; O3 is preserved in the Grist chain. Evidence: E19, E16. |
| m5; critique.md:251-252 | ACCEPT | **ACCEPT criterion qualification**. Final still repeats the bar in P4 and validation 4 despite saying it no longer does; minor editorial inconsistency, not scientific validation evidence. Evidence: Original brief / design-method inference. |
| m6; critique.md:253-254 | ACCEPT | **ACCEPT**. The release note is available and confirms the undo/structure fix; the uncertain label is appropriately removed. Evidence: E04. |
| m7; critique.md:255-257 | ACCEPT | **ACCEPT**. At least one relevant issue/fix/evolution chain is researched; absent other chains do not erase that coverage. Evidence: E35, E04, E05. |
| m8; critique.md:258-260 | ACCEPT | **ACCEPT qualified drift notes**. The final carries mutable-versus-released-source distinctions. A versioned docs branch is still a mutable edition, not immutable bytes; this does not invalidate its identified scope. Evidence: E33, E16. |

Supported content preserved:

- All six discovery alternatives/approaches and their distinct roles
- Status/restriction privacy, print/manual fallback, affected-user labels
- Station approval/retention/layout decisions
- Grist compare/hardening/undo chain, provisional donor paths, honest no-runtime scope

Unrelated LibreTime upgrade minutiae compressed, with relevant ops condition retained; no grade penalty.

### N2 — primary claim/applicability coverage

Every consequential claim group below was checked; fields include the exact final passage and primary URL/edition in assessment.json. Complete is review coverage, not proof of a deployment.

| Claim group | Candidate final lines | Result | Primary records |
|---|---|---|---|
| N2-S1: Grist relational spreadsheet, SQLite/Python, reference/views/forms/API and Apache core | 257–260 | Documented capability identity supported; no implemented station workflow claimed. | E33 |
| N2-S2: Rule order, first definitive permission, structure formula exception | 261–269 | Supported. Data access checks and styling-rule order are distinct systems. | E01 |
| N2-S3: Owners-only copy/download defaults and full-read prerequisite | 269–271 | Defaults supported; threat rationale overbroad in N2-m3. | E01, E46 |
| N2-S4: Role/record-sensitive clearance and privacy gates | 272–284 | rec/newRec/user attributes support sketches; configuration, auto-pending workflow and print boundary unexecuted. | E01 |
| N2-S5: Hosted/self-host authentication and license fit | 90–95 | Real vendor-login path exists. Built-in local-login reading unclear; station IdP/hosting are unknown. | E08, E33 |
| N2-S6: Historical compare leak, patch, score and history workaround | 352–365 | Vendor patch 1.7.6/Moderate 5.3 and workaround are supported; alternate aggregator score is explicitly lineage, not governing truth. | E35, E46 |
| N2-S7: 1.7.9 hardening and 1.7.20 undo/structure fix/floor | 374–387 | Supported release sequence and relevant floor; potential backport equivalence remains a future deployment-specific question. | E05, E04 |
| N2-S8: Fetch-URL risk, defaults and formula-cell validation | 366–373 | Historical risk supported; available selected-release defaults omitted and validation path wrong (N2-F1). | E34, E26, E28, E29, E42 |
| N2-S9: NocoDB/Baserow alternative claims and applicability | 285–297 | Baserow trash and permissions tiers supported. Blanket NocoDB no-trash false with version/deployment exceptions. Preliminary switch gate limits consequence; other secondary comparison details are not treated as procurement facts. | E36, E37, E12, E39 |
| N2-S10: LibreTime CPU/RAM/ports/install and planning-only proviso | 298–309 | Exact install envelope supported; docs describe automatic playout, not a demonstrated planning-only mode. Proviso is honest. | E19, E25 |
| N2-S11: AzuraCast stream-focused ops/roles and no-code complement | 310–322 | Broadcast focus/ops supported; no fetched evidence establishes a clearance workflow or Grist integration. Manual check is a proposal. Beta retained snapshot is qualified; independent current docs root returned 403. | E18, E17 |
| N2-S12: Rivendell automation/hardware rejection | 323–328 | Automation, three logs and ASI/JACK/dedicated host support the scope rejection. The claim $6k necessarily cannot afford it is not established or needed. | E21 |
| N2-S13: WCAG non-color cue, 3:1 exception and paper scope | 329–339 | Supported distinction; brief itself mandates labels. Paper policy is distinct from web conformance. | E20 |
| N2-S14: Versioned print/change discipline/manual handoff | 145–173 | Source-backed redaction boundary plus explicit design inference; stamping, communication and fallback have not been run. | E01 |
| N2-S15: Retention live/history versus backups/exports/logs | 644–650 | History endpoint and separate surfaces support proposed investigation; future outcomes and station duration are unknown. | E35, E46, E11 |
| N2-S16: Approval/retention/schedule remain station decisions | 203–253 | Checked against exact original brief/P5/P6. Both alternatives and undecided values remain. | Original brief / explicitly labeled design inference |
| N2-S17: Executed/static versus proposed validation scope | 588–671 | No runtime is claimed. V1-V8 are meaningful small-product proposals with outcomes/owners; V9 fails to discriminate its stated source surface. | E26, E29, E42 |

Grade limits:

- FAIL is source-grounded and assessed on all six axes; it is not a judgment that every aspect fails.
- No executed scientific runtime witness was supplied or run; the relevant validation flaw is static code-derived.
- No recommendation repair, deployment, legal analysis or unlimited-production guarantee is part of this evaluation.

### N1 — treatment — FAIL

Final: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-06/treatment/research/final.md`.

**N1-F1 — FALSE_CORRECTION_OR_REJECTION; MATERIAL / medium**

Affected obligations: O2: consequential primary behavior for the selected no-code substrate; O5: preserve supported mechanisms and disposition fallible criticism using evidence. Affected plan clauses: P2.

Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-06/treatment/research/final.md`, lines 413–414:

> C10 Source-ID traceability errors — ACCEPT. Errors confirmed against source-map.json (details
> §10); frozen files untouched; alias table + direct-URL citation + E1 qualification applied.

Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-06/treatment/research/final.md`, lines 439–444:

> ## 10. Source-ID alias correction table (frozen-discovery citation defects)
> 
> The frozen `discovery.md` §3 prose labels below misidentify the correct frozen IDs. The frozen
> `source-map.json`, `sources/index.md`, and evidence FILES were and are correct — only these
> prose labels are wrong. Frozen files are not rewritten or renumbered; this table is the
> correction record, and this final cites URLs/locators directly throughout.

Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-06/treatment/research/final.md`, lines 460–460:

> | Draft §1/P2 "S15 for reference columns / conditional formatting / card views" | UNSUPPORTED by S15 (grist-core README) | Downgraded: those UI behaviours appear only as help-center NAV LISTINGS inside S11's retained page, not as established behaviours — treated as vendor claims until pilot-tested; no retained page proves their semantics |

The real discovery header aliases are erroneous, but the final adds a different correction: it declares the draft P2 feature claim unsupported by S15 and says these behaviors occur only in Help Center navigation, with no retained page establishing their semantics. The actual frozen S15 README explicitly describes references cross-linking records, formula-based conditional cell styling, and card views under Features in grist-core. Those descriptions are repeated in the tagged v1.7.20 README; the conditional-formatting guide independently documents formula-driven styles. The final accepts the critic traceability demand as a whole and withdraws this supported, relevant explanation of how the no-code clearance view can be built.

This is not merely an incorrect source ID: the final downgrades and omits a supported implementation mechanism for its selected planner, while giving a false account of the primary evidence it already possessed. It should distinguish documented native capabilities from an unexecuted station configuration, rather than treating the capabilities as ungrounded. The assessment does not assert that the draft proved an end-to-end station workflow or that a README replaces runtime acceptance.

Criticism lineage: treatment/critic/critique.md:98-100 challenges the S15 feature support. final.md C10:413-414 accepts that limb; alias-table row:460 records the false withdrawal. Most other alias corrections are valid and preserved; the invalid limb requires independent rejection.

The feature itself is not broken, and no security exposure or deployed failure is alleged. The material defect is source-grounded false correction and loss of useful supported mechanism, not a citation-count penalty.

Primary evidence: [E33](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/README.md), [E47](https://support.getgrist.com/conditional-formatting/).

Decisive same-arm frozen source: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-06/treatment/research/sources/grist-core-README.md`, lines 45-56; specifically 47, 51, 54; SHA-256 `c5fb7b1b385d179fc99bba809e6786d80c64dcd011aa625d29e633b07d0a810a`. This avoids mistaking later source drift for support that was absent at authoring time.

Minor findings, separated from the material grade:

- **N1-m1** (`/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-06/treatment/research/final.md:364`): The final retains the 30-minute, 5+5, remaining-fill shape in C14 but does not spell out the expected 20-minute remainder versus erroneous 15-minute fill in V3. This weakens self-contained test detail; the shape, cause, release and applicability remain in prose, so it is not treated as a second material preservation failure.
- **N1-m2** (`/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-06/treatment/research/final.md:380`): The heading each demand independently verified is broader than the final separate disclosure that newly added critic facts were not investigator-verified against primary pages. The disclosure at lines 25-30 and U9 is explicit, so this is wording inconsistency rather than an executed-research claim reversal.

Honest unresolved inputs:

- Volunteer/editor seat turnover, support costs, measured row classes/growth and nonprofit eligibility
- Approval/airing-while-unresolved policy, retention by class/law and transmitter layout
- Actual print/allow-list/privacy outputs, deleted-value recovery and offline carrier deployment
- New critic-sourced leads explicitly require station fit checks; no Grist/AzuraCast runtime regression search is claimed

Not converted into scientific false, zero cost, or missing delivery. Optional smart-fill chain satisfies the source-evolution obligation within its declared applicability.

### N1 — all six assessment axes

| Axis | Actual coverage | Judgment |
|---|---|---|
| 1. Original obligations and explicit constraints | FULL | O1-O6 and all explicit constraints examined. Delivered scope is substantial and generally coherent; the scientific grade is failed for a particular unsupported correction/preservation loss, not a missing final or missing whole obligation. |
| 2. Consequential primary behavior/defaults/limits/applicability | FULL | Privacy defaults, role/Owner exception, costs/seats/row units, donor behavior, durations and color exception independently checked. The false S15 evidence denial is material. Native workflow outcomes, legal policy and actual costs are honestly unproven. |
| 3. Useful discovery and viable alternatives/options | FULL | Conditional Grist/Baserow/Sheets pilot options, radio-native design donors, Spinitron screening and local/static/paper carriers are useful distinct approaches. Install burden, price units and source gaps remain visible. The chosen O3 donor chain is applicable to conditional arithmetic, not the brief printed-log bug; that limit is accurate. |
| 4. Every exact P clause and dispositions | FULL | P1-P6 all compared. Approval/icon/stream-shape reclassifications correctly protect station choices and brief scope. The later P2 native-feature withdrawal is a false correction, distinct from valid header aliases (N1-F1). |
| 5. Draft-critique-final preservation and fallible criticism | FULL | Entire discovery/draft/evidence-first/critique/final reviewed. All C1-C15 and grouped minor demands independently adjudicated. Owner-export mistake, paid-ops fiction, invented growth rank, icon mandate and unqualified smart-fill analogy are usefully corrected; primary-supported Grist capabilities are wrongly downgraded under C10. |
| 6. Meaningful proposed versus executed validation | FULL | No station runtime/billing test is claimed. V1-V9 distinguish receiver canary disclosure, structure exception, conditional arithmetic, late-change currentness, real affected-user tasks, fallback/reconciliation, cost units and sufficient break events. Procedures are valid planning proposals with a minor compressed expected-arithmetic detail. |

### N1 — every exact plan disposition

**P1: Provide a shared show schedule and operator handoff view for both transmitters and the web stream.**

Candidate 48–98: already-covered, correction, optional enhancement, user decision, rejected. Role-scoped shared planning, currentness and recipient-tested redaction cover the brief. Owner-export denial is properly withdrawn and native/custom/private-store options remain. AutoDJ priority is an analogy, not a manual station rule. Broadcast stacks are rejected without rejecting shared schedule/handoff scope.

**P2: Track clearance status and restrictions at the track or clip level used in a show.**

Candidate 100–128: already-covered, optional enhancement, uncertain. Track/clip status and restrictions remain, with reusable item versus dated-use modeling explicitly inferred. Approval scaffold is correctly reclassified and unresolved status is never silently cleared. Attachments and duration arithmetic are conditional. N1-F1 falsely downgrades the native Grist mechanism underlying this P2 implementation explanation.

**P3: Preserve a printable daily log and a manual fallback for transmission interruptions.**

Candidate 130–158: already-covered, correction, optional enhancement. Printable daily log/local snapshot and manual reconciliation are retained. Tool/network fallback is separated from actual transmitter/stream-path interruption and a separate station-engineering exercise is required for the latter; this is a defensible scope boundary, not a rejection of P3. No transmission-continuity result is claimed.

**P4: Use text labels with status cues so operators do not rely on color alone.**

Candidate 160–177: already-covered, optional redundancy. Explicit labels remain mandatory in every view; icons are correctly optional. Affected-person task acceptance supplements monochrome inspection. The final does not turn a color-perception need into unbounded screen-reader or full-WCAG certification.

**P5: Approval authority for usage-note changes and retention of listener requests are station decisions.**

Candidate 179–211: user decision, illustrative options. Approver and retention remain management decisions; role and retention examples are labeled illustrative. Distinct record classes/copies and content-free purge log are appropriate design inferences. Paid help is allowed inside the allowance; seat-price and row-unit observations are correct illustrations, not measured costs.

**P6: Whether differing local breaks need separate schedules is not settled.**

Candidate 213–231: user decision, discussion examples, hypothesis. Both transmitter schedule shapes survive; stream freshness is handled under P1. Event opportunity count and operator-confusion measures improve a calendar-duration-only trial. Management retains the choice. There is no evidence that the unified shape must be cheapest.

### N1 — complete criticism and preservation adjudication

The following is the assessor’s decision, not automatic agreement with the critic. Material supported options and qualifications are checked against their original stage and final treatment.

| Criticism / critic locator | Final treatment | Independent evidence-backed decision |
|---|---|---|
| C1; critique.md:35-37 | ACCEPT | **ACCEPT**. Owner privilege does not inherit a non-owner denial. Explicit projection/receiving-role tests are appropriate; no native redacted export is assumed proven. Evidence: E01. |
| C2; critique.md:43-51 | ACCEPT | **ACCEPT**. P2 is not wrong for leaving approval to P5. The final preserves the useful scaffold without silently choosing the role. Evidence: E01. |
| C3; critique.md:53-59 | ACCEPT | **ACCEPT**. Native-path-or-funded-feature and transmission versus tool-outage boundaries are justified. Provider history remains a surface to investigate, not automatic compliance with a retention parameter. Evidence: E25, E11, E12. |
| C4; critique.md:61-65 | ACCEPT | **ACCEPT**. The text label supplies the necessary visible non-color indication; separate icons are not an additional mandatory channel. Evidence: E20. |
| C5; critique.md:67-71 | ACCEPT | **ACCEPT qualified decision scaffolding**. Illustrative roles/periods are not evidential findings. Final avoids a silent Owner-only approval policy and a blanket retention duration while keeping explicit unresolved status. Evidence: Original brief / design-method inference. |
| C6; critique.md:73 | ACCEPT | **ACCEPT**. Paid operations are not excluded by a $6k allowance. Current price/seat observations and nonprofit eligibility support conditional budgeting; no discount approval or actual volunteer cost is claimed. Evidence: E11, E12, E24. |
| C7; critique.md:75 | ACCEPT | **ACCEPT**. An invented growth scenario cannot settle Free-tier fit. Final restores measurement, row definition and the per-document/per-workspace distinction. Evidence: E11, E12. |
| C8; critique.md:77-81 | ACCEPT | **ACCEPT decision/trial qualification**. The brief reserves transmitter break layout, not an imposed third stream log. Trial events and confusion are meaningful; elapsed weeks alone are not evidence of enough divergent opportunities. Evidence: E49, E25. |
| C9; critique.md:85-87 | ACCEPT | **ACCEPT scoped feasibility qualification**. Custom export/purge/signalling are not established native station workflows. Splitting native pilot baseline and funded conditional work addresses the no-developer constraint without forbidding paid help. Evidence: E01. |
| C10; critique.md:89-100 | ACCEPT | **PARTLY ACCEPT; REJECT S15 feature-withdrawal limb**. Discovery header aliases are real. But frozen S15 explicitly documents references, conditional styling and card views, so the final unsupported-by-S15 row is false and loses a useful supported mechanism (N1-F1). Evidence: E33, E47. |
| C11; critique.md:102-106 | ACCEPT as screening leads | **ACCEPT additions; do not grade omission by brand count**. Sheets workflow and Spinitron ontology are useful different approaches, not proven fits. The original O1 does not mandate every product. Final attribution/gates preserve the leads without overstating station suitability. Evidence: E23, E44, E49. |
| C12; critique.md:108-118 | ACCEPT | **ACCEPT**. Proposals now include receiver canary, owner-derived outputs, actual late-change timing, affected-person task, reconciliation and event-based layout criteria. They are all honestly unexecuted. Evidence: E01, E15, E20, E23. |
| C13; critique.md:120-126 | ACCEPT | **ACCEPT**. Legal/billing unknown, simulation supplemental, optionals designed versus observed, and management-proposed trial/cost criteria are retained. Transfer/cost ranks remain hypotheses. Evidence: Original brief / design-method inference. |
| C14; critique.md:51 and 132 | ACCEPT | **ACCEPT conditional applicability**. The smart-block arithmetic chain is real but not the printed-log distribution mechanism. It is relevant only to optional arithmetic. Newline/Liquidsoap playout is correctly inapplicable without playout integration. Evidence: E15, E16, E48. |
| C15; critique.md:45,47 | ACCEPT as design proposal | **ACCEPT inference marking**. Reusable clip facts versus a dated use is a useful modeling proposal. Source ontology informs the idea but does not prove a station configuration or authorship audit. Evidence: E49, E01. |

Supported content preserved:

- All investigator product families/donors/fallback choices
- Conditional costs/limits and field/role semantics
- Station-owned approval/retention/transmitter decisions
- LibreTime3026 root/release sequence with narrowed applicability; 3160 inapplicable
- Optional priority/history/rights reminder/attachments and validation separation

Remaining-time oracle is compressed but inferable from retained 30/5+5 shape; minor rather than a second material failure.

### N1 — primary claim/applicability coverage

Every consequential claim group below was checked; fields include the exact final passage and primary URL/edition in assessment.json. Complete is review coverage, not proof of a deployment.

| Claim group | Candidate final lines | Result | Primary records |
|---|---|---|---|
| N1-S1: Grist disabled/enabled rules, non-owner denial and structure exception | 60–70 | Supported privacy premises and Owner-export asymmetry. | E01 |
| N1-S2: Native redacted output versus custom projection/private store | 71–77 | Options are correctly conditional and recipient-tested, not assumed secure. | E01 |
| N1-S3: Gris​t references/conditional formatting/card-view source support | 460–460 | False withdrawal. Frozen S15 and tagged README directly describe the native capabilities (N1-F1). | E33, E47 |
| N1-S4: Track/clip versus dated-use modeling, explicit unresolved clearance | 106–121 | Design inference correctly marked; license/status not conflated; approval station-owned. | E49, E01 |
| N1-S5: Grist list prices, seats, nonprofit discount and row/snapshot units | 197–211 | Arithmetic and units supported. Guests limited to two/doc; no actual volunteer counts, discount eligibility result or billing test known. | E11 |
| N1-S6: Baserow Advanced price, workspace units and billable roles | 203–211 | Supported chosen private-table/RBAC tier and selective role billing. Field edit permission alone is not confidentiality. Final does not claim that it is. | E12, E24, E39, E13 |
| N1-S7: Baserow versus Grist versus Sheets live alternatives | 235–247 | Costs are conditional; Sheets offline data stays local until sync. Same acceptance gates preserve privacy and budget. | E11, E12, E24, E23, E44, E39 |
| N1-S8: Spinitron program/occurrence screening lead | 243–247 | Ontology and public/logged-in distinction supported. Privacy/clearance/output/offline/price fit is explicitly unestablished; no recommendation depends on it. | E49 |
| N1-S9: LibreTime install envelope and broadcast scope rejection | 92–98 | Exact envelope and automatic-show workflow support donor-versus-playout distinction; costs not measured. | E19, E25 |
| N1-S10: AzuraCast priority/date/station permission semantics | 83–89 | Priority is automatic selection; final correctly keeps manual insert mapping as unproven analogy. Dated frozen roles file confirms global/station model. | E17, E18 |
| N1-S11: Rivendell rejection and multi-log precedent | 92–98 | Supported automation/hardware boundary; three logs do not automatically determine this station layout. | E21 |
| N1-S12: Single-file/local fallback carrier | 135–145 | Frozen S19 contains single-file/no-server model and v5.4.1 banner. No platform saving/deployment test claimed; generated static export also remains viable. | E45 |
| N1-S13: Source issue/fix/release/evolution linkage and donor applicability | 267–271 | PR3026 root cause and 4.2.0 inclusion verified; 4.3.0 scheduling evolution verified, not a causal assertion of the same bug. PR3160 playout chain correctly excluded. | E15, E16, E48 |
| N1-S14: WCAG visible cue/accurate-hue exception/affected-person acceptance | 160–177 | Supported; labels mandated by brief, extra icon not mandated, simulations supplemental. | E20 |
| N1-S15: Retention classes/history/deleted-value uncertainty | 152–157 | Observed histories are not deletion guarantees. Per-class retention and purge-log design explicit; counsel/provider behavior unresolved honestly. | E11, E12, E01 |
| N1-S16: Station decisions, no-dev budget, transmitter shape and currentness | 272–303 | Checked against original brief and exact P1-P6. No fixed retention/approver/layout is imposed; custom work requires funded ownership. | Original brief / explicitly labeled design inference |
| N1-S17: All V1-V9 proposal/execution distinctions and discrimination | 341–378 | All proposals unexecuted. Canary/positive and negative role checks, actual time/event units, recipient outputs and independent staff task are meaningful. V5 research is future deployment work, not an executed regression investigation. | E01, E15, E20, E23, E33 |
| N1-S18: Discovery aliases and preservation against criticism | 439–468 | Real header shifts are corrected; S15 feature withdrawal is a separate invalid substantive correction, not justified by the header shifts. | E33 |

Grade limits:

- FAIL rests on false source correction/loss of a relevant native mechanism, not on source-ID counts or failure to deploy.
- Most substantive critic corrections improve the final; one invalid limb remains consequential.
- No runtime, legal, billing, discount approval or actual station-fit proof is claimed or imputed.

## Original constraints and obligations

Both finals retain the following explicit constraints. The judgments above locate the particular O2/O5/O6 failures rather than silently substituting a different product brief:

- Nonprofit station; music and short spoken segments; two transmitters plus web stream
- Nine staff and rotating volunteer hosts in a small studio
- Advance show preparation and minutes-before-air local news changes
- $6,000 annual technology allowance; no in-house developer
- Program-visible track/clip clearance and restrictions
- Operator handoff without private listener dedication exposure
- Printed daily on-air log retained; post-print web-operator misses addressed
- Text labels as well as color; affected staff member included in acceptance
- Usually stable internet and manual interruption fallback
- Planning/handoff aid; no automated broadcast cutover
- Approver role, listener-request retention and differing-transmitter schedule shape remain undecided

O1 is substantively covered by distinct products and process/carrier approaches. O2 is covered by selected privacy/default/release/units investigation but retains the identified material defects. O3 has an actual relevant chain in each arm: N2’s Grist compare/access-rule evolution; N1’s LibreTime smart-fill chain, correctly conditional on optional arithmetic, with a separate playout chain expressly inapplicable. O4 covers every exact P1–P6. O5 has full authored prose and preserved choices, with N1’s specific supported mechanism loss and N2’s invalid critic premise recorded. O6 clearly separates source inspection from proposed runtime/user drills, with N2’s wrong-surface proposal independently demonstrated by code-path reasoning.

No runtime witness is silently counted as executed. N1’s V1/V2 have a synthetic canary and structure-grant contrast; V3 is feature-conditional; V4/V7 cover change visibility/reconciliation; V6 uses the affected staff member; V8/V9 use actual seat/row/event units. N2’s V1–V8 likewise use appropriate privacy, transition, paper-currentness, staff-task, fallback, purge, onboarding and break-layout outcomes. These are meaningful proposals, not measured station results. N2 V9 is specifically non-discriminating for its asserted advisory path. Neither candidate claims a code exit code or hash as scientific runtime acceptance.

## Primary source register and limits

Source IDs below are assessor IDs, distinct from candidate S/C/CR IDs. Exact access stamps, raw-byte hashes, selection boundaries, failures and frozen source inventory are saved in source-map.json. Bounded extracts are saved in primary-evidence.json.

| ID | Primary URL | Release / section | Operation |
|---|---|---|
| E01 | [primary source](https://support.getgrist.com/access-rules/) | Current unversioned/mutable public documentation; accessed_at retained | Bounded read-only inspection |
| E02 | [attempted locator](https://api.github.com/advisories/GHSA-3v78-cw58-v685) | No positive fact established | HTTP Error 404: Not Found |
| E03 | [attempted locator](https://api.github.com/advisories/GHSA-qh95-2qv8-pqx3) | No positive fact established | HTTP Error 404: Not Found |
| E04 | [primary source](https://api.github.com/repos/gristlabs/grist-core/releases/tags/v1.7.20) | grist-core v1.7.20, published 2026-09-28; undo fix commit994ff298 | Bounded read-only inspection |
| E05 | [primary source](https://api.github.com/repos/gristlabs/grist-core/releases/tags/v1.7.9) | grist-core v1.7.9, published 2026-01-09 | Bounded read-only inspection |
| E06 | [primary source](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/app/server/lib/ActiveDoc.ts) | grist-core tag v1.7.20; raw response SHA-256 retained | Bounded read-only inspection; superseded extract |
| E07 | [primary source](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/README.md) | grist-core tag v1.7.20; raw response SHA-256 retained | Bounded read-only inspection; superseded extract |
| E08 | [primary source](https://support.getgrist.com/install/authentication-overview/) | Current unversioned/mutable public documentation; accessed_at retained | Bounded read-only inspection |
| E09 | [primary source](https://nocodb.com/docs/product/integrations/data-sources) | Current unversioned/mutable public documentation; accessed_at retained | Bounded read-only inspection |
| E10 | [attempted locator](https://baserow.io/user-docs/trash) | No positive fact established | HTTP Error 404: Not Found |
| E11 | [primary source](https://www.getgrist.com/pricing/) | Current unversioned/mutable public documentation; accessed_at retained | Bounded read-only inspection |
| E12 | [primary source](https://baserow.io/pricing) | Current unversioned/mutable public documentation; accessed_at retained | Bounded read-only inspection |
| E13 | [primary source](https://baserow.io/user-docs/field-level-permissions) | Current unversioned/mutable public documentation; accessed_at retained | Bounded read-only inspection |
| E14 | [primary source](https://baserow.io/user-docs/application-builder-element-visibility) | Current unversioned/mutable public documentation; accessed_at retained | Bounded read-only inspection |
| E15 | [primary source](https://api.github.com/repos/libretime/libretime/pulls/3026) | LibreTime PR3026; merged2024-06-05; merge2b43e51ed140bf307e491f0fcb7b84f95709d604 | Bounded read-only inspection |
| E16 | [primary source](https://raw.githubusercontent.com/libretime/libretime/4.5.0/CHANGELOG.md) | LibreTime tag4.5.0 CHANGELOG; 4.2.0/4.3.0/4.5.0 entries | Bounded read-only inspection |
| E17 | [primary source](https://www.azuracast.com/docs/user-guide/playlists/) | Current unversioned/mutable public documentation; accessed_at retained | Bounded read-only inspection |
| E18 | [primary source](https://www.azuracast.com/docs/getting-started/requirements/) | Current unversioned/mutable public documentation; accessed_at retained | Bounded read-only inspection |
| E19 | [primary source](https://libretime.org/docs/admin-manual/install/) | LibreTime Stable4.x documentation edition, mutable page | Bounded read-only inspection |
| E20 | [primary source](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) | WCAG2.2 Understanding1.4.1, informative interpretation of the criterion | Bounded read-only inspection |
| E21 | [primary source](https://www.rivendellaudio.org/) | Current unversioned/mutable public documentation; accessed_at retained | Bounded read-only inspection |
| E22 | [primary source](https://forum.spinitron.com/t/calendar-concepts/172.json) | Spinitron product-maintained forum post2020-06-07; no release identity | Bounded read-only inspection; superseded extract |
| E23 | [primary source](https://support.google.com/docs/answer/11468464?hl=en) | Current unversioned/mutable public documentation; accessed_at retained | Bounded read-only inspection |
| E24 | [primary source](https://baserow.io/user-docs/subscriptions-overview) | Current unversioned/mutable public documentation; accessed_at retained | Bounded read-only inspection |
| E25 | [primary source](https://libretime.org/docs/user-manual/scheduling-shows/) | LibreTime Stable4.x documentation edition, mutable page | Bounded read-only inspection |
| E26 | [primary source](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/app/server/lib/ActiveDoc.ts) | grist-core tag v1.7.20; raw response SHA-256 retained | Bounded read-only inspection |
| E27 | [primary source](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/app/server/lib/uploads.ts) | grist-core tag v1.7.20; raw response SHA-256 retained | Bounded read-only inspection |
| E28 | [primary source](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/README.md) | grist-core tag v1.7.20; raw response SHA-256 retained | Bounded read-only inspection |
| E29 | [primary source](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/app/server/lib/ProxyAgent.ts) | grist-core tag v1.7.20; raw response SHA-256 retained | Bounded read-only inspection |
| E30 | [primary source](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/app/server/lib/Requests.ts) | grist-core tag v1.7.20; raw response SHA-256 retained | Bounded read-only inspection |
| E31 | [attempted locator](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/app/common/DocCalls.ts) | No positive fact established | HTTP Error 404: Not Found |
| E32 | [primary source](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/app/client/components/DocComm.ts) | grist-core tag v1.7.20; raw response SHA-256 retained | Bounded read-only inspection |
| E33 | [primary source](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/README.md) | grist-core tag v1.7.20; raw response SHA-256 retained | Bounded read-only inspection |
| E34 | [primary source](https://github.com/gristlabs/grist-core/security/advisories/GHSA-qh95-2qv8-pqx3) | GHSA-qh95-2qv8-pqx3 advisory identity; response at access time | Bounded read-only inspection |
| E35 | [primary source](https://github.com/gristlabs/grist-core/security/advisories/GHSA-3v78-cw58-v685) | GHSA-3v78-cw58-v685 advisory identity; response at access time | Bounded read-only inspection |
| E36 | [primary source](https://nocodb.com/docs/changelog/2026.04.2) | NocoDB release2026.04.2; Record Trash availability/deployment exceptions | Bounded read-only inspection |
| E37 | [primary source](https://baserow.io/user-docs/data-recovery-and-deletion) | Current unversioned/mutable public documentation; accessed_at retained | Bounded read-only inspection |
| E38 | [attempted locator](https://www.azuracast.com/docs) | No positive fact established | HTTP Error 403: Forbidden |
| E39 | [primary source](https://baserow.io/user-docs/set-permission-level) | Current unversioned/mutable public documentation; accessed_at retained | Bounded read-only inspection |
| E40 | [primary source](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/app/server/lib/outgoingRequests.ts) | grist-core tag v1.7.20; raw response SHA-256 retained | Bounded read-only inspection |
| E42 | [primary source](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/app/server/lib/Requests.ts) | grist-core tag v1.7.20; raw response SHA-256 retained | Bounded read-only inspection |
| E43 | [attempted locator](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/app/client/components/ImportSourceElem.ts) | No positive fact established | HTTP Error 404: Not Found |
| E44 | [primary source](https://support.google.com/docs/answer/9331279?hl=en) | Current unversioned/mutable public documentation; accessed_at retained | Bounded read-only inspection |
| E45 | [primary source](https://tiddlywiki.com/static/GettingStarted.html) | Current unversioned/mutable public documentation; accessed_at retained | Bounded read-only inspection |
| E46 | [primary source](https://raw.githubusercontent.com/gristlabs/grist-core/v1.7.20/app/server/lib/DocApi.ts) | grist-core tag v1.7.20; raw response SHA-256 retained | Bounded read-only inspection |
| E47 | [primary source](https://support.getgrist.com/conditional-formatting/) | Current unversioned/mutable public documentation; accessed_at retained | Bounded read-only inspection |
| E48 | [primary source](https://github.com/LibreTime/libretime/pull/3160) | LibreTime PR3160; merged2025-06-08; d7987bb; release4.5.0 | Bounded read-only inspection |
| E49 | [primary source](https://forum.spinitron.com/t/calendar-concepts/172.json) | Spinitron product-maintained forum post2020-06-07; no release identity | Bounded read-only inspection |

## Comparison, scope and lifecycle

Both final artifacts are scientifically assessable and both receive source-grounded FAIL, for different defects. N2 retains a wrong selected-release validation surface/default investigation. N1 retains a false native-feature evidence withdrawal. These are not equivalent failure profiles, and neither is a validated quality or faster-FAIL speed win. N1 keeps broader cost/option/event-conditioned pilot substance; N2 keeps a more directly selected Grist security-release chain. No controlled method-level or speed ranking follows from this one pair.

- Assessment covers the complete authored finals, frozen stages, all six axes, every P disposition and consequential source/applicability/critique conclusions at original-brief scope.
- Relevant source sections and stable release symbols were inspected; this is not a full repository, vulnerability, rights, deployment or station-operation audit.
- All station/user/runtime validations are proposed. External station decisions, jurisdiction, procurement eligibility, actual seats/costs and recovery behavior remain unknown.
- The N2 AzuraCast beta lead is bounded by retained source and an explicit re-check gate; independent root-doc refresh returned403. Optional unselected fallback details remain preliminary rather than silently promoted.
- Startup preceded the first observed UTC sample; evaluation_started_at is that first sample, not a reset of the fixed assignment deadline.

First observed evaluation time: 2026-10-09T20:52:52Z. Scientific save/completion timestamp: 2026-10-09T21:06:18.874163+00:00. Fixed assignment deadline: 2026-10-09T21:17:37.829108+00:00.

The actual native Goal was created and observed active through supported tools. This report and its JSON/source-map/evidence files are saved before terminal completion; no handwritten Goal receipt is manufactured. Terminalization follows mechanical verification, and no scientific work follows it. Unknown candidate/native/T3/timing/cost observations remain null.

