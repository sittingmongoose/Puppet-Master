## 13. Bounded Buffers and Process Isolation

### 13.1 Concept

**Bounded buffers:** Any in-memory buffer that holds stream output or logs has a fixed max size (e.g. 10 MB or 1000 lines). When the limit is reached, drop the oldest data. This prevents unbounded memory growth during long or runaway runs.

**Process isolation:** The main app process does not run agent logic inside itself. It spawns the CLI as a subprocess and communicates via stdin/stdout (or sockets). If the CLI hangs or crashes, the app can kill the process and stay responsive. No shared in-process state with the CLI.

### 13.2 Relevance to Puppet Master

We already spawn fresh CLI processes per iteration; this is about reinforcing **clean boundaries** and **resource safety**:

- **Rust runners:** Ensure we never accumulate unbounded stdout/stderr. Use a ring buffer or deque with a cap; when parsing stream-json, bound the line buffer (e.g. max line length, max total size).
- **GUI/log viewers:** If we show "live" output in the UI, feed from a bounded buffer so a runaway run doesn't exhaust memory.
- **Crash recovery:** If the app crashes, we don't rely on the CLI process; we rely on our own snapshots. So keeping the CLI as a separate process is correct and should be documented as a non-negotiable.

### 13.3 Implementation Directions

- **Audit:** Review all places we read subprocess output (runners, headless, any future stream consumer). Introduce a shared "bounded buffer" type (e.g. `BoundedLines` or `BoundedStringBuffer`) and use it everywhere.
- **Constants:** Define `MAX_STREAM_BUFFER_BYTES` and `MAX_STREAM_LINES` in **one place** (e.g. `platforms/runner` or a dedicated `limits` module, e.g. `src/limits.rs`); use them in all runners, parsers, and headless. Single source required; drift should never occur.

- **Docs:** In AGENTS.md or architecture docs, state that the orchestrator never embeds the CLI in-process and that all output must be consumed through bounded buffers. Add a short "Resource limits" section.


---

