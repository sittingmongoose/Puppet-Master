## 22. Cross-Device Sync

**Concept:** **Sync settings, work, history, message threads, and everything** between instances of Puppet Master so that when the user switches devices (e.g. opens the app on Mac after working on Windows), they can bring their workspace with them and lose nothing. For now: **manual export/import** plus **sync to BYOS (Bring Your Own Storage)**. We offer a number of storage options and support **custom configuration** so users can sync to their own NAS, network storage, or server.

**Relevance:** Users who work on multiple machines (e.g. desktop + laptop, Windows + Mac) expect continuity: same config, same projects, same chat and orchestrator history, same recovery state. Without sync, each install is isolated. Manual export/import and BYOS keep the user in control and avoid requiring a central cloud account.

**What to sync (scope):**
- **Settings:** All app config (tier config, HITL toggles, sound effects, cleanup options, application/project rules, etc.).
- **Work:** Current project context, orchestrator state (phase/task/subtask if run was in progress), PRD/work queue (prd.json), progress and evidence references. Optionally project-level state metadata (not full repo contents).
- **History:** Run history, session list, restore points metadata, analytics/usage snapshots. Enough to show "recent runs" and "sessions" on the other device and optionally restore or inspect.
- **Restore points (full data):** The sync payload includes restore-point **metadata** (point ID, timestamp, file list, project_id) always. Full file snapshot **blobs** (needed for "Restore to point N" on the other device) are **optional** in sync and subject to a configurable size cap (default e.g. 100 MB per project) to prevent the sync payload from becoming excessively large. User can opt in/out of syncing blobs. After import or pull on another device, "Restore to…" and rollback work for points whose blobs are available; points without blobs show metadata but cannot restore files. Same app-data and project_id keying so paths remain consistent. See §8 for restore-point storage and retention.
- **Message threads:** **Chat threads and messages** (including **Interview** threads and messages) are part of backup and sync. Include: Assistant chat history (all threads, full message content per §11 of assistant-chat-design.md -- messages, prompts, thought streams, code block diffs, subagent blocks, plan/todo, queue state, activity transparency data, attachments refs), **Interview** threads and messages (Q&A, phase state, thought stream, stored conversation or plan panel state). So the user can continue a conversation or see prior threads on the other device; backup and sync-to-other-devices must include this data.
- **Other:** Recovery/snapshot state, open tabs/windows layout if desired, project list and recent projects. Exclude: secrets (API keys, tokens) unless user explicitly opts in with encryption; large binary blobs (e.g. full evidence dirs) can be excluded or summarized by reference.

**Mechanisms:**

1. **Manual export/import (for now).**
   - **Export:** User triggers "Export" (e.g. from Settings or a Sync menu). App writes a **sync bundle** (single file or folder with a well-known structure: config, state, threads, history) to a user-chosen path (local folder, USB drive, or network path they have mounted). Optionally include timestamp and device label so the user can tell exports apart.
   - **Import:** On the other device, user triggers "Import" and selects a previously exported bundle (file or folder). App merges or replaces local state with the imported data per user choice (e.g. "Replace all" or "Merge"). Same sync payload format so export/import and BYOS sync share one data model.
   - No automatic sync; user explicitly exports on one machine and imports on the other. Simple and predictable.

2. **Sync to BYOS (Bring Your Own Storage).**
   - User configures a **sync target**: storage they own or control. App can **push** current state to that target and **pull** from it (e.g. on startup or when user clicks "Sync now"). Same payload as export/import; target is a folder or path the app can read/write.
   - **Storage options we offer:** Several presets or connectors so users can pick what they use, plus a **custom** option for their own setup:
     - **Local or mounted folder** -- e.g. a folder on the machine that is also mounted on other devices (USB drive, shared drive letter, or OS-mounted network path).
     - **NAS / network storage / server** -- Support syncing to the user's own NAS, network share, or server. Examples: SMB/CIFS share (e.g. `\\nas\puppet-master-sync` or `smb://nas/puppet-master-sync`), NFS mount path, SFTP, WebDAV, or any path that is accessible as a folder on the OS (e.g. Synology, TrueNAS, Windows file share, Linux NFS export). User configures connection (host/path, credentials if needed). Custom configuration allows them to point at their own NAS or server.
     - **Cloud folder (user's account)** -- If we support it: Dropbox, iCloud Drive, OneDrive, or similar, as a folder path the user has linked. Still BYOS (their account); we just read/write that folder.
   - **Custom configure:** For "their own" storage we don't list as a preset, user can **custom configure**: e.g. enter a path (local or UNC), or protocol + host + path + credentials (SFTP, WebDAV, SMB). So they can sync to their own NAS, homelab server, or any storage they can expose as a readable/writable target. One consistent sync payload format; the app only needs to read/write files in a target location.
   - **Behavior:** Optional "Sync now" (push and/or pull); optional "Sync on startup" (pull from BYOS when app opens). "Last synced at" and basic conflict policy (e.g. last-write-wins or prompt). No account with us; user manages storage and access.

**Implementation directions:**
- **Data model:** Define a **sync payload** (e.g. JSON or compact binary) that includes: config blob, state blob (orchestrator, recovery, project list), **chat thread and message data** (Assistant and Interview threads, full message blobs per thread -- see assistant-chat-design.md §11 for what is persisted per thread), and thread/history index. Same format for export file/folder, for backup, and for BYOS target directory. Version the payload so older clients can skip or migrate. Chat and interview threads/messages are required for backup and sync; the payload must include them so the user's conversation history is available on other devices.
- **Export/import:** Export = write payload to user-selected path. Import = read payload from user-selected path; merge or replace per user choice. Use existing file dialogs and path handling; support both "single archive file" and "folder with manifest" if useful.
- **BYOS:** Config stores sync target (type: local/mounted, smb, sftp, webdav, or custom; connection details as appropriate). Push = write payload to target; pull = read from target and apply. For NAS/network/server: use OS-mounted path where possible (user mounts the share, we write to a path); or integrate a small client for SMB/SFTP/WebDAV if we don't rely on the OS mount. Custom = user provides path or protocol+host+path+credentials.
- **Conflict resolution:** For import and pull: last-write-wins with timestamp, or merge by section, or prompt user. Document policy; avoid silent overwrites of long-running work.
- **Security:** No sync of secrets by default; if user opts in, encrypt secrets in the payload (e.g. client-side with user-derived key). For BYOS over network, use protocol's security (e.g. SMB over SMB3, SFTP, WebDAV over HTTPS).

**Non-goals for this section:** Syncing the contents of target project repos (that is git or the user's own repo sync). This section is about **Puppet Master's own** settings, state, and message history. A central Puppet Master cloud account (we host the backend) is out of scope for this plan; the focus is manual export/import and BYOS.

---

