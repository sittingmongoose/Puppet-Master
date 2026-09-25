# Project deletion handoff, sound import and plugin discovery

2026-09-25; bounded repairs after capability commit `0679ce672`.

The existing UCC-124 Project data-deletion payload required an enumerated data
hash and strong confirmation, but its closed Project request omitted both. The
new regression reproduced five failures: missing required data/confirmation
accepted, valid catalog fields rejected, and missing production schema binding.
The corrected request requires `expected_project_data_sha256` and
`confirmation_strength: "strong"` only for `cmd.project.delete_data`, accepts its
optional `reason`, and forbids those fields on other actions. The one existing
wiring entry now binds the genuine Project request/result. Original currentness,
confirmation, permission, holds, deletion-record/event and compaction authority
remain Storage-owned; a schema-valid string proves none of those runtime facts.
No deletion is executed and no handler is enabled.

SP-222 now retains all seven accepted PeonPing/OpenPeon category mappings,
unknown-category disabled/unmapped behavior, per-member format rejection,
manual review of unknown versions, safe paths, content-hash linking/relabeling,
and explicit refusal of built-in asset deletion. UCC-103 consumes that owner;
hide/disable is not a substituted delete. Audibility, quiet/focus, license and
no-third-party-hook-runtime constraints stay intact. Plugins now specifies
immediate-child package skill discovery without changing recursive global Skills
roots, closed PM manifests, required/optional components or external adapters.

Verification: all 23 Project tests and seven sound/plugin metadata tests PASS.
The real isolated Project contract gate passes 49 positives / 62 negatives.
Full gate PASS: 45 pairs, 1,303 positives, 4,410 negatives, zero findings.
Shard generation/check PASS: 99 documents / 2,746 shards. Plan index
generation/validation PASS: 6,733 units / 26,410 acceptance units. No WorkNodes,
NodeSeeds, native runtime proof, governance refresh or main landing.

Evidence:

- Full gate: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/project-delete-sound-plugin-gate-001/stdout`, SHA-256 `1eb90f7014af5f5c6186570588c5c60211b524e8e97563913b0c6bd957c7df38`.
- Independent Project review: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/packet-wide-rebaseline/project-delete-data-independent-review-20260925.md`, SHA-256 `aa3287bbdf7d83ac24926ca835415b5a4b29c558569d244a0d02f7fab97a95d5`.
- Finite authority review: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/packet-wide-rebaseline/finite-authority-adjudication-20260925.md`, SHA-256 `cb55e48328455388cc38f7fb86789a0afbabbdda1f1814d190f739e343045c60`.
- Sound source: `Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json`, SHA-256 `75ae8b1b517b6b93447f077f82d9fc3ecd2af74cd77cf91dc6f7adfa20147b97`; compiled atom-0068 explicitly names SP-222 as a target. This repairs that bounded lost transfer, not a recompile or closure claim for the whole legacy ledger.
- Plugin source: `/mnt/Cursor/PuppetMaster-Evidence/misc/packet-gap-closure-20260910/sources/legacy-custody/raw/PKT-04-pm-egolite-hermes-origin-browser-scm-implementation-package-2026-08-17/PM_Egolite_Hermes_Origin_Browser_SCM_Implementation_Package_2026-08-17/sources/01_EGO_EVALUATION.md` §9.4, SHA-256 `c867b26f58b910773c18240523c9ef674e6b45a1baac9dde67a52734364da550`.

Settings/Server residual source review continues with exact identities. Usage
refresh/export typed joins, unresolved import semantics and other independently
identified owner questions are not closed by these repairs. Protected newer
Assistant, Back Seat Driver, Context Lens, Help/Teacher and Azure topics remain
untouched. The separately reported landing hold remains.
