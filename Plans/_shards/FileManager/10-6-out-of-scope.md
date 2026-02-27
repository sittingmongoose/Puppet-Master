## 6. Out of scope

**MVP** in this plan means the **desktop build scope**: all features listed in §§1-11 are in scope for the initial desktop release unless marked optional. **LSP is in scope for MVP** (§10.10). There are no items explicitly out of scope for the current build beyond what is marked optional in the plan.

### Implementation order (summary)

Implement in roughly this order so that contracts and single sources of truth exist before features that depend on them:

1. **Open-file contract (§4.1)** -- Single request/response shape and one code path. Implement first; all "open file" callers use it.
2. **Editor core (§2)** -- Buffer model, tabs, save/revert, persistence schema (§2.9), transient UI states. Editor is the only target for open-file.
3. **File Manager (§1)** -- Tree, virtualization, expand/collapse; "select file" calls open-file contract. D&D (§1.1) can follow.
4. **Click-to-open (§5)** -- Chat and footer invoke open-file contract; no separate viewer.
5. **@ mention (§3)** -- Same file list as File Manager; UX details in assistant-chat-design.
6. **Presets (§11)** -- Detection and tool download; required for LSP server mapping and run/debug (§10.4).
7. **LSP lifecycle and core (§10.10.2, §10.10.1)** -- Start/stop server, protocol, editor integration; then §10.10.3-10.10.8 features.
8. **Editor enhancements (§10.1-10.9)** -- Search, layout, run/debug, watcher, review, etc.; many depend on §2 and §11; LSP features depend on §10.10.
9. **Image/HTML (§8)** and **Tabs for Terminal/Browser (§9)** -- Can be parallelized with editor work once layout and tab model exist.

**Critical path:** §4.1 → §2 → §1 and §5; then §11 → §10.10 → remaining §10.

---

