# I08 discovery — band instrument lending + repair coordination (brief-only, pre-reveal)

Block B-08 / treatment / research / case I08 / method M15 v1.
Brief: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/I08/brief.md` (sha256 ff13f85a… per freeze.json).
Plan not read. No campaign/history/evaluator/counterpart read. No nested agents.
Access window: 2026-10-09T21:00–21:10Z. All web sources live docs unless pinned release/commit noted; drift risk explicit in source-map.json.
No runtime available; no code executed. O6 separates executed checks (doc reads only) from proposed validations.

## 0. Brief constraints distilled (no plan inference)

- Org: school district band program, 9 schools, 2 music staff + part-time repair coordinator; local teachers record urgent issues during class.
- Budget: $8,000 this year, total. Must cover hosting/licenses/SMS/hardware.
- Availability: usable during summer when district help desk closed → low-support, self-service recovery, offline-tolerant or at least degraded-mode operation; no helpdesk-dependent password resets or on-prem single point of failure without runbook.
- Required record: instrument identifier, school, loan status, repair notes, expected return date, caregiver contact path when delayed.
- Data minimization: student details limited because many teachers see schedule; avoid grades/disciplinary data. Implies role/field-level redaction, not just table ACL.
- Accessibility: some teachers use large-print screens → rem-based scaling, reflow, contrast, no fixed-pixel text, keyboard operability.
- Bilingual family liaison: messages in two languages → template i18n, locale per caregiver, fallback when translation missing.
- Current pain: binders cannot distinguish repair waiting-for-parts vs ready-for-pickup → explicit repair state machine with at least those two states, plus intake/diagnosed/in-repair/closed; parts hold must block pickup.
- Rollout: start single inventory room + few schools, expand only if handoffs clear → multi-location support with per-location enablement, transfer/handoff log.
- Undecided (must remain decisions, not assumptions): who can approve replacement instrument; whether caregivers can report problem directly (portal scope).
- Identity: existing district sign-in requirements may apply, formal integration request not funded → SSO desirable but unfunded; need low-cost broker or local auth with migration path, not enterprise SAML bill.

## 1. O1 — Useful unfamiliar tools / materially different approaches

Seven materially different stacks were discovered from primary docs. None is assumed in the brief.

### A1. Snipe-IT — asset lifecycle with checkin/checkout + status labels + labels
- What: open-source asset management (PHP/Laravel). Assets have unique asset tag; checkout to people (preferred), locations, or other assets; checkin returns to possession or repair; status labels carry one of four meta-types governing assignability.
- Why fits: instrument identifier = asset tag (or serial as tag, or auto-increment); loan status = checkout state + status label; expected return = `expected_checkin`; repair notes = notes + status + maintenance records; labels for inventory-room barcodes/QR.
- Material difference vs spreadsheet: exclusive checkout prevents double-booking; status meta-type enforces deployable vs undeployable vs pending vs archived.
- Primary observed: Overview docs describe asset tags must be unique, checkin/checkout exclusivity, four status meta-types and pending example “Awaiting Re-Imaging”. API docs/issues describe `POST /api/v1/hardware/{id}/checkout` fields (`assigned_user`, `assigned_location`, `checkout_to_type`, `status_id`, `note`, `name`, `expected_checkin`) and `POST /api/v1/hardware/{id}/checkin`, plus `POST /api/v1/hardware/{id}/uploads` attaching to asset globally, not to action-log event.
- Cost/hosting: self-hosted PHP + MySQL; no per-seat license observed. Fits $8k if district or $10–40/mo VPS hosts it. Hosted Snipe-IT SaaS exists but not priced here; usage/billing unobserved → null.
- Applicability limits: IT-asset vocabulary; student/caregiver are “users” — needs data-minimization hardening (see O2). Repair-parts vs ready-for-pickup must be modeled as status labels + custom fields, not native repair workflow. Offline: web app, no offline-first sync observed.

### A2. Lend-Engine — library-of-things lending with maintenance/servicing + multi-location
- What: web platform for lending libraries / tool libraries / education equipment libraries. Manages items, members, loans/reservations, maintenance schedules, inspection/service logs, multiple locations including unavailable repair/cleaning locations.
- Why fits: loan calendar (hourly/daily/weekly), due-back tracking, member self-serve loans/reservations, loan reminders, custom fields + file attachments for manuals, repair location/technician assignment with notes/uploads.
- Material difference vs Snipe-IT: lending-native (reservations, renewals, reminders, member portal) rather than IT-asset-native; maintenance-after-every-loan or ad-hoc servicing schedules.
- Primary observed: feature pages for maintenance/servicing, asset tracking, equipment tracking, education lending; pricing page lists Free / $12.50 / $25 / $50 per month tiers with unlimited loans per month and self-serve loans on all tiers (full tier matrix not fully captured; treat as mutable).
- Cost: $150–$600/yr list fits $8k even at Business tier. Member-portal answers caregiver-direct-report decision as configuration, not build.
- Applicability limits: SaaS dependency during summer helpdesk closure — needs SLA/runbook, export path, and offline fallback for urgent in-class issue capture. Student-data minimization depends on member-field configuration and role visibility, not verified at field level. Bilingual message templates not confirmed in captured pages → uncertain.

### A3. Grist — relational spreadsheet-database with formula access rules + self-host
- What: open-source relational spreadsheet (Grist Core). Tables/columns/references, formula columns, card/form/calendar views, granular access rules down to table/column/cell based on user attributes and cell values, API + webhooks.
- Why fits: single doc can model Instruments, Loans, Repairs, Schools, CaregiverContacts with reference columns; access rules can hide student/caregiver PII from most teachers while showing schedule; forms for urgent in-class issue capture; summary tables for repair queue (waiting-for-parts vs ready-for-pickup).
- Material difference vs NocoDB/Baserow: rules are formulas evaluated per row/column/cell with `user.*` attributes, not just role-per-table; document owns content ACL while Home DB owns instance/workspace ACL.
- Primary observed: access-rules help; self-managed help noting `ALLOWED_WEBHOOK_DOMAINS` gates webhook targets; core docs distinguishing Home DB (instance ACL) vs Document DB (content ACL); community note that `S` (schema) permission bypasses other restrictions because formulas are not sandboxed from data; API auth via Bearer key with full account access vs scoped OAuth apps (least-privilege guidance).
- Cost: self-hosted Docker, no row/seat cap observed for self-host; managed Grist free-plan API limit 3,000 calls/mo/team noted in newsletter (mutable). Fits $8k self-hosted.
- Applicability limits: no offline-first client observed; summer resilience must come from simple hosting + cached reads, not true offline writes. Webhook domain allowlist must be configured or notifications fail closed. Schema permission is powerful — must not grant to teachers.

### A4. NocoDB — spreadsheet-database on existing RDBMS, with gated field/row permissions
- What: open-source Airtable alternative; spreadsheet UI over Postgres/MySQL/SQLite; bases/tables/views/APIs; workspace/base collaboration with role precedence.
- Why fits: fast inventory + loan tables on district Postgres if available; views per school; API tokens for notification workflow.
- Material difference vs Grist: NocoDB community self-host is free with unlimited records/storage/seats per pricing commentary, but SSO, table/field-level permissions, teams, audit logs, row-level security are gated to paid self-hosted Business/Scale license (per community thread). That gating is decisive for student-data minimization: community may not redact columns/rows for many-teacher visibility.
- Primary observed: API-tokens docs (Community/unlicensed tokens default to all-resources access and never expire; token shown once, stored as SHA-256 hash); collaboration docs (role precedence, cannot assign above own role, teams cannot be Owner); release 0.301.5 notes making advanced workspace-level access control available to self-hosted (previously paid); community guidance on gated SSO/field permissions/audit/row security.
- Cost: community $0 + server; gated license cost not observed → billing null. If field-level redaction is required, Grist or Directus/ERPNext may be cheaper than NocoDB license + audit needs.
- Applicability: no offline-first observed. Token default (all-resources, never expire) is unsafe for teacher devices — must scope/expiry-harden where licensed, or proxy via backend.

### A5. ERPNext (Frappe) — Asset + Asset Repair + Issue/SLA + portal + translations
- What: open-source ERP (Frappe Framework). Asset doctypes with category/location/movement/depreciation; Asset Maintenance (planned) distinct from Asset Repair (failure/downtime/cost/capitalization); Issue doctype with assignment rules and SLA; portal for external users; built-in multi-language translations.
- Why fits: repair state (failure → repair → parts consumption → completion) is native; Issue → Asset Repair draft flow covers teacher urgent-report → coordinator triage; portal scope answers caregiver-direct-report as permission decision; translations cover bilingual liaison need better than ad-hoc templates.
- Material difference: only option here with native preventive-vs-corrective distinction, stock consumption for parts, downtime accounting, and replacement-approval workflow.
- Primary observed: Asset Maintenance docs FAQ (“Maintenance is planned work. Asset Repair records a failure, downtime, repair cost, and possible capitalization.”); Asset Repair docs (“Repair records a failure and its financial/operational recovery”; consumed parts included and inventory reduced); release v15.117.0/v16.28.0 allowing Asset Repair for fully depreciated assets with “Capitalize Repair Cost” locked (PR 57110/57077); operating-pattern docs describing Issue → draft Asset Repair with technician assignment and expected downtime.
- Cost/complexity: self-hosted Frappe/ERPNext is heavy (bench, Redis, MariaDB/Postgres, workers) vs Snipe-IT/Grist; needs managed host or district VM. Fits $8k only with existing infra or small VPS + volunteer admin. Overkill if only lending is needed, justified if repair-parts, downtime, replacement approvals, and portal are all required.
- Applicability limits: no offline-first observed. Permissions/portal configuration is the data-minimization control — must verify field-level portal visibility before exposing to caregivers.

### A6. Authentik — self-hosted IdP broker for unfunded district SSO (OIDC/SAML/LDAP/RADIUS + proxy outpost)
- What: self-hosted identity provider / SSO server. Issues OIDC tokens, SAML assertions, LDAP binds, or proxy sessions; LDAP/RADIUS via outposts; blueprints as YAML config-as-code.
- Why fits: brief says district sign-in may apply but integration unfunded. Authentik can front the lending app with OIDC/SAML now (Google Workspace for Education / Entra ID as upstream) and broker LDAP to legacy apps, deferring formal district integration cost.
- Material difference vs Keycloak/Authelia: Authentik ships embedded proxy outpost usable as Traefik middleware (`sec-authentik`) for apps without native OIDC; supports OIDC+SAML+LDAP+RADIUS+SCIM in one box; blueprints for repeatable school rollout.
- Primary observed: self-hosting guide (full IdP: OIDC+SAML+LDAP+user mgmt+social; since 2025.10 no Redis, only PostgreSQL, 4→3 containers); integration docs for Snipe-IT LDAP (LDAP Integration + Password Sync checked, Active Directory unchecked, `ldap://authentik.company`, TLS/cert flags); proxy-outpost pattern forwarding `X-Authentik-*` headers.
- Cost: self-hosted $0 + Postgres + HTTPS domain; no per-user fee observed. Fits $8k.
- Applicability limits: adds IdP to maintain during summer closure — must have break-glass local admin, backup/restore runbook, and session lifetime that survives helpdesk absence. LDAP bind DN/Base DN and cert validation must be pinned; misconfigured TLS fails open/closed depending on flags. SAML attribute mapping (mail/givenname/sn) must match Snipe-IT/ERPNext expectations or login succeeds but profile is wrong.

### A7. PowerSync (+ Postgres) — offline-first SQLite sync for summer/helpdesk-closure resilience
- What: sync engine keeping in-app SQLite synced with backend (Postgres/Mongo/MySQL-beta/SQL Server-beta, others alpha/experimental) via service + client SDKs (JS Web, React Native/Expo, Flutter, Kotlin, Swift, .NET-beta, Rust-beta, Capacitor-beta, Tauri-alpha); sync rules partition rows per user; uploads via `uploadData()` only while sync stream connected; reads always from local SQLite.
- Why fits: “usable during summer when help desk closed” plus in-class urgent capture suggests offline-tolerant capture. PowerSync lets loan/repair capture write to local SQLite and sync when connectivity returns.
- Material difference vs plain web app or PouchDB/CouchDB: backend-agnostic (stays on Postgres), row-partitioned sync rules (e.g., `workspace_id` / `school_id`), real-time streaming; vs PouchDB it is not CouchDB-bound but requires PowerSync Service + connector.
- Primary observed: overview (service + SDKs, supported backends/SDKs); client-integration note that `uploadData()` is only called while sync stream connected so upload queue buffers indefinitely offline; TanStack/PowerSync collection note that reads work offline from SQLite and sync resumes on reconnect; ADR pattern of workspace-scoped sync rules filtering every row by `workspace_id`.
- Cost: self-host vs cloud pricing not observed → billing null. Adds service + Postgres logical replication + SDK build — only justified if true offline writes are required. Cheaper alternative: PouchDB + CouchDB for simple two-way sync, or “offline capture form → outbox → retry” without full sync.
- Applicability limits: cannot provide peer-to-peer LAN sync between offline devices with no internet (feasibility note); web WASM/SQLite + SSR boundaries need client-only encapsulation. Sync rules are security boundary — mis-scoped rule leaks student/caregiver rows to wrong school. Conflict handling must be defined for concurrent loan/repair edits.

### A8. n8n — self-hosted bilingual notification workflow (caregiver delay messages)
- What: self-hosted workflow automation; triggers (webhook/schedule), 400+ integrations; executions = one run from trigger to finish.
- Why fits: “contact caregiver when delayed” + bilingual liaison need → scheduled scan for overdue `expected_checkin`/`expected_return`, locale lookup, two-language template render, send via email/SMS/Matrix, log delivery, retry.
- Material difference vs app-native reminders (Lend-Engine) or Directus Flows: portable across A1/A3/A4/A5; keeps PII transform in one audited workflow.
- Primary observed: self-hosted Community has no execution cap (pay only server); Cloud Starter $20/mo annual ($24 monthly) for 2,500 executions, Pro $50/mo ($60 monthly) for 10,000; paid plans include unlimited users/workflows/integrations, priced by executions; enterprise SSO/LDAP/environments paywalled but untouched by this use.
- Cost: self-hosted $0 + VPS fits $8k; Cloud Starter $240/yr also fits but counts executions per overdue scan — must batch (one execution scanning many loans, not one per loan) or costs scale.
- Applicability limits: needs webhook allowlist + API scopes from A3/A4/A1; template i18n needs human-reviewed strings, not machine translation at send time; SMS costs/carrier opt-in not observed → billing null and must be validated.

## 2. O2 — Consequential behavior, defaults, types, limits, applicability

### O2-1. Snipe-IT checkout exclusivity, status meta-types, expected return, API text-only limit
- Exclusivity: checkout marks asset in someone else’s possession; cannot be checked out again until checked back in. Prevents double-booking replacement instruments. Governing invariant for loan status.
- Status labels: user-defined names but exactly four behaviors: Deployable (can be / is assigned), Undeployable (cannot be assigned), Archived (cannot be assigned, only Archived view), Pending (cannot yet be assigned, eventually will be). Repair modeling: `Pending/WAITING_PARTS` + `Deployable/READY_FOR_PICKUP` + `Undeployable/IN_REPAIR` is the minimal discriminating set; Archived must not be used for active repairs or they vanish from queues.
- Identifier: asset tag unique per system; serial often reused as tag or auto-increment enabled in Admin Settings. School must be location/company/custom field, not tag prefix alone, or cross-school transfers break uniqueness assumptions.
- Expected return: `expected_checkin` (API) / Expected Checkin (UI). Type is date; overdue = today > expected_checkin AND still checked out. n8n/scheduled report must use this field, not action-log timestamp.
- API: checkout accepts `assigned_user`/`assigned_location`, `checkout_to_type`, `status_id`, `note`, `name`, `expected_checkin`; checkin similar text-only. File uploads (`POST …/uploads`) attach to asset globally, not to checkout/checkin log entry. Consequence: repair photos/notes via API cannot be pinned to a specific loan event without custom fields or external store. See O3 Snipe-IT #19174.
- Auth defaults: LDAP Integration + Password Sync checked, Active Directory unchecked for Authentik LDAP; LDAP Server `ldap://…`, TLS/cert flags explicit. SAML attribute mapping must supply `mail` for login. Mis-mapping yields login or profile failure, not silent fallback.
- Data-minimization gap: “users” are full user records; teacher-visible schedule must use restricted roles + hidden custom fields. Verify per-field visibility; no field-level guarantee captured.

### O2-2. Grist access rules, schema permission, webhook allowlist, API auth
- Rule model: document owners set rules limiting who can see/edit what down to table/column/cell; conditions use `user.*` attributes (including owner-defined roles) and cell values (e.g., `School == user.School`). Rules deny by default unless granted; least-privilege per resource.
- Schema (`S`) permission bypasses all other restrictions because formulas are not sandboxed from data. Never grant `S` to teachers/liaison; only admins. Connected apps/OAuth can do at most what authorizing user can do, further limited by access rules — scopes restrict, never expand.
- Home vs Document DB: Home DB governs instance/workspace/doc ACL; Document governs content rows/cols/cells. Both must be configured; sharing a doc without content rules exposes PII to all doc viewers.
- Webhooks: self-hosted only allows external services in `ALLOWED_WEBHOOK_DOMAINS`; any-domain carries SSRF risk to internal Grist services. n8n endpoint must be allowlisted or notifications silently fail. No default-allow assumed.
- API: Bearer key carries full account access against `docs.getgrist.com` or `<team>.getgrist.com`; prefer scoped OAuth apps for third-party tools. Teacher devices must not hold owner API keys.
- Types: reference columns link Loans→Instruments→Schools→Caregivers; timestamp/authorship columns for handoff audit; conditional formatting for waiting-for-parts vs ready-for-pickup; summary tables for per-school queues. Exact type list not pinned — verify against live Column types doc before schema freeze.
- Limits: self-hosted row/seat caps none observed; managed free API 3,000/mo/team (mutable newsletter). For 9 schools and hundreds of instruments, API polling is fine; webhook push preferred for delay alerts.

### O2-3. NocoDB permission gating and token defaults (why it loses on minimization unless licensed)
- Roles: workspace/base roles with precedence; can only assign ≤ own role; teams cannot be Owner. Prior base-level access preserved across 0.301.5 upgrade (workspace ACL now in self-host).
- Gated (per community, needs license verification): SSO, table/field-level permissions, teams, audit logs, row-level security. Without these, many-teacher schedule visibility cannot redact student/caregiver columns/rows. This is the discriminating failure vs Grist/ERPNext for the “many teachers can see schedule” constraint.
- Tokens: Community/unlicensed default all-resources access, never expire; shown once, stored as SHA-256 hash, plaintext never stored. Must not issue to teacher browsers; proxy through backend or licensed scoped tokens. Rotation manual.
- Types: spreadsheet types over RDBMS; views/filters for repair queues. Usable for inventory-room pilot, but repair state machine is convention, not enforced.

### O2-4. ERPNext Asset Repair vs Maintenance, parts, depreciation edge, Issue→Repair
- Planned vs failure: Maintenance = planned work (schedules/tasks); Repair = failure/downtime/cost/capitalization recovery. Do not model waiting-for-parts as maintenance log; use Repair + status + parts.
- Repair record: failure downtime, repair cost, possible capitalization; consumed parts included and inventory reduced through supported workflow. Waiting-for-parts = Repair ordered but parts not consumed/available; Ready-for-pickup = Repair completed, asset deployable, location = pickup room.
- Fully depreciated edge: since v15.117.0/v16.28.0, Asset Repair allowed for fully depreciated assets; “Capitalize Repair Cost” locked off, no value/life add. School instruments are often fully depreciated — without this fix, repairs would be blocked or mis-capitalized. See O3.
- Issue→Repair: operating pattern creates draft Asset Repair from Issue with part requirements, technician assignment, expected downtime, links to condition evidence; ERPNext owns completion, stock consumption, serial/batch selection, costs. Teacher urgent-report = Issue; coordinator triage = Repair draft → submit.
- Portal/translations: portal scope decides caregiver-direct-report; translations cover bilingual templates. Both are config, but field-level portal visibility must be verified — no capture here proves caregiver cannot see other students’ rows.
- Units: downtime in minutes (Downtime Entry) / hours (Downtime Analysis report). Be explicit: repair SLA in days, downtime in minutes, expected return as date. Mixing units breaks overdue logic.

### O2-5. Authentik broker defaults and failure modes
- Topology: Authentik as IdP + proxy/LDAP/RADIUS outposts. Upstream district IdP (Google/Entra) federated once; downstream apps see OIDC/SAML/LDAP. Reduces per-app integration cost to one broker.
- Since 2025.10: no Redis, only PostgreSQL; 3 containers (server, worker, Postgres) + outposts. Backup = Postgres + media + blueprints + certs.
- LDAP provider: Base DN `dc=ldap,dc=example,dc=com`, Bind DN `cn=admin,ou=users,…`, ports 389/636, scheme `ldap://`/`ldaps://`. Snipe-IT side: LDAP Integration + Password Sync checked, Active Directory unchecked, cert validation checked, TLS unchecked unless LDAPS. Wrong port/scheme or unchecked cert validation yields auth bypass risk or bind failure.
- Proxy outpost: forwards authenticated requests with `X-Authentik-*` headers; map principal to app user or validate JWT. Apps without OIDC still get SSO via proxy, but header-spoofing must be blocked at edge (only outpost may set headers).
- SAML: Snipe-IT/Nextcloud-style mappings expect `mail`, `givenname`, `sn`, `employeenumber`, `departmentnumber`, `title`. Missing `mail` breaks login for SAML users. Test with real district claims, not placeholder IdP.
- Summer risk: IdP outage = total lockout. Mitigations: long-lived sessions + break-glass local admins + Postgres backup + documented recovery that liaison can run without helpdesk.

### O2-6. PowerSync sync rules, upload buffering, SDK/backend matrix
- Reads always from local SQLite, work offline; writes queue in `ps_crud`; `uploadData()` only while sync stream connected, otherwise buffers indefinitely. Preview/E2E without connected stream exercises only local-first behavior, not round-trip. Overdue scans must run server-side, not on offline clients, or delays are missed.
- Sync rules partition every row (e.g., `WHERE workspace_id = …` / `school_id = …`). Rule is security boundary; missing filter leaks cross-school PII. Use JWT/JWKS-validated claims, not client-supplied school id.
- Backends: Postgres/MongoDB stable; MySQL/SQL Server beta; Azure DocumentDB alpha; Convex experimental. For schools, choose Postgres stable. Source via logical replication → PowerSync Service → bucket storage + checksums → SDKs.
- SDKs: JS Web, React Native/Expo, Flutter, Kotlin, Swift stable; Node stable (beta tag in one note, verify); .NET/Rust/Capacitor beta; Tauri alpha. For large-print web + in-class capture, JS Web + Capacitor (beta risk) or pure web first.
- Limits: no peer-to-peer LAN sync when internet fully down; Web Workers/WASM SQLite + React/Next SSR need client-only encapsulation. Conflict resolution per collection must be defined (last-write vs merge) for concurrent loan/return.

### O2-7. n8n execution and batching, i18n honesty
- Execution = one trigger-to-finish run. Self-hosted Community unlimited executions/workflows; Cloud Starter 2,500/mo, Pro 10,000/mo. Overdue notifier must be one scheduled execution scanning all loans and fanning out, not one execution per loan, or Cloud caps exhaust.
- License: free for internal self-hosted business use; commercial resell/white-label/host/embed where n8n is substantial value is restricted. District internal use fits; MSP resale needs license review.
- Bilingual: n8n does not translate; it renders two human-reviewed templates selected by caregiver locale. Machine translation at send time is out of scope and risks mis-communication about return dates. Missing locale falls back to liaison’s primary language + flag for human follow-up.
- SMS/email: carrier opt-in, sender identity, and per-message cost not observed → billing null. Validate before promising SMS; email first, SMS only with consent + budget.

### O2-8. Accessibility (large-print) and data-minimization defaults
- Large-print: no app-specific large-print mode captured. Governing approach is platform: rem-based type, 200% zoom reflow (WCAG 1.4.4/1.4.10/1.4.12), visible focus, keyboard operability, contrast. Fixed-pixel canvas/table widgets fail. Validate with browser 200% + OS large text, not just CSS zoom.
- Minimization: store instrument/school/loan/repair/expected-return/caregiver-contact only; student link minimal (ID/initials, no grades/discipline); teacher role sees schedule + instrument + status, not caregiver contact unless delay workflow needs it; liaison/coordinator see contact. Enforce in Grist content rules or ERPNext portal/field permissions, not UI hiding alone. Audit who viewed contact.

## 3. O3 — Issue / fix / regression / release chains

### O3-a. ERPNext allows Asset Repair for fully depreciated assets (directly applicable) — PASS
- Releases: `frappe/erpnext v15.117.0` and `v16.28.0` (same fix, both lines).
- Change: “Allows Asset Repair records to be created for assets that are fully depreciated and adds an ‘Asset Repair’ button on the Asset form. For these repairs, Capitalize Repair Cost cannot be edited and the repair does not add to asset’s value or life.” PRs 57110 (v15) / 57077 (v16); related barcode-unit PR 57102 in same release.
- Why consequential: school instruments are routinely fully depreciated. Before fix, repair would be blocked or force incorrect capitalization. After fix, repair workflow works with capitalization locked off — exactly the school use.
- Regression risk: none observed in release notes; verify that depreciation job errors (“Failed to post depreciation entries” → Error Log + email to Role to Notify or Accounts Managers) do not block Repair submit.
- Evidence: release pages + Asset Maintenance/Repair docs quoted in O2-4. Usage/billing null.

### O3-b. Snipe-IT checkout/checkin API text-only; file uploads not per-event — open gap, no fix observed
- Issue: `grokability/snipe-it#19174` (Feature Request: Photo/file attachment support on checkout and checkin action log entries via API).
- Observed behavior: checkout/checkin endpoints accept only text fields (`assigned_user`, `assigned_location`, `checkout_to_type`, `status_id`, `note`, `name`, `expected_checkin`); `POST …/uploads` attaches to asset globally, not to specific action-log event.
- Why consequential: repair evidence (damage photo, technician report) cannot be pinned to the loan/repair event via API; UI workaround or custom fields/external store required. Affects “repair notes” fidelity and handoff clarity.
- Fix status: no fix/release observed in captured sources → open. Do not promise per-event attachments on Snipe-IT API.
- Alternative: Lend-Engine maintenance notes/uploads per repair assignment, or ERPNext Repair with attached reports, or Grist file column per Repair row.

### O3-c. NocoDB 0.301.5 brings workspace ACL to self-host (partial evolution, gating remains)
- Release: `nocodb/nocodb 0.301.5`.
- Change: advanced workspace-level access control, previously paid, now fully available for self-hosted; existing base-level access preserved, seamless transition.
- Why consequential: improves NocoDB fit for 9-school workspace separation, but does not resolve field/row-level gating (still paid per community). So O2-3 conclusion stands: NocoDB viable for pilot inventory, not for many-teacher PII redaction without license.
- Regression risk: none observed; permission precedence unchanged.

### O3-d. Authentik 2025.10 removes Redis (simpler summer ops) — PASS
- Change: since 2025.10, Authentik no longer requires Redis, only PostgreSQL; container count 4→3.
- Why consequential: fewer moving parts during helpdesk closure; backup/restore is Postgres-centric. Still needs Postgres HA/backup, but Redis persistence/ memory tuning is gone.
- Verify: release notes pin not captured — treat version as reported, re-verify at build freeze.

### O3-e. PowerSync upload buffering when offline (documented behavior, not a bug) — applicable caveat
- Behavior: `uploadData()` only while sync stream connected; offline writes buffer in queue indefinitely; preview E2E covers only local SQLite + offline behavior.
- Why consequential: in-class urgent reports captured offline will not reach coordinator until reconnect + successful upload. UI must show “queued, not yet sent” vs “synced”; coordinator queue must not be driven from offline clients. No fix expected — design around it.

No other O3 chain executed. Absent evidence is stated as absent; no invented CVE/commit.

## 4. O5 — Alternatives, conditions, disagreement, uncertainty retained

- Cheaper repair-native vs cheaper lending-native: ERPNext is the only native repair+parts+downtime+portal+i18n stack, but heaviest to run. Lend-Engine is the fastest lending+maintenance fit, but SaaS + bilingual/PII uncertainty. Snipe-IT is the cheapest self-hosted asset fit, but repair workflow is conventional and API attachments gap remains. Grist is the best minimization-permission fit among low-code options, with webhook/i18n work still needed.
- Offline honesty: only PowerSync (or PouchDB/CouchDB alternative, not deep-dived) gives true offline writes. All other stacks are online web apps; summer resilience for them means simple hosting, long sessions, break-glass admins, and printable handoff sheets, not offline sync. Do not claim offline for Snipe-IT/Grist/NocoDB/ERPNext/Lend-Engine.
- Identity honesty: unfunded SSO is solvable with Authentik broker, but broker becomes critical path. Alternative: start with local accounts + MFA + strong password reset runbook that liaison can execute, migrate to district SSO when funded. Do not promise district SSO without funded integration and claim mapping test.
- Bilingual honesty: ERPNext translations > n8n dual templates > ad-hoc UI strings. No stack auto-translates repair notes. Caregiver messages use human-reviewed templates; repair notes stay in staff language with liaison summary in second language.
- Replacement approval + caregiver direct-report remain user decisions. All stacks can implement either branch as config (portal scope, approval role), but choice changes PII exposure and moderator load. No recommendation bakes in one branch.
- Disagreement retained: NocoDB community vs Grist for low-code. NocoDB wins on existing-RDBMS reuse and workspace ACL now in self-host; Grist wins on cell-level rules and webhook model. For “many teachers see schedule,” Grist wins unless NocoDB license is funded.
- Uncertainty: Lend-Engine bilingual/PII field behavior; Snipe-IT field-level visibility; ERPNext portal field redaction; PowerSync pricing/ops cost; SMS costs/opt-in; Authentik 2025.10 pin; Grist managed API cap drift. Each is a validation, not an assumption (see O6).

## 5. O6 — Discriminating validations: executed vs proposed (no runtime pretense)

Executed (doc reads only, 2026-10-09T21:00–21:10Z):
- E1. Read Snipe-IT Overview (status meta-types, checkout exclusivity, asset tags) — PASS, quoted.
- E2. Read Snipe-IT API issue #19174 (text-only checkout/checkin, global uploads) — PASS, open gap.
- E3. Read Grist access-rules/self-managed/core-database + API-auth guidance — PASS, quoted with drift caveats.
- E4. Read NocoDB API-tokens + collaboration + 0.301.5 release + permission-gating thread — PASS, gating conclusion conditional on license verification.
- E5. Read ERPNext Asset Maintenance + Asset Repair + v15.117.0/v16.28.0 releases — PASS, depreciation fix confirmed.
- E6. Read Authentik self-host/integration/proxy patterns + 2025.10 Redis note — PASS, version pin needs re-verify.
- E7. Read PowerSync intro/client-integration/TanStack offline notes + backend/SDK matrix — PASS, upload-buffering caveat confirmed.
- E8. Read Lend-Engine features/pricing + n8n execution/license/pricing notes — PASS, pricing mutable, SMS null.
- No code run, no container started, no SSO login tested, no accessibility tool run. Anything beyond E1–E8 is proposed.

Proposed (discriminating, small-scope, each falsifies a choice):
- P1. Field-redaction probe: create 2 schools × 2 instruments × 2 students with caregiver contacts; log in as Teacher-A (School-A) and prove cannot read School-B rows or caregiver phone/email, while coordinator can. Falsifies NocoDB-community vs Grist vs ERPNext-portal choice.
- P2. Repair-state probe: move one instrument Intake → Waiting-for-Parts (parts hold blocks checkout) → Ready-for-Pickup → Checked-out; attach damage photo/note via API/UI and prove it stays pinned to that repair event after next loan. Falsifies Snipe-IT API vs Lend-Engine vs ERPNext vs Grist-file-column.
- P3. Overdue bilingual probe: set expected return to yesterday for 2 caregivers with different locales; run notifier once; prove exactly 2 messages, correct locale, logged delivery, no duplicate on rerun, fallback when locale missing. Falsifies batching + template + idempotency design.
- P4. Summer-closure probe: kill helpdesk-dependent paths (password reset, IdP admin) for a day; prove teacher can still record urgent issue (online or queued-with-label), coordinator can triage, session survives, break-glass admin works from printed runbook. Falsifies hosting/IdP/offline choice.
- P5. Large-print probe: OS large text + browser 200% zoom on loan schedule, repair queue, and issue form; prove no clipped text, no horizontal scroll to complete tasks, visible focus, keyboard-only completion. Falsifies UI stack/CSS approach.
- P6. SSO-broker probe (only if Authentik chosen): federate test Google/Entra tenant, map mail/givenname/sn, log in via OIDC + SAML + LDAP-bind + proxy-outpost; prove header-spoof blocked, cert validation enforced, Postgres restore recovers IdP. Falsifies broker topology.
- P7. Depreciation-repair probe (only if ERPNext): fully depreciate test asset, create Repair, prove submit succeeds with Capitalize locked off and no value/life change; post depreciation error and prove Repair unaffected. Falsifies O3-a applicability.
- P8. Cost probe: 12-month TCO for chosen stack (hosting + licenses + SMS + backup + admin hours) against $8,000 cap with 9-school scale; prove headroom for year-2 renewals. Falsifies SaaS-vs-self-host choice.

## 6. What draft must still do (post-reveal, not done here)

- Compare every exact P clause after `reveal-plan.py`; assign correction / optional enhancement / user decision / already-covered / rejected / uncertain per clause.
- Preserve this discovery’s alternatives, conditions, and uncertainty in final; do not collapse to IDs.
- Keep verification questions answer-free and consequential (separate file, post-draft).

## 7. Sources index (navigable)

- `source-map.json` — immutable IDs S01–S14, exact URLs, versions/commits, locators, access timestamps, observed operations.
- `sources/evidence.md` — bounded excerpts + why each source matters.
- `sources/index.md` — human-navigable table of sources → claims.

Usage/billing: unobserved fields are `null`, not zero. No downloader/installer run.
