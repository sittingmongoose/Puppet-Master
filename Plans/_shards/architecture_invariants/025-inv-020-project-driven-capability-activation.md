# Shard 025: INV-020 -- Project-driven capability activation

Source: `Plans/Architecture_Invariants.md`

Source lines: L325-L337

Source SHA256: `a1488a98949bf363a0c763a51dae6dc4db5261708c7828eeca492e65f251c543`

---

## INV-020 -- Project-driven capability activation

**Rule:** Puppet Master MUST remain one extensible platform with project-driven capability activation, not separate hard-forked products or rigid personalities.

- The `bench-03` deep-dive benchmark signal is canonical as an architecture constraint: Puppet Master is one extensible platform whose capabilities activate from the current project context.
- Project-open detection/import MUST run explicitly before capability activation. It reads project signals such as language markers, framework files, build/run metadata, hosted-repository state, remote-host state, provider/runtime capability reports, and user overrides.
- Project capability packs/modules for language, framework, build, review, remote, LSP/search, and source-control behavior activate from those project signals. Ambiguity MUST be visible and overridable: when multiple plausible interpretations exist, Puppet Master shows the alternatives, records the chosen/default interpretation, and allows the user to override it rather than hiding the choice as implicit automation.
- Indexing and `external-model sync` are first-class background subsystems. While indexes warm up or external model/capability reports are still synchronizing, affected features MUST disclose reduced-capability/degraded-mode state instead of pretending full readiness. Indexes, sync snapshots, and remote caches MUST be bounded/reused so startup and large-workspace responsiveness are not dominated by repeated full rebuilds or full syncs.
- diff/review/hosted-repository workflows MUST live in the same shell as local editing. Source Control, hosted review state, editor markers, Problems, and Search may each keep their own owner boundaries, but they must compose inside the shared IDE shell rather than becoming separate ad hoc tools.
- Remote architecture MUST use a thin local client/launcher with backend attachment/version management. Remote projects are not treated as local projects with different paths: host identity, backend attachment, helper-binary version, connection health, and requested/effective capability state stay explicit.
- Plugin/module breadth and dynamic-loading dependency debt MUST remain visible in implementation planning. New modules are loaded lazily and scoped to activated capabilities; module activation must not create unbounded startup work, hidden dependency chains, or duplicate project-detection logic.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/BinaryLocator_Spec.md
