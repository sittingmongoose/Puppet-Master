# Independent critic review — A6-01 treatment

**Reviewed:** investigator discovery, draft, source map, revealed plan and plan-reveal record, plus the original brief and carried source index.  
**Boundary:** independent review of the released package and governing public evidence. No local timetable, partner feed, application, or product behavior was available or tested. This is a critique, not a replacement proposal.

## Overall assessment

The draft is substantially complete and corrects the revealed plan’s consequential assumptions. It compares a narrowly scoped board with an OTP-backed board, adds OneBusAway sign-mode as a useful discovery, and uses TransXChange/SIRI as an explicitly bus-profile-limited analogue. It keeps external requirements, local product choices, owner inputs and unrun validation apart. The source neighborhoods on GTFS identity/time, realtime matching/freshness, alert scope, OTP configuration/history, and SIRI profiles were reviewed together; the clauses inside each neighborhood were still checked separately.

I found no confirmed material-wrong claim in the independently checked passages. One material incompleteness remains: the current distinction and display implications for NEW and REPLACEMENT TripUpdates are named only at a high level and are missing from the proposed acceptance checks. Two smaller wording/decision points and one independently inaccessible historical discussion are recorded below.

## Findings

### C1 — Material incomplete: NEW and REPLACEMENT trip behavior

**Draft locator:** “Proposed board behavior and evidence — Realtime messages, freshness and schedule mismatch”; “Clause-by-clause disposition” obligation 2; “Validation plan and execution record — Partner message matching and semantics.”

The draft says TripUpdates can represent added or replacement trips, and its source-map entry for the revision history notes the May 2025 relationship clarifications. It does not resolve the current distinction for the proposed board or list it in the partner-sample checks. The current GTFS Realtime reference treats NEW as an extra trip unrelated to a static trip, requiring a unique trip identifier and stop updates with the prescribed stop identities, sequences and arrival/departure fields; REPLACEMENT identifies a static trip being replaced and also has required stop-update fields. The reference says producers still using the legacy ADDED value should migrate to NEW. These cases affect whether the board presents a new sailing, replaces an existing scheduled row, or suppresses an invalid/ambiguous update. They are not equivalent to a delayed scheduled trip. [S03, S07]

This is material incompleteness under brief obligations 2 and 8, not evidence that the operator publishes these relationships. The partner’s actual message types remain UNKNOWN. The release/change history and the actual partner samples should determine applicability; a sample check for NEW/REPLACEMENT should remain proposed until run.

### C2 — Minor wording: distinguish OTP feedId from message identity

**Draft locator:** “Validation plan and execution record — Partner message matching and semantics,” which proposes checking “feedId + trip/date/time + stop sequence as required.”

The rest of the draft correctly says OTP feedId is a static-dataset namespace and is distinct from feed_version. Keep that distinction in the acceptance wording too: feedId is OTP configuration/scoping for a static dataset and updater, not a GTFS-Realtime wire field or an additional TripDescriptor key. Then check trip/date/time and stop identity against the GTFS rules that apply to each message. This is a wording clarification; the draft elsewhere makes the distinction correctly. [S03, S15]

### C3 — Minor wording / owner input: advisory trigger boundary

**Draft locator:** “Optional staff advisory and authority” and the mismatch/stale fallback table.

The proposal preserves the brief’s authorized optional staff banner and keeps it separate from feed observations. It extends the suggested publishing triggers from machine-readable data being unavailable to data being stale, mismatched, or not encoding a useful notice. Those are sensible candidate meanings of unavailable/unusable, but remain duty-manager policy choices, not a technical capability established by the evidence. The draft’s owner-input section and optional framing largely make this clear. Retain the manager decision before treating those trigger cases as accepted scope. [brief; S03–S06]

### C4 — Honestly unresolved external input: PR #434 discussion details

**Draft locator:** “Relevant released history and operational scope,” item 1; source S08.

I independently confirmed the final December 2024 feed-version addition in the official GTFS Realtime revision history, and the official GTFS Digest confirms that PR #434 initially proposed both feed_version and GTFS_url. The GitHub PR discussion itself timed out in the browser review, so I could not independently re-check the draft’s more specific account of why the URL proposal was removed or the Swiss Open Data / TransSee implementation reports. Treat those details as supported by the investigator’s captured S08 record, but not independently corroborated in this critic pass. This does not undermine the core recommendation to treat the field as optional or the decision to confirm partner support. [S07, S08, S21]

### No confirmed material-wrong or unsupported finding

Among the passages rechecked, the main correction claims are supported: the Schedule reference defines service-day times above 24:00, the agency timezone and ferry route_type 4; the Realtime reference makes trip identity conditional on frequency/collision/service-date circumstances; best-practice freshness ages are recommendations, not a ferry guarantee; missing TripUpdates do not mean on-time; and alert selectors combine fields conjunctively while separate selectors express separate scopes. [S01, S03–S06]

The product and analogue caveats are also properly bounded. OTP is an API/backend candidate requiring a separate display; feedId is not a version; its reviewed configuration defaults and released fixes do not establish this operator’s behavior. OneBusAway’s moving README documents sign-mode and separate GTFS-RT endpoints, while the release page separately pins v2.7.1; this does not establish ferry compatibility. DfT’s concrete SIRI-VM guidance is BODS bus-profile evidence, while the draft labels it as an analogue and limits any use to a compatible partner profile. [S09–S20]

## Brief obligations and revealed-plan dispositions

| Brief obligation | Critic disposition |
| --- | --- |
| 1. Compare two routes and an analogous schedule/event mechanism | Satisfied: direct two-terminal board versus OTP plus a board client, with TransXChange/SIRI as an explicitly profile-limited analogue. OneBusAway is useful additional discovery, not falsely represented as a validated route. |
| 2. Explain static identity, realtime types, freshness and mismatch without invented departures | Mostly satisfied: the plan’s trip_id-only and “last received” assumptions are rejected; identity, no-update, NO_DATA, age and optional version handling are addressed. C1 identifies the missing NEW/REPLACEMENT implications/check. |
| 3. Group related conditions, preserve distinct semantics | Satisfied: static service_id/calendar, service date/time, agency timezone, repeated stops and alert selector scope remain distinct under shared source neighborhoods. |
| 4. Trace a released change/failure chain and identify governed operations/revisions | Satisfied with bounded applicability: feed-version linkage governs schedule/realtime revision association; OTP #6523 governs VehiclePositions replacement and #7445 static-version visibility. The #4058/#4066 release inclusion is explicitly unconfirmed. Exact PR #434 discussion detail is C4. |
| 5. Preserve optional staff advisory | Satisfied: kept optional and manager-authored, with a distinct provenance and proposed review/expiry policy. C3 keeps the expanded triggers owner-controlled. No evidence-based exclusion is claimed. |
| 6. Make owner decisions explicit | Satisfied: publisher, duty manager and regional partner responsibilities are stated, with unresolved feed, cutover, freshness and wording inputs preserved. |
| 7. Preserve negative constraints | Satisfied: no vessel dispatch, no ETA inferred from missing data, no Alert-to-TripUpdate conversion, and no staff advisory mislabeled as feed data. |
| 8. Deliver a coherent evidence-backed proposal and separate validation | Satisfied in structure and scope. Source/version applicability, alternatives, recommendations, open inputs and an executed-versus-proposed table are present. Product/feed/device checks remain NOT_RUN. C1 should be reflected in any later revision’s semantics and proposed checks. |

The revealed plan’s exact unsafe assumptions are not silently carried forward: the draft rejects trip_id-alone matching and indefinite last-message display; rejects treating all disruption messages as delays; restores service-day/time-zone/alert conditions; investigates version and consumer histories; preserves the optional advisory and the three owners; and repeats the binding negative constraints. It does not claim the revealed plan’s draft demos were executed product tests.

## Grouped-review method check

I read the shared governing neighborhoods in groups: Schedule identity/calendar/time and ferry type; Realtime FeedHeader/TripDescriptor/TripUpdate and alert scope; then OTP feed configuration/version/history; then the OneBusAway and DfT/OTP SIRI route evidence. Within each neighborhood I resolved each field’s condition independently rather than transferring one rule to another. For example, a non-frequency trip_id can identify a scheduled trip in ordinary cases, while service-date disambiguation and frequency-instance start_time remain separate conditions; Alert route-plus-stop matching is not TripUpdate identity.

A competent ordinary sequential review would walk obligations 1–8 in order and may reopen the same GTFS reference neighborhoods for obligations 2–4. Grouping reuses source reading and exact navigation; the clause-by-clause table retains the ordinary review’s obligation coverage and separate conclusions. No timing or quality benchmark was supplied, so this is a method contrast, not a measured efficiency claim. The investigator’s method statement and draft make the same appropriately qualified distinction.

## Validation status

- **Executed by this critic:** read the frozen package and carried source index; independently consulted the public primary-source neighborhoods listed in the accompanying source map. This validates claims about documents/release records only.
- **Not executed:** no ferry GTFS package, partner feed, selected product, UI, stale-feed simulation, revision cutover, or manager workflow was exercised. Nothing here establishes actual operator support or passenger-facing behavior.
- **Investigator-reported executed checks:** the draft reports its plan reveal helper and JSON parser run. I did not re-run them; they remain investigator-reported artifact operations, not product validation.
- **Proposed only:** the draft’s feed, timetable, candidate-product, freshness, alert-scope and staff-advisory acceptance checks.

## Native Goal record

One actual native Goal was created with the objective copied verbatim from the critic freeze. The create result returned threadId 01a12402-7c63-73d1-b249-882036b29d40 and status active. get_goal later directly returned active at 2026-10-10T04:14:44Z; native terminal completion was not yet observed when this critique was saved. Raw native fields and timestamp conversions/unknowns are preserved in source-map.json. The Goal was active before reading the brief and investigator package; no second Goal or delegated work was created.
