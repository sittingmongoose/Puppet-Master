# Critic source index — B12-P02-control

Directly opened primary evidence for the independent review is recorded with full identity, locator, access time, observed operation, condition and applicability in [../source-map.json](../source-map.json). Existing SRC IDs retain their investigator bindings. The critic-only Apple XPC page is CRIT-SRC-01. No source code was executed.

## Runtime and worker lifecycle

- <a id="src-01"></a> **SRC-01 — Tokio spawn_blocking 1.53.2.** [Function docs](https://docs.rs/tokio/1.53.2/tokio/task/fn.spawn_blocking.html); started blocking closures cannot be aborted.
- <a id="src-06"></a> **SRC-06 — Windows Job Objects.** [Win32 docs](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects); child inheritance, breakaway, limits, termination and nested-job version conditions.
- <a id="crit-src-01"></a> **CRIT-SRC-01 — Apple XPC.** [Current Apple overview](https://developer.apple.com/documentation/xpc?language=objc); launchd service lifecycle, not a per-request timeout/kill contract.

## Sandboxing and cache validity

- <a id="src-07"></a> **SRC-07 — Linux Landlock.** [Kernel docs](https://docs.kernel.org/userspace-api/landlock.html); ABI-sensitive filesystem/network rights, no_new_privs, descriptors.
- <a id="src-13"></a> **SRC-13 — freedesktop Thumbnail Managing Standard 0.9.0.** [Specification](https://specifications.freedesktop.org/thumbnail/latest-single/); seconds-resolution mtime caveat and cache metadata.

## Implementation history

- <a id="src-15"></a> **SRC-15 — Zotero v7.0.12 attachment preview, pinned commit 6af5a484fd6688aab23150938d69df42dfca10e4.** [Source](https://github.com/zotero/zotero/blob/6af5a484fd6688aab23150938d69df42dfca10e4/chrome/content/zotero/elements/attachmentPreview.js); 3-second Promise.race and item-ID guards.
