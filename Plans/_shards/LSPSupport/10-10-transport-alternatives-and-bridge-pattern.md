## 10. Transport alternatives and bridge pattern

Most LSP servers use **stdio** (spawn process, stdin/stdout = JSON-RPC). Some use **TCP** (e.g. Godot's GDScript LSP on port 6005). Tools like OpenCode and Cursor typically expect stdio only, so TCP-only servers don't work without a bridge.

### 10.1 Godot LSP bridge (reference)

- **Context:** [Reddit: Made a Godot LSP bridge because it wasn't working with OpenCode](https://www.reddit.com/r/godot/comments/1qumbhq/made_a_godot_lsp_bridge_because_it_wasnt_working/) -- Godot uses TCP; OpenCode expects stdio; connection kept failing.
- **Project:** [godot-lsp-stdio-bridge](https://github.com/code-xhyun/godot-lsp-stdio-bridge) -- stdio-to-TCP bridge so AI coding tools (OpenCode, Claude Code, Cursor) can use Godot's GDScript LSP. Run with `npx godot-lsp-stdio-bridge`; configure as the LSP "command" for `.gd` / `.gdshader`.
- **Features:** Binary-safe buffers (no data loss on large files); auto port discovery (6005, 6007, 6008); auto reconnection when Godot restarts; Windows URI normalization (`C:\path` → `/C:/path`); notification buffering until initialize response (handles Godot's non-standard ordering); memory limits (10 MB buffer, 1000 message queue); graceful shutdown. Zero dependencies (Node.js).
- **Takeaway for us:** If we support a **custom command** per server (like OpenCode's `lsp.<id>.command`), users can plug in **bridge processes** for TCP (or other) servers. We only speak stdio to the child process; the bridge translates to/from TCP. No need to implement TCP in our client for MVP; document that "use a bridge" is the supported pattern for TCP-only servers.

### 10.2 Our stance

- **MVP:** Client talks stdio only (spawn server process, or spawn a bridge that talks stdio to us and TCP/other to the real server).
- **Native TCP/socket:** **Out of scope for MVP.** No implementation required. Implementer must document the bridge pattern only (e.g. Godot via godot-lsp-stdio-bridge). Later (optional): native TCP client for already-running servers; lower priority.

---

