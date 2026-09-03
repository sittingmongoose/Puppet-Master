# Shard 032: Additive Correction v4 — Folder Attachments Through The Shared Command (2026-09-03)

Source: `Plans/FileManager.md`

Source lines: L5020-L5074

Source SHA256: `97e57f4d228363a02b686b62bbf28caa177fb5bde9f17e0898a4fabec6fb96d6`

---

## Additive Correction v4 — Folder Attachments Through The Shared Command (2026-09-03)

This section applies `PM_Assistant_v2_Additive_Correction_v4` (`FOLDER-001..008`) to this owner.

### FOLDER-001..003 — One attachment command, one owner

Files and folders both normalize through `cmd.chat.attachment.add` with
`semantic_kind: file | folder`, using the shared attachment request and result owner. The
attachment picker, drag-and-drop, and a File Manager reference path all converge on it. No
parallel folder attachment service exists.

`cmd.chat.add_file_reference` survives only as a **file-specific compatibility alias** to the
shared command. It rejects `semantic_kind: folder`. Its former statement that all folder
references are out of scope is retired.

No `cmd.chat.add_folder_reference` and no folder-specific handler, event, or storage family is
created. A command census must find no independent folder effect; attachment ownership is not
duplicated.

### FOLDER-004 — A folder is a bounded manifest, not a dump

A folder attachment carries a bounded manifest and reference:

```text
folder_root_identity      exact root path identity plus its stable reference
entries / hash policy     which entries are enumerated and how they are hashed
exclusions                ignore rules actually applied
permissions               the read scope that was granted
materialization_status    what has been materialized versus referenced
```

The context compiler selects bounded content from that manifest. A folder is never recursively
dumped into every prompt.

### FOLDER-005..006 — Scheduling and later change

A scheduled folder reference freezes the exact retained manifest and hash and holds or fails when
that version is unavailable at dispatch. Current folder contents are never substituted and the
manifest is not rebuilt at dispatch without an explicit user policy. This is the folder side of
`SMSG-008`.

A folder that changed after a message was sent is disclosed through changed or stale state while
preserving what the agent actually saw. Details show captured versus current identity; historical
message context is never rewritten.

### FOLDER-007..008 — Shared capabilities and separate identities

Folder open, reveal, export, and download reuse File Manager and artifact capabilities with exact
permission and currentness checks. An unsupported download or export is disabled with a stated
reason rather than reimplemented as chat-local file transfer code.

The folder manifest and any selected extracted contents keep separate identities, so context
selection never mutates the attachment itself. A materialization receipt records what was
included and what was omitted, and one extraction is never treated as the folder's canonical
bytes.
