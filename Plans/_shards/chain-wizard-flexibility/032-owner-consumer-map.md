# Shard 032: Owner / Consumer Map

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L2315-L2324

Source SHA256: `ecc32c3f3a712c332339c552a70f55c32ea0fe2043ac936de393ef994f4f3bc0`

---

## Owner / Consumer Map

This source-preserving standardization kept the owner and consumer boundaries stated in the original document body. The document has since been retired (see Plan Document Status): it owns no active behavior, and its preserved sections are source lineage only.

Where the live routes that still pointed here went (DL-330, Jared 2026-11-05):
- `wizard_status`, the wizard `attention_required` and `blocked` states and their transitions, the blocked record and the blocked clear rule (§2.2, §15.2 and the 2026-03-08/09 blocked-state addenda) moved to `Plans/Planning_Wizard.md` (PWIZ-038). `Plans/DRY_Rules.md` §2.1 routes `wizard_status` there.
- The clarification-round limits (§15.5) moved to `Plans/Decision_Policy.md` §6.5 (DP-064) and apply to the Planning Wizard.
- The requirements-quality check stays with `Plans/Decision_Policy.md` §6.4 (DP-034), which holds its pre-execution boundary, blocking, severity and persistence rules. Its pointer to §12 here for the Auditor loop that produces the report is still in place: §12's loop evaluates every requirement against the Requirements Completion Contract (§14) and shapes the report by §14.1-14.2, which Decision Policy does not hold, so where that content goes is back with Jared as an owner question.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md
