# v8 case-owned public source capture boundary

This is a changed boundary, cloned narrowly from v7's `runtime-boundary-final-repair2/tool_server.py` and `boundary.py`. It does not inherit the old closure's qualification. No old v7 files, native frontend settings, Goal behavior, provider retries, canonical Plans, or Git state were changed. The selected server and adapter require independent acceptance under the new file pins.

The model-facing names remain `read_file`, `write_file`, `mechanical`, and policy-enabled `public_https_get`. There is no new execution, search, model, arithmetic, or general-purpose tool. The optional numerical witness is **UNEXECUTED**. This module itself makes no native or provider calls. Tests use synthetic network responses and a real local empty-root tool-server namespace; live public GET through the native candidate route remains unexercised until the root/operator's accepted canary.

## Integration contract

Select this directory's `boundary.py` explicitly before the original native runner imports `boundary`. The root-approved assembly may preload it as `sys.modules['boundary']`, with both adapter and server hashes verified against `binding.json`. The assembly owns that selection and its own closure. Do not edit or replace the old runner or old server, and do not describe this as the unchanged v7 closure.

`boundary.mcp_config(workspace, public_get)` and `boundary.allowlist(public_get)` retain their old signatures and tool names. The adapter binds only case-owned `inputs`, `TASK.md`, `out`, `public_captures`, and `operation_receipts` inside the existing empty-root mechanical tool process. New stores are created beneath the supplied case workspace and rejected if symlinks or non-directories. Each native job must use its own declared input/capture scope. Credentials and evaluator keys must never be supplied as case inputs; no host root, home, private client, native transcript, or key path is added.

## Public capture and read contract

`public_https_get({"url":"https://public-primary.example/path"})` accepts URL only. No supplied headers, bodies, proxy, cookie, auth or alternate port is accepted. Every redirect is checked afresh; DNS must resolve solely to global unicast addresses. The TCP connection is pinned to a checked IP and TLS verifies the public hostname. Proxy environment variables do not supply a route. Fixed `User-Agent` is the only request header specified by this code. There are at most four requests and the existing per-call timeout/alarm limits remain.

The HTTP response body is retained as exact bytes, with a 512 KiB retained-body limit. A larger body has a persisted bounded prefix and explicit `truncated=true`, `body_complete=false`; it is not presented as a complete source. Incomplete HTTP bodies are separately marked. UTF-8 validity and exact UTF-8 byte count (or null for invalid UTF-8) are explicit. HTTP error status bodies are preserved as that status, not silently promoted to successful evidence. Encoded/binary bodies are not decompressed or parsed by this boundary.

Bodies use `public_captures/<sha256>.body`, created exclusively and never overwritten through tools. An existing content address must match exact bytes. A separate immutable `<capture_id>.json` records requested and actual URL, HTTP status, checked IP, redirects, content hash/version, UTC, completeness/truncation, UTF-8 status, and only selected version/content headers. The candidate sees capture metadata in the GET result, but cannot directly read the metadata directory files or modify the body store. Metadata version is `sha256:<body hash>`; ETag and Last-Modified are supplementary server declarations.

GET delivers only a first 32 KiB range in `delivery`, with source-body hash, exact range hash/bytes/offsets and transmitted-text hash/UTF-8 byte count. Read more through the existing name, for example:

```json
{"path":"public_captures/<sha256>.body","byte_start":32768,"byte_count":32768}
```

`read_file` admits only case `inputs`, `out`, `TASK.md`, and the exact content-addressed public-body pattern. Public-body reads recheck the file hash. The new byte range is zero-based and at most 64 KiB; it cannot be combined with line ranges. A byte range that splits UTF-8 or contains non-UTF-8 bytes declares replacement decoding and keeps the raw range hash distinct from the transmitted text hash. Existing line ranges remain accepted, with at most 64 KiB transmitted text, explicit truncation, raw source byte extent/hash for represented lines, and transmitted text hash. Paths to receipts, metadata, arbitrary host locations, traversal, symlinks, hardlinks, special files and oversized files are denied. Write and mechanical output paths remain exclusively under `out`; writes are exclusive creates.

The immutable capture store has a 16 MiB aggregate limit, at most 128 bodies and 384 total entries. Output still has the original 16 MiB/128-file cap. Receipts have a separate 16 MiB hard cap. Hitting evidence capacity fails closed instead of returning an unrecorded result. Host writes are trusted; immutability here means immutable through the admitted model-facing tools, not a claim that a privileged host cannot alter its own files.

## Operation/exposure receipt contract

The host-maintained `operation_receipts/events.jsonl` is append-only through this tool. The candidate cannot read or write it. Each tool call has an `operation_id` and three stages:

1. `operation-started`: tool identity and argument hash, including subsequently rejected calls.
2. `prepared-result`: elapsed mechanical time, success/error, exact serialized RPC envelope hash/byte count, and bounded source/read/delivery evidence. Failed calls retain costs; raw rejected paths/URLs are not echoed in receipts.
3. `stdout-flushed`: same result binding, recorded after the native RPC envelope was written and flushed from tool-server stdout.

`stdout-flushed` witnesses only this transmission boundary. It does not establish that the frontend received the result, that the candidate model consumed it, that it read all captured bytes, or that a claim is correct. A prepared result without a matching flush witness is not promoted to transport evidence. `semantic_acquisition=UNKNOWN` and `llm_read=UNOBSERVED` remain explicit. The independent evaluator may combine these receipts with accepted frontend event evidence and the submitted report, but GET alone never earns semantic acquisition or true-finding credit.

## Verification

Run `python3 -B test_source_capture.py`. Tests cover synthetic public GET persistence/version/status, content-address reuse, truncation, incomplete/binary responses, UTF-8 split delivery, exact byte/line hashes, network policy and pinned-IP/TLS behavior, redirect checks, path privacy, immutable writes, bounded projection, append-only receipts, and an actual local namespace RPC run that binds prepared/flushed bytes and a rejected call's elapsed cost. They make no live network, native candidate, model, or provider calls.
