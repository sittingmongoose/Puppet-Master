# S05 — Microsoft Graph event cancellation

- URL: https://learn.microsoft.com/en-us/graph/api/event-cancel?view=graph-rest-1.0
- Version: Microsoft Graph REST v1.0 action; live documentation.
- Access observation: 2026-10-10T04:00:20Z.
- Locators: description, POST request path, permission table, optional comment body.

**Observed operation.** Organizer calls `POST /events/{id}/cancel`; it removes the event and sends the supplied optional comment to attendees. Organizer can target one recurring occurrence by supplying the occurrence event ID. Attendee invocation fails; this differs from DELETE because it is organizer-only and supports the attendee message.

**Application.** This is a live provider operation with permissions and notifications. The offline file editor has no credentials or provider connection, so it should only emit a file representation and must not claim to cancel anybody's invitation.
