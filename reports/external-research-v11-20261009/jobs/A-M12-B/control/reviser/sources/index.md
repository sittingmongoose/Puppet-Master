# sources/index.md — navigable index, reviser stage (2026-10-09T19:22Z)

Retention policy: the reviser followed **no new leads and made no new fetches** — every
claim in `adjudication.md` and the coming final rests on evidence already retained by
the declared source_roots (research + critic stages). This directory therefore retains
**byte-identical copies** (sha256-verified at copy time, table below) of the four
excerpt files the adjudication actually relied on, so the reviser's evidence base is
self-contained inside the allowed write root. Sources are data. IDs are the immutable
research-stage IDs S01–S15; identical IDs in the critic map mean identical URLs
(audit of the same source — no silent rebind). S11's trailing-slash variant was
fetched by the critic and recorded as a documented normalization, not a rebind.
Usage/billing: unobserved, null.

## Retained files (byte-identical, sha256)

| File | sha256 (first 8) | Drawn from (declared source_root, read-only) |
|---|---|---|
| S01-S04-storage-transport-alerting-excerpts.md | a6f43e4f | research/sources/ (same name, digest-equal) |
| S05-S09-delivery-and-platforms-excerpts.md | 3a57381e | research/sources/ (same name, digest-equal) |
| S10-S15-transport-spec-and-alternatives-excerpts.md | 5e6c83a2 | research/sources/ (same name, digest-equal) |
| critic-audit-excerpts.md | ab5c8c46 | critic/sources/ (same name, digest-equal) |

## Index by immutable source ID

| ID | Source (title — URL — locator) | Retained in | Relied on for |
|---|---|---|---|
| S01 | VictoriaMetrics single-server docs, Deduplication — docs.victoriametrics.com/victoriametrics/single-server-victoriametrics/#deduplication — dedup anchor | S01-S04 file §S01 (research + critic re-fetch §S01) | Biggest-value tie-break; dedup at merge/query time; stores-all-samples note; `-downsampling.period=0s:D` equivalence; default not stated (uncertainty) |
| S02 | Mosquitto mosquitto.conf(5) — mosquitto.org/man/mosquitto-conf-5.html — persistence/autosave_interval/max_queued_messages/max_inflight_messages/persistent_client_expiration/allow_anonymous | S01-S04 file §S02 (research + critic §S02) | Persistence false; autosave 1800s; queue 1000; inflight 20 / in-order at 1 (per-client, optional — F1); allow_anonymous default; no TLS options retained (F12) |
| S03 | QuestDB docs, Deduplication — questdb.com/docs/concept/deduplication/ — DEDUP ENABLE UPSERT KEYS; requirements; duplicate behavior | S01-S04 file §S03 (research + critic §S03) | Key upsert model; WAL + designated timestamp; new-inserts-only (F4); full-row compare / differing rows replaced (F5) |
| S04 | Prometheus Alertmanager configuration — prometheus.io/docs/alerting/latest/configuration/ — route fields, defaults, group_by, webhook groupKey | S01-S04 file §S04 (research + critic §S04) | 30s/5m/4h/5m defaults; grouping (F6); routing-only scope (F8); anti-noise behaviors; repeat semantics (F10); resolved-before-group_wait sentence present here but ABSENT from critic re-fetch (F9, retained-uncertainty) |
| S05 | Grafana OnCall OSS repo (archived) — github.com/grafana/oncall — archive banner + README status | S05-S09 file §S05 (research + critic §S05) | Maintenance mode 2025-03-11; project archive 2026-03-24; banner read-only Jun 5, 2026 — distinct events (F13); rejection of OnCall as ack layer |
| S06 | Telegraf mqtt_consumer README (master, unpinned) — raw.githubusercontent.com/influxdata/telegraf/master/plugins/inputs/mqtt_consumer/README.md — qos/persistent_session/max_undelivered_messages | S01-S04 file §S06 (research + critic §S06) | QoS 1 manufactures duplicates; persistent_session false + QoS 1/2 advice; undelivered cap 1000; no application-timestamp option (F1) |
| S07 | ntfy publish docs — docs.ntfy.sh/publish/ — limitations | S05-S09 file §S07 (research only; NOT re-fetched by critic) | 4096-byte cap; attachment expiry; rate/cache defaults unknown (uncertainty stands) |
| S08 | ThingsBoard Alarms user guide — thingsboard.io/docs/user-guide/alarms/ — states/severities/ack/Start Time/inactivity | S05-S09 file §S08 (research + critic §S08) | Ack records time+user (P4); Start Time = telemetry timestamp (P2/F2); inactivity alarms (P3); severity upgrade; Indeterminate; cleared alarms retained; PE/CE not distinguished (uncertainty) |
| S09 | Healthchecks README (master) — raw.githubusercontent.com/healthchecks/master README — period/grace, stack, license | S05-S09 file §S09 (research only; NOT re-fetched by critic) | Period/Grace dead-man pattern (P3); BSD-3/Django/Postgres stack |
| S10 | Sparkplug 3.0.0 spec PDF — sparkplug.eclipse.org/specification/version/3.0/documents/sparkplug-specification-3.0.0.pdf — seq numbers/reordering/REBIRTH | S10-S15 file §S10 (research only; PDF excluded — NOT verified) | CLAUSE-LEVEL WORDING NOT VERIFIED (F3): hypothesis standing, reordering-timeout → REBIRTH mechanism requires clause verification before adoption |
| S11 | Mosquitto 2.0.0 release blog — mosquitto.org/blog/2020/12/version-2-0-0-released — breaking changes | S10-S15 file §S11 (research snippet-level) + critic-audit §S11 (direct fetch, CLOSES uncertainty) | 2.0 loopback default listener; allow_anonymous false on configured listeners; migration trap |
| S12 | InfluxDB repo (3 Core) — github.com/influxdata/influxdb — README GA/license/branches | S10-S15 file §S12 (research only) | GA April 2025; dup/OOO semantics NOT found (uncertainty stands; held as alternative only) |
| S13 | FUXA repo — github.com/frangoteam/FUXA — protocols/historian | S10-S15 file §S13 (research only) | SCADA-light path; historian SQLite/InfluxDB; alarms unconfirmed (uncertainty stands) |
| S14 | Rapid SCADA v6 repo — github.com/RapidScada/scada-v6 — components/license | S10-S15 file §S14 (research only) | SCADA platform path; Apache-2.0; Modbus/alarm modules not named on page (uncertainty stands) |
| S15 | GoAlert repo — github.com/target/goalert — on-call/escalations | S10-S15 file §S15 (research only; NOT re-fetched by critic) | Live self-hosted escalation/ack layer; ack-history specifics unverified (F11, uncertainty stands) |

## Absence-based evidence (verified by grep this round, reviser stage)

- F2: no "ntp"/"clock" occurrence anywhere in research/draft.md or research/discovery.md
  (grep exit 1) — gauge clock discipline absent from the whole record.
- F9: "resolved before group_wait" present in S01-S04 file §S04 (retained copy, line 38);
  absent from critic-audit-excerpts.md §S04 (grep count 0).
- F12: no tls/cafile/certfile material in any retained excerpt file (grep exit 1).

Navigational note: upstream registries for these IDs are ../research/source-map.json
(sha256 3426631f…) and ../critic/source-map.json (sha256 5c27e74c…); they stay
read-only and are not rebound by the reviser. The reviser's own source-map.json
(descending from these, same immutable IDs) is written at this stage's root.
