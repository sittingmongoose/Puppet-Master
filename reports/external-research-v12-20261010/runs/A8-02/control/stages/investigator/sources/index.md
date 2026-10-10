# Source index — investigator stage

Stable source IDs are referenced from discovery.md and (after release) draft.md. Do not silently rebind an ID to a different page or version. Full URLs, access UTC, locators, observed reads, conditions, and applicability are in [source-map.json](../source-map.json). Reads were public/read-only; no live stations, accounts, or services were accessed.

| ID | Source and navigable evidence |
|---|---|
| S01 | [The Things Stack MQTT Server](https://www.thethingsindustries.com/docs/integrations/other-integrations/mqtt/) — QoS 0 only; upstream application topics and example uplink. |
| S02 | [OASIS MQTT 3.1.1 Standard](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html) — QoS 0 at-most-once; QoS 1 may duplicate. |
| S03 | [The Things Stack Storage Integration](https://www.thethingsindustries.com/docs/integrations/storage/) — bounded retention and batch delay. |
| S04 | [The Things Stack Retrieve Messages](https://www.thethingsindustries.com/docs/integrations/storage/retrieve/) — separate message receipt, nested network receipt, gateway receive metadata and frame/session fields. |
| S05 | [The Things Stack troubleshooting](https://www.thethingsindustries.com/docs/concepts/features/console/troubleshooting/) — ABP counter reset case; multi-gateway dedup window caveat; timezone display. |
| S06 | [LoRa Alliance LoRaWAN L2 1.0.4 PDF](https://lora-alliance.org/wp-content/uploads/2021/11/LoRaWAN-Link-Layer-Specification-v1.0.4.pdf) — Section 4.3.1.5 frame-counter rules, conditional on this protocol version. |
| S07 | [The Things Stack Webhook Retries](https://www.thethingsindustries.com/docs/integrations/webhooks/retries/) — default single try; retries require supported/enabled deployment; bounded defaults. |
| S08 | [PostgreSQL 18 COPY](https://www.postgresql.org/docs/18/sql-copy.html) — CSV/header/error/STDIN semantics and defaults. |
| S09 | [PostgreSQL 18 constraints](https://www.postgresql.org/docs/18/ddl-constraints.html) — unique-key and null behavior. |
| S10 | [PostgreSQL 18 transactions](https://www.postgresql.org/docs/18/tutorial-transactions.html) — all-or-nothing database changes. |
| S11 | [Apache Beam Programming Guide](https://beam.apache.org/documentation/programming-guide/) — event-time watermarks, allowed lateness, triggers. |
| S12 | [Apache Beam TriggerExample.java, released tag v2.76.0](https://github.com/apache/beam/blob/v2.76.0/examples/java/src/main/java/org/apache/beam/examples/cookbook/TriggerExample.java) — executable-looking source was read only; zero allowed lateness drops late data, one-day example emits late panes. |
| S13 | [Apache Beam issue #36470](https://github.com/apache/beam/issues/36470) — Spanner partition watermark update reordering root cause and history. |
| S14 | [Apache Beam v2.69.0 release notes](https://github.com/apache/beam/releases/tag/v2.69.0) — identifies #36470 as fixed in that release. |
| S15 | [InfluxDB 3 Core line protocol](https://docs.influxdata.com/influxdb3/core/reference/line-protocol/) — same-key duplicate merge and nondeterministic conflict behavior; append-only recommendation. |

Research sources do not count as product validation. The full validation register is in discovery.md.
