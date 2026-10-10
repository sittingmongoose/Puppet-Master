# Reviser source index — A8-02-control

This index navigates the bounded public evidence used by the reviser. Source IDs are not rebound: S01–S15 are the investigator's records; C01–C15 are the critic's independent records; R01–R11 are this reviser's direct public rechecks. Full version/commit, locator, access UTC, observed operation, governing conditions, and applicability are preserved in [source-map.json](../source-map.json). Public documentation, code, and release history are research evidence, not product validation.

## Investigator records (S01–S15)

| ID | Public primary source and evidence | Reviser disposition |
|---|---|---|
| S01 | [The Things Stack MQTT Server](https://www.thethingsindustries.com/docs/integrations/other-integrations/mqtt/) — app uplink topics; QoS 0 only. | Candidate only if actual equipment uses TTS/LoRaWAN. Rechecked as R01. |
| S02 | [OASIS MQTT 3.1.1 Standard](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html) — QoS 0 may lose messages; QoS 1 may duplicate. | Confirms protocol-level delivery semantics only. Rechecked as R02. |
| S03 | [The Things Stack Storage Integration](https://www.thethingsindustries.com/docs/integrations/storage/) — bounded retention and batched write delay. | Optional reconciliation only, not the archive. Rechecked as R05. |
| S04 | [The Things Stack Retrieve Messages](https://www.thethingsindustries.com/docs/integrations/storage/retrieve/) — separate receipt fields and transport metadata. | Does not promise a universal device sample-time field. Rechecked as R06. |
| S05 | [The Things Stack troubleshooting](https://www.thethingsindustries.com/docs/concepts/features/console/troubleshooting/) — ABP reset and multi-gateway duplicate conditions. | Applies only to TTS/LoRaWAN-specific cases; duplicate path rechecked as R07. |
| S06 | [LoRa Alliance LoRaWAN L2 1.0.4 PDF](https://lora-alliance.org/wp-content/uploads/2021/11/LoRaWAN-Link-Layer-Specification-v1.0.4.pdf) — class profile and FCnt activation/retransmission rules. | Conditional on actual protocol/version; no evidence of device batching or battery life. Rechecked as R03. |
| S07 | [The Things Stack Webhook Retries](https://www.thethingsindustries.com/docs/integrations/webhooks/retries/) — default single try; enabled retries have conditions and bounds. | Conditional HTTP alternative only. Rechecked as R04. |
| S08 | [PostgreSQL 18 COPY](https://www.postgresql.org/docs/18/sql-copy.html) — CSV/client input, header/error defaults, and row-skip exception. | Loader supports proposed staging, not review or correction lineage. Rechecked as R08. |
| S09 | [PostgreSQL 18 constraints](https://www.postgresql.org/docs/18/ddl-constraints.html) — selected unique key and null behavior. | Apply only after a stable sample identity is known. |
| S10 | [PostgreSQL 18 transactions](https://www.postgresql.org/docs/18/tutorial-transactions.html) — database-side atomic grouping. | Supports proposed accept step; not external-file coordination. |
| S11 | [Apache Beam Programming Guide](https://beam.apache.org/documentation/programming-guide/) — watermarks, allowed lateness, and triggers. | Analogy for derived chart refresh only. Rechecked as R09. |
| S12 | [Apache Beam TriggerExample.java at v2.76.0](https://github.com/apache/beam/blob/v2.76.0/examples/java/src/main/java/org/apache/beam/examples/cookbook/TriggerExample.java) — zero/one-day example. | Read-only example, not executed or adopted as a club policy. |
| S13 | [Apache Beam issue #36470](https://github.com/apache/beam/issues/36470) — Spanner connector watermark-ordering failure. | Bounded analogue, not a club defect claim. Rechecked as R10. |
| S14 | [Beam v2.69.0 release notes](https://github.com/apache/beam/releases/tag/v2.69.0) — #36470 listed as fixed. | Confirms connector fix chain, not product validation. Rechecked as R11. |
| S15 | [InfluxDB 3 Core line protocol](https://docs.influxdata.com/influxdb3/core/reference/line-protocol/) — same-key merge and nondeterministic conflicts. | Optional chart projection only; do not rely on overwrite for correction history. |

## Critic records (C01–C15)

C01–C15 are separate critic-stage source records; they correspond to S01–S15 without changing the original IDs. They independently checked TTS QoS/storage/retries and receive metadata, OASIS QoS semantics, LoRaWAN 1.0.4 counters, PostgreSQL COPY/constraints/transactions, Beam late-data docs and example, issue #36470 and 2.69.0 release, and InfluxDB duplicate semantics. Exact records are in [source-map.json](../source-map.json). The critic's agreement is not treated as authority; disputed claims were rechecked directly as R01–R11.

## Reviser direct rechecks (R01–R11)

| ID | Primary source and checked point |
|---|---|
| R01 | [TTS MQTT Server](https://www.thethingsindustries.com/docs/integrations/other-integrations/mqtt/) — QoS 0 only; app upstream topic/envelope; no batching/power assertion. |
| R02 | [OASIS MQTT 3.1.1](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html) — QoS 0 no-response/no-retry protocol behavior; QoS 1 may duplicate. |
| R03 | [LoRaWAN L2 1.0.4](https://lora-alliance.org/wp-content/uploads/2021/11/LoRaWAN-Link-Layer-Specification-v1.0.4.pdf) — low-power/class description, ABP/OTAA frame counters, retransmission forwarding. |
| R04 | [TTS webhook retries](https://www.thethingsindustries.com/docs/integrations/webhooks/retries/) — default single try and conditional enabled retries. |
| R05 | [TTS Storage Integration](https://www.thethingsindustries.com/docs/integrations/storage/) — retention and batch-delay limits. |
| R06 | [TTS Retrieve Messages](https://www.thethingsindustries.com/docs/integrations/storage/retrieve/) — root/nested/gateway receipt timestamps and transport fields. |
| R07 | [TTS troubleshooting](https://www.thethingsindustries.com/docs/concepts/features/console/troubleshooting/) — multi-gateway duplicate outside dedup window. |
| R08 | [PostgreSQL 18 COPY](https://www.postgresql.org/docs/18/sql-copy.html) — append/stdin, header matching, fail-closed default, skip-row option. |
| R09 | [Apache Beam guide](https://beam.apache.org/documentation/programming-guide/) — allowed lateness gives derived window triggers opportunity to react. |
| R10 | [Apache Beam issue #36470](https://github.com/apache/beam/issues/36470) — reordered Spanner metadata watermark updates and 2.67 caching/filtering note. |
| R11 | [Beam 2.69.0 release](https://github.com/apache/beam/releases/tag/v2.69.0) — issue #36470 listed in bug fixes. |

No local implementation or executable source was run; these sources do not establish behavior of the club's devices, gateway, application, or archive.
