# Investigator source index

Read-only source research for run A8-01-treatment. Source IDs are stable within this stage; do not rebind them. The source map at `../source-map.json` is the structured identity/locator record. Research access occurred 2026-10-10 04:14:43–04:14:49 UTC. Notes paraphrase the located passages; they are bounded summaries, not copies of source documents.

| ID | Primary source | Applicability | Note |
|---|---|---|---|
| S01 | [RFC 8493, BagIt v1.0](S01-bagit-rfc8493.md) | Package structure, integrity/completeness, hash choice, human-readable tags, path interoperability | Governing format; informational RFC, published Oct 2018. |
| S02 | [OCFL specification v1.1](S02-ocfl-spec-1.1.md) | Filesystem-native object/version model, stable identity, inventories, path rules, immutable versions | Current released 1.1.1 text reviewed; community specification, not a hosted preservation service. |
| S03 | [OCFL issue #538](S03-ocfl-issue-538.md) | Bounded historical example of ambiguous version-manifest wording | Closed issue in 1.1 milestone, linked to editorial PR #547. |
| S04 | [OCFL 1.1 change log and releases](S04-ocfl-release-history.md) | Released clarification and applicability of issue #538 | Confirms v1.1.0 wording clarification and release history. |
| S05 | [PREMIS Data Dictionary v3.0](S05-premis-3.0.md) | Lightweight asset/fixity/event/agent ledger design | Standard data model; proposal is inspired by it, not a claim of PREMIS conformance. |
| S06 | [git-annex manuals](S06-git-annex.md) | Alternative content-key, repository-location and fixity mechanism | Unversioned online manuals; implementation option, not selected for this pilot. |
