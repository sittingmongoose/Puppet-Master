# Primary-source index — reviser stage

This is the compact navigation layer for the complete reviser [`source-map.json`](../source-map.json). Inherited IDs S01–S15 are preserved exactly; the investigator and critic records remain embedded in the map. The independent reviser checks add evidence to those IDs and do not silently rebind them. Sources were retrieved read-only. No downloaded code or product was run.

## Standards, product documentation and history

- [S01 — OASIS MQTT Version 5.0 Standard](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html) — QoS, packet identifiers/DUP, session semantics and protocol/network scope. Versioned 2019 standard; see the exact sections and conditions in the inherited source records.
- [S02 — Telegraf MQTT Consumer](https://docs.influxdata.com/telegraf/v1/input-plugins/mqtt_consumer/) — rolling v1 adapter documentation, QoS/session defaults and tracking acknowledgment conditions.
- [S03 — PostgreSQL 18 COPY](https://www.postgresql.org/docs/18/sql-copy.html) — append behavior, CSV parsing/error handling, and server-side `COPY` versus client-side `\copy`.
- [S04 — PostgreSQL 18 Constraints](https://www.postgresql.org/docs/18/ddl-constraints.html) — compound uniqueness and NULL treatment.
- [S05 — PostgreSQL 18 INSERT](https://www.postgresql.org/docs/18/sql-insert.html) — explicit `ON CONFLICT DO NOTHING` and `DO UPDATE` behavior.
- [S06 — Apache Beam 2.70.0 Window JavaDoc](https://beam.apache.org/releases/javadoc/2.70.0/org/apache/beam/sdk/transforms/windowing/Window.html) — **reopened 2026-10-10 05:25:08 UTC** at Triggers/`Duration.ZERO` examples (lines 42–70) and `withAllowedLateness` (lines 271–275). The same configured duration controls lateness acceptance/state cleanup; zero is not a contradictory exception. Beam window behavior is an analogy only.
- [S07 — Apache Beam issue #36470](https://github.com/apache/beam/issues/36470) — Spanner Change Stream watermark regression/stall report and issue/release milestone discrepancy.
- [S08 — Apache Beam 2.69.0 release](https://github.com/apache/beam/releases/tag/v2.69.0) — official release-note entry for the Spanner partition-watermark stall fix; no patch mechanics are claimed.
- [S09 — InfluxDB OSS v2 FAQ](https://docs.influxdata.com/influxdb/v2/reference/faq/) — point-key/field merge and precision-collision behavior; not evidence for InfluxDB 3.
- [S10 — The Things Stack MQTT Server](https://www.thethingsindustries.com/docs/integrations/other-integrations/mqtt/) — **reopened 2026-10-10 05:25:08 UTC**, MQTT Server heading and note (lines 19–25), deployment topic note (lines 26–34). The named TTS server page specifies MQTT 3.1.1 and QoS 0 only; not a claim about generic MQTT.
- [S11 — The Things Stack troubleshooting](https://www.thethingsindustries.com/docs/concepts/features/console/troubleshooting/) — **reopened 2026-10-10 05:25:08 UTC**, ABP reset condition (lines 46–49) and Duplicate Uplink (lines 54–56). Describes a TTS/LoRaWAN multiple-gateway network dedup case, not application/archive replay.
- [S12 — The Things Stack device best practices](https://www.thethingsindustries.com/docs/hardware/devices/concepts/best-practices/) — conditional LoRaWAN packet-loss and counter/session persistence guidance.
- [S13 — The Things Stack Storage Integration](https://www.thethingsindustries.com/docs/integrations/storage/) — **reopened 2026-10-10 05:25:08 UTC**, overview/retention/Cloud scope/batching (lines 19–34) and enablement/configuration (lines 69–75). Supports OI-01: this Application Package must be enabled/used for the relevant application/device; edition, retention and delayed batch behavior remain conditions.
- [S14 — The Things Network lorawan-stack issue #4502](https://github.com/TheThingsNetwork/lorawan-stack/issues/4502) — **reopened 2026-10-10 05:25:08 UTC**, issue/reset report (lines 151–181) and maintainer duplicate-window/cooldown discussion (lines 226–259). TTS/LoRaWAN behavior history only; not treated as a released fix.
- [S15 — The Things Stack Data Formats](https://www.thethingsindustries.com/docs/the-things-stack/concepts/data-formats/) — original requested URL and source ID preserved. **Reopened by official navigation from S10 at 2026-10-10 05:25:44 UTC**; it reaches [the current official Data Formats page](https://www.thethingsindustries.com/docs/integrations/data-formats/), `Uplink Messages` lines 79–109 and 132. The example labels outer `received_at` as Application Server receipt, nested `uplink_message.received_at` as Network Server receipt and `rx_metadata.time` as gateway receipt. It does not establish sensor observation time or pin the club’s payload version.

## Reviser adjudication map

- **SCW-01:** retain the TTS-specific 3.1.1/QoS 0 claim; reject the proposed MQTT 5.0 substitution. S10.
- **SCW-02 / OI-01:** retain uplink-only Cloud scope, edition retention and batch delay; add per-application/device enablement. S13.
- **SCW-03 / OI-02:** retain separate server receipt fields; record the official redirect/navigation and exact Uplink Messages locator. S15.
- **SCW-04:** retain Beam analogy; both C and C* are supported by the generic rule and zero-duration example. S06.
- **SCW-05:** retain TTS network multi-gateway dedup boundary and ABP/LoRaWAN specificity; reject an application-archive replay reading for the TTS duplicate window. S11, S14.

Exact source URLs, release/version scope, access operations, governing conditions and applicability for all inherited and reviser records are in `source-map.json`. See [`../final.md`](../final.md) for the complete proposal and the full evidence-based dispositions.
