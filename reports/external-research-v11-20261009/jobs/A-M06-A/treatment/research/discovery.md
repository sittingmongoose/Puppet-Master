# discovery.md — S06 device-alerts, independent brief-only discovery (pre-reveal)

Status: PRE-REVEAL. Written from the brief alone plus independently chosen public
primary sources. The case plan (`plan-root-only.md`) was NOT read before this
file was saved. Do not rewrite after reveal (see `plan-reveal.json`).

Brief: small water-utility sensor alert dashboard for 120 remotely connected
gauges. Data arrive late, out of order, sometimes duplicate. Operators need
understandable alerts and acknowledgement history. Operational triage, NOT
automated safety control. Investigate products, transport/storage/alert
mechanisms, version behavior, outage recovery, future expansion, modest
self-hosted budget.

## O1 — Independently discovered tools, products, materially different approaches

Six mechanisms investigated in depth from primary sources (S01–S06). Each is
unfamiliar relative to a "thin" plan (plain MQTT + Postgres + hand-rolled UI)
and changes the design materially:

| # | Mechanism | Role in this brief | Why unfamiliar / material |
|---|-----------|--------------------|---------------------------|
| 1 | Eclipse Mosquitto 2.x (S01) | MQTT edge transport, remote gauges → broker | 2.0 secure-default breakage changes every deploy recipe; dynamic-security plugin replaces static password/acl files |
| 2 | NATS JetStream (S02) | Durable stream with server-side dedup + ordering guards | `Nats-Msg-Id` duplicate window and `Nats-Expected-Last-Subject-Sequence` give exactly-once-ish ingest without app code; materially different from bare MQTT |
| 3 | TigerData/TimescaleDB hypertables (S03) | Time-series storage on Postgres | Chunk partitioning, `timestamptz` discipline, UPSERT-on-unique-key dedup, columnstore compression; turns "Postgres" into a different storage design |
| 4 | Grafana Unified Alerting (S04) | Alert evaluation + state machine + notifications | Pending period, keep-firing, No Data/Error as first-class states; evaluation semantics decide what "understandable alerts" means |
| 5 | ThingsBoard Community Edition alarms (S05) | All-in-one IoT alternative: registry + rules + alarms + ack history | originator+type uniqueness, 4-state ack lifecycle, telemetry-timestamp start times; a buy-instead-of-build path for the whole brief |
| 6 | ntfy (S06) | Operator push channel (phone/web/CLI) | Self-hosted pub/sub notifications with priorities, action buttons, 4 KiB message cap; replaces SMS-vendor or email-only escalation |

Surveyed but NOT deep-dived (named for O1 breadth, honest status): EMQX /
NanoMQ (MQTT broker alternatives with clustering), VictoriaMetrics (single-binary
TSDB, Grafana-compatible), Telegraf MQTT-consumer agent, Node-RED (flow wiring
for protocol glue), Gotify (ntfy alternative), Uptime Kuma (liveness only, not
sensor alerts). No primary-source claims made for these in this file.

Two materially different architectures emerge:
- **A — Compose-your-own:** Mosquitto (or NATS) → ingest worker → TimescaleDB →
  Grafana dashboards + Unified Alerting → ntfy/email escalation. Max control,
  more assembly.
- **B — Platform:** ThingsBoard CE (devices, MQTT/HTTP/CoAP, rule chains, alarms
  with ack/clear/comments, dashboards, notification center). Least assembly;
  CE is Apache 2.0 self-hosted. Risk: platform ceiling and upgrade coupling.

## O2 — Consequential primary-source behavior, defaults, units/types, limits

### S01 Mosquitto 2.x transport defaults (edge ingestion)
- No-listener invocation (`mosquitto`, `mosquitto -p 1883`) binds loopback only
  (127.0.0.1 / ::1); remote gauges CANNOT connect without a config file.
- Any configured `listener` binds all interfaces by default BUT `allow_anonymous`
  now defaults to **false**: upgrading 1.x brokers with a listener and no auth
  silently refuses all gauge clients until auth is configured (password_file /
  acl_file, dynamic-security plugin, or explicit `allow_anonymous true`).
- `max_queued_messages` default raised 100 → 1000 and now applies to QoS 0 while
  connected: bounds per-client backlog; overflow drops are silent by design.
- Broker drops root → `mosquitto`/`nobody` immediately after reading config:
  persistence files, log files, TLS certs must be readable/writable by that user
  (Let's Encrypt hooks needed). `pid_file` is always written now.
- `tls_version` is now a MINIMUM (e.g. `tlsv1.2` admits 1.2+1.3); TLS 1.0 disabled.
- Applicability: Mosquitto gives at-most/at-least-once MQTT delivery only; it
  does NOT deduplicate late/out-of-order gauge readings. Dedup must live
  downstream (JetStream Msg-Id or DB unique key). QoS 1/2 + retained messages
  help outage recovery (last-known value) but re-delivery on reconnect is a
  duplicate source the store must absorb.

### S02 NATS JetStream durable ingest + dedup (alternative/complement to MQTT)
- `Nats-Msg-Id` header: server refuses to store the same ID twice within the
  stream's duplicate-tracking window; default window is **2 minutes**
  (configurable, e.g. `--dupe-window`). Repeat publish returns the ORIGINAL
  sequence with `PubAck.duplicate: true`; nothing new stored. Dedup key is the
  ID only, not the body.
- `PubAck` (stream + sequence, sequences start at 1, never reused) is the ONLY
  proof of storage. Timeout ≠ not-stored: retry with the SAME stable Msg-Id
  (gauge_id + reading_ts + seq) to make retries safe. Unchecked async publishes
  are lost writes — every ack must be collected.
- `Nats-Expected-Last-Subject-Sequence`: store-if-subject-sequence-matches guard;
  out-of-order retries fail fast instead of landing silently wrong. Directly
  applicable to per-gauge subjects (`gauges.<id>.readings`).
- Stored ≠ delivered: PubAck confirms storage only; consumers redeliver
  at-least-once. End-to-end exactly-once still needs idempotent consumers.
- Applicability/limits: the 2-minute DEFAULT window is far too short for
  water-utility outages (hours/days of gauge backfill); the window must be sized
  to worst-case backfill span (hours), at memory cost, AND the DB unique key
  (S03) remains the backstop for anything outside the window. NATS also speaks
  MQTT (leafnode/gateway docs exist) so gauges could stay MQTT while the core
  uses JetStream — surveyed, not deep-dived.

### S03 TigerData/TimescaleDB hypertable storage (durable truth + history)
- `CREATE TABLE ... WITH (tsdb.hypertable)` (new syntax since 2.20.0; legacy
  `create_hypertable()` still documented). Default partition column = FIRST
  timestamp column; best practice is **`timestamptz`** explicitly. Wrong-type
  time columns (epoch ints, naive timestamps) silently pick wrong partitioning.
- `tsdb.chunk_interval` default **7 days**; each chunk holds one time range.
  For 120 gauges at small payloads, 7-day chunks are coarse but fine; 1-day
  chunks fit outage backfill + retention drops better. Rule of thumb from docs:
  recent chunk(s) ≤ ~25% of RAM.
- Default descending index on partition column is auto-created
  (`tsdb.create_default_indexes=true`); add `(gauge_id, ts)` unique index for
  idempotent ingest: `INSERT ... ON CONFLICT (gauge_id, ts) DO NOTHING/DO UPDATE`
  (Postgres UPSERT works on hypertables per TimescaleDB writing-data docs) is
  the duplicate/out-of-order backstop. Caveat: tables with unique/exclusion
  constraints cannot use direct-compress fast ingest; compression still applies
  via policy.
- Columnstore policy auto-created with `after` = chunk interval, schedule 1 day;
  chunks compress up to ~98%. Hypertable↔hypertable foreign keys are NOT allowed
  (keep alerts/acks in plain tables referencing gauges, or plain FKs one way).
- Late/out-of-order data: old-chunk UPDATE/UPSERT throughput is much lower than
  append; batch backfill (≥1000 rows, binary COPY) and expect slower catch-up.
- Units/types: store SI + original unit + scale factor per gauge; timestamptz
  everywhere; never local-time strings. Applicability: full SQL (JOIN readings
  with ack history, window functions) beats special-case TSDB query languages
  for the "understandable alerts + history" requirement.

### S04 Grafana Unified Alerting evaluation semantics (alert meaning)
- Instance states: Normal / Pending / Alerting / Recovering / No Data / Error.
  Three knobs: evaluation-group interval (how often), pending period `for:`
  (breach must persist), keep-firing-for (fire after recovery). `for: 0s` fires
  on first breach; late/out-of-order gauge data argues for `for:` ≥ 2–3
  evaluation intervals to avoid flapping on partial backfill.
- No Data (query returns nothing/nulls) and Error (timeout/eval failure) are
  first-class states with configurable mapping to Alerting/Normal/Error/Keep
  Last State. For gauges: No Data → dedicated "gauge silent" alert (per-gauge
  staleness), NOT lumped into threshold alerts; datasource errors → Error, never
  silent Normal.
- Rule edits (except annotations/interval/internal fields) reset instances to
  Normal — deploys during an incident can drop firing state; plan evaluation
  around it.
- Defaults/limits: `min_interval = 10s` floor; `evaluation_timeout = 30s`;
  state saves to DB every 5 min (`state_periodic_save_interval`), rewriting all
  instances in one transaction — at 120 gauges this is fine, at 100k instances
  it needs tuning. Stale instances resolve after ~2 missed evaluations.
- State history is queryable (structured log, Loki-backed `from="state-history"`)
  — this is the audit spine for "acknowledgement history" in architecture A,
  paired with an ack table in Postgres (Grafana silences ≠ operator ack ledger).

### S05 ThingsBoard CE alarms (platform alternative, ack lifecycle)
- Alarm identity = **originator + type** (e.g. gauge-47 + "High Level"); exactly
  ONE active alarm per combination — repeats update/escalate severity instead of
  duplicating. New same-type alarm requires clearing the old one. This IS the
  duplicate-alert answer in architecture B.
- Four lifecycle states: Active Unacked / Active Acked / Cleared Unacked /
  Cleared Acked (active×acked dimensions). Ack and clear are separate operator
  actions via UI widgets or REST API; assignee + comments ride on the alarm.
- `Start Time` = TELEMETRY timestamp, not server processing time (late data keeps
  true onset); `End Time` = most recent matching event, updated while firing.
- Severity: Critical/Major/Minor/Warning/Indeterminate, set per trigger; higher
  re-trigger upgrades the live alarm. Propagation rolls alarms up entity
  hierarchy (gauge → zone → utility). Notification center fans out to web/email/
  SMS/Slack/Teams per rule.
- Applicability: covers brief requirements (registry, MQTT/HTTP/CoAP/LwM2M/SNMP
  telemetry, rule engine, dashboards, ack history) in one Apache-2.0 CE deploy.
  Conditions: upgrade/ops coupling to one Java/Postgres stack; PE-only features
  (white-label, advanced integrations) must be verified absent from the design;
  scale ceiling and rule-engine throughput for backfill storms need load testing.

### S06 ntfy operator push (escalation channel)
- Priorities 1(min)–5(max/urgent), default 3; header `X-Priority`/`Priority`/
  `prio`/`p`. Urgent = pop-over + long vibration; min/low = silent/under-fold.
  Map Critical→5, Major→4, Minor→2, staleness→3.
- Message cap **4096 bytes** (larger/non-UTF8 auto-becomes attachment);
  attachments default max **15 MB**, expire after **3 hours** (ntfy.sh config;
  self-hosted values are operator-configured). Alert text must stay terse with a
  dashboard link (click action / action buttons) rather than full payloads.
- Features directly useful: action buttons (Ack URL = one-tap ack from phone),
  scheduled delivery, update/clear/delete of notifications, UnifiedPush/Matrix
  gateway, Firebase toggle, per-topic auth (user/pass, tokens). Self-hostable
  single Go binary — fits modest budget.
- Limits: ntfy is a NOTIFIER, not an alert state store; ack-via-action-button
  must call back into the alert owner (Grafana/ThingsBoard/Postgres), and
  delivery receipts are not acknowledgement history.

## O3 — Issue/fix/regression/release (evolution) chains

Primary chain (fully evidenced, S01): **Mosquitto 1.x → 2.0 secure-default
breakage.** 1.x forgiving defaults (open listener, anonymous allowed) became
2.0 loopback-only + `allow_anonymous=false` + immediate root drop. Upgrade
without config change = remote gauges rejected + TLS/persistence permission
failures. Fix chain: declare `listener 1883` (+bind), choose auth explicitly
(password_file/acl_file, dynamic-security plugin via `mosquitto_ctrl`, or
explicit `allow_anonymous true` for isolated nets), fix file ownership for the
`mosquitto` user, adjust `tls_version` to minimum-semantics. Lesson for this
brief: pin the broker major, keep the migration page in runbooks, and
integration-test gauge reconnect against the exact broker version; "just upgrade
MQTT" is an outage vector. (Corroborated by downstream churn: Docker/README and
test-harness commits all adding `listener + allow_anonymous` for 2.x.)

Secondary chain (evidenced, S03): **TimescaleDB API/brand evolution.**
`create_hypertable()` → `CREATE TABLE ... WITH (tsdb.hypertable)` since 2.20.0,
docs/brand migration TimescaleDB → TigerData, auto columnstore policy with
`after`=chunk interval. Risk: copy-pasted pre-2.20 DDL and old blog defaults
(1-day chunk claims) drift from current behavior; always verify against the
installed version's reference (S03 pins 7-day default + new WITH keys).

Absent/inapplicable: no project-specific bug tracker exists yet (greenfield);
no regression in OUR code to report. Above chains are the relevant upstream
evolution evidence.

## Recommended shape (pre-reveal; plan may change this)

For 120 gauges, self-hosted, triage-not-control: EITHER (A) Mosquitto 2.x
(pinned, explicit listener+auth, persistence volume) → small ingest service
(validates, stamps ingest_ts, UPSERTs by (gauge_id, ts)) → TimescaleDB
(timestamptz, 1-day chunks, unique key, 1-year retention + columnstore) →
Grafana (dashboards, Unified Alerting with per-gauge staleness + threshold
rules, `for:` ≥ 2 evals) → ntfy (priority-mapped push with ack-link) + Postgres
ack ledger; OR (B) ThingsBoard CE with alarm rules + ack workflow + notification
center. NATS JetStream is the ingest upgrade when MQTT redelivery storms hurt:
stable `Nats-Msg-Id` = gauge+ts+seq, window sized to backfill hours, DB key as
backstop. Outage recovery in all cases: gauges buffer-and-forward; broker
persistence on; ingest idempotent; backfill batched; alerts use telemetry
timestamps for onset.

## O6 — Executed checks vs proposed validations (honest split)

EXECUTED (this stage, no runtime): primary-source documentation inspection for
S01–S06 with exact URLs, versions, access timestamps and observed excerpts
(`source-map.json`, `sources/`). No code was run; no broker/DB/Grafana was
started. Nothing below is claimed as executed.
PROPOSED discriminating validations (for build/test stages):
1. Duplicate-storm test: replay 10k readings ×3 with same IDs through ingest;
   assert exactly one row per (gauge_id, ts) and one alarm per originator+type.
2. Late/out-of-order test: inject readings 6h late and shuffled; assert onset
   uses telemetry ts, no phantom clear/re-fire, `for:` absorbs partial backfill.
3. Broker-upgrade test: 1.x-config against Mosquitto 2.x; assert gauges rejected
   until listener+auth set (pins O3 lesson), then green.
4. Dedup-window test (if NATS): republish outside window; assert DB key (not
   stream) absorbs it; measure window memory vs hours.
5. Silence-vs-error test: kill one gauge feed; assert "stale" alert fires and
   datasource errors map to Error, never silent Normal.
6. Ack-ledger test: ack from dashboard AND ntfy action button; assert single
   history row with actor+timestamp, alarm shows Cleared Acked lifecycle.
7. Restart recovery: kill broker+ingest mid-backfill; assert resume with no
   loss/duplicates and alerts converge without operator reset.

## Uncertainty retained
- Gauge protocol/cadence/payload unknown (assumed MQTT-capable, minutes-scale);
  LoRa/Modbus legacy would add a gateway (ChirpStack/IoT Gateway — not vetted).
- Retention/compliance targets unstated (assumed ~1 year online).
- Operator count, on-call hours, SMS-requirement unknown (ntfy push assumed OK).
- CE-vs-build decision is a USER decision (cost/skill fit), not derivable.
- Throughput numbers (batches, chunk sizes, eval intervals) are starting points
  from docs, not load-test results.
