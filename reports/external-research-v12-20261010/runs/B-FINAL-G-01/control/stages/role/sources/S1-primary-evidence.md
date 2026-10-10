# S1 primary evidence: rsync(1)

- URL: https://download.samba.org/pub/rsync/rsync.1
- Version/scope: live upstream manual, unpinned; the assignment targets rsync 3.2.7 on both peers. The page accessed here does not establish the deployed peer versions.
- Input snapshot: setup-worker retrieval at 2026-10-10 03:54:10 UTC, as recorded in the listed corpus.
- Role retrieval: 2026-10-10 04:02:41–04:04:30 UTC window; exact per-call timestamps unavailable. Operation: opened the exact primary URL with web access, then used find/open to inspect the locators below. The retrieved page was current/live at access time.

## Published statements and conditions

- **USAGE (source trailing slash):** examples distinguish copying a directory by name from copying its contents. A trailing slash on the source avoids an extra directory level at the destination.
- **--delete:** removes extraneous files on the receiving side, only in synchronized directories. The manual requires recursive or directory transfer and warns that a whole directory must be selected rather than shell-expanded individual filenames. Excluded files are normally also protected from deletion. Sender-side I/O errors automatically disable deletion unless --ignore-errors is enabled; this is not a rollback guarantee.
- **--delete-excluded:** ordinary include/exclude rules become sender-side-only unless explicitly qualified to affect the receiver too; this removes their usual receiver-protection effect.
- **Dry run:** --dry-run makes no changes and is commonly paired with verbose or itemized output. Itemized output is expected to match a later run except when source/destination trees change externally or system calls fail.
- **Filters:** default exclude rules hide from the sender and protect at the receiver. A leading slash anchors a pattern to the transfer root; a trailing *** can match a directory and its contents.
- **--delay-updates:** updated files are held until transfer end and renamed into place in rapid succession. The manual describes this as an attempt to make updates closer to atomic, not a whole-directory transaction.

Locators checked in the live manual: “USAGE” (lines 63–74); “--delete” (975–982); “--delete-excluded” (1000–1006); “--dry-run” (910–915); “FILTER RULES WHEN DELETING” (1816–1824); “FILTER RULES IN DEPTH” and “PATTERN MATCHING RULES” (1835–1871); “--delay-updates” (1548–1557).

## Applicability and inference

The source statements support the replacement section’s rsync option semantics. The root-anchored /local-notes/*** filter is a proposed application of the manual’s anchoring and *** matching rules. That protection depends on local-notes being at the root of the effective transfer path and no later rule overriding it. Stage isolation, human preview approval, rechecking, incomplete-state handling, explicit publication, and the three checks are product proposals/inferences, not behavior promised by rsync or observations from an executed run.

No rsync command, local fixture probe, application test, or destructive operation was executed. Actual 3.2.7 peer output, path mapping, filter ordering, preview race handling, and product lifecycle evidence remain outstanding.
