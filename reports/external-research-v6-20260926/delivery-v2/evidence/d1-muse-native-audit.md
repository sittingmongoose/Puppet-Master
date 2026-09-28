# D1 Muse native mechanical audit

The terminal Muse assignment passes the bounded mechanical/protocol checks. This is a synthetic delivery-interface observation, not semantic grading, research quality, general reliability or follow-on verifier qualification. Requested audit-helper role: GPT-6 Sol/high; independently observed helper identity unavailable. No candidate feedback, model/application call, rerun, repair or push was performed. zcode outputs were not inspected.

One fresh native Muse session (`01a0e5b6-dc5f-7811-b8fa-0d68a9de2b17`) and one parent turn span all four attempts and the correction. Requested and observed investigator model: `muse-spark-1.3-contributor`; requested and observed effort: Max. The MSP effort event is line 7, parent turn starts at line 11 and completes at line 212. Session goal bindings identify one Goal; active/complete MSP status events are lines 9/133. Native receipt reports `goal_complete`, 258.2 seconds, 18 parent responses, under the declared 300-second/48-response ceilings. Host elapsed time is 259.31 seconds, process exit 0 and no host error. No cap or quota-stop classification occurred.

## Native payload/marker/receipt sequence

Each payload Write's successful native result precedes its marker call, by both record sequence and recorded timestamp. Each of eight Writes reports the exact byte count/path; all completed MSP tool items corroborate success. Every payload/marker path was written exactly once. All four receipt Reads succeed on their first recorded call and deliver the same JSON objects retained on disk.

The following line pointers refer to `/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/d1-20260928/muse/native/muse-session.jsonl` (SHA-256 `d5645a666d276074bc974b001daa7fa39489da2cdf19bbd3c8c8930590da9b3a`):

| Attempt | Payload bytes | Payload success → marker call | Receipt Read result | Host status |
|---|---:|---|---:|---|
| new--alpha | 1374 | 152 → 179 | 223 | VALID_UNVERIFIED |
| new--red | 1429 | 258 → 285 | 329 | VALID_UNVERIFIED |
| F0001--invalid | 1478 | 364 → 391 | 436 | INVALID |
| F0001--fixed | 1825 | 512 → 539 | 583 | VALID_UNVERIFIED |

After the deliberately invalid revision, status Read call/result lines 455/467 show Alpha `INVALID`, Red `VALID_UNVERIFIED`, and aggregate `INCOMPLETE`. After correction, lines 611/625 show both current findings `VALID_UNVERIFIED` and aggregate `STRUCTURALLY_COMPLETE_UNVERIFIED`. The final Goal-completion tool call/result is lines 649/661, after the receipt/status reads. The four receipts are structural-only; each says semantic validation was not performed.

## Byte integrity, host history and scope

All eight raw snapshots exactly match the corresponding native Write content; the surviving payloads/markers still match those bytes. The input manifest's synthetic source/task hashes remain unchanged, and relevant source/driver pins match the frozen declaration. Four attempts retain statuses valid, valid, invalid, valid; Alpha's host identity is F0001 across revisions 1/2/3, including the invalid attempt. Typed part IDs remain stable between its accepted records; mechanical part-change history is retained. Red remains exactly its independent accepted record. The final current JSON equals the two latest accepted complete records, with ALPHA_V2 and no ALPHA_V1/ALPHA_PENDING in current Markdown. Invalid and superseded raw/history remain separate. The exact synthetic quote/fenced code and typed uncertainty/proposals are retained; proposals render as UNEXECUTED.

Observed candidate tool calls: eight `write_file`, eight `read_file`, one `update_goal`. Reads are the synthetic source, the four exact receipt paths and three aggregate-status reads. Writes are only the eight declared submission/marker paths. No Edit, shell, web/network, other-model or workspace-external tool call appears in this parent trace. Muse's broad builtin catalogue was not narrowed to a three-tool allowlist; the shell-disabled wrapper and actual-use audit are distinct evidence. Ten app-internal skill-reminder child links are recorded; unexposed child content/tokens remain unknown, not zero.

## Evidence limits

No concrete protocol deviation was found. Native tool/session logs corroborate recorded activity but are not an OS access trace. Snapshot-before-ack follows the frozen store's code order and receipts contain the matching captured hashes; no independent fsync/disk-durability or OS write-time trace exists. The transient invalid-time current Markdown was not separately snapshotted: no fallback is established from delivered state and pinned projection logic, rather than byte replay of that transient file. Polling cannot reconstruct illicit overwritten-before-observation content; native unique-write evidence supports this compliant assignment. These limits remain explicit.

Compact machine evidence: `/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/delivery-v2/evidence/d1-muse-native-audit.json`, SHA-256 `235548df0ea5faad5c1cd1ba423b76169dd52340fa56892d80e369c9e810eab8`. It includes exact paths/hashes for the frozen spec/prompt/dispatch, native receipt/session/MSP logs, all snapshots/receipts, current/history/state artifacts and pinned host/drivers, with per-attempt call/result line pointers. Raw logs stay VM-only; no thinking/provider transcript is reproduced here. MSP raw log: `/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/d1-20260928/muse/native/muse-msp.jsonl`, SHA-256 `eff0b27b02e0be54007ddf6269deb9df41fb6ebbd01edf7f9398cc5c830d9ca6`.
