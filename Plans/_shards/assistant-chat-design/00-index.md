# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-09-18T00:32:25Z

Source SHA256: `5278a595c627cc18c8d2a684738ae4d0ba26b44a95d98a767f5e96f59c1f5190`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `9a78f839464b1d4c8af2dddae56b5a52acda82d88a3c0ae428819d343cfeecc6`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `4823e54fad7da1ef55850658e2413f2fad8834cfd59246808bc230d83ddb8771`
- [003 - Change Summary](003-change-summary.md) L14-L30 `955e9b706f1cb70104b6ec81fce1bac22878f4aa834ebd167d59f5422393c8fc`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `69861cac4d7ff686fb7c8d34b83211d80d4ea2c9e847708cd15df375a29e37d1`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `ba1872de109c53dc3028326093d96e62d17df02ba39efb7aa9a966408620823f`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `fc4b7844e6197656217250f30a2e4f47e77978de6ed1c3da91ce5228bff397ef`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `8188f53beb0496090b707843b7b76df6c6b52924cbb275cb3f659f655cdffef2`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L231 `ce3bd48a6272772281caa9999dd2639722bca876cf57e753ed23efa3961b8402`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L233-L239 `8e27dc44394d874b9e90945dffbb35a5945e8c1721dbad61fb0724d4bd68083e`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L241-L289 `e9b9497d1d7b301241aadc8c5c1e6e80c770f061eac9e4d035e4e93e27ea88d0`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L290-L438 `d3a829e232ebf2a7dd641dbe17bb690e2eb6cc6670d66764b50f1086f7fbfb6a`
- [012 - 6. Teach](012-6.-teach.md) L439-L477 `67977761896b9056776c4aa9a5ea2e3c03f3a077b356e06a9c5e9e1d3db770b0`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L479-L664 `07d3b4f8ad3b4322104cde5eec8eb6ec04b981782414dcc3639124938d5fd8e6`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L665-L957 `73c11976e7be4696224300be7168c631eab9229bf565ce23687d351f7d273066`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L959-L1000 `65fe0b83db60d98afd417aa3d928a0b25231c75eb8650c4d8771862093f7d4f6`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1002-L1072 `2056d55cb1f414520d5d130f3fbe96b6e5997fcf63b66e0def9eb9a7410f35ea`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1073-L1250 `c558949352e1313b683c7757efc34df8e50268a5d061933176716c03b1fb8e16`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1251-L1359 `756778fd21e53b2a0431f9c6d7bcaa3f733e84d5c373dfde47834b584c38a9f6`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1360-L1775 `c3201d76733ed072f056b0a507ffd2864c32491a89202fa88522ce7c0d05ec71`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1776-L1893 `d70d4cc8b4625c81c9a0cf1adec8a3584c8195f9060de491495b6f5b6cd3a648`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1894-L1927 `ea092e3d7f9c661bca0f13cac2f7e21faf42b5274e31d6eb8466ed76cb6ad12d`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1928-L1967 `893fc399863d0e61ec91c732c1b29c8aca3ccf94738a9eb01eba39198c035a84`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1969-L2082 `674970bdf3b9bb1122f775ddcb3060b6e2df71b2742166474d19c996891af06c`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2083-L2094 `3a3c95cc5ede678801a19aa519ea1a65e3206cf2805dbfb6d76be5f934d844f3`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2096-L2105 `aa1cfe493f13a4888bbc30c3213dc2b5dd405d003fcdf18ae1638283dd59f044`
- [026 - 20. References](026-20.-references.md) L2107-L2136 `3a155e932b2625cf71d62fdffaff3c3d14c4f0a4db3cc6161efadef8240a0cb0`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2137-L2155 `a0a5e9af8a0ac39a8974bd46eb53d66f6ff7c4e933dccc6bb18ba6a98d0180fc`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2157-L2188 `e445be0a331990bf1ccd09e2208ac2fa2b416cfa6d992d4adcbd6809fb5cce1a`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2189-L2284 `5ff331879026309e25b3dff266284f3f2ad11091dc783b2febf782acccd75c82`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2286-L2339 `c827715583542230a80970d184af1f855dde8525f2ba03dd1fe8ad8be6be83fb`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2340-L2346 `bdbed3824b233dc62a9a866586f0ac0af2f2af5043caed23ab4fe374b277f7c9`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2347-L2449 `f4d9826a73b376ef89ae77e5451f79456f17b84d3f5c071ca75a3e6b94b9be6c`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2450-L2586 `dfa8d60142520df52db619c24714d8ee5599572a014433cfed41866d994605dc`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2588-L2631 `f54a5495ff3cfe11c259cd4d94a2d37bfd78680b25c06bfa0630dbf5186f2c3b`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2632-L2741 `df03860d86b6070b10f8ce4b3214e20524e7c7ead9092a1e08ddc9c1a9f0679f`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2743-L2758 `4ce6250caa00f40d7858ce6638abb27fc16d60d6369460d70c9125a929889766`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2759-L2771 `abecef7047f0b6fb511c424e3bb0ed52334a5f3b6b36ab8069860cecf99851da`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2773-L2841 `ea4aacb6f35a74e1615172b2d199314cf608d3684c599e97adf82f32e7c34f5b`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2843-L3485 `c194e561c4fdf1aaf1cf84f196104f39dff19b05ad7ea80793775fe5082dd0bb`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3486-L3506 `0989d3385e649368d61484aa601efa58ac3ee2b5627f979551600695eec041ac`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3508-L3522 `84c6fd75bbcf6123898081968e5e81ad0165de8f275ef22190710eba4391da88`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3524-L3538 `2436d4652e66c4a56136c51c713f5dc6c1891884825f58fdaad8bd99a94d6337`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3540-L3544 `a2cdb258ff5ecdbb41605a1e627fcfe889a561c150b36c5a1d64d153fc43fcb0`
- [044 - PlanUnits](044-planunits.md) L3546-L3597 `2146f21491b9132caf63609193ea75d81ce8406c6e4aa6914d7a184b892baecc`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3599-L22234 `6b3c5fce8a591a094d402fa6043c54a2fe6bb33724e3ba1ab331e26ec8f8729c`
- [046 - Migration Coverage](046-migration-coverage.md) L22236-L22266 `da417f271fe9e5463e30bc1be7a313f3fd8336536342f9badf6962b2c9f890ef`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22268-L22356 `c012d0c5969246d5ec8786c70b8065dc8fbdb765265a5d6c1ec962d392a5be6f`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22358-L22455 `d98198f3c86597a1cc3a2f3906bcd15eb7b8363851b7a9e1fe33e861e24d49c5`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22457-L22769 `bcd1ab6cf58b151c7c46ddab5dd908c9afd1ea06eb711f08ce08e53db35b0d2b`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L22771-L22838 `5a38d4c32b299d3ebdc46a02aa80676cfdd5721a88f5f2aac61aa762c3e62aa2`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L22841-L22929 `f7995320d56d5121371fbfadb57c1de6acaf42b8f4b939e0323dc074bcc1aaf5`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L22931-L23017 `fa105a92008490d01e15d6efd47b41b90cae90fb4787a2c9e691056916b92a9f`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23020-L23394 `2d37e677ac6206c8b5726aaabd93122bb9abd3f7285c8fcae01207954f2487c7`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23396-L23607 `b25b1395f19a182196e0c16965f685db1a0046ab54ec284edc09f42ebd3b5a87`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23609-L23688 `45379e005f56a10cd5bc96cd893c0709fcff9a873edc674c84fdbfdb2e5ddead`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23690-L23755 `79a8ad4e08d0d5ab9fbd14a40dc30655f9094c6b9d9b45e31cf98436cb1aa16c`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23757-L23828 `43e008639415e695a1d45eec7ef274be5740a53ebfedd92268681a446b3645d3`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L23830-L23874 `dbf25db243a1a0c42a337091fef794890fe34480613c273bc28a44afa5ebaa9b`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L23876-L23952 `5086934592530aa47b1da4ea0a4f4359ca0c8be9694b966cd652877a5d01ad90`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L23954-L24173 `87542f37787d4dd164bcbc4ceef36a18a038ea5a96b2b1eba79e2357c76982e1`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24176-L24193 `406b140a8c008c832cf43834c8bc98f654eed269e9bbf285ae6d982346691462`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24195-L24561 `2955963b24398d67437c94975147405a3cd78e0b3d4243a38e136fd2b53815c7`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24563-L24653 `07a2766e75ab0b68a56838b9df5775bd03da6d197e5ba38f02697237d3887317`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24655-L24692 `e70339a929676dfbc9f75af974afa689160d142c64059e99372ff5149f72dac2`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L24694-L24802 `252a2e28bbcaf3bd51ca115b15b0477953658b548038e7de9721b633b9ee9a04`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L24804-L25152 `3ce24a228667b1fa59916923f3b95fb1dee7766c8fb013587b707931b92e4f6e`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25156-L25251 `40a1de2f580ceee9e9628e60bfd0586b706589025696c832d62c62b2d73aa46a`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25253-L25317 `1e31e707734a2fb6bde46123162e8dcec49c99fde0ddc09268c0913d609f915f`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25319-L25372 `2ea32fb129eb5fe46455d7b7d03928d7efcfdc64844aece753176faac91ecd6c`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25375-L25416 `c89dcbe85584a9672de83b82e365fc58ce130925b760f189eee7c9045a80d647`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25419-L25593 `0b62adee8a8914b2e5adee9a1c6bb7ba49e4b125ecc77f4d448fe85de7fa8659`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L25596-L25662 `5476757b94bf8e049974325facc46353f78928413603f8df3528634e6c443056`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L25665-L25734 `7b464255ff8fac49c3ed4d13c6abefbff85652cfcb60775d877d95a97990da3b`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L25736-L25786 `02e0a0970d466aa128932302c34773f3e2ce69bef33162d527c938a82b8e4297`
