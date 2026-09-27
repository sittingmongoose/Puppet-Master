# Packet sweep repairs — 2026-09-27

This bundle records repairs for the September 27 sweep's 17 actionable findings, one metadata discrepancy, two owner-default ambiguities, and all 13 specifically incomplete command mappings. Canonical repairs and their machine companions are on the integration branch. The verified GUI repairs are pushed separately on `fix/packet-ui-20260927` at `60bd24773`; they are deliberately held out of main while the user-confirmed active Settings branch `claude/happy-ramanujan-23lwck` finishes. Integrating that GUI work remains outstanding; do not replace its generated HTML with ours.

## Canonical repairs

- Named Plan consumer scopes and one actual-owner/aggregate comparison cover Orchestrator, PRD Builder, Planning Wizard and plan compilation. Explicit identity, revisions, hashes and a consistent owner snapshot are required; historical membership permits reads only.
- Optional Azure team-project administration is `ADO-008`, a human-only official-page handoff through existing Auth/Onboarding routes. Return is not authentication or creation. Explicit refresh, actual current owner phase, provider resource identity, Git kind and draft/Client fences govern selection.
- Backup verification carries explicit depth and authoritative plan/admission/receipt bindings. The selected concept's **In place** initial choice is explicitly reconciled without granting destructive authority. Normal Ready navigation goes to Planning Wizard.
- Git and Forge command mappings now name closed request/results, preview producers, owner guards, production-intent wiring and fixtures. Runner registration has an authoritative preview producer. The [mapping record](command-mappings.json) disposes every previously partial/unresolved action and preserves the other 155 source-map dispositions by hash.
- WSL acquisition/probes, Apple-specific native proof, actual assurance propagation, and durable internal update scheduling have typed companions. The schedule is keyed by Server/application/channel; successful checks, cache reuse and offline retries cannot be conflated. Storage registers the exact Release-owned state, migration/recovery and retention contract.

## GUI repairs and concurrent work

The separate UI branch fixes instance-bound accounts, external signup, optional Azure administration, immutable recovery-point selection, exact-object search, the normal update-frequency control, Named Plan scopes, performance state tokens, Tour restoration and raw checkpoint content, and stale Origin metadata. Its TestOpus and PMConcept7 outputs are byte-identical at SHA-256 `0e1a0761ee67da7bb3d798df44b03bbc018ffa26005989ec06e0c431f9e25fef`.

The unfinished Settings branch introduces an authored `src/settings` layer. [The port map](ui-port-map.md) explains how to carry semantic fixes into that layer, retain its presentation changes, rebuild from source, and repeat browser checks. Its inspected snapshot is `5853aed29358c705ef36bdc88ae169a245cab12a`. This repair record does not certify that unfinished branch.

## Verification and limits

- Named Plan: 14 focused tests; Azure: 7 focused tests and 31 compared owner/return scenarios; provider fixture-gate enrollment: 9 tests.
- Git: 25 positive records, 27 negative cases and 7 preview joins. Backup depth/admission and Forge runner-producer joins have focused executable checks. WSL/assurance/update scheduling has a shared focused checker also invoked by the central gate.
- UI branch: 9 backup self-tests; 16/16 focused selected-concept browser assertions; Tour Keep, Skip, missing-reference reload refusal and explicit recovery restart scenarios pass. Build/check and TestOpus/PMConcept7 identity checks pass.
- Source evidence paths and SHA-256 values are in [evidence.json](evidence.json). [repair-status.json](repair-status.json) identifies each finding's owner, proof and integration status. The landing gate is evaluated separately against the repository baseline; this report makes no blanket claim that pre-existing governance failures are cleared.

Tour checkpoints persist bounded references, not raw composer/layout state. The concept has no native durable owner-snapshot API: missing restoration basis after reload remains explicitly unavailable until recovery acknowledgement; it does not falsely report restoration/completion. Azure discovery uses labeled synthetic concept fixtures, not live provider proof. Native handlers, production events, storage writers, runtime readiness and performance remain unclaimed. The historical full-performance verifier's old manifest binding was not refreshed to manufacture a passing result. Governance resealing remains the designated Plans agent's work.

Muse Code 1.3 contributor max and Zcode GLM-5.3-Flash max were invoked in native Goal mode. Sol-high contributors reviewed delivered patches; timed-out helpers were quiesced before direct repairs. Static and browser verification above, rather than helper completion claims, determine the repair status.

Source audit: `/mnt/Cursor/PuppetMaster-Evidence/scratch/packet-sweep-20260927/REPORT.md`, SHA-256 `4e9561d68f2106826ae32f77f3c2fe94ff08dafce59477a866d0104a68579ee0`.
