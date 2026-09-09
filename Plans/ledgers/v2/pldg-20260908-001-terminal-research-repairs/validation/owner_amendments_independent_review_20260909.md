# Deliverable 1 independent review

Verdict: **PASS — scoped canonical owner amendment.** No required corrections. Reviewed the actual two-file working-tree diff against HEAD, DL-035, accepted atom-0003/atom-0004 in `pldg-20260908-001-terminal-research-repairs`, and the P1/P2/R1/R2 acceptance source interpreted under DL-035. The earlier OS-only disposition and candidate-library recommendations remain historical source, not current authority. No deliverable 2–5 work was reviewed or authorized by this verdict.

## Acceptance coverage

| Requirement | Actual coverage and judgment |
| --- | --- |
| PM owns engine and host | Section15 line 619 enumerates VT parser, grid/scrollback, logical selection, command-block overlay, renderer adapter and direct-OS-API PTY host. It explicitly bars third-party emulator/parser/PTY-abstraction libraries and reference-code reuse while retaining the named terminals as study references. SMPFS-070 canonical text mirrors this direction. PASS. |
| Console deployment is distinct from engine reuse | Section15 line 619 and Release lines 24–36 distinguish the approved OS-component package from forbidden terminal engine/host-library adoption. No reference code or third-party core is selected. PASS. |
| R1 retargeted to PM acceptance | Section15 line 623 covers construction/resize bounds, 0/1/2-column wide characters, last-valid hidden/zero-area geometry, latest valid desired geometry and engine/PTY agreement; surviving logical selection/exact copy; coherent full/damage rendering and overlay invalidation; synchronized-update boundaries, parser/response continuity and idle service; bounded associations and disclosed fidelity degradation. The introductory sentence explicitly retargets the original R1/R2 checklists. It does not adopt Alacritty’s minimum dimensions, timing/buffer constants, cell cap or indexing algorithm. Existing input, parser, output-read and platform fixtures remain required at line 628. PASS. |
| R2 retargeted to PM acceptance | Section15 line 624 includes failure containment, partial-resource ownership, execution-time cwd and quoting, buffered progress without another producer write, responsible-reader continuity, distinct exit/drain/backing/channel/UI-closure facts, injected setup and cwd races, barrier-controlled wakeup/readiness, sustained output, versioned teardown and Client-independent Server continuity. Existing detailed independent-channel service and cleanup gates remain intact at line 647 and SMPFS-070. No cleanup rollback or attach-recovery replay is implied. PASS. |
| P2 package, provenance and fallback | Section15 line 626 and Release lines 26–28 require PM-managed version pinning, verified installation, and explicit disclosed OS fallback for absent/untrusted/incompatible bundle. Unavailable/unsupported OS fallback produces capability loss/startup failure. Version/source/effective capability and fallback reason route to SMPFS-132. No support expansion, live hot swap or replay. Creation failure stays typed; uncertain startup does not trigger blind alternate-copy retry. PASS. |
| Supply-chain admission and lifecycle | Release line 26 names trusted installation/loader pairing, official-source/build provenance, hashes/signing, SBOM/license, compatible layout/exports/ABI/architectures and release/update/rollback ownership. RSC-003/006/007/008 are explicit ContractRefs; RSC-008 supplies existing signature, artifact hash, provenance, SBOM and update/rollback minimum gates. Package publication is explicitly insufficient. Failed update/rollback yields a verified usable path or actionable unavailability. PASS. |
| P2 acceptance | Release line 32 and Section15 line 626 retain absent/untrusted/incompatible package cases, installation/provenance verification, creation failure, supported-host resize/Unicode/teardown, update/rollback and visible source/version/fallback disclosure. No example research package version becomes a shipping pin or support promise. PASS. |
| Output/read independence and evidence limits | Section15 line 628 and unchanged SMPFS-070 distinguish independently known completion from partial/unavailable retained output; Release line 32 preserves the same distinction. Research reports/static checks do not establish native acceptance. PASS. |
| Amendment before new compilation | Both accepted atoms declare owner-prose materialization, empty planned PlanUnit lists and in-review status at inspection. Ordered PlanUnit IDs are unchanged: Section15 157 and Release 16. Existing SMPFS-070 metadata is synchronized; no new engine/host PlanUnit is introduced. PASS. |

## SMPFS-132 synchronization adjudication

No blocking SMPFS-132 edit is required for this bounded owner-prose phase. Its existing canonical contract already owns PTY backend, ConPTY/OpenConsole/conhost version and degraded reason, and its acceptance detects incompatible pairs. Nothing in that unit asserts OS-only deployment or contradicts DL-035. The new Section15 and Release prose explicitly binds actual bundle-versus-OS source/version, effective capability and fallback reason to this owner. This is sufficient canonical synchronization without creating or expanding a PlanUnit in deliverable 1. Later compilation must consume this adjacent owner prose; the existing short SMPFS-132 acceptance list alone is not a complete substitute for the new deployment contract.

## Independent verification and scope

Read-only inspection of canonical files and accepted atoms; this reviewer edited only this report. All 157 Section15 and 16 Release YAML blocks parsed successfully with PyYAML; ordered PlanUnit IDs matched HEAD exactly. `git diff --check -- Plans/Section15_MVP_Promoted_Features_Spec.md Plans/Release_Supply_Chain.md` passed. No native process, terminal, loader, update/rollback or platform fixture was executed. This is not a runtime, readiness, full governance, generated-artifact or commit-verification verdict. Root retains responsibility for scoped regeneration and subsequent checks/commit.

## Reviewed SHA-256 identities

| Input | SHA-256 |
| --- | --- |
| Section15 working tree | `2b3bb13d9e954b51e8aa1fc2d47e2d429b9b39f3c5f9708de15ae0c366237f69` |
| Section15 HEAD baseline | `3ea02c66a9d6a2fd1e4d7fe2b1124a1cc89786aaaa8fadc65e9cf513e2198b1f` |
| Release working tree | `d6f13a13d260f4e1e22d0b082f19c8a68f029add87b554329882175f158994ef` |
| Release HEAD baseline | `118be1d006503d8868bd2c1f8a80b1ca1c2c3f80417be9090296bb82770d777c` |
| Accepted ledger records file at review | `c0d87ad52013b3c7d23374938a9a3f96e23d01a484b7516ae0d7d60187b2f27e` |

Ledger status updates after this review may legitimately change the records-file hash. Changes to the reviewed owner prose require a delta review.
