# S06 device-alerts — final plan (reviser, complete deliverable)

Case S06 device-alerts; method M06 v1 evidence-first-challenge (control arm,
full-discovery); stage reviser. Brief: small water-utility sensor alert
dashboard for 120 remotely connected gauges. Data arrive late, out of order,
sometimes duplicate. Operators need understandable alerts plus
acknowledgement history. Operational triage, not automated safety control.
Modest self-hosted budget. Must cover products, transport/storage/alert
mechanisms, version behavior, outage recovery, future expansion.

This file is ONE coherent COMPLETE self-contained final covering obligations
O1–O6 and every exact P clause (P1–P6). It was authored after reading in full
the exact brief, the research draft (324 lines), discovery (434 lines),
revealed plan, both own-arm source maps, all predecessor source excerpts, and
the complete critique (M1–M11, m1–m10) with its independent re-fetch evidence.
Consequential changes were checked against affected dependencies (noted per
finding). Critic demands were judged on evidence, not obeyed automatically:
each carries an explicit Accept / Amend / Retain-uncertainty verdict below,
with reasoning. No verdict below is Reject-as-false-direction: the critic
found no false rejection and this reviser concurs — all six P dispositions
are directionally correct; the corrections make mechanisms, scope, keys,
proof gates, and validations executable.

Source citations [S01..S12, S07-fix, C01..C13] resolve in reviser
source-map.json and sources/ excerpts carried forward from own-arm
predecessors (immutable IDs, no rebind; mutable docs drift explicit with
URL + version + access timestamp). Prose below stands alone: IDs are
provenance, never substitutes for material text. Predecessor-observed
(single-sourced, critic did not re-fetch) is distinguished from
never-observed throughout.

Original constraints retained (non-negotiable): 120 gauges; late /
out-of-order / duplicate tolerated by design; understandable alerts; ack
history as audit record (actor + timestamp per transition, survives
restart, queryable); triage-not-control — alerts advise operators only,
never drive valves/pumps, no actuation interlock, no safety claim;
self-hosted; modest budget (one small VM + off-box backups); investigate
products, transport/storage/alert mechanisms, version behavior, outage
recovery, expansion.

## 1. Discovery: materially different approaches (O1)

Four genuinely different approaches are retained with adopt-when conditions.
None is dropped. A thin "MQTT + Postgres + cron + email" baseline is assumed
known and is not re-argued.

Architecture A (default): MQTT-native ingest + stream normalizer +
relational/TS store + Grafana. Gauges publish MQTT QoS 1 to a self-hosted
broker (EMQX, pinned major; §2.2 conditions). One Redpanda Connect pipeline
subscribes, validates schema, coerces units, stamps ingest time alongside
event time, quarantines invalid rows, batches store writes, and exposes
pipeline metrics. Store is QuestDB (SQL + backfill correctness) or
VictoriaMetrics single-node (regular cadence + PromQL); choice is user
decision D1 with per-store conditions in §2. Grafana dashboards + Grafana
Alerting evaluate threshold rules, dead-man (missing-data) rules, and error
rules, and route grouped notifications; ack history lives in configured
state history (default leg, proof-gated by V6) or Alerta (D2). Strengths:
MQTT fits flaky links and small payloads; each layer replaceable; cheapest
to run. Risks: dedup windows to align (broker queue vs stream vs store
upsert); state-history backend must be explicitly chosen and proven.

Architecture B (JetStream transport): NATS JetStream as durable
transport + outage buffer + short-window dedup, same store and alert
options as A. Gauges or field gateways publish to JetStream subjects with
stable Nats-Msg-Id (gauge_id + monotonic seq, never fresh UUIDs per
attempt). JetStream keeps messages durably (file storage), suppresses a
second store with the same id inside duplicate_window (default 2 minutes),
returns PubAck with duplicate flag, and lets independent consumers
(store-writer, live alerts, backfill/audit) replay independently.
Strengths: one durable log covers outage buffering and replay; server-side
dedup is simple and observable. Risks: dedup window is time-bounded (2
minutes default; server floor 100 ms since v2.8.1), so it is only a
near-term guard — permanent idempotency must live downstream in the store
upsert key (gauge, ts, seq) or a consumer ledger. NATS MQTT adapter for
MQTT-only gauges is plausible (NATS docs carry an MQTT section) but no
adapter excerpt was fetched at either stage: cite-before-recommend,
uncertain until cited (M9). Expected-state headers
(Nats-Expected-Stream / Last-Sequence / Last-Subject-Sequence /
Last-Msg-Id) give optimistic concurrency on append where needed.

Architecture C (Alerta ack server): same ingest as A or B, but alert
lifecycle (open/ack/closed/reopen, blackouts, history) is owned by Alerta
9.1 (JSON API server + web UI + CLI, consolidation and dedup across many
sources, alert timeouts/heartbeats, blackouts, customer views, API keys,
Basic/OAuth2) fed by the stream processor or Grafana webhooks, with Grafana
kept for charts and rule evaluation. Strengths: ack history, dedup across
sources, blackouts, and one canonical ack console are Alerta's core job.
Risks: two alert surfaces can drift (rules upstream, lifecycle in Alerta);
extra service + database to run. Backend matrix (Postgres or Mongo) was
predecessor-observed (S12 excerpt) but not critic-re-observed: retain as
single-sourced, cite-before-adopt at deploy (m5).

GreptimeDB variant (optional enhancement): replace the store with
GreptimeDB single binary (one table model of tags + timestamp + fields;
multi-protocol ingest including Prometheus remote-write, OTLP/HTTP, Influx
line, Loki push; SQL + PromQL queries) when the roadmap explicitly includes
logs/traces or dual-query needs. MQTT arrives via broker + bridge (EMQX rule
or Connect), never direct gauge-to-DB. Docs 1.2 ingestion-path table is
confirmed at both stages; standalone tag v1.1.4 and the EMQX-rule-to-line-
protocol action were predecessor-observed but not critic-re-observed:
retain with pin-at-deploy (m4). Younger ecosystem than QuestDB /
VictoriaMetrics; not the default.

vmalert + Alertmanager routing (alternative idiom, uncertain): Prometheus-
rule idiom (groups, for:) as an alternative to Grafana-managed rules. No
vmalert source was fetched at either stage; the M2 scope finding means this
leg does not inherit Grafana NoData/Error/pending/Datasource-routing
semantics. Retained only as cite-or-mark-uncertain: add a vmalert citation
at deploy or mark the leg uncertain with per-engine dead-man semantics
proven by V4-leg (m7).

Recommendation (binding default with open decisions): A as default (EMQX +
Connect + QuestDB-or-VM + Grafana-managed alerting), B where replay /
buffering dominates, C where ack-history / blackout ergonomics dominate,
GreptimeDB only on explicit log/trace roadmap. D1 (store) and D2 (ack
server) remain user decisions; §5 records them without fiat. All fit one
modest VM plus backups (see §7).

Unfamiliar tools selected beyond the thin plan (O1, each with governing
detail in §2): NATS JetStream header dedup + expected-state concurrency;
EMQX durable sessions with version-dependent expiry caps + offline queues;
Redpanda Connect declarative normalizer with MQTT defaults + metadata + TLS
block; QuestDB designated-timestamp O3 merge + write-amp observability;
VictoriaMetrics single-node retention/dedup/lookback + vmbackup tools;
GreptimeDB multi-protocol single engine; Grafana unified alerting pending /
NoData / Error / Datasource routing / state history; Alerta consolidation /
lifecycle / blackouts / heartbeats.

## 2. Governing behavior, defaults, limits, applicability (O2)

Conventions: "Confirmed (both stages)" means predecessor excerpt + critic
re-fetch agree. "Single-sourced" means predecessor-observed but not
critic-re-fetched: retained with citation, validated at deploy. "Uncertain"
means never observed or contradicted-as-stated: marked, with a validation
proposal. Mutable docs pages carry URL + version + access timestamp in
source-map.json; GitHub PR/release rows are immutable by number.

### 2.1 NATS JetStream (Arch B)

Confirmed (both stages): duplicate_window default 2 minutes ("Duplicate
Window: 2m0s; server turns away second message with same Nats-Msg-Id within
window") [S01][C01]. Nats-Msg-Id is the dedup key: "Messages with the same
ID within the deduplication window will be rejected as duplicates"; dedup
keys on the id only, never the body [S02][C02]. Expected-state headers
(Nats-Expected-Stream, Expected-Last-Sequence,
Expected-Last-Subject-Sequence, Expected-Last-Msg-Id): publish fails unless
conditions are met [S02][C02]. Server enforces minimum 100 ms for max-age
and duplicates-window settings since v2.8.1 (issue #3056) [S03][C03].
Applicability: stable per-reading ids (gauge_id + monotonic seq, or content
hash of gauge + ts + value); seq-reset rule in §7 (M11) governs reboots so
stable-id dedup does not break. Treat JetStream dedup as a 2-minute-class
guard; permanent idempotency is the store key (gauge, ts, seq) (§2.5).
Streams cap MaxBytes/MaxMsgs/MaxMsgSize/MaxMsgsPer msgs-per-subject with
DiscardOld/DiscardNew; retention (limits/interest/workqueue) and per-message
TTL shape outage-buffer survival (predecessor-observed, retained
single-sourced). Max payload server default 1 MiB (predecessor-observed):
chunk larger batches. Dedup state is in-memory per stream for the window:
long windows on high-cardinality ids cost RAM. Version note: nats-server
2.14 sources-window change ("streams with sources have no duplicate window
unless one is set") cites a client-library commit note, not a primary
server release/doc excerpt, and was NOT observed in the critic window:
UNCERTAIN until a primary citation (server release notes or versioned
stream-config docs); V7 pins the nats-server minor and asserts the deployed
stream config round-trips (M9). NATS MQTT adapter: UNCERTAIN,
cite-before-recommend (M9).

### 2.2 EMQX broker (Arch A default transport)

Confirmed (both stages): session_expiry_interval default 2 hours;
max_mqueue_len default 1000 per session; with the default in-memory session
store a disconnected session stays resident in memory for the whole
interval [S04/S05][C04]; memory-cost mechanism documented by PR #18443 from
issue #14482 ("docs(i18n): explain the memory cost of
session_expiry_interval"; operator "had to read emqx_channel.erl")
[S05][C05]. Corrected scope (M1, ACCEPT): the 2-hour session_expiry_interval
row applies to "MQTT 3.1 and 3.1.1 clients that connect with Clean Session
= false. MQTT 5.0 clients set their own value." The MQTT 5 cap is a
separate knob, max_session_expiry_interval, default infinity (no limit),
available since EMQX 6.3.0, which "caps the session expiry interval that an
MQTT 5.0 client can request"; the knob "does not exist before 6.3" [C04]
[C05]. Consequence: on the recommended path (EMQX + MQTT 5, current
6.x docs), a gauge/gateway can request never-expire and the broker will not
clamp it unless the operator sets the 6.3+ cap. The draft's "2 h default
ceiling" holds for 3.x clients / 5.x-era config, NOT for MQTT 5 on 6.3+.
Final conditions (mandatory): pin EMQX major (5.x vs 6.x) at deploy. On
6.3+, set max_session_expiry_interval explicitly finite (hours, e.g. 2 h
ceiling or utility-tuned) IN ADDITION to session_expiry_interval; never
leave infinity with churning ids. On 5.x, the MQTT 5 cap behavior is
UNCERTAIN (5.x branch docs not re-fetched in critic window): cite the 5.x
branch doc at deploy or upgrade-pin to 6.3+ with the explicit cap. Stable
client ids mandatory (one per gauge or field gateway); finite expiry
(hours, never 0xFFFFFFFF); QoS 1 for readings (at-least-once; expect
duplicates downstream); retained=false for readings (retained only for
status/last-will); keepalive ~60 s on the gauge-to-broker hop (reconciled
with Connect-hop 30 s in §2.3/§7, M11); bounded offline queue
(max_mqueue_len sized to worst-case outage × rate; §6 V3 quantifies for 120
gauges); shared subscriptions for ingest replicas. message_expiry_interval:
mandatory-to-set but VALUE UNCERTAIN — no observed excerpt states the
broker default/cap (M1): set an explicit finite value at deploy, cite the
versioned doc row, and cover it in V3 (expiry/queue sizing). Affected
dependencies: P1 broker block, E4 sizing, V3 assertions.

### 2.3 Redpanda Connect normalizer (mandatory between broker and store)

Confirmed (both stages): mqtt input urls + topics required; qos default 1;
clean_session default true; keepalive default 30; connect_timeout default
30 s; auto_replay_nacks default true ("replayed indefinitely ... If false
these messages will instead be deleted" — backpressure vs memory trade);
per-message metadata mqtt_duplicate, mqtt_qos, mqtt_retained, mqtt_topic,
mqtt_message_id [S06][C06]. Docs snapshot latest-connect 4.113.0 at fetch;
introduced 4.37.0; Benthos→Connect rename noted (old benthos.dev paths
work, new docs under docs.redpanda.com) [S06][C06]. Mandatory pipeline
(one visible YAML): validate schema, coerce units (with tolerance rule,
§6 V5), stamp ingest_ts alongside event_ts, normalize to ILP/JSON, branch
invalid rows to quarantine topic/table, batch store writes, emit pipeline
metrics. Corrected claims (M5, ACCEPT): the draft's "exposes dedup
counters" / "Connect dedup counters increment" is UNSOURCED — the mqtt-
input page documents no dedup processor and no dedup counter. Dedup would
come from an explicitly configured processor (cache/dedup + Bloblang) and
its operator-defined metrics, which the draft never named. Final: name the
exact processor + metric at deploy (e.g. dedup processor on key
gauge+ts+seq with a stated cache backend and a stated metric name), or drop
the counter assertion: V2 asserts store exactly-once on (gauge, ts, seq) +
mqtt_duplicate metadata counts + named JetStream publish-response
observation instead. clean_session=false durability ("stable client_id with
clean_session=false ... for Connect-to-broker durability across Connect
restarts") is UNPROVEN: the page says only "Set whether the connection is
non-persistent" with no resume semantics, and interplay with M1 expiry caps
and offline-queue bounds is untested. Final: treat as a PROPOSED check
(restart Connect mid-outage, assert zero loss / bounded duplicates), not a
settled property; default stays clean_session=true unless V3-leg proves the
resume path on the pinned versions. TLS/auth block exists (tls enabled /
skip_cert_verify / root_cas / client_certs plus user/password) [C06] but
the draft never set it: §7 makes broker auth/ACL + TLS + Connect tls.enabled
+ secrets handling MANDATORY (M11). Run one replica per topic shard or
shared-subscription group; two with shared subscription for HA at this
scale. Keep per-message logic only; history joins belong in the store.

### 2.4 QuestDB (store option 1: SQL + backfill correctness)

Confirmed (both stages): a row is out-of-order when its designated
timestamp is earlier than the max committed timestamp; engine merges rather
than appends. Per-method table: ILP (HTTP and TCP) accepted and merged;
SQL INSERT accepted; COPY into a partitioned table accepted; COPY into a
non-partitioned table rejected (serial, requires pre-sorted input) [S07]
[C07]. Partition split when prefix > new data + suffix and prefix exceeds
cairo.o3.partition.split.min.size default 50 MB [S07]. Write-amp
observability: per-table table_write_amp_* (p50/p90/p99/max) and cluster
Prometheus ratio questdb_physically_written_rows_total /
questdb_committed_rows_total compared as deltas over a window (e.g. 5 min),
not lifetime average [S07][C07]. Docs recommendation: "always ingest into a
partitioned, WAL-enabled table" [C07]. Applicability: partition BY DAY, WAL
on, designated timestamp = sensor event time (correctness over append
throughput), explicit ILP precision per request (ns/us/ms/s — mismatched
precision is a classic silent scale bug), per-table commitLag + maxUn-
committedRows sized to typical lateness (minutes), alert on write-amp.
Single-sourced (predecessor-observed, not critic-re-fetched; retained with
deploy validation): TIMESTAMP microsecond resolution; DEDUP UPSERT KEYS
mode exists for idempotent upserts but disqualifies some fast-append paths
(test at expected backfill rate); QuestDB DAY-partition drop policy and
snapshot + WAL backup procedure (M8). Corrected inference (M6, ACCEPT):
"fix verified / WAL-mitigates" is DOWNGRADED to "mitigation inferred from
fix scope + docs recommendation." Neither observed text states WAL writers
are immune to the #7278 bug class; reading a non-WAL fix does not verify
WAL immunity. V1 must run on the pinned release (QuestDB-leg assertions,
§6). Follow-up #7297 (resetToLastPartition path): UNCITED — single-sourced
to the S07-fix locator line, no separate fetch observed: dropped as a
specific claim, retained only as "locator mentions a follow-up; fetch at
deploy if the pinned release predates it" (M6). "Write-amp p99 bounded" is
unassertable without a bound: docs state "There is no universal threshold.
Write amplification is a sensitivity indicator, not a pass/fail metric"
[C07]. V1 pre-registers an explicit numeric bound + workload + measurement
choice (tables() p99 vs Prometheus delta ratio) (M6/M10).

### 2.5 VictoriaMetrics single-node + store-key design (store option 2)

Confirmed (both stages): -retentionPeriod flag exists; default 1 month (31
days); minimum 24 h / 1 d; vmbackup / vmrestore / vmbackupmanager exist;
cardinality-limiter / high-cardinality guidance surface exists [C09]
(predecessor S08 agrees on flag + single-node scope). Single-sourced
(predecessor-observed in S08 excerpt, NOT re-observed in critic window;
neither confirmed nor refuted — retained with citation, validated at
deploy, M8): "infinite" expressed as a large value such as 100y (never
unset); -dedup.minScrapeInterval HA-dedup guidance (set to ingest
interval, not zero); instant-query lookback / look-behind 5-minute default
with sparse-series guidance (explicit range such as [15m] or
last_over_time, not bare instant selectors). Applicability: best when gauges
report at regular cadence (e.g. every 1–5 min) and alerts are threshold /
dead-man over recent windows; keep labels to gauge_id / site / sensor_type,
reading seq in value/timestamp, never per-reading UUIDs as labels (classic
cost footgun); single-node is one failure domain — backups + retention
sizing are the HA story; no per-series TTL, only global retention.
Corrected key + backfill leg (M4, ACCEPT): the draft's bare "(gauge, ts)
mandatory" COLLIDES when two readings from one gauge share event_ts (coarse
resolution, corrected-value retransmit, batch flush with one timestamp,
sub-resolution sampling): last-write-wins would silently drop one. The
payload already carries seq but the key ignored it. Final key: (gauge_id,
event_ts, seq) with an explicit conflict policy (which row wins on full-key
collision, ties broken how, duplicates counted where; counters named per
store). "Store upsert key" language fits QuestDB (DEDUP UPSERT KEYS,
single-sourced) better than VictoriaMetrics, whose documented dedup is
HA/scrape-interval based, not a generic idempotency key. Discovery honestly
hedged VM far-backfill ("may need explicit import (vmctl/native import)
rather than live push — verify on the pinned version"); the draft upgraded
this to settled "VM import" without pinned-version evidence. Final:
VM backfill path UNCERTAIN until a pinned-version test; V1 is split into
QuestDB-leg and VM-leg assertions (the draft's V1 was QuestDB-shaped only:
DAY boundary, tables()/Prometheus write-amp) (M4/M10). Transport-dedup-is-
never-sufficient principle is preserved: JetStream window + MQTT redelivery
are near-term guards; permanent idempotency lives in the store key.

### 2.6 GreptimeDB (optional-enhancement store)

Confirmed (both stages): docs 1.2 "Choose an Ingestion Path" table
(OpenTelemetry SDK → OTLP/HTTP, Prometheus → Remote Write, Influx →
Line Protocol, Loki → Loki Push, and others); one table model (tags +
timestamp + fields); SQL + PromQL queries [S09][C13]. Single-sourced
(retained with pin-at-deploy, m4): standalone single binary, community-lane
tag v1.1.4 observed; EMQX rule-engine → GreptimeDB line-protocol action for
small MQTT deployments. Limits: younger ecosystem, fewer Grafana examples,
object-storage-first design needs explicit local-disk sizing; no MQTT-
native listener — MQTT arrives via broker + bridge, not direct gauge-to-DB.
Applicability: adopt only when the roadmap explicitly includes logs/traces
or PromQL+SQL dual queries; otherwise QuestDB/VictoriaMetrics are safer.
Tag cardinality disciplined as in §2.5; release pinned, never latest.

### 2.7 Grafana Alerting, unified (alert evaluation + routing + history surface)

Confirmed (both stages): evaluation_timeout default 30 s, max_attempts
default 3 control Error detection; pending honored on ALL THREE paths
(Normal→Pending→Alerting, Normal→Pending→NoData, Normal→Pending→Error;
pending 0 skips Pending and transitions immediately) [S10][C10]. Missing
series marked stale after two evaluation intervals, keep last state for two
intervals, then transition to Normal with grafana_state_reason annotation =
MissingSeries; stale Alerting/NoData/Error instances resolve and notify
like other resolved alerts [S10][C10]. Per-rule NoData choice (NoData
instance vs Alerting-after-pending vs Normal/Keep-last) and analogous Error
choice (DatasourceError); DatasourceNoData / DatasourceError instances
carry exact labels alertname (either DatasourceNoData or DatasourceError),
datasource_uid, rulename [C10] (m2: use these exact names in routing rules;
"rule/data-source" phrasing retired). MissingSeries is an ANNOTATION value,
not a label, for routing purposes (m6). Corrected scope + payload + routing
(M2, ACCEPT — none of this rejects P2/P3 dispositions): (1) SCOPE: "No Data
and Error states are supported only for Grafana-managed alert rules." The
vmalert alternative does NOT inherit NoData→Alerting, pending-on-NoData, or
DatasourceNoData routing. P2/P3 replacements are therefore SCOPED to
Grafana-managed rules; §1 vmalert leg requires its own per-engine dead-man
semantics + citation (m7). (2) PAYLOAD: "when you configure the No Data or
Error behavior to set the Alerting or Normal state, Grafana re-uses the
latest known set of fields in Values, but will use −1 in place of the
measured value." Dead-man pages display −1 as the value; runbooks and
dashboards that render Values MUST be designed for it (template text,
unit labels, "no data" display) or they will mislead. (3) ROUTING:
"DatasourceNoData and DatasourceError alert instances are independent from
the original alert instance ... existing silences, mute timings, and
notification policies applied to the original alert may not apply to them."
A dead-man page can BYPASS the site/severity grouping unless separate
policies match alertname=DatasourceNoData / DatasourceError. Final REQUIRES
notification policies, silences, and mute timings matching the Datasource*
labels in addition to per-rule grouping. Version behavior: PR #117024
("Alerting: Apply pending period to NoData and Error alerts") is MERGED;
pre-change NoData/Error "trigger[ed] immediately on the first evaluation";
post-change they "honor the same pending period as regular alerts" and
"Notifications are sent only after this pending period elapses" [S11][C11];
current docs honor pending on both paths [C10]. The "12.4.x" minor-line pin
is UNDER-CITED: no 12.4.x milestone, release tag, or release-note row was
observed in either fetch window (M3). Final SOFTENS to: "verified on
current docs at fetch; re-validate the pinned minor's NoData/Error pending
behavior at deploy and on every upgrade" (the 12.4.x pin may be exactly
right; it is under-cited, not refuted). V4/V7 test the pinned version's
ACTUAL behavior rather than asserting a version number. Recovering→Alerting
immediate-fire edge (S11 excerpt) is retained and asserted in V4 (M10).
Terminology (m1): "evaluation group interval" is retired; final uses
Grafana evaluation interval per rule group (e.g. 1 min) vs notification
grouping (site/severity) distinctly. State-history backend (SQL or Loki)
must be configured or ack/history queries go nowhere — but whether it
carries AUDIT-GRADE actor identity is proof-gated (M7, §3 P4, §6 V6).

### 2.8 Alerta (ack-server option)

Confirmed (both stages): Alerta 9.1 consolidates and de-duplicates alerts
from many sources for at-a-glance visualisation on a single screen;
combines JSON API server + web UI + CLI; integrations/webhooks; API keys;
Basic Auth or OAuth2; alert timeouts/heartbeats/housekeeping, blackouts,
customer views, alert lifecycle [S12][C12]. Single-sourced
(predecessor-observed, not critic-re-observed; cite-before-adopt, m5):
Postgres or Mongo backend matrix; alert lifecycle open→ack→closed with
history entries per ack/close/reopen. Limits: another service + DB to run;
evaluation still lives upstream (Grafana/vmalert/Connect) — Alerta does not
replace threshold evaluation, only lifecycle/history. Applicability: adopt
when operators want one canonical ack place, audit trail, and blackouts
across present + future sources (D2); skip when proven Grafana state
history + silences suffice.

## 3. Exact per-P disposition (O4)

Disposition vocabulary (stable across draft and final): already-covered
(discovery reached the same conclusion); correction (P is wrong or
underspecified as stated; replaced below); rejected (P must not be built as
stated, with reason); optional enhancement (adopt if budget/roadmap
allows); user decision (utility/Jared must choose; final records options,
not fiat); uncertain (evidence insufficient; validation proposed). The
critic concurred with all six dispositions (no false rejection); this
reviser concurs with evidence notes and the amendments below.

### P1: "Ingest MQTT readings into a time-series database."

Disposition: already-covered in INTENT; CORRECTION on mechanism
(underspecified as one sentence). The direction matches discovery
architecture A and is retained. As stated it omits every consequential
obligation, so it is corrected — not replaced — by the following mandatory
conditions (amended by M1/M4/M5/M11):

- Broker (EMQX, pinned major): MQTT 5 preferred; QoS 1 for readings; stable
  client ids (one per gauge or field gateway); finite expiry (hours, e.g.
  2 h ceiling or utility-tuned; never 0xFFFFFFFF with churning ids);
  bounded offline queue (max_mqueue_len sized per §6 V3); explicit finite
  message_expiry_interval VALUE SET AT DEPLOY (value uncertain until the
  versioned doc row is cited, M1); retained=false for readings (retained
  only for status/last-will); keepalive ~60 s on the gauge-to-broker hop;
  shared subscriptions for ingest replicas. ON EMQX 6.3+: set
  max_session_expiry_interval explicitly finite IN ADDITION to
  session_expiry_interval (default infinity does not clamp MQTT 5
  never-expire requests). ON EMQX 5.x: MQTT 5 cap behavior UNCERTAIN —
  cite the 5.x branch doc at deploy or pin 6.3+ with the explicit cap.
  Long/never-expire sessions stay resident in memory for the whole
  interval — the documented cost of #14482/#18443 — so finite expiry +
  stable ids are load-bearing, and the 6.3+ cap closes the gap the draft
  left open on the recommended path.
- Security + auth (mandatory, M11; was missing): broker authentication/ACL,
  TLS with certificate provisioning/rotation, per-site gateway posture,
  Connect tls.enabled + secrets handling. Unauthenticated/unencrypted MQTT
  for remotely connected utility gauges is deployment-blocking, not an
  enhancement. Cost fits the same single VM + backups; operator-time cost
  noted (§7).
- Normalizer (mandatory): one Redpanda Connect pipeline between broker and
  store: validate schema (schema-versioned contract, §7), coerce units
  (with tolerance), stamp ingest_ts alongside event_ts, quarantine invalid
  rows, batch writes, emit pipeline metrics. MQTT input: urls + topics
  required, qos 1, keepalive 30 s on the Connect-to-broker hop (distinct
  from gauge hop 60 s), connect_timeout 30 s defaults; auto_replay_nacks
  true (backpressure) unless memory forces false. Dedup: name the EXACT
  processor + cache backend + metric at deploy (key gauge+ts+seq), or drop
  the counter claim and assert store exactly-once + mqtt_duplicate metadata
  (M5). clean_session=false resume is a PROPOSED V3-leg check, not a
  settled property (M5).
- Store (mandatory choice D1): QuestDB (WAL, PARTITION BY DAY, designated
  timestamp = sensor event time, explicit ILP precision) where SQL +
  backfill correctness dominate, or VictoriaMetrics single-node
  (-retentionPeriod explicit; default 1 month / minimum 1 day confirmed;
  100y-infinite single-sourced) where regular-cadence metrics + PromQL
  dominate. Payload contract: schema version, gauge_id, event_ts (ISO-8601
  UTC), seq (with reboot/reset rule, §7), value, unit (enum + unknown-unit
  policy, §7), firmware rev. Upsert key (gauge_id, event_ts, seq) MANDATORY
  with explicit full-collision policy (which row wins, tie-break, duplicate
  counters named per store) — bare (gauge, ts) collides on same-timestamp
  readings and is REJECTED (M4). Transport dedup is time-bounded and never
  sufficient alone (principle preserved).
- Alternative retained: NATS JetStream durable transport/buffer (stable
  Nats-Msg-Id = gauge_id + seq with reboot rule; duplicate_window default
  2 min; PubAck duplicate flag observed via a NAMED client/API/field at
  deploy; file storage; ≥100 ms window floor; expected-state headers where
  useful) with independent replay consumers, instead of or in front of MQTT.
  JetStream dedup keys on the id only, never the body: near-term guard
  only; permanent idempotency still lives in the store key. 2.14
  sources-window behavior UNCERTAIN (M9); MQTT adapter UNCERTAIN until
  cited (M9).
- Disagreement retained: none on P1's direction. The correction stands and
  is now executable: the draft's version-conflated expiry cap, unnamed
  dedup counter, bare upsert key, unsettled VM backfill leg, and missing
  security block are all closed or explicitly proof-gated.

### P2: "Alert when the latest reading exceeds one fixed threshold."

Disposition: CORRECTION — rejected as sufficient; replaced by a scoped
rule set. A single fixed threshold on the latest reading fails this brief
on four independent grounds (concurred): (1) late/out-of-order data make
"latest" ambiguous (event-time vs ingest-time authority per query class,
§7); (2) one threshold cannot separate warning / critical / dead-gauge /
sensor-error; (3) no pending period means every blip pages; (4) missing
data (the dominant failure mode on flaky links) never exceeds a threshold,
so dead gauges page nothing. Replacement (Grafana-MANAGED rules only, M2):

- Threshold rules per metric with severity bands (warn/critical), pending
  period (e.g. 5 min) so the condition must hold continuously, evaluation
  interval per rule group ≥ sensor cadence (e.g. 1 min; terminology
  corrected, m1), query windows covering jitter (e.g. 15-min range starting
  5 min ago).
- Dead-man rules per gauge/site: NoData→Alerting after pending, so a silent
  gauge pages. Query windows must cover normal jitter or late data flaps
  NoData. SCOPE NOTE: NoData/Error states exist ONLY for Grafana-managed
  rules; the vmalert leg needs its own per-engine dead-man semantics +
  citation (m7).
- Error handling explicit per rule: evaluation_timeout 30 s, max_attempts 3
  defaults; Error→Alerting for critical paths, with DatasourceError
  instances carrying exact labels alertname / datasource_uid / rulename
  (m2). Notification policies, silences, and mute timings MUST match the
  Datasource* labels (alertname=DatasourceNoData / DatasourceError) IN
  ADDITION to per-rule grouping: Datasource instances are independent and
  existing per-rule policies "may not apply to them" — otherwise dead-man
  pages bypass site/severity grouping (M2).
- Payload design: dead-man pages display −1 in Values ("re-uses the latest
  known set of fields in Values, but will use −1 in place of the measured
  value"). Runbooks, notification templates, and dashboards MUST be
  designed for −1 (display text, unit labels, "no data" rendering) (M2).
- Version behavior (softened, M3): pending-on-NoData/Error VERIFIED on
  current docs at fetch (PR #117024 merged; pre-change fired immediately);
  exact minor-line boundary ("12.4.x") UNCITED — re-validate the pinned
  minor's actual NoData/Error pending behavior at deploy and on EVERY
  Grafana upgrade. V4 measures time-to-page AND payload AND routing on the
  pinned version (M2/M10).
- Notifications grouped by site/severity (not per-reading), with silences /
  mute timings for maintenance; every rule records owner + runbook link.
  Stale-series handling: MissingSeries is a grafana_state_reason ANNOTATION
  (not a label) on stale Normal; stale Alerting/NoData/Error resolve and
  notify (m6).
- Uncertain (user decision D3): exact thresholds/hysteresis per sensor type
  await utility input; the mechanism above is fixed regardless.

### P3: "Missing readings count as zero."

Disposition: REJECTED — dangerous as stated, with replacement. NO part
retained. Counting missing as zero conflates "gauge offline" with "gauge
reads zero." For a water utility, zero can be legitimate (no flow) or a
catastrophic misread (offline reservoir sensor reported as empty/full). It
converts every outage into plausible-looking data, defeats dead-man
detection, and corrupts aggregates. Replacement: missing data is NoData,
never zero. Dead-man rules map NoData→Alerting (Grafana-managed scope);
threshold rules map NoData to Normal or Keep-last ONLY for intentionally
sparse series — never to numeric zero. Stale series (no samples for two
evaluation intervals) resolve with grafana_state_reason=MissingSeries
(annotation) and notify like other resolved alerts. Aggregations use
last_over_time / explicit windows over event time, with gaps shown as gaps.
Display/routing notes from M2 (§3 P2) apply to the replacement. The
zero-vs-offline conflation, dead-man defeat, and aggregate-corruption
grounds are correct and concurred.

### P4: "Clients acknowledge an alert locally then sync."

Disposition: CORRECTION (server-authoritative ack) + USER DECISION (which
server, D2) + OPTIONAL enhancement (offline-tolerant client queue,
display-only). Local-first ack with later sync risks split-brain history:
two operators ack differently offline, a client is lost before sync, or
sync order inverts ack/close — and the audit trail ("who acked what, when")
becomes untrustworthy. This brief's ack history is an audit record, so the
server is authoritative. Correction:

- Ack lifecycle (open→ack→closed/reopen, actor + timestamp per transition)
  is owned server-side and survives restarts.
- Default leg (proof-gated, M7): Grafana Alerting state history with its
  backend EXPLICITLY configured (SQL or Loki) and queried for the ack view;
  silences / mute timings cover maintenance windows. WHETHER state history
  retains actor identity per transition durably and queryably as an audit
  record is UNPROVEN on observed sources (S10/C10 establish backend +
  labels, not an ack-audit schema). V6 MUST demonstrate on the pinned
  Grafana version + chosen backend that fire→ack→resolve→mute yields
  actor+timestamp entries, survives restart, and is queryable for the ack
  view. If that fails or is version-fragile, DEFAULT TO ALERTA for
  lifecycle/history and keep Grafana for charts/rules. "Server-wins with
  the losing intent preserved in history" is a DESIGNED conflict rule, not
  a sourced behavior of either backend: implement and assert it in V6-leg,
  do not assume it.
- Alternative leg (user decision D2): Alerta 9.1 — purpose-built
  consolidation/dedup console with JSON API + web UI + CLI, alert
  lifecycle, timeouts/heartbeats, blackouts, customer views, API keys,
  Basic/OAuth2, Postgres-or-Mongo backend (backend matrix single-sourced,
  cite-before-adopt, m5). Adopt when operators want one canonical ack
  place, audit trail, and blackouts across present + future sources; accept
  a second service + DB and the rule-evaluation split (thresholds still
  evaluated upstream).
- Optional enhancement (only part of P4 retained, display-only): clients may
  queue ack intents offline and submit on reconnect (optimistic UI), but
  display them as "pending sync" until the server confirms; conflicts
  resolve server-wins with the losing intent preserved in history. Never
  the authority model.
- P4's split-brain/audit-trail grounds are correct and concurred; the
  disposition stands with the M7 proof gate on the default leg.

### P5: "Keep data for a year."

Disposition: already-covered in INTENT; CORRECTION on mechanism; USER
DECISION on exact tiers (D4). One-year retention is plausible policy, but
as stated it ignores WHAT is kept (raw vs rollups vs alert/ack history),
WHERE (size/backups), and at WHAT cost. Correction — tiered retention,
sized (amended by M8):

- Raw readings: weeks–months online (utility decides D4), sized per §7
  worked example (gauges × cadence × bytes → disk). QuestDB DAY partitions
  with drop policy (single-sourced, validate at deploy); VictoriaMetrics
  -retentionPeriod EXPLICIT (default 1 month / minimum 1 day confirmed;
  "infinite as 100y" single-sourced from S08, NOT critic-re-observed:
  retained with citation, validated at deploy — neither confirmed nor
  refuted, M8).
- Downsampled rollups (e.g. 5-min / 1-h aggregates): full year online.
- Alert + ack history: year or longer (audit requirement; cheap — small
  rows indexed by alert id + time). State-history backend (or Alerta DB)
  sized and backed up INDEPENDENTLY of metrics; alert history MUST outlive
  metrics retention (asserted in V8).
- Backups: off-box scheduled copies with TESTED restore. VictoriaMetrics
  vmbackup/vmrestore/vmbackupmanager (confirmed [C09]); QuestDB snapshot +
  WAL procedure (single-sourced, validate at deploy, M8). Single-node
  stores are one failure domain; backups are the HA story.
- Cardinality guard: labels/tags limited to gauge_id / site / sensor_type;
  per-reading UUIDs never become labels. Directionally consistent with VM's
  cardinality-limiter / high-cardinality guidance surface (confirmed [C09]);
  exact excerpt not pinned here: retained as stated practice, validated by
  V8 sizing + limiter config at deploy (M8). VM -dedup.minScrapeInterval
  set-to-interval guidance and 5-minute lookback default: single-sourced
  from S08, not critic-re-observed (M8): retained with citation, validated
  at deploy.
- QUESTDB specifics single-sourced (M8): TIMESTAMP microsecond resolution,
  ILP-precision-per-request, DEDUP-UPSERT fast-path interaction — retained
  with citations, proven by V1/V5-legs at deploy.
- User decision D4: exact raw window, rollup cadences, alert-history
  horizon. Regulatory-minimum retention, if any: UNCERTAIN — flagged, not
  assumed (correctly handled; concurred).
- NEW (M8): V8 retention-enforcement + restore drill (age data past each
  tier, assert drops/rollups; snapshot/backup, destroy, restore, assert ack
  history + recent readings queryable). Sizing math is a WORKED EXAMPLE
  for 120 gauges (§7), not a slogan.
- P5's tiering/sizing/backup/cardinality corrections are correct and
  concurred; mechanisms now carry per-row citation status.

### P6: "Validate with a static sample CSV."

Disposition: REJECTED as sole validation; retained ONLY as smoke seed;
CORRECTION with a discriminating suite. A static CSV can seed a dashboard
but cannot exercise a single brief-specific risk: lateness, out-of-order
merge, duplicates, outage buffering, expiry/queue sizing, dead-man timing,
NoData/Error semantics, precision/unit coercion, ack round-trips,
partition-boundary backfill, retention/restore, or version drift. Building
to P6 alone would pass a demo and fail the field. Correction: keep ONE
small CSV as a smoke seed with STATED POSITIVE SCOPE (ingest → chart
renders; §6) and validate with the discriminating suite V1–V8 (§6), each
tied to a killing assertion and, after M10 amendments, executable as
written. The enumerated uncovered risks are accurate and concurred. No
validation claim in this final rests on the CSV.

## 4. Criticism adjudication: every finding with verdict and evidence

Verdict scale: ACCEPT (critic correct; change applied as demanded);
AMEND (critic directionally correct; applied with a material modification
stated here — this is independent judgment, not automatic obedience);
RETAIN-UNCERTAINTY (evidence insufficient; marked uncertain with a
validation proposal). No finding is rejected as false-direction. For each:
verdict, evidence check, change applied (section refs), affected
dependencies.

M1 — EMQX expiry version-conflation + message-expiry value. VERDICT:
ACCEPT. Evidence: C04 directly contradicts the draft's governing cap on the
recommended path (2 h row is 3.x-scoped; MQTT 5 cap is
max_session_expiry_interval default infinity since 6.3.0); C05 confirms the
6.3 boundary and the resident-memory mechanism. The draft's "2 h default
ceiling" is false on MQTT 5 / 6.3+. Message-expiry broker default/cap:
confirmed never-observed. Change: §2.2/§3-P1 pin EMQX major, require the
6.3+ finite cap, mark 5.x MQTT 5 cap uncertain, require explicit
message_expiry_interval with deploy citation + V3 coverage. Dependencies:
P1 broker block, E4 sizing, V3.

M2 — Grafana-managed-only scope + Values −1 + Datasource* routing.
VERDICT: ACCEPT (all three qualifiers). Evidence: C10 verbatim confirms
managed-only scope, −1 substitution, and independent Datasource* routing
warning; S10/C10 agree on core semantics. The draft's vmalert alternative
cannot inherit these semantics. Change: §2.7/§3-P2/P3 scoped to
Grafana-managed rules; −1 runbook/payload design mandatory; Datasource*
policies/silences/mute-timings required; V4 extended to payload + routing.
Dependencies: P2/P3 replacements, notification design, V4.

M3 — #117024 "12.4.x" pin under-cited. VERDICT: AMEND (soften, do not
drop). Evidence: C11 confirms merged intent and pre/post behavior; C10
confirms current docs honor pending; NEITHER stage observed a 12.4.x
milestone/tag/release-note row. Direction confirmed, minor boundary not.
Change: §2.7/§3-P2/E2/V4/V7 replace the asserted pin with "verified on
current docs at fetch; re-validate the pinned minor at deploy and every
upgrade"; V4/V7 test actual pinned behavior. The 12.4.x value may be
exactly right (retained as candidate, not asserted). Dependencies: P2
version note, E2, V4, V7.

M4 — (gauge, ts) collision + VM backfill leg. VERDICT: ACCEPT (both
challenges). Evidence Challenge 1: engineering logic is dispositive
(coarse resolution / corrected retransmit / batch flush / sub-resolution
sampling all produce same-ts collisions; payload already carries seq).
Challenge 2: discovery's honest hedge vs draft's settled "VM import" with
no pinned-version evidence; C09 did not re-observe dedup/import rows.
Change: §2.5/§3-P1 mandate (gauge_id, event_ts, seq) + full-collision
policy; bare (gauge, ts) rejected; VM backfill uncertain until pinned test;
V1 split per store (QuestDB-leg vs VM-leg). Principle
transport-dedup-never-sufficient preserved. Dependencies: P1 key, V1, V2.

M5 — Connect dedup counters + clean_session durability unsourced.
VERDICT: ACCEPT (both claims). Evidence: C06 verifies every cited S06
default yet documents no dedup processor/counter on the mqtt-input page;
clean_session row states only "non-persistent" with no resume semantics.
The normalizer mandate itself is sound; only the two specific claims are
challenged — concurred. Change: §2.3/§3-P1 require exact processor + metric
naming at deploy or drop the counter assertion (V2 asserts store
exactly-once + mqtt_duplicate counts + named JetStream observation);
clean_session=false resume demoted to proposed V3-leg check. Dependencies:
P1 normalizer, V2, V3.

M6 — WAL-mitigates inference + #7297 + write-amp bound. VERDICT: ACCEPT
with one AMENDMENT (downgrade, keep, pre-register). Evidence: C08 verifies
E1 scope (non-WAL) + mechanism + #7278 link; C07 verifies O3 merge,
partitioned+WAL recommendation, write-amp observability, AND "no universal
threshold"; NO observed text states WAL immunity; #7297 has no separate
fetch. Change: §2.4/E1 keep WAL + DAY + current-release + boundary V1 but
downgrade "fix verified / directly shapes" to "mitigation inferred from
fix scope + docs recommendation; V1 must run on the pinned release";
#7297 specific claim DROPPED (retained only as locator-mentions-follow-up);
V1 pre-registers numeric bound + workload + measurement choice. Amendment
vs automatic obedience: WAL+DAY is kept (docs recommendation + fix-scope
inference), not removed — only the verification strength is downgraded.
Dependencies: E1, V1.

M7 — Grafana state-history default for audit-grade ack history
under-evidenced. VERDICT: AMEND (keep disposition + decision framing;
proof-gate the default leg). Evidence: S10/C10 establish backend-must-be-
configured + evaluation/state labels; they do NOT establish an ack-audit
schema with actor identity; "server-wins" is designed, not sourced. C12
confirms Alerta's lifecycle/history surface as the purpose-built
alternative. P4's split-brain rejection + user-decision framing are correct
and kept. Change: §3-P4/V6 require a pinned-version + chosen-backend
demonstration (fire→ack→resolve→mute yields actor+timestamp, survives
restart, queryable) BEFORE Grafana carries audit weight; on failure or
fragility, default to Alerta. D2 stays a user decision. Dependencies: P4
default, V6 per-leg split.

M8 — P5 mechanisms partly uncited + no retention/restore validation.
VERDICT: AMEND (keep disposition; per-row citation status; add V8 + worked
sizing). Evidence with independent judgment: C09 confirms retention flag/
default/min + backup tools + cardinality surface; C09 did NOT re-observe
100y-infinite / dedup-interval / 5 m lookback — BUT S08 DID observe them
(predecessor excerpt). Likewise QuestDB DAY-drop / snapshot+WAL / DEDUP-
UPSERT / TIMESTAMP-µs / ILP-precision and the cardinality guard were
predecessor-observed (S07/S08 excerpts), not never-observed. Automatic
obedience would mark all "uncertain"; independent adjudication marks them
SINGLE-SOURCED (predecessor citation retained, validated at deploy) and
reserves UNCERTAIN for never-observed rows. Regulatory-minimum flagging is
correct (concurred). The V-suite gap (no retention/restore test) is real.
Change: §3-P5 carries per-mechanism status (confirmed / single-sourced /
uncertain); §6 adds V8 (retention enforcement + restore drill); §7 gives a
worked 120-gauge sizing example. Dependencies: P5 mechanisms, V8, sizing.

M9 — NATS 2.14 sources-window unverified; core holds. VERDICT: ACCEPT core
+ RETAIN-UNCERTAINTY on 2.14 + adapter. Evidence: C01/C02/C03 re-verify 2 m
window, Nats-Msg-Id + expected-state headers, 100 ms floor — Architecture B
conditions stand. The 2.14 sources claim traces to a client-library commit
note (S03 locator), not a primary server release/doc excerpt, and was not
observed in the critic window. NATS MQTT adapter: plausible, never
excerpted at either stage. Change: §2.1/Arch B retain all 2 m/stable-id
conditions; 2.14-sources downgraded to uncertain pending primary citation;
V7 pins nats-server minor and asserts deployed stream-config round-trip
(duplicate_window present and effective, including on sources streams)
rather than asserting the historical change; MQTT adapter
cite-before-recommend. Dependencies: Arch B, V7.

M10 — V1–V7 executability gaps. VERDICT: ACCEPT (all seven sub-fixes;
design + honest proposed-only status preserved). Evidence: each gap follows
from its parent finding (M6 write-amp bound; M5 unnamed counter + unnamed
PubAck surface; unquantified 2×-outage; M2 payload/routing omissions +
Recovering edge; missing float tolerance; mixed blackout/mute vocabulary;
missing diff oracle). The suite's discriminating design and honest
"none run" status are correct (concurred). Change: §6 rewrites V1–V7 as
executable assertions (per-store V1 with pre-registered bounds; V2 store +
metadata + named JetStream observation; V3 quantified worst case + named
metrics; V4 timing + payload + routing + Recovering edge; V5 epsilon +
unit-label assertions; per-leg V6; V7 golden-trace oracle with allowed
deltas). Dependencies: all validations.

M11 — Missing security/auth/TLS + payload-contract versioning. VERDICT:
ACCEPT. Evidence: remotely connected gauges + SCADA-adjacent surface with
zero broker auth/ACL/TLS/credential/rotation content in "mandatory"
conditions; C06 verifies Connect carries a full tls block + user/password
that the draft never sets; payload contract lacks version/enum/reset/
authority/quarantine ownership; gauge-hop 60 s vs Connect-hop 30 s
keepalives unreconciled. Unauthenticated/unencrypted MQTT is
deployment-blocking. Change: §7 adds a MANDATORY security + contract-
versioning section (broker auth/ACL, TLS + cert provisioning, Connect
tls.enabled + secrets, schema version, unit enum + unknown policy,
seq-reset rule, event-vs-ingest timestamp authority per query class,
quarantine ownership, keepalive reconciliation). Cost fits the same VM;
operator-time cost noted. Dependencies: P1 conditions, architecture,
budget, validations.

m1 — "evaluation group interval" terminology. VERDICT: ACCEPT. Changed to
Grafana evaluation interval per rule group vs notification grouping (§2.7,
§3-P2).

m2 — DatasourceError label phrasing loose. VERDICT: ACCEPT. Exact labels
alertname / datasource_uid / rulename used in all routing rules (§2.7,
§3-P2, §6-V4).

m3 — E4 "documented cost" phrasing. VERDICT: ACCEPT (confirmed accurate).
Retained; 6.3+ cap interplay noted (M1, §2.2, §5-E4).

m4 — GreptimeDB framing + v1.1.4/EMQX-rule single-source. VERDICT: ACCEPT.
Optional-enhancement framing kept; tag + rule action retained with
pin-at-deploy (§1, §2.6).

m5 — Alerta D2 framing + backend-matrix single-source. VERDICT: ACCEPT.
Decision framing kept; Postgres/Mongo matrix retained with
cite-before-adopt (§1, §2.8, §3-P4).

m6 — MissingSeries + resolve-and-notify. VERDICT: ACCEPT (confirmed).
Kept with exact citation; noted as ANNOTATION not label for routing (§2.7,
§3-P2/P3).

m7 — vmalert for: alternative unfetched. VERDICT: ACCEPT. Retained only as
cite-or-uncertain with per-engine dead-man proof (§1, §2.7, §3-P2).

m8 — Build-order gating on V6/V7 legs. VERDICT: ACCEPT. Step 6 gates
explicitly on per-leg V6 + V7 oracle (§8); step 5 preserves D2.

m9 — Usage/billing null. VERDICT: ACCEPT (confirmed correct). No cloud
billing observed at any stage; self-hosted default matches budget; null
retained (§7).

m10 — O3 absent/inapplicable honesty. VERDICT: ACCEPT (confirmed right
call). Preserved; V7 covers drift (§5).

## 5. Issue / fix / release evidence applied (O3)

E1 QuestDB O3 lag commit across partition boundary (issue #7278 → PR #7285;
#7297 dropped as a specific claim, M6): non-WAL writer + out-of-order
prefix crossing a partition boundary sealed the earlier partition in memory
without persisting _txn; the next lag commit's o3MoveUncommitted reclaimed
the active partition tail and reset maxTimestamp to the durable _txn value
[S07-fix][C08]. PR #7285 tracks lastSealedPartitionMaxTimestamp. Applied as
INFERRED mitigation (downgraded from "verified," M6): WAL tables mandatory
(per docs recommendation "always ingest into a partitioned, WAL-enabled
table"), DAY partitions, current release, and QuestDB-leg V1 straddling a
boundary with random lateness/duplicates. The risky shape (late data near
midnight on DAY tables + lag commit) directly shapes the backfill design;
V1 must run on the pinned release and assert counts, no gaps/dupes on
(gauge, ts, seq), and a pre-registered write-amp bound with its measurement
method.

E2 Grafana pending period for NoData/Error (PR #117024, merged; minor-line
pin softened, M3): pre-change NoData/Error fired immediately on first
evaluation (transient blips paged); post-change they honor the same pending
period as regular alerts
(Normal→Pending(NoData|Error)→fired; pending 0 immediate; Recovering edge
immediate) and notifications send only after pending elapses [S11][C11];
current docs honor pending on all three paths [S10][C10]. Applied: dead-man
rules carry explicit pending values; V4 measures time-to-page AND payload
(−1 Values) AND Datasource* routing on the PINNED version and re-runs on
every Grafana upgrade. Directly shapes P2's replacement. Release boundary:
"verified on current docs at fetch; re-validate the pinned minor" (12.4.x
retained as unasserted candidate).

E3 NATS duplicate-window floor (issue #3056 → v2.8.1): server enforces ≥100
ms for max-age/duplicates window [S03][C03]. Applied: validation scripts
use ≥100 ms windows; production stays in minutes. Shapes test design (V2,
V7 stream-config assertions).

E4 EMQX session-expiry memory cost (issue #14482 → PR #18443, docs change):
sessions stay resident in memory for the whole expiry interval; PR
documents the previously invisible cost ("had to read emqx_channel.erl")
[S05][C05]. "Documented cost" phrasing confirmed accurate (m3). Applied
with M1 interplay: finite expiry + stable client ids + 6.3+ explicit
max_session_expiry_interval cap (or 5.x branch citation); never-expire
forbidden; V3 asserts queue/stream depth under cap with named metrics and
no never-expire session growth. Shapes broker sizing.

Absent / inapplicable (honest, concurred m10): no crash-loss/corruption
chain was found for VictoriaMetrics single-node or Redpanda Connect MQTT
input in the bounded search — reported as ABSENCE OF EVIDENCE, not safety.
GreptimeDB and Alerta: no regression chain chased in this window; V7
(upgrade replay with golden-trace oracle) covers version drift instead. VM
dedup-interval / lookback rows and QuestDB #7297/class specifics noted in
§2 as single-sourced or uncertain rather than asserted.

## 6. Validations: executed vs proposed (O6)

Scope note (O6): this small product brief gets discriminating checks for
ITS risks (lateness, merge, duplicates, buffering, expiry/queues, dead-man
timing + payload + routing, precision/units, ack round-trips, boundary
backfill, retention/restore, version drift) — not unlimited production
guarantees.

Executed (all stages; no runtime, no sandbox witnesses): public
primary-source reads only — official docs pages and GitHub PR/release text
in source-map.json (predecessor: web_search locate + web_fetch read;
critic: web_fetch + local grep; reviser: full local re-read of both
excerpt sets + maps + draft/discovery/critique, no new web fetches). Exact
URLs, versions, access timestamps, and observed operations recorded. No
broker/store/alert code was executed, no packages installed, no private
provider internals touched. NOTHING below is claimed as run except these
reads. The reviser performed no new web discovery: every criticism was
adjudicable on own-arm evidence within scope/time, so no extra broad
discovery was opened (per assignment).

Proposed (discriminating; each kills a specific bug class; NONE run; now
executable as written after M10 amendments):

V1 Boundary backfill (per-store split, M4/M6/M10). QuestDB-leg: 24 h
synthetic readings straddling a DAY boundary with random lateness/
duplicates; assert row counts, no gaps/dupes on (gauge, ts, seq),
reconciliation vs source ledger, and write-amp under a PRE-REGISTERED bound
(e.g. "p99 ≤ B on workload W") with STATED measurement (tables() p99 over
window W vs Prometheus delta ratio over 5 min). VM-leg: same source ledger
pushed via the PINNED path (live push vs vmctl/native import — path itself
under test until proven); assert counts, no gaps/dupes on the VM-leg key
mapping, and the documented lookback/dedup behavior on the pinned version.
Kills O3-boundary + upsert-key + backfill-path bugs (E1, M4).

V2 Duplicate storm (M5/M10): replay one MQTT batch 3× and one JetStream
batch with stable ids (≥100 ms windows, E3); assert EXACTLY-ONCE in store
on (gauge, ts, seq), mqtt_duplicate metadata counts incremented (Connect
metadata, confirmed), and PubAck-duplicate observed via a NAMED
client/API/field recorded at deploy (no unnamed "Connect dedup counter"
assertion unless the exact processor + metric was configured and named).
Kills id-key mistakes.

V3 Outage buffer (quantified, M1/M5/M10): define WORST CASE numerically at
deploy (outage_seconds × per-gauge rate × 120 gauges, worked example §7;
test at 2× worst case). Halt ingest for 2× worst case, reconnect; assert
zero loss (ledger reconciliation), queue/stream depth stayed under cap
(max_mqueue_len / stream caps with NAMED metrics), no never-expire session
growth (session count + resident-memory metric named), Connect
auto_replay_nacks behavior as configured, and (as a separate V3-leg)
Connect restart mid-outage with clean_session=false IF that path is
claimed — else document clean_session=true + upstream buffering as the
durability story. Kills expiry/queue mis-sizing (E4, M1).

V4 Dead-man timing + payload + routing (M2/M3/M10): stop one gauge; on the
PINNED Grafana version measure time-to-page vs pending + evaluation
interval + query window; assert notification PAYLOAD (Values −1 rendered
per runbook design, unit labels, "no data" display) and ROUTING (policies /
silences / mute timings matching alertname=DatasourceNoData fire and group
as designed; original-alert policies alone are insufficient); assert the
Recovering→Alerting immediate-fire edge behaves as documented on the pinned
version. Repeat timing + payload + routing after EVERY Grafana upgrade.
Kills NoData/pending/payload/routing mis-tuning (E2). P6's CSV cannot run
any of this — hence P6's rejection. Grafana-managed scope only; vmalert leg
(if adopted) gets its own per-engine V4-leg + citation.

V5 Precision / unit trap (M10): ingest identical readings as ns/us/ms/s
and °C/°F mixed; assert stored equality after coercion WITHIN EPSILON
(e.g. |stored − expected| ≤ 1e-6 in canonical units; float °C/°F
round-trips are not exact) and dashboard unit LABELS correct per the §7
unit enum (canonical unit displayed, unknown units quarantined per policy).
Kills silent scale bugs.

V6 Ack-history round trip (per-leg, M7/M10): fire, ack, resolve, then
maintenance-suppress one alert — VOCABULARY PER LEG: Alerta-leg uses
blackout; Grafana-leg uses mute timings/silences (never "blackout" for
Grafana). Grafana-leg asserts on the pinned version + chosen backend (SQL
or Loki, named): actor + timestamp entries for EVERY transition, survival
across restart, queryability for the ack view, and the designed
server-wins conflict rule with losing intent preserved. Alerta-leg asserts
the same on the Alerta + backend matrix choice (backend cited
before-adopt, m5). Failure or version-fragility on the Grafana-leg moves
the DEFAULT to Alerta (M7). Kills "history configured nowhere" gaps (P4).

V7 Upgrade replay (oracle, M3/M9/M10): re-run V1–V4 on each pinned minor
upgrade (EMQX, NATS, QuestDB/VM, Grafana, Connect); compare against
GOLDEN-TRACE outputs from the pinned baseline with PRE-REGISTERED allowed
deltas (numeric tolerances + categorical equality lists); any out-of-tolerance
diff blocks the upgrade until adjudicated. NATS leg asserts the deployed
stream config round-trips (duplicate_window present and effective,
including on sources streams) on the PINNED nats-server minor rather than
asserting the historical 2.14 change (M9). Grafana leg re-validates actual
NoData/Error pending behavior (M3). Kills version drift.

V8 Retention enforcement + restore drill (NEW, M8): age synthetic data
past EACH tier boundary; assert raw drops happened, rollups cover the full
year, alert/ack history OUTLIVES metrics retention and stays queryable;
snapshot/backup, destroy the store, restore (vmbackup/vmrestore path or
QuestDB snapshot+WAL path as deployed), assert recent readings + full ack
history queryable with row-count reconciliation. Assert the §7 sizing model
against observed disk use within a stated tolerance. Kills
tier-misconfiguration + untested-backup gaps (P5).

CSV smoke (retained from P6, NON-discriminating, positive scope stated):
ingest one static CSV, assert charts render. A smoke seed proving
ingest→chart plumbing, NEVER a validation claim. All brief-specific risk
coverage comes from V1–V8.

## 7. Retained architecture, security, sizing, recovery, expansion, budget

Recommended default (architecture A, amended): EMQX (pinned major; MQTT 5,
QoS 1, finite expiry + 6.3+ explicit MQTT 5 cap, stable ids, bounded
queues, auth/ACL + TLS) → Redpanda Connect (validate/coerce/stamp/
quarantine/batch + named metrics; tls.enabled + secrets) → QuestDB or
VictoriaMetrics ((gauge, ts, seq) key + full-collision policy, tiered
retention, backups) → Grafana-managed rules (threshold + dead-man + error,
pending, Datasource* routing, −1-aware payloads, grouped notifications,
configured + PROVEN state history or Alerta). Alternatives B/C/GreptimeDB/
vmalert retained with §1 conditions.

Security + contract versioning (MANDATORY, M11 — was the draft's
deployment-blocking omission): broker authentication + topic ACLs; TLS
everywhere gauges/gateways/Connect talk to the broker (cert provisioning +
rotation runbook); Connect tls.enabled (never skip_cert_verify in
production) + user/password or client certs via a secrets mechanism (never
YAML literals); per-site gateway security posture (buffer + TLS + least-
privilege credentials). Payload contract v1: schema_version (mandatory,
monotonic); gauge_id; event_ts (ISO-8601 UTC); seq (per-gauge monotonic;
SEQ-RESET RULE: on gauge reboot/seq reset, the stable-id / upsert-key
construction MUST remain unique — e.g. seq scoped by a boot/generation id
or content-hash fallback — else JetStream dedup and (gauge, ts, seq) keys
collide across reboots); value; unit (closed ENUM, e.g. m/L/s/°C/bar —
canonical list at deploy; UNKNOWN-UNIT POLICY: quarantine + alert, never
silent coerce); fw rev. TIMESTAMP AUTHORITY: threshold/dead-man query
windows evaluate over EVENT time (correctness for late data); operational /
freshness views may use INGEST time; every rule documents which it uses.
Quarantine thresholds + ownership (who triages quarantined rows, SLA).
Keepalive reconciliation: ~60 s governs the GAUGE-to-broker hop; 30 s
(Connect default) governs the CONNECT-to-broker hop; both recorded per hop,
never one global "keepalive."

Worked sizing example for 120 gauges (M8 — numbers are a deploy-tuned
template, not a promise): assume cadence 1 reading/min/gauge, JSON payload
~200 bytes on the wire, stored row ~100 bytes after coercion. Ingest: 120
rows/min = 2 rows/s average; wire ≈ 24 KB/min (≈ 34 MB/day); stored ≈
17 MB/day before indexes/replication. 90-day raw window ≈ 1.6 GB + indexes
(2–3× → ≈ 5 GB). Worst-case outage 4 h: buffered rows = 120 × 240 = 28,800
rows (≈ 6 MB wire); 2× test outage 8 h ≈ 57,600 rows. Queue check: worst-
case rows per session vs max_mqueue_len 1000 — a single session per gauge
(120 sessions) holds 240 rows each (fits); a single gateway session for all
120 gauges needs 28,800 (EXCEEDS 1000 → must raise max_mqueue_len or shard
sessions — this is the V3 sizing assertion). JetStream leg: same row counts
vs stream MaxBytes/MaxMsgs + retention/TTL. Rollups (5-min/1-h) + alert/ack
history: small (KB–MB/year) but backed up independently. Utility tunes
cadence/payload/retention at D4; V8 asserts the model within tolerance.

Outage recovery (retained, quantified hooks): broker/JetStream buffers
minutes–hours (queues/streams sized for 2× worst-case outage per V3 math);
Connect replays with backpressure (auto_replay_nacks as configured);
store backfill accepts far-late rows (QuestDB O3 merge / VM pinned import
path once proven); alerts separate "gauge offline" (dead-man,
DatasourceNoData-routed, −1-aware) from "value bad" (threshold);
reconnect storms absorbed by batch writes + grouped notifications, never
per-reading pages.

Expansion (retained): 120→500+ gauges by adding broker nodes or JetStream
replicas, shared-subscription ingest replicas, retention/partition growth,
label discipline. Multi-site adds per-site gateways (buffer + TLS +
auth) and per-site labels; no architecture change. Logs/traces later favor
GreptimeDB or separate Loki — never blobs in the metrics store.

Budget (retained, m9): all core pieces run as OSS single
binaries/containers on one modest VM (2–4 vCPU, 8–16 GB RAM, 200–500 GB
disk) plus off-box backups; cost drivers are retention disk, backup
storage, and operator time (including the M11 security operation) — not
licenses. Usage/billing for cloud alternatives UNOBSERVED (null) at all
stages; self-hosted default matches the brief.

Triage-not-control (retained hard constraint): alerts advise operators
only. No actuation interlock, no automatic valve/pump control, no safety
claim is planned or implied. Runbooks, severities, and ack SLAs reflect
operational triage. Nothing in this final authorizes control behavior.

## 8. Optional capabilities, user decisions, uncertainty, disagreement (O5)

Optional capabilities (adopt if roadmap/budget allow): Alerta ack server
(§3 P4); GreptimeDB log/trace growth path (§1); per-site TLS gateways with
edge buffering (note: gateway TLS is mandatory where gateways exist — the
optional part is adding gateway sites, M11); downsampled public-status
page; ntfy/SMS escalation beyond email/webhook (operator preference);
expected-state-header concurrency where append races matter (B-leg).

User decisions required (utility/Jared; final does not fiat them): D1
Store: QuestDB (SQL + backfill) vs VictoriaMetrics (PromQL + regular
cadence) vs GreptimeDB (dual-query future). Default A with either QuestDB
or VM; §2.4/§2.5 conditions + per-leg V1/V8 hold regardless; VM backfill
path proven by VM-leg before it carries backfill weight (M4). D2 Ack
server: Grafana state history vs Alerta; Grafana-leg proof-gated by V6
(M7). D3 Thresholds/hysteresis/severities per sensor type + ack SLAs. D4
Retention tiers: raw window, rollup cadences, alert-history horizon,
regulatory minimum if any. D5 Notification channels + on-call rotation vs
business-hours paging (with Datasource* policies in both options, M2). D6
Cloud-vs-self-host for any single component (default all self-hosted; any
cloud leg re-opens usage/billing observation, currently null).

Uncertainty retained (each maps to a decision or a validation; none blocks
this final): gauge cadence/payload/network (assumed minutes, JSON over
MQTT — confirm at deploy; sizing template §7 tunes from it); utility
retention/regulatory policy (D4); operator count and ack SLA (D3/D5);
Alerta appetite (D2); GreptimeDB maturity at deploy time; per-sensor valid
ranges and units (D3 + §7 enum); EMQX 5.x MQTT 5 cap behavior (cite 5.x
branch or pin 6.3+, M1); message_expiry broker default/cap (set + cite +
V3, M1); exact #117024 minor boundary (re-validate pinned, M3); VM
backfill path until VM-leg proves it (M4); Connect dedup metric until
named (M5); clean_session=false resume until V3-leg proves it (M5); WAL
immunity beyond inference (V1 on pinned release, M6); #7297 specifics
(dropped, M6); Grafana state-history audit schema until V6 proves it (M7);
single-sourced rows (§2.5/§2.6/§3-P5: 100y, dedup-interval, 5 m lookback,
DAY-drop, snapshot+WAL, DEDUP-UPSERT, TIMESTAMP-µs, ILP precision,
cardinality-exact-excerpt, backend matrix, standalone tag, EMQX-rule
action) until deploy-validated (M8/m4/m5); NATS 2.14 sources-window primary
citation (M9); NATS MQTT adapter page (M9); vmalert for: semantics (m7).
No uncertainty is hidden inside an asserted mechanism.

Disagreement retained: none on any P disposition direction (draft, critic,
and reviser concur). The live disagreements the critique surfaced were all
strength-of-claim disputes (version pins, key shape, counter existence,
immunity inference, default-leg proof, citation completeness, validation
executability, security completeness) — each adjudicated in §4 with the
correction or proof gate applied in §§2/3/6/7. Later stages may correct
this final with evidence; no step claims safety-control behavior.

## 9. Build order (small, verifiable steps)

1. Broker + payload contract v1 + stable ids + finite expiry + 6.3+ MQTT 5
   cap (or 5.x citation) + auth/ACL + TLS + cert runbook (§7; P1/M1/M11).
2. Connect normalizer + quarantine topic/table + named metrics + tls.enabled
   + secrets; name dedup processor/metric or drop the counter claim (§2.3;
   P1/M5/M11).
3. Store + (gauge, ts, seq) key + full-collision policy + retention tiers +
   backups (§2.4/§2.5; P1/P5/M4/M8).
4. Grafana-managed dashboards + threshold/dead-man/error rules + pending +
   Datasource* routing + −1-aware payloads + grouped routing (§2.7;
   P2/P3/M2/M3).
5. Ack history (state-history backend NAMED, or Alerta + backend NAMED) +
   per-leg V6 round trip with restart + server-wins proof (§3-P4; M7).
6. V1–V5 suite on synthetic load (per-store V1, quantified V3, payload/
   routing V4, epsilon V5), THEN per-leg V6 + retention/restore V8 gates,
   then pilot gauges, then all 120 (m8: V6/V8 explicitly gate rollout).
7. V7 upgrade-replay cadence (golden-trace oracle, allowed deltas) +
   runbooks (with −1/Datasource*/seq-reset/quarantine sections) + on-call
   handoff.

Every step re-checks its section of this final against the pinned versions
deployed. Later stages may correct this final with evidence. No step plans
or implies safety-control behavior.
