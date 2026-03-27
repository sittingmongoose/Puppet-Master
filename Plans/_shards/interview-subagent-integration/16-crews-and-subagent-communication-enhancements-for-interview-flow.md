## Crews and Subagent Communication Enhancements for Interview Flow

Interview may use crews, but only under the reconciled PM crew model.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

Interview crew rules:
- crew mode is optional and explicit.
- crew members remain PM child runs.
- crew coordination uses an attributable crew board rather than hidden peer channels.
- crew recommendations in generated artifacts should default to model/provider diversity as the main differentiator.
- Interview must not treat old crew board files or memory files as canonical shared state.

Generated plan and PRD recommendations:
- may include suggested crew members or crew-capable task hints.
- must not make crew use mandatory for correctness unless the runtime path can actually satisfy the requirement.
- must preserve the same requested/effective runtime disclosure semantics used elsewhere.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/CLI_Bridged_Providers.md
