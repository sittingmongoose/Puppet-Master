# Shard 129: Stream C closure fixes addendum (2026-11-26)

Source: `Plans/Contracts_V0.md`

Source lines: L57866-L57882

Source SHA256: `621171da165c9602332236e4074ff39f307bcf230c732031310e7a1d0c7bc4f4`

---

## Stream C closure fixes addendum (2026-11-26)

### Concern record envelope, references, and redaction fields

These required fields complete the [ConcernRecord field table](#concern-record-family-lifecycle-and-deferred-visibility).

| Field | Requirement |
| --- | --- |
| `schema_id` | Required; const `pm.storage_value.concern_record.v1`. |
| `record_id` | Required; non-empty string. Storage record identity. |
| `record_kind` | Required; const `concern`. |
| `revision` | Required; integer, at least 1; the first record is revision 1. |
| `creator_ref` | Required; `pmref:<kind>:<id>` string (8-320 chars). The actor or validator that raised the concern. |
| `subject_ref` | Required; `pmref:<kind>:<id>` string (8-320 chars). |
| `artifact_refs[]` | Required; 0-64 unique `pmref:<kind>:<id>` string (8-320 chars)s. Runtime artifacts, nodes, packages, seams, route/open subjects or external resources affected beyond the primary `scope_ref`. |
| `summary` | Required; `pmref:<kind>:<id>` string (8-320 chars). The summary text is held behind the ref, because the record is `secret_refs_only`. |
| `redaction_profile` | Required; const `secret_refs_only`. |
