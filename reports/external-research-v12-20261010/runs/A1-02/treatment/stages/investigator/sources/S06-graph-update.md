# S06 — Microsoft Graph event update

- URL: https://learn.microsoft.com/en-us/graph/api/event-update?view=graph-rest-1.0
- Version: Microsoft Graph REST v1.0 PATCH operation; live documentation.
- Access observation: 2026-10-10T04:00:20Z.
- Locators: property update notes; HTTP PATCH; occurrence-boundary response note.

**Observed operation/condition.** PATCH updates a particular event object. Documentation notes a modified occurrence can be rejected with `ErrorOccurrenceCrossingBoundary`: Outlook disallows moving an occurrence to/before the previous occurrence's day or to/after the following occurrence's day. Updating a master with separately edited instances may cause notifications for master and instances.

**Application.** This is Graph/Outlook operation behavior, not an iCalendar rule. It is relevant as a provider comparator and as a reason not to imply that API edit semantics transfer to file interchange.
