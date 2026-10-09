# S06 device-alerts — critic report (M06 v1 evidence-first-challenge, control arm)

Case S06 device-alerts; block A-M06-A; stage critic. Brief: 120 remotely
connected water-utility gauges; late/out-of-order/duplicate data; understandable
alerts + acknowledgement history; operational triage, not safety control; modest
self-hosted budget.

Inputs inspected in full (own arm only): brief.md; research/draft.md (324
lines); research/discovery.md (434 lines); research/revealed-plan.md (P1–P6
exact text); research/source-map.json (S01–S12 + S07-fix); all six research
sources/ excerpts. Plus independent critic re-fetch of governing public primary
sources [C01–C13] on 2026-10-09 ~19:12–19:18 UTC (see source-map.json and
sources/). No campaign/history/evaluator/counterpart read. No code executed; no
sandbox witnesses (none qualified/available); no installs.

Critic demands can be invalid; each finding below states the evidence, what was
verified vs not observed, and the uncertainty. Nothing here repairs the
candidate outside the assigned recipe: this file challenges and demands
evidence; it does not rewrite the draft.

Verdict summary: no false rejection found — P1/P2/P3/P4/P5/P6 dispositions are
directionally correct. But P1's broker conditions conflate EMQX 5.x/6.x expiry
knobs on the recommended MQTT 5 path (M1); P2/P3 omit the Grafana-managed-only
scope and Values −1 behavior (M2) and over-pin the #117024 version (M3); the
(gauge, ts) upsert key is underspecified and the VictoriaMetrics backfill leg
is unsettled (M4); Connect "dedup counters" and clean_session durability are
unsourced (M5); the QuestDB WAL-mitigates claim is inference, not evidenced
fix verification (M6); the Grafana state-history default for audit-grade ack
history is under-evidenced (M7); several P5 mechanisms lack citations and no
retention/restore validation exists (M8); the NATS 2.14 sources-window claim is
unverified in this window (M9); six validation applicability gaps make parts of
V1–V7 unexecutable as written (M10); security/TLS/auth and payload-contract
versioning are omitted from otherwise "mandatory" conditions (M11).

## 1. Material findings

### M1. EMQX expiry defaults are version-conflated; the "2 h default ceiling" is false on the recommended MQTT 5 path

Draft P1 (and discovery §2.2) state: session_expiry_interval semantics
0/0xFFFFFFFF; "EMQX default maximum allowed session expiry is 2 hours unless
raised"; recommends MQTT 5 preferred, finite expiry, stable ids, "never
0xFFFFFFFF given churning ids".

Critic re-fetch [C04] of the current EMQX MQTT configuration page confirms part
and contradicts the governing cap:

- Confirmed: `session_expiry_interval` default `2h`; in-memory sessions stay
  resident ("With the default in-memory session store, a disconnected session
  stays in memory for the whole interval"); `max_mqueue_len` default `1000`.
- Contradicted as stated: the 2 h `session_expiry_interval` row applies to
  "MQTT 3.1 and 3.1.1 clients that connect with Clean Session = false. MQTT
  5.0 clients set their own value." The MQTT 5 cap is a separate knob,
  `max_session_expiry_interval`, default `infinity (no limit)`, "Available
  since EMQX 6.3.0", which "caps the session expiry interval that an MQTT 5.0
  client can request."
- [C05] (PR #18443) confirms the memory-cost mechanism and adds that
  `max_session_expiry_interval` "does not exist before 6.3."

Consequence: on the draft's own recommended path (EMQX + MQTT 5, current
docs/6.x), a gauge/gateway can request never-expire and the broker will not
clamp it unless the operator sets the 6.3+ cap. The draft's "2 h default
ceiling" holds (approximately) for 3.x clients / 5.x-era config, not for MQTT 5
on 6.3+. The never-expire RAM hazard the draft correctly fears is therefore
*less* guarded than the draft claims on the recommended path.

Related: draft mandates a "finite message_expiry_interval" but no observed
excerpt in S04/S05 or [C04] states the broker default/cap for message expiry;
the value is ungrounded.

Demand: pin EMQX major (5.x vs 6.x). On 6.3+, set `max_session_expiry_interval`
explicitly finite in addition to `session_expiry_interval`; on 5.x, cite the
5.x branch doc for the actual MQTT 5 cap behavior. Give `message_expiry_interval`
an explicit value with a citation, or mark it uncertain with a validation
proposal. Uncertainty: critic did not re-fetch the EMQX 5.x branch docs in this
window; 5.x behavior is not confirmed or denied here.

### M2. P2/P3 dead-man design omits "Grafana-managed rules only" scope and Values −1 substitution

Draft P2 replaces the single threshold with threshold + dead-man + error rules,
pending, NoData→Alerting, DatasourceError labeling; P3 maps missing to NoData.
Draft §2 also retains "vmalert + Alertmanager routing as an alternative."

Critic re-fetch [C10] confirms the core semantics — evaluation_timeout default
30 s, max_attempts default 3, pending honored on Error and No Data paths
(Normal→Pending→Error/No Data, 0 skips Pending), DatasourceNoData/DatasourceError
instances with labels alertname/datasource_uid/rulename, MissingSeries
grafana_state_reason on stale Normal — but adds two consequential qualifiers the
draft omits:

1. Scope: "No Data and Error states are supported only for Grafana-managed
   alert rules." The vmalert alternative does not inherit NoData→Alerting,
   pending-on-NoData, or DatasourceNoData routing. The draft never scopes P2/P3
   replacements to Grafana-managed rules.
2. Notification payload: "when you configure the No Data or Error behavior to
   set the Alerting or Normal state, Grafana ... re-uses the latest known set
   of fields in Values, but will use −1 in place of the measured value."
   Dead-man pages will display −1 as the value; runbooks/dashboards that render
   Values will mislead unless designed for it.
3. Routing: "DatasourceNoData and DatasourceError alert instances are
   independent from the original alert instance... existing silences, mute
   timings, and notification policies applied to the original alert may not
   apply to them." A dead-man page can bypass the site/severity grouping the
   draft mandates unless separate policies match alertname=DatasourceNoData.

Demand: scope P2/P3 replacements to Grafana-managed rules; document the −1
Values behavior in runbook/notification design; require notification policies
matching the Datasource* labels; extend V4 to assert notification payload and
routing, not just time-to-page. None of this rejects P2/P3 dispositions.

### M3. Grafana #117024 "12.4.x" pin is asserted without an observed release citation

Draft P2/E2/V4/V7 repeatedly pin "Grafana 12.4.x honors pending on NoData/Error
(PR #117024)" with "older versions fired immediately."

[C11] confirms the PR is merged and its intent ("NoData and Error alerts honor
the same pending period as regular alerts... sent only after this pending
period elapses"; pre-change they "trigger immediately on the first
evaluation"). [C10] confirms current docs honor pending on both paths. But the
critic's fetch window did not observe a 12.4.x milestone, release tag, or
release-note row for #117024. The behavior direction is therefore confirmed on
current docs; the exact minor-line boundary ("12.4.x" vs adjacent minors) is
not.

Demand: cite the exact release containing #117024 (milestone/release notes) or
soften to "verified on current docs at fetch; re-validate the pinned minor's
NoData/Error pending behavior at deploy and on every upgrade." V4/V7 then test
the pinned version's actual behavior rather than asserting a version number.
Uncertainty acknowledged: the 12.4.x pin may be exactly right; it is
under-cited, not refuted.

### M4. (gauge, ts) upsert key collides on same-timestamp readings; VictoriaMetrics backfill leg unsettled

Draft P1 mandates "Upsert key (gauge, ts) mandatory — transport dedup is
time-bounded and never sufficient alone." Payload contract includes gauge_id,
event_ts, seq, value, unit, fw rev.

Challenge 1 — key shape: two readings from one gauge can share event_ts (coarse
timestamp resolution, retransmit with corrected value, batch flush with one
timestamp, sub-resolution sampling). On a bare (gauge, ts) key they collide;
last-write-wins silently drops one. The payload already carries seq, but the
key ignores it. Demand: key (gauge, ts, seq), or (gauge, ts) with an explicit
conflict policy (which row wins, ties broken how, duplicates counted where).

Challenge 2 — VM leg: "store upsert key" language fits QuestDB (DEDUP UPSERT
KEYS asserted, un-re-fetched here) better than VictoriaMetrics, whose
documented dedup is HA/scrape-interval based, not a generic idempotency key.
Discovery §2.5 honestly hedged VM far-backfill ("may need explicit import
(vmctl/native import) rather than live push — verify on the pinned version");
draft §2/§4 upgrades this to "VM import" as if settled, with no pinned-version
evidence. [C09] confirms vmbackup/vmrestore exist and retention flags exist but
did not re-observe dedup-interval or import-path specifics in the critic
window.

Demand: keep the transport-dedup-is-never-sufficient principle; specify the key
per store ((gauge, ts, seq) or documented LWW); keep the VM backfill path
uncertain until a pinned-version test; split V1 into QuestDB-leg and VM-leg
assertions (currently QuestDB-shaped only: DAY boundary, tables()/Prometheus
write-amp).

### M5. Connect "dedup counters" and clean_session=false durability are unsourced

Draft P1/V2 claim the Connect normalizer "exposes dedup counters" and V2
asserts "Connect dedup counters increment."

[C06] verifies every S06 default the draft cites (urls/topics required, qos
default 1, clean_session default true, keepalive 30, connect_timeout 30 s,
auto_replay_nacks default true with the documented memory/backpressure trade,
metadata mqtt_duplicate/mqtt_qos/mqtt_retained/mqtt_topic/mqtt_message_id).
But the mqtt-input page documents no dedup processor and no dedup counter.
Dedup would come from an explicitly configured processor (cache/dedup +
Bloblang) and its operator-defined metrics — which the draft never names.

Similarly, discovery §2.3/draft rely on "stable client_id with
clean_session=false and finite session expiry (broker permitting)" for
Connect-to-broker durability across Connect restarts. [C06] documents
clean_session as "Set whether the connection is non-persistent" with no
session-resume semantics; interplay with the M1 expiry caps and EMQX offline
queue bounds is untested.

Demand: name the exact dedup processor + metric, or drop the counter assertion
from V2 (assert store exactly-once + mqtt_duplicate metadata instead, both
observable). Treat clean_session=false resume as a proposed check (restart
Connect mid-outage, assert zero loss/duplicates bounded), not a settled
property. The normalizer mandate itself is sound and well-motivated; only the
two specific claims are challenged.

### M6. QuestDB WAL-mitigates inference is reasonable but not evidenced fix verification; #7297 uncited

[C08] verifies E1's core: PR #7285, "fix out-of-order rows after a lag commit
crosses a partition boundary," fixes #7278; non-WAL writer; in-order prefix
crossing a partition boundary seals the earlier partition in memory without
persisting _txn; next lag commit's o3MoveUncommitted resets maxTimestamp to the
durable _txn value below committed data; fix tracks lastSealedPartitionMaxTimestamp.
[C07] verifies O3 merge-per-method (ILP/INSERT/COPY-partitioned accepted, COPY
non-partitioned rejected), the partitioned+WAL recommendation, and write-amp
observability (table_write_amp_* p50/p90/p99/max; Prometheus ratio over deltas).

What is not evidenced: neither observed text states WAL writers are immune to
this bug class. "WAL tables mandatory" is sound engineering judgment aligned
with the docs recommendation, but the draft's "fix verified by reading PR
descriptions" overclaims: reading a non-WAL fix does not verify WAL immunity;
absence of a WAL twin issue is absence of evidence. Separately, both discovery
and draft cite "follow-up #7297 (resetToLastPartition path)" with no separate
fetch observed — the claim is single-sourced to the S07-fix locator line.

V1's "write-amp p99 bounded" is unassertable as written: [C07]-visible docs say
"There is no universal threshold... a sensitivity indicator, not a pass/fail
metric." No numeric bound, workload, or measurement choice (tables() p99 vs
Prometheus delta ratio) is given.

Demand: keep WAL + DAY + current-release + boundary-straddling V1; downgrade
"fix verified / directly shapes" to "mitigation inferred from fix scope +
docs recommendation; V1 must run on the pinned release and assert counts, no
gaps/dupes, and a pre-registered write-amp bound with its measurement method."
Fetch #7297 or drop the specific follow-up claim.

### M7. Grafana state-history default for audit-grade ack history is under-evidenced

Draft P4 correctly rejects local-first ack authority (split-brain history) and
correctly frames server choice as a user decision (Grafana state history vs
Alerta 9.1, [C12] confirms Alerta's consolidate/de-dup/API+UI+CLI/blackouts/
heartbeats/customer-views surface). The challenge is narrower: the *default*
leg — "Grafana Alerting state history with its backend explicitly configured
(SQL or Loki) and queried for the ack view" as the owner of "Ack lifecycle
(open→ack→closed/reopen, actor + timestamp per transition)... survives
restarts" — has no observed source establishing that state history retains
actor identity per transition durably and queryably as an audit record. S10/[C10]
establish that a backend must be configured and that evaluation/state labels
exist; they do not establish an ack-audit schema. "Server-wins with the losing
intent preserved in history" is a designed conflict rule, not a sourced
behavior of either backend.

Demand: before defaulting to Grafana for the brief's "acknowledgement history"
audit requirement, V6 must demonstrate on the pinned Grafana version + chosen
backend that fire→ack→resolve→blackout/mute yields actor+timestamp entries,
survives restart, and is queryable for the ack view. If that fails or is
version-fragile, default to Alerta for lifecycle/history (its core job) and
keep Grafana for charts/rules. D2 is correctly framed as a user decision; this
finding says the default leg, not the decision framing, needs proof. P4's
disposition (correction + user decision + optional offline-queue UX) stands.

### M8. P5 mechanisms are partly uncited; no retention/restore validation exists

P5's disposition (already-covered intent + tiered-retention correction + user
decision on tiers) is correct: "keep data for a year" as one sentence indeed
ignores what/where/cost. The mechanisms, however, outrun the citations:

- [C09] confirms: `-retentionPeriod` exists, default 1 month (31 days),
  minimum 24 h/1 d; vmbackup/vmrestore/vmbackupmanager exist; cardinality
  limiter / high-cardinality guidance exists. Critic did *not* re-observe in
  this window: "infinite expressed as 100y" (predecessor excerpt asserts it),
  `-dedup.minScrapeInterval` set-to-interval guidance, 5-minute
  lookback/look-behind default. Status: uncertain (neither confirmed nor
  refuted), not false.
- QuestDB "DAY partitions with drop policy," "snapshot + WAL" backup, "DEDUP
  UPSERT KEYS disqualifies fast-append," TIMESTAMP-µs and ILP-precision
  specifics: asserted in discovery/draft, not re-fetched by the critic.
- Cardinality guard (labels to gauge/site/type; no per-reading UUID labels):
  directionally consistent with VM's cardinality-limiter surface but not pinned
  to an exact excerpt here.
- Regulatory-minimum uncertainty is correctly flagged, not assumed. Good.
- The V-suite has no retention enforcement or backup-restore test: nothing
  asserts tiered drops happen, rollups cover the year, alert history outlives
  metrics retention, or a restore drill recovers.

Demand: keep the P5 disposition; attach a citation to each mechanism or mark it
uncertain; add V8 (retention enforcement + restore drill: age data past each
tier, assert drops/rollups; snapshot/backup, destroy, restore, assert ack
history + recent readings queryable). Sizing math (gauges × cadence × bytes →
disk) is demanded as a worked example for 120 gauges, not a slogan.

### M9. NATS 2.14 sources-window behavior is unverified in this window; core JetStream claims hold

Verified by critic re-fetch: Duplicate Window default 2m0s [C01]; Nats-Msg-Id
dedup within window + Expected-State headers (Expected-Stream/Last-Sequence/
Last-Subject-Sequence/Last-Msg-Id, publish fails unless met) [C02]; v2.8.1
"Enforce a minimum of 100ms for max age and duplicates window settings (#3056)"
[C03]. The draft's Architecture B conditions built on these (stable
Nats-Msg-Id = gauge_id + seq, file streams, 2-minute-class window as near-term
guard, permanent idempotency downstream, ≥100 ms test floors) are well-evidenced.
"JetStream dedup keys on the id only, never the body" is consistent with [C01]/[C02].

Not verified: "since 2.14 streams with sources have no duplicate window unless
one is set" (S03 locator cites a nats-pure.rb commit note, not a primary
nats-server release/doc excerpt). Draft V7 bakes this into the upgrade-replay
plan ("including the 2.14 sources-window change").

Demand: retain B + all 2m/stable-id conditions; downgrade 2.14-sources to
uncertain pending a primary citation (server release notes or versioned stream
config docs); V7 should pin the nats-server minor and assert the deployed
stream config round-trips (duplicate_window present and effective on sources
streams) rather than asserting the historical change. Adjacent: "NATS MQTT
adapter" (discovery B-risk, draft §2) is plausible — NATS docs carry an MQTT
section — but no adapter excerpt was fetched by either stage; cite before
recommending it for MQTT-only gauges.

### M10. V1–V7 are directionally discriminating and honestly unrun, but several assertions are unexecutable as written

Credit first: the suite is honestly marked proposed-only ("none run"), each
item names a bug class it kills, and theCSV-smoke demotion (P6) is correct. The
challenges are about executability:

- V1 (boundary backfill): QuestDB-only assertions (DAY boundary, tables()/
  Prometheus write-amp). No VM-leg assertions despite D1's either/or. No
  numeric write-amp bound (see M6). Fix: split per store; pre-register bounds.
- V2 (duplicate storm): asserts an unnamed "Connect dedup counter" (see M5)
  and "PubAck.duplicate observed" without naming the client/API/field surfacing
  it. Fix: assert store exactly-once on the §M4 key + mqtt_duplicate metadata
  counts + named JetStream publish-response observation.
- V3 (outage buffer): "2× worst-case outage" is unquantified — no
  outage_seconds × rate × gauges math, no worked max_mqueue_len vs stream-cap
  sizing for 120 gauges, no reconnect-storm metric. Fix: quantify worst case,
  size queues/streams, assert depth-under-cap + zero loss + no never-expire
  growth with named metrics.
- V4 (dead-man timing): asserts time-to-page vs pending + interval + window but
  omits Values −1, DatasourceNoData routing/policies (M2), and the
  Recovering→Alerting immediate-fire edge. Fix: assert payload + routing +
  timing; re-run per upgrade as stated.
- V5 (precision/unit trap): "assert stored equality after coercion" needs a
  tolerance (float °C/°F round-trips are not exact) plus dashboard-unit-label
  assertions. Fix: epsilon + unit assertions.
- V6 (ack round trip): "blackout" mixes Alerta blackouts with Grafana mute
  timings/silences; backends differ per D2 leg. Fix: per-leg V6 (Grafana-leg
  and Alerta-leg) with the M7 audit assertions.
- V7 (upgrade replay): "diff behavior" needs a diff oracle. Fix: golden-trace
  comparison (V1–V4 outputs on pinned vs candidate minor) with pre-registered
  allowed deltas.

Demand: quantify or mark-uncertain per item; none of this demotes the suite's
discriminating design or its honest proposed-only status.

### M11. Omission: security/auth/TLS and payload-contract versioning are missing from "mandatory" conditions

The brief's gauges are *remotely connected*, yet P1's "mandatory conditions"
contain no broker authentication/ACL, no TLS, no credential provisioning/
rotation, and no per-site gateway security posture — TLS gateways appear only
as an §5 optional. [C06] verifies Connect's mqtt input carries a full tls
block (enabled/skip_cert_verify/root_cas/client_certs) plus user/password; the
draft never sets tls.enabled or broker auth. For a utility SCADA-adjacent
surface, unauthenticated/unencrypted MQTT is a deployment-blocking omission,
not an enhancement.

Payload contract (gauge_id, event_ts, seq, value, unit, fw rev) lacks: a schema
version field; a unit enum + unknown-unit policy; seq-monotonicity rules across
gauge reboots (when seq resets, stable-id dedup in M4/M9 breaks unless keyed
carefully); event_ts-vs-ingest_ts conflict policy for alerting queries (which
timestamp do threshold windows evaluate?); out-of-range/quarantine thresholds
ownership. "Keepalive ~60 s" (EMQX hop) vs Connect "keepalive 30" (Connect hop)
are listed without reconciling which hop each governs.

Demand: add a security + contract-versioning section (broker auth/ACL, TLS with
cert provisioning, Connect tls.enabled + secrets handling, schema version,
unit enum, seq-reset rule, timestamp authority per query class), or explicitly
defer it with a stated risk note. Do not present P1 broker conditions as
complete without it. Cost: this likely fits the same single VM + backup budget,
but operator-time cost must be noted.

## 2. Minor findings and confirmations

- m1. Terminology: "evaluation group interval" (P2) blurs Grafana's evaluation
  group/interval with Alertmanager's group_interval. Clarify: Grafana
  evaluation interval per rule group (e.g. 1 m) vs notification grouping.
- m2. "DatasourceError instances labeled by rule/data-source" is loose; [C10]
  gives the exact labels (alertname, datasource_uid, rulename). Directionally
  right; use exact names in routing rules.
- m3. E4 is correctly characterized as a docs change: [C05] confirms PR #18443
  is "docs(i18n): explain the memory cost of session_expiry_interval," raised
  from #14482 where an operator "had to read emqx_channel.erl." The draft's
  "documented cost" phrasing is accurate. Interplay with the 6.3+
  max_session_expiry_interval cap (M1) should be noted.
- m4. GreptimeDB optional-enhancement framing is appropriate. [C13] confirms the
  docs-1.2 ingestion-path table (OTLP/HTTP, Remote Write, Loki Push, etc.);
  the standalone tag v1.1.4 and EMQX-rule→line-protocol action were asserted by
  the predecessor and not re-observed here — retain with pin-at-deploy.
- m5. Alerta D2 framing is appropriate. [C12] confirms the 9.1 surface
  (consolidate/de-dup, JSON API + Web UI + CLI, plugins/integrations, API keys,
  Basic/OAuth2, blackouts/heartbeats/customer-views/lifecycle tutorials). The
  Postgres/Mongo backend matrix was asserted by the predecessor and not
  re-observed here — cite it before adopting.
- m6. P3's "grafana_state_reason=MissingSeries" + resolve-and-notify: [C10]
  confirms the MissingSeries annotation value on stale Normal and the stale
  handling direction. Keep with exact citation; note it is an annotation, not
  a label, for routing purposes.
- m7. vmalert "for: delay" alternative (discovery §2.5, draft §2): no vmalert
  source was fetched by either stage. The M2 scope finding already requires
  per-engine dead-man semantics; add a vmalert citation or mark the alternative
  uncertain.
- m8. Build-order step 6 ("V1–V5 then pilot") should gate on V6/V7 legs
  explicitly once M7/M10 are addressed; step 5 correctly preserves D2.
- m9. Usage/billing null is correct: no cloud billing behavior was observed at
  either stage; the self-hosted default matches the brief's modest budget.
- m10. O3 "absent/inapplicable" honesty (VM crash-loss, Connect MQTT chains not
  found; GreptimeDB/Alerta chains not chased) is the right call and is
  preserved; V7 covers drift instead. No challenge.

## 3. Per-P disposition verdicts

- P1 "Ingest MQTT readings into a time-series database." Disposition
  already-covered intent + correction on mechanism: AGREE. The correction is
  real (one sentence omits broker/normalizer/store obligations) but incomplete
  without M1 (MQTT 5 cap + message-expiry value), M4 (key shape + VM leg), M5
  (counter/clean_session proof), and M11 (auth/TLS + contract versioning). Not
  a false correction.
- P2 "Alert when the latest reading exceeds one fixed threshold." Disposition
  correction/rejected-as-sufficient with rule-set replacement: AGREE. The four
  grounds (event-vs-ingest time, severity bands, pending, dead gauges) are
  sound. Scope to Grafana-managed rules, document −1 Values + Datasource*
  routing (M2), and soften the version pin pending citation (M3).
- P3 "Missing readings count as zero." Disposition rejected with NoData
  replacement: AGREE, no part retained. The zero-vs-offline conflation,
  dead-man defeat, and aggregate corruption grounds are correct. Add the M2
  routing/display notes to the replacement.
- P4 "Clients acknowledge an alert locally then sync." Disposition correction
  (server-authoritative) + user decision + optional offline-queue UX: AGREE on
  direction. The split-brain/audit-trail grounds are correct. The default
  (Grafana state history) needs the M7 proof before it carries audit weight;
  the "pending sync" UX retention is correctly scoped as display-only.
- P5 "Keep data for a year." Disposition already-covered intent + correction +
  user decision: AGREE. Tiering by content (raw/rollups/alert history),
  sizing, backups, and cardinality guard are the right corrections. Attach
  citations per mechanism and add retention/restore validation (M8).
- P6 "Validate with a static sample CSV." Disposition rejected-as-sole,
  retained as smoke seed: AGREE. The enumerated uncovered risks (lateness,
  merge, duplicates, buffering, expiry/queues, dead-man timing, NoData/Error,
  precision/units, ack round-trips, boundary backfill, version drift) are
  accurate. State the smoke's positive scope (ingest→chart renders) alongside
  its limits.

## 4. Discovery/alternatives assessment

Architectures A (MQTT + Connect + QuestDB/VM + Grafana), B (JetStream
transport/buffer), C (Alerta ack server), the GreptimeDB variant, and the
vmalert routing alternative are genuinely different approaches with stated
conditions — O1 satisfied in structure. Retention of all four with
adopt-when conditions is correct; no alternative should have been dropped.
Gaps: B's NATS-MQTT-adapter escape hatch and the vmalert idiom need citations
(M9/m7); D1–D6 user decisions are the right deferrals, with D2's default leg
needing M7 proof and D1's VM leg needing M4 proof. Cross-cutting findings
(transport/store/alerting/outage/expansion/budget) are coherent with the
evidence except as challenged above. Triage-not-control is correctly retained
as a hard constraint throughout.

## 5. What the critic verified, did not observe, and uncertainty

Verified by independent re-fetch: NATS 2 m duplicate window; Nats-Msg-Id +
Expected-State headers; v2.8.1 100 ms floor (#3056); EMQX 2 h
session_expiry_interval (3.x scope), max_mqueue_len 1000, in-memory residency;
EMQX PR #18443 docs memory-cost change from #14482; Connect mqtt defaults +
metadata + tls block; QuestDB O3 per-method merge + partitioned/WAL guidance +
write-amp observability; QuestDB PR #7285 non-WAL scope + mechanism + #7278
link; VM retention flag/default/min + backup tools + cardinality surface;
Grafana pending-on-NoData/Error + timeout/attempt defaults + Datasource*
labels + −1 Values + MissingSeries + managed-only scope; Grafana #117024
merged intent; Alerta 9.1 consolidate/API/UI/blackout/heartbeat surface;
GreptimeDB 1.2 ingestion-path table.

Not observed in the critic window (uncertain, not refuted): EMQX 5.x-branch
MQTT 5 cap behavior; message-expiry broker default/cap; NATS 2.14
sources-window change (primary citation); VM "100y infinite" /
dedup-interval / 5 m lookback rows; QuestDB DAY-drop policy, snapshot+WAL
backup, DEDUP-UPSERT fast-path interaction, TIMESTAMP-µs/ILP-precision rows;
QuestDB #7297; Grafana #117024 release/milestone tag; Alerta backend matrix;
GreptimeDB standalone tag + EMQX-rule action; vmalert for: semantics; NATS
MQTT adapter page.

Method note: this critique was produced by reading the complete own-arm draft,
discovery, revealed plan, and source evidence, then re-fetching governing
primary sources and challenging every consequential default, disposition, and
validation. Critic demands above can themselves be invalid where noted; each
carries its evidence and uncertainty. No premium evaluator access was used; no
candidate repair beyond the assigned recipe was attempted.
