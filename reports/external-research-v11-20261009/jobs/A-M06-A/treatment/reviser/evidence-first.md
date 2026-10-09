# Reviser evidence-first (M06 treatment) — draft NOT opened

Block A-M06-A, case S06 device-alerts. Written 2026-10-09T19:22Z from brief.md + independently
chosen public primary sources R-EF-01..09 only. No draft, discovery, revealed-plan, critique,
or source-root material was opened before this file was saved.

## 1. Brief facts (from brief.md verbatim scope)

- Product: small water-utility sensor alert dashboard for 120 remotely connected gauges.
- Data pathologies: late, out-of-order, sometimes duplicate arrivals.
- Operator needs: understandable alerts + acknowledgement history.
- Explicit non-goal: operational triage, NOT automated safety control.
- Investigation axes: products, transport/storage/alert mechanisms, version behavior,
  outage recovery, future expansion, modest self-hosted budget.
- Obligations O1-O6: (O1) unfamiliar-tool discovery beyond thin plan; (O2) primary-source
  behavior/defaults/units/limits; (O3) ≥1 issue/fix/regression/release chain or explicit
  absent/inapplicable; (O4) compare every exact P clause post-reveal with disposition
  taxonomy; (O5) one self-contained final preserving alternatives/conditions/uncertainty,
  no ID-instead-of-text; (O6) discriminating validations, executed-vs-proposed separated,
  no-pretence about unrunnable checks, scope-limited guarantees.

## 2. Independently derived mechanism facts

### 2.1 Transport: MQTT (Mosquitto) vs log-backed NATS JetStream
- Mosquitto out of the box is memory-only (`persistence false` default). Durability across
  restarts requires enabling persistence + location, with saves on close, every
  `autosave_interval` (default 1800s), or SIGUSR1. For gauges that disconnect, this default
  is the first outage-recovery trap: restart wipes queued QoS1/2 unless persistence was on.
- Per-client queue default `max_queued_messages 1000` above in-flight; excess silently dropped
  (no error to publisher). `max_inflight_messages` default 20 (1 = ordered). QoS0 for
  offline persistent clients is NOT queued by default (`queue_qos0_messages false`, and
  queuing it is non-standard). Retained defaults on; last-good-value per topic is available
  but must be sized against ACL re-checks (`check_retain_source true`).
- Consequence for 120 gauges: Mosquitto fits (tiny footprint, bridge fan-in for sites) but
  late/out-of-order/duplicate handling is NOT solved at MQTT: QoS1 redelivery duplicates,
  QoS2 is heavier, ordering needs inflight=1, and offline backlog is bounded by queue caps.
  Application-layer idempotency keys + event-time, not MQTT alone, must carry dedup.
- NATS JetStream alternative: stream (subject-bound, sequenced, memory/disk, limit- or
  ack-based retention) + consumer (server-side cursor, independent positions, replay from
  beginning/latest/seq/time) + client ack with timed redelivery = at-least-once with replay.
  Materially different from Mosquitto queues: replayable log vs per-client transient queue.
  Cost: more to run than Mosquitto, but outage recovery (replay after dashboard outage) is
  first-class rather than autosave-interval luck.

### 2.2 Storage: last-write-wins vs interval-dedup vs SQL hypertable
- InfluxDB OSS v2 (TSM): identity = measurement + tag set + timestamp; same key = union of
  fields with per-field last-write-wins. Duplicates therefore collapse silently unless a
  `uniq` tag or timestamp nudge preserves them. Units: line-protocol typed fields, ns
  timestamps. Small-scale friendly, but v2 is superseded messaging (3 Core latest) — version
  pin matters.
- VictoriaMetrics single-node: `-dedup.minScrapeInterval` keeps one raw sample with biggest
  timestamp per discrete interval per series; timestamp tie keeps biggest VALUE (numerics beat
  stale markers); labels must be identical; all samples still stored, dedup at merge/query
  (or ingest via -streamAggr.dedupInterval). Default retention 1 month, min 24h; future cap
  now+2d (`-futureRetention`); backfill within retention unless `-maxBackfillAge` clamps.
  Single retention in community (multi needs Enterprise filters or multi-instance + vmauth).
  For gauges: VM accepts late/backfill naturally, but dedup window must equal scrape cadence
  or duplicates survive; tie-break-by-max-value can surprise (not last-write-wins).
- TimescaleDB: hypertable + background compression job (rows → compressed columns per chunk);
  compression docs now marked "Superseded by Hypercore", APIs still supported. SQL + ack-history
  joins are the attraction (alerts + acks in one Postgres), but compressed-chunk backfill/
  decompress behavior must be verified against Hypercore-era docs before promising cheap
  late-data inserts. Postgres operational weight vs VM/Influx single binary is the trade.
- Net: for explicit ack history + ad-hoc joins, Postgres/Timescale has a coherence edge; for
  cheap high-ingest + built-in HA dedup, VM leads; Influx v2 is simplest mental model but
  weakest future.

### 2.3 Alerting: Grafana multi-dim instances + Alertmanager grouping
- Grafana Alerting: periodic rule evaluation over multi-source queries; one rule → N instances
  (one per series, e.g. per gauge); only firing/resolved instances notify; contact points
  (email/Slack/IRM/webhook) + notification-policy tree (label routing, root Default policy).
  Understandable-alerts requirement maps to per-gauge instances + labels + annotations.
- Alertmanager grouping governs noise: `group_wait 30s` (hold first fire to batch/inhibit;
  sub-wait resolves never notify = flap filter), `group_interval 5m` (re-tick; also caps
  notify-pipeline timeout), `repeat_interval 4h` (should be multiple of group_interval),
  `resolve_timeout 5m`. Mis-tuning = either alert spam (short waits) or late pages (long waits).
  `group_by` design (e.g. by site vs by gauge) is the understandability lever for 120 gauges.
- State/ack history: Grafana-side state history + Alertmanager silences/acks are the expected
  store, but exact ack-history retention/backend was NOT verified in this window — must be
  checked before claiming compliance with "acknowledgement history".

### 2.4 Fan-out to operators: ntfy (self-hosted push)
- ntfy: pub/sub push with phone/Web/CLI/API subscribers; self-host SQLite default (separate
  cache/auth/web-push files, no deps) or Postgres; message cache for missed notifications
  with configurable retention; attachments via filesystem/S3; proxy/TLS + rate-limit/tiers
  guidance; UnifiedPush example. Fits modest budget + on-call phones without PagerDuty.
  Exact numeric defaults not captured — size from config, don't guess.

## 3. O3 chain (primary, version-pinned)

Mosquitto `max_queued_messages` semantics chain (directly governs offline-gauge backlog):
1. 2.0.0 changed default to 1000.
2. 2.0.3 fixed "QoS0 not delivered if max_queued_messages=0" (#1956) + persistence_location
   slash + SIGHUP bridge drops (#1942).
3. Issue #3244: quota-exceeded with no limits — `count >= max_queued_messages` treated 0
   (documented unlimited) as exceeded; reporter proposed `> 0 &&` guard.
4. 2.0.22 shipped "Fix case where max_queued_messages = 0 was not treated as unlimited
   (closes #3244)" plus bridge idle_timeout + $CONTROL crash fixes.
Lesson: the exact knob this dashboard needs for outage recovery changed meaning across
releases; pin ≥2.0.22 and test 0-vs-1000-vs-unset explicitly.

## 4. Expansion/outage sketch (pre-draft, to be tested against draft)

- Ingest: Mosquitto (QoS1, persistence on, tuned queues, bridge per site) OR JetStream
  (file stream, ack-based retention, replay consumer) fronting a normalizer that stamps
  (gauge_id, event_ts, ingest_ts, msg_id) and dedups on msg_id before storage.
- Store: VM (retention ≥ operator horizon, dedup window = gauge cadence, backfill allowed)
  + Postgres (gauges, alert states, ack history, annotations) OR Timescale-only if SQL
  compression/backfill checks pass. Avoid Influx v2 for new work absent a pinning reason.
- Alert/deliver: Grafana rules per-threshold (per-gauge instances) → Alertmanager grouping
  (by site, then gauge) → ntfy topics per severity/site + dashboard ack UI writing Postgres.
- Recovery: broker persistence + normalizer idempotency + VM backfill + ntfy cache replay;
  drill: kill broker 10 min, replay backlog, assert no duplicate alerts, ack history intact.

## 5. Uncertainties / must-verify-against-draft

- U1 Grafana/Alertmanager ack + state-history retention/backend and operator-visibility.
- U2 Timescale Hypercore-era late/backfill + compression policy for gauge cadence.
- U3 Exact P-clause plan (unseen); all O4 dispositions pending reveal.
- U4 ntfy numeric cache/rate defaults for 120-gauge burst sizing.
- U5 Gauge protocol reality (MQTT-capable vs HTTP/LoRa translators) — brief is silent.
- U6 No runtime here: all checks below are PROPOSED until a sandbox runs them.

## 6. Proposed discriminating validations (none executed — no sandbox claimed)

- V1 Queue-limit truth: Mosquitto ≥2.0.22, persistent sub offline, publish 1500 QoS1;
  assert queued-capped-at-1000 vs unlimited-when-0 vs dropped-silently counts.
- V2 Dedup semantics: same key twice to Influx v2 (expect field-union LWW) vs VM with
  dedup=60s (expect biggest-ts, tie→biggest-value); assert with exports.
- V3 Late/backfill: VM ingest 7-day-old points within retention (expect accepted) + beyond
  maxBackfillAge (expect rejected); Timescale insert into compressed chunk (observe cost).
- V4 Grouping noise: flap one gauge across group_wait boundary; assert sub-wait resolve =
  no notify, supra-wait = single grouped notify; repeat_interval multiple respected.
- V5 Outage replay: broker down 10 min with backlog, restore, assert exactly-once alerts
  (msg_id dedup) + ack history preserved + ntfy cache catch-up on subscribe.
