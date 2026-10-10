# Reviser source index — A8-01-treatment

Source IDs S01–S06 are preserved exactly from the investigator's source map. The reviser independently reopened the governing primary sources and retained the same ID-to-source bindings. Exact locators, versions or commits, access-time availability, observed operations, applicable conditions, and scope limits are in [`../source-map.json`](../source-map.json). Exact web request timestamps were not exposed; source-specific access is recorded as UNKNOWN with the bounded UTC review window.

| ID | Primary source | Use in final |
|---|---|---|
| **S01** | [RFC 8493: BagIt v1.0](https://www.rfc-editor.org/rfc/rfc8493.html) | Bag/package structure; manifest completeness versus digest validity; SHA-256/SHA-512 support and default modality; optional human-readable/custom tags; path normalization and Windows/Unix interoperability. |
| **S02** | [OCFL 1.1 specification](https://ocfl.io/1.1/spec/) | Filesystem-native version/object model; stable ID and inventory state; content-manifest scope; root inventory MUST, per-version inventory SHOULD, and sidecar for each inventory present. |
| **S03** | [OCFL issue #538](https://github.com/OCFL/spec/issues/538) | Bounded example of ambiguity about manifests in historical inventories; no data-loss incident claimed. |
| **S04** | [OCFL 1.1 change log](https://ocfl.io/1.1/spec/change-log.html); release tags [1.1](https://github.com/OCFL/spec/releases/tag/1.1) and [1.1.1](https://github.com/OCFL/spec/releases/tag/1.1.1) | Released v1.1.0 clarification for #538; tag/commit identities and subsequent 1.1.1 release. |
| **S05** | [PREMIS Data Dictionary v3.0, Library of Congress](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf) | Fixity algorithm/digest versus recorded check Event, datetime and outcome; inspiration for a plain custody log, not conformance. |
| **S06** | git-annex [whereis](https://git-annex.branchable.com/git-annex-whereis/), [log](https://git-annex.branchable.com/git-annex-log/) and [fsck](https://git-annex.branchable.com/git-annex-fsck/) manuals | Bounded optional content-key/location alternative and limits on stale location reports and `--fast` checks. |

The sources are public primary specifications, release records, or the project's own manuals. Their inspection was read-only research; no product, validator, install, account, copy, or restore was run. The full research proposal and each source's exact relevance appear in [`../final.md`](../final.md).
