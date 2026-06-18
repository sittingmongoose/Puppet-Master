# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-06-18T10:15:41Z

Source SHA256: `e6516b6b89193ee6763f69adca64e35af901fac0c03d0b3d61547c5361592362`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `1ee4b0b5459961d2180517b30f13e902a7878cbfe10df24bab22d80d90f17767`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `1768cd73ff61d06185df464597571de21b07ffb4b11c76a4510621f2a7d6030d`
- [003 - Change Summary](003-change-summary.md) L14-L29 `5231968e2ab7b8e2dee910bce4b355d1079bddbf19538e28fc2efd635e880183`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L31-L46 `2c501be32cdc9580ff23fe83f5ecb00a0cd43231dc4628d3b20027ef700151ee`
- [005 - Executive Summary](005-executive-summary.md) L47-L51 `a7d23245379d8edc74334ead2eb4d48b2b4e4d7e934ee67bdd1fde8907928cf7`
- [006 - Table of Contents](006-table-of-contents.md) L53-L89 `cd087a7b26eebf23db427c395b0504dd2b4016ecd2cb521098ef90363cc77bfa`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L91-L203 `3d4211b6a6912e46db8ba679f5731b3297ca04ba41cc12cd4b59bc644533504b`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L205-L227 `38cb5a45c84a3cc3676921d8dc0475a39fc97b3d78bcbc6d7edfef6707b26808`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L229-L235 `0f168d3d69e08beb9930124a89a423aff42e353ae18fbdb0ea90de8da4d1b1a6`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L237-L282 `f459edbf6e0b0c708827fb8e85cc9716dc2da663d6a49233eb85e311c71569d5`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L283-L426 `fc78b5bf18e6655b1101eb25aaf575ba910a6bc4c931f74a34d38528fd18738c`
- [012 - 6. Teach](012-6.-teach.md) L427-L465 `5887abd9bade3d810a2837ea1596ccf10f5d22f2211f15d639038f2511535050`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L467-L605 `f97a9ad3c64c1fc47883fa2fb0a987d8a32972426b9122d3128cdd05b5c3fb1a`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L606-L896 `4ac544d93590528f6e0fbeb181f7c0d5ea9f250b0438e0fe3b1f3b6ec72911e1`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L898-L933 `f49a2a947655756d160d1a1a6f6e8dc81b22ecd90efbf41f5cb353f3d4ff4219`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L935-L1005 `f1115fb0e8e617b1e34e6a13ca8e2ffebb20060e446c45b4dcb2ce4fddd8a2ad`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1006-L1151 `f2b6d6826f5f8c1b4ca6406924cee70269ef909d290291612dc14daa06ab1fb0`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1152-L1260 `0f70b0ff6a6d46b77dd3566cd1a0118251febdc1569591641530fe0ae888ca90`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1261-L1674 `4908a25a9f3b2dc800dfa0fc8128b8c39e1d74f81c5e66c10adddd7e03e1be4e`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1675-L1792 `9ffcda5a8b24c09eb6262889c15c7012f8f9bd73a7f3ff80e04f68737811fc75`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1793-L1826 `ff1facf1bdf1f746bde0879a6889a685f53be1c851944aac55cd1ca7cca270cd`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1827-L1866 `56f35f09088b8ed950a4dcc0c6ec4b2a0e285e7b8ad91735aa2c6791e3ede99b`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1868-L1980 `c8c23620af23ec3ac617f6d8b79eb690359a1d8a2f7aa5bdc9d6ffc779936da9`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L1981-L1992 `284aa5cfbc41452bec28b8eafbed34c8db1ba8d736221f195ed581c86df0f163`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L1994-L2003 `b2cf2ff60b2d6863aa3f39afcb24df1c9f5147d2b481c164973b528882046332`
- [026 - 20. References](026-20.-references.md) L2005-L2034 `8a8ac30f199e4b3af49cb773f108358c661be0757a7a34082fcd9f08cfb34276`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2035-L2053 `9133efe5ebef51290abfc601147bbddd56a9c9cb0ae6f18df2238ddb18f64e75`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2055-L2086 `06f75b7a77ec1247e7d0f6a27970d71d37a7ef7069b4a2b289e88f4e68d32896`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2087-L2182 `7900cb487c07de93ef4580b6018a5b7fbfb961089a5cbd0cead7c1d744ffeba5`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2184-L2237 `d48f82cfef5b417a216be66ff468f8a6bbf7f0fbb0934d2cb3baa02b8d567a1b`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2238-L2244 `3455c1ef4f2de7703ba9194b2080e6c7fb2b3ffee73b5f79b40222323fbec319`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2245-L2347 `1f7dc04959d485a1ca1ca8a1bff6fcb764472e8b2264860dcffe21bad0de8492`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2348-L2484 `f15d9a88c6c81e8623937b865c4d79dfad992376a504cd719c7d5e2a5c7d3e53`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2486-L2529 `019dc3127b4acbe66f72b22cfa12d037f22d6569aaf02683dc395dfdb9ee7e47`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2530-L2639 `bab00e5a2839dc088d4b1da459e5c7fd75d9476ea8fd6e3178da911ee9ff162f`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2641-L2656 `c2259a810ff0559a9746d334b911e73e795b8f0244de09b55d672adf85873ab4`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2657-L3261 `311ba1686948c366d201b61165773afb732e2b59da14d7d1ef3b1baafd876300`
- [038 - Shared actor-boundary, route payload, and blocked_notice packet](038-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3262-L3282 `8ab27e2f8792d8277f6a821a758cb4ccbf098c9aa4ef66a10cc0699ad0c9f049`
- [039 - Shared Conversational Actor Runtime Identity](039-shared-conversational-actor-runtime-identity.md) L3284-L3298 `eef6fd8231ed7c4d063b4b987953d8914f572624eb07390f3528505a12deb2f2`
- [040 - Chat Route, Permission, and History Behaviors](040-chat-route-permission-and-history-behaviors.md) L3300-L3314 `3835581729e852130b46416c70df3514c3b101fbf8f13dc733d9aea510fa4a99`
- [041 - Owner / Consumer Map](041-owner-consumer-map.md) L3316-L3320 `802e1932f863aadb61e171e898498a7cb3d45147f6731897085c4454c04b7e92`
- [042 - PlanUnits](042-planunits.md) L3322-L21671 `31337ed2864c5ae0fea5a70c4849b903777805c31e90640f80b2077b47b44037`
- [043 - Migration Coverage](043-migration-coverage.md) L21673-L21703 `f5ed74176e8035db2e41a1c42fe01073a45cdb4f00b7e1cd22ca9bdd4f9f69a4`
- [044 - Ledger Compile Addendum - pldg-20260614-001](044-ledger-compile-addendum-pldg-20260614-001.md) L21705-L21785 `ec9baa44b08259c565d979e86271cb99641c3bcb20e2a874f8913f8bd579579e`
- [045 - Ledger Compile Addendum - pldg-20260615-001](045-ledger-compile-addendum-pldg-20260615-001.md) L21787-L21884 `31833740e50fedfd983463e695bea934ebbecaa53a8ebd03cdded991a6f6a127`
- [046 - Ledger Compile Addendum - pldg-20260616-001](046-ledger-compile-addendum-pldg-20260616-001.md) L21886-L22198 `4223f88e93781cdaf879087547688c595f88878ed7d6567c8f1fa793e259f7fb`
- [047 - Ledger Compile Addendum - pldg-20260616-002](047-ledger-compile-addendum-pldg-20260616-002.md) L22200-L22265 `5f14adaeca0d5b6156564fd04fad5b4f1f98cc304723df51d623d106bca74c39`
