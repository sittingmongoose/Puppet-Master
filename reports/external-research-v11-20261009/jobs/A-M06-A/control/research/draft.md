# S06 device-alerts — draft plan (post-reveal, complete deliverable)

Case S06 device-alerts; method M06 v1 evidence-first-challenge (control arm,
full-discovery). Brief: small water-utility sensor alert dashboard for 120
remotely connected gauges; data arrive late, out of order, sometimes
duplicate; operators need understandable alerts + acknowledgement history;
operational triage, not automated safety control; modest self-hosted budget.
Discovery was frozen before reveal (plan-reveal.json: revealed_at
2026-10-09T19:02:59.740819+00:00, discovery 27238 bytes sha256
4f156861…; plan sha256 323cdef9…). This draft compares every exact P clause,
retains discovery findings, and is a complete self-contained planning
deliverable for this scope; later stages may correct it. Source citations
[S01..S12] resolve in source-map.json; prose below stands alone (IDs are
provenance, not substitutes).

Original constraints retained: 120 gauges; late/out-of-order/duplicate
tolerated; understandable alerts; ack history; triage-not-control (no
actuation interlocks are planned — alerts advise operators, never drive
valves/pumps directly); self-hosted; modest budget (one small VM +
backups); investigate products, transport/storage/alert mechanisms, version
behavior, outage recovery, expansion.

## 1. Exact per-P disposition (O4)

Disposition vocabulary: already-covered (discovery reached the same
conclusion), correction (P is wrong or underspecified as stated; replaced
below), rejected (P must not be built as stated, with reason), optional
enhancement (adopt if budget/roadmap allows), user decision (Jared/utility
must choose; draft records options, not a fiat), uncertain (evidence
insufficient; validation proposed).

### P1: "Ingest MQTT readings into a time-series database."
Disposition: already-covered in intent; correction on mechanism (underspecified).
The direction is right and matches discovery architecture A: gauges publish
MQTT, a broker receives, a time-series store keeps readings. As stated it
omits every consequential obligation, so it is corrected — not replaced —
by the following mandatory conditions:
- Broker: self-hosted EMQX 5.x (MQTT 5 preferred) with QoS 1 for readings,
  stable client ids (one per gauge or field gateway), finite
  session_expiry_interval (hours, e.g. 2 h default ceiling; never
  0xFFFFFFFF given churning ids), bounded offline queue (max_mqueue_len
  sized to worst-case outage × rate), finite message_expiry_interval,
  retained=false for readings (retained only for status/last-will),
  keepalive ~60 s [S04][S05]. Long/never-expire sessions stay resident in
  memory for the whole interval — the documented cost of #14482/#18443 —
  so expiry is finite and client ids stable [S05].
- Normalizer (mandatory, missing from P1): one Redpanda Connect pipeline
  between broker and store that validates schema, coerces units, stamps
  ingest_ts alongside event_ts, quarantines invalid rows, batches writes,
  and exposes dedup counters [S06]. MQTT input: urls + topics required,
  qos 1, keepalive 30 s, connect_timeout 30 s defaults; auto_replay_nacks
  true (backpressure) unless memory forces false [S06].
- Store (mandatory choice, missing from P1): QuestDB (WAL, PARTITION BY
  DAY, designated timestamp = sensor event time, explicit ILP precision)
  where SQL + backfill correctness dominate, or VictoriaMetrics
  single-node (-retentionPeriod explicit, dedup + lookback tuned) where
  regular-cadence metrics + PromQL dominate [S07][S08]. Payload contract:
  gauge_id, event_ts (ISO-8601 UTC), seq, value, unit, fw rev. Upsert key
  (gauge, ts) mandatory — transport dedup is time-bounded and never
  sufficient alone.
- Alternative retained: NATS JetStream as the durable transport/buffer
  (stable Nats-Msg-Id = gauge_id + seq; duplicate_window default 2 min;
  PubAck.duplicate observed; file storage; ≥100 ms window floor) with
  independent replay consumers, instead of or in front of MQTT [S01][S02]
  [S03]. JetStream dedup keys on the id only, never the body, and is a
  near-term guard — permanent idempotency still lives in the store key.
Disagreement retained: none on P1's direction; the correction is that
"P1 as one sentence" will be misbuilt without the broker/normalizer/store
conditions above.

### P2: "Alert when the latest reading exceeds one fixed threshold."
Disposition: correction — rejected as sufficient; replaced by a rule set.
A single fixed threshold on the latest reading fails this brief on four
independent grounds: (1) late/out-of-order data make "latest" ambiguous
(event-time vs ingest-time); (2) one threshold cannot separate warning /
critical / dead-gauge / sensor-error; (3) no pending period means every
blip pages; (4) missing data (the dominant failure mode on flaky links)
never exceeds a threshold, so dead gauges page nothing. Replacement:
- Threshold rules per metric with severity bands (warn/critical), pending
  period (e.g. 5 m) so the condition must hold continuously, evaluation
  group interval ≥ sensor cadence (e.g. 1 m), query windows covering
  jitter (e.g. 15 m range starting 5 m ago) [S10].
- Dead-man rules per gauge/site: NoData→Alerting after pending, so a
  silent gauge pages [S10]. Query windows must cover normal jitter or
  late data flaps NoData.
- Error handling explicit per rule: evaluation_timeout 30 s,
  max_attempts 3 defaults; Error→Alerting for critical paths, with
  DatasourceError instances labeled by rule/data-source [S10].
- Version behavior pinned: Grafana 12.4.x honors pending on NoData/Error
  (PR #117024: Normal→Pending(NoData|Error)→fired) where older versions
  fired immediately — dead-man timing must be re-validated on every
  Grafana upgrade [S11].
- Notifications grouped by site/severity (not per-reading), with silences
  for maintenance; every rule records owner + runbook link.
Uncertain: exact thresholds/hysteresis per sensor type await utility
input (user decision); the mechanism above is fixed regardless.

### P3: "Missing readings count as zero."
Disposition: rejected — dangerous as stated, with replacement.
Counting missing as zero conflates "gauge offline" with "gauge reads
zero." For a water utility, zero can be a legitimate value (no flow) or a
catastrophic misread (offline reservoir sensor reported as empty/full).
It also silently converts every outage into plausible-looking data,
defeating dead-man detection and corrupting aggregates. Replacement (from
discovery §2.7): missing data is NoData, never zero. Dead-man rules map
NoData→Alerting; threshold rules map NoData to Normal or Keep-last only
for intentionally sparse series — never to a numeric zero [S10]. Stale
series (no samples for two evaluation intervals) resolve with
grafana_state_reason=MissingSeries and notify like other resolved alerts
[S10]. Aggregations use last_over_time / explicit windows over event time,
with gaps shown as gaps. No part of P3 is retained.

### P4: "Clients acknowledge an alert locally then sync."
Disposition: correction (server-authored ack) + user decision (which
server) + optional enhancement (offline-tolerant client queue).
Local-first ack with later sync risks split-brain acknowledgement history:
two operators ack differently offline, a client is lost before sync, or
sync order inverts ack/close — and the audit trail ("who acked what,
when") becomes untrustworthy. This brief's ack history is an audit
record, so the server is authoritative. Correction:
- Ack lifecycle (open→ack→closed/reopen, actor + timestamp per
  transition) is owned server-side and survives restarts.
- Default server: Grafana Alerting state history with its backend
  explicitly configured (SQL or Loki) and queried for the ack view [S10].
  Silences/mute timings cover maintenance windows.
- Alternative server (user decision): Alerta 9.1 — purpose-built
  consolidation/dedup console with JSON API + web UI + CLI, alert
  lifecycle, timeouts/heartbeats, blackouts, customer views, Postgres or
  Mongo backend [S12]. Adopt when operators want one canonical ack place,
  audit trail, and blackouts across present + future sources; accept the
  cost of a second service + DB and the rule-evaluation split (thresholds
  still evaluated upstream in Grafana/vmalert/Connect).
- Optional enhancement: clients may queue ack intents offline and submit
  on reconnect (optimistic UI), but display them as "pending sync" until
  the server confirms; conflicts resolve server-wins with the losing
  intent preserved in history. This is the only part of P4 retained, and
  only as explicit UX, never as the authority model.

### P5: "Keep data for a year."
Disposition: already-covered in intent; correction on mechanism; user
decision on exact tiers.
One-year retention is a plausible policy, but as stated it ignores what
is kept (raw readings vs downsampled rollups vs alert/ack history), where
(size/backups), and at what cost. Correction — tiered retention, sized:
- Raw readings: weeks–months online (utility decides), sized to
  gauges × cadence × bytes; QuestDB DAY partitions with drop policy, or
  VictoriaMetrics -retentionPeriod (explicit; "infinite" expressed as a
  large value such as 100y, never unset) [S07][S08].
- Downsampled rollups (e.g. 5-min/1-h aggregates): full year online.
- Alert + ack history: year or longer (audit requirement; cheap — small
  rows, indexed by alert id + time). State-history backend (or Alerta DB)
  sized and backed up independently of metrics [S10][S12].
- Backups: off-box scheduled copies (VictoriaMetrics vmbackup/vmrestore,
  or QuestDB snapshot + WAL) with tested restore; single-node stores are
  one failure domain and backups are the HA story [S08].
- Cardinality guard: labels/tags limited to gauge_id/site/sensor_type;
  per-reading UUIDs never become labels (the classic cost/footgun in both
  VM and GreptimeDB) [S08][S09].
User decision: exact raw window and rollup cadences (utility policy +
  disk budget). Uncertain until the utility answers: regulatory minimum
  retention, if any — flagged, not assumed.

### P6: "Validate with a static sample CSV."
Disposition: rejected as sole validation; retained only as smoke seed;
correction with a discriminating suite.
A static CSV can seed a dashboard but cannot exercise a single
brief-specific risk: lateness, out-of-order merge, duplicates, outage
buffering, expiry/queue sizing, dead-man timing, NoData/Error semantics,
precision/unit coercion, ack round-trips, partition-boundary backfill, or
version drift. Building to P6 alone would pass a demo and fail the field.
Correction: keep one small CSV as a smoke seed (ingest → chart renders),
and validate with the discriminating suite in §4 (V1–V7), each tied to a
killing assertion. No validation claim in this draft rests on the CSV.

## 2. Retained architecture (conditions + alternatives)

Recommended default (architecture A): EMQX (MQTT 5, QoS 1, finite
expiry, stable ids) → Redpanda Connect (validate/coerce/stamp/quarantine/
batch) → QuestDB or VictoriaMetrics (upsert key (gauge, ts), tiered
retention, backups) → Grafana (dashboards + unified alerting with
threshold + dead-man + error rules, grouped notifications, configured
state history). All OSS single binaries/containers on one modest VM
(2–4 vCPU, 8–16 GB RAM, 200–500 GB disk) plus off-box backups; cost
drivers are retention disk, backup storage, operator time — not licenses.
Usage/billing unobserved for cloud alternatives (null).

Alternatives retained with conditions:
- Architecture B (JetStream transport): adopt when outage buffering and
  replay dominate. Stable Nats-Msg-Id (gauge_id + seq), file streams,
  2-minute-class duplicate window as near-term guard, store upsert key as
  permanent backstop; NATS MQTT adapter if gauges speak MQTT only
  [S01][S02][S03].
- Architecture C (Alerta ack server): adopt when ack-history/blackout UX
  dominates; keep Grafana for charts, Alerta for lifecycle/history
  [S12]. User decision.
- GreptimeDB variant: adopt when the roadmap explicitly includes logs/
  traces or PromQL+SQL dual queries; MQTT arrives via broker+bridge
  (EMQX rule or Connect), tag cardinality disciplined, release pinned
  (docs 1.2 / tag v1.1.4 observed) [S09]. Optional enhancement, not
  default — younger ecosystem than QuestDB/VictoriaMetrics.
- vmalert + Alertmanager routing as an alternative to Grafana-managed
  rules where Prometheus-rule idiom (for:, groups) is preferred; same
  pending/dead-man obligations apply [S08][S10].

Outage recovery (retained): broker/JetStream buffers minutes–hours (queues
and streams sized for 2× worst-case outage); Connect replays with
backpressure; store backfill accepts far-late rows (QuestDB O3 merge /
VM import); alerts separate "gauge offline" (dead-man) from "value bad"
(threshold); reconnect storms absorbed by batch writes + grouped
notifications, never per-reading pages.

Expansion (retained): 120→500+ gauges by adding broker nodes or JetStream
replicas, shared-subscription ingest replicas, retention/partition growth,
label discipline. Multi-site adds per-site gateways (buffer + TLS) and
per-site labels; no architecture change. Logs/traces later favor
GreptimeDB or separate Loki — never blobs in the metrics store.

Triage-not-control (retained constraint): alerts advise operators only.
No actuation interlock, no automatic valve/pump control, no safety claim
is planned or implied. Runbooks, severities, and ack SLAs reflect
operational triage.

## 3. Issue/fix/release evidence applied (O3)

E1 QuestDB O3 lag commit across partition boundary (issue #7278 → PR
#7285, follow-up #7297): non-WAL writer + out-of-order prefix crossing a
partition boundary mis-recorded maxTimestamp via o3MoveUncommitted /
resetToLastPartition [S07-fix]. Applied: WAL tables mandatory, DAY
partitions, current release, and validation V1 straddles a boundary with
random lateness/duplicates. Directly shapes the backfill design.

E2 Grafana pending period for NoData/Error (PR #117024, 12.4.x):
NoData/Error now honor pending (Normal→Pending(NoData|Error)→fired)
instead of firing immediately [S11]. Applied: dead-man rules carry
explicit pending values; V4 measures time-to-page on the pinned version
and re-runs on every Grafana upgrade. Directly shapes P2's replacement.

E3 NATS duplicate-window floor (issue #3056 → v2.8.1): server enforces
≥100 ms for max-age/duplicates window [S03]. Applied: validation scripts
use ≥100 ms windows; production stays in minutes. Shapes test design.

E4 EMQX session-expiry memory cost (issue #14482 → PR #18443): sessions
stay resident in memory for the whole expiry interval [S05]. Applied:
finite expiry + stable client ids in P1's conditions; never-expire
forbidden. Shapes broker sizing.

Absent/inapplicable (honest): no crash-loss/corruption chain was found
for VictoriaMetrics single-node or Redpanda Connect MQTT input in the
bounded search — reported as absence of evidence, not safety. GreptimeDB
and Alerta: no regression chain chased in this window; V7 (upgrade
replay) covers version drift instead.

## 4. Validations: executed vs proposed (O6)

Executed (pre- and post-reveal; no runtime, no sandbox witnesses):
public primary-source reads only — official docs and GitHub PR/release
text in source-map.json (web_search locate + web_fetch read; exact URLs,
versions, access timestamps recorded). No broker/store/alert code was
executed, no packages installed, no private provider internals touched.
Nothing below is claimed as run except these reads.

Proposed (discriminating; each kills a specific bug class; none run):
V1 Boundary backfill: 24 h synthetic readings straddling a DAY boundary,
random lateness/duplicates; assert counts, no gaps/dupes on (gauge, ts),
write-amp p99 bounded (QuestDB tables()/Prometheus deltas) [S07].
Kills O3-boundary + upsert-key bugs (E1).
V2 Duplicate storm: replay one MQTT batch 3× and one JetStream batch with
stable ids; assert exactly-once in store, PubAck.duplicate observed,
Connect dedup counters increment [S01][S06]. Kills id-key mistakes.
V3 Outage buffer: halt ingest for 2× worst-case outage, reconnect; assert
zero loss, queue/stream depth under cap, no never-expire session growth
[S04][S05]. Kills expiry/queue mis-sizing (E4).
V4 Dead-man timing: stop one gauge; measure time-to-page vs
pending + interval + query window on the pinned Grafana version; repeat
after every Grafana upgrade [S10][S11]. Kills NoData/pending mis-tuning
(E2). P6's CSV cannot run this — hence P6's rejection.
V5 Precision/unit trap: ingest identical readings as ns/us/ms/s and
°C/°F mixed; assert stored equality after coercion, dashboard units
correct [S06][S07]. Kills silent scale bugs.
V6 Ack-history round trip: fire, ack, resolve, blackout one alert; assert
actor + timestamp entries survive restart and are queryable [S10][S12].
Kills "history configured nowhere" gaps (P4).
V7 Upgrade replay: re-run V1–V4 on each pinned minor upgrade (EMQX, NATS,
QuestDB/VM, Grafana, Connect); diff behavior [S03][S11]. Kills version
drift, including the 2.14 sources-window change [S03].
CSV smoke (retained from P6, non-discriminating): ingest one static CSV,
assert charts render. A smoke seed, never a validation claim.

## 5. Optional capabilities, user decisions, uncertainty

Optional capabilities (adopt if roadmap/budget allow): Alerta ack server
(§1 P4); GreptimeDB log/trace growth path (§2); per-site TLS gateways
with edge buffering; downsampled public-status page; ntfy/SMS escalation
beyond email/webhook (operator preference).

User decisions required (utility/Jared; draft does not fiat them):
D1 Store choice: QuestDB (SQL + backfill) vs VictoriaMetrics (PromQL +
regular cadence) vs GreptimeDB (dual-query future). Draft default: A with
either QuestDB or VM; conditions above hold regardless.
D2 Ack server: Grafana state history vs Alerta.
D3 Thresholds/hysteresis/severities per sensor type + ack SLAs.
D4 Retention tiers: raw window, rollup cadences, alert-history horizon,
regulatory minimum if any.
D5 Notification channels + on-call rotation vs business-hours paging.
D6 Cloud-vs-self-host for any single component (default all self-hosted).

Uncertainty retained: gauge cadence/payload/network (assumed minutes,
JSON over MQTT — confirm); utility retention/regulatory policy; operator
count and ack SLA; Alerta appetite; GreptimeDB maturity at deploy time;
per-sensor valid ranges and units. Each maps to a decision above or a
validation in §4; none blocks this draft.

## 6. Build order (small, verifiable steps)

1. Broker + payload contract + stable ids + finite expiry (P1 conditions).
2. Connect normalizer + quarantine topic + counters.
3. Store + upsert key + retention tiers + backups.
4. Grafana dashboards + threshold/dead-man/error rules + grouped routing.
5. Ack history (state-history backend, or Alerta) + V6 round trip.
6. V1–V5 suite on synthetic load, then pilot gauges, then all 120.
7. V7 upgrade replay cadence + runbooks + on-call handoff.

No step claims safety-control behavior. Every step re-checks its section
of this draft; later stages may correct the draft with evidence.
