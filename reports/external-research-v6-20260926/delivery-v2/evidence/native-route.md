# Native same-Goal structural feedback route

Bounded offline development inspection, requested GPT-6 Sol/high; effective helper identity not independently observed. No launch, model/account request, network probe, driver edit, research-semantic review, or Goal reinvestigation. All examples below are synthetic development paths. This is a prospective route recommendation, not native delivery qualification or execution authorization.

Use native file tools with a host receipt handshake. Both pinned investigator applications already write files and read file content inside their live native Goal. No custom provider transport or Goal engine is needed. A host file poller/checker is a new small offline component to implement and separately demonstrate; the inspected drivers do not currently provide this checker.

## Verified native interfaces

| App | Smallest demonstrated write | Smallest demonstrated read | Evidence |
|---|---|---|---|
| Muse | `write_file({"path":"ABSOLUTE_PATH","content":"TEXT"})` | `read_file({"path":"ABSOLUTE_PATH"})` | Frozen Muse session line 490 records write arguments `content,path`; line 49 records read argument `path`. These are observed minimal calls, not a recovered complete tool schema. |
| zcode | `Write({"file_path":"ABSOLUTE_PATH","content":"TEXT"})` | `Read({"file_path":"ABSOLUTE_PATH"})` | Frozen model-I/O line 1 declares schemas; local pinned bundle line 70 defines them. Read optional offset/limit are unnecessary for a small receipt; both schemas reject extra properties. |

Muse R1b wrapper selects the pinned executable through `tools/r1b/run_goal_r1b.py:8` and `muse-serve-noshell.sh:3` (`--disable-shell`). `tools/run_goal.py:42,59-60` starts a trusted workspace with `approvalMode=allowAll`; it does not impose an append-only file policy. zcode uses its pinned backup bundle (`tools/zcode_goal_driver.py:16`); `tools/run_goal.py:210-213` creates a build session with the builtin tool allowlist and `mcpServers:[]`; default allowlist at line 310 is Read/Write/Edit/Grep/Glob, without Bash. Native writes are observed under these exact configurations. These permissions allow the proposed receipt reads; they do not prove receipts are inaccessible to model writes or that a submission filename cannot be overwritten.

The zcode bundle line 2251 requests `createParents:true, atomic:true, expectedRevision` when writing. Existing files must have been read first, and changes since that read fail with a recoverable tool error (lines 2250-2251). Fresh per-attempt files avoid that overwrite condition. Read line 2109 can return a missing-file error and can cache unchanged reads. Use a fresh receipt path per attempt. Muse is a stripped ELF; its write atomicity and full permission semantics were not recovered from source. Do not assume either.

## Proposed file handshake

Use workspace-relative roles, passed to native tools as absolute paths:

1. Write one complete finding attempt to `delivery/submissions/A0001.json`. A revision uses a new attempt filename, e.g. `A0002.json`, with the same finding identity and an explicit predecessor. Never Edit/overwrite an attempt, even after invalid feedback. Host owns revision order/history and hashes; the investigator supplies the small substantive finding.
2. Only after native Write reports success, write a unique `delivery/ready/A0001.json` marker naming that attempt. Do not batch the marker concurrently with its submission. The marker is a commit signal, not a truth or validity claim. If native Write fails, preserve its tool result and do not signal readiness; report failure within the existing budget.
3. A host poller scans only this small ready directory. Unique durable names remain until seen, so polling need not observe a brief intermediate overwrite. On readiness it checks containment, correspondence and identity, then copies the raw submission and marker to exclusive append-only host audit files, hashes and durably stores those bytes, and validates that captured snapshot. Publish no receipt before the snapshot exists. Interrupted/missing inputs stay explicit; never delete bad attempts or repair their bytes.
4. Atomically publish `delivery/receipts/A0001.json` after capture. Receipt includes attempt/finding identifiers, snapshot SHA-256, structural accepted/invalid status, and bounded parse/schema diagnostics only. Keep it small. Native Read of that exact absolute path returns the feedback in the same live Goal. If not yet present, a bounded retry of Read remains within the original time/response budget; missing-receipt errors and correction costs remain logged. No new prompt, task, Goal, premium model or budget extension.
5. Invalid feedback prompts another unique attempt. A bad revision keeps the finding's latest state pending/invalid; previous valid bytes remain history and cannot silently become an accepted latest result. Independent valid findings may still render. An invalid/incomplete attempt blocks an overall complete/pass claim. Feedback establishes structure only, never source truth, absence, grading or substantive advice.

The ready step is necessary unless a verified successful native tool-completion event is used instead: it avoids treating a partially written Muse file as a final submission. The host acknowledges a captured hash, not whatever the mutable source later contains. Before/following acknowledgement and at freeze, compare source identity/hashes with saved snapshots and audit native write/edit calls. Reused names, mismatched readiness, or observed mutation are visible protocol errors, never replacements. Polling cannot prove capture of every transient illicit overwrite; append-only naming and sequential ready/Read are prompt obligations, corroborated by native logs. No filesystem enforcement claim is warranted. Host audit storage may be outside the candidate workspace; that does not itself establish OS isolation. A native synthetic check must establish marker/read timing and receipt visibility for both apps before a research campaign.

## Error and log provenance

Muse driver `tools/muse_goal_driver.py:49-66` persists/flushed stdout frames to `muse-msp.jsonl`; lines 69-73 persist stderr. Native session records preserve tool-call args and call IDs (`muse-session.jsonl:490`) and committed tool result text (`:503`, fields text/tool_call_id/tool_call_index). The first saved write result reports bytes written; that is native write feedback, not structural validation. No explicit result-status field exists in that particular committed result. Preserve raw tool errors instead of interpreting every text result as success. Do not publish provider bodies to compensate for missing compact audit evidence.

zcode driver `tools/zcode_goal_driver.py:30-31,53-65,86-89` flushes stdout/stderr; `tools/run_goal.py:174-189` captures lifecycle telemetry. Local bundle line 2555 defines scheduled/started/progress/completed/failed events with call ID, tool name, errorCode/errorMessage. Model-I/O tool results also carry `isError` (`i1-20260927/evidence/I1-Z-maintained/acquisition-write-trace.jsonl:1` result metadata). Preserve tool-call/result IDs alongside host snapshots/receipts. Transport RPC errors are distinct from model tool results: driver call raises on RPC error (`tools/zcode_goal_driver.py:113-114`), and unhandled server requests require attention (`:68-83`). None of these logs presently supplies structural feedback automatically.

## MCP alternative and limits

The zcode bundle line 43 includes `mcpServers` in session creation/update schemas; its application has MCP capability. The pinned Goal launch explicitly supplies an empty list, and its allowlist selects builtin tools. This proves schema support, not a configured structured-submit tool. No common ready-to-use Muse/zcode submit service was verified. Adding MCP configuration/custom tools would change the pinned route and require separate work; it is unnecessary for this narrow candidate. Prefer the existing file tools.

## Exact evidence identities

Paths are absolute by joining the lab base `/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/` to the relative paths below. Line pointers above refer to these bytes. Bundled JS has long minified lines; named function/schema tokens disambiguate them.

| Relative lab path | SHA-256 |
|---|---|
| `delivery-v2/I1_RESULTS_REVIEW_AND_NEXT_STEP.md` | `ab1b1df34c95fe6600ab859073f23ea62cf9f8dea870794a210adb71a805af2e` |
| `tools/r1b/run_goal_r1b.py` | `4cfd7aee946cd8db9ef70a0adf2cfe8279a5cdc13cb3c8b7cd299775dee97ae7` |
| `tools/r1b/muse-serve-noshell.sh` | `fecdb795d96fcdbf8895349dc81435dbf28b8e07ecbdbdaee2cff61c3f790586` |
| `tools/run_goal.py` | `7325ed95a89767b377de49dbe27bf2f1af989ee04521ff8f7e92a560fb367d5b` |
| `tools/muse_goal_driver.py` | `f5af9ef6ef420fbd6452677b11fb31341f17e57a6a0b90b4727dbe3e71adf218` |
| `tools/zcode_goal_driver.py` | `b2d1a36308769a225005e586e894f180d7bb38bd9f5c481a1c86c49c41755eac` |
| `i1-20260927/runs/I1-M-maintained/native/muse-session.jsonl` | `d9276120efe2b2eced1babe286f8a867e21e68e8c53a9a2f8729810805d1d24f` |
| `i1-20260927/runs/I1-M-maintained/native/muse-msp.jsonl` | `e9735b9613d0147554d2774aec554c857edb1e6504b6c3dc2b182e63db689418` |
| `i1-20260927/runs/I1-Z-maintained/native/zcode-model-io.jsonl` | `5c960279922b6eff62278ff426db581b70d8bf6d5cc8cbca94eb3931b5ccbe82` |
| `i1-20260927/evidence/I1-Z-maintained/acquisition-write-trace.jsonl` | `9bdd765fdbf1160ad40491c913236536c90d2f3ec94db8376762bdc4be882611` |
| `i1-20260927/runs/I1-Z-maintained/native/zcode-stdout.jsonl` | `a33358291a079b36e976ede1d354e0358c5cd5a840d980d1932845e7a12225d9` |

External local binaries inspected as bytes/source only:

- `/home/sittingmongoose/.local/bin/muse-bin-1.4.0-R4161.1`: `1b68bd4518d53a2aaff063915df4d141b0a205e6d79038299d04e3a14e85a5b9`.
- `/home/sittingmongoose/.local/opt/zcode/app.backup-3.11.2.6792/resources/glm/zcode.cjs`: `e9f1868c0fdb863537ed910ee3828b9be96b8c2fd805473f63b439e1113266b8`. Relevant tokens: `Rde` (Write schema), `eOt` (Read schema), `WZo` (write handler), `eVo` (read handler), `GZo` (write model response), `tool.lifecycle`.
