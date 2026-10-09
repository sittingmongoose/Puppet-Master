# sources/ index — S06 device-alerts reviser evidence (control arm, A-M06-A)

Reviser adjudication evidence, carried forward verbatim from own-arm
predecessors (immutable IDs, no rebind). The reviser read every file below
in full plus brief.md, research/draft.md, research/discovery.md,
research/revealed-plan.md, research/source-map.json, critic/critique.md,
and critic/source-map.json. The reviser performed NO new web fetches: every
criticism (M1–M11, m1–m10) was adjudicable on this own-arm evidence within
scope/time. Exact URLs, versions, locators, access timestamps, and observed
operations are in ../source-map.json (S01–S12 + S07-fix with original
2026-10-09 ~18:59–19:01 UTC access; C01–C13 with original ~19:12–19:18 UTC
access; reviser local re-read ~19:19–19:20 UTC noted per row). Docs pages
are mutable (drift explicit per source-map policy); GitHub PR/release rows
are immutable by number. Usage/billing unobserved (null) throughout. No
code executed; no sandbox witnesses; no installs.

Research excerpts (predecessor observed ops: web_search locate + web_fetch
read, except S03/S05 search-snippet rows from primary GitHub pages):

- [S01–S03 NATS dedup window, headers, release floor](S01-S03-nats.md)
- [S04–S05 EMQX session/message expiry + memory cost](S04-S05-emqx.md)
- [S06 Redpanda Connect mqtt input defaults](S06-connect-mqtt.md)
- [S07 QuestDB out-of-order + #7278 → #7285 fix](S07-questdb-o3.md)
- [S08–S09 VictoriaMetrics single-node + GreptimeDB ingest](S08-S09-vm-greptime.md)
- [S10–S12 Grafana NoData/Error + PR #117024 + Alerta](S10-S12-grafana-alerta.md)

Critic re-fetch excerpts (predecessor observed ops: web_fetch read + local
grep extraction):

- [C01–C03 NATS duplicate window, headers, v2.8.1 floor](C01-C03-nats.md)
- [C04–C05 EMQX expiry caps, queue bounds, memory-cost PR](C04-C05-emqx.md)
- [C06 Redpanda Connect mqtt input defaults + metadata + TLS](C06-connect-mqtt.md)
- [C07–C08 QuestDB O3 docs + PR #7285 fix scope](C07-C08-questdb.md)
- [C09 VictoriaMetrics single-node retention/backup/cardinality](C09-vm.md)
- [C10–C11 Grafana NoData/Error semantics + PR #117024](C10-C11-grafana.md)
- [C12–C13 Alerta 9.1 + GreptimeDB ingest paths](C12-C13-alerta-greptime.md)

How this evidence was used (see final.md §4 for per-finding verdicts):
M1 (EMQX MQTT5 cap) from C04/C05 against S04/S05; M2 (managed-only scope,
Values −1, Datasource* routing) from C10; M3 (12.4.x pin) from C11 + C10
release-tag absence; M4 (key shape, VM leg) from payload contract + S08 vs
C09 comparison; M5 (dedup counter, clean_session) from C06/S06 page-scope
absence; M6 (WAL inference, #7297, write-amp bound) from C07/C08 + S07-fix
locator scope; M7 (state-history audit proof) from S10/C10 schema absence +
C12 alternative; M8 (P5 citation status + V8) from S08/S07 vs C09
comparison; M9 (2.14 sources, adapter) from S03 locator scope + C03 page
absence; M10 (V-executability) from parent findings; M11 (security/contract)
from C06 tls block + contract-gap analysis; m1–m10 from C10/C05/S09/S12/S11
rows as cited in final.md.
