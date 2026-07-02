# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-07-02T16:50:45Z

Source SHA256: `97438ff075ddc69027838768a23223b2f2f72bac71819c99049d1850f8a3c6e1`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `e7e9e0a6d495a1ace051fab97ba9db17f1c1ac22586d2f71c25a5b6b1853ada0`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `d179e0871ca05d7fd6bdf957be259ff863d1d64bbae4661a13eda5f0a0a0fdd1`
- [003 - Change Summary](003-change-summary.md) L14-L29 `2ca704c99e90e647cb494acd7aec7295ec7627267badb8f82b92e0907f12baa8`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L31-L46 `90437b6e39c2b32fbd194bab4e6b3e87c546188c7e170daefaa9fcb0c1006f9c`
- [005 - Executive Summary](005-executive-summary.md) L47-L51 `a8b9543a6a8975eede532c94cd072cc0c5d60d8508e84b1792513608fb4fadf8`
- [006 - Table of Contents](006-table-of-contents.md) L53-L89 `5c709c4675569c01e1d3625ef1117b3e9a5083171781a0a0d2201d05f1dd538f`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L91-L203 `e0a933de169eae5c75af0ec67c71a9c823b5a33b846a7a0e825a5e4a3e74a47b`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L205-L227 `39108c3298a6151fab8c95edf8ebed16049736d0e14b84cfe8f917fa64686959`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L229-L235 `b61b393ea6a0c60fa6ac9bc124e3f856e8bc3e829772cbd39b93cb302e8a94f4`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L237-L282 `a57afa81c652bdceb470843bec441ae90d41f869899b6d35504907519fc43a2f`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L283-L426 `372982a62c1d66b598ca81fdab1c51c3c6cedbdcb8803b9812d7d68547c4cc85`
- [012 - 6. Teach](012-6.-teach.md) L427-L465 `c7e357d354d997ebf7752d21a5816321dca6df37e80cbd5e2012d6768365bffa`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L467-L605 `f71e6e19d9583d1b263e066c4ddd0cab5e3ce623d376b70ab77050d9608705e4`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L606-L896 `dafc93e8110bbdde6a40879b129dcebccbe817183803bcfa57a4c8c1c5fb81fa`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L898-L933 `3a40aa13afe4c8c0b6529006392592c43284cd7e1dd646654d34bfefb2fdad75`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L935-L1005 `8a80641644b617d1ff8643bb151f64704b49d564ee43d9fb3adea62e737ee27a`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1006-L1151 `a8e8f31f096c90cc570bef5cc77e3d7baca076ea076bd62d46d946b4f2e60bee`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1152-L1260 `a2358e85ab8325484e1bf6d990772079ec80d03a82ec21da592d9dc50eb33eb1`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1261-L1674 `c0634f00249c460356ba0d4abe628a9cccfb58100ddd1f2b56b29f588c1f576a`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1675-L1792 `6a25326a58dc85e2eda43bce031183b6949f3434a813556aff2e6c426e094c7f`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1793-L1826 `f841dcb6b4ca5d3a6db5bc37b332e8a48582fb362af5f5a0b84c5ab17f416e35`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1827-L1866 `eeb4dcad7f1c7ccbf6e3c3edc7810006c02d10a5f594a9cc31349eddb83667f6`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1868-L1980 `0f48272ae9d233dbeb5d00752d11326f31355c65ed1d3cf89f9139d5f98f0b63`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L1981-L1992 `a8297600e10e4950e85bcfa4e4b902fff70472b4fb6bad9f8cf6507675cc6019`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L1994-L2003 `e086098928e3ac1cf529488e5ae68336ed4e10d45db036585c240e49e1b34b8c`
- [026 - 20. References](026-20.-references.md) L2005-L2034 `bcffc5ff29916d516e7408a4bc5819a4f98a3b14586611d8f678a846ee439cff`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2035-L2053 `d32e9e21d954a14543a15b034f82e679382ff2cbc5c42a5f270b8a2d6f752c07`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2055-L2086 `8a108efd905a6dac180c663d748c3be00f2dcc00a03442e5cb9f7a857f152517`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2087-L2182 `e6fd7f084140fd4130f3058cdb02365723a17ef3e2b25369a7b8ec559c80876e`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2184-L2237 `c4314bb45f008dcd28f01550ae602a01f2351d967d7c19e165bb6a37211bead0`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2238-L2244 `f3a6609388452055225070d76eb43366c29fd2051850eb166cfb5d6abedbc6a4`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2245-L2347 `75734e75cbfcd47aa9968a2a5e43b405893f1165da6d06401fc3403be704c3f3`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2348-L2484 `55e8c26ff49165c81ce9c2488f629013f9317f8f83f1b6d6299f12ed6660612a`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2486-L2529 `67747ca2c9bfa783d5698db4239184f58001b55aecba31afca8ed018076218ad`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2530-L2639 `6c71189def010eba66d3be2b98ef09fde13c9ea06d71b470b2bc81dc02b7e694`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2641-L2656 `e72e12d4c904603483b9f2b89b39fd44c5a18dfa2a0e39d70dd8ff91606890a0`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2657-L2669 `599cd81173da134b5b6b785d18a91b1c45c52fb078855799928d3318ecdd9d9d`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2671-L2739 `febf158bda80b5ebf07a4588ddcbb5fcd575a090c7c9b8a358fee9fbb6847df5`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2741-L3380 `d3d23f4d58a2c95c6e6598da9adf8039af78c44fbcc8ec80152cb230f9d68b58`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3381-L3401 `e3e2db9360bdcf97dbb09e67594569619df444276d9c60fbe93a345caa61311a`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3403-L3417 `fcdf3f53df5ceb226c03c9acdfba4c0b6d88a086eed2278e84a0c0fe85489b75`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3419-L3433 `42792c2dba213d97d2d7df501b969c2048d655e37cbe93d17e189970e8b133b6`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3435-L3439 `348cf730c14ba777223e06c02bf44c01a2516eb761b2075b660c8dc3204a9baf`
- [044 - PlanUnits](044-planunits.md) L3441-L21834 `1baf19b44b6d14be4faa94b2d8e7f32b83187d0181b69a6debf59321765780a7`
- [045 - Migration Coverage](045-migration-coverage.md) L21836-L21866 `5a65e26405e18053064b08984231933c0d0d540d3c0b4ab1d6f69c2327a6cccb`
- [046 - Ledger Compile Addendum - pldg-20260614-001](046-ledger-compile-addendum-pldg-20260614-001.md) L21868-L21956 `7b5f8c56a2a5a51661efa93afddca27d663a817a712f2b25129a8b6bf3c23ab4`
- [047 - Ledger Compile Addendum - pldg-20260615-001](047-ledger-compile-addendum-pldg-20260615-001.md) L21958-L22055 `99908269d22f311fd30faf7222c37b1acfccc6aa6cbba50c10d33d6d7e4527a4`
- [048 - Ledger Compile Addendum - pldg-20260616-001](048-ledger-compile-addendum-pldg-20260616-001.md) L22057-L22369 `cb0335596f01bfcbe3177f2afe9128adfb920d98b4b1f9a315338a59786dba42`
- [049 - Ledger Compile Addendum - pldg-20260616-002](049-ledger-compile-addendum-pldg-20260616-002.md) L22371-L22438 `30bbf4d8d1a196cf64f8a3680d476a50a0c17c5959e8ad86fae10ba464c974fa`
- [050 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](050-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L22441-L22529 `4e4e23e1da52002c41622bf9b30a708b57c483cfc31dcd07d3b7c64268d6cee8`
- [051 - Ledger Compile Addendum - pldg-20260622-001-fff](051-ledger-compile-addendum-pldg-20260622-001-fff.md) L22531-L22615 `45588d13cfd3ace244fcc4bf73c57334698ecdb6f8b53f9c42c065b78b747eb1`
- [052 - Ledger Compile Addendum - pldg-20260626-001-feature-name](052-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L22618-L22992 `cc5b6a9d36acce238091bf9157bbb4321e56e61ffcd4ca46f553f809d87ed71a`
- [053 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](053-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L22994-L23205 `c54bee6cc7325372dd1f5593634a60a92824e3d63bc46a263c541e4e1dd90596`
- [054 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](054-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23207-L23286 `03a07aa6608e1785a0511b2c7ca09ea71591f42c5fae8930454ac81294122c1a`
