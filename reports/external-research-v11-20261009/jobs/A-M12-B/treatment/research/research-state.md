# A-M12-B / treatment / research — M12 adaptive-evidence-state-branching state

- Case: S06 "device-alerts" (water-utility sensor alert dashboard, 120 remote gauges, late/out-of-order/duplicate data, operational triage, modest self-hosted budget)
- Stage opened (UTC): 2026-10-09T18:29:29Z
- Stage deadline: 2026-10-09T18:58:02.332673+00:00 (arm 19:28:02Z); protect last quarter (≥18:53Z) for writing/delivery
- Method: M12 v1 adaptive-evidence-state-branching (inference-time adaptation, not IGRPO reproduction)
- Inputs frozen per freeze.json; write root = this directory only; plan-root-only.md NOT read; reveal only via control/reveal-plan.py after discovery.md + source-map.json saved

## Obligations ledger (from cases/S06/brief.md)

- O1 independently discover useful unfamiliar tools/products/approaches beyond the thin plan — OPEN
- O2 consequential primary source/code behavior, governing defaults, units/types, limits, applicability — OPEN
- O3 ≥1 relevant issue/fix/regression/release or evolution chain; state when evidence absent — OPEN
- O4 compare every exact P clause after reveal — blocked until reveal (ticket 3)
- O5 retain alternatives/conditions/constraints/disagreement/uncertainty in one coherent final — OPEN
- O6 discriminating validations; separate executed from proposed — OPEN

## Search branch states (parent → children; update after every retrieval)

Scoring per M12: next-retrieval attention = observed state change/min (+4 consequential proposition transition, +2 new applicability condition, +2 viable alternative, −2 duplicate). Zero-change branches may pause only after mandatory coverage is accounted for. One unresolved countercase branch MUST be preserved.

### B1 time-series storage engine candidates (parent)
- B1.1 TimescaleDB — state: unknown | propositions: licensing/applicability at 120-gauge scale, compression defaults, out-of-order/duplicate handling
- B1.2 VictoriaMetrics — state: unknown | propositions: dedup semantics, late-data behavior, self-hosted footprint
- B1.3 QuestDB — state: unknown | propositions: out-of-order ingestion, dedup, licensing
- B1.4 InfluxDB 3.x vs 1.x/2.x drift — state: unknown | propositions: version behavior change, OSS licensing shift (countercase candidate: closed-source 3.x)
- B1.5 PostgreSQL/MariaDB plain + fallbacks (unfamiliar alternative probe) — state: unknown

### B2 transport/ingestion layer (parent)
- B2.1 MQTT brokers (EMQX/Mosquitto/NanoMQ) — state: unknown | propositions: QoS semantics vs duplicates, retained messages, persistence on outage
- B2.2 Redis/NATS/stream alternatives — state: unknown

### B3 alerting/acknowledgement mechanisms (parent)
- B3.1 Grafana Alerting — state: unknown | propositions: out-of-order tolerance, ack history persistence, multidata-source rules
- B3.2 Ack history ownership (app DB vs storage engine) — state: unknown | propositions: where acks live, audit trail shape
- B3.3 Alertmanager/kapacitor-class alternatives — state: unknown

### B4 outage recovery + expansion (parent)
- B4.1 Store-and-forward on gauge/gateway (MQTT persistent sessions, edge buffering) — state: unknown
- B4.2 Retention/downsampling defaults and growth path beyond 120 gauges — state: unknown

### B5 unresolved countercase branch (MANDATORY, keep open)
- B5.1 "A plain relational DB (Postgres) + tiny app is the right choice at this scale; a TSDB adds operational cost without benefit" — state: unresolved by design; must survive to draft with conditions for/against

## Change log (append per retrieval: time, branch, retrieval, transitions)
- (empty — ticket 2 fills)
