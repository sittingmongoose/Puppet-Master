# Independent critic review — D-R1-P03-control

Stage: critic. This review covers the full D-P03 brief, the exact released plan, the complete investigator discovery and draft, the carried source map, and its navigational README. Primary sources in the carried map were opened directly; an additional SQLite PRAGMA reference is recorded in this stage's source map.

## Assessment

The draft is a strong, scope-complete proposal. I found **no materially wrong recommendation and no material omission** against the brief or the released plan. Its main architecture is coherent: inventory a consistent workspace generation; distinguish source omissions, byte integrity, extraction, migration, and usable restore; stage and preview before live mutation; preserve stable identities and references; treat attachment names as labels; and keep the old workspace or prior backup until publication/commit succeeds.

The plan's dispositions are well matched clause by clause:

- The portable records/preferences/attachment package and manifest are retained, with expected-member inventory, versions, identities, references, sizes, digests, exclusions, and missing inputs made explicit.
- “Closed and manifest readable” is correctly rejected as a backup-success condition. Full member verification, reference checks, successful publication, and preservation of the prior full-protection marker are required.
- The consistency assumption under concurrent edits is rejected. The draft correctly limits SQLite snapshot APIs to database state and requires coordination with the matching resource/preference generation.
- Temporary extraction and preview are retained and expanded to item-level consequences, reference health, path/resource limits, and staged migration.
- Empty-workspace restore is supported while retaining the prior generation; merge is an explicit mode with identity/content conflicts and reference rewrites rather than filename-based replacement.
- Migration order and newer/unknown schema behavior are handled by verifying the package first, migrating only a staged candidate, logging/revalidating it, and stopping before live changes on failure or unsupported newer schema.
- Passphrase protection remains an option rather than an unselected dependency. The draft explains KDF/AEAD, recipient keys, metadata leakage, lost-secret limits, and why an authentication failure cannot reliably identify whether credentials or ciphertext are wrong.
- Direct versus staged restore and whole-package versus incremental repository approaches are compared; a self-contained whole-workspace package and staged restore are reasonable first-version proposals, not owner decisions.
- Every requested witness is represented. The draft labels them proposed and says no archive, storage, migration, fault-injection, application, or real-user-data validation was run.

The brief's explicit constraints are preserved: no archive upload; no live deletion before verification; no silent overwrite by attachment name; unavailable references and incomplete protection are visible; no recovery promise for a forgotten sole passphrase; integrity, extraction, and usability are separate; future migration/fault/user-data tests remain proposed. The plan's requirements for interruption, missing members, duplicate names, schema changes, failed merge, and passphrase loss all appear in the proposed witnesses.

## Findings

| Classification | Draft locator | Finding and evidence |
|---|---|---|
| **Unsupported citation** | draft.md, “Per-clause disposition,” row “The implications for references, identifier collisions, and migration order need explicit review,” sentence “SQLite integrity checking covers low-level database structure and constraints, not all app relationships [SRC-SQL-FK].” | The claim is directionally correct, but SRC-SQL-FK points to SQLite's foreign-key support page, which documents FK enablement/defaults and does not define PRAGMA integrity_check. The official [SQLite PRAGMA reference](https://www.sqlite.org/pragma.html) says integrity_check checks low-level database formatting/consistency and UNIQUE, CHECK, and NOT NULL errors, but explicitly does **not** find foreign-key errors; those require foreign_key_check. Add that source and keep low-level integrity, FK validation, and application/external-file reference checks distinct. This citation gap does not overturn the proposed validation boundary. |
| **Minor wording / scope** | draft.md, “Per-clause disposition,” merge row citing SRC-JOP-JEX-IMPORT-DUP; see also “Already covered, rejected, and uncertain.” | Joplin issue #14791 (Windows 3.5.13) reports user confusion that JEX import replaces existing notes and says duplicates arise when the same notes already exist on another device and sync is enabled after import. It is not evidence that importing alone universally duplicates data or that this collection manager should copy Joplin semantics. The draft already calls the example product-specific, but its compact phrasing could foreground the sync condition. The issue is closed and links commit dd29cc2; no release containing that commit was verified. [Issue #14791](https://github.com/laurent22/joplin/issues/14791) |
| **Minor wording / scope** | draft.md, “Executed checks and source scope,” sentence “Only the assigned single-use reveal helper was executed.” | The stage also executed the required native Goal capture and binding guard. Those were mechanics, not archive/application validation, so the substantive statement “No synthetic archive or storage test, application migration, real-data restore or security audit was run” remains accurate. The sentence should distinguish the reveal helper and Goal-capture mechanics from scientific validation. |

No material-wrong or material-incomplete finding was identified. I found no false correction requiring the reviser to restore one of the plan's unsafe assumptions.

## Useful discovery and alternatives

The investigator carried forward useful alternatives rather than collapsing to one unselected stack: ZIP/TAR or a custom container with a strict manifest; raw database copy only with a documented snapshot boundary; self-contained full packages versus a content-addressed repository such as restic; staged candidate-generation restore versus direct in-place mutation; passphrase versus recipient-key protection; and owner decisions for inclusion, merge defaults, compatibility, encryption implementation, rollback retention, and degraded-source policy.

The source limits are generally handled honestly. SQLite and Python docs support only their engine/container behaviors; restic and Joplin examples are clearly product-specific; mutable dev/main references are identified; and the historical restic SIGINT report is not promoted to a claim about current restic releases. The Joplin missing-extension repair is correctly bounded to a Joplin importer path. The age specification supports a concrete mechanism comparison, not a selection or recovery assurance.

## Proposed versus executed validation

The listed interruption, member-integrity, archive-path/limit, migration, merge, passphrase, and usable-restore witnesses are proposals. None was executed. The reveal helper's plan release and the native Goal mechanics do not count as synthetic archive or application validation. Future application migration, crash/fault testing across supported filesystems, and user-data tests remain open.

## Honest unresolved inputs

The exact container/schema and compatibility window, preference/secret inclusion, whether known-missing source attachments block export or yield a degraded package, conflict and delete semantics, encryption package/KDF/recipient UX, optional recovery recipient, staging-space and rollback policy, and supported cross-platform commit/durability guarantee remain owner decisions. The draft states these as open choices rather than inferring them from unrelated products. No reduction of brief scope is warranted.

