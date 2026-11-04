# Shard 025: INV-020 -- Project-driven capability activation

Source: `Plans/Architecture_Invariants.md`

Source lines: L325-L337

Source SHA256: `d48461a5189f0540f72edec82e53ffffd9a421fcdd39f7ec884aa1a81e22e254`

---

## INV-020 -- Project-driven capability activation

**Rule:** Puppet Master remains one extensible platform with a no-project baseline (AI-069) plus explicit resource/Project capability activation, never separate products or invented Project identity.

- The retained bench-03 constraint means one extensible platform. Baseline chat/Goals/Crew/Plan/scheduling activates in real app scope; Project-specific packs activate only from their actual Project signals and permissions.
- Project-open detection/import MUST run explicitly before Project-specific capability activation; app baseline and explicit permitted-file detection require no Project. It reads project signals such as language markers, framework files, build/run metadata, hosted-repository state, remote-host state, provider/runtime capability reports, and user overrides. Missing actual resources remain explicit, never guessed.
- Project capability packs/modules for language, framework, build, review, remote, LSP/search, and source-control behavior activate from those project signals. Ambiguity MUST be visible and overridable: when multiple plausible interpretations exist, Puppet Master shows the alternatives, records the chosen/default interpretation, and allows the user to override it rather than hiding the choice as implicit automation.
- Indexing and `external-model sync` are first-class background subsystems. While indexes warm up or external model/capability reports are still synchronizing, affected features MUST disclose reduced-capability/degraded-mode state instead of pretending full readiness. Indexes, sync snapshots, and remote caches MUST be bounded/reused so startup and large-workspace responsiveness are not dominated by repeated full rebuilds or full syncs.
- diff/review/hosted-repository workflows MUST live in the same shell as local editing. Source Control, hosted review state, editor markers, Problems, and Search may each keep their own owner boundaries, but they must compose inside the shared IDE shell rather than becoming separate ad hoc tools.
- Remote architecture MUST use a thin local client/launcher with backend attachment/version management. Remote projects are not treated as local projects with different paths: host identity, backend attachment, helper-binary version, connection health, and requested/effective capability state stay explicit.
- Plugin/module breadth and dynamic-loading dependency debt MUST remain visible in implementation planning. New modules are loaded lazily and scoped to activated capabilities; module activation must not create unbounded startup work, hidden dependency chains, or duplicate project-detection logic.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/BinaryLocator_Spec.md
