# Shard 019: Requested / Effective Model Snapshot Alignment

Source: `Plans/Models_System.md`

Source lines: L1130-L1158

Source SHA256: `bcf41bf5ec3cf129fbb96225f82075c1171231ba75be555ae4921259568a1b43`

---

## Requested / Effective Model Snapshot Alignment


Requested and effective model/runtime fields must stay visible for child runs, crew members, and surfaced planning/runtime decisions.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

Child effort resolution order:
1. explicit child effort request
2. child Persona or task preference
3. weak parent hint
4. target-surface default

Rules:
- PM resolves canonical effort intent first, then translates it per target surface.
- remapped effort values remain visible as requested versus effective.
- explicit runtime surface requests do not silently fallback.
- implicit orchestrator-selected runtime surfaces may fallback, but the fallback reason must be visible.

Default Crew configuration belongs under the model/runtime settings surface.

Minimum Default Crew settings model:
- enable or disable Default Crew
- ordered list of crew members
- per-member model selector
- per-member provider/runtime surface selector
- immediate normalization of the whole crew to `Copilot` when any member selects Copilot, because Copilot is a crew-level provider selection constraint and is not a per-member freely mixed provider in the default crew editor

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/CLI_Bridged_Providers.md
