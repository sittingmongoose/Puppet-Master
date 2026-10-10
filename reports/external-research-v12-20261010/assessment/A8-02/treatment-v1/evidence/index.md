# Independent primary evidence — A8-02 treatment-v1

All pages were reopened by this reviewer using read-only public GET. Raw responses, decoded text, access times and SHA-256 are preserved; these records are independent of the candidate source maps. Locators below refer to numbered local text and governing headings. Retrieval and file hashes establish identity only, not semantic truth.

[Assessment](../assessment.md) · [Source map](../source-map.json) · [Retrieval manifest](retrieval-manifest.json) · [Original inspected hashes](../original-inspected-hashes.json).

## R01

**MQTT protocol delivery and durable identity** — carried S01.

**Primary URL:** [https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html).

**Version/applicability:** OASIS MQTT 5.0 Standard, 2019-03-07; v5 only.

**Independent access:** 2026-10-10T05:35:04.748431+00:00 → 2026-10-10T05:35:05.200555+00:00; HTTP 200; Independent reviewer public HTTP GET; no product execution.

**Response:** [S01.html](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S01.html); SHA-256 `8b382adcb0104462ffcdff445c2e6c64247571ccfb8385b10c121adfdc9de6aa`. Decoded text: [S01.txt](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S01.txt); SHA-256 `913603e48e7cd25a5fb132723c7fc72bdccfed6e2513aa27cacc3fad4e166dea`.

**Governing context:**

- 2.2.1 Packet Identifier — [local lines 1565–1588](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S01.txt:1565).
- 3.1.2.11.2 Session Expiry Interval — [local lines 2372–2394](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S01.txt:2372).
- 3.3.1.1 DUP — [local lines 3500–3526](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S01.txt:3500).
- 4.1.1 Stored state / 4.2 transport / 4.3 QoS — [local lines 6237–6306](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S01.txt:6237).
- 4.3.2-3 QoS — [local lines 6326–6386](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S01.txt:6326).
- QoS 2 onward delivery note — [local lines 6468–6475](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S01.txt:6468).

**Independent semantic disposition:** QoS concerns one sender/receiver exchange, not sampling or archive durability. Packet IDs can be reused; DUP is packet-scoped. The absent CONNECT session-expiry default is 0 seconds; stored-state limits remain. These facts support distinct transport and observation identity, not an exactly-once observation promise.

## R02

**Telegraf adapter defaults and acknowledgments** — carried S02.

**Primary URL:** [https://docs.influxdata.com/telegraf/v1/input-plugins/mqtt_consumer/](https://docs.influxdata.com/telegraf/v1/input-plugins/mqtt_consumer/).

**Version/applicability:** Rolling Telegraf v1 plugin docs; no selected binary.

**Independent access:** 2026-10-10T05:35:04.750515+00:00 → 2026-10-10T05:35:05.022129+00:00; HTTP 200; Independent reviewer public HTTP GET; no product execution.

**Response:** [S02.html](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S02.html); SHA-256 `73191611e45b7c0a469b9cb99dbf4d24f6f40b602e64aaedd4adb6d053620123`. Decoded text: [S02.txt](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S02.txt); SHA-256 `c3c0ca525b2326e17e87ca7be1436dd803f4baaf715943942135dc8c4714923b`.

**Governing context:**

- Tracking metric support — [local lines 532–535](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S02.txt:532).
- Configuration: qos, undelivered messages, persistent_session, client_id — [local lines 574–618](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S02.txt:574).

**Independent semantic disposition:** Tracking metrics report delivery to all outputs before acknowledgment. Config shows QoS 0 and persistent_session=false; offline reception needs stable client ID, persistent session and publisher/subscriber QoS 1/2. Persistent sessions retain initial topics. Output handling is not proof of durable club archival; final leaves configuration and testing open.

## R03

**CSV staging and COPY behavior** — carried S03.

**Primary URL:** [https://www.postgresql.org/docs/18/sql-copy.html](https://www.postgresql.org/docs/18/sql-copy.html).

**Version/applicability:** PostgreSQL 18 versioned manual; minor/client unselected.

**Independent access:** 2026-10-10T05:35:04.751985+00:00 → 2026-10-10T05:35:05.385780+00:00; HTTP 200; Independent reviewer public HTTP GET; no product execution.

**Response:** [S03.html](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S03.html); SHA-256 `863af226486bf2f4d3c8e78be71dc78ca8b6b9659da3c073219abe7c164e123a`. Decoded text: [S03.txt](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S03.txt); SHA-256 `371a8e2468b454a26f7bccc2af7fe7b63702538a2e793701157581c4e95851b0`.

**Governing context:**

- Description — [local lines 100–105](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S03.txt:100).
- ON_ERROR and REJECT_LIMIT — [local lines 150–155](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S03.txt:150).
- Notes: file access, privileges, RLS, triggers, date/encoding — [local lines 172–185](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S03.txt:172).
- CSV Format — [local lines 217–229](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S03.txt:217).

**Independent semantic disposition:** COPY FROM appends. Conversion stop is default; ignore drops rows only in text/CSV. Client psql copy and server file access differ. CSV null/empty, whitespace and multiline records need declared parsing. These support staged optional import and preserved file/record lineage; they do not prove the club export works.

## R04

**Database uniqueness is not physical observation identity** — carried S04.

**Primary URL:** [https://www.postgresql.org/docs/18/ddl-constraints.html](https://www.postgresql.org/docs/18/ddl-constraints.html).

**Version/applicability:** PostgreSQL 18, 5.5.3 Unique Constraints.

**Independent access:** 2026-10-10T05:35:04.753945+00:00 → 2026-10-10T05:35:05.362470+00:00; HTTP 200; Independent reviewer public HTTP GET; no product execution.

**Response:** [S04.html](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S04.html); SHA-256 `016a3d09f5f2fb894b7e9025dd6fcdbf4cda552b4f0ea3ce5c438a3f82a68c6b`. Decoded text: [S04.txt](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S04.txt); SHA-256 `aafd1f0596e0ee75b8e74f9652d552e82dfc934e742f299d6cbbc2c437d1bda0`.

**Governing context:**

- Unique constraints, composite keys and NULLS DISTINCT / NOT DISTINCT — [local lines 179–224](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S04.txt:179).

**Independent semantic disposition:** A constraint enforces its selected column key. NULLs are distinct by default, with an explicit NOT DISTINCT alternative. Requiring a validated non-null event key is a local ingestion design choice, not a claim that PostgreSQL lacks other uniqueness modes.

## R05

**Conflict actions encode replay/correction policy** — carried S05.

**Primary URL:** [https://www.postgresql.org/docs/18/sql-insert.html](https://www.postgresql.org/docs/18/sql-insert.html).

**Version/applicability:** PostgreSQL 18 INSERT manual.

**Independent access:** 2026-10-10T05:35:04.755802+00:00 → 2026-10-10T05:35:05.336917+00:00; HTTP 200; Independent reviewer public HTTP GET; no product execution.

**Response:** [S05.html](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S05.html); SHA-256 `0684801db086ef1e9eefea6b72c84d9290e5dc5ba3b6254bfc62b4dc0b92a234`. Decoded text: [S05.txt](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S05.txt); SHA-256 `f6f450a71dc04c7eaeedda58c2a48a54fab1848171fe834a5e4bfa933dcf3289`.

**Governing context:**

- ON CONFLICT Clause — [local lines 139–147](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S05.txt:139).

**Independent semantic disposition:** DO NOTHING avoids conflicting insertion; DO UPDATE updates the conflicting row. Atomic upsert has an independent-error condition. Final correctly separates immutable raw evidence, logical observation and projection policy rather than using an upsert as a lineage guarantee.

## R06

**Event-time analogy, triggers and lateness** — carried S06.

**Primary URL:** [https://beam.apache.org/releases/javadoc/2.70.0/org/apache/beam/sdk/transforms/windowing/Window.html](https://beam.apache.org/releases/javadoc/2.70.0/org/apache/beam/sdk/transforms/windowing/Window.html).

**Version/applicability:** Apache Beam Java SDK 2.70.0 Window JavaDoc.

**Independent access:** 2026-10-10T05:35:04.761381+00:00 → 2026-10-10T05:35:05.216899+00:00; HTTP 200; Independent reviewer public HTTP GET; no product execution.

**Response:** [S06.html](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S06.html); SHA-256 `7e061e459caa2beff0e1a12c10427f5fc89c646933a7e8233ebdd9ec22581893`. Decoded text: [S06.txt](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S06.txt); SHA-256 `220dafbae02202ce1add0fa1e31bada3cbec9b74ebe4149c9b1614bc6e9f92c9`.

**Governing context:**

- Window transform and event-time windowing — [local lines 38–49](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S06.txt:38).
- Triggers, one-day and Duration.ZERO examples — [local lines 67–103](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S06.txt:67).
- triggering and withAllowedLateness — [local lines 207–238](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S06.txt:207).

**Independent semantic disposition:** Event-time assignment and default trigger behavior are documented. Allowed lateness governs downstream acceptance/state at grouping and uses watermark progress; zero follows the same rule. Trigger/accumulation choices matter. The final restricts this to an analogy and explicitly prevents late-window dropping from deleting raw observations.

## R07

**Reported watermark regression and issue history** — carried S07.

**Primary URL:** [https://github.com/apache/beam/issues/36470](https://github.com/apache/beam/issues/36470).

**Version/applicability:** Apache Beam issue 36470, opened 2025-10-10; reported context 2.67.

**Independent access:** 2026-10-10T05:35:05.022319+00:00 → 2026-10-10T05:35:05.832271+00:00; HTTP 200; Independent reviewer public HTTP GET; no product execution.

**Response:** [S07.html](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S07.html); SHA-256 `1844e790af6989111e87e8c6537358cf833f91134ef3654e5ba2529e1ca14f01`. Decoded text: [S07.txt](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S07.txt); SHA-256 `1166992eb5e36f0f3f07c9ac0a6780e177b1ed25215ff8fe4f004033022b1b88`.

**Governing context:**

- Milestone and issue body — [local lines 119–129](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S07.txt:119).
- Changelog commits, release closure, milestone activity — [local lines 167–197](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S07.txt:167).

**Independent semantic disposition:** The issue attributes a Spanner reader stall to possible reordered metadata watermark updates, exacerbated by 2.67 caching/filtering. Activity says fixed in 2.69.0; current milestone says 2.70.0. Visible referenced commits are changelog updates, not demonstrated patch mechanics. Final preserves this discrepancy and connector scope.

## R08

**Released fix evidence** — carried S08.

**Primary URL:** [https://github.com/apache/beam/releases/tag/v2.69.0](https://github.com/apache/beam/releases/tag/v2.69.0).

**Version/applicability:** Apache Beam 2.69.0 official release, 2025-10-17; displayed tag commit 2ca7d21.

**Independent access:** 2026-10-10T05:35:05.201806+00:00 → 2026-10-10T05:35:05.683750+00:00; HTTP 200; Independent reviewer public HTTP GET; no product execution.

**Response:** [S08.html](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S08.html); SHA-256 `abe1fd8398666d3bf590c91f32dc79936f7cb4d360425bf4646c3e9e1914eab9`. Decoded text: [S08.txt](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S08.txt); SHA-256 `3494eebe94997eec554af466e33d283fb5d3edca73ed9e0a7f99e1b88e59ef6b`.

**Governing context:**

- Release date/tag — [local lines 120–129](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S08.txt:120).
- Bugfixes — [local lines 169–174](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S08.txt:169).

**Independent semantic disposition:** Official release notes list the Spanner partition-watermark reader-stall fix linked to issue 36470. This is sufficient for the bounded released incident example; it neither proves a local device defect nor identifies the implementation patch.

## R09

**InfluxDB point identity and collisions** — carried S09.

**Primary URL:** [https://docs.influxdata.com/influxdb/v2/reference/faq/](https://docs.influxdata.com/influxdb/v2/reference/faq/).

**Version/applicability:** Rolling InfluxDB OSS v2 FAQ; no v3 inference.

**Independent access:** 2026-10-10T05:35:05.217129+00:00 → 2026-10-10T05:35:05.383908+00:00; HTTP 200; Independent reviewer public HTTP GET; no product execution.

**Response:** [S09.html](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S09.html); SHA-256 `519abe41e36fcacba6d411fe4d0f0482bb162078c02bd100015980dac4e780be`. Decoded text: [S09.txt](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S09.txt); SHA-256 `663b1f5a0f6884e629acf9e399ef4d2edd700c8e3a5a1e20124d2ed8717dad6c`.

**Governing context:**

- How does InfluxDB handle duplicate points? — [local lines 835–840](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S09.txt:835).
- Does the precision of the timestamp matter? — [local lines 854–860](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S09.txt:854).

**Independent semantic disposition:** Measurement, tag set and timestamp define a point. Same-key field sets merge, with submitted values winning ties; coarse precision can collide points. The final uses it only as a conditional chart projection and preserves a separate raw/correction archive.

## R10

**Named TTS MQTT integration compatibility** — carried S10.

**Primary URL:** [https://www.thethingsindustries.com/docs/integrations/other-integrations/mqtt/](https://www.thethingsindustries.com/docs/integrations/other-integrations/mqtt/).

**Version/applicability:** Rolling TTS docs; candidate landing label v3.36.2 is not a pinned page/server build.

**Independent access:** 2026-10-10T05:35:05.337129+00:00 → 2026-10-10T05:35:05.535046+00:00; HTTP 200; Independent reviewer public HTTP GET; no product execution.

**Response:** [S10.html](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S10.html); SHA-256 `d6a5571a45dea6cb4527e76eeb842f58aebde2403203167fd78ca5918f222d22`. Decoded text: [S10.txt](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S10.txt); SHA-256 `707b60e484d6e5facd9aade05fca486820ca327f836769e0a121980dc145f352`.

**Governing context:**

- MQTT Server protocol note and tenant-ID conditions — [local lines 26–40](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S10.txt:26).

**Independent semantic disposition:** The named service specifies MQTT 3.1.1 and QoS 0 only. Hosted versus Open Source topic/tenant behavior differs. This supports C, contradicts the 5.0 substitution for this service, and does not restrict generic MQTT v5. Actual LoRaWAN/service selection remains unknown.

## R11

**Network duplicates and ABP reset condition** — carried S11.

**Primary URL:** [https://www.thethingsindustries.com/docs/concepts/features/console/troubleshooting/](https://www.thethingsindustries.com/docs/concepts/features/console/troubleshooting/).

**Version/applicability:** Rolling TTS/LoRaWAN troubleshooting.

**Independent access:** 2026-10-10T05:35:05.362652+00:00 → 2026-10-10T05:35:05.525398+00:00; HTTP 200; Independent reviewer public HTTP GET; no product execution.

**Response:** [S11.html](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S11.html); SHA-256 `cef5ab6ba8ed39b52b89aba0b82553aaef2828c19a5b27a3a6adab734ec4811b`. Decoded text: [S11.txt](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S11.txt); SHA-256 `b23e2765791d9b839285b495eea88b2c1c1a41ae49791dca38300d3f5309faac`.

**Governing context:**

- Common Errors: Entity/Device Not Found and Duplicate Uplink — [local lines 43–54](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S11.txt:43).

**Independent semantic disposition:** ABP counter reset can cause a session matching problem. Duplicate Uplink describes multiple-gateway copies delayed beyond the network dedup window. This is not application replay after archival; it supports the final layer separation.

## R12

**Low-power and counter persistence tradeoffs** — carried S12.

**Primary URL:** [https://www.thethingsindustries.com/docs/hardware/devices/concepts/best-practices/](https://www.thethingsindustries.com/docs/hardware/devices/concepts/best-practices/).

**Version/applicability:** Rolling TTS LoRaWAN Device Best Practices.

**Independent access:** 2026-10-10T05:35:05.384077+00:00 → 2026-10-10T05:35:05.536178+00:00; HTTP 200; Independent reviewer public HTTP GET; no product execution.

**Response:** [S12.html](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S12.html); SHA-256 `fe272ec910cff6f21ad7b0fad75d061d16ed6e96984127c09be551bfe1ba1fd3`. Decoded text: [S12.txt](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S12.txt); SHA-256 `5189f42567d7d924ef7831432ed61bd628312822ce3d918e4cf82b50691daed3`.

**Governing context:**

- Joins, transmission length, duty cycle, packet loss — [local lines 33–45](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S12.txt:33).
- Power Cycles / Frame Counters — [local lines 69–75](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S12.txt:69).

**Independent semantic disposition:** Guidance trades frequency/payload/airtime against loss and recommends retaining LoRaWAN session/counter state across ordinary power cycles. It does not demonstrate any club firmware behavior. The proposal appropriately retains actual radio/counter facts as steward inputs.

## R13

**TTS bounded storage and necessary enablement** — carried S13.

**Primary URL:** [https://www.thethingsindustries.com/docs/integrations/storage/](https://www.thethingsindustries.com/docs/integrations/storage/).

**Version/applicability:** Rolling TTS Storage Integration; distribution-dependent.

**Independent access:** 2026-10-10T05:35:05.386082+00:00 → 2026-10-10T05:35:05.535637+00:00; HTTP 200; Independent reviewer public HTTP GET; no product execution.

**Response:** [S13.html](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S13.html); SHA-256 `46c715f5bb259efda3bb1c694b02e17a9b446ae131c586581f7f9ae265c17418`. Decoded text: [S13.txt](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S13.txt); SHA-256 `c980bdc82e267c3cb629a44bf1cc007eec8555be5ba1d04bfc71bff1094aa1e6`.

**Governing context:**

- Overview, How it works, edition retention and batching — [local lines 24–34](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S13.txt:24).
- Configuration and enablement — [local lines 50–58](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S13.txt:50).

**Independent semantic disposition:** Storage is configured per application/device. Cloud/Sandbox platform configuration does not replace application enablement; Enterprise needs provider configuration. Retention is Cloud 30 days, Sandbox 24 hours, Enterprise configurable; Cloud uplinks only and batch delay. Final explicitly adds these recovery-aid conditions, resolving OI-01.

## R14

**Historical TTS receiver windows and reboot counter ambiguity** — carried S14.

**Primary URL:** [https://github.com/TheThingsNetwork/lorawan-stack/issues/4502](https://github.com/TheThingsNetwork/lorawan-stack/issues/4502).

**Version/applicability:** lorawan-stack issue 4502; reporter TTS 3.14.0; 2021 discussion.

**Independent access:** 2026-10-10T05:35:05.525539+00:00 → 2026-10-10T05:35:06.373250+00:00; HTTP 200; Independent reviewer public HTTP GET; no product execution.

**Response:** [S14.html](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S14.html); SHA-256 `ffdd90b5a5a152f200cd46eb1beab3d8cdcd4012a41afca8bfd1dc3ccbf06f64`. Decoded text: [S14.txt](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S14.txt); SHA-256 `1d089554b2ff2a95523e8cd2411357b2c06f37f6f22c55f5ebf7cad76776f3f5`.

**Governing context:**

- Summary/environment — [local lines 120–135](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S14.txt:120).
- Maintainer existing handling/default windows — [local lines 159–177](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S14.txt:159).
- Closure explanation — [local lines 193–201](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S14.txt:193).
- Later retransmission limits and confirmed-uplink exception — [local lines 226–230](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S14.txt:226).

**Independent semantic disposition:** The maintainer describes a default 200 ms dedup window and 1 second cooldown in that historical implementation. Later retransmissions have protocol limits (NbTrans, with a pre-1.0.4 confirmed-uplink exception). It is behavior history, not a released fix or guaranteed replay recovery. Final states historical scope and claims no local behavior.

## R15

**TTS service receipt fields and format applicability** — carried S15.

**Primary URL:** [https://www.thethingsindustries.com/docs/integrations/data-formats/](https://www.thethingsindustries.com/docs/integrations/data-formats/).

**Version/applicability:** Rolling TTS event-format example; v3.34.0 attributes note is not a pinned current server contract.

**Independent access:** 2026-10-10T05:35:05.535753+00:00 → 2026-10-10T05:35:05.730885+00:00; HTTP 200; Independent reviewer public HTTP GET; no product execution.

**Response:** [S15-current.html](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S15-current.html); SHA-256 `802381a66f905208b1e144e55790b7d79dbb3def96a1af5fd3d29b61ee713e77`. Decoded text: [S15-current.txt](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S15-current.txt); SHA-256 `27261e37555f0881ef974b1d08212effbea680064b7295da6ff0bf72a297726f`.

**Governing context:**

- Empty fields / attributes version note — [local lines 24–27](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S15-current.txt:24).
- Uplink Messages: outer received_at, rx_metadata.time, nested uplink_message.received_at — [local lines 79–132](ER12_RUNTIME/assessment/A8-02/treatment-v1/evidence/S15-current.txt:79).

**Independent semantic disposition:** Outer receipt is Application Server UTC; nested receipt is Network Server UTC; metadata time is gateway receipt. Empty fields are omitted. Original S15 URL returns a meta-refresh/canonical page, independently explaining the failed extraction; the current linked page supplies full context. Final distinction and locator repair are supported, without assuming sensor measurement time or actual field presence.

Original requested URL response is retained as [S15.html](S15.html); its canonical/meta-refresh points to the current official format page. This was not treated as field-context evidence.

## Inspection notes

Telegraf and InfluxDB wire responses were gzip-compressed. Their `.response.gz` captures are retained and manifest hashes distinguish wire bytes from decoded HTML. Initial garbled text extraction was replaced after decoding and never used for source judgment. No package installation was performed.

Candidate source directories contained source indexes and concise source-map paraphrases/excerpts only; all were fully reviewed. No candidate raw source freeze was changed.
