# Independent assessment A-M06-A — S06 device-alerts

Completed 2026-10-09T19:48:30.696951+00:00. **N1 (treatment): FAIL. N2 (control): FAIL.** Both complete authored finals are available. All six axes were reviewed against the original brief and exact frozen plan, with independent primary evidence. These are distinct material failures, not equal quality, a winner or a speed/cost conclusion.

## Scope and inputs

The brief concerns operational triage for120 remote water-utility gauges, late/out-of-order/duplicate telemetry, understandable alerts and acknowledgement history, modest self-hosting, outage recovery and expansion. O1 useful discovery; O2 governing primary behavior; O3 issue/fix/evolution; O4 exact plan comparison; O5 preserved alternatives/constraints/uncertainty; O6 meaningful proposed-versus-executed validation were assessed independently.

All declared complete stages and source indexes/excerpts were inspected, including treatment evidence-first notes. All input-map hashes/sizes match. Critics are fallible. Paths and assignments reveal method, so blinding is partial. No candidate was repaired or modified, and no worker or runtime service was started. The full frozen manifest and source-operation hashes are in the JSON artifacts.

| Arm | Authored final | SHA256 |
|---|---|---|
| N1 | `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/treatment/reviser/final.md` | `3add91c98f7e52d01a19f193ad2c4b029ee447bfa04d84f76631409ebe4e94d6` |
| N2 | `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/control/reviser/final.md` | `84bbf9aac848cc6012c532ce1842adcfc0d2a79ae7d23b73a54c019a4c24a89b` |

Full consequential grading coverage is distinct from exhaustive upstream code auditing or measured production guarantees. Missing utility inputs, optional unadopted versions and unrun checks are listed explicitly. Counts, agreements, length and artifact hashes are not scientific grades.

## N1 (treatment) — FAIL

### Six-axis assessment

**Axis1: FULL: original obligations and explicit constraints.** All O1–O6 receive substantial prose. The final retains 120 remote gauges, late/out-of-order/duplicate data, triage-only operation, understandable alerts, acknowledgement history, modest hosting, outages and expansion. Discovery, evolution chains, exact plan comparison and proposed/executed honesty are substantive. O2 and O5 remain materially defective because of N1-F1–F3; section presence does not establish compliance.

**Axis2: FULL: consequential primary-source behavior and applicability.** Consequential Mosquitto, NATS, Timescale, Grafana, ThingsBoard, ntfy, Alertmanager and scoped Influx v2 behavior was independently checked. Three material applicability errors remain. Utility inputs and unmeasured runtime capacity are distinguished from wrong source facts. Minor numerical and release qualifications are recorded separately.

**Axis3: FULL: discovery, options and relevant evolution evidence.** The custom Mosquitto/Timescale/Grafana/Loki/Postgres/ntfy composition differs materially from ThingsBoard CE as an integrated platform. JetStream adds optional durable transport and bounded deduplication. Other surveyed products and LoRa/Modbus, SMS and tenancy leads remain proportionate optional work. The incorrect ThingsBoard permission condition harms a viable alternative. Mosquitto migration and issue3244→2.0.22 provide relevant primary-grounded evolution evidence; Hypercore adds qualified context.

**Axis4: FULL: every exact P1–P6 disposition.** Each exact P1–P6 clause is compared with an explicit disposition. MQTT/TSDB and a raw-data year are preserved; zero-fill is rejected on sound measurement semantics; server acknowledgement authority preserves offline pending intents; CSV remains a smoke seed. Notification grouping and chunk-sizing errors affect specific corrections rather than invalidating every enhancement.

**Axis5: FULL: discovery/draft/critique/final preservation and criticism treatment.** The complete discovery, draft, critic, evidence-first notes and final were compared. Supported options and uncertainty generally survive in full prose. Loki requirements, resource estimates, buffer/security policies, rule-edit reset behavior and the three histories are restored or expanded. All M1–M6 and m1–m8 are adjudicated. N1-F1/F3 show that accepting a critic did not reliably preserve source applicability. No separate material preservation loss was identified; those errors are not counted twice.

**Axis6: FULL: proposed/executed status and discriminating validation.** Only read-only source work is reported executed. V0–V11 propose discriminating replay, late-data, upgrade, bounded-dedup, stale-feed, concurrent-ack, restart, History/Loki, clock/buffer, authentication and rule-edit checks. The proposals are appropriate for this brief without a qualified runtime. The sizing test must not reuse the incorrect N1-F3 quantity. No fake executed witness or VALIDATION_OVERCLAIM was found.

### Material findings

#### N1-F1 — ThingsBoard CE customer users wrongly excluded from acknowledgement

`FALSE_CORRECTION_OR_REJECTION`; **high** severity. Obligations: O1, O2, O5: viable alternatives and correct role conditions.

Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/treatment/reviser/final.md`, lines 185, 186, 286, 290: “customer users are read-only and cannot ack; operator role = staff user, never read-only customer user”.

The selected alternative is ThingsBoard CE. Its official CE guide explicitly permits customer users to acknowledge and clear alarms on their assigned devices/assets. The Cloud example describes a default read-only group with configurable permissions; that edition/example cannot supply a categorical CE prohibition. The independently read controller also permits TENANT_ADMIN and CUSTOMER_USER, subject to entity write authorization. Requiring staff status narrows a viable alternative and misstates the access model. A build-time role check does not make the categorical claim correct. This is about product applicability, not assuming every customer can modify every entity.

Criticism/preservation: Treatment discovery secondary role claim -> critic m6 (critique.md:172-173) -> final accepted m6 and architecture-B restriction.

Primary evidence:

- [E35: CE Getting Started part 5, Alarm management; Cloud part 5 read-only group example; AlarmController.ackAlarm/clearAlarm @PreAuthorize](https://thingsboard.io/docs/getting-started/5/). ThingsBoard CE current official getting-started guide; Cloud guide is a different edition; master controller is corroboration only, not a pinned-release witness. Capture `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M06-A/evidence/E35.txt`, SHA256 `d1736575bd9297f9d422672c9cd2e19a13d2cf7a8217aa8810e147f3775764ed`.
- [E36: CE Getting Started part 5, Alarm management; Cloud part 5 read-only group example; AlarmController.ackAlarm/clearAlarm @PreAuthorize](https://thingsboard.io/docs/paas/getting-started/5/). ThingsBoard CE current official getting-started guide; Cloud guide is a different edition; master controller is corroboration only, not a pinned-release witness. Capture `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M06-A/evidence/E36.txt`, SHA256 `a26520c0b67ddcba93e53c33bc7713bb2c3f88b24edc6fada12849d73f577685`.
- [E38: CE Getting Started part 5, Alarm management; Cloud part 5 read-only group example; AlarmController.ackAlarm/clearAlarm @PreAuthorize](https://raw.githubusercontent.com/thingsboard/thingsboard/master/application/src/main/java/org/thingsboard/server/controller/AlarmController.java). ThingsBoard CE current official getting-started guide; Cloud guide is a different edition; master controller is corroboration only, not a pinned-release witness. Capture `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M06-A/evidence/E38.txt`, SHA256 `c6cedfdeccc1e42bd00ca6f872b57be72d921dbc3c53f1c5109f0422143cc4af`.

#### N1-F2 — Grouping by site and gauge does not aggregate a site-wide event

`MATERIALLY_WRONG`; **medium** severity. Obligations: O2: alert mechanism applicability, O5: understandable alerts at 120-gauge scale.

Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/treatment/reviser/final.md`, lines 66, 71: “design group_by as site-then-gauge so one site event reads as one group, not 120 pages”.

group_by forms groups from the values of every selected label. Including gauge produces separate groups for distinct gauges, even when site is the same. If 120 gauges at one site alert together, site+gauge can produce 120 groups. The final supplies no documented hierarchy or inhibition mechanism that changes this. Its promised site-wide aggregation therefore does not follow from the chosen grouping. The timing defaults themselves are supported; this finding concerns the consequential grouping design and operator noise.

Criticism/preservation: New reviser grouping advice, not a valid resolution established merely by the critic agreeing with P2.

Primary evidence:

- [E29: Alertmanager route.group_by; Grafana notification policy Group by](https://prometheus.io/docs/alerting/latest/configuration/). Official documentation retrieved 2026-10-09; mutable, capture hashes in source-map.json. Capture `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M06-A/evidence/E29.txt`, SHA256 `5151883d35a283aafbee4dbdca497895b90894daf65abece35b0abf98dd87cdc`.
- [E42: Alertmanager route.group_by; Grafana notification policy Group by](https://grafana.com/docs/grafana/latest/alerting/configure-notifications/create-notification-policy/). Official documentation retrieved 2026-10-09; mutable, capture hashes in source-map.json. Capture `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M06-A/evidence/E42.txt`, SHA256 `1ff110ad2df34d1a24d10deb4e72565f6815c0d3099f29b8b290efc48103e9ec`.

#### N1-F3 — Timescale RAM sizing gate applies to compressed row bytes instead of active indexes

`MATERIALLY_WRONG`; **medium** severity. Obligations: O2: governing storage defaults and sizing applicability, O5: modest self-hosted budget.

Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/treatment/reviser/final.md`, lines 303, 316: “daily-chunk bytes approximately G x C x 24 x B compressed — must stay <= ~25% RAM; 1-day default unless recent-chunk estimate > ~25% RAM”.

The primary rule is to size chunks so the indexes of all chunks currently receiving writes fit within roughly 25% of main memory. The final substitutes compressed daily row bytes and uses that inequality to select/rederive the chunk interval. Cold columnstore compression is not the governing memory quantity for active index writes; late backfill can also make multiple chunks active. The small example may still fit easily, but its advertised measurement gate cannot decide that from the stated quantity. This is a material applicability error in the added sizing decision, not a demand for an actual benchmark or a claim that the proposed VM is too small.

Criticism/preservation: Critic M6 (critique.md:147-153) inherited an imprecise recent-chunk rule; final accepts and supplies the wrong inequality.

Primary evidence:

- [E24: Sizing hypertable chunks: indexes for chunks currently being ingested; chunk interval](https://www.tigerdata.com/docs/learn/hypertables/sizing-hypertable-chunks). Official documentation retrieved 2026-10-09; mutable, capture hashes in source-map.json. Capture `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M06-A/evidence/E24.txt`, SHA256 `a8e9b478a5db48a24987d5e72da65dd123e236fc68a3bbbe50e9671c686acba3`.

### Every exact frozen plan clause

| Clause | Disposition | Assessment |
|---|---|---|
| P1: Ingest MQTT readings into a time-series database. | Already-covered intent; corrections for identity/persistence/time; optional NATS; store user decision. | Lines29-54 preserve MQTT->TSDB and add auth, UTC, QoS/idempotency and retention. Basic direction is supported by E01/E02/E23. NATS is genuinely optional, not a claim MQTT must be replaced. N1-F3 affects the chunk-sizing condition; no false rejection of MQTT. Primary: E01, E02, E05, E22, E23. |
| P2: Alert when the latest reading exceeds one fixed threshold. | Correction plus seed retained; per-gauge/class thresholds, pending and separate stale rule. | Lines56-72 retain the simple threshold only as a starting value and explain jitter, delayed ordering and missing-data effects. Per-gauge thresholds and persistence are design choices justified by the brief, not product facts. N1-F2 is a wrong notification aggregation mechanism. Primary: E29, E33, E42. |
| P3: Missing readings count as zero. | Reject/correction: null/unknown plus stale/error signal. | Lines74-82 correctly avoid making a missing measurement a physical zero. Unknown/stale styling and a separate per-gauge stale rule are meaningful and supported by Grafana managed-rule distinctions. No source-grounded reason requires restoring zero. Primary: E15, E16. |
| P4: Clients acknowledge an alert locally then sync. | Correction to server-authoritative ledger; optional offline intent queue retained. | Lines84-96 preserve offline usability with pending-sync intent and losing-intent history while separating state, notification and human ack history. Custom Postgres actor/action/time ledger is declared a design, not native Grafana functionality. E17/E33 support this separation. No blanket rejection of all offline input. Primary: E17, E33, E25. |
| P5: Keep data for a year. | Already-covered raw year; configuration correction; optional longer ack horizon and compression/rollups. | Lines98-107 retain365-day raw data; >=2-year ack retention is recommended for user decision rather than pretending original scope specified it. E54 supports scheduled whole-chunk retention, with granularity limitations; compression is conditional. N1-F3/m2/m3 qualify sizing and mode, not the year commitment. Primary: E22, E30, E54. |
| P6: Validate with a static sample CSV. | Smoke seed retained; reject sufficiency; add proposed fault/drift tests. | Lines109-115 and354-376 cover replay, late history, feed loss, concurrent ack, restart, Histories, auth and clock/buffer. No executed witness is implied. The dynamic additions fit the brief; no requirement for a full operational system was imposed by this evaluator. Primary: E04, E15, E17, E34. |

### Complete criticism and preservation audit

| Criticism | Treatment | Independent reasoning/locator |
|---|---|---|
| M1 | Accepted; History UI dependency resolved. | Critique105–113 → final121–129 and281–285. Explicit Loki, resource estimate and restore coverage are supported by E17/E53. Human ack remains in a separate ledger. |
| M2 | Accepted; material estimate improvement. | Critique114–121 → final130–135 and303–315. Cadence/payload/raw/Loki/ack estimates are parameterized. N1-m2 qualifies arithmetic; an actual benchmark is not required to propose hosting. |
| M3 | Accepted; proposed policies added. | Critique122–132 → final136–144 and317–321. A72-hour buffer seed, overflow gaps and24-hour quarantine are designs. N1-m4 identifies their delayed-replay interaction. |
| M4 | Accepted; reasonable conditional security posture. | Critique133–140 → final145–152. Public-link TLS1.2+, per-gauge identity, ACLs and rotation are explicit; private-network exceptions are conditional. E01/E02 establish knobs, not deployed security. |
| M5 | Accepted; supported discovery restored. | Critique141–146 → final153–157 andV11. E33 confirms that most rule edits reset instances to Normal, with the stated annotation/interval/internal-field exceptions. |
| M6 | Accepted; source rule still misapplied. | Critique147–153 → final158–162 and308–316. A conditional one-day interval is an improvement, but the RAM inequality uses the wrong quantity. E24 and N1-F3 govern. |
| m1 | Accepted and retained. | Final166–168: History chart cap5000 and RBAC are supported by E17. |
| m2 | Accepted and retained. | Final169–171 separates Loki state history, notification delivery history and Postgres human acknowledgement history. E17/E33 support the distinction. |
| m3 | Accepted; feature condition omitted. | Final172–175 carries10-second evaluation floor,30-second timeout and5-minute periodic save. E43/E47 confirm values; N1-m1 records the periodic-save toggle. |
| m4 | Accepted as a deferred option. | Final176–181 distinguishes Influx3 from scoped v2 duplicate behavior. E28 confirms the v2 field union; no v3 adoption guarantee is inferred. |
| m5 | Accepted and supported. | Final182–184 keeps durable dashboard/ledger links separate from ephemeral ntfy attachments. E26/E27 support the limits and hosting qualifications. |
| m6 | Accepted; incorrect applicability propagated. | Critique172–173 → final185–186 and290. CE customer acknowledgement is allowed subject to entity permissions, E35/E38. The Cloud read-only example E36 does not establish the ban. N1-F1. |
| m7 | Accepted as honest capacity uncertainty. | Final187–189 retains hour-window memory cost, DB backstop and proposedV4 measurement. E05/E50 confirm bounded dedup; no free capacity is asserted. |
| m8 | Accepted as a proposed seed. | Final190–191 seeds keep-firing at1–2 evaluations and calls for tuning. E33 supports the mechanism, not a universal default for that chosen number. |
| Uncertainty paragraph | Preserved; core upsert mechanism confirmed. | Final193–204 retains medium-confidence upsert and Hypercore drift. E23 confirms partition-containing unique indexes and ON CONFLICT; E30 says legacy compression APIs remain supported. |

No separate material PRESERVATION_LOSS was identified. Incorrect preserved or amplified conditions are recorded under their source/applicability findings rather than counted again. Supported options remain in full prose; a criticism ID alone was not considered a complete treatment.

### Minor findings

**N1-m1: Periodic five-minute alert instance saving is presented as a general default without the feature-toggle condition.** Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/treatment/reviser/final.md`, lines 172, 175. Grafana v12.4.0 defaults.ini makes state_periodic_save_interval=5m conditional on alertingSaveStatePeriodic. The numerical value is right; this is a limited configuration qualification, not an ack-ledger defect.

Primary [E47](https://raw.githubusercontent.com/grafana/grafana/v12.4.0/conf/defaults.ini), state_periodic_save_interval and alertingSaveStatePeriodic; capture/hash in source-map.json.

**N1-m2: Sizing units and rollup proportion are overgeneralized.** Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/treatment/reviser/final.md`, lines 303, 309. 63,072,000 x 200 bytes is 12.6144 decimal GB, about 11.75 GiB; hourly+daily rollups cannot generally be <10% of raw at C=1 or C=4 on the same row-size basis. Assumptions/remeasurement are explicit and the absolute scale stays modest; retain as numerical qualification rather than a separate material VM-capacity failure.

Independent derivation: 120*C*24*365; hourly+daily rows=120*(24+1)*365; at C=4 this is about26% of raw row count.

**N1-m3: Timescale WITH/columnstore and batch advice needs narrower release/mode scoping.** Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/treatment/reviser/final.md`, lines 246, 263. CREATE TABLE WITH syntax starts in 2.20, but current docs distinguish automatic self-hosted columnstore policy after 2.22.1 and first-timestamp partition selection in 2.23+. The 1000-row direct-compression guidance belongs to a 2.29 technical preview that excludes unique/exclusion constraints. The final acknowledges Hypercore drift and build verification; do not read its generic batch advice as a demonstrated optimization for its unique-key upsert path.

Primary [E22](https://www.tigerdata.com/docs/reference/timescaledb/hypertables/create_table), CREATE TABLE version/technical-preview notes; upsert; deprecated compression header; capture/hash in source-map.json.
Primary [E23](https://www.tigerdata.com/docs/use-timescale/latest/write-data/upsert), CREATE TABLE version/technical-preview notes; upsert; deprecated compression header; capture/hash in source-map.json.
Primary [E30](https://raw.githubusercontent.com/timescale/docs/latest/use-timescale/compression/index.md), CREATE TABLE version/technical-preview notes; upsert; deprecated compression header; capture/hash in source-map.json.

**N1-m4: A 24-hour timestamp-vs-now quarantine also captures legitimate 24-72-hour buffered replay.** Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/treatment/reviser/final.md`, lines 317, 321. This is an authored policy, not a false source fact. Quarantine preserves records and V9 is proposed, so it does not prove loss; the intended handling of valid delayed replay deserves explicit qualification. The 72-hour buffer and 24-hour window should not be mistaken for an independent clock-skew detector.

Independent derivation: A correctly clocked reading buffered48h satisfies abs(event_ts-now)>24h.

**N1-m5: Integer/naive timestamp language and upsert evidence are more uncertain than necessary.** Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/treatment/reviser/final.md`, lines 43, 48, 193, 204. Official Timescale docs support explicit integer partition columns and document ON CONFLICT upserts with partition columns in unique indexes. A naive timestamp can create a timezone interpretation problem but does not inherently silently mispartition. Requiring normalized UTC is sensible. The candidate clearly labels its weaker upsert support medium confidence; the evaluator confirms the core mechanism, rather than counting the uncertainty as a material fail.

Primary [E22](https://www.tigerdata.com/docs/reference/timescaledb/hypertables/create_table), Explicit integer partition example; partition columns in unique constraint; upsert; capture/hash in source-map.json.
Primary [E23](https://www.tigerdata.com/docs/use-timescale/latest/write-data/upsert), Explicit integer partition example; partition columns in unique constraint; upsert; capture/hash in source-map.json.

### Honest unresolved scope and grade limits

- **Utility inputs (HONEST_EXTERNAL_UNKNOWN):** Actual cadence, protocols, gauge clocks/buffer hardware, worst backhaul outage, on-call/SMS policy, retention and budget are unprovided. Parameterized seeds require utility confirmation.
- **Runtime and deployment (PROPOSED_NOT_EXECUTED):** No broker, TSDB, Grafana, Loki, ntfy or ThingsBoard runtime/load/restore witness was executed. Collision policy, valid delayed quarantine release, custom ack integration and dedup-window memory need the proposed checks.
- **Optional versions (HONEST_DEFERRED_OPTION):** Influx3 and other surveyed stores/brokers are deferred or conditional, not guaranteed production options. Exact NATS maximum window/per-ID RAM is unpinned; the final does not assert unlimited capacity.

These are product inputs or unexecuted proposals, not hidden unfinished evaluator grading groups. Material defects prevent PASS_WITH_LIMITATIONS. No runtime result or unlimited guarantee is inferred.

## N2 (control) — FAIL

### Six-axis assessment

**Axis1: FULL: original obligations and explicit constraints.** All O1–O6 and explicit brief constraints receive full prose. Outage recovery, expansion, time/payload contracts, retention and acknowledgement choices are covered. Discovery and relevant evolution chains are substantive. Queue sizing, store identity, the default acknowledgement mechanism, NoData validation and current-edition budget applicability materially weaken O2/O5/O6. Length and thoroughness do not resolve these defects.

**Axis2: FULL: consequential primary-source behavior and applicability.** Consequential NATS, EMQX, Connect, QuestDB, VictoriaMetrics, Grafana, Alerta and Greptime behavior was independently checked. The EMQX expiry correction is valid and the WAL-immunity inference is appropriately downgraded. Five material source/applicability defects remain. A future proof gate does not replace available investigation of the default acknowledgement operation. Minor provenance and arithmetic defects are separate.

**Axis3: FULL: discovery, options and relevant evolution evidence.** QuestDB versus VictoriaMetrics is a meaningful storage choice. JetStream transport, Alerta lifecycle ownership and Greptime unified observability add different approaches beyond the thin plan. Conditions generally keep complexity proportionate. QuestDB PR7285, Grafana PR117024, NATSv2.8.1 and EMQX documentation PR18443 are actual relevant chains. VM identity and the default Grafana acknowledgement path affect option viability; they are not an absence of discovery.

**Axis4: FULL: every exact P1–P6 disposition.** All exact P1–P6 clauses and their correction/choice/rejection conditions are assessed. Unknown rather than zero, server authority and dynamic checks are justified; offline intent collection remains available. P1 leaves the VM key contract unresolved and P2/P3 mix incompatible state configurations. P5 explicitly exposes a raw-versus-rollup decision, so its year of rollups must not be silently read as a year of raw measurements. P4 still lacks an identified default ack operation.

**Axis5: FULL: discovery/draft/critique/final preservation and criticism treatment.** The complete discovery, draft, critic, final and supplied source records were compared. All M1–M11 and m1–m10 receive explicit treatment. The revision preserves alternatives and uncertainty while improving expiry scope, metric names, split storage tests, retention/restore, security and upgrade checks. Some accepted criticism still leaves wrong configuration or incomplete product mechanisms. No supported material finding was identified as lost behind an ID; provenance errors are separately qualified.

**Axis6: FULL: proposed/executed status and discriminating validation.** Only source reads are reported executed; V1–V8 are explicitly proposals. Independent row reconciliation, counts/min-max/key comparisons, an alert golden trace with allowed differences and restore comparisons are meaningful oracles. Outage multiplication and preregistered workload bounds are appropriate proposals, not measured results. V4 expects mutually exclusive state paths, V2 under-specifies MQTT retransmission, and default V6 never identifies its ack operation. No fabricated runtime success or VALIDATION_OVERCLAIM is assigned.

### Material findings

#### N2-F1 — EMQX outage queue sizing counts publishing sessions instead of the ingest subscriber

`MATERIALLY_WRONG`; **high** severity. Obligations: O2: transport limit applicability, O5: outage recovery, O6: V3 sizing oracle.

Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/control/reviser/final.md`, lines 1013, 1023: “a single session per gauge (120 sessions) holds 240 rows each (fits); a single gateway session for all 120 gauges needs 28,800”.

EMQX queues outbound messages for the receiving client/session when it is offline or inflight-constrained. In the selected MQTT-to-Connect ingest topology, Connect subscribes to readings from all gauges. Its receiving session accumulates the aggregate backlog: 120 x 240 = 28,800 messages for four hours. The number of publishing gauge sessions does not shard that subscriber queue. A publisher/gateway buffering its own unsent readings is a different buffer. With clean_session=true and no maintained subscription, an offline persistent subscriber queue is not assured at all; the final correctly proof-gates clean_session=false elsewhere but still labels this per-publisher calculation a fit and makes it the V3 assertion. General instructions to measure or raise caps do not validate the erroneous topology-dependent comparison.

Criticism/preservation: New M8 worked sizing plus M1/M5/M10 outage checks; the corrected expiry defaults do not settle queue direction.

Primary evidence:

- [E08: EMQX Message Queue max_mqueue_len; retransmission sender queue; Connect mqtt input subscriber](https://docs.emqx.com/en/emqx/latest/guides/configuration/mqtt.html). Official documentation retrieved 2026-10-09; mutable, capture hashes in source-map.json. Capture `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M06-A/evidence/E08.txt`, SHA256 `fd2ca451edea53620609b2793147d9bfd041f12bc3f372f10f1ea94f7e6e2dfd`.
- [E45: EMQX Message Queue max_mqueue_len; retransmission sender queue; Connect mqtt input subscriber](https://docs.emqx.com/en/emqx/latest/design/retransmission.html). Official documentation retrieved 2026-10-09; mutable, capture hashes in source-map.json. Capture `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M06-A/evidence/E45.txt`, SHA256 `bdb6bbfc41f21c263223feb2dcda3fa1b0cd0e646aed2377a2f2b5a2afb17230`.
- [E10: EMQX Message Queue max_mqueue_len; retransmission sender queue; Connect mqtt input subscriber](https://docs.redpanda.com/redpanda-connect/components/inputs/mqtt/). Official documentation retrieved 2026-10-09; mutable, capture hashes in source-map.json. Capture `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M06-A/evidence/E10.txt`, SHA256 `7c36d897fce5cce0a1ba5fe9ceee28f9e0496872e13034a753d522eef9b37be6`.

#### N2-F2 — Mandatory three-field upsert identity has no viable VictoriaMetrics mapping

`MATERIALLY_INCOMPLETE`; **high** severity. Obligations: O2: selected storage identity and duplicate semantics, O4: P1 correction, O5: viable store alternatives.

Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/control/reviser/final.md`, lines 285, 310, 447, 458: “keep labels to gauge_id/site/sensor_type, reading seq in value/timestamp; permanent idempotency lives in the store key; Upsert key (gauge_id,event_ts,seq) MANDATORY”.

The final recognizes that VictoriaMetrics interval dedup is not a generic idempotency key, yet still requires the same permanent (gauge,event_ts,seq) key for either store. For one time series, VM selects a sample per discrete dedup interval; at an identical timestamp it keeps the larger value, not a distinct sequence-bearing record or arbitrary conflict policy. Seq in a value does not change the series identity, and seq in a changed timestamp changes the promised event-time identity. No mapping, bounded label scheme, or separate persistent event ledger is supplied. The final therefore leaves a known contradiction in a selected alternative and in its exactly-once oracle. QuestDB can support a timestamp-containing multi-column key; this does not transfer to VM. The honest far-backfill uncertainty is not itself the failing point.

Criticism/preservation: Critic M4 recognizes VM difference; final accepts M4 but promotes one mandatory key across both stores instead of resolving the store-specific contract.

Primary evidence:

- [E14: VictoriaMetrics Deduplication; QuestDB DEDUP UPSERT KEYS](https://docs.victoriametrics.com/victoriametrics/single-server-victoriametrics/). Official documentation retrieved 2026-10-09; mutable, capture hashes in source-map.json. Capture `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M06-A/evidence/E14.txt`, SHA256 `cd4f4aa9bf7945be731428f000a32f158694f04086fc8d8b53cfe4536454be66`.
- [E13: VictoriaMetrics Deduplication; QuestDB DEDUP UPSERT KEYS](https://questdb.com/docs/concepts/deduplication/). Official documentation retrieved 2026-10-09; mutable, capture hashes in source-map.json. Capture `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M06-A/evidence/E13.txt`, SHA256 `62a89a9d7f09a5dcfebd1e86c5ce4cfdc4896058dc7a5c2fc59ed3adc0cf098f`.

#### N2-F3 — Grafana default acknowledgement history remains an unsupported mechanism

`MATERIALLY_INCOMPLETE`; **high** severity. Obligations: O1: investigate product mechanisms, O2: acknowledgement applicability, O5: acknowledgement history in self-contained final.

Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/control/reviser/final.md`, lines 548, 568: “Default leg: Grafana Alerting state history ... SQL or Loki ... fire->ack->resolve->mute yields actor+timestamp entries; if that fails default to Alerta”.

Grafana managed alert lifecycle/state history records evaluation state transitions. Its documented states do not include a human acknowledgement transition, and silences/mute timings are notification controls rather than an actor-bearing acknowledgement ledger. Adding SQL/Loki storage does not create that operation. Current History views require Loki; the configuration also supports Prometheus state metrics, neither of which supplies the claimed acknowledgement lifecycle. The candidate candidly marks actor retention unproven and has a sensible Alerta fallback; therefore this is not a false claim that V6 ran. However it still selects a default mechanism and sends required available product research to a future fire->ack test without identifying an actual ack operation or custom implementation. That unresolved mechanism is material to this brief. A designed custom conflict ledger elsewhere does not specify a Grafana ack implementation. Alerta is retained and viable; no claim is made here that the entire deliverable lacks any acknowledgement option.

Criticism/preservation: Draft P4 (draft.md:124) -> critic M7 (critique.md:217-240) -> final proof gate; risk awareness improved but the factual/product gap remained.

Primary evidence:

- [E17: Grafana alert rule lifecycle; alert state history and History views; configured Loki/Prometheus state backends](https://grafana.com/docs/grafana/latest/alerting/monitor-status/view-alert-state-history/). Official documentation retrieved 2026-10-09; mutable, capture hashes in source-map.json. Capture `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M06-A/evidence/E17.txt`, SHA256 `bea23752340c3cd234fe8b83425b2ea5280d4388caa8fcd2a989323560eb8c02`.
- [E33: Grafana alert rule lifecycle; alert state history and History views; configured Loki/Prometheus state backends](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/). Official documentation retrieved 2026-10-09; mutable, capture hashes in source-map.json. Capture `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M06-A/evidence/E33.txt`, SHA256 `092c95036d3912cf858abcae59f0d8497a4baef1b398e9ae1d34e5d468e5c0fe`.
- [E53: Grafana alert rule lifecycle; alert state history and History views; configured Loki/Prometheus state backends](https://grafana.com/docs/grafana/latest/alerting/set-up/configure-alert-state-history/). Official documentation retrieved 2026-10-09; mutable, capture hashes in source-map.json. Capture `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M06-A/evidence/E53.txt`, SHA256 `d7569243fe92a080e291ca7a052b32967455fe12b367cf6640d2f94e975ad83c`.

#### N2-F4 — NoData/Error override and Datasource* notification instances are conflated

`MATERIALLY_WRONG`; **high** severity. Obligations: O2: governing alert state/default exceptions, O4: P2/P3 correction, O6: discriminating V4 oracle.

Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/control/reviser/final.md`, lines 489, 511, 926, 936: “NoData->Alerting; Error->Alerting ... with DatasourceError instances; V4 asserts Values -1 and policies matching alertname=DatasourceNoData”.

These are different rule configuration paths. Leaving NoData/Error at their default states creates independent DatasourceNoData/DatasourceError instances. Setting the rule override to Alerting transitions the original alert to Alerting; the -1 Values substitution applies to that Alerting/Normal override path. The final chooses the override but requires independent Datasource* labels/routing and tests both in one V4. It never separates two configurations. A correctly implemented chosen override can fail that proposed oracle because it does not emit the required DatasourceNoData instance. This is source applicability and a materially wrong validation expectation, not an executed-test overclaim. Pending-period version checks and the managed-rule scope are otherwise good improvements.

Criticism/preservation: Critic M2 facts individually valid, but neither critic nor final preserved their mutually exclusive applicability in the chosen design.

Primary evidence:

- [E15: Modify No Data or Error state; Values -1 substitution; alertname/datasource_uid/rulename; PR117024](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/). Official documentation retrieved 2026-10-09; mutable, capture hashes in source-map.json. Capture `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M06-A/evidence/E15.txt`, SHA256 `e0fc76a837346a7f493f3ca1031e8d72a5f66591168061177503045354438ccf`.
- [E18: Modify No Data or Error state; Values -1 substitution; alertname/datasource_uid/rulename; PR117024](https://api.github.com/repos/grafana/grafana/pulls/117024). Official documentation retrieved 2026-10-09; mutable, capture hashes in source-map.json. Capture `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M06-A/evidence/E18.txt`, SHA256 `33d54a45a56f1f51c6e4dbac0ed7c42045752f68d8cf71c9142854c0789384cb`.

#### N2-F5 — Current EMQX edition constraints contradict license-free OSS expansion

`MATERIALLY_WRONG`; **medium** severity. Obligations: O2: selected release/edition applicability, O5: modest budget and future expansion.

Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/control/reviser/final.md`, lines 1037, 1047: “120->500+ by adding broker nodes ... all core pieces run as OSS ... cost drivers ... not licenses”.

The final relies on the EMQX 6.3+ configuration lane for its MQTT5 session cap. Official licensing/deployment documentation says EMQX changed to BSL in 5.9; the community entitlement is a single node and clustered deployment requires a commercial license. Thus describing every selected core component as OSS and licenses as outside the budget while recommending more broker nodes omits a consequential edition/cost constraint. This does not assert that the utility cannot use the free single-node deployment, or offer a legal interpretation of an unspecified use. It is a product applicability error about the recommended expansion path. Choosing an older release or another broker would be a candidate repair and is outside this assessment.

Criticism/preservation: M1 release correction is preserved, but its current-release applicability was not propagated to the budget/expansion discussion.

Primary evidence:

- [E37: EMQX Licensing Requirements: BSL since 5.9; Community single-node and commercial cluster requirements; 6.3 MQTT5 cap](https://docs.emqx.com/en/emqx/latest/get-started/deploy/license.html). Official documentation retrieved 2026-10-09; mutable, capture hashes in source-map.json. Capture `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M06-A/evidence/E37.txt`, SHA256 `8860d05b00951480f7e68413c19d67d62c4187c2d080fd14ed741814baad3c41`.
- [E08: EMQX Licensing Requirements: BSL since 5.9; Community single-node and commercial cluster requirements; 6.3 MQTT5 cap](https://docs.emqx.com/en/emqx/latest/guides/configuration/mqtt.html). Official documentation retrieved 2026-10-09; mutable, capture hashes in source-map.json. Capture `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M06-A/evidence/E08.txt`, SHA256 `fd2ca451edea53620609b2793147d9bfd041f12bc3f372f10f1ea94f7e6e2dfd`.

### Every exact frozen plan clause

| Clause | Disposition | Assessment |
|---|---|---|
| P1: Ingest MQTT readings into a time-series database. | Already-covered intent; corrections transport/session/storage identity; D1 choice and optional NATS. | Lines406-471 preserveMQTT/TSDB. Scoped EMQX3.x vs5/6.3 caps and Connect defaults are improved. Mandatory key across QuestDB/VM is unresolved N2-F2; outage-cap applicability is wrong N2-F1. A blanket (gauge,ts) rejection is stronger than necessary for an explicitly chosen last-write-wins model, but distinct seq records are a legitimate design choice. Primary: E08, E10, E13, E14. |
| P2: Alert when the latest reading exceeds one fixed threshold. | Correction: severity, persistence, windows, missing/error handling; fixed threshold remains a seed. | Lines473-518 make understandable alert behavior explicit, with managed-rule scope and rule owner/runbook. Threshold variations are proposed product decisions. N2-F4 makes the configured failure-state routing inconsistent; the flaw is not the decision to add persistence. Primary: E15, E16, E18. |
| P3: Missing readings count as zero. | Reject/correction: unknown/null and missing/error routing. | Lines520-536 correctly separate missing physical readings from zero and distinguish stale MissingSeries annotation from labels. N2-F4 affects the inherited failure-state/routing details. A per-gauge absence rule remains a designed mechanism, not proof that a multi-dimensional missing series automatically pages. Primary: E15, E16. |
| P4: Clients acknowledge an alert locally then sync. | Correction authority; D2 server choice; optional offline intents display-only. | Lines538-577 give sound actor/time/conflict-intent semantics and preserve offline usefulness. The default Grafana ack/state-history mechanism remains incomplete N2-F3; Alerta is a viable retained alternative. No evidence supports rejecting offline intent collection itself, and the final does not do so. Primary: E17, E19, E20, E33, E49, E53. |
| P5: Keep data for a year. | Correction/configuration plus D4 raw-vs-rollup horizon choice. | Lines579-622 propose raw weeks/months plus year rollups and year ack history, while D4 requires utility choice. This is a more aggressive change than N1: it is not automatic satisfaction of a one-year raw-reading requirement. The brief itself does not specify raw granularity and the final exposes the choice, so no separate false-rejection failure is assigned. Retention/backup V8 is meaningfully added; m1 affects the estimate. Primary: E14, E40, E41, E52. |
| P6: Validate with a static sample CSV. | CSV smoke retained; reject sufficiency; dynamic validations proposed. | Lines624-637,873-978 retain static input but add explicit store/outage/state/ack/restore/upgrade oracles. N2-F4 and m3 are incorrect/underspecified test expectations, not claims of executed evidence. The scope addition is justified. Primary: E10, E12, E15, E18, E45. |

### Complete criticism and preservation audit

| Criticism | Treatment | Independent reasoning/locator |
|---|---|---|
| M1 | Accepted; principal version/default correction valid. | Critique37–76 → final649–660 and167–201. E08 scopes2-hour expiry to MQTT3.x and the infinity cap to MQTT5/6.3+. E09 describes intended memory residency. N2-F1/F5 are dependent applicability errors. |
| M2 | Accepted; configuration conditions mixed. | Critique77–109 → final661–668,489–511 andV4. Managed-rule scope is correct, but overrides, Values−1 and independent Datasource instances are conflated. E15 and N2-F4. |
| M3 | Release pin softened; no false earliest-patch claim. | Critique110–130 → final669–678. E18 exposes milestone12.4.x. The critic not observing it is not disproof. The final preserves uncertainty, N2-m4; no exhaustive first-release audit is inferred. |
| M4 | Collision risk accepted; alternative contract unresolved. | Critique131–159 → final679–688 and293–310. A QuestDB key is plausible, but its identity cannot be transferred unchanged to VM. E13/E14 and N2-F2. Intentional last-write-wins remains possible for revisions. |
| M5 | Accepted; most unsupported processor claims removed. | Critique160–186 → final689–703. Requires named counters/API and separates clean-session behavior from upstream buffering. E10 supports defaults. N2-m3 flags the DUP oracle and N2-F1 the queue direction. |
| M6 | Unsupported inference appropriately downgraded. | Critique187–216 → final704–720. A non-WAL fix does not prove WAL immunity; unobserved follow-up specifics are dropped. E11/E12 support symbols and scope; workload bounds remain proposals. |
| M7 | Accepted as a proof gate; required mechanism remains incomplete. | Critique217–240 → final721–729 andP4. The actor-history uncertainty and Alerta fallback are candid. E17/E33/E53 do not supply the default ack operation, N2-F3. |
| M8 | Accepted; retention/restore coverage improves. | Critique242–271 → final730–741,V8 and sizing. E14/E40/E48/E49/E52 confirm principal mechanisms. N2-m1/m2 qualify arithmetic/provenance; N2-F1 identifies the new queue error. |
| M9 | Uncertainty retained appropriately. | Critique272–296 → final742–752. E05/E07/E50 support2-minute dedup and the historical100-ms floor; the2.14 sources extension and MQTT adapter are not asserted verified. |
| M10 | Accepted; better oracles with an incompatible V4. | Critique297–331 → final753–776 andV1–V8. Split store legs, a quantified outage fixture, float tolerance, a golden trace and restore comparison are meaningful. N2-F4 remains; no proposal is reported executed. |
| M11 | Accepted; remote-gauge contracts added. | Critique332–357 → final777–799 and979–1011. TLS, identity, schema, units, sequence-reset and time-authority policies are designs grounded in E08/E10 mechanisms; they do not certify deployment. |
| m1 | Terminology clarified. | Final801–802 differentiates rule evaluation from notification grouping; E42/E47. |
| m2 | Exact labels retained; applicability still wrong. | Final803–804: E15 supports alertname/datasource_uid/rulename for the independent-instance path only. N2-F4. |
| m3 | Documentation change correctly limited. | Final805–806 identifies EMQX PR18443 as a memory-cost explanation, not a code fix; E09. |
| m4 | Optional Greptime lead preserved. | Final807–808: E21 confirms protocols. Exact standalone tag/bridge versions remain conditional, not made certain by critic silence. |
| m5 | Alerta retained; backend matrix independently confirmed. | Final809–810: E19/E20/E49 support lifecycle and Mongo/Postgres deployment. Custom offline conflict handling remains proposed. |
| m6 | Annotation classification corrected. | Final811–812: MissingSeries is a grafana_state_reason annotation, supported by E16. |
| m7 | Optional vmalert behavior marked uncertain. | Final813–814 does not transfer Grafana NoData/Error semantics to another engine; citation/test required before adoption. |
| m8 | Rollout gates extended. | Final815–816 and1104–1127 add acknowledgement and retention/restore before pilot. This is proposed discipline, not V6 success. |
| m9 | Unknown billing retained as null. | Final817–818 reports no cloud billing observation. N2-F5 concerns a documented product license constraint, not a fabricated bill. |
| m10 | Honest evolution absence preserved. | Final819 and821–870 do not invent uninvestigated VM/Connect/Greptime/Alerta fix chains. Other relevant chains satisfy O3; V7 proposes drift checks. |

No separate material PRESERVATION_LOSS was identified. Incorrect preserved or amplified conditions are recorded under their source/applicability findings rather than counted again. Supported options remain in full prose; a criticism ID alone was not considered a complete treatment.

### Minor findings

**N2-m1: Rollups are understated as KB-MB/year.** Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/control/reviser/final.md`, lines 1013, 1026. At 120 gauges, five-minute rows alone are 120*288*365=12,614,400/year; at the worked100-byte row assumption that is about1.26GB before overhead. Hourly rows add105,120,000bytes. This is still well within the proposed disk range and does not alone invalidate modest hosting; do not use KB-MB to size retention.

Independent derivation: Same explicit assumptions as candidate; aggregate count arithmetic.

**N2-m2: Some QuestDB claims are labeled predecessor-observed S07 although the retained S07 excerpt/map covers O3, not all those claims.** Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/control/reviser/final.md`, lines 257, 273, 704, 732. TIMESTAMP microseconds, designated-key dedup and partition dropping are independently supported by E48/E13/E40; checkpoint backups are supported by E52. The supplied S07 excerpt does not establish those provenance assertions. This is an evidence-locator problem rather than proof the behaviors are false. WAL inclusion and exact backup details still belong to the chosen-version restore check; the final properly requires V8.

Primary [E13](https://questdb.com/docs/concepts/deduplication/), DEDUP UPSERT KEYS; DROP PARTITION; TIMESTAMP; OSS manual checkpoint; capture/hash in source-map.json.
Primary [E40](https://questdb.com/docs/reference/sql/alter-table-drop-partition/), DEDUP UPSERT KEYS; DROP PARTITION; TIMESTAMP; OSS manual checkpoint; capture/hash in source-map.json.
Primary [E48](https://questdb.com/docs/reference/sql/datatypes/), DEDUP UPSERT KEYS; DROP PARTITION; TIMESTAMP; OSS manual checkpoint; capture/hash in source-map.json.
Primary [E52](https://questdb.com/docs/operations/backup.md), DEDUP UPSERT KEYS; DROP PARTITION; TIMESTAMP; OSS manual checkpoint; capture/hash in source-map.json.

**N2-m3: Replaying payloads does not by itself set the MQTT DUP flag.** Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/control/reviser/final.md`, lines 907, 913. mqtt_duplicate metadata represents the MQTT packet DUP flag. Three fresh application publishes with equal payloads can all have DUP=false. The proposal must distinguish an application replay from actual protocol retransmission; it currently under-specifies that leg. Exactly-once store comparison remains useful, and no test is falsely reported executed.

Primary [E10](https://docs.redpanda.com/redpanda-connect/components/inputs/mqtt/), Connect mqtt_duplicate metadata; MQTT retransmission DUP flag; capture/hash in source-map.json.
Primary [E45](https://docs.emqx.com/en/emqx/latest/design/retransmission.html), Connect mqtt_duplicate metadata; MQTT retransmission DUP flag; capture/hash in source-map.json.

**N2-m4: The Grafana12.4.x milestone was available; absence in the critic capture is not disproof.** Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/control/reviser/final.md`, lines 506, 510, 669, 678. Independent API inspection of PR117024 observes milestone12.4.x and a merged commit. The final downgrades to current-docs verified rather than asserting a false release boundary, so this is an unnecessarily unresolved locator, not a material false correction. A milestone is not by itself a complete first-release/backport audit; no exact earliest patch is inferred.

Primary [E18](https://api.github.com/repos/grafana/grafana/pulls/117024), PR117024 milestone, merged_at, merge_commit_sha; capture/hash in source-map.json.

**N2-m5: The static CSV rejection is rhetorically too absolute.** Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/control/reviser/final.md`, lines 624, 637. CSV fixtures can encode late timestamps, duplicate keys and unit traps; they cannot alone exercise broker outages, restart persistence, rule timing, notification routing or concurrent acknowledgements. The final retains CSV as smoke seed and adds those validations, so the scope disposition is sound despite the overly broad wording.

Independent derivation: Assessment of the stated finite fixture and dynamic behavior; not an external product fact.

**N2-m6: VictoriaMetrics five-minute lookback should remain instant-query scoped.** Candidate `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M06-A/control/reviser/final.md`, lines 275, 291. E41 confirms instant-query step defaults5m; range-query lookbehind can instead adapt to the median of the last20 raw-sample intervals. Explicit windows mitigate sparse telemetry; avoid transferring the5m default to every query form.

Primary [E41](https://docs.victoriametrics.com/victoriametrics/keyconcepts/), Instant query step; range-query lookbehind window; capture/hash in source-map.json.

### Honest unresolved scope and grade limits

- **Utility inputs (HONEST_EXTERNAL_UNKNOWN):** Cadence/payload, D4 raw-versus-rollup horizon, backhaul, buffering, clocks, on-call and budget are unprovided. The worked example is explicitly assumed.
- **Runtime and deployment (PROPOSED_NOT_EXECUTED):** All V1–V8 remain unrun. Pinned import/backfill/API/metric/restore compatibility and custom ack conflict handling need execution; no deploy gate is claimed passed.
- **Optional release branches (HONEST_DEFERRED_OPTION):** The NATS2.14 sources extension/MQTT adapter, EMQX5.x/message-expiry details, vmalert semantics and exact Greptime bridge/tag are conditional. Material main-path errors are adjudicated findings, not hidden unknowns.
- **Grafana earliest release (BOUNDED_SOURCE_LIMIT):** PR117024 milestone12.4.x is confirmed; the earliest released patch and all backports are not exhaustively audited. Current documentation and PR scope suffice to adjudicate the final claims; no exact first patch is asserted.

These are product inputs or unexecuted proposals, not hidden unfinished evaluator grading groups. Material defects prevent PASS_WITH_LIMITATIONS. No runtime result or unlimited guarantee is inferred.

## Independent primary-claim coverage

| Arm | Claim and candidate locator | Independent judgment | Primary sources |
|---|---|---|
| N1 | Mosquitto2 listener, authentication, privilege and TLS migration; final29-54;246-253 | Historical migration and configuration defaults are supported. The public-link TLS policy is authored design. | [E01](https://mosquitto.org/documentation/migrating-to-2-0/), [E02](https://mosquitto.org/man/mosquitto-conf-5.html) |
| N1 | Mosquitto persistence, save interval, queue and inflight defaults; final49-54;246-253 | Defaults are supported; explicit persistence/session configuration matters. QoS1 does not prove end-to-end exactly-once delivery. | [E02](https://mosquitto.org/man/mosquitto-conf-5.html) |
| N1 | Mosquitto max_queued_messages=0 regression and released fix; final333-340 | Issue3244 concerns2.0.21 and is fixed in2.0.22 release notes. The chain is relevant; no runtime regression witness was executed. | [E04](https://api.github.com/repos/eclipse-mosquitto/mosquitto/issues/3244), [E34](https://mosquitto.org/blog/2025/07/version-2-0-22-released/) |
| both | JetStream Msg-Id dedup window, duplicate PubAck and expected-state CAS; N1P1/291-293; N2§2.1/P1 | Supported. A bounded transport window or CAS header does not provide permanent application identity outside that window. | [E05](https://docs.nats.io/learn/jetstream/publishing), [E06](https://docs.nats.io/reference/jetstream/api/headers), [E50](https://docs.nats.io/jetstream/concepts/streams) |
| N2 | NATS historical100-ms floor and default1-MiB payload; final138-165;E3 | The floor is in v2.8.1 release notes; v2.14.0 constants and default application confirm1MiB. The sources-window extension remains explicitly uncertain. | [E07](https://api.github.com/repos/nats-io/nats-server/releases/tags/v2.8.1), [E46](https://raw.githubusercontent.com/nats-io/nats-server/v2.14.0/server/opts.go), [E51](https://raw.githubusercontent.com/nats-io/nats-server/v2.14.0/server/const.go) |
| N1 | JetStream hour-scale window memory uncertainty; final187-189 | The final honestly proposes measuring memory and preserves a permanent DB backstop; it makes no free-capacity guarantee. | [E05](https://docs.nats.io/learn/jetstream/publishing), [E50](https://docs.nats.io/jetstream/concepts/streams) |
| N1 | Timescale UTC, chunk defaults, CREATE TABLE modes and unique-key upsert; final43-48;246-263 | Core partition/upsert behavior is supported. N1-m3/m5 qualify release/type claims and N1-F3 identifies the wrong RAM gate. | [E22](https://www.tigerdata.com/docs/reference/timescaledb/hypertables/create_table), [E23](https://www.tigerdata.com/docs/use-timescale/latest/write-data/upsert), [E24](https://www.tigerdata.com/docs/learn/hypertables/sizing-hypertable-chunks) |
| N1 | Timescale Hypercore evolution and conditional compression savings; final98-107;193-204;303-315;341-345 | Legacy APIs remain supported. Up-to98% is an explicitly conditional upper bound, not measured saving for this telemetry. | [E22](https://www.tigerdata.com/docs/reference/timescaledb/hypertables/create_table), [E30](https://raw.githubusercontent.com/timescale/docs/latest/use-timescale/compression/index.md) |
| N1 | Timescale365-day retention and time-column applicability; final98-107 | Scheduled whole-chunk retention is supported. Timestamp columns use INTERVAL; integer time needs a matching integer_now_func. This is not exact row TTL. | [E54](https://www.tigerdata.com/docs/api/latest/data-retention/add_retention_policy) |
| N1 | Grafana states, pending, keep-firing and rule-edit resets; final56-82;153-157 | Supported mechanisms. The chosen evaluation counts are policy seeds, not product defaults. | [E33](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/), [E15](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/) |
| both | Grafana History dependencies, limits and separation from human ack; N1M1/m1/m2;N2P4/M7 | N1 separates a custom ledger correctly. N2-F3 retains an unsupported default ack operation. Prometheus state export does not enable the Loki History UI. | [E17](https://grafana.com/docs/grafana/latest/alerting/monitor-status/view-alert-state-history/), [E33](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/), [E53](https://grafana.com/docs/grafana/latest/alerting/set-up/configure-alert-state-history/) |
| both | Grafana evaluation defaults and periodic save condition; N1m3;N2§2.7/P2 | Numerical values are confirmed;5-minute periodic saving is feature-toggle conditional, N1-m1. | [E43](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/), [E47](https://raw.githubusercontent.com/grafana/grafana/v12.4.0/conf/defaults.ini) |
| N1 | ThingsBoard CE alarms and acknowledgement permissions; final84-96;220-244;286-290 | Core platform semantics are supported. CE customer users may acknowledge permitted entities; the categorical ban is wrong, N1-F1. | [E25](https://thingsboard.io/docs/user-guide/alarms/), [E35](https://thingsboard.io/docs/getting-started/5/), [E38](https://raw.githubusercontent.com/thingsboard/thingsboard/master/application/src/main/java/org/thingsboard/server/controller/AlarmController.java) |
| N1 | ntfy cache, persistent backend, message/action/attachment limits; final182-184;270-272;architectureA | Cache and SQLite/Postgres choices, text/priority/action/attachment limits are supported with hosting conditions. A durable ledger link is a design; ntfy is not the human ack database. | [E26](https://docs.ntfy.sh/config/), [E27](https://docs.ntfy.sh/publish/) |
| N1 | Influxv2 identity and field union; separation from v3; final176-181 | Scoped v2 facts are supported. Influx3 is deferred, so no production v3 semantics are asserted from v2 evidence. | [E28](https://docs.influxdata.com/influxdb/v2/write-data/best-practices/duplicate-points/) |
| N1 | Alertmanager grouping labels and notification timing defaults; final66-71;267 | Timing defaults are supported. The site+gauge aggregation promise is wrong, N1-F2. resolve_timeout is not a universal Prometheus alert lifetime. | [E29](https://prometheus.io/docs/alerting/latest/configuration/), [E42](https://grafana.com/docs/grafana/latest/alerting/configure-notifications/create-notification-policy/) |
| N2 | EMQX MQTT3 expiry versus MQTT5/6.3 cap; final167-201;M1 | The release-scoped correction is supported. Session memory residency is intended behavior and PR18443 is documentation. Older/message-expiry details remain explicitly unpinned. | [E08](https://docs.emqx.com/en/emqx/latest/guides/configuration/mqtt.html), [E09](https://api.github.com/repos/emqx/emqx/pulls/18443) |
| N2 | EMQX queue limit and outage topology; final1013-1023;V3 | The1000-message limit is confirmed; applying it per publishing gauge to a receiving Connect session is wrong, N2-F1. | [E08](https://docs.emqx.com/en/emqx/latest/guides/configuration/mqtt.html), [E45](https://docs.emqx.com/en/emqx/latest/design/retransmission.html), [E10](https://docs.redpanda.com/redpanda-connect/components/inputs/mqtt/) |
| N2 | EMQX current licensing and cluster expansion; final1037-1047 | Current BSL and single-node community constraints conflict with the categorical OSS/license-free expansion claim, N2-F5. | [E37](https://docs.emqx.com/en/emqx/latest/get-started/deploy/license.html), [E08](https://docs.emqx.com/en/emqx/latest/guides/configuration/mqtt.html) |
| N2 | Connect MQTT input defaults, metadata and retransmission; final203-237;M5;V2/V3 | Defaults/fields are confirmed. clean_session=false recovery is not proved by a settings row; the false processor counter is removed. MQTT DUP is not application duplicate identity, N2-m3. | [E10](https://docs.redpanda.com/redpanda-connect/components/inputs/mqtt/), [E45](https://docs.emqx.com/en/emqx/latest/design/retransmission.html) |
| N2 | QuestDB out-of-order method exceptions, WAL recommendation and write amplification; final239-273;V1;M6 | Supported. The non-WAL fix is not proof of WAL immunity or a runtime result; no exact earliest repair release is inferred. | [E11](https://questdb.com/docs/concepts/out-of-order-data/), [E12](https://api.github.com/repos/questdb/questdb/pulls/7285) |
| N2 | QuestDB types, DEDUP UPSERT KEYS, partition deletion and checkpoints; final257-273;P1/P5/V8 | Core mechanisms are supported with WAL/timestamp constraints. The S07 provenance overstatement is N2-m2; restore remains proposed. | [E13](https://questdb.com/docs/concepts/deduplication/), [E40](https://questdb.com/docs/reference/sql/alter-table-drop-partition/), [E48](https://questdb.com/docs/reference/sql/datatypes/), [E52](https://questdb.com/docs/operations/backup.md) |
| N2 | VictoriaMetrics global retention, very-long horizons and backups; final275-310;P5/M8/V8 | Global retention and monthly-partition deletion behavior are supported.100years is very long, not literally infinite; a pinned restore check remains proposed. | [E14](https://docs.victoriametrics.com/victoriametrics/single-server-victoriametrics/) |
| N2 | VictoriaMetrics dedup identity and sparse query lookback; final275-310;P1/V1/V2 | Per-series interval dedup and highest-value timestamp ties do not supply the promised sequence key, N2-F2. Instant5-minute default is valid; range lookbehind can adapt, N2-m6. | [E14](https://docs.victoriametrics.com/victoriametrics/single-server-victoriametrics/), [E41](https://docs.victoriametrics.com/victoriametrics/keyconcepts/) |
| N2 | Greptime ingestion protocols and unified observability alternative; final312-326;optionalD3 | The materially different optional lead is supported. Exact tag and bridge version are conditional; no full production compatibility matrix is asserted. | [E21](https://docs.greptime.com/user-guide/ingest-data/overview) |
| N2 | Alerta lifecycle, acknowledgement history and database options; final81-91;P4;D2 | A viable alternative and Mongo/Postgres deployment are supported. Offline intent-conflict preservation is custom design requiring the proposed test. | [E19](https://docs.alerta.io/api/alert.html), [E20](https://docs.alerta.io/server.html), [E49](https://docs.alerta.io/deployment.html) |
| N2 | Grafana failure-state override, Values−1 and independent Datasource instances; final489-511;V4 | Individual facts are valid; their combined chosen configuration is wrong, N2-F4. Pending behavior is verified and the12.4 milestone is available, N2-m4. | [E15](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/), [E18](https://api.github.com/repos/grafana/grafana/pulls/117024) |
| N2 | Grafana missing-series eviction, annotations and notification labels; final327-377;514-536 | Supported with managed-rule and configuration conditions. A per-gauge absence rule is still a design that must be configured; physical zero is not required. | [E16](https://grafana.com/docs/grafana/latest/alerting/guides/missing-data/), [E15](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/), [E42](https://grafana.com/docs/grafana/latest/alerting/configure-notifications/create-notification-policy/) |
| both | Modest hosting estimates and operational-triage constraints; N1conditions294-321;N2§7 | These are assumed estimates, not executed benchmarks. No actuation is retained. Arithmetic and applicability errors are identified explicitly; measured capacity is not inferred. | [E24](https://www.tigerdata.com/docs/learn/hypertables/sizing-hypertable-chunks), [E08](https://docs.emqx.com/en/emqx/latest/guides/configuration/mqtt.html), [E14](https://docs.victoriametrics.com/victoriametrics/single-server-victoriametrics/) |
| both | Meaningful proposed validation versus actual execution; N1V0-V11;N2V1-V8 | Only document reads are reported executed. Row/trace/restore oracles are generally meaningful; N2V4 applicability and V2 DUP expectations are defective. No VALIDATION_OVERCLAIM is assigned. | [E04](https://api.github.com/repos/eclipse-mosquitto/mosquitto/issues/3244), [E12](https://api.github.com/repos/questdb/questdb/pulls/7285), [E15](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/), [E17](https://grafana.com/docs/grafana/latest/alerting/monitor-status/view-alert-state-history/), [E18](https://api.github.com/repos/grafana/grafana/pulls/117024), [E34](https://mosquitto.org/blog/2025/07/version-2-0-22-released/) |

## Comparative and operational limits

N1 retains a coherent custom acknowledgement ledger and one year of raw measurements. Its ThingsBoard permission exclusion, notification grouping and RAM sizing condition remain wrong. N2 has richer split-store, upgrade and restore proposals and several valid release corrections, but its queue topology, VM identity, default ack path, NoData oracle and current EMQX edition/budget applicability remain defective. These differences do not establish equal quality or a winning method. Comparative full-quality eligibility is false.

Both candidates explicitly distinguish source reads from proposed runtime validation. This reviewer performed source retrieval, text/hash checks and arithmetic, not candidate-system execution. Candidate native/T3 completion, exact timings, token usage and actual billing remain null/unknown apart from the input-map delivery/artifact flags. Reviewer actual Goal activation and active status were observed through supported tools. This full saved assessment precedes terminal completion; the terminal receipt belongs to the tool transcript, not handwritten Goal JSON. No scientific work follows the terminal event.

Current documentation is qualified by access date and hashes. Tagged code, release notes and merged PR symbols narrow relevant claims. ThingsBoard master code is only corroboration; the CE guide establishes the permission finding. The observed Grafana12.4.x milestone is not an exhaustive first-patch/backport audit. Failed locators E03/E31/E32/E44 are source-operation failures, not evidence of absent product behavior. Only bounded relevant evidence is retained.

assessment.json contains every rubric field, six axes per arm, full findings, criticism dispositions and plan comparisons. source-map.json contains frozen inputs and all source-operation/evidence hashes. evidence/index.md navigates the bounded primary captures.
