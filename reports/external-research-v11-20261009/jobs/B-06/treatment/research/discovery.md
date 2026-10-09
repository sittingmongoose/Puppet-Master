# I06 Discovery — Community radio planning & handoff aid (brief-alone, pre-reveal)

Case: I06 | Block B-06 / treatment / research | Method M14 (Muse retained investigator)
Brief: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/I06/brief.md`
Plan status at writing: NOT read. `plan-root-only.md` was not opened before this file and
`source-map.json` were saved. All findings below derive from the brief alone plus independently
chosen public primary sources listed in `source-map.json` with retained evidence in `sources/`.

## 1. Brief-derived constraints (the contract the plan must satisfy)

C1. Outputs: two terrestrial transmitters + one web stream. Local breaks may differ between
transmitters; management undecided whether one schedule covers both (open decision D3).
C2. People: 9 staff + rotating volunteer hosts, one small studio. High turnover, low training
budget, no in-house developer. Any solution must be operable by non-developers after install.
C3. Time horizons: programs assembled days ahead AND local news inserts change minutes before
airtime. The tool must handle both advance planning and last-minute mutation without losing the
web-stream operator (current failure: printed log goes stale, web operator misses updates).
C4. Money: $6,000/yr technology allowance all-in. Rules out per-seat SaaS at scale, broadcast
automation hardware, and anything needing paid ops.
C5. Content governance: hosts must see what is cleared for a program; must be able to note a
restriction on a track/spoken clip; role that approves changes to a clip's usage notes is
UNDECIDED (open decision D1). So usage-notes need an approval workflow with a placeholder role.
C6. Privacy: handoff to next operator must NOT expose private listener dedications. Requires
role/field-level redaction, not just a shared printout. Listener-request retention period is
UNDECIDED (open decision D2) — retention must be a configurable policy, not hard-coded.
C7. Accessibility: status display must use labels as well as color (staff member with limited
color perception). This is WCAG 1.4.1 territory, not a nice-to-have.
C8. Resilience: internet usually stable, but station wants a manual fallback for transmission
interruptions. Not full offline automation — a manual fallback (paper/print/export + procedure).
C9. Explicit non-goal: NOT an automated broadcast system. Reliable planning + handoff aid is
enough. Full automation suites (Rivendell, LibreTime playout, AzuraCast AutoDJ) are therefore
applicability-constrained: their planning/scheduling/permission ideas may transfer, but
recommending a playout cutover contradicts the brief.
C10. Three open user decisions that must stay open: D1 approver role for usage-note changes,
D2 listener-request retention, D3 one schedule vs per-transmitter schedules.

## 2. O1 — Independently discovered tools, products, materially different approaches

Seven candidates were investigated from primary docs/code. None was named by the brief.

### A. Grist — open-source relational spreadsheet-database with granular access rules (FINDING F1)

What it is: a self-hostable or SaaS "relational spreadsheet" where one document holds multiple
linked tables (Programs, Segments, Clips, Restrictions, Dedications, Handoffs). Primary sources:
grist-core README, hosted access-rules docs, pricing, limits, self-managed docs.
Why it fits: (a) access rules can hide the private Dedications table/columns from handoff
viewers while showing the rest of the show; (b) no-code formulas + reference columns + card/
calendar views suit non-developers; (c) Community Edition is $0 self-hosted and the vendor
offers a free activation key for organisations under $1M annual income, squarely covering a
nonprofit station; (d) SaaS Pro at $8–10/user/mo is arithmetically within $6k/yr for 9 staff
(9 × $10 × 12 = $1,080/yr) with headroom for volunteers as viewers, but per-user scaling and
record caps need checking (see O2).
Material difference vs a shared spreadsheet: row/column-level deny rules + structure-permission
separation, which plain Sheets/Excel cannot enforce.

### B. Baserow — open-source no-code database, SaaS or self-host (FINDING F2, alternative)

What it is: comparable to Grist/NocoDB/Airtable: workspaces, tables, grid/calendar/kanban views,
API, automations. Primary source: Baserow pricing page.
Why considered: second source for cost/limit calibration and a fallback if Grist access-rule
complexity proves too much. Governing limits differ in kind (rows per *workspace*, not per
document) and role-based permissions sit in higher tiers (see O2). SaaS Premium $10/user/mo
billed yearly ($12 monthly) for 50k rows/workspace; Advanced $18/$22 with 250k rows. For 9 users
this is $1,080–$2,376/yr before volunteers — inside $6k but tighter than Grist Community $0.
Applicability caveat: the row-per-workspace unit punishes a single workspace holding years of
logs; would need a retention/archival policy (ties to D2).

### C. LibreTime — community fork of AirTime, schedule-oriented radio station suite (FINDING F3)

What it is: web-interface schedule + library + playout (Liquidsoap) for online/terrestrial radio.
Primary sources: README, install docs, user-manual index, CHANGELOG through 4.5.0 (2025-07-16).
Why investigated: the only candidate whose domain model is literally "shows, playlists, smart
blocks, calendar, playout history". Smart blocks (rule-filled blocks, e.g. "time remaining in
show") and the show calendar directly address advance assembly + last-minute inserts.
Why constrained: the brief explicitly declines automated broadcast. LibreTime's install burden
(dedicated host, static IP, open ports 80/8000/8001/8002, 1–2 GB RAM) and operator skill
(Linux install, Liquidsoap, upgrades) exceed "no in-house developer" unless a managed host is
bought — which then consumes the $6k. Recommended disposition: borrow the *planning concepts*
(calendar, clearance/restriction flags, smart-fill semantics) and the cautionary scheduling-accuracy
evidence (see O3), but do NOT recommend a LibreTime playout cutover for this scope.

### D. AzuraCast — self-hosted web-radio management suite, Docker, multi-station (FINDING F4)

What it is: Docker-delivered stack (Icecast/SHOUTcast, Liquidsoap AutoDJ, web UI + API) managing
multiple stations from one install. Primary sources: README (main), requirements docs,
roles-and-permissions doc, playlists docs.
Why investigated: (a) only candidate with an explicit multi-station + per-station-vs-global
permission split, directly analogous to two transmitters + web stream (D3); (b) playlist
priorities + scheduled/time-block playlists + "play between date range" are a second independent
model of last-minute vs advance scheduling; (c) role-based ACL (Users → Roles → Permissions,
global or per-station) is a second model for the dedications-privacy requirement.
Why constrained: same non-goal as LibreTime — it is a broadcast stack (min 2 GB RAM/20 GB disk,
recommended 4 cores/4 GB/40 GB for 5–10 stations; needs Linux-shell install competence). Its
*permission and multi-output* design transfers to the planning aid; its AutoDJ/playout does not.
Also note: AzuraCast disclaims music-license/royalty responsibility — clearance tracking remains
the station's job, reinforcing C5.

### E. Rivendell — full GPL broadcast automation (FINDING F5, investigated and rejected for build)

What it is: complete radio automation (acquisition, scheduling, playout, voicetracking, logs),
current production v4.5.0, Ubuntu 22.04 appliance installer, dedicated workstation, up to three
automation logs per machine. Primary source: rivendellaudio.org home.
Why rejected: maximum capability, maximum mismatch. Requires dedicated hardware, pro audio
adapters (AudioScience/JACK), and broadcast-engineering skill; it IS the automated broadcast
system the brief declines. Retained as a documented rejection so a later "why not Rivendell?"
has an answered, evidenced reason. Its one transferable idea: per-log operation (up to 3 logs
per machine) as precedent for per-transmitter logs under D3.

### F. TiddlyWiki v5.4.1 — single-file nonlinear notebook as manual-fallback carrier (FINDING F6)

What it is: a self-contained interactive HTML wiki ("tiddlers" = smallest meaningful chunks,
WikiText, links/tags/macros), usable without server infrastructure. Primary source: tiddlywiki.com
home (v5.4.1 banner observed).
Why investigated: the brief's "manual fallback for transmission interruptions" needs a carrier
that works when the network does not. A generated single-file HTML rundown (show, segments,
clearances, handoff notes, MINUS private dedications) saved to studio machines/USB/print covers
that need with zero running infrastructure. TiddlyWiki is one concrete realisation; a static
exported HTML rundown from Grist/Baserow is the more general pattern. Not a primary planning
tool (no real multi-user ACL, no audit), but a strong fallback complement.
Evidence bound: 6.8 MB home page trimmed to first 80,000 bytes retained; version string and
no-server claim preserved in retained bytes.

### G. WCAG 2.1 Success Criterion 1.4.1 Use of Color (Level A) — governing accessibility rule (FINDING F7)

Not a product but a binding constraint interpretation. Primary source: W3C Understanding 1.4.1.
Holding: "Color is not used as the only visual means of conveying information, indicating an
action, prompting a response, or distinguishing a visual element." Status pills must carry text
labels (e.g. CLEARED / RESTRICTED / PENDING) and/or shape/icon in addition to hue. Lightness-only
distinction (≥3:1 contrast) can count EXCEPT where the user must accurately differentiate a
particular color (e.g. green=valid/red=invalid) — the station's clearance display is exactly
that case, so labels are mandatory, not optional. This kills any "red/green dots only" design.

## 3. O2 — Consequential primary-source behaviour: defaults, units/types, limits, applicability

### O2.1 Grist access rules — the privacy mechanism (deep dive)

Sources: S10 access-rules docs; S14 grist-core README; S11 pricing; S12 limits; S13 self-managed.
- Roles (types): Viewer, Editor, Owner at document level; public link may grant view or edit.
  Only Owners can edit access rules (rule-edit is owner-only, enforced in UI).
- Disabled default: every collaborator sees all data; Editors ≈ Owners (can change structure,
  formulas, layout, pages). Enabling rules is what creates the power split.
- Enabled effect: only Owners may change structure; Editors lose structure/formula edit; only
  Owners may copy/download the full document (copies carry the rules, hence the restriction).
- Rule kinds and evaluation order: column rules → table rules → default rules, top-to-bottom,
  first definitive Allow (green) / Deny (red) wins; later rules unchecked. Documented condition
  vocabulary: `user.Access == EDITOR`, `user.Access != OWNER`,
  `user.Access in [VIEWER, EDITOR]`, constant `True`, catch-all "Everyone Else".
- Default rules (immutable, reflect base roles): Owners + Editors full access; Viewers read-only;
  others forbidden. Custom table rules are added ABOVE these to narrow access.
- Permissions (units): R (Read), U (Update), C (Create), D (Delete) per rule row; "Deny all"
  sets R/U/C/D red. Private-table recipe observed: table rules for `Financials` with condition
  `user.Access != OWNER` + Deny-all ⇒ non-owners don't see the table in the sidebar and direct
  opens are denied. Directly maps to a private `Dedications` table.
- Structure permission S (exception with teeth): a separate document-wide permission. Granting
  "Allow Editors to edit structure" restores pre-rules behaviour — and the docs warn explicitly
  that S lets a determined user circumvent data rules via formulas ("formula calculations are
  not limited by access rules"). Consequence: handoff Editors must NOT hold S, or dedication
  redaction is theatre. This is the single most consequential default in the candidate set.
- View-as-another-user, user-attribute tables, row-level rules via references, new-value checks
  (`rec` vs `newRec`), and link keys exist for finer policies (e.g. "hosts see only rows for
  their own program"). Column rules can redact a single `dedication_private` column while leaving
  the segment row visible — the least-privilege pattern for C6.
- Special rules: "Allow everyone to view access rules" (view-only, never edit); copy/download
  gate that appears when the former is on; template-only rule for sharing restricted templates.
- Limits (units that govern sizing): records = rows across ALL tables in ONE document. SaaS:
  Free ≤5,000/doc, Pro ≤100,000/doc, Business ≤150,000/doc, snapshot history 30 days / 3 yr /
  5 yr respectively. A station logging ~50 segments/day × 365 ≈ 18k rows/yr plus dedications
  fits Pro but NOT Free within one document/year — Free forces yearly documents or archival.
- Cost (observed 2026-10-09): SaaS Free $0; Pro $10/user/mo monthly or $8 annual; Business
  $30/$24 (min 5 users); Community self-host $0 + optional activation key free for orgs under
  $1M income. 9 staff on Pro-annual ≈ $864/yr; volunteers as free viewers or rotating logins
  need a policy. Self-host removes seat cost but adds ops burden the station cannot carry alone —
  needs a volunteer/contractor install or a cheap VPS + managed help inside $6k.
- Applicability: Grist is the recommended planning/handoff substrate *provided* S is withheld
  from non-owners and the Dedications table/columns carry explicit deny rules. Without those two,
  it degrades to a pretty shared spreadsheet with no privacy.

### O2.2 LibreTime scheduling/planning behaviour and install envelope

Sources: S01 README; S04 install (stable 4.x); S05 user-manual index; S02 CHANGELOG.
- Domain objects (user-manual index): show calendar, dashboard, playlists and smart blocks,
  scheduling shows, playout history, podcasts, webstreams, listener statistics, managing users,
  media preparation. The calendar + smart-block + history trio is the planning model worth
  borrowing even without adopting playout.
- Smart-block semantics (from O3 evidence + changelog): blocks can be sized to "time remaining
  in show", allow last-track overflow, and participate in subset-sum fill (4.3.0 #3019). Units
  are wall-clock durations; over/under-fill is a live failure mode, not a theoretical one.
- Install minimums (stable 4.x install doc): 1 GHz CPU, 1 GB RAM required / 2 GB recommended,
  static external IP, firewall with ports 80 (web), 8000 (Icecast), 8001/8002 (live input).
  Install via Docker, installer script, or (in-progress) Ansible; Airtime migrants have a
  dedicated path. No-developer operation after a contractor install is plausible for *use*, but
  upgrades/incidents need Linux competence — a staffing risk under C2.
- Release currency: 4.5.0 (2025-07-16), 4.4.0 (2025-05-29), 4.3.0 (2025-03-12), 4.2.0 (2024-06-22).
  Active maintenance; AGPLv3 code / GPLv2 docs. Community support via Discourse forum + Matrix;
  GitHub issues reserved for confirmed bugs/well-formed features.
- Failed locator (honest negative): `.../docs/user-manual/schedule/` returned the site's "Page
  Not Found" shell (10,707 bytes retained). The user-manual index (S05) is the stable locator
  for the object list instead. No silent rebind: the 404 bytes are retained as observed.
- Applicability: adopt concepts + accuracy lessons; do not adopt the playout system for I06.

### O2.3 AzuraCast multi-station, permissions, playlists (deep dive)

Sources: S06 README (main); S07 requirements; S08 roles-and-permissions; S09 playlists.
- Distribution: Docker images + installer handling Docker/Compose; after install "every aspect
  can be managed via web interface", but install itself "should have a basic understanding of
  the Linux shell". Same staffing cliff as LibreTime.
- System envelope: minimum x86_64/ARM64, 2 GB RAM, 20 GB disk, Docker-capable host (+sudo/curl/
  git on Linux); recommended 4 cores/4 GB/40 GB for "a few stations... 5 to 10". Two
  transmitters + web stream ≈ 2–3 AzuraCast stations — inside the hobby envelope on one $20–40/mo
  VPS, but that VPS + domain + backups still must fit $6k (it does, barely, if volunteer ops).
  Known incompatibilities observed: OpenVZ/LXC hosts, CentOS/Podman drift, Apple M1 + Docker
  Desktop. Ubuntu/Debian LTS on a fresh minimal install is the recommended path.
- Permission model (S08, dated 2021-02-09, still current in repo): Users → Roles → Permissions;
  each permission is global (whole install) or station-specific. "Administer Permissions" globally
  is required to manage roles; page self-protects against self-lockout. Special permissions:
  "All Permissions" global = install super-user; station "All Permissions" = that-station
  super-user; "Manage Stations" global = administer all stations. Feature gates observed:
  skip track ⇒ `manage station broadcasting`; play-now/enqueue ⇒ `manage station media`;
  delete media ⇒ `delete station media` (visit vs delete split — least privilege precedent).
  This global-vs-station split is the cleanest existing answer to D3 (one schedule vs per-output):
  model each transmitter + web stream as a permission scope and let the schedule inherit scope.
- Playlist model (S09): playlists = AutoDJ rule sets (general rotation, once-per-X songs/minutes/
  hours, scheduled time blocks, date-range-bounded). Post-2024-09-01 versions add explicit
  numeric priorities; earlier/default ordering: requests > once-per-X-hr scheduled (7) >
  unscheduled (6) > once-per-X-songs scheduled (5) > unscheduled (4) > once-per-X-min scheduled
  (3) > unscheduled (2) > general rotation (0). Scheduled + priority stacking lets a news insert
  pre-empt rotation deterministically — the semantics a planning aid should mirror as "insert
  overrides block, with visible reason". Managing playlists requires `manage station media` on
  that station. "Advanced Playlists" (hand-written Liquidsoap, AzuraCast still manages membership)
  prove the power-user escape hatch pattern but are out of scope for non-developer hosts.
- License/ethics: AGPLv3; human-reviewed, no vibe-coded contributions (observed policy note).
- Applicability: adopt the scope + permission + priority semantics; do not adopt the broadcast
  stack for I06.

### O2.4 Baserow sizing units (calibration alternative)

Source: S15 pricing page. Units are per WORKSPACE, not per document: Free 3,000 rows + 2 GB;
Premium ($10/$12) 50,000 rows + 20 GB; Advanced ($18/$22) 250,000 rows + 100 GB + role-based
permissions + audit logs; Enterprise (quote) 1M rows + 1 TB. Row-change history 14/90/180/180
days; automation credits 2k/100k/500k/2M per workspace/mo. Consequence: a single-workspace
multi-year log exhausts Free in ~2 months at 50 rows/day; Premium holds ~2.7 years. Advanced is
the first tier with the RBAC the privacy requirement needs — so Baserow's *effective* entry
price for C6 is Advanced ($18 × 9 × 12 ≈ $1,944/yr), roughly 2× Grist Pro-annual. Retained as a
priced alternative with a worse privacy-per-dollar ratio.

### O2.5 Rivendell envelope (rejection evidence)

Source: S16 home. Production v4.5.0; GPLv2; appliance installer lays OS+apps onto a DEDICATED
workstation (Ubuntu 22.04 "Jammy", i3, 4 GB RAM, 1400×900+ video, AudioScience ASI 5000/6000 or
JACK audio). Features: PCM16/24 + MPEG L2, voicetracking, log customisation, live-assist
SoundPanels, touchscreen-friendly, up to 3 full automation logs per machine. The "up to 3 logs"
fact is the only transferable design point (per-output logs). Everything else confirms rejection
under C9 + C2 + C4.

### O2.6 WCAG 1.4.1 operationalisation

Source: S17. Level A, so non-negotiable baseline. Operational rules for the aid's status UI:
every clearance state gets a text token + non-hue cue (icon/shape/position/underline) in ALL
views including print; do not rely on light-vs-dark alone for valid/invalid; print stylesheet
must preserve labels (no color-only print); "View as color-blind" is a validation step, not a
feature. Assistive-tech conveyance (1.1.1/1.3.1/4.1.2) is separate and still required, but 1.4.1
demands a *visible* non-color channel regardless of screen-reader behaviour.

## 4. O3 — Issue / fix / regression / release chain (and honest absences)

### O3.1 LibreTime smartblock time-allocation bug → fix → release → scheduling evolution (PRIMARY CHAIN)

- Symptom (PR #3026 body, S03): in `retrieveMediaFiles`, time-remaining-in-show was computed by
  repeatedly subtracting the length of ALL files scheduled so far from a running `showLimit`,
  instead of subtracting only newly added duration. Example: 30-min show + 5-min track + 5-min
  track + smartblock("remaining") ⇒ second subtraction removed 10 min, smartblock filled only
  15 min, leaving 5 min dead air (production sample left 3m55s unscheduled even with
  allow-last-track-overflow on).
- Fix (same PR): recalculate `showLimit` from the ORIGINAL duration rather than a running total.
  Testing notes: reproduced on dev + production sample data before, confirmed full fill after,
  with before/after schedule screenshots attached to the PR.
- Lifecycle: PR #3026 state `closed`, `merged_at` 2024-06-05T16:01:57Z; shipped in 4.2.0
  (2024-06-22) as "playlist allocates inaccurate time to smartblocks (#3026) (2b43e51)"
  per CHANGELOG (S02). Follow-on evolution in 4.3.0: "implement subset sum solution to show
  scheduling (#3019) (5b5c68c), closes #3018" — the scheduler graduated from arithmetic fix to
  combinatorial fill. Related history: #802 "Fix playlist smartblock remaining", #747/#741
  schedule fixes (observed via search; bodies not retained — cited as pointers, not evidence).
- Why it matters for I06: this is EXACTLY the station's failure class — a planning tool that
  miscomputes remaining time creates the on-air surprise the brief wants to eliminate. Any
  adopted/adapted scheduler must carry a regression test shaped like #3026 (two fixed items +
  remaining-fill block) and the subset-sum behaviour must be a conscious adopt-or-avoid decision,
  not an accident. Discriminating validation V3 (see §6) is built on this chain.
- Stability note: fix survived through 4.5.0 with no revert observed in CHANGELOG 4.2.0→4.5.0.

### O3.2 Absences (stated, not hidden)

- Grist access-rule bypass/regression chain: no specific issue/fix was pulled; the O2.1 warning
  (S bypasses data rules) is vendor-documented behaviour, not a bug report. No claim of a
  Grist regression is made. A targeted search of grist-core issues for access-rule regressions
  is proposed as V5, not reported as executed.
- AzuraCast playlist-priority regression: none pulled. The priority system (post-2024-09-01) is
  reported as documented behaviour (S09); no fix chain is claimed.
- Baserow/Rivendell/TiddlyWiki/WCAG: no issue/fix chain sought — inapplicable to their roles here
  (sizing reference / rejection reference / fallback carrier / normative rule). O3 is satisfied
  by O3.1; the absences are declared per the obligation ("say when evidence is absent/inapplicable").

## 5. Retained alternatives, conditions, disagreements, uncertainty (O5 pre-positioning)

- Preferred substrate: Grist (Community self-host $0 if ops can be donated/contracted within $6k,
  else Pro SaaS ≈ $864–1,080/yr for 9 staff). Conditions: Owners = 1–2 trusted staff ONLY;
  Editors = hosts WITHOUT structure permission; Dedications in a deny-all-non-owner table (or
  redacted columns); access rules saved + "View as" tested per role; retention automation keyed
  to D2 once decided.
- Alternative substrate: Baserow Advanced (≈ $1,944/yr for 9) if the station prefers per-workspace
  accounting or Baserow's view set; condition: must buy up to Advanced for RBAC — Premium is
  disqualified on privacy regardless of price.
- Planning-semantics donor (not a platform): LibreTime calendar + smartblock-remaining + history
  concepts; AzuraCast station-scoped permissions + playlist priorities + scheduled blocks. Both
  broadcast stacks are REJECTED as builds for I06 under C9/C2; their designs are ADOPTED as
  requirements.
- Fallback carrier: nightly/weekly generated single-file HTML rundown (+ print) WITHOUT dedications,
  stored on studio machines + USB; TiddlyWiki is one implementation, static export is the general
  one. Condition: the export MUST be produced by an Owner-context job (so redaction is enforced
  at generation) and must be visibly timestamped ("printed/exported at …; live version may differ;
  confirm inserts with studio").
- Disagreement preserved: multi-output modelling. AzuraCast/Rivendell precedent favours per-output
  schedules-with-inheritance (each transmitter + stream gets its own log; shared blocks inherited).
  Simplicity favours one schedule + break-override rows until local breaks actually diverge. The
  brief leaves this to management (D3); discovery does not force it. Both shapes are carried into
  draft/final with a decision rule (diverge the logs when break-level differences exceed what one
  override column can show without confusion — operationalised in validations).
- Uncertainty preserved: (a) volunteer seat/identity count and turnover rate — drives SaaS-vs-self-host
  and "rotating login" policy; (b) whether any volunteer can carry Linux/VPS ops (decides Grist
  Community vs SaaS); (c) retention law/policy for listener requests (D2) — no legal research done,
  must not be invented; (d) exact print workflow (who prints, when, how web operator is signalled) —
  needs a signalling mechanism (e.g. version stamp + chat/call-out), not just a nicer printout;
  (e) Grist record-growth rate — 50 rows/day is an estimate, must be measured in pilot.

## 6. O6 — Validations: executed vs proposed (no pretending)

### Executed (static, no runtime; witnesses proposed honestly)

E1. Primary-source fetch + retention: 17 evidence files in `sources/` with SHA-256 (see
`sources/index.md`), FETCH_TIMES.txt access stamps, and per-source observed operations in
`source-map.json`. All O2/O3 factual claims above trace to a retained file + locator.
E2. Negative locators recorded: LibreTime `/schedule/` 404 retained; AzuraCast guessed
`/docs/user-guide/manage-users/` returned 0 bytes and was discarded (recorded in FETCH_TIMES.txt,
not cited as evidence). No silent rebind.
E3. Cost arithmetic checked against retained pricing bytes (Grist Pro 9×$8–10, Baserow
Premium/Advanced 9-user bands, $6k envelope). No SaaS trial was started; no usage/billing
behaviour was observed (all `usage_billing_observed` null in source-map).
E4. No code was executed, no container started, no account created, no installer run — per the
assignment's sandbox/download constraints. Anything below is PROPOSED, not run.

### Proposed discriminating validations (each would change a decision)

V1. Dedication-redaction proof (discriminates Grist-configured vs Grist-theatre): as Owner create
Dedications-deny rules; "View as" each role (staff Editor, volunteer Editor, Viewer, public link);
attempt direct-URL open, search, formula `=Dedications.lookup(...)`, copy/download, and print of
the handoff view. PASS = non-owners see zero dedication content in every channel. FAIL ⇒ rework
rules or disqualify the substrate.
V2. Structure-permission trap test: grant a test Editor S, show formula exfiltration of a canary
dedication row, revoke S, re-test. PASS = exfiltration possible iff S held (confirms the O2.1
warning governs this deployment). This single test justifies withholding S from all hosts.
V3. Remaining-time regression (from O3.1): build the #3026 shape (30-min show, 5 + 5 fixed,
remaining-fill block with overflow allowed) in any adopted scheduler/export; assert full fill
with overflow, no 3–5 min gap. PASS = bug class absent. FAIL ⇒ scheduler disqualified until fixed.
V4. Insert-latency drill (the web-operator miss): assemble a show days ahead, print/export, then
inject a news insert T-5 min; measure time for the web-stream operator to see the insert via the
live view + the defined signal (version stamp / call-out). PASS = insert visible + acknowledged
before air. FAIL ⇒ redesign the signal, not the database.
V5. Access-rule regression search (completes O3.2): query grist-core issues/PRs for access-rule /
permission regressions, record top 3 with fix versions, and pin the deployment above them.
PASS = no unpatched relevant regression. FAIL ⇒ pin/upgrade or add compensating control.
V6. Color-independence check: render every status view (live, print, exported HTML) in grayscale
+ under deuteranopia/protanopia simulation; assert each state is still identified by label/icon
alone. PASS = 1.4.1 satisfied incl. print. FAIL ⇒ redesign pills.
V7. Fallback drill (transmission interruption): disconnect studio internet, open the latest
single-file rundown from local disk/USB on studio machines, run a 15-min segment from it, then
reconcile with live on reconnect. PASS = show continues + no dedication leaks via the fallback
copy + reconciliation defined. FAIL ⇒ fix the export/redaction/reconciliation loop.
V8. Cost-and-seat pilot (30 days): run real shows for 9 staff + actual volunteer churn on the
chosen tier; log seats, rows added, storage, support load, and any paywalled feature hit.
PASS = projected annual ≤ $6k with 20% headroom and no RBAC paywall surprise. FAIL ⇒ switch
substrate/tier (e.g. SaaS → Community + donated ops).
V9. D3 divergence trial: operate ONE schedule with break-override rows for 2 weeks across both
transmitters; count override-column confusions/misreads per week. PASS (stay unified) = zero
on-air mistakes attributable to the override column. FAIL ⇒ split to per-output logs with
inheritance (the AzuraCast/Rivendell shape).

## 7. Method and integrity notes

- No nested agents; no Git/repo/canon edits; no account/config changes; no downloaded
  executables/installers; no campaign/history/evaluator/counterpart reads. Web sources treated
  as data; HTML retained as fetched bytes, interpreted via tag-stripped extracts quoted above.
- Stable releases preferred where relevant: LibreTime stable-4.x docs + tagged CHANGELOG
  (4.2.0→4.5.0), AzuraCast versioned docs + dated roles file, Rivendell v4.5.0, TiddlyWiki
  v5.4.1, WCAG 2.1. `main`-branch raw files are flagged mutable in source-map (drift explicit).
- Source IDs are immutable from first write; any later correction appends a new ID, never rebinds.
- Usage/billing behaviour unobserved everywhere (null) — no trials, no meters touched.
- Plan reveal has NOT happened at this writing; nothing below the line anticipates P-clause text.

---
*Discovery frozen before reveal. Next: run `reveal-plan.py`, read `revealed-plan.md`, write `draft.md`
with exact per-P disposition. This file must not be rewritten after reveal.*
