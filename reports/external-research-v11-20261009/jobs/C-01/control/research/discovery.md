# C-01 / H01 — independent external discovery

**Stage:** research  
**Brief:** /home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/H01/brief.md  
**Input map:** /home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/C-01/control/research/input-map.json  
**Research snapshot:** 2026-10-09 21:43 UTC  
**Boundary:** The plan was not read. The plan-only file was left unopened. This discovery record is based on the brief and independently selected public primary sources and is saved before the required plan reveal.

## 1. Brief-derived frame

This is a small, time-sensitive service operation, not a public event-discovery product. Six staff need one current operational answer for each service: schedule and confirmation state, room/vehicle/provider/officiant assignment, task owner and due time, and the latest change after a family member arrives from another time zone. The operational calendar should not become a shared repository for all family information. Contact details, payments, faith/cultural requests and private planning notes need least-privilege access and a retention decision.

The most useful unfamiliar discovery is Passare Manage, a funeral-home case-management product with a service calendar, role-based access, event participants and availability, case checklists/tasks, family planning area, and downloadable case CSVs. Its listed capabilities map unusually closely to the brief. It merits a vendor demonstration and tightly scoped pilot before funding a bespoke application. The evidence is vendor documentation and product claims, not hands-on evaluation; price, exact access granularity, keyboard completion, translation quality, resource-conflict behavior, staff outage behavior, retention controls and complete export fidelity remain gates.

Two materially different approaches are also useful:

1. **Configurable no-code database/app (Baserow Advanced).** It can model the home's service, room, vehicle, provider and handoff records. Restricted views offer row/column scoping, exports and role controls. Its observed hosted price is $18 per user/month billed yearly; if all six staff need paid seats, that is $108/month or $1,296/year before taxes or other costs. This is a mutable price snapshot, not a quote. It shifts work from license cost to schema design, security verification, support and outage behavior.
2. **Self-hosted groupware (Nextcloud Calendar plus a task board).** It offers local control and standards-based calendar data with event/calendar exports and CalDAV clients. However, writable calendar shares let sharees create, edit and delete all calendar events; they are not a field-by-field confidentiality boundary. Room/resource booking requires an additional backend app. It is viable only with deliberately separated calendars and case data, a named administrator, backups and an outage proof.

A custom/local-first app is a fourth architectural option if packaged and configurable products fail the access or outage gates. There is no evidence here that it can be built and supported within the $10,000 first-year ceiling, so it is not the default recommendation.

## 2. Product and mechanism findings

### 2.1 Passare Manage — strongest first pilot candidate, subject to gates

The vendor describes Passare Manage as funeral-home case software with a shareable team calendar, notes/checklists, permissions, reports and family-facing Planning Center. Its calendar documentation describes case events with public/private flags, color cues, service type, time, location, providers, participants, reminders and associated events. Participants can be selected by user or role; the participant picker shows when someone is unavailable and participants are notified when they are added, removed or an event changes. Event types can automatically add users in selected roles. Event-type settings include duration, faith/body/preparation/final-disposition attributes, venue/provider categories, participant defaults and a Daily Schedule of Services Report setting. These details could reduce double-booked room/vehicle/officiant uncertainty, but the reviewed docs do not establish that every room or vehicle is reserved atomically or that conflicts are rejected. Require a live demonstration using two overlapping services and the actual resource types.

The case workflow is more useful than a bare calendar. Tasks can carry a case/checklist, due date and time, one or more owners, reminder and comments; owners receive reminders and overdue tasks are marked past due. Checklists can be internal or selectively exposed to families. A family-visible checklist can be view-only or edited by Family Collaborators. This supports repeatable handoffs, but it does not decide whether each service type needs a separate checklist.

Internal access documentation supports roles composed from permissions by area, including read-only access, separate role assignment and a mobile-only option for staff such as drivers/care-center workers. It gives examples of restricting financials to a few roles and limiting a pre-need counselor to pre-need cases. This is promising, not proof that every sensitive field in this brief can be hidden from each of six roles. In a demo, create six representative test accounts and verify what each can see in case lists, event popovers, notes, preferences, faith/cultural requests, family contacts, task comments, payments, exports and mobile. Do not infer that the event's private flag is equivalent to staff-role confidentiality: the reviewed calendar page describes it as an event classification/color, while a separate roles page controls access to areas.

Planning Center is invite-based, not a public directory. Vendor documentation says family members can view scheduled arrangement/service events, answer preference questions, contribute biographical information, collaborate on an obituary, upload/download files, see checklists and invite relatives by role. It explicitly says family use requires internet. Family members can be assigned Viewer, Contributor or Editor, but Editor is the default and has full Planning Center access; at least one Editor is required per case and an editor can invite others. For a discreet pilot, family access should be off until the owner chooses otherwise. If enabled, set each invite to Viewer or Contributor unless the owner explicitly authorizes more, and test the exact questions, documents, events and checklists each can see/edit. Family editing of obituary/checklist content is distinct from permission to change the staff's room/vehicle/officiant schedule. The reviewed event-sharing page supports scheduling the arrangement meeting/service in Passare for family viewing and sharing; it does not show family editing the underlying staff calendar.

For export, Passare documents downloadable case CSV exports for categories such as event information, payments and goods/services, but each category is exported separately. Its 2026 release notes say event participants were added to event exports on July 7 and roles can be automatically added by service type. This is promising for independent retention, not evidence that one complete export contains all notes, task comments, access history, resource assignments, attachments or family edits. Define the export inventory first and demonstrate a repeatable export from a test case. Verify names, timestamps, time zones, event changes, assignees, statuses and linkable identifiers. Do not rely on screenshots or PDF output as the only independent copy.

The reviewed marketing/support pages give no Passare price for this six-person pilot. Request a written first-year all-in quote, separating implementation, migration, training, support, required add-ons, export fees and renewal terms. “Unlimited users” on a product page is not a budget quote. Do not expand scope into payment/accounting features merely to justify suite cost.

### 2.2 Baserow — configurable workflow with paid access controls

Baserow is a no-code database and app builder. The observed hosted Advanced tier is $18 per user/month billed yearly ($22 monthly), and the pricing page lists role-based permissions and audit logs. If six staff each need a paid seat, annual license arithmetic is $18 × 6 × 12 = $1,296. Setup, support, taxes, usage growth and procurement terms are outside that arithmetic. Recheck before purchase because pricing and plan allocation can change.

Restricted views are documented as securely filtering rows and hiding columns for selected users. A user invited only to a restricted view can see/export only visible rows/fields. The crucial rule is that a broader table role can bypass a restricted view and reveal other views; isolation requires removing or limiting broader table/database/workspace access. Field-level permissions restrict who can edit a field; they do not by themselves make a field invisible. The case design must use least-privilege access at workspace/database/table/view level, not merely hide fields in a normal shared view or lock editing.

For a pilot, model a low-sensitivity operational service record (service key, time, confirmation, room, vehicle, officiant, assigned staff and handoff status) separately from sensitive family information. Use restricted views per group or assigned work, then test real role accounts, alternate routes, exports and API tokens. A calendar view may represent dated records, but the reviewed docs do not establish hard room/vehicle conflict prevention, funeral-specific workflows, offline operation or an existing calm family experience. These need proof, not assumptions. A later family view could be explored, but public docs alone do not show the required least-privilege family behavior.

### 2.3 Nextcloud — local-control groupware with coarse calendar shares

The observed current Nextcloud documentation is Server 35. Calendar sharing is read-only or writable; with write access, sharees can add, edit and delete events. This is useful for staff coordination but too broad if staff may update logistics without seeing family details. Separate a minimal operational calendar from role-restricted case information, and keep family/cultural/payment/private-note text out of broadly shared events.

Nextcloud documents .ics event and calendar exports; its server admin manual says administrators may disable event export, so independent retention depends on admin configuration. .ics is exchangeable calendar data, not a complete case, note, task-board or audit export. The admin manual says room/resource booking requires an app-provided backend and lists a separate Calendar Resource Management app. Treat room/vehicle constraints as an integration dependency until tested.

The server docs say CalDAV change tokens support differential sync of offline clients such as Thunderbird. The default retains 10,000 token changes, and too-short retention can cause synchronization problems. This supports a cached client route, not browser offline editing or safe concurrent merge. A self-hosted server on the office LAN could keep staff access during a WAN outage only if local host, power and network remain available; this is an architecture inference, not a test. Test internet loss, local access, queued edits, conflicting edits, recovery and offsite family access separately. Avoid a second writable schedule as an offline copy.

Nextcloud's version-35 accessibility manual claims keyboard/assistive-technology support and aims for WCAG 2.1 AA (high contrast at AAA), documenting Tab/Shift+Tab, Enter/Space, Escape and skip links. Useful evidence, not an evaluation of Calendar or a board app with the staff member's setup. Calendar date selection, drag/move behavior, dialogs, notifications and task-board controls still need task-based keyboard trials. Translated interface labels do not automatically translate family content or guarantee its tone. Select actual family languages and test content with speakers.

A relevant import evolution chain demonstrates why independent export/import must be tested. Nextcloud Calendar issue #2572, reported against Calendar 2.0.4 / Server 19.0.2, described a .ics containing event and task components for which the desired existing calendar disappeared from the import picker. Discussion explains destination calendars must support the imported component types. PR #7876, merged as commit 02fb072fee39e83746b09582481f63c87505f14b on June 4, 2026, changed the picker to display unsupported calendars disabled with an explanation, including calendars with task/journal but no event support. The Calendar 6.6.0 changelog dated July 28 lists the component-support and picker work closing #2572. This is evidence that mixed event/task components have support boundaries and the UI evolves; it is not evidence that current Nextcloud export is broken. Test the exported events and handoff tasks in an independent target and preserve an explicit mapping.

The separately inspected Calendar code commit ea4d703419d9a7b7fc467071c760d7541af7af14 reads create/modify/delete ACL privileges individually rather than relying only on a read-only flag; its diff adds unit checks around those properties. This is source evidence that calendar ACL capability matters, not case-level field privacy. The user manual's share semantics remain the deciding constraint for simple group-shares.

### 2.4 Source limits and drift

Product manuals, marketing and pricing pages are mutable. Passare support pages do not consistently publish an app build/version, so page copyright/capture date is not a software version. Passare release notes are dated but do not identify a reproducible deployment. Baserow price is a dated public observation. Nextcloud docs here are Server 35; Calendar code findings use immutable commits and the history uses Calendar 6.6.0. Before a purchase, capture the actual SaaS version, signed order/renewal terms, support SLA, export format, privacy/data-processing terms, retention/deletion behavior and security documentation. No product instance was created or tested.

## 3. Product direction and pilot shape

Prefer a 30-day vendor-led pilot of a funeral-specific case/calendar product if a written quote fits the first-year $10,000 ceiling and the vendor demonstrates access, export, keyboard, language, resource and outage gates. Passare is the best documented first call because its calendar, event types, participants, tasks and family area map to this brief; it is not selected for purchase, because quote and fit remain unknown. Compare one locally relevant funeral case-management vendor using the same demonstration script.

Keep the initial staff-visible schedule sparse: a non-family-name service key, funeral-home local date/time with explicit zone, confirmation state, room/vehicle/provider, assigned staff, and change time/actor. Keep contact details, payment arrangements, sensitive preferences, faith/cultural requests and private notes in role-restricted case information. No public searchable directory, public calendar feed or open family link.

Model the pilot around four connected components:
- Service occurrence: stable case/service ID, date/time, venue/room, transport/vehicle, officiant/provider, assigned staff, confirmation state and change history.
- Checklist tasks: owner, due date/time, status, reminder and handoff/comment.
- Resource availability/overlap check that blocks or escalates unresolved conflicts.
- Separate least-privilege family/case record with optional family collaboration controlled by person and content area.

Keep taxonomy small until the owner decides what needs a genuinely separate workflow. A starting hypothesis is one case workflow with event entries for arrangement meeting, visitation/viewing, service, transport and room/material setup; add separate cremation, graveside or cultural workflows only if their handoffs differ. This is a testable starting point, not a product decision. Keep sensitive preference details out of shared event titles.

Do not default relatives to editing the staff schedule. A future family view may show limited confirmed times and accept correction requests from one named collaborator; staff remain editors of the resource schedule. For Passare, family access can begin as Viewer or Contributor rather than its documented default Editor. Whether any relative may alter calendar events remains an owner decision.

For weather outages, prefer a controlled degraded mode over two live schedules: produce a minimal read-only operational export for the next 48 hours before a forecasted storm; designate one coordinator to record changes on a numbered paper sheet; reconcile to the system after connectivity returns. If online updates during outages are required, run a LAN/offline proof or select a product that demonstrates it. Do not treat offline operation of an unrelated feature, such as audio recording, as calendar/task offline support.

## 4. Decisions to preserve

- Whether relatives get a family portal, which relative(s), which items are view-only, and whether anyone can edit schedule information.
- Retention period and deletion/archive process for personal planning notes, including any policy/legal-hold requirement the owner identifies.
- Which service types need different workflows rather than different event/checklist templates.
- Whether loss of external internet can stop staff editing or if office-LAN/offline operation is required; acceptable manual fallback.
- Whether staff scheduling exposes availability only or named participants, and which six staff roles can see/edit which case areas.
- Whether room, vehicle and officiant constraints hard-block, warn or require coordinator confirmation.
- Required languages, translated content and translation approver.
- System owner after launch: account administration, access changes, backup/export checks and vendor escalation.

## 5. Discriminating validations — proposed, not executed

No product trial, code execution against a product, accessibility session, export/import test, quote or outage simulation was executed.

1. **Permission matrix:** Create six fictional staff accounts with actual roles. Seed family contacts, cultural/service requests, private notes, event, task comments and payment arrangement. Attempt access through list, calendar, search, mobile, export and shared link/API. Pass only if unauthorized data and metadata stay hidden in every route, including notifications/exports; repeat after role changes.
2. **Event change/time zone:** Create a service involving a relative in another zone; move it twice after invitation. Verify local/remote display, IDs, notifications, old/new time, zone labels, actor, and that the old event is no longer marked confirmed. Exercise a daylight-saving boundary.
3. **Resource conflict:** Try two overlapping services with same room, vehicle and officiant; test tentative and confirmed conflicts. Record whether the system blocks, warns, permits override and retains actor/reason. Color alone does not pass.
4. **Handoff:** Run checklist tasks through owner, due time, reminder, completion, reassignment, comment and late change. Verify role visibility and owner notifications.
5. **Family scope:** Invite fictional Viewer, Contributor and Editor; try access/edit of event time/resource, private notes, contacts, preferences, checklists, obituary and files. Check invitation ownership, revocation, recovery and forwarding. Keep family invites off until owner approval.
6. **Independent retention:** Export all required categories, copy to owner-controlled storage and inspect without vendor login. Reconcile counts and fields for events, participants/resources, task owner/status/due time, change history, attachments/references and notes the owner elects to retain. Test .ics or cross-app import and mixed event/task components.
7. **Keyboard/translation:** Ask the staff member to find today's services, change an event, resolve a conflict, assign/complete a task, export a case and confirm a change without pointer input. Log focus traps, unlabeled controls, drag-only actions and unannounced states. Review invite/change notice in selected languages with fluent speakers, including phone display.
8. **Connectivity/recovery:** Simulate internet loss with office LAN/power up, then loss of LAN/power. Verify read/edit/notify/export/queue/conflict/recovery and family offsite behavior. Confirm one source of truth and reconcile paper/cache edits. Test restore from export/backup.
9. **Budget/support:** Compare written 12-month quote to $10,000 with setup, training, support, storage, integrations, migration, tax, renewal and exit/export. Identify seats, family access, paid features, export window, outage escalation and recovery SLA.

## 6. Process and limitation

Discovery and source assessment were performed in the active Luna context using only the exact assignment, exact input map, declared H01 brief and selected public primary documentation/code/release sources. No predecessor, counterpart, evaluator, campaign/history or plan-only file was read; there were no declared predecessors/source roots. No nested agents, Git/repository access, product account, downloaded executable or local product runtime was used.

The M16 method names three fresh contexts (discovery investigator, independent critic, fresh reviser) and the same assignment prohibits nested agents. Native Goal tools used here create/read/update the current thread's Goal and do not create an independent model context. I did not launch child agents or present a same-context self-check as independent review. Independent-critic/fresh-reviser context comparison is therefore unavailable under the stated no-nested-agent constraint. This limitation is disclosed; a same-context challenge pass can improve the written work but is not independent replication.

## 7. Source navigation

Source IDs are immutable references in source-map.json. Concise retained evidence notes and exact locators are in sources/evidence.md, indexed by sources/index.md. Current manuals/pricing are mutable snapshots. Nextcloud issue/PR/release and code commit identities are recorded separately; no source was silently rebound.
