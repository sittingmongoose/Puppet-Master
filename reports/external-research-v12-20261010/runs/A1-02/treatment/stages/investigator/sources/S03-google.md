# S03 — Google Calendar recurring events

- URL: https://developers.google.com/workspace/calendar/api/guides/recurringevents
- Version: Google Calendar API v3 guide; the live page gives no immutable release commit.
- Access observation: 2026-10-10T04:00:20Z.
- Locators: “instance-specific fields” and “Modify or delete instances”; cancellation code sample.

**Observed operation.** `recurringEventId` connects an instance to its master. `originalStartTime` is the scheduled start from recurrence data, can differ from current `start` after reschedule, and uniquely identifies the instance within the series. The guide retrieves the instance and updates that instance resource to create an exception; its cancellation example sets that instance status to `cancelled` and updates it.

**Conditions and applicability.** API authorization/provider IDs are required. The original-slot/current-start split transfers conceptually to UID/RECURRENCE-ID versus DTSTART; the Google event ID and JSON status field do not become iCalendar semantics.
