# Proposal and evidence - finding F110

Finding record: `reports/jujutsu-research-2026-09-11/continuation3/final/comparison.json`,
`/findings/109`, SHA-256 `c3006253a5c68074109312747feb67130fb6e12d4f82c66132b268487156370b`.

    "finding_id": "F110",
    "title": "New-repository object-format selection",
    "classification": "optional_capability",
    "proposition": "Offer an evidence-gated user choice of object format when creating a new JJ
    repository, and show discovered effective format for existing repositories.",
    "arms": ["premium"],
    "continuation_credit": ["premium/J0028-compare"],
    "distinctness": "F050 requires exact engine/CLI/repository-format qualification and truthful
    unsupported states. It does not require exposing a creation-time user selection control.
    Qualification is a prerequisite to the picker, not the picker itself."

Source note, lines 91 to 95 of
`/mnt/Cursor/PuppetMaster-Evidence/jujutsu-followup-20260911/continuation3/adjudication/sources/premium/J0028-compare/notes.md`,
SHA-256 `469c95597f5d7d498d549b6dd319f98996a354e88a05d771ca17b719a52d9bfe`, verbatim:

> **Optional proposal:** expose an object-format choice for newly created JJ repositories in the existing
> Source Control setup flow, with discovered effective format shown for existing repositories and
> unsupported choices disabled using current capability evidence. Benefit: users can deliberately choose
> stronger object hashing where their tools/remotes support it. Dependencies: a typed new-repository
> request extension, owner-DRY format evidence, certified backend/library/transport/provider profiles,
> setup/cancellation fixtures and clear immutable-format copy. Tradeoffs: extra setup complexity and a
> larger support matrix; SHA-1 remains more widely compatible according to the pinned native docs. Keeping
> current setup behavior and recording the effective format is the lower-scope alternative. No default
> change, cross-format migration, or universal SHA-256 support is approved by this note.

That dependency list is the scope of this ledger. Nothing outside it is planned here.
