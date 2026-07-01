# Shard 006: Known cross-cutting duplication hotspots

Source: `Plans/00-plans-index.md`

Source lines: L467-L487

Source SHA256: `5bb5b28fe0ce7b4eb8928c81e90e910be28a7fdf0adde6ccfc779e572b8970bd`

---

## Known cross-cutting duplication hotspots


The highest-risk duplication hotspots for this planning set are now:

- child-run canon versus provider-native subagent language
- Persona selection versus subagent registry language
- crew shared-state versus legacy memory-manager language
- dynamic context shrinking versus compaction and Subcompact language
- requested/effective runtime surface and effort language
- blocked/awaiting-parent versus older denial or recovery aliases
- Context Lens UI wording versus command and wiring ownership

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md

Rewrite-era guidance:
- owner docs define the canon.
- consumer docs should reference owner docs rather than re-describing the full model.
- packetization and reconciliation should prefer rewrite-outright where stale canon would remain misleading if left in place.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Progression_Gates.md
