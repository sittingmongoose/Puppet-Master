# Shard 008: Configuration and GUI (Planning Only)

Source: `Plans/agent-rules-context.md`

Source lines: L95-L110

Source SHA256: `4ada052877422d058478c1d7cdbac00842b98b8d0a9e00ed2f802c8371851475`

---

## Configuration and GUI (Planning Only)
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md

### In-app instructions editor reconciliation

The in-app project instructions editor writes the same runtime-consumed project rules and instruction files defined by this document.

Rules:
- the editor must show the canonical path and scope for the file being edited
- when editing project rules, the canonical runtime path remains `.puppet-master/project-rules.md` unless this document is updated explicitly
- the editor must not create a shadow instruction source that the rules pipeline does not read
- save, validation, lint, and dirty-state feedback must be visible in the editor surface that owns instruction editing

- **Application rules:** Expose in GUI (e.g. Settings or Config → "Application rules" / "Puppet Master rules"): list or multi-line text. Save to the same store used by the rules pipeline (file or config). Tooltip or help: "These rules are fed to every agent run by Puppet Master (orchestrator, interview, Assistant)."
- **Project rules:** Expose when a project is selected (e.g. Project settings, or a "Project rules" tab/panel): multi-line text or list that reads/writes the project's rules file. Tooltip: "These rules are fed to every agent that works on this project."
- **Defaults:** Application rules can be seeded from Puppet Master's `AGENTS.md` on first run or when the list is empty. Project rules can start empty and be filled by the user or by the interview when it generates project docs.
