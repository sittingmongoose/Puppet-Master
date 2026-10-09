# I06 Research Draft — Planning deliverable (post-reveal, investigator)

Block B-06 / control / case I06 / method M14 / stage research.
Brief obligations O1–O6. Plan revealed after discovery freeze via `reveal-plan.py` (2026-10-09T20:27Z).
Discovery (`discovery.md` + `source-map.json` + `sources/`) frozen before reveal; not rewritten.
This `draft.md` is the complete planning deliverable for this scope; later stages may correct it.
Sources cited as S01–S11 from frozen `source-map.json`; prose below is self-contained (IDs do not replace text).
Usage/billing unobserved: null. No runtime witness executed; no sandbox run.

## 0. Product frame (constraints preserved)

Two transmitters + web stream; music + short spoken; 9 staff + rotating volunteers; days-ahead builds + minutes-before news changes; $6k/yr, no developer; clearance/restriction visibility; handoff without exposing private listener dedications; printed log currently misses post-print updates for stream operator; label+color for limited color perception; manual fallback for transmission interruptions; planning/handoff aid, NOT automated broadcast.
Undecided and preserved as user decisions: (a) role approving clip usage-note changes, (b) listener-request retention period, (c) one vs split schedule when local breaks differ.

Recommended spine (from discovery, retained): Grist permissioned planner as master + version-stamped derived print + push/phone to stream operator on post-print change + manual fallback cards. NocoDB/Baserow fallback. LibreTime/AzuraCast as optional growth/stream complements. Rivendell explicit non-goal. Paper-first mandatory regardless of software.

## 1. Exact per-P disposition

Disposition vocabulary: correction | optional enhancement | user decision | already-covered | rejected | uncertain.

### P1: "Provide a shared show schedule and operator handoff view for both transmitters and the web stream."
Disposition: already-covered with correction + optional enhancement.
- Already-covered: discovery primary (Grist master with role-filtered views) satisfies shared schedule + handoff. Print is derived snapshot (show ID, version N, timestamp, from→to operator), not master.
- Correction: "shared view" must NOT mean identical view for all. Volunteers/stream operator see redacted views (dedications masked to "private — see planner"); clearance table shows status labels. Single identical view would leak dedications and violate brief privacy. Master shared, views filtered by role + `is_private` flag.
- Correction: post-print push required. Shared live view alone does not fix missed updates; every post-print change triggers push/phone + version bump (vN→vN+1) with stream-operator ack. Measure miss rate.
- Optional enhancement: AzuraCast now-playing/mount feed as read-only complement in planner for stream operator (stream-side visibility). Not core planner; only if station already runs AzuraCast or buys managed host. Rejected as core (beta, Docker VPS ops, no clearance workflow).
- Conditions: logins/SSO from day 1; Grist ≥1.7.7; structure permission off for non-owners; history purge tied to retention (P5).
- Uncertain: volunteer device/browser mix; live-view refresh latency on studio hardware — needs onboarding drill.

### P2: "Track clearance status and restrictions at the track or clip level used in a show."
Disposition: already-covered with correction.
- Already-covered: clearance table at track/clip grain with `status` + `restriction_note` + `program_link` retained.
- Correction: status must be text labels `CLEARED` / `RESTRICTED` / `PENDING` (+ `CHANGED-SINCE-PRINT` overlay), never color alone; restriction note separate column; approval role left as variable until P5 decided. Schema must allow `approved_by_role = NULL (pending)` with deny-by-default for changes (non-approver edits stay `PENDING`). Do not default approval to "any staff."
- Rejected: color-only status; single free-text field mixing clearance + dedication (prevents redaction).
- Optional enhancement: LibreTime library/show reuse as growth path if station later wants clock-based scheduling. Rejected day-1 (automation ops exceeds no-dev $6k).
- Conditions: Grist access rules enforce row/cell visibility; ≥1.7.7 + structure-off or dedications leak via history/compare (see §3).
- Uncertain: music licensing rules governing "cleared" undefined in brief — planner tracks station's assertion, not legal truth. Needs station policy input.

### P3: "Preserve a printable daily log and a manual fallback for transmission interruptions."
Disposition: already-covered with correction + optional enhancement.
- Already-covered: version-stamped printed daily log + fallback card retained as mandatory spine.
- Correction: print is derived, not master. Each print carries version N, timestamp, program range, clearer/restricted table with text labels, dedication redacted, "superseded by vN+1" rule. Post-print changes invalidate prior print; stream operator must ack new version. Paper-only without version/push reproduces current miss bug.
- Correction: fallback covers transmission interruption (internet/power) AND planner outage: who switches what, where spare log lives, how stream operator is contacted (phone/message tree), 30-min paper run procedure, handoff read-back without speaking private dedications aloud.
- Optional enhancement: pre-printed blank insert slips for minutes-before news changes (structured fields: time, clip ID, clearance, initials).
- Conditions: B&W-legible; redaction enforced at print-template level, not operator discipline.
- Validation-linked: print-vs-live sync drill + fallback drill (§4).

### P4: "Use text labels with status cues so operators do not rely on color alone."
Disposition: already-covered with correction (mandatory, not nice-to-have).
- Already-covered: label+color design retained.
- Correction: must meet WCAG 2.2 SC 1.4.1 Level A: "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element." Light-vs-dark passes only if lightness contrast ≥3:1; knowing green=valid vs red=invalid requires extra indicator regardless of contrast. Grist conditional formatting must set text/icon, not just cell fill. Print must pass in B&W + CVD simulation with 100% volunteer accuracy.
- Rejected: color-only badges, red/green dots without words, legends that require color discrimination.
- Conditions: status vocabulary fixed (`CLEARED/RESTRICTED/PENDING/CHANGED-SINCE-PRINT`); icons redundant with words; templates tested with limited-color-perception staff member.
- Uncertain: none on requirement (Level A, non-negotiable); only implementation detail (which icon set) open.

### P5: "Approval authority for usage-note changes and retention of listener requests are station decisions."
Disposition: user decision (preserved, must not be filled by researcher).
- Approval role: station chooses which role approves usage-note changes. Planner holds `approved_by_role` variable + `PENDING` state until decided. Interim safe default: deny-by-default (edits by non-approvers stay pending, visible as pending, not applied as cleared). Do not default to "station manager" or "any host" silently.
- Retention: station chooses how long listener requests retained. Planner must implement chosen period as purge job: row delete + history purge (`/states/remove` equivalent) + verify partial user cannot recover via history/compare. Interim safe default: minimal retention (shortest candidate station tolerates) + purge, because history leak (CVE-2025-64753) makes retention a privacy control.
- Optional enhancement (not decision): propose 30/90-day candidates for station to test in retention-purge validation; station picks or names another.
- Conditions: retention decision drives engineering (purge cadence, backup rotation); approval decision drives Grist role mapping. Both recorded with date/decider.
- Uncertain: whether any law/grant requires minimum/maximum retention — needs station counsel, not assumed. No legal advice given.

### P6: "Whether differing local breaks need separate schedules is not settled."
Disposition: user decision + uncertain (preserved).
- Not settled: planner must be mechanism-neutral. Support BOTH via filtered views/columns, not hardcoded single or split: (i) single schedule with per-transmitter break columns (`TX1_break`, `TX2_break`, `shared`), or (ii) two schedules with shared-program link. Prototype both for station to choose; do not force one to satisfy P1 "shared view."
- Correction to P1 reading: shared master does not imply single schedule. Shared master with per-TX filtered views satisfies P1 under either P6 outcome.
- Rejected: hardcoding single schedule (risks missed local breaks) or hard split (risks divergence) before station decides.
- Conditions: whichever chosen, break rows carry text labels + owner (which TX), and stream operator view shows which breaks air on stream vs TX-only.
- Uncertain: operational cost of each (miss rate, volunteer confusion) — needs break-miss drill comparing both prototypes.
- User decision required: station picks single vs split after drill, or defers with explicit revisit date.

## 2. Retained findings (O1–O2 summary, self-contained)

- Grist: relational spreadsheet over SQLite, Python/Excel formulas, layouts/forms/API/webhooks, OIDC/SAML + row/col access control in free self-host core, Apache-2.0 no license cost, Docker single image `gristlabs/grist` on 8484 with `/persist`. Access rules to table/column/row/cell on user attributes + cell values. Recommended default disables structure (`S`) for non-owners because formulas aren't sandboxed; v1.7.9 intro creates that rule. Evaluation order column→table→default, first-match-wins per permission (secondary excerpt, needs custom-rules doc confirm — uncertain). Fits $6k/no-dev/volunteer spreadsheet familiarity + dedication privacy. Needs logins, ≥1.7.7, history purge.
- NocoDB/Baserow: volunteer-friendly alternatives. NocoDB 6 views free + comments + bring-your-own DB, Fair-Code (self-host internal OK), no trash (deletions permanent), min ~1vCPU/2GB. Baserow app builder/undo/trash-3day/templates, MIT open-core but views/perms partly paywalled, min ~2vCPU/4GB. Weaker/paywalled row privacy vs Grist; retain as fallback if Grist hosting unavailable.
- LibreTime Stable 4.x: AGPLv3 fork of AirTime, show/calendar-centric, feeds transmitter/console + stream, Docker/installer, min 1GHz 1GB/2GB static IP ports 80/8000/8001/8002, firewall guide. Breaking notes: 4.0 listen 8080 + Nginx `storage.path`; 4.1 replay-gain system pref; 4.3 delete `libretime_assets` volume (bug #3150). Planning-only reuse possible but automation ops exceeds brief; retain as growth path only.
- AzuraCast: Docker multi-station web-radio suite, free, beta (update often, backup media second location), VPS/dedicated install, roles/mounts/relays/SFTP/Liquidsoap. Stream-centric, no clearance/dedication workflow; retain as optional stream complement, rejected as planner core.
- Rivendell: GPL Linux/MySQL/AudioScience full automation (acquisition/scheduling/playout/voicetrack, 3 logs/host, hardware integration). Needs Linux plant skill + hardware. Explicit non-goal to bound scope.
- WCAG 1.4.1 Level A: color never sole means; label/shape required; 3:1 lightness rule; valid/invalid needs indicator regardless. Governs all status displays + print.
- Paper spine: version-stamped derived print + handoff checklist + fallback card + insert slips. Zero marginal cost, works offline, mandatory.

## 3. Issue/fix chain retained (O3)

Grist `/compare` history leak → 1.7.7 restriction → 1.7.9 hardening. Before 1.7.7, partial-read user could list version hashes + full diff via `/compare`, receiving cells/columns/tables they lacked access to (CVE-2025-64753, CVSS 6.5 MEDIUM, CWE-863, published 2025-11-13, modified 2026-06-17). Fixed in 1.7.7 by restricting `/compare` to full-read users; workarounds purge history via `/states/remove` or block `/compare`. v1.7.9 adds Enable-Access-Rules intro creating disable-structure-for-non-owners + restricts ACL-config visibility. Later note (unconfirmed, search-excerpt): v1.7.20 fixes access-rule miss on action-after-undo incl. structure check — needs direct fetch. Relevance: dedications + clearance live in same doc as volunteer schedule; without ≥1.7.7 + S-off + retention purge, volunteers exfiltrate dedications via history. No LibreTime/AzuraCast/Rivendell chain traced to same depth (time-boxed); LibreTime #3150 volume bug noted only. No evidence claimed where not fetched.

## 4. Validations: executed vs proposed (O6, discriminating, small-scope)

Executed (investigator, no runtime, honest):
- Read brief + froze discovery before reveal; fetched official docs/releases/CVE pages in source-map; compared install reqs/ports/access-rule semantics/WCAG SC/CVE fix. No code executed, no instance launched, no sandbox witness. No proposal presented as run.

Proposed (must run before build; each maps to P clauses; pass/fail discriminates):
1. Dedication-leak (P1,P2,P5): Grist ≥1.7.7 doc with private row + partial user; attempt history + `/compare` as partial; expect deny/masked. Repeat purge-after-retention; expect no recovery. Fail on any private cell leak.
2. Structure-bypass (P1,P2): non-owner without S attempts formula referencing hidden column; expect deny/masked. Proves S-off default.
3. Print-vs-live sync (P1,P3): print vN, change news insert + restriction, verify stream-operator push + ack within 2 min and vN+1 stamp; 5 drills, zero misses. Fail on any unacked post-print change.
4. Label-only legibility (P4,P3): B&W print + CVD simulator; limited-color-perception staff identifies all statuses 100% without color cues. Fail on any color-only cue.
5. Fallback drill (P3,P1): offline 30-min paper run + handoff; verify no dedication exposure (spoken/shown) and no break missed. Fail on exposure or miss.
6. Retention purge (P5,P2): apply 30/90-day candidates, delete + `/states/remove`, verify partial user cannot recover dedication via history/compare. Fail on tombstone/history leak.
7. Onboarding (P1,P2,P6): 2 rotating hosts, 1-page guide only, find clearance + hand off + handle TX-break variant; <15 min to correct, no dev help. Fail if dev needed. Run under both single and split prototypes to inform P6.
8. Break-miss comparison (P6,P1): same week under single-with-TX-columns vs split schedules; count missed/wrong local breaks + volunteer confusion reports. Station picks winner or defers with date.
Scope: small-product checks, not production guarantees; no load/HA/full-security audit.

## 5. Alternatives/conditions/disagreement/uncertainty (O5 retained)

- Alternatives retained: §2 all six (Grist primary+F spine; NocoDB/Baserow fallback; LibreTime growth; AzuraCast complement; Rivendell non-goal). No alternative silently dropped.
- Conditions: Grist only if ≥1.7.7 + S-off + SSO/logins + purge; LibreTime/AzuraCast only with managed host or Linux skill + backups; print only if versioned + push + redacted; retention/approval/schedule-scope only per station decisions.
- Constraints preserved: $6k, no-dev, 9+volunteers, days-ahead + minutes-before, label+color, manual fallback, non-automation, three undecideds.
- Disagreement preserved: push vs pull for stream sync (recommend push+ack, but station may prefer live-view pull — drill decides); single vs split (P6 drill decides); approval/retention values (station decides).
- Uncertainty preserved: Grist rule-eval order + S-bypass + v1.7.20 undo fix + GHSA details need direct-fetch confirm; LibreTime planning-only UX untested; volunteer devices unknown; retention law unknown; music-clearance policy undefined. Each marked where used; none presented as fact.

## 6. What later stages may correct

- Confirm uncertain Grist semantics via custom-rules + GHSA + v1.7.20 direct fetches; adjust rules/wording if order differs.
- Record station decisions for P5/P6 with date/decider; remap roles/purge/schedule views accordingly.
- Run §4 proposals; revise print template, fallback card, onboarding guide from drill results.
- Do not weaken privacy (dedication redaction, ≥1.7.7, S-off, purge) or accessibility (WCAG 1.4.1) to simplify build.

---
Predeclared fallback: this draft.md is the complete investigator deliverable. Short status cannot replace it. Discovery frozen; critic/reviser stages correct this draft, not discovery.
