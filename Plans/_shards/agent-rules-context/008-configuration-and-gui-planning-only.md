# Shard 008: Configuration and GUI (Planning Only)

Source: `Plans/agent-rules-context.md`

Source lines: L95-L110

Source SHA256: `df94c7947ba59736a20e715bc53730b10aad790414d462c5e8308396164b06e9`

---

## Configuration and GUI (Planning Only)
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md

### In-app instructions editor reconciliation

The in-app project instructions editor writes the same runtime-consumed project rules and instruction files defined by this document. Jared’s 2026-11-12 answer at 8:12 AM EST was "Keep them there": Rules for every project and Rules for this project live in Settings > Personas & Crews > Defaults > Standing instructions. The first writes the existing application-rule source and the second the actual Project rule source; neither is a saved-note Memory control. The 2026-07-08 addendum's current binding below states each editor's save path: both use the Teach sheet (`cmd.chat.teach.capture` -> `TeachCaptureRequest`/`TeachCaptureResult`, `cmd.chat.teach.confirm` -> `TeachConfirmRequest`/`TeachConfirmResult`, `cmd.chat.teach.cancel` -> `TeachCancelRequest`/`TeachCancelResult` in `Plans/assistant_memory_contracts.schema.json`), with Rules for this project saving in Project scope (`scope: project`, non-empty `project_id`, `.puppet-master/project-rules.md`) and Rules for every project saving in genuine application scope (`scope: user`, `project_id: null`, `public_safe: true`, `application_scope` `WorkflowScopeV2` with `scope_kind: application` and `scope_partition: app`, `app.agent_rules.application_markdown`).

Rules:
- the editor must show the canonical path and scope for the file being edited
- when editing project rules, the canonical runtime path remains `.puppet-master/project-rules.md` unless this document is updated explicitly
- the editor must not create a shadow instruction source that the rules pipeline does not read
- save, validation, lint, and dirty-state feedback must be visible in the editor surface that owns instruction editing

- **Application rules:** Expose in GUI (e.g. Settings or Config → "Application rules" / "Puppet Master rules"): list or multi-line text. Save to the same store used by the rules pipeline (file or config). Tooltip or help: "These rules are fed to every agent run by Puppet Master (orchestrator, interview, Assistant)."
- **Project rules:** Expose when a project is selected (e.g. Project settings, or a "Project rules" tab/panel): multi-line text or list that reads/writes the project's rules file. Tooltip: "These rules are fed to every agent that works on this project."
- **Defaults:** Application rules can be seeded from Puppet Master's `AGENTS.md` on first run or when the list is empty. Project rules can start empty and be filled by the user or by the interview when it generates project docs.
