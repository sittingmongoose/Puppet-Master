# S04 — OCFL released change history

- Change-log URL: https://ocfl.io/1.1/spec/change-log.html
- Release history URL: https://github.com/OCFL/spec/releases
- Versions: OCFL 1.1.0 release tag `1.1` / commit `4b05472`; OCFL 1.1.1 release tag `1.1.1` / commit `c3f88b3` (latest release listed in the release page). The change log itself records changes from 1.0 through 1.1.1. Accessed 2026-10-10T04:14:43Z.
- Locator: change log §§ “Changes from OCFL v1.0 to v1.1.0”, “Clarifications in v1.1.0”, “Clarify manifest requirements in historic inventories”; release page 1.1.1 and prior 1.1 entries.
- Observed operation: Read official release page and specification change log; no code was built or run.

## Evidence and conditions

The log describes 1.1.0 as correction/clarification and a backwards-compatible addition of rules about conformance of prior object versions. Its historic-inventory entry cites issue #538 and says wording was changed to make clear that each historical inventory must reference every file in its version directory. It separately cites clarifications concerning stable object ID, version-directory/content-directory rules, UTF-8 inventory JSON, and manifest structure. The release page identifies 1.1.1 as the latest tag and preserves 1.1.0 documents.

This establishes the release in which the issue's wording changed, not a claim that all third-party implementations correctly enforced it. The proposed pilot should choose an implementation/validator only after checking support for the exact released version and negative fixtures.
