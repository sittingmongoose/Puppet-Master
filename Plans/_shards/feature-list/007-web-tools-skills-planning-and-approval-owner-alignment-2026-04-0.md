# Shard 007: Web tools, skills, planning, and approval owner alignment (2026-04-04)

Source: `Plans/feature-list.md`

Source lines: L198-L211

Source SHA256: `6cabffb048e5b6528ece9c156ce2afe1ae4bb49a7d6f20e08a00e5dca5de9421`

---

## Web tools, skills, planning, and approval owner alignment (2026-04-04)

Rewrite-era feature summaries must align to the current owner docs for web tools, skills, planning, permissions, and approval surfaces.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Skills_System.md

Summary:
- PM owns a six-tool web family plus `batch_webfetch` and `batch_webextract`
- slash-command canon uses the final reconciled built-in set with bare `/web` help/autocomplete, `/web search`, `/web fetch`, `/web extract`, `/web research`, `/web crawl`, `/web map`, `/skill` discovery/invocation behavior, and deprecated `/cancel` alias handling
- Agent Config owns Personas + Skills while Settings owns providers/accounts/models/permissions
- provider/server-profile feature summaries preserve `connection_profile_id` while deferring the profile model to `Plans/Provider_OpenCode.md`, `Plans/Multi-Account.md`, and shared runtime identity contracts
- refined tool behavior for web, LSP, skill, permission, planning/TODO, question, operation-card, and visualizer summaries defers to the repaired owner sections
- Feature-list summaries remain consumers of those owner docs for repaired web, question, tool, TODO, permission, operation-card, and visualizer behavior; summary copy must stay accurate to the owner sections instead of restating lower-level contracts.
- Help and teaching surfaces may expose `Feature Seam` through user-facing ELI5 language in `/help`, but that aliasing cannot rename the canonical graph object or hide the owning feature-seam contract.
