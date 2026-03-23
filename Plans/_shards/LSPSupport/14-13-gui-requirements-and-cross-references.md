## 13. GUI requirements and cross-references

Settings > LSP is a searchable registry-management surface, not a flat toggle list.

It MUST allow the user to:
- globally enable or disable LSP
- search and filter the full support catalog
- enable or disable catalog entries
- inspect source/classification badges and effective overlap resolution
- add custom servers
- inspect requested vs effective attach state per server and project context

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md

Cross-surface rules:
- File Manager and editor consume LSP state for semantic affordances
- Search remains the owner of text search and replace-in-files
- Problems remains the owner of aggregated diagnostics display
- status surfaces disclose freshness, health, and effective capability state rather than hiding degraded attach conditions

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md

