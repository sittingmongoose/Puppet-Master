# Source index — A-M12-B / control / research

Navigable index of retained evidence under `sources/`. Source IDs are immutable once assigned in `source-map.json`; no silent rebind. Access timestamps, locators, versions/commits, observed operations and uncertainties live in `source-map.json` (machine-readable).

| ID | Title / locator | Retained evidence | Serves |
|----|-----------------|-------------------|--------|
| S01 | VictoriaMetrics docs — Deduplication (`-dedup.minScrapeInterval`, tie-break, `-streamAggr.dedupInterval`) | `sources/S01-S04-storage-transport-alerting-excerpts.md` §S01 | O1 O2 |
| S02 | Mosquitto mosquitto.conf(5) — persistence/queue/inflight defaults | `sources/S01-S04-storage-transport-alerting-excerpts.md` §S02 | O1 O2 O3 |
| S03 | QuestDB docs — DEDUP ENABLE UPSERT KEYS (WAL, designated ts, forward-only) | `sources/S01-S04-storage-transport-alerting-excerpts.md` §S03 | O1 O2 O3 |
| S04 | Prometheus Alertmanager configuration — group/repeat/resolve defaults, groupKey | `sources/S01-S04-storage-transport-alerting-excerpts.md` §S04 | O2 |
| S05 | Grafana OnCall OSS repo (archived 2026-03-24, AGPL-3.0) — retirement chain | `sources/S05-S09-delivery-and-platforms-excerpts.md` §S05 | O1 O3 |
| S06 | Telegraf mqtt_consumer README — qos/persistent_session/max_undelivered defaults | `sources/S01-S04-storage-transport-alerting-excerpts.md` §S06 | O2 |
| S07 | ntfy docs — 4096-byte message cap, attachment limits/expiry | `sources/S05-S09-delivery-and-platforms-excerpts.md` §S07 | O1 O2 |
| S08 | ThingsBoard Alarms guide — 4-state lifecycle, ack recording, telemetry-timestamp Start Time | `sources/S05-S09-delivery-and-platforms-excerpts.md` §S08 | O1 O2 |
| S09 | Healthchecks README — dead-man's switch, Period+Grace, self-hosting stack, BSD-3 | `sources/S05-S09-delivery-and-platforms-excerpts.md` §S09 | O1 O2 |
| S10 | Sparkplug 3.0.0 spec (Eclipse PDF) — seq 0–255 wrap, reordering timeout, REBIRTH | `sources/S10-S15-transport-spec-and-alternatives-excerpts.md` §S10 | O1 O3 |
| S11 | Mosquitto 2.0.0 release blog — breaking default change (loopback, allow_anonymous) | `sources/S10-S15-transport-spec-and-alternatives-excerpts.md` §S11 | O3 |
| S12 | InfluxDB GitHub — v3 Core GA 2025-04, license, legacy branches | `sources/S10-S15-transport-spec-and-alternatives-excerpts.md` §S12 | O1 O3 |
| S13 | FUXA GitHub — MIT web SCADA/HMI, protocols, built-in historian | `sources/S10-S15-transport-spec-and-alternatives-excerpts.md` §S13 | O1 |
| S14 | Rapid SCADA v6 GitHub — Apache-2.0 industrial platform, ScadaComm/Server/Web | `sources/S10-S15-transport-spec-and-alternatives-excerpts.md` §S14 | O1 |
| S15 | GoAlert GitHub — Apache-2.0 on-call/escalation, active | `sources/S10-S15-transport-spec-and-alternatives-excerpts.md` §S15 | O1 O2 |

Completeness: every source-map entry has a row and a retained file section (snippet-level evidence for S10/S11 is explicitly flagged there and in source-map uncertainties). Discovery narrative: `discovery.md`.
