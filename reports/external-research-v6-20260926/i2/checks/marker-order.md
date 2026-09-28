# I2 Muse maintained marker-order audit

All six empty original-marker snapshots were captured during one correct, successful native Write per path. No candidate-authored empty marker or later call to the same original marker path is observed. The evidence supports premature watcher capture during transient file creation.

The original native outcome remains `goal_complete`; structural delivery remains false. C2 passes fidelity but reports incomplete delivery. This audit changes no original, receipt, phase, or disposition.

| Snapshot | Original Writes | Later same-path calls | Snapshot before native terminal (ms) | Final marker mtime after snapshot (ms) |
|---|---:|---:|---:|---:|
| 0004.request | 1 | 0 | 240.576 | 230.904 |
| 0006.request | 1 | 0 | 267.470 | 227.603 |
| 0007.request | 1 | 0 | 144.103 | 76.792 |
| 0008.request | 1 | 0 | 208.451 | 198.290 |
| 0009.request | 1 | 0 | 142.746 | 130.720 |
| 0011.request | 1 | 0 | 58.092 | 15.800 |

Each Write argument is exactly `submit\n` (7 bytes, hex `7375626d69740a`). All original calls occur at native session line 1049; each has its own `started` and successful `terminal` / `task_completion: complete`. Line 1196 reports `wrote 7 bytes` for each exact path. Each empty snapshot mtime falls after its own native start, before its final marker mtime, and before its native terminal. Later accepted revisions use fresh `F000x--...` marker paths.

Empty snapshot SHA-256: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. Final original-marker SHA-256: `b64430d09b6a4ac9444409330caafb4f7baa147dc9ce9d9d18aa5a4d441638e4`. Exact paths, call IDs, source lines, timestamps, result text and per-file hashes are in [marker-order.json](marker-order.json), SHA-256 `81efd51f825a3049bb7eab9aa6c45a0a073e7fd22e9891ece8ccf1bc2d8d71a6`.

The pinned Store snapshots discovered marker bytes before validation (`delivery_store.py:192–201`), then permanently records acknowledged-marker changes (`143–155`). This explains preserved empty snapshots and latched errors without asserting a second investigator write.

Source citations:
- `/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/i2-20260928/runs/I2-M-maintained/native/muse-session.jsonl` — SHA-256 `b4dcde0ff3d5fb9281b4f79969a4d396cd7efa206ca758299a19ea7d085827ed`.
- `/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/i2-20260928/runs/I2-M-maintained/store/state.json` — SHA-256 `e0a71a09581664a64925c723a4dccf8baf3c20ebe658b3455a3b8e1783ff528d`.
- `/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/i2-20260928/runs/I2-M-maintained/arm-receipt.json` — SHA-256 `de2dc4d7f5975ef4f08507b901969b19f6d2b0d4881fd763f55249b8e5e2a2b5`.
- `/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/i2-20260928/runs/I2-M-maintained/current-criterion.json` — SHA-256 `49048e4da3da772195fd0cffa262336446dbe6a457164e279f5c2ea221a35c99`.
- `/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/delivery-v2/tools/delivery_store.py` — SHA-256 `81364fd1a4040ba457dd04779d096709c3524bee8704a2c8f453fb18264c85c7`.

Limits: logged event times and filesystem mtimes are not syscall tracing. No observed later same-path native call does not independently exclude hidden external writes. This is a bounded host/protocol audit, not semantic grading, qualification, a repair, or a disposition change.
