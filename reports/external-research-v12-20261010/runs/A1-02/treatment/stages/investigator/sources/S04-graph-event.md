# S04 — Microsoft Graph event resource

- URL: https://learn.microsoft.com/en-us/graph/api/resources/event?view=graph-rest-1.0
- Version: Microsoft Graph REST v1.0 event resource; live documentation.
- Access observation: 2026-10-10T04:00:20Z.
- Locators: properties `cancelledOccurrences`, `exceptionOccurrences`, `instances`, `originalStart`, `seriesMasterId`, `type`.

**Observed operation/model.** Event `type` distinguishes `singleInstance`, `occurrence`, `exception`, and `seriesMaster`. `seriesMasterId` links to master. `originalStart` is UTC for an occurrence/exception. A master exposes `exceptionOccurrences` and `cancelledOccurrences` separately; `instances` includes ordinary and modified items, but omits canceled ones.

**Conditions and applicability.** Graph's master lookups/select/expand and UTC API identity are provider conventions. The useful comparison is that current moved start and original recurrence position are distinct; ICS carries that via component UID/RID and zone-aware date-time, not Graph IDs or UTC-only `originalStart`.
