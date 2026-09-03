# Shard 016: Plugin Package And Full-Thread Artifact Addendum - 2026-08-31

Source: `Plans/Release_Supply_Chain.md`

Source lines: L950-L1080

Source SHA256: `118be1d006503d8868bd2c1f8a80b1ca1c2c3f80417be9090296bb82770d777c`

---

## Plugin Package And Full-Thread Artifact Addendum - 2026-08-31

This addendum consumes the Plugins owner's portable/native manifest adjudication and the Full Thread Performance distribution requirements. Release Supply Chain owns package source, publisher, hash/signature/trust, license, SBOM, provenance, architecture/platform compatibility, known-bad quarantine, update-diff admission, rollback-artifact proof, and release acceptance. It does not parse or merge plugin component semantics, activate plugins, own `RuntimeResourceGovernor`/`ObservableWork`, register commands/events, or create a second installation/plugin runtime.

### Plugin package supply-chain proof

PM-internal interchange `plugin.json` and PM-native `pm-plugin.json` are separate signed subjects. The interchange name is not a claim that its path is directly loadable by OpenAI/Codex, Claude Code, or another external agent. A package with both binds both manifest hashes, package hash, exact shared `id`/`version`, archive-entry inventory hash, normalized final-tree hash, publisher/signing identity, trust root, license, SBOM, provenance, target platform/architecture, known-bad result, and containment proof. Release admission fails closed if either manifest changes after signing, the two identities disagree, an entry or resolved link escapes the package root, the final tree differs from the signed inventory, a privileged PM component is unsigned/untrusted, or a mandatory license/SBOM/provenance/rollback ref is missing.

`PluginPackageSupplyChainProof` includes:

```text
proof_id, package_id, plugin_id, version, package_generation,
portable_manifest_sha256?, pm_manifest_sha256?, package_sha256,
archive_inventory_sha256, normalized_tree_sha256,
publisher_ref, signature_algorithm, key_id, trust_root_ref,
license_ref, sbom_ref, provenance_ref, known_bad_check_ref,
target_platform, target_architecture, runtime_compatibility_ref,
archive_containment_ref, symlink_policy, resolved_containment_verified,
PortableConformanceReport_ref?, AgentPluginConformanceReport_ref?,
permission_capability_diff_ref?, component_diff_ref?,
rollback_package_proof_ref?, admission, failure_reason_code?, observed_at
```

`admission` is exactly `admitted | admitted_portable_only | blocked_mismatch | blocked_untrusted | blocked_containment | blocked_compatibility | blocked_known_bad | blocked_missing_evidence | quarantined`. `admitted_portable_only` authorizes only the portable Skills/MCP path and never PM-native activation. A cached artifact, catalog row, local directory, package-manager exit zero, or matching version string is not provenance or activation proof.

An update diff binds old/new package and manifest generations and reports publisher/signature/trust-root, license, SBOM, provenance, component, permission, capability, sandbox, executable/argv, environment, network, and data-root changes before approval. The last verified generation remains available until replacement commit. Rollback requires the exact prior package proof, compatibility ref, activation receipt, and data-migration disposition; missing or mismatched rollback proof produces recovery-required/quarantine rather than a guessed success.

Provider CLIs remain governed by `RSC-010`; plugin packaging cannot smuggle a provider CLI, Playwright runtime/facade, secret, mutable Tool Store payload, or unapproved executable into PM core/default images. Portable and PM-native plugin packages are counted separately from PM core, bundled CEF, on-demand capabilities, external provider/source-control tools, project toolchains, and separately published symbols.

### Full-thread release and platform artifact gates

Release artifacts preserve a portable compatibility baseline. The x86-64 compatibility build cannot globally require AVX2, AVX-512, `target-cpu=native`, or one vendor family. Proven hot kernels may select portable/SSE4.2/AVX/AVX2-BMI2-FMA/optional AVX-512 implementations once at runtime using capability detection and versioned representative profiles; every optimized path retains a portable reference and equivalence, fuzz, boundary, end-to-end, old-hardware, and unsupported-capability fallback evidence. Native arm64 helpers are native artifacts, not translated x86 assumptions.

Release tuning may use optimized libraries, LTO, and PGO only with reproducible toolchain/config/profile identities and representative versioned scenarios. Handwritten assembly is admissible only after measurements show compiler/intrinsic output remains inadequate, with ABI/unwind/platform/feature/fallback evidence. An optimized artifact cannot silently replace the compatibility artifact on an unsupported host.

Platform admission covers native Windows without WSL, optional WSL distributions as separate environments, native macOS arm64 plus optional supported Apple Linux environment, Linux X11/Wayland, standalone Server, Docker/TrueNAS/Unraid, and namespace-scoped Kubernetes artifacts where supported. Each artifact carries target OS/architecture, minimum compatibility, signing/notarization, renderer/backend selection, sandbox/provisioning prerequisites, and exact installer/update/rollback evidence. Missing runners remain `not_run` with residual risk, never pass.

Installed-size budgets report PM core, bundled CEF, each renderer/backend, Safe UI/recovery artifacts, on-demand capabilities, provider/source-control tools, project toolchains, plugin packages/data, and debug symbols separately plus combined supported configurations. Symbols publish separately. Duplicate tool versions, unused Slint backends/renderers, provider CLI pre-seeds, and unreferenced package payloads fail size admission. Renderer order remains bakeoff-evidence-gated across themes/platforms, old GPU/CPU, VM/RDP, Wayland/X11, resize, effects, startup, frame, idle, memory, and package size; release prose cannot freeze an unmeasured winner.

Release acceptance consumes runtime benchmark receipts for cold/warm launch, same-frame command acknowledgement, pause/stop latency under saturation, provider-fragment paint, 1/10/50/200 logical threads, many named Plans, queue/fairness, process-tree RSS, unified graphics/media memory, idle CPU/wakeups/network/disk, low-resource/thermal/battery behavior, failure recovery, and 24-hour soak. Static schemas, conformance reports, artifact hashes, or package retention alone are not empirical performance proof.

### Commands, events, and reverse coverage

Release introduces no new UI command or EventRecord family here. Plugin lifecycle candidate commands remain owned by `Plans/Plugins_System.md` and unavailable until central registration. Release supplies `PluginPackageSupplyChainProof` and update/rollback admission refs to the eventual typed command receipt. New package lifecycle effects remain receipt-only pending Event Authority; existing admitted release events are unaffected, while the historical `plugin.*` identifiers remain non-emitting individual candidates because the live registry contains no `plugin.*` row.

| Release fact | Forward consumer | Reverse proof |
|---|---|---|
| PM-internal interchange plus PM-native dual-manifest admission | Plugins install/update/validate/review/rollback | both hashes, exact id/version, package/tree hashes, provenance/license/SBOM/known-bad/containment/conformance refs; no claim that the interchange paths are directly loadable by an external agent |
| internal portable-only admission and explicit target adaptation | Skills/MCP import or named ecosystem adapter | `admitted_portable_only`, internal conformance, target-format inventory and hash when adapted, and no PM-native activation or authority widening |
| update and rollback | Plugins lifecycle receipt | full old/new diff, last verified generation, exact rollback artifact/data disposition, recovery/quarantine on missing proof |
| architecture fast path | release selector | capability detection, portable fallback, equivalence/fuzz/boundary/end-to-end, old-hardware evidence |
| platform artifact | installer/update | target/minimum compatibility, signing/notarization, sandbox/renderer, exact install/update/rollback receipts |
| size budget | release gate and Settings summary | separated PM core/CEF/renderer/on-demand/provider/plugin/toolchain/symbol bytes plus combined budget |
| runtime performance | release candidate admission | benchmark scenario/profile/toolchain hashes and raw P50/P95/P99/worst/failure/soak receipts; no static substitution |

ContractRef: SchemaID:pm.plugins.package_contracts.v1, SchemaID:pm.full_thread_runtime.contracts.v1, ContractName:Plans/Plugins_System.md, ContractName:Plans/Shared_Integration_Runtime.md

### RSC-011 - Plugin Package Provenance, Diff, And Rollback Gate

```yaml
plan_unit_id: RSC-011
unit_type: schema_contract
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  PM-internal interchange plugin.json and PM-native pm-plugin.json are separately hashed signed subjects inside
  one bounded package proof; release admission requires exact identity alignment, provenance, license, SBOM,
  known-bad, archive/final-tree containment, conformance, update diff, and exact rollback evidence without taking
  over plugin lifecycle. Direct OpenAI/Codex or Claude Code compatibility requires a named adapter that emits and
  separately hash-binds the current target metadata directory, plugin manifest, .mcp.json, and generated inventory.
gui_related: true
gui_classification_reason: Trust, permission/supply-chain change, blocked install, quarantine, and rollback evidence are visible Plugins management facts.
depends_on: [PLUG-065, PLUG-066, PLUG-067, RSC-003, RSC-008]
unblocks: []
acceptance_criteria:
  - Both manifests and the final package tree are hash-bound and dual-manifest id/version mismatch fails closed.
  - Portable-only admission cannot activate PM-native components.
  - PM-internal plugin.json plus mcp.json is not represented as a directly loadable external package; an OpenAI/Codex adapter emits `.codex-plugin/plugin.json` plus `.mcp.json`, and a Claude Code adapter emits `.claude-plugin/plugin.json` plus `.mcp.json`, with versioned schema, generated-file inventory, source/output hashes, conformance fixtures, and no authority widening.
  - Missing signature/trust, license, SBOM, provenance, known-bad, containment, conformance, or mandatory rollback evidence blocks or quarantines admission.
  - Update review exposes every authority/runtime/package diff and preserves the last verified generation until commit.
  - Plugin packages cannot smuggle provider CLIs, Playwright, secrets, mutable Tool Store payloads, or unapproved executables into PM distributions.
validation_surfaces: [Plans/plugin_package_contract_fixtures.json, future package provenance, hostile archive/link, update diff, known-bad, and rollback fixtures]
risk_class: plugin_supply_chain_or_rollback_drift
reasoning_tier: high
context_scope: plugin_package_supply_chain
implementation_surfaces: [Plans/Release_Supply_Chain.md, Plans/plugin_package_contracts.schema.json]
node_compile_hint: {mode: plugin_package_supply_chain, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - register-egolite.md#PLG-02 (audited 2026-08-31)
  - scratchpad/pm-integration-20260831/audits/official-capability-revalidation-20260831.md#5-plugins-acquisition-and-release-supply-chain (reviewed 2026-08-31)
preserved_exact_tokens: [PluginPackageSupplyChainProof, PortableConformanceReport, AgentPluginConformanceReport, plugin.json, pm-plugin.json, .codex-plugin/plugin.json, .claude-plugin/plugin.json, .mcp.json]
negative_constraints:
  - Do not let a catalog row, cached artifact, local path, exit zero, version string, or plugin manifest self-authorize release admission.
  - Do not call the PM-internal interchange directly portable to an external agent or let a target adapter widen PM-native execution, permissions, hooks, tools, commands, UI, or sandbox authority.
  - Do not redefine plugin component semantics, activation, RuntimeResourceGovernor, ObservableWork, or rollback execution in Release.
```

### RSC-012 - Portable Artifact, Size, And Performance Evidence Gate

```yaml
plan_unit_id: RSC-012
unit_type: acceptance
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  Release candidates retain portable x86-64 and native arm64 compatibility, admit runtime-dispatched fast
  paths only with portable equivalence evidence, separate installed-size families, and consume raw cross-platform,
  low-resource, old-hardware, recovery, and soak benchmarks before any performance claim.
gui_related: false
depends_on: [SIR-017, RSC-006, RSC-008]
unblocks: []
acceptance_criteria:
  - No artifact globally requires AVX2, AVX-512, target-cpu=native, WSL on Windows, or one CPU vendor.
  - Every optimized path retains a portable fallback and equivalence/fuzz/boundary/end-to-end/old-hardware evidence.
  - LTO/PGO and any assembly path bind reproducible toolchain/config/profile/ABI/fallback evidence.
  - Installed size separates PM core, CEF, renderers, Safe UI, on-demand tools, provider tools, plugins/data, project toolchains, and symbols.
  - Unsupported platform or benchmark lanes remain not_run with residual risk, and static artifact/schema proof cannot become runtime performance evidence.
validation_surfaces: [future release artifact matrix, size-budget receipts, architecture-dispatch tests, renderer bakeoff, full-thread benchmark and 24-hour-soak receipts]
risk_class: release_platform_or_performance_false_claim
reasoning_tier: high
context_scope: portable_release_artifact_performance_gate
implementation_surfaces: [Plans/Release_Supply_Chain.md]
node_compile_hint: {mode: portable_release_artifact_performance_gate, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/02_FINAL_DECISION_REGISTER.md
  - PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/07_PERFORMANCE_PLATFORM_STORAGE_BENCHMARKS.md
  - PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/08_ACCEPTANCE_TEST_AND_FAILURE_MATRIX.md
negative_constraints:
  - Do not infer platform, renderer, size, performance, or recovery acceptance from artifact retention or static schema checks.
  - Do not bundle provider CLIs into core/default artifacts under the plugin or performance contract.
```
