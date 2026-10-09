# S06 device-alerts — independent discovery (pre-reveal)

Scope: small water-utility sensor alert dashboard for 120 remotely connected gauges.
Data arrive late, out of order, sometimes duplicate. Operators need understandable
alerts plus acknowledgement history. Operational triage, not automated safety
control. Modest self-hosted budget; must cover products, transport/storage/alert
mechanisms, version behavior, outage recovery, future expansion. Brief obligations
O1–O6; this file covers pre-reveal discovery (O1/O2/O3/O6-partial). No plan text
was read before writing this file. Source citations [S01..S12] resolve in
source-map.json; excerpts retained under sources/ with index.

## 1. Candidate architectures (materially different)

A. MQTT-native ingest + stream normalizer + relational/TS store + Grafana.
Gauges publish MQTT (QoS 1) to a self-hosted broker (EMQX or Mosquitto).
A stateless stream processor (Redpanda Connect) subscribes, validates,
stamps ingest time, drops/records duplicates, republishes clean topics and
writes the store. Grafana dashboards + Grafana Alerting evaluate thresholds,
dead-man (missing data) rules, and route to email/webhook; acknowledgement
history lives in Grafana state history. Strengths: MQTT fits flaky links and
small payloads; each layer replaceable; cheapest to run. Risks: two
dedup windows to align (broker session queue vs stream dedup vs store
upsert); alert state history needs explicit backend choice.

B. NATS JetStream as transport + buffer + short-window dedup, VictoriaMetrics
or QuestDB as store, Grafana + Alertmanager-class routing.
Gauges or field gateways publish to JetStream subjects with stable
Nats-Msg-Id (device-id + reading-seq). JetStream keeps messages durably
(file storage), dedups publisher retries inside duplicate_window, and lets
independent consumers (writer, alerter, backfill job) replay. Store is
VictoriaMetrics single-node (Prometheus remote-write / Influx line) or
QuestDB (ILP/SQL, designated timestamp, O3 merge). Alerts via Grafana
Alerting or vmalert + Alertmanager grouping. Strengths: one durable log
covers outage buffering and replay; server-side dedup is simple and
observable (PubAck.duplicate). Risks: JetStream dedup window is
time-bounded (default 2 min), so it is only a near-term guard — permanent
idempotency must live downstream (store upsert key or consumer ledger).
NATS MQTT adapter exists but native MQTT clients may prefer EMQX.

C. Consolidation-plus-ack server (Alerta) in front of Grafana.
Same ingest as A or B, but alert lifecycle (open/ack/closed, blackouts,
history) is owned by a small dedicated alert server (Alerta with Postgres/
Mongo backend) fed by the stream processor or Grafana webhooks, with Grafana
kept for charts. Strengths: acknowledgement history, de-duplication across
many sources, blackouts, and one at-a-glance console are Alerta's core job;
operators get one canonical ack place. Risks: two alert evaluations can
drift (Grafana rules vs Alerta); extra service to run; Alerta release pace
is slower than Grafana's.

A fourth variant replaces the TS store with GreptimeDB (single binary,
multi-protocol ingest: Prometheus remote-write, Influx line, OTLP, SQL +
PromQL queries) when the team wants one engine for metrics now and logs/
traces later. It is less mature than VictoriaMetrics/QuestDB but operationally
simple for this scale.

Recommendation at discovery stage (non-binding, plan comparison still to
come): A as default (EMQX + Redpanda Connect + QuestDB or VictoriaMetrics +
Grafana Alerting), B where replay/buffering matters most, C only if ack
history/blackout ergonomics dominate and the team accepts a second alert
surface. All fit one small VM plus backups.

## 2. Unfamiliar products and approaches (O1)

All items below were selected as useful-but-unfamiliar relative to a thin
"MQTT + Postgres + cron + email" baseline. Familiar glue (Mosquitto,
Postgres, Grafana charts) is assumed known and only cited where defaults
govern behavior.

### 2.1 NATS JetStream — durable subject log with header-based dedup
What: JetStream adds persistence, at-least-once delivery, consumers, and
key-value/object stores on top of core NATS pub/sub [S01][S02]. A stream
stores messages on chosen subjects; consumers track delivery and ack.
Why here: 120 gauges need outage buffering (field link or server restart
must not lose readings), replay for backfill, and dedup of publisher
retries — all one mechanism. Consumers for store-writer, live alerts, and
audit can advance independently.
Governing behavior: publisher sets Nats-Msg-Id; server suppresses a second
store with the same id inside the stream duplicate_window and returns
PubAck with duplicate=true [S01][S02]. Dedup key is the id only, never the
body. Expected-state headers (Nats-Expected-Stream, -Last-Sequence,
-Last-Subject-Sequence, -Last-Msg-Id) give optimistic concurrency on append
[S02]. Streams also cap MaxBytes/MaxMsgs/MaxMsgSize/MaxMsgsPerSubject with
DiscardOld/DiscardNew policies; retention (limits/interest/workqueue) and
per-message TTL shape how long outage buffers survive [S01].
Defaults/limits: duplicate_window default 2 minutes, per-stream
configurable; server enforces a minimum of 100 ms for max-age and
duplicates window since v2.8.1 [S03]. Max payload defaults to 1 MiB at the
server (larger sensor batches must chunk). Dedup state is in-memory per
stream for the window — long windows on high-cardinality ids cost RAM.
Applicability: use stable per-reading ids (gauge_id + monotonic seq or
content hash of gauge+ts+value), not fresh UUIDs per attempt, or retries
will not dedup. Treat JetStream dedup as a 2-minute-class guard; permanent
idempotency needs a store upsert key (gauge, ts) or dedup table. Do not use
sequential global ids that cannot resume after retention truncation.
Version note: nats-server 2.14+ sources behavior changed (streams with
sources have no duplicate window unless one is set) [S03]; pin and test the
stream config on the deployed version.

### 2.2 EMQX — self-hosted MQTT broker with durable sessions and expiry controls
What: EMQX 5.x is an MQTT 3.1.1/5 broker with clustering, dashboard, rules,
and enterprise durability options; docs distinguish session persistence,
offline queues, and expiry [S04][S05].
Why here: gauges on flaky links need resume without loss: MQTT 5 session
expiry + offline message queue replays queued QoS1/2 messages on reconnect.
EMQX dashboard exposes session/message expiry knobs operators can see.
Governing behavior: session_expiry_interval controls how long after
disconnect the session (subscriptions + queued messages) survives; 0 means
discard immediately on disconnect, 0xFFFFFFFF means never expires (MQTT 5);
EMQX default maximum allowed session expiry is 2 hours unless raised in
dashboard/config [S04][S05]. max_mqueue_len (default 1000 per session in
5.x reports) bounds the offline queue; overflow drops oldest or newest per
policy. message_expiry_interval (MQTT 5 property / broker cap) bounds how
long an undelivered message stays queued; expired messages are dropped, not
delivered late. QoS 1 gives at-least-once; duplicates possible — expect
mqtt_duplicate flag downstream. Shared subscriptions spread load across
ingest replicas; dispatch-ack mode changes whether EMQX waits for PUBACK
before considering dispatch done [S05].
Defaults/limits: broker-wide mqtt scope settings apply cluster-wide and
take effect via conf load without restart in tested versions [S05]. Long
session expiry keeps sessions resident in memory for the whole interval —
memory cost scales with offline session count × queue depth (documented
after emqx#14482, PR #18443) [S05]. For 120 gauges this is trivial, but a
"never expire" default would leak memory if client ids churn; use stable
client ids (one per gauge or gateway) and finite expiry (hours, not
infinity).
Applicability: MQTT 5 preferred for expiry/property control; MQTT 3.1.1
clients get clean-session true/false only. Keepalive ~60 s, QoS 1, retained
false for readings (retained true only for last-will/status topics).
Size for worst-case outage: queue depth ≥ outage_seconds × per-gauge rate ×
gauges per session, else messages drop during long outages regardless of
expiry.

### 2.3 Redpanda Connect (formerly Benthos) — declarative stream normalizer
What: single Go binary / container that connects inputs → pipeline
(processors, Bloblang mapping) → outputs with at-least-once handling and
backpressure; MQTT input subscribes to broker topics [S06].
Why here: the "late/out-of-order/duplicate" mess is best tamed once, in one
visible YAML pipeline, before storage and alerting. One place to validate
schema, coerce units, stamp ingest_ts vs event_ts, normalize to ILP or
JSON, branch invalid rows to a quarantine topic/table, and emit metrics.
Governing behavior: mqtt input fields include urls, topics (both required),
qos (default 1), clean_session (default true), keepalive (default 30 s),
connect_timeout (default 30 s), auto_replay_nacks (default true); metadata
mqtt_duplicate/mqtt_qos/mqtt_retained/mqtt_topic/mqtt_message_id is added
per message [S06]. Processors relevant here: dedup by cache key
(gauge+ts), mapping (Bloblang) for unit coercion, filter for out-of-range
values, batch for efficient store writes. auto_replay_nacks=true replays
nacked messages indefinitely (backpressure); false drops them and saves
memory [S06].
Defaults/limits: at-least-once end to end — outputs may see redelivery, so
store writes must be idempotent. clean_session=true means the Connect
client itself does not resume a broker-side queue; for Connect-to-broker
durability across Connect restarts, use stable client_id with
clean_session=false and finite session expiry (broker permitting), or rely
on JetStream/upstream buffering instead. Bloblang is expressive but Turing
awkward for large joins — keep per-message logic only; history joins belong
in the store.
Applicability: run one replica per MQTT topic shard or shared-subscription
group at this scale; two replicas with shared subscription for HA. Version
pin: docs snapshot latest-connect 4.113.0 at fetch time; Benthos→Connect
rename means older blog config paths (benthos.dev) still work but new docs
live under docs.redpanda.com [S06].

### 2.4 QuestDB — SQL time-series with automatic out-of-order merge (O3)
What: columnar SQL engine with designated-timestamp ordering, time
partitioning (HOUR/DAY/WEEK/MONTH/YEAR), ILP + PGWire + HTTP ingest, WAL
tables [S07].
Why here: sensor backfill is legitimately out-of-order (buffered gauges
flush on reconnect; replays). QuestDB accepts out-of-order rows on ILP,
SQL INSERT, and COPY-into-partitioned-table and merges them into
chronological position automatically; only COPY into a non-partitioned
table rejects out-of-order input [S07]. No pre-sort required.
Governing behavior: a row is out-of-order when its designated timestamp is
earlier than the max committed timestamp; engine merges rather than
appends; hot partitions may split (prefix > new data + suffix and prefix >
cairo.o3.partition.split.min.size, default 50 MB) and squash in background
[S07]. Write amplification (physical rows per logical row) is the visible
cost: ~1.0 append-only, higher with far-behind arrivals; monitor per-table
table_write_amp_* (p50/p90/p99/max) and cluster Prometheus ratio
questdb_physically_written_rows_total / questdb_committed_rows_total over
deltas (e.g. 5 min), not lifetime average [S07]. Tuning: commitLag +
maxUncommittedRows per table hold a re-order buffer before commit
(e.g. commitLag 240 s discussed in guides); smaller partitions bound
rewrite cost per late event; WAL + partitioned tables recommended.
Types/units: TIMESTAMP is microsecond resolution; designate event time
(sensor ts) as the designated timestamp when late-data correctness
matters, ingest time only when append-only throughput dominates and
millisecond clock skew is below sampling resolution. ILP timestamp
precision is configurable per request (ns/us/ms/s) — mismatched precision
is a classic silent scale bug; set explicitly.
Limits: excessive far-behind data increases write amplification and commit
latency; non-WAL writers had O3 edge bugs near partition boundaries (see
§3.1) — use WAL tables and current releases. DEDUP UPSERT KEYS(...) mode
exists for idempotent upserts but disqualifies some fast-append paths
(performance note) — test at expected backfill rate.
Applicability: strong fit for this brief (120 gauges, bursty reconnect
flushes). Partition by DAY, WAL on, explicit ILP precision, per-table
commitLag sized to typical lateness (minutes), alert on write-amp p99.

### 2.5 VictoriaMetrics single-node + vmalert — cheap metrics store and rules
What: single-binary metrics store speaking Prometheus remote-write,
InfluxDB line, Graphite, OpenTSDB, native push; MetricsQL queries;
-retentionPeriod flag bounds history; single-node recommended until scale
forces cluster [S08].
Why here: cheapest credible metrics path with Grafana datasource; vmagent
can buffer and retry from edge/gateway; vmalert evaluates alerting/recording
rules with for: delay and routes to Alertmanager/webhook.
Governing behavior: retention is time-bounded (e.g. -retentionPeriod=1w…12w;
"infinite" expressed as large like 100y, not unset) [S08]. Dedup for
HA pairs via -dedup.minScrapeInterval (samples closer than interval are
deduplicated) — set to the scrape/ingest interval, not zero. Lookback/look-behind
window (default 5 min for instant queries; staleness handling) governs
whether sparse gauge samples appear in graphs/alerts; sparse sensors need
explicit range (e.g. [15m]) or last_over_time, not bare instant selectors.
vmalert for: delays firing until condition holds continuously, suppressing
blips; group/evaluation intervals trade detection latency for load.
Limits: single-node is one failure domain — backups (vmbackup/vmrestore)
and retention sizing are the HA story; no per-series TTL, only global
retention; high-cardinality label sets (per-reading UUIDs as labels) are
the classic footgun — keep labels to gauge_id/site/sensor_type, put
reading seq in the value/timestamp. Out-of-order and duplicate samples
within the dedup window are handled; far-out-of-order backfill beyond the
configured lookback may need explicit import (vmctl/native import) rather
than live push — verify on the pinned version.
Applicability: best when gauges report at regular cadence (e.g. every
1–5 min) and alerts are threshold/dead-man over recent windows. For
irregular event-time backfill with SQL analytics, QuestDB fits better.

### 2.6 GreptimeDB — single-engine metrics/logs/traces with multi-protocol ingest
What: Rust columnar engine, one table model (tags + timestamp + fields) over
object storage; ingests Prometheus remote-write, Influx line, OTLP/HTTP,
Loki push, Elasticsearch bulk; queries SQL + PromQL; standalone single
binary for self-host [S09].
Why here: future-expansion option — same store can grow from gauge metrics
to gateway logs and traces without a second system. EMQX rule-engine
integration can write MQTT→GreptimeDB line protocol directly for small
deployments [S09].
Governing behavior: protocol-per-source mapping (Prometheus→remote-write,
OTLP SDK→OTLP/HTTP, etc.) [S09]; schema inferred from tags/fields with
explicit types on create for stability. Standalone container tag observed
v1.1.4 in community lane; docs version 1.2 at fetch [S09] — pin a release
tag, not latest.
Limits: younger ecosystem than VictoriaMetrics/QuestDB; fewer Grafana
examples; object-storage-first design means local-disk standalone needs
explicit sizing. No MQTT-native listener in core — MQTT arrives via
broker+bridge (EMQX rule or Connect), not direct gauge→DB.
Applicability: pick when the roadmap explicitly includes logs/traces or
PromQL+SQL dual queries; otherwise VictoriaMetrics/QuestDB are safer. Keep
labels/tags low-cardinality as in §2.5.

### 2.7 Grafana Alerting (unified) — evaluation, pending, NoData/Error, history
What: Grafana-managed rules with evaluation group + interval, pending
period (for), NoData/Error handling, labels/annotations, notification
policies, state history [S10].
Why here: operators need understandable alerts with ack history. Unified
alerting gives Normal→Pending→Alerting lifecycle, per-rule NoData/Error
mapping, and silences/mute timings without a second binary.
Governing behavior: evaluation_timeout default 30 s, max_attempts default 3
control Error detection [S10]. Pending period is honored by Alerting,
NoData, and Error paths: Normal→Pending→(Alerting|NoData|Error); pending 0
skips Pending and transitions immediately [S10]. Missing series are marked
stale after two evaluation intervals, keep last state for two intervals,
then transition to Normal with grafana_state_reason=MissingSeries; stale
Alerting/NoData/Error instances resolve and notify like other resolved
alerts [S10]. Per-rule NoData choice: NoData (creates DatasourceNoData
instance), Alerting (fires after pending), Normal/Keep-last; Error choice
analogous with DatasourceError [S10]. State history backend (SQL or Loki)
must be configured or ack/history queries go nowhere — verify before
promising "acknowledgement history."
Defaults/limits: group evaluation interval (e.g. 1 m) × pending (e.g. 5 m)
sets detection latency; sparse gauges need query windows that cover jitter
(e.g. 15 m range starting 5 m ago) plus explicit NoData=Alerting on
dead-man rules, else late data reads as flapping NoData. Keep-last on
NoData hides dead exporters — prefer Alerting for dead-man, Normal/Keep
only for intentionally sparse series.
Version behavior: pending period now applies to NoData/Error (PR #117024,
Grafana 12.4.x line) — previously NoData/Error fired immediately;
transient blips no longer page [S11]. Pin Grafana minor and re-test
dead-man timing on upgrade. See §3.2.

### 2.8 Alerta — consolidation, dedup, ack history, blackouts
What: JSON API server + web UI + CLI that consolidates and de-duplicates
alerts from many sources for at-a-glance view; single screen over many
monitoring tools; plugins/integrations/webhooks; API keys, Basic/OAuth;
backs onto Postgres or Mongo [S12].
Why here: if the brief's "understandable alerts and acknowledgement
history" becomes the dominant UX, a purpose-built alert console beats
rebuilding ack/blackout/history in Grafana. Correlates duplicate events
into one alert with history entries per ack/close/reopen.
Governing behavior: alerts carry resource/event/environment/severity/status
lifecycle (open→ack→closed), timeout/heartbeat housekeeping, blackout
windows that suppress matching alerts; heartbeats mark sources stale.
History is first-class (every state change recorded with user/tool).
Limits: another service + DB to run; alert evaluation still lives upstream
(Grafana/vmalert/Connect) — Alerta does not replace threshold evaluation,
only lifecycle/history. Release pace slower; verify Postgres backend
version support and auth provider behavior on the pinned release.
Applicability: adopt when operators explicitly want one ack place, audit
trail, and blackouts across present + future sources; skip when Grafana
state history + silences suffice.

## 3. Issue / fix / regression / release chains (O3)

### 3.1 QuestDB O3 lag commit across partition boundary — issue #7278 → PR #7285 (+ #7297)
Chain: non-WAL writer ingesting out-of-order where the in-order prefix
crossed a partition boundary sealed the earlier partition in memory without
persisting _txn; the next lag commit's o3MoveUncommitted reclaimed the
active partition tail and reset maxTimestamp to the durable _txn value,
mis-ordering rows [S07-fix]. PR #7285 fixed the maxTimestamp handling;
follow-up #7297 fixed O3 lag commit recording maxTimestamp below committed
max across partitions (resetToLastPartition path) [S07-fix]. Lesson for
this brief: late data landing near midnight on DAY-partitioned tables (or
top of hour on HOUR) is exactly the risky shape — partition-boundary +
out-of-order + lag commit. Mitigations adopted in discovery: WAL tables,
partition DAY, current QuestDB release, explicit backfill test that straddles
a boundary, write-amp + row-count reconciliation checks. Evidence present
and applicable; fix verified by reading PR descriptions and linked issue
text, not by executing QuestDB (no runtime per assignment).

### 3.2 Grafana pending period for NoData/Error — PR #117024 (12.4.x)
Chain: before the change, NoData/Error alert instances fired immediately,
ignoring the pending (for) period; transient query blips paged. PR #117024
made Normal→Pending(NoData|Error)→(NoData|Error) honor the pending period,
with immediate fire only when pending=0 or on Recovering→Alerting-style
transitions; docs now state pending is honored on all three paths [S10]
[S11]. Operators upgrading to 12.4.x see fewer transient pages but must
re-tune dead-man rules: a 5 m pending on a dead-man rule now delays the
page by 5 m where it previously fired at once. Lesson: pin Grafana minor,
record pending values per rule, and re-run dead-man timing validation on
every Grafana upgrade. Evidence present and directly applicable to gauge
offline detection.

### 3.3 NATS duplicate-window floor — issue #3056 → v2.8.1
Chain: JetStream enforced a minimum of 100 ms for max-age and duplicates
window settings (v2.8.1 release notes, #3056) [S03]. Sub-100 ms windows are
rejected/clamped. Lesson: tests that set tiny windows for speed must use
≥100 ms; production windows stay in minutes. Minor but consequential for
validation scripts. Evidence present, applicable to test design.

### 3.4 EMQX session-expiry memory cost — issue #14482 → PR #18443 (docs)
Chain: schema description for mqtt_session_expiry_interval said only how
long a session survives disconnect, not that the session stays resident in
memory for the whole interval; PR #18443 documented the memory cost [S05].
Lesson: long/never-expire sessions with churning client ids leak RAM;
use stable client ids + finite expiry. Evidence present, applicable to
broker sizing. Usage/billing for EMQX Cloud unobserved (self-host assumed);
reported as null in source map.

Absent/inapplicable: no crash-loss or data-corruption chain was found for
VictoriaMetrics single-node or Redpanda Connect MQTT input within the
bounded search; absence is reported, not asserted as safety. GreptimeDB and
Alerta: no specific regression chain chased in this window; version pin +
upgrade-note reading proposed as validation (§5).

## 4. Cross-cutting findings

Transport: MQTT QoS 1 + stable client ids + finite session/message expiry
(EMQX) or JetStream file streams + stable Nats-Msg-Id + 2 m-class duplicate
window (NATS). Either way, duplicates remain possible — downstream upsert
keys are mandatory. Keep MQTT payloads small JSON or CBOR; include
gauge_id, event_ts (ISO-8601 UTC, explicit), seq, value, unit, fw rev.
Never use retained=true for readings.

Storage: designate event time as the timestamp when correctness matters;
also store ingest_ts and source (live/backfill) for audit. Partition/day
(QuestDB) or retention-weeks (VictoriaMetrics) sized to utility policy;
test the boundary/backfill path, not just append. ILP precision, SQL types
(TIMESTAMP µs), and PromQL lookback must be set explicitly — silent unit
mismatches are the top data-correctness risk.

Alerting: threshold rules (value out of band for pending 5 m), dead-man
rules (NoData→Alerting after pending, with query window covering jitter),
and flap guards (evaluation interval ≥ sensor cadence). State history
backend configured and queried for ack history; or Alerta when ack UX
dominates. Every rule records owner, runbook link, severity, and pending.

Outage recovery: broker/JetStream buffers minutes–hours of outage (size
queues/streams for worst case); Connect replays with backpressure;
store backfill path accepts far-late rows (QuestDB O3 / VM import);
alerts distinguish "gauge offline" (dead-man) from "value bad"
(threshold); reconnect storms are absorbed by batch writes and grouped
notifications, not per-reading pages.

Expansion: 120 → 500+ gauges by adding broker nodes or JetStream replicas,
shared-subscription ingest replicas, store retention/partition growth, and
label/tag discipline. Multi-site adds per-site gateway (buffer + TLS) and
per-site labels; no architecture change. Logs/traces later favor
GreptimeDB or a separate Loki; do not force metrics store to hold blobs.

Budget: all core pieces run as OSS single binaries/containers on one modest
VM (2–4 vCPU, 8–16 GB RAM, 200–500 GB disk) plus off-box backups. Cost
drivers are retention disk, backup storage, and operator time — not
licenses. Cloud MQTT/TS hosting is an alternative, not the default; no
billing behavior was observed (null).

## 5. Uncertainty and discriminating validations (proposals vs executed)

Executed in this window (no runtime, no sandbox witnesses): public primary-
source reads only — official docs pages and GitHub PR/release text listed
in source-map.json (observed operations: web_search + web_fetch; exact
URLs, versions, access timestamps recorded). No broker/store/alert code was
executed; no installed packages; no private provider internals. Proposed
checks below were NOT run and must not be mistaken for results.

Proposed validations (discriminating, ordered by risk):
V1 Backfill across partition/boundary: publish 24 h of synthetic gauge
readings straddling a DAY boundary with random lateness/duplicates; assert
row counts, no gaps/dupes on (gauge, ts), write-amp p99 bounded. Kills
QuestDB O3-boundary and upsert-key bugs.
V2 Duplicate storm: replay the same MQTT batch 3× and the same JetStream
batch with stable ids; assert exactly-once in store, PubAck.duplicate seen,
Connect dedup counter incremented. Kills id-key mistakes.
V3 Outage buffer sizing: kill ingest for 2× worst-case outage, then
reconnect; assert zero loss, queue/stream depth stayed under cap, no
never-expire growth. Kills expiry/queue mis-sizing.
V4 Dead-man timing: stop one gauge; measure time-to-page vs pending +
interval + query window on the pinned Grafana version; repeat after any
Grafana upgrade. Kills NoData/pending mis-tuning (§3.2).
V5 Precision/unit trap: ingest same reading as ns/us/ms/s and °C/°F mixed;
assert stored values equal after coercion and dashboard units correct.
Kills silent scale bugs.
V6 Ack-history round trip: fire, ack, resolve, blacklist one alert; assert
history entries with actor + timestamp survive restart and are queryable.
Kills "history configured nowhere" gaps.
V7 Upgrade replay: re-run V1–V4 on each pinned minor upgrade (EMQX, NATS,
QuestDB/VM, Grafana, Connect); diff behavior. Kills version drift.

Uncertainty retained: exact gauge cadence/payload/network (assumed
minutes, JSON over MQTT); utility retention policy (assumed weeks–months);
operator count/ack SLA; whether Alerta's extra service is wanted (user
decision); GreptimeDB maturity at deployment time; cloud-vs-self-host
preference beyond "modest self-hosted budget." None of these block the
discovery; each becomes a per-plan disposition or user decision after
reveal.
