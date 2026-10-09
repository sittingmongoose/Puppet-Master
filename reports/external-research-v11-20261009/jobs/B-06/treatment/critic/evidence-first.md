# I06 independent evidence-first baseline

Captured before opening any predecessor draft, discovery note, or revealed plan. Basis: the exact I06 brief and the primary-source observations indexed in source-map.json. This is the critic's independent pre-draft understanding; it is not a final architecture decision.

## Brief facts to preserve

- A nonprofit community radio station has nine staff and rotating volunteer hosts, two transmitters, and a web stream.
- Shows may be assembled days ahead; local news inserts can change minutes before airtime.
- Annual technology allowance: $6,000; no in-house developer.
- Users need to see clearance state for a program, record restrictions on a track or spoken clip, and hand the show to the next operator.
- Private listener dedications must not be exposed through that handoff.
- A printed on-air log is in use; changes after printing are sometimes missed by the web-stream operator.
- Status must use text labels as well as color for a staff member with limited color perception.
- Internet is usually stable; a manual fallback is wanted for transmission interruptions.
- This is a planning and handoff aid, not an automated broadcast system.
- Management has not decided who approves edits to clip-usage notes, listener-request retention duration, or whether one schedule should cover both transmitters despite different local breaks. These remain decisions, not defaults for an implementer to silently select.

No jurisdiction, music-rights regime, identity provider, existing data platform, device inventory, procurement constraints, or retention policy is specified. I therefore make no legal/compliance conclusion and no total-cost or vendor-plan claim from this brief alone.

## Independently discovered solution families

### Shared spreadsheet with disciplined print/handoff practice

Google Sheets documents browser-local offline edits that are sent to Google when connectivity returns; it also documents per-file version history showing who changed a spreadsheet and when (see GS-OFFLINE and GS-HISTORY). This gives a low-infrastructure comparison point and can tolerate some temporary connectivity loss after the sheet is available locally. It does not establish reliable multi-operator conflict handling, delivery of unsynced revisions to a second station operator, or offline access on unprepared devices. A print/export could still go stale, so any such option would need a visible generated-at/revision stamp, a clear source-of-truth rule, and a paper delta/phone/radio procedure. Those workflow controls are recommendations, not verified Sheets features.

### General-purpose low-code table plus role-restricted app surface

Baserow Application Builder documents role-sensitive page/element visibility and states that a hidden table component's data is not returned through the browser API for that user; field-level permissions separately govern editing, and API writes respect those restrictions. Its docs distinguish hidden/view presentation from edit permissions (BR-APPVIS, BR-FIELDS). That makes a low-code database/app a meaningful alternative to a spreadsheet, but it would still require an owner to design, configure, test and maintain the schema, roles, authentication, backups and updates. Field-level permission controls edit access, not confidentiality of a value that the user can otherwise read; sensitive dedications should be in a separately access-restricted store or excluded from the schedule/handoff data. Direct row-history retrieval was attempted but timed out; I make no retention-duration claim based on it.

### Radio-specific schedule and playout products

Spinitron's product-maintained forum describes a show as a program with owners and schedule, an occurrence as a playlist, and its logged-in schedule as distinct from public calendar/playlist pages (SP-SCHEDULE). This is a useful radio-domain ontology to compare against a plain event list, but the source does not demonstrate per-transmitter local breaks, clearance/restriction fields, private handoff, or offline operation. It would need a fit check against the station's actual workflow and purchase terms before recommendation.

LibreTime Stable 4.x has a radio-native show calendar and track scheduler; its schedule UI handles repeat occurrences, time bounds and playlist duration, and the docs describe automatic show playback from the scheduled start/end (LT-SCHED). It directly demonstrates domain features but crosses the brief's manual-planning boundary by being broadcast/playout software. Its official v4.5.0 release (16 July 2025, tag commit f429339) records queue-on-restart, queue type, deadlock, invalid disconnect, and newline-metadata playout changes. PR #3160 shows a concrete regression/fix path: newline in title/artist metadata breaks the Liquidsoap telnet command, stopping a track; an author tested a local instance before/after, contributors discussed ingestion sanitization versus already-imported records, and the fix merged as d7987bb (LT-REL, LT-PR). This evidence is relevant as a risk/evolution example for playout software, not as evidence that the proposed planning aid has the same defect.

## Initial design implications (inferences, not source claims)

- Keep the planning/handoff system separate from audio ingest, scheduling queues that actually play, transmitter control and web-stream automation.
- Model a program/show separately from a dated airing/occurrence. Where breaks diverge, represent the two transmitter runs explicitly and allow shared show metadata, rather than assume one event is identical on both. This is a design inference from the brief and comparison with radio-domain ontology; management still must decide if one shared schedule can satisfy its needs.
- Treat a track or clip's usage decision as explicit, visible, and time/airing-contextual if the source facts require it; keep status labels textual with color as a redundant cue. Do not infer that clearance itself is approval or legal rights verification.
- Separate the public/program handoff payload from listener dedications. Do not invent a retention period or edit approver; flag both for management and design a way to withhold sensitive data until the policy decision is made.
- Make late edits visible to both transmitter operators and the web-stream operator with a revision/generated-at indicator. A printed artifact needs its own timestamp/revision and an agreed delta path after print; electronic sync is not a replacement for a manual outage procedure.
- A native, bespoke implementation could tailor these workflows, but the no-in-house-developer constraint makes ownership and maintenance a first-order fit question. A low-code product can reduce coding while still imposing configuration, account/role administration, subscription/self-hosting and operational duties.

## Validation questions to carry into plan comparison

1. Can an operator identify which dated airing, transmitter and stream a restriction applies to without treating an unconfirmed value as cleared?
2. Do late news changes appear in the same current view for each operator, and is a printed/offline copy visibly stale after a change?
3. Can a full handoff disclose restrictions and next actions while omitting listener dedications from the receiving operator's view/export/print/API payload?
4. Are all status states distinguishable by text alone and understandable without relying on color?
5. Does a no-internet / transmitter-interruption tabletop exercise show the manual fallback, record the last confirmed revision and avoid claiming that the planning aid controls transmission?
6. Can staff resolve differing transmitter break times without silent schedule drift or duplicating unrelated show metadata?

These are proposed discriminating checks only. No candidate implementation or runtime check has been performed.
