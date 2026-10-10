# Critic source index

Stable source IDs are preserved from the investigator package. Exact source identities, versions, locators, access-time availability, observed operations, conditions, and applicability are in [source-map.json](../source-map.json). Direct primary-source review was read-only; exact request timestamps were not exposed, so they are recorded as UNKNOWN rather than reconstructed.

| ID | Primary evidence | Critic use |
|---|---|---|
| S01 | [RFC 8493: BagIt v1.0](https://www.rfc-editor.org/rfc/rfc8493.html) | Package scope, manifest completeness/integrity, SHA modality, tag semantics, filename normalization. |
| S02 | [OCFL 1.1 specification](https://ocfl.io/1.1/spec/) | Version directories, per-version manifest requirements, required root inventory and optional per-version inventories. |
| S03 | [OCFL issue #538](https://github.com/OCFL/spec/issues/538) | Original ambiguity and issue status; not evidence of data loss. |
| S04 | [OCFL change log](https://ocfl.io/1.1/spec/change-log.html); [1.1 release](https://github.com/OCFL/spec/releases/tag/1.1); [1.1.1 release](https://github.com/OCFL/spec/releases/tag/1.1.1) | Released clarification and version/commit identity. |
| S05 | [PREMIS v3.0, Library of Congress](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf) | Fixity fields and recording a check as an event/outcome. |
| S06 | [git-annex whereis](https://git-annex.branchable.com/git-annex-whereis/); [log](https://git-annex.branchable.com/git-annex-log/); [fsck](https://git-annex.branchable.com/git-annex-fsck/) | Bounded alternative and limits on location/check claims. |

Selected excerpt paraphrases are in [critique.md](../critique.md), with citations to these exact URLs. No full source text was copied into the stage.
