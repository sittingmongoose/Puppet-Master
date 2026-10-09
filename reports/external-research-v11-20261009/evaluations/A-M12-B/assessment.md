# Fresh independent assessment — A-M12-B / S06

**N2/control: FAIL (complete scientific assessment). N1/treatment: NO_DELIVERY; scientific quality null. Comparative quality/speed eligibility: false.**

The control final has useful discovery, coherent plan comparisons and honest proposed validation, but four material source-grounded defects remain. The treatment map declares no scientific artifact and no final; that is a delivery result, not a scientific FAIL. This assessment does not repair either candidate and does not infer a method winner.

## Inputs and boundaries

The exact assignment and input map, original S06 brief, exact frozen P1–P6 plan, rubric, every mapped stage artifact and every permitted source-root file were read. Every supplied file digest/byte length matches. Full digests are saved in assessment.json and source-map.json. Complete discovery, draft, critique and final were examined in full, including source indexes. The N1 source index contains no entries; no discovery/draft/critique/final is mapped. No other evaluations/cases/campaign records or private provider internals were inspected. Required repository-context inspection did not contribute scientific evidence. No candidate, repository canon, Git, account/configuration or service was changed; no worker or downloaded executable was used.

Neutral labels provide only partial blinding: the map, paths, stage headers and treatment assignment expose actual arms and recipe clues. Citation counts, inherited quote agreement, output length and file existence are not the scientific grade. Independent public-primary docs, released code and release metadata govern the material judgments. Current redirects include QuestDB concept→concepts and Grafana→grafana-cold-storage; requested/effective URLs, UTC access times, response hashes and version/symbol locators are in source-map.json.

## Six-axis assessment of N2

### Axis 1

**Coverage:** FULL: original brief, O1-O6, all explicit constraints and both delivery states inspected.

Control substantially addresses discovery, products/mechanisms, release behavior, outages, expansion, all P clauses and proposed checks. O2 has consequential omissions M1/M4; O4 has the unsupported mandatory cap correction M3; O5 inherits M2 and bounded preservation losses. Small-product scope is respected; no safety-control system or unrestricted guarantees are demanded.

### Axis 2

**Coverage:** FULL relevant primary-claim coverage for the complete control final; current docs and stable released code independently read.

FAIL: M1-M4 are consequential dependencies/defaults/identity/application errors or omissions. Main duplicate/upsert, alarm-history, dead-man, Mosquitto migration, and retired-product findings are supported. Exact source uncertainty is distinguished from wrong claims and reviewer source limits.

### Axis 3

**Coverage:** FULL: all discovered product/mechanism families, optional leads and meaningful differences examined.

Useful unfamiliar discovery is present: integrated IoT versus composed time-series/alert stack, SCADA pathways, absence layer, protocol-state hypothesis, push/on-call layers and lifecycle dead end. These are product/mechanism alternatives, not citation-count evidence. Conditional firmware/protocol and audit-feature caveats are appropriate; edition/delivery-cost conditions and one lost ingestion-time option weaken comparison.

### Axis 4

**Coverage:** FULL: every exact P1-P6 clause and all stated vocabulary dispositions independently reviewed.

P3 numeric zero-fill rejection and P6 smoke-test retention/extra validation are justified. P1 architecture survives but M1/M3 weaken its corrections; P4 gains invalid tuple M2; P5 default coverage is incomplete M4. P2 timestamp clarification is justified; hysteresis/severity is a useful policy option, not a proven mandatory rejection of one fixed threshold. No wholesale unsupported rejection of MQTT, thresholding, local-first ack, a year horizon or static-input replay is inferred.

### Axis 5

**Coverage:** FULL: complete discovery→draft→critique→final comparison and each F1-F13 verdict checked against source and text.

Most supported authored findings, alternatives, constraints and uncertainty are preserved. M1 source dependency and m1 exception disappear; m2 records other bounded prose losses. F10 is invalid in its key sufficiency; F1/F3/F4/F9 need reviewer qualifications. The final is coherent prose rather than an ID-only shell, but all-accepted criticism does not make it scientifically correct.

### Axis 6

**Coverage:** FULL: every V1-V8 and additional source proposal inspected; executed-versus-proposed statement checked against available artifacts.

No executed runtime witness or validation overclaim found. Proposals contain real discriminators and proposed oracles; V2 crash/stop qualification is missing and V6 misses recurrence. HTTP retrieval, file reads/greps/hashes and text comparison are scientific source operations, not deployed-system tests. No runtime was present in the frozen assessment input; absence is treated honestly.

## Material findings

### M1 — The prescribed Telegraf persistence change omits the required client identity and end-to-end QoS conditions

Type: MATERIALLY_INCOMPLETE; severity: high; obligations: O2, O5, outage recovery, P1.

Candidate: [final.md](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M12-B/control/reviser/final.md:74), lines 74–95: - **Duplicates are designed in.** MQTT QoS 1 ("at least once") manufactures duplicates;
  Telegraf's `qos` defaults to 0 (lossy), and its doc says "with QoS 1 or 2, you should
  enable persistent_session to allow resuming unacknowledged messages";
  `max_undelivered_messages` caps unwritten messages at 1000. Duplicate handling is
  therefore a required, explicit design choice. Storage models differ and are **not
  equivalent**: VictoriaMetrics `-dedup.minScrapeInterval` thins per interval and
  tie-breaks equal timestamps to "the sample with the biggest value"; QuestDB
  `DEDUP ENABLE UPSERT KEYS(ts, gauge_id)` does key-based upsert (WAL table +
  designated timestamp required; "If keys match, compares the full row content" —
  identical rows skip the write, differing rows are replaced). Only key/upsert preserves
  a retransmitted *corrected smaller* reading; VM's biggest-value tie-break shadows it.
- **Out-of-order/late.** Late-but-newer-timestamped data is stored by VM
  ("stores all the ingested samples to disk even if -dedup.minScrapeInterval … is set");
  dedup applies at merge/query time. ThingsBoard is the one fetched source stating the
  alarm-timestamp choice explicitly (telemetry time, not processing time) — operationally
  right for triage, but dashboards can show alarms "in the past" after backlog drain.
  Mosquitto `max_inflight_messages = 1` trades throughput for strict per-client ordering.
- **Outage recovery — the defaults trap.** Mosquitto `persistence` **defaults to
  false** (queued QoS 1/2 messages die with the broker), `autosave_interval` 1800 s,
  per-client `max_queued_messages` 1000; Telegraf `persistent_session` false and
  `max_undelivered_messages` 1000. Every default in the discovered chain is tuned for
  lossy ephemeral telemetry; all four must be explicitly overridden for durable triage.

This is an incomplete operational correction, not a demand for a full deployment recipe. The final expressly prescribes enabling persistent_session but never states client_id. In both the independently fetched master implementation and released v1.36.1, Init returns an error when persistent_session is true and ClientID is empty. The README also requires QoS 1 or 2 at the consumer and publisher to receive offline messages. Mentioning the lossy QoS-0 default elsewhere does not state those conditions. The frozen source excerpt already contained the client_id dependency; neither the critic nor final carries it into the correction. Applying the named changes alone can prevent startup or leave recovery ineffective.

Primary basis: [E02: persistent_session/client_id/qos configuration comments](https://raw.githubusercontent.com/influxdata/telegraf/master/plugins/inputs/mqtt_consumer/README.md) (Mutable public document/branch captured independently on 2026-10-09; response digest identifies the fetched edition, not a release pin); [E03: MQTTConsumer.Init; createOpts; onDelivered](https://raw.githubusercontent.com/influxdata/telegraf/v1.36.1/plugins/inputs/mqtt_consumer/mqtt_consumer.go) (Telegraf v1.36.1; release published 2025-09-09 (E26)); [E20: persistent_session/client_id publishing and subscription QoS conditions](https://raw.githubusercontent.com/influxdata/telegraf/v1.36.1/plugins/inputs/mqtt_consumer/README.md) (Telegraf v1.36.1).

The frozen retained source itself already recorded the missing dependency: [S01-S04-storage-transport-alerting-excerpts.md](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M12-B/control/reviser/sources/S01-S04-storage-transport-alerting-excerpts.md:41), lines 41–45.

### M2 — The webhook dedup/join key cannot distinguish recurring occurrences of the same alert

Type: MATERIALLY_WRONG; severity: high; obligations: O2, O5, acknowledgement history, duplicates, P4.

Candidate: [final.md](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M12-B/control/reviser/final.md:199), lines 199–201: **Amended-in (F10): a webhook-fed custom ack table needs delivery-level dedup —
Alertmanager re-notifies on the repeat_interval cadence, so the join key is
groupKey + fingerprint + status, not the ack event ID alone.** Alertmanager alone does

The tuple identifies a routing group, label-defined alert and firing/resolved state. Released Alertmanager GroupKey derives from routeKey and grouping labels; the fingerprint derives solely from the alert label set. Neither includes occurrence time. Two HighPressure alerts for the same gauge and route, separated by clearing, have the same firing tuple although startsAt differs. Using the stated tuple for delivery-level dedup or as the only audit join identity can collapse a new incident into an earlier acknowledged one. Webhook-repeat handling is needed, but F10 introduced a consequentially insufficient key and the final accepted it without a source check of identity scope. This counterexample follows from the primary identity functions; it is an analytical counterexample, not an executed backend test.

Primary basis: [E04: webhook_config groupKey, alerts.fingerprint, startsAt, endsAt](https://prometheus.io/docs/alerting/latest/configuration/) (Mutable public document/branch captured independently on 2026-10-09; response digest identifies the fetched edition, not a release pin); [E06: aggrGroup.GroupKey](https://raw.githubusercontent.com/prometheus/alertmanager/v0.28.1/dispatch/dispatch.go) (Alertmanager v0.28.1); [E18: model.Alert.Fingerprint](https://raw.githubusercontent.com/prometheus/common/v0.61.0/model/alert.go) (prometheus/common v0.61.0; exact dependency of Alertmanager v0.28.1 (E30)); [E30: prometheus/common v0.61.0 dependency](https://raw.githubusercontent.com/prometheus/alertmanager/v0.28.1/go.mod) (Alertmanager v0.28.1 go.mod).

### M3 — All-four-defaults-must-change conflates broker queue loss with Telegraf flow control

Type: FALSE_CORRECTION_OR_REJECTION; severity: moderate; obligations: O2, O4, modest self-hosted budget, outage recovery, P1.

Candidate: [final.md](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M12-B/control/reviser/final.md:91), lines 91–95: - **Outage recovery — the defaults trap.** Mosquitto `persistence` **defaults to
  false** (queued QoS 1/2 messages die with the broker), `autosave_interval` 1800 s,
  per-client `max_queued_messages` 1000; Telegraf `persistent_session` false and
  `max_undelivered_messages` 1000. Every default in the discovered chain is tuned for
  lossy ephemeral telemetry; all four must be explicitly overridden for durable triage.

The Mosquitto queue limit can drop later messages when its queue fills, so capacity sizing is relevant. Telegraf max_undelivered_messages is a bound on outstanding tracked delivery, with semaphore backpressure rather than an instruction to discard every reading above 1000. The default is not inherently an ephemeral/lossy mode. Its README warns that too low a value can prevent flushing and too high a value affects batching. Whether either cap needs increasing depends on reporting cadence, outage duration, batching and memory; none is given for the 120-gauge fleet. Explicit persistence/session/QoS choices are justified, but mandatory changes to both caps, including the expressly prescribed broker-queue increase, are not a source-supported correction to P1. This matters to reliability and the stated modest budget, rather than merely wording.

Primary basis: [E01: max_queued_messages; max_queued_bytes; persistence](https://mosquitto.org/man/mosquitto-conf-5.html) (Mutable public document/branch captured independently on 2026-10-09; response digest identifies the fetched edition, not a release pin); [E03: Start creates bounded semaphore; onMessage blocks on semaphore; onDelivered releases slot](https://raw.githubusercontent.com/influxdata/telegraf/v1.36.1/plugins/inputs/mqtt_consumer/mqtt_consumer.go) (Telegraf v1.36.1; release published 2025-09-09 (E26)); [E02: max_undelivered_messages relation to metric_batch_size](https://raw.githubusercontent.com/influxdata/telegraf/master/plugins/inputs/mqtt_consumer/README.md) (Mutable public document/branch captured independently on 2026-10-09; response digest identifies the fetched edition, not a release pin).

### M4 — The selected primary store's retention default is absent from the one-year investigation

Type: MATERIALLY_INCOMPLETE; severity: moderate; obligations: O2, O4, P5.

Candidate: [final.md](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M12-B/control/reviser/final.md:211), lines 211–227: ### P5: "Keep data for a year."

**Disposition: already-covered for telemetry by the P1 storage choices, with
corrections and user decisions.** Corrections: (1) the clause covers telemetry only by
implication — ack/audit history has its own retention requirement and should live as
long or longer; (2) "keep" must state resolution — raw year vs downsampled year; (3)
ThingsBoard's telemetry TTL default was not captured in fetched sources and must be
configured explicitly whichever platform is chosen. **Wording correction (F7):** no
sizing adjective stands in this final — whether a year of 120 gauges fits the budget
box is exactly what proposed V7 measures; no fetched source quantifies bytes/sample
for these engines, and no sizing claim is made. Conditions: retention policy must
state its interaction with dedup/downsampling (VM's `-dedup.minScrapeInterval=D`
equivalence to `-downsampling.period=0s:D`); late backfills near the retention
boundary. Alternatives retained: raw-then-downsample tiering; QuestDB + cold copies;
ThingsBoard with configured TTL + PostgreSQL. User decisions: retention resolution;
ack-log retention period; regulatory duties for water utilities (out of scope,
flagged). Validation: proposed V7, honestly labeled synthetic.

VictoriaMetrics is a primary recommended P1 option, yet the final never investigates or states its retentionPeriod default of one month (31 days), or qualifies P5's already-covered statement on setting a one-year policy. The primary docs explicitly expose that governing default and the y/month duration convention. One-year capacity is not the same as one-year default behavior. The final discusses resolution and sizing and admits missing ThingsBoard TTL evidence, but it leaves the selected store's central default unexamined. This is an O2 research omission directly on an exact P clause, not a requirement to produce sizing numbers or a complete implementation. ThingsBoard/PostgreSQL's default 0 seconds (never expire) is also available in a dedicated primary retention recipe, illustrating that the unresolved TTL question is researchable rather than externally unknowable.

Primary basis: [E09: Starting VictoriaMetrics: retentionPeriod default; Retention: backfill acceptance and unit suffixes](https://docs.victoriametrics.com/victoriametrics/single-server-victoriametrics/) (Mutable public document/branch captured independently on 2026-10-09; response digest identifies the fetched edition, not a release pin); [E22: PostgreSQL SQL_TTL_TS_TS_KEY_VALUE_TTL and cleanup interval](https://thingsboard.io/docs/recipes/configure-telemetry-ttl/) (Mutable public document/branch captured independently on 2026-10-09; response digest identifies the fetched edition, not a release pin).

## Every exact plan disposition

**P1: Ingest MQTT readings into a time-series database.** Final lines 119-142; candidate disposition: already-covered architecture + corrections + user decisions.

Architecture and two primary database alternatives fit. QuestDB late-enablement condition is correctly repaired. Persistence is a justified concern; proposed Telegraf changes omit required identity/QoS (M1), mandatory cap changes are not justified (M3). Timestamp/units/device identifiers are appropriate conditions. TLS choice may remain a user decision for this brief; complete security hardening is not required. Sparkplug/InfluxDB/gauge firmware stay qualified. Primary evidence: E01, E02, E03, E08, E09, E10, E20, E23, E29 (resolved to exact URLs/versions/symbols in source-map.json).

**P2: Alert when the latest reading exceeds one fixed threshold.** Final lines 144-163; candidate disposition: correction as sole mechanism; core already-covered; user decisions.

Timestamp-governed latest and notification-noise investigation fit the late/disordered data brief. Keeping threshold baseline is correct. Hysteresis/severity bands are useful optional policy choices rather than evidence that a single threshold is inherently unintelligible. Alertmanager is correctly made the router, not evaluator. ThingsBoard start-time semantics do not establish current latest-value handling; the stated event-time design and future replay remain proposals. Timeout exception omitted (m1). Primary evidence: E04, E07, E21, E38, E40 (resolved to exact URLs/versions/symbols in source-map.json).

**P3: Missing readings count as zero.** Final lines 165-187; candidate disposition: rejected as written; stale/unreachable correction.

Sound rejection of fabricated measurement data: an observed zero and absent reading are distinct, including under late backfill. ThingsBoard inactivity and Healthchecks Period/Grace give relevant mechanisms. The draft display-only qualification disappears (m2). Grouping is a relevant noise tool, but not proof of pipeline cause (m5). Grace/suppression and clock choices remain conditions/user decisions. No demand to reinstate numeric zero-fill is justified. Primary evidence: E07, E13, E23, E04, E06 (resolved to exact URLs/versions/symbols in source-map.json).

**P4: Clients acknowledge an alert locally then sync.** Final lines 189-209; candidate disposition: correction for audit/conflicts; platform primitives; user decisions; device-client reading uncertain.

The operator-client reading, persistent server audit, offline replay and concurrency/escalation decisions are relevant and retained. ThingsBoard primitives are supported; GoAlert history caveat remains. Alertmanager silences alone do not implement per-incident operator ack history. The added dedup/join identity is materially insufficient for recurrence (M2); V6 does not include that case. Acknowledgement notes and handover are optional enhancements, not required control-plane changes. Primary evidence: E07, E04, E06, E18, E17 (resolved to exact URLs/versions/symbols in source-map.json).

**P5: Keep data for a year.** Final lines 211-227; candidate disposition: already-covered telemetry; audit/resolution corrections and user decisions.

Keeping the requested horizon and distinguishing telemetry resolution from acknowledgement history are useful. No unsupported sizing assertion survives. However capability is confused with default coverage: selected VM defaults to one month and the investigation does not state its one-year configuration condition (M4). TB/PostgreSQL TTL is researchable. Tiered downsampling needs an edition and gauge-information-loss qualification (m6). Unknown sampling cadence/resource size/regulatory duties can honestly remain unknown. Primary evidence: E09, E22, E33 (resolved to exact URLs/versions/symbols in source-map.json).

**P6: Validate with a static sample CSV.** Final lines 229-241,263-292; candidate disposition: retain as smoke test; correction/reject sufficiency.

The exact clause is not wholesale rejected: replay can retain a static input file while changing order/delays and asserting pathologies. Dynamic transport/outage and ack cases provide legitimate extra coverage; a static CSV can itself encode duplicates/disorder, as the final recognizes. V8 adds a relevant QuestDB counterpart. V2 needs stop-mode/session prerequisites (m4). No executed runtime validation is claimed. Primary evidence: E01, E03, E08, E09, E07, E04 (resolved to exact URLs/versions/symbols in source-map.json).

## Criticism: independent accept/reject adjudication

The final accepted every critic row, but their premises and amendments were independently checked. A critic not re-fetching a sentence is not a scientific refutation, and quoted agreement does not establish applicability.

**F1 — partly accept, reject literal total-absence premise.** Locators: critic 26-37; draft 91-93; final 301. Payload measurement time should be explicit at the ingest boundary. But the draft already required the CSV schema to carry device ID, telemetry timestamp and value and described payload-aware replay. Thus never explicit anywhere is overstated. The final clarification is useful; a full scientific grade should not rely on the critic's faulty universal premise. Primary basis: E23, E02.

**F2 — accept with qualification.** Locators: critic 38-44; final 183-185,302. Clock error affects event-time ordering and staleness windows. No clock handling was in the predecessor. Gateway stamping is a retained alternative; NTP on every physical sensor is not an externally mandated product requirement. Primary basis: E23, E07.

**F3 — accept retained qualification; reject claimed retrieval prohibition.** Locators: critic 45-52,155-157; final 53-57,303. Honest optional-lead confidence is correct. The assignment bans executable/installers, not PDF evidence. Public tagged AsciiDoc directly supports the conditional mechanism, so verification was feasible without a binary. Primary basis: E29, E25.

**F4 — accept QuestDB amendment; reject implication VM needs before-first-data.** Locators: critic 53-60; draft 13; final 127-132,304. QuestDB enables on an existing table but does not retroactively dedup existing rows. VM query/merge dedup applies to already stored data. The final's engine-specific wording is better than both the draft common condition and critic's suggestion VM was closer to requiring early enablement. Primary basis: E08, E09.

**F5 — accept as useful additional discriminator.** Locators: critic 61-68; final 285-287,305. V1 tests VM greatest-value tie breaking. V8 tests QuestDB keyed replacement of a smaller corrected value. This strengthens the decision without implying every optional product needs a full suite. Primary basis: E08, E09.

**F6 — accept correlation/noise concern, qualify causal inference.** Locators: critic 72-77; final 176-179,306. A shared outage can produce many stale signals. Group batching is supported; concluding one pipeline-down cause is a further product rule requiring pipeline evidence and scope, not a property of group_by. Primary basis: E04, E06.

**F7 — accept.** Locators: critic 78-82; draft 75; final 218-227,307. No cadence or resource measurements justify a year is modest. The final removes that phrase and keeps synthetic sizing proposed. The reviewer does not demand fabricated bytes/sample. Primary basis: E09.

**F8 — accept.** Locators: critic 83-86; final 154-158,308. vmalert/Prometheus evaluate expressions; Alertmanager routes/groups. The final corrects the loose naming. Primary basis: E04, E21.

**F9 — accept historical verification distinction, reject epistemic promotion of critic non-fetch.** Locators: critic 87-90; final 157-158,309. The sentence exists both in the frozen research excerpt and independently fetched primary configuration. Critic not re-capturing it does not make the behavior unsupported. Retaining the caveat is harmless; evidence agreement/count is not a validity oracle. Primary basis: E04.

**F10 — accept repeat-delivery concern, reject sufficient-key amendment.** Locators: critic 91-95; final 199-201,310. Repeat notifications need handling, but groupKey+fingerprint+status omits incident occurrence and collapses recurrence. The source functions refute sufficiency; accepting this critic proposal introduced M2. Primary basis: E04, E06, E18, E30.

**F11 — accept retained alternative-specific uncertainty.** Locators: critic 96-97; final 68-70,204-206,311. README supports on-call/escalations, not a fully researched acknowledgement history/conflict model. The final keeps that caveat, so optional GoAlert uncertainty is not itself a material failure. Primary basis: E17, E35.

**F12 — accept scope/user-decision treatment; reject evidence-absence as universal security restriction.** Locators: critic 98-101; final 137-142,312. TLS choices need not be completely specified for this brief. Absence in retained excerpts is not absence of primary documentation: the Mosquitto man page and Telegraf README contain TLS/auth material. The final makes no unsupported specific posture recommendation. Primary basis: E01, E02.

**F13 — accept.** Locators: critic 102-106; final 62-66,313. README maintenance 2025-03-11/archive 2026-03-24 and GitHub read-only banner June 5 2026 are separate documented events. Excluding a retired product for a new dashboard is a justified planning decision. Primary basis: E11.

The critic's declared invalid-demand list is also assessed: demanding fabricated runtime results or universal sizing numbers would indeed be invalid. A blanket prohibition on Sparkplug clause verification is not in the exact assignment. Resolving every optional InfluxDB/GoAlert feature is not required before retaining an honest lead; required selected-path research cannot be excused merely because a predecessor README omitted it. No criticism is treated as automatically correct.

## Preservation and discovery

Most discovery and draft content survives in coherent self-contained prose. The all-accepted critic ledger does not establish scientific validity; some critic premises were overstated and F10 introduced a material defect.

Retained in material prose: modest self-hosted 120-gauge operational-triage constraints; late/out-of-order/duplicate input properties; lean stack versus integrated IoT versus SCADA approaches; VM-versus-QuestDB correction/upsert distinction; ThingsBoard acknowledgement/history primitives; dead-man absence mechanisms; GoAlert/ntfy delivery leads; OnCall retirement and Mosquitto release chain; Sparkplug/InfluxDB optional-lead uncertainty; all six exact P clauses with named dispositions; audit/retention/conflict/units/cadence/channel user decisions; V1-V7 plus added QuestDB V8, all proposed.

Checked changes/losses: F4 QuestDB overcondition corrected; F8 evaluator/router wording corrected; F7 unsupported sizing adjective removed; F1 timestamp condition clarified although critic total-absence premise was overstated; F10 introduced insufficient webhook tuple (M2); retained-source client_id dependency did not reach final correction (M1); retained-source resolve_timeout exception did not reach final triage tuning (m1); ingestion-time VM option, session-expiration housekeeping, display-only zero-fill uncertainty and Sparkplug runtime proposal omitted (m2).

Unfamiliar discovery is useful for this small brief: native platform acknowledgement versus a composed audit layer, key-based replacement versus interval thinning, absence alerts versus numerical thresholds, and transport-state/lifecycle alternatives. Physical protocol fit, GoAlert audit features, SCADA modules and InfluxDB write behavior are conditional leads, not established production selections. The reviewer does not require every alternative to be adopted or benchmarked. Optional investigations and future expansion are retained without turning the triage dashboard into automated safety control.

## Proposed versus executed validation

No runtime/sandbox witness is present in the frozen input, and the final explicitly says none ran. Reported source retrieval/read/grep/hash work is not backend validation. The reviewer likewise ran no gauge, broker, TSDB, alarm or acknowledgement stack. Every listed V below is proposed; no passing runtime result or scientific proof is inferred from a zero shell exit or successful fetch.

**V1** (final 268-270): meaningful. A smaller corrected retransmit with identical timestamp and labels discriminates VM maximum-value tie break from last-write semantics. Ensure no confounding later timestamp in the same interval and query the retained raw winner, not an unrelated aggregation. Primary basis: E09.

**V2** (final 271-273): meaningful base comparison; incompletely specified crash-window claim. Persistence true/false under established durable QoS subscription can discriminate restart retention. Graceful restart writes the database on exit, so loss-window measurement needs a controlled unclean stop and known save timing (m4/M1). Primary basis: E01, E03, E20.

**V3** (final 274-276): meaningful but narrow. A delayed known telemetry timestamp versus known processing time can discriminate documented Start Time. It does not alone prove that an older reading cannot change the current threshold alarm or latest telemetry; final P6 additionally proposes ordered/disordered/gap replay. Primary basis: E07.

**V4** (final 277-278): useful proposed policy test. Threshold oscillation and grouped-notification timing can discriminate suppression policies. No universal oracle for operator-appropriate thresholds exists before user cadence/severity decisions. resolve_timeout needs its producer exception (m1). Primary basis: E04, E21.

**V5** (final 279-280): meaningful with an explicit missing-state oracle. Absence/inactivity can be discriminated from value-only rules after the appropriate grace and query-staleness window. Silent threshold behavior depends on configured rule semantics. The final P6 also requires actual-zero versus gap and late-true-reading expected outcomes; zero-fill could trigger a separate low-value alarm, so observing only threshold silence is not universal proof. Primary basis: E07, E13, E09.

**V6** (final 281-282): meaningful proposed ack conflict/audit test; recurrence not covered. Concurrent attempts and escalation exercise user-selected conflict policy and audit persistence through clear. One winner/both attempts is a proposed policy oracle, not a documented universal ThingsBoard promise. It does not discriminate the recurring-alert key collision (M2). Primary basis: E07, E06, E18.

**V7** (final 283-284): meaningful bounded sizing proposal. Synthetic workload bytes/query latency can compare resolution/dedup settings. It is not proof of year-long behavior or production size; reporting cadence, value entropy, retention boundary and storage overhead matter. No runtime or universal resource guarantee is required. Primary basis: E09, E22, E33.

**V8** (final 285-287): meaningful. Same (ts,gauge_id) key with a corrected smaller value discriminates QuestDB replacement from VM maximum-value tie break, after ensuring a WAL table and enabled dedup and read visibility. Primary basis: E08, E09.

**additional_source_checks** (final 289-292): research proposals, not runtime validations. Primary Alertmanager text and tagged non-PDF Sparkplug clauses were available to the reviewer; GoAlert ack/audit feature research remains optional for a nonselected lead. Primary basis: E04, E29, E17.

The proposed late/disordered/gap replay in P6 is meaningfully broader than V3's alarm-Start-Time test. It still supplies no executed oracle that a stale historic measurement cannot overwrite the current state. V1/V8 have clear competing database outcomes; V6 has a user-selected audit/conflict oracle but omits the recurring-incident countercase exposed by M2. Honest nonexecution is credited.

## Minor findings and qualifications

**m1 — resolve_timeout is accurately quoted but loses its governing exception** (APPLICABILITY_QUALIFICATION_LOSS, minor; final lines 96–99). resolve_timeout governs alerts without EndsAt and has no effect on Prometheus alerts that include EndsAt. The retained S04 excerpt states this exception, but the final groups the 5m value with universally relevant triage tuning. Released vmalert also supplies End/endsAt. I do not elevate this alone to material failure because the final does not explicitly claim that 5m controls expiry for every selected producer. Primary basis: E04, E38, E40.

**m2 — VM ingestion-time dedup alternative and several source qualifications disappear from final prose** (PRESERVATION_LOSS, minor; final lines 74–89). The final preserves the principal VM-versus-QuestDB decision but omits the separately discovered VM ingestion-time option, the persistent-client-expiration housekeeping caveat, the draft's explicit display-only interpretation of P3, and discovery's Sparkplug dropped-sequence runtime proposal. These are genuine bounded preservation losses. They do not erase the coherent main alternatives and are not independently used as material fail triggers. Primary basis: E09, E01.

**m3 — The claimed ban on a Sparkplug PDF was not in the mapped assignment** (UNSUPPORTED_CONFIDENCE_OR_SCOPE_RATIONALE, minor; final lines 53–57). The actual mapped research/critic assignments prohibit downloaded executables/installers, not public PDF documents. A tagged primary AsciiDoc source is available in any case. Keeping Sparkplug as a qualified optional lead is honest and acceptable; the invented prohibition is not evidence of external unavailability. The primary specification confirms wrapping seq and conditional timeout/rebirth, while leaving host processing choices and bdSeq birth/death matching distinct. No core selected-path correction relies on adoption, so this does not itself cause FAIL. Primary basis: E29.

**m4 — V2 needs a crash-versus-graceful-stop distinction to measure autosave loss windows** (PROPOSED_VALIDATION_LIMIT, minor; final lines 271–273). The comparison can expose persistence false versus true. A graceful broker restart saves at shutdown; it does not by itself measure the unsaved crash window. Established durable subscription, matching publisher/subscriber QoS, controlled stop mode and timing, and message identity are also needed for a discriminating oracle. All work is clearly proposed, so this is not an executed-validation overclaim. Primary basis: E01.

**m5 — Grouping is supported; a pipeline-down diagnosis is an additional inference** (APPLICABILITY_LIMIT, minor; final lines 176–179). group_by can batch compatible stale alerts. It does not establish their cause or create a new pipeline-health signal. A selected grouping scope and independent pipeline/gateway condition are unspecified. I treat this as an underspecified prospective product rule, not as proof that the candidate claimed an implemented root-cause classifier. Primary basis: E04, E06.

**m6 — Optional tiered downsampling and SMS/voice need budget/edition conditions** (APPLICABILITY_LIMIT, minor; final lines 224–225). VM age-tiered downsampling is an enterprise feature, unlike ordinary interval dedup; it also drops intermediate gauge changes. GoAlert can be self-hosted while its SMS/voice leg relies on an external provider. The final leaves these as options and does not promise free license/communication costs; missing conditions weaken their comparison but do not invalidate the primary lean-stack option. Primary basis: E33, E35.

**m7 — QuestDB constraints alone do not establish a recent narrowing evolution chain** (UNSUPPORTED_DESCRIPTOR, minor; final lines 108–110). The requirements support current applicability, not an independently demonstrated sequence of narrowing releases. The documented Mosquitto 1.x-to-2.0 change already satisfies O3, so this weak descriptor does not leave the evolution obligation unfulfilled. Primary basis: E08.

## N1 treatment: all axes ungradable

The exact input has final=null, final_delivery=false and scientific_artifact_available=false; it maps only research assignment/input-map files and a source root whose index has no sources. For each of axes 1–6 there is no authored scientific content from which to assess obligation coverage, facts, discovery, plan disposition, preservation or validation. Scientific grade is null, delivery grade is NO_DELIVERY, and no material scientific findings are manufactured. No unpublished activity, quality, runtime result or effort is inferred. All six scientific axes remain ungradable if a future artifact is supplied. This does not erase the complete counterpart assessment.

## Actual coverage, remaining scope and limits

Control assessment coverage is complete for the supplied scientific final: all O1–O6, all exact P clauses, all consequential source/applicability propositions, every useful discovery family, all F1–F13 criticism treatments, preservation transitions and every V1–V8 proposal were checked. The detailed claim-level primary coverage is preserved in assessment.json/source-map.json; none remains awaiting reviewer investigation. FAIL is driven by M1–M4, not by an incomplete-review HOLD/PARTIAL or unavailable runtime.

Remaining product uncertainties are distinct from unfinished assessment: real sensor cadence/clock/firmware, chosen deployed versions/editions, optional SCADA and GoAlert audit fit, InfluxDB duplicate semantics, regulatory duties, actual memory/disk performance and all proposed runtime validations. These do not justify pretending the final works, nor do they demand unlimited production guarantees. Primary docs/code establish the precise material defects without a deployed-system witness. Mutable pages can drift; released source dependencies are pinned where used.

## Delivery, native completion, time and cost

Final delivery/artifact flags are taken from the exact frozen input. Candidate native/T3 completion, timing, usage and billing are unknown/null; the control source map's lifecycle prose and critic deadline note are not verified host receipts. There is no two-FAIL equivalence, faster-FAIL win or quality/speed/cost winner. Comparative quality is ineligible because there are not two full-quality passing finals.

Reviewer created exactly one actual native Goal, observed active with get_goal, and saves these complete scientific artifacts before issuing the terminal Goal update. No handwritten native Goal receipt is created. The supported tool/host lifecycle owns terminal evidence; no substantive science is performed after terminal completion.

First observed assessment clock/Goal activation was 2026-10-09T19:29:54+00:00 (startup read preceded this observation; its exact earlier time is unavailable); scientific assessment completed and saved 2026-10-09T19:42:22.470396+00:00; assignment deadline 2026-10-09T19:54:14.424240+00:00.
