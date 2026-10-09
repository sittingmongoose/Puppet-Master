# Source index — C-01/H01 reviser

The reviser preserves predecessor source IDs and exact URLs. Original versions/commits, locators, original and reinspection timestamps, and observed operations are in [source-map.json](../source-map.json). Bounded paraphrased evidence is in [evidence.md](evidence.md). A source ID is not silently rebound; mutable-page drift is recorded on the original ID.

## Passare

- [PA01](evidence.md#pa01--manage-overview) — Manage overview; exact original URL returned 404 on critic reinspection.
- [PA02](evidence.md#pa02--calendar-support) — event popovers, privacy flags, personal calendar connection, print, and participant notifications.
- [PA03](evidence.md#pa03--event-types) — defaults and funeral-related event configuration.
- [PA04](evidence.md#pa04--staff-roles) — staff area roles and read-only controls.
- [PA05](evidence.md#pa05--checklists) — internal/family checklist visibility.
- [PA06](evidence.md#pa06--planning-center-and-internet) — family portal features and internet requirement.
- [PA07](evidence.md#pa07--planning-center-roles) — Viewer, Contributor, Editor roles and defaults.
- [PA08](evidence.md#pa08--family-event-viewing) — event viewing in Planning Center.
- [PA09](evidence.md#pa09--tasks) — task owners, due times, reminders, completion, and comments.
- [PA10](evidence.md#pa10--case-export) — separate category CSV exports.
- [PA11](evidence.md#pa11--2026-release-notes) — dated notification, participant-export, and role-default updates.

## Nextcloud

- [NC01](evidence.md#nc01--calendar-user-manual-server-35) — sharing rights and `.ics` exports.
- [NC02](evidence.md#nc02--calendarcaldav-administration-manual-server-35) — room/resource backend, 30-day trash purge, sync tokens.
- [NC03](evidence.md#nc03--universal-access-user-manual-server-35) — current vendor accessibility claim; critic/reviser fetch discrepancy recorded.
- [NC04](evidence.md#nc04--calendar-issue-2572) — historical import issue.
- [NC05](evidence.md#nc05--fix-pr-7876) — picker fix.
- [NC06](evidence.md#nc06--merge-commit-for-pr-7876) — immutable change and tests.
- [NC07](evidence.md#nc07--calendar-changelog) — release entry for supported component types and picker work.
- [NC08](evidence.md#nc08--calendar-acl-code-commit) — separate calendar create/modify/delete privileges.

## Baserow

- [BR01](evidence.md#br01--hosted-pricing) — hosted Advanced price and 180-day row-change history.
- [BR02](evidence.md#br02--restricted-view-permissions) — filtered/exported view limits and broader-role bypass risk.
