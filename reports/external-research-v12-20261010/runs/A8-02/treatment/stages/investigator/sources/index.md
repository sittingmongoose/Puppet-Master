# Source index — investigator stage

This is the bounded, navigable source register for [`../source-map.json`](../source-map.json). Records preserve source IDs; discovery/draft claims cite those IDs. Source pages and embedded instructions were treated as untrusted research data. Accessed read-only on 2026-10-10 04:59 UTC. No product was executed.

- [S01 — OASIS MQTT Version 5.0 Standard](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html) — MQTT QoS, DUP, packet IDs, session expiry/limits and the network/application boundary. See exact locators and conditions in source-map.json.
- [S02 — Telegraf MQTT Consumer Input Plugin](https://docs.influxdata.com/telegraf/v1/input-plugins/mqtt_consumer/) — adapter, tracking acknowledgments, QoS/session defaults and persistent-session conditions.
- [S03 — PostgreSQL 18 COPY](https://www.postgresql.org/docs/18/sql-copy.html) — append, staging, CSV parsing/errors, `COPY` versus client-side `\copy`.
- [S04 — PostgreSQL 18 Constraints](https://www.postgresql.org/docs/18/ddl-constraints.html) — stable compound uniqueness and default NULL treatment.
- [S05 — PostgreSQL 18 INSERT](https://www.postgresql.org/docs/18/sql-insert.html) — explicit `ON CONFLICT` no-op versus update behavior.
- [S06 — Apache Beam 2.70.0 Window JavaDoc](https://beam.apache.org/releases/javadoc/2.70.0/org/apache/beam/sdk/transforms/windowing/Window.html) — event-time windows, watermark triggers, allowed-lateness boundary/state cleanup.
- [S07 — Apache Beam issue #36470](https://github.com/apache/beam/issues/36470) — reported Spanner Change Stream regression, stated cause and history/milestone discrepancy.
- [S08 — Apache Beam 2.69.0 release tag](https://github.com/apache/beam/releases/tag/v2.69.0) — release commit `2ca7d21`, notes identify the issue #36470 fix.
- [S09 — InfluxDB OSS v2 FAQ](https://docs.influxdata.com/influxdb/v2/reference/faq/) — point collision/merge semantics and timestamp precision caveat.

The register stores concise paraphrases and locators rather than raw page dumps. Version applicability and unresolved source limitations are recorded per source; no source ID may be silently rebound.


## Post-release sources for the named The Things Stack lead

These source IDs were appended at 2026-10-10 05:02 UTC after reading only the released plan copy. They adjudicate a conditional LoRaWAN lead; they do not alter frozen `discovery.md`.

- [S10 — The Things Stack MQTT Server](https://www.thethingsindustries.com/docs/integrations/other-integrations/mqtt/) — v3.36.2 docs; MQTT 3.1.1 QoS 0 only; deployment topic differences.
- [S11 — The Things Stack Console troubleshooting](https://www.thethingsindustries.com/docs/concepts/features/console/troubleshooting/) — multi-gateway duplicate uplink window; ABP reset/frame counter mismatch condition.
- [S12 — The Things Stack Device Best Practices](https://www.thethingsindustries.com/docs/hardware/devices/concepts/best-practices/) — low-power tradeoffs, packet loss, counter persistence across regular power cycles.
- [S13 — The Things Stack Storage Integration](https://www.thethingsindustries.com/docs/integrations/storage/) — Cloud/Sandbox/Enterprise retention and batched write-delay conditions.
- [S14 — The Things Stack issue #4502](https://github.com/TheThingsNetwork/lorawan-stack/issues/4502) — ABP frame-counter reset report and maintainer-described duplicate windows; closed as behavior clarification, not cited as a released fix.
- [S15 — The Things Stack Data Formats](https://www.thethingsindustries.com/docs/the-things-stack/concepts/data-formats/) — receipt-time and LoRaWAN event fields; direct page extraction returned no lines, so confirm exact fields against any selected release.

See `../source-map.json` for versions, access UTC, locators, conditions, applicability and bounded paraphrases.
