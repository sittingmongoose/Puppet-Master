# S06 — git-annex identity and location manuals

- URLs: https://git-annex.branchable.com/git-annex-whereis/ ; https://git-annex.branchable.com/git-annex-log/ ; https://git-annex.branchable.com/git-annex-fsck/
- Version: online manuals did not identify a released version in the inspected pages; treat these as unversioned, version-sensitive documentation. Read 2026-10-10T04:14:49Z.
- Locators: `whereis` Description and Note; `log` Description and path-history limitation; `fsck` Description, `--from`, and `--fast` options.
- Observed operation: Read official project manuals; git-annex was not installed, configured, or executed.

## Evidence and applicability

`whereis` reports repositories believed to hold content but explicitly does not contact them to confirm they still have it; it reports last information received. `log` shows repository add/remove history but can lose history with `annex-forget`, may be suppressed by private settings, and for a path reports current content rather than different content at earlier commits. `fsck` checks annexed content consistency and can check a remote; the normal remote check copies content to verify it, while `--fast` avoids checksum work and checks only expected presence. Thus git-annex is an interesting content-key/location-tracking option for a technically supported team, but location metadata alone is not live custody proof and `--fast` is not a content integrity check. For this gallery pilot it is an optional alternative, not the recommended dependency; a simple manifest plus logged offsite receipt and restore test better fits the no-new-platform constraint.
