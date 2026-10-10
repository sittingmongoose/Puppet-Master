# S07 — Microsoft Graph list instances

- URL: https://learn.microsoft.com/en-us/graph/api/event-list-instances?view=graph-rest-1.0
- Version: Microsoft Graph REST v1.0 method; live documentation.
- Access observation: 2026-10-10T04:00:34Z.
- Locators: description, GET `/events/{id}/instances`, date range parameters and `Prefer: outlook.timezone` header.

**Observed operation.** GET lists occurrences and exceptions for a series master over required start/end date-time bounds. If no `Prefer: outlook.timezone` header is supplied, returned times are UTC; header selects a supported zone for start/end in response.

**Application.** This illustrates retrieving a concrete occurrence before provider-side modification. It requires auth and a service; it is not in the trusted-file-only build.
