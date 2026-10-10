# Critic source index — A8-02-treatment

Source IDs S01–S15 are copied from the investigator map without rebinding. The critic map preserves each original URL/version and adds independent access UTC, direct locator, operation and applicability. Read-only primary-source retrieval occurred 2026-10-10 05:14–05:17 UTC. No product was operated.

## Standards and general mechanisms

- [S01 — OASIS MQTT Version 5.0](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html) — QoS, packet DUP, session and protocol scope; §§3.3.1, 4.3.3, 4.6.
- [S02 — Telegraf MQTT Consumer](https://docs.influxdata.com/telegraf/v1/input-plugins/mqtt_consumer/) — QoS default, persistent session, client ID, tracking acknowledgment configuration.
- [S03 — PostgreSQL 18 COPY](https://www.postgresql.org/docs/18/sql-copy.html) — append behavior, conversion-error default and server/client file boundary.
- [S04 — PostgreSQL 18 Constraints](https://www.postgresql.org/docs/18/ddl-constraints.html) — unique key and NULL behavior.
- [S05 — PostgreSQL 18 INSERT](https://www.postgresql.org/docs/18/sql-insert.html) — conflict actions.
- [S06 — Apache Beam 2.70.0 Window JavaDoc](https://beam.apache.org/releases/javadoc/2.70.0/org/apache/beam/sdk/transforms/windowing/Window.html) — event-time triggers, allowed lateness, late drops and cleanup.
- [S07 — Apache Beam issue #36470](https://github.com/apache/beam/issues/36470) — Spanner Change Stream watermark stall report and milestone/activity.
- [S08 — Apache Beam 2.69.0 release notes](https://github.com/apache/beam/releases/tag/v2.69.0) — release-note fix entry.
- [S09 — InfluxDB OSS v2 FAQ](https://docs.influxdata.com/influxdb/v2/reference/faq/) — duplicate-point identity and precision collisions.

## Conditional The Things Stack evidence

- [S10 — MQTT Server](https://www.thethingsindustries.com/docs/integrations/other-integrations/mqtt/) — specific TTS server protocol/QoS scope.
- [S11 — Troubleshooting Console](https://www.thethingsindustries.com/docs/concepts/features/console/troubleshooting/) — multi-gateway duplicate window and ABP reset condition.
- [S12 — Device Best Practices](https://www.thethingsindustries.com/docs/hardware/devices/concepts/best-practices/) — LoRaWAN packet loss and frame-counter persistence guidance.
- [S13 — Storage Integration](https://www.thethingsindustries.com/docs/integrations/storage/) — per-app/device enablement, edition retention, delay and Cloud uplink-only scope.
- [S14 — lorawan-stack issue #4502](https://github.com/TheThingsNetwork/lorawan-stack/issues/4502) — ABP counter-reset report and maintainer network-server dedup discussion; not a release fix.
- [S15 — Data Formats](https://www.thethingsindustries.com/docs/the-things-stack/concepts/data-formats/) — official link navigation reaches [the integration data-format page](https://www.thethingsindustries.com/docs/integrations/data-formats/); Uplink Messages lines 79–133 distinguish server and gateway receipt times.

Exact versions, access times, conditions, applicability and bounded evidence are in [source-map.json](../source-map.json). The link for S15 is recorded as a redirect while preserving its original source ID and requested URL.

## Bounded scope-bearing excerpts observed

- S10: “The Things Stack supports the MQTT Standard Version 3.1.1 and QoS 0 only.”
- S13: “can be enabled per application or end device”; “Cloud stores only uplink messages.”
- S15: “received by the Application Server”; “received by the Network Server.”
- S06: “Any elements that are later than this as decided by the system-maintained watermark will be dropped.”
- S11: “received and forwarded by multiple gateways”

These short excerpts retain their original source IDs and locations in source-map.json. The remaining source-map evidence is paraphrased.
