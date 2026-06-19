# Shard 006: Known cross-cutting duplication hotspots

Source: `Plans/00-plans-index.md`

Source lines: L461-L481

Source SHA256: `d6158af7d62e80dbd5d38c461fc43e0fd277ef1e910f8f998050fb1007500fdf`

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
