# Critic source index — A8-02-control

C01–C15 are this critic’s independent source checks. They correspond to investigator IDs S01–S15 in the same order as documented in source-map.json; original IDs are preserved and not rebound. All retrieval was public/read-only. Access times are the immediate UTC readings after their retrieval batches.

| Critic ID | Investigator ID | Primary source and checked point |
|---|---|---|
| [C01](../source-map.json) / S01 | S01 | [The Things Stack MQTT Server](https://www.thethingsindustries.com/docs/integrations/other-integrations/mqtt/) — MQTT 3.1.1, QoS 0 only, uplink topics; not a device/battery guarantee. |
| C02 / S02 | S02 | [OASIS MQTT 3.1.1 Standard](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html) — QoS 0 may lose messages; QoS 1 can duplicate. |
| C03 / S07 | S07 | [TTS Webhook Retries](https://www.thethingsindustries.com/docs/integrations/webhooks/retries/) — Cloud Plus condition and single-try default. |
| C04 / S03 | S03 | [TTS Storage Integration](https://www.thethingsindustries.com/docs/integrations/storage/) — deployment retention, Cloud scope, batching delay. |
| C05 / S05 | S05 | [TTS Troubleshooting](https://www.thethingsindustries.com/docs/concepts/features/console/troubleshooting/) — ABP reset and multi-gateway dedup caveats. |
| C06 / S06 | S06 | [LoRa Alliance LoRaWAN L2 1.0.4 PDF](https://lora-alliance.org/wp-content/uploads/2021/11/LoRaWAN-Link-Layer-Specification-v1.0.4.pdf) — activation-specific frame counters and retransmission rules. |
| C07 / S04 | S04 | [TTS Retrieve Messages](https://www.thethingsindustries.com/docs/integrations/storage/retrieve/) — distinct receive-time fields and transport metadata. |
| C08 / S08 | S08 | [PostgreSQL 18 COPY](https://www.postgresql.org/docs/18/sql-copy.html) — CSV, error defaults, and row-skipping exception. |
| C09 / S09 | S09 | [PostgreSQL 18 constraints](https://www.postgresql.org/docs/18/ddl-constraints.html) — selected unique keys and null behavior. |
| C10 / S10 | S10 | [PostgreSQL 18 transactions](https://www.postgresql.org/docs/18/tutorial-transactions.html) — atomic database changes; not external-file coordination. |
| C11 / S11 | S11 | [Apache Beam Programming Guide](https://beam.apache.org/documentation/programming-guide/) — event-time, watermarks, allowed lateness, triggers. |
| C12 / S12 | S12 | [Beam TriggerExample.java at v2.76.0](https://github.com/apache/beam/blob/v2.76.0/examples/java/src/main/java/org/apache/beam/examples/cookbook/TriggerExample.java) — zero-lateness drop and one-day late panes; read only. |
| C13 / S13 | S13 | [Beam issue #36470](https://github.com/apache/beam/issues/36470) — Spanner watermark reordering root cause, release reference, later closure. |
| C14 / S14 | S14 | [Beam v2.69.0 release notes](https://github.com/apache/beam/releases/tag/v2.69.0) — #36470 listed as fixed. |
| C15 / S15 | S15 | [InfluxDB 3 Core line protocol](https://docs.influxdata.com/influxdb3/core/reference/line-protocol/) — same-key merge and nondeterministic overwrite warning; append-only pattern. |

For exact version, locator, UTC, observed operation, governing condition/default/exception, and applicability, see the matching C record in [source-map.json](../source-map.json). No code was downloaded or run. These sources are research evidence, not product validation.
