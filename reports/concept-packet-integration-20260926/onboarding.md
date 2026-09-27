# Onboarding / Guided Tour / Doctor — reviewed integration findings

Scope: the three supplied Onboarding/Doctor packets dated August 13, August 15
and September 3, compared with canonical Plans at `9a40601e9` and the selected
TestOpus source. The current user selection leads the GUI reference; newer
canonical owner decisions supersede older packet wording per requirement.

The fresh Muse audit was independently reviewed by GPT-6 Sol high and
adjudicated against exact source evidence. F-07/F-08/F-09 have been corrected and reviewed. F-02 owner prose now states the recovery boundary, while typed resume/delete integration remains open. F-01 remains a prototype-to-owner projection gap; the selected HTML is preserved. The proposed Doctor registration backlog and stale concept defects were rejected. This report does not claim native proof.

## Reviewed dispositions

| ID | Result and required action |
| --- | --- |
| F-01 | The selected concept **already contains** `s-ready` with QR, code, link, expiry and Continue (`src/js/68-screens-server.js:128-174`). Preserve that design. Map readiness and trust to the separate SRV-005 bootstrap and Server pairing results; claim or a concept timer is not those results. No new adopt/defer product choice is required. |
| F-02 | Confirmed missing Project/Onboarding recovery composition after remote repository creation followed by local failure. Consume Forge reconciliation before repeat create, retain the verified remote identity and original reviewed operation, and define Continue Setup, Open Repository and separate confirmed/permission-gated Delete. Existing Forge/SCM effect-unknown ownership remains authoritative. |
| F-03 | Covered. N2-151 already distinguishes generation readiness from Usage unknown and requires owner-backed applicability and results. FGI-015 and SCM-003/SCS-014 separate API from transport; MS-122 and UF-085/087 separate generation from Usage; ORI-006/008 keep the CLI optional. The packet's matrix categories are not a mandatory check-ID registry. No new descriptors, commands or schemas follow from an absent example fixture. |
| F-04 | Covered presentation. N2-153 owns Doctor projection/return; N2-155 maps the selected local actions, including diagnostics copy. Beginner group labels do not establish native probe registration. |
| F-05 | Old command/event suggestions, old tour structure and full-client Tailscale packaging are superseded by the current owners. Retained behavior remains required under those owners: tsnet preserves private-access functionality, and pairing is handled in F-01 rather than discarded as a wording change. See JSON for the exact predecessor tokens. |
| F-06 | Rejected stale claim. AUDIT.md:107-121 and current source show C1/C6-C8 already fixed. They are not current packet gaps. |
| F-07 | Align F3-520's precommit restriction with PWIZ-029's individually consented selected-source access exception; preserve after-Review pairing of the Connected Server and all unrelated mutation fences. |
| F-08 | Make F3-520's Git initialization example conditional on the reviewed Safe History choice. PJCT-007 does not permit silent Git initialization for Jujutsu or explicit no-history. |
| F-09 | Add F3-520/F3-521 acceptance for the selected persistent Look and sound controls, existing Settings/draft ownership, keyboard access and accessible sound-off state. Audio remains supplementary. |

F-02 source: September 3 `01_COMBINED_HANDOFF.md:103-124` and
`10_ACCEPTANCE_FAILURE_AND_USABILITY_MATRIX.md:81-83`. Current consumers are
PJCT-007/PWIZ-021; existing effect-unknown owners are
`Forge_Integrations.md:515` and `Source_Control_System.md:1056-1062`.
F-07/F-08 owner evidence is PWIZ-029 and PJCT-007, respectively. F-09 source is
`src/js/60-ui-core.js:40,254-267,314-317` and
`src/js/80-tour-core.js:125-126,443-447` beneath the selected Opus package.

Original draft evidence is preserved externally; the JSON records exact paths
and SHA-256 hashes. The corrected dispositions above govern this report.

## Coverage summary

Already covered (representative anchors): newbie-first flow shape, one
primary action, progressive disclosure (PWIZ-021 addendum ll.1781–1797,
F3-520); draft-first + late commit + saga/idempotent replay (PWIZ-021,
PJCT-007); cancel semantics preserving verified connections (PWIZ-021
l.1827); 5-kind detection taxonomy, built-in adapters are not installs,
no `gh`/`glab`/`tea` prerequisite (PWIZ-021 ll.1815–1819, ATS-020 provider
rows); per-dimension readiness, no broad `ready=true` (PWIZ-021 l.1819,
N2-153 distinct truths l.8741); official-page sign-in, no PM-collected
passwords, self-hosted registration states (MACS-005/FGI-011 via PWIZ-021
ll.1807, 04-matrix rows verified: Entra in Azure/Forge docs, app-password
ban in `Plans/Forge_Integrations.md` l.998); Forgejo≠Gitea distinct
adapters (FGI-012/013, PWIZ-025 ll.2241–2243, ATS-020 forge axis);
Origin read/write + distinct CLI, Cursor Agent login not reused
(PWIZ-024 ll.2115–2116, ATS-020); restore-first as Bootstrap preflow
`restore_existing_pm_data`, Recovery Kit test≠acknowledgement, pending
policy (PWIZ-025 ll.2213–2225); Doctor cached-first, no probe storm,
targeted Check Again, exact-return remediation, redacted export (N2-151
addendum, N2-153/155); local zero-usage Teacher + same-answer ELI5 +
Planning-majority practice (PWIZ-023, F3-521, declared concept tour census, not a fresh browser measurement); provider-CLI never
bundled/preseeded/silent, explicit official-source Install, install≠auth
(PWIZ-021 ll.1815–1819, correction adjudication); ObservableWork shared
contract + RuntimeResourceGovernor sole ownership (bakeoff 08, correction
§§7/11, N2-152 admission); SQLite prohibition, no PM Playwright runtime,
no broad subnet scan (retained negatives across owners).

Routed to other owners' scopes (not gaps here): WAN route internals,
Remote Link provider detail, proxy config generation (server/remote-access
agent); backup engine/transports/retention (backup agent); per-forge API
minutiae (forge agents); ONBDOC+RAS/BRS/SRV acceptance slices
(RAS/BRS/SRV ATS rows); correction-register §§1–6/8–10/14–17/19/23
(performance/runtime owners); ATS-020 already cites the 128-row packet
denominator (SH/ONB/TOUR/DOC/IMP/TST/PERF/SRV/RA) as predecessor evidence
only.

Files reviewed: all 12 substantive Sept-03 docs (00–11) + 7 machine JSONs;
bakeoff 00–10 + REQUIREMENTS_CHECKLIST.json + reference/CONCEPT_RULES.md +
reference/INTEGRATION_RUNTIME_AND_AUTHENTICATION_BOUNDARY.md +
reference/PROVIDER_CLI_FINAL_ADJUDICATION.md (byte-identical to correction
copy — verified by `diff`, counted once); correction 00 +
02_FULL_THREAD_CURRENT_DECISION_REGISTER (full read; §§7/11/12/13/18/20–25
in scope detail, rest skimmed for onboarding consequences) +
PROVIDER_CLI_FINAL_ADJUDICATION.md +
REFERENCE_REVIEW_AND_REPAIR_REQUIREMENTS.md. Legacy prompts never executed:
IMPLEMENTATION_PROMPT.md, AUDIT_PROMPT.md, PROMPT_USAGE.md,
CORRECTION_GOAL_PROMPT.md. Packaging only: manifests, SHA256SUMS,
VALIDATION_REPORT, PACKET_MANIFEST, SOURCE_MAP, IMPACT_REGISTER template.
Lightly covered (skimmed headings + onboarding-touching sections; owned by
server-agent scope): reference/FINAL_WAN_REMOTE_ACCESS_AUTHORITY.md,
reference/REMOTE_ACCESS_REQUIREMENTS.json — §§10–11 (GUI/onboarding,
Doctor/tests) checked against F-01/F-03; route internals left to the
server agent.

## Applied versus remaining

F-07/F-08/F-09 are closed by the reviewed F3-520/F3-521 changes and one stale negative-fixture explanation; see `gui-owner-alignment.md`. F-02 has reviewed provider-neutral owner prose but is not functionally closed; see `project-recovery-owner.md`. Continue cannot advance a rejected operation by replay and Delete cannot dispatch without a Forge contract. F-01 is retained in the remaining integration list. An experimental concept repair was rejected after source review and was not published; the selected TestOpus bytes remain authoritative for this delivery.
