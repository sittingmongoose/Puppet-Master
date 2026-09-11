# Jujutsu research — deliverable 1

Prepared the real Jujutsu case from snapshot `bc7569b3f5bcd8147bc4a8b51eee6d03255a0e46` on branch `research/jujutsu-20260911`. No product findings or corrections are claimed. Research has not started.

The frozen corpus contains 199 original-byte Plan sources (30,194,334 bytes). The case contains 204 files including the plain product brief, navigation, source provenance and manifest. `prepare_case.py` was used unchanged with an explicit include for every selected path and `--plans-dir` pointing at the fresh local worktree Plans.

The census accounts for all 6,694 tracked Plan paths. Its case-insensitive `jujutsu|\bjj\b` search found 83 paths: 42 included current bindings and 41 excluded generated, lineage or traceability paths. Each match has its original line, Git blob, SHA-256 and reason in the external census. The compact selection retains match line numbers, inclusion reasons and source identities. Non-matches are also accounted for externally, including the named consumers admitted without a literal topic match.

The authoritative index and owner maps establish the topic boundary. Full Jujutsu, Source Control, Permissions, FileSafe, Backup/Restore, Shared Integration Runtime, Settings, Onboarding/Doctor, command/contract/wiring and named consumer sources are retained. Selected owners' named schema/fixture/acceptance companions and transitive local schema references preserve validation context. Ancillary companions and unrelated sections do not expand topic scope. Generated shards/indexes, ledger records and audit captures supply no competing product prose; the runtime disposition register is excluded as traceability under its own owner. Current central command adjudication and touch-closure registries remain included as static routing contracts.

All selected sources were available and byte-identical to both the snapshot Git blobs and local worktree. Referenced but absent ancillary paths are recorded in `census.json` without invented replacements. This is source preservation, not a claim that every reference in the wider Plans resolves.

Read `product-brief.md` for the neutral product description, `selection.json` for the compact boundary and source identities, `verification.json` for integrity checks, and `evidence-receipts.json` for exact external paths and SHA-256 values. The source corpus and full census stay outside the repository at `/home/sittingmongoose/PM-Experiments/jujutsu-20260911/d1`. No answer key, candidate findings, research outputs, source rewrites, governance reseal, readiness change, implementation, WorkNodes or NodeSeeds were created.

Independent review is required before this report is committed and pushed. Its final receipt is recorded separately in `independent-review.json`. D1 stays on the research branch; it is not landed on main.

Validation is case-integrity-only. Plan-governance gates and shard regeneration are not run for this report-only change; `Plans` is unchanged. No runtime, native adapter, security, visual, performance or product-readiness result follows from this case.
