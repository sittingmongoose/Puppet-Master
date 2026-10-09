# I06 Research Discovery (pre-plan, from brief alone)

Block B-06 / control / case I06 / method M14 / stage research.
Brief: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/I06/brief.md` (read 2026-10-09).
Plan not read. `plan-root-only.md` NOT read. O4 comparison deferred until after freeze/reveal.
Discovery frozen before reveal; do not rewrite after reveal.
Access timestamps UTC 2026-10-09 ~20:26-20:32. Usage/billing unobserved: null.

## 0. Brief restatement (constraints + undecideds)

Nonprofit community radio: music + short spoken segments for two transmitters + web stream.
Nine staff + rotating volunteers, small studio. Some shows built days ahead; local news inserts change minutes before air.
$6,000/yr tech allowance, no in-house developer.
Must show what is cleared for a program, flag track/clip restrictions, hand show to next operator without exposing private listener dedications.
Current on-air log printed; post-print updates missed by web-stream operator.
Limited color perception: status needs labels as well as color.
Internet usually stable; want manual fallback for transmission interruptions.
Explicitly NOT automated broadcast; reliable planning + handoff aid suffices.
Undecided (user decisions, must preserve): (a) which role approves changes to clip usage notes, (b) how long listener requests retained, (c) one schedule vs split when transmitters' local breaks differ.

These undecideds are not gaps to fill silently; they are gating product decisions.

## 1. O1 — Useful unfamiliar tools/products + materially different approaches

All evaluated against: no-dev operability, $6k/yr, 9+volunteers onboarding, days-ahead vs minutes-before change, print/live sync, label+color, dedication privacy, manual fallback, non-automation scope.

### A. Grist (spreadsheet-database, access rules) — primary planning/handoff candidate
What: relational spreadsheet over SQLite, Python/Excel formulas, layouts, forms, API, self-hostable, Apache-2.0 core. Access rules down to table/column/row/cell, based on user attributes and cell values [S02,S03,S09].
Why unfamiliar/useful: gives spreadsheet familiarity volunteers already understand, plus real row-level privacy for dedications (unlike plain Sheets), version history, and self-host without license cost. Fits "planning aid, not automation."
Material difference vs thin plan assumption: permissioned views replace single printed log; print becomes derived snapshot with version stamp, not master.
Fit risks: needs SSO/login setup to make row rules meaningful; structure permission misconfig exposes data; history/compare endpoints had leak (see O3). No native broadcast clock.

### B. NocoDB / Baserow (Airtable alternatives) — compared alternative
What: spreadsheet-DB frontends. NocoDB: 6 view types free incl. Kanban/Calendar/Map, comments, bring-your-own DB (MySQL/Postgres/SQLite), Fair-Code Community (self-host internal OK, no managed resale). Baserow: app builder, undo/redo, trash 3-day, 50+ templates, GDPR-ready self-host, MIT open-core but views/permissions partly paywalled [S08].
Resources: NocoDB min ~1 vCPU/2GB; Baserow ~2 vCPU/4GB [S08].
Why considered: volunteer-friendly, more views than Grist out of box. Rejected as primary because granular permissions weaker/paywalled vs Grist row rules needed for dedications; NocoDB deletions permanent (no trash) risky for volunteer edits. Retain as fallback if Grist hosting unavailable.

### C. LibreTime (show/calendar-centric broadcast) — planning-only reuse, automation rejected
What: community fork of AirTime, AGPLv3, show- and calendar-centric scheduling, can feed transmitter/console + stream, web UI. Stable 4.x docs; Docker or installer; min 1 GHz, 1GB required/2GB recommended, static IP, ports 80/8000/8001/8002, firewall UFW guide [S06].
Why unfamiliar/useful: only candidate that models shows/blocks/log-to-playout natively. Could run in planning-only mode (schedule + library, manual playout) to get clock consistency for days-ahead vs minutes-before inserts.
Why not primary: brief explicitly declines automated broadcast; LibreTime brings Liquidsoap/Icecast ops burden no-dev team cannot carry; transmitter-feed setup exceeds $6k ops budget in staff time. Retain as optional growth path, not day-1.
Applicability: viable only if station later wants automation AND buys managed hosting.

### D. AzuraCast (multi-station web-radio suite) — stream-focused, rejected for planning core
What: Docker self-hosted "station in a box," multi-station, playlists, mount points, DJ/streamer roles, API, free, beta note to keep updated + backup media separately [S07].
Why considered: handles web-stream operator pain directly (now-playing API, mount/relay), multi-station maps to two transmitters+stream.
Why rejected as core: stream/automation-centric, not clearance/restriction/handoff planner; no dedication privacy model; beta + Docker VPS ops needs Linux comfort brief says absent. Retain as optional stream-side complement (read-only now-playing feed into planner), not planner itself.

### E. Rivendell (pro Linux automation) — heavy contrast, rejected
What: GPL Linux/MySQL/AudioScience, full acquisition/scheduling/playout/voicetrack/log, 3 logs per host, hardware integration, used by networks [S10].
Why noted: proves "full automation" ceiling; useful to bound scope. Rejected: requires Linux/audio plant skill, hardware, MySQL ops; opposite of no-dev $6k planner. Keep only as explicit non-goal to prevent scope creep.

### F. Paper-first structured handoff + manual fallback (non-software spine)
What: version-stamped printed rundown (show ID, version N, timestamp, from–to operator, cleared/restricted table with text labels, dedication redacted to "private — see planner"), plus verbal/read-back handoff checklist and transmission-interruption fallback card (who switches what, where spare log lives, how stream operator is phoned/messaged).
Why materially different: works when internet/power fails; volunteers already use print; zero marginal cost. Not a rejection of software: print is derived artifact, planner is master, stream operator gets push/phone on post-print change.
This directly addresses missed post-print updates without requiring automation.

Decision summary pre-reveal: primary A+F (Grist master + versioned print + manual fallback cards); B as fallback DB; C/D as stream/automation growth options; E as explicit non-goal.

## 2. O2 — Consequential code/defaults/limits/applicability (selected mechanisms)

### Grist access rules (dedication privacy + clearance)
- Granularity: table/column/cell/row; rules keyed on user attributes (incl. owner-defined roles) and cell values, e.g. boolean flag gates row [S02].
- Evaluation: top-to-bottom per group, order column rules → table rules → default rules; first matching rule wins per permission letter [S02 excerpt via skill summary, needs direct doc confirm — marked uncertain until custom-rules page fetched].
- `S` (structure) permission bypasses other restrictions because formulas aren't sandboxed from data; recommended default disables structure for non-owners. v1.7.9 intro screen creates that initial rule on "Enable Access Rules" [S03].
- Storage/formulas: SQLite tables, Python formula language; import CSV/Excel/JSON/Sheets, export same + .grist; webhooks, OIDC/SAML in free core self-host [S02,S09].
- Self-host: `docker run -p 8484:8484 -v ~/grist:/persist -it gristlabs/grist`, Apache-2.0, no license cost; teams/no row caps self-hosted (convenience vs savings tradeoff) [S09].
- Applicability to I06: dedications table with `is_private` flag + role `can_see_private`; clearance table with `status` label (`CLEARED`/`RESTRICTED`/`PENDING`) + `restriction_note`; approval role left as variable until (a) decided. Must enable rules from day 1; adding later leaves history exposed (see O3 workaround `/states/remove`).
- Limits: needs login/SSO to enforce; offline edit weak; print is point-in-time; history retains dedications unless purged — retention decision (b) must drive purge job.

### LibreTime scheduling/ops defaults
- Model: shows → schedule → playout; log-to-playout workflow for daypart consistency [S06 search context].
- Defaults: installer listen 8080 behind reverse proxy (4.0 breaking change); Nginx serves media via `storage.path`; Icecast mount charset UTF-8; replay_gain_modifier now system pref (4.1 upgrade note) [S06 changelog refs].
- Min: 1 GHz, 1GB/2GB, static IP, ports 80/8000/8001/8002 [S06]. Docker legacy volume `libretime_assets` must be deleted on 4.3 upgrade (tracked #3150) [S06].
- Applicability: planning-only reuse would ignore playout/liquidsoap, use calendar/shows/library. Cost: VPS + maintenance exceeds volunteer ops; no dedication ACL. Only if automation later wanted.

### AzuraCast ops defaults
- Docker recommended, VPS/dedicated/server install, multi-station single install, free + donations, beta: update often, keep media backed up second location [S07].
- Roles/permissions, station management, mount points, relays, SFTP, Liquidsoap customization exist but stream-centric; no clearance/usage-notes workflow [S07 nav].
- Applicability: stream-side now-playing/mount visibility for web operator; not clearance planner.

### NocoDB/Baserow limits
- Views/permissions paywall (Baserow), no trash/undo (NocoDB), resource mins above, Fair-Code vs MIT licensing [S08]. Applicability: acceptable if Grist rejected, but dedication privacy weaker.

### WCAG 1.4.1 Use of Color (label+color requirement) — governing default
- SC: "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element." Level A [S01].
- Intent: color-deficient, low-vision, mono/limited displays must get info via second mechanism (text label/shape) [S01].
- Pass patterns: label+color ("red Submit Order button"), label+position; light-green vs dark-red passes only if lightness contrast ≥3:1; inversion passes if contrast sufficient. Knowing green=valid vs red=invalid REQUIRES extra indicator regardless of contrast [S01].
- Applicability to I06: status column must be text (`CLEARED`/`RESTRICTED`/`PENDING`/`CHANGED-SINCE-PRINT`) + icon/shape, not color alone; print must remain legible in B&W; conditional formatting in Grist must set text label, not just cell fill. This is Level A, non-negotiable.

### Schedule scope (one vs split) — mechanism-neutral constraint
- No tool default resolves undecided (c). Single schedule with per-transmitter break columns vs two schedules is a user decision with operational cost: single risks missed local breaks; split risks divergence. Planner must support either via filtered views, not hardcode one.

## 3. O3 — Issue/fix/regression/release chain (at least one; others noted absent)

### Primary chain: Grist `/compare` history leak → 1.7.7 restriction → 1.7.9 hardening (directly relevant to dedication privacy)
- Issue: prior to 1.7.7, partial-read user could list version hashes and full diff between versions via `/compare`, receiving cells/columns/tables they lacked read access to. CVE-2025-64753, CVSS 6.5 MEDIUM, CWE-863 Incorrect Authorization, published 2025-11-13, last modified 2026-06-17 [S04].
- Fix: 1.7.7 restricts `/compare` to full-read users. Workarounds: purge sensitive history via `/states/remove`, or block `/compare` [S04]. Vendor advisory GHSA-3v78-cw58-v685 + release v1.7.7 cited in CVE references [S05, not directly fetched — cited-via-CVE].
- Hardening: v1.7.9 "Enable Access Rules" intro creates recommended rule disabling structure for non-owners; "Disable" shown when no custom rules; restricts who can view all data from viewing ACL config [S03 search excerpt + release page fetched].
- Later regression note: v1.7.20 "Access rule checks could miss an action that followed an undo in same request, incl. structure-edit check" fixed [S11 search excerpt, not directly fetched — uncertain, needs confirm].
- Relevance: station WILL store private dedications + clearance notes in same doc as volunteer-visible schedule. Without ≥1.7.7 + structure-off + history purge on retention expiry, volunteers could exfiltrate dedications via history/compare. This makes retention decision (b) a privacy control, not just storage hygiene.
- Absent/inapplicable: no LibreTime/AzuraCast/Rivendell issue chain investigated to same depth pre-reveal (time-boxed); LibreTime 4.3 Docker volume bug #3150 noted but not traced as fix chain. No evidence claimed where not fetched.

## 4. O5 pre-reveal — Alternatives/conditions/constraints/disagreement/uncertainty retained

- Retained alternatives: Grist primary; NocoDB/Baserow fallback; LibreTime planning-only growth; AzuraCast stream complement; Rivendell non-goal; paper-first spine mandatory regardless of software.
- Conditions: Grist only if ≥1.7.7, structure-off, SSO/logins, history purge tied to retention; LibreTime/AzuraCast only with managed host or volunteer Linux skill + backup; print only if version-stamped + change-push to stream operator.
- Original constraints preserved: $6k, no-dev, 9+volunteers, days-ahead + minutes-before, print→missed updates, label+color, manual fallback, non-automation, three undecideds.
- Disagreement: stream-operator sync could be push (message/phone) vs pull (live view); single vs split schedule unresolved; approval role unresolved — all require user decisions, not researcher fiat.
- Uncertainty: Grist rule-eval order + S-bypass from secondary excerpt (needs custom-rules doc confirm); v1.7.20 undo fix + GHSA details cited-via-search/CVE, not directly fetched; LibreTime planning-only UX untested; actual volunteer device/browser mix unknown; retention law (if any) for listener requests unknown — needs station counsel, not assumed.

## 5. O6 pre-reveal — Discriminating validations: executed vs proposed (no pretense)

Executed (this discovery, no runtime):
- Fetched and compared official docs/releases/CVE pages listed in source-map; observed install reqs, ports, access-rule semantics, WCAG SC text, CVE fix version. No code executed, no sandbox witness run. No Grist/LibreTime/AzuraCast instance launched.
- Searched release histories for access-rule and scheduling fixes; retained only what was observed.

Proposed (discriminating, small-scope, to run before build):
1. Dedication-leak test: create Grist doc with private row + partial user on ≥1.7.7, attempt `/compare` + history read as partial user; expect deny. Then test pre-1.7.7 behavior on throwaway to prove control matters. Fails if any private cell leaks.
2. Structure-bypass test: as non-owner without S, attempt formula referencing hidden column; expect deny/masked. Proves S-off default.
3. Print-vs-live sync drill: print vN, change news insert + restriction, verify stream operator gets push within 2 min and vN+1 stamp; measure miss rate over 5 drills. Fails if any post-print change lacks ack.
4. Label-only legibility: print status sheet in B&W + CVD simulator; volunteer with limited color perception identifies CLEARED/RESTRICTED/PENDING/CHANGED with 100% accuracy without asking color. Fails on any color-only cue.
5. Fallback drill: disconnect internet mid-show, run 30 min on paper + fallback card; verify handoff to next operator without dedication exposure. Fails if private data spoken/shown or break missed.
6. Retention purge: set 30/90-day retention candidates, run `/states/remove` + row delete, verify history no longer returns dedication text to partial user. Fails if tombstone/history leaks.
7. Volunteer onboarding: 2 rotating hosts with no training beyond 1-page guide create/find clearance + hand off; time-to-correct <15 min. Fails if needs dev help.
Scope note: small-product checks, not production guarantees; no load/HA/security audit claimed.

## 6. O4 — Deferred

Per-P disposition requires revealed plan. Not done pre-reveal. No plan text inferred here.
Next: freeze via reveal-plan.py, read revealed-plan.md, produce draft.md with exact per-P correction/optional/user-decision/already-covered/rejected/uncertain + retained findings/conditions/alternatives/validations.

---
Predeclared fallback note: this discovery.md is investigator evidence; draft.md after reveal is the complete planning deliverable for this scope. Short status cannot replace missing final.
