# Shard 032: Owner / Consumer Map

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L2319-L2328

Source SHA256: `b9c380ab89303839d2abbf9958ab8b20a6d548fd71b9f0a94ea34992e1f8bb3a`

---

## Owner / Consumer Map

This source-preserving standardization kept the owner and consumer boundaries stated in the original document body. The document has since been retired (see Plan Document Status): it owns no active behavior, and its preserved sections are source lineage only.

Where the live routes that still pointed here went (DL-330, Jared 2026-11-05):
- `wizard_status`, the wizard `attention_required` and `blocked` states and their transitions, the blocked record and the blocked clear rule (§2.2, §15.2 and the 2026-03-08/09 blocked-state addenda) moved to `Plans/Planning_Wizard.md` (PWIZ-038). `Plans/DRY_Rules.md` §2.1 routes `wizard_status` there.
- The clarification-round limits (§15.5) moved to `Plans/Decision_Policy.md` §6.5 (DP-064) and apply to the Planning Wizard.
- The requirements-quality check stays with `Plans/Decision_Policy.md` §6.4. DP-034 holds its pre-execution boundary, blocking, severity and persistence rules. DP-066 (DL-330, amended 2026-11-05) now holds the Requirements Completion Contract C-1 to C-5 (§14), the report rules (§14.1-14.2), the requirements-quality steps of the Auditor loop (from §12: the initial audit's read-only report and `auto_fixable` classification, the bounded repair autofixes, the certification cycle's read of the report, and the deterministic, headless, serial execution rules) and the escalation trigger (§15 opening and §15.1), with only retired vocabulary changed. Decision Policy §6.4 no longer points to §12. Of the rest of §15, the state transition (§15.2) is in PWIZ-038 and the round cap (§15.5) in §6.5 (DP-064), as above. §15.3 (UI surfaces), §15.4 (clarification payload storage) and §15.6 (shared questionnaire alignment) are not part of the §6.4 blocking path and did not move with DP-066. §12's generic Auditor invariant loop (its DRY/SSOT, plan-graph, wiring, evidence and decision-logging checks, the Auditor cycle reports and the legacy pass-report mirrors) did not move: other live documents still cite §12 for it, and closure question 2 did not cover it.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md
