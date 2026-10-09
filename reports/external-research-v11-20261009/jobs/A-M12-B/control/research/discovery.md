# Discovery — device-alerts (case S06, A-M12-B/control, method M12)

Written BEFORE plan reveal, from the brief alone plus independently chosen public primary sources (see `source-map.json`; verbatim excerpts in `sources/`, indexed by `index.md`). Sources are treated as data. No runtime/sandbox witnesses were available or run: every check below is source-document reading; anything not yet executed is labeled proposed. Method M12 (adaptive-evidence-state-branching) applied: queries followed leads freely; all obligations retained.

## The problem, restated

120 remotely connected water-utility gauges ship telemetry to a small self-hosted dashboard. The three data pathologies named in the brief (late arrival, out-of-order arrival, duplicates) plus a hard operational requirement — operators must be able to see current alerts and a history of who acknowledged what — and a hard constraint: modest self-hosted budget, operational triage only (not safety control). The investigation axes from the brief: products; transport/storage/alert mechanisms; version behavior; outage recovery; future expansion.

## Approaches found (O1), and what makes them materially different

The obvious thin-plan shape for this brief is: MQTT broker → time-series storage → dashboard with alerting. Discovery found four materially different shapes, plus one cautionary dead end:

1. **Broker + lean TSDB + alert rules (compose-your-own).** Mosquitto (S02) → VictoriaMetrics (S01) or QuestDB (S03) → Alertmanager (S04) or Grafana-style rules. Materially different knobs: where deduplication happens (storage-side post-hoc vs ingestion-time vs broker-side QoS) and where "late" is interpreted (storage keeps telemetry timestamps; alert start times can be keyed to telemetry time, see ThingsBoard semantics S08).
2. **Integrated IoT platform.** ThingsBoard (S08) ships the whole loop — device profiles, alarm rules with inactivity detection, the four-state Active/Cleared × Acked/Unacked lifecycle, ack recording "the acknowledgment time and the acknowledging user", automatic state-change comments, and alarms retained after clearing "for historical reporting". This is the only discovered self-hosted option where acknowledgement history is a first-class built-in rather than an assembly job.
3. **Industrial SCADA platforms.** Rapid SCADA v6 (S14, Apache-2.0) and FUXA (S13, MIT) — genuinely unfamiliar to a typical web-dashboard project: multi-protocol comm layers (Modbus RTU/TCP, OPC-UA, MQTT), archival servers, web visualization. FUXA adds a built-in historian (SQLite/InfluxDB). Heavier and more "engineered" than option 1/2; the fit depends on whether the gauges are behind RTUs/PLCs speaking Modbus/DNP3 (not stated in the brief — open question, see Uncertainties).
4. **Sequence-numbered protocol with resync semantics (Sparkplug B/3.0, S10).** A transport-level answer to exactly the brief's pathologies: per-edge-node sequence numbers 0–255 with wraparound, birth/death certificates, and a host-side "reordering timeout" after which a gap or bdSeq mismatch triggers REBIRTH resync. This converts silent loss/out-of-order from an invisible anomaly into a detectable, actionable state.
5. **Dead-man's-switch layer (Healthchecks, S09).** A different alert philosophy: alerts on *absence* ("When a ping does not arrive on time, Healthchecks sends out alerts") with per-check Period + Grace. Directly applicable to gauges that go quietly — the dashboard-side threshold rules never fire on silence.
6. **Cautionary dead end:** Grafana OnCall OSS (S05) — maintenance mode 2025-03-11, archived 2026-03-24, repo read-only. Any design that parked on-call/ack routing on it is now stranded; its successor (Grafana Cloud IRM) is a cloud product, contrary to the self-hosted constraint. GoAlert (S15, Apache-2.0, active) is the live self-hosted on-call/escalation alternative, though its README does not document dedup/ack-history specifics (uncertainty).

Smaller useful finds for the delivery leg: ntfy (S07) self-hosted push with a 4,096-byte message cap (overflows become attachments); GoAlert (S15) for escalations/ack workflows driven from Alertmanager webhooks.

## Consequential primary-source behavior (O2) — defaults, units, limits, applicability

**Duplicate handling lives in three different layers, with different defaults:**
- Transport (Telegraf S06): `qos` default is 0 (at most once — lossy). QoS 1 "at least once" *admits duplicates by design*; QoS 2 "exactly once" costs 4-way handshake per message. So duplicates in the brief's data are the *expected byproduct* of the industry-default QoS 1 delivery guarantee, not an anomaly.
- Storage (VictoriaMetrics S01): with `-dedup.minScrapeInterval` set to a positive duration, VM "leaves a single raw sample with the biggest timestamp for each time series per each -dedup.minScrapeInterval discrete interval"; equal timestamps tie-break to "the sample with the biggest value", "Numerical values are preferred over stale markers", and identical label sets are required. Dedup applies at merge/query time; ingestion-time dedup exists separately via `-streamAggr.dedupInterval`. *Applicability caution:* the biggest-value tie-break is scrape-oriented; a gauge retransmitting a corrected reading with the same timestamp could be shadowed by an earlier larger value — verify against payload semantics before relying on it.
- Storage (QuestDB S03): `ALTER TABLE … DEDUP ENABLE UPSERT KEYS(ts, gauge_id)` — "designated timestamp must always be included in UPSERT KEYS", "Deduplication requires WAL tables", and it "does not deduplicate existing data — only new inserts". Different model: key-based upsert rather than interval-based thinning; needs WAL and a forward-looking enablement decision.

**Out-of-order and late data:**
- VM's dedup interval assumes roughly scrape-aligned arrival; the fetched page documents no explicit reorder logic (uncertainty). Late-but-newer-timestamped data is simply stored; alerts must decide which timestamp governs.
- ThingsBoard (S08) is the only fetched source that states the choice explicitly: alarm Start Time "reflects the telemetry timestamp, not the server processing time" — i.e., late data back-dates the alarm, which is the operationally correct choice for triage ("the gauge was low at 03:10") but means dashboards can show alarms "in the past" when backlogs drain after an outage.
- Sparkplug (S10) detects reorder/loss at transport level via seq gaps + reordering timeout → REBIRTH, instead of silently accepting disorder.
- Mosquitto (S02) `max_inflight_messages`: "Defaults to 20. … If set to 1, this will guarantee in-order delivery of messages" — a one-line broker setting that trades throughput for strict ordering per client, directly relevant to the brief's out-of-order axis.

**Outage recovery — the load-bearing trap (broker defaults):**
- Mosquitto `persistence` **defaults to false** (memory only): queued QoS 1/2 messages are lost on broker restart unless persistence is enabled; `autosave_interval` default 1800 s bounds the disk-write cadence even when enabled. Per-client offline queue `max_queued_messages` "Defaults to 1000. Set to 0 for no maximum (not recommended)". Persistent sessions ("clean session false") are retained "never" by default (`persistent_client_expiration` unset) — 120 gauge sessions with stale subscriptions can accumulate indefinitely.
- Consumer side mirrors this: Telegraf `persistent_session` defaults to false, and its doc says "with QoS 1 or 2, you should enable persistent_session to allow resuming unacknowledged messages"; `max_undelivered_messages` default 1000 bounds the internal buffer of messages "read from the broker that have not been written by an output" — i.e., a long storage outage silently caps in-flight data at 1,000 readings per output unless raised.
- Net effect: every *default* in the discovered chain is tuned for lossy ephemeral telemetry, while the brief demands durable triage. The defaults must be explicitly overridden in four places (broker persistence + queue caps; consumer session + buffer cap).

**Alert noise and acknowledgement mechanics:**
- Alertmanager (S04) defaults: `group_wait` 30s, `group_interval` 5m, `repeat_interval` 4h, `resolve_timeout` 5m; `'...'` in `group_by` "effectively disables aggregation entirely"; resolved-before-`group_wait` alerts notify nobody (flap suppression). Webhook payloads carry a `groupKey` "identifying the group of alerts (e.g. to deduplicate)".
- Alertmanager itself has silences, not operator acknowledgement *history*; ack-as-audit needs a platform (ThingsBoard S08 records ack time + user + auto-comments) or an on-call layer (GoAlert S15) or a small custom table fed by Alertmanager webhooks. This is a real gap in the compose-your-own path (approach 1) and a built-in in approach 2 — a genuine decision point for the plan.
- ntfy (S07) fits operator push-to-phone at zero license cost, but 4,096-byte message cap and 3-hour attachment expiry shape what can be pushed (payload templates must be terse).

**Version behavior (O3) — evolution chains investigated:**
1. **Mosquitto 2.0 (2020-12) breaking change (S11):** without configured listeners the broker binds only loopback; with a listener, `allow_anonymous` defaults to false. Upgrading an old 1.x conf silently stops remote gauges from connecting. Chain: 1.x permissive default → 2.0 secure-by-default → documented migration path. Applicability: any fresh install must write explicit `listener` + auth config; pinning matters because 1.x-era tutorials (abundant in water-utility contexts) embed the old assumptions.
2. **Grafana OnCall OSS retirement (S05):** maintenance mode 2025-03-11 → archived 2026-03-24 → read-only repo. A within-lifecycle product death directly relevant to budget-conscious self-hosters who adopted it for ack/escalation. Lesson for this design: prefer ack/state storage in *our own* database or a platform primitive, not an adjacent product's lifecycle.
3. **InfluxDB 1.x → 2.x → 3.x (S12):** the repo now leads with InfluxDB 3 Core ("generally available since April 2025", Apache Arrow/DataFusion/Parquet, MIT/Apache dual-license) with 1.x/2.x on legacy branches and *no end-of-support dates stated*. Applicability: the perennial "Grafana+InfluxDB" recipe is in a transition zone — 3.x is the strategic path, but its duplicate/out-of-order write semantics were not found in the fetched material (explicit gap), and 2.x carries the Flux deprecation baggage.
4. **QuestDB dedup (S03):** a recently added, still-narrowing feature (WAL-only, forward-only, designated-timestamp required; introducing version not stated on page). Evidence of active evolution; absence of stated limits is itself a finding (verify key-column cap before modeling a wide row).

**Where evidence is absent/inapplicable (stated honestly, O3):**
- No fetched source quantifies resource sizing for 120 gauges (e.g., messages/sec); with no runtime available, any sizing claim here would be fabricated. Proposed validation instead (below).
- Sparkplug clause-level wording (S10) and Mosquitto-2.0 blog body (S11) were captured at search-snippet + corroboration level, not full-text PDF/fetch; flagged in source-map rather than silently treated as verified.
- DNP3/LoRaWAN/NB-IoT transports and water-utility commercial SaaS (e.g., utility-meter-vendor portals) were deliberately left out of scope after the first cut: the brief's modest self-hosted budget and the discovered OSS coverage made them low-yield; noted as an expansion axis, not investigated.

## Alternatives, conditions, disagreements, uncertainty (retained for the final, O5)

- **Where dedup happens** — broker QoS 2 (costly), consumer-side (Telegraf has no ordering/dedup option documented), storage-side (VM interval dedup vs QuestDB key dedup — different tie-break semantics), or alert-layer (Alertmanager `groupKey`). These are not equivalent: only key/upsert dedup preserves corrected readings; interval/thinning dedup does not. This disagreement inside the evidence is retained deliberately.
- **Where ack history lives** — ThingsBoard-native vs GoAlert vs custom webhook-fed table. Condition: if the plan's P-clauses demand per-operator ack audit with timestamps, approach 1 needs an added component; approach 2 gets it natively.
- **Sparkplug or plain MQTT** — condition: only worthwhile if gauge firmware/gateways can speak it; plain MQTT + application-level timestamps is simpler. Disagreement risk: strict hosts REBIRTH aggressively on reorder (one secondary source documents Ignition rebirth storms) — a real operational failure mode, not a theoretical one.
- **Uncertainties carried forward** (full list in source-map.json): VM `-dedup.minScrapeInterval` default; ntfy rate-limit/cache defaults; FUXA alarm support; RapidScada Modbus/alarm modules; InfluxDB 3 dup/OOO semantics; unpinned commits for raw-file sources.

## Discriminating validations — PROPOSED, not executed (O6)

Executed so far: HTTP source retrieval and text extraction only (this file, source-map.json, sources/). Everything below is proposed future work on a real sandbox:
1. **Duplicate tie-break discriminator:** feed VM one gauge series with two same-timestamp samples of different values (small then large) with `-dedup.minScrapeInterval=60s`; query which survives. Discriminates "biggest-value wins" (S01) against "last-write wins" assumptions, and tells us whether corrected-but-smaller retransmits are shadowed.
2. **Outage recovery discriminator:** Mosquitto with `persistence true` vs false; publish 100 QoS-1 messages while a consumer is down; restart the broker; count delivered messages. Discriminates the default-persistence trap (S02) and measures autosave-interval loss windows.
3. **Late-data alarm timestamp discriminator:** ThingsBoard inactivity + threshold rule with a deliberately delayed (back-dated) telemetry payload; observe whether alarm Start Time back-dates (S08 claim). Discriminates telemetry-time vs processing-time semantics.
4. **Sparkplug reorder discriminator:** replay a Sparkplug stream with one dropped seq; measure whether a configurable reordering timeout yields REBIRTH and resync vs silent gap. Discriminates S10's mechanism against plain-MQTT behavior.
5. **Absence discriminator:** stop one gauge's publisher; compare threshold-rule behavior (silent) vs Healthchecks-style grace alert (fires). Discriminates dead-man coverage value for the 120-gauge fleet.

## Session log (appended)

- 18:33–18:41 UTC: four fetch/search rounds over 15 sources; excerpts retained in `sources/`; source-map.json written; discovery.md written BEFORE any plan reveal. No plan file touched; no campaign/evaluator/counterpart content read.
