# Evidence-first independent derivation — A-M06-A/treatment/critic (S06 device-alerts)

Method: M06 v1 evidence-first-challenge. This file was derived from the brief plus
independently chosen public primary sources ONLY. No predecessor draft, discovery,
source-map, revealed plan, or predecessor sources/ was opened before this file was saved.
Saved: 2026-10-09T19:17:00Z (before draft inspection; deadline 19:24:27Z).

Brief source: `/cases/S06/brief.md` — device-alerts.

## 1. Brief obligations (independent reading)

- Product: small water-utility sensor alert dashboard for 120 remotely connected gauges.
- Data hazards: late, out of order, sometimes duplicate.
- Operator need: understandable alerts + acknowledgement history.
- Safety scope: operational triage, NOT automated safety control.
- Investigation scope: products, transport/storage/alert mechanisms, version behavior,
  outage recovery, future expansion, modest self-hosted budget.
- Deliverable obligations O1–O6 (equal in both arms):
  - O1 discover unfamiliar tools/products/materially different approaches beyond thin plan
  - O2 consequential primary-source/code behavior, defaults, units/types, limits, applicability
  - O3 at least one issue/fix/regression/release or evolution chain; say when absent/inapplicable
  - O4 compare every exact P clause after plan reveal (correction / enhancement / user-decision /
    already-covered / rejected / uncertain)
  - O5 retain alternatives, conditions, constraints, disagreement, uncertainty in one
    self-contained coherent final; no ID-only text
  - O6 discriminating validations; separate executed checks from proposed work; no runtime
    available is honest; scope is this small product, not unlimited production guarantees.

Independent scope consequences (before seeing any draft):
- Late/out-of-order/duplicate handling must be decided at transport AND storage AND alert-eval
  layers; a claim that one layer "solves" all three is suspect.
- "Acknowledgement history" is ambiguous: alert-state history vs notification history vs operator
  ack audit. Must verify which mechanism actually stores what, retention, and required backends.
- Self-hosted modest budget constrains clustering, managed services, and per-seat licensing;
  single-node recovery and backup/restore matter more than multi-region HA.
- 120 gauges is small scale: solutions must not over-provision (Kafka-scale) nor under-provision
  (lossy fire-and-forget).

## 2. Independently verified primary-source facts

### EF1 — MQTT / Eclipse Mosquitto: QoS, sessions, persistence are configured, not automatic

Primary: Mosquitto `mosquitto.conf` man page (https://mosquitto.org/man/mosquitto-conf-5.html),
accessed 2026-10-09T19:15Z. Observed: HTML man page, configuration reference sections
(File Format, Authentication, General Options, Listeners, Bridges).

Facts established:
- Mosquitto runs with compiled-in defaults when no config file is given; persistence,
  authentication, listeners are opt-in configuration — not safe to assume "MQTT = durable".
- QoS 1/2 redelivery to offline clients requires persistent sessions (stable client-id +
  clean-session false / clean-start false) AND broker-side persistence enabled; QoS 0 is
  fire-and-forget by design.
- Retained messages serve late subscribers but a retain is per-topic last-value, not history;
  clearing requires empty retained publish. Retain is not a substitute for stream storage.
- Single-node file persistence is the Mosquitto model; clustered shared session state is an
  EMQX/HiveMQ-class feature, not Mosquitto. Broker-host loss without backups = queued
  session state at risk.
- AuthN/Z (password_file, Dynamic Security plugin, per-listener settings, TLS cert options)
  is separate from transport; anonymous default is insecure for remote gauges over public links.

Implications for S06:
- Any draft claiming "MQTT QoS 1 guarantees no loss" must state session, persistence,
  redelivery, and broker-backup conditions or it is false-by-omission.
- Duplicate risk: MQTT QoS 1 AT_LEAST_ONCE explicitly permits duplicates on retry; dedup must
  exist downstream (ingest id, storage constraint, or stream dedup window). QoS 2 reduces but
  costs round-trips; default-to-QoS1 + idempotent payloads is the standard guidance.
- Outage recovery: gauge-side store-and-forward + broker persistence + consumer replay must all
  be specified; Mosquitto alone covers only the middle hop.

Uncertainty: exact default values for persistence/autosave knobs were not pinned in this
time-boxed pass; a reviser should quote `persistence`, `autosave_interval`,
`max_queued_messages`, `max_inflight_messages` defaults from the pinned Mosquitto release
before asserting queue bounds.

### EF2 — NATS JetStream: streams persist; dedup is Nats-Msg-Id + DuplicateWindow (default 2m)

Primaries:
- NATS docs "Your first stream" (https://docs.nats.io/learn/jetstream/your-first-stream,
  redirected target of /nats-concepts/jetstream/streams), accessed 2026-10-09T19:15Z.
  Observed: core NATS drops messages with no listener; a Stream is server-side storage with
  replay (minutes to a month later in example).
- nats-io/nats.docs `model_deep_dive.md` excerpt via search (header `Nats-Msg-Id`, default
  dupe window 2 minutes, `--dupe-window` CLI flag), corroborated by multiple stream-config
  references (`DuplicateWindow` default `2m`, `Duplicates: 2*time.Minute`).

Facts established:
- Plain core NATS is ephemeral; durability comes only from JetStream streams/consumers.
- Publish deduplication is by `Nats-Msg-Id` header within `duplicate_window` (default 2 min,
  configurable, e.g. 5s example in NATS blog "Delegate with trust"). Same Msg-Id outside the
  window is stored again — NOT infinite dedup.
- Dedup consults message ID, not body. Two different bodies with same ID collapse; same body
  with different IDs does not dedup.
- Streams support retention policies, replicas (1/3/5), subjects, consumers with explicit ack /
  redelivery; exactly-once is "deduplication + explicit ack + bounded window", not magic.

Implications for S06:
- JetStream is a materially different transport+short-term-store alternative to MQTT+DB, but:
  (a) gauge publishers must set stable `Nats-Msg-Id` (e.g. gauge_id+reading_ts+seq) or dedup
  does nothing; (b) window must exceed max retry/duplication horizon for late duplicates or
  duplicates escape to storage; (c) long-term history/ack-audit still needs a database.
- Out-of-order: streams preserve arrival order, not event-time order; late/out-of-order by
  event time must be reordered at query/alert time (event-ts column, watermarks), not assumed
  fixed by the log.
- Self-hosted cost: single-server JetStream with file storage fits modest budget; clustered
  R3/R5 with placement/RAID is the expansion path, not day one.

Uncertainty: max allowed `duplicate_window` bounds and storage overhead per tracked ID were not
pinned in this pass; do not assert "infinite window" without a versioned limit.

### EF3 — Grafana Alerting: state history ≠ notification history; OSS History needs Loki; 5000-event chart cap

Primary: Grafana docs "View alert state history"
(https://grafana.com/docs/grafana/latest/alerting/monitor-status/view-alert-state-history/),
accessed 2026-10-09T19:16Z. Observed: History page semantics, setup note, limits, RBAC.

Facts established:
- An alert event is recorded each time an alert instance changes state; silences/mute timings
  do NOT remove events — history stays complete even when notifications are suppressed.
- Grafana OSS/Enterprise must configure alert state history in Loki to use History page /
  State history view. Without Loki, the centralized history UI is unavailable.
- History page has Notifications tab (notification history is separate from state history).
- Chart cap: exceeding 5000 alerts in view may show missing data; narrowing time frame is the
  documented workaround — i.e., the UI is sampled/bounded, not an audit log.
- RBAC: users see only history for rules they can access.
- Version note (corroborated by search results): centralized History experience from Grafana
  11.2 behind `alertingCentralAlertHistory` toggle + Loki annotations in that era.

Implications for S06:
- "Acknowledgement history" cannot be satisfied by "Grafana Alerting" alone without stating:
  (a) Loki (or Cloud) for state history, (b) separate operator-ack record (silence/comment/
  external ticket table) because silence ≠ acknowledgement, (c) retention of Loki + Grafana DB.
- Alert-noise debugging ("firing too often") is supported by the History view, but bounded
  rendering means operators need pre-aggregated counts for storms, not infinite scroll.
- Self-hosted budget must include Loki storage/retention if centralized history is required.

Uncertainty: exact Loki retention/size sizing for 120 gauges and the current default of the
feature toggle in latest Grafana were not pinned in this pass; quote the deployed Grafana+Loki
release before promising behavior.

### EF4 — InfluxDB 3 Core vs 2.x/1.x: evolution chain with compatibility APIs (version behavior matters)

Primary: InfluxDB 3 Core docs landing (https://docs.influxdata.com/influxdb3/core/), accessed
2026-10-09T19:16Z. Observed: product family nav (3 Core/Enterprise/Clustered/Cloud/Explorer,
2 OSS/Cloud/Flux, 1 OSS/Enterprise), get-started/write/query/process/migrate-from-v1-v2,
write paths (client libs, HTTP API incl. v3 write_lp + v1/v2 compatibility APIs, Telegraf incl.
dual-write, influxdb3 CLI), best-practices (schema design, optimize writes), plugins.

Facts established:
- InfluxDB 3 is a distinct engine generation from 1.x/2.x (TSM vs IOx/3); "InfluxDB" without a
  major version is ambiguous for behavior, query language, and upgrade path.
- The vendor explicitly provides migrate-from-v1-v2 guidance and v1/v2 compatibility write
  APIs plus Telegraf dual-write — i.e., version migration is a first-class concern, not a
  drop-in.
- Schema design and write optimization remain consequential (line protocol, batching,
  cardinality); defaults do not eliminate schema discipline.

Implications for S06:
- Any draft recommending "InfluxDB" must pin major version (1/2/3), query language
  (InfluxQL/Flux/SQL), retention/downsampling story, and late/duplicate semantics for that
  version, or the recommendation is untestable.
- Late/out-of-order/duplicate handling differs by engine (e.g., series-key overwrite vs
  distinct points, out-of-order ingest windows); version-agnostic claims about dedup are
  invalid.
- Self-hosted: 3 Core is the current self-hosted path to evaluate; 2 OSS vs 3 Core licensing/
  packaging/upgrade must be compared on the pinned release, not assumed.

Uncertainty: precise out-of-order ingest limits and duplicate-point semantics for the pinned
3.x release were not fully extracted in this time-boxed pass; a reviser must quote the
deployed version's write-troubleshooting + schema docs. TimescaleDB hypertable primary fetch
failed in this pass (tigerdata URL 404/redirect); no TimescaleDB fact is asserted here beyond
"candidate not verified" — see critique for how the draft's TimescaleDB claims must be judged.

## 3. Independent alternatives map (pre-draft)

- Transport: (a) MQTT (Mosquitto single-node) + app-layer dedup; (b) NATS JetStream stream as
  transport+short-term log with Msg-Id dedup window; (c) plain HTTPS batch + idempotency keys
  (simplest ops, weakest real-time). These are materially different, not interchangeable.
- Storage: (a) Postgres(+Timescale-style hypertables) for relational ack-audit + time-series;
  (b) InfluxDB 3 Core (pinned) for metrics with explicit schema/retention; (c) SQLite/Postgres
  minimal + object export. Each has different late/duplicate/retention semantics.
- Alerting/history: (a) Grafana Alerting + Loki state history + explicit ack table/silence
  comments; (b) Alertmanager-style inhibition/silence with separate audit; (c) app-owned alert
  state machine in Postgres (strongest ack-audit, most code). Silence ≠ ack in all cases.
- Outage recovery: gauge store-and-forward + broker/stream persistence + consumer replay +
  DB backup/restore + Loki retention must EACH be specified; no single component covers all.

## 4. Discriminating validations (proposed; none executed — no runtime in this stage)

- V1 transport redelivery: kill gauge link mid-batch, restore, count duplicates at ingest;
  pass = duplicates observed AND collapsed downstream (not "no duplicates").
- V2 dedup-window escape: republish same Msg-Id/idempotency-key inside vs outside window;
  pass = inside collapses, outside is documented behavior (stored or rejected per design).
- V3 out-of-order alert correctness: inject late event-ts older than watermark; pass = alert
  evaluation uses event time with stated lateness policy, not arrival order.
- V4 history completeness: create silence/mute, fire alert, verify History still records event
  and Notifications tab records suppression separately; verify 5000-cap behavior on storm.
- V5 OSS history backend: deploy pinned Grafana WITHOUT Loki, verify History unavailable;
  with Loki, verify available — proves backend dependency.
- V6 version pin: redeploy storage on adjacent major version, rerun V1–V3; any behavior delta
  must be documented as version behavior, not dismissed.
- V7 backup/restore: snapshot broker/stream + DB + Loki, wipe, restore, verify no silent gap
  in ack history (gaps explicit or absent, never silently filled).

No witness was run (no qualified sandbox claimed in this time box); all above are PROPOSED.

## 5. Evidence-first integrity statement

- Draft, discovery, predecessor source-map, revealed plan, and predecessor sources/ were NOT
  opened before this save.
- Next step: open frozen predecessors and compare; disagreements will be resolved by pinned
  primary evidence, with uncertainty stated where this pass did not pin a value.
- Usage/billing: unobserved → null (no provider metering observed in this stage).
